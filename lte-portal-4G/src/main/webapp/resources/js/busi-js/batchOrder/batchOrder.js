CommonUtils.regNamespace("order", "batch");
order.batch = (function(){
	var file = {
		suffix: null
	};
		
	//导入excel
	var _submit=function(){
		var upFile = $.trim($("#upFile").val());
		var olId = $.trim($("#olId").val());
		var reserveDt = $.trim($("#reserveDt").val());
		if (olId === "") {
			$.alert("提示","购物车流水不能为空！");
			return;
		}
		var batchType=$("#batchType").val();
		if(batchType==''){
			$.alert("提示","种子订单受理类型不能为空!");
			return;
		}
		if(reserveDt==''){
			$.alert("提示","请选择预约时间!");
			return;
		}
		if (upFile === "") {
			$.alert("提示","请选择要导入的Excel文件！");
			return;
		} else {
			file.suffix = upFile.substr(upFile.lastIndexOf(".") + 1);
			if (file.suffix == "xls" || file.suffix == "xlsx") {
				$("#batchUimForm").submit();
			} else {
				$.alert("提示","导入文件类型错误！");
				return;
			}
		}
	};
	//弹出导入窗口
	var _barchImport=function(olId,olnumber,areaId){
		if($("#h2_tit").attr("value") == 1){//批量新装,需要客户定位
		var custId = OrderInfo.cust.custId;
		if(OrderInfo.cust==undefined || custId==undefined || custId==""){
			$.alert("提示","在导入Excel模板前请先进行客户定位！");
			return;
		}
		}
		var templateType=$("#templateType").val();
		var html='<iframe src="'+contextPath+'/order/batchOrder/batchForm?olId='+olId+'&olseq='+olnumber+'&type='+templateType+'&areaId='+areaId+'" width="650" height="270" style="border:0px"></iframe>';
		ec.form.dialog.createDialog({
			"id":"-import",
			"width":700,
			"height":270,
			"initCallBack":function(dialogForm,dialog){
				$("#importContent").html(html);
			 },
			"submitCallBack":function(dialogForm,dialog){}
		});
	};
	//查询导入数据列表
	var _batchImportList=function(pageIndex){
		var url=contextPath+"/order/batchOrder/batchImportList";
		var groupId=$.trim($("#groupId").val());
		var statusCd=$("#statusCd").val();
		var templateType=$("#templateType").val();
		var startDt = $("#startDt").val();
		var endDt = $("#endDt").val();
		var orderStatus = $("#orderStatus").val();//订单状态
		if(templateType==''){
			$.alert("提示","种子订单受理类型不能为空!");
			return;
		}
		if(!/^[0-9]*$/.test(groupId)){
			$.alert("提示","批次号格式错误");
			return;
		}
		var param={
			"groupId":groupId,
			"statusCd":statusCd,
			"templateType":templateType,
			"orderStatus":orderStatus,
			"startDt":startDt,
			"endDt":endDt,
			"pageIndex":pageIndex,
			"pageSize":"10"
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
				var content$=$("#batchImportlist");
				content$.html(response.data);
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});	
	};
	//查询种子订单列表
	var _batchOrderList=function(pageIndex){
		var templateType=$("#templateType").val();
		var url=contextPath+"/order/batchOrder/batchOrderList";
		var param={
				templateType : templateType,
				pageIndex : pageIndex,
				pageSize : 10,
				custOrderId : "",
				custSoNumber : "",
				startDt : "",
				endDt : "",
				templateOrderName : ""
			};
		if(templateType!="9"){
			if($("#cartId").attr("checked")){
				if(!/^[0-9]*$/.test($.trim($("#custOrderId").val()))){
					$.alert("提示","购物车ID格式错误");
					return;
				}
				param.custOrderId = $.trim($("#custOrderId").val());
			}
			else if($("#cartNbr").attr("checked")){
				param.custSoNumber = $.trim($("#custSoNumber").val());
			}
			else{
				param.templateOrderName = $.trim($("#templateOrderName").val());
				param.startDt = $("#startDt").val();
				param.endDt = $("#endDt").val();
			}
		}
		if(templateType==''){
			$.alert("提示","种子订单受理类型不能为空!");
			return;
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
				var content$=$("#batchOrderlist");
				content$.html(response.data);
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});	
	};
	//删除种子订单
	var _batchOrderDel=function(obj,orderId){
		if(confirm("您确认要作废订单吗？")){
			var params={
				"custOrderId":orderId
			};
			var url=contextPath+"/order/batchOrder/batchOrderDel";
			$.callServiceAsJson(url, params, {
				"before":function(){
					$.ecOverlay("<strong>正在作废订单,请稍等会儿....</strong>");
				},"always":function(){
					$.unecOverlay();
				},	
				"done" : function(response){
					if (response.code == 0) {
						$(obj).parent().parent().remove(); 
					}else if (response.code == -2) {
						$.alertM(response.data);
					}else{
						$.alert("提示","删除订单失败!");
					}
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","请求可能发生异常，请稍后再试！");
				}
			});
		}
	};
	
	// 批量订购裸终端文件导入前校验串码是否可用
	var _toVerify = function(){
		var upFile = $.trim($("#upFile").val());
		if("" === upFile){
			$.alert("提示","请选择要校验的Excel文件！");
			return;
		}else{
			file.suffix = upFile.substr(upFile.lastIndexOf(".") + 1);
			if (file.suffix == "xls" || file.suffix == "xlsx") {
				//$("#batchUimForm").submit();
				/*$.ecOverlay("<strong>终端串码校验中,请稍等...</strong>");
				$.ajaxFileUpload({
		            url: 'batchOrderVerify', 
		            type: 'post',
		            fileElementId: 'upFile', // 上传文件的id、name属性名
		            dataType: 'text', //返回值类型，一般设置为json、application/json
		            success: function(data, status){ 
		            	$.unecOverlay();
		                $('#detailInfo').html(data);
		                $('#batchType').attr("value","xxx.xls");
		            },
		            error: function(data, status, e){
		            	$.unecOverlay();
		                alert("error:"+e);
		            }
		        });*/
				var options  = {    
			            url:'batchOrderVerify',    
			            type:'post',
			            dataType:'text',
			            beforeSubmit:function(){
			            	$.ecOverlay("<strong>终端串码校验中,请稍等...</strong>");
			            },
			            success:function(data)    
			            {    
			            	$.unecOverlay();
			            	$("#numberList tbody").empty();
			            	$('#detailInfo').html(data);
			            	var isTrue = $('#isTrue').val();
			            	if(isTrue){
				            	var terminalInfoJson = $('#terminalInfoJson').val();
				            	terminalInfoJson = terminalInfoJson.replace(/\'/g,"\"");
				            	var terminalInfo = jQuery.parseJSON(terminalInfoJson);
				            	// 删除监听
				            	// $(document).removeJEventListener("terminalPage");
				            	if(terminalInfo.data && terminalInfo.data.length > 0){
									$("#terminalPageDiv").empty();
									common.arraypage.init("terminalPageDiv", 5, "pageId","terminalPage", terminalInfo.data);	
								}
				            	$('#importExcel').removeClass("purchase").addClass("disablepurchase");
				            	$('#importExcel').off('click');
				            	if(isTrue=="true"){
					            	var result = $('#result').val();
					            	result = result.replace(/\'/g,"\"");
					            	var response = jQuery.parseJSON(result);
					            	$('#importExcel').removeClass("disablepurchase").addClass("purchase");
					            	$('#importExcel').off('click').on('click',function(){
					            		_toImportFile(response.data);
					            	});
				            	}
			            	}
			            },
						error: function(data, status, e){
							$.unecOverlay();
							$.alert("提示","请求可能发生异常，请稍后再试！");
						}
			        };
				$('#batchUimForm').ajaxSubmit(options); 
			} else {
				$.alert("提示","导入文件类型错误！");
				return;
			}
		}
	};
	
	$(this).addJEventListener("terminalPage",function(data){
		_showTerminalInfo(data);
	});
	//展示终端信息
	var _showTerminalInfo = function(terminalInfos){
		$("#numberList tbody").empty();
		$.each(terminalInfos,function(i, terminalInfo){
			var tr = $("<tr></tr>").appendTo($("#numberList tbody"));
			if(terminalInfo.code == 0){
				$("<td><img src='"+contextPath+"/image/common/order_check.png' style='margin-top:15px'/></td>").appendTo(tr);
			}
			else{
				$("<td><img src='"+contextPath+"/image/common/order_check_error.png' style='margin-top:15px'/></td>").appendTo(tr);
			}
			if(terminalInfo.mktResCode){
				$("<td>"+terminalInfo.mktResCode+"</td>").appendTo(tr);
			}
			else{
				$("<td></td>").appendTo(tr);
			}
			if(terminalInfo.mktResName){
				$("<td>"+terminalInfo.mktResName+"</td>").appendTo(tr);
			}
			else{
				$("<td></td>").appendTo(tr);
			}
			if(terminalInfo.salePrice){
				$("<td>"+terminalInfo.salePrice+"</td>").appendTo(tr);
			}
			else{
				$("<td></td>").appendTo(tr);
			}
			if(terminalInfo.colour){
				$("<td>"+terminalInfo.colour+"</td>").appendTo(tr);
			}
			else{
				$("<td></td>").appendTo(tr);
			}
			if(terminalInfo.dealer){
				$("<td>"+terminalInfo.dealer+"</td>").appendTo(tr);
			}
			else{
				$("<td></td>").appendTo(tr);
			}
			if(terminalInfo.message){
				$("<td>"+terminalInfo.message+"</td>").appendTo(tr);
			}
			else{
				$("<td></td>").appendTo(tr);
			}
		});
	};
	
	// 批量订购裸终端文件导入
	var _toImportFile = function(list){
		var upFile = $.trim($("#upFile").val());
		var reserveDt = $.trim($("#reserveDt").val());
		var batchType=$("#batchType").val();
		if(batchType==''){
			$.alert("提示","种子订单受理类型不能为空!");
			return;
		}
		if(reserveDt==''){
			$.alert("提示","请选择预约时间!");
			return;
		}
		if("" === upFile){
			$.alert("提示","请选择要提交的Excel文件！");
			return;
		}else{
			var url=contextPath+"/order/batchOrder/batchTerminalImport";
			var param = {
				"reserveDt":reserveDt,
				"batchType":batchType,
				"data":list
			};
			$.callServiceAsJson(url, param, {
				"before":function(){
					$.ecOverlay("<strong>正在提交订单,请稍等会儿....</strong>");
				},"always":function(){
					$.unecOverlay();
				},	
				"done" : function(response){
					if (response.code == 0) {
						$.alert("信息提示", response.data.msg);
						// 提交成功后清空文件
						var file = $("#upFile") ;
						file.after(file.clone().val(""));      
						file.remove();
						$('#importExcel').removeClass("purchase").addClass("disablepurchase");
						$('#importExcel').off('click');
					}else if (response.code == -2) {
						$.alertM(response.data);
					}else{
						$.alert("提示","批量文件提交失败!");
					}
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","请求可能发生异常，请稍后再试！");
				}
			});
		}
	};
	
	// 表单充值
	var _reset=function(){
		$("#upFile").val("");
	};
	var _download=function(batType){
		if(batType=='0'){
			location.href=contextPath+"/file/BATCHHUOKA.xls";
		}else if(batType=='1'){
			location.href=contextPath+"/file/BATCHNEWORDER.xls";
		}else if(batType=='2'){
			location.href=contextPath+"/file/BATCHFUSHU.xls";
		}else if(batType=='5'){
			location.href=contextPath+"/file/BATCHCHANGE.xls";
		}else if(batType=='8'){
			location.href=contextPath+"/file/BATCHCHAIJI.xls";
		}else if(batType=='9'){
			location.href=contextPath+"/file/BATCHFAZHANREN.xls";
		}else if(batType=='10'){
			location.href=contextPath+"/file/BATCHORDERTERMINAL.xls";
		}else{
			$.alert("提示","未找到批量类型所对应的模板文件，请检查！");
			return;
		}
	};
	var _downloadIdType=function(){
		location.href=contextPath+"/file/CARTTYPE.xls";
	};
	var _initDic = function(){
		//初始化批量订单查询页面的订单状态 By ZhangYu
		var param = {"attrSpecCode":"EVT-0002"} ;
		$.callServiceAsJson(contextPath+"/staffMgr/getCTGMainData",param,{
			"done" : function(response){
				if(response.code==0){
					var data = response.data ;
					if(data!=undefined && data.length>0){
						for(var i=0;i<data.length;i++){
							var busiStatus = data[i];
							$("#orderStatus").append("<option value='"+busiStatus.attrValueCode+"' >"+busiStatus.attrValueName+"</option>");
							//$("#p_olStatusCd").append("<option value='"+busiStatus.attrValueCode+"' >"+busiStatus.attrValueName+"</option>");
						}
					}
				}else if(response.code==-2){
					$.alertM(response.data);
					return;
				}else{
					$.alert("提示","调用主数据接口失败！");
					return;
				}
			}
		});	
		
		param = {"attrSpecCode":"BATCH_PROD_GEN_CO_STATUS"} ;
		$.callServiceAsJson(contextPath+"/staffMgr/getCTGMainData",param,{
			"done" : function(response){
				if(response.code==0){
					var data = response.data ;
					if(data!=undefined && data.length>0){
						for(var i=0;i<data.length;i++){
							var busiStatus = data[i];
							$("#statusCd").append("<option value='"+busiStatus.attrValueCode+"' >"+busiStatus.attrValueName+"</option>");
						}
					}
				}else if(response.code==-2){
					$.alertM(response.data);
					return;
				}else{
					$.alert("提示","调用主数据接口失败！");
					return;
				}
			}
		});
		param = {"attrSpecCode":"BATCH_TYPE_CONFIG"} ;
		$.callServiceAsJson(contextPath+"/staffMgr/getCTGMainData",param,{
			"done" : function(response){
				if(response.code==0){
					var data = response.data ;
					if(data!=undefined && data.length>0){
						for(var i=0;i<data.length;i++){
							var busiStatus = data[i];
							$("#templateType").append("<option value='"+busiStatus.attrValueCode+"' >"+busiStatus.attrValueName+"</option>");
						}
					}
				}else if(response.code==-2){
					$.alertM(response.data);
					return;
				}else{
					$.alert("提示","调用主数据接口失败！");
					return;
				}
			}
		});
	};
	var _getMoreError=function(){
		if($("#alertMoreContent").is(":hidden")){
			$("#alertMoreContent").show();
		}else{
			$("#alertMoreContent").hide();
		}
	};
	
	var _slideFailInfo = function(a){
		$(a).parent().find("p").slideToggle();
	};
	return {
		submit :_submit,
		batchOrderList:_batchOrderList,
		batchImportList:_batchImportList,
		batchOrderDel:_batchOrderDel,
		barchImport:_barchImport,
		reset:_reset,
		toVerify:_toVerify,
		toImportFile:_toImportFile,
		download:_download,
		downloadIdType:_downloadIdType,
		initDic:_initDic,
		getMoreError:_getMoreError,
		slideFailInfo:_slideFailInfo
	};
})();
//初始化
$(function(){
	var queryType=$("#queryType").val();
	if(queryType==undefined||queryType==null){
		queryType="";
	}
	if(queryType=='templateQuery'){
		var templateType=$("#templateType").val();
		if(templateType=="9"){
			order.batch.batchOrderList('1');
		}
		//精确查询相关
		$("#custOrderId").attr("disabled", true);
		$("#custSoNumber").attr("disabled", true);
		
		$("#cartId").change(function(){
			if($("#cartId").attr("checked")){
				$("#custOrderId").attr("disabled", false);
				$("#cartNbr").removeAttr("checked");
				$("#custSoNumber").attr("disabled", true);
				$(".mohu").attr("disabled", true);
			}
			else{
				$("#custOrderId").attr("disabled", true);
				$(".mohu").attr("disabled", false);
			}
		});	
		$("#cartNbr").change(function(){
			if($("#cartNbr").attr("checked")){
				$("#custSoNumber").attr("disabled", false);
				$("#cartId").removeAttr("checked");
				$("#custOrderId").attr("disabled", true);
				$(".mohu").attr("disabled", true);
			}
			else{
				$("#custSoNumber").attr("disabled", true);
				$(".mohu").attr("disabled", false);
			}
		});
	}else if(queryType=='importQuery'){
		order.batch.initDic();
	}
	
	//时间段选择控件限制
	$("#startDt").off("click").on("click",function(){
		$.calendar({ format:'yyyy-MM-dd ',real:'#startDt',maxDate:$("#endDt").val() });
	});
	$("#endDt").off("click").on("click",function(){
		$.calendar({ format:'yyyy-MM-dd ',real:'#endDt',minDate:$("#startDt").val(),maxDate:'%y-%M-%d' });
	});
		
});