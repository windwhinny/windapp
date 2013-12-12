define([
  'app',
  'service/product/item'
],function(app){
app
.controller('AddProductController',
	[		'$scope', 'ProductService', '$state',
	function($scope,   Product,			  $state){
		var product=$scope.product=new (Product);
    var params={};
    if($state.params.similar){
      product.similar=$state.params.similar;
    }
		$scope.submit=function(){
			product.$add(params,function(resource,headers){
				product=resource;
				$state.go('products.item',{
					productUid:product.uid
				})
			},function(resource,headers){
				$scope.errors=[resource.data];
			})
		}
	}]
)
});
