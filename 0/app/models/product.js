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
  cost:[{
    item:"string",
    quotes:[{
      company:{
        ref:'Company',
        type:Schema.Types.ObjectId
      },
      price:'number'
    }]
  }],
  price:'number',
  totlePrice:{
    type:'number',
    default:0
  },
  catalog:{
    type:'string',
    name:'catalog'
  },
  similar:{
    type:'number'
  }
}

var ProductSchema = new Schema(schemaData);

/*
  设置index
 */
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

/*
  在保存产品的过程中需要用到队列
  add the save task to queue, so the task can performed one by one
 */
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

//check similar product
ProductSchema.pre('save', function(next) {
  if (!this.isNew) return next();
  var self=this;
  if(self.similar&&self.isNew){
    Product.findOne({uid:self.similar},function(err,doc){
      if(err)return next(err);
      doc=doc.toObject();
      delete doc.uid;
      delete doc._id;
      delete doc.number;
      delete doc.created;
      utils.deepMegre(self._doc,doc);
      //deepMegre cannot megre array, so we should add components property manualy
      self.components=doc.components;
      next()
    })
  }else{
    next();
  }
})

//generate uid
ProductSchema.pre('save', function(next) {
  if (!this.isNew) return next();
  var self=this;
  Product
    .find({uid:{$gt:0}},{uid:1})
    .sort({uid:-1})
    .limit(1)
    .exec(function(err, product){
      self.uid= (product[0]?product[0].uid:0)+1;
      next(err);
    });
});

//check number
ProductSchema.pre('save', function(next) {
  if (!this.isNew) return next();
  var self=this;
  var number=self.number;
  if(number){
    Product.find({number:number}, function(err,docs){
      if(docs.length){
        var err=Errors.BadRequest('number already exist');
        next(err);
      }else{
        next();
      }
    })
  }else{
    next();
  }
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

/*
  构建产品信息
 */
ProductSchema.methods.build=function(done){
  this
    .populate({
      path:'components',
      select:"number uid images totlePrice catalog"
    })
    .populate({
      path:'cost.quotes.company',
      select:'name _id uid'
    })
    .populate(function(err){
      done(err); 
    })
};

ProductSchema.methods.addImage=function(image,callback){
  console.log(this.images);
  this.images.push(image);
  this.save(callback);
};

ProductSchema.methods.calcuPriceDown=function(callback){
  var self=this;
  function calcuComsPrice(product){
    var totlePrice=product.price;
    try{
      product.components.forEach(function(com){
        if(com&&typeof(com.totlePrice)){
          totlePrice+=com.totlePrice;
        }
      })
    }catch(e){
      return callback(e);
    }
    
    product.totlePrice=totlePrice;
    product.save(callback);
  }

  if(!this.populated('components')){
    this.populate({
      path:'components',
      select:'totlePrice'
    },function(err,product){
      
      if(err)return callback(err);
      calcuComsPrice(product);
    })
  }else{
    calcuComsPrice(self);
  }
}

ProductSchema.methods.calcuPriceUp=function(diff,callback){
  Product.find({components:this._id},function(err,docs){
    if(err)return callback(err);

    if(docs&&docs.length){
      var count=0;
      docs.forEach(function(doc){
        count++;
        doc.totlePrice+=diff;
        doc.calcuPriceUp(diff,function(err){
          count--;
          if(err)console.error(err);
          if(!count){
            callback(err);
          }
        })
        doc.save(function(err,doc){
          if(err)console.error(err);
        })
      })
    }else{
      callback();
    }
  })
}

ProductSchema.methods.calcuPrice=function(callback){
  var newPrice=0;
  var self=this;
  self.cost.forEach(function(cost){
    var lowest=false;
    cost.quotes.forEach(function(quote){
      var p=quote.price;
      if(lowest===false){
        lowest=p;
      }else if(lowest>p){
        lowest=p;
      }
    })
    newPrice+=lowest;
  })
  var oldPrice=self.price;
  self.price=newPrice;
  self.calcuPriceDown(function(err,product){
    callback(err,product);
    product.calcuPriceUp(newPrice-oldPrice,function(err){
      if(err)console.error(err);
    })
  })
}
/*
 * Statics
 */
ProductSchema.statics.search=function(searchText,query,page,step,fields,sort,callback){
  if(searchText&&typeof searchText === 'string'){
    var or=[];
    var match=[];

    searchText=searchText.split(' ');

    var reg="";
    if(searchText.length>1){
      reg="("+searchText.join('|')+")";
    }else{
      reg=searchText[0];
    }

    match={ '$regex': reg, '$options': 'i' };
    or.push({
      number:match
    })

    or.push({
      catalog:match
    })

    or.push({
      'property.custom':{
        '$elemMatch':{
          name:match
        }
      }
    })

    or.push({
      'property.custom':{
        '$elemMatch':{
          value:match
        }
      }
    })

    query['$or']=or;
  }

  this.list(query,page,step,fields,sort,callback);
}
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

ProductSchema.statics.getCostItem=function(query,callback){
  if(typeof(query)=='function'){
    callback=query;
    query={};
  }
  Product.mapReduce({
    map:function(){
      this.cost.forEach(function(cost){
        if(cost.item){
          emit(cost.item,1)
        }
      })
    },
    reduce:function(key,values){
      return Array.sum(values);
    },
    query:query
  },callback)
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

ProductSchema.statics.updateAndClean=function(uid,newDoc,callback){
  delete newDoc._id;
  delete newDoc.__v;
  
  Product.findOneAndUpdate({uid:uid},newDoc,{new:false},function(err,oldDoc,a){
    if(err)return callback(err);
    Product.findOne({uid:uid},function(err,product){
      if(err)return console.log(err);
      product.calcuPrice(function(err,doc){
        callback(err,doc);
      })
    })
    
    /*
      remove unused image from qiniu
     */
    var newImages=newDoc.images;
    var oldImages=oldDoc.images;
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
