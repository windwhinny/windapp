define([
  'app',
  'controller/signin',
  'controller/signup',
  'controller/product/addProduct',
  'controller/product/item',
  'controller/product/list',
  'controller/header'
],function(app){
app.config(['$stateProvider' , '$urlRouterProvider' ,
    function($stateProvider,$urlRouterProvider) {
		$urlRouterProvider
			.rule( function($injector,$location) {
				var auth=$injector.get('UserService');
				var $state=$injector.get('$state');

				if  ($location.path()==='/signin'){
					return false;
				}

				//user must be authenticated
				if(!auth.uid){
					
					$state.go('signin',{continue:$location.url()});
					//shows that the route is handled
					return true ;
				}else{
					//let the next handle it
					return false;
				}
			})
			.otherwise('/error/400');

		$stateProvider
		.state('error',{
			url:'/error',
			abstract:true,
			template:'<div class="error" ui-view></div>'
		})
		.state('error.status',{
			//limit the error code as http status code from 400 to 500
			url:'/{status:[4-5][0-9]{1,3}}',
			views:{
				'':{
					template:'<h1 class="error">{{status}}</h1>',
					controller: ['$stateParams',
					'$scope',function($stateParams, $scope) {
						$scope.status=$stateParams.status	
					}]
				}
			}
		})
		.state('home', {
			url:'/',
			templateUrl:'/views/index.html'
		})
		.state('signin', {
			url:'/signin?continue',
			templateUrl:'/views/auth.html',
			controller: 'SigninController',
			onEnter: ['$rootScope', function($rootScope){
				$rootScope.hideHeader=true;
			}],
			onExit : ['$rootScope', function($rootScope){
				$rootScope.hideHeader=false;
			}],
		})
		.state('signup', {
			url:'/signup',
			templateUrl:'/views/auth.html',
			controller: 'SignupController'
		})
		.state('signout', {
			url: '/signout',
			onEnter: ['UserService', function(user){
				user.signout();
			}]
		})
		.state('products',{
			url:'/products',
			abstract:true,
			template: '<div class="products span9" ui-view="@products"></div>'
		})
		.state('products.list', {
			url:'/page/:currentPage',
			onEnter:['$state',function($state){
				$state.params.currentPage=$state.params.currentPage||1;
			}],
			templateUrl: '/views/products/list.html'
		})
		.state('products.add', {
			url:'/create',
			templateUrl: '/views/products/add.html'
		})
		.state('products.item', {
			url:'/:productId',
			templateUrl: '/views/products/view.html'
		})
		.state('products.item.edit', {
			url:'/edit',
			views: {
				'@products': {
					templateUrl: '/views/products/edit.html'
				}
			}
		})
    }
]);

//Setting HTML5 Location Mode
app.config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.html5Mode(true);
    }
]);
})
