/**
 * Module dependencies.
 */
 process.env.NODE_ENV = 'test';
var should = require('should'),
    app = require('../../server'),
    mongoose = require('mongoose');
    

//The tests
describe('Model', function() {

    it('Connection should be ok', function(done){
        should.exist(mongoose.connection.db);
        done();
    });

    describe('User', function() {
        
        var User = mongoose.model('User');
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

    describe('Product', function(){

        var Product= mongoose.model('Product');
        var product={
            number:'MT-101'
        }
        before(function(done){
            product = new Product(product);
            done();
        })

        it('should be saved successfull', function(done){
            product.save(function(err){
                should.not.exist(err);
                done();
            })
        })

        it('should not be saved when number property already exist in anthor product', function(done){
            var product = new Product({
                number:'MT-101'
            });

            product.save(function(err) {
                should.exist(err);
                done();
            })
        })

        it('should be readed successfull', function(done){
            Product.findOne({number:'MT-101'},function(err,doc){
                should.not.exist(err);
                should.exist(doc.uid);
                doc.number.should.equal('MT-101');
                done()
            })
        })

        it('should throw a error when field type not match', function(done){
            product.property={
                default:{
                    length:'aaa'
                }
            }
            
            product.save(function(err,doc){
                should.exist(err);
                done()
            })
        })

        it('should have correct result in MapReduce for product.property', function(done){
            var i=0;
            function callback(){
                i--;
                if(i==0){
                    Product.getProperty(function(err,docs){
                        try{
                            should.not.exist(err);
                            docs.should.be.an.instanceOf(Array);
                            should.equal(docs[0]._id,'fifth');
                            should.equal(docs[0].value,20);
                            should.equal(docs[1]._id,'twice');
                            should.equal(docs[1].value,50);
                        }catch(e){
                            done(e);
                            return;
                        }
                        done();
                        
                    })
                }
            }
            for(;i<100;i++){
                var property={custom:[]};
                if(!(i%2)){
                    property.custom.push({
                        name:'twice',
                        value:1
                    })
                
                }
                if(!(i%5)){
                    property.custom.push({
                        name:'fifth',
                        value:1
                    })
                }
                var product=new Product({
                    number:'testGetProperty-'+i,
                    property:property
                })

                product.save(function(err){
                    should.not.exist(err);
                    callback();
                })
            }
        })

        after(function(done){
            Product.remove({},function(err){
                should.not.exist(err);
                done();
            })
        })    
    })
});
