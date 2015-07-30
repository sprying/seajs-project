基于seajs模块化的合并压缩
===


###合并压缩前

```
--Gruntfile.js	--打包脚本
--pagekage.json	--依赖的npm配置
--node-modules/	--下载的npm
--app/   //存放页面
--src/   //打包前目录
------seaConfig.js  //Seajs配置文件
------page/   //页面级js
------page/share/share.js
------page/share/share.css
------page/share/imgs/
------business    //业务模块
------business/wifi/
------business/wifi/wifi.js
------business/wifi/wifi.css
------business/wifi/imgs/	
------common/   //公共js，非seajs方式的js
------common/js/top/jquery.js
------common/js/bottom/sea.js
------common/css/reset.css
------common/imgs/
------widget/   //公共组件
------widget/dialog
------widget/dialog/Gruntfile.js
------widget/dialog/package.json
------widget/dialog/examples
------widget/dialog/src
------widget/dialog/src/dialog.js
------widget/dialog/src/dialog.css
------widget/dialog/src/imgs
```

###构建步骤
```
npm install
grunt build-widget
grunt build-page
```

###合并压缩后
```
......
--asset
-------seaConfig.js  
-------page   //合并后页面级js
-------page/share-（md5码）.js
-------page/share.css
-------page/imgs/
-------common
-------common/js/top/out_top.js	 //合并后的js
-------common/js/bottom/out_bottom.js	 //合并后的js
-------common/css/out_common.css	 //合并后的css
-------common/imgs	//合并后的imgs
-------widget
-------widget/dialog/0.0.1/dialog.js
-------widget/dialog/0.0.1/dialog.css
-------widget/dialog/0.0.1/imgs/
......

```
合并压缩时，将page依赖的business合并到一起，包括css、图像文件夹。

###开发使用注意
page、business、widget的文件夹里只能放一级功能目录，

    --page
    ------/setting/
    --------------/product_s1
    -------------------------/product_s1.js
    -------------------------/product_s1.css
    -------------------------/imgs
    --------------/product_s2
    -------------------------/product_s2.js
    -------------------------/product_s2.css
    -------------------------/imgs
    
    应该改成这样
    
    --page
    ------/product_s1
    -----------------/product_s1.js
    -----------------/product_s1.css
    -----------------/imgs
    ------/product_s2
    -----------------/product_s2.js
    -----------------/product_s2.css
    -----------------/imgs

###好处
1. 合并后减少了页面加载时资源请求数;
2. 公共组件可单独构建，跑测试用例;
3. 合并后的js名字根据其内容采用MD5命名，可避免设置缓存后改文件不能生效;
4. 针对js、css、图片进行压缩，减少资源请求大小;
5. 很方便切换构建之前与之后。开发过程中引用所有未合并压缩的资源，方便调试。

###背景
14年来到一个新团队，接触了前台展示型项目，用了seajs做了模块化开发，发现请求过多，考虑做合并压缩。

在用seajs官方推荐的spm时候，出现了诸多障碍。


    遵循seajs的js文件，可以require样式文件，使用spm构建后，js会合并css，css中指定的相对路径图片地址就有问题。

    spm是寄托在支付宝内部前端开发体系上，脱离这个体系使用有诸多限制。
在网上搜索seajs前端工程demo，虽然找到几个，但是没有一个满足我的需要，于是有了这个demo。


注：这个demo还是太简单，如果想要让开发们舒服的使用，还有许多要完善
