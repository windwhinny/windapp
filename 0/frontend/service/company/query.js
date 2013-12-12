define([
  'app'
],function(app){
app
.factory('CompanyQueryService',
[		'$resource',
function($resource){
var Company=$resource('/companies',
    {},
    {
      find:{
        url:'/companies/page/:currentPage',
        method: 'GET',
        params:{currentPage:1},
        isArray :true,
        responseType: 'json'
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
  [   "$resource",
  function($resource){
    var Company=$resource('/companies/:companyUid',
      {companyUid:'@uid'},
      {
        add:{
          method:'PUT',
          responseType:'json',
          url:'/companies'
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
        }
      })
    return Company;
  }]
)
});
