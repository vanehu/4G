
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
		var pageType = $.trim($("#pageType").val());
		var qryNumber = $.trim($("#p_qryNumber").val());
		var p_olNbr = $.trim($("#p_olNbr").val());		
		var startDt = $("#p_startDt").val().replace(/-/g,'');
		var endDt = $("#p_endDt").val().replace(/-/g,'');
		var temp = $("#p_channelId").val();
		var channelId = "";
		
		if(temp == null || temp == "" || temp == undefined){
			channelId = OrderInfo.staff.channelId;
		} else{
			channelId = temp;
		}		
		
		try {
			var startDate = new Date($("#p_startDt").val());
			var endDate = new Date($("#p_endDt").val());
			if((endDate.getTime() - startDate.getTime())/1000/60/60/24 > 7){
				$.alert("提示","请将查询时间段缩小到7天之内 !");
				return;
			}
		} catch (e) {
		}
//		if(endDt - startDt > 7){
//			$.alert("提示","请将查询时间段缩小到7天之内 !");
//			return;
//		}
		if(channelId==null ||channelId==""||channelId==undefined){
			$.alert("提示","渠道Id为空");
			return ;
		} else if((qryNumber==null ||qryNumber==""||qryNumber==undefined) && (p_olNbr==null ||p_olNbr==""||p_olNbr==undefined)){
			$.alert("提示","请输入接入号或购物车流水 !");
			return ;
		}
		var param = {"areaId":$("#p_areaId").val(),
				"olNbr":p_olNbr,
				"qryBusiOrder":$("#p_qryBusiOrder").val(),
				"startDt":startDt,
				"endDt":endDt,
				"qryNumber":qryNumber,
				"channelId":channelId,
				"olStatusCd":"100002",
				"busiStatusCd":"100002",
				"tSOrder":"Y",
				"staffId":$("#p_staffId").val(),
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
    	window.location.href=contextPath+"/order/orderReduction?areaId="+orderParam.areaId+"&acctNbr="+orderParam.acctNbr+"&custId="+orderParam.custId+"&soNbr="+orderParam.soNbr+"&instId="+orderParam.instId+"&olId="+orderParam.olId+"&channelId="+orderParam.channelId;
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
				"qryBusiOrder":$("#p_qryBusiOrder").val(),
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
	
	//受理工号查询和渠道查询(现用于受理订单查询页面)
	var _qureyStaffAndChlPage = function(qryPage){
		/*var channelTypeCd = $("#channelTypeCd").val();
		if(channelTypeCd == undefined || channelTypeCd == ""){
			$.alert("提示","请选择渠道类型");
			return ;
		}*/
		_qureyStaffAndChl($("#queryFlag_dialog").val(),qryPage);
	};
	
	var _qureyStaffAndChl = function(queryFlag,qryPage){
		
		var pageType = 'cashier'; //页面标识，查询购物车，区别于受理订单查询
		var param = {};
		var div_dialog;
		var pageSize = 10;
		var list_body;
		
		//获取地区ID
		var aredId = $("#p_areaId").val();
		
		if("queryStaff" == queryFlag){//拼装受理工号查询参数
			if($("#p_channelId").val() == undefined || $("#p_channelId").val() == "" || $("#p_channelId").val() == null){
				$.alert("提示","请先选择渠道 !");
				return ;
			}
			var channelId = $("#p_channelId").val();
			var channelName = $("#qureyChannelList").val();
			if(channelName == "" || channelName == null || channelName == undefined)
				channelName = $("#p_channelId").find("option:selected").text();
			param = {		
					"pageType" : pageType,
					"queryFlag":queryFlag,//查询标志，用于区分受理工号查询和渠道查询
					"areaId":aredId,
					"areaId_val":$("#p_areaId_val").val(),
					"staffCode":$("#staffCode_dialog").val(),//受理工号
					"staffName":$("#staffName_dialog").val(),//受理人
					"channelId":channelId,
					"channelName":channelName,
					"pageSize":pageSize,
					"pageIndex":qryPage
			};
			div_dialog = "qureyByStaffCode_dialog";
			list_body = "staff_list_body";
			
		} else if("queryChannel" == queryFlag){//拼装渠道查询参数
			
			param = {
					"pageType" : pageType,
					"queryFlag":queryFlag,//查询标志，用于区分受理工号查询和渠道查询(不作为后台的入参)
					"dbRouteLog":aredId,//数据库路由标识,针对转售系统：转售商Id; 4G系统：地区ID
					"commonRegionId":aredId,
					"areaId_val":$("#p_areaId_val").val(),
					"channelName":$("#channelName_dialog").val(),
					"channelId":$("#p_channelId").val(),
					//"channelTypeCd":$("#channelTypeCd_dialog").val(),//渠道类别
					"pageSize":""+pageSize+"",
					"pageIndex":""+qryPage+""
			};
			div_dialog = "qureyByChannel_dialog";
			list_body = "channel_list_body";
		}

		$.callServiceAsHtml(contextPath+"/report/qureyStaffAndChl",param,{
			"before":function(){
				$.ecOverlay("正在查询，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					response.data='';
				}
				$("#"+div_dialog).html(response.data);
				
				$("#"+list_body+" tr").each(function(){$(this).off("click").on("click",function(event){
					_linkSelectPlan("#"+list_body+" tr",this);
					event.stopPropagation();
					});});
				easyDialog.open({
					container : div_dialog
				});
			},
			"fail":function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	var _linkSelectPlan=function(loc, selected){
		$(loc).removeClass("plan_select");
		$(loc).children(":first-child").html("");
		$(selected).addClass("plan_select");
		var nike="<i class='select'></i>";
		$(selected).children(":first").html(nike);
	};
	
	var _setStaff = function(){
		var $staff = $("#staff_list_body .plan_select");
		$staff.each(function(){
			$("#qureyStaffCode").val($(this).attr("staffCode"));
			$("#p_staffId").val($(this).attr("staffId"));
		});
		if($staff.length > 0){
			easyDialog.close();
		}else{
			$.alert("操作提示","您没有选择任何记录 !");
		}
	};
	
	var _setChannel = function(){
		var $channel = $("#channel_list_body .plan_select");
		$channel.each(function(){
			$("#qureyChannelList").val($(this).attr("channelName"));
			$("#p_channelId").val($(this).attr("channelId"));
			//每次改变渠道时，启动清空受理工号内容
			$("#qureyStaffCode").val("");
			$("#p_staffId").val("");
		});
		if($channel.length > 0){
			easyDialog.close();
		}else{
			$.alert("操作提示","您没有选择任何记录 !");
		}
	};
	
	var _chooseArea = function(){
		order.area.chooseAreaTreeManger("report/cartMain","p_areaId_val","p_areaId",3);
	};
	
	/**
	 * 需求：#81646，收银台、暂存单查询，这2个菜单，能力开放的暂存单（包括界面集成、接口）限制继续受理
	 * 说明：当查询到的单子为能力开放的单子，此时该函数为收银台查询的“还原”按钮添加样式，_addStyle须与_removeStyle配合使用，缺一不可。
	 * @author ZhangYu 2016-2-1
	 */
	var _addStyle = function(olId){
		$("#p_"+olId).css("color","red");
	};
	var _removeStyle = function(olId){
//		$("#p_"+olId).css("color","");
		$("#p_"+olId).removeAttr("style");
	};
	
    
	return {
		removeStyle			:_removeStyle,
		addStyle			:_addStyle,
		queryCartList		:_queryCartList,
		initDic				:_initDic,
		queryCashierList	:_queryCashierList,
		reduction			:_reduction,
		qureyStaffAndChl	:_qureyStaffAndChl,
		qureyStaffAndChlPage:_qureyStaffAndChlPage,
		setStaff			:_setStaff,
		setChannel			:_setChannel,
		chooseArea			:_chooseArea
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
	
	$("#qureyChannelList").off("click").on("click",function(){//渠道查询	
		cashier.main.qureyStaffAndChl("queryChannel",0);
	});
	
	cashier.main.initDic();
	
	$("#bt_resetStaffCode").off("click").on("click",function(){//清空受理工号staffCode和staffId
		$("#qureyStaffCode").val("");
		$("#p_staffId").val("");
	});
	$("#qureyStaffCode").off("click").on("click",function(){//受理工号查询
		cashier.main.qureyStaffAndChl("queryStaff",0);
	});

});