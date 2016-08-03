CommonUtils.regNamespace("CONST");

//页面常量
CONST = (function(){
	// LTE : 0, MVNO : 1, 其他: -1
	var _APP_DESC = -1; //-1时需要调用后台加载
	
	//裸机销售虚拟客户ID
	var _CUST_COUPON_SALE = "10000";
	
	var _OFFER_FAST_FILL =  "20020054";
	
	//4g标识
	var _OL_TYPE_CD = {
		FOUR_G : 11,
		APP : 15, // app 标示
		LTE : 10,
		UI_LTE : 8,
		ZDYY : 14
	};
	
	//附属销售品标签分类
	var _LABEL = {
		FLOW : "100",
		SERV : "10000"
	};
	
	//产品规格
	var _PROD_SPEC = {
		CDMA : 235010000, // test-235010000 dev-379
		DATA_CARD : 280000000,
		PROD_FUN_4G : "280000020"
	};
	
	//功能产品规格ID
	var _PROD_SPEC_ID={
		MIFI_ID:"235010076", //MIFI 功能产品ID	
		WIRE_GLOBAL : "13409441"
	};
	
	//产品属性
	var _PROD_ATTR = {
		FEE_TYPE : "10020030",
		IS_XINKONG : "40010030", //是否信控
		PROD_USER : "800000011" //使用人
	};
	
	//产品属性值
	var _PROD_ATTR_VALUE = {
		IS_XINKONG_YES : "20",//是否信控 是
		IS_XINKONG_NO : "10" //是否信控 否
	};
	
	//账户属性
	var _ACCT_ATTR = {
			CREDIT_LIMIT : "30010040", //信用额度
			PROTOCOL_NBR : "30020008"//协议号
	};
	
	var _ACCT_ITEM_TYPE = {
		UIM_CHARGE_ITEM_CD:"2014000"
	} ;
	
	var _PROD_CLASS = {
		THREE : 3,
		FOUR : 4
	};
	
	//关联关系原因
	var _RELA_TYPE_CD = {
		MUST : "1000",  //归属关系
		SELECT : "1001", //优惠构成关系
		ZDYY : "100004" //终端预约退订
	};
	
	//销售品退订时产品处理方式
	var _UNSS_PROCESS_MODE = {
		CLOSE : "1000",
		KIP : "1001",
		CHOOSE : "1002"
	};
	
	//产品状态
	var _PROD_STATUS_CD = {
		REMOVE_PROD : 110000,//TODO 拆机，需要找CRM确定拆机产品状态的主数据
		NORMAL_PROD : 100000, //在用
		STOP_PROD : 120000, //停机
		READY_PROD : 140001, //预开通
		DONE_PROD : 140002, //未激活
		NEW_PROD : 130000 //未竣工
	};
	
	//付费类型
	var _PAY_TYPE = { 
		AFTER_PAY : 1200,  //后付费 -后付费用户
		BEFORE_PAY : 2100,  //预付费-预付费用户
		NOLIMIT_PAY : 3100,  //预后不限  -后付费用户，预付费用户
		BEFORE_AFTER_PAY: 2101, //可预可后，默认预付 -后付费用户，预付费用户
		BEFORE_AFTER_QUASIREALTIME_PAY: 3103, //预付+后附+准实时预付费 -后付费用户，准实时预付费用户,预付费用户
		QUASIREALTIME_AFTER_PAY : 3102, //实时预付费+后附 -后付费用户，准实时预付费用户
		AFTER_BEFORE_PAY : 1202, //可预可后，默认后附 -后付费用户，预付费用户
		QUASIREALTIME_BEFORE_PAY: 3101, //预付+准实时预付费 -准实时预付费用户，预付费用户
		QUASIREALTIME_PAY : 1201 //准实时预付费 -准实时预付费用户
	};
	
	//业务动作大类
	var _ACTION_CLASS_CD = {
		CUST_ACTION : 1000,//客户动作
		ACCT_ACTION : 1100,//帐户动作
		OFFER_ACTION : 1200,//销售品动作
		PROD_ACTION : 1300,//产品及服务动作
		MKTRES_ACTION : 1600//产品及服务动作
	};
	
	var _OBJ_TYPE = {
		PROD : 2, //接入类产品
		FUN_PROD : 4, //功能类产品	
		SERV : 4, //功能类产品	
		OFFER : 7 //销售品	
	};
	
	//业务动作小类
	var _BO_ACTION_TYPE = {
		BUY_OFFER : "S1",//订购销售品
		DEL_OFFER : "S2",//退订销售品
		ADDOREXIT_COMP:"S3", //销售品成员变更
		UPDATE_OFFER : "S3",//变更销售品参数
		CUST_CREATE:"C1",//新建客户
		CUSTINFOMODIFY:"C2",//修改客户信息
		ACCT_CREATE : "A1",//帐户创建
		ACCTINFOMODIFY : "A2",//帐户修改
		NEW_PROD : "1",//新装
		UPDATE_ACCNBR : "2",//改号
		REMOVE_PROD : "3",//拆机和预拆机
		PREMOVE_PROD :"4020200000",//预拆机
		SERV_OPEN : "7", //服务开通
		PREMOVE_BACK_PROD :"4070100003",//预拆机复机
		BREAK_RULE_REMOVE_PROD : "4020300002",//TODO 违章拆机 跟CRM确定
		OWE_REMOVE_PROD:"66",//欠费拆机跟crm确定
		NOACTIVE_REMOVE_PROD:"4020400000",//未激活拆机
		DIFF_AREA_CHANGE_CARD:"4040600001",//异地补换卡
		CHANGE_CARD:"14",//补换卡
		LOSSREP_PROD :"1171",//挂失
		DISLOSSREP_PROD :"1172",//解挂
		STOPKEEPNUM:"19",//停机保号
		DISSTOPKEEPNUM:"20",//停机保号复机
		PRODUCT_PASSWORD:"18",//改产品密码
		PRODUCT_PASSWORD_RESET:"4040800003",//产品密码重置（4G目前不区分产品密码修改和重置，该编码目前不使用）
		PRODUCT_PARMS:"1179",//改产品属性，改短号
		PRODUCT_INFOS:"4040100000",//改产品信息（如：改使用人）
		TRANSFER :"11",//过户
		ACTIVERETURN :"1020500000",//产品返档(活卡销售返档)
		TRANSFERRETURN:"4041700000",//产品返档(过户)
		ACTIVERETURNTWO :"4070400000",//产品返档(返档复机)1020500000
		CHANGE_ACCOUNT : "-6",
		ADD_COMP : "998", //加入组合
	    REMOVE_COMP : "999",//退出组合
	    COUPON_SALE : "3010200000", //实物销售
	    RETURN_COUPON : "3030300000", //终端退货
	    EXCHANGE_COUPON : "4040800002", //终端换货
	    CHANGE_FEE_TYPE:"1244", //变更付费类型
	    BUY_BACK:"5010100002", //新装返销
	    BUY_BACK_CHANGE_CARD:"7040100001", //补换卡返销
	    BUY_BACK_ORDER_CONTRACT:"3030200000", //订购合约返销
	    TERMINAL_RESERVATION:"3010300000" ,//终端预约
	    RETURN_TERMINAL : "3030400000", //终端预约取消
	    URGENT_BOOT : "4070500000", // 紧急开机
	    TEMPORARY_CREDIT:"4110300000",//临时授信
	    ACCT_INFO_MODIFY:"2020400000"	//账户修改(改客户资料返档)
	};
	
	//业务动作小类对应的名称
	var _BO_ACTION_TYPE_MAP = {
		"S1" : "订购",
		"1" : "新装",
		"3" : "拆机",
		"4020300002" : "违章拆机",
		"66" : "欠费拆机",
		"4020400000":"未激活拆机",
		"1171":"挂失",
		"1172":"解挂",
		"19":"停机保号",
		"20":"停机保号复机",
		"18":"产品密码修改",
		"4040800003":"产品密码重置",//4G目前不区分产品密码修改和重置，该编码目前不使用
		"C1":"新建客户",
		"C2":"修改客户信息",
		"1179":"修改产品属性",//改短号
		"S3":"主副卡成员变更",
		"11":"过户",
		"1020500000" :"改客户资料返档",
		"4041700000" :"过户返档",
		"-6":"改帐务定制关系",
		"A2":"修改帐户信息",
		"4020200000":"预拆机",
		"4070100003":"预拆机复机",
		"5010100002":"新装返销",
		"2":"改号",
		"7040100001":"补换卡返销",
		"3030200000":"订购合约返销",
		"4070500000":"紧急开机"
	};
	
	//客户交互事件
	var _EVENT = {
		OFFER_BUY : "订购销售品",
		OFFER_DEL : "退订销售品",
		OFFER_UPDATE : "变更销售品 ",
		PROD_NEW : "新装",
		PROD_UPDATE : "变更功能产品",
		PROD_OPEN : "开通功能产品",
		PROD_CLOSE : "关闭功能产品"
	};

	//订单属性
	var _BUSI_ORDER_ATTR = {
		REMOVE_REASON : "111111122",//拆机原因
		DEALER : "111111116",//发展人staffId
		DEALER_NAME : "111111120",//发展人名称
		DEALER_CODE : "111111125",//发展人工号
		REMARK : "111111118",
		orderAttrName :"30010020",//经办人姓名
		orderAttrPhoneNbr :"30010025",//经办人联系号码
		orderIdentidiesTypeCd :"30010026",//经办人证件类型
		orderAttrIdCard :"30010021",//证件号码
		orderAttrAddr :"30010022" ,//经办人证件地址
		EXT_CUST_ID : "20900011", //省内客户实例ID保存在订单属性中的规格ID
		COR_CUST_ID : "30010027", //集团外部客户实例ID保存在订单属性中的规格ID
		EXT_PROD_INST_ID : "30010045", //省内产品实例ID
		COR_PROD_INST_ID : "30010044", //外部产品实例ID
		EXT_COUPON_INST_ID	: "30010047", //营销资源省内实例ID
		COR_COUPON_INST_ID : "30010046", //营销资源外部实例ID
		PROV_ISALE : "40010029",	 //省份isale流水号
		THRETOFOUR_ITEM : "111111199",   //3转4标志
		BUSITYPE_FLAG : "30010024", //购物车业务动作类型
		ZCD_ITEM : "111111198",//是否是暂存单
		SO_NBR : "111111196", //购物车受理流水
		STEP_ORDER_CHARGE_STAFF : "111111197" ,//暂存单收费员工--分段受理
		DELIVERY_TYPE : "800000013" ,//预约类型
		DELIVERY_METHOD : "800000014" ,//提货方式
		DELIVERY_TIME : "800000015" ,//提货时间
		DELIVERY_ADDRESS : "800000016" ,//提货地址
		DELIVERY_POLICY : "800000018", //预约政策
		itemSpecID : "800000036", //客户等级属性标识ID
		CHANGE_CARD_ORDER_TYPE : "800000065", //异地补换卡订单类型
		CHANGE_CARD_AREA_ID : "800000067" //异地补换卡漫游省地区id
	};
	
	//属性规格
	var _ITEM_SPEC = {
		FEE_TYPE : "10020030",	 //付费方式
		PROT_NUMBER : "11251741"          //协议编码
	};
	
	var _getBoActionTypeName = function(boActionTypeCd) {
		return _BO_ACTION_TYPE_MAP[boActionTypeCd];
	};
	
	//销售品角色类型
	var _MEMBER_ROLE_CD = {
		COMMON_MEMBER : 1,//普通成员
		MAIN_CARD : 400, //天翼主卡
		VICE_CARD : 401, //天翼副卡
		BROADBAND_MAIN_CARD : 500, //基础无线宽带
		BROADBAND_VICE_CARD : 501, //加装无线宽带
		CONTENT : 99991  //内容产品
	};
	//销售品角色类型
	var _MEMBER_ROLE_LIST = [
	    {
	    	MEMBER_ROLE_CD : 1,
	    	MEMBER_ROLE_NAME : "普通成员"
	    },{
	    	MEMBER_ROLE_CD : 400,
	    	MEMBER_ROLE_NAME : "天翼主卡"
	    },{	    	
	    	MEMBER_ROLE_CD : 401,
	    	MEMBER_ROLE_NAME : "天翼副卡"
	    },{	    	
	    	MEMBER_ROLE_CD : 500,
	    	MEMBER_ROLE_NAME : "天翼宽带主卡"
	    },{	    	
	    	MEMBER_ROLE_CD : 501,
	    	MEMBER_ROLE_NAME : "天翼宽带副卡"
	    },{	    
	    	MEMBER_ROLE_CD : 600,
	    	MEMBER_ROLE_NAME : "基础套餐级可选包"
	    },{	    	
	    	MEMBER_ROLE_CD : 601,
	    	MEMBER_ROLE_NAME : "加装套餐级可选包"
	    },{	   
	    	MEMBER_ROLE_CD : 99991,
	    	MEMBER_ROLE_NAME : "内容产品"
	}];
	
	//结果码
	var _CODE = {
		SUCC_CODE : "POR-0000",
		FAIL_CODE : "POR-2004"
	};
	
	//订单提交时，订单部分属性ID 配置成常量，如 订单备注
	var _ITEM_SPEC_ID_CODE = {
		busiOrderAttrs:111111122
	};
	
	//模板类型
	var _TEMPLATE_TYPE = {
		NEW_PROD : 1,
		ATTACH_OFFER_CHANGE : 2,
		OFFER_CHANGE : 5,
		NEW_PROD : 1,
		NEW_PROD : 1
	};
	
	var _CHARGE_ITEM_CD = {
		COUPON_SALE : "2007000", //2007000  实物销售费用项类型
		COUPON_RESERVATION_SALE : "2007002" //2007002  终端预约费用项类型
	};
	
	var _MKTRES_STATUS = {
		USABLE : "1001",
	    HAVESALE:"1115"   //已销售未补贴
	};
	
	var _TERMINAL_SPEC_ATTR_ID = {
		BRAND : 60010002,
		PHONE_TYPE : 60010003,
		COLOR: 60010004,
		TERMINAL_TYPE: 60010013,
		SUPPORT4G: 60010023,
		SUPPORT4NFC: 60010024
	};
	
	var _PAYMETHOD_CD = {
		XIAN_JIN : 100000,
		YIN_HANG : 110000,
		POS : 110100,
		WANG_YIN : 110200,
		TUO_SHOU : 110300,
		ZHI_PIAO : 110400,
		FEN_QI_FU_KUAN : 110500,
		YIN_HANG_DAI_KOU : 110600,
		DI_SAN_FANG_ZHI_FU_PING_TAI : 120000,
		YI_ZHI_FU : 120100,
		ZHI_FU_BAO : 120200,
		TAO_BAO_XIN_YONG_KA : 120201,
		CAI_FU_TONG : 120300,
		QU_DAO_DAI_SHOU : 130000,
		JI_TUAN_DAI_SHOU : 130100,
		ZHENG_QI_DAI_SHOU : 130200,
		ZHANG_WU_DAI_SHOU : 140000,
		HUA_FEI_YU_E : 140100,
		DI_KOU_LEI : 150000,
		DIAN_XIN_KA_DI_KOU : 150100,
		JI_FEN_DI_KOU : 150200,
		TAO_BAO_JI_FEN_DI_KOU : 150201,
		DAI_JIN_QUAN_DI_KOU : 150300,
		HUO_DAO_FU_KUAN : 160000,
		XIAN_JIN_DAO_FU : 160100,
		POS_DAO_FU : 160200
	};
	
	var _DEL_ORDER_FLAG = {
		SILENT_OLID : "silentOlId"
	};
	
	var _getAppDesc = function(){
		if(CONST.APP_DESC== -1 ){
			_setAppDesc();
			return CONST.APP_DESC;
		}else{
			return CONST.APP_DESC;
		}
	};
	
	var _setAppDesc = function(){
		CONST.APP_DESC = globalAppDesc;
	};
	
	var _LTE_PHONE_HEAD = /^(180|189|133|134|153|181|108|170|173|177)\d{8}$/;
	
	var _MVNO_PHONE_HEAD = /^(170)\d{8}$/;
	
	var  _RELATYPECD = "100003";
		 
	var _YZFservSpecId = 381000960; //翼支付助手产品ID
	
	var _YZFitemSpecId1 = 10020034; //翼支付助手阀值级别属性编码
	var _YZFitemSpecId2 = 10020035; //翼支付助手单次充值额度属性编码
	var _YZFitemSpecId3 = 10020036; //翼支付助手是否需要代扣确认属性编码
	var _YZFitemSpecId4 = 10020087; //翼支付助手翼支付托收
	
	//渠道大类
	var _CHANNEL_TYPE_CD ={
			ZQZXDL : 100100,		//政企直销经理
			GZZXDL : 100300,		//公众直销经理
			HYKHZXDL : 100101,		//行业客户直销经理
			SYKHZXDL : 100102,		//商业客户直销经理
			XYKHZXDL:100103,		//校园客户直销经理
			GZZXJL:100301,		//公众直销经理
			ZYOUT:110100,		//自有厅
			ZYINGT:110101,		//直营厅
			WBT:110102		//外包厅
	};
	
	//群产品规格
	var _GROUP_PROD_SPEC = ["381001824","13409900"];
	
	//群功能产品规格ID	旺铺助手（网络版）-235010013	
	var _GROUP_SERV_SPEC_ID=["235010013","381001823"];
	
	//群功能产品对应的群产品
	var _GROUP_SERV_TO_PROD_MAP={
		"235010013" : "10020047",
		"381001823" : "10020047"
	};
	
	//根据群功能产品规格获取群产品规格
	var _getGroupServProdMap = function(servId,itemSpecId) {
		if(_GROUP_SERV_TO_PROD_MAP[servId]==itemSpecId){
			return _GROUP_SERV_TO_PROD_MAP[servId];
		}else{
			return "";
		}
	};
	

	//UIM卡类型
	var _UIMTYPE3G4G = {
		IS4G: "1",
		IS3G: "0"
	};
	
	var _BATCHORDER_FLAG = {
			BATCHORDER_QRY_FLAG : "N",
			BATCHORDER_AUTH_FLAG : "N"
			
	};
	var _MENU_CUSTFANDANG="GKHZLFD";//改客户资料返档
	var _MENU_FANDANG="GHFD";//过户返档
	var _MENU_RETURNFILE="FD";//返挡
	

	/**
	 * "用户预装"常量定义
	 * @type {string}
	 * @private
	 */
	var _USER_PRE_INSTALLED = "preInstall";
	return {
		//批量受理查询，是否执行改造后的新代码的开关标识，用于暂时记录是否执行新代码。Y执行改造后的新代码，N执行改造前的旧代码，默认为N。 By ZhangYu 2015-10-20
		BATCHORDER_FLAG : _BATCHORDER_FLAG,
		
		APP_DESC			: _APP_DESC,
		OFFER_FAST_FILL    :  _OFFER_FAST_FILL,
		setAppDesc			: _setAppDesc,
		BO_ACTION_TYPE 		: _BO_ACTION_TYPE,
		ACTION_CLASS_CD 	: _ACTION_CLASS_CD,
		PROD_STATUS_CD 		: _PROD_STATUS_CD,
		BUSI_ORDER_ATTR 	: _BUSI_ORDER_ATTR,
		MEMBER_ROLE_CD 		: _MEMBER_ROLE_CD,
		MEMBER_ROLE_LIST    : _MEMBER_ROLE_LIST,
		PROD_SPEC			: _PROD_SPEC,
		PROD_ATTR			: _PROD_ATTR,
		ACCT_ATTR      : _ACCT_ATTR,
		getBoActionTypeName : _getBoActionTypeName,
		PAY_TYPE			: _PAY_TYPE,
		CODE 				: _CODE,
		OL_TYPE_CD			: _OL_TYPE_CD,
		LABEL				: _LABEL,
		PROD_CLASS			: _PROD_CLASS,
		ITEM_SPEC_ID_CODE	: _ITEM_SPEC_ID_CODE,
		EVENT				: _EVENT,
		TEMPLATE_TYPE 		: _TEMPLATE_TYPE,
		CUST_COUPON_SALE	: _CUST_COUPON_SALE,
		CHARGE_ITEM_CD		: _CHARGE_ITEM_CD,
		MKTRES_STATUS		: _MKTRES_STATUS,
		ITEM_SPEC			: _ITEM_SPEC,
		OBJ_TYPE 			: _OBJ_TYPE,
		ACCT_ITEM_TYPE		: _ACCT_ITEM_TYPE,
		getAppDesc			: _getAppDesc,
		RELA_TYPE_CD		: _RELA_TYPE_CD,
		UNSS_PROCESS_MODE	: _UNSS_PROCESS_MODE,
		TERMINAL_SPEC_ATTR_ID : _TERMINAL_SPEC_ATTR_ID,
		PAYMETHOD_CD		: _PAYMETHOD_CD,
		DEL_ORDER_FLAG		: _DEL_ORDER_FLAG,
		PROD_SPEC_ID        : _PROD_SPEC_ID,
		LTE_PHONE_HEAD : _LTE_PHONE_HEAD,
		MVNO_PHONE_HEAD : _MVNO_PHONE_HEAD,
		RELATYPECD : _RELATYPECD,
		YZFservSpecId : _YZFservSpecId,
		YZFitemSpecId1 : _YZFitemSpecId1,
		YZFitemSpecId2 : _YZFitemSpecId2,
		YZFitemSpecId3 : _YZFitemSpecId3,
		CHANNEL_TYPE_CD : _CHANNEL_TYPE_CD,
		GROUP_SERV_SPEC_ID:_GROUP_SERV_SPEC_ID,
		GROUP_PROD_SPEC:_GROUP_PROD_SPEC,
		getGroupServProdMap:_getGroupServProdMap,
		CHANNEL_TYPE_CD : _CHANNEL_TYPE_CD,
		UIMTYPE3G4G:_UIMTYPE3G4G,
		PROD_ATTR_VALUE : _PROD_ATTR_VALUE,
		MENU_FANDANG : _MENU_FANDANG,
		MENU_CUSTFANDANG:_MENU_CUSTFANDANG,
		MENU_RETURNFILE : _MENU_RETURNFILE,
		YZFitemSpecId4 : _YZFitemSpecId4,
		USER_PRE_INSTALLED:_USER_PRE_INSTALLED
	};
})();

//初始化
$(function(){
	CONST.getAppDesc();

	var response = $.callServiceAsJson(contextPath + "/properties/getValue", {"key": "LTEPHONEHEAD"});
	if (response.code == "0") {
		var reg = new RegExp(response.data);
		if (ec.util.isObj(reg)) {
			CONST.LTE_PHONE_HEAD = reg;
		}
	}

});