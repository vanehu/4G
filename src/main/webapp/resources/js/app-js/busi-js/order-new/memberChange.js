/**
 * 主副卡成员变更
 * 
 * @author yanghm
 * date 2017-3-30
 */
CommonUtils.regNamespace("order", "memberChange");
order.memberChange = function(){	
	var _memberAddList=[];//添加的副卡号码
	var _memberDelList=[];//要拆除的副卡号码
	var _viceparam = [];//拆除的副卡信息
	var _ooRoles=[];//拆除副卡的角色信息
	var _delAttachOfferList=[];//要拆除的卡附属
	var _mainFeeType;
	//点击主副卡成员变更跳出一个div
	var _init=function(){
		OrderInfo.actionFlag=6;	//默认加装副卡
		OrderInfo.order.step = 1;
		var prod = order.prodModify.choosedProdInfo;
		var boInfos = [{
			boActionTypeCd : CONST.BO_ACTION_TYPE.ADDOREXIT_COMP,
			instId : prod.prodOfferInstId,
			specId : prod.prodOfferId
		}];
		rule.rule.ruleCheck(boInfos,function(checkData){// 业务规则校验通过
			if(ec.util.isObj(checkData)){
				$("#secondaryPhoneNumUl").hide();				
				$("#fk_phonenumber_next").hide();
				var content$ = $("#error-rule").html(checkData).show();
				$.refresh(content$);
			}else{
				//默认退副卡，相关tab页隐藏
				$("#tab2_li").hide();
				$("#tab3_li").hide();
				if(order.prodModify.choosedProdInfo.prodStateCd!=CONST.PROD_STATUS_CD.NORMAL_PROD){
					closeAndAlert("当前产品状态不是【在用】,不允许受理该业务！");
					return;
				}
				OrderInfo.busitypeflag=3;
				//4G系统判断，如果是3g套餐不能做该业务
				if(CONST.getAppDesc()==0 && order.prodModify.choosedProdInfo.is3G=="Y"){
					closeAndAlert("3G套餐不允许做主副卡成员变更业务！");
					return;
				}
				//根据省份来限制纳入老用户入口,开关在portal.properties
				//var areaidflag = _areaidJurisdiction(1);
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
				order.memberChange.mainFeeType=order.prodModify.choosedProdInfo.feeType;//主卡付费类型
				//根据销售品规格验证是否是主副卡套餐
				var flag = true;
				$.each(offerSpec.offerRoles,function(){
					if (this.memberRoleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD) {
						flag = false;
						return false;
					}
				});
				if(flag){
					closeAndAlert("你选择的套餐不是主副卡套餐，不能进行主副卡成员变更");
					return;
				}
				$.each(offerSpec.offerRoles,function(){
					var offerRole = this;
					if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){//副卡接入类产品
						$.each(this.roleObjs,function(){
							var objInstId = offerRole.offerRoleId+"_"+this.objId;//角色id+产品规格id
							if(this.objType == CONST.OBJ_TYPE.PROD){
								if(offerRole.minQty == 0){ //加装角色
									this.minQty = 0;
									this.dfQty = 0;
								}
								order.service.max=this.maxQty;
								return false;
							}
						});
					}
				});
				//查询销售品实例并且保存
				if(!query.offer.setOffer()){  
					return;
				}
				var offerMemberInfos=OrderInfo.offer.offerMemberInfos;
				$.each(offerMemberInfos,function(){
					if (this.roleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD) {//填充主卡号码
						$("#mainCardSpan").html(this.accessNumber);
					}else if(this.roleCd == CONST.MEMBER_ROLE_CD.VICE_CARD){//副卡展示
						var $div =$('<li><span class="list-title"><span class="title-lg" id="span_'+this.accessNumber+'">'+this.accessNumber+'</span><span class="subtitle font-secondary">副卡</span></span><button id="delBtn_'+this.accessNumber+'" class="list-can absolute-right" onclick="order.memberChange.removeSecondCard('+this.accessNumber+')">退</button><button id="cancelDelBtn_'+this.accessNumber+'" class="list-can" style="position:absolute; right:10px;background: #a5a3a2;display: none;" onclick="order.memberChange.cancelRemoveSecondCard('+this.accessNumber+')">不退</button></li>');
						$("#memberCardUl").append($div);
					}
				});
				var haveNum=$('#memberCardUl').children('li').length-2;//已有副卡数目
				order.service.max=order.service.max-haveNum;
				$("#maxSpan").html(order.service.max+")");
			}
		});		
};

//点击退
var _removeSecondCard=function(obj){
	if(order.memberChange.memberAddList.length>0){//新增副卡操作同时不允许退
		$.alert("提示","不允许同时办理拆机和新增副卡！");
		return;
	}
	$.confirm("确认","是否将副卡"+obj+"拆机",{ 
		yes:function(){
			$("#span_"+obj).addClass("font-orange del-line");
			$("#delBtn_"+obj).hide();
			$("#cancelDelBtn_"+obj).show();
			_memberDelList.push(obj);
		},
		no:function(){	
			return;
		}
	});
};

//点击不退，取消拆除副卡
var _cancelRemoveSecondCard=function(obj){
	$("#span_"+obj).removeClass("font-orange del-line");
	$("#delBtn_"+obj).show();
	$("#cancelDelBtn_"+obj).hide();
	$.each(_memberDelList, function(index, item) {
		// index是索引值（即下标） item是每次遍历得到的值；
		if (item == obj) {
			_memberDelList.splice(index, 1);
		}
	});
};

	// 点击下一步判断是拆除副卡或者新装副卡
	var _buildMainView = function() {
		if(_memberDelList.length==0 && _memberAddList.length==0){//未进行任何业务，直接返回
			$.alert("提示","您还未进行任何业务！");
			return;
		}
		if(_memberDelList.length>0){//拆副卡
		     OrderInfo.actionFlag=21;
		     order.memberChange.viceparam=[];
		 	order.memberChange.ooRoles=[];
		 	var offerMemberInfos=OrderInfo.offer.offerMemberInfos;
		 	$.each(_memberDelList, function(index, item) {
		 		// index是索引值（即下标） item是每次遍历得到的值；
		 			$.each(offerMemberInfos,function(){
		 				if (this.roleCd == CONST.MEMBER_ROLE_CD.VICE_CARD && item==this.accessNumber) {//拆除的副卡信息
		 					var offerSpecParams=[];
		 					var cardParam={
		 						"accessNumber":	this.accessNumber,
		 						"del":	"Y",
		 						"isset":	"Y",
		 						"knew":	"N",
		 						"objId":	this.objId,
		 						"objInstId":	this.objInstId,
		 						"objType":	this.objType,
		 						"offerMemberId":	this.offerMemberId,
		 						"offerSpecParams":offerSpecParams,
		 						"roleName":this.roleName,
		 						"offerRoleId":this.offerRoleId
		 					};
		 					var cardRole={
		 							"objId":	this.objId,
		 							"objInstId":	this.objInstId,
		 							"objType":	this.objType,
		 							"offerMemberId":	this.offerMemberId,
		 							"offerRoleId":this.offerRoleId,
		 							"state":"DEL"
		 					};
		 					order.memberChange.viceparam.push(cardParam);
		 					order.memberChange.ooRoles.push(cardRole);
		 				}
		 			});
		 	});

		     order.main.loadOtherParm();
		}else{//加装副卡
			$("#tab2_li").show();
			$("#tab3_li").show();
			order.main.buildMainView();//跳转促销
		}
	};

//提示，点确认退出
var closeAndAlert=function(msg){
	var title='信息提示';
	$("#btn-dialog-ok").removeAttr("data-dismiss");
	$('#alert-modal').modal({backdrop: 'static', keyboard: false});
	$("#btn-dialog-ok").off("click").on("click",function(){
		$("#alert-modal").modal("hide");
		common.callCloseWebview();
	});
	$("#modal-title").html(title);
	$("#modal-content").html(msg);
	$("#alert-modal").modal();
};

//拆副卡提交订单
var _submit=function(){
    //组件拆除副卡信息data
	SoOrder.initFillPage(); //初始化订单数据
	order.main.orderSubmit();
};

var _initOther=function(){
	$.each(order.memberChange.viceparam,function(){
   	 var cardParam=this;
   	 var param={
	    		"areaId":OrderInfo.getProdAreaId(this.objInstId),
	    		"channelId":OrderInfo.staff.channelId,
	    		"staffId":OrderInfo.staff.staffId,
	    		"prodId":this.objInstId,
	    		"prodSpecId":this.objId,
	    		"offerSpecId":order.prodModify.choosedProdInfo.prodOfferId,	
	    		"offerRoleId":this.offerRoleId,
	    		"acctNbr":this.accessNumber,
	    		"partyId":OrderInfo.cust.custId

	     };
		if(ec.util.isObj(OrderInfo.order.soNbr)){  //缓存流水号
			param.soNbr = OrderInfo.order.soNbr;
		}
		else{
			param.soNbr = UUID.getDataId();
			OrderInfo.order.soNbr = UUID.getDataId();
		}
	     order.memberChange.queryCardAttachOffer(param); 
    });
}

var _queryCardAttachOffer = function(param) {
	var url = contextPath+"/app/order/prodoffer/memberchange/queryCardAttachOffer";
	$.callServiceAsJsonGet(url,param,{
		"before":function(){
			$.ecOverlay("<strong>正在查询销售品实例中,请稍后....</strong>");
		},
		"always":function(){
		},
		"done" : function(response){
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					var offerLists = response.data.result.offerLists;
					order.memberChange.delAttachOfferList.push({"prodId":param.prodId,"offerLists":offerLists,"accessNumber":param.acctNbr});
					query.offer.loadInst(); //加载实例到缓存
				}
			}else {
				$.alert("提示","附属销售品实例查询失败,稍后重试");
				return;
			}
		}
	});
};

//点击加号新增副卡，需要进行一五校验
var _addNewCard=function(){
	OrderInfo.actionFlag==6;
	if(_memberDelList.length>0){//存在拆除的副卡不许新增副卡
		$.alert("提示","不允许同时办理拆机和新增副卡！");
		return;
	}
//	if(!cust.preCheckCertNumberRel()){//一五校验
//		return;
//	}
	order.phoneNumber.queryApConfig();//查询号码段和号码类型 
	order.phoneNumber.queryPhoneNbrPool();//查询号池		
	order.phoneNumber.showSecondaryCardModalData();
};

//清楚主副卡相关数据
var _clearMemberData=function(){
	order.memberChange.memberAddList=[];
	order.memberChange.memberDelList=[];
	order.memberChange.viceparam=[];
	order.memberChange.ooRoles=[];
	order.memberChange.delAttachOfferList=[];
};


//移除添加的副卡号码
var _removeAddPhoneNum=function(phoneNumber){ 
	 $("#secondaryPhoneNumUl2").children("li[id='li_"+phoneNumber+"']").remove();
	 $.each(order.memberChange.memberAddList, function(index, item) {
			// index是索引值（即下标） item是每次遍历得到的值；
			if (item == phoneNumber) {
				order.memberChange.memberAddList.splice(index, 1);
			}
	});
	var boProdAns = OrderInfo.boProdAns;
	var boProdAns2=[];//存放新号码
	//释放预占的号码
	if(boProdAns.length>0){
		for(var n=0;n<boProdAns.length;n++){
			if(boProdAns[n].accessNumber==phoneNumber){
				var param = {
						numType : 1,
						numValue : boProdAns[n].accessNumber
				};
				$.callServiceAsJson(contextPath+"/app/mktRes/phonenumber/releaseErrorNum", param, {
					"done" : function(){
					}
				});
			}else{
				if(boProdAns[n].prodId!="-1"){
					boProdAns[n].prodId=boProdAns[n].prodId+1;
				}
				boProdAns2.push(boProdAns[n]);	
			}
		}
	}
	OrderInfo.boProdAns=boProdAns2;
	order.phoneNumber.secondaryCarNum=order.phoneNumber.secondaryCarNum-1;
	
};



	return {
		    init                  :_init,
		    memberAddList         :_memberAddList,
		    memberDelList         :_memberDelList,
		    removeSecondCard      :_removeSecondCard,
		    cancelRemoveSecondCard:_cancelRemoveSecondCard,
		    buildMainView         :_buildMainView,
		    viceparam             :_viceparam,
		    ooRoles               :_ooRoles,
		    submit                :_submit,
		    queryCardAttachOffer  :_queryCardAttachOffer,
		    delAttachOfferList    :_delAttachOfferList,
		    initOther             :_initOther,
		    addNewCard            :_addNewCard,
		    mainFeeType           :_mainFeeType,
		    clearMemberData       :_clearMemberData,
		    removeAddPhoneNum     :_removeAddPhoneNum
	};
}();
