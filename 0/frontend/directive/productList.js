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
      scope:{
        products:'=?',
        actions:'=?',
        selection:'=?',
        fixed:'=?',
        onRefresh:'&',
        hide:'=?'
      },
      controller:['$scope', 'ProductQueryService','ProductService','$state','$location','ImageOptions',
        function($scope,   ProductQuery,    Product,      $state,  $location,ImageOptions){
          if($scope.fixed&&$scope.fixedProducts){
            $scope.products=$scope.fixedProducts;
          }
          var refreshTable=$scope.refresh=function(page){
            if($scope.fixed)return;
            page=page||$scope.currentPage||1;
            $scope.loading=true;
            $scope.products =  ProductQuery.find({currentPage:page},function(resource,headers){
              var products=resource;
              $scope.loading=false;
              $scope.pageCount=headers('Page-Count')||1;
              $scope.pageStep=headers('Page-Step')||20;
              $scope.currentPage=headers('Page-Number')||1;
              $scope.productsCount=headers('Items-Count')||$scope.pageCount*$scope.pageStep;
              $scope.onRefresh&&$scope.onRefresh($scope.currentPage);

              var selection=$scope.selection;
              if(selection){
                products.forEach(function(p){
                  selection.forEach(function(slec){
                    if(slec.uid==p.uid){
                      p.selected=true;
                    }
                  })
                })
              }

            });
          };
          
          $scope.$watch('products',function(newVal,oldVal){
            var selection=$scope.selection;
            if(!selection)return;
            selection.splice(0,selection.length);
            $scope.products.forEach(function(product){
              if(product.selected){
                selection.push(product);
              }
            })
          },true)
          
          $scope.selectAll=false;
          $scope.$watch('selectAll',function(selected,old){
            var products=$scope.products;
            if(!products)return;
            products.forEach(function(v,k){
              v.selected=selected;  
            })
          });

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
          $scope.editProduct=function(uid){
            $state.go('products.item.edit',{productUid:uid});
          }
          $scope.removeProduct=function(uid){
          	Product.remove({productUid:uid},function(){
          		refreshTable($scope.currentPage);
          	})
          }
        }
        ],
      link:function($scope, element, attrs){
        $scope.refresh($scope.currentPage);
      }
    }
    return directiveDefinitionObject;
  }]
)
});
