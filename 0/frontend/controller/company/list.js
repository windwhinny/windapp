define([
  'app',
  'service/company/query'
],function(app){
app 
.controller('CompanyListController',
  [    '$scope', 'CompanyQueryService','$state','$location',
  function($scope,   CompanyQuery,          $state,  $location){
    $scope.currentPage=$state.params.currentPage;
    $scope.refresh=function(page){
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
      $state.go('company.edit',{
        new:true
      })
    }
    $scope.viewCompany=function(uid){
      $state.go('company.item.view',{
        companyUid:uid
      })
    }
  }
  ]
)
})
