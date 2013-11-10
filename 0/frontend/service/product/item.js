define([
  'app'
],function(app){
app
.factory('ProductItemService',
	[		"$resource",
	function($resource){
		var Product=$resource('/products/:productId',
			{productId:'@uid'},
			{
				add:{
					method:'PUT',
					responseType:'json',
					url:'/products'
				},
				save:{
					method:'POST',
					responseType:'json'
				},
				delete:{
					method:'DELETE',
					responseType:'json'
				},
				get:{
					method:'GET',
					responseType:'json'
				},
				getSchema:{
					url:'/products/schema',
					method:'GET',
					responseType:'json'
				}
			})

		return Product;
	}]
)
});