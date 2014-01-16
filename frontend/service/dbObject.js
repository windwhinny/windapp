define([
  'angular',
  'app'
],function(angular,app){

/*
  Transform _id to id
 */
app
.factory('DBObject',
  [   
  function(){
    function transformRes(data){
      if(data._id){
        data.id=data._id;
        delete data._id;
      }

      return data
    }

    function transformReq(data){
      if(data.id){
        data._id=data.id;
        delete data.id;
      }

      return data
    }

    return { 
      transformRequest:[
        function(data){
          if(!data)return data;
          if(Array.isArray(data)){
            data.forEach(function(k,v){
              data[v]=transformReq(k);
            })
          }else{
            data=transformReq(data);
          }

          return data;
        },function(data){
          return angular.toJson(data);
        }
      ],
      transformResponse:[
        function(data){
          if(!data)return data;

          //for IE
          if(typeof(data)=="string"){
            data=JSON.parse(data);
          }
          
          if(Array.isArray(data)){
            data.forEach(function(k,v){
              data[v]=transformRes(k);
            })
          }else{
            data=transformRes(data);
          }

          return data
        },function(data){
          return data;
        }
        ]
    }
  }]
)
});
