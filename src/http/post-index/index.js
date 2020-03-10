let arc = require('@architect/functions');
let parseBody = arc.http.helpers.bodyParser;

exports.handler = async function http(req) {




	let payload = parseBody(req);
	let text = '';

	switch (payload.text) {
		case "1":
			text = `CON Choose account information you want to view
			1. Account number
			2. Account balance`;
			break;
		case "2":
			text = `END Your phone number is ${payload.phoneNumber}`;
			break;
		case "1*1":
			text = `END Your account number is ${payload.sessionId}`;
			break;
		case "1*2":
			text = `END Your account balance is KES 10,540`
			break;
		default:
			text = `CON What would you want to check?
			1. My account
			2. My phone number`;
			break;
	}


	return {
		headers: {'Content-Type': 'text/plain; charset=utf8'},
		body: text,
	}
};