/**
 * 补换卡
 * 
 * @author wukf
 * date 2013-08-22
 */
CommonUtils.regNamespace("prod","changeUim");

prod.changeUim = (function() {
	
	//初始化
	var _init = function(){
		var prod = order.prodModify.choosedProdInfo;
		//客户级规则校验入参
		var param = {
			"areaId" : OrderInfo.staff.soAreaId, //地区ID
			"custId" : OrderInfo.cust.custId, //客户ID
			"staffId" : OrderInfo.staff.staffId,
			"channelId" : OrderInfo.staff.channelId,
			"boInfos":[{
				"boActionTypeCd": CONST.BO_ACTION_TYPE.CHANGE_CARD,//动作类型
			    "instId" : prod.prodInstId, //实例ID
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
			opeName = "异地补换卡";
			var areaid = prod.areaId;
			if(areaid==undefined || areaid==''){
				$.alert("提示","营业后台未返回产品归属地区，无法办理异地补换卡业务！");
				return false;
			}
		}else{
			areaAtionType = CONST.BO_ACTION_TYPE.CHANGE_CARD;
			opeName = "补换卡";
		}
		var callParam = {
			prodId : prod.prodInstId 	
		};
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,areaAtionType,actionFlag,opeName,"");
		rule.rule.prepare(param,'prod.changeUim.initFillPage',callParam);
		
		$("#dlg_cust_prod").popup("close");
	};
	
	//初始化填单页面
	var _initFillPage = function(param){
		if(!prod.uim.setProdUim()){ //根据UIM类型，设置产品是3G还是4G，并且保存旧卡
			return false;
		}
		var prodInfo = order.prodModify.choosedProdInfo;
		$.callServiceAsHtml(contextPath+"/pad/prod/changeCard", param, {
			"before":function(){
			},
			"done" : function(response){
				$("#order_tab_panel_content").html(response.data).show();
				$.jqmRefresh($("#order_tab_panel_content"));
				$("#fillLastStep").click(function(){
					order.prodModify.cancel();
				});
				$("#nothreelinks").css("display","none");
				$(".ordercon").show();
				$(".ordertabcon").show();
				$(".ordertitle").append(prodInfo.productName+"-"+prodInfo.accNbr);
				order.prepare.step(1);
				$("#orderedprod").hide();
				$("#order_prepare").hide();
//				alert($("#DiffPlaceFlag").val());
				if($("#DiffPlaceFlag").val() == 'diff'){
					$("#uim_txt_" + prodInfo.prodInstId).css("display","none");
					$("#uim_check_btn_" + prodInfo.prodInstId).css("display","none");
					$("#uim_release_btn_" + prodInfo.prodInstId).css("display","none");
					$("#uim_lable").text("写卡：");
				}
				
				var nowActionFalg=OrderInfo.actionFlag;
				
				if(nowActionFalg=="22" || nowActionFalg=="23"){
					var $uimDivs = $("div[id^='uimDiv_']");
					$.each($uimDivs,function(index,$uimDiv){
						$($uimDiv).show();
					});
				}
			},
			"always":function(){
				$.unecOverlay();
			}
		});
	};
	
	//订单提交
	var _submit = function(){
		var prod = order.prodModify.choosedProdInfo;
		var param = {
			prodId : prod.prodInstId,	
			boActionTypeCd : OrderInfo.boActionTypeCd,
			remark : $("#orderRemark").val()
		};
		var busiOrder = [];
		busiOrder.push(OrderInfo.getProdBusiOrder(param));
		SoOrder.submitOrder(busiOrder);
	};
	
	return {
		init				: _init,
		initFillPage		: _initFillPage,
		submit 				: _submit
	};
})();