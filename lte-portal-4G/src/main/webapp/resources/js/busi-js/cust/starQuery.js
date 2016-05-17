CommonUtils.regNamespace("cust", "starQuery");

/**
 *星级服务查询.
 */
cust.starQuery = (function(){
	var _starServiceQuery = function(){
		var star_pm = $("#star_pm").val();
		/*var munberRex = /^(1[3578]\d{9}|[0-9]\d{7}|[1-9]\d{6})$/;*/
		if(star_pm.length<11){
			$.alert("提示","号码规则不符合,请确认后重新输入！");
			return	;
		}
		var param ={
				"acctNbr":star_pm,
				"areaId":$("#p_areaId").val()
		};
		$.callServiceAsHtmlGet(contextPath+"/cust/starQueryList",param,{
			"before":function(){
				$.ecOverlay("星级服务查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else if(response.data && response.data.substring(0,6)!="<table"){
					$.alert("提示",response.data);
				}else{
					$("#cart_list").html(response.data).show();
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
		
	};
	
	var _starQueryHisList = function starQueryHisList(acctNbr){
		var param ={
				"queryTypeValue":acctNbr,
				"conditions" : [
								{
									  "condItemId" :"2",
									   "condItemValue" : $("#startDt").val().replace(/-/g,'')
								},
								{
						         	   "condItemId" :"3",
						        	   "condItemValue" : $("#endDt").val().replace(/-/g,'')
						         }
				                ]
		};
		$.callServiceAsHtml(contextPath+"/cust/starQueryHisList",param,{
			"before":function(){
				$.ecOverlay("星级服务历史记录查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else if(response.data && response.data.substring(0,6)!="<table"){
					$.alert("提示",response.data);
				}else{
					$("#cart_list").html(response.data).show();
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	var _chooseArea = function(){
		order.area.chooseAreaTreeManger("report/cartMain","p_areaId_val","p_areaId",3);
	};
	return {
		starServiceQuery : _starServiceQuery,
		chooseArea : _chooseArea,
		starQueryHisList : _starQueryHisList 
	};
})();
//初始化
$(function(){
	$("#bt_starQry").off("click").on("click",function(){cust.starQuery.starServiceQuery();});
	//时间段选择控件限制
	$("#startDt").off("click").on("click",function(){
		$.calendar({ format:'yyyy-MM-dd ',real:'#startDt',maxDate:$("#endDt").val() });
	});
	$("#endDt").off("click").on("click",function(){
		$.calendar({ format:'yyyy-MM-dd ',real:'#endDt',minDate:$("#startDt").val(),maxDate:'%y-%M-%d' });
	});
});