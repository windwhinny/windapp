define([
  'app',
  'service/product/query',
  'service/product/imageOptions',
  'directive/productList'
],function(app){
app 
.controller('ProductListController',
  [    '$scope', 'ProductQueryService','ProductService','$state','$location','ImageOptions',
  function($scope,   ProductQuery,    Product,      $state,  $location,ImageOptions){
    $scope.currentPage=$state.params.currentPage;
    $scope.onListRefresh=function(page){
      page=(page>0)?page:1;
      $location.path($state.href('products.list',{currentPage:page}));
    };
    $scope.listActions='delete';
    
    $scope.addProduct=function(){
      $state.go('products.add');
    }
  }
  ]
)
})
