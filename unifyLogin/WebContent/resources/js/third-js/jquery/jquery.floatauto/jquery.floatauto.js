/**
 * @author tang zheng yu
 */
(function($) {
	var default_options = {
			effect : "show",//显示动画事件
			opacity:0.5,
			top:null,
			left:null
	};
   var create= function (options) {
	   var opt=null;
	   if(typeof options=="string"){
		   opt=default_options;
		   opt.content=options;
	   } else {
		   opt=$.extend({},default_options, options);
	   }
	   //判断是否已经存在,若存在则只替换文字
	   var ecOverLay$=$("div.ec-ui-widget-overlay");
	   var infoOverlay$=$("div.ec-dialog-info-overlay");
	   if(ecOverLay$.length>0 && infoOverlay$.length>0){		  
		   infoOverlay$.hide(function(){
			   $(this).html(opt.content).fadeIn(200);
		   });
	   }
	   if(ecOverLay$.length>0 && infoOverlay$.length>0){
		   return;
	   }
        $(window).on("resize", resize);
        var viewport_width=width(), viewport_height=height();
        var c = $("<div></div>").addClass("ec-ui-widget-overlay").appendTo(document.body).css({
            width: viewport_width,
            height: viewport_height,
            opacity:opt.opacity
        });
        var d = $("<div></div>").addClass("ec-dialog-overlay");
       
        var info = $("<div></div>").addClass("ec-dialog-info-overlay").append(opt.content);
        var icon = $("<div></div>").addClass("ec-dialog-icon-overlay").append(info);
        d.append(icon).appendTo(document.body).css({
        	"left": (viewport_width-d.width())/2,
            "top": (viewport_height-d.height())/2-50>0?(viewport_height-d.height())/2-50:(viewport_height-d.height())/2
        });
        c[opt.effect](opt.effectspeed);
        d[opt.effect](opt.effectspeed);
        return c;
    };
   var  destroy= function () {
        $([document, window]).off("resize");
        $(".ec-dialog-overlay").remove();
        $(".ec-ui-widget-overlay").remove();
    };
   var  resize= function () {
	   var viewport_width=width(), viewport_height=height();
        var c = $(".ec-ui-widget-overlay");
        c.css({
        	  width: viewport_width,
              height: viewport_height
        });
        var d = $(".ec-dialog-overlay");
        d.css({
        	"left": (viewport_width-d.width())/2,
            "top": (viewport_height-d.height())/2-50>0?(viewport_height-d.height())/2-50:(viewport_height-d.height())/2
        });
    };

   var height= function () {
        var d, c;
        if ($.browser.msie && $.browser.version < 7) {
            d = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
            c = Math.max(document.documentElement.offsetHeight, document.body.offsetHeight);
            if (d < c) {
                return $(window).height() ;
            } else {
                return d;
            }
        } else {
            return $(window).height();
        }
    };
   var  width= function () {
        var c, d;
        if ($.browser.msie && $.browser.version < 7) {
            c = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
            d = Math.max(document.documentElement.offsetWidth, document.body.offsetWidth);
            if (c < d) {
                return $(window).width() ;
            } else {
                return c;
            }
        } else {
            return $(window).width();
        }
    };
    $.extend($, {
    	ecOverlay:function(options){
    			create(options);	
    	},
      	unecOverlay:function(){
      			destroy();
    	}
    });
})(jQuery, this);