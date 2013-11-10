define([
  'app',
  'controller/product/imageViewer',
  'service/product/item',
  'service/product/query',
  'service/product/imageOptions',
  'directive/upload',
  'directive/field'
],function(app){
app
.controller('ProductItemController',
	[		'$scope', 'ProductItemService','$state', 'ProductQueryService','$modal','ImageOptions',
	function($scope,   Product,		     $state,   ProductQuery, $modal,ImageOptions){
		var productId=$state.params.productId;
		$scope.schema = Product.getSchema();
		var product = $scope.product = Product.get({productId:productId},function(resource){
			$scope.product=resource;
      var defaultImage=resource
        &&resource.images
        &&resource.images[0]
        &&resource.images[0].name;
      if(defaultImage){
        $scope.defaultImage=getImageURL(defaultImage,200);
      }
		},function(resource,headers){
			handleError(resource.data);
		});
    
    ImageOptions.getHost(function(host){
      $scope.imageHost=host;
    })
    
    var getImageURL = $scope.getImageURL = function(name,size){
      return $scope.imageHost+ImageOptions.getImagePath(name,size); 
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
    $scope.getImagePath=ImageOptions.getImagePath;
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
});
