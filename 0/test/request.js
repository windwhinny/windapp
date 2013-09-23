process.env.NODE_ENV = 'test';
var 
	should = require('should'),
	app=require('../server'),
	request=require('supertest'),
	mongoose = require('mongoose'),
    User = mongoose.model('User');

describe('Request', function(){
	describe('Response from "/"', function(){
		it('should be html', function(done){
			request(app)
				.get('/')
				.expect('Content-Type', /html/)
				.expect(200,done);
		});
	})

	describe ('Auth method', function(done){
		var user=null;

		//register a new User first

		before(function(done) {
            User.remove({},function(err) {
                should.not.exist(err);
                user = {
                    account: 'user',
                    password: 'password'
                };
                done();
            });
        });

        it ('should signup with a account and password', function(done) {
            request(app)
                .put('/signup')
                .send({account:user.account, password: user.password})
                .set('Accept','application/json')
                .expect('content-type', /json/)
                .expect(200,function(err,res) {
                    should.not.exist(err);
                    should.exist(res.body.account);
                    res.body.account.should.equal(user.account);
                    done();
                });
        })

        it ('should login successful with account and password', function(done){
        	request(app)
        		.post('/signin')
        		.send({account:user.account, password: user.password})
        		.set('Accept','application/json')
        		.expect('content-type', /json/)
                .expect(200,function(err,res) {
        			should.not.exist(err);
        			should.exist(res.body.account);
        			res.body.account.should.equal(user.account);
        			done();
        		});
        })
	})
})