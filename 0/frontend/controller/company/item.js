define([
  'app',
  'service/company/query',
  'service/errorHandler',
  'directive/upload',
  'directive/field'
],function(app){
function handleError($scope,err){ $scope.errors=[err]; }

function getCompany(Company,uid,$scope,ErrorHandler,callback){
  return Company.get(
    {companyUid:uid},
    function(resource){
      $scope.company=resource;
      callback&&callback(resource);
  },function(resource,headers){
    ErrorHandler.push(resource.data);
  });
}
app

/*
  Create new company and edit a company page use the same controller;
 */
.controller('EditCompanyController',[
          '$scope', 'CompanyService', '$state','CompanyQueryService','ProductQueryService','ErrorHandler',
	function($scope,   Company,		        $state,ProductQuery,ProductQuery,ErrorHandler){
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
        company = getCompany(Company,companyUid,$scope,ErrorHandler),
        params={companyUid:companyUid};
      $scope.loaded=true;
    }
    
    $scope.save=function(){
      var employees=company.employees;
      function isEmpty(arr){
        return arr&&arr.length;
      }

      /*
        If all of a empliyee's property is empty, delete it.
       */
      for(var i=employees.length-1;i>=0;i--){
        if(!employees[i]||
          !employees[i].name&&
          !isEmpty(employees[i].phone)&&
          !isEmpty(employees[i].email)){
          employees.splice(i,1);
        }
      }

      // save or add
      company['$'+method](params)
        .catch(function(response){
          ErrorHandler.push(resource.data);
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
        ErrorHandler.push(resource.data);
      })
    }
  }
])
.controller('CompanyController',[  
          '$scope', 'CompanyService', '$state','ErrorHandler',
  function($scope,   Company,        $state,ErrorHandler){
    var companyUid=$state.params.companyUid;
    var company = getCompany(Company,companyUid,$scope,ErrorHandler,function(){
      $scope.loaded=true;
    });

    $scope.editModel=function(){
      $state.go('company.item.edit',{companyUid:companyUid});
    }
  }
]
)
});
