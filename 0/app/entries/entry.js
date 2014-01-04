/**
 * 入口（Entry）是一个用于处理RESTfull请求的库。
 *
 * var express=new Express();
 * var ProductEntry = new Entry();
 * var app=express();
 * 
 * ProductEntry.handlers={
 *   get:{
 *     method:'get',
 *     type:'json html',
 *     main:function(req,res,done){
 *     ...
 *     },
 *     html:function(mainResult,req,res){
 *     ...
 *     }
 *   }
 * }
 *
 * ProductEntry.rootUrl="/products";
 * ProductEntry.init(app);
 *
 * 以上代码新建了一个ProductEntry，当有请求时，请求的地址为'/products'
 * 且接受数据类型设置为application/json或者text/html。就会触发ProductEntry。
 *
 * ProductEntry会首先执行handlers.get.main函数，返回生成的结果。
 * 
 * 如果请求接受html
 * 格式的话，则会将结果送入handlers.get.html并执行，这个函数负责html结果的渲染和
 * res的关闭。
 *
 * 如果请求未指定类型的话，则将以json的格式返回结果。
 *
 * 其它格式可以按照handlers.get.html的声明方式来模仿。
 *
 * 一个入口可以添加多个handler，并且可以指定不同的URL。
 * 例如:
 *
 * ProductEntry.handlers.delete={
 *   method:'delete',
 *   url:'/delete'
 *   type:'json',
 *   main:function(req,res,done){
 *   ...
 *   }
 * }
 *
 * 发送请求到/products/delete就会执行上面的handler
 */

var Errors=require('../errors'),
    config=require('../../config/config');

/**
 * 注册请求地址
 * @param  {Object}   app 			Express实例
 * @param  {String}   url 			请求地址
 * @param  {Object}   handler 	
 * @param  {Function} callback
 */
function registeRequestMethod (app,url,handler,callback){
	var method=handler.method||'get';	
	app[method](url,function(req, res, next) {
		function allowType(types){
			if(typeof(types)=='string'){
				types=[types];
			}
			for( var i = 0; i < types.length; i++ ) {
				var type=types[i];
				if (req.acceptType(type)) {
					return true;
				}
			}
			return false;
		}
		if(!allowType(handler.type)){
			next()
			return;
		};
		callback(handler,req,res,next);
	});
}

/**
 * 入口
 * @param {String} name 入口名称
 */
var Entry = function(name){
	this.handlers=[];
	this.url='';
	this.name=name;
}

var ErrorHandler={
	type:['json']
}

/**
 * 渲染请求结果并返回请求
 * @param  {[type]} err
 * @param  {[type]} req
 * @param  {[type]} res
 * @param  {[type]} handler
 * @param  {[type]} mainResult 主结果
 * @param  {[type]} FakeRes 	 
 * @return {[type]}
 */
function renderResult(err,req,res,handler,mainResult,fakeRes){
	if(err){
		if(err.status){
			res.status(err.status);
			delete err.status;
		}else{
			res.status(500);
		}
		mainResult={
			message:err.message
		};
    if(config.env!='production'){
      mainResult.stack=err.stack;
    }
		handler=ErrorHandler;
	}
  if(fakeRes){
    fakeRes.apply(res);
  }
	var types=handler.type;
	var handled=false;
	if(typeof(types)=='string'){
		types=[types];
	}

	types.forEach(function(type){
		if(handled)return;
		var render=handler[type]
		if(render && req.acceptType(type)){
			render(mainResult,req,res);
			handled=true;
		};

	})

	if(!handled){
		res.json(mainResult)
	}
}

/**
 * FakeRes 用于临时储存http header，在最终渲染结果的时候再提取
 */
function FakeRes(){
	this.headers=[];
}

/**
 * 储存一个http header
 * @param  {String} name header的名称
 * @param  {String} value header的值
 */
FakeRes.prototype.header=function(name,value){
	this.headers.push({
		name:name,
		value:value
	})
}

/**
 * apply 将根据header设置返回的请求
 * @param  {Object} res 
 */
FakeRes.prototype.apply=function(res){
	if(this.headers.length){
		this.headers.forEach(function(header){
			res.setHeader(header.name,header.value)
		})
		
	}
}

/**
 * 将请求交由handler处理
 * @param  {Object}   handler
 * @param  {Objecy}   req
 * @param  {Object}   res
 * @param  {Function} next
 */
function requestCallback(handler,req,res,next){
	var fakeRes=new FakeRes();
  if(handler.noAuth||req.isAuthenticated()){
    if(handler.main){
      handler.main(req,fakeRes,function(err,mainResult){
        renderResult(err,req,res,handler,mainResult,fakeRes)
      })
    }else{
      next();
      return;
    }   
  }else{
    renderResult(new Errors.Unauthorized('not authorized'),req,res);    
  }
}

/**
 * 初始化入口
 * @param  {[type]} app
 * @return {[type]}
 */
Entry.prototype.init = function(app){
	var rootUrl=this.rootUrl;
	for(action in this.handlers){
		var handler=this.handlers[action];
		var url=handler.url||'';
		if(Array.isArray(url)){
			url.forEach(function(u){
				registeRequestMethod(app,rootUrl+u,handler,requestCallback)
			})
		}else if(typeof(url)==='string'){
			registeRequestMethod(app,rootUrl+url,handler,requestCallback)
		}
	}
}
module.exports = Entry;
