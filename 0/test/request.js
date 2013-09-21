var 
	app=require('../server'),
	request=require('supertest');

describe('Request', function(){
	describe('Response from "/"', function(){
		it('should be html', function(done){
			request(app)
				.get('/')
				.expect('Content-Type', /html/)
				.expect(200,done);
		})
	})
})