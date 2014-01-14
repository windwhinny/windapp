define([
  'app',
  'service/dbObject'
],function(app){
app
.factory('CompanyQueryService',
[		'$resource','DBObject',
function($resource,DBObject){
var Company=$resource('/companies',
    {},
    {
      find:{
        url:'/companies/page/:currentPage',
        method: 'GET',
        params:{currentPage:1},
        isArray :true,
        responseType: 'json',
        transformResponse:DBObject.transformResponse
      },
      getCatalog:{
        url:'/companies/catalog',
        method:"GET",
        responseType:'json',
        isArray:true
      },
      getProperties:{
        url:'/companies/property',
        method:'GET',
        isArray:true,
        responseType:'json'
      },
    })
return Company;
}]
)
.factory('CompanyService',
  [   "$resource",'DBObject',
  function($resource,DBObject){
    var Company=$resource('/companies/:companyUid',
      {companyUid:'@uid'},
      {
        add:{
          method:'PUT',
          responseType:'json',
          url:'/companies',
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
        }
      })
    return Company;
  }]
)
});
