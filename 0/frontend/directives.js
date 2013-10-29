(function(){
window.app
.directive('accountinput',
	[
	function() {
		var directiveDefinitionObject ={
			templateUrl: '/views/auth.html',
			restrict:'C',
			scope: {
				type: '='
			},
			replace: true
		}
		return directiveDefinitionObject ;
	}]
)
.directive('errors',
	[
	function(){
		var directiveDefinitionObject ={
			template:'<alert ng-repeat="err in errors" class="alert-error error">{{err.message | i18n}}</alert>',
			restrict:'EA',
		}
		return directiveDefinitionObject ;
	}
	]
)
.directive('uplaod',
  [
  function(){
    var directiveDefinitionObject = {
      
    }
    
    return directiveDefinitionObject;
  }
  ]
)

})()
