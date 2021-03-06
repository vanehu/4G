/**
 * 选号码入口
 * 
 * @author yanghm
 */
CommonUtils.regNamespace("order", "phoneNumber");
/**
 * 号码查询
 */
order.phoneNumber = (function(){
	var _step=1;//页面步骤，默认1
	var _mainFlag="true";//是否主卡选号码
	var _secondaryCarNum=0;//副卡数目
	var selectedObj=null;//密码预占查询选中号码对象
	var _boProdAn = {
			accessNumber : "", //接入号
			org_level:"",//原始的号码等级，为了页面展示增加的字段
			level : "", //等级
			anId : "", //接入号ID
			anTypeCd : "",//号码类型
			areaId:"",
			areaCode:"",
			memberRoleCd:"",
			preStore:"",
			minCharge:""
	};
	
	var _initPhonenumber=function(){
		if(order.service.enter=="1" && !order.service.isCloudOffer){
			if(!cust.preCheckCertNumberRel()){//选套餐入口在初始化号池前校验，排除天翼云盘
				return;
			}
		}
		order.phoneNumber.queryApConfig();//查询号码段和号码类型 
		order.phoneNumber.queryPhoneNbrPool();//查询号池		
	};
	//主卡查询号池
	var _queryPhoneNbrPool = function(){
		var url=contextPath+"/app/mktRes/phonenumber/queryPhoneNbrPool";
		var param={};
		$.callServiceAsJson(url,param,{
			"before":function(){
				$.ecOverlay("<strong>查询中,请稍等...</strong>");
			},
			"always":function(){
				//$.unecOverlay();
			},
			"done" : function(response){
				$.unecOverlay();
				if (response.code==0) {
					if(response.data){
						var phoneNbrPoolList= response.data.phoneNbrPoolList;
						if(OrderInfo.actionFlag == 112){
							$("#nbrPool").empty();
							//$("#nbrPool").append('<option value="" selected="selected">请选择号池</option>');
							if(phoneNbrPoolList!=null){
								$.each(phoneNbrPoolList,function(){
									var $option = "";
									if(this.localPool == 1){
										$option = $('<option value="'+this.poolId+'" selected="selected">'+this.poolName+'</option>');
									}
									else{
									    $option = $('<option value="'+this.poolId+'">'+this.poolName+'</option>');
									}
									$("#nbrPool").append($option);
								});
							}
						}else{
							$("#nbrPoolDiv").empty();
							var $div =$('<i class="iconfont pull-left p-l-10">&#xe66c;</i>');
							var $div2 =$('<i class="iconfont pull-right p-r-10">&#xe66e;</i>');
							var $sel = $('<select id="nbrPool" class="myselect select-option" data-role="none"></select>');  
							//var $defaultopt = $('<option value="" selected="selected">请选择号池</option>');
							//$sel.append($defaultopt);
							if(phoneNbrPoolList!=null){
								$.each(phoneNbrPoolList,function(){
									var $option = "";
									if(this.localPool == 1){
										$option = $('<option value="'+this.poolId+'" selected="selected">'+this.poolName+'</option>');
									}
									else{
									    $option = $('<option value="'+this.poolId+'">'+this.poolName+'</option>');
									}
									$sel.append($option);
								});
							}
							$("#nbrPoolDiv").append($div).append($sel).append($div2);
						}
						var poolId = $("#nbrPool option:selected").val();
						if(poolId==undefined || poolId==""){
							$.alert("提示","当前号池为空，请联系管理人员处理");
							return;
						}
						_btnQueryPhoneNumber(1);
						order.broadband.init_select();//刷新select组件，使样式生效

					}
				}else if(response.code == -2){
					$.alertM(response.data);
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","号池查询失败，请稍后再试！");
			}
		});
	};
	
	//副卡查询号池
	var _queryPhoneNbrPool2 = function(){
		var url=contextPath+"/app/mktRes/phonenumber/queryPhoneNbrPool";
		var param={};
		
		$.ecOverlay("<strong>查询号码中,请稍等...</strong>");
		$.callServiceAsJson(url,param,{
			"before":function(){
//				$.ecOverlay("<strong>查询中,请稍等...</strong>");
			},
			"always":function(){
//				$.unecOverlay();
			},
			"done" : function(response){
//				$.unecOverlay();
				if (response.code==0) {
					if(response.data){
						$("#nbrPoolDiv2").empty();
						var phoneNbrPoolList= response.data.phoneNbrPoolList;
						var $div =$('<i class="iconfont pull-left p-l-10">&#xe66c;</i>');
						var $div2 =$('<i class="iconfont pull-right p-r-10">&#xe66e;</i>');
						var $sel = $('<select id="nbrPool2" class="myselect select-option" data-role="none"></select>');  
						//var $defaultopt = $('<option value="" selected="selected">请选择号池</option>');
						//$sel.append($defaultopt);
						if(phoneNbrPoolList!=null){
							$.each(phoneNbrPoolList,function(){
								var $option = "";
								if(this.localPool == 1){
									$option = $('<option value="'+this.poolId+'" selected="selected">'+this.poolName+'</option>');
								}
								else{
								    $option = $('<option value="'+this.poolId+'">'+this.poolName+'</option>');
								}
								$sel.append($option);
							});
						}
						$("#nbrPoolDiv2").append($div).append($sel).append($div2);
						_btnQueryPhoneNumber2();
						order.broadband.init_select();//刷新select组件，使样式生效

					}
				}else if(response.code == -2){
					$.unecOverlay();
					$.alertM(response.data);
				}else{
					$.unecOverlay();
					$.alert("提示","号池加载失败，请稍后再试！");
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","号池查询失败，请稍后再试！");
			}
		});
	};
	
	//查询平台配置信息(号码段和号码类型)
	var _queryApConfig=function(){
		var configParam={"CONFIG_PARAM_TYPE":"TERMINAL_AND_PHONENUMBER"};
		var qryConfigUrl=contextPath+"/app/order/queryApConf";
		$.callServiceAsJsonGet(qryConfigUrl, configParam,{
			"done" : call_back_success_queryApConfig
		});
	};
	var call_back_success_queryApConfig=function(response){
		$("#pnHeadDiv").empty();
		$("#pnTypeDiv").empty();
		var PHONE_NUMBER_SEGMENT;
		var PHONE_NUMBER_FEATURE;
		if(response.data){
			var dataLength=response.data.length;
			//号段
			var $div =$('<i class="iconfont pull-left p-l-10">&#xe61d;</i>');
			var $div2 =$('<i class="iconfont pull-right p-r-10">&#xe66e;</i>');
			var $sel = $('<select id="pnHead" class="myselect select-option" data-role="none" ></select>');  
			var $defaultopt = $('<option value="" selected="selected">请选择号段</option>');
			$sel.append($defaultopt);
			for (var i=0; i < dataLength; i++) {
				if(response.data[i].PHONE_NUMBER_SEGMENT){
				  	PHONE_NUMBER_SEGMENT=response.data[i].PHONE_NUMBER_SEGMENT;
				  	for(var m=0;m<PHONE_NUMBER_SEGMENT.length;m++){
				  		var $option = "";
				  		var  numberStart=PHONE_NUMBER_SEGMENT[m].COLUMN_VALUE_NAME;
				  		numberStart=numberStart.replace(/\"/g, "");
			  		    $option = $('<option value="'+numberStart+'">'+numberStart+'</option>');				  		
						$sel.append($option);
				  }
				  continue;
				}
			}
			$("#pnHeadDiv").append($div).append($sel).append($div2);
			order.broadband.init_select();//刷新select组件，使样式生效
			//号码类型
			var $div =$('<i class="iconfont pull-left p-l-10">&#xe602;</i>');
			var $div2 =$('<i class="iconfont pull-right p-r-10">&#xe66e;</i>');
			var $sel = $('<select id="pnType" class="myselect select-option" data-role="none"></select>');  
			var $defaultopt = $('<option value="" selected="selected">请选择类型</option>');
			$sel.append($defaultopt);
			for (var i=0; i < dataLength; i++) {
				if(response.data[i].PHONE_NUMBER_FEATURE){
				  	PHONE_NUMBER_FEATURE=response.data[i].PHONE_NUMBER_FEATURE;
				  	var featureLength;
				  	if(PHONE_NUMBER_FEATURE.length<=9){
				  		featureLength=PHONE_NUMBER_FEATURE.length;
				  	}else{
				  		featureLength=9;
				  	}
				  	for(var m=0;m<featureLength;m++){
				  		var numberFeature=(PHONE_NUMBER_FEATURE[m].COLUMN_VALUE_NAME).replace(/\"/g, "");
				  		var numberFeatureVal=(PHONE_NUMBER_FEATURE[m].COLUMN_VALUE).replace(/\"/g, "");
				  		var $option = $('<option value="'+numberFeatureVal+'">'+numberFeature+'</option>');				  		
						$sel.append($option);				  		
				  	}			  	
					continue;
				}
			};
			$("#pnTypeDiv").append($div).append($sel).append($div2);
			order.broadband.init_select();//刷新select组件，使样式生效
		}
	};
	
	//主卡号码列表查询
	var _btnQueryPhoneNumber=function(flag,scroller,ifMain){
		var poolId = $("#nbrPool option:selected").val();
		if(poolId==undefined || poolId==""){
			$.alert("提示","当前号池为空，请联系管理人员处理");
			return;
		}
		
//		if(mainFlag=="false"){//走副卡查询
//			_btnQueryPhoneNumber2();
//			return;
//		}
		//是否主卡号码查询
		if(ifMain==undefined){
			ifMain = order.phoneNumber.mainFlag;
		}else{
			order.phoneNumber.mainFlag = ifMain;
		}
		var idcode=$.trim($("#idCode").val());
		if(idcode!=''){
		    _btnIBydentityQuery();
			return;
		}
		$("#phoneNumber_search_model").modal("hide");//查询modal关闭
		var pnHead = $("#pnHead option:selected").val();//号码段
		var pnType = $("#pnType option:selected").val();//号码类型
		var pnEnd = $.trim($("#pnEnd").val());
		var pnCharacterId = ec.util.defaultStr(pnType);
		var areaId=OrderInfo.staff.soAreaId+"";
		var numPrice=$("#numPrice option:selected").val();//预存话费
		var numLevel=$("#numLevel option:selected").val();//号码等级
		var index=$('#numPrice').prop('selectedIndex');
		var max="";
		var min="";
		if(flag==1){
			max="0";
			min="0";
		}				
		if(index==1){
			var max="100";
			var min="0";
		}else if(index==2){
			var max="300";
			var min="100";
		}else if(index==3){
			var max="500";
			var min="300";
		}else if(index==4){
			var max="1200";
			var min="500";
		}else if(index==5){
			var max="15000";
			var min="1200";
		}else if(index==6){
			var max="30000";
			var min="15000";
		}else if(index==7){
			var max="";
			var min="30000";
		}
		var queryFlag=$("#pwdPur option:selected").val();//号码预占标志
		if(queryFlag=="-1"){
			queryFlag="1";
		}
		var param={
				"pnEnd":pnEnd,
				"pnHead":pnHead,
				"poolId":poolId,
				"areaId":areaId,
				"goodNumFlag":pnCharacterId,
				"maxPrePrice":max,
				"minPrePrice":min,
				"pnLevelCd":numLevel,
				"enter":"3",
				"queryFlag":queryFlag,
				"pageSize":"10"
		};
		//请求地址
		var url = contextPath+"/app/mktRes/phonenumber/list";
		$.callServiceAsHtml(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询号码中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response||response.code != 0){
					 response.data='查询失败,稍后重试';
				}
				if(ifMain=="false"){
					var content$ = $("#phonenumber-list2");
					$("#phoneNumber_a").show();
				}else{
					var content$ = $("#phonenumber-list");
				}
				content$.html(response.data).show();
				if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
				$("#phonenumber-list_scroller").css("transform","translate(0px, -40px) translateZ(0px)");
				if(OrderInfo.actionFlag == 112){
					if(ifMain=="false"){
						$("#all_prod").hide();
					}
					$("#offer").hide();
					$("#offer-list").empty();
				}
//				mainFlag="true";
			},
			fail:function(response){
//				mainFlag="true";
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});	
	};
	
	//副卡号码列表查询
	var _btnQueryPhoneNumber2=function(){
		order.phoneNumber.mainFlag="false";
		var idcode=$.trim($("#idCode").val());
		if(idcode!=''){
		    _btnIBydentityQuery();
			return;
		}
		$("#phoneNumber_search_model").modal("hide");//查询modal关闭
		var poolId = $("#nbrPool option:selected").val();
		var pnHead = $("#pnHead option:selected").val();//号码段
		var pnType = $("#pnType option:selected").val();//号码类型
		var pnEnd = $.trim($("#pnEnd").val());
		var pnCharacterId = ec.util.defaultStr(pnType);
		var areaId=OrderInfo.staff.soAreaId+"";
		var numPrice=$("#numPrice option:selected").val();//预存话费
		var index=$('#numPrice').prop('selectedIndex');
		var max="";
		var min="";
		if(index==1){
			var max="100";
			var min="0";
		}else if(index==2){
			var max="300";
			var min="100";
		}else if(index==3){
			var max="500";
			var min="300";
		}else if(index==4){
			var max="1200";
			var min="500";
		}else if(index==5){
			var max="15000";
			var min="1200";
		}else if(index==6){
			var max="30000";
			var min="15000";
		}else if(index==7){
			var max="";
			var min="30000";
		}
		var queryFlag=$("#pwdPur option:selected").val();//号码预占标志,副卡暂时不做预占查询
		//if(queryFlag=="-1"){
			queryFlag="1";
//		}
		var param={
				"pnEnd":pnEnd,
				"pnHead":pnHead,
				"poolId":poolId,
				"areaId":areaId,
				"goodNumFlag":pnCharacterId,
				"maxPrePrice":max,
				"minPrePrice":min,
				"enter":"3",
				"queryFlag":queryFlag
		};
		$.ecOverlay("<strong>正在查询号码中,请稍等会儿....</strong>");
		//请求地址
		var url = contextPath+"/app/mktRes/phonenumber/list";
		$.callServiceAsHtml(url,param,{
			"before":function(){
			},
			"always":function(){
//				$.unecOverlay();
			},
			"done" : function(response){
				//$.unecOverlay();
				if(!response||response.code != 0){
					$.unecOverlay();
					 response.data='查询失败,稍后重试';
				}
				//$("#phoneNumber_a").show();
				$.unecOverlay();
				var content$ = $("#phonenumber-list2");
				content$.html(response.data);
				$("#secondaryCardModal").modal("show");
				$("#secondaryCardModal").show();
				
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});	
	};
	
	var _clickPhoneNum=function(obj,purchas) {
		if(order.phoneNumber.mainFlag=="true"){//主卡号码选择
			_clickMainCardPhone(obj,purchas);
		}else{//副卡号码选择
			_clickSecondaryCardPhone(obj,purchas);
		}
	};
	
	//号卡新装选择主卡号码
	var _clickMainCardPhone = function(obj,purchas) {
		if(purchas==1){//身份证查询
			_chooseCardPhoneNum(obj,purchas,CONST.MEMBER_ROLE_CD.MAIN_CARD);
		}else{
			var phoneNumberVal_06 = $(obj).attr("numberVal").split("_")[7];
			selectedObj=obj;
			if(phoneNumberVal_06=="1"){
				$("#needPwdModal").modal("show");
			}else{
				_chooseCardPhoneNum(obj,purchas,CONST.MEMBER_ROLE_CD.MAIN_CARD);
			}
		}
	};
	
	//号卡新装选择副卡号码
	var _clickSecondaryCardPhone = function(obj,purchas) {
			_chooseCardPhoneNum(obj,purchas,CONST.MEMBER_ROLE_CD.VICE_CARD);
	
	};
	//号卡新装选择号码（主卡和副卡通用）
	var _chooseCardPhoneNum = function(obj,purchas,memberRoleCd,needPsw) {
		if(order.phoneNumber.mainFlag=="true"){
			memberRoleCd = CONST.MEMBER_ROLE_CD.MAIN_CARD;
		}else{
			memberRoleCd = CONST.MEMBER_ROLE_CD.VICE_CARD;
		}
		// 号码资源状态前置校验
		var flagQueryRes = $.callServiceAsJson(contextPath + "/common/queryPortalProperties", {"propertiesKey": "NUMBER_CHECK_" + (OrderInfo.staff.soAreaId+"").substring(0,3)});	
        var numberCheckFlag = flagQueryRes.code == 0 ? flagQueryRes.data : "";
		if ("ON" == numberCheckFlag) {
			var url = contextPath + "/app/prodModify/preCheckBeforeOrde"; // 翼销售app
			var accNbr = $(obj).attr("numberVal").split("_")[0];
			var response = $.callServiceAsJson(url, {"serviceType": 38, "accNbr": accNbr});
			if(response.code == 1){
				$.alert("错误", response.data);
				return;
			}
			if (response.code != 0) {
				$.alertM(response.data);
				return;
			} else if (response.data.checkLevel == 20) {
				$.alert("提示", accNbr + "不可放号" + (ec.util.isObj(response.data.checkInfo) ? "，具体原因：" + response.data.checkInfo : ""));
				return;
			}
		}
		var areaId=$("#p_cust_areaId").val();
		if(areaId==null||areaId==""){
			areaId=OrderInfo.staff.areaId;
		}
		//证号关系校验
		var url = contextPath + "/app/order/queryNumRealExist"; 
		var accNbr = $(obj).attr("numberVal").split("_")[0];
		var param={			
				  "ContractRoot":{
					   "SvcCont":{
						     "lanId":areaId,
							 "phoneNum":accNbr,
							 "traceId":UUID.getDataId()
					    },
					    "TcpCont": {
					    	
					    }
				   }
		};
		$.callServiceAsJsonGet(url,{strParam:JSON.stringify(param)},{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"done" : function(response){
				$.unecOverlay();
				if (response.code == 0) {
					var resultExist="N";
					if(response.data!=undefined && response.data.resultExist!=undefined){
						resultExist=response.data.resultExist;
					}else if(response.data.msg!=undefined){
						$.alert("提示","证号关系查询:"+response.data.msg);
						return;
					}
					if(resultExist!="N"){
						$.alert("提示","该号码已存在证号关系，请重新选号");
						return;
					}else{
						selectedObj = obj;
						ispurchased=purchas;
						phoneNumberVal = $(obj).attr("numberVal");
						// memberRoleCd=CONST.MEMBER_ROLE_CD.VICE_CARD;
						// 订单序号：O1、O2区分暂存单允许多个订单的情况
						//号码的预存话费
						var preStoreFare=phoneNumberVal.split("_")[1];
						//保底消费
						var pnPrice=phoneNumberVal.split("_")[2];
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
							var phoneAreaId;
							var params={};
							if(needPsw){
								 params={"phoneNumber":phoneNumber,"actionType":"E","anTypeCd":anTypeCd,"areaId":phoneAreaId,"attrList":[{"attrId":"65010036","attrValue":needPsw}]};
							}else{
								 params={"phoneNumber":phoneNumber,"actionType":"E","anTypeCd":anTypeCd,"areaId":phoneAreaId};
							}
							var oldrelease=false;
							var oldPhoneNumber="";
							var oldAnTypeCd="";
							oldPhoneNumber = order.phoneNumber.boProdAn.accessNumber;
							oldAnTypeCd = order.phoneNumber.boProdAn.anTypeCd;
							if (oldPhoneNumber == phoneNumber) {
								$.alert("提示", "号码已经被预占,请选择其它号码!");
								return;
							} else {
								_boProdAn = {};
							}
							var purchaseUrl = contextPath + "/app/mktRes/phonenumber/purchase";
							$.callServiceAsJson(purchaseUrl, params, {
								"before" : function() {
									$.ecOverlay("<strong>正在预占号码,请稍等会儿....</strong>");
								},
								"done" : function(response) {
									$.unecOverlay();
									if (response.code == 0) {
										var selectedLevel="";
										if (selectedLevel == "") {// selectedLevel缓存号码等级信息，以缓存的为准
											selectedLevel = response.data.phoneLevelId;
										}						
									    var prodId;
										if(memberRoleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD){
											prodId=-1;
											_boProdAn.accessNumber = phoneNumber;
											_boProdAn.anTypeCd = anTypeCd;
											_boProdAn.level = selectedLevel;
											_boProdAn.org_level = response.data.phoneLevelId;
											_boProdAn.anId = response.data.phoneNumId;
											_boProdAn.areaId = areaId;
											_boProdAn.areaCode = areaCode;
											_boProdAn.memberRoleCd = memberRoleCd;
											_boProdAn.preStore = preStoreFare;
											_boProdAn.minCharge = pnPrice;
											order.service.boProdAn = _boProdAn;
											$("#phoneNumber_a").hide();
										  if(OrderInfo.actionFlag == 112){//宽带融合选号完跳往副卡界面
											  order.phoneNumber.step=2;
											  OrderInfo.order.step = 2;
											  $("#nav-tab-1").removeClass("active in");
											  $("#nav-tab-2").addClass("active in");
											  $("#tab1_li").removeClass("active");
											  $("#tab2_li").addClass("active");
											  $("#tc").removeClass("active");
											  $("#fk").addClass("active");
											  $("#phoneNumber_a").hide();
//											  order.amalgamation.prodSpecParamQuery();
										  }else if(OrderInfo.actionFlag==14){//合约购机
											  order.phoneNumber.step=3;
											  OrderInfo.order.step = 3;
											//选号tab隐藏，合约tab显示
											 $("#nav-tab-2").removeClass("active in");
										     $("#nav-tab-3").addClass("active in");
										     $("#tab2_li").removeClass("active");
										     $("#tab3_li").addClass("active");
										     $("#phoneNumber_a").hide();
										     //加载合约页
										     order.phone.showHy();
										  }else if(order.service.enter=="3"){//选号入口选号完跳完套餐
											 order.phoneNumber.step=2;//选完号码标签页切到选套餐
											 OrderInfo.order.step = 2;
											 order.service.queryApConfig();
											 order.service.searchPack(0,"init");
											//选号tab隐藏，套餐tab显示
											 $("#nav-tab-1").removeClass("active in");
									    	 $("#nav-tab-2").addClass("active in");
									    	 $("#tab1_li").removeClass("active");
									    	 $("#tab2_li").addClass("active");
										  }else if(order.service.enter=="1"){//套餐入口选号完跳往副卡（可能无副卡）或者促销界面
											  $("#phoneNumber_a").hide();
											  $("#offer_a").hide();
											 order.phoneNumber.step=3;
											 if(order.service.max!=undefined && order.service.showTab3){//存在副卡页
												 OrderInfo.order.step = 3;
												 $("#nav-tab-1").removeClass("active in");
										    	 $("#nav-tab-3").addClass("active in");
										    	 $("#tab1_li").removeClass("active");
										    	 $("#tab3_li").addClass("active"); 
											 } else{//无副卡展示促销
												 if(order.service.isGiftPackage==true){//礼包订购跳转单独功能产品页
													 OrderInfo.order.step = 4;
													 order.main.buildGiftMainView();//展示礼包功能页
													 $("#nav-tab-1").removeClass("active in");
											    	 $("#nav-tab-4").addClass("active in");
											    	 $("#tab1_li").removeClass("active");
											    	 $("#tab4_li").addClass("active"); 
												 }else{
													 OrderInfo.order.step = 4;
													 order.main.buildMainView();
													 $("#nav-tab-1").removeClass("active in");
											    	 $("#nav-tab-4").addClass("active in");
											    	 $("#tab1_li").removeClass("active");
											    	 $("#tab4_li").addClass("active");  
												 }
											 }
											
										  }
										}else{
											$("#phoneNumber_a").hide();
											if(OrderInfo.actionFlag==112){
												var $div =$('<li class="PhoneNumLi"><span class="list-title"><span class="title-lg">'+phoneNumber+'</span><span class="subtitle font-secondary">移动电话</span></span></li>');
												$("#secondaryPhoneNumUl").append($div);			
												$("#secondaryCardModal").modal("hide");
//												mainFlag="true";//恢复主副卡标志
												order.phoneNumber.secondaryCarNum=$('#secondaryPhoneNumUl').children('li').length-1;//副卡数目
												$("#yd_min").text(order.phoneNumber.secondaryCarNum);
												prodId=-(order.phoneNumber.secondaryCarNum+1);
											   if(order.phoneNumber.secondaryCarNum==$("#yd_max").text()){//副卡添加到最大，添加图标置灰
												   $("#addSecondaryCard").removeClass("font-default").addClass("font-secondary");
												   $("#addSecondaryCard").attr("onclick","");
											   }
											   $("#all_prod").show();
											}else{
												var $div =$('<li><span class="list-title"><span class="title-lg">'+phoneNumber+'</span><span class="subtitle font-secondary">移动电话</span></span></li>');
												if(OrderInfo.actionFlag==6){//主副卡成员变更加装副卡
													var $div2 =$('<li id="li_'+phoneNumber+'"><span class="list-title"><span class="title-lg">'+phoneNumber+'</span><span class="subtitle font-secondary">移动电话</span></span><i onclick="order.memberChange.removeAddPhoneNum('+phoneNumber+')" class="iconfont absolute-right">&#xe624;</i></li>');									
													$("#secondaryPhoneNumUl2").append($div2);
													order.memberChange.memberAddList.push(phoneNumber);
												}else{
													$("#secondaryPhoneNumUl").append($div);
												}											
												$("#secondaryCardModal").modal("hide");
//												mainFlag="true";//恢复主副卡标志
												order.phoneNumber.secondaryCarNum=$('#secondaryPhoneNumUl').children('li').length-1;//副卡数目
												prodId=-(order.phoneNumber.secondaryCarNum+1);
												if(OrderInfo.actionFlag==6){//主副卡成员变更加装副卡
													order.phoneNumber.secondaryCarNum=$('#secondaryPhoneNumUl2').children('li').length-1;
													prodId=-(order.phoneNumber.secondaryCarNum);
												}
											   if(order.phoneNumber.secondaryCarNum==order.service.max){//副卡添加到最大，添加图标置灰
												   $("#addSecondaryCard").removeClass("font-default").addClass("font-secondary");
											   }
//											   if(OrderInfo.actionFlag==6){//主副卡成员变更加装副卡,设置正确的副卡添加数量
//													order.phoneNumber.secondaryCarNum=order.memberChange.memberAddList.length;
//												}
											}
										}
										var isExists=false;
										if(OrderInfo.boProdAns.length>0){//判断是否选过
											for(var i=0;i<OrderInfo.boProdAns.length;i++){
												if(OrderInfo.boProdAns[i].prodId==prodId){
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
//													order.dealer.changeAccNbr(subnum,phoneNumber); //选号玩要刷新发展人管理里面的号码
													break;
												}
											}
										}
										if(!isExists){
											var param={
												prodId : prodId, //产品id,-1(主),-2（副）-3……
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
											//OrderInfo.setProdAn(param);//保存到产品实例列表里面
										}
										// _qryOfferInfoByPhoneNumFee();
										$("#phonenumber-list").empty();
										$("#phonenumber-list2").empty();
										$("#phonenumber-list2").hide();
										if(order.phoneNumber.mainFlag=="false"){
											$("#secondaryPhoneNumUl").show();
											$("#fk_phonenumber_next").show();
										}
									} else if (response.code == -2) {
										$.alertM(response.data);
									} else {
										var msg = "";
										if (response.data != undefined
												&& response.data.msg != undefined) {
											msg = response.data.msg;
										} else {
											msg = "号码[" + phoneNumber + "]预占失败";
										}
										$.alert("提示", "号码预占失败，可能原因:" + msg);
									}
								},
								fail : function(response) {
//									$.unecOverlay();
									$.alert("提示", "请求可能发生异常，请稍后再试！");
								}
							});
						} else {
							$.alert("提示", "号码格式不正确!");
						}
					}
				}else if (response.code == -2) {					
					$.alertM(response.data);
					
				}else{
					$.alert("提示","查询数据失败!");
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	
   //副卡号码池数据展示
	var _showSecondaryCardModalData=function(){
		var propertiesKey = "FUKA_SHIYR_"+(OrderInfo.staff.soAreaId+"").substring(0,3);
	    var isFlag = offerChange.queryPortalProperties(propertiesKey);
		if(OrderInfo.actionFlag==6){//加装副卡
			if(order.memberChange.memberDelList.length>0){//存在拆除的副卡不许新增副卡
				$.alert("提示","不允许同时办理拆机和新增副卡！");
				return;
			}
			//公众客户 使用人开关关闭 一五校验前置 
			//公众客户 使用人开关打开 一五校验在选择使用人时进行校验
			//一五校验
			if(isFlag!="ON" && !cust.isCovCust(OrderInfo.cust.identityCd) && !cust.preCheckCertNumberRel()){//一五校验
				return;
			}
		}
		//使用人开关关闭 一五校验前置
		//使用人开关打开 一五校验在选择使用人时进行校验
		if(isFlag!="ON" && !cust.isCovCust(OrderInfo.cust.identityCd) && cust.usedNum!=undefined && (order.phoneNumber.secondaryCarNum+cust.usedNum)>=5){//一证五号
			$.alert("提示","一个用户证件下不能有超过五个号码!");
			return;
		}
		if(order.phoneNumber.secondaryCarNum>=order.service.max){//副卡添加数已达最大
			return;
		}
//		$("#phoneNumber2_a").show();
		$("#idCode").val("");
		//_queryPhoneNbrPool2();
//		_btnQueryPhoneNumber2();
		order.phoneNumber.mainFlag = "false";//副卡选号时 主卡标识为false
		$("#secondaryPhoneNumUl").hide();
		$("#fk_phonenumber_next").hide();
		if(OrderInfo.actionFlag==6){//加装副卡
			order.phoneNumber.queryApConfig();//查询号码段和号码类型 
			order.phoneNumber.queryPhoneNbrPool();//查询号池
			return;
		}
		_btnQueryPhoneNumber(1);
//		$("#secondaryCardModal").modal("show");
		
	};
	
   //移除副卡所选号码
	var _removeSecondaryCardNum=function(phoneNum){
		
	}
	var _resetBoProdAn = function(){
		_boProdAn = {
				accessNumber : "", //接入号
				org_level:"",//原始的号码等级，为了页面展示增加的字段
				level : "", //等级
				anId : "", //接入号ID
				anTypeCd : "",//号码类型
				areaId:"",
				areaCode:"",
				memberRoleCd:"",
				preStore: "",
				minCharge:""
		};
	};
	
	var _btnIBydentityQuery=function(){
		var idcode=$.trim($("#idCode").val());
//		if(idcode==''){
//			$.alert("提示","请先输入身份证号码!");
//			return;
//		}
		if(!_idcardCheck(idcode)){
			$.alert("提示","身份证号码输入有误!");
			return;
		}
		$("#phoneNumber_search_model").modal("hide");//查询modal关闭
		var areaId=OrderInfo.staff.soAreaId+"";
		var param={"identityId":idcode,"areaId":areaId};
		param.newFlag="1";
		$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
		$.callServiceAsHtmlGet(contextPath+"/app/mktRes/phonenumber/listByIdentity",param,{
			"before":function(){
				
			},
			"always":function(){
				
			},
			"done" : function(response){
				if(!response||response.code != 0){
					 response.data='查询失败,稍后重试';
				}
				var content$ = $("#phonenumber-list");
				if(order.phoneNumber.mainFlag=="false"){//副卡
					content$ = $("#phonenumber-list2");
				}
				$.unecOverlay();
				content$.html(response.data);
				$("#secondaryCardModal").modal("show");
				$("#secondaryCardModal").show();
				if(OrderInfo.actionFlag == 112){
					$("#offer").hide();
					$("#offer-list").empty();
				}
//				var content$=$("#order_phonenumber .phone_warp");
//				content$.html(response.data);
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});	
	};
	
	var _idcardCheck=function(num){
		num = num.toUpperCase();
		if(!(/(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(num)))//是否15位数字或者17位数字加一位数字或字母X
		{
			return false;
		}
		var len, re;
		len = num.length;
		if(len == 15) {
			re = new RegExp(/^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/);
			var arrSplit = num.match(re);
			var dtmBirth = new Date('19' + arrSplit[2] + '/' + arrSplit[3] + '/' + arrSplit[4]);
			var bGoodDay;
			bGoodDay = (dtmBirth.getYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
			if(!bGoodDay) {
				return false;
			} else {
				var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
				var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
				var nTemp = 0, i;
				num = num.substr(0, 6) + '19' + num.substr(6, num.length - 6);
				for( i = 0; i < 17; i++) {
					nTemp += num.substr(i, 1) * arrInt[i];
				}
				num += arrCh[nTemp % 11];
				return num;
			}
		}
		if(len == 18) {
			re = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/);
			var arrSplit = num.match(re);
			var dtmBirth = new Date(arrSplit[2] + "/" + arrSplit[3] + "/" + arrSplit[4]);
			var bGoodDay;
			bGoodDay = (dtmBirth.getFullYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
			if(!bGoodDay) {
				return false;
			} else {
				var valnum;
				var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
				var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
				var nTemp = 0, i;
				for( i = 0; i < 17; i++) {
					nTemp += num.substr(i, 1) * arrInt[i];
				}
				valnum = arrCh[nTemp % 11];
				if(valnum != num.substr(17, 1)) {
					return false;
				}
				return num;
			}
		}
		return false;
	};
	
	/**
	 * 靓号预占 密码校验
	 */
	var _preePassword=function(){
		var needPwd=$("#needPwd").val();
		if($.trim(needPwd)==""){
			//$.alert("提示","预占密码不能为空！");
			$('#needPwdModal').find('.choice-box').children('.help-block').removeClass('hidden');
			$('#needPwdModal-result').hide();
		}else{
			$("#needPwdModal").modal('hide');
			$("#needPwd").val("");//初始化
			_chooseCardPhoneNum(selectedObj,"0",CONST.MEMBER_ROLE_CD.MAIN_CARD,needPwd);
		}
	};
	
	var _clearError=function(){
		var needPwd=$("#needPwd").val();
		if($.trim(needPwd)!=""){
			$('#needPwdModal-result').hide();
			$('#needPwdModal').find('.choice-box').children('.help-block').addClass('hidden');
		}
	};
	var _showPhoneNumSearchModal=function(){
		$('#phoneNumber_search_model').modal('show');
		$('#secondaryCardModal').modal('hide');
		
		
	};	

 var _setMainFlag=function(){
	 order.phoneNumber.mainFlag="true";
	 $('#phoneNumber_a').hide();
 };
 
//滚动页面入口
	var _scroll = function(scrollObj){
		if(scrollObj && scrollObj.page && scrollObj.page >= 1){
			order.phoneNumber.btnQueryPhoneNumber("",scrollObj.scroll,order.phoneNumber.mainFlag);
//			_initPhonenumber($("#subPage").val(),scrollObj.scroll);
		}
	};
	

		/**
		 * 企业云盘选套餐自带出号码（虚拟号码获取,暂时只有主卡）
		 */
	var _getVirtualNum = function(memberRoleCd) {// 主副卡标志
		var param = {
			seqType : "cloudAccNbr"
		}
		var url = contextPath + "/app/cust/getSeq";
		$.ecOverlay("<strong>云套餐号码获取中，请稍等...</strong>");
		var response = $.callServiceAsJson(url, param);
		$.unecOverlay();
		if (response.code == 0) {
			if (response.data) {
				var phoneNumber=response.data.seq;
				var areaId = "";
				var areaCode = "";
				if (areaId == null || areaId == "") {
					areaId = OrderInfo.staff.soAreaId;
				}
				if (areaCode == null || areaCode == "") {
					areaCode = OrderInfo.staff.areaCode;
				}
				var selectedLevel = "";
				_boProdAn.accessNumber = phoneNumber;
				_boProdAn.anTypeCd = "4";
				_boProdAn.level = selectedLevel;
				_boProdAn.org_level = "";
				_boProdAn.anId = "1";
				_boProdAn.areaId = areaId;
				_boProdAn.areaCode = areaCode;
				_boProdAn.memberRoleCd = memberRoleCd;
				_boProdAn.virtualFlag = "1";
				order.service.boProdAn = _boProdAn;
				var prodId;
				if (memberRoleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD) {
					prodId = -1;
				}
				var isExists = false;
				if (OrderInfo.boProdAns.length > 0) {// 判断是否选过
					for (var i = 0; i < OrderInfo.boProdAns.length; i++) {
						if (OrderInfo.boProdAns[i].prodId == prodId) {
							OrderInfo.boProdAns[i].accessNumber = phoneNumber;
							OrderInfo.boProdAns[i].anTypeCd = "4";
							OrderInfo.boProdAns[i].pnLevelId = selectedLevel;
							OrderInfo.boProdAns[i].anId = "1";
							OrderInfo.boProdAns[i].areaId = areaId;
							OrderInfo.boProdAns[i].areaCode = areaCode;
							OrderInfo.boProdAns[i].memberRoleCd = memberRoleCd;
							isExists = true;
							if (OrderInfo.offerSpec.offerRoles != undefined) {
								OrderInfo.setProdAn(OrderInfo.boProdAns[i]); // 保存到产品实例列表里面
							}
							break;
						}
					}
				}
				if (!isExists) {
					var param = {
						prodId : prodId, // 产品id,-1(主),-2（副）-3……
						accessNumber : phoneNumber, // 接入号
						anChooseTypeCd : "2", // 接入号选择方式,自动生成或手工配号，默认传2
						anId : "1", // 接入号ID
						pnLevelId : selectedLevel,
						anTypeCd : "4", // 号码类型
						state : "ADD", // 动作 ,新装默认ADD
						areaId : areaId,
						areaCode : areaCode,
						memberRoleCd : memberRoleCd
					};
					OrderInfo.boProdAns.push(param);
				}
				OrderInfo.order.step = 3;
				$("#tab2_li").removeClass("active");
				$("#tab1_li").removeClass("active");
				$("#nav-tab-2").removeClass("active in");
				$("#nav-tab-1").removeClass("active in");
				$("#offer_a").hide();
				order.main.buildMainView();// 选号入口跳转促销
			}
		} else if (response.code == -2) {
			$.alertM(response.data);
			return;
		} else {
			$.alert("提示", "企业版云套餐虚拟号码获取失败,原因:[接口异常]");
			return;
		}
	};
	
	return {
		secondaryCarNum :_secondaryCarNum,
		initPhonenumber:_initPhonenumber,
		queryPhoneNbrPool:_queryPhoneNbrPool,
		queryPhoneNbrPool2:_queryPhoneNbrPool2,
		showSecondaryCardModalData:_showSecondaryCardModalData,
		queryApConfig    :_queryApConfig,
		btnQueryPhoneNumber:_btnQueryPhoneNumber,
		btnQueryPhoneNumber2:_btnQueryPhoneNumber2,
		clickPhoneNum      :_clickPhoneNum,
		clickMainCardPhone:_clickMainCardPhone,
		clickSecondaryCardPhone:_clickSecondaryCardPhone,
		chooseCardPhoneNum:_chooseCardPhoneNum,
		resetBoProdAn     :_resetBoProdAn,
		boProdAn:_boProdAn,
	    step    :_step,
	    preePassword:_preePassword,
	    clearError:_clearError,
	    showPhoneNumSearchModal:_showPhoneNumSearchModal,
	    setMainFlag            :_setMainFlag,
	    scroll	: _scroll,
	    getVirtualNum  :_getVirtualNum,
	    mainFlag	:_mainFlag
	};
})();

