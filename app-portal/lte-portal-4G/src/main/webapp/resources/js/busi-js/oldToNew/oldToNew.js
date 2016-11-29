/**
 * 以旧换新
 */
CommonUtils.regNamespace("oldToNew");

oldToNew = (function(){
	var _formCheckInfo = {}; //保存在提交前的以旧换新表单校验数据
	var _configAttrIds = []; //配置信息保存
	var _PHONE_TYPE = "800000021"; //型号的规格ID
	
	//初始化
	var _init = function(){
		_initConfigAttrIds();
		_checkToQueryDiscountPrice();
		_initBind();
	};
	
	var _initBind = function(){
		//配置数据变更时联动查询回购价格可选范围
		$('[name^="couponConfigInfo_"]').off('change').on('change', function(){
			_checkToQueryDiscountPrice();
		});
		//保存提交按钮
		$('#oldToNewForm').off("formIsValid").on("formIsValid",function(event) {
			_submitOldToNewForm();
		}).ketchup({bindElement:"submitOldToNewFormBtn"});
		//旧串码校验
		$('#chkOldCouponNumber').off('click').on('click', function(){
			_checkOldCouponNumber();
		});
		//新串码校验
		$('#chkNewCouponNumber').off('click').on('click', function(){
			_checkNewCouponNumber();
		});
	};
	
	var _initConfigAttrIds = function(){
		var attrIds = [];
		for(var i=0; i<$('[name^="couponConfigInfo_"]').length; i++){
			var $dom = $($('[name^="couponConfigInfo_"]')[i]);
			var attrId = $dom.attr('attrId');
			var exist = false;
			for(var j=0; j<attrIds.length;j++){
				if(attrIds[j] == attrId){
					exist = true;
					break;
				}
			}
			if(!exist){
				attrIds.push(attrId);
			}
		}
		oldToNew.configAttrIds = attrIds;
	};
	
	//配置数据变更时联动查询回购价格可选范围，未确定配置信息时不可选
	var _checkToQueryDiscountPrice = function(){
		var allSet = true;
		var couponAttrs = [];
		var attrIds = oldToNew.configAttrIds;
		for(var i=0; i<attrIds.length; i++){
			var $dom = $('[name="couponConfigInfo_'+attrIds[i]+'"]:checked');
			var value = $dom.val();
			if(value == null || value == undefined){
				allSet = false;
				break;
			} else {
				couponAttrs.push({
					attrId : $dom.attr('attrId'),
					valueId : value,
					value : $dom.attr('attrValue')
				});
			}
		}
		if(allSet){
//		oldToNew.formCheckInfo.couponAttrs = couponAttrs;
			_queryDiscountPrice({couponAttrs : couponAttrs});
		} else {
			$('#discountPrice').attr('disabled', 'disabled');
		}
	};
	
	//根据选择的配置数据查询回购价格可选范围
	var _queryDiscountPrice = function(couponAttrs){
		for(var i=0;i<couponAttrs.couponAttrs.length;i++){
			if(couponAttrs.couponAttrs[i].attrId == _PHONE_TYPE && couponAttrs.couponAttrs[i].value == '-1'){ //型号值为-1（"其他"）时，手动输入价格
				_enableDiscountPrice('input');
				return;
			}
		}
		
		$('[name="discountPrice"]').attr('disabled', 'disabled');
		var url = contextPath + "/order/queryOldCouponDiscountPrice";
		$.callServiceAsJson(url, couponAttrs, {"before":function(){
			$.ecOverlay("<strong>查询中,请稍等...</strong>");
		},"done":function(response){
			if (response.code == -2) {
				$.alertM(response.data);
			} else if(response.code == 0){
				var data = response.data;
				if(data && data.result && data.result.discountPrice && data.result.discountPrice.length){
					if(data.result.discountPrice.length == 1 && data.result.discountPrice[0] == -1){ //返回回购价格为-1时，手动输入价格
						_enableDiscountPrice('input');
					} else {
						$("select[name='discountPrice']").empty();
						for(var i=0;i<data.result.discountPrice.length;i++){
							var price = data.result.discountPrice[i]; //单位：分
							$("select[name='discountPrice']").append("<option value='"+price+"' >"+(price/100)+"</option>");
						}
						_enableDiscountPrice('select');
					}
					
				}
			}
		},"always":function(){
			$.unecOverlay();
		}});
	};
	
	//切换discountPrice为手动输入或者选择框
	var _enableDiscountPrice = function(type){
		if(type == 'input'){
			$("select[name='discountPrice']").empty().removeAttr('id').attr('disabled', 'disabled').css('display', 'none');
			$("input[name='discountPrice']").val('').attr({'id' : 'discountPrice','data-validate' : 'validate(digits) on(keyup blur)', 'placeholder' : '请输入回购价格'}).removeAttr('disabled').css('display', 'inline');
		} else if(type == 'select'){
			$("input[name='discountPrice']").val('').removeAttr('id').removeAttr('data-validate').attr('disabled', 'disabled').css('display', 'none');
			$("select[name='discountPrice']").attr('id', 'discountPrice').removeAttr('disabled').css('display', 'inline');
		}
		//保存提交按钮
		$('#oldToNewForm').off("formIsValid").on("formIsValid",function(event) {
			_submitOldToNewForm();
		}).ketchup({bindElement:"submitOldToNewFormBtn"});
	};
	
	//校验旧串码是否已经办理过以旧换新（后台）
	var _checkOldCouponNumber = function(){
		var oldCouponNumber = $("#oldCouponNumber").val();
		if(oldCouponNumber == null || $.trim(oldCouponNumber) == ""){
			$.alert('提示', '请输入串码');
			return;
		}
		var url = contextPath + "/order/checkNewOldCoupon";
		$.callServiceAsJson(url, {oldCouponNumber : oldCouponNumber}, {"before":function(){
			$.ecOverlay("<strong>查询中,请稍等...</strong>");
		},"done":function(response){
			if (response.code == -2) {
				$.alertM(response.data);
			} else if(response.code == 0){
				var data = response.data;
				if(data && data.result && data.result.ifBound == 'N'){ //判断并保存校验结果
					oldToNew.formCheckInfo.oldCouponNumber = oldCouponNumber;
					$.alert('提示', '回购产品串码校验成功');
				} else {
					oldToNew.formCheckInfo.oldCouponNumber = null;
					$.alert('提示', '回购产品串码校验失败');
				}
			}
		},"always":function(){
			$.unecOverlay();
		}});
	};
	
	//校验新串码是否可以办理以旧换新（后台+营销资源）
	var _checkNewCouponNumber = function(){
		var newCouponNumber = $("#newCouponNumber").val();
		if(newCouponNumber == null || $.trim(newCouponNumber) == ""){
			$.alert('提示', '请输入串码');
			return;
		}
		
		//先后台校验是否可办理以旧换新,后台校验通过后调用资源接口校验
		var url = contextPath + "/order/checkNewOldCoupon";
		$.callServiceAsJson(url, {newCouponNumber : newCouponNumber}, {"before":function(){
			$.ecOverlay("<strong>查询中,请稍等...</strong>");
		},"done":function(response){
			if (response.code == -2) {
				$.alertM(response.data);
			} else if(response.code == 0){
				var data = response.data;
				if(data && data.result && data.result.ifBound == 'N'){
					//后台校验通过后调用资源接口校验
					var param = {
						instCode : newCouponNumber,
						flag : '2' //2：标识以旧换新新串码校验
					};
					var data = query.prod.checkTerminal(param);
					if(data==undefined){
						return;
					}
					if(data.statusCd==CONST.MKTRES_STATUS.USABLE){
						$.alert("信息提示",data.message);
						var mktColor="";
						if(ec.util.isArray(data.mktAttrList)){
							$.each(data.mktAttrList,function(){
								if(this.attrId=="60010004"){
									mktColor=this.attrValue;
								}
							});
						}
						$("#newCouponDesc").html(data.mktResName+", "+mktColor);
						$("#newCouponDescDiv").css("display","block");
						//保存新终端校验信息
						oldToNew.formCheckInfo.newCouponNumber = data.instCode; //物品实例编码
						oldToNew.formCheckInfo.newCouponId = data.mktResId; //终端规格
					}else if(data.statusCd==CONST.MKTRES_STATUS.HAVESALE){
						$.alert("提示","终端当前状态为已销售未补贴[1115],只有在办理话补合约时可用");
					}else{
						$.alert("提示",data.message);
					}
				} else if(data && data.result && data.result.ifBound == 'Y'){
					$.alert('提示', '新产品串码校验失败，该串码已绑定以旧换新业务。');
				} else {
					$.alert('提示', '新产品串码校验失败');
				}
			}
		},"always":function(){
			$.unecOverlay();
		}});
		
		
//		var param = {
//			instCode : newCouponNumber,
//			flag : '2' //2：标识以旧换新新串码校验
//		};
//		var data = query.prod.checkTerminal(param);
//		if(data==undefined){
//			return;
//		}
//		if(data.statusCd==CONST.MKTRES_STATUS.USABLE){
//			$.alert("信息提示",data.message);
//			var mktColor="";
//			if(ec.util.isArray(data.mktAttrList)){
//				$.each(data.mktAttrList,function(){
//					if(this.attrId=="60010004"){
//						mktColor=this.attrValue;
//					}
//				});
//			}
//			$("#newCouponDesc").html("终端规格："+data.mktResName+",终端颜色："+mktColor);
//			$("#newCouponDescDiv").css("display","block");
//			//保存新终端校验信息
//			oldToNew.formCheckInfo.newCouponNumber = data.instCode; //物品实例编码
//			oldToNew.formCheckInfo.newCouponId = data.mktResId; //终端规格
//		}else if(data.statusCd==CONST.MKTRES_STATUS.HAVESALE){
//			$.alert("提示","终端当前状态为已销售未补贴[1115],只有在办理话补合约时可用");
//		}else{
//			$.alert("提示",data.message);
//		}
	};
	
	//提交表单，新旧串码关系保存
	var _submitOldToNewForm = function(){
		if(!oldToNew.formCheckInfo.oldCouponNumber){
			$.alert("提示", "请填写并校验回购产品串码");
			return;
		}
		if(!oldToNew.formCheckInfo.newCouponNumber || !oldToNew.formCheckInfo.newCouponId){
			$.alert("提示", "请填写并校验新产品串码");
			return;
		}
		var remark = $('#remark').val();
		var custName = $('#custName').val();
		var certNumber = $('#custIdNumber').val();
		var contactAddress = $('#custAddress').val();
		var contactPhoneNumber = $('#custPhone').val();
		if(!custName || !certNumber || !contactAddress || !contactPhoneNumber){
			$.alert("提示", "请填写客户基本信息");
			return;
		}
		var couponAttrs = [];
		var attrIds = oldToNew.configAttrIds;
		for(var i=0; i<attrIds.length; i++){
			var $dom = $('[name="couponConfigInfo_'+attrIds[i]+'"]:checked');
			var value = $dom.val();
			if(value == null || $.trim(value) == ''){
				$.alert("提示", "请选择配置信息["+$('[name="couponConfigInfo_'+attrIds[i]+'"]').attr('attrName')+"]");
				return;
			} else {
				couponAttrs.push({
					attrId : $dom.attr('attrId'),
					attrValueId : value,
					value : $dom.attr('attrValue')
				});
			}
		}
		var oldImeiCode = $('#oldImeiCode').val();
		if(oldImeiCode == null || $.trim(oldImeiCode) == ''){
			$.alert("提示", "请填写IMEI");
			return;
		}
		var discountPrice = null;
		if($('input#discountPrice').length > 0){ //手动输入框单位为元，将其转换为分
			discountPrice = $('input#discountPrice').val() * 100 + '';
		} else {
			discountPrice = $('#discountPrice').val();
		}
		if(discountPrice == null || $.trim(discountPrice) == ''){
			$.alert("提示", "请选择回购价格");
			return;
		}
		
		var orderListInfo = {
				custName : custName,
				certNumber : certNumber,
				contactAddress : contactAddress,
				contactPhoneNumber : contactPhoneNumber,
				couponInfo:[{
					oldCouponNumber : oldToNew.formCheckInfo.oldCouponNumber,
					newCouponNumber : oldToNew.formCheckInfo.newCouponNumber,
					newCouponId : oldToNew.formCheckInfo.newCouponId,
					oldImeiCode : oldImeiCode,
					discountPrice : discountPrice,
					remark : remark,
					couponAttrs : couponAttrs
				}]
		};
		
		$.ecOverlay("<strong>保存中,请稍等...</strong>");
		var url = contextPath + "/order/saveNewOldCouponInfos";
		var response = $.callServiceAsJson(url, {orderListInfo : orderListInfo}, {});
		if (response.code == -2) {
			$.alertM(response.data);
		} else if(response.code == 0){
			var data = response.data;
			if(data && data.result && data.result.relId){
				new $.Zebra_Dialog({
			        keyboard: false,
			        modal: true,
			        overlay_close: false,
			        overlay_opacity: 0.5,
			        type: "confirmation",
			        title: "提示",
			        message: "保存成功，是否打印协议？",
			        buttons: ["打印协议", "继续受理"],
			        onClose: function(k) {
			            if (k == "打印协议") {
			                common.print.printOld2new(data.result.areaId, data.result.relId);
			            } else {
			                location.reload(true);
			            }
			            return false;
			        }
			    });
			} else {
				$.alert("提示", "保存失败");
			}
		}
		$.unecOverlay();
	};
	
	return {
		init : _init,
		formCheckInfo : _formCheckInfo,
		configAttrIds : _configAttrIds
	};
})();
$(function() {
	oldToNew.init();
});