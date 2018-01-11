CommonUtils.regNamespace("query", "cert");

/**
 *证件关系查询.
 */
query.cert = (function(){
	
	var _init = function(){
		$('#certNumRelForm').off().bind('formIsValid', function(event, form) {
			if ($.trim($("#identidiesTypeCd" + " option:selected").val()) == "1" && !ec.util.isObj($('#orderAttrIdCard').val())){
				$.alert("提示","请先读卡");
		    	return;
	    	}
		    _queryCertNumRelList(1);
	      }).ketchup({bindElement:"bt_Qry"});
	};
	
	
	//创建客户证件类型选择事件
	var _identidiesTypeCdChoose = function(scope,id) {
		$("#"+id).removeAttr("disabled");
		$("#"+id).val("");
		$("#"+id).attr("onkeyup", "value=value.replace(/[^A-Za-z0-9]/ig,'')");
		var identidiesTypeCd=$(scope).val();
		$("#"+id).attr("maxlength", "100");
		$("#orderAttrReadCertBtn").css("display","none");
	   if(identidiesTypeCd==1 || identidiesTypeCd==12 || identidiesTypeCd== 41){
			$("#"+id).removeAttr("data-validate");
			$("#"+id).attr("placeHolder","请点击右面读卡按钮，进行读卡操作！");
			$("#orderAttrIdCard").attr("disabled","disabled");
			$("#orderAttrReadCertBtn").css("display","");
		}
		else if(identidiesTypeCd==2){
				$("#"+id).attr("onkeyup", "value=value.replace(/[^A-Za-z0-9\u4e00-\u9fa5]/ig,'')");
				$("#"+id).attr("placeHolder","请输入合法军官证");
        		$("#"+id).attr("data-validate","validate(required:请准确填写军官证) on(blur)");
		}else if(identidiesTypeCd==3){
			$("#"+id).attr("onkeyup", "value=value.replace(/[^A-Za-z0-9-]/ig,'')");
			$("#"+id).attr("placeHolder","请输入合法护照");
			$("#"+id).attr("data-validate","validate(required:请准确填写护照) on(blur)");
		}else if(identidiesTypeCd==15) {
			$("#"+id).attr("onkeyup", "value=value.replace(/[^A-Za-z0-9-]/ig,'')");
			$("#"+id).attr("placeHolder","请输入合法证件号码");
			$("#"+id).attr("data-validate","validate(required:请准确填写证件号码) on(blur)");
			$("#"+id).attr("maxlength","20");
		}else{
			$("#"+id).attr("placeHolder","请输入合法证件号码");
			$("#"+id).attr("data-validate","validate(required:请准确填写证件号码) on(blur)");
		}
		_init();
	};
	
	// 填读卡
	var _readCertWhenOrder = function() {
		var man = cert.readCert();
		if (man.resultFlag != 0){
			if(man.resultFlag==-3){
					//版本需要更新特殊处理 不需要提示errorMsg
					return ;
			}
			$.alert("提示", man.errorMsg);
			return;
		}
		$('#orderAttrIdCard').val(man.resultContent.certNumber);
	};
	
	//查询
	var _queryCertNumRelList = function(pageIndex){
		var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
		
		var param={
				  "ContractRoot":{
						   "SvcCont":{
							      "certType":$("#identidiesTypeCd").val(),
							      "certNum":$("#orderAttrIdCard").val(),
							      curPage:curPage,
							      pageSize:10
							      
							 },
						    "TcpCont": {
						    	
						    }
					}
		};
				   
		$.callServiceAsHtmlGet(contextPath+"/cm/queryCmRelList",{strParam:JSON.stringify(param)},{
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
				if (response.code == -2) {
					$.alertM(response.data);
					return;
				}
				var content$=$("#cmlist");
				content$.html(response.data);
				var totalNum = $("#totalNum").val();
				$("#ec-total-page").after("<label class='marginTop4'>共"+totalNum+"条</label>");
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	return {
		queryCertNumRelList:_queryCertNumRelList,
		identidiesTypeCdChoose : _identidiesTypeCdChoose,
		readCertWhenOrder : _readCertWhenOrder,
		init:_init
		
	};
})();
//初始化
$(function(){
	query.cert.identidiesTypeCdChoose($("#identidiesTypeCd"),'orderAttrIdCard');
});