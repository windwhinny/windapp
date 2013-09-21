function HeaderController($scope, $location, $resource, Global) {
    $scope.global = Global;
	var User = $resource('/user/:userId',{
		id:'@_id'	
	},{
		auth:{
			method: 'POST',
			responseType: 'json',
			url: '/signin'
		}
	});
	$scope.user = new User();
	$scope.user.isAuthed=false;
    $scope.menu = [{
        "title": "Articles",
        "link": "articles"
    }, {
        "title": "Create New Article",
        "link": "articles/create"
    }];

    $scope.init = function() {

    };

    $scope.isSelected = function(item) {        
        if ($location.path() == "/"+item.link) {
            return "active"
        } else return ""
    }
	$scope.submit = function() {
		$scope.user.$auth(
			function() {
				$scope.user.isAuthed=true;		
			},
			function() {
				$scope.user.isAuthed=false;		
			}
		);
	}
}
