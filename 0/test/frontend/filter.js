describe('Filter ', function() {
	beforeEach(module('windapp'));
	describe('i18n', function(){
		it('should convert English to Chinese', function(){
			inject(function(i18n){
				expect(i18n('account')).toEqual('帐户');
			})
		})
	})
})