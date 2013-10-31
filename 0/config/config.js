
var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'production';
var mongolab='mongodb://wind:5487@ds043388.mongolab.com:43388/windapp';
var config = {
    development: {
        db:mongolab,
        //db: 'mongodb://localhost/mean-dev',
        app: {
            name: 'WindApp - Development'
        },
        imageBrucketName:'products-dev',
        port:3000,
      imageHost:'http://products-dev.u.qiniudn.com'
    },
    test: {
        db: 'mongodb://localhost/mean-test',
      	imageBrucketName:'products-test',
        app: {
            name: 'WindApp - Test'
        },
      imageHost:'http://products-test.u.qiniudn.com'
    },
    production: {
        db: {
            url:process.env.BAE_ENV_ADDR_MONGO_IP,
            database:'zqZCsprmOaNetxiSoMcy',
            port:process.env.BAE_ENV_ADDR_MONGO_PORT,
            options:{
                user:process.env.BAE_ENV_AK,
                pass:process.env.BAE_ENV_SK
            }
        },
        //'mongodb://'+username+':'+password+'@'+db_host+':'+db_port+'/'+db_name,
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
    imageBrucketAK:'1hiE4FNoplKf9OnmVEg3Sr6KXp3nBa2wDOIYv5f1',
    imageBrucketSK:'2QtaTVv7z9yZQOGkKvLJqGWLHSKsI4eO-J5CI5rM',
    app: {
        name: 'WindApp'
    },
    port:process.env.APP_PORT||3000
};

module.exports = function(a,b){
    for(var i in b){
        a[i]=b[i];
    }
    return a;
}(defaultConfig,config[env]);