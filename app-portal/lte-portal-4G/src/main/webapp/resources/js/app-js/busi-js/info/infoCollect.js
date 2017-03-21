/**实名信息采集单新增
 * @author leilj
 */
CommonUtils.regNamespace("info", "collect");
info.collect = (function () {
	var _userNo = 0;//新增使用人编号
	var _userList = [];
	var _seq = 0;
	var _expDate;
	var _printParam;
	
    /**
     * 实名信息采集单初始化
     * @private
     */
    var _init = function () {
       OrderInfo.actionFlag = 19;
       $("#partyName").html(OrderInfo.cust.partyName);
       var $dateSel = $("#use_date");
       for(var i=0;i<15;i++){
    	   var date = change_date(i);
    	   if(i==7){
    		   $("#use_date").append('<option selected="selected" value="'+date+'">'+date+'</option>');
    	   } else{
    		   $("#use_date").append('<option value="'+date+'">'+date+'</option>');
    	   }
       }
      
       $("#custInfoCollectBtn").off('click').on("click",function(event){
    	   if(info.collect.userList.length == 0){
       			$.alert("提示","当前未采集使用人信息，无法提交！");
       			return;
       	   }
    	   var propertiesKey = "REAL_NAME_PHOTO_"+(OrderInfo.staff.soAreaId+"").substring(0,3);
   		   var isFlag = offerChange.queryPortalProperties(propertiesKey);
   		   OrderInfo.preBefore.idPicFlag = isFlag;
   		   if(OrderInfo.preBefore.idPicFlag == "ON" && !OrderInfo.virOlId){
				$.alert("提示","请前往经办人页面进行实名拍照！");
				return;
   		   }
   		   _seq = 0;
   		   var transactionId = $("#TransactionId").val();
   		   _expDate = ($("#use_date").val())+" 23:59:59";
   		   _collectionOrderList={
   				"collectionCustInfos":[],
   				"collectionOrderInfo":{
   					"channelId":OrderInfo.staff.channelId,
   					"staffId":OrderInfo.staff.staffId,
   					"areaId":OrderInfo.staff.areaId,
   					"sysFlag":"15",
   					"collectType":"1",
   					"expDate":_expDate,
   					"transactionId":$("#TransactionID").val()
   				}
   			};
   		   var _custInfo = {
   				"custName":OrderInfo.cust.partyName,
   				"certType":OrderInfo.cust.identityCd,
   				"certTypeName": "居民身份证",
   				"certNumber":OrderInfo.cust.idCardNumber,
   				"addressStr":OrderInfo.cust.addressStr,
   				"contactAddress":OrderInfo.cust.mailAddressStr,
   				"telNumber":OrderInfo.cust.accNbr,
   				"lanId":OrderInfo.cust.areaId,
   				"partyRoleCd":"0",
   				"partyTypeCd":"2",
   				"seq":_seq++,
   				"maxQuantity":0
   			};
   		   var _jbrInfo = {
   				"custName":OrderInfo.jbr.partyName,
   				"certType":OrderInfo.jbr.identityCd,
   				"certNumber":OrderInfo.jbr.identityNum,
   				"certTypeName": "居民身份证",
   				"addressStr":OrderInfo.jbr.addressStr,
   				"contactAddress":OrderInfo.jbr.mailAddressStr,
   				"telNumber":OrderInfo.jbr.accNbr,
   				"lanId":OrderInfo.cust.areaId,
   				"partyRoleCd":"3",
   				"partyTypeCd":"1",
   				"seq":_seq++,
   				"maxQuantity":0   
   		   };
   		 _collectionOrderList.collectionCustInfos.push(_custInfo);
   		 _collectionOrderList.collectionCustInfos.push(_jbrInfo);
   		var printSeq = 1;
   		$.each(info.collect.userList,function(){
			var user = this;
			var _userInfo = {
	   				"custName":user.userName,
	   				"certType":user.userIdentidiesTypeCd,
	   				"certTypeName": "居民身份证",
	   				"certNumber":user.userIdentityNum,
	   				"addressStr":user.userAddr,
	   				"contactAddress":user.userAddr,
	   				"telNumber":user.userPhoneNbr,
	   				"lanId":OrderInfo.cust.areaId,
	   				"partyRoleCd":"1",
	   				"partyTypeCd":"1",
	   				"seq":_seq++,
	   				"maxQuantity":user.useNum,
	   				"printSeq" :printSeq++,
	   				"remarks": user.useDetail
	   		   };
			_collectionOrderList.collectionCustInfos.push(_userInfo);
		});
   		 
    	 _infoCollectCommit();
       });
       
    };

    var _userInfoCreate = function(){
    	var validate=$("#userFormdata").Validform();
		if(!validate.check()){
			return;
		}
		var userIdentidiesTypeCd = $("#userOrderIdentidiesTypeCd").val();
		var userIdentityNum = $('#userOrderAttrIdCard').val();
		if(userIdentidiesTypeCd==1){
			userIdentityNum = $('#usersfzorderAttrIdCard').val();//身份证件号码
		}
		var userName = $("#userOrderAttrName").val();
		var userAddr = $("#userOrderAttrAddr").val();
		var userPhoneNbr = $("#userOrderAttrPhoneNbr").val();
		var useNum = $("#use_num").val();
		var useDetail = $("#user_detail").val();
		var isCollect = false;
		
		$.each(info.collect.userList,function(){
			var user = this;
			if(user.userIdentidiesTypeCd == userIdentidiesTypeCd && user.userIdentityNum == userIdentityNum){
				$.alert("提示","当前客户已采集使用人信息");
				isCollect = true;
				return;
			}
		});
		if(isCollect){
			return;
		}
		_userNo += 1;
		var user ={};
		user.userIdentidiesTypeCd = userIdentidiesTypeCd;
		user.userIdentityNum = userIdentityNum;
		user.userName = userName;
		user.userAddr = userAddr;
		user.userPhoneNbr = userPhoneNbr;
		user.useNum = useNum;
		user.useDetail = useDetail;
		user.no = _userNo;
		info.collect.userList.push(user);
		
		
		var userPhoneNbr = (userPhoneNbr != undefined && userPhoneNbr != "")?userPhoneNbr:"无";
		var useDetail = (useDetail != undefined &&useDetail != "")?useDetail:"无";
		var html = "";
		html +='<div class="panel-heading" style="border-bottom: 1px solid #dedede;" id="user_'+ _userNo +'">';
		html += '<h3 class="panel-title" onclick="info.collect.showUser('+_userNo+')">';
		html += '<i class="iconfont" value="up" id="up_'+_userNo+'" style="position: absolute; left: 0.2rem; top: 0.02rem;font-size: 0.48rem;">&#xe68f;</i>';
//		html += '<i class="iconfont" id="down_'+_userNo+'"style="position: absolute; left: 0.8rem; top: 0.02rem;font-size: 0.48rem;dispaly:none;">&#xe68f;</i>';
		html += '<a class="accordion-toggle accordion-toggle-styled border-none " data-toggle="collapse" data-parent="#accordion" href="#div_'+ _userNo +'"> '+ userName +'</a></h3>';
		html += '<i id="deleteUser" onclick="info.collect.deleteUser('+_userNo+')" class="iconfont absolute-right" style="display: block;right: 0.25rem;"></i></div>';
		html +='<div class="panel-collapse collapse" id="div_'+ _userNo +'">';
		html +='<div class="panel-body" style="background: #fff;padding: 0.1rem 0.1rem 0.1rem 0.8rem;">';
		html +='<div  style="line-height: 0.66rem;"><span class="list-title">证件号码</span><span class="pull-right p-r-20">'+userIdentityNum+'</span></div></li>';
		html +='<div  style="line-height: 0.66rem;"><span class="list-title">证件地址</span><span class="pull-right p-r-20">'+userAddr+'</span></div></li>';
		html +='<div  style="line-height: 0.66rem;"><span class="list-title">联系方式</span><span class="pull-right p-r-20">'+userPhoneNbr+'</span></div></li>';
		html +='<div  style="line-height: 0.66rem;"><span class="list-title">办理数量</span><span class="pull-right p-r-20">'+useNum+'</span></div></li>';
		html +='<div  style="line-height: 0.66rem;border:none"><span class="list-title">办理说明</span><span class="pull-right p-r-20">'+useDetail+'</span></div></li>';
		html +='</div>'
		html +='</div></div>';
		$("#user-list").append(html);
		$("#user-list").show();
		$("#user").modal("hide");
    };

    var _showUser = function(userNo){
    	if($("#up_"+userNo).val() != "up"){
    		$("#up_"+userNo).val("up");
    		$("#up_"+userNo).html("&#xe68e");
    	} else {
    		$("#up_"+userNo).html("&#xe68f");
    		$("#up_"+userNo).val("down");
    	}
    };
    
    var _deleteUser = function(userNo){
    	$("#user_"+userNo).remove();
    	$("#div_"+userNo).remove();
    	for(var i=0;i<info.collect.userList.length;i++){
			var user = info.collect.userList[i];
			if(user.no == userNo){
				info.collect.userList.splice(i,1);
			}
		}
    	if(info.collect.userList.length == 0){
    		$("#user-list").hide();
    	}
    	
    };
    
    var change_date = function(days) {  
        // 参数表示在当前日期下要增加的天数  
        var now = new Date();  
        // + 1 代表日期加，- 1代表日期减  
        now.setDate(now.getDate() + 1 * days);  
        var year = now.getFullYear();  
        var month = now.getMonth() + 1;  
        var day = now.getDate();  
        if (month < 10) {  
            month = '0' + month;  
        }  
        if (day < 10) {  
            day = '0' + day;  
        }  

        return year + '-' + month + '-' + day;  
    };  
    
    var _infoCollectCommit = function(){
    	var params = {
    		"collectionOrderList":_collectionOrderList
    	};
		var url=contextPath+"/app/infocollect/collectionOrderCommit";
		var response = $.callServiceAsJson(url, params, {
			"done" : function(response){
				if (response.code==0) {
					_printParam = response.data;
					$("#orderContentDiv").hide();
					$("#orderConfirmDiv").show();
					$("#tab7_li").removeClass("active");
					$("#tab8_li").addClass("active");
					$("#nav-tab-7").html(_getConfirmHtml(response.data));
					$("#nav-tab-7").addClass("active in");
					$("#custInfoConfirm").off("click").on("click",_custInfoConfirm);
//					OrderInfo.orderResult.olId = response.data.result.orderId;
//					OrderInfo.orderResult.olNbr = response.data.result.orderNbr;
					
				}else if (response.code==-2){
					$.alertM(response.data);
				}else {
					$.alert("提示","提交失败！");
				}
			},
			fail:function(response){
				$.alert("提示","信息","请求可能发生异常，请稍后再试");
			}
		});
		
    }
    var voucherInfo;
    
    
  //点击打印回执预览回执内容
	var _signVoucher=function(params){
//		var params = {
//			"custInfo":_collectionOrderList.collectionCustInfos[0],
//			"jbrInfo":_collectionOrderList.collectionCustInfos[1],
//			"userInfo":info.collect.userList,
//			"orderNbr":OrderInfo.orderResult.olNbr,
//			"expDate":_expDate,
//			"remark":$("#remark").val(),
//			"staffInfo":OrderInfo.staff
//		};
//		var url=contextPath+"/app/infocollect/infoPrint";
//		$.callServiceAsHtml(url, params, {
//			"before":function(){
//				$.ecOverlay("<strong>生成采集单信息预览的html,请稍等会儿....</strong>");
//			},	
//			"done" : function(response){
//				$.unecOverlay();
//				if (response.code == 0) {
//					OrderInfo.order.step = 4;
//					$("#headTabDiv2").hide();
//					$("#orderConfirmDiv").hide();
//					$("#order-print").show();
//					$("#showFtlHtml").html(response.data);
//					$("#datasignBtn").off("click").on("click",function(){
//						common.callDatasign("common.print.showDataSign");
//					});
//				
//					$("#print_ok").off("click").on("click",function(){
////						if(!ec.util.isObj($("#signinput").val())){
////							$.alert("提示","请先进行签名，然后再保存！");
////						}else{
//							_saveHtml2Pdf();
////						}
//					});
//				}else if (response.code == -2) {
//					$.alertM(response.data);
//				}else{
//					$.alert("提示","生成采集单信息预览的html失败!");
//				}
//			},
//			fail:function(response){
//				$.unecOverlay();
//				$.alert("提示","服务忙，请稍后再试！");
//			}
//		});
//		params = voucherInfo;
//		var PcFlag="1";
//		params.PcFlag=PcFlag;
		var url=contextPath+"/order/sign/custCltReceipt";
		$.callServiceAsHtml(url, _printParam, {
			"before":function(){
				$.ecOverlay("<strong>生成采集单信息预览的html,请稍等会儿....</strong>");
			},
			"done" : function(response){
				$.unecOverlay();
				if (response.code == 0) {
					OrderInfo.order.step = 4;
					$("#headTabDiv2").hide();
					$("#orderConfirmDiv").hide();
					$("#order-print").show();
					$("#datasignBtn").off("click").on("click",function(){
						common.callDatasign("common.print.showDataSign");
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
					$.alert("提示","生成采集单信息预览的html失败!");
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});
	};
var _saveHtml2Pdf=function(){
		var accNbr="";
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14 ||OrderInfo.actionFlag==112){ //新装
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
			"olId":OrderInfo.orderResult.olNbr,
			"signFlag":"5",
			"busiType":"9",
			"sign":_splitBaseforStr($("#signinput").val()),
			"srcFlag":"APP",
			"custName":OrderInfo.cust.printCustName,
			"certType":certType,
			"certNumber":OrderInfo.cust.printIdCardNbr,
			"accNbr":accNbr
		};
		var url=contextPath+"/order/sign/saveSignPdfForApp";
		$.callServiceAsJson(url, params, {
			"before":function(){
				$.ecOverlay("<strong>正在保存采集单信息,请稍等会儿....</strong>");
			},	
			"done" : function(response){
				$.unecOverlay();
				if (response.code == 0) {
					$("#order-print").hide();
					$("#headTabDiv2").show();
					$("#orderConfirmDiv").show();
					$("#print").attr("disabled","disabled");
					$("#custInfoConfirm").removeAttr("disabled");
					$("#custInfoConfirm").off("click").on("click",_custInfoConfirm);
				}else if (response.code == -2) {
					$.alertM(response.data);
				}else{
					var error=response.data.errData!=null?response.data.errData:"保存采集单信息失败!";
					$.alert("提示",error);
					
				}
			}
		});
		
	};
	var _splitBaseforStr = function(str){
		var re=new RegExp("=","g");
		str=str.replace(re,"(p/)");
		return str;
	};
	
	var _getConfirmHtml = function(result){
		var html = '<div class="list-box m-t-10"><ul class="choice-list-box" id="orderTbody">';
		html += '<li><span class="list-title"><span class="title-lg">'+result.orderNbr+'</span>';
		html += '<span class="subtitle font-secondary">采集单编号</span></span></li>';
		html += '<li><span class="list-title"><span class="title-lg">'+_expDate+'</span>';
		html += '<span class="subtitle font-secondary">采集单有效期</span></span></li>';
		html += '<li><span class="list-title"><span>采集人员</span></span></li>';
		$.each(info.collect.userList,function(){
			var user = this;
			html += '<li><span class="list-title"><span class="title-lg" style="margin-left:0.2rem;">'+user.userName+'</span>';
			html += '<span class="subtitle font-secondary" style="margin-left:0.2rem;">姓名</span></span></li>';
		});
		html += '<nav class="navbar navbar-default navbar-fixed-bottom"><div class="container-fluid"><div class="btn-group btn-group-justified navbar-btn" role="group" ><div class="sub-btn-box p p-b-15">';
		html += '<button class="double-btn pull-left" id="print" disabled="disabled" onClick="info.collect.signVoucher()">打印</button> ';
		html += '<button class="double-btn pull-right" id="custInfoConfirm" onClick="info.collect.custInfoConfirm">确认</button></div></div></div></nav>';
		return html;
	}
	
	var _custInfoConfirm = function(){
		var params={
				"orderId":OrderInfo.orderResult.olId,
				"areaId":OrderInfo.cust.areaId,
				"ifExp":"N"
			};
		var url=contextPath+"/app/infocollect/collectionOrderConfirm";
		var response = $.callServiceAsJson(url, params, {
			"before":function(){
				$.ecOverlay("<strong>正在进行采集单信息确认....</strong>");
			},	
			"done" : function(response){
				$.unecOverlay();
				if (response.code==0) {
					_showFinDialog();
				}else if (response.code == -2) {
					$.alertM(response.data);
				}else{
					var error=response.data.errData!=null?response.data.errData:"采集单确认失败!";
					$.alert("提示",error);
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});
	}
	var _showFinDialog=function(){
		var title='确认成功';
		$("#btn-dialog-ok").removeAttr("data-dismiss");
		$('#alert-modal').modal({backdrop: 'static', keyboard: false});
		$("#btn-dialog-ok").off("click").on("click",function(){
			common.relocationCust();
		});
		$("#modal-title").html(title);
		$("#modal-content").html("采集单信息确认成功");
		$("#alert-modal").modal();
	};
    return {
    	init			:_init,
    	userInfoCreate	:_userInfoCreate,
    	userNo			:_userNo,
    	showUser		:_showUser,
    	userList		:_userList,
    	deleteUser		:_deleteUser,
    	signVoucher		:_signVoucher,
    	custInfoConfirm	:_custInfoConfirm
    };
})();
//初始化
$(function () {

});