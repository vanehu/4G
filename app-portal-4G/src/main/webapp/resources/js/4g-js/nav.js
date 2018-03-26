$(document).ready(function($){
	$(".allsort").hover(function(){
			$(".navsortbg").show();
		},function(){
			$(".navsortbg").hide();
	});
});
(function($){
	$.fn.hoverForIE6=function(option){
		var s=$.extend({current:"hover",delay:0},option||{});
		$.each(this,function(){
			var timer1=null,timer2=null,flag=false;
			$(this).bind("mouseover",function(){
				if (flag){
					clearTimeout(timer2);
				}else{
					var _this=$(this);
					timer1=setTimeout(function(){
						_this.addClass(s.current);
						flag=true;
					},s.delay);
				}
			}).bind("mouseout",function(){
				if (flag){
					var _this=$(this);timer2=setTimeout(function(){
						_this.removeClass(s.current);
						flag=false;
					},s.delay);
				}else{
					clearTimeout(timer1);
				}
			})
		})
	}
})(jQuery);

$(".allsort").hoverForIE6({current:"allsorthover",delay:0});
$(".allsort .item").hoverForIE6({delay:0});

function animate(dir, step) {
	var position;
	position = parseInt($("#portaltop").css("margin-left"));
	var contentwidth;
	var sliderwidth;
	contentwidth = parseInt($("#content").css("width"));
	sliderwidth = parseInt($("#slider").css("width"));
	switch (dir) {
		case "right":
			position = ((position - step) < (sliderwidth - contentwidth)) ? (sliderwidth - contentwidth) : (position - step);
			break;
		case "left":
			position = ((position + step) > 0) ? 0 : (position + step);
			break;
		default:
			break;
	};
	
	$("#content").animate(
		{ marginLeft: position + "px" },
		800
	);
};
