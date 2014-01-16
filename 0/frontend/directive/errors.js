define([
  'app'
],function(app){
app
.directive('errors',
	[
	function(){
		return {
			template:'<div class="errors "><alert ng-repeat="err in errors" class="alert-error error" close="closeAlert($index)">{{err.showupText() | i18n}}</alert></div>',
			restrict:'EA',
      $scope:{
      },
      controller:[
        '$scope','ErrorHandler',
        function($scope,ErrorHandler){
          $scope.errors=ErrorHandler.errors;
          $scope.closeAlert=function(index){
            ErrorHandler.remove(index);
          }
        }
      ]
		}
	}
	]
)
});
