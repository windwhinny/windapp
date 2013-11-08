module.exports = function(grunt) {
    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        folders: {
            backend: {
                src: 'app',
                files: '<%= folders.backend.src %>/**/*.js'
            },
            test: {
                src: 'test',
                backendFiles: '<%= folders.test.src %>/backend/**/*.js',
            },
            config: {
                src: 'config'
            }
        },
        watch: {
            backendjs: {
                files: ['<%= folders.backend.files %>'],
                tasks: ['test']
            }
        },
        nodemon: {
            dev: {
                options: {
                    file: 'server.js',
                    args: [],
                    ignoredFiles: ['README.md', 'node_modules/**', '.DS_Store'],
                    watchedExtensions: ['js'],
                    watchedFolders: ['app', 'config'],
                    debug: true,
                    delayTime: 1,
                    env: {
                        APP_PORT: 3000,
                        NODE_ENV: 'development'
                    },
                    cwd: __dirname
                }
            }
        },
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            target: {
                tasks: ['nodemon','karma','watch']
            },
            noTest: {
                tasks: ['nodemon','watch']
            }
        },
        mochaTest:{
            options: {
                reporter: 'spec'
            },
            src: ['<%= folders.test.backendFiles %>']
        },
        karma: {
            options: {
                urlRoot: '/_karma_/'
            },
            e2e: {
                configFile: 'config/karma.e2e.config.js'

            }
        }
    });

    //Load NPM tasks 
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-requirejs');

    //task(s).
    grunt.registerTask('default', ['concurrent:target']);
    grunt.registerTask('test', ['mochaTest']);
};
