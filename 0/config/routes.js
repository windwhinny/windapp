var config = require('./config'),
  express = require('express');
module.exports = function(app, passport, auth) {
    //User Routes
    function handleRequest (method,type,route,handler) {
        app[method](route,function(req,res,next){
            if(req.acceptType(type)){
                handler(req,res,next);
            }else{
                next();
            };
        });
    };

    //html route
    var index = require('../app/controllers/index');
    var users = require('../app/controllers/users')(passport);
    var articles = require('../app/controllers/articles');
    var productsEntry = require('../app/entries/products');
    //handle get json request
    [
      ['/articles',articles.all],
      ['/articles/:articleId',articles.show]
    ].forEach(function(v){
      handleRequest('get','json',v[0],v[1]);         
    });
    //handle get html request
    [
      ['/users/me',users.me],
      
      ['/users/:userId',users.show],
    ].forEach(function(v) {
      handleRequest('get','html',v[0],v[1]);       
    });

	app.post('/signin',users.signin(passport));
    app.put('/signup',users.singup());
    app.post('/signout',users.signout());

    productsEntry('/products',app);
    //handle post json request
    [
        ['/users',users.create],
        ['/articles',auth.requiresLogin],
        ['/articles',articles.create],
    ].forEach(function(v) {
      handleRequest('post','html',v[0],v[1]);       
    });
    //Finish with setting up the userId param
    app.param('userId', users.user);

    //if not in production env, browser will revice script file store in frontend folder directly
    if(config.env!='production'){
      var scriptHandler=express.static(config.root+'/frontend');
      app.get('/js',scriptHandler);
    }

    //handle static file
    var staticFileHandler=express.static(config.root+'/public');
    app.get('/',function(req,res,next) {
        if(staticFileExtReg.test(req.url)){
          staticFileHandler(req,res,next); 
        }else{
          next();
        }
    });
};
