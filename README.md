基于seajs模块化的合并压缩方案
===




项目里不采用cdn，没采用模块化开发部署，不要采用spm包管理，前后端没分离，js里面要require css，不要使用combo在线合并，组件结构要
```
    --dialog/
    --imgs
    --dialog.css
    --dialog.js
```
在上面这些要求下，于是乎我就想了一套方案，兼顾版本控制、开发与生产模式切换。当然没有张云龙的架构高大上。

整个项目结构

```
--Gruntfile.js
--pagekage.json
--node-modules/
--apps/   //存放jsp文件
--src/   //打包前目录
--src/seaConfig.js  //配置目录
------widget/   //基础模块
------widget/dialog/src/dialog.js
------widget/dialog/src/dialog.css
------widget/dialog/src/imgs/
------business    //业务模块
------business/wifi/
------business/wifi/wifi.js
------business/wifi/wifi.css
------business/wifi/imgs/
------base/   //公共js，非seajs方式的js
------base/juqery/src/jquery.js
------base/juqery/src/sea.js
------page/   //页面级js
------page/share.js
------page/share.css
------page/imgs/
```

合并压缩时，将page依赖的business合并到一起，包括css文件合并成一个，图像文件夹合并成一个。为重复利用缓存，widget基础模块不合并。页面公共的js、css发布时合并成一个文件。
```
--Gruntfile.js
--pagekage.json
--node-modules/
--apps/   //存放jsp文件
--assets/   //打包前目录
--assets/seaConfig.js  //配置目录
------widget/   //基础模块
------widget/dialog/0.0.1/dialog.js
------widget/dialog/0.0.1/dialog.css
------widget/dialog/0.0.1/imgs/

------base/   //公共js，非seajs方式的js
------base/juqery/src/out_common.js     //合并后的js

------page/   //合并后页面级js
------page/share-（md5码）.js
------page/share.css
------page/imgs/
```

这个package.json中有两个自己写的插件，
```
"grunt-cmd-concatcss":"~0.0.1",//合并依赖的css，spm里面合并css到js后，css图片路径采用相对路径有问题，于是自己写了个。
"grunt-cmd-concatfile":"0.0.1",//合并图像文件夹，配合上面插件使用
```

遗留问题，合并后的out_common版本控制，share.css版本控制。out_common如果采用combo的话，版本控制就没问题了。或者采用nodeJs修改Html引入文件名，但目前项目还不是Java + nodeJs + 前端架构。
至于share.css，如果page加上版本号，就没问题了。


希望接下来combo运维那边能通过，毕竟我已经成功地在mac上已经安装了nginx的combo模块。并且用Java写了个combo功能。
然后采用Java + nodeJs + 前端架构，将路由控制权拿到，restful、合并ajax数据请求。
还有目前debug模式还是不太好。感觉spm的debug还是更简洁。

哎，许多想做的东东因为没相关经验，上面没同意实施不了，并给出了结构要求。这里只能出来一个阉割的方案。目前整个项目前端团队，正按照这个结构在重构代码中...

spm3.0出来了，貌似结构约束更少，努力在下一个空挡时间尝试下...
张云龙的百度系方案，淘宝前后端分离，还有许多干货...

