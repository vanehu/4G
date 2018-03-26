
CommonUtils.regNamespace("cart", "main");

/**
 *订单查询.
 */
cart.main = (function(){
	//滚动页面入口
	var _scroll = function(scrollObj){
		if(scrollObj && scrollObj.page && scrollObj.page >= 1){
			_queryCartList(scrollObj.page,scrollObj.scroll);
		}
	}
	//查询
	var _queryCartList = function(curPage,scroller){
		if(curPage<=0){
			curPage = 1 ;
		}
		var qryNumber=$("#p_qryNumber").val();
		var param = {} ;
		if($("#if_p_olNbr").attr("checked")){
			if(!$("#p_olNbr").val()||$.trim($("#p_olNbr").val())==""){
				$.alert("提示","请输入 '购物车流水' 再查询");
				return ;
				if(!$("#p_areaId_val").val()||$("#p_areaId_val").val()==""){
					$.alert("提示","请选择 '地区' 再查询");
					return ;
				}
			}
			param = {"areaId":$("#p_areaId").val(),
					"olNbr":$("#p_olNbr").val(),
					"qryBusiOrder":$("#p_qryBusiOrder").val(),
					"startDt":"",
					"endDt":"",
					"qryNumber":"",
					"channelId":"",
					"olStatusCd":"",
					"busiStatusCd":"",
					nowPage:curPage,
					pageSize:10,
					pageType : $("#pageType").attr("name") //页面类型标志，控制购物车的操作按钮
			};
		}else{
			if($("#p_endDt").val()==""){
				$.alert("提示","请选择受理时间");
				return;
			}
			param = {
					"startDt":$("#p_startDt").val().replace(/-/g,''),
					"endDt":$("#p_endDt").val().replace(/-/g,''),
					"qryNumber":qryNumber,
					"olStatusCd":$("#p_olStatusCd").val(),
					"busiStatusCd":$("#p_busiStatusCd").val(),
					"olNbr":"",
					"qryBusiOrder":$("#p_qryBusiOrder").val(),
					nowPage:curPage,
					pageSize:10,
					pageType : $("#pageType").attr("name") //页面类型标志，控制购物车的操作按钮
			};
			var areaId = null ;
			if($("#p_channelId").val()&&$("#p_channelId").val()!=""){
				areaId = $("#p_channelId").find("option:selected").attr("areaid");
				if(areaId==null||areaId==""||areaId==undefined){
					$.alert("提示","渠道地区为空，无法查询！");
					return ;
				}
				param["channelId"] = $("#p_channelId").val() ;
			}else{
				if(qryNumber==null ||qryNumber==""||qryNumber==undefined){
					$.alert("提示","请至少输入接入号码、购物车流水或者渠道中的一个！");
					return ;
				}			
				areaId = $("#p_areaId").val();
				if(areaId==null||areaId==""||areaId==undefined){
					$.alert("提示","请选择 '地区' 再查询");
					return ;
				}
				param["channelId"] = "" ;
			}
			param["areaId"] = areaId ;
			$("#main_content").find("div[data-role='collapsible']").collapsible({
			  	collapsed: true,
			  	trigger:"create"
			});
		} 
		/*
		if(!$("#p_startDt").val()||$("#p_startDt").val()==""){
			$.alert("提示","请选择'开始时间' 再查询");
			return ;
		}
		if(!$("#p_endDt").val()||$("#p_endDt").val()==""){
			$.alert("提示","请选择'结束时间' 再查询");
			return ;
		}
		*/
		$.callServiceAsHtmlGet(contextPath+"/pad/report/cartList",param,{
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
					var pp = $("#cart_list").html(response.data);
					$.jqmRefresh(pp);
					if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	function _queryCartInfo(olId){
		var param = {"olId":olId};
		$.callServiceAsHtmlGet(contextPath+"/pad/report/cartInfo",param,{
			"before":function(){
				$.ecOverlay("详情查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else if(response.data && response.data.substring(0,4)!="<div"){
					$.alert("提示",response.data);
				}else{
					$("#main_content").hide();
					$("#d_cartInfo").html(response.data).show();
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	}
	var _showMain = function(){
		$("#d_cartInfo").hide();
		$("#cart_link").hide();
		$("#main_content").show();
	};
	
	var _showOffer = function(obj){
		var param = {"olId":$(obj).attr("olid"),"boId":$(obj).attr("boid"),"offerId":$(obj).attr("offerid"),"prodId":$(obj).attr("prodid")};
		//alert(JSON.stringify(param));
		//return ;
		$.callServiceAsHtmlGet(contextPath+"/pad/report/cartOfferInfo",param,{
			"before":function(){
				$.ecOverlay("详情查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else if(response.data && response.data.substring(0,4)!="<div"){
					$.alert("提示",response.data);
				}else{
					$("#d_offer_info").html(response.data).show();
					$("#d_cartInfo").hide();
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	//购物车环节查询
	var _queryCartLink = function(_olId, _areaId, _olNbr, _channelId){
		
		var param = {				
				olId : _olId,
				areaId : _areaId,
				olNbr : _olNbr,
				channelId : _channelId
		};
		$.callServiceAsHtmlGet(contextPath+"/report/cartLink", param, {
			"before":function(){
				$.ecOverlay("环节查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				if(response && response.data){
					if(response.data==-1){
						$.alert("提示","购物车环节查询异常！");
					}else{
						$("#main_content").hide();
						$("#cart_link").html(response.data).show();
					}
				}else{
					$.alert("提示","购物车环节查询异常！");
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
		
	};
	
	//显示或者隐藏失败信息
	var _slideFailInfo = function(a){
		$(a).parent().find("p").slideToggle();
	};
	
	//施工单状态查询
	var _queryConstructionState = function(_areaId, _custOrderId, _orderItemGroupId, _channelId){
		
		var param = {
				areaId : _areaId,
				custOrderId : _custOrderId,
				orderItemGroupId : _orderItemGroupId,
				channelId : _channelId
		};
		$.callServiceAsHtmlGet(contextPath+"/report/constructionState", param, {
			"before":function(){
				$.ecOverlay("施工状态查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				if(!response){
					response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>no data return,please try reload.</strong></div>';					
				}
				if(response.data =="fail\r\n"){
					if(response.errorsList!=undefined && response.errorsList!="null"){
						$.alert("提示", response.errorsList);
					} 
					else{
						$.alert("提示","查询失败，请稍后再试");
					}
					return;
				}
				if(response.data =="error\r\n"){
					$.alert("提示","数据异常，请联系管理员");
					return;
				}
				$("#stateList").html(response.data);
				easyDialog.open({
					container : "construction_state"
				});
				$(".easyDialogclose").click(function(){
					easyDialog.close();
				});
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
		
	var _linkBackMain = function(){
		easyDialog.close();
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
	};
	
	var _chooseArea = function(){
		order.area.chooseAreaTreeManger("report/cartMain","p_areaId_val","p_areaId",3);
	};
	return {
		queryCartList:_queryCartList,
		initDic:_initDic,
		queryCartInfo:_queryCartInfo,
		showMain:_showMain,
		showOffer:_showOffer,
		queryCartLink:_queryCartLink,
		slideFailInfo : _slideFailInfo,
		chooseArea:_chooseArea,
		queryConstructionState:_queryConstructionState,
		linkBackMain:_linkBackMain,		
		scroll:_scroll
	};
	
})();
//初始化
$(function(){
	
	$("#bt_cartQry").off("click").on("click",function(){cart.main.queryCartList(1);});
	$("#p_startDt").off("click").on("click",function(){
		$.calendar({ format:'yyyy年MM月dd日 ',real:'#p_startDt',maxDate:$("#p_endDt").val() });
	});
	$("#p_endDt").off("click").on("click",function(){
		$.calendar({ format:'yyyy年MM月dd日 ',real:'#p_endDt',minDate:$("#p_startDt").val(),maxDate:'%y-%M-%d' });	
	});
	cart.main.initDic();
	
	$("#if_p_olNbr").off("tap").on("tap",function(){
		if($("#if_p_olNbr").val()=="n"){
			$("#p_areaId_val").css("background-color","white").attr("disabled", false) ;
			$("#p_olNbr").css("background-color","white").attr("disabled", false) ;
			$("#p_startDt").css("background-color","#E8E8E8").attr("disabled", true) ;
			$("#p_endDt").css("background-color","#E8E8E8").attr("disabled", true) ;
			$("#p_qryNumber").css("background-color","#E8E8E8").attr("disabled", true) ;
			$("#p_olStatusCd").css("background-color","#E8E8E8").attr("disabled", true) ;
			$("#p_busiStatusCd").css("background-color","#E8E8E8").attr("disabled", true) ;
			$("#p_channelId").css("background-color","#E8E8E8").attr("disabled", true) ;
		}else{
			$("#p_olNbr").css("background-color","#E8E8E8").attr("disabled", true) ;
			$("#p_startDt").css("background-color","white").attr("disabled", false) ;
			$("#p_endDt").css("background-color","white").attr("disabled", false) ;
			$("#p_qryNumber").css("background-color","white").attr("disabled", false) ;
			$("#p_olStatusCd").css("background-color","white").attr("disabled", false) ;
			$("#p_busiStatusCd").css("background-color","white").attr("disabled", false) ;
			$("#p_channelId").css("background-color","white").attr("disabled", false) ;
			if($("#p_channelId").val()!=""){
				$("#p_areaId_val").css("background-color","#E8E8E8").attr("disabled", true) ;
			}else{
				$("#p_areaId_val").css("background-color","white").attr("disabled", false) ;
			}
		}
	});
	$("#p_channelId").change(function(){
		if($(this).val()!=""){
			$("#p_areaId_val").css("background-color","#E8E8E8").attr("disabled", true) ;
		}else{
			$("#p_areaId_val").css("background-color","white").attr("disabled", false) ;
		}
	});
});