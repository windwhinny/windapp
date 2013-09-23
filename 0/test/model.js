/**
 * Module dependencies.
 */
 process.env.NODE_ENV = 'test';
var should = require('should'),
    app = require('../server'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');

//The tests
describe('Model', function() {

    it('Connection should be ok', function(done){
        should.exist(mongoose.connection.db);
        done();
    });

    describe('User', function() {
        var user;

        before(function(done) {
            User.remove({},function(err) {
                should.not.exist(err);
                user = new User({
                    account: 'user',
                    password: 'password'
                });
                done();
            });
        });

        describe('Method Save', function() {
            it('should be able to save whithout problems', function(done) {
                return user.save(function(err) {
                    should.not.exist(err);
                    done();
                });
            });

            it ('should not save same account for twice', function(done) {
                var user = new User({
                    account: 'user',
                    password: 'password'
                });
                
                return user.save(function(err) {
                    should.exist(err);
                    err.code.should.equal(11000);
                    done();
                });
            })
        });

        describe('Method Find', function(){
            it('should be able to find a user by account and delete it', function(done){
                User.findOneAndRemove({
                    account:user.account
                }, function(err,user){
                    should.not.exist(err);
                    should.exist(user);
                    done();
                })
            })
        });

        after(function(done) {
                done();
        });
    });
});
