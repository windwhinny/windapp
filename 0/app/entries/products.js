var Entry = require('./entry'),
	mongoose = require('mongoose'),
	Product = require('../models/product'),
  imageBrucket = require('../imageBrucket.js'),
	productsEntry = new Entry('Product'),
  base64 = require('Base64'),
	Errors = require('../errors');

function handleError(err,done){
	err.status=500;
	done(err)
}

/*
 * 从req中提取uid
 */
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
  /**
   * 保存产品信息
   * 
   * @return {Object} 返回保存后的产品信息
   */
	save: {
		method:'put',
		type:'json',
		main:function(req,res,done){
			var product = req.body;
			product.user=req.user;
      var p=new Product(product);
			p.checkAndSave(done);
		},
	},

  /**
   * 删除产品
   * @param {Number} uid 产品的uid
   * @return {Object} 返回删除结果
   */
	delte: {
		method:'delete',
		type:'json',
		url:'/:uid',
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
	
  /**
   * 获取Product数据结构
   * 
   * @return {Object} 返回Product数据结构
   */
	getSchema:{
		method:'get',
		type:'json',
		url:'/schema',
		main:function(req,res,done){
			Product.getSchema(done);
		}
	},

  /**
   * 获取现有产品的目录
   * 
   * @return {Array} 返回产品的目录，并包含目录下产品的数量
   *   格式:
   *   [{
   *     catalog: String,
   *     count: Number
   *   }]
   */
	getCatalogs: {
		method:'get',
		type:'json',
		url:'/catalog',
		main:function(req,res,done){
			Product.getCatalogs(done);
		}
	},

  /**
   * 获取产品的自定义属性
   * 
   * @param {Object} query 根据不同的要求进行查询
   * 
   * @return {Array} 返回所有产品的自定义属性
   * 格式：
   * [{
   *   name: String,
   *   count: Number
   * }]
   */
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

  /**
   * 查询产品，并分页返回
   * @param {Object} query 查询范围
   * @param {String} query.fields 返回结果所包含的字段
   * @param {Number} page 页数
   * @param {Number} step 步长
   * 
   * @return {Array} 返回查询后的产品列表
   */
	query:{
		method:'get',
		type:'json',
		url:['','/page/:page'],
		main:function(req,res,done){
			var page=req.params.page||1;
			var step=req.query.step||20;
			var fields=req.query.fields||"";
			var sort=req.query.sort||"uid";

      try{
        var query=JSON.parse(req.query.query)||{};
      }catch(e){
        return done(e);
      }

      var searchText=req.query.search;

			Product.search(searchText,query,page,step,fields,sort,function(err,docs,pagination){
        if(err){
			    handleError(err,done);
			  }else{
			    res.header('Page-Count',pagination.pageCount);
			    res.header('Items-Count',pagination.itemCount);
			    res.header('Page-Number',pagination.page);
			    res.header('Page-Step',pagination.step);
			    done(null,docs);
			  }
      })
		}
	},

  /**
   * 获取图床的域名
   *
   * @return {Object} 格式：{host:String}
   *
   * 
   */
  getImageHost:{
    method:'get',
    type:'json',
    url:'/imageHost',
    main:function(req,res,done){
      done(null,{host:config.imageHost});
    }
  },

  /**
   * 获取上传图片的token
   * @param {Number} uid 产品的uid
   * @return {String}
   */
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

  /**
   * 获取指定产品的原件
   * @param {Number} uid 产品的uid
   * @return {Array} 
   */
  getComponents:{
    method:'get',
    type:'json',
    url:'/:uid/components',
    main:function(req,res,done){
      var uid=requireUid(req,done);
      if(!uid)return;
      Product.findOne({uid:uid},function(err,product){
        if(err)return done(err);
        product.getComponents(done)
      })
    }
  },

  /**
   * 删除指定图片
   * @param {Number} uid 产品的uid
   * @param {String} imageName 图片名称
   * @return {Object}
   */
  removeImage:{
  	method:'delete',
    type:'json',
    url:'/:uid/image/:image',
    main:function(req,res,done){
   	  var uid=requireUid(req,done);
      var image=req.params.image;
      if(!uid)return;
      if(!image){done();return;}
      Product.removeImage(uid,image,done)
    }
  },

  /**
   * 添加产品图片
   * @param {Number} uid 产品的uid
   * @param {Objecy} image 图片信息
   * @return {Objecy} 
   */
  addImage:{
    method:'post',
    type:'.*',
    url:'/:uid/image',
    noAuth:true,
    main:function(req,res,done){
      var uid=requireUid(req,done);
      var image=req.body;
      if(image){
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
        Product.findOne({uid:uid},function(err,product){
          console.log(product);
          if(err)return done(err);
          product.addImage(image,function(err){
            done(err,product.images);
          })  
        });
      }else{
        done();
      }
    },
    html:function(result,req,res){
      res.end(JSON.stringify(result));      
    }
  },

  /**
   * 获取产品信息
   * @param {Number} uid 产品的uid
   * @return {Objecy}
   */
	get:{
		method:'get',
		type:'json',
		url:'/:uid',
		main:function(req,res,done){
			var uid=requireUid(req,done);
			if(!uid)return;
      Product.findOne({uid:uid},function(err,product){
        if(err)return done(err);
        if(!product){
					var err = Errors.NotFound('product not found by id '+uid);
					done(err,product);
				}else{
          product.build(function(err){
            done(err,product)
          }) 
				}
  
      })
    }
	},
  
  /**
   * 更新产品信息
   * @param {Number} uid 产品的uid
   * @param {Objecy} data 产品信息
   * @return {Object}
   */
	update: {
		method:'post',
		type:'json',
		url:'/:uid',
		main:function(req,res,done){
			var uid=requireUid(req,done);
			if(!uid)return;
			Product.updateAndClean(uid,req.body,done);
		}
	}
}

/**
 * 产品入口
 * @param  {String} url 入口的根地址
 * @param  {Object} app Express实例
 */
module.exports = function(url,app){
	productsEntry.rootUrl=url;
	productsEntry.init(app);
};
