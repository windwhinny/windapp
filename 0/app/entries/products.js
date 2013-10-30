var Entry = require('./entry'),
	mongoose = require('mongoose'),
	Product = mongoose.model('Product'),
  imageBrucket = require('../imageBrucket.js'),
	productsEntry = new Entry('Product'),
  base64 = require('Base64'),
	Errors = require('../errors');

function handleError(err,done){
	err.status=500;
	done(err)
}
function requireUid(req,done){
	var uid=null;
	var container='';
	uid=req['params'].uid;
	if(!uid){
		uid=req['body'].uid;
	}
	if(!uid){
		var err=Errors.BadRequest('must have an id ');
		done(err);
		return false;
	}
	return uid;
}

productsEntry.handlers={
	save: {
		method:'put',
		type:'json',
		main:function(req,res,done){
			var product = new Product(req.body);
			product.user=req.user;
			product.save(done);
		},

	},
	
	delte: {
		method:'delete',
		type:'json',
		main:function(req,res,done){
			var uid=requireUid(req,done);
			if(!uid)return;

			Product.findOne({uid:uid},function(err,doc){
				if(err){
					handleError(err,done)
				}else{
					doc.remove(done);
				}
			});
			
		}
	},
	
	getSchema:{
		method:'get',
		type:'json',
		url:'/schema',
		main:function(req,res,done){
			Product.getSchema(done);
		}
	},
	getCatalogs: {
		method:'get',
		type:'json',
		url:'/catalog',
		main:function(req,res,done){
			Product.getCatalogs(done);
		}
	},
	getProperty: {
		method:'get',
		type:'json',
		url:'/property',
		main:function(req,res,done){
			var query=req.query;
			var defaultQuery={
					'property.custom':{$exists:true},
				};
			for(i in defaultQuery){
				query[i]=defaultQuery[i];
			}

			Product.getProperty(query,function(err,result){
                if(err){
                    handleError(err,done);
                }else{
                    var properties=[];
                    result.forEach(function(r){
                        properties.push({
                            name:r._id,
                            count:r.value
                        })
                    })

                    properties.sort(function(a,b){
                        return a.count<b.count;
                    })
                    done(err,properties)
                }
                
            })
		}
	},
	query:{
		method:'get',
		type:'json',
		url:['','/page/:page'],
		main:function(req,res,done){

			var page=req.params.page||1;
			var step=req.query.step||20;
			var fields=req.query.fields||"";
			var sort=req.query.sort||"uid";

			function varifyPageNumber(count,step,page){
				var pageCount=Math.ceil(count/step);
				if(page>pageCount){
					page=pageCount;
				}
				return pageCount;
			}

			Product.find(req.query).count(function(err,count){
				if(err){
					handleError(err,done);
				}else{
					var pageCount=varifyPageNumber(count,step,page);

					var query=Product.find(req.query,fields,{
						skip:(page-1)*step,	
					}).sort(sort).limit(step);

					query.exec(function(err,docs){
						if(err){
							handleError(err,done);
						}else{
							res.header('Page-Count',pageCount);
							res.header('Items-Count',count);
							res.header('Page-Number',page);
							res.header('Page-Step',step);
							done(null,docs);
						}
					})
				}
			});
		}
	},
  getImageHost:{
    method:'get',
    type:'json',
    url:'/imageHost',
    main:function(req,res,done){
      done(null,{host:config.imageHost});
    }
  },
  getImageUploadToken:{
    method:'get',
    type:'json',
      url:'/:uid/image/token',
    main:function(req,res,done){
      var uid=requireUid(req,done);
      var host=req.query.host;
      if(!host){done();return;}
      if(!uid)return;
      done(null,{
        token:imageBrucket.token(host,uid)
      });
    }
  },
  imageUploadCallback:{
    method:'post',
    type:'.*',
      url:'/:uid/image',
    main:function(req,res,done){
      var uid=requireUid(req,done);
      var image=req.body;
      if(image){
        //BUG
        for(i in image){
          image=JSON.parse(i);
        }
        if(!uid){
          imageBrucket.remove( image.name, function(err, ret) {
            if (!err) {
              return;
            } else {
              console.log(image.name,err);
            }
          })
          return;
        }
        
        Product.addImage(uid,image,function(err,doc){
          done(err,doc); 
        })
      }else{
        done();
      }
    },
    html:function(result,req,res){
      res.end(JSON.stringify(result));      
    }
  },
	get:{
		method:'get',
		type:'json',
		url:'/:uid',
		main:function(req,res,done){
			var uid=requireUid(req,done);
			if(!uid)return;
			Product.findOne({uid:uid},function(err,doc){
				if(!doc){
					var err = Errors.NotFound('product not found by id '+uid);
					done(err,doc);
				}else{
					done(err,doc)
				}
			});
		}
	},
	update: {
		method:'post',
		type:'json',
		url:'/:uid',
		main:function(req,res,done){
			var uid=requireUid(req,done);
			if(!uid)return;
			Product.updateAndClean(uid,req.body,done);
		}
	},
}

module.exports = function(url,app){
	productsEntry.rootUrl=url;
	productsEntry.init(app);
};