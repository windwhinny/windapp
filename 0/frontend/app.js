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
return app;
});