define([
  'app',
  'service/company/query'
],function(app){
app 
.controller('CompanyListController',
  [    '$scope', 'CompanyQueryService','CompanyService','$state','$location',
  function($scope,   CompanyQuery,     Company,     $state,  $location){
    $scope.currentPage=$state.params.currentPage;
    var refreshTable=$scope.refresh=function(page){
      page=page||1;
      $scope.loading=true;
      $scope.companies =  CompanyQuery.find({currentPage:page},function(resource,headers){
      	$scope.loading=false;
      	$scope.pageCount=headers('Page-Count')||1;
      	$scope.pageStep=headers('Page-Step')||20;
      	$scope.currentPage=headers('Page-Number')||1;
      	$scope.companiesCount=headers('Items-Count')||$scope.pageCount*$scope.pageStep;

      	if(page>1)$location.path($state.href('contact.list',{currentPage:$scope.currentPage}));
      });
    };
    $scope.addNew=function(){
      $state.go('company.item.edit',{
        new:true,
        companyUid:0
      })
    }
    $scope.getCompanyURL=function(uid){
      return $state.href('company.item.view',{
        companyUid:uid
      })
    }
    $scope.removeCompany=function(uid){
      Company.delete({companyUid:uid},function(){
        refreshTable($scope.currentPage);
      })
    }
  }
  ]
)
})
