window.app.controller('HeaderController', ['$scope', '$location', function($scope,$location) {
    $scope.menu = [{
        "title": "Articles",
        "link": "articles"
    }, {
        "title": "Create New Article",
        "link": "articles/create"
    }];
    $scope.isSelected = function(item) {
        if ($location.path() == "/"+item.link) {
            return "active"
        } else return ""
    }
}]);