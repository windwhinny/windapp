/**
 * Module dependencies.
 */
var express = require('express');
var    mongoStore = require('connect-mongo')(express);
var    mongoose = require('mongoose');
var    helpers = require('view-helpers');
var    url = require('url');
module.exports = function(app, config, passport) {
    app.set('showStackError', true);
    //Should be placed before express.static
    app.use(express.compress({
        filter: function(req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));
    //Setting the fav icon
    app.use(express.favicon());
    //处理静态文件请求
    var staticFileExtReg=/.(js|css|jpg|png|html|htm|ico|woff|ttf|svg)$/;
    var staticFileHandler=express.static(config.root+'/public');
    var scriptHandler=express.static(config.root+'/frontend');
    var viewsHandler=express.static(config.root+'/frontend/views');
    var lessHandler=express.static(config.root+'/frontend/less');
    app.use(function(req,res,next) {
        if(staticFileExtReg.test(req.url)){
        //if not in production env, browser will revice script file store in frontend folder directly
          if(config.env!='production'&&req.url.match(/^\/js/)){
            req.url=req.url.replace(/^\/js/,'');
            scriptHandler(req,res,next);        
          }else{
            staticFileHandler(req,res,next); 
          }
        }else{
          next();
        }
    });
    app.use('/views',viewsHandler);
    app.use('/less',lessHandler);
    //Don't use logger for test env
    if (process.env.NODE_ENV !== 'test') {
        app.use(express.logger('dev'));
    }
    //Set views path, template engine and default layout
    app.set('views', config.root + '/app/views');
    app.set('view engine', 'jade');
    //Enable jsonp
    app.enable("jsonp callback");
    app.configure(function() {
        //cookieParser should be above session
        app.use(express.cookieParser());
        //bodyParser should be above methodOverride
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        //express/mongo session storage
        app.use(express.session({
            secret: 'MEAN',
            store: new mongoStore({
              	mongoose_connection:mongoose.connection,
                collection: 'sessions'
            })
        }));
        //dynamic helpers
        app.use(helpers(config.app.name));
        //use passport session
        app.use(passport.initialize());
        app.use(passport.session());
        //detected the request type
        app.use(function(req,res,next) {
            req.acceptType = function(type){
                var accept=req.headers.accept;
                if(!accept){
                    accept='text/html';
                };
                var accepts=accept.split(',');
                for ( var i = 0;i<accepts.length;i++) {
                  var accept=accepts[i];
                  if(accept.match(type)){
                    return true;
                  }
                }
                return false;
            }
            next();
        });
        //routes should be at the last
        app.use(app.router);
        //Assume "not found" in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
        app.use(function(err, req, res, next) {
            //Treat as 404
            if (~err.message.indexOf('not found')) return next();

            //Log it
            console.error(err.stack);

            //Error page
            res.status(err.status||500).json({
                message: err.message
            });
        });

        //如果不能处理请求，且请求类型为html，则返回主页
        app.use(function(req, res, next) {
            var err={
              message: 'Can not handle this request'
            }
            if(req.acceptType('html')){

               //go to index
               var params={
                env:config.env,
                user:req.user ? JSON.stringify(req.user) : "null"
               }
               res.render('index',params);   
            }else if(req.acceptType('json')){
                res.status(400).json(err);
            }else{
                res.status(400).end(err.message)
            }
        });
    });
};

