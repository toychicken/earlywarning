exports.handler = async function http() {
	return {
		headers: {'Content-Type': 'text/html; charset=utf8'},
		body: 'Hey there!',
	}
};