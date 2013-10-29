
var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'production';

var config = {
    development: {
        db: 'mongodb://wind:5487@ds043388.mongolab.com:43388/windapp',
        app: {
            name: 'WindApp - Development'
        },
        bucket:'products-dev',
        port:3000
    },
    test: {
        db: 'mongodb://localhost/mean-test',
        bucket:'products-test',
        app: {
            name: 'WindApp - Test'
        },
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
    }
};
    
var defaultConfig = {
    db: 'mongodb://localhost/mean',
    root: rootPath,
    bucket:'products',
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