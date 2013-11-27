/**
 * Module dependencies.
 */
 
var express = require('express'),
    fs = require('fs'),
    passport = require('passport'),
    path=require('path');

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
    database = require(config.root+'/config/database'),
    app = express();

function runServer(){
	//Bootstrap models
	var models_path = config.root + '/app/models';
	fs.readdirSync(models_path).forEach(function(file) {
      if(file.match(/^\..*/)){
        return;
      }
	    require(models_path + '/' + file);
	});
	//bootstrap passport config
	require(config.root+'/config/passport')(passport, config);

	//express settings
	require(config.root+'/config/express')(app, config, passport);
	//Bootstrap routes
 
	require(config.root+'/config/routes')(app, passport, auth);
	//Start the app by listening on <port>

	app.listen(config.port);
	console.log('Express app started on port ' + config.port);

}

database(function(err){
	if(err){
		console.error(err.message,err.stack);
	}else{
		runServer()
	}
})

exports = module.exports = app;
