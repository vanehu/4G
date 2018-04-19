CommonUtils.regNamespace("order", "protocol");

order.protocol = (function(){
	var protocolId;
    //  查询条件： 客户名称 \ 协议编码
	var _queryProtocol = function(page) {
		var curPage = 1 ;
		if(page>0){
			curPage = page ;
		}
		var custName = $.trim($("#custName").val());
		var protSoNumber = $.trim($("#protSoNumber").val());
		if(custName =="" && protSoNumber ==""){
			$.alert("提示","客户名称和协议编码必须输入一项！");
			return;
		}
		//var params={"custName":111,"protocolId":837000147868,"curPage":curPage,
		//		"pageSize":10};
		var params={"custName":custName,"protSoNumber":protSoNumber,"curPage":curPage,
				"pageSize":10};
		var url = contextPath+"/protocol/queryProtocolList";
		$.callServiceAsHtmlGet(url,params, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"done" : function(response){
				if(!response){
					response.data='<li><a href="#" class="ft">暂无协议</a></li>';
				}
				if (response.code == -2) {
					$.alertM(response.data);
					return;
				}else if(response.code != 0) {
					$.alert("提示","response.code");
					return;
				}
				$("#proList").html(response.data).fadeIn();   // 协议子  查询
			},
			"always":function(){
				$.unecOverlay();
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","协议加载失败，请稍后再试！");
			}
		});
	};
	//销售品 下拉框
	var _queryOfferSpec = function() {
		var url=contextPath+"/protocol/queryProtocolOffer";
		var param={};
		var response = $.callServiceAsJsonGet(url,param);
		if (response.code==0) {
			if(response.data){
				var offerList= response.data;
				var $sel = $("#prodOfferId");
				if(offerList!=null){
					$.each(offerList,function(){
						var $option = $('<option value="'+this.prodOfferId+'">'+this.prodOfferName+'</option>');
						$sel.append($option);
					});
				}
			}
		}else if(response.code == -2){
			$.alertM(response.data);
			return;
		}else{
			$.alert("提示","销售品加载失败，请稍后再试！");
		}
	};
	
	var _setProtocol = function(obj) {
	    $("#staff_list_body tr").removeClass("plan_select");
		$("#staff_list_body tr").children(":first-child").html("");
		$(obj).addClass("plan_select");
	    var nike="<i class='select'></i>";
		$(obj).children(":first").html(nike);
		protocolId = obj.id;
	};
	
	//协议添加
	var _addProtocol = function(params) {
		var prtotNbr = $.trim($("#prtotNbr").val());
		if(prtotNbr == ""){
			$.alert("提示","协议号为空,获取协议号服务异常！");
			return;
		}
		var params = {"protInfo":{
						"custName":$.trim($("#custName").val()),
						"protSoNumber":$.trim($("#prtotNbr").val()),
						"protocolName":$.trim($("#protocolName").val()),
						"prodOfferId":$.trim($("#prodOfferId").val()),
//						"staffId":"",
//						"channelId":"",
//						"protSoNumber":"",
//						"protocolRecordDate":""	,
						"protocolBeginDate":$.trim($("#protocolBeginDate").val().replace(/-/g,'')),	
						"protocolEndDate":$.trim($("#protocolEndDate").val().replace(/-/g,'')),		
						"custManagerInfo":$.trim($("#dealer_99").attr("staffId")),
						"protocolContent":$.trim($("#protocolContent").val())
						}
		};
		var url = contextPath+"/protocol/addProtocol";
		$.callServiceAsJson(url,params, {
			"before":function(){
				$.ecOverlay("<strong>正在保存中,请稍等...</strong>");
			},
			"done" : function(response){
				if(!response){
					response.data='<li><a href="#" class="ft">暂无协议</a></li>';
				}
				if (response.code == -2) {
					$.alertM(response.data);
					return;
				}else if(response.code != 0) {
					$.alert("提示","response.code");
					return;
				}
				$.alert("提示","添加成功！");
				$("#protobtn").removeClass("btna_o").addClass("btna_g");
				$("#protobtn").off("click");
			},
			"always":function(){
				$.unecOverlay();
			},
			"fail":function(response){
				$.unecOverlay();
				$.alert("提示","协议加载失败，请稍后再试！");
			}
		});
	};
	// 销售品 详情
	var _queryProtocolOfferInfo=function(pageIndex){
		var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
		//var protocolId = $.trim($("#protocolId").text());
		var params = {"protocolId":protocolId,"curPage":curPage,
				"pageSize":10};
		var url = contextPath+"/protocol/queryProtocolOfferDetail";
		$.callServiceAsHtmlGet(url,params, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"done" : function(response){
				if(!response){
					response.data='<li><a href="#" class="ft">未获取到协议下销售品详情！</a></li>';
				}
				if (response.code == -2) {
					$.alertM(response.data);
					return;
				}else if(response.code != 0) {
					$.alert("提示","未获取到协议下销售品详情！");
					return;
				}
				$("#proSubList").html(response.data).fadeIn();   // 协议子  查询
				$("#scroll").scrollTop('400');
			
			//	$("#d_query").scrollTop = $("#proSubList").scrollHeight;
			},
			"always":function(){
				$.unecOverlay();
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","协议详情加载失败，请稍后再试！");
			}
		});
	};
	
	return {
		queryProtocol:_queryProtocol,//根据客户名称查询协议  ？？？ 功能产品？？？
		setProtocol:_setProtocol,//根据客户名称查询协议  ？？？ 功能产品？？？
		addProtocol:_addProtocol, //增加协议
		queryProtocolOfferInfo : _queryProtocolOfferInfo,
		queryOfferSpec:_queryOfferSpec  // 返回关联的销售品
	};
})();
//初始化
$(function(){
	order.protocol.queryOfferSpec();
	$('#protCreateForm').off().bind('formIsValid',function(event) {
		order.protocol.addProtocol();
    }).ketchup({bindElement:"protobtn"});
});
