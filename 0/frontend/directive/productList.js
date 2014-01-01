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
        refreshAtom:'=?',
        catalogSelector:'=?'
      },
      controller:['$scope', 'ProductQueryService','ProductService','$state','$location','ImageOptions',
        function($scope,   ProductQuery,    Product,      $state,  $location,ImageOptions){
          if($scope.fixed&&$scope.fixedProducts){
            $scope.products=$scope.fixedProducts;
          }
          if($scope.catalogSelector){
            $scope.catalogs=ProductQuery.getCatalogs()
          }

          var refreshTable=$scope.refresh=function(page,query){
            if($scope.fixed)return;
            page=page||$scope.currentPage||1;
            $scope.loading=true;
            refreshing=true;
            query=query||{};
            query.currentPage=page;
            query.catalog=$scope.catalog;
            $scope.products =  ProductQuery.find(query,function(resource,headers){
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
            if($scope.loading)return;
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
