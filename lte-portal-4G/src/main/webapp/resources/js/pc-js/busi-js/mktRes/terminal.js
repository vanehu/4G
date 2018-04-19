/**
 * 终端入口
 * 
 * @author dujb3
 */
CommonUtils.regNamespace("mktRes", "terminal");
/**
 * 终端入口
 */
mktRes.terminal = (function($){
	var _offerSpecId = ""; //保存合约附属ID，合约套餐使用
	var pageSize = 12;
	var termInfo = {};
	/**
	 * 校验是否可以进入下一步
	 */
	var buyChk = {
			buyType : "lj",
			numFlag : false,
			numLevel : "0",
			hyFlag : false,
			hyType: "cfsj",
			hyOfferSpecId: 0,
			hyOfferSpecName: "",
			hyOfferSpecQty: 0,
			hyOfferSpecFt: 0,
			hyOfferRoles:null,
			tsnFlag : false
	};
	_initBuyChk = function() {
		buyChk = {
				buyType : "lj",
				numFlag : false,
				numLevel : "0",
				hyFlag : false,
				hyType: "cfsj",
				hyOfferSpecId: 0,
				hyOfferSpecName: "",
				hyOfferSpecQty: 0,
				hyOfferSpecFt: 0,
				hyOfferRoles:null,
				tsnFlag : false
		};
	};
	/**
	 * 检验buyChk的状态，从而改变订购按钮的样式
	 */
	var _chkState=function(){
		if ("lj"==buyChk.buyType) {
			OrderInfo.actionFlag = 13;
			$("#treaty").hide();
			$("#sel_number").hide();
			$("#lj").addClass("selectBoxTwoOn").removeClass("selectBoxTwo");
			$("#hy").addClass("selectBoxTwo").removeClass("selectBoxTwoOn");
			
			if(buyChk.tsnFlag) {
				$("#purchaseTermA").removeClass("btna_g").addClass("btna_o");
			}
			$("#dealerMktDiv").show();
		} else if ("hy"==buyChk.buyType){
			OrderInfo.actionFlag = 14;
			$("#treaty").show();
			$("#sel_number").show();
			$("#lj").addClass("selectBoxTwo").removeClass("selectBoxTwoOn");
			$("#hy").addClass("selectBoxTwoOn").removeClass("selectBoxTwo");
			
			if(buyChk.numFlag && buyChk.hyFlag && buyChk.tsnFlag) {
				$("#purchaseTermA").removeClass("btna_g").addClass("btna_o");
			} else {
				$("#purchaseTermA").removeClass("btna_o").addClass("btna_g");
			}
			if (buyChk.hyFlag) {
				if (buyChk.hyType == 'cfsj') {
					$("#cfsjA").addClass("selectBoxTwoOn").removeClass("selectBoxTwo");			
				} else {
					$("#gjsfA").addClass("selectBoxTwoOn").removeClass("selectBoxTwo");
				}
			} else {
				$("#cfsjA,#gjsfA").addClass("selectBoxTwo").removeClass("selectBoxTwoOn");
				$("#choosedOfferPlan").html("");
			}
			if (buyChk.numFlag) {
				$("#cNumA").addClass("selectBoxTwoOn").removeClass("selectBoxTwo");
			} else {
				$("#cNumA").addClass("selectBoxTwo").removeClass("selectBoxTwoOn");
				$("#choosedNumSpan").html("");
			}
			$("#dealerMktDiv").hide();
		}
	};
	var _setNumber=function(num, numLevel){
		$("#choosedNumSpan").html(num);
		buyChk.numFlag = true;
		buyChk.numLevel = numLevel;
		_chkState();
	};
	var _init =function(){
		
	};
	
	/**
	 * 按钮查询
	 */
	var _btnQueryTerminal=function(curPage){
		//请求地址
		var url = contextPath+"/mktRes/terminal/list";
		//收集参数
		var param = _buildInParam(curPage);
		$.callServiceAsHtml(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","<br/>查询失败,稍后重试");
					return;
				}
				var termList$=$("#order_term_list");
				termList$.show();
				termList$.html(response.data).fadeIn();
			}
		});	
	};
	/**
	 * 链接查询
	 */
	var _linkQueryTerminal = function(loc,selected){
		_exchangeSelected(loc,selected);
		_btnQueryTerminal(1);
	};
	/**
	 * 构造查询条件
	 */
	var _buildInParam = function(curPage){
		var brand = "";
		var phoneType = "";
		var $priceArea = $("#priceArea a[class='selected']");
		var minPrice = $priceArea.attr("minPrice");
		var maxPrice = $priceArea.attr("maxPrice");
		var commCond = $("#commCond").val();
		//处理品牌选择项
		if($("#termManf_small").css("display") != "none"){
			brand = $("#termManf_small a[class='selected']").attr("val");
		}
		var contractFlag = "";
		if($("#contractFlag_small").css("display") != "none"){
			contractFlag = $("#contractFlag_small a[class='selected']").attr("val");
		}
		if($("#termManf_all").css("display") != "none"){
			brand = $("#termManf_all a[class='selected']").attr("val");
		}
		brand = ec.util.defaultStr(brand);
		if($("#phoneType_small").css("display") != "none"){
			phoneType = $("#phoneType_small a[class='selected']").attr("val");
		}
		if($("#phoneType_all").css("display") != "none"){
			phoneType = $("#phoneType_all a[class='selected']").attr("val");
		}
		phoneType = ec.util.defaultStr(phoneType);
		minPrice = ec.util.defaultStr(minPrice);
		maxPrice = ec.util.defaultStr(maxPrice);
		commCond = ec.util.defaultStr(commCond);
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
			"contractFlag":contractFlag,
			"pageInfo":{
				"pageIndex":curPage,
				"pageSize":pageSize
			},
			"attrList":attrList
		};
	};
	/**
	 * 点击前定位
	 */
	var _exchangeSelected = function(loc,selected){
		$(loc).removeClass("selected");
		$(selected).addClass("selected");
	};
	/**
	 * 初始化查询条件
	 */
	var _initInParam = function(brand,minPrice,maxPrice,commCond){
		$("#commCond").val(commCond);
		//给搜索输入框绑定回车事件
		$("#commCond").off("keydown").on("keydown", function(e){
			var ev = document.all ? window.event : e; 
			if(ev.keyCode==13) {
				$("#btn_term_search").click();
			}
		});
		var not_exist_ = false;
		$("#termManf_small a").each(function(){
			if($(this).attr("val")==brand){
				$(this).addClass("selected");
				not_exist_ = true;
			}else{
				$(this).removeClass("selected");
			}
		});
		if(!not_exist_){
			$("#termManf_all a").each(function(){
				if($(this).attr("val")==brand){
					$(this).addClass("selected");
				}else{
					$(this).removeClass("selected");
				}
			});
			//_view_termManf("termManf_all");
		}
		$("#priceArea a").removeClass("selected");
		$("#priceArea a[minPrice='"+minPrice+"'][maxPrice='"+maxPrice+"']").addClass("selected");
	};
	/**
	 * 成功获取搜索条件后展示
	 */
	var call_back_success_queryApConfig=function(response){
		var dataLength=response.data.length;
		var PHONE_BRAND;
		var PHONE_PRICE_AREA;
		var PHONE_TYPE;
		var terminalBrandLessHtml="<a href=\"javascript:void(0);\" class=\"selected \" val=\"\">不限</a>";
		var terminalBrandMoreHtml="<a href=\"javascript:void(0);\" class=\"selected \" val=\"\">不限</a>";
		var phonePriceAreaHtml="<a href=\"javascript:void(0);\" class=\"selected\" minPrice=\"\" maxPrice=\"\">不限</a>";
		var phoneTypeLessHtml="<a href=\"javascript:void(0);\" class=\"selected \" val=\"\">不限</a>";
		var phoneTypeMoreHtml="<a href=\"javascript:void(0);\" class=\"selected \" val=\"\">不限</a>";
		//终端品牌
		for (var i=0; i < dataLength; i++) {
			if(response.data[i].PHONE_BRAND){
			  	PHONE_BRAND=response.data[i].PHONE_BRAND;
			  	var brandLength;
			  	if(PHONE_BRAND.length<=6){
			  		brandLength=PHONE_BRAND.length;
			  	}else{
			  		brandLength=6;
			  	}
			  	for(var m=0;m<brandLength;m++){
			  		var phoneBrand=(PHONE_BRAND[m].COLUMN_VALUE_NAME).replace(/\"/g, "");
			  		terminalBrandLessHtml=terminalBrandLessHtml+"<a href=\"javascript:void(0);\" val="+phoneBrand+">"+phoneBrand+"</a>";
			  	}
			  	if(PHONE_BRAND.length>6){
			  		for(var n=0;n<PHONE_BRAND.length;n++){
			  			var phoneBrand=(PHONE_BRAND[n].COLUMN_VALUE_NAME).replace(/\"/g, "");
			  			terminalBrandMoreHtml=terminalBrandMoreHtml+"<a href=\"javascript:void(0);\" val="+phoneBrand+">"+phoneBrand+"</a>";
			  		}
			  		$("#termManfId_more").show();
			  		$("#termManfId_more").off("click").on("click",function(event){
			  			_viewSmallOrAll("#termManf_all", "#termManf_small");
			  			event.stopPropagation();
			  		});
			  		$("#termManfId_more").toggle(
			  			function(){
			  				$("#termManfId_more a").addClass("btn_less");
			  				$("#termManfId_more a").text("收起");
			  			},
			  			function(){
			  				$("#termManfId_more a").removeClass("btn_less");
			  				$("#termManfId_more a").text("展开");
			  			});
			  		
			  	}
			  	$("#termManf_small").html(terminalBrandLessHtml);
			  	$("#termManf_all").html(terminalBrandMoreHtml);
				continue;
			}
		};
		//终端价格
		for (var i=0; i < dataLength; i++) {
			if(response.data[i].PHONE_PRICE_AREA){
			  	PHONE_PRICE_AREA=response.data[i].PHONE_PRICE_AREA;
			  	for(var m=0;m<PHONE_PRICE_AREA.length;m++){
			  		var  phonePriceArea=(PHONE_PRICE_AREA[m].COLUMN_VALUE_NAME).replace(/\"/g, "");
			  			var phonePriceAreaArry=phonePriceArea.split("-");
			  			if(phonePriceAreaArry.length!=1){
			  				minPrice=phonePriceAreaArry[0];
			  				maxPrice=phonePriceAreaArry[1];
			  			}else{
			  				phonePriceAreaArry=phonePriceAreaArry.toString();
			  				minPrice=phonePriceAreaArry.substring(0,phonePriceAreaArry.length-2);
			  				maxPrice="\"\"";
			  			}
			  			
			  			phonePriceAreaHtml=phonePriceAreaHtml+"<a href=\"javascript:void(0);\" minPrice="+minPrice+" maxPrice="+maxPrice+">"+phonePriceArea+"</a>";
			  	}
			  	$("#priceArea").html(phonePriceAreaHtml);
				continue;
			}
		};
		//终端类型
		for (var i=0; i < dataLength; i++) {
			if(response.data[i].PHONE_TYPE){
				PHONE_TYPE=response.data[i].PHONE_TYPE;
			  	var typeLength;
			  	if(PHONE_TYPE.length<=6){
			  		typeLength=PHONE_TYPE.length;
			  	}else{
			  		typeLength=6;
			  	}
			  	for(var m=0;m<typeLength;m++){
			  		var phoneType=(PHONE_TYPE[m].COLUMN_VALUE_NAME).replace(/\"/g, "");
			  		phoneTypeLessHtml=phoneTypeLessHtml+"<a href=\"javascript:void(0);\" val="+phoneType+">"+phoneType+"</a>";
			  	}
			  	if(PHONE_TYPE.length>6){
			  		for(var n=0;n<PHONE_TYPE.length;n++){
			  			var phoneType=(PHONE_TYPE[n].COLUMN_VALUE_NAME).replace(/\"/g, "");
			  			phoneTypeMoreHtml=phoneTypeMoreHtml+"<a href=\"javascript:void(0);\" val="+phoneType+">"+phoneType+"</a>";
			  		}
			  		$("#phoneTypeId_more").show();
			  		$("#phoneTypeId_more").off("click").on("click",function(event){_viewSmallOrAll("#phoneType_all", "#phoneType_small");event.stopPropagation();});
			  	}
			  	$("#phoneType_small").html(phoneTypeLessHtml);
			  	$("#phoneType_all").html(phoneTypeMoreHtml);
				continue;
			}
		};
		//手机终端
		$("#btn_term_search").off("click").on("click",function(event){_btnQueryTerminal(1);event.stopPropagation();});
		$("#termManf_small a[val!='更多']").off("click").on("click",function(event){_linkQueryTerminal("#termManf_small a[val!='更多']",this);});
		$("#termManf_all a[val!='更多']").off("click").on("click",function(event){_linkQueryTerminal("#termManf_all a[val!='更多']",this);});
		$("#priceArea a").off("click").on("click",function(event){_linkQueryTerminal("#priceArea a",this);});
		$("#contractFlag_small a").off("click").on("click",function(event){_linkQueryTerminal("#contractFlag_small a",this);});
		$("#phoneType_small a[val!='更多']").off("click").on("click",function(event){_linkQueryTerminal("#phoneType_small a[val!='更多']",this);});
		$("#phoneType_all a[val!='更多']").off("click").on("click",function(event){_linkQueryTerminal("#phoneType_all a[val!='更多']",this);});
	};
	/**
	 * 获取搜索条件
	 */
	var _queryApConfig=function(){
		var configParam={"CONFIG_PARAM_TYPE":"TERMINAL_AND_PHONENUMBER"};
		var qryConfigUrl=contextPath+"/order/queryApConf";
		$.callServiceAsJsonGet(qryConfigUrl, configParam,{
			"done" : call_back_success_queryApConfig
		});
	};
	/**
	 * 全部展示与部分展示
	 */
	var _viewSmallOrAll = function(small, all){
		if($(small).is(':hidden')){
			$(small).css("display","");
			$(all).css("display","none");
			$(all).parent("dl").css("overflow","auto");
		}else{
			$(small).css("display","none");
			$(all).css("display","");
			$(all).parent("dl").css("overflow","hidden");
		}
	};
	/**
	 * 选择立即订购终端
	 */
	var _selectTerminal=function(obj){
		//mktResTypeCd="${mkt.mktResTypeCd}" mktResCd="${mkt.mktResCd}" brand="${brand}" phoneType="${phoneType}" 
		//phoneColor="${phoneColor}" mktName="${mkt.mktResName}" mktPrice="${(mkt.salePrice)}" mktPicA="${p_pic}" 
		var param = {
				mktResTypeCd :$(obj).attr("mktResTypeCd"),
				mktResCd :$(obj).attr("mktResCd"),
				mktResId :$(obj).attr("mktResId"),
				brand :$(obj).attr("brand"),
				phoneType :$(obj).attr("phoneType"),
				phoneColor :$(obj).attr("phoneColor"),
				mktName : $(obj).attr("mktName"),
				mktPrice : $(obj).attr("mktPrice"),
				mktLjPrice:$(obj).attr("mktLjPrice"),
				mktPicA : $(obj).attr("mktPicA")
		};
		if(CONST.getAppDesc()==0){
			param.mktSpecCode=$(obj).attr("mktSpecCode");
			param.pageInfo={pageIndex:1,pageSize:20};
			param.attrList=[];
			param.is4G="yes";
		}
		var termDetailUrl = contextPath+"/mktRes/terminal/detail";
		$.callServiceAsHtml(termDetailUrl, param, {
			"before":function(){
				$.ecOverlay("<strong>在处理中,请稍等会儿....</strong>");
			},"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					$.alert("提示","<br/>处理失败，请稍后重试！");
					return;
				}
				if(response.code != 0) {
					$.alert("提示","<br/>处理失败，请稍后重试！");
					return;
				}
				var termDetail$=$("#order_term_detail");
				$("#order_tab_panel_terminal .order_tab_header").hide();
				$("#order_term_list").hide();
				termDetail$.show();
				termDetail$.html(response.data).fadeIn();
				_initBuyChk();
				$("#hy").click(function(){
					_initBuyChk();
					buyChk.buyType = 'hy';
					_setPrice();
					_chkState();
				});
				$("#lj").click(function(){
					_initBuyChk();
					buyChk.buyType = 'lj';
					_setPrice();
					_chkState();
					//需要重新校验串码
					$("#tsn_hid").val("");
					$("#tsn").val("");
					termInfo = {};
				});
				$("#cNumA").click(function(){
					var custId = OrderInfo.cust.custId;
					if(OrderInfo.cust==undefined || custId==undefined || custId==""){
						$.alert("提示","在选号码之前请先进行客户定位或者新建客户！");
						return;
					}
					_chkState();
					order.prepare.phoneNumDialog('terminal','Y1','01');
				});
				$("#cfsjA").click(function(){
					_selectHy(1);
				});
				$("#gjsfA").click(function(){
					_selectHy(2);
				});
				$("#chkTsnA").click(function(){
					_checkTerminalCode('tsn');
				});
				$("#purchaseTermA").click(function(){
					_purchase();
				});
				//初始化裸机发展人信息
				$("#lj").click();
				OrderInfo.actionFlag=13;
				order.dealer.initDealer();//初始化发展人
			}
		});	
	};
	
	
	/**
	 * 选择颜色
	 */
	var _selectColor=function(obj){
		$("a[name^='selectBox']").each(function(i){
			$(this).addClass("selectBoxTwo").removeClass("selectBoxTwoOn");
		});
		$(obj).addClass("selectBoxTwoOn").removeClass("selectBoxTwo");
		var p_pic=$(obj).attr("p_pic");
		var mktResName=$(obj).attr("mktResName");
		var mktSalePrice=$(obj).attr("mktSalePrice");
		var mktNormalSalePrice=$(obj).attr("mktNormalSalePrice");
		var mktResId=$(obj).attr("mktResId");
		var mktResTypeCd=$(obj).attr("mktResTypeCd");
		var mktSpecCode=$(obj).attr("mktSpecCode");
		if(buyChk.buyType == 'hy'){
			$("#mkt_saleprice_id").html(mktNormalSalePrice / 100+" 元");
		}else if(buyChk.buyType == 'lj'){
			$("#mkt_saleprice_id").html(mktSalePrice / 100+" 元");
		}
		$("#term_pic_id").attr("src",p_pic);
		$("#mkt_resname_id").html(mktResName);
		$("#mktResId").val(mktResId);
		$("#mktResName").val(mktResName);
		$("#mktLjPrice").val(mktSalePrice);
		$("#price").val(mktNormalSalePrice);
		$("#mktResType").val(mktResTypeCd);
		$("#mktSpecCode").val(mktSpecCode);
		
		var buyTypeTmp=buyChk.buyType;
		_initBuyChk();
		buyChk.buyType=buyTypeTmp;
		_chkState();
		$("#tsn_hid").val("");
		$("#tsn").val("");
		termInfo = {};
	};
	
	var _setPrice = function(){
		selectColor$ = $("a[name='selectBox'][class='selectNumbel selectBoxTwoOn']");
		if(buyChk.buyType == 'hy'){
			var mktNormalSalePrice=selectColor$.attr("mktNormalSalePrice");
			$("#mkt_saleprice_id").html(mktNormalSalePrice / 100+" 元");
			$("#mktLjPrice").val(mktNormalSalePrice);
		}else if(buyChk.buyType == 'lj'){
			var mktSalePrice=selectColor$.attr("mktSalePrice");
			$("#mkt_saleprice_id").html(mktSalePrice / 100+" 元");
			$("#mktLjPrice").val(mktSalePrice);
		}
	};
	
	/**
	 * 选择合约
	 */
	var _selectHy=function(agreementType){
		$("#choosedOfferPlan").html("");
		buyChk.hyFlag = false;
		if (agreementType == 1) {
			buyChk.hyType = 'cfsj';
			$("#tsn_hid").val("");
			$("#tsn").val("");
			termInfo = {};
		} else {
			buyChk.hyType = 'gjsf';
		}
		_chkState();
		
		if (!buyChk.numFlag){
			$.alert("提示","请先选号！");
			return;
		}
		
		ec.form.dialog.createDialog({
			"id":"-gjhy",
			"width":980,
			"height":550,
			"initCallBack":function(dialogForm,dialog){
				var param={
						"mktResCd":$("#mktResId").val(),
						"agreementType":agreementType
				};
				var url=contextPath+"/mktRes/terminal/mktplan";
				$.callServiceAsHtmlGet(url,param,{
					"before":function(){
//						$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
					},
					"always":function(){
//						$.unecOverlay();
					},
					"done" : function(response){
						mktRes.terminal.dialogForm=dialogForm;
						mktRes.terminal.dialog=dialog;
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
							if(mktRes.terminal.dialogForm!=undefined&&mktRes.terminal.dialog!=undefined){
								mktRes.terminal.dialogForm.close(mktRes.terminal.dialog);
							}
							return;
						}
						$("#gjhyContent").html(response.data);
						//显示第一个tab的div
						$("#tab_content_0").show();
						//绑定切换合约页click事件
						$("#contract_nav_agreement li").off("click").on("click",function(event){
							_setPlanOfferTab(this, $(this).attr("itemIndex"));
						});
						//绑定每行合约click事件
						$("#phone_warp_id .contract_tab_content tr:gt(0)").off("click").on("click",function(event){
							_linkQueryOffer(this);
						});
						//绑定确定按钮click事件
						$("#hy_nav_confirm_a").off("click").on("click",function(event){
							_selectPlan();
						});
					}
				});	
			 },
			"submitCallBack":function(dialogForm,dialog){
				buyChk.hyFlag = true;
			},
			"closeCallBack":function(dialogForm,dialog){
//				buyChk.hyFlag = false;
				_chkState();
				var content$=$("#gjhyContent");
				content$.html('');
			}
		});
	};
	/**
	 * 切换合约计划标签页
	 */
	var _setPlanOfferTab=function(selected, id){
		if ($(selected).hasClass("current")) {
			return;
		}
		$("#contract_nav_agreement li").removeClass("current");
		$("#tab_"+id).addClass("current");
		$(".contract_tab_content").hide();
		$("#tab_content_"+id).show();
	};
	/**
	 * 根据合约查询套餐
	 */
	var _linkQueryOffer=function(selected){
		if ($(selected).hasClass("plan_select")) {
			$(selected).removeClass("bg plan_select").next("#plan2ndTr").hide();
			return false;
		}
		$("#phone_warp_id .contract_tab_content tr").filter(".plan_select")
			.removeClass("bg plan_select").next("#plan2ndTr").hide();
		$(selected).addClass("bg").addClass("plan_select");
		var offerSpecId=$(selected).attr("offerSpecId");
		var agreementType = $(selected).attr("agreementType");
		_queryOffer(selected, offerSpecId, agreementType);
	};
	/**
	 * 查询套餐后生成展示内容
	 */
	var _queryOffer=function(selected, offerSpecId, agreementType){
		
		var obj$ = $(selected).next("#plan2ndTr");
		if (obj$.length > 0) {
			obj$.show();
			return;
		}
		
		//调用order.js中的方法获得主销售品规格
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
		var offerHtml="";
		offerHtml+="<tr id='plan2ndTr' class='nocolor'>";
		offerHtml+="<td class='nopadding' colspan='7'>";
		offerHtml+="<div id='plan2ndDiv' class='plan_second_list cashier_tr'>";
		offerHtml+="  <table class='contract_list'>";
		offerHtml+="  <thead>";
		offerHtml+="    <tr>";
		offerHtml+="      <td class='borderLTB'>&nbsp;</td><td>套餐名称</td><td>价格</td>";
		offerHtml+="      <td>流量</td><td>语音分钟数</td><td>WIFI时长</td><td>点对点短信</td>";
		offerHtml+="      <td>点对点彩信</td><td>套餐外流量</td><td>套餐外通话分钟数</td>";
		offerHtml+="    </tr>";
		offerHtml+="  </thead>";
		offerHtml+="  <tbody>";
		var offerInfos = response.data.prodOfferInfos;
		if (offerInfos.length == 0) {
			$.alert("提示","<br/>未查到套餐，请稍后再试！");
		}
		for(var i=0;i<offerInfos.length;i++){
			var offer = offerInfos[i];
			offerHtml+="    <tr offerSpecId='"+offer.offerSpecId+"' ";
			offerHtml+=		"   offerSpecName='"+offer.offerSpecName+"' ";
			offerHtml+=		"   price='"+offer.price+"' >";
			offerHtml+="      <td></td>";
			offerHtml+="      <td style='width:240px;'>"+ec.util.defaultStr(offer.offerSpecName)+"</td>";
			offerHtml+="      <td>"+ec.util.defaultStr(offer.price)+"</td>";
			var inFlux = '';
			if (offer.inFlux >= 1024) {
				inFlux = offer.inFlux / 1024 + 'G';
			} else {
				inFlux = offer.inFlux + 'M';
			}
			offerHtml+="      <td>"+ec.util.defaultStr(inFlux)+"</td>";
			offerHtml+="      <td>"+ec.util.defaultStr(offer.inVoice)+"</td>";
			offerHtml+="      <td>"+ec.util.defaultStr(offer.inWIFI)+"</td>";
			offerHtml+="      <td>"+ec.util.defaultStr(offer.inSMS)+"</td>";
			offerHtml+="      <td>"+ec.util.defaultStr(offer.inMMS)+"</td>";
			offerHtml+="      <td style='width:140px;'>"+ec.util.defaultStr(offer.outFlux)+"</td>";
			offerHtml+="      <td>"+ec.util.defaultStr(offer.outVoice)+"</td>";
			offerHtml+="    </tr>";
		}
		offerHtml+="  </tbody>";
		offerHtml+="  </table>";
		offerHtml+="</div>";
		offerHtml+="</td>";
		offerHtml+="</tr>";
		
		$(selected).after(offerHtml);
		$("#plan2ndDiv tbody tr").off("click").on("click",function(event){_linkSelectPlan(this);event.stopPropagation();});
//		alert(response.data);
	};
	var _linkSelectPlan=function(selected){
		$("#plan2ndDiv tbody tr").removeClass("plan_select2");
		$("#plan2ndDiv tbody tr").children(":first-child").html("");
		var offerSpecId = $(selected).attr("offerSpecId");
		var result = _queryOfferSpec(offerSpecId, selected);
		if (result) {
			$(selected).addClass("plan_select2");
			var nike="<i class='terminalSelect'></i>";
			$(selected).children(":first").html(nike);
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
	 * 查询销售品构成
	 */
	var _queryOfferSpecOld=function(offerSpecId, selected){
		buyChk.hyOfferSpecQty=0;
		buyChk.hyOfferSpecFt=0;
		var data = $(selected).data("__offerSpec");
		if (typeof(data) == "undefined") {
			var params={
					"offerSpecId":Number(offerSpecId)
			};
			var url = contextPath+"/order/queryOfferSpec";
			var response = $.callServiceAsJson(url,params);
			data = response.data.offerSpec;
			$(selected).data("__offerSpec", data);
			
			if (typeof(response) == "undefined" || response==null){
				$.alert("提示","<br/>未查到销售品构成，请稍后再试！");
				return false;
			}
			if (response.code != "0" || !response.isjson){
				$.alert("提示","<br/>未查到销售品构成，请稍后再试！");
				return false;
			}
			if(response.data.code != "POR-0000"){
				$.alert("提示","<br/>未查到销售品构成，请稍后再试！");
				return false;
			}
		}
		var offerSpec= SoOrder.sortOfferSpec(data);//排序主副卡销售品
				
		var offerRoles=offerSpec.offerRoles;
		
		buyChk.hyOfferRoles=offerRoles;
		
		var i;
		var maxQty = 0;
		var minQty = 0;
		/*
		for(i=0;i<offerRoles.length;i++){
			if(CONST.MEMBER_ROLE_CD.VICE_CARD==offerRoles[i].memberRoleCd){
				maxQty=offerRoles[i].maxQty;
				minQty=offerRoles[i].minQty;
			} else {
				offerRoles[i].selectQty=1;
			}
		}
		*/
		/*卞贤伟 2014-0307修改 控制副卡个数*/
		for(i=0;i<offerRoles.length;i++){
			var offerRole = offerRoles[i];
			if(CONST.MEMBER_ROLE_CD.VICE_CARD==offerRoles[i].memberRoleCd){
				if(offerRole.roleObjs){
					$.each(offerRole.roleObjs,function(){
						if(this.objType == 2){
							maxQty = this.maxQty<0?"不限制":this.maxQty;//主卡的最大数量
							minQty = this.minQty<0?"0":this.minQty;//主卡的最大数量
						}
					});
				}
			} else {
				offerRoles[i].selectQty=1;
			}
		}
		offerSpec.offerRoles=offerRoles;
		//填OrderInfo
		OrderInfo.offerSpec = offerSpec;
		
		//付费类型 ：初始化buyChk.hyOfferSpecFt
		buyChk.hyOfferSpecFt=offerSpec.feeType;
		
		//如果没有副卡
		if (maxQty == 0) {
			return true;
		}
		
		//副卡个数
		var cPanel = $("#termOfferSpecViceLi");
		cPanel.find("input").val(minQty);
		cPanel.find(".addinfo").html("&nbsp;&nbsp;&nbsp;"+minQty+"-"+maxQty+"（张） ");
		cPanel.find("a:first").off("click").on("click", function(event){
			var num = parseInt(cPanel.find("input").val());
			if (num <= minQty) {
				$.alert("提示","副卡数量已经达到最小值，不能再减少。");
				return;
			} else {
				cPanel.find("input").val(num-1);
			}
		});
		cPanel.find("a:last").off("click").on("click", function(event){
			var num = parseInt(cPanel.find("input").val());
			if (num >= maxQty) {
				$.alert("提示","副卡数量已经达到最大值，不能再增加。");
				return;
			} else {
				cPanel.find("input").val(num+1);
			}
		});
		easyDialog.open({
			container : 'termOfferSpec'
		});
		$("#termOfferSpecClose").off("click").on("click",function(event){
			easyDialog.close();
		});
		$("#termOfferSpecCancel").off("click").on("click",function(event){
			easyDialog.close();
		});
		$("#termOfferSpecConfirm").off("click").on("click",function(event){
			var selectQty = cPanel.find("input").val();
			buyChk.hyOfferSpecQty = selectQty;
			for(i=0;i<offerRoles.length;i++){
				if(CONST.MEMBER_ROLE_CD.VICE_CARD==offerRoles[i].memberRoleCd){
					offerRoles[i].selectQty=selectQty;
				} else {
					offerRoles[i].selectQty=1;
				}
			}
			OrderInfo.offerSpec.offerRoles = offerRoles;
			
			easyDialog.close();
		});
		return true;
	};
	/**
	 * 在合约套餐窗口选择套餐
	 */
	var _selectPlan=function(){
		//搜索是否有
		var offerSpec=$("#plan2ndDiv tbody tr[class='plan_select2']");
		if (offerSpec.length!=1) {
			$.alert("提示","请选择一个套餐！");
			return;
		}
		//填入合约信息
		var agreement = offerSpec.parents("#plan2ndTr").prev();
		if (agreement.length!=1) {
			$.alert("提示","请选择一个合约！");
			return;
		}
		mktRes.terminal.offerSpecId = agreement.attr("offerSpecId");
		buyChk.hyFlag = true;
		buyChk.hyOfferSpecId=offerSpec.attr("offerSpecId");
		buyChk.hyOfferSpecName=offerSpec.attr("offerSpecName");
//		order.service.setOfferSpec(1, Number(buyChk.hyOfferSpecQty));
		
		_chkState();
		$("#choosedOfferPlan").html(agreement.attr("offerSpecName"));
		if(mktRes.terminal.dialogForm!=undefined&&mktRes.terminal.dialog!=undefined){
			mktRes.terminal.dialogForm.close(mktRes.terminal.dialog);
		}
	};
	/**
	 * 增加附属销售品（填入合约信息）
	 */
	var _addAttachParam=function(prodId,offerSpecId,offerSpecName){
		var param = {
			offerSpecId:offerSpecId,
			prodId:prodId
		};
		var orderedOfferSpecIds = [];
		var specList = AttachOffer.getSpecList(prodId);
		if(specList!=undefined){
			for (var i = 0; i < specList.length; i++) {  //遍历开通附属
				if(specList[i].offerSpecId!=offerSpecId&&specList[i].isdel!="Y"){
					orderedOfferSpecIds.push(specList[i].offerSpecId);
				}
			}	
		}
		var offerList = AttachOffer.getOfferList(prodId);
		if(offerList!=undefined){
			for (var i = 0; i < offerList.length; i++) { //遍历已订购附属
				if(offerList[i].offerSpecId!=offerSpecId && offerList[i].isdel!="Y"){
					orderedOfferSpecIds.push(offerList[i].offerSpecId);
				}
			}
		}
		if(orderedOfferSpecIds.length>0){
			param.orderedOfferSpecIds = orderedOfferSpecIds;
		}
		var response = $.callServiceAsJsonGet(contextPath+"/offer/queryExcludeDepend",{strParam:JSON.stringify(param)},{});
		if(response.code == 0){
			AttachOffer.parseRuleData(response.data,offerSpecId,prodId,offerSpecName);	
			return true;
		}else if(response.code == 1){
			$.alert("提示","<strong>"+response.errorsList[0].msg+"("+response.errorsList[0].code+")</strong>");
		}else{
			$.alert("提示","数据查询异常，请稍后重试！");
		}
		return false;
	};
	/**
	 * 终端串号校验
	 */
	var _checkTerminalCode=function(id){
		termInfo = {};
		buyChk.tsnFlag = false;
		_chkState();
		$("#tsn_hid").val("");
		
		var tc = $("#"+id).val();
		if(tc == "")
			return ;
		var param = {
			"instCode" : tc,
			"mktResTypeCd" : $("#mktResType").val(),
			"orderNo" : ""
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
			"before":function(){
//				$.ecOverlay("<strong>终端串码校验中,请稍等...</strong>");
			},"always":function(){
//				$.unecOverlay();
			},
			"done" : function(response){
				if (response && response.code == -2) {
					$.alertM(response.data);
				} else if(response&&response.data&&response.data.code == 0) {
					if(response.data.statusCd==CONST.MKTRES_STATUS.USABLE){
						$.alert("提示","<br/>此终端串号可以使用");
						//记录终端串码
//						SoOrder.order.item.mhk.sn  = tc;
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
						
						
					}else{
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
			var areaId= OrderInfo.staff.soAreaId;
			if(areaId.indexOf("0000")>0){
				$.alert("提示","仅三级和四级地区才能进行裸机购买！");
				return;
			}
			// 单位为元
			var apCharge = $("#mktLjPrice").val() / 100;
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
			if (OrderInfo.cust.custId != undefined && OrderInfo.cust.custId != "") {
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
			var $tr = $("tr[name='tr_"+$("#mktResId").val()+"']");
			if($tr!=undefined){
				data.dealers = [];
				$tr.each(function(){   //遍历产品有几个发展人
					var dealer = {
						itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
						role : $(this).find("select").val(),
						value : $(this).find("input").attr("staffid") 
					};
					data.dealers.push(dealer);
				});
			}
			SoOrder.getTokenSynchronize();
			//订单提交
			SoOrder.submitOrder(data);
			return;
		} else if ("hy"==buyChk.buyType) {
			if (!buyChk.numFlag) {
				$.alert("提示","<br/>请先选号。");
				return;
			} else if (!buyChk.hyFlag) {
				$.alert("提示","<br/>请先选择合约套餐。");
				return;
			} else if (!buyChk.tsnFlag) {
				$.alert("提示","<br/>请先校验终端串号。");
				return;
			}
			//校验客户是否已定位
			if (OrderInfo.cust.custId==undefined||OrderInfo.cust.custId=="") {
				$.alert("提示","<br/>在订购套餐之前请先进行客户定位！");
				return;
			}
			//构造参数，填单
		} else {
			return;
		}
		var apCharge = $("#price").val() / 100;
		var coupon = {
			couponUsageTypeCd : "5", //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
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
			partyId : OrderInfo.cust.custId, //客户ID
			prodId : -1, //产品ID
			offerId : -1, //销售品实例ID
			attachSepcId : mktRes.terminal.offerSpecId,
			state : "ADD", //动作
			relaSeq : "" ,//关联序列
			couponSource: termInfo.couponSourc //串码话补标识
		};
		if(CONST.getAppDesc()==0){
			coupon.termTypeFlag=termInfo.termTypeFlag;
		}
		OrderInfo.attach2Coupons = [];
		OrderInfo.attach2Coupons.push(coupon);
		var param = {
			boActionTypeCd : 'S1',
			boActionTypeName : "订购",
			offerSpec : OrderInfo.offerSpec,
			offerSpecId : buyChk.hyOfferSpecId,
			offerSpecName : buyChk.hyOfferSpecName,
			viceCardNum : Number(buyChk.hyOfferSpecQty),
			feeType : buyChk.hyOfferSpecFt,
			offerNum : 1,
			type : 2,//1购套餐2购终端3选靓号
			actionFlag : OrderInfo.actionFlag,
			terminalInfo : {
				terminalName : $("#mktResName").val(),
				terminalCode : $("#tsn_hid").val()
			},
			offerRoles : buyChk.hyOfferRoles
		};
		OrderInfo.actionTypeName = "订购";
		SoOrder.builder(); //初始化订单数据
		order.main.buildMainView(param);
	};
	
	return {
		init:_init,
		btnQueryTerminal:_btnQueryTerminal,
		initInParam:_initInParam,
		queryApConfig:_queryApConfig,
		selectTerminal:_selectTerminal,
		setNumber:_setNumber,
		offerSpecId:_offerSpecId,
		selectColor:_selectColor
	};
})(jQuery);

//初始化
$(function(){
	//mktRes.terminal.init();
});