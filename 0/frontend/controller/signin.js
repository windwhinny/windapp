define([
  'app',
  'service/user',
  'service/errorHandler'
],function(app){
app
.controller('SigninController', 
	[		'$scope', '$rootScope', '$state', '$location', 'UserService','ErrorHandler',
	function($scope,   $rootScope,   $state,   $location,   user, ErrorHandler) {
		$scope.type='signin';
		$scope.title='Login';
		function cnt(){
			var cnt=$state.params.continue||'/';
			$location.url(cnt);
		}

		$scope.signin=function(){
			$rootScope.user.$signin(function(resource,headers) {
        ErrorHandler.clear();
				cnt();
			},function(resource,headers) {
        ErrorHandler.push(resource.data)
			})
		}

		if(user.isAuthed()){
			cnt();
		}
	}]
)
})
