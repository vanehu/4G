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
	var _Ljdata = {};//保存裸机数据
	var hy_flag;
	var cardIndex = -2;//标记副卡序号
	var maxCard = 0;
	var hytcmc = "";//合约名称
	var hytcid = "";//合约id
	var isSelect = "N";//是否已经选择合约依赖
	var isSelectPhoneNum = "N";//是否已经加载过选号
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
			buyType 	: "hy",
			numFlag 	: false,
			numLevel 	: "0",
			hyFlag 		: true,
			hyType		: "",
			hyOfferSpecId	: 0,
			hyOfferSpecName	: "",
			hyOfferSpecQty	: 0,
			hyOfferSpecFt	: 0,
			hyOfferRoles	: null,
			tsnFlag 		: false
		};
		OrderInfo.actionFlag = 14;
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
		$("#nbr_btn_-1").val(num);
		if(OrderInfo.actionFlag != 1){
			buyChk.numFlag = true;
			buyChk.numLevel = numLevel;
			_chkState();
			$("#treaty").show();
		}
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
	//主推终端
	var _terminalMainPushScroll = function(scrollObj){
		if(scrollObj && scrollObj.page && scrollObj.page >= 1){
			_btnQueryTerminal_MainPush(scrollObj.page,scrollObj.scroll);
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
		//隐藏选套餐模块
		if($("#phonelist").length>0){
			$("#phonelist").hide();
		}
		if($("#pakeage").length>0){
			$("#pakeage").hide();
		}
		//请求地址
		var url = contextPath+"/agent/mktRes/terminal/list";
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
				$.unecOverlay();
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
	 * 构造手机查询条件
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
	
	//构造号码查询条件 
	var _buildPhoneParam = function(param){
		var query_flag_01= $('input[name="query_flag_01"]').parent().attr("class");  //1 no 2 yes
		if(query_flag_01=="toggle btn btn-default off"){
			query_flag_01 = "1";
		}else{
			query_flag_01 = "2";
		}
		var areaId="";
		if(OrderInfo.cust==undefined || OrderInfo.cust.custId==undefined || OrderInfo.cust.custId==""){
			areaId=OrderInfo.staff.soAreaId+"";
		}else{
			areaId=OrderInfo.staff.soAreaId+"";
		}
		var pnHead = $("#pnHead").val(); 
		var pncharacteristic = $("#pncharacteristic").find("a.selected").attr("val");
		var pnEnd = $.trim($("#pnEnd").val());
		if(pncharacteristic!=null && pncharacteristic!=""){
			pnEnd = pncharacteristic;
		}else{
			if(pnEnd=='最后四位'){
				pnEnd='';
		    }
		}
		var phoneNum='';
//		var phoneNum=$.trim($("#phoneNum").val());
//		if(phoneNum=="任意四位"){
//			phoneNum='';
//		}
		var pnCharacterId="";
		var Greater = $("#Greater").val();
		var Less  = $("#Less").val();
		//第一次搜索号码时默认搜索预存话费0元的号码
		if(isSelectPhoneNum == "N"){
			Greater = "0";
			Less  = "0";
			isSelectPhoneNum = "Y";
		}
//		var preStore$=$("#preStore").find("a.selected");
//		if(preStore$.length>0){
//			Greater= preStore$.attr("Greater");
//			Less=preStore$.attr("Less");
//		}
		
		var poolId = $("#nbrPool option:selected").val();	
		var subPage = $("#subPage").val();
		
//		if($("#pnCharacterId_basic").css("display") != "none"){
			pnCharacterId = $("#pnCharacterId_basic option:selected").val();
//		}
//		if($("#pnCharacterId_all").css("display") != "none"){
//			pnCharacterId = $("#pnCharacterId_all option:selected").attr("val");
//		}
		pnCharacterId = ec.util.defaultStr(pnCharacterId);
		return {"pnHead":pnHead,"pnEnd":pnEnd,"goodNumFlag":pnCharacterId,"maxPrePrice":Less,
			"minPrePrice":Greater,"pnLevelId":'',"pageSize":"10","phoneNum":phoneNum,"areaId":areaId,"poolId":poolId,"subPage":subPage,   
			"queryFlag":query_flag_01
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
	
	var _agent_initPhone=function(){
		var curPage = 1;
		OrderInfo.order.step=1;
		OrderInfo.busitypeflag=1;
		mktRes.terminal.queryApConfig();
		$("#phoneModal").modal("hide");
		//请求地址
		var url = contextPath+"/agent/mktRes/phoneInit";
		//收集参数
		var param = _buildInParam(1);
		param.moduleId = 1000; //排序模块
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
				$("#phonelist").html(response.data);
				$.refresh($("#phonelist"));
			}
		});
	};
	
	
	var _hyClick=function(obj){
		if(buyChk.buyType == 'hy'){
			return true;
		}else{
		$.confirm("信息确认","您确定要取消裸机订购吗？",{ 
			yesdo:function(){
				_initBuyChk();
				buyChk.buyType = 'hy';
				_chkState();
				$("#buyTypeBtns .btn-default").removeClass("active");
				$(obj).addClass("active");
				var buytype = $("input[name='buytype']:checked").val();
					if (buytype == "2") {
						$(".displaydiv").hide();
						$(".hidediv").show();
					} else {
						$(".displaydiv").show();
						$(".hidediv").hide();
					}
			},
			no:function(){
				$("#goulj").addClass("active");
				$(obj).removeClass("active");
			}
		});
		}
	};
	var _ljClick=function(obj){
		if(buyChk.buyType == 'lj'){
			return true;
		}else{
		$.confirm("信息确认","您确定要取消合约机订购吗？",{ 
			yesdo:function(){
				$("#nbr_btn_-1").val("");
				_initBuyChk();
				buyChk.buyType = 'lj';
				_chkState();
				$("#buyTypeBtns .btn-default").removeClass("active");
				$(obj).addClass("active");
				var boProdAns = OrderInfo.boProdAns;
				var boProd2Tds = OrderInfo.boProd2Tds;
				//取消订单时，释放被预占的UIM卡
				if(boProd2Tds.length>0){
					for(var n=0;n<boProd2Tds.length;n++){
							var param = {
								numType : 2,
								numValue : boProd2Tds[n].terminalCode
							};
							$.callServiceAsJson(contextPath+"/agent/mktRes/phonenumber/releaseErrorNum", param, {
								"done" : function(){}
							});
							OrderInfo.boProd2Tds.splice(n,1);//清楚JS中某个UIM预占缓存
					}
				}
				//释放预占的号码
				if(boProdAns.length>0){
					for(var n=0;n<boProdAns.length;n++){
							var param = {
								numType : 1,
								numValue : boProdAns[n].accessNumber
							};
							$.callServiceAsJson(contextPath+"/agent/mktRes/phonenumber/releaseErrorNum", param, {
								"done" : function(){}
							});
							OrderInfo.boProdAns.splice(n,1);//清楚JS中某个号码预占缓存
					}
				}
				var buytype = $("input[name='buytype']:checked").val();
					if (buytype == "2") {
						$(".displaydiv").hide();
						$(".hidediv").show();
					} else {
						$(".displaydiv").show();
						$(".hidediv").hide();
					}
			},
			no:function(){
				$("#gouhyj").addClass("active");
				$(obj).removeClass("active");
			}
		});
		}
	};
	
	var _newCClick=function(obj){
		if($(obj).attr("id") == "gouhyj" && $("#newc").css("display") == "none"){
			$.confirm("确认","确定要新建客户吗？",{
					yes:function(){
						cust.custReset();
						$("#newc").show();
						$("#oldc").hide();
						return;
					},no:function(){
						$("#laokhdw").addClass("active");
						$(obj).removeClass("active");
					return;
				}},"question");
		}else{
			$("#newc").show();
			$("#oldc").hide();
		}
	};
	var _oldCClick=function(obj){
		$("#newc").hide();
		$("#oldc").show();
	};
	
	/**
	 * 选择立即订购终端
	 */
	var _selectTerminal=function(obj){
		isSelectPhoneNum = "N";//初始化是否已经加载过选号页面
		isSelect = "N";
		maxCard = 0;
		cardIndex = -2;
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
		var url = contextPath+"/agent/mktRes/terminal/detail";
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
//				common.callTitle(3);
				OrderInfo.order.step=2;
				var content$=$("#order").html(response.data).show();
				$.refresh(content$);
				$("#order_prepare").hide();
				_initBuyChk();
				$("#cNumA").click(function(){
					var custId = OrderInfo.cust.custId;
//					if(OrderInfo.cust==undefined || custId==undefined || custId==""){
//						$.alert("提示","在选号码之前请先进行客户定位或者新建客户！");
//						return;
//					}
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
	var _selectColor=function(id){
		var obj = $("#"+id);
		var p_pic				=$(obj).attr("p_pic");
		var mktResName			=$(obj).attr("mktResName");
		var mktSalePrice		=$(obj).attr("mktSalePrice");
		var mktNormalSalePrice	=$(obj).attr("mktNormalSalePrice");
		var mktResId			=$(obj).attr("mktResId");
		var mktResTypeCd		=$(obj).attr("mktResTypeCd");
		var mktSpecCode			=$(obj).attr("mktSpecCode");
		if(mktResId == $("#mktResId").val()) {
			return;
		}
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
		$("#nbr_btn_-1").val("");
		$("#choosedOfferPlan").html("");
		var boProdAns = OrderInfo.boProdAns;
		//释放预占的号码
		if(boProdAns.length>0){
			for(var n=0;n<boProdAns.length;n++){
				if(boProdAns[n].prodId==-1){
					var param = {
						numType : 1,
						numValue : boProdAns[n].accessNumber
					};
					$.callServiceAsJson(contextPath+"/agent/mktRes/phonenumber/releaseErrorNum", param, {
						"done" : function(){}
					});
					OrderInfo.boProdAns.splice(n,1);//清楚JS中某个号码预占缓存
				}
			}
		}
	};
	
	/**
	 * 重选合约
	 */
	var reSelectType = 0;
	var _reSelectHy = function(){
		if(reSelectType==1){
			_selectHy(reSelectType,$("#cf"));
		}else if(reSelectType==2){
			_selectHy(reSelectType,$("#gj"));
		}else return;
	}
	/**
	 * 选择合约类型,具体合约放致后面操作
	 */
	var _selectHy=function(agreementType,obj){
		reSelectType = agreementType;
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
		_offePre();
//		var param={
//				"mktResCd":$("#mktResId").val(),
//				"agreementType":agreementType
//		};
//		var url=contextPath+"/agent/mktRes/terminal/mktplan";
//		$.callServiceAsHtmlGet(url,param,{
//			"before":function(){
//			},
//			"always":function(){
//			},
//			"done" : function(response){
//				if(!response){
//					$.alert("提示","<br/>处理失败，请稍后重试！");
//					return;
//				}
//				if(response.code != 0) {
//					if (response.code == 1006){
//						$.alert("提示","<br/>查询不到，请稍后重试");
//					} else {								
//						$.alert("提示","<br/>查询失败，请稍后重试");
//					}
//					return;
//				}
//				$("#div_offer").html(response.data).show();
//				$.refresh($("#div_offer"));
//				$("#terminalMain").hide();
//				var offerSpecId=$("#select_offerSpecId_0").val();
//				_queryOffer(offerSpecId,agreementType);
//				//绑定确定按钮click事件
//				$("#termOfferSpecConfirm").off("click").on("click",function(event){
//					_selectPlan();
//				});
//			}
//		});
	};
	
	var _selectTc=function(offerSpecId,offerSpecName){
		var agreementType = 1;
		if (buyChk.hyType == 'cfsj') {
			agreementType = 1;
		} else {
			agreementType = 2;
		}
		var param={
				"mktResCd":$("#mktResId").val(),
				"agreementType":agreementType,
				"offerSpecId":offerSpecId,
				"offerSpecName":offerSpecName
		};
		var url=contextPath+"/agent/mktRes/terminal/mktplan";
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
						$.alert("提示","<br/>查询不到合约");
					} else {								
						$.alert("提示","<br/>查询失败，请稍后重试");
					}
					return;
				}
				$("#div_offer").html(response.data).show();
				$.refresh($("#div_offer"));
				$("#offer-prepare").hide();
//				var offerSpecId=$("#select_offerSpecId_0").val();
//				_queryOffer(offerSpecId,agreementType);
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
		var offerSpecId=$(obj).attr("title");
		$(".success").removeClass("success");
		//购合约机 选中的合约亮色
		$(obj).addClass("success");
		if($(".selectHy").length>0){
			$(".selectHy").removeClass("selectHy");
		}
		$(obj).addClass("selectHy");
		_queryOffer(offerSpecId,agreementType);
		mktRes.terminal.hytcid = offerSpecId;
		mktRes.terminal.hytcmc = $(obj).attr("offerSpecName");
	};
	/**
	 * 切换话补或者机补比例
	 */
	_changePeriod=function(ti,agreementType){
		var tabIndex=ti;
		$(".itemMain").hide();
		$("#tab_content_"+tabIndex).show();
//		_changeHyContent($("#select_offerSpecId_"+tabIndex),agreementType);
	};
	/**
	 * 查询套餐后生成展示内容
	 */
	var _queryOffer=function(offerSpecId, agreementType){
		//调用order.js中的方法获得主销售品规格
		$("#select_offerSpecId").val(offerSpecId);
		_selectTc_hy("");
//		var response = order.service.queryPackForTerm(offerSpecId, agreementType, '');
//		if (typeof(response) == "undefined" || response==null){
//			$.alert("提示","<br/>未查到套餐，请稍后再试！");
//			return;
//		}
//		if (response.code == -2){
//			$.alertM(response.data);
//			$.unecOverlay();
//			return;
//		}
//		if(response.code != 0 || response.data.code != "POR-0000"){
//			$.alert("提示","<br/>未查到合适套餐，请稍后再试！");
//			return;
//		}
//		var offerHtml="<table class='table table-striped tablecenter'>";
//		offerHtml+="  <thead>";
//		offerHtml+="    <tr>";
//		offerHtml+="      <th>套餐名称</th>";
//		offerHtml+="    </tr>";
//		offerHtml+="  </thead>";
//		offerHtml+="  <tbody class='panel-group'>";
//		var offerInfos = response.data.prodOfferInfos;
//		if (offerInfos.length == 0) {
//			$.alert("提示","<br/>未查到套餐，请稍后再试！");
//		}
//		for(var i=0;i<offerInfos.length;i++){
//			var offer = offerInfos[i];
//			var inFlux = '';
//			if (offer.inFlux >= 1024) {
//				inFlux = offer.inFlux / 1024 + 'G';
//			} else {
//				inFlux = offer.inFlux + 'M';
//			}
//			var inVoice=ec.util.defaultStr(offer.inVoice);
//			var inWIFI=ec.util.defaultStr(offer.inWIFI);
//			var inSMS=ec.util.defaultStr(offer.inSMS);
//			var inMMS=ec.util.defaultStr(offer.inMMS);
//			var outFlux=ec.util.defaultStr(offer.outFlux);
//			var outVoice=ec.util.defaultStr(offer.outVoice);
//			
//			offerHtml+="<tr offerSpecId='"+offer.offerSpecId+"'";
//			offerHtml+=" offerSpecName='"+offer.offerSpecName+"'";
//			offerHtml+=" price='"+offer.price+"'";
//			offerHtml+=" inWIFI='"+inWIFI+"'";
//			offerHtml+=" inFlux='"+inFlux+"'";
//			offerHtml+=" inSMS='"+inSMS+"'";
//			offerHtml+=" inMMS='"+inMMS+"'";
//			offerHtml+=" outFlux='"+outFlux+"'";
//			offerHtml+=" outVoice='"+outVoice+"'";
//			offerHtml+=" inVoice='"+inVoice+"'>";
//			offerHtml+=" <td>"+ec.util.defaultStr(offer.offerSpecName)+"</td>";
//			offerHtml+="</tr>";
//		}
//		offerHtml+="  </tbody>";
//		offerHtml+="  </table>";
//		
//		$("#offerSecond").html(offerHtml);
//		$.refresh($("#offerSecond"));
//		$("#offerSecond tbody tr").off("click").on("click",function(event){_linkSelectPlan(this);event.stopPropagation();});
	};
	//选套餐后选合约
	var _selectTc_hy=function(selected){
//		$("#offerSecond tbody tr").removeClass("success");
		var offerSpecId = $("#tc_offerSpecId").val();
		var result = _queryOfferSpec(offerSpecId, selected);
		if (result) {
//			$(selected).addClass("success");
			$("#offerSpecId-1").val(offerSpecId);
		}
	};
	
	var _linkSelectPlan=function(selected){
		$("#offerSecond tbody tr").removeClass("success");
		var offerSpecId = $(selected).attr("offerSpecId");
		var result = _queryOfferSpec(offerSpecId, selected);
		if (result) {
			$(selected).addClass("success");
			$("#offerSpecId-1").val(offerSpecId);
		}
	};
	
	var _queryOfferSpec=function(offerSpecId, selected){
		var inParam = {
//			"price":$(selected).attr("price"),
			"id" : 'tcnum1',
			"specId" : offerSpecId,
			"custId" : OrderInfo.cust.custId,
			"areaId" : OrderInfo.staff.soAreaId
		};
		_opeSer(inParam); //调用公用弹出层
//		order.service.opeSer(inParam); //调用公用弹出层
		return true;
	};
	
	//获取销售品构成，并选择数量
	var _opeSer = function(inParam){	
		var param = {
			offerSpecId : inParam.specId,
			offerTypeCd : 1,
			partyId: OrderInfo.cust.custId
		};
		var offerSpec = query.offer.queryMainOfferSpec(param); //查询主销售品构成
		if(!offerSpec){
			return;
		}
		if(OrderInfo.actionFlag == 2){ //套餐变更
			var url=contextPath+"/app/order/queryFeeType";
			$.ecOverlay("<strong>正在查询是否判断付费类型的服务中,请稍后....</strong>");
			var response = $.callServiceAsJsonGet(url,param);	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data!=undefined){
					if("0"==response.data){
						var is_same_feeType=false;
						if(order.prodModify.choosedProdInfo.feeType=="2100" && (offerSpec.feeType=="2100"||offerSpec.feeType=="3100"||offerSpec.feeType=="3101"||offerSpec.feeType=="3103"||offerSpec.feeType=="1202"||offerSpec.feeType=="2101")){
							is_same_feeType=true;//预付费
						}else if(order.prodModify.choosedProdInfo.feeType=="1200" && (offerSpec.feeType=="1200"||offerSpec.feeType=="3100"||offerSpec.feeType=="3102"||offerSpec.feeType=="3103"||offerSpec.feeType=="1202"||offerSpec.feeType=="2101")){
							is_same_feeType=true;//后付费
						}else if(order.prodModify.choosedProdInfo.feeType=="1201" && (offerSpec.feeType=="1201"||offerSpec.feeType=="3101"||offerSpec.feeType=="3102"||offerSpec.feeType=="3103")){
							is_same_feeType=true;//准实时预付费
						}
//						if(!is_same_feeType){
//							$.alert("提示","付费类型不一致,无法进行套餐变更。");
//							return;
//						}
					}
				}
			}
			offerChange.offerChangeView();
			return;
		}
		var iflag = 0; //判断是否弹出副卡选择框 false为不选择
		var max=0;
		var str="";
		$("#div_content").empty();
		$.each(offerSpec.offerRoles,function(){
			var offerRole = this;
			if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){//副卡接入类产品
				$.each(this.roleObjs,function(){
					var objInstId = offerRole.offerRoleId+"_"+this.objId;//角色id+产品规格id
					if(this.objType == CONST.OBJ_TYPE.PROD){
						if(offerRole.minQty == 0){ //加装角色
							this.minQty = 0;
							this.dfQty = 0;
						}
						max = this.maxQty<0?"不限制":this.maxQty;//主卡的最大数量
						maxCard = max;
						str+="<div class='form-group'>"
							+"<label for='"+objInstId+"'>副卡数量:"+this.minQty+"-"+max+"(张)</label>"
							+"<div class='input-group input-group-lg'>"
							+"<span class='input-group-btn'>"
							+"<button class='btn btn-default' type='button' onclick=order.service.subNum('"+objInstId+"',"+this.minQty+")> - </button>"
							+"</span>"
							+"<input type='text'  readonly='readonly' class='form-control' id='"+objInstId+"' value='"+this.dfQty+"'>"
							+"<span class='input-group-btn'>"
							+"<button class='btn btn-default' type='button' onclick=order.service.addNum('"+objInstId+"',"+this.maxQty+",'"+offerRole.parentOfferRoleId+"')> + </button>"
							+"</span> </div>"
							+"</div>";
						iflag++;
						return false;
					}
				});
			}
		});
		//页面初始化参数
		var param = {
			"boActionTypeCd" : "S1" ,
			"boActionTypeName" : "订购",
			"offerSpec" : offerSpec,
			"actionFlag" :1,
			"type" : 1
		};
		_confirm(param);
//		if(iflag >0){
//			$("#div_content").append(str);
//			$("#vice_modal").modal("show");
//			$("#btn_modal").off("click").on("click",function(){
//				order.service.confirm(param);
//			});
//		}else{
//			if(!_setOfferSpec(1)){
//				$.alert("错误提示","请选择一个接入产品");
//				return;
//			}
//			if(OrderInfo.actionFlag!=14){ //合约套餐不初始化
//				order.main.buildMainView(param);	
//			}
//		}
	};
	
	//选择完主套餐构成后确认
	var _confirm = function(param){
		hy_flag = 0;
		if(!_setOfferSpec()){
			$.alert("错误提示","请选择一个接入产品");
			return;
		}
		if(OrderInfo.actionFlag!=14){ //合约套餐不初始化
			order.main.buildMainView(param);	
		}
		$("#vice_modal").modal("hide");
	};
	
	//根据页面选择成员数量保存销售品规格构成 offerType为1是单产品
	var _setOfferSpec = function(offerType){
		var k =-1;
		var flag = false;  //判断是否选接入产品
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			var offerRole = this;
			offerRole.prodInsts = []; //角色对象实例
			$.each(this.roleObjs,function(){
				if(this.objType== CONST.OBJ_TYPE.PROD){  //接入类产品
					var num = 0;  //接入类产品数量选择
					if(offerType==1){  //单产品
						num = 1;
					}else if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD&&OrderInfo.actionFlag!=6){//主卡的接入类产品数量
						hy_flag = 1;
						num = 1;
					}else{ //多成员销售品
						num = $("#"+offerRole.offerRoleId+"_"+this.objId).val();  //接入类产品数量选择
					}
					if(num==undefined || num==""){
						num = 0;
					}
					for ( var i = 0; i < num; i++) {
						var newObject = jQuery.extend(true, {}, this); 
						newObject.prodInstId = k--;
						if(num>1){ //同一个规格产品选择多个
							newObject.offerRoleName = offerRole.offerRoleName+(i+1);
						}else{
							newObject.offerRoleName = offerRole.offerRoleName;
						}
						newObject.memberRoleCd = offerRole.memberRoleCd;
						offerRole.prodInsts.push(newObject);   
						flag = true;
					}
					offerRole.selQty = num;
				}else{ //功能类产品
					if(this.minQty==0){
						this.dfQty = 1;
					}
				}
			});
		});
		return flag;
	};
	
	/**
	 * 在合约套餐窗口选择套餐
	 */
	var _selectPlan=function(){
		var offerSpec=$(".success");
		//搜索是否有
		if (offerSpec==undefined || offerSpec.length!=1 || hy_flag==0) {
			offerSpec.removeClass("success");
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
//			buyChk.hyOfferSpecId=offerSpec.attr("offerSpecId");
//			buyChk.hyOfferSpecName=offerSpec.attr("offerSpecName");
			buyChk.hyOfferSpecId=$("#tc_offerSpecId").val();
			buyChk.hyOfferSpecName=$("#tc_offerSpecName").val();
			_chkState();
			$("#agreementFie").show();
			$("#choosedOfferPlan").val(offerSpec.attr("offerSpecName"));
			$("#terminalMain").show();
			$("#div_offer").hide();
			var max_num = maxCard;
			$("#max_num").text(maxCard);//显示最大副卡数量
			_purchase();
			OrderInfo.returnFlag="";
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
		tc = tc.replace(/(^\s*)|(\s*$)/g, "");
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
		//先不校验串号
//		buyChk.tsnFlag = true;
		_chkState();
		$("#tsn_hid").val(tc);
		//裸机销售时才校验终端串号
		if("hy"==buyChk.buyType){
			termInfo.mktResId = $("#mktResId").val();
		}
			var url = contextPath+"/agent/mktRes/terminal/checkTerminal";
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
			if(termInfo.mktResId==undefined || termInfo.mktResId==""){
				termInfo.mktResId = $("#mktResId").val();
			}
//			if (!buyChk.tsnFlag) {
//				$.alert("提示","<br/>请先校验终端串号。");
//				return;
//			}
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
				couponInstanceNumber : ($("#tsn").val()).replace(/(^\s*)|(\s*$)/g, ""), //termInfo.instCode物品实例编码
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
//			$("#terminalMain").hide();
			SoOrder.getTokenSynchronize();
//			//订单提交
//			SoOrder.submitOrder(data);
			mktRes.terminal.Ljdata = data;
			return;
		} else if ("hy"==buyChk.buyType) {
//			if (!buyChk.tsnFlag) {
//				$.alert("提示","<br/>请先校验终端串号。");
//				return;
//			}
			//校验客户是否已定位
//			if (!(OrderInfo.cust.custId)|| OrderInfo.cust.custId=="") {
//				$.alert("提示","<br/>在订购套餐之前请先进行客户定位！");
//				return;
//			}
			//构造参数，填单
			if (buyChk.hyType==""){
				$.alert("提示","<br/>请选择合约!");
				return;
			}
		} else {
			return;
		}
		if(termInfo.mktResId==undefined || termInfo.mktResId==""){
			termInfo.mktResId = $("#mktResId").val();
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
			storeId 			: "",//termInfo.mktResStoreId, //仓库ID
			storeName 			: "1", //仓库名称
			agentId 			: 1, //供应商ID
			apCharge 			: $("#price").val() / 100, //物品价格
			couponInstanceNumber: ($("#tsn").val()).replace(/(^\s*)|(\s*$)/g, ""),//termInfo.instCode, //物品实例编码
			ruleId 				: "", //物品规则ID
			partyId 			: OrderInfo.cust.custId, //客户ID
			prodId 				: -1, //产品ID
			offerId 			: -1, //销售品实例ID
			attachSepcId 		: mktRes.terminal.offerSpecId,
			state 				: "ADD", //动作
			relaSeq 			: "" //关联序列	
		};
		if(CONST.getAppDesc()==0){
			//终端校验后termTypeFlag=1 这里先写死
			coupon.termTypeFlag=1;//termInfo.termTypeFlag;
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
		_builder(); //初始化订单数据
		_buildMainView(param);
	};
	
	//订单准备
	var _builder = function() {
		if(query.offer.loadInst()){  //加载实例到缓存
			_initFillPage();
			return true;
		}else{
			return false;
		};
	};
	
	//初始化填单页面，为规则校验类型业务使用
	var _initFillPage = function(){
		_initOrderData();
		OrderInfo.order.step=2;
		if(OrderInfo.actionFlag==1){
			try{
//				common.callTitle(3);//3 头部为 新装 字眼头部
			}catch(e){
			}
		}
//		SoOrder.step(1); //显示填单界面
		_getToken(); //获取页面步骤
	}; 
	
	//初始化订单数据
	var _initOrderData = function(){
		OrderInfo.resetSeq(); //重置序列
		_resetData(); //重置 数据
		OrderInfo.orderResult = {}; //清空购物车
//		OrderInfo.getOrderData(); //获取订单提交节点	
		_getOrderData(); //获取订单提交节点
		OrderInfo.orderData.orderList.orderListInfo.partyId = OrderInfo.cust.custId;
		OrderInfo.orderData.orderList.orderListInfo.areaId = OrderInfo.getAreaId();
	};
	
	//初始化数据
	var _resetData = function(){
//		OrderInfo.boProdAns = [];  
		OrderInfo.boProd2Tds = []; 
		//OrderInfo.boProd2OldTds = []; 
		OrderInfo.bo2Coupons = [];
		AttachOffer.openList = [];
		AttachOffer.openedList = [];
		AttachOffer.openServList = [];
		AttachOffer.openedServList = [];
		AttachOffer.openAppList = [];
		AttachOffer.labelList = [];
		OrderInfo.confirmList = [];
		OrderInfo.orderResult = {}; 
		/*OrderInfo.offerSpec = {}; //主销售品构成
		OrderInfo.offer = { //主销售品实例构成
			offerId : "",
			offerSpecId : "",
			offerMemberInfos : []
		}; */
	};
	
	//创建一个订单完整节点
	var _getOrderData = function(){
		//订单提交完整节点
		var data = { 
			orderList : {
				orderListInfo : { 
					isTemplateOrder : "N",   //是否批量
					templateType : OrderInfo.order.templateType,  //模板类型: 1 新装；8 拆机；2 订购附属；3 组合产品纳入/退出
					staffId : OrderInfo.staff.staffId,
					channelId : OrderInfo.staff.channelId,  //受理渠道id
					areaId : OrderInfo.staff.soAreaId,
					partyId : -1,  //新装默认-1
					//distributorId : OrderInfo.staff.distributorId, //转售商标识
					olTypeCd : CONST.OL_TYPE_CD.AGENT,  //app标识
					actionFlag : OrderInfo.actionFlag,
					extSystem : "1000000244"
				},
				custOrderList :[{busiOrder : []}]   //客户订购列表节点
			}
		};
		OrderInfo.orderData = data;
		return OrderInfo.orderData;
	};
	
	//初始化订单获取token
	var _getToken = function() {
		var response = $.callServiceAsHtmlGet(contextPath+"/common/getToken");
		OrderInfo.order.token = response.data;
	};
	
	var _buildMainView = function(param) {
		if (param == undefined || !param) {
			param = order.main.getTestParam();
		}
		$.callServiceAsHtml(contextPath+"/agent/order/main-phone",param,{
			"before":function(){
				$.ecOverlay("<strong>正在加载中,请稍等...</strong>");
			},"done" : function(response){
				if(!response){
					$.unecOverlay();
					 response.data='查询失败,稍后重试';
				}
				if(response.code != 0) {
					$.unecOverlay();
					$.alert("提示","查询失败,稍后重试");
					return;
				}
				OrderInfo.actionFlag = param.actionFlag;
				if(OrderInfo.actionFlag == 2){
					setTimeout(function () { 
						$.unecOverlay();
						offerChange.fillOfferChange(response,param);
				    }, 800);
				}else if(OrderInfo.actionFlag == 21){//副卡换套餐
					order.memberChange.fillmemberChange(response,param);
				}else {
					$.unecOverlay();
					_callBackBuildView(response,param);
				}
			}
		});
	};
	
	//展示回调函数
	var _callBackBuildView = function(response, param) {
//		_initFillPage(); //并且初始化订单数据
//		$("#order_prepare").hide();
//		$("#member_prepare").hide();
		var content$ = $("#productInfo").html(response.data).show();
		$.refresh(content$);
		$("#fkxx").show();
//		_initTounch();
		//_initOfferLabel();//初始化主副卡标签
		_initFeeType(param);//初始化付费方式
		
		if(param.actionFlag==''){
			OrderInfo.actionFlag = 1;
		}
//		
//		if(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6){//主副卡纳入老用户
//			_loadAttachOffer(param);
//		}else{
			_loadOther(param);//页面加载完再加载其他元素
//		}
//		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==6 || OrderInfo.actionFlag==13 || OrderInfo.actionFlag==14){
//			_initAcct(0);//初始化主卡帐户列表 
//		}
		//_loadOther(param);//页面加载完再加载其他元素
//		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==6 || OrderInfo.actionFlag==13 || OrderInfo.actionFlag==14){
//			_initAcct();//初始化帐户列表 
//			$("#acctName").val(OrderInfo.cust.partyName);
//			order.dealer.initDealer();//初始化协销		
//		}
//		_addEvent();//添加页面事件*/
		_initDealer();//直接加载发展人 不显示
//		_initOffer('1');//主卡自动填充号码入口已选过的号码
//		$("#fillNextStep").off("click").on("click",function(){
//			//SoOrder.submitOrder();
//			if(!SoOrder.checkData()){ //校验通过
//				return false;
//			}
//			$("#order-content").hide();
//			$("#order-dealer").show();
//			order.dealer.initDealer();
//		});
//		if (param.memberChange) {
//			$("#orderedprod").hide();
//			$("#order_prepare").hide();
//			$("#productDiv .pdcardcon:first").show();
////			try{
////			  order.prepare.step(1);
////			}catch(){
////				
////			}
//			$("#fillLastStep").off("click").on("click",function(){
//				order.prodModify.cancel();
//			});
//		}else{
			$("#fillLastStep").off("click").on("click",function(){
				_lastStep();
			});
//		}
	};
	
	//动态添加产品属性、附属销售品等
	var _loadOther = function(param) {
		$.each(OrderInfo.offerSpec.offerRoles,function(){ //遍历主套餐规格
			var offerRole = this;
			for ( var i = 0; i < this.prodInsts.length; i++) {
				var prodInst = this.prodInsts[i];
				var param = {   
					offerSpecId : OrderInfo.offerSpec.offerSpecId,
					prodSpecId : prodInst.objId,
					offerRoleId: prodInst.offerRoleId,
					prodId : prodInst.prodInstId,
					queryType : "1,2",
					objType: prodInst.objType,
					objId: prodInst.objId,
					memberRoleCd : prodInst.memberRoleCd
				};
				_queryAttachOfferSpec(param);  //加载附属销售品
				var obj = {
					div_id : "item_order_"+prodInst.prodInstId,
					prodId : prodInst.prodInstId,
					offerSpecId : OrderInfo.offerSpec.offerSpecId,
					compProdSpecId : "",
					prodSpecId : prodInst.objId,
					roleCd : offerRole.roleCd,
					offerRoleId : offerRole.offerRoleId,
					partyId : OrderInfo.cust.custId
				};
				order.main.spec_parm(obj); //加载产品属性
			}			
		});
	};
	
	//可订购的附属查询 
	var _queryAttachOfferSpec = function(param) {
		_queryAttachSpec(param,function(data){
			if (data) {
				$("#attach_phone_"+param.prodId).html(data);
				AttachOffer.showMainRoleProd(param.prodId); //通过主套餐成员显示角字
				AttachOffer.initMyfavoriteSpec(param.prodId,0);//初始化我的收藏
				AttachOffer.changeLabel(param.prodId,param.prodSpecId,"10001"); //初始化第一个标签附属
				if(param.prodId==-1 && OrderInfo.actionFlag==14){ //合约计划特殊处理
					AttachOffer.addOpenList(param.prodId,mktRes.terminal.offerSpecId);
				}
			}
		});
	};
	
	//附属销售品规格查询
	var _queryAttachSpec = function(param,callBackFun) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/agent/offer/queryAttachSpecPhone";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsHtmlGet(url,{strParam:JSON.stringify(param)},{
				"before":function(){
					$.ecOverlay("<strong>正在查询附属销售品中,请稍后....</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					if (response.code==0) {
						if(response.data){
							callBackFun(response.data);
						}
					}else if (response.code==-2){
						$.alertM(response.data);
						return;
					}else {
						$.alert("提示","附属销售品查询失败,稍后重试");
						return;
					}
				}
			});	
		}else {
			$.ecOverlay("<strong>查询查询附属销售品中，请稍等...</strong>");
			var response = $.callServiceAsHtmlGet(url,{strParam:JSON.stringify(param)});	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data;
				}
			}else if (response.code==-2){
				$.alertM(response.data);
				return;
			}else {
				$.alert("提示","查询附属销售品失败,稍后重试");
				return;
			}
		}
	};
	
	//补充查询基本条件
	var addParam = function(param){
		//param.staffId = '1762126';
		param.staffId = OrderInfo.staff.staffId;
		//param.channelId = '1388783';
		param.channelId	= OrderInfo.staff.channelId;
		
		//param.areaId = '8320102';
		param.areaId = OrderInfo.getProdAreaId(param.prodId);
		param.partyId = OrderInfo.cust.custId;
		if(OrderInfo.actionFlag == 3){
			param.mainOfferSpecId=order.prodModify.choosedProdInfo.prodOfferId;
		}else if(OrderInfo.actionFlag==21){
			if(ec.util.isArray(OrderInfo.viceOfferSpec)){
				$.each(OrderInfo.viceOfferSpec,function(){
					if(this.prodId==param.prodId){
						param.mainOfferSpecId=this.offerSpecId;
						return false;
					}
				});
			}
		}else{
			param.mainOfferSpecId=OrderInfo.offerSpec.offerSpecId;
		}
		if(ec.util.isObj(OrderInfo.order.soNbr)){  //缓存流水号
			param.soNbr = OrderInfo.order.soNbr;
		}
		else{
			param.soNbr = UUID.getDataId();
			OrderInfo.order.soNbr = UUID.getDataId();
		}
		if(order.ysl!=undefined){
			if(order.ysl.yslbean.yslflag!=undefined){
//				param.yslflag = order.ysl.yslbean.yslflag;
			}
		}
		if(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6){//主副卡纳入老用户
			for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
				if(param.acctNbr==OrderInfo.oldprodInstInfos[i].accNbr){
					param.areaId = OrderInfo.oldprodInstInfos[i].areaId;
					param.partyId = OrderInfo.oldprodInstInfos[i].custId;
					param.mainOfferSpecId=OrderInfo.oldprodInstInfos[i].mainProdOfferInstInfos[0].prodOfferId;
				}
			}
		}
	};
	
	var _initFeeType = function(param) {
		if (param.feeType != undefined && param.feeType && param.feeType != CONST.PAY_TYPE.NOLIMIT_PAY) {
			$("input[name^=pay_type_][value="+param.feeType+"]").attr("checked","checked");
			$("input[name^=pay_type_]").attr("disabled","disabled");
		}
	};


	var _initOffer=function(subnum){
		if(order.phoneNumber.boProdAn.accessNumber!=''){
			$("#nbr_btn_"+subnum).removeClass("selectBoxTwo");
			$("#nbr_btn_"+subnum).addClass("selectBoxTwoOn");
			$("#nbr_btn_"+subnum).val(order.phoneNumber.boProdAn.accessNumber);
			order.dealer.changeAccNbr(subnum,order.phoneNumber.boProdAn.accessNumber);
			var isExists=false;
			if(OrderInfo.boProdAns.length>0){
				for(var i=0;i<OrderInfo.boProdAns.length;i++){
					if(OrderInfo.boProdAns[i].prodId==subnum){
						OrderInfo.boProdAns[i].accessNumber=order.phoneNumber.accessNumber;
						OrderInfo.boProdAns[i].anTypeCd=order.phoneNumber.anTypeCd;
						OrderInfo.boProdAns[i].anId=order.phoneNumber.anId;
						OrderInfo.boProdAns[i].pnLevelId=order.phoneNumber.level;
						OrderInfo.boProdAns[i].areaId=order.phoneNumber.areaId;
						OrderInfo.boProdAns[i].memberRoleCd=order.phoneNumber.memberRoleCd;
						OrderInfo.boProdAns[i].preStore=order.phoneNumber.preStore;
						OrderInfo.boProdAns[i].minCharge=order.phoneNumber.minCharge;
						if(order.phoneNumber.idFlag){
							OrderInfo.boProdAns[i].idFlag=order.phoneNumber.idFlag;
						}
						OrderInfo.setProdAn(OrderInfo.boProdAns[i]);  //保存到产品实例列表里面
//						order.dealer.changeAccNbr(subnum,phoneNumber); //选号玩要刷新发展人管理里面的号码
						isExists=true;
						break;
					}
				}
			}
			if(!isExists){
				var param={
					prodId : subnum, //从填单页面头部div获取
					accessNumber : order.phoneNumber.accessNumber, //接入号
					anChooseTypeCd : "2", //接入号选择方式,自动生成或手工配号，默认传2
					anId : order.phoneNumber.anId, //接入号ID
					pnLevelId:order.phoneNumber.level,
					anTypeCd : order.phoneNumber.anTypeCd, //号码类型
					state : "ADD", //动作	,新装默认ADD
					areaId:order.phoneNumber.areaId,
					areaCode:order.phoneNumber.areaCode,
					memberRoleCd:order.phoneNumber.memberRoleCd,
					preStore:order.phoneNumber.preStore,
					minCharge:order.phoneNumber.minCharge
				};
				if(order.phoneNumber.idFlag){
					param.idFlag=order.phoneNumber.idFlag;
				}
				OrderInfo.boProdAns.push(param);
			}
			if(subnum=='-1'){
				OrderInfo.boCustInfos.telNumber=order.phoneNumber.accessNumber;
			}
		}
	};
	
	//初始化发展人
	var _initDealer = function() {
		if(order.ysl!=undefined){
			OrderInfo.order.dealerTypeList = [{"PARTYPRODUCTRELAROLECD":"40020005","NAME":"第一发展人"},{"PARTYPRODUCTRELAROLECD":"40020006","NAME":"第二发展人"},{"PARTYPRODUCTRELAROLECD":"40020007","NAME":"第三发展人"}];
		}else{
			$.ecOverlay("<strong>正在查询发展人类型中,请稍后....</strong>");
			var response = $.callServiceAsJson(contextPath+"/agent/order/queryPartyProfileSpecList",null); //发展人类型查询
			$.unecOverlay();
			if(response.code==0){
				OrderInfo.order.dealerTypeList = response.data;
			}else if(response.code==-2){
				$.alertM(response.data);
				return;
			}else{
				$.alert("信息提示",response.msg);
				return;
			}
		}
		$("#dealerTbody").empty();  
		if(OrderInfo.actionFlag!=3&&OrderInfo.actionFlag!=2){
			$("#head").text(OrderInfo.offerSpec.offerSpecName);  
		}
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==2 || OrderInfo.actionFlag==14){ //新装业务，套餐变更需要主套餐发展人
			var objInstId = OrderInfo.offerSpec.offerSpecId;
			var $li = $("<li id='tr_"+objInstId+"' name='tr_"+objInstId+"' href='#' class='list-group-item'></li>");
			$li.append("<h5 class='list-group-item-heading text-warning'>主套餐</h5>");
			$li.append("<p class='list-group-item-text'>"+OrderInfo.offerSpec.offerSpecName+"</p><p> </p>");
			var $p = $('<p> </p>');
			var $div = $('<div class="row"> </div>');
			var $div2 = $('<div class="col-xs-6"> </div>');
						//var $field=$('<fieldset data-role="fieldcontain"></fieldset>');
			var objId = objInstId+"_"+OrderInfo.SEQ.dealerSeq;
			var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'"  class="selectpicker show-tick form-control" data-mini="true" data-native-menu="false" data-icon="select" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
//			if(order.ysl!=undefined){
//				$select.append("<option value='40020005'>第一发展人</option>");
//				$select.append("<option value='40020006'>第二发展人</option>");
//				$select.append("<option value='40020007'>第三发展人</option>");
//			}else{
				$.each(OrderInfo.order.dealerTypeList,function(){
					$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
				});
//			}
			$div2.append($select);
			$div.append($div2);
//			if(order.ysl!=undefined){
//				var $dd = $('<dd><input type="text" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" data-mini="true"></input></dd>');
//				$dl.append($dd);
//			}else{
				var $td = $('<div class="col-xs-6"><input type="text" objId="'+objId+'" readonly="readonly" onclick="javascript:order.dealer.showDealer(0,\'dealer\');" onChange="javascript:this.staffId=OrderInfo.staff.staffId;this.value=OrderInfo.staff.staffName" class="form-control showfzr" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" ></input></div>');
				$div.append($td);
//			}
			$li.append($div);
			$li.append($p);
			OrderInfo.SEQ.dealerSeq++;
			$("#dealerTbody").append($li);
			$.refresh($("#dealerTbody"));
		}
//		OrderInfo.order.step=3;
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
	//显示超长数字
	var _showNbr = function(title, nbr){
		$.alert(title, nbr);
	};
	var _selectNum=function(subnum,subPage){
					var custId = OrderInfo.cust.custId;
					if(OrderInfo.actionFlag != 1){
						_chkState();
					}
					_initPage(subnum,subPage);
				};
	var _initPage=function(subnum,subPage){
		//如果已经打开过选号页面，就不用重新加载选号页面，直接用原条件搜索号码
		if(isSelectPhoneNum == "Y" && $("#number-list").length>0){
			$("#order").hide();
			$("#order_prepare").hide();
			if(OrderInfo.actionFlag==1){
				if($("#order-content").length>0){
				$("#order-content").hide();
			}
			}
			$("#subnum").val(subnum);
			$("#subPage").val(subPage);
			if($("#zjfk_"+subnum).length>0){
				$("#zjfk_"+subnum).hide();
			}
			$("#phonenumberContent").show();
			$("#number-list").empty();
			var param={"subnum":subnum};
			_btnQueryPhoneNumber(param,null,subnum);
		}
		else{
			isSelectPhoneNum = "N";
			var url=contextPath+"/agent/mktRes/phonenumber/prepare";
			var param={"subnum":subnum};
			$.callServiceAsHtmlGet(url,param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					if(!response){
						 response.data='选号页面加载异常,稍后重试';
					}
					if(response.code != 0) {
						$.alert("提示","查询失败,稍后重试");
						return;
					}
					$("#order").hide();
					$("#order_prepare").hide();
					if(OrderInfo.actionFlag==1){
						if($("#order-content").length>0){
						$("#order-content").hide();
					}
					}
					if($("#zjfk_"+subnum).length>0){
						$("#zjfk_"+subnum).hide();
					}
					var content$=$("#phonenumberContent");
					content$.html(response.data).show();
					$("#subnum").val(subnum);
					$("#subPage").val(subPage);
					//$("#div_content").append(response.data);
					//$("#number_modal").modal("show");
					order.phoneNumber.boProdAn = {accessNumber : "",level : "",anId : "",anTypeCd : ""};
					_initPhonenumber(subPage,null,subnum);
				}
			});	
		}
	};
	
	var _initPhonenumber=function(subPage,scroller,subnum){
		$("#phone").hide();
//		OrderInfo.busitypeflag=1;
		$("#subPage").val(subPage);
		if(CONST.getAppDesc()==1){
			$("#psw_dt").hide();
			$("#psw_dd").hide();
		}
		selectedObj=null;
		ispurchased=0;
		selectedLevel="";
		order.phoneNumber.queryApConfig();
		order.phoneNumber.queryPhoneNbrPool();
		//queryPnLevelProdOffer();
		var param={};
		_btnQueryPhoneNumber(param,scroller,subnum);
		//1、此段代码加上后会导致在选号页面的其他弹出框（如预占密码弹出框）被覆盖，无法显示--jinjian
		//$("#ec-dialog-container-phonenumber").css("z-index","10002");
		$("#btnNumSearch1").off("click").on("click",function(){_btnQueryPhoneNumber(param,scroller,subnum);});
		//$("#cc").off("click").on("click",function(event){order.phoneNumber.btnIBydentityQuery(param);event.stopPropagation();});
	};
	
	//按钮查询
	var _btnQueryPhoneNumber=function(param,scroller,subnum){
		var idcode=$.trim($("#idCode").val());
		var url = contextPath+"/agent/mktRes/phonenumber/list_fk";
		if(idcode!=''){
			order.phoneNumber.btnIBydentityQuery();
			return;
		}
		selectedObj=null;//初始化原先选中的号码
		//收集参数
		subnum = $("#subnum").val();
		param = _buildPhoneParam(param);
		param.subnum = subnum;
		param.isReserveFlag=_queryFlag;
		if(_queryFlag=='1'){//预约选号
			param.queryFlag="3";
		}
		//隐藏选套餐模块
		if($("#pakeage").length>0){
			$("#pakeage").hide();
		}
		if(OrderInfo.returnFlag!="fk") OrderInfo.returnFlag="hm";
		$.callServiceAsHtml(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
				$("#numberModal").modal('hide');
			},
			"done" : function(response){
				$("#numberModal").modal('hide');
				if(response.data.indexOf("showVerificationcode") >=0) {
					$("#vali_code_input").val("");
					$('#validatecodeImg').css({"width":"80px","height":"32px"}).attr('src',contextPath+'/validatecode/codeimg.jpg?' + Math.floor(Math.random()*100)).fadeIn();
					easyDialog.open({
						container : 'Verificationcode_div'
					});
				}
				if(!response||response.code != 0){
					 response.data='查询失败,稍后重试';
				}
				var content$ = $("#phonenumber-list");
				if($("#subPage").val() == 'offer'||$("#subPage").val()=='terminal'){
					content$ = $("#number-list");
				}
				content$.html(response.data);
				$("#number-list_wrapper").css("top","95px");
				$("#phonenumber-list_scroller").css("transform","translate(0px, 0px) translateZ(0px)");
				if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
				
				$("#btnSwitchNbr").off("click").on("click",function(){order.phoneNumber.btnQueryPhoneNumber({});});
			},
			fail:function(response){
				$.unecOverlay();
				$("#numberModal").modal('hide');
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});	
	};
	
	//购手机 副卡选号
	var _endSelectNum=function(obj,purchas,index){
		$.ecOverlay("<strong>正在预占号码,请稍等会儿....</strong>");
		selectedObj = obj;
		ispurchased=purchas;
		if(ispurchased==1){
			order.phoneNumber.btnToOffer(selectedObj,null,index);
		}else{
			var phoneNumberVal_06 = $(selectedObj).attr("numberVal").split("_")[7]; 
			if(phoneNumberVal_06=="1"){
				$.unecOverlay();
				$("#app_password_dialog").modal("show");
			}else{
				_btnPurchase(selectedObj,null,index);
				
			}
		}
	};
	
	//购手机副卡号码预占
	var _btnPurchase=function(obj,needPsw,index){
		if(OrderInfo.returnFlag!="fk") OrderInfo.returnFlag="";
		phoneNumberVal = $(obj).attr("numberVal"); 
		var memberRoleCd=CONST.MEMBER_ROLE_CD.MAIN_CARD;
		//选号类型：新装主卡选号、新装副卡选号 Y1、Y2
		var subFlag=$("#subFlag").val();
		if(index!=-1){
			memberRoleCd=CONST.MEMBER_ROLE_CD.VICE_CARD;
		}
		//订单序号：O1、O2区分暂存单允许多个订单的情况
		var subnum=$("#subnum").val();
		subnum = index;
		//入口终端入口，号码入口，订单填写入口:terminal\offer\number
//		var subPage=$("#subPage").val(); //
		var subPage="offer";
		//号码的预存话费
		var preStoreFare=phoneNumberVal.split("_")[1];
		//保底消费
		var pnPrice=phoneNumberVal.split("_")[2];
		var areaId=$("#p_cust_areaId").val();
		if(areaId==null||areaId==""){
			areaId=OrderInfo.staff.areaId;
		}
		var areaCode=  $(obj).attr("zoneNumber");
		//var areaCode=$("#p_cust_areaId").attr("areaCode");
		if(areaCode==null || areaCode==""){
			areaCode =OrderInfo.staff.areaCode;
		} 
		if(order.service.offerprice!=''){
			var minMonthFare=parseInt(pnPrice);
			//套餐月基本费用
			var packageMonthFare=parseInt(order.service.offerprice);
			if(packageMonthFare<minMonthFare){
				$.alert("提示","对不起,此号码不能被选购.(原因:套餐月基本费用必须大于号码月保底消费)");
				return;
			}
		}
		//正在被预占的号码
		var phoneNumber=phoneNumberVal.split("_")[0];
		var anTypeCd=phoneNumberVal.split("_")[3];
		var plevel=phoneNumberVal.split("_")[5];
		if(phoneNumber){
			var phoneAreaId = $("#p_cust_areaId").val();
			var params={};
			if(needPsw){
				 params={"phoneNumber":phoneNumber,"actionType":"E","anTypeCd":anTypeCd,"areaId":phoneAreaId,"attrList":[{"attrId":"65010036","attrValue":needPsw}]};
			}else{
				 params={"phoneNumber":phoneNumber,"actionType":"E","anTypeCd":anTypeCd,"areaId":phoneAreaId};
			}
			var oldrelease=false;
			var oldPhoneNumber="";
			var oldAnTypeCd="";
			if(subPage=='terminal'||subPage=='number'){
				oldPhoneNumber=order.phoneNumber.boProdAn.accessNumber;
				oldAnTypeCd=order.phoneNumber.boProdAn.anTypeCd;
				if(oldPhoneNumber==phoneNumber){
					$.alert("提示","号码已经被预占,请选择其它号码!");
					return;
				}else{
					order.phoneNumber.boProdAn={};
				}
			}else if(subPage=='offer'){
				for(var i=0;i<OrderInfo.boProdAns.length;i++){
					if(OrderInfo.boProdAns[i].prodId==subnum){
						oldPhoneNumber=OrderInfo.boProdAns[i].accessNumber;
						oldAnTypeCd=OrderInfo.boProdAns[i].anTypeCd;
						break;
					}
				}
				for(var i=0;i<OrderInfo.boProdAns.length;i++){
					if(OrderInfo.boProdAns[i].accessNumber==phoneNumber){
						$.alert("提示","号码已经被预占,请选择其它号码!");
						return;
					}
				}
			}
			if(oldPhoneNumber&&oldPhoneNumber!=""){
				oldrelease=true;
//				for(var i=0;i<order.phoneNumber.idcode.length;i++){//身份证预占的号码不需要被释放
//					if(order.phoneNumber.idcode[i]==oldPhoneNumber){
//						oldrelease=false;
//						break;
//					}
//				}
				if(oldrelease){
					if(needPsw){
						params={"newPhoneNumber":phoneNumber,"oldPhoneNumber":oldPhoneNumber,"newAnTypeCd":anTypeCd,"oldAnTypeCd":oldAnTypeCd,"areaId":phoneAreaId,"attrList":[{"attrId":"65010036","attrValue":needPsw}]};
					}else{
						params={"newPhoneNumber":phoneNumber,"oldPhoneNumber":oldPhoneNumber,"newAnTypeCd":anTypeCd,"oldAnTypeCd":oldAnTypeCd,"areaId":phoneAreaId};
					}
				}
			}
			
			var purchaseUrl=contextPath+"/agent/mktRes/phonenumber/purchase";
			$.callServiceAsJson(purchaseUrl, params, {
				"before":function(){
					$.ecOverlay("<strong>正在预占号码,请稍等会儿....</strong>");
				},
				"done" : function(response){
					$.unecOverlay();
					if (response.code == 0) {
						if(selectedLevel==""){//selectedLevel缓存号码等级信息，以缓存的为准
							selectedLevel=response.data.phoneLevelId;
						}
						if(subPage=='number'){
							var content$=$("#order_fill_content");
							content$.html('');
							order.phoneNumber.boProdAn.accessNumber=phoneNumber;
							order.phoneNumber.boProdAn.anTypeCd=anTypeCd;
							order.phoneNumber.boProdAn.level=selectedLevel;
							order.phoneNumber.boProdAn.org_level=response.data.phoneLevelId;
							order.phoneNumber.boProdAn.anId=response.data.phoneNumId;
							order.phoneNumber.boProdAn.areaId=areaId;
							order.phoneNumber.boProdAn.areaCode = areaCode;
							order.phoneNumber.boProdAn.memberRoleCd=memberRoleCd;
							order.phoneNumber.boProdAn.preStore=preStoreFare;
							order.phoneNumber.boProdAn.minCharge=pnPrice;
							order.service.boProdAn = order.phoneNumber.boProdAn;
							OrderInfo.returnFlag=2;  // 临时处理
							OrderInfo.order.step=2;
							$("#tentrance").show();
							$("#pentrance").hide();
							$("#nentrance").hide();
							$("#pakeage").show();
							$("#pakeage").attr("class","tab-pane fade in active");
							$("#tentrance").css("width","100%");
							$("#phone").hide();
							$("#number").hide();
							//_qryOfferInfoByPhoneNumFee();
						}else if(subPage=='terminal'){
							mktRes.terminal.setNumber(phoneNumber, response.data.phoneLevelId);
							order.phoneNumber.boProdAn.accessNumber=phoneNumber;
							order.phoneNumber.boProdAn.anTypeCd=anTypeCd;
							order.phoneNumber.boProdAn.level=selectedLevel;
							order.phoneNumber.boProdAn.org_level=response.data.phoneLevelId;
							order.phoneNumber.boProdAn.anId=response.data.phoneNumId;
							order.phoneNumber.boProdAn.areaId=areaId;
							order.phoneNumber.boProdAn.areaCode = areaCode;
							order.phoneNumber.boProdAn.memberRoleCd=memberRoleCd;
							order.phoneNumber.boProdAn.preStore=preStoreFare;
							order.phoneNumber.boProdAn.minCharge=pnPrice;
							order.service.boProdAn = order.phoneNumber.boProdAn;
							$("#order").show();
							$("#phonenumberContent").hide();
						}else if(subPage=='offer'){
							//$("#nbr_btn_"+subnum).removeClass("selectBoxTwo");
							//$("#nbr_btn_"+subnum).addClass("selectBoxTwoOn");
							if(OrderInfo.actionFlag!=1 && subnum==-1){
								mktRes.terminal.setNumber(phoneNumber, response.data.phoneLevelId);
							}
							$("#nbr_btn_"+subnum).val(phoneNumber);
							if($("#fk_phoneNumber_"+subnum).length>0){
								$("#fk_phoneNumber_"+subnum).text(phoneNumber);
							}
							if(OrderInfo.actionFlag==1 && $("#zjfk_"+subnum).length>0){
								$("#zjfk_"+subnum).show();
							}
							if(OrderInfo.actionFlag==14 && $("#zjfk_"+subnum).length>0){
								$("#zjfk_"+subnum).show();
							}
							order.phoneNumber.boProdAn.accessNumber=phoneNumber;
							order.phoneNumber.boProdAn.level=selectedLevel;
							order.phoneNumber.boProdAn.org_level=response.data.phoneLevelId;
							order.phoneNumber.boProdAn.areaId=areaId;
							order.phoneNumber.boProdAn.anTypeCd=anTypeCd;
							order.phoneNumber.boProdAn.anId=response.data.phoneNumId;
							order.phoneNumber.boProdAn.preStore=preStoreFare;
							order.phoneNumber.boProdAn.minCharge=pnPrice;
							var isExists=false;
							if(OrderInfo.boProdAns.length>0){//判断是否选过
								for(var i=0;i<OrderInfo.boProdAns.length;i++){
									if(OrderInfo.boProdAns[i].prodId==subnum){
										OrderInfo.boProdAns[i].accessNumber=phoneNumber;
										OrderInfo.boProdAns[i].anTypeCd=anTypeCd;
										OrderInfo.boProdAns[i].pnLevelId=selectedLevel;
										OrderInfo.boProdAns[i].anId=response.data.phoneNumId;
										OrderInfo.boProdAns[i].areaId=areaId;
										OrderInfo.boProdAns[i].areaCode = areaCode;
										OrderInfo.boProdAns[i].memberRoleCd=memberRoleCd;
										OrderInfo.boProdAns[i].preStore=preStoreFare;
										OrderInfo.boProdAns[i].minCharge=pnPrice;
										isExists=true;
										if(OrderInfo.offerSpec.offerRoles!=undefined){
											OrderInfo.setProdAn(OrderInfo.boProdAns[i]);  //保存到产品实例列表里面
										}
										order.dealer.changeAccNbr(subnum,phoneNumber); //选号玩要刷新发展人管理里面的号码
										break;
									}
								}
							}
							if(!isExists){
								var param={
									prodId : subnum, //从填单页面头部div获取
									accessNumber : phoneNumber, //接入号
									anChooseTypeCd : "2", //接入号选择方式,自动生成或手工配号，默认传2
									anId : response.data.phoneNumId, //接入号ID
									pnLevelId:selectedLevel,
									anTypeCd : anTypeCd, //号码类型
									state : "ADD", //动作	,新装默认ADD	
									areaId:areaId,
									areaCode:areaCode,
									memberRoleCd:memberRoleCd,
									preStore:preStoreFare,
									minCharge:pnPrice
								};
								OrderInfo.boProdAns.push(param);
								if(OrderInfo.offerSpec.offerRoles!=undefined){
									OrderInfo.setProdAn(param);//保存到产品实例列表里面
								}
								order.dealer.changeAccNbr(subnum,phoneNumber);//选号玩要刷新发展人管理里面的号码
							}
							if(subnum=='-1'){
								OrderInfo.boCustInfos.telNumber=phoneNumber;
							}
//							if(order.phoneNumber.dialogForm!=undefined&&order.phoneNumber.dialog!=undefined){
//								order.phoneNumber.dialogForm.close(order.phoneNumber.dialog);
//							}
							$("#order").show();
							//$("#order_prepare").show();
							if($("#order-content").length>0){
								$("#order-content").hide();
							}
							if(OrderInfo.actionFlag==1){
								if(subnum==-1){
									$("#order-content").show();
								}
							}
							
							$("#phonenumberContent").hide();
						}
					}else if (response.code == -2) {
						$.alertM(response.data);
					}else{
						var msg="";
						if(response.data!=undefined&&response.data.msg!=undefined){
							msg=response.data.msg;
						}else{
							msg="号码["+phoneNumber+"]预占失败";
						}
						$.alert("提示","号码预占失败，可能原因:"+msg);
					}
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","请求可能发生异常，请稍后再试！");
				}
			});
		} else {
			$.alert("提示","号码格式不正确!");
		}
	};
	
	var _nextStep=function(){
		if (!buyChk.tsnFlag) {
			if($("#tsn").val().length>0){
				$.alert("提示","<br/>请先校验终端串号。");
				return;
			}
		}
		if(isSelect=="N" && OrderInfo.actionFlag==14){//带出预存话费
			AttachOffer.phone_checkOfferExcludeDepend(-1,mktRes.terminal.hytcid,mktRes.terminal.hytcmc);
			isSelect="Y";
		}
		
		if ("lj"==buyChk.buyType) {
			if (!buyChk.tsnFlag) {
				if($("#tsn").val().length>0){
					$.alert("提示","<br/>请先校验终端串号。");
					return;
				}else if($("#tsn").val().length==0){
					$.alert("提示","<br/>请填写终端串号。");
					return;
				}
			}
			if($("#passcust").length>0){
				$("#passcust").show();
			}
			_purchase();
		} else if ("hy"==buyChk.buyType) {
			//订单提交
//			_checkTerminalCode('#tsn');
			for(var n=0;n<OrderInfo.attach2Coupons.length;n++){
				OrderInfo.attach2Coupons[n].couponInstanceNumber = ($("#tsn").val()).replace(/(^\s*)|(\s*$)/g, "");
				OrderInfo.attach2Coupons[n].storeId = termInfo.mktResStoreId;
				OrderInfo.attach2Coupons[n].couponId = termInfo.mktResId;
			}
//			_submitOrder(data);
//			return;
		
			if($("#offerSpecId-1").val().length<1){
				$.alert("信息提示","请先选择套餐！");
				return false;
			} 
			if(!SoOrder.checkData()){ //校验通过
				return false;
			}
//			OrderInfo.actionFlag = 1;
			if($("#passcust").length>0){
				$("#passcust").hide();
			}
		}
//		OrderInfo.actionFlag = 1;
		//var param = {};
		//校验经办人
		if(!checkJBR()){
			return;
		}
		$("#terminalMain").hide();
		$("#cust-content").show();
		OrderInfo.order.step = 3;//第三步   进入新增客户页面
	};
	//裸机销售跳过客户定位
	var _passcust = function(){
		OrderInfo.order.step = 4;
		SoOrder.submitOrder(mktRes.terminal.Ljdata);
	}
	//提交订单节点
	var _submitOrder = function(data) {
		if(_getOrderInfo(data)){
			//订单提交
			var url = contextPath+"/order/orderSubmit";
			if(OrderInfo.order.token!=""){
				url = contextPath+"/app/order/orderSubmit?token="+OrderInfo.order.token;
			}
			if(OrderInfo.actionFlag==8 || OrderInfo.actionFlag==4){//实名制客户新建，和客户修改走一点提交接口
				url = contextPath+"/app/order/orderSubmitComplete?token="+OrderInfo.order.token;
			}
			$.callServiceAsJson(url,JSON.stringify(OrderInfo.orderData), {
				"before":function(){
					$.ecOverlay("<strong>订单提交中，请稍等...</strong>");
				},"done" : function(response){
					$.unecOverlay();
					SoOrder.getToken();
					if (response.code == 0) {
						var data = response.data;
						if(OrderInfo.actionFlag==8 || OrderInfo.actionFlag==4){
							if(data.resultCode==0){
								var msg="";
								if(OrderInfo.actionFlag==8){
									msg="客户创建成功，购物车ID：" + response.data.olId;
								}else{
									msg="客户修改成功";
								}
								$("#btn-dialog-ok").removeAttr("data-dismiss");
								$('#alert-modal').modal({backdrop: 'static', keyboard: false});
								$("#btn-dialog-ok").off("click").on("click",function(){
									common.callCloseWebview();
								});
								$("#modal-title").html("信息提示");
								$("#modal-content").html(msg);
								$("#alert-modal").modal();
							}else{
								$.alert("信息提示",data.resultMsg);
							}
						}else{
							if(data.checkRule!=undefined){
								var provCheckResult = order.calcharge.tochargeSubmit(response.data);
								if(provCheckResult.code==0){
									var returnData = SoOrder.gotosubmitOrder(response.data);
									SoOrder.orderConfirm(returnData);
								}else{//下省校验失败也将转至订单确认页面，展示错误信息，只提供返回按钮
									response.data.provCheckError = "Y";
									if(provCheckResult.data.resultMsg!=undefined && $.trim(provCheckResult.data.resultMsg)!=""){
										response.data.provCheckErrorMsg = provCheckResult.data.resultMsg;
									} else if(provCheckResult.data.errMsg!=undefined && $.trim(provCheckResult.data.errMsg)!=""){
										response.data.provCheckErrorMsg = provCheckResult.data.errMsg;
										if(provCheckResult.data.errCode){
											response.data.provCheckErrorMsg = "【错误编码："+provCheckResult.data.errCode+"】" + response.data.provCheckErrorMsg;
										}
										if(provCheckResult.data.errData){
											response.data.provCheckErrorData=provCheckResult.data.errData;
											try{
												var errData=$.parseJSON(provCheckResult.data.errData);
												if(errData.resultMsg){
													response.data.provCheckErrorMsg+=","+errData.resultMsg;
												}
											}catch(e){
												
											}
										}
										if(provCheckResult.data.paramMap){
											response.data.provCheckErrorMsg += "【入参："+provCheckResult.data.paramMap+"】";
										}
									} else{
										response.data.provCheckErrorMsg = "未返回错误信息，可能是下省请求超时，请返回填单页面并稍后重试订单提交。";
									}
									var returnData = SoOrder.gotosubmitOrder(response.data);
									SoOrder.orderConfirm(returnData);								
								}
							}else{
								var returnData = SoOrder.gotosubmitOrder(response.data);
								SoOrder.orderConfirm(returnData);
							}
						}
					}else if(response.code == 1002){
						$.alert("信息提示",response.data);
					}else{
						$.alertM(response.data);
//						_getToken();
						OrderInfo.orderData.orderList.custOrderList[0].busiOrder = [];
						OrderInfo.resetSeq(); //重置序列
					}
				}
			});
		}	
	};
	
	
	//填充订单信息
	var _getOrderInfo = function(data){
		if(OrderInfo.actionFlag==13 || OrderInfo.actionFlag==17 || OrderInfo.actionFlag==18){ //终端购买、退换货
			//如果是合约机换货，已经加载缓存
			if (OrderInfo.actionFlag==18 && data.boActionType.actionClassCd==CONST.ACTION_CLASS_CD.OFFER_ACTION) {
				
			} else {
				query.offer.loadInst(); //加载实例到缓存
			}
			couponSale(data);
			if(OrderInfo.order.soNbr!=undefined && OrderInfo.order.soNbr != ""){  //缓存流水号
				OrderInfo.orderData.orderList.orderListInfo.soNbr = OrderInfo.order.soNbr;
			}
			return true;
		}
		var busiOrders = [];  //存放订单项数组
		var custOrderAttrs = []; //获取订单属性数组
		var itemValue="N";
//		if(setOfferType()){
//			itemValue="Y";
//		}
		custOrderAttrs.push({
			itemSpecId : CONST.BUSI_ORDER_ATTR.THRETOFOUR_ITEM,//3转4标志
			value : itemValue
		});
		custOrderAttrs.push({ //业务类型
			itemSpecId : CONST.BUSI_ORDER_ATTR.BUSITYPE_FLAG,
			value : OrderInfo.actionFlag
		});
		if(!SoOrder.checkData()){ //校验通过
			return false;
		}
		//订单备注前置
		var remark = $('#order_remark').val(); 
		if(ec.util.isObj(remark)){
			custOrderAttrs.push({
				itemSpecId : CONST.BUSI_ORDER_ATTR.REMARK,
				value : remark
			});	
		}
		
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14){ //新装
			_createOrder(busiOrders); //新装
		}
		OrderInfo.orderData.orderList.orderListInfo.custOrderAttrs = custOrderAttrs; //订单属性数组
		OrderInfo.orderData.orderList.custOrderList[0].busiOrder = busiOrders; //订单项数组
		if($("#isTemplateOrder").attr("checked")=="checked"){ //批量订单
			OrderInfo.orderData.orderList.orderListInfo.isTemplateOrder ="Y";
			OrderInfo.orderData.orderList.orderListInfo.templateOrderName =$("#templateOrderName").val();
			if(OrderInfo.actionFlag==1||OrderInfo.actionFlag==14){
				OrderInfo.orderData.orderList.orderListInfo.templateType = $("#templateOrderDiv").find("select").val(); //批量换挡
			}else if(OrderInfo.actionFlag==2){
				OrderInfo.orderData.orderList.orderListInfo.templateType = 5; //批量换挡
			}else if(OrderInfo.actionFlag==3){
				OrderInfo.orderData.orderList.orderListInfo.templateType = 2; //批量可选包订购退订
			}
		}else{
			OrderInfo.orderData.orderList.orderListInfo.isTemplateOrder ="N";
		}
		if(OrderInfo.order.soNbr!=undefined && OrderInfo.order.soNbr != ""){  //缓存流水号
			OrderInfo.orderData.orderList.orderListInfo.soNbr = OrderInfo.order.soNbr;
		}
		return true;
	};
	
	//终端销售
	var couponSale = function(data){
		var coupons = data.coupons;
		OrderInfo.getOrderData(); //获取订单提交节点
		//新建客户、或是老客户、或是虚拟客户
		var busiOrders = OrderInfo.orderData.orderList.custOrderList[0].busiOrder;//获取业务对象数组
		if (OrderInfo.cust.custId == -1) {
			OrderInfo.createCust(busiOrders);
		} else if (OrderInfo.cust.custId != undefined && OrderInfo.cust.custId != "") {
			OrderInfo.orderData.orderList.orderListInfo.partyId = OrderInfo.cust.custId;
		} else {
			OrderInfo.orderData.orderList.orderListInfo.partyId = CONST.CUST_COUPON_SALE;
		}
		if (OrderInfo.actionFlag == 18) {
			OrderInfo.orderData.orderList.orderListInfo.partyId = coupons[0].partyId;
		}
		//填入订单
		var busiOrder = {
			areaId : OrderInfo.getAreaId(),  //受理地区ID		
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : data.busiObj,  
			boActionType : data.boActionType, 
			data:{
				bo2Coupons:[]
			}
		};
		busiOrder.data.bo2Coupons = coupons;
		if (data.dealers) {
			busiOrder.data.busiOrderAttrs = data.dealers;
		}
		busiOrders.push(busiOrder);
	};
	
	//创建订单数据
	var _createOrder = function(busiOrders) {
		//添加客户节点
		if(OrderInfo.cust.custId == -1){
			OrderInfo.createCust(busiOrders);	
		}
		var acctId = -1; //先写死
//		var acctId =$("#acctSelect").val();
		if(acctId < 0 && acctId!=undefined ){
			OrderInfo.createAcct(busiOrders,acctId);	//添加帐户节点
		}
		var busiOrder = _createMainOffer(busiOrders); //添加主销售品节点	
		//遍历主销售品构成,添加产品节点
		for ( var i = 0; i < busiOrder.data.ooRoles.length; i++) {
			var ooRole = busiOrder.data.ooRoles[i];
			if(ooRole.objType==2){
				busiOrders.push(_createProd(ooRole.objInstId,ooRole.objId));	
			}		
		}
		AttachOffer.setAttachBusiOrder(busiOrders);  //添加可选包跟功能产品
	};
	
	//创建主销售品节点
	var _createMainOffer = function(busiOrders) {
		var busiOrder = {
			areaId : OrderInfo.getProdAreaId(-1),  //受理地区ID
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				objId : OrderInfo.offerSpec.offerSpecId,  //业务规格ID
				instId : OrderInfo.SEQ.offerSeq--, //业务对象实例ID
				isComp : "N", //是否组合
				offerTypeCd : "1" //1主销售品
			},  
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.OFFER_ACTION,
				boActionTypeCd : CONST.BO_ACTION_TYPE.BUY_OFFER
			}, 
			data:{
				ooRoles : [],
				ooOwners : [],
				busiOrderAttrs : []
			}
		};
		var accNbr = OrderInfo.getAccessNumber(-1);
		if(ec.util.isObj(accNbr)){ //接入号
			busiOrder.busiObj.accessNumber = accNbr;
		}	
		//遍历主销售品构成
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			$.each(this.prodInsts,function(){
				var ooRoles = {
					objId : this.objId, //业务规格ID
					objInstId : this.prodInstId, //业务对象实例ID,新装默认-1
					objType : this.objType, // 业务对象类型
					memberRoleCd : this.memberRoleCd, //成员角色类型
					offerRoleId : this.offerRoleId, //销售品角色ID
					state : "ADD" //动作
				};
				busiOrder.data.ooRoles.push(ooRoles);  //接入类产品
				var prodId = this.prodInstId;
				if(this.servInsts!=undefined && this.servInsts.length>0){ //功能类产品
					$.each(this.servInsts,function(){
						var ooRoles = {
							objId : this.objId, //业务规格ID
							objInstId : OrderInfo.SEQ.servSeq--, //业务对象实例ID,新装默认-1
							objType : this.objType, // 业务对象类型
							prodId : prodId,
							//memberRoleCd : this.memberRoleCd, //成员角色类型
							offerRoleId : this.offerRoleId, //销售品角色ID
							state : "ADD" //动作
						};
						busiOrder.data.ooRoles.push(ooRoles); //功能类产品
					});
				}
			});
		}); 
		
		//销售参数节点
		var offerSpecParams = OrderInfo.offerSpec.offerSpecParams;
		if(offerSpecParams!=undefined && offerSpecParams.length>0){  
			busiOrder.data.ooParams = [];
			for (var i = 0; i < offerSpecParams.length; i++) {
				var param = offerSpecParams[i];
				var ooParam = {
	                itemSpecId : param.itemSpecId,
	                offerParamId : OrderInfo.SEQ.paramSeq--,
	                offerSpecParamId : param.offerSpecParamId,
	                value : param.value,
	                state : "ADD"
	            };
	            busiOrder.data.ooParams.push(ooParam);
			}				
		}
		
		//销售生失效时间节点
		if(OrderInfo.offerSpec.ooTimes !=undefined ){  
			busiOrder.data.ooTimes = [];
			busiOrder.data.ooTimes.push(OrderInfo.offerSpec.ooTimes);
		}
		
		//所属人节点
		var ooOwners = {
			partyId : OrderInfo.cust.custId, //客户对象ID
			state : "ADD" //动作
		};
		busiOrder.data.ooOwners.push(ooOwners);
		
		//发展人
		var $tr = $("li[name='tr_"+OrderInfo.offerSpec.offerSpecId+"']");
		if($tr!=undefined){
			$tr.each(function(){   //遍历产品有几个发展人
				var dealer = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
					role : $(this).find("select").val(),
					value : $(this).find("input").attr("staffid") 
				};
				busiOrder.data.busiOrderAttrs.push(dealer);				
				var dealer_name = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER_NAME,
					role : $(this).find("select").val(),
					value : $(this).find("input").attr("value") 
				};
				busiOrder.data.busiOrderAttrs.push(dealer_name);
			});
		}
		
		busiOrders.push(busiOrder);
		return busiOrder;
	};
	
	//创建产品节点
	var _createProd = function(prodId,prodSpecId) {	
		var busiOrder = {
			areaId : OrderInfo.getProdAreaId(prodId),  //受理地区ID
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq-- 
			}, 
			busiObj : { //业务对象节点
				objId : prodSpecId,  //业务对象ID
				instId : prodId, //业务对象实例ID
				isComp : "N"  //是否组合
				//accessNumber : "" //接入号码
			},  
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION,
				boActionTypeCd : "1"
			}, 
			data:{
				boProdFeeTypes : [], //付费方式节点
				boProdSpecs : [{
					prodSpecId : prodSpecId,
					state : 'ADD'
				}], //产品规格节点
				boCusts : [],  //客户信息节点		
				boProdItems : [], //产品属性节点
				boProdPasswords : [], //产品密码节点
				boProdAns : [], //号码信息节点
				//boProd2Tds : [], //UIM卡节点信息
				bo2Coupons : [],  //物品信息节点
				boAccountRelas : [], //帐户关联关系节
				boProdStatuses : [], //产品状态节点
				busiOrderAttrs : [] //订单属性节点
			}
		};
		
		var prodStatus = CONST.PROD_STATUS_CD.NORMAL_PROD;
		//封装产品状态节点
		busiOrder.data.boProdStatuses.push({
			state : "ADD",
			prodStatusCd : prodStatus
		});	
			
		//封装号码信息节点
		var boProdAns = OrderInfo.boProdAns;
		for ( var i = 0; i < boProdAns.length; i++) {
			if(boProdAns[i].prodId==prodId){
				busiOrder.data.boProdAns.push(boProdAns[i]);
				busiOrder.busiObj.accessNumber = boProdAns[i].accessNumber;
				break;
			}
		}
		
		//封装UIM卡信息节点
		var boProd2Tds = OrderInfo.boProd2Tds;
		for ( var i = 0; i < boProd2Tds.length; i++) {
			if(boProd2Tds[i].prodId==prodId){
				busiOrder.data.bo2Coupons.push(boProd2Tds[i]);
				break;
			}
		}
		
		//封装客户与产品之间的关系信息
		busiOrder.data.boCusts.push({
			partyId	: OrderInfo.cust.custId, //客户ID
			partyProductRelaRoleCd : "0", //客户与产品之间的关系（担保关系）
			state : "ADD" //动作
		});
		
		//封装产品密码
		var pwd=$("#pwd_"+prodId).val();
		if(pwd=="******"|| pwd == undefined || OrderInfo.actionFlag==1){
			pwd = order.main.genRandPass6();
		}
		var boProdPassword = {
			prodPwTypeCd : 2, //密码类型
			pwd : pwd, //密码
			state : "ADD"  //动作
		};
		busiOrder.data.boProdPasswords.push(boProdPassword);
		
		//封装产品属性
		$("[name=prodSpec_"+prodId+"]").each(function(){
			var itemSpecId=$(this).attr("id").split("_")[0];
			var val=$.trim($(this).val());
			if(val!=""&&val!=undefined){
				var prodSpecItem = {
					itemSpecId : itemSpecId,  //属性规格ID
					prodSpecItemId : OrderInfo.SEQ.itemSeq--, //产品属性实例ID
					state : "ADD", //动作
					value : val//属性值	
				};
				busiOrder.data.boProdItems.push(prodSpecItem);
			}
		});
		
		//封装付费方式
		busiOrder.data.boProdFeeTypes.push({
				feeType : 1200,
				state : "ADD"
			});
		//var paytype=$('select[name="pay_type_'+prodId+'"]').val(); 
//		var paytype=$('select[name="pay_type_-1"]').val();  //先写死
//		if(paytype!= undefined){
//			busiOrder.data.boProdFeeTypes.push({
//				feeType : paytype,
//				state : "ADD"
//			});
//		}
		//发展人
//		var $tr;
//		if(OrderInfo.actionFlag==6){ //加装发展人根据产品
//			$tr = $("li[name='tr_"+prodId+"']");
//		}else{
//			$tr = $("li[name='tr_"+OrderInfo.offerSpec.offerSpecId+"']");
//		}
//		if($tr!=undefined){
//			$tr.each(function(){   //遍历产品有几个发展人
//				var dealer = {
//					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
//					role : $(this).find("select").val(),
//					value : $(this).find("input").attr("staffid") 
//				};
//				busiOrder.data.busiOrderAttrs.push(dealer);
//			});
//		}
		
		var acctId= -1;
		var acctCd=-1;
		if(OrderInfo.actionFlag==6){ 
			acctId = OrderInfo.acctId;
			acctCd = OrderInfo.acctCd;
		}
		var boAccountRela = {
			acctId : acctId,
			acctCd : acctCd,
			acctRelaTypeCd : "1", //帐户和产品关联原因
			chargeItemCd : "0", //帐户主要费用类型
			percent : "100", //付费比例
			priority : "1",  //付费优先级
			state : "ADD" //动作
		};
		
		busiOrder.data.boAccountRelas.push(boAccountRela);	
		return busiOrder;
	};
	//可选包、功能产品
	var _show=function(prodId){
		$('#terminalMain').hide();
    	if(prodId != -1){
    		$("#zjfk_"+prodId).hide();
    	}
		$('#attach_phone_'+prodId).show();
	};
	//可选包、功能产品页面返回
	var _btnBack=function(prodId){
    	$('#terminalMain').show();
    	if(prodId != -1){
    		$('#terminalMain').hide();
    		$("#zjfk_"+prodId).show();
    	}
		$('#attach_phone_'+prodId).hide();
	};
	
	//增加副卡
	var _zjfk=function(){
		OrderInfo.returnFlag="fk";
		if(cardIndex + maxCard +2 ==0){
			$.alert("信息提示","副卡不可超过"+maxCard+"张!");
			return;
		}
		$("#nbr_btn_"+cardIndex).val("");
		$("#uim_txt_"+cardIndex).val("");
		$("#uim_txt_"+cardIndex).attr("disabled",false);
		$("#tip_"+cardIndex).text("");
		$("#uim_check_btn_"+cardIndex).attr("disabled",false);
			
		$("#zjfk_"+cardIndex).show();
		$("#terminalMain").hide();
		//添加一个角色
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			var offerRole = this;
			if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){//往副卡里面加
//			offerRole.prodInsts = []; //角色对象实例
			$.each(this.roleObjs,function(){
				if(this.objType== CONST.OBJ_TYPE.PROD){  //接入类产品
					var num = 0-cardIndex-1;  //接入类产品数量
//					for ( var i = 0; i < num; i++) {
						var newObject = jQuery.extend(true, {}, this); 
						newObject.prodInstId = cardIndex;
						if(num>1){ //同一个规格产品选择多个
							newObject.offerRoleName = offerRole.offerRoleName+(num-1);
						}else{
							newObject.offerRoleName = offerRole.offerRoleName;
						}
						newObject.memberRoleCd = offerRole.memberRoleCd;
						offerRole.prodInsts.push(newObject);   
//					}
					offerRole.selQty = num;
				}
			});
			}
		});
		
		//动态添加产品属性、附属销售品等
		$.each(OrderInfo.offerSpec.offerRoles,function(){ //遍历主套餐规格
			var offerRole = this;
			if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){//往副卡里面加
				var i = 0-cardIndex-2;  //接入类产品数量
				var prodInst = this.prodInsts[i];
				var param = {   
					offerSpecId : OrderInfo.offerSpec.offerSpecId,
					prodSpecId : prodInst.objId,
					offerRoleId: prodInst.offerRoleId,
					prodId : prodInst.prodInstId,
					queryType : "1,2",
					objType: prodInst.objType,
					objId: prodInst.objId,
					memberRoleCd : prodInst.memberRoleCd
				};
				_queryAttachOfferSpec(param);  //加载附属销售品
				var obj = {
					div_id : "item_order_"+prodInst.prodInstId,
					prodId : prodInst.prodInstId,
					offerSpecId : OrderInfo.offerSpec.offerSpecId,
					compProdSpecId : "",
					prodSpecId : prodInst.objId,
					roleCd : offerRole.roleCd,
					offerRoleId : offerRole.offerRoleId,
					partyId : OrderInfo.cust.custId
				};
				order.main.spec_parm(obj); //加载产品属性
		}
		});
	}
	
	//浏览副卡
	var _viewZjfk=function(n){
		$("#terminalMain").hide();
		$("#zjfk_"+n).show();
		OrderInfo.returnFlag="fk";
	}
	//关闭浏览副卡
	var _closeviewZjfk=function(n){
		phoneNumber = $("#nbr_btn_"+n).val().trim();
		if(phoneNumber==undefined || phoneNumber == ""){
			$.alert("信息提示","号码不能为空！");
			return false;
		}
		uim = $("#uim_txt_"+n).val().trim();
		if(uim==undefined || uim == ""){
			$.alert("信息提示","UIM卡不能为空！");
			return false;
		} 
		if($("#tip_"+n).text() != "校验通过"){
			$.alert("信息提示","请先校验UIM卡!");
			return false;
		}
		$("#terminalMain").show();
		$("#zjfk_"+n).hide();
		OrderInfo.returnFlag="";
	}
	//关闭增加副卡
	var _closeZjfk=function(){
		phoneNumber = $("#nbr_btn_"+cardIndex).val().trim();
		if(phoneNumber==undefined || phoneNumber == ""){
			$.alert("信息提示","号码不能为空！");
			return false;
		}
		uim = $("#uim_txt_"+cardIndex).val().trim();
		if(uim==undefined || uim == ""){
			$.alert("信息提示","UIM卡不能为空！");
			return false;
		} 
		if($("#tip_"+cardIndex).text() != "校验通过"){
			$.alert("信息提示","请先校验UIM卡!");
			return false;
		} 
		$("#order-content").show();
		$("#order-memeber").hide();
		var $ul = $('#ul_memeber');
		var html='';
		var offerSpecName= $("#choosedOfferPlan").text(); 
//		var prodId = cardIndex;
	    html='<a class="list-group-item" id="li_'+cardIndex+'" onClick="javascript:mktRes.terminal.viewZjfk('+cardIndex+')">';
		html+='<h4 class="list-group-item-heading"><span id="fk_phoneNumber_'+cardIndex+'">'+ phoneNumber +'</span><span class="glyphicon glyphicon-remove pull-right" id="span_'+cardIndex+'" onClick="javascript:mktRes.terminal.deleteZjfk()" style="display:none;" aria-hidden="true"></span></h4>';
		html+='<p class="list-group-item-text">'+ offerSpecName +'</p>';
		html+='</a>';
		$ul.append(html);
//		if(cardIndex!=-2){
//			var sp = cardIndex + 1;
//			$("#span_"+sp).hide();
//		}
		$("#terminalMain").show();
		$("#zjfk_"+cardIndex).hide();
		$("#nav_1_"+cardIndex).hide();
		$("#nav_2_"+cardIndex).show();
		var cur_num = -1-cardIndex;
		$("#cur_num").text(cur_num);
		cardIndex = cardIndex-1;
		OrderInfo.returnFlag="";
	}
	
	//删除副卡
	var _deleteZjfk=function(){
		
		var prodId = cardIndex + 1;
		var boProdAns = OrderInfo.boProdAns;
		var boProd2Tds = OrderInfo.boProd2Tds;
		//取消订单时，释放被预占的UIM卡
		if(boProd2Tds.length>0){
			for(var n=0;n<boProd2Tds.length;n++){
				if(boProd2Tds[n].prodId==prodId){
					var param = {
						numType : 2,
						numValue : boProd2Tds[n].terminalCode
					};
					$.callServiceAsJson(contextPath+"/agent/mktRes/phonenumber/releaseErrorNum", param, {
						"done" : function(){}
					});
					OrderInfo.boProd2Tds.splice(n,1);//清楚JS中某个UIM预占缓存
				}
			}
		}
		//释放预占的号码
		if(boProdAns.length>0){
			for(var n=0;n<boProdAns.length;n++){
				if(boProdAns[n].prodId==prodId){
					var param = {
						numType : 1,
						numValue : boProdAns[n].accessNumber
					};
					$.callServiceAsJson(contextPath+"/agent/mktRes/phonenumber/releaseErrorNum", param, {
						"done" : function(){}
					});
					OrderInfo.boProdAns.splice(n,1);//清楚JS中某个号码预占缓存
				}
			}
		}
		
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			var offerRole = this;
			if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){
//			offerRole.prodInsts = []; //角色对象实例
			for(var n=0;n<offerRole.prodInsts.length;n++){
				if(n==(0-cardIndex-3)){
					offerRole.prodInsts.splice(n);
				}
			}
			}
		});
		
		for(var n=0;n<AttachOffer.openAppList.length;n++){
			if(AttachOffer.openAppList[n].prodId==prodId){
				AttachOffer.openAppList.splice(n,1);
			}
		}
		for(var n=0;n<AttachOffer.openServList.length;n++){
			if(AttachOffer.openServList[n].prodId==prodId){
				AttachOffer.openServList.splice(n,1);
			}
		}
		for(var n=0;n<AttachOffer.openedServList.length;n++){
			if(AttachOffer.openedServList[n].prodId==prodId){
				AttachOffer.openedServList.splice(n,1);
			}
		}
		for(var n=0;n<AttachOffer.openList.length;n++){
			if(AttachOffer.openList[n].prodId==prodId){
				AttachOffer.openList.splice(n,1);
			}
		}
		for(var n=0;n<AttachOffer.openedList.length;n++){
			if(AttachOffer.openedList[n].prodId==prodId){
				AttachOffer.openedList.splice(n,1);
			}
		}
		if(prodId!=-2){
			var sp = prodId + 1;
//			$("#span_"+sp).show();
		}
		$('#li_'+prodId).remove();
		var cur_num = -3-cardIndex;
		$("#cur_num").text(cur_num);
		cardIndex = cardIndex + 1;
	}
	
	//取消副卡
	var _qxZjfk=function(){
		
		var prodId = cardIndex;
		var boProdAns = OrderInfo.boProdAns;
		var boProd2Tds = OrderInfo.boProd2Tds;
		//取消订单时，释放被预占的UIM卡
		if(boProd2Tds.length>0){
			for(var n=0;n<boProd2Tds.length;n++){
				if(boProd2Tds[n].prodId==prodId){
					var param = {
						numType : 2,
						numValue : boProd2Tds[n].terminalCode
					};
					$.callServiceAsJson(contextPath+"/agent/mktRes/phonenumber/releaseErrorNum", param, {
						"done" : function(){}
					});
					OrderInfo.boProd2Tds.splice(n,1);//清楚JS中某个UIM预占缓存
				}
			}
		}
		//释放预占的号码
		if(boProdAns.length>0){
			for(var n=0;n<boProdAns.length;n++){
				if(boProdAns[n].prodId==prodId){
					var param = {
						numType : 1,
						numValue : boProdAns[n].accessNumber
					};
					$.callServiceAsJson(contextPath+"/agent/mktRes/phonenumber/releaseErrorNum", param, {
						"done" : function(){}
					});
					OrderInfo.boProdAns.splice(n,1);//清楚JS中某个号码预占缓存
				}
			}
		}
		
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			var offerRole = this;
			if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){
//			offerRole.prodInsts = []; //角色对象实例
			for(var n=0;n<offerRole.prodInsts.length;n++){
				if(n==(0-cardIndex-2)){
					offerRole.prodInsts.splice(n);
				}
			}
			}
		});
		
		$("#terminalMain").show();
		$("#zjfk_"+cardIndex).hide();
		OrderInfo.returnFlag="";
	}
	
	//显示经办人
	var _showJBR=function(){
		OrderInfo.jbrPageFlag = "Y";
		$("#order-content").hide();//办号卡
		$("#terminalMain").hide();//购手机
		$("#jbr").show();//显示经办人
	}
	//关闭经办人
	var _closeJBR=function(){
		OrderInfo.jbrPageFlag = "N";
		var orderIdentidiesTypeCd = $("#orderIdentidiesTypeCd  option:selected").val(); //证件类型
		var orderAttrIdCard = $.trim($("#orderAttrIdCard").val());; //证件号码
		if("1"==orderIdentidiesTypeCd){
			orderAttrIdCard =$.trim($("#sfzorderAttrIdCard").val()); //身份证号码
		}
		if(OrderInfo.preBefore.idPicFlag=="ON"){
			if(ec.util.isObj($.trim($("#sfzorderAttrIdCard").val())) || ec.util.isObj($.trim($("#orderAttrIdCard").val()))){
			if(OrderInfo.jbr.identityCd != orderIdentidiesTypeCd || OrderInfo.jbr.identityNum != orderAttrIdCard){
				OrderInfo.virOlId = "";
				$.alert("提示","证件信息更改，请重新查询经办人信息！");
				return;
			}
			}
		}
		
		
		$("#order-content").show();
		$("#terminalMain").show();
		$("#jbr").hide();
	}
	
	var checkJBR=function(){
		if(ec.util.isObj($.trim($("#orderAttrName").val()))||ec.util.isObj($.trim($("#orderAttrIdCard").val()))||ec.util.isObj($.trim($("#sfzorderAttrIdCard").val()))||ec.util.isObj($.trim($("#orderAttrPhoneNbr").val()))){
				if(!ec.util.isObj($.trim($("#orderIdentidiesTypeCd").val()))){
					$.alert("提示","请选择证件类型！");
					return false;
				}
				if(!ec.util.isObj($.trim($("#orderAttrName").val()))){
					$.alert("提示","经办人姓名为空，经办人姓名、经办人号码、证件号码必须同时为空或不为空，因此无法提交！");
					return false;
				}
				if(!ec.util.isObj($.trim($("#orderAttrPhoneNbr").val()))){
					$.alert("提示","经办人号码为空，经办人姓名、经办人号码、证件号码必须同时为空或不为空，因此无法提交！");
					return false;
				}
				if($.trim($("#orderIdentidiesTypeCd").val())==1){
					if(!ec.util.isObj($.trim($("#sfzorderAttrIdCard").val()))){
						$.alert("提示","证件号码为空，经办人姓名、经办人号码、证件号码必须同时为空或不为空，因此无法提交！");
						return false;
					}
				}
				if($.trim($("#orderIdentidiesTypeCd").val())!=1){
					if(!ec.util.isObj($.trim($("#orderAttrIdCard").val()))){
						$.alert("提示","证件号码为空，经办人姓名、经办人号码、证件号码必须同时为空或不为空，因此无法提交！");
						return false;
					}
				}
			}
		return true;
	}
	
	//显示发展人
	var _showFZR=function(){
		$("#order-content").hide();//办号卡
		$("#terminalMain").hide();//购手机
		$("#order-dealer").show();//显示经办人
		order.dealer.initDealer();
	}
	//关闭发展人
	var _closeFZR=function(){
		$("#order-content").show();
		$("#terminalMain").show();
		$("#order-dealer").hide();
	}
	
	//页面初始化数据
	var _agent_initPhone_mainPush=function(){
		var curPage = 1;
		OrderInfo.order.step=1;
		OrderInfo.busitypeflag=1;
		mktRes.terminal.queryApConfig();
		$("#phoneModal").modal("hide");
		//请求地址
		var url = contextPath+"/agent/mktRes/terminalQueryList";
		//收集参数
		var param = _buildInParam(1);
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
				$("#phone-list").html(response.data);
				$.refresh($("#phone-list"));
			}
		});
	};
	/**
	 * 按钮查询
	 */
	var _btnQueryTerminal_MainPush=function(curPage,scroller){

		$("#phoneModal").modal("hide");
		//隐藏选套餐模块
		if($("#phonelist").length>0){
			$("#phonelist").hide();
		}
		if($("#pakeage").length>0){
			$("#pakeage").hide();
		}
		//请求地址
		var url = contextPath+"/agent/mktRes/terminalQueryList";
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
				$.unecOverlay();
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
	//
	var index = 1;
	/**
	 * 主推终端 推荐功能
	 */
	var _mainPush=function(obj){
		if($("#mainPushList_Div").find("tr").length == 0){
			index = 1;
		}
		if(index >= 5){
			index = 1;
		}
		//默认不存在重复
		var repeatFlag = true;
		var numRepeatFlag = true;
		var mktName  = $(obj).attr("mktName");
		var mktPrice = $(obj).attr("mktPrice");
		mktPrice  = mktPrice / 100;
		var mktResId = $(obj).attr("mktResId");
		//
		$("#mainPushList_Div").find("tr").each(function(){
			var indexNum = $(this).find('td').eq(2).html();
			var mktResIdNum = $(this).find('td').eq(4).html();
			//
			if(indexNum == index){
				numRepeatFlag = false;
				index = index + 1;
			}
			//不允许重复添加 
			if(mktResIdNum == mktResId){
				repeatFlag = false;
			}

		});
		//
		if(repeatFlag && numRepeatFlag){
			var row = $("<tr></tr>");
	        var td_1 = $("<td>"+mktName+"</td>");
	        var td_2 = $("<td class='text-warning'>"+mktPrice+"</td>");
	        var td_3 = $("<td>"+index+"</td>");
	        var td_4 = $("<td onClick='mktRes.terminal.delMainPush(this)'><span class='glyphicon glyphicon-remove pull-right' aria-hidden='true'></span></td>");
	        var td_5 = $("<td style='display:none'>"+mktResId+"</td>");
	        //不允许添加超过4个
	        if(index <= 4){
		        row.append(td_1);
		        row.append(td_2);
		        row.append(td_3);
		        row.append(td_4);
		        row.append(td_5);
				$("#mainPushList_Div").append(row);
	        }
	        index = index + 1;
	        $("#push_terminl_submit").prop('disabled',false).removeClass("ui-disabled");
		}
	};
	/**
	 * 主推终端 删除已推荐
	 */
	var _delMainPush=function(obj){
		$(obj).parent().remove();
		var indexNumDel = $(obj).parent().children('td').eq(2).html();
		index = indexNumDel;
		if($("#mainPushList_Div").find("tr").length == 0){
			$("#push_terminl_submit").prop('disabled',true).addClass("ui-disabled");
		}
	};
	
	/**
	 * 主推终端 (已推荐)提交
	 */
	var _mainPushSubmit=function(){
		/*if($('mainPushList_Div tr').length == 4){
			
		}else{
			
		}*/
		//请求地址
		var url = contextPath+"/agent/mktRes/termSort";
		//收集参数
		var param = _buildInParamSort();
		$.ecOverlay("<strong>正在推送终端,请稍后....</strong>");
		var response = $.callServiceAsJson(url,param);
		$.unecOverlay();
		if (response.code==0) {
			$("#mainPushList_Div").html('');
			$.alert("提示",response.data);
		}else{
			if(typeof response == undefined){
				$.alert("提示","推送终端请求调用失败，可能原因服务停止或者数据解析异常");
			}else if(response.code ==  1){
				$.alert("提示",response.data);
			}else{
				$.alert("提示",response.data);
			}
			
		}
	};
	
	var _buildInParamSort = function(){
		var mktResList = [];
		$("#mainPushList_Div").find("tr").each(function(){
			var numSort  = $(this).find('td').eq(2).html();
			var mktResId = $(this).find('td').eq(4).html();
			var attr = {
					"mktResId":mktResId,
					"sortId":numSort
			};
			mktResList.push(attr);
		});
		
		return {
			"mktResList":mktResList
		};
	};
	//购手机选套餐
	var _offePre=function(subPage){
//		SoOrder.initFillPage();
		var param={"ifQS":"Y"};
		var url=contextPath+"/agent/order/offer/prepare_phone";
		$.callServiceAsHtmlGet(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					 response.data='<div style="margin:2px 0 2px 0;width:100%,height:100%;text-align:center;"><strong>页面显示失败,稍后重试</strong></div>';
				}
				if(response.code != 0) {
					$.alert("提示","页面显示失败,稍后重试");
					return;
				}
				OrderInfo.returnFlag = "tc";
				$("#terminalMain").hide();
				var content$=$("#offer-prepare");
				content$.html(response.data).show();
			}
		});	
	};
	
	//套餐入口-初始化
	var _init=function(){
		//获取初始化查询的条件
		order.service.queryApConfig();
		//初始化主套餐查询
		_searchPack("");
	};
	
	//主套餐查询
	var _searchPack = function(flag,scroller,subPage){
		var custId = OrderInfo.cust.custId;
		var qryStr=$("#qryStr").val();
		lxStr = $("#offer_tab").val();
		var categoryNodeId = "";//套餐目录
		if(lxStr == "乐享") {
//			qryStr = "";
//			$("#qryStr").val("");
			categoryNodeId = "90132141";
		}else if(lxStr == "积木") {
//			qryStr = "";
//			$("#qryStr").val("");
			categoryNodeId = "90132143";
		}else if(lxStr == "飞") {
//			qryStr = "";
//			$("#qryStr").val("");
			categoryNodeId = "90139849";
		}else if(lxStr == "其他") {
//			qryStr = "";
//			$("#qryStr").val("");
			categoryNodeId = "-9999";
		}else if(lxStr == "我的收藏") {
//			$("#qryStr").val("");
		}
		var params={"subPage":"","qryStr":qryStr,"pnLevelId":"","custId":custId,"PageSize":10};
		if(categoryNodeId.length>0){
			params.categoryNodeId = categoryNodeId;
		}
		if(flag){
			order.service.tabChange_flag = 1;
			$("#offer_tab option[value='"+lxStr+"']").attr("selected",true);
			var priceMinVal = $("#select_price_min").val();
			var priceMaxVal = $("#select_price_max").val();
			if(ec.util.isObj(priceMinVal) && $.isNumeric(priceMinVal)){
				params.priceMin = priceMinVal;
			}
			if(ec.util.isObj(priceMaxVal) && $.isNumeric(priceMaxVal)){
				params.priceMax = priceMaxVal;
			}
			
			var influxMinVal = $("#select_influx_min").val();
			var influxMaxVal = $("#select_influx_max").val();
			if(ec.util.isObj(influxMinVal) && $.isNumeric(influxMinVal)){
				params.INFLUXMin = influxMinVal*1024 ;
			}
			if(ec.util.isObj(influxMaxVal) && $.isNumeric(influxMaxVal)){
				params.INFLUXMax = influxMaxVal*1024 ;
			}
			
			var invoiceMinVal = $("#select_invoice_min").val();
			var invoiceMaxVal = $("#select_invoice_max").val();
			if(ec.util.isObj(invoiceMinVal) && $.isNumeric(invoiceMinVal)){
				params.INVOICEMin = invoiceMinVal;
			}
			if(ec.util.isObj(invoiceMaxVal) && $.isNumeric(invoiceMaxVal)){
				params.INVOICEMax = invoiceMaxVal;
			}
			order.service.tabChange_flag = 0;
		}
		_queryData(params,flag,scroller);
		
	};
	var _queryData = function(params,flag,scroller) {
		if(CONST.getAppDesc()==0){
			params.prodOfferFlag = "4G";
		}
		params.prodId = flag;
		if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 14){
			if(params.qryStr == "我的收藏" || lxStr == "我的收藏"){
				params.ifQueryFavorite = "Y";
//				params.qryStr = "";
			}
		}
		var url = contextPath+"/agent/order/phone_offerSpecList";
		$("#pakeage").show();
		$("#pakeage").attr("class","tab-pane fade in active");
		$.callServiceAsHtmlGet(url,params, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
				$("#search-modal").modal('hide');
			},
			"done" : function(response){
				$("#search-modal").modal('hide');
				if(response.code != 0) {
					$.alert("提示","<br/>查询失败,稍后重试");
					return;
				}
				
				var content$ = $("#offer-list");
				content$.html(response.data);
				$("#offer-list").show();
				if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
//				$.refresh(content$);
			},
			fail:function(response){
				$.unecOverlay();
				$("#search-modal").modal('hide');
				$.alert("提示","套餐加载失败，请稍后再试！");
			}
		});
	};
	
	return {
		hytcmc				:hytcmc,
		hytcid				:hytcid,
		initDealer			:_initDealer,
		selectTc			:_selectTc,
		init				:_init,
		passcust            :_passcust,
		closeFZR            :_closeFZR,
		showFZR             :_showFZR,
		closeJBR            :_closeJBR,
		showJBR             :_showJBR,
		Ljdata             	:_Ljdata,
		show             	:_show,
		btnBack             :_btnBack,
		zjfk				:_zjfk,
		selectNum			:_selectNum,
		viewZjfk            :_viewZjfk,
		closeviewZjfk       :_closeviewZjfk,
		qxZjfk            	:_qxZjfk,
		closeZjfk			:_closeZjfk,
		deleteZjfk			:_deleteZjfk,
		endSelectNum		:_endSelectNum,
		reSelectHy			:_reSelectHy,
		nextStep			:_nextStep,
		agent_initPhone		:_agent_initPhone,
agent_initPhone_mainPush		:_agent_initPhone_mainPush,
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
		newCClick			:_newCClick,
		oldCClick			:_oldCClick,
		selectHy			:_selectHy,
		changeHyContent     :_changeHyContent,
		changePeriod        :_changePeriod,
		termSaleScroll      :_termSaleScroll,
		back     :_back,
		btnQueryTerminalSale:_btnQueryTerminalSale,
		showNbr             :_showNbr,
		btnQueryTerminal_MainPush             :_btnQueryTerminal_MainPush,
		terminalMainPushScroll             :_terminalMainPushScroll,
		mainPush             :_mainPush,
		delMainPush             :_delMainPush,
		mainPushSubmit             :_mainPushSubmit,
		buildInParamSort             :_buildInParamSort
	};
})(jQuery);
$(function() {
	OrderInfo.order.step=1;
});