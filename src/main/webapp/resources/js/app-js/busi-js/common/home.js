/**
 * app 首页入口
 * 
 */
CommonUtils.regNamespace("home");
home = (function($) { 
	var _sp_flag = "";
	var _homeEnter = "";
	var _appVersion="";
	var _phoneType="";
	var _READ_UIM="";
	var _menuData = {};
	var _getHome = function()
	{
		var method=urlParams.method;// /app/prodModify/custAuth
		$.callServiceAsHtml(contextPath+method,param,{
			"before":function(){
				$.ecOverlay("正在努力加载中，请稍等...");
			},
			"done" : function(response){
				$.unecOverlay();
				$("#load").hide();
				var pp =$("#content").html(response.data);
				$.refresh(pp);
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			}
		});
	};
	
	var _initData = function(method,actionFlag,resourceName,resourceId,needCust)
	{
		if(home.appVersion.length<=0){//无客户端版本号
			 var ua = navigator.userAgent.toLowerCase();
			    var title="信息提示";
				$("#btn-dialog-ok").removeAttr("data-dismiss");
				$('#alert-modal').modal({backdrop: 'static', keyboard: false});
				$("#btn-dialog-ok").off("click").on("click",function(){
					$("#alert-modal").modal("hide");
					if (/iphone|ipad|ipod/.test(ua)) {//跳转下载苹果apk
						window.location= "itms-services://?action=download-manifest&url=https://ct.crm.189.cn:86/phoneimg/app/ios_wan/lteIosApp.plist";		
					} else{	
						home.goDownload();
					}
				});
				$("#modal-title").html(title);
				$("#modal-content").html("您当前的版本已经发生了重大变化，请到http://ct.crm.189.cn/ltePad/上下载翼销售最新版本");
				$("#alert-modal").modal();
				return;
		}
		var params={};
//		alert(method);
//		params.method = method; 
//		method = "/app/prodModify/prepare";
//		method = "/app/order/prodoffer/offerchange/prepare";
//		method = "/app/order/attachoffer/prepare";
//		method = "/app/order/prodoffer/prepare";
//		method = "/app/order/broadband/prepare";
//		method = "/app/amalgamation/prepare";
//		method = "/app/cust/create";
//		method = "/app/prodModify/prepare";
//		method = "/app/mktRes/phonenumber/preNumRelease";
//		method = "/app/infocollect/realname/prepare";
//		method = "/app/marketingRecommend/mktresRecommend";
//		method = "/app/realName/photoCheck/faceVerify";
//		method = "/app/order/prodoffer/memberchange/prepare";
//		method = "/app/amalgamation/prepare";
//		method = "/app/staffMgr/toBindQrCode";
//		method = "/app/push/enter";
//		method = "/app/prodModify/toCheckUimUI";
		
//		resourceName = "选号码";
//		params.method = "/app/order/prodoffer/prepare";
//		resourceName = "返档";
////		
		
//		OrderInfo.actionFlag = 1;
//		home.homeEnter = "1";
		
		menuConst.setMenuData(method, resourceName, resourceId,needCust);
//		home.menuData.isProvenceMenu = "Y";//是否省份菜单
//		home.menuData.needCust	 = "Y";//是否需要客户定位
//		home.setOrderInfoActionFlag(method);
//		params.enter = home.setEnter(resourceName);
		
//		home.menuData.actionFlag = OrderInfo.actionFlag;
//		home.menuData.enter		 = home.homeEnter;
//		home.menuData.method	 = params.method;
//		home.menuData.menuName	 = resourceName;
		if(OrderInfo.actionFlag == "111"){
			common.goKuandai();
		}else if(home.menuData.needCust == "Y"){
			custQuery.goQueryCust(1);//代表非甩单
		}else{
			params.method = home.menuData.method;
			params.actionFlag = home.menuData.actionFlag;
			params.enter = home.menuData.enter;
			if(home.menuData.isProvenceMenu == "Y"){
				provence.getRandom();
				return;
			}else{
				common.callOrderServer(OrderInfo.staff,null,null,params,1);
			}
		}
//		$("#header").show();
//		$("#headText").text(resourceName);
//		return;
		
		
//		var isHaveCust = menuConst.isHave(params.method, resourceName);
//		if(isHaveCust == -1)
//		{
////			alert("不要客户定位");
////			if(method == "/app/cust/create")//客户新增
////			{
////				params.actionFlag = 8;
////			}
//			common.callOrderServer(null,null,null,params,1);
//			$("#header").show();
//			$("#headText").text(resourceName);
//			return;
//		}
		
		
//		if ((resourceName.indexOf("查询") >= 0) || (resourceName.indexOf("预受理") >= 0)
//				|| (resourceName.indexOf("宽带新装") >= 0)|| (resourceName.indexOf("双屏") >= 0)
//				|| ("/app/staffMgr/toBindQrCode"== method))
//		{
//			if(method == "/app/cust/create")//客户新增
//			{
//				params.actionFlag = 8;
//			}
//			common.callOrderServer(null,null,null,params,1);
//			$("#header").show();
//			$("#headText").text(resourceName);
//			return;
//		}
		
//		if (method != "/app/cust/create")
//		{
//			var custId = OrderInfo.cust.custId;
//			
//			if (OrderInfo.cust==undefined || custId==undefined || custId=="")
//			{//未客户定位
//				
//				order.broadband.goCust();
//				$("#header").show();
//				$("#headText").text(resourceName);
//				return;
//			}
//
//		}
		
//		if ((resourceName.indexOf("选套餐") >= 0) || (resourceName.indexOf("选号码") >= 0))
//		{
//			params.actionFlag = 1;
//		}
//		
//		if (method == "/app/amalgamation/prepare")
//		{//融合
//			params.actionFlag = 112;
//		}
//		if (method == "/app/cfq/prepare")
//		{//芝麻信用
//			params.actionFlag = 222;
//		}
//		if (method == "/app/orange/orange-offer")
//		{//质押租机
//			params.actionFlag = 201;
//		}
//		if (method == "/app/cust/create")
//		{//客户新增
//			params.actionFlag = 34;
//		}
		
//		common.callOrderServer(null,null,null,params,1);
//		
//		$("#headText").text(resourceName);
//		return;
	};
	

	var _setOrderInfoActionFlag = function(method)
	{
		if(method == "/app/order/prodoffer/prepare")
		{//办业务，新装
			OrderInfo.actionFlag = 1;
			return;
		}
		if(method == "/app/cust/create")
		{//客户新增
			OrderInfo.actionFlag = 8;
			return;
		}
		if(method == "/app/prodModify/toCheckUimUI")
		{//补换卡
			OrderInfo.actionFlag = 22;
			return;
		}
		if(method == "/app/prodModify/prepare")
		{//客户资料返档
			OrderInfo.actionFlag = 9;
			return;
		}
		if(method == "/app/order/prodoffer/offerchange/prepare")
		{//客户套餐变更
			OrderInfo.actionFlag = 2;
			return;
		}
		if (method == "app/main/changePackageAndService")
		{//可选包变更
			OrderInfo.actionFlag = 3;
			return;
		}
		if (method == "/app/orange/orange-offer")
		{//橙分期
			OrderInfo.actionFlag = 201;
			return;
		}
		if (method == "/app/cfq/prepare")
		{//芝麻信用
			OrderInfo.actionFlag = 222;
			return;
		}
		if (method == "/app/order/prodoffer/memberchange/prepare")
		{//主副卡成员变更
			OrderInfo.actionFlag = 6;
			return;
		}
		if (method == "/app/order/broadband/prepare")
		{//宽带新装(甩单)
			OrderInfo.actionFlag = 111;
			return;
		}
		if (method == "/app/amalgamation/prepare")
		{//宽带新装（融合）
			OrderInfo.actionFlag = 112;
			return;
		}
		if (method == "/app/pay/repair/prepare")
		{//补收费
			OrderInfo.actionFlag = 301;
			return;
		}
//		if (method == "/app/cust/create")
//		{//实名制客户新增
//			OrderInfo.actionFlag = 34;
//			return;
//		}
		if (method == "/app/cust/realCreate")
		{//新用户
			OrderInfo.actionFlag = 35;
			return;
		}
		if (method == "/app/mktRes/terminalListUI")
		{//终端推荐
			OrderInfo.actionFlag = 101;
			return;
		}
		if (method == "/app/infocollect/realname/prepare")
		{//实名信息采集
			OrderInfo.actionFlag = 19;
			return;
		}
		
		
	};
	var _setEnter = function(name)
	{
		if(name.indexOf("套餐") >= 0)
		{
			home.homeEnter = "1";
			return "1";
		}
		if(name.indexOf("手机") >= 0)
		{
			home.homeEnter = "2";
			return "2";
		}
		if(name.indexOf("号码") >= 0)
		{
			home.homeEnter = "3";
			return "3";
		}
		if(name.indexOf("客户新增") >= 0)
		{
			home.homeEnter = "4";
			return "4";
		}
	};
	
	//进入二维码下载页面
	var _goDownload = function(){
		var param = {};
		$.callServiceAsHtml(contextPath+"/app/main/ewm",param,{
			"before":function(){
				$.ecOverlay("<strong>正在加载中,请稍等...</strong>");
			},"done" : function(response){
				$.unecOverlay();
				if (response.code == -2) {
					$.alertM(response.data);
					return;
				}
				$("#home").hide();
				$("#header").show();
				$("#headText").text("");
				var content$ = $("#ewm");
				content$.html(response.data).show();
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	return {
		getHome					:	_getHome,
		initData				:	_initData,
		setOrderInfoActionFlag	:	_setOrderInfoActionFlag,
		setEnter				: 	_setEnter,
		menuData				:	_menuData,
		appVersion              :   _appVersion,
		goDownload              :   _goDownload,
		phoneType				:   _phoneType,
		READ_UIM				:	_READ_UIM,
		sp_flag					:	_sp_flag
	};
})(jQuery);
