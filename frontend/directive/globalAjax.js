define([
  'app'
],function(app){
app
.directive('globalajax',
  [
  function(){
    return {
      restrict:'E',
      scope:{},
      template:'<span ng-style="style"></span>',
      controller:['$scope',function($scope){
        var ajaxCounter=0;
        var timer;
        var position=0;
        $scope.$on('ajaxStart',function(){
          ajaxCounter++;
          if(timer)return;
          timer=window.setInterval(function(){
            position+=2;
            if(position>100)position=0;
            $scope.$apply(function(){
              $scope.style={
                left:position?position+'%':0
              };
            })
          },100)
        })
        $scope.$on('ajaxEnd',function(){
          if(--ajaxCounter)return

          $scope.style={
            display:'none'
          };
          clearInterval(timer);
          timer=null;
        })
      }]
     }
   }]
)
});
