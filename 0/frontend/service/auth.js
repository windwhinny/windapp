define([
  'app'
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
				url: '/user/signin'
			},
			signup: {
				method: 'PUT',
				responseType: 'json',
				url: '/user/signup'
			},
			signout: {
				url: '/user/signout',
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
});
