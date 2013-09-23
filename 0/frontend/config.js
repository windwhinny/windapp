//Setting up route
window.app.config(['$stateProvider' , '$urlRouterProvider' ,
    function($stateProvider,$urlRouterProvider) {
        //$urlRouterProvider.
        //when('/articles', {
        //    templateUrl: '/views/articles/list.html'
        //}).
        //when('/articles/create', {
        //    templateUrl: '/views/articles/create.html'
        //}).
        //when('/articles/:articleId/edit', {
        //    templateUrl: '/views/articles/edit.html'
        //}).
        //when('/articles/:articleId', {
        //    templateUrl: '/views/articles/view.html'
        //}).
        //when('/', {
        //    templateUrl: '/views/index.html'
        //}).
        //when('/signout',{
        //    redirectTo:function() {
        //        window.location='/signout';
        //    }
        //}).
        //when('/signin',{
        //    redirectTo:function() {
        //        window.location='/signin'; 
        //    }
        //}).
        //otherwise({
        //    redirectTo: '/error/400'
        //});
		$urlRouterProvider
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
			templateUrl: '/views/index.html'
		})
		.state('signin', {
			url:'/signin',
			templateUrl:'/views/signin.html'
		})
		.state('signup', {
			url:'/signup',
			templateUrl:'/views/signup.html'
		})
		.state('signout', {
			url: '/signout',
			onEnter: ['authService', function(auth){
				auth.signout();
			}]
		})
		.state('articles',{
			url:'/articles',	
			abstract:true,
			template: '<div class="articles" ui-view></div>'
		})
		.state('articles.list', {
			url:'',
            templateUrl: '/views/articles/list.html'
		})
		.state('articles.create', {
			url:'/create',
			templateUrl: '/views/articles/create.html'
		})
		.state('articles.item', {
			url:'/:articleId',
			templateUrl: '/views/articles/view.html'
		})
		.state('articles.item.edit', {
			url:'/edit',
			views: {
				'@articles': {
					templateUrl: '/views/articles/edit.html'
				}
			}
		})
    }
]);

//Setting HTML5 Location Mode
window.app.config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.html5Mode(true);
    }
]);
