/**
 * 号码预约
 * @author linm
 */
CommonUtils.regNamespace("order", "reserveNumber");
order.reserveNumber = (function(){
	var _boProdAn = {
			phoneNumber : "", //接入号
			anTypeCd : "",//号码类型
			areaId:"",
			haspwd:"0",
			password:"",
			identityId:"",
			custName:"",
			tel:"",
			remark:""
	};
	/*号码预约提交*/
	var _submitData=function(){
		var custName=$.trim($("#cCustName").val());
		if(custName==''){
			$.alert("提示","客户姓名不能为空！");
			return;
		}else{
			_boProdAn.custName=custName;
		}
		var identityId=$.trim($("#cCustIdCard").val());
		if(identityId==''){
			$.alert("提示","证件号码不能为空！");
			return;
		}else{
			_boProdAn.identityId=identityId;
		}
		var password=$.trim($("#cCustPwd").val());
		if(_boProdAn.haspwd=="1"&&password==''){
			$.alert("提示","预约密码不能为空！");
			return;
		}
		_boProdAn.password=password;
		_boProdAn.tel=$.trim($("#cCustIdPhone").val());
		_boProdAn.remark=$.trim($("#cRemark").val());
		_boProdAn.actionType="E";
		var url = contextPath+"/mktRes/reservenumber/submit";
		if(OrderInfo.order.token!=""){
			url = contextPath+"/mktRes/reservenumber/submit?token="+OrderInfo.order.token;
		}
		$.callServiceAsJson(url,_boProdAn,{
			"before":function(){
				$.ecOverlay("<strong>号码预约中,请稍等...</strong>");
			},"always":function(){
				$.unecOverlay();
			},"done" : function(response){
				SoOrder.getToken();
				easyDialog.close();
				if (response.code == 0) {
					$.alert("提示","号码["+_boProdAn.phoneNumber+"]预约成功!");
					order.phoneNumber.btnQueryPhoneNumber({});
				}else{
					if(typeof response == undefined){
						$.alert("提示","号码预约请求调用失败，可能原因服务停止或者数据解析异常");
					}else if (response.code == -2) {
						$.alertM(response.data);
					}else{
						var msg="";
						if(response.data!=undefined&&response.data.msg!=undefined){
							msg=response.data.msg;
						}else{
							msg="号码["+_boProdAn.phoneNumber+"]预约失败";
						}
						$.alert("提示","号码预约失败，可能原因:"+msg);
					}
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});	
	};
	/*号码选中*/
	var _endSelectNum=function(){
		_boProdAn={};
		if(selectedObj==undefined||selectedObj==null){
			$.alert("提示","请先选择号码！");
			return;
		}
		var phoneNumberVal = $(selectedObj).attr("numberVal"); 
		var areaId=OrderInfo.staff.areaId;
		var phoneNumber=phoneNumberVal.split("_")[0];
		var anTypeCd=phoneNumberVal.split("_")[3];
		var haspwd = $(selectedObj).attr("numberVal").split("_")[7]; 
		_boProdAn.phoneNumber=phoneNumber;
		_boProdAn.areaId=areaId;
		_boProdAn.anTypeCd=anTypeCd;
		_boProdAn.haspwd=haspwd;
		$("#chooseResNumber").html(_boProdAn.phoneNumber);
		if(_boProdAn.haspwd=="1"){
			$("#showReservePwd").show();
		}else{
			$("#showReservePwd").hide();
		}
		easyDialog.open({
			container : 'user_info'
		});
	};
	
	var _form_valid_init = function() {
		$('#custInfoForm').on('formIsValid',function(event,form){
			_submitData();
		}).ketchup( {
			bindElement:"custsubmitBtn"
		});
		$("#custInfoClose").off("click").on("click",function(event){
			easyDialog.close();
			if($.ketchup)
				$.ketchup.hideAllErrorContainer($("#custCreateForm"));
		});
		//重置
		$("#custresetBtn").off("click").on("click",function(event){
			if($.ketchup)
				$.ketchup.hideAllErrorContainer($("#custInfoForm"));
			$("#btncustreset").click();
			
		});
	};
	var _queryReserve=function(pageIndex){
		if(!$("#p_areaId_val").val()||$("#p_areaId_val").val()==""){
			$.alert("提示","请选择'地区'再查询");
			return ;
		}
		var startDt = $("#startDt").val();
		var endDt = $("#endDt").val();
		var channel=$("#p_channelId").val();
		var areaId=$("#p_areaId").val();
		var staffCode=$.trim($("#staffCode").val());
		var url=contextPath+"/mktRes/reservenumber/queryList";
		var param={
			pageNo:pageIndex,
			pageSize : 10,
			beginDate:startDt,
			endDate:endDt,
			channelId:channel,
			areaId:areaId,
			staffCode:staffCode
		};
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
				var content$=$("#reserveNumbers");
				content$.html(response.data);
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});	
	};
	var _reserveNumInit=function(){
		order.phoneNumber.queryApConfig();
		order.phoneNumber.queryPhoneNbrPool();
		order.ysl=
		order.phoneNumber.queryPnLevelProdOffer("reserve");
		_queryFlag="1";
		SoOrder.getToken();
		var param={};
		order.phoneNumber.btnQueryPhoneNumber(param);
		$("#btnNumSearch").off("click").on("click",function(){order.phoneNumber.btnQueryPhoneNumber(param);});
		_form_valid_init();
	};
	var _reserveQueryInit=function(){
		//时间段选择控件限制
		$("#startDt").off("click").on("click",function(){
			$.calendar({ format:'yyyy-MM-dd ',real:'#startDt',maxDate:$("#endDt").val() });
		});
		$("#endDt").off("click").on("click",function(){
			$.calendar({ format:'yyyy-MM-dd ',real:'#endDt',minDate:$("#startDt").val(),maxDate:'%y-%M-%d' });
		});
	};
	/*var _releaseNum=function(number,idCard,staffId,staffCode){
		if(ec.util.isObj(staffId)){
			if(staffId!=OrderInfo.staff.staffId){
				$.alert("信息提示","该号码是["+staffCode+"]预约的，您无权限释放它");
				return;
			}
		}else{
			$.alert("信息提示","营销资源未返回员工ID，请资源审查。");
			return;
		}
		var param={
			phoneNumber:number,
			identityId:idCard,
			actionType:"F"
		};
		var url = contextPath+"/mktRes/reservenumber/submit";
		SoOrder.getToken();
		if(OrderInfo.order.token!=""){
			url = contextPath+"/mktRes/reservenumber/submit?token="+OrderInfo.order.token;
		}
		$.callServiceAsJson(url,param,{
			"before":function(){
				$.ecOverlay("<strong>预约号码释放中,请稍等...</strong>");
			},"always":function(){
				$.unecOverlay();
			},"done" : function(response){
				SoOrder.getToken();
				if (response.code == 0) {
					$.alert("提示","号码释放成功!");
					_queryReserve(1);
				}else{
					if(typeof response == undefined){
						$.alert("提示","预约号码释放请求调用失败，可能原因服务停止或者数据解析异常");
					}else if (response.code == -2) {
						$.alertM(response.data);
					}else{
						var msg="";
						if(response.data!=undefined&&response.data.msg!=undefined){
							msg=response.data.msg;
						}else{
							msg="预约号码["+number+"]释放失败";
						}
						$.alert("提示","预约号码释放失败，可能原因:"+msg);
					}
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});	
	};*/
	
	var _batchReserve = function(){
		var size = $("input[name=ids]:checked").size(); // size是选中的个数
		if (size == 0) {
			$.alert("提示", "请勾选要释放的号码！");
			return;
		} else {
			var invalidNum  = []; // 无权释放的号码
			var param = {
				phoneNumberList : []
			};
			$("input[name=ids]:checked").each(function(i) {
				var _strArr = $(this).val().split('_');
				if (_strArr[1] != OrderInfo.staff.staffId) {
					invalidNum[i] = _strArr[0];
					++i;
				}
				var paramNum = {
					phoneNumber : ""
				};
				paramNum.phoneNumber = _strArr[0];
				param.phoneNumberList.push(paramNum);
			});
			
			if(invalidNum.length > 0)
			{
				$.alert("信息提示", "号码["+invalidNum+"]为其他员工预约,您无权释放！");
				return false;
			}
			
			var url = contextPath + "/mktRes/reservenumber/reserveBatchSubmit";
			$.callServiceAsJson(url, param, {
				"before" : function() {
					$.ecOverlay("<strong>预约号码批量释放中,请稍等...</strong>");
				},
				"always" : function() {
					$.unecOverlay();
				},
				"done" : function(response) {
					if (response.code == 0) {
						$.alert("信息提示", "释放成功！");
						_queryReserve(1);
					} else {
						if(typeof response == undefined){
							$.alert("提示","预约号码释放请求调用失败，可能原因服务停止或者数据解析异常");
						}else if (response.code == -2) {
							$.alertM(response.data);
						}else{
							var msg="";
							if(response.data!=undefined&&response.data.msg!=undefined){
								msg=response.data.msg;
							}else{
								msg="预约号码批量释放失败";
							}
							$.alert("提示",msg);
						}
					}
				},
				fail : function(response) {
					$.unecOverlay();
					$.alert("提示", "请求可能发生异常，请稍后再试！");
				}
			});
		}
	};
	
	return{
		endSelectNum:_endSelectNum,
		reserveNumInit:_reserveNumInit,
		reserveQueryInit:_reserveQueryInit,
		queryReserve:_queryReserve,
//		releaseNum:_releaseNum,
		batchReserve:_batchReserve
	};
})();
//初始化
$(function(){
	
});