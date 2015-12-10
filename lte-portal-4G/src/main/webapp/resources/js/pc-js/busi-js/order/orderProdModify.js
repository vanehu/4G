/**
 * 订单准备
 * 
 * @author tang
 */
CommonUtils.regNamespace("order", "prodModify");
/**
 * 订单准备
 */
order.prodModify = (function(){	
	var boActionTypeCd="";//业务动作小类
	var authFlag="";
	var _coupon="";
	var lteFlag=(CONST.getAppDesc()==0) ? true : false;//下省标志,给LHW
//	var lteFlag=false;//下省标志，给XH
	var _ischooseOffer=false;
	var _choosedProdInfo = {};
	//客户信息修改客户属性信息
	var _profiles=[];
	//客户属性分页列表
	var _profileTabLists =[];
	//帐户信息修改帐户邮寄信息
	//获取选中的产品信息
	var _getChooseProdInfo = function() {
		var prodInfoTr=$("#phoneNumListtbody tr[class='plan_select']").find("td:eq(0)");
		if(prodInfoTr.attr("accNbr")==undefined){
			prodInfoTr=$("#phoneNumListtbody tr[class='bg plan_select']").find("td:eq(0)");
		}
		var prodInfoChildTr=$("#subphoneNumListtbody tr[class='plan_select2']").find("td:eq(0)");
		_choosedProdInfo  = {
			accNbr :prodInfoTr.attr("accNbr"),//产品接入号
			productName :prodInfoTr.attr("productName"),//产品规格名称
			prodStateName :prodInfoTr.attr("prodStateName"),//产品状态名称
			feeTypeName :prodInfoTr.attr("feeTypeName"),//付费方式名称
			prodInstId :prodInfoTr.attr("prodInstId"),//产品ID
			extProdInstId : prodInfoTr.attr("extProdInstId"),//省内产品实例ID
			corProdInstId : prodInfoTr.attr("corProdInstId"),//外部产品实例ID
			prodStateCd :prodInfoTr.attr("prodStateCd"),//产品状态CD
			productId :prodInfoTr.attr("productId"),//产品规格ID
			feeType :prodInfoTr.attr("feeType"),//付费方式id
			prodClass :$(prodInfoTr).attr("prodClass"),//产品大类 4 表示4G；3表示3G
			stopRecordCd :prodInfoTr.attr("stopRecordCd"),//停机记录CD
			stopRecordName :prodInfoTr.attr("stopRecordName"),//停机记录名称
			prodOfferName :prodInfoChildTr.attr("prodOfferName"),//主套餐名称
			custName :prodInfoChildTr.attr("custName"),//所属人客户名称
			startDt :prodInfoChildTr.attr("startDt"),//生效时间
			endDt :prodInfoChildTr.attr("endDt"),//失效时间
			prodOfferId :prodInfoChildTr.attr("prodOfferId"),//主套餐规格ID
			prodOfferInstId :prodInfoChildTr.attr("prodOfferInstId"),//主套餐实例ID
			custId :prodInfoChildTr.attr("custId"),//所属人客户ID
			is3G :prodInfoChildTr.attr("is3G"),//3G/4G主销售品标识
			areaCode :prodInfoTr.attr("zoneNumber"),//产品地区CODE
			areaId : prodInfoTr.attr("areaId")//产品地区id
		};
		order.prodModify.choosedProdInfo=_choosedProdInfo;
//		window.localStorage.setItem("order.prodModify.choosedProdInfo",JSON.stringify(order.prodModify.choosedProdInfo));
	};
	//业务规则校验
	var _getCallRuleParam = function(boActionTypeCd,prodId) {
		return {
			areaId : OrderInfo.staff.areaId,
			staffId : OrderInfo.staff.staffId,
			channelId : OrderInfo.staff.channelId,
			custId : OrderInfo.cust.custId,
			custFlag :OrderInfo.cust.custFlag,
			boInfos : [{
				boActionTypeCd : boActionTypeCd,
				instId : prodId,
				specId : CONST.PROD_SPEC.CDMA,
				prodId : prodId
			}]
		};
	};
	//预校验单校验
	var _updateCheckByChange = function (actionClassCd,boActionTypeCd,prodStatusCd,toprodStatusCd) {
		var data = { 
				orderList : {
					orderListInfo : { 
						isTemplateOrder : "N",   //是否批量
						templateType : "1",  //模板类型: 1 新装；8 拆机；2 订购附属；3 组合产品纳入/退出
						staffId : OrderInfo.staff.staffId,
						channelId : OrderInfo.staff.channelId,  //受理渠道id
						areaId : OrderInfo.staff.areaId,  //受理地区ID
						partyId :  _choosedProdInfo.custId,  //新装默认-1
						olTypeCd : CONST.OL_TYPE_CD.UI_LTE  //4g标识
					},
					custOrderList :[{busiOrder : []}]   //客户订购列表节点
				}
			};
		data.orderList.custOrderList[0].busiOrder=[{
	    	areaId: OrderInfo.staff.areaId,  //受理地区ID
		    boActionType: {
		        actionClassCd: actionClassCd,//受理大类
		        boActionTypeCd: boActionTypeCd//退订销售品
		    }, busiObj: {
		        accessNumber: _choosedProdInfo.accNbr,
		        instId: _choosedProdInfo.prodInstId,
		        isComp: "N",
		        objId: CONST.PROD_SPEC.CDMA,
		        offerTypeCd: "1"
		    }, busiOrderInfo: {
		        seq: OrderInfo.SEQ.seq
		    },data: {
		    	boProdStatuses : [{
					atomActionId : OrderInfo.SEQ.atomActionSeq--,
					prodStatusCd : prodStatusCd,
					state : "DEL"
				},{
					atomActionId : OrderInfo.SEQ.atomActionSeq--,
					prodStatusCd : toprodStatusCd,
					state : "ADD"
				}
		        ]
		    }
	    }];
		params=JSON.stringify(data);
		var url=contextPath+"/token/pc/order/prodModify/updateCheckByChange";
		var response = $.callServiceAsJson(url, params, {});
		var msg="";
		if (response.code == 0) {
			return true;
		}else if(response.code == -2){
			$.alertM(response.data);
			return false;
		}else{
			if (response.data.resultMsg) {
		        $.alert("提示","预校验失败!失败原因为："+response.data.resultMsg);
		    } else {
		        $.alert("提示","预校验失败! 集团营业后台未给出原因。");
		    }
		}
	};
	//二次业务产品密码鉴权配置 
	var _remark_prodPass = function () {
		var params = {"tableName":"SYSTEM","columnName":"REMARK_PRODPASS"} ;
		var url=contextPath+"/order/prodModify/queryProdPwdConfig";
		if(OrderInfo.password_remark==""){
			var response = $.callServiceAsJson(url, params, {});
			var msg="";
			if (response.code == 0) {
				OrderInfo.password_remark=response.data;
			}else if(response.code == -2){
				$.alertM(response.data);
				OrderInfo.password_remark="0";
				return false;
			}else{
				OrderInfo.password_remark="0";
				return false;
			}
		}
		
	}
	//补换卡规则校验
	var _showChangeCard = function () {
		if(order.prodModify.choosedProdInfo.prodStateCd==CONST.PROD_STATUS_CD.STOP_PROD){
			$.alert("提示","停机产品不允许受理！");
			return;
		}
		OrderInfo.busitypeflag=13;
		prod.changeUim.init();
	};
	
	//加入群组规则校验
	var _showAddComp = function(){
		var compspecparam = {
				"productId":_choosedProdInfo.productId
		}
		if(getCompInfo(compspecparam)==""){
			return;
		}
		var param = {
				"areaId" : OrderInfo.staff.areaId, //地区ID
				"custId" : OrderInfo.cust.custId, //客户ID
				"staffId" : OrderInfo.staff.staffId,
				"channelId" : OrderInfo.staff.channelId,
				"boInfos":[{
					"boActionTypeCd": CONST.BO_ACTION_TYPE.ADD_COMP,//动作类型
				    "instId" : _choosedProdInfo.prodInstId, //实例ID
				    "specId" : CONST.PROD_SPEC.CDMA //产品（销售品）规格ID
				}]
		};
		var callParam = {
				"prodInstId" : _choosedProdInfo.prodInstId,
				"productId" : _choosedProdInfo.productId
		};
		var checkRule = rule.rule.prepare(param,'order.prodModify.addComp',callParam);
	}
	
	//退出群组规则校验
	var _showRemoveComp = function(){
		var compspecparam = {
				"productId":_choosedProdInfo.productId
		}
		if(getCompInfo(compspecparam)==""){
			return;
		}
		var param = {
				"areaId" : OrderInfo.staff.areaId, //地区ID
				"custId" : OrderInfo.cust.custId, //客户ID
				"staffId" : OrderInfo.staff.staffId,
				"channelId" : OrderInfo.staff.channelId,
				"boInfos":[{
					"boActionTypeCd": CONST.BO_ACTION_TYPE.ADD_COMP,//动作类型
				    "instId" : _choosedProdInfo.prodInstId, //实例ID
				    "specId" : CONST.PROD_SPEC.CDMA //产品（销售品）规格ID
				}]
		};
		var callParam = {
				"prodInstId" : _choosedProdInfo.prodInstId,
				"productId" : _choosedProdInfo.productId
		};
		var checkRule = rule.rule.prepare(param,'order.prodModify.removeComp',callParam);
	};
	var _queryOfferSpec=function(){
		var offerSpecId = _choosedProdInfo.prodOfferId;
		//offerSpecId = 300500003940;//TODO need delete
		var offerId=_choosedProdInfo.prodOfferInstId;
		//offerId=120000000645;//TODO need delete
		_offerProd.offerId=offerId;
		_offerProd.offerSpecId=offerSpecId;
		if(offerSpecId==undefined||offerSpecId==''){
			return {};
		}else{
			var param={"offerSpecId":offerSpecId};
			var response = $.callServiceAsJson(contextPath+"/order/queryOfferSpec",param);
			if (response.code==0) {
				if(response.data){
					_offerSpec = response.data.offerSpec;
				}
			}
		}
		return _offerSpec;
	};
	
	//挂失解挂准备
	var _showLossRepProd = function () {
		OrderInfo.busitypeflag=5;
		var submitState="";
        var BO_ACTION_TYPE="";
        var inprodStatusCd="";
        var intoprodStatusCd="";
			inprodStatusCd=_choosedProdInfo.prodStateCd;
			intoprodStatusCd=CONST.PROD_STATUS_CD.STOP_PROD;
			BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.LOSSREP_PROD;
			if(inprodStatusCd==""){
				inprodStatusCd=CONST.PROD_STATUS_CD.NORMAL_PROD;
			}
		var param = _getCallRuleParam(BO_ACTION_TYPE,_choosedProdInfo.prodInstId);
		var callParam = {
			boActionTypeCd : BO_ACTION_TYPE,
			boActionTypeName : CONST.getBoActionTypeName(BO_ACTION_TYPE),
			accessNumber : _choosedProdInfo.accNbr,
			prodStatusCd :inprodStatusCd,
			toprodStatusCd : intoprodStatusCd,
			prodOfferName : _choosedProdInfo.prodOfferName,
			itemSpecId : CONST.BUSI_ORDER_ATTR.REMOVE_REASON,
			state:submitState
		};
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,BO_ACTION_TYPE,0,CONST.getBoActionTypeName(BO_ACTION_TYPE),"");
		var checkRule = rule.rule.prepare(param,'order.prodModify.commonPrepare',callParam);
	};
	//解挂准备
	var _showLossRepProdReg = function () {
		OrderInfo.busitypeflag=5;
		var submitState="";
        var BO_ACTION_TYPE="";
        var inprodStatusCd="";
        var intoprodStatusCd="";
			inprodStatusCd=_choosedProdInfo.prodStateCd;
			intoprodStatusCd=CONST.PROD_STATUS_CD.NORMAL_PROD;;
			BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.DISLOSSREP_PROD;
		var param = _getCallRuleParam(BO_ACTION_TYPE,_choosedProdInfo.prodInstId);
		var callParam = {
			boActionTypeCd : BO_ACTION_TYPE,
			boActionTypeName : CONST.getBoActionTypeName(BO_ACTION_TYPE),
			accessNumber : _choosedProdInfo.accNbr,
			prodStatusCd :inprodStatusCd,
			toprodStatusCd : intoprodStatusCd,
			prodOfferName : _choosedProdInfo.prodOfferName,
			itemSpecId : CONST.BUSI_ORDER_ATTR.REMOVE_REASON,
			state:submitState
		};
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,BO_ACTION_TYPE,0,CONST.getBoActionTypeName(BO_ACTION_TYPE),"");
		var checkRule = rule.rule.prepare(param,'order.prodModify.commonPrepare',callParam);
	};
	//停机保号/取消停机保号准备
	var _showStopKeepNumProd = function () {
		OrderInfo.busitypeflag=6;
		var submitState="";
        var BO_ACTION_TYPE="";
        var inprodStatusCd="";
        var intoprodStatusCd="";
			BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.STOPKEEPNUM;
			inprodStatusCd=_choosedProdInfo.prodStateCd;
			intoprodStatusCd=CONST.PROD_STATUS_CD.STOP_PROD;
			if(inprodStatusCd==""){
				inprodStatusCd=CONST.PROD_STATUS_CD.NORMAL_PROD;
			}
		var param = _getCallRuleParam(BO_ACTION_TYPE,_choosedProdInfo.prodInstId);
		var callParam = {
			boActionTypeCd : BO_ACTION_TYPE,
			boActionTypeName : CONST.getBoActionTypeName(BO_ACTION_TYPE),
			accessNumber : _choosedProdInfo.accNbr,
			prodStatusCd :inprodStatusCd,
			toprodStatusCd : intoprodStatusCd,
			prodOfferName : _choosedProdInfo.prodOfferName,
			itemSpecId : CONST.BUSI_ORDER_ATTR.REMOVE_REASON,
			state:submitState
		};
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,BO_ACTION_TYPE,0,CONST.getBoActionTypeName(BO_ACTION_TYPE),"");
		var checkRule = rule.rule.prepare(param,'order.prodModify.commonPrepare',callParam);
	};
	//停机保号/取消停机保号准备
	var _showStopKeepNumProdReg = function () {
		OrderInfo.busitypeflag=6;
		var submitState="";
        var BO_ACTION_TYPE="";
        var inprodStatusCd="";
        var intoprodStatusCd="";
			BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.DISSTOPKEEPNUM;
			inprodStatusCd=_choosedProdInfo.prodStateCd;
			intoprodStatusCd=CONST.PROD_STATUS_CD.NORMAL_PROD;
		var param = _getCallRuleParam(BO_ACTION_TYPE,_choosedProdInfo.prodInstId);
		var callParam = {
			boActionTypeCd : BO_ACTION_TYPE,
			boActionTypeName : CONST.getBoActionTypeName(BO_ACTION_TYPE),
			accessNumber : _choosedProdInfo.accNbr,
			prodStatusCd :inprodStatusCd,
			toprodStatusCd : intoprodStatusCd,
			prodOfferName : _choosedProdInfo.prodOfferName,
			itemSpecId : CONST.BUSI_ORDER_ATTR.REMOVE_REASON,
			state:submitState
		};
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,BO_ACTION_TYPE,0,CONST.getBoActionTypeName(BO_ACTION_TYPE),"");
		var checkRule = rule.rule.prepare(param,'order.prodModify.commonPrepare',callParam);
	};
	//客户修改资料
	var _showCustInfoModify = function () {
		if("-1"==OrderInfo.cust.custId){
			$("#cCustName").val(OrderInfo.boCustInfos.name);
			$("#cCustIdCard").val(OrderInfo.boCustIdentities.identityNum);
			$("#partyTypeCd option[value='"+OrderInfo.boCustInfos.partyTypeCd+"']").attr("selected", true);
			$("#identidiesTypeCd option[value='"+OrderInfo.boCustIdentities.identidiesTypeCd+"']").attr("selected", true);
			$("#cAddressStr").val(OrderInfo.boCustInfos.addressStr);
			//证件类型选择事件
			order.cust.identidiesTypeCdChoose($("#identidiesTypeCd option[value='"+OrderInfo.boCustIdentities.identidiesTypeCd+"']"),"ccCustIdCard");
			tabProfileFlag="1";
			//客户联系人
			$("#contactAddress").val(OrderInfo.boPartyContactInfo.contactAddress);
			$("#contactDesc").val(OrderInfo.boPartyContactInfo.contactDesc);
			$("#contactEmployer").val(OrderInfo.boPartyContactInfo.contactEmployer);
			//$("#contactGender").val(OrderInfo.boPartyContactInfo.contactGender);
			$("#contactGender option[value='"+OrderInfo.boPartyContactInfo.contactGender+"']").attr("selected", true);
			$("#contactName").val(OrderInfo.boPartyContactInfo.contactName);
			//$("#contactType").val(OrderInfo.boPartyContactInfo.contactType);
			$("#contactType option[value='"+OrderInfo.boPartyContactInfo.contactType+"']").attr("selected", true);
			$("#eMail").val(OrderInfo.boPartyContactInfo.eMail);
			$("#fax").val(OrderInfo.boPartyContactInfo.fax);
			//$("#headFlag").val(OrderInfo.boPartyContactInfo.headFlag);
			$("#headFlag option[value='"+OrderInfo.boPartyContactInfo.headFlag+"']").attr("selected", true);
			$("#homePhone").val(OrderInfo.boPartyContactInfo.homePhone);
			$("#mobilePhone").val(OrderInfo.boPartyContactInfo.mobilePhone);
			$("#officePhone").val(OrderInfo.boPartyContactInfo.officePhone);
			$("#postAddress").val(OrderInfo.boPartyContactInfo.postAddress);
			$("#postcode").val(OrderInfo.boPartyContactInfo.postcode);
			easyDialog.open({
				container : 'user_add'
			});
		}else{
			var submitState="";
	        var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.CUSTINFOMODIFY;
			submitState="ADD";
			var param = _getCallRuleParam(BO_ACTION_TYPE, _choosedProdInfo.prodInstId);
			var callParam = {
				boActionTypeCd : BO_ACTION_TYPE,
				boActionTypeName : CONST.getBoActionTypeName(BO_ACTION_TYPE),
				accessNumber : "",
				prodOfferName : "",
				state:submitState
			};
/*			SoOrder.builder(CONST.ACTION_CLASS_CD.CUST_ACTION,BO_ACTION_TYPE);
			OrderInfo.actionTypeName = CONST.getBoActionTypeName(BO_ACTION_TYPE);
			OrderInfo.actionFlag=4;*/
			OrderInfo.initData(CONST.ACTION_CLASS_CD.CUST_ACTION,BO_ACTION_TYPE,4,CONST.getBoActionTypeName(BO_ACTION_TYPE),"");
			var checkRule = rule.rule.prepare(param,'order.prodModify.custInfoModify',callParam);
			if (checkRule) return;
			//SoOrder.builder();
			
		}
	};
	//改客户资料返档
	var _showActiveReturn = function () {
		if(order.prodModify.choosedProdInfo.prodStateCd==CONST.PROD_STATUS_CD.STOP_PROD){
			$.alert("提示","停机产品不允许受理！");
			return;
		}
		OrderInfo.busitypeflag=12;
		/*if(_choosedProdInfo.prodStateCd!=CONST.PROD_STATUS_CD.READY_PROD){
			$.alert("提示","产品必须为预开通时才能进行改客户资料返档","information");
			return;
		}*/
		var submitState="";
        var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.ACTIVERETURN;
		submitState="ADD";
		var param = _getCallRuleParam(BO_ACTION_TYPE, _choosedProdInfo.prodInstId);
		var callParam = {
			boActionTypeCd : BO_ACTION_TYPE,
			boActionTypeName : CONST.getBoActionTypeName(BO_ACTION_TYPE),
			accessNumber : "",
			prodOfferName : "",
			state:submitState
		};
		OrderInfo.initData(CONST.ACTION_CLASS_CD.CUST_ACTION,BO_ACTION_TYPE,9,CONST.getBoActionTypeName(BO_ACTION_TYPE),"");
		var checkRule = rule.rule.prepare(param,'order.prodModify.custInfoModify',callParam);
		if (checkRule) return;
	};
	//修改帐户信息
	var _showAcctInfoModify = function () {
			var submitState="";
	        var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.ACCTINFOMODIFY;
			submitState="ADD";
			var param = _getCallRuleParam(BO_ACTION_TYPE, _choosedProdInfo.prodInstId);
			var callParam = {
				boActionTypeCd : BO_ACTION_TYPE,
				boActionTypeName : CONST.getBoActionTypeName(BO_ACTION_TYPE),
				accessNumber : "",
				prodOfferName : "",
				state:submitState
			};
			OrderInfo.initData(CONST.ACTION_CLASS_CD.ACCT_ACTION,BO_ACTION_TYPE,0,CONST.getBoActionTypeName(BO_ACTION_TYPE),"");
			var checkRule = rule.rule.prepare(param,'order.prodModify.acctInfoModify',callParam);
			if (checkRule) return ;
			//SoOrder.builder();
			
	};
	var _form_custInfomodify_btn = function() {
		//修改客户下一步确认按钮
		$('#custModifyForm').off("formIsValid").on("formIsValid",function(event) {
			var modifyCustInfo={};
			modifyCustInfo = {
					custName : $.trim($("#cmCustName").val()),
					identidiesTypeCd :  $("#div_cm_identidiesType  option:selected").val(),
					custIdCard :  $.trim($("#cmCustIdCard").val()),
					addressStr: $.trim($("#cmAddressStr").val())
				};
			var data = {};
			data.boCustInfos = [{
				areaId : OrderInfo.cust.areaId,
				name : $("#boCustIdentities").attr("partyName"),
				norTaxPayerId : "0",
				partyTypeCd : $("#boCustIdentities").attr("partyTypeCd"),
				addressStr :$("#boCustIdentities").attr("addressStr"),
				state : "DEL"
			},{
				areaId : OrderInfo.cust.areaId,
				name : modifyCustInfo.custName,
				norTaxPayerId : "0",
				partyTypeCd : $("#cmPartyTypeCd  option:selected").val(),
				addressStr :modifyCustInfo.addressStr,
				state : "ADD"
			}];
			if(OrderInfo.cust.idCardNumber==""||OrderInfo.cust.idCardNumber==null){
				data.boCustIdentities = [{
					identidiesTypeCd :modifyCustInfo.identidiesTypeCd,
					identityNum : modifyCustInfo.custIdCard,
					isDefault : "Y",
					state : "ADD"
				}];	
			}else{
			data.boCustIdentities = [{
				identidiesTypeCd :OrderInfo.cust.identityCd,
				identityNum : OrderInfo.cust.idCardNumber,
				isDefault : "Y",
				state : "DEL"
			},{
				identidiesTypeCd :modifyCustInfo.identidiesTypeCd,
				identityNum : modifyCustInfo.custIdCard,
				isDefault : "Y",
				state : "ADD"
			}];
			}
			data.boCustProfiles=[];
			//客户属性信息
			for ( var i = 0; i < order.prodModify.profiles.length; i++) {
				var profilesObj = order.prodModify.profiles[i];
				var profilesDel ={};
				var profilesAdd ={};
				profilesDel={
					partyProfileCatgCd: profilesObj.attrId,
					profileValue: profilesObj.defaultValue,
					state : "DEL"};
				profilesAdd={
					partyProfileCatgCd: profilesObj.attrId,
					profileValue: $.trim($("#profiles_"+profilesObj.attrId).val()),
					state : "ADD"
				};
				if(document.getElementById("profiles_"+profilesObj.attrId)&&profilesObj.profileValue!=$.trim($("#profiles_"+profilesObj.attrId).val())){
					data.boCustProfiles.push(profilesDel);
					data.boCustProfiles.push(profilesAdd);
				}

			} 
			//客户联系人
			data.boPartyContactInfo=[];
			var _boPartyContactInfoOld = {
/*					contactAddress : $("#modTabProfile0").attr("contactAddress"),//参与人的联系地址
			        contactDesc : $("#modTabProfile0").attr("contactDesc"),//参与人联系详细信息
			        contactEmployer  : $("#modTabProfile0").attr("contactEmployer"),//参与人的联系单位
			        contactGender  : $("#modTabProfile0").attr("contactGender"),//参与人联系人的性别
*/			        contactId : $("#modTabProfile0").attr("contactId"),//参与人联系信息的唯一标识
                    statusCd : "100001",
                    contactName : $("#modTabProfile0").attr("contactName"),//参与人的联系人名称
                    headFlag :  $("#modTabProfile0").attr("headFlag"),//是否首选联系人
/*			        
			        contactType : $("#modTabProfile0").attr("contactType"),//联系人类型
			        eMail : $("#modTabProfile0").attr("eMail"),//参与人的eMail地址
			        fax : $("#modTabProfile0").attr("fax"),//传真号
			        
			        homePhone : $("#modTabProfile0").attr("homePhone"),//参与人的家庭联系电话
			        mobilePhone : $("#modTabProfile0").attr("mobilePhone"),//参与人的移动电话号码
			        officePhone : $("#modTabProfile0").attr("officePhone"),//参与人办公室的电话号码
			        postAddress : $("#modTabProfile0").attr("postAddress"),//参与人的邮件地址
			        postcode : $("#modTabProfile0").attr("postcode"),//参与人联系地址的邮政编码
			        staffId : OrderInfo.staff.staffId,//员工ID
*/			        state : "DEL"//状态
			};
			var _boPartyContactInfo = {
					contactAddress : $.trim($("#contactAddress").val()),//参与人的联系地址
			        contactDesc : $.trim($("#contactDesc").val()),//参与人联系详细信息
			        contactEmployer  : $.trim($("#contactEmployer").val()),//参与人的联系单位
			        contactGender  : $.trim($("#contactGender").val()),//参与人联系人的性别
			        contactId : $.trim($("#contactId").val()),//参与人联系信息的唯一标识
			        contactName : $.trim($("#contactName").val()),//参与人的联系人名称
			        contactType : $.trim($("#contactType").val()),//联系人类型
			        eMail : $.trim($("#eMail").val()),//参与人的eMail地址
			        fax : $.trim($("#fax").val()),//传真号
			        headFlag :  $.trim($("#headFlag  option:selected").val()),//是否首选联系人
			        homePhone : $.trim($("#homePhone").val()),//参与人的家庭联系电话
			        mobilePhone : $.trim($("#mobilePhone").val()),//参与人的移动电话号码
			        officePhone : $.trim($("#officePhone").val()),//参与人办公室的电话号码
			        postAddress : $.trim($("#postAddress").val()),//参与人的邮件地址
			        postcode : $.trim($("#postCode").val()),//参与人联系地址的邮政编码
			        staffId : OrderInfo.staff.staffId,//员工ID
			        state : "ADD",//状态
			        statusCd : "100001"//订单状态
			};
			if($("#modTabProfile0").attr("click")=="0"){
				if(_boPartyContactInfoOld.contactId!=""){
					data.boPartyContactInfo.push(_boPartyContactInfoOld);
					data.boPartyContactInfo.push(_boPartyContactInfo);
				}else{
					data.boPartyContactInfo.push(_boPartyContactInfo);
				}
				
			}
			SoOrder.submitOrder(data);
		}).ketchup({bindElement:"custInfoModifyBtn"});
	};
    //客户类型选择事件
	var _partyTypeCdChoose = function(scope) {
		var partyTypeCd=$(scope).val();
		//_partyType(partyTypeCd);
		$("#cm_identidiesTypeCd").empty();
		//客户类型关联证件类型下拉框
		_certTypeByPartyType(partyTypeCd);
		//证件类型选择事件
		_identidiesTypeCdChoose($("#div_cm_identidiesType").children(":first-child"));

	};
	var _partyType = function(partyTypeCd) {
		if(partyTypeCd==1){
			var identidiesTypeCdHtml="<select id=\"cmIdentidiesTypeCd\" onchange=\"order.prodModify.identidiesTypeCdChoose(this)\"><option value=\"1\" >身份证</option><option value=\"2\">军官证</option></select>";
		}else if(partyTypeCd==2){
			var identidiesTypeCdHtml="<select id=\"cmIdentidiesTypeCd\" onchange=\"order.prodModify.identidiesTypeCdChoose(this)\"><option value=\"3\">护照</option><option value=\"23\">ICP经营许可证</option><option value=\"39\">税务登记号</option></select>";
		};
		$("#div_cm_identidiesType").html(identidiesTypeCdHtml);
	};
	//客户类型关联证件类型下拉框
	var _certTypeByPartyType = function(_partyTypeCd){
		var params = {"partyTypeCd":_partyTypeCd} ;
		var url=contextPath+"/cust/queryCertType";
		var response = $.callServiceAsJson(url, params, {});
       if (response.code == -2) {
					$.alertM(response.data);
				}
	   if (response.code == 1002) {
					$.alert("错误","根据员工类型查询员工证件类型无数据,请配置","information");
					return;
				}
	   if(response.code==0){
					var data = response.data ;
					if(data!=undefined && data.length>0){
						for(var i=0;i<data.length;i++){
							var certTypedate = data[i];
							$("#cm_identidiesTypeCd").append("<option value='"+certTypedate.certTypeCd+"' >"+certTypedate.name+"</option>");
							
						}
					}
				}
	};
	//证件类型选择事件
	var _identidiesTypeCdChoose = function(scope) {
		var identidiesTypeCd=$(scope).val();
		if(identidiesTypeCd==undefined){
			identidiesTypeCd=$("#div_cm_identidiesType  option:selected").val();
		}
		if(identidiesTypeCd==1){
			$("#cmCustIdCard").attr("placeHolder","请输入合法身份证号码");
			$("#cmCustIdCard").attr("data-validate","validate(idCardCheck18:请输入合法身份证号码) on(blur)");
		}else if(identidiesTypeCd==2){
			$("#cmCustIdCard").attr("placeHolder","请输入合法军官证");
			$("#cmCustIdCard").attr("data-validate","validate(required:请准确填写军官证) on(blur)");
		}else if(identidiesTypeCd==3){
			$("#cmCustIdCard").attr("placeHolder","请输入合法护照");
			$("#cmCustIdCard").attr("data-validate","validate(required:请准确填写护照) on(blur)");
		}else{
			$("#cmCustIdCard").attr("placeHolder","请输入合法证件号码");
			$("#cmCustIdCard").attr("data-validate","validate(required:请准确填写证件号码) on(blur)");
		}
		_form_custInfomodify_btn();
	};
	var _custInfoModify = function(callParam) {
		var param={};
		param.partyName=OrderInfo.cust.partyName;
		param.custId=OrderInfo.cust.custId;
		//定位客户
		param.idCardNumber=OrderInfo.cust.idCardNumber;
		param.boActionTypeName=callParam.boActionTypeName;
		param.areaId=OrderInfo.getAreaId();
		$.callServiceAsHtml(contextPath + "/order/prodModify/custInfoModify", param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if (response.code == -2) {
					$.alertM(response.data);
					return;
				}
				if(response.data.indexOf("false") >=0) {
					$.alert("提示","抱歉，查询无返回客户详情信息。");
					//$.alertM(response.data);
					return;
				}
				var content$ = $("#order_fill_content");
				content$.html(response.data).show();
				//根据客户类型查询证件类型
				_partyTypeCdChoose($("#cmPartyTypeCd  option:selected"));
				//取客户证件类型
				$("#cm_identidiesTypeCd option[value='"+$("#boCustIdentities").attr("identidiesTypeCd")+"']").attr("selected", true);
				//根据证件类型对行添加校验
				_identidiesTypeCdChoose($("#cm_identidiesTypeCd option[selected='selected']"));
				
				
				$("#fillLastStep").click(function(){
					order.prodModify.cancel();
				});
				$(".ordercon").show();
				$(".ordertabcon").show();
				$("#step1").show();
				
				$(".ordercon a:first span").text("取 消");
				_form_custInfomodify_btn();
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	
	var _lossRepProd = function(callParam) {
		param=_choosedProdInfo;
		$.extend(param, callParam);
		$.callServiceAsHtml(contextPath + "/order/prodModify/lossRepProd", param, {
			"before":function(){
			},"done" : function(response){
				var content$ = $("#order_prepare");
				content$.html(response.data).show();
				$(".ordercon").show();
				$(".ordertabcon").show();
				$("#step1").show();
				$("#custInfo").hide();
				$(".ordercon a:first span").text("取 消");
			},"always":function(){
				$.unecOverlay();
			}
		});
		SoOrder.builder(CONST.ACTION_CLASS_CD.PROD_ACTION,param.boActionTypeCd);
/*		OrderInfo.actionClassCd = 1300;
		OrderInfo.boActionTypeCd = "1171";*/
/*		OrderInfo.actionClassCd = CONST.ACTION_CLASS_CD.PROD_ACTION;
		OrderInfo.boActionTypeCd = param.boActionTypeCd;
		SoOrder.builder(1300,"14");*/
	};
	//挂失 订单提交
	var _lossRepProdSubmit = function(param) {
		var data = {};
		data.orderRemark = $.trim($("#order_remark").val());
		data.boProdStatuses = [{
			prodStatusCd : 8,
			state : submitState
		}];
		SoOrder.submitOrder(data);
		//_commonSubmit(CONST.BO_ACTION_TYPE.LOSSREP_PROD,_choosedProdInfo.prodStateCd,"111111122");
	};
	var _closeDialog = function() {
		if(order.prodModify.dialogForm!=undefined&&order.prodModify.dialog!=undefined){
			order.prodModify.dialogForm.close(order.prodModify.dialog);
		}
	};
	var _removeCommit=function(prodStatusCd,boActionType,templateType){
		var inprodStatusCd="";
        var intoprodStatusCd="";
        inprodStatusCd=_choosedProdInfo.prodStateCd;
		intoprodStatusCd=prodStatusCd;
		if(inprodStatusCd==""){
			inprodStatusCd=CONST.PROD_STATUS_CD.NORMAL_PROD;
		}
		var param = _getCallRuleParam(boActionType,_choosedProdInfo.prodInstId);
		var callParam = {
			boActionTypeCd : boActionType,
			boActionTypeName : CONST.getBoActionTypeName(boActionType),
			accessNumber : _choosedProdInfo.accNbr,
			prodStatusCd : inprodStatusCd,
			toprodStatusCd : intoprodStatusCd,
			itemSpecId : CONST.BUSI_ORDER_ATTR.REMOVE_REASON,
			state:"ADD"
		};
		OrderInfo.order.templateType=templateType;
		var v_actionFlag = 0 ;
		if(boActionType==CONST.BO_ACTION_TYPE.BUY_BACK || boActionType==CONST.BO_ACTION_TYPE.BUY_BACK_CHANGE_CARD|| boActionType==CONST.BO_ACTION_TYPE.BUY_BACK_ORDER_CONTRACT){
			v_actionFlag =19;//OrderInfo.actionFlag
		}
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,boActionType,v_actionFlag,CONST.getBoActionTypeName(boActionType),templateType);
		var flag = rule.rule.prepare(param,'order.prodModify.commonPrepare',callParam);
		if(flag) return;
		//SoOrder.builder();
		
	};
	var _showMemberWin=function(){
		//Mantis 0033139: 主副卡拆机，前台需要屏蔽保留副卡 ; by jinjian;
		if(OrderInfo.busitypeflag == 7 || OrderInfo.busitypeflag == 8 || OrderInfo.busitypeflag == 9 || OrderInfo.busitypeflag == 10 || OrderInfo.busitypeflag == 11){
			return false;
		}
		_ischooseOffer=false;
		var viceCount=0;
		var offerMemberInfos=OrderInfo.offer.offerMemberInfos;
		$.each($("#delPhoneNumber ul:last li"),function(i, li){
			$(this).remove();
		});
		$.each(offerMemberInfos,function(i,offerMember){
			/*if(offerMember.roleCd != CONST.MEMBER_ROLE_CD.MAIN_CARD&&offerMember.roleCd !=CONST.MEMBER_ROLE_CD.VICE_CARD){//不是主卡卡套餐跳过
				return false;
			}*/
			if(offerMember.roleCd != CONST.MEMBER_ROLE_CD.MAIN_CARD&&_choosedProdInfo.accNbr==offerMember.accessNumber){
				viceCount=0;
				return false;
			}
			if (offerMember.roleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD&& offerMember.objType==CONST.OBJ_TYPE.PROD) {
				$("#delPhoneNumber ul:first h5").text(offerMember.roleName);
				$("#delPhoneNumber ul:first li").text(offerMember.accessNumber);
			} else if (offerMember.roleCd != CONST.MEMBER_ROLE_CD.MAIN_CARD&& offerMember.objType==CONST.OBJ_TYPE.PROD) {
				if (offerMember.accessNumber) {
					$("#delPhoneNumber ul:last h5").text(offerMember.roleName);
					var li = $("<li class='full'>").text(offerMember.accessNumber).appendTo($("#delPhoneNumber ul:last"));
					var objId=offerMember.objId;
					var objInstId=offerMember.objInstId;
					var objType=offerMember.objType;
					var offerMemberId=offerMember.offerMemberId;
					var offerRoleId=offerMember.offerRoleId;
                    var accessNumber=offerMember.accessNumber;
					li.attr("del","Y").attr("accessNumber",accessNumber).attr("objId",objId).attr("objInstId",objInstId).attr("objType",objType).attr("offerMemberId",offerMemberId).attr("offerRoleId",offerRoleId);
					$("<span  id='viceCard_"+offerMember.accessNumber+"'></span>").appendTo(li);
					var eleI = $("<i id='plan_no'><a id='' class='purchase' href='javascript:void(0)'>保留>>选择新套餐</a></i>").appendTo(li);
					eleI.click(function(){
						order.service.offerDialog('viceCard_'+offerMember.accessNumber);
					});		
				 }
			}
			 viceCount++;
		});
		if(viceCount>1){
			return true;
		}else{
			return false;
		}
	};
	//选中套餐返回
	var _chooseOfferForMember=function(specId,subpage,specName,offerRoleId){
		OrderInfo.newofferSpecName = specName;
		$("#"+subpage).html("&nbsp;&nbsp;<span style='color: #327501;'>订购新套餐：</span>"+specName);
		$("#"+subpage).parent().attr("addSpecId",specId).attr("addRoleId",offerRoleId).attr("del","N").attr("addSpecName",specName);
		_ischooseOffer=true;
		if(document.getElementById("li_"+subpage)){
			$("#li_"+subpage).css("text-decoration","").attr("del","N").attr("knew","Y");
			$("#li_"+subpage).find("i:first-child").find("a").text("拆副卡");
		}
		
	};
	//主卡拆机副卡新装套餐
	var _removeAndAdd=function(prodStatusCd,boActionType,templateType){
		var viceparam = [];
		$.each($("#delPhoneNumber ul:last li"),function(i, li){//所有副卡信息
				viceparam.push({
					objId : $(this).attr("objId"),
					objInstId : $(this).attr("objInstId"),
					objType : $(this).attr("objType"),
					offerRoleId : $(this).attr("addRoleId"),
					offerSpecId :$(this).attr("addSpecId"),
					offerMemberId:$(this).attr("offerMemberId"),
					accessNumber :$(this).attr("accessNumber"),
					del :$(this).attr("del")
				});
		});
		var inprodStatusCd="";
        var intoprodStatusCd="";
        inprodStatusCd=_choosedProdInfo.prodStateCd;
		intoprodStatusCd=prodStatusCd;
		if(inprodStatusCd==""){
			inprodStatusCd=CONST.PROD_STATUS_CD.NORMAL_PROD;
		}
		var param = _getCallRuleParam(boActionType,_choosedProdInfo.prodInstId);
		var submitFlag = (boActionType==CONST.BO_ACTION_TYPE.BUY_BACK?"buyBack":"removeAndRetainVice") ;
		var callParam = {
			boActionTypeCd : boActionType,
			boActionTypeName : CONST.getBoActionTypeName(boActionType),
			accessNumber : _choosedProdInfo.accNbr,
			prodStatusCd : inprodStatusCd,
			toprodStatusCd : intoprodStatusCd,
			itemSpecId : CONST.BUSI_ORDER_ATTR.REMOVE_REASON,
			state:"ADD",
			submitFlag:submitFlag,//"removeAndRetainVice",
			viceParam:viceparam
		};
		OrderInfo.order.templateType=templateType;
		var v_actionFlag = 0 ;
		if(boActionType==CONST.BO_ACTION_TYPE.BUY_BACK){
			v_actionFlag =20;//OrderInfo.actionFlag
		}
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,boActionType,v_actionFlag,CONST.getBoActionTypeName(boActionType),templateType);
		var flag = rule.rule.prepare(param,'order.prodModify.commonPrepare',callParam);
		if(flag) return;
		//SoOrder.builder();
		
	};
	var _commonShowDialog=function(){
		$("#delPhoneNumber .btna_o:last").click(function(){
			_closeDialog();
		});
		ec.form.dialog.createDialog({
			"id":"-delephone",
			"width":480,
			"height":400,
			"initCallBack":function(dialogForm,dialog){
				order.prodModify.dialogForm=dialogForm;
				order.prodModify.dialog=dialog;
			},
			"submitCallBack":function(dialogForm,dialog){}
		});
	};
	//欠费拆机
	var _showOweRemoveProd = function () {
		OrderInfo.busitypeflag=11;
		/*
		 * 规则后移
		if(_choosedProdInfo.stopRecordCd.indexOf("130000") < 0){
			$.alert("提示","产品必须为\"欠费停机\"时才能欠费拆机","information");
			return;
		}
		*/
		//预校验
		var inprodStatusCd=_choosedProdInfo.prodStateCd;
		var intoprodStatusCd=CONST.PROD_STATUS_CD.REMOVE_PROD;
		var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.OWE_REMOVE_PROD;
/*		if(lteFlag){
		var flag=_updateCheckByChange(CONST.ACTION_CLASS_CD.PROD_ACTION,BO_ACTION_TYPE,inprodStatusCd,intoprodStatusCd);
		if (!flag) return;
		}*/
		if(!query.offer.setOffer()){
			return;
		}
		if(_showMemberWin()){
			$("#delPhoneTitle").html(CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.OWE_REMOVE_PROD)+'-是否保留成员');			
			$("#delPhoneNumber .btna_o:first").off("click").on("click",function(event){
				_closeDialog();
				_removeAndAdd(CONST.PROD_STATUS_CD.REMOVE_PROD,CONST.BO_ACTION_TYPE.OWE_REMOVE_PROD,8);
			});			
			_commonShowDialog();
		}else{
			_removeCommit(CONST.PROD_STATUS_CD.REMOVE_PROD,CONST.BO_ACTION_TYPE.OWE_REMOVE_PROD,8);
		}
	};
	
	//拆机
	var _showRemoveProd = function () {
		OrderInfo.busitypeflag=8;
		/*if(_choosedProdInfo.prodStateCd!='100000'){
			$.alert("提示","产品状态为\"在用\"时才能拆机","information");
			return;
		}*/
		//预校验
		var inprodStatusCd=_choosedProdInfo.prodStateCd;
		var intoprodStatusCd=CONST.PROD_STATUS_CD.REMOVE_PROD;
		var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.REMOVE_PROD;
/*		if(lteFlag){
			var flag=_updateCheckByChange(CONST.ACTION_CLASS_CD.PROD_ACTION,BO_ACTION_TYPE,inprodStatusCd,intoprodStatusCd);
			if (!flag) return;
		}*/
		if(!query.offer.setOffer()){
			return;
		}
		if(_showMemberWin()){
			$("#delPhoneTitle").html(CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.REMOVE_PROD)+'-是否保留成员');			
			$("#delPhoneNumber .btna_o:first").off("click").on("click",function(event){
				_closeDialog();
				_removeAndAdd(CONST.PROD_STATUS_CD.REMOVE_PROD,CONST.BO_ACTION_TYPE.REMOVE_PROD,1);
			});			
			_commonShowDialog();
		}else{
			_removeCommit(CONST.PROD_STATUS_CD.REMOVE_PROD,CONST.BO_ACTION_TYPE.REMOVE_PROD,1);
		}
	};
	
	//预拆机
	var _showOrderRemoveProd = function() {
		OrderInfo.busitypeflag=7;
		//预校验
		var inprodStatusCd=_choosedProdInfo.prodStateCd;
		var intoprodStatusCd=CONST.PROD_STATUS_CD.STOP_PROD;
		var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.PREMOVE_PROD;
/*		if(lteFlag){
			var flag=_updateCheckByChange(CONST.ACTION_CLASS_CD.PROD_ACTION,BO_ACTION_TYPE,inprodStatusCd,intoprodStatusCd);
			if (!flag) return;
		}*/
		if(!query.offer.setOffer()){
			return;
		}
		if(_showMemberWin()){
			$("#delPhoneTitle").html(CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PREMOVE_PROD)+'-是否保留成员');			
			$("#delPhoneNumber .btna_o:first").off("click").on("click",function(event){
				_closeDialog();
				_removeAndAdd(CONST.PROD_STATUS_CD.STOP_PROD,CONST.BO_ACTION_TYPE.PREMOVE_PROD,1);
			});			
			_commonShowDialog();
		}else{
			_removeCommit(CONST.PROD_STATUS_CD.STOP_PROD,CONST.BO_ACTION_TYPE.PREMOVE_PROD,1);
		}
	};
	
	//预拆机复机
	var _showCoverOrderRemoveProd = function() {
		OrderInfo.busitypeflag=0;
		/*
		 * 规则后移
		if(_choosedProdInfo.prodStateCd!='120000'){
			$.alert("提示","产品状态为\"拆机\"时才能复机","information");
			return;
		}
		*/
		var inprodStatusCd="";
        var intoprodStatusCd="";
        inprodStatusCd=_choosedProdInfo.prodStateCd;
		intoprodStatusCd=CONST.PROD_STATUS_CD.NORMAL_PROD;
		if(inprodStatusCd==""){
			inprodStatusCd=CONST.PROD_STATUS_CD.NORMAL_PROD;
		}
		var param = _getCallRuleParam(CONST.BO_ACTION_TYPE.PREMOVE_BACK_PROD,_choosedProdInfo.prodInstId);
		var callParam = {
			boActionTypeCd : CONST.BO_ACTION_TYPE.PREMOVE_BACK_PROD,
			boActionTypeName : CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PREMOVE_BACK_PROD),
			accessNumber : _choosedProdInfo.accNbr,
			prodStatusCd : inprodStatusCd,
			toprodStatusCd : intoprodStatusCd,
			itemSpecId : CONST.BUSI_ORDER_ATTR.REMOVE_REASON,
			state:"ADD"
		};
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.PREMOVE_BACK_PROD,0,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PREMOVE_BACK_PROD),"");
		var flag = rule.rule.prepare(param,'order.prodModify.commonPrepare',callParam);
		if (flag) return;
		//SoOrder.builder();
		
	};
	
	//违章拆机
	var _showBreakRuleRemoveProd = function() {
		OrderInfo.busitypeflag=9;
		/*
		 * 规则后移
		if(_choosedProdInfo.prodStateCd!='100000'){
			$.alert("提示","产品状态为\"在用\"时才能拆机","information");
			return;
		}
		*/
		//预校验
		var inprodStatusCd=_choosedProdInfo.prodStateCd;
		var intoprodStatusCd=CONST.PROD_STATUS_CD.REMOVE_PROD;
		var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.BREAK_RULE_REMOVE_PROD;
/*		if(lteFlag){
			var flag=_updateCheckByChange(CONST.ACTION_CLASS_CD.PROD_ACTION,BO_ACTION_TYPE,inprodStatusCd,intoprodStatusCd);
			if (!flag) return;
		}*/
		if(!query.offer.setOffer()){
			return;
		}
		if(_showMemberWin()){
			$("#delPhoneTitle").html(CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.BREAK_RULE_REMOVE_PROD)+'-是否保留成员');			
			$("#delPhoneNumber .btna_o:first").off("click").on("click",function(event){
				_closeDialog();
				_removeAndAdd(CONST.PROD_STATUS_CD.REMOVE_PROD,CONST.BO_ACTION_TYPE.BREAK_RULE_REMOVE_PROD,1);
			});			
			_commonShowDialog();
		}else{
			_removeCommit(CONST.PROD_STATUS_CD.REMOVE_PROD,CONST.BO_ACTION_TYPE.BREAK_RULE_REMOVE_PROD,1);
		}
	};
	//未激活拆机
	var _showNoActiveRemoveProd = function() {
		OrderInfo.busitypeflag=10;
		/*if(_choosedProdInfo.prodStateCd!=CONST.PROD_STATUS_CD.READY_PROD){
			$.alert("提示","产品状态为未激活(预开通)时才能拆机","information");
			return;
		}*/
		//预校验
		var inprodStatusCd=_choosedProdInfo.prodStateCd;
		var intoprodStatusCd=CONST.PROD_STATUS_CD.REMOVE_PROD;
		var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.NOACTIVE_REMOVE_PROD;
		/*if(lteFlag){
		var flag=_updateCheckByChange(CONST.ACTION_CLASS_CD.PROD_ACTION,BO_ACTION_TYPE,inprodStatusCd,intoprodStatusCd);
		if (!flag) return;
		}*/
		var inprodStatusCd="";
        var intoprodStatusCd="";
        inprodStatusCd=_choosedProdInfo.prodStateCd;
		intoprodStatusCd=CONST.PROD_STATUS_CD.REMOVE_PROD;
		if(inprodStatusCd==""){
			inprodStatusCd=CONST.PROD_STATUS_CD.NORMAL_PROD;
		}
		var param = _getCallRuleParam(CONST.BO_ACTION_TYPE.NOACTIVE_REMOVE_PROD,_choosedProdInfo.prodInstId);
		var callParam = {
			boActionTypeCd : CONST.BO_ACTION_TYPE.NOACTIVE_REMOVE_PROD,
			boActionTypeName : CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.NOACTIVE_REMOVE_PROD),
			accessNumber : _choosedProdInfo.accNbr,
			prodStatusCd : inprodStatusCd,
			toprodStatusCd : intoprodStatusCd,
			itemSpecId : CONST.BUSI_ORDER_ATTR.REMOVE_REASON,
			state:"ADD"
		};
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.NOACTIVE_REMOVE_PROD,0,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.NOACTIVE_REMOVE_PROD),"");
		var flag = rule.rule.prepare(param,'order.prodModify.commonPrepare',callParam);
		if (flag) return;
		//SoOrder.builder();
		
	};
	
	//只有订单信息的变更页面公共方法
	var _commonPrepare = function(param) {
		$.callServiceAsHtml(contextPath + "/order/prodModifyCommon", param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},"done" : function(response){
				var content$ = $("#order_fill_content");
				content$.html(response.data).show();
				$("#ordercon").show();
				$("#ordertabcon").show();
				order.prepare.step(1);
				OrderInfo.order.step=1;//订单备注页面
				$("#orderedprod").hide();
				$("#order_prepare").hide();
				$(".ordercon a:first span").text("取 消");
				$(".main_body").css("height","150px");
				$(".main_body").css("min-height","150px");
				$("#order_confirm").empty();
				$("#fillLastStep").click(function(){
					order.prodModify.cancel();
				});
				if(lteFlag){
					_remark_prodPass();//二次业务产品密码鉴权配置 
					if(OrderInfo.password_remark!=null){
					if((OrderInfo.password_remark).indexOf("'"+OrderInfo.boActionTypeCd+"'") >= 0){
					  $("#orderPassRemarkDiv").show();
					}}
				}
				$("#fillNextStep").unbind("click").bind("click",function(){
					if(param.submitFlag=='removeAndRetainVice'){
						_commitRetainVice(param);
					}else if(param.submitFlag=='buyBack'){
						_commitBuyBack(param);
					}else if(param.submitFlag=='removeProd'){
						order.memberChange.removeAndAdd(param);
					}else{
						_commonSubmit(param.boActionTypeCd,param.prodStatusCd,param.toprodStatusCd,param.itemSpecId,param.state);
					}
					OrderInfo.order.step=2;//订单确认页面
				});
				$("#templateOrderDiv").hide();
				if(param.boActionTypeCd==CONST.BO_ACTION_TYPE.OWE_REMOVE_PROD){
					$("#templateOrderDiv").show();
				}
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	var _commitRetainVice=function(param){
		//alert(param.submitFlag);
		//alert(OrderInfo.offer.offerId);
		OrderInfo.actionFlag=7;
		SoOrder.submitOrder(param.viceParam);
	};
	var _commitBuyBack=function(param){
		OrderInfo.actionFlag=20;
		var params = {viceParam:param.viceParam,remark:$("#order_remark").val()};
		SoOrder.submitOrder(params);
	};
	var _commonSubmit = function(boActionTypeCd,prodStatusCd,toprodStatusCd,itemSpecId,state) {
		//产品密码鉴权
		if(lteFlag){
			if((OrderInfo.password_remark).indexOf("'"+OrderInfo.boActionTypeCd+"'") >= 0){
				if(!_prodPassRemark()){
					return;
				};
			}
		};
		OrderInfo.actionClassCd = CONST.ACTION_CLASS_CD.PROD_ACTION;
		OrderInfo.boActionTypeCd = boActionTypeCd;
		if(_isNullParam(prodStatusCd)){
			prodStatusCd=CONST.PROD_STATUS_CD.NORMAL_PROD;
		}
		if(_isNullParam(toprodStatusCd)){
			toprodStatusCd=CONST.PROD_STATUS_CD.STOP_PROD;
		}
		var data = {};
		if(!_isNullParam(prodStatusCd)) {
			if(boActionTypeCd!=null &&boActionTypeCd!=''){
				if(boActionTypeCd!=CONST.BO_ACTION_TYPE.BUY_BACK_CHANGE_CARD && boActionTypeCd!=CONST.BO_ACTION_TYPE.BUY_BACK_ORDER_CONTRACT){
					data.boProdStatuses = [{
						//atomActionId : OrderInfo.SEQ.atomActionSeq--,
						prodStatusCd : prodStatusCd,
						state : "DEL"
					},{
						//atomActionId : OrderInfo.SEQ.atomActionSeq--,
						prodStatusCd : toprodStatusCd,
						state : "ADD"
					}
					];
				}
				if(boActionTypeCd==CONST.BO_ACTION_TYPE.BUY_BACK_ORDER_CONTRACT){
					data.ooRoles =[{
						objId : OrderInfo.offer.offerMemberInfos[0].objId,
						objInstId : OrderInfo.offer.offerMemberInfos[0].objInstId,
						objType : OrderInfo.offer.offerMemberInfos[0].objType,
						offerRoleId : OrderInfo.offer.offerMemberInfos[0].offerRoleId,
						state : "DEL",
						roleName : OrderInfo.offer.offerMemberInfos[0].roleName
					}];
				}
			}else{
				data.boProdStatuses = [{
					//atomActionId : OrderInfo.SEQ.atomActionSeq--,
					prodStatusCd : prodStatusCd,
					state : "DEL"
				},{
					//atomActionId : OrderInfo.SEQ.atomActionSeq--,
					prodStatusCd : toprodStatusCd,
					state : "ADD"
				}
				];
			}
		}
		if(!_isNullParam(itemSpecId)) {
			data.busiOrderAttrs = [{
				//atomActionId : OrderInfo.SEQ.atomActionSeq--,
				itemSpecId : itemSpecId,
				value : $.trim($("textarea[id^=order_remark]").val())
			}];
		}
		SoOrder.submitOrder(data);
	};
	var _prodPassRemark = function (){
		var param = {};
		param.prodPwd = $.trim($("#remark_password").val());
		if(param.prodPwd==""){
			$.alert("提示","抱歉，您输入的密码不能为空，请重新输入!");
			return false;
		}
		//param.areaId = 21;//TODO need modify
		//param.accessNumber="11969577";;//TODO need modify
		param.accessNumber=order.prodModify.choosedProdInfo.accNbr;
		param.areaId=order.prodModify.choosedProdInfo.areaId;
		var url = contextPath+"/order/prodModify/prodAuth";
		var response = $.callServiceAsJson(url, param, {"before":function(){
			$.ecOverlay("<strong>产品密码鉴权中,请稍等...</strong>");
		}});
		if (response.code != 0||response.data!="true") {
			$.unecOverlay();
			$.alert("提示","抱歉，您输入的密码有误，请重新输入。");
			return false;
		};
		$.unecOverlay();
		return true;
	};
	
	function _gotoOrderModify(response){
		var content$ = $("#order_fill_content");
		content$.html(response.data).show();
		
		$(".main_div .h2_title").append(_choosedProdInfo.productName+"-"+_choosedProdInfo.accNbr);
		
		$("#ordercon").show();
		$("#ordertabcon").show();
		order.prepare.step(1);
		$("#orderedprod").hide();
		$("#order_prepare").hide();
		$(".ordercon a:first span").text("取 消");
		$(".main_body").css("height","150px");
		$(".main_body").css("min-height","150px");
		$("#order_confirm").empty();
		$("#fillLastStep").click(function(){
			order.prodModify.cancel();
		});
		/*
		$("#fillNextStep").unbind("click").bind("click",function(){
			_commonSubmit(param.boActionTypeCd,param.prodStatusCd,param.itemSpecId,param.state);
		});
		*/
		
	}
	
	//修改产品实例属性:修改使用人
	var _spec_parm_user_change = function(){
		var valid = false;
		if(OrderInfo.cust && OrderInfo.cust.custId && OrderInfo.cust.custId != '-1'){ //老客户
			valid = OrderInfo.cust.segmentId == '1000'; //政企客户
		}
		if(!valid){
			$.alert('提示', '非政企客户不能办理修改使用人业务');
			return;
		}
		
		OrderInfo.busitypeflag=4;
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.PRODUCT_PARMS,0,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PRODUCT_PARMS),"");
		var param = _getCallRuleParam(CONST.BO_ACTION_TYPE.PRODUCT_PARMS,_choosedProdInfo.prodInstId);
		var callParam = {
			boActionTypeCd : CONST.BO_ACTION_TYPE.PRODUCT_PARMS,
			boActionTypeName : CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PRODUCT_PARMS),
			accessNumber : _choosedProdInfo.accNbr,
			prodOfferName : _choosedProdInfo.prodOfferName
		};
		//OrderInfo.actionFlag=33;//改产品属性
		rule.rule.prepare(param,'order.prodModify.spec_parm_user_show',callParam);
	};
	
	//产品实例属性:使用人-展示
	var _spec_parm_user_show = function(){
		var param={
				prodInstId:_choosedProdInfo.prodInstId,
				offerSpecId:_choosedProdInfo.prodOfferId,
				prodSpecId:_choosedProdInfo.productId,
				partyId:OrderInfo.cust.custId,
				acctNbr:_choosedProdInfo.accNbr,
				areaId:_choosedProdInfo.areaId
		};
		$.callServiceAsHtmlGet(contextPath + "/order/orderSpecParamUserChange",param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}
				if(response && response.data){
					if(response.data==0||response.data==1){
						$.alert("提示","该产品无使用人产品实例属性！");
					}else if(response.data==-1){
						$.alert("提示","产品实例属性加载异常！");
					}else{
						//$("#"+param.ul_id).append(response.data);
						_gotoOrderModify(response);		
					}
				}else{
					$.alert("提示","产品实例属性加载异常");
				}
			}
		});	
		
	};
	
	//修改产品实例属性
	var _spec_parm_change= function(){	
		OrderInfo.busitypeflag=4;
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.PRODUCT_PARMS,0,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PRODUCT_PARMS),"");
		var param = _getCallRuleParam(CONST.BO_ACTION_TYPE.PRODUCT_PARMS,_choosedProdInfo.prodInstId);
		var callParam = {
			boActionTypeCd : CONST.BO_ACTION_TYPE.PRODUCT_PARMS,
			boActionTypeName : CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PRODUCT_PARMS),
			accessNumber : _choosedProdInfo.accNbr,
			prodOfferName : _choosedProdInfo.prodOfferName
		};
		//OrderInfo.actionFlag=33;//改产品属性
		var checkRule = rule.rule.prepare(param,'order.prodModify.spec_parm_show',callParam);
	};
	//产品实例属性-展示
	var _spec_parm_show = function(){
		var param={
				prodInstId:_choosedProdInfo.prodInstId,
				offerSpecId:_choosedProdInfo.prodOfferId,
				prodSpecId:_choosedProdInfo.productId,
				partyId:OrderInfo.cust.custId,
				acctNbr:_choosedProdInfo.accNbr,
				areaId:_choosedProdInfo.areaId
		};
		$.callServiceAsHtmlGet(contextPath + "/order/orderSpecParamChange",param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}
				if(response && response.data){
					if(response.data==0||response.data==1){
						$.alert("提示","该产品无产品实例属性！");
					}else if(response.data==-1){
						$.alert("提示","产品实例属性加载异常！");
					}else{
						//$("#"+param.ul_id).append(response.data);
						_gotoOrderModify(response);		
					}
				}else{
					$.alert("提示","产品实例属性加载异常");
				}
			}
		});	
		
	};
	
	//修改产品密码 
	var _showPasswordChange = function () {
		OrderInfo.busitypeflag=17;
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.PRODUCT_PASSWORD,0,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PRODUCT_PASSWORD),"");
		var param = _getCallRuleParam(CONST.BO_ACTION_TYPE.PRODUCT_PASSWORD,_choosedProdInfo.prodInstId);
		var callParam = {
			boActionTypeCd : CONST.BO_ACTION_TYPE.PRODUCT_PASSWORD,
			boActionTypeName : CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PRODUCT_PASSWORD),
			accessNumber : _choosedProdInfo.accNbr,
			prodOfferName : _choosedProdInfo.prodOfferName
		};
		OrderInfo.actionFlag=31;//改产品密码
		var checkRule = rule.rule.prepare(param,'order.prodModify.spec_password_change',callParam);
	};
	//修改产品密码
	var _spec_password_change= function(){
		var param={"accNbr":_choosedProdInfo.accNbr};
		$.callServiceAsHtmlGet(contextPath + "/order/orderPasswordChange",param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				_gotoOrderModify(response);
				$('#password_form').bind('formIsValid',_spec_password_change_check).ketchup({bindElement:"btsubmit"});
			}
		});	
	};
	//产品密码修改-鉴权
	function _spec_password_change_check(){
		//SoOrder.builder();
		//SoOrder.builder(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.PRODUCT_PASSWORD);
		if("none"!=$("#li_password_old").css("display")){
			if(!$("#password_old").val()){
				$.alert("操作提示","请输入 原产品密码");
				return ;
			}
		}
		if(!$("#password_change1").val()){
			$.alert("操作提示","请输入 产品密码");	
			return ;
		}else if(!$("#password_change2").val()){
			$.alert("操作提示","请输入 确认密码");	
			return ;
		}else if($("#password_change1").val()!=$("#password_change2").val()){
			$.alert("操作提示","两次密码不一致");	
			return ;
		}
		var reg = new RegExp("^([0-9]{6})$");//6位纯数字 0~9
		if(!reg.test($("#password_change1").val())){
			$.alert("提示","密码包含非数字或长度不是6位！");
			return;
		}
		var param = {
				password_old:$("#password_old").val(),
				accessNumber:_choosedProdInfo.accNbr,
				areaId:_choosedProdInfo.areaId
		} ;
		$.callServiceAsHtml(contextPath+"/order/orderPasswordCheck",param,{
			"before":function(){
				$.ecOverlay("<strong>正在提交中,请稍等...</strong>");
			},"done" : function(response){
				if(response && response.code == -2){
					return ;
				}
				var data = eval("(" + response.data + ")");
				//alert("--"+data.successed);
				if(data.successed==true||data.successed=="true"){
					_spec_password_change_save();
				}else{
					$.alert("密码校验失败",data.data);
					$.unecOverlay();
					return;
				}
			}
		});
	}
	//产品密码修改-提交
	function _spec_password_change_save(){
		var boProdPasswords = new Array();
		var boProdPasswords_del = {
				prodId : _choosedProdInfo.prodInstId, //从页面头部div获取
				prodPwTypeCd : "2", //密码类型
				pwd : $("#password_old").val(), //密码
				state : "DEL"  //动作
			};
		var boProdPasswords_add = {
				prodId : _choosedProdInfo.prodInstId, //从页面头部div获取
				prodPwTypeCd : "2", //密码类型
				pwd : $("#password_change1").val(), //密码
				state : "ADD"  //动作
			};
		boProdPasswords.push(boProdPasswords_del);
		boProdPasswords.push(boProdPasswords_add);
		var data = {boProdPasswords:boProdPasswords} ;
		OrderInfo.actionFlag=31;//改产品密码
		SoOrder.submitOrder(data);
		
	}
	
	
	//密码重置 校验
	var _showPasswordReset = function () {
		OrderInfo.busitypeflag=0;
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.PRODUCT_PASSWORD,0,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PRODUCT_PASSWORD),"");
		var param = _getCallRuleParam(CONST.BO_ACTION_TYPE.PRODUCT_PASSWORD,_choosedProdInfo.prodInstId);
		var callParam = {
			boActionTypeCd : CONST.BO_ACTION_TYPE.PRODUCT_PASSWORD,
			boActionTypeName : CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PRODUCT_PASSWORD),
			accessNumber : _choosedProdInfo.accNbr,
			prodOfferName : _choosedProdInfo.prodOfferName
		};
		OrderInfo.actionFlag=32;//重置产品密码
		var checkRule = rule.rule.prepare(param,'order.prodModify.spec_password_reset',callParam);
	};
	//密码重置 修改
	var _spec_password_reset= function(){
		$.callServiceAsHtmlGet(contextPath + "/order/orderPasswordReset",null, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				_gotoOrderModify(response);
				//$('#password_form').bind('formIsValid').ketchup();
				$('#password_form').bind('formIsValid',_spec_password_reset_save).ketchup({bindElement:"btsubmit"});
			}
		});	
	};
	//密码重置 保存
	function _spec_password_reset_save(){
		/*
		if(!$("#password_change1").val()){
			$.alert("操作提示","请输入 产品密码");
			return ;
		}else if(!$("#password_change2").val()){
			$.alert("操作提示","请输入 确认密码");	
			return ;
		}else if($("#password_change1").val()!=$("#password_change2").val()){
			$.alert("操作提示","两次密码不一致");	
			return ;
		}
		*/
		
		var boProdPasswords = new Array();
		var boProdPasswords_del = {
				prodId : _choosedProdInfo.prodInstId, //从页面头部div获取
				prodPwTypeCd : "2", //密码类型
				pwd : "", //密码
				state : "DEL"  //动作
			};
		var boProdPasswords_add = {
				prodId : _choosedProdInfo.prodInstId, //从页面头部div获取
				prodPwTypeCd : "2", //密码类型
				pwd : "111111",//$("#password_change1").val(), //密码
				state : "ADD"  //动作
			};
		boProdPasswords.push(boProdPasswords_del);
		boProdPasswords.push(boProdPasswords_add);
		var data = {boProdPasswords:boProdPasswords} ;
		OrderInfo.actionFlag=32;//重置产品密码
		SoOrder.submitOrder(data);
	}
	
	//修改短号：校验
	function _shortnum_change(){
		//SoOrder.builder();
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.PRODUCT_PARMS,0,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PRODUCT_PARMS),"");
		var param = _getCallRuleParam(CONST.BO_ACTION_TYPE.PRODUCT_PARMS,_choosedProdInfo.prodInstId);
		var callParam = {
			boActionTypeCd : CONST.BO_ACTION_TYPE.PRODUCT_PARMS,
			boActionTypeName : CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PRODUCT_PARMS),
			accessNumber : _choosedProdInfo.accNbr,
			prodOfferName : _choosedProdInfo.prodOfferName
		};
		OrderInfo.actionFlag=34;//修改短号
		var checkRule = rule.rule.prepare(param,'order.prodModify.shortnum_show',callParam);
	}
	//修改短号--展示
	function _shortnum_show(id){
		var param={"prodId":_choosedProdInfo.prodInstId,acctNbr:_choosedProdInfo.accNbr};
		$.callServiceAsHtmlGet(contextPath + "/order/orderShortnumChange",param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}
				if(response && response.data){
					if(response.data==0){
						$.alert("提示","该产品无短号信息！");
					}else if(response.data==-1){
						$.alert("提示","加载短号信息异常！");
					}else{
						_gotoOrderModify(response);		
					}
				}else{
					$.alert("提示","短号加载异常");
				}
			}
		});	
	}
	function _shortnum_change_val(obj){
		if($(obj).attr("checkSta")=="2"&&$(obj).val()!=$(obj).attr("changeval")){
			$(obj).attr("checkSta","0");
		}
		/*
		var shortnum_sel = $("#shortnum_sel").val();
		var id = $("#ul_"+shortnum_sel).attr("t_id");
		var shortnum_val = $("#"+id).val() ;
		if($("#"+id).attr("checkSta")=="2"&&shortnum_val!=$("#"+id).attr("changeval")){
			$("#"+id).attr("checkSta","0");
		}
		*/
	}
	function _shortnum_check(){
		var shortnum_sel = $("#shortnum_sel").val();
		var id = $("#ul_"+shortnum_sel).attr("t_id");
		var shortnum_val = $("#"+id).val() ;
		var reg = new RegExp("^[0-9]*$");
		if(null==shortnum_val||""==shortnum_val){
			$.alert("提示","请输入新的短号");
			return;
		}else if(shortnum_val==$("#"+id).attr("oldval")){
			$.alert("提示","短号未修改，请修改后再校验");
			return ;
		}else if(!reg.test(shortnum_val)){
			$.alert("提示", "短号只能为数字，请重新输入！");
			return;
		}else if(shortnum_val==$("#"+id).attr("changeval")){
			if($("#"+id).attr("checkSta")=="2"){
				$.alert("提示", "短号已校验成功，可以使用！");
				return;
			}else if($("#"+id).attr("checkSta")=="1"){
				$.alert("提示", "短号未通过校验，请修改再试！");
				return;
			}
		}
		var param = {
				groupNbr:$("#"+id).attr("groupNbr"),//"18900000000",//
				extProdId:$("#"+id).attr("extProdId"),//"255",//
				productNbr:"",
				accNbr:_choosedProdInfo.accNbr,//18108880390,//
				extPordInstId:$("#"+id).attr("extPordInstId"),
				groupShortNbr:shortnum_val,
				lanId:$("#"+id).attr("lanId"),//"8320100",//
				checkNbr:$("#"+id).attr("changeval")
			};
		var url = contextPath+"/order/checkReleaseShortNum";
		$.callServiceAsJson(url,param,{
			"before":function(){
				$.ecOverlay("<strong>短号校验中,请稍等...</strong>");
			},"always":function(){
				$.unecOverlay();
			},"done" : function(response){
				$("#"+id).attr("changeval",shortnum_val);
				if (response.code == 0) {
					$("#"+id).attr("checkSta","2");
					$("#uimCheck").removeClass().addClass("order_check");
					$.alert("提示",response.data);
					return ;
				}else{
					$("#"+id).attr("checkSta","1");
					$.alert("提示",response.data);
					$("#uimCheck").removeClass().addClass("order_check_error");
					return ;
				}
			},"fail":function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
				return ;
			}
		});	
	}
	
	//修改短号--提交
	function _shortnum_save(){
		var shortnum_sel = $("#shortnum_sel").val();
		var id = $("#ul_"+shortnum_sel).attr("t_id");
		var shortnum_val = $("#"+id).val() ;
		if(shortnum_val==$("#"+id).attr("oldval")){
			$.alert("提示","短号未修改，请修改并校验");
			return;
		}else if($("#"+id).attr("checkSta")=="0"){
			$.alert("提示","短号未校验，请校验后再提交！");
			return ;
		}else if($("#"+id).attr("checkSta")=="1"){
			$.alert("提示","短号未通过校验，请修改再试！");
			return ;
		}
		//SoOrder.builder(CONST.ACTION_CLASS_CD.SHORTNUM_ACTION,CONST.BO_ACTION_TYPE.SHORT_NUM);
		
		//OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.PRODUCT_PARMS,0,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PRODUCT_PARMS),"");
		//SoOrder.builder();
		var boProdCompItems = new Array();
		var boProdCompItems_row = {itemSpecId:$("#"+id).attr("itemSpecId"),name:"",prodCompId:$("#"+id).attr("prodCompId"),state:"DEL",value:$("#"+id).attr("oldval")} ;
		boProdCompItems.push(boProdCompItems_row);
		boProdCompItems_row = {itemSpecId:$("#"+id).attr("itemSpecId"),name:"",prodCompId:$("#"+id).attr("prodCompId"),state:"ADD",value:$("#"+id).val()} ;
		boProdCompItems.push(boProdCompItems_row);
		var boProdCompOrders_row = {"prodCompRelaRoleCd":$("#"+id).attr("prodCompRelaRoleCd"),"compProdId":$("#"+id).attr("compProdId"),"prodCompId":$("#"+id).attr("prodCompId")} ;
		var boProdCompOrders = new Array();
		boProdCompOrders.push(boProdCompOrders_row);
		var data = {boProdCompItems:boProdCompItems,boProdCompOrders:boProdCompOrders} ;
		//alert(JSON.stringify(data));
		//return ;
		OrderInfo.actionFlag=34;//修改短号
		SoOrder.submitOrder(data);
		
	}
	
	
	
	var _isNullParam = function(data){
		return data == undefined || !data;
	};
	
	//补换卡
	var _changeCard = function(param){
		//SoOrder.builder();
		
		$.callServiceAsHtml(contextPath+"/order/changeCard", param, {
			"before":function(){
			},
			"done" : function(response){
				var content$ = $("#order_fill_content");
				content$.html(response.data).show();
				$("#fillLastStep").click(function(){
					order.prodModify.cancel();
				});
				$(".ordercon").show();
				$(".ordertabcon").show();
				$(".h2_title").append(_choosedProdInfo.productName+"-"+_choosedProdInfo.accNbr);
				order.prepare.step(1);
				$("#orderedprod").hide();
				$("#order_prepare").hide();
			},
			"always":function(){
				$.unecOverlay();
			}
		});
		
	};	
	
	var compspecGrps = "";
	var getCompInfo = function(compspecparam){
		var grprlue = ""
		var returndata = $.callServiceAsJson(contextPath+"/order/compPspecGrps", compspecparam, {});
		if(returndata.code == 0){
			if(returndata.data.length!=0){
				grprlue = returndata.data;
				compspecGrps = grprlue;//compspecGrps 其他地方用，弹窗显示的角色分类。grprlue 判断存不存在角色
			}
			return grprlue;
		}else if(returndata.code == -2){
			$.alertM(returndata.data);
			return "";
		}else{
			$.alert("提示","该产品不是组合产品，请重新选择！");
			return "";
		}
	};
	var _addComp = function(param){
		
		OrderInfo.initData("","",12,"纳入成员");
		SoOrder.builder();
		var compparam ={};
		$.callServiceAsHtml(contextPath+"/order/addComp", compparam, {
			"done" : function(response){
				var content$ = $("#order_fill_content");
				content$.html(response.data).show();
				$("#fillLastStep").click(function(){
					order.prodModify.cancel();
				});
				$(".ordercon").show();
				$(".ordertabcon").show();
				order.prepare.step(1);
				$(".h2_title").append(_choosedProdInfo.productName+"-"+_choosedProdInfo.accNbr);
				$("#orderedprod").hide();
				$("#order_prepare").hide();
			},
			"always":function(){
				$.unecOverlay();
			}
		});
	};
	
	//退出群组
	var _removeComp = function(param){
		
		OrderInfo.initData("","",12,"退出成员");
		SoOrder.builder();
		var compparam ={};
		$.callServiceAsHtml(contextPath+"/order/removeComp", compparam, {
			"done" : function(response){
				var content$ = $("#order_fill_content");
				content$.html(response.data).show();
				$("#fillLastStep").click(function(){
					order.prodModify.cancel();
				});
				$(".h2_title").append(_choosedProdInfo.productName+"-"+_choosedProdInfo.accNbr);
				$(".ordercon").show();
				$(".ordertabcon").show();
				order.prepare.step(1);
				$("#orderedprod").hide();
				$("#order_prepare").hide();
			},
			"always":function(){
				$.unecOverlay();
			}
		});
	};
	
	//查询群组的账号
	var _queryRomveAcc = function(){
		var prodnum = $.trim($("#removeAcc").val());
		if(prodnum==""){
			$.alert("提示","请输入需要查询的接入号！");
			return;
		}else{
			var params = {
				"compProdId":_choosedProdInfo.prodInstId,
				"accessNumber":prodnum
			};
		}
		var removephones = getChoosedMenbr();
		if(removephones.length!=0){
			for(var i=0;i<removephones.length;i++){
				if(prodnum==removephones[i]){
					$.alert("提示","该号码已经在待退出成员中，请重新选择！");
					return;
				}
			}
		}
		var url = contextPath+"/order/queryCompmenber";
		$.callServiceAsJson(url,params, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"done" : function(response){
				if (response.code == 0) {
					var compProdMemberInfos = response.data;
					if(compProdMemberInfos.length>0){
						var prodmenber = compProdMemberInfos[0];
						var addnbrhtml="<li id='li_"+prodmenber.accessNumber+"' prodInstId='"+prodmenber.prodId+"' phonenumber='"+prodmenber.accessNumber+"' prodCompRelaRoleCd='"+prodmenber.prodCompRelaRoleCd+
						"' prodCompRelaRoleName='"+prodmenber.prodCompRelaRoleName+"' prodCompId='"+prodmenber.prodCompId+"'>"+
						"<dd class='delete' onclick='order.prodModify.removeCompDelSelect(this);'></dd><span id='addNbr'>"+prodmenber.accessNumber+"</span>";
						$("#choosed_menbers").append(addnbrhtml);
					}else{
						$.alert("提示","该号不在群组成员中，请重新选择！");
						return;
					}
				}else if(response.code == -2){
					$.alertM(response.data);
				}else{
					$.alert("提示",response.data);
					return;
				}
			},
			"always":function(){
				$.unecOverlay();
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","套餐加载失败，请稍后再试！");
			}
		});		
	};
	
	//可选包订购退订
	var _orderAttachOffer = function () {
		OrderInfo.busitypeflag=14;
		AttachOffer.init();
	};
	
	//套餐变更
	var _changeOffer = function () {
		OrderInfo.busitypeflag=2;
		OrderInfo.oldprodInstInfos = [];
		OrderInfo.oldofferSpec = [];
		OrderInfo.oldoffer = [];
		OrderInfo.oldAddNumList = [];
		offerChange.init();
	};
	
	//改付费帐户规则校验
	var _showChangeAccount = function(){
		OrderInfo.busitypeflag=16;
		var param = _getCallRuleParam(CONST.BO_ACTION_TYPE.CHANGE_ACCOUNT,_choosedProdInfo.prodInstId);
		var callParam = {
				boActionTypeCd : CONST.BO_ACTION_TYPE.CHANGE_ACCOUNT,
				boActionTypeName : CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.CHANGE_ACCOUNT),
				accessNumber : _choosedProdInfo.accNbr,
				prodOfferName : _choosedProdInfo.prodOfferName
			};
		var flag = rule.rule.prepare(param,'order.prodModify.changeAccount',callParam);
		if (flag) return;
		//SoOrder.builder();
	};
	
	//获取产品原帐户信息并转至改付费帐户页面
	var _changeAccount = function(){
		if(!_choosedProdInfo.prodInstId || !_choosedProdInfo.accNbr){
			$.alert("提示","产品信息定位异常，请联系管理员");
			$("#orderedprod").show();
			$("#order_prepare").show();
			$("#order_tab_panel_content").show();
			$("#order_confirm").show();
			$("#order_fill_content").hide();
			order.prepare.hideStep();
			return;
		}
		var param = {
			prodId : _choosedProdInfo.prodInstId,
			acctNbr : _choosedProdInfo.accNbr,
			areaId : _choosedProdInfo.areaId
		};
		$.callServiceAsJson(contextPath+"/order/queryProdAcctInfo", param, {
			"before":function(){
				$.ecOverlay("<strong>正在确认当前产品帐户,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(jr){
				if(jr.code != 0||jr.data.length==0) {
					if(jr.code==-2){
						$.alertM(jr.data);
					}
					else{
						$.alert("提示","当前产品帐户定位失败，请联系管理员");
					}
					$("#orderedprod").show();
					$("#order_prepare").show();
					$("#order_tab_panel_content").show();
					$("#order_confirm").show();
					$("#order_fill_content").hide();
					order.prepare.hideStep();
					return;
				}				
				var prodAcctInfos = jr.data;
				$.callServiceAsHtml(contextPath+"/order/preChangeAccount", prodAcctInfos, {
					"before":function(){
						$.ecOverlay("<strong>当前产品帐户已确认</strong>");
					},
					"always":function(){
						$.unecOverlay();
					},
					"done":function(response){
						if(!response){
							 response.data='<div style="margin:2px 0 2px 0;width:100%,height:100%;text-align:center;"><strong>no data return,please try reload.</strong></div>';
						}
						if(response.code != 0) {
							$.alert("提示","查询失败,请稍后重试");
							return;
						}											
						$("#order_fill_content").html(response.data).show();
						$(".h2_title").append(_choosedProdInfo.productName+"-"+_choosedProdInfo.accNbr);
						$("#origAccts option:first").attr("selected", "selected");
						//获取账单投递信息主数据				
						acct.acctModify.getBILL_POST();
					},
					fail:function(response){
						$.unecOverlay();
						$.alert("提示","请求可能发生异常，请稍后再试！");
					}
				});
			}
		});
	};
	
	//产品下原有付费帐户展示（弹出框）
	var _showOrigAccts = function(){
		easyDialog.open({
			container : "origAcctDialog"
		});
		$("#origAcctClose").click(function(){
			easyDialog.close();
		});
	};
		
	//查询帐户信息并选择新的付费帐户（弹出框）
	var _chooseAcct = function() {
		$("#chooseQueryAcctType").find("option[value=1]").attr("selected","selected");
		$("#d_query_nbr").show();
//		$("#d_query_pwd").show();
		easyDialog.open({
			container : "queryAcctDialog"
		});
		$("#chooseQueryAcctType").change(function(){
			if($("#chooseQueryAcctType").val()==1){
				$("#d_query_cd").hide();
				$("#d_query_nbr").show();
//				$("#d_query_pwd").show();
			}
			else{				
				$("#d_query_nbr").hide();
				$("#d_query_pwd").hide();
				$("#d_query_cd").show();
			}
		});
		$("#queryAcctClose").click(function(){
			$("#acctListTab tbody").empty();
			$("#d_query_cd").hide();
			$("#d_query_nbr").hide();
//			$("#d_query_pwd").hide();
			easyDialog.close();
		});
	};
			
	//查询帐户,显示查询结果，记录选择的帐户信息
	var newAcctList = [];
	var _queryAccount = function(acctSelect){
		//根据接入号查询帐户
		var response;
		if($("#chooseQueryAcctType").val()==1){
			if(!CONST.LTE_PHONE_HEAD.test($.trim($("#d_query_nbr input").val()))){					
				$.alert("提示", "请输入有效的中国电信手机号");					
				return;				
			}
//			var param = {
//					accessNumber : $("#d_query_nbr input").val(),
//					prodPwd : $("#d_query_pwd input").val()
//			};
			//根据接入号查询帐户需先经过产品密码鉴权
//			var jr = $.callServiceAsJson(contextPath+"/order/prodAuth", param);
//			if(jr.code==0){
				var acctQueryParam = {
					accessNumber : $("#d_query_nbr input").val()
				};
				response = order.prodModify.returnAccount(acctQueryParam);		
//			}
//			else{
//				$.alert("提示",jr.data);
//			}
		}
		//根据合同号查询帐户
		else{
			var acctQueryParam = {
					acctCd : $("#d_query_cd input").val()
			};
			response = order.prodModify.returnAccount(acctQueryParam);
		}		
		$("#acctListTab tbody").empty();
		if(response.code==0){
			var returnMap = response.data;
			if(returnMap.resultCode==0){
				if(returnMap.accountInfos && returnMap.accountInfos.length>0){
					var accountInfos = returnMap.accountInfos;
					$.each(accountInfos, function(i, accountInfo){					
						var tr = $("<tr></tr>").appendTo($("#acctListTab tbody"));
						if(accountInfo.name){
							$("<td class='teleNum'>"+accountInfo.name+"</td>").appendTo(tr);
						}
						else{
							$("<td></td>").appendTo(tr);
						}
						if(accountInfo.acctId){
							$("<td acctId='"+accountInfo.acctId+"'>"+accountInfo.accountNumber+"</td>").appendTo(tr);
						}
						else{
							$("<td></td>").appendTo(tr);
						}
						if(accountInfo.owner){
							$("<td>"+accountInfo.owner+"</td>").appendTo(tr);
						}
						else{
							$("<td></td>").appendTo(tr);
						}
						if(accountInfo.accessNumber){
							$("<td>"+accountInfo.accessNumber+"</td>").appendTo(tr);
						}
						else{
							$("<td></td>").appendTo(tr);
						}
						tr.click(function(){
							var newAccount = {
									acctCd : accountInfo.accountNumber,
									acctId : accountInfo.acctId,
									acctRelaTypeCd : "1",
									chargeItemCd : 1,               //账目项标识，暂固定为1，表示支付所有账目项
									percent : "100",                //支付比重，该账目项占该产品的价格比重，与上一个属性相匹配，暂固定为100
									priority : "1",                 //支付优先级，暂固定为1，表示最高优先级
									prodAcctId : "-1",              //标识产品与帐户的支付匹配关系，新选的帐户和该产品无匹配关系，默认 -1
									state : "ADD"
							};
							newAcctList.push(newAccount);
							
							$("#acctListTab tbody").empty();
							$("#d_query_cd").hide();
							$("#d_query_nbr").hide();
							$("#d_query_pwd").hide();
							$("#defineNewAcct").hide();
							easyDialog.close();
							var found = false;
							$.each($(acctSelect).find("option"), function(i, option){
								if($(option).val()==accountInfo.acctId){
									found = true;
									return false;
								}								
							});
							if(found==false){										
								$("<option>").text(accountInfo.name+" : "+accountInfo.accountNumber).attr("value", accountInfo.acctId).appendTo($(acctSelect));
							}
							$(acctSelect).find("option[value=default]").remove();
							$(acctSelect).find("option[value="+accountInfo.acctId+"]").attr("selected","selected");
						});
					});			
				}
				else{
					$("<tr><td colspan=4>未查询到帐户信息</td></tr>").appendTo($("#acctListTab tbody"));
				}	
			}
			else{
				$("<tr><td colspan=4>"+returnMap.resultMsg+"</td></tr>").appendTo($("#acctListTab tbody"));
			}
		}
		else{
			$("<tr><td colspan=4>"+response.data+"</td></tr>").appendTo($("#acctListTab tbody"));
		}
	};
	
	//帐户查询请求（二次业务时查询已有帐户）
	var _returnAccount = function(acctQueryParam){
		acctQueryParam.areaId =  _choosedProdInfo.areaId;
		acctQueryParam.isServiceOpen="Y";   //是否能力开放,Y-是,N-否
		var response = $.callServiceAsJson(contextPath+"/token/pc/order/account", acctQueryParam);
		if(response.code==-2){
			$.alertM(response.data);
			return;
		}
		return response;
	};
	
	//新建帐户
	var _createAcct = function(){
		var newAccount = {
				acctCd : -1,
				acctId : -1,
				acctRelaTypeCd : "1",
				chargeItemCd : 1,               //账目项标识，暂固定为1，表示支付所有账目项
				percent : "100",                //支付比重，该账目项占该产品的价格比重，与上一个属性相匹配，暂固定为100
				priority : "1",                 //支付优先级，暂固定为1，表示最高优先级
				prodAcctId : "-1",              //标识产品与帐户的支付匹配关系，新选的帐户和该产品无匹配关系，默认 -1
				state : "ADD"
		};
		newAcctList.push(newAccount);
		$("<option value='-1' style='color:red'>[新增] "+OrderInfo.cust.partyName+"</option>").appendTo($("#newAccts"));
		$("#newAccts").find("option[value=default]").remove();
		$("#newAccts").find("option[value=-1]").attr("selected","selected");
		$("#acctName").val(OrderInfo.cust.partyName);//默认帐户名称为客户名称
		$("#newAccts").parent().find("a:eq(1)").hide();
		//新增帐户自定义支付属性
		$("#defineNewAcct").show();
		acct.acctModify.ifCanAdjustBankPayment();//查询工号权限：能否选择银行托收
		acct.acctModify.paymentType();
		acct.acctModify.billPostType();
	};
	
	//切换新付费帐户
	var _ifNewAcct = function(acctSelect){
		if($(acctSelect).val()<0){
			$("#defineNewAcct").show();
		}
		else{
			$("#defineNewAcct").hide();
		}
	};

	//改付费帐户提交（下一步）
	var _changeAccountSave = function(){
		
		//帐户信息校验
		if($("#newAccts").val()=="default"){
			$.alert("提示","请选择新帐户");
			return;
		}		
		//新建帐户支付信息与投递信息填写校验
		if($("#newAccts").val()<0){
			//帐户信息填写校验
			if(!SoOrder.checkAcctInfo()){
				return;
			}
		}

		var repick = false;
		var origAccts = $("#origAccts").find("option");
		$.each(origAccts, function(i, origAcct){
			if($("#newAccts").val()==$(origAcct).val()){
				repick = true;
				return false;
			}
		});
		if(repick==false){
			
			var delAcctId = $("#origAccts").val();
			var origAcct = $("#origAcctList tbody").find("tr[id="+delAcctId+"]");							
			
			var _acctCd = $(origAcct).find("td:eq(4)").text();					
			var _acctId = $(origAcct).find("td:eq(0)").text();					
			var _chargeItemCd = $(origAcct).find("td:eq(2)").text();					
			var _percent = $(origAcct).find("td:eq(7)").text();					
			var _priority = $(origAcct).find("td:eq(8)").text();
			if(_priority==""){
				_priority = 1;
			}
			var _prodAcctId = $(origAcct).find("td:eq(1)").text();	
			
			var origAcctInfo = {							
					acctCd : _acctCd,							
					acctId : _acctId,							
					acctRelaTypeCd : "1",							
					chargeItemCd : _chargeItemCd,				
					percent : _percent,							
					priority : _priority,							
					prodAcctId : _prodAcctId,						
					state : "DEL"					
			};
				
			var newAcctInfo;
			$.each(newAcctList, function(i, newAccount){
				if(newAccount.acctId==$("#newAccts").val()){
					newAcctInfo = newAccount;
					return false;
				}
			});
			
			var _boAccountRelas = [];
			_boAccountRelas.push(origAcctInfo);
			_boAccountRelas.push(newAcctInfo);
		
			var _busiOrderAttrs = [];
			var remark = $("#orderRemark").val();		
			_busiOrderAttrs.push({
				itemSpecId : "111111118",
				value : remark
			});
		
			var data = {
					boAccountRelas : _boAccountRelas,
					busiOrderAttrs : _busiOrderAttrs
			};
			//更换的帐户为新建帐户
			if($("#newAccts").val()==-1){
				OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.CHANGE_ACCOUNT,10,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.CHANGE_ACCOUNT),"");
				var busiOrder = [];
				//新建帐户节点
				OrderInfo.createAcct(busiOrder, -1);
				//更改帐户节点
				var acctChangeNode = {
						areaId : _choosedProdInfo.areaId,
						busiOrderInfo : {
							seq : OrderInfo.SEQ.seq-- 
						}, 
						busiObj : {
							accessNumber: _choosedProdInfo.accNbr,
                            instId: _choosedProdInfo.prodInstId,
                            isComp: "N",
                            objId: _choosedProdInfo.productId,
                            offerTypeCd: "1"
						},  
						boActionType : {
							actionClassCd : 1300,
							boActionTypeCd : "-6"
						}, 
						data : data
				};
				busiOrder.push(acctChangeNode);
				
				SoOrder.submitOrder(busiOrder);
			}
			//更换的帐户为已有帐户
			else{
				OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.CHANGE_ACCOUNT,0,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.CHANGE_ACCOUNT),"");
				SoOrder.submitOrder(data);
			}			
		}
		else{
			$.alert("提示","该帐户已经是付费帐户了，请重新选择");
			return;
		}		
	};
	
	//退出二次业务
	var _cancel = function() {
		$.confirm("信息","确定取消当前操作吗？",{
		yes:function(){		
			OrderInfo.resetChooseUserInfo();
			//退出二次业务时释放被预占的UIM卡
			var boProd2Tds = OrderInfo.boProd2Tds;
			if(boProd2Tds.length>0){
				for(var n=0;n<boProd2Tds.length;n++){
					var param = {
							numType : 2,
							numValue : boProd2Tds[n].terminalCode
					};
					$.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param);
				}
			}
			//退出二次业务时释放被预占的号码（过滤身份证预占的号码）
			var boProdAns = OrderInfo.boProdAns;
			if(boProdAns.length>0){
				for(var n=0;n<boProdAns.length;n++){
					if(boProdAns[n].idFlag){
						continue;
					}
					var param = {
							numType : 1,
							numValue : boProdAns[n].accessNumber
					};
					$.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param);
				}
				order.service.boProdAn = {};
				order.phoneNumber.resetBoProdAn();
			}			
			//页面变动
			$("#order_fill_content").empty();
			OrderInfo.order.step=0;//订单初始页面
			order.prepare.hideStep();
			$("#orderedprod").show();
			$("#order_prepare").show();
		},no:function(){
			
		}},"question");
	};
	
	//加入组合入参
	var compparam = "";
	var _queryCustProd = function(){
		var hasmeneber = false;
		var prodnum = $.trim($("#prodnbr").val());
		if(prodnum==""){
			$.alert("提示","请输入需要查询的接入号！");
			return;
		}else{
			hasmeneber = isExist(prodnum);
		}
		if(hasmeneber.flag){
			if(hasmeneber.data=="1"){
				var param = {};
				var prodnum = $.trim($("#prodnbr").val());
				param.acctNbr=prodnum;
				var url = contextPath+"/cust/queryprodbynbr";
			}else{
				$.alert("提示","该产品已经在组合中，请重新选择！");
				return;
			}
		}else{
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
				if(!response){
					 response.data='<div style="margin:2px 0 2px 0;width:100%,height:100%;text-align:center;"><strong>not data return,please try reload again.</strong></div>';
				}
				if(response.code == -2){
					return;
				}else if(response.code != 0) {
					$.alert("提示","客户查询失败,稍后重试");
					return;
				}
				var content$=$("#prodinst");
				content$.html(response.data);
			}
		});	
	};
	
	var _compChangeTab = function(num){
		if(num == 1){
			$("#tab_1").addClass("setcon");
			$("#tab_2").removeClass("setcon");
			$("#addCompPage").show();
			$("#releaseShortNum").hide();
			$("#compopr").show();
		}else{
			$("#tab_2").addClass("setcon");
			$("#tab_1").removeClass("setcon");
			$("#addCompPage").hide();
			$("#releaseShortNum").show();
			$("#compopr").hide();
		}
	};
	
	var _addToComp = function(obj){
		var phonenumber = $(obj).parent().parent().children(":first-child").next().text();
		var productId = $(obj).parent().parent().children(":last-child").text();
		var prodInstId = $(obj).parent().parent().children().eq(-2).text();
		var prodStateCd = $(obj).parent().parent().children().eq(-3).text();
		var linum = $("#choosed_menbers li").length;
		if(linum>12){
			$.alert("提示","已经超过了加入的最大数量！");
			return;
		}
		if(prodStateCd!="100000"){
			$.alert("提示","该产品状态不符，不能纳入成员！");
			return;
		}
		var addphones = getChoosedMenbr();
		if(addphones.length!=0){
			for(var i=0;i<addphones.length;i++){
				if(phonenumber==addphones[i]){
					$.alert("提示","该号码已经在待纳入成员中，请重新选择！");
					return;
				}
			}
		}
		ec.form.dialog.createDialog({
			"id":"-grps",
			"initCallBack":function(dialogForm,dialog){
				var compdata = compspecGrps;
				var compPspecCompGrp2Pspecs = compspecGrps[0].compPspecCompGrp2Pspecs;//成员角色
				var compPspecCompGrpRelas = compspecGrps[0].compPspecCompGrpRelas;//子组角色
				if(compPspecCompGrpRelas==undefined){
					compPspecCompGrpRelas = [];
				}
				var zNodes=[];
				var menber=[];
				for(var i=0;i<compPspecCompGrp2Pspecs.length;i++){
					var grpspec = {
						name:compPspecCompGrp2Pspecs[i].prodSpecName,
						prodCompRelaRoleCd:compPspecCompGrp2Pspecs[i].prodCompRelaRoleCd,
						prodCompRelaRoleName:compPspecCompGrp2Pspecs[i].prodCompRelaRoleName,
						prodSpecId:compPspecCompGrp2Pspecs[i].prodSpecId
					};
					menber.push(grpspec);
				}
				var childmenber = [];
				for(var i=0;i<compPspecCompGrpRelas.length;i++){
					var compPspecCompGrpRelasSpecs = compPspecCompGrpRelas[i];
					var childSpec = [];
					for(var j=0;j<compPspecCompGrpRelasSpecs.length;j++){
						var grpspec = {
							name:compPspecCompGrpRelasSpecs[j].prodSpecName,
							prodCompRelaRoleCd:compPspecCompGrpRelasSpecs[j].prodCompRelaRoleCd,
							prodCompRelaRoleName:compPspecCompGrpRelasSpecs[j].prodCompRelaRoleName,
							prodSpecId:compPspecCompGrpRelasSpecs[j].prodSpecId
						};
						childSpec.push(grpspec);
					}
					var childrole = {
						name:compPspecCompGrpRelasSpecs[i].compPspecCompGrpName,
						children:childSpec
					}
					childmenber.push(childrole);
				}
				var setting = {	
					data: {
						key: {
							title:"t"
						},
						simpleData: {
							enable: true
						}
					},
					callback: {
						onClick: onClick
					}
				};
				if(compPspecCompGrp2Pspecs.length!=0){
					var node = {
						name:"成员",
						open:true,
						children:menber
					};
					zNodes.push(node);
				}
				if(compPspecCompGrpRelas.length!=0){
					var node = {
						name:"子组",
						children:childmenber
					};
					zNodes.push(node);
				}
				if(compPspecCompGrp2Pspecs.length==0&&compPspecCompGrpRelas.length==0){
					$.alert("提示","该产品没有成员规则，请重新选择群组产品！");
					return;
				}
				var prodCompRelaRoleCd="";
				var prodCompRelaRoleName="";
				function onClick(event, treeId, treeNode, clickFlag) {
					prodCompRelaRoleCd="";
					prodCompRelaRoleName="";
					var prodSpecId = treeNode.prodSpecId;
					if(prodSpecId==productId){//不同产品只能加入到指定类别下
						prodCompRelaRoleCd=treeNode.prodCompRelaRoleCd;
						prodCompRelaRoleName=treeNode.prodCompRelaRoleName;
					}else{
						$.alert("提示","不能加入该角色，请重新选择！");
					}
				}	
				$.fn.zTree.init($("#rluename"), setting, zNodes);
				
				$("#nextstep").click(function(){
					if(prodCompRelaRoleCd!=""&&prodCompRelaRoleName!=""){
						$("#dialogtitle").html('设置短号');
						var shortnumhtml = "短号设置：<input type='text' id='shortnumtext' class='inputWidth183px'/>";
						$("#rluename").html('').html(shortnumhtml);
						$("#nextstep").hide();
						$("#submitbtn2").show();
					}else{
						$.alert("提示","请选择所需纳入的成员！");
						return;
					}
				});
				$("#submitbtn2").click(function(){
					var shortnum = $("#shortnumtext").val();
					var reg = new RegExp("^[0-9]*$");
					if(shortnum==''){
						$("#errinfo").html("对不起，请输入短号！");
						return;
					}
				    if(!reg.test(shortnum)){
				    	$("#errinfo").html("短号只能为数字，请重新输入！");
						return;
				    }
				    var param = {
				    	groupNbr:_choosedProdInfo.accNbr,
						extProdId:_choosedProdInfo.productId,
						productNbr:"",
						accNbr:phonenumber,
						extPordInstId:_choosedProdInfo.prodInstId,
						shortNbr:shortnum,
						statusCd:"1102"
					};
					var url = contextPath+"/order/checkGroupShortNum";
					var res = $.callServiceAsJson(url,param,{});	
					if (res.code == 0) {
						var addnbrhtml="<li id='li_"+phonenumber+"' prodInstId='"+prodInstId+"' phonenumber='"+phonenumber+"' prodCompRelaRoleCd='"+prodCompRelaRoleCd+
						"' prodCompRelaRoleName='"+prodCompRelaRoleName+"' productId='"+productId+"' style='width:280px;'>" +
						"<dd class='delete' onclick='order.prodModify.addCompDelSelect(this);'></dd>"+
						"<span id='addNbr' style='display:inline;padding:0 5px 0 22px;'>"+phonenumber+"</span>"+
						"<span style='display:inline;padding:0px;'>[短号：</span><span style='display:inline;padding:0px;' id='shortNumber'>"+shortnum+
						"</span><span class='modshortnum' onclick='order.prodModify.changeShortNum(this);' style='display:inline;padding:0 25px 0 20px;'></span>"+
						"<span style='display:inline;padding:0px;'>]</span>";
						$("#choosed_menbers").append(addnbrhtml);
						dialogForm.close(dialog);
					}else if(res.code == -2){
						$.alertM(res.data);
					}else{
						$.alert("提示",res.data);
					}
				});
			},
			"submitCallBack":function(dialogForm,dialog){},
			width:400,height:150
		});
	};
	
	var getChoosedMenbr = function(){
		var numbers = [];
		$("#choosed_menbers li").each(function(){
			var phonenum= $(this).children('span#addNbr').text();
			numbers.push(phonenum);
		});
		return numbers;
	};
	
	var boolHasShortNum = function(){
		var hasshrot = true;
		$("#choosed_menbers li").each(function(){
			var phonenum= $(this).children('span#shortNumber').text();
			if(phonenum==""){
				hasshrot = false;
			}
		});
		return hasshrot;
	};
	
	var _changeShortNum =function(obj){
		var phonenum = $(obj).parent().children('span#addNbr').text();
		var shortnum = $(obj).parent().children('span#shortNumber').text();
		ec.form.dialog.createDialog({
			"id":"-shrotnum",
			"initCallBack":function(dialogForm,dialog){
				$("#shortnumval").val(shortnum);
				$("#submitbtn3").click(function(){
					shortnum = $(obj).parent().children('span#shortNumber').text();
					var newshortnum = $("#shortnumval").val();
					if(shortnum==newshortnum){
						dialogForm.close(dialog);
					}
					if(shortnum==""&&newshortnum!=""){
						var result = getOprShortNumInfo(phonenum,newshortnum,"1102");
						if(result.code==0){
							$("#li_"+phonenum).children('span#shortNumber').html(newshortnum);
						}else if(result.code==-2){
							$.alertM(result.data);
							return;
						}else{
							$.alert("提示","短号预占失败！");
							return;
						}
						dialogForm.close(dialog);
					}
					if(shortnum!=""&&newshortnum==""){
						$.alert("提示","请输入短号！");
						return;
					}
					if(shortnum!=""&&newshortnum!=""){
						var resultremove = getOprShortNumInfo(phonenum,shortnum,"1000");
						if(resultremove.code==0){
							$("#li_"+phonenum).children('span#shortNumber').html('');
						}else if(resultremove.code==-2){
							$.alertM(resultremove.data);
							return;
						}else{
							$.alert("提示","短号预占失败！");
							return;
						}
						var resultadd = getOprShortNumInfo(phonenum,newshortnum,"1102");
						if(resultadd.code==0){
							$("#li_"+phonenum).children('span#shortNumber').html(newshortnum);
						}else if(resultadd.code==-2){
							$.alertM(resultadd.data);
							return;
						}else{
							$.alert("提示","预占失败！");
							return;
						}
						dialogForm.close(dialog);
					}
				});
			},
			"submitCallBack":function(dialogForm,dialog){},
			width:350,height:100
		});
	};
	
	var getOprShortNumInfo = function(accNbr,shortNbr,statusCd){
		var param = {
			groupNbr:_choosedProdInfo.accNbr,
			extProdId:_choosedProdInfo.productId,
			productNbr:"",
			accNbr:accNbr,
			extPordInstId:_choosedProdInfo.prodInstId,
			shortNbr:shortNbr,
			statusCd:statusCd
		};
		var url = contextPath+"/order/checkGroupShortNum";
		var res = $.callServiceAsJson(url,param,{});
		return res;
	};
	
	var _releaseShortNum = function(){
		var shortNbr = $("#resshortnum").val();
		var param = {
			groupNbr:_choosedProdInfo.accNbr,
			extProdId:_choosedProdInfo.productId,
			productNbr:"",
			accNbr:"",
			extPordInstId:_choosedProdInfo.prodInstId,
			shortNbr:shortNbr,
			statusCd:"1000"
		};
		var url = contextPath+"/order/checkGroupShortNum";
		var res = $.callServiceAsJson(url,param,{});
		if(res.code==0){
			$.alert("提示","短号释放成功！");
			$("#choosed_menbers li").each(function(){
				var shortNum= $(this).children('span#shortNumber').text();
				if(shortNbr==shortNum){
					$(this).children('span#shortNumber').html('');
				}
			});
		}else if(res.code==-2){
			$.alertM(res.data);
			return;
		}else{
			$.alert("提示",res.data);
		}
	};
	
	var canAddAnother = function(){
		var phonelist = $("#choosed_menbers").html();
		phonelist = phonelist.replace(/[\r\n]/g,"").replace(/[ ]/g,"");
		if(phonelist!=''){
			var lastspan = $("#choosed_menbers").children(':last-child').children('span').length;
			if(lastspan<2){
				return false;
			}else{
				return true;
			}
		}else{
			return true;	
		}
	};
	
	var isExist = function(prodnum){
		var params = {
			"compProdId":_choosedProdInfo.prodInstId,
			"accessNumber":prodnum
		};
		var url = contextPath+"/order/queryCompmenber";
		var returndata = {};
		var isexist = $.callServiceAsJson(url,params, {});
		if (isexist.code == 0) {
			returndata.flag = true;
			var compProdMemberInfos = isexist.data;
			if(compProdMemberInfos.length>0){
				returndata.data="0";//表示在群组里面
			}else{
				returndata.data="1";//表示不在群组里面
			}
			return returndata;
		}else if(isexist.code == -2){
			$.alertM(returndata.data);
			returndata.flag = false;
		}else{
			returndata.flag = false;
			$.alert("提示",isexist.data);
			return returndata;
		}
	};
	
	var _addCompSubmit = function(){
		var phonelist = $("#choosed_menbers").html();
		phonelist = phonelist.replace(/[\r\n]/g,"").replace(/[ ]/g,"");
		if(phonelist==""){
			$.alert("提示","请选择纳入组合的成员！");
			return;
		}
		var boolshort = boolHasShortNum();
		if(!boolshort){
			$.alert("提示","待加入成员未全部设置短号，请全部设置好后再提交！");
			return;
		}
		var busiOrder = [];
		var addMenbers = [];
		var prodCompId = -1;
		$("#choosed_menbers li").each(function(){
			var prodInstId = $(this).attr('prodInstId');
			var phonenumber = $(this).attr('phonenumber');
			var prodCompRelaRoleCd = $(this).attr('prodCompRelaRoleCd');
			var prodCompRelaRoleName = $(this).attr('prodCompRelaRoleName');
			var productId = $(this).attr('productId');
			var shortnum =$(this).children('span#shortNumber').text();
			addMenbers.push(phonenumber);
			var compparam = {
				"busiOrderInfo": {
					"seq": OrderInfo.SEQ.seq--
		        },
		        "busiObj": {
			        "objId": CONST.PROD_SPEC.CDMA,
			        "instId": prodInstId,
			        "accessNumber": phonenumber
		        },
	            "boActionType": {
	                "actionClassCd": CONST.ACTION_CLASS_CD.PROD_ACTION,
	                "boActionTypeCd": CONST.BO_ACTION_TYPE.ADD_COMP
	            },
	            "areaId": OrderInfo.staff.areaId,
	            "aggreementId": "",
	            "data": {
	            	"boProdCompOrders": [{
	            		"prodCompRelaRoleCd": prodCompRelaRoleCd,
	                    "prodCompRelaRoleName": prodCompRelaRoleName,
	                    "prodCompId": prodCompId,
	                    "compProdId": _choosedProdInfo.prodInstId
	                }],
	                "boProdCompRelas": [{
	                	"prodCompId": prodCompId,
	                    "state": "ADD",
	                    "atomActionId":OrderInfo.SEQ.atomActionSeq--
	                }],
	                "boProdSpecs": [{
	                	"prodSpecId": productId,
	                    "atomActionId": OrderInfo.SEQ.atomActionSeq--,
	                    "state": "KIP"
	                }],
	                "boProdCompItems":[{
	        			"itemSpecId": "37906",
	        			"name": "",
	        			"prodCompId": prodCompId,
	        			"state": "ADD",
	        			"value": shortnum,
	        			"atomActionId":OrderInfo.SEQ.atomActionSeq--
	        		}],
	        		"busiOrderAttrs":[{
	        			itemSpecId:"111111111",
	        			value:$("#orderRemark").val()
	        		}]
	            }
	        };
			busiOrder.push(compparam);
			prodCompId--;
		});
		OrderInfo.confirmList = [];
		var comfimProdInfo = {
			name:_choosedProdInfo.productName,
			accNbr : [_choosedProdInfo.accNbr]
		};
		OrderInfo.confirmList.push(comfimProdInfo);
		var comfimMeneber = {
			name:"纳入成员",
			accNbr : addMenbers
		};
		OrderInfo.confirmList.push(comfimMeneber);
		SoOrder.submitOrder(busiOrder);
	};
	
	var _removeCompSubmit = function(){
		var t = $("#choosed_menbers").html();
        t = t.replace(/[\r\n]/g,"").replace(/[ ]/g,"");
		if(t==""){
			$.alert("提示","请选择退出组合的成员！");
			return;
		}
		var busiOrder = [];
		var addMenbers = [];
		$("#choosed_menbers li").each(function(){
			var prodInstId = $(this).attr('prodInstId');
			var phonenumber = $(this).attr('phonenumber');
			var prodCompRelaRoleCd = $(this).attr('prodCompRelaRoleCd');
			var prodCompRelaRoleName = $(this).attr('prodCompRelaRoleName');
			var prodCompId = $(this).attr('prodCompId');
			addMenbers.push(phonenumber);
			var compparam = {
				"busiOrderInfo": {
					"seq": -1
				},
			    "busiObj": {
				    "objId": CONST.PROD_SPEC.CDMA,
				    "instId": prodInstId,
				    "accessNumber": phonenumber
			    },
		        "boActionType": {
		            "actionClassCd": CONST.ACTION_CLASS_CD.PROD_ACTION,
		            "boActionTypeCd": CONST.BO_ACTION_TYPE.ADD_COMP
		        },
		        "areaId": OrderInfo.staff.areaId,
		        "aggreementId": "",
		        "data": {
		        	"boProdCompOrders": [{
		            	"prodCompRelaRoleCd": prodCompRelaRoleCd,
		                "prodCompRelaRoleName": prodCompRelaRoleName,
		                "prodCompId": prodCompId,
		                "compProdId": _choosedProdInfo.prodInstId
		            }],
		            "boProdCompRelas": [{
		                "prodCompId": prodCompId,
		                "state": "DEL"
		            }],
		        	"busiOrderAttrs":[{
		    			itemSpecId:"111111111",
		    			value:$("#orderRemark").val()
		    		}]
		        }
			};
			busiOrder.push(compparam);
		});
		OrderInfo.confirmList=[];
		var comfimProdInfo = {
			name:_choosedProdInfo.productName,
			accNbr : [_choosedProdInfo.accNbr]
		};
		OrderInfo.confirmList.push(comfimProdInfo);
		var comfimMeneber = {
			name:"退出成员",
			accNbr : addMenbers
		};
		OrderInfo.confirmList.push(comfimMeneber);
		SoOrder.submitOrder(busiOrder);
	};
	
	var _removeCompDelSelect = function(obj){
		$.confirm("确认","确定要取消该号码吗?",{ 
			yes:function(){
				var accNbr = $(obj).next().text();
				$("#li_"+accNbr).remove();
			},
			no:function(){						
			}
		});
	};
	
	var _addCompDelSelect = function(obj){
		$.confirm("确认","确定要取消该号码吗?",{ 
			yes:function(){
				var accNbr = $(obj).parent().children('span#addNbr').text();
				var shortnum =$(obj).parent().children('span#shortNumber').text();
				if(shortnum!=""){
					var param = {
						groupNbr:_choosedProdInfo.accNbr,
						extProdId:_choosedProdInfo.productId,
						productNbr:"",
						accNbr:accNbr,
						extPordInstId:_choosedProdInfo.prodInstId,
						shortNbr:shortnum,
						statusCd:"1000"
					};
					var url = contextPath+"/order/checkGroupShortNum";
					var response = $.callServiceAsJson(url,param,{});
					if(response.code==0){
						$("#li_"+accNbr).remove();
					}else if(response.code==-2){
						$.alertM(response.data);
					}else{
						alert("删除失败");
					}
				}else{
					$("#li_"+accNbr).remove();
				}
				
			},
			no:function(){						
			}
		});
	};

	//返销
	var _showBuyBack = function () {
		if(order.prodModify.choosedProdInfo.prodStateCd==CONST.PROD_STATUS_CD.STOP_PROD){
			$.alert("提示","停机产品不允许受理！");
			return;
		}
		OrderInfo.busitypeflag=0;
		var queryParam = {
				objInstId : _choosedProdInfo.prodInstId,
				queryType : "1",
				areaId : OrderInfo.staff.areaId
		};
		var url = contextPath+"/order/queryOrderItemDetailForResale";
		$.callServiceAsHtmlGet(url,queryParam,{
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
				var objList =  eval('('+response.data+')');
				if(objList.data ==null){
					$.alert("提示","无法返销，不符合可以返销的规则，上一次购物车操作不是新装、订购合约或者补换卡中的一种。");
					return;
				}
				//动作类型1 新装，S1订购销售品,14补换卡 （返销优先级 新装返销-订购销售品返销-补换卡返销）
				for(var i=0;i<objList.data.length;i++){
					if(objList.data[i].boActionTypeCd == CONST.BO_ACTION_TYPE.NEW_PROD){
						boActionTypeCd = CONST.BO_ACTION_TYPE.BUY_BACK;
						OrderInfo.boRelas = [{
							relaTypeCd : CONST.RELATYPECD,
							relaBoId : objList.data[i].orderItemId
					    }];
						OrderInfo.orderItemCd =objList.data[i].orderItemCd;
						OrderInfo.buyBack_orderItemObjId = objList.data[i].orderItemObjId;
						OrderInfo.buyBack_orderItemObjInstId = objList.data[i].orderItemObjInstId;
						break;
					}
				}
				if(boActionTypeCd != CONST.BO_ACTION_TYPE.BUY_BACK){
				    for(var i=0;i<objList.data.length;i++){
					    if(objList.data[i].boActionTypeCd == CONST.BO_ACTION_TYPE.BUY_OFFER){
						    boActionTypeCd = CONST.BO_ACTION_TYPE.BUY_BACK_ORDER_CONTRACT;
						    OrderInfo.boRelas = [{
							    relaTypeCd : CONST.RELATYPECD,
								relaBoId : objList.data[i].orderItemId
						    }];
						    OrderInfo.orderItemCd =objList.data[i].orderItemCd;
						    OrderInfo.buyBack_orderItemObjId = objList.data[i].orderItemObjId;
						    OrderInfo.buyBack_orderItemObjInstId = objList.data[i].orderItemObjInstId;
						    break;
					    }else if(objList.data[i].boActionTypeCd == CONST.BO_ACTION_TYPE.CHANGE_CARD){
						    boActionTypeCd = CONST.BO_ACTION_TYPE.BUY_BACK_CHANGE_CARD;
						    OrderInfo.boRelas = [{
								relaTypeCd : CONST.RELATYPECD,
								relaBoId : objList.data[i].orderItemId
						    }];
						    OrderInfo.orderItemCd =objList.data[i].orderItemCd;
						    OrderInfo.buyBack_orderItemObjId = objList.data[i].orderItemObjId;
						    OrderInfo.buyBack_orderItemObjInstId = objList.data[i].orderItemObjInstId;
					    }else {
						    $.alert("提示","当前业务动作类型【"+objList.data[i].boActionTypeCd +"】不能返销！");
						    return;
					    }
				    }
				}
				var param = _getCallRuleParam(boActionTypeCd,_choosedProdInfo.prodInstId);
				var callParam = {
					boActionTypeCd : boActionTypeCd,
					boActionTypeName : CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.BUY_BACK),
					accessNumber : _choosedProdInfo.accNbr,
					prodOfferName : _choosedProdInfo.prodOfferName
				};
				var checkRule = rule.rule.prepare(param,'order.prodModify.showBuyBackDo',callParam);
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});	
	};
	
	//返销
	var _showBuyBackDo = function () {
		//预校验
		var inprodStatusCd=_choosedProdInfo.prodStateCd;
		var intoprodStatusCd=CONST.PROD_STATUS_CD.REMOVE_PROD;// 产品状态,REMOVE_PROD		
        var orderItemId ="";
/*		if(lteFlag){
			var flag=_updateCheckByChange(CONST.ACTION_CLASS_CD.PROD_ACTION,BO_ACTION_TYPE,inprodStatusCd,intoprodStatusCd);
			if (!flag) return;
		}*/

		if(!query.offer.setOffer()){
			return;
		}
		_removeCommit(CONST.PROD_STATUS_CD.REMOVE_PROD,boActionTypeCd,1);

	};
	var _setCoupon = function (coupon) {
		_coupon = coupon;
	};
	//客户属性-展示 更多按钮
	var _btnMoreProfile=function(){
		if($("#modPartyProfile").is(":hidden")){
			$("#modPartyProfile").show();
			$("#proarroworder").removeClass();
			$("#proarroworder").addClass("arrowup");
			order.prodModify.changeLabel(0);
		}else{
			$("#modPartyProfile").hide();
			$("#proarroworder").removeClass();
			$("#proarroworder").addClass("arrow");
			$("#modTabProfile0").attr("click","1");
			$("#contactName").attr("data-validate","");
			_form_custInfomodify_btn();
		}
		/*$("#orderbutton").off("click").on("click",function(event){_btnQueryPhoneNumber();event.stopPropagation();});*/
	};
	//切换标签
	var _changeLabel = function(labelId){
		if($("#partyProfile").is(":visible")==false){
			$("#partyProfile").show();
		}
		if(labelId=="0"){
			$("#modTabProfile0").show();
			$("#cardtab_mod_0").addClass("setcon");
			$("#modTabProfile0").attr("click","0");
			$("#contactName").attr("data-validate","validate(required:请准确填写联系人名称) on(keyup)");
			_form_custInfomodify_btn();
		}else if(($("#modTabProfile0").attr("click")=="0")&&($("#contactName").val()=="")){
			$.alert("提示","联系人名称不能为空！","information");
			return;
		}
		for ( var i = 0; i < order.prodModify.profileTabLists.length; i++) {
			var profileTabLists = order.prodModify.profileTabLists[i];
			var tabProfileNum=profileTabLists.tabProfileNum;
			var partyProfileCatgTypeCd=profileTabLists.partyProfileCatgTypeCd;
			if(labelId==partyProfileCatgTypeCd){
				$("#"+tabProfileNum).show();
				$("#cardtab_mod_"+partyProfileCatgTypeCd).addClass("setcon");
				$("#modTabProfile0").hide();
				$("#cardtab_mod_0").removeClass("setcon");
			}else{
				$("#"+tabProfileNum).hide();
				$("#cardtab_mod_"+partyProfileCatgTypeCd).removeClass("setcon");
			}
		}
		
	};

	var _checkProPSW=function(psw){
		$("#"+psw).blur();
	};
	
	//一卡双号订购显示
	var _showNumberOrder = function () {
		if(order.prodModify.choosedProdInfo.prodStateCd==CONST.PROD_STATUS_CD.STOP_PROD){
			$.alert("提示","停机产品不允许受理！");
			return;
		}
		var param = {
			mainAccNbr : _choosedProdInfo.accNbr,
			areaId : _choosedProdInfo.areaId
		};
		//规则校验入参
		var boInfos = [{
			boActionTypeCd : CONST.BO_ACTION_TYPE.BUY_OFFER,
			instId : _choosedProdInfo.prodInstId,
			specId : CONST.PROD_SPEC.CDMA,
			prodId : _choosedProdInfo.prodInstId
		}];
		if(!rule.rule.ruleCheck(boInfos)){ //规则校验失败
			return;
		}
		$.callServiceAsHtml(contextPath + "/order/cardNumberOrder", param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},"done" : function(response){
				var content$ = $("#order_fill_content");
				content$.html(response.data).show();
				$("#ordercon").show();
				$("#ordertabcon").show();
				order.prepare.step(1);
				OrderInfo.order.step=1;//订单备注页面
				$("#orderedprod").hide();
				$("#order_prepare").hide();
				$(".ordercon a:first span").text("取 消");
				$(".main_body").css("height","150px");
				$(".main_body").css("min-height","150px");
				$("#order_confirm").empty();
				$("#fillLastStep").click(function(){
					order.prodModify.cancel();
				});
                
				$("#queryAccNbrList").unbind("click").bind("click",function(){
					var param = {
					    areaId : $("#areaId").val(),
					    scene: "ADD", 
					    preHandle: "C", 
					    mainAccNbr: $("#mainAccNbr").val(),
					    virtualAreaId: $("#p_areaId").val(),
					    soChannelId: OrderInfo.staff.channelId
					};
					$.callServiceAsHtml(contextPath+"/order/queryAccNbrList",param,{
						"before":function(){
							$.ecOverlay("虚号号码查询中，请稍等...");
						},
						"always":function(){
							$.unecOverlay();
						},
						"done" : function(response){
							order.prepare.step(2);
							OrderInfo.order.step=2;//订单确认页面
							$("#order_fill_content").hide();
							var content$ = $("#order_confirm");
							content$.html(response.data).show();
							OrderInfo.actionFlag = 36;
							OrderInfo.orderAccNbr = _choosedProdInfo.accNbr;
							order.dealer.initDealer();
						},
						fail:function(response){
							$.unecOverlay();
							$.alert("提示","请求可能发生异常，请稍后再试！");
						}
					});
				});
			},"always":function(){
				$.unecOverlay();
			}
		});
	
	};
	//订购一卡双号
	var _orderAccNbr = function () {
		var virtualAccNbr = $("input[name='virtualAccNbr']:checked").val();
		if(virtualAccNbr==null ||virtualAccNbr==""||virtualAccNbr==undefined){
			$.alert("提示","请选择一个虚号号码！");
			return;
		};
		var mainAccNbr = $("#mainAccNbr").val();
		var param ={
		    areaId: $("#areaId").val(),
		    virtualAreaId: $("#virtualAreaId").val(),
			scene: "ADD",
			preHandle: "F",
			extCustOrderId: $("#extCustOrderId").val(),
			mainAccNbr: mainAccNbr,
			virtualAccNbr: virtualAccNbr,
			pageType:"orderAccNber",
			busiOrderAttrs:[]
		};
		//发展人
		var $tr = $("tr[name='tr_"+mainAccNbr+"']");
		if($tr!=undefined){
			$tr.each(function(){   //遍历产品有几个发展人
				var dealer = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
					role : $(this).find("select").val(),
					value : $(this).find("input").attr("staffid") 
				};
				param.busiOrderAttrs.push(dealer);
				var dealer_name = {
						itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER_NAME,
						role : $(this).find("select").val(),
						value : $(this).find("input").attr("value") 
				};
				param.busiOrderAttrs.push(dealer_name);	
			});
		}
		_exchangeAccNbr(param);
	};
	
	//一卡双号退订显示
	var _showNumberUnOrder = function () {
		if(order.prodModify.choosedProdInfo.prodStateCd==CONST.PROD_STATUS_CD.STOP_PROD){
			$.alert("提示","停机产品不允许受理！");
			return;
		}
		var param = {
			mainAccNbr : _choosedProdInfo.accNbr,
			areaId : _choosedProdInfo.areaId
		};
		//规则校验入参
		var boInfos = [{
			boActionTypeCd : CONST.BO_ACTION_TYPE.DEL_OFFER,
			instId : _choosedProdInfo.prodInstId,
			specId : CONST.PROD_SPEC.CDMA,
			prodId : _choosedProdInfo.prodInstId
		}];
		if(!rule.rule.ruleCheck(boInfos)){ //规则校验失败
			return;
		}
		$.callServiceAsHtml(contextPath + "/order/queryVirtualInfo", param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},"done" : function(response){
				var content$ = $("#order_fill_content");
				content$.html(response.data).show();
				$("#ordercon").show();
				$("#ordertabcon").show();
				order.prepare.step(2);
				OrderInfo.order.step=2;
				$("#orderedprod").hide();
				$("#order_prepare").hide();
				$(".ordercon a:first span").text("取 消");
				$(".main_body").css("height","150px");
				$(".main_body").css("min-height","150px");
				$("#order_confirm").empty();
				$("#fillLastStep").click(function(){
					order.prodModify.cancel();
				});

				$("#undoAccNbr").unbind("click").bind("click",function(){
					var param = {
						areaId: $("#areaId").val(),
					    scene: "DEL",
						preHandle: "C",
						extCustOrderId: $("#extCustOrderId").val(),
						mainAccNbr: $("#mainAccNbr").val(),
						virtualAreaId: $("#virtualAreaId").val(),
						virtualAccNbr: $("#virtualAccNbr").val(),
						pageType:"unOrderAccNber"
					};
					_exchangeAccNbr(param);
				});
			},"always":function(){
				$.unecOverlay();
			}
		});
	
	};
	
	//一卡双号订购退订正式单接口
	var _exchangeAccNbr = function (param) {
		$.callServiceAsHtml(contextPath+"/order/exchangeAccNbr",param,{
			"before":function(){
				$.ecOverlay("订单确认中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				order.prepare.step(3);
				OrderInfo.order.step=3;
				$("#order_fill_content").hide();
				var content$ = $("#order_confirm");
				content$.html(response.data).show();
				$("#successTip_dialog_cnt").off("click").on("click",function(event){order.calcharge.backToEntr();});
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	var _chooseAccNbrArea = function(){
		order.area.chooseAreaTreeQueryManger("javascript:order.prodModify.showNumberOrder()","p_areaId_val","p_areaId",3);
	};
	
	return {
		changeCard : _changeCard,
		getChooseProdInfo : _getChooseProdInfo,
		lossRepProd : _lossRepProd,
		lossRepProdSubmit : _lossRepProdSubmit,
		choosedProdInfo : _choosedProdInfo,
		showLossRepProd : _showLossRepProd,
		showLossRepProdReg : _showLossRepProdReg,
		showStopKeepNumProd : _showStopKeepNumProd,
		showStopKeepNumProdReg :_showStopKeepNumProdReg,
		showCustInfoModify : _showCustInfoModify,
		custInfoModify : _custInfoModify,
		commonPrepare : _commonPrepare,
		showOweRemoveProd:_showOweRemoveProd,
		showRemoveProd : _showRemoveProd,
		showOrderRemoveProd : _showOrderRemoveProd,
		showCoverOrderRemoveProd : _showCoverOrderRemoveProd,
		showBreakRuleRemoveProd : _showBreakRuleRemoveProd,
		showNoActiveRemoveProd:_showNoActiveRemoveProd,
		spec_parm_change : _spec_parm_change,
		showChangeCard : _showChangeCard,
		spec_password_change : _spec_password_change,
		spec_password_change_save : _spec_password_change_save,
		showPasswordChange : _showPasswordChange,
		spec_password_change_check : _spec_password_change_check,
		getCallRuleParam : _getCallRuleParam,
		cancel : _cancel,
		orderAttachOffer : _orderAttachOffer,
		changeOffer		: _changeOffer,
		shortnum_change:_shortnum_change,
		shortnum_show:_shortnum_show,
		shortnum_save:_shortnum_save,
		spec_parm_show:_spec_parm_show,
		showAddComp : _showAddComp,
		addComp :_addComp,
		addToComp:_addToComp,
		compChangeTab:_compChangeTab,
		queryCustProd : _queryCustProd,
		addCompSubmit : _addCompSubmit,
		spec_parm_show:_spec_parm_show,
		showChangeAccount : _showChangeAccount,
		changeAccount : _changeAccount,
		showOrigAccts : _showOrigAccts,
		chooseAcct : _chooseAcct,
		queryAccount : _queryAccount,
		returnAccount : _returnAccount,
		createAcct : _createAcct,
		ifNewAcct : _ifNewAcct,
		changeAccountSave  :_changeAccountSave,
		showRemoveComp:_showRemoveComp,
		removeComp:_removeComp,
		profiles :_profiles,
		profileTabLists :_profileTabLists,
		partyTypeCdChoose:_partyTypeCdChoose,
		identidiesTypeCdChoose :_identidiesTypeCdChoose,
		removeCompSubmit :_removeCompSubmit,
		showPasswordReset:_showPasswordReset,
		spec_password_reset:_spec_password_reset,
		spec_password_reset_save:_spec_password_reset_save,
		queryRomveAcc:_queryRomveAcc,
		removeCompDelSelect:_removeCompDelSelect,
		addCompDelSelect:_addCompDelSelect,
		chooseOfferForMember:_chooseOfferForMember,
		shortnum_check:_shortnum_check,
		shortnum_change_val:_shortnum_change_val,
		changeShortNum:_changeShortNum,
		releaseShortNum:_releaseShortNum,
		showActiveReturn :_showActiveReturn,
		showBuyBack:_showBuyBack,
		showBuyBackDo:_showBuyBackDo,
		setCoupon:_setCoupon,
		lteFlag :lteFlag,
		btnMoreProfile :_btnMoreProfile,
		changeLabel : _changeLabel,
		remark_prodPass :_remark_prodPass,
		checkProPSW  :_checkProPSW,
		showNumberOrder :_showNumberOrder,
		orderAccNbr :_orderAccNbr,
		showNumberUnOrder:_showNumberUnOrder,
		exchangeAccNbr:_exchangeAccNbr,
		chooseAccNbrArea:_chooseAccNbrArea,
		spec_parm_user_change : _spec_parm_user_change,
		spec_parm_user_show : _spec_parm_user_show
	};
})();