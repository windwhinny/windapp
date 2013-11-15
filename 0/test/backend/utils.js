process.env.NODE_ENV = 'test';
var app=require('../../server'),
  request=require('supertest'),
  mongoose = require('mongoose'),
  User = require('../../app/models/user'),
  Product = require('../../app/models/product'),
  should = require('should'),
  user={
    account: 'user2',
    password: 'password'
  },
  authCookie=null;

var utils={
  login:function(done){
    var u=new User(user);
    u.save(function(err){
      if(err)return done(err);
      utils.ajax('post','/user/signin',true,function(req){
        req
          .send(user)
          .expect(200,function(err,res){
            if(err)return done(err);
            authCookie=res.header['set-cookie'][0].match(/connect.sid[^;]*/);
            done();
          })
      })
    });
  },
  clean:function(){
    autoCookie=null; 
    User.remove({});
    Product.remove({});
  },
  ajax:function(method,url,noauth,done){
    function _ajax(){
      var req=request(app)[method](url)
        .set('Accept','application/json')
        .set('Cookie',authCookie);
      done(req);
    }
    if(typeof(noauth)=='function'){
      var d=done;
      done=noauth;
      noauth=d;
    }
    if(!noauth&&!authCookie){
      utils.login(function(err){
        should.not.exist(err);
        _ajax();
      })
    }else{
      _ajax()
    }
  }
}
module.exports=exports=utils;
