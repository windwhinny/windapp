define(['app'],function(app){

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
	'NUMBER_ALREADY_EXIST':'编号已经存在',
	'DROP_FILES_HERE':'将文件拖至此处',
	'RELEASE':'释放',
	'ONLY_FILES_ARE_ALLOWED':'只允许文件',
	'FAILED_TO_UPLOAD_THE_FILE':'上传失败',
	'UPLOADING':'上传中',
	'UPLOAD_IMAGE':'上传图片',
	'LOADING...':'读取中...',
	'CANCEL':'取消',
	'ORIGINAL':'原始',
	'IMAGE':'图像',
	'CREATE':'创建',
	'SIMILAR':'类似',
	'CONTACT': '联系人',
	'NAME':'名称',
	'COMPANY':'公司',
	'CLIENT_&_SUPPLIER':'厂商',
	'PHONE':'电话',
	'PHONE_NUMBER':'电话号码',
	'EMAIL':'邮箱',
	'EMPLOYEE':'人员',
	'ACTION':'操作',
	'POSITION':'职位',
	'DELETE':'删除'
}
app
.filter('i18n',
	[
	function() {
		return i18n;
	}]
)
var i18n=function (input){
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
window.i18n=i18n;
  
return
})
