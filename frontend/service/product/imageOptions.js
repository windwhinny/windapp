define([
  'app'
],function(app){
app
.factory('ImageOptions',
  ['$http','$rootScope',
  function($http,$rootScope){
    var imageHost=null;
    var options={
      getHost:function(callback){
        if(imageHost){
          callback(imageHost);
        }else{
          $http({method:'GET',responseType:'json',url:'/products/imageHost'})
            .success(function(data, status, headers, config){
                imageHost=data.host;
                callback(imageHost);
            })
        }
      },
      getImagePath:function(name,size){
        var sizeFix=(size)?'?imageView/2/w/'+size+'/h/'+size+'':'';
        return (name)?'/'+name+sizeFix:'';
      },
      getImageURL:function(name,size){
        if(!imageHost){
          return null;
        }
        return imageHost+options.getImagePath(name,size); 
      }

    };
    return options;
  }
])
});
