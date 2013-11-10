define([
  'app'
], function(app){
app
.directive('field', function(){
	var directiveDefinitionObject = {
		scope:{
			model:'=',
			edittable:'='
		},
		template:'<span ng-show="!edittable">{{model}}</span>'
				+'<input type="{{type}}" ng-show="!edittable" ng-model="model">',
		restrict:'EC',
		link:function($scope, element, attrs, controller){
			console.log($scope);
		}
	}
	return directiveDefinitionObject;
})
})
