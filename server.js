/**
 * Module dependencies.
 */
console.error(1111111111111)
var express = require('express'),
    fs = require('fs'),
    passport = require('passport'),
    path=require('path');


config = require('./config/config.js');
 

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

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
	//Bootstrap passport config
	require(config.root+'/config/passport')(passport, config);

	//Express settings
	require(config.root+'/config/express')(app, config, passport);
	//Bootstrap routes
 
	require(config.root+'/config/routes')(app, passport, auth);
	//Start the app by listening on <port>

	app.listen(config.port);
	console.log('Express app started on port ' + config.port);

}

//首先链接数据库，然后运行服务器
database(function(err){
	if(err){
		console.error(err.message,err.stack);
	}else{
		runServer()
	}
})

exports = module.exports = app;
