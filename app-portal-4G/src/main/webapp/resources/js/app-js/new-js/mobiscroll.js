/* -------------------------------
 * 仿原生选择插件，含select、日期、时间、地区、二联、三联等
 * -------------------------------*/
$(function() {
	$("div[class='switch']").each(function() {
		$this = $(this);
		var onColor = $this.attr("onColor");
		var offColor = $this.attr("offColor");
		var onText = $this.attr("onText");
		var offText = $this.attr("offText");
		var labelText = $this.attr("labelText");

		var $switch_input = $(" :only-child", $this);
		$switch_input.bootstrapSwitch({
			onColor: onColor,
			offColor: offColor,
			onText: onText,
			offText: offText,
			labelText: labelText
		});
	});
	// -------------------------------------------------------------------
	// Demo page code START, you can disregard this in your implementation
	var demo, theme, mode, display, lang;
	init();
	// Demo page code END
	// -------------------------------------------------------------------

});

function init() {
	// Select demo initialization
	$('.myselect').mobiscroll().select({
		theme: "android-holo-light", // Specify theme like: theme: 'ios' or omit setting to use default 
		mode: "scroller", // Specify scroller mode like: mode: 'mixed' or omit setting to use default 
		display: "bottom", // Specify display mode like: display: 'bottom' or omit setting to use default 
		lang: "zh", // Specify language like: lang: 'pl' or omit setting to use default 
		inputClass: "form-control",
	});

};

function mycity() {
	$('.treelist').mobiscroll().treelist({
		theme: "android-holo-light", // Specify theme like: theme: 'ios' or omit setting to use default 
		mode: "scroller", // Specify scroller mode like: mode: 'mixed' or omit setting to use default 
		display: "bottom", // Specify display mode like: display: 'bottom' or omit setting to use default 
		lang: "zh", // Specify language like: lang: 'pl' or omit setting to use default 
		placeholder: "请选择地区",
		inputClass: "form-control",
		showLabel: true,
		labels: ['省', '市', '区'], // More info about labels: http://docs.mobiscroll.com/2-14-0/list#!opt-labels
		formatResult: function(array) { //返回自定义格式结果  
			var city1 = $('.treelist>li').eq(array[0]).children('span').text();
			var city2 = $('.treelist>li').eq(array[0]).children('ul').children("li").eq(array[1]).children('span').text();
			var city3 = $('.treelist>li').eq(array[0]).children('ul').children("li").eq(array[1]).find('ul li').eq(array[2]).text().trim(' ');
			return city1 + ' ' + city2 + ' ' + city3;
		}

	});
};

function mydate() {
	$('.mydate').mobiscroll().date({
		theme: "android-holo-light", // Specify theme like: theme: 'ios' or omit setting to use default 
		mode: "scroller", // Specify scroller mode like: mode: 'mixed' or omit setting to use default 
		display: "bottom", // Specify display mode like: display: 'bottom' or omit setting to use default 
		lang: "zh", // Specify language like: lang: 'pl' or omit setting to use default 
		// wheels:[], 设置此属性可以只显示年月，此处演示，就用下面的onBeforeShow方法,另外也可以用treelist去实现  
		showLabel: true,
		headerText: function(valueText) { //自定义弹出框头部格式  
			array = valueText.split('/');
			return array[0] + "年" + array[1] + "月" + array[2] + "日";
		}
	}); // Date & Time demo initialization

}