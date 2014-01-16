define([
  'app',
  'service/dbObject'
],function(app){
app
.factory('ProductQueryService',
[		'$resource','$location',"DBObject",
function($resource,$location,DBObject){
var Products=$resource('/products',
    {},
    {
      find:{
        url:'/products/page/:currentPage',
        method: 'GET',
        params:{currentPage:1},
        isArray :true,
        responseType: 'json',
        transformRequest:DBObject.transformRequest,
        transformResponse:DBObject.transformResponse
      },
      getCatalogs:{
        url:'/products/catalog',
        method:"GET",
        responseType:'json',
        isArray:true
      },
      getProperties:{
        url:'/products/property',
        method:'GET',
        isArray:true,
        responseType:'json'
      },
      getCostItems:{
        url:'/products/costItem',
        method:'GET',
        isArray:true,
        responseType:'json'
      },
      getImageUploadToken:{
        url:'/products/:productUid/image/token',
        params:{host:$location.protocol()+'://'+$location.host()+':'+$location.port()},
        method:'GET',
        responseType:'json',
      },
      removeImage:{
        url:'/products/:productUid/image/:imageName',
        method:'DELETE',
        responseType:'json'
      }

    })
return Products;
}]
)
});
