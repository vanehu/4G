/**
 * 规则
 */
CommonUtils.regNamespace("rule", "rule");

rule.rule = (function(){

	
	var checkFlag = false;
	var checkObj = {};
	var _callBackStr = "";
	var _callBackParam = {};
	
	var _init = function() {
		$("#ruleBody").html("");
		$("#ruleclose").click(function(){
			_closeRuleDiv();
		});
		//授信
		$("#credit").click(function(){
			_credit();
		});
		$("#closedialog").click(function(){
			_cancel();
		});
	};
	/**
	 * 受理准备调用规则
	 * param : {
	 * 		
	 *  	ruleParam : {
	 *  		boActionTypeCd : 'S1', //动作类型
	 *  		instId : '1200001', //实例ID
	 *  		specId : '1201201', //产品（销售品）规格ID
	 *  		custId : '345903434', //客户ID
	 *  		areaId : '899990',//地区ID
	 *  	}
	 *  	
	 * }
	 */
	var _prepare = function(param,callBackStr,callBackParam){
		_init();
		_callBackStr = callBackStr;
		_callBackParam = callBackParam;
		if(!query.offer.loadInst()){  //加载实例到缓存
			return;
		};
		var inParam ={
			prodInfo : order.prodModify.choosedProdInfo,
			areaId : param.areaId,
			staffId : param.staffId,
			channelId : param.channelId,
			custId : param.custId,
			boInfos : param.boInfos,
			soNbr : OrderInfo.order.soNbr,
			olTypeCd : CONST.OL_TYPE_CD.UI_LTE
		};
		$.ecOverlay("<strong>客户级规则校验中，请稍等...</strong>");
		var response = $.callServiceAsJson(contextPath+"/rule/prepare",inParam); //调用规则校验
		$.unecOverlay();
		var checkData = response.data;
		if(response.code==0){
			if(checkData == null){
				$.alert("提示","规则校验异常，请联系管理人员！");
				return;
			}
		}else{
			$.alertM(response.data);
			return;
		}
		
		if(checkData.ruleType == "portal"){
			if (checkData.resultCode == "0"){
				$.alert("提示",checkData.resultMsg);
				return true;
			}
		}		
		if (checkData.result && checkData.result.resultInfo) {
			var checkRuleInfo = checkData.result.resultInfo;
			if (checkRuleInfo != null && checkRuleInfo.length > 0) {
				$.each(checkRuleInfo, function(i, ruleInfo) {
					$("<tr>" +
							"<td>"+ruleInfo.resultCode+"</td>" +
							"<td>"+ruleInfo.ruleDesc+"</td>" +
							"<td>"+_getRuleLevelName(ruleInfo.ruleLevel)+"</td>" +
							"<td><div style='display:block;margin-left:30px;' class='"+_getRuleImgClass(ruleInfo.ruleLevel)+"'></div></td>" +
					"</tr>").appendTo($("#ruleBody"));
				});
				easyDialog.open({
					container : 'ruleDiv'
				});
			} else {
				_credit();	
				SoOrder.initFillPage();		
			}
		} else {
			_credit();
			SoOrder.initFillPage();	
		}
		if (checkData.resultCode != 0) {
			$("#ruleSubmit").hide();
		} else {
			checkObj = param;
			checkFlag = true;
		}
	};
	
	var _getRuleImgClass = function(ruleLevel) {
		if (ruleLevel < 4) {
			return "correct";
		} else {
			return "error";
		}
	};
	
	var _getRuleLevelName = function(ruleLevel) {
		if (ruleLevel == 0) {
			return "提示级";
		} else if (ruleLevel == 1) {
			return "中级";
		} else if (ruleLevel == 2) {
			return "高级";
		} else if (ruleLevel == 3) {
			return "特技";
		} else if (ruleLevel == 4) {
			return "限制级";
		}
	};
	
	var _prepareCallBack = function(response) {
		var content$ = $("#ruleDiv");
		content$.html(response.data).show();
	};
	
	
	/**
	 * 规则页面点击确定按钮
	 */
	var _submit = function() {
		if (!checkFlag) {
			return;
		}
		$.callServiceAsHtml(contextPath+checkObj.uri, checkObj.param, checkObj.callObj);
		easyDialog.close();
	};
	
	/**
	 * 关闭规则窗口
	 */
	var _closeRuleDiv = function() {
		if (!$("#ruleDiv").is(":hidden")) {
			easyDialog.close();
		}
	};
	
	var _cancel = function() {
		//TODO may do other things;
		if (!$("#ruleDiv").is(":hidden")) {
			easyDialog.close();
		}
	};
	
	var _showRuleDiv = function(ruleInfo) {
		
	};
	
	var _credit = function() {
		eval(_callBackStr + "("+JSON.stringify(_callBackParam) + ")");
		//_closeRuleDiv();
	};
	
	//生成订单流水号，加载实例到缓存,规则校验
	var _ruleCheck = function(boInfos){
		//_init();
		if(!query.offer.loadInst()){  //生成订单流水号，加载实例到缓存，如果失败
			return false;
		};
		if(boInfos==undefined){  //没有传，表示不做业务规则校验
			return true;
		}
		var inParam ={
			areaId : OrderInfo.staff.soAreaId,
			staffId : OrderInfo.staff.staffId,
			channelId : OrderInfo.staff.channelId,
			custId : OrderInfo.cust.custId,
			soNbr : OrderInfo.order.soNbr,
			boInfos : boInfos,
			prodInfo : order.prodModify.choosedProdInfo,
			olTypeCd : CONST.OL_TYPE_CD.UI_LTE
		};
		$.ecOverlay("<strong>客户级规则校验中，请稍等...</strong>");
		var response = $.callServiceAsJson(contextPath+"/rule/prepare",inParam); //调用规则校验
		$.unecOverlay();
		if(response!=undefined && response.code==0){
			var checkData = response.data;
			if(checkData == null){
				$.alert("提示","规则校验异常，请联系管理人员！");
				return false;
			}
			if(checkData.ruleType == "portal"){  //门户层校验
				if (checkData.resultCode == "0"){  // 0为门户层校验为通过
					$.alert("提示",checkData.resultMsg);
					return false;
				}
			}		
			var checkRuleInfo = checkData.result.resultInfo;  //业务规则校验
			$("#ruleBody").empty();
			if(checkRuleInfo!=undefined && checkRuleInfo.length > 0){
				$.each(checkRuleInfo, function(i, ruleInfo) {
					$("<tr><td>"+ruleInfo.resultCode+"</td>" +
							"<td>"+ruleInfo.ruleDesc+"</td>" +
							"<td>"+_getRuleLevelName(ruleInfo.ruleLevel)+"</td>" +
							"<td><div style='display:block;margin-left:30px;' class='"+_getRuleImgClass(ruleInfo.ruleLevel)+"'></div></td>" +
					"</tr>").appendTo($("#ruleBody"));
				});
//				easyDialog.open({
//					container : 'ruleDiv'
//				});
				$.popupSmall("#poppopdialog",{
					width:500,
					height:300
				});
				return false;
			}else {
				return true;
			}
		}else{
			$.alertM(response.data);
			return;
		}
	};
	
	return {
		submit 			: _submit,
		prepare 		: _prepare,
		showRuleDiv 	: _showRuleDiv,
		ruleCheck		: _ruleCheck,
		init			: _init,
		getRuleLevelName: _getRuleLevelName,
		getRuleImgClass : _getRuleImgClass
	};
})();
$(function(){

});
