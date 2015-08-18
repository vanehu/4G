
CommonUtils.regNamespace("cashier", "main");

/**
 *收银台查询.
 */
cashier.main = (function(){
	
	//查询
	var _queryCartList = function(pageIndex){
		var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
		var pageType=$("#pageType").val();
		var qryNumber=$("#p_qryNumber").val();
		var p_olNbr = $("#p_olNbr").val();		
		var startDt = $("#p_startDt").val().replace(/-/g,'');
		var endDt = $("#p_endDt").val().replace(/-/g,'');
		var temp = $("#p_channelId").val();
		var channelId = "";
		
		if(temp == null || temp == "" || temp == undefined){
			channelId = OrderInfo.staff.channelId;
		} else{
			channelId = temp;
		}		
		if(endDt - startDt > 7){
			$.alert("提示","请将查询时间段缩小到7天之内 !");
			return;
		}
		if(channelId==null ||channelId==""||channelId==undefined){
			$.alert("提示","渠道Id为空");
			return ;
		} else if((qryNumber==null ||qryNumber==""||qryNumber==undefined) && (p_olNbr==null ||p_olNbr==""||p_olNbr==undefined)){
			$.alert("提示","请输入接入号或购物车流水 !");
			return ;
		}
		var param = {"areaId":$("#p_areaId").val(),
				"olNbr":p_olNbr,
				"qryBusiOrder":"1",
				"startDt":startDt,
				"endDt":endDt,
				"qryNumber":qryNumber,
				"channelId":channelId,
				"olStatusCd":"100002",
				"busiStatusCd":"100002",
				"tSOrder":"Y",
				nowPage:curPage,
				pageSize:10,
				pageType : pageType, //页面类型标志，控制购物车的操作按钮
				"queryFlag":"queryCashierList"//标志该查询为收银台查询，以便与其他查询区分
		};
		_queryCashierList(param);
	};
	
	var _queryCashierList = function(param){
		$.callServiceAsHtmlGet(contextPath+"/report/cartList",param,{
			"before":function(){
				$.ecOverlay("购物车查询中，请稍等...");
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
	
    var _reduction = function(orderParam){
    	if(null==orderParam.areaId || ''==orderParam.areaId){
    		$.alert("提示","受理地区为空,该暂存单不能还原！");
			return;
    	}
    	//if(null==orderParam.acctNbr || ''==orderParam.acctNbr){
    	//	$.alert("提示","接入号码为空,该暂存单不能还原！");
			//return;
    	//}
    	//if(null==orderParam.custId || ''==orderParam.custId){
    	//	$.alert("提示","客户ID为空,该暂存单不能还原！");
			//return;
    	//}
    	if(null==orderParam.soNbr || ''==orderParam.soNbr){
    		$.alert("提示","订单流水号为空,该暂存单不能还原！");
			return;
    	}
    	//if(null==orderParam.instId || ''==orderParam.instId){
    	//	$.alert("提示","产品实例ID为空,该暂存单不能还原！");
			//return;
    	//}
    	if(null==orderParam.olId || ''==orderParam.olId){
    		$.alert("提示","购物车Id为空,该暂存单不能还原！");
			return;
    	}
    	window.location.href=contextPath+"/order/orderReduction?areaId="+orderParam.areaId+"&acctNbr="+orderParam.acctNbr+"&custId="+orderParam.custId+"&soNbr="+orderParam.soNbr+"&instId="+orderParam.instId+"&olId="+orderParam.olId;
    };
	
	var _initDic = function(){
		var param = {"attrSpecCode":"EVT-0002"} ;
		$.callServiceAsJson(contextPath+"/staffMgr/getCTGMainData",param,{
			"done" : function(response){
				if(response.code==0){
					var data = response.data ;
					if(data!=undefined && data.length>0){
						for(var i=0;i<data.length;i++){
							var busiStatus = data[i];
							$("#p_busiStatusCd").append("<option value='"+busiStatus.attrValueCode+"' >"+busiStatus.attrValueName+"</option>");
							$("#p_olStatusCd").append("<option value='"+busiStatus.attrValueCode+"' >"+busiStatus.attrValueName+"</option>");
						}
					}
				}else if(response.code==-2){
					$.alertM(response.data);
					return;
				}else{
					$.alert("提示","调用主数据接口失败！");
					return;
				}
			}
		});
		var pageType=$("#pageType").val();
		var channelId = OrderInfo.staff.channelId;
		var queryParam = {
				"areaId":$("#p_areaId").val(),
				"olNbr":"",
				"qryBusiOrder":"1",
				"startDt":$("#p_startDt").val().replace(/-/g,''),
				"endDt":$("#p_endDt").val().replace(/-/g,''),
				"qryNumber":"",
				"channelId":channelId,
				"olStatusCd":"100002",
				"busiStatusCd":"100002",
				"tSOrder":"Y",
				nowPage:1,
				pageSize:10,
				pageType : pageType, //页面类型标志，控制购物车的操作按钮
				"queryFlag":"queryCartList"//标志该查询为收银台查询，以便与其他查询区分
		};
		_queryCashierList(queryParam);
		
	};
		
	
	
	return {
		queryCartList:_queryCartList,
		initDic:_initDic,
		queryCashierList:_queryCashierList,
		reduction:_reduction
	};
	
})();
//初始化
$(function(){
	
	$("#p_startDt").off("click").on("click",function(){
		$.calendar({ format:'yyyy年MM月dd日 ',real:'#p_startDt',maxDate:$("#p_endDt").val() });
	});
	$("#p_endDt").off("click").on("click",function(){
		$.calendar({ format:'yyyy年MM月dd日 ',real:'#p_endDt',minDate:$("#p_startDt").val(),maxDate:'%y-%M-%d' });	
	});
	
	cashier.main.initDic();

});