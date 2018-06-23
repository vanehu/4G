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
	    RETURN_TERMINAL : "3030400000" //终端预约取消
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
		"3030200000":"订购合约返销"
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
		itemSpecID : "800000036" //客户等级属性标识ID
		
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
	
	var _LTE_PHONE_HEAD = /^(180|189|133|134|153|181|108|170|177)\d{8}$/;
	
	var _MVNO_PHONE_HEAD = /^(170)\d{8}$/;
	
	var  _RELATYPECD = "100003";
		 
	var _YZFservSpecId = 381000960; //翼支付助手产品ID
	
	var _YZFitemSpecId1 = 10020034; //翼支付助手阀值级别属性编码
	var _YZFitemSpecId2 = 10020035; //翼支付助手单次充值额度属性编码
	var _YZFitemSpecId3 = 10020036; //翼支付助手是否需要代扣确认属性编码
	
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
		PROD_ATTR_VALUE : _PROD_ATTR_VALUE
	};
})();

//初始化
$(function(){
	CONST.getAppDesc();
});
/**
 * app 业务统一入口
 * 
 */
CommonUtils.regNamespace("common");
common = (function($) {
	
	var _callOrderServer=function(staffInfos,custInfos,prodIdInfos,url){
		var staffInfosParams=JSON.stringify(staffInfos);//登录信息
		var custInfosParams=JSON.stringify(custInfos);//客户定位信息
		var prodIdInfosParams=JSON.stringify(prodIdInfos);//选中产品信息
		var urlParams=$.parseJSON(JSON.stringify(url));//地址
		OrderInfo.actionFlag=urlParams.actionFlag;
		if(ec.util.isObj(prodIdInfos)){
			order.prodModify.choosedProdInfo=$.parseJSON(prodIdInfosParams);
		}
		if(ec.util.isObj(staffInfos)){
			OrderInfo.staff=$.parseJSON(staffInfosParams);
		}
		if(ec.util.isObj(custInfos)){
			OrderInfo.cust=$.parseJSON(custInfosParams);
		}
		var param={
			"staffInfos":staffInfosParams,
			"custInfos":custInfosParams,
			"prodIdInfos":prodIdInfosParams
		};
		var method=urlParams.method;// /app/prodModify/custAuth
		$.callServiceAsHtml(contextPath+method,param,{
			"before":function(){
				$.ecOverlay("正在努力加载中，请稍等...");
			},
			"done" : function(response){
				$.unecOverlay();
				$("#load").hide();
				var pp =$("#content").html(response.data);
				$.refresh(pp);
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			}
		});
	};
	
	//客户定位后，回传客户信息
	var _callCustInfo = function(custInfos){
		var custInfosParams=JSON.stringify(custInfos);//客户定位信息
		if(ec.util.isObj(custInfos)){
			OrderInfo.cust=$.parseJSON(custInfosParams);
		}
	};
	
	//调用客户端的身份证识别方法       method：表示回调js方法 如：order.prodModify.getIDCardInfos
	var _callIDCardRec=function(method){
		var arr=new Array(1);
		arr[0]=method;
		MyPlugin.getIDCardInfos(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	
	//调用客户端的拍照方法       method：表示回调js方法 如：order.prodModify.getIDCardInfos
	var _callPhotos=function(method){
		var arr=new Array(1);
		arr[0]=method;
		MyPlugin.takePhotos(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	
	//调用客户端的二代证识别方法       method：表示回调js方法 如：order.prodModify.getIDCardInfos
	var _callGenerationRec=function(method){
		var arr=new Array(1);
		arr[0]=method;
		MyPlugin.getGenerationInfos(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	
	var _saveCust = function(){
		var arr=new Array(1);
		arr[0]=JSON.stringify(OrderInfo.cust);
		MyPlugin.showCust(arr,
	            function(result) {
        },
        function(error) {
        }
        );
	};
	
	
	//调用客户端的关闭webview方法
	var _callCloseWebview=function(){
		if($("#alert-modal").length>0){
			$("#alert-modal").hide();
		}
		var arr=new Array(1);
		arr[0]="";
		MyPlugin.closeWebview(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	
	//调用客户端的类似重定位去除客户缓存方法
	var _relocationCust=function(){
		if($("#alert-modal").length>0){
			$("#alert-modal").hide();
		}
		var arr=new Array(1);
		arr[0]="";
		MyPlugin.relocationCust(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	
	
	//调用客户端的数字签名板
	var _callDatasign=function(method){
		var arr=new Array(1);
		arr[0]=method;
		MyPlugin.datasign(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	
	//调用客户端的扫描
	var _callScanning=function(method,prodId){
		var arr=new Array(1);
		arr[0]=method;
		arr[1]=prodId;
		MyPlugin.scanning(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	
	//调用客户端的日历
	var _callcalendar=function(time,format,method,textId){
		var arr=new Array(1);
		arr[0]=time;
		arr[1]=format;
		arr[2]=method;
		arr[3]=textId;
		MyPlugin.calendar(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	//时间框赋值
	var _setCalendar = function(time,textId){
		$("#"+textId).val(time);
	};
	
	//客户端调用此方法返回到上一页 1 为prepare页面  2为order-content（填单）页面 3为order-confirm（订单确认和收银台）页面 4为order-print（打印）页面
	var _callReturnBack=function(){
		$.unecOverlay();//网络出现故障或手机出现故障时按返回关闭“加载中”提示框
		if(OrderInfo.actionFlag==4||OrderInfo.actionFlag==8){//客户新增和修改
			_callCloseWebview();
			return;
		}
		if(OrderInfo.actionFlag==40){
			cart.main.cartBack();
			return;
		}
		if(OrderInfo.actionFlag==140){
			order.calcharge.back();
			return;
		}
		if(OrderInfo.actionFlag==150){
			mktRes.terminal.back();
			return;
		}
		if(OrderInfo.returnFlag==2){
			order.phoneNumber.back(); 
			return;
		}
		if(OrderInfo.order.step==1){
			_callCloseWebview();
		}else if(OrderInfo.order.step==2){
			if(OrderInfo.actionFlag==3||OrderInfo.actionFlag==9){
				_callCloseWebview();
				return;
			}
			order.main.lastStep(function(){
				$("#order_prepare").show();
				if(OrderInfo.actionFlag != 13 || OrderInfo.actionFlag != 14){
					$("#pakeage").show();
				}
				if(OrderInfo.actionFlag == 13 || OrderInfo.actionFlag == 14){
					$("#phone").show();
					$("#pakeage").hide();
					$("#number").hide();
				}
				$("#order").hide();	
				if(OrderInfo.actionFlag==1){//新装的头部 要发生变化
						_callTitle(2);//2 头部为已定位客户
					}
				if(OrderInfo.actionFlag == 13 || OrderInfo.actionFlag == 14){
					_callTitle(2);//2 头部为已定位客户
				}
					OrderInfo.order.step=1;
			});
		}else if(OrderInfo.order.step==3){
			//可选包变更订单页面返回 释放UIM卡
			if(OrderInfo.actionFlag == 3){
				var boProd2Tds = OrderInfo.boProd2Tds;
				//取消订单时，释放被预占的UIM卡
				if(boProd2Tds.length>0){
					for(var n=0;n<boProd2Tds.length;n++){
						var param = {
								numType : 2,
								numValue : boProd2Tds[n].terminalCode
						};
						$.callServiceAsJson(contextPath+"/app/mktRes/phonenumber/releaseErrorNum", param, {
							"done" : function(){}
						});
					}
				}
				_callCloseWebview();
				return;
			}
			SoOrder.orderBack();
			$("#order-content").show();
			$("#order-confirm").hide();
			$("#order-dealer").hide();
			OrderInfo.order.step=2;
		}else if(OrderInfo.order.step==4){
			$("#order-confirm").show();
			$("#order-print").hide();
			OrderInfo.order.step=3;
		}else {
			_callCloseWebview();
		}
	};
	//调用客户端 改变头部的状态
	var _callTitle=function(str){
		var arr=new Array(1);
		arr[0]=str;
		MyPlugin.changeTitle(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	//调用客户端 通知会话已经失效了
	var _callSessionNotViald=function(){
		var arr=new Array(1);
		MyPlugin.sessionValid(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	
	return {
		relocationCust		:	_relocationCust,
		setCalendar			:	_setCalendar,
		callcalendar		:	_callcalendar,
		callCloseWebview	:	_callCloseWebview,
		callCustInfo		:	_callCustInfo,
		callDatasign		:	_callDatasign,
		callGenerationRec	:	_callGenerationRec,
		callIDCardRec		:	_callIDCardRec,
		callOrderServer		:	_callOrderServer,
		callPhotos			:	_callPhotos,
		callReturnBack		: 	_callReturnBack,
		callScanning		:	_callScanning,
		callSessionNotViald	:	_callSessionNotViald,
		callTitle			:	_callTitle,
		saveCust			:	_saveCust
	};
})(jQuery);

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
	var _choosedProdInfo = {};
	var _ischooseOffer=false;
	//选中套餐返回
	var _chooseOfferForMember=function(specId,subpage,specName,offerRoleId){
		OrderInfo.newofferSpecName = specName;
		$("#"+subpage).show();
		$("#"+subpage).html("&nbsp;&nbsp;<span style='color: #327501;'>订购新套餐：</span>"+specName);
		$("#li_"+subpage).attr("addSpecId",specId).attr("addRoleId",offerRoleId).attr("del","N").attr("addSpecName",specName);
		_ischooseOffer=true;
		if(document.getElementById("li_"+subpage)){
			$("#li_"+subpage).css("text-decoration","").attr("del","N").attr("knew","Y");
			$("#li_"+subpage).find("i:first-child").find("a").text("拆副卡");
		}
		
	};
	
	return {
		choosedProdInfo				:		_choosedProdInfo,
		chooseOfferForMember        :      _chooseOfferForMember
	};	
})();

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
	
	//定义执行状态
	var state="";
	
	var _busitypeflag = 0;
	
	var _orderlonger = "";
	
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
					olTypeCd : CONST.OL_TYPE_CD.UI_LTE  //UI能力开放
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
				/*var $tr = $("tr[name='tr_"+prodId+"_"+prodServ.servSpecId+"']");
				if($tr!=undefined&&$tr.length>0){
					if(!ec.util.isArray(busiOrder.data.busiOrderAttrs)){
						busiOrder.data.busiOrderAttrs = [];
					}
					$tr.each(function(){   //遍历产品有几个发展人
						var dealer = {
							itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
							role : $(this).find("select").val(),
							value : $(this).find("input").attr("staffid") 
						};
						busiOrder.data.busiOrderAttrs.push(dealer);
					});
				}*/
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
		channelList:_channelList
	};
})();
/**
 * 受理订单对象
 * 
 * @author wukf
 */
CommonUtils.regNamespace("SoOrder");

/** 受理订单对象*/
SoOrder = (function() {
	
	//订单准备
	var _builder = function() {
		if(query.offer.loadInst()){  //加载实例到缓存
			SoOrder.initFillPage();
			return true;
		}else{
			return false;
		};
	};
	//主副卡订单确认信息
	var _viceParam="";
	//初始化填单页面，为规则校验类型业务使用
	var _initFillPage = function(){
		SoOrder.initOrderData();
		OrderInfo.order.step=2;
		if(OrderInfo.actionFlag==1){
			try{
				common.callTitle(3);//3 头部为 新装 字眼头部
			}catch(e){
			}
		}
//		SoOrder.step(1); //显示填单界面
		_getToken(); //获取页面步骤
	}; 
	
	//初始化订单数据
	var _initOrderData = function(){
		OrderInfo.resetSeq(); //重置序列
		OrderInfo.resetData(); //重置 数据
		OrderInfo.orderResult = {}; //清空购物车
		OrderInfo.getOrderData(); //获取订单提交节点	
		OrderInfo.orderData.orderList.orderListInfo.partyId = OrderInfo.cust.custId;
		OrderInfo.orderData.orderList.orderListInfo.actionFlag = OrderInfo.actionFlag;
		OrderInfo.orderData.orderList.orderListInfo.areaId = OrderInfo.getAreaId();
	};
	
	//提交订单节点
	var _submitOrder = function(data) {
		if(_getOrderInfo(data)){
			//订单提交
			var url = contextPath+"/order/orderSubmit";
			if(OrderInfo.order.token!=""){
				url = contextPath+"/token/app/order/orderSubmit?token="+OrderInfo.order.token;
			}
			
			$.callServiceAsJson(url,JSON.stringify(OrderInfo.orderData), {
				"before":function(){
					$.ecOverlay("<strong>订单提交中，请稍等...</strong>");
				},"done" : function(response){
					$.unecOverlay();
					_getToken();
					if (response.code == 0) {
						var data = response.data;
						if(OrderInfo.actionFlag==8 || OrderInfo.actionFlag==4){
							if(data.resultCode==0){
								if(OrderInfo.actionFlag==8){
									$.alert("信息提示","客户创建成功");
									common.saveCust();
								}else{
									$.alert("信息提示","客户修改成功");
								}
								//cust.clearCustForm();
							}else{
								$.alert("信息提示",data.resultMsg);
							}
						}else{
							if(data.result.ruleInfos!=undefined && data.result.ruleInfos.length > 0){
								var ruleDesc = "";
								$.each(data.result.ruleInfos, function(){
									ruleDesc += this.ruleDesc+"<br/>";
								});
								$.alert("提示",ruleDesc);
								OrderInfo.orderData.orderList.custOrderList[0].busiOrder = [];
								OrderInfo.resetSeq(); //重置序列
							}else if(data.checkRule!=undefined){
								var provCheckResult = order.calcharge.tochargeSubmit(response.data);
								if(provCheckResult.code==0){
									
									///token/app/order/
									var returnData = _gotosubmitOrder(response.data);
									_orderConfirm(returnData);
								}else{//下省校验失败也将转至订单确认页面，展示错误信息，只提供返回按钮
									response.data.provCheckError = "Y";
									if(provCheckResult.data.resultMsg!=undefined && $.trim(provCheckResult.data.resultMsg)!=""){
										response.data.provCheckErrorMsg = provCheckResult.data.resultMsg;
									} else if(provCheckResult.data.errMsg!=undefined && $.trim(provCheckResult.data.errMsg)!=""){
										response.data.provCheckErrorMsg = provCheckResult.data.errMsg;
										if(provCheckResult.data.errCode){
											response.data.provCheckErrorMsg = "【错误编码："+provCheckResult.data.errCode+"】" + response.data.provCheckErrorMsg;
										}
										if(provCheckResult.data.errData){
											response.data.provCheckErrorData=provCheckResult.data.errData;
											try{
												var errData=$.parseJSON(provCheckResult.data.errData);
												if(errData.resultMsg){
													response.data.provCheckErrorMsg+=","+errData.resultMsg;
												}
											}catch(e){
												
											}
										}
										if(provCheckResult.data.paramMap){
											response.data.provCheckErrorMsg += "【入参："+provCheckResult.data.paramMap+"】";
										}
									} else{
										response.data.provCheckErrorMsg = "未返回错误信息，可能是下省请求超时，请返回填单页面并稍后重试订单提交。";
									}
									var returnData = _gotosubmitOrder(response.data);
									_orderConfirm(returnData);								
								}
							}else{
								var returnData = _gotosubmitOrder(response.data);
								_orderConfirm(returnData);
							}
						}
					}else{
						$.alertM(response.data);
//						_getToken();
						OrderInfo.orderData.orderList.custOrderList[0].busiOrder = [];
						OrderInfo.resetSeq(); //重置序列
						//返回填单页面
						$("#order-content").show();
						$("#order-dealer").hide();
					}
				}
			});
//					var result = query.offer.orderSubmit(JSON.stringify(OrderInfo.orderData));
//					if(result){
//						_orderConfirm(result);
//					}else{
//						_getToken();
//						OrderInfo.orderData.orderList.custOrderList[0].busiOrder = [];
//						OrderInfo.resetSeq(); //重置序列
//					}
		}	
	};
	
	var _gotosubmitOrder = function(orderdata){
			var url = contextPath+"/token/app/order/gotosubmitOrder";
			$.ecOverlay("<strong>订单提交中，请稍等...</strong>");
			var response = $.callServiceAsHtml(url,JSON.stringify(orderdata));
			$.unecOverlay();
			return response.data;
	};
	
	//填充订单信息
	var _getOrderInfo = function(data){
		if(OrderInfo.actionFlag==13 || OrderInfo.actionFlag==17 || OrderInfo.actionFlag==18){ //终端购买、退换货
			//如果是合约机换货，已经加载缓存
			if (OrderInfo.actionFlag==18 && data.boActionType.actionClassCd==CONST.ACTION_CLASS_CD.OFFER_ACTION) {
				
			} else {
				query.offer.loadInst(); //加载实例到缓存
			}
			couponSale(data);
			if(OrderInfo.order.soNbr!=undefined && OrderInfo.order.soNbr != ""){  //缓存流水号
				OrderInfo.orderData.orderList.orderListInfo.soNbr = OrderInfo.order.soNbr;
			}
			return true;
		}
		var busiOrders = [];  //存放订单项数组
		var custOrderAttrs = []; //获取订单属性数组
		var itemValue="N";
		if(_setOfferType()){
			itemValue="Y";
		}
		custOrderAttrs.push({
			itemSpecId : CONST.BUSI_ORDER_ATTR.THRETOFOUR_ITEM,//3转4标志
			value : itemValue
		});
		
//		custOrderAttrs.push({
//			itemSpecId : "111111113",
//			value : OrderInfo.orderlonger
//		});	
		custOrderAttrs.push({
			itemSpecId : "30010024",
			value : OrderInfo.busitypeflag
		});
//		custOrderAttrs.push({
//			itemSpecId : "30010050",
//			value : OrderInfo.custorderlonger
//		});	
		//添加订单属性，isale下省流水号
//		if(order.cust.fromProvFlag == "1"){
//		order.cust.provIsale = $.trim($("#orderProvAttrIsale").val());
//		if(ec.util.isObj(order.cust.provIsale)){
//			order.cust.fromProvFlag = "1";
//			custOrderAttrs.push({
//				itemSpecId : CONST.BUSI_ORDER_ATTR.PROV_ISALE,
//				value : order.cust.provIsale
//			});	
//		} else {
//			order.cust.fromProvFlag = "0";
//		}
//		}
		if(!_checkData()){ //校验通过
			return false;
		}
		//订单备注前置
		var remark = $('#order_remark').val(); 
		if(ec.util.isObj(remark)){
			custOrderAttrs.push({
				itemSpecId : CONST.BUSI_ORDER_ATTR.REMARK,
				value : remark
			});	
		}
		
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14){ //新装
			_createOrder(busiOrders); //新装
		}else if (OrderInfo.actionFlag==2){ //套餐变更
			offerChange.changeOffer(busiOrders);	
		}else if (OrderInfo.actionFlag==3){ //可选包变更		
			_createAttOrder(busiOrders); //附属销售品变更
			if(busiOrders.length==0){
				$.alert("提示","没有做任何业务，无法提交");
				return false;
			}
		}else if (OrderInfo.actionFlag==4){ //客户资料变更
			_createCustOrder(busiOrders,data); //附属销售品变更
		}else if (OrderInfo.actionFlag==5){//销售品成员变更拆副卡
			_delViceCard(busiOrders,data);
		}else if (OrderInfo.actionFlag==6){ //销售品成员变更加装副卡
			_createMainOrder(busiOrders); 
		}else if (OrderInfo.actionFlag==7){ //拆主卡保留副卡
			_delAndNew(busiOrders,data); 
		}else if (OrderInfo.actionFlag==8){ //新建客户单独订单
			OrderInfo.orderData.orderList.orderListInfo.partyId= -1;
			OrderInfo.orderData.orderList.orderListInfo.soNbr = UUID.getDataId();
			/*custOrderAttrs.push({
				itemSpecId : "111111140",//3转4标志
				value : "C1"
			});*/
			_createCustOrderOnly(busiOrders,data);
		}else if (OrderInfo.actionFlag==9){ //活卡销售返档
			_ActiveReturnOrder(busiOrders,data); 
		}else if (OrderInfo.actionFlag==10){ //传到节点busiOrder 
			busiOrders = data;
		}else if (OrderInfo.actionFlag==11){ //撤单,有做特殊处理
			busiOrders = data;
		}else if (OrderInfo.actionFlag==12){ //加入退出组合
			busiOrders = data;
		}else if(OrderInfo.actionFlag==16){ //改号
			_changeNumber(busiOrders);	
		}else if(OrderInfo.actionFlag==19){ //返销
			_fillBusiOrder(busiOrders,data,"N"); //填充业务对象节点	
		}else if(OrderInfo.actionFlag==20){ //返销
			_delAndNew(busiOrders,data); 
		}else if(OrderInfo.actionFlag==21){ //销售品成员变更保留副卡订购新套餐
			_delViceCardAndNew(busiOrders,data);
		}else if(OrderInfo.actionFlag== 22 ){ //补换卡
			busiOrders = data;
		}else if(OrderInfo.actionFlag == 23){//异地补换卡
			busiOrders = data;
			//异地补换卡的订单地区为受理工号当前的受理地区而不是定位客户的受理地区
			OrderInfo.orderData.orderList.orderListInfo.areaId = OrderInfo.staff.areaId;
			//外部客户ID
			var corCustId = $("#custInfos").attr("corCustId");
			if(ec.util.isObj(corCustId)){
				var custOrderAttr1 = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.COR_CUST_ID,
					value : corCustId
				};
				custOrderAttrs.push(custOrderAttr1);
			}
			//省内客户ID
			var extCustId = $("#custInfos").attr("extCustId");
			if(ec.util.isObj(extCustId)){
				var custOrderAttr2 = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.EXT_CUST_ID,
					value : extCustId
				};
				custOrderAttrs.push(custOrderAttr2);
			}
			//省内产品实例ID
			var extProdInstId = order.prodModify.choosedProdInfo.extProdInstId;
			if(ec.util.isObj(extProdInstId)){
				var custOrderAttr3 = {
						itemSpecId : CONST.BUSI_ORDER_ATTR.EXT_PROD_INST_ID,
						value : extProdInstId
				};
				custOrderAttrs.push(custOrderAttr3);
			}
			//外部产品实例ID
			var corProdInstId = order.prodModify.choosedProdInfo.corProdInstId;
			if(ec.util.isObj(corProdInstId)){
				var custOrderAttr4 = {
						itemSpecId : CONST.BUSI_ORDER_ATTR.COR_PROD_INST_ID,
						value : corProdInstId
				};
				custOrderAttrs.push(custOrderAttr4);
			}
			//营销资源省内实例ID
			var extCouponInstanceId = order.prodModify.choosedProdInfo.extCouponInstanceId;
			if(ec.util.isObj(extCouponInstanceId)){
				var custOrderAttr5 = {
						itemSpecId : CONST.BUSI_ORDER_ATTR.EXT_COUPON_INST_ID,
						value : extCouponInstanceId
				};
				custOrderAttrs.push(custOrderAttr5);
			}
			//营销资源外部实例ID
			var corCouponInstanceId = order.prodModify.choosedProdInfo.corCouponInstanceId;
			if(ec.util.isObj(corCouponInstanceId)){
				var custOrderAttr6 = {
						itemSpecId : CONST.BUSI_ORDER_ATTR.COR_COUPON_INST_ID,
						value : corCouponInstanceId
				};
				custOrderAttrs.push(custOrderAttr6);
			}
		}else{  //默认单个业务动作
			_fillBusiOrder(busiOrders,data,"N"); //填充业务对象节点
		}
		OrderInfo.orderData.orderList.orderListInfo.custOrderAttrs = custOrderAttrs; //订单属性数组
		OrderInfo.orderData.orderList.orderListInfo.extCustOrderId = OrderInfo.provinceInfo.provIsale; //省份流水
		OrderInfo.orderData.orderList.custOrderList[0].busiOrder = busiOrders; //订单项数组
		if($("#isTemplateOrder").attr("checked")=="checked"){ //批量订单
			OrderInfo.orderData.orderList.orderListInfo.isTemplateOrder ="Y";
			OrderInfo.orderData.orderList.orderListInfo.templateOrderName =$("#templateOrderName").val();
			if(OrderInfo.actionFlag==1||OrderInfo.actionFlag==14){
				OrderInfo.orderData.orderList.orderListInfo.templateType = $("#templateOrderDiv").find("select").val(); //批量换挡
			}else if(OrderInfo.actionFlag==2){
				OrderInfo.orderData.orderList.orderListInfo.templateType = 5; //批量换挡
			}else if(OrderInfo.actionFlag==3){
				OrderInfo.orderData.orderList.orderListInfo.templateType = 2; //批量可选包订购退订
			}
		}else{
			OrderInfo.orderData.orderList.orderListInfo.isTemplateOrder ="N";
		}
		if(OrderInfo.order.soNbr!=undefined && OrderInfo.order.soNbr != ""){  //缓存流水号
			OrderInfo.orderData.orderList.orderListInfo.soNbr = OrderInfo.order.soNbr;
		}
		//OrderInfo.orderData.orderList.orderListInfo.channelId = "1388753";  //受理渠道id
		return true;
	};
	
	//终端销售
	var couponSale = function(data){
		var coupons = data.coupons;
		OrderInfo.getOrderData(); //获取订单提交节点
		//新建客户、或是老客户、或是虚拟客户
		var busiOrders = OrderInfo.orderData.orderList.custOrderList[0].busiOrder;//获取业务对象数组
		if (OrderInfo.cust.custId == -1) {
			OrderInfo.createCust(busiOrders);
		} else if (OrderInfo.cust.custId != undefined && OrderInfo.cust.custId != "") {
			OrderInfo.orderData.orderList.orderListInfo.partyId = OrderInfo.cust.custId;
		} else {
			OrderInfo.orderData.orderList.orderListInfo.partyId = CONST.CUST_COUPON_SALE;
		}
		if (OrderInfo.actionFlag == 18) {
			OrderInfo.orderData.orderList.orderListInfo.partyId = coupons[0].partyId;
		}
		//填入订单
		var busiOrder = {
			areaId : OrderInfo.getAreaId(),  //受理地区ID		
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : data.busiObj,  
			boActionType : data.boActionType, 
			data:{
				bo2Coupons:[]
			}
		};
		busiOrder.data.bo2Coupons = coupons;
		if (data.dealers) {
			busiOrder.data.busiOrderAttrs = data.dealers;
		}
		busiOrders.push(busiOrder);
	};
	
	//订单确认
	var _orderConfirm = function(data){
		SoOrder.step(2,data);
		//记录olId到cookie，用于取消订单
		SoOrder.delOrderBegin();
		
		if(OrderInfo.actionFlag==1 ||OrderInfo.actionFlag==14){ //新装
			$("#orderTbody").append('<li class="list-group-item" id="offerSpecName"> <h4 class="list-group-item-heading"> 套餐名称</h4><p class="list-group-item-text">'+OrderInfo.offerSpec.offerSpecName+'</p></li>');
			$("#tital").html("<span>订购</span>"+OrderInfo.offerSpec.offerSpecName);
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				$.each(this.prodInsts,function(){
					$("#orderTbody").append('<li class="list-group-item" id="offerSpecName"> <h4 class="list-group-item-heading"> '+this.offerRoleName+'</h4><p class="list-group-item-text">'+OrderInfo.getProdAn(this.prodInstId).accessNumber+'</p></li>');
				});
			});
			
			
			if(order.service.oldMemberFlag){
				for(var j=0;j<OrderInfo.oldoffer.length;j++){
					for ( var i = 0; i < OrderInfo.oldoffer[j].offerMemberInfos.length; i++) {
						var offerMember = OrderInfo.oldoffer[j].offerMemberInfos[i];
						if(offerMember.objType==CONST.OBJ_TYPE.PROD){
							$("#orderTbody").append("<tr ><td>纳入副卡号码：</td><td>"+offerMember.accessNumber+"</td></tr> ");	
						}
					}
				}
			}
		}else if(OrderInfo.actionFlag==13 || OrderInfo.actionFlag==17 || OrderInfo.actionFlag==18){ //裸机销售
			$("#order_prepare").hide();
			$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">终端名称：</div><div class="ui-block-b">'+OrderInfo.businessName+'</div></div>');
			var busiOrder = OrderInfo.orderData.orderList.custOrderList[0].busiOrder;
			var bo2Coupons = undefined;
			if (OrderInfo.actionFlag==13) {
				for(var i=0; i<busiOrder.length; i++) {
					var boActionType = busiOrder[i].boActionType;
					if (boActionType.actionClassCd==CONST.ACTION_CLASS_CD.MKTRES_ACTION
							&& boActionType.boActionTypeCd==CONST.BO_ACTION_TYPE.COUPON_SALE) {
						bo2Coupons = busiOrder[i].data.bo2Coupons;
					}
				}
				$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">终端串码：</div><div class="ui-block-b">'+bo2Coupons[0].couponInstanceNumber+'</div></div>');
			} else if (OrderInfo.actionFlag==17) {
				for(var i=0; i<busiOrder.length; i++) {
					var boActionType = busiOrder[i].boActionType;
					if (boActionType.actionClassCd==CONST.ACTION_CLASS_CD.MKTRES_ACTION
							&& boActionType.boActionTypeCd==CONST.BO_ACTION_TYPE.RETURN_COUPON) {
						bo2Coupons = busiOrder[i].data.bo2Coupons;
					}
				}
				$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">终端串码：</div><div class="ui-block-b">'+bo2Coupons[0].couponInstanceNumber+'</div></div>');
			} else if (OrderInfo.actionFlag==18) {
				for(var i=0; i<busiOrder.length; i++) {
					var boActionType = busiOrder[i].boActionType;
					if (boActionType.boActionTypeCd==CONST.BO_ACTION_TYPE.EXCHANGE_COUPON) {
						bo2Coupons = busiOrder[i].data.bo2Coupons;
					}
				}
				var oldCoupon = null;
				var newCoupon = null;
				if (bo2Coupons[0].state=="DEL") {
					oldCoupon = bo2Coupons[0];
					newCoupon = bo2Coupons[1];
				} else {
					oldCoupon = bo2Coupons[1];
					newCoupon = bo2Coupons[0];
				}
				$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">旧终端串码：</div><div class="ui-block-b">'+oldCoupon.couponInstanceNumber+'</div></div>');
				$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">新终端串码：</div><div class="ui-block-b">'+newCoupon.couponInstanceNumber+'</div></div>');
			}
			var $span = $("<span>"+OrderInfo.actionTypeName+"</span>"+OrderInfo.businessName);
			$("#tital").append($span);
		}else{ //二次业务
			var prod = order.prodModify.choosedProdInfo;
			$("#orderTbody").append('<li class="list-group-item" id="offerSpecName"> <h4 class="list-group-item-heading"> 套餐名称</h4><p class="list-group-item-text">'+prod.prodOfferName+'</p></li>');
			$("#orderTbody").append('<li class="list-group-item" id="accNbrTr"> <h4 class="list-group-item-heading"> 手机号码</h4><p class="list-group-item-text">'+prod.accNbr+'</p></li>');	
			if(OrderInfo.actionFlag==2){ //套餐变更 
				OrderInfo.actionTypeName = "套餐变更";
				$("#orderTbody").append('<li class="list-group-item" id="accNbrTr"> <h4 class="list-group-item-heading">新套餐名称</h4><p class="list-group-item-text">'+OrderInfo.offerSpec.offerSpecName+'</p></li>');	
				$("#accNbrTr").hide();
				for ( var i = 0; i < OrderInfo.offer.offerMemberInfos.length; i++) { //遍历主销售品构成
					var offerMember = OrderInfo.offer.offerMemberInfos[i];
					if(offerMember.objType==CONST.OBJ_TYPE.PROD){
						$("#orderTbody").append('<li class="list-group-item" id="accNbrTr"> <h4 class="list-group-item-heading">'+offerMember.roleName+'号码</h4><p class="list-group-item-text">'+offerMember.accessNumber+'</p></li>');
					}
				}
				if(offerChange.newMemberFlag){
					$.each(OrderInfo.boProdAns,function(){
						$("#orderTbody").append('<li class="list-group-item" id="accNbrTr"> <h4 class="list-group-item-heading">纳入副卡号码</h4><p class="list-group-item-text">'+this.accessNumber+'</p></li>');
					});
				}
				if(offerChange.oldMemberFlag){
					for(var j=0;j<OrderInfo.oldoffer.length;j++){
						for ( var i = 0; i < OrderInfo.oldoffer[j].offerMemberInfos.length; i++) {
							var offerMember = OrderInfo.oldoffer[j].offerMemberInfos[i];
							if(offerMember.objType==CONST.OBJ_TYPE.PROD){
								$("#orderTbody").append('<li class="list-group-item" id="accNbrTr"> <h4 class="list-group-item-heading">纳入副卡号码</h4><p class="list-group-item-text">'+offerMember.accessNumber+'</p></li>');
							}
						}
					}
				}
			}else if(OrderInfo.actionFlag==3){ //可选包变更 
				OrderInfo.actionTypeName = "订购/退订可选包与功能产品";
			}else if(OrderInfo.actionFlag==4||OrderInfo.actionFlag==8){ //客户资料变更与新建客户单独
				$("#offerSpecName").hide();
				$("#accNbrTr").hide();
			}else if(OrderInfo.actionFlag==5){  //主副卡成员变更拆除副卡
				$("#accNbrTr").hide();
				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历主销售品构成
					if(this.objType==CONST.OBJ_TYPE.PROD){
						if(this.roleCd == CONST.MEMBER_ROLE_CD.VICE_CARD && this.isRemove=="Y"){
							$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">拆除副卡号码：</div><div class="ui-block-b">'+this.accessNumber+'</div></div>');	
						}else {
							$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">'+this.roleName+'号码：</div><div class="ui-block-b">'+this.accessNumber+'</div></div>');	
						}
					}
				});
				OrderInfo.actionTypeName = "主副卡成员变更";
			}else if(OrderInfo.actionFlag==6){ //主副卡成员变更纳入副卡
				$("#accNbrTr").hide();
				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历主销售品构成
					if(this.objType==CONST.OBJ_TYPE.PROD){
						$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">'+this.roleName+'号码：</div><div class="ui-block-b">'+this.accessNumber+'</div></div>');
					}
				});
				$.each(OrderInfo.boProdAns,function(){
					$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">纳入副卡号码：</div><div class="ui-block-b">'+this.accessNumber+'</div></div> ');	
				});
				OrderInfo.actionTypeName = "主副卡成员变更";
			}else if(OrderInfo.actionFlag==7){ //主副卡拆机保留副卡
				$("#accNbrTr").hide();
				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历主销售品构成
					if(this.objType==CONST.OBJ_TYPE.PROD){
						if(this.roleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD){
							$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">拆除'+this.roleName+'号码：</div><div class="ui-block-b">'+this.accessNumber+'</div></div> ');	
						}else {
							var del="";
							var accessNumber=this.accessNumber;
							$.each(_viceParam,function(i,val){
								if(val.accessNumber==accessNumber&&val.del=="N"){
									del="N";
								}
							});
							if(del=="N"){
								$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">订购'+this.roleName+'号码：</div><div class="ui-block-b">'+this.accessNumber+'</div></div>');
							}else{
								$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">拆除'+this.roleName+'号码：</div><div class="ui-block-b">'+this.accessNumber+'</div></div> ');	
							}
						}
					}
				});
				OrderInfo.actionTypeName = CONST.getBoActionTypeName(OrderInfo.boActionTypeCd);
			}else if(OrderInfo.actionFlag==21){ //主副卡成员变更
				$("#accNbrTr").hide();
				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历主销售品构成
					if(this.objType==CONST.OBJ_TYPE.PROD){
						if(this.roleCd != CONST.MEMBER_ROLE_CD.MAIN_CARD){
							var knew="";
							var del="";
							var objInstId=this.objInstId;
							$.each(_viceParam,function(i,val){
								if(val.objInstId==objInstId&&val.knew=="Y"){
									knew="Y";
								}
								if(val.objInstId==objInstId&&val.del=="Y"){
									del="Y";
								}
							});
							if(knew=="Y"){
								$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">订购'+this.roleName+'号码：</div><div class="ui-block-b">'+this.accessNumber+'</div></div>');
							}else if(del=="Y"){
								$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">拆除'+this.roleName+'号码：</div><div class="ui-block-b">'+this.accessNumber+'</div></div>');	
							}
						}
					}
				});
				OrderInfo.actionTypeName = "主副卡成员变更";
			}else if(OrderInfo.actionFlag==20){ //主副卡拆机保留副卡
				$("#accNbrTr").hide();
				for ( var i = 0; i < OrderInfo.offer.offerMemberInfos.length; i++) { //遍历主销售品构成
					var offerMember = OrderInfo.offer.offerMemberInfos[i];
					if(offerMember.objType==CONST.OBJ_TYPE.PROD){
						if(offerMember.roleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD){
							$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">拆除'+offerMember.roleName+'号码：</div><div class="ui-block-b">'+offerMember.accessNumber+'</div></div> ');	
						}else {
							$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">订购'+offerMember.roleName+'号码：</div><div class="ui-block-b">'+offerMember.accessNumber+'</div></div>');	
						}
					}
				}
				OrderInfo.actionTypeName = "返销";	
			}else if(OrderInfo.actionFlag==12){ //加入组合退出组合
				$("#accNbrTr").hide();
				for (var i = 0; i < OrderInfo.confirmList.length; i++) {
					var prod = OrderInfo.confirmList[i];
					for(var j = 0; j < prod.accNbr.length; j++){
						$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">'+prod.name+'：</div><div class="ui-block-b">'+prod.accNbr[j]+'</div></div>');
					}
				}
			}else if(OrderInfo.actionFlag==16){ //改号
				OrderInfo.actionTypeName = "改号";
				$.each(OrderInfo.boProdAns,function(){
					if(this.state=="ADD"){
						$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">新号码：</div><div class="ui-block-b">'+this.accessNumber+'</div></div>');	
					}
				});
			}else if(OrderInfo.actionFlag==0&&OrderInfo.actionTypeName=="拆机"){ //拆机
				$("#accNbrTr").hide();
				var isMainCard="";
				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历主销售品构成
					if(this.roleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD&&this.objInstId==order.prodModify.choosedProdInfo.prodInstId){
						isMainCard="Y";	
					}
				});
				if(isMainCard=="Y"){
					$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历主销售品构成
							$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">拆除'+this.roleName+'号码：</div><div class="ui-block-b">'+this.accessNumber+'</div></div>');	
					});
				}
				OrderInfo.actionTypeName = "拆机";
			}
			var $span = $("<span>订单确认</span>");
			$("#tital").append($span);
		}
		
		var ruleFlag = true;
		if($("#ruleTbody tr").length>0){ //规则限制
			$("#ruleTbody tr").each(function (){
				var ruleLevel = $(this).attr("ruleLevel");
				if(ruleLevel == "1"){
					ruleFlag = false;
					return false; 
				}
			});
		}
		if(ec.util.isObj($("#provCheckErrorMsg").attr("title"))){
			ruleFlag = false;
		}
		if(ruleFlag){
			if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14){
				_showOrderOffer(); //显示订购的销售品
			}else if(OrderInfo.actionFlag==2){ //套餐变更 
				_showChangeAttach();
			}else if (OrderInfo.actionFlag==3){
				_showAttachOffer(); //显示订购的销售品
			}else if (OrderInfo.actionFlag==6){
				_showAddViceOffer(); //加装副卡显示订购的销售品
			}else{
				if(OrderInfo.orderResult.autoBoInfos!=undefined&&OrderInfo.orderResult.autoBoInfos.length>0){
					$("#chooseTable").append($('<tr><th width="50%">业务名称</th><th>业务动作</th></tr>'));
					$.each(OrderInfo.orderResult.autoBoInfos,function(){
						$("#chooseTable").append($('<tr><td width="50%">'+this.specName+'</td><td>'+this.boActionTypeName+'</td></tr>'));
					});
				}
			}
		}
	};
	
	//显示步骤
	var _showStep = function(k,data) {
		for (var i = 1; i < 4; i++) {
			$("#step"+i).hide();
		}
		$("#step"+k).show();
	};
	
	//页面步骤,优化页面显示功能
	var _step = function(k,data){
		if(k==0){   //订单准备页面
			$("#orderedprod").hide();
			$("#order_prepare").hide();
			$("#order_fill_content").hide();
			$("#order_tab_panel_content").html(data).show();
			k++;
		}else if(k==1){  //订单填写页面
			//$("#orderedprod").hide();
			$("#order_prepare").hide();
			//$("#order_tab_panel_content").hide();
			$("#order_confirm").hide();
			$("#order_fill").show();
		}else if(k==2){ //订单确认填写页面
			$("#order-content").hide();
			$("#order-dealer").hide();
			$("#order-confirm").html(data).show();
			OrderInfo.order.step=3;
		}
		/*for (var i = 1; i < 4; i++) {
			$("#step"+i).hide();
		}
		$("#step"+k).show();*/
	};
	
	// 新装，显示订购的销售品
	var _showOrderOffer = function(){
		var i=0;
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			$.each(this.prodInsts,function(){
				if(i==0){
					$("#orderTbody").after($('<table id="chooseTable_'+this.prodInstId+'" class="table table-bordered tablecenter"></table>'));
					i="chooseTable_"+this.prodInstId;
				}else{
					$("#"+i).after($('<table id="chooseTable_'+this.prodInstId+'" class="table table-bordered tablecenter"></table>'));
					i="chooseTable_"+this.prodInstId;
				}
				$("#chooseTable_"+this.prodInstId).append($('<thead><tr><th  style="width: 60%;">业务名称('+this.offerRoleName+')</th><th>业务动作</th></tr></thead>'));			
				_showAttOffer(this.prodInstId);
			});
		});
	};
	
	//显示加装副卡订购的销售品
	var _showAddViceOffer = function(){
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			if(this.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){
				$("#chooseTable").append($('<tr><th width="50%">业务名称('+this.offerRoleName+')</th><th>业务动作</th></tr>'));
				$.each(this.prodInsts,function(){
					_showAttOffer(this.prodInstId);	
				});
			}
		});
	};
	
	//套餐变更销售附属
	var _showChangeAttach = function(){
		var i=0;
		$.each(OrderInfo.offer.offerMemberInfos,function(){
			if(this.objType==CONST.OBJ_TYPE.PROD){
				if(i==0){
					$("#orderTbody").after($('<table id="chooseTable_'+this.objInstId+'" class="table table-bordered tablecenter"></table>'));
					i="chooseTable_"+this.objInstId;
				}else{
					$("#"+i).after($('<table id="chooseTable_'+this.objInstId+'" class="table table-bordered tablecenter"></table>'));
					i="chooseTable_"+this.objInstId;
				}
				$("#chooseTable_"+this.objInstId).append($('<thead><tr><th  style="width: 60%;">业务名称('+this.roleName+')</th><th>业务动作</th></tr></thead>'));			
				_showAttOffer(this.objInstId);
			}
		});
		var j=0;
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			if(this.memberRoleCd==401){
				$.each(this.prodInsts,function(){
					var instid = '"'+this.prodInstId+'"';
					if(instid.indexOf("-")!=-1){
						if(j==0){
//							$("#orderTbody").after($('<table id="chooseTable_'+this.prodInstId+'" class="table table-bordered tablecenter"></table>'));
							j="chooseTable_"+this.prodInstId;
						}else{
							$("#"+j).after($('<table id="chooseTable_'+this.prodInstId+'" class="table table-bordered tablecenter"></table>'));
							j="chooseTable_"+this.prodInstId;
						}
//						$("#chooseTable_"+this.prodInstId).append($('<thead><tr><th  style="width: 60%;">业务名称('+this.offerRoleName+')</th><th>业务动作</th></tr></thead>'));			
						_showAttOffer(this.prodInstId);
					}
				});
			}
		});
		if(offerChange.oldMemberFlag){
			$.each(OrderInfo.oldoffer,function(){
				$.each(this.offerMemberInfos,function(){
					if(this.objType==CONST.OBJ_TYPE.PROD){
						_showAttOffer(this.objInstId);
					}
				});
			});
		}
	};
	
	//显示订购的销售品
	var _showAttachOffer = function(){
		var prod = order.prodModify.choosedProdInfo;
		if(prod==undefined || prod.prodInstId ==undefined){
			return true;
		}
		$("#orderTbody").after($('<table id="chooseTable_'+prod.prodInstId+'" class="table table-bordered tablecenter"></table>'));
		$("#chooseTable_"+prod.prodInstId).append($('<thead><tr><th  style="width: 60%;">业务名称</th><th>业务动作</th></tr></thead>'));
		_showAttOffer(prod.prodInstId);
	};
	
	//显示的可选包/功能产品
	var _showAttOffer = function(prodId){
		var offerSpecList = CacheData.getOfferSpecList(prodId);
		var offerList = CacheData.getOfferList(prodId);
		var servSpecList = CacheData.getServSpecList(prodId);
		var servList = CacheData.getServList(prodId);
		var appList = CacheData.getOpenAppList(prodId);
		$("#chooseTable_"+prodId).append("<tbody>");
		//可选包显示
		if(offerSpecList!=undefined && offerSpecList.length>0){  
			$.each(offerSpecList,function(){ //遍历当前产品下面的附属销售品
				if(this.isdel != "Y" && this.isdel != "C"){  //订购的附属销售品
					$("#chooseTable_"+prodId).append($('<tr><td>'+this.offerSpecName+'</td><td>'+CONST.EVENT.OFFER_BUY+'</td></tr>'));
				}
			});
		}
		if(offerList!=undefined && offerList.length>0){
			$.each(offerList,function(){ //遍历当前产品下面的附属销售品
				if(this.isdel == "Y"){  //退订的附属销售品
					$("#chooseTable_"+prodId).append($('<tr><td>'+this.offerSpecName+'</td><td>'+CONST.EVENT.OFFER_DEL+'</td></tr>'));
				}else if(this.update == "Y"){
					$("#chooseTable_"+prodId).append($('<tr><td>'+this.offerSpecName+'</td><td>'+CONST.EVENT.OFFER_UPDATE+'</td></tr>'));
				}
			});
		}
		//功能产品显示
		if(servSpecList!=undefined && servSpecList.length>0){
			$.each(servSpecList,function(){ //遍历当前产品下面的附属销售品
				if(this.isdel != "Y"  && this.isdel != "C"){  //订购的附属销售品
					$("#chooseTable_"+prodId).append($('<tr><td>'+this.servSpecName+'</td><td>'+CONST.EVENT.PROD_OPEN+'</td></tr>'));
				}
			});
		}
		if(servList!=undefined && servList.length>0){
			$.each(servList,function(){ //遍历当前产品下面的附属销售品
				if(this.isdel == "Y"){  //退订的附属销售品
					$("#chooseTable_"+prodId).append($('<tr><td>'+this.servSpecName+'</td><td>'+CONST.EVENT.PROD_CLOSE+'</td></tr>'));
				}else if(this.update == "Y"){
					$("#chooseTable_"+prodId).append($('<tr><td>'+this.servSpecName+'</td><td>'+CONST.EVENT.PROD_UPDATE+'</td></tr>'));
				}
			});
		}
		if(appList!=undefined && appList.length>0){
			$.each(appList,function(){ //遍历当前产品下面的增值业务
				if(this.dfQty == 1){  //开通增值业务
					$("#chooseTable_"+prodId).append($('<tr><td>'+this.servSpecName+'</td><td>'+CONST.EVENT.PROD_OPEN+'</td></tr>'));
				}
			});
		}
		
		//动作链返回显示
		if(OrderInfo.orderResult.autoBoInfos!=undefined){
			$.each(OrderInfo.orderResult.autoBoInfos,function(){
				if(this.instAccessNumber==OrderInfo.getAccessNumber(prodId)){
					$("#chooseTable_"+prodId).append($('<tr><td>'+this.specName+'</td><td>'+this.boActionTypeName+'</td></tr>'));
				}
			});
		}
		$("#chooseTable_"+prodId).append("</tbody>");
	};
	
	//订单返回
	var _orderBack = function(){
		//不再绑定异常撤单
		SoOrder.delOrderFin();
		
		$("#order-content").show();
		//$("#main_conetent").show();

		$("#order-confirm").hide();
		//SoOrder.showStep(1);
		OrderInfo.orderData.orderList.custOrderList[0].busiOrder = [];
		OrderInfo.resetSeq(); //重置序列
		SoOrder.delOrder();
		_getToken(); //获取页面步骤
		if(CONST.getAppDesc()!=0){
			if($("#a-cust-modify")[0]){
				$("#a-cust-modify").show();
			}
		}
	};
	
	//作废购物车
	var _delOrder = function(){
		var olId = OrderInfo.orderResult.olId;
		if(olId!=0&&olId!=undefined){  //作废购物车
			var param = {
				olId : olId,
				areaId : OrderInfo.getAreaId()
			};
			$.callServiceAsJsonGet(contextPath+"/app/order/delOrder",param,{
				"done" : function(response){
					if (response.code==0) {
						if(response.data.resultCode==0){
							$.alert("提示","购物车作废成功！");
							OrderInfo.order.step=2;
						}
					}else if (response.code==-2){
						$.alertM(response.data.errData);
					}else {
						$.alert("提示","购物车作废失败！");
					}
				},
				fail:function(response){
					$.alert("提示","信息","请求可能发生异常，请稍后再试");
				}
			});
		}
	};
	
	var _delOrderBegin = function(){
		$.cookie(CONST.DEL_ORDER_FLAG.SILENT_OLID, OrderInfo.orderResult.olId);
		$("a[href^='/']").off("mousedown").on("mousedown", function(){
			SoOrder.delOrderSilent();
			window.location.href=this.href;
		});
		//在订单确认和收银台页面关闭浏览器时调用订单作废
		$(window).off("unload").on("unload", function(){
			SoOrder.delOrderSilent();
		});
	};
	var _delOrderSilent = function() {
//		var olId = OrderInfo.orderResult.olId;
		var olId = $.cookie(CONST.DEL_ORDER_FLAG.SILENT_OLID);
		$.cookie(CONST.DEL_ORDER_FLAG.SILENT_OLID, null);
		if(olId!=0&&olId!=undefined && olId != null){  //作废购物车
			var param = {
				olId : olId,
				areaId : OrderInfo.getAreaId(),
				flag: "U"
			};
			var result = $.callServiceAsJsonGet(contextPath+"/order/delOrder",param);
			//自动撤单时后台会释放该单预占的号码，门户相应更新预占号码表状态（目前撤单不释放预占的UIM，这里也不更新UIM的状态）
			var resources  = [];
			for (var i = 0; i < OrderInfo.boProdAns.length; i++) {	
				var res = {
					accNbr :OrderInfo.boProdAns[i].accessNumber,
					accNbrType : 1,  //号码类型（1手机号码2.UIM卡）
					action : "UPDATE"
				};
				resources.push(res);
			}
			if(resources.length>0){
				var url= contextPath+"/common/updateResState";	 
				$.callServiceAsJsonGet(url,{strParam:JSON.stringify(resources)},{
					"done" : function(response){
						if (response.code==0) {
							if(response.data){
							}
						}
					}
				});	
			}
			OrderInfo.orderData.orderList.custOrderList[0].busiOrder = [];
			OrderInfo.resetSeq(); //重置序列
			_getToken();
			SoOrder.delOrderFin();
		}
	};
	var _delOrderFin = function(){
		$.cookie(CONST.DEL_ORDER_FLAG.SILENT_OLID, null);
		$("a[href^='/']").off("mousedown");
		$(window).off("unload");
	};
	
	//拆副卡
	var _delViceCard = function(busiOrders,data){
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息 
		var param = {
			offerSpecId : prodInfo.prodOfferId,  //业务规格ID
			offerId : prodInfo.prodOfferInstId,  //业务对象实例ID
			offerTypeCd : "1",
			isUpdate : "Y",
			boActionTypeCd : CONST.BO_ACTION_TYPE.UPDATE_OFFER,
			data : data
		};
		OrderInfo.getOfferBusiOrder(busiOrders,param,data[0].objInstId);
		$.each(data,function(){
			var prod = {
				prodId : this.objInstId, 
				isComp : "Y",
				boActionTypeCd : CONST.BO_ACTION_TYPE.REMOVE_PROD
			};
			busiOrders.push(OrderInfo.getProdBusiOrder(prod));
			$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历主销售品构成
				if(this.roleCd == CONST.MEMBER_ROLE_CD.VICE_CARD && this.objInstId== prodId){
					this.isRemove = "Y";//标志是否拆机
					return false;
				}
			});
		});
	};
	
	//销售品成员变更保留副卡订购新套餐拆副卡并订购新套餐
	var _delViceCardAndNew = function(busiOrders,data){		
		//var newData = data ;
		var objInstId="";
        var newData = data.viceParam ;
        _viceParam=newData;
        var ooRoles = data.ooRoles;
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息 
		var param = {
			offerSpecId : prodInfo.prodOfferId,  //业务规格ID
			offerId : prodInfo.prodOfferInstId,  //业务对象实例ID
			offerTypeCd : "1",
			isUpdate : "Y",
			boActionTypeCd : CONST.BO_ACTION_TYPE.UPDATE_OFFER,
			data : data.ooRoles
		};
		$.each(OrderInfo.offer.offerMemberInfos,function(i){
			if(this.roleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD){
				objInstId = this.objInstId;
				return false;
			}
		});
		OrderInfo.getOfferBusiOrder(busiOrders,param,objInstId);		
		//订购副卡主套餐
		for (var i = 0; i < newData.length; i++) {
			if(newData[i].knew=="Y"){
			var offerSpec = newData[i];
			var busiOrder2 = {
				areaId : prodInfo.areaId,  //受理地区ID
				busiOrderInfo : {
					seq : OrderInfo.SEQ.seq--
				}, 
				busiObj : { //业务对象节点
					objId : offerSpec.offerSpecId,  //业务规格ID
					instId : OrderInfo.SEQ.offerSeq--, //业务对象实例ID
					isComp : "N", //是否组合
					offerTypeCd : "1" //1主销售品
				},  
				boActionType : {
					actionClassCd : CONST.ACTION_CLASS_CD.OFFER_ACTION,
					boActionTypeCd : CONST.BO_ACTION_TYPE.BUY_OFFER
				}, 
				data:{
					ooRoles : [],
					ooOwners : [{
						partyId : OrderInfo.cust.custId, //客户ID
						state : "ADD" //动作
					}]
				}
			};
			//遍历主销售品构成
			for ( var j = 0; j < OrderInfo.offer.offerMemberInfos.length; j++) {
				var offerMember = OrderInfo.offer.offerMemberInfos[j];
				if(offerMember.objInstId==offerSpec.objInstId){
					var ooRoles = {
						objId : offerMember.objId, //业务规格ID
						objInstId : offerMember.objInstId, //业务对象实例ID,新装默认-1
						objType : offerMember.objType, // 业务对象类型
						offerRoleId : offerSpec.offerRoleId, //销售品角色ID
						state : "ADD" //动作
					};
					busiOrder2.data.ooRoles.push(ooRoles);
					break;
				}
			}
			busiOrders.push(busiOrder2);
			}else{
			var prod = {
						prodId : newData[i].objInstId, 
						isComp : "Y",
						boActionTypeCd : CONST.BO_ACTION_TYPE.REMOVE_PROD
					};
			busiOrders.push(OrderInfo.getProdBusiOrder(prod));
			}
			
			
		}
	};
	
	//填充业务对象节点
	var _fillBusiOrder = function(busiOrders,data,isComp) {	
		var prod = order.prodModify.choosedProdInfo; //获取产品信息 
		var boActionTypeCd= OrderInfo.boActionTypeCd;
		var objId= prod.productId;
		var instId=prod.prodInstId;
		var classcd=OrderInfo.actionClassCd;
		if(boActionTypeCd==CONST.BO_ACTION_TYPE.ADDOREXIT_COMP){
			objId=prod.prodOfferId;
			instId=prod.prodOfferInstId;
			classcd=CONST.ACTION_CLASS_CD.OFFER_ACTION;
		}
		var busiOrder = {
			areaId : OrderInfo.getProdAreaId(prod.prodInstId),  //受理地区ID		
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				objId : objId,//prodInfo.productId, //业务对象规格ID
				instId : instId, //业务对象实例ID
				isComp : isComp, //是否组合
				accessNumber : prod.accNbr,   //业务号码
				offerTypeCd : "1"  //1主销售品
			},  
			boActionType : {
				actionClassCd : classcd,
				boActionTypeCd : OrderInfo.boActionTypeCd
			}, 
			data:{}
		};
		busiOrder.data =data;
		busiOrders.push(busiOrder);
	};
	
	//创建订单数据
	var _createOrder = function(busiOrders) {
		//添加客户节点
		if(OrderInfo.cust.custId == -1){
			OrderInfo.createCust(busiOrders);	
		}
		//var acctId = -1; //先写死
		var acctId=-1;
		if(OrderInfo.acct!=undefined&&OrderInfo.acct.acctId!=undefined&&OrderInfo.acct.acctId!=null&&OrderInfo.acct.acctId!=""){//新装传帐户id
			acctId=OrderInfo.acct.acctId;
		}
		if(acctId < 0 && acctId!=undefined ){
			OrderInfo.createAcct(busiOrders,acctId);	//添加帐户节点
		}
		var busiOrder = _createMainOffer(busiOrders); //添加主销售品节点	
		//遍历主销售品构成,添加产品节点
		for ( var i = 0; i < busiOrder.data.ooRoles.length; i++) {
			var ooRole = busiOrder.data.ooRoles[i];
			if(ooRole.objType==2 && ooRole.memberRoleCd!=undefined){
				busiOrders.push(_createProd(ooRole.objInstId,ooRole.objId));	
			}		
		}
		AttachOffer.setAttachBusiOrder(busiOrders);  //添加可选包跟功能产品
	};
	
	//初始化订单获取token
	var _getToken = function() {
		var response = $.callServiceAsHtmlGet(contextPath+"/common/getToken");
		OrderInfo.order.token = response.data;
	};
	
	//获取token的同步请求
	var _getTokenSynchronize = function() {
		var response = $.callServiceAsHtmlGet(contextPath+"/common/getToken");
		OrderInfo.order.token = response.data;
	};
	
	//创建主副卡订单数据
	var _createMainOrder = function(busiOrders) {
		var prodInfo = order.prodModify.choosedProdInfo;
		var busiOrder = {
			areaId : prodInfo.areaId,  //受理地区ID
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				objId : prodInfo.prodOfferId,  //业务规格ID
				instId : prodInfo.prodOfferInstId, //业务对象实例ID
				accessNumber : prodInfo.accNbr, //业务号码
				isComp : "Y", //是否组合
				offerTypeCd : "1" //1主销售品
			},  
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.OFFER_ACTION,
				boActionTypeCd : CONST.BO_ACTION_TYPE.ADDOREXIT_COMP
			}, 
			data:{
				ooRoles : []			
			}
		};
		
		//遍历主销售品构成
		
		if(ec.util.isArray(OrderInfo.oldprodInstInfos)){
			//纳入老用户
			var offerRoleId = "";
			for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
				var offerRole = OrderInfo.offerSpec.offerRoles[i];
				if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){ //副卡
//					if(offerRole.prodInsts!=undefined && offerRole.prodInsts.length>0){
//						for ( var j = 0; j < offerRole.prodInsts.length; j++) {
//							var prodInst = offerRole.prodInsts[j];
							offerRoleId = offerRole.offerRoleId;
							break;
//						}		
//					}
				} 
			}
			
			//[W]
			var action_type = (OrderInfo.hasMainCarFlag) ? CONST.BO_ACTION_TYPE.DEL_OFFER : CONST.BO_ACTION_TYPE.ADDOREXIT_COMP;
			
			for(var q=0;q<OrderInfo.oldprodInstInfos.length;q++){
				var oldprodInfo = OrderInfo.oldprodInstInfos[q];
				var oldbusiOrder = {
						areaId : oldprodInfo.areaId,  //受理地区ID
						busiOrderInfo : {
							seq : OrderInfo.SEQ.seq--
						}, 
						busiObj : { //业务对象节点
							objId : oldprodInfo.mainProdOfferInstInfos[0].prodOfferId,  //业务规格ID
							instId : oldprodInfo.mainProdOfferInstInfos[0].prodOfferInstId, //业务对象实例ID
							accessNumber : oldprodInfo.accNbr, //业务号码
							isComp : "Y", //是否组合
							offerTypeCd : "1" //1主销售品
						},  
						boActionType : {
							actionClassCd : CONST.ACTION_CLASS_CD.OFFER_ACTION,
							boActionTypeCd : CONST.BO_ACTION_TYPE.DEL_OFFER
						}, 
						data:{
							ooRoles : []			
						}
					};
				var memberid = -1;
				for ( var i = 0; i < OrderInfo.oldoffer.length; i++) {
					if(OrderInfo.oldoffer[i].accNbr==oldprodInfo.accNbr){
						$.each(OrderInfo.oldoffer[i].offerMemberInfos,function(){
							if(this.objType==CONST.OBJ_TYPE.PROD){
								var ooRole = {
									objId : this.objId,
									objInstId : this.objInstId,
									objType : this.objType,
									offerMemberId : memberid,
									offerRoleId : offerRoleId,
									state : "ADD"
								};
								busiOrder.data.ooRoles.push(ooRole);
								var oldooRole = {
										objId : this.objId,
										objInstId : this.objInstId,
										objType : this.objType,
										offerMemberId : this.offerMemberId,
										offerRoleId : this.offerRoleId,
										state : "DEL"
									};
								oldbusiOrder.data.ooRoles.push(oldooRole);
								--memberid;
							}
						});
					}
				}
				busiOrders.push(oldbusiOrder);
			}
			if(CONST.getAppDesc()==0){ //4g系统需要,补换卡 
				for ( var i = 0; i < OrderInfo.oldoffer.length; i++) { //遍历主销售品构成
					$.each(OrderInfo.oldoffer[i].offerMemberInfos,function(){
						if(this.objType==CONST.OBJ_TYPE.PROD && this.prodClass==CONST.PROD_CLASS.THREE && OrderInfo.offerSpec.is3G=="N"){//补换卡
							if(AttachOffer.isChangeUim(this.objInstId)&&(OrderInfo.boProd2Tds.length>0||OrderInfo.zcd_privilege==0)){
								var prod = {
									prodId : this.objInstId,
									prodSpecId : this.objId,
									accessNumber : this.accessNumber,
									isComp : "N",
									boActionTypeCd : CONST.BO_ACTION_TYPE.CHANGE_CARD
								};
								var busiOrder = OrderInfo.getProdBusiOrder(prod);
								if(busiOrder){
									busiOrders.push(busiOrder);
								}
							}
						}
					});
				}
			}
		}
		
		AttachOffer.setAttachBusiOrder(busiOrders);//添加附属
		busiOrders.push(busiOrder);
	};
	
	//创建主副卡订单数据
	var _delAndNew = function(busiOrders,newDataMap) {
		var newData = newDataMap ;
		var remark = "" ; 
		var allDel=true;
		var v_actionClassCd = CONST.ACTION_CLASS_CD.OFFER_ACTION;
		var v_boActionTypeCd = CONST.BO_ACTION_TYPE.DEL_OFFER;
		var v_actionClassCd2 = CONST.ACTION_CLASS_CD.OFFER_ACTION;
		var v_boActionTypeCd2 = CONST.BO_ACTION_TYPE.BUY_OFFER;
		if(OrderInfo.actionFlag==19||OrderInfo.actionFlag==20){
			v_actionClassCd = CONST.ACTION_CLASS_CD.PROD_ACTION;//产品及服务动作
			v_boActionTypeCd = CONST.BO_ACTION_TYPE.BUY_BACK;//返销
			v_actionClassCd2 = CONST.ACTION_CLASS_CD.OFFER_ACTION;//销售品动作
			v_boActionTypeCd2 = CONST.BO_ACTION_TYPE.BUY_OFFER;//订购销售品
			v_boActionTypeCdAdd =CONST.BO_ACTION_TYPE.BUY_BACK;//副卡带出动作小类
			newData = newDataMap.viceParam ;
			remark = newDataMap.remark; 
		}else if(OrderInfo.actionFlag==7){
			v_boActionTypeCdAdd =CONST.BO_ACTION_TYPE.REMOVE_PROD;//副卡带出动作小类
		}
		for (var i = 0; i < newData.length; i++) {
			var offerSpec = newData[i];
			if(offerSpec.del=='N'){
				allDel=false;
			}
		}
		if(allDel){
			_viceParam=newData;
			var busiOrder = {
					areaId : OrderInfo.getProdAreaId(order.prodModify.choosedProdInfo.prodInstId),  //受理地区ID
					busiOrderInfo : {
						seq : OrderInfo.SEQ.seq--
					}, 
					busiObj : { //业务对象节点
						accessNumber : order.prodModify.choosedProdInfo.accNbr,
						objId : order.prodModify.choosedProdInfo.productId,  //业务规格ID,prod.prodOfferId
						instId : order.prodModify.choosedProdInfo.prodInstId, //业务对象实例ID,prod.prodOfferInstId
						isComp : "N", //是否组合
						offerTypeCd : "1" //1主销售品
					},  
					boActionType : {
						actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION,//CONST.ACTION_CLASS_CD.OFFER_ACTION,
						boActionTypeCd : OrderInfo.boActionTypeCd//CONST.BO_ACTION_TYPE.DEL_OFFER
					},
					data:{
						boProdStatuses :[{
							prodStatusCd : order.prodModify.choosedProdInfo.prodStateCd,
							state : "DEL"
						},{
							prodStatusCd : (OrderInfo.boActionTypeCd==CONST.BO_ACTION_TYPE.PREMOVE_PROD) ? CONST.PROD_STATUS_CD.STOP_PROD : CONST.PROD_STATUS_CD.REMOVE_PROD,
							state : "ADD"
						}],
						busiOrderAttrs:[]
					}
				};
			/*var remark = $('#order_remark').val();   //订单备注
			if(remark!=""&&remark!=undefined){
				busiOrder.data.busiOrderAttrs.push({
					itemSpecId : CONST.BUSI_ORDER_ATTR.REMARK,
					value : remark
				});	
			}*/
				busiOrders.push(busiOrder);	
			for (var i = 0; i < newData.length; i++) {
				var offerSpec = newData[i];
				var busiOrder = {
						areaId : OrderInfo.getProdAreaId(offerSpec.prodInstId),  //受理地区ID
						busiOrderInfo : {
							seq : OrderInfo.SEQ.seq--
						}, 
						busiObj : { //业务对象节点
							accessNumber :offerSpec.accessNumber,
							objId : offerSpec.objId,  //业务规格ID,prod.prodOfferId
							instId : offerSpec.objInstId, //业务对象实例ID,prod.prodOfferInstId
							isComp : "N", //是否组合
							offerTypeCd : "1" //1主销售品
						},  
						boActionType : {
							actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION,//CONST.ACTION_CLASS_CD.OFFER_ACTION,
							boActionTypeCd : OrderInfo.boActionTypeCd//CONST.BO_ACTION_TYPE.DEL_OFFER
						},
						data:{
							boProdStatuses :[/*{
								prodStatusCd :order.prodModify.choosedProdInfo.prodStateCd,
								state : "DEL"
							},*/
							{
								prodStatusCd : (OrderInfo.boActionTypeCd==CONST.BO_ACTION_TYPE.PREMOVE_PROD) ? CONST.PROD_STATUS_CD.STOP_PROD : CONST.PROD_STATUS_CD.REMOVE_PROD,
								state : "ADD"
							}],
							busiOrderAttrs:[]
						}
					};
				/*var remark = $('#order_remark').val();   //订单备注
				if(remark!=""&&remark!=undefined){
					busiOrder.data.busiOrderAttrs.push({
						itemSpecId : CONST.BUSI_ORDER_ATTR.REMARK,
						value : remark
					});	
				}*/
					busiOrders.push(busiOrder);	
			}
			return;
		}
		if(OrderInfo.actionFlag==7){ //7 拆主卡保留副卡
			_viceParam=newData;
			//退订主套餐
			var prod = order.prodModify.choosedProdInfo;
			var busiOrder = {
				areaId : OrderInfo.getProdAreaId(prod.prodInstId),  //受理地区ID
				busiOrderInfo : {
					seq : OrderInfo.SEQ.seq--
				}, 
				busiObj : { //业务对象节点
					objId : prod.prodOfferId,  //业务规格ID,prod.prodOfferId
					instId : prod.prodOfferInstId, //业务对象实例ID,prod.prodOfferInstId
					isComp : "N", //是否组合
					offerTypeCd : "1" //1主销售品
				},  
				boActionType : {
					actionClassCd : v_actionClassCd,//CONST.ACTION_CLASS_CD.OFFER_ACTION,
					boActionTypeCd : v_boActionTypeCd//CONST.BO_ACTION_TYPE.DEL_OFFER
				},
				data:{
					ooRoles : [],	
					ooOwners : [{
						partyId : OrderInfo.cust.custId, //客户ID
						state : "DEL" //动作
					}]
				}
			};
			//遍历主销售品构成
			for ( var i = 0; i < OrderInfo.offer.offerMemberInfos.length; i++) {
				var offerMember = OrderInfo.offer.offerMemberInfos[i];
				var ooRoles = {
					objId : offerMember.objId, //业务规格ID
					objInstId : offerMember.objInstId, //业务对象实例ID,新装默认-1
					objType : offerMember.objType, // 业务对象类型
					offerMemberId : offerMember.offerMemberId, //成员id
					offerRoleId : offerMember.offerRoleId, //销售品角色ID
					state : "DEL" //动作
				};
				busiOrder.data.ooRoles.push(ooRoles);
			}
			busiOrders.push(busiOrder);	
			/*var prod = {
				prodId : this.objInstId, 
				isComp : "Y",
				boActionTypeCd : CONST.BO_ACTION_TYPE.REMOVE_PROD
			};
			busiOrders.push(OrderInfo.getProdBusiOrder(prod));*/
		}else {
			//反销主卡
			var prod = order.prodModify.choosedProdInfo;
			var busiOrder = {
				areaId : OrderInfo.getProdAreaId(prod.prodInstId),  //受理地区ID
				busiOrderInfo : {
					seq : OrderInfo.SEQ.seq--
				}, 
				busiObj : { //业务对象节点
					objId : prod.productId,  //业务规格ID,prod.prodOfferId
					instId : prod.prodInstId, //业务对象实例ID,prod.prodOfferInstId
					accessNumber : prod.accNbr, //接入号码
					isComp : "N" //是否组合
				},  
				boActionType : {
					actionClassCd : v_actionClassCd,//CONST.ACTION_CLASS_CD.OFFER_ACTION,
					boActionTypeCd : v_boActionTypeCd//CONST.BO_ACTION_TYPE.DEL_OFFER
				},
				data:{
					boProdStatuses : [
					  {
						  "prodStatusCd": CONST.PROD_STATUS_CD.NORMAL_PROD,
	                        "state": "DEL"
					  },{
						  "prodStatusCd": CONST.PROD_STATUS_CD.REMOVE_PROD,
	                        "state": "ADD"
					  }
					],	
					busiOrderAttrs : []
				}
			};
			/*//订单属性
			if(remark!=undefined&&remark!=""){
				busiOrder.data.busiOrderAttrs.push({
					itemSpecId : CONST.BUSI_ORDER_ATTR.REMARK,
					value : remark
				});	
			}*/
			busiOrders.push(busiOrder);	
		}
		
		//订购副卡主套餐
		for (var i = 0; i < newData.length; i++) {
			var offerSpec = newData[i];
			if(offerSpec.del=="N"){
			var busiOrder2 = {
				areaId : OrderInfo.getAreaId(),  //受理地区ID
				busiOrderInfo : {
					seq : OrderInfo.SEQ.seq--
				}, 
				busiObj : { //业务对象节点
					objId : offerSpec.offerSpecId,  //业务规格ID
					instId : OrderInfo.SEQ.offerSeq--, //业务对象实例ID
					isComp : "N", //是否组合
					offerTypeCd : "1" //1主销售品
				},  
				boActionType : {
					actionClassCd : v_actionClassCd2,//CONST.ACTION_CLASS_CD.OFFER_ACTION,
					boActionTypeCd : v_boActionTypeCd2//CONST.BO_ACTION_TYPE.BUY_OFFER
				}, 
				data:{
					ooRoles : [],
					ooOwners : [{
						partyId : OrderInfo.cust.custId, //客户ID
						state : "ADD" //动作
					}]
				}
			};
			//遍历主销售品构成
			for ( var j = 0; j < OrderInfo.offer.offerMemberInfos.length; j++) {
				var offerMember = OrderInfo.offer.offerMemberInfos[j];
				if(offerMember.objInstId==offerSpec.objInstId){
					var ooRoles = {
						objId : offerMember.objId, //业务规格ID
						objInstId : offerMember.objInstId, //业务对象实例ID,新装默认-1
						objType : offerMember.objType, // 业务对象类型
						offerRoleId : offerSpec.offerRoleId, //销售品角色ID
						state : "ADD" //动作
					};
					busiOrder2.data.ooRoles.push(ooRoles);
					break;
				}
			}
			busiOrders.push(busiOrder2);
		}else{
				var busiOrder = {
						areaId : OrderInfo.getProdAreaId(offerSpec.prodInstId),  //受理地区ID
						busiOrderInfo : {
							seq : OrderInfo.SEQ.seq--
						}, 
						busiObj : { //业务对象节点
							accessNumber :offerSpec.accessNumber,
							objId : offerSpec.objId,  //业务规格ID,prod.prodOfferId
							instId : offerSpec.objInstId, //业务对象实例ID,prod.prodOfferInstId
							isComp : "N", //是否组合
							offerTypeCd : "1" //1主销售品
						},  
						boActionType : {
							actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION,//CONST.ACTION_CLASS_CD.OFFER_ACTION,
							boActionTypeCd : OrderInfo.boActionTypeCd//CONST.BO_ACTION_TYPE.DEL_OFFER
						},
						data:{
							boProdStatuses :[/*{
								prodStatusCd :order.prodModify.choosedProdInfo.prodStateCd,
								state : "DEL"
							},*/
							{
								prodStatusCd : (OrderInfo.boActionTypeCd==CONST.BO_ACTION_TYPE.PREMOVE_PROD) ? CONST.PROD_STATUS_CD.STOP_PROD : CONST.PROD_STATUS_CD.REMOVE_PROD,
								state : "ADD"
							}],
							busiOrderAttrs:[]
						}
					};
				/*var remark = $('#order_remark').val();   //订单备注
				if(remark!=""&&remark!=undefined){
					busiOrder.data.busiOrderAttrs.push({
						itemSpecId : CONST.BUSI_ORDER_ATTR.REMARK,
						value : remark
					});	
				}*/
					busiOrders.push(busiOrder);	
		}
		}
	};
	
	//创建附属销售品订单数据
	var _createAttOrder = function(busiOrders){	
		AttachOffer.setAttachBusiOrder(busiOrders);		
		var prodInfo = order.prodModify.choosedProdInfo;
		if(AttachOffer.isChangeUim(prodInfo.prodInstId)){
			if(OrderInfo.boProd2Tds.length>0){
				var prod = {
					prodId : prodInfo.prodInstId,
					prodSpecId : prodInfo.productId,
					isComp : "N",
					accessNumber : prodInfo.accNbr,
					boActionTypeCd : CONST.BO_ACTION_TYPE.CHANGE_CARD
				};
				busiOrders.push(OrderInfo.getProdBusiOrder(prod));
			}
		}
	};
	
	//创建附属销售品订单数据
	var _createCustOrder = function(busiOrders,data){	
		var busiOrder = {
			areaId : OrderInfo.getAreaId(),  //受理地区ID		
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				instId : OrderInfo.cust.custId //业务对象实例ID
			},  
			boActionType : {
				actionClassCd : OrderInfo.actionClassCd,
				boActionTypeCd : OrderInfo.boActionTypeCd
			}, 
			data:{}
		};
		busiOrder.data =data;
		busiOrders.push(busiOrder);
	};
	//创建活卡销售返档订单数据
	var _ActiveReturnOrder = function(busiOrders,data){
		var busiOrder = {
			areaId : OrderInfo.getAreaId(),  //受理地区ID		
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				accessNumber: order.prodModify.choosedProdInfo.accNbr,
				instId : OrderInfo.cust.custId //业务对象实例ID
			},  
			boActionType : {
				actionClassCd : OrderInfo.actionClassCd,
				boActionTypeCd : OrderInfo.boActionTypeCd
			}, 
			data:{}
		};
		busiOrder.data =data;
		busiOrders.push(busiOrder);
		var busiOrderAdd = {
				areaId : OrderInfo.getAreaId(),  //受理地区ID		
				busiOrderInfo : {
					seq : OrderInfo.SEQ.seq--
				}, 
				busiObj : { //业务对象节点
					accessNumber: order.prodModify.choosedProdInfo.accNbr,
					instId : order.prodModify.choosedProdInfo.prodInstId, //业务对象实例ID
					objId :order.prodModify.choosedProdInfo.productId
				},  
				boActionType : {
					actionClassCd: CONST.ACTION_CLASS_CD.PROD_ACTION,
                    boActionTypeCd: CONST.BO_ACTION_TYPE.ACTIVERETURNTWO
				}, 
				data:{}
			};
		busiOrderAdd.data.boProdStatuses = [{
			prodStatusCd : CONST.PROD_STATUS_CD.READY_PROD,
			state : "DEL"
		},{
			prodStatusCd : CONST.PROD_STATUS_CD.DONE_PROD,
			state : "ADD"
		}
		];
		busiOrders.push(busiOrderAdd);
	};
	//创建客户单独订单
	var _createCustOrderOnly = function(busiOrders,data){
		var busiOrder = {
			areaId : OrderInfo.getAreaId(),  //受理地区ID		
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				instId : -1 //业务对象实例ID
			},  
			boActionType : {
				actionClassCd : OrderInfo.actionClassCd,
				boActionTypeCd : OrderInfo.boActionTypeCd
			}, 
			data:{}
		};
		busiOrder.data =data;
		busiOrders.push(busiOrder);
	};
	
	
	//创建主销售品节点
	var _createMainOffer = function(busiOrders) {
		var busiOrder = {
			areaId : OrderInfo.getProdAreaId(-1),  //受理地区ID
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				objId : OrderInfo.offerSpec.offerSpecId,  //业务规格ID
				objName : OrderInfo.offerSpec.offerSpecName,//业务名称
				instId : OrderInfo.SEQ.offerSeq--, //业务对象实例ID
				isComp : "N", //是否组合
				offerTypeCd : "1" //1主销售品
			},  
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.OFFER_ACTION,
				boActionTypeCd : CONST.BO_ACTION_TYPE.BUY_OFFER
			}, 
			data:{
				ooRoles : [],
				ooOwners : [],
				busiOrderAttrs : []
			}
		};
		var accNbr = OrderInfo.getAccessNumber(-1);
		if(ec.util.isObj(accNbr)){ //接入号
			busiOrder.busiObj.accessNumber = accNbr;
		}	
		//遍历主销售品构成
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			$.each(this.prodInsts,function(){
				var ooRoles = {
					objId : this.objId, //业务规格ID
					objInstId : this.prodInstId, //业务对象实例ID,新装默认-1
					objType : this.objType, // 业务对象类型
					memberRoleCd : this.memberRoleCd, //成员角色类型
					offerRoleId : this.offerRoleId, //销售品角色ID
					state : "ADD" //动作
				};
				busiOrder.data.ooRoles.push(ooRoles);  //接入类产品
				var prodId = this.prodInstId;
				if(this.servInsts!=undefined && this.servInsts.length>0){ //功能类产品
					$.each(this.servInsts,function(){
						var ooRoles = {
							objId : this.objId, //业务规格ID
							objInstId : OrderInfo.SEQ.servSeq--, //业务对象实例ID,新装默认-1
							objType : this.objType, // 业务对象类型
							prodId : prodId,
							//memberRoleCd : this.memberRoleCd, //成员角色类型
							offerRoleId : this.offerRoleId, //销售品角色ID
							state : "ADD" //动作
						};
						busiOrder.data.ooRoles.push(ooRoles); //功能类产品
					});
				}
			});
		}); 
		
		if(order.service.oldMemberFlag){//纳入老用户
			var offerRoleId = "";
			for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
				var offerRole = OrderInfo.offerSpec.offerRoles[i];
				if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){ //副卡
							offerRoleId = offerRole.offerRoleId;
							break;
				} 
			}
			for(var q=0;q<OrderInfo.oldprodInstInfos.length;q++){
				var oldprodInfo = OrderInfo.oldprodInstInfos[q];
				var oldbusiOrder = {
						areaId : oldprodInfo.areaId,  //受理地区ID
						busiOrderInfo : {
							seq : OrderInfo.SEQ.seq--
						}, 
						busiObj : { //业务对象节点
							objId : oldprodInfo.mainProdOfferInstInfos[0].prodOfferId,  //业务规格ID
							instId : oldprodInfo.mainProdOfferInstInfos[0].prodOfferInstId, //业务对象实例ID
							accessNumber : oldprodInfo.accNbr, //业务号码
							isComp : "Y", //是否组合
							offerTypeCd : "1" //1主销售品
						},  
						boActionType : {
							actionClassCd : CONST.ACTION_CLASS_CD.OFFER_ACTION,
							boActionTypeCd : CONST.BO_ACTION_TYPE.DEL_OFFER
						}, 
						data:{
							ooRoles : []			
						}
					};
				
					var memberid = -1;
					for ( var i = 0; i < OrderInfo.oldoffer.length; i++) {
						if(OrderInfo.oldoffer[i].accNbr==oldprodInfo.accNbr){
							$.each(OrderInfo.oldoffer[i].offerMemberInfos,function(){
								//if((this.roleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD || this.roleCd=="1") && this.objType=="2"){
								if(this.objType==CONST.OBJ_TYPE.PROD){
									var ooRole = {
										objId : this.objId,
										objInstId : this.objInstId,
										objType : this.objType,
										offerMemberId : memberid,
										offerRoleId : offerRoleId,
										state : "ADD"
									};
									busiOrder.data.ooRoles.push(ooRole);
									var oldooRole = {
											objId : this.objId,
											objInstId : this.objInstId,
											objType : this.objType,
											offerMemberId : this.offerMemberId,
											offerRoleId : this.offerRoleId,
											state : "DEL"
										};
									oldbusiOrder.data.ooRoles.push(oldooRole);
									--memberid;
								}
							});
						}
					}
				busiOrders.push(oldbusiOrder);
			}
			if(CONST.getAppDesc()==0){ //4g系统需要,补换卡 
				for ( var i = 0; i < OrderInfo.oldoffer.length; i++) { //遍历主销售品构成
					$.each(OrderInfo.oldoffer[i].offerMemberInfos,function(){
						if(this.objType==CONST.OBJ_TYPE.PROD && this.prodClass==CONST.PROD_CLASS.THREE && OrderInfo.offerSpec.is3G=="N"){//补换卡
							if(AttachOffer.isChangeUim(this.objInstId)&&(OrderInfo.boProd2Tds.length>0||OrderInfo.zcd_privilege==0)){
								var prod = {
									prodId : this.objInstId,
									prodSpecId : this.objId,
									accessNumber : this.accessNumber,
									isComp : "N",
									boActionTypeCd : CONST.BO_ACTION_TYPE.CHANGE_CARD
								};
								var busiOrder = OrderInfo.getProdBusiOrder(prod);
								if(busiOrder){
									busiOrders.push(busiOrder);
								}
							}
						}
					});
				}
			}
		}
		
		//销售参数节点
		var offerSpecParams = OrderInfo.offerSpec.offerSpecParams;
		if(offerSpecParams!=undefined && offerSpecParams.length>0){  
			busiOrder.data.ooParams = [];
			for (var i = 0; i < offerSpecParams.length; i++) {
				var param = offerSpecParams[i];
				var ooParam = {
	                itemSpecId : param.itemSpecId,
	                offerParamId : OrderInfo.SEQ.paramSeq--,
	                offerSpecParamId : param.offerSpecParamId,
	                value : param.value,
	                state : "ADD"
	            };
	            busiOrder.data.ooParams.push(ooParam);
			}				
		}
		
		//销售生失效时间节点
		if(OrderInfo.offerSpec.ooTimes !=undefined ){  
			busiOrder.data.ooTimes = [];
			busiOrder.data.ooTimes.push(OrderInfo.offerSpec.ooTimes);
		}
		
		//所属人节点
		var ooOwners = {
			partyId : OrderInfo.cust.custId, //客户对象ID
			state : "ADD" //动作
		};
		busiOrder.data.ooOwners.push(ooOwners);
		
		//发展人
		var $tr = $("li[name='tr_"+OrderInfo.offerSpec.offerSpecId+"']");
		if($tr!=undefined){
			$tr.each(function(){   //遍历产品有几个发展人
				var dealer = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
					role:$(this).find("select[name='dealerType_"+OrderInfo.offerSpec.offerSpecId+"']").val(),
					value : $(this).find("input").attr("staffid"),
					//APP发展人渠道[W]
					channelNbr:$(this).find("select[name='dealerChannel_"+OrderInfo.offerSpec.offerSpecId+"']").val()
				};
				busiOrder.data.busiOrderAttrs.push(dealer);
				
				var dealer_name = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER_NAME,
					role:$(this).find("select[name='dealerType_"+OrderInfo.offerSpec.offerSpecId+"']").val(),
					value : $(this).find("input").attr("value") 
				};
				busiOrder.data.busiOrderAttrs.push(dealer_name);
			});
		}
		
		busiOrders.push(busiOrder);
		return busiOrder;
	};
	
	//创建产品节点
	var _createProd = function(prodId,prodSpecId) {	
		var busiOrder = {
			areaId : OrderInfo.getProdAreaId(prodId),  //受理地区ID
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq-- 
			}, 
			busiObj : { //业务对象节点
				objId : prodSpecId,  //业务对象ID
				instId : prodId, //业务对象实例ID
				isComp : "N"  //是否组合
				//accessNumber : "" //接入号码
			},  
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION,
				boActionTypeCd : "1"
			}, 
			data:{
				boProdFeeTypes : [], //付费方式节点
				boProdSpecs : [{
					prodSpecId : prodSpecId,
					state : 'ADD'
				}], //产品规格节点
				boCusts : [],  //客户信息节点		
				boProdItems : [], //产品属性节点
				boProdPasswords : [], //产品密码节点
				boProdAns : [], //号码信息节点
				//boProd2Tds : [], //UIM卡节点信息
				bo2Coupons : [],  //物品信息节点
				boAccountRelas : [], //帐户关联关系节
				boProdStatuses : [], //产品状态节点
				busiOrderAttrs : [] //订单属性节点
			}
		};
		
		var prodStatus = CONST.PROD_STATUS_CD.NORMAL_PROD;
		//封装产品状态节点
		busiOrder.data.boProdStatuses.push({
			state : "ADD",
			prodStatusCd : prodStatus
		});	
			
		//封装号码信息节点
		var boProdAns = OrderInfo.boProdAns;
		for ( var i = 0; i < boProdAns.length; i++) {
			if(boProdAns[i].prodId==prodId){
				busiOrder.data.boProdAns.push(boProdAns[i]);
				busiOrder.busiObj.accessNumber = boProdAns[i].accessNumber;
				break;
			}
		}
		
		//封装UIM卡信息节点
		var boProd2Tds = OrderInfo.boProd2Tds;
		for ( var i = 0; i < boProd2Tds.length; i++) {
			if(boProd2Tds[i].prodId==prodId){
				busiOrder.data.bo2Coupons.push(boProd2Tds[i]);
				break;
			}
		}
		
		//封装客户与产品之间的关系信息
		busiOrder.data.boCusts.push({
			partyId	: OrderInfo.cust.custId, //客户ID
			partyProductRelaRoleCd : "0", //客户与产品之间的关系（担保关系）
			state : "ADD" //动作
		});
		
		//封装产品密码
		var pwd=$("#pwd_"+prodId).val();
		if(pwd=="******"||OrderInfo.actionFlag==1){
			pwd = order.main.genRandPass6();
		}
		var boProdPassword = {
			prodPwTypeCd : 2, //密码类型
			pwd : pwd, //密码
			state : "ADD"  //动作
		};
		busiOrder.data.boProdPasswords.push(boProdPassword);
		
		//封装产品属性
		$("[name=prodSpec_"+prodId+"]").each(function(){
			var itemSpecId=$(this).attr("id").split("_")[0];
			var val=$.trim($(this).val());
			if(val!=""&&val!=undefined){
				var prodSpecItem = {
					itemSpecId : itemSpecId,  //属性规格ID
					prodSpecItemId : OrderInfo.SEQ.itemSeq--, //产品属性实例ID
					state : "ADD", //动作
					value : val//属性值	
				};
				busiOrder.data.boProdItems.push(prodSpecItem);
			}
		});
		
		//封装付费方式
		//var paytype=$('select[name="pay_type_'+prodId+'"]').val(); 
		var paytype=$('select[name="pay_type_-1"]').val();  //先写死
		if(paytype!= undefined){
			busiOrder.data.boProdFeeTypes.push({
				feeType : paytype,
				state : "ADD"
			});
		}
		
		//发展人
		var $tr;
		var objInstId_dealer;
		if(OrderInfo.actionFlag==6){ //加装发展人根据产品
			objInstId_dealer = prodId;
		}else{
			objInstId_dealer = OrderInfo.offerSpec.offerSpecId;
		}
		
		//获取所有的发展人数据[W]
		$tr = $("#dealerTbody li[name='tr_"+objInstId_dealer+"']");
		
		if($tr!=undefined){
			 //遍历产品有几个发展人
			$tr.each(function(){  
				//编码
				var dealer = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
					role : $(this).find("select[name ='dealerType_"+objInstId_dealer+"']").val(),
					value : $(this).find("input").attr("staffid"),
					channelNbr : $(this).find("select[name ='dealerChannel_"+objInstId_dealer+"']").val()
				};
				busiOrder.data.busiOrderAttrs.push(dealer);
				
				//名称
				var dealer_name = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER_NAME,
					role : $(this).find("select[name ='dealerType_"+objInstId_dealer+"']").val(),
					value : $(this).find("input").attr("value") 
				};
				busiOrder.data.busiOrderAttrs.push(dealer_name);
			});
		}
		
		var acctId=-1;
		if(OrderInfo.acct!=undefined&&OrderInfo.acct.acctId!=undefined&&OrderInfo.acct.acctId!=null&&OrderInfo.acct.acctId!=""){//新装传帐户id
			acctId=OrderInfo.acct.acctId;
		}
		var acctCd = -1;
		if(acctId==undefined){
			acctId = -1;
			acctCd = -1;
		}else if(acctId<0 ){ //新增
			acctCd = acctId;
		}else{
			acctCd = OrderInfo.acct.acctcd;
		}
		
		var boAccountRela = {
			acctId : acctId,
			acctCd : acctCd,
			acctRelaTypeCd : "1", //帐户和产品关联原因
			chargeItemCd : "0", //帐户主要费用类型
			percent : "100", //付费比例
			priority : "1",  //付费优先级
			state : "ADD" //动作
		};
		
		busiOrder.data.boAccountRelas.push(boAccountRela);	
		return busiOrder;
	};
	
	//创建附属销售品节点
	var _createAttOffer = function(offerSpec,prodId,flag,busiOrders) {
		if(flag==1){  //退订附属
			offerSpec.offerTypeCd = 2;
			offerSpec.boActionTypeCd = CONST.BO_ACTION_TYPE.DEL_OFFER;
			OrderInfo.getOfferBusiOrder(busiOrders,offerSpec,prodId);
		}else if(flag==2){  //参数变更
			if(offerSpec.offerSpec.offerSpecParams!=undefined && offerSpec.offerSpec.offerSpecParams.length>0){  //销售参数节点
				offerSpec.offerTypeCd = 2;
				offerSpec.boActionTypeCd = CONST.BO_ACTION_TYPE.UPDATE_OFFER;
				OrderInfo.getOfferBusiOrder(busiOrders,offerSpec,prodId);
			}
			/*if(offerSpec.offerMembers!=undefined && offerSpec.offerMembers.length>0){ //设置功能产品参数	 
				for (var i = 0; i < offerSpec.offerMembers.length; i++) {
					var offerMember = offerSpec.offerMembers[i];
					if(offerMember.prodParamInfos.length >0){
						offerMember.boActionTypeCd = CONST.BO_ACTION_TYPE.PRODUCT_PARMS;
						offerMember.prodId = prodId;
						offerMember.prodSpecId = offerMember.objId;
						busiOrders.push(OrderInfo.getProdBusiOrder(offerMember));
					}
				}
			}*/
		}else{ //订购
			offerSpec.offerTypeCd = 2;
			offerSpec.boActionTypeCd = CONST.BO_ACTION_TYPE.BUY_OFFER;
			offerSpec.offerId = OrderInfo.SEQ.offerSeq--; 
			OrderInfo.getOfferBusiOrder(busiOrders,offerSpec,prodId);			
		}
	};
	
	//创建功能产品节点
	var _createServ = function(servSpec,prodId,flag,busiOrders) {
		servSpec.prodId = prodId;
		if(flag==1){  //退订附属
			servSpec.servClose = "Y";
			servSpec.boActionTypeCd = CONST.BO_ACTION_TYPE.SERV_OPEN;
			busiOrders.push(OrderInfo.getProdBusiOrder(servSpec));	
		}else if(flag==2){  //参数变更
			if(servSpec.prodSpecParams!=undefined && servSpec.prodSpecParams.length>0){  //设置功能产品参数	
				servSpec.boActionTypeCd = CONST.BO_ACTION_TYPE.PRODUCT_PARMS;
				servSpec.memberId = servSpec.servId;
				busiOrders.push(OrderInfo.getProdBusiOrder(servSpec));
			}
		}else{ //订购
			servSpec.servId = OrderInfo.SEQ.servSeq--;
			servSpec.boActionTypeCd = CONST.BO_ACTION_TYPE.SERV_OPEN;		
			busiOrders.push(OrderInfo.getProdBusiOrder(servSpec));	
		}
	};
	
	//改号
	var _changeNumber = function(busiOrders){
		var data = {};
		data.boProdAns = OrderInfo.boProdAns;
		OrderInfo.setProdModifyBusiOrder(busiOrders,data);
	};	
	
	//订单数据校验
	var _checkData = function() {	
		if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 6 || OrderInfo.actionFlag == 14 || (OrderInfo.actionFlag==2&&offerChange.newMemberFlag)){ //新装
			if(OrderInfo.cust.custId==""){
				$.alert("提示","客户信息不能为空！");
				return false ; 
			}
			//遍历主销售品构成
//			if(OrderInfo.order.dealerTypeList==undefined ||OrderInfo.order.dealerTypeList.length == 0 ){
//				$.alert("提示","发展人类型不能为空！");
//				return false ; 
//			}
			
			//纳入老用户判断主卡副卡账户一致
			if(ec.util.isArray(OrderInfo.oldprodAcctInfos)){
				for(var a=0;a<OrderInfo.oldprodAcctInfos.length;a++){
					var oldacctId = OrderInfo.oldprodAcctInfos[a].prodAcctInfos[0].acctId;
					var mainacctid = $("#acctSelect option:selected").val();
					if(oldacctId!=mainacctid){
						$.alert("提示","副卡和主卡的账户不一致！");
						return false ; 
					}
				}
			}
			
			if(order.service.oldMemberFlag){
				var paytype=$('select[name="pay_type_-1"]').val();
				var isNumberRight=0;
				var nowNum="";
				$.each(OrderInfo.oldprodInstInfos,function(){
					if(this.feeType.feeType!=paytype){
						isNumberRight=1;
						nowNum=this.accNbr;
						return;
					}
				});
				
				if(isNumberRight==1){
					//$.alert("提示",nowNum+"和主卡的付费类型不一致！");
				//	return false;
				}
			}
			
			//校验号码跟UIM卡
			for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
				var offerRole = OrderInfo.offerSpec.offerRoles[i];
				var prodInsts=OrderInfo.offerSpec.offerRoles[i].prodInsts;
				if(prodInsts!=undefined && prodInsts!=null && prodInsts!=""){
				for ( var j = 0; j < offerRole.prodInsts.length; j++) {
					var prodInst = offerRole.prodInsts[j];
					if(OrderInfo.actionFlag==2){
						var instid = '"'+prodInst.prodInstId+'"';
						if(prodInst.memberRoleCd=="401" && instid.indexOf("-")!=-1){
							var accNbr = OrderInfo.getProdAn(prodInst.prodInstId).accessNumber;
							if(accNbr==undefined || accNbr == ""){
								$.alert("信息提示","【接入产品("+offerRole.offerRoleName+")】号码不能为空！");
								return false;
							} 
							if(OrderInfo.getProdTd(prodInst.prodInstId)==""){
								$.alert("信息提示","【接入产品("+offerRole.offerRoleName+")】UIM卡不能为空！");
								$("#uim_txt_"+prodInst.prodInstId).css("border-color","red");
								return false;
							}
						}
					}else{
						var accNbr = OrderInfo.getProdAn(prodInst.prodInstId).accessNumber;
						
//						var password = $("#pwd_"+prodInst.prodInstId).val();
//						if(password!="******"){
//							if(!order.main.passwordCheckVal(password, accNbr)){
//								return false ;
//							}
//						}
						if(accNbr==undefined || accNbr == ""){
							$.alert("信息提示","【接入产品("+offerRole.offerRoleName+")】号码不能为空！");
							return false;
						} 
						if(OrderInfo.getProdTd(prodInst.prodInstId)==""){
							$.alert("信息提示","【接入产品("+offerRole.offerRoleName+")】UIM卡不能为空！");
							$("#uim_txt_"+prodInst.prodInstId).css("border-color","red");
							return false;
						}
					}
					//封装产品属性
					var flag = false;
					$("[name='pay_type_-1']").each(function(){
						if($(this).val()!= undefined&&$(this).val()!=null&&$(this).val()!=""){
							flag = true ;
						}
					});
					if(!flag){
						$.alert("信息提示","没有配置付费类型，无法提交");
						return false;
					}
					
					//校验必填的产品属性
					var prodAttrFlag = true;
					var checkName = null;
					$(OrderInfo.prodAttrs).each(function(){
						var isOptional = this.isOptional;
						var id = this.id;
						if(isOptional == "N" && id){
							var val=$.trim($("#"+id).val());
							if(val == "" || val == undefined){
								checkName = this.name;
								prodAttrFlag = false;
							}
						}
					});
					if(!prodAttrFlag){
						$.alert("信息提示","没有配置产品属性("+checkName+")，无法提交");
						return false;
					}
					
//					if(!order.main.templateTypeCheck()){
//						return false;
//					}
				}
			   }
			}
//			var acctId = $("#acctSelect").val();
//			if(acctId==undefined || $.trim(acctId)==""){
//				$.alert("提示","请新建或者查询选择一个可用帐户");
//				return false;
//			}
//			if(acctId<0){
//				//帐户信息填写校验
//				if(!_checkAcctInfo()){
//					return false;
//				}
//			}
		}
		
		//销售品更功能产品参数校验
		if(OrderInfo.actionFlag == 1||OrderInfo.actionFlag == 2||OrderInfo.actionFlag == 3
				|| OrderInfo.actionFlag == 6||OrderInfo.actionFlag == 14){
			//附属销售参数设置校验
			for ( var i = 0; i < AttachOffer.openList.length; i++) {
				var specList = AttachOffer.openList[i].specList;
				var roleName = OrderInfo.getOfferRoleName(AttachOffer.openList[i].prodId);
				for (var j = 0; j < specList.length; j++) {
					var spec = specList[j];
					if(spec.isdel!="Y" && spec.isdel!="C"){
						if(spec.ifParams){  //销售参数节点
							if(spec.isset !="Y"){
//								$.alert("提示",roleName+" "+spec.offerSpecName+"：参数未设置");
//								return false ; 
							}
						}
					}
				}
			}
			//功能产品参数设置校验
			for ( var i = 0; i < AttachOffer.openServList.length; i++) {
				var specList = AttachOffer.openServList[i].servSpecList;
				var roleName = OrderInfo.getOfferRoleName(AttachOffer.openServList[i].prodId);
				for (var j = 0; j < specList.length; j++) {
					var spec = specList[j];
					if(spec.isdel!="Y" && spec.isdel!="C"){
						if(spec.servSpecId==CONST.PROD_SPEC_ID.MIFI_ID && CONST.APP_DESC==0){
							if("no"==$("#isMIFI_-"+(i+1)).val()){
								$.alert("提示","要开通"+spec.servSpecName+"功能，请选择4G上网卡-全球卡（MIFI卡）！");
								$("#uim_txt_-"+(i+1)).css("border-color","red");
								return false ; 
							}
						}
						if(spec.ifParams=="Y"){  //销售参数节点
							if(spec.isset !="Y"){
//								$.alert("提示",roleName+" "+spec.servSpecName+"：参数未设置");
//								return false ; 
							}
						}
					}
				}
			}
			//附属销售参数终端校验
			for ( var i = 0; i < AttachOffer.openList.length; i++) {
				var specList = AttachOffer.openList[i].specList;
				var prodId = AttachOffer.openList[i].prodId;
				var roleName = OrderInfo.getOfferRoleName(prodId);
				for (var j = 0; j < specList.length; j++) {
					var spec = specList[j];
					if(spec.isdel!="Y" && spec.isdel!="C"){
						if(spec.isTerminal==1){  //1表示有终端
							var flag = true;
							$.each(OrderInfo.attach2Coupons,function(){
								if(spec.offerSpecId == this.attachSepcId && prodId==this.prodId){
									flag = false;
									return false;
								}	
							});
							if(flag){
								$.alert("提示",roleName+" "+spec.offerSpecName+"：终端信息未填写");
								return false ; 
							}
						}
					}
				}
			}
		}
		
		//套餐变更,可选包变更，补换卡校验
		if(CONST.getAppDesc()==0){
			if(OrderInfo.actionFlag == 2 ){ //套餐变更补换卡校验
				for ( var i = 0; i < OrderInfo.offer.offerMemberInfos.length; i++) {
					var member = OrderInfo.offer.offerMemberInfos[i];
					if(member.objType == CONST.OBJ_TYPE.PROD){  //接入产品
						if(AttachOffer.isChangeUim(member.objInstId)){
							var td = OrderInfo.getProdTd(member.objInstId);
							if(td==""){
								$.alert("提示",member.roleName+" UIM卡不能为空！");
								return false ; 
							}
						}
					}
				}
				var oldMemberUimFlag = true;
				if(offerChange.oldMemberFlag){
					for ( var i = 0; i < OrderInfo.oldoffer.length; i++) {
						$.each(OrderInfo.oldoffer[i].offerMemberInfos,function(){
							var member = this;
							if(member.objType == CONST.OBJ_TYPE.PROD){  //接入产品
								if(AttachOffer.isChangeUim(member.objInstId)){
									var td = OrderInfo.getProdTd(member.objInstId);
									if(td==""){
										$.alert("提示","加装移动电话"+member.accessNumber+" UIM卡不能为空！");
										oldMemberUimFlag = false;
										return false ; 
									}
								}
							}
						});
						if(!oldMemberUimFlag){
							break;
						}
					}
					if(!oldMemberUimFlag){
						return;
					}
				}
			}else if(OrderInfo.actionFlag == 3){ //可选包变更补换卡校验
				if(AttachOffer.isChangeUim()){
					if(OrderInfo.boProd2Tds.length==0){
						$.alert("提示","UIM卡不能为空！");
						return false ; 
					}
				}
			}
		}
		
		//补换卡校验
		if(OrderInfo.actionFlag == 22 || OrderInfo.actionFlag == 23){
			if(OrderInfo.boProd2OldTds.length==0){
				$.alert("提示","原UIM卡信息为空！");
				return false ; 
			}
			if(OrderInfo.boProd2Tds.length==0){
				$.alert("提示","UIM卡不能为空！");
				return false ; 
			}
		}
		
		//开通4G功能产品时，需要校验UIM，终端是否是4G
		if(CONST.getAppDesc()==0){
			for ( var i = 0; i < AttachOffer.openServList.length; i++) {
				var specList = AttachOffer.openServList[i].servSpecList;
				var flag = false;//是否开通4G上网功能产品
				var isTerminal=false;//是否有终端
				$.each(specList,function(){//遍历是否有开通4G上网功能
					if(this.servSpecId == CONST.PROD_SPEC.PROD_FUN_4G && this.isdel != "Y" && this.isdel != "C"){ //开通4G功能产品
						flag = true;
						return false;
					}
				});
				var prodId=AttachOffer.openServList[i].prodId;
				var termTypeFlag="";//终端类型
				
				if(AttachOffer.openList[i]!=undefined){
					var specListTemp = AttachOffer.openList[i].specList;
					for (var j = 0; j < specListTemp.length; j++) {
						var spec = specListTemp[j];
						if(spec.isdel!="Y" && spec.isdel!="C"){
							if(spec.isTerminal==1){  //1表示有终端
								$.each(OrderInfo.attach2Coupons,function(){//遍历是否有终端
									if(prodId==this.prodId){//有终端信息
										isTerminal = true;
										if(ec.util.isObj(this.termTypeFlag)){
											termTypeFlag=this.termTypeFlag;
										}
										return false;
									}	
								});
							}
						}
					}
				}
				
				var roleName = OrderInfo.getOfferRoleName(prodId);
				if(isTerminal && termTypeFlag==""){
					$.alert("信息提示",roleName+"中,营销资源未返回终端机型，无法判断是3G终端还是4G终端!");
					return false;
				}
				
				if(flag){ //该产品已经开通4G功能产品，需要做4G卡终端校验
					if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 6 || OrderInfo.actionFlag == 14){ //新装
						var uim = OrderInfo.getProdUim(prodId);
						if(uim.cardTypeFlag=="2"){ //3g卡
							$.alert("信息提示",roleName+"中UIM卡是3G卡，无法提交");
							return false;
						}
						if(isTerminal && termTypeFlag=="2"){
							$.alert("信息提示",roleName+"中终端是3G机型，无法提交");
							return false;
						}
					}else if(OrderInfo.actionFlag == 2 || OrderInfo.actionFlag == 3 ){
						var oldUim = OrderInfo.getProdOldUim(prodId);
						if(oldUim.is4GCard!="Y"){//旧卡不是4G卡 就判断新卡是否是4G卡
							var uim = OrderInfo.getProdUim(prodId);
							if(uim.cardTypeFlag=="2"){
								$.alert("信息提示",roleName+"中UIM卡是3G卡，无法提交");
								return false;
							}
						}
						if(isTerminal && termTypeFlag=="2"){
							$.alert("信息提示",roleName+"中终端是3G机型，无法提交");
							return false;
						}
					}
				}else{//没有开通4G功能产品 就判断UIM卡和终端的类型要一致，4G终端匹配4GUIM卡 3G终端匹配3GUIM卡
					if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 6 || OrderInfo.actionFlag == 14){ //新装
						if(isTerminal){
							var uim = OrderInfo.getProdUim(prodId);
							if(uim.cardTypeFlag!=termTypeFlag){ //终端和卡不匹配
								var uimtype=uim.cardTypeFlag=="1"?"4G卡":"3G卡";
								var termtype=termTypeFlag=="1"?"4G机型":"3G机型";
								$.alert("信息提示",roleName+"中UIM卡是"+uimtype+" 终端是"+termtype+"，无法提交");
								return false;
							}
						}
					}else if(OrderInfo.actionFlag == 2 || OrderInfo.actionFlag == 3 ){
						if(isTerminal){
							var currentUimCoupon = OrderInfo.getProdUim(prodId); //当前uim卡物品信息，做套餐变更或可选包变更时可能带出补换卡业务，提交时使用新的uim检验终端
							if(ec.util.isObj(currentUimCoupon) && ec.util.isObj(currentUimCoupon.cardTypeFlag)){ //补换卡
								if(currentUimCoupon.cardTypeFlag=="2" && termTypeFlag=="1"){ 
									$.alert("信息提示",roleName+"中UIM卡是3G卡 终端是4G机型，无法提交");
									return false;
								}
								if(currentUimCoupon.cardTypeFlag=="1" && termTypeFlag=="2"){ 
									$.alert("信息提示",roleName+"中UIM卡是4G卡 终端是3G机型，无法提交");
									return false;
								}
							} else {  //未做补换卡
								var oldUim = OrderInfo.getProdOldUim(prodId);
								if(ec.util.isObj(oldUim.is4GCard)){
									if(oldUim.is4GCard!="Y"){//旧卡不是4G卡 
										if(termTypeFlag=="1"){
											$.alert("信息提示",roleName+"中UIM卡是3G卡 终端是4G机型，无法提交");
											return false; 
										}
									}else{
										if(termTypeFlag=="2"){
											$.alert("信息提示",roleName+"中UIM卡是4G卡 终端是3G机型，无法提交");
											return false;
										}
									}
								}
							}
							
						}
					}
				}
			}
		}
		
		return true; 
	};
	//帐户信息填写校验公用方法（新装，过户，帐户信息修改，改帐务定制关系）
	var _checkAcctInfo = function(){
		if($.trim($("#acctName").val())==""){
			$.alert("提示","帐户名称不能为空");
			return false;
		}
		if($("#paymentType").val()==110000){
			if($("#bankId").val()=="" || $.trim($("#bankAcct").val())=="" || $.trim($("#paymentMan").val())==""){
				$.alert("提示","若选择银行支付请填写必要的银行支付信息");
				return false;
			}
		}			
		if($("#postType").val()!=-1){
			if($.trim($("#postAddress").val())==""){
				$.alert("提示","若选择投递账单请填写必要的账单投递信息");
				return false;
			}
			if($("#postType").val()==13){
				var EmailType = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/; // /^[^\.@]+@[^\.@]+\.[a-z]+$/;
				if(EmailType.test($("#postAddress").val())==false){
					$.alert("提示","若选择 Email 投递帐单请输入有效的 Email 地址");
					return false;
				}
			}
		}
		return true;
	};
	
	//修改资源状态
	var _updateResState= function() {
		var resources  = [];
		for (var i = 0; i < OrderInfo.boProdAns.length; i++) {	
			var res = {
				accNbr :OrderInfo.boProdAns[i].accessNumber,
				accNbrType : 1,  //号码类型（1手机号码2.UIM卡）
				action : "UPDATE"
			};
			resources.push(res);
		}
		for (var i = 0; i < OrderInfo.boProd2Tds.length; i++) {
			var res = {
				accNbr :OrderInfo.boProd2Tds[i].terminalCode,
				accNbrType : 2,  //号码类型（1手机号码2.UIM卡）
				action : "UPDATE"
			};
			resources.push(res);
		}
		if(resources.length>0){
			var url= contextPath+"/common/updateResState";	 
			$.callServiceAsJsonGet(url,{strParam:JSON.stringify(resources)},{
				"done" : function(response){
					if (response.code==0) {
						if(response.data){
						}
					}
				}
			});	
		}
	};
	
	//显示模板名称
	var _showTemplateOrderName = function(id){
		if($("#isTemplateOrder").attr("checked")=="checked"){
			if(OrderInfo.actionFlag==1||OrderInfo.actionFlag==14){
				$(".template_info_type").show();
				$("#isActivation").removeAttr("checked");
				$("#isActivation").attr("disabled","disabled");
				//$("#templateTypeDiv").show();
				//$("#templateOrderName").show();
				//$("#templateOrderTitle").show();
			}
			$(".template_info_name").show();
		}else {
			$(".template_info_name").hide();
			$(".template_info_type").hide();
			$("#templateOrderName").val("");
			$("#isActivation").removeAttr("disabled");
			//$("#templateOrderTitle").hide();
			//$("#templateTypeDiv").hide();
			//$("#templateOrderName").val("");	
		}
	};
	
	//首话单激活
	var _showActivation = function(){
		if($("#isActivation").attr("checked")=="checked"){
			$("#isTemplateOrder").removeAttr("checked");
			$("#isTemplateOrder").attr("disabled","disabled");
			$(".template_info_name").hide();
			$(".template_info_type").hide();
			$("#templateOrderName").val("");
		}else {
			$("#isTemplateOrder").removeAttr("disabled");
		}
	};
	
	//重新排列offerRole 把按顺序把主卡角色提前
	var _sortOfferSpec = function(offerSpec){
		var tmpOfferSpecRole = [];
		for ( var i = 0; i < offerSpec.offerRoles.length; i++) {
			var offerRole = offerSpec.offerRoles[i];
			if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD){ //主卡
				tmpOfferSpecRole.push(offerRole);
			}
		}
		for ( var i = 0; i < offerSpec.offerRoles.length; i++) {
			var offerRole = offerSpec.offerRoles[i];
			if(offerRole.memberRoleCd!=CONST.MEMBER_ROLE_CD.MAIN_CARD){
				tmpOfferSpecRole.push(offerRole);
			}
		}
		offerSpec.offerRoles = tmpOfferSpecRole;
		return offerSpec;
	};
	
	var _checkOrder=function(){
		var flag = false;
		var prodClass = order.prodModify.choosedProdInfo.prodClass; //可选包变更
		var prodId = order.prodModify.choosedProdInfo.prodInstId;
		var specList=CacheData.getOfferSpecList(prodId);
		if(ec.util.isArray(specList)){
			$.each(specList,function(){
				if(this.ifPackage4G=="Y" && this.isdel != "Y" && this.isdel != "C"){ //是否有开通4g流量包
					flag = true;
					return false;
				}
			});
		}
		if(CONST.getAppDesc()==0 && flag && prodClass==CONST.PROD_CLASS.THREE && OrderInfo.actionFlag==3){//可选包变更 且是3G用户套餐 开通了4G流量包 必须进行省预校验
			if(offerChange.checkOrder()){//省预校验
				var content=offerChange.checkAttachOffer(prodId);
				if(content!=""){
					if(_checkData()){
						$("#offer_serv").html(content);
						easyDialog.open({
							container : 'offer_dialog'
						});
					}
//					$.confirm("信息确认",content,{ 
//						yesdo:function(){
//							if(_checkData()){
//								AttachOffer.setChangeList(prodId);
//								SoOrder.submitOrder();
//							}
//						},
//						no:function(){
//						}
//					});
				}else{
					SoOrder.submitOrder();
				}
			}
		}else{
			SoOrder.submitOrder();
		}
	};
	var _orderPrepare=function(){
		var prodId = order.prodModify.choosedProdInfo.prodInstId;
		AttachOffer.setChangeList(prodId);
		SoOrder.submitOrder();
		easyDialog.close();
	};
	
	//判断是否是3G转4G
	var _setOfferType=function(){
		var oldType=order.prodModify.choosedProdInfo.is3G;
		if(OrderInfo.actionFlag==2){
			var newType=OrderInfo.offerSpec.is3G;
			if(ec.util.isObj(oldType)){
				if(ec.util.isObj(newType)){
					if(oldType=="Y"&&newType=="N"){
						return true;
					}
				}
			}
		}else if(OrderInfo.actionFlag==3){
			if(ec.util.isObj(oldType)){
				if(oldType=="Y"){
					for ( var i = 0; i < AttachOffer.openServList.length; i++) {
						var specList = AttachOffer.openServList[i].servSpecList;
						var flag = false;//是否开通4G上网功能产品
						$.each(specList,function(){//遍历是否有开通4G上网功能
							if(this.servSpecId == CONST.PROD_SPEC.PROD_FUN_4G && this.isdel != "Y" && this.isdel != "C"){ //开通4G功能产品
								flag = true;
								return false;
							}
						});
						if(flag){
							return true;
						}
					}
				}
			}
		}
		return false;
	};
	
	//弹出确定框
	var _showAlertDialog=function(title,content){
		$("#modal-title").html(title);
		$("#modal-content").html(content);
		$("#alert-modal").modal('show');
	};
	return {
		builder 				: _builder,
		createAttOffer  		: _createAttOffer,
		createServ				: _createServ,
		delOrder 				: _delOrder,
		delAndNew				: _delAndNew,
		getOrderInfo 			: _getOrderInfo,
		getToken				: _getToken,
		getTokenSynchronize     : _getTokenSynchronize,
		initFillPage			: _initFillPage,
		initOrderData			: _initOrderData,
		orderBack				: _orderBack,
		step					: _step,
		showStep				: _showStep,
		submitOrder 			: _submitOrder,
		showAlertDialog			: _showAlertDialog,
		checkAcctInfo  			: _checkAcctInfo,
		showTemplateOrderName   : _showTemplateOrderName,
		sortOfferSpec			: _sortOfferSpec,
		updateResState			: _updateResState,
		delOrderBegin			: _delOrderBegin,
		delOrderSilent			: _delOrderSilent,
		delOrderFin				: _delOrderFin,
		showActivation			: _showActivation,
		checkOrder				: _checkOrder,
		orderPrepare			: _orderPrepare,
		checkData               :  _checkData,
		createProd				: _createProd
	};
})();
/**
 * 附属销售品受理对象
 * 
 * @author wukf
 * date 2013-08-22
 */
CommonUtils.regNamespace("AttachOffer");

/** 附属销售品受理对象*/
AttachOffer = (function() {

	var _openList = []; //保存已经选择的附属销售品列表，保存附属销售品完整节点，以及参数值
	
	var _openedList = []; //已经订购的附属销售品列表，保存附属销售品完整节点，以及参数值
	
	var _openServList = []; //保存已经选择功能产品列表，保存附属销售品完整节点，以及参数值
	
	var _openedServList = []; //保存已经订购功能产品列表，保存附属销售品完整节点，以及参数值
	
	var _openAppList = []; //保存产品下增值业务
	
	var _changeList = []; //3g订购4g流量包订单提交预校验时，保存修改缓存列表的修改数据，用于订单确认页面返回的反向操作
	
	var _labelList = []; //标签列表
	
	var checkedReserveNbr = "";//已经校验过的终端预约号
	
	var checkedReserveCode = "";//已经校验过的终端预约码
	
	var checkedOfferSpec = []; //已经校验过的终端预约号对应的促销包
	
	var totalNums=0;//记录总共添加了多少个终端输入框
	//初始化附属销售页面
	var _init = function(){
		var prodInfo = order.prodModify.choosedProdInfo;
		if(prodInfo.prodStateCd!=CONST.PROD_STATUS_CD.NORMAL_PROD){
			$.alert("提示","请选择一个在用产品");
			return;
		}
		OrderInfo.actionFlag = 3;
		query.offer.setOffer(function(){
			if(!rule.rule.ruleCheck()){ //规则校验失败
				return;
			}
			var param = {
					offerSpecId : prodInfo.prodOfferId,
					offerTypeCd : 1,
					partyId: OrderInfo.cust.custId
			};
			if(ec.util.isObj(prodInfo.prodOfferId)){
				if(!query.offer.queryMainOfferSpec(param)){ //查询主套餐规格构成，并且保存
					return;
				}
			}else{
				OrderInfo.offerSpec = {};
			}
			if(CONST.getAppDesc()==0){ //4g系统需要
				if(!prod.uim.setProdUim()){ //根据UIM类型，设置产品是3G还是4G，并且保存旧卡
					return;	
				}
			}
			AttachOffer.queryAttachOffer();
		});
//		if(!query.offer.setOffer()){ //必须先保存销售品实例构成，加载实例到缓存要使用
//			return ;
//		}
		
	}; 
	
	//可订购的附属查询 
	var _queryAttachOfferSpec = function(param) {
		//将异步加载方法改成同步，要不加载order.main.callBackBuildView 获取不到缓存
		var data = query.offer.queryAttachSpec(param);
		if(data){
			$("#attach_"+param.prodId).html(data);
			_showMainRoleProd(param.prodId); //通过主套餐成员显示角字
			
			//根据已选功能产品查询带出的可选包[W]
			var servSpecIds = [];
			if(AttachOffer.openServList!=null && AttachOffer.openServList!=undefined){
				$.each(AttachOffer.openServList,function(){
					if(this.prodId == param.prodId){
						var servSpecList = this.servSpecList;
						if(servSpecList!=null && servSpecList!=undefined){
							$.each(servSpecList,function(){
								if(this.servSpecId!=null&&this.servSpecId!=undefined){
									servSpecIds.push(this.servSpecId);
								}
							});
						}
					}
				});					
			}
			
			if(servSpecIds.length>0){
				param.servSpecIds = servSpecIds;
				var queryData = query.offer.queryServSpecPost(param);
				if(queryData!=null && queryData.resultCode==0){
					if(queryData.result.offerList!=null && queryData.result.offerList!=undefined){
						$.each(queryData.result.offerList,function(){
							AttachOffer.addOpenList(param.prodId,this.offerSpecId); 
						});
					}					
				}	
			}
			
			AttachOffer.changeLabel(param.prodId,param.prodSpecId,"100"); //初始化第一个标签附属
			if(param.prodId==-1 && OrderInfo.actionFlag==14){ //合约计划特殊处理
				AttachOffer.addOpenList(param.prodId,mktRes.terminal.offerSpecId);
			}
		}
/*		query.offer.queryAttachSpec(param,function(data){
			if (data) {
				$("#attach_"+param.prodId).html(data);
				_showMainRoleProd(param.prodId); //通过主套餐成员显示角字
				AttachOffer.changeLabel(param.prodId,param.prodSpecId,"100"); //初始化第一个标签附属
				if(param.prodId==-1 && OrderInfo.actionFlag==14){ //合约计划特殊处理
					AttachOffer.addOpenList(param.prodId,mktRes.terminal.offerSpecId);
				}
			}
		});*/
	};
	
	//显示增值业务内容
	var _showApp = function(prodId){
		var appList = CacheData.getOpenAppList(prodId);
		var content = CacheData.getAppContent(prodId,appList);
		$.confirm("增值业务设置： ",content[0].innerHTML,{ 
			yes:function(){	
				$.each(appList,function(){
					if($("#"+prodId+"_"+this.objId).attr("checked")=="checked"){
						this.dfQty = 1;
					}else{
						this.dfQty = 0;
					}
				});
			},
			no:function(){
			}
		});
	};
	
	//获取产品实例
	var getProdInst = function(prodId){
		for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
			var offerRole = OrderInfo.offerSpec.offerRoles[i];
			if(ec.util.isArray(offerRole.prodInsts)){
				for ( var j = 0; j < offerRole.prodInsts.length; j++) {  //遍历产品实例列表
					if(offerRole.prodInsts[j].prodInstId==prodId){
						return offerRole.prodInsts[j];
					}
				}
			}
		}
	};
	
	//主销售品角色分解个每个接入产品
	var _showMainRoleProd = function(prodId){
		var prodInst = getProdInst(prodId);
		var app = {
			prodId:prodId,
			appList:[]
		};
		AttachOffer.openAppList.push(app);
		for (var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
			var offerRole = OrderInfo.offerSpec.offerRoles[i];
			if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.CONTENT){ //增值业务角色
				for ( var j = 0; j < offerRole.roleObjs.length; j++) {
					var roleObj = offerRole.roleObjs[j];
					if(roleObj.objType== CONST.OBJ_TYPE.SERV){
						if(prodInst.objId==roleObj.parentProdId && prodInst.componentTypeCd.substring(0,1)==roleObj.componentTypeCd.substring(0,1)){	
							app.appList.push(roleObj);
							if(roleObj.servSpecId==undefined){
								roleObj.servSpecId = roleObj.objId;
							}
							if(roleObj.servSpecName==undefined){
								roleObj.servSpecName = roleObj.objName;
							}
						}
					}
				}
				if(app.appList.length>0){
					var $li = $('<li id="li_'+prodId+'_'+offerRole.offerRoleId+'"></li>');
					$li.append('<dd class="mustchoose" ></dd>');	
					$li.append('<span>'+offerRole.offerRoleName+'</span>');
					$li.append('<dd id="can_'+prodId+'_'+offerRole.offerRoleId+'" class="gou2" onclick="AttachOffer.showApp('+prodId+');"></dd>');
					$("#open_app_ul_"+prodId).append($li);
				}
			}else{ 
				if(offerRole.prodInsts==undefined){
					continue;
				}
				$.each(offerRole.prodInsts,function(){  //遍历产品实例列表
					if(this.prodInstId==prodId){
						for (var k = 0; k < offerRole.roleObjs.length; k++) {
							var roleObj = offerRole.roleObjs[k];
							if(roleObj.objType==CONST.OBJ_TYPE.SERV){
								var servSpecId = roleObj.objId;
								var $oldLi = $('#li_'+prodId+'_'+servSpecId);
								var spec = CacheData.getServSpec(prodId,servSpecId);//从已选择功能产品中找
								if(spec != undefined){
									if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14){
										if(roleObj.dfQty == 0 && spec.ifDault==1){//在基础功能中没有选中的默认删除状态 
											var $span=$oldLi.find("span");
											$span.addClass("del");
											spec.isdel = "Y";
										}
									}
									if(roleObj.minQty==1){
										$oldLi.removeAttr("onclick");
										var $span = $("#span_"+prodId+"_"+spec.servSpecId);
										var $span_remove = $("#span_remove_"+prodId+"_"+spec.servSpecId);
										if(ec.util.isObj($span)){
											$span.removeClass("del");
										}
										if(ec.util.isObj($span_remove)){
											$span_remove.hide();
										}
									}
//									$oldLi.append('<dd id="jue_'+prodId+'_'+servSpecId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
									continue;
								}
								var serv = CacheData.getServBySpecId(prodId,servSpecId);//从已订购功能产品中找
								if(serv!=undefined){ //不在已经开跟已经选里面
									var $oldLi = $('#li_'+prodId+'_'+serv.servId);
									if(roleObj.minQty==1){
										var $span = $("#span_"+prodId+"_"+offer.servId);
										var $span_remove = $("#span_remove_"+prodId+"_"+offer.servId);
										if(ec.util.isObj($span)){
											$span.removeClass("del");
										}
										if(ec.util.isObj($span_remove)){
											$span_remove.hide();
										}
										$oldLi.removeAttr("onclick");
									}
//									$oldLi.append('<dd id="jue_'+prodId+'_'+serv.servId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
									continue;
								}
								if(roleObj.dfQty > 0){ //必选，或者默选
									var servSpec=jQuery.extend(true, {}, roleObj);
									CacheData.setServSpec(prodId,servSpec); //添加到已开通列表里
									spec = servSpec;
									if(ec.util.isArray(spec.prodSpecParams)){
										spec.ifParams = "Y";
									}
									$('#li_'+prodId+'_'+servSpecId).remove(); //删除可开通功能产品里面
									var $li = $('<a id="li_'+prodId+'_'+servSpecId+'" onclick="AttachOffer.closeServSpec('+prodId+','+servSpecId+',\''+spec.servSpecName+'\',\''+spec.ifParams+'\')" class="list-group-item"></a>');
									$li.append('<span id="span_'+prodId+'_'+servSpecId+'">'+spec.servSpecName+'</span>');
									if(roleObj.minQty==0){
										$li.append('<span id="span_remove_'+prodId+'_'+servSpecId+'" class="glyphicon glyphicon-remove pull-right" aria-hidden="true"></span>');
									}else{
										$li.removeAttr("onclick");
									}
//									if (spec.ifParams=="Y"){
//										if(CacheData.setServParam(prodId,spec)){ 
//											$li.append('<dd id="can_'+prodId+'_'+servSpecId+'" class="canshu2" onclick="AttachOffer.showServParam('+prodId+','+servSpecId+');"></dd>');
//										}else {
//											$li.append('<dd id="can_'+prodId+'_'+servSpecId+'" class="canshu" onclick="AttachOffer.showServParam('+prodId+','+servSpecId+');"></dd>');
//										}
//									}
//									$li.append('<dd id="jue_'+prodId+'_'+servSpecId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
									$("#open_serv_ul_"+prodId).append($li);
									spec.isdel = "N";
									_showHideUim(0,prodId,servSpecId);//显示或者隐藏补换卡
								}
							}
						}
					}
				});
			}
		}
	};
	
	var _showMainMemberRoleProd=function(prodId){
		for (var i = 0; i < OrderInfo.viceOfferSpec.length; i++) {//多张副卡同时进行套餐变更
			var offerSpec=OrderInfo.viceOfferSpec[i];
			if(prodId==offerSpec.prodId){
				for (var j = 0; j < offerSpec.offerRoles.length; j++) {
					var offerRole = offerSpec.offerRoles[j];
					if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){//主卡
						for (var k = 0; k < offerRole.roleObjs.length; k++) {
							var roleObj = offerRole.roleObjs[k];
							if(roleObj.objType==CONST.OBJ_TYPE.SERV){
								var servSpecId = roleObj.objId;
								var $oldLi = $('#li_'+prodId+'_'+servSpecId);
								var spec = CacheData.getServSpec(prodId,servSpecId);//从已选择功能产品中找
								if(spec != undefined){
									if(roleObj.minQty==1){
										$oldLi.append('<dd class="mustchoose"></dd>');
									}
									$oldLi.append('<dd id="jue_'+prodId+'_'+servSpecId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
									continue;
								}
								var serv = CacheData.getServBySpecId(prodId,servSpecId);//从已订购功能产品中找
								if(serv!=undefined){ //不在已经开跟已经选里面
									var $oldLi = $('#li_'+prodId+'_'+serv.servId);
									if(roleObj.minQty==1){
										$oldLi.append('<dd class="mustchoose"></dd>');
									}
									$oldLi.append('<dd id="jue_'+prodId+'_'+serv.servId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
									continue;
								}
								if(roleObj.dfQty > 0){ //必选，或者默选
									var servSpec=jQuery.extend(true, {}, roleObj);
									CacheData.setServSpec(prodId,servSpec); //添加到已开通列表里
									spec = servSpec;
									if(ec.util.isArray(spec.prodSpecParams)){
										spec.ifParams = "Y";
									}
									$('#li_'+prodId+'_'+servSpecId).remove(); //删除可开通功能产品里面
									var $li = $('<li id="li_'+prodId+'_'+servSpecId+'"></li>');
									if(roleObj.minQty==0){
										$li.append('<dd class="delete" onclick="AttachOffer.closeServSpec('+prodId+','+servSpecId+',\''+spec.servSpecName+'\',\''+spec.ifParams+'\')"></dd>');
									}else{
										$li.append('<dd class="mustchoose"></dd>');
									}
									$li.append('<span>'+spec.servSpecName+'</span>');
									if (spec.ifParams=="Y"){
										if(CacheData.setServParam(prodId,spec)){ 
											$li.append('<dd id="can_'+prodId+'_'+servSpecId+'" class="canshu2" onclick="AttachOffer.showServParam('+prodId+','+servSpecId+');"></dd>');
										}else {
											$li.append('<dd id="can_'+prodId+'_'+servSpecId+'" class="canshu" onclick="AttachOffer.showServParam('+prodId+','+servSpecId+');"></dd>');
										}
									}
									$li.append('<dd id="jue_'+prodId+'_'+servSpecId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
									$("#open_serv_ul_"+prodId).append($li);
									spec.isdel = "N";
									_showHideUim(0,prodId,servSpecId);//显示或者隐藏补换卡
								}
							}
						}
					}
				}
			}
		}
	};
	
	//查询附属销售品规格
	var _searchAttachOfferSpec = function(prodId,offerSpecId,prodSpecId) {
		var param = {   
			prodId : prodId,
		    prodSpecId : prodSpecId,
		    offerSpecIds : [offerSpecId],
		    ifCommonUse : "" 
		};
//		if(OrderInfo.actionFlag == 2){ //套餐变更		
//			param.offerSpecIds=[OrderInfo.offerSpec.offerSpecId];
//		}
		if(OrderInfo.actionFlag == 2){ //套餐变更		
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				if(ec.util.isArray(this.prodInsts)){
					$.each(this.prodInsts,function(){
						if(this.prodInstId==prodId){
							param.acctNbr = this.accessNumber;
							param.offerRoleId = this.offerRoleId;
							param.offerSpecIds.push(OrderInfo.offerSpec.offerSpecId);	
							return false;
						}
					});
				}
			});
		}else if(OrderInfo.actionFlag == 3){  //可选包
			var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
			param.acctNbr = prodInfo.accNbr;
			if(!ec.util.isObj(prodInfo.prodOfferId)){
				prodInfo.prodOfferId = "";
			}
			var offerRoleId = CacheData.getOfferMember(prodInfo.prodInstId).offerRoleId;
			if(offerRoleId==undefined){
				offerRoleId = "";
			}
			param.offerRoleId = offerRoleId;
			param.offerSpecIds.push(prodInfo.prodOfferId);
		}else if(OrderInfo.actionFlag == 21){ //副卡套餐变更		
			$.each(OrderInfo.viceOfferSpec,function(){
				var offerSpecId=this.offerSpecId;
				var accessNumber=this.accessnumber;
				if(this.prodId==prodId){
					$.each(this.offerRoles,function(){
						if(this.memberRoleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD || this.memberRoleCd=="1"){
							$.each(this.roleObjs,function(){
								if(this.objType==CONST.OBJ_TYPE.PROD){
									param.acctNbr = accessNumber;
									param.offerRoleId = this.offerRoleId;
									param.offerSpecIds.push(offerSpecId);	
									return false;
								}
							});
						}
					});
				}
			});
		}else if(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6){//主副卡纳入老用户
			for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
				if(prodId==OrderInfo.oldprodInstInfos[i].prodInstId){
					param.acctNbr = OrderInfo.oldprodInstInfos[i].accNbr;
					$.each(OrderInfo.oldofferSpec,function(){
						if(this.accNbr==OrderInfo.oldprodInstInfos[i].accNbr){
							param.offerSpecIds.push(this.offerSpec.offerSpecId);	
							$.each(this.offerSpec.offerRoles,function(){
								if(this.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){
									param.offerRoleId = this.offerRoleId;
								}
							});
						}
					});
				}
			}
		}else { //新装
			param.offerSpecIds.push(OrderInfo.offerSpec.offerSpecId);
			var prodInst = OrderInfo.getProdInst(prodId);
			if(prodInst){
				param.offerRoleId = prodInst.offerRoleId;
			}
		}
		var offerSepcName = $("#search_text_"+prodId).val();
		if(offerSepcName.replace(/\ /g,"")==""){
			$.alert("提示","请输入查询条件！");
			return;
		}
		param.offerSpecName = offerSepcName;
		query.offer.searchAttachOfferSpec(param,function(data){
			if(data!=undefined){
				$("#attach_div_"+prodId).html(data).show();
				$("#btn_hide_"+prodId).show();
				$("#attachSearch_div_"+prodId+" div").each(function(){
					$(this).hide();
				});
			}
		});
	};
	
	var _closeSearchAttach = function(prodId){
		$("#attach_div_"+prodId).hide();
		$("#btn_hide_"+prodId).hide();
		var labelId=$("#attach_div_"+prodId).attr("value");
		$("#ul_"+prodId+"_"+labelId).show();
	};
	
	//点击搜索出来的附属销售品
	var _selectAttachOffer = function(prodId,offerSpecId){
		_addAttOffer(prodId,offerSpecId);
	};
	
	//点击搜索出来的功能产品
	var _selectServ = function(prodId,servSpecId,specName,ifParams){
		$("#attach_div_"+prodId).hide();
		_openServSpec(prodId,servSpecId,specName,ifParams);
	};
	
	//点击搜索出来的附属销售品
	var _closeAttachSearch = function(prodId){
		$("#attach_div_"+prodId).hide();
		$("#attachSearch_div_"+prodId+" div").each(function(){
			$(this).show();
		});
	};
	
	//已订购的附属销售品查询
	var _queryAttachOffer = function() {
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
		var prodId = prodInfo.prodInstId;
		var param = {
		    prodId : prodId,
		    prodSpecId : prodInfo.productId,
		    offerSpecId : prodInfo.prodOfferId,
		    acctNbr : prodInfo.accNbr
		};
		if(ec.util.isObj(prodInfo.prodBigClass)){
			param.prodBigClass = prodInfo.prodBigClass;
		}
		query.offer.queryAttachOfferHtml(param,function(data){
			SoOrder.initFillPage();
			$("#order-content").html(data).show();
			$("#fillNextStep").off("click").on("click",function(){
				if(!SoOrder.checkData()){ //校验通过
					return false;
				}
				$("#order-content").hide();
				$("#order-dealer").show();
				order.dealer.initDealer();
			});
			var member = CacheData.getOfferMember(prodId);
			//如果objId，objType，objType不为空才可以查询默认必须
			if(ec.util.isObj(member.objId)&&ec.util.isObj(member.objType)&&ec.util.isObj(member.offerRoleId)){
				param.queryType = "1,2";
				param.objId = member.objId;
				param.objType = member.objType;
				param.offerRoleId = member.offerRoleId;
				param.memberRoleCd = member.roleCd;
				//默认必须可选包
				var data = query.offer.queryDefMustOfferSpec(param);
				CacheData.parseOffer(data,prodId);
				//默认必须功能产品
				var data = query.offer.queryServSpec(param,prodId);
				CacheData.parseServ(data);
			}
			if(ec.util.isArray(OrderInfo.offerSpec.offerRoles)){ //主套餐下的成员判断
				var member = CacheData.getOfferMember(prodId);
				$.each(OrderInfo.offerSpec.offerRoles,function(){
					if(this.offerRoleId==member.offerRoleId && member.objType==CONST.OBJ_TYPE.PROD){
						$.each(this.roleObjs,function(){
							if(this.objType==CONST.OBJ_TYPE.SERV){
								var serv = CacheData.getServBySpecId(prodId,this.objId);//从已订购功能产品中找
								if(serv!=undefined){ //不在已经开跟已经选里面
									var $oldLi = $('#li_'+prodId+'_'+serv.servId);
									if(this.minQty==1){
										$oldLi.removeAttr("onclick");
										var $span = $("#span_"+prodId+"_"+serv.servId);
										var $span_remove = $("#span_remove_"+prodId+"_"+serv.servId);
										if(ec.util.isObj($span)){
											$span.removeClass("del");
										}
										if(ec.util.isObj($span_remove)){
											$span_remove.hide();
										}
									}
//									$oldLi.append('<dd id="jue_'+prodId+'_'+serv.servId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
								}
							}
						});
						return false;
					}
				});
			}
//			AttachOffer.changeLabel(prodId, prodInfo.productId,""); //初始化第一个标签附属
			order.dealer.initDealer();
		});
	};
	
	//删除附属销售品规格
	var _delOfferSpec2 = function(prodId,offerSpecId){
		var $span = $("#li_"+prodId+"_"+offerSpecId).find("span"); //定位删除的附属
		if($span.attr("class")=="del"){  //已经取消订购，再订购
			AttachOffer.addOfferSpec(prodId,offerSpecId);
		}else { //取消订购
			var spec = CacheData.getOfferSpec(prodId,offerSpecId);
			
			var content = CacheData.getOfferProdStr(prodId,spec,2);
			
			$.confirm("信息确认",content,{
				yes:function(){
					$span.addClass("del");
					spec.isdel = "Y";
					_delServSpec(prodId,spec); //取消订购销售品时
					order.dealer.removeAttDealer(prodId+"_"+offerSpecId); //删除协销人
					$("#terminalUl_"+prodId+"_"+offerSpecId).remove();
					spec.isTerminal = 0;
				},
				no:function(){
					
				}
			});
		}
	};
	
	//删除附属销售品规格
	var _delOfferSpec = function(prodId,offerSpecId){
		var $span = $("#li_"+prodId+"_"+offerSpecId).find("span"); //定位删除的附属
		if($span.attr("class")=="del"){  //已经取消订购，再订购
			AttachOffer.addOfferSpec(prodId,offerSpecId);
		}else { //取消订购
		var spec = CacheData.getOfferSpec(prodId,offerSpecId);
		var content = CacheData.getOfferProdStr(prodId,spec,2);
//		$("#confirm-modal").modal('show');
//		$("#modal-confirm-content").html(content);
//		$("#btn-comfirm-dialog-ok").off("click").on("click",function(){
//			//$("#li_"+prodId+"_"+offerSpecId).remove();
//			$span.addClass("del");
//			spec.isdel = "Y";
//			delServSpec(prodId,spec); //取消订购销售品时
//			//order.dealer.removeAttDealer(prodId+"_"+offerSpecId); //删除协销人
//			//$("#terminalUl_"+prodId+"_"+offerSpecId).remove();
//			spec.isTerminal = 0;
//			$("#btn-comfirm-dialog-cancel").click();
//		});
		$.confirm("信息确认",content,{
			yes:function(){
//				$("#li_"+prodId+"_"+offerSpecId).remove();
				$span.addClass("del");
				spec.isdel = "Y";
				delServSpec(prodId,spec); //取消订购销售品时
				order.dealer.removeAttDealer(prodId+"_"+offerSpecId); //删除协销人
				$("#terminalUl_"+prodId+"_"+offerSpecId).remove();
				spec.isTerminal = 0;
			},
			no:function(){
				
			}
		});
		}
	};
	//新装二次加载业务--删除可选包
	var _delOfferSpecReload = function(prodId,offerSpecId){
		var $span = $("#li_"+prodId+"_"+offerSpecId).find("span"); //定位删除的附属
		if($span.attr("class")=="del"){  //已经取消订购，再订购
			AttachOffer.addOfferSpec(prodId,offerSpecId);
		}else { //取消订购
		var spec = CacheData.getOfferSpec(prodId,offerSpecId);
		var content = CacheData.getOfferProdStr(prodId,spec,2);
		$span.addClass("del");
		spec.isdel = "Y";
		delServSpec(prodId,spec); //取消订购销售品时
		order.dealer.removeAttDealer(prodId+"_"+offerSpecId); //删除协销人
		$("#terminalUl_"+prodId+"_"+offerSpecId).remove();
		spec.isTerminal = 0;
		}
	};
	
	//删除附属销售品实例
	var _delOffer = function(prodId,offerId){
		var $span = $("#li_"+prodId+"_"+offerId).find("span"); //定位删除的附属
		if($span.attr("class")=="del"){  //已经退订，再订购
			AttachOffer.addOffer(prodId,offerId,$span.text());
		}else { //退订
			var offer = CacheData.getOffer(prodId,offerId);
			if(!ec.util.isArray(offer.offerMemberInfos)){	
				var param = {
					prodId:prodId,
					areaId: OrderInfo.getProdAreaId(prodId),
					offerId:offerId	
				};
				if(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6){//主副卡纳入老用户
					for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
						if(prodId==OrderInfo.oldprodInstInfos[i].prodInstId){
							param.areaId = OrderInfo.oldprodInstInfos[i].areaId;
							param.acctNbr = OrderInfo.oldprodInstInfos[i].accNbr;
						}
					}
				}else{
					param.acctNbr = OrderInfo.getAccessNumber(prodId);
				}
				var data = query.offer.queryOfferInst(param);
				if(data==undefined){
					return;
				}
				//遍历附属的构成要和主套餐的构成实例要一致（兼容融合套餐）
				var offerMemberInfos=[];
				$.each(data.offerMemberInfos,function(){
					var prodInstId=this.objInstId;
					var flag=false;
					$.each(OrderInfo.offer.offerMemberInfos,function(){
						if(this.objInstId==prodInstId){
							flag=true;
							return false;
						}
					});
					if(flag){
						offerMemberInfos.push(this);
					}
				});
				
				offer.offerMemberInfos = data.offerMemberInfos=offerMemberInfos;
				offer.offerSpec = data.offerSpec;
			}
			var content = "";
			if(offer.offerSpec!=undefined){
				content = CacheData.getOfferProdStr(prodId,offer,1);
			}else {
				content = '退订【'+$span.text()+'】可选包' ;
			}
			$.confirm("信息确认",content,{ 
				yes:function(){
					offer.isdel = "Y";
					$span.addClass("del");
					delServByOffer(prodId,offer);
				},
				no:function(){	
				}
			});
		}
	};
	
	//关闭服务规格
	var _closeServSpec = function(prodId,servSpecId,specName,ifParams){
		var $span = $("#li_"+prodId+"_"+servSpecId).find("span"); //定位删除的附属
		if($span.attr("class")=="del"){  //已经退订，再订购
			AttachOffer.openServSpec(prodId,servSpecId,specName,ifParams);
		}else { //退订
			//退订的时候就提示需要退订其为必选成员的已选可选包
			var toDelOfferSpecList = [];
			var flag = true;
			var mustOfferSpecList = [];
			if(ec.util.isArray(AttachOffer.openList)){
				for ( var j = 0; j < AttachOffer.openList.length; j++) {
					if(prodId == AttachOffer.openList[j].prodId){
						if(ec.util.isArray(AttachOffer.openList[j].specList)){
							$.each(AttachOffer.openList[j].specList,function(){
								var offerSpec = this;
								if(this.isdel!="Y"){									
									$.each(offerSpec.offerRoles,function(){
										if(this.minQty>0){
											$.each(this.roleObjs,function(){
												if(servSpecId == this.objId && this.minQty>0){
													if(offerSpec.ifDault==0){//必选
														mustOfferSpecList.push(offerSpec);
														flag = false;
													}
													toDelOfferSpecList.push(offerSpec);
												}
											});
										}
									});
								}
							});
						}
					}
				}
			}
			
			if(flag){
				$.confirm("信息确认","取消开通【"+$span.text()+"】功能产品",{ 
					yesdo:function(){
						if(toDelOfferSpecList.length>0){
							var strInfo = "【"+$span.text()+"】功能产品为以下可选包的必选成员，取消开通将取消订购以下可选包，请确认是否取消订购？<br>";
							$.each(toDelOfferSpecList,function(){
								strInfo += "【"+this.offerSpecName+"】<br>";
							});
							$.confirm("信息确认",strInfo,{ 
								yesdo:function(){
									$.each(toDelOfferSpecList,function(){
										_delOfferSpec2(prodId,this.offerSpecId);
									});
									_closeServSpecCallBack(prodId,servSpecId,$span);
								},
								no:function(){
								}
							});
						}else{
							_closeServSpecCallBack(prodId,servSpecId,$span);
						}
					},
					no:function(){
					}
				});
			}else{				
				var strInfo = "【"+$span.text()+"】功能产品为可选包:<br>";
				$.each(toDelOfferSpecList,function(){
					strInfo += "<b>【"+this.offerSpecName+"】</b><br>";
				});
				strInfo += "的必选成员，且可选包为默认必选，不可取消。所以【"+$span.text()+"】功能产品无法取消订购!<br>";
				$.alert("提示",strInfo);
				return;
			}
		}
	};
	
	//新装二次业务加载--关闭服务规格
	var _closeServSpecReload = function(prodId,servSpecId,specName,ifParams){
		var $span = $("#li_"+prodId+"_"+servSpecId).find("span"); //定位删除的附属
		if($span.attr("class")=="del"){  //已经退订，再订购
			AttachOffer.openServSpecReload(prodId,servSpecId,specName,ifParams);
		}else { //退订
			var spec = CacheData.getServSpec(prodId,servSpecId);
			if(spec == undefined){ //没有在已开通附属销售列表中
				return;
			}
			$span.addClass("del");
			spec.isdel = "Y";
			_showHideUim(1,prodId,servSpecId);   //显示或者隐藏		
			var serv = CacheData.getServBySpecId(prodId,servSpecId);
			if(ec.util.isObj(serv)){ //没有在已开通附属销售列表中
				$span.addClass("del");
				serv.isdel = "Y";
				//_showHideUim(1,prodId,servSpecId);   //显示或者隐藏
			}
		}
	};
	
	var _closeServSpecCallBack = function(prodId,servSpecId,$span){
		var spec = CacheData.getServSpec(prodId,servSpecId);
		if(spec == undefined){ //没有在已开通附属销售列表中
			return;
		}
		$span.addClass("del");
		spec.isdel = "Y";
		_showHideUim(1,prodId,servSpecId);   //显示或者隐藏
		
		var serv = CacheData.getServBySpecId(prodId,servSpecId);
		order.dealer.removeAttDealer(prodId+"_"+servSpecId); //删除协销人
		if(ec.util.isObj(serv)){ //没有在已开通附属销售列表中
			$span.addClass("del");
			serv.isdel = "Y";
			//_showHideUim(1,prodId,servSpecId);   //显示或者隐藏
		}
	};
	
	//关闭服务实例
	var _closeServ = function(prodId,servId){
		var serv = CacheData.getServ(prodId,servId);
		var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
		if($span.attr("class")=="del"){  //已经关闭，取消关闭
			_openServ(prodId,serv);
		}else if("13409244"==serv.servSpecId){//一卡双号虚号
			$.alert("提示","请通过“一卡双号退订”入口或者短信入口退订此功能");
		}else{ //关闭
			$.confirm("信息确认","关闭【"+$span.text()+"】功能产品",{ 
				yesdo:function(){
					$span.addClass("del");
					serv.isdel = "Y";
				},
				no:function(){						
				}
			});
		}
	};
	
	//开通功能产品
	var _openServSpec = function(prodId,servSpecId,specName,ifParams){
		$.confirm("信息确认","开通【"+specName+"】功能产品",{ 
			yesdo:function(){
				var servSpec = CacheData.getServSpec(prodId,servSpecId); //在已选列表中查找
				if(servSpec==undefined){   //在可订购功能产品里面 
					var newSpec = {
						objId : servSpecId, //调用公用方法使用
						servSpecId : servSpecId,
						servSpecName : specName,
						ifParams : ifParams,
						isdel : "C"   //加入到缓存列表没有做页面操作为C
					};
					var inPamam = {
						prodSpecId:servSpecId
					};
					if(ifParams == "Y"){
						var data = query.prod.prodSpecParamQuery(inPamam);// 产品功能产品属性
						if(data==undefined || data.result==undefined){
							return;
						}
						newSpec.prodSpecParams = data.result.prodSpecParams;
					if(servSpecId==CONST.YZFservSpecId){//翼支付助手根据付费类型改变默认值
						var feeType = $("select[name='pay_type_-1']").val();
						if(feeType==undefined) feeType = order.prodModify.choosedProdInfo.feeType;
						if(feeType == CONST.PAY_TYPE.AFTER_PAY){
							for ( var j = 0; j < newSpec.prodSpecParams.length; j++) {
								var prodSpecParam = newSpec.prodSpecParams[j];
								prodSpecParam.setValue = "";
							}																			
						}else{
							for ( var j = 0; j < newSpec.prodSpecParams.length; j++) {							
								var prodSpecParam = newSpec.prodSpecParams[j];
								if (prodSpecParam.value!="") {
									prodSpecParam.setValue = prodSpecParam.value;
								} else if (!!prodSpecParam.valueRange[0]&&prodSpecParam.valueRange[0].value!="")
									//默认值为空则取第一个
									prodSpecParam.setValue = prodSpecParam.valueRange[0].value;
						}
					  }
					}
					}
					CacheData.setServSpec(prodId,newSpec); //添加到已开通列表里
					servSpec = newSpec;
				}
				_checkServExcludeDepend(prodId,servSpec);
			},
			no:function(){
			}
		});
	};
	//新装二次加载业务 ---开通功能产品
	var _openServSpecReload = function(prodId,servSpecId,specName,ifParams){
		var servSpec = CacheData.getServSpec(prodId,servSpecId); //在已选列表中查找
		if(servSpec==undefined){   //在可订购功能产品里面 
			var newSpec = {
				objId : servSpecId, //调用公用方法使用
				servSpecId : servSpecId,
				servSpecName : specName,
				ifParams : ifParams,
				isdel : "C"   //加入到缓存列表没有做页面操作为C
			};
			var inPamam = {
				prodSpecId:servSpecId
			};
			if(ifParams == "Y"){
				var data = query.prod.prodSpecParamQuery(inPamam);// 产品功能产品属性
				if(data==undefined || data.result==undefined){
					return;
				}
				newSpec.prodSpecParams = data.result.prodSpecParams;
			if(servSpecId==CONST.YZFservSpecId){//翼支付助手根据付费类型改变默认值
				var feeType = $("select[name='pay_type_-1']").val();
				if(feeType==undefined) feeType = order.prodModify.choosedProdInfo.feeType;
				if(feeType == CONST.PAY_TYPE.AFTER_PAY){
					for ( var j = 0; j < newSpec.prodSpecParams.length; j++) {
						var prodSpecParam = newSpec.prodSpecParams[j];
						prodSpecParam.setValue = "";
					}																			
				}else{
					for ( var j = 0; j < newSpec.prodSpecParams.length; j++) {							
						var prodSpecParam = newSpec.prodSpecParams[j];
						if (prodSpecParam.value!="") {
							prodSpecParam.setValue = prodSpecParam.value;
						} else if (!!prodSpecParam.valueRange[0]&&prodSpecParam.valueRange[0].value!="")
							//默认值为空则取第一个
							prodSpecParam.setValue = prodSpecParam.valueRange[0].value;
					}
				}
			  }
			}
			CacheData.setServSpec(prodId,newSpec); //添加到已开通列表里
			servSpec = newSpec;
		}
		_checkServExcludeDepend(prodId,servSpec);
	};
	
	//开通功能产品
	var _openServ = function(prodId,serv){
		$.confirm("信息确认","取消关闭【"+serv.servSpecName+"】功能产品",{ 
			yesdo:function(){
				if(serv!=undefined){   //在可订购功能产品里面 
					if(serv.servSpecId==""){
						var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
						$span.removeClass("del");
						serv.isdel = "N";
					}else{
						_checkServExcludeDepend(prodId,serv);
					}
				}
			},
			no:function(){
			}
		});
	};
	
	//校验销售品的互斥依赖
	var _checkOfferExcludeDepend = function(prodId,offerSpec){
		var offerSpecId = offerSpec.offerSpecId;
		var param = CacheData.getExcDepOfferParam(prodId,offerSpecId);
//		if(param.orderedOfferSpecIds.length == 0 ){
////			AttachOffer.addOpenList(prodId,offerSpecId); 
//			paserOfferData("",prodId,offerSpecId,offerSpec.offerSpecName); //解析数据
//		}else{
		var data = query.offer.queryExcludeDepend(param);//查询规则校验
		if(data!=undefined){
			paserOfferData(data.result,prodId,offerSpecId,offerSpec.offerSpecName); //解析数据
		}
//		}
		
		//获取销售品节点校验销售品下功能产品的互斥依赖
		/*var offerSpec = CacheData.getOfferSpec(offerSpecId);
		if(offerSpec!=undefined){
			$.each(offerSpec.offerRoles,function(){
				$.each(this.roleObjs,function(){
					var param = {
						prodId : prodId,
						servSpecId : this.objId,
						orderedServSpecIds : [] //功能产品互斥依赖查询入场数组
					};
					//已选销售品列表
					var offerSpecList = CacheData.getSpecList(prodId);
					if(ec.util.isArray(offerSpecList)){
						$.each(offerSpecList,function(){
							if(this.offerSpecId!=offerSpecId && this.isdel!="Y" && this.isdel!="C"){
								param.orderedOfferSpecIds.push(this.offerSpecId);
							}
						});
					}
					if(param.orderedServSpecIds.length == 0 ){
						AttachOffer.addOpenList(prodId,offerSpecId); 
					}else{
						datas.push(query.offer.queryServExcludeDepend(param));//查询规则校验
					}
				});
			});
		}*/
		//paserData(datas,prodId,offerSpecId,offer.offerSpecName,"OFFER"); //解析数据
		
		/*if(param.orderedOfferSpecIds.length == 0 ){
			AttachOffer.addOpenList(prodId,offerSpecId); 
		}else{
			var data = query.offer.queryExcludeDepend(param);  //查询规则校验
			if(data!=undefined){
				paserData(data.result,prodId,offerSpecId,offer.offerSpecName,"OFFER"); //解析数据
			}
		}*/
	};
	
	//校验服务的互斥依赖
	var _checkServExcludeDepend = function(prodId,serv,flag){
		var servSpecId = serv.servSpecId;
		var param = CacheData.getExcDepServParam(prodId,servSpecId);
		if(param.orderedServSpecIds.length == 0){
			AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams);
		}else{
			var data = query.offer.queryExcludeDepend(param);  //查询规则校验
			if(data!=undefined){
				paserServData(data.result,prodId,serv);//解析数据
			}
		}
	};
	
	//订购附属销售品
	var _addOfferSpec = function(prodId,offerSpecId){
		var newSpec = _setSpec(prodId,offerSpecId);
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			return;
		}
		var content = CacheData.getOfferProdStr(prodId,newSpec,0);
		//判断是否是新装二次加载业务
		if(OrderInfo.provinceInfo.reloadFlag=="N"){
			CacheData.setServ2OfferSpec(prodId,newSpec);
			_checkOfferExcludeDepend(prodId,newSpec);
		}else{
			$.confirm("信息确认",content,{ 
				yes:function(){
					CacheData.setServ2OfferSpec(prodId,newSpec);
				},
				yesdo:function(){
					_checkOfferExcludeDepend(prodId,newSpec);
				},
				no:function(){
				}
			});
		}
	};
	
	//根据预校验返回订购附属销售品
	var _addOfferSpecByCheck = function(prodId,offerSpecId){
		var newSpec = _setSpec(prodId,offerSpecId);
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			return;
		}
		var content = CacheData.getOfferProdStr(prodId,newSpec,0);
		$.confirm("信息确认",content,{ 
			yes:function(){
				CacheData.setServ2OfferSpec(prodId,newSpec);
			},
			yesdo:function(){
				_checkOfferExcludeDepend(prodId,newSpec);
			}
		});
	};
	
	//删除附属销售品带出删除功能产品
	var delServSpec = function(prodId,offerSpec){
		$.each(offerSpec.offerRoles,function(){
			$.each(this.roleObjs,function(){
				var servSpecId = this.objId;
				if($("#check_"+prodId+"_"+servSpecId).attr("checked")=="checked"){
					var spec = CacheData.getServSpec(prodId,servSpecId);
					if(ec.util.isObj(spec)){
						spec.isdel = "Y";
					//	var $li = $("#li_"+prodId+"_"+servSpecId);
					//	$li.remove();
					//	$li.removeClass("canshu").addClass("canshu2");
						$li.find("span").addClass("del"); //定位删除的附属
						_showHideUim(1,prodId,servSpecId);   //显示或者隐藏
					}
				}
			});
		});
	};
	
	//删除附属销售品带出删除功能产品
	var delServByOffer = function(prodId,offer){	
		$.each(offer.offerMemberInfos,function(){
			var servId = this.objInstId;
			if($("#check_"+prodId+"_"+servId).attr("checked")=="checked"){
				var serv = CacheData.getServ(prodId,servId);
				if(ec.util.isObj(serv)){
					serv.isdel = "Y";
					var $li = $("#li_"+prodId+"_"+servId);
					$li.removeClass("canshu").addClass("canshu2");
					$li.find("span").addClass("del"); //定位删除的附属
				}
			}
		});
	};
	
	//取消退订附属销售品
	var _addOffer = function(prodId,offerId){
		var specName = $("#li_"+prodId+"_"+offerId).find("span").text();
//		$("#confirm-modal").modal('show');
//		$("#modal-confirm-content").html("取消退订【"+specName+"】可选包");
//		$("#btn-comfirm-dialog-ok").off("click").on("click",function(){
//			var offer = CacheData.getOffer(prodId,offerId); //在已经开通列表中查找
//			if(offer!=undefined){   //在可订购功能产品里面 
//				if(offer.offerSpecId==""){
//					var $span = $("#li_"+prodId+"_"+offer.offerId).find("span");
//					$span.removeClass("del");
//					offer.isdel = "N";
//				}else{
//					_checkOfferExcludeDepend(prodId,offer);
//				}
//			}
//		});
		$.confirm("信息确认","取消退订【"+specName+"】可选包",{ 
			yesdo:function(){
				var offer = CacheData.getOffer(prodId,offerId); //在已经开通列表中查找
				if(offer!=undefined){   //在可订购功能产品里面 
					if(offer.offerSpecId==""){
						var $span = $("#li_"+prodId+"_"+offer.offerId).find("span");
						$span.removeClass("del");
						offer.isdel = "N";
					}else{
						_checkOfferExcludeDepend(prodId,offer);
					}
				}
			},
			no:function(){
			}
		});
	};
	
	//确认订购附属销售品
	var _addAttOffer = function(prodId,offerSpecId,specName){
		_addOfferSpec(prodId,offerSpecId);
	};
	
	//解析互斥依赖返回结果
	var paserOfferData = function(result,prodId,offerSpecId,specName){
		var content = "";
		//转换接口返回的互斥依赖
		var param = {  
				excludeOffer : [],   //互斥依赖显示列表
				defaultOffer : [], //默选的显示列表
				dependOffer : {  //存放互斥依赖列表
					dependOffers : [],
					offerGrpInfos : []
				}
		};
		if(result!=""){
			var exclude = result.offerSpec.exclude;
			var depend = result.offerSpec.depend;
			var defaultOffer=result.offerSpec.defaultList;
			//解析可选包互斥依赖组
			if(ec.util.isArray(exclude)){
				for (var i = 0; i < exclude.length; i++) {
					var offerList = CacheData.getOfferList(prodId); //互斥要去除已订购手动删除
					var flag = true;
					if(offerList!=undefined){
						for ( var j = 0; j < offerList.length; j++) {
							if(offerList[j].isdel=="Y"){
								if(offerList[j].offerSpecId == exclude[i].offerSpecId){  //返回互斥数组在已订购中删除，不需要判断
									flag = false;
									break;
								}
							}
						}
					}
					if(flag){
						content += "需要关闭：   " + exclude[i].offerSpecName + "<br>";
						param.excludeOffer.push(exclude[i].offerSpecId);
					}
				}
			}
			if(depend!=undefined && ec.util.isArray(depend.offerInfos)){
				for (var i = 0; i < depend.offerInfos.length; i++) {	
					content += "需要开通： " + depend.offerInfos[i].offerSpecName + "<br>";
					param.dependOffer.dependOffers.push(depend.offerInfos[i].offerSpecId);
				}	
			}
			if(depend!=undefined && ec.util.isArray(depend.offerGrpInfos)){
				for (var i = 0; i < depend.offerGrpInfos.length; i++) {
					var offerGrpInfo = depend.offerGrpInfos[i];
					param.dependOffer.offerGrpInfos.push(offerGrpInfo);
					content += "需要开通： 开通" + offerGrpInfo.minQty+ "-" + offerGrpInfo.maxQty+ "个以下业务:<br>";
					if(offerGrpInfo.subOfferSpecInfos!="undefined" && offerGrpInfo.subOfferSpecInfos.length>0){
						for (var j = 0; j < offerGrpInfo.subOfferSpecInfos.length; j++) {
							var subOfferSpec = offerGrpInfo.subOfferSpecInfos[j];
							var offerSpec=CacheData.getOfferSpec(prodId,subOfferSpec.offerSpecId);
							if(ec.util.isObj(offerSpec)){
								if(offerSpec.isdel!="Y"&&offerSpec.isdel!="C"){
									content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" disabled="disabled" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+ '<label for='+subOfferSpec.offerSpecId+'>'+ subOfferSpec.offerSpecName +'</label></input><br>';
								}else{
									content += '<input id="'+subOfferSpec.offerSpecId+'" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+ '<label for='+subOfferSpec.offerSpecId+'>'+ subOfferSpec.offerSpecName +'</label></input><br>';
								}
							}else{
								var offerSpec=CacheData.getOfferBySpecId(prodId,subOfferSpec.offerSpecId);
								if(ec.util.isObj(offerSpec)){
									if(offerSpec.isdel!="Y"&&offerSpec.isdel!="C"){
										content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" disabled="disabled" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+ '<label for='+subOfferSpec.offerSpecId+'>'+ subOfferSpec.offerSpecName +'</label></input><br>';
									}else{
										content += '<input id="'+subOfferSpec.offerSpecId+'" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+'<label for='+subOfferSpec.offerSpecId+'>'+ subOfferSpec.offerSpecName +'</label></input><br>';
									}
								}else{
									content += '<input id="'+subOfferSpec.offerSpecId+'" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+ '<label for='+subOfferSpec.offerSpecId+'>'+ subOfferSpec.offerSpecName +'</label></input><br>';
								}
							}
						}
					}
				}
			}
			//解析可选包默选组
			if(ec.util.isArray(defaultOffer)){
				for (var i = 0; i < defaultOffer.length; i++) {	
					content += "需要开通： " + defaultOffer[i].offerSpecName + "<br>";
					param.defaultOffer.push(defaultOffer[i].offerSpecId);
				}	
			}
		}
		var serContent=_servExDepReByRoleObjs(prodId,offerSpecId);//查询销售品构成成员的依赖互斥以及连带
		content=content+serContent;
		if(content==""){ //没有互斥依赖
			AttachOffer.addOpenList(prodId,offerSpecId); 
		}else{	
			content = "<div style='max-height:300px;overflow:auto;'>" + content + "</div>";
//			$("#modal-confirm-title").html("订购： " + specName);
//			$("#modal-confirm-content").html(content);
//			$("#btn-comfirm-dialog-ok").off("click").on("click",function(){
//				CacheData.setOffer2ExcludeOfferSpec(param);
//				excludeAddattch(prodId,offerSpecId,param);
//				excludeAddServ(prodId,"",paramObj);
//				$("#btn-comfirm-dialog-cancel").click();
//			});
			$.confirm("订购： " + specName,content,{ 
				yes:function(){
					CacheData.setOffer2ExcludeOfferSpec(param);
				},
				yesdo:function(){
					CacheData.setOffer2ExcludeOfferSpec(param);
					excludeAddattch(prodId,offerSpecId,param);
					_excludeAddServ(prodId,"",paramObj);
				},
				no:function(){
					
				}
			});
		}
	};
	
	/*//解析互斥依赖返回结果
	var paserData = function(datas,prodId,offerSpecId,specName,objType){
		var exclude = result.offerSpec.exclude;
		var depend = result.offerSpec.depend;
		var servExclude = result.servSpec.exclude;
		var servDepend = result.servSpec.depend;

		var content = "";
		//转换接口返回的互斥依赖
		var param = {  
			excludeOffer : [],   //互斥依赖显示列表
			dependOffer : {  //存放互斥依赖列表
				dependOffers : [],
				offerGrpInfos : []
			},
			excludeServ : [],  //互斥依赖显示列表
			dependServ : [] //存放互斥依赖列表
		};
		
		//解析可选包互斥依赖组
		if(exclude!=undefined && exclude.length>0){
			for (var i = 0; i < exclude.length; i++) {
				var offerList = AttachOffer.getOfferList(prodId); //互斥要去除已订购手动删除
				var flag = true;
				if(offerList!=undefined){
					for ( var j = 0; j < offerList.length; j++) {
						if(offerList[j].isdel=="Y"){
							if(offerList[j].offerSpecId == exclude[i].offerSpecId){  //返回互斥数组在已订购中删除，不需要判断
								flag = false;
								break;
							}
						}
					}
				}
				if(flag){
					content += "需要关闭：   " + exclude[i].offerSpecName + "<br>";
					param.excludeOffer.push(exclude[i].offerSpecId);
				}
			}
		}
		if(depend!=undefined && depend.offerInfos!=undefined && depend.offerInfos.length>0){
			for (var i = 0; i < depend.offerInfos.length; i++) {	
				content += "需要开通： " + depend.offerInfos[i].offerSpecName + "<br>";
				param.dependOffer.dependOffers.push(depend.offerInfos[i].offerSpecId);
			}	
		}
		if(depend!=undefined && depend.offerGrpInfos!=undefined && depend.offerGrpInfos.length>0){
			for (var i = 0; i < depend.offerGrpInfos.length; i++) {
				var offerGrpInfo = depend.offerGrpInfos[i];
				param.dependOffer.offerGrpInfos.push(offerGrpInfo);
				content += "需要开通： 开通" + offerGrpInfo.minQty+ "-" + offerGrpInfo.maxQty+ "个以下业务:<br>";
				if(offerGrpInfo.subOfferSpecInfos!="undefined" && offerGrpInfo.subOfferSpecInfos.length>0){
					for (var j = 0; j < offerGrpInfo.subOfferSpecInfos.length; j++) {
						var subOfferSpec = offerGrpInfo.subOfferSpecInfos[j];
						content += '<input id="'+subOfferSpec.offerSpecId+'" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
					}
				}
			}
		}
		
		//解析功能产品互斥依赖组
		if(servExclude!=undefined && servExclude.length>0){
			$.each(servExclude,function(){
				if(this.offerSpecId == undefined || this.offerSpecId == ""){ //纯功能产品互斥
					var servList = AttachOffer.getServList(prodId); //互斥要去除已订购手动删除
					var flag = true;
					if(servList!=undefined){
						for ( var i = 0; i < servList.length; i++) {
							if(servList[i].isdel=="Y"){
								if(servList[i].servSpecId == this.servSpecId){  //返回互斥数组在已订购中删除，不需要判断
									flag = false;
									break;
								}
							}
						}
					}
					if(flag){
						content += "需要关闭：   " + this.servSpecName + "<br>";
						param.excludeServ.push(this);
					}
				}else {  //可选包下功能产品互斥
					var offerList = AttachOffer.getOfferList(prodId); //互斥要去除已订购手动删除
					var flag = true;
					if(offerList!=undefined){
						for ( var j = 0; j < offerList.length; j++) {
							if(offerList[j].isdel=="Y"){
								if(offerList[j].offerSpecId == this.offerSpecId){  //返回互斥数组在已订购中删除，不需要判断
									flag = false;
									break;
								}
							}
						}
					}
					if(flag){
						content += "需要关闭：   " + this.offerSpecName + "<br>";
						param.excludeOffer.push(this.offerSpecId);
					}
				}
			});
		}
		if(servDepend!=undefined && servDepend.length>0){
			$.each(servDepend,function(){
				if(this.offerSpecId == undefined || this.offerSpecId == ""){ //纯功能产品依赖
					content += "需要开通：   " + this.servSpecName + "<br>";
					param.dependServ.push(this);
				}else {  //功能产品与可选包下功能产品依赖
					content += "需要开通：   " + this.offerSpecName + "<br>";
					param.dependOffer.dependOffers.push(this.offerSpecId);
				}
			});
		}
		
		if(content==""){ //没有互斥依赖
			if(objType == "OFFER"){
				AttachOffer.addOpenList(prodId,offerSpecId); 
			}else {
				AttachOffer.addOpenServList(prodId,offerSpecId); 
			}
		}else{	
			$.confirm("开通： " + specName,content,{ 
				yesdo:function(){
					excludeAddattch(prodId,offerSpecId,param,objType);
				},
				no:function(){
					
				}
			});
		}
	};*/
	
	//解析服务互斥依赖
	var paserServData = function(result,prodId,serv){
		var servSpecId = serv.servSpecId;
		var servExclude = result.servSpec.exclude; //互斥
		var servDepend = result.servSpec.depend; //依赖
		var servRelated = result.servSpec.related; //连带
		var servOfferList = result.servSpec.offerList; //带出的可选包[W]
		var content = "";
		//转换接口返回的互斥依赖
		var param = {  
			excludeServ : [],  //互斥依赖显示列表
			dependServ : [], //存放互斥依赖列表
			relatedServ : [] , //连带
			offerListServ : [] //带出的可选包[W]
		};
		
		//解析功能产品互斥
		if(ec.util.isArray(servExclude)){
			$.each(servExclude,function(){
				var servList = CacheData.getServList(prodId); //互斥要去除已订购手动删除
				var flag = true;
				if(servList!=undefined){
					for ( var i = 0; i < servList.length; i++) {
						if(servList[i].isdel=="Y"){
							if(servList[i].servSpecId == this.servSpecId){  //返回互斥数组在已订购中删除，不需要判断
								flag = false;
								break;
							}
						}
					}
				}
				if(flag){
					content += "需要关闭：   " + this.servSpecName + "<br>";
					param.excludeServ.push(this);
				}
			});
		}
		//解析功能产品依赖
		if(ec.util.isArray(servDepend)){
			$.each(servDepend,function(){
				content += "需要开通：   " + this.servSpecName + "<br>";
				param.dependServ.push(this);
			});
		}
		//解析功能产品连带
		if(ec.util.isArray(servRelated)){
			$.each(servRelated,function(){
				content += "需要开通：   " + this.servSpecName + "<br>";
				param.relatedServ.push(this);
			});
		}
		
		//解析带出的可选包，获取功能产品订购依赖互斥的接口返回的带出可选包拼接成字符串[W]
		if(ec.util.isArray(servOfferList)){
			if(servOfferList.length>0){
				content += "需要订购：   <br>";
				$.each(servOfferList,function(){
					if(this.ifDault===0){
						content += '<input id="check_open_'+prodId+'_'+this.offerSpecId +'" type="checkbox" checked="checked" disabled="disabled">'+this.offerSpecName+'<br>'; 
					}else{
						content += '<input id="check_open_'+prodId+'_'+this.offerSpecId +'" type="checkbox" checked="checked">'+this.offerSpecName+'<br>'; 
					}
//					content += "需要订购：   " + this.offerSpecName + "<br>";
					param.offerListServ.push(this);
				});
			}
		}
		
		if(content==""){ //没有互斥依赖
			AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams);
		}else{	
			$.confirm("开通： " + serv.servSpecName,content,{ 
				yes:function(){
					AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams); //添加开通功能
					excludeAddServ(prodId,servSpecId,param);
				},
				no:function(){
				}
			});
		}
	};
	
	//服务互斥依赖时带出添加跟删除
	var excludeAddServ = function(prodId,servSpecId,param){
		if(ec.util.isArray(param.excludeServ)){ //有互斥
			for (var i = 0; i < param.excludeServ.length; i++) { //删除已开通
				var excludeServSpecId = param.excludeServ[i].servSpecId;
				var spec = CacheData.getServSpec(prodId,excludeServSpecId);
				if(spec!=undefined){
//					$("#li_"+prodId+"_"+excludeServSpecId).remove();
					var $span = $("#li_"+prodId+"_"+excludeServSpecId).find("span");
					$span.addClass("del");
					spec.isdel = "Y";
				}else{
					var serv = CacheData.getServBySpecId(prodId,excludeServSpecId);
					if(serv!=undefined){
//						$("#li_"+prodId+"_"+serv.servId).remove();
						var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
						$span.addClass("del");
						serv.isdel = "Y";
					}
				}
			}
		}
		if(ec.util.isArray(param.dependServ)){ // 依赖
			for (var i = 0; i < param.dependServ.length; i++) {
				var servSpec = param.dependServ[i];
				AttachOffer.addOpenServList(prodId,servSpec.servSpecId,servSpec.servSpecName,servSpec.ifParams); 
			}
		}
		if(ec.util.isArray(param.relatedServ)){ // 连带
			for (var i = 0; i < param.relatedServ.length; i++) {
				var servSpec = param.relatedServ[i];
				AttachOffer.addOpenServList(prodId,servSpec.servSpecId,servSpec.servSpecName,servSpec.ifParams); 
			}
		}
		
		if(ec.util.isArray(param.offerListServ)){//添加带出的可选包
			for (var i = 0; i < param.offerListServ.length; i++) {
				var servSpec = param.offerListServ[i];
				if($("#check_open_"+prodId+"_"+servSpec.offerSpecId).attr("checked")=="checked"){
					AttachOffer.addOpenList(prodId,servSpec.offerSpecId); 
				}
			}
		}	
		
		if(ec.util.isArray(param.offerListServ)){//添加带出的可选包
			for (var i = 0; i < param.offerListServ.length; i++) {
				var servSpec = param.offerListServ[i];
				if($("#check_open_"+prodId+"_"+servSpec.offerSpecId).attr("checked")=="checked"){
					AttachOffer.addOpenList(prodId,servSpec.offerSpecId); 
				}
			}
		}	
	};
	
	//服务互斥依赖时带出添加跟删除
	var _excludeAddServ = function(prodId,servSpecId,param){
		if(ec.util.isArray(param.excludeServ)){ //有互斥
			for (var i = 0; i < param.excludeServ.length; i++) { //删除已开通
				var excludeServSpecId = param.excludeServ[i].servSpecId;
				var spec = CacheData.getServSpec(prodId,excludeServSpecId);
				if(spec!=undefined){
//					$("#li_"+prodId+"_"+excludeServSpecId).remove();
					var $span = $("#li_"+prodId+"_"+excludeServSpecId).find("span");
					$span.addClass("del");
					spec.isdel = "Y";
				}else{
					var serv = CacheData.getServBySpecId(prodId,excludeServSpecId);
					if(serv!=undefined){
//						$("#li_"+prodId+"_"+serv.servId).remove();
						var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
						$span.addClass("del");
						serv.isdel = "Y";
					}
				}
			}
		}
		if(ec.util.isArray(param.dependServ)){ // 依赖
			for (var i = 0; i < param.dependServ.length; i++) {
				var servSpec = param.dependServ[i];
				AttachOffer.addOpenServList(prodId,servSpec.servSpecId,servSpec.servSpecName,servSpec.ifParams); 
			}
		}
		if(ec.util.isArray(param.relatedServ)){ // 连带
			for (var i = 0; i < param.relatedServ.length; i++) {
				var servSpec = param.relatedServ[i];
				AttachOffer.addOpenServList(prodId,servSpec.servSpecId,servSpec.servSpecName,servSpec.ifParams); 
			}
		}
	};
	
	//互斥依赖时添加
	var excludeAddattch = function(prodId,specId,param){
		if(param.dependOffer.offerGrpInfos.length>0){  // 依赖组
			var dependOffer=param.dependOffer;
			for (var i = 0; i < dependOffer.offerGrpInfos.length; i++) {
				var offerGrpInfo = dependOffer.offerGrpInfos[i];
				var len  = offerGrpInfo.checkLen;
				if(len>=offerGrpInfo.minQty&&len<=offerGrpInfo.maxQty){
					$.each(offerGrpInfo.subOfferSpecInfos,function(){
						if(this.isCheck){
							AttachOffer.addOpenList(prodId,this.offerSpecId); 
						}
					});
				}else if(len<offerGrpInfo.minQty){
					$.alert("提示信息","依赖组至少选中"+offerGrpInfo.minQty+"个！");
					return;
				}else if(len>offerGrpInfo.maxQty){
					$.alert("提示信息","依赖组至多选中"+offerGrpInfo.maxQty+"个！");
					return;
				}else {
					$.alert("错误信息","依赖组选择出错！");
					return;
				}
			}
		}
		
		AttachOffer.addOpenList(prodId,specId); //添加开通附属
		if(param.excludeOffer.length>0){ //有互斥
			//删除已开通
			for (var i = 0; i < param.excludeOffer.length; i++) {
				var excludeSpecId = param.excludeOffer[i];
				var spec = CacheData.getOfferSpec(prodId,excludeSpecId);
				if(spec!=undefined){
//					$("#li_"+prodId+"_"+excludeSpecId).remove();
					var $span = $("#li_"+prodId+"_"+excludeSpecId).find("span");
					$span.addClass("del");
					spec.isdel = "Y";
//					$("#terminalUl_"+prodId+"_"+excludeSpecId).remove();
				}
				var offer = CacheData.getOfferBySpecId(prodId,excludeSpecId);
				if(offer!=undefined){
//					$("#li_"+prodId+"_"+excludeSpecId).remove();
					var $span = $("#li_"+prodId+"_"+offer.offerId).find("span");
					$span.addClass("del");
					offer.isdel = "Y";
				}
			}
		}
		if(param.dependOffer.dependOffers.length>0){ // 依赖
			for (var i = 0; i < param.dependOffer.dependOffers.length; i++) {
				var offerSpecId = param.dependOffer.dependOffers[i];
				AttachOffer.addOpenList(prodId,offerSpecId); 
			}
		}
		if(param.defaultOffer.length>0){ // 默选
			for (var i = 0; i < param.defaultOffer.length; i++) {
				var offerSpecId = param.defaultOffer[i];
				AttachOffer.addOpenList(prodId,offerSpecId); 
			}
		}
		/*if(objType == "OFFER"){
			AttachOffer.addOpenList(prodId,specId); //添加开通附属
			if(param.excludeOffer.length>0){ //有互斥
				//删除已开通
				for (var i = 0; i < param.excludeOffer.length; i++) {
					var excludeSpecId = param.excludeOffer[i];
					var spec = AttachOffer.getSpec(prodId,excludeSpecId);
					if(spec!=undefined){
						var $span = $("#li_"+prodId+"_"+excludeSpecId).find("span");
						$span.addClass("del");
						spec.isdel = "Y";
					}
					var offer = AttachOffer.getOfferBySpecId(prodId,excludeSpecId);
					if(offer!=undefined){
						var $span = $("#li_"+prodId+"_"+offer.offerId).find("span");
						$span.addClass("del");
						offer.isdel = "Y";
					}
				}
			}
			if(param.dependOffer.dependOffers.length>0){ // 依赖
				for (var i = 0; i < param.dependOffer.dependOffers.length; i++) {
					var offerSpecId = param.dependOffer.dependOffers[i];
					AttachOffer.addOpenList(prodId,offerSpecId); 
				}
			}
		}else{
			AttachOffer.addOpenServList(prodId,specId); //添加开通功能
			if(param.excludeServ!=undefined && param.excludeServ.length>0){ //有互斥
				//删除已开通
				for (var i = 0; i < param.excludeServ.length; i++) {
					var excludeServSpecId = param.excludeServ[i].servSpecId;
					var spec = CacheData.getServSpec(prodId,excludeServSpecId);
					if(spec!=undefined){
						var $span = $("#li_"+prodId+"_"+excludeServSpecId).find("span");
						$span.addClass("del");
						spec.isdel = "Y";
					}
					var serv = AttachOffer.getServ(prodId,excludeServSpecId);
					if(serv!=undefined){
						var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
						$span.addClass("del");
						serv.isdel = "Y";
					}
				}
			}
			if(param.dependServ!=undefined&&param.dependServ.length>0){ // 依赖
				for (var i = 0; i < param.dependServ.length; i++) {
					var servSpecId = param.dependServ[i].servSpecId;	
					var newSpec = {
						objId : servSpecId, //调用公用方法使用
						servSpecId : servSpecId,
						servSpecName : param.dependServ[i].servSpecName,
						ifParams : param.dependServ[i].ifParams,
						isdel : "C"   //加入到缓存列表没有做页面操作为C
					};
					var inPamam = {
						prodSpecId:servSpecId
					};
					if("Y"  == newSpec.ifParams){
						var data = query.prod.prodSpecParamQuery(inPamam);// 产品功能产品属性
						if(data==undefined || data.result==undefined){
							return;
						}
						newSpec.prodSpecParams = data.result.prodSpecParams;
					}
					CacheData.setServSpec(prodId,newSpec); //添加到已开通列表里
					AttachOffer.addOpenServList(prodId,servSpecId); 
				}
			}
		}*/
	};
	
	//添加到开通列表
	var _addOpenList = function(prodId,offerSpecId){
		if(!_manyPhoneFilter(prodId,offerSpecId)){
			return;
		}
		var offer = CacheData.getOfferBySpecId(prodId,offerSpecId); //从已订购数据中找
		if(offer != undefined){ //在已开通中，需要取消退订
			if(offer.isdel!="Y"){
				var newSpec = _setSpec(prodId,offerSpecId);
				if(newSpec==undefined){ //没有在已开通附属销售列表中
					return;
				}
			}else{
				var $span = $("#li_"+prodId+"_"+offer.offerId).find("span");
				$span.removeClass("del");
//				$("#li_"+prodId+"_"+offer.offerId).remove();
				offer.isdel = "N";
			}
			return;
		}
		var newSpec = _setSpec(prodId,offerSpecId);
		
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			return;
		}
		if(newSpec.isdel=="C"){ //没有在已开通附属销售列表中，但是已经加载到缓存
			if(_ifOrderAgain(newSpec)){
				return;
			}
			var $spec = $('#li_'+prodId+'_'+offerSpecId); //在已开通附属里面
			$spec.remove();
			
			$("#li_"+prodId+"_"+offerSpecId).remove();
			
			var $li = $('<a id="li_'+prodId+'_'+offerSpecId+'" onclick="AttachOffer.delOfferSpec('+prodId+','+offerSpecId+')" class="list-group-item"></a>');
			$li.append('<span id="span_'+prodId+'_'+offerSpecId+'">'+newSpec.offerSpecName+'</span>');
			if(newSpec.ifDault==0){ //必须
				$li.removeAttr("onclick");	
			}else{
				$li.append('<span id="span_remove_'+prodId+'_'+offerSpecId+'" class="glyphicon glyphicon-remove pull-right" aria-hidden="true"></span>');
			}
			$("#open_ul_"+prodId).append($li);
			newSpec.isdel = "N";
		}else if((newSpec.isdel=="Y")) { 
			var $span = $("#li_"+prodId+"_"+offerSpecId).find("span");
			$span.removeClass("del");
			newSpec.isdel = "N";
			
		}else {  //容错处理 //if((newSpec.isdel=="N")) 
			var $spec = $('#li_'+prodId+'_'+offerSpecId); //在已开通附属里面
			$spec.remove();
			var $li = $('<a id="li_'+prodId+'_'+offerSpecId+'" onclick="AttachOffer.delOfferSpec('+prodId+','+offerSpecId+')" class="list-group-item"></a>');
			$li.append('<span id="span_'+prodId+'_'+offerSpecId+'">'+newSpec.offerSpecName+'</span>');
			if(newSpec.ifDault==0){ //必须
				$li.removeAttr("onclick");	
			}else{
				$li.append('<span id="span_remove_'+prodId+'_'+offerSpecId+'" class="glyphicon glyphicon-remove pull-right" aria-hidden="true"></span>');
			}
			$("#open_ul_"+prodId).append($li);
		}
		
		//获取销售品节点校验销售品下功能产品的互斥依赖
		if(newSpec!=undefined){
			$.each(newSpec.offerRoles,function(){
				$.each(this.roleObjs,function(){
					if(this.objType==4 && this.selQty!=2){
						var ifParams = "N";
						if(ec.util.isArray(this.prodSpecParams)){
							ifParams = "Y";
						}
						if(this.dfQty>0){//默认配置大于0就带出，添加到已选功能产品中
							_addOpenServList(prodId,this.objId,this.objName,ifParams);
						}
					}
				});
			});
		}
		if(ec.util.isArray(newSpec.agreementInfos)){ //合约销售品需要输入终端
			if(OrderInfo.actionFlag!=14){//非购机入口的
				totalNums=0;
				_removeAttach2Coupons(prodId,newSpec.offerSpecId);//清除串码组
				var objInstId = prodId+'_'+newSpec.offerSpecId;
				//一个终端对应一个ul
				var $ul = $('<div id="terminalUl_'+objInstId+'"></div>');
//				var $sel = $('<select id="terminalSel_'+objInstId+'"></select>');  
//				var $li1 = $('<div style="display:none;" class="form-group"><label style="width:auto; margin:0px 10px;"><span style="color:#71AB5A;font-size:16px">'+newSpec.offerSpecName+'</span></label></div>');
				
//				var $li2 = $('<div style="display:none;"><label> 可选终端规格：</label></div>'); //隐藏
//				$.each(newSpec.agreementInfos,function(){
//					var $option = $('<option value="'+this.terminalModels+'" price="'+this.agreementPrice+'">'+this.terminalName+'</option>');
//					$sel.append($option);
//				});
//				$li2.append($sel).append('<label class="f_red">*</label>');
				
				var minNum=newSpec.agreementInfos[0].minNum;
				var maxNum=newSpec.agreementInfos[0].maxNum;
				var $li3=$('<div></div>');
				var isFastOffer = 0 ;
				if(ec.util.isArray(newSpec.extAttrParams)){
					$.each(newSpec.extAttrParams,function(){
						if(this.attrId == CONST.OFFER_FAST_FILL){
							isFastOffer = 1;
							return false;
						}
					});
				}
				for(var i=0;i<newSpec.agreementInfos.length;i++){
					var agreementInfo=newSpec.agreementInfos[i];
						var $ulGroups=$('<ul id="ul_'+objInstId+'" style="margin-left: -40px;"></ul>');
						var $liGroups = $('<li class="form-group" style="list-style-type:none;"><label> 终端：</label></li>');
						var $selTerms = $('<select style="display:none;" id="'+objInstId+'"></select>');
						var $selTermGroups = $('<select style="display:none;" id="group_'+objInstId+'"></select>');
						if(ec.util.isArray(agreementInfo.terminalGroups)){ //如果有配置终端组，则拼接终端组的规格ID和包含的终端规格ID
							for(var j=0;j<agreementInfo.terminalGroups.length;j++){
								var $optionTermGroups=$('<option value="'+agreementInfo.terminalGroups[j].terminalGroupId+'" terminalMaxNum="'+agreementInfo.terminalGroups[j].terminalMaxNum+'" terminalMinNum="'+agreementInfo.terminalGroups[j].terminalMinNum+'">'+agreementInfo.terminalGroups[j].terminalGroupId+'</option>');
								$selTermGroups.append($optionTermGroups);
								if(ec.util.isArray(agreementInfo.terminalGroups[j].terminalGroup)){
									$.each(agreementInfo.terminalGroups[j].terminalGroup,function(){
										var $optionTerms=$('<option value="'+this.terminalModels+'" price="'+this.terminalPrice+'">'+this.terminalName+'</option>');
										$selTerms.append($optionTerms);
									});
								}
							}
						}
						if(ec.util.isArray(agreementInfo.terminals)){ //如果是直接配置终端规格（旧数据），则拼接终端规格ID
							$.each(agreementInfo.terminals,function(){
								var $optionTerms=$('<option value="'+this.terminalModels+'" price="'+this.terminalPrice+'">'+this.terminalName+'</option>');
								$selTerms.append($optionTerms);
							});
						}
						
						$liGroups.append($selTerms).append($selTermGroups);
						if(maxNum>newSpec.agreementInfos[0].minNum){
							var $strAdd=$('<button id="terminalAddBtn_'+objInstId+'" type="button" prodId="'+prodId+'" offerSpecId="'+newSpec.offerSpecId+'" fag="0" onclick="AttachOffer.addAndDelTerminal(this)" value="添加" class="btn btn-default"></button>');
							var $strDel=$('<button id="terminalDelBtn_'+objInstId+'" type="button" prodId="'+prodId+'" offerSpecId="'+newSpec.offerSpecId+'" fag="1" onclick="AttachOffer.addAndDelTerminal(this)" value="删除" class="btn btn-default"></button>');
							$liGroups.append($strAdd).append($strDel);
						}
						$ulGroups.append($liGroups);
                        var minNumArray=new Array();
						for(var k=1;k<=minNum;k++){
							var id="terminalText_"+objInstId+'_'+k;
							minNumArray[k-1]=id;
							var $liTerminal=$('<li class="form-group" style="list-style-type:none;"><label for="exampleInputPassword1">终端校验：</label><div class="input-group" style="width:100%;"><input id="terminalText_'+objInstId+'_'+k+'" type="text" class="form-control" maxlength="50" placeholder="请先输入终端串号" />'
									+'<li class="form-group" style="list-style-type:none;"><input type="checkbox" id="if_p_reserveCode" onclick="AttachOffer.changereserveCode()"><label for="exampleInputPassword1">使用预约码：</label><div class="input-group"><input id="reserveCode" type="text" disabled="disabled" class="form-control" maxlength="50" placeholder="请输入预约码" style="background-color: #E8E8E8;"/>'
									+'<span class="input-group-btn"><button id="terminalBtn_'+objInstId+'_'+k+'" type="button" num="'+k+'" flag="'+isFastOffer+'" prodId="'+prodId+'" offerSpecId="'+newSpec.offerSpecId+'" onclick="AttachOffer.checkTerminalCode(this)" class="btn btn-default">校验</button></span></div></li>');
							var	$li4 = $('<li id="terminalDesc_'+k+'" style="display:none;list-style-type:none;" ><label></label><label id="terminalName_'+k+'"></label></li>');
							$ulGroups.append($liTerminal).append($li4);
						}
						$ul.append($ulGroups);
						totalNums+=minNum;
				}
				var $div = $("#terminalDiv_"+prodId);
				$ul.appendTo($div);
				$div.show();
				var terminalCode="";
				if(OrderInfo.terminalCode!=null && OrderInfo.terminalCode!="" && OrderInfo.terminalCode!="null" && OrderInfo.reloadFlag!="N"){
					var	accessNum=OrderInfo.getAccessNumber(prodId);
					if(accessNum!="" && accessNum!=null && accessNum!= undefined){
						var terminalCodeArray=OrderInfo.terminalCode.split(",");
						for(var k=0;k<terminalCodeArray.length;k++){
							if(terminalCodeArray[k].indexOf(accessNum)!=-1){
								//取终端串码minNumArray
								terminalCode=terminalCodeArray[k].split("_")[1];
								//填值
								for(var z=0;z<minNumArray.length;z++){
									if(minNumArray[z].indexOf(prodId)!=-1){
										$("#"+minNumArray[z]).val(terminalCode);
			                             break;
									}
								}
							}
						}
					}
				}
				if(newSpec.agreementInfos[0].minNum>0){//合约里面至少要有一个终端
					newSpec.isTerminal = 1;
				}
			}else if(OrderInfo.actionFlag==14){
					var objInstId = prodId+'_'+newSpec.offerSpecId;
					var terminalUl=$("#terminalUl_"+objInstId);//如果有就不添加串码框了，防止重复
					if(terminalUl.length>0){
						return;
					}
					//一个终端对应一个ul
					var $ul = $('<ul id="terminalUl_'+objInstId+'" class="fillin show"></ul>');
					var $sel = $('<select id="terminalSel_'+objInstId+'"></select>');  
					var $li1 = $('<li class="full"><label style="width:auto; margin:0px 10px;"><span style="color:#71AB5A;font-size:16px">'+newSpec.offerSpecName+'</span></label></li>');
					var $li2 = $('<li style="display:none;"><label> 可选终端规格：</label></li>'); //隐藏
					$.each(newSpec.agreementInfos,function(){
						var $option = $('<option value="'+this.terminalModels+'" price="'+this.agreementPrice+'">'+this.terminalName+'</option>');
						$sel.append($option);
					});
					$li2.append($sel).append('<label class="f_red">*</label>');
					var $li3 = $('<li><label>终端校验：</label><input id="terminalText_'+objInstId+'" type="text" class="inputWidth228px inputMargin0" data-validate="validate(terminalCodeCheck) on(keyup blur)" maxlength="50" placeholder="请先输入终端串号" />'
							+'<input id="terminalBtn_'+objInstId+'" type="button" onclick="AttachOffer.checkTerminalCode('+prodId+','+newSpec.offerSpecId+')" value="校验" class="purchase" style="float:left"></input></li>');	
					/*var $li4 = $('<li id="terRes_'+objInstId+'" class="full" style="display: none;" >'
							+'<label style="width:auto; margin:0px 10px;">终端名称：<span id="terName_'+objInstId+'" ></span></label>'
							+'<label style="width:auto; margin:0px 10px;">终端串码：<span id="terCode_'+objInstId+'" ></span></label>'
							+'<label style="width:auto; margin:0px 10px;">终端价格：<span id="terPrice_'+objInstId+'" ></span></label></li>');*/
					var $div = $("#terminalDiv_"+prodId);
					var $li4 = $('<li id="terminalDesc" style="display:none;white-space:nowrap;"><label> 终端规格：</label><label id="terminalName"></label></li>');
					$ul.append($li1).append($li2).append($li3).append($li4).appendTo($div);
					$div.show();
					newSpec.isTerminal = 1;
					
					for ( var i = 0; i < OrderInfo.attach2Coupons.length; i++) {
						var coupon = OrderInfo.attach2Coupons[i];
						if(prodId==coupon.prodId){
							$("#terminalSel_"+objInstId).val(coupon.couponId);
							$("#terminalSel_"+objInstId).attr("disabled",true);
							$("#terminalText_"+objInstId).val(coupon.couponInstanceNumber);
							$("#terminalText_"+objInstId).attr("disabled",true);
							$("#terminalBtn_"+objInstId).hide();
						}
					}
				}
			//}
		}
	};
	
	var _changereserveCode = function(){
		if(document.getElementById("if_p_reserveCode").checked){
			$("#reserveCode").css("background-color","white").attr("disabled", false) ;
		}else{
			$("#reserveCode").css("background-color","#E8E8E8").attr("disabled", true) ;
		}
	}
	
	//终端校验
	var _checkTerminalCode = function(obj){
		var prodId=$(obj).attr("prodId");
		var offerSpecId=$(obj).attr("offerSpecId");
//		var terminalGroupId=$(obj).attr("terminalGroupId");
		var num=$(obj).attr("num");
		var flag=$(obj).attr("flag");
		if(flag==undefined){
			flag = 0 ;
		}
		OrderInfo.termReserveFlag ="";
		//清空旧终端信息
		_filterAttach2Coupons(prodId,offerSpecId,num);

		//清空旧终端信息
//		for ( var i = 0; i < OrderInfo.attach2Coupons.length; i++) {
//			var attach2Coupon = OrderInfo.attach2Coupons[i];
//			if(offerSpecId == attach2Coupon.attachSepcId && prodId==attach2Coupon.prodId){
//				OrderInfo.attach2Coupons.splice(i,1);
//				break;
//			}
//		}
		var objInstId = prodId+"_"+offerSpecId;
//		var resId = $("#terminalSel_"+objInstId+"_"+terminalGroupId).val();
		var resIdArray = [];
		var terminalGroupIdArray = [];
		$("#"+objInstId+"  option").each(function(){
			resIdArray.push($(this).val());
		});
		$("#group_"+objInstId+"  option").each(function(){
			terminalGroupIdArray.push($(this).val());
		});
		var resId = resIdArray.join("|"); //拼接可用的资源规格id
		var terminalGroupId = terminalGroupIdArray.join("|"); //拼接可用的资源终端组id
		if((resId==undefined || $.trim(resId)=="") && (terminalGroupId==undefined || $.trim(terminalGroupId)=="")){
			$.alert("信息提示","终端规格不能为空！");
			return;
		}
		var instCode = $("#terminalText_"+objInstId + "_"+num).val();
		if(instCode==undefined || $.trim(instCode)==""){
			$.alert("信息提示","终端串码不能为空！");
			return;
		}
		if(document.getElementById("if_p_reserveCode").checked){
			var reserveCode = $("#reserveCode").val();
			if(reserveCode ==""){
				$.alert("信息提示","请输入终端预约码！");
				return;
			}
		}else{
			$.each(checkedOfferSpec,function(){
				var offerSpec = this;
				var specList = CacheData.getOfferSpecList(prodId);
				$.each(specList,function(){
					if(offerSpec.offerSpecId == this.offerSpecId){
						var $span = $("#li_"+prodId+"_"+this.offerSpecId).find("span"); //定位删除的附属
						this.isdel = "Y";
						_delServSpec(prodId,this); //取消订购销售品时
						order.dealer.removeAttDealer(prodId+"_"+offerSpecId); //删除协销人
						$("#li_"+prodId+"_"+this.offerSpecId).remove();
					}
				});
			});
			checkedOfferSpec = [];
		}
		if(_checkData(objInstId,instCode)){
			return;
		}
		var newSpec = _setSpec(prodId,offerSpecId);
		var param = {
			instCode : instCode,
			flag : flag,
			mktResId : resId,
			offerSpecId: offerSpecId,
			offerSpecName:newSpec.offerSpecName
			//termGroup : terminalGroupId  update by huangjj #13336需求资源要求这个参数不传
		};
		var data = query.prod.checkTerminal(param);
		if(data==undefined){
			return;
		}
		var activtyType ="";
		//遍历已开通附属销售品列表
		for ( var i = 0; i < AttachOffer.openList.length; i++) {
			var open = AttachOffer.openList[i];
			for ( var j = 0; j < open.specList.length; j++) {  //遍历当前产品下面的附属销售品
				var spec = open.specList[j];
				if(spec.isdel != "Y" && spec.isdel != "C" && ec.util.isArray(spec.agreementInfos)){  //订购的附属销售品
                    if(spec.agreementInfos[0].activtyType == 2){
                    	activtyType = "2";
				    }
				}
			}
		}
		if(data.statusCd==CONST.MKTRES_STATUS.USABLE || (data.statusCd==CONST.MKTRES_STATUS.HAVESALE && activtyType=="2")){
//			$("#terminalSel_"+objInstId).val(data.mktResId);
//			$("#terminalName").html(data.mktResName);
//			$("#terminalDesc").css("display","block");
//			var price = $("#terminalSel_"+objInstId).find("option:selected").attr("price");
			
			
			var mktPrice=0;//营销资源返回的单位是元
			var mktColor="";
			if(ec.util.isArray(data.mktAttrList)){
				$.each(data.mktAttrList,function(){
					if(this.attrId=="65010058"){
						mktPrice=this.attrValue;
					}else if(this.attrId=="60010004"){
						mktColor=this.attrValue;
					}
				});
			}
			$("#terminalName_"+num).html("终端规格："+data.mktResName+",终端颜色："+mktColor+",合约价格："+mktPrice+"元");
			$("#terminalDesc_"+num).css("display","block");
			
			/*$("#terRes_"+objInstId).show();
			$("#terName_"+objInstId).text(data.mktResName);
			$("#terCode_"+objInstId).text(data.instCode);	
			if(price!=undefined){
				$("#terPrice_"+objInstId).text(price/100 + "元");
			}*/
			var coupon = {
				couponUsageTypeCd : "5", //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
				inOutTypeId : "1",  //出入库类型
				inOutReasonId : 0, //出入库原因
				saleId : 1, //销售类型
				couponId : data.mktResId, //物品ID
				couponinfoStatusCd : "A", //物品处理状态
				chargeItemCd : CONST.CHARGE_ITEM_CD.COUPON_SALE, //物品费用项类型
				couponNum : 1, //物品数量
				storeId : data.mktResStoreId, //仓库ID
				storeName : "1", //仓库名称
				agentId : 1, //供应商ID
				apCharge : mktPrice, //物品价格,约定取值为营销资源的
				couponInstanceNumber : data.instCode, //物品实例编码
				ruleId : "", //物品规则ID
				partyId : OrderInfo.cust.custId, //客户ID
				prodId : prodId, //产品ID
				offerId : -1, //销售品实例ID
				attachSepcId : offerSpecId,
				state : "ADD", //动作
				relaSeq : "", //关联序列	
				num	: num, //第几个串码输入框
				attrList:data.mktAttrList //终端属性列表
			};
			if(data.statusCd==CONST.MKTRES_STATUS.HAVESALE && activtyType=="2"){//“已销售未补贴”的终端串码可以办理话补合约
				coupon.couponSource ="2"; //串码话补标识
			}
			if(CONST.getAppDesc()==0){
				coupon.termTypeFlag=data.termTypeFlag;
			}
			if(document.getElementById("if_p_reserveCode").checked){
				var custId = OrderInfo.cust.custId;
				var identityTypeCd  ="";
				var identityNum ="";
				if (custId == -1) {
					identityTypeCd = OrderInfo.boCustIdentities.identidiesTypeCd;
					identityNum =OrderInfo.boCustIdentities.identityNum;
				}
				var param = {
						reserveCode : reserveCode,
						couponId : data.mktResId,
						terminalPrice : mktPrice,
						custId : custId,
						identityTypeCd : identityTypeCd,
						identityNum : identityNum
				};
				var url = contextPath+"/mktRes/terminal/queryCouponReserveCodeCheck ";
				$.callServiceAsJson(url,param,{
					"before":function(){
//						$.ecOverlay("<strong>预约码校验中,请稍等...</strong>");
					},"always":function(){
//						$.unecOverlay();
					},
					"done" : function(response){
						if (response && response.code == -2) {
							$.each(checkedOfferSpec,function(){
								var offerSpec = this;
								var specList = CacheData.getOfferSpecList(prodId);
								$.each(specList,function(){
									if(offerSpec.offerSpecId == this.offerSpecId){
										var $span = $("#li_"+prodId+"_"+this.offerSpecId).find("span"); //定位删除的附属
										this.isdel = "Y";
										_delServSpec(prodId,this); //取消订购销售品时
										order.dealer.removeAttDealer(prodId+"_"+offerSpecId); //删除协销人
										$("#li_"+prodId+"_"+this.offerSpecId).remove();
									}
								});
							});
							checkedOfferSpec = [];
							$.alertM(response.data);
							return;
						} else if(response&&response.data&&response.data.code == 0) {
							if(response.data.buyFlag!=null && response.data.buyFlag=="Y"){
								var content = "您购买的终端和预约的终端不一致，请确认是否需要购买该终端？";
								$.confirm("信息确认",content,{ 
									yes:function(){
									},
									yesdo:function(){
										if(checkedReserveNbr!=response.data.couponInfo.reserveNbr){
											$.each(checkedOfferSpec,function(){
												var offerSpec = this;
												var specList = CacheData.getOfferSpecList(prodId);
												$.each(specList,function(){
													if(offerSpec.offerSpecId == this.offerSpecId){
														var $span = $("#li_"+prodId+"_"+this.offerSpecId).find("span"); //定位删除的附属
														this.isdel = "Y";
														_delServSpec(prodId,this); //取消订购销售品时
														order.dealer.removeAttDealer(prodId+"_"+offerSpecId); //删除协销人
														$("#li_"+prodId+"_"+this.offerSpecId).remove();
													}
												});
											});
										}
										checkedReserveNbr= response.data.couponInfo.reserveNbr;
										coupon.sourceId = checkedReserveNbr;
										OrderInfo.termReserveFlag = CONST.OL_TYPE_CD.ZDYY;
										OrderInfo.attach2Coupons.push(coupon);
										if(response.data.offerSpec.length>0){
											checkedOfferSpec = response.data.offerSpec;
											var content = '<form id="promotionForm"><div><table>';
											var selectStr = "";
											var optionStr = "";
											selectStr = selectStr+"<tr><td>可订购促销包: </td><td><select class='inputWidth183px' id="+checkedReserveNbr+"><br>"; 
											$.each(response.data.offerSpec,function(){
												var offerSpec = this;
												optionStr +='<option value="'+this.offerSpecId+'">'+this.offerSpecName+'</option>';
											});
											selectStr += optionStr + "</select></td></tr></tbody></table></div>"; 
											content +=selectStr;
											var offerSpecId;
											$.confirm("促销包选择",content,{ 
												yes:function(){	
													offerSpecId = $('#'+checkedReserveNbr+' option:selected').val();
													$(".ZebraDialog").remove();
									                $(".ZebraDialogOverlay").remove();
									                AttachOffer.selectAttachOffer(prodId,offerSpecId);
												},
												no:function(){
													
												}
											});
//											$('#promotionForm').bind('formIsValid', function(event, form) {
//												offerSpecId = $('#'+checkedReserveNbr+' option:selected').val();
//												$(".ZebraDialog").remove();
//								                $(".ZebraDialogOverlay").remove();
//								                AttachOffer.selectAttachOffer(prodId,offerSpecId);
//											}).ketchup({bindElementByClass:"ZebraDialog_Button1"});
											
										}
									},
									no:function(){
									}
								});
							}else{
								if(checkedReserveNbr!=response.data.couponInfo.reserveNbr){
									$.each(checkedOfferSpec,function(){
										var offerSpec = this;
										var specList = CacheData.getOfferSpecList(prodId);
										$.each(specList,function(){
											if(offerSpec.offerSpecId == this.offerSpecId){
												var $span = $("#li_"+prodId+"_"+this.offerSpecId).find("span"); //定位删除的附属
												this.isdel = "Y";
												_delServSpec(prodId,this); //取消订购销售品时
												order.dealer.removeAttDealer(prodId+"_"+offerSpecId); //删除协销人
												$("#li_"+prodId+"_"+this.offerSpecId).remove();
											}
										});
									});
								}
								checkedReserveNbr= response.data.couponInfo.reserveNbr;
								coupon.sourceId = checkedReserveNbr;
								OrderInfo.termReserveFlag = CONST.OL_TYPE_CD.ZDYY;
								OrderInfo.attach2Coupons.push(coupon);
								if(response.data.offerSpec.length>0){
									checkedOfferSpec = response.data.offerSpec;
									var content = '<form id="promotionForm"><div><table>';
									var selectStr = "";
									var optionStr = "";
									selectStr = selectStr+"<tr><td>可订购促销包: </td><td><select class='inputWidth183px' id="+checkedReserveNbr+"><br>"; 
									$.each(response.data.offerSpec,function(){
										var offerSpec = this;
										optionStr +='<option value="'+this.offerSpecId+'">'+this.offerSpecName+'</option>';
									});
									selectStr += optionStr + "</select></td></tr></tbody></table></div>"; 
									content +=selectStr;
									var offerSpecId;
									$.confirm("促销包选择",content,{ 
										yes:function(){
											offerSpecId = $('#'+checkedReserveNbr+' option:selected').val();
											$(".ZebraDialog").remove();
							                $(".ZebraDialogOverlay").remove();
							                AttachOffer.selectAttachOffer(prodId,offerSpecId);
										},
										no:function(){
											
										}
									});
//									$('#ZebraDialog_Button1').bind('click', function(){
//										offerSpecId = $('#'+checkedReserveNbr+' option:selected').val();
//										$(".ZebraDialog").remove();
//						                $(".ZebraDialogOverlay").remove();
//						                AttachOffer.selectAttachOffer(prodId,offerSpecId);
//									});
									
								}else {
									$.alert("信息提示",data.message);
								}
							}
						}else if(response && response.data && response.data.message
								&& response.data.code == 1){
							$.each(checkedOfferSpec,function(){
								var offerSpec = this;
								var specList = CacheData.getOfferSpecList(prodId);
								$.each(specList,function(){
									if(offerSpec.offerSpecId == this.offerSpecId){
										var $span = $("#li_"+prodId+"_"+this.offerSpecId).find("span"); //定位删除的附属
										this.isdel = "Y";
										_delServSpec(prodId,this); //取消订购销售品时
										order.dealer.removeAttDealer(prodId+"_"+offerSpecId); //删除协销人
										$("#li_"+prodId+"_"+this.offerSpecId).remove();
									}
								});
							});
							checkedOfferSpec = [];
							$.alert("提示", response.data.message);
							return;
						}else{
							$.each(checkedOfferSpec,function(){
								var offerSpec = this;
								var specList = CacheData.getOfferSpecList(prodId);
								$.each(specList,function(){
									if(offerSpec.offerSpecId == this.offerSpecId){
										var $span = $("#li_"+prodId+"_"+this.offerSpecId).find("span"); //定位删除的附属
										this.isdel = "Y";
										_delServSpec(prodId,this); //取消订购销售品时
										order.dealer.removeAttDealer(prodId+"_"+offerSpecId); //删除协销人
										$("#li_"+prodId+"_"+this.offerSpecId).remove();
									}
								});
							});
							checkedOfferSpec = [];
							$.alert("提示","<br/>终端预约码校验失败，请稍后重试！");
							return;
						}
					}
				});
			}else{
				$.alert("信息提示",data.message);
				OrderInfo.attach2Coupons.push(coupon);
			}
		}else if(data.statusCd==CONST.MKTRES_STATUS.HAVESALE){
			$.alert("提示","终端当前状态为已销售为补贴[1115],只有在办理话补合约时可用");
		}else{
			$.alert("提示",data.message);
		}
	};
	
	//添加可选包到缓存列表
	var _setSpec = function(prodId,offerSpecId){
		var newSpec = CacheData.getOfferSpec(prodId,offerSpecId);  //没有在已选列表里面
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			newSpec = query.offer.queryAttachOfferSpec(prodId,offerSpecId); //重新获取销售品构成
			if(!newSpec){
				return;
			}
			CacheData.setOfferSpec(prodId,newSpec);
		}
		return newSpec;
	};
	
	//添加到开通列表
	var _addOpenServList = function(prodId,servSpecId,servSpecName,ifParams){
		//从已开通功能产品中找
		var serv = CacheData.getServBySpecId(prodId,servSpecId); 
		if(serv != undefined){
			$("#li_"+prodId+"_"+serv.servId).find("span").removeClass("del");
			serv.isdel = "N";
			return;
		}
		//从已选择功能产品中找
		var spec = CacheData.getServSpec(prodId,servSpecId);
		if(spec == undefined){
			var newSpec = {
				objId : servSpecId, //调用公用方法使用
				servSpecId : servSpecId,
				servSpecName : servSpecName,
				ifParams : ifParams,
				isdel : "C"   //加入到缓存列表没有做页面操作为C
			};
			var inPamam = {
				prodSpecId:servSpecId
			};
			if(ifParams == "Y"){
				var data = query.prod.prodSpecParamQuery(inPamam);// 产品功能产品属性
				if(data==undefined || data.result==undefined){
					return;
				}
				newSpec.prodSpecParams = data.result.prodSpecParams;
			}
			CacheData.setServSpec(prodId,newSpec); //添加到已开通列表里
			spec = newSpec;
		} 
		if(spec.isdel == "C"){  //没有订购过
			$('#li_'+prodId+'_'+servSpecId).remove(); //删除可开通功能产品里面
			var $li = $('<a id="li_'+prodId+'_'+servSpecId+'" onclick="AttachOffer.closeServSpec('+prodId+','+servSpecId+',\''+servSpecName+'\',\''+ifParams+'\')" class="list-group-item"></a>');
			$li.append('<span id="span_'+prodId+'_'+servSpecId+'">'+spec.servSpecName+'</span>');
			if(spec.ifDault==0){ //必须
				$li.removeAttr("onclick");	
			}else{
				$li.append('<span id="span_remove_'+prodId+'_'+servSpecId+'" class="glyphicon glyphicon-remove pull-right" aria-hidden="true"></span>');
			}
			$("#open_serv_ul_"+prodId).append($li);
		}else {
		    $("#li_"+prodId+"_"+servSpecId).find("span").removeClass("del");
		}
		spec.isdel = "N";
		_showHideUim(0,prodId,servSpecId);//显示或者隐藏补换卡
	};
	
	//现在主销售品参数
	var _showMainParam = function(){
		var content = CacheData.getParamContent(-1,OrderInfo.offerSpec,0);
		$.confirm("参数设置： ",content,{ 
			yes:function(){	
				
			},
			no:function(){
				
			}
		});
		$('#paramForm').bind('formIsValid', function(event, form) {
		}).ketchup({bindElement:"easyDialogYesBtn"});
	};
	
	//显示参数
	var _showParam = function(prodId,offerSpecId,flag){	
		if(flag==1){ //显示已订购附属		
			var offer = CacheData.getOfferBySpecId(prodId,offerSpecId);
			if(!ec.util.isArray(offer.offerMemberInfos)){	
				var param = {
					prodId:prodId,
					areaId: OrderInfo.getProdAreaId(prodId),
					offerId:offer.offerId	
				};
				param.acctNbr = OrderInfo.getAccessNumber(prodId);
				var data = query.offer.queryOfferInst(param);
				if(data==undefined){
					return;
				}
				offer.offerMemberInfos = data.offerMemberInfos;
				offer.offerSpec = data.offerSpec;
			}
			if(!offer.isGetParam){  //已订购附属没有参数，需要获取销售品参数
				var param = {   
				    offerTypeCd : "2",
				    offerId: offer.offerId,
				    offerSpecId : offer.offerSpecId
				};
				var offerParam = query.offer.queryOfferParam(param); //重新获取销售品参数
				if(offerParam==undefined){
					return;
				}else{
					offer.offerParamInfos = offerParam.offerParamInfos;
					offer.isGetParam = true;
				}
			}
			var content = CacheData.getParamContent(prodId,offer,flag);
			$.confirm("参数设置： ",content,{ 
				yes:function(){		
				},
				no:function(){
				}
			});
			order.protocolnbr.init();
			$('#paramForm').bind('formIsValid', function(event, form) {
				//参数输入校验
				if(!paramInputCheck()){
					return;
				}
				var isset = false;
				$.each(offer.offerSpec.offerSpecParams,function(){
					var itemInfo = CacheData.getOfferParam(prodId,offer.offerId,this.itemSpecId);
					if(itemInfo.itemSpecId == CONST.ITEM_SPEC.PROT_NUMBER){
						itemInfo.setValue = $("#select1").val();
					}else{
					    itemInfo.setValue = $("#"+prodId+"_"+this.itemSpecId).val();
					}
					if(itemInfo.value!=itemInfo.setValue){
						itemInfo.isUpdate = "Y";
						isset = true;
					}
				});
				if(isset){
					$("#can_"+prodId+"_"+offer.offerId).removeClass("canshu").addClass("canshu2");
					offer.isset = "Y";
					offer.update = "Y";
				}else{
					$("#can_"+prodId+"_"+offer.offerId).removeClass("canshu2").addClass("canshu");
					offer.isset = "N";
					offer.update = "N";
				}
				$(".ZebraDialog").remove();
                $(".ZebraDialogOverlay").remove();
			}).ketchup({bindElementByClass:"ZebraDialog_Button1"});		
		}else {
			var spec = CacheData.getOfferSpec(prodId,offerSpecId);
			if(spec == undefined){  //未开通的附属销售品，需要获取销售品构成
				spec = query.offer.queryAttachOfferSpec(prodId,offerSpecId); //重新获取销售品构成
				if(!spec){
					return;
				}
			}
			var content = CacheData.getParamContent(prodId,spec,flag);	
			$.confirm("参数设置： ",content,{ 
				yes:function(){
				},
				no:function(){
				}
			});
			order.protocolnbr.init();
			$('#paramForm').bind('formIsValid', function(event, form){
				//参数输入校验
				if(!paramInputCheck()){
					return;
				}
				if(!!spec.offerSpecParams){
					for (var i = 0; i < spec.offerSpecParams.length; i++) {
						var param = spec.offerSpecParams[i];
						var itemSpec = CacheData.getSpecParam(prodId,offerSpecId,param.itemSpecId);
						if(itemSpec.itemSpecId == CONST.ITEM_SPEC.PROT_NUMBER){
							itemSpec.setValue = $("#select1").val();
						}else{
							itemSpec.setValue = $("#"+prodId+"_"+param.itemSpecId).val();
						}
					}
				}
				if(spec.offerRoles!=undefined && spec.offerRoles.length>0){
					for (var i = 0; i < spec.offerRoles.length; i++) {
						var offerRole = spec.offerRoles[i];
						for (var j = 0; j < offerRole.roleObjs.length; j++) {
							var roleObj = offerRole.roleObjs[j];
							if(!!roleObj.prodSpecParams){
								for (var k = 0; k < roleObj.prodSpecParams.length; k++) {
									var prodParam = roleObj.prodSpecParams[k];
									var prodItem = CacheData.getProdSpecParam(prodId,offerSpecId,prodParam.itemSpecId);
									prodItem.value = $("#"+prodId+"_"+prodParam.itemSpecId).val();
								}
							}
						}
					}
				}
				$("#can_"+prodId+"_"+offerSpecId).removeClass("canshu").addClass("canshu2");
				var attchSpec = CacheData.getOfferSpec(prodId,offerSpecId);
				attchSpec.isset = "Y";
				$(".ZebraDialog").remove();
                $(".ZebraDialogOverlay").remove();
			}).ketchup({bindElementByClass:"ZebraDialog_Button1"});	
		}
	};
	
	//显示服务参数
	var _showServParam = function(prodId,servSpecId,flag){
		if(flag==1){ //显示已订购附属
			var serv = CacheData.getServBySpecId(prodId,servSpecId);
			var param = {
				prodId : serv.servId,
				ifServItem:"Y"
			};
			if(!serv.isGetParamSpec){  //已订购附属没有参数，需要获取销售品参数	
				param.prodSpecId = serv.servSpecId;
				var dataSepc = query.prod.prodSpecParamQuery(param); //重新获取销售品参数
				if(dataSepc==undefined){
					return;
				}else{
					serv.prodSpecParams = dataSepc.result.prodSpecParams;
					serv.isGetParamSpec = true;
				}
			}
			if(!serv.isGetParamInst){  //已订购附属没有参数，需要获取销售品参数
				var data = query.prod.prodInstParamQuery(param); //重新获取销售品参数
				if(data==undefined){
					return;
				}else{
					serv.prodInstParams = data.result.prodInstParams;
					serv.isGetParamInst = true;
				}
			}
			var content = CacheData.getParamContent(prodId,serv,3);
			$.confirm("参数设置： ",content,{ 
				yes:function(){	
					
				},
				no:function(){
					
				}
			});
			$('#paramForm').bind('formIsValid', function(event, form) {
				var isset = false;
				$.each(serv.prodSpecParams,function(){
					var prodItem = CacheData.getServInstParam(prodId,serv.servId,this.itemSpecId);
					prodItem.setValue = $("#"+prodId+"_"+this.itemSpecId).val();	
					if(prodItem.value!=prodItem.setValue){
						prodItem.isUpdate = "Y";
						isset = true;
					}
				});
				if(isset){
					$("#can_"+prodId+"_"+serv.servId).removeClass("canshu").addClass("canshu2");
					serv.isset = "Y";
					serv.update = "Y";
				}else{
					$("#can_"+prodId+"_"+serv.servId).removeClass("canshu2").addClass("canshu");
					serv.isset = "N";
					serv.update = "N";
				}
				$(".ZebraDialog").remove();
                $(".ZebraDialogOverlay").remove();
			}).ketchup({bindElementByClass:"ZebraDialog_Button1"});
		
		}else {
			var spec = CacheData.getServSpec(prodId,servSpecId);
			if(spec == undefined){  //未开通的附属销售品，需要获取销售品构成
				return;
			}
			var content = CacheData.getParamContent(prodId,spec,2);	
			$.confirm("参数设置： ",content,{ 
				yes:function(){
				},
				no:function(){	
				}
			});
			$('#paramForm').bind('formIsValid', function(event, form){
				if(!!spec.prodSpecParams){
					for (var i = 0; i < spec.prodSpecParams.length; i++) {
						var param = spec.prodSpecParams[i];
						var itemSpec = CacheData.getServSpecParam(prodId,servSpecId,param.itemSpecId);
						itemSpec.setValue = $("#"+prodId+"_"+param.itemSpecId).val();
					}
				}
				$("#can_"+prodId+"_"+servSpecId).removeClass("canshu").addClass("canshu2");
				var attchSpec = CacheData.getServSpec(prodId,servSpecId);
				attchSpec.isset = "Y";
				$(".ZebraDialog").remove();
                $(".ZebraDialogOverlay").remove();
			}).ketchup({bindElementByClass:"ZebraDialog_Button1"});
		}
	};
	
	//（销售品）参数输入校验（服务参数暂未使用）
	var paramInputCheck = function(){
		var pass = true;
		$("#paramForm").find("input[type=text]").each(function(){
			var mask = $(this).attr("mask");
			var maskmsg = $(this).attr("maskmsg");
			if(mask!=null && mask!="" && mask.substring(0,1)=="/" && mask.substring(mask.length-1,mask.length)=="/"){
				if(!eval(mask).test($(this).val())){
					$.alert("提示",maskmsg);
					pass = false;
					return false;
				}
			}
		});
		return pass;
	};
	
	//销售品生失效时间显示
	var _showTime = function(prodId,offerSpecId,offerSpecName){	
		var data = OrderInfo.getPrivilege("EFF_TIME");		
		$('#attachName').text(offerSpecName+"--生失效设置");
		var spec = CacheData.getOfferSpec(prodId,offerSpecId);
		_initTime(spec);
		easyDialog.open({
			container : "div_time_dialog"
		});
		$("#timeSpan").off("click").on("click",function(){
			_setAttachTime(prodId,offerSpecId);
		});
		if(data==0){
			$("#startTimeTr").show();
			$("#endTimeTr").show();
		}else{
			$("#startTimeTr").hide();
			$("#endTimeTr").hide();
		}
	};
	
	//销售品生效时间显示
	var _showStartTime = function(){	
		var strDate =DateUtil.Format("yyyy年MM月dd日",new Date());
		var endDate = $("#endDt").val();
		if(endDate ==""){
			$.calendar({minDate:strDate});
		}else{
			$.calendar({minDate:strDate,maxDate:endDate});
		}
	};
	
	//销售品失效时间显示
	var _showEndTime = function(){	
		var strDate = $("#startDt").val();
		if(strDate==""){
			strDate =DateUtil.Format("yyyy年MM月dd日",new Date());
		}
		$.calendar({minDate:strDate});
	};
	
	//初始化时间设置页面
	var _initTime = function(spec){
		if(spec!=undefined && spec.ooTimes!=undefined){
			var ooTime = spec.ooTimes;
			$("input[name=startTimeType][value='"+ooTime.startType+"']").attr("checked","checked");
			$("input[name=endTimeType][value='"+ooTime.endType+"']").attr("checked","checked");
			$("#startDt").val("");
			$("#endDt").val("");
			$("#endTime").val("");
			if(ooTime.startType == 4){ //指定生效时间
				$("#startDt").val(ooTime.startDt);
			}
			if(ooTime.endType == 4){ //指定失效时间
				$("#endDt").val(ooTime.endDt);
			}else if(ooTime.endType == 5){  //有效时长
				$("#endTime").val(ooTime.effTime);
				$("#endTimeUnit").val(ooTime.effTimeUnitCd);
			}
		}else {
			$("input[name=startTimeType][value=1]").attr("checked","checked");
			$("input[name=endTimeType][value=1]").attr("checked","checked");
			$("#startDt").val("");
			$("#endDt").val("");
			$("#endTime").val("");
		}
	};
	
	//显示主套餐时间
	var _showOfferTime = function(){
		var data = OrderInfo.getPrivilege("EFF_TIME");		
		$('#attachName').text(OrderInfo.offerSpec.offerSpecName+"-生失效设置");
		_initTime(OrderInfo.offerSpec);
		easyDialog.open({
			container : "div_time_dialog"
		});
		$("#timeSpan").off("click").on("click",function(){
			_setMainTime();
		});
		if(data==0){
			$("#startTimeTr").show();
			$("#endTimeTr").show();
		}else{
			$("#startTimeTr").hide();
			$("#endTimeTr").hide();
		}
	};
	
	//显示主套餐构成
	var _showMainMember = function(){
		$('#memberName').text(OrderInfo.offerSpec.offerSpecName+"-构成");
		$("#main_member_div").empty();
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			var offerRole = this;
			if(this.memberRoleCd == CONST.MEMBER_ROLE_CD.CONTENT){
				var $ul = $('</div><ul id="serv_ul_'+prodId+'"></ul>');
				var $div = $('<div id="serv_div_'+prodId+'" class="fs_choosed"></div>');
				$("#main_member_div").append("<h4>"+this.offerRoleName+"</h4>").append($div.append($ul));
				$.each(offerRole.roleObjs,function(){
					var $li = $('<li id="li_'+prodId+'_'+this.objId+'">'+this.objName+'</li>');
					var $checkbox = $('<input type="checkbox" name="serv_check_'+prodId+'" servSpecId="'+this.objId+'"></input>');
					$ul.append($checkbox).append($li);
				});
				$("#main_member_div").append('<div class="clear"></div>');
			}else{
				$.each(offerRole.prodInsts,function(){
					var prodId = this.prodInstId;
					var $ul = $('</div><ul id="serv_ul_'+prodId+'"></ul>');
					var $div = $('<div id="serv_div_'+prodId+'" class="fs_choosed"></div>');
					$("#main_member_div").append("<h4>"+this.offerRoleName+"</h4>").append($div.append($ul));
					$.each(offerRole.roleObjs,function(){
						if(this.objType == CONST.OBJ_TYPE.SERV){
							var $li = $('<li id="li_'+prodId+'_'+this.objId+'">'+this.objName+'</li>');
							var $checkbox = $('<input type="checkbox" name="serv_check_'+prodId+'" servSpecId="'+this.objId+'"></input>');
							$ul.append($checkbox).append($li);		
						}
					});
					$("#main_member_div").append('<div class="clear"></div>');
				});
			}
		});
		easyDialog.open({
			container : "div_member_dialog"
		});
		
		$.each(OrderInfo.offerSpec.offerRoles,function(){  //自动勾选功能产品
			var offerRole = this;
			$.each(offerRole.prodInsts,function(){ //自动勾选接入产品已经选择的功能产品
				var prodInst = this;
				$.each(offerRole.roleObjs,function(){ //根据规格配置勾选默认的功能产品
					var servSpecId = this.objId;
					if(this.minQty>0){ //必选
						$("input[name='serv_check_"+prodInst.prodInstId+"']").each(function(){
							if(servSpecId==$(this).attr("servSpecId")){
								$(this).attr("checked","checked");
								$(this).attr("disabled","disabled");
							}
						});
					}
				});
				if(!!prodInst.servInsts){  
					$.each(prodInst.servInsts,function(){  //遍历产品实例下已经选择的功能产品
						var servSpecId = this.objId;
						$("input[name='serv_check_"+prodInst.prodInstId+"']").each(function(){
							if(servSpecId==$(this).attr("servSpecId")){
								$(this).attr("checked","checked");
							}
						});
					});
				}
			});
		});
		
		$("#memberSpan").off("click").on("click",function(){
			_setMainMember();
		});
	};
	
	//保存主销售品成员
	var _setMainMember = function(){
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			var offerRole = this;
			$.each(this.prodInsts,function(){
				var prodInst = this;
				prodInst.servInsts = [];
				$("input[name='serv_check_"+this.prodInstId+"']:checked").each(function(){
					var servSpecId = $(this).attr("servSpecId");
					$.each(offerRole.roleObjs,function(){
						if(this.objId==servSpecId){  //获取选择功能产品的构成
							prodInst.servInsts.push(this);	
						}
					});
				});
			});
		});
		easyDialog.close();
	};
	
	//获取ooTime节点
	var _getTime = function(){
		var ooTime = {
			state : "ADD" 
		};
		//封装生效时间
		var startRadio = $("input[name=startTimeType]:checked").attr("value");
		ooTime.startType = startRadio;
		if(startRadio==1){
			ooTime.isDefaultStart = "Y";
		}else if(startRadio==2){  //竣工生效，不传值
			
		}else if(startRadio==3){  //次月生效
			ooTime.startTime = 1;
			ooTime.startTimeUnitCd = 7;
			//ooTime.startDt = _getNextMonthFirstDate();
		}else if(startRadio==4){ //指定生效时间
			if($("#startDt").val()==""){
				$.alert("提示","指定生效时间不能为空!");
				return;
			}
			ooTime.startDt = $("#startDt").val();
		}
		//封装失效时间
		var endRadio = $("input[name=endTimeType]:checked").attr("value");	
		ooTime.endType = endRadio;
		if(endRadio==1){
			ooTime.isDefaultEnd = "Y";
		}else if(endRadio==4){
			if($("#endDt").val()==""){
				$.alert("提示","指定失效时间不能为空!");
				return;
			}
			ooTime.endDt = $("#endDt").val();
		}else if(endRadio==5){
			var end = $("#endTime").val();
			if(end==""){
				$.alert("提示","有效时长不能为空!");
				return;
			}
			if(isNaN(end)){
				$.alert("提示","有效时长必须为数字!");
				return;
			} 
			if(end<=0){
				$.alert("提示","有效时长必须大于0!");
				return;
			} 
			ooTime.effTime = end;
			ooTime.effTimeUnitCd = $("#endTimeUnit").val();
		}
		return ooTime;
	};
	
	//设置主销售品生失效时间设置
	var _setMainTime = function(){
		var ooTime = _getTime();
		if(ooTime==undefined){
			return;
		}
		OrderInfo.offerSpec.ooTimes = ooTime;
		$("#mainTime").removeClass("time").addClass("time2");
		easyDialog.close();
	};
	
	//设置附属销售品生失效时间设置
	var _setAttachTime = function(prodId,offerSpecId){
		var ooTime = _getTime();
		if(ooTime==undefined){
			return;
		}
		var spec = CacheData.getOfferSpec(prodId,offerSpecId);
		spec.ooTimes = ooTime;
		$("#time_"+prodId+"_"+offerSpecId).removeClass("time").addClass("time2");
		easyDialog.close();
	};
	
	//获取下个月第一天
	/*var _getNextMonthFirstDate = function(){
		var d = new Date();
		var yyyy = 1900+d.getYear();    
		var MM = d.getMonth()+1;      
		var dd = "01";   
		if(MM==12){
			yyyy++;
			MM = "01";	
		}else if(MM<9){
			MM++;
			MM = "0"+MM;
		}else {
			MM++;
		}
		return yyyy+"-"+MM+"-"+dd; 
	};*/
	var _changeLabel1=function(prodId,prodSpecId,labelId){
		//var labelId=$(obj).val();
		_changeLabel(prodId,prodSpecId,labelId);
	};
	//切换标签
	var _changeLabel = function(prodId,prodSpecId,labelId){
		if(labelId==''){
			labelId=$("#attachType_"+prodId).val();
		}
		
		$("#attach_div_"+prodId).hide();
		$("#btn_hide_"+prodId).hide();
		$("#attachSearch_div_"+prodId+" div").each(function(){
			$(this).hide();
		});
		$("#attach_div_"+prodId).attr("value",labelId);
		var $ul = $("#ul_"+prodId+"_"+labelId); //创建ul
		if($ul[0]==undefined){ //没有加载过，重新加载  
			var queryType = "3";
			if(prodId>0){
				queryType = "";
			}
			if(labelId==CONST.LABEL.SERV){  //功能产品
				$('#open_serv_ul_'+prodId).show();
				var param = {
					prodId : prodId,
					prodSpecId : prodSpecId,
					queryType : queryType,
					labelId : labelId
				};
				var data = query.offer.queryServSpec(param);
				var $ul = $('<div id="ul_'+prodId+'_'+labelId+'"></div>');
				if(data!=undefined && data.resultCode == "0"){
					if(ec.util.isArray(data.result.servSpec)){
						var servList = CacheData.getServList(prodId);//过滤已订购
						var servSpecList = CacheData.getServSpecList(prodId);//过滤已选择
						var i=0;
						var html='';
						$.each(data.result.servSpec,function(){
							var servSpecId = this.servSpecId;
							var flag = true;
							$.each(servList,function(){
								if(this.servSpecId==servSpecId&&this.isDel!="C"){
									flag = false;
									return false;
								}
							});
							$.each(servSpecList,function(){
								if(this.servSpecId==servSpecId){
									flag = false;
									return false;
								}
							});
							if(flag){
			                  	html='<a class="list-group-item" href="javascript:AttachOffer.openServSpec('+prodId+','+this.servSpecId+',\''+this.servSpecName+'\',\''+this.ifParams+'\')" id="li_'+prodId+'_'+this.servSpecId+'">';
								html+='<h5 class="list-group-item-heading">'+ this.servSpecName +'</h5>';
								//'<span></span><span>';
								//html+='<a href="javascript:AttachOffer.openServSpec('+prodId+','+this.servSpecId+',\''+this.servSpecName+'\',\''+this.ifParams+'\')" class="abtn03 icon-buy">&nbsp;</a></span>';
								//html+='</span>';
//								if(i%2==1){
									//html+='</div></li>';
									html+='</a>';
									$ul.append(html);
//								}
								i++;
							}
						});
						if(i==0){
							html='<a href="javascript:void(0);" class="list-group-item"><span>没有可订购的功能产品</span></a>';
							$ul.append(html);
						}
					}else{
						var html='<a href="javascript:void(0);" class="list-group-item"><span>没有可订购的功能产品</span></a>';
						$ul.append(html);
					}
				}
				$("#attachSearch_div_"+prodId).append($ul);
				//$.jqmRefresh($("#attachSearch_div_"+prodId));
			}else{
				var param = {
					prodSpecId : prodSpecId,
					offerSpecIds : [],
					queryType : queryType,
					prodId : prodId,
					partyId : OrderInfo.cust.custId,
					labelId : labelId,
					ifCommonUse : ""			
				};
				if(OrderInfo.actionFlag == 2){ //套餐变更		
					$.each(OrderInfo.offerSpec.offerRoles,function(){
						if(ec.util.isArray(this.prodInsts)){
							$.each(this.prodInsts,function(){
								if(this.prodInstId==prodId){
									param.acctNbr = this.accessNumber;
									param.offerRoleId = this.offerRoleId;
									param.offerSpecIds.push(OrderInfo.offerSpec.offerSpecId);	
									return false;
								}
							});
						}
					});
				}else if(OrderInfo.actionFlag == 3 || OrderInfo.actionFlag == 22){  //可选包
					var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
					param.acctNbr = prodInfo.accNbr;
					if(!ec.util.isObj(prodInfo.prodOfferId)){
						prodInfo.prodOfferId = "";
					}
					var offerRoleId = CacheData.getOfferMember(prodInfo.prodInstId).offerRoleId;
					if(offerRoleId==undefined){
						offerRoleId = "";
					}
					param.offerRoleId = offerRoleId;
					param.offerSpecIds.push(prodInfo.prodOfferId);
				}else { //新装
					param.offerSpecIds.push(OrderInfo.offerSpec.offerSpecId);
					var prodInst = OrderInfo.getProdInst(prodId);
					if(prodInst){
						param.offerRoleId = prodInst.offerRoleId;
					}
				}
				query.offer.queryCanBuyAttachSpec(param,function(data){
					var $ul = $('<div id="ul_'+prodId+'_'+labelId+'" ></div>');
					if(data!=undefined && data.resultCode == "0"){
						if(ec.util.isArray(data.result.offerSpecList)){
							var offerList = CacheData.getOfferList(prodId); //过滤已订购
							var offerSpecList = CacheData.getOfferSpecList(prodId);//过滤已选择
							var i=0;
							var html='';
							$.each(data.result.offerSpecList,function(){
								var offerSpecId = this.offerSpecId;
								var flag = true;
								$.each(offerList,function(){
									if(this.offerSpecId==offerSpecId&&this.isDel!="C"){
										flag = false;
										return false;
									}
								});
								$.each(offerSpecList,function(){
									if(this.offerSpecId==offerSpecId){
										flag = false;
										return false;
									}
								});
								if(flag){
									html='<a class="list-group-item" href="javascript:AttachOffer.addOfferSpec('+prodId+','+this.offerSpecId+')" id="li_'+prodId+'_'+this.offerSpecId+'">';
								//html+=this.offerSpecName+'<span></span><span>';
									html+='<h5 class="list-group-item-heading">'+ this.offerSpecName +'</h5>';
								//	html+='<a href="javascript:AttachOffer.addOfferSpec('+prodId+','+this.offerSpecId+')" class="abtn03 icon-buy">&nbsp;</a></span>';
								//	html+='</span>';
//									if(i%2==1){
										html+='</a>';
										$ul.append(html);
//									}
									i++;
								}
							});
							if(i==0){
								html='<a href="javascript:void(0);" class="list-group-item"><span>没有可订购的可选包</span></a>';
								$ul.append(html);
							}
						}else{
							var html='<a href="javascript:void(0);" class="list-group-item"><span>没有可订购的可选包</span></a>';
							$ul.append(html);
						}
					}
					$("#attachSearch_div_"+prodId).append($ul);
//					$.jqmRefresh($("#attachSearch_div_"+prodId));
				});
			}
		}else{
			$("#ul_"+prodId+"_"+labelId).show();
		}
	};
	
	//开通跟取消开通功能产品时判断是否显示跟隐藏补换卡
	var _showHideUim = function(flag,prodId,servSpecId){
		if(CONST.getAppDesc()==0 && servSpecId == CONST.PROD_SPEC.PROD_FUN_4G){ //4G系统并且是开通或者关闭4g功能产品
			var prodClass = order.prodModify.choosedProdInfo.prodClass; //可选包变更
			if(OrderInfo.actionFlag==2||OrderInfo.actionFlag==21){//套餐变更
				prodClass = CacheData.getOfferMember(prodId).prodClass;
				if(prodClass==undefined && offerChange.oldMemberFlag){
					$.each(OrderInfo.oldoffer,function(){
						$.each(this.offerMemberInfos,function(){
							if(this.objInstId==prodId){
								prodClass = this.prodClass;
							}
						});
					});
				}
			}else if(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6){
				for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
					if(prodId == OrderInfo.oldprodInstInfos[i].prodInstId){
						prodClass = OrderInfo.oldprodInstInfos[i].prodClass;
					}
				}
			}
			if(flag==0){ //开通功能产品
				if(prodClass==CONST.PROD_CLASS.THREE){ //3G卡需要补卡
					$("#title_"+prodId).show();
					$("#uimDiv_"+prodId).show();
					
					var actionFalg=OrderInfo.actionFlag;
					var instCode=OrderInfo.newOrderNumInfo.mktResInstCode;
					var codeMsg=OrderInfo.newOrderNumInfo.codeMsg;
					if(actionFalg=="3" && OrderInfo.provinceInfo.reloadFlag=="Y"){
						if(codeMsg!=null && codeMsg!=""){
							alert(codeMsg);
						}else{
							if(instCode!=null && instCode!=""){
								$("#uim_txt_"+prodId).val(instCode);//将UIM卡信息放入
								$("#uim_check_btn_"+prodId).hide();
								$("#uim_release_btn_"+prodId).hide();
								$("#uim_txt_"+prodId).attr("disabled",true);
								
								var uimParam = {
									"instCode":instCode
								};
								
								var response = $.callServiceAsJsonGet(contextPath+"/token/pc/mktRes/qrymktResInstInfo",uimParam);
								
								if (response.code==0) {
									if(response.data.mktResBaseInfo){
										var statusCd=response.data.mktResBaseInfo.statusCd;
										if(statusCd=="1102"){
											var offerId="";
											if(ec.util.isArray(OrderInfo.oldprodInstInfos)){//判断是否是纳入老用户
												$.each(OrderInfo.oldprodInstInfos,function(){
													if(this.prodInstId==prodId){
														offerId = this.mainProdOfferInstInfos[0].prodOfferInstId;
													}
												});
											}else{
												offerId = order.prodModify.choosedProdInfo.prodOfferInstId;
											}
											
											_packageCouponInfo(prodId,offerId,response,instCode);
										}else{
											alert("UIM卡不是预占状态，当前为"+statusCd);
										}
									}else{
										alert("查询不到UIM卡["+instCode+"]信息");
									}
								}else if (response.code==-2){
									alert(response.data);
								}else {
									alert("UIM信息查询接口出错,稍后重试");
								}
							}
						}
					}
					//老用户uim卡
					if(OrderInfo.actionFlag==2 && OrderInfo.mktResInstCode!=undefined && OrderInfo.mktResInstCode!=null && OrderInfo.mktResInstCode!="" && OrderInfo.mktResInstCode!="null" && OrderInfo.provinceInfo.reloadFlag=="Y"){
						var nbrlist = [];
						var nbrflag = true;
						var offerId = "-1";
//						offerId = order.prodModify.choosedProdInfo.prodOfferInstId;
						$.each(OrderInfo.oldprodInstInfos,function(){
							if(this.prodInstId==prodId){
								offerId = this.mainProdOfferInstInfos[0].prodOfferInstId;
							}
						});
						//OrderInfo.newOrderNumInfo.mktResInstCode.split(",");
						var mktResInstCodesize =order.memberChange.mktResInstCode.split(",");
						for(var u=0;u<mktResInstCodesize.length;u++){
							if(mktResInstCodesize[u]!="" && mktResInstCodesize[u]!=null && mktResInstCodesize[u]!="null" && order.memberChange.oldSubPhoneNum!=""){
								var nbrAndUimCode = mktResInstCodesize[u].split("_");
								var _accNbr = nbrAndUimCode[0];
								var _uimCode = nbrAndUimCode[1];
								var oldSubPhoneNumsize = order.memberChange.oldSubPhoneNum.split(",");
								var uimflag = false;
								$.each(nbrlist,function(){
									if(this==_accNbr){
										nbrflag = false;
										return false;
									}else{
										nbrflag = true;
									}
								});
								if(!nbrflag){
									$.alert("提示","UIM卡"+_uimCode+"对应的号码重复");
									return;
								}
								for(var n=0;n<oldSubPhoneNumsize.length;n++){
									if(oldSubPhoneNumsize[n]==_accNbr){
										nbrlist.push(oldSubPhoneNumsize[n]);
										uimflag = true;
										$.each(OrderInfo.oldoffer,function(){
											$.each(this.offerMemberInfos,function(){
												if(this.accessNumber==_accNbr){
//													$("#uim_txt_"+this.objInstId).attr("disabled",true);
													var uimParam = {
															"instCode":_uimCode
													};
													var response = $.callServiceAsJsonGet(contextPath+"/token/pc/mktRes/qrymktResInstInfo",uimParam);
													if (response.code==0) {
														if(response.data.mktResBaseInfo){
															if(response.data.mktResBaseInfo.statusCd=="1102"){
																$("#uim_check_btn_"+this.objInstId).attr("disabled",true);
																$("#uim_release_btn_"+this.objInstId).attr("disabled",false);
																$("#uim_release_btn_"+this.objInstId).removeClass("disabled");
																$("#uim_txt_"+this.objInstId).attr("disabled",true);
																$("#uim_txt_"+this.objInstId).val(_uimCode);
																var coupon = {
																		couponUsageTypeCd : "3", //物品使用类型
																		inOutTypeId : "1",  //出入库类型
																		inOutReasonId : 0, //出入库原因
																		saleId : 1, //销售类型
																		couponId : response.data.mktResBaseInfo.mktResId, //物品ID
																		couponinfoStatusCd : "A", //物品处理状态
																		chargeItemCd : "3000", //物品费用项类型
																		couponNum : response.data.mktResBaseInfo.qty, //物品数量
																		storeId : response.data.mktResBaseInfo.mktResStoreId, //仓库ID
																		storeName : "1", //仓库名称
																		agentId : 1, //供应商ID
																		apCharge : 0, //物品价格
																		couponInstanceNumber : _uimCode, //物品实例编码
																		terminalCode :_uimCode,//前台内部使用的UIM卡号
																		ruleId : "", //物品规则ID
																		partyId : OrderInfo.cust.custId, //客户ID
																		prodId :  this.objInstId, //产品ID
																		offerId : offerId, //销售品实例ID
																		state : "ADD", //动作
																		relaSeq : "" //关联序列	
																	};
																OrderInfo.clearProdUim(this.objInstId);
																OrderInfo.boProd2Tds.push(coupon);
															}else{
																$.alert("提示","UIM卡不是预占状态，当前为"+response.data.mktResBaseInfo.statusCd);
															}
														}else{
															$.alert("提示","查询不到UIM信息");
														}
													}else if (response.code==-2){
														$.alertM(response.data);
													}else {
														$.alert("提示","UIM信息查询接口出错,稍后重试");
													}
												}
											});
										})
									}
								}
								if(!uimflag){
									$.alert("提示","UIM卡"+_uimCode+"未匹配到接入号");
								}
							}
						}
					}
				}
			}else if(flag==1){//取消开通功能产品
				if(prodClass==CONST.PROD_CLASS.THREE){ //3G卡，已经显示补卡,判断是否隐藏补卡
					$("#uimDiv_"+prodId).hide();
				}
			}
		}
	};
	
	/**组装UIM数据信息*/
	var _packageCouponInfo=function(prodId,offerId,response,instCode){
		var coupon = {
				couponUsageTypeCd : "3", //物品使用类型
				inOutTypeId : "1",  //出入库类型
				inOutReasonId : 0, //出入库原因
				saleId : 1, //销售类型
				couponId : response.data.mktResBaseInfo.mktResId, //物品ID
				couponinfoStatusCd : "A", //物品处理状态
				chargeItemCd : "3000", //物品费用项类型
				couponNum : 1, //物品数量
				storeId : response.data.mktResBaseInfo.mktResStoreId, //仓库ID
				storeName : "1", //仓库名称
				agentId : 1, //供应商ID
				apCharge : 0, //物品价格
				couponInstanceNumber :instCode, //物品实例编码
				terminalCode : instCode,//前台内部使用的UIM卡号
				ruleId : "", //物品规则ID
				partyId : OrderInfo.cust.custId, //客户ID
				prodId :  prodId, //产品ID
				offerId : offerId, //销售品实例ID
				state : "ADD", //动作
				relaSeq : "" //关联序列	
		};
		
		OrderInfo.clearProdUim(prodId);
		OrderInfo.boProd2Tds.push(coupon);
	}
	
	//判断是否需要补卡
	var _isChangeUim = function(objId){
		if(CONST.getAppDesc()==0){
			var prodClass = order.prodModify.choosedProdInfo.prodClass; //可选包变更
			var prodId = order.prodModify.choosedProdInfo.prodInstId;
			if(OrderInfo.actionFlag==2||OrderInfo.actionFlag==21){//套餐变更
				var member = CacheData.getOfferMember(objId);
				prodClass = member.prodClass;
				prodId = member.objInstId;
			}else if(OrderInfo.actionFlag==6 && ec.util.isArray(OrderInfo.oldprodInstInfos)){
				$.each(OrderInfo.oldprodInstInfos,function(){
					if(this.prodInstId==objId){
						prodClass = this.prodClass;
						prodId = this.prodInstId;
					}
				});
			}
			if(prodClass==CONST.PROD_CLASS.THREE){ //3G卡，已经显示补卡,判断是否隐藏补卡
				var servSpec = CacheData.getServSpec(prodId,CONST.PROD_SPEC.PROD_FUN_4G);
				if(servSpec!=undefined && servSpec.isdel != "Y" && servSpec.isdel != "C"){ //有开通4G功能产品
					return true;
				}
			}
		}
		return false;
	};
	
	//获取附属销售品节点
	var _setAttachBusiOrder = function(busiOrders){
		//遍历已选功能产品列表
		$.each(AttachOffer.openServList,function(){
			var prodId = this.prodId;
			$.each(this.servSpecList,function(){
				if(this.isdel != "Y" && this.isdel != "C"){  //订购的功能产品  && _getRelaType(this.servSpecId)!="1000"
					SoOrder.createServ(this,prodId,0,busiOrders);
				}
			});
		});
		//遍历已订购功能产品列表
		$.each(AttachOffer.openedServList,function(){
			var prodId = this.prodId;
			$.each(this.servList,function(){
				if(this.isdel == "Y"){  //关闭功能产品
					SoOrder.createServ(this,prodId,1,busiOrders);
				}else {
					if(this.update=="Y"){  //变更功能产品
						SoOrder.createServ(this,prodId,2,busiOrders);
					}
				}
			});
		});
		//遍历已开通附属销售品列表
		for ( var i = 0; i < AttachOffer.openList.length; i++) {
			var open = AttachOffer.openList[i];
			for ( var j = 0; j < open.specList.length; j++) {  //遍历当前产品下面的附属销售品
				var spec = open.specList[j];
				if(spec.isdel != "Y" && spec.isdel != "C"){  //订购的附属销售品
					if(ec.util.isObj(spec.counts)){//组装重复订购的可选包
						for(var k=0;k<spec.counts;k++){
							SoOrder.createAttOffer(spec,open.prodId,0,busiOrders);
						}
					}else{
						SoOrder.createAttOffer(spec,open.prodId,0,busiOrders);
					}
				}
			}
		}
		//遍历已订购附属销售品列表
		for ( var i = 0; i < AttachOffer.openedList.length; i++) {
			var opened = AttachOffer.openedList[i];
			for ( var j = 0; j < opened.offerList.length; j++) {  //遍历当前产品下面的附属销售品
				var offer = opened.offerList[j];
				if(offer.isdel == "Y"){  //退订的附属销售品
					if(ec.util.isObj(offer.counts)){//组装重复订购的可选包
						for(var k=0;k<offer.orderCount;k++){
							offer.offerId=offer.offerIds[k];
							SoOrder.createAttOffer(offer,opened.prodId,1,busiOrders);
						}
					}else{
						SoOrder.createAttOffer(offer,opened.prodId,1,busiOrders);
					}
				}else if(offer.update=="Y"){//修改附属销售品
					SoOrder.createAttOffer(offer,opened.prodId,2,busiOrders);
				}else if(ec.util.isObj(offer.orderCount)&&ec.util.isObj(offer.counts)){
					if(offer.orderCount>offer.counts){//退订附属销售品
						for(var k=0;k<(offer.orderCount-offer.counts);k++){
							offer.offerId=offer.offerIds[k];
							SoOrder.createAttOffer(offer,opened.prodId,1,busiOrders);
						}
					}else if(offer.orderCount<offer.counts){//订购附属销售品
						var spec = CacheData.getOfferSpec(opened.prodId,offer.offerSpecId);
						for(var k=0;k<(offer.counts-offer.orderCount);k++){
							SoOrder.createAttOffer(spec,opened.prodId,0,busiOrders);
						}
					}
					
				}
			}
		}
		
		//遍历已选增值业务
		$.each(AttachOffer.openAppList,function(){
			var prodId = this.prodId;
			$.each(this.appList,function(){
				if(this.dfQty==1){  //开通增值业务
					SoOrder.createServ(this,prodId,0,busiOrders);
				}
			});
		});
	};
	//把对比省预校验的后有变动的 功能产品和可选包 放入临时缓存列表中
	var _setChangeList=function(prodId){
		AttachOffer.changeList=[];//清空
		var prodInfos = offerChange.resultOffer.prodInfos;//预校验返回的功能产品
		if(ec.util.isArray(prodInfos)){
			$.each(prodInfos,function(){
//				var prodId = this.accProdInstId;
				//容错处理，省份接入产品实例id传错
//				var flag = true;
//				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
//					if(this.objType==CONST.OBJ_TYPE.PROD && this.objInstId==prodId){  //接入类产品
//						flag = false;
//						return false;
//					}
//				});
				if(prodId!=this.accProdInstId){
					return true;
				}
				if(prodId!=this.prodInstId){ //功能产品
					var param={
						prodInstId:prodId
					};
					var serv = CacheData.getServ(prodId,this.prodInstId);//在已开通的功能产品里面查找
					var servSpec = CacheData.getServSpec(prodId,this.productId); //已开通里面查找
					if(this.state=="DEL"){
						if(serv!=undefined && serv.isdel != "Y"){
							param.objId=this.prodInstId;
							param.status=(serv.isdel!=undefined?serv.isdel:"N");
							param.objIdType=1;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
							serv.isdel = "Y";
							AttachOffer.changeList.push(param);
						}else if(servSpec!=undefined && servSpec.isdel !="Y" && servSpec.isdel !="C"){
							param.objId=this.productId;
							param.status=servSpec.isdel;
							param.objIdType=2;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
							servSpec.isdel = "Y";
							AttachOffer.changeList.push(param);
						}	
					}else if(this.state=="ADD"){
						if(serv!=undefined && serv.isdel == "Y"){  //在已开通里面，修改不让关闭
							param.objId=this.prodInstId;
							param.status=serv.isdel;
							param.objIdType=1;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
							serv.isdel = "N";
							AttachOffer.changeList.push(param);
						}else if(servSpec != undefined && servSpec.isdel =="Y"){
							param.objId=this.productId;
							param.status=servSpec.isdel;
							param.objIdType=2;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
							servSpec.isdel = "N";
							AttachOffer.changeList.push(param);
						}else if(serv==undefined && servSpec==undefined){
							param.objId=this.productId;
							param.status="Y";
							param.objIdType=2;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
							AttachOffer.changeList.push(param);
							if(this.productId!=undefined && this.productId!=""){
//								AttachOffer.openServSpec(prodId,this.productId);
								var newSerSpec = {
										objId : this.productId,
										servSpecId : this.productId,
										servSpecName : this.productName,
										ifParams : "N",
										isdel : "N"  
									};
								CacheData.setServSpec(prodId,newSerSpec); //添加到已开通列表里
								var servSpec = CacheData.getServSpec(prodId,this.productId); //已开通里面查找
								servSpec.isdel="N";
							}
						}
					}
				}
			});
		}
		var offers = offerChange.resultOffer.prodOfferInfos;//省预校验返回的可选包
		if(ec.util.isArray(offers)){
			$.each(offers,function(){
				if(this.memberInfo==undefined){
					return true;
				}
				var flag = true;
				$.each(this.memberInfo,function(){  //寻找该销售品属于哪个产品
					if(ec.util.isObj(this.accProdInstId)&&prodId == this.accProdInstId){
						flag = false;
						return false;
					}
				});
				if(flag){
					return true;
				}
				var param={
						prodInstId:prodId
					};
				var offer = CacheData.getOffer(prodId,this.prodOfferInstId); //已开通里面查找
				var offerSpec = CacheData.getOfferSpec(prodId,this.prodOfferId); //已选里面查找
				if(this.state=="DEL"){
					if(offer!=undefined && offer.isdel != "Y"){
						param.objId=this.prodOfferInstId;
						param.status=(offer.isdel!=undefined?offer.isdel:"N");
						param.objIdType=3;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
						offer.isdel = "Y";
						AttachOffer.changeList.push(param);
					}else if(offerSpec!=undefined && offerSpec.isdel !="Y" && offerSpec.isdel !="C"){
						param.objId=this.prodOfferId;
						param.status=offerSpec.isdel;
						param.objIdType=4;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
						offerSpec.isdel = "Y";
						AttachOffer.changeList.push(param);
					}	
				}else if(this.state=="ADD"){
					if(offer!=undefined && offer.isdel == "Y"){  //在已开通里面，修改不让关闭
						param.objId=this.prodOfferInstId;
						param.status=offer.isdel;
						param.objIdType=3;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
						offer.isdel = "N";
						AttachOffer.changeList.push(param);
					}else if(offerSpec != undefined && offerSpec.isdel =="Y"){
						param.objId=this.prodOfferId;
						param.status=offerSpec.isdel;
						param.objIdType=4;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
						offerSpec.isdel = "N";
						AttachOffer.changeList.push(param);
					}else if(offer==undefined && offerSpec==undefined){
						param.objId=this.prodOfferId;
						param.status="Y";
						param.objIdType=4;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
						AttachOffer.changeList.push(param);
						if(ec.util.isObj(this.prodOfferId) && this.prodOfferId!=OrderInfo.offerSpec.offerSpecId){
//							AttachOffer.addOfferSpecByCheck(prodId,this.prodOfferId);
							var newOfferSpec=_setSpec(prodId,this.prodOfferId);
							newOfferSpec.isdel="N";
						}
					}
				}
			});
		}
	};
	//还原预校验前的缓存信息
	var _reductionChangList=function(prodId){
		$.each(AttachOffer.changeList,function(){
			if(this.prodInstId==prodId){
				if(this.objIdType==1){
					var serv = CacheData.getServ(prodId,this.objId);//在已开通的功能产品里面查找
					if(serv!=undefined){
						serv.isdel=this.status;
					}
				}else if(this.objIdType==2){
					var servSpec = CacheData.getServSpec(prodId,this.objId);//在已选的功能产品里面查找
					if(servSpec!=undefined){
						servSpec.isdel=this.status;
					}
				}else if(this.objIdType==3){
					var offer = CacheData.getOffer(prodId,this.objId); //已开通里面查找
					if(offer!=undefined){
						offer.isdel=this.status;
					}
				}else if(this.objIdType==4){
					var offerSpec = CacheData.getOfferSpec(prodId,this.objId); //已选里面查找
					if(offerSpec!=undefined){
						offerSpec.isdel=this.status;
					}
				}
			}
		});
	};
	//查询销售品对象的互斥依赖连带的关系
	var _servExDepReByRoleObjs=function(prodId,offerSpecId){
		var newSpec = _setSpec(prodId,offerSpecId);
		paramObj.excludeServ=[];//初始化
		paramObj.dependServ=[];//初始化
		paramObj.relatedServ=[];//初始化
		paramObj.offerListServ=[];//初始化
		var globContent="";
		$.each(newSpec.offerRoles,function(){
			$.each(this.roleObjs,function(){
				if(this.objType==4 && this.selQty==1){
						var servSpec = CacheData.getServSpec(prodId,this.objId); //在已选列表中查找
						if(servSpec==undefined){   //在可订购功能产品里面 
							var serv = CacheData.getServBySpecId(prodId,this.objId); //在已开通列表中查找
							if(serv==undefined){
								var newServSpec = {
										objId : this.objId, //调用公用方法使用
										servSpecId : this.objId,
										servSpecName : this.objName,
										ifParams : this.isCompParam,
										prodSpecParams : this.prodSpecParams,
										isdel : "C"   //加入到缓存列表没有做页面操作为C
								};
								CacheData.setServSpec(prodId,newServSpec); //添加到已开通列表里
								servSpec = newServSpec;
							}else{
								servSpec=serv;
							}
						}
						var servSpecId = servSpec.servSpecId;
						var param = CacheData.getExcDepServParam(prodId,servSpecId);
						if(param.orderedServSpecIds.length == 0){
//							AttachOffer.addOpenServList(prodId,servSpecId,servSpec.servSpecName,servSpec.ifParams);
						}else{
							var data=query.offer.queryExcludeDepend(param);//查询规则校验
							var content=paserServDataByObjs(data.result,prodId,servSpec,newSpec);
							if(content!=""){
								content=("开通【"+servSpec.servSpecName+"】功能产品：<br>"+content);
								globContent+=(content+"<br>");
							}
						}
				}
			});
		});
		return globContent;
	};
	
	//转换接口返回的互斥依赖
	var paramObj = {  
			excludeServ : [],  //互斥依赖显示列表
			dependServ : [], //存放互斥依赖列表
			relatedServ : [] , //连带
			offerListServ : []
	};
	//解析服务互斥依赖
	var paserServDataByObjs = function(result,prodId,serv,newSpec){
		var servExclude = result.servSpec.exclude; //互斥
		var servDepend = result.servSpec.depend; //依赖
		var servRelated = result.servSpec.related; //连带
		var servOfferList = result.servSpec.offerList; //带出的可选包
		var content = "";
		
		//解析功能产品互斥
		if(ec.util.isArray(servExclude)){
			$.each(servExclude,function(){
				var servList = CacheData.getServList(prodId); //互斥要去除已订购手动删除
				var flag = true;
				if(servList!=undefined){
					for ( var i = 0; i < servList.length; i++) {
						if(servList[i].isdel=="Y"){
							if(servList[i].servSpecId == this.servSpecId){  //返回互斥数组在已订购中删除，不需要判断
								flag = false;
								break;
							}
						}
					}
				}
				if(flag){
					content += "需要关闭：   " + this.servSpecName + "<br>";
					paramObj.excludeServ.push(this);
				}
			});
		}
		//解析功能产品依赖
		if(ec.util.isArray(servDepend)){
			$.each(servDepend,function(){
				if(!AttachOffer.filterServ(this.servSpecId,newSpec)){
					content += "需要开通：   " + this.servSpecName + "<br>";
					paramObj.dependServ.push(this);
				}
			});
		}
		//解析功能产品连带
		if(ec.util.isArray(servRelated)){
			$.each(servRelated,function(){
				if(!AttachOffer.filterServ(this.servSpecId,newSpec)){
					content += "需要开通：   " + this.servSpecName + "<br>";
					paramObj.relatedServ.push(this);
				}
			});
		}
		
		//解析带出的可选包，获取功能产品订购依赖互斥的接口返回的带出可选包拼接成字符串
		if(ec.util.isArray(servOfferList)){
			if(servOfferList.length>0){
				content += "需要订购：   <br>";
				$.each(servOfferList,function(){
					if(this.ifDault===0){
						content += '<input id="check_open_'+prodId+'_'+this.offerSpecId +'" type="checkbox" checked="checked" disabled="disabled">'+this.offerSpecName+'<br>'; 
					}else{
						content += '<input id="check_open_'+prodId+'_'+this.offerSpecId +'" type="checkbox" checked="checked">'+this.offerSpecName+'<br>'; 
					}
					paramObj.offerListServ.push(this);
				});
			}
		}
		
		return content;
	};
	
	//去重，把互斥依赖里面的信息进行去重处理
	var _filterServ=function(servSpecId,newSpec){
		var flag=false;
		$.each(newSpec.offerRoles,function(){
			$.each(this.roleObjs,function(){
				if(this.objType==4 && this.selQty==1){
					if(servSpecId==this.objId){
						flag=true;
						return false;
					}
				}
			});
		});
		if(!flag){
			if(ec.util.isArray(paramObj.dependServ)){
				for(var i=0;i<paramObj.dependServ.length;i++){
					if(servSpecId==paramObj.dependServ[i].servSpecId){
						flag=true;
						break;
					}
				}
			}
			if(!flag){
				if(ec.util.isArray(paramObj.relatedServ)){
					for(var i=0;i<paramObj.relatedServ.length;i++){
						if(servSpecId==paramObj.relatedServ[i].servSpecId){
							flag=true;
							break;
						}
					}
				}
			}
		}
		return flag;
	};
	
	//销售品角色成员对象是中 minQty大于0的话 就必须设置其为不能删除（暂定）
	var _minQtyFileter=function(prodId,servSpecId){
		//从已开通功能产品中找
		var serv = CacheData.getServBySpecId(prodId,servSpecId); 
		var $li,$span,$span_remove;
		if(serv != undefined){
			$li=$("#li_"+prodId+"_"+serv.servId);
			$span = $("#span_"+prodId+"_"+serv.servId);
			$span_remove = $("#span_remove_"+prodId+"_"+serv.servId);
		}else{
			$li=$("#li_"+prodId+"_"+servSpecId);
			$span = $("#span_"+prodId+"_"+servSpecId);
			$span_remove = $("#span_remove_"+prodId+"_"+servSpecId);
		}
		if($li!=undefined){
			if(ec.util.isObj($span)){
				$span.removeClass("del");
			}
			if(ec.util.isObj($span_remove)){
				$span_remove.hide();
			}
			$li.removeAttr("onclick");	
			
		}
	};
	
	/**
	 * 判断 该合约是否满足被订购的条件：主套餐成员实例数据小于最小终端数，需要进行提示，不允许受理
	 */
	var _manyPhoneFilter=function(prodId,offerSpecId){
			if(OrderInfo.actionFlag==14){
				return true;
			}
			var newSpec;
			var offer = CacheData.getOfferBySpecId(prodId,offerSpecId); //从已订购数据中找
			if(ec.util.isObj(offer)){
				newSpec=offer;
			}else{
				newSpec = _setSpec(prodId,offerSpecId);
			}
			if(newSpec==undefined){
				return false;
			}
			if(ec.util.isArray(newSpec.agreementInfos)){
				var num=0;
				if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag == 6){
					$.each(OrderInfo.offerSpec.offerRoles,function(){
					$.each(this.prodInsts,function(){
						if(this.objType==CONST.OBJ_TYPE.PROD){
							num++;
						}
						});
					});
				}else if(OrderInfo.actionFlag == 2 || OrderInfo.actionFlag == 3){
					$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
						if(this.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
							num++;
						}
					});
				}else if(OrderInfo.actionFlag == 21){
					$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
						if(this.objType==CONST.OBJ_TYPE.PROD&&this.objInstId==prodId){  //接入类产品
							num++;
						}
					});
				}
				
				var minNum=newSpec.agreementInfos[0].minNum;
				var maxNum=newSpec.agreementInfos[0].maxNum;
				if(!ec.util.isObj(minNum)){
					$.alert("信息提示","销售品规格查询，未返回最小合约数，请后台确认。");
					return false;
				}
				if(num<minNum){
					$.alert("信息提示","该合约的最小合约数为"+minNum+"个，而该套餐的成员实例只有"+num+"个，故无法办理该合约。");
					return false;
				}
				if(maxNum>num){
					newSpec.agreementInfos[0].maxNum=num;//取最小的一个为最大终端数
				}
			}
		return true;
	};
	
	//添加终端
	var _addAndDelTerminal=function(obj){
		var prodId=$(obj).attr("prodId");
		var offerSpecId=$(obj).attr("offerSpecId");
		var fag=$(obj).attr("fag");
		var newSpec;
		var offer = CacheData.getOfferBySpecId(prodId,offerSpecId); //从已订购数据中找
		if(ec.util.isObj(offer)){
			newSpec=offer;
		}else{
			newSpec = _setSpec(prodId,offerSpecId);
		}
		var objInstId = prodId+'_'+newSpec.offerSpecId;
		var maxNum=newSpec.agreementInfos[0].maxNum;
		var minNum=newSpec.agreementInfos[0].minNum;
		var $ul=$("#ul_"+objInstId);
		var $li=$("#ul_"+objInstId+" li");
		var length=$li.length-1;
		var isFastOffer = 0 ;
		if(ec.util.isArray(newSpec.extAttrParams)){
			$.each(newSpec.extAttrParams,function(){
				if(this.attrId == CONST.OFFER_FAST_FILL){
					isFastOffer = 1;
					return false;
				}
			});
		}
		if(fag==0){//添加终端
			if(totalNums>=maxNum){
				$.alert("信息提示","终端数已经达到最大，不能再添加了。");
				return;
			}
			var $liTerminalAdd=$('<li class="form-group"><label for="exampleInputFile">终端校验：</label><div class="input-group"><input id="terminalText_'+objInstId+'_'+(length/2+1)+'" type="text" class="form-control" maxlength="50" placeholder="请先输入终端串号" />'
					+'<span class="input-group-btn"><button id="terminalBtn_'+objInstId+'_'+(length/2+1)+'" type="button" flag="'+isFastOffer+'" num="'+(length/2+1)+'" prodId="'+prodId+'" offerSpecId="'+newSpec.offerSpecId+'" onclick="AttachOffer.checkTerminalCode(this)" class="btn btn-default">校验</button></li>');
			var $liAdd = $('<li id="terminalDesc_'+(length/2+1)+'" style="white-space:nowrap;"><label></label><label id="terminalName_'+(length/2+1)+'"></label></span> </div></li>');
			
			$ul.append($liTerminalAdd).append($liAdd);
			totalNums++;
		}else{//删除终端
			if(minNum==(length/2)){
				$.alert("信息提示","终端数已经达到最小，不能再删除了。");
				return;
			}
			$li.each(function(index){
				if(length-1==index){
					$(this).remove();
				}else if(length==index){
					_filterAttach2Coupons(prodId,offerSpecId,(index/2));
					$(this).remove();
				}
				
			});
			totalNums--;
		}
	};
	
	//判断同一个终端组里面是否串码有重复的
	var _checkData=function(objInstId,terminalCode){
		var $input=$("input[id^=terminalText_"+objInstId+"]");
		var num=0;
		$input.each(function(){//遍历页面上面的串码输入框，为的是跟缓存里面的串码进行比对
			var instCode=$.trim(this.value);//页面上面的串码
			if(ec.util.isObj(instCode)&&terminalCode==instCode){
				num++;
			}
		});
		if(num>=2){
			$.alert("信息提示","终端串码重复了，请填写不同的串码。");
			return true ; 
		}
		return false;
	};
	
	//过滤 同一个串码输入框校验多次，如果之前有校验通过先清空
	var _filterAttach2Coupons=function(prodId,offerSpecId,num){
		for ( var i = 0; i < OrderInfo.attach2Coupons.length; i++) {
			var attach2Coupon = OrderInfo.attach2Coupons[i];
			if(offerSpecId == attach2Coupon.attachSepcId && prodId==attach2Coupon.prodId&&attach2Coupon.num==num){
				OrderInfo.attach2Coupons.splice(i,1);
				$("#terminalName_"+num).html("");
				break;
			}
		}
	};
	
	//清空同一个产品下的同一个销售品的串码缓存信息
	var _removeAttach2Coupons=function(prodId,offerSpecId){
		for ( var i = 0; i < OrderInfo.attach2Coupons.length; i++) {
			var attach2Coupon = OrderInfo.attach2Coupons[i];
			if(offerSpecId == attach2Coupon.attachSepcId && prodId==attach2Coupon.prodId){
				OrderInfo.attach2Coupons.splice(i,1);
				i--;
			}
		}
	};
	
	//判断是否是重复订购的逻辑
	var _ifOrderAgain=function(newSpec){
		if(ec.util.isObj(newSpec.ifOrderAgain)&&newSpec.ifOrderAgain=="Y"){
			if(parseInt(newSpec.orderCount)<newSpec.counts){
//				var $specAgain = $('#li_'+prodId+'_'+offerSpecId+'_'+newSpec.ifOrderAgain); //在已开通附属里面
//				$specAgain.remove();
				$.alert("信息提示","可选包："+newSpec.offerSpecName+"至多只能订购"+newSpec.orderCount+"次");
				return true;
			}
		}
	};
	
	//1表示从已订购那边过来的
	var _setParam=function(prodId,offerSpecId,flag){
		var newSpec = _setSpec(prodId,offerSpecId);  //没有在已选列表里面
		var offer = CacheData.getOfferBySpecId(prodId,offerSpecId); //从已订购数据中找
		if(flag==1){
			newSpec.counts=offer.counts;
		}
		var content = '<form id="paramForm">' ;
		content += "次数" + ' : <input id="text_'+prodId+'_'+offerSpecId  
		+'" class="inputWidth183px" type="text" value="'+newSpec.counts+'"><br>'; 
		content +='</form>' ;
		$.confirm("参数设置： ",content,{ 
			yes:function(){
			},
			no:function(){
			}
		});
		$('#paramForm').bind('formIsValid', function(event, form) {
			var nums=$("#text_"+prodId+"_"+offerSpecId).val();
			var reg = /^\+?[1-9][0-9]*$/;//正整数
			if(!reg.test(nums)){
				$.alert("信息提示","次数只能是正整数。");
				return;
			}
//			if(flag==1&&offer.orderCount>nums){
//				$.alert("信息提示","可选包【"+newSpec.offerSpecName+"】不允许退订！");
//				return;
//			}
			if(parseInt(newSpec.orderCount)<nums){
				$.alert("信息提示","可选包【"+newSpec.offerSpecName+"】至多只能订购"+newSpec.orderCount+"次");
				return;
			}
			if(flag==1 && offer!=undefined){
				if(offer.orderCount>nums){//退订附属销售品
					if(!ec.util.isArray(offer.offerMemberInfos)){//销售品实例查询	
						var param = {
								prodId:prodId,
								areaId: OrderInfo.getProdAreaId(prodId),
								offerId:offer.offerId	
						};
						param.acctNbr = OrderInfo.getAccessNumber(prodId);
						var data = query.offer.queryOfferInst(param);
						if(data==undefined){
							return;
						}
						offer.offerMemberInfos = data.offerMemberInfos;
						offer.offerSpec = data.offerSpec;
					}
				}
				offer.counts=nums;
			}else{
				newSpec.counts=nums;
			}
			$(".ZebraDialog").remove();
			$(".ZebraDialogOverlay").remove();
		}).ketchup({bindElementByClass:"ZebraDialog_Button1"});	
	};
	
	var _offerSpecDetail=function(prodId,offerSpecId){
		var offerSpecName ="";
		var summary = "";
		$.each(AttachOffer.allOfferList,function(){
			if(this.offerSpecId == offerSpecId){
				offerSpecName = this.offerSpecName;
				summary = this.summary;
			}else if(this.servSpecId == offerSpecId){
				offerSpecName = this.servSpecName;
				summary = this.summary;
			}
		});
		$('#detail_tbody').empty();
		var $tr = $('<tr></tr>');
		//var $tr = $('<tr id="atr_'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')"><td><input type="checkbox" id="'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')" name="attach_dealer"/></td></tr>');
		$tr.append('<td>'+offerSpecName+'</td><td width="900">'+summary+'</td>');
		$('#detail_tbody').append($tr);
		easyDialog.open({
			container : "div_detail_dialog"
		});
	};
	//已订购的附属销售品查询
	var _queryCardAttachOffer = function(cardTypeFlag) {
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
		var prodId = prodInfo.prodInstId;
		var param = {
		    prodId : prodId,
		    prodSpecId : prodInfo.productId,
		    offerSpecId : prodInfo.prodOfferId,
		    acctNbr : prodInfo.accNbr
		};
		if(ec.util.isObj(prodInfo.prodBigClass)){
			param.prodBigClass = prodInfo.prodBigClass;
		}
		var data = query.offer.queryAttachOfferHtml(param);
	//	SoOrder.initFillPage();
		$("#attach").html(data).show();
		//var member = CacheData.getOfferMember(prodId);
		//如果objId，objType，objType不为空才可以查询默认必须
		//if(ec.util.isObj(member.objId)&&ec.util.isObj(member.objType)&&ec.util.isObj(member.offerRoleId)){
            var temp = {   
				boActionTypeCd : '14',
				cardType : cardTypeFlag=="1"?"4G":"3G",
				accNbr: prodInfo.accNbr,
				prodInstId : prodId,
				prodId : prodId,
				prodSpecId : prodInfo.productId
			};
			//默认必须可选包和功能产品
			var data = query.offer.queryDefMustOfferSpecAndServ(temp);
			CacheData.parseOffer(data);
			CacheData.parseServ(data);
		//}
		if(ec.util.isArray(OrderInfo.offerSpec.offerRoles)){ //主套餐下的成员判断
			var member = CacheData.getOfferMember(prodId);
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				if(this.offerRoleId==member.offerRoleId && member.objType==CONST.OBJ_TYPE.PROD){
					var offerRole = this;
					$.each(this.roleObjs,function(){
						if(this.objType==CONST.OBJ_TYPE.SERV){
							var serv = CacheData.getServBySpecId(prodId,this.objId);//从已订购功能产品中找
							if(serv!=undefined){ //不在已经开跟已经选里面
								var $oldLi = $('#li_'+prodId+'_'+serv.servId);
								if(this.minQty==1){
									$oldLi.append('<dd class="mustchoose"></dd>');
								}
								$oldLi.append('<dd id="jue_'+prodId+'_'+serv.servId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
							}
						}
					});
					return false;
				}
			});
		}
		//AttachOffer.changeLabel(prodId, prodInfo.productId,""); //初始化第一个标签附属
		//order.dealer.initDealer();
	};
	
	var _show=function(prodId){
		$('#attach_'+prodId).show();
//		$("#target_"+0).hide();   // 临时 写法
		$('#prodinfo_'+prodId).hide();
		$('#nextNav').hide();
		$('#c-indicators').hide();
	};
    var _btnBack=function(prodId){
    	$('#prodinfo_'+prodId).show();
//		$("#target_"+0).show();   // 临时 写法
		$('#nextNav').show();
		$('#attach_'+prodId).hide();
		$('#c-indicators').show();
	};
	
	var _changeOfferS=function(obj,prodId,val){
		//var val=$(obj).val();
		if(val=="0"){
			$('#open_ul_'+prodId).show();
			$('#open_serv_ul_'+prodId).hide();
		}else{
			$('#open_ul_'+prodId).hide();
			$('#open_serv_ul_'+prodId).show();
		}
	};
	var _changeOfferOrdered=function(obj,prodId){
		var val=$(obj).val();
		if(val=="0"){
			$('#open_ul_'+prodId).hide();
			$('#open_serv_ul_'+prodId).hide();
			$('#order_ul_'+prodId).show();
			$('#serv_ul_'+prodId).hide();
		}else if(val=="1"){
			$('#open_ul_'+prodId).hide();
			$('#open_serv_ul_'+prodId).hide();
			$('#order_ul_'+prodId).hide();
			$('#serv_ul_'+prodId).show();
		}else if(val=="2"){
			$('#open_ul_'+prodId).show();
			$('#open_serv_ul_'+prodId).hide();
			$('#order_ul_'+prodId).hide();
			$('#serv_ul_'+prodId).hide();
		}else if(val=="3"){
			$('#open_ul_'+prodId).hide();
			$('#open_serv_ul_'+prodId).show();
			$('#order_ul_'+prodId).hide();
			$('#serv_ul_'+prodId).hide();
		}
	};	
	
	//删除附属销售品带出删除功能产品
	var _delServSpec = function(prodId,offerSpec){
		$.each(offerSpec.offerRoles,function(){
			$.each(this.roleObjs,function(){
				var servSpecId = this.objId;
				if($("#check_"+prodId+"_"+servSpecId).attr("checked")=="checked"){
					var spec = CacheData.getServSpec(prodId,servSpecId);
					if(ec.util.isObj(spec)){
						spec.isdel = "Y";
						var $li = $("#li_"+prodId+"_"+servSpecId);
						$li.removeClass("canshu").addClass("canshu2");
						$li.find("span").addClass("del"); //定位删除的附属
						_showHideUim(1,prodId,servSpecId);   //显示或者隐藏
					}
				}
			});
		});
	};
	
	//订购附属销售品
	var _addOfferSpecReload = function(prodId,offerSpecId){
		var newSpec = _setSpec(prodId,offerSpecId);
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			return;
		}
		var content = CacheData.getOfferProdStr(prodId,newSpec,0);
		CacheData.setServ2OfferSpec(prodId,newSpec);
		_checkOfferExcludeDepend(prodId,newSpec);
	};
	
	return {
		filterAttach2Coupons:_filterAttach2Coupons,
		addOffer 				: _addOffer,
		addOfferSpec 			: _addOfferSpec,
		addOpenList				: _addOpenList,
		addOpenServList			: _addOpenServList,
		addOfferSpecByCheck		: _addOfferSpecByCheck,
		addAndDelTerminal		: _addAndDelTerminal,
		closeAttachSearch 		: _closeAttachSearch,
		changeLabel				: _changeLabel,
		changeLabel1            : _changeLabel1,
		changeList				: _changeList,
		closeServ				: _closeServ,
		closeServSpec			: _closeServSpec,
		closeSearchAttach		: _closeSearchAttach,
		checkData				: _checkData,
		delOffer				: _delOffer,
		delOfferSpec			: _delOfferSpec,
		labelList				: _labelList,
		isChangeUim				: _isChangeUim,
		init					: _init,
		openList				: _openList,
		openedList				: _openedList,
		openServList			: _openServList,
		openedServList 			: _openedServList,
		openServSpec			: _openServSpec,
		openAppList				: _openAppList,
		queryAttachOffer 		: _queryAttachOffer,
		queryAttachOfferSpec 	: _queryAttachOfferSpec,
		queryCardAttachOffer    : _queryCardAttachOffer,
		showParam 				: _showParam,
		showServParam			: _showServParam,
		showTime				: _showTime,
		setAttachTime			: _setAttachTime,
		searchAttachOfferSpec   : _searchAttachOfferSpec,
		selectAttachOffer		: _selectAttachOffer,
		showOfferTime			: _showOfferTime,
		showMainParam			: _showMainParam,
		showMainMember			: _showMainMember,
		selectServ				: _selectServ,
		showStartTime			: _showStartTime,
		showEndTime			    : _showEndTime,
		setAttachBusiOrder		: _setAttachBusiOrder,
		showApp					: _showApp,
		showHideUim				: _showHideUim,
		showMainRoleProd		: _showMainRoleProd,
		checkTerminalCode		: _checkTerminalCode,
		checkOfferExcludeDepend	: _checkOfferExcludeDepend,
		checkServExcludeDepend	: _checkServExcludeDepend,
		servExDepReByRoleObjs	: _servExDepReByRoleObjs,
		setChangeList			: _setChangeList,
		reductionChangList		: _reductionChangList,
		filterServ				: _filterServ,
		setParam				: _setParam,
		showMainMemberRoleProd	: _showMainMemberRoleProd,
		changeOfferS            : _changeOfferS,
		changeOfferOrdered      : _changeOfferOrdered,
		offerSpecDetail         : _offerSpecDetail,
		show         : _show,
		btnBack     : _btnBack,
		openServSpecReload      : _openServSpecReload,
		delOfferSpecReload      : _delOfferSpecReload,
		closeServSpecReload    	: _closeServSpecReload,
		excludeAddServ			: _excludeAddServ,
		changereserveCode		: _changereserveCode,
		delServSpec             : _delServSpec,
		addOfferSpecReload:_addOfferSpecReload,
		excludeAddServ			: _excludeAddServ,
		
	};
})();
/**
 * 订单算费
 * 
 * @author tang
 */
CommonUtils.regNamespace("order", "calcharge");
/**
 * 订单算费
 */
order.calcharge = (function(){
	var _chargeItems = [];
	var _prints=[];
	var _olId=0;
	var _soNbr=0;
	var num=0;
	var money=0;
	var _pageFlag='newOrder';
	var submit_success=false;
	var inOpetate=false;
	var cash = ''; //实收费用
	var payMethod = '';//付费方式
	var reason = '';//修改原因
	var remark = '';//备注
	//弹出业务对象窗口
	var _addbusiOrder=function(proId,obj){
		if($("#div_payitem_"+proId)!=undefined&&$("#div_payitem_"+proId).html()!=undefined){
			var htmlStr=$("#div_payitem_"+proId).html();
			var dialogStr=$("#paydialog").html();
			var popup = $.popup("#div_payitem_choose_"+proId,htmlStr,{
				width:600,
				height:500,
				contentHeight:400,
				afterClose:function(){
					$("#paydialog").html(dialogStr);
				}
			});
			
			order.calcharge.trObj=obj;
		}else{
			$.alert("提示","没有可添加费用项的业务对象！");
		}
	};
	//查询可添加的费用项
	var _addSubmit=function(boId,boActionTypeCd,objType,objId,objName,actionName,objInstId,prodId){
		var refundType = "0" ;
		//撤单 if(OrderInfo.actionFlag==11||OrderInfo.actionFlag==19||OrderInfo.actionFlag==20){
		if(OrderInfo.actionFlag==11){
			refundType = "1" ;
		}else if(OrderInfo.actionFlag==19||OrderInfo.actionFlag==20){
			refundType = "2" ;
		}
		var param={"boId":boId,"objInstId":objInstId,"prodId":prodId,"boActionTypeCd":boActionTypeCd,"actionFlag":OrderInfo.actionFlag,
				"objType":objType,"objId":objId,"itemNum":num,"objName":objName,"actionName":actionName,"refundType":refundType};
		$.callServiceAsHtml(contextPath+"/pad/order/getChargeAddByObjId",param,{
			"before":function(){
				$.ecOverlay("<strong>正在增加收费项,请稍等会儿....</strong>");
			},"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","查询失败,稍后重试");
					return;
				}
				$("#div_payitem_choose_"+prodId).popup("close");
				_addItems(boId,response.data);
			},
			"fail":function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});	
	};
	//返回可添加的费用项
	var _addItems=function(boId,html){
		if(html!=''){
			$(order.calcharge.trObj).parent().parent().parent().after(html);
			var content$ = $("#order_confirm");
			$.jqmRefresh(content$);
			num--;
			_reflashTotal();
		}else{
			$.alert("提示","没有可添加的费用项");
			return;
		}
	};
	//删除费用项
	var _delItems=function(obj,val,str){
		if(str=='old'){
			var fee=$("#feeAmount_"+val).val();
			if(($("#realAmount_"+val).val())*100==0){
				$("#realAmount_"+val).val(((fee/100).toFixed(2))+"");
			}else{
				$("#realAmount_"+val).val('0');
			}			
			var real=($("#realAmount_"+val).val())*100;
			if(real!=fee){
				$("#chargeModifyReasonCd_"+val).show();
			}else{
				$("#chargeModifyReasonCd_"+val).hide();
			}
		}else{
			$(obj).parent().parent().parent().remove();
		}
		_reflashTotal();
	};
	//动态刷新页面信息
	var _reflashTotal=function(){
		_chargeItems=[];
		_prints=[];
		var realAmount=0;
		$("#calChangeTab tr").each(function() {
			var val = $(this).attr("id");
			if(val!=undefined&&val!=''){
				val=val.substr(5,val.length);
				if($("#paymentAmount_"+val) && $("#paymentAmount_"+val).val()*1==0){
					
				}else{
					var num=$("#realAmount_"+val).val();
					if(!isNaN(num)){
						var aa=($("#realAmount_"+val).val())*1;
						if(OrderInfo.actionFlag==11||OrderInfo.actionFlag==19||OrderInfo.actionFlag==20){
							aa=($("#backAmount_"+val).val())*1;
						}
						realAmount=realAmount+aa;
						//设置修改的实际费用
						$("#realhidden_money"+val).val(realAmount);
						_commitParam(val);
					}
				}
			}
		});
		if(OrderInfo.actionFlag==15){
			var backAmount=0;
			$("#calChangeTab tr").each(function() {
				var val = $(this).attr("id");
				if(val!=undefined&&val!=''){
					if($("#paymentAmount_"+val) && $("#paymentAmount_"+val).val()*1==0){
						
					}else{
						val=val.substr(5,val.length);
						var aa=($("#backAmount_"+val).val())*1;
						backAmount=backAmount+aa;
					}
				}
			});
			$('#backAmount').val(Number(backAmount).toFixed(2));
		}
       //修改总实际费用
		var paidAmount=0;
		var obj = $("input[name='realhidden_']");
		for(var i=0;i<obj.length;i++){
			paidAmount+=obj[i].value*1;
		}
		$('#realMoney').html(Number(paidAmount).toFixed(2));
		if(OrderInfo.actionFlag==15){
			order.refund.conBtns();
		}else{
			_conBtns();
		}
	};
	//提交参数封装
	var _submitParam=function(){
		var remakrFlag = true ;
		var posLenFlag = true ;
		var posNvlFlag = true ;
		$("#calChangeTab tr").each(function() {
			var val = $(this).attr("id");
			if(val!=undefined&&val!=''){
				val=val.substr(5,val.length);
				var chargeModifyReasonCd=$("#chargeModifyReasonCd_"+val).val();
				if(chargeModifyReasonCd=="1"){
					if($("#remark_"+val).val()==undefined||$("#remark_"+val).val()==null||$("#remark_"+val).val()==''){
						remakrFlag = false ;
					}
				}
				var payMethodCd=$("#payMethodCd_"+val).val();
				var terminalNumber=$("#terminalNumber").val();
				var serialNumber=$("#serialNumber").val();
				if(payMethodCd == '110101'){
					if(terminalNumber==undefined || $.trim(terminalNumber)==""){
						posNvlFlag = false;
					}
					if(serialNumber==undefined || $.trim(serialNumber)==""){
						posNvlFlag = false;
					}
					
					if(terminalNumber.length >100){
						posLenFlag = false;
					}
					if(serialNumber.length >100){
						posLenFlag = false;
					}
				}
			}
		});
		if(!remakrFlag){
			$.alert("提示信息","请填写修改原因");
			return false ;
		}
		if(!posNvlFlag){
			$.alert("提示信息","pos流水号或者终端号不能为空，请重新输入！");
			return false ;
		}
		if(!posLenFlag){
			$.alert("提示信息","pos流水号或者终端号长度超过100位，请重新输入！");
			return false ;
		}
		
		_chargeItems=[];
		_buildChargeItems();
		return true ;
	};
	//费用项封装
	var _buildChargeItems = function(){
		$("#calChangeTab tr").each(function() {
			var val = $(this).attr("id");
			if(val!=undefined&&val!=''){
				val=val.substr(5,val.length);
				var num=($("#realhidden_money"+val).val())*100+'';
				if(isNaN(num)){
				   return ;
				}
				var realmoney=($("#realhidden_money"+val).val())*100+'';
				var amount=$("#feeAmount_"+val).val();
				var feeAmount="";
				if(amount!=undefined&&amount!=''){
					feeAmount=amount+'';
				}else{
					feeAmount=realmoney;
				}
				if(OrderInfo.actionFlag==11||OrderInfo.actionFlag==19||OrderInfo.actionFlag==20){
					feeAmount = $("#feeAmount_"+val).val()*1+'';
					realmoney = (0-($("#backAmount_"+val).val())*100)+'';
					//realmoney = (parseInt(feeAmount) + parseInt(realmoney))+'';
					//alert("feeAmount="+feeAmount+"||realmoney="+realmoney);
				}
				var acctItemTypeId=$("#acctItemTypeId_"+val).val();
				var objId=$("#objId_"+val).val();
				var objType=$("#objType_"+val).val();
				var acctItemId=$("#acctItemId_"+val).val();
				var boId=$("#boId_"+val).val();
				var payMethodCd=$("#payMethodCd_"+val).val();
				var objInstId=$("#objInstId_"+val).val();
				var prodId=$("#prodId_"+val).val();
				var boActionType=$("#boActionType_"+val).val();
				var paymentAmount = $("#paymentAmount_"+val).val();
				var chargeModifyReasonCd = 1 ;
				var remark="";
				//if($("#chargeModifyReasonCd_"+val).parent(".ui-select").parent().is(":hidden")){
				if($("#chargeModifyReasonCd_"+val).css('display')=="none"){
					if(feeAmount!=realmoney){
						remark="其他";
					}
				}else{
					chargeModifyReasonCd = $("#chargeModifyReasonCd_"+val).val();
					remark=$('#chargeModifyReasonCd_'+val).find("option:selected").text();
					if(chargeModifyReasonCd=="1"){
						remark = $("#remark_"+val).val();
					}
				}
				if(feeAmount!=realmoney&&remark==""){
					remark="其他";
				}
				var terminalNumber = "";
				var serialNumber = "";
				if(payMethodCd == '110101'){
					 terminalNumber=$("#terminalNumber").val();
					 serialNumber=$("#serialNumber").val();
				}
				
				var param={"realAmount":realmoney,
						"feeAmount":feeAmount,
						"paymentAmount":paymentAmount,
						"acctItemTypeId":acctItemTypeId,
						"objId":objId,
						"objType":objType,
						"acctItemId":acctItemId,
						"boId":boId,
						"prodId":prodId,
						"objInstId":objInstId,
						"payMethodCd":payMethodCd,
						"terminalNo":terminalNumber,
						"posSeriaNbr":serialNumber,
						"chargeModifyReasonCd":chargeModifyReasonCd,
						"remark":remark,
						"boActionType":boActionType
				};
				_chargeItems.push(param);
			}
		});
	};
	//调用接口，判断用户是否可以修改金额，并加载付费类型
	var _queryPayMethodByItem = function(itemTypeId,trid,defmethod){
		var params={"acctItemTypeId":itemTypeId};
		var url=contextPath+"/app/order/queryPayMethodByItem";
		
		var response = $.callServiceAsJson(url, params);
		if (response.code == 0) {
			if(response.data!=undefined&&response.data!=null){
				if(response.data.length>0){
					var items=response.data;
					var flag=false;
					if(OrderInfo.actionFlag==11){//撤单
						if(items[0].limitChange=="N"){
							return true ;
						}
					}else if(OrderInfo.actionFlag==19||OrderInfo.actionFlag==20){//返销
						if(items[0].limitBuyBack=="N"){
							return true ;
						}
					}else if(OrderInfo.actionFlag==15){
						if(items[0].limitRedo=="N"){
							flag=true;
						}
					}else{
						if(items[0].limitChange=="N"){
							flag=true;
						}
					}
					var methodsInfo=items[0].payMethods;
					if(methodsInfo.length>0){
						if(trid){
							var html='<select  id="changeMethod_'+trid+'"  data-native-menu="false">';
							$.each(methodsInfo,function(i,method){
								if(method.payMethodCd==defmethod){
									html+='<option value="'+method.payMethodCd+'" selected="selected">'+method.payMethodName+'</option>';
								}else{
									html+='<option value="'+method.payMethodCd+'">'+method.payMethodName+'</option>';
								}
							});
							html+='</select>';
							$("#payMethodText_"+trid).html(html);
						//	$.jqmRefresh($("#payMethodText_"+trid));
						//	$("#changeMethod_"+trid).selectmenu("refresh");
							//$("#payMethodText_"+trid).html(html).trigger('create');  
						}
					}
					return flag ;
					
				}else{
					return false ;
				}
			}else{
				return false ;
			}
		}else if (response.code == -2) {
			$.alertM(response.data);
			return false ;
		}else{
			$.alert("提示","查询付费方式失败!");
			return false ;
		}
		
		
		
	};
	//修改原因选择
	var _bindChargeModifyReason = function(trid){
		if($("#chargeModifyReasonCd_"+trid).val()=="1"){
			$("#chargeModifyReasonCdDiv_"+trid).hide();
			$("#chargeModifyReasonCdDiv_"+trid).next(".edit").show();
		}
		$("#chargeModifyButton_"+trid).on("onclick",function(){
			$(this).parents().find(".edit").hide();
			$("#chargeModifyReasonCd_"+trid+" option").each(function() { 
				if($(this).val()=='3'){
					$(this).attr("selected", true);
				}
			});
			$("#chargeModifyReasonCd_"+trid).selectmenu("refresh");
			$("#chargeModifyReasonCdDiv_"+trid).show();
		});
	};
	//付费方式修改
	var _changePayMethod=function(itemTypeId,trid,defmethod,obj){
		var flag = _queryPayMethodByItem(itemTypeId,trid,defmethod);
		if(flag){
			if(_queryAuthenticDataRange(trid)){
				$("#payMethodDiv").html($("#payMethodText_"+trid).html()); 
				    //$("#chargeModifyReasonCd_"+trid).show();
					//$("#remark_"+trid).hide();chargeModifyReasonCd
						$("#chargeModifyReasonCd_"+trid).off("change").on("change",function(){
							if($(this).val()=="1"){
								$("#remark_"+trid).css("display","inline");
							}else{
								$("#remark_"+trid).css("display","none");
							}
						});
						if(OrderInfo.actionFlag==11||OrderInfo.actionFlag==19||OrderInfo.actionFlag==20||OrderInfo.actionFlag==15){//撤单，返销，补退费
							$("#backAmount_"+trid).removeAttr("disabled").css("border","1px solid #DCDCDC").focus() ;
						}else{
							$("#realAmount_"+trid).removeAttr("disabled").css("border","1px solid #DCDCDC").focus() ;
						}
						$("#changeMethod_"+trid).off("change").on("change",function(){
							var methodCd=$(this).val();
							$("#payMethodCd_"+trid).val(methodCd);
							$("#changeMethod_"+trid).selectmenu("refresh");
							if(methodCd == '110101'){ //pos
								$("#posDiv").css("display","inline");
								$("#posDiv").css("disabled","");
							}
							else{
								$("#posDiv").css("display","none");
								$("#posDiv").css("disabled","disabled");
							}
						});
					}
		}
		//$(obj).removeAttr("onclick").attr("disabled","disabled");
	};
	//查询修改费用项维度权限
	var _queryAuthenticDataRange = function(trid){
		var params={};
		var url=contextPath+"/app/order/queryAuthenticDataRange";
		var response = $.callServiceAsJson(url, params);
		if (response.code == 0) {
			var dataRanges = response.data;
			var flag = false;
			for(var i=0;i<dataRanges.length;i++){
				if($("#acctItemTypeId_"+trid).val()==dataRanges[i].dataDimensionName){
					flag = true;
					break;
				}else{
					flag = false;
				}
			}
			if(flag){
				return true;
			}else{
				$.alert("提示","当前费用项不允许修改!");
				return false;
			}
		}else if (response.code == -2) {
			$.alertM(response.data);
			return false ;
		}else{
			$.alert("提示","权限数据范围查询失败!");
			return false ;
		}
	};
	
	var _commitParam=function(val){
		var realmoney=($("#realAmount_"+val).val())*100+'';
		var amount=$("#feeAmount_"+val).val();
		var feeAmount="";
		if(amount!=undefined&&amount!=''){
			feeAmount=amount+'';
		}else{
			feeAmount=realmoney;
		}
		var acctItemTypeId=$("#acctItemTypeId_"+val).val();
		var objId=$("#objId_"+val).val();
		var objType=$("#objType_"+val).val();
		var acctItemId=$("#acctItemId_"+val).val();
		var acctItemTypeName=$("#acctItemTypeName_"+val).val();
		var paymentAmount = $("#paymentAmount_"+val).val();
		var param2={"realmoney":realmoney,
				"feeAmount":feeAmount,
				"paymentAmount":paymentAmount,
				"acctItemTypeId":acctItemTypeId,
				"objId":objId,
				"objType":objType,
				"acctItemId":acctItemId,
				"acctItemTypeName":acctItemTypeName
		};
		_prints.push(param2);
	};
	//修改金额效果
	var _editMoney=function(obj,val,str){//obj:对象,val:id,str:类型
		var trid=$("#trid").val();
		if(typeof obj =="object"){
		    cash=$.trim($(obj).val());//当前费用
	    }
		else{
			cash = obj;
		}
		if(cash==''){
			$(obj).val('0');
			order.calcharge.reflashTotal();
		}else{
			if(str=="old"){//修改费用
				var amount=$("#feeAmount_"+val).val();
				var check = true ;
				if(!/^(-)?[0-9]+([.]\d{1,2})?$/.test(cash)){
			  		$.alert("提示","费用金额请输入数字，最高保留两位小数！");
			  		check = false ;
				}else if((cash*100>amount*1)&&amount>0){
					$.alert("提示","实收费用金额不能高于应收金额！");
					check = false ;
				}else if((cash*100<amount*1)&&amount<0){
					$.alert("提示","实收费用金额不能低于应收金额！");
					check = false ;
				}
				if(check){
					
					var real=(cash)*100;
		  			if(real!=amount){
		  				$("#chargeModifyReasonCdDiv_"+val).show();
					}else{
						$("#chargeModifyReasonCdDiv_"+val).hide();
					//	$("#chargeModifyReasonCdDiv_"+val).next(".edit").hide();
					}
		  			if(typeof obj !="object"){
						$("#cal_main_content").show();
						$("#edit_content").hide();
					}
		  			$("#chargeModifyReasonCd_"+val)[0].style.display = 'block';
					_reflashTotal();
				}else{
					if(money!=''){
			  			//$(obj).val(money);
			  		}
			  		money="";
				}
			}else if(str=="undo"){//退费：撤单和返销
				var check = true ;
				if(!/^(-)?[0-9]+([.]\d{1,2})?$/.test(cash)){//金额非数字，恢复金额
			  		$.alert("提示","费用金额请输入数字，最高保留两位小数！");
			  		check = false ;
				}else{
					if(cash<0){//退费金额 不能填负值
						$.alert("提示","退费金额不能为负值！");
						check = false ;
					}else{
						var amount=$("#realhidden_"+val).val();
						var v_cash = cash*-1 ;
						if(v_cash<amount*1){//要退-100，不能退120
							$.alert("提示","退费金额不能高于实收金额！");
							check = false ;
						}
					}
				}
				if(check){
					var real=($(obj).val())*-1;
					if(real!=0){
						$("#chargeModifyReasonCdDiv_"+val).show();
					}else{
						$("#chargeModifyReasonCdDiv_"+val).hide();
						$("#chargeModifyReasonCdDiv_"+val).next(".edit").hide();
					}
					if(typeof obj !="object"){
						$("#cal_main_content").show();
						$("#edit_content").hide();
					}
					_reflashTotal();
				}else{
					if(money!=''){
			  			$(obj).val(money);
			  		}
			  		money="";
				}
			}else if(str=="new"){//新增费用
				if(!/^(-)?[0-9]+([.]\d{1,2})?$/.test(cash)){
			  		$.alert("提示","费用金额请输入数字，最高保留两位小数！");
			  		if(money!=''){
			  			$(obj).val(money);
			  		}
			  		money="";
				}else if(cash<0){//
					$.alert("提示","实收费用金额不能为负值！");
				}else{
					if(typeof obj !="object"){
						$("#cal_main_content").show();
						$("#edit_content").hide();
					}
					_reflashTotal();
				}
			}
		}
		
		payMethod = $("#changeMethod_"+val).val();  //付费方式
		reason = $("#chargeModifyReasonCd_"+val).val();//修改原因
		remark = $("#remark_"+val).val();//备注
		
	};
	var _setGlobeMoney=function(obj){
		money=$.trim($(obj).val());
	};
	var _disableButton=function(){
		//$("#toCharge").attr("disabled","disabled");
		$("#toComplate").attr("disabled","disabled");
		$("#orderCancel").attr("disabled","disabled");
		$("#orderBack").attr("disabled","disabled");
		$("#orderCancel").off("onclick");
		$("#toComplate").off("onclick");
		$("#toCharge").off("onclick");
	};
	var _conBtns=function(){
		$("#orderCancel").removeAttr("disabled");
		$("#orderBack").removeAttr("disabled");
		var val=$.trim($('#realMoney').html())*1;
		if(OrderInfo.actionFlag==11){
			$("#orderCancel").off("onclick").on("onclick",function(event){
				order.undo.orderBack();
			});
		}else{
			$("#orderCancel").off("onclick").on("onclick",function(event){
				SoOrder.orderBack();
			});
		}
		
		if(!submit_success){
			if(val!=0){
				$("#toCharge").removeAttr("disabled");
				//$("#toCharge").parent().removeClass("ui-state-disabled");
				$("#toComplate").attr("disabled","disabled");
				$("#toCharge").off("onclick").on("onclick",function(event){
					_updateChargeInfoForCheck('1');
				});
				$("#toComplate").off("onclick");
			}else{
				//$("#toCharge").attr("disabled","disabled");
				$("#toComplate").removeAttr("disabled");
				$("#toCharge").off("onclick");
				$("#toComplate").off("onclick").on("onclick",function(event){
					_chargeSave('0',false);
				});
			}
		}else{
			$("#toCharge").removeAttr("disabled");
			$("#toComplate").attr("disabled","disabled");
			$("#toCharge").off("onclick");
			$("#toComplate").off("onclick");
		}
	};
	
	var _updateChargeInfoForCheck=function(flag){
		_disableButton();
		if(submit_success){
			$.alert("提示","订单已经建档成功,不能重复操作!");
			return;
		}
		if(inOpetate){
			return;
		}
		if(!_submitParam()){
			_conBtns();
			return ;
		}
		inOpetate=true;
		var url=contextPath+"/app/order/updateChargeInfoForCheck";
		var params={
				"olId":_olId,
				"soNbr":OrderInfo.order.soNbr,
				"areaId" : OrderInfo.staff.areaId,
				"chargeItems":_chargeItems,
				"custId":OrderInfo.cust.custId
		};
		$.callServiceAsJson(url,params, {
			"before":function(){
				$.ecOverlay("<strong>正在处理中,请稍等会儿....</strong>");
			},	
			"done" : function(response){
				$.unecOverlay();
				if (response.code == 0) {
					_chargeSave(flag,true);
				}else if (response.code == -2) {
					_conBtns();
					inOpetate=false;
					$.alertM(response.data);
				}else{
					_conBtns();
					inOpetate=false;
					if(response.data!=undefined){
						$.alert("提示",response.data);
					}else{
						$.alert("提示","代理商保证金校验失败!");
					}
				}
			}
		});
	};
	
	var _tochargeSubmit=function(orderdata){	
		var url=contextPath+"/app/order/checkRuleToProv";
		var params={
				"olId":orderdata.rolId,
				"soNbr":orderdata.rsoNbr,
				"areaId" : OrderInfo.staff.areaId,
				"chargeItems":[]
		};
		$.ecOverlay("<strong>正在下省校验,请稍等会儿....</strong>");
		var response = $.callServiceAsJson(url,params);
		$.unecOverlay();		
		var provCheckResult;				
		if (response.code == 0) {					
			var data = response.data;
			if(data.checkResult!=undefined){
				OrderInfo.checkresult=data.checkResult;		
			}
			provCheckResult = {							
					code : 0				
			};				
		}else{					
			provCheckResult = {							
					code : 1,							
					data : response.data
			};
		}
		return provCheckResult;
	};
	var _chargeSave = function(flag,isparam){
//		if(!isparam){
//			_disableButton();
//			if(submit_success){
//				$.alert("提示","订单已经建档成功,不能重复操作!");
//				return;
//			}
//			if(inOpetate){
//				return;
//			}
//			if(!_submitParam()){
//				_conBtns();
//				return ;
//			}
//			inOpetate=true;
//		}
		var realmoney = $("#realmoney").val();
		if(realmoney == "0.00"){
			if(!_submitParam()){
				return ;
			}
	    }
		var params={
				"olId":OrderInfo.orderResult.olId,
				"soNbr":OrderInfo.order.soNbr,
				"areaId" : OrderInfo.staff.areaId,
				"chargeItems":_chargeItems
		};
		var url=contextPath+"/app/order/chargeSubmit?token="+OrderInfo.order.token;
		var response=$.callServiceAsJson(url, params, {});
		var msg="";
		if (response.code == 0) {
			submit_success=true;
			//受理成功，不再取消订单
			SoOrder.delOrderFin();
			
			if(OrderInfo.actionFlag==31){//改产品密码，则将session中密码重置，用户需要重新输入密码
				var url=contextPath+"/cust/passwordReset";
				var response2 = $.callServiceAsJson(url, null, {});
			}
			if(flag=='1'){
				if(OrderInfo.actionFlag==11){
					msg="退费成功";
				}else{
					msg="收费成功";
				}
			}else{
				msg="受理成功";
			}	
			$("#toComplate").removeAttr("disabled");
			$("#orderCancel").removeAttr("disabled");
			$("#printVoucherA").attr("disabled","disabled");
			//移除费用新增、费用修改按钮
//			$(".ui-icon-plus").remove();
//			$(".ui-icon-gear").remove();
//			$(".ui-icon-delete").remove();
			$("#calChangeTab tr").each(function() {
				var trid = $(this).attr("id");
				if(trid!=undefined&&trid!=''){
					trid=trid.substr(5,trid.length);
					$("#backAmount_"+trid).attr("disabled","disabled");
					$("#upate").attr("disabled","disabled");
					
//					if(OrderInfo.actionFlag==11||OrderInfo.actionFlag==19||OrderInfo.actionFlag==20||OrderInfo.actionFlag==15){//撤单，返销，补退费
//						$("#backAmount_"+trid).attr("disabled","disabled");
//						$("#backAmount_"+trid).parent().addClass("ui-state-disabled");
//					}else{
//						$("#realAmount_"+trid).attr("disabled","disabled");
//						$("#realAmount_"+trid).parent().addClass("ui-state-disabled");
//					}
					
				}
			});
			if(OrderInfo.actionFlag==11){
				$("#orderCancel").html("<span>返回首页</span>");
				$("#orderCancel").off("onclick").on("onclick",function(event){
					order.undo.toUndoMain(1);
				});
			}else{
				/*$("#orderCancel").html("继续受理");
				$("#orderCancel").off("onclick").on("onclick",function(event){
					_backToEntr();
				});*/
				var redirectUri = OrderInfo.provinceInfo.redirectUri;//回调地址
				if(redirectUri != null && redirectUri!=undefined && redirectUri!=""){						
					$("#orderCancel").off("click").on("click",function(event){_backToProvince();});	
				}
			}
			SoOrder.updateResState(); //修改UIM，号码状态
			//金额不为零，提示收费成功
			if(flag=='1'){
				var realmoney=($('#realMoney').html())*1;
				//realmoney=0;
				//费用大于0，才可以打印发票
//				if (realmoney > 0) {
//					//收费成功，先调初始化发票信息
//					var param={
//						"soNbr":OrderInfo.order.soNbr,
//						"billType" : 0,
//						"olId" : _olId,
//						"printFlag" : -1,
//						"areaId" : OrderInfo.staff.areaId,
//						"acctItemIds":[]
//					};
//					var initResult = common.print.initPrintInfo(param);
//					if(!initResult) {
//						return;
//					}
//					//然后提示是否打印发票
//					$.confirm("信息提示","收费成功，是否打印发票?",{
//						names:["是","否"],
//						yesdo:function(){
//							var param={
//								"soNbr":OrderInfo.order.soNbr,
//								"billType" : 0,
//								"olId" : _olId,
//								"printFlag" : 0,
//								"areaId" : OrderInfo.staff.areaId,
//								"acctItemIds":[]
//							};
//							common.print.prepareInvoiceInfo(param);
//							return;
//						},
//						no:function(){
//						}
//					});
//				} else {
//					//提示收费成功
					_showFinDialog(flag, msg);
//				}
			} else {
				//提示受理完成
				_showFinDialog(flag, msg);
			}
			return;
			
		}else if (response.code == -2) {
			_conBtns();
			SoOrder.getToken();
			inOpetate=false;
			$.alertM(response.data);
			//SoOrder.showAlertDialog(response.data);
		}else{
			_conBtns();
			SoOrder.getToken();
			inOpetate=false;
			if(response.data!=undefined){
				alert(response.data);
				//$.alert("提示",response.data);
			}else{
				$.alert("提示","费用信息提交失败!");
			}
		}	
	};
	var _showFinDialog=function(flag, msg){
		var title='';
		if(flag=='1'){
			if(OrderInfo.actionFlag==11){
				title='退费结果';
			}else{
				title='收费结果';
			}
		}else{
			title='受理结果';
		}
		$("#btn-dialog-ok").removeAttr("data-dismiss");
		$('#alert-modal').modal({backdrop: 'static', keyboard: false});
		/*$("#btn-dialog-ok").off("click").on("click",function(){
			_backToEntr();
		});*/
		
		var redirectUri = OrderInfo.provinceInfo.redirectUri;//回调地址
		if(redirectUri != null && redirectUri!=undefined && redirectUri!=""){		
			$("#btn-dialog-ok").off("click").on("click",function(event){_backToProvince();});	
		}else{
			$("#div_info_btn").hide();
		}	
		
		$("#modal-title").html(title);
		$("#modal-content").html(msg);
		$("#alert-modal").modal();
//		$.alert(title,msg);
//		order.cust.mgr.custReset();
		//返回三个入口
//		if(OrderInfo.actionFlag==11){
//			$("#successTip_dialog_cnt").off("tap").on("tap",function(event){
//				$("#div_payresult_choose").popup("close");
//				order.undo.toUndoMain(1);
//			});
//		}else{
//			$("#successTip_dialog_cnt").off("tap").on("tap",function(event){
//				$("#div_payresult_choose").popup("close");
//				_backToEntr();
//			});
//		}
//		if(flag=='1'){
//			if(OrderInfo.actionFlag==11){
//				$("#successTip_dialog_inv").show();
//				$("#successTip_dialog_inv").off("tap").on("tap",function(event){_invaideInvoice();});
//			}	
//		}
	};
	
	var _selePaymethod=function(str,obj){
		var selObj =$("#payMethodCd_"+str);
		selObj.empty();
		$("select[@id=backpayMethodCd_"+str+"] option").each(function(){
			var vv=$(this).val();
			if(vv!=undefined){
				var tt=$(this).text();
				if(vv.split("_")[1]==$(obj).val()){
					$("<option value='"+vv.split("_")[0]+"'>"+tt+"</option>").appendTo(selObj);
				}
			}
	    });

	};
	var _backToEntr=function(){
		/*if (OrderInfo.actionFlag == 17 || OrderInfo.actionFlag == 18) {
			window.location.href = contextPath+"/mktRes/terminal/exchangePrepare";
			return;
		}else if(OrderInfo.actionFlag ==8){
			window.location.href = contextPath+"/cust/mvnoCustCreate";
			return;
		}*/
		/*$("#order_confirm,#order_fill,#order_bill,#order_prepare").empty();
		$("#ul_busi_area").show();
		order.cust.mgr.custReset();
		//如果是新建客户，则要重置客户信息
		if(OrderInfo.cust.custId == -1) {
			order.cust.mgr.custReset();
		}*/
//		window.location.reload();
		common.callCloseWebview();
	};
	var _calchargeInit=function(){
		_olId = OrderInfo.orderResult.olId;
		_soNbr = OrderInfo.orderResult.soNbr;
		_chargeItems = [];
		_prints=[];
		num=0;
		money=0;
		submit_success=false;
		inOpetate=false;
		var refundType = "0" ;
		if(OrderInfo.actionFlag==11){
			refundType = "1" ;
		}else if(OrderInfo.actionFlag==19||OrderInfo.actionFlag==20){
			refundType = "2" ;
		}
		var params={
			"olId":_olId,
			'custVipLevel':OrderInfo.cust.vipLevel,
			"actionFlag":OrderInfo.actionFlag,
			"actionTypeName" : encodeURI(OrderInfo.actionTypeName),
			"businessName" : encodeURI(OrderInfo.businessName),
			"olNbr":OrderInfo.orderResult.olNbr,
			"soNbr" : OrderInfo.order.soNbr,
			"refundType":refundType,
			"checkResult":JSON.stringify(OrderInfo.checkresult)
		};
		$.callServiceAsHtmlGet(contextPath+"/token/app/order/getChargeList",params,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				//$.unecOverlay();
			},
			"done" : function(response){
				$.unecOverlay();
				SoOrder.getToken();
				
				if(response.code != 0) {
					$.alert("提示","收费页面加载失败，请稍后重试");
					return;
				}
				
				if(OrderInfo.provinceInfo.isFee == "1"){//不收费
					//暂存成功，不再取消订单
					SoOrder.delOrderFin();
					$("#toComplate").attr("disabled","disabled");
					var redirectUri = OrderInfo.provinceInfo.redirectUri;//回调地址
					if(redirectUri!=null && redirectUri!="" && redirectUri!="undefined"){
						//调用接口
						_backToProvince();
					}else{
						$("#btn-dialog-ok").removeAttr("data-dismiss");
						$('#alert-modal').modal({backdrop: 'static', keyboard: false});
						$("#div_info_btn").hide();
						$("#modal-title").html("提示");
						$("#modal-content").html("订单暂存成功！");
						$("#alert-modal").modal();
						
//						$.alert("提示","订单缓存成功！");
					}
				}else if(OrderInfo.provinceInfo.isFee == "2"){
					SoOrder.getToken();
					var content$ = $("#order-confirm").html(response.data).fadeIn();
					var htmls=$("#paydialog").html();
					$("#paydialog").html('');
					$.refresh(content$);
					$("#paydialog").html(htmls);
					//$("#navbar").slideUp(500);
					$.each($(".cashier_dd"),function(){
						var prodId=$(this).attr("id");
						var obj=$(this);
						if($.trim($(this).html())==""&&$(".userorderlist")!=undefined){
							$.each($("#userorderlist li").find("dl:eq(0)"),function(){
								 var prodInstId=$(this).attr("prodInstId");
								 var accNbr=$(this).attr("accNbr");
								 var prodName=$(this).attr("productName");
								 if(prodInstId!=undefined&&accNbr!=undefined){
									 if(prodId==prodInstId){
										 obj.html(prodName+"&nbsp;-&nbsp;"+accNbr);
									 }
								 }
							});	
						}
						
					});
					$("#printVoucherA").off("click").on("click", function(event){
						if(!_submitParam()){
							return ;
						}
						var voucherInfo = {
							"olId":_olId,
							"soNbr":OrderInfo.order.soNbr,
							"busiType":"1",
							"chargeItems":_chargeItems,
							"areaId":OrderInfo.getAreaId()
						};
						common.print.signVoucher(voucherInfo);
					});
					//_reflashTotal();
					if(OrderInfo.actionFlag==15){
						order.refund.conBtns();
					}else{
						_conBtns();
					}
				}
				
			},
			"fail":function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	var _invaideInvoice = function(){
		var params = {"olId":OrderInfo.order.oldSoId,"soNbr":OrderInfo.order.oldSoNbr} ;
		$.callServiceAsHtmlGet(contextPath+"/app/order/invaideInvoice",params,{
			"before":function(){
				$.ecOverlay("<strong>正在处理中,请稍等会儿....</strong>");
			},
			"done" : function(response){
				$.unecOverlay();
				if(response.code==0){
					var data = $.parseJSON(response.data) ;
					if(data.code==0){
						$("#successTip_dialog_inv").off("onclick");
						$.alert("提示","作废发票成功！");	
					}else if(data.code==1){
						$.alert("提示","作废发票失败！");
					}else if(data.code==2){
						$.alert("提示","未获取到发票信息！");
					}else if(data.code==3){
						$.alert("提示","获取发票失败！");
					}else{
						$.alert("提示","作废发票异常！");
					}
				} else if(response.code == -2){
				}else{
					$.alert("提示","作废发票异常！");
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	var _showEditPage = function(accessNumber,trid,realAmount){
		
		var params = {"trid":trid} ;
		var url = contextPath+"/token/app/order/getEditPage";
		$.callServiceAsHtmlGet(url,params, {
			"before":function(){
				$.ecOverlay("<strong>正在加载中,请稍等...</strong>");
			},
			"done" : function(response){
				$.unecOverlay();
				$("#cal_main_content").hide();
				var content$ = $("#edit_content");
				content$.html(response.data).show();
				//$.refresh(content$);
				$("#cal_main_content").hide();
				$("#edit_content").show();
				$("#pnumber").text(accessNumber);
				$("#payMethodDiv").html($("#payMethodText_"+trid).html());
				$("#editBtnDiv").html($("#editBtn_"+trid).html());
//				$("#realAmountDiv").html($("#realAmountText_"+trid).html());
				realAmount=$("#realhidden_money"+trid).val();
				$("#realAmount_"+trid).val(realAmount);
				
				if(payMethod != ''){
					$("#changeMethod_"+trid).val(payMethod);  //付费方式
				}
				if(reason !=''){
					$("#chargeModifyReasonCd_"+trid).val(reason);//修改原因
				}
				$("#remark_"+trid).val(remark);//备注
			},
			fail:function(response){
			     $.alert("提示","显示费用编辑页面失败，请稍后再试！");
			}
		});
		
	};
	var _confirm = function(){
		var trid=$("#trid").val();
		_editMoney($("#realAmount_"+trid).val(),trid,'old');
		//修改付费方式
		var payMethod=$("#payMethodDiv select").val();
		if(payMethod!=null && payMethod!="" && payMethod!=undefined){
			$("#payMethodCd_"+trid).val(payMethod);
		}
	};
	var _close = function(accessNumber,trid,realAmount){
		$("#cal_main_content").show();
		$("#edit_content").hide();
	};
	//终端销售 滚动页面入口
	var _feeScroll = function(scrollObj){
		if(scrollObj && scrollObj.page && scrollObj.page >= 1){
			_btnQueryfee(scrollObj.page,scrollObj.scroll);
		}
	};
	//查询
	var _btnQueryfee = function(pageIndex,scroller){
		OrderInfo.actionFlag=140;
		var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
		var param = {} ;
		param = {
					"startDate":($("#p_startDt").val()).replace(/-/g,''),
					"channelId":$("#p_channelId").val(),
					"areaId":$("#p_channelId").attr("areaid"),
					pageIndex:curPage,
					pageSize:10
		};
        $.callServiceAsHtmlGet(contextPath+"/app/report/freeInfoList",param,{
			"before":function(){
				$.ecOverlay("终端销售详情查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else{
					$("#fee_search").hide();
					$("#fee_list").html(response.data).show();
					OrderInfo.order.step=2;
					$("#fee_list_scroller").css("transform","translate(0px, -40px) translateZ(0px)");
					if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	//返回按钮调用
	var _back = function(){
		if(OrderInfo.order.step==1){
			common.callCloseWebview();
		}else if(OrderInfo.order.step==2){
			$("#fee_search").show();
			$("#fee_list").hide();
			OrderInfo.order.step=1;
		}else{
			common.callCloseWebview();
		}
	};
	
	var _backToProvince=function(){
		var reParams = {
				provIsale:OrderInfo.provinceInfo.provIsale,
				extCustOrderID:OrderInfo.orderResult.olId,
				resultCode:'0',
				redirectUri:OrderInfo.provinceInfo.redirectUri
			};
		$.callServiceAsHtmlGet(contextPath+"/mode/app/backProvince",reParams,{
			"before":function(){
				$.ecOverlay("<strong>正在处理中,请稍等会儿....</strong>");
			},
			"always":function(){
				//$.unecOverlay();
			},
			"done" : function(response){
				$.unecOverlay();
				if(response.code==0){								
					var data = $.parseJSON(response.data) ;
					if(data.code==0){
						//判断
						if(data.data.indexOf("&amp;")!=-1){
							data.data=data.data.replace(/\&amp;/g,"&");
						}
						window.location.href = data.data;
						return;									
					}else if(data.code==1){
						$.alert("提示",data.data);
					}
				}else{
					$.alert("提示","页面回调异常！");
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","页面回调可能发生异常，请稍后再试！");
			}
		});	
	};
	
	return {
		addItems:_addItems,
		delItems:_delItems,
		reflashTotal:_reflashTotal,
		editMoney:_editMoney,
		setGlobeMoney:_setGlobeMoney,
		addbusiOrder:_addbusiOrder,
		addSubmit:_addSubmit,
		selePaymethod:_selePaymethod,
		calchargeInit:_calchargeInit,
		pageFlag:_pageFlag,
		changePayMethod:_changePayMethod,
		bindChargeModifyReason:_bindChargeModifyReason,
		invaideInvoice:_invaideInvoice,
		tochargeSubmit:_tochargeSubmit,
		chargeSave:_chargeSave,
		showEditPage : _showEditPage,
		confirm : _confirm,
		close : _close,
		updateChargeInfoForCheck : _updateChargeInfoForCheck,
		feeScroll : _feeScroll,
		btnQueryfee :_btnQueryfee,
		back :_back,
		backToProvince:_backToProvince
	};
})();
$(function() {
	OrderInfo.order.step=1;
});

CommonUtils.regNamespace("order", "service");

order.service = (function(){
	var _offerprice=""; 
	
	var _newMemberFlag = false;
	var _oldMemberFlag = false;
	var _newAddList = [];
	var maxNum = 0;
	
	//套餐入口-初始化
	var _init=function(){
		
		//定义 1 为prepare页面  2为order-content（填单）页面 3为order-confirm（订单确认和收银台）页面 4为order-print（打印）页面
		OrderInfo.order.step=1;
		OrderInfo.actionFlag = 1;
		//获取初始化查询的条件
		order.service.queryApConfig();
		//初始化主套餐查询
		order.service.searchPack();
	};
	
	var current="";
	//列表导航切换
	var _tabChange=function(obj){
		if(current!=obj){
			var btn=$(".btn-group button");
			$.each(btn,function(){
				if(obj==this){
					$("#qryStr").val($(this).attr("value"));
					_searchPack();
					current=obj;
					$(this).removeClass("btn btn-default");
					$(this).removeClass("btn btn-default active");
					$(this).addClass("btn btn-default btn-group-active");
				}else{
					$(this).removeClass("btn btn-default active");
					$(this).removeClass("btn btn-default btn-group-active");
					$(this).addClass("btn btn-default");
				}
			});
		}
	};
	
	//主套餐查询
	var _searchPack = function(flag,scroller){
		var custId = OrderInfo.cust.custId;
		var qryStr=$("#qryStr").val();
		var params={"qryStr":qryStr,"pnLevelId":"","custId":custId};
		if(flag){
			
			var priceVal = $("#select_price").val();
			if(ec.util.isObj(priceVal)){
				var priceArr = priceVal.split("-");
				if(priceArr[0]!=null&&priceArr[0]!=""){
					params.priceMin = priceArr[0] ;
				}
				if(priceArr[1]!=null&&priceArr[1]!=""){
					params.priceMax = priceArr[1] ;
				}
			}
			var influxVal = $("#select_invoice").val();
			if(ec.util.isObj(influxVal)){
				var influxArr = influxVal.split("-");
				if(influxArr[0]!=null&&influxArr[0]!=""){
					params.INFLUXMin = influxArr[0]*1024 ;
				}
				if(influxArr[1]!=null&&influxArr[1]!=""){
					params.INFLUXMax = influxArr[1]*1024 ;
				}
			}
			var invoiceVal = $("#select_influx").val();
			if(ec.util.isObj(invoiceVal)){
				var invoiceArr = invoiceVal.split("-");
				if(invoiceArr[0]!=null&&invoiceArr[0]!=""){
					params.INVOICEMin = invoiceArr[0] ;
				}
				if(invoiceArr[1]!=null&&invoiceArr[1]!=""){
					params.INVOICEMax = invoiceArr[1] ;
				}
			}
		}
		_queryData(params,flag,scroller);
		
	};
	var _queryData = function(params,flag,scroller) {
		if(OrderInfo.actionFlag==2){
			var offerSpecId = order.prodModify.choosedProdInfo.prodOfferId;
			if(offerSpecId!=undefined){
				params.changeGradeProdOfferId = offerSpecId;
			}
			var prodSpecIds='';
			$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
				if(this.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
					if(this.objId!=undefined){
						prodSpecIds=prodSpecIds+","+this.objId;
					}
				}
			});
			if(prodSpecIds!=''){
				prodSpecIds=prodSpecIds.substring(1, prodSpecIds.length);
				params.prodSpecId=prodSpecIds;
			}
			params.actionFlag=2;
		}else if(CONST.getAppDesc()==0){
			params.prodOfferFlag = "4G";
		}
		var url = contextPath+"/app/order/offerSpecList";
		$.callServiceAsHtmlGet(url,params, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
				$("#search-modal").modal('hide');
			},
			"done" : function(response){
				$("#search-modal").modal('hide');
				if(response.code != 0) {
					$.alert("提示","<br/>查询失败,稍后重试");
					return;
				}
				var content$ = $("#offer-list");
				content$.html(response.data);
				if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
//				$.refresh(content$);
			},
			fail:function(response){
				$.unecOverlay();
				$("#search-modal").modal('hide');
				$.alert("提示","套餐加载失败，请稍后再试！");
			}
		});
	};
	
	//滚动页面入口
	var _scroll = function(scrollObj){
		if(scrollObj && scrollObj.page && scrollObj.page >= 1){
			if(scrollObj.page==1){
				_searchPack(1,scrollObj.scroll);
			}else{
				var show_per_page = 10;
				var start_from = (scrollObj.page-2) * show_per_page;
				var end_on = start_from + show_per_page;
				//$('#ul_offer_list').append($('#div_all_data').children().slice(start_from, end_on)).listview("refresh");
				$('#div_all_data').children().slice(start_from, end_on).appendTo($('#div_offer_list'));
//				$('#ul_offer_list').listview("refresh");
//				$("#ul_offer_list li").off("tap").on("tap",function(){
//					$(this).addClass("pakeagelistlibg").siblings().removeClass("pakeagelistlibg");
//				});
				if(scrollObj.scroll && $.isFunction(scrollObj.scroll)) scrollObj.scroll.apply(this,[]);
			}
		}
	};
	
	//查询平台配置信息
	var _queryApConfig=function(){
		var configParam={"CONFIG_PARAM_TYPE":"PROD_AND_OFFER"};
		var qryConfigUrl=contextPath+"/app/order/queryApConf";
		$.callServiceAsJsonGet(qryConfigUrl, configParam,{
			"done" : function(response){
				if(response.data){
					var dataLength=response.data.length;
					for (var i=0; i < dataLength; i++) {
						if(response.data[i].OFFER_PRICE){
							OFFER_PRICE = response.data[i].OFFER_PRICE ;
							for(var j=0;j<OFFER_PRICE.length;j++){
								var rowKey=OFFER_PRICE[j].COLUMN_VALUE;
								var rowVal=OFFER_PRICE[j].COLUMN_VALUE_NAME;
								$("#select_price").append("<option value='"+rowKey+"'>"+rowVal+"</option>");
							}
						}else if(response.data[i].OFFER_INFLUX){
							OFFER_INFLUX = response.data[i].OFFER_INFLUX ;
							for(var j=0;j<OFFER_INFLUX.length;j++){
								var rowKey=OFFER_INFLUX[j].COLUMN_VALUE;
								var rowVal=OFFER_INFLUX[j].COLUMN_VALUE_NAME;
								$("#select_invoice").append("<option value='"+rowKey+"'>"+rowVal+"</option>");
							}
						}else if(response.data[i].OFFER_INVOICE){
							OFFER_INVOICE = response.data[i].OFFER_INVOICE ;
							for(var j=0;j<OFFER_INVOICE.length;j++){
								var rowKey=OFFER_INVOICE[j].COLUMN_VALUE;
								var rowVal=OFFER_INVOICE[j].COLUMN_VALUE_NAME;
								$("#select_influx").append("<option value='"+rowKey+"'>"+rowVal+"</option>");
							}
						}
						$.refresh($("#search-modal"));
					}
				}
			}
		});
	};
	
	/**
	 * 根据合约规格编码aoId查询主销售品
	 */
	var _queryPackForTerm = function(aoId, agreementType, numLevel){
		var params={
			"aoId":aoId,
			"agreementType":agreementType,
			"numLevel":numLevel
		};
		var url = contextPath+"/order/queryPackForTerm";
		var response = $.callServiceAsJson(url,params, {});
		return response;
	};
	
	//订购销售品
	var _buyService = function(specId,price) {
		OrderInfo.oldprodInstInfos = [];
		OrderInfo.oldofferSpec = [];
		OrderInfo.oldoffer = [];
		OrderInfo.oldAddNumList = [];
		var custId = OrderInfo.cust.custId;
		offerprice = price;
		if(OrderInfo.cust==undefined || custId==undefined || custId==""){
			$.alert("提示","在订购套餐之前请先进行客户定位！");
		}else{
			var param = {
					"price":price,
					"specId" : specId,
					"custId" : OrderInfo.cust.custId,
					"areaId" : OrderInfo.staff.soAreaId
			};
			if(OrderInfo.actionFlag == 2){  //套餐变更不做校验
				order.service.opeSer(param);   
			}else {  //新装
				var boInfos = [{
					boActionTypeCd: "S1",//动作类型
					instId : "",
					specId : specId //产品（销售品）规格ID
				}];
//			var url = contextPath+"/order/sign/gotoPrint";
//			$.ecOverlay("<strong>正在校验,请稍等会儿...</strong>");
//			var paramtmp={};
//			$.callServiceAsHtml(url,paramtmp);
				rule.rule.ruleCheck(boInfos,function(checkData){//业务规则校验通过
					if(ec.util.isObj(checkData)){
						$("#order_prepare").hide();
						var content$ = $("#order").html(checkData).show();
						$.refresh(content$);
					}else{
						order.service.opeSer(param);   
					}
				});
//	        if(rule.rule.ruleCheck(boInfos,'_ruleCheckSer')){  //业务规则校验通过
//	        }
			}
		}
	};
	
	//获取销售品构成，并选择数量
	var _opeSer = function(inParam){	
		//老号码新增内容
		_newAddList = [];
		OrderInfo.oldprodInstInfos = [];
		OrderInfo.oldofferSpec = [];
		OrderInfo.oldoffer = [];
		
		var param = {
			offerSpecId : inParam.specId,
			offerTypeCd : 1,
			partyId: OrderInfo.cust.custId
		};
		var offerSpec = query.offer.queryMainOfferSpec(param); //查询主销售品构成
		if(!offerSpec){
			return;
		}
		if(OrderInfo.actionFlag == 2){ //套餐变更
			var url=contextPath+"/app/order/queryFeeType";
			$.ecOverlay("<strong>正在查询是否判断付费类型的服务中,请稍后....</strong>");
			var response = $.callServiceAsJsonGet(url,param);	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data!=undefined){
					if("0"==response.data){
						var is_same_feeType=false;
						if(order.prodModify.choosedProdInfo.feeType=="2100" && (offerSpec.feeType=="2100"||offerSpec.feeType=="3100"||offerSpec.feeType=="3101"||offerSpec.feeType=="3103"||offerSpec.feeType=="1202"||offerSpec.feeType=="2101")){
							is_same_feeType=true;//预付费
						}else if(order.prodModify.choosedProdInfo.feeType=="1200" && (offerSpec.feeType=="1200"||offerSpec.feeType=="3100"||offerSpec.feeType=="3102"||offerSpec.feeType=="3103"||offerSpec.feeType=="1202"||offerSpec.feeType=="2101")){
							is_same_feeType=true;//后付费
						}else if(order.prodModify.choosedProdInfo.feeType=="1201" && (offerSpec.feeType=="1201"||offerSpec.feeType=="3101"||offerSpec.feeType=="3102"||offerSpec.feeType=="3103")){
							is_same_feeType=true;//准实时预付费
						}
						if(!is_same_feeType){
							alert("付费类型不一致,无法进行套餐变更。");
							//$.alert("提示","付费类型不一致,无法进行套餐变更。");
							return;
						}
					}
				}
			}
			offerChange.offerChangeView();
			return;
		}
		
		//老号码新增内容
		var areaidflag = order.memberChange.areaidJurisdiction();
		
		var iflag = 0; //判断是否弹出副卡选择框 false为不选择
		var max=0;
		var str="";
		var oldstr="";
		$("#div_content").empty();
		$.each(offerSpec.offerRoles,function(){
			var offerRole = this;
			if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){//副卡接入类产品
				$.each(this.roleObjs,function(){
					var objInstId = offerRole.offerRoleId+"_"+this.objId;//角色id+产品规格id
					if(this.objType == CONST.OBJ_TYPE.PROD){
						if(offerRole.memberRoleCd=="401"){
							_newAddList.push(objInstId);
						}
						
						if(offerRole.minQty == 0){ //加装角色
							this.minQty = 0;
							this.dfQty = 0;
						}			
						
						//新装二次加载，副卡数量
						if(OrderInfo.provinceInfo.reloadFlag&&OrderInfo.provinceInfo.reloadFlag=="N"){
							this.dfQty = OrderInfo.reloadProdInfo.cardNum;
						}
						max = this.maxQty<0?"不限制":this.maxQty;//主卡的最大数量
						maxNum = max;
						var min = this.minQty;
						
						//新装传入主副卡号码
						if(OrderInfo.newOrderNumInfo.newSubPhoneNum!=""&&offerRole.memberRoleCd=="401"){
							var subPhoneNums = OrderInfo.newOrderNumInfo.newSubPhoneNum.split(",");
							var nums = subPhoneNums.length;
							this.dfQty = nums;
							this.minQty = nums;
							this.maxQty = nums;
							max = nums;
						}
						
						if(OrderInfo.newOrderNumInfo.mainPhoneNum!=""&&OrderInfo.newOrderNumInfo.newSubPhoneNum==""&&offerRole.memberRoleCd=="401"){
							this.maxQty = 0;
							max = 0;
						}
						
						str+="<div class='form-group'>"
							+"<label for='"+objInstId+"'>副卡数量:"+this.minQty+"-"+max+"(张)</label>"
							+"<div class='input-group input-group-lg'>"
							+"<span class='input-group-btn'>"
							+"<button class='btn btn-default' type='button' onclick=order.service.subNum('"+objInstId+"',"+this.minQty+")> - </button>"
							+"</span>"
							+"<input type='text'  readonly='readonly' class='form-control' id='"+objInstId+"' value='"+this.dfQty+"'>"
							+"<span class='input-group-btn'>"
							+"<button class='btn btn-default' type='button' onclick=order.service.addNum('"+objInstId+"',"+this.maxQty+",'"+offerRole.parentOfferRoleId+"')> + </button>"
							+"</span> </div>"
							+"</div>";
						$("#div_content").append(str);
						iflag++;
						return false;
					}
				});
			}
			
			if(offerRole.memberRoleCd=="401" && areaidflag!="" && areaidflag.net_vice_card=="0"){
				$.each(this.roleObjs,function(){
					if(this.objType == CONST.OBJ_TYPE.PROD){					
						var max = this.maxQty<0?"不限制":this.maxQty;//主卡的最大数量
						var min = this.minQty;
						//获取老用户纳入号码
						var oldSubPhoneNums=OrderInfo.oldSubPhoneNum.oldSubPhoneNum;
						//如果最大个数为0，不展示老用户号码输入框
						if(this.maxQty!=0){
							var oldSubPhoneNums="";
							
							if(OrderInfo.provinceInfo.reloadFlag && OrderInfo.provinceInfo.reloadFlag=="N"){
								var result=OrderInfo.reloadOrderInfo;
								
								var busiOrders = result.orderList.custOrderList[0].busiOrder;
								
								$.each(busiOrders,function(index,busiOrder){
									//老用户纳入
									if(busiOrder.boActionType.actionClassCd==1200 && busiOrder.boActionType.boActionTypeCd=="S2" && busiOrder.busiObj.offerTypeCd=="1"){
										var oldnum=busiOrder.busiObj.accessNumber;
										OrderInfo.oldAddNumList.push({"accNbr":oldnum});
										oldSubPhoneNums+=oldnum+",";
									}
								});
							}else{
								oldSubPhoneNums=OrderInfo.oldSubPhoneNum.oldSubPhoneNum;
							}
							
							oldstr 
								+="<div class='form-group'>"
									+"<label >已有移动号码:"+min+"-"+max+"(张)</label>"
									+"<div class='input-group input-group-lg' id='oldnum_1' name='oldnbr'>"
										+"<input type='text'  class='form-control' id='oldphonenum_1'>"
										+"<span class='input-group-btn'>"
											+"<button class='btn btn-default' type='button' onclick='order.memberChange.addNum("+max+");'> + </button>"
										+"</span> " 
										+"</div>"
								+"</div>";
							
							$("#div_content").append(oldstr);
							
							if(oldSubPhoneNums!=null && oldSubPhoneNums!=""){
								var oldSubPhoneNum=oldSubPhoneNums.split(",");
								
								if(oldSubPhoneNum!=null && oldSubPhoneNum.length>0){
									for(var i=0;i<oldSubPhoneNum.length;i++){
										if(i==0){
											$("#oldphonenum_1").val(oldSubPhoneNum[i]);
										}else{
											//添加输入框
											order.memberChange.addNum(max);
											$("#oldphonenum_"+(i+1)).val(oldSubPhoneNum[i]);
										}
									}
								}
							}
						}
					}
				});
			}
		});
		//页面初始化参数
		var param = {
			"boActionTypeCd" : "S1" ,
			"boActionTypeName" : "订购",
			"offerSpec" : offerSpec,
			"actionFlag" :1,
			"type" : 1
		};
		if(iflag >0){
			//$("#div_content").append(str);
			$("#vice_modal").modal("show");
			//若是新装二次加载，则调过副卡选择框
			if(OrderInfo.provinceInfo.reloadFlag&&OrderInfo.provinceInfo.reloadFlag=="N"){
				order.service.confirm(param);
			}else{
				$("#btn_modal").off("click").on("click",function(){
					order.service.confirm(param);
				});
			}
		}else{
			if(!_setOfferSpec(1)){
				$.alert("错误提示","请选择一个接入产品");
				return;
			}
			if(OrderInfo.actionFlag!=14){ //合约套餐不初始化
				order.main.buildMainView(param);	
			}
		}
	};
	
	//选择完主套餐构成后确认
	var _confirm = function(param){
		order.memberChange.viceCartNum = 0;
		
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			this.prodInsts = [];
		});
		
		//新增内容
		var newnum = 0;
		$.each(_newAddList,function(){
			newnum=newnum+Number($("#"+this).val());
		});
		
		var oldnum = 0;
		$("#div_content").find("div[name='oldnbr']").each(function(){
			//var num = $.trim($(this).children("td").eq(1).children("input").val());
			var num = $.trim($(this).children("input").val());
			if(ec.util.isObj(num)){
				oldnum++;
			}
		});
		
		if(!_setOfferSpec()){
			$.alert("错误提示","请选择一个接入产品");
			return;
		}
		
		//新装老用户纳入改造[s]
		if(newnum>0){
			order.service.newMemberFlag = true;
			param.newnum = newnum;
		}else{
			order.service.newMemberFlag = false;
		}
		
		if(oldnum>0){
			order.service.oldMemberFlag = true;
			
			if(!order.memberChange.queryofferinfo()){
				return;
			}
			
			param.oldprodInstInfos = OrderInfo.oldprodInstInfos;
			param.oldofferSpec = OrderInfo.oldofferSpec;
			param.oldoffer = OrderInfo.oldoffer;
			param.oldnum = oldnum;
		}else{
			order.service.oldMemberFlag = false;
		}
		
		if(parseInt(newnum)+parseInt(order.memberChange.viceCartNum)>maxNum){
			$.alert("提示","加装数量已经超过能加装的最大数量【"+maxNum+"】---!");
			return;
		}
		//e
		
		if(OrderInfo.actionFlag!=14){ //合约套餐不初始化
			order.main.buildMainView(param);	
		}else{
			mktRes.terminal.newnum = newnum;
			mktRes.terminal.oldnum = oldnum;
		}
		
		$("#vice_modal").modal("hide");
	};
	
	//根据页面选择成员数量保存销售品规格构成 offerType为1是单产品
	var _setOfferSpec = function(offerType){
		var k = -1;
		var flag = false;  //判断是否选接入产品
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			var offerRole = this;
			
			//老用户号码
			if(offerRole.prodInsts==undefined){
				offerRole.prodInsts = [];
			}
			
			$.each(this.roleObjs,function(){
				if(this.objType== CONST.OBJ_TYPE.PROD){  //接入类产品
					var num = 0;  //接入类产品数量选择
					if(offerType==1){  //单产品
						num = 1;
					}else if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD && OrderInfo.actionFlag!=2){//主卡的接入类产品数量
						num = 1;
					}else{ //多成员销售品
						num = $("#"+offerRole.offerRoleId+"_"+this.objId).val();  //接入类产品数量选择
					}
					if(num==undefined || num==""){
						num = 0;
					}
					for ( var i = 0; i < num; i++) {
						var newObject = jQuery.extend(true, {}, this); 
						newObject.prodInstId = k--;
						if(num>1){ //同一个规格产品选择多个
							newObject.offerRoleName = offerRole.offerRoleName+(i+1);
						}else{
							newObject.offerRoleName = offerRole.offerRoleName;
						}
						newObject.memberRoleCd = offerRole.memberRoleCd;
						offerRole.prodInsts.push(newObject);   
						flag = true;
					}
					offerRole.selQty = num;
				}else{ //功能类产品
					if(this.minQty==0){
						this.dfQty = 1;
					}
				}
			});
		});
		return flag;
	};
	
	//添加一个角色
	var _addNum = function(id,max,parentOfferRoleId){
		if(ec.util.isObj(parentOfferRoleId)){
			var viceNum = 0;
			var offerRoles = [];
			var parentMaxQty = 0;
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				var offerRole = this;
				$.each(this.roleObjs,function(){
					if(this.objType == CONST.OBJ_TYPE.PROD){
						var objInstId = offerRole.offerRoleId+"_"+this.objId;//角色id+产品规格id
						if(ec.util.isObj(offerRole.parentOfferRoleId) && parentOfferRoleId==offerRole.parentOfferRoleId){
							offerRoles.push(offerRole);
							parentMaxQty = offerRole.parentMaxQty;
							viceNum += Number($("#"+objInstId).val());
						}
					}
				});
			});
			if(parentMaxQty>0){
				if(viceNum >= parentMaxQty){
					if(ec.util.isArray(offerRoles)){
						var str = "【";
						for ( var i = 0; i < offerRoles.length; i++) {
							var offerRole = offerRoles[i];
							str += offerRole.offerRoleName+",";
						}
						str = str.substr(0, str.lastIndexOf(','));
						str += "】角色成员数量总和不能超过"+parentMaxQty;
						$.alert("规则限制",str);
						return;
					}
				}
			}
		}
		var num = Number($("#"+id).val());
		if(max<0){
			num+=1;
			$("#"+id).val(num);
		}else{
			if(num<max){
				num+=1;
				$("#"+id).val(num);
			}
		}		
	};
	
	var _subNum = function(id,min){
		var num = Number($("#"+id).val());
		if(num>min){
			num-=1;
			$("#"+id).val(num);
		}		
	};
	//返回按钮
	var _btnBack=function(){
		$("#order_prepare").show();
		$("#order").hide();
	};
	
	//第三步返回到第二步,返回按钮
	var _backStepTwo=function(){
		$("#order-content").show();
		$("#order-dealer").hide();
	};
	
	//订单取消时，释放已预占资源的入口标识。0：初始化状态，1：购机或选号入口，2：套餐入口
	var _releaseFlag = 0;
	//购机和选号入口的预占号码信息缓存
	var _boProdAn = {};
	var _offerDialog=function(subPage){
		var param={};
		var url=contextPath+"/order/prodoffer/prepare?subPage="+subPage;
		$.callServiceAsHtmlGet(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					 response.data='<div style="margin:2px 0 2px 0;width:100%,height:100%;text-align:center;"><strong>页面显示失败,稍后重试</strong></div>';
				}
				if(response.code != 0) {
					$.alert("提示","页面显示失败,稍后重试");
					return;
				}
				var content$=$("#offerspecContent");
				content$.html(response.data);
				order.prepare.backToInit();
				_initSpec();
				order.prodOffer.queryApConfig();
				order.service.searchPack();
				$("#chooseofferspecclose").click(function(){
					_closeChooseDialog();
				});
				easyDialog.open({
					container : 'chooseofferspec'
				});
			}
		});	
	};
	var _closeChooseDialog = function() {
		if (!$("#chooseofferspec").is(":hidden")){
			easyDialog.close();
		}
	};
	
	//扫描后填充
	var _scaningCallBack=function(terInfo,prodId){
		$("#uim_txt_"+prodId).val(terInfo);
	};
	
	var _choosedOffer=function(id,specId,price,subpage,specName){
		var param={"offerSpecId":specId};
		var response = $.callServiceAsJson(contextPath+"/order/queryOfferSpec",param);
		if (response.code==0) {
			if(response.data){
				var offerRoleId="";
				var prodOfferSpec=response.data.offerSpec;
				if (prodOfferSpec && prodOfferSpec.offerRoles) {
					var offerRoles = prodOfferSpec.offerRoles;
					for (var i=0;i<offerRoles.length;i++){
						if (offerRoles[i].memberRoleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD
								|| offerRoles[i].memberRoleCd == CONST.MEMBER_ROLE_CD.VICE_CARD) {
							if(offerRoles[i].memberRoleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD){
								offerRoleId=offerRoles[i].offerRoleId;
								break;
							}
						}else{
							offerRoleId=offerRoles[i].offerRoleId;
							break;
						}
					}
				}
				if(offerRoleId!=""){
					_closeChooseDialog();
					order.prodModify.chooseOfferForMember(specId,subpage,specName,offerRoleId);
				}else{
					$.alert("提示","无法选择套餐，套餐规格查询失败！");
				}
			}
		}else if(response.code == -2){
			$.alertM(response.data);
		}else{
			$.alert("提示","套餐详细加载失败，请稍后再试！");
		}
	};
	return {
		btnBack					:			_btnBack,
		buyService 				:			_buyService,
		queryApConfig			:			_queryApConfig,
		queryData				:			_queryData,
		init					:			_init,
		opeSer 					:			_opeSer,
		scaningCallBack			:			_scaningCallBack,
		scroll					:			_scroll,
		searchPack				:			_searchPack,
		setOfferSpec			:			_setOfferSpec,
		tabChange				:			_tabChange,
		queryPackForTerm:_queryPackForTerm,
		addNum:_addNum,
		subNum:_subNum,
		releaseFlag:_releaseFlag,
		boProdAn:_boProdAn,
		offerprice:_offerprice,
		offerDialog:_offerDialog,
		choosedOffer:_choosedOffer,
		confirm		: _confirm,
		oldMemberFlag:_oldMemberFlag,
		newMemberFlag:_newMemberFlag,
		backStepTwo:_backStepTwo
	};
})();


CommonUtils.regNamespace("order", "main");

order.main = (function(){ 
	
	/**
	 * 填单页面展示
	 * param = {
	 * 		boActionTypeCd : S1,
	 * 		boActionTypeName : "订购",
	 *		offerSpecId : 1234,//销售品规格ID
	 *		offerSpecName : "乐享3G-129套餐",//销售品名称,
	 *		feeType : 2100,付费类型
	 *		viceCardNum : 2,//副卡数量
	 *		offerNum : 3,//销售品数量
	 *		type : 1,//1购套餐2购终端3选靓号
	 *		terminalInfo : {
	 *			terminalName : "iphone",
	 *			terminalCode : "2341234124"
	 *		},
	 *		offerRoles : [
	 *			{
	 *				offerRoleId : 1234,
	 *				offerRoleName : "主卡",
	 *				memberRoleCd : "0",
	 *				roleObjs : [{
	 *					offerRoleId : 1,
	 *					objId : ,
	 *					objName : "CDMA",
	 *					objType : 2
	 *				}]
	 *			},
	 *			{
	 *				offerRoleId : 2345,
	 *				offerRoleName : "副卡",
	 *				memberRoleCd : "1"
	 *			}
	 *		]
	 *	}
	 * 
	 */
	var _buildMainView = function(param) {
		if (param == undefined || !param) {
			param = _getTestParam();
		}
		
		if(OrderInfo.actionFlag == 6){//主副卡成员变更 付费类型判断 如果一致才可以进行加装
			var is_same_feeType=false;//
			if(param.feeTypeMain=="2100" && (param.offerSpec.feeType=="2100"||param.offerSpec.feeType=="3100"||param.offerSpec.feeType=="3101"||param.offerSpec.feeType=="3103")){
				is_same_feeType=true;
			}else if(param.feeTypeMain=="1200" && (param.offerSpec.feeType=="1200"||param.offerSpec.feeType=="3100"||param.offerSpec.feeType=="3102"||param.offerSpec.feeType=="3103")){
				is_same_feeType=true;
			}else if(param.feeTypeMain=="1201" && (param.offerSpec.feeType=="1201"||param.offerSpec.feeType=="3101"||param.offerSpec.feeType=="3102"||param.offerSpec.feeType=="3103")){
				is_same_feeType=true;
			}
			if(!is_same_feeType){
				$.alert("提示","主副卡付费类型不一致，无法进行主副卡成员变更。");
				return;
			}
		}
		$.callServiceAsHtml(contextPath+"/token/app/order/main",param,{
			"before":function(){
				$.ecOverlay("<strong>正在加载中,请稍等...</strong>");
			},"done" : function(response){
				if(!response){
					$.unecOverlay();
					 response.data='查询失败,稍后重试';
				}
				if(response.code != 0) {
					$.unecOverlay();
					$.alert("提示","查询失败,稍后重试");
					return;
				}
				OrderInfo.actionFlag = param.actionFlag;
				if(OrderInfo.actionFlag == 2){
					setTimeout(function () { 
						$.unecOverlay();
						offerChange.fillOfferChange(response,param);
				    }, 800);
				}else {
					$.unecOverlay();
					_callBackBuildView(response,param);
				}
			}
		});
	};
	
	//展示回调函数
	var _callBackBuildView = function(response, param) {
		SoOrder.initFillPage(); //并且初始化订单数据
		$("#order_prepare").hide();
		var content$ = $("#order").html(response.data).show();
		$.refresh(content$);
		
		_initTounch();
		//_initOfferLabel();//初始化主副卡标签
		_initFeeType(param);//初始化付费方式
		
		if(param.actionFlag==''){
			OrderInfo.actionFlag = 1;
		}
		
		if(OrderInfo.actionFlag==6){//主副卡纳入老用户
			if(order.memberChange.newMemberFlag){
				_loadOther(param);
			}
			if(order.memberChange.oldMemberFlag){
				_initAcct(1);//初始化副卡帐户列表
				_loadAttachOffer(param);
			}
			if(order.memberChange.changeMemberFlag){
				order.memberChange.fillmemberChange(response,param);
			}
		}else{
			_loadOther(param);//页面加载完再加载其他元素
		}
		
		//APP版本暂无帐户功能，屏蔽
//		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==6 || OrderInfo.actionFlag==13 || OrderInfo.actionFlag==14){
//			_initAcct();//初始化帐户列表 
//			$("#acctName").val(OrderInfo.cust.partyName);
//			order.dealer.initDealer();//初始化协销		
//		}
//		_addEvent();//添加页面事件*/
		
		order.phoneNumber.initOffer('-1');//主卡自动填充号码入口已选过的号码
		
		//新装进入下一步[W]
		$("#fillNextStep").off("click").on("click",function(){
			if(!SoOrder.checkData()){ //校验通过
				return false;
			}
			$("#order-content").hide();
			$("#order-dealer").show();
			order.dealer.initDealer();
			
			//放入需要查询的工号数据[W]
			var DevelopmentCode= OrderInfo.codeInfos.DevelopmentCode;
			var reloadFlag= OrderInfo.provinceInfo.reloadFlag;
			if(DevelopmentCode!=null && DevelopmentCode!="" && DevelopmentCode!="null" && reloadFlag=="Y" && (OrderInfo.actionFlag==1 || OrderInfo.actionFlag==2)){
				//查询工号数据
				$("#staffCode").val(DevelopmentCode);
				order.dealer.queryStaff(0,'dealer',OrderInfo.codeInfos.developmentObjId);
			}
		});
		if (param.memberChange) {
			$("#orderedprod").hide();
			$("#order_prepare").hide();
			$("#productDiv .pdcardcon:first").show();
			order.prepare.step(1);
			$("#fillLastStep").off("click").on("click",function(){
				order.prodModify.cancel();
			});
		}else{
			$("#fillLastStep").off("click").on("click",function(){
				_lastStep();
			});
		}
		
		//初始化uim卡号
		_initUimCode();
		
		//判断是否初始化帐户信息
		if(OrderInfo.acct&&OrderInfo.acct.acctCd!=null&&OrderInfo.acct.acctCd!=""){//新装传帐户id
			_createAcctWithId();
		}
		
		//新装省份传主副卡信息
		if(OrderInfo.newOrderNumInfo.mainPhoneNum!=""){
			//主卡选号需要的参数 
			var param = {"phoneNum":"",
						"prodId":""};
			//查询号码信息
			param.phoneNum = OrderInfo.newOrderNumInfo.mainPhoneNum;
			param.prodId = "-1";
			var result = order.phoneNumber.queryPhoneNumber(param);
			if(result==undefined||result.datamap==undefined||result.datamap.baseInfo==undefined){
				$("#nbr_btn_-1").val("");
				$("#phonenum_btn_-1").removeAttr("onclick");
			}else{
				if(result&&result.datamap.baseInfo!=undefined){					
					var phoneParam={
							prodId : param.prodId, //从填单页面头部div获取
							accessNumber : result.datamap.baseInfo.phoneNumber, //接入号
							anChooseTypeCd : "2", //接入号选择方式,自动生成或手工配号，默认传2
							anId : result.datamap.baseInfo.phoneNumId, //接入号ID
							pnLevelId:result.datamap.baseInfo.phoneLevelId,
							anTypeCd : result.datamap.baseInfo.pnTypeId, //号码类型
							state : "ADD", //动作	,新装默认ADD
							areaId:result.datamap.baseInfo.areaId,
							areaCode:result.datamap.baseInfo.zoneNumber,
							memberRoleCd:"",
							preStore:result.datamap.baseInfo.prePrice,
							minCharge:result.datamap.baseInfo.pnPrice,
							idFlag:"1"
						};
					if(param.prodId&&param.prodId=="-1"){
						phoneParam.memberRoleCd = CONST.MEMBER_ROLE_CD.MAIN_CARD;
					}
					$("#nbr_btn_-1").val(OrderInfo.newOrderNumInfo.mainPhoneNum);
					$("#phonenum_btn_-1").removeAttr("onclick");
					OrderInfo.boProdAns.push(phoneParam);
				}
			}
		}
		
		if(OrderInfo.newOrderNumInfo.newSubPhoneNum!=""){
			var param = {"phoneNum":"","prodId":""};
			var numBtns = $("input[id^='nbr_btn_']");			
			var nums = OrderInfo.newOrderNumInfo.newSubPhoneNum.split(",");
			var subNums = [];
			$.each(numBtns,function(){
				if($(this).attr("id")!="nbr_btn_-1"){
					subNums.push(this);
				};
			});
			$.each(subNums,function(index,subNum){
				//副卡选号需要的参数  
				param.phoneNum = nums[index];
				param.prodId = -2-index;
				var resData = order.phoneNumber.queryPhoneNumber(param);
				if(resData==undefined||resData.datamap==undefined||resData.datamap.baseInfo==undefined){
					$(subNum).val("");
					$("#phonenum_btn_"+prodId).removeAttr("onclick");
				}else{
					if(resData&&resData.datamap.baseInfo!=undefined){
						var phoneParam={
								prodId : param.prodId, //从填单页面头部div获取
								accessNumber : resData.datamap.baseInfo.phoneNumber, //接入号
								anChooseTypeCd : "2", //接入号选择方式,自动生成或手工配号，默认传2
								anId : resData.datamap.baseInfo.phoneNumId, //接入号ID
								pnLevelId:resData.datamap.baseInfo.phoneLevelId,
								anTypeCd : resData.datamap.baseInfo.pnTypeId, //号码类型
								state : "ADD", //动作	,新装默认ADD
								areaId:resData.datamap.baseInfo.areaId,
								areaCode:resData.datamap.baseInfo.zoneNumber,
								memberRoleCd:"",
								preStore:resData.datamap.baseInfo.prePrice,
								minCharge:resData.datamap.baseInfo.pnPrice,
								idFlag:"1"
							};
						if(param.prodId&&param.prodId!="-1"){
							phoneParam.memberRoleCd = CONST.MEMBER_ROLE_CD.VICE_CARD;
						}		
						$(subNum).val(nums[index]);
						$("#phonenum_btn_"+prodId).removeAttr("onclick");
						OrderInfo.boProdAns.push(phoneParam);
					}
				}
			});
		}
		
		//新装二次加载处理
		if(OrderInfo.provinceInfo.reloadFlag&&OrderInfo.provinceInfo.reloadFlag=="N"){
			var custOrderList = OrderInfo.reloadOrderInfo.orderList.custOrderList[0].busiOrder;
			$.each(custOrderList,function(){
				var offerTypeCd=this.busiObj.offerTypeCd;
				if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="1"){//纳入新成员
					var prodId = this.busiObj.instId;
					var accessNumber = this.busiObj.accessNumber;//接入号
					var terminalCode = this.data.bo2Coupons[0].terminalCode;//uim卡号
					var feeType = this.data.boProdFeeTypes[0].feeType;//付费类型
					var prodPwTypeCd = this.data.boProdPasswords[0].prodPwTypeCd;
					var pwd = this.data.boProdPasswords[0].pwd;//产品密码
					//主卡才有是否信控
					var isCheckMask = "20";//默认信控
					if(this.data.boProdItems&&this.data.boProdItems[0].itemSpecId){
						var itemSpecId = this.data.boProdItems[0].itemSpecId;
						if(itemSpecId=="40010030"){//是否信控
							isCheckMask = this.data.boProdItems[0].value;
						}
						//是否信控放在OrderInfo.newOrderInfo.isCheckMask中				
						var checkMark = {};
						checkMark.itemSpecId = itemSpecId;
						checkMark.prodId = prodId;
						checkMark.isCheckMask = isCheckMask;
						OrderInfo.reloadProdInfo.checkMaskList.push(checkMark);
						
						$("#"+itemSpecId+"_"+prodId+"").find("option[value='"+isCheckMask+"']").attr("selected","selected");
					}
					
					$("#nbr_btn_"+prodId).val(accessNumber);
					var boProdAns={
							prodId : this.data.boProdAns[0].prodId, //从填单页面头部div获取
							accessNumber : this.data.boProdAns[0].accessNumber, //接入号
							anChooseTypeCd : this.data.boProdAns[0].anChooseTypeCd, //接入号选择方式,自动生成或手工配号，默认传2
							anId : this.data.boProdAns[0].anId, //接入号ID
							pnLevelId:this.data.boProdAns[0].pnLevelId,
							anTypeCd : this.data.boProdAns[0].anTypeCd, //号码类型
							state : this.data.boProdAns[0].state, //动作	,新装默认ADD	
							areaId:this.data.boProdAns[0].areaId,
							areaCode:this.data.boProdAns[0].areaCode,
							memberRoleCd:this.data.boProdAns[0].memberRoleCd,
							preStore:this.data.boProdAns[0].preStore,
							minCharge:this.data.boProdAns[0].minCharge
					};
					OrderInfo.boProdAns.push(boProdAns);
					//付费方式_spec_parm
					OrderInfo.reloadProdInfo.feeType = feeType ;
					$("#idtype").find("option[value='"+feeType+"']").attr("selected","selected");
					//order.dealer.changeAccNbr(this.data.boProdAns[0].prodId,this.data.boProdAns[0].accessNumber);//选号玩要刷新发展人管理里面的号码
					//uim卡校验
					$("#uim_check_btn_"+this.data.bo2Coupons[0].prodId).attr("disabled",true);;
					$("#uim_release_btn_"+this.data.bo2Coupons[0].prodId).removeClass("disabled");
					$("#uim_txt_"+this.data.bo2Coupons[0].prodId).attr("disabled",true);
					$("#uim_txt_"+this.data.bo2Coupons[0].prodId).val(this.data.bo2Coupons[0].terminalCode);
					var coupon = {
							couponUsageTypeCd : this.data.bo2Coupons[0].couponUsageTypeCd, //物品使用类型
							inOutTypeId : this.data.bo2Coupons[0].inOutTypeId,  //出入库类型
							inOutReasonId : this.data.bo2Coupons[0].inOutReasonId, //出入库原因
							saleId : this.data.bo2Coupons[0].saleId, //销售类型
							couponId : this.data.bo2Coupons[0].couponId, //物品ID
							couponinfoStatusCd : this.data.bo2Coupons[0].couponinfoStatusCd, //物品处理状态
							chargeItemCd : this.data.bo2Coupons[0].chargeItemCd, //物品费用项类型
							couponNum : this.data.bo2Coupons[0].couponNum, //物品数量
							storeId : this.data.bo2Coupons[0].storeId, //仓库ID
							storeName : this.data.bo2Coupons[0].storeName, //仓库名称
							agentId : this.data.bo2Coupons[0].agentId, //供应商ID
							apCharge : this.data.bo2Coupons[0].apCharge, //物品价格
							couponInstanceNumber : this.data.bo2Coupons[0].couponInstanceNumber, //物品实例编码
							terminalCode : this.data.bo2Coupons[0].terminalCode,//前台内部使用的UIM卡号
							ruleId : this.data.bo2Coupons[0].ruleId, //物品规则ID
							partyId : this.data.bo2Coupons[0].partyId, //客户ID
							prodId :  this.data.bo2Coupons[0].prodId, //产品ID
							offerId : this.data.bo2Coupons[0].offerId, //销售品实例ID
							state : this.data.bo2Coupons[0].state, //动作
							relaSeq : this.data.bo2Coupons[0].relaSeq //关联序列	
						};
					OrderInfo.clearProdUim(this.busiObj.instId);
					OrderInfo.boProd2Tds.push(coupon);
					//产品密码
					//$("#pwd_"+this.busiObj.instId).val(this.data.boProdPasswords[0].pwd);				
					//$("select[name='pay_type_-1'] option[value='"+this.data.boProdFeeTypes[0].feeType+"']").attr("selected","selected");
				}		
				
				//发展人
				var objInstId="";
				var accessNum="";
				var objName="";
				var prodId="";
				if(this.boActionType.actionClassCd=="1200" && this.boActionType.boActionTypeCd=="S1"){
					objInstId = this.busiObj.objId;
					accessNum=this.busiObj.accessNumber;
					objName=this.busiObj.objName;
					prodId=this.data.ooRoles[0].prodId;
				}
				
				if(this.data.busiOrderAttrs!=undefined){
					var dealerMap1 = {};
					var dealerMap2 = {};
					var dealerMap3 = {};
					$.each(this.data.busiOrderAttrs,function(){
						if(this.role=="40020005"){
							dealerMap1.role = this.role;
							if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER){
								dealerMap1.staffid = this.value;
								dealerMap1.channelNbr = this.channelNbr;
							}else if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER_NAME){
								dealerMap1.staffname = this.value;
							}
							dealerMap1.objInstId=objInstId;
							dealerMap1.accessNumber=accessNum;
							dealerMap1.objName=objName;
							dealerMap1.prodId=prodId;
							dealerMap1.offerTypeCd=offerTypeCd;
						}else if(this.role=="40020006"){
							dealerMap2.role = this.role;
							if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER){
								dealerMap2.staffid = this.value;
								dealerMap2.channelNbr = this.channelNbr;
							}else if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER_NAME){
								dealerMap2.staffname = this.value;
							}
							dealerMap2.objInstId=objInstId;
							dealerMap2.accessNumber=accessNum;
							dealerMap2.objName=objName;
							dealerMap2.prodId=prodId;
							dealerMap2.offerTypeCd=offerTypeCd;
						}else if(this.role=="40020007"){
							dealerMap3.role = this.role;
							if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER){
								dealerMap3.staffid = this.value;
								dealerMap3.channelNbr = this.channelNbr;
							}else if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER_NAME){
								dealerMap3.staffname = this.value;
							}
							dealerMap3.objInstId=objInstId;
							dealerMap3.accessNumber=accessNum;
							dealerMap3.objName=objName;
							dealerMap3.prodId=prodId;
							dealerMap3.offerTypeCd=offerTypeCd;
						}
						
					});
					if(ec.util.isObj(dealerMap1.role)){
						OrderInfo.reloadProdInfo.dealerlist.push(dealerMap1);
					}
					if(ec.util.isObj(dealerMap2.role)){
						OrderInfo.reloadProdInfo.dealerlist.push(dealerMap2);
					}
					if(ec.util.isObj(dealerMap3.role)){
						OrderInfo.reloadProdInfo.dealerlist.push(dealerMap3);
					}

				}
				
				//帐户信息
				if(this.data.boAccountRelas!=undefined){
					var acctId = this.data.boAccountRelas[0].acctId;
					$("#acctSelect").find("option[value="+acctId+"]").attr("selected","selected");
				}			
			});
			//
			order.main.newProdReload();
			var custOrderAttrs = OrderInfo.reloadOrderInfo.orderList.orderListInfo.custOrderAttrs;
			$.each(custOrderAttrs,function(){
				//订单备注
				if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.REMARK){
					OrderInfo.reloadProdInfo.orderMark = this.value;
				}
			});
		}
	};
	//新装套餐二次加载,可选包、功能包处理
	var _newProdReload = function(){
		//处理可选包和功能产品增删
		var custOrderList = OrderInfo.reloadOrderInfo.orderList.custOrderList[0].busiOrder;
		$.each(custOrderList,function(){
			if(this.boActionType.actionClassCd=="1200" && this.boActionType.boActionTypeCd=="S1"){
				var offermap = this;
				$.each(AttachOffer.openList,function(){
					if(this.prodId==offermap.data.ooRoles[0].prodId){
						var offerflag = false;
						$.each(this.specList,function(){
							if(this.offerSpecId==offermap.busiObj.objId){
								offerflag = true;
								return false;
							}
						});
						if(!offerflag){
							//AttachOffer.addOfferSpec(this.prodId,offermap.busiObj.objId);
							_addOfferSpecSub(this.prodId,offermap.busiObj.objId);
							//是否有终端信息
							if(offermap.data.bo2Coupons!=undefined){
								for(var i=0;i<offermap.data.bo2Coupons.length;i++){
									var bo2Coupons = offermap.data.bo2Coupons[i];
									if(i==0){
										$("#terminalText_"+bo2Coupons.prodId+"_"+bo2Coupons.attachSepcId+"_"+bo2Coupons.num).val(bo2Coupons.couponInstanceNumber);
										AttachOffer.checkTerminalCode($("#terminalBtn_"+bo2Coupons.prodId+"_"+bo2Coupons.attachSepcId+"_"+bo2Coupons.num));
									}else{
										AttachOffer.addAndDelTerminal($("#terminalAddBtn_"+bo2Coupons.prodId+"_"+bo2Coupons.attachSepcId));
										$("#terminalText_"+bo2Coupons.prodId+"_"+bo2Coupons.attachSepcId+"_"+bo2Coupons.num).val(bo2Coupons.couponInstanceNumber);
										AttachOffer.checkTerminalCode($("#terminalBtn_"+bo2Coupons.prodId+"_"+bo2Coupons.attachSepcId+"_"+bo2Coupons.num));
									}
									var coupon = {
											couponUsageTypeCd : bo2Coupons.couponUsageTypeCd, //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
											inOutTypeId : bo2Coupons.inOutTypeId,  //出入库类型
											inOutReasonId : bo2Coupons.inOutReasonId, //出入库原因
											saleId : bo2Coupons.saleId, //销售类型
											couponId : bo2Coupons.couponId, //物品ID
											couponinfoStatusCd : bo2Coupons.couponinfoStatusCd, //物品处理状态
											chargeItemCd : bo2Coupons.chargeItemCd, //物品费用项类型
											couponNum : bo2Coupons.couponNum, //物品数量
											storeId : bo2Coupons.storeId, //仓库ID
											storeName : bo2Coupons.storeName, //仓库名称
											agentId : bo2Coupons.agentId, //供应商ID
											apCharge : bo2Coupons.apCharge, //物品价格,约定取值为营销资源的
											couponInstanceNumber : bo2Coupons.couponInstanceNumber, //物品实例编码
											ruleId : bo2Coupons.ruleId, //物品规则ID
											partyId : bo2Coupons.partyId, //客户ID
											prodId : bo2Coupons.prodId, //产品ID
											offerId : bo2Coupons.offerId, //销售品实例ID
											attachSepcId : bo2Coupons.attachSepcId,
											state : bo2Coupons.state, //动作
											relaSeq : bo2Coupons.relaSeq, //关联序列	
											num	: bo2Coupons.num //第几个串码输入框
										};
										OrderInfo.attach2Coupons.push(coupon);
										//AttachOffer.checkTerminalCodeReload($("#terminalAddBtn_"+bo2Coupons.prodId+"_"+bo2Coupons.attachSepcId+"_"+bo2Coupons.num));
								}
							}
						}
					}
				});
				
				//老用户纳入
				if(offermap.data.ooRoles[0].prodId>0){
					AttachOffer.addOfferSpecReload(offermap.data.ooRoles[0].prodId,offermap.busiObj.objId);
				}
			}else if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="7"){
				var offermap = this;
				var offerflag = false;
				$.each(AttachOffer.openServList,function(){
					if(this.prodId==offermap.data.boServOrders[0].servId){
						$.each(this.servSpecList,function(){
							if(this.servSpecId==offermap.data.boServOrders[0].servSpecId){
								offerflag = true;
								return false;
							}
						});
					}
				});
				if(!offerflag){
					var ifParams = "N";
					if(offermap.data.boServItems!=undefined){
						ifParams = "Y";
					}
					AttachOffer.openServSpecReload(this.busiObj.instId,offermap.data.boServOrders[0].servSpecId,offermap.data.boServOrders[0].servSpecName,ifParams);
	/*				if(ifParams=="Y"){
						var spec = CacheData.getServSpec(this.busiObj.instId,offermap.data.boServOrders[0].servSpecId);
						if(!!spec.prodSpecParams){
							for (var i = 0; i < spec.prodSpecParams.length; i++) {
								var param = spec.prodSpecParams[i];
								var itemSpec = CacheData.getServSpecParam(this.busiObj.instId,offermap.data.boServOrders[0].servSpecId,param.itemSpecId);
								$.each(offermap.data.boServItems,function(){
									if(itemSpec.itemSpecId==this.itemSpecId){
										itemSpec.setValue = this.value;
									}
								});
							}
						}
						$("#can_"+this.busiObj.instId+"_"+offermap.data.boServOrders[0].servSpecId,param.itemSpecId).removeClass("canshu").addClass("canshu2");
						var attchSpec = CacheData.getServSpec(this.busiObj.instId,offermap.data.boServOrders[0].servSpecId,param.itemSpecId);
						attchSpec.isset = "Y";
					}*/
				}
				
				//老用户纳入
				if(offermap.busiObj.instId>0){
					var ifParams = "N";
					if(offermap.data.boServItems!=undefined){
						ifParams = "Y";
					}
					AttachOffer.openServSpecReload(offermap.busiObj.instId,offermap.data.boServOrders[0].servSpecId,offermap.data.boServOrders[0].servSpecName,ifParams);
				}
			}
		});
		//处理缓存里面存在而二次加载回参没有的产品
		//退订可选包
		$.each(AttachOffer.openList,function(){
			var openmap = this;
			$.each(this.specList,function(){
				var offermap = this;
				var offerflag = false;
				$.each(custOrderList,function(){
					if(this.boActionType.actionClassCd=="1200" && this.boActionType.boActionTypeCd=="S1" && this.busiObj.offerTypeCd=="2"){
						if(this.busiObj.objId==offermap.offerSpecId){
							offerflag = true;
							return false;
						}
					}
				});
				if(!offerflag){
					AttachOffer.delOfferSpecReload(openmap.prodId,this.offerSpecId);
				}
			});
		});
		
		//退订功能产品
		$.each(AttachOffer.openServList,function(){
			var openmap = this;
			$.each(this.servSpecList,function(){
				var offermap = this;
				var offerflag = false;
				$.each(custOrderList,function(){
					if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="7"){
						if(offermap.servSpecId==this.data.boServOrders[0].servSpecId && openmap.prodId==this.busiObj.instId){
							offerflag = true;
							return false;
						}
					}
				});
				if(!offerflag){
					AttachOffer.closeServSpecReload(openmap.prodId,this.servSpecId,this.servSpecName,this.ifParams);
				}
			});
		});
	};
	
	//二次加载附属业务数据信息 第一步
	var _addOfferSpecSub = function(prodId,offerSpecId,roles){
		var newSpec = _setSpec(prodId,offerSpecId);
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			return;
		}
		
		var content = CacheData.getOfferProdStr(prodId,newSpec,0);
		
		_setServ2OfferSpecSub(prodId,newSpec);
		
		_checkOfferExcludeDependSub(prodId,newSpec);
			
	};
	
	//添加可选包到缓存列表
	var _setSpec = function(prodId,offerSpecId){
		var newSpec = CacheData.getOfferSpec(prodId,offerSpecId);  //没有在已选列表里面
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			newSpec = query.offer.queryAttachOfferSpec(prodId,offerSpecId); //重新获取销售品构成
			if(!newSpec){
				return;
			}
			CacheData.setOfferSpec(prodId,newSpec);
		}
		return newSpec;
	};
	
	//把选中的服务保存到销售品规格中 第二步
	var _setServ2OfferSpecSub = function(prodId,offerSpec,roles){
		if(offerSpec!=undefined){
			$.each(offerSpec.offerRoles,function(){
				$.each(this.roleObjs,function(){
					var nowProd=prodId+"_"+this.objId;
					
					$(roles).each(function(i,role) { 
						var oldProd=role.prodId+"_"+role.objId;
							
						if(nowProd==oldProd){
							this.selQty = 1;
							return false;
						}else{
							this.selQty = 2;
						}
					});
				});
			});
		}
	};
	
	//校验销售品的互斥依赖 第三步
	var _checkOfferExcludeDependSub = function(prodId,offerSpec){
		var offerSpecId = offerSpec.offerSpecId;
		var param = CacheData.getExcDepOfferParam(prodId,offerSpecId);
		var data = query.offer.queryExcludeDepend(param);//查询规则校验
		if(data!=undefined){
			paserOfferDataSub(data.result,prodId,offerSpecId,offerSpec.offerSpecName); //解析数据
		}
	};
	
	//解析互斥依赖返回结果
	var paserOfferDataSub = function(result,prodId,offerSpecId,specName){
		var content = "";
		//转换接口返回的互斥依赖
		var param = {  
				excludeOffer : [],   //互斥依赖显示列表
				defaultOffer : [], //默选的显示列表
				dependOffer : {  //存放互斥依赖列表
					dependOffers : [],
					offerGrpInfos : []
				}
		};
		if(result!=""){
			var exclude = result.offerSpec.exclude;
			var depend = result.offerSpec.depend;
			var defaultOffer=result.offerSpec.defaultList;
			//解析可选包互斥依赖组
			if(ec.util.isArray(exclude)){
				for (var i = 0; i < exclude.length; i++) {
					var offerList = CacheData.getOfferList(prodId); //互斥要去除已订购手动删除
					var flag = true;
					if(offerList!=undefined){
						for ( var j = 0; j < offerList.length; j++) {
							if(offerList[j].isdel=="Y"){
								if(offerList[j].offerSpecId == exclude[i].offerSpecId){  //返回互斥数组在已订购中删除，不需要判断
									flag = false;
									break;
								}
							}
						}
					}
					if(flag){
						content += "需要关闭：   " + exclude[i].offerSpecName + "<br>";
						param.excludeOffer.push(exclude[i].offerSpecId);
					}
				}
			}
			if(depend!=undefined && ec.util.isArray(depend.offerInfos)){
				for (var i = 0; i < depend.offerInfos.length; i++) {	
					content += "需要开通： " + depend.offerInfos[i].offerSpecName + "<br>";
					param.dependOffer.dependOffers.push(depend.offerInfos[i].offerSpecId);
				}	
			}
			if(depend!=undefined && ec.util.isArray(depend.offerGrpInfos)){
				for (var i = 0; i < depend.offerGrpInfos.length; i++) {
					var offerGrpInfo = depend.offerGrpInfos[i];
					param.dependOffer.offerGrpInfos.push(offerGrpInfo);
					content += "需要开通： 开通" + offerGrpInfo.minQty+ "-" + offerGrpInfo.maxQty+ "个以下业务:<br>";
					if(offerGrpInfo.subOfferSpecInfos!="undefined" && offerGrpInfo.subOfferSpecInfos.length>0){
						for (var j = 0; j < offerGrpInfo.subOfferSpecInfos.length; j++) {
							var subOfferSpec = offerGrpInfo.subOfferSpecInfos[j];
							var offerSpec=CacheData.getOfferSpec(prodId,subOfferSpec.offerSpecId);
							if(ec.util.isObj(offerSpec)){
								if(offerSpec.isdel!="Y"&&offerSpec.isdel!="C"){
									content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" disabled="disabled" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
								}else{
									content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
								}
							}else{
								var offerSpec=CacheData.getOfferBySpecId(prodId,subOfferSpec.offerSpecId);
								if(ec.util.isObj(offerSpec)){
									if(offerSpec.isdel!="Y"&&offerSpec.isdel!="C"){
										content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" disabled="disabled" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
									}else{
										content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
									}
								}else{
									content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
								}
							}
						}
					}
				}
			}
			//解析可选包默选组
			if(ec.util.isArray(defaultOffer)){
				for (var i = 0; i < defaultOffer.length; i++) {	
					content += "需要开通： " + defaultOffer[i].offerSpecName + "<br>";
					param.defaultOffer.push(defaultOffer[i].offerSpecId);
				}	
			}
		}
		//var serContent=_servExDepReByRoleObjs(prodId,offerSpecId);//查询销售品构成成员的依赖互斥以及连带
		//content=content+serContent;
		
		AttachOffer.addOpenList(prodId,offerSpecId); 
//		if(content==""){ //没有互斥依赖
//			AttachOffer.addOpenList(prodId,offerSpecId); 
//		}else{	
//			content = "<div style='max-height:300px;overflow:auto;'>" + content + "</div>";
//			
//			$("#packageHiddenDiv").html(content);
//			
//			_setOffer2ExcludeOfferSpecSub(param);
//			excludeAddattch(prodId,offerSpecId,param);
//			excludeAddServ(prodId,"",paramObj);
//		}
	};
	
	var _initTounch = function(){
		touch.on('.item', 'touchstart', function(ev){
//			ev.preventDefault();
		});
		$(".item").each(function(i){
			touch.on(this, 'swiperight', function(ev){
				$("#carousel-example-generic").carousel('prev');
			});
			
			touch.on(this, 'swipeleft', function(ev){
				$("#carousel-example-generic").carousel('next');
			});
		});

	};
	//初始化uim卡号
	var _initUimCode = function() {
		//错误提示信息，如果有号码，但是UIM为空时提示
		var codeMsg=OrderInfo.newOrderNumInfo.codeMsg;
		
		if(codeMsg!=null && codeMsg!=""){
			$.alert("提示",codeMsg);
		}else{
			var mktResInstCodeSub= OrderInfo.newOrderNumInfo.mktResInstCode;
			
			if(OrderInfo.newOrderNumInfo.mktResInstCode && mktResInstCodeSub!=null && mktResInstCodeSub!="" && mktResInstCodeSub!="null"){
				var mktResInstCode = mktResInstCodeSub.split(",");
				
				if(mktResInstCode!=null && mktResInstCode.length>0){
					for (var i = 0; i <= mktResInstCode.length; i ++) {
						//numAndUim-->号码_UIM
						var numAndUim=mktResInstCode[i];
						
						if(numAndUim!=null && numAndUim!=""){
							var codes=numAndUim.split("_");
							if(codes!=null && codes.length==2){
								var num=codes[0];
								var uim=codes[1];
								
								var uimParam = {"instCode":uim};
								var response = $.callServiceAsJsonGet(contextPath+"/token/pc/mktRes/qrymktResInstInfo",uimParam);
								
								if (response.code==0) {
									if(response.data && response.data.mktResBaseInfo){
										if(response.data.mktResBaseInfo.statusCd=="1102"){
											$("#uim_check_btn_"+num).attr("disabled",true);
											$("#uim_check_btn_"+num).removeClass("purchase").addClass("disablepurchase");
											$("#uim_release_btn_"+num).attr("disabled",false);
											$("#uim_release_btn_"+num).removeClass("disablepurchase").addClass("purchase");
											$("#uim_txt_" + num).val(uim);
											
											var coupon = {
												couponUsageTypeCd : "3", //物品使用类型
												inOutTypeId : "1",  //出入库类型
												inOutReasonId : 0, //出入库原因
												saleId : 1, //销售类型
												couponId : response.data.mktResBaseInfo.mktResId, //物品ID
												couponinfoStatusCd : "A", //物品处理状态
												chargeItemCd : "3000", //物品费用项类型
												couponNum : response.data.mktResBaseInfo.qty, //物品数量
												storeId : response.data.mktResBaseInfo.mktResStoreId, //仓库ID
												storeName : "1", //仓库名称
												agentId : 1, //供应商ID
												apCharge : 0, //物品价格
												couponInstanceNumber : response.data.mktResBaseInfo.instCode, //物品实例编码
												terminalCode : response.data.mktResBaseInfo.instCode,//前台内部使用的UIM卡号
												ruleId : "", //物品规则ID
												partyId : OrderInfo.cust.custId, //客户ID
												prodId :  num, //产品ID
												offerId : "-1", //销售品实例ID
												state : "ADD", //动作
												relaSeq : "" //关联序列	
											};
											
											OrderInfo.clearProdUim(num);
											OrderInfo.boProd2Tds.push(coupon);
										}else{
											$.alert("提示","UIM卡["+uim+"]不是预占状态，当前为"+response.data.mktResBaseInfo.statusCd);
										}
									}else{
										$.alert("提示","没有查询到相应的UIM卡["+uim+"]信息");
									}
								}else if (response.code==-2){
									$.alert(response.data);
								}else {
									$.alert("提示","UIM信息查询接口出错,稍后重试");
								}
							}
						}
					}
				}
			}
		}
	};
	
	//增加传入帐户
	var _createAcctWithId = function() {
	   //帐户信息查询参数初始化 
		var acctQueryParam;
		acctQueryParam = {acctCd : OrderInfo.acct.acctCd,isServiceOpen:"Y"};
		acctQueryParam.areaId=OrderInfo.getAreaId();
		$.callServiceAsJson(contextPath+"/order/account", acctQueryParam, {
				"before":function(){	},
				"always":function(){},
				"done" : function(response){
					if(response.code==-2){//查询接口出错
						$.alertM(response.data);
						return;
					}
					if(response.code==0){//查询成功
						var returnMap = response.data;
						if(returnMap.resultCode==0){
							if(returnMap.accountInfos && returnMap.accountInfos.length > 0){
								//将对应的帐号添加进进OrderInfo.acct中，以便生成订单时使用
								$.each(returnMap.accountInfos, function(i, prodAcctInfo){
									if(prodAcctInfo.acctId!=null&&prodAcctInfo.acctId!=""){
										OrderInfo.acct={"acctId":prodAcctInfo.acctId,"acctcd":prodAcctInfo.accountNumber,"name":prodAcctInfo.name};
										return false;
									}	
								});	
							} else{//未查询到帐户信息
							    $.alert("提示","没有查询到帐户合同号对应的帐户信息");
							}
						}
						else{
							$.alertM(returnMap.resultMsg);
						}				
					}else{
						$.alertM(response.data);
					}
				}
			});
	};
	
	var _loadAttachOffer = function(param) {
		for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
			var prodInfo = OrderInfo.oldprodInstInfos[i]; //获取老用户产品信息
//			var uimDivShow=false;//是否已经展示了
			//var prodId = prodInfo.prodInstId;
			$.each(OrderInfo.oldoffer,function(){
				if(this.accNbr == prodInfo.accNbr){
					var oldoffer = this;
					$.each(oldoffer.offerMemberInfos,function(){
						var member = this;
						if(member.objType==CONST.OBJ_TYPE.PROD){
							var prodId = this.objInstId;
							var param = {
									areaId : OrderInfo.getProdAreaId(prodId),
									channelId : OrderInfo.staff.channelId,
									staffId : OrderInfo.staff.staffId,
								    prodId : prodId,
								    prodSpecId : member.objId,
								    offerSpecId : prodInfo.mainProdOfferInstInfos[0].prodOfferId,
								    offerRoleId : "",
								    acctNbr : member.accessNumber,
								    partyId:prodInfo.custId,
								    distributorId:OrderInfo.staff.distributorId,
								    mainOfferSpecId:prodInfo.mainProdOfferInstInfos[0].prodOfferId,
								    soNbr:OrderInfo.order.soNbr
								};
							if(ec.util.isObj(prodInfo.prodBigClass)){
								param.prodBigClass = prodInfo.prodBigClass;
							}
							$.each(OrderInfo.oldofferSpec,function(){
								if(this.accNbr==prodInfo.accNbr){
									$.each(this.offerSpec.offerRoles,function(){
										if(this.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD || this.memberRoleCd==CONST.MEMBER_ROLE_CD.COMMON_MEMBER){
											param.offerRoleId = this.offerRoleId;
										}
									});
								}
							});
							
							//获取已订购，可订购等数据[W]
							var res = query.offer.queryChangeAttachOfferSub(param);
							//var res = query.offer.queryAttachSpec(param);
							$("#attach_"+prodId).html(res);	
							
							//如果objId，objType，objType不为空才可以查询默认必须
							if(ec.util.isObj(member.objId)&&ec.util.isObj(member.objType)&&ec.util.isObj(member.offerRoleId)){
								param.queryType = "1,2";
								param.objId = member.objId;
								param.objType = member.objType;
								param.memberRoleCd = "401";
								//默认必须可选包
								var data = query.offer.queryDefMustOfferSpec(param);
								CacheData.parseOffer(data);
								//默认必须功能产品
								var data = query.offer.queryServSpec(param);
								CacheData.parseServ(data);
							}
							if(ec.util.isArray(OrderInfo.oldofferSpec)){ //主套餐下的成员判断
	//								var member = CacheData.getOfferMember(prodId);
								$.each(OrderInfo.oldofferSpec,function(){
									if(this.accNbr == prodInfo.accNbr){
										var offerRoles = this.offerSpec.offerRoles;
										$.each(offerRoles,function(){
											if(this.offerRoleId==member.offerRoleId && member.objType==CONST.OBJ_TYPE.PROD){
												var offerRole = this;
												$.each(this.roleObjs,function(){
													if(this.objType==CONST.OBJ_TYPE.SERV){
														var serv = CacheData.getServBySpecId(prodId,this.objId);//从已订购功能产品中找
														if(serv!=undefined){ //不在已经开跟已经选里面
															var $oldLi = $('#li_'+prodId+'_'+serv.servId);
															if(this.minQty==1){
																$oldLi.append('<dd class="mustchoose"></dd>');
															}
															$oldLi.append('<dd id="jue_'+prodId+'_'+serv.servId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
														}
													}
												});
												return false;
											}
										});
									}
								});
							}
							AttachOffer.changeLabel(prodId,prodInfo.productId,"");
						}
					});
				}
			});
			
//				if(_isChangeUim(prodId)){ //需要补换卡
//					if(!uimDivShow){
//						$("#uimDiv_"+prodId).show();
//					}else{
//						$("#uimDiv_"+prodId).hide();
//					}
//				}
//				uimDivShow=true;
			
			var oldoffer = {};
			if(ec.util.isArray(OrderInfo.oldoffer)){ //主套餐下的成员判断
//				var member = CacheData.getOfferMember(prodId);
			    $.each(OrderInfo.oldoffer,function(){
			    	if(this.accNbr == prodInfo.accNbr){
			    		oldoffer = this;
			    	}
			    });
			}
			//老用户加入副卡需要预校验,主卡是4G，加入的老用户为3G
			if(order.prodModify.choosedProdInfo.is3G== "N" && prodInfo.mainProdOfferInstInfos[0].is3G =="Y"){
				if(!order.memberChange.checkOrder(prodInfo,oldoffer)){ //省内校验单
					return;
				}
				order.memberChange.checkOfferProd(oldoffer);
			}
			
		}
//		order.main.reload();
					
//				});
//			}
//		});
	};
	
	//动态添加产品属性、附属销售品等
	var _loadOther = function(param) {
		$.each(OrderInfo.offerSpec.offerRoles,function(){ //遍历主套餐规格
			var offerRole = this;
			for ( var i = 0; i < this.prodInsts.length; i++) {
				var prodInst = this.prodInsts[i];
				var param = {   
					offerSpecId : OrderInfo.offerSpec.offerSpecId,
					prodSpecId : prodInst.objId,
					offerRoleId: prodInst.offerRoleId,
					prodId : prodInst.prodInstId,
					queryType : "1,2",
					objType: prodInst.objType,
					objId: prodInst.objId,
					memberRoleCd : prodInst.memberRoleCd
				};
				AttachOffer.queryAttachOfferSpec(param);  //加载附属销售品
				var obj = {
					div_id : "item_order_"+prodInst.prodInstId,
					prodId : prodInst.prodInstId,
					offerSpecId : OrderInfo.offerSpec.offerSpecId,
					compProdSpecId : "",
					prodSpecId : prodInst.objId,
					roleCd : offerRole.roleCd,
					offerRoleId : offerRole.offerRoleId,
					partyId : OrderInfo.cust.custId
				};
				order.main.spec_parm(obj); //加载产品属性
			}		
		});
		
		if(order.service.oldMemberFlag){
			order.main.loadAttachOffer();
		}
	};
	
	var _paymethodChange = function(obj){
		$(".paymethodChange").each(function(){
			if($(this).attr("id")!=$(obj).attr("id")){
				$(this).val($(obj).val());
			}
		});
	};
	
	var _templateTypeCheck = function(obj){
		if($("#isTemplateOrder").attr("checked")=="checked"){//如果选择批量模板
			var paytype=$('select[name="pay_type_-1"]').val(); 
			if(obj&&$(obj).val()){//如果是 批量模板 选择 批开模板，直接提示
				if($(obj).val()=="0"&&paytype!="2100"){//如果不是预付费
					$.alert("提示","您选择批开活卡模板，付费方式需改成'预付费'！");
					$("html").scrollTop(0);
					return false ;
				}
			}else{//如果是 订单提交时 判断
				var templeVal = $("#templateOrderDiv select").val();
				if(templeVal){
					if(templeVal=="0"&&paytype!="2100"){//如果不是预付费
						$.alert("提示","您选择批开活卡模板，付费方式需改成预付费！");
						$("html").scrollTop(0);
						return false ;
					}
				}
			}
			/*
			var paymethod = null ;
			var paymethodid = null ;
			$(".paymethodChange").each(function(){//获取第一个付费方式
				if(paymethod==null){
					paymethod = $(this).val();
					paymethodid = $(this).attr("id");
				}
			});
			if(obj&&$(obj).val()){//如果是 批量模板 选择 批开模板，直接提示
				if($(obj).val()=="0"&&paymethod!="2100"){//如果不是预付费
					$.alert("提示","您选择批开活卡模板，付费方式需改成'预付费'！");
					$("html").scrollTop(0);
					return false ;
				}
			}else{//如果是 订单提交时 判断
				var templeVal = $("#templateOrderDiv select").val();
				if(templeVal){
					if(templeVal=="0"&&paymethod!="2100"){//如果不是预付费
						$.alert("提示","您选择批开活卡模板，付费方式需改成预付费！");
						$("html").scrollTop(0);
						return false ;
					}
				}
			}
			*/
		}
		return true ;
	};
	
	var _initFeeType = function(param) {
		if (param.feeType != undefined && param.feeType && param.feeType != CONST.PAY_TYPE.NOLIMIT_PAY) {
			$("input[name^=pay_type_][value="+param.feeType+"]").attr("checked","checked");
			$("input[name^=pay_type_]").attr("disabled","disabled");
		}
	};
	
	
	//展示帐户
	var _showAcct = function(accountInfos){
		$("#acctListTab tbody").empty();
		$.each(accountInfos,function(i, accountInfo){
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
				var found = false;
				var custAccts = $("#acctSelect").find("option");
				$.each(custAccts, function(i, custAcct){
					if(custAcct.value==accountInfo.acctId){
						$("#acctSelect").find("option[value="+custAcct.value+"]").attr("selected","selected");
						found = true;
						return false;
					}					
				});					
				$(this).dispatchJEvent("chooseAcct",accountInfo);				
				easyDialog.close();
				$("#defineNewAcct").hide();
			});
		});
	};
	
	
	function _spec_parm(param){
		$.callServiceAsHtmlGet(contextPath + "/token/app/order/orderSpecParam",param, {
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else if(response && (response.data == 0||response.data == "0")){
					return;
				}
				$("#"+param.div_id).append(response.data);
//				$("div[name='spec_params']").each(function(){
					$.refresh($(this));
//				});
				//判断使用人产品属性是否必填
				$('#choose_user_btn_'+param.prodId).parent().parent().parent().hide();
				//只有在新装的时候才可编辑“是否信控”产品属性
				var xkDom = $("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+param.prodId);
				if(xkDom.length == 1){
					if(OrderInfo.actionFlag != 1&& OrderInfo.actionFlag != 14){
						$(xkDom).attr("disabled","disabled");
					} else {
						$("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+param.prodId+" option[value=' ']").remove(); //去除“请选择”空值选项
						$(xkDom).val("20"); //默认为“是”
						if(OrderInfo.offerSpec.feeType == CONST.PAY_TYPE.BEFORE_PAY){ //“预付费”默认选是，且不可编辑
							$(xkDom).attr("disabled","disabled");
						}
					}
					$(xkDom).addClass("styled-select");
				}
				//新装--二次加载(是否信控)处理 
				if(OrderInfo.provinceInfo.reloadFlag&&OrderInfo.provinceInfo.reloadFlag=="N"){
					$.each(OrderInfo.reloadProdInfo.checkMaskList,function(){
						$("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+this.prodId+"").find("option[value='"+this.isCheckMask+"']").attr("selected","selected");
					});
					
					//判断是否是预付费，是：修改信控信息
					var feetype = $("select[name='pay_type_-1']").find("option:selected").val();
					if(feetype=="2100"){
						order.main.feeTypeCascadeChange($("select[name='pay_type_-1']"),'-1');
					}
				}
			},
			fail:function(response){
				$.unecOverlay();
			}
		});
	}
	
	//产品属性 提交
	function _spec_parm_change_save(){
		//OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.PRODUCT_PARMS,0,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PRODUCT_PARMS),"");
		if(!_check_parm("order_spc_update")){
			return ;
		}
		var boProdItems = new Array();
		//input
		var chang_row = 0;
		$("#order_spc_update input").each(function(){
			//订单属性 是否模板 由公共类自动添加，这里不加入属性
			if($(this).attr("id")!="order_remark"&&$(this).attr("id")!="isTemplateOrder"&&$(this).attr("id")!="templateOrderName"&&$(this).attr("id")!="templateOrderType"){
				if($(this).attr("itemSpecId")!=null&&$(this).attr("itemSpecId")!=""){
					if("1"==$(this).attr("addtype")){//如果实例没有，通过规格带出的属性，做ADD
						if($(this).val()!=null&&$(this).val()!=""){
							var row1 = {
									"itemSpecId":$(this).attr("itemSpecId"),
									"prodSpecItemId":$(this).attr("prodSpecItemId"),
									"state":"ADD",
									"value":$(this).val()
							};
							boProdItems.push(row1);
							chang_row++;
						}
					}else{
						if($(this).val()!=$(this).attr("oldValue")){
							if($(this).attr("oldValue")!=null&&$(this).attr("oldValue")!=""){
								var row2 = {
										"itemSpecId":$(this).attr("itemSpecId"),
										"prodSpecItemId":$(this).attr("prodSpecItemId"),
										"state":"DEL",
										"value":$(this).attr("oldValue")
								};
								boProdItems.push(row2);
								chang_row++;
							}
							if($(this).val()!=null&&$(this).val()!=""){
								var row3 = {
										"itemSpecId":$(this).attr("itemSpecId"),
										"prodSpecItemId":$(this).attr("prodSpecItemId"),
										"state":"ADD",
										"value":$(this).val()
								};
								boProdItems.push(row3);
								chang_row++;
							}
						}
					}
				}
			}
		});
		//select
		$("#order_spc_update select").each(function(){
			if($(this).attr("id")!="templateOrderType"){
				if($(this).attr("itemSpecId")!=null&&$(this).attr("itemSpecId")!=""){
					if("1"==$(this).attr("addtype")){//如果实例没有，通过规格带出的属性，做ADD
						if($(this).val()!=null&&$(this).val()!=""){
							var row1 = {
									"itemSpecId":$(this).attr("itemSpecId"),
									"prodSpecItemId":$(this).attr("prodSpecItemId"),
									"state":"ADD",
									"value":$(this).val()
							};
							boProdItems.push(row1);
							chang_row++;
						}
					}else{
						if($(this).val()!=$(this).attr("oldValue")){
							if($(this).attr("oldValue")!=null&&$(this).attr("oldValue")!=""){
								var row2 = {
										"itemSpecId":$(this).attr("itemSpecId"),
										"prodSpecItemId":$(this).attr("prodSpecItemId"),
										"state":"DEL",
										"value":$(this).attr("oldValue")
								};
								boProdItems.push(row2);
								chang_row++;
							}
							if($(this).val()!=null&&$(this).val()!=""){
								var row3 = {
										"itemSpecId":$(this).attr("itemSpecId"),
										"prodSpecItemId":$(this).attr("prodSpecItemId"),
										"state":"ADD",
										"value":$(this).val()
								};
								boProdItems.push(row3);
								chang_row++;
							}
						}
					}
				}
			}
		});
		var busiOrderAttrs ;
		if($("#order_remark").val()){
			busiOrderAttrs = [{
				atomActionId : OrderInfo.SEQ.atomActionSeq--,
				itemSpecId : CONST.ITEM_SPEC_ID_CODE.busiOrderAttrs ,//"111111122",//备注的ID，待修改
				value : $("#order_remark").val()
			}];
			chang_row++;
		}
		if(chang_row<1){
			$.alert("提示","您未修改订单属性");
			return ;
		}
		/*
		if(!SoOrder.builder()){//加载实例缓存，并且初始化订单数据
			return;
		} 
		*/
		//配置参数：来调用产品属性修改的ser
		//OrderInfo.boProdItems = boProdItems ;
		var data = {boProdItems:boProdItems} ;
		if(busiOrderAttrs){
			data.busiOrderAttrs = busiOrderAttrs ;
		}
		OrderInfo.actionFlag=33;//改产品属性
		SoOrder.submitOrder(data);

	}
	//产品属性-校验所有属性
	function _check_parm(ul_id){
		var f = true ;
		$("#"+ul_id).find("input").each(function(){
			if(f){
				f = _check_parm_self(this);
			}
		});
		return f;
	}
	//产品属性-校验单个属性
	function _check_parm_self(obj){
		//alert("---"+$(obj).val());
		if($(obj).attr("check_option")=="N"){
			if($(obj).val()==null||$(obj).val()==""){
				$.alert("提示",$(obj).attr("check_name")+" 尚未填写");
				return false;
			}
		}
		
		if($(obj).attr("check_type")=="check"){
			var len = $(obj).attr("check_len");
			//alert($(this).val()+"--"+len);
			if(len>0){
				//alert($(this).val().length+"---"+len);
				if($(obj).val().length>len){
					$.alert("提示",$(obj).attr("check_name")+" 长度过长(<"+len+")");
					return false;
				}
			}
			var mask = $(obj).attr("check_mask");
			if(mask!=null&&$(obj).val()!=null&&$(obj).val()!=""){
				//alert($(obj).val()+"---"+mask);
				//mask= "^[A-Za-z]+$";
				var pattern = new RegExp(mask) ;
				if(!pattern.test($(obj).val())){
					$.alert("提示",$(obj).attr("check_name")+ " 校验失败：" + $(obj).attr("check_mess"));
					return false;
				}
			}
			var v_len = $(obj).val().length;
			if(v_len>0&&$(obj).attr("dataType")=="3"){//整数
				if(!/^[0-9]+$/.test($(obj).val())){
					$.alert("提示",$(obj).attr("check_name")+ " 非数字，请修改");
					return false;
				}
			}else if(v_len>0&&$(obj).attr("dataType")=="5"){//小数
				if(!/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test($(obj).val())){
					$.alert("提示",$(obj).attr("check_name")+ " 非小数，请修改");
					return false;
				}
			}else if(v_len>0&&($(obj).attr("dataType")=="4"||$(obj).attr("dataType")=="16")){//日期
				/*
				if(/Invalid|NaN/.test(new Date($(obj).val().substring(0,10)))){
					$.alert("提示",$(obj).attr("check_name")+ " 非日期，请修改");
					return false;
				}
				*/
			}
		}
		return true ;
	}
	//滚动分页回调 ok
	var _queryScroll = function(scrollObj){
		if(scrollObj && scrollObj.page){
			_queryStaffPage(scrollObj.page,scrollObj.scroll);
		}
	};
	//协销人-查询-入口 ok
	var _queryStaff = function(dealerId,objInstId){
		$.callServiceAsHtmlGet(contextPath + "/pad/staffMgr/getStaffListPrepare",{"dealerId":dealerId,"objInstId":objInstId},{
			"done" : function(response){
				//统一弹出框
				var popup = $.popup("#div_staff_dialog",response.data,{
					cache:true,
					width:$(window).width()-200,
					height:$(window).height(),
					contentHeight:$(window).height()-120,
					afterClose:function(){}
				});
				$("#btn_staff_select_chk").off("tap").on("tap",function(){_setStaff(objInstId);});
				$("#a_order_staff_qry").off("tap").on("tap",function(){_queryStaffPage(1);});
			}
		});
	};
	//协销人-查询 -列表 ok
	var _queryStaffPage = function(qryPage,scroller){
		var param = {
				"dealerId" :$("#dealer_id").val(),
				"qrySalesCode":$("#qrySalesCode").val(),
				"staffName":$("#qryStaffName").val(),
				"staffCode":$("#qryStaffCode").val(),
				"staffCode2":$("#qryStaffCode").val(),
				"salesCode":$("#qrySalesCode").val(),
				"pageIndex":qryPage,
				"objInstId":$("#objInstId").val(),
				"pageSize" :10
			};
		
		$.callServiceAsHtml(contextPath + "/pad/staffMgr/getStaffList",param,{
			"before":function(){
				if(qryPage==1)$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				if(qryPage==1)$.unecOverlay();
			},
			"done" : function(response){
				var _data = "";
				if(!response){
					_data='';
				}else{
					_data = response.data;
				}
				var content$ = $("#div_order_dealer_list");
				//首页时直接覆盖,其它页追加
				if(qryPage==1)content$.html(_data);
				else content$.find("tbody").append(_data);
				
				content$.find("tr").each(function(){
					$(this).off("tap").on("tap",function(event){
						$(this).addClass("userorderlistlibg").siblings().removeClass("userorderlistlibg");
					});
				});
				
				//回调刷新iscroll控制数据,控件要求
				if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
			}
		});	

	};
	//选中协销人 ok
	var _setStaff = function(objInstId){
		var $staff = $("#div_order_dealer_list tr.userorderlistlibg");
		$staff.each(function(){
			$("#dealer_"+objInstId).val($(this).attr("staffName")).attr("staffId", $(this).attr("staffId"));
		});
		if($staff.length > 0){
			$("#div_staff_dialog").popup("close");
		}else{
			$.alert("提示","请先选择协销人！");
		}
	};
	/*
	function _setStaff(v_id,staffId,staffCode,staffName){
		//alert(v_id+"--"+staffId+"=="+staffName);
		$("#"+v_id).val(staffName+"("+staffCode+")").attr("staffId",staffId);
		if(!$("#acctDialog").is("hidden")) {
			easyDialog.close();
		}
	}
	*/
	
	//帐户查询
	var _chooseAcct = function() {
		$("#acctDialog .contract_list td").text("帐户查询");
		$("#acctDialog .selectList").show();
		easyDialog.open({
			container : 'acctDialog'
		});
		$("#acctPageDiv").show();
		var listenerName = "chooseAcct";
		var $sel = $("#acctSelect");
		if (!$sel.hasJEventListener(listenerName)) {
			$sel.addJEventListener(listenerName,function(data){
				//遍历当前帐户列表，如果已存在，则直接显示，如果不存在，则加上一个option
				var found = false;
				$.each($sel.find("option"), function(i, option) {
					if ($(option).val() == data.acctId) {
						found = true;
						return false;
					}
				});
				if (found==false) {
					$("<option>").text(data.name+" : "+data.accountNumber).attr("value",data.acctId).attr("acctcd",data.accountNumber).appendTo($sel);
				}
				$sel.find("option[value="+data.acctId+"]").attr("selected","selected");
				if(data.acctId>0){
					$("#account").find("a:eq(1)").show();
				}
			});
		}
		//初始化弹出框
		$("#acctListTab tbody").empty();
		$("#acctPageDiv").empty();
	};
	
	//新增帐户
	var _createAcct = function() {
		$("#acctSelect").append("<option value='-1' style='color:red'>[新增] "+OrderInfo.cust.partyName+"</option>");
		$("#acctSelect").find("option[value='-1']").attr("selected","selected");
		$("#acctName").val(OrderInfo.cust.partyName);//默认帐户名称为客户名称
		//新增帐户自定义支付属性
		$("#defineNewAcct").show();
		//隐藏帐户信息的按钮
		$("#account").find("a:gt(0)").hide();
		//获取账单投递信息主数据并初始化新建帐户自定义属性
		window.setTimeout("order.main.showNewAcct()", 0);
	};
	
	//获取账单投递信息主数据并初始化新建帐户自定义属性
	var _showNewAcct = function(){
		acct.acctModify.ifCanAdjustBankPayment();//查询工号权限：能否选择银行托收
		acct.acctModify.getBILL_POST(function(){
			acct.acctModify.paymentType();
			acct.acctModify.billPostType();
		});
	};
	
	//展示帐户信息
	var _acctDetail = function() {
		var acctSel = $("#acctSelect");
		if(!acctSel.val()){
			$.alert("提示","请选择一个帐户");
			return
		}
		if(acctSel.val() == -1){
			$.alert("提示","该帐户是新建帐户");
			return;
		}
		$("#acctDialog .contract_list td").text("帐户信息");
		$("#acctDialog .selectList").hide();
		$("#acctPageDiv").hide();
		$("#acctListTab tbody").empty();
		easyDialog.open({
			container : 'acctDialog'
		});
		var acctQueryParam = {
			acctCd : acctSel.find("option:selected").attr("acctcd"),
			isServiceOpen:"Y"
		};			
		$.callServiceAsJson(contextPath+"/order/account", acctQueryParam, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code==-2){
					$.alertM(response.data);
					return;
				}
				if(response.code==0){
					_showAcct(response.data.accountInfos);					
				}
				else{
					$("<tr><td colspan=4>"+response.data+"</td</tr>").appendTo($("#acctListTab tbody"));
				}
				$("#acctListTab tr").off("click");				
			}			
		});
	};
	
	var _lastStep = function(callbackFunc) {
		$.confirm("信息","确定回到上一步吗？",{
			yes:function(){
				//TODO　may initialize something;				
				var boProdAns = OrderInfo.boProdAns;
				var boProd2Tds = OrderInfo.boProd2Tds;
				//取消订单时，释放被预占的UIM卡
				if(boProd2Tds.length>0){
					for(var n=0;n<boProd2Tds.length;n++){
						var param = {
								numType : 2,
								numValue : boProd2Tds[n].terminalCode
						};
						$.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param, {
							"done" : function(){}
						});
					}
				}
				//释放预占的号码
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
				}
				//清除号码的缓存！
				order.phoneNumber.resetBoProdAn();
				$("#order_prepare").show();
				$("#order").hide();
				if(typeof(callbackFunc)=="function"){
					callbackFunc();
				}
			},no:function(){
				
			}},"question");
	};
	
	var _getTestParam = function() {
		return {
			boActionTypeCd : S1,
			boActionTypeName : "订购",
			offerSpecId : 1234,
			offerSpecName : "乐享3G-129套餐",
			feeType : 1200,
			viceCardNum : 3,
			offerNum : 3,
			type : 1,//1购套餐2购终端3选靓号
			terminalInfo : {
				terminalName : "IPhone5",
				terminalCode : "46456457345"
			},
			offerRoles : [
				{
					offerRoleId : 1234,
					offerRoleName : "主卡",
					memberRoleCd : "0",
					roleObjs : [{
						offerRoleId : 1,
						objId : CONST.PROD_SPEC.CDMA,
						objName : "CDMA",
						objType : 2
					}]
				},
				{
					offerRoleId : 2345,
					offerRoleName : "副卡",
					memberRoleCd : "1"
				}
			]
		};
	};
	

	var _genRandPass6Input = function(id){
		var pass = _genRandPass6();
		$("#"+id).val(pass);
	};
	
	var _genRandPass6 = function(){
		var str = "" ;
		var lastOneS = "" ;
		var thisOneS = "" ;
		var thisOneI = 0 ;
		for(var k=0;k<6;k++){
			do{
				if(str.length>0){
					lastOneS = str.substring(str.length-1,str.length) ;
				}
				thisOneI = parseInt(Math.random()*9+1);
				thisOneS = ""+thisOneI ;
				if(str.length==5){
					if(_checkIncreace6(str + thisOneS)){
						continue;
					}
				}
			}while(lastOneS==thisOneS);
			str = str + thisOneS ;
		}
		if(str.length!=6){
			return null ;
		}
		return str ;
	};
	
	var _checkIncreace6 = function(str){
		var rownum = 0 ;
		if(str && str.length==6){
			for(var i=0;i<5;i++){
				var int1 = parseInt(str.substring(i,i+1));
				var int2 = parseInt(str.substring(i+1,i+2));
				rownum = rownum + (int1-int2);
			}
			if(rownum==5||rownum==-5){
				return true ;
			}else{
				return false ;
			}
		}else{
			return false ;
		}
	};
	
	var _passwordCheckInput = function(id,accNbr){
		var val = $("#"+id).val();
		return _passwordCheckVal(val,accNbr);
	};
	
	var _passwordCheckVal = function(val,accNbr){
		var detail = "<div style='text-indent:0px;'>密码设置规则：<br/>1、密码必须为六位全数字；<br/>2、密码不能与接入号中的信息重复；<br/>3、密码不能包含连续相同的数字；<br/>4、密码不能是连续的六位数字。</div>";
		var reg = new RegExp("^([0-9]{6})$");//6位纯数字 0~9
		if(val==null){
			$.alertMore("提示", "", "密码不可为空！", detail, "");
			return false ;
		}else if(!reg.test(val)){
			$.alertMore("提示", "", "密码包含非数字或长度不是6位", detail, "");
			return false ;
		}
		if(accNbr!=null && accNbr.indexOf(val)>=0){
			$.alertMore("提示", "", "密码不能与接入号中的信息重复，请修改！", detail, "");
			return false ;
		}
		for(var k=0;k<5;k++){
			lastOneS = val.substring(k,k+1) ;
			thisOneS = val.substring(k+1,k+2) ;
			if(lastOneS==thisOneS){
				$.alertMore("提示", "", "密码中包含连续相同数字，请修改！", detail, "");
				return false ;
			}
		}
		if(_checkIncreace6(val)){
			$.alertMore("提示", "", "密码不可是连续6位数字，请修改！", detail, "");
			return false ;
		}
		return true ;
	};
	
	//付费类型选项变更时级联更新相关的产品属性
	var _feeTypeCascadeChange = function(dom,prodId){
		var feeType = $(dom).val();
		var xkDom = $("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+prodId);
		//“是否信控”产品属性，预付费时默认为“是”且不可编辑，其他默认为“是”但可编辑
		if(feeType == CONST.PAY_TYPE.BEFORE_PAY){
			$(xkDom).val("20");
			$(xkDom).attr("disabled", true);
		} else {
			$(xkDom).attr("disabled", false);
		}
		$(xkDom).addClass("styled-select");
	};
	
	
	return {
		buildMainView 				:				 _buildMainView,
		feeTypeCascadeChange		:				 _feeTypeCascadeChange,
		initTounch					:				 _initTounch,
		spec_parm					: 				 _spec_parm,
		check_parm			: _check_parm,
		queryScroll			: _queryScroll,
		queryStaff			: _queryStaff,
		queryStaffPage		: _queryStaffPage,
		setStaff			: _setStaff,
		chooseAcct 			: _chooseAcct,
		check_parm_self		: _check_parm_self,
		createAcct 			: _createAcct,
		createAcctWithId    :_createAcctWithId,
		showNewAcct 		: _showNewAcct,
		acctDetail 			: _acctDetail,
		//spec_parm_change: _spec_parm_change,
		spec_parm_change_save:_spec_parm_change_save,
		//spec_password_change:_spec_password_change,
		//spec_password_change_save:_spec_password_change_save,
		paymethodChange		:_paymethodChange,
		templateTypeCheck	:_templateTypeCheck,
		lastStep 			: _lastStep,
		genRandPass6		:_genRandPass6,
		genRandPass6Input	:_genRandPass6Input,
		passwordCheckInput	:_passwordCheckInput,
		passwordCheckVal	:_passwordCheckVal,
		checkIncreace6		:_checkIncreace6,
		newProdReload      :_newProdReload,
		loadAttachOffer:_loadAttachOffer,
	};
})();


/**
 * 销售品产品相关查询
 * 
 * @author wukf
 * date 2013-08-22
 */
CommonUtils.regNamespace("query","offer");

query.offer = (function() {
	
	/**
	 * 销售品规格构成查询
	 * @param  offerSpecId 销售品规格ID
	 * @param  offerTypeCd 销售品类型,销售品主 1 ,附属2  
	 * @param  mainOfferSpecId  主套餐id
	 * @param  partyId  客户ID
	 * @callBackFun 回调函数
	 */
	var _queryOfferSpec = function(param,callBackFun) {
		param.areaId = OrderInfo.cust.areaId;
		var url= contextPath+"/app/offer/queryOfferSpec";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsJsonGet(url,param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询销售品规格构成中,请稍后....</strong>");
				},
				"done" : function(response){
					$.unecOverlay();
					if (response.code==0) {
						if(response.data){
							callBackFun(response.data.offerSpec);
						}
					}else if (response.code==-2){
						$.alertM(response.data);
					}else {
						$.alert("提示","查询销售品规格构成失败,稍后重试");
					}
				}
			});
		}else{
			$.ecOverlay("<strong>正在查询销售品规格构成中,请稍后....</strong>");
			var response = $.callServiceAsJsonGet(url,param);	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data.offerSpec;
				}
			}else if (response.code==-2){
				$.alertM(response.data);
			}else {
				$.alert("提示","查询销售品规格构成失败,稍后重试");
			}
		}
	};

	/**
	 * 销售品实例构成查询
	 * @param  offerId 销售品实例ID
	 * @param  areaId 地区ID
	 * @param  accessNumber 接入号
	 * @callBackFun 异步调用函数
	 */
	var _queryOfferInst = function(param,callBackFun) {
		var url= contextPath+"/app/offer/queryOfferInst";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsJsonGet(url, param, {
				"before":function(){
					$("#attach-modal").modal('show');
					//$.ecOverlay("<strong>正在查询销售品实例中,请稍后....</strong>");
				},	
				"done" : function(response){
					//$.unecOverlay();
					$("#attach-modal").modal('hide');
					if (response.code==0) {
						if(response.data){
							callBackFun(response.data);
						}
					}else if (response.code==-2){
						$.alertM(response.data);
					}else {
						$.alert("提示","查询销售品实例失败,稍后重试");
					}
				}
			});
		}else {
			$.ecOverlay("<strong>正在查询销售品实例中,请稍后....</strong>");
			var response = $.callServiceAsJsonGet(url,param);	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data;
				}
			}else if (response.code==-2){
				$.alertM(response.data);
			}else {
				$.alert("提示","查询销售品实例失败,稍后重试");
			}
		}
	};
	
	//根据选择产品查询销售品实例，并保存到OrderInfo.offer
	var _setOffer = function(callBack) {
		var prod = order.prodModify.choosedProdInfo ; 
		var param = {
			offerId : prod.prodOfferInstId,
			offerSpecId : prod.prodOfferId,
			acctNbr : prod.accNbr,
			areaId : prod.areaId,
			distributorId : ""
		};
		if(typeof(callBack)=="function"){
			query.offer.queryOfferInst(param,function(data){
				if(data&&data.code == CONST.CODE.SUCC_CODE){
					var flag = true;
					if(ec.util.isArray(data.offerMemberInfos)){
						CacheData.sortOffer(data);
						for ( var i = 0; i < data.offerMemberInfos.length; i++) {
							var member = data.offerMemberInfos[i];
							if(member.objType==""){
								$.alert("提示","销售品实例构成 "+member.roleName+" 成员类型【objType】节点为空，无法继续受理,请营业后台核实");
								return false;
							}else if(member.objType==CONST.OBJ_TYPE.PROD){
								/*if(member.objId==""){
							$.alert("提示","销售品实例构成 "+member.roleName+" 接入产品规格【objId】节点为空，无法继续受理,请营业后台核实");
							return false;
						}*/
								if(member.accessNumber==""){
									$.alert("提示","销售品实例构成 "+member.roleName+" 接入产品号码【accessNumber】节点为空，无法继续受理,请营业后台核实");
									return false;
								}
							}
							if(member.objInstId==prod.prodInstId){
								flag = false;
							}
						}
						if(flag){
							$.alert("提示","销售品实例构成中 没有包含选中接入号码【"+prod.accNbr+"】，无法继续受理，请业务后台核实");
							return false;
						}
						OrderInfo.offer.offerMemberInfos = data.offerMemberInfos; 
						OrderInfo.offer.offerId = prod.prodOfferInstId;
						OrderInfo.offer.offerSpecId = prod.prodOfferId;
						OrderInfo.offer.offerSpecName = prod.prodOfferName;
						callBack();
					}else{//销售品成员实例为空
						$.alert("提示","查询销售品实例构成，没有返回成员实例无法继续受理");
						return false;
					}
				}
			}); //查询销售品实例构成
		}else{
			var data = query.offer.queryOfferInst(param); //查询销售品实例构成
			if(data&&data.code == CONST.CODE.SUCC_CODE){
				var flag = true;
				if(ec.util.isArray(data.offerMemberInfos)){
					CacheData.sortOffer(data);
					for ( var i = 0; i < data.offerMemberInfos.length; i++) {
						var member = data.offerMemberInfos[i];
						if(member.objType==""){
							$.alert("提示","销售品实例构成 "+member.roleName+" 成员类型【objType】节点为空，无法继续受理,请营业后台核实");
							return false;
						}else if(member.objType==CONST.OBJ_TYPE.PROD){
							/*if(member.objId==""){
							$.alert("提示","销售品实例构成 "+member.roleName+" 接入产品规格【objId】节点为空，无法继续受理,请营业后台核实");
							return false;
						}*/
							if(member.accessNumber==""){
								$.alert("提示","销售品实例构成 "+member.roleName+" 接入产品号码【accessNumber】节点为空，无法继续受理,请营业后台核实");
								return false;
							}
						}
						if(member.objInstId==prod.prodInstId){
							flag = false;
						}
					}
					if(flag){
						$.alert("提示","销售品实例构成中 没有包含选中接入号码【"+prod.accNbr+"】，无法继续受理，请业务后台核实");
						return false;
					}
					OrderInfo.offer.offerMemberInfos = data.offerMemberInfos; 
					OrderInfo.offer.offerId = prod.prodOfferInstId;
					OrderInfo.offer.offerSpecId = prod.prodOfferId;
					OrderInfo.offer.offerSpecName = prod.prodOfferName;
					return true;
				}else{//销售品成员实例为空
					$.alert("提示","查询销售品实例构成，没有返回成员实例无法继续受理");
					return false;
				}
			}
		}
	};
	
	//销售品参数查询
	var _queryOfferParam = function(param,callBackFun) {
		var url= contextPath+"/app/offer/queryOfferParam";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsJsonGet(url,param,{
				"before":function(){
					$.ecOverlay("<strong>查询销售品实例参数中，请稍等...</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					$.unecOverlay();
					if (response.code==0) {
						if(response.data){
							callBackFun(response.data);
						}
					}else if (response.code==-2){
						$.alertM(response.data);
					}else {
						$.alert("提示","查询销售品实例参数失败,稍后重试");
					}
				}
			});	
		}else {
			$.ecOverlay("<strong>查询销售品实例参数中，请稍等...</strong>");
			var response = $.callServiceAsJsonGet(url,param);	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data;
				}
			}else if (response.code==-2){
				$.alertM(response.data);
			}else {
				$.alert("提示","查询销售品实例参数失败,稍后重试");
			}
		}
	};	
	
	/**
	 * 已订购附属查询 
	 */
	var _queryAttachOfferHtml = function(param,callBackFun) {
		addParam(param);  //添加基本参数
		param.isServiceOpen="Y";
		var url = contextPath+"/token/app/offer/queryAttachOffer";
		if(OrderInfo.actionFlag==22){
			url = contextPath+"/app/offer/queryAttachOffer2";
		}
		if(typeof(callBackFun)=="function"){
			$.callServiceAsHtmlGet(url,{strParam:JSON.stringify(param)},{
				"before":function(){
					$.ecOverlay("<strong>正在查询销售品实例中,请稍后....</strong>");
				},
				"done" : function(response){
					$.unecOverlay();
					if (response.code==0) {
						if(response.data){
							callBackFun(response.data);
						}
					}else {
						$.alert("提示","附属销售品实例查询失败,稍后重试");
						return;
					}
				}
			});
		}else{
			$.ecOverlay("<strong>查询附属销售品实例中，请稍等...</strong>");
			var response = $.callServiceAsHtmlGet(url,{strParam:JSON.stringify(param)});	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data;
				}
			}else {
				$.alert("提示","查询附属销售品失败,稍后重试");
				return;
			}
		}		
	};
	
	/**
	 * 已订购销售品和功能产品
	 */
	var _queryOpenedAttachAndServ = function(param) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/app/offer/queryOpenedAttachAndServ";
		$.ecOverlay("<strong>查询附属销售品实例中，请稍等...</strong>");
		var response = $.callServiceAsJsonGet(url,{strParam:JSON.stringify(param)});	
		$.unecOverlay();
		if (response.code==0) {
			if(response.data){
				return response.data;
			}
		}else {
			$.alert("提示","查询附属销售品失败,稍后重试");
			return;
		}
	};
	
	//套餐变更，查询附属销售品页面
	var _queryChangeAttachOffer = function(param,callBackFun) {
		addParam(param);  //添加基本参数
		param.isServiceOpen="Y";
		var url = contextPath+"/app/offer/queryChangeAttachOffer";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsHtmlGet(url,{strParam:JSON.stringify(param)},{
				"before":function(){
					$.ecOverlay("<strong>正在查询销售品实例中,请稍后....</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					$.unecOverlay();
					if (response.code==0) {
						if(response.data){
							callBackFun(response.data);
						}
					}else {
						$.alert("提示","附属销售品实例查询失败,稍后重试");
						return;
					}
				}
			});
		}else{
			$.ecOverlay("<strong>查询附属销售品实例中，请稍等...</strong>");
			var response = $.callServiceAsHtmlGet(url,{strParam:JSON.stringify(param)});	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data;
				}
			}else {
				$.alert("提示","查询附属销售品实例失败,稍后重试");
				return;
			}
		}		
	};
	
	//套餐变更，查询附属销售品页面[W]
	var _queryChangeAttachOfferSub = function(param,callBackFun) {
		addParam(param);  //添加基本参数
		param.isServiceOpen="Y";
		var url = contextPath+"/token/app/offer/queryChangeAttachOfferSub";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsHtmlGet(url,{strParam:JSON.stringify(param)},{
				"before":function(){
					$.ecOverlay("<strong>正在查询销售品实例中,请稍候....</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					$.unecOverlay();
					if (response.code==0) {
						if(response.data){
							callBackFun(response.data);
						}
					}else {
						$.alert("提示","附属销售品实例查询失败,稍后重试");
						return;
					}
				}
			});
		}else{
			$.ecOverlay("<strong>查询附属销售品实例中，请稍等...</strong>");
			var response = $.callServiceAsHtmlGet(url,{strParam:JSON.stringify(param)});	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data;
				}
			}else {
				$.alert("提示","查询附属销售品实例失败,稍后重试");
				return;
			}
		}		
	};
	
	//附属销售品规格查询
	var _queryAttachSpec = function(param,callBackFun) {
		addParam(param);  //添加基本参数
		param.isServiceOpen="Y";
		var url = contextPath+"/app/offer/queryAttachSpec";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsHtmlGet(url,{strParam:JSON.stringify(param)},{
				"before":function(){
					$.ecOverlay("<strong>正在查询附属销售品中,请稍候....</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					if (response.code==0) {
						if(response.data){
							callBackFun(response.data);
						}
					}else if (response.code==-2){
						$.alertM(response.data);
						return;
					}else {
						$.alert("提示","附属销售品查询失败,稍后重试");
						return;
					}
				}
			});	
		}else {
			$.ecOverlay("<strong>查询附属销售品中，请稍等...</strong>");
			var response = $.callServiceAsHtmlGet(url,{strParam:JSON.stringify(param)});	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data;
				}
			}else if (response.code==-2){
				$.alertM(response.data);
				return;
			}else {
				$.alert("提示","查询附属销售品失败,稍后重试");
				return;
			}
		}
	};
	
	//加载附属标签下的附属销售品
	var _queryCanBuyAttachSpec = function(param,callBackFun) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/app/offer/queryCanBuyAttachSpec";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsJsonGet(url,{strParam:JSON.stringify(param)},{
				"before":function(){
					$.ecOverlay("<strong>正在查询附属销售品中,请稍候....</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					if (response.code==0) {
						if(response.data){
							callBackFun(response.data);
						}
					}else if (response.code==-2){
						$.alertM(response.data);
						return;
					}else {
						$.alert("提示","附属销售品查询失败,稍后重试");
						return;
					}
				}
			});	
		}else {
			$.ecOverlay("<strong>查询附属销售品中，请稍等...</strong>");
			var response = $.callServiceAsJsonGet(url,{strParam:JSON.stringify(param)});	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data;
				}
			}else if (response.code==-2){
				$.alertM(response.data);
				return;
			}else {
				$.alert("提示","查询附属销售品失败,稍后重试");
				return;
			}
		}
	};
	
	// 查询默认必须可选包
	var _queryDefMustOfferSpec = function(param) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/app/offer/queryDefaultAndRequiredOfferSpec";
		$.ecOverlay("<strong>查询默认必须可选包中，请稍等...</strong>");
		var response = $.callServiceAsJsonGet(url,param);	
		$.unecOverlay();
		if (response.code==0) {
			if(response.data){
				return response.data;
			}
		}else if (response.code==-2){
			OrderInfo.isSuccess = "N";
			$.alertM(response.data);
			return;
		}else {
			OrderInfo.isSuccess = "N";
			$.alert("提示","可订购功能产品失败,稍后重试");
			return;
		}
	};
	// 查询默认必须可选包 + 功能产品 (补换卡加可选包)
	var _queryDefMustOfferSpecAndServ = function(param) {
		addParam(param);  //添加基本参数
		var url = contextPath+"//app/offer/queryDefaultAndRequiredOfferSpecAndServ";
		$.ecOverlay("<strong>查询默认必须可选包和功能产品中，请稍等...</strong>");
		var response = $.callServiceAsJsonGet(url,param);	
		$.unecOverlay();
		if (response.code==0) {
			OrderInfo.isSuccess = "Y";
			if(response.data){
				return response.data;
			}
		}else if (response.code==-2){
			$.alertM(response.data);
			return;
		}else {
			$.alert("提示","可订购可选包和功能产品失败,稍后重试");
			return;
		}
	};
	
	// 查询功能产品规格,(默认1，必须2，可订购3)
	var _queryServSpec = function(param) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/app/offer/queryServSpec";
		$.ecOverlay("<strong>查询可订购功能产品中，请稍等...</strong>");
		var response = $.callServiceAsJsonGet(url,param);	
		$.unecOverlay();
		if (response.code==0) {
			if(response.data){
				return response.data;
			}
		}else if (response.code==-2){
			$.alertM(response.data);
			return;
		}else {
			$.alert("提示","可订购功能产品失败,稍后重试");
			return;
		}
	};
	
	// 查询功能产品规格,(默认1，必须2，可订购3)[W]
	var _queryServSpecPost = function(param) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/offer/queryServSpecPost";
		$.ecOverlay("<strong>查询可订购功能产品中，请稍等...</strong>");
		var response = $.callServiceAsJson(url,param);	
		$.unecOverlay();
		if (response.code==0) {
			if(response.data){
				return response.data;
			}
		}else if (response.code==-2){
			$.alertM(response.data);
			return;
		}else {
			$.alert("提示","可订购功能产品失败,稍后重试");
			return;
		}
	};
	
	//销售品互斥依赖查询
	var _queryExcludeDepend = function(param){
		addParam(param);  //添加基本参数
		var url = contextPath+"/app/offer/queryExcludeDepend";
		$.ecOverlay("<strong>规则校验中,请稍等...</strong>");
		var response = $.callServiceAsJsonGet(url,{strParam:JSON.stringify(param)});
		$.unecOverlay();
		if(response.code == 0){
			return response.data;
		}else if(response.code == -2){
			$.alertM(response.data);
		}else{
			$.alert("提示","数据查询异常，请稍后重试！");
		}
	};
		
	//功能产品互斥依赖查询
	var _queryServExcludeDepend = function(param){
		addParam(param);  //添加基本参数
		var url = contextPath+"/app/offer/queryServExcludeDepend";
		$.ecOverlay("<strong>规则校验中,请稍等...</strong>");
		var response = $.callServiceAsJsonGet(url,{strParam:JSON.stringify(param)});
		$.unecOverlay();
		if(response.code == 0){
			return response.data;
		}else if(response.code == -2){
			$.alertM(response.data);
		}else{
			$.alert("提示","数据查询异常，请稍后重试！");
		}
	};
	
	//查询附属销售品规格
	var _searchAttachOfferSpec = function(param,callBackFunc) {
		
		addParam(param);  //添加基本参数
		var url = contextPath+"/app/offer/searchAttachOfferSpec";
		if(typeof(callBackFunc)=="function"){
			$.callServiceAsHtmlGet(url,{strParam:encodeURI(JSON.stringify(param),"utf-8")},{
				"before":function(){
					$.ecOverlay("附属销售品查询中，请稍等...");
				},
				"done" : function(response){
					$.unecOverlay();
					if(response.code == 0){
						callBackFunc(response.data);
					}else if(response.code == -2){
						$.alertM(response.data);
					}else{
						$.alert("提示","查询附属销售失败，请稍后重试！");
					}
				},fail:function(response){
					$.unecOverlay();
					$.alert("提示","查询附属销售失败，请稍后重试！");
				}
			});
		}else{
			$.ecOverlay("<strong>附属销售品查询中，请稍等...</strong>");
			var response = $.callServiceAsHtmlGet(url,{strParam:encodeURI(JSON.stringify(param),"utf-8")});
			$.unecOverlay();
			if(response.code == 0){
				return response.data;
			}else if(response.code == -2){
				$.alertM(response.data);
			}else{
				$.alert("提示","查询附属销售失败，请稍后重试！");
			}
		}
	};
	
	//受理权限查询
	var _checkOperate = function(param) {
		var url = contextPath+"//app/order/checkOperate";
		$.ecOverlay("<strong>受理权限查询中，请稍等...</strong>");
		var response = $.callServiceAsJsonGet(url,"");
		$.unecOverlay();
		if(response.code == 0){
			return response.data;
		}else if(response.code == -2){
			$.alertM(response.data);
		}else{
			$.alert("提示","受理权限查询失败，请稍后重试！");
		}
	};
	
	//订单提交
	var _orderSubmit = function(param) {
		var url = contextPath+"/app/order/orderSubmit";
		if(OrderInfo.order.token!=""){
			url = contextPath+"/app/order/orderSubmit?token="+OrderInfo.order.token;
		}
		$.ecOverlay("<strong>订单提交中，请稍等...</strong>");
		var response = $.callServiceAsHtml(url,param);
		$.unecOverlay();
		if(!response || response.code != 0){
			 return;
		}
		return response.data;
	};
	
	//订单提交（一次性）
	var _orderSubmitComplete = function(param) {
		var url = contextPath+"/app/order/orderSubmitComplete";
		if(OrderInfo.order.token!=""){
			url = contextPath+"/app/order/orderSubmitComplete?token="+OrderInfo.order.token;
		}
		$.ecOverlay("<strong>订单提交中，请稍等...</strong>");
		var response = $.callServiceAsJson(url,param);
		$.unecOverlay();
		if(!response || response.code != 0){
			 return;
		}
		return response.data;
	};	
	
	/**
	 * 查询主销售品规格构成
	 * 并对结果进行数据校验
	 */
	var _queryMainOfferSpec = function(param){
		var offerSpec = query.offer.queryOfferSpec(param); //查询主销售品构成
		if(offerSpec ==undefined){
			return false;
		}
		if( offerSpec.offerRoles ==undefined){
			$.alert("错误提示","销售品规格构成查询: 返回的销售品规格构成结构不对！");
			return false;
		}
		if(offerSpec.offerSpecId==undefined || offerSpec.offerSpecId==""){
			$.alert("错误提示","销售品规格构成查询: 销售品规格ID未返回，无法继续受理！");
			return false;
		}
		if(offerSpec.offerRoles.length == 0){
			$.alert("错误提示","销售品规格构成查询: 成员角色为空，无法继续受理！");
			return false;
		}
		if(offerSpec.feeType ==undefined || offerSpec.feeType=="" || offerSpec.feeType=="null"){
			$.alert("错误提示","无付费类型，无法新装！");
			return false;
		}
		offerSpec = SoOrder.sortOfferSpec(offerSpec); //排序主副卡套餐	
		if((OrderInfo.actionFlag==6||OrderInfo.actionFlag==2 || OrderInfo.actionFlag==1) && ec.util.isArray(OrderInfo.oldprodInstInfos)){//主副卡纳入老用户
			OrderInfo.oldofferSpec.push({"offerSpec":offerSpec,"accNbr":param.accNbr});
		}else{
			OrderInfo.offerSpec = offerSpec;
		}
		return offerSpec;
	};
	
	/**
	 * 同步查询销售品规格构成
	 * 并对结果进行数据校验
	 */
	var _queryAttachOfferSpec = function(prodId,offerSpecId){
		var param = {
			offerSpecId:offerSpecId,
			partyId : OrderInfo.cust.custId,
			offerTypeCd:2	
		};	
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==2 || OrderInfo.actionFlag==6 || OrderInfo.actionFlag==14){//新装业务,添加主套餐id用于查询终端
			param.mainOfferSpecId = OrderInfo.offerSpec.offerSpecId;
		}
		if(OrderInfo.actionFlag==3){//可选包
			param.mainOfferSpecId = order.prodModify.choosedProdInfo.prodOfferId;
		}
		if(OrderInfo.actionFlag==21){//副卡换挡
			if(ec.util.isArray(OrderInfo.viceOfferSpec)){
				$.each(OrderInfo.viceOfferSpec,function(){
					if(this.prodId==prodId){
						param.mainOfferSpecId=this.offerSpecId;
						return false;
					}
				});
			}
		}
		var offerSpec = query.offer.queryOfferSpec(param); //查询主销售品构成
		if(offerSpec ==undefined || offerSpec.offerRoles ==undefined){
			$.alert("提示","返回的销售品规格构成结构不对！");
			return false;
		}
		if(offerSpec.offerSpecId==undefined || offerSpec.offerSpecId==""){
			$.alert("提示","销售品规格ID未返回，继续受理将出现异常！");
			return false;
		}
		if(offerSpec.offerSpecName==undefined || offerSpec.offerSpecName==""){
			$.alert("提示","销售品规格名称未返回，继续受理将出现异常！");
			return false;
		}
		var offerRoles = []; //过滤角色
		var prodSpecId = OrderInfo.getProdSpecId(prodId);
		var flag = false;
		if(ec.util.isArray(offerSpec.extAttrParams) && offerSpec.extAttrParams[0].attrId=="800000041"){
			return offerSpec;
		}else{
			$.each(offerSpec.offerRoles,function(){
				$.each(this.roleObjs,function(){
					if(this.objId==prodSpecId){
						flag = true;
						return false;
					}
				});
				if(flag){
					offerRoles.push(this);
					return false;
				}
			});
		}
		offerSpec.offerRoles = offerRoles;
		return offerSpec;
	};
	
	//预校验
	var _updateCheckByChange = function(param){
		var url = contextPath+"/token/pc/order/prodModify/updateCheckByChange";
		$.ecOverlay("<strong>正在预校验中，请稍等...</strong>");
		var response = $.callServiceAsJson(url,param);
		$.unecOverlay();
		if (response.code == 0) {
			return response.data;
		}else if (response.code == -2) {
			$.alertM(response.data);
		}else{
		    if (response.data.resultMsg) {
		        $.alert("提示","预校验失败!失败原因为："+response.data.resultMsg);
		    } else {
		        $.alert("提示","预校验失败! 集团营业后台未给出原因。");
		    }
		}
	};
	
	/**
	 * 加载实例
	 * 如果传入了paramInfo，则使用它，否则拼入参
	 */
	var _loadInst = function(){
		if(OrderInfo.order.soNbr==null || OrderInfo.order.soNbr==undefined || OrderInfo.order.soNbr==""){
			OrderInfo.order.soNbr = UUID.getDataId();
		}
		if(CONST.getAppDesc()!=0){ //不是4g不需要加载
			return true;
		}
		
		if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 14 || OrderInfo.actionFlag==13 || OrderInfo.actionFlag==17 || OrderInfo.actionFlag==18){ //新装不要加载实例
			return true;
		}
		
		if (order.prodModify == undefined) { // 如果没有引入orderProdModify.js
			$.alert("提示","未获取到产品相关信息，无法办理二次业务！");
			return false;
		}
		
		var prod = order.prodModify.choosedProdInfo;
		
		if(prod==undefined || prod.prodInstId ==undefined){
			$.alert("提示","未获取到产品相关信息，无法办理二次业务！");
			return false;
		}
		
		var param = {
			areaId : OrderInfo.getProdAreaId(prod.prodInstId),
			acctNbr : prod.accNbr,
			custId : OrderInfo.cust.custId,
			soNbr : OrderInfo.order.soNbr,
			instId : prod.prodInstId,
			type : "2",
			queryType: "1,2,3,4,5",
			acctNbr : "",
			data:[]
		};
		
		var queryMergeFlag=OrderInfo.provinceInfo.mergeFlag;
		
		if(ec.util.isArray(OrderInfo.offer.offerMemberInfos)){ //遍历主销售品构成
			var flag = true;
			$.each(OrderInfo.offer.offerMemberInfos,function(){
				if(this.objType == CONST.OBJ_TYPE.PROD && this.accessNumber==prod.accNbr){ //选中号码在销售品实例构成中，为了防止销售品实例缓存
					flag = false;
					return false;
				}
			});
			
			if(flag){ //不在销售品实例缓存
				if(queryMergeFlag!=null && queryMergeFlag!="" && queryMergeFlag!="undefined" && queryMergeFlag=="1"){
					param.data.push({accessNbr:prod.accNbr,instId:prod.prodInstId});
					return _invokeLoadInstSub(param);
				}else{
					return query.offer.invokeLoadInst(param);
				}
			}else{
				var vFlag = true;
				
				//1调用新接口，如果是0，就是按照旧的方式调用
				if(queryMergeFlag!=null && queryMergeFlag!="" && queryMergeFlag!="undefined" && queryMergeFlag=="1"){
					$.each(OrderInfo.offer.offerMemberInfos,function(){
						if(this.objType == CONST.OBJ_TYPE.PROD){
							param.data.push({accessNbr:this.accessNumber,instId:this.objInstId});
						}
					});
					
					if(param!=null){
						if (!_invokeLoadInstSub(param)) {
							vFlag = false;
							return false;
						}
					}
				}else{
					//按旧的方式调用
					$.each(OrderInfo.offer.offerMemberInfos,function(){
						if(this.objType == CONST.OBJ_TYPE.PROD){
							param.acctNbr = this.accessNumber;
							param.instId = this.objInstId;
							if (!query.offer.invokeLoadInst(param)) {
								vFlag = false;
								return false;
							}
						}
					});
				}
				
				return vFlag;
			}
		}else{
			if(queryMergeFlag!=null && queryMergeFlag!="" && queryMergeFlag!="undefined" && queryMergeFlag=="1"){
				param.data.push({accessNbr:prod.accNbr,instId:prod.prodInstId});
				return _invokeLoadInstSub(param);
			}else{
				return query.offer.invokeLoadInst(param);
			}
		}
	};
	
	var _invokeLoadInstSub = function(param) {
		//order.prepare.createorderlonger();
		var url = contextPath+"/token/app/offer/loadInstNew";
		$.ecOverlay("<strong>全量信息加载中，请稍等...</strong>");
		var response = $.callServiceAsJson(url,JSON.stringify(param));
		$.unecOverlay();
		if (response.code== 0) {
			return true;
		}else if(response.code==-2){
			$.alertM(response.data);
			return false;
		}else {
			if (response.msg == undefined) {
				$.alert("提示", "全量信息查询失败");
			} else {				
				$.alert("提示",response.msg);
			}
			return false;
		}
	};
	
	//补充查询基本条件
	var addParam = function(param){
		//param.staffId = '1762126';
		param.staffId = OrderInfo.staff.staffId;
		//param.channelId = '1388783';
		param.channelId	= OrderInfo.staff.channelId;
		
		//param.areaId = '8320102';
		param.areaId = OrderInfo.getProdAreaId(param.prodId);
		param.partyId = OrderInfo.cust.custId;
		if(OrderInfo.actionFlag == 3){
			param.mainOfferSpecId=order.prodModify.choosedProdInfo.prodOfferId;
		}else if(OrderInfo.actionFlag==21){
			if(ec.util.isArray(OrderInfo.viceOfferSpec)){
				$.each(OrderInfo.viceOfferSpec,function(){
					if(this.prodId==param.prodId){
						param.mainOfferSpecId=this.offerSpecId;
						return false;
					}
				});
			}
		}else{
			param.mainOfferSpecId=OrderInfo.offerSpec.offerSpecId;
		}
		if(ec.util.isObj(OrderInfo.order.soNbr)){  //缓存流水号
			param.soNbr = OrderInfo.order.soNbr;
		}
		else{
			param.soNbr = UUID.getDataId();
			OrderInfo.order.soNbr = UUID.getDataId();
		}
		if(order.ysl!=undefined){
			if(order.ysl.yslbean.yslflag!=undefined){
//				param.yslflag = order.ysl.yslbean.yslflag;
			}
		}
		if(ec.util.isArray(OrderInfo.oldprodInstInfos)){//主副卡纳入老用户
			for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
				if(param.acctNbr==OrderInfo.oldprodInstInfos[i].accNbr){
					param.areaId = OrderInfo.oldprodInstInfos[i].areaId;
					param.partyId = OrderInfo.oldprodInstInfos[i].custId;
					param.mainOfferSpecId=OrderInfo.oldprodInstInfos[i].mainProdOfferInstInfos[0].prodOfferId;
				}
			}
		}
	};
	
	var _invokeLoadInst = function(param) {
//		order.prepare.createorderlonger();
		var url = contextPath+"/app/offer/loadInst";
		$.ecOverlay("<strong>全量信息加载中，请稍等...</strong>");
		var response = $.callServiceAsJsonGet(url,param);
		$.unecOverlay();
		if (response.code== 0) {
			return true;
		}else if(response.code==-2){
			$.alertM(response.data);
			return false;
		}else {
			if (response.msg == undefined) {
				$.alert("提示", "全量信息查询失败");
			} else {				
				$.alert("提示",response.msg);
			}
			return false;
		}
	};
	
	/**
	 * 产品信息查询
	 */
	var _queryProduct = function(param) {
		var url = contextPath+"/app/cust/offerorderprod";
		$.ecOverlay("<strong>查询产品信息中，请稍等...</strong>");
		var response = $.callServiceAsJson(url,param);	
		$.unecOverlay();
		if (response.code==0) {
			if(response.data){
				return response.data;
			}
		}else {
			$.alert("提示","查询附属销售品失败,稍后重试");
			return;
		}
	};
	
	/**
	 * 查询产品实例属性
	 * param : {
	 * prodId : "", //产品实例id
	 * acctNbr : "", //接入号
	 * prodSpecId : "", //产品规格id
	 * areaId : "" //地区id
	 * }
	 */
	var _queryProdInstParam = function(param) {
		var url = contextPath+"/app/order/prodInstParam";
		$.ecOverlay("<strong>查询产品实例属性中，请稍等...</strong>");
		var response = $.callServiceAsJson(url,param);	
		$.unecOverlay();
		if (response.code==0) {
			if(response.data){
				return response.data;
			}
		}else {
			$.alert("提示","查询附属销售品失败,稍后重试");
			return;
		}
	};
	
	return {
		checkOperate			: _checkOperate,
		loadInst				: _loadInst,
		invokeLoadInst			: _invokeLoadInst,
		setOffer				: _setOffer,
		searchAttachOfferSpec	: _searchAttachOfferSpec,
		queryOfferSpec			: _queryOfferSpec,
		queryServSpec			: _queryServSpec,
		queryOfferInst 			: _queryOfferInst,
		queryOfferParam 		: _queryOfferParam,
		queryAttachOfferHtml	: _queryAttachOfferHtml,
		queryChangeAttachOffer  : _queryChangeAttachOffer,
		queryCanBuyAttachSpec 	: _queryCanBuyAttachSpec,
		queryExcludeDepend		: _queryExcludeDepend,
		queryServExcludeDepend	: _queryServExcludeDepend,
		queryAttachSpec			: _queryAttachSpec,
		queryMainOfferSpec		: _queryMainOfferSpec,
		queryAttachOfferSpec	: _queryAttachOfferSpec,
		queryDefMustOfferSpec	: _queryDefMustOfferSpec,
		queryDefMustOfferSpecAndServ : _queryDefMustOfferSpecAndServ,
		orderSubmit				: _orderSubmit,
		orderSubmitComplete		: _orderSubmitComplete,
		updateCheckByChange		: _updateCheckByChange,
		queryProduct			: _queryProduct,
		queryOpenedAttachAndServ: _queryOpenedAttachAndServ,
		queryProdInstParam		: _queryProdInstParam,
		queryChangeAttachOfferSub:_queryChangeAttachOfferSub,
		invokeLoadInstSub		:_invokeLoadInstSub,
		queryServSpecPost:_queryServSpecPost
	};
})();
/**
 * 销售品变更
 * 
 * @author wukf
 * date 2013-9-22
 */
CommonUtils.regNamespace("offerChange");

offerChange = (function() {
	var num=0;
	var _newAddList = [];
	var _newMemberFlag = false;
	var _oldMemberFlag = false;
	var maxNum = 0;
	//初始化套餐变更页面
	var _init = function (){
		OrderInfo.order.step=1;
		OrderInfo.busitypeflag=2;
		OrderInfo.actionFlag = 2;
		if(!query.offer.setOffer()){ //必须先保存销售品实例构成，加载实例到缓存要使用
			return ;
		}
		//获取初始化查询的条件
		order.service.queryApConfig();
		//初始化主套餐查询
		order.service.searchPack();
	};
		
	//套餐变更页面显示
	var str = "";
	var _offerChangeView=function(){
		_newAddList = [];
		offerChange.newMemberFlag = false;
		offerChange.oldMemberFlag = false;
		var oldLen = 0 ;
		$.each(OrderInfo.offer.offerMemberInfos,function(){
			if(this.objType==2){
				oldLen++;
			}
		});
		var memberNum = 1; //判断是否多成员 1 单成员2多成员
		var viceNum = 0;
		var num=0;
		if(oldLen>1){ //多成员角色，目前只支持主副卡
			memberNum = 2;
		}
		//把旧套餐的产品自动匹配到新套餐中
		if(!_setChangeOfferSpec(memberNum,viceNum)){  
			return;
		};
		//4g系统需要
		if(CONST.getAppDesc()==0){ 
			//老套餐是3G，新套餐是4G
			if(order.prodModify.choosedProdInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){
				if(!offerChange.checkOrder()){ //省内校验单
					return;
				}
			}
			//根据UIM类型，设置产品是3G还是4G，并且保存旧卡
			if(!prod.uim.setProdUim()){ 
				return ;
			}
		}
		if(OrderInfo.actionFlag == 2){ //套餐变更	
			var newSubPhoneNumsize=[];
			var oldSubPhoneNumsize=[];
			if(order.memberChange.newSubPhoneNum!=""){
				newSubPhoneNumsize = order.memberChange.newSubPhoneNum.split(",");
			}
			if(order.memberChange.oldSubPhoneNum!=""){
				oldSubPhoneNumsize = order.memberChange.oldSubPhoneNum.split(",");
			}
			var max = 0;
			str = "";
			$("#div_content").empty();
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				if(this.memberRoleCd=="401"){
					var offerRole = this;
					$.each(this.roleObjs,function(){
						var objInstId = offerRole.offerRoleId+"_"+this.objId;//角色id+产品规格id
						if(this.objType == CONST.OBJ_TYPE.PROD){
							_newAddList.push(objInstId);
							if(offerRole.minQty == 0){ //加装角色
								this.minQty = 0;
								this.dfQty = 0;
							}
							var membernum = 0;
							$.each(OrderInfo.offer.offerMemberInfos,function(){
								if(this.roleCd=="401"){
									membernum++;
								}
							})
							max = this.maxQty<0?"不限制":this.maxQty-membernum;
							if(max<0){
								max = 0;
							}
							maxNum = max;
							str+="<div class='form-group' id='memberTable'>"
								+"<label for='"+objInstId+"'>副卡数量:"+this.minQty+"-"+max+"(张)</label>"
								+"<div class='input-group input-group-lg'>"
								+"<label>"+this.objName+"</label>"
								+"<span class='input-group-btn'>"
								+"<button class='btn btn-default' type='button' onclick=order.service.subNum('"+objInstId+"',"+this.minQty+")> - </button>"
								+"</span>"
								+"<input type='text' style='margin-top:10px;' readonly='readonly' class='form-control' id='"+objInstId+"' value='"+newSubPhoneNumsize.length+"'>"
								+"<span class='input-group-btn'>"
								+"<button class='btn btn-default' type='button' onclick=order.service.addNum('"+objInstId+"',"+max+",'"+offerRole.parentOfferRoleId+"')> + </button>"
								+"</span> </div>"
								if(max>0){
									if(oldSubPhoneNumsize.length==0){
										str+="<div class='input-group input-group-lg'>"
											+"<label style='width:170px;'>已有移动电话</label>"
											+"<span class='input-group-btn' style='width:40px'>"
											+"</span>"
											+"<input type='text' style='margin-top:10px;' class='form-control' name='oldphonenum' value=''>"
											+"<span class='input-group-btn'>"
											+"<button class='btn btn-default' type='button' onclick='offerChange.addNum("+max+",\"\")';> + </button>"
											+"</span> </div>"
									}else{
										for(var k=0;k<oldSubPhoneNumsize.length;k++){
											if(k==0){
												str+="<div class='input-group input-group-lg'>"
													+"<label style='width:170px;'>已有移动电话</label>"
													+"<span class='input-group-btn' style='width:40px'>"
													+"</span>"
													+"<input type='text' style='margin-top:10px;' class='form-control' name='oldphonenum' value='"+oldSubPhoneNumsize[k]+"'>"
													+"<span class='input-group-btn'>"
													+"<button class='btn btn-default' type='button' onclick='offerChange.addNum("+max+",\"\")';> + </button>"
													+"</span> </div>"
											}else{
												offerChange.addNum(max,oldSubPhoneNumsize[k]);
											}
										}
									}
								}
							str+="</div>";
						}
					});
				}
			});
			$("#div_content").append(str);
//			$("#vice_modal").modal("show");
			$("#vice_modal").removeClass("modal fade").addClass("modal show");
			$("#btn_modal").off("click").on("click",function(){
				offerChangeConfirm();
			});
		}
//		offerChangeConfirm();
	};
	
	var idnum = 1;
	var _addNum = function(max,addnum){
		var lis = $("input[name='oldphonenum']");
		lis = lis.length+1;
		if(lis>max){
			return;
		}
		idnum++;
		if(addnum==""){
			var sstr = "<div class='input-group input-group-lg' id='oldnum_"+idnum+"'>"
			+"<label style='width:170px;'>已有移动电话</label>"
			+"<span class='input-group-btn' style='width:40px'>"
			+"</span>"
			+"<input type='text' style='margin-top:10px;' class='form-control' name='oldphonenum' value='"+addnum+"'>"
			+"<span class='input-group-btn'>"
			+"<button class='btn btn-default' type='button' onclick=order.memberChange.delNum(\"oldnum_"+idnum+"\")> - </button>"
			+"</span> </div>"
			$("#memberTable").append(sstr);
		}
		str += "<div class='input-group input-group-lg' id='oldnum_"+idnum+"'>"
			+"<label style='width:170px;'>已有移动电话</label>"
			+"<span class='input-group-btn' style='width:40px'>"
			+"</span>"
			+"<input type='text' style='margin-top:10px;' class='form-control' name='oldphonenum' value='"+addnum+"'>"
			+"<span class='input-group-btn'>"
			+"<button class='btn btn-default' type='button' onclick=order.memberChange.delNum(\"oldnum_"+idnum+"\")> - </button>"
			+"</span> </div>"
//		$("#memberTable").append(str);
	};
	
	function offerChangeConfirm(){
		OrderInfo.oldprodInstInfos = [];
		OrderInfo.oldofferSpec = [];
		OrderInfo.oldoffer = [];
		OrderInfo.oldAddNumList = [];
		var newnum = 0;
		var oldnum = 0;
		order.memberChange.viceCartNum = 0;
		var delprodInsts = [];
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			if(this.memberRoleCd=="401"){
				if(this.prodInsts!=undefined){
					var oldprodInsts = this.prodInsts;
					for(var i=0;i<this.prodInsts.length;i++){
						var prodInstId = '"'+this.prodInsts[i].prodInstId+'"';
						if(prodInstId.indexOf("-")!=-1){
							delprodInsts.push(this.prodInsts[i]);
						}
					}
					$.each(delprodInsts,function(){
						var delprodInstId = this.prodInstId;
						$.each(oldprodInsts,function(j){
							if(this.prodInstId = delprodInstId){
								oldprodInsts.splice(j,1);
							}
						});
					});
				}
			}
		});
		$.each(_newAddList,function(){
			newnum=newnum+Number($("#"+this).val());
		});
		$("input[name='oldphonenum']").each(function(){
			var num = $.trim($(this).val());
			if(ec.util.isObj(num)){
				oldnum++;
			}
		});
		if(newnum>0){
			offerChange.newMemberFlag = true;
			order.service.setOfferSpec();
		}
		if(oldnum>0){
			offerChange.oldMemberFlag = true;
			if(!order.memberChange.queryofferinfo()){
				return;
			}
		}
		if(parseInt(newnum)+parseInt(order.memberChange.viceCartNum)>maxNum){
			$.alert("提示","加装数量已经超过能加装的最大数量【"+maxNum+"】!");
			return;
		}
		//初始化填单页面
		var prodInfo = order.prodModify.choosedProdInfo;
		var param = {
			boActionTypeCd : "S2" ,
			boActionTypeName : "套餐变更",
			actionFlag :"2",
			offerSpec : OrderInfo.offerSpec,
			prodId : prodInfo.prodInstId,
			offerMembers : OrderInfo.offer.offerMemberInfos,
			oldOfferSpecName : prodInfo.prodOfferName,
			prodClass : prodInfo.prodClass,
			appDesc : CONST.getAppDesc(),
			areaId : order.prodModify.choosedProdInfo.areaId,
			newnum : parseInt(newnum),
			oldnum : parseInt(oldnum),
			feeTypeMain:prodInfo.feeType
		};
		if(oldnum>0){
			param.oldprodInstInfos = OrderInfo.oldprodInstInfos;
			param.oldofferSpec = OrderInfo.oldofferSpec;
			param.oldoffer = OrderInfo.oldoffer;
		}
		order.main.buildMainView(param);
		//$("#vice_modal").modal("hide");
		$("#vice_modal").removeClass("modal show").addClass("modal fade");
	}
	
	//填充套餐变更页面
	var _fillOfferChange = function(response, param) {
		SoOrder.initFillPage(); //并且初始化订单数据
		$("#order_prepare").hide();
		$("#order").html(response.data).show();
//		_initOfferLabel();//初始化主副卡标签
		
		//套餐变更进入下一步
		$("#fillNextStep").off("click").on("click",function(){
			if(!SoOrder.checkData()){ //校验通过
				return false;
			}
			$("#order-content").hide();
			$("#order-dealer").show();
			order.dealer.initDealer();
			
			//放入需要查询的工号数据[W]
			var DevelopmentCode= OrderInfo.codeInfos.DevelopmentCode;
			var reloadFlag= OrderInfo.provinceInfo.reloadFlag;
			if(DevelopmentCode!=null && DevelopmentCode!="" && DevelopmentCode!="null" && reloadFlag=="Y" && (OrderInfo.actionFlag==1 || OrderInfo.actionFlag==2)){
				//查询工号数据
				$("#staffCode").val(DevelopmentCode);
				order.dealer.queryStaff(0,'dealer',OrderInfo.codeInfos.developmentObjId);
			}
		});
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
		$("#attach-modal").modal('show');
		//遍历主销售品构成
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			var offerRole = this;
			if(ec.util.isArray(this.prodInsts)){
				$.each(this.prodInsts,function(){
					var _prodInstId = "'"+this.prodInstId+"'";
					if(_prodInstId.indexOf("-") == -1){
						var prodId = this.prodInstId;
						var param = {
							areaId : OrderInfo.getProdAreaId(prodId),
							channelId : OrderInfo.staff.channelId,
							staffId : OrderInfo.staff.staffId,
						    prodId : prodId,
						    prodSpecId : this.objId,
						    offerSpecId : prodInfo.prodOfferId,
						    offerRoleId : this.offerRoleId,
						    acctNbr : this.accessNumber
						};
						//现在号码
						var nowPhoneNum=this.accessNumber;
						var res = query.offer.queryChangeAttachOffer(param);
						$("#attach_"+prodId).html(res);	
						//如果objId，objType，objType不为空才可以查询默认必须
						if(ec.util.isObj(this.objId)&&ec.util.isObj(this.objType)&&ec.util.isObj(this.offerRoleId)){
							param.queryType = "1,2";
							param.objId = this.objId;
							param.objType = this.objType;
							param.memberRoleCd = this.roleCd;
							param.offerSpecId=OrderInfo.offerSpec.offerSpecId;
							//默认必须可选包
							var data = query.offer.queryDefMustOfferSpec(param);
							CacheData.parseOffer(data,prodId);
							//默认必须功能产品
							param.queryType = "1";//只查询必选，不查默认
							var data = query.offer.queryServSpec(param);
							CacheData.parseServ(data,prodId);
						}
						/*if(CONST.getAppDesc()==0 && prodInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){	//预校验
						}else{	
						}*/
						AttachOffer.showMainRoleProd(prodId); //显示新套餐构成
	//					AttachOffer.changeLabel(prodId,this.objId,""); //初始化第一个标签附属
						
						//根据已选功能产品查询带出的可选包
						var servSpecIds = [];
						if(AttachOffer.openServList!=null&&AttachOffer.openServList!=undefined){
							$.each(AttachOffer.openServList,function(){
								if(this.prodId == param.prodId){
									var servSpecList = this.servSpecList;
									if(servSpecList!=null&&servSpecList!=undefined){
										$.each(servSpecList,function(){
											if(this.servSpecId!=null&&this.servSpecId!=undefined){
												servSpecIds.push(this.servSpecId);
											}
										});
									}
								}
							});					
						}
						
						if(servSpecIds.length>0){
							param.queryType = "1,2";//查询必选，默认
							param.servSpecIds = servSpecIds;
							var queryData = query.offer.queryServSpecPost(param);
							if(queryData!=null&&queryData.resultCode==0){
								if(queryData.result.offerList!=null&&queryData.result.offerList!=undefined){
									$.each(queryData.result.offerList,function(){
										AttachOffer.addOpenList(param.prodId,this.offerSpecId); 
									});
								}					
							}	
						}
						
						//AttachOffer.changeLabel(prodId,this.objId,""); //初始化第一个标签附属
						
						if(AttachOffer.isChangeUim(prodId)){ //需要补换卡
							//uim卡校验
							if(OrderInfo.mktResInstCode!=undefined && OrderInfo.mktResInstCode!=null && OrderInfo.mktResInstCode!="" && OrderInfo.mktResInstCode!="null"){
								var array=OrderInfo.mktResInstCode.split(",");
								if(array!=null && array.length>0){
									//首先进行UIM是否重复判断
									var checkPhone="";
									var checkUim="";
									var checkCode="0";
									for(var i=0;i<array.length;i++){
										var numAndUim=array[i].split("_");
										if(numAndUim!=null && numAndUim.length==2){
											var thisPhone=numAndUim[0];
											var thisUim=numAndUim[1]
											if(checkPhone!=null && checkPhone!=""){
												if(checkPhone==thisPhone || checkUim==thisUim){
													checkCode="1";
													break;
												}
											}else{
												checkPhone=thisPhone;
												checkUim=thisUim;
											}
										}
									}
									
									if(checkCode=="1"){
										$.alert("提示","传入的UIM参数中存在重复数据,参数为["+OrderInfo.mktResInstCode+"]");
									}else{
										//没有重复的数据再进行匹配
										var nowUim="";
										for(var i=0;i<array.length;i++){
											var numAndUim=array[i].split("_");
											if(numAndUim!=null && numAndUim.length==2){
												var phoneCode=numAndUim[0];
												var uimCode=numAndUim[1];
												
												if(phoneCode==nowPhoneNum){
													nowUim=uimCode;
												}
											}
										}
										if(nowUim!=null && nowUim!="" && nowUim!="null"){
											cleckUim(nowUim,prodId);
											$("#uim_check_btn_"+prodId).hide();
											$("#uim_release_btn_"+prodId).hide();
										}
									}
								}
							}
							num++;
							$("#uimDiv_"+prodId).show();
						}
					}else{
						var prodInst = this;
						var param = {   
							offerSpecId : OrderInfo.offerSpec.offerSpecId,
							prodSpecId : prodInst.objId,
							offerRoleId: prodInst.offerRoleId,
							prodId : prodInst.prodInstId,
							queryType : "1,2",
							objType: prodInst.objType,
							objId: prodInst.objId,
							memberRoleCd : prodInst.memberRoleCd
						};
						AttachOffer.queryAttachOfferSpec(param);  //加载附属销售品
						var obj = {
							div_id : "item_order_"+prodInst.prodInstId,
							prodId : prodInst.prodInstId,
							offerSpecId : OrderInfo.offerSpec.offerSpecId,
							compProdSpecId : "",
							prodSpecId : prodInst.objId,
							roleCd : offerRole.roleCd,
							offerRoleId : offerRole.offerRoleId,
							partyId : OrderInfo.cust.custId
						};
						order.main.spec_parm(obj); //加载产品属性
					}
				});
			}
		});
		if(offerChange.oldMemberFlag){
			for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
				var prodInfo = OrderInfo.oldprodInstInfos[i]; //获取老用户产品信息
				$.each(OrderInfo.oldoffer,function(){
					if(this.accNbr == prodInfo.accNbr){
						var oldoffer = this;
						$.each(oldoffer.offerMemberInfos,function(){
							var member = this;
							if(member.objType==CONST.OBJ_TYPE.PROD){
								var prodId = this.objInstId;
								var param = {
										areaId : OrderInfo.getProdAreaId(prodId),
										channelId : OrderInfo.staff.channelId,
										staffId : OrderInfo.staff.staffId,
									    prodId : prodId,
									    prodSpecId : member.objId,
									    offerSpecId : prodInfo.mainProdOfferInstInfos[0].prodOfferId,
									    offerRoleId : "",
									    acctNbr : member.accessNumber,
									    partyId:prodInfo.custId,
									    distributorId:OrderInfo.staff.distributorId,
									    mainOfferSpecId:prodInfo.mainProdOfferInstInfos[0].prodOfferId,
									    soNbr:OrderInfo.order.soNbr
									};
								if(ec.util.isObj(prodInfo.prodBigClass)){
									param.prodBigClass = prodInfo.prodBigClass;
								}
								$.each(OrderInfo.oldofferSpec,function(){
									if(this.accNbr==prodInfo.accNbr){
										$.each(this.offerSpec.offerRoles,function(){
											if(this.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD || this.memberRoleCd==CONST.MEMBER_ROLE_CD.COMMON_MEMBER){
												param.offerRoleId = this.offerRoleId;
											}
										});
									}
								});
								var res = query.offer.queryChangeAttachOffer(param);
								$("#attach_"+prodId).html(res);	
								//如果objId，objType，objType不为空才可以查询默认必须
								if(ec.util.isObj(member.objId)&&ec.util.isObj(member.objType)&&ec.util.isObj(member.offerRoleId)){
									param.queryType = "1,2";
									param.objId = member.objId;
									param.objType = member.objType;
									param.memberRoleCd = "401";
									//默认必须可选包
									var data = query.offer.queryDefMustOfferSpec(param);
									CacheData.parseOffer(data,prodId);
									//默认必须功能产品
									var data = query.offer.queryServSpec(param);
									CacheData.parseServ(data,prodId);
								}
								if(ec.util.isArray(OrderInfo.oldofferSpec)){ //主套餐下的成员判断
									$.each(OrderInfo.oldofferSpec,function(){
										if(this.accNbr == prodInfo.accNbr){
											var offerRoles = this.offerSpec.offerRoles;
											$.each(offerRoles,function(){
												if(this.offerRoleId==member.offerRoleId && member.objType==CONST.OBJ_TYPE.PROD){
													var offerRole = this;
													$.each(this.roleObjs,function(){
														if(this.objType==CONST.OBJ_TYPE.SERV){
															var serv = CacheData.getServBySpecId(prodId,this.objId);//从已订购功能产品中找
															if(serv!=undefined){ //不在已经开跟已经选里面
																var $oldLi = $('#li_'+prodId+'_'+serv.servId);
//																if(this.minQty==1){
//																	$oldLi.append('<dd class="mustchoose"></dd>');
//																}
//																$oldLi.append('<dd id="jue_'+prodId+'_'+serv.servId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
															}
														}
													});
													return false;
												}
											});
										}
									});
								}
//								AttachOffer.changeLabel(prodId,prodInfo.productId,"");
							}
						});
					}
				});
				var oldoffer = {};
				if(ec.util.isArray(OrderInfo.oldoffer)){ //主套餐下的成员判断
				    $.each(OrderInfo.oldoffer,function(){
				    	if(this.accNbr == prodInfo.accNbr){
				    		oldoffer = this;
				    	}
				    });
				}
				//老用户加入副卡需要预校验,主卡是4G，加入的老用户为3G
				if(order.prodModify.choosedProdInfo.is3G== "N" && prodInfo.mainProdOfferInstInfos[0].is3G =="Y"){
					if(!order.memberChange.checkOrder(prodInfo,oldoffer)){ //省内校验单
						return;
					}
					order.memberChange.checkOfferProd(oldoffer);
				}
				
			}
		}
//		order.dealer.initDealer(); //初始化发展人
		if(CONST.getAppDesc()==0 && order.prodModify.choosedProdInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){ //3G转4G需要校验
			offerChange.checkOfferProd();
		}
		order.main.initTounch();
		//新用户选号
		var nbrlist = [];
		var nbrflag = true;
		if(order.memberChange.newSubPhoneNum!="" && OrderInfo.provinceInfo.reloadFlag=="Y"){
			var newSubPhoneNumsize = order.memberChange.newSubPhoneNum.split(",");
			for(var n=0;n<newSubPhoneNumsize.length;n++){
				if(newSubPhoneNumsize[n]!=""&&newSubPhoneNumsize[n]!=null&&newSubPhoneNumsize[n]!="null"){
					$.each(nbrlist,function(){
						if(this==newSubPhoneNumsize[n]){
							nbrflag = false;
							return false;
						}else{
							nbrflag = true;
						}
					});
					if(nbrflag){
						nbrlist.push(newSubPhoneNumsize[n]);
						var param = {"phoneNum":newSubPhoneNumsize[n]};
						var data = order.phoneNumber.queryPhoneNumber(param);
						if(data.datamap.baseInfo){
							$("#nbr_btn_-"+(n+1)).val(newSubPhoneNumsize[n]);
							var boProdAns={
									prodId : "-"+(n+1), //从填单页面头部div获取
									accessNumber : data.datamap.baseInfo.phoneNumber, //接入号
									anChooseTypeCd : "2", //接入号选择方式,自动生成或手工配号，默认传2
									anId : data.datamap.baseInfo.phoneNumId, //接入号ID
									pnLevelId : data.datamap.baseInfo.phoneLevelId,
									anTypeCd : data.datamap.baseInfo.pnTypeId, //号码类型
									state : "ADD", //动作	,新装默认ADD	
									areaId : data.datamap.baseInfo.areaId,
									areaCode:data.datamap.baseInfo.zoneNumber,
									memberRoleCd:CONST.MEMBER_ROLE_CD.VICE_CARD,
									preStore:data.datamap.baseInfo.prePrice,
									minCharge:data.datamap.baseInfo.pnPrice
								};
							OrderInfo.boProdAns.push(boProdAns);
							order.dealer.changeAccNbr("-"+(n+1),newSubPhoneNumsize[n]);//选号玩要刷新发展人管理里面的号码
						}
					}else{
						$.alert("提示","号码"+newSubPhoneNumsize[n]+"重复输入");
					}
				}
			}
		}
		//新用户uim卡
		if(OrderInfo.mktResInstCode!=undefined && OrderInfo.mktResInstCode!=null && OrderInfo.mktResInstCode!="" && OrderInfo.mktResInstCode!="null" && OrderInfo.provinceInfo.reloadFlag=="Y"){
			nbrlist = [];
			nbrflag = true;
			var offerId = "-1";
//			offerId = order.prodModify.choosedProdInfo.prodOfferInstId;
//			$.each(OrderInfo.oldprodInstInfos,function(){
//				if(this.prodInstId==prodId){
//					offerId = this.mainProdOfferInstInfos[0].prodOfferInstId;
//				}
//			});
			var mktResInstCodesize = OrderInfo.mktResInstCode.split(",");
			for(var u=0;u<mktResInstCodesize.length;u++){
				if(mktResInstCodesize[u]!=""&&mktResInstCodesize[u]!=null&&mktResInstCodesize[u]!="null" && order.memberChange.newSubPhoneNum!=""){
					var nbrAndUimCode = mktResInstCodesize[u].split("_");
					var _accNbr = nbrAndUimCode[0];
					var _uimCode = nbrAndUimCode[1];
					var newSubPhoneNumsize = order.memberChange.newSubPhoneNum.split(",");
					var uimflag = false;
					$.each(nbrlist,function(){
						if(this==_accNbr){
							nbrflag = false;
							return false;
						}else{
							nbrflag = true;
						}
					});
					if(!nbrflag){
						$.alert("提示","UIM卡"+_uimCode+"对应的号码重复");
						return;
					}
					for(var n=0;n<newSubPhoneNumsize.length;n++){
						if(newSubPhoneNumsize[n]==_accNbr){
							nbrlist.push(newSubPhoneNumsize[n]);
							uimflag = true;
//							$("#uim_txt_-"+(n+1)).attr("disabled",true);
							var uimParam = {
									"instCode":_uimCode
							};
							var response = $.callServiceAsJsonGet(contextPath+"/token/pc/mktRes/qrymktResInstInfo",uimParam);
							if (response.code==0) {
								if(response.data.mktResBaseInfo){
									if(response.data.mktResBaseInfo.statusCd=="1102"){
										$("#uim_check_btn_-"+(n+1)).attr("disabled",true);
										$("#uim_release_btn_-"+(n+1)).attr("disabled",false);
										$("#uim_release_btn_-"+(n+1)).removeClass("disabled");
										$("#uim_txt_-"+(n+1)).attr("disabled",true);
										$("#uim_txt_-"+(n+1)).val(_uimCode);
										var coupon = {
												couponUsageTypeCd : "3", //物品使用类型
												inOutTypeId : "1",  //出入库类型
												inOutReasonId : 0, //出入库原因
												saleId : 1, //销售类型
												couponId : response.data.mktResBaseInfo.mktResId, //物品ID
												couponinfoStatusCd : "A", //物品处理状态
												chargeItemCd : "3000", //物品费用项类型
												couponNum : response.data.mktResBaseInfo.qty, //物品数量
												storeId : response.data.mktResBaseInfo.mktResStoreId, //仓库ID
												storeName : "1", //仓库名称
												agentId : 1, //供应商ID
												apCharge : 0, //物品价格
												couponInstanceNumber : _uimCode, //物品实例编码
												terminalCode :_uimCode,//前台内部使用的UIM卡号
												ruleId : "", //物品规则ID
												partyId : OrderInfo.cust.custId, //客户ID
												prodId :  -(n+1), //产品ID
												offerId : offerId, //销售品实例ID
												state : "ADD", //动作
												relaSeq : "" //关联序列	
											};
										OrderInfo.clearProdUim(-(n+1));
										OrderInfo.boProd2Tds.push(coupon);
									}else{
										$.alert("提示","UIM卡不是预占状态，当前为"+response.data.mktResBaseInfo.statusCd);
									}
								}else{
									$.alert("提示","查询不到UIM信息");
								}
							}else if (response.code==-2){
								$.alertM(response.data);
							}else {
								$.alert("提示","UIM信息查询接口出错,稍后重试");
							}
						}
//						else{
//							uimflag = false;
//						}
					}
					if(!uimflag){
						$.alert("提示","UIM卡"+_uimCode+"未匹配到接入号");
					}
				}
			}
		}
	};
	
	function cleckUim(uim,prodId){
		var uimParam = {"instCode":uim};
		var response = $.callServiceAsJsonGet(contextPath+"/token/pc/mktRes/qrymktResInstInfo",uimParam);
		if (response.code==0) {
			if(response.data.mktResBaseInfo){
				if(response.data.mktResBaseInfo.statusCd=="1102"){
				//	$("#uim_check_btn_-"+(n+1)).attr("disabled",true);
				//	$("#uim_check_btn_-"+(n+1)).removeClass("purchase").addClass("disablepurchase");
				//	$("#uim_release_btn_-"+(n+1)).attr("disabled",false);
				//	$("#uim_release_btn_-"+(n+1)).removeClass("disablepurchase").addClass("purchase");
					$("#uim_txt_"+prodId).val(uim);
					var coupon = {
							couponUsageTypeCd : "5", //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
							inOutTypeId : "1",  //出入库类型
							inOutReasonId : 0, //出入库原因
							saleId : 1, //销售类型
							couponId :response.data.mktResBaseInfo.mktResId, //物品ID
							couponinfoStatusCd : "A", //物品处理状态
							chargeItemCd : CONST.CHARGE_ITEM_CD.COUPON_SALE, //物品费用项类型
							couponNum : 1, //物品数量
							storeId : response.data.mktResBaseInfo.mktResStoreId, //仓库ID
							storeName : "1", //仓库名称
							agentId : 1, //供应商ID
							apCharge : 0, //物品价格
							couponInstanceNumber : uim, //物品实例编码
							ruleId : "", //物品规则ID
							partyId : OrderInfo.cust.custId, //客户ID
							prodId : prodId, //产品ID
							offerId : -1, //销售品实例ID
						//	attachSepcId : OrderInfo.offerSpec.offerSpecId,
							state : "ADD", //动作
							relaSeq : "" //关联序列	
						};
					OrderInfo.clearProdUim(prodId);
					OrderInfo.boProd2Tds.push(coupon);
				}else{
					$.alert("提示","UIM卡["+uim+"]不是预占状态，当前为"+response.data.mktResBaseInfo.statusCd);
				}
			}else{
				$.alert("提示","查询不到UIM卡["+uim+"]信息");
			}
		}else if (response.code==-2){
			$.alertM(response.data);
		}else {
			$.alert("提示","UIM信息查询接口出错,稍后重试");
		}
	}
	
	//套餐变更提交组织报文
	var _changeOffer = function(busiOrders){
		_createDelOffer(busiOrders,OrderInfo.offer); //退订主销售品
		_createMainOffer(busiOrders,OrderInfo.offer); //订购主销售品	
//		if(offerChange.newMemberFlag || offerChange.oldMemberFlag){
//			_createMainOrder(busiOrders);//纳入新老用户
//		}
		AttachOffer.setAttachBusiOrder(busiOrders);  //订购退订附属销售品
		if(CONST.getAppDesc()==0){ //4g系统需要,补换卡 
			if(ec.util.isArray(OrderInfo.offer.offerMemberInfos)){ //遍历主销售品构成
				$.each(OrderInfo.offer.offerMemberInfos,function(){
					if(this.objType==CONST.OBJ_TYPE.PROD && this.prodClass==CONST.PROD_CLASS.THREE && OrderInfo.offerSpec.is3G=="N"){//补换卡
						if(OrderInfo.boProd2Tds.length>0){
							var prod = {
								prodId : this.objInstId,
								prodSpecId : this.objId,
								accessNumber : this.accessNumber,
								isComp : "N",
								boActionTypeCd : CONST.BO_ACTION_TYPE.CHANGE_CARD
							};
							var busiOrder = OrderInfo.getProdBusiOrder(prod);
							if(busiOrder){
								busiOrders.push(busiOrder);
							}
						}
					}
				});
			}
		}
	};
	
	var _createMainOrder = function(busiOrders) {
		var prodInfo = order.prodModify.choosedProdInfo;
		var offerBusiOrder = {};
		var busiOrder = {
			areaId : prodInfo.areaId,  //受理地区ID
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				objId : prodInfo.prodOfferId,  //业务规格ID
				instId : prodInfo.prodOfferInstId, //业务对象实例ID
				accessNumber : prodInfo.accNbr, //业务号码
				isComp : "Y", //是否组合
				offerTypeCd : "1" //1主销售品
			},  
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.OFFER_ACTION,
				boActionTypeCd : CONST.BO_ACTION_TYPE.ADDOREXIT_COMP
			}, 
			data:{
				ooRoles : []			
			}
		};
		if(offerChange.oldMemberFlag){//纳入老用户
			var offerRoleId = "";
			for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
				var offerRole = OrderInfo.offerSpec.offerRoles[i];
				if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){ //副卡
							offerRoleId = offerRole.offerRoleId;
							break;
				} 
			}
			for(var q=0;q<OrderInfo.oldprodInstInfos.length;q++){
				var oldprodInfo = OrderInfo.oldprodInstInfos[q];
				var oldbusiOrder = {
						areaId : oldprodInfo.areaId,  //受理地区ID
						busiOrderInfo : {
							seq : OrderInfo.SEQ.seq--
						}, 
						busiObj : { //业务对象节点
							objId : oldprodInfo.mainProdOfferInstInfos[0].prodOfferId,  //业务规格ID
							instId : oldprodInfo.mainProdOfferInstInfos[0].prodOfferInstId, //业务对象实例ID
							accessNumber : oldprodInfo.accNbr, //业务号码
							isComp : "Y", //是否组合
							offerTypeCd : "1" //1主销售品
						},  
						boActionType : {
							actionClassCd : CONST.ACTION_CLASS_CD.OFFER_ACTION,
							boActionTypeCd : CONST.BO_ACTION_TYPE.DEL_OFFER
						}, 
						data:{
							ooRoles : []			
						}
					};
					var memberid = -1;
					for ( var i = 0; i < OrderInfo.oldoffer.length; i++) {
						if(OrderInfo.oldoffer[i].accNbr==oldprodInfo.accNbr){
							$.each(OrderInfo.oldoffer[i].offerMemberInfos,function(){
								if(this.objType==CONST.OBJ_TYPE.PROD){
									var ooRole = {
										objId : this.objId,
										objInstId : this.objInstId,
										objType : this.objType,
										offerMemberId : memberid,
										offerRoleId : offerRoleId,
										state : "ADD"
									};
									busiOrder.data.ooRoles.push(ooRole);
									var oldooRole = {
											objId : this.objId,
											objInstId : this.objInstId,
											objType : this.objType,
											offerMemberId : this.offerMemberId,
											offerRoleId : this.offerRoleId,
											state : "DEL"
										};
									oldbusiOrder.data.ooRoles.push(oldooRole);
									--memberid;
								}
							});
						}
					}
				busiOrders.push(oldbusiOrder);
			}
			if(CONST.getAppDesc()==0){ //4g系统需要,补换卡 
				for ( var i = 0; i < OrderInfo.oldoffer.length; i++) { //遍历主销售品构成
					$.each(OrderInfo.oldoffer[i].offerMemberInfos,function(){
						if(this.objType==CONST.OBJ_TYPE.PROD && this.prodClass==CONST.PROD_CLASS.THREE && OrderInfo.offerSpec.is3G=="N"){//补换卡
							if(AttachOffer.isChangeUim(this.objInstId)&&(OrderInfo.boProd2Tds.length>0||OrderInfo.zcd_privilege==0)){
								var prod = {
									prodId : this.objInstId,
									prodSpecId : this.objId,
									accessNumber : this.accessNumber,
									isComp : "N",
									boActionTypeCd : CONST.BO_ACTION_TYPE.CHANGE_CARD
								};
								var busiOrder = OrderInfo.getProdBusiOrder(prod);
								if(busiOrder){
									busiOrders.push(busiOrder);
								}
							}
						}
					});
				}
			}
		}
		if(offerChange.newMemberFlag){
			//遍历主销售品构成
			for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
				var offerRole = OrderInfo.offerSpec.offerRoles[i];
				if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){ //副卡
					if(offerRole.prodInsts!=undefined && offerRole.prodInsts.length>0){
						for ( var j = 0; j < offerRole.prodInsts.length; j++) {
							var prodInst = offerRole.prodInsts[j];
							var ooRole = {
								objId : prodInst.objId,
								objInstId : prodInst.prodInstId,
								objType : prodInst.objType,
								offerMemberId : OrderInfo.SEQ.offerMemberSeq--,
								offerRoleId : prodInst.offerRoleId,
								state : "ADD"
							};
							busiOrder.data.ooRoles.push(ooRole);
							busiOrders.push(SoOrder.createProd(prodInst.prodInstId,prodInst.objId));	
						}		
					}
				} 
			} 
		}
		busiOrders.push(busiOrder);
	};
			
	//创建退订主销售品节点
	var _createDelOffer = function(busiOrders,offer){	
		offer.offerTypeCd = 1;
		offer.boActionTypeCd = CONST.BO_ACTION_TYPE.DEL_OFFER;
		var prodInfo = order.prodModify.choosedProdInfo;
		OrderInfo.getOfferBusiOrder(busiOrders,offer, prodInfo.prodInstId);
	};
	
	//创建主销售品节点
	var _createMainOffer = function(busiOrders,offer) {
		var prod = order.prodModify.choosedProdInfo;
		var offerSpec = OrderInfo.offerSpec;
		var busiOrder = {
			areaId : OrderInfo.getProdAreaId(prod.prodInstId),  //受理地区ID
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				instId : OrderInfo.SEQ.offerSeq--, //业务对象实例ID
				objId : offerSpec.offerSpecId,  //业务规格ID
				offerTypeCd : "1", //1主销售品
				accessNumber : prod.accNbr  //接入号码
			},  
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.OFFER_ACTION,
				boActionTypeCd : CONST.BO_ACTION_TYPE.BUY_OFFER
			}, 
			data:{
				ooRoles : [],
				ooOwners : [{
					partyId : OrderInfo.cust.custId, //客户ID
					state : "ADD" //动作
				}]
			}
		};
		//遍历主销售品构成
		$.each(offerSpec.offerRoles,function(){
			var offerRole = this;
			if(this.prodInsts!=undefined){
				$.each(this.prodInsts,function(){
					var prodInstId = '"'+this.prodInstId+'"';
					if(prodInstId.indexOf("-")==-1){
						var ooRoles = {
							objId : this.objId, //业务规格ID
							objInstId : this.prodInstId, //业务对象实例ID,新装默认-1
							objType : this.objType, // 业务对象类型
							offerRoleId : offerRole.offerRoleId, //销售品角色ID
							state : "ADD" //动作
						};
						busiOrder.data.ooRoles.push(ooRoles);
					}
				});
			}
		});
		
		if(offerChange.oldMemberFlag){//纳入老用户
			var offerRoleId = "";
			for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
				var offerRole = OrderInfo.offerSpec.offerRoles[i];
				if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){ //副卡
							offerRoleId = offerRole.offerRoleId;
							break;
				} 
			}
			for(var q=0;q<OrderInfo.oldprodInstInfos.length;q++){
				var oldprodInfo = OrderInfo.oldprodInstInfos[q];
				var oldbusiOrder = {
						areaId : oldprodInfo.areaId,  //受理地区ID
						busiOrderInfo : {
							seq : OrderInfo.SEQ.seq--
						}, 
						busiObj : { //业务对象节点
							objId : oldprodInfo.mainProdOfferInstInfos[0].prodOfferId,  //业务规格ID
							instId : oldprodInfo.mainProdOfferInstInfos[0].prodOfferInstId, //业务对象实例ID
							accessNumber : oldprodInfo.accNbr, //业务号码
							isComp : "Y", //是否组合
							offerTypeCd : "1" //1主销售品
						},  
						boActionType : {
							actionClassCd : CONST.ACTION_CLASS_CD.OFFER_ACTION,
							boActionTypeCd : CONST.BO_ACTION_TYPE.DEL_OFFER
						}, 
						data:{
							ooRoles : []			
						}
					};
					var memberid = -1;
					for ( var i = 0; i < OrderInfo.oldoffer.length; i++) {
						if(OrderInfo.oldoffer[i].accNbr==oldprodInfo.accNbr){
							$.each(OrderInfo.oldoffer[i].offerMemberInfos,function(){
								if(this.objType==CONST.OBJ_TYPE.PROD){
									var ooRole = {
										objId : this.objId,
										objInstId : this.objInstId,
										objType : this.objType,
										offerMemberId : memberid,
										offerRoleId : offerRoleId,
										state : "ADD"
									};
									busiOrder.data.ooRoles.push(ooRole);
									var oldooRole = {
											objId : this.objId,
											objInstId : this.objInstId,
											objType : this.objType,
											offerMemberId : this.offerMemberId,
											offerRoleId : this.offerRoleId,
											state : "DEL"
										};
									oldbusiOrder.data.ooRoles.push(oldooRole);
									--memberid;
								}
							});
						}
					}
				busiOrders.push(oldbusiOrder);
			}
			if(CONST.getAppDesc()==0){ //4g系统需要,补换卡 
				for ( var i = 0; i < OrderInfo.oldoffer.length; i++) { //遍历主销售品构成
					$.each(OrderInfo.oldoffer[i].offerMemberInfos,function(){
						if(this.objType==CONST.OBJ_TYPE.PROD && this.prodClass==CONST.PROD_CLASS.THREE && OrderInfo.offerSpec.is3G=="N"){//补换卡
							if(AttachOffer.isChangeUim(this.objInstId)&&(OrderInfo.boProd2Tds.length>0||OrderInfo.zcd_privilege==0)){
								var prod = {
									prodId : this.objInstId,
									prodSpecId : this.objId,
									accessNumber : this.accessNumber,
									isComp : "N",
									boActionTypeCd : CONST.BO_ACTION_TYPE.CHANGE_CARD
								};
								var busiOrder = OrderInfo.getProdBusiOrder(prod);
								if(busiOrder){
									busiOrders.push(busiOrder);
								}
							}
						}
					});
				}
			}
		}
		if(offerChange.newMemberFlag){
			//遍历主销售品构成
			for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
				var offerRole = OrderInfo.offerSpec.offerRoles[i];
				if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){ //副卡
					if(offerRole.prodInsts!=undefined && offerRole.prodInsts.length>0){
						for ( var j = 0; j < offerRole.prodInsts.length; j++) {
							var prodInst = offerRole.prodInsts[j];
							var instid = '"'+prodInst.prodInstId+'"';
							if(prodInst.memberRoleCd=="401" && instid.indexOf("-")!=-1){
								var ooRole = {
									objId : prodInst.objId,
									objInstId : prodInst.prodInstId,
									objType : prodInst.objType,
									offerMemberId : OrderInfo.SEQ.offerMemberSeq--,
									offerRoleId : prodInst.offerRoleId,
									state : "ADD"
								};
								busiOrder.data.ooRoles.push(ooRole);
								busiOrders.push(SoOrder.createProd(prodInst.prodInstId,prodInst.objId));	
							}
						}
					}
				} 
			} 
		}

		//销售参数节点
		if(ec.util.isArray(offerSpec.offerSpecParams)){  
			busiOrder.data.ooParams = [];
			for (var i = 0; i < offerSpec.offerSpecParams.length; i++) {
				var param = offerSpec.offerSpecParams[i];
				var ooParam = {
	                itemSpecId : param.itemSpecId,
	                offerParamId : OrderInfo.SEQ.paramSeq--,
	                offerSpecParamId : param.offerSpecParamId,
	                value : param.value,
	                state : "ADD"
	            };
	            busiOrder.data.ooParams.push(ooParam);
			}				
		}
		
		//销售生失效时间节点
		if(offerSpec.ooTimes !=undefined ){
			busiOrder.data.ooTimes = [];
			busiOrder.data.ooTimes.push(offerSpec.ooTimes);
		}
		
		//发展人
		busiOrder.data.busiOrderAttrs = [];
		var $tr = $("li[name='tr_"+OrderInfo.offerSpec.offerSpecId+"']");
		if($tr!=undefined){
			$tr.each(function(){   //遍历产品有几个发展人
				var dealer = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
					role:$(this).find("select[name='dealerType_"+OrderInfo.offerSpec.offerSpecId+"']").val(),
					value : $(this).find("input").attr("staffid"),
					//APP发展人渠道[W]
					channelNbr:$(this).find("select[name='dealerChannel_"+OrderInfo.offerSpec.offerSpecId+"']").val()
				};
				busiOrder.data.busiOrderAttrs.push(dealer);
				
				//APP发展人名称(原来没有，补上)
				var dealer_name = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER_NAME,
					role:$(this).find("select[name='dealerType_"+OrderInfo.offerSpec.offerSpecId+"']").val(),
					value : $(this).find("input").attr("value") 
				};
				busiOrder.data.busiOrderAttrs.push(dealer_name);
			});
		}
		busiOrders.push(busiOrder);
	};
	
	//填单页面切换
	var _changeTab = function(prodId) {
		/*
		$.each($("#tab_"+prodId).parent().find("li"),function(){
			$(this).removeClass("setcon");
			$("#attach_tab_"+$(this).attr("prodId")).hide();
			$("#uimDiv_"+$(this).attr("prodId")).hide();
		});
		$("#tab_"+prodId).addClass("setcon");
		$("#attach_tab_"+prodId).show();
		if(AttachOffer.isChangeUim(prodId)){
			$("#uimDiv_"+prodId).show();
		}
		*/
	};
	
	//省里校验单
	var _checkOrder = function(prodId){
		if(OrderInfo.actionFlag==3){
			_getAttachOfferInfo();
		}else{
			_getChangeInfo();
		}
		var data = query.offer.updateCheckByChange(JSON.stringify(OrderInfo.orderData));
		OrderInfo.orderData.orderList.custOrderList[0].busiOrder = []; //校验完清空	
		if(data==undefined){
			return false;
		}
		if(data.resultCode==0 && ec.util.isObj(data.result)){ //预校验成功
			offerChange.resultOffer = data.result;
		}else {
			$.alert("预校验规则限制",data.resultMsg);
			offerChange.resultOffer = {}; 
			return false;
		}
		return true;
	};
	
	//3G套餐订购4G流量包时预校验的入参封装
	var _getAttachOfferInfo=function(){
		OrderInfo.getOrderData(); //获取订单提交节点	
		OrderInfo.orderData.orderList.orderListInfo.partyId = OrderInfo.cust.custId;
		var busiOrders = OrderInfo.orderData.orderList.custOrderList[0].busiOrder;//获取业务对象数组
		//遍历已开通附属销售品列表
		for ( var i = 0; i < AttachOffer.openList.length; i++) {
			var open = AttachOffer.openList[i];
			for ( var j = 0; j < open.specList.length; j++) {  //遍历当前产品下面的附属销售品
				var spec = open.specList[j];
				if(spec.isdel != "Y" && spec.isdel != "C" && spec.ifPackage4G=="Y"){  //订购的附属销售品
					spec.offerTypeCd = 2;
					spec.boActionTypeCd = CONST.BO_ACTION_TYPE.BUY_OFFER;
					spec.offerId = OrderInfo.SEQ.offerSeq--; 
					OrderInfo.getOfferBusiOrder(busiOrders,spec,open.prodId);	
				}
			}
		}
		$.each(busiOrders,function(){
			this.busiObj.state="ADD";
		});
	};
	
	//把旧套餐的产品自动匹配到新套餐中，由于现在暂时只支持主副卡跟单产品，所以可以自动匹配
	var _setChangeOfferSpec = function(memberNum,viceNum){
		if(memberNum==1){ //单产品变更
			var offerRole = getOfferRole();
			if(offerRole==undefined){
				alert("错误提示","无法变更到该套餐");
				return false;
			}
			offerRole.prodInsts = [];
			var flag=false;
			$.each(offerRole.roleObjs,function(){
				if(this.objType==CONST.OBJ_TYPE.PROD){
					var roleObj = this;
					flag=false;
					$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
						if(this.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
							if(roleObj.objId!=this.objId){
								$.alert("规则限制","新套餐【"+roleObj.offerRoleName+"】角色的规格ID【"+roleObj.objId+"】和旧套餐【"+this.roleName+"】角色的规格ID【"+this.objId+"】不一样");
								flag=true;
								return false;
							}
							roleObj.prodInstId = this.objInstId;
							roleObj.accessNumber = this.accessNumber;
							roleObj.memberRoleCd = this.roleCd;
							offerRole.prodInsts.push(roleObj);
						}
					});
					if(flag){
						return false;
					}
				}
			});
			if(flag){
				return false;
			}
		}else{  //多成员角色
			for (var i = 0; i < OrderInfo.offer.offerMemberInfos.length; i++) {
				var offerMember = OrderInfo.offer.offerMemberInfos[i];
				if(offerMember.objType==CONST.OBJ_TYPE.PROD){
					var flag = true;
					for (var j = 0; j < OrderInfo.offerSpec.offerRoles.length; j++) {
						var offerRole = OrderInfo.offerSpec.offerRoles[j];
						if(offerMember.roleCd==offerRole.memberRoleCd){ //旧套餐对应新套餐角色
							for (var k = 0; k < offerRole.roleObjs.length; k++) {
								var roleObj = offerRole.roleObjs[k];
								if(roleObj.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
									if(roleObj.objId!=offerMember.objId){
										$.alert("规则限制","新套餐【"+roleObj.offerRoleName+"】角色的规格ID【"+roleObj.objId+"】和旧套餐【"+offerMember.roleName+"】角色的规格ID【"+offerMember.objId+"】不一样");
										return false;
									}
									if(!ec.util.isArray(offerRole.prodInsts)){
										offerRole.prodInsts = [];
									}
									var newObject = jQuery.extend(true, {}, roleObj); 
									newObject.prodInstId = offerMember.objInstId;
									newObject.accessNumber = offerMember.accessNumber;
									newObject.memberRoleCd = offerMember.roleCd;
									offerRole.prodInsts.push(newObject);
									if(offerRole.prodInsts.length>roleObj.maxQty){
										$.alert("规则限制","新套餐【"+offerRole.offerRoleName+"】角色最多可以办理数量为"+roleObj.maxQty+",而旧套餐数量大于"+roleObj.maxQty);
										return false;
									}
									break;
								}
							}
							flag = false;
							break;
						}
					}
					if(flag){
						alert("旧套餐【"+offerMember.roleName+"】角色在新套餐中不存在，无法变更");
						//$.alert("规则限制","旧套餐【"+offerMember.roleName+"】角色在新套餐中不存在，无法变更");
						return false;
					}
				}
			}
		}
		return true;
	};
	
	//获取单产品变更自动匹配的角色
	var getOfferRole = function(){
		//新套餐是主副卡,获取主卡角色
		for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
			var offerRole = OrderInfo.offerSpec.offerRoles[i];
			if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD){  //主卡
				return offerRole;
			}
		}
		//新套餐不是主副卡，返回第一个包含接入产品的角色
		for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
			var offerRole = OrderInfo.offerSpec.offerRoles[i];
			for (var j = 0; j < offerRole.roleObjs.length; j++) {
				var roleObj = offerRole.roleObjs[j];
				if(roleObj.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
					return offerRole;
				}
			}
		}
	};
	
	//获取套餐变更节点
	var _getChangeInfo = function(){
		OrderInfo.getOrderData(); //获取订单提交节点	
		OrderInfo.orderData.orderList.orderListInfo.partyId = OrderInfo.cust.custId;
		OrderInfo.orderData.orderList.orderListInfo.areaId = OrderInfo.cust.areaId;
		var busiOrders = OrderInfo.orderData.orderList.custOrderList[0].busiOrder;//获取业务对象数组
		_createDelOffer(busiOrders,OrderInfo.offer); //退订主销售品
		_createMainOffer(busiOrders,OrderInfo.offer); //订购主销售品	
	};
	
	//根据省内返回的数据校验
	var _checkOfferProd = function(){
		if(offerChange.resultOffer==undefined){
			return;
		}
		//功能产品
		var prodInfos = offerChange.resultOffer.prodInfos;
		if(ec.util.isArray(prodInfos)){
			$.each(prodInfos,function(){
				var prodId = this.accProdInstId;
				//容错处理，省份接入产品实例id传错
				var flag = true;
				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
					if(this.objType==CONST.OBJ_TYPE.PROD && this.objInstId==prodId){  //接入类产品
						flag = false;
						return false;
					}
				});
				if(flag){
					return true;
				}
				if(prodId!=this.prodInstId){ //功能产品
					var serv = CacheData.getServ(prodId,this.prodInstId);
					if(this.state=="DEL"){
						if(serv!=undefined){
							var $dd = $("#li_"+prodId+"_"+this.prodInstId);
							if(ec.util.isObj($dd)){
								var $span = $("#span_"+prodId+"_"+this.prodInstId);
								var $span_remove = $("#span_remove_"+prodId+"_"+this.prodInstId);
								if(ec.util.isObj($span)){
									$span.addClass("del");
								}
								if(ec.util.isObj($span_remove)){
									$span_remove.hide();
								}
								$dd.removeAttr("onclick");
								serv.isdel = "Y";
							}
						}	
					}else if(this.state=="ADD"){
						if(serv!=undefined){  //在已开通里面，修改不让关闭
							var $dd = $("#li_"+prodId+"_"+this.prodInstId);
							if(ec.util.isObj($dd)){
								var $span = $("#span_"+prodId+"_"+this.prodInstId);
								var $span_remove = $("#span_remove_"+prodId+"_"+this.prodInstId);
								if(ec.util.isObj($span)){
									$span.removeClass("del");
								}
								if(ec.util.isObj($span_remove)){
									$span_remove.hide();
								}
								$dd.removeAttr("onclick");
								serv.isdel = "N";
							}
						}else{
							var servSpec = CacheData.getServSpec(prodId,this.productId); //已开通里面查找
							if(servSpec!=undefined){
								var $dd = $("#li_"+prodId+"_"+this.productId);
								if(ec.util.isObj($dd)){
									var $span = $("#span_"+prodId+"_"+this.productId);
									var $span_remove = $("#span_remove_"+prodId+"_"+this.productId);
									if(ec.util.isObj($span)){
										$span.removeClass("del");
									}
									if(ec.util.isObj($span_remove)){
										$span_remove.hide();
									}
									$dd.removeAttr("onclick");
									servSpec.isdel = "N";
								}
								
								$("#del_"+prodId+"_"+this.productId).hide();
							}else {
								if(this.productId!=undefined && this.productId!=""){
									//AttachOffer.addOpenServList(prodId,this.productId,this.prodName,this.ifParams);
									AttachOffer.openServSpec(prodId,this.productId);
								}
							}
						}
					}
				}
			});
		}
		
		//可选包
		var offers = offerChange.resultOffer.prodOfferInfos;
		if(ec.util.isArray(offers)){
			if(ec.util.isArray(OrderInfo.offer.offerMemberInfos)){//多产品套餐
				$.each(OrderInfo.offer.offerMemberInfos,function(){
					var prodId = this.objInstId;
					$.each(offers,function(){
						if(this.memberInfo==undefined){
							return true;
						}
						var offer = CacheData.getOffer(prodId,this.prodOfferInstId); //已开通里面查找
						var flag = true;
						$.each(this.memberInfo,function(){  //寻找该销售品属于哪个产品
							if(prodId == this.accProdInstId){		
								if(ec.util.isObj(offer)){
									this.prodId = this.accProdInstId;
								}
								flag = false;
								return false;
							}
						});
						if(flag){
							return true;
						}
						if(this.state=="DEL"){
							if(offer!=undefined){
								var $dd = $("#li_"+prodId+"_"+this.prodOfferInstId);
								if(ec.util.isObj($dd)){
									var $span = $("#span_"+prodId+"_"+this.prodOfferInstId);
									var $span_remove = $("#span_remove_"+prodId+"_"+this.prodOfferInstId);
									if(ec.util.isObj($span)){
										$span.addClass("del");
									}
									if(ec.util.isObj($span_remove)){
										$span_remove.hide();
									}
									$dd.removeAttr("onclick");
									offer.isdel = "N";
								}
								offer.isdel = "Y";
								if(this.isRepeat!="Y"){//如果可选包下面有多个接入类产品，到时候只拼一个退订节点
									this.isRepeat="Y";
								}else{
									offer.isRepeat="Y";
								}
							}	
						}else if(this.state=="ADD"){
							if(offer!=undefined){ //在已开通里面，修改不让关闭
								var $dd = $("#li_"+prodId+"_"+this.prodOfferInstId);
								if(ec.util.isObj($dd)){
									var $span = $("#span_"+prodId+"_"+this.prodOfferInstId);
									var $span_remove = $("#span_remove_"+prodId+"_"+this.prodOfferInstId);
									if(ec.util.isObj($span)){
										$span.removeClass("del");
									}
									if(ec.util.isObj($span_remove)){
										$span_remove.hide();
									}
									$dd.removeAttr("onclick");
									offer.isdel = "N";
								}
							}else{
								var offerSpec = CacheData.getOfferSpec(prodId,this.prodOfferId); //已开通里面查找
								if(offerSpec!=undefined){
									var $dd = $("#li_"+prodId+"_"+this.prodOfferId);
									if(ec.util.isObj($dd)){
										var $span = $("#span_"+prodId+"_"+this.prodOfferId);
										var $span_remove = $("#span_remove_"+prodId+"_"+this.prodOfferId);
										if(ec.util.isObj($span)){
											$span.removeClass("del");
										}
										if(ec.util.isObj($span_remove)){
											$span_remove.hide();
										}
										$dd.removeAttr("onclick");
										offerSpec.isdel = "N";
									}
								}else {
									if(ec.util.isObj(this.prodOfferId) && this.prodOfferId!=OrderInfo.offerSpec.offerSpecId){
										//AttachOffer.addOpenList(prodId,this.prodOfferId);			
										AttachOffer.addOfferSpecByCheck(prodId,this.prodOfferId);
									}
								}
							}
						}
					});
				});
			}
		}
	};
	
	//根据省内返回的数据校验拼成html
	var _checkAttachOffer = function(prodId){
		var content="";
		if(offerChange.resultOffer==undefined){
			return content;
		}
		//功能产品
		var prodInfos = offerChange.resultOffer.prodInfos;
		if(ec.util.isArray(prodInfos)){
			var str = "";
			$.each(prodInfos,function(){
//				var prodId = this.accProdInstId;
//				//容错处理，省份接入产品实例id传错
//				var flag = true;
//				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
//					if(this.objType==CONST.OBJ_TYPE.PROD && this.objInstId==prodId){  //接入类产品
//						flag = false;
//						return false;
//					}
//				});
				if(prodId!=this.accProdInstId){
					return true;
				}
				if(prodId!=this.prodInstId){ //功能产品
					var serv = CacheData.getServ(prodId,this.prodInstId);//已开通功能产品里面查找
					var servSpec = CacheData.getServSpec(prodId,this.productId);//已选功能产品里面查找
					if(this.state=="DEL"){
						if(serv!=undefined){
							str+='<li id="li_'+prodId+'_'+this.prodInstId+'" offerspecid="" offerid="'+this.prodInstId+'" isdel="N">'
									+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
									+'<span class="del">'+serv.servSpecName+'</span>'
								+'</li>';
						}else{
							if(servSpec!=undefined){
								str+='<li id="li_'+prodId+'_'+this.prodInstId+'" offerspecid="" offerid="'+this.prodInstId+'" isdel="N">'
										+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
										+'<span class="del">'+servSpec.servSpecName+'</span>'
									+'</li>';
							}else if(this.productName!=undefined && this.productName!=""){
								str+='<li id="li_'+prodId+'_'+this.prodInstId+'" offerspecid="" offerid="'+this.prodInstId+'" isdel="N">'
										+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
										+'<span class="del">'+this.productName+'</span>'
									+'</li>';
							}
						}	
					}else if(this.state=="ADD"){
						if(serv!=undefined){
							str+='<li id="li_'+prodId+'_'+this.prodInstId+'">'
									+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
									+'<span>'+serv.servSpecName+'</span>'
									+'<dd class="mustchoose"></dd>'
								+'</li>';
						}else{
							if(servSpec!=undefined){
								str+='<li id="li_'+prodId+'_'+this.prodInstId+'">'
										+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
										+'<span>'+servSpec.servSpecName+'</span>'
										+'<dd class="mustchoose"></dd>'
									+'</li>';
							}else if(this.productName!=undefined && this.productName!=""){
								str+='<li id="li_'+prodId+'_'+this.prodInstId+'">'
										+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
										+'<span>'+this.productName+'</span>'
										+'<dd class="mustchoose"></dd>'
									+'</li>';
								}
						}
					}
				}
			});
			if(str==""){
				content="";
			}else{
				content="<div class='fs_choosed'>订购4G流量包，需订购和取消如下功能产品：<br><ul>"+str+"</ul></div><br>";
			}
		}
		
		
		//可选包
		var offers = offerChange.resultOffer.prodOfferInfos;
		if(ec.util.isArray(offers)){
			var str="";
			$.each(offers,function(){
				if(this.memberInfo==undefined){
					return true;
				}
				var flag = true;
				$.each(this.memberInfo,function(){  //寻找该销售品属于哪个产品
					if(ec.util.isObj(this.accProdInstId)&&prodId == this.accProdInstId){
						flag = false;
						return false;
					}
				});
				if(flag){
					return true;
				}
				var offer = CacheData.getOffer(prodId,this.prodOfferInstId); //已订购里面查找
				var offerSpec = CacheData.getOfferSpec(prodId,this.prodOfferId); //已选里面查找
				if(this.state=="DEL"){
					if(offer!=undefined){
						str+='<li id="li_'+prodId+'_'+this.prodOfferInstId+'" offerspecid="" offerid="'+this.prodOfferInstId+'" isdel="N">'
								+'<dd id="del_'+prodId+'_'+this.prodOfferInstId+'" class="delete"></dd>'
								+'<span class="del">'+offer.offerSpecName+'</span>'
							+'</li>';
					}else{
						if(offerSpec!=undefined){
							str+='<li id="li_'+prodId+'_'+this.prodOfferInstId+'" offerspecid="" offerid="'+this.prodOfferInstId+'" isdel="N">'
									+'<dd id="del_'+prodId+'_'+this.prodOfferInstId+'" class="delete"></dd>'
									+'<span class="del">'+offerSpec.offerSpecName+'</span>'
								+'</li>';
						}else if(this.prodOfferName!=undefined && this.prodOfferName!=""){
							str+='<li id="li_'+prodId+'_'+this.prodOfferInstId+'" offerspecid="" offerid="'+this.prodOfferInstId+'" isdel="N">'
									+'<dd id="del_'+prodId+'_'+this.prodOfferInstId+'" class="delete"></dd>'
									+'<span class="del">'+this.prodOfferName+'</span>'
								+'</li>';
						}
					}	
				}else if(this.state=="ADD"){
					if(offer!=undefined){
						str+='<li id="li_'+prodId+'_'+this.prodOfferInstId+'">'
								+'<dd id="del_'+prodId+'_'+this.prodOfferInstId+'" class="delete"></dd>'
								+'<span>'+offer.offerSpecName+'</span>'
								+'<dd class="mustchoose"></dd>'
							+'</li>';
					}else{
						if(offerSpec!=undefined){
							str+='<li id="li_'+prodId+'_'+this.prodOfferInstId+'">'
									+'<dd id="del_'+prodId+'_'+this.prodOfferInstId+'" class="delete"></dd>'
									+'<span>'+offerSpec.offerSpecName+'</span>'
									+'<dd class="mustchoose"></dd>'
								+'</li>';
						}else if(this.prodOfferName!=undefined && this.prodOfferName!=""){
							str+='<li id="li_'+prodId+'_'+this.prodOfferInstId+'">'
									+'<dd id="del_'+prodId+'_'+this.prodOfferInstId+'" class="delete"></dd>'
									+'<span>'+this.prodOfferName+'</span>'
									+'<dd class="mustchoose"></dd>'
								+'</li>';
						}
					}
				}
			});
			if(str!=""){
				content+="<div class='fs_choosed'>订购4G流量包，需开通和关闭如下可选包：<br><ul>"+str+"</ul></div>";
			}
		}
		
		return content;
	};
	return {
		init 					: 				_init,
		offerChangeView			:				_offerChangeView,
		changeOffer 			: _changeOffer,
		changeTab				: _changeTab,
		checkOrder				: _checkOrder,
		checkAttachOffer		: _checkAttachOffer,
		fillOfferChange			: _fillOfferChange,
		checkOfferProd			: _checkOfferProd,
		getChangeInfo			: _getChangeInfo,
		setChangeOfferSpec		: _setChangeOfferSpec,
		addNum					: _addNum
	};
})();
/**
 * 对缓存数据操作
 * 
 * @author wukf
 * date 2014-01-15
 */
CommonUtils.regNamespace("CacheData");

/** 缓存数据对象*/
CacheData = (function() {
	
	//把销售品规格保存到开通列表里面
	var _setOfferSpec = function(prodId,offerSpec){
		offerSpec.isdel="C";
		var flag = true ; 
		for (var i = 0; i < AttachOffer.openList.length; i++) { //没有开通任何附属
			var open = AttachOffer.openList[i];
			if(open.prodId==prodId){
				flag = false;
				break;
			}
		} 
		if(flag){
			var open = {
				prodId : prodId,
				specList : []
			};
			AttachOffer.openList.push(open);
		}
		CacheData.getOfferSpecList(prodId).push(offerSpec);//添加到已开通列表里
	};
	
	//添加功能产品到缓存列表
	var _setServSpec = function(prodId,spec){
		spec.isdel="C";
		if(spec.servSpecId==undefined){
			spec.servSpecId = spec.objId;
		}
		if(spec.servSpecName==undefined){
			spec.servSpecName = spec.objName;
		}
		var flag = true ; 
		for (var i = 0; i < AttachOffer.openServList.length; i++) { //没有开通任何附属
			var open = AttachOffer.openServList[i];
			if(open.prodId==prodId){
				flag = false;
				break;
			}
		} 
		if(flag){
			var open = {
				prodId : prodId,
				servSpecList : []
			};
			AttachOffer.openServList.push(open);
		}
		CacheData.getServSpecList(prodId).push(spec);//添加到已开通列表里
	};
	
	//把选中的服务保存到销售品规格中
	var _setServ2OfferSpec = function(prodId,offerSpec){
		if(offerSpec!=undefined){
			$.each(offerSpec.offerRoles,function(){
				$.each(this.roleObjs,function(){
					if($("#check_"+prodId+"_"+this.objId).attr("checked")=="checked"){
						this.selQty = 1;
					}else{
						this.selQty = 2;//未选中
					}
				});
			});
		}
	};
	
	//获取参数内容
	var _getParamContent = function(prodId,spec,flag){
		var content = '<form id="paramForm">' ;
		if(flag==2){  //功能产品规格参数
			if(ec.util.isArray(spec.prodSpecParams)){ //拼接功能产品规格参数
				for (var i = 0; i < spec.prodSpecParams.length; i++) { 
					var param = spec.prodSpecParams[i];
					if(param.value==undefined){
						param.value = "";
					}
					content += _getStrByParam(prodId,param,param.itemSpecId,param.value);
				}
			}
		}else if(flag==3){ //功能产品实例参数
			if(ec.util.isArray(spec.prodSpecParams)){ //拼接功能产品规格参数
				for (var i = 0; i < spec.prodSpecParams.length; i++) { 
					var param = spec.prodSpecParams[i];
					if(ec.util.isArray(spec.prodInstParams)){ //拼接功能产品实例参数
						$.each(spec.prodInstParams,function(){
							if(this.itemSpecId==param.itemSpecId){
								param.value = this.value;
							}
						});
					}
					if(param.value==undefined){
						param.value = "";
					}
					content += _getStrByParam(prodId,param,param.itemSpecId,param.value);
				}
			}
		} else if(flag==1){  //销售品实例参数
			if(spec.offerSpec!=undefined){
				if(ec.util.isArray(spec.offerSpec.offerSpecParams)){
					var offerSpecParams = spec.offerSpec.offerSpecParams;//sortParam(spec.offerSpec.offerSpecParams);
					$.each(offerSpecParams,function(){
						var param = this;
						if(ec.util.isArray(spec.offerParamInfos)){ //销售品实例参数
							$.each(spec.offerParamInfos,function(){  
								if(this.itemSpecId==param.itemSpecId){
									param.value = this.value;
								}
							});
						}
						content += _getStrByParam(prodId,this,this.itemSpecId,this.value);
					});
				}
			}
		}else {  //销售品规格参数
			if(ec.util.isArray(spec.offerSpecParams)){
				var offerSpecParams = spec.offerSpecParams;
				$.each(offerSpecParams,function(){
					content += _getStrByParam(prodId,this,this.itemSpecId,this.value);
				});
			}
			/*if(spec.offerRoles!=undefined && spec.offerRoles.length>0){
				for (var i = 0; i < spec.offerRoles.length; i++) {
					var offerRole = spec.offerRoles[i];
					for (var j = 0; j < offerRole.roleObjs.length; j++) {
						var roleObj = offerRole.roleObjs[j];
						if(roleObj.prodSpecParams !=undefined && roleObj.prodSpecParams.length>0){
							for (var k = 0; k < roleObj.prodSpecParams.length; k++) {
								content += _getStrByParam(prodId,roleObj.prodSpecParams[k],roleObj.prodSpecParams[k].itemSpecId,flag);
							}
						}
					}
				}
			}*/
		}
		content +='</form>' ;
		return content;
	};
	
	//获取增值业务内容
	var _getAppContent = function(prodId,appList){
		var $form = $('<form id="appForm"></form>');
		if(!!appList && appList.length>0){ //下拉框
			$.each(appList,function(){
				var $input = $('<input id="'+prodId+'_'+this.objId+'" name="'+prodId+'" type="checkbox">'+this.objName+'</input></br>');
				if(this.minQty == 0){
					if(this.dfQty>0){
						$input.attr("checked","checked");
					}
				}else if(this.minQty > 0){
					$input.attr("checked","checked");
					$input.attr("disabled","disabled");
				}
				$form.append($input);
			});
		}
		return $form;
	};
	
	//根据参数获取字符串
	var _getStrByParam = function(prodId,param){
		var itemSpecId = param.itemSpecId;
		if(param.setValue==undefined){  //没有设置过参数
			param.setValue = param.value; //赋值成默认值
		}
		var paramVal = param.setValue;
		var selectStr = ""; //返回字符串
		if(ec.util.isArray(param.valueRange)){ //下拉框
			var optionStr = "";
			if(param.rule.isConstant=='Y'){ //不可修改
				selectStr = param.name + ": <select class='inputWidth183px' id="+prodId+"_"+itemSpecId+" disabled='disabled'>"; 
			}else {
				if(param.rule.isOptional=="N") { //必填
					selectStr = param.name + ": <select class='inputWidth183px' id="+prodId+"_"+itemSpecId+" data-validate='validate(required,reg:"
							  + param.rule.maskMsg+"("+param.rule.mask+")) on(blur)'><label class='f_red'>*</label><br>"; 
				}else{
					selectStr = param.name + ": <select class='inputWidth183px' id="+prodId+"_"+itemSpecId+"><br>"; 
					optionStr +='<option value="" >请选择</option>';  //不是必填可以不选
				}
			}
			for ( var j = 0; j < param.valueRange.length; j++) {
				var valueRange = param.valueRange[j];
				if(valueRange.value== param.setValue){
					optionStr +='<option value="'+valueRange.value+'" selected="selected" >'+valueRange.text+'</option>';
				}else {
					optionStr +='<option value="'+valueRange.value+'">'+valueRange.text+'</option>';
				}
			}
			selectStr += optionStr + "</select><br>"; 
		}else { 
			 if(param.dataTypeCd==1){  //文本框
				if(param.rule==undefined){
					selectStr += param.name + ' : <input id="'+prodId+'_'+itemSpecId +'" class="inputWidth183px" type="text" value="'+paramVal+'" ><br>'; 
				}else {
					if(param.rule.isConstant=='Y'){ //不可修改
						selectStr += param.name + ' : <input id="'+prodId+'_'+itemSpecId
						+'" class="inputWidth183px" type="text" disabled="disabled" value="'+paramVal+'" ><br>';
					}else {
						if(param.rule.isOptional=="N") { //必填
							selectStr += param.name + ' : <input id="'+prodId+'_'+itemSpecId  
							+'" class="inputWidth183px" type="text" data-validate="validate(required,reg:'+param.rule.maskMsg+'('+param.rule.mask+')) on(blur)" value="'+paramVal+'" ><label class="f_red">*</label><br>'; 
						}else{
							selectStr += param.name + ' : <input id="'+prodId+'_'+itemSpecId  
							+'" class="inputWidth183px" type="text" data-validate="validate(reg:'+param.rule.maskMsg+'('+param.rule.mask+')) on(blur)" value="'+paramVal+'" ><br>'; 
						}
					}
				}
			} else if(param.dataTypeCd==8){  //密码框
				if(param.rule==undefined){
					selectStr += param.name + ' : <input id="'+prodId+'_'+itemSpecId +'" class="inputWidth183px" type="password" value="'+paramVal+'" ><br>'; 
				}else{
					if(param.rule.isConstant=='Y'){
						selectStr += param.name + ' : <input id="'+prodId+'_'+itemSpecId
						+'" class="inputWidth183px" type="password"  disabled="disabled" value="'+paramVal+'" ><br>';
					}else {
						if(param.rule.isOptional=="N") {
							selectStr += param.name + ' : <input id="'+prodId+'_'+itemSpecId  
							+'" class="inputWidth183px" type="password" data-validate="validate(required,reg:'+param.rule.maskMsg+'('+param.rule.mask+')) on(blur)" value="'+paramVal+'" ><label class="f_red">*</label><br>'; 
						}else{
							selectStr += param.name + ' : <input id="'+prodId+'_'+itemSpecId  
							+'" class="inputWidth183px" type="password" data-validate="validate(reg:'+param.rule.maskMsg+'('+param.rule.mask+')) on(blur)" value="'+paramVal+'" ><br>'; 
						}
					}
				}
			}else if(param.dataTypeCd==4){ //日期，暂时不写
			
			
			}
		}
		return selectStr;
	};
	
	//获取销售品下的功能产品拼接成字符串
	var _getOfferProdStr = function(prodId,spec,flag){
		var content = '<form id="paramForm">' ;
		var str = "";
		if(flag==0){  //订购可选包
			$.each(spec.offerRoles,function(){
				$.each(this.roleObjs,function(){
					if(this.objType==4){
						if(this.minQty==0 && this.maxQty>0 && this.dfQty>0){
							str += '<input id="check_'+prodId+'_'+this.objId +'" type="checkbox" checked="checked">'+'<label for=check_'+prodId+'_'+this.objId +'>'+ this.objName +'</label><br>'; 
						}else if(this.minQty>0){
							str += '<input id="check_'+prodId+'_'+this.objId +'"  type="checkbox" checked="checked" disabled="disabled">'+'<label for=check_'+prodId+'_'+this.objId +'>'+ this.objName +'</label><br>';
						}else if(this.minQty==0 && this.maxQty>0 && this.dfQty==0){
							str += '<input id="check_'+prodId+'_'+this.objId +'" type="checkbox">'+'<label for=check_'+prodId+'_'+this.objId +'>'+ this.objName +'</label><br>'; 
						}
					}
				});
			});
			if(str==""){
				content = '订购【'+spec.offerSpecName+'】可选包' ;
			}else{
				content = '订购【'+spec.offerSpecName+'】可选包，需要开通以下勾选的功能产品：<br>' +str;
			}
		}else if(flag==1) { //退订可选包
			$.each(spec.offerMemberInfos,function(){  //退订时候spec当成serv
				var offerMember = this;
				$.each(spec.offerSpec.offerRoles,function(){
					$.each(this.roleObjs,function(){
						if(offerMember.objId==this.objId && this.relaTypeCd==CONST.RELA_TYPE_CD.SELECT){ //优惠构成关系
							var servId = offerMember.objInstId;
							if(this.unssProcessMode==CONST.UNSS_PROCESS_MODE.CLOSE&&this.minQty<=0){
								str += '<input id="check_'+prodId+'_'+servId+'" type="checkbox" checked="checked" disabled="disabled">'+'<label for=check_'+prodId+'_'+this.servId +'>'+ this.objName +'</label><br>'; 
							}else if(this.unssProcessMode==CONST.UNSS_PROCESS_MODE.CHOOSE&&this.minQty<=0){
								str += '<input id="check_'+prodId+'_'+servId+'" type="checkbox" checked="checked">'+'<label for=check_'+prodId+'_'+this.servId +'>'+ this.objName +'</label><br>';
							}
						}
					});
				});
			});
			if(str==""){
				content = '退订【'+spec.offerSpecName+'】可选包' ;
			}else{
				content = '退订【'+spec.offerSpecName+'】可选包，需要关闭以下勾选的功能产品：<br>' +str;
			}
		}else if(flag==2) { //取消订购可选包
			$.each(spec.offerRoles,function(){
				$.each(this.roleObjs,function(){
					if(this.relaTypeCd==CONST.RELA_TYPE_CD.SELECT){ //优惠构成关系
						if(this.unssProcessMode==CONST.UNSS_PROCESS_MODE.CLOSE&&this.minQty<=0){
							str += '<input id="check_'+prodId+'_'+this.objId +'" type="checkbox" checked="checked" disabled="disabled">'+'<label for=check_'+prodId+'_'+this.objId +'>'+ this.objName +'</label><br>'; 
						}else if(this.unssProcessMode==CONST.UNSS_PROCESS_MODE.CHOOSE&&this.minQty<=0){
							str += '<input id="check_'+prodId+'_'+this.objId +'" type="checkbox" checked="checked">'+'<label for=check_'+prodId+'_'+this.objId +'>'+ this.objName +'</label><br>';
						}
					}
				});
			});
			if(str==""){
				content = '取消订购【'+spec.offerSpecName+'】可选包' ;
			}else{
				content = '取消订购【'+spec.offerSpecName+'】可选包，需要取消开通以下勾选的功能产品：<br>' +str;
			}
		}
		content +='</form>';
		return content;
	};
	
	//自动设置参数
	var _setParam = function(prodId,offerSpec){
		//自动设置销售品参数
		if(ec.util.isArray(offerSpec.offerSpecParams)){
			for (var i = 0; i < offerSpec.offerSpecParams.length; i++) {
				var param = offerSpec.offerSpecParams[i];
				if(ec.util.isArray(param.valueRange)){ //不是下拉框
					if(param.value==undefined || param.value==""){ //必须手工填写
						if(param.rule.isOptional=="N"){ //必填
							return false;
						}
					}
				}else{
					if(param.value==undefined || param.value==""){
						if(param.rule.isOptional=="N"){ //必填
							return false;
						}
					}
				}
			}
		}
		//自动设置服务参数
		/*if(!!offerSpec.offerRoles){
			for (var i = 0; i < offerSpec.offerRoles.length; i++) {
				var offerRole = offerSpec.offerRoles[i];
				for (var j = 0; j < offerRole.roleObjs.length; j++) {
					var roleObj = offerRole.roleObjs[j];
					if(!!roleObj.prodSpecParams){
						for (var k = 0; k < roleObj.prodSpecParams.length; k++) {
							var param = roleObj.prodSpecParams[k];
							if(param.valueRange.length == 0){ //不是下拉框
								if(param.value===""){ //必须手工填写
									return false;
								}
							}else{
								if(param.value==undefined || param.value==""){
									param.value = param.valueRange[0].value; 
								}
							}
						}
					}
				}
			}
		}*/
		offerSpec.isset = "Y";
		return true;
	};

	//自动设置服务参数
	var _setServParam = function(prodId,servSpec){
		if(ec.util.isArray(servSpec.prodSpecParams)){
			for (var k = 0; k < servSpec.prodSpecParams.length; k++) {
				var param = servSpec.prodSpecParams[k];
				if(ec.util.isArray(param.valueRange)){ //下拉框
					if(param.value==undefined || param.value==""){ //必须手工填写
						if(param.rule.isOptional=="N"){ //必填
							return false;
						}
					}
				}else{
					if(param.value==undefined || param.value==""){
						if(param.rule.isOptional=="N"){ //必填
							return false;
						}
					}
				}
			}
		}
		servSpec.isset = "Y";
		return true;
	};
	
	//通过产品id获取产品已开通附属规格列表
	var _getOfferSpecList = function (prodId){
		for ( var i = 0; i < AttachOffer.openList.length; i++) {
			var open = AttachOffer.openList[i];
			if(open.prodId == prodId){
				return open.specList;
			} 
		}
		return []; //如果没值返回空数组
	};
	
	//通过产品id,跟销售品规格id获取销售品构成
	var _getOfferSpec = function(prodId,offerSpecId){
		var specList = _getOfferSpecList(prodId);
		if(specList!=undefined){
			for ( var i = 0; i < specList.length; i++) {
				if(specList[i].offerSpecId==offerSpecId){
					return specList[i];
				}
			}
		}
	};
	
	//获取某个销售品规格参数  
	var _getSpecParam = function(prodId,offerSpecId,itemSpecId){
		var spec = _getOfferSpec(prodId,offerSpecId);
		if(ec.util.isObj(spec)){
			for ( var i = 0; i < spec.offerSpecParams.length; i++) {
				if(spec.offerSpecParams[i].itemSpecId==itemSpecId){
					return spec.offerSpecParams[i];
				}
			}
		}
	};
	
	//获取销售品下某个功能产品参数  
	var _getProdSpecParam = function(prodId,offerSpecId,itemSpecId){
		var spec = _getOfferSpec(prodId,offerSpecId);
		if(!!spec.offerRoles){
			for (var i = 0; i < spec.offerRoles.length; i++) {
				var offerRole = spec.offerRoles[i];
				for (var j = 0; j < offerRole.roleObjs.length; j++) {
					var roleObj = offerRole.roleObjs[j];
					if(roleObj.prodSpecParams !=undefined && roleObj.prodSpecParams.length>0){
						for (var k = 0; k < roleObj.prodSpecParams.length; k++) {
							if(roleObj.prodSpecParams[k].itemSpecId==itemSpecId){
								return roleObj.prodSpecParams[k];
							}
						}
					}
				}
			}
		}
	};
	
	//通过产品id获取产品已开通附属实例列表
	var _getOfferList = function (prodId){
		for ( var i = 0; i < AttachOffer.openedList.length; i++) {
			var opened = AttachOffer.openedList[i];
			if(opened.prodId == prodId){
				return opened.offerList;
			} 
		}
		return []; //如果没值返回空数组
	};
	
	//获取销售品实例构成
	var _getOffer = function(prodId,offerId){
		var offerList = _getOfferList(prodId);
		if(ec.util.isArray(offerList)){
			for ( var i = 0; i < offerList.length; i++) {
				if(offerList[i].offerId==offerId){
					return offerList[i];
				}
			}
		}
	};
	
	//根据规格ID获取销售品实例构成
	var _getOfferBySpecId = function(prodId,offerSpecId){
		var offerList = _getOfferList(prodId);
		if(ec.util.isArray(offerList)){
			for ( var i = 0; i < offerList.length; i++) {
				if(offerList[i].offerSpecId==offerSpecId){
					return offerList[i];
				}
			}
		}
	};
	
	//获取某个销售品参数  
	var _getOfferParam = function(prodId,offerId,itemSpecId){
		var offer = _getOffer(prodId,offerId);
		if(ec.util.isArray(offer.offerSpec.offerSpecParams)){
			for ( var i = 0; i < offer.offerSpec.offerSpecParams.length; i++) {
				if(offer.offerSpec.offerSpecParams[i].itemSpecId==itemSpecId){
					return offer.offerSpec.offerSpecParams[i];
				}
			}
		}
		/*if(offer.offerParamInfos!=undefined){
			for ( var i = 0; i < offer.offerParamInfos.length; i++) {
				if(offer.offerParamInfos[i].offerParamId==offerParamId){
					return offer.offerParamInfos[i];
				}
			}
		}*/
	};
	
	//获取某个实例功能产品参数  
	var _getProdInstParam = function(prodId,offerId,itemSpecId){
		var offer = _getOffer(prodId,offerId);
		if(ec.util.isArray(offer.offerMembers)){
			for (var i = 0; i < offer.offerMembers.length; i++) {
				var offerMember = offer.offerMembers[i];
				for (var j = 0; j < offerMember.prodParamInfos.length; j++) {
					for (var k = 0; k < offerMember.prodParamInfos.length; k++) {
						var prodParam = offerMember.prodParamInfos[k];
						if(prodParam.itemSpecId==itemSpecId){
							return prodParam;
						}
					}
				}
			}
		}
	};
	
	//通过产品id获取产品已选功能产品规格列表
	var _getServSpecList = function(prodId){
		for ( var i = 0; i < AttachOffer.openServList.length; i++) {
			var open = AttachOffer.openServList[i];
			if(open.prodId == prodId){
				return open.servSpecList;
			} 
		}
		return []; //如果没值返回空数组
	};
	
	//根据产品id,跟规格ID获取功能产品
	var _getServSpec = function(prodId,servSpecId){
		var servSpecList = _getServSpecList(prodId);
		if(servSpecList != undefined){
			for ( var i = 0; i < servSpecList.length; i++) {
				if(servSpecList[i].servSpecId==servSpecId){
					return servSpecList[i];
				}
			}
		}
	};
	
	//获取某个功能产品一个参数  
	var _getServSpecParam = function(prodId,servSpecId,itemSpecId){
		var servSpec = _getServSpec(prodId,servSpecId);
		if(ec.util.isArray(servSpec.prodSpecParams)){
			for (var i = 0; i < servSpec.prodSpecParams.length; i++) {
				if(servSpec.prodSpecParams[i].itemSpecId==itemSpecId){
					return servSpec.prodSpecParams[i];
				}
			}
		}
	};
	
	//通过产品id获取产品已选功能产品实例列表
	var _getServList = function(prodId){
		for ( var i = 0; i < AttachOffer.openedServList.length; i++) {
			var opened = AttachOffer.openedServList[i];
			if(opened.prodId == prodId){
				return opened.servList;
			} 
		}
		return []; //如果没值返回空数组
	};
	
	//通过功能产品id获取功能产品
	var _getServ = function(prodId,servId){
		var servList = _getServList(prodId);
		if(ec.util.isArray(servList)){
			for ( var i = 0; i < servList.length; i++) {
				if(servList[i].servId==servId){
					return servList[i];
				}
			}
		}
	};
	
	//通过功能产品id获取功能产品
	var _getServBySpecId = function(prodId,servSpecId){
		var servList = _getServList(prodId);
		if(ec.util.isArray(servList)){
			for ( var i = 0; i < servList.length; i++) {
				if(servList[i].servSpecId==servSpecId){
					return servList[i];
				}
			}
		}
	};
	
	//获取某个实例功能产品参数  
	var _getServInstParam = function(prodId,servId,itemSpecId){
		var serv = _getServ(prodId,servId);
		if(ec.util.isArray(serv.prodSpecParams)){
			for ( var i = 0; i < serv.prodSpecParams.length; i++) {
				var servParam = serv.prodSpecParams[i];
				if(servParam.itemSpecId==itemSpecId){
					return servParam;
				}
			}
		}
		/*if(ec.util.isArray(serv.prodInstParams)){
			for ( var i = 0; i < serv.prodInstParams.length; i++) {
				var servParam = serv.prodInstParams[i];
				if(servParam.itemSpecId==itemSpecId){
					return servParam;
				}
			}
		}*/
	};
	
	//获取增值业务列表
	var _getOpenAppList = function(prodId){
		for ( var i = 0; i < AttachOffer.openAppList.length; i++) {
			var open = AttachOffer.openAppList[i];
			if(open.prodId == prodId){
				return open.appList;
			} 
		}
		return []; //如果没值返回空数组
	};
	
	//根据产品id获取销售品成员
	var _getOfferMember = function(prodId){
		if(ec.util.isArray(OrderInfo.offer.offerMemberInfos)){ //销售品实例构成
			for ( var i = 0; i < OrderInfo.offer.offerMemberInfos.length; i++) {
				var offerMember = OrderInfo.offer.offerMemberInfos[i];
				if(offerMember.objInstId==prodId){
					return offerMember;
				}
			}
		}
		return {};
	};
	
	//获取功能产品互斥依赖参数
	var _getExcDepServParam = function(prodId,servSpecId){
		//互斥依赖入参
		var param = { 
			servSpecId:servSpecId,
			prodId:prodId,
			orderedServSpecIds : [] //销售品互斥依赖查询入场数组
		};
		//遍历已选功能产品
		var servSpecList = CacheData.getServSpecList(prodId);
		if(ec.util.isArray(servSpecList)){
			$.each(servSpecList,function(){ //遍历已选择功能产品
				if(this.servSpecId!=servSpecId && this.isdel!="Y" && this.isdel!="C"){
					param.orderedServSpecIds.push(this.servSpecId);
				}
			});
		}
		//遍历已选功能产品
		var servList = CacheData.getServList(prodId);
		if(ec.util.isArray(servList)){
			$.each(servList,function(){ //遍历已选择功能产品
				if(this.servSpecId!=servSpecId && this.isdel!="Y" && this.isdel!="C"){
					param.orderedServSpecIds.push(this.servSpecId);
				}
			});
		}
		return param;
	};
	
	//获取可选包互斥依赖参数
	var _getExcDepOfferParam = function(prodId,offerSpecId){
		//互斥依赖入参
		var param = {
			prodId : prodId,
			offerSpecId : offerSpecId,
			objType : CONST.OBJ_TYPE.PROD,
			orderedOfferSpecIds : [] //可选包互斥依赖查询入场数组
		};
//		if(OrderInfo.actionFlag == 2){ //套餐变更		
//			$.each(OrderInfo.offerSpec.offerRoles,function(){
//				if(ec.util.isArray(this.prodInsts)){
//					$.each(this.prodInsts,function(){
//						if(this.prodInstId==prodId){
//							param.objId=this.objId;
//							return false;
//						}
//					});
//				}
//			});
//		}else if(OrderInfo.actionFlag == 3){  //可选包
//			param.objId=order.prodModify.choosedProdInfo.productId;
//		}else { //新装
//			var prodInst = OrderInfo.getProdInst(prodId);
//			if(prodInst){
//				param.objId=prodInst.objId;
//			}
//		}
		var offerSpec=CacheData.getOfferSpec(prodId,offerSpecId);
		if(ec.util.isObj(offerSpec)){
			if(ec.util.isArray(offerSpec.offerRoles)){
				$.each(offerSpec.offerRoles,function(){
					if(ec.util.isArray(this.roleObjs)){
						$.each(this.roleObjs,function(){
							if(this.objType==CONST.OBJ_TYPE.PROD){
								param.offerRoleId = this.offerRoleId;
								param.objId=this.objId;
								return false;
							}
						});
					}
				});
			}
		}else{
			var offer=CacheData.getOfferBySpecId(prodId,offerSpecId);
			if(ec.util.isObj(offer)){
				param.offerRoleId = offer.offerRoleId;
				if(ec.util.isArray(offer.offerMemberInfos)){
					$.each(offer.offerMemberInfos,function(){
						if(this.objType==CONST.OBJ_TYPE.PROD){
							param.objId=this.objId;
							return false;
						}
					});
				}
			}
		}
		//已开通销售品列表(和后台约定，前台不传已订购的附属销售品，防止影响续约的)
//		var offerList = CacheData.getOfferList(prodId); 
//		if(ec.util.isArray(offerList)){
//			$.each(offerList,function(){
//				if(this.offerSpecId!=offerSpecId && this.isdel!="Y"  && this.isdel!="N"){
//					if(this.offerSpecId!=undefined){
//						param.orderedOfferSpecIds.push(this.offerSpecId);
//					}
//				}
//			});
//		}
		//已选销售品列表
		var offerSpecList = CacheData.getOfferSpecList(prodId); 
		if(ec.util.isArray(offerSpecList)){
			$.each(offerSpecList,function(){
				if(this.offerSpecId!=offerSpecId && this.isdel!="Y"){
					if(this.offerSpecId!=undefined){
						param.orderedOfferSpecIds.push(this.offerSpecId);
					}
				}
			});
		}
		return param;
	};
	
	var _parseServ = function(data,prodId){
		if(ec.util.isObj(data)){
			if(ec.util.isArray(data.result.servSpec)){
				for (var i = 0; i < data.result.servSpec.length; i++) {
					var servSpec = data.result.servSpec[i];
					var serv = CacheData.getServBySpecId(prodId,servSpec.servSpecId); //已开通里面查找
					var newSpec = CacheData.getServSpec(prodId,servSpec.servSpecId); //已选里面查找
					if(servSpec.ifDault==0){
						if(ec.util.isObj(serv)){
							var $dd = $("#li_"+prodId+"_"+serv.servId);
							if(ec.util.isObj($dd)){
								var $span = $("#span_"+prodId+"_"+serv.servId);
								var $span_remove = $("#span_remove_"+prodId+"_"+serv.servId);
								if(ec.util.isObj($span)){
									$span.removeClass("del");
								}
								if(ec.util.isObj($span_remove)){
									$span_remove.hide();
								}
								$dd.removeAttr("onclick");
								serv.isdel = "N";
							}
						}	
						else if(ec.util.isObj(newSpec)){
							var $dd = $("#li_"+prodId+"_"+newSpec.servSpecId);
							if(ec.util.isObj($dd)){
								var $span = $("#span_"+prodId+"_"+newSpec.servSpecId);
								var $span_remove = $("#span_remove_"+prodId+"_"+newSpec.servSpecId);
								if(ec.util.isObj($span)){
									$span.removeClass("del");
								}
								if(ec.util.isObj($span_remove)){
									$span_remove.hide();
								}
								$dd.removeAttr("onclick");
								newSpec.isdel = "N";
							}
						}else {
							if(OrderInfo.actionFlag==2){//套餐变更
								servSpec.isdel = "C";
								CacheData.setServSpec(prodId,servSpec);
								AttachOffer.addOpenServList(prodId,servSpec.servSpecId,servSpec.servSpecName,servSpec.ifParams);
								//AttachOffer.checkServExcludeDepend(prodId,servSpec);
							}
						}
					}else if((OrderInfo.actionFlag==2||OrderInfo.actionFlag==21 ||OrderInfo.actionFlag==22 )&&servSpec.ifDault==1){//套餐变更需要展示默认的功能产品
						if(ec.util.isObj(serv)){
							var $dd = $("#li_"+prodId+"_"+serv.servId);
							if(ec.util.isObj($dd)){
								var $span = $("#span_"+prodId+"_"+serv.servId);
								if(ec.util.isObj($span)){
									$span.removeClass("del");
								}
								serv.isdel = "N";
							}
						}	
						else if(ec.util.isObj(newSpec)){
							var $dd = $("#li_"+prodId+"_"+newSpec.servSpecId);
							if(ec.util.isObj($dd)){
								var $span = $("#span_"+prodId+"_"+newSpec.servSpecId);
								if(ec.util.isObj($span)){
									$span.removeClass("del");
								}
								newSpec.isdel = "N";
							}
						}else {
							servSpec.isdel = "C";
							CacheData.setServSpec(prodId,servSpec);
							AttachOffer.addOpenServList(prodId,servSpec.servSpecId,servSpec.servSpecName,servSpec.ifParams);
							//AttachOffer.checkServExcludeDepend(prodId,servSpec);
						}
					}
				}
			}
		}
	};
	
	var _parseOffer = function(data,prodId){
		if(ec.util.isObj(data)){
			if(ec.util.isArray(data.result.offerSpec)){
				for (var i = 0; i < data.result.offerSpec.length; i++) {
					var offerSpec = data.result.offerSpec[i];
					if(offerSpec.ifDault==0){
						var offer = CacheData.getOfferBySpecId(prodId,offerSpec.offerSpecId); //已开通里面查找
						if(ec.util.isObj(offer)){
							var $dd = $("#li_"+prodId+"_"+offer.offerId);
							if(ec.util.isObj($dd)){
								var $span = $("#span_"+prodId+"_"+offer.offerId);
								var $span_remove = $("#span_remove_"+prodId+"_"+offer.offerId);
								if(ec.util.isObj($span)){
									$span.removeClass("del");
								}
								if(ec.util.isObj($span_remove)){
									$span_remove.hide();
								}
								$dd.removeAttr("onclick");
								offer.isdel = "N";
							}
						}
						var newSpec = CacheData.getOfferSpec(prodId,offerSpec.offerSpecId); //已开通里面查找
						if(ec.util.isObj(newSpec)){
							var $dd = $("#li_"+prodId+"_"+newSpec.offerSpecId);
							if(ec.util.isObj($dd)){
								var $span = $("#span_"+prodId+"_"+newSpec.offerSpecId);
								var $span_remove = $("#span_remove_"+prodId+"_"+newSpec.offerSpecId);
								if(ec.util.isObj($span)){
									$span.removeClass("del");
								}
								if(ec.util.isObj($span_remove)){
									$span_remove.hide();
								}
								$dd.removeAttr("onclick");
								newSpec.isdel = "N";
							}
						}else {
							if(OrderInfo.actionFlag==2){
								offerSpec.isdel = "C";
								CacheData.setOfferSpec(prodId,offerSpec);
								var param = CacheData.getExcDepOfferParam(prodId,offerSpec.offerSpecId);
								AttachOffer.addOpenList(prodId,offerSpec.offerSpecId); 
								if(param.orderedOfferSpecIds.length > 0 ){
									var ruleData = query.offer.queryExcludeDepend(param);//查询规则校验
									if(ruleData!=undefined && ruleData.result!=undefined){
										var excludes = ruleData.result.offerSpec.exclude;
										if(ec.util.isArray(excludes)){ //有互斥
											//删除已开通
											for (var i = 0; i < excludes.length; i++) {
												var excludeSpecId = excludes[i];
												var offer = CacheData.getOfferBySpecId(prodId,excludeSpecId);
												if(offer!=undefined){
													var $dd = $("#li_"+prodId+"_"+offer.offerId);
													if(ec.util.isObj($dd)){
														var $span = $("#span_"+prodId+"_"+offer.offerId);
														var $span_remove = $("#span_remove_"+prodId+"_"+offer.offerId);
														if(ec.util.isObj($span)){
															$span.addClass("del");
														}
														if(ec.util.isObj($span_remove)){
															$span_remove.hide();
														}
														$dd.removeAttr("onclick");
														offer.isdel = "N";
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	};
	
	//获取产品对应的角色
	var _getOfferRoleId = function(prodId){
		var offerRoleId = "";
		if(prodId>0){ //二次业务
			if(OrderInfo.offer.offerMemberInfos!=undefined){
				$.each(OrderInfo.offer.offerMemberInfos,function(i){
					if(this.objInstId == prodId){
						offerRoleId = this.offerRoleId;  //角色ID
						return false;
					}
				});
			}
		}else if(prodId<0){ //新装
			if(OrderInfo.offerSpec.offerRoles!=undefined){
				$.each(OrderInfo.offerSpec.offerRoles,function(i){
					var roleId = this.offerRoleId;  //角色ID
					if(this.prodInsts!=undefined){
						$.each(this.prodInsts,function(){
							if(this.prodInstId == prodId){
								offerRoleId = roleId;
								return false;
							}
						});
					}
				});
			}
		}
		return offerRoleId;
	};
	
	//重新排列offerMemberInfos 把按顺序把主卡角色提前
	var _sortOffer = function(data){
		var tmpOfferMemberInfos = [];
		for ( var i = 0; i < data.offerMemberInfos.length; i++) {
			var offerMember = data.offerMemberInfos[i];
			if(offerMember.roleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD){ //主卡
				tmpOfferMemberInfos.push(offerMember);
			}
		}
		for ( var i = 0; i < data.offerMemberInfos.length; i++) {
			var offerMember = data.offerMemberInfos[i];
			if(offerMember.roleCd!=CONST.MEMBER_ROLE_CD.MAIN_CARD){
				tmpOfferMemberInfos.push(offerMember);
			}
		}
		data.offerMemberInfos = tmpOfferMemberInfos;
	};

	//把选中的销售品保存到依赖或互斥的销售品规格中
	var _setOffer2ExcludeOfferSpec = function(param){
		if(param.dependOffer.offerGrpInfos.length>0){  // 依赖组
			var dependOffer=param.dependOffer;
			for (var i = 0; i < dependOffer.offerGrpInfos.length; i++) {
				var offerGrpInfo = dependOffer.offerGrpInfos[i];
				var $offerSpecs = $("input[name="+offerGrpInfo.grpId+"]:checked");
				var len  = $offerSpecs.length;
				dependOffer.offerGrpInfos[i].checkLen=len;
				for(var j=0;j<offerGrpInfo.subOfferSpecInfos.length;j++){
					var subOfferSpecInfo=offerGrpInfo.subOfferSpecInfos[j];
					$offerSpecs.each(function(){
						if($(this).val()==subOfferSpecInfo.offerSpecId){
							subOfferSpecInfo.isCheck=true;
						}
					});
				}
			}
		}
	};
	return {
		setParam				: _setParam,
		setServParam			: _setServParam,
		setOfferSpec			: _setOfferSpec,
		setServSpec				: _setServSpec,
		setServ2OfferSpec		: _setServ2OfferSpec,
		setOffer2ExcludeOfferSpec:_setOffer2ExcludeOfferSpec,
		sortOffer				: _sortOffer,
		getParamContent			: _getParamContent,
		getOfferSpecList		: _getOfferSpecList,
		getOfferSpec			: _getOfferSpec,
		getSpecParam			: _getSpecParam,
		getOfferList			: _getOfferList,
		getOffer				: _getOffer,
		getOfferParam			: _getOfferParam,
		getOfferBySpecId		: _getOfferBySpecId,
		getServList				: _getServList,
		getServ					: _getServ,
		getServBySpecId			: _getServBySpecId,
		getServSpec				: _getServSpec,
		getServSpecList			: _getServSpecList,
		getProdInstParam		: _getProdInstParam,
		getProdSpecParam		: _getProdSpecParam,
		getServInstParam		: _getServInstParam,
		getServSpecParam		: _getServSpecParam,
		getOfferProdStr			: _getOfferProdStr,
		getOpenAppList			: _getOpenAppList,
		getAppContent			: _getAppContent,
		getOfferMember			: _getOfferMember,
		getExcDepServParam		: _getExcDepServParam,
		getExcDepOfferParam		: _getExcDepOfferParam,
		getOfferRoleId 			: _getOfferRoleId,
		parseServ				: _parseServ,
		parseOffer				: _parseOffer
	};
})();
/**
 * 客户资料管理
 * @createUser 吴克府
 */
CommonUtils.regNamespace("cust", "mgr");

cust.mgr = (function(){
	
	//创建客户
    var _custCreate = function() {
	    $('#custCreateForm').off('formIsValid').on('formIsValid',function(event) {
	    	var url=contextPath+"/order/createorderlonger";
			var response = $.callServiceAsJson(url, {});
			if(response.code==0){
				OrderInfo.custorderlonger=response.data;
			}
			_checkIdentity();
	     }).ketchup({bindElement:"btn_cust_create_save"});
    };
	
	
	
	
	
	
	
	
	
	var _called = false;
	var _choosedCustInfo = {};
	var _createCustInfo = {};
	var _custInfo = null;
	var _authFlag = null;
	var _fromProvFlag = "0"; //省份甩单标志
	var _provIsale = null; //省份isale流水号
	//客户鉴权跳转权限
	var _jumpAuthflag="";
	//客户属性
	var _partyProfiles =[];
	//客户属性分页列表
	var _profileTabLists =[];
	
	var _getCustInfo = function() {
		return _custInfo;
	};
	var _orderBtnflag="";
	//绑定鉴权事件
	var _bindChkAuth = function(){
		$('#custAuthForm').off("formIsValid").on('formIsValid', function(event, form) {
			var param = _choosedCustInfo;
			param.prodPwd = $.trim($("#authPassword").val());
			param.accessNumber=_choosedCustInfo.accessNumber;
			param.authFlag=_authFlag;
			$.callServiceAsHtml(contextPath+"/cust/custAuth",param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
				},"done" : function(response){
					if (response.code == -2) {
						return;
					}
					if(response.data.indexOf("false") >=0) {
						$.alert("提示","抱歉，您输入的密码有误，请重新输入。");
						return;
					}
					//判断能否转为json，可以的话返回的就是错误信息
					try {
						var errorData = $.parseJSON(response.data);
						$.alertMore("异常信息", errorData.resultMsg, errorData.errorStack,"error");
						return;
					} catch(e){
						
					}
					_custInfo = param;
					OrderInfo.boCusts.prodId=-1;
					OrderInfo.boCusts.partyId=_choosedCustInfo.custId;
					OrderInfo.boCusts.partyProductRelaRoleCd="0";
					OrderInfo.boCusts.state="ADD";
					OrderInfo.boCusts.norTaxPayer=_choosedCustInfo.norTaxPayer;
					
					OrderInfo.cust = _choosedCustInfo;
					_custAuthCallBack(response);
				},"always":function(){
					$.unecOverlay();
				}
			});
		}).ketchup({bindElement:"custAuthbtn"});
	}
	//客户类型选择事件 ok
	var _partyTypeCdChoose = function(scope,id) {
		var partyTypeCd=$(scope).val();
		_certTypeByPartyType(partyTypeCd,id);
		//创建客户确认按钮
		_custCreateButton();

	};
	//客户类型关联证件类型下拉框     ok
	var _certTypeByPartyType = function(_partyTypeCd,id){
		var _obj = $("#"+id);
		$.callServiceAsJson(contextPath+"/cust/queryCertType", {"partyTypeCd":_partyTypeCd}, {
			"before":function(){
			},"done" : function(response){
				if (response.code == -2) {
					$.alertM(response.data);
					return false;
			  	}
			   	if (response.code == 1002) {
					$.alert("错误","根据员工类型查询员工证件类型无数据,请配置","information");
					return;
			   	}
			   	if(response.code==0){
					var data = response.data ;
					if(data!=undefined && data.length>0){
						//去除重复的证件类型编码
						var uniData = [];
						for(var i=0;i<data.length;i++){
							var unique = true;
							for(var j=0;j<uniData.length;j++){
								unique = unique && data[i].certTypeCd != uniData[j].certTypeCd;
								if(!unique){
									break;
								}
							}
							if(unique){
								uniData.push(data[i]);
							}
						}
						for(var i=0;i<uniData.length;i++){
							var certTypedate = uniData[i];
							_obj.append("<option value='"+certTypedate.certTypeCd+"' >"+certTypedate.name+"</option>");
						}
						//jquery mobile 需要刷新才能生效
						_obj.selectmenu().selectmenu('refresh');
						if(id=='identidiesTypeCd'){
							//创建客户证件类型选择事件
							_identidiesTypeCdChoose($("#"+id).children(":first-child"),"cCustIdCard");
						}
					}
				}
			},fail:function(response){
			},always:function(){
				
			}
	   });
	};
	//客户定位证件类型选择事件  ok
	var _custidentidiesTypeCdChoose = function(scope,id) {
		var identidiesTypeCd=$(scope).val();
		if(identidiesTypeCd==-1){
			$("#"+id).attr("placeHolder","请输入接入号码");
			$("#"+id).attr("data-validate","validate(required:请准确填写接入号码) on(blur)");
		}else if (identidiesTypeCd==1){
			$("#"+id).attr("placeHolder","请输入身份证号码");
			$("#"+id).attr("data-validate","validate(idCardCheck:请准确填写身份证号码) on(blur)");
		}else if(identidiesTypeCd==2){
			$("#"+id).attr("placeHolder","请输入军官证");
			$("#"+id).attr("data-validate","validate(required:请准确填写军官证) on(blur)");
		}else if(identidiesTypeCd==3){
			$("#"+id).attr("placeHolder","请输入护照");
			$("#"+id).attr("data-validate","validate(required:请准确填写护照) on(blur)");
		}else{
			$("#"+id).attr("placeHolder","请输入证件号码");
			$("#"+id).attr("data-validate","validate(required:请准确填写证件号码) on(blur)");
		}
		if(identidiesTypeCd!=-1){
			$("#isAppointNum").val("0").slider().slider("refresh");
		}
		_custLookforButton();

	};
	//创建客户证件类型选择事件
	var _identidiesTypeCdChoose = function(scope,id) {
		var identidiesTypeCd=$(scope).val();
		var _obj = $("#"+id);
		if(identidiesTypeCd==1){
			_obj.attr("placeHolder","请输入合法身份证号码");
			_obj.attr("data-validate","validate(idCardCheck18:请输入合法身份证号码) on(blur)");
		}else if(identidiesTypeCd==2){
			_obj.attr("placeHolder","请输入合法军官证");
			_obj.attr("data-validate","validate(required:请准确填写军官证) on(blur)");
		}else if(identidiesTypeCd==3){
			_obj.attr("placeHolder","请输入合法护照");
			_obj.attr("data-validate","validate(required:请准确填写护照) on(blur)");
		}else{
			_obj.attr("placeHolder","请输入合法证件号码");
			_obj.attr("data-validate","validate(required:请准确填写证件号码) on(blur)");
		}
		_custCreateButton();

	};
	//客户资料查询 ok 
	 var _custLookforButton = function() {
		//客户定位查询按钮
		$('#custQueryFirstForm').off('formIsValid').on('formIsValid', function(event, form) {
			var identityCd="";
			var idcard="";
			var diffPlace="";
			var acctNbr="";
			var identityNum="";
			var queryType="";
			var queryTypeValue="";
			identityCd=$("#p_cust_identityCd").val();
			identityNum=$.trim($("#p_cust_identityNum").val());
			//判断是否是号码或身份证输入
	
			//省份甩单定位客户不需要进行客户鉴权
			if(order.cust.mgr.fromProvFlag == "1" || (identityCd!=-1 && CONST.getAppDesc()!=0)){
				identityCd=$("#p_cust_identityCd").val();
				_authFlag="1";
			}else{
				//4G所有证件类型定位都需要客户鉴权
				_authFlag="0";
			}
			if(identityCd==-1){
				acctNbr=identityNum;
				identityNum="";
				identityCd="";
			}else if(identityCd=="acctCd"||identityCd=="custNumber"){
				acctNbr="";
				identityNum="";
				identityCd="";
				queryType=$("#p_cust_identityCd").val();
				queryTypeValue=$.trim($("#p_cust_identityNum").val());
	
			}
			diffPlace=$("#DiffPlaceFlag").val();
			areaId=$("#p_cust_areaId").val();
			//lte进行受理地区市级验证
			if(CONST.getAppDesc()==0&&areaId.indexOf("0000")>0){
				$.alert("提示","省级地区无法进行定位客户,请选择市级地区！");
				return;
			}
			var param = {
				"acctNbr"		:acctNbr,
				"identityCd"	:identityCd,
				"identityNum"	:identityNum,
				"partyName"		:"",
				"custQueryType"	:$("#custQueryType").val(),
				"diffPlace"		:diffPlace,
				"areaId" 		:areaId,
				"queryType" 	:queryType,
				"queryTypeValue":queryTypeValue
			};
			$.callServiceAsHtml(contextPath+"/pad/cust/queryCust",param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
				},"done" : function(response){
					if (response.code == -2) {
						return;
					}
					_queryCallBack(response);
				},fail:function(response){
					$.unecOverlay();
					$.alert("提示","查询失败，请稍后再试！");
				},"always":function(){
					$.unecOverlay();
					$("#usersearchbtn").attr("disabled",false);
				}
			});
		}).ketchup({bindElement:"a_user_search"});
	 };
	//创建客户确认按钮
    var _custCreateButton = function() {
	    $('#custCreateForm').off('formIsValid').on('formIsValid',function(event) {
	    	var url=contextPath+"/order/createorderlonger";
			var response = $.callServiceAsJson(url, {});
			if(response.code==0){
				OrderInfo.custorderlonger=response.data;
			}
			_checkIdentity();
	     }).ketchup({bindElement:"btn_cust_create_save"});
    };
	//客户查询列表 ok
	var _queryCallBack = function(response) {
		if(response.data.indexOf("false") >=0) {
			$.alert("提示","抱歉，没有定位到客户，请尝试其他客户。");
			return;
		}
		var _qry_result = $("#div_user_qry_result");
		_qry_result.find("ul").html(response.data);
		$("#a_cust_qry_back").off("tap").on("tap",function(event) {
			_authFlag="";
		});
		$.jqmRefresh(_qry_result);
	};
	
	// 客户重新定位 ok
	var _custReset = function() {
		//填单页面
		//if(0!=OrderInfo.order.step){
			window.location.reload();
		//}
		$("#custQueryFirstForm").show();
		$("#custInfo").hide();
		$("#p_cust_identityNum").val("");
		$("#authPassword").val("");
		_authFlag="";
		OrderInfo.boCusts.partyId="";
		//新建客户
		OrderInfo.boCustInfos.name="";
		OrderInfo.boCustIdentities.identityNum="";
		OrderInfo.cust = {
			custId:-1,	
			custName : "",
			areaId:""
		};
		//定位客户
		OrderInfo.boCusts.prodId=-1;
		OrderInfo.boCusts.partyId="";
		OrderInfo.boCusts.partyProductRelaRoleCd="0";
		OrderInfo.boCusts.state="ADD";
		OrderInfo.cust = "";
		//已订购查询是不是查询标志
		_orderBtnflag="";
		//填单步骤
		OrderInfo.order.step=0;
		if((CONST.getAppDesc()!=0)&&($("#custModifyId").is(":hidden"))){
			$("#a-cust-modify").show();
		}
		
	};
	
	//客户鉴权 ok
	var _custAuth = function(scope) {
		var param = _choosedCustInfo;
		param.prodPwd = $.trim($("#authPassword").val());
		param.authFlag=_authFlag;
		$.callServiceAsHtml(contextPath+"/cust/custAuth",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","客户鉴权失败,稍后重试");
					return;
				}
				_custInfo = param;
				OrderInfo.boCusts.prodId=-1;
				OrderInfo.boCusts.partyId=_choosedCustInfo.custId;
				OrderInfo.boCusts.partyProductRelaRoleCd="0";
				OrderInfo.boCusts.state="ADD";
				OrderInfo.boCusts.norTaxPayer=_choosedCustInfo.norTaxPayer;
				
				OrderInfo.cust = _choosedCustInfo;
				_custAuthCallBack(response);
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	//跳过验证 ok
	var _jumpAuth = function() {
		if(order.cust.mgr.jumpAuthflag!="0"){
			$.alert("提示","没有跳过校验权限！");
			return;
		}
		var param = _choosedCustInfo;
		param.authFlag="1";
		$.callServiceAsHtml(contextPath+"/pad/cust/custAuth",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","客户鉴权失败,稍后重试");
					return;
				}
				_custInfo = param;
				OrderInfo.boCusts.prodId=-1;
				OrderInfo.boCusts.partyId=_choosedCustInfo.custId;
				OrderInfo.boCusts.partyProductRelaRoleCd="0";
				OrderInfo.boCusts.state="ADD";
				OrderInfo.boCusts.norTaxPayer=_choosedCustInfo.norTaxPayer;
				
				OrderInfo.cust = _choosedCustInfo;
				_custAuthCallBack(response);
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	//鉴权回调 ok
	var _custAuthCallBack = function(response) {
		if(_authFlag=="0"){
			$("#dlg-chk-auth").popup("close");
		}
		//隐藏查询选项,展示查询后结果
		$("#custQueryFirstForm").hide();
		$("#custInfo").html(response.data).show().enhanceWithin();
		
		if((OrderInfo.boCusts.partyId != "-1" && OrderInfo.boCusts.partyId != ""	
			 && OrderInfo.boCusts.partyId != undefined) && order.prodModify.lteFlag == true){
			$("#a-cust-modify").hide();
		}else{
			$("#a-cust-modify").show();
			$("#a-cust-modify").off("tap").on("tap",order.prodModify.showCustInfoModify);
		}
		//绑定事件
		$("#a-cust-rechk").off("tap").on("tap",_custReset);
		$("#a-qry-cust-prod").off("tap").on("tap",_btnQueryCustProdMore);
		$("#cCustName").val("");
		$("#cCustIdCard").val("");
		
		main.home.hideMainIco();
		
	};
	//客户列表点击 ok
	var _showCustAuth = function(scope) {
		var _this = $(scope);
		_choosedCustInfo = {
			custId 			: _this.attr("custId"),
			partyName 		: _this.attr("partyName"),
			idCardNumber 	: _this.attr("idCardNumber"),
			identityName 	: _this.attr("identityName"),
			areaName 		: _this.attr("areaName"),
			areaId 			: _this.attr("areaId"),
			identityCd 		: _this.attr("identityCd"),
			addressStr 		: _this.attr("addressStr"),
			norTaxPayer 	: _this.attr("norTaxPayer"),
			segmentId 		: _this.attr("segmentId"),
			segmentName 	: _this.attr("segmentName"),
			custFlag 		: _this.attr("custFlag"),
			vipLevel 		: _this.attr("vipLevel"),
			vipLevelName 	: _this.attr("vipLevelName")
		};
		if(_authFlag=="0"){
			if(order.cust.mgr.authType == '00'){//动态追加,内部没定义
				$("#custAuthTypeName").html("客户密码：");
			} else {
				$("#custAuthTypeName").html("产品密码：");
			}
			if(order.cust.mgr.jumpAuthflag=="0"){
				$("#jumpAuth").show();
				$("#jumpAuth").off("tap").on("tap",_jumpAuth);
			}else{
				$("#jumpAuth").hide();				
			}
			$("#authPassword").val("");
			$("#custAuthbtn").off("tap").on("tap",_bindChkAuth);
			
			$("#dlg-chk-auth").popup("open");
		} else{
			_custAuth(scope);
		}
	};
	//创键客户 ok
	var _showCustCreate = function() {
		var areaId=$("#p_cust_areaId").val();
		if(areaId.indexOf("0000")>0){
			$.alert("提示","前页受理地区为省级地区无法进行创建,请先选择市级地区！");
			return;
		}
		$.callServiceAsHtmlGet(contextPath+"/pad/cust/create.html",{},{
			"done" : function(response){
				if (!response || !response.data) {
					return;
				}
				//统一弹出框
				var popup = $.popup("#div_cust_create",response.data,{
					cache:true,
					width:$(window).width()-200,
					height:$(window).height(),
					contentHeight:$(window).height()-120,
					afterClose:function(){if($.ketchup) $.ketchup.hideAllErrorContainer($("#custCreateForm"));}
				});
				//由于脚本静态,所以要清理之前有可能创建的客户资料信息
				$("#div_cust_create input[type='text']").val("");
				//初始化页面数据
				_partyTypeCdChoose($("#partyTypeCd").children(":first-child"),"identidiesTypeCd");
				_spec_parm_show();
				//更多属性默认隐藏,并绑定打开事件
				popup.find("div[data-role='collapsible']").collapsible({
				  	collapsed: true,
					collapse: function( event, ui ) {
						$("#contactName").attr("data-validate","");
						_custCreateButton();
					},
				  	expand: function(event,ui) {
						$("#contactName").attr("data-validate","validate(required:请准确填写联系人名称) on(blur)").attr("placeholder","请准确填写联系人名称");
						_custCreateButton();
				  	}
				});
			}});
	};
	
	var _linkSelectPlan=function(selected){
		//二层选择取消
		$("#plan2ndDiv tbody tr").removeClass("plan_select2");
		//勾取消
		$("#plan2ndDiv tbody tr").children(":first-child").next().html("");
		$(selected).addClass("plan_select2");
		//打勾操作
		var nike="<i class='select'></i>";
		$(selected).children(":first-child").next().html(nike);
		order.prodModify.getChooseProdInfo();
		
	};
	//已订购业务查询 入口 ok
	_btnQueryCustProdPrepare = function(){
		$.callServiceAsHtmlGet(contextPath+"/pad/cust/orderProdPrepare.html",{"diffPlaceFlag":$("#diffPlaceFlag").val()},{
			"before":function(){
				//$.ecOverlay("<strong>查询中,请稍等...</strong>");
			},
			"always":function(){
				//$.unecOverlay();
			},
			"done" : function(response){
				if(!response || response.code != 0) {
					$.alert("提示","已订购业务查询失败,稍后重试");
					return;
				}
				$.popup("#dlg_cust_prod",response.data,{
					width:$(window).width()-200,
					height:$(window).height(),
					contentHeight:$(window).height()-120,
					afterClose:function(){},
					cache:true
				});
				$(".ui-panel-inner > .ui-listview").height($(window).height());
				_btnQueryCustProd(1);
			}
		});
	}
	//已订购业务 页面 ok
	var _btnQueryCustProdMore=function(){
		if(OrderInfo.cust.custId==-1){
			$.alert("提示","新建客户无法查询已订购业务！");
			return;
		}		
		//初次查询
		if(_orderBtnflag==""){
			_btnQueryCustProdPrepare();
			_orderBtnflag="1";
			//二次进入
		}else if(_orderBtnflag=="1"){
			$("#dlg_cust_prod").popup("open",{transition:"slide"});
			_orderBtnflag="1";
			//关闭
		}else{
			$("#dlg_cust_prod").popup("close");
			_orderBtnflag="1";
		}
	};
	//已订购业务查询分页   ok
	var _btnQueryCustProd=function(curPage,scroller){
		//收集参数
		var param={};
		if(!_choosedCustInfo || !$.isPlainObject(_choosedCustInfo) || $.isEmptyObject(_choosedCustInfo)){
			param.custId="";
		}else{
			param.custId=_choosedCustInfo.custId;
			param.areaId =$("#area").attr("areaId");
		}
		//产品号码查询条件
		if($("#accNbrQuery").length == 1){
			param.acctNbr=$.trim($("#accNbrQuery").val());
			if(CONST.getAppDesc()==0){
				param.areaId=$("#p_cust_areaId").val();
			}
			//是否指定号码
		} else if($("#isAppointNum").attr("value")=="1"){
			param.acctNbr=$.trim($("#p_cust_identityNum").val());
			if(CONST.getAppDesc()==0){
				param.areaId=$("#p_cust_areaId").val();
			}
		}else {
			param.acctNbr="";
		}
		param.pageSize="8";
		param.curPage=curPage;
		//param.diffPlaceFlag=$("#diffPlaceFlag").val();
		if(!(param.custId) || param.custId==""){
			$.alert("提示","无法查询已订购产品");
			return;
		}
		//订购产品查询
		var url = contextPath+"/pad/cust/orderprod";
		$.callServiceAsHtmlGet(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response || response.code != 0) {
					$.alert("提示","查询失败,稍后重试");
					return;
				}
				//填充数据,
				var ul$ = $("#dlg_cust_prod").find("ul:first");
				if(curPage == 1)ul$.html(response.data);
				else ul$.append(response.data);
				ul$.listview().listview("refresh");
				//绑定每行合约tap事件 父级
				ul$.find("li").off("tap").on("tap",function(){
					var _this = $(this);
					if(_this.hasClass("multi")){
						if(_this.next(".multidiv").is(":hidden")){
							_this.next(".multidiv").show().siblings(".multidiv").hide();
						} else {
							_this.next(".multidiv").hide().siblings(".multidiv").hide();
						}
					}
					_chk2ndOrderFinish(this,function(){
						_this.addClass("userorderlistlibg").siblings().removeClass("userorderlistlibg");
						$("#div_2nd_order").panel( "open" );
					});
				});
				//子级
				ul$.find("div.multidiv li").off("tap").on("tap",function(){
					_chk2ndOrderFinish(this,function(){
						$(this).addClass("userorderlistlibg").siblings().removeClass("userorderlistlibg").parent().siblings("li").removeClass("userorderlistlibg");
						$("#div_2nd_order").panel( "open" );
						order.prodModify.getChooseProdInfo();
					});
				});
				//如果存在数据,默认选中首行
				ul$.find("li:first").trigger("tap").next("div.multidiv li:first").trigger("tap");
				order.prodModify.getChooseProdInfo();
			}
		});	
	};
	//判断二次业务办理时,切换已订购
	var _chk2ndOrderFinish = function(obj,cb){
		if(1==OrderInfo.order.step&&(!$(obj).hasClass("userorderlistlibg"))){
			$.confirm("确认","你已重新选择号码，需跳转至上一步，是否确认?",{
				yes:function(){
					_cancel();
					OrderInfo.order.step=0;
					cb.apply(this,[]);
				},
				no:function(){}
			});
		}else if(2==OrderInfo.order.step&&(!$(obj).hasClass("userorderlistlibg"))){
			$.confirm("确认","你已重新选择号码，需取消订单，是否确认?",{
				yes:function(){
					SoOrder.orderBack();
					_cancel();
					OrderInfo.order.step=0;
					cb.apply(this,[]);
				},
				no:function(){}
			});
		}else{
			cb.apply(this,[]);
		}
	}
	
	//定位客户选择地区 ok
	var _chooseArea = function(){
		order.pad.area.chooseAreaTree("order/prepare","p_cust_areaId_val","p_cust_areaId",3);
	};
	//客户信息查询户选择地区
	var _preQueryCustChooseArea = function(){
		order.area.chooseAreaTreeManger("cust/preQueryCust","p_areaId_val","p_areaId",3);
	};
	//异地定位客户选择地区
	var _chooseAllArea = function(){
		order.area.chooseAreaTreeAll("p_cust_areaId_val","p_cust_areaId",3,"limitProvince");
	};
	//新建客户选择地区
	var _newCustChooseArea = function(){
		order.area.chooseAreaTree("order/prepare","p_ncust_areaId_val","p_ncust_areaId",3);
	};
	//已订购选择地区
	var _prodChooseArea = function(){
		order.area.chooseAreaTree("order/prepare","prodareaName","prodareaid",3);
		order.prodModify.choosedProdInfo.areaId=$("#prodareaid").val();
	};
	//定位客户证件类型下拉框 ok
	var _init = function(){
		$("#p_cust_identityCd").off("change").on("change",function(){
			_custidentidiesTypeCdChoose($(this).find("option:selected"),"p_cust_identityNum");
			$("#p_cust_identityCd").selectmenu().selectmenu('refresh');
		})
		_certTypeByPartyType("-1","p_cust_identityCd"); //客户定位也使用根据客户类型查询证件类型接口，p_cust_identityCd=-1表示查询所有已关联的证件类型
		$("#isAppointNum").off("change").on("change",_isAppointNum);
		//省份甩单，自动定位客户
		_checkAutoCustQry();
		//绑定创建客户事件
		$("#a_user_create").off("tap").on("tap",_showCustCreate);
		//绑定查询校验事件
		_custLookforButton();
	};
	//使用带入的客户信息自动定位客户 ok
	var _checkAutoCustQry = function(){
		if($("#fromProvFlag").length && $("#fromProvFlag").val() == "1"){
			order.cust.mgr.fromProvFlag = "1";
			order.cust.mgr.provIsale = $("#provIsale").val();
			$("#p_cust_areaId_val").val("");
			$("#p_cust_areaId").val($("#provAreaId").val());
			$("#p_cust_identityCd").val($("#provIdentityCd").val());
			$("#p_cust_identityNum").val($("#provIdentityNum").val());
			if($("#provIdentityCd").val()!=-1){
				$("#isAppointNum").attr("checked",false);
			}
			$("#a_user_search").click();
		} else {
			order.cust.fromProvFlag = "0";
			order.cust.provIsale = null;
		}
	};
	//客户所有属性初始化-展示 ok
	var _spec_parm_show = function(){
		$.callServiceAsHtmlGet(contextPath + "/pad/cust/partyProfileSpecList",{}, {
			"before":function(){
				$.ecOverlay("<strong>加载更多属性,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},"fail":function(){
				$.alert("提示","属性加载异常,请稍后重试.");
				$.unecOverlay();
			},
			"done" : function(response){
				if (response.code == -2) {
					return;
				}
				var pp = $("#partyProfile").html(response.data);
				$("#otabs li").on("tap",function(){_changeLabel($(this));});
				$.jqmRefresh(pp);
			}
		});	
		
	};
	
	//查询客户详情
	var _queryCustDetail = function(_custId){
		var param = {
				partyId : _custId,
				areaId : $("#p_areaId").val()
		};
		$.callServiceAsHtml(contextPath+"/cust/custInfo", param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				if (response.code == -2) {
					return;
				}
				if(!response){
					response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>no data return,please try reload.</strong></div>';					
				}
				if(response.data =="fail\r\n"){
					$.alert("提示","查询失败，请稍后再试");
					return;
				}
				if(response.data =="error\r\n"){
					$.alert("提示","数据异常，请联系管理员");
					return;
				}
				$("#acctDetail").html(response.data).show();	
				$("#acctList").hide();
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	//保存静态客户信息
	var _createCustConfirm = function() {
		createCustInfo = {
			cAreaId 			: OrderInfo.staff.soAreaId,
			cAreaName 			: OrderInfo.staff.soAreaName,
			cCustName 			: $.trim($("#cCustName").val()),
			cCustIdCard 		: $.trim($("#cCustIdCard").val()),
			cPartyTypeCd 		: $.trim($("#partyTypeCd  option:selected").val()),
			cPartyTypeName 		: ($.trim($("#partyTypeCd  option:selected").val())==1) ? "个人客户":"政企客户",
			cIdentidiesTypeCd 	: $.trim($("#identidiesTypeCd  option:selected").val()),
			cAddressStr 		: $.trim($("#cAddressStr").val()),
			cMailAddressStr 	: $.trim($("#cMailAddressStr").val())
		};
		var _boPartyContactInfo = {
			contactAddress 	: $.trim($("#contactAddress").val()),//参与人的联系地址
	        contactDesc 	: $.trim($("#contactDesc").val()),//参与人联系详细信息
	        contactEmployer : $.trim($("#contactEmployer").val()),//参与人的联系单位
	        contactGender  	: $.trim($("#contactGender").val()),//参与人联系人的性别
	        contactId 		: $.trim($("#contactId").val()),//参与人联系信息的唯一标识
	        contactName 	: $.trim($("#contactName").val()),//参与人的联系人名称
	        contactType 	: $.trim($("#contactType").val()),//联系人类型
	        eMail 			: $.trim($("#eMail").val()),//参与人的eMail地址
	        fax 			: $.trim($("#fax").val()),//传真号
	        headFlag 		: $.trim($("#headFlag  option:selected").val()),//是否首选联系人
	        homePhone 		: $.trim($("#homePhone").val()),//参与人的家庭联系电话
	        mobilePhone 	: $.trim($("#mobilePhone").val()),//参与人的移动电话号码
	        officePhone 	: $.trim($("#officePhone").val()),//参与人办公室的电话号码
	        postAddress 	: $.trim($("#postAddress").val()),//参与人的邮件地址
	        postcode 		: $.trim($("#postcode").val()),//参与人联系地址的邮政编码
	        staffId 		: OrderInfo.staff.staffId,//员工ID
	        state 			: "ADD",//状态
	        statusCd 		: "100001"//订单状态
		};
		OrderInfo.boCustInfos.name					= createCustInfo.cCustName;//客户名称
		OrderInfo.boCustInfos.areaId				= createCustInfo.cAreaId;//客户地区
		OrderInfo.boCustInfos.partyTypeCd			= createCustInfo.cPartyTypeCd;//客户类型
		OrderInfo.boCustInfos.defaultIdType			= createCustInfo.cIdentidiesTypeCd;//证件类型
		OrderInfo.boCustInfos.addressStr			= createCustInfo.cAddressStr;//客户地址
		OrderInfo.boCustInfos.mailAddressStr		= createCustInfo.cMailAddressStr;//通信地址
		OrderInfo.boCustIdentities.identidiesTypeCd	= createCustInfo.cIdentidiesTypeCd;//证件类型
		OrderInfo.boCustIdentities.identityNum		= createCustInfo.cCustIdCard;//证件号码
		//boPartyContactInfo
		OrderInfo.boPartyContactInfo.contactAddress	=_boPartyContactInfo.contactAddress,//参与人的联系地址
		OrderInfo.boPartyContactInfo.contactDesc 	=_boPartyContactInfo.contactDesc,//参与人联系详细信息
		OrderInfo.boPartyContactInfo.contactEmployer=_boPartyContactInfo.contactEmployer,//参与人的联系单位
		OrderInfo.boPartyContactInfo.contactGender  =_boPartyContactInfo.contactGender,//参与人联系人的性别
		OrderInfo.boPartyContactInfo.contactId 		=_boPartyContactInfo.contactId,//参与人联系信息的唯一标识
		OrderInfo.boPartyContactInfo.contactName 	=_boPartyContactInfo.contactName,//参与人的联系人名称
		OrderInfo.boPartyContactInfo.contactType 	=_boPartyContactInfo.contactType,//联系人类型
		OrderInfo.boPartyContactInfo.eMail 			=_boPartyContactInfo.eMail,//参与人的eMail地址
		OrderInfo.boPartyContactInfo.fax 			=_boPartyContactInfo.fax,//传真号
		OrderInfo.boPartyContactInfo.headFlag 		=_boPartyContactInfo.headFlag,//是否首选联系人
		OrderInfo.boPartyContactInfo.homePhone 		=_boPartyContactInfo.homePhone,//参与人的家庭联系电话
		OrderInfo.boPartyContactInfo.mobilePhone 	=_boPartyContactInfo.mobilePhone,//参与人的移动电话号码
		OrderInfo.boPartyContactInfo.officePhone 	=_boPartyContactInfo.officePhone,//参与人办公室的电话号码
		OrderInfo.boPartyContactInfo.postAddress 	=_boPartyContactInfo.postAddress,//参与人的邮件地址
		OrderInfo.boPartyContactInfo.postcode		=_boPartyContactInfo.postcode,//参与人联系地址的邮政编码
		OrderInfo.boPartyContactInfo.staffId 		=_boPartyContactInfo.staffId,//员工ID
		OrderInfo.boPartyContactInfo.state 			=_boPartyContactInfo.state,//状态
		OrderInfo.boPartyContactInfo.statusCd 		=_boPartyContactInfo.statusCd//订单状态

		OrderInfo.cust = {
			custId		: -1,	
			partyName 	: createCustInfo.cCustName,
			areaId		: createCustInfo.cAreaId
		};
		//客户属性
		OrderInfo.boCustProfiles=[];
		//客户属性节点
		for ( var i = 0; i < _partyProfiles.length; i++) {
			var partyProfiles = _partyProfiles[i];
			var profileValue  = $("#"+partyProfiles.attrId).val();
			if(""==profileValue||undefined==profileValue){
				profileValue==$("#"+partyProfiles.attrId+"option:selected").val();
			}
			var partyProfiles = {
				partyProfileCatgCd: partyProfiles.attrId,
				profileValue: profileValue,
                state: "ADD"
			};
			if(""!=profileValue && profileValue!=undefined){
				OrderInfo.boCustProfiles.push(partyProfiles);
			}
		}
		$("#div_cust_create").popup("close");
		var param = {};
		param.prodPwd 		= "";
		param.accessNumber	="";
		param.authFlag		="1";
		authFlag			="";
		param.identityCd	=createCustInfo.cIdentidiesTypeCd;
		param.idCardNumber	=createCustInfo.cCustIdCard;
		param.partyName		=createCustInfo.cCustName;
		param.areaId		=createCustInfo.cAreaId;
		param.areaName		=createCustInfo.cAreaName;
		param.segmentName	=createCustInfo.cPartyTypeName;
		param.identityName	=$("#identidiesTypeCd option:selected").text();
		$.callServiceAsHtml(contextPath+"/pad/cust/custAuth",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","客户鉴权失败,稍后重试");
					return;
				}
				if(response.data.indexOf("false") >=0) {
					$.alert("提示","抱歉，您输入的密码有误，请重新输入。");
					return;
				}
				_custAuthCallBack(response);
			},"always":function(){
				$.unecOverlay();
			}
		});
   };
	//验证证件号码是否存在
	var _checkIdentity = function() {
		var areaId=$("#p_cust_areaId").val();
		if(areaId==null||areaId==""){
			areaId=OrderInfo.staff.areaId;
		}
		var custName=$("#p_cust_areaId_val").val();
		createCustInfo = {
			cAreaId : areaId,
			cAreaName : custName,
			cCustName : $.trim($("#cCustName").val()),
			cCustIdCard :  $.trim($("#cCustIdCard").val()),
			cPartyTypeCd : $.trim($("#partyTypeCd option:selected").val()),
			cIdentidiesTypeCd : $.trim($("#identidiesTypeCd option:selected").val()),
			cAddressStr :$.trim($("#cAddressStr").val())
		};
		diffPlace=$("#DiffPlaceFlag").val();
		var params = {
			"acctNbr":"",
			"identityCd":createCustInfo.cIdentidiesTypeCd,
			"identityNum":createCustInfo.cCustIdCard,
			"partyName":"",
			"custQueryType":$("#custQueryType").val(),
			"diffPlace":diffPlace,
			"areaId" : createCustInfo.cAreaId
		};
		var url=contextPath+"/pad/cust/checkIdentity";
		var response = $.callServiceAsJson(url, params, {"before":function(){
			$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
		}});
		var msg="";
		if (response.code == 0) {
			$.unecOverlay();
			$.confirm("确认","此证件号码已存在,是否确认新建?",{ 
				yes:function(){	
					_createCustConfirm();
				},
				no:function(){
					
				}
			});
		}else{
			$.unecOverlay();
			_createCustConfirm();
		}
	};
	//更多属性标签 切换
	var _changeLabel = function(tabObj){
        var labId = $(tabObj).attr("tabid");
        if(labId !="0" && $("#contactName").val()==""){
        	$("#contactName").blur();
			return;
		}
        var index = $(tabObj).index();
        var divs = $("#otabs-body > div");
        $(tabObj).parent().children("li").attr("class", "otab-nav");//将所有选项置为未选中
        $(tabObj).attr("class", "otab-nav-action"); //设置当前选中项为选中样式
		$(tabObj).parent().children("li").find(".ui-input-search").hide();
		$(tabObj).parent().children("li").find(".ui-select").hide(); 
		$(tabObj).children("div").show();
        divs.hide();//隐藏所有选中项内容
        divs.eq(index).show(); //显示选中项对应内容
	};
	//指定号码 切换时控制,ok 
	var _isAppointNum = function(){
		if(!_called){
			_called = true;
			if($("#p_cust_identityCd").find("option:selected").val()!=-1){
				$.alertSync("提示","只能接入号码才能指定号码！","information",function(){
					$("#isAppointNum").val("0").slider().slider("refresh");
					_called = false;
				});
			}
		}
	};
	//退出二次业务
	var _cancel = function() {
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
		order.prepare.hideStep();
		$("#orderedprod").show();
		$("#order_prepare").show();
	};
	//返回按钮
	var _back = function(){
		$("#acctDetail").hide();
		$("#acctList").show();
	};
	
	return {
		showCustAuth 			: _showCustAuth,
		showCustCreate 			: _showCustCreate,
		custAuth 				: _custAuth,
		getCustInfo 			: _getCustInfo,
		custReset				: _custReset,
		btnQueryCustProd		: _btnQueryCustProd,
		btnQueryCustProdMore	: _btnQueryCustProdMore,
		jumpAuth 				: _jumpAuth,
		identidiesTypeCdChoose 	: _identidiesTypeCdChoose,
		custidentidiesTypeCdChoose :_custidentidiesTypeCdChoose,
		choosedCustInfo 		: _choosedCustInfo,
		partyTypeCdChoose 		: _partyTypeCdChoose,
		chooseArea 				: _chooseArea,
		chooseAllArea 			: _chooseAllArea,
		newCustChooseArea 		: _newCustChooseArea,
		prodChooseArea 			: _prodChooseArea,
		init	 				: _init,
		partyProfiles 			: _partyProfiles,
		profileTabLists 		: _profileTabLists,
		queryCustDetail 		: _queryCustDetail,
		changeLabel 			: _changeLabel,
		jumpAuthflag 			: _jumpAuthflag,
		orderBtnflag 			: _orderBtnflag,
		custCreateButton 		: _custCreateButton,
		isAppointNum 			: _isAppointNum,
		preQueryCustChooseArea 	: _preQueryCustChooseArea,
		linkSelectPlan			: _linkSelectPlan,
		back 					: _back,
		fromProvFlag 			: _fromProvFlag,
		provIsale 				: _provIsale
	};
})();
/**
 * 订单准备
 * 
 * @author tang
 */
CommonUtils.regNamespace("cust");
/**
 * 订单准备
 */
cust = (function(){
	var _clearCustForm = function(){
		$('#cmCustName').val("");
		$('#cmAddressStr').val("");
		$('#telNumber').val("");
		$('#mailAddressStr').val("");
		$('#cmCustIdCard').val("");
		$('#cmCustIdCardOther').val("");
		cust.validatorForm();
	};
	
	//客户新增提交
	var _newCustSubmit = function(){
		$('#custFormdata').data('bootstrapValidator').validate();
		if($('#custFormdata').data('bootstrapValidator').isValid()){
			/*var url=contextPath+"/order/createorderlonger";
			var response = $.callServiceAsJson(url, {});
			if(response.code==0){
				OrderInfo.custorderlonger=response.data;
			}*/
			_checkIdentity();
		}
	};
	
	
	var _custSubmit = function(){
		//从页面信息读取到cust缓存
		OrderInfo.cust.custId = -1;//客户地区
		OrderInfo.cust.partyName = $('#cmCustName').val();//客户名称
		OrderInfo.cust.areaId = OrderInfo.staff.areaId;//客户地区
		OrderInfo.cust.telNumber = $('#telNumber').val();//联系电话
		OrderInfo.cust.addressStr = $('#cmAddressStr').val();//客户地址
		OrderInfo.cust.mailAddressStr = $('#mailAddressStr').val();//通信地址
		OrderInfo.cust.identityCd = $('#cm_identidiesTypeCd').val();//证件类型
		//联系人不为空时才封装联系人信息上传
		if($.trim($('#contactName').val()).length>0){
			OrderInfo.boPartyContactInfo.contactName = $.trim($('#contactName').val());//联系人
			OrderInfo.boPartyContactInfo.mobilePhone = $.trim($('#mobilePhone').val());//联系人手机
			OrderInfo.boPartyContactInfo.contactAddress = $.trim($('#contactAddress').val());//联系人地址
		}
		if(OrderInfo.cust.identityCd==1){
			OrderInfo.cust.identityNum = $('#cmCustIdCard').val();//证件号码
		}else{
			OrderInfo.cust.identityNum = $('#cmCustIdCardOther').val();//证件号码
		}
		var flag=$("#flag").val();
		if(ec.util.isObj(flag)){//有值代表是实名制创建客户页面
			var data = {
				boCustInfos : [],
				boCustIdentities : [],	
				boPartyContactInfo : []
			};
			_getCustInfo();
			data.boCustInfos.push(OrderInfo.boCustInfos);
			data.boCustIdentities.push(OrderInfo.boCustIdentities);
			if($.trim($('#contactName').val()).length>0){
				data.boPartyContactInfo.push(OrderInfo.boPartyContactInfo);
			}
			SoOrder.submitOrder(data);
		}else{
			
			common.saveCust();
		}
	};
	
	//拼接客户信息跟客户属性从cust节点解析到boCustInfos，boCustIdentities
	var _getCustInfo = function(){
		OrderInfo.boCustInfos.name = OrderInfo.cust.partyName;//客户名称
		OrderInfo.boCustInfos.areaId = OrderInfo.staff.areaId;//客户地区
		OrderInfo.boCustInfos.partyTypeCd = 1 ;//客户类型
		OrderInfo.boCustInfos.defaultIdType = 1 ;//证件类型
		OrderInfo.boCustInfos.addressStr= OrderInfo.cust.addressStr;//客户地址
		OrderInfo.boCustInfos.telNumber = OrderInfo.cust.telNumber;//联系电话
		OrderInfo.boCustInfos.mailAddressStr = OrderInfo.cust.mailAddressStr;//通信地址
		OrderInfo.boCustInfos.state = "ADD";
		
		OrderInfo.boCustIdentities.identidiesTypeCd = OrderInfo.cust.identityCd;//证件类型
		OrderInfo.boCustIdentities.identityNum = OrderInfo.cust.identityNum;//证件号码
		OrderInfo.boCustIdentities.isDefault = "Y";
		OrderInfo.boCustIdentities.state = "ADD";
	};
	
	
	//客户修改提交
	var _updateCustSubmit = function(){
		$('#custFormdata').data('bootstrapValidator').validate();
		if($('#custFormdata').data('bootstrapValidator').isValid()){
			/*var url=contextPath+"/order/createorderlonger";
			var response = $.callServiceAsJson(url, {});
			if(response.code==0){
				OrderInfo.custorderlonger=response.data;
			}
			_checkIdentity();*/
			
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
				partyTypeCd : $("#cmPartyTypeCd").val(),
				addressStr :modifyCustInfo.addressStr,
				state : "ADD"
			}];
			if(!ec.util.isObj(OrderInfo.cust.idCardNumber)){
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
			SoOrder.submitOrder(data);
		}
	};
	
    
	//验证证件号码是否存在
	var _checkIdentity = function() {
		var areaId = OrderInfo.staff.areaId;
		if(areaId==null||areaId==""){
			areaId=OrderInfo.staff.areaId;
		}
		var custName=$("#p_cust_areaId_val").val();
		createCustInfo = {
			cAreaId : areaId,
			cAreaName : custName,
			cCustName : $.trim($("#cCustName").val()),
			cCustIdCard :  $.trim($("#cCustIdCard").val()),
			cPartyTypeCd : $.trim($("#partyTypeCd  option:selected").val()),
			cIdentidiesTypeCd : $.trim($("#identidiesTypeCd  option:selected").val()),
			cAddressStr :$.trim($("#cAddressStr").val())
		};
		diffPlace=$("#DiffPlaceFlag").val();
		var params = {
			"acctNbr":"",
			"identityCd":createCustInfo.cIdentidiesTypeCd,
			"identityNum":createCustInfo.cCustIdCard,
			"partyName":"",
			"custQueryType":$("#custQueryType").val(),
			"diffPlace":diffPlace,
			"areaId" : createCustInfo.cAreaId
		};
		var url=contextPath+"/app/cust/checkIdentity";
		var response = $.callServiceAsJson(url, params, {"before":function(){
			$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
		}});
		var msg="";
		if (response.code == 0) {
			$.unecOverlay();
			$.confirm("确认","此证件号码已存在,是否确认新建?",{ 
				yes:function(){	
					_custSubmit();
				},
				no:function(){
					
				}
			});
		}else{
			$.unecOverlay();
			_custSubmit();
		}
	};
	
	var _form_custInfomodify_btn = function() {
		//修改客户下一步确认按钮
		$('#custInfoModifyBtn').off("click").on("click",function(event) {
			$('#custFormdata').data('bootstrapValidator').validate();
			if($('#custFormdata').data('bootstrapValidator').isValid()){
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
					partyTypeCd : $("#cmPartyTypeCd").val(),
					addressStr :modifyCustInfo.addressStr,
					state : "ADD"
				}];
				if(!ec.util.isObj(OrderInfo.cust.idCardNumber)){
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
//				//客户联系人
				data.boPartyContactInfo=[];
				var _boPartyContactInfoOld = {
						contactId : $("#contactIdOld").val(),//参与人联系信息的唯一标识
						statusCd : "100001",
						contactName : $("#contactNameOld").val(),//参与人的联系人名称
						headFlag :  $("#headFlagOld").val(),//是否首选联系人
						state : "DEL"//状态
				};
				var _boPartyContactInfo = {
						contactAddress : $.trim($("#contactAddress").val()),//参与人的联系地址
						contactId : "",//参与人联系信息的唯一标识
						contactName : $.trim($("#contactName").val()),//参与人的联系人名称
						mobilePhone : $.trim($("#mobilePhone").val()),//参与人的联系人手机
						headFlag :  $("#headFlag").val(),//是否首选联系人
						staffId : OrderInfo.staff.staffId,//员工ID
						state : "ADD",//状态
						statusCd : "100001"//订单状态
				};
				if(ec.util.isObj(_boPartyContactInfoOld.contactId)){
					data.boPartyContactInfo.push(_boPartyContactInfoOld);
					data.boPartyContactInfo.push(_boPartyContactInfo);
				}else if(ec.util.isObj($.trim($("#contactName").val()))){
					data.boPartyContactInfo.push(_boPartyContactInfo);
				}
					
				SoOrder.submitOrder(data);
			}
		});
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
	//客户类型关联证件类型下拉框
	var _certTypeByPartyType = function(_partyTypeCd){
		var params = {"partyTypeCd":_partyTypeCd} ;
		var url=contextPath+"/cust/queryCertType";
		var response = $.callServiceAsJson(url, params, {});
       if (response.code == -2) {
					$.alertM(response.data);
				}
	   if (response.code == 1002) {
		   			$.alert("错误","根据员工类型查询员工证件类型无数据,请配置");
					return;
				}
	   if(response.code==0){
					var data = response.data ;
					var currentCT = $("#currentCT").val();//渠道类型
					//只有定义的渠道类型新建客户的时候可以选择非身份证类型,其他的渠道类型只能选择身份证类型。
					var isAllowChannelType = false;
					if (currentCT == CONST.CHANNEL_TYPE_CD.ZQZXDL || currentCT == CONST.CHANNEL_TYPE_CD.GZZXDL
						|| currentCT == CONST.CHANNEL_TYPE_CD.HYKHZXDL || currentCT == CONST.CHANNEL_TYPE_CD.SYKHZXDL
						|| currentCT == CONST.CHANNEL_TYPE_CD.XYKHZXDL || currentCT == CONST.CHANNEL_TYPE_CD.GZZXJL
						|| currentCT == CONST.CHANNEL_TYPE_CD.ZYOUT || currentCT == CONST.CHANNEL_TYPE_CD.ZYINGT
						|| currentCT == CONST.CHANNEL_TYPE_CD.WBT) { // || _partyTypeCd != "1" //新建政企客户时同样有这个限制
						isAllowChannelType = true;
					}
					if(data!=undefined && data.length>0){
						for(var i=0;i<data.length;i++){
							var certTypedate = data[i];
							if (certTypedate.certTypeCd == "1") {//身份证
									$("#cm_identidiesTypeCd").append("<option value='"+certTypedate.certTypeCd+"' >"+certTypedate.name+"</option>");
								}else if(isAllowChannelType){//如果自有渠道，开放所有
									$("#cm_identidiesTypeCd").append("<option value='"+certTypedate.certTypeCd+"' >"+certTypedate.name+"</option>");
								}
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
		$("#cmCustName").removeAttr("readonly");
		$("#cmCustIdCard").removeAttr("readonly");
		$("#cmAddressStr").removeAttr("readonly");
		if(identidiesTypeCd==1){
			$("#cmCustIdCard").attr("placeHolder","请输入合法身份证号码");
			$("#div-cmcustidcard").show();
			$("#div-cmcustidcard-none").hide();
			
			$("#cmCustName").attr("readonly","readonly");
			$("#cmCustIdCard").attr("readonly","readonly");
			$("#cmAddressStr").attr("readonly","readonly");
			
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCardOther",false,null);
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCard",true,null);
		}else if(identidiesTypeCd==2){
			$("#cmCustIdCardOther").attr("placeHolder","请输入合法军官证");
			$("#div-cmcustidcard-none").show();
			$("#div-cmcustidcard").hide();
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCardOther",true,null);
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCard",false,null);
		}else if(identidiesTypeCd==3){
			$("#cmCustIdCardOther").attr("placeHolder","请输入合法护照");
			$("#div-cmcustidcard-none").show();
			$("#div-cmcustidcard").hide();
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCardOther",true,null);
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCard",false,null);
		}else{
			$("#cmCustIdCardOther").attr("placeHolder","请输入合法证件号码");
			$("#div-cmcustidcard-none").show();
			$("#div-cmcustidcard").hide();
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCardOther",true,null);
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCard",false,null);
		}
		_form_custInfomodify_btn();
	};
	
	//校验表单提交
	var _validatorForm=function(){
		$('#custFormdata').bootstrapValidator({
	        message: '无效值',
	        feedbackIcons: {
	            valid: 'glyphicon glyphicon-ok',
	            invalid: 'glyphicon glyphicon-remove',
	            validating: 'glyphicon glyphicon-refresh'
	        },
	        fields: {
	        	cmCustName: {
	        		trigger: 'blur',
	                validators: {
	                    notEmpty: {
	                        message: '客户姓名不能为空'
	                    }
	                }
	            },
	            cmCustIdCard: {
	            	trigger: 'blur',
	                validators: {
	                    notEmpty: {
	                        message: '身份证号码不能为空'
	                    },
	                    regexp: {
	                        regexp: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
	                        message: '请输入合法身份证号码'
	                    }
	                }
	            },
	            cmCustIdCardOther: {
	            	trigger: 'blur',
	                validators: {
	                    notEmpty: {
	                        message: '证件号码不能为空'
	                    },
	                    regexp: {
	                        regexp: /^[0-9a-zA-Z]*$/g,
	                        message: '证件号码只能为数字或字母'
	                    }
	                }
	            },
	            cmAddressStr: {
	            	trigger: 'blur',
	                validators: {
	                    notEmpty: {
	                        message: '证件地址不能为空'
	                    }
	                }
	            },
	            mobilePhone: {
	            	trigger: 'blur',
	                validators: {
	                    regexp: {
	                        regexp: /(^\d{11}$)/,
	                        message: '手机号码只能为11数字'
	                    }
	                }
	            },
	            phonenumber: {
	            	trigger: 'blur',
	                validators: {
	                    notEmpty: {
	                        message: '手机号码不能为空'
	                    }
	                }
	            }
	        }
	    });
	};
	
	//获取证件类型以及初始化
	var _getIdentidiesTypeCd=function(){
		//根据客户类型查询证件类型
		_partyTypeCdChoose("#cmPartyTypeCd");
		//取客户证件类型
		$("#cm_identidiesTypeCd option[value='"+$("#boCustIdentities").attr("identidiesTypeCd")+"']").attr("selected", true);
		//根据证件类型对行添加校验
		_identidiesTypeCdChoose($("#cm_identidiesTypeCd option[selected='selected']"));
		
		OrderInfo.busitypeflag=12;
        var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.ACTIVERETURN;
		OrderInfo.initData(CONST.ACTION_CLASS_CD.CUST_ACTION,BO_ACTION_TYPE,9,CONST.getBoActionTypeName(BO_ACTION_TYPE),"");
		SoOrder.initFillPage();
	};
	
	//初始化新增客户
	var _initNewCust = function(){
		cust.validatorForm();
		//根据客户类型查询证件类型
		_partyTypeCdChoose("#cmPartyTypeCd");
		//取客户证件类型
		$("#cm_identidiesTypeCd option[value='"+$("#boCustIdentities").attr("identidiesTypeCd")+"']").attr("selected", true);
		//根据证件类型对行添加校验
		_identidiesTypeCdChoose($("#cm_identidiesTypeCd option[selected='selected']"));
	
		$('#newCustBtn').off("click").on("click",_newCustSubmit);
		var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.CUST_CREATE;
		OrderInfo.initData(CONST.ACTION_CLASS_CD.CUST_ACTION,BO_ACTION_TYPE,8,CONST.getBoActionTypeName(BO_ACTION_TYPE),"");

		SoOrder.initFillPage();
	};
	
	//初始化新增客户
	var _initUpdateCust = function(){
		cust.validatorForm();
		//根据客户类型查询证件类型
		_partyTypeCdChoose("#cmPartyTypeCd");
		//证件类型选中
		$("#cm_identidiesTypeCd").find("option[value="+$("#zjlx").val()+"]").attr("selected","selected");
		//取客户证件类型
		$("#cm_identidiesTypeCd option[value='"+$("#boCustIdentities").attr("identidiesTypeCd")+"']").attr("selected", true);
		//根据证件类型对行添加校验
		_identidiesTypeCdChoose($("#cm_identidiesTypeCd option[selected='selected']"));
	
		$('#updateCustBtn').off("click").on("click",_updateCustSubmit);
		var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.CUSTINFOMODIFY;
		OrderInfo.initData(CONST.ACTION_CLASS_CD.CUST_ACTION,BO_ACTION_TYPE,4,CONST.getBoActionTypeName(BO_ACTION_TYPE),"");

		/*OrderInfo.staff = { //员工登陆信息
			staffId : sessionStaff.staffId,  //员工id
			channelId : sessionStaff.currentChannelId,   //受理渠道id
			channelName: "",
			areaId : 0,    //受理地区id
			areaCode : 0,
			soAreaId : sessionStaff.currentAreaId,    //新装受理地区id
			soAreaCode : 0, 
			distributorId : "" //转售商标识
		};*/
		SoOrder.initFillPage();
	};
	
	var _getIDCardInfos=function(name,idcard,address,photosBase64){
		$("#cmCustName").val(name);
		$("#cm_identidiesTypeCd").val("1");
		$("#cm_identidiesTypeCd").change();
		$("#cmCustIdCard").val(idcard);
		$("#cmAddressStr").val(address);
		$("#photos").attr("src","data:image/jpg;base64,"+photosBase64);
	};
	
	var _getPicture=function(photosBase64){
		$("#photos").attr("src","data:image/jpg;base64,"+photosBase64);
	};
	
	var _getGenerationInfos=function(name,idcard,address){
		$("#cmCustName").val(name);
		$("#cm_identidiesTypeCd").val("1");
		$("#cm_identidiesTypeCd").change();
		$("#cmCustIdCard").val(idcard);
		$("#cmAddressStr").val(address);
	};
	
	//新增客户订单查询页面
	var _custQueryAdd=function(){
		var param = {};
		$.callServiceAsHtml(contextPath+"/app/cust/custQueryAdd",param,{
			"before":function(){
				$.ecOverlay("加载中请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				$("#order-content").hide();
				$("#cust").html(response.data).show();
			},
			fail:function(){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	}
	//新增客户订单查询列表页面
	var _custQueryAddList=function(pageIndex,scroller){
		var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
		var startDt = $("#p_startDt").val().replace(/-/g,'');
		var endDt = $("#p_endDt").val().replace(/-/g,'');
		if(startDt>endDt){
			$.alert("提示","起始时间不能大于结束时间！");
			return;
		}else{
			param = {
						"startDt":($("#p_startDt").val()).replace(/-/g,''),
						"endDt":($("#p_endDt").val()).replace(/-/g,''),
						nowPage:curPage,
						pageSize:10
				};
			$.callServiceAsHtml(contextPath+"/app/cust/custQueryAddList",param,{
				"before":function(){
					$.ecOverlay("查询中请稍等...");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					if(response && response.code == -2){
						return ;
					}else{
						if(curPage == 1){
							$("#cust_search").hide();
							$("#cust_list").html(response.data).show();
							$("#cust_list_scroller").css("transform","translate(0px, -40px) translateZ(0px)");
							if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
						}
						if(curPage > 1){
							$("#all_cust_list").append(response.data);
							$("#cust_list_scroller").css("transform","translate(0px, -40px) translateZ(0px)");
							if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
						}
					}
				},
				fail:function(){
					$.unecOverlay();
					$.alert("提示","请求可能发生异常，请稍后再试！");
				}
			});
		}
	}
	
	//滚动页面入口
	var _scroll = function(scrollObj){
		if(scrollObj && scrollObj.page && scrollObj.page >= 1){
			_custQueryAddList(scrollObj.page,scrollObj.scroll);
		}
	};
	
	//客户架构信息查询接口
	var _queryCustCompreInfo = function(mainPhoneNum,provCustAreaId,busitypeflag,oldFlag){
		var param = {
			    "acctNbr": "",
			    "areaId": provCustAreaId,
			    "diffPlace": "local",
			    "identidies_type": "",
			    "identityCd": "",
			    "identityNum": "",
			    "olTypeCd": "8",
			    "operType": busitypeflag,
			    "partyName": "",
			    "prodClass": "12",
			    "queryType": "",
			    "queryTypeValue": ""
			};
		if(busitypeflag==1){
			param.queryTypeValue = mainPhoneNum;
			param.identidies_type = "客户编码";
			param.queryType = "custNumber";
		}else{
			param.acctNbr = mainPhoneNum;
			param.identidies_type = "接入号码";
		}
		$.ecOverlay("<strong>正在查询客户架构信息中,请稍等...</strong>");
		var response = $.callServiceAsJson(contextPath+"/token/pc/cust/queryCustCompreInfo", param);
		$.unecOverlay();
		if(response.code == 0) {
			if(response.data == null){
				$.alert("提示","客户架构信息接口无数据返回。");
				return false;
			}
			if(response.data.custInfos==undefined){
				$.alert("提示","抱歉，没有定位到客户，请尝试其他客户。");
				return false;
			}else if(!ec.util.isArray(response.data.custInfos)){
				$.alert("提示","抱歉，没有定位到客户，请尝试其他客户。");
				return false;
			}
			if(response.data.prodInstInfos==undefined && busitypeflag!=1){
				$.alert("提示","客户下没有可以办理业务的移动用户。");
				return false;
			}
			if(response.data.offerMemberInfos==undefined && busitypeflag!=1){
				$.alert("提示","查询销售品实例构成，没有返回成员实例无法继续受理。");
				return false;
			}
			if(oldFlag=="OLD"){
				var custInfos = response.data.custInfos;
				if(OrderInfo.actionFlag!=1 && custInfos[0].custId!=OrderInfo.cust.custId){
					$.alert("提示",mainPhoneNum+"和主卡的客户不一致！");
					return false;
				}
				var prodInstInfos = {};
				var prodInfos = response.data.prodInstInfos;
				$.each(prodInfos,function(){
					if(this.accNbr==mainPhoneNum){
						prodInstInfos = this;
						if(prodInstInfos.prodStateCd!=CONST.PROD_STATUS_CD.NORMAL_PROD){
							$.alert("提示",mainPhoneNum+"不是在用产品！");
							return false;
						}
						if(OrderInfo.actionFlag!=1 && prodInstInfos.feeType.feeType!=order.prodModify.choosedProdInfo.feeType){
							$.alert("提示",mainPhoneNum+"和主卡的付费类型不一致！");
							return false;
						}
						if(prodInstInfos.productId=="280000000"){
							$.alert("提示",mainPhoneNum+"是无线宽带，不能纳入！");
							return false;
						}
						prodInstInfos.custId = custInfos[0].custId;
						OrderInfo.oldprodInstInfos.push(prodInstInfos);
					}
				})
				
				var flag = true;
				for ( var i = 0; i < response.data.offerMemberInfos.length; i++) {
					var member = response.data.offerMemberInfos[i];
					if(member.objType==""){
						$.alert("提示","销售品实例构成 "+member.roleName+" 成员类型【objType】节点为空，无法继续受理,请营业后台核实");
						return false;
					}else if(member.objType==CONST.OBJ_TYPE.PROD){
						if(member.accessNumber==""){
							$.alert("提示","销售品实例构成 "+member.roleName+" 接入产品号码【accessNumber】节点为空，无法继续受理,请营业后台核实");
							return false;
						}
					}
					if(member.objInstId==prodInstInfos.prodInstId){
						flag = false;
					}
				}
				if(flag){
					$.alert("提示","销售品实例构成中 没有包含选中接入号码【"+prodInstInfos.accNbr+"】，无法继续受理，请业务后台核实");
					return false;
				}
				var offerInfos = {
					"offerMemberInfos":	response.data.offerMemberInfos,
					"offerId":prodInstInfos.mainProdOfferInstInfos[0].prodOfferInstId,
					"offerSpecId":prodInstInfos.mainProdOfferInstInfos[0].prodOfferId,
					"offerSpecName":prodInstInfos.mainProdOfferInstInfos[0].prodOfferName,
					"accNbr":prodInstInfos.accNbr
				};
				OrderInfo.oldoffer.push(offerInfos);
				order.memberChange.viceCartNum = 0;
				$.each(OrderInfo.oldoffer,function(){
					$.each(this.offerMemberInfos,function(){
						if(this.objType==CONST.OBJ_TYPE.PROD){
							order.memberChange.viceCartNum++;
						}
					})
				});
			}else{
				var custInfos = response.data.custInfos;
				OrderInfo.cust={
					addressStr: custInfos[0].addressStr,
					areaId: custInfos[0].areaId,
					areaName: custInfos[0].areaName,
					authFlag: custInfos[0].authType,
					custFlag: custInfos[0].custFlag,
					custId: custInfos[0].custId,
					idCardNumber: custInfos[0].idCardNumber,
					identityCd: custInfos[0].identityCd,
					identityName: custInfos[0].identityName,
					norTaxPayer: "",
					partyName: custInfos[0].partyName,
					segmentId: custInfos[0].segmentId,
					segmentName: custInfos[0].segmentName,
					vipLevel: custInfos[0].vipLevel,
					vipLevelName: custInfos[0].vipLevelName
				}
				if(busitypeflag!=1){
					var prodInstInfos = response.data.prodInstInfos;
					order.prodModify.choosedProdInfo={
						accNbr: prodInstInfos[0].accNbr,
						areaCode: prodInstInfos[0].zoneNumber,
						areaId: prodInstInfos[0].areaId,
						corProdInstId: prodInstInfos[0].corProdInstId,
						custId: prodInstInfos[0].mainProdOfferInstInfos[0].custId,
						custName: prodInstInfos[0].mainProdOfferInstInfos[0].custName,
						endDt: prodInstInfos[0].mainProdOfferInstInfos[0].endDt,
						extProdInstId: prodInstInfos[0].extProductId,
						feeType: prodInstInfos[0].feeType.feeType,
						feeTypeName: prodInstInfos[0].feeType.feeTypeName,
						is3G: prodInstInfos[0].mainProdOfferInstInfos[0].is3G,
						prodBigClass: prodInstInfos[0].prodBigClass,
						prodClass: prodInstInfos[0].prodClass,
						prodInstId: prodInstInfos[0].prodInstId,
						prodOfferId: prodInstInfos[0].mainProdOfferInstInfos[0].prodOfferId,
						prodOfferInstId: prodInstInfos[0].mainProdOfferInstInfos[0].prodOfferInstId,
						prodOfferName: prodInstInfos[0].mainProdOfferInstInfos[0].prodOfferName,
						prodStateCd: prodInstInfos[0].prodStateCd,
						prodStateName: prodInstInfos[0].prodStateName,
						productId: prodInstInfos[0].productId,
						productName: prodInstInfos[0].productName,
						startDt: prodInstInfos[0].mainProdOfferInstInfos[0].startDt,
						stopRecordCd: prodInstInfos[0].prodStopRecords[0].stopRecordCd,
						stopRecordName: prodInstInfos[0].prodStopRecords[0].stopRecordName
					}
					var flag = true;
					for ( var i = 0; i < response.data.offerMemberInfos.length; i++) {
						var member = response.data.offerMemberInfos[i];
						if(member.objType==""){
							$.alert("提示","销售品实例构成 "+member.roleName+" 成员类型【objType】节点为空，无法继续受理,请营业后台核实");
							return false;
						}else if(member.objType==CONST.OBJ_TYPE.PROD){
							if(member.accessNumber==""){
								$.alert("提示","销售品实例构成 "+member.roleName+" 接入产品号码【accessNumber】节点为空，无法继续受理,请营业后台核实");
								return false;
							}
						}
						if(member.objInstId==order.prodModify.choosedProdInfo.prodInstId){
							flag = false;
						}
					}
					if(flag){
						$.alert("提示","销售品实例构成中 没有包含选中接入号码【"+order.prodModify.choosedProdInfo.accNbr+"】，无法继续受理，请业务后台核实");
						return false;
					}
					OrderInfo.offer.offerMemberInfos = response.data.offerMemberInfos; 
					OrderInfo.offer.offerId = order.prodModify.choosedProdInfo.prodOfferInstId;
					OrderInfo.offer.offerSpecId = order.prodModify.choosedProdInfo.prodOfferId;
					OrderInfo.offer.offerSpecName = order.prodModify.choosedProdInfo.prodOfferName;
				}
			}
		}else{
			$.alertM(response.data);
			return false;
		}
		return true;
	};
	
	return {
		scroll 						: 		_scroll,
		custQueryAddList 			: 		_custQueryAddList,
		custQueryAdd 				: 		_custQueryAdd,
		getIdentidiesTypeCd 		: 		_getIdentidiesTypeCd,
		identidiesTypeCdChoose		:		_identidiesTypeCdChoose,
		validatorForm				:		_validatorForm,
		initNewCust					:		_initNewCust,
		initUpdateCust				:		_initUpdateCust,
		clearCustForm				:		_clearCustForm,
		getCustInfo					:		_getCustInfo,
		getGenerationInfos			:		_getGenerationInfos,
		getIDCardInfos				: 		_getIDCardInfos,
		getPicture					:		_getPicture,
		queryCustCompreInfo			:		_queryCustCompreInfo
	};	
})();

//$(document).ready(function() {
//	order.prodModify.validatorForm();
//	order.prodModify.getIdentidiesTypeCd();//初始化证件类型
//});

CommonUtils.regNamespace("cart", "main");

/**
 *订单查询.
 */
cart.main = (function(){
	
	//查询
	var _queryCartList = function(pageIndex,scroller){
		OrderInfo.actionFlag=40;
		var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
		var qryNumber=$("#p_qryNumber").val();
		var param = {} ;
		if($("#if_p_olNbr").is(':checked')){
			$('#cartFormdata').data('bootstrapValidator').enableFieldValidators("p_olNbr",true,null);
			$('#cartFormdata').data('bootstrapValidator').enableFieldValidators("p_qryNumber",false,null);
			$('#cartFormdata').data('bootstrapValidator').enableFieldValidators("p_channelId",false,null);
			$('#cartFormdata').data('bootstrapValidator').validate();
			if(!$('#cartFormdata').data('bootstrapValidator').isValid()){
				return;
			}
			param = {"areaId":$("#p_areaId").val(),
					"olNbr":$("#p_olNbr").val(),
					"qryBusiOrder":$("#p_qryBusiOrder").val(),
					"startDt":"",
					"endDt":"",
					"qryNumber":"",
					"channelId":"",
					"olStatusCd":"",
					"busiStatusCd":"",
					nowPage:curPage,
					pageSize:10
			};
		}else{
			param = {
					"startDt":($("#p_startDt").val()).replace(/-/g,''),
					"endDt":($("#p_startDt").val()).replace(/-/g,''),
					"qryNumber":qryNumber,
					"olStatusCd":$("#p_olStatusCd").val(),
					"busiStatusCd":$("#p_busiStatusCd").val(),
					"olNbr":"",
					"qryBusiOrder":$("#p_qryBusiOrder").val(),
					"channelId":$("#p_channelId").val(),
					"areaId":$("#p_channelId").attr("areaid"),
					nowPage:curPage,
					pageSize:10
			};
//			$('#cartFormdata').data('bootstrapValidator').enableFieldValidators("p_olNbr",false,null);
//			if(ec.util.isObj($("#p_qryNumber").val())){
//				$('#cartFormdata').data('bootstrapValidator').enableFieldValidators("p_qryNumber",true,null);
//				$('#cartFormdata').data('bootstrapValidator').enableFieldValidators("p_channelId",false,null);
//			}else if(ec.util.isObj($("#p_channelId").val())){
//				$('#cartFormdata').data('bootstrapValidator').enableFieldValidators("p_qryNumber",false,null);
//				$('#cartFormdata').data('bootstrapValidator').enableFieldValidators("p_channelId",true,null);
//				param["areaId"]=$("#p_channelId").find("option:selected").attr("areaid");
//			}else{
//				$('#cartFormdata').data('bootstrapValidator').enableFieldValidators("p_qryNumber",true,null);
//				$('#cartFormdata').data('bootstrapValidator').enableFieldValidators("p_channelId",true,null);
//			}
//			$('#cartFormdata').data('bootstrapValidator').validate();
//			if(!$('#cartFormdata').data('bootstrapValidator').isValid()){
//				return;
//			}
		} 
		$.callServiceAsHtmlGet(contextPath+"/app/report/cartList",param,{
			"before":function(){
				$.ecOverlay("购物车查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else{
					$("#cart_search").hide();
					$("#cart_list").html(response.data).show();
					OrderInfo.order.step=2;
					$("#cart_list_scroller").css("transform","translate(0px, -40px) translateZ(0px)");
					if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	//改变渠道-监听
	var _channelChange=function(){
		if($("#p_channelId").val()!=""){
			$("#p_areaId_val").attr("disabled", true) ;
		}else{
			$("#p_areaId_val").attr("disabled", false) ;
		}
	};
	
	//滚动页面入口
	var _scroll = function(scrollObj){
		if(scrollObj && scrollObj.page && scrollObj.page >= 1){
			_queryCartList(scrollObj.page,scrollObj.scroll);
		}
	};
	
	//购物车流水号选中与否
	var _olNbrChange=function(){
		if($("#if_p_olNbr").is(':checked')){
			$("#p_areaId_val").attr("disabled", false) ;
			$("#p_olNbr").attr("disabled", false) ;
			$(".form_date").datetimepicker('remove');
			$("#p_qryNumber").attr("disabled", true) ;
			$("#p_olStatusCd").attr("disabled", true) ;
			$("#p_busiStatusCd").attr("disabled", true) ;
			$("#p_channelId").attr("disabled", true) ;
		}else{
			$("#p_olNbr").attr("disabled", true) ;
			$(".form_date").datetimepicker({
		    	language:  'zh-CN',
		        weekStart: 1,
		        todayBtn:  1,
				autoclose: 1,
				todayHighlight: 1,
				startView: 2,
				minView: 2,
				forceParse: 0
		    });
			$("#p_qryNumber").attr("disabled", false) ;
			$("#p_olStatusCd").attr("disabled", false) ;
			$("#p_busiStatusCd").attr("disabled", false) ;
			$("#p_channelId").attr("disabled", false) ;
			if($("#p_channelId").val()!=""){
				$("#p_areaId_val").attr("disabled", true) ;
			}else{
				$("#p_areaId_val").attr("disabled", false) ;
			}
		}
		$("select").addClass("styled-select");
	};
	
	//校验表单提交
	var _validatorForm=function(){
		$('#cartFormdata').bootstrapValidator({
	        message: '无效值',
	        feedbackIcons: {
	            valid: 'glyphicon glyphicon-ok',
	            invalid: 'glyphicon glyphicon-remove',
	            validating: 'glyphicon glyphicon-refresh'
	        },
	        fields: {
	        	p_qryNumber: {
	        		trigger: 'blur',
	                validators: {
	                    notEmpty: {
	                        message: '接入号和渠道不能同时为空'
	                    }
	                }
	            },
	            p_olNbr: {
	            	trigger: 'blur',
	                validators: {
	                    notEmpty: {
	                        message: '购物车流水不能为空'
	                    }
	                }
	            },
	            p_channelId: {
	            	trigger: 'blur',
	                validators: {
	                    notEmpty: {
	                        message: '接入号和渠道不能同时为空'
	                    }
	                }
	            }
	        }
	    });
	};
	
	//受理单详情查询
	var _queryCartInfo=function(olId){
		var param = {"olId":olId};
		param.areaId=$("#p_areaId").val();
		$.callServiceAsHtmlGet(contextPath+"/app/report/cartInfo",param,{
			"before":function(){
				$.ecOverlay("详情查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else{
					$("#cart_list").hide();
					$("#cart_info").html(response.data).show();
					OrderInfo.order.step=3;
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	//受理业务详情查询
	var _showOffer = function(obj){
		var param = {"olId":$(obj).attr("olid"),"boId":$(obj).attr("boid"),"offerId":$(obj).attr("offerid"),"prodId":$(obj).attr("prodid")};
		$.callServiceAsHtmlGet(contextPath+"/app/report/cartOfferInfo",param,{
			"before":function(){
				$.ecOverlay("详情查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else{
					$("#cart_info").hide();
					$("#cart_item_detail").html(response.data).show();
					OrderInfo.order.step=4;
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	
	
	var _initDic = function(){
		OrderInfo.actionFlag=40;
		OrderInfo.order.step=1;
		var param = {"attrSpecCode":"EVT-0002"} ;
		$.callServiceAsJson(contextPath+"/app/staffMgr/getCTGMainData",param,{
			"done" : function(response){
				if(response.code==0){
					var data = response.data ;
					if(data!=undefined && data.length>0){
						for(var i=0;i<data.length;i++){
							var busiStatus = data[i];
							$("#p_busiStatusCd").append("<option value='"+busiStatus.attrValueCode+"' >"+busiStatus.attrValueName+"</option>");
							$("#p_olStatusCd").append("<option value='"+busiStatus.attrValueCode+"' >"+busiStatus.attrValueName+"</option>");
						}
						$("#p_busiStatusCd").addClass("styled-select");
						$("#p_olStatusCd").addClass("styled-select");
					}
				}else if(response.code==-2){
					$.alertM(response.data);
					return;
				}else{
					$.alert("提示","调用主数据接口失败！");
					return;
				}
			}
		});
	};
	
	var _setCalendar = function(time){
		$("#p_start_input").val(time);
		$("#p_startDt").val(time);
	};
	
	//返回按钮调用
	var _cartBack = function(){
		if(OrderInfo.order.step==1){
			common.callCloseWebview();
		}else if(OrderInfo.order.step==2){
			$("#cart_search").show();
			$("#cart_list").hide();
			OrderInfo.order.step=1;
		}else if(OrderInfo.order.step==3){
			$("#cart_list").show();
			$("#cart_info").hide();
			OrderInfo.order.step=2;
		}else if(OrderInfo.order.step==4){
			$("#cart_info").show();
			$("#cart_item_detail").hide();
			OrderInfo.order.step=3;
		}else{
			common.callCloseWebview();
		}
	};
	return {
		cartBack				:			_cartBack,
		channelChange			:			_channelChange,
		queryCartList			:			_queryCartList,
		queryCartInfo			:			_queryCartInfo,
		initDic					:			_initDic,
		olNbrChange				:			_olNbrChange,
		scroll					:			_scroll,
		setCalendar				:			_setCalendar,
		showOffer				:			_showOffer,
		validatorForm			:			_validatorForm
	};
	
})();

CommonUtils.regNamespace("order", "ysl");

order.ysl = (function(){
	var _yslbean={
		yslflag:"ysl"	
	}
	var _openList = [];
	var _paymentbean = [];
	var _realmoney = 0;
	var _CUST_ORDER_ID = "";
	var _CUST_SO_NUMBER = "";
	var _INVOICE_ID = "";
	
	var roles;
	
	//客户类型关联证件类型下拉框
	var _certTypeByPartyType = function(){
		$("#identidiesTypeCd").empty();
		$("#cCustIdCard").val("");
		var partyTypeCd = $("#partyTypeCd").val();
		cust.validatorForm();
		if(partyTypeCd=="1"){
			$("#identidiesTypeCd").append('<option value="1">身份证</option><option value="2">军官证</option><option value="22">警官证</option><option value="3">护照</option><option value="4">港澳台通行证</option><option value="99">其它有效证件</option>');
		}else if(partyTypeCd=="2"){
			$("#identidiesTypeCd").append('<option value="15">组织机构代码证</option><option value="6">工商执照</option><option value="99">其它有效证件</option>');
		}
		$.refresh($("#zjlx"));
		_identidiesTypeCdChoose($("#identidiesTypeCd").children(":first-child"));
	};
	//证件类型选择事件
	var _identidiesTypeCdChoose = function(scope) {
		var identidiesTypeCd=$(scope).val();
		if(identidiesTypeCd==undefined){
			identidiesTypeCd=$("#div_cm_identidiesType  option:selected").val();
		}
		$("#cmCustName").removeAttr("readonly");
		$("#cmCustIdCard").removeAttr("readonly");
		$("#cmAddressStr").removeAttr("readonly");
		if(identidiesTypeCd==1){
			$("#cmCustIdCard").attr("placeHolder","请输入合法身份证号码");
			$("#cmCustName").attr("readonly","readonly");
			$("#cmCustIdCard").attr("readonly","readonly");
			$("#cmAddressStr").attr("readonly","readonly");
			$("#div-cmcustidcard").show();
			$("#div-cmcustidcard-none").hide();
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCardOther",false,null);
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCard",true,null);
		}else if(identidiesTypeCd==2){
			$("#cmCustIdCardOther").attr("placeHolder","请输入合法军官证");
			$("#div-cmcustidcard-none").show();
			$("#div-cmcustidcard").hide();
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCardOther",true,null);
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCard",false,null);
		}else if(identidiesTypeCd==3){
			$("#cmCustIdCardOther").attr("placeHolder","请输入合法护照");
			$("#div-cmcustidcard-none").show();
			$("#div-cmcustidcard").hide();
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCardOther",true,null);
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCard",false,null);
		}else{
			$("#cmCustIdCardOther").attr("placeHolder","请输入合法证件号码");
			$("#div-cmcustidcard-none").show();
			$("#div-cmcustidcard").hide();
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCardOther",true,null);
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCard",false,null);
		}
	};
	var _queryfeeitems = function (){
		var param = {"attrSpecCode":"ACCT_ITEM_TYPE"} ;
		$.callServiceAsJson(contextPath+"/staffMgr/getCTGMainData",param,{
			"done" : function(response){
				if(response.code==0){
					var data = response.data ;
					if(data!=undefined && data.length>0){
						//$("#selpayitems").show();
						$("#payitems").hide();
						for(var i=0;i<data.length;i++){
							var busiStatus = data[i];
							$("#selpayitems").append("<option value='"+busiStatus.attrValueCode+"' >"+busiStatus.attrValueName+"</option>");
						}
						$.refresh($("#feiyongitem"));
					}else{
						$("#selpayitems").next().hide();
						$("#payitems").show();
					}
				}else{
					$("#selpayitems").next().hide();
					$("#payitems").show();
				}
			}
		});
	};
	
	var _querybusitype = function(){
		var url=contextPath+"/app/order/querybusitype";
		var response = $.callServiceAsJson(url, {});
		if (response.code == -2) {
			$.alertM(response.data);
		}
		if (response.code == 1002) {
			$.alert("错误","查询业务类型无数据,请配置");
			return;
		}
		if(response.code==0){
			var data = response.data ;
			if(data!=undefined && data.length>0){
				for(var i=0;i<data.length;i++){
					var busiTypedate = data[i];
					$("#busitype").append("<option value='"+busiTypedate.busiTypeCd+"' >"+busiTypedate.busiTypeName+"</option>");
				}
				$("#busitype").addClass("styled-select");
			}
		}
	};
	
	var _busiactiontypeChoose = function(flag,fn){
		if(fn=="ysl"){
			$("#tcmc").html("套餐名称：");
			$("#tcuim").html("UIM卡号：");
			$("#tcuim").removeAttr("style");
			$("#tccphm").html("产品号码：");
			$("#tcname").show();
			$("#tcfflx").show();
			$("#tcbm").show();
			$("#tccpmm").show();
			$("#tccpgg").show();
			$("#tcxh").show();
			$("#tuim").show();
		}
		
		$("#busiactiontype").empty();
		var busitypecd = $(flag).val();
		if(busitypecd==""){
			return;
		}
		var params = {"busitypecd":busitypecd} ;
		var url=contextPath+"/app/order/querybusiactiontype";
		var response = $.callServiceAsJson(url, params);
		if(response.code==0){
			var data = response.data ;
			if(data!=undefined && data.length>0){
				for(var i=0;i<data.length;i++){
					var busiactionTypedate = data[i];
					$("#busiactiontype").append("<option value='"+busiactionTypedate.actionTypeCd+"' >"+busiactionTypedate.name+"</option>");
				}
			}else{
				$("#busiactiontype").append("<option value=''>请选择</option>");
			}
			$.refresh($("#ywdzc"));
			if(fn=="ysl"){
				$("#taocan").show();
				$("#fushu").show();
				$("#zhongduan").show();
				$("#dealerAidDiv").show();
				$("#beizhu").show();
				$("#feiyong").show();
				$("#tijiao").show();
				if(busitypecd=="3"){
					$("#tcmc").html("新套餐名称：");
					$("#tcuim").html("UIM卡号[3转4补换卡]：");
					$("#tcuim").css({'width':'140px','margin-left':'-50px'});
					$("#tccphm").html("原产品号码：");
					$("#tcfflx").hide();
					$("#tccpmm").hide();
//						$("#tccpgg").hide();
					$("#tcxh").hide();
					$("#zhongduan").hide();
				}else if (busitypecd=="4"){
					$("#tcuim").html("UIM卡号[3转4补换卡]：");
					$("#tcuim").css({'width':'140px','margin-left':'-50px'});
					$("#tccphm").html("原产品号码：");
					$("#tcname").hide();
					$("#tcfflx").hide();
					$("#tcbm").hide();
					$("#tccpmm").hide();
//						$("#tccpgg").hide();
					$("#tcxh").hide();
					$("#zhongduan").hide();
				}else if (busitypecd=="2"){
					$("#tcuim").html("新UIM卡号：");
					$("#tccphm").html("原产品号码：");
					$("#tcname").hide();
					$("#tcfflx").hide();
					$("#tcbm").hide();
					$("#tccpmm").hide();
					$("#tccpgg").hide();
					$("#tcxh").hide();
					$("#fushu").hide();
					$("#zhongduan").hide();
					$("#dealerAidDiv").hide();
				}else if (busitypecd=="5" || busitypecd=="6" || busitypecd=="7" || busitypecd=="8"){
					$("#tccphm").html("原产品号码：");
					$("#tcname").hide();
					$("#tcfflx").hide();
					$("#tuim").hide();
					$("#tcbm").hide();
					$("#tccpmm").hide();
					$("#tccpgg").hide();
					$("#tcxh").hide();
					$("#fushu").hide();
					$("#zhongduan").hide();
					$("#dealerAidDiv").hide();
				}
			}
		}
	};
	
	var _genRandPass6Input = function(){
		var pwd=$("#pwd").val();
		if(pwd=="******"){
			pwd = order.main.genRandPass6();
			$("#pwd").val(pwd);
		}
	};
	
	var _searchPack = function(){
		var qryStr = $("#qryStr").val();
		var params={"subPage":"","qryStr":qryStr,"pnLevelId":"","custId":"","PageIndex":1,"PageSize":10,"orderflag":"ysl"};
		order.service.queryData(params);
	};
	
	var _confirmoffer = function(id,name){
		$("#offer_spec_name").val(name);
		$("#offer_spec_cd").val(id);
		easyDialog.close();
		OrderInfo.actionFlag=1;
		OrderInfo.offerSpec.offerSpecId=id;
		OrderInfo.offerSpec.offerSpecName=name;
		var dealertr = $("#dealerTbody").find("tr");
		dealertr.each(function(){
			if($(this).children().eq(0).html()=="主套餐"){
				$(this).remove();
			}
		});
		order.dealer.initDealer();
	};
	
	var _addParam = function(){
		OrderInfo.order.soNbr = UUID.getDataId();
		OrderInfo.cust.custId = '-1';
		var prodSpecId = $("#prodSpecId").val();
		var offerSpecId = $("#offer_spec_cd").val();
//		if(offerSpecId==''){
//			$.alert("提示","请先查询套餐！");
//			return;
//		}
		var param = {   
				prodId : "-1",
			    prodSpecId : prodSpecId,
			    offerSpecIds : [offerSpecId],
			    ifCommonUse : "" 
			};
		var offerSepcName = $("#search_text_-1").val();
		if(offerSepcName.replace(/\ /g,"")==""){
			$.alert("提示","请输入查询条件！");
			return;
		}
		param.offerSpecName = offerSepcName;
		var data = query.offer.searchAttachOfferSpec(param);
		if(data!=undefined){
			$("#attach_div_-1").html(data).show();
		}
//		AttachOffer.searchAttachOfferSpec('-1',offerSpecId,prodSpecId);
	};
	
	var _confirmAttachOffer = function(name,id,prodflag){
		$("#prod_spec_cd").val(id);
		$("#prod_spec_name").val(name);
//		$("#prodtype").val(prodflag);
		for(var i=0;i<document.getElementById("prodtype").options.length;i++){
	        if(document.getElementById("prodtype").options[i].value == prodflag){
	            document.getElementById("prodtype").options[i].selected=true;
	            break;
	        }
	    }
		$.refresh($("#ywlxc2"));
		$("#attach_div_-1").hide();
	};
	
	var _addprod = function(){
		var attid = $("#prod_spec_cd").val();
		var attname = $("#prod_spec_name").val();
		var atttype = $("#prodtype").val();
		var proactiontype = $("#proactiontype").val();
		if(attid=="" || attname==""){
			$.alert("提示","产品编码或名称不能为空！");
			return;
		}
		var addflag = "true";
		var $openkxbdiv = $("#openkxblist").find("a");
		var $opengncpdiv = $("#opengncplist").find("a");
		var $closekxbdiv = $("#closekxblist").find("a");
		var $closegncpdiv = $("#closegncplist").find("a");
		$openkxbdiv.each(function(){
			if($(this).attr("id")==attid){
				addflag = "false";
				$.alert("提示","已添加该产品！");
				return;
			}
		});
		$opengncpdiv.each(function(){
			if($(this).attr("id")==attid){
				addflag = "false";
				$.alert("提示","已添加该产品！");
				return;
			}
		});
		$closekxbdiv.each(function(){
			if($(this).attr("id")==attid){
				addflag = "false";
				$.alert("提示","已添加该产品！");
				return;
			}
		});
		$closegncpdiv.each(function(){
			if($(this).attr("id")==attid){
				addflag = "false";
				$.alert("提示","已添加该产品！");
				return;
			}
		});
		if(addflag == "false"){
			return;
		}
		var htmlStr="<a href=\"javascript:void(0);\"  id="+attid+" class=\"list-group-item\"> <h5 class=\"list-group-item-heading\">"+attname+"<span onclick=\"order.ysl.delprod('"+attid+"','"+attname+"','"+atttype+"','"+proactiontype+"')\" class=\"glyphicon glyphicon-remove pull-right\" aria-hidden=\"true\"></span></h5>";
		$("#myTab").find("li").removeClass("active");
		$("#myTabContent").find("div").removeClass("in");
		$("#myTabContent").find("div").removeClass("active");
		if(proactiontype=="ADD"){//开通
			$("#openfushu").addClass("active");
			if(atttype=="1"){//可选包
				$("#openkxblist").append(htmlStr);
				$("#openkxb").addClass("active");
				$("#openkxb").addClass("in");
			}else{//功能产品
				$("#opengncplist").append(htmlStr);
				$("#opengncp").addClass("active");
				$("#opengncp").addClass("in");
			}
		}else if(proactiontype=="DEL"){//关闭
			$("#closefushu").addClass("active");
			if(atttype=="1"){//可选包
				$("#closekxblist").append(htmlStr);
				$("#closekxb").addClass("active");
				$("#closekxb").addClass("in");
			}else{//功能产品
				$("#closegncplist").append(htmlStr);
				$("#closegncp").addClass("active");
				$("#closegncp").addClass("in");
			}
		}
		var open = {
			id : attid,
			name : attname,
			type:atttype,
			proactiontype:proactiontype
		};
		order.ysl.openList.push(open);
	};
	
	var _delprod = function(id,name,type,actiontype){
		var $button="<span onclick=\"order.ysl.delprod('"+id+"','"+name+"','"+type+"','"+actiontype+"')\" class=\"glyphicon glyphicon-remove pull-right\" aria-hidden=\"true\"></span>";
		var $span = $("#"+id).find("h5"); //定位删除的附属
		if($span.find("del")!=undefined&&$span.find("del")!=null&&$span.find("del").html()!=undefined){  //已经取消订购，再订购
			$span.html($span.find("del").html()+$button);
			var open = {
					id : id,
					name : name,
					type:type,
					proactiontype:actiontype
				};
			order.ysl.openList.push(open);
		}else { //取消订购
			$span.html("<del class=\"text-warning\">"+name+"</del>"+$button);
			for (var i = 0; i < order.ysl.openList.length; i++) {
				if(order.ysl.openList[i].id==id){
					order.ysl.openList.splice(i,1);
				}
			} 
			/*if(type=="1"){
				order.dealer.removeAttDealer("-1_"+id); //删除协销人
			}*/
		}
	};
	
	var _adddealer = function(sign){
		if(sign=="tc"){
			var name = $("#offer_spec_name").val();
			var id = $("#offer_spec_cd").val();
			if(id!="" && name !=""){
				OrderInfo.actionFlag=1;
				OrderInfo.offerSpec.offerSpecId=id;
				OrderInfo.offerSpec.offerSpecName=name;
				/*var dealertr = $("#dealerTbody").find("tr");
				dealertr.each(function(){
					if($(this).children().eq(0).html()=="主套餐"){
						$(this).remove();
					}
				});
				order.dealer.initDealer();*/
			}
		}else if(sign=="kxb"){
			var phoneNumber = $("#choosedNumSpan").val();
			var dealertr = $("#dealerTbody").find("tr");
			dealertr.each(function(){
				if($(this).attr("name").indexOf("tr_-1_")!=-1){
					var subnum = $(this).attr("name").substring(3);
					order.dealer.changeAccNbr(subnum,phoneNumber);
				}
			});
		}
	};
	
	var paytr = 0;
	var _addpayinfo = function(){
		var payitems = "";
		var payitemcd = "";
		var paymoney = $("#paymoney").val();
		if(document.getElementById("payitems").style.display=="none"){
			payitems = $("#selpayitems").find("option:selected").html();
			payitemcd = $("#selpayitems").val();
		}else{
			payitems = $("#payitems").val();
			payitemcd = "";
		}
		if(document.getElementById("payitems").style.display=="block"){
			if(payitems==""){
				$.alert("提示","费用项不能为空！");
				return;
			}
		}
		if(paymoney==""){
			$.alert("提示","金额不能为空！");
			return;
		}else{
			paymoney = parseFloat($("#paymoney").val()).toFixed(2);
		}
		var addflag = "true";
		var paytbody = $("#payTbody").find("tr");
		paytbody.each(function(){
			if($(this).children("td").eq(0).html()==payitems){
				addflag = "false";
				$.alert("提示","已添加该费用项！");
				return;
			}
		});
		if(addflag == "false"){
			return;
		}
		var paytype = $("#paytype").find("option:selected").html();
		var paytypecd = $("#paytype").val();
		paytr++;
		$("#payTbody").append("<tr id='paytr_"+paytr+"'><td acct_item_type_id='"+payitemcd+"'>"+payitems+"</td><td>"+paymoney+"</td><td paytypecd='"+paytypecd+"'>"+paytype+"</td><td><span class=\"glyphicon glyphicon-remove pull-right\" aria-hidden=\"true\" onclick=\"order.ysl.delpay('paytr_"+paytr+"')\"></span></td></tr>");
	};
	
	var _delpay = function(id){
		$("#"+id).remove();
	};
	
	var _suborderysl = function(){
		if($("#cmCustName").val()==""){
			$.alert("提示","客户姓名不能为空！","information");
			return;
		}
		var custIdCard="";
		if($("#identidiesTypeCd").val()==1){
			custIdCard=$("#cmCustIdCard").val();
		}else{
			custIdCard=$("#cmCustIdCardOther").val();
		}
		if(custIdCard==""){
			$.alert("提示","证件号码不能为空！","information");
			return;
		}
		if($("#cmAddressStr").val()==""){
			$.alert("提示","客户地址不能为空！","information");
			return;
		}
		var busitype = $("#busitype").val();
		if(busitype=="1" || busitype=="3"){
			if($("#offer_spec_name").val()==""){
				$.alert("提示","套餐名称不能为空！","information");
				return;
			}
			if($("#offer_spec_cd").val()==""){
				$.alert("提示","套餐编码不能为空！","information");
				return;
			}
		}
		if(busitype=="1" || busitype=="3" || busitype=="2"){
			if($("#uimcode").val()==""){
				$.alert("提示","UIM卡号不能为空！","information");
				return;
			}
		}
		if($("#choosedNumSpan").val()==""){
			$.alert("提示","产品号码不能为空！","information");
			return;
		}
		var pwd = $("#pwd").val();
		var prodSpecId = $("#prodSpecId").val();
		var payment_type_cd = $("#payment_type_cd").val();
		if(busitype=="1"){
			if(pwd==""){
				$.alert("提示","产品密码不能为空！","information");
				return;
			}
//			if($("#terminalcode").val()==""){
//				$.alert("提示","终端串码不能为空！","information");
//				return;
//			}
		}else{
			pwd = "";
			prodSpecId = "";
			payment_type_cd = "";
		}
//		if($("#prod_spec_cd").val()=="" && $("#prod_spec_name").val()!=""){
//			$.alert("提示","可选包/功能编码不能为空！","information");
//			return;
//		}
//		if($("#prod_spec_cd").val()!="" && $("#prod_spec_name").val()==""){
//			$.alert("提示","可选包/功能名称不能为空！","information");
//			return;
//		}
		
		var orderbean = {
				CUST_TYPE_CD:$("#partyTypeCd").val(),
				IDENTIDIES_TYPE_CD:$("#identidiesTypeCd").val(),
				IDENTITY_NUM:custIdCard,
				NAME:$("#cmCustName").val(),
				ADDRESS_STR:$("#cmAddressStr").val(),
				CONTACT_NO:$("#phonenumber").val(),
				BUSI_TYPE_CD:$("#busitype").val(),
				ACTION_TYPE_CD:$("#busiactiontype").val(),
				REMARKS:$("#order_remark").val(),
				PAYMENT_TYPE_CD:payment_type_cd,
				uimcode:$("#uimcode").val(),
				ACCESS_NBR:$("#choosedNumSpan").val(),
				PROD_PWD:pwd,
				PROD_SPEC_ID:prodSpecId,
				terminalcode:$("#terminalcode").val(),
				paytotal:0,
				openofferMap:{},
				dealerMap:{},
				paymentMap:{}
		};
		var prom = {
				id : $("#offer_spec_cd").val(),
				name : $("#offer_spec_name").val(),
				type:"0",
				proactiontype:"ADD"
		};
		order.ysl.openList.push(prom);
		orderbean.openofferMap = order.ysl.openList;
		
		/*var dealername = "true";
		var dealerbean = [];
		var dealertr = $("#dealerTbody").find("tr");
		dealertr.each(function(){
			var debean = {
					STAFF_ID:"",
					STAFF_NBR:"",
					SALE_NBR:"",
					SALE_NAME:"",
					DEVELOP_TYPE:"",
					detype:"",
					dename:""
			}
			debean.STAFF_ID = $(this).children("td").eq(3).children("input").attr("staffid");
			debean.STAFF_NBR = $("#qryStaffCode").val();
			debean.SALE_NBR = $("#qrySalesCode").val();
			debean.SALE_NAME = $(this).children("td").eq(3).children("input").val();
			debean.DEVELOP_TYPE = $(this).children("td").eq(2).children("select").val();
			debean.dename = $(this).children("td").eq(1).html().replace(/（包含接入产品）/,"");
			if(debean.SALE_NAME==""){
				dealername = "false";
				return;
			}
			if($(this).attr("name").indexOf("tr_-1_")!=-1){
				debean.detype = "1";
			}else{
				debean.detype = "0";
			}
			dealerbean.push(debean);
		});
		if(dealername=="false"){
			$.alert("提示","发展人不能为空！","information");
			return;
		}
		orderbean.dealerMap = dealerbean;*/
		
		
		var paytbody = $("#payTbody").find("tr");
		paytbody.each(function(){
			var paybean={
					ACCT_ITEM_TYPE_ID:"",
					ACCT_ITEM_TYPE:"",
					PAY_METHOD_CD:"",
					PAY_METHOD_TYPE:"",
					ACCT_ITEM_FEE:""
			};
			paybean.ACCT_ITEM_TYPE_ID = $(this).children("td").eq(0).attr("acct_item_type_id");
			paybean.ACCT_ITEM_TYPE = $(this).children("td").eq(0).html();
			paybean.ACCT_ITEM_FEE = $(this).children().eq(1).html();
			paybean.PAY_METHOD_CD = $(this).children("td").eq(2).attr("paytypecd");
			paybean.PAY_METHOD_TYPE = $(this).children("td").eq(2).html();
			orderbean.paytotal += parseInt(paybean.ACCT_ITEM_FEE);
			order.ysl.paymentbean.push(paybean);
		});
		orderbean.paymentMap = order.ysl.paymentbean;
		
		var url=contextPath+"/app/order/suborderysl";
		var response = $.callServiceAsJson(url, orderbean);
		if (response.code == -2) {
			$.alertM(response.data);
		}
		if (response.code == 1002) {
			$.alertM(response.data);
//			$.alert("错误","预受理订单提交失败","information");
			return;
		}
		if(response.code==0){
			order.ysl.CUST_SO_NUMBER = response.data.CUST_SO_NUMBER;
			order.ysl.CUST_ORDER_ID = response.data.CUST_ORDER_ID;
			order.ysl.INVOICE_ID = response.data.INVOICE_ID;
//			$("#buyid").html("购物车流水号："+response.data.CUST_SO_NUMBER);
//			$("#buynum").html("产品号码：："+$("#choosedNumSpan").val());
//			$("#finishpage").show();   //打印发票，打印回执功能未开发 暂时屏蔽
//			$("#tijiao").hide();
//			order.ysl.realmoney=orderbean.paytotal*1;
//			if (order.ysl.realmoney > 0) {
//				$("#printfp").show();
//				$("#printfp").removeClass("btna_g");
//				$("#printfp").addClass("btna_o");
//				$("#printfp").attr("onclick","order.ysl.invoiceprint()");
//			}
//			$.alert("提示","预受理成功！","information");
			$("#yslbuyid").html(response.data.CUST_SO_NUMBER);
			$("#yslbuynum").html($("#choosedNumSpan").val());
			if(order.ysl.paymentbean.length>0){
				//显示费用项
				for(var i=0;i<order.ysl.paymentbean.length;i++){
					var item = order.ysl.paymentbean[i];
					var contHtml = "";
					var contHtml = contHtml + '<li class="list-group-item">';
					var contHtml = contHtml + '<h4 class="list-group-item-heading">费用名称</h4>';
					var contHtml = contHtml + '<p class="list-group-item-text" id="">'+item.ACCT_ITEM_TYPE+'</p>';
					var contHtml = contHtml + '<h4 class="list-group-item-heading">费用（元）</h4>';
					var contHtml = contHtml + '<p class="list-group-item-text" id="">'+item.ACCT_ITEM_FEE+'</p>';
					var contHtml = contHtml + '<h4 class="list-group-item-heading">付费方式</h4>';
					var contHtml = contHtml + '<p class="list-group-item-text" id="">'+item.PAY_METHOD_TYPE+'</p>';
					var contHtml = contHtml + '</li>';
					$("#orderTbody").append(contHtml);
				}
			}
			$("#yslpage").hide();
			$("#order").hide();
			$("#successContent").show();
		}
	};
	
	var _invoiceprint = function(){
			if (CONST.getAppDesc() == 0) {
				var tempUrl = contextPath+"/print/getInvoiceTemplates";
				var tempParam = {
					'areaId' : OrderInfo.staff.areaId
				};
				var tempResp = $.callServiceAsJson(tempUrl, tempParam, {});
				if (tempResp.code == -2) {
					$.alertM(tempResp.data);
					return;
				} else if (tempResp.code != 0) {
					$.alert("提示",ec.util.defaultStr(tempResp.data, "获取打印模板出错"));
					return;
				} else {
					var tempData = tempResp.data;
					if (tempData.resultCode != 'POR-0000') {
						$.alert("提示",ec.util.defaultStr(tempData.resultMsg, "获取打印模板异常"));
						return;
					}
					if (tempData.length == 0) {
						$.alert("提示", "没有获取到可用的打印模板");
						return;
					}
					var tempHtml = "";
					var tempList = tempData.tempList;
					if (typeof tempList != undefined && tempList.length > 0) {
						tempHtml += "<option selected='selected' value="+tempList[0].templateId+">"+tempList[0].templateName+"</option>";
						for(var i = 1; i < tempList.length; i++){
							var template = tempList[i];
							tempHtml += "<option value="+template.templateId+">"+template.templateName+"</option>";
						}
					}
					$("#tempListSel").html(tempHtml);
				}
			} else {
				$("#tempListSel").parent().parent().hide();
			}
			
			
			//显示接入号
			var selHtml = "";
			var acceNbr = $("#choosedNumSpan").val();
//			var prodInfo = qccResp.data.prodInfo;
//			if (prodInfo != undefined && prodInfo.length > 0) {
//				selHtml+="<option selected='selected' value="+prodInfo[0].accessNumber+">"+prodInfo[0].accessNumber+"</option>";
//				for(var i=1;i<prodInfo.length;i++){
//					var prod = prodInfo[i];
					selHtml+="<option value="+acceNbr+">"+acceNbr+"</option>";
//				}
//				$("#acceNbrSel").data("prodInfo", prodInfo);
//			}
			$("#acceNbrSel").html(selHtml);
			
			
			//显示费用项
			var contHtml = "";
			contHtml+="<div id='invoiceContDiv' class='plan_second_list cashier_tr'>";
			contHtml+="  <table class='contract_list'>";
			contHtml+="  <thead>";
			contHtml+="    <tr>";
			contHtml+="      <td>是否打印</td><td>费用名称</td><td>费用(元)</td><td>付费方式</td>";
			contHtml+="    </tr>";
			contHtml+="  </thead>";
			contHtml+="  <tbody>";
//			var chargeItems = qccResp.data.chargeItems;
			for(var i=0;i<order.ysl.paymentbean.length;i++){
				var item = order.ysl.paymentbean[i];
				if (i == 0) {
					$("#invoiceTitleInp").val($("#cCustName").val());
				}
				contHtml+="<tr realAmount="+item.ACCT_ITEM_FEE+" payMethodName="+item.PAY_METHOD_CD+" acctItemTypeName="+item.ACCT_ITEM_TYPE+">";
//				if (_checkChargeItem(item)) {
					contHtml+="      <td><input type='checkbox' name='invoiceItemsChkBox' checked='checked'/></td>";
//				} else {
//					contHtml+="      <td><input type='checkbox' name='invoiceItemsChkBox' disabled='disabled'/></td>";
//				}
				contHtml+="      <td>"+item.ACCT_ITEM_TYPE+"</td>";
				contHtml+="      <td>"+item.ACCT_ITEM_FEE+"</td>";
				contHtml+="      <td>"+item.PAY_METHOD_TYPE+"</td>";
				contHtml+="    </tr>";
			}
			contHtml+="  </tbody>";
			contHtml+="  </table>";
			contHtml+="</div>";
			$("#invoiceItemsContDiv").html(contHtml);
			$("#ec-dialog-form-content").css("height", "auto");
			$("input[name=billType]").off("click").on("click",function(event){
				if ($("input[name=billType]:checked").val()=="0") {
					$("#invoiceNbrNumDl").show();
					$("#titleDt").html("发票抬头：");
					$("#tempDt").html("发票模板：");
//					param.billType = 0;
				} else {
					$("#invoiceNbrNumDl").hide();
					$("#titleDt").html("票据抬头：");
					$("#tempDt").html("票据模板：");
//					param.billType = 1;
				}
			});
			$("#billTypeVo").hide();
			$("#invoiceItemsConfirm").off("click").on("click",function(event){
//				if (common.print.oldInvoiceFlag != '0') {
//					$.alert("信息", "存在未作废发票，请先确定作废发票");
//					return;
//				}
				_saveInvoiceInfo();
			});
			
			ec.form.dialog.createDialog({
				"id":"-invoice-items",
				"width":580,
//				"height":450,
				"zIndex":1100,
				"initCallBack":function(dialogForm,dialog){
					common.print.dialogForm=dialogForm;
					common.print.dialog=dialog;
					$("#invoiceItemsConCancel").off("click").on("click",function(event){
						common.print.closePrintDialog();
					});
				},
				"submitCallBack":function(dialogForm,dialog){
				
				},
				"closeCallBack":function(dialogForm,dialog){
				
				}
			});
		};
		
		var _saveInvoiceInfo=function(){
			var invoiceInfos = [];
			var invoiceInfo = {
				"acctItemIds": [],
				"instanceType": 2,//根据过滤取值，优先为产品或销售品，2-产品，7-销售品
				"instanceId": 0,//根据过滤取值，优先为产品或销售品
				"invoiceType": "58B", //58A:电子发票；58B:纸币发票
				"staffId": OrderInfo.staff.staffId,
				"amount": 0,
				"realPay": 0,
				"tax": 0,//可为空，暂为0
				"invoiceNbr": 0,//发票代码，前台人工输入，票据时可为空
				"invoiceNum": "0",//发票号码，前台人工输入，票据时可为空
				"custOrderId": order.ysl.CUST_ORDER_ID,
				"custSoNumber": order.ysl.CUST_SO_NUMBER,
				"custId": "",
				"commonRegionId": OrderInfo.staff.areaId,
				"channelId": OrderInfo.staff.channelId,
				"bssOrgId": OrderInfo.staff.orgId,
				"acctNbr": 0,//接入号码，根据5.12接口返回展示，前台选择
				"paymethod": 100000,
				"busiName": "具体业务说明",//可为空
				"rmbUpper": "人民币大写",//固定此值
				"accountUpper": "零圆整",
				"account": 0,
				"billType": 0,//票据类型：0发票，1收据
				"printFlag": -1,//打印标记：0正常打印，1重打票据，2补打票据，-1未打印
				"invoiceId": order.ysl.INVOICE_ID,
				"boActionTypeName":$("#busitype option:selected").text()
			};
			//设置invoiceId
//			invoiceInfo.invoiceId = queryResult.invoiceInfos[0].invoiceId;
			//设置票据类型
			invoiceInfo.billType = $("input[name='billType']:checked").val();
			
//			var instanceFlag = false;
//			var sumFeeAmount = 0;
			var sumRealAmount = 0;
//			var sumTax = 0;
			var items = [];
			var payMethodName = "";
			//获取费用项和接入号的关系
//			var rela = _getAcceNbrBoIdRela(queryResult);
//			invoiceInfo.acctItemIds = [];
			$("#invoiceContDiv tbody input:checked").parent().parent().each(function(){
				//设置账单项ID
//				invoiceInfo.acctItemIds.push({"acctItemId": $(this).attr("acctItemId")});
				//设置实例id和类型，优先为产品或销售品，2-产品，7-销售品
//				if ($(this).attr("objType") == "2") {
//					invoiceInfo.instanceType = $(this).attr("objType");
//					invoiceInfo.instanceId = $(this).attr("objId");
//					invoiceInfo.paymethod = $(this).attr("payMethodCd");
//					instanceFlag = true;
//				} else if (!instanceFlag && $(this).attr("objType") == "7") {
//					invoiceInfo.instanceType = $(this).attr("objType");
//					invoiceInfo.instanceId = $(this).attr("objId");
//					invoiceInfo.paymethod = $(this).attr("payMethodCd");
//				}
				//计算金额
//				sumFeeAmount += parseInt($(this).attr("realAmount"));
				sumRealAmount += parseInt($(this).attr("realAmount"));
//				sumTax += parseInt($(this).attr("tax"));
//				var accessNumber = '';
//				var boId = $(this).attr("boId");
//				for (var i=0; i < rela.length; i++) {
//					if (boId == rela[i].boId) {
//						accessNumber = rela[i].accessNumber;
//					}
//				}
				
				items.push({
					"itemName" : $(this).attr("acctItemTypeName"),
					"charge" : parseInt($(this).attr("realAmount"))*100,
					"tax" : 0,
					"acceNumber" : $("#acceNbrSel option:selected").val()
				});
				payMethodName = $(this).attr("payMethodName");
			});
//			if(OrderInfo.actionFlag==11){
//				invoiceInfo.printFlag = 0;
//			}
			
			//设置金额
			invoiceInfo.amount = sumRealAmount;
			invoiceInfo.realPay = sumRealAmount;
//			invoiceInfo.tax = sumTax;
			invoiceInfo.account = sumRealAmount*100;
			invoiceInfo.accountUpper = ec.util.atoc(sumRealAmount*100);
			//取实例ID和类型
			invoiceInfo.invoiceNbr = $("#invoiceNbrInp").val();
			invoiceInfo.invoiceNum = "" + $("#invoiceNumInp").val();
			//取接入号
			invoiceInfo.acctNbr = $("#acceNbrSel option:selected").val();
			invoiceInfo.busiName = $("#busitype option:selected").text();
			invoiceInfos.push(invoiceInfo);
			
			var invoiceParam = {
				"partyName" : $("#invoiceTitleInp").val(),
				"templateId" : $("#tempListSel :selected").val(),
				"prodInfo" : [],
				"items" : items,
				"payMethod" : $("#paytype option:selected").text(),
				"invoiceInfos" : invoiceInfos,
				"printflag":"true"
			};
			_printInvoice(invoiceParam);
			var url=contextPath+"/order/suborderysl";
			var response = $.callServiceAsJson(url, invoiceParam);
			//最终关闭窗口
			common.print.closePrintDialog();
			return;
		};
		
		var _printInvoice=function(invoiceParam){
			$("#invoiceForm").remove();
			if(_getCookie('_session_pad_flag')=='1'){
				var arr=new Array(3);
				if(ec.util.browser.versions.android){
					arr[0]='print/invoice';
				}else{
					arr[0]='print/iosInvoice';
				}
				arr[1]='invoiceParam';
				arr[2]=encodeURI(JSON.stringify(invoiceParam));
				MyPlugin.printShow(arr,
	                function(result) {
	                },
	                function(error) {
	                }
				);
			}else{
			    $("<form>", {
			    	id: "invoiceForm",
			    	style: "display:none;",
			    	target: "_blank",
			    	method: "POST",
			    	action: contextPath + "/print/invoice"
			    }).append($("<input>", {
			    	id : "invoiceParam",
			    	name : "invoiceParam",
			    	type: "hidden",
			    	value: encodeURI(JSON.stringify(invoiceParam))
			    })).appendTo("body").submit();
			}
//			$("#printfp").html("<a class=\"btna_g\"><span>打印发票</span></a>");
			$("#printfp").removeClass("btna_go");
			$("#printfp").addClass("btna_g");
			$("#printfp").attr("onclick","");
		};
		
		var _printVoucher = function(){
			var result = {
					"custInfo":{},
					"orderEvent":[],
					"feeInfos":{},
					"remarkInfos":[],
					"advInfos":[],
					"terminalInfos":[],
					"agreements":{},
					"orderListInfo":{},
					"chargeItems":[]
			};
			//客户信息
			var custInfoMap = {"norCustInfo":[]};
			var norCustInfo = [];
			if($("#identidiesTypeCd").val()==1){
				custIdCard=$("#cmCustIdCard").val();
			}else{
				custIdCard=$("#cmCustIdCardOther").val();
			}
			custInfoMap.norCustInfo.push({"itemName":"客户名称","itemValue":$("#cmCustName").val()});
			custInfoMap.norCustInfo.push({"itemName":"联系电话","itemValue":$("#phonenumber").val()});
			custInfoMap.norCustInfo.push({"itemName":"证件类型","itemValue":$("#identidiesTypeCd option:selected").text()});
			custInfoMap.norCustInfo.push({"itemName":"证件号码","itemValue":custIdCard});
			custInfoMap.norCustInfo.push({"itemName":"通信地址","itemValue":$("#cmAddressStr").val()});
			custInfoMap.norCustInfo.push({"itemName":"邮政编码","itemValue":"无"});
			custInfoMap.norCustInfo.push({"itemName":"电子邮箱","itemValue":"无"});
//			custInfoMap.norCustInfoMap = norCustInfo;
			result.custInfo = custInfoMap;
			//业务数据
//			if($("#busitype").val()=="1" || $("#busitype").val()=="3"){
				var orderEvent1 = {
						"orderEventType":"1",
						"orderEventTitle":{},
						"orderEventCont":{}
				};
				var orderEventTitleparem = {
						"attachOfferSpecName":"",
						"boActionTypeCd":$("#busiactiontype").val(),
						"boActionTypeName":$("#busiactiontype option:selected").text(),
						"effectRule":"立即生效",
						"prodSpecName":$("#offer_spec_name").val(),
						"summary":$("#offer_spec_name").val()
				};
				orderEvent1.orderEventTitle = orderEventTitleparem;
				var orderEventContparem = {
						"osAttachInfos":{},
						"osBaseInfo":[],
						"osOtherInfo":[],
						"osOutInfos":[],
						"userAcceNbrs":[]
				};
				var userAcceNbrsparem={
						"acceNbr":$("#choosedNumSpan").val(),
						"acceType":$("#prodSpecId option:selected").text(),
						"donateItems":[],
						"isAloneLine":"Y",
						"isBarCode":"Y",
						"itemParam":{},
						"memberRoleCd":"",
						"memberRoleName":"一般构成成员",
						"objId":$("#prodSpecId").val(),
						"offerProdAttr":[],
						"roleCd":"",
						"roleName":"一般构成成员",
						"userType":"新开户"
				};
				orderEventContparem.userAcceNbrs.push(userAcceNbrsparem);
				orderEvent1.orderEventCont = orderEventContparem;
				result.orderEvent.push(orderEvent1);
//			}
			
			if($("#busitype").val()=="1" || $("#busitype").val()=="3" || $("#busitype").val()=="4"){
				if(order.ysl.openList.length > 0){
					var orderEvent3 = {
							"orderEventType":"3",
							"orderEventTitle":{},
							"orderEventCont":[]
					};
					var orderEventTitleparem = {
							"boActionTypeCd":"7",
							"boActionTypeName":"变更",
							"prodSpecName":$("#prodSpecId option:selected").text()
					};
					for(var i=0;i<order.ysl.openList.length;i++){
						if(order.ysl.openList[i].type!="0"){
							var orderEventContparem3 = {
									"actionName":"",
									"effectRule":"立即生效",
									"isAloneLine":"Y",
									"itemName":"",
									"itemParam":"",
									"objId":"",
									"relaAcceNbr":$("#choosedNumSpan").val()
							};
							var actionName = "";
							if(order.ysl.openList[i].proactiontype=="ADD"){
								actionName="开通";
							}else if(order.ysl.openList[i].proactiontype=="DEL"){
								actionName="关闭";
							}
							orderEventContparem3.actionName=actionName;
							orderEventContparem3.itemName=order.ysl.openList[i].name;
							orderEventContparem3.objId=order.ysl.openList[i].id;
							orderEvent3.orderEventCont.push(orderEventContparem3);
							orderEvent3.orderEventTitle = orderEventTitleparem;
						}
					}
					result.orderEvent.push(orderEvent3);
				}
			}
			//费用信息
			if(order.ysl.paymentbean.length>0){
				var chargeItems = {"chargeItems":[]};
				var feeInfos = {"acctFeeInfos":[]};
				for (var j=0;j<order.ysl.paymentbean.length;j++){
					var chargeItemsparem = {
							"accNbr":$("#choosedNumSpan").val(),
							"acctItemId":"",
							"acctItemTypeId":order.ysl.paymentbean[j].ACCT_ITEM_TYPE_ID,
							"acctItemTypeName":order.ysl.paymentbean[j].ACCT_ITEM_TYPE,
							"amount":parseInt(order.ysl.paymentbean[j].ACCT_ITEM_FEE)*100,
							"areaId":OrderInfo.staff.areaId,
							"billId":"",
							"billingCycleId":"",
							"boActionTypeCd":"",
							"boActionTypeName":$("#busitype option:selected").text(),
							"boId":"",
							"createDate":"",
							"custId":"",
							"custName":$("#cCustName").val(),
							"invoiceNum":"",
							"modifyReasonCd":"",
							"objectName":"",
							"offerId":"",
							"offerInstId":"",
							"olId":"",
							"payMethodName":order.ysl.paymentbean[j].PAY_METHOD_TYPE,
							"payedState":"N",
							"paymentAmount":parseInt(order.ysl.paymentbean[j].ACCT_ITEM_FEE)*100,
							"paymentId":"",
							"paymentSeriaNbr":"-1",
							"perferCash":"",
							"perferReason":"",
							"prodInstId":"",
							"prodSpecId":$("#prodSpecId").val(),
							"readDate":"",
							"realAmount":parseInt(order.ysl.paymentbean[j].ACCT_ITEM_FEE)*100,
							"statusCd":"记录有效",
							"statusDate":""
					};
					chargeItems.chargeItems.push(chargeItemsparem);
					
					var chargeItemsparem1 = {
							"realAmount":parseInt(order.ysl.paymentbean[j].ACCT_ITEM_FEE)*100,
							"feeAmount":parseInt(order.ysl.paymentbean[j].ACCT_ITEM_FEE)*100,
							"paymentAmount":parseInt(order.ysl.paymentbean[j].ACCT_ITEM_FEE)*100,
							"acctItemTypeId":order.ysl.paymentbean[j].ACCT_ITEM_TYPE_ID,
							"objId":$("#prodSpecId").val(),
							"objType":"",
							"acctItemId":"",
							"boId":"",
							"prodId":"",
							"objInstId":"",
							"payMethodCd":order.ysl.paymentbean[j].PAY_METHOD_CD,
							"posSeriaNbr":"-1",
							"chargeModifyReasonCd":"1",
							"remark":"",
							"boActionType":""
					};
					result.chargeItems.push(chargeItemsparem1);
				}
				feeInfos.acctFeeInfos.push(chargeItems);
				result.feeInfos = feeInfos;
			}
			//UIM
			if($("#uimcode").val()!=""){
				var terminalInfosparem = {
						"isAloneLine":"Y",
						"tiName":"UIM卡",
						"tiParam":"个",
						"tiRemark":"UIM卡:"+$("#uimcode").val()
				};
				result.terminalInfos.push(terminalInfosparem);
			}
			//终端信息
			if($("#terminalcode").val()!=""){
				var terminalInfosparem = {
						"isAloneLine":"Y",
						"tiName":"终端",
						"tiParam":"个",
						"tiRemark":"终端串码:"+$("#terminalcode").val()
				};
				result.terminalInfos.push(terminalInfosparem);
			}
			//温馨提示
//			result.advInfos.push("为保障对您的及时服务提醒，您会收到以10021号码发送的U.友服务信息。");
//			result.advInfos.push("您可以登录网上营业厅www.uyou.com 或关注官方微信“U.友”，轻松享受网上自助服务。");
			//备注
			if($("#order_remark").val()!=""){
				result.remarkInfos.push($("#order_remark").val());
			}
			
			var voucherInfo = {
					"olId":order.ysl.CUST_ORDER_ID,
					"soNbr":order.ysl.CUST_SO_NUMBER,
					"busiType":"1",
					"chargeItems":"",
					"result":result
				};
			common.print.printVoucher(voucherInfo);
		};
	
		var _getCookie = function(name){
			var cookievalue = "";
			var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
			if(arr != null) {
				cookievalue = unescape(arr[2]);
			}
			return cookievalue;
		};
		
	var _custcreateButton = function() {
	    $('#custCreateForm').off().bind('formIsValid',function(event) {
//		_checkIdentity();
	     }).ketchup({bindElement:"createcustsussbtn"});
    };
    
    var _chooseArea = function(){
		order.area.chooseAreaTreeManger("report/cartMain","p_areaId_val","p_areaId",3);
	};
    
    var _queryyslinfos = function(pageIndex,scroller){
    	var _beginDate = $("#p_startDt").val();
		var _endDate = $("#p_endDt").val();
		if(_beginDate==""||_endDate==""){
			$.alert("提示","请先选择时间段再进行查询");
			return;
		}
		if(_beginDate.replace(/-/g,'')>_endDate.replace(/-/g,'')){
			$.alert("提示","开始时间不能晚于结束时间");
			return;
		}
    	var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
    	var param = {
    			"startDt":$("#p_startDt").val()+" 00:00:00",
				"endDt":$("#p_endDt").val()+" 23:59:59",
				"olNbr":$("#olNbr").val(),
				"busitype":$("#ywlxc").val(),
				"accnum":$("#accnum").val(),
				"custname":$("#custname").val(),
				"CustIdCard":$("#CustIdCard").val(),
				"nowPage":curPage,
				"pageSize":10
    	}
    	var areaId = "" ;
		if($("#p_channelId").val()&&$("#p_channelId").val()!=""){
//			areaId = $("#p_channelId").find("option:selected").attr("areaid");
			areaId = $("#p_channelId").attr("areaid");
//			if(areaId==null||areaId==""||areaId==undefined){
//				$.alert("提示","渠道地区为空，无法查询！");
//				return ;
//			}
			param["channelId"] = $("#p_channelId").val() ;
		}else{
			areaId = $("#p_areaId").val();
			if(areaId==null||areaId==""||areaId==undefined){
				$.alert("提示","请选择 '地区' 再查询");
				return ;
			}
			param["channelId"] = "" ;
		}
		param["areaId"] = areaId;
		
		$.callServiceAsHtmlGet(contextPath+"/app/order/queryyslList",param,{
			"before":function(){
				$.ecOverlay("购物车查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else{
					if(curPage == 1){
							$("#ysl_search").hide();
							$("#ysl_list").html(response.data).show();
							$("#order-ysl-list_scroller").css("transform","translate(0px, -40px) translateZ(0px)");
							if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
						}
						if(curPage > 1){
							$("#all_ysl_list").append(response.data);
							$("#order-ysl-list_scroller").css("transform","translate(0px, -40px) translateZ(0px)");
							if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
						}
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});
    }
    
    var _upOrderInfo = function(sonum,num){
    	var Param = {
				"cust_so_number" : sonum,
				"status_cd" : num,
				"queryflag":"true"
			};
			var url=contextPath+"/order/suborderysl";
			var response = $.callServiceAsJson(url, Param);
			_queryyslinfos(1);
    }
    
    var _queryYslDetail = function(cust_so_number,status_cd){
    	var param = {
    			"cust_so_number":cust_so_number,
    			"status_cd":status_cd,
    			"detail":"true"
    		};
		$.callServiceAsJson(contextPath+"/app/order/queryYslDetail",param,{
			"before":function(){
				$.ecOverlay("详情查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else{
					$("#ysl_list").hide();
					$("#geren").hide();
					$("#feiyongcontainer").hide();
					$("#d_yslInfo").show();
					$("#tcmc").html("套餐名称：");
					$("#tcuim").html("UIM卡号：");
					$("#tcuim").removeAttr("style");
					$("#tccphm").html("产品号码：");
					$("#tcname").show();
					$("#tcfflx").show();
					$("#tcbm").show();
					$("#tccpmm").show();
					$("#tccpgg").show();
					$("#tcxh").show();
					$("#tuim").show();
					$("#taocan").show();
					$("#fushu").show();
					$("#zhongduan").show();
					$("#dealerAidDiv").show();
					$("#beizhu").show();
					$("#feiyong").show();
					order.ysl.certTypeByPartyType();
					var data = response.data ;
					var CUST_ITEM = data.CUST_ITEM;
					var CUST_ORDER = data.CUST_ORDER;
					var taocan = data.taocan;
					var PRODUCT_ITEM = data.PRODUCT_ITEM;
					var COUPON_ITEM = data.COUPON_ITEM;
					var ORDER_FEE = data.ORDER_FEE;
					var closelist = data.closelist;
					var openlist = data.openlist;
					var BUSI_STAFF_RELA = data.BUSI_STAFF_RELA;
					if(ec.util.isArray(CUST_ITEM)){
						for(var i=0;i<document.getElementById("partyTypeCd").options.length;i++){
					        if(document.getElementById("partyTypeCd").options[i].value == CUST_ITEM[0].CUST_TYPE_CD){
					            document.getElementById("partyTypeCd").options[i].selected=true;
					            break;
					        }
					    }
						for(var i=0;i<document.getElementById("identidiesTypeCd").options.length;i++){
					        if(document.getElementById("identidiesTypeCd").options[i].value == CUST_ITEM[0].IDENTIDIES_TYPE_CD){
					            document.getElementById("identidiesTypeCd").options[i].selected=true;
					            break;
					        }
					    }
						$("#cmCustName").val(CUST_ITEM[0].NAME);
						$("#cmCustIdCard").val(CUST_ITEM[0].IDENTITY_NUM);
						$("#phonenumber").val(CUST_ITEM[0].CONTACT_NO);
						$("#cmAddressStr").val(CUST_ITEM[0].ADDRESS_STR);
					}
					$("#busitype").empty();
					$("#busitype").append("<option value='"+CUST_ORDER[0].BUSI_TYPE_CD+"' >"+CUST_ORDER[0].BUSI_TYPE_NAME+"</option>");
					order.ysl.busiactiontypeChoose("#busitype",'detail');
//					$("#busiactiontype").empty();
//					$("#busiactiontype").append("<option value='"+CUST_ORDER[0].ACTION_TYPE_CD+"' >"+CUST_ORDER[0].NAME+"</option>");
					$("#order_remark").val(CUST_ORDER[0].REMARKS);
					$("#payTbody").empty();
					var paytr1 = 0;
					for(var i=0;i<ORDER_FEE.length;i++){
						$("#payTbody").append("<tr id=paytr_"+paytr1+"><td acct_item_type_id=\""+ORDER_FEE[i].ACCT_ITEM_TYPE_ID+"\">"+ORDER_FEE[i].ACCT_ITEM_TYPE+"</td><td>"+parseFloat(ORDER_FEE[i].ACCT_ITEM_FEE).toFixed(2)+"</td><td paytypecd="+ORDER_FEE[i].PAY_METHOD_CD+">"+ORDER_FEE[i].NAME+"</td><td></td></tr>");
						paytr1++;
					}
					var busitypecd = CUST_ORDER[0].BUSI_TYPE_CD;
//					if(busitypecd=="1"){
						$("#offer_spec_name").val(taocan[0].OFFER_SPEC_NAME);
						for(var i=0;i<document.getElementById("payment_type_cd").options.length;i++){
					        if(document.getElementById("payment_type_cd").options[i].value == PRODUCT_ITEM[0].PAYMENT_TYPE_CD){
					            document.getElementById("payment_type_cd").options[i].selected=true;
					            break;
					        }
					    }
						$("#offer_spec_cd").val(taocan[0].OFFER_SPEC_CD);
						$("#choosedNumSpan").val(PRODUCT_ITEM[0].ACCESS_NBR);
						for(var i=0;i<COUPON_ITEM.length;i++){
					        if(COUPON_ITEM[i].COUPON_TYPE_CD=="1"){
					        	$("#uimcode").val(COUPON_ITEM[i].COUPON_INST_NBR);
					        }else if(COUPON_ITEM[i].COUPON_TYPE_CD=="2"){
					        	$("#terminalcode").val(COUPON_ITEM[i].COUPON_INST_NBR);
					        }
					    }
						$("#pwd").val(PRODUCT_ITEM[0].PROD_PWD);
						for(var i=0;i<document.getElementById("prodSpecId").options.length;i++){
					        if(document.getElementById("prodSpecId").options[i].value == PRODUCT_ITEM[0].PROD_SPEC_ID){
					            document.getElementById("prodSpecId").options[i].selected=true;
					            break;
					        }
					    }
						$("#openprodhtml").empty();
						for(var i=0;i<openlist.length;i++){
							if(openlist[i].OFFER_TYPE_CD != undefined){
								$("#openprodhtml").append("<li id="+openlist[i].OFFER_SPEC_CD+"><dd class=\"delete\" onclick=\"order.ysl.delprod('"+openlist[i].OFFER_SPEC_CD+"','"+openlist[i].OFFER_SPEC_NAME+"','1','ADD')\"></dd><span>"+openlist[i].OFFER_SPEC_NAME+"</span></li>");
							}else{
								$("#openprodhtml").append("<li id="+openlist[i].PROD_SPEC_CD+"><dd class=\"delete\" onclick=\"order.ysl.delprod('"+openlist[i].PROD_SPEC_CD+"','"+openlist[i].PROD_SPEC_NAME+"','2','ADD')\"></dd><span>"+openlist[i].PROD_SPEC_NAME+"</span></li>");
							}
						}
						$("#closeprodhtml").empty();
						for(var i=0;i<closelist.length;i++){
							if(closelist[i].OFFER_TYPE_CD != undefined){
								$("#closeprodhtml").append("<li id="+closelist[i].OFFER_SPEC_CD+"><dd class=\"delete\" onclick=\"order.ysl.delprod('"+closelist[i].OFFER_SPEC_CD+"','"+closelist[i].OFFER_SPEC_NAME+"','1','DEL')\"></dd><span>"+closelist[i].OFFER_SPEC_NAME+"</span></li>");
							}else{
								$("#closeprodhtml").append("<li id="+closelist[i].PROD_SPEC_CD+"><dd class=\"delete\" onclick=\"order.ysl.delprod('"+closelist[i].PROD_SPEC_CD+"','"+closelist[i].PROD_SPEC_NAME+"','2','DEL')\"></dd><span>"+closelist[i].PROD_SPEC_NAME+"</span></li>");
							}
						}
						$("#adddealer").hide();
						$("#dealerTbody").empty();
						var kxrela="true";
						for(var i=0;i<BUSI_STAFF_RELA.length;i++){
							var objInstId = BUSI_STAFF_RELA[i].OFFER_SPEC_CD;
							var objId = objInstId+"_"+OrderInfo.SEQ.dealerSeq;
							var DEVELOP_NAME = "";
							if(BUSI_STAFF_RELA[i].DEVELOP_TYPE=="40020005"){
								DEVELOP_NAME="第一发展人";
							}else if(BUSI_STAFF_RELA[i].DEVELOP_TYPE=="40020006"){
								DEVELOP_NAME="第二发展人";
							}else if(BUSI_STAFF_RELA[i].DEVELOP_TYPE=="40020007"){
								DEVELOP_NAME="第三发展人";
							}
							if(i==0 && BUSI_STAFF_RELA[i].OFFER_TYPE_CD=="0"){
								$("#dealerTbody").append("<tr name='tr_"+objInstId+"' id='tr_"+objInstId+"'>" +
														 "<td>主套餐</td>" +
														 "<td>"+BUSI_STAFF_RELA[i].OFFER_SPEC_NAME+"（包含接入产品）</td>" +
														 '<td><select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'" class="inputWidth183px" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)" disabled="disabled">'+
//														 		"<option value=\"40020005\">第一发展人</option>" +
//														 		"<option value=\"40020006\">第二发展人</option>" +
														 		"<option value=\""+BUSI_STAFF_RELA[i].DEVELOP_TYPE+"\">"+DEVELOP_NAME+"</option></select><label class=\"f_red\">*</label></td>" +
														 		'<td><input type="text" id="dealer_'+objId+'" staffId="'+BUSI_STAFF_RELA[i].STAFF_ID+'" value="'+BUSI_STAFF_RELA[i].SALE_NAME+'" class="inputWidth183px" readonly="readonly"></input>'+
//														 		'<a class="purchase" href="javascript:order.main.queryStaff(0,\'dealer\',\''+objId+'\');">选择</a>' +
//														 		'<a class="purchase" onclick="order.dealer.addProdDealer(this,'+objInstId+',1)">添加</a><label class="f_red">*</label>'+
														 		'</td>'+
														"</tr>");
							}else if(BUSI_STAFF_RELA[i].OFFER_TYPE_CD=="0" && i !=0){
								$("#dealerTbody").append("<tr name='tr_"+objInstId+"'>" +
														 "<td>主套餐</td>" +
														 "<td>"+BUSI_STAFF_RELA[i].OFFER_SPEC_NAME+"（包含接入产品）</td>" +
														 '<td><select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'" class="inputWidth183px" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)" disabled="disabled">'+
//														 		"<option value=\"40020005\">第一发展人</option>" +
//														 		"<option value=\"40020006\">第二发展人</option>" +
														 		"<option value=\""+BUSI_STAFF_RELA[i].DEVELOP_TYPE+"\">"+DEVELOP_NAME+"</option></select><label class=\"f_red\">*</label></td>" +
														 		'<td><input type="text" id="dealer_'+objId+'" staffId="'+BUSI_STAFF_RELA[i].STAFF_ID+'" value="'+BUSI_STAFF_RELA[i].SALE_NAME+'" class="inputWidth183px" readonly="readonly"></input>'+
//														 		'<a class="purchase" href="javascript:order.main.queryStaff(0,\'dealer\',\''+objId+'\');">选择</a>' +
//														 		'<a class="purchase" onclick="order.dealer.removeDealer(this);">删除</a><label class="f_red">*</label>'+
														 		'</td>'+
														"</tr>");
							}else if(BUSI_STAFF_RELA[i].OFFER_TYPE_CD=="1" && kxrela=="true"){
								$("#dealerTbody").append("<tr name='tr_-1_"+objInstId+"'>" +
														 "<td>"+PRODUCT_ITEM[0].ACCESS_NBR+"</td>" +
														 "<td>"+BUSI_STAFF_RELA[i].OFFER_SPEC_NAME+"</td>" +
														 '<td><select id="dealerType_-1_'+objId+'" name="dealerType_-1_'+objInstId+'" class="inputWidth183px" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_-1_'+objInstId+'\',a)" disabled="disabled">'+
//														 		"<option value=\"40020005\">第一发展人</option>" +
//														 		"<option value=\"40020006\">第二发展人</option>" +
														 		"<option value=\""+BUSI_STAFF_RELA[i].DEVELOP_TYPE+"\">"+DEVELOP_NAME+"</option></select><label class=\"f_red\">*</label></td>" +
														 		'<td><input type="text" id="dealer_-1_'+objId+'" name="dealer_-1_'+objInstId+'" staffId="'+BUSI_STAFF_RELA[i].STAFF_ID+'" value="'+BUSI_STAFF_RELA[i].SALE_NAME+'" class="inputWidth183px"  readonly="readonly"></input>'+
//														 		'<a class="purchase" href="javascript:order.main.queryStaff(0,\'dealer\',\'-1_'+objId+'\');">选择</a>' +
//														 		'<a class="purchase" onclick="order.dealer.removeDealer(this);">删除</a>'+
//														 		'<a class="purchase" onclick="order.dealer.addProdDealer(this,\'-1'+objInstId+'\')">添加</a><label class="f_red">*</label>'+
														 		'</td>'+
														"</tr>");
								kxrela="false";
							}else if(BUSI_STAFF_RELA[i].OFFER_TYPE_CD=="1" && kxrela=="false"){
								$("#dealerTbody").append("<tr name='tr_-1_"+objInstId+"'>" +
										 "<td>"+PRODUCT_ITEM[0].ACCESS_NBR+"</td>" +
										 "<td>"+BUSI_STAFF_RELA[i].OFFER_SPEC_NAME+"</td>" +
										 '<td><select id="dealerType_-1_'+objId+'" name="dealerType_-1_'+objInstId+'" class="inputWidth183px" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_-1_'+objInstId+'\',a)" disabled="disabled">'+
//										 		"<option value=\"40020005\">第一发展人</option>" +
//										 		"<option value=\"40020006\">第二发展人</option>" +
										 		"<option value=\""+BUSI_STAFF_RELA[i].DEVELOP_TYPE+"\">"+DEVELOP_NAME+"</option></select><label class=\"f_red\">*</label></td>" +
										 		'<td><input type="text" id="dealer_-1_'+objId+'" name="dealer_-1_'+objInstId+'" staffId="'+BUSI_STAFF_RELA[i].STAFF_ID+'" value="'+BUSI_STAFF_RELA[i].SALE_NAME+'" class="inputWidth183px" readonly="readonly"></input>'+
//										 		'<a class="purchase" href="javascript:order.main.queryStaff(0,\'dealer\',\'-1_'+objId+'\');">选择</a>' +
//										 		'<a class="purchase" onclick="order.dealer.removeDealer(this);">删除</a><label class="f_red">*</label>'+
										 		'</td>'+
										"</tr>");
							}
//							for(var j=0;j<document.getElementById("dealerType_"+objId).options.length;j++){
//						        if(document.getElementById("dealerType_"+objId).options[j].value == BUSI_STAFF_RELA[i].DEVELOP_TYPE){
//						            document.getElementById("dealerType_"+objId).options[j].selected=true;
//						            break;
//						        }
//						    }
//							for(var j=0;j<document.getElementById("dealerType_-1_"+objId).options.length;j++){
//						        if(document.getElementById("dealerType_-1_"+objId).options[j].value == BUSI_STAFF_RELA[i].DEVELOP_TYPE){
//						            document.getElementById("dealerType_-1_"+objId).options[j].selected=true;
//						            break;
//						        }
//						    }
							OrderInfo.SEQ.dealerSeq++;
						}
//					}
					if(busitypecd=="3"){
						$("#tcmc").html("新套餐名称：");
						$("#tcuim").html("UIM卡号[3转4补换卡]：");
						$("#tcuim").css({'width':'140px','margin-left':'-50px'});
						$("#tccphm").html("原产品号码：");
						$("#tcfflx").hide();
						$("#tccpmm").hide();
						$("#tccpgg").hide();
						$("#tcxh").hide();
						$("#zhongduan").hide();
					}else if (busitypecd=="4"){
						$("#tcuim").html("UIM卡号[3转4补换卡]：");
						$("#tcuim").css({'width':'140px','margin-left':'-50px'});
						$("#tccphm").html("原产品号码：");
						$("#tcname").hide();
						$("#tcfflx").hide();
						$("#tcbm").hide();
						$("#tccpmm").hide();
						$("#tccpgg").hide();
						$("#tcxh").hide();
						$("#zhongduan").hide();
					}else if (busitypecd=="2"){
						$("#tcuim").html("新UIM卡号：");
						$("#tccphm").html("原产品号码：");
						$("#tcname").hide();
						$("#tcfflx").hide();
						$("#tcbm").hide();
						$("#tccpmm").hide();
						$("#tccpgg").hide();
						$("#tcxh").hide();
						$("#fushu").hide();
						$("#zhongduan").hide();
						$("#dealerAidDiv").hide();
					}else if (busitypecd=="5" || busitypecd=="6" || busitypecd=="7" || busitypecd=="8"){
						$("#tccphm").html("原产品号码：");
						$("#tcname").hide();
						$("#tcfflx").hide();
						$("#tuim").hide();
						$("#tcbm").hide();
						$("#tccpmm").hide();
						$("#tccpgg").hide();
						$("#tcxh").hide();
						$("#fushu").hide();
						$("#zhongduan").hide();
						$("#dealerAidDiv").hide();
					}
					
					$("#d_query").hide();
					$("#d_yslInfo").show();
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});
    }
    
    var _showMain = function(){
		$("#d_yslInfo").hide();
		$("#d_query").show();
	};
	//滚动页面入口
	var _scroll = function(scrollObj){
		if(scrollObj && scrollObj.page && scrollObj.page >= 1){
			_queryyslinfos(scrollObj.page,scrollObj.scroll);
		}
	};
	
	//弹出套餐选择页面
	var _showPack = function (){
		var url=contextPath+"/app/order/yslPack";
		var param={};
		$.callServiceAsHtml(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					 response.data='选套餐页面加载异常,稍后重试';
				}
				if(response.code != 0) {
					$.alert("提示","查询失败,稍后重试");
					return;
				}
				$("#order").hide();
				//$("#order_prepare").hide();
				var content$=$("#packContent");
				content$.html(response.data).show();
			}
		});	
	};
	
	//初始化套餐选择页面
	var _initPack = function (){
		OrderInfo.order.step=1;
		OrderInfo.busitypeflag=2;
		OrderInfo.actionFlag = 2;
		//获取初始化查询的条件
		order.service.queryApConfig();
		//初始化主套餐查询
		order.ysl.yslSearchPack();
	};
	
	//主套餐查询
	var _yslSearchPack = function(flag,scroller,subPage){
		var custId = OrderInfo.cust.custId;
		var qryStr=$("#qryStr").val();
//		var params={"qryStr":qryStr,"pnLevelId":"","custId":custId};
		var params={"subPage":flag,"qryStr":qryStr,"pnLevelId":"","custId":custId,"PageSize":10};
		if(flag){
			
			var priceVal = $("#select_price").val();
			if(ec.util.isObj(priceVal)){
				var priceArr = priceVal.split("-");
				if(priceArr[0]!=null&&priceArr[0]!=""){
					params.priceMin = priceArr[0] ;
				}
				if(priceArr[1]!=null&&priceArr[1]!=""){
					params.priceMax = priceArr[1] ;
				}
			}
			var influxVal = $("#select_influx").val();
			if(ec.util.isObj(influxVal)){
				var influxArr = influxVal.split("-");
				if(influxArr[0]!=null&&influxArr[0]!=""){
					params.INFLUXMin = influxArr[0]*1024 ;
				}
				if(influxArr[1]!=null&&influxArr[1]!=""){
					params.INFLUXMax = influxArr[1]*1024 ;
				}
			}
			var invoiceVal = $("#select_invoice").val();
			if(ec.util.isObj(invoiceVal)){
				var invoiceArr = invoiceVal.split("-");
				if(invoiceArr[0]!=null&&invoiceArr[0]!=""){
					params.INVOICEMin = invoiceArr[0] ;
				}
				if(invoiceArr[1]!=null&&invoiceArr[1]!=""){
					params.INVOICEMax = invoiceArr[1] ;
				}
			}
		}
		_yslQueryData(params,flag,scroller);
		
	};
	
	var _yslQueryData = function(params,flag,scroller) {
		if(OrderInfo.actionFlag==2){
			var offerSpecId = order.prodModify.choosedProdInfo.prodOfferId;
			if(offerSpecId!=undefined){
				params.changeGradeProdOfferId = offerSpecId;
			}
			var prodSpecIds='';
			$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
				if(this.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
					if(this.objId!=undefined){
						prodSpecIds=prodSpecIds+","+this.objId;
					}
				}
			});
			if(prodSpecIds!=''){
				prodSpecIds=prodSpecIds.substring(1, prodSpecIds.length);
				params.prodSpecId=prodSpecIds;
			}
			params.actionFlag=2;
		}else if(CONST.getAppDesc()==0){
			params.prodOfferFlag = "4G";
		}
		var url = contextPath+"/app/order/yslOfferSpecList";
		$.callServiceAsHtmlGet(url,params, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
				$("#search-modal").modal('hide');
			},
			"done" : function(response){
				$("#search-modal").modal('hide');
				if(response.code != 0) {
					$.alert("提示","<br/>查询失败,稍后重试");
					return;
				}
				var content$ = $("#offer-list");
				content$.html(response.data);
				if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
//				$.refresh(content$);
			},
			fail:function(response){
				$.unecOverlay();
				$("#search-modal").modal('hide');
				$.alert("提示","套餐加载失败，请稍后再试！");
			}
		});
	};
	
	//预受理套餐滚动页面入口
	var _yslScroll = function(scrollObj){
		if(scrollObj && scrollObj.page && scrollObj.page >= 1){
			if(scrollObj.page==1){
				_yslSearchPack(1,scrollObj.scroll);
			}else{
				var show_per_page = 10;
				var start_from = (scrollObj.page-2) * show_per_page;
				var end_on = start_from + show_per_page;
				//$('#ul_offer_list').append($('#div_all_data').children().slice(start_from, end_on)).listview("refresh");
				$('#div_all_data').children().slice(start_from, end_on).appendTo($('#div_offer_list'));
//				$('#ul_offer_list').listview("refresh");
//				$("#ul_offer_list li").off("tap").on("tap",function(){
//					$(this).addClass("pakeagelistlibg").siblings().removeClass("pakeagelistlibg");
//				});
				if(scrollObj.scroll && $.isFunction(scrollObj.scroll)) scrollObj.scroll.apply(this,[]);
			}
		}
	};
	//预受理选中套餐
	var _yslSelectPack = function(packName,packCd){
		var offerRoleId="";
		var param={"offerSpecId":packCd};
		var response = $.callServiceAsJson(contextPath+"/app/order/queryOfferSpec",param);
		if (response.code==0) {
			if(response.data){
				var prodOfferSpec=response.data.offerSpec;
				if (prodOfferSpec && prodOfferSpec.offerRoles) {
					var offerRoles = prodOfferSpec.offerRoles;
					for (var i=0;i<offerRoles.length;i++){
						if (offerRoles[i].memberRoleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD
								|| offerRoles[i].memberRoleCd == CONST.MEMBER_ROLE_CD.VICE_CARD) {
							if(offerRoles[i].memberRoleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD){
								offerRoleId=offerRoles[i].offerRoleId;
								break;
							}
						}else{
							offerRoleId=offerRoles[i].offerRoleId;
							break;
						}
					}
				}
				if(offerRoleId!=""){
					roles = prodOfferSpec.offerRoles;
//					_closeChooseDialog();
//					var prodId=$("#li_"+subpage).attr("objinstid");
//					var accessnumber=$("#li_"+subpage).attr("accessnumber");
//					for ( var i = 0; i < OrderInfo.viceOfferSpec.length; i++) {//清除旧数据
//						var viceOfferSpec = OrderInfo.viceOfferSpec[i];
//						if(prodId == viceOfferSpec.prodId){
//							OrderInfo.viceOfferSpec.splice(i,1);
//							break;
//						}
//					}
//					prodOfferSpec.prodId=prodId;
//					prodOfferSpec.accessnumber=accessnumber;
//					OrderInfo.viceOfferSpec.push(prodOfferSpec);
//					order.prodModify.chooseOfferForMember(specId,subpage,specName,offerRoleId);
				}else{
					$.alert("提示","无法选择套餐，套餐规格查询失败！");
					return;
				}
			}
		}else if(response.code == -2){
			$.alertM(response.data);
		}else{
			$.alert("提示","套餐详细加载失败，请稍后再试！");
			return;
		}
		$("#offer_spec_name").val(packName);
		$("#offer_spec_cd").val(packCd);
		$("#offerRoleId").val(offerRoleId);
		$("#packContent").hide();
		$("#order").show();
		
	};
	
	var clickFlag = 0;//标记是否打开过可选包页面，0否  1是，只在第一次打开加载页面
	//弹出可选包查询页面
	var _showKxb = function() {
		if($("#offer_spec_cd").val().length<1){
			$.alert("提示","请先选择套餐");
			return;
		}
		if(clickFlag == 0){
			var param={
				"mainOfferSpecId": $("#offer_spec_cd").val(),
				"offerSpecId": $("#offer_spec_cd").val(),
				"soNbr": UUID.getDataId(),
				"prodId": "-1",
				"prodSpecId": $("#prodSpecId").val(),
				"offerRoleId": $("#offerRoleId").val()
				};
			order.ysl.queryAttachSpec(param,function(data){
				if (data) {
					$("#order").hide();
					$("#kxbContent").html(data).show();
					clickFlag = 1;
					OrderInfo.actionFlag = 10000000;
					OrderInfo.offerSpec.offerRoles = roles;
					OrderInfo.offerSpec.offerSpecId = $("#offer_spec_cd").val();
					AttachOffer.showMainRoleProd(param.prodId); //通过主套餐成员显示角字
					AttachOffer.changeLabel(param.prodId,param.prodSpecId,"100",param.offerRoleId); //初始化第一个标签附属
					OrderInfo.offerSpec.offerRoles = undefined;
	//				if(param.prodId==-1 && OrderInfo.actionFlag==14){ //合约计划特殊处理
	//					AttachOffer.addOpenList(param.prodId,param.offerSpecId);
	//				}
				}
			});
		}else{
			$("#order").hide();
			$("#kxbContent").show();
			OrderInfo.actionFlag = 10000000;
			OrderInfo.offerSpec.offerRoles = roles;
			OrderInfo.offerSpec.offerSpecId = $("#offer_spec_cd").val();
			AttachOffer.showMainRoleProd(param.prodId); //通过主套餐成员显示角字
			AttachOffer.changeLabel(param.prodId,param.prodSpecId,"100",param.offerRoleId); //初始化第一个标签附属
			OrderInfo.offerSpec.offerRoles = undefined;
		}
	};
	
//	var _showKxb = function (){
//		var url=contextPath+"/app/offer/queryYslKxb";
//		var param={
//			"mainOfferSpecId": $("#offer_spec_cd").val(),
//			"offerSpecId": $("#offer_spec_cd").val(),
//			"soNbr": UUID.getDataId(),
//			"prodId": "-2"
//			};
//		OrderInfo.order.soNbr = UUID.getDataId();
//		$.callServiceAsHtml(url,param,{
//			"before":function(){
//				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
//			},
//			"always":function(){
//				$.unecOverlay();
//			},
//			"done" : function(response){
//				if(!response){
//					 response.data='选套餐页面加载异常,稍后重试';
//				}
//				if(response.code != 0) {
//					$.alert("提示","查询失败,稍后重试");
//					return;
//				}
//				$("#order").hide();
//				//$("#order_prepare").hide();
//				var content$=$("#kxbContent");
//				content$.html(response.data).show();
//			}
//		});	
//	};
	
	//附属销售品规格查询
	var _queryAttachSpec = function(param,callBackFun) {
		var url=contextPath+"/app/offer/queryYslKxb";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsHtml(url,param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询附属销售品中,请稍后....</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					if (response.code==0) {
						if(response.data){
							callBackFun(response.data);
						}
					}else if (response.code==-2){
						$.alertM(response.data);
						return;
					}else {
						$.alert("提示","附属销售品查询失败,稍后重试");
						return;
					}
				}
			});	
		}else {
			$.ecOverlay("<strong>查询附属销售品中，请稍等...</strong>");
			var response = $.callServiceAsHtmlGet(url,param);	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data;
				}
			}else if (response.code==-2){
				$.alertM(response.data);
				return;
			}else {
				$.alert("提示","查询附属销售品失败,稍后重试");
				return;
			}
		}
	};
	
	var _searchAttachOfferSpec = function(prodId,offerSpecId,prodSpecId){
		var param = {   
			prodId : prodId,
		    prodSpecId : $("#prodSpecId").val(),
		    offerSpecIds : [offerSpecId],
		    ifCommonUse : "" 
		};
		var offerSepcName = $("#search_text_"+prodId).val();
		if(offerSepcName.replace(/\ /g,"")==""){
			$.alert("提示","请输入查询条件！");
			return;
		}
		param.offerSpecName = offerSepcName;
		var data = query.offer.searchAttachOfferSpec(param);
		if(data!=undefined){
			$("#attach_div_"+prodId).html(data).show();
		}
	}
	//显示流水号
	var _showLsh = function(lsh){
		$.alert("流水号",lsh);
	};
	//关闭弹出页面
	var _closePopPage = function(closeId,openId){
		$("#"+closeId).hide();
		$("#"+openId).show();
	};
	return {
		closePopPage:_closePopPage,
		searchAttachOfferSpec:_searchAttachOfferSpec,
		showLsh:_showLsh,
		queryAttachSpec:_queryAttachSpec,
		showKxb:_showKxb,
		yslSelectPack:_yslSelectPack,
		yslSearchPack:_yslSearchPack,
		yslQueryData:_yslQueryData,
		yslScroll:_yslScroll,
		showPack:_showPack,
		initPack:_initPack,
		yslbean:_yslbean,
		openList:_openList,
		realmoney:_realmoney,
		CUST_ORDER_ID: _CUST_ORDER_ID,
		CUST_SO_NUMBER: _CUST_SO_NUMBER,
		INVOICE_ID: _INVOICE_ID,
		paymentbean:_paymentbean,
		certTypeByPartyType :_certTypeByPartyType,
		custcreateButton :_custcreateButton,
		querybusitype:_querybusitype,
		busiactiontypeChoose:_busiactiontypeChoose,
		genRandPass6Input:_genRandPass6Input,
		searchPack:_searchPack,
		confirmoffer:_confirmoffer,
		addParam:_addParam,
		confirmAttachOffer:_confirmAttachOffer,
		addprod:_addprod,
		delprod:_delprod,
		adddealer:_adddealer,
		addpayinfo:_addpayinfo,
		delpay:_delpay,
		suborderysl:_suborderysl,
		invoiceprint:_invoiceprint,
		saveInvoiceInfo:_saveInvoiceInfo,
		printInvoice:_printInvoice,
		printVoucher:_printVoucher,
		queryyslinfos:_queryyslinfos,
		chooseArea:_chooseArea,
		upOrderInfo:_upOrderInfo,
		queryYslDetail:_queryYslDetail,
		showMain:_showMain,
		queryfeeitems:_queryfeeitems,
		identidiesTypeCdChoose:_identidiesTypeCdChoose,
		scroll : _scroll
	};
})();

/**
 * 规则
 */
CommonUtils.regNamespace("rule", "rule");

rule.rule = (function(){

	
	var checkFlag = false;
	var checkObj = {};
	var _callBackStr = "";
	var _callBackParam = {};
	
	var _init = function() {
		$("#ruleBody").html("");
		$("#ruleclose").click(function(){
			_closeRuleDiv();
		});
		//授信
		$("#credit").click(function(){
			_credit();
		});
		$("#closedialog").click(function(){
			_cancel();
		});
	};
	/**
	 * 受理准备调用规则
	 * param : {
	 * 		
	 *  	ruleParam : {
	 *  		boActionTypeCd : 'S1', //动作类型
	 *  		instId : '1200001', //实例ID
	 *  		specId : '1201201', //产品（销售品）规格ID
	 *  		custId : '345903434', //客户ID
	 *  		areaId : '899990',//地区ID
	 *  	}
	 *  	
	 * }
	 */
	var _prepare = function(param,callBackStr,callBackParam){
		_init();
		_callBackStr = callBackStr;
		_callBackParam = callBackParam;
		if(!query.offer.loadInst()){  //加载实例到缓存
			return;
		};
		var inParam ={
			prodInfo : order.prodModify.choosedProdInfo,
			areaId : param.areaId,
			staffId : param.staffId,
			channelId : param.channelId,
			custId : param.custId,
			boInfos : param.boInfos,
			soNbr : OrderInfo.order.soNbr
		};
		$.ecOverlay("<strong>客户级规则校验中，请稍等...</strong>");
		var response = $.callServiceAsJson(contextPath+"/rule/prepare",inParam); //调用规则校验
		$.unecOverlay();
		var checkData = response.data;
		if(response.code==0){
			if(checkData == null){
				$.alert("提示","规则校验异常，请联系管理人员！");
				return;
			}
		}else{
			$.alertM(response.data);
			return;
		}
		
		if(checkData.ruleType == "portal"){
			if (checkData.resultCode == "0"){
				$.alert("提示",checkData.resultMsg);
				return true;
			}
		}		
		if (checkData.result && checkData.result.resultInfo) {
			var checkRuleInfo = checkData.result.resultInfo;
			if (checkRuleInfo != null && checkRuleInfo.length > 0) {
				$.each(checkRuleInfo, function(i, ruleInfo) {
					$("<tr>" +
							"<td>"+ruleInfo.resultCode+"</td>" +
							"<td>"+ruleInfo.ruleDesc+"</td>" +
							"<td>"+_getRuleLevelName(ruleInfo.ruleLevel)+"</td>" +
							"<td><div style='display:block;margin-left:30px;' class='"+_getRuleImgClass(ruleInfo.ruleLevel)+"'></div></td>" +
					"</tr>").appendTo($("#ruleBody"));
				});
				easyDialog.open({
					container : 'ruleDiv'
				});
			} else {
				_credit();	
				SoOrder.initFillPage();		
			}
		} else {
			_credit();
			SoOrder.initFillPage();	
		}
		if (checkData.resultCode != 0) {
			$("#ruleSubmit").hide();
		} else {
			checkObj = param;
			checkFlag = true;
		}
	};
	
	var _getRuleImgClass = function(ruleLevel) {
		if (ruleLevel < 4) {
			return "correct";
		} else {
			return "error";
		}
	};
	
	var _getRuleLevelName = function(ruleLevel) {
		if (ruleLevel == 0) {
			return "提示级";
		} else if (ruleLevel == 1) {
			return "中级";
		} else if (ruleLevel == 2) {
			return "高级";
		} else if (ruleLevel == 3) {
			return "特技";
		} else if (ruleLevel == 4) {
			return "限制级";
		}
	};
	
	var _prepareCallBack = function(response) {
		var content$ = $("#ruleDiv");
		content$.html(response.data).show();
	};
	
	
	/**
	 * 规则页面点击确定按钮
	 */
	var _submit = function() {
		if (!checkFlag) {
			return;
		}
		$.callServiceAsHtml(contextPath+checkObj.uri, checkObj.param, checkObj.callObj);
		easyDialog.close();
	};
	
	/**
	 * 关闭规则窗口
	 */
	var _closeRuleDiv = function() {
		if (!$("#ruleDiv").is(":hidden")) {
			easyDialog.close();
		}
	};
	
	var _cancel = function() {
		//TODO may do other things;
		if (!$("#ruleDiv").is(":hidden")) {
			easyDialog.close();
		}
	};
	
	var _showRuleDiv = function(ruleInfo) {
		
	};
	
	var _credit = function() {
		eval(_callBackStr + "("+JSON.stringify(_callBackParam) + ")");
		//_closeRuleDiv();
	};
	
	//生成订单流水号，加载实例到缓存,规则校验,callBack 回调函数
	var _ruleCheck = function(boInfos,callBack){
		//_init();
		if(!query.offer.loadInst()){  //生成订单流水号，加载实例到缓存，如果失败
			return false;
		};
		if(boInfos==undefined){  //没有传，表示不做业务规则校验
			return true;
		}
		var inParam ={
			areaId : OrderInfo.staff.soAreaId,
			staffId : OrderInfo.staff.staffId,
			channelId : OrderInfo.staff.channelId,
			custId : OrderInfo.cust.custId,
			soNbr : OrderInfo.order.soNbr,
			boInfos : boInfos,
			prodInfo : order.prodModify.choosedProdInfo	
		};
		
		$.callServiceAsHtml(contextPath+"/app/rule/prepare", inParam, {
			"before":function(){
				$.ecOverlay("<strong>客户级规则校验中，请稍等...</strong>");
			},	
			"done" : function(response){
				setTimeout(function () { 
					$.unecOverlay();
					var checkData = response.data;
					if(typeof(callBack)=="function"){
						callBack(checkData);
					}
			    }, 800);
			}
		});
		
//		$.ecOverlay("<strong>客户级规则校验中，请稍等...</strong>");
//		var response = $.callServiceAsHtml(contextPath+"/app/rule/prepare",inParam); //调用规则校验
//		$.unecOverlay();
//		if(response!=undefined && response.code==0){
//			var checkData = response.data;
//			if(typeof(callBack)=="function"){
//				callBack(checkData);
//			}
//		}else{
//			var checkData = response.data;
//			if(typeof(callBack)=="function"){
//				callBack(checkData);
//			}
//		}
	};
	
	return {
		submit 			: _submit,
		prepare 		: _prepare,
		showRuleDiv 	: _showRuleDiv,
		ruleCheck		: _ruleCheck,
		init			: _init,
		getRuleLevelName: _getRuleLevelName,
		getRuleImgClass : _getRuleImgClass
	};
})();
$(function(){

});

/**
 * 号码查询
 * 
 * @author lianld
 */
CommonUtils.regNamespace("order", "phoneNumber");
/**
 * 号码查询
 */
var phoneNum_level="";
var selectedObj=null;
var _queryFlag="0";
order.phoneNumber = (function(){
	var _boProdAn = {
			accessNumber : "", //接入号
			org_level:"",//原始的号码等级，为了页面展示增加的字段
			level : "", //等级
			anId : "", //接入号ID
			anTypeCd : "",//号码类型
			areaId:"",
			areaCode:"",
			memberRoleCd:"",
			preStore:"",
			minCharge:""
	};
	var _resetBoProdAn = function(){
		_boProdAn = {
				accessNumber : "", //接入号
				org_level:"",//原始的号码等级，为了页面展示增加的字段
				level : "", //等级
				anId : "", //接入号ID
				anTypeCd : "",//号码类型
				areaId:"",
				areaCode:"",
				memberRoleCd:"",
				preStore: "",
				minCharge:""
		};
	};
	var ispurchased=0;
	var selectedLevel="";
	var idcode=[];
	//请求地址
	var url = contextPath+"/app/mktRes/phonenumber/list";
	var phoneNumberVal="";
	//按钮查询
	var _btnQueryPhoneNumber=function(param,scroller){
		var idcode=$.trim($("#idCode").val());
		if(idcode!=''){
		    _btnIBydentityQuery();
			return;
		}
		selectedObj=null;//初始化原先选中的号码
		//收集参数
		param = _buildInParam(param);
		param.isReserveFlag=_queryFlag;
		if(_queryFlag=='1'){//预约选号
			param.queryFlag="3";
		}
		//隐藏选套餐模块
		if($("#pakeage").length>0){
			$("#pakeage").hide();
		}
		$.callServiceAsHtml(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
				$("#numberModal").modal('hide');
			},
			"done" : function(response){
				$("#numberModal").modal('hide');
				if(response.data.indexOf("showVerificationcode") >=0) {
					$("#vali_code_input").val("");
					$('#validatecodeImg').css({"width":"80px","height":"32px"}).attr('src',contextPath+'/validatecode/codeimg.jpg?' + Math.floor(Math.random()*100)).fadeIn();
					easyDialog.open({
						container : 'Verificationcode_div'
					});
				}
				if(!response||response.code != 0){
					 response.data='查询失败,稍后重试';
				}
				var content$ = $("#phonenumber-list");
				if($("#subPage").val() == 'offer'||$("#subPage").val()=='terminal'){
					content$ = $("#number-list");
				}
				content$.html(response.data);
				$("#phonenumber-list_scroller").css("transform","translate(0px, -40px) translateZ(0px)");
				if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
				
				$("#btnSwitchNbr").off("click").on("click",function(){order.phoneNumber.btnQueryPhoneNumber({});});
			},
			fail:function(response){
				$.unecOverlay();
				$("#numberModal").modal('hide');
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});	
	};
	
	//提供给LTE项目，新装套餐、主副卡变更等功能中的号码信息查询
	var _queryPhoneNumber=function(param){
		var url = contextPath+"/app/mktRes/phone/numberlist";
		//收集参数
		var params = {
				"areaId":OrderInfo.getAreaId(),
				"phoneNumber":param.phoneNum
			};
		var response = $.callServiceAsJson(url,params);
		if (response&&response.code==0) {
			if(response.data){
				return response.data;
			}
		}else if (response.code==-2){
			$.alertM(response.data);
		}else {
			$.alert("提示","查询号码信息失败,稍后重试");
		}
	};
	
	var _btnIBydentityQuery=function(){
		var idcode=$.trim($("#idCode").val());
//		if(idcode==''){
//			$.alert("提示","请先输入身份证号码!");
//			return;
//		}
		if(!_idcardCheck(idcode)){
			$.alert("提示","身份证号码输入有误!");
			return;
		}
		var areaId=$("#p_cust_areaId").val();
		var subPage = $("#subPage").val();
		var param={"identityId":idcode,"areaId":areaId,"subPage":subPage};
		$.callServiceAsHtmlGet(contextPath+"/app/mktRes/phonenumber/listByIdentity",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
				$("#numberModal").modal('hide');
			},
			"done" : function(response){
				$("#numberModal").modal('hide');
				if(!response||response.code != 0){
					 response.data='查询失败,稍后重试';
				}
				
				var content$ = $("#phonenumber-list");
				if($("#subPage").val() == 'offer'||$("#subPage").val()=='terminal'){
					content$ = $("#number-list");
				}
				content$.html(response.data);
//				var content$=$("#order_phonenumber .phone_warp");
//				content$.html(response.data);
			},
			fail:function(response){
				$.unecOverlay();
				$("#numberModal").modal('hide');
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});	
	};
	//选择身份证预占的号码
	var _btnToOffer=function(obj){
		phoneNumberVal = $(obj).attr("numberVal"); 
		var memberRoleCd=CONST.MEMBER_ROLE_CD.MAIN_CARD;
		//选号类型：新装主卡选号、新装副卡选号 Y1、Y2
		var subFlag=$("#subFlag").val();
		if(subFlag=='Y2'){
			memberRoleCd=CONST.MEMBER_ROLE_CD.VICE_CARD;
		}
		//订单序号：O1、O2区分暂存单允许多个订单的情况
		var subnum=$("#subnum").val();
		//入口终端入口，号码入口，订单填写入口:terminal\offer\number
		var subPage=$("#subPage").val();
		//号码的预存话费
		var preStoreFare=phoneNumberVal.split("_")[1];
		//保底消费
		var pnPrice=phoneNumberVal.split("_")[2];
		if(order.service.offerprice!=''){
			var minMonthFare=parseInt(pnPrice);
			//套餐月基本费用
			var packageMonthFare=parseInt(order.service.offerprice);
			if(packageMonthFare<minMonthFare){
				$.unecOverlay();
				$.alert("提示","对不起,此号码不能被选购.(原因:套餐月基本费用必须大于号码月保底消费)");
				return;
			}
		}
		//正在被预占的号码
		var phoneNumber=phoneNumberVal.split("_")[0];
		var anTypeCd=phoneNumberVal.split("_")[3];
		var plevel=selectedLevel;
		if(selectedLevel==""){
			plevel=phoneNumberVal.split("_")[5];
		}
		var orgLevel=phoneNumberVal.split("_")[5];//初始等级
		var phoneNumId=phoneNumberVal.split("_")[6];
		var areaId=$("#p_cust_areaId").val();
		if(areaId==null||areaId==""){
			areaId=OrderInfo.staff.areaId;
		}
		//var areaCode=$("#p_cust_areaId").attr("areaCode");
		var areaCode=  $(obj).attr("zoneNumber");
		if(areaCode==null || areaCode==""){
			areaCode =OrderInfo.staff.areaCode;
		} 
		if(phoneNumber){
			var oldrelease=false;
			var oldPhoneNumber="";
			var oldAnTypeCd="";
			if(subPage=='terminal'||subPage=='number'){
				oldPhoneNumber=_boProdAn.accessNumber;
				oldAnTypeCd=_boProdAn.anTypeCd;
				/*if(oldPhoneNumber==phoneNumber){
					$.alert("提示","号码已经被预占,请选择其它号码!");
					return;
				}*/
			}else if(subPage=='offer'){
				for(var i=0;i<OrderInfo.boProdAns.length;i++){
					if(OrderInfo.boProdAns[i].prodId==subnum){
						oldPhoneNumber=OrderInfo.boProdAns[i].accessNumber;
						oldAnTypeCd=OrderInfo.boProdAns[i].anTypeCd;
						break;
					}
				}
				for(var i=0;i<OrderInfo.boProdAns.length;i++){
					if(OrderInfo.boProdAns[i].prodId!=subnum){
						if(OrderInfo.boProdAns[i].accessNumber==phoneNumber){
							$.unecOverlay();
							$.alert("提示","你已经选择了该号码,请选择其它号码!");
							return;
						}
					}
				}
			}
			if(oldPhoneNumber!=""){
				oldrelease=true;
				for(var i=0;i<idcode.length;i++){//身份证预占的号码不需要被释放
					if(idcode[i]==oldPhoneNumber){
						oldrelease=false;
						break;
					}
				}
				if(oldrelease){
					var purchaseUrl=contextPath+"/app/mktRes/phonenumber/purchase";
					var params={"oldPhoneNumber":oldPhoneNumber,"oldAnTypeCd":oldAnTypeCd};
					$.callServiceAsJson(purchaseUrl, params, {});
				}
			}
			$.unecOverlay();
			idcode.push(phoneNumber);
			if(subPage=='number'){
				var content$=$("#order_fill_content");
				content$.html('');
				_boProdAn.accessNumber=phoneNumber;
				_boProdAn.anTypeCd=anTypeCd;
				_boProdAn.level=plevel;
				_boProdAn.org_level=orgLevel;
				_boProdAn.anId=phoneNumId;
				_boProdAn.areaId=areaId;
				_boProdAn.areaCode =areaCode;
				_boProdAn.memberRoleCd=memberRoleCd;
				_boProdAn.idFlag=0;
				_boProdAn.preStore=preStoreFare;
				_boProdAn.minCharge=pnPrice;
				order.service.boProdAn = _boProdAn;
				//_qryOfferInfoByPhoneNumFee();
				OrderInfo.returnFlag=2;  // 临时处理
				OrderInfo.order.step=2;
				$("#tentrance").show();
				$("#pentrance").hide();
				$("#nentrance").hide();
				$("#pakeage").show();
				$("#pakeage").attr("class","tab-pane fade in active");
				$("#tentrance").css("width","100%");
				$("#phone").hide();
				$("#number").hide();
			}else if(subPage=='terminal'){
				mktRes.terminal.setNumber(phoneNumber, plevel);
				_boProdAn.accessNumber=phoneNumber;
				_boProdAn.anTypeCd=anTypeCd;
				_boProdAn.level=plevel;
				_boProdAn.org_level=orgLevel;
				_boProdAn.anId=phoneNumId;
				_boProdAn.areaId=areaId;
				_boProdAn.areaCode =areaCode;
				_boProdAn.memberRoleCd=memberRoleCd;
				_boProdAn.idFlag=0;
				_boProdAn.preStore=preStoreFare;
				_boProdAn.minCharge=pnPrice;
				order.service.boProdAn = _boProdAn;
				$("#order").show();
				$("#phonenumberContent").hide();
			}else if(subPage=='offer'){
				_boProdAn.anTypeCd=anTypeCd;
				_boProdAn.anId=phoneNumId;
				_boProdAn.accessNumber=phoneNumber;
//				_boProdAn.level=response.data.phoneLevelId;
				_boProdAn.level=plevel;
				_boProdAn.org_level=orgLevel;
				_boProdAn.areaId=areaId;
				_boProdAn.areaCode =areaCode;
				_boProdAn.preStore=preStoreFare;
				_boProdAn.minCharge=pnPrice;
//				$("#nbr_btn_"+subnum).removeClass("selectBoxTwo");
//				$("#nbr_btn_"+subnum).addClass("selectBoxTwoOn");
//				$("#nbr_btn_"+subnum).html(phoneNumber+"<u></u>");
//				$("#choosedNumSpan").val(phoneNumber);
				$("#nbr_btn_"+subnum).val(phoneNumber);
				$("#choosedNumSpan").val(phoneNumber);
				var isExists=false;
				if(OrderInfo.boProdAns.length>0){
					for(var i=0;i<OrderInfo.boProdAns.length;i++){
						if(OrderInfo.boProdAns[i].prodId==subnum){
							OrderInfo.boProdAns[i].accessNumber=phoneNumber;
							OrderInfo.boProdAns[i].anTypeCd=anTypeCd;
							OrderInfo.boProdAns[i].pnLevelId=plevel;
							OrderInfo.boProdAns[i].anId=phoneNumId;
							OrderInfo.boProdAns[i].areaId=areaId;
							OrderInfo.boProdAns[i].areaCode =areaCode;
							OrderInfo.boProdAns[i].memberRoleCd=memberRoleCd;
							OrderInfo.boProdAns[i].idFlag=0;
							OrderInfo.boProdAns[i].preStore=preStoreFare;
							OrderInfo.boProdAns[i].minCharge=pnPrice;
							isExists=true;
							OrderInfo.setProdAn(OrderInfo.boProdAns[i]);  //保存到产品实例列表里面
							order.dealer.changeAccNbr(subnum,phoneNumber); //选号玩要刷新发展人管理里面的号码
							break;
						}
					}
				}
				if(!isExists){
					var param={
						prodId : subnum, //从填单页面头部div获取
						accessNumber : phoneNumber, //接入号
						anChooseTypeCd : "2", //接入号选择方式,自动生成或手工配号，默认传2
						anId : phoneNumId, //接入号ID
						anTypeCd : anTypeCd, //号码类型
						pnLevelId:plevel,
						state : "ADD", //动作	,新装默认ADD	
						areaId:areaId,
						areaCode:areaCode,
						memberRoleCd:memberRoleCd,
						idFlag:0,
						preStore:preStoreFare,
						minCharge:pnPrice
					};
					OrderInfo.boProdAns.push(param);
				}
//				if(order.phoneNumber.dialogForm!=undefined&&order.phoneNumber.dialog!=undefined){
//					order.phoneNumber.dialogForm.close(order.phoneNumber.dialog);
//				}
				if(subnum=='-1'){
					OrderInfo.boCustInfos.telNumber=phoneNumber;
				}
				$("#order_content").show();
				//$("#order_prepare").show();
				$("#phonenumberContent").hide();
			}
		} else {
			$.alert("提示","号码格式不正确!");
		}
	};
	
	var _initOffer=function(subnum){
		if(_boProdAn.accessNumber!=''){
			$("#nbr_btn_"+subnum).removeClass("selectBoxTwo");
			$("#nbr_btn_"+subnum).addClass("selectBoxTwoOn");
			$("#nbr_btn_"+subnum).val(_boProdAn.accessNumber);
			order.dealer.changeAccNbr(subnum,_boProdAn.accessNumber);
			var isExists=false;
			if(OrderInfo.boProdAns.length>0){
				for(var i=0;i<OrderInfo.boProdAns.length;i++){
					if(OrderInfo.boProdAns[i].prodId==subnum){
						OrderInfo.boProdAns[i].accessNumber=_boProdAn.accessNumber;
						OrderInfo.boProdAns[i].anTypeCd=_boProdAn.anTypeCd;
						OrderInfo.boProdAns[i].anId=_boProdAn.anId;
						OrderInfo.boProdAns[i].pnLevelId=_boProdAn.level;
						OrderInfo.boProdAns[i].areaId=_boProdAn.areaId;
						OrderInfo.boProdAns[i].memberRoleCd=_boProdAn.memberRoleCd;
						OrderInfo.boProdAns[i].preStore=_boProdAn.preStore;
						OrderInfo.boProdAns[i].minCharge=_boProdAn.minCharge;
						if(_boProdAn.idFlag){
							OrderInfo.boProdAns[i].idFlag=_boProdAn.idFlag;
						}
						OrderInfo.setProdAn(OrderInfo.boProdAns[i]);  //保存到产品实例列表里面
						order.dealer.changeAccNbr(subnum,phoneNumber); //选号玩要刷新发展人管理里面的号码
						isExists=true;
						break;
					}
				}
			}
			if(!isExists){
				var param={
					prodId : subnum, //从填单页面头部div获取
					accessNumber : _boProdAn.accessNumber, //接入号
					anChooseTypeCd : "2", //接入号选择方式,自动生成或手工配号，默认传2
					anId : _boProdAn.anId, //接入号ID
					pnLevelId:_boProdAn.level,
					anTypeCd : _boProdAn.anTypeCd, //号码类型
					state : "ADD", //动作	,新装默认ADD
					areaId:_boProdAn.areaId,
					areaCode:_boProdAn.areaCode,
					memberRoleCd:_boProdAn.memberRoleCd,
					preStore:_boProdAn.preStore,
					minCharge:_boProdAn.minCharge
				};
				if(_boProdAn.idFlag){
					param.idFlag=_boProdAn.idFlag;
				}
				OrderInfo.boProdAns.push(param);
			}
			if(subnum=='-1'){
				OrderInfo.boCustInfos.telNumber=_boProdAn.accessNumber;
			}
		}
	};
	
//	var _qryOfferInfoByPhoneNumFee=function(){
//		var param={"numsubflag":"number"};
//		$.callServiceAsHtmlGet(contextPath+"/order/prodoffer/prepare",param,{
//			"before":function(){
//				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
//			},
//			"always":function(){
//				$.unecOverlay();
//			},
//			"done" : function(response){
//				if(!response||response.code != 0){
//					 response.data='查询失败,稍后重试';
//				}
//				var content$=$("#order_tab_panel_content");
//				content$.html(response.data);
//				order.service.initSpec();
//				order.prodOffer.init();
//				order.service.searchPack();
//			},
//			fail:function(response){
//				$.unecOverlay();
//				$.alert("提示","请求可能发生异常，请稍后再试！");
//			}
//		});
//	};
	
	//号码预占
	var _btnPurchase=function(obj,needPsw){
		phoneNumberVal = $(obj).attr("numberVal"); 
		var memberRoleCd=CONST.MEMBER_ROLE_CD.MAIN_CARD;
		//选号类型：新装主卡选号、新装副卡选号 Y1、Y2
		var subFlag=$("#subFlag").val();
		if(subFlag=='Y2'){
			memberRoleCd=CONST.MEMBER_ROLE_CD.VICE_CARD;
		}
		//订单序号：O1、O2区分暂存单允许多个订单的情况
		var subnum=$("#subnum").val();
		//入口终端入口，号码入口，订单填写入口:terminal\offer\number
		var subPage=$("#subPage").val(); //
		//号码的预存话费
		var preStoreFare=phoneNumberVal.split("_")[1];
		//保底消费
		var pnPrice=phoneNumberVal.split("_")[2];
		var areaId=$("#p_cust_areaId").val();
		if(areaId==null||areaId==""){
			areaId=OrderInfo.staff.areaId;
		}
		var areaCode=  $(obj).attr("zoneNumber");
		//var areaCode=$("#p_cust_areaId").attr("areaCode");
		if(areaCode==null || areaCode==""){
			areaCode =OrderInfo.staff.areaCode;
		} 
		if(order.service.offerprice!=''){
			var minMonthFare=parseInt(pnPrice);
			//套餐月基本费用
			var packageMonthFare=parseInt(order.service.offerprice);
			if(packageMonthFare<minMonthFare){
				$.alert("提示","对不起,此号码不能被选购.(原因:套餐月基本费用必须大于号码月保底消费)");
				return;
			}
		}
		//正在被预占的号码
		var phoneNumber=phoneNumberVal.split("_")[0];
		var anTypeCd=phoneNumberVal.split("_")[3];
		var plevel=phoneNumberVal.split("_")[5];
		if(phoneNumber){
			var phoneAreaId = $("#p_cust_areaId").val();
			var params={};
			if(needPsw){
				 params={"phoneNumber":phoneNumber,"actionType":"E","anTypeCd":anTypeCd,"areaId":phoneAreaId,"attrList":[{"attrId":"65010036","attrValue":needPsw}]};
			}else{
				 params={"phoneNumber":phoneNumber,"actionType":"E","anTypeCd":anTypeCd,"areaId":phoneAreaId};
			}
			var oldrelease=false;
			var oldPhoneNumber="";
			var oldAnTypeCd="";
			if(subPage=='terminal'||subPage=='number'){
				oldPhoneNumber=_boProdAn.accessNumber;
				oldAnTypeCd=_boProdAn.anTypeCd;
				if(oldPhoneNumber==phoneNumber){
					$.alert("提示","号码已经被预占,请选择其它号码!");
					return;
				}else{
					_boProdAn={};
				}
			}else if(subPage=='offer'){
				for(var i=0;i<OrderInfo.boProdAns.length;i++){
					if(OrderInfo.boProdAns[i].prodId==subnum){
						oldPhoneNumber=OrderInfo.boProdAns[i].accessNumber;
						oldAnTypeCd=OrderInfo.boProdAns[i].anTypeCd;
						break;
					}
				}
				for(var i=0;i<OrderInfo.boProdAns.length;i++){
					if(OrderInfo.boProdAns[i].accessNumber==phoneNumber){
						$.alert("提示","号码已经被预占,请选择其它号码!");
						return;
					}
				}
			}
			if(oldPhoneNumber&&oldPhoneNumber!=""){
				oldrelease=true;
				for(var i=0;i<idcode.length;i++){//身份证预占的号码不需要被释放
					if(idcode[i]==oldPhoneNumber){
						oldrelease=false;
						break;
					}
				}
				if(oldrelease){
					if(needPsw){
						params={"newPhoneNumber":phoneNumber,"oldPhoneNumber":oldPhoneNumber,"newAnTypeCd":anTypeCd,"oldAnTypeCd":oldAnTypeCd,"areaId":phoneAreaId,"attrList":[{"attrId":"65010036","attrValue":needPsw}]};
					}else{
						params={"newPhoneNumber":phoneNumber,"oldPhoneNumber":oldPhoneNumber,"newAnTypeCd":anTypeCd,"oldAnTypeCd":oldAnTypeCd,"areaId":phoneAreaId};
					}
				}
			}
			
			var purchaseUrl=contextPath+"/app/mktRes/phonenumber/purchase";
			$.callServiceAsJson(purchaseUrl, params, {
				"before":function(){
					$.ecOverlay("<strong>正在预占号码,请稍等会儿....</strong>");
				},
				"done" : function(response){
					$.unecOverlay();
					if (response.code == 0) {
						if(selectedLevel==""){//selectedLevel缓存号码等级信息，以缓存的为准
							selectedLevel=response.data.phoneLevelId;
						}
						if(subPage=='number'){
							var content$=$("#order_fill_content");
							content$.html('');
							_boProdAn.accessNumber=phoneNumber;
							_boProdAn.anTypeCd=anTypeCd;
							_boProdAn.level=selectedLevel;
							_boProdAn.org_level=response.data.phoneLevelId;
							_boProdAn.anId=response.data.phoneNumId;
							_boProdAn.areaId=areaId;
							_boProdAn.areaCode = areaCode;
							_boProdAn.memberRoleCd=memberRoleCd;
							_boProdAn.preStore=preStoreFare;
							_boProdAn.minCharge=pnPrice;
							order.service.boProdAn = _boProdAn;
							OrderInfo.returnFlag=2;  // 临时处理
							OrderInfo.order.step=2;
							$("#tentrance").show();
							$("#pentrance").hide();
							$("#nentrance").hide();
							$("#pakeage").show();
							$("#pakeage").attr("class","tab-pane fade in active");
							$("#tentrance").css("width","100%");
							$("#phone").hide();
							$("#number").hide();
							//_qryOfferInfoByPhoneNumFee();
						}else if(subPage=='terminal'){
							mktRes.terminal.setNumber(phoneNumber, response.data.phoneLevelId);
							_boProdAn.accessNumber=phoneNumber;
							_boProdAn.anTypeCd=anTypeCd;
							_boProdAn.level=selectedLevel;
							_boProdAn.org_level=response.data.phoneLevelId;
							_boProdAn.anId=response.data.phoneNumId;
							_boProdAn.areaId=areaId;
							_boProdAn.areaCode = areaCode;
							_boProdAn.memberRoleCd=memberRoleCd;
							_boProdAn.preStore=preStoreFare;
							_boProdAn.minCharge=pnPrice;
							order.service.boProdAn = _boProdAn;
							$("#order").show();
							$("#phonenumberContent").hide();
						}else if(subPage=='offer'){
							//$("#nbr_btn_"+subnum).removeClass("selectBoxTwo");
							//$("#nbr_btn_"+subnum).addClass("selectBoxTwoOn");
							$("#nbr_btn_"+subnum).val(phoneNumber);
							$("#choosedNumSpan").val(phoneNumber);
							_boProdAn.accessNumber=phoneNumber;
							_boProdAn.level=selectedLevel;
							_boProdAn.org_level=response.data.phoneLevelId;
							_boProdAn.areaId=areaId;
							_boProdAn.anTypeCd=anTypeCd;
							_boProdAn.anId=response.data.phoneNumId;
							_boProdAn.preStore=preStoreFare;
							_boProdAn.minCharge=pnPrice;
							var isExists=false;
							if(OrderInfo.boProdAns.length>0){//判断是否选过
								for(var i=0;i<OrderInfo.boProdAns.length;i++){
									if(OrderInfo.boProdAns[i].prodId==subnum){
										OrderInfo.boProdAns[i].accessNumber=phoneNumber;
										OrderInfo.boProdAns[i].anTypeCd=anTypeCd;
										OrderInfo.boProdAns[i].pnLevelId=selectedLevel;
										OrderInfo.boProdAns[i].anId=response.data.phoneNumId;
										OrderInfo.boProdAns[i].areaId=areaId;
										OrderInfo.boProdAns[i].areaCode = areaCode;
										OrderInfo.boProdAns[i].memberRoleCd=memberRoleCd;
										OrderInfo.boProdAns[i].preStore=preStoreFare;
										OrderInfo.boProdAns[i].minCharge=pnPrice;
										isExists=true;
										if(OrderInfo.offerSpec.offerRoles!=undefined){
											OrderInfo.setProdAn(OrderInfo.boProdAns[i]);  //保存到产品实例列表里面
										}
										order.dealer.changeAccNbr(subnum,phoneNumber); //选号玩要刷新发展人管理里面的号码
										break;
									}
								}
							}
							if(!isExists){
								var param={
									prodId : subnum, //从填单页面头部div获取
									accessNumber : phoneNumber, //接入号
									anChooseTypeCd : "2", //接入号选择方式,自动生成或手工配号，默认传2
									anId : response.data.phoneNumId, //接入号ID
									pnLevelId:selectedLevel,
									anTypeCd : anTypeCd, //号码类型
									state : "ADD", //动作	,新装默认ADD	
									areaId:areaId,
									areaCode:areaCode,
									memberRoleCd:memberRoleCd,
									preStore:preStoreFare,
									minCharge:pnPrice
								};
								OrderInfo.boProdAns.push(param);
								if(OrderInfo.offerSpec.offerRoles!=undefined){
									OrderInfo.setProdAn(param);//保存到产品实例列表里面
								}
								order.dealer.changeAccNbr(subnum,phoneNumber);//选号玩要刷新发展人管理里面的号码
							}
							if(subnum=='-1'){
								OrderInfo.boCustInfos.telNumber=phoneNumber;
							}
//							if(order.phoneNumber.dialogForm!=undefined&&order.phoneNumber.dialog!=undefined){
//								order.phoneNumber.dialogForm.close(order.phoneNumber.dialog);
//							}
							$("#order").show();
							//$("#order_prepare").show();
							$("#phonenumberContent").hide();
						}
					}else if (response.code == -2) {
						$.alertM(response.data);
					}else{
						var msg="";
						if(response.data!=undefined&&response.data.msg!=undefined){
							msg=response.data.msg;
						}else{
							msg="号码["+phoneNumber+"]预占失败";
						}
						$.alert("提示","号码预占失败，可能原因:"+msg);
					}
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","请求可能发生异常，请稍后再试！");
				}
			});
		} else {
			$.alert("提示","号码格式不正确!");
		}
	};
	

	
	//链接查询
	var _linkQueryPhoneNumber = function(loc,selected){
		_exchangeSelected(loc,selected);
		_btnQueryPhoneNumber();
	};
	//构造查询条件 
	var _buildInParam = function(param){
		var query_flag_01= $('input[name="query_flag_01"]').parent().attr("class");  //1 no 2 yes
		if(query_flag_01=="toggle btn btn-default off"){
			query_flag_01 = "1";
		}else{
			query_flag_01 = "2";
		}
		var areaId="";
		if(OrderInfo.cust==undefined || OrderInfo.cust.custId==undefined || OrderInfo.cust.custId==""){
			areaId=$("#p_cust_areaId").val();
		}else{
			areaId=OrderInfo.getAreaId();
		}
		var pnHead = $("#pnHead").val(); 
		var pncharacteristic = $("#pncharacteristic").find("a.selected").attr("val");
		var pnEnd = $.trim($("#pnEnd").val());
		if(pncharacteristic!=null && pncharacteristic!=""){
			pnEnd = pncharacteristic;
		}else{
			if(pnEnd=='最后四位'){
				pnEnd='';
		    }
		}
		var phoneNum='';
//		var phoneNum=$.trim($("#phoneNum").val());
//		if(phoneNum=="任意四位"){
//			phoneNum='';
//		}
		var pnCharacterId="";
		var Greater = $("#Greater").val();
		var Less  = $("#Less").val();
//		var preStore$=$("#preStore").find("a.selected");
//		if(preStore$.length>0){
//			Greater= preStore$.attr("Greater");
//			Less=preStore$.attr("Less");
//		}
		
		var poolId = $("#nbrPool option:selected").val();	
		var subPage = $("#subPage").val();
		
//		if($("#pnCharacterId_basic").css("display") != "none"){
			pnCharacterId = $("#pnCharacterId_basic option:selected").val();
//		}
//		if($("#pnCharacterId_all").css("display") != "none"){
//			pnCharacterId = $("#pnCharacterId_all option:selected").attr("val");
//		}
		pnCharacterId = ec.util.defaultStr(pnCharacterId);
		return {"pnHead":pnHead,"pnEnd":pnEnd,"goodNumFlag":pnCharacterId,"maxPrePrice":Less,
			"minPrePrice":Greater,"pnLevelId":'',"pageSize":"10","phoneNum":phoneNum,"areaId":areaId,"poolId":poolId,"subPage":subPage,   
			"queryFlag":query_flag_01
		};
	};
	//点击前定位
	var _exchangeSelected = function(loc,selected){
		$(loc).each(function(){$(this).removeClass("selected");});
		$(selected).addClass("selected");
	};
	//分页查询
	var _getIndexPagePhoneNumber=function(pageIndex){
		var param={pageIndex:pageIndex};
		order.phoneNumber.btnQueryPhoneNumber(param);
	};
	var _idcardCheck=function(num){
		num = num.toUpperCase();
		if(!(/(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(num)))//是否15位数字或者17位数字加一位数字或字母X
		{
			return false;
		}
		var len, re;
		len = num.length;
		if(len == 15) {
			re = new RegExp(/^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/);
			var arrSplit = num.match(re);
			var dtmBirth = new Date('19' + arrSplit[2] + '/' + arrSplit[3] + '/' + arrSplit[4]);
			var bGoodDay;
			bGoodDay = (dtmBirth.getYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
			if(!bGoodDay) {
				return false;
			} else {
				var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
				var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
				var nTemp = 0, i;
				num = num.substr(0, 6) + '19' + num.substr(6, num.length - 6);
				for( i = 0; i < 17; i++) {
					nTemp += num.substr(i, 1) * arrInt[i];
				}
				num += arrCh[nTemp % 11];
				return num;
			}
		}
		if(len == 18) {
			re = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/);
			var arrSplit = num.match(re);
			var dtmBirth = new Date(arrSplit[2] + "/" + arrSplit[3] + "/" + arrSplit[4]);
			var bGoodDay;
			bGoodDay = (dtmBirth.getFullYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
			if(!bGoodDay) {
				return false;
			} else {
				var valnum;
				var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
				var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
				var nTemp = 0, i;
				for( i = 0; i < 17; i++) {
					nTemp += num.substr(i, 1) * arrInt[i];
				}
				valnum = arrCh[nTemp % 11];
				if(valnum != num.substr(17, 1)) {
					return false;
				}
				return num;
			}
		}
		return false;
	};

	

	//选择地区
	var _chooseArea = function(){
		order.area.chooseAreaTree("order/prepare","p_phone_areaId_val","p_phone_areaId",3);
	};
	var _initPage=function(subnum,subPage){
		var url=contextPath+"/app/mktRes/phonenumber/prepare";
		var param={};
		$.callServiceAsHtmlGet(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					 response.data='选号页面加载异常,稍后重试';
				}
				if(response.code != 0) {
					$.alert("提示","查询失败,稍后重试");
					return;
				}
				$("#order").hide();
				$("#order_prepare").hide();
				var content$=$("#phonenumberContent");
				content$.html(response.data).show();
				$("#subnum").val(subnum);
				$("#subPage").val(subPage);
				//$("#div_content").append(response.data);
				//$("#number_modal").modal("show");
				_boProdAn = {accessNumber : "",level : "",anId : "",anTypeCd : ""};
				_initPhonenumber(subPage);
			}
		});	
	};
	var _initPhonenumber=function(subPage,scroller){
		$("#phone").hide();
//		OrderInfo.busitypeflag=1;
		$("#subPage").val(subPage);
		if(CONST.getAppDesc()==1){
			$("#psw_dt").hide();
			$("#psw_dd").hide();
		}
		selectedObj=null;
		ispurchased=0;
		selectedLevel="";
		order.phoneNumber.queryApConfig();
		queryPhoneNbrPool();
		//queryPnLevelProdOffer();
		var param={};
		order.phoneNumber.btnQueryPhoneNumber(param,scroller);
		//1、此段代码加上后会导致在选号页面的其他弹出框（如预占密码弹出框）被覆盖，无法显示--jinjian
		//$("#ec-dialog-container-phonenumber").css("z-index","10002");
		$("#btnNumSearch1").off("click").on("click",function(){order.phoneNumber.btnQueryPhoneNumber(param,scroller);});
		//$("#cc").off("click").on("click",function(event){order.phoneNumber.btnIBydentityQuery(param);event.stopPropagation();});
	};
	//查询平台配置信息
	var _queryApConfig=function(){
		var configParam={"CONFIG_PARAM_TYPE":"TERMINAL_AND_PHONENUMBER"};
		var qryConfigUrl=contextPath+"/app/order/queryApConf";
		$.callServiceAsJsonGet(qryConfigUrl, configParam,{
			"done" : call_back_success_queryApConfig
		});
	};
	var call_back_success_queryApConfig=function(response){
//		var PHONE_NUMBER_PRESTORE;
		var PHONE_NUMBER_SEGMENT;
		var PHONE_NUMBER_FEATURE;
//		var phoneNumberPreStoreHtml="<a href=\"javascript:void(0);\" class=\"selected\" Greater=\"\" Less=\"\">不限</a>";
//		var phoneNumStartHtml="<a href=\"javascript:void(0);\" class=\"selected\" val=\"\">不限</a>";
//		var phoneNumberFeatureLessHtml="<a href=\"javascript:void(0);\" class=\"selected \" val=\"\">不限</a>";
//		var phoneNumberFeatureMoreHtml="<a href=\"javascript:void(0);\" class=\"selected \" val=\"\">不限</a>";
		if(response.data){
			var dataLength=response.data.length;
			//号码预存话费
//			for (var i=0; i < dataLength; i++) {
//				if(response.data[i].PHONE_NUMBER_PRESTORE){
//				  	PHONE_NUMBER_PRESTORE=response.data[i].PHONE_NUMBER_PRESTORE;
//				  	for(var m=0;m<PHONE_NUMBER_PRESTORE.length;m++){
//				  		var  preStore=PHONE_NUMBER_PRESTORE[m].COLUMN_VALUE_NAME.replace(/\"/g, "");
//				  		var greater;
//				  		var less;
//			  			var preStoreArry=preStore.split("-");
//			  			if(preStoreArry.length!=1){
//			  				greater=preStoreArry[0];
//			  				less=preStoreArry[1];
//			  			}else{
//			  				preStoreArry=preStoreArry.toString();
//			  				greater=preStoreArry.substring(0,preStoreArry.length-2);
//			  				less="\"\"";
//			  			}
//			  			preStore=preStore.replace(/\"/g, "");
//				  		phoneNumberPreStoreHtml=phoneNumberPreStoreHtml+"<a href=\"javascript:void(0);\" Greater="+greater+" Less="+less+">"+preStore+"</a>";
//				  	}
//				  	$("#preStore").html(phoneNumberPreStoreHtml);
//					continue;
//				}
//			};
			//号段
			$("#pnHeadDiv").empty();
			for (var i=0; i < dataLength; i++) {
				if(response.data[i].PHONE_NUMBER_SEGMENT){
				  	PHONE_NUMBER_SEGMENT=response.data[i].PHONE_NUMBER_SEGMENT;
				  	var $sel = $('<select id="pnHead" class="selectpicker show-tick form-control"></select>');  
					var $defaultopt = $('<option value="" selected="selected">请选择号段</option>');
					$sel.append($defaultopt);
				  	for(var m=0;m<PHONE_NUMBER_SEGMENT.length;m++){
				  		var  numberStart=PHONE_NUMBER_SEGMENT[m].COLUMN_VALUE_NAME;
				  		numberStart=numberStart.replace(/\"/g, "");
				  		var $option = $('<option value="'+numberStart+'">'+numberStart+'</option>');
						$sel.append($option);
				  }
				  $("#pnHeadDiv").append($sel);
				  $sel.addClass("styled-select");
				  continue;
				}
			};
			$("#pnCharacterId_basicDiv").empty();
			//号码特征
			for (var i=0; i < dataLength; i++) {
				if(response.data[i].PHONE_NUMBER_FEATURE){
				  	PHONE_NUMBER_FEATURE=response.data[i].PHONE_NUMBER_FEATURE;
				  	var featureLength;
				  	if(PHONE_NUMBER_FEATURE.length<=9){
				  		featureLength=PHONE_NUMBER_FEATURE.length;
				  	}else{
				  		featureLength=9;
				  	}
					var $sel = $('<select id="pnCharacterId_basic" class="selectpicker show-tick form-control"></select>');  
					var $defaultopt = $('<option value="" selected="selected">请选择类型</option>');
					$sel.append($defaultopt);
				  	for(var m=0;m<featureLength;m++){
				  		var numberFeature=(PHONE_NUMBER_FEATURE[m].COLUMN_VALUE_NAME).replace(/\"/g, "");
				  		var numberFeatureVal=(PHONE_NUMBER_FEATURE[m].COLUMN_VALUE).replace(/\"/g, "");
				  		var $option = $('<option value="'+numberFeatureVal+'">'+numberFeature+'</option>');
						$sel.append($option);
				  		//phoneNumberFeatureLessHtml=phoneNumberFeatureLessHtml+"<a href=\"javascript:void(0);\" val="+numberFeatureVal+">"+numberFeature+"</a>";
				  	}
//				  	if(PHONE_NUMBER_FEATURE.length>9){
//				  		for(var n=0;n<PHONE_NUMBER_FEATURE.length;n++){
//				  			var numberFeature=(PHONE_NUMBER_FEATURE[n].COLUMN_VALUE_NAME).replace(/\"/g, "");
//				  			var numberFeatureVal=(PHONE_NUMBER_FEATURE[n].COLUMN_VALUE).replace(/\"/g, "");
//				  			phoneNumberFeatureMoreHtml=phoneNumberFeatureMoreHtml+"<a href=\"javascript:void(0);\" val="+numberFeatureVal+">"+numberFeature+"</a>";
//				  		}
//				  		$("#pnCharacterId_more").show();
//				  		$("#pnCharacterId_more").off("click").on("click",function(event){_view_phonenumber_feature();event.stopPropagation();});
//				  	}
				  	
				  	$("#pnCharacterId_basicDiv").append($sel);
				  	$sel.addClass("styled-select");
				   //$("#pnCharacterId_basic").html(phoneNumberFeatureLessHtml);
				  //$("#pnCharacterId_all").html(phoneNumberFeatureMoreHtml);
					continue;
				}
			};
			$("#pnHeadDiv").append('<span class="input-group-addon select-span"></span>');
			$("#pnCharacterId_basicDiv").append('<span class="input-group-addon select-span"></span>');
		}
		//$("#pnCharacterId_basic a").each(function(){$(this).off("click").on("click",function(event){order.phoneNumber.linkQueryPhoneNumber("#pnCharacterId_basic a",this);event.stopPropagation();});});
		//$("#pnCharacterId_all a").each(function(){$(this).off("click").on("click",function(event){order.phoneNumber.linkQueryPhoneNumber("#pnCharacterId_all a",this);event.stopPropagation();});});
		//$("#pnHead a").each(function(){$(this).off("click");$(this).on("click",function(event){order.phoneNumber.linkQueryPhoneNumber("#pnHead a",this);event.stopPropagation();});});
		//$("#preStore a").each(function(){$(this).off("click");$(this).on("click",function(event){order.phoneNumber.linkQueryPhoneNumber("#preStore a",this);event.stopPropagation();});});
	};
	//号码类型全部展示与部分展示
//	var _view_phonenumber_feature = function(){
//		if($('#pnCharacterId_basic').is(':hidden')){
//			$("#pnCharacterId_basic").css("display","");
//			$("#pnCharacterId_all").css("display","none");
//			$("#pnCharacterId_all").parent("dl").css("overflow","inherit");
//		}else{
//			$("#pnCharacterId_basic").css("display","none");
//			$("#pnCharacterId_all").css("display","");
//			$("#pnCharacterId_all").parent("dl").css("overflow","hidden");
//		}
//	};
	//查询号池
	var queryPhoneNbrPool = function(){
		if($("#subPage").val() == 'number'){
		    $("#nbrPoolDiv").empty();
		}else{
			$("#nbrPoolDiv2").empty();
		}
		var url=contextPath+"/app/mktRes/phonenumber/queryPhoneNbrPool";
		var param={};
		var response = $.callServiceAsJson(url,param);
		if (response.code==0) {
			if(response.data){
				var phoneNbrPoolList= response.data.phoneNbrPoolList;
				var $div =$('<div class="input-group select-top"></div>');
				var $span=$('<span class="input-group-addon select-span"></span>');
				var $sel = $('<select id="nbrPool" class="selectpicker show-tick form-control"></select>');  
				var $defaultopt = $('<option value="" selected="selected">请选择号池</option>');
				$sel.append($defaultopt);
				if(phoneNbrPoolList!=null){
					$.each(phoneNbrPoolList,function(){
						var $option = $('<option value="'+this.poolId+'">'+this.poolName+'</option>');
						$sel.append($option);
					});
				}
				$div.append($sel).append($span);
				if($("#subPage").val() == 'number'){
					$("#nbrPoolDiv").append($div);
				}
				else{
					$("#nbrPoolDiv2").append($div);
				}
				$sel.addClass("styled-select");
			}
		}else if(response.code == -2){
			$.alertM(response.data);
		}else{
			$.alert("提示","号池加载失败，请稍后再试！");
		}
	};
	//靓号预存和保底金额查询
	var queryPnLevelProdOffer = function(str){
		var url=contextPath+"/app/mktRes/phonenumber/queryPnLevelProdOffer";
		var areaId = "";
		if(order.ysl!=undefined||str!=undefined){
			areaId=$("#_session_staff_info").attr("areaid");
		}else{
			areaId=$("#p_cust_areaId").val();
		}
		areaId = areaId.substring(0,3)+"0000";
		var param={"areaId":areaId};
		var response = $.callServiceAsJson(url,param);
	};
	
	//设置号码等级
	var _qryPhoneNbrLevelInfoList=function(){
		if(selectedObj==undefined||selectedObj==null){
			$.alert("提示","请先选择号码！");
			return;
		}
		var phoneNumberVal = $(selectedObj).attr("numberVal"); 
		var plevel=phoneNumberVal.split("_")[5];
		var phoneNumber=phoneNumberVal.split("_")[0];
		var areaId=$("#p_cust_areaId").val();
		if(areaId==null||areaId==""){
			areaId=OrderInfo.staff.areaId;
		}
		var qryUrl=contextPath+"/app/mktRes/qryPhoneNbrLevelInfoList";
		$.ligerDialog.open({
			width:560,
			height:350,
			allowClose:false,
			title:'设置号码等级（'+phoneNumber+"）",
			url:qryUrl+"?pnLevelId="+selectedLevel+"&areaId="+areaId+"&org_level="+plevel,
			buttons: [ { text: '确定', onclick:function (item, dialog) {
				var strs=phoneNum_level.split("_");////全局变量，保存“号码等级_预存金额_保底金额”，由弹出框的iframe，赋值
				dialog.close(); 
				//设置选择的样式
				$(".select_nbr_li").each(function(){
					if($(this).hasClass("select")){
						var numberval=$(this).attr("numberval").split("_");
						var tx;
						if(phoneNum_level!=undefined&&phoneNum_level!=""&&numberval[5]!=strs[0]){
							tx="<span style='float:left;margin-left:10px;'>预存<span class='orange'>"+numberval[1]+"</span>元<br/>保底<span class='orange'>"+numberval[2]+"</span>元</span><span style='float:right;margin-right:10px;'>预存<span class='orange'>"+strs[1]+"</span>元<br/>保底<span class='orange'>"+strs[2]+"</span>元</span><span style='width: 15px; display: table; height: 30px; padding-top: 10px;'><img  src='"+contextPath+"/image/common/levelArrow.png'></span>";
						}else{
							tx="<span style='padding-left:10px;'>预存<span class='orange'>"+numberval[1]+"</span>元</span> <span style='padding-left:10px;'> 保底<span class='orange'>"+numberval[2]+"</span>元</span>";
						}
						$(this).find("div").html(tx);
					}
				});
				$(".select_nbr_li").addClass("styled-select");
				//保存刚修改的值
				selectedLevel=strs[0];
			} }, { text: '关闭', onclick: function (item, dialog) { dialog.close(); } }] 	
		});
	};
	//结束选号，不通的模块要做的动作不相同
	var _endSelectNum=function(obj,purchas){
		$.ecOverlay("<strong>正在预占号码,请稍等会儿....</strong>");
		selectedObj = obj;
		ispurchased=purchas;
//		if(selectedObj==undefined||selectedObj==null){
//			$.alert("提示","请先选择号码！");
//			return;
//		}
		if(ispurchased==1){
			_btnToOffer(selectedObj);
		}else{
			var phoneNumberVal_06 = $(selectedObj).attr("numberVal").split("_")[7]; 
			if(phoneNumberVal_06=="1"){
				$("#app_password_dialog").modal("show");
			}else{
				_btnPurchase(selectedObj);
			}
		}
//		$("#uim_check_btn_"+prodId).attr("disabled",false);
//		$("#uim_check_btn_"+prodId).removeClass("disablepurchase").addClass("purchase");
//		$("#uim_release_btn_"+prodId).attr("disabled",true);
//		$("#uim_release_btn_"+prodId).removeClass("purchase").addClass("disablepurchase");
//		$("#uim_txt_"+prodId).attr("disabled",false);
//		$("#uim_txt_"+prodId).val("");
	};
	/**
	 * obj被选中的号码对象
	 * ispurchased是否身份预占号码。1：是,0否。不是身份预占的号码需要调用预占方法。
	 */
	var _selectNum=function(obj,purchas){
		if(selectedObj==obj){//老点同一个号？
			return;
		}
		ispurchased=purchas;
		selectedObj=obj;
		var phoneNumberVal = $(selectedObj).attr("numberVal"); 
		selectedLevel=phoneNumberVal.split("_")[5];
		//去掉其他号码选中效果
		$(obj).siblings().each(function(){
			$(this).removeClass("select");
			var numberval=$(this).attr("numberval").split("_");
			var tx="<span style='padding-left:10px;'>预存<span class='orange'>"+numberval[1]+"</span>元</span> <span style='padding-left:10px;'> 月保底<span class='orange'>"+numberval[2]+"</span>元</span>";
			$(this).find("div").html(tx);
		});
		//添加号码选中样式
		$(obj).addClass("select");
	};
	
	/**
	 * 靓号预占 密码校验
	 */
	var _preePassword=function(){
		var pree_password_text=$("#pree_password_text").val();
		if($.trim(pree_password_text)==""){
			$.alert("提示","预占密码不能为空！");
		}else{
		//	easyDialog.close();
			$("#app_password_dialog").modal('hide');
			$("#pree_password_text").val("");//初始化
			_btnPurchase(selectedObj,pree_password_text);
		}
	};
	 var _btnBack=function(prodId){
		    $("#order").show();
			$('#phonenumberContent').hide();
	};
	//滚动页面入口
	var _scroll = function(scrollObj){
		if(scrollObj && scrollObj.page && scrollObj.page >= 1){
			_initPhonenumber($("#subPage").val(),scrollObj.scroll);
		}
	};
	//返回按钮调用
	var _back = function(){
//		$("#tentrance").show();
//		$("#tentrance").attr("class","active");
//		$("#pentrance").show();
//		$("#nentrance").show();
//		$("#nentrance").attr("class","");
//		$("#tentrance").css("width","");
		
//		$("#pakeage").show();
//		$("#number").attr("class","tab-pane fade");
//		$("pakeage").attr("class","tab-pane fade in active");
		
//		$("#phone").show();
//		$("#number").show();
		//选号第二个页面没下单，返回无需提示取消订单
		if(OrderInfo.order.step == 1){
			var boProdAns = OrderInfo.boProdAns;
				var boProd2Tds = OrderInfo.boProd2Tds;
				//取消订单时，释放被预占的UIM卡
				if(boProd2Tds.length>0){
					for(var n=0;n<boProd2Tds.length;n++){
						var param = {
								numType : 2,
								numValue : boProd2Tds[n].terminalCode
						};
						$.callServiceAsJson(contextPath+"/app/mktRes/phonenumber/releaseErrorNum", param, {
							"done" : function(){}
						});
					}
				}
				//释放预占的号码
				if(boProdAns.length>0){
					for(var n=0;n<boProdAns.length;n++){
						if(boProdAns[n].idFlag){
							continue;
						}
						var param = {
								numType : 1,
								numValue : boProdAns[n].accessNumber
						};
						$.callServiceAsJson(contextPath+"/app/mktRes/phonenumber/releaseErrorNum", param, {
							"done" : function(){}
						});
					}
				}
				//清除号码的缓存！
				order.phoneNumber.resetBoProdAn();
				common.callCloseWebview();
		}else if(OrderInfo.order.step == 2){
		$.confirm("确认","确定要取消该订单吗？",{
			yes:function(){
				//TODO　may initialize something;				
				var boProdAns = OrderInfo.boProdAns;
				var boProd2Tds = OrderInfo.boProd2Tds;
				var boProdAn = order.service.boProdAn;
				//取消订单时，释放被预占的UIM卡
				if(boProd2Tds.length>0){
					for(var n=0;n<boProd2Tds.length;n++){
						var param = {
								numType : 2,
								numValue : boProd2Tds[n].terminalCode
						};
						$.callServiceAsJson(contextPath+"/app/mktRes/phonenumber/releaseErrorNum", param, {
							"done" : function(){}
						});
					}
				}
				//释放预占的号码
				if(boProdAns.length>0){
					for(var n=0;n<boProdAns.length;n++){
						if(boProdAns[n].idFlag){
							continue;
						}
						var param = {
								numType : 1,
								numValue : boProdAns[n].accessNumber
						};
						$.callServiceAsJson(contextPath+"/app/mktRes/phonenumber/releaseErrorNum", param, {
							"done" : function(){}
						});
					}
				}else if(boProdAn.accessNumber.length>0){//进入选套餐页面返回释放预占号码
					var param = {
							numType : 1,
							numValue : boProdAn.accessNumber
					};
					$.callServiceAsJson(contextPath+"/app/mktRes/phonenumber/releaseErrorNum", param, {
							"done" : function(){}
						});
				}
				//清除号码的缓存！
				order.phoneNumber.resetBoProdAn();
				$("#pakeage").hide();
				$("#pakeage").attr("class","tab-pane fade in active");
				$("#tentrance").show();
				$("#phone").show();
				$("#number").show();
				$("#pentrance").show();
				$("#nentrance").show();
				$("#tentrance").css("width","");
				$("#nentrance").attr("class","");
				$("#div_content").html("");
				$("#vice_modal").modal("hide");
				$("#order_prepare").show();
				OrderInfo.order.step=1;
			},no:function(){
				
			}},"question");
		}else if(OrderInfo.order.step==3){
			SoOrder.orderBack();
			$("#order-content").show();
			$("#order-confirm").hide();
			$("#order-dealer").hide();
			OrderInfo.order.step=2;
		}else if(OrderInfo.order.step==4){
			$("#order-confirm").show();
			$("#order-print").hide();
			OrderInfo.order.step=3;
		}else {
			common.callCloseWebview();
		}
		
//		$("#pakeage").show();
//		$("#pakeage").attr("class","tab-pane fade in active");
//		$("#tentrance").show();
//		$("#phone").show();
//		$("#number").show();
//		$("#pentrance").show();
//		$("#nentrance").show();
//		$("#tentrance").css("width","");
//		$("#nentrance").attr("class","");
//		
//		if(OrderInfo.order.step==1){
//			common.callCloseWebview();
//		}else if(OrderInfo.order.step==2){
//			$("#pakeage").hide();
//			OrderInfo.order.step=1;
//		}else{
//			common.callCloseWebview();
//		}
	};
	return {
		qryPhoneNbrLevelInfoList:_qryPhoneNbrLevelInfoList,
		selectNum:_selectNum,
		endSelectNum:_endSelectNum,
		//btnPurchase : _btnPurchase,
		btnQueryPhoneNumber : _btnQueryPhoneNumber,
		linkQueryPhoneNumber : _linkQueryPhoneNumber,
		getIndexPagePhoneNumber :_getIndexPagePhoneNumber,
		queryApConfig:_queryApConfig,
		initPhonenumber:_initPhonenumber,
		boProdAn:_boProdAn,
		resetBoProdAn:_resetBoProdAn,
		btnIBydentityQuery:_btnIBydentityQuery,
		//btnToOffer:_btnToOffer,
		initOffer:_initOffer,
		initPage:_initPage,
		chooseArea : _chooseArea,
		preePassword:_preePassword,
		queryPhoneNbrPool:queryPhoneNbrPool,
		queryFlag:_queryFlag,
		queryPnLevelProdOffer:queryPnLevelProdOffer,
		btnBack:_btnBack,
		scroll:_scroll,
		queryPhoneNumber:_queryPhoneNumber,
		back:_back
	};
})();


/**
 * 终端入口
 * 
 * @author dujb3
 * @modifyby liusd
 */
CommonUtils.regNamespace("mktRes", "terminal");

mktRes.terminal = (function($){
	var _offerSpecId = ""; //保存合约附属ID，合约套餐使用
	var pageSize = 10;
	var termInfo = {};
	/**
	 * 校验是否可以进入下一步
	 */
	var buyChk = {
			buyType : "lj",
			numFlag : false,
			numLevel : "0",
			hyFlag : false,
			hyType: "",
			hyOfferSpecId: 0,
			hyOfferSpecName: "",
			hyOfferSpecQty: 0,
			hyOfferSpecFt: 0,
			hyOfferRoles:null,
			tsnFlag : false
	};
	_initBuyChk = function() {
		buyChk = {
			buyType 	: "lj",
			numFlag 	: false,
			numLevel 	: "0",
			hyFlag 		: false,
			hyType		: "",
			hyOfferSpecId	: 0,
			hyOfferSpecName	: "",
			hyOfferSpecQty	: 0,
			hyOfferSpecFt	: 0,
			hyOfferRoles	: null,
			tsnFlag 		: false
		};
	};
	/**
	 * 检验buyChk的状态，改变选购类型及协助人控制,及下一步操作
	 */
	var _chkState=function(){
		if ("lj"==buyChk.buyType) {
			OrderInfo.actionFlag = 13;
			$("#treaty").hide();
			$("#agreementFie").hide();
			$("#phonenumberFie").hide();
			//$("#dealerMktDiv").show();
		} else if ("hy"==buyChk.buyType){
			OrderInfo.actionFlag = 14;
			//$("#dealerMktDiv").hide();
			$("#phonenumberFie").show();
		}

	};
	var _setNumber=function(num, numLevel){
		$("#choosedNumSpan").val(num);
		buyChk.numFlag = true;
		buyChk.numLevel = numLevel;
		_chkState();
		$("#treaty").show();
	};

	//滚动页面入口
	var _scroll = function(scrollObj){
		if(scrollObj && scrollObj.page && scrollObj.page >= 1){
			_btnQueryTerminal(scrollObj.page,scrollObj.scroll);
		}
	};
	//终端销售 滚动页面入口
	var _termSaleScroll = function(scrollObj){
		if(scrollObj && scrollObj.page && scrollObj.page >= 1){
			_btnQueryTerminalSale(scrollObj.page,scrollObj.scroll);
		}
	};
	//查询
	var _btnQueryTerminalSale = function(pageIndex,scroller){
		OrderInfo.actionFlag=150;
		var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
		var param = {} ;
		param = {
					"startDate":($("#p_startDt").val()).replace(/-/g,''),
					"channelId":$("#p_channelId").val(),
					"areaId":$("#p_channelId").attr("areaid"),
					pageIndex:curPage,
					pageSize:10
		};
        $.callServiceAsHtmlGet(contextPath+"/app/report/terminalSalesList",param,{
			"before":function(){
				$.ecOverlay("终端销售详情查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else{
					OrderInfo.order.step=2;
					$("#terminal_sales_search").hide();
					$("#terminal_sales_list").html(response.data).show();
					$("#terminal_sales_list_scroller").css("transform","translate(0px, -40px) translateZ(0px)");
					if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	/**
	 * 按钮查询
	 */
	var _btnQueryTerminal=function(curPage,scroller){
		$("#phoneModal").modal("hide");
		//隐藏选套餐模块
		if($("#pakeage").length>0){
			$("#pakeage").hide();
		}
		//请求地址
		var url = contextPath+"/app/mktRes/terminal/list";
		//收集参数
		var param = _buildInParam(curPage);
		$.callServiceAsHtml(url,param,{
			"before":function(){
				if(curPage == 1)$.ecOverlay("<strong>查询中,请稍等...</strong>");
			},
			"always":function(){
				if(curPage == 1)$.unecOverlay();
			},
			"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","<br/>查询失败,稍后重试");
					return;
				}
				if(curPage == 1){
					$("#phone-list").html(response.data);
					$.refresh($("#phone-list"));
				}else{
					$("#phone-list-all").append(response.data);
					$.refresh($("#phone-list-all"));
				}
				//回调刷新iscroll控制数据,控件要求
				if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
			}
		});	
	};
	/**
	 * 构造查询条件
	 */
	var _buildInParam = function(curPage){
		var brand 		= ec.util.defaultStr($("#select_brand").val());
		var phoneType 	= ec.util.defaultStr($("#select_phone_type").val());
		var minPrice    = ec.util.defaultStr($("#phonePrice_numd01").val());
		var maxPrice    = ec.util.defaultStr($("#phonePrice_numd02").val());
		//var contractFlag = ec.util.defaultStr($("#select_by_type").val());
		var commCond 	= $("#input_phone_name").val();		
		if(minPrice!=""){
			minPrice=parseInt(minPrice) * 100;
		}
		if(maxPrice!=""){
			maxPrice=parseInt(maxPrice) * 100;
		}
		var attrList = [];
		if(brand != "" && brand != "无限") {
			var attr = {
				"attrId":CONST.TERMINAL_SPEC_ATTR_ID.BRAND,
				"attrValue":brand
			};
			attrList.push(attr);
		}
		if(phoneType != "" && phoneType != "无限") {
			var attr = {
				"attrId":CONST.TERMINAL_SPEC_ATTR_ID.PHONE_TYPE,
				"attrValue":phoneType
			};
			attrList.push(attr);
		}
		return {
			"mktResCd":"",
			"mktResName":commCond,
			"mktResType":"",
			"minPrice":minPrice,
			"maxPrice":maxPrice,
			//"contractFlag":contractFlag,
			"pageInfo":{
				"pageIndex":curPage,
				"pageSize":pageSize
			},
			"attrList":attrList
		};
	};
	/**
	 * 初始化查询条件
	 */
	var _initInParam = function(){
		mktRes.terminal.queryApConfig();
		mktRes.terminal.btnQueryTerminal(1);
	};
	/**
	 * 成功获取搜索条件后展示
	 */
	var call_back_success_queryApConfig=function(response){
		var dataLength=response.data.length;	
		var _phone_brand;
		var _phone_price_area;
		var _phone_type;
		
		for (var i=0; i < dataLength; i++) {
			if(response.data[i].PHONE_BRAND){
				var _obj = $("#select_brand");
			  	_phone_brand=response.data[i].PHONE_BRAND;
			  	for(var m = 0;m < _phone_brand.length; m++){
			  		var phoneBrand=(_phone_brand[m].COLUMN_VALUE_NAME).replace(/\"/g, "");
			  		_obj.append("<option value='"+phoneBrand+"'>"+phoneBrand+"</option>");
			  	}
			}
			if(ec.util.isArray(response.data[i].PHONE_PRICE_AREA)){
			  	_phone_price_area=response.data[i].PHONE_PRICE_AREA;
			  	var  phonePriceArea=(_phone_price_area[0].COLUMN_VALUE_NAME).replace(/\"/g, "");
	  			var phonePriceAreaArry=phonePriceArea.split("-");
	  			var minPrice="";
	  			var maxPrice="";
	  			var rang="";
	  			if(phonePriceAreaArry.length!=1){
	  				minPrice=phonePriceAreaArry[0];
	  			}else{
	  				phonePriceAreaArry=phonePriceAreaArry.toString();
	  				minPrice=phonePriceAreaArry.substring(0,phonePriceAreaArry.length-2);
	  			}
	  			phonePriceArea=(_phone_price_area[_phone_price_area.length-1].COLUMN_VALUE_NAME).replace(/\"/g, "");
	  			phonePriceAreaArry=phonePriceArea.split("-");
	  			if(phonePriceAreaArry.length!=1){
	  				maxPrice=phonePriceAreaArry[1];
	  				rang=maxPrice;
	  			}else{
	  				phonePriceAreaArry=phonePriceAreaArry.toString();
	  				rang=phonePriceAreaArry.substring(0,phonePriceAreaArry.length-2);
	  				maxPrice="";
	  			}
	  			$(".noUiSliderd").noUiSlider({
	  				range: [parseInt(minPrice), parseInt(rang)],
	  				start: [parseInt(minPrice), parseInt(rang)],
	  				step: 10,
	  				slide: function() {
	  					var values = $(this).val();
	  					$("#phonePrice_numd01").val(values[0]);
	  					if(parseInt(values[0])>=parseInt(rang)&&maxPrice==""){
	  						$("#phonePrice_numd02").val("");
	  					}else{
		  					$("#phonePrice_numd02").val(values[1]);
	  					}
	  				}
	  			});
			}
			if(response.data[i].PHONE_TYPE){
				var _obj = $("#select_phone_type");
				_phone_type=response.data[i].PHONE_TYPE;
			  	for(var m=0;m<_phone_type.length;m++){
			  		var phoneType=(_phone_type[m].COLUMN_VALUE_NAME).replace(/\"/g, "");
			  		_obj.append("<option value="+phoneType+">"+phoneType+"</option>");
			  	}
			}
			var content=$("#phoneModal");
			$.refresh(content);
		};
	};
	/**
	 * 获取搜索条件
	 */
	var _queryApConfig=function(){
		var configParam={"CONFIG_PARAM_TYPE":"TERMINAL_AND_PHONENUMBER"};
		var qryConfigUrl=contextPath+"/app/order/queryApConf";
		$.callServiceAsJsonGet(qryConfigUrl, configParam,{
			"done" : call_back_success_queryApConfig
		});
	};
	var _initPhone=function(){
		OrderInfo.order.step=1;
		OrderInfo.busitypeflag=1;
		//请求地址
		var url = contextPath+"/app/mktRes/terminal/prepare";
		var param={};
		var response = $.callServiceAsHtmlGet(url,param);
		var content$ = $("#phone");
		content$.html(response.data);
		$.refresh(content$);
		_initInParam();
		$("#form_terminal_qry").off("submit").on("submit",function(e){
			e.preventDefault();//屏蔽form action默认事件
			mktRes.terminal.btnQueryTerminal(1);
		});
	};
	var _hyClick=function(obj){
		_initBuyChk();
		buyChk.buyType = 'hy';
		_chkState();
		$("#buyTypeBtns .btn-default").removeClass("active");
		$(obj).addClass("active");
	};
	var _ljClick=function(obj){
		$("#choosedNumSpan").val("");
		_initBuyChk();
		buyChk.buyType = 'lj';
		_chkState();
		$("#buyTypeBtns .btn-default").removeClass("active");
		$(obj).addClass("active");
	};
	/**
	 * 选择立即订购终端
	 */
	var _selectTerminal=function(obj){
		var param = {
			mktResTypeCd 	: $(obj).attr("mktResTypeCd"),
			mktResCd		: $(obj).attr("mktResCd"),
			mktResId 		: $(obj).attr("mktResId"),
			brand 			: $(obj).attr("brand"),
			phoneType 		: $(obj).attr("phoneType"),
			phoneColor 		: $(obj).attr("phoneColor"),
			mktName 		: $(obj).attr("mktName"),
			mktPrice 		: $(obj).attr("mktPrice"),
			mktPicA 		: $(obj).attr("mktPicA")
		};
		if(CONST.getAppDesc()==0){
			param.mktSpecCode=$(obj).attr("mktSpecCode");
			param.pageInfo={pageIndex:1,pageSize:pageSize};
			param.attrList=[];
			param.is4G="yes";
		}
		var url = contextPath+"/app/mktRes/terminal/detail";
		$.callServiceAsHtml(url, param, {
			"before":function(){
				$.ecOverlay("<strong>查询中,请稍等...</strong>");
			},"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response || response.code != 0){
					$.alert("提示","<br/>处理失败，请稍后重试！");
					return;
				}
				common.callTitle(3);
				OrderInfo.order.step=2;
				var content$=$("#order").html(response.data).show();
				$.refresh(content$);
				$("#order_prepare").hide();
				_initBuyChk();
				$("#cNumA").click(function(){
					var custId = OrderInfo.cust.custId;
					if(OrderInfo.cust==undefined || custId==undefined || custId==""){
						$.alert("提示","在选号码之前请先进行客户定位或者新建客户！");
						return;
					}
					_chkState();
					order.phoneNumber.initPage('-1','terminal');
				});	
				$("#chkTsnA").off("click").on("click",function(){
					_checkTerminalCode('#tsn');
				});
				$("#purchaseTermA").off("click").on("click",function(){
					_purchase();
				});
				$("#btn_terminal_back").off("click").on("click",function(){
					$("#order_prepare").show();
					$("#order").hide();
				});
				//初始化裸机发展人信息
				OrderInfo.actionFlag=13;
			}
		});	
	};
	
	/**
	 * 切换终端颜色
	 */
	var _selectColor=function(obj){
		var p_pic				=$(obj).attr("p_pic");
		var mktResName			=$(obj).attr("mktResName");
		var mktSalePrice		=$(obj).attr("mktSalePrice");
		var mktNormalSalePrice	=$(obj).attr("mktNormalSalePrice");
		var mktResId			=$(obj).attr("mktResId");
		var mktResTypeCd		=$(obj).attr("mktResTypeCd");
		var mktSpecCode			=$(obj).attr("mktSpecCode");
		$("#term_pic_id").attr("src",p_pic);
		$("#mkt_resname_id").html(mktResName);
		$("#mkt_saleprice_id").html(mktSalePrice+" 元");
		$("#mktResId").val(mktResId);
		$("#mktResName").val(mktResName);
		$("#price").val(mktNormalSalePrice);
		$("#mktResType").val(mktResTypeCd);
		$("#mktSpecCode").val(mktSpecCode);
		$("#fls_terminal_color .btn-default").removeClass("active");
		$("#treaty .btn-default").removeClass("active");
		$(obj).addClass("active");
		var buyTypeTmp=buyChk.buyType;
		_initBuyChk();
		buyChk.buyType=buyTypeTmp;
		_chkState();
		$("#tsn_hid").val("");
		$("#tsn").val("");
		$("#choosedNumSpan").val("");
		$("#choosedOfferPlan").html("");
		termInfo = {};
	};
	
	/**
	 * 选择合约类型,具体合约放致后面操作
	 */
	var _selectHy=function(agreementType,obj){
		$("#treaty .btn-default").removeClass("active");
		if (!buyChk.numFlag){
			$.alert("提示","请先选号！");
			return;
		}
		if (agreementType == 1) {
			buyChk.hyType = 'cfsj';
		} else {
			buyChk.hyType = 'gjsf';
		}
		$(obj).addClass("active");
		buyChk.hyFlag = true;
		_chkState();
		var param={
				"mktResCd":$("#mktResId").val(),
				"agreementType":agreementType
		};
		var url=contextPath+"/app/mktRes/terminal/mktplan";
		$.callServiceAsHtmlGet(url,param,{
			"before":function(){
			},
			"always":function(){
			},
			"done" : function(response){
				if(!response){
					$.alert("提示","<br/>处理失败，请稍后重试！");
					return;
				}
				if(response.code != 0) {
					if (response.code == 1006){
						$.alert("提示","<br/>查询不到，请稍后重试");
					} else {								
						$.alert("提示","<br/>查询失败，请稍后重试");
					}
					return;
				}
				$("#div_offer").html(response.data).show();
				$.refresh($("#div_offer"));
				$("#terminalMain").hide();
				var offerSpecId=$("#select_offerSpecId_0").val();
				_queryOffer(offerSpecId,agreementType);
				//绑定确定按钮click事件
				$("#termOfferSpecConfirm").off("click").on("click",function(event){
					_selectPlan();
				});
			}
		});
	};
	/**
	 * 切换合约
	 */
	_changeHyContent=function(obj,agreementType){
		var offerSpecId=$(obj).val();
		_queryOffer(offerSpecId,agreementType);
	};
	/**
	 * 切换话补或者机补比例
	 */
	_changePeriod=function(obj,agreementType){
		var tabIndex=$(obj).val();
		$("#tab_content .itemMain").hide();
		$("#tab_content_"+tabIndex).show();
		_changeHyContent($("#select_offerSpecId_"+tabIndex),agreementType);
	};
	/**
	 * 查询套餐后生成展示内容
	 */
	var _queryOffer=function(offerSpecId, agreementType){
		//调用order.js中的方法获得主销售品规格
		$("#select_offerSpecId").val(offerSpecId);
		var response = order.service.queryPackForTerm(offerSpecId, agreementType, '');
		if (typeof(response) == "undefined" || response==null){
			$.alert("提示","<br/>未查到套餐，请稍后再试！");
			return;
		}
		if (response.code == -2){
			$.alertM(response.data);
			$.unecOverlay();
			return;
		}
		if(response.code != 0 || response.data.code != "POR-0000"){
			$.alert("提示","<br/>未查到合适套餐，请稍后再试！");
			return;
		}
		var offerHtml="<table class='table table-striped tablecenter'>";
		offerHtml+="  <thead>";
		offerHtml+="    <tr>";
		offerHtml+="      <th>套餐名称</th>";
		offerHtml+="    </tr>";
		offerHtml+="  </thead>";
		offerHtml+="  <tbody class='panel-group'>";
		var offerInfos = response.data.prodOfferInfos;
		if (offerInfos.length == 0) {
			$.alert("提示","<br/>未查到套餐，请稍后再试！");
		}
		for(var i=0;i<offerInfos.length;i++){
			var offer = offerInfos[i];
			var inFlux = '';
			if (offer.inFlux >= 1024) {
				inFlux = offer.inFlux / 1024 + 'G';
			} else {
				inFlux = offer.inFlux + 'M';
			}
			var inVoice=ec.util.defaultStr(offer.inVoice);
			var inWIFI=ec.util.defaultStr(offer.inWIFI);
			var inSMS=ec.util.defaultStr(offer.inSMS);
			var inMMS=ec.util.defaultStr(offer.inMMS);
			var outFlux=ec.util.defaultStr(offer.outFlux);
			var outVoice=ec.util.defaultStr(offer.outVoice);
			
			offerHtml+="<tr offerSpecId='"+offer.offerSpecId+"'";
			offerHtml+=" offerSpecName='"+offer.offerSpecName+"'";
			offerHtml+=" price='"+offer.price+"'";
			offerHtml+=" inWIFI='"+inWIFI+"'";
			offerHtml+=" inFlux='"+inFlux+"'";
			offerHtml+=" inSMS='"+inSMS+"'";
			offerHtml+=" inMMS='"+inMMS+"'";
			offerHtml+=" outFlux='"+outFlux+"'";
			offerHtml+=" outVoice='"+outVoice+"'";
			offerHtml+=" inVoice='"+inVoice+"'>";
			offerHtml+=" <td>"+ec.util.defaultStr(offer.offerSpecName)+"</td>";
			offerHtml+="</tr>";
		}
		offerHtml+="  </tbody>";
		offerHtml+="  </table>";
		
		$("#offerSecond").html(offerHtml);
		$.refresh($("#offerSecond"));
		$("#offerSecond tbody tr").off("click").on("click",function(event){_linkSelectPlan(this);event.stopPropagation();});
	};
	var _linkSelectPlan=function(selected){
		$("#offerSecond tbody tr").removeClass("success");
		var offerSpecId = $(selected).attr("offerSpecId");
		var result = _queryOfferSpec(offerSpecId, selected);
		if (result) {
			$(selected).addClass("success");
		}
	};
	
	var _queryOfferSpec=function(offerSpecId, selected){
		var inParam = {
			"price":$(selected).attr("price"),
			"id" : 'tcnum1',
			"specId" : offerSpecId,
			"custId" : OrderInfo.cust.custId,
			"areaId" : OrderInfo.staff.soAreaId
		};
		order.service.opeSer(inParam); //调用公用弹出层
		return true;
	};
	/**
	 * 在合约套餐窗口选择套餐
	 */
	var _selectPlan=function(){
		//搜索是否有
		var offerSpec=$("#offerSecond tbody tr[class='success']");
		if (offerSpec.length!=1) {
			$.alert("提示","请选择一个套餐！");
			return;
		}
		var chose=true;
		$.each(OrderInfo.offerSpec.offerRoles,function(){ //遍历主套餐规格
			if(this.prodInsts==undefined||this.prodInsts==null){
				chose=false;
				return;
			}
		});
		if(chose){
			mktRes.terminal.offerSpecId = $("#select_offerSpecId").val();
			buyChk.hyFlag = true;
			buyChk.hyOfferSpecId=offerSpec.attr("offerSpecId");
			buyChk.hyOfferSpecName=offerSpec.attr("offerSpecName");
			_chkState();
			$("#agreementFie").show();
			$("#choosedOfferPlan").html(offerSpec.attr("offerSpecName"));
			$("#terminalMain").show();
			$("#div_offer").hide();
		}else{
			$.alert("提示","请选择一个接入产品！");
			return;
		}
	};
	/**
	 * 终端串号校验
	 */
	var _checkTerminalCode = function(id){
		termInfo = {};
		buyChk.tsnFlag = false;
		_chkState();
		$("#tsn_hid").val("");
		
		var tc = $(id).val();
		if(tc == "")
			return ;
		var param = {
			"instCode" 		: tc,
			"mktResTypeCd" 	: $("#mktResType").val(),
			"orderNo" 		: ""
		};
		if(CONST.getAppDesc()==0){
			var mktSpecCode=$("#mktSpecCode").val();
			if($.trim(mktSpecCode)==""){
				$.alert("提示","营销资源返回的规格存货编码为空！");
				return;
			}
			if(mktSpecCode.length>=22){
				mktSpecCode=mktSpecCode.substring(0,22);
			}
			param.mktSpecCode=mktSpecCode;
		}else{
			param.mktResId=$("#mktResId").val();
		}
		var url = contextPath+"/mktRes/terminal/checkTerminal";
		$.callServiceAsJson(url,param,{
			"done" : function(response){
				if (response && response.code == -2) {
					$.alertM(response.data);
				} else if(response&&response.data&&response.data.code == 0) {
					if(response.data.statusCd==CONST.MKTRES_STATUS.USABLE){
						$.alert("提示","<br/>此终端串号可以使用");
						buyChk.tsnFlag = true;
						_chkState();
						$("#tsn_hid").val(tc);
						termInfo = response.data;
					}else if(response.data.statusCd==CONST.MKTRES_STATUS.HAVESALE){ //“已销售未补贴”的终端串码可以办理话补合约
						if(buyChk.hyType =='gjsf'){
							$.alert("提示","<br/>此终端串号可以使用");
							//记录终端串码
//							SoOrder.order.item.mhk.sn  = tc;
							buyChk.tsnFlag = true;
							_chkState();
							$("#tsn_hid").val(tc);
							termInfo = response.data;
							termInfo.couponSourc = "2"; //串码话补标识,“2”已销售未补贴
						}else{
							$.alert("提示","终端当前状态为已销售为补贴[1115],只有在办理话补合约时可用");
						}
					}
					else{
						$.alert("提示",response.data.message);
					}
				}else if(response && response.data && response.data.message
						&& response.data.code == 1){
					$.alert("提示", response.data.message);
				}else{
					$.alert("提示","<br/>校验失败，请稍后重试！");
				}
			}
		});
	};
	/**
	 * 购买手机，判断是否满足条件，合约机跳往填单，裸机直接算费
	 */
	var _purchase=function(){
		if ("lj"==buyChk.buyType) {
			if (!buyChk.tsnFlag) {
				$.alert("提示","<br/>请先校验终端串号。");
				return;
			}
			var apCharge = $("#price").val() / 100;
			var coupons = [{
				couponUsageTypeCd : "3", //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
				inOutTypeId : "1",  //出入库类型
				inOutReasonId : 0, //出入库原因
				saleId : 1, //销售类型
				couponId : termInfo.mktResId, //物品ID
				couponinfoStatusCd : "A", //物品处理状态
				chargeItemCd : CONST.CHARGE_ITEM_CD.COUPON_SALE, //物品费用项类型
				couponNum : 1, //物品数量
				storeId : termInfo.mktResStoreId, //仓库ID
				storeName : "1", //仓库名称
				agentId : 1, //供应商ID
				apCharge : apCharge, //物品价格
				couponInstanceNumber : termInfo.instCode, //物品实例编码
				ruleId : "", //物品规则ID
				partyId : CONST.CUST_COUPON_SALE, //客户ID
				prodId : 0, //产品ID
				offerId : 0, //销售品实例ID
				state : "ADD", //动作
				relaSeq : "" //关联序列	
			}];
			//如果是老客户或新建客户
			if ((OrderInfo.cust.custId)&& OrderInfo.cust.custId != "") {
				coupons[0].partyId = OrderInfo.cust.custId;
			}
			OrderInfo.actionTypeName = "订购";
			OrderInfo.businessName = $("#mktResName").val();
			var data = {};
			data.busiObj = {
				instId : termInfo.mktResId //业务对象实例ID
			};
			data.boActionType = {
				actionClassCd : CONST.ACTION_CLASS_CD.MKTRES_ACTION,
				boActionTypeCd : CONST.BO_ACTION_TYPE.COUPON_SALE
			};
			data.coupons = coupons;
			//发展人
			/*var $li = $("#dealerMktDiv li[name='li_"+$("#mktResId").val()+"']");
			if($li.length>0){
				data.dealers = [];
				$li.each(function(){   //遍历产品有几个发展人
					var dealer = {
						itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
						role : $(this).find("select").val(),
						value : $(this).find("input").attr("staffid") 
					};
					data.dealers.push(dealer);
				});
			}*/
			$("#terminalMain").hide();
			SoOrder.getTokenSynchronize();
			//订单提交
			SoOrder.submitOrder(data);
			return;
		} else if ("hy"==buyChk.buyType) {
			if (!buyChk.tsnFlag) {
				$.alert("提示","<br/>请先校验终端串号。");
				return;
			}
			//校验客户是否已定位
			if (!(OrderInfo.cust.custId)|| OrderInfo.cust.custId=="") {
				$.alert("提示","<br/>在订购套餐之前请先进行客户定位！");
				return;
			}
			//构造参数，填单
			if (buyChk.hyType==""){
				$.alert("提示","<br/>请选择合约!");
				return;
			}
		} else {
			return;
		}
		var coupon = {
			couponUsageTypeCd 	: "5", //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
			inOutTypeId 		: "1",  //出入库类型
			inOutReasonId 		: 0, //出入库原因
			saleId 				: 1, //销售类型
			couponId 			: termInfo.mktResId, //物品ID
			couponinfoStatusCd 	: "A", //物品处理状态
			chargeItemCd 		: CONST.CHARGE_ITEM_CD.COUPON_SALE, //物品费用项类型
			couponNum 			: 1, //物品数量
			storeId 			: termInfo.mktResStoreId, //仓库ID
			storeName 			: "1", //仓库名称
			agentId 			: 1, //供应商ID
			apCharge 			: $("#price").val() / 100, //物品价格
			couponInstanceNumber: termInfo.instCode, //物品实例编码
			ruleId 				: "", //物品规则ID
			partyId 			: OrderInfo.cust.custId, //客户ID
			prodId 				: -1, //产品ID
			offerId 			: -1, //销售品实例ID
			attachSepcId 		: mktRes.terminal.offerSpecId,
			state 				: "ADD", //动作
			relaSeq 			: "" //关联序列	
		};
		if(CONST.getAppDesc()==0){
			coupon.termTypeFlag=termInfo.termTypeFlag;
		}
		OrderInfo.attach2Coupons = [];
		OrderInfo.attach2Coupons.push(coupon);
		var param = {
			boActionTypeCd 	: 'S1',
			boActionTypeName: "订购",
			offerSpec 		: OrderInfo.offerSpec,
			offerSpecId 	: buyChk.hyOfferSpecId,
			offerSpecName 	: buyChk.hyOfferSpecName,
			viceCardNum 	: Number(buyChk.hyOfferSpecQty),
			feeType 		: buyChk.hyOfferSpecFt,
			offerNum 		: 1,
			type 			: 2,//1购套餐2购终端3选靓号
			actionFlag 		: OrderInfo.actionFlag,
			terminalInfo 	: {
				terminalName : $("#mktResName").val(),
				terminalCode : $("#tsn_hid").val()
			},
			offerRoles : buyChk.hyOfferRoles
		};
		OrderInfo.actionTypeName = "订购";
		SoOrder.builder(); //初始化订单数据
		order.main.buildMainView(param);
	};
	//返回按钮调用
	var _back = function(){
		if(OrderInfo.order.step==1){
			common.callCloseWebview();
		}else if(OrderInfo.order.step==2){
			$("#terminal_sales_search").show();
			$("#terminal_sales_list").hide();
			OrderInfo.order.step=1;
		}else{
			common.callCloseWebview();
		}
	};
	//显示超长数字
	var _showNbr = function(title, nbr){
		$.alert(title, nbr);
	};
	return {
		btnQueryTerminal	:_btnQueryTerminal,
		initPhone			:_initPhone,
		queryApConfig		:_queryApConfig,
		selectTerminal		:_selectTerminal,
		setNumber			:_setNumber,
		offerSpecId			:_offerSpecId,
		selectColor			:_selectColor,
		scroll				:_scroll,
		hyClick				:_hyClick,
		ljClick				:_ljClick,
		selectHy			:_selectHy,
		changeHyContent     :_changeHyContent,
		changePeriod        :_changePeriod,
		termSaleScroll      :_termSaleScroll,
		back     :_back,
		btnQueryTerminalSale:_btnQueryTerminalSale,
		showNbr             :_showNbr
	};
})(jQuery);
$(function() {
	OrderInfo.order.step=1;
});
/**
 * uim卡管理
 * 
 * @author wukf
 * date 2013-08-22
 */
CommonUtils.regNamespace("prod","uim");

prod.uim = (function() {
	
	//uim卡号校验
	var _checkUim = function(prodId){
		var phoneNumber = OrderInfo.getAccessNumber(prodId);
		var offerId = "-1"; //新装默认，主销售品ID
		if(OrderInfo.actionFlag==1||OrderInfo.actionFlag==6||OrderInfo.actionFlag==14||(OrderInfo.actionFlag==2&&offerChange.newMemberFlag)){ //新装需要选号
			if(phoneNumber==''){
				$.alert("提示","校验UIM卡前请先选号!");
				return false;
			}
		}
		if(OrderInfo.actionFlag==3 || OrderInfo.actionFlag==22 || OrderInfo.actionFlag==23 || OrderInfo.actionFlag==6 ){ //可选包变更，补换卡，加装副卡
			if(ec.util.isArray(OrderInfo.oldprodInstInfos)){//判断是否是纳入老用户
				$.each(OrderInfo.oldprodInstInfos,function(){
					if(this.prodInstId==prodId){
						offerId = this.mainProdOfferInstInfos[0].prodOfferInstId;
					}
				});
			}else{
				offerId = order.prodModify.choosedProdInfo.prodOfferInstId;
			}
		}
		var cardNo =$.trim($("#uim_txt_"+prodId).val());
		if(cardNo==undefined || cardNo==''){
			$.alert("提示","UIM卡不能为空!");
			return false;
		}
		var inParam = {
			"instCode" : cardNo,
			"selUimType":"1",
			"phoneNum" : phoneNumber,
			"areaId"   : OrderInfo.getProdAreaId(prodId)
		};

		var prodSpecId = OrderInfo.getProdSpecId(prodId);
		var mktResCd="";
		if(CONST.getAppDesc()==0){
			if(getIsMIFICheck(prodId)){
				mktResCd =getMktResCd(CONST.PROD_SPEC_ID.MIFI_ID);
			}else{
				mktResCd = getMktResCd(prodSpecId);
			}
			if(ec.util.isObj(mktResCd)){
//				inParam.mktResCd = mktResCd;
			}else{
				$.alert("提示","查询卡类型失败！");
				return;
			}
			if(OrderInfo.actionFlag==22 || OrderInfo.actionFlag==23){ //补换卡和异地补换卡
				if(prod.changeUim.is4GProdInst){ //如果已办理4G业务，则校验uim卡是否是4G卡
					inParam.onlyLTE = "1";
				}
			}
		}
		var data = query.prod.checkUim(inParam);//校验uim卡
		if(data==undefined || data.baseInfo==undefined){
			return false;
		}
		//根据uim返回数据组织物品节点
		var couponNum = data.baseInfo.qty ;
		if(couponNum==undefined||couponNum==null){
			couponNum = 1 ;
		}
		var coupon = {
			couponUsageTypeCd : "3", //物品使用类型
			inOutTypeId : "1",  //出入库类型
			inOutReasonId : 0, //出入库原因
			saleId : 1, //销售类型
			couponId : data.baseInfo.mktResId, //物品ID
			couponinfoStatusCd : "A", //物品处理状态
			chargeItemCd : "3000", //物品费用项类型
			couponNum : couponNum, //物品数量
			storeId : data.baseInfo.mktResStoreId, //仓库ID
			storeName : "1", //仓库名称
			agentId : 1, //供应商ID
			apCharge : 0, //物品价格
			couponInstanceNumber : data.baseInfo.mktResInstCode, //物品实例编码
			terminalCode : data.baseInfo.mktResInstCode,//前台内部使用的UIM卡号
			ruleId : "", //物品规则ID
			partyId : OrderInfo.cust.custId, //客户ID
			prodId :  prodId, //产品ID
			offerId : offerId, //销售品实例ID
			state : "ADD", //动作
			relaSeq : "" //关联序列	
		};
		if(CONST.getAppDesc()==0){
			coupon.cardTypeFlag=data.baseInfo.cardTypeFlag;//UIM卡类型
		}
		$("#uim_check_btn_"+prodId).attr("disabled",true);
		$("#uim_release_btn_"+prodId).attr("disabled",false);
		$("#uim_release_btn_"+prodId).removeClass("disabled");
		$("#uim_txt_"+prodId).attr("disabled",true);
		if(getIsMIFICheck(prodId)){//判断是否通过MIFI 校验
			$("#isMIFI_"+prodId).val("yes");
		}else{
			$("#isMIFI_"+prodId).val("no");
		}
		OrderInfo.clearProdUim(prodId);
		OrderInfo.boProd2Tds.push(coupon);
		if(OrderInfo.actionFlag==22 && data.baseInfo.cardTypeFlag==1){
		//	_queryAttachOffer();
		  AttachOffer.queryCardAttachOffer(data.baseInfo.cardTypeFlag);  //加载附属销售品
	    }
	};
	
	/*
	 * 是否是MIFI卡类型校验
	 */
	var getIsMIFICheck=function(prodId){
		var prodIdTmp=(Math.abs(prodId)-1);
		if(AttachOffer.openServList.length>prodIdTmp){
			var specList = AttachOffer.openServList[prodIdTmp].servSpecList;
			for (var j = 0; j < specList.length; j++) {
				var spec = specList[j];
				if(spec.isdel!="Y" && spec.isdel!="C"){
					if(spec.servSpecId==CONST.PROD_SPEC_ID.MIFI_ID && CONST.APP_DESC==0){
						return true ; 
					}
				}
			}
		}
		return false;
	};
	
	var getMktResCd = function(prodSpecId){
		var param={
			"prodSpecId":prodSpecId
		};
		var url = contextPath+"/mktRes/uim/getMktResCd";
		$.ecOverlay("<strong>获取产品规格中,请稍等...</strong>");
		var response = $.callServiceAsJson(url,param);
		$.unecOverlay();
		if (response.code == "0") {
			return response.data;
		}else{
			return "";
		}
	};
	
	//uim卡号释放
	var _releaseUim = function(prodId){	
		var cardNo =$.trim($("#uim_txt_"+prodId).val());
		if(cardNo==undefined || cardNo==''){
			$.alert("提示","UIM卡不能为空!");
			return false;
		}
/*		var phoneNumber = OrderInfo.getAccessNumber(prodId);
		var inParam = {
			"oldInstCode":cardNo,
			"phoneNum":phoneNumber
		};
		var data = query.prod.releaseUim(inParam);//释放uim卡
		if(data==undefined){
			return false;
		}*/
		//释放UIM并更新门户记录
		var param = {
				numType : 2,
				numValue : cardNo
		};
		var jr = $.callServiceAsJson(contextPath+"/app/mktRes/phonenumber/releaseErrorNum", param);			
		if(jr.code==-2){
			$.alertM(jr.data);
			return;
		}
		if(jr.code==-1){
			$.alert("提示",jr.data);
			return;
		}
		$.alert("提示","成功释放UIM卡："+cardNo);
		if(OrderInfo.actionFlag==22){
			$('#attach').children().remove();
	    }
		$("#uim_check_btn_"+prodId).attr("disabled",false);
		$("#uim_release_btn_"+prodId).attr("disabled",true);
		$("#uim_txt_"+prodId).attr("disabled",false);
		$("#uim_txt_"+prodId).val("");
		OrderInfo.clearProdUim(prodId);
	};
	
	//保存旧卡
	var _setOldUim = function(offerId ,prodId,uim){
		var oldUim={
			couponUsageTypeCd : "3", //物品使用类型
			inOutTypeId : "2",  //出入库类型
			inOutReasonId : 0, //出入库原因
			saleId : 1, //销售类型
			couponId :uim.couponId, //物品ID
			couponinfoStatusCd : "A", //物品处理状态
			chargeItemCd : CONST.ACCT_ITEM_TYPE.UIM_CHARGE_ITEM_CD, //物品费用项类型
			couponNum : 1, //物品数量
			//storeId : oldUimInfo.storeId, //仓库ID
			storeId : 1, //仓库ID
			storeName : "11", //仓库名称
			agentId : 1, //供应商ID
			apCharge : 0, //物品价格
			couponInstanceNumber : uim.couponInsNumber, //物品实例编码
			terminalCode : uim.couponInsNumber,//前台内部使用的UIM卡号
			ruleId : "", //物品规则ID
			partyId : OrderInfo.cust.custId, //客户ID
			prodId : prodId, //产品ID
			offerId : offerId, //销售品实例ID
			state : "DEL", //动作
			relaSeq : "", //关联序列
			id:0,
			isOld : "T",  //旧卡
			is4GCard : uim.is4GCard
		};
		OrderInfo.boProd2OldTds.push(oldUim);
		order.prodModify.choosedProdInfo.extCouponInstanceId = uim.extCouponInstanceId;
		order.prodModify.choosedProdInfo.corCouponInstanceId = uim.corCouponInstanceId;
	};

	//根据UIM类型，设置产品是3G还是4G，并且保存uim卡
	var _setProdUim = function(){
		OrderInfo.boProd2OldTds = []; //清空旧卡
		var flag = true;
		if(OrderInfo.actionFlag==3 || OrderInfo.actionFlag==22 || OrderInfo.actionFlag==23){ //可选包变更，补换卡
			var prod = order.prodModify.choosedProdInfo; 
			var uim = query.prod.getTerminalInfo(prod);
			if(uim == undefined){  //查询旧卡信息失败返回
				return false;
			}
			_setOldUim(prod.prodOfferInstId,prod.prodInstId,uim); //保存旧卡信息
			if(uim.is4GCard=="Y"){
				prod.prodClass = CONST.PROD_CLASS.FOUR;
			}else{
				prod.prodClass = CONST.PROD_CLASS.THREE;
			}
		}else if(OrderInfo.actionFlag==21){
			var prod = {};
			$.each(OrderInfo.viceOfferSpec,function(){
				var prodId=this.prodId;
				$.each(OrderInfo.offer.offerMemberInfos,function(){
					if(this.objType==CONST.OBJ_TYPE.PROD&&this.objInstId==prodId){ //接入类产品
						prod.prodInstId = this.objInstId;
						prod.accNbr = this.accessNumber;
						var uim = query.prod.getTerminalInfo(prod);
						if(uim == undefined){  //查询旧卡信息失败返回
							flag = false;
							return false;
						}
						_setOldUim(this.offerId,this.objInstId,uim); //保存旧卡信息
						if(uim.is4GCard=="Y"){
							this.prodClass = CONST.PROD_CLASS.FOUR;
						}else{
							this.prodClass = CONST.PROD_CLASS.THREE;
						}
					}
				});
			});
		}else{
			var prod = {};
			$.each(OrderInfo.offer.offerMemberInfos,function(){
				if(this.objType==CONST.OBJ_TYPE.PROD){ //接入类产品
					prod.prodInstId = this.objInstId;
					prod.accNbr = this.accessNumber;
					var uim = query.prod.getTerminalInfo(prod);
					if(uim == undefined){  //查询旧卡信息失败返回
						flag = false;
						return false;
					}
					_setOldUim(this.offerId,this.objInstId,uim); //保存旧卡信息
					if(uim.is4GCard=="Y"){
						this.prodClass = CONST.PROD_CLASS.FOUR;
					}else{
						this.prodClass = CONST.PROD_CLASS.THREE;
					}
					var prodInfo = order.prodModify.choosedProdInfo; 
					if(prodInfo!=undefined && prodInfo.prodInstId==this.objInstId){
						prodInfo.prodClass = this.prodClass;
					}
				}
			});
		}
		return flag;	
	};
	
	return {
		getMktResCd:getMktResCd,
		checkUim				: _checkUim,
		releaseUim 				: _releaseUim,
		setProdUim				: _setProdUim,
		setOldUim				: _setOldUim
	};
})();
/**
 * 产品相关查询
 * 没有任何业务逻辑
 * @author wukf
 * date 2013-08-22
 */
CommonUtils.regNamespace("query","prod");

query.prod = (function() {
	
	/**
	 * 产品规格属性查询
	 * @param  offerSpecId 销售品规格ID
	 * @param  prodSpecId 产品规格ID
	 */
	var _prodSpecParamQuery = function(param){
		addParam(param);
		var url = contextPath + "/prod/prodSpecParamQuery";
		$.ecOverlay("<strong>正在查询产品规格属性中,请稍后....</strong>");
		var response = $.callServiceAsJsonGet(url,param);
		$.unecOverlay();
		if (response.code==0) {
			if(response.data){
				return response.data;
			}
		}else if (response.code==-2){
			$.alertM(response.data);
			return;
		}else {
			$.alert("提示","产品规格属性失败,稍后重试");
			return;
		}
	};
	
	/**
	 * 产品实例属性查询
	 * @param  prodId 产品实例ID
	 * @param  acctNbr 产品接入号码
	 * @param  ifServItem 是否是功能产品
	 */
	var _prodInstParamQuery = function(param){
		addParam(param);
		var url = contextPath + "/prod/prodInstParamQuery";
		$.ecOverlay("<strong>正在查询产品实例属性中,请稍后....</strong>");
		var response = $.callServiceAsJsonGet(url,param);
		$.unecOverlay();
		if (response.code==0) {
			if(response.data){
				return response.data;
			}
		}else if (response.code==-2){
			$.alertM(response.data);
			return;
		}else {
			$.alert("提示","产品规格属性失败,稍后重试");
			return;
		}
	};
	
	/**
	 * 产品下终端实例数据查询
	 * @param  prodId 产品实例ID
	 * @param  accNbr 产品接入号
	 * @param  areaId  受理地区
	 * @callBackFun 回调函数
	 * @service/intf.soService/queryOfferCouponById
	 */
	var _getTerminalInfo = function(prod){
		var params = {
			prodId: prod.prodInstId,
			areaId: OrderInfo.getProdAreaId(prod.prodInstId),
			acctNbr: prod.accNbr,
			isServiceOpen:"Y"
		};
		$.ecOverlay("<strong>正在查询产品下终端实例数据中,请稍后....</strong>");
		var response = $.callServiceAsJson(contextPath+"/token/app/order/queryTerminalInfo", params, {});
		$.unecOverlay();
		if(response.code == 0){
			return response.data;
		}else if (response.code == -2) {
			$.alertM(response.data);
		}else{
			$.alert("错误提示","接口未返回号码["+params.acctNbr+"]产品原UIM卡数据，无法继续受理！");
		}
	};
	
	/**
	 * 产品下账号信息查询
	 * @param  prodId 产品实例ID
	 * @param  acctCd 账号信息
	 * @param  areaId  受理地区
	 * @callBackFun 回调函数
	 * @service/intf.soService/queryOfferCouponById
	 */
	var _queryAcct = function(param,callBackFun) {
		param.isServiceOpen="Y";
		var url= contextPath+"/order/account";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsJsonGet(url,param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询账户信息中,请稍后....</strong>");
				},
				"done" : function(response){
					$.unecOverlay();
					if (response.code==0) {
						callBackFun(response.data);
					}else if (response.code==-2){
						$.alertM(response.data);
					}else {
						$.alert("提示","查询账户信息失败,稍后重试");
					}
				}
			});
		}else{
			$.ecOverlay("<strong>正在查询账户信息中,请稍后....</strong>");
			var response = $.callServiceAsJsonGet(url,param);	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data.offerSpec;
				}
			}else if (response.code==-2){
				$.alertM(response.data);
			}else {
				$.alert("提示","查询账户信息失败,稍后重试");
			}
		}
	};
	
	/**
	 * 终端串号校验
	 */
	var _checkTerminal = function(param){
		var url = contextPath+"/mktRes/terminal/checkTerminal";
		$.ecOverlay("<strong>终端校验中,请稍后....</strong>");
		var response = $.callServiceAsJson(url,param);
		$.unecOverlay();
		if (response.code == -2) {
			$.alertM(response.data);
		}else if(response.data && response.data.code == 0) {
			return response.data;
		}else if( response.data.code == 1){
			$.alert("提示", response.data.message);
		}else{
			$.alert("提示","<br/>校验失败，请稍后重试！");
		}
	};
	
	//校验UIM卡
	var _checkUim=function(param){
		var url = contextPath+"/app/mktRes/uim/checkUim";
		$.ecOverlay("<strong>UIM卡校验中,请稍等...</strong>");
		var response = $.callServiceAsJson(url,param);
		$.unecOverlay();
		if (response.code == 0) {
			$.alert("提示","UIM卡校验成功!");
			return response.data;
		}else{
			if(typeof response == undefined){
				$.alert("提示","UIM卡校验请求调用失败，可能原因服务停止或者数据解析异常");
			}else if (response.code == -2) {
				$.alertM(response.data);
			}else{
				var msg="";
				if(response.data!=undefined && response.data.msg!=undefined){
					msg=response.data.msg;
				}else{
					msg="卡号["+cardNo+"]预占失败";
				}
				$.alert("提示","UIM卡校验失败，可能原因:"+msg);
			}
		}
	};
	
	//释放UIM卡
	var _releaseUim = function(param){
		var url = contextPath+"/mktRes/uim/checkUim";
		$.ecOverlay("<strong>UIM卡释放中,请稍等...</strong>");
		var response = $.callServiceAsJson(url,param);
		$.unecOverlay();
		if (response.code == 0) {
			$.alert("提示","UIM卡释放成功!");
			return response.data;
		}else{
			if(typeof response == undefined){
				$.alert("提示","UIM卡释放请求调用失败，可能原因服务停止或者数据解析异常");
			}else if (response.code == -2) {
				$.alertM(response.data);
			}else{
				var msg="";
				if(response.data!=undefined && response.data.msg!=undefined){
					msg=response.data.msg;
				}else{
					msg="卡号["+cardNo+"]预占失败";
				}
				$.alert("提示","UIM卡释放失败，可能原因:"+msg);
			}
		}
	};
	
	var _getOldUim = function(){
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
		var oldUimInfo = _getTerminalInfo(prodInfo);
		if(oldUimInfo==undefined){
			return;
		}
		var oldUimdata={
			couponUsageTypeCd : "3", //物品使用类型
			inOutTypeId : "2",  //出入库类型
			inOutReasonId : 0, //出入库原因
			saleId : 1, //销售类型
			couponId :oldUimInfo.couponId, //物品ID
			couponinfoStatusCd : "A", //物品处理状态
			chargeItemCd : "3000", //物品费用项类型
			couponNum : 1, //物品数量
			//storeId : oldUimInfo.storeId, //仓库ID
			storeId : 1, //仓库ID
			storeName : "11", //仓库名称
			agentId : 1, //供应商ID
			apCharge : 0, //物品价格
			couponInstanceNumber : oldUimInfo.couponInsNumber, //物品实例编码
			ruleId : "", //物品规则ID
			partyId : OrderInfo.cust.custId, //客户ID
			prodId :prodInfo.prodInstId, //产品ID
			offerId : prodInfo.prodOfferInstId, //销售品实例ID
			state : "DEL", //动作
			relaSeq : "", //关联序列
			id:0,
			isOld : "T"  //旧卡
		};
		return oldUimdata;
	};
	
	//检查是否是4G产品实例（是否已开通4G功能产品）
	var _checkIs4GProdInst = function(prodInfo){
		var param = {
			    prodId : prodInfo.prodInstId,
			    prodSpecId : prodInfo.productId,
			    offerSpecId : prodInfo.prodOfferId,
			    acctNbr : prodInfo.accNbr
		};
		var data = query.offer.queryOpenedAttachAndServ(param);
		if(data && data.result && data.result.servLists){
			var is4G = false;
			$.each(data.result.servLists,function(){//遍历是否有开通4G上网功能
				if(this.servSpecId == CONST.PROD_SPEC.PROD_FUN_4G){ //开通4G功能产品
					is4G = true; //已开通4G上网功能产品
				}
			});
			return is4G;
		} 
		return false;
	};
	
	//补充查询基本条件
	var addParam = function(param){
		param.staffId = OrderInfo.staff.staffId;
		param.channelId = OrderInfo.staff.channelId;
		param.partyId = OrderInfo.cust.custId;
		param.areaId = OrderInfo.getProdAreaId(param.prodId);
		param.distributorId = OrderInfo.staff.distributorId;
		if(OrderInfo.order.soNbr!=undefined && OrderInfo.order.soNbr != ""){  //缓存流水号
			param.soNbr = OrderInfo.order.soNbr;
		}
	};
	
	return {
		checkUim				: _checkUim,
		releaseUim 				: _releaseUim,
		getTerminalInfo 		: _getTerminalInfo,
		prodSpecParamQuery		: _prodSpecParamQuery,
		prodInstParamQuery		: _prodInstParamQuery,
		getOldUim 				: _getOldUim,
		queryAcct				: _queryAcct,
		checkTerminal			: _checkTerminal,
		checkIs4GProdInst		: _checkIs4GProdInst
	};
})();
/**
 * 打印方法-回执、发票、押金票据
 * 
 * @author dujb3
 */
CommonUtils.regNamespace("common", "print");
/**
 * 打印方法-回执、发票、押金票据
 */
common.print = (function($){
	//回执打印准备
	var _voucherCommon=function(olId){
		var ifPrint = $('a[olId=' + olId + ']').attr("ifPrint");
		if (CONST.getAppDesc() == 0 && 'N' == ifPrint) {
			var trList = $("#tab_orderList tr[olId=" + olId + "]");
			var areaId = '';
			var instList = [];
			var newProdFlag = 'false';
			for (var i=0; i < trList.length; i++) {
				var tr = trList[i];
				var actionClass = $(tr).attr("actionClass");
				if (actionClass == '1600') {
					continue;
				}
				newProdFlag = $(tr).attr("newProdFlag");
				if (newProdFlag == 'true') {
					break;
				}
				var instId = $(tr).attr("objInstId");
				if (instId == undefined || instId == '') {
					$.alert("提示", "objInstId为空，请核查接口返回的数据！");
					return false;
				}
				var accessNumber = $(tr).attr("accessNumber");
				if (accessNumber == undefined || accessNumber == '') {
					$.alert("提示", "accessNumber为空，请核查接口返回的数据！");
					return false;
				}
			}
			for (var i=0; newProdFlag == 'false' && i < trList.length; i++) {
				var tr = trList[i];
				var actionClass = $(tr).attr("actionClass");
				if (actionClass == '1600') {
					continue;
				}
				var instId = $(tr).attr("objInstId");
				var accessNumber = $(tr).attr("accessNumber");
				if ($.inArray(instId, instList) >= 0) {
					continue;
				}
				areaId = $(tr).attr("areaId");
				OrderInfo.orderResult.olNbr = $(tr).attr("olNbr");
				var custId = '';
				OrderInfo.order.soNbr = UUID.getDataId();
				var param = {
						areaId : areaId,
						acctNbr : accessNumber,
						custId : custId,
						soNbr : OrderInfo.order.soNbr ,
						//queryType : "1,2,3,4,5",
						instId : instId,
						type : "2"
				};
				var loadInstFlag = query.offer.invokeLoadInst(param);
				if (!loadInstFlag) {
					return false;
				}
				instList.push(instId);
			}
			$('a[olId=' + olId + ']').attr("ifPrint", "Y");
		}
		if (OrderInfo.order.soNbr == undefined || OrderInfo.order.soNbr==''){
			OrderInfo.order.soNbr = UUID.getDataId();
		}
		OrderInfo.orderResult.olId = olId;
		return true;
	};
	//点击查看
	var _preSign=function(olId,chargeItems){
		if(!_voucherCommon(olId)){
			return;
		}
		var voucherInfo = {
			"olId":OrderInfo.orderResult.olId,
			"soNbr": OrderInfo.order.soNbr
		};
		var arr=new Array(3);
		if(ec.util.browser.versions.android){
			arr[0]='order/sign/downVoucher';				
		}else{
			arr[0]='print/iosVoucher';				
		}
		arr[1]='voucherInfo';
		arr[2]=JSON.stringify(voucherInfo);
		MyPlugin.printShow(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	//点击打印回执预览回执内容
	var _signVoucher=function(params){
		var PcFlag="1";
		params.PcFlag=PcFlag;
		var url=contextPath+"/order/sign/previewHtmlForSign";
		$.callServiceAsHtml(url, params, {
			"before":function(){
				$.ecOverlay("<strong>生成回执预览的html,请稍等会儿....</strong>");
			},"always":function(){
				$.unecOverlay();
			},	
			"done" : function(response){
				if (response.code == 0) {
					$("#order-confirm").hide();
					$("#order-print").html(response.data).show();
					OrderInfo.order.step=4;
					$("#datasignBtn").off("click").on("click",function(){
						common.callDatasign("common.print.showDataSign");
					});
					$("#print_ok").off("click").on("click",function(){
//						$("#order-confirm").show();
//						$("#order-print").hide();
						if(!ec.util.isObj($("#signinput").val())){
							$.alert("提示","请先进行签名，然后再保存！");
						}else{
							_saveHtml2Pdf();
						}
					});
				}else if (response.code == -2) {
					$.alertM(response.data);
				}else{
					$.alert("提示","生成回执预览的html失败!");
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});
	};
	
	var _saveHtml2Pdf=function(){
		
//		$("#olId").val(OrderInfo.orderResult.olId);
//		$("#print_id").submit();
//		var url = contextPath+"/order/sign/gotoPrint";
//		var param={};
//		var response = $.callServiceAsHtml(url,param);
//		var height_=document.getElementById("order-print").offsetHeight;
//		var imgHeigh_=document.getElementById("datasign").offsetHeight;
		var params={
			olId:OrderInfo.orderResult.olId,
			signFlag:"5",
			busiType:"9",
			sign:_splitBaseforStr($("#signinput").val())
		};
//		$.ecOverlay("<strong>正在保存回执,请稍等会儿...</strong>");
		var url=contextPath+"/order/sign/saveSignPdfForApp";
//		var response=$.callServiceAsJson(url, params, {});
//		$.unecOverlay();
//		if(response.code == 0){
//			$("#order-confirm").show();
//			$("#order-print").hide();
//			OrderInfo.order.step=3;
//		}else if (response.code == -2) {
//			$.alertM(response.data);
//		}else{
//			var error=response.data.errData!=null?response.data.errData:"保存回执失败!";
//			$.alert("提示",error);
//		}
		$.callServiceAsJson(url, params, {
			"before":function(){
				$.ecOverlay("<strong>正在保存回执,请稍等会儿....</strong>");
			},	
			"done" : function(response){
				$.unecOverlay();
				if (response.code == 0) {
					$("#order-confirm").show();
					$("#order-print").hide();
					$("#printVoucherA").attr("disabled","disabled");//回执保存成功后  回执按钮改为灰色不可操作
					OrderInfo.order.step=3;
				}else if (response.code == -2) {
					$.alertM(response.data);
				}else{
					var error=response.data.errData!=null?response.data.errData:"保存回执失败!";
					$.alert("提示",error);
				}
			}
		});
		
	};
	var _splitBaseforStr = function(str){
		var re=new RegExp("=","g");
		str=str.replace(re,"<p/>");
		return str;
	};
	//显示签名
	var _showDataSign = function(datasignBase64){
		$("#datasign").attr("src","data:image/jpg;base64,"+datasignBase64);
		$("#signinput").val(datasignBase64);
	};
	
	//回执打印（重打）
	var _preVoucher=function(olId, chargeItems){
		if(!_voucherCommon(olId)){
			return;
		}
		var voucherInfo = {
			"olId":OrderInfo.orderResult.olId,
			"soNbr": OrderInfo.order.soNbr,
			"busiType":"1",
			"chargeItems":chargeItems
		};
		common.print.printVoucher(voucherInfo);
	};
	//调客户端展示打印pdf
	var _printVoucher=function(voucherInfo){
			var arr=new Array(3);
			if(ec.util.browser.versions.android){
				arr[0]='print/voucher';				
			}else{
				arr[0]='print/iosVoucher';				
			}
			arr[1]='voucherInfo';
			arr[2]=JSON.stringify(voucherInfo);
			MyPlugin.printShow(arr,
                function(result) {
                },
                function(error) {
                }
			);
	};
	//发票打印准备
	var _preInvoice=function(olId,olNbr, printFlag){
		var ifInvoice = $('a[olId=' + olId + ']').attr("ifInvoice");
		var areaId = $('a[olId=' + olId + ']').attr("areaId");
		if (CONST.getAppDesc() == 0 && 'N' == ifInvoice) {
			var trList = $("#tab_orderList tr[olId=" + olId + "]");
			var instList = [];
			var newProdFlag = 'false';
			for (var i=0; i < trList.length; i++) {
				var tr = trList[i];
				var actionClass = $(tr).attr("actionClass");
				if (actionClass == '1600') {
					continue;
				}
				newProdFlag = $(tr).attr("newProdFlag");
				if (newProdFlag == 'true') {
					break;
				}
				var instId = $(tr).attr("objInstId");
				if (instId == undefined || instId == '') {
					$.alert("提示", "objInstId为空，请核查接口返回的数据！");
					return ;
				}
				var accessNumber = $(tr).attr("accessNumber");
				if (accessNumber == undefined || accessNumber == '') {
					$.alert("提示", "accessNumber为空，请核查接口返回的数据！");
					return ;
				}
			}
			for (var i=0; newProdFlag == 'false' && i < trList.length; i++) {
				var tr = trList[i];
				var actionClass = $(tr).attr("actionClass");
				if (actionClass == '1600') {
					continue;
				}
				var instId = $(tr).attr("objInstId");
				var accessNumber = $(tr).attr("accessNumber");
				if ($.inArray(instId, instList) >= 0) {
					continue;
				}
				areaId = $(tr).attr("areaId");
				OrderInfo.orderResult.olNbr = $(tr).attr("olNbr");
				var custId = '';
				OrderInfo.order.soNbr = UUID.getDataId();
				var param = {
						areaId : areaId,
						acctNbr : accessNumber,
						custId : custId,
						soNbr : OrderInfo.order.soNbr ,
						//queryType : "1,2,3,4,5",
						instId : instId,
						type : "2"
				};
				var loadInstFlag = query.offer.invokeLoadInst(param);
				if (!loadInstFlag) {
					return;
				}
				instList.push(instId);
			}
			$('a[olId=' + olId + ']').attr("ifInvoice", "Y");
		}
		if (OrderInfo.order.soNbr == undefined || OrderInfo.order.soNbr==''){
			OrderInfo.order.soNbr = UUID.getDataId();
		}
		OrderInfo.orderResult.olNbr = olNbr;
		OrderInfo.orderResult.olId = olId;
		var param = {
			"olId" : OrderInfo.orderResult.olId,
			"soNbr": OrderInfo.order.soNbr,
			"billType" : 0,
			"printFlag": printFlag,
			"areaId" : areaId,
			"acctItemIds":[]
		};
		common.print.prepareInvoiceInfo(param);
	};
	
	//可打印费用项查询
	var _queryComputeCharge=function(param) {
		$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
		var url=contextPath+"/print/getInvoiceItems";
		var response = $.callServiceAsJson(url,param,{});
		$.unecOverlay();
		if(!response){
			$.alert("提示","<br/>查询可打印费用项失败，请稍后重试");
			return false;
		}
		if(response.code == -2) {
			$.alertM(response.data);
			return false;
		}
		if(response.code != 0) {
			$.alert("提示","<br/>查询可打印费用项失败，请稍后重试");
			return false;
		}
		if(response.data.resultCode != '0') {
			$.alert("提示", response.data.resultMsg);
			return false;
		}
		//判断是否有可打印费用项
		if (response.data.chargeItems == undefined || response.data.chargeItems.length==0) {
			$.alert("提示", "没有可打印的费用项");
			return false;
		} else {
			var i = 0;
			for(; i < response.data.chargeItems.length; i++){
				var item = response.data.chargeItems[i];
				if (item.paymentAmount!=0) {
					break;
				}
			}
			if (i == response.data.chargeItems.length) {
				$.alert("提示", "没有可打印的费用项");
				return false;
			}
		}
		return response;
	};
	//发票代码、发票号码查询
	var _queryInvoiceInfo = function() {
		var param = {
			"staffId" : OrderInfo.staff.staffId,
			"areaId" : OrderInfo.staff.areaId,
			"custSoNbr" : OrderInfo.orderResult.olNbr,
			"custOrderId" : OrderInfo.orderResult.olId,
			"invoiceType" : "100" //目前阶段我们用到的是：100 普通发票和 200 收据。待后续有营改增需求后再 用其它类型。
		};
		var url=contextPath+"/print/getInvoiceInfo";
		var response = $.callServiceAsJson(url,param,{});
		if(!response){
//			$.alert("提示","<br/>查询发票代码发票号码失败，请稍后重试");
			return false;
		}
		if(response.code == -2) {
			$.alertM(response.data);
			return false;
		}
		if(response.code != 0) {
//			$.alert("提示","<br/>查询发票代码发票号码失败，请稍后重试");
			return false;
		}
		if (response.data.invoiceInfos != undefined && response.data.invoiceInfos instanceof Array && response.data.invoiceInfos.length > 0) {
		
		} else {
//			$.alert("提示","<br/>查询发票代码发票号码失败，返回结果中未获取到发票信息，请稍后重试");
			return false;
		}
		return response;
	};
	/**
	 * 填写打印发票信息
	 */
	var _prepareInvoiceInfo=function(param){
		
		//判断是否一般纳税人，如果是的话提示
		if (OrderInfo.cust.norTaxPayer == "Y") {
			$.alert("提示", "客户为一般纳税人，请到省份CRM系统打印专用增值税发票！");
			$.confirm("提示信息","客户为一般纳税人，专用增值税发票需要到省份CRM系统打印。是否只打印普通发票?", {
				yes : function(){
					_prepareInvoiceInfoCore(param);
				},
				no : function(){
					return;
				}
			}, "question");
		}else{
			_prepareInvoiceInfoCore(param);
		}
	};
	var _prepareInvoiceInfoCore=function(param){
		//可打印费用项查询
		var qccResp = _queryComputeCharge(param);
		if (!qccResp) {
			return;
		}
		//发票代码、发票号码查询
		var iiqResp = _queryInvoiceInfo();
		if (!iiqResp) {
//			return;
		} else {
			var iiqInfos = iiqResp.data.invoiceInfos;
			if(ec.util.isArray(iiqInfos[0].invoiceInfos)){
				$("#invoiceNbrInp").val(iiqInfos[0].invoiceInfos[0].invoiceNbr);
				$("#invoiceNumInp").val(iiqInfos[0].invoiceInfos[0].invoiceNum);
				
			}else{
				$("#invoiceNbrInp").val(iiqInfos[0].invoiceNbr);
				$("#invoiceNumInp").val(iiqInfos[0].invoiceNum);
			}
			
		}
		
		
		var invoiceInfos = qccResp.data.invoiceInfos;
		if (invoiceInfos != undefined && invoiceInfos instanceof Array && invoiceInfos.length > 0) {
			
		} else {
			//没有发票信息，需要进行初始化
			var initParam={
				"soNbr":OrderInfo.order.soNbr,
				"billType" : 0,
				"olId" : param.olId,
				"printFlag" : -1,
				"areaId" : OrderInfo.staff.areaId,
				"acctItemIds":[]
			};
			var initResult = common.print.initPrintInfo(initParam);
			if(!initResult) {
				return;
			}
			//提示到发票补打页面操作
			if (param.printFlag == 1) {
				$.alert("信息", "此购物车对应的发票未打印过，请到发票补打页面。");
				return;
			}
			//可打印费用项查询
			qccResp = _queryComputeCharge(param);
			if (!qccResp) {
				return;
			}
		}
		//判断是否是重打还是补打
		common.print.oldInvoiceFlag = '0';
		if (_checkCanReOrAdd(qccResp.data.invoiceInfos, param.printFlag)) {
			return;
		}
		
		
		//查询可打印费用项成功，接下去查询模板组
		var tempUrl = contextPath+"/print/getInvoiceTemplates";
		var tempParam = {
			'areaId' : OrderInfo.staff.areaId
		};
		var tempResp = $.callServiceAsJson(tempUrl, tempParam, {});
		if (tempResp.code == -2) {
			$.alertM(tempResp.data);
			return;
		} else if (tempResp.code != 0) {
			$.alert("提示",ec.util.defaultStr(tempResp.data, "获取打印模板出错"));
			return;
		} else {
			var tempData = tempResp.data;
			if (tempData.resultCode != 'POR-0000') {
				$.alert("提示",ec.util.defaultStr(tempData.resultMsg, "获取打印模板异常"));
				return;
			}
			if (tempData.length == 0) {
				$.alert("提示", "没有获取到可用的打印模板");
				return;
			}
			var tempHtml = "";
			var tempList = tempData.tempList;
			if (typeof tempList != undefined && tempList.length > 0) {
				tempHtml += "<option selected='selected' value="+tempList[0].templateId+">"+tempList[0].templateName+"</option>";
				for(var i = 1; i < tempList.length; i++){
					var template = tempList[i];
					tempHtml += "<option value="+template.templateId+">"+template.templateName+"</option>";
				}
			}
			$("#tempListSel").html(tempHtml);
		}
		
		
		//显示接入号
		var selHtml = "";
		var prodInfo = qccResp.data.prodInfo;
		if (prodInfo != undefined && prodInfo.length > 0) {
			selHtml+="<option selected='selected' value="+prodInfo[0].accessNumber+">"+prodInfo[0].accessNumber+"</option>";
			for(var i=1;i<prodInfo.length;i++){
				var prod = prodInfo[i];
				selHtml+="<option value="+prod.accessNumber+">"+prod.accessNumber+"</option>";
			}
		}
		$("#acceNbrSel").html(selHtml);
		
		//显示费用项
		var contHtml = "";
		contHtml+="<div id='invoiceContDiv'>";
		contHtml+="  <table class='searchtable'>";
		contHtml+="    <tr>";
		contHtml+="      <th>是否打印</th><th>费用名称</th><th>费用(元)</th><th>税金(元)</th><th>付费方式</th>";
		contHtml+="    </tr>";
		var chargeItems = qccResp.data.chargeItems;
		for(var i=0;i<chargeItems.length;i++){
			var item = chargeItems[i];
			if (i == 0) {
				$("#invoiceTitleInp").val(item.custName);
			}
			if (item.paymentAmount==0) {
				continue;
			}
			contHtml+="    <tr acctItemId="+item.acctItemId+" acctItemTypeId="+item.acctItemTypeId+" ";
			contHtml+="        acctItemTypeName='"+item.acctItemTypeName+"' boActionType='"+item.boActionType+"' ";
			contHtml+="        boActionType='"+item.boActionType+"' boId="+item.boId+" feeAmount="+item.feeAmount+" ";
			contHtml+="        invoiceId="+item.invoiceId+" objId="+item.objId+" objType="+item.objType+" ";
			contHtml+="        payMethodCd="+item.payMethodCd+" payMethodName="+item.payMethodName+" ";
			contHtml+="        realAmount="+item.realAmount + " ";
			contHtml+="        tax="+item.tax+" taxRate="+item.taxRate+" >";
			if (_checkChargeItem(item)) {
				contHtml+="      <td><input type='checkbox' name='invoiceItemsChkBox' checked='checked'/></td>";
			} else {
				contHtml+="      <td><input type='checkbox' name='invoiceItemsChkBox' disabled='disabled'/></td>";
			}
			contHtml+="      <td>"+item.acctItemTypeName+"</td>";
			contHtml+="      <td>"+(item.realAmount / 100).toFixed(2)+"</td>";
			contHtml+="      <td>"+(item.tax / 100).toFixed(2)+"</td>";
			contHtml+="      <td>"+item.payMethodName+"</td>";
			contHtml+="    </tr>";
		}
		contHtml+="  </table>";
		contHtml+="</div>";
		$("#invoiceItemsContDiv").html(contHtml);
		var htmlStr=$("#div_printInvoice").html();
		$("#div_printInvoice").html('');
		var popup = $.popup("#div_printInvoice_prepare",htmlStr,{
			width:$(window).width()-200,
			height:$(window).height(),
			contentHeight:$(window).height()-120,
			afterClose:function(){
				$("#div_printInvoice").html(htmlStr);
			}
		});
		$("#billType").off("change").on("change",function(event){
			if ($("#billType").val()=="0") {
				$("#invoiceNbrNumDl").show();
				$("#titleDt").html("发票抬头：");
				$("#tempDt").html("发票模板：");
				param.billType = 0;
			} else {
				$("#invoiceNbrNumDl").hide();
				$("#titleDt").html("票据抬头：");
				$("#tempDt").html("票据模板：");
				param.billType = 1;
			}
		});
		$("#invoiceItemsConfirm").off("tap").on("tap",function(event){
			if (common.print.oldInvoiceFlag != '0') {
				$.alert("信息", "存在未作废发票，请先确定作废发票");
				return;
			}
			_saveInvoiceInfo(param, qccResp.data);
		});
		$("#invoiceItemsConCancel").off("tap").on("tap",function(event){
			$("#div_printInvoice_prepare").popup("close");
		});
	};
	//查询可打印费用项
	var _initPrintInfo=function(param) {
		var url=contextPath+"/print/getInvoiceItems";
		var queryResult = $.callServiceAsJson(url,param);
		if(!queryResult){
			$.alert("提示","<br/>查询可打印费用项失败，请稍后重试");
			return;
		}
		if(queryResult.code == -2) {
			$.alertM(queryResult.data);
			return;
		}
		if(queryResult.code != 0) {
			$.alert("提示","<br/>查询可打印费用项失败，请稍后重试");
			return;
		}
		if(queryResult.data.resultCode != '0') {
			$.alert("提示", queryResult.data.resultMsg);
			return;
		}
		//判断是否有可打印费用项
		if (queryResult.data.chargeItems == undefined || queryResult.data.chargeItems.length==0) {
			$.alert("提示", "没有可打印的费用项");
			return;
		}
		var result = _prepareInitParam(param, queryResult.data);
		var invoiceInfos = result.invoiceInfos;
		
		var params={"invoiceInfos" : invoiceInfos};
		var smResp = _invokeSavingMethod(params, param.printFlag);
		if (smResp == false) {
			return false;
		}
		invoiceInfos = _setInvoiceId(invoiceInfos, smResp.data.invoiceIds, '0');
		return invoiceInfos;
	};
	
	var _getPrintState=function(printFlag) {
		if (printFlag == '-1') {
			return '初始打印';
		} else if (printFlag == '0') {
			return '正常打印';
		} else if (printFlag == '1') {
			return '重打';
		} else if (printFlag == '2') {
			return '补打';
		} else {
			return '未知操作';
		}
	};
	//判断是否能重打或补打  true - 限制 , false - 允许打印
	var _checkCanReOrAdd=function(invoiceInfos, printFlag) {
		if (invoiceInfos != undefined && invoiceInfos instanceof Array && invoiceInfos.length > 0) {
			for (var i=0; i < invoiceInfos.length; i++) {
				if (!invoiceInfos[i]) {
					$.alert("信息", "接口返回的发票信息不是有效值，请确认。");
					return true;
				}
				if (invoiceInfos[i].printFlag=='-1') {
					//未打印时，允许正常打印和补打
					if (printFlag == '0' || printFlag == '2') {
						
					} else {
						$.alert("信息", "此购物车对应的发票未打印过，请到发票补打页面。");
						return true;
					}
				} else if (invoiceInfos[i].printFlag == '0') {
					//如果是收据，就允许操作
					if (invoiceInfos[i].billType == '1') {
						return false;
					}
					//正常打印状态，允许重打
					if (printFlag == '1') {
						//弹出作废发票提示
						_invalidInvoice(invoiceInfos, printFlag);
					} else {
						$.alert("信息", "此购物车对应的发票正常打印过，只允许重打。");
						return true;
					}
				} else if (invoiceInfos[i].printFlag == '1' || invoiceInfos[i].printFlag == '2') {
					//重打或补打状态，允许重打
					if (printFlag == '1') {
						//弹出作废发票提示
						_invalidInvoice(invoiceInfos, printFlag);
					} else {
						$.alert("信息", "此购物车对应的发票已打印过，只允许重打。");
						return true;
					}
				} else {
					//默认不允许
					$.alert("信息", "发票信息中打印标识值不规范");
					return true;
				}
			}
			//走出循环，代表允许打印
			return false;
		} else {
			//没有发票信息，允许正常打印
			if (printFlag == '0') {
				return false;
			} else {
				$.alert("信息", "此购物车没有对应的发票信息，不能进行补打或重打");
				return true;
			}
		}
	};
	
	//判断是否已打印过发票，true-有旧发票需要作废,false-没有旧发票
	var _invalidInvoice=function(invoiceInfos, printFlag) {
		if (invoiceInfos != undefined && invoiceInfos instanceof Array && invoiceInfos.length > 0) {
			//筛选invoiceId，展示需要作废的发票代码和发票号码
			var infoHtml ='<ul data-role="listview" style="min-width:380px;min-height: 140px">';
			infoHtml += '<li>存在未作废发票，请先作废发票：</li>';
			var invoiceIds = [];
			for (var i=0; i < invoiceInfos.length; i++) {
				var info = invoiceInfos[i];
				if ($.inArray(info.invoiceId, invoiceIds) >= 0) {
					
				} else {
					infoHtml += '<li>发票代码：' + info.invoiceNbr + ';发票号码：'+info.invoiceNum+'</li>';
					invoiceIds.push(info.invoiceId);
				}
			}
			infoHtml+='</ul>';
			if (invoiceIds.length > 0) {
				//需要作废发票
				common.print.oldInvoiceFlag = '1';
				$("#invalidInvoiceInfoDiv").html(infoHtml);
				$.jqmRefresh($("#invalidInvoiceInfoDiv"));
				$("#dlg-invalid-invoice").popup("open");
				$("#invalidInvoiceConfirm").off("tap").on("tap", function() {
					common.print.oldInvoiceFlag = '0';
					$("#dlg-invalid-invoice").popup("close");
				});
			}
			return false;
		} else {
			return false;
		}
	};
	//校验费用项能否被打印，true-可以打印；false-不可打印
	var _checkChargeItem=function(item){
		var payMethodCd = item.payMethodCd;
		if (payMethodCd == CONST.PAYMETHOD_CD.ZHANG_WU_DAI_SHOU) {
			return false;
		}
		return true;
	};
	
	//校验发票抬头，发票代码，发票号码等
	var _chkInput=function(param){
		try {
			//发票的需要校验代码和号码
			if (param.billType != 1) {
				if ($("#invoiceNbrInp").val() == "") {
					$.alert("提示","请输入发票代码");
					return true;
				}
				//原17位发票代码，现12位
				if (!/^\d{0,12}$/.test($("#invoiceNbrInp").val())) {
					$.alert("提示","请输入正确的发票代码");
					return true;
				}
				if ($("#invoiceNumInp").val() == "") {
					$.alert("提示","请输入发票号码");
					return true;
				}
				//8位发票号码
				if (!/^\d{0,12}$/.test($("#invoiceNumInp").val())) {
					$.alert("提示","请输入正确的发票号码");
					return true;
				}
			}
			if ($("#invoiceTitleInp").val() == "") {
				$.alert("提示","请输入发票抬头");
				return true;
			}
			
			if($("#invoiceContDiv tbody input:checked").length < 1) {
				$.alert("提示","请选择要打印的费用项");
				return true;
			}
		} catch (e) {
			return true;
		}
		return false;
	};
	var _prepareInitParam=function(param, queryResult) {
		var invoiceInfos =[];
		var invoiceInfo = {
			"acctItemIds": [],
			"instanceType": 2,//根据过滤取值，优先为产品或销售品，2-产品，7-销售品
			"instanceId": 0,//根据过滤取值，优先为产品或销售品
			"invoiceType": "100", //目前阶段我们用到的是：100 普通发票和 200 收据。待后续有营改增需求后再 用其它类型。
			"staffId": OrderInfo.staff.staffId,
			"amount": 0,
			"realPay": 0,
			"tax": 0,//可为空，暂为0
			"invoiceNbr": 0,//发票代码，前台人工输入，票据时可为空
			"invoiceNum": "0",//发票号码，前台人工输入，票据时可为空
			"custOrderId": OrderInfo.orderResult.olId,
			"custSoNumber": OrderInfo.orderResult.olNbr,
			"custId": OrderInfo.cust.custId,
			"commonRegionId": OrderInfo.staff.areaId,
			"channelId": OrderInfo.staff.channelId,
			"bssOrgId": OrderInfo.staff.orgId,
			"acctNbr": 0,//接入号码，根据5.12接口返回展示，前台选择
			"paymethod": 100000,
			"busiName": "具体业务说明",//可为空
			"rmbUpper": "人民币大写",//固定此值
			"accountUpper": "零圆整",
			"account": 0,
			"billType": param.billType,//票据类型：0发票，1收据
			"printFlag": param.printFlag,//打印标记：0正常打印，1重打票据，2补打票据，-1未打印
			"invoiceId": 0
		};
		
		var instanceFlag = false;
		var sumFeeAmount = 0;
		var sumRealAmount = 0;
		var sumTax = 0;
		var items = [];
		var payMethodName = "";
		var chargeItems = queryResult.chargeItems;
		for(var i=0;i<chargeItems.length;i++){
			var item = chargeItems[i];
			invoiceInfo.acctItemIds.push({"acctItemId": item.acctItemId});
			if (item.objType == "2") {
				invoiceInfo.instanceType = item.objType;
				invoiceInfo.instanceId = item.objId;
				invoiceInfo.paymethod = item.payMethodCd;
				instanceFlag = true;
			} else if (!instanceFlag && item.objType == "7") {
				invoiceInfo.instanceType =item.objType;
				invoiceInfo.instanceId = item.objId;
				invoiceInfo.paymethod = item.payMethodCd;
			}
			//计算金额
			sumFeeAmount += parseInt(item.feeAmount);
			sumRealAmount += parseInt(item.realAmount);
			sumTax += parseInt(item.tax);
			payMethodName = item.payMethodName;
		}
		
		//设置金额
		invoiceInfo.amount = sumFeeAmount;
		invoiceInfo.realPay = sumRealAmount;
		invoiceInfo.tax = sumTax;
		invoiceInfo.account = sumRealAmount;
		invoiceInfo.accountUpper = ec.util.atoc(sumRealAmount);
		//取实例ID和类型
		invoiceInfo.invoiceNbr = 0;
		invoiceInfo.invoiceNum = "0";
		//取接入号
		var prodInfo = queryResult.prodInfo;
		if (prodInfo != undefined && prodInfo.length > 0) {
			invoiceInfo.acctNbr = prodInfo[0].accessNumber;
		}
		
		invoiceInfos.push(invoiceInfo);
		var result = {
			"payMethodName" : payMethodName,
			"items" : items,
			"invoiceInfos" : invoiceInfos
		};
		return result;
	};
	var _addParam=function(param, queryResult) {
		var invoiceInfos = [];
		var invoiceInfo = {
			"acctItemIds": [],
			"instanceType": 2,//根据过滤取值，优先为产品或销售品，2-产品，7-销售品
			"instanceId": 0,//根据过滤取值，优先为产品或销售品
			"invoiceType": "100", //目前阶段我们用到的是：100 普通发票和 200 收据。待后续有营改增需求后再 用其它类型。
			"staffId": OrderInfo.staff.staffId,
			"amount": 0,
			"realPay": 0,
			"tax": 0,//可为空，暂为0
			"invoiceNbr": 0,//发票代码，前台人工输入，票据时可为空
			"invoiceNum": "0",//发票号码，前台人工输入，票据时可为空
			"custOrderId": OrderInfo.orderResult.olId,
			"custSoNumber": OrderInfo.orderResult.olNbr,
			"custId": OrderInfo.cust.custId,
			"commonRegionId": OrderInfo.staff.areaId,
			"channelId": OrderInfo.staff.channelId,
			"bssOrgId": OrderInfo.staff.orgId,
			"acctNbr": 0,//接入号码，根据5.12接口返回展示，前台选择
			"paymethod": 100000,
			"busiName": "具体业务说明",//可为空
			"rmbUpper": "人民币大写",//固定此值
			"accountUpper": "零圆整",
			"account": 0,
			"billType": param.billType,//票据类型：0发票，1收据
			"printFlag": param.printFlag,//打印标记：0正常打印，1重打票据，2补打票据，-1未打印
			"invoiceId": 0
		};
		//设置invoiceId
		invoiceInfo.invoiceId = queryResult.invoiceInfos[0].invoiceId;
		//设置票据类型
		invoiceInfo.billType = $("#billType").val();
		//设置发票类型
		if (invoiceInfo.billType == '0') {
			invoiceInfo.invoiceType = '100';
		} else {
			invoiceInfo.invoiceType = '200';
		}
		
		
		var instanceFlag = false;
		var sumFeeAmount = 0;
		var sumRealAmount = 0;
		var sumTax = 0;
		var items = [];
		var payMethodName = "";
		//获取费用项和接入号的关系
		var rela = _getAcceNbrBoIdRela(queryResult);
		invoiceInfo.acctItemIds = [];
		$("#invoiceContDiv tbody input:checked").parent().parent().parent().each(function(){
			//设置账单项ID
			invoiceInfo.acctItemIds.push({"acctItemId": $(this).attr("acctItemId")});
			//设置实例id和类型，优先为产品或销售品，2-产品，7-销售品
			if ($(this).attr("objType") == "2") {
				invoiceInfo.instanceType = $(this).attr("objType");
				invoiceInfo.instanceId = $(this).attr("objId");
				invoiceInfo.paymethod = $(this).attr("payMethodCd");
				instanceFlag = true;
			} else if (!instanceFlag && $(this).attr("objType") == "7") {
				invoiceInfo.instanceType = $(this).attr("objType");
				invoiceInfo.instanceId = $(this).attr("objId");
				invoiceInfo.paymethod = $(this).attr("payMethodCd");
			}
			//计算金额
			sumFeeAmount += parseInt($(this).attr("feeAmount"));
			sumRealAmount += parseInt($(this).attr("realAmount"));
			sumTax += parseInt($(this).attr("tax"));
			var accessNumber = '';
			var boId = $(this).attr("boId");
			for (var i=0; i < rela.length; i++) {
				if (boId == rela[i].boId) {
					accessNumber = rela[i].accessNumber;
				}
			}
			
			items.push({
				"itemName" : $(this).attr("acctItemTypeName"),
				"charge" : parseInt($(this).attr("realAmount")),
				"tax" : parseInt($(this).attr("tax")),
				"acceNumber" : accessNumber
			});
			payMethodName = $(this).attr("payMethodName");
		});
		if(OrderInfo.actionFlag==11){
			invoiceInfo.printFlag = 0;
		}
		
		//设置金额
		invoiceInfo.amount = sumFeeAmount;
		invoiceInfo.realPay = sumRealAmount;
		invoiceInfo.tax = sumTax;
		invoiceInfo.account = sumRealAmount;
		invoiceInfo.accountUpper = ec.util.atoc(sumRealAmount);
		//取实例ID和类型
		invoiceInfo.invoiceNbr = $("#invoiceNbrInp").val();
		invoiceInfo.invoiceNum = "" + $("#invoiceNumInp").val();
		//取接入号
		invoiceInfo.acctNbr = $("#acceNbrSel option:selected").val();
		
		invoiceInfos.push(invoiceInfo);
		var result = {
			"payMethodName" : payMethodName,
			"items" : items,
			"invoiceInfos" : invoiceInfos
		};
		return result;
	};
	var _getAcceNbrBoIdRela=function(queryResult) {
		var rela = [];
		var chargeItems = queryResult.chargeItems;
		var prodInfo = queryResult.prodInfo;
		for (var i=0; i < chargeItems.length; i++) {
			var boId = chargeItems[i].boId;
			for(var j=0; j < prodInfo.length; j++) {
				var accessNumber = prodInfo[j].accessNumber;
				var busiOrders = prodInfo[j].busiOrders;
				for (var k=0; k < busiOrders.length; k++) {
					if (busiOrders[k].boId == boId) {
						var tmp = {
							"boId" : boId,
							"accessNumber" : accessNumber
						};
						rela.push(tmp);
					}
				}
			}
		}
		return rela;
	};
	
	var _saveInvoiceInfo=function(param, queryResult){
		
		if (_chkInput(param)) {
			return;
		}
		if (!queryResult.invoiceInfos[0]) {
			$.alert("提示","集团营业受理后台接口返回缺少发票信息，请确认。");
			return;
		}
		var result = _addParam(param, queryResult);
		var invoiceInfos = result.invoiceInfos;
		
		var params={"invoiceInfos" : invoiceInfos};
		var smResp = _invokeSavingMethod(params, param.printFlag);
		if (smResp == false) {
			return;
		}
		
		//调用受理后台结束，开始调用生成PDF
		var invoiceParam = {
			"partyName" : $("#invoiceTitleInp").val(),
			"templateId" : $("#tempListSel :selected").val(),
			"prodInfo" : queryResult.prodInfo,
			"items" : result.items,
			"payMethod" : result.payMethodName,
			"invoiceInfos" : invoiceInfos
		};
		_printInvoice(invoiceParam);
		//最终关闭窗口
		if (OrderInfo.cust.norTaxPayer != "Y") {
			$("#div_printInvoice_prepare").popup("close");
		}
		return;
	};
	//调用集团发票打印处理接口
	var _invokeSavingMethod=function(params, printFlag){
		$.ecOverlay("<strong>正在提交中,请稍等会儿....</strong>");
		var response = $.callServiceAsJson(contextPath+"/print/saveInvoiceInfo",params);
		$.unecOverlay();
		if(response.code == -2) {
			$.alertM(response.data);
			return false;
		} else if(response.code != 0 || response.data.resultCode != "0") {
			$.alert("提示", _getPrintState(printFlag) + "调用集团发票打印处理接口失败，请稍后重试");
			return false;
		}
		return response;
	};
	var _setInvoiceId=function(invoiceInfos, invoiceIds, printFlag) {
		for(var i=0;i<invoiceInfos.length;i++){
			invoiceInfos[i].invoiceId = invoiceIds[i];
			invoiceInfos[i].printFlag = printFlag;
		}
		return invoiceInfos;
	};
	//打印显示发票pdf
	var _printInvoice=function(invoiceParam){
		var arr=new Array(3);
		if(ec.util.browser.versions.android){
			arr[0]='print/invoice';
		}else{
			arr[0]='print/iosInvoice';
		}
		arr[1]='invoiceParam';
		arr[2]=encodeURI(JSON.stringify(invoiceParam));
		MyPlugin.printShow(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	return {
		showDataSign 			:			_showDataSign,
		signVoucher				:			_signVoucher,
		preVoucher:_preVoucher,
		preSign					:			_preSign,
		printVoucher:_printVoucher,
		preInvoice:_preInvoice,
		initPrintInfo:_initPrintInfo,
		prepareInvoiceInfo:_prepareInvoiceInfo,
		saveInvoiceInfo:_saveInvoiceInfo,
		chkInput : _chkInput,
		printInvoice : _printInvoice
	};
})(jQuery);

//初始化
$(function(){
	
});
/**
 * 发展人管理
 * 
 * @author wukf
 * date 2014-01-20
 */
CommonUtils.regNamespace("order","dealer");

/** 发展人对象*/
order.dealer = (function() {
	//初始化发展人
	var _initDealer = function() {
		if(order.ysl!=undefined){
			OrderInfo.order.dealerTypeList = [{"PARTYPRODUCTRELAROLECD":"40020005","NAME":"第一发展人"},{"PARTYPRODUCTRELAROLECD":"40020006","NAME":"第二发展人"},{"PARTYPRODUCTRELAROLECD":"40020007","NAME":"第三发展人"}];
		}else{
			$.ecOverlay("<strong>正在查询发展人类型中,请稍后....</strong>");
			var response = $.callServiceAsJson(contextPath+"/app/order/queryPartyProfileSpecList",null); //发展人类型查询
			$.unecOverlay();
			if(response.code==0){
				OrderInfo.order.dealerTypeList = response.data;
			}else if(response.code==-2){
				$.alertM(response.data);
				return;
			}else{
				$.alert("信息提示",response.msg);
				return;
			}
		}
		$("#dealerTbody").empty();  
		if(OrderInfo.actionFlag!=3&&OrderInfo.actionFlag!=2){
			$("#head").text(OrderInfo.offerSpec.offerSpecName);  
		}
		
		var isReloadFlag=OrderInfo.provinceInfo.reloadFlag;
		
		//新装业务，套餐变更需要主套餐发展人
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==2 || OrderInfo.actionFlag==14){ 
			var objInstId = OrderInfo.offerSpec.offerSpecId;
			
			if(isReloadFlag=="N"){
				//获取offerTypeCd为1的，也就是主套餐的发展人
				if(OrderInfo.reloadProdInfo.dealerlist.length>0){
					$.each(OrderInfo.reloadProdInfo.dealerlist,function(dei,item){
						if(this.offerTypeCd=="1"){
							var $li = $("<li id='tr_"+objInstId+"' name='tr_"+objInstId+"' href='#' class='list-group-item'></li>");
							
							var nowSeq=OrderInfo.SEQ.dealerSeq;
							var objId = objInstId+"_"+nowSeq;
							
							//号码或者主套餐
							//function(parentObj,obj,id,type){
							$li.append("<p><h5 class='list-group-item-heading text-warning' style='float:left;'>主套餐 </h5>[<a href=\"javascript:order.dealer.addProdDealer('tr_"+objInstId+"','"+objInstId+"','"+objId+"','');\">添加</a>]</p>");
							
							//套餐名称
							$li.append("<p class='list-group-item-text'>"+OrderInfo.offerSpec.offerSpecName+"</p><p> </p>");
							
							var $p = $('<p> </p>');
							
							//主div
							var $div = $('<div class="row"> </div>');
							var $div2 = $('<div class="col-xs-6" style=\"width:33%\"> </div>');//发展人数序div
							
							//将发展人需要的objId放入OrderInfo中
							OrderInfo.codeInfos.developmentObjId=objId;
							
							//第一个选择框（选择是第几个发展人）【1】
							var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'"  class="selectpicker show-tick form-control" data-mini="true" data-native-menu="false" data-icon="select" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
							
							//第二个输入框[2]
							var $td;
							
							//第三个选择框，渠道数据信息[3]
							var $tdChannel = $("<div class='col-xs-6' style=\"width:33%\"></div>");
							var $channelSelect = $('<select id="dealerChannel_'+objId+'" name="dealerChannel_'+objInstId+'" class="selectpicker show-tick form-control styled-select" onclick=a=this.value;></select>');
							
							//主套餐二次加载的发展人顺序和发展人渠道
							
							//第一个选择框
							if(this.role!=undefined){
								var delType=this.role;
								$.each(OrderInfo.order.dealerTypeList,function(){
									if(this.PARTYPRODUCTRELAROLECD==delType){
										$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' selected=\"selected\">"+this.NAME+"</option>");
									}else{
										$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
									}
								});
								
								//$("#dealerType_"+objInstId).find("option[value='"+this.role+"']").attr("selected","selected");
								//$("#dealerChannel_"+objInstId+"_"+nowSeq).find("option[value='"+this.channelNbr+"']").attr("selected","selected");
							}
							
							//第二个输入框【2】
							var staffId=this.staffid;
							if(staffId!=null && staffId!="" && staffId!=undefined){
								$td = $('<div class="col-xs-6" style="width:33%"><input type="text" onclick="javascript:order.dealer.showDealer(0,\'dealer\',\''+objId+'\');" onChange="javascript:this.staffId=OrderInfo.staff.staffId;this.value=OrderInfo.staff.staffName" class="form-control" id="dealer_'+objId+'" staffId="'+staffId+'" value="'+this.staffname+'" ></input></div>');
							}
						
							//第三个渠道选择[3]
							var nowChannelNbr=this.channelNbr;
							$.each(OrderInfo.channelList,function(){
								if(this.channelNbr==nowChannelNbr){
									$channelSelect.append("<option value='"+this.channelNbr+"' selected ='selected'>"+this.channelName+"</option>");
								}else{
									$channelSelect.append("<option value='"+this.channelNbr+"'>"+this.channelName+"</option>");
								}
							});
						}
						
						//[1]
						$div2.append($select);
						$div.append($div2);
						
						//[2]
						$div.append($td);
						
						//[3]
						$tdChannel.append($channelSelect);
						
						$div.append($tdChannel);
						
						//将div放置到li中
						$li.append($div);
						
						//末尾添加一个p标签
						$li.append($p);
						
						OrderInfo.SEQ.dealerSeq++;
						
						$("#dealerTbody").append($li);
					});
				}
				
				//订单备注初始化
				$("#order_remark").val(OrderInfo.reloadProdInfo.orderMark);
			}else{
				var $li = $("<li id='tr_"+objInstId+"' name='tr_"+objInstId+"' href='#' class='list-group-item'></li>");
				
				var nowSeq=OrderInfo.SEQ.dealerSeq;
				var objId = objInstId+"_"+nowSeq;
				
				//号码或者主套餐
				$li.append("<p><h5 class='list-group-item-heading text-warning' style='float:left;'>主套餐 </h5>[<a href=\"javascript:order.dealer.addProdDealer('tr_"+objInstId+"','"+objInstId+"','"+objId+"','');\">添加</a>]</p>");
				
				//套餐名称
				$li.append("<p class='list-group-item-text' style='text-align:left;'>"+OrderInfo.offerSpec.offerSpecName+"</p><p> </p>");
				
				var $p = $('<p> </p>');
				
				//主div
				var $div = $('<div class="row"> </div>');
				var $div2 = $('<div class="col-xs-6" style=\"width:33%\"> </div>');//发展人数序div
				
				//将发展人需要的objId放入OrderInfo中
				OrderInfo.codeInfos.developmentObjId=objId;
				
				//第一个选择框（选择是第几个发展人）【1】
				var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'"  class="selectpicker show-tick form-control" data-mini="true" data-native-menu="false" data-icon="select" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
				
				//第二个输入框[2]
				var $td;
				
				//第三个选择框，渠道数据信息[3]
				var $tdChannel = $("<div class='col-xs-6' style=\"width:33%\"></div>");
				var $channelSelect = $('<select id="dealerChannel_'+objId+'" name="dealerChannel_'+objInstId+'" class="selectpicker show-tick form-control styled-select" onclick=a=this.value;></select>');
				
				//主套餐二次加载的发展人顺序和发展人渠道
				
				//[1]-发展顺序
				$.each(OrderInfo.order.dealerTypeList,function(i,item){
					$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
				});
				
				//[2]-发展人
				$td = $('<div class="col-xs-6" style="width:33%"><input type="text" onclick="javascript:order.dealer.showDealer(0,\'dealer\',\''+objId+'\');" onChange="javascript:this.staffId=OrderInfo.staff.staffId;this.value=OrderInfo.staff.staffName" class="form-control" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" ></input></div>');
			
				//[3]-渠道数据
				$.each(OrderInfo.channelList,function(){
					if(this.isSelect==1){
						$channelSelect.append("<option value='"+this.channelNbr+"' selected ='selected'>"+this.channelName+"</option>");
					}else{
						$channelSelect.append("<option value='"+this.channelNbr+"'>"+this.channelName+"</option>");
					}
				});
				
				//[1]
				$div2.append($select);
				$div.append($div2);
				
				//[2]
				$div.append($td);
				
				//[3]
				$tdChannel.append($channelSelect);
				
				$div.append($tdChannel);
				
				//将div放置到li中
				$li.append($div);
				
				//末尾添加一个p标签
				$li.append($p);
				
				OrderInfo.SEQ.dealerSeq++;
				
				$("#dealerTbody").append($li);
			}
			
			$.refresh($("#dealerTbody"));
		}
		
		if(OrderInfo.actionFlag==6){ //加装需要接入产发展人
			if(order.memberChange.newMemberFlag){
				$.each(OrderInfo.offerSpec.offerRoles,function(){
		    		$.each(this.prodInsts,function(){
						//----------------------------
						var objInstId = this.prodInstId;
						
						var $li = $("<li id='tr_"+objInstId+"' name='tr_"+objInstId+"' href='#' class='list-group-item'></li>");
						
						var accNbr = "未选号";
						if(this.accNbr!=undefined && this.accNbr!=""){
							accNbr = prodInst.accNbr;
						}
						
						//号码或者主套餐
						$li.append("<h5 class='list-group-item-heading text-warning'>"+accNbr+"</h5>");
						
						//套餐名称
						$li.append("<p class='list-group-item-text'>"+this.objName+"</p><p> </p>");
						
						var $p = $('<p> </p>');
						
						//主div
						var $div = $('<div class="row"> </div>');
						var $div2 = $('<div class="col-xs-6" style=\"width:33%\"> </div>');//发展人数序div
						
						var nowSeq=OrderInfo.SEQ.dealerSeq;
						var objId = objInstId+"_"+nowSeq;
						
						//将发展人需要的objId放入OrderInfo中
						OrderInfo.codeInfos.developmentObjId=objId;
						
						//第一个选择框（选择是第几个发展人）【1】
						var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'"  class="selectpicker show-tick form-control" data-mini="true" data-native-menu="false" data-icon="select" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
						
						//第二个输入框[2]
						var $td;
						
						//第三个选择框，渠道数据信息[3]
						var $tdChannel = $("<div class='col-xs-6' style=\"width:33%\"></div>");
						var $channelSelect = $('<select id="dealerChannel_'+objId+'" name="dealerChannel_'+objInstId+'" class="selectpicker show-tick form-control styled-select" onclick=a=this.value;></select>');
						
						//主套餐二次加载的发展人顺序和发展人渠道
						
						if(isReloadFlag=="N"){
							//获取offerTypeCd为1的，也就是主套餐的发展人
							if(OrderInfo.reloadProdInfo.dealerlist.length>0){
								$.each(OrderInfo.reloadProdInfo.dealerlist,function(dei,item){
									if(this.prodId==objInstId && this.actionClassCd=="1300" && this.boActionTypeCd=="1"){
										//第一个选择框
										if(this.role!=undefined){
											var delType=this.role;
											$.each(OrderInfo.order.dealerTypeList,function(){
												if(this.PARTYPRODUCTRELAROLECD==delType){
													$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' selected=\"selected\">"+this.NAME+"</option>");
												}else{
													$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
												}
											});
										}
										
										//第二个输入框【2】
										var staffId=this.staffid;
										if(staffId!=null && staffId!="" && staffId!=undefined){
											$td = $('<div class="col-xs-6" style="width:33%"><input type="text" onclick="javascript:order.dealer.showDealer(0,\'dealer\',\''+objId+'\');" onChange="javascript:this.staffId=OrderInfo.staff.staffId;this.value=OrderInfo.staff.staffName" class="form-control" id="dealer_'+objId+'" staffId="'+staffId+'" value="'+this.staffname+'" ></input></div>');
										}
									
										//第三个渠道选择[3]
										var nowChannelNbr=this.channelNbr;
										$.each(OrderInfo.channelList,function(){
											if(this.channelNbr==nowChannelNbr){
												$channelSelect.append("<option value='"+this.channelNbr+"' selected ='selected'>"+this.channelName+"</option>");
											}else{
												$channelSelect.append("<option value='"+this.channelNbr+"'>"+this.channelName+"</option>");
											}
										});
									}
								});
							}
							
							//订单备注初始化
							$("#order_remark").val(OrderInfo.reloadProdInfo.orderMark);
						}else{
							//[1]-发展顺序
							$.each(OrderInfo.order.dealerTypeList,function(i,item){
								$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
							});
							
							//[2]-发展人
							$td = $('<div class="col-xs-6" style="width:33%"><input type="text" onclick="javascript:order.dealer.showDealer(0,\'dealer\',\''+objId+'\');" onChange="javascript:this.staffId=OrderInfo.staff.staffId;this.value=OrderInfo.staff.staffName" class="form-control" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" ></input></div>');
						
							//[3]-渠道数据
							$.each(OrderInfo.channelList,function(){
								if(this.isSelect==1){
									$channelSelect.append("<option value='"+this.channelNbr+"' selected ='selected'>"+this.channelName+"</option>");
								}else{
									$channelSelect.append("<option value='"+this.channelNbr+"'>"+this.channelName+"</option>");
								}
							});
						}
						
						//[1]
						$div2.append($select);
						$div.append($div2);
						
						//[2]
						$div.append($td);
						
						//[3]
						$tdChannel.append($channelSelect);
						
						$div.append($tdChannel);
						
						//将div放置到li中
						$li.append($div);
						
						//末尾添加一个p标签
						$li.append($p);
						
						OrderInfo.SEQ.dealerSeq++;
						
						$("#dealerTbody").append($li);
						
						$.refresh($("#dealerTbody"));
		    		});
		    	});
			}
		}
		
		if(OrderInfo.actionFlag==13){ //裸机销售需要发展人
			var objInstId = $("#mktResId").val();
			var $li = $("<li id='tr_"+objInstId+"' name='tr_"+objInstId+"'></li>");
			var $dl= $("<dl></dl>");
			var $tdType = $('<dd></dd>');
			var $field=$('<fieldset data-role="fieldcontain"></fieldset>');
			var objId = objInstId+"_"+OrderInfo.SEQ.dealerSeq;
			var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'"  data-mini="true" data-native-menu="false" data-icon="select" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
			$.each(OrderInfo.order.dealerTypeList,function(){
				$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
			});
			$field.append($select);
			$tdType.append($field);
			$dl.append($tdType);
			var $dd = $('<dd><input type="text" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" data-mini="true" readonly="readonly" ></input></dd>');
			$dl.append($dd);
			var $button='<dd class="ui-grid"><div class="ui-grid-a"><div class="ui-block-a">';
			$button+='<button data-mini="ture" onclick="javascript:order.main.queryStaff(\'dealer\',\''+objId+'\');">选择</button></div>';
			$button+=' <div class="ui-block-b"> <button data-mini="ture" onclick="order.dealer.addProdDealer(this,'+objInstId+',1)">添加</button></div></div></dd>';
			$dl.append($button);
			$li.append($dl);
			OrderInfo.SEQ.dealerSeq++;
			$("#dealerMktTbody").append($li);
			$.jqmRefresh($("#dealerMktTbody"));
		}
		
		//发展人二次加载[W]
		if(isReloadFlag!=null && isReloadFlag!="" && isReloadFlag=="N"){
			if(OrderInfo.reloadProdInfo.dealerlist.length>0){
				$.each(OrderInfo.reloadProdInfo.dealerlist,function(rei,item){
					if(this.offerTypeCd=="2"){
						var id=this.objInstId;
						var prodId=this.prodId;
						
						if(this.role!=undefined){
							var objId = id+"_"+OrderInfo.SEQ.dealerSeq;
							
							var $tr = $("#atr_"+id);
							var $li = $("<li name=\"tr_"+prodId+"_"+id+"\" id=\"tr_"+prodId+"_"+id+"\" class='list-group-item'></li>");
							
							//新添加发展人[W]
							$li.append("<h5 class='list-group-item-heading text-warning'>"+this.accessNumber+"[<a href=\"javascript:order.dealer.removeDealerNew('"+prodId+"_"+id+"');\">删除</a>]</h5>");
							$li.append("<p class='list-group-item-text'>"+this.objName+"</p>");
							$li.append("<p ></p>");
							
							//发张人选项和名称开始
							var $div = $('<div class="row"> </div>');
							var $div2 = $('<div class="col-xs-6" style=\"width:33%\"> </div>');
							
							//将发展人需要的objId放入OrderInfo中
							OrderInfo.codeInfos.developmentObjId=objId;
							
							var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+prodId+'_'+id+'"  class="selectpicker show-tick form-control" data-mini="true" data-native-menu="false" data-icon="select" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+id+'\',a)"></select>');
							
							var delType=this.role;
							
							$.each(OrderInfo.order.dealerTypeList,function(){
								if(this.PARTYPRODUCTRELAROLECD==delType){
									$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' selected=\"selected\">"+this.NAME+"</option>");
								}else{
									$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
								}
							});
							
							$div2.append($select);
							$div.append($div2);
							
							var $td = $('<div class="col-xs-6" style=\"width:33%\"><input type="text" onclick="javascript:order.dealer.showDealer(0,\'dealer\',\''+objId+'\');" onChange="javascript:this.staffId=OrderInfo.staff.staffId;this.value=OrderInfo.staff.staffName" class="form-control" id="dealer_'+objId+'" staffId="'+this.staffid+'" value="'+this.staffname+'" ></input></div>');
							$div.append($td);
							
							//渠道数据信息
							var channelNbr=this.channelNbr;
							
							var $tdChannel = $("<div class='col-xs-6' style=\"width:33%\"></div>");
							var $channelSelect = $('<select id="dealerChannel_'+objId+'" name="dealerChannel_'+prodId+'_'+id+'" class="selectpicker show-tick form-control styled-select" onclick=a=this.value;></select>');
							$.each(OrderInfo.channelList,function(){
								if(this.channelNbr==channelNbr){
									$channelSelect.append("<option value='"+this.channelNbr+"' selected ='selected'>"+this.channelName+"</option>");
								}else{
									$channelSelect.append("<option value='"+this.channelNbr+"'>"+this.channelName+"</option>");
								}
							});
							
							$tdChannel.append($channelSelect);
							
							$div.append($tdChannel);
							
							$li.append($div);
							$li.append("<p ></p>");
							
							$("#dealerTbody").append($li);
							
							OrderInfo.SEQ.dealerSeq++;
						}
					}
				});
			}
		}
	};
	
	function _showDealer(qryPage,v_id,objInstId){
		$("#sel").empty();
		$("#diqu").empty();
		var areaId = OrderInfo.staff.areaId.substring(0,3)+'0000';
		var areaName = OrderInfo.staff.areaAllName.substring(0,OrderInfo.staff.areaAllName.indexOf('>'));
		var $sel = $('<select  class="selectpicker show-tick form-control" onChange="order.dealer.queryChildNode('+areaId+')">'); 
		var $opt = $('<option value="">'+areaName+'</option>');
		$sel.append($opt);
	    $("#sel").append($sel);
	    $sel.addClass("styled-select");
	    _queryChildNode(areaId);
	    
	//	$("#sheng").html("<option selected='selected' value=0>"+OrderInfo.staff.areaAllName.substring(0,OrderInfo.staff.areaAllName.indexOf('>'))+"</option>");
		$("#queryStaff").off("click").on("click",function(){
			_queryStaff(qryPage,v_id,objInstId);
		});
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
									if(list[i].commonRegionId==OrderInfo.staff.areaId.substring(0,5)+'00'){
										selectHtml=selectHtml+"<option  selected='selected' value='" +list[i].commonRegionId + "' zone_number='" +list[i].zoneNumber +"' name='" +list[i].regionName + "'>" + list[i].regionName + "</option>";
									}else{
										selectHtml=selectHtml+"<option value='" +list[i].commonRegionId + "' zone_number='" +list[i].zoneNumber +"' name='" +list[i].regionName + "'>" + list[i].regionName + "</option>";
									}
								}
								$("#diqu").html(selectHtml);
								$("#diqu").addClass("styled-select");
								$("#developModal").modal("show");
							}
						}
					}
				});
	}
	//协销人-修改
	function _setStaff(objInstId){
		var $staff = $("#staff_list_body .plan_select");
		$staff.each(function(){
			$("#dealer_"+objInstId).val($(this).attr("staffName")).attr("staffId", $(this).attr("staffId"));
		});
		if($staff.length > 0){
			easyDialog.close();
		}else{
			$.alert("操作提示","请选择 协销人！");
		}
	}
	
	//协销人-查询
	function _queryStaff(qryPage,v_id,objInstId){
		if($("#staffName").val()=="" && $("#staffCode").val() == ""){
			$.alert("操作提示","请输入工号或者姓名！");
			return;
		}
		
		var staffCode=$("#staffCode").val();
		
		var param = {
				"dealerId":v_id,
				"areaId":$("#diqu").val(),
				//"currentAreaAllName":$("#p_staff_areaId_val").val(),
				"name":$("#staffName").val(),
				"code":staffCode,
				//"salesCode":$("#qrySalesCode").val(),
				"pageIndex":1,
				"objInstId":objInstId,
				"pageSize":1
		};
		
		$.callServiceAsJson(contextPath + "/app/staffMgr/getStaffList2",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"done" : function(response){
				$.unecOverlay();
				if(!response){
					response.data='';
				}
				if(response.code==0){
					if(response.data.length == 0){
						if(staffCode!=null && staffCode!=""){
							$.alert("操作提示","未查询到工号为["+staffCode+"]的员工信息");
						}else{
							$.alert("操作提示","没有查询到该员工信息！");
						}
					}else{
						$("#dealer_"+objInstId).attr("value",response.data[0].staffName).attr("staffId", response.data[0].staffId);
						$("#developModal").modal("hide");
					}
				//	$("#developModal").hide();
				}else if(response.code==-2){
					$.alertM(response.data);
					return;
				}else{
					$.alert("信息提示",response.msg);
					return;
				}
				
//				$("#div_staff_dialog").html(response.data);
//				
//				$("#staff_list_body tr").each(function(){$(this).off("click").on("click",function(event){
//					_linkSelectPlan("#staff_list_body tr",this);
//					event.stopPropagation();
//					});});
//				easyDialog.open({
//					container : "div_staff_dialog"
//				});
				
			}
		});	

	}
	//修改发展人角色
	var _changeDealer = function(select,objInstId,value){
		var i = 0;
		$("select[name="+objInstId+"]").each(function(){
			if($(this).val() == $(select).val()){
				i++;
			}
		});
		if(i>1){
			$.alert("信息提示","每个业务的发展人类型不能重复");
			$(select).val(value);
		}
	};
	
	//点击确认，添加附属销售品发展人
	var _addAttachDealer = function(){
		$("input[name=attach_dealer]:checked").each(function(){	
			var id = $(this).attr("id");	
			var prodId = id.split("_")[0];
			if($("#tr_"+id)[0]==undefined){ //没有添加过
				var objId = id+"_"+OrderInfo.SEQ.dealerSeq;
				var $tdType = _getDealerType(id,objId);
				if($tdType==undefined){
					return false;
				}
				var $tr = $("#atr_"+id);
				var $li = $("<li name='tr_"+id+"' id='tr_"+id+"' class='list-group-item'></li>");
				
				//新添加发展人[W]
				$li.append("<h5 class='list-group-item-heading text-warning'>"+$tr.children().eq(1).text()+"[<a href=\"javascript:order.dealer.removeDealerNew('"+id+"');\">删除</a>]</h5>");
				$li.append("<p class='list-group-item-text'>"+$tr.children().eq(2).text()+"</p>");
				$li.append("<p ></p>");
				
				//发张人选项和名称开始
				var $div = $('<div class="row"> </div>');
				var $div2 = $('<div class="col-xs-6" style=\"width:33%\"> </div>');
				
				//将发展人需要的objId放入OrderInfo中
				OrderInfo.codeInfos.developmentObjId=objId;
				
				var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+id+'"  class="selectpicker show-tick form-control" data-mini="true" data-native-menu="false" data-icon="select" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+id+'\',a)"></select>');
				
				$.each(OrderInfo.order.dealerTypeList,function(){
					$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
				});
				
				$div2.append($select);
				$div.append($div2);
				
				var $td = $('<div class="col-xs-6" style=\"width:33%\"><input type="text" onclick="javascript:order.dealer.showDealer(0,\'dealer\',\''+objId+'\');" onChange="javascript:this.staffId=OrderInfo.staff.staffId;this.value=OrderInfo.staff.staffName" class="form-control" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" ></input></div>');
				$div.append($td);
				
				//渠道数据信息
				var $tdChannel = $("<div class='col-xs-6' style=\"width:33%\"></div>");
				var $channelSelect = $('<select id="dealerChannel_'+objId+'" name="dealerChannel_'+id+'" class="selectpicker show-tick form-control styled-select" onclick=a=this.value;></select>');
				$.each(OrderInfo.channelList,function(){
					if(this.isSelect==1)
						$channelSelect.append("<option value='"+this.channelNbr+"' selected ='selected'>"+this.channelName+"</option>");
					else
						$channelSelect.append("<option value='"+this.channelNbr+"'>"+this.channelName+"</option>");
				});
				
				$tdChannel.append($channelSelect);
				
				$div.append($tdChannel);
				
				$li.append($div);
				$li.append("<p ></p>");
				
				$("#dealerTbody").append($li);
				
				OrderInfo.SEQ.dealerSeq++;
			}	
		});
		
		$("#addModal").modal("hide");
	};
	
	//添加一行产品协销人-第二第三发展人[W]
	var _addProdDealer = function(parentObj,obj,id,type){
		var $oldTr=$("#"+parentObj);
		var objId = obj+"_"+OrderInfo.SEQ.dealerSeq;
		var $tdType = _getDealerType(obj,id);
		
		if($tdType==undefined){
			return false;
		}
		
		var $tr = $("#atr_"+id);
		var $li = $("<li name='tr_"+obj+"' id='tr_"+obj+"' class='list-group-item'></li>");
		
		//从第一发展人获取号码套餐等信息
		if (OrderInfo.actionFlag != 13) {
			$li.append("<h5 class='list-group-item-heading text-warning'>"+$oldTr.find("h5").eq(0).html()+"[<a href=\"javascript:order.dealer.removeDealerNew('"+id+"');\">删除</a>]</h5><p> </p>");
			$li.append("<p class='list-group-item-text'>"+$oldTr.find("p").eq(2).html()+"</p>");
		}
		
		//新添加发展人[W]
		//$li.append("<h5 class='list-group-item-heading text-warning'>"+$tr.children().eq(1).text()+"[<a href=\"javascript:order.dealer.removeDealerNew('"+id+"');\">删除</a>]</h5>");
		//$li.append("<p class='list-group-item-text'>"+$tr.children().eq(2).text()+"</p>");
		$li.append("<p ></p>");
		
		//发张人选项和名称开始
		var $div = $('<div class="row"> </div>');
		var $div2 = $('<div class="col-xs-6" style=\"width:33%\"> </div>');
		
		//将发展人需要的objId放入OrderInfo中
		OrderInfo.codeInfos.developmentObjId=objId;
		
		//var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+id+'"  class="selectpicker show-tick form-control" data-mini="true" data-native-menu="false" data-icon="select" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+id+'\',a)"></select>');
		
		//$.each(OrderInfo.order.dealerTypeList,function(){
			//$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
		///\});
		
		
		//$div2.append($select);
		$div.append($tdType);
		
		var $td = $('<div class="col-xs-6" style=\"width:33%\"><input type="text" onclick="javascript:order.dealer.showDealer(0,\'dealer\',\''+objId+'\');" onChange="javascript:this.staffId=OrderInfo.staff.staffId;this.value=OrderInfo.staff.staffName" class="form-control" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" ></input></div>');
		$div.append($td);
		
		//渠道数据信息
		var $tdChannel = $("<div class='col-xs-6' style=\"width:33%\"></div>");
		var $channelSelect = $('<select id="dealerChannel_'+objId+'" name="dealerChannel_'+obj+'" class="selectpicker show-tick form-control styled-select" onclick=a=this.value;></select>');
		$.each(OrderInfo.channelList,function(){
			if(this.isSelect==1)
				$channelSelect.append("<option value='"+this.channelNbr+"' selected ='selected'>"+this.channelName+"</option>");
			else
				$channelSelect.append("<option value='"+this.channelNbr+"'>"+this.channelName+"</option>");
		});
		
		$tdChannel.append($channelSelect);
		
		$div.append($tdChannel);
		
		$li.append($div);
		$li.append("<p ></p>");
		
		$("#dealerTbody").append($li);
		
		OrderInfo.SEQ.dealerSeq++;
	};
	
	//改变发展人号码
	var _changeAccNbr = function(prodId,accNbr){
		$("li[name^='tr_"+prodId+"']").each(function(){
			$(this).find("dd").eq(0).text(accNbr);
		});
	};
	
	//校验发展人类型,并获取发展人类型列表
	var _getDealerType = function(objInstId,objId){
		var dealerType = "";
		if(order.ysl!=undefined){
			OrderInfo.order.dealerTypeList = [{"PARTYPRODUCTRELAROLECD":40020005,"NAME":"第一发展人"},{"PARTYPRODUCTRELAROLECD":40020006,"NAME":"第二发展人"},{"PARTYPRODUCTRELAROLECD":40020007,"NAME":"第三发展人"}];
		}
		if(OrderInfo.order.dealerTypeList!=undefined && OrderInfo.order.dealerTypeList.length>0){ //发展人类型列表
			$.each(OrderInfo.order.dealerTypeList,function(){
				var dealerTypeId = this.PARTYPRODUCTRELAROLECD;
				var flag = true;
				$("select[name='dealerType_"+objInstId+"']").each(function(){ //遍历选择框
					if(dealerTypeId==$(this).val()){  //如果已经存在
						flag = false;
						return false;
					}
				});
				if(flag){ //如果发展人类型没有重复
					dealerType = dealerTypeId;
					return false;
				}
			});
		}else{
			$.alert("信息提示","没有发展人类型");
			return;
		}
		if(dealerType==undefined || dealerType==""){	
			$.alert("信息提示","每个业务发展人类型不能重复");
			return;
		}
		var $tdType = $('<div class="col-xs-6" style="width:33%">');
		var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'"  class="selectpicker show-tick form-control" data-mini="true" data-native-menu="false" data-icon="select" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
		alert("dealerType:"+dealerType);
		$.each(OrderInfo.order.dealerTypeList,function(){
			if(this.PARTYPRODUCTRELAROLECD==dealerType){
				$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' selected='selected'>"+this.NAME+"</option>");
			}else{
				$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
			}
		});
	//	$field.append($select);
		$tdType.append($select);
		return $tdType;
	};
	
	//显示已经受理的业务列表
	var _showOfferList = function(){	
		$('#addBody').empty();
		
		//可选包
		var $content=$('<div data-role="content"></div>');
		var $table=$('<table class="searchtable"></table>');
		$table.append("<tr><th>操作</th><th style=\"width:150px;text-align:center;\">号码</th><th style=\"text-align:center;\">发展业务</th></tr>");
		$.each(AttachOffer.openList,function(){
			var prodId = this.prodId;
			var accNbr = "";
			if(OrderInfo.actionFlag==6){
				accNbr = OrderInfo.getAccessNumber(prodId);
				for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
					if(prodId==OrderInfo.oldprodInstInfos[i].prodInstId){
						accNbr = OrderInfo.oldprodInstInfos[i].accNbr;
					}
				}
			}else{
				accNbr = OrderInfo.getAccessNumber(prodId);
			}
			
			if(accNbr==undefined || accNbr==""){ 
				accNbr = "未选号";
			}
			$.each(this.specList,function(){
				var id = prodId+'_'+this.offerSpecId;
				if(this.isdel != "Y" && this.isdel != "C" && $("li[name='tr_"+id+"']")[0]==undefined){  //订购的附属销售品	
					var $tr = $("<tr id=\"atr_"+id+"\" onclick=\"order.dealer.checkAttach('"+prodId+"','"+this.offerSpecId+"');\"></tr>");
					$tr.append("<td style='text-align:center'><input type='checkbox' id=\""+id+"\" onclick=\"order.dealer.checkAttach('"+prodId+"','"+this.offerSpecId+"');\" name=\"attach_dealer\"/></td>");
					$tr.append("<td style='text-align:center'>"+accNbr+"</td><td style='text-align:center'>"+this.offerSpecName+"</td>");
					$table.append($tr);
				};
			});
		});
		
		//预受理
		if(order.ysl!=undefined){
			if(order.ysl.yslbean.yslflag!=undefined){
				for (var j = 0; j < order.ysl.openList.length; j++) {
					if(order.ysl.openList[j].type=="1"){
						var prodId = "-1";
						var accNbr = $("#choosedNumSpan").val();
						if(accNbr==undefined || accNbr==""){ 
							accNbr = "未选号";
						}
						var dealerchecked = "N";
						var dealertr = $("#dealerTbody").find("tr");
						dealertr.each(function(){
							if($(this).attr("name")=="tr_-1_"+order.ysl.openList[j].id){
								dealerchecked = "Y";
							}else{
								dealerchecked = "N";
							}
						});
						if(dealerchecked=="N"){
							var id = prodId+'_'+order.ysl.openList[j].id;
							var $tr = $('<tr id="atr_'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')"></tr>');
							$tr.append('<td><input type="checkbox" id="'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')" name="attach_dealer"/></td>');
							$tr.append("<td style='text-align:center'>"+accNbr+"</td><td>"+order.ysl.openList[j].name+"</td>");
							$table.append($tr);
						}
					}
				}
			}
		}
		
		$content.append($table);
		var $footer='<div data-role="footer" data-position="inline" data-tap-toggle="false" data-theme="n"> <button data-inline="true" data-icon="next" id="sureAdddealer">确定</button>';
		$footer+='<button data-inline="true" data-icon="back" data-rel="back" id="closeAdddealer">取消</button></div>';
		
		$('#addBody').append($content);
		
		$("#addModel").modal("show");

		$("#sureAdddealer").off("click").on("click",function(){_addAttachDealer();});
		
		$("#addModal").modal("show");
//		$("#closeAdddealer").off("tap").on("tap",function(){$("#div_attach_choose").popup("close");});
		
	};
	
	//勾选一个附属
	var _checkAttach = function(prodId,id){
		//var tr = $("#atr_"+id);
		var checkbox = $("#"+prodId+"_"+id);
		if(checkbox.attr("checked")=="checked"){
			//tr.removeClass("plan_select");
			//checkbox.attr("checked", false);
		}else {
			//tr.addClass("plan_select");
			//checkbox.attr("checked", true);
		}
	};
	
	//删除协销人
	var _removeDealer = function(obj){
		$(obj).parent().parent().parent().parent().parent().remove();
		$.refresh($("#dealerTbody"));
	};
	
	//删除协销人
	var _removeDealerNew = function(id){
		$("#tr_"+id).remove();
	//	$(obj).parent().parent().remove();
		//$.refresh($("#dealerTbody"));
	};
	
	//删除协销人
	var _removeAttDealer = function(id){
		$("li[name^='tr_"+id+"']").each(function(){
			$(this).remove();
		});
		$.refresh($("#dealerTbody"));
	};
	
	return {
		initDealer 			: _initDealer,
		changeAccNbr		: _changeAccNbr,
		showOfferList		: _showOfferList,
		addProdDealer		: _addProdDealer,
		addAttachDealer		: _addAttachDealer,
		checkAttach			: _checkAttach,
		removeDealer		: _removeDealer,
		removeAttDealer		: _removeAttDealer,
		changeDealer		: _changeDealer,
		queryStaff          : _queryStaff,
		showDealer          : _showDealer,
		queryChildNode      : _queryChildNode,
		removeDealerNew:_removeDealerNew
	};
})();
/**
 * 销售品变更
 * 
 * @author wukfsearchPack
 * date 2013-9-22
 */
CommonUtils.regNamespace("offerChangeNew");

offerChangeNew = (function() {
	var _newAddList = [];
	var maxNum = 0;
	//初始化套餐变更页面
	var _init = function (){
	   
		OrderInfo.order.step=1;
		OrderInfo.actionFlag = 2;
		OrderInfo.busitypeflag=2;
		if(OrderInfo.provinceInfo.mergeFlag=="0"){
			if(!query.offer.setOffer()){ //必须先保存销售品实例构成，加载实例到缓存要使用
				return ;
			}
		}
		//获取初始化查询的条件
		order.service.queryApConfig();
		//初始化主套餐查询
		
		
		//if(OrderInfo.provinceInfo.prodOfferId!)
	    //有传主套餐id
		//判断是否是二次加载
		
		//进行全量查询[w],旧-在代码中全量，新-在JS中全量
		query.offer.loadInst();
		
		offerChangeNew.searchPack();
	};
	//主套餐查询
	var _searchPack = function(flag,scroller){
		var custId = OrderInfo.cust.custId;
		var qryStr=$("#qryStr").val();
		var params={"qryStr":qryStr,"pnLevelId":"","custId":custId};
		if(flag){
			
			var priceVal = $("#select_price").val();
			if(ec.util.isObj(priceVal)){
				var priceArr = priceVal.split("-");
				if(priceArr[0]!=null&&priceArr[0]!=""){
					params.priceMin = priceArr[0] ;
				}
				if(priceArr[1]!=null&&priceArr[1]!=""){
					params.priceMax = priceArr[1] ;
				}
			}
			var influxVal = $("#select_invoice").val();
			if(ec.util.isObj(influxVal)){
				var influxArr = influxVal.split("-");
				if(influxArr[0]!=null&&influxArr[0]!=""){
					params.INFLUXMin = influxArr[0]*1024 ;
				}
				if(influxArr[1]!=null&&influxArr[1]!=""){
					params.INFLUXMax = influxArr[1]*1024 ;
				}
			}
			var invoiceVal = $("#select_influx").val();
			if(ec.util.isObj(invoiceVal)){
				var invoiceArr = invoiceVal.split("-");
				if(invoiceArr[0]!=null&&invoiceArr[0]!=""){
					params.INVOICEMin = invoiceArr[0] ;
				}
				if(invoiceArr[1]!=null&&invoiceArr[1]!=""){
					params.INVOICEMax = invoiceArr[1] ;
				}
			}
		}
		offerChangeNew.queryData(params,flag,scroller);
		
	};
	
	var _queryData = function(params,flag,scroller) {
		//alert("_queryData");
		if(OrderInfo.actionFlag==2){
			var offerSpecId = order.prodModify.choosedProdInfo.prodOfferId;
			if(offerSpecId!=undefined){
				params.changeGradeProdOfferId = offerSpecId;
			}
			var prodSpecIds='';
			$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
				if(this.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
					if(this.objId!=undefined){
						prodSpecIds=prodSpecIds+","+this.objId;
					}
				}
			});
			if(prodSpecIds!=''){
				prodSpecIds=prodSpecIds.substring(1, prodSpecIds.length);
				params.prodSpecId=prodSpecIds;
			}
			params.actionFlag=2;
		}else if(CONST.getAppDesc()==0){
			params.prodOfferFlag = "4G";
		}
		var url="";
		
		if(OrderInfo.provinceInfo.reloadFlag=="N"){
			//alert("二次加载");
			url = contextPath+"/token/app/order/offerSpecListSub";
		}else{
			if(OrderInfo.provinceInfo.prodOfferId!=null && OrderInfo.provinceInfo.prodOfferId!="" && OrderInfo.provinceInfo.prodOfferId!="" && OrderInfo.provinceInfo.prodOfferId!="undefined"){
				//alert("带主套餐id");
				url = contextPath+"/token/app/order/offerSpecListSub";
			}else{
				//alert("不带主套餐id");
				url = contextPath+"/token/app/order/offerSpecList";
			}
		}
		$.callServiceAsHtmlGet(url,params, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
				$("#search-modal").modal('hide');
			},
			"done" : function(response){
				$("#search-modal").modal('hide');
				if(response.code != 0) {
					$.alert("提示","<br/>查询失败,稍后重试");
					return;
				}
				$.unecOverlay();
				var content$ = $("#offer-list");
				content$.html(response.data);
				if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
//				$.refresh(content$);
			    
				//判断是否二次加载
				//alert(OrderInfo.provinceInfo.reloadFlag);
			
				if(OrderInfo.provinceInfo.reloadFlag=="N"){
					//获取数据里的主套餐id
					
					var offid="";

					//获取主套餐ID，原先获取方法错误
					$.each(OrderInfo.reloadOrderInfo.orderList.custOrderList[0].busiOrder,function(){
						if(this.boActionType.actionClassCd=="1200" && this.boActionType.boActionTypeCd=="S1" && this.busiObj.offerTypeCd=="1"){
							offid=this.busiObj.objId;
						}
					});
					
					offerChangeNew.buyService(offid,"");
				}else{
					if(OrderInfo.provinceInfo.prodOfferId!=null && OrderInfo.provinceInfo.prodOfferId!=""){
						order.service.buyService(OrderInfo.provinceInfo.prodOfferId,"");
					}
					
				}	
			},
			fail:function(response){
				$.unecOverlay();
				$("#search-modal").modal('hide');
				$.alert("提示","套餐加载失败，请稍后再试！");
			}
		});
	};
	
	//订购销售品
	var _buyService = function(specId,price) {
		
		var custId = OrderInfo.cust.custId;
		offerprice = price;
		if(OrderInfo.cust==undefined || custId==undefined || custId==""){
			$.alert("提示","在订购套餐之前请先进行客户定位！");
		}else{
			var param = {
					"price":price,
					"specId" : specId,
					"custId" : OrderInfo.cust.custId,
					"areaId" : OrderInfo.staff.soAreaId
			};
			if(OrderInfo.actionFlag == 2){  //套餐变更不做校验
				offerChangeNew.opeSer(param);
			}else {  //新装
				var boInfos = [{
					boActionTypeCd: "S1",//动作类型
					instId : "",
					specId : specId //产品（销售品）规格ID
				}];
//			var url = contextPath+"/order/sign/gotoPrint";
//			$.ecOverlay("<strong>正在校验,请稍等会儿...</strong>");
//			var paramtmp={};
//			$.callServiceAsHtml(url,paramtmp);
				rule.rule.ruleCheck(boInfos,function(checkData){//业务规则校验通过
					if(ec.util.isObj(checkData)){
						$("#order_prepare").hide();
						var content$ = $("#order").html(checkData).show();
						$.refresh(content$);
					}else{
						order.service.opeSer(param);   
					}
				});
//	        if(rule.rule.ruleCheck(boInfos,'_ruleCheckSer')){  //业务规则校验通过
//	        }
			}
		}
	};
	//获取销售品构成，并选择数量
	var _opeSer = function(inParam){

		var param = {
			offerSpecId : inParam.specId,
			offerTypeCd : 1,
			partyId: OrderInfo.cust.custId
		};
		
		var offerSpec = query.offer.queryMainOfferSpec(param); //查询主销售品构成
	
		if(!offerSpec){
			return;
		}
		
		if(OrderInfo.actionFlag == 2){ //套餐变更
			var url=contextPath+"/app/order/queryFeeType";
			$.ecOverlay("<strong>正在查询是否判断付费类型的服务中,请稍后....</strong>");
			var response = $.callServiceAsJsonGet(url,param);	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data!=undefined){
					if("0"==response.data){
						var is_same_feeType=false;
						if(order.prodModify.choosedProdInfo.feeType=="2100" && (offerSpec.feeType=="2100"||offerSpec.feeType=="3100"||offerSpec.feeType=="3101"||offerSpec.feeType=="3103"||offerSpec.feeType=="1202"||offerSpec.feeType=="2101")){
							is_same_feeType=true;//预付费
						}else if(order.prodModify.choosedProdInfo.feeType=="1200" && (offerSpec.feeType=="1200"||offerSpec.feeType=="3100"||offerSpec.feeType=="3102"||offerSpec.feeType=="3103"||offerSpec.feeType=="1202"||offerSpec.feeType=="2101")){
							is_same_feeType=true;//后付费
						}else if(order.prodModify.choosedProdInfo.feeType=="1201" && (offerSpec.feeType=="1201"||offerSpec.feeType=="3101"||offerSpec.feeType=="3102"||offerSpec.feeType=="3103")){
							is_same_feeType=true;//准实时预付费
						}
						if(!is_same_feeType){
							$.alert("提示","付费类型不一致,无法进行套餐变更。");
							return;
						}
					}
				}
			}
			offerChangeNew.offerChangeView();
			return;
		}
		var iflag = 0; //判断是否弹出副卡选择框 false为不选择
		var max=0;
		var str="";
		$("#div_content").empty();
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
						max = this.maxQty<0?"不限制":this.maxQty;//主卡的最大数量
						str+="<div class='form-group'>"
							+"<label for='"+objInstId+"'>副卡数量:"+this.minQty+"-"+max+"(张)</label>"
							+"<div class='input-group input-group-lg'>"
							+"<span class='input-group-btn'>"
							+"<button class='btn btn-default' type='button' onclick=order.service.subNum('"+objInstId+"',"+this.minQty+")> - </button>"
							+"</span>"
							+"<input type='text'  readonly='readonly' class='form-control' id='"+objInstId+"' value='"+this.dfQty+"'>"
							+"<span class='input-group-btn'>"
							+"<button class='btn btn-default' type='button' onclick=order.service.addNum('"+objInstId+"',"+this.maxQty+",'"+offerRole.parentOfferRoleId+"')> + </button>"
							+"</span> </div>"
							+"</div>";
						iflag++;
						return false;
					}
				});
			}
		});
		//页面初始化参数
		var param = {
			"boActionTypeCd" : "S1" ,
			"boActionTypeName" : "订购",
			"offerSpec" : offerSpec,
			"actionFlag" :1,
			"type" : 1
		};
		if(iflag >0){
			$("#div_content").append(str);
			$("#vice_modal").modal("show");
			$("#btn_modal").off("click").on("click",function(){
				order.service.confirm(param);
			});
		}else{
			if(!_setOfferSpec(1)){
				$.alert("错误提示","请选择一个接入产品");
				return;
			}
			if(OrderInfo.actionFlag!=14){ //合约套餐不初始化
				order.main.buildMainView(param);	
			}
		}
	};
	
	
	//套餐变更页面显示
	var str = "";
	var _offerChangeView=function(){
		_newAddList = [];
		var oldLen = 0 ;
		$.each(OrderInfo.offer.offerMemberInfos,function(){
			if(this.objType==2){
				oldLen++;
			}
		});
		var memberNum = 1; //判断是否多成员 1 单成员2多成员
		var viceNum = 0;
		if(oldLen>1){ //多成员角色，目前只支持主副卡
			memberNum = 2;
		}
		
		//把旧套餐的产品自动匹配到新套餐中
		if(!_setChangeOfferSpec(memberNum,viceNum)){  
			return;
		};
		
		//4g系统需要
		if(CONST.getAppDesc()==0){ 
			//老套餐是3G，新套餐是4G
			if(order.prodModify.choosedProdInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){
				if(!offerChange.checkOrder()){ //省内校验单
					return;
				}
			}
			//根据UIM类型，设置产品是3G还是4G，并且保存旧卡
			if(!prod.uim.setProdUim()){ 
				return ;
			}
		}
		
		if(OrderInfo.actionFlag == 2){ //套餐变更
			var custOrderList = OrderInfo.reloadOrderInfo.orderList.custOrderList[0].busiOrder;
			var newsplitflag = 1;
			var oldsplitflag = 1;
			order.memberChange.newSubPhoneNum="";
			order.memberChange.oldSubPhoneNum="";
			$.each(custOrderList,function(){
				if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="1"){//纳入新成员
					order.memberChange.newmembers.flag = true;
					if(newsplitflag==1){
						order.memberChange.newSubPhoneNum += this.busiObj.accessNumber;
						newsplitflag++;
					}else{
						order.memberChange.newSubPhoneNum += ","+this.busiObj.accessNumber;
					}
				}else if(this.boActionType.actionClassCd=="1200" && this.boActionType.boActionTypeCd=="S2"){//纳入老成员
					if(this.busiObj.isComp!=undefined){
						order.memberChange.oldmembers.flag = true;
						if(oldsplitflag==1){
							order.memberChange.oldSubPhoneNum += this.busiObj.accessNumber;
							oldsplitflag++;
						}else{
							order.memberChange.oldSubPhoneNum += ","+this.busiObj.accessNumber;
						}
						var objInstId = this.data.ooRoles[0].objInstId;
						var instId = this.busiObj.instId;
						order.memberChange.oldmembers.objInstId.push({"instId":instId,"objInstId":objInstId});
					}
				}
			});
			var newSubPhoneNumsize=[];
			var oldSubPhoneNumsize=[];
			if(order.memberChange.newSubPhoneNum!=""){
				newSubPhoneNumsize = order.memberChange.newSubPhoneNum.split(",");
			}
			if(order.memberChange.oldSubPhoneNum!=""){
				oldSubPhoneNumsize = order.memberChange.oldSubPhoneNum.split(",");
			}
			var max = 0;
			str = "";
			$("#div_content").empty();
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				if(this.memberRoleCd=="401"){
					var offerRole = this;
					$.each(this.roleObjs,function(){
						var objInstId = offerRole.offerRoleId+"_"+this.objId;//角色id+产品规格id
						if(this.objType == CONST.OBJ_TYPE.PROD){
							_newAddList.push(objInstId);
							if(offerRole.minQty == 0){ //加装角色
								this.minQty = 0;
								this.dfQty = 0;
							}
							var membernum = 0;
							$.each(OrderInfo.offer.offerMemberInfos,function(){
								if(this.roleCd=="401"){
									membernum++;
								}
							})
							max = this.maxQty<0?"不限制":this.maxQty-membernum;
							if(max<0){
								max = 0;
							}
							maxNum = max;
							str+="<div class='form-group' id='memberTable'>"
								+"<label for='"+objInstId+"'>副卡数量:"+this.minQty+"-"+max+"(张)</label>"
								+"<div class='input-group input-group-lg'>"
								+"<label>"+this.objName+"</label>"
								+"<span class='input-group-btn'>"
								+"<button class='btn btn-default' type='button' onclick=order.service.subNum('"+objInstId+"',"+this.minQty+")> - </button>"
								+"</span>"
								+"<input type='text' style='margin-top:10px;' readonly='readonly' class='form-control' id='"+objInstId+"' value='"+newSubPhoneNumsize.length+"'>"
								+"<span class='input-group-btn'>"
								+"<button class='btn btn-default' type='button' onclick=order.service.addNum('"+objInstId+"',"+this.maxQty+",'"+offerRole.parentOfferRoleId+"')> + </button>"
								+"</span> </div>"
								if(max>0){
									for(var k=0;k<oldSubPhoneNumsize.length;k++){
										if(k==0){
											str+="<div class='input-group input-group-lg'>"
												+"<label style='width:170px;'>已有移动电话</label>"
												+"<span class='input-group-btn' style='width:40px'>"
												+"</span>"
												+"<input type='text' style='margin-top:10px;' class='form-control' name='oldphonenum' value='"+oldSubPhoneNumsize[k]+"'>"
												+"<span class='input-group-btn'>"
												+"<button class='btn btn-default' type='button' onclick='addNum("+max+",\"\")';> + </button>"
												+"</span> </div>"
										}else{
											addNum(max,oldSubPhoneNumsize[k]);
										}
									}
								}
							str+="</div>";
						}
					});
				}
			});
			$("#div_content").append(str);
			$("#vice_modal").modal("show");
			offerChangeConfirm();
		}
	};
	
	var idnum = 1;
	var addNum = function(max,addnum){
		var lis = $("input[name='oldphonenum']");
		lis = lis.length+1;
		if(lis>max){
			return;
		}
		idnum++;
		str += "<div class='input-group input-group-lg' id='oldnum_"+idnum+"'>"
			+"<label style='width:170px;'>已有移动电话</label>"
			+"<span class='input-group-btn' style='width:40px'>"
			+"</span>"
			+"<input type='text' style='margin-top:10px;' class='form-control' name='oldphonenum' value='"+addnum+"'>"
			+"<span class='input-group-btn'>"
			+"<button class='btn btn-default' type='button' onclick=order.memberChange.delNum(\"oldnum_"+idnum+"\")> - </button>"
			+"</span> </div>"
//		$("#memberTable").append(str);
	};
	
	function offerChangeConfirm(){
		var newnum = 0;
		var oldnum = 0;
		order.memberChange.viceCartNum = 0;
		var delprodInsts = [];
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			if(this.memberRoleCd=="401"){
				if(this.prodInsts!=undefined){
					var oldprodInsts = this.prodInsts;
					for(var i=0;i<this.prodInsts.length;i++){
						var prodInstId = '"'+this.prodInsts[i].prodInstId+'"';
						if(prodInstId.indexOf("-")!=-1){
							delprodInsts.push(this.prodInsts[i]);
						}
					}
					$.each(delprodInsts,function(){
						var delprodInstId = this.prodInstId;
						$.each(oldprodInsts,function(j){
							if(this.prodInstId = delprodInstId){
								oldprodInsts.splice(j,1);
							}
						});
					});
				}
			}
		});
		$.each(_newAddList,function(){
			newnum=newnum+Number($("#"+this).val());
		});
		$("input[name='oldphonenum']").each(function(){
			var num = $.trim($(this).val());
			if(ec.util.isObj(num)){
				oldnum++;
			}
		});
		if(newnum>0){
			offerChange.newMemberFlag = true;
			order.service.setOfferSpec();
		}
		if(oldnum>0){
			offerChange.oldMemberFlag = true;
			if(!order.memberChange.queryofferinfo()){
				return;
			}
		}
		if(parseInt(newnum)+parseInt(order.memberChange.viceCartNum)>maxNum){
			$.alert("提示","加装数量已经超过能加装的最大数量【"+maxNum+"】!");
			return;
		}
		//初始化填单页面
		var prodInfo = order.prodModify.choosedProdInfo;
		var param = {
			boActionTypeCd : "S2" ,
			boActionTypeName : "套餐变更",
			actionFlag :"2",
			offerSpec : OrderInfo.offerSpec,
			prodId : prodInfo.prodInstId,
			offerMembers : OrderInfo.offer.offerMemberInfos,
			oldOfferSpecName : prodInfo.prodOfferName,
			prodClass : prodInfo.prodClass,
			appDesc : CONST.getAppDesc(),
			areaId : order.prodModify.choosedProdInfo.areaId,
			newnum : parseInt(newnum),
			oldnum : parseInt(oldnum),
			feeTypeMain:prodInfo.feeType
		};
		if(oldnum>0){
			param.oldprodInstInfos = OrderInfo.oldprodInstInfos;
			param.oldofferSpec = OrderInfo.oldofferSpec;
			param.oldoffer = OrderInfo.oldoffer;
		}
		offerChangeNew.buildMainView(param);
		$("#vice_modal").modal("hide");
	}
	
	var _buildMainView = function(param) {
		$.callServiceAsHtml(contextPath+"/token/app/order/mainSub",param,{
			"before":function(){
				$.ecOverlay("<strong>正在加载中,请稍等...</strong>");
			},"done" : function(response){
				if(!response){
					$.unecOverlay();
					 response.data='查询失败,稍后重试';
				}
				if(response.code != 0) {
					$.unecOverlay();
					$.alert("提示","查询失败,稍后重试");
					return;
				}
				OrderInfo.actionFlag = param.actionFlag;
				if(OrderInfo.actionFlag == 2){
					setTimeout(function () { 
						$.unecOverlay();
						offerChangeNew.fillOfferChange(response,param);
				    }, 800);
				}else {
					$.unecOverlay();
					_callBackBuildView(response,param);
				}
			}
		});
	};
	
	//校验uim卡
	//uim卡号校验
	var _checkUim = function(prodId,bo2Coupons){
	
		var phoneNumber = OrderInfo.getAccessNumber(prodId);
		var offerId = "-1"; //新装默认，主销售品ID
		/*
		if(OrderInfo.actionFlag==1||OrderInfo.actionFlag==6||OrderInfo.actionFlag==14){ //新装需要选号
			if(phoneNumber==''){
				$.alert("提示","校验UIM卡前请先选号!");
				return false;
			}
		}
		*/
		if(OrderInfo.actionFlag==3 || OrderInfo.actionFlag==22 || OrderInfo.actionFlag==23 || OrderInfo.actionFlag==6 ){ //可选包变更，补换卡，加装副卡
			if(ec.util.isArray(OrderInfo.oldprodInstInfos)){//判断是否是纳入老用户
				$.each(OrderInfo.oldprodInstInfos,function(){
					if(this.prodInstId==prodId){
						offerId = this.mainProdOfferInstInfos[0].prodOfferInstId;
					}
				});
			}else{
				offerId = order.prodModify.choosedProdInfo.prodOfferInstId;
			}
		}
		var cardNo =$.trim($("#uim_txt_"+prodId).val());
		/*
		if(cardNo==undefined || cardNo==''){
			$.alert("提示","UIM卡不能为空!");
			return false;
		}
		*/
		var inParam = {
			"instCode" : cardNo,
			"phoneNum" : phoneNumber,
			"areaId"   : OrderInfo.getProdAreaId(prodId)
		};

		var prodSpecId = OrderInfo.getProdSpecId(prodId);
		var mktResCd="";
		if(CONST.getAppDesc()==0){
			if(getIsMIFICheck(prodId)){
				mktResCd =prod.uim.getMktResCd(CONST.PROD_SPEC_ID.MIFI_ID);
			}else{
				mktResCd = prod.uim.getMktResCd(prodSpecId);
			}
			if(ec.util.isObj(mktResCd)){
//				inParam.mktResCd = mktResCd;
			}else{
				//$.alert("提示","查询卡类型失败！");
				return;
			}
			if(OrderInfo.actionFlag==22 || OrderInfo.actionFlag==23){ //补换卡和异地补换卡
				if(prod.changeUim.is4GProdInst){ //如果已办理4G业务，则校验uim卡是否是4G卡
					inParam.onlyLTE = "1";
				}
			}
		}
		//var data = query.prod.checkUim(inParam);//校验uim卡
		
		
		//根据uim返回数据组织物品节点
		var couponNum = bo2Coupons.couponNum;//data.baseInfo.qty ;
		if(couponNum==undefined||couponNum==null){
			couponNum = 1 ;
		}
		var coupon = {
			couponUsageTypeCd : "3", //物品使用类型
			inOutTypeId : "1",  //出入库类型
			inOutReasonId : 0, //出入库原因
			saleId : 1, //销售类型
			couponId :bo2Coupons.couponId, //data.baseInfo.mktResId, //物品ID
			couponinfoStatusCd : "A", //物品处理状态
			chargeItemCd : "3000", //物品费用项类型
			couponNum : couponNum, //物品数量
			storeId : bo2Coupons.storeId,//data.baseInfo.mktResStoreId, //仓库ID
			storeName : "1", //仓库名称
			agentId : 1, //供应商ID
			apCharge : 0, //物品价格
			couponInstanceNumber : bo2Coupons.terminalCode,//data.baseInfo.mktResInstCode, //物品实例编码
			terminalCode : bo2Coupons.terminalCode,//data.baseInfo.mktResInstCode,//前台内部使用的UIM卡号
			ruleId : "", //物品规则ID
			partyId : OrderInfo.cust.custId, //客户ID
			prodId :  prodId, //产品ID
			offerId : offerId, //销售品实例ID
			state : "ADD", //动作
			relaSeq : "" //关联序列	
		};
		if(CONST.getAppDesc()==0){
			coupon.cardTypeFlag=bo2Coupons.cardTypeFlag;//UIM卡类型
		}
		$("#uim_check_btn_"+prodId).attr("disabled",true);
		//$("#uim_check_btn_"+prodId).removeClass("purchase").addClass("disablepurchase");
		//$("#uim_release_btn_"+prodId).attr("disabled",false);
		$("#uim_release_btn_"+prodId).removeClass("disabled");
		$("#uim_txt_"+prodId).attr("disabled",true);
		if(getIsMIFICheck(prodId)){//判断是否通过MIFI 校验
			$("#isMIFI_"+prodId).val("yes");
		}else{
			$("#isMIFI_"+prodId).val("no");
		}
		OrderInfo.clearProdUim(prodId);
		OrderInfo.boProd2Tds.push(coupon);
		if(OrderInfo.actionFlag==22 && data.baseInfo.cardTypeFlag==1){
		//	_queryAttachOffer();
		  AttachOffer.queryCardAttachOffer(data.baseInfo.cardTypeFlag);  //加载附属销售品
	    }
	};
	
	
	//填充套餐变更页面
	var _fillOfferChange = function(response, param) {
		SoOrder.initFillPage(); //并且初始化订单数据
		$("#order_prepare").hide();
		$("#order").html(response.data).show();
//		_initOfferLabel();//初始化主副卡标签
		$("#fillNextStep").off("click").on("click",function(){
			if(!SoOrder.checkData()){ //校验通过
				return false;
			}
			$("#order-content").hide();
			$("#order-dealer").show();
			order.dealer.initDealer();
		});
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
		$("#attach-modal").modal('show');
		//遍历主销售品构成
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			var offerRole = this;
			if(ec.util.isArray(this.prodInsts)){
				$.each(this.prodInsts,function(){
					var _prodInstId = "'"+this.prodInstId+"'";
					if(_prodInstId.indexOf("-") == -1){
						var prodId = this.prodInstId;
						var param = {
							areaId : OrderInfo.getProdAreaId(prodId),
							channelId : OrderInfo.staff.channelId,
							staffId : OrderInfo.staff.staffId,
						    prodId : prodId,
						    prodSpecId : this.objId,
						    offerSpecId : prodInfo.prodOfferId,
						    offerRoleId : this.offerRoleId,
						    acctNbr : this.accessNumber
						};
						var res = query.offer.queryChangeAttachOffer(param);
						$("#attach_"+prodId).html(res);	
						//如果objId，objType，objType不为空才可以查询默认必须
						if(ec.util.isObj(this.objId)&&ec.util.isObj(this.objType)&&ec.util.isObj(this.offerRoleId)){
							param.queryType = "1,2";
							param.objId = this.objId;
							param.objType = this.objType;
							param.memberRoleCd = this.roleCd;
							param.offerSpecId=OrderInfo.offerSpec.offerSpecId;
							//默认必须可选包
							var data = query.offer.queryDefMustOfferSpec(param);
							CacheData.parseOffer(data,prodId);
							//默认必须功能产品
							param.queryType = "1";//只查询必选，不查默认
							var data = query.offer.queryServSpec(param);
							CacheData.parseServ(data,prodId);
						}
						/*if(CONST.getAppDesc()==0 && prodInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){	//预校验
						}else{	
						}*/
						AttachOffer.showMainRoleProd(prodId); //显示新套餐构成
	//					AttachOffer.changeLabel(prodId,this.objId,""); //初始化第一个标签附属
						if(AttachOffer.isChangeUim(prodId)){ //需要补换卡
	                            
								$("#uimDiv_"+prodId).show();
								cleckUim(OrderInfo.mktResInstCode,prodId);
								//$("#uim_txt_"+prodId).val(OrderInfo.mktResInstCode);
	
						}
						//uimDivShow=true;
					}else{
						var prodInst = this;
						var param = {   
							offerSpecId : OrderInfo.offerSpec.offerSpecId,
							prodSpecId : prodInst.objId,
							offerRoleId: prodInst.offerRoleId,
							prodId : prodInst.prodInstId,
							queryType : "1,2",
							objType: prodInst.objType,
							objId: prodInst.objId,
							memberRoleCd : prodInst.memberRoleCd
						};
						AttachOffer.queryAttachOfferSpec(param);  //加载附属销售品
						var obj = {
							div_id : "item_order_"+prodInst.prodInstId,
							prodId : prodInst.prodInstId,
							offerSpecId : OrderInfo.offerSpec.offerSpecId,
							compProdSpecId : "",
							prodSpecId : prodInst.objId,
							roleCd : offerRole.roleCd,
							offerRoleId : offerRole.offerRoleId,
							partyId : OrderInfo.cust.custId
						};
						order.main.spec_parm(obj); //加载产品属性
					}
				});
			}
		});
		if(offerChange.oldMemberFlag){
			for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
				var prodInfo = OrderInfo.oldprodInstInfos[i]; //获取老用户产品信息
				$.each(OrderInfo.oldoffer,function(){
					if(this.accNbr == prodInfo.accNbr){
						var oldoffer = this;
						$.each(oldoffer.offerMemberInfos,function(){
							var member = this;
							if(member.objType==CONST.OBJ_TYPE.PROD){
								var prodId = this.objInstId;
								var param = {
										areaId : OrderInfo.getProdAreaId(prodId),
										channelId : OrderInfo.staff.channelId,
										staffId : OrderInfo.staff.staffId,
									    prodId : prodId,
									    prodSpecId : member.objId,
									    offerSpecId : prodInfo.mainProdOfferInstInfos[0].prodOfferId,
									    offerRoleId : "",
									    acctNbr : member.accessNumber,
									    partyId:prodInfo.custId,
									    distributorId:OrderInfo.staff.distributorId,
									    mainOfferSpecId:prodInfo.mainProdOfferInstInfos[0].prodOfferId,
									    soNbr:OrderInfo.order.soNbr
									};
								if(ec.util.isObj(prodInfo.prodBigClass)){
									param.prodBigClass = prodInfo.prodBigClass;
								}
								$.each(OrderInfo.oldofferSpec,function(){
									if(this.accNbr==prodInfo.accNbr){
										$.each(this.offerSpec.offerRoles,function(){
											if(this.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD || this.memberRoleCd==CONST.MEMBER_ROLE_CD.COMMON_MEMBER){
												param.offerRoleId = this.offerRoleId;
											}
										});
									}
								});
								var res = query.offer.queryChangeAttachOffer(param);
								$("#attach_"+prodId).html(res);	
								//如果objId，objType，objType不为空才可以查询默认必须
								if(ec.util.isObj(member.objId)&&ec.util.isObj(member.objType)&&ec.util.isObj(member.offerRoleId)){
									param.queryType = "1,2";
									param.objId = member.objId;
									param.objType = member.objType;
									param.memberRoleCd = "401";
									//默认必须可选包
									var data = query.offer.queryDefMustOfferSpec(param);
									CacheData.parseOffer(data);
									//默认必须功能产品
									var data = query.offer.queryServSpec(param);
									CacheData.parseServ(data);
								}
								if(ec.util.isArray(OrderInfo.oldofferSpec)){ //主套餐下的成员判断
									$.each(OrderInfo.oldofferSpec,function(){
										if(this.accNbr == prodInfo.accNbr){
											var offerRoles = this.offerSpec.offerRoles;
											$.each(offerRoles,function(){
												if(this.offerRoleId==member.offerRoleId && member.objType==CONST.OBJ_TYPE.PROD){
													var offerRole = this;
													$.each(this.roleObjs,function(){
														if(this.objType==CONST.OBJ_TYPE.SERV){
															var serv = CacheData.getServBySpecId(prodId,this.objId);//从已订购功能产品中找
															if(serv!=undefined){ //不在已经开跟已经选里面
																var $oldLi = $('#li_'+prodId+'_'+serv.servId);
//																if(this.minQty==1){
//																	$oldLi.append('<dd class="mustchoose"></dd>');
//																}
//																$oldLi.append('<dd id="jue_'+prodId+'_'+serv.servId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
															}
														}
													});
													return false;
												}
											});
										}
									});
								}
//								AttachOffer.changeLabel(prodId,prodInfo.productId,"");
							}
						});
					}
				});
				var oldoffer = {};
				if(ec.util.isArray(OrderInfo.oldoffer)){ //主套餐下的成员判断
				    $.each(OrderInfo.oldoffer,function(){
				    	if(this.accNbr == prodInfo.accNbr){
				    		oldoffer = this;
				    	}
				    });
				}
				//老用户加入副卡需要预校验,主卡是4G，加入的老用户为3G
				if(order.prodModify.choosedProdInfo.is3G== "N" && prodInfo.mainProdOfferInstInfos[0].is3G =="Y"){
					if(!order.memberChange.checkOrder(prodInfo,oldoffer)){ //省内校验单
						return;
					}
					order.memberChange.checkOfferProd(oldoffer);
				}
				
			}
		}
           //order.dealer.initDealer(); //初始化发展人
		if(CONST.getAppDesc()==0 && order.prodModify.choosedProdInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){ //3G转4G需要校验
			offerChange.checkOfferProd();
		}
		offerChangeNew.initTounch();
	};
	
	function cleckUim(uim,prodId){
		var uimParam = {
				"instCode":uim
				};
		var response = $.callServiceAsJsonGet(contextPath+"/token/pc/mktRes/qrymktResInstInfo",uimParam);
		if (response.code==0) {
			if(response.data.mktResBaseInfo){
				if(response.data.mktResBaseInfo.statusCd=="1102"){
				//	$("#uim_check_btn_-"+(n+1)).attr("disabled",true);
				//	$("#uim_check_btn_-"+(n+1)).removeClass("purchase").addClass("disablepurchase");
				//	$("#uim_release_btn_-"+(n+1)).attr("disabled",false);
				//	$("#uim_release_btn_-"+(n+1)).removeClass("disablepurchase").addClass("purchase");
					$("#uim_txt_"+prodId).val(OrderInfo.mktResInstCode);
					var coupon = {
							couponUsageTypeCd : "5", //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
							inOutTypeId : "1",  //出入库类型
							inOutReasonId : 0, //出入库原因
							saleId : 1, //销售类型
							couponId :response.data.mktResBaseInfo.mktResId, //物品ID
							couponinfoStatusCd : "A", //物品处理状态
							chargeItemCd : CONST.CHARGE_ITEM_CD.COUPON_SALE, //物品费用项类型
							couponNum : 1, //物品数量
							storeId : response.data.mktResBaseInfo.mktResStoreId, //仓库ID
							storeName : "1", //仓库名称
							agentId : 1, //供应商ID
							apCharge : 0, //物品价格
							couponInstanceNumber : uim, //物品实例编码
							ruleId : "", //物品规则ID
							partyId : OrderInfo.cust.custId, //客户ID
							prodId : prodId, //产品ID
							offerId : -1, //销售品实例ID
						//	attachSepcId : OrderInfo.offerSpec.offerSpecId,
							state : "ADD", //动作
							relaSeq : "" //关联序列	
						};
					OrderInfo.clearProdUim(prodId);
					OrderInfo.boProd2Tds.push(coupon);
				}else{
					$.alert("提示","UIM卡不是预占状态，当前为"+response.data.mktResBaseInfo.statusCd);
				}
			}else{
				$.alert("提示","查询不到UIM信息");
			}
		}
}
	var _initTounch = function(){
		touch.on('.item', 'touchstart', function(ev){
//			ev.preventDefault();
		});
		$(".item").each(function(i){
			touch.on(this, 'swiperight', function(ev){
				$("#carousel-example-generic").carousel('prev');
			});
			
			touch.on(this, 'swipeleft', function(ev){
				$("#carousel-example-generic").carousel('next');
			});
		});
       
       //开始解析数据
       //二次加载
       if(OrderInfo.provinceInfo.reloadFlag=="N"){
			var custOrderList = OrderInfo.reloadOrderInfo.orderList.custOrderList[0].busiOrder;
			$.each(custOrderList,function(){
				if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="1"){//纳入新成员
					//选号
					$("#nbr_btn_"+this.data.boProdAns[0].prodId).val(this.busiObj.accessNumber);
					var boProdAns={
							prodId : this.data.boProdAns[0].prodId, //从填单页面头部div获取
							accessNumber : this.data.boProdAns[0].accessNumber, //接入号
							anChooseTypeCd : this.data.boProdAns[0].anChooseTypeCd, //接入号选择方式,自动生成或手工配号，默认传2
							anId : this.data.boProdAns[0].anId, //接入号ID
							pnLevelId:this.data.boProdAns[0].pnLevelId,
							anTypeCd : this.data.boProdAns[0].anTypeCd, //号码类型
							state : this.data.boProdAns[0].state, //动作	,新装默认ADD	
							areaId:this.data.boProdAns[0].areaId,
							areaCode:this.data.boProdAns[0].areaCode,
							memberRoleCd:this.data.boProdAns[0].memberRoleCd,
							preStore:this.data.boProdAns[0].preStore,
							minCharge:this.data.boProdAns[0].minCharge
						};
					OrderInfo.boProdAns.push(boProdAns);
					order.dealer.changeAccNbr(this.data.boProdAns[0].prodId,this.data.boProdAns[0].accessNumber);//选号玩要刷新发展人管理里面的号码
					//uim卡校验
					$("#uim_check_btn_"+this.data.bo2Coupons[0].prodId).attr("disabled",true);
					$("#uim_release_btn_"+this.data.bo2Coupons[0].prodId).removeClass("disabled");
					$("#uim_txt_"+this.data.bo2Coupons[0].prodId).attr("disabled",true);
					$("#uim_txt_"+this.data.bo2Coupons[0].prodId).val(this.data.bo2Coupons[0].terminalCode);
					var coupon = {
							couponUsageTypeCd : this.data.bo2Coupons[0].couponUsageTypeCd, //物品使用类型
							inOutTypeId : this.data.bo2Coupons[0].inOutTypeId,  //出入库类型
							inOutReasonId : this.data.bo2Coupons[0].inOutReasonId, //出入库原因
							saleId : this.data.bo2Coupons[0].saleId, //销售类型
							couponId : this.data.bo2Coupons[0].couponId, //物品ID
							couponinfoStatusCd : this.data.bo2Coupons[0].couponinfoStatusCd, //物品处理状态
							chargeItemCd : this.data.bo2Coupons[0].chargeItemCd, //物品费用项类型
							couponNum : this.data.bo2Coupons[0].couponNum, //物品数量
							storeId : this.data.bo2Coupons[0].storeId, //仓库ID
							storeName : this.data.bo2Coupons[0].storeName, //仓库名称
							agentId : this.data.bo2Coupons[0].agentId, //供应商ID
							apCharge : this.data.bo2Coupons[0].apCharge, //物品价格
							couponInstanceNumber : this.data.bo2Coupons[0].couponInstanceNumber, //物品实例编码
							terminalCode : this.data.bo2Coupons[0].terminalCode,//前台内部使用的UIM卡号
							ruleId : this.data.bo2Coupons[0].ruleId, //物品规则ID
							partyId : this.data.bo2Coupons[0].partyId, //客户ID
							prodId :  this.data.bo2Coupons[0].prodId, //产品ID
							offerId : this.data.bo2Coupons[0].offerId, //销售品实例ID
							state : this.data.bo2Coupons[0].state, //动作
							relaSeq : this.data.bo2Coupons[0].relaSeq //关联序列	
						};
					OrderInfo.clearProdUim(this.busiObj.instId);
					OrderInfo.boProd2Tds.push(coupon);
					//封装付费方式
					$("select[name='pay_type_-1'] option[value='"+this.data.boProdFeeTypes[0].feeType+"']").attr("selected","selected");
				}
			});
    	   offerChangeNew.showOffer();
       }
	};
	
	//套餐变更提交组织报文
	var _changeOffer = function(busiOrders){
		_createDelOffer(busiOrders,OrderInfo.offer); //退订主销售品
		_createMainOffer(busiOrders,OrderInfo.offer); //订购主销售品	
		AttachOffer.setAttachBusiOrder(busiOrders);  //订购退订附属销售品
		if(CONST.getAppDesc()==0){ //4g系统需要,补换卡 
			if(ec.util.isArray(OrderInfo.offer.offerMemberInfos)){ //遍历主销售品构成
				$.each(OrderInfo.offer.offerMemberInfos,function(){
					if(this.objType==CONST.OBJ_TYPE.PROD && this.prodClass==CONST.PROD_CLASS.THREE && OrderInfo.offerSpec.is3G=="N"){//补换卡
						if(OrderInfo.boProd2Tds.length>0){
							var prod = {
								prodId : this.objInstId,
								prodSpecId : this.objId,
								accessNumber : this.accessNumber,
								isComp : "N",
								boActionTypeCd : CONST.BO_ACTION_TYPE.CHANGE_CARD
							};
							var busiOrder = OrderInfo.getProdBusiOrder(prod);
							if(busiOrder){
								busiOrders.push(busiOrder);
							}
						}
					}
				});
			}
		}
	};
			
	//创建退订主销售品节点
	var _createDelOffer = function(busiOrders,offer){	
		offer.offerTypeCd = 1;
		offer.boActionTypeCd = CONST.BO_ACTION_TYPE.DEL_OFFER;
		var prodInfo = order.prodModify.choosedProdInfo;
		OrderInfo.getOfferBusiOrder(busiOrders,offer, prodInfo.prodInstId);
	};
	
	//创建主销售品节点
	var _createMainOffer = function(busiOrders,offer) {
		var prod = order.prodModify.choosedProdInfo;
		var offerSpec = OrderInfo.offerSpec;
		var busiOrder = {
			areaId : OrderInfo.getProdAreaId(prod.prodInstId),  //受理地区ID
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				instId : OrderInfo.SEQ.offerSeq--, //业务对象实例ID
				objId : offerSpec.offerSpecId,  //业务规格ID
				offerTypeCd : "1", //1主销售品
				accessNumber : prod.accNbr  //接入号码
			},  
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.OFFER_ACTION,
				boActionTypeCd : CONST.BO_ACTION_TYPE.BUY_OFFER
			}, 
			data:{
				ooRoles : [],
				ooOwners : [{
					partyId : OrderInfo.cust.custId, //客户ID
					state : "ADD" //动作
				}]
			}
		};
		//遍历主销售品构成
		$.each(offerSpec.offerRoles,function(){
			var offerRole = this;
			if(this.prodInsts!=undefined){
				$.each(this.prodInsts,function(){
					var ooRoles = {
						objId : this.objId, //业务规格ID
						objInstId : this.prodInstId, //业务对象实例ID,新装默认-1
						objType : this.objType, // 业务对象类型
						offerRoleId : offerRole.offerRoleId, //销售品角色ID
						state : "ADD" //动作
					};
					busiOrder.data.ooRoles.push(ooRoles);
				});
			}
		});

		//销售参数节点
		if(ec.util.isArray(offerSpec.offerSpecParams)){  
			busiOrder.data.ooParams = [];
			for (var i = 0; i < offerSpec.offerSpecParams.length; i++) {
				var param = offerSpec.offerSpecParams[i];
				var ooParam = {
	                itemSpecId : param.itemSpecId,
	                offerParamId : OrderInfo.SEQ.paramSeq--,
	                offerSpecParamId : param.offerSpecParamId,
	                value : param.value,
	                state : "ADD"
	            };
	            busiOrder.data.ooParams.push(ooParam);
			}				
		}
		
		//销售生失效时间节点
		if(offerSpec.ooTimes !=undefined ){
			busiOrder.data.ooTimes = [];
			busiOrder.data.ooTimes.push(offerSpec.ooTimes);
		}
		
		//发展人
		busiOrder.data.busiOrderAttrs = [];
		var $tr = $("li[name='tr_"+OrderInfo.offerSpec.offerSpecId+"']");
		if($tr!=undefined){
			$tr.each(function(){   //遍历产品有几个发展人
				var dealer = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
					role : $(this).find("select").val(),
					value : $(this).find("input").attr("staffid") 
				};
				busiOrder.data.busiOrderAttrs.push(dealer);
			});
		}
		busiOrders.push(busiOrder);
	};
	
	//填单页面切换
	var _changeTab = function(prodId) {
		/*
		$.each($("#tab_"+prodId).parent().find("li"),function(){
			$(this).removeClass("setcon");
			$("#attach_tab_"+$(this).attr("prodId")).hide();
			$("#uimDiv_"+$(this).attr("prodId")).hide();
		});
		$("#tab_"+prodId).addClass("setcon");
		$("#attach_tab_"+prodId).show();
		if(AttachOffer.isChangeUim(prodId)){
			$("#uimDiv_"+prodId).show();
		}
		*/
	};
	
	//省里校验单
	var _checkOrder = function(prodId){
		if(OrderInfo.actionFlag==3){
			_getAttachOfferInfo();
		}else{
			_getChangeInfo();
		}
		var data = query.offer.updateCheckByChange(JSON.stringify(OrderInfo.orderData));
		OrderInfo.orderData.orderList.custOrderList[0].busiOrder = []; //校验完清空	
		if(data==undefined){
			return false;
		}
		if(data.resultCode==0 && ec.util.isObj(data.result)){ //预校验成功
			offerChange.resultOffer = data.result;
		}else {
			$.alert("预校验规则限制",data.resultMsg);
			offerChange.resultOffer = {}; 
			return false;
		}
		return true;
	};
	
	//3G套餐订购4G流量包时预校验的入参封装
	var _getAttachOfferInfo=function(){
		OrderInfo.getOrderData(); //获取订单提交节点	
		OrderInfo.orderData.orderList.orderListInfo.partyId = OrderInfo.cust.custId;
		var busiOrders = OrderInfo.orderData.orderList.custOrderList[0].busiOrder;//获取业务对象数组
		//遍历已开通附属销售品列表
		for ( var i = 0; i < AttachOffer.openList.length; i++) {
			var open = AttachOffer.openList[i];
			for ( var j = 0; j < open.specList.length; j++) {  //遍历当前产品下面的附属销售品
				var spec = open.specList[j];
				if(spec.isdel != "Y" && spec.isdel != "C" && spec.ifPackage4G=="Y"){  //订购的附属销售品
					spec.offerTypeCd = 2;
					spec.boActionTypeCd = CONST.BO_ACTION_TYPE.BUY_OFFER;
					spec.offerId = OrderInfo.SEQ.offerSeq--; 
					OrderInfo.getOfferBusiOrder(busiOrders,spec,open.prodId);	
				}
			}
		}
		$.each(busiOrders,function(){
			this.busiObj.state="ADD";
		});
	};
	
	//把旧套餐的产品自动匹配到新套餐中，由于现在暂时只支持主副卡跟单产品，所以可以自动匹配
	var _setChangeOfferSpec = function(memberNum,viceNum){
		if(memberNum==1){ //单产品变更
			var offerRole = getOfferRole();
			if(offerRole==undefined){
				alert("错误提示","无法变更到该套餐");
				return false;
			}
			offerRole.prodInsts = [];
			var flag=false;
			$.each(offerRole.roleObjs,function(){
				if(this.objType==CONST.OBJ_TYPE.PROD){
					var roleObj = this;
					flag=false;
					$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
						if(this.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
							if(roleObj.objId!=this.objId){
								$.alert("规则限制","新套餐【"+roleObj.offerRoleName+"】角色的规格ID【"+roleObj.objId+"】和旧套餐【"+this.roleName+"】角色的规格ID【"+this.objId+"】不一样");
								flag=true;
								return false;
							}
							roleObj.prodInstId = this.objInstId;
							roleObj.accessNumber = this.accessNumber;
							offerRole.prodInsts.push(roleObj);
						}
					});
					if(flag){
						return false;
					}
				}
			});
			if(flag){
				return false;
			}
		}else{  //多成员角色
			for (var i = 0; i < OrderInfo.offer.offerMemberInfos.length; i++) {
				var offerMember = OrderInfo.offer.offerMemberInfos[i];
				if(offerMember.objType==CONST.OBJ_TYPE.PROD){
					var flag = true;
					for (var j = 0; j < OrderInfo.offerSpec.offerRoles.length; j++) {
						var offerRole = OrderInfo.offerSpec.offerRoles[j];
						if(offerMember.roleCd==offerRole.memberRoleCd){ //旧套餐对应新套餐角色
							for (var k = 0; k < offerRole.roleObjs.length; k++) {
								var roleObj = offerRole.roleObjs[k];
								if(roleObj.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
									if(roleObj.objId!=offerMember.objId){
										$.alert("规则限制","新套餐【"+roleObj.offerRoleName+"】角色的规格ID【"+roleObj.objId+"】和旧套餐【"+offerMember.roleName+"】角色的规格ID【"+offerMember.objId+"】不一样");
										return false;
									}
									if(!ec.util.isArray(offerRole.prodInsts)){
										offerRole.prodInsts = [];
									}
									var newObject = jQuery.extend(true, {}, roleObj); 
									newObject.prodInstId = offerMember.objInstId;
									newObject.accessNumber = offerMember.accessNumber;
									newObject.memberRoleCd = offerMember.roleCd;
									offerRole.prodInsts.push(newObject);
									if(offerRole.prodInsts.length>roleObj.maxQty){
										$.alert("规则限制","新套餐【"+offerRole.offerRoleName+"】角色最多可以办理数量为"+roleObj.maxQty+",而旧套餐数量大于"+roleObj.maxQty);
										return false;
									}
									break;
								}
							}
							flag = false;
							break;
						}
					}
					if(flag){
						alert("旧套餐【"+offerMember.roleName+"】角色在新套餐中不存在，无法变更");
						//$.alert("规则限制","旧套餐【"+offerMember.roleName+"】角色在新套餐中不存在，无法变更");
						return false;
					}
				}
			}
		}
		return true;
	};
	
	//获取单产品变更自动匹配的角色
	var getOfferRole = function(){
		//新套餐是主副卡,获取主卡角色
		for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
			var offerRole = OrderInfo.offerSpec.offerRoles[i];
			if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD){  //主卡
				return offerRole;
			}
		}
		//新套餐不是主副卡，返回第一个包含接入产品的角色
		for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
			var offerRole = OrderInfo.offerSpec.offerRoles[i];
			for (var j = 0; j < offerRole.roleObjs.length; j++) {
				var roleObj = offerRole.roleObjs[j];
				if(roleObj.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
					return offerRole;
				}
			}
		}
	};
	
	//获取套餐变更节点
	var _getChangeInfo = function(){
		OrderInfo.getOrderData(); //获取订单提交节点	
		OrderInfo.orderData.orderList.orderListInfo.partyId = OrderInfo.cust.custId;
		OrderInfo.orderData.orderList.orderListInfo.areaId = OrderInfo.cust.areaId;
		var busiOrders = OrderInfo.orderData.orderList.custOrderList[0].busiOrder;//获取业务对象数组
		_createDelOffer(busiOrders,OrderInfo.offer); //退订主销售品
		_createMainOffer(busiOrders,OrderInfo.offer); //订购主销售品	
	};
	
	
	
	
	//根据省内返回的数据校验
	var _checkOfferProd = function(){
		if(offerChange.resultOffer==undefined){
			return;
		}
		//功能产品
		var prodInfos = offerChange.resultOffer.prodInfos;
		if(ec.util.isArray(prodInfos)){
			$.each(prodInfos,function(){
				var prodId = this.accProdInstId;
				//容错处理，省份接入产品实例id传错
				var flag = true;
				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
					if(this.objType==CONST.OBJ_TYPE.PROD && this.objInstId==prodId){  //接入类产品
						flag = false;
						return false;
					}
				});
				if(flag){
					return true;
				}
				if(prodId!=this.prodInstId){ //功能产品
					var serv = CacheData.getServ(prodId,this.prodInstId);
					if(this.state=="DEL"){
						if(serv!=undefined){
							var $dd = $("#li_"+prodId+"_"+this.prodInstId);
							if(ec.util.isObj($dd)){
								var $span = $("#span_"+prodId+"_"+this.prodInstId);
								var $span_remove = $("#span_remove_"+prodId+"_"+this.prodInstId);
								if(ec.util.isObj($span)){
									$span.addClass("del");
								}
								if(ec.util.isObj($span_remove)){
									$span_remove.hide();
								}
								$dd.removeAttr("onclick");
								serv.isdel = "Y";
							}
						}	
					}else if(this.state=="ADD"){
						if(serv!=undefined){  //在已开通里面，修改不让关闭
							var $dd = $("#li_"+prodId+"_"+this.prodInstId);
							if(ec.util.isObj($dd)){
								var $span = $("#span_"+prodId+"_"+this.prodInstId);
								var $span_remove = $("#span_remove_"+prodId+"_"+this.prodInstId);
								if(ec.util.isObj($span)){
									$span.removeClass("del");
								}
								if(ec.util.isObj($span_remove)){
									$span_remove.hide();
								}
								$dd.removeAttr("onclick");
								serv.isdel = "N";
							}
						}else{
							var servSpec = CacheData.getServSpec(prodId,this.productId); //已开通里面查找
							if(servSpec!=undefined){
								var $dd = $("#li_"+prodId+"_"+this.productId);
								if(ec.util.isObj($dd)){
									var $span = $("#span_"+prodId+"_"+this.productId);
									var $span_remove = $("#span_remove_"+prodId+"_"+this.productId);
									if(ec.util.isObj($span)){
										$span.removeClass("del");
									}
									if(ec.util.isObj($span_remove)){
										$span_remove.hide();
									}
									$dd.removeAttr("onclick");
									servSpec.isdel = "N";
								}
								
								$("#del_"+prodId+"_"+this.productId).hide();
							}else {
								if(this.productId!=undefined && this.productId!=""){
									//AttachOffer.addOpenServList(prodId,this.productId,this.prodName,this.ifParams);
									AttachOffer.openServSpec(prodId,this.productId);
								}
							}
						}
					}
				}
			});
		}
		
		//可选包
		var offers = offerChange.resultOffer.prodOfferInfos;
		if(ec.util.isArray(offers)){
			if(ec.util.isArray(OrderInfo.offer.offerMemberInfos)){//多产品套餐
				$.each(OrderInfo.offer.offerMemberInfos,function(){
					var prodId = this.objInstId;
					$.each(offers,function(){
						if(this.memberInfo==undefined){
							return true;
						}
						var offer = CacheData.getOffer(prodId,this.prodOfferInstId); //已开通里面查找
						var flag = true;
						$.each(this.memberInfo,function(){  //寻找该销售品属于哪个产品
							if(prodId == this.accProdInstId){		
								if(ec.util.isObj(offer)){
									this.prodId = this.accProdInstId;
								}
								flag = false;
								return false;
							}
						});
						if(flag){
							return true;
						}
						if(this.state=="DEL"){
							if(offer!=undefined){
								var $dd = $("#li_"+prodId+"_"+this.prodOfferInstId);
								if(ec.util.isObj($dd)){
									var $span = $("#span_"+prodId+"_"+this.prodOfferInstId);
									var $span_remove = $("#span_remove_"+prodId+"_"+this.prodOfferInstId);
									if(ec.util.isObj($span)){
										$span.addClass("del");
									}
									if(ec.util.isObj($span_remove)){
										$span_remove.hide();
									}
									$dd.removeAttr("onclick");
									offer.isdel = "N";
								}
								offer.isdel = "Y";
								if(this.isRepeat!="Y"){//如果可选包下面有多个接入类产品，到时候只拼一个退订节点
									this.isRepeat="Y";
								}else{
									offer.isRepeat="Y";
								}
							}	
						}else if(this.state=="ADD"){
							if(offer!=undefined){ //在已开通里面，修改不让关闭
								var $dd = $("#li_"+prodId+"_"+this.prodOfferInstId);
								if(ec.util.isObj($dd)){
									var $span = $("#span_"+prodId+"_"+this.prodOfferInstId);
									var $span_remove = $("#span_remove_"+prodId+"_"+this.prodOfferInstId);
									if(ec.util.isObj($span)){
										$span.removeClass("del");
									}
									if(ec.util.isObj($span_remove)){
										$span_remove.hide();
									}
									$dd.removeAttr("onclick");
									offer.isdel = "N";
								}
							}else{
								var offerSpec = CacheData.getOfferSpec(prodId,this.prodOfferId); //已开通里面查找
								if(offerSpec!=undefined){
									var $dd = $("#li_"+prodId+"_"+this.prodOfferId);
									if(ec.util.isObj($dd)){
										var $span = $("#span_"+prodId+"_"+this.prodOfferId);
										var $span_remove = $("#span_remove_"+prodId+"_"+this.prodOfferId);
										if(ec.util.isObj($span)){
											$span.removeClass("del");
										}
										if(ec.util.isObj($span_remove)){
											$span_remove.hide();
										}
										$dd.removeAttr("onclick");
										offerSpec.isdel = "N";
									}
								}else {
									if(ec.util.isObj(this.prodOfferId) && this.prodOfferId!=OrderInfo.offerSpec.offerSpecId){
										//AttachOffer.addOpenList(prodId,this.prodOfferId);			
										AttachOffer.addOfferSpecByCheck(prodId,this.prodOfferId);
									}
								}
							}
						}
					});
				});
			}
		}
	};
	
    //解析二次加载数据
	//解析数据
	var _showOffer=function(){
        var isReload=OrderInfo.provinceInfo.reloadFlag;
		
		var orderInfo=OrderInfo.reloadOrderInfo;
		//0是正确的，进行信息重新加载
		var resultCode="0";//orderInfo.resultCode;
		var resultMsg=orderInfo.resultMsg;
		if(resultCode=="0"){
			
			//进行进行数据解析工作,获取产品数据
			var custOrderList=orderInfo.orderList.custOrderList;
			
			var orderListInfo=orderInfo.orderList.orderListInfo;
			
			if(custOrderList!=null && custOrderList!=""){
				//获取下属的产品
				if(custOrderList!=null && custOrderList.length>0){
					$(custOrderList).each(function(i,custOrder) { 
						
						//先把删除的开通功能进行删除操作
						$(custOrder.busiOrder).each(function(i,busiOrder) { 
							//解析到具体的订购产品数据
							//获取产品操作类型
							var boActionTypeCd=busiOrder.boActionType.boActionTypeCd;
							
							//获取产品的操作状态,state,del-删除,add-添加
							var state="";
							var data=busiOrder.data;
							var ooOwners;
							var boServs;
							
							// 7是已开通功能，状态的获取和其他类型获取不一样
							if(boActionTypeCd=="7"){
								boServs=data.boServs;
								
								if(boServs!=null){
									$(boServs).each(function(i,boServ) { 
										state=boServ.state;
									});
								}
							}
							
							var busiObj=busiOrder.busiObj;
							
							if(boActionTypeCd=="7"){
								//7是已开通功能产品
								//获取唯一ID标识
								var instId=busiObj.instId;
								
								var boServOrders=data.boServOrders;
								
								$(data.boServs).each(function(i,boServ) { 
									var servId=boServ.servId;
									var state=boServ.state;
									if(state=="DEL"){
										_closeServ(instId,servId);
									}
								});
							}
						});
					});
					
					$(custOrderList).each(function(i,custOrder) { 
						$(custOrder.busiOrder).each(function(i,busiOrder) { 
							//解析到具体的订购产品数据
							//获取产品操作类型
							var boActionTypeCd=busiOrder.boActionType.boActionTypeCd;
							
							//获取产品的操作状态,state,del-删除,add-添加
							var state="";
							
							var data=busiOrder.data;
							
							var ooOwners;
							var boServs;
							
							// 7是已开通功能，状态的获取和其他类型获取不一样
							if(boActionTypeCd=="7"){
								boServs=data.boServs;
								
								if(boServs!=null){
									$(boServs).each(function(i,boServ) { 
										state=boServ.state;
									});
								}
							}else{
								ooOwners=data.ooOwners;
								if(ooOwners!=null){
									$(ooOwners).each(function(i,ooOwner) { 
										state=ooOwner.state;
										return false
									});
								}
							}
							
							var busiObj=busiOrder.busiObj;
							
							//S2是已订购可选包
							if(boActionTypeCd=="S2" && busiObj.offerTypeCd=="2"){
								//获取唯一ID标识
								var instId=busiObj.instId;
								
//								$(data.ooRoles).each(function(i,ooRole) { 
									
									if(state=="DEL"){
										var objInstId="";
										for(var j=0;j<OrderInfo.oldoffer.length;j++){
											var oldOffer = OrderInfo.oldoffer[j];
											for ( var i = 0; i < oldOffer.offerMemberInfos.length; i++) {
												var oldOfferMember = oldOffer.offerMemberInfos[i];
												if(oldOfferMember.accessNumber==busiOrder.busiObj.accessNumber){
													objInstId = oldOfferMember.objInstId;
													break;
												}
											}
										}
										$.each(OrderInfo.offer.offerMemberInfos,function(){
											if(this.accessNumber==busiOrder.busiObj.accessNumber){
												objInstId = this.objInstId;
												return false;
											}
										});
										_delOffer(objInstId,instId);
									}
//								});
							}else if(boActionTypeCd=="7"){
								
								//7是已开通功能产品
								//获取唯一ID标识
								var instId=busiObj.instId;
								
								var boServOrders=data.boServOrders;
								
								$(data.boServs).each(function(i,boServ) { 
									var servId=boServ.servId;
									var state=boServ.state;
									
									if(state=="ADD"){
										$(boServOrders).each(function(i2,boServOrder) {
											var servSpecId=boServOrder.servSpecId;
											var servSpecName=boServOrder.servSpecName;
											_openServSpec(instId,servSpecId,servSpecName,'N');
										});
									}
								});
								
							}else if(boActionTypeCd=="S1"){
								//S1是订单中的已选可选包数据
								//获取唯一ID标识
								var objId=busiObj.objId;
								var accessNumber=busiObj.accessNumber;
								var objName=busiObj.objName;
								var prodId=null;
								var offerTypeCd=this.busiObj.offerTypeCd;
								
								var ooRoles=data.ooRoles;
								var busiOrderAttrs=data.busiOrderAttrs;
								var zdDatas=busiOrder.data;    //终端
								$(data.ooRoles).each(function(i,ooRole) { 
									prodId=ooRole.prodId;
									return false;
								});
								
								if(busiObj.offerTypeCd=="2"){
									//重载订单中已经选择的服务
									_addOfferSpecSub(prodId,objId,ooRoles);
									
									//解析终端串码
									if(busiOrder.boActionType.actionClassCd=="1200" && busiOrder.boActionType.boActionTypeCd=="S1" && busiOrder.busiObj.offerTypeCd=="2"){
										if(zdDatas.bo2Coupons!=undefined){
											//开始解析终端
											for(var i=0;i<zdDatas.bo2Coupons.length;i++){
												var bo2Coupons = zdDatas.bo2Coupons[i];
												if(bo2Coupons.num==undefined){
													bo2Coupons.num=i+1;
												}
												$("#terminalText_"+bo2Coupons.prodId+"_"+bo2Coupons.attachSepcId+"_"+bo2Coupons.num).val(bo2Coupons.couponInstanceNumber);
												offerChangeNew.checkTerminalCode(bo2Coupons.prodId,bo2Coupons.attachSepcId,bo2Coupons.num,"0");
											}
										}
									}
								}
								
								//套餐变更APP是有发展人的,以下是发展人数据
								if(busiOrder.data.busiOrderAttrs!=undefined){
									var dealerMap1 = {};
									var dealerMap2 = {};
									var dealerMap3 = {};
									$.each(busiOrder.data.busiOrderAttrs,function(){
										if(this.role=="40020005"){
											dealerMap1.role = this.role;
											if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER){
												dealerMap1.staffid = this.value;
												dealerMap1.channelNbr = this.channelNbr;
											}else if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER_NAME){
												dealerMap1.staffname = this.value;
											}
											dealerMap1.objInstId=objId;
											dealerMap1.accessNumber=accessNumber;
											dealerMap1.objName=objName;
											dealerMap1.prodId=prodId;
											dealerMap1.offerTypeCd=offerTypeCd;
										}else if(this.role=="40020006"){
											dealerMap2.role = this.role;
											if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER){
												dealerMap2.staffid = this.value;
												dealerMap2.channelNbr = this.channelNbr;
											}else if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER_NAME){
												dealerMap2.staffname = this.value;
											}
											dealerMap2.objInstId=objId;
											dealerMap2.accessNumber=accessNumber;
											dealerMap2.objName=objName;
											dealerMap2.prodId=prodId;
											dealerMap2.offerTypeCd=offerTypeCd;
										}else if(this.role=="40020007"){
											dealerMap3.role = this.role;
											if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER){
												dealerMap3.staffid = this.value;
												dealerMap3.channelNbr = this.channelNbr;
											}else if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER_NAME){
												dealerMap3.staffname = this.value;
											}
											dealerMap3.objInstId=objId;
											dealerMap3.accessNumber=accessNumber;
											dealerMap3.objName=objName;
											dealerMap3.prodId=prodId;
											dealerMap3.offerTypeCd=offerTypeCd;
										}										
									});
									
									if(ec.util.isObj(dealerMap1.role)){
										OrderInfo.reloadProdInfo.dealerlist.push(dealerMap1);
									}
									
									if(ec.util.isObj(dealerMap2.role)){
										OrderInfo.reloadProdInfo.dealerlist.push(dealerMap2);
									}
									
									if(ec.util.isObj(dealerMap3.role)){
										OrderInfo.reloadProdInfo.dealerlist.push(dealerMap3);
									}
								}
							}else if(boActionTypeCd=="14"){								
								var bo2Coupons=busiOrder.data.bo2Coupons
								for(var i=0;i<bo2Coupons.length;i++){
									if(bo2Coupons[i].state=="ADD"){
										//uim卡号  //uim_txt_140029724038
										var card=bo2Coupons[i].couponInstanceNumber;
										//prodId
										var id=bo2Coupons[i].prodId;
										
										$("#uim_txt_"+id).val(card);//填充卡号
										offerChangeNew.checkUim(id,bo2Coupons[i]);

									}
								}
							}
							
						});
					});
				}
			}
			
			//退订功能产品
			$.each(AttachOffer.openServList,function(){
				var openmap = this;
				$.each(this.servSpecList,function(){
					var offermap = this;
					var offerflag = false;
					var custOrderLists=custOrderList[0];
					$.each(custOrderLists.busiOrder,function(){
						var obj=this;
						if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="7"){
							if(offermap.servSpecId==this.data.boServOrders[0].servSpecId && openmap.prodId==this.busiObj.instId){
								offerflag = true;
								return false;
							}
						}
					});
					if(!offerflag){
						var $span = $("#li_"+openmap.prodId+"_"+this.servSpecId).find("span"); //定位删除的附属
						var spec = CacheData.getServSpec(openmap.prodId,this.servSpecId);
						if(spec == undefined){ //没有在已开通附属销售列表中
							return;
						}
						$span.addClass("del");
						spec.isdel = "Y";
						AttachOffer.showHideUim(1,openmap.prodId,this.servSpecId);   //显示或者隐藏
						var serv = CacheData.getServBySpecId(openmap.prodId,this.servSpecId);
						if(ec.util.isObj(serv)){ //没有在已开通附属销售列表中
							$span.addClass("del");
							serv.isdel = "Y";
						}
					}
				});
			});
			
			//订单备注和模版等加载
			if(orderListInfo!=null && custOrderList!=null){
				var custOrderAttrs=orderListInfo.custOrderAttrs;
				var isTemplateOrder=orderListInfo.isTemplateOrder;
				var templateOrderName=orderListInfo.templateOrderName;
				
				$(custOrderAttrs).each(function(i,custOrderAttr) { 
					var itemSpecId=custOrderAttr.itemSpecId;
					
					//111111118是为备注的编码
					if(itemSpecId=="111111118"){
						var value=custOrderAttr.value;
						if(value!=null && value!=""){
							//$("#order_remark").val(value);
							OrderInfo.reloadProdInfo.orderMark = this.value;
						}
					}
				});
				
				//模版的操作
				if(isTemplateOrder=="Y"){
					$("#isTemplateOrder").click();//选中模版按钮
					
					SoOrder.showTemplateOrderName();//显示模版名称输入
					
					$("#templateOrderName").val(templateOrderName);//赋值模版名称
				}
			}
		}
	};
	//把选中的服务保存到销售品规格中
	//把选中的服务保存到销售品规格中 第二步
	var _setServ2OfferSpec = function(prodId,offerSpec,roles){
		if(offerSpec!=undefined){
			$.each(offerSpec.offerRoles,function(){
				$.each(this.roleObjs,function(){
					var nowProd=prodId+"_"+this.objId;
					
					$(roles).each(function(i,role) { 
						var oldProd=role.prodId+"_"+role.objId;
							
						if(nowProd==oldProd){
							this.selQty = 1;
							return false;
						}else{
							this.selQty = 2;
						}
					});
				});
			});
		}
	};
	
	//开通功能产品new
	var _openServSpec = function(prodId,servSpecId,specName,ifParams){
		var servSpec = CacheData.getServSpec(prodId,servSpecId); //在已选列表中查找
		if(servSpec==undefined){   //在可订购功能产品里面 
			var newSpec = {
				objId : servSpecId, //调用公用方法使用
				servSpecId : servSpecId,
				servSpecName : specName,
				ifParams : ifParams,
				isdel : "C"   //加入到缓存列表没有做页面操作为C
			};
			var inPamam = {
				prodSpecId:servSpecId
			};
			if(ifParams == "Y"){
				var data = query.prod.prodSpecParamQuery(inPamam);// 产品功能产品属性
				if(data==undefined || data.result==undefined){
					return;
				}
				newSpec.prodSpecParams = data.result.prodSpecParams;
			if(servSpecId==CONST.YZFservSpecId){//翼支付助手根据付费类型改变默认值
				var feeType = $("select[name='pay_type_-1']").val();
				if(feeType==undefined) feeType = order.prodModify.choosedProdInfo.feeType;
				if(feeType == CONST.PAY_TYPE.AFTER_PAY){
					for ( var j = 0; j < newSpec.prodSpecParams.length; j++) {
						var prodSpecParam = newSpec.prodSpecParams[j];
						prodSpecParam.setValue = "";
					}																			
				}else{
					for ( var j = 0; j < newSpec.prodSpecParams.length; j++) {							
						var prodSpecParam = newSpec.prodSpecParams[j];
						if (prodSpecParam.value!="") {
							prodSpecParam.setValue = prodSpecParam.value;
						} else if (!!prodSpecParam.valueRange[0]&&prodSpecParam.valueRange[0].value!="")
							//默认值为空则取第一个
							prodSpecParam.setValue = prodSpecParam.valueRange[0].value;
				}
			  }
			}
			}
			CacheData.setServSpec(prodId,newSpec); //添加到已开通列表里
			servSpec = newSpec;
		}
		
		_checkServExcludeDepend(prodId,servSpec);
	};
	//校验服务的互斥依赖
	var _checkServExcludeDepend = function(prodId,serv,flag){
		var servSpecId = serv.servSpecId;
		var param = CacheData.getExcDepServParam(prodId,servSpecId);
		if(param.orderedServSpecIds.length == 0){
			AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams);
		}else{
			var data = query.offer.queryExcludeDepend(param);  //查询规则校验
			if(data!=undefined){
				paserServData(data.result,prodId,serv);//解析数据
			}
		}
	};
	//解析服务互斥依赖
	var paserServData = function(result,prodId,serv){
		var servSpecId = serv.servSpecId;
		var servExclude = result.servSpec.exclude; //互斥
		var servDepend = result.servSpec.depend; //依赖
		var servRelated = result.servSpec.related; //连带
		var content = "";
		//转换接口返回的互斥依赖
		var param = {  
			excludeServ : [],  //互斥依赖显示列表
			dependServ : [], //存放互斥依赖列表
			relatedServ : [] //连带
		};
		
		//解析功能产品互斥
		if(ec.util.isArray(servExclude)){
			$.each(servExclude,function(){
				var servList = CacheData.getServList(prodId); //互斥要去除已订购手动删除
				var flag = true;
				if(servList!=undefined){
					for ( var i = 0; i < servList.length; i++) {
						if(servList[i].isdel=="Y"){
							if(servList[i].servSpecId == this.servSpecId){  //返回互斥数组在已订购中删除，不需要判断
								flag = false;
								break;
							}
						}
					}
				}
				if(flag){
					content += "需要关闭：   " + this.servSpecName + "<br>";
					param.excludeServ.push(this);
				}
			});
		}
		//解析功能产品依赖
		if(ec.util.isArray(servDepend)){
			$.each(servDepend,function(){
				content += "需要开通：   " + this.servSpecName + "<br>";
				param.dependServ.push(this);
			});
		}
		//解析功能产品连带
		if(ec.util.isArray(servRelated)){
			$.each(servRelated,function(){
				content += "需要开通：   " + this.servSpecName + "<br>";
				param.relatedServ.push(this);
			});
		}
		if(content==""){ //没有互斥依赖
			AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams);
		}else{
			if(OrderInfo.provinceInfo.reloadFlag=="N"){
				AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams); //添加开通功能
				AttachOffer.excludeAddServ(prodId,servSpecId,param);
			}else{
				$.confirm("开通： " + serv.servSpecName,content,{ 
					yesdo:function(){
						AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams); //添加开通功能
						AttachOffer.excludeAddServ(prodId,servSpecId,param);
					},
					no:function(){
					}
				});
			}

		}
	};
	
	/**
	 * 检验buyChk的状态，改变选购类型及协助人控制,及下一步操作
	 */
	var _chkState=function(){
		if ("lj"==buyChk.buyType) {
			OrderInfo.actionFlag = 13;
			$("#treaty").hide();
			$("#agreementFie").hide();
			$("#phonenumberFie").hide();
			//$("#dealerMktDiv").show();
		} else if ("hy"==buyChk.buyType){
			OrderInfo.actionFlag = 14;
			//$("#dealerMktDiv").hide();
			$("#phonenumberFie").show();
		}

	};
	
	//二次加载附属业务数据信息 第一步
	var _addOfferSpecSub = function(prodId,offerSpecId,roles){
		var newSpec = _setSpec(prodId,offerSpecId);
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			return;
		}
		
		var content = CacheData.getOfferProdStr(prodId,newSpec,0);
		
		_setServ2OfferSpecSub(prodId,newSpec);
		
		_checkOfferExcludeDependSub(prodId,newSpec);
			
	};
	
	//二次加载附属业务数据信息 第一步
	var _addOfferSpec = function(prodId,offerSpecId,roles){
		var newSpec = _setSpec(prodId,offerSpecId);
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			return;
		}
		
		var content = CacheData.getOfferProdStr(prodId,newSpec,0);
		
		CacheData.setServ2OfferSpec(prodId,newSpec);
		AttachOffer.checkOfferExcludeDepend(prodId,newSpec);
		//_checkOfferExcludeDepend(prodId,newSpec);
			
	};
	
	//把选中的服务保存到销售品规格中 第二步
	var _setServ2OfferSpecSub = function(prodId,offerSpec,roles){
		if(offerSpec!=undefined){
			$.each(offerSpec.offerRoles,function(){
				$.each(this.roleObjs,function(){
					var nowProd=prodId+"_"+this.objId;
					
					$(roles).each(function(i,role) { 
						var oldProd=role.prodId+"_"+role.objId;
							
						if(nowProd==oldProd){
							this.selQty = 1;
							return false;
						}else{
							this.selQty = 2;
						}
					});
				});
			});
		}
	};
	
	//校验销售品的互斥依赖 第三步
	var _checkOfferExcludeDependSub = function(prodId,offerSpec){
		var offerSpecId = offerSpec.offerSpecId;
		var param = CacheData.getExcDepOfferParam(prodId,offerSpecId);
		var data = query.offer.queryExcludeDepend(param);//查询规则校验
		if(data!=undefined){
			paserOfferDataSub(data.result,prodId,offerSpecId,offerSpec.offerSpecName); //解析数据
		}
	};
	
	//解析互斥依赖返回结果
	var paserOfferDataSub = function(result,prodId,offerSpecId,specName){
		var content = "";
		//转换接口返回的互斥依赖
		var param = {  
				excludeOffer : [],   //互斥依赖显示列表
				defaultOffer : [], //默选的显示列表
				dependOffer : {  //存放互斥依赖列表
					dependOffers : [],
					offerGrpInfos : []
				}
		};
		if(result!=""){
			var exclude = result.offerSpec.exclude;
			var depend = result.offerSpec.depend;
			var defaultOffer=result.offerSpec.defaultList;
			//解析可选包互斥依赖组
			if(ec.util.isArray(exclude)){
				for (var i = 0; i < exclude.length; i++) {
					var offerList = CacheData.getOfferList(prodId); //互斥要去除已订购手动删除
					var flag = true;
					if(offerList!=undefined){
						for ( var j = 0; j < offerList.length; j++) {
							if(offerList[j].isdel=="Y"){
								if(offerList[j].offerSpecId == exclude[i].offerSpecId){  //返回互斥数组在已订购中删除，不需要判断
									flag = false;
									break;
								}
							}
						}
					}
					if(flag){
						content += "需要关闭：   " + exclude[i].offerSpecName + "<br>";
						param.excludeOffer.push(exclude[i].offerSpecId);
					}
				}
			}
			if(depend!=undefined && ec.util.isArray(depend.offerInfos)){
				for (var i = 0; i < depend.offerInfos.length; i++) {	
					content += "需要开通： " + depend.offerInfos[i].offerSpecName + "<br>";
					param.dependOffer.dependOffers.push(depend.offerInfos[i].offerSpecId);
				}	
			}
			if(depend!=undefined && ec.util.isArray(depend.offerGrpInfos)){
				for (var i = 0; i < depend.offerGrpInfos.length; i++) {
					var offerGrpInfo = depend.offerGrpInfos[i];
					param.dependOffer.offerGrpInfos.push(offerGrpInfo);
					content += "需要开通： 开通" + offerGrpInfo.minQty+ "-" + offerGrpInfo.maxQty+ "个以下业务:<br>";
					if(offerGrpInfo.subOfferSpecInfos!="undefined" && offerGrpInfo.subOfferSpecInfos.length>0){
						for (var j = 0; j < offerGrpInfo.subOfferSpecInfos.length; j++) {
							var subOfferSpec = offerGrpInfo.subOfferSpecInfos[j];
							var offerSpec=CacheData.getOfferSpec(prodId,subOfferSpec.offerSpecId);
							if(ec.util.isObj(offerSpec)){
								if(offerSpec.isdel!="Y"&&offerSpec.isdel!="C"){
									content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" disabled="disabled" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
								}else{
									content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
								}
							}else{
								var offerSpec=CacheData.getOfferBySpecId(prodId,subOfferSpec.offerSpecId);
								if(ec.util.isObj(offerSpec)){
									if(offerSpec.isdel!="Y"&&offerSpec.isdel!="C"){
										content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" disabled="disabled" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
									}else{
										content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
									}
								}else{
									content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
								}
							}
						}
					}
				}
			}
			//解析可选包默选组
			if(ec.util.isArray(defaultOffer)){
				for (var i = 0; i < defaultOffer.length; i++) {	
					content += "需要开通： " + defaultOffer[i].offerSpecName + "<br>";
					param.defaultOffer.push(defaultOffer[i].offerSpecId);
				}	
			}
		}
		//var serContent=_servExDepReByRoleObjs(prodId,offerSpecId);//查询销售品构成成员的依赖互斥以及连带
		//content=content+serContent;
		
		AttachOffer.addOpenList(prodId,offerSpecId); 
//		if(content==""){ //没有互斥依赖
//			AttachOffer.addOpenList(prodId,offerSpecId); 
//		}else{	
//			content = "<div style='max-height:300px;overflow:auto;'>" + content + "</div>";
//			
//			$("#packageHiddenDiv").html(content);
//			
//			_setOffer2ExcludeOfferSpecSub(param);
//			excludeAddattch(prodId,offerSpecId,param);
//			excludeAddServ(prodId,"",paramObj);
//		}
	};

	
	var _checkOfferExcludeDepend = function(prodId,offerSpec){
		var offerSpecId = offerSpec.offerSpecId;
		var param = CacheData.getExcDepOfferParam(prodId,offerSpecId);
		var data = query.offer.queryExcludeDepend(param);//查询规则校验
		if(data!=undefined){
			paserOfferData(data.result,prodId,offerSpecId,offerSpec.offerSpecName); //解析数据
		}
	};
	
	//解析互斥依赖返回结果
	var paserOfferData = function(result,prodId,offerSpecId,specName){
		var content = "";
		//转换接口返回的互斥依赖
		var param = {  
				excludeOffer : [],   //互斥依赖显示列表
				defaultOffer : [], //默选的显示列表
				dependOffer : {  //存放互斥依赖列表
					dependOffers : [],
					offerGrpInfos : []
				}
		};
		if(result!=""){
			var exclude = result.offerSpec.exclude;
			var depend = result.offerSpec.depend;
			var defaultOffer=result.offerSpec.defaultList;
			//解析可选包互斥依赖组
			if(ec.util.isArray(exclude)){
				for (var i = 0; i < exclude.length; i++) {
					var offerList = CacheData.getOfferList(prodId); //互斥要去除已订购手动删除
					var flag = true;
					if(offerList!=undefined){
						for ( var j = 0; j < offerList.length; j++) {
							if(offerList[j].isdel=="Y"){
								if(offerList[j].offerSpecId == exclude[i].offerSpecId){  //返回互斥数组在已订购中删除，不需要判断
									flag = false;
									break;
								}
							}
						}
					}
					if(flag){
						content += "需要关闭：   " + exclude[i].offerSpecName + "<br>";
						param.excludeOffer.push(exclude[i].offerSpecId);
					}
				}
			}
			if(depend!=undefined && ec.util.isArray(depend.offerInfos)){
				for (var i = 0; i < depend.offerInfos.length; i++) {	
					content += "需要开通： " + depend.offerInfos[i].offerSpecName + "<br>";
					param.dependOffer.dependOffers.push(depend.offerInfos[i].offerSpecId);
				}	
			}
			if(depend!=undefined && ec.util.isArray(depend.offerGrpInfos)){
				for (var i = 0; i < depend.offerGrpInfos.length; i++) {
					var offerGrpInfo = depend.offerGrpInfos[i];
					param.dependOffer.offerGrpInfos.push(offerGrpInfo);
					content += "需要开通： 开通" + offerGrpInfo.minQty+ "-" + offerGrpInfo.maxQty+ "个以下业务:<br>";
					if(offerGrpInfo.subOfferSpecInfos!="undefined" && offerGrpInfo.subOfferSpecInfos.length>0){
						for (var j = 0; j < offerGrpInfo.subOfferSpecInfos.length; j++) {
							var subOfferSpec = offerGrpInfo.subOfferSpecInfos[j];
							var offerSpec=CacheData.getOfferSpec(prodId,subOfferSpec.offerSpecId);
							if(ec.util.isObj(offerSpec)){
								if(offerSpec.isdel!="Y"&&offerSpec.isdel!="C"){
									content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" disabled="disabled" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
								}else{
									content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
								}
							}else{
								var offerSpec=CacheData.getOfferBySpecId(prodId,subOfferSpec.offerSpecId);
								if(ec.util.isObj(offerSpec)){
									if(offerSpec.isdel!="Y"&&offerSpec.isdel!="C"){
										content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" disabled="disabled" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
									}else{
										content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
									}
								}else{
									content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
								}
							}
						}
					}
				}
			}
			//解析可选包默选组
			if(ec.util.isArray(defaultOffer)){
				for (var i = 0; i < defaultOffer.length; i++) {	
					content += "需要开通： " + defaultOffer[i].offerSpecName + "<br>";
					param.defaultOffer.push(defaultOffer[i].offerSpecId);
				}	
			}
		}
		
		AttachOffer.addOpenList(prodId,offerSpecId); 

	};
	
	//关闭已订购功能产品
	var _closeServ = function(prodId,servId){
		var serv = CacheData.getServ(prodId,servId);
		var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
		 if("13409244"==serv.servSpecId){//一卡双号虚号
			$.alert("提示","请通过“一卡双号退订”入口或者短信入口退订此功能");
		}else{ //关闭
			$span.addClass("del");
			serv.isdel = "Y";
		}
	};
	
	//关闭已订购可选包
	var _delOffer = function(prodId,offerId){
		var $span = $("#li_"+prodId+"_"+offerId).find("span"); //定位删除的附属
		if($span.attr("class")=="del"){  //已经退订，再订购
			//二次加载，如果原先就是删除状态，不需要操作
			//AttachOffer.addOffer(prodId,offerId,$span.text());
		}else { //退订
			var offer = CacheData.getOffer(prodId,offerId);
		
			if(!ec.util.isArray(offer.offerMemberInfos)){	
				var param = {
					prodId:prodId,
					areaId: OrderInfo.getProdAreaId(prodId),
					offerId:offerId	
				};
				if(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6){//主副卡纳入老用户
					for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
						if(prodId==OrderInfo.oldprodInstInfos[i].prodInstId){
							param.areaId = OrderInfo.oldprodInstInfos[i].areaId;
							param.acctNbr = OrderInfo.oldprodInstInfos[i].accNbr;
						}
					}
				}else{
					param.acctNbr = OrderInfo.getAccessNumber(prodId);
				}
				var data = query.offer.queryOfferInst(param);
				if(data==undefined){
					return;
				}
				//遍历附属的构成要和主套餐的构成实例要一致（兼容融合套餐）
				var offerMemberInfos=[];
				$.each(data.offerMemberInfos,function(){
					var prodInstId=this.objInstId;
					var flag=false;
					$.each(OrderInfo.offer.offerMemberInfos,function(){
						if(this.objInstId==prodInstId){
							flag=true;
							return false;
						}
					});
					if(flag){
						offerMemberInfos.push(this);
					}
				});
				
				offer.offerMemberInfos = data.offerMemberInfos=offerMemberInfos;
				offer.offerSpec = data.offerSpec;
			}
			var content = "";
			if(offer.offerSpec!=undefined){
				content = CacheData.getOfferProdStr(prodId,offer,1);
			}else {
				content = '退订【'+$span.text()+'】可选包' ;
			}
			
			//原本是有确认是否删除，二次加载不需要
			offer.isdel = "Y";
			$span.addClass("del");
			delServByOffer(prodId,offer);
		}
	};
	
	//删除附属销售品带出删除功能产品
	var delServByOffer = function(prodId,offer){	
		$.each(offer.offerMemberInfos,function(){
			var servId = this.objInstId;
			if($("#check_"+prodId+"_"+servId).attr("checked")=="checked"){
				var serv = CacheData.getServ(prodId,servId);
				if(ec.util.isObj(serv)){
					serv.isdel = "Y";
					var $li = $("#li_"+prodId+"_"+servId);
					$li.removeClass("canshu").addClass("canshu2");
					$li.find("span").addClass("del"); //定位删除的附属
				}
			}
		});
	};
	
	//终端校验
	var checkTerminalCode = function(prodId,offerSpecId,num,flag){
		var prodId=prodId;
		var offerSpecId=offerSpecId;
//		var terminalGroupId=$(obj).attr("terminalGroupId");
		var num=num;
		var flag=flag;
		if(flag==undefined){
			flag = 0 ;
		}
		
		//清空旧终端信息
		AttachOffer.filterAttach2Coupons(prodId,offerSpecId,num);
		
		//清空旧终端信息
//		for ( var i = 0; i < OrderInfo.attach2Coupons.length; i++) {
//			var attach2Coupon = OrderInfo.attach2Coupons[i];
//			if(offerSpecId == attach2Coupon.attachSepcId && prodId==attach2Coupon.prodId){
//				OrderInfo.attach2Coupons.splice(i,1);
//				break;
//			}
//		}
		var objInstId = prodId+"_"+offerSpecId;
//		var resId = $("#terminalSel_"+objInstId+"_"+terminalGroupId).val();
		var resIdArray = [];
		var terminalGroupIdArray = [];
		$("#"+objInstId+"  option").each(function(){
			resIdArray.push($(this).val());
		});
		$("#group_"+objInstId+"  option").each(function(){
			terminalGroupIdArray.push($(this).val());
		});
		var resId = resIdArray.join("|"); //拼接可用的资源规格id
		//alert(resId);
		var terminalGroupId = terminalGroupIdArray.join("|"); //拼接可用的资源终端组id
		//alert(terminalGroupId);
		if((resId==undefined || $.trim(resId)=="") && (terminalGroupId==undefined || $.trim(terminalGroupId)=="")){
			$.alert("信息提示","终端规格不能为空！");
			return;
		}
		var instCode = $("#terminalText_"+objInstId + "_"+num).val();
		if(instCode==undefined || $.trim(instCode)==""){
			$.alert("信息提示","终端串码不能为空！");
			return;
		}
		if(AttachOffer.checkData(objInstId,instCode)){
			return;
		}
		var param = {
			instCode : instCode,
			flag : flag,
			mktResId : resId
//			termGroup : terminalGroupId
		};
		var data = query.prod.checkTerminal(param);
		if(data==undefined){
			return;
		}
		var activtyType ="";
		//遍历已开通附属销售品列表
		for ( var i = 0; i < AttachOffer.openList.length; i++) {
			var open = AttachOffer.openList[i];
			for ( var j = 0; j < open.specList.length; j++) {  //遍历当前产品下面的附属销售品
				var spec = open.specList[j];
				if(spec.isdel != "Y" && spec.isdel != "C" && ec.util.isArray(spec.agreementInfos)){  //订购的附属销售品
                    if(spec.agreementInfos[0].activtyType == 2){
                    	activtyType = "2";
				    }
				}
			}
		}
		if(data.statusCd==CONST.MKTRES_STATUS.USABLE || (data.statusCd==CONST.MKTRES_STATUS.HAVESALE && activtyType=="2")){
			//$.alert("信息提示",data.message);
//			$("#terminalSel_"+objInstId).val(data.mktResId);
//			$("#terminalName").html(data.mktResName);
//			$("#terminalDesc").css("display","block");
//			var price = $("#terminalSel_"+objInstId).find("option:selected").attr("price");
			
			
			var mktPrice=0;//营销资源返回的单位是元
			var mktColor="";
			if(ec.util.isArray(data.mktAttrList)){
				$.each(data.mktAttrList,function(){
					if(this.attrId=="65010058"){
						mktPrice=this.attrValue;
					}else if(this.attrId=="60010004"){
						mktColor=this.attrValue;
					}
				});
			}
			$("#terminalName_"+num).html("终端规格："+data.mktResName+",终端颜色："+mktColor+",合约价格："+mktPrice+"元");
			$("#terminalDesc_"+num).css("display","block");
			
			/*$("#terRes_"+objInstId).show();
			$("#terName_"+objInstId).text(data.mktResName);
			$("#terCode_"+objInstId).text(data.instCode);	
			if(price!=undefined){
				$("#terPrice_"+objInstId).text(price/100 + "元");
			}*/
			var coupon = {
				couponUsageTypeCd : "5", //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
				inOutTypeId : "1",  //出入库类型
				inOutReasonId : 0, //出入库原因
				saleId : 1, //销售类型
				couponId : data.mktResId, //物品ID
				couponinfoStatusCd : "A", //物品处理状态
				chargeItemCd : CONST.CHARGE_ITEM_CD.COUPON_SALE, //物品费用项类型
				couponNum : 1, //物品数量
				storeId : data.mktResStoreId, //仓库ID
				storeName : "1", //仓库名称
				agentId : 1, //供应商ID
				apCharge : mktPrice, //物品价格,约定取值为营销资源的
				couponInstanceNumber : data.instCode, //物品实例编码
				ruleId : "", //物品规则ID
				partyId : OrderInfo.cust.custId, //客户ID
				prodId : prodId, //产品ID
				offerId : -1, //销售品实例ID
				attachSepcId : offerSpecId,
				state : "ADD", //动作
				relaSeq : "", //关联序列	
				num	: num //第几个串码输入框
			};
			if(data.statusCd==CONST.MKTRES_STATUS.HAVESALE && activtyType=="2"){//“已销售未补贴”的终端串码可以办理话补合约
				coupon.couponSource ="2"; //串码话补标识
			}
			if(CONST.getAppDesc()==0){
				coupon.termTypeFlag=data.termTypeFlag;
			}
			OrderInfo.attach2Coupons.push(coupon);
		}else if(data.statusCd==CONST.MKTRES_STATUS.HAVESALE){
			$.alert("提示","终端当前状态为已销售为补贴[1115],只有在办理话补合约时可用");
		}else{
			$.alert("提示",data.message);
		}
	};
	
	var getIsMIFICheck=function(prodId){
		var prodIdTmp=(Math.abs(prodId)-1);
		if(AttachOffer.openServList.length>prodIdTmp){
			var specList = AttachOffer.openServList[prodIdTmp].servSpecList;
			for (var j = 0; j < specList.length; j++) {
				var spec = specList[j];
				if(spec.isdel!="Y" && spec.isdel!="C"){
					if(spec.servSpecId==CONST.PROD_SPEC_ID.MIFI_ID && CONST.APP_DESC==0){
						return true ; 
					}
				}
			}
		}
		return false;
	};
	
	//添加可选包到缓存列表
	var _setSpec = function(prodId,offerSpecId){
		var newSpec = CacheData.getOfferSpec(prodId,offerSpecId);  //没有在已选列表里面
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			newSpec = query.offer.queryAttachOfferSpec(prodId,offerSpecId); //重新获取销售品构成
			if(!newSpec){
				return;
			}
			CacheData.setOfferSpec(prodId,newSpec);
		}
		return newSpec;
	};
	
	//根据省内返回的数据校验拼成html
	var _checkAttachOffer = function(prodId){
		var content="";
		if(offerChange.resultOffer==undefined){
			return content;
		}
		//功能产品
		var prodInfos = offerChange.resultOffer.prodInfos;
		if(ec.util.isArray(prodInfos)){
			var str = "";
			$.each(prodInfos,function(){
//				var prodId = this.accProdInstId;
//				//容错处理，省份接入产品实例id传错
//				var flag = true;
//				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
//					if(this.objType==CONST.OBJ_TYPE.PROD && this.objInstId==prodId){  //接入类产品
//						flag = false;
//						return false;
//					}
//				});
				if(prodId!=this.accProdInstId){
					return true;
				}
				if(prodId!=this.prodInstId){ //功能产品
					var serv = CacheData.getServ(prodId,this.prodInstId);//已开通功能产品里面查找
					var servSpec = CacheData.getServSpec(prodId,this.productId);//已选功能产品里面查找
					if(this.state=="DEL"){
						if(serv!=undefined){
							str+='<li id="li_'+prodId+'_'+this.prodInstId+'" offerspecid="" offerid="'+this.prodInstId+'" isdel="N">'
									+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
									+'<span class="del">'+serv.servSpecName+'</span>'
								+'</li>';
						}else{
							if(servSpec!=undefined){
								str+='<li id="li_'+prodId+'_'+this.prodInstId+'" offerspecid="" offerid="'+this.prodInstId+'" isdel="N">'
										+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
										+'<span class="del">'+servSpec.servSpecName+'</span>'
									+'</li>';
							}else if(this.productName!=undefined && this.productName!=""){
								str+='<li id="li_'+prodId+'_'+this.prodInstId+'" offerspecid="" offerid="'+this.prodInstId+'" isdel="N">'
										+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
										+'<span class="del">'+this.productName+'</span>'
									+'</li>';
							}
						}	
					}else if(this.state=="ADD"){
						if(serv!=undefined){
							str+='<li id="li_'+prodId+'_'+this.prodInstId+'">'
									+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
									+'<span>'+serv.servSpecName+'</span>'
									+'<dd class="mustchoose"></dd>'
								+'</li>';
						}else{
							if(servSpec!=undefined){
								str+='<li id="li_'+prodId+'_'+this.prodInstId+'">'
										+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
										+'<span>'+servSpec.servSpecName+'</span>'
										+'<dd class="mustchoose"></dd>'
									+'</li>';
							}else if(this.productName!=undefined && this.productName!=""){
								str+='<li id="li_'+prodId+'_'+this.prodInstId+'">'
										+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
										+'<span>'+this.productName+'</span>'
										+'<dd class="mustchoose"></dd>'
									+'</li>';
								}
						}
					}
				}
			});
			if(str==""){
				content="";
			}else{
				content="<div class='fs_choosed'>订购4G流量包，需订购和取消如下功能产品：<br><ul>"+str+"</ul></div><br>";
			}
		}
	};
	return {
		checkTerminalCode:checkTerminalCode,
		chkState:_chkState,
		checkUim:_checkUim,
		closeServ:_closeServ,
		delOffer:_delOffer,
		opeSer:_opeSer,
		showOffer:_showOffer,
		initTounch:_initTounch,
		buildMainView:_buildMainView,
		buyService:_buyService,
		queryData:_queryData,
		searchPack              :_searchPack,
		init 					: 				_init,
		offerChangeView			:				_offerChangeView,
		changeOffer 			: _changeOffer,
		changeTab				: _changeTab,
		checkOrder				: _checkOrder,
		checkAttachOffer		: _checkAttachOffer,
		fillOfferChange			: _fillOfferChange,
		checkOfferProd			: _checkOfferProd,
		getChangeInfo			: _getChangeInfo,
		setChangeOfferSpec		: _setChangeOfferSpec
	};
})();
