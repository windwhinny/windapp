(function(){

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