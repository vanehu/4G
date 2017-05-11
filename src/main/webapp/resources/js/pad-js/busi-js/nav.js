CommonUtils.regNamespace("pad", "nav");
/**
 * 4g pad版本菜单控制
 * 暂时没用,已移到main.js
 */
pad.nav = (function($){
	var _menuCtrl = function(){
		$("#a_logobar").off("tap").on("tap",function(){
		    $("#navbar").slideToggle(400);
		});
		$("#a_logobar").off("taphold").on("taphold",function(){
		    window.location.href = contextPath+"/pad/main/home";
		});
	}
	return {
		menuCtrl:_menuCtrl
	};
})(jQuery);
$(function(){
	pad.nav.menuCtrl();
});