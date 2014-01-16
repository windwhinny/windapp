define([
  'app',
  'service/product/item',
  'service/errorHandler'
],function(app){
app
.controller('AddProductController',
	[		'$scope', 'ProductService', '$state','ErrorHandler',
	function($scope,   Product,			  $state,ErrorHandler){
		var product=$scope.product=new (Product);
    var params={};

    /*
      If we set similar params, the it will get the product which
      its uid is equal to {similar}, and clone it with the number we assign
      as a new product. 
     */
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
        ErrorHandler.push(resource.data);
			})
		}
	}]
)
});
