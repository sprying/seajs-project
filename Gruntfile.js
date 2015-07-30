module.exports = function (grunt) {
    var path = require('path');

    var MAP_TPL = '/*map start*/\
	seajs.production = true;\
	if(seajs.production){\
	    seajs.config({\
		alias : <%= mapJSON %>\
	    });\
	}\
	/*map end*/';
    var MAP_TPL2 = '/*map2 start*/\
	seajs.config({\
	    alias : <%= mapJSON %>,\
	    base : "/asset"\
	});\
	/*map2 end*/';

    grunt.registerMultiTask('beginWidget',function(){
        if(!this.data.dirs){
            grunt.log.warn('Missing config file option');
            return;
        }
        var cache = [],me =this;
        if(grunt.file.isDir(this.data.dirs)){
            var tasksdir = path.normalize(path.join(__dirname,this.data.dirs));
            var files = grunt.file.glob.sync('*', {cwd: tasksdir, maxDepth: 1});
            var pre_pwd = process.cwd();
            var file;
            function loop(file){
                if(!file) return;
                var root = path.join(tasksdir, file);
                var inner_grunt = require(path.normalize(path.join(__dirname,'node_modules/grunt/lib/grunt')));
                grunt.file.setBase(root);
                inner_grunt.loadNpmTasks = function(){};
                inner_grunt.tasks('default', {npm:[],tasks:[]}, function(){
                    grunt.file.setBase(pre_pwd);
                    var file = files.shift();
                    if(file){
                        loop(file);
                    }else{
                        var mapObj = {};
                        cache.forEach(function(item){
                            mapObj[item[0]] =  item[1];
                        });
                        var code = grunt.template.process(MAP_TPL2, {data : {mapJSON : JSON.stringify(mapObj, null, '\t')}}) + '\n';
                        grunt.file.write(path.normalize(path.join(pre_pwd,'asset',me.data.filename).replace(/\\/g,'/')),code);

                    }
                });
                var pkg = inner_grunt.config('pkg');
                var files1 = inner_grunt.file.glob.sync('*.js', {cwd: path.join(tasksdir,file,'src'), maxDepth: 1});
                files1.forEach(function(item){
                    cache.push([path.basename(item).match(/(.*)\.js/)[1],pkg.family+'/'+pkg.name+'/'+pkg.version+'/'+path.basename(item)]);
                });
            }
            var sortObj = this.data.sortObj;
            files.sort(function(prev,next){
                sortObj[prev] || (sortObj[prev] = 100);
                sortObj[next] || (sortObj[next] = 100);
                return sortObj[prev] - sortObj[next];
            });
            loop(file = files.shift());
        }
    });
    // add md5-map to seajs config
    grunt.registerMultiTask('modify-config', function () {
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

    grunt.initConfig({
        pkg : grunt.file.readJSON("package.json"),
        beginWidget:{
            dist:{
                dirs:'./src/widget',
                sortObj:{
                    underscore:1,
                    backbone:2,
                    up:3
                },
                filename:'seaConfig.js'
            }
        },
        ctrconcat:{
            common:{
                files:[{
                    src:['./src/common/css/reset.css','./src/common/css/font-awesome.css'],
                    dest:'.build/common/css/out_common.css'
                },{
                    src:'./src/common/js/bottom/*.js',
                    dest:'.build/common/js/bottom/out_footer.js'
                },{
                    src:['./src/common/js/top/jquery-1.9.1.js','./src/common/js/top/jquery-migrate.js',
                        './src/common/js/top/json2.js','./src/common/js/top/util.js','./src/common/js/top/base.js'],
                    dest:'.build/common/js/top/out_top.js'
                }]
            }
        },
        transport : {
            options : {
                alias: '<%= pkg.spm.alias %>',
                debug: true,
                paths:['./asset']
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
            }
        },
        concat : {
            options : {
                include : 'relative',
                paths:['./asset']
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
                        cwd: './src/common/',
                        src: ['**/*.js'],
                        dest: './asset/common'
                    }
                ]
            },
            common:{
                files:[{
                    expand:true,
                    cwd:'./.build/common/',
                    src:['**/*.js'],
                    dest:'./asset/common/'
                }]
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
                        obj.newPath = obj.newPath.replace('asset/page' + '/', '');
                        var temp = 'page/'+obj.oldPath;
                        temp = temp.substring(0,temp.length-3);
                        map.push([temp, 'page/'+obj.newPath]);
                    });
                    grunt.config.set('md5map', map);
                }
            },
            js : {
                files : [
                    {
                        expand : true,     // Enable dynamic expansion.
                        cwd : '.build/uglify',      // Src matches are relative to this path.
                        src : ['**/*.js','!**/*.css.js'], // Actual pattern(s) to match.
                        dest : 'asset/page'   // Destination path prefix.
                    }
                ]
            }
        },
        "imagemin": {
            /* 压缩图片大小 */
            page: {
                options: {
                    optimizationLevel: 3 //定义 PNG 图片优化水平
                },
                files: [{
                    expand: true,
                    cwd: '.build/page',
                    src: ['**/*.{png,jpg,jpeg}'], // 优化 img 目录下所有 png/jpg/jpeg 图片
                    dest: 'asset/page' // 优化后的图片保存位置，覆盖旧图片，并且不作提示
                }
                ]
            },
            common:{
                options: {
                    optimizationLevel: 3 //定义 PNG 图片优化水平
                },
                files: [{
                    expand: true,
                    cwd: './src',
                    src: ['common/**/*.{png,jpg,jpeg}'], // 优化 img 目录下所有 png/jpg/jpeg 图片
                    dest: 'asset' // 优化后的图片保存位置，覆盖旧图片，并且不作提示
                }
                ]
            },
            other:{
                options: {
                    optimizationLevel: 3 //定义 PNG 图片优化水平
                },
                files: [{
                    expand: true,
                    cwd: './src',
                    src: ['**/*.{png,jpg,jpeg}','!page/**/*.{png,jpg,jpeg}','!business/**/*.{png,jpg,jpeg}','!widget/**/*.{png,jpg,jpeg}'], // 优化 img 目录下所有 png/jpg/jpeg 图片
                    dest: 'asset' // 优化后的图片保存位置，覆盖旧图片，并且不作提示
                }
                ]
            }
        },
        "cssmin":{
            page:{
                files:[{
                    cwd: '.build/concat',
                    src: ['**/*.css'],
                    expand: true,
                    dest: 'asset/page'
                }]
            },
            other:{
                files:[{
                    cwd: './src',
                    src: ['**/*.css','!page/**/*.css','!business/**/*.css','!widget/**/*.css'],
                    expand: true,
                    dest: './asset'
                }]
            },
            common:{
                cwd: '.build/common/css',
                src: ['**/*.css'],
                expand: true,
                dest: 'asset/common/css'
            }
        },
        "copy":{
            fromTo:{
                files:[
                    {
                        cwd: './src',
                        src: ['business/**/*.css','business/**/*.{png,jpg,jpeg}'],
                        expand: true,
                        dest: '.build'
                    },{
                        cwd: './src',
                        src: ['page/**/*.css','page/**/*.{png,jpg,jpeg}'],
                        expand: true,
                        dest: '.build'
                    }                ]
            },
            css:{
                files:[{
                    cwd: '.build/concat',
                    src: '**/*.css',
                    expand: true,
                    dest: './asset/page'
                }]
            }
        },
        "modify-config" : {
            target : {
                filename : 'asset/seaConfig.js'
            }
        },
        clean : {
            spm : ['.build'],
            dist:['asset/*','!asset/widget','!asset/seaConfig.js'],
            widget:['asset/widget']
        }
    });

    grunt.loadNpmTasks('grunt-cmd-transport');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.task.renameTask('concat','ctrconcat');
    grunt.loadNpmTasks('grunt-cmd-concat');
    grunt.loadNpmTasks('grunt-cmd-concatfile');
    grunt.loadNpmTasks('grunt-cmd-concatcss');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-md5');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    /*
     *
     --src
     -----widget
     -----------dialog
     -----------dialog/src
     -----------dialog/package.json --版本信息等
     -----------dialog/Gruntfile.js --打包脚本
     -----------dialog/examples  --组件使用demo

     将功能块js合并压缩后，生成带版本的路径到seajs别名配置表中，其它js直接require别名。

     --asset
     --seaConfig.js --在配置文件中加入别名
     "dialog": "widget/dialog/0.0.1/dialog.js",
     -----widget
     -----------dialog
     -----------dialog/0.0.1 --版本号
     -----------dialog/0.0.1/dialog.js
     -----------dialog/0.0.1/dialog.css
     -----------dialog/0.0.1/imgs
     */
    grunt.registerTask('build-widget', ['clean:widget','beginWidget:dist']);

    /*
     * 1.清空.build
     * 2.清空asset
     * 3.合并common下指定的css和js
     * 4.压缩common下的指定的js
     * 5.压缩common下指定的css
     * 6.压缩common下所有图片
     * 7.压缩common下所有的js
     * 8.标准化page目录下页面模块
     *
     *      标准化transport:
     *      所有按照seajs模块化开发的js，transport成amd规范的格式，后面可放心压缩。
     *      要注意路径配置，容易出现使用合并压缩后的代码，资源加载了，却找不到执行路径。
     *
     * 9.标准化business目录下业务模块
     * 10.拷贝page和business下css和图片，以协同作下一步处理
     * 11.合并page依赖的business下的css文件，到page下css文件中
     * 12.合并page依赖的business下的js文件
     *
     *      合并
     *      任意的js可以合并， 当初的合并想法从seajs的spm来的，仅指页面级的js合并其它js，不包括widget组件间的合并。
     *      页面级Js开始解析依赖合并，只合并require相对路径的js，设置别名的依赖不合并。
     *
     * 13.合并page依赖的business下的图片文件夹
     * 14.压缩合并的js
     * 15.根据合并后js的md5值，重命名js文件，解决缓存问题
     * 16.压缩合并的css
     * 17.压缩合并的imgs文件夹
     * 18.修改seaConfig.js配置文件
     * */
    grunt.registerTask('build-page', ['clean:spm','clean:dist','ctrconcat:common','uglify:common','cssmin:common','imagemin:common','uglify:other','transport:page','transport:business','copy:fromTo','concatCss:page', 'concat:page','concatFiles:page', 'uglify:page','md5:js','cssmin:page','imagemin:page','modify-config','clean:spm']);

};
