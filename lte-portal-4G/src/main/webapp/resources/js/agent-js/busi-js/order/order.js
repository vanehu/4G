CommonUtils.regNamespace("order", "service");

order.service = (function(){
	var _offerprice=""; 
	var _subPage=""; 
	//套餐入口-初始化
	var _init=function(){
		
		//定义 1 为prepare页面  2为order-content（填单）页面 3为order-confirm（订单确认和收银台）页面 4为order-print（打印）页面
		OrderInfo.order.step=1;
		OrderInfo.busitypeflag=1;
		OrderInfo.actionFlag = 1;
		//获取初始化查询的条件
		order.service.queryApConfig();
		//初始化主套餐查询
		order.service.searchPack(_subPage);
	};
	
	var current="";
	//列表导航切换
	var _tabChange=function(obj){
		if(current!=obj){
			var btn=$(".btn-group button");
			$.each(btn,function(){
				if(obj==this){
					$("#qryStr").val($(this).attr("value"));
					_searchPack();
					current=obj;
					$(this).removeClass("btn btn-default");
					$(this).removeClass("btn btn-default active");
					$(this).addClass("btn btn-default btn-group-active");
				}else{
					$(this).removeClass("btn btn-default active");
					$(this).removeClass("btn btn-default btn-group-active");
					$(this).addClass("btn btn-default");
				}
			});
		}
	};
	
	//主套餐查询
	var _searchPack = function(flag,scroller,subPage){
		var custId = OrderInfo.cust.custId;
		var qryStr=$("#qryStr").val();
//		var params={"qryStr":qryStr,"pnLevelId":"","custId":custId};
		var params={"subPage":"","qryStr":qryStr,"pnLevelId":"","custId":custId,"PageSize":10};
		if(flag){
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
		}
		_queryData(params,flag,scroller);
		
	};
	var _queryData = function(params,flag,scroller) {
		if(OrderInfo.actionFlag==2){
			var offerSpecId = order.prodModify.choosedProdInfo.prodOfferId;
			if(offerSpecId!=undefined){
				params.changeGradeProdOfferId = offerSpecId;
			}
			var prodSpecIds='';
			$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
				if(this.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
					if(this.objId!=undefined){
						prodSpecIds=prodSpecIds+","+this.objId;
					}
				}
			});
			if(prodSpecIds!=''){
				prodSpecIds=prodSpecIds.substring(1, prodSpecIds.length);
				params.prodSpecId=prodSpecIds;
			}
			params.actionFlag=2;
		}else if(CONST.getAppDesc()==0){
			params.prodOfferFlag = "4G";
		}
		params.prodId = flag;
		var url = contextPath+"/agent/order/offerSpecList";
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
//				$('#ul_offer_list').listview("refresh");
//				$("#ul_offer_list li").off("tap").on("tap",function(){
//					$(this).addClass("pakeagelistlibg").siblings().removeClass("pakeagelistlibg");
//				});
				if(scrollObj.scroll && $.isFunction(scrollObj.scroll)) scrollObj.scroll.apply(this,[]);
			}
		}
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
				}
			}
		});
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
	
	//订购销售品
	var _buyService = function(specId,price,offerSpecName) {
		var custId = OrderInfo.cust.custId;
		offerprice = price;
//		if(OrderInfo.cust==undefined || custId==undefined || custId==""){
//			$.alert("提示","在订购套餐之前请先进行客户定位！");
//		}else{
			var param = {
					"price":price,
					"specId" : specId,
					"custId" : OrderInfo.cust.custId,
					"areaId" : OrderInfo.staff.soAreaId
			};
			if(OrderInfo.actionFlag == 2){  //套餐变更不做校验
				order.service.opeSer(param);   
			}else {  //新装
				var boInfos = [{
					boActionTypeCd: "S1",//动作类型
					instId : "",
					specId : specId //产品（销售品）规格ID
				}];
//			var url = contextPath+"/order/sign/gotoPrint";
//			$.ecOverlay("<strong>正在校验,请稍等会儿...</strong>");
//			var paramtmp={};
//			$.callServiceAsHtml(url,paramtmp);
//				rule.rule.ruleCheck(boInfos,function(checkData){//业务规则校验通过
//					if(ec.util.isObj(checkData)){
//						$("#offer_prepare").hide();
//						var content$ = $("#order").html(checkData).show();
//						$.refresh(content$);
//					}else{
						$("#offer_prepare").hide();
						$("#pakeage").hide();
						$("#order-content").show();
						$("#txt_offer_-1").val(offerSpecName);
						order.service.opeSer(param);   
//					}
//				});
//	        if(rule.rule.ruleCheck(boInfos,'_ruleCheckSer')){  //业务规则校验通过
//	        }
//			}
		}
	};
	
	//获取销售品构成，获取数量
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
			var url=contextPath+"/agent/order/queryFeeType";
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
						if(!is_same_feeType){
							$.alert("提示","付费类型不一致,无法进行套餐变更。");
							return;
						}
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
//						str+="<div class='form-group'>"
//							+"<label for='"+objInstId+"'>副卡数量:"+this.minQty+"-"+max+"(张)</label>"
//							+"<div class='input-group input-group-lg'>"
//							+"<span class='input-group-btn'>"
//							+"<button class='btn btn-default' type='button' onclick=order.service.subNum('"+objInstId+"',"+this.minQty+")> - </button>"
//							+"</span>"
//							+"<input type='text'  readonly='readonly' class='form-control' id='"+objInstId+"' value='"+this.dfQty+"'>"
//							+"<span class='input-group-btn'>"
//							+"<button class='btn btn-default' type='button' onclick=order.service.addNum('"+objInstId+"',"+this.maxQty+",'"+offerRole.parentOfferRoleId+"')> + </button>"
//							+"</span> </div>"
//							+"</div>";
//						iflag++;
						return false;
					}
				});
			}
		});
		$("#max").text("0-"+max);
		_setOfferSpec(max);
		order.main.buildMainView(param);
		//页面初始化参数
//		var param = {
//			"boActionTypeCd" : "S1" ,
//			"boActionTypeName" : "订购",
//			"offerSpec" : offerSpec,
//			"actionFlag" :1,
//			"type" : 1
//		};
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
	var _setOfferSpec = function(max){
		var k = -1;
		var flag = false;  //判断是否选接入产品
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			var offerRole = this;
			offerRole.prodInsts = []; //角色对象实例
			$.each(this.roleObjs,function(){
				if(this.objType== CONST.OBJ_TYPE.PROD){  //接入类产品
					var num = 0;  //接入类产品数量选择
					if((offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD  ||  offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.COMMON_MEMBER)&&OrderInfo.actionFlag!=6){//主卡的接入类产品数量
						num = 1;
					}else{ //多成员销售品
//						num = max;  //接入类产品数量选择
						num = 0;//先不加装副卡
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
					if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD){
						offerRole.selQty = num;
					}else{
						if(max==undefined || max==""){
							max = 0;
						}
						offerRole.selQty = max;
						order.main.fkmaxCard = max;
						order.main.fkcardIndex = -2;
					}
				}else{ //功能类产品
					if(this.minQty==0){
						this.dfQty = 1;
					}
				}
			});
		});
		return flag;
	};
	
	//添加一个角色
	var _addNum = function(id,max,parentOfferRoleId){
		if(ec.util.isObj(parentOfferRoleId)){
			var viceNum = 0;
			var offerRoles = [];
			var parentMaxQty = 0;
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				var offerRole = this;
				$.each(this.roleObjs,function(){
					if(this.objType == CONST.OBJ_TYPE.PROD){
						var objInstId = offerRole.offerRoleId+"_"+this.objId;//角色id+产品规格id
						if(ec.util.isObj(offerRole.parentOfferRoleId) && parentOfferRoleId==offerRole.parentOfferRoleId){
							offerRoles.push(offerRole);
							parentMaxQty = offerRole.parentMaxQty;
							viceNum += Number($("#"+objInstId).val());
						}
					}
				});
			});
			if(parentMaxQty>0){
				if(viceNum >= parentMaxQty){
					if(ec.util.isArray(offerRoles)){
						var str = "【";
						for ( var i = 0; i < offerRoles.length; i++) {
							var offerRole = offerRoles[i];
							str += offerRole.offerRoleName+",";
						}
						str = str.substr(0, str.lastIndexOf(','));
						str += "】角色成员数量总和不能超过"+parentMaxQty;
						$.alert("规则限制",str);
						return;
					}
				}
			}
		}
		var num = Number($("#"+id).val());
		if(max<0){
			num+=1;
			$("#"+id).val(num);
		}else{
			if(num<max){
				num+=1;
				$("#"+id).val(num);
			}
		}		
	};
	
	var _subNum = function(id,min){
		var num = Number($("#"+id).val());
		if(num>min){
			num-=1;
			$("#"+id).val(num);
		}		
	};
	//返回按钮
	var _btnBack=function(){
		$("#order_prepare").show();
		$("#order").hide();
	};
	
	//订单取消时，释放已预占资源的入口标识。0：初始化状态，1：购机或选号入口，2：套餐入口
	var _releaseFlag = 0;
	//购机和选号入口的预占号码信息缓存
	var _boProdAn = {};
	var _offePre=function(subPage){
		SoOrder.initFillPage();
		var param={};
		var url=contextPath+"/agent/order/offer/prepare?subPage="+subPage;
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
				$("#order-content").hide();
				var content$=$("#offer-prepare");
				content$.html(response.data).show();
			}
		});	
	};
	var _closeChooseDialog = function() {
//		if (!$("#chooseofferspec").is(":hidden")){
//			easyDialog.close();
//		}
		$("#offerspecContent").hide();
		$("#member_prepare").show();
	};
	
	//扫描后填充
	var _scaningCallBack=function(terInfo,prodId){
		$("#uim_txt_"+prodId).val(terInfo);
		$("#tip_"+prodId).text("");
	};
	
	var _choosedOffer=function(id,specId,price,subpage,specName){
		var param={"offerSpecId":specId};
		$.callServiceAsJson(contextPath+"/app/order/queryOfferSpec",param,{
			"before":function(){
				$.ecOverlay("<strong>正在加载中,请稍等会儿....</strong>");
			},
			"done":function(response){
				$.unecOverlay();
				if (response.code==0) {
					if(response.data){
						var offerRoleId="";
						var prodOfferSpec=response.data.offerSpec;
						if (prodOfferSpec && prodOfferSpec.offerRoles) {
							var offerRoles = prodOfferSpec.offerRoles;
							for (var i=0;i<offerRoles.length;i++){
								if (offerRoles[i].memberRoleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD
										|| offerRoles[i].memberRoleCd == CONST.MEMBER_ROLE_CD.VICE_CARD) {
									if(offerRoles[i].memberRoleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD){
										offerRoleId=offerRoles[i].offerRoleId;
										break;
									}
								}else{
									offerRoleId=offerRoles[i].offerRoleId;
									break;
								}
							}
						}
						if(offerRoleId!=""){
							_closeChooseDialog();
							var prodId=$("#li_"+subpage).attr("objinstid");
							var accessnumber=$("#li_"+subpage).attr("accessnumber");
							for ( var i = 0; i < OrderInfo.viceOfferSpec.length; i++) {//清除旧数据
								var viceOfferSpec = OrderInfo.viceOfferSpec[i];
								if(prodId == viceOfferSpec.prodId){
									OrderInfo.viceOfferSpec.splice(i,1);
									break;
								}
							}
							prodOfferSpec.prodId=prodId;
							prodOfferSpec.accessnumber=accessnumber;
							OrderInfo.viceOfferSpec.push(prodOfferSpec);
							order.prodModify.chooseOfferForMember(specId,subpage,specName,offerRoleId);
						}else{
							$.alert("提示","无法选择套餐，套餐规格查询失败！");
						}
					}
				}else if(response.code == -2){
					$.alertM(response.data);
				}else{
					$.alert("提示","套餐详细加载失败，请稍后再试！");
				}
			},
			"always":function(){
				$.unecOverlay();
			}
			}
		);
	};
	return {
		btnBack					:			_btnBack,
		buyService 				:			_buyService,
		queryApConfig			:			_queryApConfig,
		queryData				:			_queryData,
		init					:			_init,
		opeSer 					:			_opeSer,
		scaningCallBack			:			_scaningCallBack,
		scroll					:			_scroll,
		searchPack				:			_searchPack,
		setOfferSpec			:			_setOfferSpec,
		tabChange				:			_tabChange,
		queryPackForTerm:_queryPackForTerm,
		addNum:_addNum,
		subNum:_subNum,
		releaseFlag:_releaseFlag,
		boProdAn:_boProdAn,
		offerprice:_offerprice,
		choosedOffer:_choosedOffer,
		confirm		: _confirm,
		offePre     : _offePre
	};
})();
