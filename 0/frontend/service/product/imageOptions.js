define([
  'app'
],function(app){
app
.factory('ImageOptions',
  ['$http','$rootScope',
  function($http,$rootScope){
    var host=null;
    var options={
      getHost:function(callback){
        if(host){
          callback(host);
        }else{
          $http({method:'GET',responseType:'json',url:'/products/imageHost'})
            .success(function(data, status, headers, config){
                host=data.host;
                callback(host);
            })
        }
      },
      getImagePath:function(name,size){
        var sizeFix=(size)?'?imageView/2/w/'+size+'/h/'+size+'':'';
        return (name)?'/'+name+sizeFix:'';
      }

    };
    return options;
  }
])
});
