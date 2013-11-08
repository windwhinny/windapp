var qiniu=require('qiniu'),
    config=require('../config/config.js');
qiniu.conf.ACCESS_KEY = config.imageBrucketAK;
qiniu.conf.SECRET_KEY = config.imageBrucketSK;
var brucketName=config.imageBrucketName;
var putPolicy= new qiniu.rs.PutPolicy(brucketName);

var imageBrucket={
  token:function(host,uid){
    var callbackMethod=(host.match(/(localhost|127\.0\.0\.1)/)) ? 'return' : 'callback';
    putPolicy[callbackMethod+'Url'] = host+'/products/'+uid+'/image';
    putPolicy[callbackMethod+'Body'] = '{"size": $(fsize),"name":"$(etag)","type":"$(mimeType)","imageInfo":$(imageInfo)}';
    console.log(putPolicy);
    return putPolicy.token();
  },
  remove:function(name,callback){
    var client= imageBrucket.client;
    client.remove(brucketName,name,callback);
  },
  client:new qiniu.rs.Client()
}
module.exports=imageBrucket;
