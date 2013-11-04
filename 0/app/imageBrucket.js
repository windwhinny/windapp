var qiniu=require('qiniu'),
    config=require('../config/config.js');
qiniu.conf.ACCESS_KEY = config.imageBrucketAK;
qiniu.conf.SECRET_KEY = config.imageBrucketSK;
var brucketName=config.imageBrucketName;
var putPolicy= new qiniu.rs.PutPolicy(brucketName);
putPolicy.callbackBody = '{"size": $(fsize),"name":"$(etag)","type":"$(mimeType)","imageInfo":$(imageInfo)}';

var imageBrucket={
  token:function(host,uid){
    putPolicy.callbackUrl = host+'/products/'+uid+'/image';
    return putPolicy.token();
  },
  remove:function(name,callback){
    var client= imageBrucket.client;
    client.remove(brucketName,name,callback);
  },
  client:new qiniu.rs.Client()
}
module.exports=imageBrucket;