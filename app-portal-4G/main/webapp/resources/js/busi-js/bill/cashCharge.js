CommonUtils.regNamespace("bill", "charge");
/**现金充值**/
bill.charge = (function(){

	//选择充值金额
	var _chooseAmount=function(obj,amount){
		$("#cashAmount a").each(function(){
			$(this).removeClass("selectBoxTwoOn");
			$(this).addClass("selectBoxTwo");
		});
		$(obj).addClass("selectBoxTwoOn");
		$("#amount").val(amount);
	};
		
	//现金充值与充值冲正准备
	_initQryForm = function(){
		$('#cashChargeForm').on('formIsValid',function(event,form){
			var doCashTypeCd=$("#doCashTypeCd").val();
			if(doCashTypeCd=="0"){
				//现金充值确认
				_confirmCharge();
			}else{
				//充值冲正
				_doCharge();
			}
		}).ketchup( {
			bindElement:"btn_cash_charge"
		});
		if(phonenum!=""){
			var phonenum=$.trim($("#phoneNumber").val());
			var tempStr= phonenum.replace(/\s/g,'').replace(/(\w{3})(?=\w)/,"$1 ").replace(/(\w{4})(?=\w)/g,"$1 ");
			$("#confirmNumber").html(tempStr);
		}
		$("#phoneNumber").off("keyup").on("keyup",function(){
			var phonenum=$.trim($("#phoneNumber").val());
			var tempStr= phonenum.replace(/\s/g,'').replace(/(\w{3})(?=\w)/,"$1 ").replace(/(\w{4})(?=\w)/g,"$1 ");
			$("#confirmNumber").html(tempStr);
		});
	};
	
	//充值确认校验
	var _confirmCharge = function(){
/*		if($("#areaName").val()==""){
			$.alert("提示","请选择所属地区");
			return;
		}*/
	  	var phoneNum=$.trim($("#phoneNumber").val());

		if(CONST.APP_DESC==0){
			if(!CONST.LTE_PHONE_HEAD.test(phoneNum)){
				$.alert("提示","充值号码输入有误！");
			  	return;
			}
		}else{
			if(!CONST.MVNO_PHONE_HEAD.test(phoneNum)){
				$.alert("提示","充值号码输入有误！");
			  	return;
			}
		}
		
		var cash=$.trim($("#amount").val());
		
		if(cash==""){
			$.alert("提示","请输入充值金额！");
			return;
		}
	  	if(/^(([1-9]{1}\d*(\.\d{1,2})?)|(0\.\d[1-9])|(0\.[1-9]\d?))$/.test(cash)){
	  		if(cash>10000){
	  			$.alert("提示","单笔充值金额不能超过10000元");
	  			return;
	  		}
	  	}else{
	  		$.alert("提示","充值金额输入有误！");
	  		return;
	  	}
	  	//充值确认（充值鉴权）
	  	_createConfirm();
	};
	
	//充值确认
	var _createConfirm=function(){
		$("#authFailMsg").html("").hide();
		var _phoneNumber = $.trim($("#phoneNumber").val());
		var params = {
//				areaCode : $("#areaId").attr("areaCode"),
//				areaId : $("#areaId").val(),
				phoneNumber : _phoneNumber,
				destinationAttr : "2",   //用户属性 2:移动电话
				queryItemType : "0",     //查询余额类型 0:总余额 1:可提取余额
				queryFlag : "0"   //查询业务类型 0：按帐户查询 1：按用户查询
		};
		//充值鉴权
		$.callServiceAsJson(contextPath+"/bill/charge/cashConfirm", params, {
			"before":function(){
				$.ecOverlay("<strong>充值鉴权中，请稍后....</strong>");
			},"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code==-2){
					$.alertM(response.data);
					return;
				}
				if(response.code==1){
					$("#authFailMsg").html('<i><img width="25" height="25" style="margin:5px;" src='+contextPath+'/image/icon/tip.png></i><p style="position:relative;left:40px;bottom:30px;margin-bottom:-20px;width:97%;word-break:break-all;color:red;">'+response.data+'</p>').show();
					return;
				}
				if(response.code == 0){
					//页面变更，展示充值确认页面
					$("#resultTip").html("").hide();
					$("#pnum").html(_phoneNumber);
					$("#pcash").html($("#amount").val()+" 元");
					$("#confirmUl").show();
					$("#writeUl").hide();
					$("#cashPayFormSubmit").show();
					$("#cashPayFormSubmit").off("click").on("click", function(){
						_doCharge();
					});
					$("#cashPayFormBack").off("click").on("click", function(){
						$("#confirmUl").hide();
						$("#writeUl").show();
					});
				}
			}
		});
	};

	var _reqSerial = ""; //记录该次充值的流水号，给之后的回调查询做入参
	var resultTip = ""; //充值/冲正后的消息提示
	var delay = 2500; //查询充值是否成功回调的时延（间隔）
	//现金充值/充值冲正
	var _doCharge= function(){
		$("#cashPayFormSubmit").hide();
		var amount=$("#amount").val();
		var _phoneNumber = $.trim($("#phoneNumber").val());
		var params = {
				phoneNumber : _phoneNumber,
				unitTypeId : "0",
				destinationAttr : "2",
				feeAmount : (amount*100)+'',
				doCashTypeCd : $("#doCashTypeCd").val(),
				reqSerial : $("#reqSerial").val()
		};
		$.callServiceAsJson(contextPath+"/bill/charge/doCash", params, {
			"before":function(){
				$.ecOverlay("<strong>业务进行中，请稍等....</strong>");
			},
			"done" : function(response){
				if (response.code == 0) {
					if(params.doCashTypeCd=="0"){
						resultTip='<span class="green">充值请求已提交，将尽快到帐</span>&nbsp;&nbsp;&nbsp;&nbsp;';
						resultTip+='<a href="javascript:void(0);" style="color: #327501;" onclick="bill.charge.goToChargeRecord('+_phoneNumber+')">前往充值订单查询</a>';
						_reqSerial = response.data;
						setTimeout("bill.charge.queryChargeCallBack(1,"+_phoneNumber+","+amount+")", delay);
					}else{
						$("#btn_cash_charge").hide();
						resultTip='<span class="green">操作成功！</span>您已为号码：' + _phoneNumber + '冲正<span class="orange"> ' + amount + '元</span>';
						$("#resultTip").html(resultTip).show();
						$.unecOverlay();
						$.callServiceAsHtmlGet(contextPath+"/bill/charge/correctList", bill.correct.queryPayNotesParam, {
							"done" : function(response){
								$("#paynoteslist").html(response.data);
							}
						});
					}
				}else if (response.code == -2) {
					$.alertM(response.data);
					$.unecOverlay();
				}else{
					$("#resultTip").html('<span class="green">操作失败！</span>可能原因：'+response.data+'。').show();
					$.unecOverlay();
				}
			}
		});
	};
	
	//查询充值是否成功回调
	var _queryChargeCallBack = function(count,_phoneNumber,amount){
		var calendar = new Date();
		var year = ""+calendar.getFullYear();
		var month = ""+(calendar.getMonth()+1);
		if(month.length==1){
			month = "0"+month;
		}
		var _billingCycle = year+month;
		var params = {
				phoneNumber : _phoneNumber,
				billingCycle : _billingCycle,
				destinationAttr : "2",
				doCashTypeCd : "1",
				reqSerial : _reqSerial,
				pageType : "queryChargeCallBack"
		};
		$.callServiceAsJson(contextPath+"/bill/charge/queryCallBack", params, {
			"done" : function(response){
				if(response.code==0){
					resultTip='<span class="green">操作成功！</span>您已为号码：' + _phoneNumber + ' 充值 <span class="orange">' + amount + '元</span>&nbsp;&nbsp;&nbsp;&nbsp;';
					resultTip+='<a href="javascript:void(0);" style="color: #327501;" onclick="bill.charge.goToPrintReceipt();">前往票据打印</a>';
					count = 2;
				}
				count++;
				if(count>2){
					$("#resultTip").html(resultTip).show();
					$.unecOverlay(); //去除充值时的遮罩
					_reqSerial = "";
					resultTip = "";
					return;
				}else{
					setTimeout("bill.charge.queryChargeCallBack("+count+","+_phoneNumber+","+amount+")", delay);
				}
			}
		});
	};
	
	//前往查询充值订单
	var _goToChargeRecord = function(phoneNumber){
		self.location = contextPath+"/bill/preChargeRecord?phoneNumber="+phoneNumber;
	};
	
	//前往充值收据打印（转至充值历史查询）
	var _goToPrintReceipt = function(){
		var defaultAcctNbr = $.trim($("#phoneNumber").val());
		var defaultAreaCode = $("#areaId").attr("areaCode");
		var defaultAreaId = $("#areaId").val();
		var defaultAreaName = $("#parea").text();
		
		$.callServiceAsHtmlGet(contextPath+"/bill/charge/goToPrintReceipt", {
			"before" : function(){
				$.ecOverlay("<strong>页面加载中,请稍后....</strong>");
			},
			"always" : function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code==0){
					$(".main_warp").html(response.data);
					$("#queryArea").val(defaultAreaName);
					$("#areaId").val(defaultAreaId).attr("areaCode", defaultAreaCode);
					$("#phoneNumber").val(defaultAcctNbr);
				}else{
					$.alert("信息", "页面加载失败，请稍后再试");
					return;
				}
			}
		});			
	};
	
	//充值收据打印准备
	var _prepareChargeReceipt = function(a, _areaId, _acctNbr, _reqSerial){
		
		var receiptInfo = {}; //收据信息
		/*
		var paidTime = $(a).parent().parent().find("td:eq(2)").text();
		var year = paidTime.substring(0, 4);
		var month;
		if(paidTime.substring(5, 6)=="0"){
			month = paidTime.substring(6, 7);
		}else{
			month = paidTime.substring(5, 7);
		}
		var day;
		if(paidTime.substring(8, 9)=="0"){
			day = paidTime.substring(9, 10);
		}else{
			day = paidTime.substring(8, 10);
		}
		receiptInfo.invoiceDate = year+"/"+month+"/"+day;                                        //充值日期
		receiptInfo.invoiceTime = paidTime.substring(11, 19);                                       //充值时间
		*/
		receiptInfo.acceNumber = _acctNbr;                                                                     //接入号码
		receiptInfo.payMethod = $(a).parent().parent().find("td:eq(1)").text();         //付费方式
		receiptInfo.sumCharge = $(a).parent().parent().find("td:eq(0)").text();         //费用总额（单位：元）
		receiptInfo.sumChargeRMB  = ec.util.atoc(receiptInfo.sumCharge*100);       //费用总额（汉字大写）
		receiptInfo.channelName  = OrderInfo.staff.channelName;                               //渠道名称
		receiptInfo.custOrderNbr = _reqSerial;                                                                //充值流水
		
		//查询客户和员工信息
		var queryParams = {
				acctNbr : _acctNbr,
				areaId : _areaId,
				identityCd : "",
				identityNum : "",
				partyName : ""
		};
		var custAndStaffInfo = $.callServiceAsJson(contextPath+"/bill/queryCustAndStaff", queryParams);
		if(custAndStaffInfo.code==0){
			receiptInfo.partyName = custAndStaffInfo.data.partyName;    //客户名称
			receiptInfo.staffName = custAndStaffInfo.data.staffName;        //员工名称
			receiptInfo.staffCode = custAndStaffInfo.data.staffCode;			//员工工号
			$("#custName").text(custAndStaffInfo.data.partyName);
		}else if(custAndStaffInfo.code==-2){
			$.alertM(custAndStaffInfo.data);
			return;
		}else{
			$.alert("信息", custAndStaffInfo.data);
			return;
		}
		//查询充值票据模板
		var tempQryParams = {
				areaId : OrderInfo.staff.areaId,
				busiType : "103"
		};
		$.callServiceAsJson(contextPath+"/print/getInvoiceTemplates", tempQryParams, {
			"before" : function(){
				$.ecOverlay("<strong>客户信息查询中,请稍后....</strong>");
			},
			"always" : function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code==0){
					var tempInfo = response.data;
					if(tempInfo.resultCode!="POR-0000"){
						$.alert("提示",ec.util.defaultStr(tempData.resultMsg, "获取打印模板异常"));
						return;
					}
					if (tempInfo.length<1) {
						$.alert("提示", "没有获取到可用的打印模板");
						return;
					}
					var tempList = tempInfo.tempList;
					$("#tempListSel").html("");
					$.each(tempList, function(i, template){
						$("<option>").attr("value", template.templateId).text(template.templateName).appendTo("#tempListSel");
					});
					easyDialog.open({
						container : "ec-dialog-container-invoice-items"
					});
					$(".simplemodal-close").off("click").on("click", function(){
						easyDialog.close();
					});
					$("#invoiceItemsConCancel").off("click").on("click", function(){
						easyDialog.close();
					});
					$("#invoiceItemsConfirm").off("click").on("click", function(){
						_printChargeReceipt(receiptInfo);
					});
				}
				else if(response.code==-2){
					$.alertM(response.data);
					return;
				}
				else{
					$.alert("信息", response.data);
					return;
				}
			}
		});	
	};
	
	//充值收据打印（生成PDF预览页）
	var _printChargeReceipt = function(receiptInfo){
		$("#receiptInfo").remove();
		
		receiptInfo.title = "中国电信充值缴费收据"; //收据标题
		if($("#invoice").attr("checked")=="checked"){
			if($.trim($("#invoiceCd").val())==""){
				$.alert("提示", "若选择打印发票，请正确输入发票代码");
				return;
			}
			receiptInfo.title = "中国电信充值缴费发票"; //发票标题
			receiptInfo.invoiceCdTitle = "发票代码：";
			receiptInfo.invoiceCd = $.trim($("#invoiceCd").val()); //发票代码
		}
/*		if($.trim($("#invoiceNbr").val())==""){
			$.alert("提示", "请正确输入票据号码");
			return;
		}*/
		receiptInfo.invoiceNbr = $("#invoiceNbr").val(); //票据号码
		
		if($.trim($("#payer").val())!=""){
			receiptInfo.partyName = $.trim($("#payer").val()); //抬头不为空时将使用它作为缴款单位（人）
		}
		
		//打印准备的全量信息
		var printInfo = {
				receiptInfo : receiptInfo,                                //票据信息
				templateId : $("#tempListSel").val(),         //票据模板
				busiType : "103"                                            //票据业务类型：充值
		};
		
		if(_getCookie('_session_pad_flag')=='1'){
			var arr=new Array(3);
			if(ec.util.browser.versions.android){
				arr[0]='print/invoice';
			}else{
				arr[0]='print/iosInvoice';
			}
			arr[1]='invoiceParam';
			arr[2]=encodeURI(JSON.stringify(printInfo));
			MyPlugin.printShow(arr,
                function(result) {
                },
                function(error) {
                }
			);
		}else{
			$("<form>", {
		    	id: "receiptInfo",
		    	style: "display:none;",
		    	target: "_blank",
		    	method: "POST",
		    	action: contextPath + "/print/invoice"
		    }).append($("<input>", {
		    	id : "chargeReceipt",
		    	name : "invoiceParam",
		    	type: "hidden",
		    	value: encodeURI(JSON.stringify(printInfo))
		    })).appendTo("body").submit();
		}
		easyDialog.close();
	};
	var _getCookie = function(name){
		var cookievalue = "";
		var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
		if(arr != null) {
			cookievalue = unescape(arr[2]);
		}
		return cookievalue;
	};
	return {
		chooseAmount : _chooseAmount,
		initQryForm : _initQryForm,
		queryChargeCallBack : _queryChargeCallBack,
		goToChargeRecord : _goToChargeRecord,
		goToPrintReceipt :  _goToPrintReceipt,
		prepareChargeReceipt : _prepareChargeReceipt
	};
	
})();
//初始化
$(function(){
	
	$("#resultTip").html("").hide();
	
	bill.charge.initQryForm();
	
	$("#invoice").change(function(){
		if($("#invoice").attr("checked")){
			$("#invoiceCd").removeAttr("disabled");
		}
		else{
			$("#invoiceCd").attr("disabled", "disabled");
		}
	});
});
