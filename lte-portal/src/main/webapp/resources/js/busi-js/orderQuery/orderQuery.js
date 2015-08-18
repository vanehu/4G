CommonUtils.regNamespace("order", "query");

/**
 *订单查询.
 */
order.query = (function(){
	
	var _init = function(){
		$("#bt_orderQry").off("click").on("click",function(){_queryOrderList(1);});
	};
	
	//查询
	var _queryOrderList = function(pageIndex){
		if(!$("#p_areaId_val").val()||$("#p_areaId_val").val()==""){
			$.alert("提示","请选择'地区'再查询");
			return ;
		}
		var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
		var param = {"p_areaId":$("#p_areaId").val(),
				"p_startTime":$("#p_startTime").val().replace(/-/g,''),
				"p_endTime":$("#p_endTime").val().replace(/-/g,''),
				"p_channelId":$("#p_channelId").val(),
				"p_olNbr":$("#p_olNbr").val(),
				"p_hm":$("#p_hm").val(),
				"p_bussType":$("#p_bussType").val(),
				"p_orderStatus":$("#p_orderStatus").val(),
				"p_partyId":OrderInfo.cust.custId==undefined?"":OrderInfo.cust.custId,
				curPage:curPage,
				pageSize:10
		};
		
		$.callServiceAsHtmlGet(contextPath+"/orderQuery/list",param,{
			"before":function(){
				$.ecOverlay("订单查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					 response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>not data return,please try reload again.</strong></div>';
				}
				var content$=$("#order_list");
				content$.show().addClass("pageright").removeClass("in out").addClass("out");
				setTimeout(function(){
					content$.html(response.data).removeClass("cuberight in out").addClass("pop in");
					setTimeout(function(){
						content$.removeClass("pop in out");
					},500);
				},500);
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	var _chooseAree = function(){
		order.area.chooseAreaTreeManger("orderQuery","p_areaId_val","p_areaId",3);
	};
	
	return {
		queryOrderList:_queryOrderList,
		init:_init,
		showMain:_showMain,
		chooseAree:_chooseAree
	};
})();
//初始化
$(function(){
	order.query.init();
});