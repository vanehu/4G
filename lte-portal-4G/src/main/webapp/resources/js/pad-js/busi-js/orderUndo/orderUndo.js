
CommonUtils.regNamespace("order", "undo");


/**
 *订单撤销.
 */
order.undo = (function(){
	var atomActionId = 0 ;
	var submit_id = "" ;//撤购物车:name=购物车id;  受理单:id=order.olNbr_order.olId
	var submit_type = "" ;//撤单校验类型：Y撤购物车，N撤订单项
	var undo_type = "" ;//撤整个单All，撤当前受理单only，
	
	var back_olId = "" ;
	var back_olNbr = "" ;

	var _init = function(){
		OrderInfo.actionTypeName = "撤单";
		OrderInfo.actionFlag=11;
		//执行查询
		$("#bt_orderQry").off("click").on("click",function(){_queryOrderList(1);});
		$("#p_startTime").off("click").on("click",function(){
			$.calendar({ format:'yyyy年MM月dd日 ',real:'#p_startTime',maxDate:$("#p_endTime").val() });
		});
		$("#p_endTime").off("click").on("click",function(){
			$.calendar({ format:'yyyy年MM月dd日 ',real:'#p_endTime',minDate:$("#p_startTime").val() });	
		});
		$("#div_user_qry_result").attr("style","display:none;");
		$("#dlg-chk-auth").attr("style","display:none;");
		$("#dlg-invalid-invoice").attr("style","display:none;");
		$("#dlg-exchange-channel").attr("style","display:none;");
		$("#dlg-select-area").attr("style","display:none;");
		$("#a_user_create").off("click").on("click",function(){
			$.jqmRefresh($("#poppopdialog"));
			$.popupSmall("#poppopdialog",{
				width:500,
				height:300
			});
			
		});
	};
	
	var _showArea = function(){
		easyDialog.open({
			container : 'd_area'
		});
		$("#d_area_close").off("click").on("click",function(event){easyDialog.close();});
	};
	
	//查询
	var _queryOrderList = function(pageIndex){
		if(!$("#p_channelId").val()||$("#p_channelId").val()==""){
			$.alert("提示","请选择'渠道'再查询");
			return ;
		}
		if(!$("#p_areaId_val").val()||$("#p_areaId_val").val()==""){
			$.alert("提示","请选择'地区'再查询");
			return ;
		}
		if(!$("#p_startTime").val()||$("#p_startTime").val()==""){
			$.alert("提示","请选择'受理时间' 再查询");
			return ;
		}
		if(!$("#p_endTime").val()||$("#p_endTime").val()==""){
			$.alert("提示","请选择'结束时间' 再查询");
			return ;
		}
		if((!$("#p_hm").val()||$("#p_hm").val()=="") && (!$("#p_olNbr").val()||$("#p_olNbr").val()=="")){
			$.alert("提示","请至少输入接入号码或者购物车流水中的一个 再查询");
			return ;
		}
		$("#orderContent").find("div[data-role='collapsible']").collapsible({
		  	collapsed: true,
		  	trigger:"create"
		});
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
				"p_partyId":$("#custName").attr("name"),
				curPage:curPage,
				pageSize:10
		};
		
		$.callServiceAsHtmlGet(contextPath+"/pad/orderUndo/list",param,{
			"before":function(){
				$.ecOverlay("订单查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}
				if(response && response.data){
					if(response.data==-1){
						$.alert("提示","撤单查询异常！");
					}else{
						var content$=$("#order_undo_list");
						content$.show().addClass("pageright").removeClass("in out").addClass("out");
						setTimeout(function(){
							content$.html(response.data).removeClass("cuberight in out").addClass("pop in");
							setTimeout(function(){
								content$.removeClass("pop in out");
							},500);
						},500);
					}
				}else{
					$.alert("提示","撤单查询异常！");
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	var _undoCheck = function (all_only,y_n,id) {
		var statusCd = $("#"+id).attr("statusCd"); 
		if(all_only=="all" && statusCd == '100002'){ // 状态
			var content = "是否作废购物车： " +$("#"+id).attr("olNbr");
//			var popup = $.popup("#div_cust_create",response.data,{
//				cache:true,
//				width:$(window).width()-200,
//				height:$(window).height(),
//				contentHeight:$(window).height()-120,
//				afterClose:function(){if($.ketchup) $.ketchup.hideAllErrorContainer($("#custCreateForm"));}
//			});
			$.confirm("信息确认",content,{ 
				yes:function(){
					submit_id = id ;
					submit_type = y_n ;
					undo_type = all_only;
					_undoCheckSer();
				},
				no:function(){
					
				}
			});
		}
		else { 
			var mess = "" ;
			if(all_only=="all"){
				mess = "撤单确认【撤 购物车："+$("#"+id).attr("olNbr")+"】" ;
			}else if(all_only=="main"){
				mess = "撤单确认【撤 主卡："+$("#"+id).attr("relaBoId")+"】（会撤掉整个购物车）" ;
			}else{
				mess = "撤单确认【撤 受理单："+$("#"+id).attr("relaBoId")+"】" ;
			}
			$("#undo_d_title").html(mess);
			$.popupSmall("#undo_d_main",{
				width:500,
				height:300
			});
			$("#undo_d_close").off("click").on("click",function(event){
				$("#undo_d_txt").val("");
			});
			$("#undo_d_bt").off("tap").on("tap",function(event){
				submit_id = id ;
				submit_type = y_n ;
				undo_type = all_only;
				$("#undo_d_main").hide();
				_undoCheckSer();
			});
			$("#undo_d_no").off("click").on("click",function(event){
				$("#undo_d_txt").val("");
			});	
		}
	};
    var _undoEvent = function(){
		CONST.getAppDesc();
		OrderInfo.order.soNbr = UUID.getDataId();
		var busiOrder = [];
		var id =submit_id ;
		atomActionId = 0 ;
		var flag = true ;
		var attr_Inst = {}; 
		
		/*修改，待测试 --副卡 关联相关
		var new_accnum = $("#"+id).attr("acctNbr") ;
		var v_name = null ;
		if(undo_type=="all"){//撤整个购物车
			v_name = id ;
		}else if(undo_type=="main"){//撤主卡，带出整个购物车
			v_name = $("#"+id).attr("name");
		}else{
			v_name = $("#"+id).attr("name") ;//其他 默认是取name
		}
		$("a[name='"+v_name+"']").each(function(){
			if(flag){
				if( (submit_type!="N")||(submit_type=="N"&&$(this).attr("acctNbr")==new_accnum) ){//如果不是主卡，不撤整个订单，需要通过accnum接入号 查找相关的单座撤单
					if(CONST.APP_DESC==0 && $(this).attr("is_new")=="0"){
						if(attr_Inst[$(this).attr("instId")]==null||attr_Inst[$(this).attr("instId")]==undefined){
							OrderInfo.order.soNbr = UUID.getDataId();
							var param = {
									areaId : $(this).attr("areaId"),
									acctNbr : $(this).attr("acctNbr"),
									custId : $(this).attr("custId"),
									soNbr : OrderInfo.order.soNbr ,
									//queryType : "1,2,3,4,5",
									instId : $(this).attr("instId"),
									type : "2"
							};
							flag = query.offer.invokeLoadInst(param);
							if(flag){
								attr_Inst[$(this).attr("instId")] = 1 ;
							}
						}
					}
					var busiOrder_row = _bindParam($(this).attr("id"));
					busiOrder.push(busiOrder_row);
				}
			}
		});
		*/
		
		
		if(submit_type=="N"){
			if (CONST.APP_DESC == 0 && $("#" + id).attr("is_new") == "0") {
				//var actionClassCd = $("#" + id).attr("actionClassCd");
				var boActionTypeCd = $("#" + id).attr("boActionTypeCd");
				if (boActionTypeCd != 1) {
					var param = {
						areaId : $("#" + id).attr("areaId"),
						acctNbr : $("#" + id).attr("acctNbr"),
						custId : $("#" + id).attr("custId"),
						soNbr : OrderInfo.order.soNbr,
						// queryType : "1,2,3,4,5",
						instId : $("#" + id).attr("instId"),
						type : "2"
					};
					flag = query.offer.invokeLoadInst(param);
				}
			}
			var busiOrder_row = _bindParam(id);
			busiOrder.push(busiOrder_row);
		}else{
			var v_name = null ;
			if(undo_type=="all"){//撤整个购物车
				v_name = id ;
			}else if(undo_type=="main"){//撤主卡，带出整个购物车
				v_name = $("#"+id).attr("name");
			}else{
				v_name = $("#"+id).attr("name") ;//其他 默认是取name
			}
			$("a[name='"+v_name+"']").each(function(){
				if(flag){
					if(CONST.APP_DESC==0 && $(this).attr("is_new")=="0"){
						if(attr_Inst[$(this).attr("instId")]==null||attr_Inst[$(this).attr("instId")]==undefined){
							if($(this).attr("boActionTypeCd") != '1'){
							    OrderInfo.order.soNbr = UUID.getDataId();
								var param = {
										areaId : $(this).attr("areaId"),
										acctNbr : $(this).attr("acctNbr"),
										custId : $(this).attr("custId"),
										soNbr : OrderInfo.order.soNbr ,
										//queryType : "1,2,3,4,5",
										instId : $(this).attr("instId"),
										type : "2"
								};
								flag = query.offer.invokeLoadInst(param);
								if(flag){
									attr_Inst[$(this).attr("instId")] = 1 ;
								}
							}
						}
					}
					var busiOrder_row = _bindParam($(this).attr("id"));
					busiOrder.push(busiOrder_row);
				}
			});
		}
		
		if(!flag){
			return ;
		}
		if(atomActionId==0){
			$.alert("提示","未获取到可撤的订单！");
			return ;
		}
		var custOrderList_row = {"partyId":$("#"+id).attr("partyid"),"busiOrder":busiOrder};
		var custOrderList = new Array();
		custOrderList.push(custOrderList_row);
		var orderData = OrderInfo.getOrderData();
		orderData.orderList.orderListInfo.partyId = $("#"+id).attr("partyid");
		orderData.orderList.orderListInfo.soNbr = OrderInfo.order.soNbr;
		orderData.orderList.custOrderList = custOrderList ;
		/*
		var orderListInfo = {
				soNbr:OrderInfo.order.soNbr,//$("#"+id).attr("olNbr"),
				//operatorId:"1",
				isTemplateOrder : "N",   //是否批量
				templateType : "1",  //模板类型: 1 新装；8 拆机；2 订购附属；3 组合产品纳入/退出
				staffId : OrderInfo.staff.staffId,
				channelId : OrderInfo.staff.channelId,  //受理渠道id
				areaId : OrderInfo.staff.areaId,  //受理地区ID
				partyId :  $("#"+id).attr("partyid"),  //新装默认-1
				olTypeCd : CONST.OL_TYPE_CD.FOUR_G  //4g标识	
		};
		*/
		OrderInfo.order.oldSoNbr = $("#"+id).attr("olnbr") ;
		OrderInfo.order.oldSoId = $("#"+id).attr("olid") ;
		$("#undo_d_txt").val("");
		//_undoOrder({"custOrderList":custOrderList,"orderListInfo":orderListInfo});
		_undoOrder(orderData);
	};
	
	var _bindParam = function(id){
		atomActionId -- ;
		var busiOrderInfo = {"seq":atomActionId,"statusCd":"100001"};
		atomActionId -- ;
		//var busiObj = {"objId":$("#"+id).attr("objId"),"name":"","instId":$("#"+id).attr("instId")};
		var busiObj = {"objId":$("#"+id).attr("objId"),"instId":$("#"+id).attr("instId")};
		var boActionType = {"actionClassCd":$("#"+id).attr("actionClassCd"),"boActionTypeCd":"3000"};
		
		var busiOrderAttrs = new Array() ;
		var busiOrderAttrs_row = {"atomActionId":atomActionId,"itemSpecId":CONST.ITEM_SPEC_ID_CODE.busiOrderAttrs,"value":$("#undo_d_txt").val()};
		busiOrderAttrs.push(busiOrderAttrs_row);
		
		atomActionId -- ;
		var data = {"state":"ADD","statusCd":"100001","atomActionId":atomActionId,"busiOrderAttrs":busiOrderAttrs};
		var boRelas = new Array() ;
		//var boRelas_row = {"relaSeq":"",relaTypeCd:"100002",relaBoId:$("#"+id).attr("relaBoId")};
		var boRelas_row = {relaTypeCd:"100002",relaBoId:$("#"+id).attr("relaBoId")};
		boRelas.push(boRelas_row);
		var areaId = $("#"+id).attr("areaId") ;
		var aggreementId = "" ;
		//var busiOrder_row = {"busiOrderInfo":busiOrderInfo,"busiObj":busiObj,"boActionType":boActionType,"data":data,"boRelas":boRelas,"areaId":areaId,"aggreementId":aggreementId} ;
		var busiOrder_row = {"busiOrderInfo":busiOrderInfo,"busiObj":busiObj,"boActionType":boActionType,"data":data,"boRelas":boRelas,"areaId":areaId} ;
		return busiOrder_row;
	};
	var _undoOrder = function(param){
		$.callServiceAsHtml(contextPath+"/pad/orderUndo/orderSubmit",param,{
			"before":function(){
				$.ecOverlay("<strong>撤单提交中，请稍等...</strong>");
			},
			"done" : function(response){
				$.unecOverlay();
				_orderConfirm(response.data);
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","信息","请求可能发生异常，请稍后再试！");
			}
		});
	};
	var _orderConfirm = function(data){
		if(data==undefined){
			$.alert("提示","订单提交失败！");
			return;
		}
		$("#order_tab_panel_content").hide();
		$("#main_conetent").hide();
		$("#order_fill_content").hide();
		$("#order_confirm").html(data);
		$("#order_confirm").attr("style","display:block;");
		SoOrder.showStep(2);
		$.jqmRefresh($("#order_confirm"));
		back_olId = $("#orderTable").attr("olid");
		back_olNbr = $("#orderTable").attr("olnbr");
		//OrderInfo.olId = $("#"+submit_id).attr("olId"); 
		//$("#confirmNumber").text(OrderInfo.boProdAns[0].accessNumber);
		//$("#confirmOfferName").text(OrderInfo.offerSpec.offerSpecName);
		var $span = $("<span>撤单确认</span><span class='showhide'></span>");
		//var $span = $("<span>订购</span>"+OrderInfo.offerSpec.offerSpecName+"<span class='showhide'></span>");
		$("#tital").append($span);
		
		$("#orderTr").show();
		if($("#ruleTbody tr").length>0){ //规则限制
			$("#ruleTbody tr").each(
				function (){
					if($(this).attr("ruleLevel")==4){
						$("#ruleTable").show();
						$("#resTable").hide();
						$("#chooseTable").hide();
						$("#orderConfirmBtn").hide();
						return false; 
					}
				}
			);
		}else {
			if($("#resTbody tr").length>0){ //动作链带出
				$("#resTable").show();
			}
			//_showOrderOffer(); //显示订购的销售品
		}
	};
	
	var _showOrderOffer = function(){
		var n = 0;
		var flag = false;
		for ( var i = 0; i<OrderInfo.offerSpec.offerRoles.length; i++) {
			var offerRole = OrderInfo.offerSpec.offerRoles[i];
			for (var j = 0; j < offerRole.selectQty; j++) {
				var open = AttachOffer.openList[n];
				n++;
				var $tr = $('<tr><th width="50%">'+offerRole.offerRoleName+'(前台订购)</th><th>业务动作</th></tr>');
				$("#chooseTable tbody").append($tr);
				for ( var k = 0; k < open.specList.length; k++) {  //遍历当前产品下面的附属销售品
					var spec = open.specList[k];
					if(spec.isdel != "Y"){  //订购的附属销售品
						var specName = spec.offerSpecName;
						var boActionTypeName = "订购";
						var $tr = $('<tr><td width="50%">'+specName+'</td><td>'+boActionTypeName+'</td></tr>');
						$("#chooseTable tbody").append($tr);
						flag = true;
					}
				} 	
			}
		}};
		
		
		var _orderBack = function(){
			if(back_olId!=undefined&&back_olId!=""){
				$.confirm("信息","确定取消当前操作吗？",{
					yes:function(){
						_delOrder();
					},no:function(){
						
					}},"question");
			}else{
				_toUndoMain(0);
			}
			
		};
		var _delOrder = function(){
			_toUndoMain(0);
			if(back_olId!=undefined&&back_olId!=""){
				var param = {
						olId : back_olId,
						areaId : $("#p_areaId").val()
					};
					$.callServiceAsJsonGet(contextPath+"/order/delOrder",param,{
						"done" : function(response){
							if(response.data!=undefined){
								if(response.data.resultCode==0){
									$.alert("提示","购物车作废成功！");
								}else {
									$.alert("提示","购物车作废失败！");
								}
							}
						},
						fail:function(response){
							$.alert("提示","信息","请求可能发生异常，请稍后再试！");
						}
					});
			}else{
				_toUndoMain(0);
			}
			if(CONST.getAppDesc()!=0){
				$("#custModifyId").show();
			}
		};
		var _toUndoMain = function(type){
			if ($("#successTip_dialog").is(":visible")) {
				easyDialog.close();			
			}
			$("#order_fill_content").show();
			$("#main_conetent").show();
			$("#order_tab_panel_content").show();
			$("#order_confirm").hide();
			SoOrder.showStep(0);
			if(type==1){//需要刷新 查询列表
				var page = 1 ;
				$(".pagingSelect").each(function(){
					page = $(this).html();
				});
				_queryOrderList(page);
			}
		};
		
		var _orderCharge = function(olId){
			order.calcharge.calchargeInit(olId);
		};
		
	var _chooseArea = function(){
			order.area.chooseAreaTree("orderUndo/main","p_areaId_val","p_areaId",3);
			//order.area.chooseAreaTreeManger("orderUndo/main","p_areaId_val","p_areaId",3);
			//order.area.chooseAreaTreeAll("p_areaId_val","p_areaId",3);
		};
	var _tochargeInit=function(olId,olNbr){
		OrderInfo.orderResult.olId=olId;
		OrderInfo.orderResult.olNbr=olNbr;
		order.calcharge.calchargeInit();
	};
	
	var _undoCheckSer = function(){
		
		var param = null ;
		var statusCd = $("#"+submit_id).attr("statusCd"); 
		if(undo_type=="all" && statusCd == '100002'){ // 状态
			param = {
					olId : $("#"+submit_id).attr("olId"),
					areaId : $("#p_areaId").val()
			};
			$.callServiceAsJsonGet(contextPath+"/order/delOrder",param,{
				"done" : function(response){
					if (response.code==0) {
						if(response.data.resultCode==0){
							$.alert("提示","购物车作废成功！");
							$("#"+submit_id).text("作废");
							$("#"+submit_id).attr("disabled",true);
							$("#"+submit_id).removeClass("purchase").addClass("disablepurchase");
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
		}else{
			if(undo_type=="all"||undo_type=="main"){
				param = {custOrderId:$("#"+submit_id).attr("olId"),orderItemId:null,ifRepealAll:submit_type} ;
			}else{
				param = {custOrderId:$("#"+submit_id).attr("olId"),orderItemId:$("#"+submit_id).attr("relaBoId"),ifRepealAll:submit_type} ; 
			}
			var olNbr= $("#"+submit_id).attr("olNbr");
			if(OrderInfo.actionFlag==11){
				param.areaId=$("#areaId_"+olNbr).val();
			}			
			$.callServiceAsJson(contextPath+"/orderUndo/orderUndoCheck",param,{
				"before":function(){
					//$.ecOverlay("<strong>撤单提交中，请稍等...</strong>");
				},
				"done" : function(response){
					var result = response.data ;
					if(result){
						if(result.canRepeal=="Y"){
							order.undo.undoEvent();
						}else{
							$.alert("提示",result.reason==""?"未获取到反馈信息":result.reason);
							$.unecOverlay();
						}
					}else{
						$.alert("提示","撤单校验失败！");
						$.unecOverlay();
					}
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","信息","请求可能发生异常，请稍后再试！");
				}
			});
		}
	};
	
	
	return {
		queryOrderList:_queryOrderList,
		init:_init,
		undoEvent:_undoEvent,
		undoCheck:_undoCheck,
		showArea:_showArea,
		//initArea:_initArea,
		orderBack:_orderBack,
		orderCharge:_orderCharge,
		toUndoMain:_toUndoMain,
		chooseArea:_chooseArea,
		tochargeInit:_tochargeInit,
		undoCheckSer:_undoCheckSer
	};
	
	
	
})();
//初始化
$(function(){
	
	order.undo.init();
	
});