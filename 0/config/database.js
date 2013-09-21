var mongoose = require('mongoose'),
	config = require('./config');
	
//Bootstrap db connection
var db = mongoose.connect(config.db);
module.exports = db;