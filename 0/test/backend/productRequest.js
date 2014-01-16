process.env.NODE_ENV='test';
var should=require('should'),
  app=require('../../server'),
  Product = require('../../app/models/product'),
  utils=require('../utils'),
  config=require('../../config/config');
describe('Request for product', function(){
  var product1={
    number:'MT-111'
  };

  var product2={
    number:'MT-222'
  };

  it('should save successful', function(done){
    utils.ajax('put','/products',function(req){
      req
        .send(product1)
        .expect(200,function(err,res){
          should.not.exist(err);
          should.exist(res.body.uid);
          product1.number.should.equal(res.body.number);
          done();
        })
    })
  })

  it('should save anthor product successful', function(done){
    utils.ajax('put','/products',function(req){
      req
        .send(product2)
        .expect(200,function(err,res){
          should.not.exist(err);
          should.exist(res.body.uid);
          product2.number.should.equal(res.body.number);
          done();
        })
    })
  })

  it('should list all the products', function(done){
    utils.ajax('get','/products',function(req){
      req
        .send()
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
  })

  it('can search the product with a number', function(done){
    utils.ajax('get','/products?number='+product1.number,function(req){
      req
        .send()
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
  })

  it('should return query result paged', function(done){
    var i=0;

    function callback(err,res){
      i--;
      should.not.exist(err);
      if(i==0){
        utils.ajax('get','/products',function(req){
          req
            .send()
            .expect('Page-Count','2')
            .expect('Page-Step','20')
            .expect('Page-Number','1')
            .expect(200,function(err,res){
              should.not.exist(err);
              
              utils.ajax('get','/products/page/2',function(req){
                req
                  .send()
                  .expect('Page-Count','2')
                  .expect('Page-Step','20')
                  .expect('Page-Number','2')
                  .expect(200,function(err,res){
                    should.not.exist(err);
                    done();
                  })  
              })
            })
        })
      }
    }
    for(;i<21;i++){
      (function(i){
      utils.ajax('put','/products',function(req){
        req
          .send({
            number:'testPage-'+i
          })
          .expect(200,callback)
      })})(i);
    }
  })

  it('should return correct products schema', function(done){
    utils.ajax('get','/products/schema',function(req){
      req
        .expect(200,function(err,res){
          should.not.exist(err);
          res.body.should.have.property('created');
          done();
        })
    })
  })

  it('should return model schema when request to /products/schema', function(done){
    var schema=Product.getSchema();
    utils.ajax('get','/products/schema',function(req){
      req
        .expect(200,function(err,res){
          should.not.exist(err);
          var property="";
          for(property in schema){
            res.body.should.have.property(property);
          }
          done();
        })
    })
  })

  it('should return catalogs in group', function(done){
    var i=0;
    function callback(err){
      i--;
      should.not.exist(err);
      if(i==0){
        utils.ajax('get','/products/catalog',function(req){
          req
            .expect(200, function(err,res) {
              var catalogs=res.body;
              catalogs.should.be.an.instanceOf(Array);
              catalogs.should.includeEql({catalog:'aaa',count:6})
              catalogs.should.includeEql({catalog:'bbb',count:7})
              done();
            })
        })
      }
    }
    for (i=0;i<20;i++) {
      var product={
        number:'testCatalog-'+i,
      };

      if(!(i%2)){
        product.catalog='aaa';
      }
      if(!(i%3)) {
        product.catalog='bbb';
      };
       
     (new Product(product)).checkAndSave(function(err,doc){
        should.not.exist(err);
        callback();
      })
    }
  })
  
  it('should return right url when call /products/imageHost',function(done){
    utils.ajax('get','/products/imageHost',function(req){
      req
        .expect(200,function(err,res){
          should.not.exist(err);
          res.body.should.eql({
            host:config.imageHost
          })
          done(err);
        })
    })
  })

  it('should return right image upload token', function(done){
    utils.ajax('get','/products/111/image/token',function(req){
      req
        .query({host:'http://localhost'})
        .expect(200,function(err,res){
          should.not.exist(err);
          res.body.should.have.property('token');
          done();
        })
    });
  })

  it('should return components',function(done){
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
          utils.ajax('get','/products/'+main.uid+'/components',function(req){
            req
              .send()
              .expect(200,function(err,res){
                should.not.exist(err);
                res.body.forEach(function(doc,i){
                  doc.uid.should.eql(components[i].uid);
                })
                done();
              })
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
    utils.clean();
    done();
  })
})
