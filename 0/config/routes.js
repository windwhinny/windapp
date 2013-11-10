var config = require('./config'),
  userEntry=require('../app/entries/user'),
  productsEntry = require('../app/entries/products'),
  express = require('express');
module.exports = function(app, passport) {
    //handle get json request
    userEntry('/user',app,passport);
    productsEntry('/products',app);
};
