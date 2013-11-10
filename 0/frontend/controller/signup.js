define([
  'app',
  'service/auth'
],function(app){
app
.controller('SignupController',
	[		'$scope', '$rootScope', '$state', 'AuthService',
	function($scope,   $rootScope,   $state,   Auth) {
		$scope.type='signup';
		$scope.title='Signup';
		$scope.errors=[];
		var user=$scope.user=new Auth();
		$scope.signup=function(){
			$rootScope.user.signup(function(resource,headers) {
				for (i in user) {
					$rootScope.uer[i]=user[i];
				};
				$state.go('home');
			},function(resource,headers) {
				handleError(resource,$scope);
			})		
		}
	}
	]
)
});
