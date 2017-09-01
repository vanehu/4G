CommonUtils.regNamespace("order", "query");

/**
 *订单查询.
 */
order.query = (function(){
	
	var _init = function(){
		$("#bt_orderQry").off("click").on("click",function(){_queryOrderList(1);});
	};
	
	//查询
	var _queryOrderList = function(pageIndex){
		if(!$("#p_areaId_val").val()||$("#p_areaId_val").val()==""){
			$.alert("提示","请选择'地区'再查询");
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
				"p_bussType":$("#p_bussType").val(),
				"p_orderStatus":$("#p_orderStatus").val(),
				"p_partyId":OrderInfo.cust.custId==undefined?"":OrderInfo.cust.custId,
				curPage:curPage,
				pageSize:10
		};
		
		$.callServiceAsHtmlGet(contextPath+"/orderQuery/list",param,{
			"before":function(){
				$.ecOverlay("订单查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					 response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>not data return,please try reload again.</strong></div>';
				}
				var content$=$("#order_list");
				content$.show().addClass("pageright").removeClass("in out").addClass("out");
				setTimeout(function(){
					content$.html(response.data).removeClass("cuberight in out").addClass("pop in");
					setTimeout(function(){
						content$.removeClass("pop in out");
					},500);
				},500);
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	var _chooseAree = function(){
		order.area.chooseAreaTreeManger("orderQuery","p_areaId_val","p_areaId",3);
	};
	
	var _initPhotographReviewDom = function(){
		$("#photographReviewForm").off("formIsValid").bind("formIsValid", function (event) {
			order.query.downloadCustCertificate();
        }).ketchup({bindElement: "downloadCustCertificateBtn"});
	};
	
	var _downloadCustCertificate = function(){
		//每次查询前清空缓存并初始化页面
		$("#handleCustCertificateList").html("");
		
		var params = {
			"olId"		:$.trim($("#virOlIdInput").val()),
			"areaId"	:OrderInfo.staff.areaId,
			"srcFlag"	:"REAL"
		};
		
		$.callServiceAsHtml(contextPath + "/order/downloadCustCertificate", params, {
			"before" : function() {
				$.ecOverlay("<strong>正在查询经办人人像信息, 请稍等...</strong>");
			},
			"done" : function(response) {
				if(response.code == 0 && response.data){
					$("#handleCustCertificateList").html(response.data).show();
				}else if(response.code == -2 && response.data){
					$.alertM(response.data);
				}else{
					$("#handleCustCertificateList").html(response.data).show();
				}
			},
			"fail" : function(response) {
				$.alert("错误","查询经办人人像信息发生未知异常：" + response.data);
			},
			"always" : function() {
				$.unecOverlay();
			}
		});
	};
	
	//远程审核：审核通过
	var _photographReviewCheckOK = function(){
		_photographReviewPassed({
			"checkType":"2",
			"olId":$.trim($("#virOlIdInput").val())
		}, "order.query.callBackFunc4Check()");
	};
	
	//远程审核：审核不过
	var _photographReviewCheckFail = function(){
		_photographReviewPassed({
			"checkType":"N2",
			"olId":$.trim($("#virOlIdInput").val())
		}, "order.query.callBackFunc4Check()");
	};
	
	//审核前基本校验
	var _callBackFunc4Check = function(){
		var handleCustPhotograph = $("#handleCustPhotograph").attr("src");
		var handleCustCertificateImg = $("#handleCustCertificateImg").attr("src");
		
		if(!ec.util.isObj(handleCustPhotograph)){
			$.alert("错误", "页面没有经办人人像信息，无法进行审核操作，请根据正确的虚拟流水号查询人像信息。");
			return false;
		} else{
			return true;
		}
	};

	//远程审核
	var _photographReviewPassed = function(params, callBackFunc4Check){
		if(ec.util.isObj(callBackFunc4Check)){
			if(!eval(callBackFunc4Check)){
				return;
			}
		}
		
		$.callServiceAsJson(contextPath + "/order/savePhotographReviewRecord", params, {
			"before" : function() {
				$.ecOverlay("<strong>正在确认审核信息, 请稍等...</strong>");
			},
			"done" : function(response) {
				if(response.code == 0 && response.data){
					if(ec.util.isObj(response.data)){
						$.alert("信息", response.data);
					} else{
						$.alert("信息", "审核完成！");
					}
				}else if(response.code == 1 && response.data){
					$.alert("错误", "审核确认信息发送失败，错误原因：" + response.data);
				}else if(response.code == -2 && response.data){
					$.alertM(response.data);
				}else{
					$.alert("错误", "审核确认信息发生未知异常，请稍后重试。错误信息：" + response.data);
				}
			},
			"fail" : function(response) {
				$.alert("错误","审核确认信息发生未知异常：" + response.data);
			},
			"always" : function() {
				$.unecOverlay();
			}
		});
	};
	
	/**
	 * 查询具有某权限的员工列表
	 * params：可为{}或者null，此时按SysConstant.RXSH权限进行查询，
	 * 	例：{"operateSpec":"权限编码"}
	 * selectId：展示员工列表的select标签ID，可为空，此时默认为"#auditStaffList"。
	 */
	var _qryOperateSpecStaffList = function(params, selectId){
		var requestParams = {};
		
		if(ec.util.isObj(params)){
			requestParams = params;
		}
		
		$.callServiceAsJson(contextPath + "/order/qryOperateSpecStaffList", requestParams, {
			"before" : function() {
				$.ecOverlay("<strong>正在查询审核人员信息, 请稍等...</strong>");
			},
			"done" : function(response) {
				if(response.code == 0 && response.data){
					OrderInfo.operateSpecStaff.operateSpecStaffList = response.data;
					_setOperateSpecStaffList(response.data, selectId);
				}else if(response.code == 1 && response.data){
					$.alert("错误", "查询审核人员失败，错误原因：" + response.data);
				}else if(response.code == -2 && response.data){
					$.alertM(response.data);
				}else{
					$.alert("错误", "查询审核人员发生未知异常，请稍后重试。错误信息：" + response.data);
				}
			},
			"fail" : function(response) {
				$.alert("错误","查询审核人员信息发生未知异常：" + response.data);
			},
			"always" : function() {
				$.unecOverlay();
			}
		});
	};
	
	/**
	 * 将查询到的具有某权限的员工列表拼装到select标签
	 */
	var _setOperateSpecStaffList = function(staffList, selectId){
		var selectIdDom = "#auditStaffList";//默认selectId
		
		if(ec.util.isObj(selectId)){
			selectIdDom = selectId;
		}
		
		$(selectIdDom).empty();
		$(selectIdDom).append("<option value=''>--请选择审核人员--</option>");
		
		if(ec.util.isArray(staffList)){
			$.each(staffList, function(){
				$(selectIdDom).append("<option value='"+this.staffId+"'>"+this.staffName+"/"+this.staffCode+"</option>"); 
			});
		}
	};
	
	return {
		init						:_init,
//		showMain					:_showMain,
		chooseAree					:_chooseAree,
		queryOrderList				:_queryOrderList,
		callBackFunc4Check			:_callBackFunc4Check,
		photographReviewPassed		:_photographReviewPassed,
		qryOperateSpecStaffList		:_qryOperateSpecStaffList,
		photographReviewCheckOK		:_photographReviewCheckOK,
		downloadCustCertificate		:_downloadCustCertificate,
		initPhotographReviewDom		:_initPhotographReviewDom,
		photographReviewCheckFail	:_photographReviewCheckFail
	};
})();
//初始化
$(function(){
	order.query.init();
	order.query.initPhotographReviewDom();
});