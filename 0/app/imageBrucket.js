var qiniu=require('qiniu'),
    config=require('../config/config.js');
qiniu.conf.ACCESS_KEY = config.imageBrucketAK;
qiniu.conf.SECRET_KEY = config.imageBrucketSK;

var putPolicy= new qiniu.rs.PutPolicy(config.imageBucketName);
putPolicy.callbackBody = '{"size": $(fsize),"name":"$(etag)","type":"$(mimeType)","imageInfo":$(imageInfo)}';
var brucketName=config.imageBrucketName;
var imageBrucket={
  token:function(host,uid){
    putPolicy.callbackUrl = host+'/products/'+uid+'/image';
    return putPolicy.token();
  },
  remove:function(callback){
    var client= imageBrucket.client;
    client.remove(config.imageBrucketName,name,callback);
  },
  client:new qiniu.rs.Client()
}
module.exports=imageBrucket;