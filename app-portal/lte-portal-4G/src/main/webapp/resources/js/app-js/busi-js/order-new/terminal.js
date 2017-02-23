/**
 * 终端入口
 */
CommonUtils.regNamespace("mktRes", "terminal");

mktRes.terminal = (function(){
	var _offerSpecId = ""; //保存合约附属ID，合约套餐使用
	var pageSize = 10;
	var termInfo = {};
	var hytcmc = "";//合约名称
	var hytcid = "";//合约id
	var isSelect = "N";//是否已经选择合约依赖
	
	var _hasCheck=false;//是否终端校验过
	
	/**
	 * 橙分期终端串号校验
	 */
	var _checkTerminalCode = function(){
		order.orange.orangeOfferSpecId=$("input[name='meal']:checked").val();
		//橙分期校验
		 if(order.orange.orangeOfferSpecId==null){
				$.alert("提示","请选择橙分期合约包！");
				return;
		}
		 var param = {
					offerSpecId : order.orange.orangeOfferSpecId,
					offerTypeCd : "2",
					mainOfferSpecId:order.orange.mainOfferSpecId,
					partyId: OrderInfo.cust.custId
		};
		query.offer.queryOfferSpec(param,function () {
			_callBackTerminal();
		});
		
	};
	
	/**
	 * 橙分期查询完销售品构成后回调
	 */
	var _callBackTerminal = function(){
		 $.ecOverlay("<strong>终端校验中,请稍后....</strong>");
		var offerSpec=order.orange.orangeSpec;
		termInfo = {};
		var terminalNum = $("#terminalNum").val();
		if(terminalNum == "")
			return ;
		var param = {
				instCode : terminalNum,
				flag : "0",
			//	mktResId : resId,
				offerSpecId: order.orange.orangeOfferSpecId
			};
		   if(ec.util.isArray(offerSpec.agreementInfos)){//终端信息
				var terminalGroups=offerSpec.agreementInfos[0].terminalGroups;
				if(ec.util.isArray(terminalGroups)){ //如果有配置终端组，则拼接终端组的规格ID和包含的终端规格ID
					var termGroup="";
					for(var j=0;j<terminalGroups.length-1;j++){
						termGroup+=terminalGroups[j].terminalGroupId+"|";
					}
					termGroup+=terminalGroups[terminalGroups.length-1].terminalGroupId;
					param.termGroup=termGroup;
		        }
		   }
			var data = query.prod.checkTerminal(param);
			if(data==undefined){
				return;
			}
			var activtyType ="";
			var spec=order.orange.orangeSpec;
			if(spec.agreementInfos[0]!=undefined && spec.agreementInfos[0].activtyType == 2){
             	activtyType = "2";
			}
			if(data.statusCd==CONST.MKTRES_STATUS.USABLE || (data.statusCd==CONST.MKTRES_STATUS.HAVESALE && activtyType=="2")){
				$.alert("信息提示",data.message);
				var mktPrice=0;//营销资源返回的单位是元
				var mktColor="";
				if(ec.util.isArray(data.mktAttrList)){
					$.each(data.mktAttrList,function(){
						if(this.attrId=="65010058"){
							mktPrice=this.attrValue;
						}else if(this.attrId=="60010004"){
							mktColor=this.attrValue;
						}
					});
				}
				$("#terminalInfo").html("终端规格："+data.mktResName+",终端颜色："+mktColor+",合约价格："+mktPrice+"元");	
				mktRes.terminal.hasCheck=true;
				var coupon = {
					couponUsageTypeCd : "5", //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
					inOutTypeId : "1",  //出入库类型
					inOutReasonId : 0, //出入库原因
					saleId : 1, //销售类型
					couponId : data.mktResId, //物品ID
					couponinfoStatusCd : "A", //物品处理状态
					chargeItemCd : CONST.CHARGE_ITEM_CD.COUPON_SALE, //物品费用项类型
					couponNum : 1, //物品数量
					storeId : data.mktResStoreId, //仓库ID
					storeName : "1", //仓库名称
					agentId : 1, //供应商ID
					apCharge : mktPrice, //物品价格,约定取值为营销资源的
					couponInstanceNumber : data.instCode, //物品实例编码
					ruleId : "", //物品规则ID
					partyId : OrderInfo.cust.custId, //客户ID
					prodId : order.orange.prodId, //产品ID
					offerId : -1, //销售品实例ID
					attachSepcId : order.orange.orangeOfferSpecId,
					state : "ADD", //动作
					relaSeq : "", //关联序列	
					num	: "1", //第几个串码输入框
					attrList:data.mktAttrList //终端属性列表
				};
				if(data.statusCd==CONST.MKTRES_STATUS.HAVESALE && activtyType=="2"){//“已销售未补贴”的终端串码可以办理话补合约
					coupon.couponSource ="2"; //串码话补标识
				}
				if(CONST.getAppDesc()==0){
					coupon.termTypeFlag=data.termTypeFlag;
				}
				OrderInfo.attach2Coupons=[];
				OrderInfo.attach2Coupons.push(coupon);
			}else if(data.statusCd==CONST.MKTRES_STATUS.HAVESALE){
				$.alert("提示","终端当前状态为已销售为补贴[1115],只有在办理话补合约时可用");
			}else{
				$.alert("提示",data.message);
			}
		
	}
	/**
	 * 终端串号校验
	 */
	var _checkTerminal = function(param){
		var url = contextPath+"/app/mktRes/terminal/checkTerminal";
		var response = $.callServiceAsJson(url,param);
		$.unecOverlay();
		if (response.code == -2) {
			$.alertM(response.data);
		}else if(response.data && response.data.code == 0) {
			alert(response.data);
			return response.data;
		}else if( response.data.code == 1){
			$.alert("提示", response.data.message);
		}else{
			$.alert("提示","<br/>校验失败，请稍后重试！");
		}
	};
	
var _showCheckTermianl=function(){
		var terminalNum = $("#terminalNum").val().trim();
		if (terminalNum != "") {
			$("#terminal_call").addClass("dis-none");
			$("#terminal_check").removeClass("dis-none");
		} else {
			$("#terminal_call").removeClass("dis-none");
			$("#terminal_check").addClass("dis-none");
		}
	};
	
	
	return {
		hasCheck          :_hasCheck,
		checkTerminalCode :_checkTerminalCode,
		checkTerminal     :_checkTerminal,
		showCheckTermianl :_showCheckTermianl
	};
})();