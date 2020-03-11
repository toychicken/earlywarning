let arc = require('@architect/functions');
let data = require('@begin/data');
let parseBody = arc.http.helpers.bodyParser;

const symptoms = ['fever', 'muscle', 'cough', 'breath'];
const symptomEnumerator = (inp, details) => {
	// split the input to see which items have been remarked

	// split the input

	let arr = `${details.symptomsEnum}`.split('');
	if(details.systemCode === false || arr.length < 1) { return 'idType'}
	let ind = arr.pop();
	let nextSymptom = symptoms[ind-1] || 'idType';
	console.log('nextSymptom', nextSymptom);
	details.symptomsEnum = arr.join('');
	if(details.symptomsEnum === '') {details.symptomsEnum = false;}
	return nextSymptom;
};

const getLastResponse = (arr) => {
	return arr[arr.length -1];
};
const idSelector = (inp, details) => {
	if(inp.pop() === '1') { return 'elephantId'}
	return 'name';
};

const responsesRequired = [
	'respondentSick',
	'symptomsEnum',
	'fever',
	'muscle',
	'cough',
	'breath',
	'idType',
	'idNumber',
	'name',
	'area'
];

const respGen = {
	respondentSick: {
		next: (inp, params) => 'symptomsEnum',
		question: `CON Who is feeling ill?
					1. Me
					2. Someone I know`,
	},
	symptomsEnum: {
		next: symptomEnumerator,
		question: `CON Do you have any of the following symptoms? 
					Enter one or any of the numbers (e.g. '134'): 
					1. Fever 
					2. Muscle pain 
					3. A cough 
					4. Difficulty when breathing`
	},
	fever: {
		next: symptomEnumerator,
		question: `CON How many days of fever?`
	},

	muscle: {
		next: symptomEnumerator,
		question: `CON How many days of muscle pain?`
	},

	cough: {
		next: symptomEnumerator,
		question: `CON How many days of coughing?`
	},

	breath: {
		next: symptomEnumerator,
		question: `CON How many days of difficulty breathing?`
	},

	idType: {
		next: idSelector,
		question: `CON Thank you. Do you have an Elephant Healthcare Passport ID? 
					1. Yes 
					2. No`
	},

	elephantId: {
		next: (inp, params) => 'name',
		question: `CON Please enter your 6 digit Elephant passport ID.`
	},

	name: {
		next: (inp, params) => 'area',
		question: `CON Please enter your full name`
	},

	area: {
		next: (inp, params) => 'goodbye',
		question: `CON To understand if you are in an area alredy affected by Corona virus please give us your local division (taarafa) or location (mtaa mdogo)`
	},
	goodbye: {
		next : (inp, params) => 'goodbye',
		question: `END Thank you for your cooperation`
	}

};


exports.handler = async function http(req) {


	/*
		Person object should look something like

		"sessionID-345678-adlkj" : {
			expected : 'respondentSick'
			respondentSick : true,
			symptomsEnum : '124',
			fever : 1,
			muscle: 2,
			cough: null,
			breath: 2,
			elephantId : '936503',
			name : 'Michael Kwiti',
			area : ''
		}
	 */

	// use the session id supplied by the USSD object - possibly some lookup with phone number?
	const {sessionId, serviceCode, phoneNumber, text} = parseBody(req);
	console.log('---------------------\nGot a request!', sessionId, serviceCode, phoneNumber, text);

	let details;
	let inputArray = text.split('*');

	let user = await data.get({
		table: 'users',
		key: sessionId
	});

	// check to see if session already exists, otherwise create one


	if (user) {
		console.log('There is a user', user);
		details = user.details;

	} else {
		console.log('There is no user');
		details = {
			display: 'respondentSick',
			awaitingResponse: false,
			respondentSick: null,
			symptomsEnum: null,
			fever: null,
			muscle: null,
			cough: null,
			breath: null,
			idType: null,
			idNumber: null,
			name: null,
			area: null
		};
	}


	// get the response from the user, and put it in appropriate node
	let lastResponse = getLastResponse(inputArray);
	let key = details.awaitingResponse;

	console.log('The key is', key, 'and will get', lastResponse || 'empty');

	if(key !== false) {

		// update details with response from user
		details[key] = lastResponse || null;
		console.log('The last thing you said was', lastResponse, 'into', key);

		// update details and save what's expected next
		let nextExpected = respGen[details.display].next(inputArray, details);
		details.display = nextExpected;
		console.log('Next expected is', nextExpected);

		// set awaiting to key
		details.awaitingResponse = `${details.display}`;
		console.log('Now waiting for', details.awaitingResponse);


	} else {

		// set awaiting to key
		details.awaitingResponse = `${details.display}`;
		console.log('START Now waiting for', details.awaitingResponse);

	}



	// save updated details
	console.log('Details to save are', JSON.stringify(details));
	await data.set({
		table: 'users',
		key: sessionId,
		details : details
	});



	console.log('--------------------');

	return {
		headers: {'Content-Type': 'text/plain'},
		body: respGen[details.display].question,
	};

};