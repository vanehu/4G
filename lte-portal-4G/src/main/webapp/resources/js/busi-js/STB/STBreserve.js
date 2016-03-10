/**
 * 天翼高清机顶盒预约
 */
CommonUtils.regNamespace("STB", "reserve");

STB.reserve = (function(){
	
	//切换预约类型
	var _changeReserveType = function(){
		if($("#STB_reserve_800000054").val()=="1"){//全款预约
			$("#STB_reserve_800000055 option").removeAttr("selected");
			$("#STB_reserve_800000055").find("option[value=2]").attr("selected", true);
			$("#STB_reserve_800000057").val("");
			$("#STB_reserve_800000057").removeAttr("disabled");
		}else if($("#STB_reserve_800000054").val()=="2"){//订金预约
			$("#STB_reserve_800000055 option").removeAttr("selected");
			$("#STB_reserve_800000055").find("option[value=1]").attr("selected", true);
			if($.trim($("#STB_reserve_800000056").val())!=""){
				$("#STB_reserve_800000057").val($.trim($("#STB_reserve_800000056").val())*100);
			}else{
				$("#STB_reserve_800000057").val("");
			}
			$("#STB_reserve_800000057").removeAttr("disabled");
		}else{
			$("#STB_reserve_800000055 option").removeAttr("selected");
			$("#STB_reserve_800000055").find("option[value=1]").attr("selected", true);
			$("#STB_reserve_800000057").val("0");
			$("#STB_reserve_800000057").attr("disabled", true);
		}
	};
	
	//切换预约内容
	var _changeReserveContent = function(){
		if($("#STB_reserve_800000055").val()=="1"){//1年服务费
			$("#STB_reserve_800000054 option").removeAttr("selected");
			$("#STB_reserve_800000054").find("option[value=2]").attr("selected", true);
			if($.trim($("#STB_reserve_800000056").val())!=""){
				$("#STB_reserve_800000057").val($.trim($("#STB_reserve_800000056").val())*100);
			}else{
				$("#STB_reserve_800000057").val("");
			}
			$("#STB_reserve_800000057").removeAttr("disabled");
		}else{
			$("#STB_reserve_800000054 option").removeAttr("selected");
			$("#STB_reserve_800000054").find("option[value=1]").attr("selected", true);
			$("#STB_reserve_800000057").val("");
			$("#STB_reserve_800000057").removeAttr("disabled");
		}
	};
	
	//提交预约订单
	var _commitOrder = function(){
		
		var inputComplete = true;
		var nullableInputs = $(".notNull");
		$.each(nullableInputs, function(i, nullableInput){
			if($.trim($(nullableInput).val())==""){
				inputComplete = false;
				return false;
			}
		});
		if(!inputComplete){
			$.alert("提示", "请将预约单信息填写完整");
			return;
		}
		
		$.confirm("信息","是否确定提交本次预约？", {
			yes : function(){
				
				var inputs = $(".STBreserveInput");
				var orderInfo = {
						serviceType : "101"
				};
				var _attrList = [];
				$.each(inputs, function(i, input){
					var attrSpecId = $(input).attr("id").split("_")[2];
					var attrValue = $.trim($(input).val());
					if(attrSpecId==800000051){
						orderInfo.certNumber = attrValue;
					}else if(attrSpecId==800000050){
						orderInfo.certType = attrValue;
					}else if(attrSpecId==800000049){
						orderInfo.custName = attrValue;
					}else if(attrSpecId==800000052){
						orderInfo.phoneNumber = attrValue;
					}else if(attrSpecId==800000056){
						orderInfo.reserveNumber = attrValue;
					}else if(attrSpecId==800000054){
						orderInfo.reserveType = attrValue;
					}else{
						if(attrValue!=null && attrValue!=""){
							var attrItem = {
									attrId : attrSpecId,
									value : attrValue
							};
							_attrList.push(attrItem);
						}
					}
				});
				orderInfo.attrList = _attrList;
				
				$.callServiceAsJson(contextPath+"/STB/reserve/commitOrder", orderInfo, {
					"before" : function(){
						$.ecOverlay("<strong>处理中，请稍等....</strong>");
					},
					"always" : function(){
						$.unecOverlay();
					},	
					"done" : function(response){
						if(response.code==0){
							$("#reserveFlowNum").html(response.data);
							$("#STBreserveOrderForm").hide();
							$("#reserveSuccessPage").show();
						}
						else{
							if(response.code==1){
								$.alert("提示", response.data);
								return;
							}
							else if(response.code==-2){
								$.alertM(response.data);
							}
						}						
					}
				});
				
			},
			no : function(){
				return;
			}
		},"question");
		
	};
	
	//受理完成，返回预约填单并重置
	var _fin = function(){
		
		$(".STBreserveInput").val("");
		
		//默认使用全款预约及其对应的绑定预约内容
		$("#STB_reserve_800000054 option").removeAttr("selected");
		$("#STB_reserve_800000054").find("option[value=1]").attr("selected", true);
		$("#STB_reserve_800000055 option").removeAttr("selected");
		$("#STB_reserve_800000055").find("option[value=2]").attr("selected", true);
		
		//预约数量默认1
		$("#STB_reserve_800000056").val("1");
		
		$("#reserveSuccessPage").hide();
		$("#STBreserveOrderForm").show();
		$("#reserveFlowNum").html("");
	};
	
	return {
		changeReserveType : _changeReserveType,
		changeReserveContent : _changeReserveContent,
		commitOrder : _commitOrder,
		fin : _fin
	};
	
})();

//初始化
$(function(){
	
	//默认使用全款预约及其对应的绑定预约内容
	$("#STB_reserve_800000054 option").removeAttr("selected");
	$("#STB_reserve_800000054").find("option[value=1]").attr("selected", true);
	$("#STB_reserve_800000055 option").removeAttr("selected");
	$("#STB_reserve_800000055").find("option[value=2]").attr("selected", true);
	
	//限制预约数只能输入正整数
	$("#STB_reserve_800000056").attr("onkeyup", "this.value=this.value.replace(/[^1-9]/g,'')").attr("onafterpaste", "this.value=this.value.replace(/[^1-9]/g,'')");
	//预约数量默认1
	$("#STB_reserve_800000056").val("1");
	//限制预约金只能输入非负整数
	$("#STB_reserve_800000057").attr("onkeyup", "this.value=this.value.replace(/[^0-9]/g,'')").attr("onafterpaste", "this.value=this.value.replace(/[^0-9]/g,'')");
	
	$("#STB_reserve_800000054").change(function(){
		STB.reserve.changeReserveType();
	});
	
	$("#STB_reserve_800000055").change(function(){
		STB.reserve.changeReserveContent();
	});
	
});