CommonUtils.regNamespace("order", "batch");
order.batch = (function(){
	var file = {
		suffix: null
	};
		
	//导入excel
	var _submit=function(){
		var batchType=$("#batchType").val();
		if(batchType==''){
			$.alert("提示","种子订单受理类型不能为空!");
			return;
		}
		if(batchType == '11'){//批量换挡
			var upFile = $.trim($("#upFile").val());;
			var reserveDt = $.trim($("#reserveDt").val());
			if(reserveDt == ''){
				//$.alert("提示","请选择预约时间!");
				$('#alertInfo').html("请选择预约时间!");
				return;
			}
			if (upFile === "") {
				//$.alert("提示","请选择要导入的Excel文件！");
				$('#alertInfo').html("请导入Excel文件！");
				return;
			} else {
				file.suffix = upFile.substr(upFile.lastIndexOf(".") + 1);
				if (file.suffix == "xls" || file.suffix == "xlsx") {
					var options  = {
							type:"post", 
				                dataType:"text", 
				                url:"importBatchData",
								beforeSubmit:function(){
									$.ecOverlay("<strong>正在提交,请稍等...</strong>");
								},							
				                success:function(data){
									$.unecOverlay();
									$('#detailInfo').html(data);
									//$('#alertInfo').html("");//提交成功后清空原有的提示信息
									$('#alertInfo').empty();
									var file = $("#upFile");
									file.after(file.clone().val(""));   
									file.remove();//提交成功后清空文件
				                },
								error: function(data, status, e){
								$.unecOverlay();
								$.alert("提示","请求可能发生异常，请稍后再试！");
								}
						};
						$("#batchChangeFeeTypeForm").ajaxSubmit(options);
				} else {
					$('#alertInfo').html("导入文件类型错误！");
					return;
				}
			}
		} else{
			var upFile = $.trim($("#upFile").val());
			var olId = $.trim($("#olId").val());
			var reserveDt = $.trim($("#reserveDt").val());
			if (olId === "") {
				$.alert("提示","购物车流水不能为空！");
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
	
	// 表单重置
	var _reset=function(){
		$("#upFile").val("");
		if($("#batchType").val() == "11"){
			//$('#alertInfo').html("");
			$('#alertInfo').empty();
			$('#detailInfo').empty();
		}			
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
		}else if(batType=='11'){//批量换挡
			location.href=contextPath+"/file/BATCHCHANGEFEETYPE.xls";
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
		var param = {"attrSpecCode":"EVT-0002"};
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
		
		//初始化进度查询页面的批量受理状态 groupStatusCd（后台暂未支持，页面上的批量受理状态暂时写死）By 2015-10-09 ZhangYu
		/*param = {"attrSpecCode":""};
		$.callServiceAsJson(contextPath+"/staffMgr/getCTGMainData",param,{
			"done" : function(response){
				if(response.code==0){
					var data = response.data ;
					if(data!=undefined && data.length>0){
						for(var i=0;i<data.length;i++){
							var busiStatus = data[i];
							$("#groupStatusCd").append("<option value='"+busiStatus.attrValueCode+"' >"+busiStatus.attrValueName+"</option>");
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
		});	*/
		
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
		//判断执行新旧代码--集约批量预开通优化
		/*param = {"queryFlag":"batchOrderQry"};
		$.callServiceAsJson(contextPath+"/order/batchOrder/batchOrderFlag",param,{
			"done" : function(response){
				if(response.code==0){
					var batchOrderQry = response.data;
					CONST.BATCHORDER_FLAG.BATCHORDER_QRY_FLAG = "Y";
					
				}else if(response.code==-2){
					$.alertM(response.data);
					return;
				}else{
					$.alert("提示","请求异常，请稍后再试！");
					return;
				}
			}
		});*/
		//判断执行新旧代码--批量受理查询增加权限优化
		param = {"queryFlag":"batchOrderAuth"};
		$.callServiceAsJson(contextPath+"/order/batchOrder/batchOrderFlag",param,{
			"done" : function(response){
				if(response.code==0){
					var batchOrderAuth = response.data;
					if("Y" == batchOrderAuth){//执行改造后的新代码(增加权限)
						CONST.BATCHORDER_FLAG.BATCHORDER_AUTH_FLAG = "Y";
					} else if("N" == batchOrderAuth){//执行改造前的旧代码
						$("#p_areaId_val").val("暂未开放");
						$("#p_areaId_val").css("background-color","#E8E8E8").attr("disabled", true);
						$("#p_channelId option:eq(0)").html("暂未开放");
						$("#p_channelId").css("background-color","#E8E8E8").attr("disabled", true);
					}
				}else if(response.code == -2){
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
	
	/**
	 * 批量受理结果查询，某一批次的具体处理状态："RC">资源返销 "F">建档算费失败 "X">生成购物车失败 "S">生成购物车成功 "C">建档算费成功 "Q">导入成功
	 * @author ZhangYu
	 */
	var _batchStatusQuery = function(groupId){
		if(groupId == null || groupId == "" || groupId == undefined){
			$.alert("提示","批次号为空，无法进行查询，请刷新页面或稍后再试！");
			return;
		}
			
		var url=contextPath+"/order/batchOrder/batchStatusQuery";
			var param = {
				"groupId":groupId
			};
			$.callServiceAsHtmlGet(url,param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询,请稍等....</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					$("#batchStatusQuery_dialog").html(response.data);
					easyDialog.open({
						container : "batchStatusQuery_dialog"
					});
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","请求可能发生异常，请稍后再试！");
				}
			});	
	};
	
	/**
	 * 批次信息查询下的“取消”
	 * areaId:创建该批次的员工的areaId, staffId:创建该批次的员工的staffId, groupId:批次号, dealFlag:标志位，取值为“cancel（取消）”或"update（修改）"
	 * @author ZhangYu
	 */
	var _batchCancel = function(groupId, groupStatusCd) {
		if(groupStatusCd == null || groupStatusCd == "" || groupStatusCd == undefined){
			$.alert("提示","该批次状态为空，无法进行操作！");
			return;
		}
		if(confirm("您确认要取消该批次吗？")){
			if (groupId == null || groupId == "" || groupId == undefined) {
				$.alert("提示", "批次号为空，无法进行操作，请刷新页面或稍后再试！");
				return;
			}
			/*if (staffId == null || staffId == "" || staffId == undefined) {
				$.alert("提示", "受理工号为空，无法进行操作，请刷新页面或稍后再试！");
				return;
			}*/
			/*if (areaId == null || areaId == "" || areaId == undefined) {
				$.alert("提示", "地区ID为空，无法进行操作，请刷新页面或稍后再试！");
				return;
			}*/

			var param = {
				"groupId" : groupId// 批次号
				//"staffId" : staffId,// 创建该批次的员工的staffId
				//"areaId" : areaId// 创建该批次的员工的areaId
			};
			param["dealFlag"] = "cancel";
			var url = contextPath + "/order/batchOrder/batchOperateCancle";
			$.callServiceAsHtml(url, param, {
				"before" : function() {
					$.ecOverlay("<strong>正在查询,请稍等....</strong>");
				},
				"always" : function() {
					$.unecOverlay();
				},
				"done" : function(response) {
					/*if (response.code == 0) {
						$.alert("提示", "操作成功，该批次已被删除!");
					} else if (response.code == -2) {
						$.alertM(response.data);
					} else {
						$.alert("提示", "操作失败!");
					}*/
					//刷新页面
					//self.location.reload();
					$("#batchCancel_dialog").html(response.data);
					easyDialog.open({
						container : "ec-dialog-form-container-cancel"
					});
				},
				fail : function(response) {
					$.unecOverlay();
					$.alert("提示", "请求可能发生异常，请稍后再试！");
				}
			});
		}
	};
	
	/**
	 * 批次信息查询下的“修改”
	 * dealFlag:标志位，取值为“cancel（取消）”或"update（修改）"
	 * @author ZhangYu
	 */
	var _batchUpdateMain = function(groupId, reserveDt, groupStatusCd){
		if(groupId == null || groupId == "" || groupId == undefined){
			$.alert("提示","批次号为空，无法进行操作，请刷新页面或稍后再试！");
			return;
		}
		/*if(staffId == null || staffId == "" || staffId == undefined){
			$.alert("提示","受理工号为空，无法进行操作，请刷新页面或稍后再试！");
			return;
		}*/
		/*if(areaId == null || areaId == "" || areaId == undefined){
			$.alert("提示","地区ID为空，无法进行操作，请刷新页面或稍后再试！");
			return;
		}*/
		if(reserveDt == null || reserveDt == "" || reserveDt == undefined){
			$.alert("提示","预约时间为空，无法进行操作，请刷新页面或稍后再试！");
			return;
		}
		if(groupStatusCd == null || groupStatusCd == "" || groupStatusCd == undefined){
			$.alert("提示","批次状态为空，无法进行修改！");
			return;
		}
		var param = {
				"reserveDt":reserveDt,//预约时间
				"groupId":groupId// 批次号
				//"staffId":staffId,// 创建该批次的员工的staffId
				//"areaId":areaId// 创建该批次的员工的areaId
		};
		param["dealFlag"] = "update";
		var url = contextPath+"/order/batchOrder/batchUpdateMain";
		$.callServiceAsHtml(url, param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询,请稍等....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				$("#batchUpdate_dialog").html(response.data);
				easyDialog.open({
					container : "ec-dialog-form-container-update"
				});
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
		
	};
	
	/**
	 * 批次信息查询下的“修改”，其中“修改”仅限于修改时间。批次“未处理”时，才可以修改“预约处理时间”；其他情况，不允许修改。
	 * areaId:创建该批次的员工的areaId, staffId:创建该批次的员工的staffId, groupId:批次号,reserveDt:更新后的预约时间,
	 * dealFlag:标志位，取值为“cancel（取消）”或"update（修改）"
	 * @author ZhangYu
	 */
	var _batchUpdateConfirm = function(){

		var reserveDt = $("#reserveDt_dialog").val();
		var groupId = $("#groupId_dialog").val();
		//var staffId = $("#staffId_dialog").val();
		var areaId = $("#areaId_dialog").val();
		
		if(groupId == null || groupId == "" || groupId == undefined){
			$.alert("提示","批次号为空，无法进行操作，请刷新页面或稍后再试！");
			return;
		}
		/*if(staffId == null || staffId == "" || staffId == undefined){
			$.alert("提示","受理工号为空，无法进行操作，请刷新页面或稍后再试！");
			return;
		}*/
		/*if(areaId == null || areaId == "" || areaId == undefined){
			$.alert("提示","地区ID为空，无法进行操作，请刷新页面或稍后再试！");
			return;
		}*/
		if(reserveDt == null || reserveDt == "" || reserveDt == undefined){
			$.alert("提示","预约时间为空，无法进行操作，请刷新页面或稍后再试！");
			// return;
		}
		var param = {
				"reserveDt":reserveDt,//预约时间
				"groupId":groupId,// 批次号
				//"staffId":staffId,// 创建该批次的员工的staffId
				"areaId":areaId
		};
		param["dealFlag"] = "update";
		var url=contextPath+"/order/batchOrder/batchOperate";
		$.callServiceAsJson(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在操作,请稍等....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if (response.code == 0) {
					easyDialog.close();
					$.alert("提示",response.data);
				}else if (response.code == -2) {
					$.alertM(response.data);
				}else{
					$.alert("提示","操作失败!");
				}
				//easyDialog.close();
				//刷新页面
				//self.location.reload();
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	/**
	 * 进度查询，获取数据列表
	 * @param statusCd:受理状态(可空); orderStatus:订单状态(可空); groupId:批次号(不可空); batchType:受理类型(不可空)
	 * @author ZhangYu
	 */
	var _batchProgressQueryList = function(pageIndex){
		var groupId = $("#groupId_dialog").val();
		var batchType = $("#batchType_dialog").val();
		
		if(groupId == null || groupId == "" || groupId == undefined){
			$.alert("提示","批次号为空，无法进行查询，请刷新页面或稍后再试！");
			return;
		}
		if(batchType == null || batchType == "" || batchType == undefined){
			$.alert("提示","受理类型为空，无法进行查询，请刷新页面或稍后再试！");
			return;
		}
		
		var statusCd = $("#statusCd_dialog").val();//受理状态
		var orderStatus = $("#orderStatus_dialog").val();//订单状态
		if(statusCd == null || statusCd == undefined)
			statusCd = "";
		if(orderStatus == null || orderStatus == undefined)
			orderStatus = "";
		
		var param = {
				"groupId":groupId,//批次号
				"batchType":batchType,//受理类型
				"statusCd":statusCd,//受理状态
				"orderStatus":orderStatus,//订单状态
				"pageIndex":pageIndex,
				"pageSize":"10"
		};
		var url=contextPath+"/order/batchOrder/batchProgressQueryList";
		$.callServiceAsHtml(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询,请稍等....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response||response.code != 0){
					 response.data='查询失败,稍后重试';
				}
				var content$=$("#progressQuerylist");
				content$.html(response.data);
				
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});	
		
		
	};
	
	/**
	 * 批次进度查询，查询某一批次的具体处理情况
	 * @author ZhangYu
	 */
	var _batchProgressQuery = function(groupId,batchType,pageIndex){
		
		if(groupId == null || groupId == "" || groupId == undefined){
			$.alert("提示","批次号为空，无法进行查询，请刷新页面或稍后再试！");
			return;
		}
		if(batchType == null || batchType == "" || batchType == undefined){
			$.alert("提示","受理类型为空，无法进行查询，请刷新页面或稍后再试！");
			return;
		}
		
		var param = {
				"groupId":groupId,//批次号
				"batchType":batchType//受理类型
		};
		var url=contextPath+"/order/batchOrder/batchProgressQuery";
		$.callServiceAsHtml(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询,请稍等....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				$("#batchProgressQuery_dialog").html(response.data);
				easyDialog.open({
					container : "batchProgressQuery_dialog"
				});
				
				//初始化[进度查询]页面的订单状态 orderStatus
				var param = {"attrSpecCode":"EVT-0002"};
				$.callServiceAsJson(contextPath+"/staffMgr/getCTGMainData",param,{
					"done" : function(response){
						if(response.code==0){
							var data = response.data ;
							if(data!=undefined && data.length>0){
								for(var i=0;i<data.length;i++){
									var busiStatus = data[i];
									$("#orderStatus_dialog").append("<option value='"+busiStatus.attrValueCode+"' >"+busiStatus.attrValueName+"</option>");
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
				//初始化[进度查询]页面的[受理状态] statusCd
				param = {"attrSpecCode":"BATCH_PROD_GEN_CO_STATUS"} ;
				$.callServiceAsJson(contextPath+"/staffMgr/getCTGMainData",param,{
					"done" : function(response){
						if(response.code==0){
							var data = response.data ;
							if(data!=undefined && data.length>0){
								for(var i=0;i<data.length;i++){
									var busiStatus = data[i];
									$("#statusCd_dialog").append("<option value='"+busiStatus.attrValueCode+"' >"+busiStatus.attrValueName+"</option>");
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
				
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});	
	};
	
	/**
	 * 批次信息查询
	 */
	var _batchOrderQueryList = function(pageIndex){
		var groupId = $.trim($("#groupId").val());//批次号
		var batchStatusCd = $("#batchStatusCd").val();//批次处理状态
		var templateType = $("#templateType").val();//受理类型
		var startDt = $("#startDt").val();
		var endDt = $("#endDt").val();
		var reserveDt = $("#p_reserveDt").val();//预约时间
		var groupStatusCd = $("#groupStatusCd").val();//批次状态

		if(templateType == '' || templateType == null){
			$.alert("提示","种子订单受理类型不能为空!");
			return;
		}
		if(!/^[0-9]*$/.test(groupId)){
			$.alert("提示","批次号格式错误");
			return;
		}
		
		var param={
			"groupId":groupId,
			"dealStatus":batchStatusCd,
			"batchType":templateType,
			"groupStatusCd":groupStatusCd,
			"startDt":startDt,
			"endDt":endDt,
			"reserveDt":reserveDt,
			"pageIndex":pageIndex,
			"pageSize":"10"
		};
		
		//批量受理查询开关，暂时用于判断是否执行改造后的新代码(增加权限优化)
		if(CONST.BATCHORDER_FLAG.BATCHORDER_AUTH_FLAG == "Y"){
			//权限优化，增加地区和渠道
			var areaId = $("#p_areaId").val();
			var channelId = $("#p_channelId").val();
			var permissionsType = $("#permissionsType").val();
			
			if(areaId == '' || areaId == null){
				$.alert("提示","地区信息不能为空!");
				return;
			}
			
			param["areaId"] = areaId;
			
			if(permissionsType != "admin"){//非管理员(营业班长+营业员)必须选渠道
				if(channelId == '' || channelId == null){
					$.alert("提示","渠道信息不能为空!");
					return;
				}
				param["channelId"] = channelId;
			} else{
				param["channelId"] = (channelId == null) ? "" : channelId;
			}
			
		} else if(CONST.BATCHORDER_FLAG.BATCHORDER_AUTH_FLAG == "N"){//执行改造前的旧代码
			
		} else{
			return;
		}

		var url=contextPath+"/order/batchOrder/batchOrderQueryList";
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
				var content$=$("#batchImportlist");
				content$.html(response.data);
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	//批次信息查询->进度查询->导出Excel
	var _exportExcel = function(){
		var groupId = $("#groupId_dialog").val();
		var batchType = $("#batchType_dialog").val();
		
		if(groupId == null || groupId == "" || groupId == undefined){
			$.alert("提示","批次号为空，无法进行操作，请刷新页面或稍后再试！");
			return;
		}
		if(batchType == null || batchType == "" || batchType == undefined){
			$.alert("提示","受理类型为空，无法进行操作，请刷新页面或稍后再试！");
			return;
		}

		var url=contextPath+"/order/batchOrder/batchOrderExport?groupId="+groupId
															+"&batchType="+batchType
															+"&statusCd=''"
															+"&orderStatus=''"
															+"&pageIndex=''"
															+"&pageSize=''";
		
		$("#processQuery_action").attr("action", url);
		$("#processQuery_action").submit();
			
			
	};
	
	var _chooseArea = function(){
		var  permissionsType  = $("#permissionsType").val();
		if(permissionsType == "admin"){
			//order.area.chooseAreaTree("orderUndo/main","p_areaId_val","p_areaId",3);
			order.area.chooseAreaTree("batchOrder/batchImportQuery","p_areaId_val","p_areaId",3);
		}
			//order.area.chooseAreaTreeManger("orderUndo/main","p_areaId_val","p_areaId",3);
			//order.area.chooseAreaTreeAll("p_areaId_val","p_areaId",3);
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
		slideFailInfo:_slideFailInfo,
		//批量预开通相关操作优化 By ZhangyYu 2015-10-12
		chooseArea:_chooseArea,//批次信息查询，增加权限优化
		batchStatusQuery:_batchStatusQuery,//批量受理结果查询
		batchCancel:_batchCancel,//批次信息查询下的删除
		batchUpdateConfirm:_batchUpdateConfirm,//批次信息查询下的修改
		batchUpdateMain:_batchUpdateMain,//批次信息查询下的修改(弹出框)
		batchProgressQuery:_batchProgressQuery,//批次信息查询下的进度查询
		batchProgressQueryList:_batchProgressQueryList,//批次信息查询下的进度查询
		batchOrderQueryList:_batchOrderQueryList,//批次信息查询
		exportExcel:_exportExcel//导出Excel
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
	
	//批次信息查询页面精确查询，后台暂未支持
/*	$("#groupId").attr("disabled", true);
	
	$("#groupId_checkbox").change(function(){
		if($("#groupId_checkbox").attr("checked")){
			$("#startDt").attr("disabled", true);
			$("#endDt").attr("disabled", true);
			$("#p_reserveDt").attr("disabled", true);
			$("#groupId").attr("disabled", false);
		} else{
			$("#startDt").attr("disabled", false);
			$("#endDt").attr("disabled", false);
			$("#p_reserveDt").attr("disabled", false);
			$("#groupId").attr("disabled", true);
		}
	});*/
	
	//时间段选择控件限制
	$("#startDt").off("click").on("click",function(){
		$.calendar({ format:'yyyy-MM-dd ',real:'#startDt',maxDate:$("#endDt").val() });
	});
	$("#endDt").off("click").on("click",function(){
		$.calendar({ format:'yyyy-MM-dd ',real:'#endDt',minDate:$("#startDt").val(),maxDate:'%y-%M-%d' });
	});
	$("#p_reserveDt").off("click").on("click",function(){
		//$.calendar({ format:'yyyy-MM-dd ',real:'#p_reserveDt',minDate:$("").val(),maxDate:'%y-%M-%d' });
		$.calendar({ format:'yyyy-MM-dd ',real:'#p_reserveDt',minDate:$("").val()});
	});
	
	//有文件导入时，自动清空页面提示
	$("#upFile").change(function(){
		$('#alertInfo').html("");
	});
		
});