var mongoose = require('mongoose'),
	config = require('./config');
	
//Bootstrap db connection

module.exports = function(cb){
	if(typeof(config.db)=='string'){
		mongoose.connect(config.db);
		mongoose.connection.on('error', cb);
  		mongoose.connection.on('open',cb);
	}else{
		var db=config.db
		mongoose.connection.open(
			db.url,
			db.database,
			db.port,
			db.options,
			cb);
	}
} 
