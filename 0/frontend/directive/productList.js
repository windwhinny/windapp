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
        hide:'=?',
        refreshAtom:'=?'
      },
      controller:['$scope', 'ProductQueryService','ProductService','$state','$location','ImageOptions',
        function($scope,   ProductQuery,    Product,      $state,  $location,ImageOptions){
          var refresh=false;
          if($scope.fixed&&$scope.fixedProducts){
            $scope.products=$scope.fixedProducts;
          }
          var refreshTable=$scope.refresh=function(page){
            if($scope.fixed)return;
            page=page||$scope.currentPage||1;
            $scope.loading=true;

            refreshing=true;
            $scope.products =  ProductQuery.find({currentPage:page},function(resource,headers){
              refreshing=false;
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
                    };
                  });
                });
              };
              $scope.selection=selection;
            });
          };
          
          $scope.$watch('products',function(newVal,oldVal){
            if(!$scope.selection)return;
            if(refreshing)return;
            var selection=$scope.selection=[];
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
          
          // as soon as refreshAtom change, no matter what it is, the table will be refreshed
          $scope.$watch('refreshAtom',function(){
            refreshTable(); 
          });

          $scope.$watch('actions',function(){
            var actions=$scope.actions;
            $scope.showActions= actions&&(actions.delete||actions.edit);
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
          };
        }
        ],
      link:function($scope, element, attrs){
      }
    }
    return directiveDefinitionObject;
  }]
)
});
