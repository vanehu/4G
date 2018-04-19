/**
 * 地区查询
 * 
 * @author dujb3
 */
CommonUtils.regNamespace("common", "area");
/**
 * 地区查询
 */
common.area = (function($){
//	var iplocation = {"北京": { id: "8110000", root: 0, djd: 1,c:72 },"上海": { id: "8310000", root: 1, djd: 1,c:78 },"天津": { id: "8120000", root: 0, djd: 1,c:51035 },"重庆": { id: "8500000", root: 3, djd: 1,c:113 },"河北": { id: "8130000", root: 0, djd: 1,c:142 },"山西": { id: "8140000", root: 0, djd: 1,c:303 },"河南": { id: "8410000", root: 0, djd: 1,c:412 },"辽宁": { id: "8210000", root: 0, djd: 1,c:560 },"吉林": { id: "8220000", root: 0, djd: 1,c:639 },"黑龙江": { id: "8230000", root: 0, djd: 1,c:698 },"内蒙古": { id: "8150000", root: 0, djd: 0,c:799 },"江苏": { id: "8320000", root: 1, djd: 1,c:904 },"山东": { id: "8370000", root: 0, djd: 1,c:1000 },"安徽": { id: "8340000", root: 1, djd: 1,c:1116 },"浙江": { id: "8330000", root: 1, djd: 1,c:1158 },"福建": { id: "8350000", root: 2, djd: 1,c:1303 },"湖北": { id: "8420000", root: 0, djd: 1,c:1381 },"湖南": { id: "8430000", root: 2, djd: 1,c:1482 },"广东": { id: "8440000", root: 2, djd: 1,c:1601 },"广西": { id: "8450000", root: 2, djd: 1,c:1715 },"江西": { id: "8360000", root: 2, djd: 1,c:1827 },"四川": { id: "8510000", root: 3, djd: 1,c:1930 },"海南": { id: "8460000", root: 2, djd: 1,c:2121 },"贵州": { id: "8520000", root: 3, djd: 1,c:2144 },"云南": { id: "8530000", root: 3, djd: 1,c:2235 },"西藏": { id: "8540000", root: 3, djd: 0,c:2951 },"陕西": { id: "8610000", root: 3, djd: 1,c:2376 },"甘肃": { id: "8620000", root: 3, djd: 1,c:2487 },"青海": { id: "8630000", root: 3, djd: 0,c:2580 },"宁夏": { id: "8640000", root: 3, djd: 1,c:2628 },"新疆": { id: "8650000", root: 3, djd: 0,c:2652 }};
	var provinceCityJson = {"8110000":[{"id":8110000,"name":"东城区"},{"id":8110000,"name":"西城区"},{"id":8110000,"name":"朝阳区"},{"id":8110000,"name":"丰台区"},{"id":8110000,"name":"石景山区"},{"id":8110000,"name":"海淀区"},{"id":8110000,"name":"门头沟区"},{"id":8110000,"name":"房山区"},{"id":8110000,"name":"通州区"},{"id":8110000,"name":"顺义区"},{"id":8110000,"name":"昌平区"},{"id":8110000,"name":"大兴区"},{"id":8110000,"name":"怀柔区"},{"id":8110000,"name":"平谷区"},{"id":8110000,"name":"密云县"},{"id":8110000,"name":"延庆县"}],"8310000":[{"id":8310000,"name":"黄浦区"},{"id":8310000,"name":"徐汇区"},{"id":8310000,"name":"长宁区"},{"id":8310000,"name":"静安区"},{"id":8310000,"name":"普陀区"},{"id":8310000,"name":"闸北区"},{"id":8310000,"name":"虹口区"},{"id":8310000,"name":"杨浦区"},{"id":8310000,"name":"闵行区"},{"id":8310000,"name":"宝山区"},{"id":8310000,"name":"嘉定区"},{"id":8310000,"name":"浦东新区"},{"id":8310000,"name":"金山区"},{"id":8310000,"name":"松江区"},{"id":8310000,"name":"青浦区"},{"id":8310000,"name":"奉贤区"},{"id":8310000,"name":"崇明县"}],"8120000":[{"id":8120000,"name":"和平区"},{"id":8120000,"name":"河东区"},{"id":8120000,"name":"河西区"},{"id":8120000,"name":"南开区"},{"id":8120000,"name":"河北区"},{"id":8120000,"name":"红桥区"},{"id":8120000,"name":"东丽区"},{"id":8120000,"name":"西青区"},{"id":8120000,"name":"津南区"},{"id":8120000,"name":"北辰区"},{"id":8120000,"name":"武清区"},{"id":8120000,"name":"宝坻区"},{"id":8120000,"name":"滨海新区"},{"id":8120000,"name":"宁河县"},{"id":8120000,"name":"静海县"},{"id":8120000,"name":"蓟县"}],"8500000":[{"id":8500000,"name":"万州区"},{"id":8500000,"name":"涪陵区"},{"id":8500000,"name":"渝中区"},{"id":8500000,"name":"大渡口区"},{"id":8500000,"name":"江北区"},{"id":8500000,"name":"沙坪坝区"},{"id":8500000,"name":"九龙坡区"},{"id":8500000,"name":"南岸区"},{"id":8500000,"name":"北碚区"},{"id":8500000,"name":"万盛区"},{"id":8500000,"name":"双桥区"},{"id":8500000,"name":"渝北区"},{"id":8500000,"name":"巴南区"},{"id":8500000,"name":"黔江区"},{"id":8500000,"name":"长寿区"},{"id":8500000,"name":"江津区"},{"id":8500000,"name":"合川区"},{"id":8500000,"name":"永川区"},{"id":8500000,"name":"南川区"},{"id":8500000,"name":"綦江县"},{"id":8500000,"name":"潼南县"},{"id":8500000,"name":"铜梁县"},{"id":8500000,"name":"大足县"},{"id":8500000,"name":"荣昌县"},{"id":8500000,"name":"璧山县"},{"id":8500000,"name":"梁平县"},{"id":8500000,"name":"城口县"},{"id":8500000,"name":"丰都县"},{"id":8500000,"name":"垫江县"},{"id":8500000,"name":"武隆县"},{"id":8500000,"name":"忠县"},{"id":8500000,"name":"开县"},{"id":8500000,"name":"云阳县"},{"id":8500000,"name":"奉节县"},{"id":8500000,"name":"巫山县"},{"id":8500000,"name":"巫溪县"},{"id":8500000,"name":"石柱土家族自治县"},{"id":8500000,"name":"秀山土家族苗族自治县"},{"id":8500000,"name":"酉阳土家族苗族自治县"},{"id":8500000,"name":"彭水苗族土家族自治县"}],"8130000":[{"id":8130100,"name":"石家庄市"},{"id":8130200,"name":"唐山市"},{"id":8130300,"name":"秦皇岛市"},{"id":8130400,"name":"邯郸市"},{"id":8130500,"name":"邢台市"},{"id":8130600,"name":"保定市"},{"id":8130700,"name":"张家口市"},{"id":8130800,"name":"承德市"},{"id":8130900,"name":"沧州市"},{"id":8131000,"name":"廊坊市"},{"id":8131100,"name":"衡水市"}],"8140000":[{"id":8140100,"name":"太原市"},{"id":8140200,"name":"大同市"},{"id":8140300,"name":"阳泉市"},{"id":8140400,"name":"长治市"},{"id":8140500,"name":"晋城市"},{"id":8140600,"name":"朔州市"},{"id":8140700,"name":"晋中市"},{"id":8140800,"name":"运城市"},{"id":8140900,"name":"忻州市"},{"id":8141000,"name":"临汾市"},{"id":8141100,"name":"吕梁市"}],"8410000":[{"id":8410100,"name":"郑州市"},{"id":8410200,"name":"开封市"},{"id":8410300,"name":"洛阳市"},{"id":8410400,"name":"平顶山市"},{"id":8410500,"name":"安阳市"},{"id":8410600,"name":"鹤壁市"},{"id":8410700,"name":"新乡市"},{"id":8410800,"name":"焦作市"},{"id":8410900,"name":"濮阳市"},{"id":8411000,"name":"许昌市"},{"id":8411100,"name":"漯河市"},{"id":8411200,"name":"三门峡市"},{"id":8411300,"name":"南阳市"},{"id":8411400,"name":"商丘市"},{"id":8411500,"name":"信阳市"},{"id":8411600,"name":"周口市"},{"id":8411700,"name":"驻马店市"},{"id":8419001,"name":"济源市"}],"8210000":[{"id":8210100,"name":"沈阳市"},{"id":8210200,"name":"大连市"},{"id":8210300,"name":"鞍山市"},{"id":8210400,"name":"抚顺市"},{"id":8210500,"name":"本溪市"},{"id":8210600,"name":"丹东市"},{"id":8210700,"name":"锦州市"},{"id":8210800,"name":"营口市"},{"id":8210900,"name":"阜新市"},{"id":8211000,"name":"辽阳市"},{"id":8211100,"name":"盘锦市"},{"id":8211200,"name":"铁岭市"},{"id":8211300,"name":"朝阳市"},{"id":8211400,"name":"葫芦岛市"}],"8220000":[{"id":8220100,"name":"长春市"},{"id":8220200,"name":"吉林市"},{"id":8220300,"name":"四平市"},{"id":8220400,"name":"辽源市"},{"id":8220500,"name":"通化市"},{"id":8220600,"name":"白山市"},{"id":8220700,"name":"松原市"},{"id":8220800,"name":"白城市"},{"id":8222400,"name":"延边朝鲜族自治州"}],"8230000":[{"id":8230100,"name":"哈尔滨市"},{"id":8230200,"name":"齐齐哈尔市"},{"id":8230300,"name":"鸡西市"},{"id":8230400,"name":"鹤岗市"},{"id":8230500,"name":"双鸭山市"},{"id":8230600,"name":"大庆市"},{"id":8230700,"name":"伊春市"},{"id":8230800,"name":"佳木斯市"},{"id":8230900,"name":"七台河市"},{"id":8231000,"name":"牡丹江市"},{"id":8231100,"name":"黑河市"},{"id":8231200,"name":"绥化市"},{"id":8232700,"name":"大兴安岭地区"}],"8150000":[{"id":8150100,"name":"呼和浩特市"},{"id":8150200,"name":"包头市"},{"id":8150300,"name":"乌海市"},{"id":8150400,"name":"赤峰市"},{"id":8150500,"name":"通辽市"},{"id":8150600,"name":"鄂尔多斯市"},{"id":8150700,"name":"呼伦贝尔市"},{"id":8150800,"name":"巴彦淖尔市"},{"id":8150900,"name":"乌兰察布市"},{"id":8152200,"name":"兴安盟"},{"id":8152500,"name":"锡林郭勒盟"},{"id":8152900,"name":"阿拉善盟"}],"8320000":[{"id":8320100,"name":"南京市"},{"id":8320200,"name":"无锡市"},{"id":8320300,"name":"徐州市"},{"id":8320400,"name":"常州市"},{"id":8320500,"name":"苏州市"},{"id":8320600,"name":"南通市"},{"id":8320700,"name":"连云港市"},{"id":8320800,"name":"淮安市"},{"id":8320900,"name":"盐城市"},{"id":8321000,"name":"扬州市"},{"id":8321100,"name":"镇江市"},{"id":8321200,"name":"泰州市"},{"id":8321300,"name":"宿迁市"}],"8370000":[{"id":8370100,"name":"济南市"},{"id":8370200,"name":"青岛市"},{"id":8370300,"name":"淄博市"},{"id":8370400,"name":"枣庄市"},{"id":8370500,"name":"东营市"},{"id":8370600,"name":"烟台市"},{"id":8370700,"name":"潍坊市"},{"id":8370800,"name":"济宁市"},{"id":8370900,"name":"泰安市"},{"id":8371000,"name":"威海市"},{"id":8371100,"name":"日照市"},{"id":8371200,"name":"莱芜市"},{"id":8371300,"name":"临沂市"},{"id":8371400,"name":"德州市"},{"id":8371500,"name":"聊城市"},{"id":8371600,"name":"滨州市"},{"id":8371700,"name":"菏泽市"}],"8340000":[{"id":8340100,"name":"合肥市"},{"id":8340200,"name":"芜湖市"},{"id":8340300,"name":"蚌埠市"},{"id":8340400,"name":"淮南市"},{"id":8340500,"name":"马鞍山市"},{"id":8340600,"name":"淮北市"},{"id":8340700,"name":"铜陵市"},{"id":8340800,"name":"安庆市"},{"id":8341000,"name":"黄山市"},{"id":8341100,"name":"滁州市"},{"id":8341200,"name":"阜阳市"},{"id":8341300,"name":"宿州市"},{"id":8341500,"name":"六安市"},{"id":8341600,"name":"亳州市"},{"id":8341700,"name":"池州市"},{"id":8341800,"name":"宣城市"}],"8330000":[{"id":8330100,"name":"杭州市"},{"id":8330200,"name":"宁波市"},{"id":8330300,"name":"温州市"},{"id":8330400,"name":"嘉兴市"},{"id":8330500,"name":"湖州市"},{"id":8330600,"name":"绍兴市"},{"id":8330700,"name":"金华市"},{"id":8330800,"name":"衢州市"},{"id":8330900,"name":"舟山市"},{"id":8331000,"name":"台州市"},{"id":8331100,"name":"丽水市"}],"8350000":[{"id":8350100,"name":"福州市"},{"id":8350200,"name":"厦门市"},{"id":8350300,"name":"莆田市"},{"id":8350400,"name":"三明市"},{"id":8350500,"name":"泉州市"},{"id":8350600,"name":"漳州市"},{"id":8350700,"name":"南平市"},{"id":8350800,"name":"龙岩市"},{"id":8350900,"name":"宁德市"}],"8420000":[{"id":8420100,"name":"武汉市"},{"id":8420200,"name":"黄石市"},{"id":8420300,"name":"十堰市"},{"id":8420500,"name":"宜昌市"},{"id":8420600,"name":"襄阳市"},{"id":8420700,"name":"鄂州市"},{"id":8420800,"name":"荆门市"},{"id":8420900,"name":"孝感市"},{"id":8421000,"name":"荆州市"},{"id":8421100,"name":"黄冈市"},{"id":8421200,"name":"咸宁市"},{"id":8421300,"name":"随州市"},{"id":8422800,"name":"恩施土家族苗族自治州"},{"id":8429004,"name":"仙桃市"},{"id":8429005,"name":"潜江市"},{"id":8429006,"name":"天门市"},{"id":8429021,"name":"神农架林区"}],"8430000":[{"id":8430100,"name":"长沙市"},{"id":8430200,"name":"株洲市"},{"id":8430300,"name":"湘潭市"},{"id":8430400,"name":"衡阳市"},{"id":8430500,"name":"邵阳市"},{"id":8430600,"name":"岳阳市"},{"id":8430700,"name":"常德市"},{"id":8430800,"name":"张家界市"},{"id":8430900,"name":"益阳市"},{"id":8431000,"name":"郴州市"},{"id":8431100,"name":"永州市"},{"id":8431200,"name":"怀化市"},{"id":8431300,"name":"娄底市"},{"id":8433100,"name":"湘西土家族苗族自治州"}],"8440000":[{"id":8440100,"name":"广州市"},{"id":8440200,"name":"韶关市"},{"id":8440300,"name":"深圳市"},{"id":8440400,"name":"珠海市"},{"id":8440500,"name":"汕头市"},{"id":8440600,"name":"佛山市"},{"id":8440700,"name":"江门市"},{"id":8440800,"name":"湛江市"},{"id":8440900,"name":"茂名市"},{"id":8441200,"name":"肇庆市"},{"id":8441300,"name":"惠州市"},{"id":8441400,"name":"梅州市"},{"id":8441500,"name":"汕尾市"},{"id":8441600,"name":"河源市"},{"id":8441700,"name":"阳江市"},{"id":8441800,"name":"清远市"},{"id":8441900,"name":"东莞市"},{"id":8442000,"name":"中山市"},{"id":8445100,"name":"潮州市"},{"id":8445200,"name":"揭阳市"},{"id":8445300,"name":"云浮市"}],"8450000":[{"id":8450100,"name":"南宁市"},{"id":8450200,"name":"柳州市"},{"id":8450300,"name":"桂林市"},{"id":8450400,"name":"梧州市"},{"id":8450500,"name":"北海市"},{"id":8450600,"name":"防城港市"},{"id":8450700,"name":"钦州市"},{"id":8450800,"name":"贵港市"},{"id":8450900,"name":"玉林市"},{"id":8451000,"name":"百色市"},{"id":8451100,"name":"贺州市"},{"id":8451200,"name":"河池市"},{"id":8451300,"name":"来宾市"},{"id":8451400,"name":"崇左市"}],"8360000":[{"id":8360100,"name":"南昌市"},{"id":8360200,"name":"景德镇市"},{"id":8360300,"name":"萍乡市"},{"id":8360400,"name":"九江市"},{"id":8360500,"name":"新余市"},{"id":8360600,"name":"鹰潭市"},{"id":8360700,"name":"赣州市"},{"id":8360800,"name":"吉安市"},{"id":8360900,"name":"宜春市"},{"id":8361000,"name":"抚州市"},{"id":8361100,"name":"上饶市"}],"8510000":[{"id":8510100,"name":"成都市"},{"id":8510300,"name":"自贡市"},{"id":8510400,"name":"攀枝花市"},{"id":8510500,"name":"泸州市"},{"id":8510600,"name":"德阳市"},{"id":8510700,"name":"绵阳市"},{"id":8510800,"name":"广元市"},{"id":8510900,"name":"遂宁市"},{"id":8511000,"name":"内江市"},{"id":8511100,"name":"乐山市"},{"id":8511300,"name":"南充市"},{"id":8511400,"name":"眉山市"},{"id":8511500,"name":"宜宾市"},{"id":8511600,"name":"广安市"},{"id":8511700,"name":"达州市"},{"id":8511800,"name":"雅安市"},{"id":8511900,"name":"巴中市"},{"id":8512000,"name":"资阳市"},{"id":8513200,"name":"阿坝藏族羌族自治州"},{"id":8513300,"name":"甘孜藏族自治州"},{"id":8513400,"name":"凉山彝族自治州"}],"8460000":[{"id":8460100,"name":"海口市"},{"id":8460200,"name":"三亚市"},{"id":8460300,"name":"三沙市"},{"id":8469001,"name":"五指山市"},{"id":8469002,"name":"琼海市"},{"id":8469003,"name":"儋州市"},{"id":8469005,"name":"文昌市"},{"id":8469006,"name":"万宁市"},{"id":8469007,"name":"东方市"},{"id":8469021,"name":"定安县"},{"id":8469022,"name":"屯昌县"},{"id":8469023,"name":"澄迈县"},{"id":8469024,"name":"临高县"},{"id":8469025,"name":"白沙黎族自治县"},{"id":8469026,"name":"昌江黎族自治县"},{"id":8469027,"name":"乐东黎族自治县"},{"id":8469028,"name":"陵水黎族自治县"},{"id":8469029,"name":"保亭黎族苗族自治县"},{"id":8469030,"name":"琼中黎族苗族自治县"},{"id":8469031,"name":"西沙群岛"},{"id":8469032,"name":"南沙群岛"},{"id":8469033,"name":"中沙群岛的岛礁及其海域"}],"8520000":[{"id":8520100,"name":"贵阳市"},{"id":8520200,"name":"六盘水市"},{"id":8520300,"name":"遵义市"},{"id":8520400,"name":"安顺市"},{"id":8522200,"name":"铜仁地区"},{"id":8522300,"name":"黔西南布依族苗族自治州"},{"id":8522400,"name":"毕节地区"},{"id":8522600,"name":"黔东南苗族侗族自治州"},{"id":8522700,"name":"黔南布依族苗族自治州"}],"8530000":[{"id":8530100,"name":"昆明市"},{"id":8530300,"name":"曲靖市"},{"id":8530400,"name":"玉溪市"},{"id":8530500,"name":"保山市"},{"id":8530600,"name":"昭通市"},{"id":8530700,"name":"丽江市"},{"id":8530800,"name":"普洱市"},{"id":8530900,"name":"临沧市"},{"id":8532300,"name":"楚雄彝族自治州"},{"id":8532500,"name":"红河哈尼族彝族自治州"},{"id":8532600,"name":"文山壮族苗族自治州"},{"id":8532800,"name":"西双版纳傣族自治州"},{"id":8532900,"name":"大理白族自治州"},{"id":8533100,"name":"德宏傣族景颇族自治州"},{"id":8533300,"name":"怒江傈僳族自治州"},{"id":8533400,"name":"迪庆藏族自治州"}],"8540000":[{"id":8540100,"name":"拉萨市"},{"id":8542100,"name":"昌都地区"},{"id":8542200,"name":"山南地区"},{"id":8542300,"name":"日喀则地区"},{"id":8542400,"name":"那曲地区"},{"id":8542500,"name":"阿里地区"},{"id":8542600,"name":"林芝地区"}],"8610000":[{"id":8610100,"name":"西安市"},{"id":8610200,"name":"铜川市"},{"id":8610300,"name":"宝鸡市"},{"id":8610400,"name":"咸阳市"},{"id":8610500,"name":"渭南市"},{"id":8610600,"name":"延安市"},{"id":8610700,"name":"汉中市"},{"id":8610800,"name":"榆林市"},{"id":8610900,"name":"安康市"},{"id":8611000,"name":"商洛市"}],"8620000":[{"id":8620100,"name":"兰州市"},{"id":8620200,"name":"嘉峪关市"},{"id":8620300,"name":"金昌市"},{"id":8620400,"name":"白银市"},{"id":8620500,"name":"天水市"},{"id":8620600,"name":"武威市"},{"id":8620700,"name":"张掖市"},{"id":8620800,"name":"平凉市"},{"id":8620900,"name":"酒泉市"},{"id":8621000,"name":"庆阳市"},{"id":8621100,"name":"定西市"},{"id":8621200,"name":"陇南市"},{"id":8622900,"name":"临夏回族自治州"},{"id":8623000,"name":"甘南藏族自治州"}],"8630000":[{"id":8630100,"name":"西宁市"},{"id":8632100,"name":"海东地区"},{"id":8632200,"name":"海北藏族自治州"},{"id":8632300,"name":"黄南藏族自治州"},{"id":8632500,"name":"海南藏族自治州"},{"id":8632600,"name":"果洛藏族自治州"},{"id":8632700,"name":"玉树藏族自治州"},{"id":8632800,"name":"海西蒙古族藏族自治州"}],"8640000":[{"id":8640100,"name":"银川市"},{"id":8640200,"name":"石嘴山市"},{"id":8640300,"name":"吴忠市"},{"id":8640400,"name":"固原市"},{"id":8640500,"name":"中卫市"}],"8650000":[{"id":8650100,"name":"乌鲁木齐市"},{"id":8650200,"name":"克拉玛依市"},{"id":8652100,"name":"吐鲁番地区"},{"id":8652200,"name":"哈密地区"},{"id":8652300,"name":"昌吉回族自治州"},{"id":8652700,"name":"博尔塔拉蒙古自治州"},{"id":8652800,"name":"巴音郭楞蒙古自治州"},{"id":8652900,"name":"阿克苏地区"},{"id":8653000,"name":"克孜勒苏柯尔克孜自治州"},{"id":8653100,"name":"喀什地区"},{"id":8653200,"name":"和田地区"},{"id":8654000,"name":"伊犁哈萨克自治州"},{"id":8654200,"name":"塔城地区"},{"id":8654300,"name":"阿勒泰地区"},{"id":8659001,"name":"石河子市"},{"id":8659002,"name":"阿拉尔市"},{"id":8659003,"name":"图木舒克市"},{"id":8659004,"name":"五家渠市"}]};
	
	var _setCookie=function(name, value, date) {
		var Days = date;
		var exp = new Date();
		exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
		document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString() + ";path=/;";
	};
	var _getCookie=function(name) {
		var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
		if (arr != null) return unescape(arr[2]);
		return null;
	};
	var getIdNameByLevel=function(level){
	    var idName = "";
	    if (level == 1){
	        idName = "stock_province_item";
	    }
	    else if (level == 2){
	        idName = "stock_city_item";
	    }
	    return idName;
	};
	var _onAreaClick=function(area) {
//        resetBindMouseEvent();
        var areaId = $(area).attr("data-value");
        var areaName = $(area).html();
        var provinceName = $("#ctc-area div.mt ul.tab li[data-index=0] em").html();
        $("#ctc-area div.mt ul.tab li[data-index=1] em").html(areaName);
        $("#store-selector-text").html(provinceName + areaName).attr("area-id", areaId);
        $('#store-selector').removeClass('hover');
        var cookieVal = areaId + "-" + provinceName + "-" + areaName;
        _setCookie("login_area_id", cookieVal, 30);
        
        var level = $(area).parent().parent().parent().attr("data-area");
//        JdStockTabs.eq(level).find("a").attr("title",areaName).find("em").html(areaName.length>6?areaName.substring(0,6):areaName);
        level = new Number(level)+1;
        if (level=="2"){
//            CAI.currentCityId = areaId;
//            CAI.currentCityName = areaName;
        }
	};
	var _getAreaList=function(result) {
		var level = 2;
		var idName = getIdNameByLevel(level);
		if (idName && level) {
			$("#"+idName).html("");
	        var html = ["<ul class='area-list'>"];
	        var longhtml = [];
	        var longerhtml = [];
	        if (result&&result.length > 0){
	            for (var i=0,j=result.length;i<j ;i++ ){
	                result[i].name = result[i].name.replace(" ","");
	                if(result[i].name.length > 12){
	                    longerhtml.push("<li class='longer-area'><a href='#none' data-value='"+result[i].id+"'>"+result[i].name+"</a></li>");
	                }
	                else if(result[i].name.length > 5){
	                    longhtml.push("<li class='long-area'><a href='#none' data-value='"+result[i].id+"'>"+result[i].name+"</a></li>");
	                }
	                else{
	                    html.push("<li><a href='#none' data-value='"+result[i].id+"'>"+result[i].name+"</a></li>");
	                }
	            }
	        }
	        else{
	            html.push("<li><a href='#none' data-value='"+currentAreaInfo.currentFid+"'> </a></li>");
	        }
	        html.push(longhtml.join(""));
	        html.push(longerhtml.join(""));
	        html.push("</ul>");
	        $("#"+idName).html(html.join(""));
	        $("#"+idName).find("a").click(function(){
	        	_onAreaClick(this);
	        });
		}
	};
	var _init=function(){
		$("#ctc-area div.mt ul.tab li[data-index=0]").addClass("curr").find("a").addClass("hover");
		$("#stock_city_item").hide();
		$("#stock_province_item").show();
		$("#store-selector").off("mouseover").on("mouseover",function(){
			$('#store-selector').addClass('hover');
		});
		$("#store-selector").off("mouseout").on("mouseout",function(){
			$('#store-selector').removeClass('hover');
		});
		$("#ctc-area div.mt ul.tab li").off("click").on("click",function(){
			$("#ctc-area div.mt ul.tab li").removeClass("curr").find("a").removeClass("hover");
			$(this).addClass("curr").find("a").addClass("hover");
			var dataIndex = $(this).attr("data-index");
			if (dataIndex == "0") {
				$("#stock_city_item").hide();
				$("#stock_province_item").show();
			} else if (dataIndex == "1") {
				$("#stock_province_item").hide();
				$("#stock_city_item").show();
			}
		});
		$("#stock_province_item a").off("click").on("click",function(){
			var fid = $(this).attr("data-value");
			// 4个直辖市直接选中，无须选择下属辖区
			if (fid == "8110000" || fid == "8310000" || fid == "8120000" || fid == "8500000") {
				var provinceName = $(this).html();
				var areaName = "";
				$("#ctc-area div.mt ul.tab li[data-index=0] em").html(provinceName);
				$("#ctc-area div.mt ul.tab li[data-index=1] em").html(areaName);
		        $("#store-selector-text").html(provinceName + areaName).attr("area-id", fid);
		        $('#store-selector').removeClass('hover');
		        _getAreaList(provinceCityJson[fid]);
		        var cookieVal = fid + "-" + provinceName + "-" + areaName;
		        _setCookie("login_area_id", cookieVal, 30);
		        return ;
			}
			$("#store-selector").off("mouseout");
		    _getAreaList(provinceCityJson[fid+""]);
		    $("#ctc-area div.mt ul.tab li").removeClass("curr");
			$("#ctc-area div.mt ul.tab li a").removeClass("hover");
			$("#ctc-area div.mt ul.tab li[data-index=0] em").html($(this).html());
			$("#ctc-area div.mt ul.tab li[data-index=1] em").html("请选择");
			$("#ctc-area div.mt ul.tab li[data-index=1]").addClass("curr").find("a").addClass("hover");
		    $("#stock_province_item").hide();
			$("#stock_city_item").show();
		});
		$("#stock_city_item a").off("click").on("click",function(){
        	_onAreaClick(this);
        });
		var areaArr = _getCookie("login_area_id");
		if (!!areaArr && areaArr != "") {
			areaArr = areaArr.split("-");
			$("#store-selector-text").attr("area-id", areaArr[0]).html(areaArr[1]+areaArr[2]);
			$("#ctc-area div.mt ul.tab li[data-index=0] em").html(areaArr[1]);
			$("#ctc-area div.mt ul.tab li[data-index=1] em").html(areaArr[2]);
			//$("#store-selector").off("mouseout");
		    _getAreaList(provinceCityJson[areaArr[0].substring(0,3)+"0000"]);
		}
	};
	
	return {
		init : _init
	};
})(jQuery);

//初始化
$(function(){
	common.area.init();
});