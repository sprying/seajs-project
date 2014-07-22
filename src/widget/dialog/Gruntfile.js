module.exports = function (grunt) {
    var pkg1 = grunt.file.readJSON("package.json");
     grunt.initConfig({
        pkg : grunt.file.readJSON("package.json"),
         transport: {
             js: {
                 options: {
                     alias: pkg1.spm.alias,
                     idleading:'<%= pkg.family %>/<%= pkg.name %>/<%= pkg.version %>/',
                     paths:['../../../asset/']
                 },
                 files: [{
                     expand: true,
                     cwd: 'src',
                     src: '**/*.js',
                     dest: '.build'
                 }]
             }
         },
         concat: {
             js: {
                 options: {
                     //include: 'all',
                     paths:['../../../asset/']
                 },
                 files: [{
                     expand: true,
                     cwd: '.build',
                     src: '**/*.js',
                     filter: function(filepath) {
                         return !/-debug\.js$/.test(filepath);
                     },
                     dest: '.tmp2'
                 }]
             }
         },
         uglify: {
             js: {
                 files: [{
                     expand: true,
                     cwd: '.tmp2',
                     src: '**/*.js',
                     dest: 'dist'
                 }]
             }
         },

        "copy":{
            imgCss:{
                files:[
                    {
                        cwd: './src',
                        src: ['**/*.css','**/*.{png,jpg,jpeg}'],
                        expand: true,
                        dest: 'dist'
                    }]
            },
            deploy:{
                files:[
                    {
                        cwd: './dist',
                        src: ['**/*'],
                        expand: true,
                        dest: '../../../asset/<%= pkg.family %>/<%= pkg.name %>/<%= pkg.version %>'
                    }]
            }
        },
        clean : {
            spm : ['.build','.tmp2'],
            dist:['dist']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-cmd-transport');
    grunt.loadNpmTasks('grunt-cmd-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.registerTask('default', [ 'clean:dist','transport', 'concat', 'uglify','copy:imgCss','copy:deploy','clean:spm']);
};