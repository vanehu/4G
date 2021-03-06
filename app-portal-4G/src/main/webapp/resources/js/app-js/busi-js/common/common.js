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
//		if(method == "/app/order/broadband/prepare"){
//			method = "/app/cust/query";
//		}
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
		if(!OrderInfo.jbr.custId) {
			OrderInfo.virOlId = "";
			$.alert("提示","请先进行经办人信息查询！");
			return;
		}
		
		if(ec.util.isObj(identityNum) && identityNum != OrderInfo.jbr.identityNum){
			
			OrderInfo.virOlId = "";
			$.alert("提示","经办人信息更改，请先进行经办人信息查询！");
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
	var _callGenerationRec=function(method,type,isKhjq){
		if(isKhjq!=undefined && isKhjq == "1"){
			cust.isKhjq = "1";
		}else{
			cust.isKhjq = "";
		}
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
		if(OrderInfo.actionFlag == 111){
			$("#queryCust").hide();
			order.broadband.showCust();
			$("#sd_tab-box").show();
			$("#cust").show();
			_callCustInfo(OrderInfo.cust);
			return;
		}
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
//		alert("OrderInfo.actionFlag="+OrderInfo.actionFlag+"---OrderInfo.order.step="+OrderInfo.order.step+"---OrderInfo.returnFlag="+OrderInfo.returnFlag);
		if($(".modal-backdrop").length>0 && $("#overlay-modal").length>0){
			$.unecOverlay();//网络出现故障或手机出现故障时按返回关闭“加载中”提示框
		}
		if($("#order-error").is(":visible")){//错误页面不允许返回
			return;
		}
		if($(".modal-dialog").is(":visible")){//有弹出层不允许返回
			return;
		}
		if($("#verifyPrepare").length>0 && $("#verifyPrepare").css("display")=="block"){//有弹出层不允许返回
			$("#prodofferPrepare").show();
			$("#verifyPrepare").hide();
			return;
		}
		//如果收费成功  安卓手机返回按钮不可返回
		if($("#toCharge").length>0){
			if(OrderInfo.order.step==4 && OrderInfo.actionFlag==111){
				$("#confirm").show();
				$("#print").hide();
				OrderInfo.order.step = 3;
				return;
			}
//			if("disabled"==$("#toCharge").attr("disabled")){
//				return;
//			}
		}
		if(OrderInfo.jbrPageFlag == "Y"){
			OrderInfo.jbrPageFlag = "N";
			$("#order-content").show();
			$("#terminalMain").show();
			$("#jbr").hide();
			return;
		}
		if(OrderInfo.actionFlag==1){
			if(OrderInfo.order.step==3){
				if(OrderInfo.returnFlag=="xgfy"){
					order.calcharge.close();
					OrderInfo.returnFlag="";
					return;
				}
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
				$("#sd_tab-box").show();
				$("#orderContent").show();
				$("#cust").hide();
				$("#queryCust").hide();
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
		if(OrderInfo.returnFlag=="tc"){ // 套餐 
			if(OrderInfo.actionFlag==14 && OrderInfo.order.step<3){
				$("#order-memeber").hide();
				$("#phonenumberContent").hide();
				$("#div_offer").hide();
				$("#offer-prepare").hide();
				$("#order").show();
				$("#order-content").show();
//				$("#terminalMain").show();
				OrderInfo.returnFlag="";
				return;
			}
			if(OrderInfo.actionFlag==1){
				$("#order-memeber").hide();
				$("#phonenumberContent").hide();
				$("#offer-prepare").hide();
				$("#order").show();
				$("#order-content").show();
				OrderInfo.returnFlag="";
				return;
			}
		}
		
		if(OrderInfo.returnFlag=="hm"){//号码
			if(OrderInfo.actionFlag==14 && OrderInfo.order.step<3){
				$("#order-memeber").hide();
				$("#phonenumberContent").hide();
				$("#offer-prepare").hide();
				$("#order").show();
				$("#order-content").show();
//				$("#terminalMain").show();
				OrderInfo.returnFlag="";
				return;
			}
			if(OrderInfo.actionFlag==1){
				$("#order-memeber").hide();
				$("#phonenumberContent").hide();
				$("#offer-prepare").hide();
				$("#order").show();
				$("#order-content").show();
				OrderInfo.returnFlag="";
				return;
			}
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
						$("#order-confirm").hide();
						$("#order_fill_content").show();
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
				OrderInfo.order.step = 2;
			}
		}else if(OrderInfo.order.step==4){
			$("#order-confirm").show();
			$("#order-print").hide();
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
		if(OrderInfo.jbr.identityPic == undefined || OrderInfo.jbr.identityPic.length<50){
			$.alert("提示","请先读取经办人身份证信息。");
			return;
		}
		var params = {};
		if(order.broadband.haveCallPhote && order.broadband.resetId == false){
			var url=contextPath+"/app/order/getTransactionID";
			$.callServiceAsJson(url, params, {
				"before":function(){
//					$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
				},
				"done" : function(response){
					$.unecOverlay();
					if (response.code == 0) {
						$("#TransactionID").val(response.data);
						order.broadband.resetId = true;
						common.callPhotos2('cust.getPicture2');
					}else{
//						$.unecOverlay();
//						$.alert("提示","查询失败，请稍后再试！");
					}
				},fail:function(response){
//					$.unecOverlay();
//					$.alert("提示","查询失败，请稍后再试！");
				}
			});
		}else{
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
			}else{
	//			var telR = /^1[34578]\d{9}$/;
	//			if (!telR.test(telNumber)) {
	//	            $.alert("提示", "请输入有效的手机号！");
	//	            return;
	//	        }
			}
			if(!order.broadband.canCallPhote){
				order.broadband.queryJbr();
				return;
			}
			
			var arr=new Array(1);
			var custIdentityPic = OrderInfo.cust.identityPic;
			var userIdentityPic = OrderInfo.user.identityPic;
			var jbrIdentityPic = OrderInfo.jbr.identityPic;
			if(order.broadband.isSameOne){//本人且客户有照片，将客户照片给经办人
				if(custIdentityPic != undefined){
					jbrIdentityPic=custIdentityPic;
					OrderInfo.jbr.identityPic=custIdentityPic;
				}
				if(custIdentidiesTypeCd != undefined){
					identityCd=custIdentidiesTypeCd;
					OrderInfo.jbr.identityCd=custIdentityPic;
				}
				if(custNumber != undefined){
					identityNum=custNumber;
					OrderInfo.jbr.identityNum=custIdentityPic;
				}
				
			}
			if(OrderInfo.cust.telNumber == undefined){
				OrderInfo.cust.telNumber = "";
			}
			var json = "{\"picturesInfo\":[";
			var param = {};
			var picturesInfo = [];
			if(custIdentityPic != undefined && ec.util.isObj(custIdentityPic)){
				json = json + "{\"orderInfo\":\"" + OrderInfo.cust.identityPic + "\",\"picFlag\":\"A\",\"custName\":\"" + OrderInfo.cust.partyName + "\",\"certType\":\"" + OrderInfo.cust.identityCd + "\",\"certNumber\":\"" + OrderInfo.cust.identityNum + "\",\"accNbr\":\"" + OrderInfo.cust.telNumber +"\"},";
				var p = {
						"orderInfo":OrderInfo.cust.identityPic,
						"picFlag":"A",
						"custName":OrderInfo.cust.partyName,
						"certType":OrderInfo.cust.identityCd,
						"certNumber":OrderInfo.cust.identityNum,
						"accNbr":OrderInfo.cust.telNumber
					};
				picturesInfo.push(p);
			}
			if(userIdentityPic != undefined && ec.util.isObj(userIdentityPic)){
				json = json + "{\"orderInfo\":\"" + OrderInfo.user.identityPic + "\",\"picFlag\":\"B\",\"custName\":\"" + OrderInfo.user.partyName + "\",\"certType\":\"" + OrderInfo.user.identityCd + "\",\"certNumber\":\"" + OrderInfo.user.identityNum + "\",\"accNbr\":\"" + OrderInfo.user.telNumber +"\"},";
				var p = {
						"orderInfo":OrderInfo.user.identityPic,
						"picFlag":"B",
						"custName":OrderInfo.user.partyName,
						"certType":OrderInfo.user.identityCd,
						"certNumber":OrderInfo.user.identityNum,
						"accNbr":OrderInfo.user.telNumber
					};
				picturesInfo.push(p);
			}
			if(jbrIdentityPic != undefined && ec.util.isObj(jbrIdentityPic)){
				json = json + "{\"orderInfo\":\"" + OrderInfo.jbr.identityPic + "\",\"picFlag\":\"C\",\"custName\":\"" + partyName + "\",\"certType\":\"" + identityCd + "\",\"certNumber\":\"" + identityNum + "\",\"accNbr\":\"" + telNumber +"\"},";
				var p = {
						"orderInfo":OrderInfo.jbr.identityPic,
						"picFlag":"C",
						"custName":OrderInfo.jbr.partyName,
						"certType":OrderInfo.jbr.identityCd,
						"certNumber":OrderInfo.jbr.identityNum,
						"accNbr":OrderInfo.jbr.telNumber
					};
				picturesInfo.push(p);
			}
			json = json + "{\"orderInfo\":\"\",\"picFlag\":\"D\",\"custName\":\"" + partyName + "\",\"certType\":\"" + identityCd + "\",\"certNumber\":\"" + identityNum + "\",\"accNbr\":\"" + telNumber +"\"}";
			var p = {
					"orderInfo":"",
					"picFlag":"D",
					"custName":partyName,
					"certType":identityCd,
					"certNumber":identityNum,
					"accNbr":telNumber
				};
			picturesInfo.push(p);
			json = json+"]}";
			param.picturesInfo = picturesInfo;
			verify.upLoad_param = param;
			arr[0]=method;
			arr[1]=json;
			var olId=$("#TransactionID").val();
			if(olId!=undefined && olId!=""){//宽带甩单经办人拍照
				arr[2]=olId;
			}
			verify.openVerify("OFF");
//			MyPlugin.photoProcess(arr,
//	            function(result) {
//	            },
//	            function(error) {
//	            }
//			);
		}
		
	};
	
	/**  
	 * 点击按钮后多长时间内按钮不可点   
	 * @param btn
	   时间 以毫秒为单位   
	 * 通过class统一控制  
	 */  
	var _setBtnTimer = function(btn) {  
		$(btn).attr("disabled","disabled");  
		$(btn).css("pointer-events","none");  
	   window.setTimeout(function(){$(btn).removeAttr("disabled");$(btn).css("pointer-events","");}, 2000);
	};
	
	//通用，数字相乘方法，防止js进行浮点计算，出现多个小数点
	var _numMul=function(num1,num2){
	    var m=0,s1=num1.toString(),s2=num2.toString(); 
	    try{m+=s1.split(".")[1].length}catch(e){};
	    try{m+=s2.split(".")[1].length}catch(e){};
	    return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m);
	 }
	 
	//通用，数字相加方法，防止js进行浮点计算，出现多个小数点
	var _numAdd=function(num1,num2){
	       var r1,r2,m;
	       try{
	           r1 = num1.toString().split('.')[1].length;
	       }catch(e){
	           r1 = 0;
	       }
	       try{
	           r2=num2.toString().split(".")[1].length;
	       }catch(e){
	           r2=0;
	       }
	       m=Math.pow(10,Math.max(r1,r2));
	       // return (num1*m+num2*m)/m;
	       return Math.round(num1*m+num2*m)/m;
	    }
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
		setBtnTimer			:	_setBtnTimer,
		numMul              :   _numMul,
		numAdd              :   _numAdd
	};
})(jQuery);
