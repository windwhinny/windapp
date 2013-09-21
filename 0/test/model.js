/**
 * Module dependencies.
 */
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
            user = new User({
                name: 'Full name',
                email: 'test@test.com',
                username: 'user',
                password: 'password'
            });

            done();
        });

        describe('Method Save', function() {
            it('should be able to save whithout problems', function(done) {
                return user.save(function(err) {
                    should.not.exist(err);
                    done();
                });
            });


            it('should be able to show an error when try to save witout name', function(done) {
                user.name = '';
                return user.save(function(err) {
                    should.exist(err);
                    done();
                })
            });
        });

        describe('Method Find', function(){
            it('should be able to find a user by email and delete it', function(done){
                User.findOneAndRemove({
                    email:user.email
                }, function(err,user){
                    should.not.exist(err);
                    user.should.exist;
                    done();
                })
            })
        });

        after(function(done) {
                done();
        });
    });
});
