/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    config = require('../../config/config'),
    Schema = mongoose.Schema,
    Errors = require('../errors'),
    utils = require('../utils');


/**
 * Company Schema
 */

 var schemaData={
    created: {
        type: 'date',
        default: Date.now
    },
    name: {
        type: 'string',
        default: '',
        trim: true
    },
    uid: {
        type: 'number',
        default: '',
        trim: true,
        unique:true
    },
    employees:[{
      name:'string',
      phone:['string'],
      email:['string']
    }],
    productCatalogs:['string'],
    catalog:{
        type:'string',
        name:'catalog'
    }
 }

var CompanySchema = new Schema(schemaData,{
    _id:false
});

[
  {
    fields:{uid:1},
    options:{unique:true,sparse: true}
  },
  {
    fields:{name:1},
    options:{unique:true,sparse: true}
  },
].forEach(function(index){
  CompanySchema.index(index.fields,index.options);
});

function addToQueue(queue,cb){
    queue.push(cb);
    function runQueue(){
        var callback=queue[0];
        callback(function(){
            queue.splice(0,1);
            if(queue.length){
                runQueue();
            }
        })
    }
    if(queue.length==1){
        runQueue();
    }
}
var saveQueue=[];

CompanySchema.pre('save', function(next) {
    if (!this.isNew) return next();
    var self=this;

    function checkUid(callback){
        Company
            .find({uid:{$gt:0}},{uid:1})
            .sort({uid:-1})
            .limit(1)
            .exec(function(err, company){
                self.uid= (company[0]?company[0].uid:0)+1;
                callback(err);
            });
    }
    checkUid(function(err){
        next(err);
    })
});

CompanySchema.methods.checkAndSave=function(callback){
    var self=this;
    addToQueue(saveQueue,function(next){
        self.save(function(err,doc){
             callback&&callback(err,doc);
             next();
        })
    })
},
/*
 * Statics
 */
CompanySchema.statics = {
  load: function(uid, cb) {
      var query={
        uid:uid
      };
      this.findOne(query,cb);
  },
  list:function(query,page,step,fields,sort,callback){
    function varifyPageNumber(count,step,page){
			var pageCount=Math.ceil(count/step);
			if(page>pageCount){
				page=pageCount;
			}
			return pageCount;
		}
    Company.find(query).count(function(err,count){
			if(err){
				callback(err);
			}else{
				var pageCount=varifyPageNumber(count,step,page);
				var que=Company.find(query,fields,{
					skip:(page-1)*step,	
				}).sort(sort).limit(step);            
        que.exec(function(err,docs){
          callback(err,docs,{
            page:page,
            step:step,
            pageCount:pageCount,
            itemCount:count
          })
        })
			}
		});
  },
  updateAndClean:function(uid,data,callback){
    Company.findOneAndUpdate({uid:uid},data,{new:false},callback)  
  },
};

var Company = module.exports = mongoose.model('Company', CompanySchema);