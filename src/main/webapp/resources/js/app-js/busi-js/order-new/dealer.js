/**
 * 发展人管理
 * 
 * @author yanghm
 * date 2016 10-26
 */
CommonUtils.regNamespace("order","dealer");

/** 发展人对象*/
order.dealer = (function() {
	var _isChange = false;
	var  _accNbr;
	
	//初始化发展人
	var _initDealer = function() {
		OrderInfo.order.dealerTypeList = [ {
			"PARTYPRODUCTRELAROLECD" : "40020005",
			"NAME" : "第一发展人"
		}, {
			"PARTYPRODUCTRELAROLECD" : "40020006",
			"NAME" : "第二发展人"
		}, {
			"PARTYPRODUCTRELAROLECD" : "40020007",
			"NAME" : "第三发展人"
		} ];
		if (OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 2
				|| OrderInfo.actionFlag == 14 || OrderInfo.actionFlag == 112 || OrderInfo.actionFlag == 201 || OrderInfo.actionFlag == 6) { // 新装业务，套餐变更需要主套餐发展人
			var objInstId = OrderInfo.offerSpec.offerSpecId;
			var objId = objInstId + "_" + OrderInfo.SEQ.dealerSeq;
			var $select = $("#dealerType");
			$.each(OrderInfo.order.dealerTypeList, function() {
				$select.append("<option value='" + this.PARTYPRODUCTRELAROLECD+ "' >" + this.NAME + "</option>");
			});
			 _addDealer(OrderInfo.staff.staffName,OrderInfo.staff.staffId,cur_channelCode,40020005);			
			
		}
		if (OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 2 || OrderInfo.actionFlag == 3 || OrderInfo.actionFlag == 19
				|| OrderInfo.actionFlag == 14 || OrderInfo.actionFlag == 22 || OrderInfo.actionFlag == 9 || OrderInfo.actionFlag == 20 || OrderInfo.actionFlag == 21 || OrderInfo.actionFlag == 6){
			$.each(AttachOffer.addTerminalList,function(){
				var $ul = $("#tab-change-list2");
				var $li = $("#terminalDiv_"+this.prodId);
				AttachOffer.terminalDiv.appendTo($li);
				$li.show();
				$('#tab-change-list2').css('height','4.62rem');
			});
			$("#orderIdentidiesTypeCd").empty();
			cust.jbrcertTypeByPartyType(1,"orderIdentidiesTypeCd");
			order.dealer.initJbrTab();
			order.broadband.init_select();
			try{
				if(!ec.util.isObj(OrderInfo.curIp)){
					common.getMobileIp("cust.getIp");
				}
			}catch(err){
					
			}
		}
//		 $('#tab-change-list2').height($('#tab-li2').height());
	};
	
	var _initJbrTab = function() {
		if(ec.util.isObj(OrderInfo.jbr.partyName)){
			cust.isSameOne = true;
			$("#jbrName").html(OrderInfo.jbr.partyName);
			$("#jbrName").removeClass("font-secondary");
			$("#jbrTabDiv").show();
			$("#jbrFormdata").hide();
			$("#jbrself").show();
			  $("#tab1_jbr").off("click").on("click",function(){
				  if(!cust.isSameOne){
					  OrderInfo.virOlId = "";
				  }
				  cust.isSameOne = true;
				 
					$("#jbrFormdata").hide();
					$("#jbrself").show();
					$("#tab2_jbr").removeClass("active");
					$("#tab1_jbr").addClass("active");
					if(OrderInfo.actionFlag == 9){
						OrderInfo.jbr.custId = cust.readIdCardUser.custId;
						OrderInfo.jbr.partyName = cust.readIdCardUser.partyName;//经办人名称
						OrderInfo.jbr.areaId = OrderInfo.staff.areaId;//经办人地区
						OrderInfo.jbr.addressStr = cust.readIdCardUser.addressStr;//经办人地址
						OrderInfo.jbr.identityCd = cust.readIdCardUser.identityCd;//证件类型
						OrderInfo.jbr.identityNum = cust.readIdCardUser.idCardNumber;//证件号码
//						OrderInfo.jbr.identityPic = OrderInfo.cust.identityPic;
						cust.isOldCust = false;
						if(cust.readIdCardUser.newUserFlag != "true"){
							cust.isOldCust = true;
						}
					} else {
						OrderInfo.jbr.custId = OrderInfo.cust.custId;
						if(OrderInfo.cust.custId != "-1"){
							cust.isOldCust = true;
						} else {
							cust.isOldCust = false;
						}
						OrderInfo.jbr.partyName = OrderInfo.cust.partyName;
						OrderInfo.jbr.telNumber = OrderInfo.cust.telNumber;
						OrderInfo.jbr.addressStr = OrderInfo.cust.addressStr;
						OrderInfo.jbr.identityCd = OrderInfo.cust.identityCd;
						OrderInfo.jbr.mailAddressStr = OrderInfo.cust.mailAddressStr;
						OrderInfo.jbr.identityPic = OrderInfo.cust.identityPic;
						OrderInfo.jbr.identityNum = OrderInfo.cust.idCardNumber;
					}
					$("#jbrName").html(OrderInfo.jbr.partyName);
					
				});
				$("#tab2_jbr").off("click").on("click",function(){
					$("#jbrFormdata").show();
					$("#jbrself").hide();
					$("#tab1_jbr").removeClass("active");
					$("#tab2_jbr").addClass("active");
					if(cust.isSameOne){
						OrderInfo.virOlId = "";
						cust.clearJbrForm();
						OrderInfo.jbr.custId = undefined;
						OrderInfo.jbr.partyName = undefined;
						OrderInfo.jbr.telNumber = undefined;
						OrderInfo.jbr.addressStr = undefined;
						OrderInfo.jbr.identityCd = undefined;
						OrderInfo.jbr.mailAddressStr = undefined;
						OrderInfo.jbr.identityPic = undefined;
						OrderInfo.jbr.identityNum = undefined;
						$("#jbrName").html("");
					}
					cust.isSameOne = false;
				});
		}
	}
	
	function _showDealer(){
		$("#diqu").empty();
		var ad = ""+OrderInfo.staff.areaId;
		var areaId = ad.substring(0,3)+'0000';
	    _queryChildNode(areaId);
	    $("#dealerModal").modal("show");
	}
	function _queryChildNode(upRegionId) {
		var params = {
			'upRegionId' : upRegionId,
			'areaLevel' : 3,
			"areaLimit" : 0
		};
		$.callServiceAsJson(contextPath + "/app/orderQuery/areaTreeAllChilden",
				params, {
					"before" : function() {
					//	$.ecOverlay("地区加载中，请稍等...");
					},
					"done" : function(response) {
						if (response.data) {
							var selectHtml = "";
							var list = response.data;
							if (list.length > 0) {
								for(var i=0;i<list.length;i++){
									var ari = ""+OrderInfo.staff.areaId;
									ari = ari.substring(0,5)+'00'
									if(list[i].commonRegionId==ari){
										selectHtml=selectHtml+"<option  selected='selected' value='" +list[i].commonRegionId + "' zone_number='" +list[i].zoneNumber +"' name='" +list[i].regionName + "'>" + list[i].regionName + "</option>";
									}else{
										selectHtml=selectHtml+"<option value='" +list[i].commonRegionId + "' zone_number='" +list[i].zoneNumber +"' name='" +list[i].regionName + "'>" + list[i].regionName + "</option>";
									}
								}
								$("#diqu").html(selectHtml);
								order.broadband.init_select();//刷新select组件，使样式生效
							}
						}
					}
				});
	}

	//发展人-查询
	function _queryStaff(){
		if($("#staffCode").val().trim() == "" && $("#salesCode").val().trim() == "" && $("#staffName").val().trim() == ""){
			// $.alert("操作提示","工号和销售员编码不能都为空！");
			$('#staffCode').next('.help-block').removeClass('hidden');
			$('#salesCode').next('.help-block').removeClass('hidden');
			$('#staffName').next('.help-block').removeClass('hidden');
			$('#dealerModal-result').hide();
			return;
		}
		var $queryBtn = $('#qsd').button('loading');
		var param = {
				"dealerId":"dealer",
				"areaId":$("#diqu").val(),
				"code":$("#staffCode").val().trim(),
				"name":$("#staffName").val().trim(),
				"salesCode":$("#salesCode").val().trim(),//销售员编码
				"pageIndex":1,
				"pageSize":10
		};
		
		$.callServiceAsJson(contextPath + "/app/staffMgr/getStaffList2",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"done" : function(response){
				// $.unecOverlay();
				$queryBtn.button('reset');
				$("#overlay-modal .modal-backdrop").remove();
    		    $("#overlay-modal").modal('hide');
				if(!response){
					response.data='';
				}
				if(response.code==0){
					if(response.data.length == 0){
						$('#dealerList2').hide();
						// $.alert("操作提示","没有查询到该员工信息！");
						$('#dealerModal-result').show();
						$('#dealerModal').find('.choice-box').children('.help-block').addClass('hidden');
					}else{
						$('#dealerModal-result').hide();					
						$('#dealerListUl').empty();
						$('#dealerList2').show();
						if(response.data.length==1){
							$('#dealerList2').hide();
							_chooseDealer(response.data[0].staffName,response.data[0].staffId,response.data[0].chanInfos[0] == undefined ? '' : response.data[0].chanInfos[0].channelNbr,$('#dealerType').val(),CONST.BUSI_ORDER_ATTR.DEALER_NAME);
						}else{
							for(var i=0;i<response.data.length;i++){//
								var dealer=response.data[i];
								var channelNbr="";
								if(dealer.chanInfos[i]!=undefined){
									channelNbr=dealer.chanInfos[i].channelNbr;
								}
								var staffName="";
								var staffCode="";
								if(dealer.staffName!=null && dealer.staffName!=undefined){
									staffName=dealer.staffName;
								}
								if(dealer.staffCode!=null && dealer.staffCode!=undefined){
									staffCode=dealer.staffCode;
								}
								$('#dealerListUl').append('<li style="cursor:pointer" onclick="order.dealer.chooseDealer(\''+dealer.staffName+'\','+dealer.staffId+',\''+channelNbr+'\','+$('#dealerType').val()+')"><i class="iconfont pull-left">&#xe663;</i> <span  class="list-title p-r-43">姓名【'+staffName+'】员工号:【'+staffCode+'】</span> </li>');	
							}
						}						
						// $("#dealerName").html(response.data[0].staffName).attr("staffId", response.data[0].staffId);						
			
//						$("#dealerModal").modal("hide");
						
					}
				}else if(response.code==-2){
					$.alertM(response.data);
					return;
				}else{
					$.alert("信息提示",response.msg);
					return;
				}			
			}
		});	

	}
	
	function _showJbr(){
	    $("#jbr").modal("show");
	    if($("#tab1_jbr").length>0){
	    	$("#tab1_jbr").click();
	    }
	}
	
	function _closeJBR(){
		if(cust.isSameOne == undefined){
			$("#jbr").modal("hide");
			return;
		}
		if(OrderInfo.preBefore.idPicFlag=="ON" && (OrderInfo.actionFlag!="3" || (OrderInfo.actionFlag=="22" && OrderInfo.uimtypeflag == "22"))){
			if(!OrderInfo.virOlId){
				common.callPhotos('cust.getPicture');
				return;
			}
		}
		$("#jbr").modal("hide");
		cust.jbrSubmit();
		if(ec.util.isObj(OrderInfo.jbr.partyName)){
			$("#jbrName").html(OrderInfo.jbr.partyName);
			$("#jbrName").removeClass("font-secondary");
		}
		
	}
	
	function _deleteJbr(){
		if(ec.util.isObj(OrderInfo.jbr)){
			OrderInfo.jbr.custId = undefined;
			OrderInfo.jbr.partyName = undefined;
			OrderInfo.jbr.telNumber = undefined;
			OrderInfo.jbr.addressStr = undefined;
			OrderInfo.jbr.identityCd = undefined;
			OrderInfo.jbr.mailAddressStr = undefined;
			OrderInfo.jbr.identityPic = undefined;
			OrderInfo.jbr.identityNum = undefined;
		}
		cust.clearJbrForm();
		OrderInfo.virOlId = "";
		$("#deleteJbr").hide();
		$("#jbrName").html("请添加经办人");
		$("#jbrName").addClass("font-secondary");
		
	}
	//删除协销人
	var _removeDealer = function(obj){
		$(obj).parent().parent().parent().parent().parent().remove();
		$.refresh($("#dealerTbody"));
	};
	
	//删除协销人
	var _removeAttDealer = function(id){
		$("li[name^='tr_"+id+"']").each(function(){
			$(this).remove();
		});
		$.refresh($("#dealerTbody"));
	};
	
	
	//添加发展人
	var _chooseDealer = function(name, staffId, channelNbr, roleId) {
		_addDealer(name, staffId, channelNbr, roleId);
		//重置表单
		$('#dealerList2').hide();
		$('#dealerModal').modal("hide");
		$('#dealerModal-result').hide();
		$('#dealerModal').find('.choice-box').children('.help-block').addClass('hidden');
		$('#staffCode,#salesCode,#staffName').val('');
		//重置结束
		
	};

	//添加发展人
	var _addDealer = function(name, staffId, channelNbr, roleId) {
		var role = '';
		roleId=roleId+"";
		switch(roleId){
			case "40020005":
			role = "第一发展人";
			break;
			case "40020006":
			role = "第二发展人";
			break;
			case "40020007":
			role = "第三发展人";
			break;
			default:
			role = "第一发展人";
			break;
		}
		var isAdded = false; //是否添加过同一类型的发展人
		$('#dealerList').children('li').not(':first').each(function(){
			if($(this).data().role == $('#dealerType').val()){
				isAdded = true;			
			    return false; //跳出each循环
			}
		})
		if(isAdded){//添加过同类型的先移除
			$("#dealerList").children('li[data-role="' + roleId + '"]').remove();//移除同类型节点
		}
	    var html = '<li data-channelnbr="' + channelNbr + '" data-role="' + roleId + '" data-staffid="' + staffId + '" data-dealername="'+name+'"> <span class="list-title font-secondary choice-box-left" id="dealerName"> '+name+' <small>('+role+')</small></span> <i onclick="$(this).closest(\'li\').remove();" class="iconfont icon-close absolute-right"></i > </li>'; 
	    $('#dealerList').append(html);
	}
    
    var _watch = function(el) {
    	var num = $('#dealerList').find('li[data-role=' + $(el).val() + ']').size();
    	console.log(num)
        if (num == 0) {
            $(el).siblings('.help-block').addClass('hidden')
        } else if(num > 0) {
            $(el).siblings('.help-block').removeClass('hidden')
        }
    }

	return {
		initDealer 			: _initDealer,
		showDealer          : _showDealer,
		queryChildNode      : _queryChildNode,
		queryStaff          : _queryStaff,
		showJbr				:_showJbr,
		closeJBR			:_closeJBR,
		deleteJbr			:_deleteJbr,
		removeAttDealer		:_removeAttDealer,
		removeDealer		:_removeDealer,
		watch               :_watch,
		initJbrTab			:_initJbrTab,
		chooseDealer        :_chooseDealer
		
	};
})();