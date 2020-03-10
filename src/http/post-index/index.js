let arc = require('@architect/functions');
let parseBody = arc.http.helpers.bodyParser;

exports.handler = async function http(req) {
	let body = parseBody(req);
	let text = `END ${body.text}!`;
	return {
		headers: {'Content-Type': 'text/plain; charset=utf8'},
		body: text,
	}
};