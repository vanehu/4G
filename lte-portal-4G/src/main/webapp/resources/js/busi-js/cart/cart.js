
CommonUtils.regNamespace("cart", "main");

/**
 *订单查询.
 */
cart.main = (function(){
		
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
	
	function _setStaff(){
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
	}
	
	function _setChannel(){
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
	}
	
	//查询
	var _queryCartList = function(pageIndex){
		var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
		var pageType=$("#pageType").val();
		var pageType4EC = $("#pageType4EC").val();
		var qryNumber=$("#p_qryNumber").val();
		var permissionsType = $("#permissionsType").val();
		var param = {};
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
					"olStatusCd":"",
					"busiStatusCd":"",
					//"couponNumber":$("#p_couponNumber").val(),
					//"staffId":$("#qureyStaffCode").val(),
					"couponNumber":"",//终端串码
					"staffId":"",//员工ID(主键)
					nowPage:curPage,
					pageSize:10,
					pageType : $("#pageType").attr("name") //页面类型标志，控制购物车的操作按钮
			};
			if(pageType=="link" && permissionsType=="monitor"){
				var areaId = null ;
				if(!$("#p_areaId_val").val()||$("#p_areaId_val").val()==""){
					$.alert("提示","请选择'地区'再查询");
					return ;
				}else{
					//areaId = $("#p_channelId").find("option:selected").attr("areaid");
					var channelId = $("#p_channelId").val();
					if(channelId==null||channelId==""||channelId==undefined){
						$.alert("提示","渠道地区为空，无法查询！");
						return ;
					}
					param["channelId"] = channelId;
				}
				//param["areaId"] = areaId ;
				param["areaId"] = $("#p_areaId").val();
			}else{
				param["channelId"] = "" ;
			}
		}else if(pageType=="saveOrder"){//暂存单查询
			var zcd_chan_select = $("#zcd_chan_select").val();
			var zcd_region_select = $("#zcd_region_select").val();
			var channelId = $("#p_channelId").val();
			if(zcd_region_select=="0" && zcd_chan_select!="0"){
				channelId = "";
			}else if(zcd_region_select!="0" && zcd_chan_select=="0"){
				if(!$("#p_channelId").val()||$("#p_channelId").val()==""){
					$.alert("提示","请选择'渠道'再查询");
					return ;
				}
			}else if(zcd_region_select=="0" && zcd_chan_select=="0"){
				if(!$("#p_channelId").val()||$("#p_channelId").val()==""){
					channelId = "";
				}
			}
			if(!$("#p_startDt").val()||$("#p_startDt").val()==""){
				$.alert("提示","请选择'受理时间' 再查询");
				return ;
			}
			var curPage = 1 ;
			if(pageIndex>0){
				curPage = pageIndex ;
			}
			var param = {
					"areaId":$("#p_areaId").val(),
					"startDt":$("#p_startDt").val().replace(/-/g,''),
					"endDt":$("#p_endDt").val().replace(/-/g,''),
					"channelId":channelId,
					"olNbr":$("#p_olNbr").val(),
					"qryNumber":$("#p_hm").val(),
					"partyId":$("#custName").attr("name"),
					"olStatusCd":"100002",
					"busiStatusCd":"100002",
					"tSOrder":"Y",
					"staffId":"",
					"qryBusiOrder":"",
					"couponNumber":"",
					nowPage:curPage,
					pageSize:10
			};
		}else{
			if($("#p_startDt").val()==""){
				$.alert("提示","请选择受理时间");
				return;
			}
			var couponNumber = $("#p_couponNumber").val();
			if(couponNumber == null || couponNumber == undefined)
				couponNumber = "";
			param = {
					"startDt":$("#p_startDt").val().replace(/-/g,''),
					"endDt":$("#p_endDt").val().replace(/-/g,''),
					"qryNumber":qryNumber,
					"olStatusCd":$("#p_olStatusCd").val(),//购物车状态
					"busiStatusCd":$("#p_busiStatusCd").val(),//订单状态
					"olNbr":"",
					"qryBusiOrder":$("#p_qryBusiOrder").val(),//查询类型
					"couponNumber":couponNumber,//终端串码
					"staffId":$("#p_staffId").val(),//员工ID(主键)
					nowPage:curPage,
					pageSize:10,
					pageType : $("#pageType").attr("name") //页面类型标志，控制购物车的操作按钮
			};
			var areaId = $("#p_areaId").val();
			if($("#p_channelId").val()&&$("#p_channelId").val()!=""){
				//areaId = $("#p_channelId").find("option:selected").attr("areaid");
				var channelId = $("#p_channelId").val();
				if(channelId==null||channelId==""||channelId==undefined){
					$.alert("提示","渠道地区为空，无法查询！");
					return ;
				}
				param["channelId"] = channelId;
				if (pageType4EC == "link4EC" && !ec.util.isObj($("#p_busiStatusCd").val())) {
					$.alert("提示","渠道、订单状态必填！");
					return;
				}
			}else{
				if(pageType=="detail" || (pageType=="link" && permissionsType!="admin")){
					if (pageType4EC == "link4EC") {
						if (!ec.util.isObj($("#p_channelId").val()) || !ec.util.isObj($("#p_busiStatusCd").val())) {
							$.alert("提示","渠道、订单状态必填！");
							return;
						}
					} else {
						if(qryNumber==null ||qryNumber==""||qryNumber==undefined){
							var couponNumber = $("#p_couponNumber").val();
							if(couponNumber == null || couponNumber == "" || couponNumber == undefined){
								$.alert("提示","请至少输入接入号码、购物车流水、渠道或终端串码中的一个！");
								return ;
							}	
						}
					}
				}
				areaId = $("#p_areaId").val();
				if(areaId==null||areaId==""||areaId==undefined){
					$.alert("提示","请选择 '地区' 再查询");
					return ;
				}
				param["channelId"] = "" ;
			}
			param["areaId"] = areaId ;
			if (pageType=="voucher" || pageType=="reInvoice" || pageType=="addInvoice"){
				if(qryNumber==null ||qryNumber==""||qryNumber==undefined){
					$.alert("提示","请至少输入接入号码或者购物车流水中的一个！");
					return ;
				}
			}
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
		param.pageType = $("#pageType").val();
		if(pageType=="link"){
			param.permissionsType = $("#permissionsType").val();
			if (pageType4EC == "link4EC") {
				// 外部订单号
				param.extCustOrderId = $("#p_extCustOrderId").val();
				param.pageType4EC = pageType4EC;
			}
		}
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
	
	function _queryCartInfo(olId){
		var param = {"olId":olId};
		param.areaId=$("#p_areaId").val();
		$.callServiceAsHtmlGet(contextPath+"/report/cartInfo",param,{
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
					$("#d_query").hide();
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
		$("#d_query").show();
	};
	
	var _showOffer = function(obj){
		var param = {"olId":$(obj).attr("olid"),"boId":$(obj).attr("boid"),"offerId":$(obj).attr("offerid"),"prodId":$(obj).attr("prodid")};
		//alert(JSON.stringify(param));
		//return ;
		$.callServiceAsHtmlGet(contextPath+"/report/cartOfferInfo",param,{
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
					easyDialog.open({
						container : 'd_offer'
					});
					$("#d_offer_close").off("click").on("click",function(event){easyDialog.close();});
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
						$("#d_query").hide();
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
	
	//失败环节重发
	var _resendCustOrder = function(_custOrderId,_linkFlag,_msgId,_msgTypeCd,_dealFlag){
		
		//后台接口要求_dealFlag为null时传"",_msgId为""或为null时传0
		if(_dealFlag == null){
			_dealFlag = "";
		}
		if(_msgId == null || _msgId==""){
			_msgId = "0";
		}
		
		var param = {
				dealFlag:_dealFlag,
				custOrderId : _custOrderId,
				linkFlag :_linkFlag,
				msgId:_msgId,
				msgTypeCd:_msgTypeCd
		};
		$.callServiceAsJson(contextPath+"/report/resendCustOrder", param, {
			"before" : function(){
				$.ecOverlay("订单重发中，请稍等...");
			},
			"always" : function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code==-2){
					$.alertM(response.data);
					return;
				}
				if(response.code==1){
					$.alert("重发失败", response.data);
					return;
				}
				$.alert("提示", "重发请求发送成功，可以稍后重新查询确认是否施工完成");
			}
		});
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
							if($("#flag").val() == "1" && busiStatus.attrValueCode == 200000){
								$("#p_busiStatusCd").append("<option value='"+busiStatus.attrValueCode+"' selected>"+busiStatus.attrValueName+"</option>");
							}
							else{
								$("#p_busiStatusCd").append("<option value='"+busiStatus.attrValueCode+"' >"+busiStatus.attrValueName+"</option>");
							}
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
	
	var _chooseArea = function(url){
		order.area.chooseAreaTreeManger(ec.util.isObj(url) ? url : "report/cartMain","p_areaId_val","p_areaId",3);
	};
	
	var _cardProgressQuery = function(){
		var phoneNum=$("#p_qryNumber").val();
		var orderType=$("#p_orderType").val();
		var startTime="";
		var endTime="";
		if($("#if_p_time").attr("checked")){
			startTime=$("#p_startDt").val()+" 00:00:00";
			endTime=$("#p_endDt").val()+" 23:59:59";
		};
		if(phoneNum==null ||phoneNum==""||phoneNum==undefined){
			$.alert("提示","请输入接入号码查询！");
			return ;
		}
		var areaId = null ;
		if($("#p_channelId").val()&&$("#p_channelId").val()!=""){
			areaId = $("#p_channelId").find("option:selected").attr("areaid");
			areaId = areaId.substring(0,3) + "0000";
			if(areaId==null||areaId==""||areaId==undefined){
				$.alert("提示","渠道地区为空，无法查询！");
				return ;
			}
		}else{
			$.alert("提示","渠道地区为空，无法查询！");
			return ;
		}
		var param = {
				"areaId":areaId,
				"orderType":orderType,
				"phoneNum":phoneNum,
				"startTime":startTime,
				"endTime":endTime
		};
        
		$.callServiceAsHtml(contextPath+"/report/cardProgressQuery",param,{
			"before":function(){
				$.ecOverlay("自助换卡查询进度中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response||response.code != 0){
					 response.data='查询失败,稍后重试';
				}
				var content$=$("#cardprogresslist");
				content$.html(response.data);
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});		
	};
	
	//作废购物车(收银台的"订单取消"、暂存单查询下的"取消")
	var _delOrder = function(param){
		param.flag = "U";
		$.callServiceAsJsonGet(contextPath+"/order/delOrder",param,{
			"done" : function(response){
				if (response.code==0) {
					if(response.data.resultCode==0){
						$.alert("提示","购物车作废成功！");
						cart.main.queryCartList(1);
					}
				}else if (response.code==-2){
					$.alertM(response.data);
				}else {
					$.alert("提示","购物车作废失败！");
				}
			},
			fail:function(response){
				$.alert("提示","信息","请求可能发生异常，请稍后再试");
			}
		});
	};
	
	//暂存单下的"处理"
	var _queryReOrder = function(param){
		$.ecOverlay("<strong>正在查询中,请稍后....</strong>");
		var response = $.callServiceAsJsonGet(contextPath+"/accessToken/queryOrderInfos",param);	
		$.unecOverlay();
		if (response.code==0) {
			OrderInfo.saveOrder.olId = param.customerOrderId;
//			console.log(response.data);
			var custOrderAttrs = response.data.orderList.orderListInfo.custOrderAttrs;
			$.each(custOrderAttrs,function(){
				if(this.itemSpecId=="30010024"){
					if(this.value=="3"){
						if(param.acctNbr==""){
							$.alert("提示","营业后台返回接入号为空");
							return false;
						}
						order.memberChange.rejson = response.data;
						param.busitypeflag = "3";
						queryCustAndProd(param);
					}else if(this.value=="14"){
						if(param.acctNbr==""){
							$.alert("提示","营业后台返回接入号为空");
							return false;
						}
						var orderinfo = {
								"resultCode":"0",
								"resultMsg":"",
								"result":response.data
						}
						order.uiCust.orderInfo = orderinfo;
						param.busitypeflag = "14";
						queryCustAndProd(param);
					}else if(this.value=="2"){
						if(param.acctNbr==""){
							$.alert("提示","营业后台返回接入号为空");
							return false;
						}
						OrderInfo.data=response.data;
						order.memberChange.rejson = response.data;
						order.memberChange.reloadFlag = "N";
						var custOrderList = response.data.orderList.custOrderList[0].busiOrder;
						$.each(custOrderList,function(){
							if(this.boActionType.actionClassCd=="1200" && this.boActionType.boActionTypeCd=="S1" && this.busiObj.offerTypeCd=="1"&&this.data.ooRoles[0].state=="ADD"){
								OrderInfo.offid=this.busiObj.objId;
							}
						});
						param.busitypeflag = "2";
						queryCustAndProd(param);
					}else if(this.value=="1"){
						OrderInfo.newOrderInfo.result=response.data;
						var custOrderList = response.data.orderList.custOrderList[0].busiOrder;
						$.each(custOrderList,function(){
							if(this.boActionType.actionClassCd=="1000" && this.boActionType.boActionTypeCd=="C1"){
								OrderInfo.boCustInfos = this.data.boCustInfos[0];
//								{
//										addressStr:this.data.boCustInfos[0].addressId,
//										areaId:this.data.boCustInfos[0].areaId,
//										businessPassword:this.data.boCustInfos[0].businessPassword,
//										defaultIdType:this.data.boCustInfos[0].defaultIdType,
//										mailAddressStr:this.data.boCustInfos[0].mailAddressStr,
//										name:this.data.boCustInfos[0].name,
//										partyTypeCd:this.data.boCustInfos[0].partyTypeCd,
//										state:this.data.boCustInfos[0].state,
//										telNumber:this.data.boCustInfos[0].accessNumber
//								}
								OrderInfo.boCustIdentities = this.data.boCustIdentities[0];
//								{
//										identidiesTypeCd:this.data.boCustIdentities[0].identidiesTypeCd,
//										identityNum:this.data.boCustIdentities[0].identityNum,
//										isDefault:this.data.boCustIdentities[0].isDefault,
//										state:this.data.boCustIdentities[0].state
//								}
								OrderInfo.boCustProfiles=[];
								OrderInfo.boPartyContactInfo = this.data.boPartyContactInfos[0];
								OrderInfo.boPartyContactInfo.statusCd = "100001";
								OrderInfo.cust={
										areaId:'"'+this.data.boCustInfos[0].areaId+'"',
										custId:"-1",
										partyName:this.data.boCustInfos[0].name
								}
								return false;
							}
						});
						if(OrderInfo.cust.custId==""){
							$.each(custOrderList,function(){
								if(this.boActionType.actionClassCd=="1100" && this.boActionType.boActionTypeCd=="A1"){
									OrderInfo.cust={
											areaId:'"'+this.areaId+'"',
											custId:this.data.boAccountInfos[0].partyId,
											partyName:this.data.boAccountInfos[0].acctName
									}
									return false;
								}
							});
						}
						param.busitypeflag = "1";
						queryCustAndProd(param);
					}
				}
			});
		}else if(response.code==1002){
			$.alert("错误",response.data);
		}else{
			$.alertM(response.data);
		}
	}
	
	function queryCustAndProd(param){
		$.ecOverlay("<strong>订单还原中,请稍后....</strong>");
		$.callServiceAsHtmlGet(contextPath+"/order/queryCustAndProd",param,{
			"before":function(){
				$.unecOverlay();
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
//					$("#d_query").hide();
					$("#d_cartInfo").html(response.data).show();
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	}
	
	/**
	 * 需求：#81646，收银台、暂存单查询，这2个菜单，能力开放的暂存单（包括界面集成、接口）限制继续受理
	 * 说明：当查询到的单子为能力开放的单子，此时该函数为暂存单查询的“取消”和“处理”按钮添加样式，_addStyle须与_removeStyle配合使用，缺一不可。
	 * @author ZhangYu 2016-2-1
	 */
	var _addStyle = function(olId){
		$("a#p_"+olId).css("color","red");
	};
	var _removeStyle = function(olId){
		//$("#p_"+olId).css("color","");
		$("a#p_"+olId).removeAttr("style");
	};
	
	//购物车自动归档
	var _updateArchivedAuto = function(_olId, _areaId){
		var param = {				
				olId : _olId,
				areaId : _areaId
		};
		var url = contextPath+"/order/updateArchivedAuto";
		$.callServiceAsJson(url,param,{
			"before":function(){
				$.ecOverlay("正在执行手动归档，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code==0){
					$.alert("提示","归档成功！");
				}else if (response.code == -2) {
					$.alertM(response.data);
				}else{
					$.alert("提示","归档异常");
					return;
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
		
	};
	
	var _qryVirtualNumber = function(){
		var virtualAccNbr=$("#virtualNumber").val();
		var choose_area_id = $("#p_disp_areaId").val();
		if(virtualAccNbr==null || virtualAccNbr ==""){
			$.alert("提示","请输入 '虚号接入号' 再查询");
			return;
		}
		var param = {
		    "virtualAccNbr":virtualAccNbr,
		    //"areaId":OrderInfo.staff.areaId
		    "areaId":choose_area_id
		};
        
		$.callServiceAsHtml(contextPath+"/report/queryMainInfo",param,{
			"before":function(){
				$.ecOverlay("根据虚号查询主号中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				var content$=$("#unsub_fill_content");
				content$.html(response.data).show();
				$("#unsub_prepare").hide();
				$("#ubsubLastStep").click(function(){
					$("#unsub_fill_content").hide();
					$("#unsub_prepare").show();
				});
				$("#undoAccNbr").unbind("click").bind("click",function(){//先加入黑名单，再退订
					var evidenceFile = $.trim($("#evidenceFile").val());
					if (evidenceFile === "") {
						$.alert("提示","请导入黑名单证据文件！");
						return;
					}else{
						var suffix = evidenceFile.substr(evidenceFile.lastIndexOf(".") + 1);
						//支持word、pdf、图片格式
						if(suffix != "doc" && suffix != "docx" && suffix != "pdf" && suffix != "png" && suffix != "gif" && suffix != "jpeg" && suffix != "jpg"){
							$.alert("提示","导入黑名单证据文件类型错误，黑名单证据文件类型支持word，pdf,图片类型！");
							return;
						};
					}
					var reason = $("#blacklistReason").val();
					if(reason==null || reason==""){
						$.alert("提示","请填写'黑名单原因'！");
						return;
					}
					var params = {
						areaId: $("#mainAreaId").val(),
						scene: "DEL",
					    preHandle: "C",
						mainAccNbr: $("#mainAccNbr").val(),
						virtualAreaId: $("#virtualAreaId").val(),
						virtualAccNbr: $("#virtualAccNbr").val(),
						vir_flag: true,
						pageType:"unOrderVirtualAccNber"
					};
					$.callServiceAsHtml(contextPath+"/order/exchangeAccNbr",params,{
						"before":function(){
							$.ecOverlay("一卡双号虚号省退订中，请稍等...");
						},
						"always":function(){
							$.unecOverlay();
						},
						"done" : function(response){
							$("#unsub_fill_content").hide();
							var content$ = $("#unsub_confirm");
							content$.html(response.data).show();
							$("#confirmBack").click(function(){
								$("#unsub_confirm").hide();
								$("#unsub_fill_content").show();
							});
							$("#successTip_dialog_cnt").click(function(){
								window.location.href = contextPath+"/report/unsubVirtualNumPrepare";
								return;
							});
						},
						fail:function(response){
							$.unecOverlay();
							$.alert("提示","请求可能发生异常，请稍后再试！");
						}
					});
				    //不管是否退订成功，加入黑名单
					_addBlacklistSubmit("unsubPage");
				});
			},
			fail:function(response){
				$.unecOverlay();
			}
		});
		
	};
	
	var _qryBlackUserInfo = function(pageIndex){
		var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
		if(!$("#p_areaId_val").val()||$("#p_areaId_val").val()==""){
			$.alert("提示","请选择 '地区' 再查询");
			return ;
		}
		if($("#p_areaId").val().indexOf("0000")>0){
			$.alert("提示","选择地区为省级地区,请选择市级地区！");
			return;
		}
		var accNbr=$("#accNbr").val();
		var nbrType = $("#nbrType").val();
		if(accNbr==null || accNbr ==""){
			$.alert("提示","请输入 '接入号' 再查询");
			return;
		}
		var param = {
		    "areaId":$("#p_areaId").val(),
		    "nbrType":nbrType,
		    "accNbr":accNbr,
		    "state":"0",
		    nowPage:curPage,
			pageSize:10
		};
		
		// 根据复选框选择：1：查询失效的黑名单列表 2:黑名单列表
		if($("#if_query_log").attr("checked")){
			param.state = "1";
		}
        
		$.callServiceAsHtml(contextPath+"/order/queryBlackUserInfo",param,{
			"before":function(){
				$.ecOverlay("根据虚号查询主号中，请稍等...");
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
					$("#blackList_list").html(response.data).show();
				}
			},
			fail:function(response){
				$.unecOverlay();
			}
		});
		
	};
	
	var _showAddBlacklist = function(){
		$("#blacklist_qry").hide();
		$("#blacklist_add").show();
		$("#addLastStep").unbind("click").bind("click",function(){
			$("#blacklist_add").hide();
			$("#blacklist_qry").show();
		});
		$("#addBlacklistUserInfo").unbind("click").bind("click",function(){
			var mainAreaId = $("#mainAreaId").val();
			var mainAccNbr = $("#mainAccNbr").val();
			var virtualAreaId = $("#virtualAreaId").val();
			var virtualAccNbr = $("#virtualAccNbr").val();
			if(mainAreaId==null || mainAreaId==""){
				$.alert("提示","请选择'主号地区'！");
				return;
			}
			if(mainAreaId.indexOf("0000")>0){
				$.alert("提示","主号地区为省级地区,请选择市级地区！");
				return;
			}
			if(mainAccNbr==null || mainAccNbr==""){
				$.alert("提示","请填写'主号接入号'！");
				return;
			}
			if(virtualAreaId==null || virtualAreaId==""){
				$.alert("提示","请选择'虚号地区'！");
				return;
			}
			if(virtualAreaId.indexOf("0000")>0){
				$.alert("提示","虚号地区为省级地区,请选择市级地区！");
				return;
			}
			if(virtualAccNbr==null || virtualAccNbr==""){
				$.alert("提示","请填写'虚号接入号'！");
				return;
			}
			var evidenceFile = $.trim($("#evidenceFile").val());
			if (evidenceFile === "") {
				$.alert("提示","请导入黑名单证据文件！");
				return;
			}else{
				var suffix = evidenceFile.substr(evidenceFile.lastIndexOf(".") + 1);
				//支持word、pdf、图片格式
				if(suffix != "doc" && suffix != "docx" && suffix != "pdf" && suffix != "png" && suffix != "gif" && suffix != "jpeg" && suffix != "jpg"){
					$.alert("提示","导入黑名单证据文件类型错误，黑名单证据文件类型支持word，pdf,图片类型！");
					return;
				};
			}
			var reason = $("#blacklistReason").val();
			if(reason==null || reason==""){
				$.alert("提示","请填写'黑名单原因'！");
				return;
			}
			_addBlacklistSubmit("addPage");
		});
	};
	
	var _addBlacklistSubmit = function(pageType){
		var url =  contextPath +"/report/addBlackUserInfo";
		var options  = {
				type	: 'post',
	            dataType: 'text',
	            url		: url,
            beforeSubmit:function(){
			    $.ecOverlay("<strong>正在提交,请稍等...</strong>");
			},							
            success:function(data){
				$.unecOverlay();
				if(pageType=="addPage"){
					$("#blacklist_add").hide();
					var content$ = $("#add_confirm");
					content$.html(data).show();
				}
				$("#add_confirmBack").unbind("click").bind("click",function(){
					$("#add_confirm").hide();
					$("#blacklist_add").show();
				});
				$("#success_add_blacklist").click(function(){
					window.location.href = contextPath+"/order/manageBlacklist";
					return;
				});
			},
			error: function(data, status, e){
				alert(data);
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		};
		$('#blacklistEvidence').ajaxSubmit(options);
	};
	var _chooseBlacklistArea = function(areaName,areaId){
		order.area.chooseAreaTreeAll(areaName,areaId,"3");
	};
	
	var _chooseProAndLocalArea = function(){
		var response = $.callServiceAsJson(contextPath+"/common/queryRegionType",{});
		if(response.code != 0) {
 			$.alert("提示","查询工号归属地区失败！");
			return false;
		}
		var staff_area_id = response.data.areaId;
		var level = response.data.areaLevel;
		switch(level) {
			case '1': // 工号是全国
				//order.area.chooseAreaTreeCurrent("p_disp_areaId_val","p_disp_areaId",3,"limitProvince");
				order.area.chooseAreaTreeAll("p_disp_areaId_val","p_disp_areaId",3,"limitProvince");
				break;
			case '2': // 工号是省级：可以选择到该省下全部本地网
				order.area.chooseAreaTreeCurrent("p_disp_areaId_val","p_disp_areaId",3,"limitProvince",staff_area_id);
				break;
			default:// 工号是本地网或者区县：只能选择到归属本地网
				//order.area.chooseAreaTreeManger("report/unsubVirtualNumPrepare","p_disp_areaId_val","p_disp_areaId",3);
				order.area.chooseAreaTreeCurrent("p_disp_areaId_val","p_disp_areaId",3,"limitProvince,limitStaffLocal",staff_area_id.substring(0,3)+"0000");
		}
	};
	
	var _qryElecRecord = function(pageIndex){
		
		/*var isCanQueryElecRecoed = $("#isCanQueryElecRecoed").val();
		if(isCanQueryElecRecoed != '0'){
			$.alert("提示","对不起,您没有查询电子档案回执的权限,请找管理员申请!");
			return ;
		}*/
		
		var param = {};
		
		if($("#if_p_olNbr").attr("checked")){
			if(!$("#p_olNbr").val()||$.trim($("#p_olNbr").val())==""){
				$.alert("提示","请输入 '购物车流水' 再查询");
				return ;
			}
			if(!$("#p_areaId_val").val()||$("#p_areaId_val").val()==""){
					$.alert("提示","请选择 '地区' 再查询");
					return ;
			}
			param = {			
					"olNbr":$("#p_olNbr").val(),
					"areaId":$("#p_areaId").val(),
					"custName":'',//受理工号
					"certType":'',//受理人
					"srcFlag":$("#p_srcFlag option:selected").val(),
					"certNumber":'',
					"accNbr":'',
					"startDt":'',
					"endDt":'',
					"pageSize":10,
					"pageIndex":pageIndex
			};
		}else{
			var accNbr = $.trim($("#p_qryNumber").val());
			//var certNumber = $.trim($("#p_certNumber").val());
			
			if("" ==accNbr){
				$.alert("提示","请填写接入号再查询！");
				return;
			}
			
			var startDt = $("#p_startDt").val();
			var endDt = $("#p_endDt").val();
			if("" == startDt || "" == endDt){
				$.alert("提示","时间范围必须填写!");
				return;
			}
			param = {			
					"olNbr":'',
					"areaId":$("#p_areaId").val(),
					"custName":encodeURI($("#p_custName").val()),//受理工号
					//"certType":'',//受理人
					//"certNumber":certNumber,
					"srcFlag":$("#p_srcFlag option:selected").val(),
					"accNbr":accNbr,
					"startDt":startDt,
					"endDt":endDt,
					"pageSize":10,
					"pageIndex":pageIndex
				};
		}
			
		$.callServiceAsHtmlGet(contextPath+"/report/queryElecRecodeList",param,{
			"before":function(){
				$.ecOverlay("电子档案查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == 0){
					$("#cart_list").html(response.data).show();
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
		
	};
	
	var _downLoadElecRecord = function(olId){
		var params = {
				"areaId":$("#v_areaId").val(),
				"srcFlag":$("#p_srcFlag option:selected").val(),
				"olId" : olId
		};
		$("<form>", {
			id: "downElecRecodeFileForm",
			style: "display:none;",
			//target: "_blank",
			method: "POST",
			action: contextPath + "/report/downLoadElecRecord"
		}).append($("<input>", {
			id: "downElecRecodeFile",
			name: "downElecRecodeFile",
			type: "hidden",
			value: JSON.stringify(params)
		})).appendTo("body").submit();
		
	};
	
	/**
	 * 黑名单失效
	 */
	var _blackListInvalid = function(seqId,accNbr,areaId){
		var param = {
				seqId:seqId,
				areaId:areaId,
				mainAccNbr:accNbr,
		};
		$.callServiceAsJson(contextPath+"/order/blackListInvalid", param, {
			"before" : function(){
				$.ecOverlay("黑名单失效中，请稍等...");
			},
			"always" : function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code==-2){
					$.alertM(response.data);
					return;
				}
				if(response.code==1){
					$.alert("操作失败", response.data);
					return;
				}
				$("#tab_blackList tr[id=" + seqId + "]").remove();
				$.alert("提示", "黑名单失效成功，请选择【失效记录】再查看结果!");
			}
		});
	};
	
	
	return {
		addStyle			:_addStyle,
		removeStyle			:_removeStyle,
		qureyStaffAndChl	:_qureyStaffAndChl,
		qureyStaffAndChlPage:_qureyStaffAndChlPage,
		setStaff			:_setStaff,
		setChannel			:_setChannel,
		queryCartList		:_queryCartList,
		initDic				:_initDic,
		queryCartInfo		:_queryCartInfo,
		showMain			:_showMain,
		showOffer			:_showOffer,
		queryCartLink		:_queryCartLink,
		slideFailInfo		: _slideFailInfo,
		chooseArea			:_chooseArea,
		queryConstructionState:_queryConstructionState,
		resendCustOrder		:_resendCustOrder,
		linkBackMain		:_linkBackMain,
		cardProgressQuery	:_cardProgressQuery,
		delOrder			:_delOrder,
		queryReOrder		:_queryReOrder,
		updateArchivedAuto  :_updateArchivedAuto,
		qryVirtualNumber    :_qryVirtualNumber,
		qryBlackUserInfo    :_qryBlackUserInfo,
	 	showAddBlacklist    :_showAddBlacklist,
	 	addBlacklistSubmit  :_addBlacklistSubmit,
	 	chooseBlacklistArea :_chooseBlacklistArea,
	 	chooseProAndLocalArea:_chooseProAndLocalArea,
	 	qryElecRecord		:_qryElecRecord,
	 	downLoadElecRecord  :_downLoadElecRecord,
	 	blackListInvalid   :_blackListInvalid
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
	// 电子档案查询界面
	if("Y" == $("#recodeFlag").val()){
		$("#qry_elecrecord").off("click").on("click",function(){cart.main.qryElecRecord(1);});
		
		$("#if_p_olNbr").change(function(){
			if($("#if_p_olNbr").attr("checked")){
				$("#p_olNbr").css("background-color","white").attr("disabled", false) ;
				$("#p_startDt").css("background-color","#E8E8E8").attr("disabled", true) ;
				$("#p_endDt").css("background-color","#E8E8E8").attr("disabled", true) ;
				$("#p_qryNumber").css("background-color","#E8E8E8").attr("disabled", true) ;
				$("#p_custName").css("background-color","#E8E8E8").attr("disabled", true) ;
				//$("#p_certNumber").css("background-color","#E8E8E8").attr("disabled", true) ;
			}else{
				$("#p_olNbr").css("background-color","#E8E8E8").attr("disabled", true) ;
				$("#p_startDt").css("background-color","white").attr("disabled", false) ;
				$("#p_endDt").css("background-color","white").attr("disabled", false) ;
				$("#p_qryNumber").css("background-color","white").attr("disabled", false) ;
				$("#p_custName").css("background-color","white").attr("disabled", false) ;
				//$("#p_certNumber").css("background-color","white").attr("disabled", false) ;
			}
		});
		
	}else{
		$("#bt_cartQry").off("click").on("click",function(){cart.main.queryCartList(1);});
		$("#qry_virtualNumber").off("click").on("click",function(){cart.main.qryVirtualNumber();});
		$("#qry_blackUserInfo").off("click").on("click",function(){cart.main.qryBlackUserInfo(1);});
		
		$("#qureyChannelList").off("click").on("click",function(){//渠道查询	
			cart.main.qureyStaffAndChl("queryChannel",0);
		});
		$("#qureyStaffCode").off("click").on("click",function(){//受理工号查询
			cart.main.qureyStaffAndChl("queryStaff",0);
		});
		$("#bt_resetStaffCode").off("click").on("click",function(){//清空受理工号staffCode和staffId
			$("#qureyStaffCode").val("");
			$("#p_staffId").val("");
		});
		
		cart.main.initDic();
		
		$("#if_p_olNbr").change(function(){
			if($("#if_p_olNbr").attr("checked")){
				$("#p_olNbr").css("background-color","white").attr("disabled", false) ;
				$("#p_startDt").css("background-color","#E8E8E8").attr("disabled", true) ;
				$("#p_endDt").css("background-color","#E8E8E8").attr("disabled", true) ;
				$("#p_qryNumber").css("background-color","#E8E8E8").attr("disabled", true) ;
				$("#p_olStatusCd").css("background-color","#E8E8E8").attr("disabled", true) ;
				$("#p_busiStatusCd").css("background-color","#E8E8E8").attr("disabled", true) ;
				$("#qureyChannelList").css("background-color","#E8E8E8").attr("disabled", true);
				$("#p_channelId").css("background-color","#E8E8E8").attr("disabled", true);
				$("#p_couponNumber").css("background-color","#E8E8E8").attr("disabled", true);
				$("#qureyStaffCode").css("background-color","#E8E8E8").attr("disabled", true);
				$("#bt_resetStaffCode").attr("disabled", true);
				if($("#pageType").val() == "link" && $("#permissionsType").val() == "monitor"){
					$("#p_areaId_val").css("background-color","#E8E8E8").attr("disabled", true) ;
					$("#qureyChannelList").css("background-color","white").attr("disabled", false) ;
				}else{
					$("#p_areaId_val").css("background-color","white").attr("disabled", false) ;
					$("#qureyChannelList").css("background-color","#E8E8E8").attr("disabled", true) ;
				}
			}else{
				$("#p_olNbr").css("background-color","#E8E8E8").attr("disabled", true) ;
				$("#p_startDt").css("background-color","white").attr("disabled", false) ;
				$("#p_endDt").css("background-color","white").attr("disabled", false) ;
				$("#p_qryNumber").css("background-color","white").attr("disabled", false) ;
				$("#p_olStatusCd").css("background-color","white").attr("disabled", false) ;
				$("#p_busiStatusCd").css("background-color","white").attr("disabled", false) ;
				$("#qureyChannelList").css("background-color","white").attr("disabled", false) ;
				$("#p_channelId").css("background-color","white").attr("disabled", false);
				$("#p_couponNumber").css("background-color","white").attr("disabled", false);
				$("#bt_resetStaffCode").attr("disabled", false);
				//if($("#p_QryChannelAuth").val() == 0)
					$("#qureyStaffCode").css("background-color","white").attr("disabled", false);
				//else
					//$("#qureyStaffCode").css("background-color","#E8E8E8").attr("disabled", true);
				if($("#p_channelId").val()!=""){
					$("#p_areaId_val").css("background-color","#E8E8E8").attr("disabled", true) ;
				}else{
					$("#p_areaId_val").css("background-color","white").attr("disabled", false) ;
				}
			}
		});
		$("#qureyChannelList").change(function(){
			if($(this).val()!=""){
				//$("#p_areaId_val").css("background-color","#E8E8E8").attr("disabled", true) ;
			}else{
				$("#p_areaId_val").css("background-color","white").attr("disabled", false) ;
			}
		});
//		$("#p_channelId").change(function(){//渠道信息发生改变，自动清空staffCode和staffId
//			$("#qureyStaffCode").val("");
//			$("#p_staffId").val("");
//		});
		$("#if_p_time").change(function(){
			if($("#if_p_time").attr("checked")){
				$("#p_startDt").css("background-color","white").attr("disabled", false) ;
				$("#p_endDt").css("background-color","white").attr("disabled", false) ;
			}else{
				$("#p_startDt").css("background-color","#E8E8E8").attr("disabled", true) ;
				$("#p_endDt").css("background-color","#E8E8E8").attr("disabled", true) ;
			}
		});
		$("#bt_cardprogressQry").off("click").on("click",function(){cart.main.cardProgressQuery();});
	}
});