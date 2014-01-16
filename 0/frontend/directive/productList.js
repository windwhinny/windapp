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

      /**
       * @param {Object} products The product list data.
       * @param {String} actions  Set how many actions the list will be use.
       *                          Available actions:
       *                          check, delete, edit
       *                          
       * @param {Array} selection Contain the products which the list select.
       * @param {Boolean} fixed   Whether the list can be refreshed.
       * @param {} refreshAtom    Can be anything. The list will refresh when it change.
       * @param {String} catalogSelector Set which catalog of products the list will be load.
       * @param {String} linkTarget Set what target the link will be open on.
       */
      scope:{
        products:'=?',
        actions:'=?',
        selection:'=?',
        fixed:'=?',
        refreshAtom:'=?',
        catalogSelector:'=?',
        linkTarget:'=?',
        search:'=',
        hide:'='
      },
      controller:['$scope', 'ProductQueryService','ProductService','$state','$location','ImageOptions',
        function($scope,   ProductQuery,    Product,      $state,  $location,ImageOptions){
          if($scope.fixed&&$scope.fixedProducts){
            $scope.products=$scope.fixedProducts;
          }
          if($scope.catalogSelector){
            $scope.catalogs=ProductQuery.getCatalogs()
          }

          /**
           * Regresh list, if page<0, set page to 1.
           * If {query} is set, it will use it as product search query.
           * 
           * @param  {Number} page
           * @param  {Object} query The search query
           * @return {[type]}
           */
          var refreshTable=$scope.refresh=function(page,query){
            if($scope.fixed)return;
            page=page||$scope.currentPage||1;
            $scope.loading=true;
            refreshing=true;

            var params={};
            query=query||{};
            if($scope.catalog){
              query.catalog=$scope.catalog;
            }
            params.query=query;
            params.currentPage=page;
            if($scope.search){
              params.search=$scope.search;
            }

            $scope.products =  ProductQuery.find(params,function(resource,headers){
              var products=resource;
              $scope.loading=false;
              /*
                Get the pagination info
               */
              
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
          
          /*
            Because when a product is select. The {product.selected} will be 
            set to true. So we will watch {products} to catch all select event.
           */
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

          /*
            When select all the products set their selected property to true.
           */
          $scope.$watch('selectAll',function(selected,old){
            var products=$scope.products;
            if(!products)return;
            products.forEach(function(v,k){
              v.selected=selected;  
            })
          });
          
          // as soon as refreshAtom change, no matter what it is, the table will be refresh.
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
          $scope.selectCatalog=function(catalog){
            $scope.catalog=catalog;
            refreshTable();
          };
          $scope.closeSearch=function(){
            $scope.search=null;
            refreshTable();
            $state.params.search="";
          }
        }
        ],
      link:function($scope, element, attrs){
      }
    }
    return directiveDefinitionObject;
  }]
)
});
