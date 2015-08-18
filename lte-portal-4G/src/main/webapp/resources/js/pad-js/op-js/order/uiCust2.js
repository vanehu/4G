/**
 * 客户资料管理
 */
CommonUtils.regNamespace("order", "uiCusts");

order.uiCusts = (function(){
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
		OrderInfo.busitypeflag=2;
		//开始可选包前进行重载校验 
		var isReload=OrderInfo.provinceInfo.reloadFlag;
		/*
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
			
			if(resultCode=="-1" || resultCode=="2"){
				$.alert("提醒",resultMsg);
				return;
			}
		}
		*/
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
		identityNum=OrderInfo.provinceInfo.mainPhoneNum;//$.trim($("#p_cust_identityNum").val());
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
		areaId=$("#p_cust_areaId").val();
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
		$.callServiceAsHtml(contextPath+"/token/pad/cust/queryCustSub",param,{
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
			$.alert("提示","抱歉，没有定位到客户，请尝试其他客户。");
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
		if(order.cust.mgr.jumpAuthflag!="0"){
			$.alert("提示","没有跳过校验权限！");
			return;
		}
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
		var url = contextPath+"/pad/cust/orderprod";
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
				//order.prodModify.orderAttachOffer();
				//order.uiCusts.showOffer();
				_showoffer();
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
			acctNbr=OrderInfo.provinceInfo.mainPhoneNum;
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
	
	var _showoffer=function(){
		
		if(OrderInfo.provinceInfo.reloadFlag=="N"){
			//带主套餐id
			var busiOrder=OrderInfo.reloadOrderInfo.orderList.custOrderList[0].busiOrder;
			var offid="";
			for(var i=0;i<busiOrder.length;i++){
				if(busiOrder[i].boActionType.actionClassCd=="1200" && busiOrder[i].boActionType.boActionTypeCd=="S1" && busiOrder[i].busiObj.offerTypeCd=="1"){
					offid=busiOrder[i].busiObj.objId;
					break;
				}
			}
			//var offid=OrderInfo.reloadOrderInfo.orderList.custOrderList[0].busiOrder[1].busiObj.objId;
			OrderInfo.provinceInfo.prodOfferId=offid;
			order.uiCusts.offerinit(offid,null);
			_loadData();
		}
		else{
			if(OrderInfo.provinceInfo.prodOfferId!=null && OrderInfo.provinceInfo.prodOfferId!=""){
				//带主套餐id
				order.uiCusts.offerinit(OrderInfo.provinceInfo.prodOfferId,null);
			}
			else{
				order.uiCusts.initSub();
				
				
			}
		}
	};
	
	//校验发展人类型,并获取发展人类型列表[4-4-1]
	var _getDealerTypeSub = function(objInstId,objId){
		var dealerType = "";
		if(order.ysl!=undefined){
			OrderInfo.order.dealerTypeList = [{"PARTYPRODUCTRELAROLECD":40020005,"NAME":"第一发展人"},{"PARTYPRODUCTRELAROLECD":40020006,"NAME":"第二发展人"},{"PARTYPRODUCTRELAROLECD":40020007,"NAME":"第三发展人"}];
		}
		if(OrderInfo.order.dealerTypeList!=undefined && OrderInfo.order.dealerTypeList.length>0){ //发展人类型列表
			$.each(OrderInfo.order.dealerTypeList,function(){
				var dealerTypeId = this.PARTYPRODUCTRELAROLECD;
				var flag = true;
				$("select[name='dealerType_"+objInstId+"']").each(function(){ //遍历选择框
					if(dealerTypeId==$(this).val()){  //如果已经存在
						flag = false;
						return false;
					}
				});
				if(flag){ //如果发展人类型没有重复
					dealerType = dealerTypeId;
					return false;
				}
			});
		}else{
			$.alert("信息提示","没有发展人类型");
			return;
		}
		if(dealerType==undefined || dealerType==""){	
			$.alert("信息提示","每个业务发展人类型不能重复");
			return;
		}
		var $tdType = $('<dd></dd>');
		var $field=$('<fieldset data-role="fieldcontain"></fieldset>');
		var objId = objInstId+"_"+OrderInfo.SEQ.dealerSeq;
		var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'"  data-mini="true" data-native-menu="false" data-icon="select" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
		$.each(OrderInfo.order.dealerTypeList,function(){
			if(this.PARTYPRODUCTRELAROLECD==dealerType){
				$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' selected='selected'>"+this.NAME+"</option>");
			}else{
				$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
			}
		});
		$field.append($select);
		$tdType.append($field);
		return $tdType;
	};
	
	
	
	
	
	
	
	
	
	
/***************************订单准备**********************************************/
	//初始化套餐变更页面
	var _initSub = function (){
		var prodInfo = order.prodModify.choosedProdInfo;
		if(prodInfo.prodStateCd!=CONST.PROD_STATUS_CD.NORMAL_PROD){
			$.alert("提示","请选择一个在用产品");
			return;
		}
		OrderInfo.actionFlag = 2;
		if(!query.offer.setOffer()){ //必须先保存销售品实例构成，加载实例到缓存要使用
			return ;
		}
		//规则校验入参
		var boInfos = [{
			boActionTypeCd : CONST.BO_ACTION_TYPE.DEL_OFFER,
			instId : prodInfo.prodInstId,
			specId : CONST.PROD_SPEC.CDMA,
			prodId : prodInfo.prodInstId
		},{
			boActionTypeCd : CONST.BO_ACTION_TYPE.BUY_OFFER,
			instId : prodInfo.prodInstId,
			specId : CONST.PROD_SPEC.CDMA,
			prodId : prodInfo.prodInstId
		}];
		if(!rule.rule.ruleCheck(boInfos)){ //规则校验失败
			return;
		}
		//初始化套餐查询页面
		$.ecOverlay("<strong>正在查询中,请稍后....</strong>");
		var response = $.callServiceAsHtmlGet(contextPath+"/pad/order/prodoffer/prepare",{});	
		$.unecOverlay();
		if(response.code != 0) {
			$.alert("提示","查询失败,稍后重试");
			return;
		}
		SoOrder.step(0,response.data); //订单准备
		order.prepare.initOffer();
		order.uiCusts.searchPack();
		$("#dlg_cust_prod").popup("close");
		$("#navbar").slideUp(500);
		$.jqmRefresh($("#order_tab_panel_content"));
	};
	
	//初始化套餐变更页面
	var _offerinit = function (offid,p){
		var prodInfo = order.prodModify.choosedProdInfo;
		if(prodInfo.prodStateCd!=CONST.PROD_STATUS_CD.NORMAL_PROD){
			$.alert("提示","请选择一个在用产品");
			return;
		}
		OrderInfo.actionFlag = 2;
		if(!query.offer.setOffer()){ //必须先保存销售品实例构成，加载实例到缓存要使用
			return ;
		}
		//规则校验入参
		var boInfos = [{
			boActionTypeCd : CONST.BO_ACTION_TYPE.DEL_OFFER,
			instId : prodInfo.prodInstId,
			specId : CONST.PROD_SPEC.CDMA,
			prodId : prodInfo.prodInstId
		},{
			boActionTypeCd : CONST.BO_ACTION_TYPE.BUY_OFFER,
			instId : prodInfo.prodInstId,
			specId : CONST.PROD_SPEC.CDMA,
			prodId : prodInfo.prodInstId
		}];
		if(!rule.rule.ruleCheck(boInfos)){ //规则校验失败
			return;
		}
		$("#dlg_cust_prod").popup("close");
		$("#navbar").slideUp(500);
		$.jqmRefresh($("#order_tab_panel_content"));
		order.uiCusts.buyService(offid,p);
		/*
		//初始化套餐查询页面
		$.ecOverlay("<strong>正在查询中,请稍后....</strong>");
		var response = $.callServiceAsHtmlGet(contextPath+"/token/pad/order/prodoffer/prepare",{});	
		$.unecOverlay();
		if(response.code != 0) {
			$.alert("提示","查询失败,稍后重试");
			return;
		}
		SoOrder.step(0,response.data); //订单准备
//		$('#search').bind('click',function(){
//			order.service.searchPack();
//		});
//		order.prodOffer.init();
//		order.service.searchPack(); //查询可以变更套餐
		order.prepare.initOffer();
		order.service.searchPack();
		$("#dlg_cust_prod").popup("close");
		$("#navbar").slideUp(500);
		$.jqmRefresh($("#order_tab_panel_content"));
		*/
	};
		
	//主套餐查询
	var _searchPack = function(pageIndex,scroller){
		var custId = OrderInfo.cust.custId;
		var searchtext = $('#searchtext').val();
		if(searchtext=="请输入您要搜索的套餐名称或首字母简拼"){
			searchtext="";
		}
		var phoneLevel="";//order.phoneNumber.boProdAn.level;
		if(phoneLevel==undefined&&phoneLevel==null){
			phoneLevel='';
		}
		//var subPage=$("#subpageFlag").val(); "subPage":subPage,
		var params={"qryStr":searchtext,"pnLevelId":phoneLevel,"custId":custId};
		//解析价格范围条件
		var price = $.trim($("#select_price").val());
		if(ec.util.isObj(price)){
			var priceArr = price.split("-");
			if(priceArr[0]!=null&&priceArr[0]!=""){
				params.priceMin = priceArr[0] ;
			}
			if(priceArr[1]!=null&&priceArr[1]!=""){
				params.priceMax = priceArr[1] ;
			}
		}
		//解析流量范围条件
		var influx = $.trim($("#select_influx").val());
		if(ec.util.isObj(influx)){
			var influxArr = influx.split("-");
			if(influxArr[0]!=null&&influxArr[0]!=""){
				params.INFLUXMin = influxArr[0]*1024;
			}
			if(influxArr[1]!=null&&influxArr[1]!=""){
				params.INFLUXMax = influxArr[1]*1024;
			}
		}
		//解析语音范围条件
		var invoice = $.trim($("#select_invoice").val());
		if(ec.util.isObj(invoice)){
			var invoiceArr = invoice.split("-");
			if(invoiceArr[0]!=null&&invoiceArr[0]!=""){
				params.INVOICEMin = invoiceArr[0] ;
			}
			if(invoiceArr[1]!=null&&invoiceArr[1]!=""){
				params.INVOICEMax = invoiceArr[1] ;
			}
		}
		_queryData(params,scroller);
		
	};
	
	var _queryData = function(params,scroller) {
		if(OrderInfo.actionFlag==2){
			var offerSpecId = order.prodModify.choosedProdInfo.prodOfferId;
			if(offerSpecId!=undefined){
				params.changeGradeProdOfferId = offerSpecId;
			}
		}else if(CONST.getAppDesc()==0){
			params.prodOfferFlag = "4G";
		}
		var url = contextPath+"/token/pad/order/offerSpecList";
		$.callServiceAsHtmlGet(url,params, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","<br/>查询失败,稍后重试");
					return;
				}
				var content$ = $("#div_offer_list");
				content$.html(response.data);
				//刷新jqm控件
				$.jqmRefresh(content$);
				if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
				//绑定选中单个套餐事件
				$("#ul_offer_list li").off("tap").on("tap",function(){
					$(this).addClass("pakeagelistlibg").siblings().removeClass("pakeagelistlibg");
				});
				if(OrderInfo.busitypeflag==1){
					$("#btn_enter_prev").show();
					$("#btn_enter_prev").off("tap").on("tap",function(){
						$("#ul_busi_area").show();
						$("#order_prepare").empty();
					});
				}
				//绑定选中套餐后下一步操作功能
				$("#btn_enter_offerlist_next").off("tap").on("tap",function(){
					if($("#ul_offer_list .pakeagelistlibg").length==1){
						var $dl = $("#ul_offer_list .pakeagelistlibg").find("dl");
						order.uiCusts.buyService($dl.attr("offerSpecId"),$dl.attr("price"));
					}else{
						$.alert("提示","请先选择一个套餐,再进入下一步操作.");
					}
				});
			},
			"always":function(){
				$.unecOverlay();
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","套餐加载失败，请稍后再试！");
			}
		});
	};
	//订购销售品
	var _buyService = function(specId,price) {
		var custId = OrderInfo.cust.custId;
		offerprice = price;
		if(OrderInfo.cust==undefined || custId==undefined || custId==""){
			$.alert("提示","在订购套餐之前请先进行客户定位！");
			return;
		}
		var param = {
			"price":price,
			"specId" : specId,
			"custId" : OrderInfo.cust.custId,
			"areaId" : OrderInfo.staff.soAreaId
		};
		if(OrderInfo.actionFlag == 2){  //套餐变更不做校验
			order.uiCusts.opeSer(param);  
			
		}else {  //新装
			var boInfos = [{
	            boActionTypeCd: "S1",//动作类型
	            instId : "",
	            specId : specId //产品（销售品）规格ID
	        }];
	        if(rule.rule.ruleCheck(boInfos)){  //业务规则校验通过
	        	order.service.opeSer(param);   
	        }
		}
	};
	
	//获取销售品构成，并选择数量
	var _opeSer = function(inParam){
		
		var param = {
			offerSpecId : inParam.specId,
			offerTypeCd : 1,
			partyId: OrderInfo.cust.custId
		};
		var offerSpec = query.offer.queryMainOfferSpec(param); //查询主销售品构成
		if(!offerSpec){
			return;
		}
		if(OrderInfo.actionFlag == 2){ //套餐变更
			var url=contextPath+"/order/queryFeeType";
			$.ecOverlay("<strong>正在查询是否判断付费类型的服务中,请稍后....</strong>");
			var response = $.callServiceAsJsonGet(url,param);	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data!=undefined){
					if("0"==response.data){
						var is_same_feeType=false;
						if(order.prodModify.choosedProdInfo.feeType=="2100" && (offerSpec.feeType=="2100"||offerSpec.feeType=="3100"||offerSpec.feeType=="3101"||offerSpec.feeType=="3103"||offerSpec.feeType=="1202"||offerSpec.feeType=="2101")){
							is_same_feeType=true;//预付费
						}else if(order.prodModify.choosedProdInfo.feeType=="1200" && (offerSpec.feeType=="1200"||offerSpec.feeType=="3100"||offerSpec.feeType=="3102"||offerSpec.feeType=="3103"||offerSpec.feeType=="1202"||offerSpec.feeType=="2101")){
							is_same_feeType=true;//后付费
						}else if(order.prodModify.choosedProdInfo.feeType=="1201" && (offerSpec.feeType=="1201"||offerSpec.feeType=="3101"||offerSpec.feeType=="3102"||offerSpec.feeType=="3103")){
							is_same_feeType=true;//准实时预付费
						}
						if(!is_same_feeType){
							$.alert("提示","付费类型不一致,无法进行套餐变更。");
							return;
						}
					}
				}
			}
		
			order.uiCusts.offerChangeView();
			
			return;
		}
		var iflag = 0; //判断是否弹出副卡选择框 false为不选择
		var htmlStr='<div id="dlg-memberRole-num" data-role="popup" data-transition="slideup" data-corners="false" data-overlay-theme="b" class="popwindow" data-dismissible="false">'+
		'<div data-role="header" data-position="inline" data-tap-toggle="false" data-theme="t">'+
			'<a href="#" data-role="button" data-icon="back" data-rel="back" data-iconpos="notext" class="ui-btn-right">返回</a>'+
			'<h1>'+OrderInfo.offerSpec.offerSpecName+'</h1>'+
		'</div>';
		var $con=$('<div></div>');
		var $content=$('<div data-role="content"></div>');
		var $ul=$('<ul data-role="listview" class="develist"></ul'); 
		$.each(offerSpec.offerRoles,function(){
			var offerRole = this;
			$.each(this.roleObjs,function(){
				var objInstId = offerRole.offerRoleId+"_"+this.objId;//角色id+产品规格id
				if(this.objType == CONST.OBJ_TYPE.PROD){
					if(offerRole.minQty == 0){ //加装角色
						this.minQty = 0;
						this.dfQty = 0;
					}
					var max = this.maxQty<0?"不限制":this.maxQty;//主卡的最大数量
					var $li=$('<li></li>');
					var $dl= $('<dl></dl>');
					$dl.append("<dd></dd><dd><span style='color: #5a9203;'>"+offerRole.offerRoleName+" :</span>"+this.objName+" :</dd>"+
							"<dd><div class='ui-grid-b addnum'> <div class='ui-block-a' align='center'>" +
							"<a class='abtn01' href='javascript:order.service.subNum(\""+objInstId+"\","+this.minQty+");'>-</a></div>"+
							"<div class='ui-block-b'><input id='"+objInstId+"' type='text' value='"+this.dfQty+"' style='width:22px' readonly='readonly'></div>"+
							"<div class='ui-block-c' align='center'><a class='abtn01'  href='javascript:order.service.addNum(\""+objInstId+"\","+this.maxQty+",\""+offerRole.parentOfferRoleId+"\");'>+</a></div>"+
							"</div></dd><dd>"+this.minQty+"-"+max+"（张） </dd>");	
					$li.append($dl);
					$ul.append($li);
					iflag++;
				}
			});
		});
		/*var foot='<div class="ui-grid-c"><div class="ui-block-a">&nbsp;</div><div class="ui-block-b">&nbsp;</div>'+
     	'<div class="ui-block-c"><button id="memberRoleNumConfirm" data-theme="g" data-inline="true"  data-icon="check">确认</button></div>'+
		'<div class="ui-block-d"><button id="memberRoleNumCancel" data-theme="g" data-inline="true" data-icon="back">取消</button></div>'+
		'</div>;*/
		var foot=' <div data-role="footer" data-position="inline" data-tap-toggle="false" data-theme="n">'+
     	'<button id="memberRoleNumConfirm"  data-inline="true"  data-icon="check">确认</button>'+
		'<button id="memberRoleNumCancel"  data-inline="true" data-icon="back">取消</button>'+
		'</div>';
		$content.append($ul);
		$content.append(foot);
		$con.append($content);
		//$con.append(foot);
		htmlStr+=$con.html()+"</div>";
		//页面初始化参数
		var param = {
			"boActionTypeCd" : "S1" ,
			"boActionTypeName" : "订购",
			"offerSpec" : offerSpec,
			"actionFlag" :1,
			"type" : 1
		};
		if(iflag >1){
			var popup = $.popup("#dlg-memberRole-num",htmlStr,{
				width:800,
				height:250,
				contentHeight:250,
				afterClose:function(){}
			});
			$("#memberRoleNumConfirm").off("tap").on("tap",function(){
				order.service.confirm(param);
			});
			$("#memberRoleNumCancel").off("tap").on("tap",function(){
				$("#dlg-memberRole-num").popup("close");
			});
		}else{
			if(!_setOfferSpec(1)){
				$.alert("错误提示","请选择一个接入产品");
				return;
			}
			if(OrderInfo.actionFlag!=14){ //合约套餐不初始化
				order.main.buildMainView(param);	
			}
		}
	};
	
	//套餐变更页面显示
	var _offerChangeView=function(){
		var oldLen = 0 ;
		$.each(OrderInfo.offer.offerMemberInfos,function(){
			if(this.objType==2){
				oldLen++;
			}
		});
		var memberNum = 1; //判断是否多成员 1 单成员2多成员
		var viceNum = 0;
		if(oldLen>1){ //多成员角色，目前只支持主副卡
			memberNum = 2;
		}
		//把旧套餐的产品自动匹配到新套餐中
		if(!offerChange.setChangeOfferSpec(memberNum,viceNum)){  
			return;
		};
		//4g系统需要
		if(CONST.getAppDesc()==0){ 
			//老套餐是3G，新套餐是4G
			if(order.prodModify.choosedProdInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){
				if(!offerChange.checkOrder()){ //省内校验单
					return;
				}
			}
			//根据UIM类型，设置产品是3G还是4G，并且保存旧卡
			if(!prod.uim.setProdUim()){ 
				return ;
			}
		}
		//初始化填单页面
		var prodInfo = order.prodModify.choosedProdInfo;
		var param = {
			boActionTypeCd : "S2" ,
			boActionTypeName : "套餐变更",
			actionFlag :"2",
			offerSpec : OrderInfo.offerSpec,
			prodId : prodInfo.prodInstId,
			offerMembers : OrderInfo.offer.offerMemberInfos,
			oldOfferSpecName : prodInfo.prodOfferName,
			prodClass : prodInfo.prodClass,
			appDesc : CONST.getAppDesc()
		};
		order.uiCusts.buildMainView(param);
	};
	
	var _buildMainView = function(param) {
	
		if (param == undefined || !param) {
			param = _getTestParam();
		}
		
		if(OrderInfo.actionFlag == 6){//主副卡成员变更 付费类型判断 如果一致才可以进行加装
			var is_same_feeType=false;//
			if(param.feeTypeMain=="2100" && (param.offerSpec.feeType=="2100"||param.offerSpec.feeType=="3100"||param.offerSpec.feeType=="3101"||param.offerSpec.feeType=="3103")){
				is_same_feeType=true;
			}else if(param.feeTypeMain=="1200" && (param.offerSpec.feeType=="1200"||param.offerSpec.feeType=="3100"||param.offerSpec.feeType=="3102"||param.offerSpec.feeType=="3103")){
				is_same_feeType=true;
			}else if(param.feeTypeMain=="1201" && (param.offerSpec.feeType=="1201"||param.offerSpec.feeType=="3101"||param.offerSpec.feeType=="3102"||param.offerSpec.feeType=="3103")){
				is_same_feeType=true;
			}
			if(!is_same_feeType){
				$.alert("提示","主副卡付费类型不一致，无法进行主副卡成员变更。");
				return;
			}
		}
		
		$.callServiceAsHtml(contextPath+"/token/pad/order/mainSub",param,{
		//$.callServiceAsHtml(contextPath+"/pad/order/main",param,{
			"before":function(){
				$.ecOverlay("<strong>正在加载中,请稍等...</strong>");
			},"done" : function(response){
				if(!response){
					 response.data='查询失败,稍后重试';
				}
				if(response.code != 0) {
					$.alert("提示","查询失败,稍后重试");
					return;
				}
				OrderInfo.actionFlag = param.actionFlag;
				if(OrderInfo.actionFlag == 2){
					offerChange.fillOfferChange(response,param);
					$.jqmRefresh($("#order_fill_content"));
					//$("#dlg_cust_prod").popup("close");//关闭弹出层
					
					//二次加载
					if(OrderInfo.provinceInfo.reloadFlag=="N"){
						order.uiCusts.loadData();
					}
					
					
				}else {
					_callBackBuildView(response,param);
				}
				/*if(CONST.getAppDesc()==1 && (OrderInfo.actionFlag==1 ||OrderInfo.actionFlag==14)){
					$("#li_is_activation").show();
				}*/
			},"always":function(){
				$.unecOverlay();
			}
		});

	};
	
	//解析数据
	var _loadData=function(){
		
		//if(OrderInfo.provinceInfo.reloadFlag!=null && OrderInfo.provinceInfo.reloadFlag!=""){
			var data=OrderInfo.reloadOrderInfo;
			//进行进行数据解析工作,获取产品数据
			var custOrderList=data.orderList.custOrderList;
			var orderListInfo=data.orderList.orderListInfo;
			if(custOrderList!=null && custOrderList!=""){
				//获取下属的产品
				if(custOrderList!=null && custOrderList.length>0){
					$(custOrderList).each(function(i,custOrder) { 
						
						//先把删除的开通功能进行删除操作
						$(custOrder.busiOrder).each(function(i,busiOrder) { 
							//解析到具体的订购产品数据
							//获取产品操作类型
							var boActionTypeCd=busiOrder.boActionType.boActionTypeCd;
							
							//获取产品的操作状态,state,del-删除,add-添加
							var state="";
							var data=busiOrder.data;
							var ooOwners;
							var boServs;
							
							// 7是已开通功能，状态的获取和其他类型获取不一样
							if(boActionTypeCd=="7"){
								boServs=data.boServs;
								
								if(boServs!=null){
									$(boServs).each(function(i,boServ) { 
										state=boServ.state;
									});
								}
							}
							
							var busiObj=busiOrder.busiObj;
							
							if(boActionTypeCd=="7"){
								//7是已开通功能产品
								//获取唯一ID标识
								var instId=busiObj.instId;
								
								var boServOrders=data.boServOrders;
								
								$(data.boServs).each(function(i,boServ) { 
									var servId=boServ.servId;
									var state=boServ.state;
									if(state=="DEL"){
										_closeServSub(instId,servId);//4-1
									}
								});
							}
						});
					});
				
					$(custOrderList).each(function(i,custOrder) { 
						
						$(custOrder.busiOrder).each(function(i,busiOrder) { 
							
							//解析到具体的订购产品数据
							//获取产品操作类型
							var boActionTypeCd=busiOrder.boActionType.boActionTypeCd;
							
							//获取产品的操作状态,state,del-删除,add-添加
							var state="";
							
							var datas=busiOrder.data;
					
							var ooOwners;
							var boServs;
							
							// 7是已开通功能，状态的获取和其他类型获取不一样
							if(boActionTypeCd=="7"){
								boServs=datas.boServs;
								
								if(boServs!=null){
									$(boServs).each(function(i,boServ) { 
										state=boServ.state;
									});
								}
								
							}else{
								ooOwners=datas.ooOwners;
								if(ooOwners!=null){
									$(ooOwners).each(function(i,ooOwner) { 
										state=ooOwner.state;
										return false
									});
								}
							}
							
							var busiObj=busiOrder.busiObj;
							//S2是已订购可选包
							if(boActionTypeCd=="S2"){
								//获取唯一ID标识
								var instId=busiObj.instId;
								var offerTypeCd1=busiObj.offerTypeCd;
								$(datas.ooRoles).each(function(i,ooRole) { 
									var objInstId=ooRole.objInstId;
									state=ooRole.state;
									if(offerTypeCd1=="2"){
										if(state=="DEL"){

											AttachOffer.delOfferSub(objInstId,instId);
											//AttachOffer.delOffer(objInstId,instId);
										}
									}
									
								});
							}else if(boActionTypeCd=="7"){
						
								//7是已开通功能产品
								//获取唯一ID标识
								
								var instId=busiObj.instId;
								
								var boServOrders=datas.boServOrders;
								
								$(datas.boServs).each(function(i,boServ) { 
									var servId=boServ.servId;
									var state=boServ.state;
									
									if(state=="DEL"){
										_closeServSub(instId,servId);
									}else if(state=="ADD"){
										$(boServOrders).each(function(i2,boServOrder) {
											var servSpecId=boServOrder.servSpecId;
											var servSpecName=boServOrder.servSpecName;
											
											_openServSpecSub(instId,servSpecId,servSpecName,'N');
										});
									}
								});
								
							}else if(boActionTypeCd=="S1"){

								var zdDatas=busiOrder.data;    //终端
								//S1是订单中的已选可选包数据
								//获取唯一ID标识
								var objId=busiObj.objId;
								var accessNumber=busiObj.accessNumber;
								var objName=busiObj.objName;
								var prodId=null;
								
								var ooRoles=datas.ooRoles;
								var busiOrderAttrs=datas.busiOrderAttrs;
								
								$(datas.ooRoles).each(function(i,ooRole) { 
									prodId=ooRole.prodId;
									return false;
								});
								
								var isNeedAdd=false;
								
								var roleCode="";
								
								$(busiOrderAttrs).each(function(i,busiOrderAttr) { 
									var itemSpecId=busiOrderAttr.itemSpecId;
									if(itemSpecId=="111111116"){
										roleCode=busiOrderAttr.role;
										isNeedAdd=true;
										return false;
									}
								});
								if(busiObj.offerTypeCd=="2"){
									if(zdDatas.ooRoles[0].state=="ADD"){
										var prodId=zdDatas.ooRoles[0].prodId;
										var offerSpecId=busiObj.objId;
										
										var arr=AttachOffer.openList;
										var newSpec = CacheData.getOfferSpec(prodId,offerSpecId);
										if(newSpec==undefined){
											_addOfferSpecSub(prodId,offerSpecId,null);
										}
										
										/*										
										if(newSpec!=undefined && newSpec!=null && newSpec!=""){
											if(newSpec.ifDault!=0){
												
											}
										}
										*/
										//_getOffer();
										
									}
								}
								
								//新增发展人
								if(isNeedAdd){
									_addAttachDealerSub(prodId+"_"+objId,accessNumber,objName,roleCode);//4-4
								}
								
								//重载订单中已经选择的服务
								//_addOfferSpecSub(prodId,objId,ooRoles);//4-5

								//解析终端串码
								if(busiOrder.boActionType.actionClassCd=="1200" && busiOrder.boActionType.boActionTypeCd=="S1" && busiOrder.busiObj.offerTypeCd=="2"){
									if(zdDatas.bo2Coupons!=undefined){
										//开始解析终端
										for(var i=0;i<zdDatas.bo2Coupons.length;i++){
											var bo2Coupons = zdDatas.bo2Coupons[i];
											
											var coupon = {
													couponUsageTypeCd : bo2Coupons.couponUsageTypeCd, //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
													inOutTypeId : bo2Coupons.inOutTypeId,  //出入库类型
													inOutReasonId : bo2Coupons.inOutReasonId, //出入库原因
													saleId : bo2Coupons.saleId, //销售类型
													couponId : bo2Coupons.couponId, //物品ID
													couponinfoStatusCd : bo2Coupons.couponinfoStatusCd, //物品处理状态
													chargeItemCd : bo2Coupons.chargeItemCd, //物品费用项类型
													couponNum : bo2Coupons.couponNum, //物品数量
													storeId : bo2Coupons.storeId, //仓库ID
													storeName : bo2Coupons.storeName, //仓库名称
													agentId : bo2Coupons.agentId, //供应商ID
													apCharge : bo2Coupons.apCharge, //物品价格,约定取值为营销资源的
													couponInstanceNumber : bo2Coupons.couponInstanceNumber, //物品实例编码
													ruleId : bo2Coupons.ruleId, //物品规则ID
													partyId : bo2Coupons.partyId, //客户ID
													prodId : bo2Coupons.prodId, //产品ID
													offerId : bo2Coupons.offerId, //销售品实例ID
													attachSepcId : bo2Coupons.attachSepcId,
													state : bo2Coupons.state, //动作
													relaSeq : bo2Coupons.relaSeq, //关联序列	
													num	: bo2Coupons.num //第几个串码输入框
												};
												OrderInfo.attach2Coupons.push(coupon);
												
												$("#terminalText_"+bo2Coupons.prodId+"_"+bo2Coupons.attachSepcId).val(bo2Coupons.couponInstanceNumber);
												//进行校验 
												AttachOffer.checkTerminalCodeSub(bo2Coupons.prodId,bo2Coupons.attachSepcId);
										}
									}
		
								}
								
								
							}
							else if(boActionTypeCd=="14"){
							
								var bo2Coupons=busiOrder.data.bo2Coupons
								for(var i=0;i<bo2Coupons.length;i++){
									if(bo2Coupons[i].state=="ADD"){
										//uim卡号  //uim_txt_140029724038
										var card=bo2Coupons[i].couponInstanceNumber;
										//prodId
										var id=bo2Coupons[i].prodId;
										
										$("#uim_txt_"+id).val(card);//填充卡号
										order.uiCusts.checkUim(id,bo2Coupons[i]);
									}
								}
							}
							
						});
					});
				}
			}
			//退订功能产品
			$.each(AttachOffer.openServList,function(){
				var openmap = this;
				$.each(this.servSpecList,function(){
					var offermap = this;
					var offerflag = false;
					var custOrderLists=custOrderList[0];
					$.each(custOrderLists.busiOrder,function(){
						var obj=this;
						if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="7"){
							if(offermap.servSpecId==this.data.boServOrders[0].servSpecId && openmap.prodId==this.busiObj.instId){
								offerflag = true;
								return false;
							}
						}
					});
					if(!offerflag){
						var $span = $("#li_span_"+openmap.prodId+"_"+this.servSpecId).parent();
						//var $span = $("#li_"+openmap.prodId+"_"+this.servSpecId).find("span"); //定位删除的附属
						var spec = CacheData.getServSpec(openmap.prodId,this.servSpecId);
						if(spec == undefined){ //没有在已开通附属销售列表中
							return;
						}
						$span.addClass("deldiv");
						spec.isdel = "Y";
						AttachOffer.showHideUim(1,openmap.prodId,this.servSpecId);   //显示或者隐藏
						var serv = CacheData.getServBySpecId(openmap.prodId,this.servSpecId);
						if(ec.util.isObj(serv)){ //没有在已开通附属销售列表中
							$span.addClass("deldiv");
							spec.isdel = "Y";
						}
					}
				});
			});
			//订单备注和模版等加载
			if(orderListInfo!=null && custOrderList!=null){
				var custOrderAttrs=orderListInfo.custOrderAttrs;
				var isTemplateOrder=orderListInfo.isTemplateOrder;
				var templateOrderName=orderListInfo.templateOrderName;
				
				$(custOrderAttrs).each(function(i,custOrderAttr) { 
					var itemSpecId=custOrderAttr.itemSpecId;
					
					//111111118是为备注的编码
					if(itemSpecId=="111111118"){
						var value=custOrderAttr.value;
						
						if(value!=null && value!=""){
							$("#order_remark").html(value);
						}
					}
				});
				
				//模版的操作
				if(isTemplateOrder=="Y"){
					$("#isTemplateOrder").click();//选中模版按钮
					
					SoOrder.showTemplateOrderName();//显示模版名称输入
					
					$("#templateOrderName").val(templateOrderName);//赋值模版名称
				}
			}
	};
	
	//开通功能产品
	var _openServSpecSub = function(prodId,servSpecId,specName,ifParams){
		var servSpec = CacheData.getServSpec(prodId,servSpecId); //在已选列表中查找
		if(servSpec==undefined){   //在可订购功能产品里面 
			var newSpec = {
				objId : servSpecId, //调用公用方法使用
				servSpecId : servSpecId,
				servSpecName : specName,
				ifParams : ifParams,
				isdel : "C"   //加入到缓存列表没有做页面操作为C
			};
			var inPamam = {
				prodSpecId:servSpecId
			};
			if(ifParams == "Y"){
				var data = query.prod.prodSpecParamQuery(inPamam);// 产品功能产品属性
				if(data==undefined || data.result==undefined){
					return;
				}
				newSpec.prodSpecParams = data.result.prodSpecParams;
			if(servSpecId==CONST.YZFservSpecId){//翼支付助手根据付费类型改变默认值
				var feeType = $("select[name='pay_type_-1']").val();
				if(feeType==undefined) feeType = order.prodModify.choosedProdInfo.feeType;
				if(feeType == CONST.PAY_TYPE.AFTER_PAY){
					for ( var j = 0; j < newSpec.prodSpecParams.length; j++) {
						var prodSpecParam = newSpec.prodSpecParams[j];
						prodSpecParam.setValue = "";
					}																			
				}else{
					for ( var j = 0; j < newSpec.prodSpecParams.length; j++) {							
						var prodSpecParam = newSpec.prodSpecParams[j];
						if (prodSpecParam.value!="") {
							prodSpecParam.setValue = prodSpecParam.value;
						} else if (!!prodSpecParam.valueRange[0]&&prodSpecParam.valueRange[0].value!="")
							//默认值为空则取第一个
							prodSpecParam.setValue = prodSpecParam.valueRange[0].value;
				}
			  }
			}
			}
			CacheData.setServSpec(prodId,newSpec); //添加到已开通列表里
			servSpec = newSpec;
		}
		
		_checkServExcludeDepend(prodId,servSpec);
	};
	//校验服务的互斥依赖
	//校验销售品的互斥依赖
	var _checkOfferExcludeDepend = function(prodId,offerSpec){
		var offerSpecId = offerSpec.offerSpecId;
		var param = CacheData.getExcDepOfferParam(prodId,offerSpecId);

		var data = query.offer.queryExcludeDepend(param);//查询规则校验
		if(data!=undefined){
			paserOfferData(data.result,prodId,offerSpecId,offerSpec.offerSpecName); //解析数据
		}
	};
	
	//解析服务互斥依赖
	var paserServData = function(result,prodId,serv){
		var servSpecId = serv.servSpecId;
		var servExclude = result.servSpec.exclude; //互斥
		var servDepend = result.servSpec.depend; //依赖
		var servRelated = result.servSpec.related; //连带
		var content = "";
		//转换接口返回的互斥依赖
		var param = {  
			excludeServ : [],  //互斥依赖显示列表
			dependServ : [], //存放互斥依赖列表
			relatedServ : [] //连带
		};
		
		//解析功能产品互斥
		if(ec.util.isArray(servExclude)){
			$.each(servExclude,function(){
				var servList = CacheData.getServList(prodId); //互斥要去除已订购手动删除
				var flag = true;
				if(servList!=undefined){
					for ( var i = 0; i < servList.length; i++) {
						if(servList[i].isdel=="Y"){
							if(servList[i].servSpecId == this.servSpecId){  //返回互斥数组在已订购中删除，不需要判断
								flag = false;
								break;
							}
						}
					}
				}
				if(flag){
					//scontent += "需要关闭：   " + this.servSpecName + "<br>";
					param.excludeServ.push(this);
				}
			});
		}
		//解析功能产品依赖
		/*
		if(ec.util.isArray(servDepend)){
			$.each(servDepend,function(){
				content += "需要开通：   " + this.servSpecName + "<br>";
				param.dependServ.push(this);
			});
		}
		*/
		param.dependServ.push(this);
		//解析功能产品连带
		/*
		if(ec.util.isArray(servRelated)){
			$.each(servRelated,function(){
				content += "需要开通：   " + this.servSpecName + "<br>";
				param.relatedServ.push(this);
			});
		}
		*/
		param.relatedServ.push(this);
		if(content==""){ //没有互斥依赖
			AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams);
		}else{	
			$.confirm("开通： " + serv.servSpecName,content,{ 
				yesdo:function(){
					AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams); //添加开通功能
					AttachOffer.excludeAddServ(prodId,servSpecId,param);
				},
				no:function(){
				}
			});
		}
	};
	//二次加载附属业务数据信息 第一步
	var _addOfferSpecSub = function(prodId,offerSpecId,roles){
		var newSpec = _setSpec(prodId,offerSpecId);
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			return;
		}
		
		var content = CacheData.getOfferProdStr(prodId,newSpec,0);
		
		_setServ2OfferSpecSub(prodId,newSpec);
		
		_checkOfferExcludeDependSub(prodId,newSpec);
			
	};
	//把选中的服务保存到销售品规格中 第二步
	var _setServ2OfferSpecSub = function(prodId,offerSpec,roles){
		if(offerSpec!=undefined){
			$.each(offerSpec.offerRoles,function(){
				$.each(this.roleObjs,function(){
					var nowProd=prodId+"_"+this.objId;
					
					$(roles).each(function(i,role) { 
						var oldProd=role.prodId+"_"+role.objId;
							
						if(nowProd==oldProd){
							this.selQty = 1;
							return false;
						}else{
							this.selQty = 2;
						}
					});
				});
			});
		}
	};
	//校验销售品的互斥依赖 第三步
	var _checkOfferExcludeDependSub = function(prodId,offerSpec){
		var offerSpecId = offerSpec.offerSpecId;
		var param = CacheData.getExcDepOfferParam(prodId,offerSpecId);
		var data = query.offer.queryExcludeDepend(param);//查询规则校验
		if(data!=undefined){
			paserOfferData(data.result,prodId,offerSpecId,offerSpec.offerSpecName); //解析数据
		}
	};
	
	//解析互斥依赖返回结果
	var paserOfferData = function(result,prodId,offerSpecId,specName){
		var content = "";
		//转换接口返回的互斥依赖
		var param = {  
				excludeOffer : [],   //互斥依赖显示列表
				dependOffer : {  //存放互斥依赖列表
					dependOffers : [],
					offerGrpInfos : []
				}
		};
		if(result!=""){
			var exclude = result.offerSpec.exclude;
			var depend = result.offerSpec.depend;
			
			//解析可选包互斥依赖组
			if(ec.util.isArray(exclude)){
				for (var i = 0; i < exclude.length; i++) {
					var offerList = CacheData.getOfferList(prodId); //互斥要去除已订购手动删除
					var flag = true;
					if(offerList!=undefined){
						for ( var j = 0; j < offerList.length; j++) {
							if(offerList[j].isdel=="Y"){
								if(offerList[j].offerSpecId == exclude[i].offerSpecId){  //返回互斥数组在已订购中删除，不需要判断
									flag = false;
									break;
								}
							}
						}
					}
					if(flag){
						content += "需要关闭：   " + exclude[i].offerSpecName + "<br>";
						param.excludeOffer.push(exclude[i].offerSpecId);
					}
				}
			}
			if(depend!=undefined && ec.util.isArray(depend.offerInfos)){
				for (var i = 0; i < depend.offerInfos.length; i++) {	
					content += "需要开通： " + depend.offerInfos[i].offerSpecName + "<br>";
					param.dependOffer.dependOffers.push(depend.offerInfos[i].offerSpecId);
				}	
			}
			if(depend!=undefined && ec.util.isArray(depend.offerGrpInfos)){
				for (var i = 0; i < depend.offerGrpInfos.length; i++) {
					var offerGrpInfo = depend.offerGrpInfos[i];
					param.dependOffer.offerGrpInfos.push(offerGrpInfo);
					content += "需要开通： 开通" + offerGrpInfo.minQty+ "-" + offerGrpInfo.maxQty+ "个以下业务:<br>";
					if(offerGrpInfo.subOfferSpecInfos!="undefined" && offerGrpInfo.subOfferSpecInfos.length>0){
						for (var j = 0; j < offerGrpInfo.subOfferSpecInfos.length; j++) {
							var subOfferSpec = offerGrpInfo.subOfferSpecInfos[j];
							content += '<input id="'+subOfferSpec.offerSpecId+'" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
						}
					}
				}
			}
		}
		var serContent=_servExDepReByRoleObjs(prodId,offerSpecId);//查询销售品构成成员的依赖互斥以及连带
		content=content+serContent;
		if(content==""){ //没有互斥依赖
			AttachOffer.addOpenList(prodId,offerSpecId); 
		}else{	
			content = "<div style='max-height:300px;overflow:auto;'>" + content + "</div>";
			
			CacheData.setOffer2ExcludeOfferSpec(param);
			AttachOffer.excludeAddattch(prodId,offerSpecId,param);
			AttachOfferexcludeAddServ(prodId,"",paramObj);

		}
	};
	//查询销售品对象的互斥依赖连带的关系
	var _servExDepReByRoleObjs=function(prodId,offerSpecId){
		var newSpec = _setSpec(prodId,offerSpecId);
		paramObj.excludeServ=[];//初始化
		paramObj.dependServ=[];//初始化
		paramObj.relatedServ=[];//初始化
		var globContent="";
		$.each(newSpec.offerRoles,function(){
			$.each(this.roleObjs,function(){
				if(this.objType==4 && this.selQty==1){
						var servSpec = CacheData.getServSpec(prodId,this.objId); //在已选列表中查找
						if(servSpec==undefined){   //在可订购功能产品里面 
							var serv = CacheData.getServBySpecId(prodId,this.objId); //在已开通列表中查找
							if(serv==undefined){
								var newServSpec = {
										objId : this.objId, //调用公用方法使用
										servSpecId : this.objId,
										servSpecName : this.objName,
										ifParams : this.isCompParam,
										prodSpecParams : this.prodSpecParams,
										isdel : "C"   //加入到缓存列表没有做页面操作为C
								};
								CacheData.setServSpec(prodId,newServSpec); //添加到已开通列表里
								servSpec = newServSpec;
							}else{
								servSpec=serv;
							}
						}
						var servSpecId = servSpec.servSpecId;
						var param = CacheData.getExcDepServParam(prodId,servSpecId);
						if(param.orderedServSpecIds.length == 0){
//							AttachOffer.addOpenServList(prodId,servSpecId,servSpec.servSpecName,servSpec.ifParams);
						}else{
							var data=query.offer.queryExcludeDepend(param);//查询规则校验
							var content=paserServDataByObjs(data.result,prodId,servSpec,newSpec);
							if(content!=""){
								content=("开通【"+servSpec.servSpecName+"】功能产品：<br>"+content);
								globContent+=(content+"<br>");
							}
						}
				}
			});
		});
		return globContent;
	};
	//添加可选包到缓存列表
	var _setSpec = function(prodId,offerSpecId){
		var newSpec = CacheData.getOfferSpec(prodId,offerSpecId);  //没有在已选列表里面
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			newSpec = query.offer.queryAttachOfferSpec(prodId,offerSpecId); //重新获取销售品构成
			if(!newSpec){
				return;
			}
			CacheData.setOfferSpec(prodId,newSpec);
		}
		return newSpec;
	};
	//转换接口返回的互斥依赖
	var paramObj = {  
			excludeServ : [],  //互斥依赖显示列表
			dependServ : [], //存放互斥依赖列表
			relatedServ : [] //连带
	};
	
	//uim卡号校验
	var _checkUim = function(prodId,bo2Coupons){
	
		var phoneNumber = OrderInfo.getAccessNumber(prodId);
		var offerId = "-1"; //新装默认，主销售品ID
		/*
		if(OrderInfo.actionFlag==1||OrderInfo.actionFlag==6||OrderInfo.actionFlag==14){ //新装需要选号
			if(phoneNumber==''){
				$.alert("提示","校验UIM卡前请先选号!");
				return false;
			}
		}
		*/
		if(OrderInfo.actionFlag==3 || OrderInfo.actionFlag==22 || OrderInfo.actionFlag==23 || OrderInfo.actionFlag==6 ){ //可选包变更，补换卡，加装副卡
			if(ec.util.isArray(OrderInfo.oldprodInstInfos)){//判断是否是纳入老用户
				$.each(OrderInfo.oldprodInstInfos,function(){
					if(this.prodInstId==prodId){
						offerId = this.mainProdOfferInstInfos[0].prodOfferInstId;
					}
				});
			}else{
				offerId = order.prodModify.choosedProdInfo.prodOfferInstId;
			}
		}
		var cardNo =$.trim($("#uim_txt_"+prodId).val());
		/*
		if(cardNo==undefined || cardNo==''){
			$.alert("提示","UIM卡不能为空!");
			return false;
		}
		*/
		var inParam = {
			"instCode" : cardNo,
			"phoneNum" : phoneNumber,
			"areaId"   : OrderInfo.getProdAreaId(prodId)
		};

		var prodSpecId = OrderInfo.getProdSpecId(prodId);
		var mktResCd="";
		if(CONST.getAppDesc()==0){
			if(getIsMIFICheck(prodId)){
				mktResCd =prod.uim.getMktResCd(CONST.PROD_SPEC_ID.MIFI_ID);
			}else{
				mktResCd = prod.uim.getMktResCd(prodSpecId);
			}
			if(ec.util.isObj(mktResCd)){
//				inParam.mktResCd = mktResCd;
			}else{
				//$.alert("提示","查询卡类型失败！");
				return;
			}
			if(OrderInfo.actionFlag==22 || OrderInfo.actionFlag==23){ //补换卡和异地补换卡
				if(prod.changeUim.is4GProdInst){ //如果已办理4G业务，则校验uim卡是否是4G卡
					inParam.onlyLTE = "1";
				}
			}
		}
		//var data = query.prod.checkUim(inParam);//校验uim卡
  
			var uimData = {
					prodId :  prodId, //产品ID
					isWireBusi : "",
					isWireUIM : false, //判断是否为无线上网卡
					wireType : 0, //1-普通上网卡 2-全球上网卡 0-默认
					uimCode  : bo2Coupons.couponInstanceNumber,//data.baseInfo.mktResInstCode,
					uimName  : ""//data.baseInfo.mktResName
			};
			/*
			$.each(data.attrList, function() {
				if (this.attrId == '60020007') {
					uimData.isWireUIM = true;
					uimData.wireType = this.attrValue;
					return false;
				}
			});
			*/
			if(uimData.isWireUIM){
				if (prodSpecId == CONST.PROD_SPEC.CDMA) {
					uimData.isWireBusi = 1; // 上网卡 - 移动电话业务
				}
			}else{
				if(prodSpecId == CONST.PROD_SPEC.DATA_CARD){
					uimData.isWireBusi = 2; // 普通卡 - 无线业务
				}
			}
			OrderInfo.clearCheckUimData(prodId);
			OrderInfo.checkUimData.push(uimData);
		//根据uim返回数据组织物品节点
		var couponNum = bo2Coupons.couponNum;//data.baseInfo.qty ;
		if(couponNum==undefined||couponNum==null){
			couponNum = 1 ;
		}
		var coupon = {
			couponUsageTypeCd : "3", //物品使用类型
			inOutTypeId : "1",  //出入库类型
			inOutReasonId : 0, //出入库原因
			saleId : 1, //销售类型
			couponId :bo2Coupons.couponId, //data.baseInfo.mktResId, //物品ID
			couponinfoStatusCd : "A", //物品处理状态
			chargeItemCd : "3000", //物品费用项类型
			couponNum : couponNum, //物品数量
			storeId : bo2Coupons.storeId,//data.baseInfo.mktResStoreId, //仓库ID
			storeName : "1", //仓库名称
			agentId : 1, //供应商ID
			apCharge : 0, //物品价格
			couponInstanceNumber : bo2Coupons.terminalCode,//data.baseInfo.mktResInstCode, //物品实例编码
			terminalCode : bo2Coupons.terminalCode,//data.baseInfo.mktResInstCode,//前台内部使用的UIM卡号
			ruleId : "", //物品规则ID
			partyId : OrderInfo.cust.custId, //客户ID
			prodId :  prodId, //产品ID
			offerId : offerId, //销售品实例ID
			state : "ADD", //动作
			relaSeq : "" //关联序列	
		};
		if(CONST.getAppDesc()==0){
			coupon.cardTypeFlag=bo2Coupons.cardTypeFlag;//UIM卡类型
		}
		$("#uim_check_btn_"+prodId).attr("disabled",true);
		$("#uim_check_btn_"+prodId).removeClass("purchase").addClass("disablepurchase");
		$("#uim_release_btn_"+prodId).attr("disabled",false);
		$("#uim_release_btn_"+prodId).removeClass("disablepurchase").addClass("purchase");
		$("#uim_txt_"+prodId).attr("disabled",true);
		if(getIsMIFICheck(prodId)){//判断是否通过MIFI 校验
			$("#isMIFI_"+prodId).val("yes");
		}else{
			$("#isMIFI_"+prodId).val("no");
		}
		OrderInfo.clearProdUim(prodId);
		OrderInfo.boProd2Tds.push(coupon);
		if(OrderInfo.actionFlag==22 && bo2Coupons.cardTypeFlag==1 && order.prodModify.choosedProdInfo.productId != '280000000'){
		//	_queryAttachOffer();
		  AttachOffer.queryCardAttachOffer(bo2Coupons.cardTypeFlag);  //加载附属销售品
	    }
		// 办理上网卡套餐，UIM校验当卡为全球上网卡自动带出天翼宽带-国际及港澳台数据漫游
		if (OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 14) {
			if (uimData.isWireUIM && uimData.wireType == '02'
					&& prodSpecId == CONST.PROD_SPEC.DATA_CARD) {
				// AttachOffer.openServSpec(prodId,13409441,'天翼宽带-国际及港澳台数据漫游','N');
				AttachOffer.addOpenServList(prodId,
						CONST.PROD_SPEC_ID.WIRE_GLOBAL, '天翼宽带-国际及港澳台数据漫游', 'N');
				var $li = $("#li_" + prodId + "_"
						+ CONST.PROD_SPEC_ID.WIRE_GLOBAL);
				if ($li.length > 0) {
					$li.find("dd").removeClass("delete").addClass("mustchoose")
							.attr("onclick", '');
				}
			}
		}
	};
	var getIsMIFICheck=function(prodId){
		var prodIdTmp=(Math.abs(prodId)-1);
		if(AttachOffer.openServList.length>prodIdTmp){
			var specList = AttachOffer.openServList[prodIdTmp].servSpecList;
			for (var j = 0; j < specList.length; j++) {
				var spec = specList[j];
				if(spec.isdel!="Y" && spec.isdel!="C"){
					if(spec.servSpecId==CONST.PROD_SPEC_ID.MIFI_ID && CONST.APP_DESC==0){
						return true ; 
					}
				}
			}
		}
		return false;
	};
	//通过产品id获取产品已开通附属实例列表
	var _getOfferList = function (prodId){
		for ( var i = 0; i < AttachOffer.openedList.length; i++) {
			var opened = AttachOffer.openedList[i];
			if(opened.prodId == prodId){
				return opened.offerList;
			} 
		}
		return []; //如果没值返回空数组
	};
	//获取销售品实例构成new
	var _getOffer = function(prodId,offerId){
		
		var offerList = _getOfferList(prodId);
		//$.alert(JSON.stringify(offerList));
		if(ec.util.isArray(offerList)){
			for ( var i = 0; i < offerList.length; i++) {
				if(offerList[i].offerId==offerId){
					return offerList[i];
				}
			}
		}
	};
	//删除已订购可选包(new)
	var _delOfferSub = function(prodId,offerId){
		var $span = $("#li_"+prodId+"_"+offerId).find("span"); //定位删除的附属
		
		if($span.attr("class")=="del"){  //已经退订，再订购
			AttachOffer.addOffer(prodId,offerId,$span.text());
		}else { //退订
			var offer = _getOffer(prodId,offerId);

			if(!ec.util.isArray(offer.offerMemberInfos)){	
				var param = {
					prodId:prodId,
					areaId: OrderInfo.getProdAreaId(prodId),
					offerId:offerId	
				};
				if(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6){//主副卡纳入老用户
					for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
						if(prodId==OrderInfo.oldprodInstInfos[i].prodInstId){
							param.areaId = OrderInfo.oldprodInstInfos[i].areaId;
							param.acctNbr = OrderInfo.oldprodInstInfos[i].accNbr;
						}
					}
				}else{
					param.acctNbr = OrderInfo.getAccessNumber(prodId);
				}
				var dataes = order.uiCusts.queryOfferInst(param);
				if(dataes==undefined){
					return;
				}
				//遍历附属的构成要和主套餐的构成实例要一致（兼容融合套餐）
				var offerMemberInfos=[];
				$.each(dataes.offerMemberInfos,function(){
					var prodInstId=this.objInstId;
					var flag=false;
					$.each(OrderInfo.offer.offerMemberInfos,function(){
						if(this.objInstId==prodInstId){
							flag=true;
							return false;
						}
					});
					if(flag){
						offerMemberInfos.push(this);
					}
				});
				
				offer.offerMemberInfos = dataes.offerMemberInfos=offerMemberInfos;
				offer.offerSpec = dataes.offerSpec;
			}
			var content = "";
			if(offer.offerSpec!=undefined){
				content = CacheData.getOfferProdStr(prodId,offer,1);
			}
			//这里原先是有弹窗提示的，二次加载就不需要了，原方法：_delOffer
			offer.isdel = "Y";
			$span.addClass("del");
			delServByOffer(prodId,offer);
		}
	};
	var _queryOfferInst = function(param,callBackFun) {
		var url= contextPath+"/offer/queryOfferInst";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsJsonGet(url,param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询销售品实例中,请稍后....</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					$.unecOverlay();
					if (response.code==0) {
						if(response.data){
							callBackFun(response.data);
						}
					}else if (response.code==-2){
						$.alertM(response.data);
					}else {
						$.alert("提示","查询销售品实例失败,稍后重试");
					}
				}
			});	
		}else {
			$.ecOverlay("<strong>正在查询销售品实例中,请稍后....</strong>");
			var response = $.callServiceAsJsonGet(url,param);	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data;
				}
			}else if (response.code==-2){
				$.alertM(response.data);
			}else {
				$.alert("提示","查询销售品实例失败,稍后重试");
			}
		}
	};
	
	//删除附属销售品带出删除功能产品
	var delServByOffer = function(prodId,offer){	
		$.each(offer.offerMemberInfos,function(){
			var servId = this.objInstId;
			if($("#check_"+prodId+"_"+servId).attr("checked")=="checked"){
				var serv = CacheData.getServ(prodId,servId);
				if(ec.util.isObj(serv)){
					serv.isdel = "Y";
					var $li = $("#li_"+prodId+"_"+servId);
					$li.removeClass("canshu").addClass("canshu2");
					$li.find("span").addClass("del"); //定位删除的附属
				}
			}
		});
	};
	
	
	//关闭已订购功能[4-1]
	var _closeServSub = function(prodId,servId){
		var $div = $("#li_span_"+prodId+"_"+servId).parent(); //定位删除的附属
		var serv = CacheData.getServ(prodId,servId);
		if(serv!=undefined && serv!=""){
			var $div = $("#li_span_"+prodId+"_"+servId).parent(); //定位删除的附属
			var uim = OrderInfo.getProdUim(prodId);
			if(serv.servSpecId=="280000020" && (OrderInfo.actionFlag==22 || OrderInfo.actionFlag==23) && uim.cardTypeFlag=="1"){//补换卡补4G卡不能退订4G上网功能产品
				$.alert("提示","4G卡不能退订【4G（LTE）上网】功能产品");
				return;
			}
			
			$div.addClass("deldiv");
			serv.isdel = "Y";
		}

	};
	//开通功能产品
	var _openServ = function(prodId,serv){
		if(serv!=undefined){   //在可订购功能产品里面 
			if(serv.servSpecId==""){
				var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
				$span.removeClass("del");
				serv.isdel = "N";
			}else{
				_checkServExcludeDepend(prodId,serv);
			}
		}
	};
	
	
	//校验服务的互斥依赖[4-3-1]
	var _checkServExcludeDependSub = function(prodId,serv,flag){
		var servSpecId = serv.servSpecId;
		var param = CacheData.getExcDepServParam(prodId,servSpecId);
		if(param.orderedServSpecIds.length == 0){
			AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams);
		}else{
			var data = query.offer.queryExcludeDepend(param);  //查询规则校验
			if(data!=undefined){
				paserServDataSub(data.result,prodId,serv);//解析数据
			}
		}
	};
	var paserServDataSub = function(result,prodId,serv){
		var servSpecId = serv.servSpecId;
		var servExclude = result.servSpec.exclude; //互斥
		var servDepend = result.servSpec.depend; //依赖
		var servRelated = result.servSpec.related; //连带
		var content = "";
		//转换接口返回的互斥依赖
		var param = {  
			excludeServ : [],  //互斥依赖显示列表
			dependServ : [], //存放互斥依赖列表
			relatedServ : [] //连带
		};
		
		//解析功能产品互斥
		if(ec.util.isArray(servExclude)){
			$.each(servExclude,function(){
				var servList = CacheData.getServList(prodId); //互斥要去除已订购手动删除
				var flag = true;
				if(servList!=undefined){
					for ( var i = 0; i < servList.length; i++) {
						if(servList[i].isdel=="Y"){
							if(servList[i].servSpecId == this.servSpecId){  //返回互斥数组在已订购中删除，不需要判断
								flag = false;
								break;
							}
						}
					}
				}
				if(flag){
					content += "需要关闭：   " + this.servSpecName + "<br>";
					param.excludeServ.push(this);
				}
			});
		}
		//解析功能产品依赖
		if(ec.util.isArray(servDepend)){
			$.each(servDepend,function(){
				content += "需要开通：   " + this.servSpecName + "<br>";
				param.dependServ.push(this);
			});
		}
		//解析功能产品连带
		if(ec.util.isArray(servRelated)){
			$.each(servRelated,function(){
				content += "需要开通：   " + this.servSpecName + "<br>";
				param.relatedServ.push(this);
			});
		}
		if(content==""){ //没有互斥依赖
			AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams);
		}else{	
			AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams); //添加开通功能
			excludeAddServ(prodId,servSpecId,param);
		}
	};
	
	//校验服务的互斥依赖
	var _checkServExcludeDepend = function(prodId,serv,flag){
		var servSpecId = serv.servSpecId;
		var param = CacheData.getExcDepServParam(prodId,servSpecId);
		if(param.orderedServSpecIds.length == 0){
			AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams);
		}else{
			var data = query.offer.queryExcludeDepend(param);  //查询规则校验
			if(data!=undefined){
				paserServData(data.result,prodId,serv);//解析数据
			}
		}
	};
	
	//点击确认，添加附属销售品发展人[4-4]
	var _addAttachDealerSub = function(id,accessNumbe,objName,roleCode){
		var prodId = id.split("_")[0];
		if($("#tr_"+id)[0]==undefined){ //没有添加过
			var objId = id+"_"+OrderInfo.SEQ.dealerSeq;
			var $tdType = _getDealerTypeSub(id,objId);
			if($tdType==undefined){
				return false;
			}
			var $tr = $("#atr_"+id);
			var $li = $('<li name="tr_'+id+'"></li>');
			var $dl= $("<dl></dl>");
			$dl.append("<dd>"+accessNumbe+"</dd>");
			$dl.append("<dd>"+objName+"</dd>");
			$dl.append($tdType);
			
			var dealer = $("#tr_"+prodId).find("input"); //产品协销人
			var staffId = 1;
			var staffName = "";
			if(dealer[0]==undefined){
				staffId = OrderInfo.staff.staffId;
				staffName = OrderInfo.staff.staffName;
			}else {
				staffId = dealer.attr("staffId");
				staffName = dealer.attr("value");
			}
			if(order.ysl!=undefined){
				var $dd = $('<dd><input type="text" id="dealer_'+objId+'" name="dealer_'+id+'" staffId="'+staffId+'" value="'+staffName+'"  data-mini="true"></input></dd>');
				$dl.append($dd);
			}else{
				var $dd = $('<dd><input type="text" id="dealer_'+objId+'" name="dealer_'+id+'" staffId="'+staffId+'" value="'+staffName+'"  data-mini="true"  readonly="readonly"></input></dd>');
				$dl.append($dd);
			}
			var $button='<dd class="ui-grid"><div class="ui-grid-b"><div class="ui-block-a">';
			$button+='<button data-mini="ture" onclick="order.main.queryStaff(\'dealer\',\''+objId+'\');">选择</button></div>';
			$button+=' <div class="ui-block-b"> <button data-mini="ture" onclick="order.dealer.addProdDealer(this,\''+id+'\')">添加</button></div>';
			$button+=' <div class="ui-block-c"> <button data-mini="ture" onclick="order.dealer.removeDealer(this);">删除</button></div></div></dd>';			
			$dl.append($button);
			$li.append($dl);
			$("#dealerTbody").append($li);
			$.jqmRefresh($("#dealerTbody"));
			OrderInfo.SEQ.dealerSeq++;
		}	
	};
	
	return {
		initSub:_initSub,
		addAttachDealerSub:_addAttachDealerSub,
		checkServExcludeDependSub:_checkServExcludeDependSub,
		openServ:_openServ,
		closeServSub:_closeServSub,
		queryOfferInst:_queryOfferInst,
		getOfferList:_getOfferList,
		delServByOffer:delServByOffer,
		getOffer:_getOffer,
		delOfferSub:_delOfferSub,
		getIsMIFICheck:getIsMIFICheck,
		checkUim:_checkUim,
		setSpec:_setSpec,
		servExDepReByRoleObjs:_servExDepReByRoleObjs,
		checkOfferExcludeDependSub:_checkOfferExcludeDependSub,
		//paserServData:_paserServData,
		setServ2OfferSpecSub:_setServ2OfferSpecSub,
		addOfferSpecSub:_addOfferSpecSub,
		checkServExcludeDepend:_checkServExcludeDepend,
		openServSpecSub:_openServSpecSub,
		opeSer:_opeSer,
		showoffer:_showoffer,
		loadData:_loadData,
		buildMainView:_buildMainView,
		offerChangeView:_offerChangeView,
		buyService:_buyService,
		queryData:_queryData,
		searchPack:_searchPack,
		offerinit:_offerinit,
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
		provIsale 				: _provIsale,

	};
	
})();
$(function() {
//   order.cust.form_valid_init();
//   order.cust.initDic();
});