/**
 * 号码查询
 * 
 * @author lianld
 */
CommonUtils.regNamespace("mktRes", "phoneNbr");
/**
 * 号码查询
 */
var phoneNum_level="";
var selectedObj=null;
var _queryFlag="0";
mktRes.phoneNbr = (function(){
	var _boProdAn = {
			accessNumber : "", //接入号
			org_level:"",//原始的号码等级，为了页面展示增加的字段
			level : "", //等级
			anId : "", //接入号ID
			anTypeCd : "",//号码类型
			areaId:"",
			areaCode:"",
			memberRoleCd:""
	};
	var _resetBoProdAn = function(){
		_boProdAn = {
				accessNumber : "", //接入号
				org_level:"",//原始的号码等级，为了页面展示增加的字段
				level : "", //等级
				anId : "", //接入号ID
				anTypeCd : "",//号码类型
				areaId:"",
				areaCode:"",
				memberRoleCd:""
		};
	};
	var ispurchased=0;
	var selectedLevel="";
	var idcode=[];
	//请求地址
	var url = contextPath+"/pad/mktRes/phonenumber/list";
	var phoneNumberVal="";
	//按钮查询
	var _btnQueryPhoneNumber=function(param){
		selectedObj=null;//初始化原先选中的号码
		//收集参数
		param = _buildInParam(param);
		param.isReserveFlag=_queryFlag;
		if(_queryFlag=='1'){//预约选号
			param.queryFlag="3";
		}
		$.callServiceAsHtmlGet(url,param,{
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
				var content$=$("#div_number_list");
				content$.html(response.data).fadeIn();
				$.jqmRefresh(content$);
				$("#btnSwitchNbr").off("tap").on("tap",function(){_btnQueryPhoneNumber({});});
				$(".numberlist .ui-grid-b").on("tap",function(){
					var obj=$(this);
					// 号码资源状态前置校验
					var flagQueryRes = $.callServiceAsJson(contextPath + "/common/queryPortalProperties", {"propertiesKey": "NUMBER_CHECK_" + OrderInfo.staff.soAreaId.substring(0,3)});	
			        var numberCheckFlag = flagQueryRes.code == 0 ? flagQueryRes.data : "";
					if ("ON" == numberCheckFlag) {
						var accNbr = $(obj).attr("numberVal").split("_")[0];
						var response = $.callServiceAsJson(contextPath + "/token/secondBusi/preCheckBeforeOrde", {"serviceType": 38, "accNbr": accNbr});
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
					obj.addClass("numlistbg").siblings().removeClass("numlistbg").parents().siblings().find(".ui-grid-b").removeClass("numlistbg");
					if(selectedObj==obj){//老点同一个号？
						return;
					}
					selectedObj=obj;
					ispurchased= $(selectedObj).attr("ispurchased"); 
				});
				var subPage=$("#subPage").val();
				if(subPage=='number'&&OrderInfo.busitypeflag==1){
					$("#btn_enter_prev").show();
					$("#btn_enter_prev").off("tap").on("tap",function(){
						$("#ul_busi_area").show();
						$("#order_prepare").empty();
					});
				}
				$("#btn_enter_phoneNum_next").off("tap").on("tap",function(){
					_endSelectNum();
				});
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});	
	};
	
	//提供给LTE项目，新装套餐、主副卡变更等功能中的号码信息查询
	var _queryPhoneNumber=function(param){
		var url = contextPath+"/pad/mktRes/phone/numberlist";
		//收集参数
		var params = {
				"areaId":OrderInfo.getAreaId(),
				"phoneNumber":param.phoneNum
			};
		var response = $.callServiceAsJson(url,params);
		if (response&&response.code==0) {
			if(response.data){
				return response.data;
			}
		}else if (response.code==-2){
			$.alertM(response.data);
		}else {
			$.alert("提示","查询号码信息失败,稍后重试");
		}
	};
	
	var _btnIBydentityQuery=function(){
		var idcode=$.trim($("#idCode").val());
		if(idcode==''){
			$.alert("提示","请先输入身份证号码!");
			return;
		}
		if(!_idcardCheck(idcode)){
			$.alert("提示","身份证号码输入有误!");
			return;
		}
		var areaId=$("#p_cust_areaId").val();
		var param={"identityId":idcode,"areaId":areaId};
		$.callServiceAsHtmlGet(contextPath+"/pad/mktRes/phonenumber/listByIdentity",param,{
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
				var content$=$("#div_number_list");
				content$.html(response.data).fadeIn();
				$.jqmRefresh(content$);
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});	
	};
	//选择身份证预占的号码
	var _btnToOffer=function(obj){
		phoneNumberVal = $(obj).attr("numberVal"); 
		var memberRoleCd=CONST.MEMBER_ROLE_CD.MAIN_CARD;
		//选号类型：新装主卡选号、新装副卡选号 Y1、Y2
		var subFlag=$("#subFlag").val();
		if(subFlag=='Y2'){
			memberRoleCd=CONST.MEMBER_ROLE_CD.VICE_CARD;
		}
		//订单序号：O1、O2区分暂存单允许多个订单的情况
		var subnum=$("#subnum").val();
		//入口终端入口，号码入口，订单填写入口:terminal\offer\number
		var subPage=$("#subPage").val();
		//保底消费
		var pnPrice=phoneNumberVal.split("_")[2];
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
		var plevel=selectedLevel;
		if(selectedLevel==""){
			plevel=phoneNumberVal.split("_")[5];
		}
		var orgLevel=phoneNumberVal.split("_")[5];//初始等级
		var phoneNumId=phoneNumberVal.split("_")[6];
		var areaId=$("#p_cust_areaId").val();
		if(areaId==null||areaId==""){
			areaId=OrderInfo.staff.areaId;
		}
		//var areaCode=$("#p_cust_areaId").attr("areaCode");
		var areaCode=  $(obj).attr("zoneNumber");
		if(areaCode==null || areaCode==""){
			areaCode =OrderInfo.staff.areaCode;
		} 
		if(phoneNumber){
			var oldrelease=false;
			var oldPhoneNumber="";
			var oldAnTypeCd="";
			if(subPage=='terminal'||subPage=='number'){
				oldPhoneNumber=_boProdAn.accessNumber;
				oldAnTypeCd=_boProdAn.anTypeCd;
				/*if(oldPhoneNumber==phoneNumber){
					$.alert("提示","号码已经被预占,请选择其它号码!");
					return;
				}*/
			}else if(subPage=='offer'){
				for(var i=0;i<OrderInfo.boProdAns.length;i++){
					if(OrderInfo.boProdAns[i].prodId==subnum){
						oldPhoneNumber=OrderInfo.boProdAns[i].accessNumber;
						oldAnTypeCd=OrderInfo.boProdAns[i].anTypeCd;
						break;
					}
				}
				for(var i=0;i<OrderInfo.boProdAns.length;i++){
					if(OrderInfo.boProdAns[i].prodId!=subnum){
						if(OrderInfo.boProdAns[i].accessNumber==phoneNumber){
							$.alert("提示","你已经选择了该号码,请选择其它号码!");
							return;
						}
					}
				}
			}
			if(oldPhoneNumber!=""){
				oldrelease=true;
				for(var i=0;i<idcode.length;i++){//身份证预占的号码不需要被释放
					if(idcode[i]==oldPhoneNumber){
						oldrelease=false;
						break;
					}
				}
				if(oldrelease){
					var purchaseUrl=contextPath+"/mktRes/phonenumber/purchase";
					var params={"oldPhoneNumber":oldPhoneNumber,"oldAnTypeCd":oldAnTypeCd};
					$.callServiceAsJson(purchaseUrl, params, {});
				}
			}
			idcode.push(phoneNumber);
			if(subPage=='number'){
				var content$=$("#order_fill_content");
				content$.html('');
				_boProdAn.accessNumber=phoneNumber;
				_boProdAn.anTypeCd=anTypeCd;
				_boProdAn.level=plevel;
				_boProdAn.org_level=orgLevel;
				_boProdAn.anId=phoneNumId;
				_boProdAn.areaId=areaId;
				_boProdAn.areaCode =areaCode;
				_boProdAn.memberRoleCd=memberRoleCd;
				_boProdAn.idFlag=0;
				order.service.boProdAn = _boProdAn;
				_qryOfferInfoByPhoneNumFee();
			}else if(subPage=='terminal'){
				mktRes.terminal.setNumber(phoneNumber, plevel);
				_boProdAn.accessNumber=phoneNumber;
				_boProdAn.anTypeCd=anTypeCd;
				_boProdAn.level=plevel;
				_boProdAn.org_level=orgLevel;
				_boProdAn.anId=phoneNumId;
				_boProdAn.areaId=areaId;
				_boProdAn.areaCode =areaCode;
				_boProdAn.memberRoleCd=memberRoleCd;
				_boProdAn.idFlag=0;
				order.service.boProdAn = _boProdAn;
				$("#div_phoneNbr_choose").popup("close");
			}else if(subPage=='offer'){
				_boProdAn.anTypeCd=anTypeCd;
				_boProdAn.anId=phoneNumId;
				_boProdAn.accessNumber=phoneNumber;
				_boProdAn.level=plevel;
				_boProdAn.org_level=orgLevel;
				_boProdAn.areaId=areaId;
				_boProdAn.areaCode =areaCode;
				$("#choosedNum_"+subnum).val(phoneNumber);
				var isExists=false;
				if(OrderInfo.boProdAns.length>0){
					for(var i=0;i<OrderInfo.boProdAns.length;i++){
						if(OrderInfo.boProdAns[i].prodId==subnum){
							OrderInfo.boProdAns[i].accessNumber=phoneNumber;
							OrderInfo.boProdAns[i].anTypeCd=anTypeCd;
							OrderInfo.boProdAns[i].pnLevelId=plevel;
							OrderInfo.boProdAns[i].anId=phoneNumId;
							OrderInfo.boProdAns[i].areaId=areaId;
							OrderInfo.boProdAns[i].areaCode =areaCode;
							OrderInfo.boProdAns[i].memberRoleCd=memberRoleCd;
							OrderInfo.boProdAns[i].idFlag=0;
							isExists=true;
							OrderInfo.setProdAn(OrderInfo.boProdAns[i]);  //保存到产品实例列表里面
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
						anId : phoneNumId, //接入号ID
						anTypeCd : anTypeCd, //号码类型
						pnLevelId:plevel,
						state : "ADD", //动作	,新装默认ADD	
						areaId:areaId,
						areaCode:areaCode,
						memberRoleCd:memberRoleCd,
						idFlag:0,
						preStore:preStoreFare,
						minCharge:pnPrice
					};
					OrderInfo.boProdAns.push(param);
				}
				$("#div_phoneNbr_choose").popup("close");
				if(subnum=='-1'){
					OrderInfo.boCustInfos.telNumber=phoneNumber;
				}
			}
		} else {
			$.alert("提示","号码格式不正确!");
		}
	};
	//已选号码填单页面初始化
	var _initOffer=function(subnum){
		if(_boProdAn.accessNumber!=''){
			$("#choosedNum_"+subnum).val(_boProdAn.accessNumber);
			if(ec.util.isObj(_boProdAn.virtualFlag)){ // 虚拟号码,去掉号码选择事件
				$("#btn_choosedNum_"+subnum).remove();
			}
			order.dealer.changeAccNbr(subnum,_boProdAn.accessNumber);
			var isExists=false;
			if(OrderInfo.boProdAns.length>0){
				for(var i=0;i<OrderInfo.boProdAns.length;i++){
					if(OrderInfo.boProdAns[i].prodId==subnum){
						OrderInfo.boProdAns[i].accessNumber=_boProdAn.accessNumber;
						OrderInfo.boProdAns[i].anTypeCd=_boProdAn.anTypeCd;
						OrderInfo.boProdAns[i].anId=_boProdAn.anId;
						OrderInfo.boProdAns[i].pnLevelId=_boProdAn.level;
						OrderInfo.boProdAns[i].areaId=_boProdAn.areaId;
						OrderInfo.boProdAns[i].memberRoleCd=_boProdAn.memberRoleCd;
						if(_boProdAn.idFlag){
							OrderInfo.boProdAns[i].idFlag=_boProdAn.idFlag;
						}
						OrderInfo.setProdAn(OrderInfo.boProdAns[i]);  //保存到产品实例列表里面
						order.dealer.changeAccNbr(subnum,phoneNumber); //选号玩要刷新发展人管理里面的号码
						isExists=true;
						break;
					}
				}
			}
			if(!isExists){
				var param={
					prodId : subnum, //从填单页面头部div获取
					accessNumber : _boProdAn.accessNumber, //接入号
					anChooseTypeCd : "2", //接入号选择方式,自动生成或手工配号，默认传2
					anId : _boProdAn.anId, //接入号ID
					pnLevelId:_boProdAn.level,
					anTypeCd : _boProdAn.anTypeCd, //号码类型
					state : "ADD", //动作	,新装默认ADD
					areaId:_boProdAn.areaId,
					areaCode:_boProdAn.areaCode,
					memberRoleCd:_boProdAn.memberRoleCd
				};
				if(_boProdAn.idFlag){
					param.idFlag=_boProdAn.idFlag;
				}
				OrderInfo.boProdAns.push(param);
			}
			if(subnum=='-1'){
				OrderInfo.boCustInfos.telNumber=_boProdAn.accessNumber;
			}
		}
	};
	//加载套餐数据
	var _qryOfferInfoByPhoneNumFee=function(){
		var param={"numsubflag":"number"};
		$.callServiceAsHtmlGet(contextPath+"/pad/order/prodoffer/prepare",param,{
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
				var content$ = $("#order_prepare").html(response.data).fadeIn();
				$.jqmRefresh(content$);
				//order.service.initSpec();
				//order.prodOffer.init();
				order.prepare.initOffer();
				order.service.searchPack();
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	//号码预占
	var _btnPurchase=function(obj,needPsw){
		phoneNumberVal = $(obj).attr("numberVal"); 
		var memberRoleCd=CONST.MEMBER_ROLE_CD.MAIN_CARD;
		//选号类型：新装主卡选号、新装副卡选号 Y1、Y2
		var subFlag=$("#subFlag").val();
		if(subFlag=='Y2'){
			memberRoleCd=CONST.MEMBER_ROLE_CD.VICE_CARD;
		}
		//订单序号：O1、O2区分暂存单允许多个订单的情况
		var subnum=$("#subnum").val();
		//入口终端入口，号码入口，订单填写入口:terminal\offer\number
		var subPage=$("#subPage").val();
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
				oldPhoneNumber=_boProdAn.accessNumber;
				oldAnTypeCd=_boProdAn.anTypeCd;
				if(oldPhoneNumber==phoneNumber){
					$.alert("提示","号码已经被预占,请选择其它号码!");
					return;
				}else{
					_boProdAn={};
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
				for(var i=0;i<idcode.length;i++){//身份证预占的号码不需要被释放
					if(idcode[i]==oldPhoneNumber){
						oldrelease=false;
						break;
					}
				}
				if(oldrelease){
					if(needPsw){
						params={"newPhoneNumber":phoneNumber,"oldPhoneNumber":oldPhoneNumber,"newAnTypeCd":anTypeCd,"oldAnTypeCd":oldAnTypeCd,"areaId":phoneAreaId,"attrList":[{"attrId":"65010036","attrValue":needPsw}]};
					}else{
						params={"newPhoneNumber":phoneNumber,"oldPhoneNumber":oldPhoneNumber,"newAnTypeCd":anTypeCd,"oldAnTypeCd":oldAnTypeCd,"areaId":phoneAreaId};
					}
				}
			}
			
			var purchaseUrl=contextPath+"/app/mktRes/phonenumber/purchase";//"/mktRes/phonenumber/purchase";
			$.callServiceAsJson(purchaseUrl, params, {
				"before":function(){
					$.ecOverlay("<strong>正在预占号码,请稍等会儿....</strong>");
				},"always":function(){
					$.unecOverlay();
				},	
				"done" : function(response){
					if (response.code == 0) {
						if(selectedLevel==""){//selectedLevel缓存号码等级信息，以缓存的为准
							selectedLevel=response.data.phoneLevelId;
						}
						if(subPage=='number'){
							var content$=$("#order_fill_content");
							content$.html('');
							_boProdAn.accessNumber=phoneNumber;
							_boProdAn.anTypeCd=anTypeCd;
							_boProdAn.level=selectedLevel;
							_boProdAn.org_level=response.data.phoneLevelId;
							_boProdAn.anId=response.data.phoneNumId;
							_boProdAn.areaId=areaId;
							_boProdAn.areaCode = areaCode;
							_boProdAn.memberRoleCd=memberRoleCd;
							_boProdAn.preStore=preStoreFare;
							_boProdAn.minCharge=pnPrice;
							order.service.boProdAn = _boProdAn;
							_qryOfferInfoByPhoneNumFee();
						}else if(subPage=='terminal'){
							mktRes.terminal.setNumber(phoneNumber, response.data.phoneLevelId);
							_boProdAn.accessNumber=phoneNumber;
							_boProdAn.anTypeCd=anTypeCd;
							_boProdAn.level=selectedLevel;
							_boProdAn.org_level=response.data.phoneLevelId;
							_boProdAn.anId=response.data.phoneNumId;
							_boProdAn.areaId=areaId;
							_boProdAn.areaCode = areaCode;
							_boProdAn.memberRoleCd=memberRoleCd;
							_boProdAn.preStore=preStoreFare;
							_boProdAn.minCharge=pnPrice;
							order.service.boProdAn = _boProdAn;
							$("#div_phoneNbr_choose").popup("close");
						}else if(subPage=='offer'){
							$("#choosedNum_"+subnum).val(phoneNumber);
							_boProdAn.accessNumber=phoneNumber;
							_boProdAn.level=selectedLevel;
							_boProdAn.org_level=response.data.phoneLevelId;
							_boProdAn.areaId=areaId;
							_boProdAn.anTypeCd=anTypeCd;
							_boProdAn.preStore=preStoreFare;
							_boProdAn.minCharge=pnPrice;
							_boProdAn.anId=response.data.phoneNumId;
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
							$("#div_phoneNbr_choose").popup("close");
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
	
	//构造查询条件 
	var _buildInParam = function(param){
		var query_flag_01= $('#passyz').val();
		var areaId="";
		if(OrderInfo.cust==undefined || OrderInfo.cust.custId==undefined || OrderInfo.cust.custId==""){
			areaId=$("#p_cust_areaId").val();
		}else{
			areaId=OrderInfo.getAreaId();
		}
		var pnHead = $.trim($("#pnHead option:selected").val());
		var pnEnd =$.trim($("#pnEnd").val());
		var pnNotExitNum = $.trim($("#pnNotExitNum").val());
		if(pnEnd=='最后四位'){
			pnEnd='';
		}
		if(pnNotExitNum == '后四位不含'){
			pnNotExitNum = '';
		}
		pnNotExitNum = (pnNotExitNum == '') ? pnNotExitNum : "[^" + pnNotExitNum + "]{4}$";
		var phoneNum='';
		var Greater  = "";
		var Less  ="";
		var preStore=$.trim($("#preStore option:selected").val());
		var preStoreArry=preStore.split("-");
		if(preStoreArry.length==2){
			Greater=preStoreArry[0];
			Less=preStoreArry[1];
		}else{
			preStoreArry=preStoreArry.toString();
			Greater=preStoreArry.substring(0,preStoreArry.length-2);
			Less="";
		}
		var poolId = $.trim($("#nbrPool option:selected").val());	
		var pnCharacterId=$.trim($("#pnCharacterId option:selected").val());	
		return {"pnHead":pnHead,"pnEnd":pnEnd,"pnNotExitNum":pnNotExitNum,"goodNumFlag":pnCharacterId,"maxPrePrice":Less,
			"minPrePrice":Greater,"pnLevelId":'',"pageSize":"16","phoneNum":phoneNum,"areaId":areaId,"poolId":poolId,
			"queryFlag":query_flag_01
		};
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
	var _initPage=function(){		
		var url=contextPath+"/pad/mktRes/phonenumber/prepare";
		var param={};
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
				var content$=$("#order_tab_panel_content");
				content$.html(response.data);
				$.jqmRefresh(content$);
				_boProdAn = {accessNumber : "",level : "",anId : "",anTypeCd : ""};
				_initPhonenumber();
			}
		});	
	};
	var _initPhonenumber=function(){
		selectedObj=null;
		selectedLevel="";
		_queryApConfig();
		//查询号池
		queryPhoneNbrPool();
		//查询号码预存和保底金额
		queryPnLevelProdOffer();
		var param={};
		_btnQueryPhoneNumber(param);
		//点击更多显示更多查询条件
		$("#searchmore").on("tap",function(){
			var obj=$(this);
			$("#moresearch").slideToggle(400);
			obj.toggleClass("ui-icon-plus");
			obj.toggleClass("ui-icon-minus");
		});
		$("#form_phonenumber_qry").find("select").off("change").on("change",function(){
			_btnQueryPhoneNumber(param);
			$(this).selectmenu("refresh");
		});
		
		//给搜索输入框绑定回车事件
		$("#idCode").off("keydown").on("keydown", function(e){
			var ev = document.all ? window.event : e; 
			if(ev.keyCode==13) {
				_btnIBydentityQuery(param);
			}
		});
		$("#pnEnd").off("keydown").on("keydown", function(e){
			var ev = document.all ? window.event : e; 
			if(ev.keyCode==13) {
				_btnQueryPhoneNumber(param);
			}
		});
		$("#pnNotExitNum").off("keydown").on("keydown", function(e){
			var ev = document.all ? window.event : e; 
			if(ev.keyCode==13) {
				_btnQueryPhoneNumber(param);
			}
		});
	};
	var call_back_success_queryApConfig=function(response){
		var PHONE_NUMBER_PRESTORE;
		var PHONE_NUMBER_SEGMENT;
		var PHONE_NUMBER_FEATURE;
		if(response.data){
			var dataLength=response.data.length;
			//号码预存话费
			for (var i=0; i < dataLength; i++) {
				if(response.data[i].PHONE_NUMBER_PRESTORE){
				  	PHONE_NUMBER_PRESTORE=response.data[i].PHONE_NUMBER_PRESTORE;
				  	for(var m=0;m<PHONE_NUMBER_PRESTORE.length;m++){
				  		var  preStore=PHONE_NUMBER_PRESTORE[m].COLUMN_VALUE_NAME.replace(/\"/g, "");
			  			preStore=preStore.replace(/\"/g, "");
				  		$("#preStore").append("<option  value="+preStore+">"+preStore+"</option>");
				  	}
			  		$("#preStore").selectmenu("refresh");
				}
			};
			//号段
			for (var i=0; i < dataLength; i++) {
				if(response.data[i].PHONE_NUMBER_SEGMENT){
				  	PHONE_NUMBER_SEGMENT=response.data[i].PHONE_NUMBER_SEGMENT;
				  	for(var m=0;m<PHONE_NUMBER_SEGMENT.length;m++){
				  		var  numberStart=PHONE_NUMBER_SEGMENT[m].COLUMN_VALUE_NAME;
				  		numberStart=numberStart.replace(/\"/g, "");
				  		$("#pnHead").append("<option  value="+numberStart+">"+numberStart+"</option>");
				  	}
			  		$("#pnHead").selectmenu("refresh");
				}
			};
			//号码特征
			for (var i=0; i < dataLength; i++) {
				if(response.data[i].PHONE_NUMBER_FEATURE){
					PHONE_NUMBER_FEATURE=response.data[i].PHONE_NUMBER_FEATURE;
				  	for(var m=0;m<PHONE_NUMBER_FEATURE.length;m++){
				  		var numberFeature=(PHONE_NUMBER_FEATURE[m].COLUMN_VALUE_NAME).replace(/\"/g, "");
				  		var numberFeatureVal=(PHONE_NUMBER_FEATURE[m].COLUMN_VALUE).replace(/\"/g, "");
				  		$("#pnCharacterId").append("<option value="+numberFeatureVal+">"+numberFeature+"</option>");
				  	}
			  		$("#pnCharacterId").selectmenu("refresh");
				}
			};
		}
		
	};
	//查询平台配置信息
	var _queryApConfig=function(){
		var configParam={"CONFIG_PARAM_TYPE":"TERMINAL_AND_PHONENUMBER"};
		var qryConfigUrl=contextPath+"/order/queryApConf";
		$.callServiceAsJsonGet(qryConfigUrl, configParam,{
			"done" : call_back_success_queryApConfig
		});
	};
	
	//查询号池
	var queryPhoneNbrPool = function(){
		var url=contextPath+"/mktRes/phonenumber/queryPhoneNbrPool";
		var param={};
		var response = $.callServiceAsJson(url,param);
		if (response.code==0) {
			if(response.data){
				var phoneNbrPoolList= response.data.phoneNbrPoolList;
				var $sel = $("#nbrPool");  
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
						$sel.selectmenu("refresh");
					});
				}
			}
		}else if(response.code == -2){
			$.alertM(response.data);
		}else{
			$.alert("提示","号池加载失败，请稍后再试！");
		}
	};
	//靓号预存和保底金额查询
	var queryPnLevelProdOffer = function(str){
		var url=contextPath+"/mktRes/phonenumber/queryPnLevelProdOffer";
		var areaId = "";
		if(order.ysl!=undefined||str!=undefined){
			areaId=$("#_session_staff_info").attr("areaid");
		}else{
			areaId=$("#p_cust_areaId").val();
		}
		areaId = areaId.substring(0,3)+"0000";
		var param={"areaId":areaId};
		var response = $.callServiceAsJson(url,param);
	};
	
	//设置号码等级
	var _qryPhoneNbrLevelInfoList=function(){
		if(selectedObj==undefined||selectedObj==null){
			$.alert("提示","请先选择号码！");
			return;
		}
		var phoneNumberVal = $(selectedObj).attr("numberVal"); 
		var plevel=phoneNumberVal.split("_")[5];
		var phoneNumber=phoneNumberVal.split("_")[0];
		var areaId=$("#p_cust_areaId").val();
		if(areaId==null||areaId==""){
			areaId=OrderInfo.staff.areaId;
		}
		var qryUrl=contextPath+"/mktRes/qryPhoneNbrLevelInfoList";
		$.ligerDialog.open({
			width:560,
			height:350,
			allowClose:false,
			title:'设置号码等级（'+phoneNumber+"）",
			url:qryUrl+"?pnLevelId="+selectedLevel+"&areaId="+areaId+"&org_level="+plevel,
			buttons: [ { text: '确定', onclick:function (item, dialog) {
				var strs=phoneNum_level.split("_");////全局变量，保存“号码等级_预存金额_保底金额”，由弹出框的iframe，赋值
				dialog.close(); 
				//设置选择的样式
				$(".select_nbr_li").each(function(){
					if($(this).hasClass("select")){
						var numberval=$(this).attr("numberval").split("_");
						var tx;
						if(phoneNum_level!=undefined&&phoneNum_level!=""&&numberval[5]!=strs[0]){
							tx="<span style='float:left;margin-left:10px;'>预存<span class='orange'>"+numberval[1]+"</span>元<br/>保底<span class='orange'>"+numberval[2]+"</span>元</span><span style='float:right;margin-right:10px;'>预存<span class='orange'>"+strs[1]+"</span>元<br/>保底<span class='orange'>"+strs[2]+"</span>元</span><span style='width: 15px; display: table; height: 30px; padding-top: 10px;'><img  src='"+contextPath+"/image/common/levelArrow.png'></span>";
						}else{
							tx="<span style='padding-left:10px;'>预存<span class='orange'>"+numberval[1]+"</span>元</span> <span style='padding-left:10px;'> 保底<span class='orange'>"+numberval[2]+"</span>元</span>";
						}
						$(this).find("div").html(tx);
					}
				});
				//保存刚修改的值
				selectedLevel=strs[0];
			} }, { text: '关闭', onclick: function (item, dialog) { dialog.close(); } }] 	
		});
	};
	//结束选号，不通的模块要做的动作不相同
	var _endSelectNum=function(){
		if(selectedObj==undefined||selectedObj==null){
			$.alert("提示","请先选择号码！");
			return;
		}
		if(ispurchased==1){
			_btnToOffer(selectedObj);
		}else{
			var phoneNumberVal_06 = $(selectedObj).attr("numberVal").split("_")[7]; 
			//phoneNumberVal_06="1";
			if(phoneNumberVal_06=="1"){
				//$("#dlg-phonenumber-pwd").popup("open");
				$("#dlg-phonenumber-pwd").show();
				$("#phoneNbrSurebtn").off("tap").on("tap",function(event){
					_preePassword();
				});
				$("#phoneNbrCancelbtn").off("tap").on("tap",function(event){
					$("#dlg-phonenumber-pwd").hide();
				});
			}else{
				_btnPurchase(selectedObj);
			}
		}
	};
	
	/**
	 * 靓号预占 密码校验
	 */
	var _preePassword=function(){
		var pree_password_text=$("#pree_password_text").val();
		if($.trim(pree_password_text)==""){
			$.alert("提示","预占密码不能为空！");
		}else{
			//$("#dlg-phonenumber-pwd").dialog("close");
			$("#dlg-phonenumber-pwd").hide();
			$("#pree_password_text").val("");//初始化
			_btnPurchase(selectedObj,pree_password_text);
		}
	};
	//弹出选择号码窗口
	//subPage入口:终端入口，号码入口，订单填写入口:terminal\offer\number
	//subnum订单序号：O1、O2区分暂存单允许多个订单的情况
	//subFlag选号类型：新装主卡选号、新装副卡选号 Y1、Y2
	var _phoneNumDialog=function(subPage,subFlag,subnum){
			var param={"subPage":subPage};
			var url=contextPath+"/pad/mktRes/phonenumber/prepare";
			$.callServiceAsHtmlGet(url,param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					if(!response){
						 response.data='<div style="margin:2px 0 2px 0;width:100%,height:100%;text-align:center;"><strong>not data return,please try reload again.</strong></div>';
					}
					if(response.code != 0) {
						$.alert("提示","查询失败,稍后重试");
						return;
					}
					//统一弹出框
					var popup = $.popup("#div_phoneNbr_choose",response.data,{
						width:$(window).width()-50,
						height:$(window).height(),
						contentHeight:$(window).height()-120,
						afterClose:function(){}
					});
					$("#moresearch").width($(window).width()-50-60);
					$("#idCode").parent().css("float","left");
					$("#pnEnd").parent().css("float","left");
					$(".search").css("position","fixed");
					$(".search").css("top","50px");
					$(".numbertitle").css("top","90px");
					$("#subPage").val(subPage);
					$("#subFlag").val(subFlag);
					$("#subnum").val(subnum);
					if(OrderInfo.provinceInfo!=undefined&&OrderInfo.provinceInfo.prodOfferId!=undefined&&OrderInfo.provinceInfo.prodOfferId!=""){
						$("#phone_num_btn").tap(function(){$("#div_phoneNbr_choose").popup("close");});
					}
					mktRes.phoneNbr.initPhonenumber();
					
					$("#nbrPool-button").css({"width":"65px","padding":"5px 40px 6px 20px"});
					$("#pnCharacterId-button").css({"width":"35px","padding":"5px 40px 6px 20px"});
					$("#preStore-button").css({"width":"35px","padding":"5px 40px 6px 20px"});
				}
			});	
	};

	/**
	 * 虚拟号码获取
	 */
	var _getVirtualNum = function(){
		var param = {
			seqType:"cloudAccNbr"
		}
		var url = contextPath+"/cust/getSeq";
		$.ecOverlay("<strong>虚拟号码获取中，请稍等...</strong>");
		var response = $.callServiceAsJson(url,param);
		$.unecOverlay();
		if (response.code==0) {
			if(response.data){
				_boProdAn.accessNumber=response.data.seq;
				_boProdAn.anTypeCd="4";
				_boProdAn.level="";
				_boProdAn.org_level="";
				_boProdAn.anId="1";
				_boProdAn.areaId=$("#p_cust_areaId").val();
				_boProdAn.areaCode ="";
				_boProdAn.memberRoleCd=CONST.MEMBER_ROLE_CD.COMMON_MEMBER;
				//_boProdAn.preStore="";
				//_boProdAn.minCharge="";
				_boProdAn.virtualFlag="1";
				order.service.boProdAn = _boProdAn;
			}
		}else if (response.code==-2){
			$.alertM(response.data);
			return;
		}else {
			$.alert("提示","企业版云套餐虚拟号码获取失败,原因:[接口异常]");
			return;
		}
	};

	return {
		qryPhoneNbrLevelInfoList:_qryPhoneNbrLevelInfoList,
		endSelectNum:_endSelectNum,
		phoneNumDialog :_phoneNumDialog,
		btnQueryPhoneNumber : _btnQueryPhoneNumber,
		queryApConfig:_queryApConfig,
		initPhonenumber:_initPhonenumber,
		boProdAn:_boProdAn,
		resetBoProdAn:_resetBoProdAn,
		btnIBydentityQuery:_btnIBydentityQuery,
		initOffer:_initOffer,
		initPage:_initPage,
		preePassword:_preePassword,
		queryPhoneNbrPool:queryPhoneNbrPool,
		queryFlag:_queryFlag,
		queryPnLevelProdOffer:queryPnLevelProdOffer,
		queryPhoneNumber:_queryPhoneNumber,
		getVirtualNum:_getVirtualNum
	};
})();