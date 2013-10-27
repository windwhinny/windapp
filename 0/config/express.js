/**
 * Module dependencies.
 */
var express = require('express'),
    mongoStore = require('connect-mongo')(express),
    flash = require('connect-flash'),
    helpers = require('view-helpers'),
    url = require('url');

var staticFileExtReg=/.(js|css|jpg|png|html|htm|ico)$/;
module.exports = function(app, config, passport) {
  var i=1;
    app.set('showStackError', true);
console.log(i++);

    //Should be placed before express.static
    app.use(express.compress({
        filter: function(req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));
console.log(i++);

    //Setting the fav icon
    app.use(express.favicon());
    //handle static file
    var staticFileHandler=express.static(config.root+'/public');
  
  console.log(i++);

    app.use(function(req,res,next) {
        if(staticFileExtReg.test(req.url)){
          staticFileHandler(req,res,next); 
        }else{
          next();
        }
    });
console.log(i++);

    //Don't use logger for test env
    if (process.env.NODE_ENV !== 'test') {
        app.use(express.logger('dev'));
    }
console.log(i++);

    //Set views path, template engine and default layout
    app.set('views', config.root + '/app/views');
    app.set('view engine', 'jade');
console.log(i++);

    //Enable jsonp
    app.enable("jsonp callback");
console.log(i++);

    app.configure(function() {
        //cookieParser should be above session
        app.use(express.cookieParser());
console.log(i++);

        //bodyParser should be above methodOverride
        app.use(express.bodyParser());
        app.use(express.methodOverride());
console.log(i++);

        //express/mongo session storage
        app.use(express.session({
            secret: 'MEAN',
            store: new mongoStore({
                url: config.db,
                collection: 'sessions'
            })
        }));
console.log(i++);

        //connect flash for flash messages
        app.use(flash());
console.log(i++);

        //dynamic helpers
        app.use(helpers(config.app.name));
console.log(i++);

        //use passport session
        app.use(passport.initialize());
        app.use(passport.session());
console.log(i++);

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
        console.log(i++);

        //routes should be at the last
        app.use(app.router);
console.log(i++);

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
console.log(i++);

        //Assume 404 since no middleware responded
        app.use(function(req, res, next) {
            var err={
                    message: 'Can not handle this request'
                }
            if(req.acceptType('html')){
                var index = require(config.root+'/app/controllers/index');
                index.render(req,res,next);
            }else if(req.acceptType('json')){
                res.status(400).json(err);
            }else{
                res.status(400).end(err.message)
            }
        });
    });
};
