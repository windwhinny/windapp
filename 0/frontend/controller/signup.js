define([
  'app',
  'service/auth',
  'service/errorHandler'
],function(app){
app
.controller('SignupController',
	[		'$scope', '$rootScope', '$state', 'AuthService','ErrorHandler',
	function($scope,   $rootScope,   $state,   Auth, ErrorHandler) {
		$scope.type='signup';
		$scope.title='Signup';
		$scope.errors=[];
		var user=$scope.user=new Auth();
		$scope.signup=function(){
			user.$signup(function(resource,headers) {
        $rootScope.user=user;
        ErrorHandler.clear();
				$state.go('home');
			},function(resource,headers) {
        ErrorHandler.push(resource.data);
			})		
		}
	}
	]
)
});
