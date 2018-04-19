CommonUtils.regNamespace("cart", "main");

cart.main = (function(){
	var _queryCartInfo=function(olId){
		var param = {"olId":olId};
		$.callServiceAsHtmlGet(contextPath+"/report/cartInfo",param,{
			"before":function(){
				$.ecOverlay("详情查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>not data return,please try reload again.</strong></div>';
				}
				var resData = response.data ;
				//var resType= resData.substring(0,1) ;
				//if(resType!=0&&resType!="0"){
				if(resData!=-1&&resData!="-1"){
					$("#d_query").hide();
					$("#d_cartInfo").html(response.data).show();
				}else{
					$.alert("提示","未获取到购物车详情！");
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	var _showMain = function(){
		$("#d_cartInfo").hide();
		$("#d_query").show();
	};
	return {
		queryCartInfo:_queryCartInfo,
		showMain:_showMain
	};
	
})();