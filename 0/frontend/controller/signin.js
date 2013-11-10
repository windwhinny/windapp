define([
  'app',
  'service/user'
],function(app){
app
.controller('SigninController', 
	[		'$scope', '$rootScope', '$state', '$location', 'UserService',
	function($scope,   $rootScope,   $state,   $location,   user) {
		$scope.type='signin';
		$scope.errors=[];
		$scope.title='Login';
		function cnt(){
			var cnt=$state.params.continue||'/';
			$location.url(cnt);
		}

		$scope.signin=function(){
			$rootScope.user.$signin(function(resource,headers) {
				cnt();
			},function(resource,headers) {
				handleError(resource,$scope);
			})
		}

		if(user.isAuthed()){
			cnt();
		}
	}]
)
function handleError(resource,$scope){
	$scope.errors=[];
	var error=resource.data;
	$scope.errors.push(error);
}

})
