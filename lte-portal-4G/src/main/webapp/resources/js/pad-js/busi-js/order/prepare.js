/**
 * 订单准备,绑定三个入口及相应初始化数据操作
 * 
 * @author wukf
 * @modifyby liusd
 */
CommonUtils.regNamespace("order", "prepare");
/**
 * 订单准备
 */
order.prepare = (function(){
	//三个入口选择
	var _tabChange= function(){
		$("#ul_busi_area li").each(function(){
			$(this).off("tap").on("tap",function(event){
				OrderInfo.actionFlag= 1;
				var url=$(this).attr("url");
				var forTab = $(this).attr("for");
				if(forTab == "order_tab_panel_phonenumber"){
					var custId = OrderInfo.cust.custId;
					if(OrderInfo.cust==undefined || custId==undefined || custId==""){
						$.alert("提示","在选号码之前请先进行客户定位或者新建客户！");
						return;
					}
				}
				_commonTab(url,forTab);
				event.stopPropagation();});});
		//异地业务隐藏三个入口
		var diffPlaceFlag = $("#diffPlaceFlag").val();
		if (diffPlaceFlag == "diff") {
			$("#order_prepare").hide();
			$("#nothreelinks").show();
		}
		
		//如果有资源ID，则跳转到终端详情
		var mktResCd$ = $("#mktResHidId").attr("mktResCd");
		var offerSpecId$ = $("#offerSpecHidId").val();
		if (mktResCd$ && mktResCd$.length > 0) {
			var url = contextPath+"/pad/mktRes/terminal/prepare";
			var param={};
			var response = $.callServiceAsHtmlGet(url,param);
			var content$=$("#div_public_info");
			content$.html(response.data);
			mktRes.terminal.selectTerminal($("#mktResHidId"));
			$("#order_prepare").hide();
			order.prepare.step(1);//显示"第一步：订单准备"
			_showOrderTitle("", "购手机", true);
			content$.show();
		}else if (offerSpecId$ && offerSpecId$.length > 0) {
			var url = contextPath+"/order/prodoffer/prepare";
			var param={"prodOfferId":offerSpecId$};
			var response = $.callServiceAsHtmlGet(url,param);
			var content$=$("#order_tab_panel_content");
			content$.html(response.data);
			$("#order_prepare").hide();
			order.prepare.step(1);//显示"第一步：订单准备"
			_showOrderTitle("", "办套餐", true);
			content$.show();
			order.service.initSpec();
			order.prodOffer.init();
		}
	};
	var _commonTab=function(url,forTab){
		$.callServiceAsHtmlGet(url,{},{
			"before":function(){
				$.ecOverlay("<strong>查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response || response.code != 0) {
					$.alert("提示","查询失败,稍后重试");
					return;
				}
				if(order.cust.mgr.orderBtnflag=="1"){
					order.cust.mgr.btnQueryCustProdMore();
				};
				order.prepare.step(1);//显示"第一步：订单准备";
				//隐藏所有首页其它内容
				main.home.hideMainAllIco();
				var content$ = $("#order_prepare").html(response.data).fadeIn();
				$.jqmRefresh(content$);
				$("#navbar").slideUp(500);
				
				if (forTab == "order_tab_panel_terminal") {
					_showOrderTitle("", "购手机", true);
					order.service.releaseFlag = 1;
					order.prepare.createorderlonger();
					OrderInfo.busitypeflag=1;
					mktRes.terminal.queryApConfig();
					mktRes.terminal.initInParam('', '', '', '', '');
					mktRes.terminal.btnQueryTerminal(1);
					//回车事件交给键盘go
					$("#form_terminal_qry").off("submit").on("submit",function(e){
						e.preventDefault();//屏蔽form action默认事件
						mktRes.terminal.btnQueryTerminal(1);
					}).find("select").off("change").on("change",function(){
						mktRes.terminal.btnQueryTerminal(1);
						$(this).selectmenu("refresh");
					});
				}else if(forTab == "order_tab_panel_phonenumber"){
					_showOrderTitle("", "选号码", true);
					order.service.releaseFlag = 1;
					order.prepare.createorderlonger();
					OrderInfo.busitypeflag=1;
					mktRes.phoneNbr.initPhonenumber();					
				}else if(forTab == "order_tab_panel_offer"){
					_showOrderTitle("", "办套餐", true);
					//判断是否直接进入新装套餐入口
					if(order.service.releaseFlag==0){
						order.service.releaseFlag = 2;
					}
					order.prepare.createorderlonger();
					OrderInfo.busitypeflag=1;
					initOffer();
					order.service.searchPack();
					mktRes.phoneNbr.resetBoProdAn();
				}
			}
		});	
	};
	
	//初始化套餐入口
	var initOffer = function(){
		query.common.queryApConfig("PROD_AND_OFFER",function(data){
			if(ec.util.isArray(data)){
				$.each(data,function(){
					if(this.OFFER_PRICE){ //价格
						$.each(this.OFFER_PRICE,function(){
							$("#select_price").append("<option value='"+this.COLUMN_VALUE+"'>"+this.COLUMN_VALUE_NAME.replace(/\"/g, "")+"</option>");
						});
						$("#select_price").selectmenu("refresh");
					}else if(this.OFFER_INFLUX){ //流量
						$.each(this.OFFER_INFLUX,function(){
							$("#select_influx").append("<option value='"+this.COLUMN_VALUE+"'>"+this.COLUMN_VALUE_NAME.replace(/\"/g, "")+"</option>");
						});
						$("#select_influx").selectmenu("refresh");
					}else if(this.OFFER_INVOICE){ //语音
						$.each(this.OFFER_INVOICE,function(){
							$("#select_invoice").append("<option value='"+this.COLUMN_VALUE+"'>"+this.COLUMN_VALUE_NAME.replace(/\"/g, "")+"</option>");
						});
						$("#select_invoice").selectmenu("refresh");
					}
				});
			}
		});
		$("#form_prodOffer_qry").off("submit").on("submit",function(e){
			e.preventDefault();//屏蔽form action默认事件
			order.service.searchPack();
		}).find("select").off("change").on("change",function(){
			order.service.searchPack();
			$(this).selectmenu("refresh");
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
		if(boProdAn.accessNumber && !boProdAn.idFlag){
			var param = {
					numType : 1,
					numValue : boProdAn.accessNumber
			};
			$.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param, {
				"done" : function(){}
			});
			order.service.boProdAn = {};
		}
		mktRes.phoneNbr.resetBoProdAn();
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
	};
	
	//订单时长
	var _createorderlonger = function(){
		var url=contextPath+"/order/createorderlonger";
		var response = $.callServiceAsJson(url, {});
		if(response.code==0){
			OrderInfo.orderlonger=response.data;
		}
	};
	
	return {
		tabChange		: _tabChange,
		commonTab		: _commonTab,
		step 			: _step,
		hideStep 		: _hideStep,
		showOrderTitle 	: _showOrderTitle,
		hideOrderTitle 	: _hideOrderTitle,
		backToInit		: _backToInit,
		createorderlonger:_createorderlonger,
		initOffer:initOffer
	};
})();
//初始化
$(function(){
	order.prepare.tabChange();
});