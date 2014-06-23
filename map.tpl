/*map start*/
seajs.production = true;
if(seajs.production){
    seajs.config({
        alias : <%= mapJSON %>
    });
}
/*map end*/