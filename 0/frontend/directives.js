(function(){
window.app
.directive('accountinput',
	[
	function() {
		var directiveDefinitionObject ={
			templateUrl: '/views/auth.html',
			restrict:'C',
			scope: {
				type: '='
			},
			replace: true
		}
		return directiveDefinitionObject ;
	}]
)
.directive('errors',
	[
	function(){
		var directiveDefinitionObject ={
			template:'<alert ng-repeat="err in errors" class="alert-error error">{{err.message | i18n}}</alert>',
			restrict:'EA',
		}
		return directiveDefinitionObject ;
	}
	]
)
.directive('upload',
  [
  function(){
    var directiveDefinitionObject = {
      restrict:'E',
      replace:true,
      template:
      	'<div class="upload" ng-class="status">'+
      		'<input type="file" ng-show="isTradition" multiple onchange="angular.element(this).scope().setFiles(this)">'+
      		'<div id="dropbox" ng-hide ="isTradition" ng-class="dropClass"><h1>{{ dropText | i18n}}</h1></div>'+
      		'<progress percent="progress" class="progress-striped "></progress>'+
      		'<errors></errors>'+
      	'</div>',

	    scope:{},
	    link:function($scope, element, attrs) {
	    	options=$scope.$parent.$eval(attrs.options);

	    	$scope.$parent.$watch(attrs.options,function(o){
	    		options=o;
	    	});

	    	function setDefault(){
	    		$scope.dropText = 'Drop files here';
			    $scope.status = '';
			    $scope.progressing = false;
	    	}

	    	$scope.isTradition=window.isMobile();
	    	if(!$scope.isTradition){
	    		setDefault();
	    		var dropbox=document.getElementById('dropbox');
	    		
		    	dropbox.addEventListener("dragenter", dragEnterLeave, false)
			    dropbox.addEventListener("dragleave", dragEnterLeave, false)
			    function dragEnterLeave(evt) {
			    	if($scope.progressing)return;
			        evt.stopPropagation()
			        evt.preventDefault()
			        $scope.$apply(setDefault)
			    }
			    dropbox.addEventListener("dragover", function(evt) {
			    	if($scope.progressing)return;
			        evt.stopPropagation()
			        evt.preventDefault()
			        var ok = evt.dataTransfer && evt.dataTransfer.types && evt.dataTransfer.types.indexOf('Files') >= 0;
			        
			        $scope.$apply(function(){
			        	if(!ok){
			            	$scope.status='error';
			            	$scope.dropText='Only files are allowed';
			            }else{
			            	$scope.dropText ='Release';
			            	$scope.status='pending';
			            }
			        })
			    }, false)
			    dropbox.addEventListener("drop", function(evt) {
			    	if($scope.progressing)return;
			        evt.stopPropagation()
			        evt.preventDefault()
			        $scope.$apply(setDefault)
			        var files = evt.dataTransfer.files
			        if (files.length > 0) {
			            $scope.$apply(function(){
			                $scope.files = []
			                for (var i = 0; i < files.length; i++) {
			                    $scope.files.push(files[i])
			                }
			            })
			        }
			        upload()
			    }, false)
	    	}
	    	
	    	$scope.setFiles=function(element){
	    		$scope.$apply(function($scope) {
			        $scope.files = []
			        for (var i = 0; i < element.files.length; i++) {
			          $scope.files.push(element.files[i])
			        }
			      	setDefault();
			      	
			    });

	    	}
	    	
	    	function upload(){
	    		var i=0;
	    		var count=$scope.files.length;
	    		$scope.errors=[];
	    		function done(){
	    			options.callback(results);
	    		}
	    		function _upload(){
	    			uploadFile(i,count,options.name, $scope.files[i],function(result){
	    				i++;
	    				options.callback(result);
	    				if(i>=count)return;
	    				_upload();
		        	})
	    		}
		        _upload();
	    	}

	    	function uploadFile(index,count,name,file,callback){
	    		var fd = new FormData()
		        
	    		fd.append(name, file)
		        for(var i in options.data){
		        	fd.append(i,options.data[i]);
		        }
		        var xhr = new XMLHttpRequest()
		        xhr.upload.addEventListener("progress", uploadProgress, false)
		        xhr.addEventListener("load", uploadComplete, false)
		        xhr.addEventListener("error", uploadFailed, false)
		        xhr.addEventListener("abort", uploadFailed, false)
		        xhr.open(options.method.toUpperCase(), options.action)
		        
		        xhr.send(fd);
		        

		        $scope.$apply(function(){
		    		$scope.dropText = 'Uploading'+((count>1)?' ('+index+'/'+count+')':'');
			        $scope.status='pending';
			        $scope.progressing = true;
		    	})
		        function uploadProgress(evt) {
			        $scope.$apply(function(){
			        	
			            if (evt.lengthComputable) {
			                $scope.progress = Math.round(evt.loaded * 100 / evt.total)
                      console.log(Math.round(evt.loaded * 100 / evt.total));
			            } else {
			                $scope.progress = 'unable to compute'
			            }
			        })
			    }

			    function uploadComplete(evt) {
			        $scope.$apply(function(){
			        	setDefault();
			        	if(xhr.status>=400){
			        		$scope.status="error";
			        		if(count>1){
			        			$scope.dropText='Some file failed';
			        			$scope.errors.push({
			        				message:file.name
			        			})
			        		}else{
			        			$scope.dropText="Failed to upload the file";
			        			$scope.errors=[{message:file.name}]
			        		}
			        		
			        	}else{
			        		$scope.status="success";
			        	}
			    	})
			        try{
			        	var result=JSON.parse(xhr.responseText);
			        }catch(e){
			        	callback(xhr.responseText)
			        	return;
			        }
			        callback(result);
			    }

			    function uploadFailed(evt) {
			    	$scope.$apply(function(){
			    		setDefault();
			    		$scope.dropText="Failed to upload the file";
				        $scope.status="error";
			    	})
			        
			    }

	    	}

	    	
	    }
	}
    return directiveDefinitionObject;
  }
  ]
)
window.isMobile=function(){
	return navigator.userAgent.match('Mobile');
}
})()
