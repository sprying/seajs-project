!function(a,b){var c=navigator.userAgent.toLowerCase(),d=function(a){return a.test(c)},e=function(){return navigator.userAgent.search("MSIE")>=0||window.ActiveXObject||"ActiveXObject"in window?!0:!1},f=b.documentMode,g="CSS1Compat"==b.compatMode,h=d(/opera/),i=d(/\bchrome\b/),j=d(/webkit/),k=!i&&d(/safari/),l=k&&d(/applewebkit\/4/),m=k&&d(/version\/3/),n=k&&d(/version\/4/),o=!h&&e(),p=o&&(d(/msie 7/)||7==f),q=o&&d(/msie 8/)&&7!=f,r=o&&d(/msie 9/),s=o&&d(/msie 10/),t=o&&c.indexOf("trident")>-1&&c.indexOf("rv:11")>-1,u=!(!o||p||q||r||s||t),v=d(/firefox/),w=!j&&d(/gecko/),x=w&&d(/rv:1\.8/),y=w&&d(/rv:1\.9/),z=o&&!g,A=d(/windows|win32/),B=d(/macintosh|mac os x/),C=d(/adobeair/),D=d(/linux/),E=/^https/i.test(window.location.protocol),F={isOpera:h,isWebKit:j,isChrome:i,isSafari:k,isSafari2:l,isSafari3:m,isSafari4:n,isIE:o,isFirefox:v,isIE6:u,isIE7:p,isIE8:q,isIE9:r,isIE10:s,isIE11:t,isGecko:w,isGecko2:x,isGecko3:y,isBorderBox:z,isWindows:A,isMac:B,isAir:C,isLinux:D,isSecure:E};a.util||(a.util={}),a.util.browser=F,a.Log=function(b){a.console&&console.log(b)};var G=function(){var a=navigator.userAgent.toLowerCase(),b=/(webkit)[ \/]([\w.]+)/.exec(a)||/(opera)(?:.*version)?[ \/]([\w.]+)/.exec(a)||/(msie) ([\w.]+)/.exec(a)||/compatible/.test(a)&&/(mozilla)(?:.*? rv:([\w.]+))?/.exec(a)||[];return{name:b[1]||"",version:b[2]||"0"}}();$.browser=$.browser||{},$.browser[G.name]=!0,$.browser.version=Number(G.version),$.browser.isCompat=g,t&&($.browser.version=11),a.inherit=function(a){function b(){}var c;return Object.create?c=Object.create(a):(b.prototype=a,c=new b),c.superClass=a,c}}(window,document);