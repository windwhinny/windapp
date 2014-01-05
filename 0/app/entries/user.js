var Entry = require('./entry'),
	mongoose = require('mongoose'),
	User = require('../models/user'),
	userEntry = new Entry('User'),
	Errors = require('../errors'),
  passport=null;


userEntry.handlers={
  /**
   * 登陆接口
   * @return {Object} 请求结果
   */
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

  /**
   * 注册接口
   * @return {Object} 注册结果
   */
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

  /**
   * 注销
   */
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

/**
 * 用户入口
 * @param {String} url 入口的根地址
 * @param {Object} app Express实例
 * @param {Object} ps  Passport实例
 */
module.exports = function(url,app,ps){
	if(!ps){
   throw new Error('passport must be set'); 
   return;
  }
	passport=ps;
	userEntry.rootUrl=url;
	userEntry.init(app);
};
