module.exports = function(config) {
  config.set({
    basePath: '../',
    frameworks: ['mocha'],
    browsers: ['Chrome'],
    files: [
        'frontend/*.js',
        'test/*.js'
    ],
    plugins: [
	  	// these plugins will be require() by Karma
	  	'karma-chrome-launcher',
	  	'karma-mocha'
	]
  });
};