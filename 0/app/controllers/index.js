/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    config = require('../../config/config');

exports.render = function(req, res) {
    res.render('index', {
        user: req.user ? JSON.stringify(req.user) : "null",
        script: (config.env=='production')?'/js/build.js':'/js/lib/require.js'
    });
};
