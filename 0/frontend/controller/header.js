define([
  'app',
  'service/errorHandler'
],function(app){
app.controller('HeaderController', 
    [       '$scope', '$location', '$state','ErrorHandler',
    function($scope,   $location,   $state, ErrorHandler) {
    $scope.menu = [{
        "title": "Products",
        "state": "products.list"
    },{
        'title': 'Client & Supplier',
        'state': 'company.list'
    }];
    $scope.isSelected = function(item) {
        if ($state.is(item.state)) {
            return "active"
        } else return ""
    };
    $scope.search=function(searchText){
        $state.go('products.list',{search:searchText});
        $scope.searchText='';
    };
    $scope.errorHandler=ErrorHandler;
}]);
});
