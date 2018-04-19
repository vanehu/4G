/**
 * 天翼高清机顶盒预约查询
 */
CommonUtils.regNamespace("STB", "reserveQuery");

STB.reserveQuery = (function(){
	
	//地区选择控件
	var _chooseArea = function(){
		order.area.chooseAreaTreeManger("STB/preQueryReserveOrders", "STB_areaName", "STB_areaId", 3);
	};
	
	//查询预约订单
	var _queryReserveOrders = function(){
		
		var _areaId = $("#STB_areaId").val();
		if(_areaId==""){
			$.alert("提示", "请选择下单地区");
			return;
		}
		
		var _startDate = $("#STB_startDt").val().replace(/-/g,'');
		var _endDate = $("#STB_endDt").val().replace(/-/g,'');
		if(_startDate=="" || _endDate==""){
			$.alert("提示", "请选择下单的时间段");
			return;
		}
		
		var params = {
				areaId : _areaId,
				channelId : $("#STB_channelId").val(),
				startDate : _startDate,
				endDate : _endDate,
		};
		
		var _reserveId = $.trim($("#STB_reserveId").val());
		if(_reserveId!=""){
			params.reserveId = _reserveId;
		}
		var _identityNum = $.trim($("#STB_identityNum").val());
		if(_identityNum!=""){
			params.identityNum = _identityNum;
		}
		var _custName = $.trim($("#STB_custName").val());
		if(_custName!=""){
			params.custName = _custName;
		}
		
		$.callServiceAsHtmlGet(contextPath+"/STB/queryReserveOrders", params, {
			"before" : function(){
				$.ecOverlay("<strong>查询中,请稍等...</strong>");
			},
			"always" : function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					response.data='<div style="margin:2px 0 2px 0;width:100%,height:100%;text-align:center;"><strong>no data return,please try reload.</strong></div>';					
				}
				if(response.data =="fail\r\n"){
					$.alert("提示","查询失败，请稍后再试");
					return;
				}
				if(response.data =="error\r\n"){
					$.alert("提示","数据异常，请联系管理员");
					return;
				}
				$("#STBreserveOrdersTable").html(response.data).show();				
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
		
	};
	
	//显示或者隐藏额外信息
	var _slideMoreInfo = function(a){
		$(a).parent().find("p").slideToggle();
	};

	
	return {
		chooseArea : _chooseArea,
		queryReserveOrders : _queryReserveOrders,
		slideMoreInfo : _slideMoreInfo
	};
	
})();

//初始化
$(function(){
	
	$("#STB_startDt").off("click").on("click", function(){
		$.calendar({ format:'yyyy-MM-dd', maxDate:$("#STB_endDt").val() });
	});
	$("#STB_endDt").off("click").on("click", function(){
		$.calendar({ format:'yyyy-MM-dd', minDate:$("#STB_startDt").val() });	
	});
	
});