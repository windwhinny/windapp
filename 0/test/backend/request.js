process.env.NODE_ENV = 'test';
var 
  should = require('should'),
  app=require('../../server'),
  request=require('supertest'),
  mongoose = require('mongoose'),
  User = require('../../app/models/user'),
  Product = require('../../app/models/product'),
  utils=require('./utils');

describe('Request for user', function(){
  describe('Response from "/"', function(){
    it('should be html', function(done){
      request(app)
        .get('/')
        .expect('Content-Type', /html/)
        .expect(200,done);
    });
  })

  describe ('Auth method', function(){
    var user={
      account: 'user1',
      password: 'password'
    };
    var user1={
      account:'wind',
      password:'wind'
    }
    //register a new User first
    before(function(done) {
      User.remove({},function(err) {
        should.not.exist(err);
        var u=new User(user);
        u.save(done);
      });
    });
    it('should not signup without authed',function(done) {
      utils.ajax('put','/user/signup',true,function(req){
        req
          .send(user1)
          .expect('Content-Type', /json/)
          .expect(401,function(err,res) {
            res.body.should.include({message:'not authorized'});
            done();
          });
      })
    })

    it ('should login successful with account and password', function(done){
      utils.ajax('post','/user/signin',true,function(req){
        req
          .send(user)
          .expect(200,function(err,res){
            should.not.exist(err);
            should.exist(res.body.account);
            res.body.account.should.equal(user.account);
            done();
          })
      })
    })

    it ('should signup with a account and password', function(done) {
      utils.ajax('put','/user/signup',function(req){
        req 
          .send(user1)
          .expect('Content-Type', /json/)
          .expect(200,function(err,res) {
            should.not.exist(err);
            should.exist(res.body.account);
            res.body.account.should.equal(user1.account);
            done();
          });
      })
    })

    after(function(done){
      utils.clean();
      done();
    })
  })
})
