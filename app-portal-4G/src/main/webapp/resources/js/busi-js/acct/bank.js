
CommonUtils.regNamespace("bank", "main");


/**
 *订单查询.
 */
bank.main = (function(){
	//var areaHasAll = "N" ;
	var _init = function(){
		//执行查询
		$("#bt_bankQry").off("click").on("click",function(){_queryBankList(1);});
		
	};
	//创建银行信息确认按钮
	var _createbanksussbtn = function(){
	$('#bankCreateForm').off().bind('formIsValid',function(event) {
		createBankInfo = {
				name : $.trim($("#c_bank_name").val()),
				simpleSpell :  $.trim($("#c_bank_simpleSpell").val()),
				commonRegionId : $("#p_u_areaId").val(),
				description : $.trim($("#c_bank_description").val()),
				accountPrefix : $.trim($("#c_bank_accountPrefix").val())
			};
		easyDialog.close();
		var bank = {};
		var param = {};
		    bank = 
		    		{
		    	        parentBank: "1",
		    	        name: createBankInfo.name,
		    	        simpleSpell: createBankInfo.simpleSpell,
		    	        commonRegionId: createBankInfo.commonRegionId,
		    	        manageCode: "12345"
		    	    };
		param = { bank : bank};
		params=JSON.stringify(param);
			var url=contextPath+"/acct/bankSave";
			var response = $.callServiceAsJson(url, params, {});
			var msg="";
			if (response.code == -2) {
				return;
			}else
			if (response.code == 0) {
				_queryBankList(1);
				$.alert("提示","银行详情保存成功!");

				$("#bt_area_config").attr("toAttr","Update");
				$("#c_bank_name").val("");
				$("#c_bank_simpleSpell").val("");
				$("#c_bank_description").val("");
				$("#c_bank_accountPrefix").val("");
			}else{
				msg="提交失败";
				$.alert("提示","银行详情保存失败!");
				return false;
			}
	}).ketchup({bindElement:"createbanksussbtn"});
	};
	//更新银行信息确认按钮
	var _updatebanksussbtn = function(){
	$('#bankCreateForm').off().bind('formIsValid',function(event) {
		createBankInfo = {
				bankId :$("#c_bankId").val(),
				name : $.trim($("#c_bank_name").val()),
				simpleSpell :  $.trim($("#name").val()),
				commonRegionId : $("#p_u_areaId").val(),
				description : $.trim($("#c_bank_description").val()),
				accountPrefix : $.trim($("#c_bank_accountPrefix").val())
			};
		easyDialog.close();
		var bank = {};
		var param = {};
		    bank = 
		    		{
		    	        parentBank: "1",
		    	        bankId:createBankInfo.bankId,
		    	        name: createBankInfo.name,
		    	        simpleSpell: createBankInfo.simpleSpell,
		    	        commonRegionId: createBankInfo.commonRegionId,
		    	        manageCode: "12345"
		    	    };
		param = { bank : bank};
		params=JSON.stringify(param);
			var url=contextPath+"/acct/updateBank";
			var response = $.callServiceAsJson(url, params, {});
			var msg="";
			if (response.code == -2) {
				return;
			}else if (response.code == 0) {
				_queryBankList(1);
				$.alert("提示","银行详情更新成功!");
				$("#bt_area_config").attr("toAttr","Update");
				$("#c_bank_name").val("");
				$("#c_bank_simpleSpell").val("");
				$("#c_bank_description").val("");
				$("#c_bank_accountPrefix").val("");
			}else{
				msg="提交失败";
				$.alert("提示","银行详情更新失败!");
				return false;
			}
	}).ketchup({bindElement:"createbanksussbtn"});
	};
	//创建银行窗口
	var _showBankCreate = function(scope) {
		easyDialog.open({
			container : 'bank_add'
		});
		$("#bt_area_config").attr("toAttr","Update");
		_createbanksussbtn();
		$("#bankaddclose").off("click").on("click",function(event){
			easyDialog.close();
			$("#c_bank_name").val("");
			$("#c_bank_simpleSpell").val("");
			$("#c_bank_description").val("");
			$("#c_bank_accountPrefix").val("");
			if($.ketchup)
				$.ketchup.hideAllErrorContainer($("#bankCreateForm"));
		});
	};
	//更新银行窗口
	var _showBankUpdate = function(bankId) {
		easyDialog.open({
			container : 'bank_add'
		});
		$("#bt_area_config").attr("toAttr","Update");
		$("#c_bank_name").val($("#"+bankId).attr("name"));
		$("#c_bank_simpleSpell").val($("#"+bankId).attr("simpleSpell"));
		$("#c_bank_description").val($("#"+bankId).attr("description"));
		$("#c_bank_accountPrefix").val($("#"+bankId).attr("accountPrefix"));
		$("#p_u_areaId_val").val($("#"+bankId).attr("regionname"));
		$("#c_bankId").val(bankId);
		$("#p_u_areaId").val($("#"+bankId).attr("commonregionid"));
		
		_updatebanksussbtn();
		$("#bankaddclose").off("click").on("click",function(event){
			easyDialog.close();
			$("#c_bank_name").val("");
			$("#c_bank_simpleSpell").val("");
			$("#c_bank_description").val("");
			$("#c_bank_accountPrefix").val("");
			if($.ketchup)
				$.ketchup.hideAllErrorContainer($("#bankCreateForm"));
		});
	};
	
	
	//查询
	var _queryBankList = function(pageIndex){
		if(!$("#p_bank_areaId").val()||$("#p_bank_areaId").val()==""){
			$.alert("提示","请选择'地区'再查询");
			return ;
		}
		var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
		var bank={}
		bank={
		        name: $("#p_bandkname").val().replace(/-/g,''),
		        bankId: "",
		        simpleSpell: $("#p_simpleSpell").val().replace(/-/g,''),
		        commonRegionId:""
		        //commonRegionId:$("#p_areaId").val()//need modify
		    };
		var param = {bank:bank,
				nowPage:curPage,
				pageSize:10
		};
		
		$.callServiceAsHtmlGet(contextPath+"/acct/bankList",{strParam:JSON.stringify(param)},{
			"before":function(){
				$.ecOverlay("订单查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					 response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>not data return,please try reload again.</strong></div>';
				}
				var content$=$("#bank_list");
				content$.show().addClass("pageright").removeClass("in out").addClass("out");
				setTimeout(function(){
					content$.html(response.data).removeClass("cuberight in out").addClass("pop in");
					setTimeout(function(){
						content$.removeClass("pop in out");
					},500);
				},500);
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	//查询地区选择
	var _chooseAllArea = function(){
		order.area.chooseAreaTreeAll("p_bank_areaId_val","p_bank_areaId",3);
	};
	//新增与更新地区选择
	var _choosecreateAllArea = function(){
		order.area.chooseAreaTreeAll("p_u_areaId_val","p_u_areaId",3);
	};
	return {
		queryBankList:_queryBankList,
		init:_init,
		showBankCreate :_showBankCreate,
		chooseAllArea :_chooseAllArea,
		choosecreateAllArea :_choosecreateAllArea,
		showBankUpdate :_showBankUpdate
	};
	
})();
//初始化
$(function(){
	
	bank.main.init();
	
});