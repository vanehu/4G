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
	var payMethod = '';//付费方式
	var reason = '';//修改原因
	var remark = '';//备注
	//弹出业务对象窗口
	var _addbusiOrder=function(proId,obj){
		if($("#div_payitem_"+proId)!=undefined&&$("#div_payitem_"+proId).html()!=undefined){
			var htmlStr=$("#div_payitem_"+proId).html();
			var dialogStr=$("#paydialog").html();
			var popup = $.popup("#div_payitem_choose_"+proId,htmlStr,{
				width:600,
				height:500,
				contentHeight:400,
				afterClose:function(){
					$("#paydialog").html(dialogStr);
				}
			});
			
			order.calcharge.trObj=obj;
		}else{
			$.alert("提示","没有可添加费用项的业务对象！");
		}
	};
	//查询可添加的费用项
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
		$.callServiceAsHtml(contextPath+"/pad/order/getChargeAddByObjId",param,{
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
				$("#div_payitem_choose_"+prodId).popup("close");
				_addItems(boId,response.data);
			},
			"fail":function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});	
	};
	//返回可添加的费用项
	var _addItems=function(boId,html){
		if(html!=''){
			$(order.calcharge.trObj).parent().parent().parent().after(html);
			var content$ = $("#order_confirm");
			$.jqmRefresh(content$);
			num--;
			_reflashTotal();
		}else{
			$.alert("提示","没有可添加的费用项");
			return;
		}
	};
	//删除费用项
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
			$(obj).parent().parent().parent().remove();
		}
		_reflashTotal();
	};
	//动态刷新页面信息
	var _reflashTotal=function(){
		_chargeItems=[];
		_prints=[];
		var realAmount=0;
		$("#calChangeTab tr").each(function() {
			var val = $(this).attr("id");
			if(val!=undefined&&val!=''){
				val=val.substr(5,val.length);
				if($("#paymentAmount_"+val) && $("#paymentAmount_"+val).val()*1==0){
					
				}else{
					var aa=($("#realhidden_"+val).val())*1;
//					if(OrderInfo.actionFlag==11||OrderInfo.actionFlag==19||OrderInfo.actionFlag==20){
//						aa=($("#backAmount_"+val).val())*1;
//					}
					realAmount=realAmount+aa;
//					_commitParam(val);
				}
			}
		});
//		if(OrderInfo.actionFlag==15){
//			var backAmount=0;
//			$("#calChangeTab tr").each(function() {
//				var val = $(this).attr("id");
//				if(val!=undefined&&val!=''){
//					if($("#paymentAmount_"+val) && $("#paymentAmount_"+val).val()*1==0){
//						
//					}else{
//						val=val.substr(5,val.length);
//						var aa=($("#backAmount_"+val).val())*1;
//						backAmount=backAmount+aa;
//					}
//				}
//			});
//			$('#backAmount').val(Number(backAmount).toFixed(2));
//		}
		$('#realMoney').html(Number(realAmount).toFixed(2));
//		if(OrderInfo.actionFlag==15){
//			order.refund.conBtns();
//		}else{
//			_conBtns();
//		}
	};
	//提交参数封装
	var _submitParam=function(){
		var remakrFlag = true ;
		var posLenFlag = true ;
		var posNvlFlag = true ;
		$("#calChangeTab tr").each(function() {
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
	//费用项封装
	var _buildChargeItems = function(){
		$("#calChangeTab tr").each(function() {
			var val = $(this).attr("id");
			if(val!=undefined&&val!=''){
				val=val.substr(5,val.length);
				var realmoney=($("#realhidden_"+val).val())*100+'';
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
				var payMethodCd=$(".shouyintai_payType").val();
				var objInstId=$("#objInstId_"+val).val();
				var prodId=$("#prodId_"+val).val();
				var boActionType=$("#boActionType_"+val).val();
				var paymentAmount = $("#paymentAmount_"+val).val();
				var chargeModifyReasonCd = 1 ;
				var remark="";
				//if($("#chargeModifyReasonCd_"+val).parent(".ui-select").parent().is(":hidden")){
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
				if(feeAmount!=realmoney&&remark==""){
					remark="其他";
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
	//调用接口，判断用户是否可以修改金额，并加载付费类型
	var _queryPayMethodByItem = function(itemTypeId,trid,defmethod){
		var params={"acctItemTypeId":itemTypeId};
		var url=contextPath+"/app/order/queryPayMethodByItem";
		
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
					var methodsInfo=items[0].payMethods;
					if(methodsInfo.length>0){
						if(trid){
							var html='<select  id="changeMethod_'+trid+'"  data-native-menu="false">';
							$.each(methodsInfo,function(i,method){
								if(method.payMethodCd==defmethod){
									html+='<option value="'+method.payMethodCd+'" selected="selected">'+method.payMethodName+'</option>';
								}else{
									html+='<option value="'+method.payMethodCd+'">'+method.payMethodName+'</option>';
								}
							});
							html+='</select>';
							$("#payMethodText_"+trid).html(html);
						//	$.jqmRefresh($("#payMethodText_"+trid));
						//	$("#changeMethod_"+trid).selectmenu("refresh");
							//$("#payMethodText_"+trid).html(html).trigger('create');  
						}
					}
					return flag ;
					
				}else{
					return false ;
				}
			}else{
				return false ;
			}
		}else if (response.code == -2) {
			$.alertM(response.data);
			return false ;
		}else{
			$.alert("提示","查询付费方式失败!");
			return false ;
		}
		
		
		
	};
	//修改原因选择
	var _bindChargeModifyReason = function(trid){
		if($("#chargeModifyReasonCd_"+trid).val()=="1"){
			$("#chargeModifyReasonCdDiv_"+trid).hide();
			$("#chargeModifyReasonCdDiv_"+trid).next(".edit").show();
		}
		$("#chargeModifyButton_"+trid).on("onclick",function(){
			$(this).parents().find(".edit").hide();
			$("#chargeModifyReasonCd_"+trid+" option").each(function() { 
				if($(this).val()=='3'){
					$(this).attr("selected", true);
				}
			});
			$("#chargeModifyReasonCd_"+trid).selectmenu("refresh");
			$("#chargeModifyReasonCdDiv_"+trid).show();
		});
	};
	//付费方式修改
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
						$("#changeMethod_"+trid).off("change").on("change",function(){
							var methodCd=$(this).val();
							$("#payMethodCd_"+trid).val(methodCd);
							$("#changeMethod_"+trid).selectmenu("refresh");
							if(methodCd == '110101'){ //pos
								$("#posDiv").css("display","inline");
								$("#posDiv").css("disabled","");
							}
							else{
								$("#posDiv").css("display","none");
								$("#posDiv").css("disabled","disabled");
							}
						});
					}
		}
		//$(obj).removeAttr("onclick").attr("disabled","disabled");
	};
	//查询修改费用项维度权限
	var _queryAuthenticDataRange = function(trid){
		var params={};
		var url=contextPath+"/app/order/queryAuthenticDataRange";
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
	//修改金额效果
	var _editMoney=function(obj,val,str){//obj:对象,val:id,str:类型
		var cash = ''; //实收费用
		if(typeof obj =="object"){
		    cash=$.trim($(obj).val());//当前费用
	    }
		else{
			cash = obj;
			if(cash=='') cash = "0";
			$("#realhidden_"+val).val(cash);
			$("#ssfy_"+val).html(cash);
		}
		
		if(cash==''){
			$(obj).val('0');
			order.calcharge.reflashTotal();
		}else{
			if(str=="old"){//修改费用
				var amount=$("#feeAmount_"+val).val();
				var check = true ;
				if(cash<0){
					$.alert("提示","实收费用金额不能小于0！");
					check = false ;
				}else if(!/^(-)?[0-9]+([.]\d{1,2})?$/.test(cash)){
			  		$.alert("提示","费用金额请输入数字，最高留两位小数！");
			  		check = false ;
				}else if((cash*100>amount*1)&&amount>0){
					$.alert("提示","实收费用金额不能高于应收金额！");
					check = false ;
				}else if((cash*100<amount*1)&&amount<0){
					$.alert("提示","实收费用金额不能低于应收金额！");
					check = false ;
				}
				if(check){
					var real=(cash)*100;
		  			if(real!=amount){
		  				$("#chargeModifyReasonCdDiv_"+val).show();
					}else{
						$("#chargeModifyReasonCdDiv_"+val).hide();
					//	$("#chargeModifyReasonCdDiv_"+val).next(".edit").hide();
					}
		  			if(typeof obj !="object"){
						$("#cal_main_content").show();
						$("#edit_content").hide();
					}
					_reflashTotal();
				}else{
					if(money!=''){
			  			//$(obj).val(money);
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
					if(real!=0){
						$("#chargeModifyReasonCdDiv_"+val).show();
					}else{
						$("#chargeModifyReasonCdDiv_"+val).hide();
						$("#chargeModifyReasonCdDiv_"+val).next(".edit").hide();
					}
					if(typeof obj !="object"){
						$("#cal_main_content").show();
						$("#edit_content").hide();
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
					if(typeof obj !="object"){
						$("#cal_main_content").show();
						$("#edit_content").hide();
					}
					_reflashTotal();
				}
			}
		}
		
		$("#realhidden_"+val).val(cash);
		payMethod = $("#changeMethod_"+val).val();  //付费方式
		//alert(payMethod);
		reason = $("#chargeModifyReasonCd_"+val).val();//修改原因
		remark = $("#remark_"+val).val();//备注
		
	};
	var _setGlobeMoney=function(obj){
		money=$.trim($(obj).val());
	};
	var _disableButton=function(){
		//$("#toCharge").attr("disabled","disabled");
		$("#toComplate").attr("disabled","disabled");
		$("#orderCancel").attr("disabled","disabled");
		$("#orderBack").attr("disabled","disabled");
		$("#orderCancel").off("onclick");
		$("#toComplate").off("onclick");
		$("#toCharge").off("onclick");
	};
	var _conBtns=function(){
		$("#orderCancel").removeAttr("disabled");
		$("#orderBack").removeAttr("disabled");
		var val=$.trim($('#realMoney').html())*1;
		if(OrderInfo.actionFlag==11){
			$("#orderCancel").off("onclick").on("onclick",function(event){
				order.undo.orderBack();
			});
		}else{
			$("#orderCancel").off("onclick").on("onclick",function(event){
				SoOrder.orderBack();
			});
		}
		//alert(val);
		if(!submit_success){
			if(val!=0){
				//alert("cc");
				$("#toCharge").removeAttr("disabled");
				//$("#toCharge").parent().removeClass("ui-state-disabled");
				$("#toComplate").attr("disabled","disabled");
				$("#toCharge").off("onclick").on("onclick",function(event){
					_updateChargeInfoForCheck('1');
				});
				$("#toComplate").off("onclick");
//				$("#toCharge").show();
//				$("#toCharge_2").hide();
				// 两个按钮切换会影响样式 故变更事件
				$("#toCharge").attr("onClick", "order.calcharge.updateChargeInfoForCheck('1')");
			}else{
				//alert("dd");
				//$("#toCharge").attr("disabled","disabled");
				//$("#toComplate").removeAttr("disabled");
				//\$("#toCharge").removeAttr("onclick");
//				$("#toCharge").attr("onclick",_chargeSave('0',false));
//				
//				
//				$("#toCharge").off("onclick").on("onclick",function(event){
//					_chargeSave('0',false);
//				});
//				$("#toCharge").hide();
//				$("#toCharge_2").show();
				// 两个按钮切换会影响样式 故变更事件
				$("#toCharge").attr("onClick", "order.calcharge.chargeSave('0',false)");
			}
		}else{
			$("#toCharge").removeAttr("disabled");
			$("#toComplate").attr("disabled","disabled");
			$("#toCharge").off("onclick");
			$("#toComplate").off("onclick");
		}
	};
	
	var _updateChargeInfoForCheck=function(flag){
		_disableButton();
		if(submit_success){
			$.alert("提示","订单已经建档成功,不能重复操作!");
			return;
		}
		if(inOpetate){
			return;
		}
		if(!_submitParam()){
			_conBtns();
			return ;
		}
		inOpetate=true;
		var url=contextPath+"/app/order/updateChargeInfoForCheck";
		var params={
				"olId":_olId,
				"soNbr":OrderInfo.order.soNbr,
				"areaId" : OrderInfo.staff.areaId,
				"chargeItems":_chargeItems,
				"custId":OrderInfo.cust.custId
		};
		$.callServiceAsJson(url,params, {
			"before":function(){
				$.ecOverlay("<strong>正在处理中,请稍等会儿....</strong>");
			},	
			"done" : function(response){
				$.unecOverlay();
				if (response.code == 0) {
					$("#calChargeBack").attr("onclick","javaScript:void(0);");
					_chargeSave(flag,true);
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
	
	var _tochargeSubmit=function(orderdata){	
		var url=contextPath+"/agent/order/checkRuleToProv";
		var params={
				"olId":orderdata.rolId,
				"soNbr":orderdata.rsoNbr,
				"areaId" : OrderInfo.staff.areaId,
				"chargeItems":[]
		};
		$.ecOverlay("<strong>正在下省校验,请稍等会儿....</strong>");
		var response = $.callServiceAsJson(url,params);
		$.unecOverlay();		
		var provCheckResult;				
		if (response.code == 0) {					
			var data = response.data;
			if(data.checkResult!=undefined){
				OrderInfo.checkresult=data.checkResult;		
			}
			provCheckResult = {							
					code : 0				
			};				
		}else{					
			provCheckResult = {							
					code : 1,							
					data : response.data
			};
		}
		return provCheckResult;
	};
	var _chargeSave = function(flag,isparam){
		order.phoneNumber.resetBoProdAn();//清楚预占号码缓存  IOS重新进入受理不会显示上次预占的号码
//		if(!isparam){
//			_disableButton();
//			if(submit_success){
//				$.alert("提示","订单已经建档成功,不能重复操作!");
//				return;
//			}
//			if(inOpetate){
//				return;
//			}
//			if(!_submitParam()){
//				_conBtns();
//				return ;
//			}
//			inOpetate=true;
//		}
		var realmoney = $("#realmoney").val();
		if(realmoney == "0.00"){
			if(!_submitParam()){
				return ;
			}
	    }
		var params={
				"olId":OrderInfo.orderResult.olId,
				"soNbr":OrderInfo.order.soNbr,
				"areaId" : OrderInfo.staff.areaId,
				"chargeItems":_chargeItems
		};
		var url=contextPath+"/app/order/chargeSubmit?token="+OrderInfo.order.token;
		var response=$.callServiceAsJson(url, params, {});
		var msg="";
		if (response.code == 0) {
			//受理成功  受理完成按钮亮色
			$("#slwc").css("color","#FC9C08");
			submit_success=true;
			//受理成功，不再取消订单
//			SoOrder.delOrderFin();
			
			if(OrderInfo.actionFlag==31){//改产品密码，则将session中密码重置，用户需要重新输入密码
				var url=contextPath+"/cust/passwordReset";
				var response2 = $.callServiceAsJson(url, null, {});
			}
			if(flag=='1'){
				if(OrderInfo.actionFlag==11){
					msg="退费成功";
				}else{
					msg="收费成功";
					$("#toCharge").attr("disabled","disabled");
					$("#orderStatus").val("1");
                    $(".item_fee").each(function(){
                    	$(this).attr("onclick","");
                    });
				}
			}else{
				msg="收费成功";
				$("#toCharge").attr("disabled","disabled");
				$("#orderStatus").val("1");
                $(".item_fee").each(function(){
                	$(this).attr("onclick","");
                });
			}	
			$("#orderCancel").removeAttr("disabled");
			$("#toComplate").removeAttr("disabled");
			$("#calchargeStatus").val("1");
			//移除费用新增、费用修改按钮
//			$(".ui-icon-plus").remove();
//			$(".ui-icon-gear").remove();
//			$(".ui-icon-delete").remove();
			$("#calChangeTab tr").each(function() {
				var trid = $(this).attr("id");
				if(trid!=undefined&&trid!=''){
					trid=trid.substr(5,trid.length);
					$("#backAmount_"+trid).attr("disabled","disabled");
					$("#upate").attr("disabled","disabled");
					
//					if(OrderInfo.actionFlag==11||OrderInfo.actionFlag==19||OrderInfo.actionFlag==20||OrderInfo.actionFlag==15){//撤单，返销，补退费
//						$("#backAmount_"+trid).attr("disabled","disabled");
//						$("#backAmount_"+trid).parent().addClass("ui-state-disabled");
//					}else{
//						$("#realAmount_"+trid).attr("disabled","disabled");
//						$("#realAmount_"+trid).parent().addClass("ui-state-disabled");
//					}
					
				}
			});
			if(OrderInfo.actionFlag==11){
				$("#orderCancel").html("<span>返回首页</span>");
				$("#orderCancel").off("onclick").on("onclick",function(event){
					order.undo.toUndoMain(1);
				});
			}else{
				$("#orderCancel").html("继续受理");
				$("#orderCancel").off("onclick").on("onclick",function(event){
					_backToEntr();
				});
			}
//			SoOrder.updateResState(); //修改UIM，号码状态
			//金额不为零，提示收费成功
			if(flag=='1'){
				var realmoney=($('#realMoney').html())*1;
				//realmoney=0;
				//费用大于0，才可以打印发票
//				if (realmoney > 0) {
//					//收费成功，先调初始化发票信息
//					var param={
//						"soNbr":OrderInfo.order.soNbr,
//						"billType" : 0,
//						"olId" : _olId,
//						"printFlag" : -1,
//						"areaId" : OrderInfo.staff.areaId,
//						"acctItemIds":[]
//					};
//					var initResult = common.print.initPrintInfo(param);
//					if(!initResult) {
//						return;
//					}
//					//然后提示是否打印发票
//					$.confirm("信息提示","收费成功，是否打印发票?",{
//						names:["是","否"],
//						yesdo:function(){
//							var param={
//								"soNbr":OrderInfo.order.soNbr,
//								"billType" : 0,
//								"olId" : _olId,
//								"printFlag" : 0,
//								"areaId" : OrderInfo.staff.areaId,
//								"acctItemIds":[]
//							};
//							common.print.prepareInvoiceInfo(param);
//							return;
//						},
//						no:function(){
//						}
//					});
//				} else {
//					//提示收费成功
					_showFinDialog(flag, msg);
//				}
			} else {
				//提示受理完成
				_showFinDialog(flag, msg);
			}
			return;
			
		}else if (response.code == -2) {
			_conBtns();
			SoOrder.getToken();
			inOpetate=false;
			$.alertM(response.data);
			//SoOrder.showAlertDialog(response.data);
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
		var title='';
		if(flag=='1'){
			if(OrderInfo.actionFlag==11){
				title='退费结果';
			}else{
				title='收费结果';
			}
		}else{
			title='受理结果';
		}
		$("#btn-dialog-ok").removeAttr("data-dismiss");
		$('#alert-modal').modal({backdrop: 'static', keyboard: false});
		$("#btn-dialog-ok").off("click").on("click",function(){
			_backToEntr();
		});
		$("#modal-title").html(title);
		$("#modal-content").html(msg);
		$("#alert-modal").modal();
//		$.alert(title,msg);
//		order.cust.mgr.custReset();
		//返回三个入口
//		if(OrderInfo.actionFlag==11){
//			$("#successTip_dialog_cnt").off("tap").on("tap",function(event){
//				$("#div_payresult_choose").popup("close");
//				order.undo.toUndoMain(1);
//			});
//		}else{
//			$("#successTip_dialog_cnt").off("tap").on("tap",function(event){
//				$("#div_payresult_choose").popup("close");
//				_backToEntr();
//			});
//		}
//		if(flag=='1'){
//			if(OrderInfo.actionFlag==11){
//				$("#successTip_dialog_inv").show();
//				$("#successTip_dialog_inv").off("tap").on("tap",function(event){_invaideInvoice();});
//			}	
//		}
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
		/*if (OrderInfo.actionFlag == 17 || OrderInfo.actionFlag == 18) {
			window.location.href = contextPath+"/mktRes/terminal/exchangePrepare";
			return;
		}else if(OrderInfo.actionFlag ==8){
			window.location.href = contextPath+"/cust/mvnoCustCreate";
			return;
		}*/
		/*$("#order_confirm,#order_fill,#order_bill,#order_prepare").empty();
		$("#ul_busi_area").show();
		order.cust.mgr.custReset();
		//如果是新建客户，则要重置客户信息
		if(OrderInfo.cust.custId == -1) {
			order.cust.mgr.custReset();
		}*/
//		window.location.reload();
//		common.callCloseWebview();
		common.relocationCust();
	};
	var _calchargeInit=function(){
		if(OrderInfo.actionFlag=="13"||OrderInfo.actionFlag=="14"){
			var tsn = $("#tsn").val();
			if(!tsn){
				$.alert("提示","终端串码为空,请先暂存订单！");
				return;
			}
		}
		if(OrderInfo.actionFlag=="1" && $(".tsn").length>0){
			var tsn = $(".tsn").val();
			if(!tsn){
				$.alert("提示","终端串码为空,请先暂存订单！");
				return;
			}
		}
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
			"checkResult":JSON.stringify(OrderInfo.checkresult)
		};
		$.callServiceAsHtmlGet(contextPath+"/agent/order/getChargeList",params,{
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
				var content$ = $("#order-confirm").html(response.data).fadeIn();
				var htmls=$("#paydialog").html();
				$("#paydialog").html('');
				$.refresh(content$);
				$("#paydialog").html(htmls);
				//$("#navbar").slideUp(500);
				$.each($(".cashier_dd"),function(){
					var prodId=$(this).attr("id");
					var obj=$(this);
					if($.trim($(this).html())==""&&$(".userorderlist")!=undefined){
						$.each($("#userorderlist li").find("dl:eq(0)"),function(){
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
						"chargeItems":_chargeItems,
						"areaId":OrderInfo.getAreaId(),
						"custName":OrderInfo.cust.partyName
					};
					common.print.signVoucher(voucherInfo);
				});
				//打印二维码
				$("#printEQCode").off("click").on("click", function(event){
					var calchargeStatus = $("#calchargeStatus").val();
					if(calchargeStatus=="0"){
						$.alert("提示","请先进行收费！");
						return;
					}
					var params = {
							"olId":_olId
					};
					
					SoOrder.getRQCode(params);
				});
				
				//_reflashTotal();
				if(OrderInfo.actionFlag==15){
					order.refund.conBtns();
				}else{
					_conBtns();
				}
			},
			"fail":function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	var _invaideInvoice = function(){
		var params = {"olId":OrderInfo.order.oldSoId,"soNbr":OrderInfo.order.oldSoNbr} ;
		$.callServiceAsHtmlGet(contextPath+"/app/order/invaideInvoice",params,{
			"before":function(){
				$.ecOverlay("<strong>正在处理中,请稍等会儿....</strong>");
			},
			"done" : function(response){
				$.unecOverlay();
				if(response.code==0){
					var data = $.parseJSON(response.data) ;
					if(data.code==0){
						$("#successTip_dialog_inv").off("onclick");
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
	var _showEditPage = function(accessNumber,trid,realAmount){	
		var params = {"trid":trid} ;
		var url = contextPath+"/agent/order/getEditPage";
		$.callServiceAsHtmlGet(url,params, {
			"before":function(){
				$.ecOverlay("<strong>正在加载中,请稍等...</strong>");
			},
			"done" : function(response){
				$.unecOverlay();
				$("#cal_main_content").hide();
				var content$ = $("#edit_content");
				content$.html(response.data).show();
				//$.refresh(content$);
				$("#cal_main_content").hide();
				$("#edit_content").show();
				$("#pnumber").text(accessNumber);
//				var html = "<select class='selectpicker show-tick form-control'>";
//				html =html+$(".shouyintai_payType").html();
//				html+"</select>";
//				$("#payMethodDiv").html(html);
				$("#editBtnDiv").html($("#editBtn_"+trid).html());
//				$("#realAmountDiv").html($("#realAmountText_"+trid).html());
				$("#realAmount_"+trid).val($("#realhidden_"+trid).val());
//				if(cash!=''){
//					$("#realAmount_"+trid).val(cash);
//				}
				if(payMethod != ''){
					$("#changeMethod_"+trid).val(payMethod);  //付费方式
				}
				if(reason !=''){
					$("#chargeModifyReasonCd_"+trid).val(reason);//修改原因
				}
				$("#remark_"+trid).val(remark);//备注
			},
			fail:function(response){
			     $.alert("提示","显示费用编辑页面失败，请稍后再试！");
			}
		});
		
	};
	var _confirm = function(trid){
		_editMoney($("#realAmount_"+trid).val(),trid,'old');
	};
	var _close = function(accessNumber,trid,realAmount){
		$("#cal_main_content").show();
		$("#edit_content").hide();
	};
	//终端销售 滚动页面入口
	var _feeScroll = function(scrollObj){
		if(scrollObj && scrollObj.page && scrollObj.page >= 1){
			_btnQueryfee(scrollObj.page,scrollObj.scroll);
		}
	};
	//查询
	var _btnQueryfee = function(pageIndex,scroller){
		OrderInfo.actionFlag=140;
		var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
		var param = {} ;
		param = {
					"startDate":($("#p_startDt").val()).replace(/-/g,''),
					"channelId":$("#p_channelId").val(),
					"areaId":$("#p_channelId").attr("areaid"),
					pageIndex:curPage,
					pageSize:10
		};
        $.callServiceAsHtmlGet(contextPath+"/app/report/freeInfoList",param,{
			"before":function(){
				$.ecOverlay("终端销售详情查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else{
					$("#fee_search").hide();
					$("#fee_list").html(response.data).show();
					OrderInfo.order.step=2;
					$("#fee_list_scroller").css("transform","translate(0px, -40px) translateZ(0px)");
					if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	//返回按钮调用
	var _back = function(){
		if(OrderInfo.order.step==1){
			common.callCloseWebview();
		}else if(OrderInfo.order.step==2){
			$("#fee_search").show();
			$("#fee_list").hide();
			OrderInfo.order.step=1;
		}else{
			common.callCloseWebview();
		}
	};
	//受理完成
	var _orderComplete = function(){
		var orderStaus = $("#orderStatus").val();
		if(orderStaus=="0"){
			$.alert("提示","请先收费！");
			return;
		}else{
			if(OrderInfo.actionFlag=="13"){
				$.confirm("确认","是否跳转至快销卡返档？",{
					yes:function(){
						var params={};
						params.method ="/agent/cust/custQuery/prepare";
						params.actionFlag = 9;
						OrderInfo.cust={
								"custId":"",
								"partyName":"",
								"vipLevelName":"",
								"custFlag":OrderInfo.cust.custFlag
						};
						common.callOrderServer(OrderInfo.staff, OrderInfo.cust, order.prodModify.choosedProdInfo, params);
					},
					no:function(){
						common.callCloseWebview();
					}
				},"question");
			}else{
				common.callCloseWebview();
			}
		}
		
	};
	//收费界面返回
	var _chargeBack = function(){
		var calchargeStatus = $("#calchargeStatus").val();
		if(calchargeStatus!="0"){
			return;
		}
		$.confirm("确认","您将要放弃订单？",{
			yes:function(){
				common.callReturnBack();
			},no:function(){
				
			}},"question");
	};
	return {
		addItems:_addItems,
		delItems:_delItems,
		reflashTotal:_reflashTotal,
		editMoney:_editMoney,
		setGlobeMoney:_setGlobeMoney,
		addbusiOrder:_addbusiOrder,
		addSubmit:_addSubmit,
		selePaymethod:_selePaymethod,
		calchargeInit:_calchargeInit,
		pageFlag:_pageFlag,
		changePayMethod:_changePayMethod,
		bindChargeModifyReason:_bindChargeModifyReason,
		invaideInvoice:_invaideInvoice,
		tochargeSubmit:_tochargeSubmit,
		chargeSave:_chargeSave,
		showEditPage : _showEditPage,
		confirm : _confirm,
		close : _close,
		updateChargeInfoForCheck : _updateChargeInfoForCheck,
		chargeSave : _chargeSave,
		feeScroll : _feeScroll,
		btnQueryfee :_btnQueryfee,
		back :_back,
		orderComplete:_orderComplete,
		chargeBack:_chargeBack
	};
})();
$(function() {
	OrderInfo.order.step=1;
});
