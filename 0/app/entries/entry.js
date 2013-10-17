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

var Entry = function(name){
	this.handlers=[];
	this.url='';
	this.name=name;
}

var ErrorHandler={
	type:['json']
}
function renderResult(err,res,handler,mainResult,fakeRes){
	if(err){
		if(err.status){
			res.status(err.status);
			delete err.status;
		}else{
			res.status(500);
		}
		mainResult={
			message:err.message,
			stack:err.stack
		};
		handler=ErrorHandler;
	}

	fakeRes.apply(res);

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

function FakeRes(){
	this.headers=[];
}

FakeRes.prototype.header=function(name,value){
	this.headers.push({
		name:name,
		value:value
	})
}

FakeRes.prototype.apply=function(res){
	if(this.headers.length){
		this.headers.forEach(function(header){
			res.setHeader(header.name,header.value)
		})
		
	}
}

function requestCallback(handler,req,res,next){
	var fakeRes=new FakeRes();
	if(handler.main){
		handler.main(req,fakeRes,function(err,mainResult){

			
			renderResult(err,res,handler,mainResult,fakeRes)
		})
	}else{
		console.log(handler);
		next();
		return;
	}
}
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