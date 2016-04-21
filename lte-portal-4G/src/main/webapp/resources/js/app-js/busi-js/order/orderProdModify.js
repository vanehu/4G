/**
 * 订单准备
 * 
 * @author tang
 */
CommonUtils.regNamespace("order", "prodModify");
/**
 * 订单准备
 */
order.prodModify = (function(){
	var _choosedProdInfo = {};
	var _ischooseOffer=false;
	//选中套餐返回
	var _chooseOfferForMember=function(specId,subpage,specName,offerRoleId){
		OrderInfo.newofferSpecName = specName;
		$("#"+subpage).show();
		$("#"+subpage).html("&nbsp;&nbsp;<span style='color: #327501;'>订购新套餐：</span>"+specName);
		$("#li_"+subpage).attr("addSpecId",specId).attr("addRoleId",offerRoleId).attr("del","N").attr("addSpecName",specName);
		_ischooseOffer=true;
		if(document.getElementById("li_"+subpage)){
			$("#li_"+subpage).css("text-decoration","").attr("del","N").attr("knew","Y");
			$("#li_"+subpage).find("i:first-child").find("a").text("拆副卡");
		}
		
	};
	//二次鉴权
	var _querySecondBusinessAuth=function(menuId,isSimple){
		if(OrderInfo.acctNbr==undefined || OrderInfo.acctNbr==null || OrderInfo.acctNbr==""){
			OrderInfo.acctNbr=order.prodModify.choosedProdInfo.accNbr;
		}
		var url=contextPath+"/token/secondBusi/querySecondBusinessMenuAuth";
		var param={
			menuId:menuId,
			isSimple:isSimple,
			typeCd:OrderInfo.typeCd,   //鉴权类别
			types:"app"
		}
		var response= $.callServiceAsHtml(url,param);
		$("#auth2").empty().append(response.data);
		/*
		var authTypeStr=$("#authTypeStr").html();
		if(authTypeStr.toString().indexOf(OrderInfo.cust_validateType)!=-1){
			return;
		}
		*/
        
		
		if (response.code == 0) {
			var recordParam={};
			recordParam.validateType=OrderInfo.typeCd;
			recordParam.validateLevel="2";
			recordParam.custId=OrderInfo.cust.custId;
			recordParam.accessNbr=OrderInfo.acctNbr;
			recordParam.certType=OrderInfo.cust.identityCd;
			recordParam.certNumber=OrderInfo.cust.idCardNumber;
			  //判断结果
			var is=false;
			var rules=OrderInfo.rulesJson;
			//判断是否可以跳过鉴权
			var rule="rule"+OrderInfo.typeCd;
			//员工权限
			var iseditOperation=rules.iseditOperation;
			if(iseditOperation!="0"){
				$("#iseditOperation").hide();
			}
			
			//和后台配置一致,可以跳过,或者员工工号有跳过权限
			var rule2="";
			 for(var r in rules){ 
				 if(r==rule){
					   if(rule=="rule1"){
						   rule2=rules.rule1;
					   }
					   else if(rule=="rule2"){
						   rule2=rules.rule2;
					   }
					   else if(rule=="rule3"){
						   rule2=rules.rule3;
					   }
					   else if(rule=="rule4"){
						   rule2=rules.rule4;
					   }
						
					}
			 }
			//和后台配置一致,可以跳过,或者员工工号有跳过权限
			if(rule2=="Y" ||(iseditOperation=="0" && OrderInfo.typeCd==4)){
				//记录到日志里
				cust.saveAuthRecordFail(recordParam);
				//如果是套餐变更
				if(OrderInfo.actionFlag==2){
					//$("#auth2").css('display','none'); 
					var sy=$("#order_prepare").css("display");
					if(sy=="none"){
						$("#order_prepare").css('display', 'block');
					}
					$("#auth2").css('display', 'none');
					offerChangeNew.init();
				}
				//主副卡
				else if(OrderInfo.actionFlag==3){
				//	$("#auth2").css('display','none');
					var sy=$("#member_prepare").css("display");
					if(sy=="none"){
						$("#member_prepare") .css('display', 'block');
					}
					order.memberChange.init();
				}
				//可选包
				else if(OrderInfo.actionFlag==14){
				//	$("#auth2").css('display','none');
					var sy=$("#order-content").css("display");
					if(sy=="none"){
						$("#order-content") .css('display', 'block');
					}
					AttachOffer.init();
				}
				OrderInfo.authRecord.resultCode = "";
				OrderInfo.authRecord.validateType = "";
				
			}
			
			//工号有跳过鉴权权限 
			else if(iseditOperation=="0"){
				$("#auth2").css('display','block'); 
				//$("#iseditOperation").attr("style","");
				
			}
			
			else{
//				//显示跳过鉴权按钮 
				//$("#iseditOperation").attr("style","");
				$("#auth2").css('display','block'); 
			}
			
		} 
		
		else {
			$.alertM(response.data);
		}
	};
	//二次鉴权
	var _querySecondBusinessAuthSub=function(){
		var url=contextPath+"/token/secondBusi/querySecondBusinessMenuAuthSub";
		var param={
			types:"app"
		}
		var response= $.callServiceAsHtml(url,param);
		$("#auth2").empty().append(response.data);
        
		
		if (response.code == 0) {
            
			var iseditOperation=OrderInfo.rulesJson.iseditOperation;
			if(iseditOperation!="0"){
				$("#iseditOperation").hide();
			}
			
			//和后台配置一致,可以跳过,或者员工工号有跳过权限
			if(OrderInfo.typeCd=="1" ||(iseditOperation=="0" && OrderInfo.typeCd==4) ){
				var recordParam={};
				recordParam.validateType="1";
				recordParam.validateLevel="1";
				recordParam.custId=OrderInfo.cust.custId;
				recordParam.accessNbr=OrderInfo.acctNbr;
				recordParam.certType=OrderInfo.cust.identityCd;
				recordParam.certNumber=OrderInfo.cust.idCardNumber;
				//记录到日志里
				cust.saveAuthRecordFail(recordParam);
				$("#auth2").css('display','none');
				var prodOfferId=OrderInfo.provinceInfo.prodOfferId;
				if(prodOfferId!="" && prodOfferId!=null &&prodOfferId!="null"){
					order.service.buyService(prodOfferId,"");
				}
				else{
					 $("#order_prepare").css('display','block');
					order.service.init();
				}
			}
			//工号有跳过鉴权权限 
			else  if(iseditOperation=="0"){
				$("#auth2").css('display','block'); 
//				//$("#iseditOperation").attr("style","");
			}
			
			else{
//				//显示跳过鉴权按钮 
//				$("#iseditOperation").attr("style","");
				 $("#auth2").css('display','block'); 
			}
			
		} 
		
		else {
			$.alertM(response.data);
		}
	};

	return {
		choosedProdInfo				:		_choosedProdInfo,
		chooseOfferForMember        :      _chooseOfferForMember,
		querySecondBusinessAuth:_querySecondBusinessAuth,
		querySecondBusinessAuthSub:_querySecondBusinessAuthSub
	};	
})();
