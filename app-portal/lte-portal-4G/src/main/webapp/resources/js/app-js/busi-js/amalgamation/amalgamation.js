/**
 * 对缓存数据操作
 * 
 *
 * date 2014-01-15
 */

CommonUtils.regNamespace("order", "amalgamation");

order.amalgamation = (function(){
	var ot = "";
	var _page_type = "";
	var _cot = "1000";
	var _allObjIdList = [];//套餐成员
	var main_upRange = []//上行速率
	var main_dwRange = [];//下行速率
	var upRange = []//上行速率
	var dwRange = [];//下行速率 
	var kd_flag = false;//完成宽带新装信息填写
	var gh_flag = false;//完成固话新装信息填写
	var gc_flag = false;//完成高清新装信息填写
	//套餐初始化
	var _initProd=function(){
//		OrderInfo.order.step=1;
//		OrderInfo.busitypeflag=1;
		//获取初始化查询的条件
//		order.service.queryApConfig();
		//初始化主套餐查询 
		_searchPack("all","","1000");
		kd_flag = false;//完成宽带新装信息填写
		gh_flag = false;//完成固话新装信息填写
		gc_flag = false;//完成高清新装信息填写
	};
	
	//主套餐查询
	var _searchPack = function(offerType,scroller,compOfferType){
		ot = offerType;
		if(compOfferType!=undefined && compOfferType.length>0){
			order.amalgamation.cot = compOfferType;
//			order.amalgamation.cot = "2000";
		}else compOfferType = order.amalgamation.cot;
//		var custId = OrderInfo.cust.custId;
//		var qryStr=$("#qryStr").val();
//		var params={"qryStr":qryStr,"pnLevelId":"","custId":custId};
		var params={"offerType":offerType,"subPage":"","qryStr":"","pnLevelId":"","custId":"","compOfferType":compOfferType,"downRate":"","PageSize":10};
//		if($("#categoryNodeId").length>0){
//			var categoryNodeId=$("#categoryNodeId").val();
//			params.categoryNodeId = categoryNodeId;
//		}
		
//		if(flag){
//			var priceVal = $("#select_price").val();
//			if(ec.util.isObj(priceVal)){
//				var priceArr = priceVal.split("-");
//				if(priceArr[0]!=null&&priceArr[0]!=""){
//					params.priceMin = priceArr[0] ;
//				}
//				if(priceArr[1]!=null&&priceArr[1]!=""){
//					params.priceMax = priceArr[1] ;
//				}
//			}
//			var influxVal = $("#select_influx").val();
//			if(ec.util.isObj(influxVal)){
//				var influxArr = influxVal.split("-");
//				if(influxArr[0]!=null&&influxArr[0]!=""){
//					params.INFLUXMin = influxArr[0]*1024 ;
//				}
//				if(influxArr[1]!=null&&influxArr[1]!=""){
//					params.INFLUXMax = influxArr[1]*1024 ;
//				}
//			}
//			var invoiceVal = $("#select_invoice").val();
//			if(ec.util.isObj(invoiceVal)){
//				var invoiceArr = invoiceVal.split("-");
//				if(invoiceArr[0]!=null&&invoiceArr[0]!=""){
//					params.INVOICEMin = invoiceArr[0] ;
//				}
//				if(invoiceArr[1]!=null&&invoiceArr[1]!=""){
//					params.INVOICEMax = invoiceArr[1] ;
//				}
//			}
//		}
		_queryData(params,offerType,scroller);
		
	};
	var _queryData = function(params,offerType,scroller) {
//		if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 14){
//			if(params.categoryNodeId == ""){
//				params.ifQueryFavorite = "Y";
//			}
//		}
		var url = contextPath+"/app/amalgamation/offerSpecList";
		$.callServiceAsHtml(url,params, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
//				$("#search-modal").modal('hide');
			},
			"done" : function(response){
				$.unecOverlay();
//				$("#search-modal").modal('hide');
				if(response.code != 0) {
					$.alert("提示","<br/>查询失败,稍后重试");
					return;
				}
				if(offerType == "all"){
					var content$ = $("#offer-list");
					content$.html(response.data);
				}else{
					OrderInfo.returnFlag = offerType;
					$("#page-add"+"_"+offerType).hide();
					var content$ = $("#searchProd"+"_"+offerType);
					content$.html(response.data).show();
				}
				
//				var content$ = $("#offer-list");
//				content$.html(response.data).show();
//				if(params.ifQueryFavorite && params.ifQueryFavorite == "Y"){
//					AttachOffer.myFavoriteOfferList = response.data.resultlst;
//				}
				if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
//				$.refresh(content$);
			},
			fail:function(response){
				$.unecOverlay();
//				$("#search-modal").modal('hide');
				$.alert("提示","套餐加载失败，请稍后再试！");
			}
		});
	};
	
	//滚动页面入口
	var _scroll = function(scrollObj){
		if(scrollObj && scrollObj.page && scrollObj.page >= 1){ 
			if(scrollObj.page==1){
				_searchPack(ot,scrollObj.scroll);
			}else{
				var show_per_page = 10;
				var size = $('#div_all_data').children().length;
				if(size<show_per_page){
					show_per_page = size;
				}
				$('#div_all_data').children().slice(0,show_per_page).appendTo($('#div_offer_list'));
				if(scrollObj.scroll && $.isFunction(scrollObj.scroll)) scrollObj.scroll.apply(this,[]);
			}
		}
	};
	
	var _selectOffer = function(obj,price){
//		_getPrtInfo($(obj).attr("id"));
//		return;
		if($(obj).attr("offerType") == "all"){
			if(order.amalgamation.allObjIdList[$(obj).attr("index")]!=undefined){
				var obj_list = order.amalgamation.allObjIdList[$(obj).attr("index")];
				//每种成员的可加装数量
				for(var i=0;i<obj_list.length;i++){
					var ctcd = obj_list[i].compTypeCd;
					if(ctcd!=undefined){
						if(ctcd=="20100002"){
							$("#yd_min").text(obj_list[i].minQty);
							$("#yd_max").text(obj_list[i].maxQty);
						}else if(ctcd=="10200001"){
							$("#kd_min").text(obj_list[i].minQty);
							$("#kd_max").text(obj_list[i].maxQty);
						}else if(ctcd=="10100001"){
							$("#gh_min").text(obj_list[i].minQty);
							$("#gh_max").text(obj_list[i].maxQty);
						}else if(ctcd=="10300001"){
							$("#gc_min").text(obj_list[i].minQty);
							$("#gc_max").text(obj_list[i].maxQty);
						}
					}
				}
			}
			$("#main_index").val($(obj).attr("index"));
			$("#main_prodName").val($(obj).attr("name"));
//			$("#main_objId").val($(obj).attr("objId"));
			$("#main_prodId").val($(obj).attr("id"));
			$("#main_offerNbr").val($(obj).attr("offerNbr"));
//			$("#main_prodNbr").val($(obj).attr("prodNbr"));
//			$("#main_RoleCd").val($(obj).attr("RoleCd"));
//			$("#main_compTypeCd").val($(obj).attr("compTypeCd"));
			
			_buyService($(obj).attr("id"),price);
			
		}else{
			var offerType = "_"+$(obj).attr("offerType");
//			$("#searchProd"+offerType).empty();
//			order.broadband.ProdOfferInfo[0] = {
//					"OfferProdRelInfo":[{"ProdInstId":"-1","RoleCd":$(obj).attr("compTypeCd"),"RoleName":""}],
//					"ProdOfferInstId":"-1",
//					"ProdOfferNbr":$(obj).attr("offerNbr")
//					};
			OrderInfo.returnFlag = "";
			$("#page-add"+offerType).show();
			$("#searchProd"+offerType).empty();
			$("#upsl"+offerType).show();
			$("#dwsl"+offerType).show();
			$("#submite-box-1"+offerType).show();
			$("#searchProd"+offerType).hide();
			$("#index"+offerType).val($(obj).attr("index"));
			$("#prodName"+offerType).val($(obj).attr("name"));
//			$("#objId"+offerType).val($(obj).attr("objId"));
			$("#prodId"+offerType).val($(obj).attr("id"));
			$("#offerNbr"+offerType).val($(obj).attr("offerNbr"));
//			$("#prodNbr"+offerType).val($(obj).attr("prodNbr"));
//			$("#RoleCd"+offerType).val($(obj).attr("RoleCd"));
//			$("#compTypeCd"+offerType).val($(obj).attr("compTypeCd"));
//			$("#price").val(price);
			order.amalgamation.prodSpecParamQuery($(obj).attr("offerType"));
		}
	}

	//订购销售品
	var _buyService = function(specId,price) {
//		OrderInfo.cust.custId = "-1";
//		OrderInfo.staff.soAreaId = "8210100";
//		OrderInfo.cust.areaId = "8210100";
		if(OrderInfo.cust.custId==undefined || OrderInfo.cust.custId==""){
			OrderInfo.cust.custId = "-1";
		}
		var custId = OrderInfo.cust.custId;
//		offerprice = price;
		if(OrderInfo.cust==undefined || custId==undefined || custId==""){
			$.alert("提示","在订购套餐之前请先进行客户定位！");
			return false;
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
//				rule.rule.ruleCheck(boInfos,function(checkData){//业务规则校验通过
//					if(ec.util.isObj(checkData)){
//						$("#order_prepare").hide();
//						var content$ = $("#order").html(checkData).show();
//						$.refresh(content$);
//					}else{
						if(!_opeSer(param)){
							return false;
						}
//					}
//				});
			}
		}
//		if($("#enter").length > 0 && $("#enter").val() != "3") OrderInfo.returnFlag="";
	};

	//获取销售品构成，并选择数量
	var _opeSer = function(inParam){
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
							return false;
						}
						var iflag = 0; //判断是否弹出副卡选择框 false为不选择
						var max=0;
						var str="";
//						$("#div_content").empty();
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
										return false;
									}
								});
							}
						});
						_setOfferSpec(max);
						if(order.phoneNumber.initPhonenumber()){
							$("#offer").hide();
							$("#offer-list").empty();
//							$("#fk").click();
						}
						return true;
//						order.main.buildMainView(param);
					}
					else if (response.code==-2){
						$.alertM(response.data);
						return false;
					}else {
						$.alert("提示","查询销售品规格构成失败,稍后重试");
						return false;
					}
				}
			});
	
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
//						if(OrderInfo.actionFlag==1){
//							$("#max_num").text(max);//显示最大副卡数量
//						}
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
	
	var _prodSpecParamQuery = function(type){
		var or = "";
		var ps = "";
		var pi = "";
		var tagot = "";
		if(type=="kd"){
			tagot = "10200001";
			kd_flag = true;//完成宽带新装信息填写
		}else if(type=="gh"){
			tagot = "10100001";
			gh_flag = true;//完成固话新装信息填写
		}if(type=="gc"){
			tagot = "10300001";
			gc_flag = true;//完成高清新装信息填写
		}
		type = "_"+type;
		if(order.amalgamation.cot == "1000"){
			pi = $("#main_prodId").val();
			if(order.amalgamation.allObjIdList[$("#main_index").val()]!=undefined){
				var obj_list = order.amalgamation.allObjIdList[$("#main_index").val()];
				for(var i=0;i<obj_list.length;i++){
					var ctcd = obj_list[i].compTypeCd;
					if(ctcd!=undefined){
						if(ctcd==tagot){
							or = obj_list[i].roleCd;
							ps = obj_list[i].objId;
							$("#objId"+type).val(ps);
							$("#prodNbr"+type).val(obj_list[i].prodNbr);
							$("#RoleCd"+type).val(or);
							$("#compTypeCd"+type).val(ctcd);
						}
					}
				}
			}
		}else{
			pi = $("#prodId"+type).val();
			if(order.amalgamation.allObjIdList[$("#index"+type).val()]!=undefined){
				var obj_list = order.amalgamation.allObjIdList[$("#index"+type).val()];
				for(var i=0;i<obj_list.length;i++){
					var ctcd = obj_list[i].compTypeCd;
					if(ctcd!=undefined){
						if(ctcd==tagot){
							or = obj_list[i].roleCd;
							ps = obj_list[i].objId;
							$("#objId"+type).val(ps);
							$("#prodNbr"+type).val(obj_list[i].prodNbr);
							$("#RoleCd"+type).val(or);
							$("#compTypeCd"+type).val(ctcd);
						}
					}
				}
			}
		}
			
				
		var params = {
				"areaId" : OrderInfo.staff.areaId,
				"channelId" : OrderInfo.staff.channelId,
				"staffId" : OrderInfo.staff.staffId,
				"offerRoleId":or,
				"offerSpecId":pi,
				"prodSpecId":ps
		};
		upRange = [];
		dwRange = [];
		var url= contextPath+"/app/prod/prodSpecParamQuery";
		$.callServiceAsJsonGet(url, params, {
			"before":function(){
				$.ecOverlay("<strong>正在查询产品属性中,请稍等会儿....</strong>");
			},	
			"done" : function(response){
				$.unecOverlay();
				if (response.code==0) {
					if(response.data.result.prodSpecParams!=undefined){
						$("#upslList"+type).empty();
						for(var k=0;k<response.data.result.prodSpecParams.length;k++){
							if(response.data.result.prodSpecParams[k].itemSpecId==10010161){
								upRange = response.data.result.prodSpecParams[k].valueRange
							}else if(response.data.result.prodSpecParams[k].itemSpecId==10010162){
								dwRange = response.data.result.prodSpecParams[k].valueRange
							}
						}
						for(var i=0;i<upRange.length;i++){
							$("#upslList"+type).append("<option value='"+upRange[i].value+"' >"+upRange[i].text+"</option>");
						}
						order.broadband.init_select();
						
						$("#dwslList"+type).empty();
						if(order.amalgamation.cot == "1000"){
							for(var i=0;i<dwRange.length;i++){
//								var rlist = order.broadband.alldownRateList[$("#main_index").val()];
//								for(var j=0;j<rlist.length;j++){
									if(dwRange[i].text == "512K"){
										dwRange[i].text = "0.5"
									}
//									if(dwRange[i].text.replace("M","") == rlist[j].rateRelVal){
										$("#dwslList"+type).append("<option value='"+dwRange[i].value+"' >"+dwRange[i].text+"</option>");
//									}
//								}
							}
						}else{
							for(var i=0;i<dwRange.length;i++){
								var rlist = order.broadband.alldownRateList[$("#main_index").val()];
								for(var j=0;j<rlist.length;j++){
									if(dwRange[i].text == "512K"){
										dwRange[i].text = "0.5"
									}
									if(dwRange[i].text.replace("M","") == rlist[j].rateRelVal){
										$("#dwslList"+type).append("<option value='"+dwRange[i].value+"' >"+dwRange[i].text+"</option>");
									}
								}
							}
						}
						order.broadband.init_select();
					}
				}else{
					$.alertM(response.data);
				}
			},
			"always":function(){
				$.unecOverlay();
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询产品属性失败,稍后重试");
			}
		});
	}
	
	//宽带新装
	var _page_kd = function(prodType){
		
		var pt = "_" + prodType;
		if($("#page"+pt).children().length>0){
			$("#all_prod").hide();
			$("#page"+pt).show();
		}else{
			var url = "/app/amalgamation/page_kd";
			var param = {"prodType":prodType};
			$.callServiceAsHtml(contextPath+url,param,{
				"before":function(){
					$.ecOverlay("正在努力加载中，请稍等...");
				},
				"done" : function(response){
					$.unecOverlay();
					OrderInfo.returnFlag = "add";
					$("#all_prod").hide();
					$("#page"+pt).html(response.data).show();
					if(order.amalgamation.cot=="1000"){
						$("#prodName"+pt).val($("#main_prodName").val());
//						$("#objId"+pt).val($("#main_objId").val());
						$("#prodId"+pt).val($("#main_prodId").val());
						$("#offerNbr"+pt).val($("#main_offerNbr").val());
//						$("#prodNbr"+pt).val($("#main_prodNbr").val());
//						$("#RoleCd"+pt).val($("#main_RoleCd").val());
//						$("#compTypeCd"+pt).val($("#main_compTypeCd").val());
						$("#tcxz"+pt).attr("onclick","");
						
						order.amalgamation.prodSpecParamQuery(prodType);
						
						$("#upsl"+pt).show();
						$("#dwsl"+pt).show();
					}
				},fail:function(response){
					$.unecOverlay();
					$.alert("提示","查询失败，请稍后再试！");
				}
			});
		}
	}
	
	//地址查询
	var _searchADD = function(prodType){
		var pt = "_" + prodType;
		var url = "/app/amalgamation/searchADD";
		var param = {"prodType":prodType};
		$.callServiceAsHtml(contextPath+url,param,{
			"before":function(){
				$.ecOverlay("正在努力加载中，请稍等...");
			},
			"done" : function(response){
				$.unecOverlay();
				OrderInfo.returnFlag = pt;
				$("#page-add"+pt).hide();
				$("#searchADD"+pt).html(response.data).show();
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			}
		});
	}
	
	var _showAllProd = function(id){
		$("#"+id).hide();
		$("#all_prod").show();
		OrderInfo.returnFlag="";
	}
	
	var _goChuXiao = function(){
		if(kd_flag == false){
			$.alert("提示","请完成宽带信息填写！");
			return;
		}
		if(gh_flag == false){
			$.alert("提示","请完成固话信息填写！");
			return;
		}
		if(gc_flag == false){
			$.alert("提示","请完成天翼高清信息填写！");
			return;
		}
		order.main.buildMainView();
//		_buildMainView();
//		$("#cx").click();
	}
	
	var _goOther = function(){
		$("#qt").click();
	}
	
	var _goConfirm = function(){
//		if(OrderInfo.cust.custId != undefined && OrderInfo.cust.custId != ""){
			var kdobjid = "-11111111111";//$("#main_objId").val();
			var tcprodId = "-11111111111";//$("#main_prodId").val();
			if($("#main_prodName").val().length==0){
				kdobjid = "-11111111111";
				tcprodId = "-11111111111";
			}
			var url = "/app/amalgamation/confirm";
			var param = {"objectInfos": [
			                             {
			                                 "boActionType": "1",
			                                 "objId": kdobjid,//100101000003,
			                                 "objType": 2
			                             },
			                             {
			                                 "boActionType": "S1",
			                                 "objId": tcprodId,
			                                 "objType": 7
			                             }
			                         ]};
			$.callServiceAsHtml(contextPath+url,param,{
				"before":function(){
					$.ecOverlay("正在努力加载中，请稍等...");
				},
				"done" : function(response){
					$.unecOverlay();
//					OrderInfo.order.step = 3;
//					$("#orderContent").hide();
//					$("#searchADD").hide();
//					$("#searchProd").hide();
//					$("#cust").hide();
//					$("#confirm").show();
					$("#rh_syt").html(response.data).hide();
					
//					$("#kh").removeClass("active");
//					$("#kh_1").addClass("dis-none");
//					$("#jd").addClass("active");
//					$("#jd_1").removeClass("dis-none");
					
//					$("#prod_confirm").text($("#prodName").val());
//					$("#jrfs_confirm").text($("#jrfs_name").val());
//					$("#sl_confirm").text($("#slList").val()+"M");
//					alert(JSON.stringify(OrderInfo.cust));
					if(OrderInfo.cust.custId == -1){
//						$("#userName").val(OrderInfo.cust.custOther1.contactName);
//						$("#userPhone").val(OrderInfo.cust.custOther1.mobilePhone);
					}else{
//						if(OrderInfo.cust.contactInfos[0].contactName != undefined && OrderInfo.cust.contactInfos[0].contactName != ""){
//							$("#userName").val(OrderInfo.cust.contactInfos[0].contactName);
//						}
//						if(OrderInfo.cust.contactInfos[0].contactMobilePhone != undefined && OrderInfo.cust.contactInfos[0].contactMobilePhone != ""){
//							$("#userPhone").val(OrderInfo.cust.contactInfos[0].contactMobilePhone);
//						}
					}
				},fail:function(response){
					$.unecOverlay();
					$.alert("提示","费用信息查询失败，请稍后再试！");
				}
			});
//		}else{
//			$.alert("提示","请完成客户定位！");
//		}
//		$("#jd").click();
	}
	
	var _prt = function(params){
//		var voucherInfo = {
//				"olId":"700000995719",
//				"soNbr":"1472177241927685",
//				"busiType":"1",
//				"chargeItems":[{"realAmount":"3000","feeAmount":"3000","paymentAmount":"3000","acctItemTypeId":"2014000","objId":"235010000","objType":"2","acctItemId":"700000567982","boId":"700007289964","prodId":"700019420660","objInstId":"700019420660","terminalNo":"","posSeriaNbr":"","remark":"","boActionType":"1"}],
//				"areaId":"8510101",
//				"custName":"张强富"
//			};
//			common.print.signVoucher(params);
//			return;
			var PcFlag="1";
			params.PcFlag=PcFlag;
			var url=contextPath+"/order/sign/previewHtmlForSign";
			$.callServiceAsHtml(url, params, {
				"before":function(){
					$.ecOverlay("<strong>生成回执预览的html,请稍等会儿....</strong>");
				},"always":function(){
					$.unecOverlay();
				},	
				"done" : function(response){
					if (response.code == 0) {
						$("#nav-tab-6").hide();
						$("#order-print").html(response.data).show();
						OrderInfo.returnFlag = "hz";
						$("#datasignBtn").off("click").on("click",function(){
							common.callDatasign("common.print.showDataSign");
							/*var b=$("#signinput").val();
							common.print.showDataSign(b);*/
						});
						$("#photoPrint").off("click").on("click",function(){
							common.callAgreePhoto(params.olId);
						});
					
						$("#print_ok").off("click").on("click",function(){
							if(!ec.util.isObj($("#signinput").val())){
								$.alert("提示","请先进行签名，然后再保存！");
							}else{
								_saveHtml2Pdf();
							}
						});
					}else if (response.code == -2) {
						$.alertM(response.data);
					}else{
						$.alert("提示","生成回执预览的html失败!");
					}
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","服务忙，请稍后再试！");
				}
			});
	}
	
	var _getPrtInfo = function(voucherInfo){
		var voucherInfo = {
		"olId":"700000995719",
		"soNbr":"1472177241927685",
		"busiType":"1",
		"chargeItems":[{"realAmount":"3000","feeAmount":"3000","paymentAmount":"3000","acctItemTypeId":"2014000","objId":"235010000","objType":"2","acctItemId":"700000567982","boId":"700007289964","prodId":"700019420660","objInstId":"700019420660","terminalNo":"","posSeriaNbr":"","remark":"","boActionType":"1"}],
		"areaId":"8510101",
		"custName":"张强富"
	};
		var PcFlag="1";
		voucherInfo.PcFlag=PcFlag;
		var url=contextPath+"/app/amalgamation/getVoucherData";
		$.callServiceAsJson(url, voucherInfo, {
			"before":function(){
				$.ecOverlay("<strong>生成回执预览的html,请稍等会儿....</strong>");
			},
			"done" : function(response){
				if (response.code == 0) {
					$.unecOverlay();
//					alert(JSON.stringify(response.data.result));
//					if(response.data.result.result.advInfos!=undefined){
//						voucherInfo.result.advInfos = response.data.result.result.advInfos;
//					}
//					if(response.data.result.result.bizReportDetail!=undefined){
//						for(var n=0;n<response.data.result.result.bizReportDetail.length;n++){
//							if(response.data.result.result.bizReportDetail[n].detailCd == 110101){
//								if(response.data.result.result.bizReportDetail[n].bizReportDetailItemDto!=undefined && response.data.result.result.bizReportDetail[n].bizReportDetailItemDto.length>0){
//									var dowslstr = response.data.result.result.bizReportDetail[n].bizReportDetailItemDto[0].itemValue;
//									dowslstr = dowslstr.replace("${accountNo}","*").replace("${accessNo}","*").replace("${accountStatus}","*");
//									response.data.result.result.bizReportDetail[n].bizReportDetailItemDto[0].itemValue = dowslstr;
//								}
//								voucherInfo.result.orderEvent[0].orderEventCont.userAcceNbrs[0] = response.data.result.result.bizReportDetail[n];
//							}
//							else if(response.data.result.result.bizReportDetail[n].detailCd == 110102){
//								voucherInfo.result.orderEvent[0].orderEventCont.osBaseInfo[0] = response.data.result.result.bizReportDetail[n];
//							}
//							else if(response.data.result.result.bizReportDetail[n].detailCd == 110104){
//								voucherInfo.result.orderEvent[0].orderEventCont.osOrderInfo[0] = response.data.result.result.bizReportDetail[n];
//							}
//							else if(response.data.result.result.bizReportDetail[n].detailCd == 110105){
//								voucherInfo.result.orderEvent[0].orderEventCont.osOtherInfo[0] = response.data.result.result.bizReportDetail[n];
//							}
//						}
//					}
//					if(response.data.result.result.effectRule!=undefined){
//						voucherInfo.result.orderEvent[0].orderEventTitle.effectRule = response.data.result.result.effectRule;
//					}
//					if(response.data.result.result.aliasName!=undefined){
//						voucherInfo.result.orderEvent[0].orderEventTitle.prodSpecName = response.data.result.result.aliasName;
//					}
//					if($("#prodName").val().length==0){
//						voucherInfo.result.orderEvent[0].orderEventTitle = {};
//					}
//					order.amalgamation.prt(response.data);
					
				}else{
					$.unecOverlay();
					$.alertM(response.data);
				}
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			}
		});
	}
	
var _saveHtml2Pdf=function(){
		var accNbr="";
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14 || OrderInfo.actionFlag==112){ //新装
			accNbr=OrderInfo.getAccessNumber(-1);
		}else if(OrderInfo.actionFlag==13 || OrderInfo.actionFlag==17 || OrderInfo.actionFlag==18){ //裸机销售		
		}else{//二次业务
			accNbr=order.prodModify.choosedProdInfo.accNbr;
		}
		var certType=OrderInfo.cust.identityCd;
		if(certType==undefined||certType==null||certType==''){
			certType=OrderInfo.boCustIdentities.identidiesTypeCd;
		}
		var params={
			olId:OrderInfo.orderResult.olId,
			signFlag:"5",
			busiType:"9",
			sign:_splitBaseforStr($("#signinput").val()),
			srcFlag:"APP",
			custName:OrderInfo.cust.printCustName,
			certType:certType,
			certNumber:OrderInfo.cust.printIdCardNbr,
			accNbr:accNbr
		};
		var url=contextPath+"/order/sign/saveSignPdfForApp";
		$.callServiceAsJson(url, params, {
			"before":function(){
				$.ecOverlay("<strong>正在保存回执,请稍等会儿....</strong>");
			},	
			"done" : function(response){
				$.unecOverlay();
				if (response.code == 0) {
					$(".item_fee").each(function(){
                    	$(this).attr("onclick","");
                    });
					OrderInfo.returnFlag = "";
					$("#nav-tab-6").show();
					$("#order-print").hide();
					$("#printVoucherA").attr("disabled","disabled");//回执保存成功后  回执按钮改为灰色不可操作
//					$("#showPdf").show();
					OrderInfo.order.step=3;
				}else if (response.code == -2) {
					$.alertM(response.data);
				}else{
					var error=response.data.errData!=null?response.data.errData:"保存回执失败!";
					$.alert("提示",error);
				}
			}
		});
		
	};
	
	return {
		page_type	: _page_type,
		cot			: _cot,
		initProd	: _initProd,
		searchPack	: _searchPack,
		scroll		: _scroll,
		selectOffer	: _selectOffer,
		page_kd		: _page_kd,
		searchADD	: _searchADD,
		showAllProd	: _showAllProd,
		goChuXiao	: _goChuXiao,
		goOther		: _goOther,
		goConfirm	: _goConfirm,
		allObjIdList	: _allObjIdList,
		prodSpecParamQuery	: _prodSpecParamQuery,
		prt			: _prt,
		getPrtInfo	: _getPrtInfo
	}
})()