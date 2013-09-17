module.exports = function(grunt) {
    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        folders: {
            frontend: {
                src: 'frontend/src',
                lib: 'frontend/lib',
                build: 'public/js'
            }
        },
        watch: {
            js: {
                files: ['<%= folders.frontend.src %>'],
                options: {
                    tasks: ['concat']
                },
            }
        },
        jshint: {
            files: ['gruntfile.js', 'app/**/*.js']
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
                        PORT: 3000
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
        uglify: {
            src: {
                files: {
                    '<%= folders.frontend.build %>/build.mini.js': '<%= concat.src.dest %>'
                }
            },
            lib: {
                build: 'public/js/lib.mini.js',
                files: {
   //                 '<%= folders.frontend.build %>/lib.js': '<%= concat.lib.dest %>'
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
                src: ['<%= folders.frontend.src %>/**/*.js'],
                dest: '<%= folders.frontend.build %>/build.js'
            },
            lib: {
                src: ['<%= folders.frontend.lib %>/**/*.js'],
                dest: '<%= folders.frontend.build %>/lib.js'
            }
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

    //Making grunt default to force in order not to break the project.
    grunt.option('force', true);

    //Default task(s).
    grunt.registerTask('default', ['jshint', 'concurrent:target']);
    grunt.registerTask('test', ['mochaTest']);
    grunt.registerTask('mini', ['concat', 'uglify']);
//    grunt.registerTask('install', ['bower', 'mini', 'test']);
};
