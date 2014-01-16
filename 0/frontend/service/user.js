define([
  'app',
  'service/errorHandler'
],function(app){
app
.factory('UserService',
	[		 'AuthService','$window', '$location', '$rootScope', '$state','ErrorHandler',
	function (Auth,			$window,   $location,	$rootScope,	  $state, ErrorHandler) {
		var u={};
		for(i in $window.user){
			u[i]=$window.user[i];
		}
		delete $window.user;
		var user = new Auth(u);

		$rootScope.user=user;
		$rootScope.$watch('user', function() {
			if($rootScope.user.isAuthed() && $state.is('signin')){
				$state.go('home');
			}
		});
		user.constructor.prototype.signout=function(){
			this.$signout(function(resource,headers) {
				$state.go('home');
			},function(resource,headers) {
        ErrorHandler.push(resource.data)
			})
		};
		return user;
	}]
)
});
