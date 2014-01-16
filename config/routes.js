var config = require('./config'),
  userEntry=require('../app/entries/user'),
  productsEntry = require('../app/entries/products'),
  companiesEntry = require('../app/entries/companies'),
  express = require('express');
  
module.exports = function(app, passport) {
    //用户请求入口
    userEntry('/user',app,passport);

    //产品请求入口
    productsEntry('/products',app);

    //公司请求入口
    companiesEntry('/companies',app);
};
