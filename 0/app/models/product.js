/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env],
    Schema = mongoose.Schema,
    imageBrucket = require('../imageBrucket.js'),
    Errors = require('../errors');


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
    }
 }

var ProductSchema = new Schema(schemaData,{
    _id:false
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
    addToQueue(saveQueue,function(nx){
         checkUid(function(err){
            if(err){
                next(err);
                nx()
                return
            }else{
                checkNumber(function(err){
                    next(err);
                    nx();
                })
            }
        })
    })
});

/**
 * Statics
 */
ProductSchema.statics = {
    load: function(id, cb) {
        this.findOne({
            _id: id
        }).populate('user').exec(cb);
    },
    getSchema: function(cb){
        if(typeof(cb)=='function'){
            cb(null,schemaData)
        }
        return schemaData;
    },
    getProperty:function(query,callback){
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
    },
    getCatalogs:function(callback){
        Product.collection.group({
                catalog:1
            },{
                catalog:{$gt:""}
            },{
                count:0
            },function(curr,result){
                result.count++;
            },null,true,callback);
    },
    addImage:function(uid,image,callback){
      Product.findOne({uid:uid,images:{$elemMatch:{name:image.name}}},'images',function(err,doc){
        if(doc){
          callback(err,doc.images)
        }else{
          Product.update({uid:uid},{$push:{images:image}},{multi:false},function(err){
            if(err){
              callback(err)
              return;
            }
            Product.findOne({uid:uid},function(err,doc){
              callback(err,doc.images);
            })
          })
        }
      })
    },
  removeImage:function(uid,image,callback){
    imageBrucket.remove(image.name,function(err){
      if(err){callback(err);return};
      Product.update({uid:uid},{$pull:{images:{name:image}}},callback);
    })
  },
  updateAndClean:function(uid,data,callback){
    Product.findOneAndUpdate({uid:uid},data,{new:false},function(err,doc){
      var newImages=data.images;
      var oldImages=doc.images;
      callback(err,data);
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
  }
};

var Product=mongoose.model('Product', ProductSchema);