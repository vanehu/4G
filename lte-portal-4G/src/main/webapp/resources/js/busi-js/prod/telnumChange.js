CommonUtils.regNamespace("prod", "telnum");

var phoneNum_level="";
var selectedObj=null;
var _queryFlag="0";
prod.telnum = (function(){
	var _boProdAn = {
			accessNumber : "", //接入号
			org_level:"",//原始的号码等级，为了页面展示增加的字段
			level : "", //等级
			anId : "", //接入号ID
			anTypeCd : "",//号码类型
			areaId:"",
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
					memberRoleCd:"",
					preStore:"",
					minCharge:""
			};
		};
		var idcode=[];
		//请求地址
		var url = contextPath+"/mktRes/telnumcg/list";
		var phoneNumberVal="";
		//按钮查询
		var _btnQueryPhoneNumber=function(param){
            selectedObj=null;//初始化原先选中的号码
			//收集参数
			param = _buildInParam(param);
			if (param == false) {
				return;
              }
              param.isReserveFlag=_queryFlag;
              if(_queryFlag=='1'){//预约选号
                   param.queryFlag="1";
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
					var content$=$("#change_order_phonenumber .phone_warp");
					content$.html(response.data);
					// 请求返回号码后按照当前所选排序选项进行页面DOM排序
					$("#change_pnOrder .selected").removeClass().click();
					$("#change_btnSwitchNbr").off("click").on("click",function(){prod.telnum.btnQueryPhoneNumber({});});
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","请求可能发生异常，请稍后再试！");
				}
			});	
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
			var areaId=order.prodModify.choosedProdInfo.areaId;
			var param={"identityId":idcode,"areaId":areaId};
			$.callServiceAsHtmlGet(contextPath+"/mktRes/telnumcg/listByIdentity",param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					if(!response||response.code != 0){
						 response.data='查询失败,稍后重试';
					}else if(response.code ==-2){
						return;
					}
					var content$=$("#change_order_phonenumber .phone_warp");
					content$.html(response.data);
					// 请求返回号码后按照当前所选排序选项进行页面DOM排序
					$("#change_pnOrder .selected").removeClass().click();
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
			//号码的预存话费
			var preStoreFare=phoneNumberVal.split("_")[1];
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
			var areaId=order.prodModify.choosedProdInfo.areaId;
			if(phoneNumber){
				var oldrelease=false;
				var oldPhoneNumber="";
				var oldAnTypeCd="";
				oldPhoneNumber=_boProdAn.accessNumber;
				oldAnTypeCd=_boProdAn.anTypeCd;
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
						var params={"oldPhoneNumber":oldPhoneNumber,"oldAnTypeCd":oldAnTypeCd,"areaId":OrderInfo.getProdAreaId(order.prodModify.choosedProdInfo.prodInstId)};
						$.callServiceAsJson(purchaseUrl, params, {});
					}
				}
				idcode.push(phoneNumber);
				
				_boProdAn.accessNumber=phoneNumber;
				_boProdAn.anTypeCd=anTypeCd;
				_boProdAn.pnLevelId=plevel;
				_boProdAn.org_level=orgLevel;
				_boProdAn.anId=phoneNumId;
				_boProdAn.areaId=areaId;
				_boProdAn.memberRoleCd=memberRoleCd;
				_boProdAn.preStore=preStoreFare;
				_boProdAn.minCharge=pnPrice;
				order.service.boProdAn = _boProdAn;
                   //_qryOfferInfoByPhoneNumFee();
				_nextStep();
				
			} else {
				$.alert("提示","号码格式不正确!");
			}
		};
		var _initOffer=function(subnum){
			if(_boProdAn.accessNumber!=''){
				$("#nbr_btn_"+subnum).removeClass("selectBoxTwo");
				$("#nbr_btn_"+subnum).addClass("selectBoxTwoOn");
				$("#nbr_btn_"+subnum).html(_boProdAn.accessNumber+"<u></u>");
			}
			if(_boProdAn.accessNumber!=''){
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
		var _qryOfferInfoByPhoneNumFee=function(){
              var param={"numsubflag":"number"};
			$.callServiceAsHtmlGet(contextPath+"/order/prodoffer/prepare",param,{
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
					var content$=$("#order_tab_panel_content");
					content$.html(response.data);
					order.service.initSpec();
					order.prodOffer.init();
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
			//号码的预存话费
			var preStoreFare=phoneNumberVal.split("_")[1];
			//保底消费
			var pnPrice=phoneNumberVal.split("_")[2];
			var areaId=order.prodModify.choosedProdInfo.areaId;
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
			if(phoneNumber){
                   //var params={"phoneNumber":phoneNumber,"actionType":"E","anTypeCd":anTypeCd,"areaId":OrderInfo.getProdAreaId(order.prodModify.choosedProdInfo.prodInstId)};
                var params={};
                   if(needPsw){
                         params={"phoneNumber":phoneNumber,"actionType":"E","anTypeCd":anTypeCd,"areaId":OrderInfo.getProdAreaId(order.prodModify.choosedProdInfo.prodInstId),"attrList":[{"attrId":"65010036","attrValue":needPsw}]};
                   }else{
                         params={"phoneNumber":phoneNumber,"actionType":"E","anTypeCd":anTypeCd,"areaId":OrderInfo.getProdAreaId(order.prodModify.choosedProdInfo.prodInstId)};
                   }
				var oldrelease=false;
				var oldPhoneNumber="";
				var oldAnTypeCd="";
				oldPhoneNumber=_boProdAn.accessNumber;
				oldAnTypeCd=_boProdAn.anTypeCd;
				if(oldPhoneNumber==phoneNumber){
					$.alert("提示","号码已经被预占,请选择其它号码!");
					return;
				}else{
					_boProdAn={};
				}
				if(oldPhoneNumber!=""&&oldPhoneNumber){
					oldrelease=true;
					for(var i=0;i<idcode.length;i++){//身份证预占的号码不需要被释放
						if(idcode[i]==oldPhoneNumber){
							oldrelease=false;
							break;
						}
					}
					if(oldrelease){
                             if(needPsw){
                                  params={"newPhoneNumber":phoneNumber,"oldPhoneNumber":oldPhoneNumber,"newAnTypeCd":anTypeCd,"oldAnTypeCd":oldAnTypeCd,"areaId":OrderInfo.getProdAreaId(order.prodModify.choosedProdInfo.prodInstId),"attrList":[{"attrId":"65010036","attrValue":needPsw}]};
                             }else{
                                  params={"newPhoneNumber":phoneNumber,"oldPhoneNumber":oldPhoneNumber,"newAnTypeCd":anTypeCd,"oldAnTypeCd":oldAnTypeCd,"areaId":OrderInfo.getProdAreaId(order.prodModify.choosedProdInfo.prodInstId)};
                             }
                             //params={"phoneNumber":phoneNumber,"oldPhoneNumber":oldPhoneNumber,"anTypeCd":anTypeCd,"oldAnTypeCd":oldAnTypeCd,"areaId":OrderInfo.getProdAreaId(order.prodModify.choosedProdInfo.prodInstId)};
					}
				}
				var purchaseUrl=contextPath+"/mktRes/phonenumber/purchase";
				$.callServiceAsJson(purchaseUrl, params, {
					"before":function(){
						$.ecOverlay("<strong>正在预占号码,请稍等会儿....</strong>");
					},"always":function(){
						$.unecOverlay();
					},	
					"done" : function(response){
						if (response.code == 0) {
							_boProdAn.accessNumber=phoneNumber;
							_boProdAn.anTypeCd=anTypeCd;
							_boProdAn.pnLevelId=plevel;
							_boProdAn.org_level=orgLevel;
							_boProdAn.anId=response.data.phoneNumId;
							_boProdAn.areaId=areaId;
							_boProdAn.memberRoleCd=memberRoleCd;
							_boProdAn.preStore=preStoreFare;
							_boProdAn.minCharge=pnPrice;
							 order.service.boProdAn = _boProdAn;
                                   //_qryOfferInfoByPhoneNumFee();
							_nextStep();
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
          // 改号密码预占查询如果选择"是"，则需要展示提供信息并填写全位号码
          var _modifyPswChange = function(flag){
              if (flag) {
                   
                   $("#change_pswInfo").show();
                   $("#change_phoneNum").show();
                   $("#phoneNum").show();
                   $("#change_pnFour").val("");
                   $("#change_pnFour").prop("disabled", true);
                   $("#change_pnFive").val("");
                   $("#change_pnFive").prop("disabled", true);
                   $("#change_pnSix").val("");
                   $("#change_pnSix").prop("disabled", true);
                   $("#change_pnSeven").val("");
                   $("#change_pnSeven").prop("disabled", true);
                   $("#change_pnEnd").val("");
                   $("#change_pnEnd").prop("disabled", true);
                   $("#change_pnNotExitNum").val("");
                   $("#change_pnNotExitNum").prop("disabled", true);
              } else {
                   $("#change_pswInfo").hide();
                   $("#phoneNum").hide();
                   $("#change_phoneNum").hide();
                   $("#change_pnFour").prop("disabled", false);
                   $("#change_pnFive").prop("disabled", false);
                   $("#change_pnSix").prop("disabled", false);
                   $("#change_pnSeven").prop("disabled", false);
                   $("#change_pnEnd").prop("disabled", false);
                   $("#change_pnEnd").val("最后四位");
                   $("#change_pnNotExitNum").prop("disabled", false);
                   $("#change_pnNotExitNum").val("后四位不含");
              }
          }
		//构造查询条件 
		var _buildInParam = function(param){
            var query_flag_02= $('input:radio[name="query_flag_02"]:checked').val();
			var areaId=order.prodModify.choosedProdInfo.areaId;
			var pnHead = $("#change_pnHead").find("a.selected").attr("val");
			var pnEnd =$.trim($("#change_pnEnd").val());
			var pnFour = $.trim($("#change_pnFour").val());
			var pnFive = $.trim($("#change_pnFive").val());
			var pnSix = $.trim($("#change_pnSix").val());
			var pnSeven = $.trim($("#change_pnSeven").val());
			var middleRegExp = ''; // 中间四位正则匹配
			var pnNotExitNum = $.trim($("#change_pnNotExitNum").val());
			if(pnNotExitNum == '后四位不含'){
				pnNotExitNum = '';
			}
			if(pnEnd=='最后四位'){
				pnEnd='';
			}
//              var phoneNum=$.trim($("#phoneNum").val());
//              if(phoneNum=="任意四位"){
//                   phoneNum='';
//              }
			
//			pnNotExitNum = (pnNotExitNum == '') ? pnNotExitNum : "[^" + pnNotExitNum + "]{4}$";
			// 校验中间四位是否是数字
			var singleNum = /^\d?$/;
			if (!singleNum.test(pnFour) || !singleNum.test(pnFive) || !singleNum.test(pnSix) || !singleNum.test(pnSeven)) {
				$.alert("提示", "请正确输入中间4位号码");
				return false;
			}
			// 组合正则（中间四位+后四位不含）
//			if (ec.util.isObj(pnFour) || ec.util.isObj(pnFive) || ec.util.isObj(pnSix) || ec.util.isObj(pnSeven)) {
//				if (ec.util.isObj(pnFour)) {
//					middleRegExp += pnFour;
//				} else {
//					middleRegExp += '\\d';
//				}
//				if (ec.util.isObj(pnFive)) {
//					middleRegExp += pnFive;
//				} else {
//					middleRegExp += '\\d';
//				}
//				if (ec.util.isObj(pnSix)) {
//					middleRegExp += pnSix;
//				} else {
//					middleRegExp += '\\d';
//				}
//				if (ec.util.isObj(pnSeven)) {
//					middleRegExp += pnSeven;
//				} else {
//					middleRegExp += '\\d';
//				}
//				pnNotExitNum = !ec.util.isObj(pnNotExitNum) ? middleRegExp + "\\d{4}$" : middleRegExp + pnNotExitNum;
//			}
              var phoneNum=$.trim($("#phoneNum").val());
              if(phoneNum == "任意四位" || query_flag_02 == 1){
                   phoneNum = '';
              } else if (query_flag_02 == 2) {
                   // 密码预占查询选择“是”，全位号码必填
                   if (!ec.util.isObj(phoneNum) || !CONST.LTE_PHONE_HEAD.test(phoneNum)) {
                        $.alert("提示", "请正确输入已经“靓号预占”的11位号码", "information", function() {
                             $("#phoneNum").focus();
                        });
                        return false;
                   }
              }
			var pnCharacterId;
			var Greater  = "";
			var Less  ="";
			var poolId = $("#change_nbrPool option:selected").val();	
			var preStore$=$("#change_preStore").find("a.selected");
			if(preStore$.length>0){
				Greater= preStore$.attr("Greater");
				Less=preStore$.attr("Less");
			}
			if($("#change_pnCharacterId_basic").css("display") != "none"){
				pnCharacterId = $("#change_pnCharacterId_basic a.selected").attr("val");
			}
			if($("#change_pnCharacterId_all").css("display") != "none"){
				pnCharacterId = $("#change_pnCharacterId_all a.selected").attr("val");
			}
			pnCharacterId = ec.util.defaultStr(pnCharacterId);
			return {"pnHead":pnHead,"pnIndexNotExit":"8-11","notContainNum":pnNotExitNum, "number4": pnFour, "number5": pnFive, "number6": pnSix,"number7": pnSeven,"pnEnd":pnEnd,"goodNumFlag":pnCharacterId,"maxPrePrice":Less,
                   "minPrePrice":Greater,"pnLevelId":'',"pageSize":"20","phoneNum":phoneNum,"areaId":areaId,"poolId":poolId,"queryFlag":query_flag_02
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
			prod.telnum.btnQueryPhoneNumber(param);
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
		//查询平台配置信息
		var _queryApConfig=function(){
			var configParam={"CONFIG_PARAM_TYPE":"TERMINAL_AND_PHONENUMBER"};
			var qryConfigUrl=contextPath+"/order/queryApConf";
			$.callServiceAsJsonGet(qryConfigUrl, configParam,{
				"done" : call_back_success_queryApConfig
			});
		};
		var call_back_success_queryApConfig=function(response){
			var PHONE_NUMBER_PRESTORE;
			var PHONE_NUMBER_SEGMENT;
			var PHONE_NUMBER_FEATURE;
			var phoneNumberPreStoreHtml="<a href=\"javascript:void(0);\" class=\"selected\" Greater=\"\" Less=\"\">不限</a>";
			var phoneNumStartHtml="<a href=\"javascript:void(0);\" class=\"selected\" val=\"\">不限</a>";
			var phoneNumberFeatureLessHtml="<a href=\"javascript:void(0);\" class=\"selected \" val=\"\">不限</a>";
			var phoneNumberFeatureMoreHtml="<a href=\"javascript:void(0);\" class=\"selected \" val=\"\">不限</a>";
			if(response.data){
				var dataLength=response.data.length;
				//号码预存话费
				for (var i=0; i < dataLength; i++) {
					if(response.data[i].PHONE_NUMBER_PRESTORE){
					  	PHONE_NUMBER_PRESTORE=response.data[i].PHONE_NUMBER_PRESTORE;
					  	for(var m=0;m<PHONE_NUMBER_PRESTORE.length;m++){
					  		var  preStore=PHONE_NUMBER_PRESTORE[m].COLUMN_VALUE_NAME.replace(/\"/g, "");
					  		var greater;
					  		var less;
				  			var preStoreArry=preStore.split("-");
				  			if(preStoreArry.length!=1){
				  				greater=preStoreArry[0];
				  				less=preStoreArry[1];
				  			}else{
				  				preStoreArry=preStoreArry.toString();
				  				greater=preStoreArry.substring(0,preStoreArry.length-2);
				  				less="\"\"";
				  			}
				  			preStore=preStore.replace(/\"/g, "");
					  		phoneNumberPreStoreHtml=phoneNumberPreStoreHtml+"<a href=\"javascript:void(0);\" Greater="+greater+" Less="+less+">"+preStore+"</a>";
					  	}
					  	$("#change_preStore").html(phoneNumberPreStoreHtml);
						continue;
					}
				};
				//号段
				for (var i=0; i < dataLength; i++) {
					if(response.data[i].PHONE_NUMBER_SEGMENT){
					  	PHONE_NUMBER_SEGMENT=response.data[i].PHONE_NUMBER_SEGMENT;
					  	for(var m=0;m<PHONE_NUMBER_SEGMENT.length;m++){
					  		var  numberStart=PHONE_NUMBER_SEGMENT[m].COLUMN_VALUE_NAME;
					  		numberStart=numberStart.replace(/\"/g, "");
					  		phoneNumStartHtml=phoneNumStartHtml+"<a href=\"javascript:void(0);\" val="+numberStart+">"+numberStart+"</a>";
					  	}
					  	$("#change_pnHead").html(phoneNumStartHtml);
						continue;
					}
				};
				//号码特征
				for (var i=0; i < dataLength; i++) {
					if(response.data[i].PHONE_NUMBER_FEATURE){
					  	PHONE_NUMBER_FEATURE=response.data[i].PHONE_NUMBER_FEATURE;
					  	var featureLength;
					  	if(PHONE_NUMBER_FEATURE.length<=6){
					  		featureLength=PHONE_NUMBER_FEATURE.length;
					  	}else{
					  		featureLength=6;
					  	}
					  	for(var m=0;m<featureLength;m++){
					  		var numberFeature=(PHONE_NUMBER_FEATURE[m].COLUMN_VALUE_NAME).replace(/\"/g, "");
					  		var numberFeatureVal=(PHONE_NUMBER_FEATURE[m].COLUMN_VALUE).replace(/\"/g, "");
					  		phoneNumberFeatureLessHtml=phoneNumberFeatureLessHtml+"<a href=\"javascript:void(0);\" val="+numberFeatureVal+">"+numberFeature+"</a>";
					  	}
					  	if(PHONE_NUMBER_FEATURE.length>6){
					  		for(var n=0;n<PHONE_NUMBER_FEATURE.length;n++){
					  			var numberFeature=(PHONE_NUMBER_FEATURE[n].COLUMN_VALUE_NAME).replace(/\"/g, "");
					  			var numberFeatureVal=(PHONE_NUMBER_FEATURE[n].COLUMN_VALUE).replace(/\"/g, "");
					  			phoneNumberFeatureMoreHtml=phoneNumberFeatureMoreHtml+"<a href=\"javascript:void(0);\" val="+numberFeatureVal+">"+numberFeature+"</a>";
					  		}
					  		$("#change_pnCharacterId_more").show();
					  		$("#change_pnCharacterId_more").off("click").on("click",function(event){_view_phonenumber_feature();event.stopPropagation();});
					  	}
					  	$("#change_pnCharacterId_basic").html(phoneNumberFeatureLessHtml);
					  	$("#change_pnCharacterId_all").html(phoneNumberFeatureMoreHtml);
						continue;
					}
				};
			}
			$("#change_pnCharacterId_basic a").each(function(){$(this).off("click").on("click",function(event){prod.telnum.linkQueryPhoneNumber("#change_pnCharacterId_basic a",this);event.stopPropagation();});});
			$("#change_pnCharacterId_all a").each(function(){$(this).off("click").on("click",function(event){prod.telnum.linkQueryPhoneNumber("#change_pnCharacterId_all a",this);event.stopPropagation();});});
			$("#change_pnHead a").each(function(){$(this).off("click");$(this).on("click",function(event){prod.telnum.linkQueryPhoneNumber("#change_pnHead a",this);event.stopPropagation();});});
			$("#change_preStore a").each(function(){$(this).off("click");$(this).on("click",function(event){prod.telnum.linkQueryPhoneNumber("#change_preStore a",this);event.stopPropagation();});});
		};
		//号码类型全部展示与部分展示
		var _view_phonenumber_feature = function(){
			if($('#change_pnCharacterId_basic').is(':hidden')){
				$("#change_pnCharacterId_basic").css("display","");
				$("#change_pnCharacterId_all").css("display","none");
				$("#change_pnCharacterId_all").parent("dl").css("overflow","inherit");
			}else{
				$("#change_pnCharacterId_basic").css("display","none");
				$("#change_pnCharacterId_all").css("display","");
				$("#change_pnCharacterId_all").parent("dl").css("overflow","hidden");
			}
		};
		
		var _initPhonenumber=function(){
			selectedObj=null;
			ispurchased=0;
			selectedLevel="";
			prod.telnum.queryApConfig();
			var param={};
			queryPhoneNbrPool();
			queryPnLevelProdOffer();
			prod.telnum.btnQueryPhoneNumber(param);
			$("#change_btnNumSearch").off("click").on("click",function(){prod.telnum.btnQueryPhoneNumber(param);});
			$("#change_btnNumExistSearch").off("click").on("click",function(event){prod.telnum.btnIBydentityQuery(param);event.stopPropagation();});
		};
		//靓号预存和保底金额查询
		var queryPnLevelProdOffer = function(){
			var url=contextPath+"/mktRes/phonenumber/queryPnLevelProdOffer";
			var areaId=$("#p_cust_areaId").val();
			areaId = areaId.substring(0,3)+"0000";
			var param={"areaId":areaId};
			var response = $.callServiceAsJson(url,param);
		};
		//选择地区
		var _chooseArea = function(){
			order.area.chooseAreaTree("order/prepare","p_phone_areaId_val","p_phone_areaId",3);
		};
		
		//规则校验
		var _initPage = function(){
			//var cookieSP = CommonUtils.getCookieFromJava("switchSP");
			var cookieSP = query.common.queryPropertiesValue("CHECK_SOLDIER_POLICE");
			var identityName = $("#identityName").text();
			var theName = identityName.split("/")[0];
			//军人身份证件、武装警察身份证件不能作为实名登记有效证件，不允许改号码
			if(cookieSP == "ON"){
				if($("#p_cust_identityCd").val() == "2" || $("#p_cust_identityCd").val() == "14" || theName.trim() == "军人身份证件" || theName.trim() == "武装警察身份证件"){
					$.alert("提示", "军人身份证件、武装警察身份证件不能作为实名登记有效证件，不允许改号！");
					return;
				}
			}			
			
          if($("#phoneNum").attr("id")!=undefined){
               $("#phoneNum").attr("id","change_phoneNum");
          }
            var custInfo = order.cust.getCustInfo415();
            order.cust.preCheckCertNumberRelQueryOnly(custInfo);//查询证件下已经有的号码个数
            var oldNum = OrderInfo.oneCardFiveNum.usedNum[order.cust.getCustInfo415Flag(custInfo)];
            if (oldNum > 5) {
                $.alert("提示", "证件「" + custInfo.certNum + "」全国范围已有5张以上移动号卡，不允许办理改号业务！");
                return;
            }
            if(OrderInfo.authRecord.resultCode!="0" && OrderInfo.preBefore.prcFlag != "Y"){
				if (order.prodModify.querySecondBusinessAuth("17", "Y", "prod.telnum.initPage")) {
					return;
				}
			}
			if(order.prodModify.choosedProdInfo.prodStateCd!=CONST.PROD_STATUS_CD.NORMAL_PROD){
				$.alert("提示","当前产品状态不是【在用】,不允许受理该业务！");
				return;
			}
			
			//查分省前置校验开关
	        var propertiesKey = "PRECHECKFLAG_"+OrderInfo.staff.soAreaId.substring(0,3);
	        var isPCF = offerChange.queryPortalProperties(propertiesKey);
	        if(isPCF == "ON"){
	        	if(OrderInfo.preBefore.prcFlag != "Y"){
	        		if(!order.prodModify.preCheckBeforeOrder("17","prod.telnum.initPage")){
	            		return ;
	            	}
	        	}
	        }
	        OrderInfo.preBefore.prcFlag = "";
	        
			OrderInfo.busitypeflag=50;
			var param = order.prodModify.getCallRuleParam(CONST.BO_ACTION_TYPE.UPDATE_ACCNBR,order.prodModify.choosedProdInfo.prodInstId);
			var callParam = {
					boActionTypeCd : CONST.BO_ACTION_TYPE.UPDATE_ACCNBR,
					boActionTypeName : CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.UPDATE_ACCNBR),
					accessNumber : order.prodModify.choosedProdInfo.accNbr,
					prodOfferName : order.prodModify.choosedProdInfo.prodOfferName
				};
			var flag = rule.rule.prepare(param,'prod.telnum.showTelnumChange',callParam);
			if (flag) return;
		};
		
		var _showTelnumChange=function(){
			//初始化订单信息
			OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.UPDATE_ACCNBR,16,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.UPDATE_ACCNBR),"");
			SoOrder.builder();//设置页面效果
		
			var url=contextPath+"/mktRes/telnumcg-prepare";
			var param={};
			if(_boProdAn.accessNumber!=''&&_boProdAn.anTypeCd!=''){
				var oldrelease=true;
				for(var i=0;i<idcode.length;i++){//身份证预占的号码不需要被释放
					if(idcode[i]==_boProdAn.accessNumber){
						oldrelease=false;
						break;
					}
				}
				if(oldrelease){
					param={"oldPhoneNumber":_boProdAn.accessNumber,"oldAnTypeCd":_boProdAn.anTypeCd};
				}
			}
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
					var content$=$("#order_fill_content").show();
					content$.html(response.data);
					//设置页面修改号和类型。
					$("#cgnum_view").html(order.prodModify .choosedProdInfo.productName+"："+order.prodModify .choosedProdInfo.accNbr);
					//初始化要修改的号和选择的号
					_boProdAn = {accessNumber : "",level : "",anId : "",anTypeCd : ""};
					_initPhonenumber();
				}
			});	
		};
		var _nextStep=function(){
			if(_boProdAn.accessNumber){
				OrderInfo.boProdAns = [];
				_boProdAn.state="ADD";
				OrderInfo.boProdAns.push(_boProdAn);
				var call_param={"prodInstId":order.prodModify.choosedProdInfo.prodInstId,
						"areaId":order.prodModify.choosedProdInfo.areaId};
				var qryUrl=contextPath+"/mktRes/telnumcg/queryProdInstAccNbr";
				$.callServiceAsJson(qryUrl, call_param,{
					"done" : function(response){
						if(response.code==0){
							if(response.data.prodInstAccNbrList&&response.data.prodInstAccNbrList.length>0){
								var oldAn = response.data.prodInstAccNbrList[0];
								var an = {
									accessNumber : oldAn.accNbr,
									anTypeCd : _boProdAn.anTypeCd,
									anId : oldAn.anId,
									state : "DEL"
								};
								OrderInfo.boProdAns.push(an);
								SoOrder.submitOrder();
							}else{
								$.alert("提示","该产品实例未返回原号码信息");
							}
						}else if(response.code==-2){
							$.alertM(response.data);
						}else{
							if(response.data){
								$.alert("提示","产品实例与号码关系查询异常！"+response.data);
							}else{
								$.alert("提示","产品实例与号码关系查询异常！");
							}
							return;
						}
					}
				});
			}else{
				$.alert("提示","请选择新号码！");
			}
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
		//查询号池
		var queryPhoneNbrPool = function(){
			var url=contextPath+"/mktRes/phonenumber/queryPhoneNbrPool";
			var param={};
			var response = $.callServiceAsJson(url,param);
			if (response.code==0) {
				if(response.data){
					var phoneNbrPoolList= response.data.phoneNbrPoolList;
					var $sel = $('<select id="nbrPool" style="width:200px;"></select>');  
					var $defaultopt = $('<option value="" selected="selected">请选择号池</option>');
					$sel.append($defaultopt);
					if(phoneNbrPoolList!=null){
						$.each(phoneNbrPoolList,function(){
							var $option = $('<option value="'+this.poolId+'">'+this.poolName+'</option>');
							$sel.append($option);
						});
					}
					$("#change_nbrPool").append($sel);
				}
			}else if(response.code == -2){
				$.alertM(response.data);
			}else{
				$.alert("提示","号池加载失败，请稍后再试！");
			}
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
                   if(phoneNumberVal_06=="1"){
                        easyDialog.open({
                             container : 'password_dialog'
                        });
                   }else{
				_btnPurchase(selectedObj);
			}
              }
		};
//          var selectedObj=null;
//          var ispurchased=0;
//          var selectedLevel="";
		/**
		 * obj被选中的号码对象
		 * ispurchased是否身份预占号码。1：是,0否。不是身份预占的号码需要调用预占方法。
		 */
		var _selectNum=function(obj,purchas){
			// 号码资源状态前置校验
			var flagQueryRes = $.callServiceAsJson(contextPath + "/common/queryPortalProperties", {"propertiesKey": "NUMBER_CHECK_" + OrderInfo.staff.soAreaId.substring(0,3)});	
	        var numberCheckFlag = flagQueryRes.code == 0 ? flagQueryRes.data : "";
			if ("ON" == numberCheckFlag) {
				var accNbr = $(obj).attr("phonenumber");
				var response = $.callServiceAsJson(contextPath + "/order/prodModify/preCheckBeforeOrde", {"serviceType": 38, "accNbr": accNbr});
				if (response.code != 0) {
					$.alertM(response.data);
					return;
				} else if (response.data.checkLevel == 20) {
					$.alert("提示", accNbr + "不可放号" + (ec.util.isObj(response.data.checkInfo) ? "，具体原因：" + response.data.checkInfo : ""));
					return;
				}
			}
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
              var preePasswordText=$("#pree_password_text").val();
              if(!ec.util.isObj($.trim(preePasswordText))){
                   $.alert("提示","预占密码不能为空！");
              }else{
                   easyDialog.close();
                   $("#pree_password_text").val("");//初始化
                   _btnPurchase(selectedObj,preePasswordText);
              }
          };
		return {
			qryPhoneNbrLevelInfoList:_qryPhoneNbrLevelInfoList,
			endSelectNum:_endSelectNum,
			//nextStep:_nextStep,
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
              modifyPswChange:_modifyPswChange,
              queryFlag:_queryFlag,
              preePassword:_preePassword,
			initOffer:_initOffer,
			selectNum:_selectNum,
			initPage:_initPage,
			showTelnumChange:_showTelnumChange,
			chooseArea : _chooseArea
		};

})();
