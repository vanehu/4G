/**
 * 客户资料管理
 */
CommonUtils.regNamespace("order", "uiCust");

order.uiCust = (function(){
	var _called = false;
	var _choosedCustInfo = {};
	var _createCustInfo = {};
	var _custInfo = null;
	var _authFlag = null;
	var _fromProvFlag = "0"; //省份甩单标志
	var _provIsale = null; //省份isale流水号
	//客户鉴权跳转权限
	var _jumpAuthflag="";
	//客户属性
	var _partyProfiles =[];
	//客户属性分页列表
	var _profileTabLists =[];
	
	var _getCustInfo = function() {
		return _custInfo;
	};
	var _orderBtnflag="";
	
	var _packageInfo={
		provIsale:"",
		redirectUri:"",
		isFee:"",
		reloadFlag:""
	}

	var _orderInfo;
	
	var showDialogInfo=function(content){
		$.ligerDialog.waitting("<div style='width:100%;text-align:center;font-size:15px;'>"+content+"</div>");
	}
	
	var _showPackageDialog=function(msg){
		var html="<table class=\"contract_list rule\">";
		html+='<thead><tr> <td colspan="2">提示</td></tr></thead></table>';
		html+="<div id=\"rules_div\" height=\"height:140px;\">";
		html+='<table width="100%" height="120px;" border="0" cellspacing="0" cellpadding="0">';
		html+='<tr>';
		html+='<td align="right"></td>';
		html+="<td><div class=\"rule_font\" style=\"width:100%;font-size:15px; text-align:center;\">"+msg+"</div></td>";
		html+='</tr>';
		html+='</table>';
		html+='</div>';
		easyDialog.open({
			container : 'packageTip_dialog'
		});
		$("#infoTipContent").html("");
		$("#infoTipContent").html(html);
	};
	
	var _packageQuery=function(){
		//开始可选包前进行重载校验 
		var isReload=OrderInfo.provinceInfo.reloadFlag;
		
		if(isReload=="N"){
			if(OrderInfo.reloadOrderInfo==null || OrderInfo.reloadOrderInfo=="" || OrderInfo.reloadOrderInfo=="undefined"){
				$.alert("提醒","二次加载数据信息丢失!");
				return;
			}
			
			var resultCode=OrderInfo.reloadOrderInfo.resultCode;
			
			var resultMsg=OrderInfo.reloadOrderInfo.resultMsg;
			
			if(resultCode==null || resultCode=="" || resultCode=="undefined"){
				$.alert("提醒","二次加载数据信息丢失!");
				return;
			}
			
			if(OrderInfo.reloadOrderInfo.result.orderList==null || OrderInfo.reloadOrderInfo.result.orderList==""){
				$.alert("提醒",resultMsg);
				return;
			}
			
			var custOrderAttrs =OrderInfo.reloadOrderInfo.result.orderList.orderListInfo.custOrderAttrs;
			
			var isRight="0";
			
			$.each(custOrderAttrs,function(){
				if(this.itemSpecId=="30010024"){
					if(this.value!="14"){
						isRight="1";
					}
				}
			});
			
			if(isRight=="1"){
				$.alert("提醒","不是可选包变更受理流水号，请重试!");
				return;
			}
			
			if(resultCode=="-1" || resultCode=="2"){
				$.alert("提醒",resultMsg);
				return;
			}
		}
		
		var url=contextPath+"/order/createorderlonger";
		var response = $.callServiceAsJson(url, {});
		if(response.code==0){
			OrderInfo.custorderlonger=response.data;
		}
		
		_custLookforButton();
	};
	
	//客户定位开始 [1]
	var _custLookforButton = function() {
		var identityCd="";
		var idcard="";
		var diffPlace="";
		var acctNbr="";
		var identityNum="";
		var queryType="";
		var queryTypeValue="";
		identityCd=$("#p_cust_identityCd").val();
		identityNum=$.trim($("#p_cust_identityNum").val());
		//判断是否是号码或身份证输入

		//省份甩单定位客户不需要进行客户鉴权
		if(order.cust.mgr.fromProvFlag == "1" || (identityCd!=-1 && CONST.getAppDesc()!=0)){
			identityCd=$("#p_cust_identityCd").val();
			_authFlag="1";
		}else{
			//4G所有证件类型定位都需要客户鉴权
			_authFlag="0";
		}
		if(identityCd==-1){
			acctNbr=identityNum;
			identityNum="";
			identityCd="";
		}else if(identityCd=="acctCd"||identityCd=="custNumber"){
			acctNbr="";
			identityNum="";
			identityCd="";
			queryType=$("#p_cust_identityCd").val();
			queryTypeValue=$.trim($("#p_cust_identityNum").val());

		}
		diffPlace=$("#DiffPlaceFlag").val();
		
		//旧地市，获取的工号默认地市
		//areaId=$("#p_cust_areaId").val();
		
		//现在修改为使用省份传输地市
		areaId=$("#custAreaId_").val();
		
		if(areaId==null || areaId=="" || areaId=="null" || areaId=="undefined"){
			$.alert("提示","用于客户定位的地市为空，请重试!");
			return;
		}
		
		//lte进行受理地区市级验证
		if(CONST.getAppDesc()==0&&areaId.indexOf("0000")>0){
			$.alert("提示","省级地区无法进行定位客户,请选择市级地区！");
			return;
		}
		var param = {
			"acctNbr"		:acctNbr,
			"identityCd"	:identityCd,
			"identityNum"	:identityNum,
			"partyName"		:"",
			"custQueryType"	:$("#custQueryType").val(),
			"diffPlace"		:diffPlace,
			"areaId" 		:areaId,
			"queryType" 	:queryType,
			"queryTypeValue":queryTypeValue
		};
		$.callServiceAsHtml(contextPath+"/token/pad/cust/queryCust",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if (response.code == -2) {
					return;
				}
				_queryCallBack(response);
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			},"always":function(){
				$.unecOverlay();
				$("#usersearchbtn").attr("disabled",false);
			}
		});
	};
	
	//客户查询列表 [2]
	var _queryCallBack = function(response) {
		if(response.data.indexOf("false") >=0) {
			$.alert("提示","抱歉，没有定位到客户，请尝试其他客户.");
			return;
		}
		var _qry_result = $("#div_user_qry_result");
		
		_qry_result.find("ul").html(response.data);
		$("#a_cust_qry_back").off("tap").on("tap",function(event) {
			_authFlag="";
		});
		
		$.jqmRefresh(_qry_result);
	};
	
	//客户列表点击 [3]
	var _showCustAuth = function(scope) {
		var _this = $(scope);
		_choosedCustInfo = {
			custId 			: _this.attr("custId"),
			partyName 		: _this.attr("partyName"),
			idCardNumber 	: _this.attr("idCardNumber"),
			identityName 	: _this.attr("identityName"),
			areaName 		: _this.attr("areaName"),
			areaId 			: _this.attr("areaId"),
			identityCd 		: _this.attr("identityCd"),
			addressStr 		: _this.attr("addressStr"),
			norTaxPayer 	: _this.attr("norTaxPayer"),
			segmentId 		: _this.attr("segmentId"),
			segmentName 	: _this.attr("segmentName"),
			custFlag 		: _this.attr("custFlag"),
			vipLevel 		: _this.attr("vipLevel"),
			vipLevelName 	: _this.attr("vipLevelName")
		};
		if(_authFlag=="0"){
			if(order.cust.mgr.authType == '00'){//动态追加,内部没定义
				$("#custAuthTypeName").html("客户密码：");
			} else {
				$("#custAuthTypeName").html("产品密码：");
			}
			if(order.cust.mgr.jumpAuthflag=="0"){
				$("#jumpAuth").show();
				$("#jumpAuth").off("tap").on("tap",_jumpAuth);
			}else{
				$("#jumpAuth").hide();				
			}
			$("#authPassword").val("");
			$("#custAuthbtn").off("tap").on("tap",_bindChkAuth);
			
			//不需要弹出验证弹框
			//$("#dlg-chk-auth").popup("open");
			
			//直接无需验证
			_jumpAuth();
		} else{
			_custAuth(scope);
		}
	};
	
	//跳过验证 [4]
	var _jumpAuth = function() {
		var param = _choosedCustInfo;
		param.authFlag="1";
		$.callServiceAsHtml(contextPath+"/pad/cust/custAuth",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","客户鉴权失败,稍后重试");
					return;
				}
				
				_custInfo = param;
				OrderInfo.boCusts.prodId=-1;
				OrderInfo.boCusts.partyId=_choosedCustInfo.custId;
				OrderInfo.boCusts.partyProductRelaRoleCd="0";
				OrderInfo.boCusts.state="ADD";
				OrderInfo.boCusts.norTaxPayer=_choosedCustInfo.norTaxPayer;
				
				OrderInfo.cust = _choosedCustInfo;
				
				_custAuthCallBack(response);
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	
	//鉴权回调 [5]
	var _custAuthCallBack = function(response) {
		if(_authFlag=="0"){
			$("#dlg-chk-auth").popup("close");
		}
		//隐藏查询选项,展示查询后结果
		$("#custQueryFirstForm").hide();
		$("#custInfo").html(response.data).show().enhanceWithin();
		
		if((OrderInfo.boCusts.partyId != "-1" && OrderInfo.boCusts.partyId != ""	
			 && OrderInfo.boCusts.partyId != undefined) && order.prodModify.lteFlag == true){
			$("#a-cust-modify").hide();
		}else{
			$("#a-cust-modify").show();
			$("#a-cust-modify").off("tap").on("tap",order.prodModify.showCustInfoModify);
		}
		//绑定事件
		$("#a-cust-rechk").off("tap").on("tap",_custReset);
		$("#a-qry-cust-prod").off("tap").on("tap",_btnQueryCustProdMore);
		$("#cCustName").val("");
		$("#cCustIdCard").val("");
		
		main.home.hideMainIco();
		
		//查询客户产品[5-1]
		_btnQueryCustProdMore();
	};
	
	//已订购业务 页面 [6]
	var _btnQueryCustProdMore=function(){
		if(OrderInfo.cust.custId==-1){
			$.alert("提示","新建客户无法查询已订购业务！");
			return;
		}		
		//初次查询
		if(_orderBtnflag==""){
			_btnQueryCustProdPrepare();
			_orderBtnflag="1";
			//二次进入
		}else if(_orderBtnflag=="1"){
			$("#dlg_cust_prod").popup("open",{transition:"slide"});
			_orderBtnflag="1";
			//关闭
		}else{
			$("#dlg_cust_prod").popup("close");
			_orderBtnflag="1";
		}
	};
	
	//已订购业务查询 入口 [7]
	_btnQueryCustProdPrepare = function(){
		$.callServiceAsHtmlGet(contextPath+"/token/pad/cust/orderProdPrepare.html",{"diffPlaceFlag":$("#diffPlaceFlag").val()},{
			"before":function(){
				//$.ecOverlay("<strong>查询中,请稍等...</strong>");
			},
			"always":function(){
				//$.unecOverlay();
			},
			"done" : function(response){
				if(!response || response.code != 0) {
					$.alert("提示","已订购业务查询失败,稍后重试");
					return;
				}
				$.popup("#dlg_cust_prod",response.data,{
					width:$(window).width()-200,
					height:$(window).height(),
					contentHeight:$(window).height()-120,
					afterClose:function(){},
					cache:true
				});
				$(".ui-panel-inner > .ui-listview").height($(window).height());
				_btnQueryCustProd(1);
			}
		});
	}
	
	//已订购业务查询分页   [8]
	var _btnQueryCustProd=function(curPage,scroller){
		//收集参数
		var param={};
		if(!_choosedCustInfo || !$.isPlainObject(_choosedCustInfo) || $.isEmptyObject(_choosedCustInfo)){
			param.custId="";
		}else{
			param.custId=_choosedCustInfo.custId;
			param.areaId =$("#area").attr("areaId");
		}
		//产品号码查询条件
		if($("#accNbrQuery").length == 1){
			param.acctNbr=$.trim($("#accNbrQuery").val());
			if(CONST.getAppDesc()==0){
				param.areaId=$("#p_cust_areaId").val();
			}
			//是否指定号码
		} else if($("#isAppointNum").attr("value")=="1"){
			param.acctNbr=$.trim($("#p_cust_identityNum").val());
			if(CONST.getAppDesc()==0){
				param.areaId=$("#p_cust_areaId").val();
			}
		}else {
			param.acctNbr="";
		}
		param.pageSize="8";
		param.curPage=curPage;
		//param.diffPlaceFlag=$("#diffPlaceFlag").val();
		if(!(param.custId) || param.custId==""){
			$.alert("提示","无法查询已订购产品");
			return;
		}
		
		//获取查询号码[8-1]
		param.acctNbr=OrderInfo.provinceInfo.mainPhoneNum;
		
		//订购产品查询
		var url = contextPath+"/pad/cust/orderProdSub";
		$.callServiceAsHtmlGet(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response || response.code != 0) {
					$.alert("提示","查询失败,稍后重试");
					return;
				}
				//填充数据,
				var ul$ = $("#dlg_cust_prod").find("ul:first");
				if(curPage == 1)ul$.html(response.data);
				else ul$.append(response.data);
				ul$.listview().listview("refresh");
				//绑定每行合约tap事件 父级
				ul$.find("li").off("tap").on("tap",function(){
					var _this = $(this);
					if(_this.hasClass("multi")){
						if(_this.next(".multidiv").is(":hidden")){
							_this.next(".multidiv").show().siblings(".multidiv").hide();
						} else {
							_this.next(".multidiv").hide().siblings(".multidiv").hide();
						}
					}
					_chk2ndOrderFinish(this,function(){
						_this.addClass("userorderlistlibg").siblings().removeClass("userorderlistlibg");
						$("#div_2nd_order").panel( "open" );
					});
				});
				//子级
				ul$.find("div.multidiv li").off("tap").on("tap",function(){
					_chk2ndOrderFinish(this,function(){
						$(this).addClass("userorderlistlibg").siblings().removeClass("userorderlistlibg").parent().siblings("li").removeClass("userorderlistlibg");
						$("#div_2nd_order").panel( "open" );
						order.prodModify.getChooseProdInfo();
					});
				});
				//如果存在数据,默认选中首行
				ul$.find("li:first").trigger("tap").next("div.multidiv li:first").trigger("tap");
				
				order.prodModify.getChooseProdInfo();
				
				//进入具体的功能页面[8-2]
				//判断获取客户业务信息是否正确
				if($("#searchInfos_") && $("#searchInfos_").val()=="0"){
					order.prodModify.orderAttachOffer();
				}
			}
		});	
	};
	
	//绑定鉴权事件
	var _bindChkAuth = function(){
		$('#custAuthForm').off("formIsValid").on('formIsValid', function(event, form) {
			var param = _choosedCustInfo;
			param.prodPwd = $.trim($("#authPassword").val());
			param.accessNumber=_choosedCustInfo.accessNumber;
			param.authFlag=_authFlag;
			$.callServiceAsHtml(contextPath+"/cust/custAuth",param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
				},"done" : function(response){
					if (response.code == -2) {
						return;
					}
					if(response.data.indexOf("false") >=0) {
						$.alert("提示","抱歉，您输入的密码有误，请重新输入。");
						return;
					}
					//判断能否转为json，可以的话返回的就是错误信息
					try {
						var errorData = $.parseJSON(response.data);
						$.alertMore("异常信息", errorData.resultMsg, errorData.errorStack,"error");
						return;
					} catch(e){
						
					}
					_custInfo = param;
					OrderInfo.boCusts.prodId=-1;
					OrderInfo.boCusts.partyId=_choosedCustInfo.custId;
					OrderInfo.boCusts.partyProductRelaRoleCd="0";
					OrderInfo.boCusts.state="ADD";
					OrderInfo.boCusts.norTaxPayer=_choosedCustInfo.norTaxPayer;
					
					OrderInfo.cust = _choosedCustInfo;
					_custAuthCallBack(response);
				},"always":function(){
					$.unecOverlay();
				}
			});
		}).ketchup({bindElement:"custAuthbtn"});
	}
	//客户类型选择事件 ok
	var _partyTypeCdChoose = function(scope,id) {
		var partyTypeCd=$(scope).val();
		_certTypeByPartyType(partyTypeCd,id);
		//创建客户确认按钮
		_custCreateButton();

	};
	//客户类型关联证件类型下拉框     ok
	var _certTypeByPartyType = function(_partyTypeCd,id){
		var _obj = $("#"+id);
		$.callServiceAsJson(contextPath+"/cust/queryCertType", {"partyTypeCd":_partyTypeCd}, {
			"before":function(){
			},"done" : function(response){
				if (response.code == -2) {
					$.alertM(response.data);
					return false;
			  	}
			   	if (response.code == 1002) {
					$.alert("错误","根据员工类型查询员工证件类型无数据,请配置","information");
					return;
			   	}
			   	if(response.code==0){
					var data = response.data ;
					if(data!=undefined && data.length>0){
						//去除重复的证件类型编码
						var uniData = [];
						for(var i=0;i<data.length;i++){
							var unique = true;
							for(var j=0;j<uniData.length;j++){
								unique = unique && data[i].certTypeCd != uniData[j].certTypeCd;
								if(!unique){
									break;
								}
							}
							if(unique){
								uniData.push(data[i]);
							}
						}
						for(var i=0;i<uniData.length;i++){
							var certTypedate = uniData[i];
							_obj.append("<option value='"+certTypedate.certTypeCd+"' >"+certTypedate.name+"</option>");
						}
						//jquery mobile 需要刷新才能生效
						_obj.selectmenu().selectmenu('refresh');
						if(id=='identidiesTypeCd'){
							//创建客户证件类型选择事件
							_identidiesTypeCdChoose($("#"+id).children(":first-child"),"cCustIdCard");
						}
					}
				}
			},fail:function(response){
			},always:function(){
				
			}
	   });
	};
	//客户定位证件类型选择事件  ok
	var _custidentidiesTypeCdChoose = function(scope,id) {
		var identidiesTypeCd=$(scope).val();
		if(identidiesTypeCd==-1){
			$("#"+id).attr("placeHolder","请输入接入号码");
			$("#"+id).attr("data-validate","validate(required:请准确填写接入号码) on(blur)");
		}else if (identidiesTypeCd==1){
			$("#"+id).attr("placeHolder","请输入身份证号码");
			$("#"+id).attr("data-validate","validate(idCardCheck:请准确填写身份证号码) on(blur)");
		}else if(identidiesTypeCd==2){
			$("#"+id).attr("placeHolder","请输入军官证");
			$("#"+id).attr("data-validate","validate(required:请准确填写军官证) on(blur)");
		}else if(identidiesTypeCd==3){
			$("#"+id).attr("placeHolder","请输入护照");
			$("#"+id).attr("data-validate","validate(required:请准确填写护照) on(blur)");
		}else{
			$("#"+id).attr("placeHolder","请输入证件号码");
			$("#"+id).attr("data-validate","validate(required:请准确填写证件号码) on(blur)");
		}
		if(identidiesTypeCd!=-1){
			$("#isAppointNum").val("0").slider().slider("refresh");
		}
		_custLookforButton();

	};
	//创建客户证件类型选择事件
	var _identidiesTypeCdChoose = function(scope,id) {
		var identidiesTypeCd=$(scope).val();
		var _obj = $("#"+id);
		if(identidiesTypeCd==1){
			_obj.attr("placeHolder","请输入合法身份证号码");
			_obj.attr("data-validate","validate(idCardCheck18:请输入合法身份证号码) on(blur)");
		}else if(identidiesTypeCd==2){
			_obj.attr("placeHolder","请输入合法军官证");
			_obj.attr("data-validate","validate(required:请准确填写军官证) on(blur)");
		}else if(identidiesTypeCd==3){
			_obj.attr("placeHolder","请输入合法护照");
			_obj.attr("data-validate","validate(required:请准确填写护照) on(blur)");
		}else{
			_obj.attr("placeHolder","请输入合法证件号码");
			_obj.attr("data-validate","validate(required:请准确填写证件号码) on(blur)");
		}
		_custCreateButton();

	};
	
	//创建客户确认按钮
    var _custCreateButton = function() {
	    $('#custCreateForm').off('formIsValid').on('formIsValid',function(event) {
	    	var url=contextPath+"/order/createorderlonger";
			var response = $.callServiceAsJson(url, {});
			if(response.code==0){
				OrderInfo.custorderlonger=response.data;
			}
			_checkIdentity();
	     }).ketchup({bindElement:"btn_cust_create_save"});
    };
	
	// 客户重新定位 ok
	var _custReset = function() {
		//填单页面
		//if(0!=OrderInfo.order.step){
			window.location.reload();
		//}
		$("#custQueryFirstForm").show();
		$("#custInfo").hide();
		$("#p_cust_identityNum").val("");
		$("#authPassword").val("");
		_authFlag="";
		OrderInfo.boCusts.partyId="";
		//新建客户
		OrderInfo.boCustInfos.name="";
		OrderInfo.boCustIdentities.identityNum="";
		OrderInfo.cust = {
			custId:-1,	
			custName : "",
			areaId:""
		};
		//定位客户
		OrderInfo.boCusts.prodId=-1;
		OrderInfo.boCusts.partyId="";
		OrderInfo.boCusts.partyProductRelaRoleCd="0";
		OrderInfo.boCusts.state="ADD";
		OrderInfo.cust = "";
		//已订购查询是不是查询标志
		_orderBtnflag="";
		//填单步骤
		OrderInfo.order.step=0;
		if((CONST.getAppDesc()!=0)&&($("#custModifyId").is(":hidden"))){
			$("#a-cust-modify").show();
		}
		
	};
	
	//客户鉴权 ok
	var _custAuth = function(scope) {
		var param = _choosedCustInfo;
		param.prodPwd = $.trim($("#authPassword").val());
		param.authFlag=_authFlag;
		$.callServiceAsHtml(contextPath+"/cust/custAuth",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","客户鉴权失败,稍后重试");
					return;
				}
				_custInfo = param;
				OrderInfo.boCusts.prodId=-1;
				OrderInfo.boCusts.partyId=_choosedCustInfo.custId;
				OrderInfo.boCusts.partyProductRelaRoleCd="0";
				OrderInfo.boCusts.state="ADD";
				OrderInfo.boCusts.norTaxPayer=_choosedCustInfo.norTaxPayer;
				
				OrderInfo.cust = _choosedCustInfo;
				_custAuthCallBack(response);
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	
	//创键客户 ok
	var _showCustCreate = function() {
		var areaId=$("#p_cust_areaId").val();
		if(areaId.indexOf("0000")>0){
			$.alert("提示","前页受理地区为省级地区无法进行创建,请先选择市级地区！");
			return;
		}
		$.callServiceAsHtmlGet(contextPath+"/pad/cust/create.html",{},{
			"done" : function(response){
				if (!response || !response.data) {
					return;
				}
				//统一弹出框
				var popup = $.popup("#div_cust_create",response.data,{
					cache:true,
					width:$(window).width()-200,
					height:$(window).height(),
					contentHeight:$(window).height()-120,
					afterClose:function(){if($.ketchup) $.ketchup.hideAllErrorContainer($("#custCreateForm"));}
				});
				//由于脚本静态,所以要清理之前有可能创建的客户资料信息
				$("#div_cust_create input[type='text']").val("");
				//初始化页面数据
				_partyTypeCdChoose($("#partyTypeCd").children(":first-child"),"identidiesTypeCd");
				_spec_parm_show();
				//更多属性默认隐藏,并绑定打开事件
				popup.find("div[data-role='collapsible']").collapsible({
				  	collapsed: true,
					collapse: function( event, ui ) {
						$("#contactName").attr("data-validate","");
						_custCreateButton();
					},
				  	expand: function(event,ui) {
						$("#contactName").attr("data-validate","validate(required:请准确填写联系人名称) on(blur)").attr("placeholder","请准确填写联系人名称");
						_custCreateButton();
				  	}
				});
			}});
	};
	
	var _linkSelectPlan=function(selected){
		//二层选择取消
		$("#plan2ndDiv tbody tr").removeClass("plan_select2");
		//勾取消
		$("#plan2ndDiv tbody tr").children(":first-child").next().html("");
		$(selected).addClass("plan_select2");
		//打勾操作
		var nike="<i class='select'></i>";
		$(selected).children(":first-child").next().html(nike);
		order.prodModify.getChooseProdInfo();
		
	};
	
	//判断二次业务办理时,切换已订购
	var _chk2ndOrderFinish = function(obj,cb){
		if(1==OrderInfo.order.step&&(!$(obj).hasClass("userorderlistlibg"))){
			$.confirm("确认","你已重新选择号码，需跳转至上一步，是否确认?",{
				yes:function(){
					_cancel();
					OrderInfo.order.step=0;
					cb.apply(this,[]);
				},
				no:function(){}
			});
		}else if(2==OrderInfo.order.step&&(!$(obj).hasClass("userorderlistlibg"))){
			$.confirm("确认","你已重新选择号码，需取消订单，是否确认?",{
				yes:function(){
					SoOrder.orderBack();
					_cancel();
					OrderInfo.order.step=0;
					cb.apply(this,[]);
				},
				no:function(){}
			});
		}else{
			cb.apply(this,[]);
		}
	}
	
	//定位客户选择地区 ok
	var _chooseArea = function(){
		order.pad.area.chooseAreaTree("order/prepare","p_cust_areaId_val","p_cust_areaId",3);
	};
	//客户信息查询户选择地区
	var _preQueryCustChooseArea = function(){
		order.area.chooseAreaTreeManger("cust/preQueryCust","p_areaId_val","p_areaId",3);
	};
	//异地定位客户选择地区
	var _chooseAllArea = function(){
		order.area.chooseAreaTreeAll("p_cust_areaId_val","p_cust_areaId",3,"limitProvince");
	};
	//新建客户选择地区
	var _newCustChooseArea = function(){
		order.area.chooseAreaTree("order/prepare","p_ncust_areaId_val","p_ncust_areaId",3);
	};
	//已订购选择地区
	var _prodChooseArea = function(){
		order.area.chooseAreaTree("order/prepare","prodareaName","prodareaid",3);
		order.prodModify.choosedProdInfo.areaId=$("#prodareaid").val();
	};
	//定位客户证件类型下拉框 ok
	var _init = function(){
		$("#p_cust_identityCd").off("change").on("change",function(){
			_custidentidiesTypeCdChoose($(this).find("option:selected"),"p_cust_identityNum");
			$("#p_cust_identityCd").selectmenu().selectmenu('refresh');
		})
		_certTypeByPartyType("-1","p_cust_identityCd"); //客户定位也使用根据客户类型查询证件类型接口，p_cust_identityCd=-1表示查询所有已关联的证件类型
		$("#isAppointNum").off("change").on("change",_isAppointNum);
		//省份甩单，自动定位客户
		_checkAutoCustQry();
		//绑定创建客户事件
		$("#a_user_create").off("tap").on("tap",_showCustCreate);
		//绑定查询校验事件
		_custLookforButton();
	};
	//使用带入的客户信息自动定位客户 ok
	var _checkAutoCustQry = function(){
		if($("#fromProvFlag").length && $("#fromProvFlag").val() == "1"){
			order.cust.mgr.fromProvFlag = "1";
			order.cust.mgr.provIsale = $("#provIsale").val();
			$("#p_cust_areaId_val").val("");
			$("#p_cust_areaId").val($("#provAreaId").val());
			$("#p_cust_identityCd").val($("#provIdentityCd").val());
			$("#p_cust_identityNum").val($("#provIdentityNum").val());
			if($("#provIdentityCd").val()!=-1){
				$("#isAppointNum").attr("checked",false);
			}
			$("#a_user_search").click();
		} else {
			order.cust.fromProvFlag = "0";
			order.cust.provIsale = null;
		}
	};
	//客户所有属性初始化-展示 ok
	var _spec_parm_show = function(){
		$.callServiceAsHtmlGet(contextPath + "/pad/cust/partyProfileSpecList",{}, {
			"before":function(){
				$.ecOverlay("<strong>加载更多属性,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},"fail":function(){
				$.alert("提示","属性加载异常,请稍后重试.");
				$.unecOverlay();
			},
			"done" : function(response){
				if (response.code == -2) {
					return;
				}
				var pp = $("#partyProfile").html(response.data);
				$("#otabs li").on("tap",function(){_changeLabel($(this));});
				$.jqmRefresh(pp);
			}
		});	
		
	};
	//客户信息查询定位客户
	var _queryCust = function(){
		var identityCd="";
		var acctNbr="";
		var identityNum="";
		identityCd=$("#p_cust_identityCd").val();
		identityNum=$.trim($("#p_cust_identityNum").val());
		if(identityNum==""){
			$.alert("提示","请输入证件号码！");
			return;
		}
		//判断是否是号码或身份证输入
		if(identityCd==1){
		 identityCd=$("#p_cust_identityCd").val();
		}
		if(identityCd==-1){
			acctNbr=identityNum;
			identityNum="";
			identityCd="";
		}

		diffPlace=$("#DiffPlaceFlag").val();
		areaId=$("#p_areaId").val();
		var param = {
			"acctNbr":acctNbr,
			"identityCd":identityCd,
			"identityNum":identityNum,
			"partyName":"",
			"custQueryType":$("#custQueryType").val(),
			"diffPlace":diffPlace,
			"areaId" : areaId
		};
		$.callServiceAsHtmlGet(contextPath+"/cust/queryCustAlone", param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				if (response.code == -2) {
					return;
				}
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
	//查询客户详情
	var _queryCustDetail = function(_custId){
		var param = {
				partyId : _custId,
				areaId : $("#p_areaId").val()
		};
		$.callServiceAsHtml(contextPath+"/cust/custInfo", param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				if (response.code == -2) {
					return;
				}
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
	
	//保存静态客户信息
	var _createCustConfirm = function() {
		createCustInfo = {
			cAreaId 			: OrderInfo.staff.soAreaId,
			cAreaName 			: OrderInfo.staff.soAreaName,
			cCustName 			: $.trim($("#cCustName").val()),
			cCustIdCard 		: $.trim($("#cCustIdCard").val()),
			cPartyTypeCd 		: $.trim($("#partyTypeCd  option:selected").val()),
			cPartyTypeName 		: ($.trim($("#partyTypeCd  option:selected").val())==1) ? "个人客户":"政企客户",
			cIdentidiesTypeCd 	: $.trim($("#identidiesTypeCd  option:selected").val()),
			cAddressStr 		: $.trim($("#cAddressStr").val()),
			cMailAddressStr 	: $.trim($("#cMailAddressStr").val())
		};
		var _boPartyContactInfo = {
			contactAddress 	: $.trim($("#contactAddress").val()),//参与人的联系地址
	        contactDesc 	: $.trim($("#contactDesc").val()),//参与人联系详细信息
	        contactEmployer : $.trim($("#contactEmployer").val()),//参与人的联系单位
	        contactGender  	: $.trim($("#contactGender").val()),//参与人联系人的性别
	        contactId 		: $.trim($("#contactId").val()),//参与人联系信息的唯一标识
	        contactName 	: $.trim($("#contactName").val()),//参与人的联系人名称
	        contactType 	: $.trim($("#contactType").val()),//联系人类型
	        eMail 			: $.trim($("#eMail").val()),//参与人的eMail地址
	        fax 			: $.trim($("#fax").val()),//传真号
	        headFlag 		: $("#headFlag  option:selected").val(),//是否首选联系人
	        homePhone 		: $.trim($("#homePhone").val()),//参与人的家庭联系电话
	        mobilePhone 	: $.trim($("#mobilePhone").val()),//参与人的移动电话号码
	        officePhone 	: $.trim($("#officePhone").val()),//参与人办公室的电话号码
	        postAddress 	: $.trim($("#postAddress").val()),//参与人的邮件地址
	        postcode 		: $.trim($("#postcode").val()),//参与人联系地址的邮政编码
	        staffId 		: OrderInfo.staff.staffId,//员工ID
	        state 			: "ADD",//状态
	        statusCd 		: "100001"//订单状态
		};
		OrderInfo.boCustInfos.name					= createCustInfo.cCustName;//客户名称
		OrderInfo.boCustInfos.areaId				= createCustInfo.cAreaId;//客户地区
		OrderInfo.boCustInfos.partyTypeCd			= createCustInfo.cPartyTypeCd;//客户类型
		OrderInfo.boCustInfos.defaultIdType			= createCustInfo.cIdentidiesTypeCd;//证件类型
		OrderInfo.boCustInfos.addressStr			= createCustInfo.cAddressStr;//客户地址
		OrderInfo.boCustInfos.mailAddressStr		= createCustInfo.cMailAddressStr;//通信地址
		OrderInfo.boCustIdentities.identidiesTypeCd	= createCustInfo.cIdentidiesTypeCd;//证件类型
		OrderInfo.boCustIdentities.identityNum		= createCustInfo.cCustIdCard;//证件号码
		//boPartyContactInfo
		OrderInfo.boPartyContactInfo.contactAddress	=_boPartyContactInfo.contactAddress,//参与人的联系地址
		OrderInfo.boPartyContactInfo.contactDesc 	=_boPartyContactInfo.contactDesc,//参与人联系详细信息
		OrderInfo.boPartyContactInfo.contactEmployer=_boPartyContactInfo.contactEmployer,//参与人的联系单位
		OrderInfo.boPartyContactInfo.contactGender  =_boPartyContactInfo.contactGender,//参与人联系人的性别
		OrderInfo.boPartyContactInfo.contactId 		=_boPartyContactInfo.contactId,//参与人联系信息的唯一标识
		OrderInfo.boPartyContactInfo.contactName 	=_boPartyContactInfo.contactName,//参与人的联系人名称
		OrderInfo.boPartyContactInfo.contactType 	=_boPartyContactInfo.contactType,//联系人类型
		OrderInfo.boPartyContactInfo.eMail 			=_boPartyContactInfo.eMail,//参与人的eMail地址
		OrderInfo.boPartyContactInfo.fax 			=_boPartyContactInfo.fax,//传真号
		OrderInfo.boPartyContactInfo.headFlag 		=_boPartyContactInfo.headFlag,//是否首选联系人
		OrderInfo.boPartyContactInfo.homePhone 		=_boPartyContactInfo.homePhone,//参与人的家庭联系电话
		OrderInfo.boPartyContactInfo.mobilePhone 	=_boPartyContactInfo.mobilePhone,//参与人的移动电话号码
		OrderInfo.boPartyContactInfo.officePhone 	=_boPartyContactInfo.officePhone,//参与人办公室的电话号码
		OrderInfo.boPartyContactInfo.postAddress 	=_boPartyContactInfo.postAddress,//参与人的邮件地址
		OrderInfo.boPartyContactInfo.postcode		=_boPartyContactInfo.postcode,//参与人联系地址的邮政编码
		OrderInfo.boPartyContactInfo.staffId 		=_boPartyContactInfo.staffId,//员工ID
		OrderInfo.boPartyContactInfo.state 			=_boPartyContactInfo.state,//状态
		OrderInfo.boPartyContactInfo.statusCd 		=_boPartyContactInfo.statusCd//订单状态

		OrderInfo.cust = {
			custId		: -1,	
			partyName 	: createCustInfo.cCustName,
			areaId		: createCustInfo.cAreaId
		};
		//客户属性
		OrderInfo.boCustProfiles=[];
		//客户属性节点
		for ( var i = 0; i < _partyProfiles.length; i++) {
			var partyProfiles = _partyProfiles[i];
			var profileValue  = $("#"+partyProfiles.attrId).val();
			if(""==profileValue||undefined==profileValue){
				profileValue==$("#"+partyProfiles.attrId+"option:selected").val();
			}
			var partyProfiles = {
				partyProfileCatgCd: partyProfiles.attrId,
				profileValue: profileValue,
                state: "ADD"
			};
			if(""!=profileValue && profileValue!=undefined){
				OrderInfo.boCustProfiles.push(partyProfiles);
			}
		}
		$("#div_cust_create").popup("close");
		var param = {};
		param.prodPwd 		= "";
		param.accessNumber	="";
		param.authFlag		="1";
		authFlag			="";
		param.identityCd	=createCustInfo.cIdentidiesTypeCd;
		param.idCardNumber	=createCustInfo.cCustIdCard;
		param.partyName		=createCustInfo.cCustName;
		param.areaId		=createCustInfo.cAreaId;
		param.areaName		=createCustInfo.cAreaName;
		param.segmentName	=createCustInfo.cPartyTypeName;
		param.identityName	=$("#identidiesTypeCd option:selected").text();
		$.callServiceAsHtml(contextPath+"/pad/cust/custAuth",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","客户鉴权失败,稍后重试");
					return;
				}
				if(response.data.indexOf("false") >=0) {
					$.alert("提示","抱歉，您输入的密码有误，请重新输入。");
					return;
				}
				_custAuthCallBack(response);
			},"always":function(){
				$.unecOverlay();
			}
		});
   };
	//验证证件号码是否存在
	var _checkIdentity = function() {
		var areaId=$("#p_cust_areaId").val();
		if(areaId==null||areaId==""){
			areaId=OrderInfo.staff.areaId;
		}
		var custName=$("#p_cust_areaId_val").val();
		createCustInfo = {
			cAreaId : areaId,
			cAreaName : custName,
			cCustName : $.trim($("#cCustName").val()),
			cCustIdCard :  $.trim($("#cCustIdCard").val()),
			cPartyTypeCd : $.trim($("#partyTypeCd option:selected").val()),
			cIdentidiesTypeCd : $.trim($("#identidiesTypeCd option:selected").val()),
			cAddressStr :$.trim($("#cAddressStr").val())
		};
		diffPlace=$("#DiffPlaceFlag").val();
		var params = {
			"acctNbr":"",
			"identityCd":createCustInfo.cIdentidiesTypeCd,
			"identityNum":createCustInfo.cCustIdCard,
			"partyName":"",
			"custQueryType":$("#custQueryType").val(),
			"diffPlace":diffPlace,
			"areaId" : createCustInfo.cAreaId
		};
		var url=contextPath+"/pad/cust/checkIdentity";
		var response = $.callServiceAsJson(url, params, {"before":function(){
			$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
		}});
		var msg="";
		if (response.code == 0) {
			$.unecOverlay();
			$.confirm("确认","此证件号码已存在,是否确认新建?",{ 
				yes:function(){	
					_createCustConfirm();
				},
				no:function(){
					
				}
			});
		}else{
			$.unecOverlay();
			_createCustConfirm();
		}
	};
	//更多属性标签 切换
	var _changeLabel = function(tabObj){
        var labId = $(tabObj).attr("tabid");
        if(labId !="0" && $("#contactName").val()==""){
        	$("#contactName").blur();
			return;
		}
        var index = $(tabObj).index();
        var divs = $("#otabs-body > div");
        $(tabObj).parent().children("li").attr("class", "otab-nav");//将所有选项置为未选中
        $(tabObj).attr("class", "otab-nav-action"); //设置当前选中项为选中样式
		$(tabObj).parent().children("li").find(".ui-input-search").hide();
		$(tabObj).parent().children("li").find(".ui-select").hide(); 
		$(tabObj).children("div").show();
        divs.hide();//隐藏所有选中项内容
        divs.eq(index).show(); //显示选中项对应内容
	};
	//指定号码 切换时控制,ok 
	var _isAppointNum = function(){
		if(!_called){
			_called = true;
			if($("#p_cust_identityCd").find("option:selected").val()!=-1){
				$.alertSync("提示","只能接入号码才能指定号码！","information",function(){
					$("#isAppointNum").val("0").slider().slider("refresh");
					_called = false;
				});
			}
		}
	};
	//退出二次业务
	var _cancel = function() {
		//退出二次业务时释放被预占的UIM卡
		var boProd2Tds = OrderInfo.boProd2Tds;
		if(boProd2Tds.length>0){
			for(var n=0;n<boProd2Tds.length;n++){
				var param = {
					numType : 2,
					numValue : boProd2Tds[n].terminalCode
				};
				$.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param);
			}
		}
		//退出二次业务时释放被预占的号码（过滤身份证预占的号码）
		var boProdAns = OrderInfo.boProdAns;
		if(boProdAns.length>0){
			for(var n=0;n<boProdAns.length;n++){
				if(boProdAns[n].idFlag){
					continue;
				}
				var param = {
						numType : 1,
						numValue : boProdAns[n].accessNumber
				};
				$.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param);
			}
			order.service.boProdAn = {};
			order.phoneNumber.resetBoProdAn();
		}			
		//页面变动
		$("#order_fill_content").empty();
		order.prepare.hideStep();
		$("#orderedprod").show();
		$("#order_prepare").show();
	};
	//返回按钮
	var _back = function(){
		$("#acctDetail").hide();
		$("#acctList").show();
	};
	
	return {
		packageQuery : _packageQuery,
		showCustAuth 			: _showCustAuth,
		showCustCreate 			: _showCustCreate,
		custAuth 				: _custAuth,
		getCustInfo 			: _getCustInfo,
		custReset				: _custReset,
		btnQueryCustProd		: _btnQueryCustProd,
		btnQueryCustProdMore	: _btnQueryCustProdMore,
		jumpAuth 				: _jumpAuth,
		identidiesTypeCdChoose 	: _identidiesTypeCdChoose,
		custidentidiesTypeCdChoose :_custidentidiesTypeCdChoose,
		choosedCustInfo 		: _choosedCustInfo,
		partyTypeCdChoose 		: _partyTypeCdChoose,
		chooseArea 				: _chooseArea,
		chooseAllArea 			: _chooseAllArea,
		newCustChooseArea 		: _newCustChooseArea,
		prodChooseArea 			: _prodChooseArea,
		init	 				: _init,
		partyProfiles 			: _partyProfiles,
		profileTabLists 		: _profileTabLists,
		queryCust 				: _queryCust,
		queryCustDetail 		: _queryCustDetail,
		changeLabel 			: _changeLabel,
		jumpAuthflag 			: _jumpAuthflag,
		orderBtnflag 			: _orderBtnflag,
		custCreateButton 		: _custCreateButton,
		isAppointNum 			: _isAppointNum,
		preQueryCustChooseArea 	: _preQueryCustChooseArea,
		linkSelectPlan			: _linkSelectPlan,
		back 					: _back,
		fromProvFlag 			: _fromProvFlag,
		provIsale 				: _provIsale
	};
	
})();
$(function() {
//   order.cust.form_valid_init();
//   order.cust.initDic();
});