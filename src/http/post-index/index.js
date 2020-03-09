

exports.handler = async function http (req) {
  return {
    statusCode: 200,
    headers: {'content-type': 'text/plain'},
    body: 'END JAMBO!'
  }
}