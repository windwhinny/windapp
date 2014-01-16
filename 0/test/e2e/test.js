describe('Authenticate: ', function() {
	var user={
		account: 'wind',
		password: '5487',
		login: function() {
			input('user.account').enter(user.account);
			input('user.password').enter(user.password);
			element('.signin button[type="submit"]').click();
		}
	}
	
	beforeEach(function() {
		//incase no user login before the test
		browser().navigateTo('/signout');
		browser().navigateTo("/");
	});
	
	describe('Route', function() {
		it('should not access anywhere when not login', function() {
			expect(browser().window().path()).toEqual('/signin');
		})

		it('should have a "continue" param in URL when not login', function(){
			browser().navigateTo("/index");
			expect(browser().location().search()).toEqual({continue:'/index'});
		})
	})
	
	describe('Login Page', function() {
		it('should contain account and password input, submit button', function() {
			expect(element('.signin input[ng-model="user.account"]').count()).toEqual(1);
			expect(element('.signin input[ng-model="user.password"]').count()).toEqual(1);
			expect(element('.signin button[type="submit"]').count()).toEqual(1);
		})
		
		it('should not login with a incorrect account', function() {
			input('user.account').enter('qqq');
			input('user.password').enter(222);
			element('.signin button[type="submit"]').click();
			expect(browser().location().path()).toEqual('/signin');
			expect(element('.signin .error span').text()).toEqual('账号错误');
		})

		it('should login successfull with a correct account', function() {
			user.login();
			expect(browser().location().path()).toEqual('/');
		})
	})
	describe('Products Page', function(){
		beforeEach(function() {
			browser().navigateTo('/signout');
			browser().navigateTo('/products');
			user.login();
		});
		
		it('should load products list with url /products/page/1', function(){
			browser().navigateTo('/products/page/1');
			expect(element('.products .list table').count()).toBeGreaterThan(0);
		})

		it('should add a new product with a number', function(){
			browser().navigateTo('/products/create');
			input('product.number').enter('product-'+Math.random());
			element('input[type=submit]','submit button').click();
			expect(browser().location().path()).toMatch(/\/products\/\d+/);
		})

	})
})