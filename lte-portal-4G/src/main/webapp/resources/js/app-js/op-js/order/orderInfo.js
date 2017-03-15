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
	 * 6 销售品成员变更加装副卡，7 拆主卡保留副卡 8单独新建客户, 9、客户资料返档,10 是公用节点传入 11 撤单，12 加入退出组合 
	 * 
	 * 13 购买裸机  14 合约套餐  15 补退费  16 改号	17 终端退货 18 终端换货 19返销 20返销,22补换卡,23异地补换卡
	 * 
	 * 31改产品密码，32重置产品密码，,33改产品属性，34修改短号，35 新建客户  ，36 客户资料修改  
	 * 40  受理单查询
	 */
	var _actionFlag = 0;
	var _acctId = -1;
	var _acctCd = -1;
	//补卡换卡  22.补卡21.换卡
	var _uimType="21";
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
	17 改产品密码*/
	
	//定义新装动作
	var newClothes="false";
	//定义纳入老成员动作
	var oldMember="false";
	//定义拆副卡变套餐或者拆副卡动作
	var delViceCard="false";
	var _acctNbr="";
	//定义执行状态
	var state="";
	
	var _busitypeflag = 0;
	
	var _orderlonger = "";
	//鉴权后保存id
    var _recordId="";
	var _custorderlonger = "";
	//保存uim参数
	var _mktResInstCode="";
	//终端串码
	var _terminalCode="";
	var _provinceInfo={
		provIsale:"",
		redirectUri:"",
		isFee:"1",
		extCustOrderID:"",
		reloadFlag:"",
		prodOfferId:"",
		prodOfferName:"",
		mergeFlag:"0"
	}
	
	var _oldSubPhoneNum = {
		oldSubPhoneNum:""
	};
	
	var _codeInfos={
		DevelopmentCode:"",
		terminalCode:"",
		developmentObjId:""
	}
	var objInstId="";
	var newPhoneId="";	
	var _reloadOrderInfo;
	var _cust = { //保存客户信息
		custId : "",
		partyName : "",
		vipLevel : "",
		vipLevelName : "",
		custFlag :"1100"//1000：红客户，1100：白客户，1200：黑客户
	}; 
	var _viceParam = {}; //主副卡对象
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
	
	var _provinceInfo={
			provIsale:"",
			redirectUri:"",
			isFee:"1",
			extCustOrderID:"",
			reloadFlag:"",
			prodOfferId:"",
			prodOfferName:"" 
	}
	
	var _surplusNum = 0;//剩余可纳入副卡数量
	
	//成员变更传入
	var _memberChangeInfo={
		//主号码
		mainPhoneNum:"",
		//新装成员号码： 多个成员使用分隔符‘,’
		newSubPhoneNum:"",
		//成员变更时，老用户成员号码：多个成员使用分隔符‘,’
	    oldSubPhoneNum :"",
	    //传入的uim卡
	    mktResInstCode:""
	};
	
	//新装传入主副卡号码
	var _newOrderNumInfo = {
		mainPhoneNum:"",
		newSubPhoneNum:"",
		mktResInstCode:"",
		codeMsg:""
	};
	//新装二次加载功能参数
	var _reloadProdInfo={
		cardNum:"",
		checkMaskList:[],//是否信控信息
		feeType:"",//付费方式
		orderMark:"",//备注
		isReloadFlag:"",
		objInstId:"",//发展人id信息
		dealerlist:[],//发展人填单信息
		paymentAcctTypeCd:"",
		mailingType:"",//投递方式
		bankAcct:"",
		bankId:"",
		limitQty:"",
		paymentMan:"",
		param1:"",//投递地址
		param2:"",//投递周期
		param3:"",
		param7:"" //账单内容
	};
	
	var _preBefore ={
			prcFlag : ""	
	};//保存前置检验的结果
		
	var _offerSpec = {}; //主销售品构成
	var _oneCardFiveNum=[];//一证五号校验缓存
	
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
		templateType : 1,   //模板类型: 0批量开活卡,1批量新装 ,2批量订购/退订附属, 3组合产品纳入退出 ,4批量修改产品属性,5批量换挡 ,8拆机 ,9批量修改发展人
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
	var _rulesJson="";
	//鉴权类别
    var _typeCd="";
		//鉴权级别
	var _verifyLevel="";
	var _authRecord={
				menuId:"",
				validateType:"",
				resultCode:""
			};//保存鉴权临时结果
	
	//创建一个订单完整节点
	var _getOrderData = function(){
		//订单提交完整节点
		var data = { 
			orderList : {
				orderListInfo : { 
					isTemplateOrder : "N",   //是否批量
					templateType : OrderInfo.order.templateType,  //模板类型: 1 新装；8 拆机；2 订购附属；3 组合产品纳入/退出
					staffId : OrderInfo.staff.staffId,
					channelId : OrderInfo.staff.channelId,  //受理渠道id
					areaId : OrderInfo.staff.soAreaId,
					partyId : -1,  //新装默认-1
					//distributorId : OrderInfo.staff.distributorId, //转售商标识
					olTypeCd : CONST.OL_TYPE_CD.UI_LTE,  //UI能力开放
					custOrderAttrs: []
				},
				custOrderList :[{busiOrder : []}]   //客户订购列表节点
			}
		};
		OrderInfo.orderData = data;
		return OrderInfo.orderData;
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
		cust.getCustInfo();
		busiOrder.data.boCustInfos.push(OrderInfo.boCustInfos);
		busiOrder.data.boCustIdentities.push(OrderInfo.boCustIdentities);
		if($("#tabProfile0").attr("click")=="0"&&($("#contactName").val()!="")){
			busiOrder.data.boPartyContactInfo.push(OrderInfo.boPartyContactInfo);
		}
		
		if(OrderInfo.boCustProfiles!=undefined && OrderInfo.boCustProfiles!=""){
			busiOrder.data.boCustProfiles = [];
			busiOrder.data.boCustProfiles = OrderInfo.boCustProfiles;
		}
		busiOrders.push(busiOrder);
	};
	
	//创建帐户节点  默认写死
	var _createAcct = function(busiOrders,acctId) {
		var acctName = OrderInfo.cust.partyName;
		var paymentType = 100000;  //100000现金，110000银行
		var bankId = "";
		var bankAcct = "";
		var paymentMan = "";
		var postType=-1;//是否投递账单 默认不投递
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
		if(postType!=-1){
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
			//发展人(公共)
			var $tr = $("li[name='tr_"+prodId+"_"+offer.offerSpecId+"']");
			if($tr!=undefined&&$tr.length>0){
				busiOrder.data.busiOrderAttrs = [];
				$tr.each(function(){   //遍历产品有几个发展人
					var dealer = {
						itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
						role:$(this).find("select[name='dealerType_"+prodId+"_"+offer.offerSpecId+"']").val(),
						value : $(this).find("input").attr("staffid"),
						//APP发展人渠道[W]
						channelNbr:$(this).find("select[name='dealerChannel_"+prodId+"_"+offer.offerSpecId+"']").val()
					};
					busiOrder.data.busiOrderAttrs.push(dealer);		
					
					var dealer_name = {
						itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER_NAME,
						role:$(this).find("select[name='dealerType_"+prodId+"_"+offer.offerSpecId+"']").val(),
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
						busiOrder.data.ooParams.push(ooParam);
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
					this.offerId = offer.offerId;
					busiOrder.data.bo2Coupons = [];
					busiOrder.data.bo2Coupons.push(this);
					return false;
				}	
			});
			//销售品成员角色节点
			busiOrder.data.ooRoles = [];
			//遍历附属销售品构成
			if(ec.util.isArray(offer.offerRoles)){
				$.each(offer.offerRoles,function(){
					var offerRole = this;
					$.each(this.roleObjs,function(){
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
							var prodSpecId = OrderInfo.getProdSpecId(prodId);
							if(prodSpecId==this.objId || prodSpecId==""){//兼容省份空规格
								ooRoles.objInstId = prodId;//业务对象实例ID
							}else{
								return true;
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
							//#1129252 去除10020036是否需要代扣确认限制
							var yiPayItemRes = $.callServiceAsJson(contextPath + "/properties/getValue", {"key": "YIPAY_ITEM_" + OrderInfo.staff.areaId.substr(0, 3)});
							var yiPayItemFlag = "OFF";
							if (yiPayItemRes.code == "0") {
								yiPayItemFlag = yiPayItemRes.data;
							}
							if (this.itemSpecId == CONST.YZFitemSpecId1 || this.itemSpecId == CONST.YZFitemSpecId2 || (this.itemSpecId == CONST.YZFitemSpecId3 && yiPayItemFlag == "OFF")) {
								this.setValue = "";
							}
						}
						var agentResponse = $.callServiceAsJson(contextPath + "/properties/getValue", {"key": "AGENT_" + OrderInfo.staff.areaId.substr(0, 3)});
						var agentFlag = "OFF";
						if (agentResponse.code == "0") {
							agentFlag = agentResponse.data;
						}
						if (this.itemSpecId == CONST.YZFitemSpecId4 && agentFlag == "OFF") {
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
				
				//功能产品-发展人数据信息
				var prodId=prodServ.prodId;
				var $tr = $("li[name='tr_"+prodId+"_"+prodServ.servSpecId+"']");
				if($tr!=undefined && $tr.length>0){
					if(!ec.util.isArray(busiOrder.data.busiOrderAttrs)){
						busiOrder.data.busiOrderAttrs = [];
					}
					
					$tr.each(function(){   //遍历产品有几个发展人
						var dealer = {
							itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
							role:$(this).find("select[name='dealerType_"+prodId+"_"+prodServ.servSpecId+"']").val(),
							value : $(this).find("input").attr("staffid"),
							//APP发展人渠道[W]
							channelNbr:$(this).find("select[name='dealerChannel_"+prodId+"_"+prodServ.servSpecId+"']").val()
						};
						busiOrder.data.busiOrderAttrs.push(dealer);		
						
						var dealer_name = {
							itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER_NAME,
							role:$(this).find("select[name='dealerType_"+prodId+"_"+prodServ.servSpecId+"']").val(),
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
		}else if(prodServ.boActionTypeCd == CONST.BO_ACTION_TYPE.CHANGE_CARD || prodServ.boActionTypeCd == CONST.BO_ACTION_TYPE.DIFF_AREA_CHANGE_CARD){  //补换卡	
			//补换卡-发展人数据信息
			var accNbr = order.prodModify.choosedProdInfo.accNbr;
			
			var $tr = $("li[name='tr_"+accNbr+"']");
			if($tr!=undefined && $tr.length>0){
				if(!ec.util.isArray(busiOrder.data.busiOrderAttrs)){
					busiOrder.data.busiOrderAttrs = [];
				}
				
				$tr.each(function(){   //遍历产品有几个发展人
					var dealer = {
						itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
						role:$(this).find("select[name='dealerType_"+accNbr+"']").val(),
						value : $(this).find("input").attr("staffid"),
						//APP发展人渠道[W]
						channelNbr:$(this).find("select[name='dealerChannel_"+accNbr+"']").val()
					};
					busiOrder.data.busiOrderAttrs.push(dealer);		
					
					var dealer_name = {
						itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER_NAME,
						role:$(this).find("select[name='dealerType_"+accNbr+"']").val(),
						value : $(this).find("input").attr("value") 
					};
					busiOrder.data.busiOrderAttrs.push(dealer_name);
				});
			}
			
			var proUim = OrderInfo.getProdUim(prodServ.prodId); //获取新卡
			if(ec.util.isObj(proUim.prodId)){ //有新卡
				busiOrder.data.bo2Coupons = [];
				busiOrder.data.bo2Coupons.push(proUim);
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
		state : "ADD"  //状态
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
		OrderInfo.confirmList = [];
		OrderInfo.orderResult = {}; 
		/*OrderInfo.offerSpec = {}; //主销售品构成
		OrderInfo.offer = { //主销售品实例构成
			offerId : "",
			offerSpecId : "",
			offerMemberInfos : []
		}; */
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
				return; 
			}
			return areaId;
		}else { //新装
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
		//裸机销售，终端退换货不需要定位客户，使用默认的受理地区
		if(OrderInfo.actionFlag==13 || OrderInfo.actionFlag==17 || OrderInfo.actionFlag==18){			
		}
		//新装，合约机新装，客户资料修改，使用客户归属地区
		else if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14 || OrderInfo.actionFlag==4 || OrderInfo.actionFlag==9){
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
	var _getAccessNumberSub = function(prodId){
		var accessNumber = "";
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==6 || OrderInfo.actionFlag==14){
			if(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6){//判断是否是纳入老用户
				$.each(OrderInfo.oldoffer,function(){
					var oldoffer = this;
					$.each(oldoffer.offerMemberInfos,function(){
						if(this.objInstId==prodId){
							accessNumber = this.accessNumber;
							return false;
						}
					});
				});
			}else{
				for (var i = 0; i < OrderInfo.boProdAns.length; i++) {
					var an = OrderInfo.boProdAns[i];
					if(an.prodId == prodId){
						if(an.accessNumber != undefined ){
							accessNumber =  an.accessNumber;
						}
					}
				}
			}
		}else if(OrderInfo.actionFlag==2||OrderInfo.actionFlag==21){
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
				if((accessNumber==undefined || accessNumber=="") && offerChange.oldMemberFlag){
					$.each(OrderInfo.oldoffer,function(){
						$.each(this.offerMemberInfos,function(){
							if(this.objInstId==prodId){
								accessNumber = this.accessNumber;
								return false;
							}
						});
					});
				}
			}
		} else if(prodId!=undefined && prodId>0){
			accessNumber = order.prodModify.choosedProdInfo.accNbr;	
		}else if(prodId!=undefined && prodId>0){
			accessNumber = order.prodModify.choosedProdInfo.accNbr;	
		}
		return accessNumber;
	};
	
	//根据产品id获取号码
	var _getAccessNumber = function(prodId){
		var accessNumber = "";
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14){
			if(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6){//判断是否是纳入老用户
				$.each(OrderInfo.oldoffer,function(){
					var oldoffer = this;
					$.each(oldoffer.offerMemberInfos,function(){
						if(this.objInstId==prodId){
							accessNumber = this.accessNumber;
							return false;
						}
					});
				});
			}else{
				for (var i = 0; i < OrderInfo.boProdAns.length; i++) {
					var an = OrderInfo.boProdAns[i];
					if(an.prodId == prodId){
						if(an.accessNumber != undefined ){
							accessNumber =  an.accessNumber;
						}
					}
				}
			}
		}else if(OrderInfo.actionFlag==6 || OrderInfo.actionFlag==2){
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
		}else if(OrderInfo.actionFlag==21){
			$.each(OrderInfo.offer.offerMemberInfos,function(i){
				if(this.objInstId==prodId){
					accessNumber = this.accessNumber;
					return false;
				}
			});
		} else if(OrderInfo.actionFlag == 35){ //分段受理
			accessNumber = stepOrder.main.getAccessNumber(prodId);
		} else if(prodId!=undefined && prodId>0){
			accessNumber = order.prodModify.choosedProdInfo.accNbr;	
		}
		return accessNumber;
	};
	
	
	//根据产品id获取地区编码
	var _getAreaCode = function(prodId){
		var areaCode = "";
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
		}else if(OrderInfo.actionFlag == 3){ //可选包变更
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
			if(offerChange.oldMemberFlag){
				$.each(OrderInfo.oldoffer,function(){
					$.each(this.offerMemberInfos,function(){
						if(this.objInstId==prodId){
							prodSpecId = this.objId;
							return false;
						}
					});
				});
			}
			if(offerChange.newMemberFlag){
				$.each(OrderInfo.offerSpec.offerRoles,function(){
					$.each(this.prodInsts,function(){
						if(this.prodInstId == prodId){
							prodSpecId = this.objId;
							return false;
						}
					});
				});
			}
		} else if(prodId!=undefined && prodId>0){
			prodSpecId = order.prodModify.choosedProdInfo.productId;	
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
			
	var _oneCardFiveNO={"usedNum":{},"checkNum":{}};//一证五号校验缓存
	return {
		state:state,
		delViceCard:delViceCard,
		newClothes:newClothes,
		oldMember:oldMember,
		objInstId:objInstId,
		terminalCode:_terminalCode,
		newPhoneId:newPhoneId,
	    mktResInstCode:_mktResInstCode,
		viceParam               :  _viceParam,
		acctId                  : _acctId,
		acctCd                  : _acctCd,
		order					: _order,
		SEQ						: _SEQ,
		resetSeq				: _resetSeq,
		resetData				: _resetData,	
		orderResult				: _orderResult,
		cust					: _cust,
		staff					: _staff,
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
		orderData 				: _orderData,
		getOrderData 			: _getOrderData,
		actionClassCd			: _actionClassCd,
		boActionTypeCd			: _boActionTypeCd,
		actionFlag 				: _actionFlag,
		actionTypeName			: _actionTypeName,
		initData				: _initData,
		getOfferBusiOrder		: _getOfferBusiOrder,
		getProdBusiOrder		: _getProdBusiOrder,
		createCust				: _createCust,
		createAcct				: _createAcct,
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
		provinceInfo : _provinceInfo,
		reloadOrderInfo :_reloadOrderInfo,
		reloadProdInfo :_reloadProdInfo,
		memberChangeInfo:_memberChangeInfo,
		newOrderNumInfo:_newOrderNumInfo,
		oldSubPhoneNum:_oldSubPhoneNum,
		oldprodInstInfos		:_oldprodInstInfos,
		oldofferSpec			:_oldofferSpec,
		oldoffer				:_oldoffer,
		oldprodAcctInfos		:_oldprodAcctInfos,
		oldAddNumList			:_oldAddNumList,
		surplusNum				:_surplusNum,
		oldSubPhoneNum			:_oldSubPhoneNum,
		codeInfos:_codeInfos,
		getChannelList:_getChannelList,
		channelList:_channelList,
		authRecord:_authRecord,
		typeCd:_typeCd,
		verifyLevel:_verifyLevel,
		rulesJson:_rulesJson,
		acctNbr:_acctNbr,
		uimType:_uimType,
		recordId:_recordId,
		preBefore:_preBefore,
		oneCardFiveNum : _oneCardFiveNum,
		oneCardFiveNO  : _oneCardFiveNO
	};
})();