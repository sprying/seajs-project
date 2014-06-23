/*map start*/
seajs.production = true;
if(seajs.production){
    seajs.config({
        alias : {
	"apps/test/appTest": "apps/test/appTest-d7057789fcb93e330ab84618d9b31c26.js"
}
    });
}
/*map end*/
seajs.config({
    "alias": {
        "dialog":"modules/dialog/0.0.1/dialog",
        "validator":"modules/validator/0.0.1/validator"
    },
    base:seajs.production?'../assets':'../src'
});