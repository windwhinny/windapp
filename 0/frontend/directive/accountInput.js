define([
  'app'
],function(app){
app
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
});
