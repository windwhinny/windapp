var mongoose = require('mongoose'),
	config = require('./config');
	
//Bootstrap db connection

module.exports = function(cb){
	mongoose.connect(config.db);
	mongoose.connection.on('error', cb);
} 