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
        requirejs: {
            compile: {
                options: {
                    baseUrl: "./frontend",
                    out: "./public/js/build.js",
                    name:"lib/almond",
                    include:["init"],
                    insertRequire:['init'],
                    wrap:true,
                    paths:{
                      angular:'lib/angular',
                      'angular-resource':'lib/angular-resource',
                      'angular-bootstrap':'lib/ui-bootstrap-tpls',
                      'angular-ui-router':'lib/angular-ui-router',
                      jquery:'lib/jquery'
                    },
                    shim:{
                      angular:{
                        exports:'angular'
                      },
                      'angular-resource':{
                        deps:['angular']
                      },
                      'angular-bootstrap':{
                        deps:['angular','jquery'] 
                      },
                      'angular-ui-router':{
                        deps:['angular'] 
                      },
                      jquery:{
                        exports:['jQuery']
                      }
                    },
                }
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
                tasks: ['nodemon',/*'karma',*/'watch']
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
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    //task(s).
    grunt.registerTask('default', ['concurrent:target']);
    grunt.registerTask('test', ['mochaTest']);
    grunt.registerTask('git','git commit and push',function(){
        var argv=process.argv;
        var message='';
        for(var i=0;i<argv.length;i++){
          if(argv[i]=='-m'){
            message=argv[++i];
          }
        }
        grunt.util.spawn({cmd:'git',args:['status']});
        function commit(message,done){
            grunt.util.spawn({
              cmd:'git',
              args:['commit','-am',message]
            },done)
        }
        function push(done){
            grunt.util.spawn({
              cmd:'git',
              args:['push']
            },done)
        }
        function callback(done){
          return function(err,result){
            if(err){
              console.error(err)
            }else{
              console.log(result);
              done&&done();
            }
          }
        }
        if(message){
          commit(message,callback(function(){
            push(callback());
          }))
        }else{
          console.log('nothing to commit ');
        }
    })
};


