define([
  'app',
  'controller/product/imageViewer',
  'service/product/item',
  'service/product/query',
  'service/product/imageOptions',
  'directive/upload',
  'directive/field'
],function(app){
function handleError($scope,err){ $scope.errors=[err]; }

function getProduct(Product,uid,$scope,callback){
  return Product.get(
    {productUid:uid},
    function(resource){
      $scope.product=resource;
      callback&&callback(resource);
  },function(resource,headers){
    handleError($scope,resource.data);
  });
}

function getDefaultImage($scope){
  if($scope.product&&$scope.imageHost){
    var product=$scope.product;
    var defaultImage=product
      &&product.images
      &&product.images[0]
      &&product.images[0].name;
    if(defaultImage){
      $scope.defaultImage=$scope.getImageURL(defaultImage,200);
    }
  }
}

app
.controller('ProductItemController',[	
          '$scope', 'ProductItemService', '$state','ProductQueryService','$modal','ImageOptions',
	function($scope,   Product,		     $state,ProductQuery, $modal,ImageOptions){
    var productUid=$state.params.productUid;
    $scope.schema = Product.getSchema();
		var product = getProduct(Product,productUid,$scope,function(resource){
      getDefaultImage($scope)
    });

    ImageOptions.getHost(function(host){
      $scope.imageHost=host;
      getDefaultImage($scope); 
    })
    var getImageURL = $scope.getImageURL = ImageOptions.getImageURL;

    $scope.editModel=function(){
      $state.go('products.item.edit',{productUid:productUid});
    }

    $scope.addSimilarProduct=function(){
      $state.go('products.add',{similar:product.uid});   
    }

    $scope.viewImage=function(index){
      var image=product.images[index]; 
      if(!image||$scope.edit)return;      
       var modalInstance = $modal.open({
        templateUrl: '/views/products/imageViewer.html',
        controller: 'ImageViewerController',
        resolve: {
          image: function () {
            image.original=getImageURL(image.name);
            image.url=getImageURL(image.name,400);
            return image;
          },
          productNumber:function(){
            return product.number; 
          }
        }
      });
    }
		$scope.toggleEditModel=function(){
		}

	}
]
)
.controller('EditProductItemController',[
          '$scope', 'ProductItemService', '$state','ProductQueryService','ImageOptions',
	function($scope,   Product,		        $state,ProductQuery, ImageOptions){
    var productUid=$state.params.productUid;
    $scope.schema = Product.getSchema();
		var product = getProduct(Product,productUid,$scope,function(resource){
      getDefaultImage($scope)
    });

    ImageOptions.getHost(function(host){
      $scope.imageHost=host;
      getDefaultImage($scope); 
    })
    var getImageURL = $scope.getImageURL = ImageOptions.getImageURL;

    ProductQuery.getImageUploadToken({productUid:productUid},function(resource,headers){
      $scope.uploadOptions.data.token=resource.token;
      $scope.uploadAvailable=true;
    },function(resource,headers){
      handleError($scope,resource.data)
    })

    $scope.save=function(){
      var custom=product.property.custom;
      for(var i=custom.length-1;i>=0;i--){
        if(!custom[i]||!custom[i].name||!custom[i].value){
          custom.splice(i,1);
        }
      }
      product.$save({productUid:productUid})
        .catch(function(response){
          handleError($scope,response.data);
        })
        .then(function(){
          $state.go('products.item',{
            productUid:productUid
          })
        });
    }
		$scope.getProperties=function(){
			ProductQuery.getProperties({catalog:product.catalog},function(resource,headers){
				$scope.properties=resource;
			},function(resource,headers){
				handleError($scope,resource.data)
			})
		}
		$scope.getCatalogs=function(){
			ProductQuery.getCatalog(function(resource,headers){
				$scope.catalogs=resource;
			},function(resource,headers){
				handleError($scope,resource.data)
			})
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
          	handleError($scope,response.data);
        }
      )
      
    }
		$scope.getInputType=function(type){
			if(type==='string'){
				return 'text'
			}else if(!type){
				return 'text';
			}else{
				return type;
			}
		}
  }
])
});
