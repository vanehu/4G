jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};

/**
 * 获取所有cookie，以map形式返回，兼容UTF-8
 */
jQuery.getCookies = function() {
    var result = {};
    var regExp = /[(^\s+)|(\s+$)]/ig;

    try {
        if(document.cookie.length > 0){
            var cookieList = document.cookie.split(";");
            for(var i = 0, length = cookieList.length; i < length; i++){
                var smallCookie = cookieList[i].split("=");
                //基础js，避免jQuery未加载完整，暂不使用$.trim()
                var cookieKey = smallCookie[0].replace(regExp,"");
                if (cookieKey != null && cookieKey != "" && cookieKey != undefined) {
                    result[cookieKey] = unescape(smallCookie[1].replace(regExp,""));
                }
            }
        }
    } catch (error) {
        result = {};
        window.console && window.console.log && (console.log("%c" + error, "color:red"));
    }
    
    return result;
};

/**
 * 兼容UTF-8编码的cookie值，尤其适用于cookie中包含中文字符的情况
 * 为了兼容老的jQuery.cookie，入参增加了一个isUnescape标识，一般传入一个true即可
 */
jQuery.getCookie = function(name, isUnescape) {
    var result = null;

    if (name != null && name != "" && typeof name != 'undefined') {
        if (typeof isUnescape != 'undefined' && !!isUnescape) {
            var cookies = jQuery.getCookies();
            result = cookies[name];
        } else{
            result = jQuery.cookie(name);
        }
    } else{
        result = "";
    }

    return result;
};

/**
 * 以json字符串返回所有cookie
 */
jQuery.getJsonCookies = function() {
    return JSON.stringify(jQuery.getCookies());
};