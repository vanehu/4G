/**
 * 反销帐
 * 
 * @author jiangrh
 */
CommonUtils.regNamespace("bill", "reversewriteoffcash");

bill.reversewriteoffcash = (function(){

	//查询销帐
	var _queryWriteOffCash = function(){
		if($("#p_areaId_val").val()==""){
			$.alert("提示","请选择所属地区");
			return;
		}		
		if(!$("#p_areaId").attr("areaCode") || $("#p_areaId").attr("areaCode")==""){
			$.alert("提示", "请选择本地网（地市级）地区");
			return;
		}
		if(CONST.APP_DESC==0){
			if(!CONST.LTE_PHONE_HEAD.test($.trim($("#phoneNumber").val()))){
				$.alert("提示","号码输入有误！");
			  	return;
			}
		}else{
			if(!CONST.MVNO_PHONE_HEAD.test($.trim($("#phoneNumber").val()))){
				$.alert("提示","号码输入有误！");
			  	return;
			}
		}
		$("#t_phoneNumber").val($("#phoneNumber").val());
		var param = {
			areaId : $("#p_areaId").val(),
			areaCode : $("#p_areaId").attr("areaCode"),
			phoneNumber : $("#t_phoneNumber").val(),
			billingCycleId : $("input:radio:checked").val()
		};
		getWriteOffCash(param);
	};
	
	var getWriteOffCash = function(param){
		
		$.callServiceAsJson(contextPath+"/bill/queryWriteOffCash", param, {
			"before":function(){
				$.ecOverlay("销帐查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				if(!response){
					response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>no data return, please try reload.</strong></div>';
				}
				if (response.code==0) {
					//$("#billList").html(response.data).show();
					var offcash = response.data;
					var html = "";
					if(offcash.length==0){
						html+="<tr><td align='center' style='font-size:16px; height:30px' colspan='8'>对不起，没有查询到销帐信息！</td></tr>";
					}else{
						for(var i=0;i<offcash.length;i++){
							var billingCycleId = "" ;
							var offcash_row = offcash[i] ;
							var billingCycleGroup = offcash_row.billingCycleGroup ;
							if(billingCycleGroup.billingCycleId){
								billingCycleId = billingCycleGroup.billingCycleId ;
							}else{
								for(var j=0;j<billingCycleGroup.length;j++){
									if(j==0){
										billingCycleId = billingCycleGroup[0].billingCycleId ;
									}else{
										billingCycleId = billingCycleId + "," + billingCycleGroup[0].billingCycleId ;
									}
								}
							}
							html+="<tr>"+
			                "<td align='center'>"+billingCycleId+"</td>"+
			                "<td align='center' id='billSerialNbr'>"+offcash[i].billSerialNbr+"</td>"+
			                "<td align='center' id='paymentSerialNbr'>"+offcash[i].paymentSerialNbr+"</td>"+
			                "<td align='center'>"+offcash[i].sumCharge/100+"</td>"+
			                "<td align='center'>"+offcash[i].previousCharge/100+"</td>"+
			                "<td align='center' style='display:none;' id='phoneNum'>"+param.phoneNumber+"</td>"+
			                "<td align='center' style='display:none;' id='areaId'>"+param.areaId+"</td>"+
			                "<td align='center' style='display:none;' id='areaCode'>"+param.areaCode+"</td>"+
			                "<td align='center'>"+offcash[i].currentCharge/100+"</td>";
			                //"<td align='center'>未销帐</td>"+
							 var busiType = $("#busiType").val();
							if(busiType == '102'){
			                	html+="<td align='center'><input type='button' value='打印发票' class='numberSearch' onclick='bill.writeOffPrint.prepareInvoiceInfo("+ offcash[i].paymentSerialNbr +","+ param.phoneNumber + ",0,0)'/></td></tr>";
			                }
			                else{
			                	html+="<td align='center'><input type='button' value='反销帐' class='numberSearch' onclick='bill.reversewriteoffcash.reverseCash(this,"+param.billingCycleId+")' /></td></tr>";
			                }
			                	
						}
						//html+="<tr><td align='left' style='font-size:16px; height:30px' colspan='8'>"+
      					//"<a class='btn_h30'  style='margin:10px 0px 10px 45px;' href='javascript:bill.reversewriteoffcash.reverseCash()'>"+
      					//	"<span style='padding-right:27px;'>确认反销帐</span></a></td></tr>";
					}
					$("#writeoffcashlist").html(html);
				}else if(response.code == -2){
					$.alertM(response.data);
				}else{
					$.alert("提示", response.data);
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	//确认返销帐	
	var _reverseCash = function(obj, _billingCycleId){
//		var _serialNbr = $(obj).parent().parent().children("#billSerialNbr").text();//使用销账流水时开启
		var _serialNbr = $(obj).parent().parent().children("#paymentSerialNbr").text();//使用付款流水时开启
		var _phoneNumber = $(obj).parent().parent().children("#phoneNum").text();
		var _areaId = $(obj).parent().parent().children("#areaId").text();
		var _areaCode = $(obj).parent().parent().children("#areaCode").text();
		var params = {
			phoneNumber : _phoneNumber,
			serialType : "0",
			serialNbr : _serialNbr,
//			areaId : _areaId,
			areaCode : _areaCode,
			billingCycleId : _billingCycleId
		};
		$.callServiceAsJson(contextPath+"/bill/reverseWriteOffCash", params, {
			"before":function(){
				$.ecOverlay("销帐查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				if(!response){
					response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>no data return, please try reload.</strong></div>';
				}
				if (response.code==0) {
					var returnInfo = response.data;					
					if(returnInfo!=null){
						ec.form.dialog.createDialog({
							width:400,
							height:200,
							"id":"-writeoffcash",
							"initCallBack":function(dialogForm,dialog){							
								$("#offcash").html(returnInfo.reverseAmount/100);
								$("#serialnbr").html(returnInfo.reverseSerialNbr);
								$("#reversedate").html(returnInfo.reverseDate);
							},
							"submitCallBack":function(dialogForm,dialog){},
							closeCallBack:function(dialog){}
						});
					}
					else{
						$.alert("信息", "反销账成功");
					}
					//反销账成功后刷新销账记录
					var param = {
							areaId : _areaId,
							areaCode : _areaCode,
							phoneNumber : _phoneNumber,
							billingCycleId : _billingCycleId
						};
					getWriteOffCash(param);
				}else if(response.code == -2){
					$.alertM(response.data);
				}else{
					$.alert("提示", response.data);
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	
	
	return{
		queryWriteOffCash : _queryWriteOffCash,
		reverseCash : _reverseCash
	};
	
})();

//初始化
$(function(){
	 var busiType = $("#busiType").val();
	 if(busiType == '102'){
		$("h2").html("销账历史记录<span class='showhide'></span>");
	 }
			
});

