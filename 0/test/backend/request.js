process.env.NODE_ENV = 'test';
var 
	should = require('should'),
	app=require('../../server'),
	request=require('supertest'),
	mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Product = mongoose.model('Product');

describe('Request', function(){
	describe('Response from "/"', function(){
		it('should be html', function(done){
			request(app)
				.get('/')
				.expect('Content-Type', /html/)
				.expect(200,done);
		});
	})

	describe ('Auth method', function(){
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

    describe('Product', function(){
        var product1={
            number:'MT-111'
        };

        var product2={
            number:'MT-222'
        };

        it('should save successful', function(done){
            request(app)
                .put('/products')
                .send(product1)
                .set('Accept','application/json')
                .expect(200,function(err,res){
                    should.not.exist(err);
                    should.exist(res.body.uid);
                    product1.number.should.equal(res.body.number);
                    done();
                })
        })

        it('should save anthor product successful', function(done){
            request(app)
                .put('/products')
                .send(product2)
                .set('Accept','application/json')
                .expect(200,function(err,res){
                    should.not.exist(err);
                    should.exist(res.body.uid);
                    product2.number.should.equal(res.body.number);
                    done();
                })
        })

        it('should list all the products', function(done){
            request(app)
                .get('/products')
                .send()
                .set('Accept','application/json')
                .expect(200, function(err,res){
                    var products=res.body;
                    should.not.exist(err);

                    products.should.be.an.instanceOf(Array);
                    products.length.should.equal(2);

                    var p1=products[0];
                    var p2= products[1];

                    p1.should.have.property('number');
                    p1.number.should.equal(product1.number);

                    p2.should.have.property('number');
                    p2.number.should.equal(product2.number);

                    done();

                })
        })

        it('can search the product with a number', function(done){
            request(app)
                .get('/products?number='+product1.number)
                .send()
                .set('Accept','application/json')
                .expect(200, function(err,res){
                    var products=res.body;
                    should.not.exist(err);

                    products.should.be.an.instanceOf(Array);
                    products.length.should.equal(1);

                    var p1=products[0];

                    p1.should.have.property('number');
                    p1.number.should.equal(product1.number);

                    done();

                })
        })

        it('should return query result paged', function(done){
            var i=0;

            function callback(err,res){
                i--;
                should.not.exist(err);
                if(i==0){
                    request(app)
                        .get('/products')
                        .set('Accept','application/json')
                        .send()
                        .expect('Page-Count','5')
                        .expect('Page-Step','20')
                        .expect('Page-Number','1')
                        .expect(200,function(err,res){
                            should.not.exist(err);

                            request(app)
                                .get('/products/page/4')
                                .set('Accept','application/json')
                                .send()
                                .expect('Page-Count','5')
                                .expect('Page-Step','20')
                                .expect('Page-Number','4')
                                .expect(200,function(err,res){
                                    should.not.exist(err);
                                    done();
                                })

                        })

                    
                }
            }
            for(;i<98;i++){
                request(app)
                    .put('/products')
                    .set('Accept','application/json')
                    .send({
                        number:'testPage-'+i
                    })
                    .expect(200,callback)
            }
        })

        it('should return correct products schema', function(done){
            request(app)
                .get('/products/schema')
                .set('Accept','application/json')
                .expect(200,function(err,res){
                    should.not.exist(err);
                    res.body.should.have.property('created');
                    done();
                })
        })

        it('should return model schema when request to /products/schema', function(done){
            var schema=Product.getSchema();
            request(app)
                .get('/products/schema')
                .set('Accept','application/json')
                .expect(200,function(err,res){
                    should.not.exist(err);
                    var property="";
                    for(property in schema){
                        res.body.should.have.property(property);
                    }
                    done();
                })
        })

        it('should return catalogs in group', function(done){
            var i=0;
            function callback(err){
                i--;
                should.not.exist(err);
                if(i==0){
                    request(app)
                        .get('/products/catalog')
                        .set('Accept', 'application/json')
                        .expect(200, function(err,res) {
                            var catalogs=res.body;
                            catalogs.should.be.an.instanceOf(Array);
                            should.exist(catalogs[0]);
                            should.exist(catalogs[0].catalog);
                            should.exist(catalogs[0].count);
                            catalogs[0].catalog.should.equal('aaa');
                            catalogs[0].count.should.equal(20);

                            should.exist(catalogs[1]);
                            should.exist(catalogs[1].catalog);
                            should.exist(catalogs[1].count);
                            catalogs[1].catalog.should.equal('bbb');
                            catalogs[1].count.should.equal(12);

                            done();
                        })
                }
            }
            for (i=0;i<100;i++) {
                var product=new Product({
                    number:'testCatalog-'+i,
                });

                if(!(i%5)){
                    product.catalog='aaa';
                }else if(!(i%7)) {
                    product.catalog='bbb';
                };

                product.save(callback)
            }
        })

        after(function(done){
            Product.remove({},function(){
                done();
            });
        })
    })
})