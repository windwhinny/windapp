var async = require('async');

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
      ['/signout',users.signout],
      ['/signup',users.signup],
      ['/users/:userId',users.show],
    ].forEach(function(v) {
      handleRequest('get','html',v[0],v[1]);       
    });

	handleRequest('all','json','/signin',users.signin(passport));
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
    //Article Routes
    app.put('/articles/:articleId', auth.requiresLogin, auth.article.hasAuthorization, articles.update);
    app.del('/articles/:articleId', auth.requiresLogin, auth.article.hasAuthorization, articles.destroy);
    //Finish with setting up the articleId param
    app.param('articleId', articles.article);
};
