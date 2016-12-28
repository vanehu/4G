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
	var mainFlag="true";//是否主卡选号码
	var _secondaryCarNum;//副卡数目
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
		_btnQueryPhoneNumber();
		
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
				$.unecOverlay();
			},
			"done" : function(response){
				$.unecOverlay();
				if (response.code==0) {
					if(response.data){
						var phoneNbrPoolList= response.data.phoneNbrPoolList;
						if(OrderInfo.actionFlag == 112){
							$("#nbrPool").empty();
							$("#nbrPool").append('<option value="" selected="selected">请选择号池</option>');
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
							var $div =$('<i class="iconfont pull-left p-l-10">&#xe66c;</i>');
							var $div2 =$('<i class="iconfont pull-right p-r-10">&#xe66e;</i>');
							var $sel = $('<select id="nbrPool" class="myselect select-option" data-role="none"></select>');  
							var $defaultopt = $('<option value="" selected="selected">请选择号池</option>');
							$sel.append($defaultopt);
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
		var response = $.callServiceAsJson(url,param);
		if (response.code==0) {
			if(response.data){
				$("#nbrPoolDiv2").empty();
				var phoneNbrPoolList= response.data.phoneNbrPoolList;
				var $div =$('<i class="iconfont pull-left p-l-10">&#xe66c;</i>');
				var $div2 =$('<i class="iconfont pull-right p-r-10">&#xe66e;</i>');
				var $sel = $('<select id="nbrPool2" class="myselect select-option" data-role="none"></select>');  
				var $defaultopt = $('<option value="" selected="selected">请选择号池</option>');
				$sel.append($defaultopt);
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
				order.broadband.init_select();//刷新select组件，使样式生效

			}
		}else if(response.code == -2){
			$.alertM(response.data);
		}else{
			$.alert("提示","号池加载失败，请稍后再试！");
		}
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
	var _btnQueryPhoneNumber=function(){
		mainFlag="true";
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
		var param={
				"pnEnd":pnEnd,
				"pnHead":pnHead,
				"poolId":poolId,
				"areaId":areaId,
				"goodNumFlag":pnCharacterId,
				"maxPrePrice":max,
				"minPrePrice":min,
				"enter":"3"
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
				var content$ = $("#phonenumber-list");
				content$.html(response.data);
				if(OrderInfo.actionFlag == 112){
					$("#offer").hide();
					$("#offer-list").empty();
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});	
	};
	
	//副卡号码列表查询
	var _btnQueryPhoneNumber2=function(){
		mainFlag="false";
		var poolId = $("#nbrPool2 option:selected").val();
		var areaId=OrderInfo.staff.soAreaId+"";
		var param={
				"poolId":poolId,
				"areaId":areaId,
				"enter":"3",
		};
		//请求地址
		var url = contextPath+"/app/mktRes/phonenumber/list";
		$.callServiceAsHtml(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response||response.code != 0){
					 response.data='查询失败,稍后重试';
				}
				$("#phoneNumber_a").show();
				var content$ = $("#phonenumber-list2");
				content$.html(response.data);
				
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});	
	};
	
	var _clickPhoneNum=function(obj,purchas) {
		if(mainFlag=="true"){//主卡号码选择
			_clickMainCardPhone(obj,purchas);
		}else{//副卡号码选择
			_clickSecondaryCardPhone(obj,purchas);
		}
	};
	
	//号卡新装选择主卡号码
	var _clickMainCardPhone = function(obj,purchas) {

			_chooseCardPhoneNum(obj,purchas,CONST.MEMBER_ROLE_CD.MAIN_CARD);

	};
	
	//号卡新装选择副卡号码
	var _clickSecondaryCardPhone = function(obj,purchas) {
			_chooseCardPhoneNum(obj,purchas,CONST.MEMBER_ROLE_CD.VICE_CARD);
	
	};
	//号卡新装选择号码（主卡和副卡通用）
	var _chooseCardPhoneNum = function(obj,purchas,memberRoleCd) {
		selectedObj = obj;
		ispurchased=purchas;
		phoneNumberVal = $(obj).attr("numberVal");
		// memberRoleCd=CONST.MEMBER_ROLE_CD.VICE_CARD;
		// 订单序号：O1、O2区分暂存单允许多个订单的情况
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
			var phoneAreaId;
			var params={};
			params={"phoneNumber":phoneNumber,"actionType":"E","anTypeCd":anTypeCd,"areaId":phoneAreaId};
			var oldrelease=false;
			var oldPhoneNumber="";
			var oldAnTypeCd="";
			oldPhoneNumber = _boProdAn.accessNumber;
			oldAnTypeCd = _boProdAn.anTypeCd;
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
//							  order.amalgamation.prodSpecParamQuery();
						  }else if(order.service.enter=="3"){//选号入口选号完跳完套餐
							 order.phoneNumber.step=2;//选完号码标签页切到选套餐
							 OrderInfo.order.step = 2;
							 order.service.queryApConfig();
							 order.service.searchPack();
							//选号tab隐藏，套餐tab显示
							 $("#nav-tab-1").removeClass("active in");
					    	 $("#nav-tab-2").addClass("active in");
					    	 $("#tab1_li").removeClass("active");
					    	 $("#tab2_li").addClass("active");
						  }else if(order.service.enter=="1"){//套餐入口选号完跳往副卡（可能无副卡）或者促销界面
							  $("#phoneNumber_a").hide();
							  $("#offer_a").hide();
							 order.phoneNumber.step=3;
							 if(order.service.max!=undefined){//存在副卡页
								 OrderInfo.order.step = 3;
								 $("#nav-tab-1").removeClass("active in");
						    	 $("#nav-tab-3").addClass("active in");
						    	 $("#tab1_li").removeClass("active");
						    	 $("#tab3_li").addClass("active"); 
							 } else{//无副卡展示促销
								 OrderInfo.order.step = 4;
								 order.main.buildMainView();
								 $("#nav-tab-1").removeClass("active in");
						    	 $("#nav-tab-4").addClass("active in");
						    	 $("#tab1_li").removeClass("active");
						    	 $("#tab4_li").addClass("active"); 
							 }
							
						  }
						}else{
							$("#phoneNumber_a").hide();
							if(OrderInfo.actionFlag==112){
								var $div =$('<li class="PhoneNumLi"><span class="list-title"><span class="title-lg">'+phoneNumber+'</span><span class="subtitle font-secondary">移动电话</span></span></li>');
								$("#secondaryPhoneNumUl").append($div);			
								$("#secondaryCardModal").modal("hide");
								mainFlag="true";//恢复主副卡标志
								order.phoneNumber.secondaryCarNum=$('#secondaryPhoneNumUl').children('li').length-1;//副卡数目
								$("#yd_min").text(order.phoneNumber.secondaryCarNum);
								prodId=-(order.phoneNumber.secondaryCarNum+1);
							   if(order.phoneNumber.secondaryCarNum==$("#yd_max").text()){//副卡添加到最大，添加图标置灰
								   $("#addSecondaryCard").removeClass("font-default").addClass("font-secondary");
								   $("#addSecondaryCard").attr("onclick","");
							   }
							}else{
								var $div =$('<li><span class="list-title"><span class="title-lg">'+phoneNumber+'</span><span class="subtitle font-secondary">移动电话</span></span></li>');
								$("#secondaryPhoneNumUl").append($div);			
								$("#secondaryCardModal").modal("hide");
								mainFlag="true";//恢复主副卡标志
								order.phoneNumber.secondaryCarNum=$('#secondaryPhoneNumUl').children('li').length-1;//副卡数目
								prodId=-(order.phoneNumber.secondaryCarNum+1);
							   if(order.phoneNumber.secondaryCarNum==order.service.max){//副卡添加到最大，添加图标置灰
								   $("#addSecondaryCard").removeClass("font-default").addClass("font-secondary");
							   }
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
									order.dealer.changeAccNbr(subnum,phoneNumber); //选号玩要刷新发展人管理里面的号码
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
//					$.unecOverlay();
					$.alert("提示", "请求可能发生异常，请稍后再试！");
				}
			});
		} else {
			$.alert("提示", "号码格式不正确!");
		}
	};
	
	
   //副卡号码池数据展示
	var _showSecondaryCardModalData=function(){
		if(order.phoneNumber.secondaryCarNum>=order.service.max){//副卡添加数已达最大
			return;
		}
		_queryPhoneNbrPool2();
		_btnQueryPhoneNumber2();
		$("#secondaryCardModal").modal("show");
		
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
	    step    :_step
	};
})();

