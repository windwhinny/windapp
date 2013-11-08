require.config({
  baseUrl:'/js',
  paths:{
    angular:'lib/angular',
    'angular-resource':'lib/angular-resource',
    'angular-bootstrap':'lib/ui-bootstrap-tpls',
    'angular-ui-router':'lib/angular-ui-router',
    jquery:'lib/jquery'
  },
  shim:{
    angular:{
      exports:'angular'
    },
    'angular-resource':{
      deps:['angular']
    },
    'angular-bootstrap':{
      deps:['angular','jquery'] 
    },
    'angular-ui-router':{
      deps:['angular'] 
    },
    jquery:{
      exports:['jQuery']
    }
  }
})
define([
  'angular',
  'app',
  'route'
],function(angular){
var bootstrap = function() {
    angular.bootstrap(document, ['windapp']);
    document.body.setAttribute('ng-app', 'windapp');
}
bootstrap();
})