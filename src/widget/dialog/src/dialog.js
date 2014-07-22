/**
 * # 提示框 Dialog
 * 本提示框适用于只显示文字、提示类型。
 *
 * **使用范例**：
 *
 *     @example
 *     var modal = new Modal( { width: 350, type: 'error' } );
 * @class Dialog
 */

define(function (require, exports, module) {
    /*----------------和业务有关的公用函数-----------------*/
    if (window.ysDialog) return;
    window.ysDialog = {
        eventList: []
    };
    require('./ysDialog.css');

    var isArray = $.isArray;
    var isIE = util.browser.isIE,
        IE6 = util.browser.isIE6,
        isCompat = $.browser.isCompat,
        isObj = $.isPlainObject,
        useFixed = !isIE || (!IE6 && isCompat); //滚动时，IE7+（标准模式）及其它浏览器使用Fixed定位
    var initFn = ['setDefaultCfg', 'show'], _initFn = {}, t;
    while (t = initFn.shift()) ysDialog[t] = eval('0,function(){_initFn.' + t + '?_initFn.' + t + '.push(arguments):(_initFn.' + t + '=[arguments])}');
    var btnIndex = 0, btnCache, seed = 0; //当前焦点的按钮的索引、当前存在的按钮、id种子
    var addEvent = (function () {
        return new Function('env', 'fn', 'obj', 'obj=obj||document;' + (window.attachEvent ? "obj.attachEvent('on'+env,fn)" : 'obj.addEventListener(env,fn,false)') + ';ysDialog.eventList.push([env,fn,obj])')
    })(); //事件绑定
    //    /*创建按钮*/
    var mkBtn = function (txt, sign, cls, autoClose, id) {
        if (!txt) return;
        if (isArray(txt)) {
            /*无效按钮删除*/
            var item, t = [],
                dftBtn = {
                    OK: [curCfg.okTxt, 'ok'],
                    CANCEL: [curCfg.cancelTxt, 'cancel']
                };
            var txtCopy = txt.slice();
            while (txtCopy.length)(item = txtCopy.shift()) && t[t.push(mkBtn.apply(null, dftBtn[item] || item)) - 1] || t.pop();
            return t;
        }
        id = id || 'ysDialog_btn_' + seed++;
        autoClose = autoClose == undefined ? 'undefined' : !!autoClose;
        return {
            id: id,
            sign: sign,
            autoClose: autoClose,
            cls: cls,
            html: "<input type='button' id='" + id + "'  style='cursor:pointer' class='btnStyle handler" + (cls ? (" " + cls) : "") + "' value='" + txt + "' />"
        };
    };
    /*生成按钮组合的html*/
    var joinBtn = function (btn) {
        if (!btn) return btnCache = '';
        if (!isArray(btn)) btn = [btn];
        if (!btn.length) return btnCache = '';
        btnCache = btn.concat();
        var html = [],
            el;
        while (btn.length) html.push(el = btn.shift().html);
        return html.join('&nbsp;&nbsp;');
    };
    /*默认显示配置及用户当前配置*/
    var dftCfg = {
        content: '内容',		//消息框内容
        width: 300,				//消息框宽度
        height: 185,			//消息框高度
        title: '标题',			//消息框标题
        handler: function () {
        },	//回调事件，默认空函数
        maskAlphaColor: '#000',	//遮罩透明色，默认黑色
        maskAlpha: 0.1,			//遮罩透明度，默认0.1
        iframe: false,			//iframe模式，默认不是
        icoCls: '',				//消息框左侧图标，默认无
        btn: null,				//消息框显示的按钮，默认无
        autoClose: true,		//点击关闭、确定等按钮是否自动关闭，默认自动关闭
        fixPosition: true,		//是否随滚动条滚动，默认是
        disableDrag: false,		//是否禁止拖动弹出层，默认否
        dragOut: false,			//是否允许拖出窗口范围，默认不允许
        titleBar: true,			//是否显示标题栏，默认显示
        showMask: true,			//是否显示遮罩，默认显示
        winPos: 'c',			//消息框弹出的位置，默认在页面中间
        winAlpha: 0.8,			//拖动时消息框的透明度，默认0.8
        closeBtn: true,			//是否显示关闭按钮，默认显示
        showShadow: false,		//是否显示消息框的阴影，默认不显示（IE支持）
        useSlide: false,		//是否启用消息框的淡入淡出效果，默认不启用
        slideCfg: {				//淡入淡出效果配置，useSlide=true时有效
            increment: 0.3,		//每次渐变的值，值范围0-1
            interval: 50		//渐变的速度
        },
        closeTxt: '关闭',		//关闭按钮的提示文本
        okTxt: ' 确 定 ',		//确定按钮的提示文本
        cancelTxt: ' 取 消 ',	//取消按钮的提示文本
        msgCls: 'ys-content',	//消息框内容的class名称，用于自定义验尸官，默认为ys-content,仅在iframe:false时有效
        minBtn: false,			//是否显示最小化按钮，默认不显示
        minTxt: '最小化',		//最小化按钮的提示文本
        maxBtn: false,			//是否显示最大化按钮，默认不显示
        maxTxt: '最大化',		//最大化按钮的提示文本
        allowSelect: false,		//是否允许选择消息框内容，默认不允许
        allowRightMenu: false,	//是否允许在消息框使用右键，默认不允许
        noHeight: false          //
    }, curCfg = {};
    (function () {
        var rootEl = document.body, callee = arguments.callee;
        if (!rootEl || typeof rootEl != 'object') return addEvent('load', callee, window); //等待页面加载完成
        /*防止在IE下因document未就绪而报“IE无法打开INTERNET站点的错”的错*/
        if (isIE && document.readyState != 'complete') return addEvent('readystatechange', function () {
            document.readyState == "complete" && callee()
        });
        rootEl = isCompat ? document.documentElement : rootEl; //根据html Doctype获取html根节点，以兼容非xhtml的页面
        var frameset = document.getElementsByTagName('frameset').length; //是否frameset页面
        if (!isIE && frameset) return; //不是IE的frameset页面返回，否则会出现错误。
        /*获取scrollLeft和scrollTop，在fixed定位时返回0，0*/
        var getScrollPos = function () {
            return curCfg.fixPosition && useFixed ? [0, 0] : [rootEl.scrollLeft, rootEl.scrollTop];
        };
        /*保存窗口定位信息，弹出窗口相对页面左上角的坐标信息*/
        var saveWinInfo = function () {
            var pos = getScrollPos();

            $.extend(dragVar, {
                _offX: parseInt(ys_win.style.left) - pos[0],
                _offY: parseInt(ys_win.style.top) - pos[1]
            });
        };
        /*-------------------------创建弹窗html-------------------*/
        var maskStyle = 'position:absolute;top:0;left:0;display:none;text-align:center';
        var container = [
            /*遮罩*/
                "<div id='maskLevel' style=\'" + maskStyle + ';z-index:10000;\'></div>',
            IE6 ? ("<iframe id='maskIframe' src='' style='" + maskStyle +
                ";z-index:9999;filter:alpha(opacity=0);opacity:0'></iframe>") : '',
            /*窗体*/
            "<div id='ys-window' style='position:absolute;z-index:10001;display:none'>",
            "<iframe src='' frameborder='0' border='0' style='width:100%;height:100%;position:absolute;top:0;left:0;z-index:-1;border: none;'></iframe>",                "<div class='ys-tl' id='ys-tl'><div class='ys-tr'><div class='ys-tc' style='cursor:move;'>" +
                "<div class='ys-header-text'></div><div class='ys-header-tools'>",
            "<div class='ysDialog_min' title='最小化'><strong>0</strong></div>",
            "<div class='ysDialog_max' title='最大化'><strong>1</strong></div>",
            "<div class='ysDialog_close' title='关闭'><strong>x</strong></div>",
            "</div></div></div></div>",
                "<div class='ys-ml' id='ys-ml'><div class='ys-mr'><div class='ys-mc'>" +
                "<div class='ys-body' style='position:relative'></div></div></div></div>",
            "<div class='ys-ml' id='ys-btnl'><div class='ys-mr'><div class='ys-btn'></div></div></div>",
            "<div class='ys-bl' id='ys-bl'><div class='ys-br'><div class='ys-bc'></div></div></div>",
            "</div>",
            /*阴影*/
            isIE ? "<div id='ys-shadow' style='position:absolute;z-index:10000;background:#808080;" +
                "filter:alpha(opacity=80) progid:DXImageTransform.Microsoft.Blur(pixelradius=2);display:none'></div>" : ''].join('');
        $(document.body).append(container);
        /*窗口上的对象*/
        /*mask、window*/
        var maskLevel = $('#maskLevel')[0];
        var ys_win = $('#ys-window')[0];
        var ys_shadow = $('#ys-shadow')[0];
        var ys_wins;
        /*header*/
        var ys_headbox = $('#ys-tl')[0];
        var ys_head = ys_headbox.firstChild.firstChild;
        var ys_hText = ys_head.firstChild;
        var ys_hTool = ys_hText.nextSibling;
        /*content*/
        var ys_body = $('#ys-ml')[0].firstChild.firstChild.firstChild;
        /*button*/
        var ys_btn = $('#ys-btnl')[0];
        var ys_btnContent = ys_btn.firstChild.firstChild;
        /*bottom*/
        var ys_bottom = $('#ys-bl')[0];
        var maskEl = [maskLevel]; //遮罩元素
        IE6 && maskEl.push($('#maskIframe')[0]);
        var ys_ico = ys_hTool.childNodes; //右上角的图标
        var dragVar = {};
        /*窗口的最大化最小化核心功能实现*/
        var cur_state = 'normal',
            cur_cord = [0, 0]; //cur_cord记录最大化前窗口的坐标
        var cal_cord = function () {
            var pos = getScrollPos();
            cur_cord = [parseInt(ys_win.style.left) - pos[0], parseInt(ys_win.style.top) - pos[1]]
        }; //保存坐标(相对页面左上角坐标)
        /*从常态到最大化*/
        var doMax = function () {
            cal_cord(); //记录坐标，便于还原时使用
            cur_state = 'max';
            ys_ico[1].firstChild.innerHTML = '2';
            ys_ico[1].className = 'ysDialog_normal';
            setWinSize(rootEl.clientWidth, rootEl.clientHeight, [0, 0]);
        };
        /*从正常到最小化*/
        var doMin = function () {
            cal_cord();
            cur_state = 'min';
            ys_ico[0].firstChild.innerHTML = '2';
            ys_ico[0].className = 'ysDialog_normal';
            setWinSize(0, $(ys_headbox).height(), cur_cord); //定位在当前坐标
        };
        var doNormal = function (init) { //init=true,弹出时调用该函数
            !init && cur_state == 'min' && cal_cord(); //从最小化过来重新获取坐标
            cur_state = 'normal';
            ys_ico[0].firstChild.innerHTML = '0';
            ys_ico[1].firstChild.innerHTML = '1';
            ys_ico[0].className = 'ysDialog_min';
            ys_ico[1].className = 'ysDialog_max';
            setWinSize.apply(this, init ? [] : [0, 0, cur_cord]);
        };
        var max, min;
        //最小化
        $(ys_ico[0]).on('click', function () {
            cur_state != 'normal' ? doNormal() : doMin();
        });
        $(ys_ico[1]).on('click', function () {
            cur_state != 'normal' ? doNormal() : doMax();
        });
        //关闭
        $(ys_ico[2]).on('click', function () {
            ysDialog.doHandler('close');
        });
        //最大化
        $(ys_head).on('dblclick', function (e) {
            /*如果操作元素是最大最小关闭按钮则不进行此处理*/
            curCfg.maxBtn && (e.srcElement || e.target).parentNode != ys_hTool && max()
        });
        /*窗口最大化最小化核心部分结束*/
        /*getWinSize取得页面实际大小*/
        var getWinSize = function () {
            return [Math.max(rootEl.scrollWidth, rootEl.clientWidth), Math.max(rootEl.scrollHeight, rootEl.clientHeight)]
        };
        var winSize = getWinSize(); //保存当前页面的实际大小
        /*事件绑定部分*/
        var bindEl = ys_head.setCapture && ys_head; //绑定拖放事件的对象，只有Ie下bindEl有效
        /*窗体透明度控制*/
        var filterWin = function (v) {
            /*鼠标按下时取消窗体的透明度，IE标准模式下透明度为1则直接清除透明属性，防止iframe窗口不能拖动滚动条*/
            !frameset && $(ys_win).css(v == 1 && isCompat ? {
                filter: '',
                opacity: ''
            } : {
                filter: 'Alpha(opacity=' + v * 100 + ')',
                opacity: v
            });
        };
        /*mousemove事件*/
        var mEvent = function (e) {
            var sLeft = dragVar.offX + e.clientX;
            var sTop = dragVar.offY + e.clientY;
            if (!curCfg.dragOut) { //页面可见区域内拖动
                var pos = getScrollPos(),
                    sl = pos[0],
                    st = pos[1];
                sLeft = Math.min(Math.max(sLeft, sl), rootEl.clientWidth - ys_win.offsetWidth + sl);
                sTop = Math.min(Math.max(sTop, st), rootEl.clientHeight - ys_win.offsetHeight + st);
            } else if (curCfg.showMask && '' + winSize != '' + getWinSize()) //及时调整遮罩大小
                resizeMask(true);
            $(ys_wins).css({
                left: sLeft + 'px',
                top: sTop + 'px'
            });
        };
        /*mouseup事件*/
        var uEvent = function () {
            filterWin(1);
            $(bindEl || window).off("mousemove", mEvent);
            $(bindEl || window).off("mouseup", uEvent);
            saveWinInfo(); //保存当前窗口的位置
            curCfg.iframe && setStyle(getPage().nextSibling, 'display', 'none');
            curCfg.iframe && $(getPage().nextSibling).css('display', 'none');
            /*IE下窗口外部拖动*/
            bindEl && ($(bindEl).off("losecapture", uEvent), bindEl.releaseCapture());
        };
        /*绑定鼠标下按事件*/
        $(ys_head).on('mousedown', function (e) {
            if (curCfg.disableDrag) return false;    // 禁止拖动 2013-03-09
            if ((e.srcElement || e.target).parentNode == ys_hTool) return false; //点击操作按钮不进行启用拖动处理
            filterWin(curCfg.winAlpha); //鼠标按下时窗体的透明度
            /*鼠标与弹出框的左上角的位移差*/
            $.extend(dragVar, {
                offX: parseInt(ys_win.style.left) - e.clientX,
                offY: parseInt(ys_win.style.top) - e.clientY
            });
            $(bindEl || window).on("mousemove", mEvent);
            $(bindEl || window).on("mouseup", uEvent);
            if (curCfg.iframe) {
                var cfg = {display: ''}, pg = getPage();
                isCompat && IE6 && $.extend(cfg, {
                    width: pg.offsetWidth,
                    height: pg.offsetHeight
                }); //IE6必须设置高度
                $(pg.nextSibling).css(cfg)
            }
            /*IE下窗口外部拖动*/
            bindEl && ($(bindEl).on("losecapture", uEvent), bindEl.setCapture());
        });
        /*页面滚动弹出窗口滚动*/
        var scrollEvent = function () {
            $(ys_win).css({
                left: dragVar._offX + rootEl.scrollLeft + 'px',
                top: dragVar._offY + rootEl.scrollTop + 'px'
            });
        };
        /*键盘监听*/
        var keydownEvent = function (e) {
            var keyCode = e.keyCode;
            if (keyCode == 27) destroy(); //esc键
            if (btnCache) {
                var l = btnCache.length, nofocus;
                /*tab键/左右方向键切换焦点*/
                document.activeElement && document.activeElement.id != btnCache[btnIndex].id && (nofocus = true);
                if (keyCode == 9 || keyCode == 39) nofocus && (btnIndex = -1),
                    $(btnCache[++btnIndex == l ? (--btnIndex) : btnIndex].id).focus();
                if (keyCode == 37) nofocus && (btnIndex = l),
                    $(btnCache[--btnIndex < 0 ? (++btnIndex) : btnIndex].id).focus();
                if (keyCode == 13) return true;
            }
            /*禁止F1-F12/ tab 回车*/
            return keyEvent(e, keyCode == 13, (keyCode > 110 && keyCode < 124));
        };
        /*监听键盘事件*/
        var keyEvent = function (e, d, f) {
            e = e || event;
            /*允许对表单项进行操作*/
            if (!d && /input|select|textarea/i.test((e.srcElement || e.target).tagName)) return true;
            if (f) return true;
            try {
                e.returnValue = false;
                e.keyCode = 0;
            } catch (ex) {
                e.preventDefault && e.preventDefault();
            }
            return false;
        };
        maskLevel.oncontextmenu = keyEvent; //禁止右键和选择
        /*重新计算遮罩的大小*/
        var resizeMask = function (noDelay) {
            $(maskEl).css('display', 'none'); //先隐藏
            var size = getWinSize();
            var resize = function () {
                $(maskEl).css({
                    width: size[0] + 'px',
                    height: size[1] + 'px',
                    display: ''
                });
            };
            isIE ? noDelay === true ? resize() : setTimeout(resize, 0) : resize();
            cur_state == 'min' ? doMin() : cur_state == 'max' ? doMax() : setWinSize(); //最大化最小化状态还原
        };
        /*蒙版的显示隐藏,state:true显示,false隐藏，默认为true*/
        var maskVisible = function (visible) {
            if (!curCfg.showMask) return; //无遮罩
            //页面大小改变及时调整遮罩大小
            if (visible === false) {
                $(window).off('resize', resizeMask);
                return $(maskEl).css('display', 'none');//隐藏遮罩
            } else {
                $(window).on('resize', resizeMask);
            }
            $(maskLevel).css({
                background: curCfg.maskAlphaColor,
                filter: 'Alpha(opacity=' + curCfg.maskAlpha * 100 + ')',
                opacity: curCfg.maskAlpha
            });
            resizeMask(true);
        };
        /*计算指定位置的坐标，返回数组*/
        var getPos = function (f) {
            /*传入有效的数组，则采用用户坐标（需要做简单处理），否则根据传入字符串到map中匹配，如果匹配不到则默认采用c配置*/
            f = isArray(f) && f.length == 2 ? (f[0] + '+{2},{3}+' + f[1]) : (posMap[f] || posMap['c']);
            var pos = [rootEl.clientWidth - ys_win.offsetWidth, rootEl.clientHeight - ys_win.offsetHeight].concat(getScrollPos());
            var arr = f.replace(/\{(\d)\}/g, function (s, s1) {
                return pos[s1]
            }).split(',');
            return [eval(arr[0]), eval(arr[1])];
        }; //9个常用位置常数
        var posMap = {
            c: '{0}/2+{2},{1}/2+{3}',
            l: '{2},{1}/2+{3}',
            r: '{0}+{2},{1}/2+{3}',
            t: '{0}/2+{2},{3}',
            b: '{0}/2,{1}+{3}',
            lt: '{2},{3}',
            lb: '{2},{1}+{3}',
            rb: '{0}+{2},{1}+{3}',
            rt: '{0}+{2},{3}'
        };
        /*设定窗口大小及定位*/
        var setWinSize = function (w, h, pos) {
            if (ys_win.style.display == 'none') return; //当前不可见则不处理
            /*默认使用配置的宽高*/
            h = parseInt(h) || curCfg.height;
            w = parseInt(w) || curCfg.width;
            if (curCfg.noHeight) {
                $(ys_wins).css({
                    width: w + 'px',
                    height: 'auto',
                    left: 0,
                    top: 0
                });
            } else {
                $(ys_wins).css({
                    width: w + 'px',
                    height: h + 'px',
                    left: 0,
                    top: 0
                });
            }

            pos = getPos(pos || curCfg.winPos); //支持自定义坐标，或者默认配置
            if (curCfg.noHeight) {
                var upTop = getWinSize()[1] * 0.2;
                $(ys_wins).css({
                    top: upTop + 'px',
                    left: pos[0] + 'px'
                });
            } else {
                $(ys_wins).css({
                    top: pos[1] + 'px',
                    left: pos[0] + 'px'
                });
            }

            saveWinInfo(); //保存当前窗口位置信息
            if(!curCfg.noHeight){
                $(ys_body).css('height', h - $(ys_headbox).height() - $(ys_btn).height() - $(ys_bottom).height() + 'px'); //设定内容区的高度
            }else{
                $(ys_body).css('height','auto').css('max-height', (getWinSize()[1] * 0.6) + 'px'); //设定内容区的高度
            }
            isCompat && IE6 && curCfg.iframe && $(getPage()).css({height: ys_body.clientHeight}); //IE6标准模式下要计算iframe高度
        };
        $(ys_btnContent).on('click', function (e) {
            for (var i = 0, l = btnCache.length; i < l; i++) {
                var btn = btnCache[i];
                if ($(e.target).attr('id') === btn.id) {
                    if (ysDialog.fire(btn.sign) !== false) {
                        ysDialog.doHandler(btn.sign, btn.autoClose);
                    }
                    break;
                }
            }
        });
        var _obj = []; //IE中可见的obj元素
        var cacheWin = []; //队列中的窗口
        var winVisible = function (visible) {
            var fn = visible === false ? 'off' : 'on';
            $(window)[fn]('scroll', curCfg.fixPosition && !useFixed ? scrollEvent : saveWinInfo);
            $(ys_wins).css('position', curCfg.fixPosition && useFixed ? 'fixed' : 'absolute');
            $(window)[fn]('keydown', keydownEvent);
            if (visible === false) { //关闭
                $(ys_shadow).css('display', 'none');
                /*关闭窗口执行的操作*/
                var closeFn = function () {
                    $(ys_win).css('display', 'none');
                    $(_obj).css('visibility', 'visible');
                    _obj = []; //把当前弹出移除
                    cacheWin.shift(); //读取队列中未执行的弹出
                    if (cacheWin.length) ysDialog.show.apply(null, cacheWin[0].concat(true, true))
                };
                /*渐变方式关闭*/
                var alphaClose = function () {
                    var alpha = 1;
                    var hideFn = function () {
                        alpha = Math.max(alpha - curCfg.slideCfg.increment, 0);
                        filterWin(alpha);
                        if (alpha == 0) {
                            maskVisible(false);
                            closeFn();
                            clearInterval(it);
                        }
                    };
                    hideFn();
                    var it = setInterval(hideFn, curCfg.slideCfg.interval);
                };
                curCfg.useSlide ? alphaClose() : closeFn();
                return;
            }
            for (var o = document.getElementsByTagName('object'), i = o.length - 1; i > -1; i--) o[i].style.visibility != 'hidden' && _obj.push(o[i]);
            $([ys_hText, ys_hTool]).css('display', (curCfg.titleBar ? '' : 'none'));
            ys_head.className = 'ys-tc' + (curCfg.titleBar ? '' : ' ys-ttc'); //无标题栏
            ys_hText.innerHTML = curCfg.title; //标题
            for (var i = 0, c = ['min', 'max', 'close']; i < 3; i++) {
                ys_ico[i].style.display = curCfg[c[i] + 'Btn'] ? '' : 'none';
                ys_ico[i].title = curCfg[c[i] + 'Txt'];
            }
            /*iframe如果不加上opacity=100，则ys-win和用于遮罩iframe的div也透明时，iframe也就透明了*/
            var ifmStyle = 'position:absolute;width:100%;height:100%;top:0;left:0;opacity:1;filter:alpha(opacity=100)';
            ys_body.innerHTML = !curCfg.iframe ? ('<div class="' + curCfg.msgCls + '">' + curCfg.content + '</div>') : "<iframe style='" + ifmStyle + "' border='0' frameborder='0' src='" + curCfg.content + "'></iframe><div style='" + ifmStyle + ";background:#000;opacity:0.1;filter:alpha(opacity=10);display:none'></div>"; //内容
            (function (el, obj) {
                for (var i in obj) try {
                    el[i] = obj[i]
                } catch (e) {
                }
            })(ys_body.firstChild, curCfg.iframe); //为iframe添加自定义属性
            ys_body.className = "ys-body " + curCfg.icoCls; //图标类型
            $(ys_btn).css('display', ((ys_btnContent.innerHTML = joinBtn(mkBtn(curCfg.btn))) ? '' : 'none')); //没有按钮则隐藏
            !curCfg.useSlide && curCfg.showShadow && $(ys_shadow).css('display', '');
            $(ys_win).css('display', '');
            doNormal(true);
            filterWin(curCfg.useSlide ? 0 : 1); //此处使用filter同时可以解决IE非标准模式下有时下边会出现1px空白，使内容与下部不衔接的问题
            /*渐变方式显示*/
            curCfg.useSlide && (function () {
                var alpha = 0;
                var showFn = function () {
                    alpha = Math.min(alpha + curCfg.slideCfg.increment, 1);
                    filterWin(alpha);
                    if (alpha == 1) {
                        clearInterval(it);
                        curCfg.showShadow && $(ys_shadow).css('display', '')
                    }
                };
                showFn();
                var it = setInterval(showFn, curCfg.slideCfg.interval);
            })();
            btnCache && $(btnCache[btnIndex = 0].id).focus(); //第一个按钮获取焦点
            /*是否禁止选择、禁止右键*/
            ys_win.onselectstart = curCfg.allowSelect ? null : keyEvent;
            ys_win.oncontextmenu = curCfg.allowRightMenu ? null : keyEvent;
        }; //初始化
        var init = function () {
            ys_wins = [ys_win].concat(curCfg.showShadow ? ys_shadow : ''); //是否使用阴影
            maskVisible();
            winVisible();
        }; //销毁
        var destroy = function () {
            !curCfg.useSlide && maskVisible(false);
            winVisible(false);
        }; //取得iframe
        var getPage = function () {
            return curCfg.iframe ? ys_body.firstChild : null
        };
        $.extend(ysDialog, {
            close: function () {
                destroy();
                ysDialog.fire('hide');
                ysDialog.offAll();
            },
            max: max,
            min: min,
            normal: doNormal,
            getPage: getPage,
            getContent: function () {
                return ys_body.firstChild || '';
            },
            /*显示消息框,fargs:优先配置，会覆盖args中的配置*/
            /*show 强制显示*/
            show: function (args, fargs, show, inShow) {
                if (!show && cacheWin.push([args, fargs]) && cacheWin.length > 1) return;
                /*支持两种参数传入方式:(1)JSON方式 (2)多个参数传入*/
                if (!inShow && show) {
                    if(cacheWin.length){
                        $(this.getContent()).find('input,textarea').each(function (index, item) {
                            var $this = $(this);
                            if ($this[0].tagName == 'INPUT') {
                                $this.attr('value', $this.val());
                            } else if ($this[0].tagName == 'TEXTAREA') {
                                $this.text($this.val());
                            }
                        });
                        cacheWin[0][0][0].content = $(this.getContent()).html();
                    }
                    cacheWin.unshift([args, fargs]);
                }
                var a = [].slice.call(args, 0), o = {}, j = -1;
                if (!isObj(a[0])) {
                    for (var i in dftCfg) if (a[++j]) o[i] = a[j];
                } else {
                    o = a[0];
                }
                $.extend(curCfg, ysDialog.setDefaultCfg(), $.extend({}, fargs, o)); //先还原默认配置
                /*修正curCfg中的无效值(null/undefined)改为默认值*/
                for (var i in curCfg) curCfg[i] = curCfg[i] != null ? curCfg[i] : ysDialog.cfg[i];
                init();
                curCfg.contentBind && curCfg.contentBind();
            },
            doHandler: function (sign, autoClose, closeFirst) {
                if (autoClose == undefined ? curCfg.autoClose : autoClose) {
                    if ((curCfg.handler)(sign) !== false) {
                        destroy();
                        curCfg.closeHandler && curCfg.closeHandler();
                        ysDialog.fire('hide');
                        ysDialog.offAll();
                    }
                } else {
                    try {
                        (curCfg.handler)(sign)
                    } catch (e) {
                        alert(e.message)
                    }
                }

            },
            resizeWin: setWinSize,
            /*设定默认配置*/
            setDefaultCfg: function (cfg) {
                return ysDialog.cfg = $.extend({}, $.extend({}, dftCfg, ysDialog.cfg), cfg);
            },
            getButtons: function () {
                var btns = btnCache || [], btn, rBtn = [];
                while (btn = btns.shift()) rBtn.push($(btn.id));
                return rBtn;
            }
        });
        ysDialog.setDefaultCfg(); //初始化默认配置
        /*执行用户初始化时的调用*/
        var t;
        for (var i in _initFn) while (t = _initFn[i].shift()) ysDialog[i].apply(null, t);
    })();
    $.extend(ysDialog, {

        /**
         * 配置项目描述
         * @cfg {Object} config
         * @cfg {String} config.title default '标题' 弹出框标题
         * @cfg {String} config.content default '内容'
         * @cfg {Number} config.width default 300 宽度
         * @cfg {Number} config.height default 185 高度
         * @cfg {String} config.winPos default 'c' 弹出框位置
         * @cfg {Boolean} config.showMask default true 是否显示遮罩
         * @cfg {String} config.maskAlpha default '0.1' 遮罩的透明度
         * @cfg {String} config.msgCls default 'ys-content' 消息框内容的class名称，用于自定义样式
         * @cfg {String} config.okTxt default '确定' 确定按钮提示文字
         * @cfg {String} config.cancelTxt default '取消' 取消按钮的提示文本
         * @cfg {Boolean} config.disableDrag default false 是否禁止拖动弹出层，默认否
         */
        /**
         * @method warn
         * 警告弹出窗
         *
         */
        warn: function () {
            var conf = [];
            if (arguments.length == 1 && !$.isPlainObject(arguments[0])) {
                (conf[0] = {}) && (conf[0].content = arguments[0]);
            } else {
                conf = arguments;
            }
            ysDialog.show(conf, {
                icoCls: 'ysDialog_warn',
                title: '提示',
                btn: ['OK'],
                width: 300,
                height: 135,
                maskAlpha: 0.4
            }, true, false);
        },
        /**
         * @method succeedInfo
         * 成功弹出窗
         *
         */
        succeedInfo: function (info) {
            var conf = [];
            if (arguments.length == 1 && !$.isPlainObject(arguments[0])) {
                (conf[0] = {}) && (conf[0].content = arguments[0]);
            } else {
                conf = arguments;
            }
            ysDialog.show(conf, {
                icoCls: 'ysDialog_succeed',
                title: '提示',
                btn: ['OK'],
                width: 300,
                height: 150,
                maskAlpha: 0.4
            });
        },
        /**
         * @method tip
         * 提示弹出框
         *
         */
        tip: function (info) {
            var conf = [];
            if (arguments.length == 1 && !$.isPlainObject(arguments[0])) {
                (conf[0] = {}) && (conf[0].content = arguments[0]);
            } else {
                conf = arguments;
            }
            ysDialog.show(conf, {
                icoCls: 'ysDialog_tip',
                title: '提示',
                btn: ['OK'],
                width: 300,
                height: 150,
                maskAlpha: 0.4
            });
        },
        /**
         * @method errorInfo
         * 报错弹出窗
         *
         */
        errorInfo: function () {
            var conf = [];
            if (arguments.length == 1 && !$.isPlainObject(arguments[0])) {
                (conf[0] = {}) && (conf[0].content = arguments[0]);
            } else {
                conf = arguments;
            }
            ysDialog.show(conf, {
                icoCls: 'ysDialog_error',
                title: '提示',
                btn: ['OK'],
                width: 300,
                height: 135,
                maskAlpha: 0.4
            });
        },
        /**
         * @method win
         * 自定义弹出窗
         *
         */
        win: function () {
            ysDialog.show(arguments);
        }
        /**
         *  @event hide
         *  隐藏对话框时触发的事件
         */
    }, Base.Event);
    module.exports = ysDialog;
});