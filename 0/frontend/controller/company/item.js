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
          '$scope', 'CompanyService', '$state','CompanyQueryService','ProductQueryService',
	function($scope,   Company,		        $state,ProductQuery,ProductQuery){
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
      var employees=company.employees;
      function isEmpty(arr){
        return arr&&arr.length;
      }
      for(var i=employees.length-1;i>=0;i--){
        if(!employees[i]||
          !employees[i].name&&
          !isEmpty(employees[i].phone)&&
          !isEmpty(employees[i].email)){
          employees.splice(i,1);
        }
      }

      company['$'+method](params)
        .catch(function(response){
          handleError($scope,response.data);
        })
        .then(function(){
          $state.go('company.item.view',{
            companyUid:$scope.company.uid
          })
        });
    }
    $scope.addEmptyProductCatalog=function(){
      $scope.company.productCatalogs=$scope.company.productCatalogs||[];
      $scope.company.productCatalogs.push({})
    }
    $scope.addEmptyEmployee=function(){
      $scope.company.employees=$scope.company.employees||[];
      $scope.company.employees.push({
        name:'',
        phone:[],
        email:[]
      })
    }
    $scope.getCatalogs=function(){
      ProductQuery.getCatalog(function(resource,headers){
        $scope.productCatalogs=resource;
      },function(resource,headers){
        handleError($scope,resource.data)
      })
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
      $state.go('company.item.edit',{companyUid:companyUid});
    }
  }
]
)
});
