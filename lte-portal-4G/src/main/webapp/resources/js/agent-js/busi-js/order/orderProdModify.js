/**
 * 订单准备
 * 
 * @author tang
 */
CommonUtils.regNamespace("order", "prodModify");
/**
 * 订单准备
 */
order.prodModify = (function(){
	var _choosedProdInfo = {};
	//获取选中的产品信息
	var _getChooseProdInfo = function(obj, flag) {
		$(obj).text("已选");
		var prodInfoTr;
		var prodInfoChildTr;
		// 选择子套餐
		if ("sub" == flag) {
			$(".sub-choose-flag").not(obj).text("选择");
			prodInfoTr = $(obj).parents(".panel-collapse").prev("tr").find("td:eq(0)");
			prodInfoChildTr = $(obj).parent("li");
		} else {
			$(".choose-flag").not(obj).text("选择");
			prodInfoTr = $(obj).parents("tr").find("td:eq(0)");
			prodInfoChildTr = $(obj).parents("tr").next().next().find("tbody td:eq(0)");
		}
//		var prodInfoTr=$("#phoneNumListtbody tr[class='plan_select']").find("td:eq(0)");
//		if(prodInfoTr.attr("accNbr")==undefined){
//			prodInfoTr=$("#phoneNumListtbody tr[class='bg plan_select']").find("td:eq(0)");
//		}
//		var prodInfoChildTr=$("#subphoneNumListtbody tr[class='plan_select2']").find("td:eq(0)");
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
		// 选择产品后 激活下一步按钮
		$("#query-cust-btn").prop("disabled", false);
	};
	var _ischooseOffer=false;
	//选中套餐返回
	var _chooseOfferForMember=function(specId,subpage,specName,offerRoleId){
		OrderInfo.newofferSpecName = specName;
		$("#"+subpage).show();
		$("#"+subpage).html("&nbsp;&nbsp;<span style='color: #327501;'>订购新套餐：</span>"+specName);
		$("#li_"+subpage).attr("addSpecId",specId).attr("addRoleId",offerRoleId).attr("del","N").attr("addSpecName",specName);
		_ischooseOffer=true;
		if(document.getElementById("li_"+subpage)){
			$("#li_"+subpage).css("text-decoration","").attr("del","N").attr("knew","Y");
			$("#li_"+subpage).find("i:first-child").find("a").text("拆副卡");
		}
		
	};
	
	return {
		choosedProdInfo				:		_choosedProdInfo,
		chooseOfferForMember        :      _chooseOfferForMember,
		getChooseProdInfo			:	   _getChooseProdInfo
	};	
})();
