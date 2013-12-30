/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env],
    Schema = mongoose.Schema,
    imageBrucket = require('../imageBrucket.js'),
    Errors = require('../errors'),
    utils = require('../utils');


/**
 * Product Schema
 */

 var schemaData={
    created: {
        type: 'date',
        default: Date.now
    },
    number: {
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
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    images:[{
      name:'string',
      size:'number',
      imageInfo:'mixed'
    }],
    components:[{
      ref:'Product',
      type:Schema.Types.ObjectId
    }],
    property:{
        default:{
            length:{
                name:'length',
                type:'number',
                default:0,
                unit:'cm'
            },
            width:{
                name:'width',
                type:'number',
                default:0,
                unit:'cm'
            },
            height:{
                name:'height',
                type:'number',
                default:0,
                unit:'cm'
            },
            weight:{
                name:'weight',
                type:'number',
                default:0,
                unit:'g'
            },
        },
        custom:[{
            name:'string',
            value:'string'
        }]
    },
    catalog:{
        type:'string',
        name:'catalog'
    },
    similar:{
      type:'number'
    }
 }

var ProductSchema = new Schema(schemaData,{
    _id:false
});

ProductSchema.options.toObject={
  hide : '_id'
};
ProductSchema.options.toJSON={
  hide : '_id'
};
[
  {
    fields:{uid:1},
    options:{unique:true,sparse: true}
  },
  {
    fields:{uid:1,'images.name':1},
    options:{unique:true,sparse: true}
  }
].forEach(function(index){
  ProductSchema.index(index.fields,index.options);
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

ProductSchema.pre('save', function(next) {
    if (!this.isNew) return next();
    var self=this;
    function checkSimilarProduct(done){
      if(self.similar&&self.isNew){
        Product.findOne({uid:self.similar},function(err,doc){
          if(err)return done(err);
          doc=doc.toObject();
          delete doc.uid;
          delete doc._id;
          delete doc.number;
          delete doc.created;
          utils.deepMegre(self._doc,doc);
          done();
        })
      }else{
        done();
      }
    }
    function checkNumber(callback){
        var number=self.number;
        if(number){
            Product.find({number:number}, function(err,docs){
                if(docs.length){
                    var err=Errors.BadRequest('number already exist');
                    callback(err);
                }else{
                    callback();
                }
            })
        }else{
            callback();
        }
    }

    function checkUid(callback){
        Product
            .find({uid:{$gt:0}},{uid:1})
            .sort({uid:-1})
            .limit(1)
            .exec(function(err, product){
                self.uid= (product[0]?product[0].uid:0)+1;
                callback(err);
            });
    }

    checkSimilarProduct(function(err){
      if(err)return next(err);
      checkUid(function(err){
          if(err)return next(err);
          checkNumber(function(err){
              next(err);
          })
      })
    }) 
});

ProductSchema.methods.getComponents=function(done){
  var components=this.components;
  var or=[];
  var query=null;
  components.forEach(function(component){
    var data={uid:component.uid};
    or.push(data);
  })
  query=Product.find();
  if(!or.length){
    return done(null,[]);
  }
  return query.or(or).exec(done) 
}
ProductSchema.methods.checkAndSave=function(callback){
    var self=this;
    addToQueue(saveQueue,function(next){
        self.save(function(err,doc){
             callback&&callback(err,doc);
             next();
        })
    })
};

ProductSchema.methods.build=function(done){
  var self=this;

  this.populate('components',function(err){
    done(err); 
  })
};
/*
 * Statics
 */

ProductSchema.statics.list=function(query,page,step,fields,sort,callback){
  function varifyPageNumber(count,step,page){
    var pageCount=Math.ceil(count/step);
    if(page>pageCount){
      page=pageCount;
    }
    return pageCount;
  }
  Product.find(query).count(function(err,count){
    if(err){
      callback(err);
    }else{
      var pageCount=varifyPageNumber(count,step,page);
      var que=Product.find(query,fields,{
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
};

ProductSchema.statics.getSchema=function(cb){
  if(typeof(cb)=='function'){
      cb(null,schemaData)
  }
  return schemaData;
};

ProductSchema.statics.getProperty=function(query,callback){
  if(typeof(query)=='function'){
      callback=query;
      query={};
  }
  Product.mapReduce({
          map:function(){
              this.property.custom.forEach(function(property){
                  if(property.name){
                      emit(property.name,1)
                  }   
              })
          },
          reduce:function(key,values){
              return Array.sum(values);
          },
          query: query
      },callback)
};

ProductSchema.statics.getCatalogs=function(callback){
  Product.collection.group({
        catalog:1
    },{
        catalog:{$gt:""}
    },{
        count:0
    },function(curr,result){
        result.count++;
    },null,true,callback);
};
ProductSchema.statics.addImage=function(uid,image,callback){
  Product.update({uid:uid},{$push:{images:image}},{multi:false},function(err){
    if(err){
      callback(err)
      return;
    }
    Product.findOne({uid:uid},function(err,doc){
      callback(err,doc.images);
    })
  })
};
ProductSchema.statics.removeImage=function(uid,image,callback){
  Product.update({uid:uid},{$pull:{images:{name:image}}},function(err){
    if(err)return callback(err);
    Product.find({images:{$elemMatch:{name:image}}},function(err,doc){
      console.log(doc);
      if(err){throw err;return};
      if(!doc||doc&&(!doc.length)){
        console.log('delete '+image);
        imageBrucket.remove(image,function(err){
          if(err)throw err;
        });
      }
    })
    callback();
  });
};

ProductSchema.statics.updateAndClean=function(uid,data,callback){
  Product.findOneAndUpdate({uid:uid},data,{new:false},function(err,doc){
    callback(err,data);
    if(err)return;
    var newImages=data.images;
    var oldImages=doc.images;
    process.nextTick(function(){
      oldImages.forEach(function(image){
        var found=false;
        newImages.forEach(function(img){
          if(img.name==image.name){
            found=true; 
          }
        })
        if(!found){
          imageBrucket.remove(image.name,function(err){
            if(err)console.log(err,err.stack);
          });
        }
      })
    })
  })  
};

var Product = module.exports = mongoose.model('Product', ProductSchema);
