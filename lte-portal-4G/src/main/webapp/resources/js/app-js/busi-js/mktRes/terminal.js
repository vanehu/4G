/**
 * 终端入口
 * 
 * @author dujb3
 * @modifyby liusd
 */
CommonUtils.regNamespace("mktRes", "terminal");

mktRes.terminal = (function($){
	var _offerSpecId = ""; //保存合约附属ID，合约套餐使用
	var pageSize = 10;
	var termInfo = {};
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
	_initBuyChk = function() {
		buyChk = {
			buyType 	: "lj",
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
	 * 检验buyChk的状态，改变选购类型及协助人控制,及下一步操作
	 */
	var _chkState=function(){
		if ("lj"==buyChk.buyType) {
			OrderInfo.actionFlag = 13;
			$("#treaty").hide();
			$("#agreementFie").hide();
			$("#phonenumberFie").hide();
			//$("#dealerMktDiv").show();
		} else if ("hy"==buyChk.buyType){
			OrderInfo.actionFlag = 14;
			//$("#dealerMktDiv").hide();
			$("#phonenumberFie").show();
		}

	};
	var _setNumber=function(num, numLevel){
		$("#choosedNumSpan").val(num);
		buyChk.numFlag = true;
		buyChk.numLevel = numLevel;
		_chkState();
		$("#treaty").show();
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
	//查询
	var _btnQueryTerminalSale = function(pageIndex,scroller){
		OrderInfo.actionFlag=150;
		var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
		var param = {} ;
		param = {
					"startDate":($("#p_startDt").val()).replace(/-/g,''),
					"channelId":$("#p_channelId").val(),
					"areaId":$("#p_channelId").attr("areaid"),
					pageIndex:curPage,
					pageSize:10
		};
        $.callServiceAsHtmlGet(contextPath+"/app/report/terminalSalesList",param,{
			"before":function(){
				$.ecOverlay("终端销售详情查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else{
					OrderInfo.order.step=2;
					$("#terminal_sales_search").hide();
					$("#terminal_sales_list").html(response.data).show();
					$("#terminal_sales_list_scroller").css("transform","translate(0px, -40px) translateZ(0px)");
					if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	/**
	 * 按钮查询
	 */
	var _btnQueryTerminal=function(curPage,scroller){
		$("#phoneModal").modal("hide");
		//请求地址
		var url = contextPath+"/app/mktRes/terminal/list";
		//收集参数
		var param = _buildInParam(curPage);
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
				if(curPage == 1){
					$("#phone-list").html(response.data);
					$.refresh($("#phone-list"));
				}else{
					$("#phone-list-all").append(response.data);
					$.refresh($("#phone-list-all"));
				}
				//回调刷新iscroll控制数据,控件要求
				if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
			}
		});	
	};
	/**
	 * 构造查询条件
	 */
	var _buildInParam = function(curPage){
		var brand 		= ec.util.defaultStr($("#select_brand").val());
		var phoneType 	= ec.util.defaultStr($("#select_phone_type").val());
		var minPrice    = ec.util.defaultStr($("#phonePrice_numd01").val());
		var maxPrice    = ec.util.defaultStr($("#phonePrice_numd02").val());
		//var contractFlag = ec.util.defaultStr($("#select_by_type").val());
		var commCond 	= $("#input_phone_name").val();		
		if(minPrice!=""){
			minPrice=parseInt(minPrice) * 100;
		}
		if(maxPrice!=""){
			maxPrice=parseInt(maxPrice) * 100;
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
			"minPrice":minPrice,
			"maxPrice":maxPrice,
			//"contractFlag":contractFlag,
			"pageInfo":{
				"pageIndex":curPage,
				"pageSize":pageSize
			},
			"attrList":attrList
		};
	};
	/**
	 * 初始化查询条件
	 */
	var _initInParam = function(){
		mktRes.terminal.queryApConfig();
		mktRes.terminal.btnQueryTerminal(1);
	};
	/**
	 * 成功获取搜索条件后展示
	 */
	var call_back_success_queryApConfig=function(response){
		var dataLength=response.data.length;	
		var _phone_brand;
		var _phone_price_area;
		var _phone_type;
		
		for (var i=0; i < dataLength; i++) {
			if(response.data[i].PHONE_BRAND){
				var _obj = $("#select_brand");
			  	_phone_brand=response.data[i].PHONE_BRAND;
			  	for(var m = 0;m < _phone_brand.length; m++){
			  		var phoneBrand=(_phone_brand[m].COLUMN_VALUE_NAME).replace(/\"/g, "");
			  		_obj.append("<option value='"+phoneBrand+"'>"+phoneBrand+"</option>");
			  	}
			}
			if(ec.util.isArray(response.data[i].PHONE_PRICE_AREA)){
			  	_phone_price_area=response.data[i].PHONE_PRICE_AREA;
			  	var  phonePriceArea=(_phone_price_area[0].COLUMN_VALUE_NAME).replace(/\"/g, "");
	  			var phonePriceAreaArry=phonePriceArea.split("-");
	  			var minPrice="";
	  			var maxPrice="";
	  			var rang="";
	  			if(phonePriceAreaArry.length!=1){
	  				minPrice=phonePriceAreaArry[0];
	  			}else{
	  				phonePriceAreaArry=phonePriceAreaArry.toString();
	  				minPrice=phonePriceAreaArry.substring(0,phonePriceAreaArry.length-2);
	  			}
	  			phonePriceArea=(_phone_price_area[_phone_price_area.length-1].COLUMN_VALUE_NAME).replace(/\"/g, "");
	  			phonePriceAreaArry=phonePriceArea.split("-");
	  			if(phonePriceAreaArry.length!=1){
	  				maxPrice=phonePriceAreaArry[1];
	  				rang=maxPrice;
	  			}else{
	  				phonePriceAreaArry=phonePriceAreaArry.toString();
	  				rang=phonePriceAreaArry.substring(0,phonePriceAreaArry.length-2);
	  				maxPrice="";
	  			}
	  			$(".noUiSliderd").noUiSlider({
	  				range: [parseInt(minPrice), parseInt(rang)],
	  				start: [parseInt(minPrice), parseInt(rang)],
	  				step: 10,
	  				slide: function() {
	  					var values = $(this).val();
	  					$("#phonePrice_numd01").val(values[0]);
	  					if(parseInt(values[0])>=parseInt(rang)&&maxPrice==""){
	  						$("#phonePrice_numd02").val("");
	  					}else{
		  					$("#phonePrice_numd02").val(values[1]);
	  					}
	  				}
	  			});
			}
			if(response.data[i].PHONE_TYPE){
				var _obj = $("#select_phone_type");
				_phone_type=response.data[i].PHONE_TYPE;
			  	for(var m=0;m<_phone_type.length;m++){
			  		var phoneType=(_phone_type[m].COLUMN_VALUE_NAME).replace(/\"/g, "");
			  		_obj.append("<option value="+phoneType+">"+phoneType+"</option>");
			  	}
			}
			var content=$("#phoneModal");
			$.refresh(content);
		};
	};
	/**
	 * 获取搜索条件
	 */
	var _queryApConfig=function(){
		var configParam={"CONFIG_PARAM_TYPE":"TERMINAL_AND_PHONENUMBER"};
		var qryConfigUrl=contextPath+"/app/order/queryApConf";
		$.callServiceAsJsonGet(qryConfigUrl, configParam,{
			"done" : call_back_success_queryApConfig
		});
	};
	var _initPhone=function(){
		OrderInfo.order.step=1;
		OrderInfo.busitypeflag=1;
		//请求地址
		var url = contextPath+"/app/mktRes/terminal/prepare";
		var param={};
		var response = $.callServiceAsHtmlGet(url,param);
		var content$ = $("#phone");
		content$.html(response.data);
		$.refresh(content$);
		_initInParam();
		$("#form_terminal_qry").off("submit").on("submit",function(e){
			e.preventDefault();//屏蔽form action默认事件
			mktRes.terminal.btnQueryTerminal(1);
		});
	};
	var _hyClick=function(obj){
		_initBuyChk();
		buyChk.buyType = 'hy';
		_chkState();
		$("#buyTypeBtns .btn-default").removeClass("active");
		$(obj).addClass("active");
	};
	var _ljClick=function(obj){
		$("#choosedNumSpan").val("");
		_initBuyChk();
		buyChk.buyType = 'lj';
		_chkState();
		$("#buyTypeBtns .btn-default").removeClass("active");
		$(obj).addClass("active");
	};
	/**
	 * 选择立即订购终端
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
			param.pageInfo={pageIndex:1,pageSize:pageSize};
			param.attrList=[];
			param.is4G="yes";
		}
		var url = contextPath+"/app/mktRes/terminal/detail";
		$.callServiceAsHtml(url, param, {
			"before":function(){
				$.ecOverlay("<strong>查询中,请稍等...</strong>");
			},"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response || response.code != 0){
					$.alert("提示","<br/>处理失败，请稍后重试！");
					return;
				}
				OrderInfo.order.step=2;
				var content$=$("#order").html(response.data).show();
				$.refresh(content$);
				$("#order_prepare").hide();
				_initBuyChk();
				$("#cNumA").click(function(){
					var custId = OrderInfo.cust.custId;
					if(OrderInfo.cust==undefined || custId==undefined || custId==""){
						$.alert("提示","在选号码之前请先进行客户定位或者新建客户！");
						return;
					}
					_chkState();
					order.phoneNumber.initPage('-1','terminal');
				});	
				$("#chkTsnA").off("click").on("click",function(){
					_checkTerminalCode('#tsn');
				});
				$("#purchaseTermA").off("click").on("click",function(){
					_purchase();
				});
				$("#btn_terminal_back").off("click").on("click",function(){
					$("#order_prepare").show();
					$("#order").hide();
				});
				//初始化裸机发展人信息
				OrderInfo.actionFlag=13;
			}
		});	
	};
	
	/**
	 * 切换终端颜色
	 */
	var _selectColor=function(obj){
		var p_pic				=$(obj).attr("p_pic");
		var mktResName			=$(obj).attr("mktResName");
		var mktSalePrice		=$(obj).attr("mktSalePrice");
		var mktNormalSalePrice	=$(obj).attr("mktNormalSalePrice");
		var mktResId			=$(obj).attr("mktResId");
		var mktResTypeCd		=$(obj).attr("mktResTypeCd");
		var mktSpecCode			=$(obj).attr("mktSpecCode");
		$("#term_pic_id").attr("src",p_pic);
		$("#mkt_resname_id").html(mktResName);
		$("#mkt_saleprice_id").html(mktSalePrice+" 元");
		$("#mktResId").val(mktResId);
		$("#mktResName").val(mktResName);
		$("#price").val(mktNormalSalePrice);
		$("#mktResType").val(mktResTypeCd);
		$("#mktSpecCode").val(mktSpecCode);
		$("#fls_terminal_color .btn-default").removeClass("active");
		$("#treaty .btn-default").removeClass("active");
		$(obj).addClass("active");
		var buyTypeTmp=buyChk.buyType;
		_initBuyChk();
		buyChk.buyType=buyTypeTmp;
		_chkState();
		$("#tsn_hid").val("");
		$("#tsn").val("");
		$("#choosedNumSpan").val("");
		$("#choosedOfferPlan").html("");
		termInfo = {};
	};
	
	/**
	 * 选择合约类型,具体合约放致后面操作
	 */
	var _selectHy=function(agreementType,obj){
		$("#treaty .btn-default").removeClass("active");
		if (!buyChk.numFlag){
			$.alert("提示","请先选号！");
			return;
		}
		if (agreementType == 1) {
			buyChk.hyType = 'cfsj';
		} else {
			buyChk.hyType = 'gjsf';
		}
		$(obj).addClass("active");
		buyChk.hyFlag = true;
		_chkState();
		var param={
				"mktResCd":$("#mktResId").val(),
				"agreementType":agreementType
		};
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
				$("#div_offer").html(response.data).show();
				$.refresh($("#div_offer"));
				$("#terminalMain").hide();
				var offerSpecId=$("#select_offerSpecId_0").val();
				_queryOffer(offerSpecId,agreementType);
				//绑定确定按钮click事件
				$("#termOfferSpecConfirm").off("click").on("click",function(event){
					_selectPlan();
				});
			}
		});
	};
	/**
	 * 切换合约
	 */
	_changeHyContent=function(obj,agreementType){
		var offerSpecId=$(obj).val();
		_queryOffer(offerSpecId,agreementType);
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
	 * 查询套餐后生成展示内容
	 */
	var _queryOffer=function(offerSpecId, agreementType){
		//调用order.js中的方法获得主销售品规格
		$("#select_offerSpecId").val(offerSpecId);
		var response = order.service.queryPackForTerm(offerSpecId, agreementType, '');
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
		var offerHtml="<table class='table table-striped tablecenter'>";
		offerHtml+="  <thead>";
		offerHtml+="    <tr>";
		offerHtml+="      <th>套餐名称</th>";
		offerHtml+="    </tr>";
		offerHtml+="  </thead>";
		offerHtml+="  <tbody class='panel-group'>";
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
			
			offerHtml+="<tr offerSpecId='"+offer.offerSpecId+"'";
			offerHtml+=" offerSpecName='"+offer.offerSpecName+"'";
			offerHtml+=" price='"+offer.price+"'";
			offerHtml+=" inWIFI='"+inWIFI+"'";
			offerHtml+=" inFlux='"+inFlux+"'";
			offerHtml+=" inSMS='"+inSMS+"'";
			offerHtml+=" inMMS='"+inMMS+"'";
			offerHtml+=" outFlux='"+outFlux+"'";
			offerHtml+=" outVoice='"+outVoice+"'";
			offerHtml+=" inVoice='"+inVoice+"'>";
			offerHtml+=" <td>"+ec.util.defaultStr(offer.offerSpecName)+"</td>";
			offerHtml+="</tr>";
		}
		offerHtml+="  </tbody>";
		offerHtml+="  </table>";
		
		$("#offerSecond").html(offerHtml);
		$.refresh($("#offerSecond"));
		$("#offerSecond tbody tr").off("click").on("click",function(event){_linkSelectPlan(this);event.stopPropagation();});
	};
	var _linkSelectPlan=function(selected){
		$("#offerSecond tbody tr").removeClass("success");
		var offerSpecId = $(selected).attr("offerSpecId");
		var result = _queryOfferSpec(offerSpecId, selected);
		if (result) {
			$(selected).addClass("success");
		}
	};
	
	var _queryOfferSpec=function(offerSpecId, selected){
		var inParam = {
			"price":$(selected).attr("price"),
			"id" : 'tcnum1',
			"specId" : offerSpecId,
			"custId" : OrderInfo.cust.custId,
			"areaId" : OrderInfo.staff.soAreaId
		};
		order.service.opeSer(inParam); //调用公用弹出层
		return true;
	};
	/**
	 * 在合约套餐窗口选择套餐
	 */
	var _selectPlan=function(){
		//搜索是否有
		var offerSpec=$("#offerSecond tbody tr[class='success']");
		if (offerSpec.length!=1) {
			$.alert("提示","请选择一个套餐！");
			return;
		}
		var chose=true;
		$.each(OrderInfo.offerSpec.offerRoles,function(){ //遍历主套餐规格
			if(this.prodInsts==undefined||this.prodInsts==null){
				chose=false;
				return;
			}
		});
		if(chose){
			mktRes.terminal.offerSpecId = $("#select_offerSpecId").val();
			buyChk.hyFlag = true;
			buyChk.hyOfferSpecId=offerSpec.attr("offerSpecId");
			buyChk.hyOfferSpecName=offerSpec.attr("offerSpecName");
			_chkState();
			$("#agreementFie").show();
			$("#choosedOfferPlan").html(offerSpec.attr("offerSpecName"));
			$("#terminalMain").show();
			$("#div_offer").hide();
		}else{
			$.alert("提示","请选择一个接入产品！");
			return;
		}
	};
	/**
	 * 终端串号校验
	 */
	var _checkTerminalCode = function(id){
		termInfo = {};
		buyChk.tsnFlag = false;
		_chkState();
		$("#tsn_hid").val("");
		
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
		var url = contextPath+"/mktRes/terminal/checkTerminal";
		$.callServiceAsJson(url,param,{
			"done" : function(response){
				if (response && response.code == -2) {
					$.alertM(response.data);
				} else if(response&&response.data&&response.data.code == 0) {
					if(response.data.statusCd==CONST.MKTRES_STATUS.USABLE){
						$.alert("提示","<br/>此终端串号可以使用");
						buyChk.tsnFlag = true;
						_chkState();
						$("#tsn_hid").val(tc);
						termInfo = response.data;
					}else if(response.data.statusCd==CONST.MKTRES_STATUS.HAVESALE){ //“已销售未补贴”的终端串码可以办理话补合约
						if(buyChk.hyType =='gjsf'){
							$.alert("提示","<br/>此终端串号可以使用");
							//记录终端串码
//							SoOrder.order.item.mhk.sn  = tc;
							buyChk.tsnFlag = true;
							_chkState();
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
	 * 购买手机，判断是否满足条件，合约机跳往填单，裸机直接算费
	 */
	var _purchase=function(){
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
			//发展人
			/*var $li = $("#dealerMktDiv li[name='li_"+$("#mktResId").val()+"']");
			if($li.length>0){
				data.dealers = [];
				$li.each(function(){   //遍历产品有几个发展人
					var dealer = {
						itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
						role : $(this).find("select").val(),
						value : $(this).find("input").attr("staffid") 
					};
					data.dealers.push(dealer);
				});
			}*/
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
			attachSepcId 		: mktRes.terminal.offerSpecId,
			state 				: "ADD", //动作
			relaSeq 			: "" //关联序列	
		};
		if(CONST.getAppDesc()==0){
			coupon.termTypeFlag=termInfo.termTypeFlag;
		}
		OrderInfo.attach2Coupons = [];
		OrderInfo.attach2Coupons.push(coupon);
		var param = {
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
				terminalCode : $("#tsn_hid").val()
			},
			offerRoles : buyChk.hyOfferRoles
		};
		OrderInfo.actionTypeName = "订购";
		SoOrder.builder(); //初始化订单数据
		order.main.buildMainView(param);
	};
	//返回按钮调用
	var _back = function(){
		if(OrderInfo.order.step==1){
			common.callCloseWebview();
		}else if(OrderInfo.order.step==2){
			$("#terminal_sales_search").show();
			$("#terminal_sales_list").hide();
			OrderInfo.order.step=1;
		}else{
			common.callCloseWebview();
		}
	};
	return {
		btnQueryTerminal	:_btnQueryTerminal,
		initPhone			:_initPhone,
		queryApConfig		:_queryApConfig,
		selectTerminal		:_selectTerminal,
		setNumber			:_setNumber,
		offerSpecId			:_offerSpecId,
		selectColor			:_selectColor,
		scroll				:_scroll,
		hyClick				:_hyClick,
		ljClick				:_ljClick,
		selectHy			:_selectHy,
		changeHyContent     :_changeHyContent,
		changePeriod        :_changePeriod,
		termSaleScroll     :_termSaleScroll,
		back     :_back,
		btnQueryTerminalSale :_btnQueryTerminalSale
	};
})(jQuery);
$(function() {
	OrderInfo.order.step=1;
});