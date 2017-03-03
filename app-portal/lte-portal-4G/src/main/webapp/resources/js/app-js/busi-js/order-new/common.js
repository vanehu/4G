/**
 * app 业务统一入口
 * 
 */
CommonUtils.regNamespace("common");
common = (function($) { 
	
	var _callOrderServer=function(staffInfos,custInfos,prodIdInfos,url){
//		var custInfosTemp = custInfos;
//		custInfosTemp.identityPic = "";
//		var custInfosParamsTemp=JSON.stringify(custInfosTemp);//客户定位信息
		var staffInfosParams=JSON.stringify(staffInfos);//登录信息
		var custInfosParams=JSON.stringify(custInfos);//客户定位信息
		var prodIdInfosParams=JSON.stringify(prodIdInfos);//选中产品信息
		var urlParams=$.parseJSON(JSON.stringify(url));//地址
		OrderInfo.actionFlag=urlParams.actionFlag;
		
        //去除四个可能带等号的加密字段
	    var myCust1=$.parseJSON(custInfosParams);//四个加密字段可能值不合法，传入后台会报400错误，故转换该值。
	    var CN=myCust1.CN;
	    var address=myCust1.address;
	    var certNum=myCust1.certNum;
	    if(CN!=undefined){
	    	myCust1.CN=CN.replace(/=/g,"&#61");
	    }
	    if(certNum!=undefined){
	    	myCust1.address=address.replace(/=/g,"&#61");
	    }
	    if(address!=undefined){
	    	myCust1.certNum=certNum.replace(/=/g,"&#61");
	    }	
		var myCust=JSON.stringify(myCust1);
		custInfosParams=myCust;	
		if(ec.util.isObj(prodIdInfos)){
			order.prodModify.choosedProdInfo=$.parseJSON(prodIdInfosParams);
		}
		if(ec.util.isObj(staffInfos)){
			OrderInfo.staff=$.parseJSON(staffInfosParams);
		}
		if(ec.util.isObj(custInfos)){
			OrderInfo.cust=$.parseJSON(custInfosParams);
			var custOther1 = OrderInfo.cust.custOther1;
			if(custOther1 && custOther1!=""){
			   OrderInfo.boPartyContactInfo = $.parseJSON(custOther1);
			}
		}
		var custParam = JSON.parse(custInfosParams);
		custParam.identityPic = "";
		var param={
			"staffInfos":staffInfosParams,
			"custInfos":JSON.stringify(custParam),
			"prodIdInfos":prodIdInfosParams
		};
		var enter = urlParams.enter;
		if(enter != undefined){
			param.enter = enter;
		}
		if(OrderInfo.actionFlag != undefined){
			param.actionFlag = OrderInfo.actionFlag;
		}
		var method=urlParams.method;// /app/prodModify/custAuth
		param.newFlag = "1";
		$.callServiceAsHtml(contextPath+method,param,{
			"before":function(){
				$.ecOverlay("正在努力加载中，请稍等...");
			},
			"done" : function(response){
				$.unecOverlay();
				$("#load").hide();
				var pp =$("#content").html(response.data);
				$.refresh(pp);
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			}
		});
	};
	
	//客户定位后，回传客户信息
	var _callCustInfo = function(custInfos){
		if(OrderInfo.actionFlag!=111 && OrderInfo.actionFlag!=112){
			var custInfosParams=JSON.stringify(custInfos);//客户定位信息
			if(ec.util.isObj(custInfos)){
				OrderInfo.cust=$.parseJSON(custInfosParams);
			}
		}else{
			var ua = navigator.userAgent.toLowerCase();	
			if (/iphone|ipad|ipod/.test(ua)) {
				if(custInfos.indexOf('\"custOther1\":\"{')>=0){//联系人不为空
					var start=custInfos.indexOf('\"custOther1\":\"{');
					var end=custInfos.indexOf('\"partyName');
					var custInfos2=custInfos.substring(0,start)+custInfos.substring(end,custInfos.length);
					var custOther1=custInfos.substring(start+14,end-2);
					OrderInfo.cust=$.parseJSON(custInfos2);
					OrderInfo.cust.custOther1 = $.parseJSON(custOther1);
				}else{
					OrderInfo.cust=$.parseJSON(custInfos);
				}
			}else if (/android/.test(ua)) {
				    //alert("android");	
				var custInfosParams=JSON.stringify(custInfos);//客户定位信息
				if(ec.util.isObj(custInfos)){
					OrderInfo.cust=$.parseJSON(custInfosParams);
					if(OrderInfo.cust.custOther1.length != 0){
						var custOther1 = JSON.stringify(OrderInfo.cust.custOther1)
						custOther1=custOther1.substring(1,custOther1.length-1).replace(/\\/g,"");
						OrderInfo.cust.custOther1 = $.parseJSON(custOther1);
					}
				}
			}
			if(OrderInfo.actionFlag==111){
				order.broadband.showCust();
			}
		}
	};
	
	//调用客户端的身份证识别方法       method：表示回调js方法 如：order.prodModify.getIDCardInfos
	var _callIDCardRec=function(method){
		var arr=new Array(1);
		arr[0]=method;
		MyPlugin.getIDCardInfos(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	
	//调用客户端的拍照方法       method：表示回调js方法 如：order.prodModify.getIDCardInfos
	var _callPhotos=function(method){
		var partyName = $('#orderAttrName').val();//经办人名称
		var areaId = OrderInfo.staff.areaId;//经办人地区
		var telNumber = $('#orderAttrPhoneNbr').val();//联系电话
		var addressStr = $('#orderAttrAddr').val();//经办人地址
		var identityCd = $('#orderIdentidiesTypeCd').val();//证件类型
		if(identityCd==1){
			var identityNum = $('#sfzorderAttrIdCard').val();//证件号码
			OrderInfo.jbr.identityNum = identityNum;
		}else{
			var identityNum = $('#orderAttrIdCard').val();//证件号码
		}
		//当前无经办人，需进行经办人查询
		if(!OrderInfo.jbr.custId) {
			OrderInfo.virOlId = "";
			order.main.queryJbr();
			return;
		}
		//当前输入的证件号码与经办人证件号码不一致，需要重新查询经办人
		if(ec.util.isObj(identityNum) && identityNum != OrderInfo.jbr.identityNum){
			OrderInfo.virOlId = "";
			order.main.queryJbr();
			return;
		}
		var arr=new Array(1);
		var custIdentityPic = OrderInfo.cust.identityPic;
		
		var jbrIdentityPic = OrderInfo.jbr.identityPic;
		if(OrderInfo.cust.telNumber == undefined){
			OrderInfo.cust.telNumber = "";
		}
		var json = "{\"picturesInfo\":[";
		if(custIdentityPic != undefined && ec.util.isObj(custIdentityPic)){
			json = json + "{\"orderInfo\":\"" + OrderInfo.cust.identityPic + "\",\"picFlag\":\"A\",\"custName\":\"" + OrderInfo.cust.partyName + "\",\"certType\":\"" + OrderInfo.cust.identityCd + "\",\"certNumber\":\"" + OrderInfo.cust.identityNum + "\",\"accNbr\":\"" + OrderInfo.cust.telNumber +"\"},";
		}
		for(var i=0; i<OrderInfo.choosedUserInfos.length; i++){
			var prodId = OrderInfo.choosedUserInfos[i].prodId;
			var custInfo = OrderInfo.getChooseUserInfo(prodId);
			var userIdentityPic = custInfo.identityPic;
			if(userIdentityPic != undefined && ec.util.isObj(userIdentityPic)){
				json = json + "{\"orderInfo\":\"" + userIdentityPic + "\",\"picFlag\":\"B\",\"custName\":\"" + custInfo.partyName + "\",\"certType\":\"" + custInfo.identityCd + "\",\"certNumber\":\"" + custInfo.identityNum + "\",\"accNbr\":\"" + custInfo.telNumber +"\"},";
			}
		}
	
		if(jbrIdentityPic != undefined && ec.util.isObj(jbrIdentityPic)){
			json = json + "{\"orderInfo\":\"" + OrderInfo.jbr.identityPic + "\",\"picFlag\":\"C\",\"custName\":\"" + partyName + "\",\"certType\":\"" + identityCd + "\",\"certNumber\":\"" + identityNum + "\",\"accNbr\":\"" + telNumber +"\"},";
		}
		
		json = json + "{\"orderInfo\":\"\",\"picFlag\":\"D\",\"custName\":\"" + partyName + "\",\"certType\":\"" + identityCd + "\",\"certNumber\":\"" + identityNum + "\",\"accNbr\":\"" + telNumber +"\"}";
		json = json+"]}";
		arr[0]=method;
		arr[1]=json;
		MyPlugin.photoProcess(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	
	//调用客户端的二代证识别方法       method：表示回调js方法 如：order.prodModify.getIDCardInfos
	var _callGenerationRec=function(method,type){
		var arr=new Array(1);
		arr[0]=method;
		arr[1]=type;
		MyPlugin.getGenerationInfos(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	
	//读取身份证后直接返回结果（用于和PC双屏互动）
	var _getGenerationInfos=function(name,idcard,address,identityPic,signature){
		$("#custname").val(""); //姓名
		$("#idcard").val("");//身份证号码
		$("#address").val("");//地址
		$("#identityPic").val("");//证件照片
		$("#signature").val("");//证件照片
		$("#custname").val(name); //姓名
		$("#idcard").val(idcard);//身份证号码
		$("#address").val(address);//地址
		$("#identityPic").val(identityPic);//证件照片
		$("#signature").val(signature);//信息签名
		$("#readCard").click();
	};
	
	var _saveCust = function(){
		var arr=new Array(1);
		arr[0]=JSON.stringify(OrderInfo.cust);
		MyPlugin.showCust(arr,
	            function(result) {
        },
        function(error) {
        }
        );
	};
	
	
	//调用客户端的关闭webview方法
	var _callCloseWebview=function(){
		if($("#alert-modal").length>0){
			$("#alert-modal").hide();
		}
		var arr=new Array(1);
		arr[0]="";
		MyPlugin.closeWebview(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	
	//调用客户端的类似重定位去除客户缓存方法
	var _relocationCust=function(){
		if($("#alert-modal").length>0){
			$("#alert-modal").hide();
		}
		var arr=new Array(1);
		arr[0]="";
		MyPlugin.relocationCust(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	
	
	//调用客户端的数字签名板
	var _callDatasign=function(method){
		var arr=new Array(1);
		arr[0]=method;
		MyPlugin.datasign(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	
	//调用客户端的扫描
	var _callScanning=function(method,prodId){
		var arr=new Array(1);
		arr[0]=method;
		arr[1]=prodId;
		MyPlugin.scanning(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	
	//扫描后直接返回结果（用于和PC双屏互动）
	var _scaningCallBack=function(terInfo,prodId){
		$("#channelId").val("");
		$("#number").val("");
		if(prodId=="-999"){
			$("#channelId").val(terInfo);
			$("#goRoom").click()
		}else if(prodId=="-888"){
			$("#number").val(terInfo);
			$("#senNum").click()
		}
//		return terInfo;
	};
	
	//调用客户端的日历
	var _callcalendar=function(time,format,method,textId){
		var arr=new Array(1);
		arr[0]=time;
		arr[1]=format;
		arr[2]=method;
		arr[3]=textId;
		MyPlugin.calendar(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	//时间框赋值
	var _setCalendar = function(time,textId){
		$("#"+textId).val(time);
	};
	
	//客户端调用此方法返回到上一页 1 为prepare页面  2为order-content（填单）页面 3为order-confirm（订单确认和收银台）页面 4为order-print（打印）页面
	var _callReturnBack=function(){
		if($("#order-error").is(":visible")){//错误页面不允许返回
			return;
		}
		if($(".modal-dialog").is(":visible")){//有弹出层不允许返回
			return;
		}
//		alert("OrderInfo.actionFlag="+OrderInfo.actionFlag+"---OrderInfo.order.step="+OrderInfo.order.step+"---OrderInfo.returnFlag="+OrderInfo.returnFlag);
		if($(".modal-backdrop").length>0 && $("#overlay-modal").length>0){
			$.unecOverlay();//网络出现故障或手机出现故障时按返回关闭“加载中”提示框
		}
		//如果收费成功  安卓手机返回按钮不可返回
		if($("#toCharge").length>0){
			if(OrderInfo.order.step==4 && OrderInfo.actionFlag==111){
				$("#confirm").show();
				$("#print").hide();
				OrderInfo.order.step = 3;
				return;
			}
		}
		if(OrderInfo.jbrPageFlag == "Y"){
			OrderInfo.jbrPageFlag = "N";
			$("#order-content").show();
			$("#terminalMain").show();
			$("#jbr").hide();
			return;
		}
		if(OrderInfo.actionFlag==1){//新版号卡新装返回处理
			if(OrderInfo.order.step==1){
				_callCloseWebview();
				return;
			}else if(OrderInfo.order.step==2){
				if(order.service.enter==3){//选号入口
					var boProdAns = OrderInfo.boProdAns;
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
								"done" : function(){
								}
							});
						}
					}
					order.phoneNumber.boProdAn={};//清空号码缓存
					 order.phoneNumber.btnQueryPhoneNumber(1,undefined,"true");
					 $("#offer_a").hide();
					 $("#phoneNumber_a").show();
					$("#nav-tab-2").removeClass("active in");
			    	$("#nav-tab-1").addClass("active in");
			    	$("#tab2_li").removeClass("active");
			    	$("#tab1_li").addClass("active");				
				}else if(order.service.enter==1){//选套餐入口
					$("#offer_a").show();
					 $("#phoneNumber_a").hide();
					$("#nav-tab-1").removeClass("active in");
			    	$("#nav-tab-2").addClass("active in");
			    	$("#tab1_li").removeClass("active");
			    	$("#tab2_li").addClass("active");
			    	$("#tab3_li").hide();
				}
				OrderInfo.order.step=1;
				return;
			}else if(OrderInfo.order.step==3){//副卡
				$("#secondaryCardModal").modal("hide");
				//如果副卡页面未关闭  则关闭副卡页面
				if($("#phonenumber-list2").length>0 && $("#phonenumber-list2").css("display")!="none"){
					$("#phonenumber-list2").hide();
					$("#phoneNumber_a").hide();
					$("#secondaryPhoneNumUl").show();
					$("#fk_phonenumber_next").show();
					return;
				}
				if(order.service.enter==3){//选号入口
					$("#offer_a").show();
					$("#phoneNumber_a").hide();
					$("#nav-tab-3").removeClass("active in");
			    	$("#nav-tab-2").addClass("active in");
			    	$("#tab3_li").removeClass("active");
			    	$("#tab2_li").addClass("active");
			    	$("#tab3_li").hide();
				}else if(order.service.enter==1){//套餐入口
					$("#offer_a").hide();
					$("#phoneNumber_a").show();
					$("#nav-tab-3").removeClass("active in");
			    	$("#nav-tab-1").addClass("active in");
			    	$("#tab3_li").removeClass("active");
			    	$("#tab1_li").addClass("active");
			    	var boProdAns = OrderInfo.boProdAns;
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
								"done" : function(){
								}
							});
						}
					}
					order.phoneNumber.boProdAn={};//清空号码缓存
					 order.phoneNumber.btnQueryPhoneNumber(1,undefined,"true");
				}
				 //移除已选副卡节点
				 $("#secondaryPhoneNumUl").children("li:gt(0)").remove();
				 order.phoneNumber.secondaryCarNum=0;
				OrderInfo.order.step=2;
				return;
			}else if(OrderInfo.order.step==4){//促销页
				if(order.service.showTab3){//存在副卡页
					$("#nav-tab-4").removeClass("active in");
			    	$("#nav-tab-3").addClass("active in");
			    	$("#tab4_li").removeClass("active");
			    	$("#tab3_li").addClass("active");
					OrderInfo.order.step=3;
					//order.service.showTab3=false;
				}else{
					if(order.service.enter==3){//选号入口
						$("#offer_a").show();
						$("#phoneNumber_a").hide();
						$("#nav-tab-4").removeClass("active in");
				    	$("#nav-tab-2").addClass("active in");
				    	$("#tab4_li").removeClass("active");
				    	$("#tab2_li").addClass("active");
					}else if(order.service.enter==1){//选套餐
						$("#offer_a").hide();
						$("#phoneNumber_a").show();
						$("#nav-tab-4").removeClass("active in");
				    	$("#nav-tab-1").addClass("active in");
				    	$("#tab4_li").removeClass("active");
				    	$("#tab1_li").addClass("active");
				    	var boProdAns = OrderInfo.boProdAns;
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
									"done" : function(){
									}
								});
							}
						}
						order.phoneNumber.boProdAn={};//清空号码缓存
						 order.phoneNumber.initPhonenumber();
					}
					OrderInfo.order.step=2;
				}				
				return;
			}else if(OrderInfo.order.step==5){//其他页
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
				$("#nav-tab-6").removeClass("active in");
		    	$("#nav-tab-4").addClass("active in");
		    	$("#tab6_li").removeClass("active");
		    	$("#tab4_li").addClass("active");
				OrderInfo.order.step=4;
				return;
			}else if(OrderInfo.order.step==6){//订单确认页
				
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
				SoOrder.orderBack();
				SoOrder.getToken();
				OrderInfo.order.step=5;
				return;
			}else if(OrderInfo.order.step==7){//收银台
				$("#nav-tab-8").removeClass("active in");
		    	$("#nav-tab-7").addClass("active in");
		    	$("#tab8_li").removeClass("active");
		    	$("#tab7_li").addClass("active");
				OrderInfo.order.step=6;
				return;
			}
			else if(OrderInfo.order.step==8){//回执
				$("#order-print").hide();
				$("#orderConfirmDiv").show();
				$("#headTabDiv2").show();
		    	$("#nav-tab-8").addClass("active in");
		    	$("#tab8_li").addClass("active");
				OrderInfo.order.step=7;
				return;
			}
		}
		if(OrderInfo.actionFlag==3){//可选包变更
			if(OrderInfo.order.step==1){//选择套餐
				_callCloseWebview();
				return;
			} else if(OrderInfo.order.step==3){//订单提交
				$("#nav-tab-4").removeClass("active in");
				$("#nav-tab-3").addClass("active in");
				$("#tab3_li").removeClass("active");
				$("#tab2_li").addClass("active");
				OrderInfo.order.step=1;
				return;
			} else if(OrderInfo.order.step==6){//订单确认
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
				SoOrder.orderBack();
				SoOrder.getToken();
				OrderInfo.order.step=3;
				return;
			} else if(OrderInfo.order.step==7){//收银台
				$("#nav-tab-8").removeClass("active in");
		    	$("#nav-tab-7").addClass("active in");
		    	$("#tab8_li").removeClass("active");
		    	$("#tab7_li").addClass("active");
				OrderInfo.order.step=6;
				return;
			} else if(OrderInfo.order.step==8){//回执
				$("#order-print").hide();
				$("#orderConfirmDiv").show();
				$("#headTabDiv2").show();
		    	$("#nav-tab-8").addClass("active in");
		    	$("#tab8_li").addClass("active");
				OrderInfo.order.step=7;
				return;
			}
		}
		
		if(OrderInfo.actionFlag==2){//套餐变更
			if(OrderInfo.order.step==1){//选择套餐
				_callCloseWebview();
				return;
			} else if(OrderInfo.order.step==2){//选择可选包
				$("#nav-tab-3").removeClass("active in");
				$("#nav-tab-2").addClass("active in");
				$("#tab2_li").removeClass("active");
				$("#tab1_li").addClass("active");
				$("#offer_a").show();
				OrderInfo.order.step=1;
				return;
			} else if(OrderInfo.order.step==3){//订单提交
				$("#nav-tab-4").removeClass("active in");
				$("#nav-tab-3").addClass("active in");
				$("#tab3_li").removeClass("active");
				$("#tab2_li").addClass("active");
				OrderInfo.order.step=2;
				return;
			} else if(OrderInfo.order.step==6){//订单确认
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
				SoOrder.orderBack();
				SoOrder.getToken();
				OrderInfo.order.step=3;
				return;
			} else if(OrderInfo.order.step==7){//收银台
				$("#nav-tab-8").removeClass("active in");
		    	$("#nav-tab-7").addClass("active in");
		    	$("#tab8_li").removeClass("active");
		    	$("#tab7_li").addClass("active");
				OrderInfo.order.step=6;
				return;
			} else if(OrderInfo.order.step==8){//回执
				$("#order-print").hide();
				$("#orderConfirmDiv").show();
				$("#headTabDiv2").show();
		    	$("#nav-tab-8").addClass("active in");
		    	$("#tab8_li").addClass("active");
				OrderInfo.order.step=7;
				return;
			}
		}
		
		
		
		if(OrderInfo.actionFlag==13){//购裸机
			if(OrderInfo.order.step==1){
				_callCloseWebview();
				return;
			}else if(OrderInfo.order.step==2){//订单确认
				SoOrder.orderBack();
				SoOrder.getToken();
				OrderInfo.order.step=1;
				return;
			}else if(OrderInfo.order.step==3){//支付
				$("#nav-tab-8").removeClass("active in");
		    	$("#nav-tab-7").addClass("active in");
		    	$("#tab8_li").removeClass("active");
		    	$("#tab7_li").addClass("active");
				OrderInfo.order.step=2;
				return;
			}else if(OrderInfo.order.step==4){//回执
				$("#order-print").hide();
				$("#orderConfirmDiv").show();
				$("#headTabDiv2").show();
		    	$("#nav-tab-8").addClass("active in");
		    	$("#tab8_li").addClass("active");
				OrderInfo.order.step=3;
				return;
			}
		}
		if(OrderInfo.actionFlag==14){//合约新装
			if(OrderInfo.order.step==1){
				_callCloseWebview();
				return;
			}else if(OrderInfo.order.step==2){//选号码
				$("#nav-tab-2").removeClass("active in");
		    	$("#nav-tab-1").addClass("active in");
		    	$("#tab2_li").removeClass("active");
		    	$("#tab1_li").addClass("active");
		    	$("#phoneNumber_a").hide();
		    	$("#phone_a").show();
				OrderInfo.order.step=1;
				//默认购裸机，合约相关tab页隐藏
				$("#tab2_li").hide();
				$("#tab3_li").hide();
				$("#tab4_li").hide();
				$("#tab5_li").hide();
				$("#tab6_li").hide();
				return;
			}else if(OrderInfo.order.step==3){//选合约
				var boProdAns = OrderInfo.boProdAns;
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
							"done" : function(){
							}
						});
					}
				}
				order.phoneNumber.boProdAn={};//清空号码缓存
				 order.phoneNumber.btnQueryPhoneNumber(1,undefined,"true");
				$("#phoneNumber_a").show();
				$("#nav-tab-3").removeClass("active in");
		    	$("#nav-tab-2").addClass("active in");
		    	$("#tab3_li").removeClass("active");
		    	$("#tab2_li").addClass("active");
				OrderInfo.order.step=2;
				return;
			}else if(OrderInfo.order.step==4){//副卡
				//如果副卡页面未关闭  则关闭副卡页面
				if($("#phonenumber-list2").length>0 && $("#phonenumber-list2").css("display")!="none"){
					$("#phonenumber-list2").hide();
					$("#phoneNumber_a").hide();
					$("#secondaryPhoneNumUl").show();
					$("#fk_phonenumber_next").show();
					return;
				}
				$("#nav-tab-4").removeClass("active in");
		    	$("#nav-tab-3").addClass("active in");
		    	$("#tab4_li").removeClass("active");
		    	$("#tab3_li").addClass("active");
				OrderInfo.order.step=3;
				return;
			}else if(OrderInfo.order.step==5){//促销
				if (order.service.showTab3) {// 存在副卡页
					$("#nav-tab-5").removeClass("active in");
					$("#nav-tab-4").addClass("active in");
					$("#tab5_li").removeClass("active");
					$("#tab4_li").addClass("active");
					OrderInfo.order.step = 4;
					return;
					// order.service.showTab3=false;
				} else {
					$("#nav-tab-5").removeClass("active in");
					$("#nav-tab-3").addClass("active in");
					$("#tab5_li").removeClass("active");
					$("#tab3_li").addClass("active");
					OrderInfo.order.step = 3;
					return;
				}
			}else if(OrderInfo.order.step==6){//其他
				$("#nav-tab-6").removeClass("active in");
		    	$("#nav-tab-5").addClass("active in");
		    	$("#tab6_li").removeClass("active");
		    	$("#tab5_li").addClass("active");
				OrderInfo.order.step=5;
				return;
			}else if(OrderInfo.order.step==7){//订单确认
				SoOrder.orderBack();
				SoOrder.getToken();
				OrderInfo.order.step=6;
				return;
			}else if(OrderInfo.order.step==8){//支付
				$("#nav-tab-8").removeClass("active in");
		    	$("#nav-tab-7").addClass("active in");
		    	$("#tab8_li").removeClass("active");
		    	$("#tab7_li").addClass("active");
				OrderInfo.order.step=7;
				return;
			}else if(OrderInfo.order.step==9){//回执
				$("#order-print").hide();
				$("#orderConfirmDiv").show();
				$("#headTabDiv2").show();
		    	$("#nav-tab-8").addClass("active in");
		    	$("#tab8_li").addClass("active");
				OrderInfo.order.step=8;
				return;
			}
		}
		if(OrderInfo.actionFlag==201){//橙分期
			if(OrderInfo.order.step==1){
				_callCloseWebview();
				return;
			}else if(OrderInfo.order.step==2){//其他
				$("#nav-tab-2").removeClass("active in");
		    	$("#nav-tab-1").addClass("active in");
		    	$("#tab2_li").removeClass("active");
		    	$("#tab1_li").addClass("active");
				OrderInfo.order.step=1;
				return;
			}else if(OrderInfo.order.step==3){//订单确认
				SoOrder.orderBack();
				SoOrder.getToken();
				OrderInfo.order.step=2;
				return;
			}else if(OrderInfo.order.step==4){//支付
				$("#nav-tab-8").removeClass("active in");
		    	$("#nav-tab-7").addClass("active in");
		    	$("#tab8_li").removeClass("active");
		    	$("#tab7_li").addClass("active");
				OrderInfo.order.step=3;
				return;
			}else if(OrderInfo.order.step==5){//回执
				$("#order-print").hide();
				$("#orderConfirmDiv").show();
				$("#headTabDiv2").show();
		    	$("#nav-tab-8").addClass("active in");
		    	$("#tab8_li").addClass("active");
				OrderInfo.order.step=4;
				return;
			}
		}
		if(OrderInfo.actionFlag==111){//宽带甩单返回处理
			if(OrderInfo.order.step==1){
				if(OrderInfo.returnFlag=="add"){
					$("#searchADD").hide();
					$("#orderContent").show();
					OrderInfo.returnFlag="";
					return;
				}else if(OrderInfo.returnFlag=="tc"){
					$("#searchProd").hide();
					$("#orderContent").show();
					OrderInfo.returnFlag="";
					return;
				}
				_callCloseWebview();
				return;
			}else if(OrderInfo.order.step==2){
				$("#orderContent").show();
				$("#cust").hide();
				OrderInfo.order.step = 1;
				$("#kh").removeClass("active");
				$("#kh_1").addClass("dis-none");
				$("#zy").addClass("active");
				$("#zy_1").removeClass("dis-none");
				return;
			}else if(OrderInfo.order.step==3){
				if(OrderInfo.returnFlag=="yyt"){
					$("#selectYYT").hide();
					$("#confirm").show();
					OrderInfo.returnFlag="";
					return;
				}
				if(OrderInfo.returnFlag=="xgfy"){
					$("#calEdit").hide();
					$("#confirm").show();
					OrderInfo.returnFlag="";
					return;
				}
				if(OrderInfo.returnFlag=="jbr"){
					$("#jbr").hide();
					$("#confirm").show();
					OrderInfo.returnFlag="";
					return;
				}
				$("#cust").show();
				$("#confirm").hide();
				OrderInfo.order.step = 2;
				$("#jd").removeClass("active");
				$("#jd_1").addClass("dis-none");
				$("#kh").addClass("active");
				$("#kh_1").removeClass("dis-none");
				return;
			}else if(OrderInfo.order.step==4){
				if(OrderInfo.returnFlag=="map"){
					$("#map").hide();
					$("#confirm").show();
					return;
				}
				$("#confirm").show();
				$("#print").hide();
				OrderInfo.order.step = 3;
				return;
			}
		}
		if(OrderInfo.actionFlag==110){//双屏互动
			$("#disConnect").click();
			_callCloseWebview();
			return;
		}
		if(OrderInfo.actionFlag==112){//融合新装
			if(OrderInfo.order.step==1){
				_callCloseWebview();
				return;
			}else if(OrderInfo.order.step==2){
				if(OrderInfo.returnFlag=="add"){
					$("#all_prod").show();
					$("#page_kd").hide();
					$("#page_gh").hide();
					$("#page_gc").hide();
					OrderInfo.returnFlag="";
					return;
				}else if(OrderInfo.returnFlag=="kd" || OrderInfo.returnFlag=="gh" || OrderInfo.returnFlag=="gc"){
					$("#page-add_"+OrderInfo.returnFlag).show();
					$("#searchProd"+"_"+OrderInfo.returnFlag).hide();
					OrderInfo.returnFlag="add";
					return;
				}else if(OrderInfo.returnFlag=="_kd" || OrderInfo.returnFlag=="_gh" || OrderInfo.returnFlag=="_gc"){
					$("#page-add"+OrderInfo.returnFlag).show();
					$("#searchADD"+OrderInfo.returnFlag).hide();
					OrderInfo.returnFlag="add";
					return;
				}
				var boProdAns = OrderInfo.boProdAns;
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
							"done" : function(){
							}
						});
					}
				}
				$("#addSecondaryCard").removeClass("font-secondary").addClass("font-default");
				$("#addSecondaryCard").attr("onclick","order.phoneNumber.showSecondaryCardModalData()");
				$(".PhoneNumLi").remove();
				$("#page_kd").empty();
				$("#page_gh").empty();
				$("#page_gc").empty();
				$("#nav-tab-2").removeClass("active in");
		    	$("#nav-tab-1").addClass("active in");
		    	$("#tab2_li").removeClass("active");
		    	$("#tab1_li").addClass("active");
		    	$("#fk").removeClass("active");
				$("#tc").addClass("active");
				OrderInfo.order.step=1;
				$("#phonenumber").hide();
				$("#phonenumber-list").empty();
				$("#offer_a").show();
				$("#phoneNumber_a").hide();
				$("#offer").show();
				order.amalgamation.searchPack("all","","");
				return;
			}else if(OrderInfo.order.step==3){
				$("#nav-tab-3").removeClass("active in");
		    	$("#nav-tab-2").addClass("active in");
		    	$("#tab3_li").removeClass("active");
		    	$("#tab2_li").addClass("active");
		    	$("#cx").removeClass("active");
				$("#fk").addClass("active");
				OrderInfo.order.step=2;
				return;
			}else if(OrderInfo.order.step==4){
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
				$("#nav-tab-4").removeClass("active in");
		    	$("#nav-tab-3").addClass("active in");
		    	$("#tab4_li").removeClass("active");
		    	$("#tab3_li").addClass("active");
		    	$("#qt").removeClass("active");
				$("#cx").addClass("active");
				OrderInfo.order.step=3;
				return;
			}else if(OrderInfo.order.step==5 || OrderInfo.order.step==6){
				if(OrderInfo.returnFlag=="hz"){
					$("#order-print").hide();
					$("#nav-tab-6").addClass("active in");
					OrderInfo.returnFlag="";
					return;
				}
				$("#nav-tab-6").removeClass("active in");
				$("#nav-tab-5").removeClass("active in");
		    	$("#nav-tab-4").addClass("active in");
		    	$("#tab5_li").removeClass("active");
		    	$("#tab4_li").addClass("active");
		    	$("#jd").removeClass("active");
				$("#qt").addClass("active");
				OrderInfo.order.step=4;
				$("#orderContentDiv").show();
				$("#orderConfirmDiv").hide();
				OrderInfo.orderData.orderList.custOrderList[0].busiOrder = [];
				OrderInfo.resetSeq(); //重置序列
				SoOrder.delOrder();
				return;
			}
		}
		if(OrderInfo.actionFlag==301){//补收费
			if(OrderInfo.order.step==1){
				_callCloseWebview();
				return;
			}else if(OrderInfo.order.step==2){
				 $("#nav-tab-1").addClass("active in");
				 $("#tab1_li").addClass("active");
				 $("#nav-tab-2").removeClass("active in");
			 	 $("#tab2_li").removeClass("active");
				OrderInfo.order.step=1;
				return;
			}
		}
		if(OrderInfo.actionFlag==4||OrderInfo.actionFlag==8){//客户新增和修改
			_callCloseWebview();
			return;
		}
		if(OrderInfo.actionFlag==40){
			cart.main.cartBack();
			return;
		}
		if(OrderInfo.actionFlag==140){
			order.calcharge.back();
			return;
		}
		if(OrderInfo.actionFlag==150){
			mktRes.terminal.back();
			return;
		}
		if(OrderInfo.returnFlag==2){
			order.phoneNumber.back(); 
			return;
		}
		if(OrderInfo.actionFlag==-999){//处理预受理查询 返回
			if(OrderInfo.order.step==2){
				OrderInfo.order.step = 1;
				$("#ysl_search").show();
				$("#ysl_list").hide();
			}
			if(OrderInfo.order.step==1){
				_callCloseWebview();
			}
			return;
		}

		if(OrderInfo.order.step==1){
			//补换卡返回释放uim卡
			if(OrderInfo.actionFlag==22){
				$.confirm("确认","确定要取消该订单吗？",{
					yes:function(){
						var boProd2Tds = OrderInfo.boProd2Tds;
						//取消订单时，释放被预占的UIM卡
						if(boProd2Tds.length>0){
							for(var n=0;n<boProd2Tds.length;n++){
								var param = {
										numType : 2,
										numValue : boProd2Tds[n].terminalCode
								};
								$.callServiceAsJson(contextPath+"/app/mktRes/phonenumber/releaseErrorNum", param, {
									"before":function(){
										$.ecOverlay("<strong>正在释放UIM卡,请稍等会儿....</strong>");
									},
									"always":function(){
										$.unecOverlay();
									},
									fail:function(response){
										$.unecOverlay();
										$.alert("提示","请求可能发生异常，请稍后再试！");
									},
									"done" : function(){
										//_callCloseWebview();
									}
								});
							}
						}
						_callCloseWebview();
						return;
					},no:function(){
					return;
				}},"question");
			}else{
			_callCloseWebview();
			}
		}else if(OrderInfo.order.step==2){
			if(OrderInfo.actionFlag==3||OrderInfo.actionFlag==9){
				_callCloseWebview();
				return;
			}
			order.main.lastStep(function(){
				$("#order_prepare").show();
				if(OrderInfo.actionFlag != 13 || OrderInfo.actionFlag != 14){
					if(OrderInfo.actionFlag == 1 && "1"==$("#enter").val()){
						order.service.searchPack(1);
						$("#pakeage").show();
						$("#pakeage").attr("class","tab-pane fade in active");
						$("#phone").attr("class","tab-pane fade medialist");
						$("#number").attr("class","tab-pane fade");
					}
					if(OrderInfo.actionFlag == 1 && "3"==$("#enter").val()){
						order.phoneNumber.initPhonenumber('number');
						$("#pakeage").attr("class","tab-pane fade");
						$("#phone").attr("class","tab-pane fade medialist");
						$("#number").attr("class","tab-pane fade in active");
					}
				}
				if(OrderInfo.actionFlag == 13 || OrderInfo.actionFlag == 14){
					mktRes.terminal.btnQueryTerminal(1);
					$("#phone").show();
					$("#pakeage").hide();
					$("#number").hide();
					$("#pakeage").attr("class","tab-pane fade");
					$("#phone").attr("class","tab-pane fade medialist in active");
					$("#number").attr("class","tab-pane fade");
				}
				$("#order").hide();	
				if(OrderInfo.actionFlag==1){//新装的头部 要发生变化
						_callTitle(2);//2 头部为已定位客户
					}
				if(OrderInfo.actionFlag == 13 || OrderInfo.actionFlag == 14){
					_callTitle(2);//2 头部为已定位客户
				}
					OrderInfo.order.step=1;
			});
		}else if(OrderInfo.order.step==3){
			//补换卡
			if(OrderInfo.actionFlag == 22){
				$.confirm("确认","确定要取消该订单吗？",{
					yes:function(){
						var boProd2Tds = OrderInfo.boProd2Tds;
						//取消订单时，释放被预占的UIM卡
						if(boProd2Tds.length>0){
							for(var n=0;n<boProd2Tds.length;n++){
								var param = {
										numType : 2,
										numValue : boProd2Tds[n].terminalCode
								};
								$.callServiceAsJson(contextPath+"/app/mktRes/phonenumber/releaseErrorNum", param, {
									"before":function(){
										$.ecOverlay("<strong>正在释放UIM卡,请稍等会儿....</strong>");
									},
									"always":function(){
										$.unecOverlay();
										
									},
									fail:function(response){
										$.unecOverlay();
										$.alert("提示","请求可能发生异常，请稍后再试！");
									},
									"done" : function(){
										SoOrder.orderBack();
									}
								});
							}
						}
						$("#orderContentDiv").show();
						$("#orderConfirmDiv").hide;
						$("#isCheck_Card").css("display","none");
						$("#btn_next_checkUim").show();
						OrderInfo.order.step = 1;
						_callCloseWebview();
					},no:function(){
					return;
				}},"question");
				//_callCloseWebview();
				//return;
			} else {
				// 可选包变更订单页面返回 释放UIM卡
				if (OrderInfo.actionFlag == 3) {
					var boProd2Tds = OrderInfo.boProd2Tds;
					// 取消订单时，释放被预占的UIM卡
					if (boProd2Tds.length > 0) {
						for (var n = 0; n < boProd2Tds.length; n++) {
							var param = {
								numType : 2,
								numValue : boProd2Tds[n].terminalCode
							};
							$
									.callServiceAsJson(
											contextPath
													+ "/app/mktRes/phonenumber/releaseErrorNum",
											param, {
												"done" : function() {
												}
											});
						}
					}
//					_callCloseWebview();   2016年8月12日熊公正提出可选包订单确认返回同新装一样，退回 上一步
//					return;
				}
				SoOrder.orderBack();
				$("#order-content").show();
				$("#order-confirm").hide();
				$("#order-dealer").hide();
				if (OrderInfo.actionFlag == 13) {
					$("#terminalMain").show();
				}
				if(OrderInfo.actionFlag == 9 || OrderInfo.actionFlag == 22){
					$("#orderContentDiv").show();
					$("#orderConfirmDiv").hide;
				}
				OrderInfo.order.step = 2;
			}
		}else if(OrderInfo.order.step==4){
			$("#order-confirm").show();
			$("#order-print").hide();
			
			if(OrderInfo.actionFlag == 9 || OrderInfo.actionFlag == 22){
				$("#nav-tab-7").addClass("active in");
				$("#nav-tab-8").removeClass("active in");
			}
			OrderInfo.order.step=3;
		}else {
			_callCloseWebview();
		}
	};
	//调用客户端 改变头部的状态
	var _callTitle=function(str){

		var arr=new Array(1);
		arr[0]=str;
		MyPlugin.changeTitle(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	//调用客户端 通知会话已经失效了
	var _callSessionNotViald=function(olId){
		var arr=new Array(1);
		MyPlugin.sessionValid(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	var _callAgreePhoto=function(olId){
		var arr=new Array(1);
		arr[0]=olId;
		MyPlugin.protocolPhone(arr,
            function(result) {
            },
            function(error) {
            }
		);	
	};
	
	//调用客户端打开支付页面
	var _callOpenPay=function(payUrl){
		var arr=new Array(1);
		arr[0]=payUrl;
		MyPlugin.openPayWeb(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	
	//调用客户定位页面
	var _callCustLocation=function(method){
//		if(OrderInfo.actionFlag==111){
			//已完成客户定位
//			if(OrderInfo.cust.custId != undefined && OrderInfo.cust.custId != ""){
//				order.broadband.confirm();
//				return;
//			}
//		}
		var arr=new Array(1);
		arr[0]=method;
		MyPlugin.custLocation(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	
	var _getMobileIp=function(method){
		var arr=new Array(1);
		arr[0]=method;
		MyPlugin.getMobileIp(arr,
            function(result) {
            },
            function(error) {
            }
		);
	}
	//宽带甩单经办调用摄像头拍照
	var _callPhotos2=function(method){
		var custIdentidiesTypeCd=OrderInfo.cust.identityCd;//客户证件类型
		var custNumber=OrderInfo.cust.idCardNumber;//客户证件号码
		var partyName = $('#orderAttrName').val().trim();//经办人名称
		var areaId = OrderInfo.staff.areaId;//经办人地区
		var telNumber = $('#orderAttrPhoneNbr').val();//联系电话
		var addressStr = $('#orderAttrAddr').val().trim();//经办人地址
		var identityCd = $('#orderIdentidiesTypeCd').val();//证件类型
		if(identityCd==1){
			var identityNum = $('#sfzorderAttrIdCard').val();//证件号码
		}else{
			var identityNum = $('#orderAttrIdCard').val();//证件号码
		}
		if(custIdentidiesTypeCd==identityCd && custNumber==identityNum){
			order.broadband.isSameOne=true;
		}
		if(order.broadband.isSameOne){//经办人为本人,无需查询
			order.broadband.canCallPhote=true;
		}
		if(!order.broadband.canCallPhote){
			$.alert("提示","请先进行经办人查询！");
			return;
		}
		
		var arr=new Array(1);
		var custIdentityPic = OrderInfo.cust.identityPic;
		var userIdentityPic = OrderInfo.user.identityPic;
		var jbrIdentityPic = OrderInfo.jbr.identityPic;
		if(OrderInfo.cust.telNumber == undefined){
			OrderInfo.cust.telNumber = "";
		}
//		var str = "{\"picturesInfo\":[{\"orderInfo\":\"XXXXXXXXX\",\"picFlag\":\"A\",\"custName\":\"hiuu\",\"certType\":\"身份证\",\"certNumber\":\"902222222\",\"accNbr\":\"123456666\"},{\"orderInfo\":\"XXXXXXXXX\",\"picFlag\":\"B\",\"custName\":\"hiuu\",\"certType\":\"身份证\",\"certNumber\":\"902222222\",\"accNbr\":\"123456666\"},{\"orderInfo\":\"XXXXXXXXX\",\"picFlag\":\"C\",\"custName\":\"hiuu\",\"certType\":\"身份证\",\"certNumber\":\"902222222\",\"accNbr\":\"123456666\"},{\"orderInfo\":\"\",\"picFlag\":\"D\",\"custName\":\"hiuu\",\"certType\":\"身份证\",\"certNumber\":\"902222222\",\"accNbr\":\"123456666\"}]}";
		var json = "{\"picturesInfo\":[";
		if(custIdentityPic != undefined){
			json = json + "{\"orderInfo\":\"" + OrderInfo.cust.identityPic + "\",\"picFlag\":\"A\",\"custName\":\"" + OrderInfo.cust.partyName + "\",\"certType\":\"" + OrderInfo.cust.identityCd + "\",\"certNumber\":\"" + OrderInfo.cust.identityNum + "\",\"accNbr\":\"" + OrderInfo.cust.telNumber +"\"},";
		}
		if(userIdentityPic != undefined){
			json = json + "{\"orderInfo\":\"" + OrderInfo.user.identityPic + "\",\"picFlag\":\"B\",\"custName\":\"" + OrderInfo.user.partyName + "\",\"certType\":\"" + OrderInfo.user.identityCd + "\",\"certNumber\":\"" + OrderInfo.user.identityNum + "\",\"accNbr\":\"" + OrderInfo.user.telNumber +"\"},";
		}
		if(jbrIdentityPic != undefined){
			json = json + "{\"orderInfo\":\"" + OrderInfo.jbr.identityPic + "\",\"picFlag\":\"C\",\"custName\":\"" + partyName + "\",\"certType\":\"" + identityCd + "\",\"certNumber\":\"" + identityNum + "\",\"accNbr\":\"" + telNumber +"\"},";
		}
		json = json + "{\"orderInfo\":\"\",\"picFlag\":\"D\",\"custName\":\"" + partyName + "\",\"certType\":\"" + identityCd + "\",\"certNumber\":\"" + identityNum + "\",\"accNbr\":\"" + telNumber +"\"}";
		json = json+"]}";
		arr[0]=method;
		arr[1]=json;
		var olId=$("#TransactionID").val();
		if(olId!=undefined && olId!=""){//宽带甩单经办人拍照
			arr[2]=olId;
		}		
		MyPlugin.photoProcess(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	
	/**  
	 * 点击按钮后多长时间内按钮不可点   
	 * @param btn
	   时间 以毫秒为单位   
	 * 通过class统一控制  
	 */  
	var _setBtnTimer = function(btn) {  
		$(btn).attr("disabled","disabled");  
	   window.setTimeout(function(){$(btn).removeAttr("disabled")}, 2000);
	};
	return {
		relocationCust		:	_relocationCust,
		setCalendar			:	_setCalendar,
		callcalendar		:	_callcalendar,
		callCloseWebview	:	_callCloseWebview,
		callCustInfo		:	_callCustInfo,
		callDatasign		:	_callDatasign,
		callGenerationRec	:	_callGenerationRec,
		getGenerationInfos	:	_getGenerationInfos,
		callIDCardRec		:	_callIDCardRec,
		callOrderServer		:	_callOrderServer,
		callPhotos			:	_callPhotos,
		callReturnBack		: 	_callReturnBack,
		callScanning		:	_callScanning,
		scaningCallBack		:	_scaningCallBack,
		callSessionNotViald	:	_callSessionNotViald,
		callTitle			:	_callTitle,
		saveCust			:	_saveCust,
		callAgreePhoto      :   _callAgreePhoto,
		callOpenPay         :   _callOpenPay,
		callCustLocation	:	_callCustLocation,
		getMobileIp			: 	_getMobileIp,
		callPhotos2         :   _callPhotos2,
		setBtnTimer         :   _setBtnTimer
	};
})(jQuery);



