var mongoose = require('mongoose'),
	config = require('./config');
	
//Bootstrap db connection

module.exports = function(env){
    return mongoose.connect(config[env].db);
};