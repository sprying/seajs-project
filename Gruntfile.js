var temp = [];
module.exports = function (grunt) {
    var transport = require('grunt-cmd-transport');
    var style = transport.style.init(grunt);
    var text = transport.text.init(grunt);
    var script = transport.script.init(grunt);
    var path = require('path');
    var zlib = require('zlib');
    var fs = require('fs');

    var MAP_TPL = grunt.file.read(path.join(__dirname, 'map.tpl'));

    // add md5-map to seajs config
    grunt.registerMultiTask('modifyConfig', function () {
        if (!this.data.filename) {
            grunt.log.warn('Missing config file option.');
            return;
        }
        if (!grunt.file.exists(this.data.filename)) {
            var code = '';
        } else {
            var code = grunt.file.read(this.data.filename);
        }
        code = code.replace(/\/\*map start\*\/[\s\S]*\/\*map end\*\//, '').trim();
        var mapArr = grunt.config.get('md5map');
        var mapObj = {};
        mapArr.forEach(function(item){
            mapObj[item[0]] =  item[1];
        });
        code = grunt.template.process(MAP_TPL, {data : {mapJSON : JSON.stringify(mapObj, null, '\t')}}) + '\n' + code;
        grunt.file.write(this.data.filename, code);
        grunt.log.writeln('File "' + this.data.filename + '" modified.');
    });

    grunt.registerMultiTask('spm-newline', function () {
        grunt.file.recurse(this.data.dist, function (f) {
            var extname = path.extname(f);
            if (extname === '.js' || extname === '.css') {
                var text = grunt.file.read(f);
                if (!/\n$/.test(text)) {
                    grunt.file.write(f, text + '\n');
                }
            }
        });
    });
    grunt.initConfig({
        pkg : grunt.file.readJSON("package.json"),
        ctrconcat:{
            base:{
                files:[{
                    src:['./src/css/reset.css','./src/css/base.css','./src/css/animate.css','./src/css/v2style.css','./src/css/inc_topnav.css','./src/css/header.css','./src/css/v2misc.css','./src/css/inc_socket.css','./src/css/footer.css'],
                    dest:'.build/css/out_common.css'
                },{
                    src:'./src/base/*.js',
                    dest:'.build/base/out_footer.js'
                },{
                    src:['./src/base/jquery-1.9.1.js','./src/base/json2.js','./src/base/util.js','./src/base/base.js','./src/base/inc_topnav.js','./src/base/jquery.cookie.js','./src/base/socket.io.js','./src/base/weibo.js'],
                    dest:'.build/common/scripts/head/out_head.js'
                }]
            }
        },
        transport : {
            options : {
                alias: '<%= pkg.spm.alias %>',
                debug:false,
                paths:['src']
            },

            page : {
                options : {
                    idleading : 'page/'
                },
                files : [
                {
                        cwd : './src/page/',
                        src : ['**/*.js'],
                        filter : 'isFile',
                        dest : '.build/page/'
                    }
                ]
            },
            business:{
                options : {
                    idleading : 'business/'
                },
                files:[{
                    cwd : './src/business/',
                    src : ['**/*.js'],
                    filter : 'isFile',
                    dest : '.build/business/'
                } ]
            },
            widget:{
                options : {
                    idleading : 'widget/'
                },
                files:[{
                    cwd : './src/widget/',
                    src : ['**/*.js'],
                    filter : 'isFile',
                    dest : '.build/widget/'
                } ]
            }
         },
        concat : {
            options : {
                include : 'relative',
                paths:['src']
            },
            page : {
                files: [
                    {
                        expand: true,
                        cwd: '.build/page',
                        src: ['**/*.js'],
                        dest: '.build/concat'
                    }
                ]
            }
        },
        concatFiles : {
            options: {
                include: 'relative',
                paths:['src']
            },
            app: {
                files: [
                    {
                        expand: true,
                        cwd: '.build/page',
                        src: ['**/*.js'],
                        dest: '.build/concat'
                    }
                ]
            }
        },
        concatCss : {
            options: {
                include: 'relative',
                separator: ' '
            },
            page: {
                files: [
                    {
                        expand: true,
                        cwd: '.build/page',
                        src: ['**/*.js'],
                        dest: '.build/concat'
                    }
                ]
            }
        },
        uglify : {
            page : {
                files: [
                    {
                        expand: true,
                        cwd: '.build/concat/',
                        src: ['**/*.js','!**/*-debug.js','!**/*-debug.css.js'],
                        dest: '.build/uglify'
                    }
                ]
            },
            other:{
                files:[
                    {
                        expand: true,
                        cwd: '.build/widget/',
                        src: ['**/*.js','!**/*-debug.js','!**/*-debug.css.js'],
                        dest: './assets/widget'
                    },{
                        expand: true,
                        cwd: './src/base/',
                        src: ['**/*.js'],
                        dest: './assets/base'
                    }
                ]
            }
        },
        md5:{
            options : {
                encoding : 'utf8',
                keepBasename : true,
                keepExtension : true,
                after : function (fileChanges) {
                    var map = [];
                    fileChanges.forEach(function (obj) {
                        obj.oldPath = obj.oldPath.replace('.build/uglify/', '');
                        obj.newPath = obj.newPath.replace('assets/html' + '/', '');
                        var temp = 'page/'+obj.oldPath;
                        temp = temp.substring(0,temp.length-3);
                        map.push([temp, 'page/'+obj.newPath]);
                    });
                    temp = temp.concat(map);
                    grunt.config.set('md5map', map);
                }
            },
            page : {
                files : [
                    {
                        expand : true,     // Enable dynamic expansion.
                        cwd : '.build/uglify',      // Src matches are relative to this path.
                        src : ['**/*.js','!**/*.css.js'], // Actual pattern(s) to match.
                        dest : 'assets/page'   // Destination path prefix.
                    }
                ]
            }
        },
        imagemin: {
            /* 压缩图片大小 */
            app: {
                options: {
                    optimizationLevel: 3 //定义 PNG 图片优化水平
                },
                files: [{
                    expand: true,
                    cwd: '.build/apps',
                    src: ['**/*.{png,jpg,jpeg}'], // 优化 img 目录下所有 png/jpg/jpeg 图片
                    dest: 'assets/apps' // 优化后的图片保存位置，覆盖旧图片，并且不作提示
                }]
            },
            other:{
                options: {
                    optimizationLevel: 3 //定义 PNG 图片优化水平
                },
                files: [{
                    expand: true,
                    cwd: './src',
                    src: ['**/*.{png,jpg,jpeg}','!apps/**/*.{png,jpg,jpeg}','!components/**/*.{png,jpg,jpeg}'], // 优化 img 目录下所有 png/jpg/jpeg 图片
                    dest: 'assets' // 优化后的图片保存位置，覆盖旧图片，并且不作提示
                }]
            }
        },
        cssmin:{
             app:{
                files:[{
                    cwd: '.build/concat',
                    src: ['**/*.css'],
                    expand: true,
                    dest: 'assets/apps'
                }]
            },
            other:{
                files:[{
                    cwd: './src',
                    src: ['**/*.css','!apps/**/*.css','!components/**/*.css'],
                    expand: true,
                    dest: './assets'
                }]
            }
        },
        copy:{
            fromTo:{
                files:[{
                    cwd: './src',
                    src: ['page/**/*.css','page/**/*.{png,jpg,jpeg}'],
                    expand: true,
                    dest: '.build'
                },{
                        cwd: './src',
                        src: ['business/**/*.css','business/**/*.{png,jpg,jpeg}'],
                        expand: true,
                        dest: '.build'
                }]
            }
        },
        modifyConfig : {
            target : {
                filename : 'seaConfig.js'
            }
        },
        clean : {
            spm : ['.build'],
            dist:['assets']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.task.renameTask('concat','ctrconcat');
    grunt.loadNpmTasks('grunt-cmd-transport');
    grunt.loadNpmTasks('grunt-cmd-concat');
    grunt.loadNpmTasks('grunt-cmd-concatFile');
    grunt.loadNpmTasks('grunt-cmd-concatCss');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-md5');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.registerTask('build-all', ['clean:spm','clean:dist','ctrconcat:base','uglify:base','cssmin:css','imagemin:img','transport:page','transport:business','copy:fromTo','concatCss:page', 'concat:page','concatFiles:page', 'uglify:page','md5:page','cssmin:page','imagemin:page','modifyConfig']);
    grunt.registerTask('build-widget', ['clean:widget','beginWidget:dist']);
    grunt.registerTask('build-all', ['clean:spm','clean:dist','transport:other','uglify:other','cssmin:other','imagemin:other','transport:app','transport:appComponent','copy:fromTo','concatCss:app', 'concat:app','concatFiles:app', 'uglify:min','md5:js','cssmin:app','imagemin:app','modify-config']);
};