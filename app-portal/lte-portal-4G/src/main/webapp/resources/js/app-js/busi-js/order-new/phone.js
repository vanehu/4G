/**
 * 购手机入口
 */
CommonUtils.regNamespace("order", "phone");

order.phone = (function(){
	var pageSize = 10;
	
	var termInfo = {};//选中终端信息
	
	var hytcmc = "";//合约主套餐名称
	var hytcid = "";//合约主套餐id
	var isSelect = "N";//是否已经选择合约依赖
	var _isLj=true;//是否购裸机
	
	var _offerSpecId;//所选合约id
	
	var _hyId;//所选合约id
	
	var _hyName;//所选合约名称
	
	var _param;//合约购机buildMain所需参数
	/**
	 * 校验是否可以进入下一步
	 */
	var buyChk = {
			buyType : "lj",
			numFlag : false,
			numLevel : "0",
			hyFlag : false,
			hyType: "",
			hyOfferSpecId: 0,
			hyOfferSpecName: "",
			hyOfferSpecQty: 0,
			hyOfferSpecFt: 0,
			hyOfferRoles:null,
			tsnFlag : false
	};
	var _initPhone=function(){
		OrderInfo.order.step=1;
		OrderInfo.busitypeflag=1;
		_initInParam();
		
	};
	
	/**
	 * 初始化数据
	 */
	var _initInParam = function(){
		//默认购裸机，合约相关tab页隐藏
		$("#tab2_li").hide();
		$("#tab3_li").hide();
		$("#tab4_li").hide();
		$("#tab5_li").hide();
		$("#tab6_li").hide();
		_queryApConfig();
		_btnQueryTerminal(1,1);
	};
	/**
	 * 查询平台配置
	 */
	var _queryApConfig=function(){
		var configParam={"CONFIG_PARAM_TYPE":"TERMINAL_AND_PHONENUMBER"};
		var qryConfigUrl=contextPath+"/app/order/queryApConf";
		$.callServiceAsJsonGet(qryConfigUrl, configParam,{
			"done" : call_back_success_queryApConfig
		});
	};
	
	/**
	 * 成功获取搜索条件后展示
	 */
	var call_back_success_queryApConfig=function(response){
		var dataLength=response.data.length;	
		var _phone_brand;
		var _phone_type;
		if(response.data){
			var dataLength=response.data.length;
			//品牌
			var $div =$('<i class="iconfont pull-left p-l-10">&#xe61d;</i>');
			var $div2 =$('<i class="iconfont pull-right p-r-10">&#xe66e;</i>');
			var $sel = $('<select id="phoneBrand" class="myselect select-option" data-role="none" ></select>');  
			var $defaultopt = $('<option value="" selected="selected">请选择品牌</option>');
			$sel.append($defaultopt);
			for (var i=0; i < dataLength; i++) {
				if(response.data[i].PHONE_BRAND){
					_phone_brand=response.data[i].PHONE_BRAND;
				  	for(var m=0;m<_phone_brand.length;m++){
				  		var $option = "";
				  		var  phoneBrand=_phone_brand[m].COLUMN_VALUE_NAME;
				  		phoneBrand=phoneBrand.replace(/\"/g, "");
			  		    $option = $('<option value="'+phoneBrand+'">'+phoneBrand+'</option>');				  		
						$sel.append($option);
				  }
				  continue;
				}
			}
			$("#brandDiv").append($div).append($sel).append($div2);
			order.broadband.init_select();//刷新select组件，使样式生效
			//类型
			var $div =$('<i class="iconfont pull-left p-l-10">&#xe602;</i>');
			var $div2 =$('<i class="iconfont pull-right p-r-10">&#xe66e;</i>');
			var $sel = $('<select id="phoneType" class="myselect select-option" data-role="none"></select>');  
			var $defaultopt = $('<option value="" selected="selected">请选择类型</option>');
			$sel.append($defaultopt);
			for (var i=0; i < dataLength; i++) {
				if(response.data[i].PHONE_TYPE){
					_phone_type=response.data[i].PHONE_TYPE;
				  	for(var m=0;m<_phone_type.length;m++){
				  		var $option = "";
				  		var  phoneType=_phone_type[m].COLUMN_VALUE_NAME;
				  		phoneType=phoneType.replace(/\"/g, "");
			  		    $option = $('<option value="'+phoneType+'">'+phoneType+'</option>');				  		
						$sel.append($option);
				  }
				  continue;
				}
			}
			$("#phoneTypeDiv").append($div).append($sel).append($div2);
			order.broadband.init_select();//刷新select组件，使样式生效
		}
	};
	
	/**
	 * 按钮查询
	 */
	var _btnQueryTerminal=function(curPage,moduldFlag){
		$("#phone_search_model").modal("hide");
		//请求地址
		var url = contextPath+"/app/mktRes/terminal/list";
		//收集参数
		var param = _buildInParam(curPage);
		param.newFlag=1;
		if(moduldFlag==1){//主推终端标志，默认初始为查询主推终端
			param.moduleId = 1000; //排序模块
		}
		$.callServiceAsHtml(url,param,{
			"before":function(){
				if(curPage == 1)$.ecOverlay("<strong>查询中,请稍等...</strong>");
			},
			"always":function(){
				if(curPage == 1)$.unecOverlay();
			},
			"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","<br/>查询失败,稍后重试");
					return;
				}
				var resultlst=$().val("#resultlst");
				if(resultlst=="0" && moduldFlag==1){//主推终端查不到，则切回查询默认
					_btnQueryTerminal(1);
				}
				if(curPage == 1){
					$("#phone-list").html(response.data);
					$.refresh($("#phone-list"));
				}else{
					$("#phone-list-all").append(response.data);
					$.refresh($("#phone-list-all"));
				}
			}
		});	
	};
	/**
	 * 构造查询条件
	 */
	var _buildInParam = function(curPage){
		var brand 		= ec.util.defaultStr($("#phoneBrand").val());
		var phoneType 	= ec.util.defaultStr($("#phoneType").val());
		//var contractFlag = ec.util.defaultStr($("#select_by_type").val());
		var commCond 	= $("#input_phone_name").val();	
		var phonePrice=$("#phonePrice option:selected").val();//手机价格
		var index=$('#phonePrice').prop('selectedIndex');
		var max="";
		var min="";
		if(index==1){
			var max="49900";
			var min="100";
		}else if(index==2){
			var max="99900";
			var min="50000";
		}else if(index==3){
			var max="199900";
			var min="100000";
		}else if(index==4){
			var max="299900";
			var min="200000";
		}else if(index==5){
			var max="499900";
			var min="300000";
		}else if(index==6){
			var max="";
			var min="500000";
		}
		var attrList = [];
		if(brand != "" && brand != "无限") {
			var attr = {
				"attrId":CONST.TERMINAL_SPEC_ATTR_ID.BRAND,
				"attrValue":brand
			};
			attrList.push(attr);
		}
		if(phoneType != "" && phoneType != "无限") {
			var attr = {
				"attrId":CONST.TERMINAL_SPEC_ATTR_ID.PHONE_TYPE,
				"attrValue":phoneType
			};
			attrList.push(attr);
		}
		return {
			"mktResCd":"",
			"mktResName":commCond,
			"mktResType":"",
			"minPrice":min,
			"maxPrice":max,
			//"contractFlag":contractFlag,
			"pageInfo":{
				"pageIndex":curPage,
				"pageSize":pageSize
			},
			"attrList":attrList
		};
	};
	
	//滚动页面入口
	var _scroll = function(scrollObj){
		if(scrollObj && scrollObj.page && scrollObj.page >= 1){
			_btnQueryTerminal(scrollObj.page,scrollObj.scroll);
		}
	};
	//终端销售 滚动页面入口
	var _termSaleScroll = function(scrollObj){
		if(scrollObj && scrollObj.page && scrollObj.page >= 1){
			_btnQueryTerminalSale(scrollObj.page,scrollObj.scroll);
		}
	};
	
	/**
	 * 选择订购终端
	 */
	var _selectTerminal=function(obj){
		var param = {
			mktResTypeCd 	: $(obj).attr("mktResTypeCd"),
			mktResCd		: $(obj).attr("mktResCd"),
			mktResId 		: $(obj).attr("mktResId"),
			brand 			: $(obj).attr("brand"),
			phoneType 		: $(obj).attr("phoneType"),
			phoneColor 		: $(obj).attr("phoneColor"),
			mktName 		: $(obj).attr("mktName"),
			mktPrice 		: $(obj).attr("mktPrice"),
			mktPicA 		: $(obj).attr("mktPicA")
		};
		if(CONST.getAppDesc()==0){
			param.mktSpecCode=$(obj).attr("mktSpecCode");
			param.pageInfo={pageIndex:1,pageSize:20};
			param.attrList=[];
			param.is4G="yes";
		}
		param.newFlag="1";
		$.ecOverlay("<strong>查询中,请稍等...</strong>");
		var url = contextPath+"/app/mktRes/terminal/detail";
		$.callServiceAsHtml(url, param, {
			"before":function(){
			},"always":function(){
				
			},
			"done" : function(response){
				if(!response || response.code != 0){
					$.unecOverlay();
					$.alert("提示","<br/>处理失败，请稍后重试！");				
					return;
				}
				$.unecOverlay();
				$("#phone-modal-body").html(response.data);
				$("#modal-phone").modal("show");
				//高级搜索图标隐藏
				$("#phone_a").hide();
				_initBuyChk();
				//初始化裸机发展人信息
				OrderInfo.actionFlag=13;
			}
		});	
	};
	
//初始化购终端	
	_initBuyChk = function() {
		buyChk = {
			buyType 	: "lj",//裸机
			numFlag 	: false,
			numLevel 	: "0",
			hyFlag 		: false,
			hyType		: "",
			hyOfferSpecId	: 0,
			hyOfferSpecName	: "",
			hyOfferSpecQty	: 0,
			hyOfferSpecFt	: 0,
			hyOfferRoles	: null,
			tsnFlag 		: false
		};
	};
	
	/**
	 * 终端串号校验
	 */
	var _checkTerminalCode = function(id){
		termInfo = {};
		buyChk.tsnFlag = false;	
		var tc = $(id).val();
		if(tc == "")
			return ;
		var param = {
			"instCode" 		: tc,
			"mktResTypeCd" 	: $("#mktResType").val(),
			"orderNo" 		: ""
		};
		if(CONST.getAppDesc()==0){
			var mktSpecCode=$("#mktSpecCode").val();
			if($.trim(mktSpecCode)==""){
				$.alert("提示","营销资源返回的规格存货编码为空！");
				return;
			}
			if(mktSpecCode.length>=22){
				mktSpecCode=mktSpecCode.substring(0,22);
			}
			param.mktSpecCode=mktSpecCode;
		}else{
			param.mktResId=$("#mktResId").val();
		}
		var url = contextPath+"/app/mktRes/terminal/checkTerminal";
		$.callServiceAsJson(url,param,{
			"done" : function(response){
				if (response && response.code == -2) {
					$.alertM(response.data);
				} else if(response&&response.data&&response.data.code == 0) {
					if(response.data.statusCd==CONST.MKTRES_STATUS.USABLE){
						$.alert("提示","<br/>校验通过，此终端串号可以使用");
						buyChk.tsnFlag = true;
						_chkState();
						$("#tsn_hid").val(tc);
						termInfo = response.data;
					}else if(response.data.statusCd==CONST.MKTRES_STATUS.HAVESALE){ //“已销售未补贴”的终端串码可以办理话补合约
						if(buyChk.hyType =='gjsf'){
							$.alert("提示","<br/>校验通过，此终端串号可以使用");
							//记录终端串码
//							SoOrder.order.item.mhk.sn  = tc;
							buyChk.tsnFlag = true;
							$("#tsn_hid").val(tc);
							termInfo = response.data;
							termInfo.couponSourc = "2"; //串码话补标识,“2”已销售未补贴
						}else{
							$.alert("提示","终端当前状态为已销售为补贴[1115],只有在办理话补合约时可用");
						}
					}
					else{
						$.alert("提示",response.data.message);
					}
				}else if(response && response.data && response.data.message
						&& response.data.code == 1){
					$.alert("提示", response.data.message);
				}else{
					$.alert("提示","<br/>校验失败，请稍后重试！");
				}
			}
		});
	};
	
	/**
	 * 检验buyChk的状态，改变选购类型及协助人控制,及下一步操作
	 */
	var _chkState=function(){
		var lj=$("#checkBox_lj").attr("checked");
		var cfzj=$("#checkBox_cfzj").attr("checked");
		var gjsf=$("#checkBox_gjsf").attr("checked");
		if(lj=="checked"){
			buyChk.buyType="lj";
		}else if(cfzj=="checked"){
			buyChk.buyType="hy";
			buyChk.hyType ='cfzj';
		}else if(gjsf=="checked"){
			buyChk.buyType="hy";
			buyChk.hyType ='gjsf';
		}
		if ("lj"==buyChk.buyType) {
			OrderInfo.actionFlag = 13;	
		} else if ("hy"==buyChk.buyType){
			OrderInfo.actionFlag = 14;
		}

	};
	
	/**
	 * 购买手机，判断是否满足条件，合约机跳往填单，裸机直接算费
	 */
	var _purchase=function(){
		_chkState();
		if ("lj"==buyChk.buyType) {
			if (!buyChk.tsnFlag) {
				$.alert("提示","<br/>请先校验终端串号。");
				return;
			}
			var apCharge = $("#price").val() / 100;
			var coupons = [{
				couponUsageTypeCd : "3", //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
				inOutTypeId : "1",  //出入库类型
				inOutReasonId : 0, //出入库原因
				saleId : 1, //销售类型
				couponId : termInfo.mktResId, //物品ID
				couponinfoStatusCd : "A", //物品处理状态
				chargeItemCd : CONST.CHARGE_ITEM_CD.COUPON_SALE, //物品费用项类型
				couponNum : 1, //物品数量
				storeId : termInfo.mktResStoreId, //仓库ID
				storeName : "1", //仓库名称
				agentId : 1, //供应商ID
				apCharge : apCharge, //物品价格
				couponInstanceNumber : termInfo.instCode, //物品实例编码
				ruleId : "", //物品规则ID
				partyId : CONST.CUST_COUPON_SALE, //客户ID
				prodId : 0, //产品ID
				offerId : 0, //销售品实例ID
				state : "ADD", //动作
				relaSeq : "" //关联序列	
			}];
			//如果是老客户或新建客户
			if ((OrderInfo.cust.custId)&& OrderInfo.cust.custId != "") {
				coupons[0].partyId = OrderInfo.cust.custId;
			}
			OrderInfo.actionTypeName = "订购";
			OrderInfo.businessName = $("#mktResName").val();
			var data = {};
			data.busiObj = {
				instId : termInfo.mktResId //业务对象实例ID
			};
			data.boActionType = {
				actionClassCd : CONST.ACTION_CLASS_CD.MKTRES_ACTION,
				boActionTypeCd : CONST.BO_ACTION_TYPE.COUPON_SALE
			};
			data.coupons = coupons;
			order.phone.isLj=true;
			$("#modal-phone").modal("hide");
			SoOrder.getTokenSynchronize();
			//订单提交
			SoOrder.submitOrder(data);
			return;
		} else if ("hy"==buyChk.buyType) {
			if (!buyChk.tsnFlag) {
				$.alert("提示","<br/>请先校验终端串号。");
				return;
			}
			//校验客户是否已定位
			if (!(OrderInfo.cust.custId)|| OrderInfo.cust.custId=="") {
				$.alert("提示","<br/>在订购套餐之前请先进行客户定位！");
				return;
			}
			//构造参数，填单
			if (buyChk.hyType==""){
				$.alert("提示","<br/>请选择合约!");
				return;
			}
		} else {
			return;
		}
		$("#modal-phone").modal("hide");
		$("#phone_a").hide();
		$("#tab2_li").show();
		$("#tab3_li").show();
		$("#tab4_li").show();
		$("#tab5_li").show();
		$("#tab6_li").show();
		
        //初始化加载促销页所需参数
		order.phone.param = {
			boActionTypeCd 	: 'S1',
			boActionTypeName: "订购",
			offerSpec 		: OrderInfo.offerSpec,
			offerSpecId 	: buyChk.hyOfferSpecId,
			offerSpecName 	: buyChk.hyOfferSpecName,
			viceCardNum 	: Number(buyChk.hyOfferSpecQty),
			feeType 		: buyChk.hyOfferSpecFt,
			offerNum 		: 1,
			type 			: 2,//1购套餐2购终端3选靓号
			actionFlag 		: OrderInfo.actionFlag,
			terminalInfo 	: {
				terminalName : $("#mktResName").val(),
				terminalCode : termInfo.instCode
			},
			offerRoles : buyChk.hyOfferRoles
		};
		order.phone.isLj=false;
		OrderInfo.actionTypeName = "订购";
		//加载选号页面
		 order.phoneNumber.queryPhoneNbrPool();
		 order.phoneNumber.queryApConfig();
		 order.phoneNumber.initPhonenumber();
		 OrderInfo.order.step = 2;
		 $("#tab1_li").removeClass("active");
		 $("#tab2_li").addClass("active");
		 $("#nav-tab-1").removeClass("active in");
    	 $("#nav-tab-2").addClass("active in");
    	 $("#phone_a").hide();
    	 $("#phoneNumber_a").show();

	};
	
	/**
	 * 选择合约类型,具体合约放致后面操作
	 */
	var _showHy=function(){
		var agreementType;
		if(buyChk.hyType =='cfzj'){
			agreementType=1;	
		}else{
			agreementType=2;
		}
		buyChk.hyFlag = true;
		_chkState();		
		var param={
				"mktResCd":$("#mktResId").val(),
				"agreementType":agreementType
		};
		param.newFlag="1";//新ui
		var url=contextPath+"/app/mktRes/terminal/mktplan";
		$.callServiceAsHtmlGet(url,param,{
			"before":function(){
			},
			"always":function(){
			},
			"done" : function(response){
				if(!response){
					$.alert("提示","<br/>处理失败，请稍后重试！");
					return;
				}
				if(response.code != 0) {
					if (response.code == 1006){
						$.alert("提示","<br/>查询不到，请稍后重试");
					} else {								
						$.alert("提示","<br/>查询失败，请稍后重试");
					}
					return;
				}
				$("#div_offer").html(response.data);
				$.refresh($("#div_offer"));
				order.broadband.init_select();//刷新select组件，使样式生效
				var offerSpecId=$("#select_offerSpecId_0").val();
				var hyName =$("#select_offerSpecId_0").find("option:selected").attr("hyName");
				order.phone.hyId=offerSpecId;
				order.phone.hyName=hyName;
				_queryOffer(offerSpecId,agreementType);
				//绑定确定按钮click事件
//				$("#termOfferSpecConfirm").off("click").on("click",function(event){
//					_selectPlan();
//				});
			}
		});
	};

	/**
	 * 切换话补或者机补比例
	 */
	_changePeriod=function(obj,agreementType){
		var tabIndex=$(obj).val();
		$("#tab_content .itemMain").hide();
		$("#tab_content_"+tabIndex).show();
		_changeHyContent($("#select_offerSpecId_"+tabIndex),agreementType);
	};
	
	/**
	 * 切换合约
	 */
	_changeHyContent=function(obj,agreementType){
		var hyName= $(obj).find("option:selected").attr("hyName");
		var offerSpecId=$(obj).val();
		order.phone.hyId=offerSpecId;
		order.phone.hyName=hyName;
		_queryOffer(offerSpecId,agreementType);
	};
	/**
	 * 查询套餐后生成展示内容
	 */
	var _queryOffer=function(offerSpecId, agreementType){
		//调用order.js中的方法获得主销售品规格
		$("#select_offerSpecId").val(offerSpecId);
		var response = _queryPackForTerm(offerSpecId, agreementType, '');
		if (typeof(response) == "undefined" || response==null){
			$.alert("提示","<br/>未查到套餐，请稍后再试！");
			return;
		}
		if (response.code == -2){
			$.alertM(response.data);
			$.unecOverlay();
			return;
		}
		if(response.code != 0 || response.data.code != "POR-0000"){
			$.alert("提示","<br/>未查到合适套餐，请稍后再试！");
			return;
		}
		var offerHtml="<ul class='single-list-box meal-choice-box'>";
		var offerInfos = response.data.prodOfferInfos;
		if (offerInfos.length == 0) {
			$.alert("提示","<br/>未查到套餐，请稍后再试！");
		}
		for(var i=0;i<offerInfos.length;i++){
			var offer = offerInfos[i];
			var inFlux = '';
			if (offer.inFlux >= 1024) {
				inFlux = offer.inFlux / 1024 + 'G';
			} else {
				inFlux = offer.inFlux + 'M';
			}
			var inVoice=ec.util.defaultStr(offer.inVoice);
			var inWIFI=ec.util.defaultStr(offer.inWIFI);
			var inSMS=ec.util.defaultStr(offer.inSMS);
			var inMMS=ec.util.defaultStr(offer.inMMS);
			var outFlux=ec.util.defaultStr(offer.outFlux);
			var outVoice=ec.util.defaultStr(offer.outVoice);
			offerHtml+="<li onclick='order.phone.selectPlan(this)' class='done p-10 p-t-15 p-b-15' offerSpecId='"+offer.offerSpecId+"'";
			offerHtml+=" offerSpecName='"+offer.offerSpecName+"'";
			offerHtml+=" price='"+offer.price+"'";
			offerHtml+=" inWIFI='"+inWIFI+"'";
			offerHtml+=" inFlux='"+inFlux+"'";
			offerHtml+=" inSMS='"+inSMS+"'";
			offerHtml+=" inMMS='"+inMMS+"'";
			offerHtml+=" outFlux='"+outFlux+"'";
			offerHtml+=" outVoice='"+outVoice+"'";
			offerHtml+=" inVoice='"+inVoice+"'>";
			offerHtml+="<i class='iconfont pull-left'>&#xe6da;</i>";
			offerHtml+=" <p class='title'>"+ec.util.defaultStr(offer.offerSpecName)+"</p>";
			offerHtml+="</li>";
		}
		offerHtml+="  </ul>";
		
		$("#offerSecond").html(offerHtml);
		$.refresh($("#offerSecond"));
	};
	
	/**
	 * 根据合约规格编码aoId查询主销售品
	 */
	var _queryPackForTerm = function(aoId, agreementType, numLevel){
		var params={
			"aoId":aoId,
			"agreementType":agreementType,
			"numLevel":numLevel
		};
		var url = contextPath+"/order/queryPackForTerm";
		var response = $.callServiceAsJson(url,params, {});
		return response;
	};
	
//选择合约主套餐
	var _selectPlan=function(selected){
		var offerSpecId = $(selected).attr("offerSpecId");
		var inParam = {
				"price":$(selected).attr("price"),
				"id" : 'tcnum1',
				"specId" : offerSpecId,
				"custId" : OrderInfo.cust.custId,
				"areaId" : OrderInfo.staff.soAreaId
			};
		order.phone.offerSpecId =$("#select_offerSpecId").val();
		var coupon = {
				couponUsageTypeCd 	: "5", //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
				inOutTypeId 		: "1",  //出入库类型
				inOutReasonId 		: 0, //出入库原因
				saleId 				: 1, //销售类型
				couponId 			: termInfo.mktResId, //物品ID
				couponinfoStatusCd 	: "A", //物品处理状态
				chargeItemCd 		: CONST.CHARGE_ITEM_CD.COUPON_SALE, //物品费用项类型
				couponNum 			: 1, //物品数量
				storeId 			: termInfo.mktResStoreId, //仓库ID
				storeName 			: "1", //仓库名称
				agentId 			: 1, //供应商ID
				apCharge 			: $("#price").val() / 100, //物品价格
				couponInstanceNumber: termInfo.instCode, //物品实例编码
				ruleId 				: "", //物品规则ID
				partyId 			: OrderInfo.cust.custId, //客户ID
				prodId 				: -1, //产品ID
				offerId 			: -1, //销售品实例ID
				attachSepcId 		: order.phone.offerSpecId,
				state 				: "ADD", //动作
				relaSeq 			: "" //关联序列	
			};
			if(CONST.getAppDesc()==0){
				coupon.termTypeFlag=termInfo.termTypeFlag;
			}
			OrderInfo.attach2Coupons = [];
			OrderInfo.attach2Coupons.push(coupon);
		buyChk.hyFlag = true;
		buyChk.hyOfferSpecId=$(selected).attr("offerSpecId");
		buyChk.hyOfferSpecName=$(selected).attr("offerSpecName");
		order.phone.hytcid = order.phone.offerSpecId;
		order.phone.hytcmc = buyChk.hyOfferSpecName;
		$("#choosedOfferPlan").html($(selected).attr("offerSpecName"));
		order.service.querySpec(inParam); //调用公用获取套餐构成和是否有副卡方法
	};
	
	return {
		 isSelect			:isSelect,
		 hytcmc				:hytcmc,
		 hytcid				:hytcid,
		 initPhone          :_initPhone,
		 btnQueryTerminal   :_btnQueryTerminal,
		 scroll             :_scroll,
		 termSaleScroll     :_termSaleScroll,
		 selectTerminal     :_selectTerminal,
		 checkTerminalCode  :_checkTerminalCode,
		 purchase           :_purchase,
		 isLj               :_isLj,
		 changeHyContent    :_changeHyContent,
		 changePeriod       :_changePeriod,
		 queryOffer         :_queryOffer,
		 showHy             :_showHy,
		 queryPackForTerm   :_queryPackForTerm,
		 selectPlan         :_selectPlan,
		 offerSpecId        :_offerSpecId,
		 param              :_param,
		 hyId               :_hyId,
		 hyName             :_hyName
		 
	};
})();
