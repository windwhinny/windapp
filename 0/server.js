/**
 * Module dependencies.
 */
 
var express = require('express'),
    fs = require('fs'),
    passport = require('passport'),
    path=require('path'),
    logger = require('mean-logger');

if (process.env.BAE_ENV_APPID) {
 	config = require('./config/config.js');
 }else{
 	config = require('./config/config.js');
 }

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

//Load configurations
//if test env, load example file
var auth = require(config.root+'/config/middlewares/authorization'),
    mongoose = require('mongoose'),
    database = require(config.root+'/config/database');

function runServer(){
  console.log('Running server');
	//Bootstrap models
  var i=0;
	var models_path = config.root + '/app/models';
	fs.readdirSync(models_path).forEach(function(file) {
	    require(models_path + '/' + file);
	});
  console.log(1++);
	//bootstrap passport config
	require(config.root+'/config/passport')(passport, config);
	var app = express();
	//express settings
  console.log(1++);
	require(config.root+'/config/express')(app, config, passport);
	//Bootstrap routes
  console.log(1++);
	require(config.root+'/config/routes')(app, passport, auth);
	//Start the app by listening on <port>
  console.log(1++);
	app.listen(config.port);
  console.log(1++);
	console.log('Express app started on port ' + config.port);
	//Initializing logger 
  console.log(1++);
	logger.init(app, passport, mongoose);
  console.log(1++);
	//expose app
	exports = module.exports = app;
	
}

database(function(err){
	if(err){
		console.error(err.message,err.stack);
	}else{
		runServer()
	}
})