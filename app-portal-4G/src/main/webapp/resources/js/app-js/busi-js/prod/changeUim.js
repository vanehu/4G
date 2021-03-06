/**
 * 补换卡
 * 
 * @author wukf
 * date 2013-08-22
 */
CommonUtils.regNamespace("prod","changeUim");

prod.changeUim = (function() {
	
	var _is4GProdInst = null; //是否是4G产品实例
	
	//初始化
	var _init = function(){
		var prodInfo = order.prodModify.choosedProdInfo;
		//客户级规则校验入参
		var param = {
			"areaId" : OrderInfo.staff.soAreaId, //地区ID
			"custId" : OrderInfo.cust.custId, //客户ID
			"staffId" : OrderInfo.staff.staffId,
			"channelId" : OrderInfo.staff.channelId,
			"boInfos":[{
				"boActionTypeCd": CONST.BO_ACTION_TYPE.CHANGE_CARD,//动作类型
			    "instId" : prodInfo.prodInstId, //实例ID
			    "specId" : CONST.PROD_SPEC.CDMA //产品（销售品）规格ID
			}]
		};
		var area = $("#DiffPlaceFlag").val();
		var actionFlag = 22;
		var areaAtionType = "";
		var opeName = "";
		if(area=="diff"){
			actionFlag = 23;
			areaAtionType = CONST.BO_ACTION_TYPE.DIFF_AREA_CHANGE_CARD;
			param.boInfos[0].boActionTypeCd = CONST.BO_ACTION_TYPE.DIFF_AREA_CHANGE_CARD;//异地补换卡，动作类型boActionTypeCd需要改为DIFF_AREA_CHANGE_CARD
			opeName = "异地补换卡";
			var areaid = prodInfo.areaId;
			if(areaid==undefined || areaid==''){
				$.alert("提示","营业后台未返回产品归属地区，无法办理异地补换卡业务！");
				return false;
			}
		}else{
			areaAtionType = CONST.BO_ACTION_TYPE.CHANGE_CARD;
			opeName = "补换卡";
		}
		var callParam = {
			prodId : prodInfo.prodInstId 	
		};
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,areaAtionType,actionFlag,opeName,"");
		rule.rule.prepare(param,'prod.changeUim.initFillPage',callParam);
		order.dealer.initDealer();
	};
	
	
	//初始化(补换卡)
	var _initApp = function(){
		//省内新装
		if((order.prodModify.choosedProdInfo.prodStateCd==CONST.PROD_STATUS_CD.DONE_PROD||
				order.prodModify.choosedProdInfo.prodStateCd==CONST.PROD_STATUS_CD.READY_PROD) && OrderInfo.ifLteNewInstall == 'N'){
			$.alert("提示","当前产品为省内新装且状态为【未激活】,不允许受理该业务！");
			return;
		}
		var prodInfo = order.prodModify.choosedProdInfo;
		//客户级规则校验入参
		var param = {
			"areaId" : OrderInfo.staff.soAreaId, //地区ID
			"custId" : OrderInfo.cust.custId, //客户ID
			"staffId" : OrderInfo.staff.staffId,
			"channelId" : OrderInfo.staff.channelId,
			"boInfos":[{
				"boActionTypeCd": CONST.BO_ACTION_TYPE.CHANGE_CARD,//动作类型
			    "instId" : prodInfo.prodInstId, //实例ID
			    "specId" : CONST.PROD_SPEC.CDMA //产品（销售品）规格ID
			}]
		};
		var actionFlag = 22;
		var areaAtionType = CONST.BO_ACTION_TYPE.CHANGE_CARD;;
		var opeName = "补换卡";
		var callParam = {
			prodId : prodInfo.prodInstId 	
		};
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,areaAtionType,actionFlag,opeName,"");
		rule.rule.prepareApp(param,'prod.changeUim.initFillPageApp',callParam);
		order.dealer.initDealer();
	};
	
	//初始化填单页面
	var _initFillPageApp = function(param){
		if(!prod.uim.setProdUim()){ //根据UIM类型，设置产品是3G还是4G，并且保存旧卡
			return false;
		}
		var prodInfo = order.prodModify.choosedProdInfo;
		$.callServiceAsHtml(contextPath+"/app/prodModify/changeCard", param, {
			"before":function(){
			},
			"done" : function(response){
				$("#btn_checkUim_submit_div").css("display","block");
				var isOut = $("#isOut").val();
				//0 展示uim效验页面 1 展示规则效验
				if(isOut == "0"){
					$("#order_fill_content").html(response.data).show();
				}
				$("#fillLastStep").click(function(){
					order.prodModify.cancel();
				});
				$("#nothreelinks").css("display","none");
				$(".ordercon").show();
				$(".ordertabcon").show();
				$(".h2_title").append(prodInfo.productName+"-"+prodInfo.accNbr);
				//order.prepare.step(1);
				OrderInfo.order.step=1;
				$("#orderedprod").hide();
				$("#order_prepare").hide();
			},
			"always":function(){
				$.unecOverlay();
			}
		});
		
		prod.changeUim.is4GProdInst = query.prod.checkIs4GProdInst(prodInfo); //设置是否是4G产品实例
	};
	
	
	//初始化填单页面
	var _initFillPage = function(param){
		if(!prod.uim.setProdUim()){ //根据UIM类型，设置产品是3G还是4G，并且保存旧卡
			return false;
		}
		var prodInfo = order.prodModify.choosedProdInfo;
		$.callServiceAsHtml(contextPath+"/app/prodModify/changeCard", param, {
			"before":function(){
			},
			"done" : function(response){
				$("#checkUim_btn").css("display","none");
				$("#order_fill_content").html(response.data).show();
				$("#fillLastStep").click(function(){
					order.prodModify.cancel();
				});
				$("#nothreelinks").css("display","none");
				$(".ordercon").show();
				$(".ordertabcon").show();
				$(".h2_title").append(prodInfo.productName+"-"+prodInfo.accNbr);
				//order.prepare.step(1); 
				$("#orderedprod").hide();
				$("#order_prepare").hide();
			},
			"always":function(){
				$.unecOverlay();
			}
		});
		
		prod.changeUim.is4GProdInst = query.prod.checkIs4GProdInst(prodInfo); //设置是否是4G产品实例
	};
	
	//订单提交
	var _submit = function(){
		var prod = order.prodModify.choosedProdInfo;
		var param = {
			prodId : prod.prodInstId,	
			boActionTypeCd : OrderInfo.boActionTypeCd,
			remark : $("#order_remark").val()
		};
		var busiOrder = [];
		busiOrder.push(OrderInfo.getProdBusiOrder(param));
		AttachOffer.setAttachBusiOrder(busiOrder);	
	    SoOrder.submitOrder(busiOrder);
	};
	
	var _changeUimSel = function (scope){
		$("#selUimType").val($(scope).val());
	};
	
	
	return {
		init				: _init,
		initFillPage		: _initFillPage,
		submit 				: _submit,
		is4GProdInst		: _is4GProdInst,
		changeUimSel        : _changeUimSel,
		initApp        : _initApp,
		initFillPageApp        : _initFillPageApp
	};
})();