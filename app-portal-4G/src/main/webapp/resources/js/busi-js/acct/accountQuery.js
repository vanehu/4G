CommonUtils.regNamespace("account", "query");

/**
 * 帐户详情查询
 */
account.query = (function(){
	
	var _areaId = "";
	
	//地区选择（系统管理维度列表弹出框）	
	var _chooseArea = function(){
		order.area.chooseAreaTreeManger("acct/preQueryAccount","p_areaId_val","p_areaId",3);
	};
	
	//客户查询（弹出框）
	var _showQueryCust = function(){
		if($("#p_areaId_val").val()==""){
			$.alert("提示","请先选择所属地区再进行客户查询");
			return;
		}
		easyDialog.open({
			container : "d_cust"
		});
		$("#cust").val("");
		$("#custlist").html("");
		$(".easyDialogclose").click(function(){
			easyDialog.close();			
		});						
	};
	
	//初始化客户认证类型弹出框
	var _initCustIdType = function(){
		var param = {attrSpecCode : "PTY-0004"};
		$.callServiceAsJson(contextPath+"/staffMgr/getCTGMainData",param,{
			"done" : function(response){
				if(response.code==0){
					var data = response.data ;
					if(data!=undefined && data.length>0){
						for(var i=0;i<data.length;i++){
							var busiStatus = data[i];
							$("#cust_id_type").append("<option value='"+busiStatus.attrValueCode+"' >"+busiStatus.attrValueName+"</option>");							
						}
					}
				}else if(response.code==-2){
					$.alertM(response.data);
					return;
				}else{
					$.alert("提示","调用主数据接口失败！");
					return;
				}
			}
		});
	};
	
	//变更客户认证类型
	var _changeCustIdType = function(option){
		var type = $(option).val();
		if(type==0){
			$("#cust").attr("placeHolder","请输入有效的中国电信手机号");
			$("#cust").attr("data-validate","validate(isTelecomSection:请输入有效的中国电信号码) on(blur)");
		}
		else if(type==1){
			$("#cust").attr("placeHolder","请输入合法的身份证号码");
			$("#cust").attr("data-validate","validate(idCardCheck:请准确填写身份证号码) on(blur)");
		}
		else if(type==2){
			$("#cust").attr("placeHolder","请输入合法的军官证");
			$("#cust").attr("data-validate","validate(required:请准确填写军官证) on(blur)");
		}
		else if(type==3){
			$("#cust").attr("placeHolder","请输入合法的护照");
			$("#cust").attr("data-validate","validate(required:请准确填写护照) on(blur)");
		}
		else{
			$("#cust").attr("placeHolder","请输入合法的证件号码");
			$("#cust").attr("data-validate","validate(required:请准确填写证件号码) on(blur)");
		}
		$("#cust").val("");
		_queryCust();
	};
	
	//查询客户
	var _queryCust = function(){
		$("#custQueryForm").off().bind("formIsValid", function(event, form){			
			var _acctNbr = "";
			var _identityNum = "";
			var _identityCd = "";
			var falgValue = $("#cust_id_type").val();
			if(falgValue==0 || falgValue == "cloudId"){
				_acctNbr = $("#cust").val();
			}
			else{
				_identityCd = $("#cust_id_type").val();
				_identityNum = $("#cust").val();
			}
			var param = {
					acctNbr : _acctNbr,
					identityCd : _identityCd,
					identityNum : _identityNum,
					partyName : "",
					custQueryType : $("#custQueryType").val(),
					diffPlace : "maybe",
					areaId : $("#p_areaId").val(),
					query : "acct"  //账户详情查询的页面标志
			};
			if( falgValue == "cloudId" ){
				param.prodClass = CONST.PROD_BIG_CLASS.PROD_CLASS_CLOUD;
			}
			$.callServiceAsHtml(contextPath+"/cust/queryCust",param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done":function(response){
					if(response.code != 0) {
						$.alert("提示","查询失败,稍后重试");
						return;
					}
					if(response.data.indexOf("false") >=0) {
						$.alert("提示","抱歉，没有定位到客户，请尝试其他客户。");
						return;
					}
					$("#custlist").html(response.data).show();
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","查询失败，请稍后再试！");
				}				
			});
		}).ketchup({bindElement:"bt_cust_query"});
	};
	
	//选定客户
	var _chooseCust = function(tr){
		var custName = $(tr).find("td:eq(0)").text();
		var custId = $(tr).find("td:eq(3)").text();
		$("#custName").val(custName).attr("name", custId);
		easyDialog.close();
	};
	
	//重置客户信息
	var _resetCust = function(){
		$("#custName").val("").removeAttr("name");
	};
	
	//变更精确查询条件
	var _changeQueryType = function(option){
		if($(option).val()==1){
			$("#num").attr("placeHolder","请输入有效的中国电信手机号");
		}
		else{
			$("#num").attr("placeHolder","请输入帐户合同号");
		}
	};
	
	//定位帐户
	var _queryAccount = function(){
		if($("#p_areaId_val").val()==""){
			$.alert("提示","请选择所属地区");
			return;
		}
		var queryNum = $.trim($("#num").val());
		if($("#custName").val()=="" && queryNum==""){
			$.alert("提示","请至少再输入以下一个查询条件：所属客户，接入号，合同号");
			return;
		}
		if(queryNum!=""){
			if($("#query_type").val()==1){
				var check = CONST.LTE_PHONE_HEAD.test(queryNum);
				if(check==false){
					$.alert("提示","请输入有效的中国电信手机号");
					return;
				}
			}
		}
		var param = {
				areaId : $("#p_areaId").val()							
		};
		if($("#custName").val()!=""){
			param.custId = $("#custName").attr("name");
		}
		if(queryNum!=""){
			if($("#query_type").val()==1){
				param.accessNumber = queryNum;
			}
			else{
				param.acctCd = queryNum;
			}
		}		
		$.callServiceAsHtmlGet(contextPath+"/acct/queryAccount", param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				if(!response){
					response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>no data return,please try reload.</strong></div>';					
				}
				if(response.data =="fail\r\n"){
					$.alert("提示","查询失败，请稍后再试");
					return;
				}
				if(response.data =="error\r\n"){
					$.alert("提示","数据异常，请联系管理员");
					return;
				}
				$("#acctList").html(response.data).show();	
				$("#acctDetail").hide();
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
		
	}; 
	
	//查询帐户详情
	var _queryAcctDetail = function(_acctId){
		var param = {
				acctId : _acctId,
				areaId : $("#p_areaId").val()
		};
		$.callServiceAsHtmlGet(contextPath+"/acct/queryAcctDetail", param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				if(!response){
					response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>no data return,please try reload.</strong></div>';					
				}
				if(response.data =="fail\r\n"){
					$.alert("提示","查询失败，请稍后再试");
					return;
				}
				if(response.data =="error\r\n"){
					$.alert("提示","数据异常，请联系管理员");
					return;
				}
				$("#acctDetail").html(response.data).show();	
				$("#acctList").hide();
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	//返回按钮
	var _back = function(){
		$("#acctDetail").hide();
		$("#acctList").show();
	};
	
	return{
		areaId : _areaId,
		chooseArea : _chooseArea,
		showQueryCust : _showQueryCust,
		initCustIdType : _initCustIdType,
		changeCustIdType : _changeCustIdType,
		queryCust : _queryCust,
		chooseCust : _chooseCust,
		resetCust : _resetCust,
		changeQueryType : _changeQueryType,
		queryAccount : _queryAccount,
		queryAcctDetail : _queryAcctDetail,
		back : _back
	};
	
})();

$(function(){
	
	account.query.initCustIdType();
	account.query.queryCust();
	
});