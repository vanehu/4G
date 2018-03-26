/**
 * 余额相关
 */
CommonUtils.regNamespace("bill", "balance");

bill.balance = (function(){
	
	var _areaCode = "";
	var _areaId = "";
	var _areaName = "";
	var _phoneNumber = "";
	
	//余额查询
	var _queryBalance = function(){
		if($("#areaName").val()==""){
			$.alert("提示","请先查询并选择地区");
			return;
		}
		if(!$("#areaId").attr("areaCode") || $("#areaId").attr("areaCode")==""){
			$.alert("提示", "请选择本地网（地市级）地区");
			return;
		}
		if(CONST.APP_DESC==0){
			if(!CONST.LTE_PHONE_HEAD.test($.trim($("#phoneNumber").val()))){
				$.alert("提示","号码输入有误！");
			  	return;
			}
		}else{
			if(!CONST.MVNO_PHONE_HEAD.test($.trim($("#phoneNumber").val()))){
				$.alert("提示","号码输入有误！");
			  	return;
			}
		}
		_getBalance();
	};
	
	//获取余额详情列表
	var _getBalance = function(){
		var param = {
				areaCode : $("#areaId").attr("areaCode"),
				phoneNumber : $.trim($("#phoneNumber").val()),
				destinationAttr : "2",   //用户属性 2:移动电话
				queryItemType : $("#balanceType input:radio:checked").val(),     //查询余额类型 0:总余额 1:可提取余额
				queryFlag : $("#queryFlag input:radio:checked").val(),    //查询业务类型 0：按帐户查询 1：按用户查询
				areaId : $("#areaId").val(),
				pageType : $("#pageType").attr("name") //页面类型：查询/支取
		};		
		$.callServiceAsHtmlGet(contextPath+"/bill/queryBalanceDetail", param, {
			"before":function(){
				$.ecOverlay("余额查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				if(response.data =="fail\r\n"){
					$.alert("提示","查询失败，请稍后再试");
					return;
				}
				if(response.data =="error\r\n"){
					$.alert("提示","数据异常，请联系管理员");
					return;
				}
				if(response.code==0){
					$("#balanceDetail").html(response.data).show();
					_areaCode = $("#areaId").attr("areaCode");
					_areaId = $("#areaId").val();
					_areaName = $("#areaName").val();
					_phoneNumber = $.trim($("#phoneNumber").val());
					if($("#pageType").attr("name")=="pay"){
						easyDialog.close();	
					}										
				}
				else{						
					if(response.code==-2){
						$.alertM(response.data);							
					}
					else{
						$.alert("提示","余额查询异常");							
					}						
				}					
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	//转至充值页面
	var _goToCashPerpare = function(){
		var params = {
				areaCode : _areaCode,
				accNbr : _phoneNumber,
				areaId : _areaId,
				areaName : _areaName
			};
			var url=contextPath+"/bill/charge/cashDeal";
			$.callServiceAsHtmlGet(url, params, {
				"before":function(){
					$.ecOverlay("<strong>正在处理中,请稍等会儿....</strong>");
				},"always":function(){
					$.unecOverlay();
				},	
				"done" : function(response){
					if(response.code != 0) {
						$.alert("提示"," 充值页面加载失败，请稍后重试");
						return;
					}
					if($.trim(response.data)!="0"){
						var content$=$("#balanceMain");
						content$.html(response.data).show();
					}else{
						$.alert("提示","无权访问充值页面");
						return;
					}
				}
			});
	};
		
	//余额支取：产品鉴权弹出框
	var _prodAuth = function(){
		if($("#areaName").val()==""){
			$.alert("提示","请先查询并选择地区");
			return;
		}
		var check = CONST.LTE_PHONE_HEAD.test($.trim($("#phoneNumber").val()));
		if(check==false){
			$.alert("提示","请输入有效的中国电信手机号");
			return;
		}
		easyDialog.open({
			container : "prodAuth"
		});
		$("#prodPwd").val("");
		$(".easyDialogclose").click(function(){
			easyDialog.close();
		});
	};
	
	//余额支取：产品鉴权通过 ? 查询余额 : 返回并提示
	var _afterAuth = function(){
		var param = {
				accessNumber : $.trim($("#phoneNumber").val()),
				prodPwd : $("#prodPwd").val(),
				areaId : $("#areaId").val()
		};
		var jr = $.callServiceAsJson(contextPath+"/order/prodAuth", param);		
		//鉴权通过，开始查询余额
		if(jr.code==0){
			_getBalance();			
		}
		else{
			if(jr.code==-2){
				$.alertM(jr.data);
			}
			else{
				$.alert("提示",jr.data);
			}
		}
	};
		
	//余额支取：余额提取
	var _payBalance = function(_queryFlag){
		if(_queryFlag=="1"){
			if(_phoneNumber==""){
				$.alert("提示","请先进行产品鉴权");
				return;
			}
			if(!($("#feeAmount").val()>0)){
				$.alert("提示","无可提取的余额");
				return;
			}
			$.confirm("信息","手机号："+_phoneNumber+"<br/>提取余额："+$("#feeAmount").val()/100+"元", {
				yes : function(){
					var param = {
							areaCode : _areaCode,
							phoneNumber : _phoneNumber,
							destinationAttr : "2",
//							areaId : _areaId,
							feeAmount : $("#feeAmount").val(),
							queryFlag : _queryFlag
					};
					$.callServiceAsJson(contextPath+"/bill/payBalance", param, {
						"before":function(){
							$.ecOverlay("<strong>处理中,请稍等....</strong>");
						},
						"always":function(){
							$.unecOverlay();
						},	
						"done":function(response){
							if(response.code==0){
								$("#totalBalance").html(response.data/100+"元");
								$("#payBalance").remove();
								$("#balanceList").hide();
								_phoneNumber = "";
								$.alert("提示","余额提取成功");
							}
							else{
								if(response.code==1){
									$.alert("提示","余额提取失败："+response.data);
									return;
								}
								else if(response.code==-2){
									$.alertM(response.data);
								}
							}						
						}
					});
				},
				no : function(){
					return;
				}
			},"question");
		}
		else{
			$.alert("提示", "请查询可用余额再进行余额提取动作");
			return;
		}
	};
	
	return {
		queryBalance : _queryBalance,
		getBalance : _getBalance,
		goToCashPerpare : _goToCashPerpare,		
		prodAuth : _prodAuth,
		afterAuth : _afterAuth,
		payBalance : _payBalance
	};
	
})();

//初始化
$(function(){
	
});