/**
 * 订单算费
 * 
 * @author tang
 */
CommonUtils.regNamespace("order", "calcharge");
/**
 * 订单算费
 */
order.calcharge = (function(){
	var _chargeItems = [];
	var _prints=[];
	var _olId=0;
	var _soNbr=0;
	var num=0;
	var money=0;
	var _pageFlag='newOrder';
	var submit_success=false;
	var inOpetate=false;
	var _addbusiOrder=function(proId,obj){
		var html=$("#pro_"+proId).html();
		if(html!=undefined&&html!=''){
			easyDialog.open({
				container : 'moneyAdd'
			});
			$("#addContent").html('');
			$("#addContent").html(html);
			$("#moneyclose").off("click").on("click",function(event){easyDialog.close();});
			order.calcharge.trObj=obj;
		}else{
			$.alert("提示","没有可添加费用项的业务对象！");
		}
	};
	var _addSubmit=function(boId,boActionTypeCd,objType,objId,objName,actionName,objInstId,prodId){
		var refundType = "0" ;
		//撤单 if(OrderInfo.actionFlag==11||OrderInfo.actionFlag==19||OrderInfo.actionFlag==20){
		if(OrderInfo.actionFlag==11){
			refundType = "1" ;
		}else if(OrderInfo.actionFlag==19||OrderInfo.actionFlag==20){
			refundType = "2" ;
		}
		var param={"boId":boId,"objInstId":objInstId,"prodId":prodId,"boActionTypeCd":boActionTypeCd,"actionFlag":OrderInfo.actionFlag,
				"objType":objType,"objId":objId,"itemNum":num,"objName":objName,"actionName":actionName,"refundType":refundType};
		$.callServiceAsHtml(contextPath+"/order/getChargeAddByObjId",param,{
			"before":function(){
				$.ecOverlay("<strong>正在增加收费项,请稍等会儿....</strong>");
			},"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","查询失败,稍后重试");
					return;
				}
				_addItems(boId,response.data);
			},
			"fail":function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});	
	};
	var _addItems=function(boId,html){
		easyDialog.close();
		if(html!=''){
			$(order.calcharge.trObj).parent().parent().after(html);
			num--;
			_reflashTotal();
		}else{
			$.alert("提示","没有可添加的费用项");
			return;
		}
	};
	var _delItems=function(obj,val,str){
		if(str=='old'){
			var fee=$("#feeAmount_"+val).val();
			if(($("#realAmount_"+val).val())*100==0){
				$("#realAmount_"+val).val(((fee/100).toFixed(2))+"");
			}else{
				$("#realAmount_"+val).val('0');
			}			
			var real=($("#realAmount_"+val).val())*100;
			if(real!=fee){
				$("#chargeModifyReasonCd_"+val).show();
			}else{
				$("#chargeModifyReasonCd_"+val).hide();
			}
		}else{
			$(obj).parent().parent().remove();
		}
		_reflashTotal();
	};
	var _delItems2=function(obj,itemTypeId,val,str){
		var flag = _queryPayMethodByItem(itemTypeId,val,null);
		if(flag){
			if(str=='old'){
				var fee=$("#feeAmount_"+val).val();
				if(($("#realAmount_"+val).val())*100!=0){
					$("#realAmount_"+val).val(((fee/100).toFixed(2))+"");
				}else{
					$("#realAmount_"+val).val('0');
				}			
				var real=($("#realAmount_"+val).val())*100;
				if(real!=fee){
					$("#chargeModifyReasonCd_"+val).show();
				}else{
					$("#chargeModifyReasonCd_"+val).hide();
				}
			}else{
				$(obj).parent().parent().remove();
			}
			_reflashTotal();
		}
	};
	var _reflashTotal=function(){
		_chargeItems=[];
		_prints=[];
		var realAmount=0;
		$("#calTab tbody tr").each(function() {
			var val = $(this).attr("id");
			if(val!=undefined&&val!=''){
				val=val.substr(5,val.length);
				if($("#paymentAmount_"+val) && $("#paymentAmount_"+val).val()*1==0){
					
				}else{
					var aa=($("#realAmount_"+val).val())*1;
					if(OrderInfo.actionFlag==11||OrderInfo.actionFlag==19||OrderInfo.actionFlag==20){
						aa=($("#backAmount_"+val).val())*1;
					}
					realAmount=realAmount+aa;
					_commitParam(val);
				}
			}
		});
		if(OrderInfo.actionFlag==15){
			var backAmount=0;
			$("#calTab tbody tr").each(function() {
				var val = $(this).attr("id");
				if(val!=undefined&&val!=''){
					if($("#paymentAmount_"+val) && $("#paymentAmount_"+val).val()*1==0){
						
					}else{
						val=val.substr(5,val.length);
						var aa=($("#backAmount_"+val).val())*1;
						backAmount=backAmount+aa;
					}
				}
			});
			$('#backAmount').val(Number(backAmount).toFixed(2));
		}
		//alert(JSON.stringify(_prints));
		$('#realmoney').val(Number(realAmount).toFixed(2));
		if(OrderInfo.actionFlag==15){
			order.refund.conBtns();
		}else{
			_conBtns();
		}
	};
	var _submitParam=function(){
		var remakrFlag = true ;
		$("#calTab tbody tr").each(function() {
			var val = $(this).attr("id");
			if(val!=undefined&&val!=''){
				val=val.substr(5,val.length);
				var chargeModifyReasonCd=$("#chargeModifyReasonCd_"+val).val();
				if(chargeModifyReasonCd=="1"){
					if($("#remark_"+val).val()==undefined||$("#remark_"+val).val()==null||$("#remark_"+val).val()==''){
						remakrFlag = false ;
					}
				}
			}
		});
		if(!remakrFlag){
			$.alert("提示信息","请填写修改原因");
			return false ;
		}
		_chargeItems=[];
		$("#calTab tbody tr").each(function() {
			var val = $(this).attr("id");
			if(val!=undefined&&val!=''){
				val=val.substr(5,val.length);
				var realmoney=($("#realAmount_"+val).val())*100+'';
				var amount=$("#feeAmount_"+val).val();
				var feeAmount="";
				if(amount!=undefined&&amount!=''){
					feeAmount=amount+'';
				}else{
					feeAmount=realmoney;
				}
				if(OrderInfo.actionFlag==11||OrderInfo.actionFlag==19||OrderInfo.actionFlag==20){
					feeAmount = $("#feeAmount_"+val).val()*1+'';
					realmoney = (0-($("#backAmount_"+val).val())*100)+'';
					//realmoney = (parseInt(feeAmount) + parseInt(realmoney))+'';
					//alert("feeAmount="+feeAmount+"||realmoney="+realmoney);
				}
				var acctItemTypeId=$("#acctItemTypeId_"+val).val();
				var objId=$("#objId_"+val).val();
				var objType=$("#objType_"+val).val();
				var acctItemId=$("#acctItemId_"+val).val();
				var boId=$("#boId_"+val).val();
				var payMethodCd=$("#payMethodCd_"+val).val();
				var objInstId=$("#objInstId_"+val).val();
				var prodId=$("#prodId_"+val).val();
				var boActionType=$("#boActionType_"+val).val();
				var paymentAmount = $("#paymentAmount_"+val).val();
				var chargeModifyReasonCd = 1 ;
				var remark="";
				if($("#chargeModifyReasonCd_"+val).is(":hidden")){
					if(feeAmount!=realmoney){
						remark="其他";
					}
				}else{
					chargeModifyReasonCd = $("#chargeModifyReasonCd_"+val).val();
					remark=$('#chargeModifyReasonCd_'+val).find("option:selected").text();
					if(chargeModifyReasonCd=="1"){
						remark = $("#remark_"+val).val();
					}
				}
				var param={"realAmount":realmoney,
						"feeAmount":feeAmount,
						"paymentAmount":paymentAmount,
						"acctItemTypeId":acctItemTypeId,
						"objId":objId,
						"objType":objType,
						"acctItemId":acctItemId,
						"boId":boId,
						"prodId":prodId,
						"objInstId":objInstId,
						"payMethodCd":payMethodCd,
						"posSeriaNbr":"-1",
						"chargeModifyReasonCd":chargeModifyReasonCd,
						"remark":remark,
						"boActionType":boActionType
				};
				_chargeItems.push(param);
			}
		});
		return true ;
	};
	var _selectChangePayMethodCd=function(trid){
		var methodCd=$("#changeMethod_"+trid).val();
		$("#payMethodCd_"+trid).val(methodCd);
	};
	//调用接口，判断用户是否可以修改金额，并加载付费类型
	var _queryPayMethodByItem = function(itemTypeId,trid,defmethod){
		var params={"acctItemTypeId":itemTypeId};
		var url=contextPath+"/order/queryPayMethodByItem";
		
		var response = $.callServiceAsJson(url, params);
		if (response.code == 0) {
			if(response.data!=undefined&&response.data!=null){
				if(response.data.length>0){
					var items=response.data;
					var flag=false;
					if(OrderInfo.actionFlag==11){//撤单
						if(items[0].limitChange=="N"){
							return true ;
						}
					}else if(OrderInfo.actionFlag==19||OrderInfo.actionFlag==20){//返销
						if(items[0].limitBuyBack=="N"){
							return true ;
						}
					}else if(OrderInfo.actionFlag==15){
						if(items[0].limitRedo=="N"){
							flag=true;
						}
					}else{
						if(items[0].limitChange=="N"){
							flag=true;
						}
					}
					if(flag){
						//if(OrderInfo.actionFlag!=19&&OrderInfo.actionFlag!=20&&OrderInfo.actionFlag!=15){
							var methodsInfo=items[0].payMethods;
							if(methodsInfo.length>0){
								if(trid){
									var id="'"+trid+"'";
									var html='<select class=\'txt_cal_edit\' id="changeMethod_'+trid+'" style="border: 1px solid #DCDCDC;height: 23px;line-height: 23px;padding: 1px; width: 120px;" onchange="order.calcharge.selectChangePayMethodCd('+id+')">';
									$.each(methodsInfo,function(i,method){
										if(method.payMethodCd==defmethod){
											html+='<option value="'+method.payMethodCd+'" selected="selected">'+method.payMethodName+'</option>';
										}else{
											html+='<option value="'+method.payMethodCd+'">'+method.payMethodName+'</option>';
										}
									});
									html+='</select>';
									$("#payMethodText_"+trid).html(html);
								}
							}
						//}
						return true ;
					}else{
						$.alert("提示","当前产品不可修改费用!");
						return false ;
						
					}
					
				}
			}
		}else if (response.code == -2) {
			$.alertM(response.data);
			return false ;
		}else{
			$.alert("提示","查询付费方式失败!");
			return false ;
		}
		
		
		
	};
	
	var _bindChargeModifyReason = function(trid){
		if($("#chargeModifyReasonCd_"+trid).val()=="1"){
			$("#remark_"+trid).css("display","inline");
		}else{
			$("#remark_"+trid).css("display","none");
		}
	};
	
	var _changePayMethod=function(itemTypeId,trid,defmethod,obj){
		var flag = _queryPayMethodByItem(itemTypeId,trid,defmethod);
		if(flag){
			//$("#chargeModifyReasonCd_"+trid).show();
			//$("#remark_"+trid).hide();chargeModifyReasonCd
			$("#chargeModifyReasonCd_"+trid).off("change").on("change",function(){
				if($(this).val()=="1"){
					$("#remark_"+trid).css("display","inline");
				}else{
					$("#remark_"+trid).css("display","none");
				}
			});
			if(OrderInfo.actionFlag==11||OrderInfo.actionFlag==19||OrderInfo.actionFlag==20||OrderInfo.actionFlag==15){//撤单，返销，补退费
				$("#backAmount_"+trid).removeAttr("disabled").css("border","1px solid #DCDCDC").focus() ;
			}else{
				$("#realAmount_"+trid).removeAttr("disabled").css("border","1px solid #DCDCDC").focus() ;
			}
		}
		$(obj).removeAttr("onclick").removeClass("money_edit").addClass("money_edit_gray");
	};
	var _commitParam=function(val){
		var realmoney=($("#realAmount_"+val).val())*100+'';
		var amount=$("#feeAmount_"+val).val();
		var feeAmount="";
		if(amount!=undefined&&amount!=''){
			feeAmount=amount+'';
		}else{
			feeAmount=realmoney;
		}
		var acctItemTypeId=$("#acctItemTypeId_"+val).val();
		var objId=$("#objId_"+val).val();
		var objType=$("#objType_"+val).val();
		var acctItemId=$("#acctItemId_"+val).val();
		var acctItemTypeName=$("#acctItemTypeName_"+val).val();
		var paymentAmount = $("#paymentAmount_"+val).val();
		var param2={"realmoney":realmoney,
				"feeAmount":feeAmount,
				"paymentAmount":paymentAmount,
				"acctItemTypeId":acctItemTypeId,
				"objId":objId,
				"objType":objType,
				"acctItemId":acctItemId,
				"acctItemTypeName":acctItemTypeName
		};
		_prints.push(param2);
	};
	var _editMoney=function(obj,val,str){//obj:对象,val:id,str:类型
		var cash=$.trim($(obj).val());//当前费用
		if(cash==''){
			$(obj).val('0');
			order.calcharge.reflashTotal();
		}else{
			if(str=="old"){//修改费用
				var amount=$("#feeAmount_"+val).val();
				var check = true ;
				if(!/^(-)?[0-9]+([.]\d{1,2})?$/.test(cash)){
			  		$.alert("提示","费用金额请输入数字，最高保留两位小数！");
			  		check = false ;
				}else if((cash*100>amount*1)&&cash>0){
					$.alert("提示","实收费用金额不能高于应收金额！");
					check = false ;
				}else if((cash*100<amount*1)&&cash<0){
					$.alert("提示","实收费用金额不能低于应收金额！");
					check = false ;
				}
				if(check){
					var real=($(obj).val())*100;
		  			if(real!=amount){
		  				$("#chargeModifyReasonCd_"+val).show();
					}else{
						$("#chargeModifyReasonCd_"+val).hide();
						$("#remark_"+val).hide();
					}
					_reflashTotal();
				}else{
					if(money!=''){
			  			$(obj).val(money);
			  		}
			  		money="";
				}
			}else if(str=="undo"){//退费：撤单和返销
				var check = true ;
				if(!/^(-)?[0-9]+([.]\d{1,2})?$/.test(cash)){//金额非数字，恢复金额
			  		$.alert("提示","费用金额请输入数字，最高保留两位小数！");
			  		check = false ;
				}else{
					if(cash<0){//退费金额 不能填负值
						$.alert("提示","退费金额不能为负值！");
						check = false ;
					}else{
						var amount=$("#realhidden_"+val).val();
						var v_cash = cash*-1 ;
						if(v_cash<amount*1){//要退-100，不能退120
							$.alert("提示","退费金额不能高于实收金额！");
							check = false ;
						}
					}
				}
				if(check){
					var real=($(obj).val())*-1;
					var amount=$("#realhidden_"+val).val();
					if(real!=0){
		  				$("#chargeModifyReasonCd_"+val).show();
					}else{
						$("#chargeModifyReasonCd_"+val).hide();
						$("#remark_"+val).hide();
					}
					_reflashTotal();
				}else{
					if(money!=''){
			  			$(obj).val(money);
			  		}
			  		money="";
				}
			}else if(str=="new"){//新增费用
				if(!/^(-)?[0-9]+([.]\d{1,2})?$/.test(cash)){
			  		$.alert("提示","费用金额请输入数字，最高保留两位小数！");
			  		if(money!=''){
			  			$(obj).val(money);
			  		}
			  		money="";
				}else{
					_reflashTotal();
				}
			}
		}
	};
	var _setGlobeMoney=function(obj){
		money=$.trim($(obj).val());
	};
	var _disableButton=function(){
		$("#toCharge").removeClass("btna_o").addClass("btna_g");
		$("#toComplate").removeClass("btna_o").addClass("btna_g");
		$("#orderCancel").removeClass("btna_o").addClass("btna_g");
		$("#orderCancel").off("click");
		$("#toComplate").off("click");
		$("#toCharge").off("click");
	};
	var _conBtns=function(){
		$("#orderCancel").removeClass("btna_g").addClass("btna_o");
		var val=($('#realmoney').val())*1;
		if(OrderInfo.actionFlag==11){
			$("#orderCancel").off("click").on("click",function(event){
				order.undo.orderBack();
			});
		}else{
			$("#orderCancel").off("click").on("click",function(event){
				SoOrder.orderBack();
			});
		}
		
		if(!submit_success){
			if(val!=0){
				$("#toCharge").removeClass("btna_g").addClass("btna_o");
				$("#toComplate").removeClass("btna_o").addClass("btna_g");
				$("#toCharge").off("click").on("click",function(event){
					_tochargeSubmit('1');
				});
				$("#toComplate").off("click");
			}else{
				$("#toCharge").removeClass("btna_o").addClass("btna_g");
				$("#toComplate").removeClass("btna_g").addClass("btna_o");
				$("#toCharge").off("click");
				$("#toComplate").off("click").on("click",function(event){
					_tochargeSubmit('0');
				});
			}
		}else{
//			if(val!=0){
//				$("#printInvoiceA").removeClass("btna_g").addClass("btna_o");
//			}else{
//				$("#printInvoiceA").removeClass("btna_o").addClass("btna_g");
//				$("#printInvoiceA").off("click");
//			}
			$("#toCharge").removeClass("btna_o").addClass("btna_g");
			$("#toComplate").removeClass("btna_o").addClass("btna_g");
			$("#toCharge").off("click");
			$("#toComplate").off("click");
		}
	};
	var _tochargeSubmit=function(flag){
		_disableButton();
		//TEST BEGIN
//		$.confirm("信息提示","收费成功，是否打印发票?",{
//			names:["是","否"],
//			yesdo:function(){
//				var param={
//					"soNbr":OrderInfo.order.soNbr,
//					"billType" : 0,
//					"olId" : _olId,
//					"areaId" : OrderInfo.staff.areaId,
//					"acctItemIds":[]
//				};
//				common.print.prepareInvoiceInfo(param);
//				return;
//			},
//			no:function(){						
//			}
//		});
//		return;
		//TEST END
		if(submit_success){
			$.alert("提示","订单已经建档成功,不能重复操作!");
			return;
		}
		if(inOpetate){
			return;
		}
		inOpetate=true;
		if(!_submitParam()){
			return ;
		}
		var url=contextPath+"/order/checkRuleToProv";
		var params={
				"olId":_olId,
				"soNbr":OrderInfo.order.soNbr,
				"areaId" : OrderInfo.staff.areaId,
				"chargeItems":_chargeItems
		};
		$.callServiceAsJson(url,params, {
			"before":function(){
				$.ecOverlay("<strong>正在处理中,请稍等会儿....</strong>");
			},"always":function(){
				$.unecOverlay();
			},	
			"done" : function(response){
				if (response.code == 0) {
					_chargeSave(flag);
				}else if (response.code == -2) {
					_conBtns();
					inOpetate=false;
					$.alertM(response.data);
				}else{
					_conBtns();
					inOpetate=false;
					if(response.data!=undefined){
						$.alert("提示",response.data);
					}else{
						$.alert("提示","费用信息校验失败!");
					}
				}
			}
		});
	};
	var _chargeSave = function(flag){
		var params={
				"olId":_olId,
				"soNbr":OrderInfo.order.soNbr,
				"areaId" : OrderInfo.staff.areaId,
				"chargeItems":_chargeItems
		};
		var url=contextPath+"/order/chargeSubmit?token="+OrderInfo.order.token;
		var response=$.callServiceAsJson(url, params, {});
		var msg="";
		if (response.code == 0) {
			submit_success=true;
			//受理成功，不再取消订单
			SoOrder.delOrderFin();
			
			if(OrderInfo.actionFlag==31){//改产品密码，则将session中密码重置，用户需要重新输入密码
				var url=contextPath+"/cust/passwordReset";
				var response2 = $.callServiceAsJson(url, null, {});
			}
			if(flag=='1'){
				if(OrderInfo.actionFlag==11){
					msg="退费成功";
				}else{
					msg="收费成功";
				}
			}else{
				msg="受理成功";
			}	
			
			//移除费用新增、费用修改按钮
			$(".charge_add").remove();
			//禁用费用项修改框
			$(".cash_inp_dis").attr("disabled","disabled");
			$("#orderCancel").removeClass("btna_g").addClass("btna_o");
			$("#printVoucherA").removeClass("btna_o").addClass("btna_g").off("click");
			if(OrderInfo.actionFlag==11){
				$("#orderCancel").html("<span>返回首页</span>");
				$("#orderCancel").off("click").on("click",function(event){
					order.undo.toUndoMain(1);
				});
			}else{
//						$("#orderCancel").removeClass("btna_o").addClass("btna_g");
//						$("#orderCancel").off("click");
				//将订单取消改为继续受理
				$("#orderCancel span").html("继续受理");
				$("#orderCancel").off("click").on("click",function(event){_backToEntr();});
			}
			//异地补换卡调用订单受理接口在本地存储订单数据
			//alert("DiffPlaceFlag:"+$("#DiffPlaceFlag").val());
			//alert(JSON.stringify(OrderInfo));
			/*屏蔽异地写卡订单记录
			if (OrderInfo.boActionTypeCd == "14" && $("#DiffPlaceFlag").val() == "diff"
				&& OrderInfo.orderData.orderList.orderListInfo.areaId!=OrderInfo.staff.areaId){
				var orderData = OrderInfo.orderData;
				orderData.orderList.orderListInfo.areaId = OrderInfo.staff.areaId;
				orderData.orderList.custOrderList[0].busiOrder[0].areaId = OrderInfo.staff.areaId;
				orderData.orderList.custOrderList[0].busiOrder[0].boActionType.boActionTypeCd = "-10000";
				var result = query.offer.orderSubmitComplete(JSON.stringify(OrderInfo.orderData));
				if (result.resultCode == "0"){
					alert(result.resultMsg);
				}else{
					alert("创建本地订单失败：原因："+result.resultMsg);
				}
			}
			*/
			SoOrder.updateResState(); //修改UIM，号码状态
			//金额不为零，提示收费成功
			if(flag=='1'){
				var realmoney=($('#realmoney').val())*1;
				//费用大于0，才可以打印发票
				if (realmoney > 0) {
					//收费成功，先调初始化发票信息
					var param={
						"soNbr":OrderInfo.order.soNbr,
						"billType" : 0,
						"olId" : _olId,
						"printFlag" : -1,
						"areaId" : OrderInfo.staff.areaId,
						"acctItemIds":[]
					};
					var initResult = common.print.initPrintInfo(param);
					if(!initResult) {
						return;
					}
					//然后提示是否打印发票
					$.confirm("信息提示","收费成功，是否打印发票?",{
						names:["是","否"],
						yesdo:function(){
							var param={
								"soNbr":OrderInfo.order.soNbr,
								"billType" : 0,
								"olId" : _olId,
								"printFlag" : 0,
								"areaId" : OrderInfo.staff.areaId,
								"acctItemIds":[]
							};
							common.print.prepareInvoiceInfo(param);
							return;
						},
						no:function(){
						}
					});
				} else {
					//提示收费成功
					_showFinDialog(flag, msg);
				}
			} else {
				//提示受理完成
				_showFinDialog(flag, msg);
			}
			//将订单取消改为继续受理
//					$("#orderCancel span").html("继续受理");
//					$("#orderCancel").off("click").on("click",function(event){_backToEntr();});
			return;
			
		}else if (response.code == -2) {
			_conBtns();
			SoOrder.getToken();
			inOpetate=false;
			$.alertM(response.data);
		}else{
			_conBtns();
			SoOrder.getToken();
			inOpetate=false;
			if(response.data!=undefined){
				$.alert("提示",response.data);
			}else{
				$.alert("提示","费用信息提交失败!");
			}
		}
		
	};
	var _showFinDialog=function(flag, msg){
		var html='<table class="contract_list rule">';
		if(flag=='1'){
			if(OrderInfo.actionFlag==11){
				html+='<thead><tr> <td colspan="2">退费结果</td></tr></thead></table>';
			}else{
				html+='<thead><tr> <td colspan="2">收费结果</td></tr></thead></table>';
			}
		}else{
			html+='<thead><tr> <td colspan="2">受理结果</td></tr></thead></table>';
		}
		html+='<div id="rules_div">';
		html+='<table width="100%" border="0" cellspacing="0" cellpadding="0">';
		html+='<tr>';
		html+='<td align="right"><i class="rule_icon"></i></td>';
		html+='<td><span class="rule_font">'+msg+'</span></td>';
		html+='</tr>';
		html+='</table>';
		html+='</div>';
		easyDialog.open({
			container : 'successTip_dialog'
		});
		$("#successTipContent").html('');
		$("#successTipContent").html(html);
		$("#successTipclose,#successTip_dialog_cls").off("click").on("click",function(event){easyDialog.close();order.cust.custReset();});
		
		$(".txt_cal_edit").attr("disabled","disabled");
		$(".charge_add").remove();
		
		//返回三个入口
		if(OrderInfo.actionFlag==11){
			$("#successTip_dialog_cnt").off("click").on("click",function(event){order.undo.toUndoMain(1);});
		}else{
			$("#successTip_dialog_cnt").off("click").on("click",function(event){_backToEntr();});
		}
		if(flag=='1'){
			if(OrderInfo.actionFlag==11){
				$("#successTip_dialog_inv").show();
				$("#successTip_dialog_inv").off("click").on("click",function(event){_invaideInvoice();});
				$("#successTip_dialog_inv").css("margin-left","30px");
				$("#successTip_dialog_cnt").css("margin-left","30px");
			}	
		}
	};
	
	var _showErrorInfo=function(){
		if($('#sumitErrorInfo').is(':hidden')){
			$("#sumitErrorInfo").css("display","");
		}else{
			$("#sumitErrorInfo").css("display","none");
		}
	};
	var _selePaymethod=function(str,obj){
		var selObj =$("#payMethodCd_"+str);
		selObj.empty();
		$("select[@id=backpayMethodCd_"+str+"] option").each(function(){
			var vv=$(this).val();
			if(vv!=undefined){
				var tt=$(this).text();
				if(vv.split("_")[1]==$(obj).val()){
					$("<option value='"+vv.split("_")[0]+"'>"+tt+"</option>").appendTo(selObj);
				}
			}
	    });

	};
	var _backToEntr=function(){
		//如果有easyDialog弹出框，则关闭它
		if ($("#successTip_dialog").is(":visible")) {
			easyDialog.close();			
		}
		
		if (OrderInfo.actionFlag == 17 || OrderInfo.actionFlag == 18) {
			window.location.href = contextPath+"/mktRes/terminal/exchangePrepare";
			return;
		}else if(OrderInfo.actionFlag ==8){
			window.location.href = contextPath+"/cust/mvnoCustCreate";
			return;
		}
		$("#order_confirm,#order_fill_content,#order_tab_panel_content").empty();
		$("#order_prepare").show();
		order.cust.custReset();
		//如果是新建客户，则要重置客户信息
		if(OrderInfo.cust.custId == -1) {
			order.cust.custReset();
		}
	};
	var _calchargeInit=function(){
		$("#step1").hide();
		$("#step2").hide();
		$("#step3").show();
		_olId = OrderInfo.orderResult.olId;
		_soNbr = OrderInfo.orderResult.soNbr;
		_chargeItems = [];
		_prints=[];
		num=0;
		money=0;
		submit_success=false;
		inOpetate=false;
		var refundType = "0" ;
		if(OrderInfo.actionFlag==11){
			refundType = "1" ;
		}else if(OrderInfo.actionFlag==19||OrderInfo.actionFlag==20){
			refundType = "2" ;
		}
		var params={
			"olId":_olId,
			"actionFlag":OrderInfo.actionFlag,
			"actionTypeName" : encodeURI(OrderInfo.actionTypeName),
			"businessName" : encodeURI(OrderInfo.businessName),
			"olNbr":OrderInfo.orderResult.olNbr,
			"soNbr" : OrderInfo.order.soNbr,
			"refundType":refundType
		};
		$.callServiceAsHtmlGet(contextPath+"/order/getChargeList",params,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","收费页面加载失败，请稍后重试");
					return;
				}
				SoOrder.getToken();
				var content$=$("#order_confirm");
				content$.html(response.data).show();
				if(OrderInfo.actionFlag==1){ 
					$("#buytitle").html("<span>订购</span>"+OrderInfo.offerSpec.offerSpecName);
				}else if(OrderInfo.actionFlag==11){
					$("#buytitle").html("撤单");
					$("#toCharge").html("<span>退费</span>");
				}else if(OrderInfo.actionFlag==13 || OrderInfo.actionFlag==17 || OrderInfo.actionFlag==18){
					$("#buytitle").html("<span>"+OrderInfo.actionTypeName+"</span>"+OrderInfo.businessName);
				}else if(OrderInfo.actionFlag==19||OrderInfo.actionFlag==20){
					$("#buytitle").html("返销");
					$("#toCharge").html("<span>退费</span>");
				}else{
					$("#buytitle").html("<span>"+OrderInfo.actionTypeName+"</span>");
				}
				$.each($(".cashier_td"),function(){
					var prodId=$(this).attr("id");
					var obj=$(this);
					if($.trim($(this).html())==""&&$("#phoneNumListtbody")!=undefined){
						$.each($("#phoneNumListtbody tr").find("td:eq(0)"),function(){
							 var prodInstId=$(this).attr("prodInstId");
							 var accNbr=$(this).attr("accNbr");
							 var prodName=$(this).attr("productName");
							 if(prodInstId!=undefined&&accNbr!=undefined){
								 if(prodId==prodInstId){
									 obj.html(prodName+"&nbsp;-&nbsp;"+accNbr);
								 }
							 }
						});	
					}
					
				});
				$("#printVoucherA").off("click").on("click", function(event){
					if(!_submitParam()){
						return ;
					}
					var voucherInfo = {
						"olId":_olId,
						"soNbr":OrderInfo.order.soNbr,
						"busiType":"1",
						"chargeItems":_chargeItems
					};
					if(_getCookie('_session_pad_flag')=='1'){
						common.print.signVoucher(voucherInfo);
					}else{
						common.print.printVoucher(voucherInfo);
					}
				});
				_reflashTotal();
			},
			"fail":function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	var _getCookie = function(name){
		var cookievalue = "";
		var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
		if(arr != null) {
			cookievalue = unescape(arr[2]);
		}
		return cookievalue;
	};
	var _appendTrTd = function(item){
		//补贴金额,赠送话费额 不计入
		if(item.acctItemTypeId == '2090000' || item.acctItemTypeId == '2091000'){
			return '';
		}
		if(item.feeAmount == 0){
			return '';
		}
		var html = "<tr>";
		html += '<td>';
		//先预设打印次数为0
		item.printTimes = 0;
		if(item.printTimes == 0){
			html += '<input type="checkbox" checked="checked" name="acctItem" value="';
		}else{
			html += '<input type="checkbox" disabled="disabled" name="acctItem" value="';
		}
		html += item.acctItemTypeId + '_' + item.objId  + '"/>';
		
		html += '</td>';
		html += '<td style="width: 200px">'+item.acctItemTypeName+'</td>';
		html += '<td>'+ (parseFloat(item.realmoney)/100).toFixed(2)+'</td>';
		html += '</tr>';
		return html;
	};
	


	var _invaideInvoice = function(){
		var params = {"olId":OrderInfo.order.oldSoId,"soNbr":OrderInfo.order.oldSoNbr} ;
		$.callServiceAsHtmlGet(contextPath+"/order/invaideInvoice",params,{
			"before":function(){
				$.ecOverlay("<strong>正在处理中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code==0){
					//alert(response.data);
					var data = $.parseJSON(response.data) ;
					if(data.code==0){
						//$("#successTip_dialog_inv").removeClass("btna_o").addClass("btna_g");
						$("#successTip_dialog_inv").off("click");
						$.alert("提示","作废发票成功！");	
					}else if(data.code==1){
						$.alert("提示","作废发票失败！");
					}else if(data.code==2){
						$.alert("提示","未获取到发票信息！");
					}else if(data.code==3){
						$.alert("提示","获取发票失败！");
					}else{
						$.alert("提示","作废发票异常！");
					}
				} else if(response.code == -2){
				}else{
					$.alert("提示","作废发票异常！");
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	
	return {
		addItems:_addItems,
		delItems:_delItems,
		reflashTotal:_reflashTotal,
		editMoney:_editMoney,
		setGlobeMoney:_setGlobeMoney,
		conBtns:_conBtns,
		addbusiOrder:_addbusiOrder,
		addSubmit:_addSubmit,
		selePaymethod:_selePaymethod,
		calchargeInit:_calchargeInit,
		showErrorInfo:_showErrorInfo,
		pageFlag:_pageFlag,
		changePayMethod:_changePayMethod,
		selectChangePayMethodCd:_selectChangePayMethodCd,
		bindChargeModifyReason:_bindChargeModifyReason,
		invaideInvoice:_invaideInvoice
	};
})();

