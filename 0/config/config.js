var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
    development: {
        db: 'mongodb://localhost/mean-dev',
        root: rootPath,
        app: {
            name: 'WindApp - Development'
        },
    },
    test: {
        db: 'mongodb://localhost/mean-test',
        root: rootPath,
        app: {
            name: 'WindApp - Test'
        },
    },
    production: {
        db: 'mongodb://localhost/mean',
        root: rootPath,
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
    }
};

module.exports = function(a,b){
    for(var i in b){
        a[i]=b[i];
    }
    return a;
}(defaultConfig,config[env]);