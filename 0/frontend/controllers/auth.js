window.app
.factory('authService', ['$window', '$resource','$location' , function($window,$resource,$location) {
	var User = $resource('/user/:userId',{
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
	var u={};
	for(i in $window.user){
		u[i]=$window.user[i];
	}
	delete $window.user;
	var user = new User(u);
	

	user.__proto__.signout=function(){
		user.$signout(function(resource,headers) {
			$location.path('/');
		},function(resource,headers) {
			
		})
	}

	return user;
}])
.controller('AuthController',['$scope','authService', '$location',function($scope,auth,$location){
	$scope.user=auth;
	$scope.$watch('user.uid', function() {
		if($scope.user.uid>=0 && $location.path()=='/signup'){
			$location.path('/');
		}
	});
}])