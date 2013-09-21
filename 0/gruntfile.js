module.exports = function(grunt) {
    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        folders: {
            frontend: {
                src: 'frontend',
                lib: 'public/js/lib',
                build: 'public/js',
                files: '<%= folders.frontend.src %>/**/*.js'
            },
            backend: {
                src: 'app',
                files: '<%= folders.backend.src %>/**/*.js'
            },
            test: {
                src: 'test',
                files: '<%= folders.test.src %>/**/*.js',
                karmaConfig: '<%= folders.test.src %>/karma.config.js'
            }
        },
        watch: {
            frontjs: {
                files: ['<%= folders.frontend.files %>'],
                tasks: ['concat','karma:unit:run']
            },
            backendjs: {
                files: ['<%= folders.backend.files %>'],
                tasks: ['test']
            },
            test: {
                files: ['test/**/*.js'],
                tasks: ['test'] //NOTE the :run flag
            },
            options: {
                spawn: false
            }
        },
        jshint: {
            files: ['gruntfile.js', '<%= folders.backend.files %>']
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
                        APP_PORT: 3000
                    },
                    cwd: __dirname
                }
            },
            exec: {
                options: {
                    exec: 'less'
                }
            }
        },
        concurrent: {
            target: {
                tasks: ['nodemon', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        mochaTest:{
            options: {
                reporter: 'spec'
            },
            src: ['test/**/*.js']
        },
        karma: {
          unit: {
            configFile: '<%= folders.test.karmaConfig %>',
            browsers: ['Chrome'],
            background: true,
            files: ['<%= folders.test.files %>']
          }
        },
        uglify: {
            src: {
                files: {
                    '<%= folders.frontend.build %>/build.mini.js': '<%= concat.src.dest %>'
                }
            },
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                        '<%= grunt.template.today("yyyy-mm-dd") %> */\n'
            }
        },
        concat: {
            options: {
                separator: ';',
                stripBanners: true
            },
            src: {
                src: ['<%= folders.frontend.files %>'],
                dest: '<%= folders.frontend.build %>/build.js'
            },
        },
        bower: {
            install:{
                options: {
                    targetDir: '<%= folders.frontend.lib %>',
                    layout: 'byType',
                    cleanTargetDir:true
                }
            }
        }
    });

    //Load NPM tasks 
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-karma');

    //task(s).
    grunt.registerTask('default', ['concurrent:target']);
    grunt.registerTask('test', ['mochaTest']);
    grunt.registerTask('mini', ['concat', 'uglify']);
    grunt.registerTask('install', ['bower', 'mini', 'test']);
};
