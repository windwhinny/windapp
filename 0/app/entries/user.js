var Entry = require('./entry'),
	mongoose = require('mongoose'),
	User = require('../models/user'),
	userEntry = new Entry('User'),
	Errors = require('../errors'),
  passport=null;


userEntry.handlers={
  signin:{
   method:'post',
   url:'/signin',
   type:'json',
   noAuth:true,
   main:function(req,res,done){
      passport.authenticate('local',{
        badRequestMessage:'Account and Password cannot be blank'
        },function(err, user, info) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(new Errors.BadRequest(info));
        }
        req.login(user, function(err) {
            done(err,user);
            return;
        });
      })(req);
   }
  },
  signup:{
    method:'put',
    type:'json',
    url:'/signup',
    main:function(req,res,done){
      var user = new User(req.body);
	    user.provider = 'local';
	    user.save(function(err) {
        if (err) return done(err);
        req.logIn(user, function(err) {
          done(err,user);
        });
	    })
    }
  },
  signout:{
    method:'post',
    type:'json',
    url:'/signout',
    main:function(req,res,done){
      	req.logout();
				done(null,{});
    }
  }
}
module.exports = function(url,app,ps){
	if(!ps){
   throw new Error('passport must be set'); 
   return;
  }
	passport=ps;
	userEntry.rootUrl=url;
	userEntry.init(app);
};
