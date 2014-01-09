define([
  'app',
  'controller/product/imageViewer',
  'service/product/item',
  'service/product/query',
  'service/product/imageOptions',
  'service/errorHandler',
  'directive/upload',
  'directive/field',
  'directive/productList'
],function(app){

/**
 * Get the product info with uid, if error occured, set 
 * it on $scope, if no error ,callback.
 * 
 * @param  {Object}   Product Product service
 * @param  {Number}   uid     uid of product
 * @param  {Object}   $scope  controller scope
 * @param  {Object}   ErrorHandler The ErrorHandler instance
 * @param  {Function} callback
 * @return 
 */
function getProduct(Product,uid,$scope,ErrorHandler,callback){
  var product= Product.get(
    {productUid:uid},
    function(resource){
      product.components=product.components||[];
      $scope.product=resource;
      callback&&callback(resource);
  },function(resource,headers){
    ErrorHandler.push(resource.data)
  });
  product.components=[];
  return product;
}

/**
 * Get default image of the product, 
 * general the url for it, return the url.
 * @param  {[type]} product
 * @param  {[type]} $scope
 * @return {[type]}
 */
function getDefaultImage(product,$scope){
  if(product&&$scope.imageHost){
    var defaultImage=product
      &&product.images
      &&product.images[0]
      &&product.images[0].name;
    if(defaultImage){
      return $scope.getImageURL(defaultImage,200);
    }
  }
}

/*
  ProductItemController is the controller for product view page
 */
app
.controller('ProductItemController',[	
          '$scope', 'ProductService', '$state','ProductQueryService','$modal','ImageOptions','ErrorHandler',
	function($scope,   Product,		     $state,ProductQuery, $modal,ImageOptions,ErrorHandler){
    
    /*
      We get the product's uid from $state.params
     */
    var productUid=$state.params.productUid;
    
		var product = getProduct(Product,productUid,$scope,ErrorHandler,function(resource){

      //general default image of the product url
      $scope.defaultImage=getDefaultImage(product,$scope);

      // The default product property we will show up on view page
      $scope.properties=([{
        name:'catalog',
        value:function(){
          return $scope.product.catalog;
        }
      },{
        name:'size',
        get value(){
          function getSize(){
            var width=product.property.default.width;
            var height=product.property.default.height;
            var length=product.property.default.length;

            var size=[];
            [length,width,height].forEach(function(v,k){
              if(v){
                size.push(v);
              }
            })
            return size.length?size.join("×")+' cm':0;
          };
          return getSize();
        },
        unit:'cm'
      },{
        name:"weight",
        get value (){
          return $scope.product.property.default.weight;
        },
        unit:'g'
      }]).concat(product.property.custom);

    });

    ImageOptions.getHost(function(host){
      $scope.imageHost=host;
      $scope.defaultImage=getDefaultImage(product,$scope)
    })

    //This function can general a url by image name
    var getImageURL = $scope.getImageURL = ImageOptions.getImageURL;

    $scope.editModel=function(){
      $state.go('products.item.edit',{productUid:productUid});
    }

    $scope.addSimilarProduct=function(){
      $state.go('products.add',{similar:product.uid});   
    }

    //show up a modal for viewing image
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
	}
]
)

/*
  EditProductItemController is the controller for product edit page
 */
.controller('EditProductItemController',[
          '$scope', 'ProductService', '$state','ProductQueryService','ImageOptions','ErrorHandler',
	function($scope,   Product,		        $state,ProductQuery, ImageOptions,ErrorHandler){
    var productUid=$state.params.productUid;
    $scope.schema = Product.getSchema();
		var product = getProduct(Product,productUid,$scope,ErrorHandler,function(resource){
      $scope.defaultImage=getDefaultImage(product,$scope)
    });

    ImageOptions.getHost(function(host){
      $scope.imageHost=host;
      $scope.defaultImage=getDefaultImage(product,$scope)
    })
    var getImageURL = $scope.getImageURL = ImageOptions.getImageURL;

    ProductQuery.getImageUploadToken({productUid:productUid},function(resource,headers){
      $scope.uploadOptions.data.token=resource.token;
      $scope.uploadAvailable=true;
    },function(resource,headers){
      ErrorHandler.push(resource.data)
    })

    $scope.save=function(){

      //if the custom property is empty, delete it
      var custom=product.property.custom;
      for(var i=custom.length-1;i>=0;i--){
        if(!custom[i]||!custom[i].name||!custom[i].value){
          custom.splice(i,1);
        }
      }
      
      //we only set the component's uid to product.components for saving
      var components=product.components||[];
      components && components.forEach(function(v,k){
        components[k]=v._id;
      });
      product.components=components;

      product.$save({productUid:productUid})
        .catch(function(response){
          ErrorHandler.push(resource.data)
        })
        .then(function(){

          // go to view page
          $state.go('products.item',{
            productUid:productUid
          })
        });
    }
		$scope.getProperties=function(){
			ProductQuery.getProperties({catalog:product.catalog},function(resource,headers){
				$scope.properties=resource;
			},function(resource,headers){
				ErrorHandler.push(resource.data)
			})
		}
		$scope.getCatalogs=function(){
			ProductQuery.getCatalogs(function(resource,headers){
				$scope.catalogs=resource;
			},function(resource,headers){
				ErrorHandler.push(resource.data)
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
          ErrorHandler.push(resource.data)
        }
      )
    };
    $scope.setAsFirstImage=function(index){
      var image=product.images.splice(index,1)[0];
      if(image){
        product.images.unshift(image);
      }
    }
		$scope.getInputType=function(type){
			if(type==='string'){
				return 'text'
			}else if(!type){
				return 'text';
			}else{
				return type;
			}
		};

    
    $scope.selectorActions={
      check:true
    };
  }
])
});
