define([
  'app'
],function(app){
app
.directive('errors',
	[
	function(){
		var directiveDefinitionObject ={
			template:'<alert ng-repeat="err in errors" class="alert-error error">{{err.message | i18n}}</alert>',
			restrict:'EA',
      replace:true
		}
		return directiveDefinitionObject ;
	}
	]
)
});
