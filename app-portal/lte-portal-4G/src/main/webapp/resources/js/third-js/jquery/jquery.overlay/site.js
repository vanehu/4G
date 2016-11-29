$(function() {
	$.ecOverlay("<strong>data is submit,<BR>please wait....</strong>");
	//若存在遮障层,再调用遮障层,只替换文字
	setTimeout(function(){$.ecOverlay("<strong>aadfadf,<BR>please wait....</strong>");},3000);
	
	setTimeout(function(){$.unecOverlay();},10000);
});