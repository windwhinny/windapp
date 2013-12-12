define([
  'app',
  'service/company/query',
  'directive/upload',
  'directive/field'
],function(app){
function handleError($scope,err){ $scope.errors=[err]; }

function getCompany(Company,uid,$scope,callback){
  return Company.get(
    {companyUid:uid},
    function(resource){
      $scope.company=resource;
      callback&&callback(resource);
  },function(resource,headers){
    handleError($scope,resource.data);
  });
}
app
.controller('EditCompanyController',[
          '$scope', 'CompanyService', '$state','CompanyQueryService',
	function($scope,   Company,		        $state,ProductQuery ){
    var isNew=$state.params.new,
      method='save',
      params={};
    if(isNew){
      var company=$scope.company=new Company(),
        method='add',
        params={new:true};
      $scope.loaded=true;
    }else{
      var companyUid=$state.params.companyUid,
        company = getCompany(Company,companyUid,$scope),
        params={companyUid:companyUid};
      $scope.loaded=true;
    }
    
    $scope.save=function(){
      company['$'+method](params)
        .catch(function(response){
          handleError($scope,response.data);
        })
        .then(function(){
          $state.go('company.view',{
            companyUid:companyUid
          })
        });
    }
  }
])
.controller('CompanyController',[  
          '$scope', 'CompanyService', '$state',
  function($scope,   Company,        $state){
    var companyUid=$state.params.companyUid;
    var company = getCompany(Company,companyUid,$scope,function(){
      $scope.loaded=true;
    });

    $scope.editModel=function(){
      $state.go('company.edit',{companyUid:companyUid});
    }
  }
]
)
});
