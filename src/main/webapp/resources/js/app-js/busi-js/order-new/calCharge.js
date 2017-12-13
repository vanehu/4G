/**
 * 订单算费
 * 
 * @author yanghaiming
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
	var _myFlag=false;//是否开启调用支付平台
	var _busiUpType;//业务类型，1表示手机业务2表示宽带甩单4表示话费充值
	var payType="100000";//默认现金，用于调用代理保证金接口校验
	var _returnFlag=true;//支付平台返回成功后，返回按钮提示不让进行
	var _haveCharge=false;//是否已经下过计费接口
	var failCount=0;//查询支付失败次数，超过三次不再查询
	var chargeCheck="0";//代理保证金校验编码   0成功   1校验不通过 -2接口异常
	var chargeOlId;//算费时的OlId
	var payOlId;//支付时OlId
	
	//显示收银台界面
	var _calchargeInit=function(){
		_olId = OrderInfo.orderResult.olId;
		_soNbr = OrderInfo.orderResult.soNbr;
		_chargeItems = [];
		_prints=[];
		num=0;
		money=0;
		submit_success=false;
		inOpetate=false;
		order.calcharge.haveCharge=false;
		var refundType = "0" ;//是否允许修改实收，>0表示不能
		var actionFlag=OrderInfo.actionFlag;
		if(OrderInfo.actionFlag==201){
			actionFlag=3;
		}
        //从session中获取olId，确保olId正确且唯一
		var url = contextPath + "/app/pay/repair/queryOlId";
		var response = $.callServiceAsJson(url, {});
		var sessionOlId=_olId;
		if (response.code == 0 && response.data!=null && response.data!="") {//从session获取olId成功
			 sessionOlId=response.data.olId+"";						
		}else {
			   // 取不到则默认缓存中olId
		}
		OrderInfo.orderResult.olId=sessionOlId;
		chargeOlId=sessionOlId;
		var params={
				"olId":sessionOlId,
				'custVipLevel':OrderInfo.cust.vipLevel,
				"actionFlag":actionFlag,
				"actionTypeName" : encodeURI(OrderInfo.actionTypeName),
				"businessName" : encodeURI(OrderInfo.businessName),
				"olNbr":OrderInfo.orderResult.olNbr,
				"soNbr" : OrderInfo.order.soNbr,
				"refundType":refundType,
				"checkResult":JSON.stringify(OrderInfo.checkresult),
				"enter":"new"
			};
		$.callServiceAsHtmlGet(contextPath+"/app/order/getChargeList",params,{
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
				shoufeeTab();//收银台界面显示
				if(OrderInfo.actionFlag==112){
					$("#nav-tab-6").html(response.data);
					$("#nav-tab-5").removeClass("active in");
					$("#nav-tab-6").addClass("active in");
					$("#rh_fee").html($("#rh_syt").html());
					$("#rh_syt").remove();
					OrderInfo.order.step = 6;
				}else{
					$("#nav-tab-8").html(response.data);
				}
				var shouldMoney=$("#shouldMoney").val();//应收
				$("#spanShouldMoney").html("订单金额(￥"+Number(shouldMoney).toFixed(2)+"元)");
				$("#spanRealMoney").html("￥"+Number(shouldMoney).toFixed(2));
				_setGreyNoEdit();//设置减免按钮是否可用
				$("#printVoucherA").off("click").on("click", function(event){
					_chargeItems=[];
					_buildChargeItems();
					var voucherInfo = {
							"olId":_olId,
							"soNbr":OrderInfo.order.soNbr,
							"busiType":"1",
							"chargeItems":_chargeItems,
							"areaId":OrderInfo.getAreaId(),
							"custName":OrderInfo.cust.partyName
						};
					if(OrderInfo.actionFlag==112){
						order.amalgamation.getPrtInfo(voucherInfo);
					}else{
						voucherInfo.chargeItems = "";
						if(!_submitParam()){
							return ;
						 }
						common.print.signVoucher(voucherInfo);
					}
				});
			},
			"fail":function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	var _tochargeSubmit=function(orderdata){	
		var url=contextPath+"/app/order/checkRuleToProv";
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
	
   //跳转收银台界面
	var shoufeeTab=function(){
		OrderInfo.order.step = 7;
		$("#nav-tab-7").removeClass("active in");
		$("#tab7_li").removeClass("active");
		$("#nav-tab-8").addClass("active in");
		$("#tab8_li").addClass("active");
		if(OrderInfo.actionFlag==201 || OrderInfo.actionFlag==9){//橙分期
			OrderInfo.order.step = 4;
		}
		if(OrderInfo.actionFlag==6){//加装副卡
			OrderInfo.order.step = 5;
		}
		if(OrderInfo.actionFlag==13){//购裸机
			OrderInfo.order.step = 3;
		}
		if(OrderInfo.actionFlag==21){//拆副卡
			OrderInfo.order.step = 4;
		}
		if(OrderInfo.actionFlag==14){//合约新装
			OrderInfo.order.step = 8;
		}
	};
	
	//提交参数封装
	var _submitParam=function(){		
		_chargeItems=[];
		_buildChargeItems();
		return true ;
	};
	//费用项封装
	var _buildChargeItems = function(){
		$("#calChargeDiv ul").each(function() {
			var val = $(this).attr("id");
			if(val!=undefined&&val!=''){
				val=val.substr(5,val.length);				
				var realmoney=common.numMul($("#realMoney_"+val).html(),100)+'';
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
				var boId=$("#boId_"+val).val();
				var payMethodCd=$("#payType option:selected").val();
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
				if(order.calcharge.myFlag){//开启调用支付平台
					payMethodCd=payType;
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
						"boActionType":boActionType,
						"soNbr":OrderInfo.order.soNbr//业务流水暂时存入费用项中，用于支付平台回调时后台直接下计费
				};
				_chargeItems.push(param);
			}
		});
	};
	
	// 点击收费执行事件
	var _updateChargeInfoForCheck=function(){
		if(OrderInfo.actionFlag==112){
			if($("#userName").val().length<1){
				$.alert("提示","请填写联系人！");
				return;
			}
			if($("#userPhone").val().length<1){
				$.alert("提示","请填写联系电话！");
				return;
			}
		}
		if(submit_success){
			$.alert("提示","订单已经建档成功,不能重复操作!");
			return;
		}
		var val=_getCharge();
		_chargeItems=[];
		_buildChargeItems();
		if(val!=0){//费用不为0
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
						chargeCheck="0";
					}else if (response.code == -2) {
						chargeCheck="-2";
					}else{
						chargeCheck="1";
					}
					if (order.calcharge.myFlag) {
						var checkUrl = contextPath + "/app/order/getPayOrdStatus";
						var olId=OrderInfo.orderResult.olId;
						if(OrderInfo.actionFlag==112){//融合甩单传融合id
							var AttrInfos=OrderInfo.orderData.orderList.orderListInfo.custOrderAttrs;
							var uId="";//融合id
							for(var i=0; i<AttrInfos.length; i++){
					             var id=AttrInfos[i].itemSpecId;
					             if(id=="40010037"){
					            	 uId=AttrInfos[i].value; 
					             }
					        }   
							olId=uId;
						}
						var checkParams = {
								"olId" : olId
								
						};
						$.callServiceAsJson(checkUrl, checkParams, {
							"before":function(){
								$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
							},	
							"done" : function(response){
								$.unecOverlay();
								if (response.code != 0) {// 支付平台购物车id查询未支付成功才打开支付页面，否则直接下计费接口
									if(OrderInfo.actionFlag==112){//融合甩单
										_getPayTockenRh();
									}else{
										_getPayTocken();
									}
									return;
								}else{
									if (response.data==""){//有可能支付查询接口异常
										$.alert("提示","支付接口查询失败!");
										return;
									}
									//获取支付方式
									payType=response.data.payCode+"";
								}
								_chargeSave(1);
							},fail:function(response){
								$.unecOverlay();
								$.alert("提示","系统异常，请稍后再试！");
							}
						});
					}else{
						_chargeSave(1);
					}
				}
			});
		}else{
			if (order.calcharge.myFlag) {
				var checkUrl = contextPath + "/app/order/getPayOrdStatus";
				var olId=OrderInfo.orderResult.olId;
				if(OrderInfo.actionFlag==112){//融合甩单传融合id
					var AttrInfos=OrderInfo.orderData.orderList.orderListInfo.custOrderAttrs;
					var uId="";//融合id
					for(var i=0; i<AttrInfos.length; i++){
			             var id=AttrInfos[i].itemSpecId;
			             if(id=="40010037"){
			            	 uId=AttrInfos[i].value; 
			             }
			        }   
					olId=uId;
				}
				var checkParams = {
						"olId" : olId
						
				};
				$.callServiceAsJson(checkUrl, checkParams, {
					"before":function(){
						$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
					},	
					"done" : function(response){
						$.unecOverlay();
						if (response.code != 0) {// 支付平台购物车id查询未支付成功才打开支付页面，否则直接下计费接口
							if(OrderInfo.actionFlag==112){//融合甩单
								_getPayTockenRh();
							}else{
								_getPayTocken();
							}
							return;
						}else{
							if (response.data==""){//有可能支付查询接口异常
								$.alert("提示","支付接口查询失败!");
								return;
							}
							//获取支付方式
							payType=response.data.payCode+"";
						}
						_chargeSave(0);
					},fail:function(response){
						$.unecOverlay();
						$.alert("提示","系统异常，请稍后再试！");
					}
				});
			}else{
				_chargeSave(0);
			}
		}
		
	};
	
	var _chargeSave = function(flag,olId){
		order.phoneNumber.resetBoProdAn();//清楚预占号码缓存  IOS重新进入受理不会显示上次预占的号码
		var realmoney = $("#realmoney").val();
		if(realmoney == "0.00"){
			if(!_submitParam()){
				return ;
			}
	    }
		var params={
				"olId":olId,
				"soNbr":OrderInfo.order.soNbr,
				"areaId" : OrderInfo.staff.areaId,
				"chargeItems":_chargeItems
		};
//		if(order.calcharge.haveCharge==true){//已下过计费接口
//			return;
//		}
//		order.calcharge.haveCharge=true;
		var msg="";
		var url=contextPath+"/app/order/chargeSubmit?token="+OrderInfo.order.token;
		$.callServiceAsJson(url,params, {
			"before":function(){
				$.ecOverlay("<strong>正在处理中,请稍等会儿....</strong>");
			},	
			"done" : function(response){
				$.unecOverlay();
				if (response.code == 0) {
					submit_success=true;
					//受理成功，不再取消订单
//					SoOrder.delOrderFin();
					
					if(OrderInfo.actionFlag==31){//改产品密码，则将session中密码重置，用户需要重新输入密码
						var url=contextPath+"/cust/passwordReset";
						var response2 = $.callServiceAsJson(url, null, {});
					}
					if(flag==1){
						if(OrderInfo.actionFlag==11){
							msg="退费成功";
						}else{
							msg="收费成功";
						}
					}else{
						msg="受理成功";
					}
					$("#toCharge").attr("disabled","disabled");
					$("#toComplate").removeAttr("disabled");
					$("#orderCancel").removeAttr("disabled");
					$("#printVoucherA").attr("disabled","disabled");					
					if(OrderInfo.actionFlag==112){
						order.broadband.orderSubmit();
						return;
					}					
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
					//金额不为零，提示收费成功
					if(flag=='1'){
						var realmoney=($('#realMoney').html())*1;
							_showFinDialog(flag, msg);
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
					if(flag==1){//提交接口失败，被后台拦截则,则非现金支付且金额大于0则调支付平台退款接口
						var charge=_getCharge();//支付金额
						_payRefund(olId,charge,response.data.errMsg);
					}
					//SoOrder.showAlertDialog(response.data);
				}else{
					_conBtns();
					SoOrder.getToken();
					inOpetate=false;
					if(response.data!=undefined){
						//alert(response.data);
						$.alert("提示",response.data);
					}else{
						$.alert("提示","费用信息提交失败!");
					}
				}
			}
		});
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
		$("#alert-modal").modal("show");
		$("#btn-dialog-ok").removeAttr("data-dismiss");
		$('#alert-modal').modal({backdrop: 'static', keyboard: false});
		$("#btn-dialog-ok").off("click").on("click",function(){
			common.relocationCust();
		});
		$("#modal-title").html(title);
		$("#modal-content").html(msg);
		$("#alert-modal").modal();
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

	//遍历所有费用项，置灰不可减免费用项
	var _setGreyNoEdit=function(){
		$("#calChargeDiv ul").each(function() {
			var trid = $(this).attr("id");
			if(trid!=undefined&&trid!=''){
				trid=trid.substr(5,trid.length);
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
//						$.alert("提示","当前费用项不允许修改!");
						$("#button_"+trid).attr("disabled","disabled");
						$("#button_"+trid).attr("style","background: #ddd!important;");
						return false;
					}
				}else if (response.code == -2) {
					$.alertM(response.data);
					return false ;
				}else{
					$.alert("提示","权限数据范围查询失败!");
					return false ;
				}
			}
		});
	}
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
		var realmoney=common.numMul($("#realAmount_"+val).val(),100)+'';
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
	
  //取消实收费用修改,关闭窗口
	var _cancelChange=function(){
		$("#realMoney").attr("disabled","disabled");
		$("#remark").val("");
		$("#editMoneyModal").modal("hide");
	}
	//费用减免--更改实收金额
	var _changeRealMoney=function(){
		var trid=$("#itemId").val();
        var money=$("#realMoney").val().trim();//修改后的费用
        //验证金额合法性
        if(!/^(-)?[0-9]+([.]\d{1,2})?$/.test(money)){
	  		$.alert("提示","费用金额请输入数字，最高留两位小数！");
	  		return;
        }
        if(money*100<0){
			$.alert("提示","实收费用金额不能小于0！");
			return;
		}
        var shouldMoney=$("#shouldMoney2").val().trim();
        if(money*100>shouldMoney*100){
        	$.alert("提示","实收费用金额不能高于应收金额！");
			return;
        }
        if(money*100==shouldMoney*100){
        	$.alert("提示","实收费用金额与应收金额相等，无需修改！");
			return;
        }
		var reason = $("#chargeModifyReasonCd option:selected").val();//修改原因
		var remark = $("#remark").val();//备注
		//实收费用生效后设置收银台相关值
		$("#chargeModifyReasonCd_"+trid).val(reason);
		$("#remark_"+trid).val(remark);
		$("#realMoney_"+trid).html(money);
		$.alert("提示","修改成功！");
		_refreshTotal();
		$("#editMoneyModal").modal("hide");
	};
	
	//动态刷新页面信息
	var _refreshTotal=function(){
		var realAmount=0;
		$("#calChargeDiv ul").each(function() {
			var val = $(this).attr("id");
			if(val!=undefined&&val!=''){
				val=val.substr(5,val.length);
					var aa=($("#realMoney_"+val).html())*1;
					realAmount=realAmount+aa;
			}
		});
		$('#spanRealMoney').html(Number(realAmount).toFixed(2));

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
					_updateChargeInfoForCheck();
				});
				$("#toComplate").off("onclick");
			}else{
			}
		}else{
			$("#toCharge").removeAttr("disabled");
			$("#toComplate").attr("disabled","disabled");
			$("#toCharge").off("onclick");
			$("#toComplate").off("onclick");
		}
	};
	
	/**
	 * 获取支付平台支付页面
	 */
	var _getPayTocken = function(){
		var dis=$("#printVoucherA").attr("disabled");//回执按钮置灰收费不可点击
		if("disabled"!=dis){
			$.alert("提示","请先保存回执");
			return;
		}
		var charge=_getCharge();//支付金额
		_chargeItems=[];
		_buildChargeItems();
		var busiUpType="1";
		order.calcharge.busiUpType="1";
		 //从session中获取olId，确保olId正确且唯一
		var url = contextPath + "/app/pay/repair/queryOlId";
		var response = $.callServiceAsJson(url, {});
		var sessionOlId=OrderInfo.orderResult.olId;
		if (response.code == 0 && response.data!=null && response.data!="") {//从session获取olId成功
			 sessionOlId=response.data.olId+"";						
		}else {
			   // 取不到则默认缓存中olId
		}
		if(_chargeItems.length==0){//费用项为空，则只设soNbr
			var item={
					"soNbr":OrderInfo.order.soNbr	
			};
			_chargeItems.push(item);
		}
		OrderInfo.orderResult.olId=sessionOlId;
		var params={
				"olId":sessionOlId,
				"soNbr":OrderInfo.orderResult.olNbr,
				"busiUpType":busiUpType,
				"chargeItems":_chargeItems,
				"charge":charge,
				"chargeCheck":chargeCheck
		};
		if(chargeOlId!=sessionOlId){//调取算费接口的olId与跳转支付平台的OlId比较，不一样直接拦截
        	var title='信息提示';
			$("#btn-dialog-ok").removeAttr("data-dismiss");
			$('#alert-modal').modal({backdrop: 'static', keyboard: false});
			$("#btn-dialog-ok").off("click").on("click",function(){
				$("#alert-modal").modal("hide");
			});
			$("#modal-title").html(title);
			$("#modal-content").html("算费时的olId:["+chargeOlId+"]与跳转支付界面的olId["+sessionOlId+"]不一致，请退出重新受理!");
			$("#alert-modal").modal();
			return;
		}
		var url = contextPath+"/app/order/getPayUrl";
		var response = $.callServiceAsJson(url, params);
		_chargeItems=[];
		_buildChargeItems();
		if(response.code==0){
			payUrl=response.data;
			//var payUrl2="http://192.168.4.137:7001/pay_web/platpay/index?payToken="+payUrl.split("=")[1];
   		  // payUrl2="https://crm.189.cn:86/upay/platpay/index?payToken=5D0CB495B3DD59CAEC106F93EEBD13952F62C58C4A13445FB8AC378A32038E99";
			//timeId=setInterval(order.calcharge.timeToFee,3000);//定时查询支付状态，若成功则下计费接口，已下过则不再下。
			common.callOpenPay(payUrl);//打开支付页面
		}else if(response.code==1002){
			$.alert("提示",response.data);
		}
		else{
			$.alertM(response.data);
		}
	};

	/**
	 * 融合甩单获取支付平台支付页面
	 */
	var _getPayTockenRh = function(){
		var dis=$("#printVoucherA").attr("disabled");//回执按钮置灰收费不可点击
		if("disabled"!=dis){
			$.alert("提示","请先保存回执");
			return;
		}
		order.calcharge.busiUpType="1";//移动和融合设为1,作为支付成功后调取查询方法判断
		//移动类参数
		var charge1=_getCharge();//移动金额
		var busiUpType1="1";//移动业务为1
		var olId1=OrderInfo.orderResult.olId+"";//购物车id
		var olNbr1=OrderInfo.orderResult.olNbr+"";//购物车流水
		//甩单参数
		var charge2=order.broadband.broadbandCharge;//甩单金额
		var busiUpType2="2";//甩单业务为2
		var olId2=$("#TransactionID").val()+"";
		var olNbr2=$("#TransactionID").val()+"";
		//融合类父参数
		var AttrInfos=OrderInfo.orderData.orderList.orderListInfo.custOrderAttrs;
		var uId="";//融合id
		for(var i=0; i<AttrInfos.length; i++){
             var id=AttrInfos[i].itemSpecId;
             if(id=="40010037"){
            	 uId=AttrInfos[i].value; 
             }
        }   
		var charge=charge1+charge2;
		var busiUpType="3";
		var params={
				"uId"   :uId,
				"charge":charge,
				"busiUpType":busiUpType,
				"olId1":olId1,
				"olNbr1":olNbr1,
				"busiUpType1":busiUpType1,
				"charge1":charge1,
				"olId2":olId2,
				"olNbr2":olNbr2,
				"busiUpType2":busiUpType2,
				"charge2":charge2
		};
		var url = contextPath+"/app/order/getPayUrlForRh";
		var response = $.callServiceAsJson(url, params);
		if(response.code==0){
			payUrl=response.data;
			//var payUrl2="http://192.168.4.137:7001/pay_web/platpay/index?payToken="+payUrl.split("=")[1];
   		  // payUrl2="https://crm.189.cn:86/upay/platpay/index?payToken=5D0CB495B3DD59CAEC106F93EEBD13952F62C58C4A13445FB8AC378A32038E99";
			common.callOpenPay(payUrl);//打开支付页面
		}else if(response.code==1002){
			$.alert("提示",response.data);
		}
		else{
			$.alertM(response.data);
		}
	};
	/**
	 * 获取支付平台返回订单状态并进行下一步操作
	 */
	var _queryPayOrdStatus= function(soNbr, status,type) {
		failCount=0;//初始化
		if ("1" == status) { // 原生返回成功，收费按钮不可点
			$("#toCharge").attr("disabled","disabled");
		}else{
			return;//非成功状态不处理
		}
		if(order.calcharge.busiUpType==CONST.APP_ORDER_BUSI_UP_TYPE){
//			if(OrderInfo.actionFlag!=112){//非融合，先查订单收费状态，未收费继续流程，否则直接提示
				//从session中获取olId，确保olId正确且唯一
				var sessionOlId=OrderInfo.orderResult.olId;
				$.callServiceAsJson(contextPath + "/app/pay/repair/queryOlId", {}, {
					"before": function() {
						$.ecOverlay("查询中，请稍等...");
					},
					"done": function(response) {
						$.unecOverlay();
						if (ec.util.isObj(response)) {
							if (response.code == 0 && response.data!=null && response.data!="") {
								 sessionOlId=response.data.olId+"";	
							} 
						}
						var checkParams = {
								"olId" : sessionOlId,
								"areaId":OrderInfo.staff.areaId+""					
						};
						if(OrderInfo.actionFlag==112){
							checkParams.olId = $("#TransactionID").val()+"";
						}
						OrderInfo.orderResult.olId=sessionOlId;
						
						$.callServiceAsJson(contextPath + "/app/pay/repair/queryOrdStatus", checkParams, {
							"before": function() {
								$.ecOverlay("正在处理中，请稍等...");
							},
							"done": function(response) {
								$.unecOverlay();
								if (ec.util.isObj(response)) {
									if (response.code == 0 && response.data!=null && response.data!="") {//已后台收费成功，直接提示，不走收费流程
										var statusCd=response.data.statusCd;
										if("201700"==statusCd || "201800"==statusCd || "201900"==statusCd ||"301200"==statusCd ||"201300"==statusCd){
											if(OrderInfo.actionFlag==112){
												order.broadband.orderSubmit();
											}else{
												_showFinDialog("1","收费成功！");
												return;
											}
											
											
										}				
									}
								}
								//处理未建档成功的订单
								_queryPayOrdStatus1(sessionOlId,"1");
							},
							"fail": function(response) {
								$.unecOverlay();
								//处理未建档成功的订单
								_queryPayOrdStatus1(sessionOlId,"1");	
							}
						});
					},
					"fail": function(response) {
						$.unecOverlay();
						var checkParams = {
								"olId" : sessionOlId,
								"areaId":OrderInfo.staff.areaId+""					
						};
						$.callServiceAsJson(contextPath + "/app/pay/repair/queryOrdStatus", checkParams, {
							"before": function() {
								$.ecOverlay("正在处理中，请稍等...");
							},
							"done": function(response) {
								$.unecOverlay();
								if (ec.util.isObj(response)) {
									if (response.code == 0 && response.data!=null && response.data!="") {//已后台收费成功，直接提示，不走收费流程
										var statusCd=response.data.statusCd;
										if("201700"==statusCd || "201800"==statusCd || "201900"==statusCd ||"301200"==statusCd ||"201300"==statusCd){
											_showFinDialog("1","收费成功！");
											return;
										}				
									}
									//处理未建档成功的订单
									_queryPayOrdStatus1(sessionOlId,"1");	
								} 
							},
							"fail": function(response) {
								$.unecOverlay();
								//处理未建档成功的订单
								_queryPayOrdStatus1(sessionOlId,"1");	
							}
						});
					}
				});
//			}else{
//				order.broadband.orderSubmit();
//			}
		}else if(order.calcharge.busiUpType==CONST.APP_REPAIR_BUSI_UP_TYPE){//补收费
			repair.main.queryPayOrdStatus1(soNbr, status,type);
		}else if(order.calcharge.busiUpType == CONST.APP_CHARGE_BUSI_UP_TYPE) { // 话费充值
			// 初始化失败次数
			bill.charge.failTimes = 0;
			bill.charge.afterPayCallBack(soNbr, status, type);
		} else{//宽带甩单收费完直接订单提交
			order.broadband.queryPayOrdStatus(soNbr, status,type);
		}
	};
	
	/**
	 * 获取支付平台返回订单状态
	 */
	var _queryPayOrdStatus1 = function(soNbr, status) {
//		if(order.calcharge.haveCharge==true){//已下过计费接口
//			return;
//		}
		if ("1" == status) { // 原生返回成功，调用支付平台查询订单状态接口，再次确定是否成功，如果成功则调用收费接口
			var params = {
				"olId" : soNbr
				
			};
			if(OrderInfo.actionFlag==112){//融合查支付传融合id
				params.olId = $("#TransactionID").val()+"";
			}
			$.callServiceAsJson(contextPath + "/app/pay/repair/queryOrdStatusFromRedis",params, {
				"before": function() {
					$.ecOverlay("请求处理中，请稍等...");
				},
				"done": function(response) {
					$.unecOverlay();
					if (response.code == 0 && response.data!=null && response.data!="") {//支付成功，调用收费接口
						var val=_getCharge();
						if(OrderInfo.actionFlag==112){//融合甩单传融合
							val=val+order.broadband.broadbandCharge;
						}
						var payMoney=response.data.payAmount+"";
						if(val!=payMoney){
							$.alert("提示","金额可能被篡改，为了您的安全，请重新下单");
							return;
						}
						payType=response.data.payCode;
						_chargeItems=[];
						_buildChargeItems();//根据支付平台返回支付方式重新生成费用项
						if(val!=0){//费用不为0
							_chargeSave(1,soNbr);
						}else{
							_chargeSave(0,soNbr);
						}						
					}else if(response.code==1){//支付接口支付失败
						// 如果查询5次后，还是支付失败，则停止重试
						if ((++ failCount) > 5) {
							return;
						}
						setTimeout(function() {_queryPayOrdStatus1(soNbr,status);}, 2000);			
					}else if (response.status == 1002) {
						$.alert("提示",response.data); // 支付失败
					} else if (response.data==""){//封装的ajax方法调用超时也可能返回code=0
						$.alert("提示","调用支付接口查询超时！"); // 查询失败
					}else {
						$.alertM(response.data);// 调用接口异常
					}
				},
				"fail": function(response) {
					$.unecOverlay();
					$.alert("提示", "请求可能发生异常，请稍后再试！");
				}
			});
		}
	};
	
	//获取实收费用
	var _getCharge = function(){
		var realAmount=0;
		$("#calChargeDiv ul").each(function() {
			var val = $(this).attr("id");
			if(val!=undefined&&val!=''){
				val=val.substr(5,val.length);
				var aa=($("#realMoney_"+val).html())*1;
				realAmount=common.numAdd(realAmount,aa);
			}
		});
		return common.numMul(realAmount,100);
	};

	// 显示费用减免窗口
	var _showEditPage = function(accessNumber, trid, realAmount, itemTypeId,defmethod,title) {
		var flag = _queryAuthenticDataRange(trid);
		// var flag = _queryPayMethodByItem(itemTypeId,trid,defmethod);
		if (flag) {
			$("#editMoneyModal").modal("show");
			$("#realMoney").val(realAmount);
			$("#shouldMoney2").val(realAmount);
			$("#itemId").val(trid);
			$("#editMoneyTitle").html("费用减免("+title+")");
			$("#chargeModifyReasonCd").off("change").on("change", function() {
				if ($(this).val() == "1") {
					$("#remarkDiv").css("display", "block");
					$("#remark").addClass("form-control p-r-15");
				} else {
					$("#remarkDiv").css("display", "none");
				}
			});
			$("#realMoney").removeAttr("disabled");
		}
	};
	
	
//支付退款
  var _payRefund=function(olId,payAmount,remark){
		var params={
				"olId":olId,
				"payAmount":payAmount,
				"remark"   :remark
		};
		//params.remark=response.data.errData.resultMsg;
		var url = contextPath+"/app/pay/repair/payRefund";
		var response = $.callServiceAsJson(url, params);
		if (response.code == 0) {
			$.alert("提示","收费建档并激活出错，已帮您成功退款！");
		}
  };
  

	return {
		changeRealMoney:_changeRealMoney,
		refreshTotal:_refreshTotal,
		cancelChange:_cancelChange,
		calchargeInit:_calchargeInit,
		pageFlag:_pageFlag,
		tochargeSubmit:_tochargeSubmit,
		chargeSave:_chargeSave,
		showEditPage : _showEditPage,
		updateChargeInfoForCheck : _updateChargeInfoForCheck,
		chargeSave : _chargeSave,
		getPayTocken           :           _getPayTocken,
		queryPayOrdStatus           :      _queryPayOrdStatus,
		queryPayOrdStatus1          :      _queryPayOrdStatus1,
		myFlag:_myFlag,
		getCharge:_getCharge,
		busiUpType:_busiUpType,
		returnFlag:_returnFlag,
		setGreyNoEdit:_setGreyNoEdit,
		getPayTockenRh:_getPayTockenRh

	};
})();

