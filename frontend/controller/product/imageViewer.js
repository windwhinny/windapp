define([
  'app'
],function(app){
app
.controller('ImageViewerController',
  ['$scope', '$modalInstance', 'image','productNumber',
  function($scope, $modalInstance, image, productNumber){
    $scope.image=image;
    $scope.productNumber=productNumber;
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };    
  }
])
})
