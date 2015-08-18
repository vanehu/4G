CommonUtils.regNamespace("order", "memberChange");
order.memberChange = function(){
	var _offerProd={};
	var _memberAddList=[];
	var _ischooseOffer=false;
	
	//点击主副卡成员变更跳出一个div
	var _showOfferCfgDialog=function(){
		OrderInfo.busitypeflag=3;
		order.prepare.createorderlonger();
		//4G系统判断，如果是3g套餐不能做该业务
		if(CONST.getAppDesc()==0 && order.prodModify.choosedProdInfo.is3G=="Y"){
			$.alert("提示","3G套餐不允许做主副卡成员变更业务！","information");
			return;
		}
		//查询销售品规格并且保存
		var param = {
			offerSpecId : order.prodModify.choosedProdInfo.prodOfferId, 
			offerTypeCd : 1,
			partyId : OrderInfo.cust.custId
		};
		var offerSpec = query.offer.queryMainOfferSpec(param); //查询主销售品构成
		if(!offerSpec){
			return;
		}
		//根据销售品规格验证是否是主副卡套餐
		var flag = true;
		$.each(offerSpec.offerRoles,function(){
			if (this.memberRoleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD) {
				flag = false;
				return false;
			}
		});
		if(flag){
			$.alert("错误","你选择的套餐不是主副卡套餐，不能进行主副卡成员变更");
			return;
		}
		//查询销售品实例并且保存
		if(!query.offer.setOffer()){  
			return;
		}
		
		//改造中...
		var iflag = 0; //判断是否弹出副卡选择框 false为不选择
		var $tbody = $("#maincard_member_tbody");
		$tbody.html("");
		$("#main_title").text(OrderInfo.offerSpec.offerSpecName);
		$.each(offerSpec.offerRoles,function(){
			var offerRole = this;
			var $tr = $("<tr style='background:#f8f8f8;'></tr>");
			var $td = $('<td class="borderLTB" style="font-size:14px; padding:0px 0px 0px 12px"><span style="color:#518652; font-size:14px;">'
					+offerRole.offerRoleName+'</span>&nbsp;&nbsp;</td>');
			if(this.memberRoleCd == CONST.MEMBER_ROLE_CD.CONTENT){
				$tr.append($td).append($("<td colspan='3'></td>")).appendTo($tbody);
			}else{
				$tr.append($td).appendTo($tbody);
			}
			/*$.each(this.roleObjs,function(){
				var objInstId = offerRole.offerRoleId+"_"+this.objId;//角色id+产品规格id
				if(this.objType == CONST.OBJ_TYPE.PROD){
					if(offerRole.minQty == 0){ //加装角色
						this.minQty = 0;
						this.dfQty = 0;
					}
					var max = this.maxQty<0?"不限制":this.maxQty;//主卡的最大数量
					$tr.append("<td align='left' colspan='3'>"+this.objName+" :<i id='plan_no' style='margin-top: 3px; display: inline-block; vertical-align: middle;'>"+
							"<a class='add' href='javascript:order.service.subNum(\""+objInstId+"\","+this.minQty+");'></a>"+
							"<input id='"+objInstId+"' type='text' value='"+this.dfQty+"' class='numberTextBox width22' readonly='readonly'>"+
							"<a class='add2' href='javascript:order.service.addNum(\""+objInstId+"\","+this.maxQty+");'> </a>"+
							"</i>"+this.minQty+"-"+max+"（张） </td>");	
					iflag++;
				}
			});*/
			//销售品规格
			//主卡
			if (offerRole.memberRoleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD) {
				$.each(this.roleObjs,function(){
					if(this.objType == CONST.OBJ_TYPE.PROD){
						//$tr.append("<td align='center' colspan='2'>"+this.objName+":</td>");
						$tr.append("<td align='center' colspan='2' class='borderLTB' style='font-size:14px; padding:0px 0px 0px 12px'><span style='color:#518652; font-size:14px;'>"
								+this.objName+"</span>&nbsp;&nbsp;</td>");
					}
				});
				$.each(OrderInfo.offer.offerMemberInfos,function(){
					if(this.offerRoleId==offerRole.offerRoleId && this.objType==CONST.OBJ_TYPE.PROD){
						$tr.append("<td align='left' colspan='1' class='borderLTB' style='font-size:14px; padding:0px 0px 0px 12px'><span style='color:#518652; font-size:14px;'>"
						+this.accessNumber+"</span>&nbsp;&nbsp;</td>");
						return;
					}
				});
			}else{
				//副卡添加
				$.each(offerRole.roleObjs,function(){  //遍历副卡角色下的成员
					if(this.objType == CONST.OBJ_TYPE.PROD){
						this.minQty = 0;
						this.dfQty = 0;
						viceMinQty = 0;
						viceMaxQty = this.maxQty;
						numId = offerRole.offerRoleId+"_"+this.objId;//offerRole.memberRoleCd;
					}
				});
				var existViceCardNum = 0;//已有副卡数量
				//副卡个数
				$.each(OrderInfo.offer.offerMemberInfos,function(){
					if(this.offerRoleId == offerRole.offerRoleId  && this.objType==CONST.OBJ_TYPE.PROD){
						existViceCardNum++;
					}
				});
				//副卡添加
				$.each(this.roleObjs,function(){
					var objInstId = offerRole.offerRoleId+"_"+this.objId;//角色id+产品规格id
					if(this.objType == CONST.OBJ_TYPE.PROD){
						_memberAddList.push(objInstId);
						if(offerRole.minQty == 0){ //加装角色
							this.minQty = 0;
							this.dfQty = 0;
						}
						var max = this.maxQty<0?"不限制":this.maxQty;//主卡的最大数量
						max = max -existViceCardNum;
						$tr.append("<td align='left' colspan='3'>"+this.objName+" :<i id='plan_no' style='margin-top: 3px; display: inline-block; vertical-align: middle;'>"+
								"<a class='add' href='javascript:order.service.subNum(\""+objInstId+"\","+this.minQty+");'></a>"+
								"<input id='"+objInstId+"' type='text' value='"+this.dfQty+"' class='numberTextBox width22' readonly='readonly'>"+
								"<a class='add2' href='javascript:order.service.addNum(\""+objInstId+"\","+max+");'> </a>"+
								"</i>"+this.minQty+"-"+max+"（张） </td>");	
						iflag++;
					}
				});
				//副卡成员

				//$Othertr.after($tr);
				$.each(OrderInfo.offer.offerMemberInfos,function(){
					var $Othertr = $("<tr></tr>");
					if(this.offerRoleId == offerRole.offerRoleId  && this.objType==CONST.OBJ_TYPE.PROD){
						var li = $("<td colspan='4' id=\"li_viceCard_new_"+this.accessNumber+"\"></td>").text(this.accessNumber).appendTo($Othertr);
						li.attr("del","N").attr("knew","N").attr("objId",this.objId).attr("objInstId",this.objInstId)
						  .attr("objType",this.objType).attr("offerMemberId",this.offerMemberId).attr("offerRoleId",this.offerRoleId);
						var eleI = $("<i id='plan_no'><a id='' accNbr='"+this.accessNumber+"' class='purchase' href='javascript:void(0)'>拆副卡</a></i>").appendTo(li);
						eleI.click(function(){
							if (($(this).parent().attr("del") == "N")) {
								$(this).parent().css("text-decoration","line-through").attr("del","Y").attr("knew","N");
								$(this).find("a").text("不 拆");
							} else {
								$(this).parent().css("text-decoration","").attr("del","N").attr("knew","N");
								$(this).find("a").text("拆副卡");
								$("#"+'viceCard_new_'+$(this).find("a").attr("accNbr")).html("");
							}
						});
						$("<span  id='viceCard_new_"+this.accessNumber+"'></span>").appendTo(li);
						var eleR = $("<i id='plan_no_remain'><a id='' accNbr='"+this.accessNumber+"' class='purchase' href='javascript:void(0)'>保留>>选择新套餐</a></i>").appendTo(li);
						eleR.click(function(){
							order.service.offerDialog('viceCard_new_'+$(this).find("a").attr("accNbr"));
							//$($("#plan_no")).parent().css("text-decoration","line-through").attr("del","Y");
						});	
						//existViceCardNum++;
					}
					$tr.after($Othertr);
				});
			}
		});
		$("#memeberChange .btna_o:last").click(function(){
			_closeDialog();
		});
		ec.form.dialog.createDialog({
			"id":"-memeberChange",
			"width":580,
			"height":400,
			"initCallBack":function(dialogForm,dialog){
				order.prodModify.dialogForm=dialogForm;
				order.prodModify.dialog=dialog;
			},
			"submitCallBack":function(dialogForm,dialog){}
		});
		
	};

	var _submit = function() {
		var lis = $("#maincard_member_tbody tr[style!='background:#f8f8f8;'] td[colspan='4']");
		var ifRemoveProd = false;
		for (var i=0;i<lis.length;i++) {
			if ($(lis[i]).attr("del") == "Y"||$(lis[i]).attr("knew") == "Y") {
				ifRemoveProd = true;
				break;
			}
		}
		var num=0; 
		$.each(_memberAddList,function(){
			num=num+$("#"+this).val();
		});
		//var num = $("#memeberChange ul:last h5 i input").val();
		if ((ifRemoveProd) && num> 0) {
			$.alert("提示","副卡拆机和副卡新装不能同时做，请分开两次操作");
			return;
		}
		if (!(ifRemoveProd) && num <=0) {
			$.alert("提示","没有对副卡进行操作。");
			return;
		}
		
		var prod = order.prodModify.choosedProdInfo; 
		var boInfos = [{
			boActionTypeCd : CONST.BO_ACTION_TYPE.ADDOREXIT_COMP,
			instId : prod.prodOfferInstId,
			specId : prod.prodOfferId,
			prodId : _offerProd.objInstId//纳入产品成员这些动作时出入宿主产品实例ID
		}];
		if(num>0){//新装副卡
			OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.ADDOREXIT_COMP,6,
					CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.ADDOREXIT_COMP),"3");
			var param = {
				memberChange : "Y",
				type : 1,
				boActionTypeName : "主副卡成员变更",
				viceCardNum : parseInt(num),
				feeTypeMain:order.prodModify.choosedProdInfo.feeType,
				offerNum : 1,
				custId : OrderInfo.cust.custId,
				actionFlag:6,
				accessNumber:_offerProd.accessNumber,
				offerSpec: OrderInfo.offerSpec
			};
			order.service.setOfferSpec(); //把选择的主副卡数量保存
			if(rule.rule.ruleCheck(boInfos)){  //业务规则校验
				order.main.buildMainView(param);	
			}
			order.memberChange.closeDialog();
		}
	   if(ifRemoveProd){//保留副卡
		   var viceparam = [];
			var params =[];
			$.each(lis,function(i, li){//所有副卡信息
				if ($(this).attr("knew") == "Y"||$(this).attr("del") == "Y") {
					viceparam.push({
						objId : $(this).attr("objId"),
						objInstId : $(this).attr("objInstId"),
						objType : $(this).attr("objType"),
						offerRoleId : $(this).attr("addRoleId"),
						offerSpecId :$(this).attr("addSpecId"),
						offerMemberId:$(this).attr("offerMemberId"),
						del : $(this).attr("del"),
						knew : $(this).attr("knew")
					});
				}
			});
			var ooRoles = [];
			$.each(lis,function(i, li){
				if ($(this).attr("del") == "Y"||$(this).attr("knew") == "Y") {
					ooRoles.push({
						objId : $(this).attr("objId"),
						objInstId : $(this).attr("objInstId"),
						objType : $(this).attr("objType"),
						offerMemberId : $(this).attr("offerMemberId"),
						offerRoleId : $(this).attr("offerRoleId"),
						state:'DEL'
					});
				}
			});
			//params = {viceParam:viceparam,ooRoles:ooRoles};
		   OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.ADDOREXIT_COMP,21,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.ADDOREXIT_COMP),"3");
		   var boInfos = [{
				boActionTypeCd : CONST.BO_ACTION_TYPE.ADDOREXIT_COMP,
				instId : _offerProd.offerId,
				specId : _offerProd.offerSpecId,
				prodId : _offerProd.objInstId//纳入产品成员这些动作时出入宿主产品实例ID
			}];
/*		   if(rule.rule.ruleCheck(boInfos)){  //业务规则校验
		   _removeAndAdd();
		   }*/
		   var submitFlag = "removeProd" ;
		   var boActionType=CONST.BO_ACTION_TYPE.ADDOREXIT_COMP;
			var callParam = {
				boActionTypeCd : boActionType,
				boActionTypeName : CONST.getBoActionTypeName(boActionType),
				//accessNumber : _choosedProdInfo.accNbr,
				submitFlag:submitFlag,
				viceParam:viceparam,
				ooRoles:ooRoles
			};
/*			OrderInfo.order.templateType=templateType;
			var v_actionFlag = 0 ;
			if(boActionType==CONST.BO_ACTION_TYPE.BUY_BACK){
				v_actionFlag =20;//OrderInfo.actionFlag
			}*/
			var param={
				areaId : OrderInfo.staff.areaId,
				staffId : OrderInfo.staff.staffId,
				channelId : OrderInfo.staff.channelId,
				custId : OrderInfo.cust.custId,
				boInfos : []
			};
			param.boInfos=boInfos;
			//OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,boActionType,v_actionFlag,CONST.getBoActionTypeName(boActionType),templateType);
			var flag = rule.rule.prepare(param,'order.prodModify.commonPrepare',callParam);
			if(flag) return;
			order.memberChange.closeDialog();
	   }
	};
	var _closeDialog = function() {
		if(order.prodModify.dialogForm!=undefined&&order.prodModify.dialog!=undefined){
			order.prodModify.dialogForm.close(order.prodModify.dialog);
		}
	};
	//主卡不变副卡新装套餐
	var _removeAndAdd=function(date){
		var viceparam = [];
		var ooRoles =[];
		var params =[];
		viceparam=date.viceParam;
		ooRoles=date.ooRoles;
		params = {viceParam:viceparam,ooRoles:ooRoles,remark:$("#order_remark").val()};
		SoOrder.submitOrder(params);
		
	};
	//业务规则校验
	var _getCallRuleParam = function(boActionTypeCd,prodId) {
		return {
			areaId : OrderInfo.staff.areaId,
			staffId : OrderInfo.staff.staffId,
			channelId : OrderInfo.staff.channelId,
			custId : OrderInfo.cust.custId,
			boInfos : [{
				boActionTypeCd : boActionTypeCd,
				instId : prodId,
				specId : CONST.PROD_SPEC.CDMA,
				prodId : prodId
			}]
		};
	};
	return {
		showOfferCfgDialog : _showOfferCfgDialog,
		closeDialog : _closeDialog,
		submit : _submit,
		offerProd:_offerProd,
		ischooseOffer :_ischooseOffer,
		removeAndAdd :_removeAndAdd
	};
}();
$(function(){
	$("#memeberChangeclose").click(function(){
		order.memberChange.closeDialog();
	});
	$("#memeberChange .btna_o:first").click(function(){
		order.memberChange.submit();
	});
	$("#memeberChange .btna_o:last").click(function(){
		order.memberChange.closeDialog();
	});
});