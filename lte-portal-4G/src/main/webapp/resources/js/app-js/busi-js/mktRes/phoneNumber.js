/**
 * 号码查询
 * 
 * @author lianld
 */
CommonUtils.regNamespace("order", "phoneNumber");
/**
 * 号码查询
 */
var phoneNum_level="";
var selectedObj=null;
var _queryFlag="0";
order.phoneNumber = (function(){
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
	var ispurchased=0;
	var selectedLevel="";
	var idcode=[];
	//请求地址
	var url = contextPath+"/app/mktRes/phonenumber/list";
	var phoneNumberVal="";
	//按钮查询
	var _btnQueryPhoneNumber=function(param,scroller){
		var idcode=$.trim($("#idCode").val());
		if(idcode!=''){
		    _btnIBydentityQuery();
			return;
		}
		selectedObj=null;//初始化原先选中的号码
		//收集参数
		param = _buildInParam(param);
		param.isReserveFlag=_queryFlag;
		if(_queryFlag=='1'){//预约选号
			param.queryFlag="3";
		}
		//隐藏选套餐模块
		if($("#pakeage").length>0){
			$("#pakeage").hide();
		}
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
				$("#phonenumber-list_scroller").css("transform","translate(0px, -40px) translateZ(0px)");
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
	
	//提供给LTE项目，新装套餐、主副卡变更等功能中的号码信息查询
	var _queryPhoneNumber=function(param){
		var url = contextPath+"/app/mktRes/phone/numberlist";
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
//		if(idcode==''){
//			$.alert("提示","请先输入身份证号码!");
//			return;
//		}
		if(!_idcardCheck(idcode)){
			$.alert("提示","身份证号码输入有误!");
			return;
		}
		var areaId=$("#p_cust_areaId").val();
		var subPage = $("#subPage").val();
		var param={"identityId":idcode,"areaId":areaId,"subPage":subPage};
		$.callServiceAsHtmlGet(contextPath+"/app/mktRes/phonenumber/listByIdentity",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
				$("#numberModal").modal('hide');
			},
			"done" : function(response){
				$("#numberModal").modal('hide');
				if(!response||response.code != 0){
					 response.data='查询失败,稍后重试';
				}
				
				var content$ = $("#phonenumber-list");
				if($("#subPage").val() == 'offer'||$("#subPage").val()=='terminal'){
					content$ = $("#number-list");
				}
				content$.html(response.data);
//				var content$=$("#order_phonenumber .phone_warp");
//				content$.html(response.data);
			},
			fail:function(response){
				$.unecOverlay();
				$("#numberModal").modal('hide');
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});	
	};
	//选择身份证预占的号码
	var _btnToOffer=function(obj){
		if($("#enter").length > 0 && $("#enter").val() != "3") OrderInfo.returnFlag="";
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
		if(order.service.offerprice!=''){
			var minMonthFare=parseInt(pnPrice);
			//套餐月基本费用
			var packageMonthFare=parseInt(order.service.offerprice);
			if(packageMonthFare<minMonthFare){
				$.unecOverlay();
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
							$.unecOverlay();
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
					var purchaseUrl=contextPath+"/app/mktRes/phonenumber/purchase";
					var params={"oldPhoneNumber":oldPhoneNumber,"oldAnTypeCd":oldAnTypeCd};
					$.callServiceAsJson(purchaseUrl, params, {});
				}
			}
			$.unecOverlay();
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
				_boProdAn.preStore=preStoreFare;
				_boProdAn.minCharge=pnPrice;
				order.service.boProdAn = _boProdAn;
				//_qryOfferInfoByPhoneNumFee();
				OrderInfo.returnFlag=2;  // 临时处理
				OrderInfo.order.step=2;
//				$("#tentrance").show();
//				$("#pentrance").hide();
//				$("#nentrance").hide();
				$("#pakeage").show();
				$("#pakeage").attr("class","tab-pane fade in active");
//				$("#tentrance").css("width","100%");
				$("#phone").hide();
				$("#number").hide();
				$("#order").show();
				$("#phonenumberContent").hide();
				order.service.searchPack(1);
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
				_boProdAn.preStore=preStoreFare;
				_boProdAn.minCharge=pnPrice;
				order.service.boProdAn = _boProdAn;
				$("#order").show();
				$("#phonenumberContent").hide();
			}else if(subPage=='offer'){
				_boProdAn.anTypeCd=anTypeCd;
				_boProdAn.anId=phoneNumId;
				_boProdAn.accessNumber=phoneNumber;
//				_boProdAn.level=response.data.phoneLevelId;
				_boProdAn.level=plevel;
				_boProdAn.org_level=orgLevel;
				_boProdAn.areaId=areaId;
				_boProdAn.areaCode =areaCode;
				_boProdAn.preStore=preStoreFare;
				_boProdAn.minCharge=pnPrice;
//				$("#nbr_btn_"+subnum).removeClass("selectBoxTwo");
//				$("#nbr_btn_"+subnum).addClass("selectBoxTwoOn");
//				$("#nbr_btn_"+subnum).html(phoneNumber+"<u></u>");
//				$("#choosedNumSpan").val(phoneNumber);
				$("#nbr_btn_"+subnum).val(phoneNumber);
				$("#choosedNumSpan").val(phoneNumber);
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
							OrderInfo.boProdAns[i].preStore=preStoreFare;
							OrderInfo.boProdAns[i].minCharge=pnPrice;
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
//				if(order.phoneNumber.dialogForm!=undefined&&order.phoneNumber.dialog!=undefined){
//					order.phoneNumber.dialogForm.close(order.phoneNumber.dialog);
//				}
				if(subnum=='-1'){
					OrderInfo.boCustInfos.telNumber=phoneNumber;
				}
				$("#order").show();
				$("#order_content").show();
				//$("#order_prepare").show();
				$("#phonenumberContent").hide();
			}
		} else {
			$.alert("提示","号码格式不正确!");
		}
	};
	
	var _initOffer=function(subnum){
		if(_boProdAn.accessNumber!=''){
			$("#nbr_btn_"+subnum).removeClass("selectBoxTwo");
			$("#nbr_btn_"+subnum).addClass("selectBoxTwoOn");
			$("#nbr_btn_"+subnum).val(_boProdAn.accessNumber);
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
						OrderInfo.boProdAns[i].preStore=_boProdAn.preStore;
						OrderInfo.boProdAns[i].minCharge=_boProdAn.minCharge;
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
					memberRoleCd:_boProdAn.memberRoleCd,
					preStore:_boProdAn.preStore,
					minCharge:_boProdAn.minCharge
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
	
//	var _qryOfferInfoByPhoneNumFee=function(){
//		var param={"numsubflag":"number"};
//		$.callServiceAsHtmlGet(contextPath+"/order/prodoffer/prepare",param,{
//			"before":function(){
//				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
//			},
//			"always":function(){
//				$.unecOverlay();
//			},
//			"done" : function(response){
//				if(!response||response.code != 0){
//					 response.data='查询失败,稍后重试';
//				}
//				var content$=$("#order_tab_panel_content");
//				content$.html(response.data);
//				order.service.initSpec();
//				order.prodOffer.init();
//				order.service.searchPack();
//			},
//			fail:function(response){
//				$.unecOverlay();
//				$.alert("提示","请求可能发生异常，请稍后再试！");
//			}
//		});
//	};
	
	//号码预占
	var _btnPurchase=function(obj,needPsw){
		if($("#enter").length > 0 && $("#enter").val() != "3") OrderInfo.returnFlag="";
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
		var subPage=$("#subPage").val(); //
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
			
			var purchaseUrl=contextPath+"/app/mktRes/phonenumber/purchase";
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
							OrderInfo.returnFlag=2;  // 临时处理
							OrderInfo.order.step=2;
//							$("#tentrance").show();
//							$("#pentrance").hide();
//							$("#nentrance").hide();
							order.service.searchPack(1);
							$("#pakeage").show();
							$("#pakeage").attr("class","tab-pane fade in active");
//							$("#tentrance").css("width","100%");
							$("#phone").hide();
							$("#number").hide();
							//_qryOfferInfoByPhoneNumFee();
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
							$("#order").show();
							$("#phonenumberContent").hide();
						}else if(subPage=='offer'){
							//$("#nbr_btn_"+subnum).removeClass("selectBoxTwo");
							//$("#nbr_btn_"+subnum).addClass("selectBoxTwoOn");
							$("#nbr_btn_"+subnum).val(phoneNumber);
							$("#choosedNumSpan").val(phoneNumber);
							_boProdAn.accessNumber=phoneNumber;
							_boProdAn.level=selectedLevel;
							_boProdAn.org_level=response.data.phoneLevelId;
							_boProdAn.areaId=areaId;
							_boProdAn.anTypeCd=anTypeCd;
							_boProdAn.anId=response.data.phoneNumId;
							_boProdAn.preStore=preStoreFare;
							_boProdAn.minCharge=pnPrice;
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
	

	
	//链接查询
	var _linkQueryPhoneNumber = function(loc,selected){
		_exchangeSelected(loc,selected);
		_btnQueryPhoneNumber();
	};
	//构造查询条件 
	var _buildInParam = function(param){
		var query_flag_01= $('input[name="query_flag_01"]').parent().attr("class");  //1 no 2 yes
		if(query_flag_01=="toggle btn btn-default off"){
			query_flag_01 = "1";
		}else{
			query_flag_01 = "2";
		}
		var areaId="";
		if(OrderInfo.cust==undefined || OrderInfo.cust.custId==undefined || OrderInfo.cust.custId==""){
			areaId=OrderInfo.staff.soAreaId;
		}else{
			areaId=OrderInfo.staff.soAreaId;
		}
		var pnHead = $("#pnHead").val(); 
		var pncharacteristic = $("#pncharacteristic").find("a.selected").attr("val");
		var pnEnd = $.trim($("#pnEnd").val());
		var pnNotExitNum = $.trim($("#pnNotExitNum").val());
		if(pncharacteristic!=null && pncharacteristic!=""){
			if(pncharacteristic == '4'){
				pnNotExitNum = pncharacteristic;
				if(pnEnd == '最后四位'){
					pnEnd = '';
				}
			} else{
				pnEnd = pncharacteristic;
				if(pnNotExitNum == '后四位不含'){
					pnNotExitNum = '';
				}
			}
		}else{
			if(pnEnd=='最后四位'){
				pnEnd='';
			}
			if(pnNotExitNum == '后四位不含'){
				pnNotExitNum = '';
			}
		}
		pnNotExitNum = (pnNotExitNum == '') ? pnNotExitNum : "[^" + pnNotExitNum + "]{4}$";
		var phoneNum='';
//		var phoneNum=$.trim($("#phoneNum").val());
//		if(phoneNum=="任意四位"){
//			phoneNum='';
//		}
		var pnCharacterId="";
		var Greater = $("#Greater").val();
		var Less  = $("#Less").val();
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
		return {"pnHead":pnHead,"pnEnd":pnEnd,"pnNotExitNum":pnNotExitNum,"goodNumFlag":pnCharacterId,"maxPrePrice":Less,
			"minPrePrice":Greater,"pnLevelId":'',"pageSize":"10","phoneNum":phoneNum,"areaId":areaId,"poolId":poolId,"subPage":subPage,   
			"queryFlag":query_flag_01
		};
	};
	//点击前定位
	var _exchangeSelected = function(loc,selected){
		$(loc).each(function(){$(this).removeClass("selected");});
		$(selected).addClass("selected");
	};
	//分页查询
	var _getIndexPagePhoneNumber=function(pageIndex){
		var param={pageIndex:pageIndex};
		order.phoneNumber.btnQueryPhoneNumber(param);
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

	

	//选择地区
	var _chooseArea = function(){
		order.area.chooseAreaTree("order/prepare","p_phone_areaId_val","p_phone_areaId",3);	
	};
	var _initPage=function(subnum,subPage){
		var url=contextPath+"/app/mktRes/phonenumber/prepare";
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
				if($("#enter").length > 0 && $("#enter").val() != "3") OrderInfo.returnFlag="hm";
				$("#order").hide();
				$("#order_prepare").hide();
				var content$=$("#phonenumberContent");
				content$.html(response.data).show();
				$("#subnum").val(subnum);
				$("#subPage").val(subPage);
				//$("#div_content").append(response.data);
				//$("#number_modal").modal("show");
				_boProdAn = {accessNumber : "",level : "",anId : "",anTypeCd : ""};
				_initPhonenumber(subPage);
			}
		});	
	};
	var _initPhonenumber=function(subPage,scroller){
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
		queryPhoneNbrPool();
		//queryPnLevelProdOffer();
		var param={};
		order.phoneNumber.btnQueryPhoneNumber(param,scroller);
		//1、此段代码加上后会导致在选号页面的其他弹出框（如预占密码弹出框）被覆盖，无法显示--jinjian
		//$("#ec-dialog-container-phonenumber").css("z-index","10002");
		$("#btnNumSearch1").off("click").on("click",function(){order.phoneNumber.btnQueryPhoneNumber(param,scroller);});
		//$("#cc").off("click").on("click",function(event){order.phoneNumber.btnIBydentityQuery(param);event.stopPropagation();});
	};
	//查询平台配置信息
	var _queryApConfig=function(){
		var configParam={"CONFIG_PARAM_TYPE":"TERMINAL_AND_PHONENUMBER"};
		var qryConfigUrl=contextPath+"/app/order/queryApConf";
		$.callServiceAsJsonGet(qryConfigUrl, configParam,{
			"done" : call_back_success_queryApConfig
		});
	};
	var call_back_success_queryApConfig=function(response){
//		var PHONE_NUMBER_PRESTORE;
		var PHONE_NUMBER_SEGMENT;
		var PHONE_NUMBER_FEATURE;
//		var phoneNumberPreStoreHtml="<a href=\"javascript:void(0);\" class=\"selected\" Greater=\"\" Less=\"\">不限</a>";
//		var phoneNumStartHtml="<a href=\"javascript:void(0);\" class=\"selected\" val=\"\">不限</a>";
//		var phoneNumberFeatureLessHtml="<a href=\"javascript:void(0);\" class=\"selected \" val=\"\">不限</a>";
//		var phoneNumberFeatureMoreHtml="<a href=\"javascript:void(0);\" class=\"selected \" val=\"\">不限</a>";
		if(response.data){
			var dataLength=response.data.length;
			//号码预存话费
//			for (var i=0; i < dataLength; i++) {
//				if(response.data[i].PHONE_NUMBER_PRESTORE){
//				  	PHONE_NUMBER_PRESTORE=response.data[i].PHONE_NUMBER_PRESTORE;
//				  	for(var m=0;m<PHONE_NUMBER_PRESTORE.length;m++){
//				  		var  preStore=PHONE_NUMBER_PRESTORE[m].COLUMN_VALUE_NAME.replace(/\"/g, "");
//				  		var greater;
//				  		var less;
//			  			var preStoreArry=preStore.split("-");
//			  			if(preStoreArry.length!=1){
//			  				greater=preStoreArry[0];
//			  				less=preStoreArry[1];
//			  			}else{
//			  				preStoreArry=preStoreArry.toString();
//			  				greater=preStoreArry.substring(0,preStoreArry.length-2);
//			  				less="\"\"";
//			  			}
//			  			preStore=preStore.replace(/\"/g, "");
//				  		phoneNumberPreStoreHtml=phoneNumberPreStoreHtml+"<a href=\"javascript:void(0);\" Greater="+greater+" Less="+less+">"+preStore+"</a>";
//				  	}
//				  	$("#preStore").html(phoneNumberPreStoreHtml);
//					continue;
//				}
//			};
			//号段
			$("#pnHeadDiv").empty();
			for (var i=0; i < dataLength; i++) {
				if(response.data[i].PHONE_NUMBER_SEGMENT){
				  	PHONE_NUMBER_SEGMENT=response.data[i].PHONE_NUMBER_SEGMENT;
				  	var $sel = $('<select id="pnHead" class="selectpicker show-tick form-control"></select>');  
					var $defaultopt = $('<option value="" selected="selected">请选择号段</option>');
					$sel.append($defaultopt);
				  	for(var m=0;m<PHONE_NUMBER_SEGMENT.length;m++){
				  		var  numberStart=PHONE_NUMBER_SEGMENT[m].COLUMN_VALUE_NAME;
				  		numberStart=numberStart.replace(/\"/g, "");
				  		var $option = $('<option value="'+numberStart+'">'+numberStart+'</option>');
						$sel.append($option);
				  }
				  $("#pnHeadDiv").append($sel);
				  $sel.addClass("styled-select");
				  continue;
				}
			};
			$("#pnCharacterId_basicDiv").empty();
			//号码特征
			for (var i=0; i < dataLength; i++) {
				if(response.data[i].PHONE_NUMBER_FEATURE){
				  	PHONE_NUMBER_FEATURE=response.data[i].PHONE_NUMBER_FEATURE;
				  	var featureLength;
				  	if(PHONE_NUMBER_FEATURE.length<=9){
				  		featureLength=PHONE_NUMBER_FEATURE.length;
				  	}else{
				  		featureLength=9;
				  	}
					var $sel = $('<select id="pnCharacterId_basic" class="selectpicker show-tick form-control"></select>');  
					var $defaultopt = $('<option value="" selected="selected">请选择类型</option>');
					$sel.append($defaultopt);
				  	for(var m=0;m<featureLength;m++){
				  		var numberFeature=(PHONE_NUMBER_FEATURE[m].COLUMN_VALUE_NAME).replace(/\"/g, "");
				  		var numberFeatureVal=(PHONE_NUMBER_FEATURE[m].COLUMN_VALUE).replace(/\"/g, "");
				  		var $option = $('<option value="'+numberFeatureVal+'">'+numberFeature+'</option>');
						$sel.append($option);
				  		//phoneNumberFeatureLessHtml=phoneNumberFeatureLessHtml+"<a href=\"javascript:void(0);\" val="+numberFeatureVal+">"+numberFeature+"</a>";
				  	}
//				  	if(PHONE_NUMBER_FEATURE.length>9){
//				  		for(var n=0;n<PHONE_NUMBER_FEATURE.length;n++){
//				  			var numberFeature=(PHONE_NUMBER_FEATURE[n].COLUMN_VALUE_NAME).replace(/\"/g, "");
//				  			var numberFeatureVal=(PHONE_NUMBER_FEATURE[n].COLUMN_VALUE).replace(/\"/g, "");
//				  			phoneNumberFeatureMoreHtml=phoneNumberFeatureMoreHtml+"<a href=\"javascript:void(0);\" val="+numberFeatureVal+">"+numberFeature+"</a>";
//				  		}
//				  		$("#pnCharacterId_more").show();
//				  		$("#pnCharacterId_more").off("click").on("click",function(event){_view_phonenumber_feature();event.stopPropagation();});
//				  	}
				  	
				  	$("#pnCharacterId_basicDiv").append($sel);
				  	$sel.addClass("styled-select");
				   //$("#pnCharacterId_basic").html(phoneNumberFeatureLessHtml);
				  //$("#pnCharacterId_all").html(phoneNumberFeatureMoreHtml);
					continue;
				}
			};
			$("#pnHeadDiv").append('<span class="input-group-addon select-span"></span>');
			$("#pnCharacterId_basicDiv").append('<span class="input-group-addon select-span"></span>');
		}
		//$("#pnCharacterId_basic a").each(function(){$(this).off("click").on("click",function(event){order.phoneNumber.linkQueryPhoneNumber("#pnCharacterId_basic a",this);event.stopPropagation();});});
		//$("#pnCharacterId_all a").each(function(){$(this).off("click").on("click",function(event){order.phoneNumber.linkQueryPhoneNumber("#pnCharacterId_all a",this);event.stopPropagation();});});
		//$("#pnHead a").each(function(){$(this).off("click");$(this).on("click",function(event){order.phoneNumber.linkQueryPhoneNumber("#pnHead a",this);event.stopPropagation();});});
		//$("#preStore a").each(function(){$(this).off("click");$(this).on("click",function(event){order.phoneNumber.linkQueryPhoneNumber("#preStore a",this);event.stopPropagation();});});
	};
	//号码类型全部展示与部分展示
//	var _view_phonenumber_feature = function(){
//		if($('#pnCharacterId_basic').is(':hidden')){
//			$("#pnCharacterId_basic").css("display","");
//			$("#pnCharacterId_all").css("display","none");
//			$("#pnCharacterId_all").parent("dl").css("overflow","inherit");
//		}else{
//			$("#pnCharacterId_basic").css("display","none");
//			$("#pnCharacterId_all").css("display","");
//			$("#pnCharacterId_all").parent("dl").css("overflow","hidden");
//		}
//	};
	//查询号池
	var queryPhoneNbrPool = function(){
		if($("#subPage").val() == 'number'){
		    $("#nbrPoolDiv").empty();
		}else{
			$("#nbrPoolDiv2").empty();
		}
		var url=contextPath+"/app/mktRes/phonenumber/queryPhoneNbrPool";
		var param={};
		var response = $.callServiceAsJson(url,param);
		if (response.code==0) {
			if(response.data){
				var phoneNbrPoolList= response.data.phoneNbrPoolList;
				var $div =$('<div class="input-group select-top" style="width: 100%;"></div>');
				var $span=$('<span class="input-group-addon select-span"></span>');
				var $sel = $('<select id="nbrPool" class="selectpicker show-tick form-control" style=" border: none; height: 34px;" onchange="order.phoneNumber.btnQueryPhoneNumber()"></select>');  
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
				$div.append($sel).append($span);
				if($("#subPage").val() == 'number'){
					$("#nbrPoolDiv").append($div);
				}
				else{
					$("#nbrPoolDiv2").append($div);
				}
				$sel.addClass("styled-select");
			}
		}else if(response.code == -2){
			$.alertM(response.data);
		}else{
			$.alert("提示","号池加载失败，请稍后再试！");
		}
	};
	//靓号预存和保底金额查询
	var queryPnLevelProdOffer = function(str){
		var url=contextPath+"/app/mktRes/phonenumber/queryPnLevelProdOffer";
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
		var qryUrl=contextPath+"/app/mktRes/qryPhoneNbrLevelInfoList";
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
				$(".select_nbr_li").addClass("styled-select");
				//保存刚修改的值
				selectedLevel=strs[0];
			} }, { text: '关闭', onclick: function (item, dialog) { dialog.close(); } }] 	
		});
	};
	//结束选号，不通的模块要做的动作不相同
	var _endSelectNum=function(obj,purchas){
		$.ecOverlay("<strong>正在预占号码,请稍等会儿....</strong>");
		selectedObj = obj;
		ispurchased=purchas;
//		if(selectedObj==undefined||selectedObj==null){
//			$.alert("提示","请先选择号码！");
//			return;
//		}
		if(ispurchased==1){
			_btnToOffer(selectedObj);
		}else{
			var phoneNumberVal_06 = $(selectedObj).attr("numberVal").split("_")[7];
			if(phoneNumberVal_06=="1"){
				$.unecOverlay();
				$("#app_password_dialog").modal("show");
			}else{
				_btnPurchase(selectedObj);
			}
		}
//		$("#uim_check_btn_"+prodId).attr("disabled",false);
//		$("#uim_check_btn_"+prodId).removeClass("disablepurchase").addClass("purchase");
//		$("#uim_release_btn_"+prodId).attr("disabled",true);
//		$("#uim_release_btn_"+prodId).removeClass("purchase").addClass("disablepurchase");
//		$("#uim_txt_"+prodId).attr("disabled",false);
//		$("#uim_txt_"+prodId).val("");
	};
	/**
	 * obj被选中的号码对象
	 * ispurchased是否身份预占号码。1：是,0否。不是身份预占的号码需要调用预占方法。
	 */
	var _selectNum=function(obj,purchas){
		if(selectedObj==obj){//老点同一个号？
			return;
		}
		ispurchased=purchas;
		selectedObj=obj;
		var phoneNumberVal = $(selectedObj).attr("numberVal"); 
		selectedLevel=phoneNumberVal.split("_")[5];
		//去掉其他号码选中效果
		$(obj).siblings().each(function(){
			$(this).removeClass("select");
			var numberval=$(this).attr("numberval").split("_");
			var tx="<span style='padding-left:10px;'>预存<span class='orange'>"+numberval[1]+"</span>元</span> <span style='padding-left:10px;'> 月保底<span class='orange'>"+numberval[2]+"</span>元</span>";
			$(this).find("div").html(tx);
		});
		//添加号码选中样式
		$(obj).addClass("select");
	};
	
	/**
	 * 靓号预占 密码校验
	 */
	var _preePassword=function(){
		var pree_password_text=$("#pree_password_text").val();
		if($.trim(pree_password_text)==""){
			$.alert("提示","预占密码不能为空！");
		}else{
		//	easyDialog.close();
			$("#app_password_dialog").modal('hide');
			$("#pree_password_text").val("");//初始化
			_btnPurchase(selectedObj,pree_password_text);
		}
	};
	 var _btnBack=function(prodId){
		    $("#order").show();
			$('#phonenumberContent').hide();
	};
	//滚动页面入口
	var _scroll = function(scrollObj){
		if(scrollObj && scrollObj.page && scrollObj.page >= 1){
			var param = {};
			order.phoneNumber.btnQueryPhoneNumber(param,scrollObj.scroll);
//			_initPhonenumber($("#subPage").val(),scrollObj.scroll);
		}
	};
	//返回按钮调用
	var _back = function(){
//		$("#tentrance").show();
//		$("#tentrance").attr("class","active");
//		$("#pentrance").show();
//		$("#nentrance").show();
//		$("#nentrance").attr("class","");
//		$("#tentrance").css("width","");
		
//		$("#pakeage").show();
//		$("#number").attr("class","tab-pane fade");
//		$("pakeage").attr("class","tab-pane fade in active");
		
//		$("#phone").show();
//		$("#number").show();
		//选号第二个页面没下单，返回无需提示取消订单
		if(OrderInfo.order.step == 1){
			var boProdAns = OrderInfo.boProdAns;
				var boProd2Tds = OrderInfo.boProd2Tds;
				//取消订单时，释放被预占的UIM卡
				if(boProd2Tds.length>0){
					for(var n=0;n<boProd2Tds.length;n++){
						var param = {
								numType : 2,
								numValue : boProd2Tds[n].terminalCode
						};
						$.callServiceAsJson(contextPath+"/app/mktRes/phonenumber/releaseErrorNum", param, {
							"done" : function(){}
						});
					}
				}
				//释放预占的号码
				if(boProdAns.length>0){
					for(var n=0;n<boProdAns.length;n++){
						if(boProdAns[n].idFlag){
							continue;
						}
						var param = {
								numType : 1,
								numValue : boProdAns[n].accessNumber
						};
						$.callServiceAsJson(contextPath+"/app/mktRes/phonenumber/releaseErrorNum", param, {
							"done" : function(){}
						});
					}
				}
				//清除号码的缓存！
				order.phoneNumber.resetBoProdAn();
				common.callCloseWebview();
		}else if(OrderInfo.order.step == 2){
		$.confirm("确认","确定要取消该订单吗？",{
			yes:function(){
				//TODO　may initialize something;				
				var boProdAns = OrderInfo.boProdAns;
				var boProd2Tds = OrderInfo.boProd2Tds;
				var boProdAn = order.service.boProdAn;
				//取消订单时，释放被预占的UIM卡
				if(boProd2Tds.length>0){
					for(var n=0;n<boProd2Tds.length;n++){
						var param = {
								numType : 2,
								numValue : boProd2Tds[n].terminalCode
						};
						$.callServiceAsJson(contextPath+"/app/mktRes/phonenumber/releaseErrorNum", param, {
							"done" : function(){}
						});
					}
				}
				//释放预占的号码
				if(boProdAns.length>0){
					for(var n=0;n<boProdAns.length;n++){
						if(boProdAns[n].idFlag){
							continue;
						}
						var param = {
								numType : 1,
								numValue : boProdAns[n].accessNumber
						};
						$.callServiceAsJson(contextPath+"/app/mktRes/phonenumber/releaseErrorNum", param, {
							"done" : function(){}
						});
					}
				}else if(boProdAn.accessNumber.length>0){//进入选套餐页面返回释放预占号码
					var param = {
							numType : 1,
							numValue : boProdAn.accessNumber
					};
					$.callServiceAsJson(contextPath+"/app/mktRes/phonenumber/releaseErrorNum", param, {
							"done" : function(){}
						});
				}
				//清除号码的缓存！
				order.phoneNumber.resetBoProdAn();
				order.phoneNumber.btnQueryPhoneNumber();
				$("#number").show();
				$("#phonenumberContent").hide();
				$("#subPage").val("number");
				$("#pakeage").hide();
				$("#phone").hide();
				$("#pakeage").attr("class","tab-pane fade");
				$("#phone").attr("class","tab-pane fade medialist");
				$("#number").attr("class","tab-pane fade in active");
				$("#div_content").html("");
				$("#vice_modal").modal("hide");
				$("#order_prepare").show();
				$("#order-content").hide();
				$("#order").hide();
				OrderInfo.order.step=1;
			},no:function(){
				
			}},"question");
		}else if(OrderInfo.order.step==3){
			SoOrder.orderBack();
			$("#order-content").show();
			$("#order-confirm").hide();
			$("#order-dealer").hide();
			OrderInfo.order.step=2;
		}else if(OrderInfo.order.step==4){
			$("#order-confirm").show();
			$("#order-print").hide();
			OrderInfo.order.step=3;
		}else {
			common.callCloseWebview();
		}
		
//		$("#pakeage").show();
//		$("#pakeage").attr("class","tab-pane fade in active");
//		$("#tentrance").show();
//		$("#phone").show();
//		$("#number").show();
//		$("#pentrance").show();
//		$("#nentrance").show();
//		$("#tentrance").css("width","");
//		$("#nentrance").attr("class","");
//		
//		if(OrderInfo.order.step==1){
//			common.callCloseWebview();
//		}else if(OrderInfo.order.step==2){
//			$("#pakeage").hide();
//			OrderInfo.order.step=1;
//		}else{
//			common.callCloseWebview();
//		}
	};
	return {
		qryPhoneNbrLevelInfoList:_qryPhoneNbrLevelInfoList,
		selectNum:_selectNum,
		endSelectNum:_endSelectNum,
		//btnPurchase : _btnPurchase,
		btnQueryPhoneNumber : _btnQueryPhoneNumber,
		linkQueryPhoneNumber : _linkQueryPhoneNumber,
		getIndexPagePhoneNumber :_getIndexPagePhoneNumber,
		queryApConfig:_queryApConfig,
		initPhonenumber:_initPhonenumber,
		boProdAn:_boProdAn,
		resetBoProdAn:_resetBoProdAn,
		btnIBydentityQuery:_btnIBydentityQuery,
		//btnToOffer:_btnToOffer,
		initOffer:_initOffer,
		initPage:_initPage,
		chooseArea : _chooseArea,
		preePassword:_preePassword,
		queryPhoneNbrPool:queryPhoneNbrPool,
		queryFlag:_queryFlag,
		queryPnLevelProdOffer:queryPnLevelProdOffer,
		btnBack:_btnBack,
		scroll:_scroll,
		queryPhoneNumber:_queryPhoneNumber,
		back:_back
	};
})();

