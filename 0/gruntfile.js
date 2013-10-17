module.exports = function(grunt) {
    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        folders: {
            frontend: {
                src: 'frontend',
                lib: 'public/lib',
                build: 'public/js',
                files: '<%= folders.frontend.src %>/**/*.js'
            },
            backend: {
                src: 'app',
                files: '<%= folders.backend.src %>/**/*.js'
            },
            test: {
                src: 'test',
                //files: '<%= folders.test.src %>/**/*.js',
                frontendConfig: '<%= folders.config.src %>/karma.unit.config.js',
                e2eConfig: '<%= folders.config.src %>/karma.e2e.config.js',
                backendFiles: '<%= folders.test.src %>/backend/**/*.js',
                frontendFiles: '<%= folders.test.src %>/frontend/**/*.js',
                e2eFiles: '<%= folders.test.src %>/e2e/**/*.js'
            },
            config: {
                src: 'config'
            }
        },
        watch: {
            frontjs: {
                 files: ['<%= folders.frontend.files %>'],
                 tasks: ['concat','karma:e2e:run'/*,'karma:unit:run'*/]
            },
            backendjs: {
                files: ['<%= folders.backend.files %>'],
                tasks: ['test']
            },
            backendTest: {
                files: ['<%= folders.test.backendFiles %>'],
                tasks: ['test']
            },
            e2eTest: {
                files:['<%= folders.test.e2eFiles %>'],
                tasks: ['karma:e2e:run']
            },
            frontendTest: {
                files: ['<%= folders.test.frontendFiles %>'],
                tasks: ['concat','karma:unit:run']
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
            unit: {
                configFile: '<%= folders.test.frontendConfig %>',
                background: true
            },
            e2e: {
                configFile: '<%= folders.test.e2eConfig %>'

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
                    clean: true,
                    layout: 'byComponent',
                    verbose: true
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
    grunt.registerTask('noTest', ['concurrent:noTest']);
    grunt.registerTask('test', ['mochaTest']);
    grunt.registerTask('mini', ['concat', 'uglify']);
    grunt.registerTask('install', ['bower', 'mini', 'test']);
};
