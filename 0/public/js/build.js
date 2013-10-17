window.app = angular.module('windapp', 
	['ngResource', 
	'ui.bootstrap',
	'ui.router',
	'ngAnimate']);
;function ArticlesController($scope, $state, $location, Global, Articles) {
    $scope.global = Global;

    $scope.create = function() {
        var article = new Articles({
            title: this.title,
            content: this.content
        });
        article.$save(function(response) {
            $location.path("articles/" + response._id);
        });

        this.title = "";
        this.content = "";
    };

    $scope.remove = function(article) {
        article.$remove();

        for (var i in $scope.articles) {
            if ($scope.articles[i] == article) {
                $scope.articles.splice(i, 1);
            }
        }
    };

    $scope.update = function() {
        var article = $scope.article;
        if (!article.updated) {
            article.updated = [];
        }
        article.updated.push(new Date().getTime());

        article.$update(function() {
            $location.path('articles/' + article._id);
        });
    };

    $scope.find = function(query) {
        Articles.query(query, function(articles) {
            $scope.articles = articles;
        });
    };

    $scope.findOne = function() {
        Articles.get({
            articleId: $state.params.articleId
        }, function(article) {
            $scope.article = article;
        });
    };
};(function(){
window.app
.factory('AuthService', 
	[		'$resource',
	function($resource) {
		var Auth = $resource('/user/:userId',{
			userId:'@_id'
		},{
			signin:{
				method: 'POST',
				responseType: 'json',
				url: '/signin'
			},
			signup: {
				method: 'PUT',
				responseType: 'json',
				url: '/signup'
			},
			signout: {
				url: '/signout',
				method: 'POST',
				responseType: 'json'
			}
		});

		Auth.prototype.isAuthed=function(){
			if(this.uid>0){
				return true;
			}
			return false;
		};

		return Auth;
	}]
)
.factory('UserService',
	[		 'AuthService','$window', '$location', '$rootScope', '$state',
	function (Auth,			$window,   $location,	$rootScope,	  $state) {
		var u={};
		for(i in $window.user){
			u[i]=$window.user[i];
		}
		delete $window.user;
		var user = new Auth(u);

		$rootScope.user=user;
		$rootScope.$watch('user', function() {
			if($rootScope.user.isAuthed() && $state.is('signin')){
				$state.go('home');
			}
		});
		user.constructor.prototype.signout=function(){
			this.$signout(function(resource,headers) {
				$state.go('home');
			},function(resource,headers) {
				//TODO: handle error
			})
		};
		return user;
	}]
)
.controller('SigninController', 
	[		'$scope', '$rootScope', '$state', '$location', 'UserService',
	function($scope,   $rootScope,   $state,   $location,   user) {
		$scope.type='signin';
		$scope.errors=[];
		$scope.title='Login';
		function cnt(){
			var cnt=$state.params.continue||'/';
			$location.url(cnt);
		}

		$scope.signin=function(){
			$rootScope.user.$signin(function(resource,headers) {
				cnt();
			},function(resource,headers) {
				handleError(resource,$scope);
			})
		}

		if(user.isAuthed()){
			cnt();
		}
	}]
)
.controller('SignupController',
	[		'$scope', '$rootScope', '$state', 'AuthService',
	function($scope,   $rootScope,   $state,   Auth) {
		$scope.type='signup';
		$scope.title='Signup';
		$scope.errors=[];
		var user=$scope.user=new Auth();
		$scope.signup=function(){
			$rootScope.user.signup(function(resource,headers) {
				for (i in user) {
					$rootScope.uer[i]=user[i];
				};
				$state.go('home');
			},function(resource,headers) {
				handleError(resource,$scope);
			})		
		}
	}
	]
)


function handleError(resource,$scope){
	$scope.errors=[];
	var error=resource.data;
	$scope.errors.push(error);
}
})();window.app.controller('HeaderController', 
    [       '$scope', '$location', '$state',
    function($scope,   $location,   $state) {
    $scope.menu = [{
        "title": "Products",
        "state": "products.list"
    }];
    $scope.isSelected = function(item) {
        if ($state.is(item.state)) {
            return "active"
        } else return ""
    };
}]);;function IndexController($scope){
	
};(function(){
window.app
.factory('ProductsService',
	[		"$resource",
	function($resource){
		var Product=$resource('/products/:productId',
			{productId:'@uid'},
			{
				add:{
					method:'PUT',
					responseType:'json',
					url:'/products'
				},
				save:{
					method:'POST',
					responseType:'json'
				},
				delete:{
					method:'DELETE',
					responseType:'json'
				},
				get:{
					method:'GET',
					responseType:'json'
				},
				getSchema:{
					url:'/products/schema',
					method:'GET',
					responseType:'json'
				}
			})

		return Product;
	}]
)
.factory('ProductsQueryService',
	[		'$resource',
	function($resource){
	var Products=$resource('/products',
			{},
			{
				find:{
					url:'/products/page/:currentPage',
					method: 'GET',
					params:{currentPage:1},
					isArray :true,
					responseType: 'json'
				},
				getCatalog:{
					url:'/products/catalog',
					method:"GET",
					responseType:'json',
					isArray:true
				},
				getProperties:{
					url:'/products/property',
					method:'GET',
					isArray:true,
					responseType:'json'
				}

			})
	return Products;
	}]
)
.controller('AddProductController',
	[		'$scope', 'ProductsService', '$state',
	function($scope,   Product,			  $state){
		var product=$scope.product=new (Product);
		$scope.submit=function(){
			product.$add(function(resource,headers){
				product=resource;
				$state.go('products.item',{
					productId:product.uid
				})
			},function(resource,headers){
				$scope.errors=[resource.data];
			})
		}
	}]
)
.directive('field', function(){
	var directiveDefinitionObject = {
		scope:{
			model:'=',
			edittable:'='
		},
		template:'<span ng-show="!edittable">{{model}}</span>'
				+'<input type="{{type}}" ng-show="!edittable" ng-model="model">',
		restrict:'EC',
		link:function($scope, element, attrs, controller){
			console.log($scope);
		}
	}

	return directiveDefinitionObject;
})
.controller('ProductItemController',
	[		'$scope', 'ProductsService','$state', 'ProductsQueryService',
	function($scope,   Product,		     $state,   ProductQuery){
		var productId=$state.params.productId;
		$scope.schema = Product.getSchema();
		var product = $scope.product = Product.get({productId:productId},function(resource){
			$scope.product=resource;
		},function(resource,headers){
			handleError(resource.data);
		});

		$scope.getInputType=function(type){
			if(type==='string'){
				return 'text'
			}else if(!type){
				return 'text';
			}else{
				return type;
			}
		}

		$scope.toggleEditModel=function(){
			var edit=$scope.edit||false;

			if(edit){
				var custom=product.property.custom;
				for(var i=custom.length-1;i>=0;i--){
					if(!custom[i]||!custom[i].name||!custom[i].value){
						custom.splice(i,1);
					}
				}

				product
					.$save()
					.catch(function(response){
						handleError(response.data);
					})
					.then(function(){

					});
				$scope.edit=false;
			}else{

				$scope.edit=true;
			}
		}
		$scope.getCatalogs=function(){
			ProductQuery.getCatalog(function(resource,heanders){
				$scope.catalogs=resource;
			},function(resource,headers){
				handleError(resource.data)
			})
		}
		$scope.getProperties=function(){
			ProductQuery.getProperties({catalog:product.catalog},function(resource,headers){
				$scope.properties=resource;
			},function(resource,headers){
				handleError(resource.data)
			})
		}
		function handleError(err){
			$scope.errors=[err];
		}
	}
])
.controller('ProductsListController',
	[		'$scope', 'ProductsQueryService','$state','$location',
	function($scope,   ProductQuery,          $state,  $location){
		$scope.currentPage=$state.params.currentPage;
		$scope.refresh=function(page){
			page=page||1;

			$scope.products =  ProductQuery.find({currentPage:page},function(resource,headers){
				$scope.pageCount=headers('Page-Count')||1;
				$scope.pageStep=headers('Page-Step')||20;
				$scope.currentPage=headers('Page-Number')||1;
				$scope.productsCount=headers('Items-Count')||$scope.pageCount*$scope.pageStep;

				if(page>1)$location.path($state.href('products.list',{currentPage:$scope.currentPage}));
			});
		};
		$scope.productClicked=function(uid){
			$state.go('products.item',{productId:uid});
		}
	}
	]
)
})();(function(){
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

})()
;(function(){

var translation={
	'UNKNOWN_USER':'账号错误',
	'INVALID_PASSWORD': '密码错误',
	'ACCOUNT': '帐户',
	'PASSWORD': '密码',
	'SIGNIN': '登陆',
	'SIGNOUT': '退出',
	'LOGIN': '登陆',
	'LOGOUT': '退出',
	'SIGNUP': '注册',
	'SUBMIT': '提交',
	'PRODUCT':'产品',
	'PRODUCTS':'产品',
	'ADD':'添加',
	'NUMBER':'编号',
	'REFRESH': '刷新',
	'CREATED':'创建日期',
	'PROPERTY': '属性',
	'PICTURES':'图片',
	'PICTURE':'图片',
	'LENGTH': '长度',
	'WIDTH': '宽度',
	'HEIGHT': '高度',
	'WEIGHT': '重量',
	'EDIT': '编辑',
	'SAVE': '保存',
	'CATALOG': '类目',
	'NUMBER_ALREADY_EXIST':'编号已经存在'
}
window.app
.filter('i18n',
	[
	function() {
		return window.i18n;
	}]
)
window.i18n=function (input){
	if(!input){
		return;
	}
	if(typeof(input) != 'string'){
		throw new Error('input type must be string for i18n filter');
	}
	var output=translation[input.toUpperCase().replace(/ /g,'_')];
	if(!output){
		output=[];
		input.split(' ').forEach(function(word){
			output.push(translation[word.toUpperCase().replace(/ /g,'_')]||word);
		});
		output=output.join(' ');
	}

	return output;
}
})()
;window.bootstrap = function() {
    angular.bootstrap(document, ['windapp']);
    document.body.setAttribute('ng-app', 'windapp');
}
window.init = function() {
    window.bootstrap();
}
document.addEventListener("DOMContentLoaded",function(){
    //Fixing facebook bug with redirect
    if (window.location.hash == "#_=_") window.location.hash = "";

    //Then init the app
    window.init();
},false);;//Setting up route
window.app.config(['$stateProvider' , '$urlRouterProvider' ,
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
window.app.config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.html5Mode(true);
    }
]);
;//Articles service used for articles REST endpoint
window.app.factory("Articles", function($resource) {
    return $resource('/articles/:articleId', {
        articleId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
});
;;window.app.factory("Global", function() {
    var _this = this;
    _this._data = {
        user: window.user,
        authenticated: !! window.user
    };

    return _this._data;
});
