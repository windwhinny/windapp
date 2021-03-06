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
        get value(){
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

    $scope.getProductURL=function(uid){
      return $state.href('products.item',{productUid:uid});
    };
    
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

    $scope.showCost=function(){
      return (
        (product.components&&
        product.components.length)||
        (product.cost&&product.cost.length)
      )
    }

    $scope.getBestQuote=function(quotes){
      var bestQuote=false;
      quotes.forEach(function(v){
        if(bestQuote===false){
          bestQuote=v;
        }else if(v.price<bestQuote.price){
          bestQuote=v;
        }
      })
      return bestQuote;
    }

    $scope.getTotlePrice=function(){
      var totlePrice=0;

      product.components.forEach(function(comp){
        totlePrice+=comp.totlePrice;
      })

      product.cost.forEach(function(cost){
        var quote=$scope.getBestQuote(cost.quotes);

        totlePrice+=quote.price;
      })

      return totlePrice;
    }
	}
]
)

/*
  EditProductItemController is the controller for product edit page
 */
.controller('EditProductItemController',[
          '$scope', 'ProductService', '$state','ProductQueryService','ImageOptions','ErrorHandler','CompanyQueryService',
	function($scope,   Product,		        $state,ProductQuery, ImageOptions,ErrorHandler,CompanyQueryService){
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

      //if any quote in cost is empty, delete it
      
      product.cost.forEach(function(cost,i){
        cost.quotes.forEach(function(quote,i){
          if(!quote.company||!quote.price){
            cost.quotes.splice(i,1);
            return;
          }
          var company=quote.company
          quote.company=company.id||company._id;
        })

        if(!cost.quotes.length){
          product.cost.splice(i,1);
        }
      })

      //we only set the component's uid to product.components for saving
      var components=product.components||[];
      components && components.forEach(function(v,k){
        components[k]=v.id;
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
    $scope.getComponies=function(){
      CompanyQueryService.find({},function(resource,headers){
        $scope.companies=resource;
      },function(resource,headers){
        var err=resource.data;
        err.status=resource.status;
        ErrorHandler.push(err)
      })
    }
    $scope.getCostItems=function(){
      ProductQuery.getCostItems({catalog:product.catalog},function(resource,headers){
        $scope.costItems=resource;
      },function(resource,headers){
        var err=resource.data;
        err.status=resource.status;
        ErrorHandler.push(err);
      })
    }
		$scope.getProperties=function(){
			ProductQuery.getProperties({catalog:product.catalog},function(resource,headers){
				$scope.properties=resource;
			},function(resource,headers){
				var err=resource.data;
        err.status=resource.status;
        ErrorHandler.push(err)
			})
		}
		$scope.getCatalogs=function(){
			ProductQuery.getCatalogs(function(resource,headers){
				$scope.catalogs=resource;
			},function(resource,headers){
				var err=resource.data;
        err.status=resource.status;
        ErrorHandler.push(err)
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
          var err=resource.data;
          err.status=resource.status;
          ErrorHandler.push(err)
        }
      )
    };

    $scope.setAsFirstImage=function(index){
      var image=product.images.splice(index,1)[0];
      if(image){
        product.images.unshift(image);
      }
    };

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
