/**
 * 订购套餐等业务入口
 * 
 * @author yanghm
 */

CommonUtils.regNamespace("order", "service");
/**
 * 套餐查询
 */
order.service = (function(){
	var _enter=3;//新装入口区分，1选套餐，2购手机 3选号码
	var _max;//副卡最大数
	//购机和选号入口的预占号码信息缓存
	var _boProdAn = {};
	var _isAll = false;
	var _showTab3=false;
	
	var _isCloudOffer=false;//是否云盘套餐
	
	var _init = function(){
		order.service.searchPack(0,"init");
	};
	
	//主套餐查询
	var _searchPack = function(flag,initFlag,scroller){
		order.service.isCloudOffer=false;
		$("#offer-rule").hide();
		$("#offer-list").show();
		var custId = OrderInfo.cust.custId;
		var qryStr=$("#offerName").val();
//		var params={"qryStr":qryStr,"pnLevelId":"","custId":custId};
		var params={"subPage":"","qryStr":qryStr,"pnLevelId":"","custId":custId,"PageSize":10,"enter":3};
		if($("#categoryNodeId").length>0){
			var categoryNodeId=$("#categoryNodeId").val();
			params.categoryNodeId = categoryNodeId;
		}
		
		var priceVal = $("#select_price").val();
		if(ec.util.isObj(priceVal)){
			var priceArr = priceVal.split("-");
			if(priceArr[0]!=null&&priceArr[0]!=""){
				params.priceMin = priceArr[0] ;
			}
			if(priceArr[1]!=null&&priceArr[1]!=""){
				params.priceMax = priceArr[1] ;
			}
		}
		var influxVal = $("#select_influx").val();
		if(ec.util.isObj(influxVal)){
			var influxArr = influxVal.split("-");
			if(influxArr[0]!=null&&influxArr[0]!=""){
				params.INFLUXMin = influxArr[0]*1024 ;
			}
			if(influxArr[1]!=null&&influxArr[1]!=""){
				params.INFLUXMax = influxArr[1]*1024 ;
			}
		}
		var invoiceVal = $("#select_invoice").val();
		if(ec.util.isObj(invoiceVal)){
			var invoiceArr = invoiceVal.split("-");
			if(invoiceArr[0]!=null&&invoiceArr[0]!=""){
				params.INVOICEMin = invoiceArr[0] ;
			}
			if(invoiceArr[1]!=null&&invoiceArr[1]!=""){
				params.INVOICEMax = invoiceArr[1] ;
			}
		}
		_queryData(params,flag,initFlag,scroller);
		
	};
	
	//查询平台配置信息
	var _queryApConfig=function(){
		var configParam={"CONFIG_PARAM_TYPE":"PROD_AND_OFFER"};
		var qryConfigUrl=contextPath+"/app/order/queryApConf";
		$.callServiceAsJsonGet(qryConfigUrl, configParam,{
			"done" : function(response){
				if(response.data){
					var dataLength=response.data.length;
					for (var i=0; i < dataLength; i++) {
						if(response.data[i].OFFER_PRICE){
							OFFER_PRICE = response.data[i].OFFER_PRICE ;
							for(var j=0;j<OFFER_PRICE.length;j++){
								var rowKey=OFFER_PRICE[j].COLUMN_VALUE;
								var rowVal=OFFER_PRICE[j].COLUMN_VALUE_NAME;
								$("#select_price option[value='"+rowKey+"']").remove();
								$("#select_price").append("<option value='"+rowKey+"'>"+rowVal+"</option>");
							}
						}else if(response.data[i].OFFER_INFLUX){
							OFFER_INFLUX = response.data[i].OFFER_INFLUX ;
							for(var j=0;j<OFFER_INFLUX.length;j++){
								var rowKey=OFFER_INFLUX[j].COLUMN_VALUE;
								var rowVal=OFFER_INFLUX[j].COLUMN_VALUE_NAME;
								$("#select_influx option[value='"+rowKey+"']").remove();
								$("#select_influx").append("<option value='"+rowKey+"'>"+rowVal+"</option>");
							}
						}else if(response.data[i].OFFER_INVOICE){
							OFFER_INVOICE = response.data[i].OFFER_INVOICE ;
							for(var j=0;j<OFFER_INVOICE.length;j++){
								var rowKey=OFFER_INVOICE[j].COLUMN_VALUE;
								var rowVal=OFFER_INVOICE[j].COLUMN_VALUE_NAME;
								$("#select_invoice option[value='"+rowKey+"']").remove();
								$("#select_invoice").append("<option value='"+rowKey+"'>"+rowVal+"</option>");
							}
						}
						$.refresh($("#search-modal"));
					}
					order.broadband.init_select();
				}
			}
		});
	};
	
	var _queryData = function(params,flag,initFlag,scroller) {
		if(_isAll && flag == 1){
			_isAll = true;
		} else {
			_isAll = false;
		}
		if (OrderInfo.actionFlag == 2) {
			var offerSpecId = order.prodModify.choosedProdInfo.prodOfferId;
			if (offerSpecId != undefined) {
				params.changeGradeProdOfferId = offerSpecId;
			}
			var prodSpecIds = '';
			$.each(OrderInfo.offer.offerMemberInfos, function() { // 遍历旧套餐构成
				if (this.objType == CONST.OBJ_TYPE.PROD) { // 接入类产品
					if (this.objId != undefined) {
						prodSpecIds = prodSpecIds + "," + this.objId;
					}
				}
			});
			if (prodSpecIds != '') {
				prodSpecIds = prodSpecIds.substring(1, prodSpecIds.length);
				params.prodSpecId = prodSpecIds;
			}
			params.actionFlag = 2;
		} else if (CONST.getAppDesc() == 0) {
			params.prodOfferFlag = "4G";
		}
		params.newFlag = "1";

		if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 14 || OrderInfo.actionFlag == 112){
			if(params.categoryNodeId == "" && !_isAll){
				params.ifQueryFavorite = "Y";
			}
			
		}
		
		var url = contextPath+"/app/order/offerSpecList";
		$.callServiceAsHtmlGet(url,params, {
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
				order.phoneNumber.step=4;//选完套餐标签页切到促销或副卡
				var content$ = $("#offer-list");
				content$.html(response.data);
				var resultlst = $("#resultlst").val();
				if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
				
				if(initFlag == "init" && resultlst == 0){
					var custId = OrderInfo.cust.custId;
					var qryStr=$("#offerName").val();
					var param={"subPage":"","qryStr":qryStr,"pnLevelId":"","custId":custId,"PageSize":10,"enter":3};
					_isAll = true;
					_queryData(param,1,undefined,scroller);
				} else if(initFlag == undefined && resultlst == 0){
					var html = "<div class=\"list-group-item\"><div class=\"h4\"><img style=\"vertical-align:middle\"";
					html += "src= \"/ltePortal/image/common/query_search.gif\" />&nbsp;&nbsp;抱歉，没有找到相关的套餐。</div></div> ";
					content$.html(html);
					$("#phoneNumber_a").hide();
			    	$("#offer_a").show();
			    	$("#offer_search_model").modal("hide");		
				} else {
					$("#phoneNumber_a").hide();
			    	$("#offer_a").show();
			    	$("#offer_search_model").modal("hide");		
					if(params.ifQueryFavorite && params.ifQueryFavorite == "Y"){
						AttachOffer.myFavoriteOfferList = response.data.resultlst;
					}
				}
				
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","套餐加载失败，请稍后再试！");
			}
		});
	};
	
	var _selectOffer = function(offerSpecId, price) {
		$("#offer_change_sub").off("click").click(function() {
			_buyService(offerSpecId, price)
		});
	};
	
	//订购销售品
	var _buyService = function(specId,price) {
		order.service.showTab3=false;
		var custId = OrderInfo.cust.custId;
		offerprice = price;
		if(OrderInfo.cust==undefined || custId==undefined || custId==""){
			$.alert("提示","在订购套餐之前请先进行客户定位！");
		}else{
			var param = {
					"price":price,
					"specId" : specId,
					"custId" : OrderInfo.cust.custId,
					"areaId" : OrderInfo.staff.soAreaId
			};
			if (OrderInfo.actionFlag == 2) { // 套餐变更不做校验
				order.service.querySpec(param);
			} else {
				 // 新装
				var boInfos = [{
					boActionTypeCd: "S1",// 动作类型
					instId : "",
					specId : specId // 产品（销售品）规格ID
					}];
				rule.rule.ruleCheck(boInfos,function(checkData){// 业务规则校验通过
					if(ec.util.isObj(checkData)){
						$("#offer-list").hide();
						var content$ = $("#offer-rule").html(checkData).show();
						$.refresh(content$);
					}else{
						order.service.querySpec(param);   
					}
				});
			}
            
		}
	};
	
	//获取销售品构成
	var _querySpec = function(inParam){	
		var param = {
			offerSpecId : inParam.specId,
			offerTypeCd : 1,
			partyId: OrderInfo.cust.custId
		};
//		var offerSpec = query.offer.queryMainOfferSpec(param); //查询主销售品构成
		

		param.areaId = OrderInfo.cust.areaId;
		var url= contextPath+"/app/offer/queryOfferSpec";
			$.callServiceAsJsonGet(url,param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询销售品规格构成中,请稍后....</strong>");
				},
				"done" : function(response){
					$.unecOverlay();
					if (response.code==0) {
						var offerSpec = response.data.offerSpec;
						if(offerSpec ==undefined){
							$.alert("错误提示","销售品规格构成查询: 没有找到销售品规格！");
							return false;
						}
						if( offerSpec.offerRoles ==undefined){
							$.alert("错误提示","销售品规格构成查询: 返回的销售品规格构成结构不对！");
							return false;
						}
						if(offerSpec.offerSpecId==undefined || offerSpec.offerSpecId==""){
							$.alert("错误提示","销售品规格构成查询: 销售品规格ID未返回，无法继续受理！");
							return false;
						}
						if(offerSpec.offerRoles.length == 0){
							$.alert("错误提示","销售品规格构成查询: 成员角色为空，无法继续受理！");
							return false;
						}
						if(offerSpec.feeType ==undefined || offerSpec.feeType=="" || offerSpec.feeType=="null"){
							$.alert("错误提示","无付费类型，无法新装！");
							return false;
						}
						offerSpec = SoOrder.sortOfferSpec(offerSpec); //排序主副卡套餐
						if((OrderInfo.actionFlag==6||OrderInfo.actionFlag==2||OrderInfo.actionFlag==1) && ec.util.isArray(OrderInfo.oldprodInstInfos)){//主副卡纳入老用户
							OrderInfo.oldofferSpec.push({"offerSpec":offerSpec,"accNbr":param.accNbr});
						}else{
							OrderInfo.offerSpec = offerSpec;
						}
						
						if(!offerSpec){
							return;
						}
						if (OrderInfo.actionFlag == 2) { // 套餐变更
							var url = contextPath + "/app/order/queryFeeType";
							$.ecOverlay("<strong>正在查询是否判断付费类型的服务中,请稍后....</strong>");
							var response = $.callServiceAsJsonGet(url, param);
							$.unecOverlay();
							if (response.code == 0) {
								if (response.data != undefined) {
									if ("0" == response.data) {
										var is_same_feeType = false;
										if (order.prodModify.choosedProdInfo.feeType == "2100"
												&& (offerSpec.feeType == "2100"
														|| offerSpec.feeType == "3100"
														|| offerSpec.feeType == "3101"
														|| offerSpec.feeType == "3103"
														|| offerSpec.feeType == "1202" || offerSpec.feeType == "2101")) {
											is_same_feeType = true;// 预付费
										} else if (order.prodModify.choosedProdInfo.feeType == "1200"
												&& (offerSpec.feeType == "1200"
														|| offerSpec.feeType == "3100"
														|| offerSpec.feeType == "3102"
														|| offerSpec.feeType == "3103"
														|| offerSpec.feeType == "1202" || offerSpec.feeType == "2101")) {
											is_same_feeType = true;// 后付费
										} else if (order.prodModify.choosedProdInfo.feeType == "1201"
												&& (offerSpec.feeType == "1201"
														|| offerSpec.feeType == "3101"
														|| offerSpec.feeType == "3102" || offerSpec.feeType == "3103")) {
											is_same_feeType = true;// 准实时预付费
										}
										// if(!is_same_feeType){
										// $.alert("提示","付费类型不一致,无法进行套餐变更。");
										// return;
										// }
									}
								}
							}
							offerChange.offerChangeView();
							return;
						}
						
						_max=0;
						var iflag = 0; //判断是否弹出副卡选择框 false为不选择
						var str="";
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
										_max=this.maxQty;
										order.service.max=this.maxQty;
										iflag++;
										return false;
									}
								});
							}
						});
						if(iflag >0){//显示副卡tab
							 //号码入口展示副卡tab，否则展示选号
							order.service.showTab3=true;
							if(OrderInfo.actionFlag==14){//合约购机
								 OrderInfo.order.step = 4;//跳往副卡
								 $("#tab3_li").removeClass("active");
								 $("#tab4_li").addClass("active");
								 $("#nav-tab-3").removeClass("active in");
						    	 $("#nav-tab-4").addClass("active in");
						    	 order.phone.param.offerSpec=offerSpec;
							}else if(order.service.enter=="3"){
								 OrderInfo.order.step = 3;
								 $("#offer_a").hide();
								 $("#tab3_li").show();
								 $("#tab2_li").removeClass("active");
								 $("#tab3_li").addClass("active");
								 $("#nav-tab-2").removeClass("active in");
						    	 $("#nav-tab-3").addClass("active in");
							}else{
								 order.phoneNumber.initPhonenumber();
								 OrderInfo.order.step = 2;
								 $("#offer_a").hide();
								 $("#phoneNumber_a").show();
								 $("#tab3_li").show();
								 $("#tab2_li").removeClass("active");
								 $("#tab1_li").addClass("active");
								 $("#nav-tab-2").removeClass("active in");
						    	 $("#nav-tab-1").addClass("active in");
							}
							 $("#maxSpan").html(_max+")");
							
						}else{//默认隐藏副卡tab
							if(OrderInfo.actionFlag==14){//合约购机
								 OrderInfo.order.step = 5;//跳往促销
								 $("#tab3_li").removeClass("active");
								 $("#tab5_li").addClass("active");
								 $("#nav-tab-3").removeClass("active in");
						    	 $("#nav-tab-5").addClass("active in");
							}else if(order.service.enter=="1"){//套餐入口跳往选号
								//天翼云盘套餐带出虚拟号码，不走选号界面
								$.each(offerSpec.offerRoles, function () {
									$.each(this.roleObjs, function () {
										if (this.objType == CONST.OBJ_TYPE.PROD && this.objId == CONST.PROD_SPEC.PROD_CLOUD_OFFER) {
											order.service.isCloudOffer=true;
											 order.phoneNumber.getVirtualNum(CONST.MEMBER_ROLE_CD.MAIN_CARD);
										}
									});
								 });
								 if(order.service.isCloudOffer) return;//云盘套餐自动带出虚拟号码，不走选号页面
								 order.phoneNumber.initPhonenumber();
								 OrderInfo.order.step = 2;
								 $("#tab2_li").removeClass("active");
								 $("#tab1_li").addClass("active");
								 $("#nav-tab-2").removeClass("active in");
						    	 $("#nav-tab-1").addClass("active in");
						    	 $("#offer_a").hide();
						    	 $("#phoneNumber_a").show();
							}else{
								order.main.buildMainView();//选号入口跳转促销
								$("#offer_a").hide();
							}
						}

					}
					else if (response.code==-2){
						$.alertM(response.data);
					}else {
						$.alert("提示","查询销售品规格构成失败,稍后重试");
					}
				}
			});
	
	};
	
	var _setOfferSpec = function(type){
		var k = -1;
		var flag = false;  //判断是否选接入产品
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			var offerRole = this;
			offerRole.prodInsts = []; //角色对象实例
			$.each(this.roleObjs,function(){
				if(this.objType== CONST.OBJ_TYPE.PROD){  //接入类产品
//					var num = 0;  //接入类产品数量选择
//					if(offerType==1){  //单产品
//						num = 1;
//					}else if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD&&OrderInfo.actionFlag!=6){//主卡的接入类产品数量
//						num = 1;
//					}else{ //多成员销售品
//						num = $("#"+offerRole.offerRoleId+"_"+this.objId).val();  //接入类产品数量选择
//					}
//					if(num==undefined || num==""){
//						num = 0;
//					}
					var num=0;	
					if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD){
						num=1;//主卡
					}else{
						num=order.phoneNumber.secondaryCarNum;//手动添加的副卡数量
					}
					if(type==1 && offerRole.memberRoleCd==1){
						num=1;//单产品
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

	//扫描后填充
	var _scaningCallBack=function(terInfo,prodId){
		if("-999"==prodId){//橙分期终端
			$("#terminalNum").val(terInfo);
			if(terInfo!=""){//改变图标
				$("#terminal_call").addClass("dis-none");
				$("#terminal_check").removeClass("dis-none");
			}			
		}
		if("-998"==prodId){//扫码绑定
			var areaId=OrderInfo.staff.soAreaId;
			var areaCode=(areaId+"").substring(0,3);
			var code=terInfo.split("=")[1].split("&")[0];//二维码下载地址和code二合一，要获取唯一编号要通过哦截取,同时areaid也跟在id后面
			var codeAreaId=terInfo.split("=")[2];
			var codeAreaCode=(codeAreaId+"").substring(0,3);
			if(areaCode!=codeAreaCode){//二维码所属地区和app当前登录工号地区不一致，不予绑定
				$.alert("提示","扫描的二维码地区不正确,请重新选择");
				return;
			}
			$("#qrCode").val(code);
		}else{
			$("#uim_input_"+prodId).val(terInfo);
			if(terInfo!=""){//改变图标
				$("#uim_call_"+prodId).addClass("dis-none");
				$("#uim_check_"+prodId).removeClass("dis-none");
			}	
		}	
		
	};
	//扫描后填充
	var _terminalScaningCallBack=function(terInfo,prodId){
		$("#terminal_text").val(terInfo);
		if(terInfo!=""){//改变图标
			$("#terminal_call").addClass("dis-none");
			$("#terminal_check").removeClass("dis-none");
		}		
	}
	
//关闭规则窗口
var _closeRule=function(){
	$("#offer-list").show();
	$("#offer-rule").hide();
	
}

//滚动页面入口
var _scroll = function(scrollObj){
	if(scrollObj && scrollObj.page && scrollObj.page >= 1){ 
		if(scrollObj.page==1){
			_searchPack(1,scrollObj.scroll);
		}else{
			var show_per_page = 10;
			var size = $('#div_all_data').children().length;
			if(size<show_per_page){
				show_per_page = size;
			}
			//$('#ul_offer_list').append($('#div_all_data').children().slice(start_from, end_on)).listview("refresh");
			//alert($('#div_all_data').children().length);
			$('#div_all_data').children().slice(0,show_per_page).appendTo($('#div_offer_list'));
//			$('#ul_offer_list').listview("refresh");
//			$("#ul_offer_list li").off("tap").on("tap",function(){
//				$(this).addClass("pakeagelistlibg").siblings().removeClass("pakeagelistlibg");
//			});
			if(scrollObj.scroll && $.isFunction(scrollObj.scroll)) scrollObj.scroll.apply(this,[]);
		}
	}
};

	return {
		enter:_enter,
		max  :_max,
		boProdAn:_boProdAn,
		searchPack:_searchPack,
		queryApConfig	: _queryApConfig,
		queryData:_queryData,
		buyService:_buyService,
		querySpec:_querySpec,
		scaningCallBack:_scaningCallBack,
		setOfferSpec   :_setOfferSpec,
		showTab3       :_showTab3,
		terminalScaningCallBack:_terminalScaningCallBack,
		closeRule              :_closeRule,
		init			:_init,
		selectOffer		:_selectOffer,
		scroll	: _scroll,
		isCloudOffer  :_isCloudOffer
	};
})();

