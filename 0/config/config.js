var db_name = 'zqZCsprmOaNetxiSoMcy';                  // 数据库名，从云平台获取
var db_host =  process.env.BAE_ENV_ADDR_MONGO_IP;      // 数据库地址
var db_port =  +process.env.BAE_ENV_ADDR_MONGO_PORT;   // 数据库端口
var username = process.env.BAE_ENV_AK;                 // 用户名
var password = process.env.BAE_ENV_SK;                 // 密码

var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'production';

var config = {
    development: {
        db: 'mongodb://wind:5487@ds043388.mongolab.com:43388/windapp',
        app: {
            name: 'WindApp - Development'
        },
        port:8080
    },
    test: {
        db: 'mongodb://localhost/mean-test',
        app: {
            name: 'WindApp - Test'
        },
    },
    production: {
        //db: 'mongodb://'+username+':'+password+'@'+db_host+':'+db_port+'/'+db_name,
        db: 'mongodb://wind:5487@ds043388.mongolab.com:43388/windapp',
        app: {
            name: 'WindApp'
        },
    }
};
    
var defaultConfig = {
    db: 'mongodb://localhost/mean',
    root: rootPath,
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