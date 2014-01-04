define([
  'angular',
  'angular-bootstrap',
  'angular-ui-router',
  'angular-resource'
],function(angular){
var app = angular.module('windapp', 
	['ngResource', 
	'ui.bootstrap',
	'ui.router']);

app.config(["$httpProvider","$rootScopeProvider",function($http,$rootScope) {
  function getRootScope(){
    $injector = angular.element(document).injector();
    return $injector.get('$rootScope');
  }
  $http.defaults.transformRequest.push(function(data) {
    getRootScope().$broadcast('ajaxStart')
    return data;
  });

  $http.defaults.transformResponse.push(function(data){
    getRootScope().$broadcast('ajaxEnd');
    return data;
  })
}]);

return app;
});
