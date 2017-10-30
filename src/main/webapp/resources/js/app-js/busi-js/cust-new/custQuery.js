/**
 * 订单准备
 * 
 * @author tang
 */
CommonUtils.regNamespace("custQuery");
/**
 * 订单准备
 */
custQuery = (function(){
	var smsPass = true;
	//客户鉴权跳转权限
	var _jumpAuthflag="";
	var _queryForChooseUser = false;
	var authFlag = null; 
	var _orderBtnflag="";
	var _choosedCustInfo = {};
	var _q_custList = [];//客户定位返回客户列表
	var _choosedProdInfo = {};
	var from_cust = "1";
	var _govSwitch = "";//政企开关
	var _custPic="";//客户读卡照片
	//进入客户定位页面
	var _goQueryCust = function(type){//1非甩单，2甩单
		var param = {"type":type};
		$.callServiceAsHtml(contextPath+"/app/cust/query",param,{
			"before":function(){
				$.ecOverlay("<strong>正在加载中,请稍等...</strong>");
			},"done" : function(response){
				$.unecOverlay();
				if (response.code == -2) {
					$.alertM(response.data);
					return;
				}
				if(OrderInfo.actionFlag == 111){
					$("#sd_tab-box").hide();
					$("#cust").hide();
				}
				$("#home").hide();
				$("#header").show();
//				$("#headText").text("客户定位");
				$("#headText").text("");
				var content$ = $("#queryCust");
				content$.html(response.data).show();
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	
	//新增客户
	var _custCreat = function(type){
		var param = {"newFlag":"Y","actionFlag":"111"};
		$.callServiceAsHtml(contextPath+"/app/cust/realCreate",param,{
			"before":function(){
				$.ecOverlay("<strong>正在加载中,请稍等...</strong>");
			},"done" : function(response){
				$.unecOverlay();
				if (response.code == -2) {
					$.alertM(response.data);
					return;
				}
				var content$ = $("#cust-nav-tab-2");
				content$.html(response.data).show();
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	
	//客户定位证件类型选择事件
	var _custidentidiesTypeCdChoose = function(scope,id) {
		// 非接入号隐藏产品类别选择
//		$("#prodTypeCd").hide();
		$("#"+id).val("");
		$("#"+id).attr("oninput", "value=value.replace(/[^A-Za-z0-9]/ig,'')");
		var identidiesTypeCd=$(scope).val();
		$("#"+id).attr("maxlength","100");
		// 非身份证类型 读卡按钮失效
//		$("#userid").next("span").find("button").prop("disabled", true);
		if(identidiesTypeCd==-1){
			$("#zjsm").hide();
			$("#cpdl").show();
			$("#"+id).attr("oninput", "value=value.replace(/[^0-9-]+/,'')");
			$("#"+id).attr("maxlength","11");
			if(OrderInfo.actionFlag != "9"){
				$("#zdjrhm").show();
				
			}
			$("#"+id).attr("placeHolder","请输入接入号码");
			$("#"+id).removeAttr("readonly");
//			$("#"+id).attr("data-validate","validate(required:请准确填写接入号码) on(keyup)");
		}else if (identidiesTypeCd==1){
			$("#zjsm").show();
			$("#cpdl").hide();
//			$("#userid").next("span").find("button").prop("disabled", false);
			$("#"+id).attr("placeHolder","身份证号码");
			$("#"+id).attr("readonly","readonly");
			$("#"+id).attr("data-validate","validate(idCardCheck:请准确填写身份证号码) on(keyup)");
		}else if(identidiesTypeCd==2){
			$("#"+id).attr("onkeyup", "value=value.replace(/[^A-Za-z0-9\u4e00-\u9fa5]/ig,'')");
			$("#"+id).attr("placeHolder","请输入军官证");
			$("#"+id).attr("data-validate","validate(required:请准确填写军官证) on(keyup)");
		}else if(identidiesTypeCd==3){
			$("#"+id).attr("placeHolder","请输入护照");
			$("#"+id).attr("data-validate","validate(required:请准确填写护照) on(keyup)");
		}else if(identidiesTypeCd==15){
			$("#"+id).attr("onkeyup", "value=value.replace(/[^A-Za-z0-9-]/ig,'')");
			$("#"+id).attr("placeHolder","请输入证件号码");
			$("#"+id).attr("data-validate","validate(required:请准确填写证件号码) on(keyup)");
			$("#"+id).attr("maxlength","20");
			
		}else{
			$("#"+id).attr("placeHolder","请输入证件号码");
			$("#"+id).attr("data-validate","validate(required:请准确填写证件号码) on(keyup)");
		}
		if(identidiesTypeCd!=-1){
			$("#zdjrhm").hide();
		}
	};
	
	//客户定位-查询客户
	var _queryCust = function () {
		// 验证表单数据
		if  (!_identityNumValidate()) {
			return;
		};
		var identityCd="";
		var prodClass = "";
		var idcard="";
		var diffPlace="";
		var acctNbr="";
		var identityNum="";
		var queryType="";
		var queryTypeValue="";
		identityCd=$("#identidiesType").val(); // 证件类型
		identityNum=$.trim($("#userid").val());// 证件号
		//4G所有证件类型定位都需要客户鉴权
		authFlag="0";
		if( OrderInfo.actionFlag == "9" )
		{
			authFlag ="1";
		}
		if(identityCd==-1){
			acctNbr=identityNum;
			identityNum="";
			identityCd="";
		}else if(identityCd=="acctCd"||identityCd=="custNumber"){
			acctNbr="";
			identityNum="";
			identityCd="";
			queryType=$("#identidiesType").val();
			queryTypeValue=$.trim($("#userid").val());

		}
		diffPlace=$("#DiffPlaceFlag").val();
		areaId=$("#p_cust_areaId").val();
		//lte进行受理地区市级验证
//		if(CONST.getAppDesc()==0&&areaId.indexOf("0000")>0){
//			$.alert("提示","省级地区无法进行定位客户,请选择市级地区！");
//			return;
//		}
		var param = {
				"prodClass":prodClass,
				"actionFlag":OrderInfo.actionFlag,
				"acctNbr":acctNbr,
				"identityCd":identityCd,
				"identityNum":identityNum,
				"partyName":"",
				"custQueryType":$("#custQueryType").val(),
				"diffPlace":diffPlace,
				"areaId" : areaId,
				"queryType" :queryType,
				"queryTypeValue":queryTypeValue,
				"identidies_type":$("#identidiesType option:selected").text()
		};
		// 如果是接入号，且开关打开，则添加产品大类字段
//		if ($("#p_cust_identityCd").val() == -1 && "ON" == CacheData.getIntOptSwitch()) {
//			param.prodClass = $("#prodTypeCd").val();
//		}
		$.callServiceAsHtml(contextPath+"/app/cust/getCustList",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				$.unecOverlay();
				if (response.code == -2) {
					return;
				}
//				_queryCallBack(response);
				if(response.data.indexOf("showDiffcode") >=0) {
					$.alert("提示","抱歉，该工号没有异地业务的权限！");
					return;
				}
				if(response.data.indexOf("false") >=0) {
					if(OrderInfo.actionFlag == 111 || (home.menuData.isSecond == "N" && OrderInfo.actionFlag != "115")){
						$.confirm("确认","没有定位到客户，是否新建客户",{ 
							yes:function(){
								$("#cust-nav-tab-1").removeClass("active in");
								$("#cust-nav-tab-2").removeClass("active in");
								$("#cust-nav-tab-2").addClass("active in");
								custQuery.custCreat(identityCd);
							},
							no:function(){	
								return;
							}
						});
					}else{
						$.alert("提示","抱歉，没有定位到客户，请尝试其他客户。");
					}
					return;
				}
				$("#custQuerycontent").hide();
				if(OrderInfo.actionFlag == 111){
					$("#sd_tab-box").show();
				}
				var content$ = $("#cust-query-list");
				content$.html(response.data).show();
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			},"always":function(){
//				$.unecOverlay();
//				$("#usersearchbtn").attr("disabled",false);
			}
		});
	};
	
	var _identityNumValidate = function () {
		var identidiesTypeCd=$("#identidiesType").val();
		var identityNum = $("#userid").val();
		if ("" == $.trim(identityNum)) {
			$.alert("提示","号码不能为空");
			return false;
		}
		if(identidiesTypeCd==-1){
			var reg = /^\d{11}$/;
			if(reg.test(identityNum) === false) {
				$.alert("提示","请准确填写接入号码");
				return false;
			} 
		}else if (identidiesTypeCd==1){
			var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;  
			if(reg.test(identityNum) === false) {
				$.alert("提示","请准确填写身份证号码");
				return false;
			} 
		}else if(identidiesTypeCd==2){
			var reg = /^A-Za-z0-9\u4e00-\u9fa5{1,}$/;
			if(reg.test(identityNum) === false) {
				$.alert("提示","请准确填写军官证");
				return false;
			} 
		}else if(identidiesTypeCd==3){
			
		}else if(identidiesTypeCd==15){
			var reg = /^A-Za-z0-9-{1,20}$/;
			if(reg.test(identityNum) === false) {
				$.alert("提示","请准确填写证件号码");
				return false;
			} 
		}else{
		}
		return true;
	};
	
	//客户列表点击
	var _showCustAuth = function(scope) {
		if("9" != OrderInfo.actionFlag && ($(scope).attr("addressStr")=="" || $(scope).attr("addressStr").length<1)){
			$.alert("提示","该客户缺失证件地址，不能进行业务受理！");
			return false;
		}
		var idCardNum=$("#userid").val();
		var userAge=999;
		if($("#identidiesType").val() == "-1" && $("#isAppointNum").val() == "1"){
			
		}else{
			userAge=cust.getAge(idCardNum,home.nowDateStr);//身份证号定位
		}
		_choosedCustInfo = {
			extCustId : $(scope).attr("extCustId"),
			custId : $(scope).attr("custId"), //$(scope).find("td:eq(3)").text(),
			partyName : $(scope).attr("partyName"), //$(scope).find("td:eq(0)").text(),
			idCardNumber : $(scope).attr("idCardNumber"), //$(scope).find("td:eq(4)").text(),
			identityName : $(scope).attr("identityName"),
			areaName : $(scope).attr("areaName"),
			areaId : $(scope).attr("areaId")+"",
			identityCd :$(scope).attr("identityCd"),
			addressStr :$(scope).attr("addressStr"),
			norTaxPayer :$(scope).attr("norTaxPayer"),
			segmentId :$(scope).attr("segmentId"),
			segmentName :$(scope).attr("segmentName"),
			custFlag :$(scope).attr("custFlag"),
			vipLevel :$(scope).attr("vipLevel"),
			vipLevelName :$(scope).attr("vipLevelName"),
			accNbr:$(scope).attr("accNbr"),
			CN:$(scope).attr("CN"),
			certNum:$(scope).attr("certNum"),
			address:$(scope).attr("address"),
			isGov:$(scope).attr("isGov"),//是否政企客户 Y是
			canRealName:$(scope).attr("canrealname"),
			userIdentityCd: $(scope).attr("userIdentityCd"),//使用人证件类型
	        userIdentityName: $(scope).attr("userIdentityName"),//使用人证件名称
	        userIdentityNum: $(scope).attr("userIdentityNum"),//使用人证件号码
	        accountName: $(scope).attr("accountName"),//账户名
	        userName: $(scope).attr("userName"),//使用人名
	        userCustId: $(scope).attr("userCustId"),//使用人客户id
	        isSame: $(scope).attr("isSame"),//使用人名称与账户名称是否一致
	        age: userAge//客户年龄
			
		};
		custQuery.custPic="";
		if(OrderInfo.cust.identityPic!=undefined){
			custQuery.custPic=OrderInfo.cust.identityPic;//证件照片
		}
		if(OrderInfo.actionFlag != "111" && home.menuData.isProvenceMenu == "Y"){
			$("#custQuerycontent").hide();
			$("#cust-query-list").hide();
			OrderInfo.cust = _choosedCustInfo;
			provence.getRandom();
			return;
		}
		
		if("9" != OrderInfo.actionFlag){
			_choosedCustInfo.CN=_choosedCustInfo.CN.replace(/=/g,"&#61");
			_choosedCustInfo.certNum=_choosedCustInfo.certNum.replace(/=/g,"&#61");
			_choosedCustInfo.address=_choosedCustInfo.address.replace(/=/g,"&#61");
		}
		//设置被选择标识
		$(scope).attr("selected","selected");
		$(scope).siblings().each(function () {
				$(this).removeAttr("selected");
		});
		
		if(_choosedCustInfo.isGov == "Y" && !_choosedCustInfo.userIdentityCd){
			 var param = {
			            "acctNbr": $(scope).attr("accNbr"),
			            "identityCd": $(scope).attr("identityCd"),
			            "areaId": $(scope).attr("areaId"),
			            "custId": $(scope).attr("custId"),
			            "type":"2",
			            "soNbr": UUID.getDataId()
			        };
			 if(ec.util.isObj(param.acctNbr)){
		        	$.callServiceAsJson(contextPath + "/app/cust/queryCustExt", param, {
		                "before": function () {
		                    $.ecOverlay("<strong>正在查询中,请稍等...</strong>");
		                }, "done": function (response) {
		                    if (response.code == 0) {
		            			 if(ec.util.isObj(response.data.identity.identityTypeCd))_choosedCustInfo.userIdentityCd = response.data.identity.identityTypeCd;//使用人证件类型
		            			 if(ec.util.isObj(response.data.identity.identityName))_choosedCustInfo.userIdentityName = response.data.identity.identityName;//使用人证件名称
		            			 if(ec.util.isObj(response.data.identity.identityNum))_choosedCustInfo.userIdentityNum = response.data.identity.identityNum;//使用人证件号码
		            			 if(ec.util.isObj(response.data.identity.certNumEnc))_choosedCustInfo.userCertNumEnc = response.data.identity.certNumEnc;//使用人证件号码加密字段
		            			 if(ec.util.isObj(response.data.identity.certAddress))_choosedCustInfo.userCertAddress = response.data.identity.certAddress;//使用人证件地址
		            			 if(ec.util.isObj(response.data.identity.certAddressEnc))_choosedCustInfo.userCertAddressEnc = response.data.identity.certAddressEnc;//使用人证件地址加密字段
		            			 if(ec.util.isObj(response.data.account.accountName))_choosedCustInfo.accountName = response.data.account.accountName;//账户名
		            			 if(ec.util.isObj(response.data.useCustName))_choosedCustInfo.userName = response.data.useCustName;//使用人名
		            			 if(ec.util.isObj(response.data.useCustNameEnc))_choosedCustInfo.userNameEnc = response.data.useCustNameEnc;//使用人名加密字段
		            			 if(ec.util.isObj(response.data.useCustId))_choosedCustInfo.userCustId = response.data.useCustId;//使用人客户id
		            			 if(ec.util.isObj(response.data.isSame))_choosedCustInfo.isSame = response.data.isSame;//使用人名称与账户名称是否一致
		            			 if(_choosedCustInfo.isGov == "Y"&&_choosedCustInfo.userIdentityCd){//政企客户
		            				cust.checkRealCust(parseInt(_choosedCustInfo.userIdentityCd));
		            			 }
		                    } else {
		                        $.alertM(response.data);
		                    }
		                }
		            });
		        }
		}
		//用户检测 Redmine#1476474营业厅翼支付开户IT流程优化
		if(OrderInfo.actionFlag != "111"){
			if(_choosedCustInfo.isGov == "Y"&&_choosedCustInfo.userIdentityCd){//政企客户
				cust.checkRealCust(parseInt(_choosedCustInfo.userIdentityCd));
			} else {//公众客户
				cust.checkRealCust(parseInt(_choosedCustInfo.identityCd));
			}
		}
		var propertiesKey = "FUKA_SHIYR_"+(OrderInfo.staff.soAreaId+"").substring(0,3);
		cust.userFlag = offerChange.queryPortalProperties(propertiesKey);
		
//		 判断是否是政企客户
//		if(_choosedCustInfo.isGov == "Y" && "19" != OrderInfo.actionFlag){
//			$.alert("提示","政企客户不允许受理该业务！");
//			return;
//		}
		
		if(_choosedCustInfo.isGov != "Y" && "19" == OrderInfo.actionFlag){
			$.alert("提示","客户证件类型为！【"+_choosedCustInfo.identityName+"】，"+"证件号码为："+_choosedCustInfo.idCardNumber+"，当前不能办理此业务！");
			return;
		}
		if("9" != OrderInfo.actionFlag) {
			if ( ec.util.isObj(_choosedCustInfo.canRealName) && 1 == _choosedCustInfo.canRealName) {
				$('#auth3').modal('show');
			}else{
				$.alert("提示","非实名制不能进行此操作");
				return;
			}
		}else {
			if ( ec.util.isObj(_choosedCustInfo.canRealName) && 1 != _choosedCustInfo.canRealName) {
//				$('#auth3').modal('show');
			}else{
				$.alert("提示","实名制不能进行此操作");
				return;
			}
		}
		if(OrderInfo.actionFlag == "9" || OrderInfo.actionFlag == "115"){
			$("#custQuerycontent").hide();
			$("#cust-query-list").hide();
			OrderInfo.cust = _choosedCustInfo;
			_queryCustNext();
			return;
		}
		var showProdType = "N";
		var showCertType = "N";
		var showSmsType = "N";
		var showEmployerUser = "N";
		var showEmployer = "N";
		var showUser = "N";
		
		$("#auth_tab1").hide();
		$("#auth_tab2").hide();
		$("#auth_tab3").hide();
		$("#auth_tab4").hide();
		$("#auth_tab5").hide();
		$("#auth_tab6").hide();
		$("#auth_tab10").hide();
		$("#auth_tab11").hide();
		$("#auth_tab1").attr("class","");
		$("#auth_tab2").attr("class","");
		$("#auth_tab3").attr("class","");
		$("#auth_tab4").attr("class","");
		$("#auth_tab5").attr("class","");
		$("#auth_tab6").attr("class","");
		$("#auth_tab10").attr("class","");
		$("#auth_tab11").attr("class","");
		$("#auth-nav-tab-"+1).removeClass("active in");
		$("#auth-nav-tab-"+2).removeClass("active in");
		$("#auth-nav-tab-"+3).removeClass("active in");
		$("#auth-nav-tab-"+4).removeClass("active in");
		$("#auth-nav-tab-"+5).removeClass("active in");
		$("#auth-nav-tab-"+6).removeClass("active in");
		$("#idCardNumber2").val("");
		$("#idCardNumber5").val("");
		$("#idCardNumber6").val("");
		
		var first_show = 0;//第一个鉴权方式显示标识
		
		//二次业务鉴权
		var af = OrderInfo.actionFlag;
		if(af=="1" || af=="2" || af=="3" || af=="6" || af=="9" || af=="22" || af=="14"){
			_querySecondBusinessAuth();
		}else{
			//指定接入号码才能使用短信鉴权
			if($("#identidiesType").val()=="-1" && $("#isAppointNum").val()=="1"){
				showSmsType = "Y";
				first_show = 3;
				$("#auth_tab3").show();
			}else{
				showSmsType = "N";
			}
			//只有公众客户才能使用身份证鉴权  政企客户不能使用身份证鉴权
			if(_choosedCustInfo.isGov == "N"){
				showCertType = "Y";
				first_show = 2;
				$("#auth_tab2").show();
			}else{
				showCertType = "N";
			}
			//通过接入号码定位才能使用产品密码鉴权
			if($("#identidiesType").val()=="-1"){
				showProdType = "Y";
				first_show = 1;
				$("#auth_tab1").show();
			}else{
				showProdType = "N";
			}
			$("#auth_tab"+first_show).addClass("active");
			$("#auth-nav-tab-"+first_show).addClass("active in");
			if(custQuery.jumpAuthflag=="0"){
				$("#jumpAuth1").show();
				$("#jumpAuth2").show();
				$("#jumpAuth3").show();
				$("#jumpAuth4").show();
				$("#jumpAuth5").show();
				$("#jumpAuth6").show();
			}
		}
		
		if(authFlag=="0"){
			$("#idCardType2").text(_choosedCustInfo.identityName);
			if (_choosedCustInfo.identityCd == "1") {
				$("#readCertBtnID2").show();
				$("#idCardNumber2").attr("disabled", "disabled");
				$("#custAuthbtn").attr("onclick","custQuery.identityTypeAuth('1')");
			} else {
				$("#custAuthbtn").attr("onclick","custQuery.identityTypeAuth('6')");
				$("#readCertBtnID2").hide();
				$("#idCardNumber2").removeAttr("disabled");
			}
			if((OrderInfo.actionFlag == "2" || OrderInfo.actionFlag == "22") && -1==$("#identidiesType").val() && !ec.util.isObj(_choosedCustInfo.accNbr)){
				_choosedCustInfo.accNbr = $.trim($("#userid").val());
			}
			//初始化弹出窗口
			$("#authPassword2").val("");
			$("#idCardNumber2").val("");
			$("#smspwd2").val("");
			$("#num").val("");
		} else{
			_jumpAuth();
		}
	};
	
	//二次业务菜单鉴权方式查询
	var _querySecondBusinessAuth = function(){
		var menuId = "";
		var isSimple = "";
		var first_show = 0;
		var showProdType = "N";
		var showCertType = "N";
		var showSmsType = "N";
		var showEmployerUser = "N";
		var showEmployer = "N";
		var showUser = "N";
		
		if (home.menuData.menuName.indexOf("套餐变更")>=0){
			menuId="1";
			isSimple="N";
		}
		else if (home.menuData.menuName.indexOf("主副卡成员变更")>=0){
			menuId="4";
			isSimple="N";			
		}
		else if (home.menuData.menuName.indexOf("可选包")>=0){
			menuId="3";
			isSimple="N";			
		}
		else if (home.menuData.menuName.indexOf("客户返档")>=0){
			menuId="11";
			isSimple="Y";			
		}
		else if (home.menuData.menuName.indexOf("补换卡")>=0){
			menuId="13";
			isSimple="N";			
		}	
		else if (home.menuData.menuName.indexOf("质押租机")>=0){
			menuId="3";
			isSimple="N";		
		}		
		else if (home.menuData.menuName.indexOf("选号码")>=0){
			menuId="30";
			isSimple="Y";	
		}		
		else if (home.menuData.menuName.indexOf("选套餐")>=0){
			menuId="29";
			isSimple="Y";		
		}		
		else if (home.menuData.menuName.indexOf("购手机")>=0){
			menuId="28";
			isSimple="Y";			
		}		
		else{
			menuId="30";
			isSimple="Y";				
		}

		var url=contextPath+"/secondBusi/querySecondBusinessMenuAuthJson";
		var param={
			menuId:menuId,
			isSimple:isSimple
		};
		$.callServiceAsJson(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
//				alert(JSON.stringify(response));
				$.unecOverlay();
				if(response.code==0){
					var rule1 = response.data.rule1;
					var rule2 = response.data.rule2;
					var rule3 = response.data.rule3;
					var rule4 = response.data.rule4;
					var rule5 = response.data.rule5;
					var rule6 = response.data.rule6;
					var rule7 = response.data.rule7;
					var rule8 = response.data.rule8;
					if (rule2=="Y") {
						showSmsType = "Y";
						first_show = 3;
						$("#auth_tab3").addClass("gz_jq").show();
						
					}
					if (rule1=="Y") {
						showCertType = "Y";
						first_show = 2;
						$("#auth_tab2").addClass("gz_jq").show();
					}
					if (rule3=="Y") {
						showProdType = "Y";
						first_show = 1;
						$("#auth_tab1").addClass("gz_jq").show();
					}

					if("Y" == rule4){
						$("#jumpAuth1").show();
						$("#jumpAuth2").show();
						$("#jumpAuth3").show();
						$("#jumpAuth4").show();
						$("#jumpAuth5").show();
						$("#jumpAuth6").show();
					}
					// 是政企客户
					if (_choosedCustInfo.isGov=="Y") {
						// 没有使用人的情况
						showEmployer = "Y";
							// 有使用人
//							if (rule6=="Y") {
//								showEmployer = "Y";
//								$("#auth_tab4").addClass("zq_jq").show();
//							}
							if (rule5=="Y") {
								showEmployerUser = "Y";
								$("#auth_tab6").addClass("zq_jq").show();
							}
							/*
							  如果返回RULE7 , isSame是true，不展示使用人TAB页面
							  返回RULE8，isSame是true，展示使用人TAB页面 如果返回RULE7 ,
							  isSame是false，展示使用人TAB页面 返回RULE8，isSame是false，不展示使用人TAB页面
							 */
							 
							if (rule7=="Y") {
								if (_choosedCustInfo.isSame=="N") {
									showUser = "Y";
									$("#auth_tab5").addClass("zq_jq").show();
								}
							}
							if (rule8=="Y") {
								if (_choosedCustInfo.isSame=="Y") {
									showUser = "Y";
									$("#auth_tab5").addClass("zq_jq").show();
								}
							}
					}
					$("#auth_tab"+first_show).addClass("active");
					$("#auth-nav-tab-"+first_show).addClass("active in");
				}else{
					$.alert("提示","鉴权方式查询失败，请稍后再试！");
					return false;
				}
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	
	//多种鉴权方式的tab页切换
	var _changeTab = function (tabId) {
		if(tabId == 10){
			var gzObj = $(".gz_jq");
			var zqObj = $(".zq_jq");
			for(var i=0;i<gzObj.length;i++){
				$(gzObj[i]).hide();
			}
			for(var i=0;i<zqObj.length;i++){
				$(zqObj[i]).show();
			}
		}else if(tabId == 11){
			var gzObj = $(".gz_jq");
			var zqObj = $(".zq_jq");
			for(var i=0;i<gzObj.length;i++){
				$(zqObj[i]).hide();
			}
			for(var i=0;i<zqObj.length;i++){
				$(gzObj[i]).show();
			}
		}
		$("#idCardNumber2").val("");
		$("#idCardNumber5").val("");
		$("#idCardNumber6").val("");
		$("#auth-nav-tab-1").removeClass("active in");
		$("#auth-nav-tab-2").removeClass("active in");
		$("#auth-nav-tab-3").removeClass("active in");
		$("#auth-nav-tab-4").removeClass("active in");
		$("#auth-nav-tab-5").removeClass("active in");
		$("#auth-nav-tab-6").removeClass("active in");
		$("#auth-nav-tab-"+tabId).addClass("active in");
	};
	
	//返回是否是自营渠道
	var _isSelfChannel = function () {
		var currentCT = $("#currentCT").val();//渠道类型
		var isSelfChannel = false;
		if (currentCT == CONST.CHANNEL_TYPE_CD.ZQZXDL || currentCT == CONST.CHANNEL_TYPE_CD.GZZXDL
			|| currentCT == CONST.CHANNEL_TYPE_CD.HYKHZXDL || currentCT == CONST.CHANNEL_TYPE_CD.SYKHZXDL
			|| currentCT == CONST.CHANNEL_TYPE_CD.XYKHZXDL || currentCT == CONST.CHANNEL_TYPE_CD.GZZXJL
			|| currentCT == CONST.CHANNEL_TYPE_CD.ZYOUT || currentCT == CONST.CHANNEL_TYPE_CD.ZYINGT
			|| currentCT == CONST.CHANNEL_TYPE_CD.WBT) {
			isSelfChannel = true;
		}
		return isSelfChannel;
	};
	
	//客户鉴权--产品密码
	var _productPwdAuth=function(level){
    
		var param = _choosedCustInfo;
		param.prodPwd = $.trim($("#authPassword2").val());
		if(!ec.util.isObj(param.prodPwd)){
			$.alert("提示","产品密码不能为空！");
			return;
		}
		param.validateType = "3";
		param.accessNumber=_choosedCustInfo.accessNumber;
		param.authFlag=authFlag;

		var recordParam={};
		recordParam.validateType="3";
		recordParam.validateLevel=level;
		recordParam.custId=param.custId;
		recordParam.accessNbr=_choosedCustInfo.accNbr;
		recordParam.certType=param.identityCd;
		recordParam.certNumber=param.idCardNumber;
		$('#auth3').modal('hide'); 
		$.callServiceAsHtml(contextPath+"/agent/cust/custAuth",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				$.unecOverlay();
				if (response.code == -2) {
					recordParam.resultCode = "1";
					_saveAuthRecord(recordParam);
					return;
				}
				if(response.data.indexOf("false") >=0) {
					$.alert("提示","抱歉，您输入的密码有误，请重新输入。");
					recordParam.resultCode = "1";
					_saveAuthRecord(recordParam);
					return;
				}
				//判断能否转为json，可以的话返回的就是错误信息
				try {
					var errorData = $.parseJSON(response.data);
					$.alertMore("异常信息", errorData.resultMsg, errorData.errorStack,"error");
					recordParam.resultCode = "1";
					_saveAuthRecord(recordParam);
					return;
				} catch(e){
				}
				if(!custQuery.queryForChooseUser){
					custInfo = param;
					OrderInfo.boCusts.prodId=-1;
					OrderInfo.boCusts.partyId=_choosedCustInfo.custId;
					OrderInfo.boCusts.partyProductRelaRoleCd="0";
					OrderInfo.boCusts.state="ADD";
					OrderInfo.boCusts.norTaxPayer=_choosedCustInfo.norTaxPayer;

					OrderInfo.cust = _choosedCustInfo;
					if (level == "1") {
						$('#auth3').modal('hide'); 
						_custAuthCallBack(response);
					} else {
						$('#auth3').modal('hide');
					}
				} else {
					//鉴权成功后显示选择使用人弹出框
					order.main.showChooseUserDialog(param);
				}
				recordParam.resultCode = "0";
				_saveAuthRecord(recordParam);
			}
		});
	};
	
	//客户鉴权--证件类型
	var _identityTypeAuth=function(type){
		$('#auth3').modal('hide');
		var cardCd = _choosedCustInfo.identityCd
		var param = _choosedCustInfo;
		param.oldCustId = param.custId;
		param.acctNbr = param.accNbr;
		param.validateType="1";
		param.identityCd=param.identityCd;
		param.identityNum = $.trim($("#idCardNumber2").val());
		if(type=="5"){
			param.identityCd="1";
			param.identityNum = $.trim($("#idCardNumber6").val());
		}
		if(type=="7"){
			param.identityCd="1";
			param.identityNum = $.trim($("#idCardNumber5").val());
		}
		if(!ec.util.isObj(param.identityNum)){
			$.alert("提示","证件号码不能为空！");
			return;
		}
		param.accessNumber=_choosedCustInfo.accNbr;
		param.authFlag=authFlag;

		var recordParam={};
		recordParam.validateType=type;
		recordParam.validateLevel="1";
		recordParam.custId=param.custId;
		recordParam.accessNbr=param.accessNumber;
		recordParam.certType=param.identityCd;
		recordParam.certNumber=param.idCardNumber;
		$.callServiceAsHtml(contextPath+"/app/cust/custCertAuth",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				$.unecOverlay();
				if (response.code != 0) {
					$.alert("提示","鉴权失败");
					recordParam.resultCode = "1";
					_saveAuthRecord(recordParam);
					return;
				}else{
					try {
						var errorData = $.parseJSON(response.data);
						if (ec.util.isObj(errorData) && errorData.successed == false) {
							$.alert("提示", errorData.data);
							recordParam.resultCode = "1";
							_saveAuthRecord(recordParam);
							return;
						}
					} catch(e){
					}
					_choosedCustInfo.identityCd = cardCd;
					if(!custQuery.queryForChooseUser){
						custInfo = param;
						OrderInfo.boCusts.prodId=-1;
						OrderInfo.boCusts.partyId=_choosedCustInfo.custId;
						OrderInfo.boCusts.partyProductRelaRoleCd="0";
						OrderInfo.boCusts.state="ADD";
						OrderInfo.boCusts.norTaxPayer=_choosedCustInfo.norTaxPayer;

						OrderInfo.cust = _choosedCustInfo;
							$('#auth3').modal('hide');
							_custAuthCallBack(response);
					} else {
						//鉴权成功后显示选择使用人弹出框
						order.main.showChooseUserDialog(param);
					}
					recordParam.resultCode = "0";
					_saveAuthRecord(recordParam);
				}
				//window.localStorage.setItem("OrderInfo.cust",JSON.stringify(OrderInfo.cust));
			}
		});
	};
	
	//短信发送
	var _smsResend = function (level) {
		smsPass = true;
		$("#smspwd2").val("");
		var accNbr = "";
		if (level == "1") {
			accNbr = _choosedCustInfo.accNbr;
			if(-1==$("#identidiesType").val()){
				accNbr=$.trim($("#userid").val());
			}
		} else if (level == "2") {
			accNbr = order.prodModify.choosedProdInfo.accNbr;
		}
		if(!ec.util.isObj(accNbr)){
			$.alert("提示","手机号不存在，无法发送短信");
			return;
		}
		var param = {
				"phoneNum":accNbr
			};
		$.callServiceAsJsonGet(contextPath + "/staff/login/custAuthSmsSend", param, {
			"done": function (response) {
				if (response.code == 0) {
					if(response.data==undefined || response.data.phoneNum==undefined || MD5("SMS"+accNbr+"SMS")!=response.data.phoneNum.toUpperCase()){
						$.alert("提示","验证码发送失败！");
						smsPass = false;
						return;
					}
					if(response.data.randomCode != null ){
						$("#num").val(response.data.randomCode);
					}
					$.alert("提示", "验证码发送成功，请及时输入验证.");
				} else if(response.code == -2) {
					$.alert("提示", response.data.errData);
				} else {
					$.alert("提示", response.data);
				}
			}
		});
	};
	
	//短信验证
	var _smsvalid=function(level){
		$('#auth3').modal('hide');
		var params="smspwd="+$("#smspwd2").val();
		if(!ec.util.isObj($("#smspwd2").val())){
			$.alert("提示","验证码不能为空！");
			return;
		}
		if(smsPass == false){
			$.alert("提示","短信校验失败！");
			return;
		}
		var param = _choosedCustInfo;
		var recordParam={};
		recordParam.validateType="2";
		recordParam.validateLevel=level;
		recordParam.custId=param.custId;
		recordParam.accessNbr=param.accNbr;
		recordParam.certType=param.identityCd;
		recordParam.certNumber=param.idCardNumber;


		$.callServiceAsJson(contextPath+"/staff/login/custAuthSmsValid", params, {
			"before":function(){
				$.ecOverlay("<strong>验证短信随机码中,请稍等会儿....</strong>");
			},
			"done" : function(response){
				$.unecOverlay();
				if(response.code==0){
					if(response.data==undefined || response.data.smsPwd==undefined || MD5("SMS"+$("#smspwd2").val()+"SMS")!=response.data.smsPwd.toUpperCase()){
						$.alert("提示","短信校验失败！");
						recordParam.resultCode = "1";
						_saveAuthRecord(recordParam);
						return;
					}
					$('#auth3').modal('hide');
					if (level == "1") {
						var param = _choosedCustInfo;
						param.authFlag="1";
						$.unecOverlay();
						$.callServiceAsHtml(contextPath+"/agent/cust/custAuth",param,{
							"before":function(){
								$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
							},"done" : function(response){
								if(response.code != 0) {
									$.alert("提示","客户鉴权失败,稍后重试");
									return;
								}
								
								if(!custQuery.queryForChooseUser){
									custInfo = param;
									OrderInfo.boCusts.prodId=-1;
									OrderInfo.boCusts.partyId=_choosedCustInfo.custId;
									OrderInfo.boCusts.partyProductRelaRoleCd="0";
									OrderInfo.boCusts.state="ADD";
									OrderInfo.boCusts.norTaxPayer=_choosedCustInfo.norTaxPayer;

									OrderInfo.cust = _choosedCustInfo;
									_custAuthCallBack(response);
								} else {
									//鉴权成功后显示选择使用人弹出框
									order.main.showChooseUserDialog(param);
								}
							},"always":function(){
								$.unecOverlay();
							}
						});
					} else {
						$('#auth3').modal('hide');
					}
					recordParam.resultCode = "0";
					_saveAuthRecord(recordParam);
				}else{
					$.alert("提示",response.data);
					recordParam.resultCode = "1";
					_saveAuthRecord(recordParam);
				}
			},
			"fail" : function(response){
				$.unecOverlay();
				$.alert("提示","短信校验失败！");
				recordParam.resultCode = "1";
				_saveAuthRecord(recordParam);
			}
		});
	};
	
	//证件+使用人鉴权
    var _identityTypeAuthSub=function(){
    	$('#auth3').modal('hide');
    	//单位证件
		var UnitCertificate=$("#danweiNum1").val();
		if(!ec.util.isObj(UnitCertificate)){
			$.alert("提示","单位证件号码不能为空！");
			return;
		}
		//使用人证件
		var PersonCertificate=$("#idCardNumber6").val();
		if(!ec.util.isObj(PersonCertificate)){
			$.alert("提示","使用人证件号码不能为空！");
			return;
		}
		var param = _choosedCustInfo;
		var cardCd = _choosedCustInfo.identityCd
		var recordParam={};
		recordParam.custId=param.custId;
		recordParam.accessNbr=param.accNbr;
		recordParam.certType=param.identityCd;
		recordParam.certNumber=param.idCardNumber;
		//校验单位
		param.validateType="1";
		param.oldCustId = param.custId;
		param.accessNumber=param.accNbr;
		param.acctNbr=param.accNbr;
		param.identityNum = UnitCertificate;
		recordParam.validateType="5";
		recordParam.validateLevel="2";
		$.callServiceAsJson(contextPath+"/app/cust/custCertAuth",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if (response.code != 0) {
					$.unecOverlay();
					$.alert("提示","鉴权失败");
					recordParam.resultCode = "1";
					_saveAuthRecord(recordParam);
					return;
				}
				if(response.code==0){
					try {
						var errorData = $.parseJSON(response.data);
						if (ec.util.isObj(errorData) && errorData.successed == false) {
							$.unecOverlay();
							$.alert("提示", errorData.data);
							recordParam.resultCode = "1";
							_saveAuthRecord(recordParam);
							return;
						}
					} catch(e){
					}
					//单位证件校验成功
					var param2 =_choosedCustInfo;
					param2.validateType="1";
					param2.oldCustId = param2.custId;
					param2.accessNumber=param2.accNbr;
					param2.acctNbr=param.accNbr;
					param2.identityCd="1";
					param2.identityNum =PersonCertificate;
					var response= $.callServiceAsJson(contextPath+"/app/cust/custCertAuth",param2);
					if(response.code==0){
						try {
							var errorData = $.parseJSON(response.data);
							if (ec.util.isObj(errorData) && errorData.successed == false) {
								$.unecOverlay();
								$.alert("提示", errorData.data);
								recordParam.validateType="3";
								recordParam.resultCode = "1";
								_saveAuthRecord(recordParam);
								return;
							}
						} catch(e){
						}
						//单位证件和使用人证件都校验成功
						$.unecOverlay();
						_choosedCustInfo.identityCd = cardCd;
						OrderInfo.cust = _choosedCustInfo;
						recordParam.validateType="3";
						recordParam.resultCode = "0";
						_saveAuthRecord(recordParam);
						_custAuthCallBack(response);
					}
					else{
						//错误
						$.unecOverlay();
						$.alert("提示","鉴权失败");
						recordParam.resultCode = "1";
						_saveAuthRecord(recordParam);
					}
					
				}
				else{
					//错误
					$.unecOverlay();
					$.alert("提示","鉴权失败");
					recordParam.resultCode = "1";
					_saveAuthRecord(recordParam);
				}
			}
		});
    };
    
	//跳过鉴权
	var _jumpAuth = function() {
		if(authFlag=="0" && custQuery.jumpAuthflag!="0"){
			$.alert("提示","没有跳过校验权限！");
			return;
		}
		var param = _choosedCustInfo;
		param.authFlag="1";
		$('#auth3').modal('hide');
		var recordParam={};
		recordParam.validateType="4";
		recordParam.validateLevel="1";
		recordParam.custId=param.custId;
		recordParam.accessNbr=_choosedCustInfo.accNbr;
		recordParam.certType=param.identityCd;
		recordParam.certNumber=param.idCardNumber;
		$.callServiceAsHtml(contextPath+"/agent/cust/custAuth",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","客户鉴权失败,稍后重试");
					recordParam.resultCode = "1";
					_saveAuthRecord(recordParam);
					return;
				}
				if(!custQuery.queryForChooseUser){
					custInfo = param;
					OrderInfo.boCusts.prodId=-1;
					OrderInfo.boCusts.partyId=_choosedCustInfo.custId;
					OrderInfo.boCusts.partyProductRelaRoleCd="0";
					OrderInfo.boCusts.state="ADD";
					OrderInfo.boCusts.norTaxPayer=_choosedCustInfo.norTaxPayer;
					
					OrderInfo.cust = _choosedCustInfo;
					_custAuthCallBack(response);
				} else {
					//鉴权成功后显示选择使用人弹出框
					order.main.showChooseUserDialog(param);
				}
				recordParam.resultCode = "0";
				_saveAuthRecord(recordParam);
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	
	//鉴权方式日志记录
	var _saveAuthRecord=function(param){
		var url=contextPath+"/secondBusi/saveAuthRecord";
		var response= $.callServiceAsJson(url,param);
		if(response.code==0){
			var result=response.data.result;
			CacheData.setRecordId(result.recordId);
		}else{
			$.alertM(response.data);
		}
	};
	
	var _custAuthCallBack = function(response) {
		$("#custQuerycontent").hide();
		$("#cust-query-list").hide();
//		if($.ketchup)
//		$.ketchup.hideAllErrorContainer($("#custCreateForm"));
//		$("#custInfo").html(response.data).show();
//		if("2" == OrderInfo.actionFlag || "22"== OrderInfo.actionFlag ) {
//			if(_choosedCustInfo.accNbr != null && ec.util.isObj(_choosedCustInfo.accNbr) &&(response.data).indexOf("query-cust-prod") != -1) {
//				$("#query-cust-prod").click();
//				$("#query-cust-prod").hide();
//			}
//		}
		if(custQuery.custPic!=""){
			OrderInfo.cust.identityPic=custQuery.custPic;//证件照片
		}	
		_queryCustNext();
	};
	
	var _queryCustNext = function () {
		// 办号卡
		if ("111" == OrderInfo.actionFlag) {
			for(var l=0;l<custQuery.q_custList.length;l++){
				if(custQuery.q_custList[l].custId == OrderInfo.cust.custId){
					OrderInfo.cust.contactInfos = custQuery.q_custList[l].contactInfos;
//					_choosedCustInfo.contactInfos = custQuery.q_custList[l].contactInfos;
				}
			}
			order.broadband.showCust();
			$("#sd_tab-box").show();
			$("#cust").show();
		}else{
			var params={};
			params.method = home.menuData.method;
			params.actionFlag = home.menuData.actionFlag;
			params.enter = home.menuData.enter;
			from_cust = 1;//1表示从客户定位页面进入业务页面
			if(home.menuData.isSecond == "Y"){
				_queryCustProd();
			}else{
				common.callOrderServer(OrderInfo.staff, OrderInfo.cust, order.prodModify.choosedProdInfo, params,from_cust);
				return;
			}
		}
		
	};
	
	//已订购业务
	var _btnQueryCustProdMore=function(param){
		if(OrderInfo.cust.custId==-1){
			$.alert("提示","新建客户无法查询已订购产品！");
			return;
		}
		var curPage=1;
//		$("#prodDetail").hide();
//		$("#prodInfo").hide();
//		$("#prodList").show();
		//$("#orderedprod").show();
//		$("#orderContent").show();
		// 避免因缓存 影响查询
		cust.orderBtnflag = "";
		if(cust.orderBtnflag==""){//初次查询
			//隐藏菜单
//			main.home.hideMainIco();
			_btnQueryCustProd(curPage);
//			$("#orderedprod").show();
//			$("#arroworder").removeClass();
//			$("#arroworder").addClass("arrowup");
//			
//			$(".main_div.location .s_title").css("border-bottom","0px solid #4f7d3f");
//			$("#orderbutton").css({"height":"35px","border-bottom":"1px solid #fff"});
//			$("#orderbutton span").css({"color":"#327501"});
			cust.orderBtnflag="1";
		}
//		else if(order.cust.orderBtnflag=="0"||$("#orderedprod").is(":hidden")){
//			$("#orderedprod").show();
//			$("#arroworder").removeClass();
//			$("#arroworder").addClass("arrowup");
//			
//			$(".main_div.location .s_title").css("border-bottom","0px solid #4f7d3f");
//			$("#orderbutton").css({"height":"35px","border-bottom":"1px solid #fff"});
//			$("#orderbutton span").css({"color":"#327501"});
//			order.cust.orderBtnflag="1";
//			
//		}else{
//			$("#orderedprod").hide();
//			$("#arroworder").removeClass();
//			$("#arroworder").addClass("arrow");
//			order.cust.orderBtnflag="0";
//			$("#orderbutton").css({"height":"24px","border-bottom":"1px solid #4f7d3f"});
//		}
		/*$("#orderbutton").off("click").on("click",function(event){_btnQueryPhoneNumber();event.stopPropagation();});*/
	};
	
	//查询客户产品
	var _queryCustProd=function(){
		var curPage=1;
		//收集参数
		var param={};
		// 如果是接入号，且开关打开，则添加产品大类字段
//		if ($("#p_cust_identityCd").val() == -1 && "ON" == CacheData.getIntOptSwitch()) {
		if ($("#p_cust_identityCd").val() == -1) {
			param.prodClass = $("#prodClass").val();
		}
		if(_choosedCustInfo==null){
			param.custId="";
		}else{
		param.custId=_choosedCustInfo.custId;
		param.areaId =$("#area").attr("areaId");
		}
		// 客户定位指定接入号 已订购只返回该号码信息
		if($("#identidiesType").val() == "-1" && $("#isAppointNum").val() == "1"){
			param.acctNbr=$.trim($("#userid").val());

			if(CONST.getAppDesc()==0){
				param.areaId=$("#p_cust_areaId").val();
			}
		}else {
			param.acctNbr = "";
			if("2" == OrderInfo.actionFlag || "22"== OrderInfo.actionFlag ) {
				if(_choosedCustInfo.accNbr != null && ec.util.isObj(_choosedCustInfo.accNbr))
				{
				    param.acctNbr = _choosedCustInfo.accNbr; 
				}
			}
			
		}
		param.pageSize="";
		param.curPage=curPage;
		param.DiffPlaceFlag="local";
		if(param.custId==null||param.custId==""){
			$.alert("提示","无法查询已订购产品");
			return;
		}
		//请求地址
		var url = contextPath+"/app/cust/orderprod";
		$.callServiceAsHtmlGet(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					 response.data='<div style="margin:2px 0 2px 0;width:100%,height:100%;text-align:center;"><strong>not data return,please try reload again.</strong></div>';
				}
				if (response.code == -2) {
					return;
				}else if(response.code != 0) {
					$.alert("提示","查询失败,稍后重试");
					return;
				}
				$("#cust-query-list").hide();
				var content$=$("#custProd");
				content$.html(response.data).show();
			}
		});	
	};
	
	//获取选中的产品信息
	var _getChooseProdInfo = function(obj, flag) {
//		$(obj).parent().find("button").text("已选");
//		$(obj).text("已选");
		_choosedProdInfo  = {};
		var prodInfoTr;
		var prodInfoChildTr;
		// 选择子套餐
		if ("sub" == flag) {
			$(obj).find("button").text("已选");
			$(".yes_sub").not($(obj).find(".yes_sub")).text("选择");
			prodInfoTr = $(obj).parent();
			prodInfoChildTr = $(obj);
		} else {
			$(obj).parent().find("button").text("已选");
			$(".no_sub").not($(obj).parent().find(".yes_sub")).text("选择");
			prodInfoTr = $(obj).parent().parent();
			prodInfoChildTr = $(obj).parent();
		}
		_choosedProdInfo  = {
			accNbr :prodInfoTr.attr("accNbr"),//产品接入号
			productName :prodInfoTr.attr("productName"),//产品规格名称
			prodStateName :prodInfoTr.attr("prodStateName"),//产品状态名称
			feeTypeName :prodInfoTr.attr("feeTypeName"),//付费方式名称
			prodInstId :prodInfoTr.attr("prodInstId"),//产品ID
			extProdInstId : prodInfoTr.attr("extProdInstId"),//省内产品实例ID
			corProdInstId : prodInfoTr.attr("corProdInstId"),//外部产品实例ID
			prodStateCd :prodInfoTr.attr("prodStateCd"),//产品状态CD
			productId :prodInfoTr.attr("productId"),//产品规格ID
			feeType :prodInfoTr.attr("feeType"),//付费方式id
			prodClass :$(prodInfoTr).attr("prodClass"),//产品大类 4 表示4G；3表示3G
			stopRecordCd :prodInfoTr.attr("stopRecordCd"),//停机记录CD
			stopRecordName :prodInfoTr.attr("stopRecordName"),//停机记录名称
			prodOfferName :prodInfoChildTr.attr("prodOfferName"),//主套餐名称
			custName :prodInfoChildTr.attr("custName"),//所属人客户名称
			startDt :prodInfoChildTr.attr("startDt"),//生效时间
			endDt :prodInfoChildTr.attr("endDt"),//失效时间
			prodOfferId :prodInfoChildTr.attr("prodOfferId"),//主套餐规格ID
			prodOfferInstId :prodInfoChildTr.attr("prodOfferInstId"),//主套餐实例ID
			custId :prodInfoChildTr.attr("custId"),//所属人客户ID
			is3G :prodInfoChildTr.attr("is3G"),//3G/4G主销售品标识
			areaCode :prodInfoTr.attr("zoneNumber"),//产品地区CODE
			areaId : prodInfoTr.attr("areaId"),//产品地区id
			prodBigClass : prodInfoTr.attr("prodBigClass")//产品大类
		};
		OrderInfo.ifLteNewInstall = prodInfoTr.attr("ifLteNewInstall");
		order.prodModify.choosedProdInfo=_choosedProdInfo;
		AttachOffer.main_offer = _choosedProdInfo.prodOfferName;
//		alert(order.prodModify.choosedProdInfo.prodOfferId);
		// 选择产品后 激活下一步按钮
		$("#goOrder").show();
	};
	
	var _goOrder = function(){
		var params = {};
		params.method = home.menuData.method;
		params.actionFlag = home.menuData.actionFlag;
		params.enter = home.menuData.enter;
		common.callOrderServer(OrderInfo.staff, OrderInfo.cust, order.prodModify.choosedProdInfo, params,from_cust);
	}
	return {
		goQueryCust	:	_goQueryCust,
		custidentidiesTypeCdChoose	:	_custidentidiesTypeCdChoose,
		queryCust	:	_queryCust,
		custCreat	:	_custCreat,
		q_custList	:	_q_custList,
		showCustAuth	:	_showCustAuth,
		changeTab	:	_changeTab,
		productPwdAuth	:	_productPwdAuth,
		smsResend	:	_smsResend,
		smsvalid	:	_smsvalid,
		jumpAuth	:	_jumpAuth,
		identityTypeAuth	:	_identityTypeAuth,
		smsvalid	:	_smsvalid,
		saveAuthRecord	:	_saveAuthRecord,
		queryCustNext	:	_queryCustNext,
		getChooseProdInfo	:	_getChooseProdInfo,
		goOrder	    : _goOrder,
		govSwitch	: _govSwitch,
		custPic     : _custPic,
		identityTypeAuthSub		: _identityTypeAuthSub
	};	
})();