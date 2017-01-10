jQuery.ketchup
.helper('isGB321002015', function (code) {
    if (code.length != 18) {
        return false;
    }
    var reg = /^([0-9ABCDEFGHJKLMNPQRTUWXY]{2})([0-9]{6})([0-9ABCDEFGHJKLMNPQRTUWXY]{9})([0-9Y])$/;
    if (!reg.test(code)) {
        return false;
    }
    var str = '0123456789ABCDEFGHJKLMNPQRTUWXY';
    var ws = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28];
    var codes = new Array();
    codes[0] = code.substr(0, code.length - 1);
    codes[1] = code.substr(code.length - 1, code.length);
    var sum = 0;
    for (var i = 0; i < 17; i++) {
        sum += str.indexOf(codes[0].charAt(i)) * ws[i];
    }
    var c18 = 31 - (sum % 31);
    if (c18 == 31) {
        c18 = 'Y';
    } else if (c18 == 30) {
        c18 = '0';
    }
    if (c18 != codes[1]) {
        return false;
    }
    return true;
})

.helper('isGS152006', function (code) {
    var s = function (i) {
        return parseInt(p(i) % 11) + parseInt(code.charAt(i));
    };
    var p = function (i) {
        if (i == 0) return 10;
        var sm = s(i - 1) % 10;
        return (sm == 0 ? 10 : sm) * 2;
    };
    if (code.length == 15) {
        if (!/^\d{15}$/.test(code)) {
            return false;
        }
        return 11 - p(14) % 11 == code.charAt(14);
    }
})

.helper('isGB116431999', function (code) {
    code = code.toUpperCase();
    var len, re;
    len = code.length;
    if(len == 18) {
        re = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/);
        var arrSplit = code.match(re);
        var dtmBirth = new Date(arrSplit[2] + "/" + arrSplit[3] + "/" + arrSplit[4]);
        var bGoodDay;
        bGoodDay = (dtmBirth.getFullYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
        if(!bGoodDay) {
            return false;
        } else {
            var valnum;
            var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
            var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
            var nTemp = 0, i;
            for( i = 0; i < 17; i++) {
                nTemp += code.substr(i, 1) * arrInt[i];
            }
            valnum = arrCh[nTemp % 11];
            if(valnum != code.substr(17, 1)) {
                return false;
            }
            return code;
        }
    }
    return false;
})

.helper('isGB117141997', function (code) {
    /**
     *验证组织机构代码是否合法：组织机构代码为8位数字或者拉丁字母+“-”+1位校验码。
     *验证最后那位校验码是否与根据公式计算的结果相符。
     */
    if (code.length != 10) {
        return false;
    }
    var ret = false;
    var codeVal = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var crcs = [3, 7, 9, 10, 5, 8, 4, 2];
    if ("" != code && code.length == 10) {
        var sum = 0;
        for (var i = 0; i < 8; i++) {
            sum += codeVal.indexOf(code.charAt(i)) * crcs[i];
        }
        var crc = 11 - (sum % 11);
        if (crc == 10) {
            crc = "X";
        }
        if (crc == code.substring(9)) {
            ret = true;
        }
    }
    return ret;
})

.helper('isNumber8', function(code) {
    return /^\d{8}$/.test(code);
})

.helper('isNumber12', function(code) {
    return /^\d{12}$/.test(code);
})

.helper('isPassport', function(code) {
    var _ALL_COUNTRY_CODE3 = ["AND", "ARE", "AFG", "ATG", "AIA", "ALB", "ARM", "AGO", "ATA", "ARG", "ASM", "AUT", "AUS", "ABW", "ALA", "AZE", "BIH", "BRB", "BGD", "BEL", "BFA", "BGR", "BHR", "BDI", "BEN", "BLM", "BMU", "BRN", "BOL", "BES", "BRA", "BHS", "BTN", "BVT", "BWA", "BLR", "BLZ", "CAN", "CCK", "CAF", "CHE", "CHL", "CMR", "COL", "CRI", "CUB", "CPV", "CXR", "CYP", "CZE", "DEU", "DJI", "DNK", "DMA", "DOM", "DZA", "ECU", "EST", "EGY", "ESH", "ERI", "ESP", "FIN", "FJI", "FLK", "FSM", "FRO", "FRA", "GAB", "GRD", "GEO", "GUF", "GHA", "GIB", "GRL", "GIN", "GLP", "GNQ", "GRC", "SGS", "GTM", "GUM", "GNB", "GUY", "HKG", "HMD", "HND", "HRV", "HTI", "HUN", "IDN", "IRL", "ISR", "IMN", "IND", "IOT", "IRQ", "IRN", "ISL", "ITA", "JEY", "JAM", "JOR", "JPN", "KHM", "KIR", "COM", "KWT", "CYM", "LBN", "LIE", "LKA", "LBR", "LSO", "LTU", "LUX", "LVA", "LBY", "MAR", "MCO", "MDA", "MNE", "MAF", "MDG", "MHL", "MKD", "MLI", "MMR", "MAC", "MTQ", "MRT", "MSR", "MLT", "MDV", "MWI", "MEX", "MYS", "NAM", "NER", "NFK", "NGA", "NIC", "NLD", "NOR", "NPL", "NRU", "OMN", "PAN", "PER", "PYF", "PNG", "PHL", "PAK", "POL", "PCN", "PRI", "PSE", "PLW", "PRY", "QAT", "REU", "ROU", "SRB", "RUS", "RWA", "SLB", "SYC", "SDN", "SWE", "SGP", "SVN", "SJM", "SVK", "SLE", "SMR", "SEN", "SOM", "SUR", "SSD", "STP", "SLV", "SYR", "SWZ", "TCA", "TCD", "TGO", "THA", "TKL", "TLS", "TUN", "TON", "TUR", "TUV", "TZA", "UKR", "UGA", "USA", "URY", "VAT", "VEN", "VGB", "VIR", "VNM", "WLF", "WSM", "YEM", "MYT", "ZAF", "ZMB", "ZWE", "CHN", "COG", "COD", "MOZ", "GGY", "GMB", "MNP", "ETH", "NCL", "VUT", "ATF", "NIU", "UMI", "COK", "GBR", "TTO", "VCT", "TWN", "NZL", "SAU", "LAO", "PRK", "KOR", "PRT", "KGZ", "KAZ", "TJK", "TKM", "UZB", "KNA", "SPM", "SHN", "LCA", "MUS", "CIV", "KEN", "MNG"];
    if(code==""||code.length<8||code.length>20){
        return false;
    }
    var country = code.substr(0,3);
    if(_ALL_COUNTRY_CODE3.indexOf(country)==-1){
        return false;
    }

    return /^\w{3}-\w{1}-\w{4,14}$/.test(code);
})

.helper('isPersonal', function(code) {
    return /^[\u4E00-\u9FA5·]{2,}$/.test(code);
})

.helper('isGovernment', function(code) {
    if(CommonUtils.getLength(code)<10){
        return false;
    }
    return !/^\d{10,}$/.test(code);
})

.helper('isAddress', function (code) {
    if (CommonUtils.getLength(code) < 12) {
        return false;
    }
    if (/^\d[\s\S]+$/.test(code)) {
        return false;
    }
    if (/^\d+$/.test(code)) {
        return false
    }
    return true;
})

.helper('isNumber', function(value) {
  return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
})

.helper('contains', function(value, word) {
  return value.indexOf(word) != -1;
})

.helper('isEmail', function(value) {
  return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
})

.helper('isUrl', function(value) {
  return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
})

.helper('isUsername', function(value) {
  return /^([a-zA-Z])[a-zA-Z_-]*[\w_-]*[\S]$|^([a-zA-Z])[0-9_-]*[\S]$|^[a-zA-Z]*[\S]$/.test(value);
})

.helper('mask', function(pattern,value) {
  return new RegExp(pattern).test(value);
})

.helper('isDate', function(value) {
  return (!/Invalid|NaN/.test(new Date(value)));
})

.helper('inputsWithName', function(form, el) {
  return $('input[name="' + el.attr('name') + '"]', form);
})

.helper('inputsWithNameNotSelf', function(form, el) {
  return this.inputsWithName(form, el).filter(function() {
           return ($(this).index() != el.index());
         });
})

.helper('getKetchupEvents', function(el) {
  var events = el.data('events').ketchup,
      retArr = [];
  
  for(var i = 0; i < events.length; i++) {
    retArr.push(events[i].namespace);
  }
      
  return retArr.join(' ');
})

.helper('bindBrothers', function(form, el) {
  this.inputsWithNameNotSelf(form, el).bind(this.getKetchupEvents(el), function() {
    el.ketchup('validate');
  });
})
.helper('terminalCodeCheck',function(val){
	if(val.length>20 || val.length < 5)
		return false;
	return (/^[a-z0-9A-Z]{5,20}$/).test(val);
})
.helper('idCardCheck', function(num) {
	num = num.toUpperCase();
	if(!(/(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(num)))//是否15位数字或者17位数字加一位数字或字母X
	{
		return false;
	}
	var len, re;
	len = num.length;
	if(len == 15) {
		re = new RegExp(/^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/);
		var arrSplit = num.match(re);
		var dtmBirth = new Date('19' + arrSplit[2] + '/' + arrSplit[3] + '/' + arrSplit[4]);
		var bGoodDay;
		bGoodDay = (dtmBirth.getYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
		if(!bGoodDay) {
			return false;
		} else {
			var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
			var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
			var nTemp = 0, i;
			num = num.substr(0, 6) + '19' + num.substr(6, num.length - 6);
			for( i = 0; i < 17; i++) {
				nTemp += num.substr(i, 1) * arrInt[i];
			}
			num += arrCh[nTemp % 11];
			return num;
		}
	}
	if(len == 18) {
		re = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/);
		var arrSplit = num.match(re);
		var dtmBirth = new Date(arrSplit[2] + "/" + arrSplit[3] + "/" + arrSplit[4]);
		var bGoodDay;
		bGoodDay = (dtmBirth.getFullYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
		if(!bGoodDay) {
			return false;
		} else {
			var valnum;
			var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
			var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
			var nTemp = 0, i;
			for( i = 0; i < 17; i++) {
				nTemp += num.substr(i, 1) * arrInt[i];
			}
			valnum = arrCh[nTemp % 11];
			if(valnum != num.substr(17, 1)) {
				return false;
			}
			return num;
		}
	}
	return false;
})
.helper('idCardCheck18', function(num) {
		num = num.toUpperCase();
	/*	if(!(/(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(num)))//是否15位数字或者17位数字加一位数字或字母X
		{
			return false;
		}*/
		if(!(/(^\d{17}([0-9]|X)$)/.test(num)))//是否15位数字或者17位数字加一位数字或字母X
		{
			return false;
		}
		var len, re;
		len = num.length;
		if(len == 15) {
			re = new RegExp(/^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/);
			var arrSplit = num.match(re);
			var dtmBirth = new Date('19' + arrSplit[2] + '/' + arrSplit[3] + '/' + arrSplit[4]);
			var bGoodDay;
			bGoodDay = (dtmBirth.getYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
			if(!bGoodDay) {
				return false;
			} else {
				var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
				var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
				var nTemp = 0, i;
				num = num.substr(0, 6) + '19' + num.substr(6, num.length - 6);
				for( i = 0; i < 17; i++) {
					nTemp += num.substr(i, 1) * arrInt[i];
				}
				num += arrCh[nTemp % 11];
				return num;
			}
		}
		if(len == 18) {
			re = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/);
			var arrSplit = num.match(re);
			var dtmBirth = new Date(arrSplit[2] + "/" + arrSplit[3] + "/" + arrSplit[4]);
			var bGoodDay;
			bGoodDay = (dtmBirth.getFullYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
			if(!bGoodDay) {
				return false;
			} else {
				var valnum;
				var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
				var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
				var nTemp = 0, i;
				for( i = 0; i < 17; i++) {
					nTemp += num.substr(i, 1) * arrInt[i];
				}
				valnum = arrCh[nTemp % 11];
				if(valnum != num.substr(17, 1)) {
					return false;
				}
				return num;
			}
		}
		return false;
	});