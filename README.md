ys7
===

基于seajs模块化的合并压缩方案


项目里不采用cdn，没采用模块化开发部署，前后端没分离，js里面要require，组件结构要
```
    --dialog/
    --imgs
    --dialog.css
    --dialog.js
```
整个项目结构
--Gruntfile.js
--pagekage.json
--node-modules/
--apps/   //存放jsp文件
--src/   //打包前目录
--src/seaConfig.js  //配置目录
------modules/   //基础组件
------moduels/dialog/
------modules/dialog/src/dialog.js
------modules/dialog/src/dialog.css
------modules/dialog/src/imgs/
------business    //业务组件
------business/wifi/
------business/wifi/wifi.js
------business/wifi/wifi.css
------business/wifi/imgs/
------base/   //公共js，非seajs方式的js
------base/juqery/src/jquery.js
------base/juqery/src/sea.js
------page/   //页面js
------page/share.js
------page/share.css
------page/imgs/


