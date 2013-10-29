var qiniu=require('qiniu'),
    config=require('./config.js');
qiniu.conf.ACCESS_KEY = '1hiE4FNoplKf9OnmVEg3Sr6KXp3nBa2wDOIYv5f1'
qiniu.conf.SECRET_KEY = '2QtaTVv7z9yZQOGkKvLJqGWLHSKsI4eO-J5CI5rM'

function token(uid){
  var putPolicy= new qiniu.rs.PutPolicy(config.bucket);
  putPolicy.callbackUrl = 'http://windbox-21925.apne1.actionbox.io/products/'+uid+'/image';
  putPolicy.callbackBody = '{"size": $(fsize),"name":"$(etag)","type":"$(mimeType)","imageInfo":$(imageInfo)}';
 
  return putPolicy.token();
}

module.exports=token;