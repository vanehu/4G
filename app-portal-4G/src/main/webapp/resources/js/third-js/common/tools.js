//表单提示条
function initTip(){
	var tip = $('<div class="tips" id="tip" style="display:none;"><div class="l-verify-tip"><div class="l-verify-tip-corner"></div><div class="l-verify-tip-content" id="tipcontent"></div></div></div>');
	tip.appendTo('body');
}
//出现提示语
function tipshow (obj,content){
	var px = obj.offset().left + obj.width();
    var py = obj.offset().top;
	$("#tipcontent").html(content);
	$("#tip").css({ left: px, top:py}).show();
	$("#tip").show();
}
//隐藏提示语
function tiphidden(){
	$("#tip").hide();
}
/**
 * 版权信息生成.
 * jsp页面要有<div class="footer-copy"></div>
 */
var initCopyRight = function() {
	var date = new Date();
	var footerCopy = 'Copyright © 2011-' + date.getFullYear() + ' 联创亚信科技（南京）有限公司';
	$("div.footer-copy").append(footerCopy);
};
//菜单伸缩特效
function initToggle() {
	var contextPath = top.contextPath;
	$("div.box").show();
	$(".l-form .yy .l-group img").click(function() {
		if($(this).attr("alt") == "open") {
			$(this).attr({src:contextPath+'/css-pub/system/image/tittle_arrow.gif',alt:'close'});
		}
		else{
			$(this).attr({src:contextPath+'/css-pub/system/image/tittle_arrow_up.gif',alt:'open'});
		}
		$(this).parent().next(".box").slideToggle("slow");
	});
	$(".l-form .yy .l-group span").click(function(){
		var obj=$(this).parent().children(":first");
		if(obj.attr("alt")=="open"){
			obj.attr({src:contextPath+'/css-pub/system/image/tittle_arrow.gif',alt:'close'});
		}
		else{
			obj.attr({src:contextPath+'/css-pub/system/image/tittle_arrow_up.gif',alt:'open'});
		}
		$(this).parent().next(".box").slideToggle("slow");
	});
}
