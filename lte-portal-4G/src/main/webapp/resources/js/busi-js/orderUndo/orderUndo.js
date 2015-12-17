
CommonUtils.regNamespace("order", "undo");


/**
 *订单撤销.
 */
order.undo = (function(){
	var atomActionId = 0 ;
	var submit_id = "" ;//撤购物车:name=购物车id;  受理单:id=order.olNbr_order.olId
	var submit_type = "" ;//撤单校验类型：Y撤购物车，N撤订单项
	var undo_type = "" ;//撤整个单All，撤当前受理单only，
	var if_undo = "Y" ;//是否可撤单，根据后台返回的校验接口暂存，默认为可以撤单
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
	};
	
	var _showArea = function(){
		easyDialog.open({
			container : 'd_area'
		});
		$("#d_area_close").off("click").on("click",function(event){easyDialog.close();});
	};
	
	//查询
	var _queryOrderList = function(pageIndex){
		var  permissionsType  = $("#permissionsType").val();
		if(permissionsType=="admin"){
			if((!$("#p_hm").val()||$("#p_hm").val()=="") && (!$("#p_areaId_val").val()||$("#p_areaId_val").val()=="")){
				$.alert("提示","请至少输入地区或者购物车流水中的一个 再查询");
				return ;
			}
		}else {
			if(!$("#p_areaId_val").val()||$("#p_areaId_val").val()==""){
				$.alert("提示","请选择'地区'再查询");
				return ;
			}
			if(!$("#p_channelId").val()||$("#p_channelId").val()==""){
				$.alert("提示","请选择'渠道'再查询");
				return ;
			}
		}		
		if(!$("#p_startTime").val()||$("#p_startTime").val()==""){
			$.alert("提示","请选择'开始时间' 再查询");
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
				"p_partyId":$("#custName").attr("name"),
				"permissionsType": $("#permissionsType").val(),
				curPage:curPage,
				pageSize:10
		};
		
		$.callServiceAsHtmlGet(contextPath+"/orderUndo/list",param,{
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
		var cancelFlag = $("#"+id).attr("cancelFlag");
		if(cancelFlag!=null && cancelFlag!="" && cancelFlag !=undefined && cancelFlag==2){
			$.alert("提示","该订单是电渠ESS订单，且未向ESS异常报竣，请先异常报竣后再撤单！");
			return;
		}
		if(all_only=="all" && statusCd == '100002'){ // 状态
			var content = "是否作废购物车： " +$("#"+id).attr("olNbr");
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
			easyDialog.open({
				container : 'undo_d_main'
			});
			$("#undo_d_close").off("click").on("click",function(event){
				easyDialog.close();
				$("#undo_d_txt").val("");
			});
			$("#undo_d_bt").off("click").on("click",function(event){
				submit_id = id ;
				submit_type = y_n ;
				undo_type = all_only;
				easyDialog.close();
				_undoCheckSer();
			});
			$("#undo_d_no").off("click").on("click",function(event){
				easyDialog.close();
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
									areaId : $(this).attr("queryAreaId"),
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
			if($("#" + id).attr("statusCd")!=401300){//已撤单的订单提交节点不传   57560
				var busiOrder_row = _bindParam($("#" + id).attr("id"));
				busiOrder.push(busiOrder_row);
			}
			$("a[name='phoneList']").each(function(){//查全量
			    if($(this).attr("index")==0){
			    	OrderInfo.order.soNbr = UUID.getDataId();
			    }
				var param = {
						areaId : $(this).attr("areaId"),
						acctNbr : $(this).attr("phoneNumer"),
						custId : '',
						soNbr : OrderInfo.order.soNbr ,
						//queryType : "1,2,3,4,5",
						instId : '',
						type : "2"
				};
				flag = query.offer.invokeLoadInst(param);
		   });
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
								if(flag){
									attr_Inst[$(this).attr("instId")] = 1 ;
								}
							}
						}
					}
					if($(this).attr("statusCd")!=401300){//已撤单的订单提交节点不传   57560
						var busiOrder_row = _bindParam($(this).attr("id"));
						busiOrder.push(busiOrder_row);
					}
				}
			});
			$("a[name='phoneList']").each(function(){
				    if($(this).attr("index")==0){
				    	OrderInfo.order.soNbr = UUID.getDataId();
				    }
					var param = {
							areaId : $(this).attr("areaId"),
							acctNbr : $(this).attr("phoneNumer"),
							custId : '',
							soNbr : OrderInfo.order.soNbr ,
							//queryType : "1,2,3,4,5",
							instId : '',
							type : "2"
					};
					flag = query.offer.invokeLoadInst(param);
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
		var busiObj = {"objId":$("#"+id).attr("objId"),"instId":$("#"+id).attr("instId"),"accessNumber":$("#"+id).attr("acctnbr")};
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
//		$.ecOverlay("<strong>撤单提交中，请稍等...</strong>");
//		var response = $.callServiceAsJson(contextPath+"/orderUndo/orderSubmit",param);
//		$.unecOverlay();
//		if(!response || response.code != 0){
//			 return;
//		}
		$.callServiceAsJson(contextPath+"/orderUndo/orderSubmit",param,{
			"before":function(){
				$.ecOverlay("<strong>撤单提交中，请稍等...</strong>");
			},
			"done" : function(response){
				var result = response.data ;
				if(result){
					var ruleInfos = result.result.ruleInfos;
					if(ruleInfos!=undefined && ruleInfos.length > 0){
						$.unecOverlay();
						rule.rule.init();
						$.each(ruleInfos, function(i, ruleInfo) {
							$("<tr><td>"+ruleInfo.ruleCode+"</td>" +
									"<td>"+ruleInfo.ruleDesc+"</td>" +
									"<td>"+rule.rule.getRuleLevelName(ruleInfo.ruleLevel)+"</td>" +
									"<td><div style='display:block;margin-left:30px;' class='"+rule.rule.getRuleImgClass(ruleInfo.ruleLevel)+"'></div></td>" +
							"</tr>").appendTo($("#ruleBody"));
						});
						easyDialog.open({
							container : 'ruleDiv'
						});
					}else{
						if(if_undo=='Y'){
							_getOrderConfirm(response.data);
						}else{
							_orderCheck(response);
						}
					}
				}else{
					$.alert("提示","撤单提交失败！");
					$.unecOverlay();
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","信息","请求可能发生异常，请稍后再试！");
			}
		});
//		$.callServiceAsHtml(contextPath+"/orderUndo/orderSubmit",param,{
//			"before":function(){
//				$.ecOverlay("<strong>撤单提交中，请稍等...</strong>");
//			},
//			"done" : function(response){
//				$.unecOverlay();
//				if(response.code==0){
//					
//				}else
//					$.alertM(response.data);			
//			},
//			fail:function(response){
//				$.unecOverlay();
//				$.alert("提示","信息","请求可能发生异常，请稍后再试！");
//			}
//		});
	};
	
	var _getOrderConfirm = function(data){
	$.callServiceAsHtml(contextPath+"/orderUndo/orderSubmit2",data,{
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
		SoOrder.getToken(); //更新token
		$("#main_conetent").hide();
		$("#order_fill_content").hide();
		$("#order_confirm").html(data).show();
		SoOrder.showStep(2);
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
						areaId : OrderInfo.staff.areaId
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
		var  permissionsType  = $("#permissionsType").val();
		if(permissionsType=="admin"){
			order.area.chooseAreaTree("orderUndo/main","p_areaId_val","p_areaId",3);
		}
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
					$.ecOverlay("<strong>撤单提交中，请稍等...</strong>");
				},
				"done" : function(response){
					var result = response.data ;
					if(result){
						if(result.canRepeal=="Y"){
							order.undo.undoEvent();
						}else{
							if_undo = "N";
							//后台返回不许撤单，直接走下去，订单提交后再下校验单下省
							order.undo.undoEvent();
//							$.alert("提示",result.reason==""?"未获取到反馈信息":result.reason);
//							$.unecOverlay();
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
	//如果开始撤单校验返回为不许撤单，订单提交后，需下省校验
	var _orderCheck=function(response){
		if (response.code == 0) {
			var data = response.data;
			if(data==undefined){
				$.alert("提示","订单提交失败！");
				return;
			}
			var provCheckResult = order.calcharge.tochargeSubmit(data);
			if(provCheckResult.code==0){
				_getOrderConfirm(data);
			}else{//下省校验失败也将转至订单确认页面，展示错误信息，只提供返回按钮
				$.alertM(provCheckResult.data);
				//调用订单作废接口
				back_olId = data.result.olId;
				_delOrder();
			}
		}else{
			$.alertM(response.data);
		}	
	};	
	
	//客户查询（弹出框）
	var _showQueryCust = function(){
		if($("#p_areaId_val").val()==""){
			$.alert("提示","请先选择所属地区再进行客户查询");
			return;
		}
		easyDialog.open({
			container : "d_cust"
		});
		$("#cust").val("");
		$("#custlist").html("");
		$(".easyDialogclose").click(function(){
			easyDialog.close();			
		});

		var param = {attrSpecCode : "PTY-0004"};
		$.callServiceAsJson(contextPath+"/staffMgr/getCTGMainData",param,{
			"done" : function(response){
				if(response.code==0){
					var data = response.data ;
					if(data!=undefined && data.length>0){
						for(var i=0;i<data.length;i++){
							var busiStatus = data[i];
							$("#cust_id_type").append("<option value='"+busiStatus.attrValueCode+"' >"+busiStatus.attrValueName+"</option>");							
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
	
	//变更客户认证类型
	var _changeCustIdType = function(option){
		var type = $(option).val();
		if(type==0){
			$("#cust").attr("placeHolder","请输入有效的中国电信手机号");
			$("#cust").attr("data-validate","validate(isTelecomSection:请输入有效的中国电信号码) on(blur)");
		}
		else if(type==1){
			$("#cust").attr("placeHolder","请输入合法的身份证号码");
			$("#cust").attr("data-validate","validate(idCardCheck:请准确填写身份证号码) on(blur)");
		}
		else if(type==2){
			$("#cust").attr("placeHolder","请输入合法的军官证");
			$("#cust").attr("data-validate","validate(required:请准确填写军官证) on(blur)");
		}
		else if(type==3){
			$("#cust").attr("placeHolder","请输入合法的护照");
			$("#cust").attr("data-validate","validate(required:请准确填写护照) on(blur)");
		}
		else{
			$("#cust").attr("placeHolder","请输入合法的证件号码");
			$("#cust").attr("data-validate","validate(required:请准确填写证件号码) on(blur)");
		}
		$("#cust").val("");
		_queryCust();
	};
	
	//查询客户
	var _queryCust = function(){
		$("#custQueryForm").off().bind("formIsValid", function(event, form){			
			var _acctNbr = "";
			var _identityNum = "";
			var _identityCd = "";
			if($("#cust_id_type").val()==0){
				_acctNbr = $("#cust").val();
			}
			else{
				_identityCd = $("#cust_id_type").val();
				_identityNum = $("#cust").val();
			}
			var param = {
					acctNbr : _acctNbr,
					identityCd : _identityCd,
					identityNum : _identityNum,
					partyName : "",
					custQueryType : $("#custQueryType").val(),
					diffPlace : "maybe",
					areaId : $("#p_areaId").val(),
					query : "acct",  //账户详情查询的页面标志
					pageType : "orderUndo"
			};
			$.callServiceAsHtml(contextPath+"/cust/queryCust",param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done":function(response){
					if(response.code != 0) {
						$.alert("提示","查询失败,稍后重试");
						return;
					}
					if(response.data.indexOf("false") >=0) {
						$.alert("提示","抱歉，没有定位到客户，请尝试其他客户。");
						return;
					}
					$("#custlist").html(response.data).show();
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","查询失败，请稍后再试！");
				}				
			});
		}).ketchup({bindElement:"bt_query_cust"});
	};
	
	//选定客户
	var _chooseCust = function(tr){
		var custName = $(tr).find("td:eq(0)").text();
		var custId = $(tr).find("td:eq(3)").text();
		$("#custName").val(custName).attr("name", custId);
		easyDialog.close();
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
		undoCheckSer:_undoCheckSer,
		orderCheck : _orderCheck,
		showQueryCust : _showQueryCust,
		changeCustIdType :_changeCustIdType,
		queryCust : _queryCust,
		chooseCust : _chooseCust
	};	
})();
//初始化
$(function(){	
	order.undo.init();	
	order.undo.queryCust();
});