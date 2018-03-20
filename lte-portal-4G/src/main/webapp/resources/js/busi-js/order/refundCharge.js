
CommonUtils.regNamespace("order", "refund");
/**
 *订单查询.
 */
order.refund = (function(){
	var submit_success=false;
	var _olId=0;
	var _olNbr=0;
	var money=0;
	var _areaId=OrderInfo.staff.areaId;
	var _soNbr=0;
	var _queryOrderList = function(pageIndex){
		if(!$("#p_areaId_val").val()||$("#p_areaId_val").val()==""){
			$.alert("提示","请选择'地区'再查询");
			return ;
		}
		var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
		var param = {"areaId":$("#p_areaId").val(),
				"startDt":$("#p_startDt").val().replace(/-/g,''),
//				"endDt":$("#p_endDt").val().replace(/-/g,''),
				"qryNumber":$("#p_qryNumber").val(),
				"channelId":$("#p_channelId").val(),
				"busiStatusCd":"301200",
				"olNbr":$("#p_olNbr").val(),
				"refundFlag":"refund",
				"olStatusCd":"",
				"qryBusiOrder":$("#p_qryBusiOrder").val(),
				nowPage:curPage,
				pageSize:10
		};
		
		$.callServiceAsHtmlGet(contextPath+"/report/cartList",param,{
			"before":function(){
				$.ecOverlay("订单查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					 response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>数据加载失败，请稍后重试</strong></div>';
				}
				var content$=$("#order_list");
				content$.html(response.data).removeClass("cuberight in out").addClass("pop in");
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	var _editMoney=function(obj,val,str){
		var cash=$.trim($(obj).val());
		if(cash==''){
			$(obj).val('0');
			order.calcharge.reflashTotal();
		}else{
			if(str=="old"){
				var check = true ;
				if(!/^[0-9]+([.]\d{1,2})?$/.test(cash)){//金额非数字，恢复金额
			  		$.alert("提示","费用金额请输入数字，最高保留两位小数！");
			  		check = false ;
				}else{
					if(cash<0){//退费金额 不能填负值
						$.alert("提示","退费金额不能为负值！");
						check = false ;
					}else{
						var amount=$("#realhidden_"+val).val();
						if(cash*1>amount*1){//要退100，不能退120
							$.alert("提示","退费金额不能高于实收金额！");
							check = false ;
						}
					}
				}
				if(check){
					var amount=$("#realhidden_"+val).val();
					if(cash!=0){
		  				$("#chargeModifyReasonCd_"+val).show();
					}else{
						$("#chargeModifyReasonCd_"+val).hide();
						$("#remark_"+val).hide();
					}
					//$("#realAmount_"+val).val(amount-cash);
					order.calcharge.reflashTotal();
				}else{
					if(money!=''){
			  			$(obj).val(money);
			  		}
			  		money="";
				}
			}
			
		}
	};
	var _setGlobeMoney=function(obj){
		money=$.trim($(obj).val());
	};
	var _delItems=function(obj,val,str){
		if(str=='old'){
			var fee=$("#realhidden_"+val).val();
			if(($("#realAmount_"+val).val())*100==0){
				$("#realAmount_"+val).val(fee);
				$("#backAmount_"+val).val('0.00');
			}else{
				$("#realAmount_"+val).val('0.00');
				$("#backAmount_"+val).val(fee);
			}	
			var back=($("#backAmount_"+val).val())*1;
  			if(back>0){
  				$("#chargeModifyReasonCd_"+val).show();	
			}else{
				$("#chargeModifyReasonCd_"+val).hide();
				$("#remark_"+val).hide();
			}
		}else{
			$(obj).parent().parent().remove();
		}
		order.calcharge.reflashTotal();
	};
	var _queryChargeItems=function(olId,olNbr,areaId){
		_olId=olId;
		_areaId=areaId;
		_olNbr=olNbr;
		_soNbr = UUID.getDataId();
		OrderInfo.order.soNbr=_soNbr;
		var param={
			"olId" : olId,
			"areaId" : areaId,
			"olNbr":olNbr,
			"soNbr":_soNbr
		};
		var url=contextPath+"/order/refund/chargeList";
		$.callServiceAsHtmlGet(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","数据加载失败，请稍后重试");
					return;
				}
				submit_success=false;
				$("#d_refund_order").hide();
				var content$=$("#order_charge");
				content$.html(response.data).show();
				OrderInfo.actionFlag=15;//补退费
				order.calcharge.reflashTotal();
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	var _conBtns=function(){
		var real=($('#realmoney').val())*1;
		$("#orderCancel").off("click").on("click",function(event){
			$("#d_refund_order").show();
			$("#order_charge").hide();
		});
		var flag=false;
		var back=0;
		$("#calTab tbody tr").each(function() {
			var val = $(this).attr("id");
			if(val!=undefined&&val!=''){
				val=val.substr(5,val.length);
				var aa=($("#backAmount_"+val).val())*1;
				var itemType=$("#acctItemId_"+val).val();
				var real=$("#realAmount_"+val).val();
				if(itemType=="-1"&&real*1>0){
					flag=true;
				}
				back=back+aa;
			}
		});
		if(back>0){
			flag=true;
		}
		if(!submit_success){
			if(real>0){
				$("#printInvoiceA").removeClass("btna_g").addClass("btna_o");
				$("#printInvoiceA").off("click").on("click",function(event){
					var param={
						"soNbr":OrderInfo.order.soNbr,
						"billType" : 0,
						"olId" : _olId,
						"areaId" : OrderInfo.staff.areaId,
						"acctItemIds":[]
					};
					OrderInfo.orderResult.olId=_olId;
					OrderInfo.orderResult.olNbr=_olNbr;
					common.print.prepareInvoiceInfo(param);
				});	
			}else{
				$("#printInvoiceA").removeClass("btna_o").addClass("btna_g");
				$("#printInvoiceA").off("click");
			}
			if(flag){
				$("#toComplate").removeClass("btna_g").addClass("btna_o");
				$("#toComplate").off("click").on("click",function(event){
					_tochargeSubmit();
				});
			}else{
				$("#toComplate").removeClass("btna_o").addClass("btna_g");
				$("#toComplate").off("click");
			}
		}else{
			if(real>0){
				$("#printInvoiceA").removeClass("btna_g").addClass("btna_o");
			}else{
				$("#printInvoiceA").removeClass("btna_o").addClass("btna_g");
				$("#printInvoiceA").off("click");
			}
			$("#toComplate").removeClass("btna_o").addClass("btna_g");
			$("#toComplate").off("click");
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
				var acctItemId=$("#acctItemId_"+val).val();
				var realmoney=($("#realAmount_"+val).val())*100+'';
				var amount=$("#feeAmount_"+val).val();
				var backAmount=$("#backAmount_"+val).val();
				var feeAmount="";
				if(amount!=undefined&&amount!=''){
					feeAmount=amount+'';
				}else{
					feeAmount=realmoney;
				}
				
				
				if(OrderInfo.actionFlag==15){
					feeAmount = $("#feeAmount_"+val).val()*1;
					realmoney = $("#realAmount_"+val).val()*100-$("#backAmount_"+val).val()*100;
				}

				var operType="";
				if(acctItemId=="-1"||(backAmount*1>0)){
					var acctItemTypeId=$("#acctItemTypeId_"+val).val();
					var objId=$("#objId_"+val).val();
					var objType=$("#objType_"+val).val();
					var boId=$("#boId_"+val).val();
					var payMethodCd=$("#payMethodCd_"+val).val();
					var objInstId=$("#objInstId_"+val).val();
					var prodId=$("#prodId_"+val).val();
					var chargeModifyReasonCd=$("#chargeModifyReasonCd_"+val).val();
					var paymentAmount = $("#paymentAmount_"+val).val();
					var remark=$('#chargeModifyReasonCd_'+val).find("option:selected").text();
					if(chargeModifyReasonCd==1){
						remark = $("#remark_"+val).val();
					}
					
					if(acctItemId=="-1"){
						operType="1";
					}else if(backAmount*1>0){
						operType="-1";
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
							"operType":operType
					};
					_chargeItems.push(param);
				}
			}
		});
		return true ;
	};
	var _tochargeSubmit=function(){
		if(submit_success){
			$.alert("提示","订单已经激活,不能重复操作!");
			return;
		}
		if(!_submitParam()){
			return ;
		}
		
		if (order.calcharge.payFlag && ec.util.isObj($("#paymentTransId_"+val).val())) { 
			  
			var payMethodCdStr = offerChange.queryPortalProperties("PAY_METHOD_CD");
		    if (isAddChargeItem && $("#realmoney").val()- $("#backAmount").val() > 0) {
		    	
		    	if(orderr.calcharge.isNewPayMethodCd()){
		    		return _getPayToken();// 补费 
		    	}

		    }
		}
		var params={
			"olId":_olId,
			"areaId" : _areaId,
			"chargeItems":_chargeItems,
			"soNbr":OrderInfo.order.soNbr
		};
		var url=contextPath+"/order/refund/addOrReturnSubmit";
		$.callServiceAsJson(url, params, {
			"before":function(){
				$.ecOverlay("<strong>正在处理中,请稍等会儿....</strong>");
			},"always":function(){
				$.unecOverlay();
			},	
			"done" : function(response){
				var msg="";
				if (response.code == 0) {
					submit_success=true;
					msg="提交成功";	
				    if (order.calcharge.payFlag && ec.util.isObj($("#paymentTransId_"+val).val())) {   			
						if(($("#realmoney").val()- $("#backAmount").val() < 0 || (operType =-1 && !isAddChargeItem))){ //退费
							var payAmount = $("#realmoney").val()- $("#backAmount").val();
							if((operType =-1 && !isAddChargeItem)){
								payAmount =  $("#backAmount").val();
							}
						    _payRefund(OrderInfo.orderResult.olId,payAmount*100,'1100');
						}
				    }
					$("#toComplate").removeClass("btna_o").addClass("btna_g");
					$("#toComplate").off("click");	
					var html='<table class="contract_list rule">';
					html+='<thead><tr> <td colspan="2">受理结果</td></tr></thead></table>';
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
					$("#successTipclose").off("click").on("click",function(event){easyDialog.close();$("#d_refund_order").show();$("#order_charge").hide();});
					
					$(".txt_cal_edit").attr("disabled","disabled");
					$(".charge_add").remove();
					
					//order.cust.orderBtnflag="";
				}else if (response.code == -2) {
					$.alertM(response.data);
				}else{
					if(response.data!=undefined){
						$.alert("提示",response.data);
					}else{
						$.alert("提示","费用信息提交失败!");
					}
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
		
	};
	
	//支付退款
	 var _payRefund=function(_olId,payAmount,operationType){
		   var isSuccess = true;
		   if(ec.util.isArray(_getOrders(payAmount))){
			    var olId="";
			    if(OrderInfo.actionFlag == 11){
			       olId = OrderInfo.uOlId;  
				}if(OrderInfo.actionFlag == 19){
				   olId = OrderInfo.rOlId;
			    }
				var params={
						"olId":olId, 
						"newId":_olId,
						"payAmount":payAmount*100,
						"remark"   : OrderInfo.actionTypeName,
						"actionFlag" :OrderInfo.actionFlag,
						"operationType":operationType,
						"order":JSON.stringify(_getOrders(payAmount))
				};
				var url = contextPath+"/pay/payRefund";
				var response = $.callServiceAsJson(url, params);
				//if (response.code == 0) {// 支付平台能查询到订单才退款
					//params.payCode = response.data.payCode;
				//	var response = $.callServiceAsJson(url, params);
					if (response.code == 0) {
						if(operationType == "1000" && $("#payResultDiv")){
							$("#payResultDiv",document.frames("pay").document).empty();
							$("#payResultDiv",document.frames("pay").document).text("退费已成功，您的费用将在1到7个工作日退到您的账户，请注意查收!");
						}else{
							$.alert("提示","退费已成功，您的费用将在1到7个工作日退到您的账户，请注意查收!");
						}
						
						if(OrderInfo.actionFlag==15){
							$("#d_refund_order").show();$("#order_charge").hide();
						}else{
							 $("#payRefund").hide();
							 $('#payRefund').off("click");
							//$("#printVoucherA").hide();
							//$("#payInvoice").hide();
							 $("#payBack").show();
						}
					}else if (response.code == -2) {
						isSuccess = false;
						$.alertM(response.data);
					}else{
						isSuccess = false;
							if(response.data){
								if(operationType == "1000" && $("#payResultDiv")){
									$("#payIframe").contents().find("#payResultDiv").empty();
									$("#payIframe").contents().find("#payResultDiv").text(response.data);
								}else{
									$.alert("提示",response.data + ",请点击[我要退款]进行手动退款!");
								}
							}else{
								$.alert("提示","退款失败!要退款,请点击[我要退款]进行手动退款!");
							}
							//if(operationType == "1100"){
								$("#toComplate").removeClass("btna_o").addClass("btna_g");
								$("#toComplate").off("click");	
								$("#payRefund").show();
								$('#payRefund').off("click").on("click",function(event){_payRefund(OrderInfo.orderResult.olId,payAmount*100,'1100')});
							//}
						}
			    }
		   return isSuccess;
	 };
	/**
	 * 获取支付平台支付页面
	 */
	var _getPayToken = function(){
		
		var charge = $("#realmoney").val()- $("#backAmount").val();
		if((operType =-1 && !isAddChargeItem)){
			charge =  $("#backAmount").val();
		}
		//var charge= $("#realmoney").val();//支付金额
		//_chargeItems=[];
		//_buildChargeItems();
		
//		_setOlId(OrderInfo.orderResult.olId);
		
		if(_chargeItems.length==0){//费用项为空，则只设soNbr
			var item={
					"soNbr":OrderInfo.order.soNbr,
					"operType":operType
			};
			_chargeItems.push(item);
//			$.alert("提示","无费用项");
//			return;
		}
        var params={
				"olId":_olId,
				//"soNbr":OrderInfo.orderResult.olNbr,
				"charge":charge*100,
				"busiUpType":  OrderInfo.actionFlag, //OrderInfo.busitypeflag,
				"chargeItems":_chargeItems,
			//	"strParam":JSON.stringify(resources),
			//	"actionFlag":OrderInfo.actionFlag,
				"actionTypeName":OrderInfo.actionTypeName,
				"chargeCheck":"0"
		};

        $("#pay").empty();
		$("#pay").hide();
		var url = contextPath+"/pay/getPayUrl";
		var response = $.callServiceAsJson(url, params);
		if(response.code==0){
			payUrl=response.data;
		    $("#calTab").hide();
		    $("#pay").append("<iframe id ='payIframe'  src='"+ payUrl +"'> </iframe>"); //style='width:1200px;height: 330px;'
			$("#pay").show();
			$("#orderCancel").hide();
			$("#toComplate").hide();
			$("#payBack").show();
		}else if(response.code==1002){
//			var checkUrl = contextPath + "/pay/queryOrdStatusFromRedis";
//			var param = {
//					"olId" : _olId,
//					"reqPayType":"9"
//			};
//			var response2 = $.callServiceAsJson(checkUrl, param);
//			if (response2.code == 0){
//		            $("#calTab").hide();
//				    $("#pay").append("<iframe id ='payIframe' style='width:1200px;height: 330px;' src='"+ payUrl +"'> </iframe>");
//					$("#pay").show();
//					$("#orderCancel").hide();
//					$("#toComplate").hide();
//					$("#payBack").show();
//			}else{
				$("#toComplate").removeClass("btna_g").addClass("btna_o");
				if(response.data){
					$.alert("提示",response.data);
				}else{
					$.alert("提示","打开支付页面出错！");
				}
				
//			}
		}
		else{
			//解决收费按钮置灰
			$("#toComplate").removeClass("btna_g").addClass("btna_o");
			$.alertM(response.data);
		}
	};
	var _getOrders = function(payAmount){
		var orders= [];
		$("#calTab tbody tr").each(function() {
			var val = $(this).attr("id");
			if(val!=undefined&&val!=''){
				val=val.substr(5,val.length);
				var paymentTransId=$("#paymentTransId_"+val).val();
				if(ec.util.isObj(payAmount)&&payAmount>0&&ec.util.isObj(paymentTransId)){
					orders.push({
						oldbusiOrderId : paymentTransId, 
						amount : payAmount 
					});
				}
				
			}
		});
		 return orders;
	}
	return {
		queryOrderList:_queryOrderList,
		queryChargeItems:_queryChargeItems,
		conBtns:_conBtns,
		editMoney:_editMoney,
		setGlobeMoney:_setGlobeMoney,
		delItems:_delItems
	};
})();