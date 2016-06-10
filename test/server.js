var http = require('http')
var dispatcher = require('httpdispatcher')
const PORT = 3333

var server = http.createServer(handleRequest)

function handleRequest(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', '*');
	if ( req.method === 'OPTIONS' ) {
		res.writeHead(200);
		res.end();
		return;
	}
  try {
    dispatcher.dispatch(req, res)
  } catch(e) {
    console.log("Error:", e)
  }
}

dispatcher.onGet('/get/x', (req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'})
  res.end(req.url)
})

dispatcher.onPost('/post/y', (req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'})
  res.end(req.body)
})

server.listen(PORT, function(){
  console.log("Server listening on: http://localhost:%s", PORT);
})
