/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env],
    Schema = mongoose.Schema,
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
    }
};

var Product=mongoose.model('Product', ProductSchema);