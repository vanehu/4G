/**
 * 销售品变更
 * 
 * @author wukfsearchPack
 * date 2013-9-22
 */
CommonUtils.regNamespace("offerChangeNew");

offerChangeNew = (function() {
	var _newAddList = [];
	//初始化套餐变更页面
	var _init = function (){
	   
		OrderInfo.order.step=1;
		OrderInfo.actionFlag = 2;
		OrderInfo.busitypeflag=2;
		if(OrderInfo.provinceInfo.mergeFlag=="0"){
			if(!query.offer.setOffer()){ //必须先保存销售品实例构成，加载实例到缓存要使用
				return ;
			}
		}
		//获取初始化查询的条件
		order.service.queryApConfig();
		//初始化主套餐查询
		
		
		//if(OrderInfo.provinceInfo.prodOfferId!)
	    //有传主套餐id
		//判断是否是二次加载
		
		//进行全量查询[w],旧-在代码中全量，新-在JS中全量
		query.offer.loadInst();
		
		offerChangeNew.searchPack();
	};
	//主套餐查询
	var _searchPack = function(flag,scroller){
		var custId = OrderInfo.cust.custId;
		var qryStr=$("#qryStr").val();
		var params={"qryStr":qryStr,"pnLevelId":"","custId":custId};
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
			var influxVal = $("#select_invoice").val();
			if(ec.util.isObj(influxVal)){
				var influxArr = influxVal.split("-");
				if(influxArr[0]!=null&&influxArr[0]!=""){
					params.INFLUXMin = influxArr[0]*1024 ;
				}
				if(influxArr[1]!=null&&influxArr[1]!=""){
					params.INFLUXMax = influxArr[1]*1024 ;
				}
			}
			var invoiceVal = $("#select_influx").val();
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
		offerChangeNew.queryData(params,flag,scroller);
		
	};
	
	var _queryData = function(params,flag,scroller) {
		//alert("_queryData");
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
		var url="";
		
		if(OrderInfo.provinceInfo.reloadFlag=="N"){
			//alert("二次加载");
			url = contextPath+"/token/app/order/offerSpecListSub";
		}else{
			if(OrderInfo.provinceInfo.prodOfferId!=null && OrderInfo.provinceInfo.prodOfferId!="" && OrderInfo.provinceInfo.prodOfferId!="" && OrderInfo.provinceInfo.prodOfferId!="undefined"){
				//alert("带主套餐id");
				url = contextPath+"/token/app/order/offerSpecListSub";
			}else{
				//alert("不带主套餐id");
				url = contextPath+"/token/app/order/offerSpecList";
			}
		}
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
				$.unecOverlay();
				var content$ = $("#offer-list");
				content$.html(response.data);
				if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
//				$.refresh(content$);
			    
				//判断是否二次加载
				//alert(OrderInfo.provinceInfo.reloadFlag);
			
				if(OrderInfo.provinceInfo.reloadFlag=="N"){
					//获取数据里的主套餐id
					
					var offid="";

					//获取主套餐ID，原先获取方法错误
					$.each(OrderInfo.reloadOrderInfo.orderList.custOrderList[0].busiOrder,function(){
						if(this.boActionType.actionClassCd=="1200" && this.boActionType.boActionTypeCd=="S1" && this.busiObj.offerTypeCd=="1"){
							offid=this.busiObj.objId;
						}
					});
					
					offerChangeNew.buyService(offid,"");
				}else{
					if(OrderInfo.provinceInfo.prodOfferId!=null && OrderInfo.provinceInfo.prodOfferId!=""){
						order.service.buyService(OrderInfo.provinceInfo.prodOfferId,"");
					}
					
				}	
			},
			fail:function(response){
				$.unecOverlay();
				$("#search-modal").modal('hide');
				$.alert("提示","套餐加载失败，请稍后再试！");
			}
		});
	};
	
	//订购销售品
	var _buyService = function(specId,price) {
		
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
				offerChangeNew.opeSer(param);
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
						if(!is_same_feeType){
							$.alert("提示","付费类型不一致,无法进行套餐变更。");
							return;
						}
					}
				}
			}
			offerChangeNew.offerChangeView();
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
		if(iflag >0){
			$("#div_content").append(str);
			$("#vice_modal").modal("show");
			$("#btn_modal").off("click").on("click",function(){
				order.service.confirm(param);
			});
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
	
	
	//套餐变更页面显示
	var str = "";
	var _offerChangeView=function(){
		_newAddList = [];
		var oldLen = 0 ;
		$.each(OrderInfo.offer.offerMemberInfos,function(){
			if(this.objType==2){
				oldLen++;
			}
		});
		var memberNum = 1; //判断是否多成员 1 单成员2多成员
		var viceNum = 0;
		if(oldLen>1){ //多成员角色，目前只支持主副卡
			memberNum = 2;
		}
		
		//把旧套餐的产品自动匹配到新套餐中
		if(!_setChangeOfferSpec(memberNum,viceNum)){  
			return;
		};
		
		//4g系统需要
		if(CONST.getAppDesc()==0){ 
			//老套餐是3G，新套餐是4G
			if(order.prodModify.choosedProdInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){
				if(!offerChange.checkOrder()){ //省内校验单
					return;
				}
			}
			//根据UIM类型，设置产品是3G还是4G，并且保存旧卡
			if(!prod.uim.setProdUim()){ 
				return ;
			}
		}
		
		if(OrderInfo.actionFlag == 2){ //套餐变更
			var custOrderList = OrderInfo.reloadOrderInfo.orderList.custOrderList[0].busiOrder;
			var newsplitflag = 1;
			var oldsplitflag = 1;
			order.memberChange.newSubPhoneNum="";
			order.memberChange.oldSubPhoneNum="";
			$.each(custOrderList,function(){
				if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="1"){//纳入新成员
					order.memberChange.newmembers.flag = true;
					if(newsplitflag==1){
						order.memberChange.newSubPhoneNum += this.busiObj.accessNumber;
						newsplitflag++;
					}else{
						order.memberChange.newSubPhoneNum += ","+this.busiObj.accessNumber;
					}
				}else if(this.boActionType.actionClassCd=="1200" && this.boActionType.boActionTypeCd=="S2"){//纳入老成员
					if(this.busiObj.isComp!=undefined){
						order.memberChange.oldmembers.flag = true;
						if(oldsplitflag==1){
							order.memberChange.oldSubPhoneNum += this.busiObj.accessNumber;
							oldsplitflag++;
						}else{
							order.memberChange.oldSubPhoneNum += ","+this.busiObj.accessNumber;
						}
						var objInstId = this.data.ooRoles[0].objInstId;
						var instId = this.busiObj.instId;
						order.memberChange.oldmembers.objInstId.push({"instId":instId,"objInstId":objInstId});
					}
				}
			});
			var newSubPhoneNumsize=[];
			var oldSubPhoneNumsize=[];
			if(order.memberChange.newSubPhoneNum!=""){
				newSubPhoneNumsize = order.memberChange.newSubPhoneNum.split(",");
			}
			if(order.memberChange.oldSubPhoneNum!=""){
				oldSubPhoneNumsize = order.memberChange.oldSubPhoneNum.split(",");
			}
			var max = 0;
			str = "";
			$("#div_content").empty();
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				if(this.memberRoleCd=="401"){
					var offerRole = this;
					$.each(this.roleObjs,function(){
						var objInstId = offerRole.offerRoleId+"_"+this.objId;//角色id+产品规格id
						if(this.objType == CONST.OBJ_TYPE.PROD){
							_newAddList.push(objInstId);
							if(offerRole.minQty == 0){ //加装角色
								this.minQty = 0;
								this.dfQty = 0;
							}
							var membernum = 0;
							$.each(OrderInfo.offer.offerMemberInfos,function(){
								if(this.roleCd=="401"){
									membernum++;
								}
							})
							max = this.maxQty<0?"不限制":this.maxQty-membernum;
							if(max<0){
								max = 0;
							}
							maxNum = max;
							str+="<div class='form-group' id='memberTable'>"
								+"<label for='"+objInstId+"'>副卡数量:"+this.minQty+"-"+max+"(张)</label>"
								+"<div class='input-group input-group-lg'>"
								+"<label>"+this.objName+"</label>"
								+"<span class='input-group-btn'>"
								+"<button class='btn btn-default' type='button' onclick=order.service.subNum('"+objInstId+"',"+this.minQty+")> - </button>"
								+"</span>"
								+"<input type='text' style='margin-top:10px;' readonly='readonly' class='form-control' id='"+objInstId+"' value='"+newSubPhoneNumsize.length+"'>"
								+"<span class='input-group-btn'>"
								+"<button class='btn btn-default' type='button' onclick=order.service.addNum('"+objInstId+"',"+this.maxQty+",'"+offerRole.parentOfferRoleId+"')> + </button>"
								+"</span> </div>"
								if(max>0){
									for(var k=0;k<oldSubPhoneNumsize.length;k++){
										if(k==0){
											str+="<div class='input-group input-group-lg'>"
												+"<label style='width:170px;'>已有移动电话</label>"
												+"<span class='input-group-btn' style='width:40px'>"
												+"</span>"
												+"<input type='text' style='margin-top:10px;' class='form-control' name='oldphonenum' value='"+oldSubPhoneNumsize[k]+"'>"
												+"<span class='input-group-btn'>"
												+"<button class='btn btn-default' type='button' onclick='addNum("+max+",\"\")';> + </button>"
												+"</span> </div>"
										}else{
											addNum(max,oldSubPhoneNumsize[k]);
										}
									}
								}
							str+="</div>";
						}
					});
				}
			});
			$("#div_content").append(str);
			$("#vice_modal").modal("show");
			offerChangeConfirm();
		}
	};
	
	var idnum = 1;
	var addNum = function(max,addnum){
		var lis = $("input[name='oldphonenum']");
		lis = lis.length+1;
		if(lis>max){
			return;
		}
		idnum++;
		str += "<div class='input-group input-group-lg' id='oldnum_"+idnum+"'>"
			+"<label style='width:170px;'>已有移动电话</label>"
			+"<span class='input-group-btn' style='width:40px'>"
			+"</span>"
			+"<input type='text' style='margin-top:10px;' class='form-control' name='oldphonenum' value='"+addnum+"'>"
			+"<span class='input-group-btn'>"
			+"<button class='btn btn-default' type='button' onclick=order.memberChange.delNum(\"oldnum_"+idnum+"\")> - </button>"
			+"</span> </div>"
//		$("#memberTable").append(str);
	};
	
	function offerChangeConfirm(){
		var newnum = 0;
		var oldnum = 0;
		order.memberChange.viceCartNum = 0;
		var delprodInsts = [];
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			if(this.memberRoleCd=="401"){
				if(this.prodInsts!=undefined){
					var oldprodInsts = this.prodInsts;
					for(var i=0;i<this.prodInsts.length;i++){
						var prodInstId = '"'+this.prodInsts[i].prodInstId+'"';
						if(prodInstId.indexOf("-")!=-1){
							delprodInsts.push(this.prodInsts[i]);
						}
					}
					$.each(delprodInsts,function(){
						var delprodInstId = this.prodInstId;
						$.each(oldprodInsts,function(j){
							if(this.prodInstId = delprodInstId){
								oldprodInsts.splice(j,1);
							}
						});
					});
				}
			}
		});
		$.each(_newAddList,function(){
			newnum=newnum+Number($("#"+this).val());
		});
		$("input[name='oldphonenum']").each(function(){
			var num = $.trim($(this).val());
			if(ec.util.isObj(num)){
				oldnum++;
			}
		});
		if(newnum>0){
			offerChange.newMemberFlag = true;
			order.service.setOfferSpec();
		}
		if(oldnum>0){
			offerChange.oldMemberFlag = true;
			if(!order.memberChange.queryofferinfo()){
				return;
			}
		}
		if(parseInt(newnum)+parseInt(order.memberChange.viceCartNum)>maxNum){
			$.alert("提示","加装数量已经超过能加装的最大数量【"+maxNum+"】!");
			return;
		}
		//初始化填单页面
		var prodInfo = order.prodModify.choosedProdInfo;
		var param = {
			boActionTypeCd : "S2" ,
			boActionTypeName : "套餐变更",
			actionFlag :"2",
			offerSpec : OrderInfo.offerSpec,
			prodId : prodInfo.prodInstId,
			offerMembers : OrderInfo.offer.offerMemberInfos,
			oldOfferSpecName : prodInfo.prodOfferName,
			prodClass : prodInfo.prodClass,
			appDesc : CONST.getAppDesc(),
			areaId : order.prodModify.choosedProdInfo.areaId,
			newnum : parseInt(newnum),
			oldnum : parseInt(oldnum),
			feeTypeMain:prodInfo.feeType
		};
		if(oldnum>0){
			param.oldprodInstInfos = OrderInfo.oldprodInstInfos;
			param.oldofferSpec = OrderInfo.oldofferSpec;
			param.oldoffer = OrderInfo.oldoffer;
		}
		offerChangeNew.buildMainView(param);
		$("#vice_modal").modal("hide");
	}
	
	var _buildMainView = function(param) {
		$.callServiceAsHtml(contextPath+"/token/app/order/mainSub",param,{
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
						offerChangeNew.fillOfferChange(response,param);
				    }, 800);
				}else {
					$.unecOverlay();
					_callBackBuildView(response,param);
				}
			}
		});
	};
	
	//校验uim卡
	//uim卡号校验
	var _checkUim = function(prodId,bo2Coupons){
	
		var phoneNumber = OrderInfo.getAccessNumber(prodId);
		var offerId = "-1"; //新装默认，主销售品ID
		/*
		if(OrderInfo.actionFlag==1||OrderInfo.actionFlag==6||OrderInfo.actionFlag==14){ //新装需要选号
			if(phoneNumber==''){
				$.alert("提示","校验UIM卡前请先选号!");
				return false;
			}
		}
		*/
		if(OrderInfo.actionFlag==3 || OrderInfo.actionFlag==22 || OrderInfo.actionFlag==23 || OrderInfo.actionFlag==6 ){ //可选包变更，补换卡，加装副卡
			if(ec.util.isArray(OrderInfo.oldprodInstInfos)){//判断是否是纳入老用户
				$.each(OrderInfo.oldprodInstInfos,function(){
					if(this.prodInstId==prodId){
						offerId = this.mainProdOfferInstInfos[0].prodOfferInstId;
					}
				});
			}else{
				offerId = order.prodModify.choosedProdInfo.prodOfferInstId;
			}
		}
		var cardNo =$.trim($("#uim_txt_"+prodId).val());
		/*
		if(cardNo==undefined || cardNo==''){
			$.alert("提示","UIM卡不能为空!");
			return false;
		}
		*/
		var inParam = {
			"instCode" : cardNo,
			"phoneNum" : phoneNumber,
			"areaId"   : OrderInfo.getProdAreaId(prodId)
		};

		var prodSpecId = OrderInfo.getProdSpecId(prodId);
		var mktResCd="";
		if(CONST.getAppDesc()==0){
			if(getIsMIFICheck(prodId)){
				mktResCd =prod.uim.getMktResCd(CONST.PROD_SPEC_ID.MIFI_ID);
			}else{
				mktResCd = prod.uim.getMktResCd(prodSpecId);
			}
			if(ec.util.isObj(mktResCd)){
//				inParam.mktResCd = mktResCd;
			}else{
				//$.alert("提示","查询卡类型失败！");
				return;
			}
			if(OrderInfo.actionFlag==22 || OrderInfo.actionFlag==23){ //补换卡和异地补换卡
				if(prod.changeUim.is4GProdInst){ //如果已办理4G业务，则校验uim卡是否是4G卡
					inParam.onlyLTE = "1";
				}
			}
		}
		//var data = query.prod.checkUim(inParam);//校验uim卡
		
		
		//根据uim返回数据组织物品节点
		var couponNum = bo2Coupons.couponNum;//data.baseInfo.qty ;
		if(couponNum==undefined||couponNum==null){
			couponNum = 1 ;
		}
		var coupon = {
			couponUsageTypeCd : "3", //物品使用类型
			inOutTypeId : "1",  //出入库类型
			inOutReasonId : 0, //出入库原因
			saleId : 1, //销售类型
			couponId :bo2Coupons.couponId, //data.baseInfo.mktResId, //物品ID
			couponinfoStatusCd : "A", //物品处理状态
			chargeItemCd : "3000", //物品费用项类型
			couponNum : couponNum, //物品数量
			storeId : bo2Coupons.storeId,//data.baseInfo.mktResStoreId, //仓库ID
			storeName : "1", //仓库名称
			agentId : 1, //供应商ID
			apCharge : 0, //物品价格
			couponInstanceNumber : bo2Coupons.terminalCode,//data.baseInfo.mktResInstCode, //物品实例编码
			terminalCode : bo2Coupons.terminalCode,//data.baseInfo.mktResInstCode,//前台内部使用的UIM卡号
			ruleId : "", //物品规则ID
			partyId : OrderInfo.cust.custId, //客户ID
			prodId :  prodId, //产品ID
			offerId : offerId, //销售品实例ID
			state : "ADD", //动作
			relaSeq : "" //关联序列	
		};
		if(CONST.getAppDesc()==0){
			coupon.cardTypeFlag=bo2Coupons.cardTypeFlag;//UIM卡类型
		}
		$("#uim_check_btn_"+prodId).attr("disabled",true);
		//$("#uim_check_btn_"+prodId).removeClass("purchase").addClass("disablepurchase");
		//$("#uim_release_btn_"+prodId).attr("disabled",false);
		$("#uim_release_btn_"+prodId).removeClass("disabled");
		$("#uim_txt_"+prodId).attr("disabled",true);
		if(getIsMIFICheck(prodId)){//判断是否通过MIFI 校验
			$("#isMIFI_"+prodId).val("yes");
		}else{
			$("#isMIFI_"+prodId).val("no");
		}
		OrderInfo.clearProdUim(prodId);
		OrderInfo.boProd2Tds.push(coupon);
		if(OrderInfo.actionFlag==22 && data.baseInfo.cardTypeFlag==1){
		//	_queryAttachOffer();
		  AttachOffer.queryCardAttachOffer(data.baseInfo.cardTypeFlag);  //加载附属销售品
	    }
	};
	
	
	//填充套餐变更页面
	var _fillOfferChange = function(response, param) {
		SoOrder.initFillPage(); //并且初始化订单数据
		$("#order_prepare").hide();
		$("#order").html(response.data).show();
//		_initOfferLabel();//初始化主副卡标签
		$("#fillNextStep").off("click").on("click",function(){
			if(!SoOrder.checkData()){ //校验通过
				return false;
			}
			$("#order-content").hide();
			$("#order-dealer").show();
			order.dealer.initDealer();
		});
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
		$("#attach-modal").modal('show');
		//遍历主销售品构成
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			var offerRole = this;
			if(ec.util.isArray(this.prodInsts)){
				$.each(this.prodInsts,function(){
					var _prodInstId = "'"+this.prodInstId+"'";
					if(_prodInstId.indexOf("-") == -1){
						var prodId = this.prodInstId;
						var param = {
							areaId : OrderInfo.getProdAreaId(prodId),
							channelId : OrderInfo.staff.channelId,
							staffId : OrderInfo.staff.staffId,
						    prodId : prodId,
						    prodSpecId : this.objId,
						    offerSpecId : prodInfo.prodOfferId,
						    offerRoleId : this.offerRoleId,
						    acctNbr : this.accessNumber
						};
						var res = query.offer.queryChangeAttachOffer(param);
						$("#attach_"+prodId).html(res);	
						//如果objId，objType，objType不为空才可以查询默认必须
						if(ec.util.isObj(this.objId)&&ec.util.isObj(this.objType)&&ec.util.isObj(this.offerRoleId)){
							param.queryType = "1,2";
							param.objId = this.objId;
							param.objType = this.objType;
							param.memberRoleCd = this.roleCd;
							param.offerSpecId=OrderInfo.offerSpec.offerSpecId;
							//默认必须可选包
							var data = query.offer.queryDefMustOfferSpec(param);
							CacheData.parseOffer(data,prodId);
							//默认必须功能产品
							param.queryType = "1";//只查询必选，不查默认
							var data = query.offer.queryServSpec(param);
							CacheData.parseServ(data,prodId);
						}
						/*if(CONST.getAppDesc()==0 && prodInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){	//预校验
						}else{	
						}*/
						AttachOffer.showMainRoleProd(prodId); //显示新套餐构成
	//					AttachOffer.changeLabel(prodId,this.objId,""); //初始化第一个标签附属
						if(AttachOffer.isChangeUim(prodId)){ //需要补换卡
	                            
								$("#uimDiv_"+prodId).show();
								cleckUim(OrderInfo.mktResInstCode,prodId);
								//$("#uim_txt_"+prodId).val(OrderInfo.mktResInstCode);
	
						}
						//uimDivShow=true;
					}else{
						var prodInst = this;
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
						AttachOffer.queryAttachOfferSpec(param);  //加载附属销售品
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
		});
		if(offerChange.oldMemberFlag){
			for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
				var prodInfo = OrderInfo.oldprodInstInfos[i]; //获取老用户产品信息
				$.each(OrderInfo.oldoffer,function(){
					if(this.accNbr == prodInfo.accNbr){
						var oldoffer = this;
						$.each(oldoffer.offerMemberInfos,function(){
							var member = this;
							if(member.objType==CONST.OBJ_TYPE.PROD){
								var prodId = this.objInstId;
								var param = {
										areaId : OrderInfo.getProdAreaId(prodId),
										channelId : OrderInfo.staff.channelId,
										staffId : OrderInfo.staff.staffId,
									    prodId : prodId,
									    prodSpecId : member.objId,
									    offerSpecId : prodInfo.mainProdOfferInstInfos[0].prodOfferId,
									    offerRoleId : "",
									    acctNbr : member.accessNumber,
									    partyId:prodInfo.custId,
									    distributorId:OrderInfo.staff.distributorId,
									    mainOfferSpecId:prodInfo.mainProdOfferInstInfos[0].prodOfferId,
									    soNbr:OrderInfo.order.soNbr
									};
								if(ec.util.isObj(prodInfo.prodBigClass)){
									param.prodBigClass = prodInfo.prodBigClass;
								}
								$.each(OrderInfo.oldofferSpec,function(){
									if(this.accNbr==prodInfo.accNbr){
										$.each(this.offerSpec.offerRoles,function(){
											if(this.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD || this.memberRoleCd==CONST.MEMBER_ROLE_CD.COMMON_MEMBER){
												param.offerRoleId = this.offerRoleId;
											}
										});
									}
								});
								var res = query.offer.queryChangeAttachOffer(param);
								$("#attach_"+prodId).html(res);	
								//如果objId，objType，objType不为空才可以查询默认必须
								if(ec.util.isObj(member.objId)&&ec.util.isObj(member.objType)&&ec.util.isObj(member.offerRoleId)){
									param.queryType = "1,2";
									param.objId = member.objId;
									param.objType = member.objType;
									param.memberRoleCd = "401";
									//默认必须可选包
									var data = query.offer.queryDefMustOfferSpec(param);
									CacheData.parseOffer(data);
									//默认必须功能产品
									var data = query.offer.queryServSpec(param);
									CacheData.parseServ(data);
								}
								if(ec.util.isArray(OrderInfo.oldofferSpec)){ //主套餐下的成员判断
									$.each(OrderInfo.oldofferSpec,function(){
										if(this.accNbr == prodInfo.accNbr){
											var offerRoles = this.offerSpec.offerRoles;
											$.each(offerRoles,function(){
												if(this.offerRoleId==member.offerRoleId && member.objType==CONST.OBJ_TYPE.PROD){
													var offerRole = this;
													$.each(this.roleObjs,function(){
														if(this.objType==CONST.OBJ_TYPE.SERV){
															var serv = CacheData.getServBySpecId(prodId,this.objId);//从已订购功能产品中找
															if(serv!=undefined){ //不在已经开跟已经选里面
																var $oldLi = $('#li_'+prodId+'_'+serv.servId);
//																if(this.minQty==1){
//																	$oldLi.append('<dd class="mustchoose"></dd>');
//																}
//																$oldLi.append('<dd id="jue_'+prodId+'_'+serv.servId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
															}
														}
													});
													return false;
												}
											});
										}
									});
								}
//								AttachOffer.changeLabel(prodId,prodInfo.productId,"");
							}
						});
					}
				});
				var oldoffer = {};
				if(ec.util.isArray(OrderInfo.oldoffer)){ //主套餐下的成员判断
				    $.each(OrderInfo.oldoffer,function(){
				    	if(this.accNbr == prodInfo.accNbr){
				    		oldoffer = this;
				    	}
				    });
				}
				//老用户加入副卡需要预校验,主卡是4G，加入的老用户为3G
				if(order.prodModify.choosedProdInfo.is3G== "N" && prodInfo.mainProdOfferInstInfos[0].is3G =="Y"){
					if(!order.memberChange.checkOrder(prodInfo,oldoffer)){ //省内校验单
						return;
					}
					order.memberChange.checkOfferProd(oldoffer);
				}
				
			}
		}
           //order.dealer.initDealer(); //初始化发展人
		if(CONST.getAppDesc()==0 && order.prodModify.choosedProdInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){ //3G转4G需要校验
			offerChange.checkOfferProd();
		}
		offerChangeNew.initTounch();
	};
	
	function cleckUim(uim,prodId){
		var uimParam = {
				"instCode":uim
				};
		var response = $.callServiceAsJsonGet(contextPath+"/token/pc/mktRes/qrymktResInstInfo",uimParam);
		if (response.code==0) {
			if(response.data.mktResBaseInfo){
				if(response.data.mktResBaseInfo.statusCd=="1102"){
				//	$("#uim_check_btn_-"+(n+1)).attr("disabled",true);
				//	$("#uim_check_btn_-"+(n+1)).removeClass("purchase").addClass("disablepurchase");
				//	$("#uim_release_btn_-"+(n+1)).attr("disabled",false);
				//	$("#uim_release_btn_-"+(n+1)).removeClass("disablepurchase").addClass("purchase");
					$("#uim_txt_"+prodId).val(OrderInfo.mktResInstCode);
					var coupon = {
							couponUsageTypeCd : "5", //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
							inOutTypeId : "1",  //出入库类型
							inOutReasonId : 0, //出入库原因
							saleId : 1, //销售类型
							couponId :response.data.mktResBaseInfo.mktResId, //物品ID
							couponinfoStatusCd : "A", //物品处理状态
							chargeItemCd : CONST.CHARGE_ITEM_CD.COUPON_SALE, //物品费用项类型
							couponNum : 1, //物品数量
							storeId : response.data.mktResBaseInfo.mktResStoreId, //仓库ID
							storeName : "1", //仓库名称
							agentId : 1, //供应商ID
							apCharge : 0, //物品价格
							couponInstanceNumber : uim, //物品实例编码
							ruleId : "", //物品规则ID
							partyId : OrderInfo.cust.custId, //客户ID
							prodId : prodId, //产品ID
							offerId : -1, //销售品实例ID
						//	attachSepcId : OrderInfo.offerSpec.offerSpecId,
							state : "ADD", //动作
							relaSeq : "" //关联序列	
						};
					OrderInfo.clearProdUim(prodId);
					OrderInfo.boProd2Tds.push(coupon);
				}else{
					$.alert("提示","UIM卡不是预占状态，当前为"+response.data.mktResBaseInfo.statusCd);
				}
			}else{
				$.alert("提示","查询不到UIM信息");
			}
		}
}
	var _initTounch = function(){
		touch.on('.item', 'touchstart', function(ev){
//			ev.preventDefault();
		});
		$(".item").each(function(i){
			touch.on(this, 'swiperight', function(ev){
				$("#carousel-example-generic").carousel('prev');
			});
			
			touch.on(this, 'swipeleft', function(ev){
				$("#carousel-example-generic").carousel('next');
			});
		});
       
       //开始解析数据
       //二次加载
       if(OrderInfo.provinceInfo.reloadFlag=="N"){
			var custOrderList = OrderInfo.reloadOrderInfo.orderList.custOrderList[0].busiOrder;
			$.each(custOrderList,function(){
				if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="1"){//纳入新成员
					//选号
					$("#nbr_btn_"+this.data.boProdAns[0].prodId).val(this.busiObj.accessNumber);
					var boProdAns={
							prodId : this.data.boProdAns[0].prodId, //从填单页面头部div获取
							accessNumber : this.data.boProdAns[0].accessNumber, //接入号
							anChooseTypeCd : this.data.boProdAns[0].anChooseTypeCd, //接入号选择方式,自动生成或手工配号，默认传2
							anId : this.data.boProdAns[0].anId, //接入号ID
							pnLevelId:this.data.boProdAns[0].pnLevelId,
							anTypeCd : this.data.boProdAns[0].anTypeCd, //号码类型
							state : this.data.boProdAns[0].state, //动作	,新装默认ADD	
							areaId:this.data.boProdAns[0].areaId,
							areaCode:this.data.boProdAns[0].areaCode,
							memberRoleCd:this.data.boProdAns[0].memberRoleCd,
							preStore:this.data.boProdAns[0].preStore,
							minCharge:this.data.boProdAns[0].minCharge
						};
					OrderInfo.boProdAns.push(boProdAns);
					order.dealer.changeAccNbr(this.data.boProdAns[0].prodId,this.data.boProdAns[0].accessNumber);//选号玩要刷新发展人管理里面的号码
					//uim卡校验
					$("#uim_check_btn_"+this.data.bo2Coupons[0].prodId).attr("disabled",true);
					$("#uim_release_btn_"+this.data.bo2Coupons[0].prodId).removeClass("disabled");
					$("#uim_txt_"+this.data.bo2Coupons[0].prodId).attr("disabled",true);
					$("#uim_txt_"+this.data.bo2Coupons[0].prodId).val(this.data.bo2Coupons[0].terminalCode);
					var coupon = {
							couponUsageTypeCd : this.data.bo2Coupons[0].couponUsageTypeCd, //物品使用类型
							inOutTypeId : this.data.bo2Coupons[0].inOutTypeId,  //出入库类型
							inOutReasonId : this.data.bo2Coupons[0].inOutReasonId, //出入库原因
							saleId : this.data.bo2Coupons[0].saleId, //销售类型
							couponId : this.data.bo2Coupons[0].couponId, //物品ID
							couponinfoStatusCd : this.data.bo2Coupons[0].couponinfoStatusCd, //物品处理状态
							chargeItemCd : this.data.bo2Coupons[0].chargeItemCd, //物品费用项类型
							couponNum : this.data.bo2Coupons[0].couponNum, //物品数量
							storeId : this.data.bo2Coupons[0].storeId, //仓库ID
							storeName : this.data.bo2Coupons[0].storeName, //仓库名称
							agentId : this.data.bo2Coupons[0].agentId, //供应商ID
							apCharge : this.data.bo2Coupons[0].apCharge, //物品价格
							couponInstanceNumber : this.data.bo2Coupons[0].couponInstanceNumber, //物品实例编码
							terminalCode : this.data.bo2Coupons[0].terminalCode,//前台内部使用的UIM卡号
							ruleId : this.data.bo2Coupons[0].ruleId, //物品规则ID
							partyId : this.data.bo2Coupons[0].partyId, //客户ID
							prodId :  this.data.bo2Coupons[0].prodId, //产品ID
							offerId : this.data.bo2Coupons[0].offerId, //销售品实例ID
							state : this.data.bo2Coupons[0].state, //动作
							relaSeq : this.data.bo2Coupons[0].relaSeq //关联序列	
						};
					OrderInfo.clearProdUim(this.busiObj.instId);
					OrderInfo.boProd2Tds.push(coupon);
					//封装付费方式
					$("select[name='pay_type_-1'] option[value='"+this.data.boProdFeeTypes[0].feeType+"']").attr("selected","selected");
				}
			});
    	   offerChangeNew.showOffer();
       }
	};
	
	//套餐变更提交组织报文
	var _changeOffer = function(busiOrders){
		_createDelOffer(busiOrders,OrderInfo.offer); //退订主销售品
		_createMainOffer(busiOrders,OrderInfo.offer); //订购主销售品	
		AttachOffer.setAttachBusiOrder(busiOrders);  //订购退订附属销售品
		if(CONST.getAppDesc()==0){ //4g系统需要,补换卡 
			if(ec.util.isArray(OrderInfo.offer.offerMemberInfos)){ //遍历主销售品构成
				$.each(OrderInfo.offer.offerMemberInfos,function(){
					if(this.objType==CONST.OBJ_TYPE.PROD && this.prodClass==CONST.PROD_CLASS.THREE && OrderInfo.offerSpec.is3G=="N"){//补换卡
						if(OrderInfo.boProd2Tds.length>0){
							var prod = {
								prodId : this.objInstId,
								prodSpecId : this.objId,
								accessNumber : this.accessNumber,
								isComp : "N",
								boActionTypeCd : CONST.BO_ACTION_TYPE.CHANGE_CARD
							};
							var busiOrder = OrderInfo.getProdBusiOrder(prod);
							if(busiOrder){
								busiOrders.push(busiOrder);
							}
						}
					}
				});
			}
		}
	};
			
	//创建退订主销售品节点
	var _createDelOffer = function(busiOrders,offer){	
		offer.offerTypeCd = 1;
		offer.boActionTypeCd = CONST.BO_ACTION_TYPE.DEL_OFFER;
		var prodInfo = order.prodModify.choosedProdInfo;
		OrderInfo.getOfferBusiOrder(busiOrders,offer, prodInfo.prodInstId);
	};
	
	//创建主销售品节点
	var _createMainOffer = function(busiOrders,offer) {
		var prod = order.prodModify.choosedProdInfo;
		var offerSpec = OrderInfo.offerSpec;
		var busiOrder = {
			areaId : OrderInfo.getProdAreaId(prod.prodInstId),  //受理地区ID
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				instId : OrderInfo.SEQ.offerSeq--, //业务对象实例ID
				objId : offerSpec.offerSpecId,  //业务规格ID
				offerTypeCd : "1", //1主销售品
				accessNumber : prod.accNbr  //接入号码
			},  
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.OFFER_ACTION,
				boActionTypeCd : CONST.BO_ACTION_TYPE.BUY_OFFER
			}, 
			data:{
				ooRoles : [],
				ooOwners : [{
					partyId : OrderInfo.cust.custId, //客户ID
					state : "ADD" //动作
				}]
			}
		};
		//遍历主销售品构成
		$.each(offerSpec.offerRoles,function(){
			var offerRole = this;
			if(this.prodInsts!=undefined){
				$.each(this.prodInsts,function(){
					var ooRoles = {
						objId : this.objId, //业务规格ID
						objInstId : this.prodInstId, //业务对象实例ID,新装默认-1
						objType : this.objType, // 业务对象类型
						offerRoleId : offerRole.offerRoleId, //销售品角色ID
						state : "ADD" //动作
					};
					busiOrder.data.ooRoles.push(ooRoles);
				});
			}
		});

		//销售参数节点
		if(ec.util.isArray(offerSpec.offerSpecParams)){  
			busiOrder.data.ooParams = [];
			for (var i = 0; i < offerSpec.offerSpecParams.length; i++) {
				var param = offerSpec.offerSpecParams[i];
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
		if(offerSpec.ooTimes !=undefined ){
			busiOrder.data.ooTimes = [];
			busiOrder.data.ooTimes.push(offerSpec.ooTimes);
		}
		
		//发展人
		busiOrder.data.busiOrderAttrs = [];
		var $tr = $("li[name='tr_"+OrderInfo.offerSpec.offerSpecId+"']");
		if($tr!=undefined){
			$tr.each(function(){   //遍历产品有几个发展人
				var dealer = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
					role : $(this).find("select").val(),
					value : $(this).find("input").attr("staffid") 
				};
				busiOrder.data.busiOrderAttrs.push(dealer);
			});
		}
		busiOrders.push(busiOrder);
	};
	
	//填单页面切换
	var _changeTab = function(prodId) {
		/*
		$.each($("#tab_"+prodId).parent().find("li"),function(){
			$(this).removeClass("setcon");
			$("#attach_tab_"+$(this).attr("prodId")).hide();
			$("#uimDiv_"+$(this).attr("prodId")).hide();
		});
		$("#tab_"+prodId).addClass("setcon");
		$("#attach_tab_"+prodId).show();
		if(AttachOffer.isChangeUim(prodId)){
			$("#uimDiv_"+prodId).show();
		}
		*/
	};
	
	//省里校验单
	var _checkOrder = function(prodId){
		if(OrderInfo.actionFlag==3){
			_getAttachOfferInfo();
		}else{
			_getChangeInfo();
		}
		var data = query.offer.updateCheckByChange(JSON.stringify(OrderInfo.orderData));
		OrderInfo.orderData.orderList.custOrderList[0].busiOrder = []; //校验完清空	
		if(data==undefined){
			return false;
		}
		if(data.resultCode==0 && ec.util.isObj(data.result)){ //预校验成功
			offerChange.resultOffer = data.result;
		}else {
			$.alert("预校验规则限制",data.resultMsg);
			offerChange.resultOffer = {}; 
			return false;
		}
		return true;
	};
	
	//3G套餐订购4G流量包时预校验的入参封装
	var _getAttachOfferInfo=function(){
		OrderInfo.getOrderData(); //获取订单提交节点	
		OrderInfo.orderData.orderList.orderListInfo.partyId = OrderInfo.cust.custId;
		var busiOrders = OrderInfo.orderData.orderList.custOrderList[0].busiOrder;//获取业务对象数组
		//遍历已开通附属销售品列表
		for ( var i = 0; i < AttachOffer.openList.length; i++) {
			var open = AttachOffer.openList[i];
			for ( var j = 0; j < open.specList.length; j++) {  //遍历当前产品下面的附属销售品
				var spec = open.specList[j];
				if(spec.isdel != "Y" && spec.isdel != "C" && spec.ifPackage4G=="Y"){  //订购的附属销售品
					spec.offerTypeCd = 2;
					spec.boActionTypeCd = CONST.BO_ACTION_TYPE.BUY_OFFER;
					spec.offerId = OrderInfo.SEQ.offerSeq--; 
					OrderInfo.getOfferBusiOrder(busiOrders,spec,open.prodId);	
				}
			}
		}
		$.each(busiOrders,function(){
			this.busiObj.state="ADD";
		});
	};
	
	//把旧套餐的产品自动匹配到新套餐中，由于现在暂时只支持主副卡跟单产品，所以可以自动匹配
	var _setChangeOfferSpec = function(memberNum,viceNum){
		if(memberNum==1){ //单产品变更
			var offerRole = getOfferRole();
			if(offerRole==undefined){
				alert("错误提示","无法变更到该套餐");
				return false;
			}
			offerRole.prodInsts = [];
			var flag=false;
			$.each(offerRole.roleObjs,function(){
				if(this.objType==CONST.OBJ_TYPE.PROD){
					var roleObj = this;
					flag=false;
					$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
						if(this.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
							if(roleObj.objId!=this.objId){
								$.alert("规则限制","新套餐【"+roleObj.offerRoleName+"】角色的规格ID【"+roleObj.objId+"】和旧套餐【"+this.roleName+"】角色的规格ID【"+this.objId+"】不一样");
								flag=true;
								return false;
							}
							roleObj.prodInstId = this.objInstId;
							roleObj.accessNumber = this.accessNumber;
							offerRole.prodInsts.push(roleObj);
						}
					});
					if(flag){
						return false;
					}
				}
			});
			if(flag){
				return false;
			}
		}else{  //多成员角色
			for (var i = 0; i < OrderInfo.offer.offerMemberInfos.length; i++) {
				var offerMember = OrderInfo.offer.offerMemberInfos[i];
				if(offerMember.objType==CONST.OBJ_TYPE.PROD){
					var flag = true;
					for (var j = 0; j < OrderInfo.offerSpec.offerRoles.length; j++) {
						var offerRole = OrderInfo.offerSpec.offerRoles[j];
						if(offerMember.roleCd==offerRole.memberRoleCd){ //旧套餐对应新套餐角色
							for (var k = 0; k < offerRole.roleObjs.length; k++) {
								var roleObj = offerRole.roleObjs[k];
								if(roleObj.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
									if(roleObj.objId!=offerMember.objId){
										$.alert("规则限制","新套餐【"+roleObj.offerRoleName+"】角色的规格ID【"+roleObj.objId+"】和旧套餐【"+offerMember.roleName+"】角色的规格ID【"+offerMember.objId+"】不一样");
										return false;
									}
									if(!ec.util.isArray(offerRole.prodInsts)){
										offerRole.prodInsts = [];
									}
									var newObject = jQuery.extend(true, {}, roleObj); 
									newObject.prodInstId = offerMember.objInstId;
									newObject.accessNumber = offerMember.accessNumber;
									newObject.memberRoleCd = offerMember.roleCd;
									offerRole.prodInsts.push(newObject);
									if(offerRole.prodInsts.length>roleObj.maxQty){
										$.alert("规则限制","新套餐【"+offerRole.offerRoleName+"】角色最多可以办理数量为"+roleObj.maxQty+",而旧套餐数量大于"+roleObj.maxQty);
										return false;
									}
									break;
								}
							}
							flag = false;
							break;
						}
					}
					if(flag){
						$.alert("规则限制","旧套餐【"+offerMember.roleName+"】角色在新套餐中不存在，无法变更");
						return false;
					}
				}
			}
		}
		return true;
	};
	
	//获取单产品变更自动匹配的角色
	var getOfferRole = function(){
		//新套餐是主副卡,获取主卡角色
		for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
			var offerRole = OrderInfo.offerSpec.offerRoles[i];
			if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD){  //主卡
				return offerRole;
			}
		}
		//新套餐不是主副卡，返回第一个包含接入产品的角色
		for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
			var offerRole = OrderInfo.offerSpec.offerRoles[i];
			for (var j = 0; j < offerRole.roleObjs.length; j++) {
				var roleObj = offerRole.roleObjs[j];
				if(roleObj.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
					return offerRole;
				}
			}
		}
	};
	
	//获取套餐变更节点
	var _getChangeInfo = function(){
		OrderInfo.getOrderData(); //获取订单提交节点	
		OrderInfo.orderData.orderList.orderListInfo.partyId = OrderInfo.cust.custId;
		var busiOrders = OrderInfo.orderData.orderList.custOrderList[0].busiOrder;//获取业务对象数组
		_createDelOffer(busiOrders,OrderInfo.offer); //退订主销售品
		_createMainOffer(busiOrders,OrderInfo.offer); //订购主销售品	
	};
	
	
	
	
	//根据省内返回的数据校验
	var _checkOfferProd = function(){
		if(offerChange.resultOffer==undefined){
			return;
		}
		//功能产品
		var prodInfos = offerChange.resultOffer.prodInfos;
		if(ec.util.isArray(prodInfos)){
			$.each(prodInfos,function(){
				var prodId = this.accProdInstId;
				//容错处理，省份接入产品实例id传错
				var flag = true;
				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
					if(this.objType==CONST.OBJ_TYPE.PROD && this.objInstId==prodId){  //接入类产品
						flag = false;
						return false;
					}
				});
				if(flag){
					return true;
				}
				if(prodId!=this.prodInstId){ //功能产品
					var serv = CacheData.getServ(prodId,this.prodInstId);
					if(this.state=="DEL"){
						if(serv!=undefined){
							var $dd = $("#li_"+prodId+"_"+this.prodInstId);
							if(ec.util.isObj($dd)){
								var $span = $("#span_"+prodId+"_"+this.prodInstId);
								var $span_remove = $("#span_remove_"+prodId+"_"+this.prodInstId);
								if(ec.util.isObj($span)){
									$span.addClass("del");
								}
								if(ec.util.isObj($span_remove)){
									$span_remove.hide();
								}
								$dd.removeAttr("onclick");
								serv.isdel = "Y";
							}
						}	
					}else if(this.state=="ADD"){
						if(serv!=undefined){  //在已开通里面，修改不让关闭
							var $dd = $("#li_"+prodId+"_"+this.prodInstId);
							if(ec.util.isObj($dd)){
								var $span = $("#span_"+prodId+"_"+this.prodInstId);
								var $span_remove = $("#span_remove_"+prodId+"_"+this.prodInstId);
								if(ec.util.isObj($span)){
									$span.removeClass("del");
								}
								if(ec.util.isObj($span_remove)){
									$span_remove.hide();
								}
								$dd.removeAttr("onclick");
								serv.isdel = "N";
							}
						}else{
							var servSpec = CacheData.getServSpec(prodId,this.productId); //已开通里面查找
							if(servSpec!=undefined){
								var $dd = $("#li_"+prodId+"_"+this.productId);
								if(ec.util.isObj($dd)){
									var $span = $("#span_"+prodId+"_"+this.productId);
									var $span_remove = $("#span_remove_"+prodId+"_"+this.productId);
									if(ec.util.isObj($span)){
										$span.removeClass("del");
									}
									if(ec.util.isObj($span_remove)){
										$span_remove.hide();
									}
									$dd.removeAttr("onclick");
									servSpec.isdel = "N";
								}
								
								$("#del_"+prodId+"_"+this.productId).hide();
							}else {
								if(this.productId!=undefined && this.productId!=""){
									//AttachOffer.addOpenServList(prodId,this.productId,this.prodName,this.ifParams);
									AttachOffer.openServSpec(prodId,this.productId);
								}
							}
						}
					}
				}
			});
		}
		
		//可选包
		var offers = offerChange.resultOffer.prodOfferInfos;
		if(ec.util.isArray(offers)){
			if(ec.util.isArray(OrderInfo.offer.offerMemberInfos)){//多产品套餐
				$.each(OrderInfo.offer.offerMemberInfos,function(){
					var prodId = this.objInstId;
					$.each(offers,function(){
						if(this.memberInfo==undefined){
							return true;
						}
						var offer = CacheData.getOffer(prodId,this.prodOfferInstId); //已开通里面查找
						var flag = true;
						$.each(this.memberInfo,function(){  //寻找该销售品属于哪个产品
							if(prodId == this.accProdInstId){		
								if(ec.util.isObj(offer)){
									this.prodId = this.accProdInstId;
								}
								flag = false;
								return false;
							}
						});
						if(flag){
							return true;
						}
						if(this.state=="DEL"){
							if(offer!=undefined){
								var $dd = $("#li_"+prodId+"_"+this.prodOfferInstId);
								if(ec.util.isObj($dd)){
									var $span = $("#span_"+prodId+"_"+this.prodOfferInstId);
									var $span_remove = $("#span_remove_"+prodId+"_"+this.prodOfferInstId);
									if(ec.util.isObj($span)){
										$span.addClass("del");
									}
									if(ec.util.isObj($span_remove)){
										$span_remove.hide();
									}
									$dd.removeAttr("onclick");
									offer.isdel = "N";
								}
								offer.isdel = "Y";
								if(this.isRepeat!="Y"){//如果可选包下面有多个接入类产品，到时候只拼一个退订节点
									this.isRepeat="Y";
								}else{
									offer.isRepeat="Y";
								}
							}	
						}else if(this.state=="ADD"){
							if(offer!=undefined){ //在已开通里面，修改不让关闭
								var $dd = $("#li_"+prodId+"_"+this.prodOfferInstId);
								if(ec.util.isObj($dd)){
									var $span = $("#span_"+prodId+"_"+this.prodOfferInstId);
									var $span_remove = $("#span_remove_"+prodId+"_"+this.prodOfferInstId);
									if(ec.util.isObj($span)){
										$span.removeClass("del");
									}
									if(ec.util.isObj($span_remove)){
										$span_remove.hide();
									}
									$dd.removeAttr("onclick");
									offer.isdel = "N";
								}
							}else{
								var offerSpec = CacheData.getOfferSpec(prodId,this.prodOfferId); //已开通里面查找
								if(offerSpec!=undefined){
									var $dd = $("#li_"+prodId+"_"+this.prodOfferId);
									if(ec.util.isObj($dd)){
										var $span = $("#span_"+prodId+"_"+this.prodOfferId);
										var $span_remove = $("#span_remove_"+prodId+"_"+this.prodOfferId);
										if(ec.util.isObj($span)){
											$span.removeClass("del");
										}
										if(ec.util.isObj($span_remove)){
											$span_remove.hide();
										}
										$dd.removeAttr("onclick");
										offerSpec.isdel = "N";
									}
								}else {
									if(ec.util.isObj(this.prodOfferId) && this.prodOfferId!=OrderInfo.offerSpec.offerSpecId){
										//AttachOffer.addOpenList(prodId,this.prodOfferId);			
										AttachOffer.addOfferSpecByCheck(prodId,this.prodOfferId);
									}
								}
							}
						}
					});
				});
			}
		}
	};
	
    //解析二次加载数据
	//解析数据
	var _showOffer=function(){
        var isReload=OrderInfo.provinceInfo.reloadFlag;
		
		var orderInfo=OrderInfo.reloadOrderInfo;
		//0是正确的，进行信息重新加载
		var resultCode="0";//orderInfo.resultCode;
		var resultMsg=orderInfo.resultMsg;
		if(resultCode=="0"){
			
			//进行进行数据解析工作,获取产品数据
			var custOrderList=orderInfo.orderList.custOrderList;
			
			var orderListInfo=orderInfo.orderList.orderListInfo;
			
			if(custOrderList!=null && custOrderList!=""){
				//获取下属的产品
				if(custOrderList!=null && custOrderList.length>0){
					$(custOrderList).each(function(i,custOrder) { 
						
						//先把删除的开通功能进行删除操作
						$(custOrder.busiOrder).each(function(i,busiOrder) { 
							//解析到具体的订购产品数据
							//获取产品操作类型
							var boActionTypeCd=busiOrder.boActionType.boActionTypeCd;
							
							//获取产品的操作状态,state,del-删除,add-添加
							var state="";
							var data=busiOrder.data;
							var ooOwners;
							var boServs;
							
							// 7是已开通功能，状态的获取和其他类型获取不一样
							if(boActionTypeCd=="7"){
								boServs=data.boServs;
								
								if(boServs!=null){
									$(boServs).each(function(i,boServ) { 
										state=boServ.state;
									});
								}
							}
							
							var busiObj=busiOrder.busiObj;
							
							if(boActionTypeCd=="7"){
								//7是已开通功能产品
								//获取唯一ID标识
								var instId=busiObj.instId;
								
								var boServOrders=data.boServOrders;
								
								$(data.boServs).each(function(i,boServ) { 
									var servId=boServ.servId;
									var state=boServ.state;
									if(state=="DEL"){
										_closeServ(instId,servId);
									}
								});
							}
						});
					});
					
					$(custOrderList).each(function(i,custOrder) { 
						$(custOrder.busiOrder).each(function(i,busiOrder) { 
							//解析到具体的订购产品数据
							//获取产品操作类型
							var boActionTypeCd=busiOrder.boActionType.boActionTypeCd;
							
							//获取产品的操作状态,state,del-删除,add-添加
							var state="";
							
							var data=busiOrder.data;
							
							var ooOwners;
							var boServs;
							
							// 7是已开通功能，状态的获取和其他类型获取不一样
							if(boActionTypeCd=="7"){
								boServs=data.boServs;
								
								if(boServs!=null){
									$(boServs).each(function(i,boServ) { 
										state=boServ.state;
									});
								}
							}else{
								ooOwners=data.ooOwners;
								if(ooOwners!=null){
									$(ooOwners).each(function(i,ooOwner) { 
										state=ooOwner.state;
										return false
									});
								}
							}
							
							var busiObj=busiOrder.busiObj;
							
							//S2是已订购可选包
							if(boActionTypeCd=="S2" && busiObj.offerTypeCd=="2"){
								//获取唯一ID标识
								var instId=busiObj.instId;
								
//								$(data.ooRoles).each(function(i,ooRole) { 
									
									if(state=="DEL"){
										var objInstId="";
										for(var j=0;j<OrderInfo.oldoffer.length;j++){
											var oldOffer = OrderInfo.oldoffer[j];
											for ( var i = 0; i < oldOffer.offerMemberInfos.length; i++) {
												var oldOfferMember = oldOffer.offerMemberInfos[i];
												if(oldOfferMember.accessNumber==busiOrder.busiObj.accessNumber){
													objInstId = oldOfferMember.objInstId;
													break;
												}
											}
										}
										$.each(OrderInfo.offer.offerMemberInfos,function(){
											if(this.accessNumber==busiOrder.busiObj.accessNumber){
												objInstId = this.objInstId;
												return false;
											}
										});
										_delOffer(objInstId,instId);
									}
//								});
							}else if(boActionTypeCd=="7"){
								
								//7是已开通功能产品
								//获取唯一ID标识
								var instId=busiObj.instId;
								
								var boServOrders=data.boServOrders;
								
								$(data.boServs).each(function(i,boServ) { 
									var servId=boServ.servId;
									var state=boServ.state;
									
									if(state=="ADD"){
										$(boServOrders).each(function(i2,boServOrder) {
											var servSpecId=boServOrder.servSpecId;
											var servSpecName=boServOrder.servSpecName;
											_openServSpec(instId,servSpecId,servSpecName,'N');
										});
									}
								});
								
							}else if(boActionTypeCd=="S1"){
								//S1是订单中的已选可选包数据
								//获取唯一ID标识
								var objId=busiObj.objId;
								var accessNumber=busiObj.accessNumber;
								var objName=busiObj.objName;
								var prodId=null;
								
								var ooRoles=data.ooRoles;
								var busiOrderAttrs=data.busiOrderAttrs;
								var zdDatas=busiOrder.data;    //终端
								$(data.ooRoles).each(function(i,ooRole) { 
									prodId=ooRole.prodId;
									return false;
								});
								
								if(busiObj.offerTypeCd=="2"){
									//重载订单中已经选择的服务
									_addOfferSpecSub(prodId,objId,ooRoles);
									
									//解析终端串码
									if(busiOrder.boActionType.actionClassCd=="1200" && busiOrder.boActionType.boActionTypeCd=="S1" && busiOrder.busiObj.offerTypeCd=="2"){
										if(zdDatas.bo2Coupons!=undefined){
											//开始解析终端
											for(var i=0;i<zdDatas.bo2Coupons.length;i++){
												var bo2Coupons = zdDatas.bo2Coupons[i];
												if(bo2Coupons.num==undefined){
													bo2Coupons.num=i+1;
												}
												$("#terminalText_"+bo2Coupons.prodId+"_"+bo2Coupons.attachSepcId+"_"+bo2Coupons.num).val(bo2Coupons.couponInstanceNumber);
												offerChangeNew.checkTerminalCode(bo2Coupons.prodId,bo2Coupons.attachSepcId,bo2Coupons.num,"0");
											}
										}
									}
								}
								
								//套餐变更APP是有发展人的,以下是发展人数据
								if(busiOrder.data.busiOrderAttrs!=undefined){
									var dealerMap1 = {};
									var dealerMap2 = {};
									var dealerMap3 = {};
									$.each(busiOrder.data.busiOrderAttrs,function(){
										if(this.role=="40020005"){
											dealerMap1.role = this.role;
											if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER){
												dealerMap1.staffid = this.value;
											}else if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER_NAME){
												dealerMap1.staffname = this.value;
											}
											dealerMap1.objInstId=objId;
											dealerMap1.accessNumber=accessNumber;
											dealerMap1.objName=objName;
											dealerMap1.prodId=prodId;
										}else if(this.role=="40020006"){
											dealerMap2.role = this.role;
											if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER){
												dealerMap2.staffid = this.value;
											}else if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER_NAME){
												dealerMap2.staffname = this.value;
											}
											dealerMap2.objInstId=objId;
											dealerMap2.accessNumber=accessNumber;
											dealerMap2.objName=objName;
											dealerMap2.prodId=prodId;
										}else if(this.role=="40020007"){
											dealerMap3.role = this.role;
											if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER){
												dealerMap3.staffid = this.value;
											}else if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER_NAME){
												dealerMap3.staffname = this.value;
											}
											dealerMap3.objInstId=objId;
											dealerMap3.accessNumber=accessNumber;
											dealerMap3.objName=objName;
											dealerMap3.prodId=prodId;
										}										
									});
									
									if(ec.util.isObj(dealerMap1.role)){
										OrderInfo.reloadProdInfo.dealerlist.push(dealerMap1);
									}
									
									if(ec.util.isObj(dealerMap2.role)){
										OrderInfo.reloadProdInfo.dealerlist.push(dealerMap2);
									}
									
									if(ec.util.isObj(dealerMap3.role)){
										OrderInfo.reloadProdInfo.dealerlist.push(dealerMap3);
									}
								}
							}else if(boActionTypeCd=="14"){								
								var bo2Coupons=busiOrder.data.bo2Coupons
								for(var i=0;i<bo2Coupons.length;i++){
									if(bo2Coupons[i].state=="ADD"){
										//uim卡号  //uim_txt_140029724038
										var card=bo2Coupons[i].couponInstanceNumber;
										//prodId
										var id=bo2Coupons[i].prodId;
										
										$("#uim_txt_"+id).val(card);//填充卡号
										offerChangeNew.checkUim(id,bo2Coupons[i]);

									}
								}
							}
							
						});
					});
				}
			}
			
			//退订功能产品
			$.each(AttachOffer.openServList,function(){
				var openmap = this;
				$.each(this.servSpecList,function(){
					var offermap = this;
					var offerflag = false;
					var custOrderLists=custOrderList[0];
					$.each(custOrderLists.busiOrder,function(){
						var obj=this;
						if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="7"){
							if(offermap.servSpecId==this.data.boServOrders[0].servSpecId && openmap.prodId==this.busiObj.instId){
								offerflag = true;
								return false;
							}
						}
					});
					if(!offerflag){
						var $span = $("#li_"+openmap.prodId+"_"+this.servSpecId).find("span"); //定位删除的附属
						var spec = CacheData.getServSpec(openmap.prodId,this.servSpecId);
						if(spec == undefined){ //没有在已开通附属销售列表中
							return;
						}
						$span.addClass("del");
						spec.isdel = "Y";
						AttachOffer.showHideUim(1,openmap.prodId,this.servSpecId);   //显示或者隐藏
						var serv = CacheData.getServBySpecId(openmap.prodId,this.servSpecId);
						if(ec.util.isObj(serv)){ //没有在已开通附属销售列表中
							$span.addClass("del");
							serv.isdel = "Y";
						}
					}
				});
			});
			
			//订单备注和模版等加载
			if(orderListInfo!=null && custOrderList!=null){
				var custOrderAttrs=orderListInfo.custOrderAttrs;
				var isTemplateOrder=orderListInfo.isTemplateOrder;
				var templateOrderName=orderListInfo.templateOrderName;
				
				$(custOrderAttrs).each(function(i,custOrderAttr) { 
					var itemSpecId=custOrderAttr.itemSpecId;
					
					//111111118是为备注的编码
					if(itemSpecId=="111111118"){
						var value=custOrderAttr.value;
						if(value!=null && value!=""){
							//$("#order_remark").val(value);
							OrderInfo.reloadProdInfo.orderMark = this.value;
						}
					}
				});
				
				//模版的操作
				if(isTemplateOrder=="Y"){
					$("#isTemplateOrder").click();//选中模版按钮
					
					SoOrder.showTemplateOrderName();//显示模版名称输入
					
					$("#templateOrderName").val(templateOrderName);//赋值模版名称
				}
			}
		}
	};
	//把选中的服务保存到销售品规格中
	//把选中的服务保存到销售品规格中 第二步
	var _setServ2OfferSpec = function(prodId,offerSpec,roles){
		if(offerSpec!=undefined){
			$.each(offerSpec.offerRoles,function(){
				$.each(this.roleObjs,function(){
					var nowProd=prodId+"_"+this.objId;
					
					$(roles).each(function(i,role) { 
						var oldProd=role.prodId+"_"+role.objId;
							
						if(nowProd==oldProd){
							this.selQty = 1;
							return false;
						}else{
							this.selQty = 2;
						}
					});
				});
			});
		}
	};
	
	//开通功能产品new
	var _openServSpec = function(prodId,servSpecId,specName,ifParams){
		var servSpec = CacheData.getServSpec(prodId,servSpecId); //在已选列表中查找
		if(servSpec==undefined){   //在可订购功能产品里面 
			var newSpec = {
				objId : servSpecId, //调用公用方法使用
				servSpecId : servSpecId,
				servSpecName : specName,
				ifParams : ifParams,
				isdel : "C"   //加入到缓存列表没有做页面操作为C
			};
			var inPamam = {
				prodSpecId:servSpecId
			};
			if(ifParams == "Y"){
				var data = query.prod.prodSpecParamQuery(inPamam);// 产品功能产品属性
				if(data==undefined || data.result==undefined){
					return;
				}
				newSpec.prodSpecParams = data.result.prodSpecParams;
			if(servSpecId==CONST.YZFservSpecId){//翼支付助手根据付费类型改变默认值
				var feeType = $("select[name='pay_type_-1']").val();
				if(feeType==undefined) feeType = order.prodModify.choosedProdInfo.feeType;
				if(feeType == CONST.PAY_TYPE.AFTER_PAY){
					for ( var j = 0; j < newSpec.prodSpecParams.length; j++) {
						var prodSpecParam = newSpec.prodSpecParams[j];
						prodSpecParam.setValue = "";
					}																			
				}else{
					for ( var j = 0; j < newSpec.prodSpecParams.length; j++) {							
						var prodSpecParam = newSpec.prodSpecParams[j];
						if (prodSpecParam.value!="") {
							prodSpecParam.setValue = prodSpecParam.value;
						} else if (!!prodSpecParam.valueRange[0]&&prodSpecParam.valueRange[0].value!="")
							//默认值为空则取第一个
							prodSpecParam.setValue = prodSpecParam.valueRange[0].value;
				}
			  }
			}
			}
			CacheData.setServSpec(prodId,newSpec); //添加到已开通列表里
			servSpec = newSpec;
		}
		
		_checkServExcludeDepend(prodId,servSpec);
	};
	//校验服务的互斥依赖
	var _checkServExcludeDepend = function(prodId,serv,flag){
		var servSpecId = serv.servSpecId;
		var param = CacheData.getExcDepServParam(prodId,servSpecId);
		if(param.orderedServSpecIds.length == 0){
			AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams);
		}else{
			var data = query.offer.queryExcludeDepend(param);  //查询规则校验
			if(data!=undefined){
				paserServData(data.result,prodId,serv);//解析数据
			}
		}
	};
	//解析服务互斥依赖
	var paserServData = function(result,prodId,serv){
		var servSpecId = serv.servSpecId;
		var servExclude = result.servSpec.exclude; //互斥
		var servDepend = result.servSpec.depend; //依赖
		var servRelated = result.servSpec.related; //连带
		var content = "";
		//转换接口返回的互斥依赖
		var param = {  
			excludeServ : [],  //互斥依赖显示列表
			dependServ : [], //存放互斥依赖列表
			relatedServ : [] //连带
		};
		
		//解析功能产品互斥
		if(ec.util.isArray(servExclude)){
			$.each(servExclude,function(){
				var servList = CacheData.getServList(prodId); //互斥要去除已订购手动删除
				var flag = true;
				if(servList!=undefined){
					for ( var i = 0; i < servList.length; i++) {
						if(servList[i].isdel=="Y"){
							if(servList[i].servSpecId == this.servSpecId){  //返回互斥数组在已订购中删除，不需要判断
								flag = false;
								break;
							}
						}
					}
				}
				if(flag){
					content += "需要关闭：   " + this.servSpecName + "<br>";
					param.excludeServ.push(this);
				}
			});
		}
		//解析功能产品依赖
		if(ec.util.isArray(servDepend)){
			$.each(servDepend,function(){
				content += "需要开通：   " + this.servSpecName + "<br>";
				param.dependServ.push(this);
			});
		}
		//解析功能产品连带
		if(ec.util.isArray(servRelated)){
			$.each(servRelated,function(){
				content += "需要开通：   " + this.servSpecName + "<br>";
				param.relatedServ.push(this);
			});
		}
		if(content==""){ //没有互斥依赖
			AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams);
		}else{
			if(OrderInfo.provinceInfo.reloadFlag=="N"){
				AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams); //添加开通功能
				AttachOffer.excludeAddServ(prodId,servSpecId,param);
			}else{
				$.confirm("开通： " + serv.servSpecName,content,{ 
					yesdo:function(){
						AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams); //添加开通功能
						AttachOffer.excludeAddServ(prodId,servSpecId,param);
					},
					no:function(){
					}
				});
			}

		}
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
	
	//二次加载附属业务数据信息 第一步
	var _addOfferSpecSub = function(prodId,offerSpecId,roles){
		var newSpec = _setSpec(prodId,offerSpecId);
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			return;
		}
		
		var content = CacheData.getOfferProdStr(prodId,newSpec,0);
		
		_setServ2OfferSpecSub(prodId,newSpec);
		
		_checkOfferExcludeDependSub(prodId,newSpec);
			
	};
	
	//二次加载附属业务数据信息 第一步
	var _addOfferSpec = function(prodId,offerSpecId,roles){
		var newSpec = _setSpec(prodId,offerSpecId);
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			return;
		}
		
		var content = CacheData.getOfferProdStr(prodId,newSpec,0);
		
		CacheData.setServ2OfferSpec(prodId,newSpec);
		AttachOffer.checkOfferExcludeDepend(prodId,newSpec);
		//_checkOfferExcludeDepend(prodId,newSpec);
			
	};
	
	//把选中的服务保存到销售品规格中 第二步
	var _setServ2OfferSpecSub = function(prodId,offerSpec,roles){
		if(offerSpec!=undefined){
			$.each(offerSpec.offerRoles,function(){
				$.each(this.roleObjs,function(){
					var nowProd=prodId+"_"+this.objId;
					
					$(roles).each(function(i,role) { 
						var oldProd=role.prodId+"_"+role.objId;
							
						if(nowProd==oldProd){
							this.selQty = 1;
							return false;
						}else{
							this.selQty = 2;
						}
					});
				});
			});
		}
	};
	
	//校验销售品的互斥依赖 第三步
	var _checkOfferExcludeDependSub = function(prodId,offerSpec){
		var offerSpecId = offerSpec.offerSpecId;
		var param = CacheData.getExcDepOfferParam(prodId,offerSpecId);
		var data = query.offer.queryExcludeDepend(param);//查询规则校验
		if(data!=undefined){
			paserOfferDataSub(data.result,prodId,offerSpecId,offerSpec.offerSpecName); //解析数据
		}
	};
	
	//校验销售品的互斥依赖 第三步
	var _checkOfferExcludeDependSub = function(prodId,offerSpec){
		var offerSpecId = offerSpec.offerSpecId;
		var param = CacheData.getExcDepOfferParam(prodId,offerSpecId);
		var data = query.offer.queryExcludeDepend(param);//查询规则校验
		if(data!=undefined){
			paserOfferDataSub(data.result,prodId,offerSpecId,offerSpec.offerSpecName); //解析数据
		}
	};
	
	//解析互斥依赖返回结果
	var paserOfferDataSub = function(result,prodId,offerSpecId,specName){
		var content = "";
		//转换接口返回的互斥依赖
		var param = {  
				excludeOffer : [],   //互斥依赖显示列表
				defaultOffer : [], //默选的显示列表
				dependOffer : {  //存放互斥依赖列表
					dependOffers : [],
					offerGrpInfos : []
				}
		};
		if(result!=""){
			var exclude = result.offerSpec.exclude;
			var depend = result.offerSpec.depend;
			var defaultOffer=result.offerSpec.defaultList;
			//解析可选包互斥依赖组
			if(ec.util.isArray(exclude)){
				for (var i = 0; i < exclude.length; i++) {
					var offerList = CacheData.getOfferList(prodId); //互斥要去除已订购手动删除
					var flag = true;
					if(offerList!=undefined){
						for ( var j = 0; j < offerList.length; j++) {
							if(offerList[j].isdel=="Y"){
								if(offerList[j].offerSpecId == exclude[i].offerSpecId){  //返回互斥数组在已订购中删除，不需要判断
									flag = false;
									break;
								}
							}
						}
					}
					if(flag){
						content += "需要关闭：   " + exclude[i].offerSpecName + "<br>";
						param.excludeOffer.push(exclude[i].offerSpecId);
					}
				}
			}
			if(depend!=undefined && ec.util.isArray(depend.offerInfos)){
				for (var i = 0; i < depend.offerInfos.length; i++) {	
					content += "需要开通： " + depend.offerInfos[i].offerSpecName + "<br>";
					param.dependOffer.dependOffers.push(depend.offerInfos[i].offerSpecId);
				}	
			}
			if(depend!=undefined && ec.util.isArray(depend.offerGrpInfos)){
				for (var i = 0; i < depend.offerGrpInfos.length; i++) {
					var offerGrpInfo = depend.offerGrpInfos[i];
					param.dependOffer.offerGrpInfos.push(offerGrpInfo);
					content += "需要开通： 开通" + offerGrpInfo.minQty+ "-" + offerGrpInfo.maxQty+ "个以下业务:<br>";
					if(offerGrpInfo.subOfferSpecInfos!="undefined" && offerGrpInfo.subOfferSpecInfos.length>0){
						for (var j = 0; j < offerGrpInfo.subOfferSpecInfos.length; j++) {
							var subOfferSpec = offerGrpInfo.subOfferSpecInfos[j];
							var offerSpec=CacheData.getOfferSpec(prodId,subOfferSpec.offerSpecId);
							if(ec.util.isObj(offerSpec)){
								if(offerSpec.isdel!="Y"&&offerSpec.isdel!="C"){
									content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" disabled="disabled" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
								}else{
									content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
								}
							}else{
								var offerSpec=CacheData.getOfferBySpecId(prodId,subOfferSpec.offerSpecId);
								if(ec.util.isObj(offerSpec)){
									if(offerSpec.isdel!="Y"&&offerSpec.isdel!="C"){
										content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" disabled="disabled" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
									}else{
										content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
									}
								}else{
									content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
								}
							}
						}
					}
				}
			}
			//解析可选包默选组
			if(ec.util.isArray(defaultOffer)){
				for (var i = 0; i < defaultOffer.length; i++) {	
					content += "需要开通： " + defaultOffer[i].offerSpecName + "<br>";
					param.defaultOffer.push(defaultOffer[i].offerSpecId);
				}	
			}
		}
		//var serContent=_servExDepReByRoleObjs(prodId,offerSpecId);//查询销售品构成成员的依赖互斥以及连带
		//content=content+serContent;
		
		AttachOffer.addOpenList(prodId,offerSpecId); 
//		if(content==""){ //没有互斥依赖
//			AttachOffer.addOpenList(prodId,offerSpecId); 
//		}else{	
//			content = "<div style='max-height:300px;overflow:auto;'>" + content + "</div>";
//			
//			$("#packageHiddenDiv").html(content);
//			
//			_setOffer2ExcludeOfferSpecSub(param);
//			excludeAddattch(prodId,offerSpecId,param);
//			excludeAddServ(prodId,"",paramObj);
//		}
	};

	
	var _checkOfferExcludeDepend = function(prodId,offerSpec){
		var offerSpecId = offerSpec.offerSpecId;
		var param = CacheData.getExcDepOfferParam(prodId,offerSpecId);
		var data = query.offer.queryExcludeDepend(param);//查询规则校验
		if(data!=undefined){
			paserOfferData(data.result,prodId,offerSpecId,offerSpec.offerSpecName); //解析数据
		}
	};
	
	//解析互斥依赖返回结果
	var paserOfferData = function(result,prodId,offerSpecId,specName){
		var content = "";
		//转换接口返回的互斥依赖
		var param = {  
				excludeOffer : [],   //互斥依赖显示列表
				defaultOffer : [], //默选的显示列表
				dependOffer : {  //存放互斥依赖列表
					dependOffers : [],
					offerGrpInfos : []
				}
		};
		if(result!=""){
			var exclude = result.offerSpec.exclude;
			var depend = result.offerSpec.depend;
			var defaultOffer=result.offerSpec.defaultList;
			//解析可选包互斥依赖组
			if(ec.util.isArray(exclude)){
				for (var i = 0; i < exclude.length; i++) {
					var offerList = CacheData.getOfferList(prodId); //互斥要去除已订购手动删除
					var flag = true;
					if(offerList!=undefined){
						for ( var j = 0; j < offerList.length; j++) {
							if(offerList[j].isdel=="Y"){
								if(offerList[j].offerSpecId == exclude[i].offerSpecId){  //返回互斥数组在已订购中删除，不需要判断
									flag = false;
									break;
								}
							}
						}
					}
					if(flag){
						content += "需要关闭：   " + exclude[i].offerSpecName + "<br>";
						param.excludeOffer.push(exclude[i].offerSpecId);
					}
				}
			}
			if(depend!=undefined && ec.util.isArray(depend.offerInfos)){
				for (var i = 0; i < depend.offerInfos.length; i++) {	
					content += "需要开通： " + depend.offerInfos[i].offerSpecName + "<br>";
					param.dependOffer.dependOffers.push(depend.offerInfos[i].offerSpecId);
				}	
			}
			if(depend!=undefined && ec.util.isArray(depend.offerGrpInfos)){
				for (var i = 0; i < depend.offerGrpInfos.length; i++) {
					var offerGrpInfo = depend.offerGrpInfos[i];
					param.dependOffer.offerGrpInfos.push(offerGrpInfo);
					content += "需要开通： 开通" + offerGrpInfo.minQty+ "-" + offerGrpInfo.maxQty+ "个以下业务:<br>";
					if(offerGrpInfo.subOfferSpecInfos!="undefined" && offerGrpInfo.subOfferSpecInfos.length>0){
						for (var j = 0; j < offerGrpInfo.subOfferSpecInfos.length; j++) {
							var subOfferSpec = offerGrpInfo.subOfferSpecInfos[j];
							var offerSpec=CacheData.getOfferSpec(prodId,subOfferSpec.offerSpecId);
							if(ec.util.isObj(offerSpec)){
								if(offerSpec.isdel!="Y"&&offerSpec.isdel!="C"){
									content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" disabled="disabled" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
								}else{
									content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
								}
							}else{
								var offerSpec=CacheData.getOfferBySpecId(prodId,subOfferSpec.offerSpecId);
								if(ec.util.isObj(offerSpec)){
									if(offerSpec.isdel!="Y"&&offerSpec.isdel!="C"){
										content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" disabled="disabled" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
									}else{
										content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
									}
								}else{
									content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
								}
							}
						}
					}
				}
			}
			//解析可选包默选组
			if(ec.util.isArray(defaultOffer)){
				for (var i = 0; i < defaultOffer.length; i++) {	
					content += "需要开通： " + defaultOffer[i].offerSpecName + "<br>";
					param.defaultOffer.push(defaultOffer[i].offerSpecId);
				}	
			}
		}
		
		AttachOffer.addOpenList(prodId,offerSpecId); 

	};
	
	//关闭已订购功能产品
	var _closeServ = function(prodId,servId){
		var serv = CacheData.getServ(prodId,servId);
		var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
		 if("13409244"==serv.servSpecId){//一卡双号虚号
			$.alert("提示","请通过“一卡双号退订”入口或者短信入口退订此功能");
		}else{ //关闭
			$span.addClass("del");
			serv.isdel = "Y";
		}
	};
	
	//关闭已订购可选包
	var _delOffer = function(prodId,offerId){
		var $span = $("#li_"+prodId+"_"+offerId).find("span"); //定位删除的附属
		if($span.attr("class")=="del"){  //已经退订，再订购
			//二次加载，如果原先就是删除状态，不需要操作
			//AttachOffer.addOffer(prodId,offerId,$span.text());
		}else { //退订
			var offer = CacheData.getOffer(prodId,offerId);
		
			if(!ec.util.isArray(offer.offerMemberInfos)){	
				var param = {
					prodId:prodId,
					areaId: OrderInfo.getProdAreaId(prodId),
					offerId:offerId	
				};
				if(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6){//主副卡纳入老用户
					for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
						if(prodId==OrderInfo.oldprodInstInfos[i].prodInstId){
							param.areaId = OrderInfo.oldprodInstInfos[i].areaId;
							param.acctNbr = OrderInfo.oldprodInstInfos[i].accNbr;
						}
					}
				}else{
					param.acctNbr = OrderInfo.getAccessNumber(prodId);
				}
				var data = query.offer.queryOfferInst(param);
				if(data==undefined){
					return;
				}
				//遍历附属的构成要和主套餐的构成实例要一致（兼容融合套餐）
				var offerMemberInfos=[];
				$.each(data.offerMemberInfos,function(){
					var prodInstId=this.objInstId;
					var flag=false;
					$.each(OrderInfo.offer.offerMemberInfos,function(){
						if(this.objInstId==prodInstId){
							flag=true;
							return false;
						}
					});
					if(flag){
						offerMemberInfos.push(this);
					}
				});
				
				offer.offerMemberInfos = data.offerMemberInfos=offerMemberInfos;
				offer.offerSpec = data.offerSpec;
			}
			var content = "";
			if(offer.offerSpec!=undefined){
				content = CacheData.getOfferProdStr(prodId,offer,1);
			}else {
				content = '退订【'+$span.text()+'】可选包' ;
			}
			
			//原本是有确认是否删除，二次加载不需要
			offer.isdel = "Y";
			$span.addClass("del");
			delServByOffer(prodId,offer);
		}
	};
	
	//删除附属销售品带出删除功能产品
	var delServByOffer = function(prodId,offer){	
		$.each(offer.offerMemberInfos,function(){
			var servId = this.objInstId;
			if($("#check_"+prodId+"_"+servId).attr("checked")=="checked"){
				var serv = CacheData.getServ(prodId,servId);
				if(ec.util.isObj(serv)){
					serv.isdel = "Y";
					var $li = $("#li_"+prodId+"_"+servId);
					$li.removeClass("canshu").addClass("canshu2");
					$li.find("span").addClass("del"); //定位删除的附属
				}
			}
		});
	};
	
	//终端校验
	var checkTerminalCode = function(prodId,offerSpecId,num,flag){
		var prodId=prodId;
		var offerSpecId=offerSpecId;
//		var terminalGroupId=$(obj).attr("terminalGroupId");
		var num=num;
		var flag=flag;
		if(flag==undefined){
			flag = 0 ;
		}
		
		//清空旧终端信息
		AttachOffer.filterAttach2Coupons(prodId,offerSpecId,num);
		
		//清空旧终端信息
//		for ( var i = 0; i < OrderInfo.attach2Coupons.length; i++) {
//			var attach2Coupon = OrderInfo.attach2Coupons[i];
//			if(offerSpecId == attach2Coupon.attachSepcId && prodId==attach2Coupon.prodId){
//				OrderInfo.attach2Coupons.splice(i,1);
//				break;
//			}
//		}
		var objInstId = prodId+"_"+offerSpecId;
//		var resId = $("#terminalSel_"+objInstId+"_"+terminalGroupId).val();
		var resIdArray = [];
		var terminalGroupIdArray = [];
		$("#"+objInstId+"  option").each(function(){
			resIdArray.push($(this).val());
		});
		$("#group_"+objInstId+"  option").each(function(){
			terminalGroupIdArray.push($(this).val());
		});
		var resId = resIdArray.join("|"); //拼接可用的资源规格id
		//alert(resId);
		var terminalGroupId = terminalGroupIdArray.join("|"); //拼接可用的资源终端组id
		//alert(terminalGroupId);
		if((resId==undefined || $.trim(resId)=="") && (terminalGroupId==undefined || $.trim(terminalGroupId)=="")){
			$.alert("信息提示","终端规格不能为空！");
			return;
		}
		var instCode = $("#terminalText_"+objInstId + "_"+num).val();
		if(instCode==undefined || $.trim(instCode)==""){
			$.alert("信息提示","终端串码不能为空！");
			return;
		}
		if(AttachOffer.checkData(objInstId,instCode)){
			return;
		}
		var param = {
			instCode : instCode,
			flag : flag,
			mktResId : resId
//			termGroup : terminalGroupId
		};
		var data = query.prod.checkTerminal(param);
		if(data==undefined){
			return;
		}
		var activtyType ="";
		//遍历已开通附属销售品列表
		for ( var i = 0; i < AttachOffer.openList.length; i++) {
			var open = AttachOffer.openList[i];
			for ( var j = 0; j < open.specList.length; j++) {  //遍历当前产品下面的附属销售品
				var spec = open.specList[j];
				if(spec.isdel != "Y" && spec.isdel != "C" && ec.util.isArray(spec.agreementInfos)){  //订购的附属销售品
                    if(spec.agreementInfos[0].activtyType == 2){
                    	activtyType = "2";
				    }
				}
			}
		}
		if(data.statusCd==CONST.MKTRES_STATUS.USABLE || (data.statusCd==CONST.MKTRES_STATUS.HAVESALE && activtyType=="2")){
			//$.alert("信息提示",data.message);
//			$("#terminalSel_"+objInstId).val(data.mktResId);
//			$("#terminalName").html(data.mktResName);
//			$("#terminalDesc").css("display","block");
//			var price = $("#terminalSel_"+objInstId).find("option:selected").attr("price");
			
			
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
			$("#terminalName_"+num).html("终端规格："+data.mktResName+",终端颜色："+mktColor+",合约价格："+mktPrice+"元");
			$("#terminalDesc_"+num).css("display","block");
			
			/*$("#terRes_"+objInstId).show();
			$("#terName_"+objInstId).text(data.mktResName);
			$("#terCode_"+objInstId).text(data.instCode);	
			if(price!=undefined){
				$("#terPrice_"+objInstId).text(price/100 + "元");
			}*/
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
				prodId : prodId, //产品ID
				offerId : -1, //销售品实例ID
				attachSepcId : offerSpecId,
				state : "ADD", //动作
				relaSeq : "", //关联序列	
				num	: num //第几个串码输入框
			};
			if(data.statusCd==CONST.MKTRES_STATUS.HAVESALE && activtyType=="2"){//“已销售未补贴”的终端串码可以办理话补合约
				coupon.couponSource ="2"; //串码话补标识
			}
			if(CONST.getAppDesc()==0){
				coupon.termTypeFlag=data.termTypeFlag;
			}
			OrderInfo.attach2Coupons.push(coupon);
		}else if(data.statusCd==CONST.MKTRES_STATUS.HAVESALE){
			$.alert("提示","终端当前状态为已销售为补贴[1115],只有在办理话补合约时可用");
		}else{
			$.alert("提示",data.message);
		}
	};
	
	var getIsMIFICheck=function(prodId){
		var prodIdTmp=(Math.abs(prodId)-1);
		if(AttachOffer.openServList.length>prodIdTmp){
			var specList = AttachOffer.openServList[prodIdTmp].servSpecList;
			for (var j = 0; j < specList.length; j++) {
				var spec = specList[j];
				if(spec.isdel!="Y" && spec.isdel!="C"){
					if(spec.servSpecId==CONST.PROD_SPEC_ID.MIFI_ID && CONST.APP_DESC==0){
						return true ; 
					}
				}
			}
		}
		return false;
	};
	//添加可选包到缓存列表
	var _setSpec = function(prodId,offerSpecId){
		var newSpec = CacheData.getOfferSpec(prodId,offerSpecId);  //没有在已选列表里面
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			newSpec = query.offer.queryAttachOfferSpec(prodId,offerSpecId); //重新获取销售品构成
			if(!newSpec){
				return;
			}
			CacheData.setOfferSpec(prodId,newSpec);
		}
		return newSpec;
	};
	
	//根据省内返回的数据校验拼成html
	var _checkAttachOffer = function(prodId){
		var content="";
		if(offerChange.resultOffer==undefined){
			return content;
		}
		//功能产品
		var prodInfos = offerChange.resultOffer.prodInfos;
		if(ec.util.isArray(prodInfos)){
			var str = "";
			$.each(prodInfos,function(){
//				var prodId = this.accProdInstId;
//				//容错处理，省份接入产品实例id传错
//				var flag = true;
//				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
//					if(this.objType==CONST.OBJ_TYPE.PROD && this.objInstId==prodId){  //接入类产品
//						flag = false;
//						return false;
//					}
//				});
				if(prodId!=this.accProdInstId){
					return true;
				}
				if(prodId!=this.prodInstId){ //功能产品
					var serv = CacheData.getServ(prodId,this.prodInstId);//已开通功能产品里面查找
					var servSpec = CacheData.getServSpec(prodId,this.productId);//已选功能产品里面查找
					if(this.state=="DEL"){
						if(serv!=undefined){
							str+='<li id="li_'+prodId+'_'+this.prodInstId+'" offerspecid="" offerid="'+this.prodInstId+'" isdel="N">'
									+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
									+'<span class="del">'+serv.servSpecName+'</span>'
								+'</li>';
						}else{
							if(servSpec!=undefined){
								str+='<li id="li_'+prodId+'_'+this.prodInstId+'" offerspecid="" offerid="'+this.prodInstId+'" isdel="N">'
										+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
										+'<span class="del">'+servSpec.servSpecName+'</span>'
									+'</li>';
							}else if(this.productName!=undefined && this.productName!=""){
								str+='<li id="li_'+prodId+'_'+this.prodInstId+'" offerspecid="" offerid="'+this.prodInstId+'" isdel="N">'
										+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
										+'<span class="del">'+this.productName+'</span>'
									+'</li>';
							}
						}	
					}else if(this.state=="ADD"){
						if(serv!=undefined){
							str+='<li id="li_'+prodId+'_'+this.prodInstId+'">'
									+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
									+'<span>'+serv.servSpecName+'</span>'
									+'<dd class="mustchoose"></dd>'
								+'</li>';
						}else{
							if(servSpec!=undefined){
								str+='<li id="li_'+prodId+'_'+this.prodInstId+'">'
										+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
										+'<span>'+servSpec.servSpecName+'</span>'
										+'<dd class="mustchoose"></dd>'
									+'</li>';
							}else if(this.productName!=undefined && this.productName!=""){
								str+='<li id="li_'+prodId+'_'+this.prodInstId+'">'
										+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
										+'<span>'+this.productName+'</span>'
										+'<dd class="mustchoose"></dd>'
									+'</li>';
								}
						}
					}
				}
			});
			if(str==""){
				content="";
			}else{
				content="<div class='fs_choosed'>订购4G流量包，需订购和取消如下功能产品：<br><ul>"+str+"</ul></div><br>";
			}
		}
	};
	return {
		checkTerminalCode:checkTerminalCode,
		chkState:_chkState,
		checkUim:_checkUim,
		closeServ:_closeServ,
		delOffer:_delOffer,
		opeSer:_opeSer,
		showOffer:_showOffer,
		initTounch:_initTounch,
		buildMainView:_buildMainView,
		buyService:_buyService,
		queryData:_queryData,
		searchPack              :_searchPack,
		init 					: 				_init,
		offerChangeView			:				_offerChangeView,
		changeOffer 			: _changeOffer,
		changeTab				: _changeTab,
		checkOrder				: _checkOrder,
		checkAttachOffer		: _checkAttachOffer,
		fillOfferChange			: _fillOfferChange,
		checkOfferProd			: _checkOfferProd,
		getChangeInfo			: _getChangeInfo,
		setChangeOfferSpec		: _setChangeOfferSpec
	};
})();