/**
 * 订单准备
 *
 * @author tang
 */
CommonUtils.regNamespace("order", "prepare");
/**
 * 订单准备
 */
order.prepare = (function(){
	//三个入口选择
	var _tabChange= function() {
		OrderInfo.prodAttrs = [];
		$("#order_quick_nav li").each(function () {
			$(this).off("click").on("click", function (event) {
				OrderInfo.actionFlag = 1;
				var url = $(this).attr("url");
				var forTab = $(this).attr("for");
				if (forTab == "order_tab_panel_phonenumber") {
					var custId = OrderInfo.cust.custId;
					if (OrderInfo.cust == undefined || custId == undefined || custId == "") {
						$.alert("提示", "在选号码之前请先进行客户定位或者新建客户！");
						return;
					}
					var authResult = order.prodModify.querySecondBusinessAuth("30", "Y", function () {
						if(custId !="-1"){
							//查分省前置校验开关
					        var propertiesKey = "PRECHECKFLAG_"+OrderInfo.staff.soAreaId.substring(0,3);
					        var isPCF = offerChange.queryPortalProperties(propertiesKey);
					        if(isPCF == "ON"){
					        	if(OrderInfo.preBefore.prcFlag != "Y"){
					        		var checkPre = order.prodModify.preCheckBeforeOrder("30",function () {
					        			callback(event, url, forTab);
					        		});
					                if(checkPre){
					                	callback(event, url, forTab);
					                }
					        	}
					        }else{
					        	callback(event, url, forTab);
					        }
					        OrderInfo.preBefore.prcFlag = "";
						}else{
							callback(event, url, forTab);
						}
						
					});
					if (!authResult) {
						if(custId !="-1"){
							//查分省前置校验开关
					        var propertiesKey = "PRECHECKFLAG_"+OrderInfo.staff.soAreaId.substring(0,3);
					        var isPCF = offerChange.queryPortalProperties(propertiesKey);
					        if(isPCF == "ON"){
					        	if(OrderInfo.preBefore.prcFlag != "Y"){
					        		var checkPre = order.prodModify.preCheckBeforeOrder("30",function () {
					        			callback(event, url, forTab);
					        		});
					        		if(checkPre){
					                	callback(event, url, forTab);
					                }
					        	}
					        }else{
					        	callback(event, url, forTab);
					        }
					        OrderInfo.preBefore.prcFlag = "";
						}else{
							callback(event, url, forTab);
						}
						
					}
				} else {
					callback(event, url, forTab);
				}
			});
		});
		$("#order_nav li").each(function () {
			$(this).off("click").on("click", function (event) {
				OrderInfo.actionFlag = 1;
				var url = $(this).attr("url");
				var forTab = $(this).attr("for");
				if (forTab == "order_tab_panel_phonenumber") {
					var custId = OrderInfo.cust.custId;
					if (OrderInfo.cust == undefined || custId == undefined || custId == "") {
						$.alert("提示", "在选号码之前请先进行客户定位或者新建客户！");
						return;
					}
					var authResult = order.prodModify.querySecondBusinessAuth("30", "Y", function () {
						if(custId !="-1"){
							//查分省前置校验开关
					        var propertiesKey = "PRECHECKFLAG_"+OrderInfo.staff.soAreaId.substring(0,3);
					        var isPCF = offerChange.queryPortalProperties(propertiesKey);
					        if(isPCF == "ON"){
					        	if(OrderInfo.preBefore.prcFlag != "Y"){
					        		var checkPre = order.prodModify.preCheckBeforeOrder("30",function () {
					        			callback(event, url, forTab);
					        		});
					        		if(checkPre){
					        			callback(event, url, forTab);
					        		}
					        	}
					        }else{
					        	callback(event, url, forTab);
					        }
					        OrderInfo.preBefore.prcFlag = "";
						}else{
							callback(event, url, forTab);
						}
					});
					if (!authResult) {
						if(custId !="-1"){
							//查分省前置校验开关
					        var propertiesKey = "PRECHECKFLAG_"+OrderInfo.staff.soAreaId.substring(0,3);
					        var isPCF = offerChange.queryPortalProperties(propertiesKey);
					        if(isPCF == "ON"){
					        	if(OrderInfo.preBefore.prcFlag != "Y"){
					        		var checkPre = order.prodModify.preCheckBeforeOrder("30",function () {
					        			callback(event, url, forTab);
					        		});
					        		if(checkPre){
					        			callback(event, url, forTab);
					        		}
					        	}
					        }else{
					        	callback(event, url, forTab);
					        }
					        OrderInfo.preBefore.prcFlag = "";
						}else{
							callback(event, url, forTab);
						}
					}
				} else {
					callback(event, url, forTab);
				}
			});
		});
		var init=function(){
			var diffPlaceFlag = $("#diffPlaceFlag").val();
			if (diffPlaceFlag == "diff") {
				$("#order_prepare").hide();
				$("#nothreelinks").show();
			}
			var menuName = $("#menuName").attr("menuName");
			if ((ec.util.isObj(menuName) && (CONST.MENU_FANDANG == menuName || CONST.MENU_CUSTFANDANG == menuName || CONST.MENU_RETURNFILE==menuName||CONST.MENU_REMOVEPROD==menuName))) {
				$("#order_prepare").hide();
				$("#nothreelinks").hide();
			}

			//如果有资源ID，则跳转到终端详情
			var mktResCd$ = $("#mktResHidId").attr("mktResCd");
			var offerSpecId$ = $("#offerSpecHidId").val();
			if (mktResCd$ && mktResCd$.length > 0) {
				var url = contextPath + "/mktRes/terminal/prepare";
				var param = {};
				var response = $.callServiceAsHtmlGet(url, param);
				var content$ = $("#order_tab_panel_content");
				content$.html(response.data);
				mktRes.terminal.selectTerminal($("#mktResHidId"));
				$("#order_prepare").hide();
				order.prepare.step(1);//显示"第一步：订单准备"
				_showOrderTitle("", "购手机", true);
				content$.show();
			} else if (offerSpecId$ && offerSpecId$.length > 0) {
				var url = contextPath + "/order/prodoffer/prepare";
				var param = {"prodOfferId": offerSpecId$};
				var response = $.callServiceAsHtmlGet(url, param);
				var content$ = $("#order_tab_panel_content");
				content$.html(response.data);
				$("#order_prepare").hide();
				order.prepare.step(1);//显示"第一步：订单准备"
				_showOrderTitle("", "办套餐", true);
				content$.show();
				order.service.initSpec();
				order.prodOffer.init();
			}
		}
		var callback = function (event, url, forTab) { //异地业务隐藏三个入口
			_commonTab(url, forTab);
			event.stopPropagation();
			init();
		};
		init();
	};
	var _commonTab=function(url,forTab){
		var param={};
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
				if(response.code != 0) {
					$.alert("提示","查询失败,稍后重试");
					return;
				}
				if(order.cust.orderBtnflag=="1"){
					order.cust.btnQueryCustProdMore();
				};
				main.home.hideMainIco();
				$("#order_prepare").hide();
				$("#order_fill_content").hide();
				$("#orderedprod").hide();
				order.prepare.step(1);//显示"第一步：订单准备"
				var content$=$("#order_tab_panel_content");
				content$.html(response.data).show();
				if (forTab == "order_tab_panel_terminal") {
					_showOrderTitle("", "购手机", true);
					order.service.releaseFlag = 1;
					order.prepare.createorderlonger();
					OrderInfo.busitypeflag=1;
					mktRes.terminal.queryApConfig();
					mktRes.terminal.initInParam('', '', '', '', '');
					mktRes.terminal.btnQueryTerminal(1);
				}else if(forTab == "order_tab_panel_phonenumber"){
					_showOrderTitle("", "选号码", true);
					order.service.releaseFlag = 1;
					order.prepare.createorderlonger();
					OrderInfo.busitypeflag=1;
					order.phoneNumber.initPhonenumber();
				}else if(forTab == "order_tab_panel_offer"){
					_showOrderTitle("", "办套餐", true);
					//判断是否直接进入新装套餐入口
					if(order.service.releaseFlag==0){
						order.service.releaseFlag = 2;
					}
					order.prepare.createorderlonger();
					OrderInfo.busitypeflag=1;
					order.service.initSpec();
					order.prodOffer.init();
					order.service.searchPack();
					order.phoneNumber.resetBoProdAn();
				}
			}
		});
	};
	//弹出选择号码窗口
	//subPage入口:终端入口，号码入口，订单填写入口:terminal\offer\number
	//subnum订单序号：O1、O2区分暂存单允许多个订单的情况
	//subFlag选号类型：新装主卡选号、新装副卡选号 Y1、Y2
	var _phoneNumDialog=function(subPage,subFlag,subnum){
		var position=["15%"];
		if ($.browser.mozilla) {
			position=["15%"];
		}
		ec.form.dialog.createDialog({
				"id":"-phonenumber",
				"width":990,
				"height":440,
				"position":position,
				"initCallBack":function(dialogForm,dialog){
					var param={"subPage":subPage};
					var url=contextPath+"/mktRes/phonenumber/prepare";
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
							if(response.code != 0) {
								$.alert("提示","查询失败,稍后重试");
								return;
							}
							order.phoneNumber.dialogForm=dialogForm;
							order.phoneNumber.dialog=dialog;
							var content$=$("#phonenumberContent");
							content$.html(response.data);
							$("#subPage").val(subPage);
							$("#subFlag").val(subFlag);
							$("#subnum").val(subnum);
							order.phoneNumber.initPhonenumber();
						}
					});
				 },
				"submitCallBack":function(dialogForm,dialog){}
		});
	};
	/**
	 * uim卡号释放
	 */
	var _releaseUIM=function(subPage,subflag,subnum){
		if(_checkIsable(subflag,subnum)){
			return;
		}
		var cardNo=$.trim($("#uim_"+subnum).val());
		if(cardNo==''){
			$.alert("提示","UIM卡不能为空!");
			return;
		}
		param = {"oldInstCode":cardNo,"phoneNum":""};
		var url = contextPath+"/mktRes/uim/checkUim";
		$.callServiceAsJson(url,param,{
			"before":function(){
				$.ecOverlay("<strong>UIM卡释放中,请稍等...</strong>");
			},"always":function(){
				$.unecOverlay();
			},"done" : function(response){
				if (response.code == 0) {
					$.alert("提示","UIM卡释放成功!");
					$("#uim_btn_"+subnum).attr('unable','false');
					$("#uim_btn_"+subnum).removeClass("disablepurchase").addClass("purchase");
					$("#uimrelease_btn_"+subnum).attr('unable','true');
					$("#uimrelease_btn_"+subnum).removeClass("purchase").addClass("disablepurchase");
					$("#uim_"+subnum).removeAttr("disabled");
					$("#uim_"+subnum).val("");
					//alert(JSON.stringify(OrderInfo.boProd2Tds));
					//alert(JSON.stringify(OrderInfo.bo2Coupons));
					for(var i=0;i<OrderInfo.boProd2Tds.length;i++){
						if(OrderInfo.boProd2Tds[i].prodId==subnum){
							OrderInfo.boProd2Tds.splice(i,1);
						}
					}
					for(var i=0;i<OrderInfo.bo2Coupons.length;i++){
						if(OrderInfo.bo2Coupons[i].prodId==subnum){
							var coupons=OrderInfo.bo2Coupons[i].coupons;
							if(coupons.length>0){//节点的物品里面已经有数据
								for(var j=0;j<coupons.length;j++){
									if(coupons[j].couponInstanceNumber==cardNo){//之前已经有对应的UIM的物品，替换掉
										OrderInfo.bo2Coupons[i].coupons.splice(j,1);
										sonExist=true;
										break;
									}
								}
							}else{
								OrderInfo.bo2Coupons[i].coupons=[];
							}
						}
					}
					//alert(JSON.stringify(OrderInfo.boProd2Tds));
					//alert(JSON.stringify(OrderInfo.bo2Coupons));
				}else{
					if(typeof response == undefined){
						$.alert("提示","UIM卡释放请求调用失败，可能原因服务停止或者数据解析异常");
					}else if (response.code == -2) {
						$.alertM(response.data);
					}else{
						var msg="";
						if(response.data!=undefined&&response.data.msg!=undefined){
							msg=response.data.msg;
						}else{
							msg="卡号["+cardNo+"]释放失败";
						}
						$.alert("提示","UIM卡释放失败，可能原因:"+msg);
					}
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};

   var _checkIsable=function(subflag,subnum){
	   if(subflag=="0"){
		   if($("#uim_btn_"+subnum).attr('unable')=="true"){
			   return true;
		   }else{
			   return false;
		   }
	   }else if(subflag=="1"){
		   if($("#uimrelease_btn_"+subnum).attr('unable')=="true"){
			   return true;
		   }else{
			   return false;
		   }
	   }else{
		   return true;
	   }
   };
	/**
	 * uim卡号校验
	 */
	var _checkUIM=function(subPage,subflag,subnum){
		if(_checkIsable(subflag,subnum)){
			return;
		}
		var cardNo=$.trim($("#uim_"+subnum).val());
		if(cardNo==''){
			$.alert("提示","UIM卡不能为空!");
			return;
		}
		for(var i=0;i<OrderInfo.boProd2Tds.length;i++){
			if(OrderInfo.boProd2Tds[i].terminalCode==cardNo){
				$.alert("提示","UIM卡已经被预占,请输入其它号码!");
				return;
			}
		}
		var hisCardNo="";
		//var hisCouponId="";
		for(var i=0;i<OrderInfo.boProd2Tds.length;i++){
			if(OrderInfo.boProd2Tds[i].prodId==subnum){
				hisCardNo=OrderInfo.boProd2Tds[i].terminalCode;
				//hisCouponId=OrderInfo.boProd2Tds[i].couponId;
				break;
			}
		}
		var phoneNumber="";
		for(var i=0;i<OrderInfo.boProdAns.length;i++){
			if(OrderInfo.boProdAns[i].prodId==subnum){
				phoneNumber=OrderInfo.boProdAns[i].accessNumber;
				break;
			}
		}
		var prodId = -1;
		var offerId = -1;
		if(OrderInfo.actionFlag==3){ //可选包变更使用
			var prodInfo = order.prodModify.choosedProdInfo;
			phoneNumber = prodInfo.accNbr;
			prodId = prodInfo.prodInstId;
			offerId = prodInfo.prodOfferInstId;
		}
		if(phoneNumber==''){
			$.alert("提示","校验UIM卡前请先选号!");
			return;
		}
		var param = {"instCode":cardNo,"phoneNum":phoneNumber};
		if(hisCardNo!=""){
			param = {"oldInstCode":hisCardNo,"phoneNum":phoneNumber,"newInstCode":cardNo};
		}
		param.olTypeCd = CONST.OL_TYPE_CD.FOUR_G;//增加门户标识
		var url = contextPath+"/mktRes/uim/checkUim";
		$.callServiceAsJson(url,param,{
			"before":function(){
				$.ecOverlay("<strong>UIM卡校验中,请稍等...</strong>");
			},"always":function(){
				$.unecOverlay();
			},"done" : function(response){
				if (response.code == 0) {
					$.alert("提示","UIM卡校验成功!");
					if(subPage=='offer'){
						$("#uim_btn_"+subnum).attr('unable','true');
						$("#uim_btn_"+subnum).removeClass("purchase").addClass("disablepurchase");
						$("#uimrelease_btn_"+subnum).attr('unable','false');
						$("#uimrelease_btn_"+subnum).removeClass("disablepurchase").addClass("purchase");
						$("#uim_"+subnum).attr("disabled",true);
						//$("#uimrelease_btn_"+subnum).off("click").on("click",function(){order.prepare.releaseUIM('offer','1',subnum);});
					}
					//$("#uimCheck_"+subnum).removeClass("order_check_error").addClass("order_check");
					var isExists=false;
					for(var i=0;i<OrderInfo.boProd2Tds.length;i++){
						if(OrderInfo.boProd2Tds[i].prodId==subnum){
							OrderInfo.boProd2Tds[i].terminalCode=cardNo;
							OrderInfo.boProd2Tds[i].couponId=response.data.baseInfo.mktResId;
							isExists=true;
							break;
						}
					}
					if(!isExists){
						var param={
							prodId : subnum, //从填单页面头部div获取
							anTypeCd : "",  //UIM号类型
							deviceModelId : 0, //设备类型ID
							maintainTypeCd : "1",  //默认1
							ownerTypeCd : "",  //待确定
							state : "", //动作
							terminalCode : cardNo, //卡号
							terminalDevId : "", //卡设备实例ID
							terminalDevSpecId : "", //卡设备类型ID
							couponId : response.data.baseInfo.mktResId, //物品ID
							anId : 0 //号码ID
						};
						OrderInfo.boProd2Tds.push(param);
					}
					isExists=false;
					var v_couponNum = response.data.baseInfo.qty ;
					if(v_couponNum==undefined||v_couponNum==null){
						v_couponNum = 1 ;
					}
					var coupon = {
						couponUsageTypeCd : "3", //物品使用类型
						inOutTypeId : "1",  //出入库类型
						inOutReasonId : 0, //出入库原因
						saleId : 1, //销售类型
						couponId :response.data.baseInfo.mktResId, //物品ID
						couponinfoStatusCd : "A", //物品处理状态
						chargeItemCd : CONST.ACCT_ITEM_TYPE.UIM_CHARGE_ITEM_CD, //物品费用项类型
						couponNum : v_couponNum, //物品数量
						storeId : response.data.baseInfo.mktResStoreId, //仓库ID
						storeName : "1", //仓库名称
						agentId : 1, //供应商ID
						apCharge : 0, //物品价格
						couponInstanceNumber : response.data.baseInfo.mktResInstCode, //物品实例编码
						ruleId : "", //物品规则ID
						partyId : OrderInfo.cust.custId, //客户ID
						prodId :prodId, //产品ID
						offerId : offerId, //销售品实例ID
						state : "ADD", //动作
						relaSeq : "" //关联序列
					};
					for(var i=0;i<OrderInfo.bo2Coupons.length;i++){
						var sonExist=false;
						if(OrderInfo.bo2Coupons[i].prodId==subnum){
							var coupons=OrderInfo.bo2Coupons[i].coupons;
							if(coupons.length>0){//节点的物品里面已经有数据
								for(var j=0;j<coupons.length;j++){
									if(coupons[j].couponInstanceNumber==hisCardNo){//之前已经有对应的UIM的物品，替换掉
										OrderInfo.bo2Coupons[i].coupons[j]=coupon;
										sonExist=true;
										break;
									}
								}
							}else{
								OrderInfo.bo2Coupons[i].coupons.push(coupon);
							}
							if(!sonExist){//没有对应的UIM卡
								OrderInfo.bo2Coupons[i].coupons.push(coupon);
							}
							isExists=true;
							break;
						}
					}
					if(!isExists){
						var coupons2=[];
						coupons2.push(coupon);
						var bo2Coupon = {
							prodId : subnum, //从填单页面头部div获取
							coupons : coupons2
						};
						OrderInfo.bo2Coupons.push(bo2Coupon);
					}
				}else{
					if(typeof response == undefined){
						$.alert("提示","UIM卡校验请求调用失败，可能原因服务停止或者数据解析异常");
					}else if (response.code == -2) {
						$.alertM(response.data);
					}else{
						var msg="";
						if(response.data!=undefined&&response.data.msg!=undefined){
							msg=response.data.msg;
						}else{
							msg="卡号["+cardNo+"]预占失败";
						}
						$.alert("提示","UIM卡校验失败，可能原因:"+msg);
					}
//					$("#uimCheck_"+subnum).removeClass("order_check").addClass("order_check_error");
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};

	var _step = function(num) {
		//如果没传参数，默认显示第一步
		if (num == undefined || !num) {
			num = 1;
		}
		if(1==num){
			OrderInfo.order.step=0;
		}
		$.each($("div[id^=step]"),function(i,stepDiv){
			if (num == (i+1)) {
				$(this).show();
			} else {
				$(this).hide();
			}
		});
	};

	var _hideStep = function() {
		$("div[id^=step]").hide();
	};

	var _showOrderTitle = function(action, titleName, backwardFlag){
//		var cont$ = $("<span id='orderTitleSpan'></span>").html(action);
//		var back$ = '';
//		if (backwardFlag == true) {
//			back$ = $("<a href='javascript:void(0);'><span style='float: right;'>返回</span></a>");
//			back$.addClass("numberSearch back3").show().click(function(){order.prepare.backToInit();});
//		}
//		$("#orderTitleDiv h2").html('').append(cont$).append(titleName).append(back$).parent().show();
	};
	var _hideOrderTitle = function() {
		$("#orderTitleDiv").hide();
	};

	var _backToInit=function(){
		//若是购机或选号入口，在退出业务办理时将释放主卡预占的号码（过滤身份证预占的号码）
		var boProdAn = order.service.boProdAn;
		if(boProdAn.idFlag!=undefined&&boProdAn.idFlag=='0'){
		}else if(boProdAn.accessNumber){
			var param = {
				numType : 1,
				numValue : boProdAn.accessNumber
			};
			$.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param, {
				"done" : function(){}
			});
		}
		order.service.boProdAn = {};
		order.phoneNumber.resetBoProdAn();
		_hideOrderTitle();
		$("#step1").hide();
		$("#main_div").hide();
		$("#order_prepare").show();
		$("#order_tab_panel_content").html('');
		if(OrderInfo.actionFlag == 2){
			$("#orderedprod").show();
			$("#arroworder").removeClass();
			$("#arroworder").addClass("arrowup");
		}
		if (CONST.USER_PRE_INSTALLED == $("#iPreInstall").val()) {
			_initPreInstall();//用户预装初始化
		}
	};

	//订单时长
	var _createorderlonger = function(){
		var url=contextPath+"/order/createorderlonger";
		var response = $.callServiceAsJson(url, {});
		if(response.code==0){
			OrderInfo.orderlonger=response.data;
		}
	};

    /**
     * 用户预装初始化
     */
    var _initPreInstall = function () {
        OrderInfo.cust = {};
        OrderInfo.cust = {
            custId: -1,
            partyName: "虚拟客户",
            areaId: $("#_session_staff_info").attr("areaId")
        };
        OrderInfo.boCustIdentities =
        {
            "identidiesTypeCd": "38",
            "identityNum": "999999999",
            "isDefault": "Y",
            "state": "ADD"
        };
        OrderInfo.boCustInfos =
        {
            "addressStr": "虚拟地址",
            "areaId": OrderInfo.cust.areaId,
            "businessPassword": "",
            "defaultIdType": "38",
            "mailAddressStr": "6546546546546",
            "name": "虚拟客户",
            "partyTypeCd": "1",
            "state": "ADD",
            "telNumber": ""
        };
        OrderInfo.boCustProfiles = "";
    };

    /**
     * 是否是用户预装
     * @returns {boolean}
     */
    var _isPreInstall = function () {
		if (CONST.USER_PRE_INSTALLED == $("#iPreInstall").val()) {
            return true;
        } else {
            return false;
        }
    };

	return {
		tabChange:_tabChange,
		phoneNumDialog:_phoneNumDialog,
		checkUIM:_checkUIM,
		step : _step,
		hideStep : _hideStep,
		showOrderTitle : _showOrderTitle,
		hideOrderTitle : _hideOrderTitle,
		backToInit:_backToInit,
		releaseUIM:_releaseUIM,
		createorderlonger:_createorderlonger,
		initPreInstall:_initPreInstall,
        isPreInstall:_isPreInstall
	};
})();
//初始化
$(function(){
	order.prepare.tabChange();
});