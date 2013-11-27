define([
  'app',
  'service/product/item'
],function(app){
app
.controller('AddProductController',
	[		'$scope', 'ProductItemService', '$state',
	function($scope,   Product,			  $state){
		var product=$scope.product=new (Product);
		$scope.submit=function(){
			product.$add(function(resource,headers){
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
