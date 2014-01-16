define([
  'angular',
  'angular-bootstrap',
  'angular-ui-router',
  'angular-resource',
  'angular-animate'
],function(angular){
var app = angular.module('windapp', 
	['ngResource', 
  'ngAnimate',
	'ui.bootstrap',
	'ui.router']);

/*
  When there is XMLHttprequest opend, $rootScope will broadcast a message "ajaxStart",
  and when it ends, there is also a message "ajaxEnd". Used for globalAjax directive.
 */
app.config([
          "$httpProvider",'$provide',
  function($httpProvider ,$provide) {

    function getRootScope(){
      $injector = angular.element(document).injector();
      return $injector.get('$rootScope');
    };

    function startAjax() {
      getRootScope().$broadcast('ajaxStart')
    };

    function endAjax(){
      getRootScope().$broadcast('ajaxEnd');
    };

  $provide.factory('HttpInterceptor', ['$q',function ($q) {
    return {
      request: function (config) {
        startAjax(); 
        return config || $q.when(config);
      },
      requestError: function (rejection) {
        endAjax(); 
        return $q.reject(rejection);
      },
      response: function (response) {
        endAjax(); 
        return response || $q.when(response);
      },
      responseError: function (rejection) {
        endAjax(); 
        return $q.reject(rejection);
      }
    };
  }]);

  $httpProvider.interceptors.push('HttpInterceptor');
}]);

return app;
});
