/*map start*/
seajs.production = true;
if(seajs.production){
    seajs.config({
        alias : {
	"page/test/appTest": "page/test/appTest-295a72b8f612a099ea7c43adf72567a1.js"
}
    });
}
/*map end*/
/*map2 start*/
seajs.config({
    alias : {
	"dialog": "widget/dialog/0.0.1/dialog.js",
	"jquery.validate": "widget/validator/1.12.0/jquery.validate.js",
	"validator": "widget/validator/1.12.0/ys_validator.js"
},
    base : '/asset'
});
/*map2 end*/