define([
  'app'
],function(app){
app
.directive('productlist',
  [
  function(){
    var directiveDefinitionObject = {
      templateUrl:'/views/deritives/list.html',
      restrict:'E',
      controller:['$scope', 'ProductQueryService','ProductService','$state','$location','ImageOptions',
        function($scope,   ProductQuery,    Product,      $state,  $location,ImageOptions){
          var refreshTable=$scope.refresh=function(page){
            page=page||$scope.currentPage||1;
            $scope.loading=true;
            $scope.products =  ProductQuery.find({currentPage:page},function(resource,headers){
              $scope.loading=false;
              $scope.pageCount=headers('Page-Count')||1;
              $scope.pageStep=headers('Page-Step')||20;
              $scope.currentPage=headers('Page-Number')||1;
              $scope.productsCount=headers('Items-Count')||$scope.pageCount*$scope.pageStep;
              $scope.onRefresh&&$scope.onRefresh($scope.currentPage);
            });
          };
          $scope.getProductURL=function(uid){
            return $state.href('products.item',{productUid:uid});
          };
          ImageOptions.getHost(function(host){
            $scope.imageHost=host;
          });
          $scope.getCover=function(product){
            var image=product.images[0];
            if(!image)return "";
            
            return ImageOptions.getImagePath(image.name,100);
          }
          $scope.addProduct=function(){
            $state.go('products.add')
          }
          $scope.removeProduct=function(uid){
          	Product.remove({productUid:uid},function(){
          		refreshTable($scope.currentPage);
          	})
          }
        }
        ],
      link:function($scope, element, attrs){
        var actions={};
        if(attrs.options){
          /*
          options can contain such params:
          {
            linkTarget:'',
            currentPage:'',
            actions:''.
            onRefreash:function(page){}
          }
          */
          var options=$scope.$eval(attrs.options);
          
          if(options.actions){
            options.actions=options.actions.split(' ');              
          }

          for(var i in options){
            $scope[i]=options[i];
          }


        }
        $scope.refresh($scope.currentPage)
      }
    }
    return directiveDefinitionObject;
  }]
)
});
