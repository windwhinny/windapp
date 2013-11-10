define([
  'app',
  'service/product/query',
  'service/product/imageOptions'
],function(app){
app 
.controller('ProductListController',
	[		'$scope', 'ProductQueryService','$state','$location','ImageOptions',
	function($scope,   ProductQuery,          $state,  $location,ImageOptions){
		$scope.currentPage=$state.params.currentPage;
		$scope.refresh=function(page){
			page=page||1;
      $scope.loading=true;
			$scope.products =  ProductQuery.find({currentPage:page},function(resource,headers){
        $scope.loading=false;
				$scope.pageCount=headers('Page-Count')||1;
				$scope.pageStep=headers('Page-Step')||20;
				$scope.currentPage=headers('Page-Number')||1;
				$scope.productsCount=headers('Items-Count')||$scope.pageCount*$scope.pageStep;

				if(page>1)$location.path($state.href('products.list',{currentPage:$scope.currentPage}));
			});
		};
		$scope.productClicked=function(uid){
			$state.go('products.item',{productId:uid});
		};
    ImageOptions.getHost(function(host){
      $scope.imageHost=host;
    });
    $scope.getCover=function(product){
      var image=product.images[0];
      if(!image)return "";
      
      return ImageOptions.getImagePath(image.name,100);
    }
 
     
	}
	]
)
})
