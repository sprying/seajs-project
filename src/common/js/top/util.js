!function (w, DOC) {
    var ua = navigator.userAgent.toLowerCase(),
        check = function (r) {
            return r.test(ua);
        },
		checkIE = function(){
			if((navigator.userAgent.search("MSIE") >= 0) ||!!window.ActiveXObject || "ActiveXObject" in window){
				return true;
			}else{
				return false;
			}
		},
        docMode = DOC.documentMode,
        isStrict = DOC.compatMode == "CSS1Compat",
        isOpera = check(/opera/),
        isChrome = check(/\bchrome\b/),
        isWebKit = check(/webkit/),
        isSafari = !isChrome && check(/safari/),
        isSafari2 = isSafari && check(/applewebkit\/4/),
        isSafari3 = isSafari && check(/version\/3/),
        isSafari4 = isSafari && check(/version\/4/),
        isIE = !isOpera && (checkIE()),
        isIE7 = isIE && ( check(/msie 7/) || docMode == 7 ),
        isIE8 = isIE && ( check(/msie 8/) && docMode != 7 ),
        isIE9 = isIE && check(/msie 9/),
        isIE10 = isIE && check( /msie 10/ ),
        isIE11 = isIE && ua.indexOf('trident')>-1&&ua.indexOf('rv:11')>-1,
        isIE6 = isIE && !isIE7 && !isIE8 && !isIE9 && !isIE10 && !isIE11,
        isFirefox = check(/firefox/),
        isGecko = !isWebKit && check(/gecko/),
        isGecko2 = isGecko && check(/rv:1\.8/),
        isGecko3 = isGecko && check(/rv:1\.9/),
        isBorderBox = isIE && !isStrict,
        isWindows = check(/windows|win32/),
        isMac = check(/macintosh|mac os x/),
        isAir = check(/adobeair/),
        isLinux = check(/linux/),
        isSecure = /^https/i.test(window.location.protocol);

    var browser = {
        isOpera: isOpera,
        isWebKit: isWebKit,
        isChrome: isChrome,
        isSafari: isSafari,
        isSafari2: isSafari2,
        isSafari3: isSafari3,
        isSafari4: isSafari4,
        isIE: isIE,
        isFirefox: isFirefox,
        isIE6: isIE6,
        isIE7: isIE7,
        isIE8: isIE8,
        isIE9: isIE9,
        isIE10: isIE10,
        isIE11: isIE11,
        isGecko: isGecko,
        isGecko2: isGecko2,
        isGecko3: isGecko3,
        isBorderBox: isBorderBox,
        isWindows : isWindows,
        isMac :isMac,
        isAir :isAir,
        isLinux :isLinux,
        isSecure :isSecure
    };
    w.util || (w.util = {});
    w.util.browser = browser;

    w.Log = function (str) {
        w.console && console.log(str);
    };

    var browser1 = (function () {
        var s = navigator.userAgent.toLowerCase();
        var match = /(webkit)[ \/]([\w.]+)/.exec(s) ||
            /(opera)(?:.*version)?[ \/]([\w.]+)/.exec(s) ||
            /(msie) ([\w.]+)/.exec(s) ||
            /compatible/.test(s) && /(mozilla)(?:.*? rv:([\w.]+))?/.exec(s) ||
            [];
        return {
            name: match[1] || "",
            version: match[2] || "0"
        }
    })();
    $.browser = $.browser || {};
    $.browser[browser1.name] = true;
    $.browser.version = Number(browser1.version);
    $.browser.isCompat = isStrict;
	if(isIE11){$.browser.version = 11;}

    w.inherit = function(obj){
        var rtn;
        if(Object.create){
            rtn = Object.create(obj);
        }else{
            function F(){}
            F.prototype = obj;
            rtn = new F();
        }
        rtn.superClass = obj;
        return rtn;
    };
}(window, document);