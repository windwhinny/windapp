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
});
