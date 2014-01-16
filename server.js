var http = require('http');
var port = 18080;
http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<h1>Node.js</h1>');
    res.write(JSON.stringify(process.env));
    res.end('<p>Hello World</p>');
}).listen(port);
