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
    $scope.listOptions={
      currentPage:$state.params.currentPage,
      onRefresh:function(page){
        page=(page>0)?page:1;
        $location.path($state.href('products.list',{currentPage:page}));
      },
      actions:'delete'
    }
  }
  ]
)
})
