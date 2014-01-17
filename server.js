/**
 * Module dependencies.
 */
console.error(1);
var express = require('express'),
    fs = require('fs'),
    passport = require('passport'),
    path=require('path');

console.error(2);
config = require('./config/config.js');
 

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

var auth = require(config.root+'/config/middlewares/authorization'),
    mongoose = require('mongoose'),
    database = require(config.root+'/config/database'),
    app = express();
console.error(3);
function runServer(){
	//Bootstrap models
  console.error(6);
	var models_path = config.root + '/app/models';
	fs.readdirSync(models_path).forEach(function(file) {
    console.error(7);
      if(file.match(/^\..*/)){
        return;
      }
	    require(models_path + '/' + file);
	});
  console.error(8);
	//Bootstrap passport config
	require(config.root+'/config/passport')(passport, config);
console.error(9);
	//Express settings
	require(config.root+'/config/express')(app, config, passport);
	//Bootstrap routes
 console.error(10);
	require(config.root+'/config/routes')(app, passport, auth);
	//Start the app by listening on <port>
console.error(11);
	app.listen(config.port);
	console.log('Express app started on port ' + config.port);

}

//首先链接数据库，然后运行服务器
database(function(err){
	if(err){
    console.error(4);
		console.error(err.message,err.stack);
	}else{
    console.error(5);
		runServer()
	}
})

exports = module.exports = app;
