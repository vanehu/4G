CommonUtils.regNamespace("product", "query");

/**
 * 产品通用查询
 */
product.query = (function(){
		
	var _areaId = "";
	
	//页面初始化
	var _init = function(){
		$("#accurate").attr("checked","checked");
		$("#num").attr("disabled", false);
		$("#custName").attr("disabled", true);
		
		$("#accurate").change(function(){
			if($("#accurate").attr("checked")){
				$("#num").attr("disabled", false);
				$("#custName").attr("disabled", true);
			}
			else{
				$("#num").attr("disabled", true);
				$("#custName").attr("disabled", false);
			}
		});
		
		$(".easyDialogclose").click(function(){
			easyDialog.close();			
		});						
	};
	
	//地区选择（系统管理维度列表弹出框）	
	var _chooseArea = function(){
		order.area.chooseAreaTreeManger("prod/preProdQuery","p_areaId_val","p_areaId",3);
	};
	
	//客户查询（弹出框）
	var _showQueryCust = function(){
		if($("#p_areaId_val").val()!=""){
			if($("#p_areaId").val().substring(3, 7)=="0000"){
				$.alert("提示","请选择本地网（地市级）地区进行查询");
				return;
			}
		}else{
			$.alert("提示","请先选择所属地区再进行客户查询");
			return;
		}
		easyDialog.open({
			container : "d_cust"
		});
		$("#cust").val("");
		$("#custlist").html("");
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
			var flagValue = $("#cust_id_type").val();
			if( flagValue ==0 || flagValue=="cloudId"){
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
					query : "prod"  //产品通用查询的页面标志
			};
			if(flagValue=="cloudId"){
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
		//easyDialog.close();
		// #1186864 easyDialog.min.js重复引入
		var $easyDialogId = $(tr).parents("#d_cust").parent("#easyDialogBox");
		if($easyDialogId != undefined && $easyDialogId.length > 0){
			$("#easyDialogBox").css('display','none');
			$('#easyDialogBox').prev('#overlay').css('display','none');
		}
	};
	
	//产品信息查询
	var _queryProduct = function(page){
	
		var _curPage = 1;
		if(page>0){
			_curPage = page;
		}
		var _pageSize = 12;		
		var param = {
				curPage : _curPage,
				pageSize : _pageSize,
				areaId : $("#p_areaId").val()
			};
					
		if($("#accurate").attr("checked")){//使用接入号精确查询
			if($("#p_areaId_val").val()!=""){
				if($("#p_areaId").val().substring(3, 7)=="0000"){
					$.alert("提示","请选择本地网（地市级）地区进行查询");
					return;
				}
			}else{
				$.alert("提示","请先选择所属地区再进行客户查询");
				return;
			}
			var _acctNbr = $.trim($("#num").val());
			var check = CONST.LTE_PHONE_HEAD.test(_acctNbr);
			if(check==false){
				$.alert("提示","若要进行精确查询，请输入有效的中国电信手机号");
				return;
			}
			param.acctNbr = _acctNbr;
		}else{//使用客户下查询
			if($("#custName").val()==""){
				$.alert("提示","请先定位客户再进行查询");
				return;
			}
			var _custId = $("#custName").attr("name");
			param.custId = _custId;
			param.acctNbr = "";
		}
		$.callServiceAsHtmlGet(contextPath+"/prod/prodQuery", param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				if(!response){
					response.data='<div style="margin:2px 0 2px 0;width:100%,height:100%;text-align:center;"><strong>no data return,please try reload.</strong></div>';					
				}
				if(response.data =="fail\r\n"){
					$.alert("提示","查询失败，请稍后再试");
					return;
				}
				if(response.data =="error\r\n"){
					$.alert("提示","数据异常，请联系管理员");
					return;
				}
				$("#prodList").html(response.data).show();	
				$("#prodDetail").hide();
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});	
	};
	
	//产品实例详情查询
	var _queryProdDetail = function(_prodId, _acctNbr, _areaId){
		
		var param = {
				prodId : _prodId,
				acctNbr : _acctNbr,
				areaId : _areaId
		};
		$.callServiceAsHtmlGet(contextPath+"/prod/prodDetailQuery", param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				if(!response){
					response.data='<div style="margin:2px 0 2px 0;width:100%,height:100%;text-align:center;"><strong>no data return,please try reload.</strong></div>';					
				}
				if(response.data =="fail\r\n"){
					$.alert("提示","查询失败，请稍后再试");
					return;
				}
				if(response.data =="error\r\n"){
					$.alert("提示","数据异常，请联系管理员");
					return;
				}
				$("#prodDetail").html(response.data).show();
				$("#prodInfo h2").html("产品详情");
				$("#prodInfo").show();
				$("#prodList").hide();
				$("#orderedprod").hide();
				$("#orderContent").hide();
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});	
	};
	
	//切换帐户标签
	var _changeAcct = function(n){		
		$("#acct_tab").find("li[class=setcon]").removeClass();
		$("#acct_tab_"+n).addClass("setcon");
		$("#acct_div").find("div[class=show]").removeClass().hide();		
		$("#acct_div_"+n).addClass("show").show();		
	};
	
	//返回按钮
	var _back = function(){
		$("#prodDetail").hide();
		$("#prodInfo").hide();
		$("#prodList").show();
		$("#orderedprod").show();
		$("#orderContent").show();
	};
	
	return{
		init : _init,
		areaId : _areaId,
		chooseArea : _chooseArea,
		showQueryCust : _showQueryCust,
		initCustIdType : _initCustIdType,
		changeCustIdType : _changeCustIdType,
		queryCust : _queryCust,
		chooseCust : _chooseCust,
		queryProduct : _queryProduct,
		queryProdDetail : _queryProdDetail,
		changeAcct : _changeAcct,
		back : _back
	};
	
})();

$(function(){
	
	product.query.init();
	product.query.initCustIdType();
	product.query.queryCust();
	
});