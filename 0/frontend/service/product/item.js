define([
  'app',
  'service/dbObject'
],function(app){
app
.factory('ProductService',
	[		"$resource","DBObject",
	function($resource,DBObject){
		var Product=$resource('/products/:productUid',
			{productUid:'@uid'},
			{
				add:{
					method:'PUT',
					responseType:'json',
					url:'/products',
					transformRequest:DBObject.transformRequest,
        	transformResponse:DBObject.transformResponse
				},
				save:{
					method:'POST',
					responseType:'json',
					transformRequest:DBObject.transformRequest,
        	transformResponse:DBObject.transformResponse
				},
				delete:{
					method:'DELETE',
					responseType:'json'
				},
				get:{
					method:'GET',
					responseType:'json',
        	transformResponse:DBObject.transformResponse
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
