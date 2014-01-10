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
      var user=$rootScope.user;

      /*
        For firefox and IE, if you set "remember the password", next time you
        when login the account and password will show upon the input, but 
        the value  will not set to $rootScope.user. So we should get the DOM's
        value by ourself.
       */
      if(!user.account&&!user.password){
        var accountInput=document.getElementById('userAccount');
        var passwordInput=document.getElementById('userPassword');

        if(accountInput&&passwordInput){
          user.account=accountInput.value;
          user.password=passwordInput.value;
        }
      }

			user.$signin(function(resource,headers) {
        ErrorHandler.clear();
				cnt();
			},function(resource,headers) {
        ErrorHandler.push(resource.data)
			})
		}

		if(user.isAuthed()){
			cnt();
		}

    ErrorHandler.clear();
	}]
)
})
