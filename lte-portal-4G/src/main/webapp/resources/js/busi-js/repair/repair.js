CommonUtils.regNamespace("user", "repair");
user.repair = (function(){
	var acctNbr = "";
	var areaId = "";
	//查询修复的数据列表
	var _init=function(){
	//客户定位查询按钮
	 $('#userForm').off().bind('formIsValid', function(event, form) {
		 _queryUserInfo();
      }).ketchup({bindElement:"usersearchbtn2"});
	 };
	//查询用户信息
	var _queryUserInfo=function(){
		$("#certTypeName").html("");
		$("#certTypeName2").html("");
		$("#certType2").html("");
		$("#certType").html("");
		$("#certNum2").html("");
		$("#certNum").html("");
		$("#certAddress").html("");
		$("#certAddress2").html("");
		$("#custAddress2").html("");
		$("#custAddress").html("");
		$("#custName").html("");
		$("#custName2").html("");
		$("#phoneNum").html("");
		$("#phoneNum2").html("");
		
		
		var url=contextPath+"/user/repair/queryRepairList";
		areaId=$.trim($("#p_cust_areaId").val());
		acctNbr=  $("#p_phone_num").val();
		var param={
				 "userInfoFive":{
					  "ContractRoot":{
						   "SvcCont":{
							     "lanId":areaId,
								 "phoneNum":acctNbr,
								 "traceId":UUID.getDataId()
						    },
						    "TcpCont": {
						    	
						    }
					    }
				   },
                  "userInfo":{
			            "areaId":areaId,
						"acctNbr":acctNbr,
						"phoneNum":acctNbr,
						"queryType":"1,2,3,4,5",
						"soNbr":UUID.getDataId(),
						"type":"2"
				    }
		};
		$.callServiceAsHtmlGet(url,{strParam:JSON.stringify(param)},{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if (response.code == 0) {
					var content$=$("#repairlist");
					content$.html(response.data);
					if($("#certType").text() !=""){
						$("#phoneNum").html(acctNbr);
					}
					
					var certType2 = $("#certType2").text();
					var certType = $("#certType").text();
					var certNum2 = $("#certNum2").text();
					var certNum = $("#certNum").text();
					if(certType2 == "" && certType =="" && certNum2 == "" && certNum ==""  ||  $("#isRepairFive").val() == "y"
						|| $("#isSucceed").val() != "y"){
						 $("#btnRepair").css("display","none");
					}
				}else if (response.code == -2) {
					$("#btnRepair").css("display","none");
					$.alertM(response.data);
					
				}else{
					$("#btnRepair").css("display","none");	
					$.alert("提示","查询数据失败!");
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	}
	//修改用户信息
	var _updateUserInfo=function(){
		var certType = $("#certType").text(); 
		if($("#certType").text() != "" && $("#certType2").text() != ""){
			certType = $("#certType2").text(); 
		}
		
		
		var certNum = $("#certNum").text(); 
		if($("#certNum").text() != "" && $("#certNum2").text() != ""){
			certNum = $("#certNum2").text(); 
		}
		
		
//		 if(confirm("您确认要修复数据吗？")){
           var params = {
						    "ContractRoot":{
							   "SvcCont":{
								   "certPhoneNumRel": {
									"custName":$("#custName").text() == ""? $("#custName2").text() : $("#custName").text(),
									"certAddress":$("#certAddress").text() == ""? $("#certAddress2").text() : $("#certAddress").text(),
									"certType":$("#certType").text() == ""? $("#certType2").text() : certType,
									"certNum":$("#certNum").text() == ""? $("#certNum2").text() : certNum,
									"custAddress":$("#custAddress").text()== ""? $("#custAddress2").text() : $("#custAddress").text(),
									"phoneNum":acctNbr,
									"lanId":areaId,
									"certType1":$("#certType").text(), //省份的值，修改后的值
									"certNum1":$("#certNum").text(),  //省份的值，修改后的值
									"actionType" : $("#certType").text() == ""? "DEL" : $("#certType2").text() == ""? "ADD" : ""
								  },
								  "isRepairFive" : $("#isRepairFive").val()
								 
							},
							"TcpCont": {
						    	
						    }
						},
                       
                 };
				var url=contextPath+"/user/repair/updateUserInfo";
				$.callServiceAsJson(url, params, {
					"before":function(){
						$.ecOverlay("<strong>正在修复数据中,请稍等会儿....</strong>");
					},"always":function(){
						$.unecOverlay();
					},	
					"done" : function(response){
						if (response.code == 0) {
							$.alert("提示","修复数据成功！");
							_queryUserInfo();
						}else if (response.code == -2) {
							$.alertM(response.data);
						}else{
							if(response.data){
								$.alert("提示",response.data);
							}else{
								$.alert("提示","修复数据失败!");
							}
							
						}
					},
					fail:function(response){
						$.unecOverlay();
						$.alert("提示","请求可能发生异常，请稍后再试！");
					}
				});
//			}
	};
	
	return {
		init 			:_init,
		updateUserInfo              :_updateUserInfo
	};
})();
//初始化
$(function(){
	user.repair.init();
});