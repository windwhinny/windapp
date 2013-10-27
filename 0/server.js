// /**
//  * Module dependencies.
//  */
 
// var express = require('express'),
//     fs = require('fs'),
//     passport = require('passport'),
//     path=require('path'),
//     logger = require('mean-logger');

// if (process.env.BAE_ENV_APPID) {
//  	config = require('./config/config.js');
//  }else{
//  	config = require('./config/config.js');
//  }

// /**
//  * Main application entry file.
//  * Please note that the order of loading is important.
//  */

// //Load configurations
// //if test env, load example file
// var auth = require(config.root+'/config/middlewares/authorization'),
//     mongoose = require('mongoose'),
//     database = require(config.root+'/config/database');


// var serverIsRunning=false;
// function runServer(){
// 	//Bootstrap models

// 	if(serverIsRunning)return;

// 	var models_path = config.root + '/app/models';
// 	fs.readdirSync(models_path).forEach(function(file) {
// 	    require(models_path + '/' + file);
// 	});

// 	//bootstrap passport config
// 	require(config.root+'/config/passport')(passport, config);

// 	var app = express();

// 	//express settings
// 	require(config.root+'/config/express')(app, config, passport);

// 	//Bootstrap routes
// 	require(config.root+'/config/routes')(app, passport, auth);

// 	//Start the app by listening on <port>

// 	app.listen(config.port);
// 	console.log('Express app started on port ' + config.port);

// 	//Initializing logger 
// 	logger.init(app, passport, mongoose);

// 	//expose app
// 	exports = module.exports = app;

// 	serverIsRunning=true;
// }

// database(function(err){
// 	if(err){
// 		console.error(err);
// 	}else{
// 		runServer()
// 	}
// })


var http = require('http');
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
 
var port = process.env.APP_PORT;
 
// 数据库配置信息
var db_name = 'zqZCsprmOaNetxiSoMcy';                  // 数据库名，从云平台获取
var db_host =  process.env.BAE_ENV_ADDR_MONGO_IP;      // 数据库地址
var db_port =  +process.env.BAE_ENV_ADDR_MONGO_PORT;   // 数据库端口
var username = process.env.BAE_ENV_AK;                 // 用户名
var password = process.env.BAE_ENV_SK;                 // 密码
 
var db = new Db(db_name, new Server(db_host, db_port, {}), {w: 1});
 
function testMongo(req, res) {
  function test(err, collection) {
    collection.insert({a: 1}, function(err, docs) {
      if (err) {
        console.log(err);
        res.end('insert error');
        return;
      }
      collection.count(function(err, count) {
        if (err) {
          console.log(err);
          res.end('count error');
          return;
        } 
        res.end('count: ' + count + '\n');
        db.close(); 
      });
    });  
  }
 
  db.open(function(err, db) {
    db.authenticate(username, password, function(err, result) { 
      if (!result) {
        db.close();
        res.end('Authenticate failed!');
        return;   
      }
      db.collection('test_insert', test); 
    });  
  });
}
 
 
http.createServer(function(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
 
  testMongo(req, res);
}).listen(port);