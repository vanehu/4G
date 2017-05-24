/**
 * 菜单信息
 * 
 */
CommonUtils.regNamespace("menuConst");
menuConst = (function($) { 
	
	var _constMenuData = [
		{"menuPath":"/app/staffMgr/toBindQrCode","resourName":"二维码扫描登录","actionFlag":"","enter":"","isSecond":"N"}
		,{"menuPath":"/app/push/enter","resourName":"双屏互动","actionFlag":"","enter":"","isSecond":"N"}
		,{"menuPath":"/app/pay/repair/prepare","resourName":"补缴费","actionFlag":"","enter":"","isSecond":"N"}
		,{"menuPath":"/app/mktRes/terminalListUI","resourName":"终端推荐","actionFlag":"","enter":"","isSecond":"N"}
		,{"menuPath":"/app/order/broadband/prepare","resourName":"宽带新装","actionFlag":"","enter":"","isSecond":"N"}
	];
	var _noCustMenuData = [
		{"menuPath":"/app/order/prodoffer/prepare","resourName":"选套餐","actionFlag":"","enter":"","isSecond":"N"}
		,{"menuPath":"/app/order/prodoffer/prepare","resourName":"选号码","actionFlag":"","enter":"","isSecond":"N"}
		,{"menuPath":"/app/order/prodoffer/prepare","resourName":"购手机","actionFlag":"","enter":"","isSecond":"N"}
		,{"menuPath":"/app/order/prodoffer/offerchange/prepare","resourName":"套餐变更","actionFlag":"","enter":"","isSecond":"N"}
		,{"menuPath":"/app/order/attachoffer/prepare","resourName":"可选包变更","actionFlag":"","enter":"","isSecond":"N"}
		,{"menuPath":"/app/prodModify/prepare","resourName":"客户返档","actionFlag":"","enter":"","isSecond":"N"}
		,{"menuPath":"/app/prodModify/toCheckUimUI","resourName":"补换卡","actionFlag":"","enter":"","isSecond":"N"}
		,{"menuPath":"/app/infocollect/realname/prepare","resourName":"实名信息采集","actionFlag":"","enter":"","isSecond":"N"}
	];
	
	var menuList = [
	         {"menuPath":"/app/staffMgr/toBindQrCode","resourName":"二维码扫描登录","actionFlag":"","enter":"","isSecond":"N","needCust":"N"}
			,{"menuPath":"/app/push/enter","resourName":"双屏互动","actionFlag":"110","enter":"","isSecond":"N","needCust":"N"}
			,{"menuPath":"/app/pay/repair/prepare","resourName":"补缴费","actionFlag":"301","enter":"","isSecond":"N","needCust":"N"}
			,{"menuPath":"/app/mktRes/terminalListUI","resourName":"终端推荐","actionFlag":"101","enter":"","isSecond":"N","needCust":"N"}
			,{"menuPath":"/app/order/broadband/prepare","resourName":"宽带新装","actionFlag":"111","enter":"","isSecond":"N","needCust":"N"}
			,{"menuPath":"/app/amalgamation/prepare","resourName":"融合新装","actionFlag":"112","enter":"","isSecond":"N","needCust":"Y"}
			,{"menuPath":"/app/order/prodoffer/prepare","resourName":"选套餐","actionFlag":"1","enter":"1","isSecond":"N","needCust":"Y"}
			,{"menuPath":"/app/order/prodoffer/prepare","resourName":"选号码","actionFlag":"1","enter":"3","isSecond":"N","needCust":"Y"}
			,{"menuPath":"/app/order/prodoffer/prepare","resourName":"购手机","actionFlag":"14","enter":"2","isSecond":"N","needCust":"Y"}
			,{"menuPath":"/app/order/prodoffer/offerchange/prepare","resourName":"套餐变更","actionFlag":"2","enter":"","isSecond":"Y","needCust":"Y"}
			,{"menuPath":"/app/order/attachoffer/prepare","resourName":"可选包变更","actionFlag":"3","enter":"","isSecond":"Y","needCust":"Y"}
			,{"menuPath":"/app/order/prodoffer/memberchange/prepare","resourName":"主副卡成员变更","actionFlag":"6","enter":"","isSecond":"Y","needCust":"Y"}
			,{"menuPath":"/app/cust/create","resourName":"客户新增","actionFlag":"8","enter":"","isSecond":"N","needCust":"N"}
			,{"menuPath":"/app/prodModify/prepare","resourName":"客户返档","actionFlag":"9","enter":"","isSecond":"Y","needCust":"Y"}
			,{"menuPath":"/app/prodModify/toCheckUimUI","resourName":"补换卡","actionFlag":"22","enter":"","isSecond":"Y","needCust":"Y"}
			,{"menuPath":"/app/infocollect/realname/prepare","resourName":"实名信息采集","actionFlag":"19","enter":"","isSecond":"N","needCust":"Y"}
			,{"menuPath":"/app/cfq/prepare","resourName":"芝麻信用","actionFlag":"222","enter":"","isSecond":"N","needCust":"Y"}
			,{"menuPath":"/app/orange/orange-offer","resourName":"橙分期","actionFlag":"201","enter":"","isSecond":"N","needCust":"Y"}
			
			,{"menuPath":"/app/report/cartMain","resourName":"订单查询","actionFlag":"40","enter":"","isSecond":"N","needCust":"N"}
			,{"menuPath":"/app/mktRes/phonenumber/preNumRelease","resourName":"资源释放","actionFlag":"114","enter":"","isSecond":"N","needCust":"N"}
			,{"menuPath":"/app/report/terminalSalesMain","resourName":"终端销售统计","actionFlag":"150","enter":"","isSecond":"N","needCust":"N"}
			,{"menuPath":"/app/report/statisticsCartMain","resourName":"受理订单统计","actionFlag":"40","enter":"","isSecond":"N","needCust":"N"}
			,{"menuPath":"/app/report/statisticsCompleteCartMain","resourName":"竣工订单查询","actionFlag":"40","enter":"","isSecond":"N","needCust":"N"}
		];
	var _isHave = function(path,name)
	{  
		var resultMenu;
		for (var i = 0;i<menuConst.noCustMenuData.length;i++)
		{
//		var menu = {};
//		for (menu in menuConst.noCustMenuData)
//		{
//		}
			var menu = menuConst.noCustMenuData[i];
			if (menu.menuPath == path ||  name == menu.resourName)
			{
				resultMenu = menu;
			
				break;
			}
			
		}
		if (resultMenu == null)
		{
			return -1;
		}
		return resultMenu;
	}
	
	var _setMenuData = function(method,menuName,menuId,needCust){
		home.menuData = {};
		home.menuData.menuId = menuId;
		var i = 0;
		for (i = 0;i<menuList.length;i++)
		{
			var menu = menuList[i];
			if (menu.menuPath == method ||  menuName == menu.resourName)
			{
				home.menuData.actionFlag = menu.actionFlag;
				home.menuData.enter		 = menu.enter;
				home.menuData.method	 = method;
				home.menuData.needCust	 = menu.needCust;
				home.menuData.isSecond	 = menu.isSecond;
				home.menuData.menuName	 = menuName;
				OrderInfo.actionFlag	 = menu.actionFlag;
				break;
			}
			if (menuName == "选号码")
			{
				home.menuData.actionFlag = "1";
				home.menuData.enter		 = "3";
				home.menuData.method	 = method;
				home.menuData.needCust	 = "Y";
				home.menuData.isSecond	 = "N";
				home.menuData.menuName	 = menuName;
				OrderInfo.actionFlag	 = "1";
				break;
			}
			if (menuName == "购手机")
			{
				home.menuData.actionFlag = "14";
				home.menuData.enter		 = "2";
				home.menuData.method	 = method;
				home.menuData.needCust	 = "Y";
				home.menuData.isSecond	 = "N";
				home.menuData.menuName	 = menuName;
				OrderInfo.actionFlag	 = "14";
				break;
			}
			
			if (method == "prov_menu")
			{
				home.menuData.isProvenceMenu = "Y";//是否省份菜单
				home.menuData.actionFlag = "1000000000";
				home.menuData.enter		 = "1";
				home.menuData.method	 = method;
				if(needCust!=undefined && needCust.length>0){
					home.menuData.needCust	 = needCust;
				}else{
					home.menuData.needCust	 = "Y";
				}
				home.menuData.isSecond	 = "N";
				home.menuData.menuName	 = menuName;
				OrderInfo.actionFlag	 = "1000000000";
				break;
			}
			
		}
		if(i == menuList.length){
			home.menuData.method	 = method;
			home.menuData.needCust	 = "N";
			home.menuData.isSecond	 = "N";
			home.menuData.menuName	 = menuName;
			home.menuData.actionFlag = "";
			home.menuData.enter		 = "";
		}
	}
	
	return {
		setMenuData	:	_setMenuData,
		isHave			:_isHave,
		noCustMenuData	:_noCustMenuData
		
	};
})(jQuery);
