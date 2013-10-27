var mongoose = require('mongoose'),
	config = require('./config');
	
//Bootstrap db connection

module.exports = function(cb){
	console.log('connectting to '+config.db);
	mongoose.connect(config.db);
	mongoose.connection.on('error', cb);
  	mongoose.connection.on('connected',cb);
} 