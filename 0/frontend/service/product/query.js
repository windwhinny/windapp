define([
  'app'
],function(app){
app
.factory('ProductQueryService',
[		'$resource','$location',
function($resource,$location){
var Products=$resource('/products',
    {},
    {
      find:{
        url:'/products/page/:currentPage',
        method: 'GET',
        params:{currentPage:1},
        isArray :true,
        responseType: 'json'
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
