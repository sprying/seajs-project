define(function(require,exports,module){
    require('../wifi/wifi.js');
    require('dialog');
    require('./defence.css');
    console.log('defence.js 我是来自业务模块的布防组件');

    $('body').append( $('<div>').addClass('atestStyle'));
    module.exports = function(){};
});