var mongoose = require('mongoose'),
	config = require('./config');
	
//Bootstrap db connection

module.exports = mongoose.connect(config.db);