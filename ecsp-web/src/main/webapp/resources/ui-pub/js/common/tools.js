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
//列表工具条
function initToolbar(toolbardata){
	var toolHtml="";
    if(toolbardata.length>0){
    	toolHtml+='<div class="l-panel-topbar l-toolbar">';
    	for(var i=0;i<toolbardata.length;i++){
    		toolHtml+='<div class="l-toolbar-item l-panel-btn l-toolbar-item-hasicon" onclick="'+toolbardata[i].click+'">';
    		toolHtml+='<table width="100%" height="90%" border="0" cellspacing="0" cellpadding="0">';
    		toolHtml+='<tr><td align="center"><div class="l-icon '+toolbardata[i].css+'"></div></td></tr>';
    		toolHtml+='<tr><td><span class="form_menu">'+toolbardata[i].text+'</span></td></tr>';
    		toolHtml+='</table>';
    		toolHtml+='</div>';
    	}
    	toolHtml+='</div>';
    }
    return toolHtml;
}
//菜单伸缩特效
function initToggle(){
	var contextPath = top.contextPath;
	$("div.box").show();
	$(".l-form .yy .l-group img").click(function(){
		if($(this).attr("alt")=="open"){
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

(function($) {
	$.fn.tip = function(options) {
		var _options = {
			content: '必填项'
		};
		var tipDiv = '<div class="tips" style="display: none; z-index: 1;">';
		tipDiv += '<div class="l-verify-tip">';
		tipDiv += '<div class="l-verify-tip-corner"></div>';
		tipDiv += '<div class="l-verify-tip-content"></div>';
		tipDiv += '</div></div>';

		var _opt = $.extend({}, _options, options || {});

		return this.each(function() {
			var tip = null;
			var objId = $(this).attr("id") + "Tip";
			var tips = $(".tips");
			if (tips.length) {
				tips.each(function() {
					if ($(this).attr("id") === objId) {
						tip = $(this);
						return false;
					}
				});
			}
			if (tip === null) {
				tip = $(tipDiv);
				var px = $(this).offset().left + $(this).width();
				var py = $(this).offset().top;
				tip.css({left: px, top: py}).attr("id", objId).appendTo("body");
			}
			if (_opt.width) {
				$(".l-verify-tip:first", tip).width(_opt.width);
			} else {
				if (_opt.content === _options.content) {
					$(".l-verify-tip:first", tip).width(95);
				}
			}
			$(".l-verify-tip-content:first", tip).text(_opt.content);
			tip.show();
		});
	};
	$.fn.hideTip = function() {
		return this.each(function() {
			var objId = $(this).attr("id") + "Tip";
			$("#" + objId).remove();
		});
	};
	$.fn.toolBar = function(options) {
		var _options = $.extend({}, options || {});
		return this.each(function() {
			if (!$.isEmptyObject(_options)) {
				var toolbar = $('<div class="l-panel-topbar l-toolbar">');
				$(this).append(toolbar);
				$.each(_options.items, function(index, item) {
					var menuItem = '<div class="l-toolbar-item l-panel-btn l-toolbar-item-hasicon">';
					menuItem += '<table width="100%" height="90%" border="0" cellspacing="0" cellpadding="0">';
					if (item.icon) {
						menuItem += '<tr><td align="center"><div class="l-icon l-icon-';
						menuItem += item.icon + '"></div></td></tr>';
					}
					if (item.text) {
						menuItem += '<tr><td><span class="form_menu">';
						menuItem += item.text + '</span></td></tr>';
					}
					menuItem += '</table></div>';

					var menu = $(menuItem);
					toolbar.append(menu);
					if (item.id) {
						menu.attr('toolbarid', item.id);
					}
					if (item.click) {
						menu.click(function() {
							item.click(item);
						});
					}
				});
			}
		});
	};
	$.fn.tab = function(options) {
		var _options = {
			//默认首个TAB项选中
			selectedTab: 1,
			onSelectTabItem: null
		};
		var _opt = $.extend({}, _options, options || {});
		var selectedIndex = _opt.selectedTab - 1;
		return this.each(function() {
			var tabLinks = $('<div class="l-tab-links"><ul></ul></div>');
			$(this).wrapInner('<div class="l-tab-content">').prepend(tabLinks);
			var tabContent = $("div.l-tab-content", $(this));
			tabContent.children("div").each(function(i) {
				$(this).css("padding", 10);
				var li = $('<li style="border-right:0px">');
				$("ul", tabLinks).append(li);
				var tabId = $(this).attr("id");
				if (tabId == "undefined") {
					tabId = "tabid" + i;
				}
				var tabName = $(this).attr("title");
				if (tabName) {
					$(this).removeAttr("title");
				}
				li.attr("tabid", tabId).append("<a>" + tabName + "</a>").click(function() {
					$("li", tabLinks).removeClass();
					$(this).addClass("l-selected");
					$(".l-tab-content-item", tabContent).hide();
					$(".l-tab-content-item:eq(" + i + ")", tabContent).show();
					if (_opt.onSelectTabItem) {
						_opt.onSelectTabItem(tabId);
					}
				});
				$(this).addClass("l-tab-content-item").attr("tabid", tabId).hide();
			});

			//设置内容高度
			if (_opt.height) {
				tabContent.height(_opt.height);
			}

			//设置选中项
			$("li:eq(" + selectedIndex + ")", tabLinks).addClass("l-selected");
			$(".l-tab-content-item:eq(" + selectedIndex + ")", tabContent).show();

			//最后的TAB项加上右边框
			$("li:last", tabLinks).removeAttr("style");
		});
	};
})(jQuery);
