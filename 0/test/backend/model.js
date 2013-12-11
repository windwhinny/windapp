/**
 * Module dependencies.
 */
 process.env.NODE_ENV = 'test';
var should = require('should'),
    app = require('../../server'),
    User = require('../../app/models/user'),
    Product = require('../../app/models/product'),
    mongoose = require('mongoose');
    

//The tests
describe('Model', function() {

    it('Connection should be ok', function(done){
      mongoose.connection.on('connected',function(){
        done()
      })
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

    describe('Product', function(){
        var product={
            number:'MT-101'
        }
        before(function(done){
            Product.remove({},function(err){
                should.not.exist(err);
                product = new Product(product);
                done();
            })
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
        
        it('should save with similar product',function(done){
          var p=new Product({catalog:'p1'});

          p.checkAndSave(function(err,doc){
            if(err)return done(err);
            should.exist(doc.uid);
            var p=new Product({similar:doc.uid});
            p.checkAndSave(function(err,doc){
              if(err)return done(err);
              doc.should.include({catalog:'p1'})
              done();
            })
          });
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
                            should.equal(docs[0].value,7);
                            should.equal(docs[1]._id,'twice');
                            should.equal(docs[1].value,10);
                        }catch(e){
                            done(e);
                            return;
                        }
                        done();
                        
                    })
                }
            }
            
            var products=[];
            for(;i<20;i++){
                var property={custom:[]};
                if(!(i%2)){
                    property.custom.push({
                        name:'twice',
                        value:1
                    })
                
                }
                if(!(i%3)){
                    property.custom.push({
                        name:'fifth',
                        value:1
                    })
                }
                var product={
                    number:'testGetProperty-'+i,
                    property:property
                };
                var p=new Product(product);
                 
                p.checkAndSave(function(err,doc){
                    should.not.exist(err);
                    callback();
                })
            }
            
        })
        
        it('should get components',function(done){
          var count=3;
          var main=new Product({number:'product-component'});
          var components=[];
          function saved(err,doc){
            should.not.exist(err);
            main.components.push({uid:doc.uid});
            components.push(doc.toObject());
            if(!(--count)){
              main.checkAndSave(function(err){
                should.not.exist(err);
                main.getComponents(function(err,docs){
                  should.not.exist(err);
                  var coms=[];
                  docs.forEach(function(doc,i){
                    doc.toObject().should.include(components[i]);
                  })
                  done();
                })
              })
            }
          }
          for(var i=0;i<count;i++){
            var p=new Product({number:'component'+i});  
            p.checkAndSave(saved);
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
