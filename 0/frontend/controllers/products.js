(function(){
window.app
.factory('ProductsService',
	[		"$resource",
	function($resource){
		var Product=$resource('/products/:productId',
			{productId:'@uid'},
			{
				add:{
					method:'PUT',
					responseType:'json',
					url:'/products'
				},
				save:{
					method:'POST',
					responseType:'json'
				},
				delete:{
					method:'DELETE',
					responseType:'json'
				},
				get:{
					method:'GET',
					responseType:'json'
				},
				getSchema:{
					url:'/products/schema',
					method:'GET',
					responseType:'json'
				}
			})

		return Product;
	}]
)
.factory('ProductsQueryService',
	[		'$resource','$location',
	function($resource,$location){
	var Products=$resource('/products',
			{},
			{
				find:{
					url:'/products/page/:currentPage',
					method: 'GET',
					params:{currentPage:1},
					isArray :true,
					responseType: 'json'
				},
				getCatalog:{
					url:'/products/catalog',
					method:"GET",
					responseType:'json',
					isArray:true
				},
				getProperties:{
					url:'/products/property',
					method:'GET',
					isArray:true,
					responseType:'json'
				},
        getImageUploadToken:{
          url:'/products/:productUid/image/token',
          params:{host:$location.protocol()+'://'+$location.host()+':'+$location.port()},
          method:'GET',
          responseType:'json',
        },
        getImageHost:{
          url:'/products/imageHost',
          method:'GET',
          responseType:'json'
        },
              removeImage:{
              	url:'/products/:productUid/image/:imageName',
                method:'DELETE',
                responseType:'json'
              }

			})
	return Products;
	}]
)
.controller('AddProductController',
	[		'$scope', 'ProductsService', '$state',
	function($scope,   Product,			  $state){
		var product=$scope.product=new (Product);
		$scope.submit=function(){
			product.$add(function(resource,headers){
				product=resource;
				$state.go('products.item',{
					productId:product.uid
				})
			},function(resource,headers){
				$scope.errors=[resource.data];
			})
		}
	}]
)
.directive('field', function(){
	var directiveDefinitionObject = {
		scope:{
			model:'=',
			edittable:'='
		},
		template:'<span ng-show="!edittable">{{model}}</span>'
				+'<input type="{{type}}" ng-show="!edittable" ng-model="model">',
		restrict:'EC',
		link:function($scope, element, attrs, controller){
			console.log($scope);
		}
	}
	return directiveDefinitionObject;
})
.controller('ProductItemController',
	[		'$scope', 'ProductsService','$state', 'ProductsQueryService','$modal',
	function($scope,   Product,		     $state,   ProductQuery, $modal){
		var productId=$state.params.productId;
		$scope.schema = Product.getSchema();
		var product = $scope.product = Product.get({productId:productId},function(resource){
			$scope.product=resource;
		},function(resource,headers){
			handleError(resource.data);
		});
  
    ProductQuery.getImageHost(function(resource,headers){
      $scope.imageHost=resource.host;
    },function(resource,headers){
      handleError(resource.data)
    })
    
		$scope.getInputType=function(type){
			if(type==='string'){
				return 'text'
			}else if(!type){
				return 'text';
			}else{
				return type;
			}
		}
    var getImageURL=$scope.getImageURL=function(name,size){
      var sizeFix=(size)?'?imageView/2/w/'+size+'/h/'+size+'':'';
      return ($scope.imageHost&&name)?$scope.imageHost+'/'+name+sizeFix:'';
    }
    $scope.viewImage=function(index){
      var image=product.images[index]; 
      if(!image||$scope.edit)return;      
       var modalInstance = $modal.open({
        templateUrl: '/views/products/imageViewer.html',
        controller: 'ImageViewerController',
        resolve: {
          images: function () {
            product.images.forEach(function(image,i){
              image.url=getImageURL(image.name,500)
              image.original=getImageURL(image.name)
              if(index==i){
                 image.active=true; 
              }
            });
            return product.images;
          },
          productNumber:function(){
            return product.number; 
          }
        }
      });
    }
    $scope.removeImage=function(index){
      ProductQuery.removeImage(
        {
          productUid:product.uid,
          imageName:product.images[index]&&product.images[index].name
        },
        function(resource,headers){
        	product.images.splice(index,1);
        },
        function(resource,headers){
          	handleError(response.data);
        }
      )
      
    }
		$scope.toggleEditModel=function(){
			var edit=$scope.edit||false;

			if(edit){
				var custom=product.property.custom;
				for(var i=custom.length-1;i>=0;i--){
					if(!custom[i]||!custom[i].name||!custom[i].value){
						custom.splice(i,1);
					}
				}

				product
					.$save()
					.catch(function(response){
						handleError(response.data);
					})
					.then(function(){

					});
				$scope.edit=false;
			}else{
        ProductQuery.getImageUploadToken({productUid:product.uid},function(resource,headers){
        	$scope.uploadOptions.data.token=resource.token;
          $scope.uploadAvailable=true;
        },function(resource,headers){
          handleError(resource.data)
        })

				$scope.edit=true;
			}
		}

		$scope.uploadOptions={
			action:'http://up.qiniu.com/',
			method:'post',
			name:'file',
			data:{
			},
			callback:function(result){
				var images=product.images;
        if(Array.isArray(result)){
          images=result; 
        }
        $scope.$apply(function(){
          product.images=images;
        })
				
			}
		}
		$scope.getCatalogs=function(){
			ProductQuery.getCatalog(function(resource,headers){
				$scope.catalogs=resource;
			},function(resource,headers){
				handleError(resource.data)
			})
		}
		$scope.getProperties=function(){
			ProductQuery.getProperties({catalog:product.catalog},function(resource,headers){
				$scope.properties=resource;
			},function(resource,headers){
				handleError(resource.data)
			})
		}
		function handleError(err){
			$scope.errors=[err];
		}
	}
])
.controller('ProductsListController',
	[		'$scope', 'ProductsQueryService','$state','$location',
	function($scope,   ProductQuery,          $state,  $location){
		$scope.currentPage=$state.params.currentPage;
		$scope.refresh=function(page){
			page=page||1;
      $scope.loading=true;
			$scope.products =  ProductQuery.find({currentPage:page},function(resource,headers){
        $scope.loading=false;
				$scope.pageCount=headers('Page-Count')||1;
				$scope.pageStep=headers('Page-Step')||20;
				$scope.currentPage=headers('Page-Number')||1;
				$scope.productsCount=headers('Items-Count')||$scope.pageCount*$scope.pageStep;

				if(page>1)$location.path($state.href('products.list',{currentPage:$scope.currentPage}));
			});
		};
		$scope.productClicked=function(uid){
			$state.go('products.item',{productId:uid});
		}
	}
	]
)
.controller('ImageViewerController',
  ['$scope', '$modalInstance', 'images','productNumber',
  function($scope, $modalInstance, images, productNumber){
    $scope.images=images;
    $scope.productNumber=productNumber;
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };    
  }
])
})()