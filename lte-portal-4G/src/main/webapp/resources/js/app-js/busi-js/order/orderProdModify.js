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
	//政企客户
	var _governmentEnterpriseCustomers=function(menuId,isSimple,segmentId){
		//省份传参 OrderInfo.typeCd
//		8 单位证件+使用人
//		7 使用人证件鉴权    使用人名与账户名不一致
//		6 使用人证件鉴权    使用人名与账户一致
//		5 单位证件鉴权
//		2 短信
//		3 密码
		
		if(OrderInfo.acctNbr==undefined || OrderInfo.acctNbr==null || OrderInfo.acctNbr==""){
			OrderInfo.acctNbr=order.prodModify.choosedProdInfo.accNbr;
		}
		var url=contextPath+"/token/secondBusi/querySecondBusinessMenuAuth";
		var param={
				menuId:menuId,
				isSimple:isSimple,
				typeCd:OrderInfo.typeCd,   //鉴权类别
				types:'app',
				segmentId:segmentId,
				actionFlag:OrderInfo.actionFlag,
				soNbr:OrderInfo.order.soNbr,
				acctNbr:OrderInfo.acctNbr,
				custId:OrderInfo.cust.custId,
				type:2
		}
		var response= $.callServiceAsHtml(url,param);
		$("#auth2").empty().append(response.data);

		
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
			if(OrderInfo.typeCd==8){
				OrderInfo.typeCd=5;
			}
			else if(OrderInfo.typeCd==5){
				OrderInfo.typeCd=6;
			}
			else if(OrderInfo.typeCd==6){
				OrderInfo.typeCd=7;
			}
			else if(OrderInfo.typeCd==7){
				OrderInfo.typeCd=8;
			}
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
					  //短信
					   //短信
					   if(rule=="rule2"){
						   rule2=rules.rule2;
					   }
					   //产品密码
					   else if(rule=="rule3"){
						   rule2=rules.rule3;
					   }
					// 单位证件+使用人
					   else if(rule=="rule5"){
						   rule2=rules.rule5;
					   }
					   //单位证件  
					   
					   else if(rule=="rule6"){
						   rule2=rules.rule6;
					   }
					  // 使用人证件鉴权    使用人名与账户一致
					   else if(rule=="rule7"){
						   rule2=rules.rule7;
					   }
					// 使用人证件鉴权    使用人名与账户一致
					   else if(rule=="rule8"){
						   rule2=rules.rule8;
					   }
						
					}
			 }
			//和后台配置一致,可以跳过,或者员工工号有跳过权限
			if(rule2=="Y" ||(iseditOperation=="0" && OrderInfo.typeCd==4)){
				//记录到日志里
				cust.saveAuthRecordFail(recordParam);
				cust.goService();
				
			}
			else{
				$("#auth2").css('display','block'); 
			}
			
		} 
		
		else {
			$.alertM(response.data);
		}
		
	};
	
	//判断是否是政企客户
	  var _isCustomers=function(id){
		  //政企客户
		  if(id==6|| id==7 || id== 15|| id==34 || id==43){
			  return 1000;
		  }
		  else{
			  return 500;
		  }
	  };
	//普通用户
	var _domesticConsumer=function(menuId,isSimple){
		if(OrderInfo.acctNbr==undefined || OrderInfo.acctNbr==null || OrderInfo.acctNbr==""){
			OrderInfo.acctNbr=order.prodModify.choosedProdInfo.accNbr;
		}
		var url=contextPath+"/token/secondBusi/querySecondBusinessMenuAuth";
		var param={
				menuId:menuId,
				isSimple:isSimple,
				typeCd:OrderInfo.typeCd,   //鉴权类别
				types:'app',
				segmentId:500,
				actionFlag:OrderInfo.actionFlag,
				soNbr:OrderInfo.order.soNbr,
				acctNbr:OrderInfo.acctNbr,
				type:1,
				custId:OrderInfo.cust.custId
		}
		var response= $.callServiceAsHtml(url,param);
		$("#auth2").empty().append(response.data);

		
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
				cust.goService();
				
			}
			else{
				$("#auth2").css('display','block'); 
			}
			
		} 
		
		else {
			$.alertM(response.data);
		}
	}
	
	
	//二次鉴权
	var _querySecondBusinessAuth=function(menuId,isSimple){	
		var p={};
		var segmentId=_isCustomers(OrderInfo.cust.identityCd);
		if(segmentId==1000){
			//判断开关是否开启
			var url=contextPath+"/token/secondBusi/queryCustOnOffJson";
			var response= $.callServiceAsJson(url,p,{});
			if(response.code == 0){
				if(response.data.ONOFF=="ON"){
					//政企客户
					_governmentEnterpriseCustomers(menuId,isSimple,segmentId);
				}
				else{
					order.cust.goService();
				}
			}
		}
		else{
			//一般客户
			_domesticConsumer(menuId,isSimple,segmentId);
		}
	};
	

	return {
		choosedProdInfo				:		_choosedProdInfo,
		chooseOfferForMember        :      _chooseOfferForMember,
		querySecondBusinessAuth:_querySecondBusinessAuth,
		isCustomers:_isCustomers
	};	
})();
