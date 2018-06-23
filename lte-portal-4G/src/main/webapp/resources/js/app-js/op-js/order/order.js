CommonUtils.regNamespace("order", "service");

order.service = (function(){
	var _offerprice=""; 
	
	var _newMemberFlag = false;
	var _oldMemberFlag = false;
	var _newAddList = [];
	var maxNum = 0;
	
	//套餐入口-初始化
	var _init=function(){
		
		//定义 1 为prepare页面  2为order-content（填单）页面 3为order-confirm（订单确认和收银台）页面 4为order-print（打印）页面
		OrderInfo.order.step=1;
		OrderInfo.actionFlag = 1;
		//获取初始化查询的条件
		order.service.queryApConfig();
		//初始化主套餐查询
		order.service.searchPack();
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
	var _searchPack = function(flag,scroller){
		var custId = OrderInfo.cust.custId;
		var lxStr=$("#qryStr").val();
		var categoryNodeId = "";//套餐目录
		if(lxStr == "乐享") {
			categoryNodeId = "90132141";
		}else if(lxStr == "积木") {
			categoryNodeId = "90132143";
		}else if(lxStr == "飞") {
			categoryNodeId = "90139849";
		}else if(lxStr == "其他") {
			categoryNodeId = "-9999";
		}
		var params={"categoryNodeId":categoryNodeId,"pnLevelId":"","custId":custId};
		if(flag){
			
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
		var url = contextPath+"/token/app/order/offerSpecList";
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
				var start_from = (scrollObj.page-2) * show_per_page;
				var end_on = start_from + show_per_page;
				//$('#ul_offer_list').append($('#div_all_data').children().slice(start_from, end_on)).listview("refresh");
				$('#div_all_data').children().slice(start_from, end_on).appendTo($('#div_offer_list'));
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
								$("#select_price").append("<option value='"+rowKey+"'>"+rowVal+"</option>");
							}
						}else if(response.data[i].OFFER_INFLUX){
							OFFER_INFLUX = response.data[i].OFFER_INFLUX ;
							for(var j=0;j<OFFER_INFLUX.length;j++){
								var rowKey=OFFER_INFLUX[j].COLUMN_VALUE;
								var rowVal=OFFER_INFLUX[j].COLUMN_VALUE_NAME;
								$("#select_influx").append("<option value='"+rowKey+"'>"+rowVal+"</option>");
								
							}
						}else if(response.data[i].OFFER_INVOICE){
							OFFER_INVOICE = response.data[i].OFFER_INVOICE ;
							for(var j=0;j<OFFER_INVOICE.length;j++){
								var rowKey=OFFER_INVOICE[j].COLUMN_VALUE;
								var rowVal=OFFER_INVOICE[j].COLUMN_VALUE_NAME;
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
	var _buyService = function(specId,price) {
		OrderInfo.oldprodInstInfos = [];
		OrderInfo.oldofferSpec = [];
		OrderInfo.oldoffer = [];
		OrderInfo.oldAddNumList = [];
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
				rule.rule.ruleCheck(boInfos,function(checkData){//业务规则校验通过
					if(ec.util.isObj(checkData)){
						$("#order_prepare").hide();
						var content$ = $("#order").html(checkData).show();
						$.refresh(content$);
					}else{
						order.service.opeSer(param);   
					}
				});
//	        if(rule.rule.ruleCheck(boInfos,'_ruleCheckSer')){  //业务规则校验通过
//	        }
			}
		}
	};
	
	var _loadOfferChangeView = function(param, offerSpec){
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
					if(!is_same_feeType){
						alert("付费类型不一致,无法进行套餐变更。");
						return;
					}
				}
			}
		}
		offerChange.offerChangeView();
		return;
	};
	
	//获取销售品构成，并选择数量
	var _opeSer = function(inParam){	
		//老号码新增内容
		_newAddList = [];
		OrderInfo.oldprodInstInfos = [];
		OrderInfo.oldofferSpec = [];
		OrderInfo.oldoffer = [];
		
		var param = {
			offerSpecId : inParam.specId,
			offerTypeCd : 1,
			partyId: OrderInfo.cust.custId
		};
		var offerSpec = query.offer.queryMainOfferSpec(param); //查询主销售品构成
		if(!offerSpec){
			return;
		}

        if (needCheck(offerSpec)) {
            if (OrderInfo.actionFlag == 2) {  //套餐变更不做校验
                cust.preCheckCertNumberRelQueryOnly(cust.getCustInfo415());//调用一证五号校验接口获取已有的数量
            } else if (!CacheData.isGov(OrderInfo.cust.custId == "-1" ? OrderInfo.boCustIdentities.identidiesTypeCd : OrderInfo.cust.identityCd)) {//政企客户新装不调用一证五号校验
                //一证五号校验
                if (!cust.preCheckCertNumberRel("-1", cust.getCustInfo415())) {
                    return;
                }
            }
        }

        if(OrderInfo.actionFlag == 2){ //套餐变更
        	OrderInfo.offer.initOfferCheckRule(offerSpec);
    		var isOfferChangeAllowed = OrderInfo.offer.getResult();
    		if(isOfferChangeAllowed){
    			_loadOfferChangeView(param, offerSpec);
    		}
		}
		// 销售品后处理
		offerSpecAfterDeal(offerSpec);
		//老号码新增内容
		var areaidflag = order.memberChange.areaidJurisdiction();
		
		var iflag = 0; //判断是否弹出副卡选择框 false为不选择
		var max=0;
		var str="";
		var oldstr="";
		$("#div_content").empty();
		$.each(offerSpec.offerRoles,function(){
			var offerRole = this;
			if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){//副卡接入类产品
				$.each(this.roleObjs,function(){
					var objInstId = offerRole.offerRoleId+"_"+this.objId;//角色id+产品规格id
					if(this.objType == CONST.OBJ_TYPE.PROD){
						if(offerRole.memberRoleCd=="401"){
							_newAddList.push(objInstId);
						}

						//新装二次加载，副卡数量
						if(OrderInfo.provinceInfo.reloadFlag&&OrderInfo.provinceInfo.reloadFlag=="N"){
							this.dfQty = OrderInfo.reloadProdInfo.cardNum;
						}
						max = this.maxQty<0?"不限制":this.maxQty;//主卡的最大数量
						maxNum = max;
						var min = this.minQty;
						
						//新装传入主副卡号码
						if(OrderInfo.newOrderNumInfo.newSubPhoneNum!=""&&offerRole.memberRoleCd=="401"){
							var subPhoneNums = OrderInfo.newOrderNumInfo.newSubPhoneNum.split(",");
							var nums = subPhoneNums.length;
							this.dfQty = nums;
							this.minQty = nums;
							this.maxQty = nums;
							max = nums;
						}
						
						/*if(OrderInfo.newOrderNumInfo.mainPhoneNum!=""&&OrderInfo.newOrderNumInfo.newSubPhoneNum==""&&offerRole.memberRoleCd=="401"){
							this.maxQty = 0;
							max = 0;
						}*/
						
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
						$("#div_content").append(str);
						iflag++;
						return false;
					}
				});
			}
			
			if(offerRole.memberRoleCd=="401" && areaidflag!="" && areaidflag.net_vice_card=="0"){
				$.each(this.roleObjs,function(){
					if(this.objType == CONST.OBJ_TYPE.PROD){					
						var max = this.maxQty<0?"不限制":this.maxQty;//主卡的最大数量
						var min = this.minQty;
						//获取老用户纳入号码
						var oldSubPhoneNums=OrderInfo.oldSubPhoneNum.oldSubPhoneNum;
						//如果最大个数为0，不展示老用户号码输入框
						if(this.maxQty!=0){
							var oldSubPhoneNums="";
							
							if(OrderInfo.provinceInfo.reloadFlag && OrderInfo.provinceInfo.reloadFlag=="N"){
								var result=OrderInfo.reloadOrderInfo;
								
								var busiOrders = result.orderList.custOrderList[0].busiOrder;
								
								$.each(busiOrders,function(index,busiOrder){
									//老用户纳入
									if(busiOrder.boActionType.actionClassCd==1200 && busiOrder.boActionType.boActionTypeCd=="S2" && busiOrder.busiObj.offerTypeCd=="1"){
										var oldnum=busiOrder.busiObj.accessNumber;
										OrderInfo.oldAddNumList.push({"accNbr":oldnum});
										oldSubPhoneNums+=oldnum+",";
									}
								});
							}else{
								oldSubPhoneNums=OrderInfo.oldSubPhoneNum.oldSubPhoneNum;
							}
							
							oldstr 
								+="<div class='form-group'>"
									+"<label >已有移动号码:"+min+"-"+max+"(张)</label>"
									+"<div class='input-group input-group-lg' id='oldnum_1' name='oldnbr'>"
										+"<input type='text'  class='form-control' id='oldphonenum_1'>"
										+"<span class='input-group-btn'>"
											+"<button class='btn btn-default' type='button' onclick='order.memberChange.addNum("+max+");'> + </button>"
										+"</span> " 
									+"</div>";
							if("ON" == offerChange.queryPortalProperties("ADD_OLD_USER_MOD_ACCT_" + OrderInfo.staff.soAreaId.substring(0,3)))
									oldstr += "<lable>注意：您纳入加装的移动电话纳入后将统一使用主卡账户！</lable>";
							oldstr += "</div>";
							$("#div_content").append(oldstr);
							
							if(oldSubPhoneNums!=null && oldSubPhoneNums!=""){
								var oldSubPhoneNum=oldSubPhoneNums.split(",");
								
								if(oldSubPhoneNum!=null && oldSubPhoneNum.length>0){
									for(var i=0;i<oldSubPhoneNum.length;i++){
										if(i==0){
											$("#oldphonenum_1").val(oldSubPhoneNum[i]);
										}else{
											//添加输入框
											order.memberChange.addNum(max);
											$("#oldphonenum_"+(i+1)).val(oldSubPhoneNum[i]);
										}
									}
								}
							}
						}
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
		if(iflag >0){
			//$("#div_content").append(str);
			$("#vice_modal").modal("show");
			//若是新装二次加载，则调过副卡选择框
			if(OrderInfo.provinceInfo.reloadFlag&&OrderInfo.provinceInfo.reloadFlag=="N"){
				order.service.confirm(param);
			}else{
				$("#btn_modal").off("click").on("click",function(){
					order.service.confirm(param);
				});
			}
		}else{
			if(!_setOfferSpec(1)){
				$.alert("错误提示","请选择一个接入产品");
				return;
			}
			if(OrderInfo.actionFlag!=14){ //合约套餐不初始化
				order.main.buildMainView(param);	
			}
		}
	};

	var offerSpecAfterDeal = function(offerSpec){
		$.each(offerSpec.offerRoles, function () {
			$.each(this.roleObjs, function () {
				if (this.objType == CONST.OBJ_TYPE.PROD && this.objId == CONST.PROD_SPEC.PROD_CLOUD_OFFER) {
					order.phoneNumber.getVirtualNum();
				}
			});
		});
	}
	
	//选择完主套餐构成后确认
	var _confirm = function(param){
		order.memberChange.viceCartNum = 0;
		
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			this.prodInsts = [];
		});
		
		//新增内容
		var newnum = 0;
		$.each(_newAddList,function(){
			newnum=newnum+Number($("#"+this).val());
		});
		
		var oldnum = 0;
		$("#div_content").find("div[name='oldnbr']").each(function(){
			//var num = $.trim($(this).children("td").eq(1).children("input").val());
			var num = $.trim($(this).children("input").val());
			if(ec.util.isObj(num)){
				oldnum++;
			}
		});
		
		if(!_setOfferSpec()){
			$.alert("错误提示","请选择一个接入产品");
			return;
		}
		
		//新装老用户纳入改造[s]
		if(newnum>0){
			order.service.newMemberFlag = true;
			param.newnum = newnum;
		}else{
			order.service.newMemberFlag = false;
		}
		
		if(oldnum>0){
			order.service.oldMemberFlag = true;
			
			if(!order.memberChange.queryofferinfo()){
				return;
			}
			
			param.oldprodInstInfos = OrderInfo.oldprodInstInfos;
			param.oldofferSpec = OrderInfo.oldofferSpec;
			param.oldoffer = OrderInfo.oldoffer;
			param.oldnum = oldnum;
		}else{
			order.service.oldMemberFlag = false;
		}
		
		if(parseInt(newnum)+parseInt(order.memberChange.viceCartNum)>maxNum){
			$.alert("提示","加装数量已经超过能加装的最大数量【"+maxNum+"】---!");
			return;
		}
		//e
		if((parseInt(newnum)+parseInt(ec.util.mapGet(OrderInfo.oneCardFiveNO.usedNum,cust.getCustInfo415Flag(cust.getCustInfo415()))))>5){
            $.alert("提示","此用户下已经有"+ec.util.mapGet(OrderInfo.oneCardFiveNO.usedNum,cust.getCustInfo415Flag(cust.getCustInfo415()))+"个号码，此次业务已经超过工信部要求支撑全国实名制一证五卡验证！");
            return;
		}
		if(OrderInfo.actionFlag!=14){ //合约套餐不初始化
			order.main.buildMainView(param);	
		}else{
			mktRes.terminal.newnum = newnum;
			mktRes.terminal.oldnum = oldnum;
		}
		
		$("#vice_modal").modal("hide");
	};
	
	//根据页面选择成员数量保存销售品规格构成 offerType为1是单产品
	var _setOfferSpec = function(offerType){
		var k = -1;
		var flag = false;  //判断是否选接入产品
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			var offerRole = this;
			
			//老用户号码
			if(offerRole.prodInsts==undefined){
				offerRole.prodInsts = [];
			}
			
			$.each(this.roleObjs,function(){
				if(this.objType== CONST.OBJ_TYPE.PROD){  //接入类产品
					var num = 0;  //接入类产品数量选择
					if(offerType==1){  //单产品
						num = 1;
					}else if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD && OrderInfo.actionFlag!=2){//主卡的接入类产品数量
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
	
	//第三步返回到第二步,返回按钮
	var _backStepTwo=function(){
		$("#order-content").show();
		$("#order-dealer").hide();
	};
	
	//订单取消时，释放已预占资源的入口标识。0：初始化状态，1：购机或选号入口，2：套餐入口
	var _releaseFlag = 0;
	//购机和选号入口的预占号码信息缓存
	var _boProdAn = {};
	var _offerDialog=function(subPage){
		var param={};
		var url=contextPath+"/order/prodoffer/prepare?subPage="+subPage;
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
				var content$=$("#offerspecContent");
				content$.html(response.data);
				order.prepare.backToInit();
				_initSpec();
				order.prodOffer.queryApConfig();
				order.service.searchPack();
				$("#chooseofferspecclose").click(function(){
					_closeChooseDialog();
				});
				easyDialog.open({
					container : 'chooseofferspec'
				});
			}
		});	
	};
	var _closeChooseDialog = function() {
		if (!$("#chooseofferspec").is(":hidden")){
			easyDialog.close();
		}
	};
	
	//扫描后填充
	var _scaningCallBack=function(terInfo,prodId){
		$("#uim_txt_"+prodId).val(terInfo);
	};
	
	var _choosedOffer=function(id,specId,price,subpage,specName){
		var param={"offerSpecId":specId};
		var response = $.callServiceAsJson(contextPath+"/order/queryOfferSpec",param);
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
	};

    /**
     * 判断某个销售品是否需要调用一证五号校验，如果为以下三种，需求调用一证五号校验，其它情况都不调用校验
     * 235010000 移动电话（仅含本地语音）
     * 280000000 天翼宽带-无线数据卡
     * 280000025 智机通
     * @param offerSpec 销售品实例数据
     */
    function needCheck(offerSpec) {
        var needCheck = false;
        OrderInfo.needCheckFlag = "N";
        if (ec.util.isObj(offerSpec) && ec.util.isObj(offerSpec.offerRoles) && offerSpec.offerRoles.length > 0) {
            $.each(offerSpec.offerRoles, function () {
                if (ec.util.isObj(this.roleObjs) && this.roleObjs.length > 0) {
                    $.each(this.roleObjs, function () {
                        if (this.objId == "235010000" || this.objId == "280000000" || this.objId == "280000025") {
                            needCheck = true;
                            OrderInfo.needCheckFlag = "Y";
                        }
                    })
                }
            });
        }
        return needCheck;
    }

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
		offerDialog:_offerDialog,
		choosedOffer:_choosedOffer,
		confirm		: _confirm,
		oldMemberFlag:_oldMemberFlag,
		newMemberFlag:_newMemberFlag,
		backStepTwo:_backStepTwo
	};
})();
