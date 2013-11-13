process.env.NODE_ENV = 'test';
var 
  should = require('should'),
  app=require('../../server'),
  request=require('supertest'),
  mongoose = require('mongoose'),
  User = require('../../app/models/user'),
  Product = require('../../app/models/product');
var authCookie='';
function ajax(method,url){
  var req=request(app)[method](url)
    .set('Accept','application/json');
  if(authCookie){
    req=req.set('Cookie',authCookie)
  }
  return req;
}
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
    var user={
      account: 'user',
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

    it ('should login successful with account and password', function(done){
      ajax('post','/user/signin')
        .send({account:user.account, password: user.password})
        .expect(200,function(err,res){
          should.not.exist(err);
          should.exist(res.body.account);
          res.body.account.should.equal(user.account);
          authCookie=res.header['set-cookie'][0].match(/connect.sid[^;]*/);
          done();
        })
    })

    it ('should signup with a account and password', function(done) {
      ajax('put','/user/signup')
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

  describe('Product', function(){
    var product1={
      number:'MT-111'
    };

    var product2={
      number:'MT-222'
    };

    it('should save successful', function(done){
      ajax('put','/products')
        .send(product1)
        .expect(200,function(err,res){
          should.not.exist(err);
          should.exist(res.body.uid);
          product1.number.should.equal(res.body.number);
          done();
        })
    })

    it('should save anthor product successful', function(done){
      ajax('put','/products')
        .send(product2)
        .expect(200,function(err,res){
          should.not.exist(err);
          should.exist(res.body.uid);
          product2.number.should.equal(res.body.number);
          done();
        })
    })

    it('should list all the products', function(done){
      ajax('get','/products')
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

    it('can search the product with a number', function(done){
      ajax('get','/products?number='+product1.number)
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

    it('should return query result paged', function(done){
      var i=0;

      function callback(err,res){
        i--;
        should.not.exist(err);
        if(i==0){
          ajax('get','/products')
            .send()
            .expect('Page-Count','2')
            .expect('Page-Step','20')
            .expect('Page-Number','1')
            .expect(200,function(err,res){
              should.not.exist(err);

              request(app)
                .get('/products/page/2')
                .set('Accept','application/json')
                .set('Cookie',authCookie)
                .send()
                .expect('Page-Count','2')
                .expect('Page-Step','20')
                .expect('Page-Number','2')
                .expect(200,function(err,res){
                  should.not.exist(err);
                  done();
                })
            })
        }
      }
      for(;i<21;i++){
        ajax('put','/products')
          .send({
            number:'testPage-'+i
          })
          .expect(200,callback)
      }
    })

    it('should return correct products schema', function(done){
      ajax('get','/products/schema')
        .expect(200,function(err,res){
          should.not.exist(err);
          res.body.should.have.property('created');
          done();
        })
    })

    it('should return model schema when request to /products/schema', function(done){
      var schema=Product.getSchema();
      ajax('get','/products/schema')
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
      this.timeout(60000);
      var i=0;
      function callback(err){
        i--;
        should.not.exist(err);
        if(i==0){
          ajax('get','/products/catalog')
            .expect(200, function(err,res) {
              var catalogs=res.body;
              catalogs.should.be.an.instanceOf(Array);
              catalogs.should.includeEql({catalog:'aaa',count:6})
              catalogs.should.includeEql({catalog:'bbb',count:7})
              done();
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
        
        Product.checkAndSave(product,function(err,doc){
          should.not.exist(err);
          callback();
        })
      }
      
      
    })

    after(function(done){
      Product.remove({},function(){
        done();
      });
    })
  })
})
