define([
  'app',
  'directive',
  'filter'
],function(app){
app
.factory('AuthService', 
	[		'$resource',
	function($resource) {
		var Auth = $resource('/user/:userId',{
			userId:'@_id'
		},{
			signin:{
				method: 'POST',
				responseType: 'json',
				url: '/signin'
			},
			signup: {
				method: 'PUT',
				responseType: 'json',
				url: '/signup'
			},
			signout: {
				url: '/signout',
				method: 'POST',
				responseType: 'json'
			}
		});

		Auth.prototype.isAuthed=function(){
			if(this.uid>0){
				return true;
			}
			return false;
		};

		return Auth;
	}]
)
.factory('UserService',
	[		 'AuthService','$window', '$location', '$rootScope', '$state',
	function (Auth,			$window,   $location,	$rootScope,	  $state) {
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
				//TODO: handle error
			})
		};
		return user;
	}]
)
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


function handleError(resource,$scope){
	$scope.errors=[];
	var error=resource.data;
	$scope.errors.push(error);
}
})