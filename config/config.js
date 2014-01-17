var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    //判断是不是开发环境
    env = process.env.NODE_ENV || 'production',
    secret=require('./secret.js');
/*
 * 开发和测试环境的mongodb地址
 */
var mongodbDev='mongodb://localhost:27017/windapp-dev';
var mongodbTest='mongodb://localhost:27017/windapp-test';

var config = {
    development: {
        db:mongodbDev,
        app: {
            name: 'WindApp - Development'
        },
        imageBrucketName:'products-dev',
        imageHost:'http://products-dev.u.qiniudn.com'
    },
    test: {
        db: mongodbTest,
      	imageBrucketName:'products-test',
        app: {
            name: 'WindApp - Test'
        },
        imageHost:'http://products-test.u.qiniudn.com',
        port:4040
    },
    production: {
        /*
         *由于程序部署在BAE上，数据库连接需要下面的环境变量
         */
        db: {
            url:secret.mongoURL,
            database:secret.mongoName,
            port:secret.mongoPort,
            options:{
                user:secret.baeAK,
                pass:secret.baeSK
            }
        },
        port:18080,
        app: {
            name: 'WindApp'
        },
        imageBrucketName:'products',
        imageHost:'http://products.u.qiniudn.com'
    }
};
    
var defaultConfig = {
    db: 'mongodb://localhost/mean',
    root: rootPath,
    imageBrucketAK:secret.imageAK,
    imageBrucketSK:secret.imageSK,
    app: {
        name: 'WindApp'
    },
    port:process.env.APP_PORT||3000,
    env:env
};

//与默认的配置合并后返回
module.exports = (function(a,b){
    for(var i in b){
        a[i]=b[i];
    }
    return a;
})(defaultConfig,config[env]);
