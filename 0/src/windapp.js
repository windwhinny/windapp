/*
 * BAE Node.js application demo
 */
/* Port which provided by BAE platform */
var port = process.env.APP_PORT;

/*
 * Create an HTTP server
 * which is as similar as http://nodejs.org/api/http.html mentioned
 */

var express = require('express');
var app=express();

app.get('/hello.txt',function(req,res){
  var body='hello world';
  res.setHeader('Content-Type','text/plain');
  res.setHeader('Content-Length',body.length);
  res.end(body);
}

app.listen(port);
