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
	var olpos = false;
	var _posPayMethodIofo = []; //记录使用 离线pos支付方式 的费用项trid
	var ranNum = 1;//随机数，用于积分扣减生成不同的订单号
	
	var chargeOlId;//算费时的OlId
	var payCode;  // 
	var refundType;
	var payMethodCd;
	var propertiesKey = "";
	var _payFlag = "";
	//查分省支付开关
	var _init = function(pageIndex){
		 propertiesKey = "NEWPAYFLAG_"+(OrderInfo.staff.soAreaId+"").substring(0,3);
		_payFlag= offerChange.queryPortalProperties(propertiesKey)=="ON"?true:false;//是否开启调用支付平台
	};
	
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
		var feeAmount=0;
		$("#calTab tbody tr").each(function() {
			var val = $(this).attr("id");
			if(val!=undefined&&val!=''){
				val=val.substr(5,val.length);
				feeAmount += parseFloat($(this).find("td:eq(2)").text());
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
			feeAmount=0;
			var backAmount=0;
			$("#calTab tbody tr").each(function() {
				var val = $(this).attr("id");
				if(val!=undefined&&val!=''){
					feeAmount += parseInt($(this).find("td:eq(2)").text());
					if($("#paymentAmount_"+val) && $("#paymentAmount_"+val).val()*1==0){
						
					}else{
						val=val.substr(5,val.length);
						var aa=($("#backAmount_"+val).val())*1;
						backAmount=backAmount+aa;
						realAmount = realAmount - aa;
					}
				}
			});
			$('#backAmount').val(Number(backAmount).toFixed(2));
		}
		//alert(JSON.stringify(_prints));
		$('#realmoney').val(Number(realAmount).toFixed(2));
		if(OrderInfo.actionFlag==19){//返销
			$('#feeAmount').val(Number(realAmount*-1).toFixed(2));
		}else{
			$('#feeAmount').val(Number(feeAmount).toFixed(2));
		}
		if(OrderInfo.actionFlag==15){
			order.refund.conBtns();
		}else{
			_conBtns();
		}
	};
	var _submitParam=function(){
		var remakrFlag = true ;
		var posLenFlag = true ;
		var posNvlFlag = true ;
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
				var payMethodCd=$("#payMethodCd_"+val).val();
				var terminalNumber=$("#terminalNumber").val();
				var serialNumber=$("#serialNumber").val();
				if(payMethodCd == '110101'){
					if(terminalNumber==undefined || $.trim(terminalNumber)==""){
						posNvlFlag = false;
					}
					if(serialNumber==undefined || $.trim(serialNumber)==""){
						posNvlFlag = false;
					}
					
					if(terminalNumber.length >100){
						posLenFlag = false;
					}
					if(serialNumber.length >100){
						posLenFlag = false;
					}
				}else if (payMethodCd == '110102'){
					olpos = true;
				}
			}
		});
		if(!remakrFlag){
			$.alert("提示信息","请填写修改原因");
			return false ;
		}
		if(!posNvlFlag){
			$.alert("提示信息","pos流水号或者终端号不能为空，请重新输入！");
			return false ;
		}
		if(!posLenFlag){
			$.alert("提示信息","pos流水号或者终端号长度超过100位，请重新输入！");
			return false ;
		}
		
		_chargeItems=[];
		_buildChargeItems();
		return true ;
	};
	var _buildChargeItems = function(){
		$("#calTab tbody tr").each(function() {
			var val = $(this).attr("id");
			if(val!=undefined&&val!=''){
				val=val.substr(5,val.length);
				var realmoney=Math.round(($("#realAmount_"+val).val())*100)+'';
				var amount=$("#feeAmount_"+val).val();
				var feeAmount="";
				if(amount!=undefined&&amount!=''){
					feeAmount=amount+'';
				}else{
					feeAmount=realmoney;
				}
				if(OrderInfo.actionFlag==11||OrderInfo.actionFlag==19||OrderInfo.actionFlag==20){
					feeAmount = $("#feeAmount_"+val).val()*1+'';
					realmoney = (0-parseInt(($("#backAmount_"+val).val())*100))+'';
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
				var terminalNumber = "";
				var serialNumber = "";
				if(payMethodCd == '110101'){
					 terminalNumber=$("#terminalNumber").val();
					 serialNumber=$("#serialNumber").val();
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
						"terminalNo":terminalNumber,
						"posSeriaNbr":serialNumber,
						"chargeModifyReasonCd":chargeModifyReasonCd,
						"remark":remark,
						"boActionType":boActionType
				};
				_chargeItems.push(param);
			}
		});
	};
	var _selectChangePayMethodCd = function (trid) {
		var methodCd = $("#changeMethod_" + trid).val();
		var methodName = $("#changeMethod_" + trid).find("option:selected").text();
		$("#payMethodCd_" + trid).val(methodCd);
		if (CONST.PAYMETHOD_CD.ZHANG_WU_DAI_SHOU == methodCd) {//账务代收设置金额为0.00
			if (!ec.util.isObj($("#realAmount_" + trid).attr("oldValue"))) {
				$("#realAmount_" + trid).attr("oldValue", $("#realAmount_" + trid).val());
				$("#feeAmount_" + trid).attr("oldValue", $("#feeAmount_" + trid).val());
			}
			//$("#item_" + trid).find("td:eq(2)").text("0.00");
			//$("#feeAmount_" + trid).val("0");
			$("#realAmount_" + trid).click();
			$("#realAmount_" + trid).val("0.00");
			$("#realAmount_" + trid).blur();
		} else {//不是账务代收还原金额设置
			var oldValueR = $("#realAmount_" + trid).attr("oldValue");
			var oldValueF = $("#feeAmount_" + trid).attr("oldValue");
			if (ec.util.isObj(oldValueR) && ec.util.isObj(oldValueF)) {
				$("#item_" + trid).find("td:eq(2)").text(oldValueR);
				$("#feeAmount_" + trid).val(oldValueF);
				$("#realAmount_" + trid).click();
				$("#realAmount_" + trid).val(oldValueR);
				$("#realAmount_" + trid).blur();
			}
		}
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
							if(defmethod=="110102"){//在线pos
								flag = false;
							}else{
								return true ;
							}
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
					//if(OrderInfo.actionFlag!=19&&OrderInfo.actionFlag!=20&&OrderInfo.actionFlag!=15){
						var methodsInfo=items[0].payMethods;
						if(methodsInfo.length>0){
							if(trid){
								var id="'"+trid+"'";
								var html='<select class=\'txt_cal_edit\' id="changeMethod_'+trid+'" style="border: 1px solid #DCDCDC;height: 23px;line-height: 23px;padding: 1px; width: 120px;" onchange="order.calcharge.selectChangePayMethodCd('+id+')">';
								$.each(methodsInfo,function(i,method){
									if(method.payMethodCd==defmethod){
										html+='<option value="'+method.payMethodCd+'" selected="selected">'+method.payMethodName+'</option>';
									}else if(OrderInfo.actionFlag==11 && defmethod=="110102"){
										if(method.payMethodCd=="100000"){
											html+='<option value="'+method.payMethodCd+'">'+method.payMethodName+'</option>';
										}
									}else{
										html+='<option value="'+method.payMethodCd+'">'+method.payMethodName+'</option>';
									}
								});
								
								
								if(_payFlag &&  ec.util.isObj($("#paymentTransId_"+trid).val()) ){
								    html='';
								    html='<select class=\'txt_cal_edit\' id="changeMethod_'+trid+'" style="border: 1px solid #DCDCDC;height: 23px;line-height: 23px;padding: 1px; width: 120px;" onchange="order.calcharge.selectChangePayMethodCd('+id+')">';
								    var payMethodCdStr = query.common.queryPropertiesObject("PAY_METHOD_CD");
								    for(var i in payMethodCdStr){
								    	if(payMethodCdStr[i].id == 100000){
									    		html+='<option value="'+ payMethodCdStr[i].id +'" selected="selected">'+payMethodCdStr[i].name+'</option>';
									    }else{
									    		html+='<option value="'+ payMethodCdStr[i].id+'">'+payMethodCdStr[i].name+'</option>';
									    }
							        }
                                }
								html+='</select>';
								$("#payMethodText_"+trid).html(html);
								
								_posPayMethodIofo.push({trid:trid,payMethod:methodsInfo[0].payMethodCd});
								//pos终端号等输入框在付费方式修改成离线pos时显示（有一项收费项使用离线pos就显示该输入框）
								$("#changeMethod_"+trid).off("change").on("change",function(){
									for(var i=0;i<_posPayMethodIofo.length;i++){
										if(_posPayMethodIofo[i].trid == trid){
											_posPayMethodIofo[i].payMethod = $(this).val();
											break;
										}
									}
									var _posPayMethodCount = 0;
									for(var i=0;i<_posPayMethodIofo.length;i++){
										if(_posPayMethodIofo[i].payMethod == '110101'){  //pos
											_posPayMethodCount ++;
										}
									}
									if(_posPayMethodCount > 0){ //至少有一个费用项选择使用离线pos支付方式
										$("#posDiv").css("display","inline");
										$("#posDiv").css("disabled","");
									} else{
										$("#posDiv").css("display","none");
										$("#posDiv").css("disabled","disabled");
									}
								});
							}
						}
					//}
					return flag ;
					
				}else{
					return false;
				}
			}else{
				return false;
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
			if(_queryAuthenticDataRange(trid)){
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
			
		}
		$(obj).removeAttr("onclick").removeClass("money_edit").addClass("money_edit_gray");
	};
	
	var _queryAuthenticDataRange = function(trid){
		var params={};
		var url=contextPath+"/order/queryAuthenticDataRange";
		var response = $.callServiceAsJson(url, params);
		if (response.code == 0) {
			var dataRanges = response.data;
			var flag = false;
			for(var i=0;i<dataRanges.length;i++){
				if($("#acctItemTypeId_"+trid).val()==dataRanges[i].dataDimensionName){
					flag = true;
					break;
				}else{
					flag = false;
				}
			}
			if(flag){
				return true;
			}else{
				$.alert("提示","当前费用项不允许修改!");
				return false;
			}
		}else if (response.code == -2) {
			$.alertM(response.data);
			return false ;
		}else{
			$.alert("提示","权限数据范围查询失败!");
			return false ;
		}
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
				}else if(cash<0){//
					$.alert("提示","实收费用金额不能为负值！");
				}else{
					_reflashTotal();
				}
			}
		}
	};
	var _setGlobeMoney=function(obj){
		money=$.trim($(obj).val());
	};
	/*var _disableButton=function(){
		$("#toCharge").removeClass("btna_o").addClass("btna_g");
		$("#toComplate").removeClass("btna_o").addClass("btna_g");
		$("#orderCancel").removeClass("btna_o").addClass("btna_g");
		$("#orderSave").removeClass("btna_o").addClass("btna_g");
		$("#orderCancel").off("click");
		$("#toComplate").off("click");
		$("#toCharge").off("click");
		$("#orderSave").off("click");
	};*/
	var _conBtns=function(){
		//ranNum = 1;//随机数重新赋值
		$("#orderCancel").removeClass("btna_g").addClass("btna_o");
		var val=($('#realmoney').val())*1;
		if(OrderInfo.actionFlag==11){
			$("#orderCancel").off("click").on("click",function(event){
				order.undo.orderBack();
			});
		} else if(OrderInfo.actionFlag==35){ //分段受理
			$("#orderCancel").off("click").on("click",function(event){
				stepOrder.main.orderCancel();
			});
		} else{
			$("#orderCancel").off("click").on("click",function(event){
				SoOrder.orderBack();
			});
		}
		
		if(!submit_success){
			if(val!=0){
				$("#toCharge").removeClass("btna_g").addClass("btna_o");
				$("#toComplate").removeClass("btna_o").addClass("btna_g");
				$("#toCharge").off("click").on("click",function(event){
					if(!_pos_paymethod()){
//						$.alert("提示","付费方式为在线POS，不允许撤单，请修改为现金方式！");
						return;
					}
					var realmoney = $("#realmoney").val();
					if(realmoney == "0.00"){
						_chargeSave('1');
						return;
					}
					_updateChargeInfoForCheck('1');
				});
				$("#toComplate").off("click");
			}else{
				$("#toCharge").removeClass("btna_o").addClass("btna_g");
				$("#toComplate").removeClass("btna_g").addClass("btna_o");
				$("#toCharge").off("click");
				$("#toComplate").off("click").on("click",function(event){
					if(!_pos_paymethod()){
						return;
					}
					_chargeSave('0');
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
	
	var _pos_paymethod = function(){
		var payflag = true;
		$("#calTab tbody tr").each(function() {
			var val = $(this).attr("id");
			if(val!=undefined&&val!=''){
				val=val.substr(5,val.length);
				var payMethodCd=$("#payMethodCd_"+val).val();
				if (payMethodCd == '110102'){
					if(OrderInfo.actionFlag=="11"){
						$.alert("提示","付费方式为在线POS，不允许撤单，请修改为现金方式！");
						payflag = false;
						return;
					}else{
						var posfee = $("#realAmount_"+val).val()*1;
						if(posfee<=0){
							$.alert("提示","在线POS的实收费用金额不能小于等于零，请修改！");
							payflag = false;
							return;
						}
					}
				}
			}
		});
		return payflag;
	};
	
	var _updateChargeInfoForCheck=function(flag){
		//_disableButton();
		if(submit_success){
			$.alert("提示","订单已经建档成功,不能重复操作!");
			return;
		}
		if(inOpetate){
			$.alert("提示","请务重复点击收费按钮!");
			return;
		}
		if(!_submitParam()){
			$.alert("提示","订单数据异常，请核对数据!");
			_conBtns();
			return ;
		}
		//解决收费按钮置灰
		$("#toCharge").removeClass("btna_o").addClass("btna_g");
		$("#toComplate").removeClass("btna_o").addClass("btna_g");
		$("#orderCancel").removeClass("btna_o").addClass("btna_g");
		$("#orderSave").removeClass("btna_o").addClass("btna_g");
		$("#orderCancel").off("click");
		$("#toComplate").off("click");
		$("#toCharge").off("click");
		$("#orderSave").off("click");
		$("#orderSave").removeAttr("onclick");
		
		inOpetate=true;
		var url=contextPath+"/order/updateChargeInfoForCheck";
		var params={
				"olId":_olId,
				"soNbr":OrderInfo.order.soNbr,
				"areaId" : OrderInfo.staff.areaId,
				"chargeItems":_chargeItems,
				"custId":OrderInfo.cust.custId
		};
//		alert("?result="+JSON.stringify(_chargeItems)+"&olId="+_olId+"&soNbr="+OrderInfo.order.soNbr);
		$.callServiceAsJson(url,params, {
			"before":function(){
				$.ecOverlay("<strong>正在处理中,请稍等会儿....</strong>");
			},"always":function(){
				$.unecOverlay();
			},	
			"done" : function(response){
				if (response.code == 0) {
					if(olpos && queryConstConfig(null,2)){
						if(response.data==undefined || response.data=="undefined"){
							$.alert("提示","在线POS地址未配置！");
							return;
						}
						_toolpos();
						var src=response.data+"?result="+JSON.stringify(_chargeItems)+"&olId="+_olId+"&soNbr="+OrderInfo.order.soNbr;
						var vra=document.createElement('a');
				        vra.target='_blank';
				        vra.href=src;
				        document.body.appendChild(vra);
				        vra.click();
					}else{
						
						var payMethodCdStr = offerChange.queryPortalProperties("PAY_METHOD_CD");
						if (_payFlag && OrderInfo.actionFlag!=11 && OrderInfo.actionFlag!=19 && OrderInfo.actionFlag!=20) { // 补费
//						    var payMethodCd = _getPayMethodCd(payMethodCdStr);
//						    if(payMethodCdStr){
//						    	 for(var i=0;i<payMethodCdStr.split(",").length;i++){
//						    		 if(payMethodCd== payMethodCdStr.split(",")[i]){
							          if(_isNewPayMethodCd(payMethodCdStr)){
							        	  return _getPayToken();
							          }
						    			
//						    			 return;
//						    		 }
//							    }
						    }
							          
						_chargeSave(flag);
					}
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
						$.alert("提示","代理商保证金校验失败!");
					}
				}
			}
		});
	};
	
	var _toolpos = function(){
		submit_success=true;
		//受理成功，不再取消订单
		SoOrder.delOrderFin();
		if(OrderInfo.actionFlag==31){//改产品密码，则将session中密码重置，用户需要重新输入密码
			var url=contextPath+"/cust/passwordReset";
			var response2 = $.callServiceAsJson(url, null, {});
		}
		$("#orderCancel").removeClass("btna_g").addClass("btna_o");
		$("#printVoucherA").removeClass("btna_o").addClass("btna_g").off("click");
		if($("#printVoucherLoc").length > 0){
			$("#printVoucherLoc").removeClass("btna_o").addClass("btna_g").off("click");
		}
		//移除费用新增、费用修改按钮
		$(".charge_add").remove();
		//禁用费用项修改框
		$(".cash_inp_dis").attr("disabled","disabled");
		if(OrderInfo.actionFlag==11){
			$("#orderCancel").html("<span>返回首页</span>");
			$("#orderCancel").off("click").on("click",function(event){
				order.undo.toUndoMain(1);
			});
		}else if(OrderInfo.actionFlag==35){ //分段受理
			$("#orderCancel span").html("继续受理");
			$("#orderCancel").off("click").on("click",function(event){
				stepOrder.main.orderBack();
			}).show();
		}else{
			//将订单取消改为继续受理
			$("#orderCancel span").html("继续受理");
			$("#orderCancel").off("click").on("click",function(event){_backToEntr();});
		}
		SoOrder.updateResState(); //修改UIM，号码状态
//		var src=response.data+"?result="+_chargeItems+"&olId="+_olId+"&soNbr="+OrderInfo.order.soNbr;
		
	}
	
	var _tochargeSubmit=function(orderdata){	
//		if(submit_success){
//			$.alert("提示","订单已经激活,不能重复操作!");
//			return;
//		}
//		if(!_submitParam()){
//			return ;
//		}
		var url=contextPath+"/order/checkRuleToProv";
		var params={
				"olId":orderdata.rolId,
				"soNbr":orderdata.rsoNbr,
				"areaId" : OrderInfo.staff.areaId,
				"chargeItems":[]
		};
		$.ecOverlay("<strong>正在下省校验,请稍等会儿....</strong>");
		var response = $.callServiceAsJson(url,params);
		$.unecOverlay();
//			"before":function(){
//				$.ecOverlay("<strong>正在处理中,请稍等会儿....</strong>");
//			},"always":function(){
//				$.unecOverlay();
//			},	
//			"done" : function(response){		
		var provCheckResult;				
		if (response.code == 0) {					
			var data = response.data;
			if(data.checkResult!=undefined){
				OrderInfo.checkresult=data.checkResult;		
			}
			provCheckResult = {
					code : 0,
					data : response.data
			};
		}else{
			provCheckResult = {
					code : 1,
					data : response.data
			};
		}
		return provCheckResult;
//			}
//		});	
	};
	var _chargeSave = function(flag){
		var realmoney = $("#realmoney").val();
		if(realmoney == "0.00"){
			if(!_submitParam()){
				return ;
			}
	    }
		var params={
				"olId":_olId,	
				"soNbr":OrderInfo.order.soNbr,
				"areaId" : OrderInfo.staff.areaId,
				"chargeItems":_chargeItems,
				"custOrderAttrs" : []
		};
		if(OrderInfo.actionFlag==35){
			params.custOrderAttrs.push({
				itemSpecId : CONST.BUSI_ORDER_ATTR.STEP_ORDER_CHARGE_STAFF,  //订单属性--分段受理保存收费员工时增加
				value : OrderInfo.staff.staffCode 
			});
		}
		var url=contextPath+"/order/chargeSubmit?token="+OrderInfo.order.token;
		var response=$.callServiceAsJson(url, params, {});
		
		var msg="";
		if (response.code == 0) {
			//取消已定购业务点击事件，防止收费建档后再次办理业务，实例缓存不正确
			$("#orderbutton").removeAttr("onclick");
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
			$("#orderCancel").removeClass("btna_g").addClass("btna_o");
			$("#printVoucherA").removeClass("btna_o").addClass("btna_g").off("click");
			if($("#printVoucherLoc").length > 0){
				$("#printVoucherLoc").removeClass("btna_o").addClass("btna_g").off("click");
			}
			//移除费用新增、费用修改按钮
			$(".charge_add").remove();
			//禁用费用项修改框
			$(".cash_inp_dis").attr("disabled","disabled");
			if(OrderInfo.actionFlag==11){
				$("#orderCancel").html("<span>返回首页</span>");
				$("#orderCancel").off("click").on("click",function(event){
					order.undo.toUndoMain(1);
				});
			}else if(OrderInfo.actionFlag==35){ //分段受理
				$("#orderCancel span").html("继续受理");
				$("#orderCancel").off("click").on("click",function(event){
					stepOrder.main.orderBack();
				}).show();
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
			
			var isSuccess = true;
			if(_payFlag && (OrderInfo.actionFlag == 11 || OrderInfo.actionFlag == 19 || OrderInfo.actionFlag == 20)){ //退费
				isSuccess = order.refund.payRefund(OrderInfo.orderResult.olId,$('#realmoney').val()*100,"1100");
			}
			
			//金额不为零，提示收费成功
			if(flag=='1'&& OrderInfo.actionFlag!=37 && isSuccess){
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
							var params={
									"olId":_olId,	
									"areaId" : OrderInfo.staff.areaId
							};
							var url=contextPath+"/order/queryOrdStatus";
							var response=$.callServiceAsJson(url, params, {});
							if(response && response.data && response.data.statusCd != "201300"
								&& response.data.statusCd !="301200"){
								$.alert("提示","订单未下省成功，请到发票补打菜单中进行打印！");
								return;
							}
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
			alertMM(response.data);
			
		}else if (response.code == 1) {
			_conBtns();
			SoOrder.getToken();
			inOpetate=false;
			if(response.data!=undefined){
				var content = response.data;
				$.confirm("信息提示",content,{
					names:["是","否"],
					yesdo:function(){
						//作废订单
						var param={
								olId:_olId,
								areaId : OrderInfo.getAreaId()
						};
						var result = $.callServiceAsJsonGet(contextPath+"/order/delOrder",param);
						_backToEntr();
					},
					no:function(){
					}
				});
			}else{
				$.alert("提示","费用信息提交失败!");
			}
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
			lock : 'false',
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
		}else if(OrderInfo.actionFlag ==37){
			window.location.href = contextPath+"/order/reserveTerminal";
			return;
		}else if(OrderInfo.actionFlag ==38){
			window.location.href = contextPath+"/order/queryOrderZdyy";
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
		if(OrderInfo.zcd_privilege==0&&OrderInfo.actionFlag!=14&&OrderInfo.actionFlag!=11&&OrderInfo.actionFlag!=13&&OrderInfo.actionFlag!=17&&OrderInfo.actionFlag!=18&&OrderInfo.actionFlag!=35&&OrderInfo.actionFlag!=37&&OrderInfo.actionFlag!=38){
			SoOrder.delOrderFin();
			_showFinDialog("0", "暂存成功！");
			return;
		}
		if(OrderInfo.actionFlag==40){
			//手机紧急开机积分扣减
			var param={
			    "olId":OrderInfo.orderResult.olId,
			    "olNbr":OrderInfo.orderResult.olNbr
		    };
			var url = contextPath+"/order/reduceIntegral";
			var response = $.callServiceAsJson(url,param);
			$.unecOverlay();
			if(response.code == 0){
				
			}else if(response.code == 1002){
				$.alert("提示",response.data);
				return;
			}else{
				$.alertM(response.data);
				return;
			}
		}
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
			'custVipLevel':OrderInfo.cust.vipLevel,
			"actionFlag":OrderInfo.actionFlag,
			"actionTypeName" : encodeURI(OrderInfo.actionTypeName),
			"businessName" : encodeURI(OrderInfo.businessName),
			"olNbr":OrderInfo.orderResult.olNbr,
			"soNbr" : OrderInfo.order.soNbr,
			"refundType":refundType,
			"checkResult":JSON.stringify(OrderInfo.checkresult),
			"busitypeFlag": OrderInfo.busitypeflag
		};
		$.callServiceAsHtmlGet(contextPath+"/order/getChargeList?token="+OrderInfo.order.token,params,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				SoOrder.getToken();
				if(response.code != 0) {
					$.alert("提示","收费页面加载失败，请稍后重试");
					return;
				}
				var content$=$("#order_confirm");
				content$.html(response.data).show();
				
				//分段受理,如果受理工号和收费工号不是同一个,不展示"订单取消"按钮
				if(OrderInfo.actionFlag==35){
					if($("#orderCancel").attr("stepOrderParam") != 1){
						stepOrder.main.delOrderOperate = false;
						$("#orderCancel").hide();
					} else {
						stepOrder.main.delOrderOperate = true;
					}
				}
				if((OrderInfo.actionFlag==1 || OrderInfo.actionFlag==2 || OrderInfo.actionFlag==3 || OrderInfo.actionFlag==6 || OrderInfo.actionFlag==21)&&OrderInfo.saveOrder.olId==""){
					$("#orderSave").show();
				}
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
					var voucherInfo = {};
					if(OrderInfo.actionFlag==23){//针对异地补换卡，地区要和购物车areaId一致
						voucherInfo = {
								"olId":_olId,
								"soNbr":OrderInfo.order.soNbr,
								"busiType":"1",
								"chargeItems":_chargeItems
							};
					}else{
						voucherInfo = {
								"olId":_olId,
								"soNbr":OrderInfo.order.soNbr,
								"busiType":"1",
								"chargeItems":_chargeItems,
								"areaId":OrderInfo.getAreaId()
							};
					}
					if(_getCookie('_session_pad_flag')=='1'){
						common.print.signVoucher(voucherInfo);
					}else{
						if(queryConstConfig(voucherInfo,1)){
							common.print.printVoucher(voucherInfo);
						}else{
							return;
						}
					}
					_changeFeeDisabled($("#calTab"));
				});
				 //本地打印回执,只有配置无纸化省份才会提供
				$("#printVoucherLoc").off("click").on("click", function(event){
					if(!_submitParam()){
						return ;
					}
					var voucherInfo = {};
					if(OrderInfo.actionFlag==23){//针对异地补换卡，地区要和购物车areaId一致
						voucherInfo = {
								"olId":_olId,
								"soNbr":OrderInfo.order.soNbr,
								"busiType":"1",
								"chargeItems":_chargeItems
							};
					}else{
						voucherInfo = {
								"olId":_olId,
								"soNbr":OrderInfo.order.soNbr,
								"busiType":"1",
								"chargeItems":_chargeItems,
								"areaId":OrderInfo.getAreaId()
							};
					}
					 common.print.printVoucher(voucherInfo);
					_changeFeeDisabled($("#calTab"));
				});
				//if(OrderInfo.actionFlag==37 || OrderInfo.actionFlag==38){ //终端预约暂时未提供模板，不打印回执
				//	$("#printVoucherA").removeClass("btna_o").addClass("btna_g").off("click");
				//	if($("#printVoucherLoc").length > 0){
				//		$("#printVoucherLoc").removeClass("btna_o").addClass("btna_g").off("click");
				//	}
				//}
				_reflashTotal();
			},
			"fail":function(response){
				SoOrder.getToken();
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
	
	var queryConstConfig=function(voucherInfo,typeClass){
		var isProPrint=false;
		var param={
			typeClass:typeClass,
			queryType:1
		};
		var url=contextPath+"/print/queryConstConfig";
		$.ecOverlay("<strong>正在查询公共数据查询的服务中,请稍后....</strong>");
		var response = $.callServiceAsJsonGet(url,param);	
		$.unecOverlay();
		if (response.code==0) {
			if(response.data!=undefined){
				if("Y"==response.data.value){
					isProPrint=true;
				}
			}
		}else if (response.code==-2){
			$.alertM(response.data);
			return false;
		}else {
			$.alert("提示","查询公共数据查询的服务失败,稍后重试");
			return false;
		}
		if(isProPrint && voucherInfo!=null){//是否使用省里面打印
			voucherInfo.signFlag=3;
		}
		return true;
	};

	//打印后禁用修改费用
	var _changeFeeDisabled=function(table){
		table.children("tbody").children("tr").each(function () {
			//产品-新增费用
			var addbusiOrder=$(this).children("td:eq(0)").children("a");
			if(ec.util.isObj(addbusiOrder)&&addbusiOrder.length>0){
				addbusiOrder.remove();
			}
			//费用名称
			var acctItemTypeId=$(this).children("td:eq(1)").children("select");
			if(ec.util.isObj(acctItemTypeId)&&acctItemTypeId.length>0){
				acctItemTypeId.attr("disabled","disabled");
			}
			//实收费用
			var realAmount=$(this).children("td:eq(3)").children("input");
			if(ec.util.isObj(realAmount)&&realAmount.length>0){
				realAmount.attr("disabled","disabled");
			}
			//付费方式
			var payMethodText1=$(this).children("td:eq(4)").children("span").children("a");
			if(ec.util.isObj(payMethodText1)&&payMethodText1.length>0){
				payMethodText1.removeAttr("onclick");
			}
			var payMethodText2=$(this).children("td:eq(4)").children("span").children("select");
			if(ec.util.isObj(payMethodText2)&&payMethodText2.length>0){
				payMethodText2.attr("disabled","disabled");
			}
			var payMethodText3=$(this).children("td:eq(4)").children("select");
			if(ec.util.isObj(payMethodText3)&&payMethodText3.length>0){
				payMethodText3.attr("disabled","disabled");
			}
			//修改原因
			var chargeModifyReasonCd=$(this).children("td:eq(5)").children("select");
			if(ec.util.isObj(chargeModifyReasonCd)&&chargeModifyReasonCd.length>0){
				chargeModifyReasonCd.attr("disabled","disabled");
			}
			//操作
			var charge=$(this).children("td:eq(6)").children("a");
			//星级服务
			var poingtSer = $(this).children("td:eq(6)").find("[name='point']");
			if(ec.util.isObj(charge)&&charge.length>0){
				charge.remove();
			}
			
			if(ec.util.isObj(poingtSer)&&poingtSer.length>0){
				poingtSer.remove();
			}
		});
	};
	
	
	var _changePoingts = function(itemTypeId,trid,acctItemId,serviceCodeB,acctItemName,obj){
		var state = "";
		var acount = 0;
		if($(obj).is(":checked")){
			state = "DEL";	
			acount = 1;
			ranNum++;
		}else{
			acount = -1;
			state = "ADD";
		}
		var params={
				"olId":_olId,
				'acctItemId':acctItemId,
				"orderNbr":  ranNum + OrderInfo.order.soNbr.substring(OrderInfo.order.soNbr.length-10,OrderInfo.order.soNbr.length),
				"amount" : "0",
				"totalScore" : "0",
                "state": state,
				"pointInfos": [
				               {
				                   "recordType": "1",
				                   "serviceNo": "1",
				                   "serviceCodeA": "21",
				                   "serviceCodeB": serviceCodeB,
				                   "serviceName": acctItemName,
				                   "amount": acount,
				                   "price": "0",
				                   "serviceScore": "0"
				               }
				              ]
		};
		var url = contextPath+"/order/reducePoingts";
		var response = $.callServiceAsJson(url,params);
		if(response.code==0){
			if(state == "DEL"){
				$("#realAmount_"+trid).click();
				$("#realAmount_"+trid).val("0.00");
				$("#realAmount_"+trid).blur();
				$("#chargeModifyReasonCd_"+trid).val("5");
			}else if(state == "ADD"){
				$("#realAmount_"+trid).click();
				$("#realAmount_"+trid).val($("#realhidden_"+trid).val());
				$("#realAmount_"+trid).blur();
			}
		}else if (response.code==-2){
			if("ADD"==state){
				$(obj).attr("checked",'true');
			}else{
				$(obj).removeAttr("checked");
			}
			if (response.data.errMsg) {
				$.alertM(response.data.errMsg);
			}else{
				$.alert("提示","积分扣减异常");
			}
			$.alert("提示","尊敬的用户，积分操作结果不影响订单处理，请知晓！");
		}else if (response.code==1002){
			if("ADD"==state){
				$(obj).attr("checked",'true');
			}else{
				$(obj).removeAttr("checked");
			}
			$.alert("提示",response.data);
			$.alert("提示","尊敬的用户，积分操作结果不影响订单处理，请知晓！");
		}else {
			if("ADD"==state){
				$(obj).attr("checked",'true');
			}else{
				$(obj).removeAttr("checked");
			}
			$.alert("提示","积分扣减的服务失败,稍后重试");
			$.alert("提示","尊敬的用户，积分操作结果不影响订单处理，请知晓！");
		}
	};

	var alertMM = function(err){//此方法仅针对收费出错的弹出框。
		var rand = ec.util.getNRandomCode(5);
		var opId = "alertMoreOp" + rand;
		var contId = "alertMoreContent" + rand;
		var c  = '<div>';
			c += '<div class="am_baseMsg">错误编码【'+ec.util.defaultStr(err.errCode, "未知") + '】' + ec.util.defaultStr(err.errMsg, "未知")+'</div>';
		    c += '<div class="am_more"><a id="'+ opId +'" href="javascript:void(0);" onclick="">&nbsp;【更多】&nbsp;</a></div>';
		    c += '<div id="'+ contId +'" class="am_moreMsg"><font>【详细信息】</font><br/>';
		    c += '<font>异常信息：</font><br/><span>'+ec.util.encodeHtml(ec.util.defaultStr(err.errData, "未知"))+'</span><br/>';
		    c += '<font>入参：</font><br/><span>'+ec.util.encodeHtml(ec.util.defaultStr(err.paramMap, "未知"))+'</span><br/>';
		    if (err.resultMap) {
		    	c += '<font>回参：</font><br/><span>'+ec.util.defaultStr(err.resultMap, "未知")+'</span><br/>';
		    }
		    c += '</div></div>';
		
		new $.Zebra_Dialog(c, {
			'keyboard'	:true,
        	'modal'		:true,
        	'animation_speed':500,
        	'overlay_close':false,
        	'overlay_opacity':.5,
            'type'		: "error",
            'title'		: "异常信息",
            'position' 	: ['left + 380', 'top + 100'],
            'width'		: 430,
            'buttons'	: ['确定']
		});
		
		$("#"+contId).slideDown("normal");
		
		
//		$("#alertMoreOp").off("click").on("click",function(){$("#alertMoreContent").slideDown("slow");});
		$("#"+opId).off("click").toggle(
			function(){
				$("#"+contId).slideDown("normal");
			},
			function(){
				$("#"+contId).slideUp("fast");
			}
		);
	};

	/**
	 * 获取支付平台支付页面
	 */
	var _getPayToken = function(){
		var charge= $("#realmoney").val();//支付金额
		//_chargeItems=[];
		//_buildChargeItems();
		
//		_setOlId(OrderInfo.orderResult.olId);
		if(_chargeItems.length==0){//费用项为空，则只设soNbr
			var item={
					"soNbr":OrderInfo.order.soNbr	
			};
			_chargeItems.push(item);   
		}
        var params={
				"olId":OrderInfo.orderResult.olId,
				"soNbr":OrderInfo.orderResult.olNbr,
				"charge":charge*100,
				"busiUpType":  OrderInfo.actionFlag, //OrderInfo.busitypeflag,
				"chargeItems":_chargeItems,
			//	"strParam":JSON.stringify(resources),
				"actionTypeName":OrderInfo.actionTypeName,
				"chargeCheck":"0"
		};
//		var params={
//				"olId":"111",
//				"soNbr":"222",
//				"charge":"500",
//		        "busiUpType":"1",
//		        "chargeItems":_chargeItems,
//				"chargeCheck":"0"
//		};
//		if(chargeOlId!=OrderInfo.orderResult.olId){//调取算费接口的olId与跳转支付平台的OlId比较，不一样直接拦截
//			$.alert("提示","算费时的olId:["+chargeOlId+"]与跳转支付界面的olId["+OrderInfo.orderResult.olId+"]不一致，请退出重新受理!");
//			return;
//		}
		var url = contextPath+"/pay/getPayUrl";
		var response = $.callServiceAsJson(url, params);
		if(response.code==0){
			payUrl=response.data;
			//var payUrl2="http://192.168.4.137:7001/pay_web/platpay/index?payToken="+payUrl.split("=")[1];
   		  // payUrl2="https://crm.189.cn:86/upay/platpay/index?payToken=5D0CB495B3DD59CAEC106F93EEBD13952F62C58C4A13445FB8AC378A32038E99";
			//window.location.href="https://crm.189.cn:86/upay/platpay/index?payToken=5D0CB495B3DD59CAEC106F93EEBD13952F62C58C4A13445FB8AC378A32038E99" 
				//timeId=setInterval(order.calcharge.timeToFee,3000);//定时查询支付状态，若成功则下计费接口，已下过则不再下。
			//"http://42.99.16.141:7001/upay/platpay/index?payToken=824C9C39C49BFFA4636B6D5F29631953A3786E22FCA435004B3418049F7C1F65"
			// min-height: 551px;
			
			$("#calTab").hide();
			$("#pay").empty();
			$("#pay").append("<iframe id ='payIframe'  src='"+ payUrl +"'> </iframe>"); //style='height: 330px;'
			$("#pay").show();
			
			$("#payBack").show();
			$("#toCharge").hide();
			$("#toComplate").hide();
			$("#yiPayBoundCard").hide();
			$("#orderSave").hide();  
			$("#orderCancel").show();
			$("#orderCancel").removeClass("btna_g").addClass("btna_o");
			$("#orderCancel").off("click").on("click",function(event){
//				var obj = _getPayCallBack();
//				if(obj && obj.respCode &&  obj.respCode == "POR-0000" ){
//					$.alert("提示","支付已成功，不能取消订单!");//支付已成功，请单击【受理完成】按钮，进行操作！
//					return;
//				}
//				var array = _getPayCallBack();
//				if(payFlag && array && array[2] == 1){
//					return _backToEntr();
//				}
			//	if($("#calTab").is(":visible")){
			//		  return order.calcharge.backToCharge();
			//	}else{
					SoOrder.orderBack();
			//	}
			});
			
			
		}else if(response.code==1002){
			//解决收费按钮置灰
			$("#toCharge").removeClass("btna_g").addClass("btna_o");
			$.alert("提示",response.data);
		}
		else{
			//解决收费按钮置灰
			$("#toCharge").removeClass("btna_g").addClass("btna_o");
			$.alertM(response.data);
		}
	};
    //返回收银台
	var _backToCharge = function(){
		    var obj = _getPayCallBack();
			if(obj && obj.respCode &&  obj.respCode == "POR-0000" ){
				$.alert("提示","支付已成功，不能返回!");
				return;
			}
			//$.confirm("信息确认", "返回收银台页面?",{ 
		    //	yes:function(){
					$("#pay").hide();
					$("#calTab").show();
					$("#payBack").hide();
					
					$("#toComplate").show();
					$("#orderCancel").show(); 
					
					
					if(OrderInfo.actionFlag==15){
						$("#orderCancel").off("click").on("click",function(event){
							$("#d_refund_order").show();
							$("#order_charge").hide();
						});
					}else{
						$("#toCharge").show();
						$("#orderSave").show();
						$("#orderSave").removeClass("btna_g").addClass("btna_o");
						$("#yiPayBoundCard").show();
						$("#orderCancel").removeClass("btna_g").addClass("btna_o");
						$("#orderCancel").off("click").on("click",function(event){
	//						var obj = _getPayCallBack();
	//						if(obj && obj.respCode &&  obj.respCode == "POR-0000" ){
	//							$.alert("提示","支付已成功，不能取消订单!");//支付已成功，请单击【受理完成】按钮，进行操作！
	//							return;
	//						}
	//						var array = _getPayCallBack();
	//						if(payFlag && array && array[2] == 1){
	//							return _backToEntr();
	//						}
						//	if($("#calTab").is(":visible")){
						//		  return order.calcharge.backToCharge();
						//	}else{
								SoOrder.orderBack();
						//	}
						
				//	},
				//	no:function(){
						
				//	}
				        });
					}
	};
	var _getPayCallBack = function(){
	    var param = {
				"olId" : OrderInfo.orderResult.olId
		};
	    var url = contextPath + "/pay/queryOrdStatusFromRedis";
	    var response = $.callServiceAsJson(url, param);
	    if(response.code==0 && response.data){
			return response.data;
		}else if (response.code == -2) {
			//$.alertM(response.data);
			return false ;
		}else{
			//$.alert("提示","查询支付结果失败!");
			return false ;
		}
	}
	// 是否是 微信、支付宝。现金。翼支付  支付方式  
	var _isNewPayMethodCd = function(payMethodCdStr){
		var i = 0;
		var len = 0;
		$("#calTab tbody tr").each(function() {
			var val = $(this).attr("id");
			if(val!=undefined&&val!=''){
				val=val.substr(5,val.length);
				 if($("#payMethodCd_" + val).val()== payMethodCdStr.split(",")[1] ||
						$("#payMethodCd_" + val).val()== payMethodCdStr.split(",")[2] || $("#payMethodCd_" + val).val()== payMethodCdStr.split(",")[3]){
//					if(payMethodCd == payMethodCdStr.split(",")[1] ||
//							payMethodCd == payMethodCdStr.split(",")[2] ||
//							  payMethodCd == payMethodCdStr.split(",")[3]){
			              return true;
			      } 
		          if($("#payMethodCd_" + val).val()== payMethodCdStr.split(",")[0]){
					  i++;
				  }
		          len++; 
		    }
			
			 
		});
        if(len == i && i !=0 ){
	        return true;
        }
		return false;
	}
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
		invaideInvoice:_invaideInvoice,
		updateChargeInfoForCheck:_updateChargeInfoForCheck,
		tochargeSubmit:_tochargeSubmit,
		backToEntr:_backToEntr,
		changeFeeDisabled:_changeFeeDisabled,
		changePoingts:_changePoingts,
		isNewPayMethodCd : _isNewPayMethodCd,
		init : _init
	};
})();

