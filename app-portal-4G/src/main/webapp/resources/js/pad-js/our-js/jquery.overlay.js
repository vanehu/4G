/**
 * 全局异步提示框
 * @author liusd
 */
(function($) {
    $.extend($, {
    	ecOverlay:function(text){
    		//默认不透明
    		var flag = false;
    		//默认主题风格
    		var theme = "b";
			if(!text){
		        text = "加载中...";
		    }
		    $(".ui-loader h1").html(text);
		    var _width = window.innerWidth;
		    var _height = window.innerHeight;
		    var htmlstr = '<div id="pad-lock-layer" style="width:'+_width+'px;height:'
		    			+_height+'px;position:fixed;top:0px;left:0px;opacity:0.2;z-index:99999" class="loader-bg"></div>';
		    $("body").append(htmlstr);
		    if(flag){
		        $(".ui-loader").removeClass("ui-loader-verbose").addClass("ui-loader-default");
		    }else{
		        $(".ui-loader").removeClass("ui-loader-default").addClass("ui-loader-verbose");
		    }
		    var cla = "ui-body-"+theme;
		    $("html").addClass("ui-loading");
		    var arr = $(".ui-loader").attr("class").split(" ");
		    var reg = /ui-body-[a-f]/;
		    for(var i in arr){
		        if(reg.test(arr[i])){
		            $(".ui-loader").removeClass(arr[i]);
		        }
		    }
		    $(".ui-loader").addClass(cla);
    	},
      	unecOverlay:function(){
  			$("html").removeClass("ui-loading");
			$("#pad-lock-layer").remove();
    	}
    });
})(jQuery, this);