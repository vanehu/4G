/**
 * 订单信息对象
 * 
 * @author wukf
 */
CommonUtils.regNamespace("OrderInfo");

/** 订单信息对象*/
OrderInfo = (function() {
	
	/*
	 * 每个功能点标识，0是产品变更等单业务动作订单提交，1新装，2变更,3可选包变更,4客户资料变更 5.拆副卡
	 * 
	 * 6 销售品成员变更加装副卡，7 拆主卡保留副卡 8单独新建客户,10 是公用节点传入 11 撤单，12 加入退出组合 
	 * 
	 * 13 购买裸机  14 合约套餐  15 补退费  16 改号	17 终端退货 18 终端换货 19返销 20返销,21 副卡套餐变更, 22补换卡,23异地补换卡
	 * 
	 * 31改产品密码，32重置产品密码，,33改产品属性，34修改短号，35分段受理（订单确认及后续受理）,36一卡双号订购
	 * 
	 * 37终端预约，38取消终端预约，39改付费类型及信控属性，40紧急开机，41ESS远程写卡，42ESS二次写卡，43返档，28主副卡角色互换
	 */
	var _actionFlag = 0;
	
	//var _returnFlag = 0; // 手机客户端 返回按钮 标志当前 页面   0 为  号码-》套餐
	
	var _isSuccess = "N";  // 补换卡  加载 可选包 是否成功 
	
	var _virOlId="";
	
	var _handleCustId="";

	var _isExistCFQ = false;//是否是橙分期业务
	
	/*购物车业务动作
	1 新装
	2  套餐变更
	3  主副卡成员变更
	4  产品属性变更
	5  挂失/解挂
	6  停机保号/复机
	7  预拆机
	8  拆机
	9  违章拆机
	10  未激活拆机
	11  欠费拆机
	12  改客户资料返档
	13  补换卡
	14  可选包退订/订购
	15 过户
	16 改账务定制关系
	17 改产品密码
	18 撤单
	19 异地补换卡
	20 预写白卡
	21 补卡
	22 换卡
	27 预装
	*/
	var _authRecord={
		menuId:"",
		validateType:"",
		resultCode:""
	};//保存鉴权临时结果

	var _preBefore ={
			prcFlag : ""	
	};//保存前置检验的结果
	
	var _roleCd="";//用户区分当前选择的产品是否是副卡
	var _roleType = "";//区分副卡新装    Y表示副卡新装
	var _cust_validateType = "";//客户鉴权方式

	var _cust_validateNum = "";//客户鉴权号码

	var _busitypeflag = 0;
	
	var _orderlonger = "";
	
	var _custorderlonger = "";

	var _custCreateToken = "";
	
	var _zcd_privilege =""; //是否具有分段受理权限
	
	var _load_zcd_privilege = false; //是否已加载查询分段受理权限
	
	// 产品是否在集团开户  Y--集团开户 N--省内开户
	var _ifLteNewInstall = "";
	
	var _cust = { //保存客户信息
		custId : "",
		partyName : "",
		vipLevel : "",
		vipLevelName : "",
		custFlag :"1100"//1000：红客户，1100：白客户，1200：黑客户
	}; 
	
	var _staff = { //员工登陆信息
		staffId : 0,  //员工id
		channelId : 0,   //受理渠道id
		channelName: "",
		areaId : 0,    //受理地区id
		areaCode : 0,
		soAreaId : 0,    //新装受理地区id
		soAreaCode : 0, 
		distributorId : "" //转售商标识
	}; 
	var _channelList = [];//渠道列表
		
	var _offerSpec = {}; //主销售品构成
	
	var _offer = { //主销售品实例构成
		offerId : "",
		offerSpecId : "",
		offerMemberInfos : []
	}; 
	
	var _oldAddNumList = [];//老用户号码
	
	var _oldprodInstInfos = [];//老用户产品信息
	
	var _oldofferSpec = [];//老用户主销售品构成
	
	var _oldoffer = []; 
	
	var _oldprodAcctInfos = [];
	
	var _oldMvFlag = false; // 判断老用户是否为主副卡
	var _choosedNumList = []; // 选择加装副卡
	var _viceOffer = []; // 加装主副卡保存选择副卡信息
	var _viceprodInstInfos = []; // 主副卡产品信息
	var _hasMainCarFlag = true; // 加装主副卡成员中是否包含主卡
	
	var _viceOfferSpec=[];//副卡换套餐，单产品套餐信息
	
	var _offerProdInst = { //主销售品实例构成查副卡信息
		offerId : "",
		offerSpecId : "",
		offerMemberInfos : []
	}; 
	
	var _actionClassCd = 0; //业务动作大类,订单初始化时赋值
	
	var _boActionTypeCd = ""; //业务动作小类,订单初始化时赋值
	
	var _actionTypeName = "订购"; //业务动作名称
	
	var _businessName = ""; //业务名称

	var _password_remark="";//lte产品密码鉴权
	
	var _confirmList = []; //保存特殊业务，确认页面展示使用
	
	var _orderResult = {};  //订单提交，返回结果报存
	
	var _checkresult = [];

	var _orderData = {}; //订单提交完整节点
	
	var _order = {  //订单常用全局变量
		dealerType : "",   //保存发展人类型
		soNbr : "", //购物车流水
		oldSoNbr : "", //撤单时用于保存选中某个订单的购物车流水
		oldSoId : "",//撤单时用于保存选中某个订单的购物车ID
		step : 0 , //页面步骤
		token : "", // 防止订单重复提交
		templateType : 1,   //模板类型: 0批量开活卡,1批量新装 ,2批量订购/退订附属, 3组合产品纳入退出 ,4批量修改产品属性,5批量换档 ,8拆机 ,9批量修改发展人
		dealerTypeList : [] ////发展人类型列表
	};
	
	//权限控制
	var  _privilege = {
		effTime : ""
	};
	
	//序列号
	var _SEQ = {
		seq : -1,  //序列号，来区分每个业务对象动作,每次减1
		offerSeq : -1,  //序列号，用来实例化每个是销售品,每次减1
		prodSeq : -1,  //序列号，用来实例化每个是产品,每次减1
		servSeq : -1,  //序列号，用来实例化每个是服务,每次减1
		itemSeq : -1,  //序列号，用来实例化每个是产品属性,每次减1
		acctSeq : -1,  //序列号，用来实例化每个是帐户,每次减1
		acctCdSeq : -1,  //序列号，用来实例化每个是帐户合同号,每次减1
		paramSeq : -1,  //序列号，用来实例化每个附属销售品参数的每个值,每次减1
		atomActionSeq : -1,  //序列号，用来实例化每个原子动作的每个值,每次减1
		offerMemberSeq : -1, //序列号，用来实例化每个角色成员的每个值,每次减1
		dealerSeq : 1   //协销人序列号，
	};
	
	var _boCusts = []; //客户信息节点

	var _boProdItems = []; //产品属性节点列表
		
	var _boProdPasswords = []; //产品密码节点列表

	var _boProdAns = []; //号码信息节点列表
	
	var _boProd2Tds = []; //UIM卡节点信息列表
	
	var _boProd2OldTds = []; //保存旧UIM卡节点信息列表
	
	var _bo2Coupons = []; //物品信息节点
	
	var _attach2Coupons = []; //附属销售品需要的物品信息
	
	var _prodAttrs = []; //保存查询产品规格属性时返回的信息
	
	var _prodInstAttrs = []; //保存查询产品实例属性时返回的信息
	
	var _choosedUserInfos = []; //使用人信息
	
	var _essOrderInfo = {}; //ESS订单信息
	
	var _checkUimData = []; //保存UIM校验后的返回数据
	var _staffInfoFlag = "OFF";//渠道发展人归属渠道开关  默认关闭
	//window.localStorage.clear();
	//创建一个订单完整节点
	var _getOrderData = function(){
		//订单提交完整节点
		var olTypeCd = CONST.OL_TYPE_CD.FOUR_G;
		if(OrderInfo.actionFlag==37 || OrderInfo.actionFlag==38 || OrderInfo.termReserveFlag == CONST.OL_TYPE_CD.ZDYY){
			olTypeCd = CONST.OL_TYPE_CD.ZDYY;
		};
		var data = { 
			orderList : {
				orderListInfo : { 
					isTemplateOrder : "N",   //是否批量
					templateType : OrderInfo.order.templateType,  //模板类型: 1 新装；8 拆机；2 订购附属；3 组合产品纳入/退出
					shareArea : "",
					staffId : OrderInfo.staff.staffId,
					channelId : OrderInfo.staff.channelId,  //受理渠道id
					areaId : OrderInfo.staff.soAreaId,
					partyId : -1,  //新装默认-1
					distributorId : OrderInfo.staff.distributorId, //转售商标识
					olTypeCd : olTypeCd,  //4g标识
					actionFlag : OrderInfo.actionFlag
				},
				custOrderList :[{busiOrder : []}]   //客户订购列表节点
			}
		};
		OrderInfo.orderData = data;
		return OrderInfo.orderData;
	};		
		
	//创建客户节点
	var _createCust = function(busiOrders) {
		var accNbr = _getAccessNumber(-1);
		var busiOrder = {
			areaId : OrderInfo.getAreaId(),  //受理地区ID
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				instId : -1 //业务对象实例ID
			},  
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.CUST_ACTION,
				boActionTypeCd : CONST.BO_ACTION_TYPE.CUST_CREATE
			}, 
			data:{
				boCustInfos : [],
				boCustIdentities : [],
				boPartyContactInfo : []
			}
		};
		if(ec.util.isObj(accNbr)){ //接入号
			busiOrder.busiObj.accessNumber = accNbr;
		}
		busiOrder.data.boCustInfos.push(OrderInfo.boCustInfos);
		busiOrder.data.boCustIdentities.push(OrderInfo.boCustIdentities);
		/*if($("#tabProfile0").attr("click")=="0"&&($("#contactName").val()!="")){
			busiOrder.data.boPartyContactInfo.push(OrderInfo.boPartyContactInfo);
		}*/
		// 联系人信息为空的情况下，新开户移动号码时，默认以本人及新办的手机号（如果是主副卡的，默认主号码）作为联系人信息
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14){
			if(!ec.util.isObj(OrderInfo.boPartyContactInfo.contactName) && !ec.util.isObj(OrderInfo.boPartyContactInfo.mobilePhone)){
				var custName = OrderInfo.boCustInfos.name;
				OrderInfo.boPartyContactInfo.contactName = custName;
				OrderInfo.boPartyContactInfo.mobilePhone = accNbr;
			}else if(!ec.util.isObj(OrderInfo.boPartyContactInfo.mobilePhone)){
				OrderInfo.boPartyContactInfo.mobilePhone = accNbr;
			}
			busiOrder.data.boPartyContactInfo.push(OrderInfo.boPartyContactInfo);
			if(order.prepare.isPreInstall()){
				busiOrder.data.boPartyContactInfo=[];
			}
		}
		if(OrderInfo.boCustProfiles!=undefined && OrderInfo.boCustProfiles!=""){
			busiOrder.data.boCustProfiles = [];
			busiOrder.data.boCustProfiles = OrderInfo.boCustProfiles;
		}
		busiOrders.push(busiOrder);
	};
	
	//创建帐户节点
	var _createAcct = function(busiOrders,acctId,toCustId,nameCN) {
		var acctName = $("#acctName").val();
		var paymentType = $("#paymentType").val();  //100000现金，110000银行
		var bankId = "";
		var bankAcct = "";
		var paymentMan = "";
		if(paymentType==110000){ //银行
			bankId = $("#bankId").val(); //银行ID
			bankAcct = $("#bankAcct").val(); //银行帐号
			paymentMan = $("#paymentMan").val(); //支付人
		}
		
		var busiOrder = {
			areaId : OrderInfo.getAreaId(),  //受理地区ID
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq-- 
			}, 
			busiObj : { //业务对象节点
				instId : acctId //业务对象实例ID
			},  
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.ACCT_ACTION,
				boActionTypeCd : CONST.BO_ACTION_TYPE.ACCT_CREATE
			}, 
			data : {
				boAccountInfos : [{  //帐户节点
					partyId : OrderInfo.cust.custId, //客户ID
					acctName : acctName, //帐户名称
					acctCd : acctId, //帐户CD
					acctId : acctId, //帐户ID
					businessPassword : "111111", //业务密码
					state : "ADD", //动作
					acctTypeCd : "1" // 默认1
				}],
				boPaymentAccounts : [{ //帐户托收节点
					paymentAcctTypeCd : paymentType, //类型
					bankId : bankId, //银行ID
					bankAcct : bankAcct, //银行帐户ID
					paymentMan : paymentMan, //付费人
					limitQty : "1", //数量
					state : "ADD" //动作
				}],
				boAcct2PaymentAccts : [{ //帐户付费关联关系节点
					priority : "1", //优先级
					state : "ADD" //动作
				}],
				boAccountItems : [],
				boAccountMailings : [] //账单投递信息节点	
			}
		};
		//返档要求partyId取返档后客户ID，做特殊处理redmine 794183
		if(OrderInfo.actionFlag=='43'){
			busiOrder.data.boAccountInfos[0].partyId = toCustId;
			// 如果账号名称默认取客户名称，则送后台加密后的客户名称（客户信息脱敏后，导致后台下省也脱敏）
			if (nameCN!=undefined&&nameCN!="") {
				busiOrder.data.boAccountInfos[0].CN = nameCN;
			}
		}	
		// 如果账号名称默认取客户名称，则送后台加密后的客户名称（客户信息脱敏后，导致后台下省也脱敏）
		if (acctName == OrderInfo.cust.partyName) {
			busiOrder.data.boAccountInfos[0].CN = OrderInfo.cust.CN;
		}
		var accNbr = _getAccessNumber(-1);
		if(ec.util.isObj(accNbr)){ //接入号
			busiOrder.busiObj.accessNumber = accNbr;
		}
		//若选择了银行托收且填写了银行账户协议号则将该信息录入
		if($("#paymentType").val()==110000 && $.trim($("#protocalNbr").val())!=""){
			var boAccountItem_protocalNbr = {
					itemSpecId : CONST.ACCT_ATTR.PROTOCOL_NBR,  //账户属性：银行账户协议号 - 规格ID
					value : $.trim($("#protocalNbr").val()),
					state : "ADD"	
			};
			busiOrder.data.boAccountItems.push(boAccountItem_protocalNbr);
		}
		//若选择投递账单，则录入该信息
		if($("#postType").val()!=-1){
			var boAccountMailing = {
					mailingType : $("#postType").val(),   //*投递方式
					param1 : $("#postAddress").val(),     //*投递地址
					param2 : "1",                         //格式ID
					param3 : $("#postCycle").val(),       //*投递周期
					param7 : $("#billContent").val(),     //*账单内容
					state : "ADD"
			};
			if($("#postType").val()==11 || $("#postType").val()==15){				
				boAccountMailing.param1 = $("#postAddress").val()+","+$("#zipCode").val()+" , "+$("#consignee").val(); //*收件地址,邮编,收件人			
			}
			busiOrder.data.boAccountMailings.push(boAccountMailing);
		}
		busiOrders.push(busiOrder);
	};
	
	

	/**
	 * 获取渠道List
	 */
	var _getChannelList = function (busiOrders,offer,prodId){
		OrderInfo.channelList = [];
		if($("i[name='channel_iofo_i']").length==0){
			OrderInfo.channelList = window.parent.OrderInfo.getChannelList();
		}else{
			$("i[name='channel_iofo_i']").each(function(){				
				var channelId = $(this).attr("channel_Id");
				var channelName = $(this).attr("channel_Name");
				var channelNbr = $(this).attr("channel_Nbr");
				var isSelect = 0;
				if($(this).hasClass("select"))
					var isSelect = 1;
				var channelInfo ={
						channelId : channelId,
						channelName : channelName,
						channelNbr : channelNbr,
						isSelect : isSelect
				}
				OrderInfo.channelList.push(channelInfo)
			});
		}
		return OrderInfo.channelList;
	};

	/**
	 * 获取销售品节点
	 * busiOrders 业务对象节点
	 * offer 销售品节点
	 * prodId 产品id
	 */
	var _getOfferBusiOrder = function (busiOrders,offer,prodId){
		var accNbr = _getAccessNumber(prodId);
		var busiOrder = {
			areaId : OrderInfo.getProdAreaId(prodId),  //受理地区ID		
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq-- 
			}, 
			busiObj : { //业务对象节点
				instId : offer.offerId,  //业务对象实例ID
				objId : offer.offerSpecId,  //业务规格ID
				offerTypeCd : offer.offerTypeCd //2附属销售品
			},  
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.OFFER_ACTION,
				boActionTypeCd : offer.boActionTypeCd
			}, 
			data:{}
		};
		
		if(ec.util.isObj(offer.offerSpecName)){ //销售品名称
			busiOrder.busiObj.objName = offer.offerSpecName;
		}
		if(ec.util.isObj(accNbr)){ //接入号
			busiOrder.busiObj.accessNumber = accNbr;
		}
		
		if(offer.boActionTypeCd == CONST.BO_ACTION_TYPE.BUY_OFFER){ //订购销售品
			//发展人
			var $tr = $("tr[name='tr_"+prodId+"_"+offer.offerSpecId+"']");
			if($tr!=undefined&&$tr.length>0){
				busiOrder.data.busiOrderAttrs = [];
				$tr.each(function(){   //遍历产品有几个发展人
					var dealer = {
						itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
						role : $(this).find("select").val(),
						value : $(this).find("input").attr("staffid"),
						channelNbr : $(this).find("select[name ='dealerChannel_"+prodId+"_"+offer.offerSpecId+"']").val()
					};
					busiOrder.data.busiOrderAttrs.push(dealer);
					var dealer_name = {
							itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER_NAME,
							role : $(this).find("select").val(),
							value : $(this).find("input").attr("value") 
					};
					busiOrder.data.busiOrderAttrs.push(dealer_name);
				});
			}
			//所属于人节点
			busiOrder.data.ooOwners = [];
			busiOrder.data.ooOwners.push({
				partyId : OrderInfo.cust.custId, //客户对象ID
				state : "ADD" //动作
			});
			//销售参数节点
			if(ec.util.isArray(offer.offerSpecParams)){  
				busiOrder.data.ooParams = [];
				$.each(offer.offerSpecParams,function(){
					if(this.setValue==undefined){
						this.setValue = this.value;
					}
					if(ec.util.isObj(this.setValue)){
						var ooParam = {
			                itemSpecId : this.itemSpecId,
			                offerParamId : OrderInfo.SEQ.paramSeq--,
			                offerSpecParamId : this.offerSpecParamId,
			                value : this.setValue,
			                state : "ADD"
			            };
						if (ec.util.isObj(this.setValue)) {
							busiOrder.data.ooParams.push(ooParam);
						}
					}
				});		
			}
			
			//销售生失效时间节点
			if(offer.ooTimes !=undefined ){  
				busiOrder.data.ooTimes = [];
				busiOrder.data.ooTimes.push(offer.ooTimes);
			}
			//销售品物品节点
			$.each(OrderInfo.attach2Coupons,function(){
				if(offer.offerSpecId == this.attachSepcId && prodId==this.prodId){
					busiOrder.data.bo2Coupons = [];//有多个
					return false;
				}	
			});
			$.each(OrderInfo.attach2Coupons,function(){
				if(offer.offerSpecId == this.attachSepcId && prodId==this.prodId){
					this.offerId = offer.offerId;
//					busiOrder.data.bo2Coupons = [];//有多个
					busiOrder.data.bo2Coupons.push(this);
//					return false;
				}	
			});
			//销售品成员角色节点
			busiOrder.data.ooRoles = [];
			//遍历附属销售品构成
			if(ec.util.isArray(offer.offerRoles)){
				$.each(offer.offerRoles,function(){
					var offerRole = this;
					$.each(this.roleObjs,function(){
						var roleObjs = this;
						var ooRoles = {
							prodId : prodId, //产品id
							offerRoleId : offerRole.offerRoleId, //销售品角色ID
							objId : this.objId, //规格id
							objType : this.objType, // 业务对象类型
							relaType : this.relaTypeCd,
							state : "ADD" //动作
						};
						var flag = true;
						if(this.objType == CONST.OBJ_TYPE.PROD){ //产品
							if(ec.util.isArray(offer.extAttrParams) && offer.extAttrParams[0].attrId=="800000041"){//套餐级可选包，所有角色都共享
								flag = false;
								if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==2){
									$.each(OrderInfo.offerSpec.offerRoles,function(){
										if(this.prodInsts!=undefined){
											$.each(this.prodInsts,function(){
												var ooRoles = {
														prodId : prodId, //产品id
														offerRoleId : offerRole.offerRoleId, //销售品角色ID
														objId : roleObjs.objId, //规格id
														objType : roleObjs.objType, // 业务对象类型
														relaType : roleObjs.relaTypeCd,
														state : "ADD" //动作
													};
												if(this.prodInstId==prodId && offerRole.memberRoleCd=="600"){
													ooRoles.prodId = this.prodInstId;
													ooRoles.objInstId = this.prodInstId;
													busiOrder.data.ooRoles.push(ooRoles);
												}else if(this.prodInstId!=prodId && offerRole.memberRoleCd=="601"){
													ooRoles.prodId = this.prodInstId;
													ooRoles.objInstId = this.prodInstId;
													busiOrder.data.ooRoles.push(ooRoles);
												}
											});
										}
									});
									if(ec.util.isArray(OrderInfo.oldoffer)){
										for ( var i = 0; i < OrderInfo.oldoffer.length; i++) {
											$.each(OrderInfo.oldoffer[i].offerMemberInfos,function(){
												var ooRoles = {
														prodId : prodId, //产品id
														offerRoleId : offerRole.offerRoleId, //销售品角色ID
														objId : roleObjs.objId, //规格id
														objType : roleObjs.objType, // 业务对象类型
														relaType : roleObjs.relaTypeCd,
														state : "ADD" //动作
													};
												if(this.objType=="2" && this.objInstId==prodId && offerRole.memberRoleCd=="600"){
													ooRoles.prodId = this.objInstId;
													ooRoles.objInstId = this.objInstId;
													busiOrder.data.ooRoles.push(ooRoles);
												}else if(this.objType=="2" && this.objInstId!=prodId && offerRole.memberRoleCd=="601"){
													ooRoles.prodId = this.objInstId;
													ooRoles.objInstId = this.objInstId;
													busiOrder.data.ooRoles.push(ooRoles);
												}
											});
										}
									}
								}else if(OrderInfo.actionFlag==6){
									$.each(OrderInfo.offerSpec.offerRoles,function(){
										if(this.prodInsts!=undefined){
											$.each(this.prodInsts,function(){
												var ooRoles = {
														prodId : prodId, //产品id
														offerRoleId : offerRole.offerRoleId, //销售品角色ID
														objId : roleObjs.objId, //规格id
														objType : roleObjs.objType, // 业务对象类型
														relaType : roleObjs.relaTypeCd,
														state : "ADD" //动作
													};
												if(this.prodInstId==prodId && offerRole.memberRoleCd=="600"){
														ooRoles.prodId = this.prodInstId;
														ooRoles.objInstId = this.prodInstId;
														busiOrder.data.ooRoles.push(ooRoles);
												}else if(offerRole.memberRoleCd=="601" && this.prodInstId!=prodId){
													ooRoles.prodId = this.prodInstId;
													ooRoles.objInstId = this.prodInstId;
													busiOrder.data.ooRoles.push(ooRoles);
												}
											});
										}
									});
									if(ec.util.isArray(OrderInfo.oldoffer)){
										for ( var i = 0; i < OrderInfo.oldoffer.length; i++) {
											$.each(OrderInfo.oldoffer[i].offerMemberInfos,function(){
												var ooRoles = {
														prodId : prodId, //产品id
														offerRoleId : offerRole.offerRoleId, //销售品角色ID
														objId : roleObjs.objId, //规格id
														objType : roleObjs.objType, // 业务对象类型
														relaType : roleObjs.relaTypeCd,
														state : "ADD" //动作
													};
												if(this.objType=="2" && this.objInstId==prodId && offerRole.memberRoleCd=="600"){
													ooRoles.prodId = this.objInstId;
													ooRoles.objInstId = this.objInstId;
													busiOrder.data.ooRoles.push(ooRoles);
												}else if(this.objType=="2" && this.objInstId!=prodId && offerRole.memberRoleCd=="601"){
													ooRoles.prodId = this.objInstId;
													ooRoles.objInstId = this.objInstId;
													busiOrder.data.ooRoles.push(ooRoles);
												}
											});
										}
									}
									$.each(OrderInfo.offer.offerMemberInfos,function(){
										var ooRoles = {
												prodId : prodId, //产品id
												offerRoleId : offerRole.offerRoleId, //销售品角色ID
												objId : roleObjs.objId, //规格id
												objType : roleObjs.objType, // 业务对象类型
												relaType : roleObjs.relaTypeCd,
												state : "ADD" //动作
											};
										if(this.objType=="2" && offerRole.memberRoleCd=="601"){
												ooRoles.prodId = this.objInstId;
												ooRoles.objInstId = this.objInstId;
												busiOrder.data.ooRoles.push(ooRoles);
										}
									});
								}else if(OrderInfo.actionFlag==3){
									$.each(OrderInfo.offer.offerMemberInfos,function(){
										var ooRoles = {
												prodId : prodId, //产品id
												offerRoleId : offerRole.offerRoleId, //销售品角色ID
												objId : roleObjs.objId, //规格id
												objType : roleObjs.objType, // 业务对象类型
												relaType : roleObjs.relaTypeCd,
												state : "ADD" //动作
											};
										if(this.objType=="2" && offerRole.memberRoleCd=="600" && this.objInstId==prodId){
											ooRoles.prodId = this.objInstId;
											ooRoles.objInstId = this.objInstId;
											busiOrder.data.ooRoles.push(ooRoles);
										}else if(this.objType=="2" && offerRole.memberRoleCd=="601" && this.objInstId!=prodId){
											oRoles.prodId = this.objInstId;
											ooRoles.objInstId = this.objInstId;
											busiOrder.data.ooRoles.push(ooRoles);
										}
									});
								}
							}else{
								var prodSpecId = OrderInfo.getProdSpecId(prodId);
								if(prodSpecId==this.objId || prodSpecId==""){//兼容省份空规格
									ooRoles.objInstId = prodId;//业务对象实例ID
								}else{
									return true;
								}
							}
						}else if(this.objType == CONST.OBJ_TYPE.SERV){ //服务
							var serv = CacheData.getServBySpecId(prodId,this.objId); //从服务实例中取值
							if(serv!=undefined){
								ooRoles.objInstId = serv.servId;
							}else{
								var servSpec = CacheData.getServSpec(prodId,this.objId); //从服务规格中取值
								if(servSpec!=undefined && servSpec.isdel!="Y" && servSpec.isdel != "C" && servSpec.servId!=undefined && servSpec.servId!=""){
									ooRoles.objInstId = servSpec.servId;
								}else{
									flag = false;
								}
							}
						}else { // 7销售品
							ooRoles.objInstId = OrderInfo.SEQ.offerSeq--;//业务对象实例ID
						}
						if(flag){
							busiOrder.data.ooRoles.push(ooRoles);
						}
					});
				});
			}
			busiOrders.push(busiOrder);
		}else if(offer.boActionTypeCd == CONST.BO_ACTION_TYPE.DEL_OFFER){ //退订销售品
			busiOrder.data.ooOwners = [];
			busiOrder.data.ooOwners.push({
				partyId : OrderInfo.cust.custId, //客户对象ID
				state : "DEL" //动作
			});
			if(ec.util.isArray(offer.offerMemberInfos)){ //遍历主销售品构成
				busiOrder.data.ooRoles = [];
				$.each(offer.offerMemberInfos,function(){
					var ooRoles = {
						accessNumber : this.accessNumber,//接入号码
						objId : this.objId, //业务规格ID
						objInstId : this.objInstId, //业务对象实例ID,新装默认-1
						objType : this.objType, // 业务对象类型
						offerRoleId : this.offerRoleId, //销售品角色ID
						state : "DEL" //动作
					};
					if(this.objType != CONST.OBJ_TYPE.PROD){ //不是接入产品
						ooRoles.prodId = prodId;//业务对象实例ID
					}
					if(this.offerMemberId!=undefined){  //兼容两级接口
						ooRoles.offerMemberId = this.offerMemberId; //成员id
					}
					busiOrder.data.ooRoles.push(ooRoles);
				});
			}
			if(offer.isRepeat!="Y"){//是否是用一个实例的销售品（用于3转4的预校验判断）
				busiOrders.push(busiOrder);
			}
		}else if(offer.boActionTypeCd == CONST.BO_ACTION_TYPE.UPDATE_OFFER){ //销售品成员变更,改参数
			if(offer.isUpdate=="Y"){ //销售品成员变更
				busiOrder.data.ooRoles = offer.data;
			}else{
				if(ec.util.isArray(offer.offerSpec.offerSpecParams)){
					busiOrder.data.ooParams = [];
					$.each(offer.offerSpec.offerSpecParams,function(){
						if(this.isUpdate=="Y"){
							if(ec.util.isObj(this.value)){
								var delParam = {
					                itemSpecId : this.itemSpecId,
					                offerParamId : this.offerParamId,
					                offerSpecParamId : this.offerSpecParamId,
					                value : this.value,
					                state : "DEL"
					            };
								busiOrder.data.ooParams.push(delParam);
							}
							if(ec.util.isObj(this.setValue)){
								var addParam = {
					                itemSpecId : this.itemSpecId,
					                offerParamId : OrderInfo.SEQ.paramSeq--,
					                offerSpecParamId : this.offerSpecParamId,
					                value : this.setValue,
					                state : "ADD"
					            };
					            busiOrder.data.ooParams.push(addParam);
							}
						}
					});	
				}
			}
			busiOrders.push(busiOrder);
		}
	};
			

	/*
	 * 获取产品节点
	 * @param  prodId 产品ID
	 * @param  servSpecName 产品名称
	 * @param  isComp  是否组合
	 * @param  boActionTypeCd  动作类型
	 */
	var _getProdBusiOrder = function (prodServ){
		var accNbr = _getAccessNumber(prodServ.prodId);
		var busiOrder = {
			areaId : OrderInfo.getProdAreaId(prodServ.prodId),  //受理地区ID
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq-- 
			}, 
			busiObj : { //业务对象节点
				objId : OrderInfo.getProdSpecId(prodServ.prodId),  //业务对象ID
				instId : prodServ.prodId //业务对象实例ID
			},  
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION,
				boActionTypeCd : prodServ.boActionTypeCd
			}, 
			data:{}
		};
		if(ec.util.isObj(prodServ.isComp)){ //是否组合
			busiOrder.busiObj.isComp = prodServ.isComp;
		}
		if(ec.util.isObj(accNbr)){ //接入号码
			busiOrder.busiObj.accessNumber = accNbr;
		}
		
		if(prodServ.boActionTypeCd == CONST.BO_ACTION_TYPE.PRODUCT_PARMS){ //改产品属性
			if(ec.util.isArray(prodServ.prodSpecParams)){
				busiOrder.data.boServs = [];
				busiOrder.data.boServs.push({
					servId : prodServ.memberId,
					state : "KIP"
				});
				busiOrder.data.boServOrders = [];
				busiOrder.data.boServOrders.push({
					servId: prodServ.memberId,
                    servSpecId: prodServ.servSpecId
				});
				busiOrder.data.boServItems = [];
				$.each(prodServ.prodSpecParams,function(){
					if(this.isUpdate=="Y"){
						if(ec.util.isObj(this.value)){
							var delParam = {
				                itemSpecId : this.itemSpecId,
				                servId : prodServ.memberId,
				                value : this.value,
				                state : "DEL"
				            };
							busiOrder.data.boServItems.push(delParam);
						}
						if(ec.util.isObj(this.setValue)){
							var addParam = {
				                itemSpecId : this.itemSpecId,
				                servId : prodServ.memberId,
				                value : this.setValue,
				                state : "ADD"
				            };
							busiOrder.data.boServItems.push(addParam);	
						}
					}
				});
			}
		}else if(prodServ.boActionTypeCd == CONST.BO_ACTION_TYPE.SERV_OPEN){  //服务开通或关闭
			var state = "ADD";
			if(prodServ.servClose == "Y"){ //服务关闭
				state = "DEL";
			}else {
				if(prodServ.servSpecId == undefined && prodServ.objId != undefined){
					prodServ.servSpecId = prodServ.objId;  //服务开通
				}
			}
			var servOrder = {
				servId: prodServ.servId,
                servSpecId: prodServ.servSpecId
			};
			if(ec.util.isObj(prodServ.servSpecName)){ //产品名称
				servOrder.servSpecName = prodServ.servSpecName;
			}
			busiOrder.data.boServOrders = [];
			busiOrder.data.boServOrders.push(servOrder);
			
			busiOrder.data.boServs = [];
			busiOrder.data.boServs.push({
				servId: prodServ.servId,
                state: state
			});
			if(prodServ.servClose != "Y"){ //服务开通
				if(ec.util.isArray(prodServ.prodSpecParams)){
					busiOrder.data.boServItems = [];
					$.each(prodServ.prodSpecParams,function(){
						if(this.setValue==undefined){
							this.setValue = this.value;
						}
						var feeType = $("select[name='pay_type_-1']").val();
						if(feeType==undefined) feeType = order.prodModify.choosedProdInfo.feeType;
						if(prodServ.servSpecId == CONST.YZFservSpecId && feeType == CONST.PAY_TYPE.AFTER_PAY){
							if (this.itemSpecId == CONST.YZFitemSpecId1 || this.itemSpecId == CONST.YZFitemSpecId2 || this.itemSpecId == CONST.YZFitemSpecId3 || (this.itemSpecId == CONST.YZFitemSpecId4 && "ON" != offerChange.queryPortalProperties("AGENT_" + OrderInfo.staff.soAreaId.substring(0,3))) ) {
								this.setValue = "";
							}
						}
						if (this.itemSpecId == CONST.YZFitemSpecId4 && "ON" != offerChange.queryPortalProperties("AGENT_" + OrderInfo.staff.soAreaId.substring(0,3))) {
							this.setValue = "";
						}
						if(ec.util.isObj(this.setValue)){
							var addParam = {
				                itemSpecId : this.itemSpecId,
				                servId : prodServ.servId,
				                value : this.setValue,
				                state : state
				            };
				            busiOrder.data.boServItems.push(addParam);
						}
					});
				}
				
				//发展人
				var $tr = $("tr[name='tr_"+prodId+"_"+prodServ.servSpecId+"']");
				if($tr!=undefined&&$tr.length>0){
					if(!ec.util.isArray(busiOrder.data.busiOrderAttrs)){
						busiOrder.data.busiOrderAttrs = [];
					}
					$tr.each(function(){   //遍历产品有几个发展人
						var dealer = {
							itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
							role : $(this).find("select").val(),
							value : $(this).find("input").attr("staffid"),
							channelNbr : $(this).find("select[name ='dealerChannel_"+prodId+"_"+prodServ.servSpecId+"']").val()
						};
						busiOrder.data.busiOrderAttrs.push(dealer);
						var dealer_name = {
								itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER_NAME,
								role : $(this).find("select").val(),
								value : $(this).find("input").attr("value") 
						};
						busiOrder.data.busiOrderAttrs.push(dealer_name);
					});
				}
			}
		}else if(prodServ.boActionTypeCd == CONST.BO_ACTION_TYPE.REMOVE_PROD){  //拆机
			busiOrder.data.boProdStatuses = [{ 
				prodStatusCd : CONST.PROD_STATUS_CD.NORMAL_PROD,
				state : "DEL"
			},{prodStatusCd : CONST.PROD_STATUS_CD.REMOVE_PROD,
				state : "ADD"
			}];
		}else if(prodServ.boActionTypeCd == CONST.BO_ACTION_TYPE.CHANGE_CARD ||
				prodServ.boActionTypeCd == CONST.BO_ACTION_TYPE.DIFF_AREA_CHANGE_CARD){  //补换卡	
			//发展人
			var accNbr = order.prodModify.choosedProdInfo.accNbr;
			var $tr = $("tr[name='tr_"+accNbr+"']");
			if($tr!=undefined&&$tr.length>0){
				if(!ec.util.isArray(busiOrder.data.busiOrderAttrs)){
					busiOrder.data.busiOrderAttrs = [];
				}
				$tr.each(function(){   //遍历产品有几个发展人
					var dealer = {
						itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
						role : $(this).find("select").val(),
						value : $(this).find("input").attr("staffid"),
						channelNbr : channelNbr = $(this).find("select[name ='dealerChannel_"+accNbr+"']").val()
					};
					busiOrder.data.busiOrderAttrs.push(dealer);
					var dealer_name = {
							itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER_NAME,
							role : $(this).find("select").val(),
							value : $(this).find("input").attr("value") 
					};
					busiOrder.data.busiOrderAttrs.push(dealer_name);
				});
			};
			var proUim = OrderInfo.getProdUim(prodServ.prodId); //获取新卡
			if(ec.util.isObj(proUim.prodId)){ //有新卡
				busiOrder.data.bo2Coupons = [];
				busiOrder.data.bo2Coupons.push(proUim);
				busiOrder.data.bo2Coupons.push(OrderInfo.getProdOldUim(prodServ.prodId));
			}else if(OrderInfo.zcd_privilege==0){//暂存信息 只录入老卡
				busiOrder.data.bo2Coupons = [];
				busiOrder.data.bo2Coupons.push(OrderInfo.getProdOldUim(prodServ.prodId));
			}else{
				return false;
			}
 		}
		return busiOrder;
	};
	
	/**
	 * 设置产品修改类通用服务
	 * busiOrders 业务对象节点
	 * data 数据节点
	 */
	var _setProdModifyBusiOrder = function(busiOrders,data) {	
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息 
		var busiOrder = {
			areaId : OrderInfo.getAreaId(),  //受理地区ID		
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				objId : prodInfo.productId,//prodInfo.productId, //业务对象规格ID
				instId : prodInfo.prodInstId, //业务对象实例ID
				accessNumber : prodInfo.accNbr  //业务号码
			},  
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION,
				boActionTypeCd : OrderInfo.boActionTypeCd
			}, 
			data:{}
		};
		busiOrder.data =data;
		busiOrders.push(busiOrder);
	};
	
	//获取产品跟可选包的关联关系
	/*var _getRelaType = function(servSpecId){
		var relaType = "";
		//遍历已开通附属销售品列表
		$.each(AttachOffer.openList,function(){
			$.each(this.specList,function(){
				$.each(this.offerRoles,function(){
					$.each(this.roleObjs,function(){
						if(this.objId==servSpecId){
							relaType = this.relaTypeCd;
							return false;
						}
					});
				});
			});
		});
		return relaType;
	};*/
	
	//客户信息节点
	var _boCustInfos = {
		areaId : 0,
		defaultIdType:"1",//证件类型
		businessPassword : "", //客户密码
		name : "", //	客户名称
		partyTypeCd : 1,//客户类型
		state : "ADD", //状态
		telNumber : "",  //联系电话
		addressStr:"",//客户地址
		mailAddressStr:""//通信地址
	};
	
	//客户证件节点
	var _boCustIdentities = {
		identidiesTypeCd : "1", //证件类型
		identityNum : "", //证件号码
		isDefault : "Y", //是否首选
		state : "ADD",  //状态
		identidiesPic : "" //证件照片
	};
	
	// 使用人：证件节点
	var _boUserCustIdentities = []; 
	
	// 使用人：证件节点
	var _boUserCustInfos = []; 
	
	// 使用人：联系人节点
	var _boUserPartyContactInfos = [];

	//客户证件节点
	var _bojbrCustIdentities = {
		identidiesTypeCd : "1", //证件类型
		identityNum : "", //证件号码
		isDefault : "Y", //是否首选
		state : "ADD",  //状态
		identidiesPic : "" //证件照片
	};

	//经办人信息节点
	var _bojbrCustInfos = {
		areaId : 0,
		defaultIdType:"1",//证件类型
		businessPassword : "", //客户密码
		name : "", //	客户名称
		partyTypeCd : 1,//客户类型
		state : "ADD", //状态
		telNumber : "",  //联系电话
		addressStr:"",//客户地址
		mailAddressStr:"",//通信地址
		jbrFlag:"Y"
	};
	
	//客户联系人节点
	var _boPartyContactInfo = {
		contactAddress : "",//参与人的联系地址
        contactDesc : "",//参与人联系详细信息
        contactEmployer  : "",//参与人的联系单位
        contactGender  : "",//参与人联系人的性别
        contactId : "",//参与人联系信息的唯一标识
        contactName : "",//参与人的联系人名称
        contactType : "",//联系人类型
        eMail : "",//参与人的eMail地址
        fax : "",//传真号
        headFlag : "",//是否首选联系人
        homePhone : "",//参与人的家庭联系电话
        mobilePhone : "",//参与人的移动电话号码
        officePhone : "",//参与人办公室的电话号码
        postAddress : "",//参与人的邮件地址
        postcode : "",//参与人联系地址的邮政编码
        staffId : 0,//员工ID
        state : "",//状态
        statusCd : "100001"//订单状态
	};
	
	//新建经办人时的联系人节点
	var _bojbrPartyContactInfo = {
		state 			: "ADD",	//状态，新建联系人
		staffId 		: 0,		//员工ID
		headFlag 		: "1",		//是否首选联系人，默认为是
        statusCd 		: "100001",	//订单状态
        mobilePhone 	: "",		//参与人的移动电话号码
	    contactName		: "",		//联系人名称，取页面上经办人的姓名
		contactAddress	: "",		//联系地址，取页面上经办人的地址
        contactGender	: "1",		//联系人的性别，无法辨别是默认是男
        contactType		: "10",		//联系人类型，默认为主要联系人
        //以下信息全部默认为空
        fax 			: "",		//传真号
        eMail			: "",		//参与人的eMail地址
        contactId		: "",		//参与人联系信息的唯一标识
        contactDesc 	: "",		//参与人联系详细信息
        contactEmployer : "",		//参与人的联系单位
        homePhone 		: "",		//参与人的家庭联系电话
        officePhone 	: "",		//参与人办公室的电话号码
        postAddress 	: "",		//参与人的邮件地址
        postcode 		: ""		//参与人联系地址的邮政编码
	};
	
	//新建使用人时联系人信息节点
	var _boUserPartyContactInfo = {
		state 			: "ADD",	//状态，新建联系人
		staffId 		: 0,		//员工ID
		headFlag 		: "1",		//是否首选联系人，默认为是
        statusCd 		: "100001",	//订单状态
	    contactName		: "",		//联系人名称，取页面上经办人的姓名
		contactAddress	: "",		//联系地址，取页面上经办人的地址
        contactGender	: "1",		//联系人的性别，无法辨别是默认是男
        contactType		: "10",		//联系人类型，默认为主要联系人
        //以下信息全部默认为空
        fax 			: "",		//传真号
        eMail			: "",		//参与人的eMail地址
        contactId		: "",		//参与人联系信息的唯一标识
        contactDesc 	: "",		//参与人联系详细信息
        contactEmployer : "",		//参与人的联系单位
        homePhone 		: "",		//参与人的家庭联系电话
        mobilePhone 	: "",		//参与人的移动电话号码
        officePhone 	: "",		//参与人办公室的电话号码
        postAddress 	: "",		//参与人的邮件地址
        postcode 		: ""		//参与人联系地址的邮政编码
	};
	
	//客户属性
	var _boCustProfiles = {};
	
	//初始化序列
	var _resetSeq = function(){
		OrderInfo.SEQ.seq = -1;  
		OrderInfo.SEQ.offerSeq = -1; 
		OrderInfo.SEQ.prodSeq = -1;  
		OrderInfo.SEQ.servSeq = -1;  
		OrderInfo.SEQ.itemSeq = -1;  
		OrderInfo.SEQ.acctSeq = -1;  
		OrderInfo.SEQ.acctCdSeq = -1;  
		OrderInfo.SEQ.paramSeq = -1;  
		OrderInfo.SEQ.atomActionSeq = -1;
		//OrderInfo.SEQ.dealerSeq = 1;
	};
	
	//初始化数据
	var _resetData = function(){
		
		OrderInfo.boUserCustInfos = []; 
		OrderInfo.boUserCustIdentities = []; 
		
		OrderInfo.boProdAns = [];  
		OrderInfo.boProd2Tds = []; 
		//OrderInfo.boProd2OldTds = []; 
		OrderInfo.bo2Coupons = [];
		AttachOffer.openList = [];
		AttachOffer.openedList = [];
		AttachOffer.openServList = [];
		AttachOffer.openedServList = [];
		AttachOffer.openAppList = [];
		AttachOffer.labelList = [];
		AttachOffer.allOfferList = [];
		OrderInfo.confirmList = [];
		OrderInfo.orderResult = {}; 
		/*OrderInfo.offerSpec = {}; //主销售品构成
		OrderInfo.offer = { //主销售品实例构成
			offerId : "",
			offerSpecId : "",
			offerMemberInfos : []
		}; */
		OrderInfo.order.step = 1;   //填单页面步骤为1
		_resetOrderInfoCache();
	};
	
	//初始化基础数据，actionClassCd 动作大类，boActionTypeCd 动作小类，actionFlag 受理类型，actionTypeName 动作名称，批量模板使用 templateType
	var _initData = function(actionClassCd,boActionTypeCd,actionFlag,actionTypeName,templateType){
		if(actionClassCd!=""&&actionClassCd!=undefined){
			OrderInfo.actionClassCd = actionClassCd;
		}
		if(boActionTypeCd!=""&&boActionTypeCd!=undefined){
			OrderInfo.boActionTypeCd = boActionTypeCd;
		}
		if(actionFlag!=undefined){
			OrderInfo.actionFlag = actionFlag;
		}
		if(actionTypeName!=""&&actionTypeName!=undefined){
			OrderInfo.actionTypeName = actionTypeName;
		}
		if(templateType!=""&&templateType!=undefined){
			OrderInfo.order.templateType = templateType;
		}
	};
	
	//获取号码
	var _getProdAn = function(prodId){
		var prodAn = {};
		for (var i = 0; i < OrderInfo.boProdAns.length; i++) {
			var an = OrderInfo.boProdAns[i];
			if(an==undefined){
				continue;
			}else{
				if(an.prodId == prodId){
					prodAn = an;
				}
			}
		}
		return prodAn;
	};

	//获取号码
	var _setProdAn = function(prodId,an){
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			$.each(this.prodInsts,function(){
				if(this.prodInstId == prodId){
					this.an = an;
					return false;
				}
			});
		});
	};
	
	
	//获取选号对应的地区
	var _getProdAreaId = function(prodId){
		try {
			//如果是分段受理,返回分段受理的受理地区ID
			if(stepOrder.main.isStepOrder){
				return stepOrder.main.areaId;
			}
		} catch (e) {
		}
		if(OrderInfo.actionFlag==41 || OrderInfo.actionFlag==42){//ess远程写卡、二次写卡
			return OrderInfo.essOrderInfo.essOrder.commonRegionId;
		}
		if(prodId!=undefined && prodId>0){ //二次业务
			var areaId = order.prodModify.choosedProdInfo.areaId;
			if(ec.util.isArray(OrderInfo.oldprodInstInfos) && order.service.oldMemberFlag){
				if(ec.util.isObj(OrderInfo.cust.areaId)){
					areaId = OrderInfo.cust.areaId;
				}else{
					areaId = OrderInfo.staff.soAreaId;
				}
			}
			if(areaId == undefined || areaId==""){
				$.alert("错误提示","产品信息未返回地区ID，请营业后台核实！");
				return ; 
			}
			return areaId;
		}else { //新装
			if(prodId!=undefined && prodId<0 && OrderInfo.actionFlag==6) {// 新装副卡取产品地区
				var areaId = order.prodModify.choosedProdInfo.areaId;
				if(areaId == undefined || areaId==""){
					$.alert("错误提示","产品信息未返回地区ID，请营业后台核实！");
					return ; 
				}
				return areaId;
			}
			if(ec.util.isObj(OrderInfo.cust.areaId)){
				return OrderInfo.cust.areaId;
			}else{
				return OrderInfo.staff.soAreaId;
			}
		}
	};
	
	//获取订单地区ID
	var _getAreaId = function(){
		//默认使用受理地区
		var areaId = OrderInfo.staff.soAreaId;		
		//裸机销售，终端退换货，分段受理订单还原 不需要定位客户，使用默认的受理地区
		if(OrderInfo.actionFlag==13 || OrderInfo.actionFlag==17 || OrderInfo.actionFlag==18 || OrderInfo.actionFlag==35 || OrderInfo.actionFlag==23){			
		}
		//新装，合约机新装，客户资料修改，使用客户归属地区
		else if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14 || OrderInfo.actionFlag==4 || OrderInfo.actionFlag==9 || OrderInfo.actionFlag==37){
			if(ec.util.isObj(OrderInfo.cust.areaId)){
				areaId = OrderInfo.cust.areaId;
			}
		}		
		//其他二次业务使用产品的归属地区			
		else if(ec.util.isObj(order.prodModify.choosedProdInfo.areaId)){				
			areaId = order.prodModify.choosedProdInfo.areaId;			
		}	
		return areaId;
	};
		
	//获取uim对象
	var _getProdOldUim = function(prodId){
		for (var i = 0; i < OrderInfo.boProd2OldTds.length; i++) {
			var td = OrderInfo.boProd2OldTds[i];
			if(td.prodId == prodId){
				return td;
			}
		}
		return {};
	};
	
	//获取uim对象
	var _getProdUim = function(prodId){
		for (var i = 0; i < OrderInfo.boProd2Tds.length; i++) {
			var td = OrderInfo.boProd2Tds[i];
			if(td.prodId == prodId){
				return td;
			}
		}
		return {};
	};
	
	//清空旧uim
	var _clearProdUim = function(prodId){
		for (var i = 0; i < OrderInfo.boProd2Tds.length; i++) {
			var td = OrderInfo.boProd2Tds[i];
			if(td.prodId == prodId){
				OrderInfo.boProd2Tds.splice(i,1);
			}
		}
	};
	
	//清空校验UIM返回数据
	var _clearCheckUimData = function(prodId){
		for (var i = 0; i < OrderInfo.checkUimData.length; i++) {
			var td = OrderInfo.checkUimData[i];
			if(td.prodId == prodId){
				OrderInfo.checkUimData.splice(i,1);
			}
		}
	};
	
	//获取校验UIM返回数据
	var _getCheckUimData = function(prodId){
		for (var i = 0; i < OrderInfo.checkUimData.length; i++) {
			var td = OrderInfo.checkUimData[i];
			if(td.prodId == prodId){
				return td;
			}
		}
		return "";
	};
	
	//获取uim卡
	var _getProdTd = function(prodId){
		for (var i = 0; i < OrderInfo.boProd2Tds.length; i++) {
			var td = OrderInfo.boProd2Tds[i];
			if(td.prodId == prodId){
				return td.terminalCode;
			}
		}
		return "";
	};
	
	//获取物品
	var _getProdCoupon = function(prodId){
		var flag = true;
		for (var i = 0; i < OrderInfo.bo2Coupons.length; i++) {
			var coupon = OrderInfo.bo2Coupons[i];
			if(coupon.prodId == prodId){
				flag = false ;
				return coupon;
			}
		}
		if(flag){
			var bo2Coupon = {
				prodId : prodId,
				coupons : []
			};
			OrderInfo.bo2Coupons.push(bo2Coupon);
			return bo2Coupon;
		}
	};
	
	//初始化物品
	var _initProdCoupon = function(prodId){
		var flag = true;
		for (var i = 0; i < OrderInfo.bo2Coupons.length; i++) {
			var coupon = OrderInfo.bo2Coupons[i];
			if(coupon.prodId == prodId){
				coupon.coupons = [];
				return coupon;
			}
		}
		if(flag){
			var bo2Coupon = {
				prodId : prodId,
				coupons : []
			};
			OrderInfo.bo2Coupons.push(bo2Coupon);
			return bo2Coupon;
		}
	};
	
	//根据产品id获取号码
	var _getAccessNumber = function(prodId){
		var accessNumber = "";
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==6 || OrderInfo.actionFlag==14 || OrderInfo.actionFlag==2){
			for (var i = 0; i < OrderInfo.boProdAns.length; i++) {
				var an = OrderInfo.boProdAns[i];
				if(an.prodId == prodId){
					if(an.accessNumber != undefined ){
						accessNumber =  an.accessNumber;
					}
				}
			}
			$.each(OrderInfo.oldprodInstInfos,function(){
				if(this.prodInstId==prodId){
					accessNumber = this.accNbr;
					return false;
				}
			});
			$.each(OrderInfo.offer.offerMemberInfos,function(i){
				if(this.objInstId==prodId){
					accessNumber = this.accessNumber;
					return false;
				}
			});
			if(ec.util.isArray(OrderInfo.oldprodInstInfos)&&OrderInfo.actionFlag==6){//判断是否是纳入老用户
				$.each(OrderInfo.oldoffer,function(){
					var oldoffer = this;
					$.each(oldoffer.offerMemberInfos,function(){
						if(this.objInstId==prodId){
							accessNumber = this.accessNumber;
							return false;
						}
					});
				});
			}
//			if(ec.util.isArray(OrderInfo.oldprodInstInfos)&&OrderInfo.actionFlag==6){//判断是否是纳入老用户
//				$.each(OrderInfo.oldoffer,function(){
//					var oldoffer = this;
//					$.each(oldoffer.offerMemberInfos,function(){
//						if(this.objInstId==prodId){
//							accessNumber = this.accessNumber;
//							return false;
//						}
//					});
//				});
//			}else{
//				for (var i = 0; i < OrderInfo.boProdAns.length; i++) {
//					var an = OrderInfo.boProdAns[i];
//					if(an.prodId == prodId){
//						if(an.accessNumber != undefined ){
//							accessNumber =  an.accessNumber;
//						}
//					}
//				}
//			}
		}else if(OrderInfo.actionFlag==21){
			var newProdId = "'"+prodId+"'";
			if(newProdId.indexOf("-")!= -1){
				for (var i = 0; i < OrderInfo.boProdAns.length; i++) {
					var an = OrderInfo.boProdAns[i];
					if(an.prodId == prodId){
						if(an.accessNumber != undefined ){
							accessNumber =  an.accessNumber;
						}
					}
				}
			}else{
				$.each(OrderInfo.offer.offerMemberInfos,function(i){
					if(this.objInstId==prodId){
						accessNumber = this.accessNumber;
						return false;
					}
				});
			}
		} else if(OrderInfo.actionFlag == 35){ //分段受理
			accessNumber = stepOrder.main.getAccessNumber(prodId);
		} else if(OrderInfo.actionFlag == 41) {//ess远程写卡
			accessNumber = OrderInfo.essOrderInfo.essOrder.phoneNumber; 
		} else if(prodId!=undefined && prodId>0){
			accessNumber = order.prodModify.choosedProdInfo.accNbr;	
		}
		return accessNumber;
	};
	
	//根据产品id获取地区编码
	var _getAreaCode = function(prodId){
		var areaCode = "";
		if(OrderInfo.actionFlag==41 || OrderInfo.actionFlag==42){//ess远程写卡、二次写卡
			return OrderInfo.essOrderInfo.essOrder.zoneNumber;
		}
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==6 || OrderInfo.actionFlag==14){
			for (var i = 0; i < OrderInfo.boProdAns.length; i++) {
				var an = OrderInfo.boProdAns[i];
				if(an.prodId == prodId){
					if(an.areaCode != undefined ){
						areaCode =  an.areaCode;
					}
				}
			}
		}else if(prodId!=undefined && prodId>0){
			areaCode = order.prodModify.choosedProdInfo.areaCode;	
		}
		if(areaCode ==undefined || areaCode==""){
			areaCode = OrderInfo.staff.areaCode;	
		}
		return areaCode;
		
	};
	
	//根据产品id获取号码
	var _getAccNbrByRoleCd = function(roleCd){
		var accNbr = "";
		$.each(OrderInfo.boProdAns,function(){
			if(this.memberRoleCd==roleCd){
				accNbr = this.accessNumber;
				return false;
			}
		});
		if(accNbr==undefined || accNbr==""){
			accNbr = OrderInfo.boProdAns[0].accessNumber;
		}
		return accNbr;
	};
	
	//获取产品对应的角色
	var _getOfferRoleName = function(prodId){
		var offerRoleName = "";
		if(OrderInfo.actionFlag==2 || OrderInfo.actionFlag==3){
			if(OrderInfo.offer.offerMemberInfos!=undefined){
				$.each(OrderInfo.offer.offerMemberInfos,function(i){
					if(this.objInstId == prodId){
						offerRoleName = this.roleName;  //角色名称
						return false;
					}
				});
			}
		}else{
			if(OrderInfo.offerSpec.offerRoles!=undefined){
				$.each(OrderInfo.offerSpec.offerRoles,function(i){
					var roleName = this.offerRoleName;  //角色名称
					if(this.prodInsts!=undefined){
						$.each(this.prodInsts,function(){
							if(this.prodInstId == prodId){
								offerRoleName = roleName;
								return false;
							}
						});
					}
				});
			}
		}
		return offerRoleName;
	};
	
	//根据产品Id获取缓存中的产品实例
	var _getProdInst = function(prodId){
		var prodInst = {};
		if(OrderInfo.actionFlag == 2){ //套餐变更
			$.each(OrderInfo.offer.offerMemberInfos,function(i){
				if(this.objInstId ==prodId){
					prodInst = this;
					prodInst.accNbr = this.accessNumber;
					return false;
				}
			});
		}else if(OrderInfo.actionFlag == 3 || OrderInfo.actionFlag == 22){ //可选包变更
			prodInst = order.prodModify.choosedProdInfo;
		}else { //新装
			$.each(OrderInfo.offerSpec.offerRoles,function(i){
				if(this.prodInsts!=undefined){
					$.each(this.prodInsts,function(){
						if(this.prodInstId == prodId){
							prodInst = this;
							return false;
						}
					});
				}
			});
		}
		return prodInst;
	};
	
	//根据接入产品id获取接人产品规格
	var _getProdSpecId = function(prodId){
		var prodSpecId = CONST.PROD_SPEC.CDMA;  //默认CDMA
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14){
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				$.each(this.prodInsts,function(){
					if(this.prodInstId == prodId){
						prodSpecId = this.objId;
						return false;
					}
				});
			});
		}else if(OrderInfo.actionFlag==2){
			$.each(OrderInfo.offer.offerMemberInfos,function(i){
				if(this.objInstId==prodId){
					prodSpecId = this.objId;
					return false;
				}
			});
		} else if(prodId!=undefined && prodId>0){
			if(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6){//判断是否是纳入老用户
				$.each(OrderInfo.oldprodInstInfos,function(){
					if(this.prodInstId==prodId){
						prodSpecId = this.productId;
					}
				});
			}else{
				prodSpecId = order.prodModify.choosedProdInfo.productId;
			}
		}
		return prodSpecId;
	};
	
	//获取权限
	var _getPrivilege = function(manageCode){
		if(OrderInfo.privilege.effTime==""){
			var param = {
				manageCode : manageCode	
			};
			return query.offer.checkOperate(param);
		}
	};
	
	var _updateChooseUserInfos = function(prodId, custInfo){
		if(!OrderInfo.choosedUserInfos){
			OrderInfo.choosedUserInfos = [];
		}
		var index = -1;
		for(var i=0; i<OrderInfo.choosedUserInfos.length; i++){
			if(OrderInfo.choosedUserInfos[i].prodId == prodId){
				index = i;
				break;
			}
		}
		if(index == -1){
			OrderInfo.choosedUserInfos.push({
				prodId : prodId,
				custInfo : custInfo
			});
		} else {
			OrderInfo.choosedUserInfos[index].custInfo = custInfo; 
		}
	};
	
	var _getChooseUserInfo = function(prodId){
		if(!!OrderInfo.choosedUserInfos && OrderInfo.choosedUserInfos.length){
			for(var i=0; i<OrderInfo.choosedUserInfos.length; i++){
				if(OrderInfo.choosedUserInfos[i].prodId == prodId){
					return OrderInfo.choosedUserInfos[i].custInfo;
				}
			}
		}
		return null;
	};
	
	var _resetChooseUserInfo = function(){
		order.cust.queryForChooseUser = false; //重置选择使用人标识
		order.cust.tmpChooseUserInfo = {};
		OrderInfo.choosedUserInfos = [];
		_resetOrderInfoCache();//填单页面返回“上一步”或“取消”时清空经办人、使用人缓存
	};
				
	_newofferSpecName = "";
	
	//判断是否是群产品
	var _isGroupProSpec=function(prodSpec){
		for(var i=0;i<CONST.GROUP_PROD_SPEC.length;i++){
			if(CONST.GROUP_PROD_SPEC[i]==prodSpec){
				return true;
			}
		}
		return false;
	};
	
	//是否是群功能产品
	var _isGroupProSpecId=function(specId){
		for(var i=0;i<CONST.GROUP_SERV_SPEC_ID.length;i++){
			if(CONST.GROUP_SERV_SPEC_ID[i]==specId){
				return true;
			}
		}
		return false;
	};
	
	var _saveOrder = {
			olId:"",
			flag:""
	}
	
	//二次加载的数据
	var data="";
	//套餐id
	var offid="";
	//判断是否二次加载
	var reloadFlag="";
	var _provinceInfo = {};
	//新装二次加载参数定义
	var _newOrderInfo={
		  result:{},
		  checkMaskList:[],//是否信控信息
		  prodOfferId:"",
		  prodOfferName:"",
		  isReloadFlag:"",
		  paymentAcctTypeCd:"",
		  mailingType:"",//投递方式
		  bankAcct:"",
		  bankId:"",
		  limitQty:"",
		  paymentMan:"",
		  param1:"",//投递地址
		  param2:"",//投递周期
		  param3:"",
		  param7:"", //账单内容
		  isLastFlag:""//判断是否需要上一步功能
	};
	
	var _realNamePhotoFlag = "";//实名制拍照开关
	var _ifCreateHandleCust = false;//判断是否需要新建经办人

	/**
	 * 填单页面返回“上一步”或“取消”时清空经办人、使用人缓存
	 */
	var _resetOrderInfoCache = function() {
		OrderInfo.ifCreateHandleCust	  = false;//判断是否需要新建经办人
		OrderInfo.boUserPartyContactInfos = [];//使用人：联系人节点
		OrderInfo.boUserCustIdentities	  = [];//使用人：客户证件节点
		OrderInfo.boUserCustInfos 		  = [];//使用人：客户信息节点
		OrderInfo.virOlId				  = "";//拍照上传虚拟购物车ID
		OrderInfo.handleCustId 			  = "";//经办人为老客户时的客户ID
		OrderInfo.realNamePhotoFlag 	  = "";//实名制拍照开关
		OrderInfo.bojbrCustInfos 		  = $.extend(true, {}, _bojbrCustInfos);//经办人：客户信息节点
		OrderInfo.bojbrCustIdentities	  = $.extend(true, {}, _bojbrCustIdentities);//经办人：客户证件节点
		OrderInfo.bojbrPartyContactInfo   = $.extend(true, {}, _bojbrPartyContactInfo);//经办人：客户证件节点
	};
	
	return {	
		order					: _order,
		SEQ						: _SEQ,
		resetSeq				: _resetSeq,
		resetData				: _resetData,	
		orderResult				: _orderResult,
		cust					: _cust,
		staff					: _staff,
		channelList				: _channelList,
		offerSpec				: _offerSpec,
		offer 					: _offer,
		attach2Coupons			: _attach2Coupons,
		boCustInfos 			: _boCustInfos,
		boCustIdentities 		: _boCustIdentities,
		boPartyContactInfo 		: _boPartyContactInfo,
		boCustProfiles			: _boCustProfiles,
		boCusts					: _boCusts,
		boProdItems				: _boProdItems,
		boProdPasswords			: _boProdPasswords,
		boProdAns				: _boProdAns,
		boProd2Tds				: _boProd2Tds,
		bo2Coupons				: _bo2Coupons,
		boProd2OldTds			: _boProd2OldTds,
		clearProdUim			: _clearProdUim,
		clearCheckUimData		: _clearCheckUimData,
		getCheckUimData			: _getCheckUimData,
		orderData 				: _orderData,
		getOrderData 			: _getOrderData,
		actionClassCd			: _actionClassCd,
		boActionTypeCd			: _boActionTypeCd,
		actionFlag 				: _actionFlag,
	//	returnFlag             :  _returnFlag,
		isSuccess 				: _isSuccess,
		actionTypeName			: _actionTypeName,
		initData				: _initData,
		getOfferBusiOrder		: _getOfferBusiOrder,
		getProdBusiOrder		: _getProdBusiOrder,
		createCust				: _createCust,
		createAcct				: _createAcct,
		getChannelList			: _getChannelList,
		getProdAn				: _getProdAn,
		getProdTd				: _getProdTd,
		getProdUim				: _getProdUim,
		getProdOldUim			: _getProdOldUim,
		getProdAreaId			: _getProdAreaId,
		getProdCoupon			: _getProdCoupon,
		getProdInst				: _getProdInst,
		getAccessNumber			: _getAccessNumber,
		getAreaCode				: _getAreaCode,
		getAreaId 				: _getAreaId,
		getOfferRoleName		: _getOfferRoleName,
		getAccNbrByRoleCd    	: _getAccNbrByRoleCd,
		getProdSpecId			: _getProdSpecId,
		getPrivilege			: _getPrivilege,
		initProdCoupon			: _initProdCoupon,
		setProdAn				: _setProdAn,
		setProdModifyBusiOrder	: _setProdModifyBusiOrder,
		confirmList				: _confirmList,	
		businessName			: _businessName,
		password_remark         : _password_remark,
		privilege				: _privilege,
		offerProdInst          	: _offerProdInst,
		orderlonger				:_orderlonger,
		busitypeflag			:_busitypeflag,
		checkresult				:_checkresult,
		custorderlonger			:_custorderlonger,
		prodAttrs				:_prodAttrs,
		zcd_privilege			:_zcd_privilege,
		load_zcd_privilege		:_load_zcd_privilege,
		ifLteNewInstall			:_ifLteNewInstall,
		oldprodInstInfos		:_oldprodInstInfos,
		oldofferSpec			:_oldofferSpec,
		oldoffer				:_oldoffer,
		oldprodAcctInfos		:_oldprodAcctInfos,
		oldMvFlag				:_oldMvFlag,
		choosedNumList			:_choosedNumList,
		viceOffer				:_viceOffer,
		viceprodInstInfos		:_viceprodInstInfos,
		hasMainCarFlag			:_hasMainCarFlag,
		oldAddNumList			:_oldAddNumList,
		newofferSpecName		:_newofferSpecName,
		viceOfferSpec			:_viceOfferSpec,
		prodInstAttrs			:_prodInstAttrs,
		isGroupProSpecId		:_isGroupProSpecId,
		isGroupProSpec			:_isGroupProSpec,
		choosedUserInfos 		:_choosedUserInfos,
		updateChooseUserInfos	:_updateChooseUserInfos,
		getChooseUserInfo		:_getChooseUserInfo,
		resetChooseUserInfo		:_resetChooseUserInfo,
		checkUimData			:_checkUimData,
		saveOrder				:_saveOrder,
		provinceInfo           	:_provinceInfo,
		newOrderInfo			:_newOrderInfo,
		custCreateToken         :_custCreateToken,
		authRecord				:_authRecord,
		cust_validateType		:_cust_validateType,
		cust_validateNum		:_cust_validateNum,
		staffInfoFlag 			:_staffInfoFlag,
		essOrderInfo            :_essOrderInfo,
		preBefore 				:_preBefore,
		roleCd  		 		:_roleCd,
		roleType 				:_roleType,
		bojbrCustInfos          :_bojbrCustInfos,
		bojbrCustIdentities     :_bojbrCustIdentities,
		virOlId 				:_virOlId,
		handleCustId 			:_handleCustId,
		boUserCustIdentities 	:_boUserCustIdentities,
		boUserCustInfos 		:_boUserCustInfos,
		realNamePhotoFlag		:_realNamePhotoFlag,
		ifCreateHandleCust		:_ifCreateHandleCust,
        isExistCFQ              :_isExistCFQ
	};
})();