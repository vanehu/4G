package com.al.lte.portal.common;

/**
 * 服务编码 .
 * <P>
 * 
 * @author tang zheng yu
 * @version V1.0 2012-3-30
 * @createDate 2012-3-30 下午2:38:07
 * @modifyDate tang 2012-3-30 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
public final class PortalServiceCode {
	/** 平台编码 */
	public static final String SERVICE_PORTAL_CODE = "1001";
	/** 平台角色 */
	public static final String SERVICE_PORTAL_ROLE_CODE = "LtePortal";
	/** 平台密码 */
	public static final String SERVICE_PORTAL_PASSWORD = "111111";
	/** 登录验证账号和密码 */
	public static final String LOGIN_VALIDATE_ACCONT = "";
	/**
	 * 员工登录服务编码
	 */
	public static final String SERVICE_LOGIN_CHECK = "com.linkage.portal.service.ess.core.system.LoginCheck";
	/**
	 * 短信验证码发送服务编码
	 */
	public static final String SERVICE_SEND_MSG_INFO = "com.linkage.portal.service.ess.core.system.SendMsgInfo";
	/**
	 * 工号对应角色查询服务编码
	 */
	public static final String SERVICE_QUERY_ROLE_BY_STAFFID = "com.linkage.portal.service.ess.core.system.QueryRolesByStaffId";
	/**
	 * 本地所有角色查询服务编码
	 */
	public static final String SERVICE_QUERY_LOCAL_ROLES = "com.linkage.portal.service.ess.core.system.QueryLocalRoles";
	/**
	 * 地区查询服务编码
	 */
	public static final String SERVICE_QUERY_LOCAL_AREA = "com.linkage.portal.service.ess.core.system.QueryLocalArea";
	
	/**
     * 根据叶子查上级地区树服务编码
     */
    public static final String SERVICE_QUERY_AREA_TREE_BY_AREA_ID = "com.linkage.portal.service.ess.core.system.QueryAreaTreeByLeafAreaId";
    /**
     * 根据父节点查下级地区树服务编码
     */
    public static final String SERVICE_QUERY_AREA_TREE_BY_PARENT_AREA_ID = "com.linkage.portal.service.lte.core.system.QueryAreaTreeByParentAreaId";
	/**
	 * 客户新建服务编码
	 */
	public static final String SERVICE_CREATE_CUST = "com.linkage.portal.service.ess.core.custorder.CreateCust";
	/**
     * 客户查询服务编码
     */
    public static final String SERVICE_QUERY_CUST_INFO = "com.linkage.portal.service.ess.core.custorder.QueryCustInfo";
    
    /**
     * 客户修改权限查询服务编码
     */
    public static final String SERVICE_UPDATE_CUST_CHECK = "com.linkage.portal.service.ess.core.custorder.QueryCustCheck";

    /**
     * 客户修改服务编码
     */
    public static final String UPDATE_CUST_INFO = "com.linkage.portal.service.ess.core.custorder.UpdateCustInfo";
    
	/**
	 * 查询可预占的号码服务编码
	 */
	public static final String SERVICE_QUERY_PHONE_NUMBER = "com.linkage.portal.service.ess.core.resources.QueryPhoneNumber";
	/**
	 * 预占，释放号码服务编码
	 */
	public static final String SERVICE_PRE_PHONE_NUMBER = "com.linkage.portal.service.ess.core.resources.PrePhoneNumber";
	/**
	 * 销售品查询服务编码
	 */
	public static final String SERVICE_QUERY_OFFER_INFO = "com.linkage.portal.service.ess.core.custorder.QueryOfferInfo";
	/**
	 * 查询终端信息服务编码
	 */
	public static final String SERVICE_QUERY_TERMINAL_INFO = "com.linkage.portal.service.ess.core.resources.QueryMktResInfo";
	/**
     * 终端串号校验与预占
     */
    public static final String SERVICE_CHECK_TERMINAL = "com.linkage.portal.service.ess.core.resources.TerminalCodeCheck";
	/**
	 * 查询终端服务编码
	 */
	public static final String SERVICE_QUERY_TERMINAL = "com.linkage.portal.service.ess.core.resources.QueryTerminal";
	/**
	 * 工号信息新增服务编码
	 */
	public static final String SERVICE_INSERT_STAFFINFO = "com.linkage.portal.service.ess.core.system.InsertStaffInfo";
	/**
	 * 工号信息修改服务编码
	 */
	public static final String SERVICE_UPDATE_STAFF_STAUTS = "com.linkage.portal.service.ess.core.system.UpdateStaffStatus";
	/**
	 * 工号信息修改服务编码
	 */
	public static final String SERVICE_UPDATE_STAFFINFO = "com.linkage.portal.service.ess.core.system.UpdateStaffInfo";
	/**
	 * 工号密码修改/密码重置服务编码
	 */
	public static final String SERVICE_UPDATE_PASSWORD = "com.linkage.portal.service.ess.core.system.UpdatePassword";
	/**
	 * 工号信息查询服务编码
	 */
	public static final String SERVICE_QUERY_STAFF_INFO = "com.linkage.portal.service.ess.core.system.QueryStaffInfo";
	/**
	 * 员工审核以及申请进度查询服务编码
	 */
	public static final String SERVICE_QUERY_STAFF_CHECK_INFO = "com.linkage.portal.service.ess.core.system.QueryStaffCheckInfo";
	/**
	 * 员工审核提交服务编码
	 */
	public static final String SERVICE_CHECK_STAFF = "com.linkage.portal.service.ess.core.system.CheckStaff";
	/**
	 * 员工审核单进度查询服务编码
	 */
	public static final String SERVICE_QUERY_BATCH_NO = "com.linkage.portal.service.ess.core.system.QueryBatchNo";
	/**
	 * AgentPortalConfig表新增服务编码
	 */
	public static final String SERVICE_INSERT_AGENT_PORTAL_CONFIG = "com.linkage.portal.service.ess.core.system.InsertAgentPortalConfig";
	/**
	 * 可受理范围查询服务编码
	 */
	public static final String SERVICE_QUERY_AUTH_RANGE = "com.linkage.portal.service.ess.core.system.QueryAuthRange";
	/**
	 * 1.根据终端查询合约计划(主套餐). 2,根据合约计划查询可选的机补话补套餐及增值业务.
	 */
	public static final String SERVICE_QUERY_OFFER_SPEC_INFO = "com.linkage.portal.service.ess.core.custorder.QueryOfferSpecInfo";

    /**
     * 充值缴费记录查询
     */
    public static final String EXCHANGE_QUERY_SERVICE = "com.linkage.portal.service.lte.core.charge.QueryPayment";
    /**
     * 套餐余量查询
     */
    public static final String SERVICE_QUERY_OFFER_USAGE = "com.linkage.portal.service.lte.core.charge.QueryOfferUsage";
	 /**
     * 快捷菜单
     */
    public static final String SERVICE_SHORT_CUT_CONFIG  = "com.linkage.portal.service.ess.core.system.ShortCutConfig";
	/**
	 * 查询菜单服务编码
	 */
	public static final String SERVICE_QUERY_MENU_RESOURCE_BY_STAFFID = "com.linkage.portal.service.ess.core.system.QueryMenuResourceByStaffId";
	public static final String SERVICE_FIND_LEAF_MENU_BY_PARENTID = "com.linkage.portal.service.ess.core.system.FindLeafMenuByParentId";
	/**
	 * 根据角色ID查询菜单
	 */
	public static final String SERVICE_QUERY_MENU_RESOURCE_BY_ROLEID = "com.linkage.portal.service.ess.core.system.QueryMenuResourceByRoleId";
	/**
	 * 根据登录工号查询全部菜单，包括父菜单子菜单
	 */
	public static final String SERVICE_QUERY_ALL_MENU_BY_STAFFID = "com.linkage.portal.service.ess.core.system.QueryAllMenuByStaffId";
	/**
	 * 变更新增角色菜单权限
	 */
	public static final String SERVICE_INSERT_ROLE_MENU= "com.linkage.portal.service.ess.core.system.InsertRoleMenu";
	/** 根据销售品目录编码，查询销售口列表 */
	public static final String SERVICE_QUERY_OFFER_INFO_BY_NODE_ID = "com.linkage.portal.service.ess.core.custorder.QueryOfferInfoByNodeId";
	/** 根据目录ID查询销售品 */
	public static final String SERVICE_QUERY_OFFER_INFO_BY_NODEID = "com.linkage.portal.service.ess.core.custorder.QueryOfferInfoByNodeId";
	
	/** 查询销售品目录 */
	public static final String SERVICE_QUERY_OFFER_CATEGORY_NODE = "com.linkage.portal.service.ess.core.custorder.QueryOfferCategoryNode";

	/** 根据外部销售品编码查询套餐描述信息，用于客户登记单打印 */
	public static final String SERVICE_QUERY_INFO_BY_OFFER_SPEC_ID ="com.linkage.portal.service.ess.core.custorder.QueryOfferInfoByOfferSpecId";
	
	/** 查询合约，根据终端和销售品 */
	public static final String SERVICE_QUERY_AGREEMENT_BY_OFFER_AND_MHK = "com.linkage.portal.service.ess.core.custorder.QueryAgreementInfo";

	
	/** 卡服务，根据厂商读取读卡控制动态链接库信息 */
	public static final String SERVICE_GET_CARD_DLL_INFO = "com.linkage.portal.service.ess.core.resources.GetCardDllInfo";

	/** uim卡信息查询. */
	public static final String SERVICE_GET_UIM_CARD_INFO = "com.linkage.portal.service.ess.core.resources.GetUimCardInfo";
	
	/** UIM卡校验与预占服务 */
    public static final String SERVICE_CHECK_UIM = "com.linkage.portal.service.ess.core.resources.UimCardCheck";

	/** 补换卡 */
	public static final String SERVICE_CHANGE_UIM = "com.linkage.portal.service.ess.core.custorder.ChangeUim";
	/**
	 * 业务受理,订单校验,订单提交服务编码
	 */
	public static final String SERVICE_ORDER_SUBMIT = "com.linkage.portal.service.ess.core.custorder.OrderSubmit";

	/** 卡资源下发到省. */
	public static final String SERVICE_SUBMIT_UIM_CARD_INFO = "com.linkage.portal.service.ess.core.resources.SubmitUimCardInfo";

	/** 获取鉴权码. */
	public static final String SERVICE_GET_AUTH_CODE = "com.linkage.portal.service.ess.core.resources.GetAuthCode";

	/**
	 * 业务受理,算费
	 */
	public static final String SERVICE_ORDER_CAL_CHARGE = "com.linkage.portal.service.ess.core.custorder.CalChargeInfo";

	/**
	 * 查询合约计划服务编码
	 */
	public static final String SERVICE_QUERY_OFFER_BY_MKT_RESCD = "com.linkage.portal.service.ess.core.custorder.QueryOfferInfoByMktResCd";
	/**
	 * 根据号码+区号+预存费用调用靓号销售品查询接口
	 */
	public static final String SERVICE_QRY_OFFERINFO_BY_PHONENUMFEE = "com.linkage.portal.service.ess.core.custorder.QueryOfferInfoByPhoneNumberFee";
	/**
	 * 释放暂存的号码
	 */
	public static final String SERVICE_RELEASE_PHONE_NUMBER = "com.linkage.portal.service.ess.core.resources.ReleasePhoneNumber";

	/**
	 * 订单发票打印信息更新.
	 */
	public static final String UPDATE_INVOICE_PRINT_INFO = "com.linkage.portal.service.ess.core.custorder.UpdateInvoicePrintInfo";

	/**
	 * 订单发票打印次数查询.
	 */
	public static final String QUERY_INVOICE_PRINT_TIMES = "com.linkage.portal.service.ess.core.custorder.QueryInvoicePrintTimes";

	/**
	 * 订单查询.
	 */
	//public static final String QUERY_ORDER_LIST = "com.linkage.portal.service.ess.core.custorder.QueryOrderList";

	/**
	 * 查询平台配置信息
	 */
	public static final String QUERY_AGENT_PORTAL_CONFIG = "com.linkage.portal.service.lte.core.resources.QueryAgentPortalConfig";

	/**
	 * 查询系统参数信息
	 */
	public static final String GET_SYS_PARAM = "com.linkage.portal.service.lte.core.system.GetSysParam";

	/**
	 * 异步调服务层接口写日志
	 */
	public static final String WRITE_INTF_LOG = "com.linkage.portal.service.lte.core.resources.RunIntfLog";
	/**
	 * 查询业务报表信息
	 */
	public static final String QUERY_ORDER_REPORT = "com.linkage.portal.service.ess.core.custorder.QueryOrderReport";

	/**
	 * 现金缴费报表
	 */
	public static final String QUERY_CASH_REPORT = "com.linkage.portal.service.ess.core.report.QueryDoCashReport";
	/**
	 * 充值卡充值-SGW余额查询服务
	 */
	public static final String QUERY_BALANCE = "com.linkage.portal.service.ess.core.charge.QueryBalance";

	/**
	 * 充值卡充值-SGW帐户欠费查询服务
	 */
	public static final String QUERY_OWECHARGE = "com.linkage.portal.service.ess.core.charge.QueryOweCharge";

	/**
	 * 充值卡充值-SGW充值操作
	 */
	public static final String DO_RECHARGE = "com.linkage.portal.service.ess.core.charge.DoRecharge";

	/**
	 * 缴费服务-缴费密钥申请(支付平台)
	 */
	public static final String QUERY_CHARGE_KEY = "com.linkage.portal.service.ess.core.charge.GetRechargeKey";

	/**
	 * 缴费服务-欠费查询(支付平台)
	 */
	public static final String QUERY_ARREAR_FROM_PAYMENT_PLATFORM = "com.linkage.portal.service.ess.core.charge.GetArrearsByPayment";

	/**
	 * 缴费服务-现金缴费(支付平台)
	 */
	public static final String DO_CASH = "com.linkage.portal.service.lte.core.charge.DoCash";
	
	/**
     * 密钥申请服务-现金缴费(支付平台)
     */
    public static final String GET_RECHARGE_KEY = "com.linkage.portal.service.ess.core.charge.GetRechargeKey";
    
	/**
	 * 查询地区，物流编码
	 */
	public static final String SERVICE_FREIGHT_AREA = "com.linkage.portal.service.ess.core.resources.QueryFreightAreaDef";
	/**
	 * 查询用户最后一次登录系统时间
	 */
	public static final String QUERY_LAST_LOGIN_DATE = "com.linkage.portal.service.ess.core.system.QueryLastLoginDate";
	/**
	 * 查询用户登录成功的次数
	 */
	public static final String QUERY_LOGIN_SUCCESS_COUNT = "com.linkage.portal.service.ess.core.system.PwdCheck";
	/**
	 * 查询用户最后一次修改密码的时间
	 */
	public static final String QUERY_LAST_PWD_CHANGE_DATE = "com.linkage.portal.service.ess.core.system.QueryLastPwdChangeDate";
	/**
	 * 根据地区号,查询归属省份,从而查询该省份下的城市信息.
	 */
	public static final String QUERY_USER_AREA = "com.linkage.portal.service.ess.core.system.QueryUserArea";
	/**
	 * 客户信息查询编码
	 */
	public static final String QUERY_CUST_INFO = "com.linkage.portal.service.ess.core.custorder.QueryCustInfo";
	
	/**
	 * 充值卡充值记录查询 .
	 */
	public static final String QUERY_CARD_RECHARGE_RECORD = "com.linkage.portal.service.ess.core.report.QueryCardRechargeRecord";
	
	/**
	 * 套餐换档-一次校验服务.
	 */
	public static final String CHANGE_ORDER_CHECK_1ST = "com.linkage.portal.service.ess.core.custorder.OrderCheckSig";
	
	/**
	 * 套餐换档-二次校验服务.
	 */
	public static final String CHANGE_ORDER_CHECK_2ND = "com.linkage.portal.service.ess.core.custorder.OrderCheckDob";
	
	/**
     * 套餐换档-校验单服务，含算费结果;正式单服务.
     */
    public static final String CHANGE_ORDER_CAL_CHARGE_AND_SUBMIT = "com.linkage.portal.service.ess.core.custorder.OfferChange";
	
	/**
     * 最新信息展示
     */
    //public static final String QUERY_NEW_INFOS  = "com.linkage.portal.service.ess.core.system.QueryNewInfos";
	
	/**
     * 根据地区编码，查询地区名称
     */
    public static final String QUERY_AREA_INFO_BY_AREA_ID  = "com.linkage.portal.service.ess.core.system.QueryAreaInfoByZoneNumber";
    
    /**
     * 根据叶子菜单查询导航条菜单
     */
    public static final String QUERY_NAV_BAR_MENU  = "com.linkage.portal.service.ess.core.system.QueryNavBarMenu";
    
    /**
     * 根据角色列表和菜单路径判断是否有权限访问
     */
    public static final String CHECH_AUTHOR_BY_ROLE_AND_MENU  = "com.linkage.portal.service.ess.core.system.CheckRole";
  
    /**
     * 根据渠道ID查询子渠道信息
     */
    public static final String SERVICE_QUERY_CHANNEL_ID = "com.linkage.portal.service.ess.core.resources.QueryChildChannelId";
	
    
    /**
	 * 业务受理,订单返销申请.
	 */
	public static final String SERVICE_ORDER_BACK_APPLY = "com.linkage.portal.service.ess.core.custorder.OrderBackApply";

	/**
	 * 业务受理,订单返销申请查询.
	 */
	public static final String SERVICE_ORDER_BACK_QUERY = "com.linkage.portal.service.ess.core.custorder.OrderBackQuery";

	/**
	 * 业务受理,订单返销申请审核.
	 */
	public static final String SERVICE_ORDER_BACK_FIRST_AUDIT = "com.linkage.portal.service.ess.core.custorder.OrderBackFirstAudit";

	/**
	 * 业务受理,订单返销查询.
	 */
	public static final String SERVICE_ORDER_BACK_FIND_BY_ID = "com.linkage.portal.service.ess.core.custorder.OrderBackFindById";

	/** 获取业务登记单，二维码等模板 */
    public static final String SERVICE_ORDER_TEMPLATE_ALL = "com.linkage.portal.service.ess.core.system.QueryOrderTemplate";
    
    /** 执行业务登记单，二维码信息存储等 */
    public static final String SERVICE_SAVE_ORDER_TEMPLATE_LOG = "com.linkage.portal.service.ess.core.system.OrderTemplateLog";
    
    /** 回执单重打查询，支持各种回执单 */
    public static final String RECEIPT_PRINT = "com.linkage.portal.service.ess.core.print.ReceiptPrint";
    /** 查询待释放的号码资源 */
    public static final String QUERY_RELEASE_NUM = "com.linkage.portal.service.lte.core.resources.QueryAccNbrToRelease";
    /** 
     * 更新已释放的号码状态  和 预占号码(UIM卡)记录新增
     */
    public static final String UPDATE_RELEASE_NUM_STATUS = "com.linkage.portal.service.lte.core.resources.ModifyAccNbrToRelease";
    /**
     * 欠费查询服务
     */
    public static final String GET_OWE_CHARGE="com.linkage.portal.service.lte.core.charge.GetOweCharge";
    /**
     * 销账
     */
    public static final String WRITE_OFF_CASH="com.linkage.portal.service.lte.core.charge.WriteOffCash";
    /** 余额查询*/
    public static final String GET_BALANCE = "com.linkage.portal.service.lte.core.charge.GetBalance";
    /** 余额支取*/
    public static final String PAY_BALANCE = "com.linkage.portal.service.lte.core.charge.PayBalance";    
    /** 帐单查询 */
    public static final String QUERY_BILL = "com.linkage.portal.service.lte.core.charge.QueryCustomizeBill";
    /** 详单查询 */
    public static final String QUERY_BILL_DETAIL = "com.linkage.portal.service.lte.core.charge.QueryCustomizeBillDetail";
    /** 获取卡组件信息 */
    public static final String GET_CARD_DLL_INFO = "com.linkage.portal.service.lte.core.resources.GetCardDllInfo";
    /** 获取动态链接库密钥 */
    public static final String GET_AUTH_CODE = "com.linkage.portal.service.lte.core.resources.GetAuthCode";
    /** 获取写卡数据 */
    public static final String GET_UIM_CARD_INFO = "com.linkage.portal.service.lte.core.resources.GetUimCardInfo";
    /** 卡上报卡管系统 */
    public static final String SUBMIT_UIM_CARD_INFO = "com.linkage.portal.service.lte.core.resources.SubmitUimCardInfo";
    /** 销帐查询*/
    public static final String QUERY_WRITEOFFCASH = "com.linkage.portal.service.lte.core.charge.QueryWriteOffCashDetail";
    /** 反销帐*/
    public static final String REVERSE_WRITEOFFCASH = "com.linkage.portal.service.lte.core.charge.ReverseWriteOffCash";
    /** 销账历史记录 服务*/
    public static final String PRINTI_NVOICE = "com.linkage.portal.service.lte.core.charge.PrintInvoice";
    /** 客户化账单打印 */
    public static final String GET_CUSTOMIZE_BILL_DATA = "com.linkage.portal.service.lte.core.charge.PrintCustomizeBill";
    /** 单点登录 */
    public static final String SIGLE_SIGN_CHECK_LOGIN= "com.linkage.portal.service.lte.core.system.CheckLogin";
    /** 充值订单查询*/
    public static final String QUERY_CHARGE_RECORD = "com.linkage.portal.service.lte.core.charge.QueryChargeRecord";
    /** 翼销售充值*/
    public static final String APP_CHARGE = "com.linkage.portal.service.lte.core.charge.AppCharge";
    
    /** 翼销售余额查询*/
    public static final String APP_BALANCE = "com.linkage.portal.service.lte.core.charge.AppBalance";
    
    /** 代理商保证金校验*/
    public static final String CHECK_DEPOSIT = "chk.order.chkdeposit";
    
    
    /** 翼销售欠费查询*/
    public static final String APP_ARREARS = "com.linkage.portal.service.lte.core.charge.AppArrears";
    
    /** 翼销售充值订单查询*/
    public static final String APP_PAYMENT_QUERY = "com.linkage.portal.service.lte.core.charge.AppPaymentQuery";
    
    /** 蓝牙密钥查询*/
    public static final String QUERY_BLUETOOTH_KEY = "com.linkage.portal.service.lte.core.resources.QueryBlueToothKey";
    
    /**
     * 产品实例与号码关系查询
     */
   public static final String QUERY_PROD_INST_ACCNBR="biz-service/intf.prodInstService/queryProdInstAccNbr";
   /**
    * 营销资源--号码等级查询
    */
   public static final String QRY_PHONENBRLEVELINFO_LIST="res-PhoneNumberQryService";
    
    
    
    /** bianxw 公告列表 */
    public static final String NOTICE_QUERY = "sys-queryBulletinInfo";
    
    /**操作手册列表查询*/
    public static final String MANUAL_QUERY = "sys-queryOperateInfo";

    /** bianxw 首页菜单-查询所有 */
    public static final String MENU_QUERY_ALL = "sys-queryMenuInfo";

    /** bianxw 首页快捷菜单 */
    public static final String MAIN_SHORT_CUT = "sys-queryShortcutMenu";
    
    public static final String CHECK_RULE_PREPARE = "rule-service/so.rule.ruleSMO/check4GRuleSoPrepare";
    
    public static final String INTF_STAFF_LOGIN = "sys-staffLogin";
    
    public static final String SERVICE_SEND_SMS = "com.linkage.portal.service.lte.core.system.SendMsgInfo";
    
    public static final String INTF_TERM_QUERY_SERVICE = "res-TermQueryService";
    
    public static final String INTF_TERM_VALIDATE = "res-TermValidateService";
    /**终端串码校验*/
    public static final String INTF_TERM_RECEIVE = "res-ITermReceiveService";
    
    public static final String INTF_TERM_UIM_CARD_TYPE_VALIDATE = "res-UimCardTypeValidator";

//	2013.12.11 终端出库改走营业受理后台，不直接调用营销资源
//  public static final String INTF_TERM_OUT="res-TermUimResInoutService";
    
    public static final String INTF_QUERY_AP_CONFIG = "queryApConfig";
    
    public static final String INTF_QUERY_OFFER_BY_MKT_RESCD = "biz-service/intf.prodOfferService/queryAgreementActivtyAttachOfferSpec";
    /** bianxw 订单属性查询 */
    public static final String ORDER_PARAM_QUERY = "biz-service/intf.productService/queryProdAndCompProdItemsById";//orderParamQuery
    /** bianxw 产品属性查询 */
    public static final String PRODUCT_PARAM_QUERY = "biz-service/intf.prodInstService/queryProdInstItemsById";//orderParamQuery
    
    //查询产品规格属性 wukf
    public static final String PROD_SPEC_PARAM_QUERY = "biz-service/intf.productService/queryProdAndCompProdItemsById";
    
    //查询产品实例属性 wukf
    public static final String PROD_INST_PARAM_QUERY = "biz-service/intf.prodInstService/queryProdInstItemsById";
    
    public static final String INTF_OFFER_INST_QUERY="biz-service/intf.prodOfferInstSerivce/queryOfferMemberById";
//    public static final String INTF_OFFER_INST_QUERY="biz-service/intf.prodOfferInstSerivce/queryOfferMemberTestById";
    
    public static final String QUERY_COMPPRODMEMBER_LIST ="biz-service/intf.prodInstService/queryCompProdMemberByAn";
    
    public static final String QUERY_COMPSPEC_BY_SPECID ="biz-service/intf.productService/queryCompPspecGrpsBySpecId";
 
    public static final String QUERY_OFFER_SPEC = "biz-service/intf.prodOfferService/queryOfferSpecParamsBySpec";

    public static final String INIF_QUERY_ERCODE ="biz-service/intf.detailService/queryCustemerOrderDetailForCarrier";
    
    public static final String seal_ca = "ca-ca/cert/noSignSeal4Pdf";
    
    //主销售品目录查询
    public static final String QUERY_MAIN_OFFER_CATEGORY = "biz-service/intf.prodOfferService/queryOfferCategorys";
    
    public static final String QUERY_MAIN_OFFER = "biz-service/intf.prodOfferService/queryMainOfferSpecList"; 
    
    public static final String QUERY_OFFER_SPEC_CONFIG = "queryOfferSpecConfig";
    
    public static final String INTF_QUERY_PHONENUMBER_LIST="res-PnQueryService";
    
    public static final String INTF_TERMSORT="res-TermSortService";
    
    public static final String INTF_TERMQUERY="res-termQueryService";
    
    
    // add by wd 2015/6/2  手机客户端  - 新增 - 统计功能（接口组提供）
    
    public static final String INTF_QUERY_COUNT_INFO_LIST="inte-qryCountInfoList"; //总量信息统计查询接口
    
    public static final String INTF_QUERY_FREE_INFO_LIST="inte-qryFeeInfoList"; //费用详情查询接口
    
    public static final String INTF_QUERY_TERM_SALES_INFO_LIST="inte-qryTermSalesInfoList"; //终端详情查询接口
    

    //end 
    
    // add by wd 2015/11/27  查询在途订单总数
    public static final String  INTF_QUERY_COUNT="biz-service/intf.soService/checkOnWayCustomerOrder"; 
    // end 
    
    public static final String INTF_PROTOCOL_QUERY= "biz-service/intf.prodInstService/queryProtocolServiceByConditions";  // 查询协议  add by wd  14-11-3
    
    public static final String INTF_PROTOCOL_NBR_QUERY= "biz-service/intf.prodOfferService/query";  // 查询协议编码 add by wd  14-11-3
    
    public static final String INTF_PROTOCOL_OFFER_QUERY= "biz-service/intf.prodInstService/queryOffersByAttrId";  // 查询协议下 销售品  add by wd  14-11-3
    
    public static final String INTF_PROTOCOL_ADD = "biz-service/intf.detailService/saveProtocol";  // 添加 协议 add by wd  14-11-3
    
    public static final String INTF_PROTOCOL_OFFER_DETAIL= "biz-service/intf.prodInstService/queryProdInstMemberInfo"; // 协议下 销售品 详情  add by wd  14-11-3
   
    public static final String QUERY_STAFF_LIST = "sys-queryStaffInfo";
    
    /**号码预占和释放*/
    public static final String INTF_RESERVE_PHONENUMBER="res-PnReserveService";
    /**UIM释放*/
    public static final String INTF_RELEASE_UIM="res-UIMReleaseService";
    /**UIM预占*/
    public static final String INTF_RESERVE_UIM="res-UIMReserveService";
    
    public static final String INTF_QUERY_RESERVENUMBER="res-PnReserveQryService";
    
    /*
     * 白卡入库
     * */
    public static final String INTF_UIM_CARD_INPUT="res-UIMCardInputService/cardInput";
  
    public static final String INTF_QUERY_CHARGE_LIST="biz-service/intf.chargeService/saveComputeChargeJson";
    
    public static final String INTF_QUERY_CHARGE_ADDITEM="biz-service/intf.acctService/queryAcctTypeForObj";
    /*帐户资料查询*/
    public static final String INTF_QUERY_ACCOUNT_INFO = "biz-service/intf.acctService/queryExistAcctByCond";

    public static final String INTF_SUBMIT_CHARGE="biz-service/intf.soService/updateCompleteOrderList";
    
    public static final String INTF_ADDORRETURN_CHARGE="biz-service/intf.chargeService/updateForAddOrReturn";
    
    public static final String INTF_QUERY_PAYMETHOD="biz-service/intf.chargeService/queryAvilablePayMethodCdByAcctItemTypeCd";
    
    /**文件上传成功通知接口，在Excel文件上传上传成功后调用该接口*/
    public static final String INTF_BATCH_FILEUPLOADSUCCESSNOTICE = "biz-service/intf.batchOrderService/fileUpLoadSuccessNotice";
    /**批量受理结果查询*/
    public static final String INTF_BATCH_ORDERSTATUSQUERY = "biz-service/intf.batchOrderService/queryGroupBatchOrder";
    /**批次信息查询下的取消和修改*/
    public static final String INTF_BATCH_ORDEROPERATE = "biz-service/intf.batchOrderService/dealBatchQueueProgress";
    /**进度查询下的“取消”和“重发”*/
    public static final String INTF_BATCH_BATCHREPROCESS = "biz-service/intf.batchOrderService/cancelOrRetrySingleBatch";
    /**批次信息查询*/
    public static final String INTF_BATCH_ORDERQUERYLIST = "biz-service/intf.batchOrderService/queryGroupBatchOrderInfo";
    /**批量导入(批量数据以json报文形式传送)*/
    public static final String INTF_BATCH_IMPORT="biz-service/intf.batchOrderService/saveBatchOrderImport"; 
    
    public static final String INTF_BATCH_IMPORTQUERY="biz-service/intf.batchOrderService/queryBatchOrderList";
    
    public static final String INTF_BATCH_ORDERQUERY="biz-service/intf.batchOrderService/queryBatchOrderTemplageList";
    
    public static final String INTF_BATCH_ORDERDEL="biz-service/intf.batchOrderService/updateOrderListForCustOrderDel";
    /**批量终端销售*/
    public static final String INTF_BATCH_ECSBATCHSALE="res-EcsTerminalService/ecsBatchSale"; 
    /**批量终端领用回退*/
    public static final String INTF_BATCH_ECSBATCHBACK="res-EcsTerminalService/ecsBatchBack"; 
    /**批量终端领用*/
    public static final String INTF_BATCH_ECSBATCHRECEIVE="res-EcsTerminalService/ecsBatchReceive"; 
    /**批量终端领用、批量终端领用回退、批量终端销售批次查询*/
    public static final String INTF_BATCH_QRYECSBATCHORDER="res-EcsTerminalService/queryEcsBatchInfo"; 
    
    /**查询用户信息*/  
    public static final String INTF_QUERY_USEINFOBYACCNBR="biz-service/intf.pullingDataService/queryUseInfoByAccNbr";
    
    /**批量终端领用、批量终端领用回退、批量终端销售批次详情查询*/
    public static final String INTF_BATCH_QRYECSBATCHORDERDETAIL="res-EcsTerminalService/queryEcsBatchLogDetail"; 
    /**批量终端领用、批量终端领用回退、批量终端销售仓库查询*/
    public static final String INTF_BATCH_QRYECSBATCHREPOSITORY="res-EcsTerminalService/queryEcsStoreByStaffId"; 
    
    public static final String INTF_PNUIMBATCHVAL_SERVICE="res-PnPiReserveService";
    
    /*员工密码修改或重置*/
    public static final String STAFF_PASSWORD = "sys-updatePassword";
    /*客户列表查询*/
    public static final String INTF_QUERY_CUST = "biz-service/intf.custService/queryCust";
    /*产品密码鉴权*/
    public static final String INTF_CUST_AUTH = "biz-service/intf.prodInstService/queryBoProdPasswordsByCond";
    //产品信息查询
    public static final String INTF_QUERY_PROD = "biz-service/intf.prodInstService/queryProdAndOfferByConditions";
    //产品实例详情查询
    public static final String INTF_QUERY_PROD_DETAIL = "biz-service/intf.prodInstService/queryProdInfo";
    //客户详细信息查询
    public static final String INTF_QUERY_CUST_DETAIL = "biz-service/intf.custService/queryCustExInfo";
    //查询帐户详情
    public static final String INTF_QUERY_ACCT_DETAIL = "biz-service/intf.acctService/queryAcctDetailInfo";
    //预校验单接口
    public static final String INTF_QUERY_CHECKBYCHANGE = "biz-service/intf.soService/updateOrderInfoForCheckByChange";
    //银行详情查询
    public static final String INTF_QUERY_BANK_INFO = "biz-service/intf.chargeService/queryBankInfo";
    //银行详情保存
    public static final String INTF_SAVE_BANK = "biz-service/intf.chargeService/saveBank";
    //银行详情更新
    public static final String INTF_UPDATE_BANK = "biz-service/intf.chargeService/updateBank";
    //客户属性规格列表查询
    public static final String INTF_PARTY_PROFILE = "biz-service/intf.custService/queryPartyProfileSpecList";
    //根据员工类型查询员工证件类型
    public static final String INTF_QUERY_CERTTYPE = "biz-service/intf.custService/queryCertTypeByPartyTypeCd";
   /* public static final String ATTACH_MUST_OFFER = "attachMustOffer";
    public static final String ATTACH_OFFER = "attachOffer";
    public static final String ORDER_SUBMIT = "orderSubmit";*/
    //附属销售品标签查询
    public static final String QUERY_LABLE = "biz-service/intf.prodOfferService/queryLabelByAreaId";
    //查询默认必开附属
    public static final String ATTACH_MUST_OFFER = "biz-service/intf.prodOfferService/queryDefaultAndRequiredOfferSpec";
    //查询默认,必开,可选功能产品
    public static final String QUERY_SERV_SPEC = "biz-service/intf.productService/queryDefaultAndRequireServSpec";
    
    //查询默认,必开,可选功能产品  +  查询默认必开附属  
    public static final String ATTACH_MUST_OFFER_SERV = "biz-service/intf.productService/queryDefaultAndRequireServSpecAndOfferSpec";
    
    //查询可订购附属
    public static final String QUERY_ATTACH_SPEC = "biz-service/intf.prodOfferService/queryCanBuyAttachOfferSpec";
    //查询已订购附属
    public static final String QUERY_ATTACH_OFFER = "biz-service/intf.prodOfferInstSerivce/queryAttachOfferByProdId";
    //查询已订购附属参数
    public static final String QUERY_OFFER_PARAM = "biz-service/intf.prodInstService/queryOfferParam";
    //加载实例信息
    public static final String LOAD_INST = "biz-service/intf.pullingDataService/queryProdInfoFromProv"; 
    //订单下省校验
    public static final String ORDER_CHECK = "biz-service/intf.soService/checkOrderListAndBusiOrder"; 
    //订单提交
    public static final String ORDER_SUBMIT = "biz-service/intf.soService/commitOrderListAndBusOrder";
    //订单提交（一次性）
    public static final String ORDER_SUBMIT_COMPLETE = "biz-service/intf.soService/commitOrderListAndBusOrderComplete";
    //订单删除
    public static final String DEL_ORDER = "biz-service/intf.soService/updateOrderListForCustOrderDel";
  	//查询互斥依赖
    public static final String QUERY_OFFER_EXCLUDE_DEPEND = "biz-service/intf.prodOfferService/queryOfferExcludeDepend";
    
    //待释放号码（UIM卡）状态更新
    public static final String MODIFY_ACCNBR_TO_RELEASE = "com.linkage.portal.service.lte.core.resources.ModifyAccNbrToRelease";
    
   /*管理渠道*/
    //public static final String QRY_CHANNEL_BY_RELA_STAFF = "chan-service/interact/synStaffBean/qryChannelByRelaStaff";
    public static final String QRY_CHANNEL_BY_RELA_STAFF = "chan-service/interact/synStaffBean/qryChannelByRelaStaff";
    /**
     * 根据地区ID向下递归查询所有渠道信息(现用于受理单查询中渠道弹出框)
     */
    public static final String QRY_CHANNEL_BY_COND = "chan-service/interact/synStaffBean/qryChannelByCommonRegionId";
   
    
    
    /*快捷菜单设置 */
    public static final String SET_SHORTCUT = "sys-modifyShortcutMenu";    
    
    public static final String CHECK_OPERATPERM="sys-checkOperatPerm";
    
    public static final String CHECK_OPERATSPEC="sys-checkOperatSpec";
    /*首页 产品推荐等????*/
    public static final String QUERY_NEW_INFOS = "biz-service/intf.prodInstService/queryNewInfo";
    /*订单查询????*/
    public static final String QUERY_ORDER_LIST = "biz-service/intf.soService/queryOrderListInfoForPageSoQuery";
    /*短号 查询 --文档中不对：service/intf.prodOfferInstSerivce/queryCompProdInstByProdId */
    public static final String SHORTNUM_QUERY = "biz-service/intf.prodInstService/queryCompProdInstByProdId" ;
    
    /*短号 修改*/
    //public static final String SHORTNUM_SUBMIT = "biz-service/shornumsubmit" ;
    /*产品下账户查询 */
    public static final String QUERY_PROD_ACCT_INFO = "biz-service/intf.prodOfferInstSerivce/queryBoAccountRelasByProdId";
    /*产品下终端实例数据查询 */
    public static final String QUERY_OFFER_COUPON_BY_ID = "biz-service/intf.soService/queryOfferCouponById";
    //获取打印回执内容
    public static final String INTF_GET_VOUCHER_DATA = "biz-service/intf.soService/queryOrderListInfoForPrint";
    //获取以旧换新打印内容
    public static final String INTF_GET_OLD2NEW_DATA = "biz-service/intf.soService/queryOldNewCouponInfoForPrint";
    //pdf文件上传
    public static final String INTF_SAVE_PRINTFILE="biz-service/intf.fileOperateService/upLoadPrintFileToFtp";
    //pdf文件下载
    public static final String INTF_DOWN_PRINTFILE="biz-service/intf.fileOperateService/downLoadPrintFileFromFtp";
    //获取可打印费用
    public static final String INTF_GET_INVOICE_ITEMS = "biz-service/intf.chargeService/queryComputeChargeJson";
    //获取打印模板
    public static final String INTF_GET_INVOICE_TEMPLATES = "com.linkage.portal.service.lte.core.resources.QueryInvoiceTemplate";
    //发票打印处理
    public static final String INTF_SAVE_INVOICE_INFO = "biz-service/intf.chargeService/saveInvoiceInfo";
    //电子发票查询
    public static final String INTF_QUERY_EL_INVOICE_INFO = "biz-service/intf.chargeService/getEInvoiceInfoFromProv";
    //首页推荐热卖产品
    public static final String MAIN_HOTPRODUCT = "hotProd";
    //产品实例所属群组产品信息查询
    public static final String QUERY_COMPPRODINST_BY_PRODID = "biz-service/intf.prodInstService/queryCompProdInstByProdId";
    
    //押金列表查询
    public static final String QUERY_BAMOBJFOREITEMS = "biz-service/intf.chargeService/queryBamObjForegitfItems";
    //押金历史列表
    public static final String QUERY_FOREGIFTOPERDETAIL = "biz-service/intf.chargeService/queryForegiftOperDetail";
    //退回押金
    public static final String UPDATE_BAMOBJFOREGIFT_FOR_RETURN = "biz-service/intf.chargeService/updateBamObjForegiftForReturn";
    //收取押金
    public static final String SAVE_BAMOBJFOREGIFT = "biz-service/intf.chargeService/saveBamObjForegift";

    public static final String QUERY_AREA_TREE_BY_PARENTID = "sys-queryAreaTreeByParentId";
    
    public static final String ORDER_DETAIL_INFO = "biz-orderDetailInfo" ;
  
    //bianxw 地区字典查询
    public static final String QUERY_OPERAT_AREA_RANGE = "sys-queryOperatAreaRange";
    //bianxw 购物车 查询
    public static final String SHOPPING_CART_LIST = "biz-service/intf.detailService/queryCustomerOrders" ;
    //客户修改日志查询
    public static final String QUERY_CUST_MODIFY_LIST = "biz-service/intf.detailService/queryCustOrderModifyLog" ;
    //一卡双号业务监控查询    bdw代表后台BusinessDispatchWeb项目 
    public static final String QUERY_OCTN = "bdw-service/intf.businessDispatchService/queryBusiDispatchOrderProcessInfos" ;
    //bianxw 购物车 详情
    public static final String SHOPPING_CART_INFO = "biz-service/intf.detailService/queryCustemerOrderDetail" ;
    //bianxw 受理单 详情
    public static final String SHOPPING_CART_DETAIL = "biz-service/intf.detailService/queryOrderItemDetail" ;
    //购物车环节
    public static final String QUERY_CART_LINK = "biz-service/intf.detailService/queryCustOrderLinkInfo";
    //施工单状态
    public static final String QUERY_CONSTRUCTION_STATE = "biz-service/intf.pullingDataService/workOrderQuery";
    //购物车失败环节重发
    public static final String RESEND_CUST_ORDER = "biz-service/intf.soService/reTryArchiveCustomerOrder";
    //bianxw 作废发票  20140620目前不使用
//    public static final String UPDATE_INVOICE_INVALID = "biz-service/intf.chargeService/updateInvoiceInvalid" ;
    //主数据查询
    public static final String QUERY_CTGMAINDATA = "biz-service/intf.soService/queryCTGMainData";
    
    //校验短号
    public static final String QUERY_GROUPSHORTNBR = "biz-service/intf.pullingDataService/groupShortNbrQuery";
    //通用产品查询
    public static final String QUERY_COMMPRODUCT = "biz-service/intf.soService/queryCommProduct";
    
    //bianxw 协销人类型
    public static final String QUERY_PARTY_TWO_PRODU_ROLE = "biz-service/intf.custService/queryParty2ProduRole";
    
    //根据终端串码查询终端信息（如果是合约同时返回绑定的产品销售品信息）
    public static final String INTF_QUERY_COUPON = "biz-service/intf.couponService/queryBo2CouponInfoStringByCouponInstanceNumber";
    //根据接入号查询终端资源信息过滤属性
    public static final String QUERY_MKTRESINFO = "biz-service/intf.prodInstService/queryMktResInfoByAccessNum";
    //根据staffcode查询员工信息的接口
    public static final String QUERY_STAFF_BY_STAFFCODE="sys-queryStaffByStaffCode4Login";
    //手动归档
    public static final String UPDATE_ARCHIVED_AUTO = "biz-service/intf.soService/updateArchivedAuto";
    
    public static final String PRINT_INVOICE = "portal/printInvoice";
    
    //bianxw	撤单校验	2014-03-11新加接口，后台陈琼
    public static final String ORDER_UNDO_CHECK = "biz-service/intf.soService/queryIfCanRepealCustOrder";

    public static final String STAFF_4_OTHER_SYS="sys-login4OtherSys";
    //门户定位客户成功后调用系管模块查询接口
    public static final String LOCATE_CUSTINFO = "sys-locateCustInfo";
    
    public static final String STAFF_LOGIN_OUT="sys-staffLoginOut";

    public static final String INTF_INVALID_INVOICE = "biz-service/intf.chargeService/updateInvoiceInvalid";
    //获取发票代码、发票号码
    public static final String INTF_GET_INVOICE_INFO = "biz-service/intf.chargeService/invoiceInfoQuery";
    
    public static final String SERVICE_QUERY_BUSITYPE = "com.linkage.portal.service.lte.core.resources.QueryBusitype";
    
    public static final String SERVICE_QUERY_BUSIACTIONTYPE = "com.linkage.portal.service.lte.core.resources.QueryBusiactiontype";
    
    public static final String CHECK_RULE_TO_PROV = "biz-service/intf.soService/checkRuleToProv" ;
    
    public static final String SERVICE_INSERT_ORDERYSLINFO = "com.linkage.portal.service.lte.core.resources.SubOrderYSLinfo";
    
    public static final String SERVICE_QUERY_ORDERYSLINFO = "com.linkage.portal.service.lte.core.resources.QueryOrderYSLinfo";
      
    public static final String SERVICE_UPDATE_ORDERZDYYINFO = "com.linkage.portal.service.lte.core.resources.UpdateOrderZDYYinfo";
    
    public static final String SERVICE_QUERY_ORDERZDYYINFO = "com.linkage.portal.service.lte.core.resources.QueryOrderZDYYinfo";
    
    public static final String SERVICE_GET_TRANID = "com.linkage.portal.service.lte.core.system.GetTranId";
    
    public static final String SERVICE_GET_LOG_SEQUENCE = "com.linkage.portal.service.lte.core.system.GetLogSequence";
    
    public static final String SERVICE_GET_PROTOCOL_NBR_SEQ = "com.linkage.portal.service.lte.protocols.GetProtocolNbrSeq";
    
    
    
    public static final String UPDATE_CHARGEINFO_FORCHECK = "biz-service/intf.soService/updateChargeInfoForCheck" ;
    
    public static final String CREATE_ORDERLONGER = "com.linkage.portal.service.lte.core.system.Createorderlonger";

    
    //WUHB 公共数据查询的服务
    public static final String QUERY_CONST_CONFIG="biz-service/intf.soService/querySoConstConfigByConditions";

    public static final String INSERT_LOGINSESSION = "com.linkage.portal.service.lte.core.system.InsertLoginSession";    
    
    public static final String RESERVE_PHONE="res-PnBookService";
    
    public static final String BATCHRESERVE_PHONE="res-pnBookReleaseByBatchService";
    
    public static final String RESERVE_PHONE_QUERY="res-PnOrderService";
    
    public static final String QUERY_AUTHENTICDATARANGE = "sys-queryAuthenticDataRange";
    
    public static final String GET_OLPOS = "com.linkage.portal.service.lte.core.resources.GetOLpos";

    //查询父级地区信息
    public static final String QUERY_PARENT_AREA_INFO = "com.linkage.portal.service.lte.core.system.QueryParentAreaInfo";
    
    //系管-查询所有需要鉴权才能提交到后台的链接列表
    public static final String QUERY_AUTH_URL_LIST = "sys-queryAllModularAndFuncs";
    
    //终端预约联动查询接口
    public static final String TERM_ORDER_QUERY_SERVICE="res-TermQueryService/termOrderQueryService";

    //NFC应用信息查询
    public static final String TERM_NFCAPPINFO_QUERY_SERVICE="res-TermQueryService/qryNfcAppInfoService";

    //终端信息查询接口
    public static final String TERM_INFO_QUERY_SERVICE="res-MktResInstInfoQryService/mktResInstInfoQry";

    //实例订单查询
    public static final String INTF_QUERY_ORDER_RESALE = "biz-service/intf.detailService/queryOrderItemDetailForResale";
    
    //数据抽取，根据订单ID查询订单提交的报文
    public static final String QUERY_ORDER_LIST_INFO_BY_ORDER_ID = "biz-service/intf.pullingDataService/queryOrderListInfoByCustomerOrderId";
    
    //资源补录，补充在订单提交时未填写的资源信息（分段受理）
    public static final String SAVE_RESOURCE_DATA = "biz-service/intf.soService/saveResourceData";
    
    //靓号预存和保底金额查询，后台的该接口废弃，直接使用营销资源号码查询接口返回的预存保底金额
    @Deprecated
    public static final String QUERY_PN_LEVEL_PROD_OFFER = "biz-service/intf.prodOfferService/queryPnLevelProdOffer";
    
    //一卡双号订购校验单
    public static final String QUERY_CARDNBLIST = "bdw-service/intf.businessDispatchService/exchange";
    
    //一卡双号正式单接口 
    public static final String EXCHANGE_ACCNBR = "bdw-service/intf.businessDispatchService/exchange";
    
    //一卡双号退订查虚号
    public static final String QUERY_VIRTUALINFO = "bdw-service/intf.businessDispatchService/queryVirtualInfo";
    
    //自助换卡查询进度接口
    public static final String CARD_PROGRESS_QUERY = "biz-service/intf.pullingDataService/cardProgressQuery";
    
    public static final String INSERT_SP_BUSI_RUN_LOG = "com.linkage.portal.service.lte.core.resources.Insert_sp_busi_run_log";
    //下省查询BIZID
    public static final String QUERY_BIZ_ID_FROM_PROV = "biz-service/intf.pullingDataService/queryBizIdFromProv";
    //根据BIZID获取客户信息
    public static final String QUERY_BIZ_CUSTINFO_FROM_PROV = "biz-service/intf.pullingDataService/queryBizCustInfoFromProv";
    
    public static final String SERVICE_GET_APPTOKEN = "com.linkage.portal.service.lte.core.resources.AccessTokenService"; 
    
    public static final String SERVICE_QUERY_ACCESSTOKEN = "com.linkage.portal.service.lte.core.resources.QueryAccessToken";   
    
    //销售品编码转换
    public static final String INTF_PRODOFFER_CHANGE="biz-service/intf.prodOfferService/queryProdOfferByExtprodofferId";
    
    //暂存单查询
    public static final String INTF_TEMPORARYORDER_QUERY="biz-service/intf.pullingDataService/queryOrderListInfoByCustomerOrderId";

    //离散值类型查询
    public static final String QUERY_SPECLIST_BY_ATTRID = "biz-service/intf.soService/querySpecListByAttrID";
    
    //终端配置查询
    public static final String QUERY_COUPON_CONFIG = "biz-service/intf.soService/queryCouponConfig";
    
    //终端预约终端查询
    public static final String INTF_TERM_ATTR_QUERY_SERVICE = "res-TermAttrQueryService";
    
    //终端预约记录查询
    public static final String QUERY_COUPON_RESERVE  = "biz-service/intf.soService/queryCouponReserveLog" ;


    /**终端预约在途查询*/
    public static final String QUERY_COUPON_ROAD_RESERVR = "biz-service/intf.detailService/checkTerminalReverationZT";


    /** 配置数据查询 */
    public static final String CONFIG_DATA_QUERY = "biz-service/intf.soService/querySpecListByAttrID";
    
    /** 以旧换新查询终端属性配置 */
    public static final String QUERY_COUPON_ATTR_VALUE = "biz-service/intf.soService/queryOldCouponAttrByAttrID";
    
    /** 以旧换新回购价格查询 */
    public static final String QUERY_OLD_COUPON_DISCOUNT_PRICE = "biz-service/intf.couponService/queryOldCouponDiscountPriceByAttrs";
    
    /** 以旧换新旧串码校验（是否可以办理以旧换新） */
    public static final String CHECK_NEW_OLD_COUPON_REL = "biz-service/intf.couponService/checkNewOldCouponRel";
    
    /** 以旧换新旧新旧串码关系保存 */
    public static final String SAVE_NEW_OLD_COUPON_RELINFO = "biz-service/intf.couponService/saveNewOldCouponRelInfo";
    
    /**后台校验终端串号*/
    public static final String INTF_COUPONGRPFORCHECK_QUERY ="biz-service/intf.prodOfferService/queryCouponGrpForCheck";
    
    /** 营销资源--号码查询*/
    public static final String PHONENUMINFOQRY_SERVICE="res-PhoneNumInfoQryService/phoneNumInfoQry";
    
   /** 营销资源--保底消费的搜索条件*/
    public static final String QRY_PNLOWANDPREPRICE_SERVICE="res-PhoneNumberQryService/qryPnLowAndPrePrice";
    
   
    //终端预约码校验接口
    public static final String QUERY_COUPON_RESERVE_CODE_CHECK  = "biz-service/intf.soService/queryCouponReserveCodeCheck" ;
    
    /** 查询地区信息 */
    public static final String QUERY_AREA_INFO = "com.linkage.portal.service.lte.core.system.QueryAreaService";
    
    /**查询我的收藏*/
    public static final String QUERY_PRODOFFER_FAVORITE = "biz-service/intf.prodOfferService/queryProdOfferFavorites";
    /**收藏销售品*/
    public static final String COLLECT_PRODOFFER_FAVORITE = "biz-service/intf.prodOfferService/collectProdOfferIntoFavorites";
    /**删除收藏夹中销售品*/
    public static final String CANCEL_PRODOFFER_FAVORITE = "biz-service/intf.prodOfferService/cancelProdOfferFromFavorites";
    

    /** 查询主套餐规格对应的付费类型 */
    public static final String QUERY_OFFER_FEE_TYPE = "biz-service/intf.prodOfferService/queryFeeTypeByOfferId";
    //暂存单保存
    public static final String SAVE_ORDER_ATTRS = "biz-service/intf.soService/saveOrderAttrs";
    
    /** 根据客户查询接入号 */
    public static final String QUERY_ACC_NBR_BY_CUST = "biz-service/intf.custService/queryAccNbrByCust";
   
    /** 查询客户订单业务提示 */
    public static final String QUERY_ORDER_BUSI_HINT = "biz-service/intf.soService/queryOrderBusiHint" ;
    /**系统管理锁定工号的接口*/
    public static final String LOCKUSER = "sys-lockUser";
    /**权限校验接口*/
	public static final String CHECKISACCESSBYSTAFFID = "sys-checkIsAccessByStaffId";
	/**物联网客户查询-终端串码查号码*/
	public static final String IOT_SERVICE_QUERY_CUST_PHONE = "com.linkage.portal.service.lte.core.resources.IOTqryMktResCodePhoneNum";
	/**物联网客户查询-号码查询产品信息*/
	public static final String IOT_SERVICE_QUERY_CUST_PROD = "com.linkage.portal.service.lte.core.resources.IOTqryProdInfo";
	/**物联网客户查询-订单提交*/
	public static final String IOT_SERVICE_TRANSFER_ARCHIVE = "com.linkage.portal.service.lte.core.resources.IOTTransferArchive";
	
	 //写卡入库
    public static final String SUBMIT_UIM_CARD_INFOLOG = "biz-service/intf.soService/saveWriteCardLog";

	/*客户架构信息查询接口*/
    public static final String QUERY_CUST_COMPRE_INFO = "biz-service/intf.custService/queryCustCompreInfo";
	
	/**全量多线程查询*/
	public static final String QUERY_LOAD_INSTIDS = "biz-service/intf.pullingDataService/queryProdInfoFromProvForConcurrent";
	/**根据销售品（或功能产品）规格Id查询被依赖的销售品或功能产品*/
	public static final String QUERY_SERVDEPEND_FORCANCEL ="biz-service/intf.prodOfferService/queryOfferAndServDependForCancel";
	/**客户证件校验接口*/
	public static final String CHECK_IDCARDNUMBER = "biz-service/intf.custService/checkIdCardNumber";
	/**记录页面操作的动作和页面需要记录的内容*/
	public static final String PORTA_ACTION_LOG = "portal-potalActionLog";

	/**
	 * 查询二次业务菜单对应的鉴权权限
	 * @author liuteng
	 */
	public static final String QUERY_BIZ_SECONDBUSINESS_MENU_AUTH = "biz-service/intf.soService/qryBusiOptionalAuthentiMode";

	/**
	 * 鉴权日志记录接口用于记录每次的鉴权方式，鉴权时间等相关参数，后台返回一个记录id给前台
	 * @author liuteng
	 */
	public static final String SAVE_BIZ_AUTH_RECORD = "biz-service/intf.custService/custIdentityAuthRecord";
	/**积分（权益）查询"服务*/
	public static final String QUERY_INTEGRAL = "biz-service/intf.custService/queryIntegral";
	
	/**积分扣减服务*/
	public static final String REDUCE_POINGTS = "biz-service/intf.chargeService/reducePoingts";
	/**积分历史查询服务*/
	public static final String QUERY_STARHIS = "biz-service/intf.custService/queryIntegralhis";
	
	/**积分消费查询服务*/
	public static final String QUERY_STARBONUSHIS = "biz-service/intf.custService/queryBonusIntegralhis";
	/**紧急开机服务*/
	public static final String EMERGENCYBOOT = "biz-service/intf.soService/emergencyBoot";
	
	/**天翼高清机顶盒预约信息规格查询*/
	public static final String QUERY_STB_RESERVE_SPEC_INFO = "biz-service/intf.soService/querySTBSpecInfo";
	/**天翼高清机顶盒预约订单提交*/
	public static final String COMMIT_STB_RESERVE_INFO = "biz-service/intf.soService/saveSTBReservInfo";
	/**天翼高清机顶盒预约回执打印信息查询*/
	public static final String QUERY_STB_RESERVE_INFO_FOR_PRINT = "biz-service/intf.soService/querySTBReservInfoForPrint";
	/**天翼高清机顶盒预约单查询*/
	public static final String QUERY_STB_RESERVE_INFO = "biz-service/intf.soService/querySTBReservInfo";
    /**一卡双号根据虚号查询主号*/
    public static final String QUERY_MAININFO = "bdw-service/intf.businessDispatchService/queryMainInfo";
    /**一卡双号黑名单新增*/
    public static final String ADD_BLACK_USERINFO = "bdw-service/intf.businessDispatchService/addBlackUserInfo";
    /**一卡双号黑名单查询*/
    public static final String QUERY_BLACK_USERINFO = "bdw-service/intf.businessDispatchService/queryBlackUserInfo";
    /**靓号协议****/
    public static final String QUERY_PRETTYNBR_INFO = "biz-service/intf.detailService/queryPrettyNbrInfosByOlId"; 
    /*渠道可支持的付费方式查询接口*/
    public static final String QUERY_AVILABLE_PAYMETHODCD = "biz-service/intf.chargeService/queryAvailablePayMethodCdByChannelId";
    /***电子档案查询 ***/
    public static final String QUERY_ELEC_RECORD_LIST = "biz-service/intf.fileOperateService/queryReceiptFileOrders";
    /***电子档案下载 ***/
    public static final String DOWN_LOAD_ELEC_RECORD = "biz-service/intf.fileOperateService/downLoadPrintFileFromFtp";
    /***黑名单失效 ***/
    public static final String BLACKLIST_INVALID = "bdw-service/intf.businessDispatchService/editBlackUserInfo";

    /*******************************ESS服务编码***************************************************************************************************/
    /**ESS订单查询*/
    public static final String ESS_QUERY_ORDER_LIST = "ess-orderListQry";
    /**ESS资源补录*/
    public static final String ESS_MKTRES_MAKEUP = "ess-mktResInstMakeUp";
    //ess订单详情
    public static final String QUERY_ORDER_DETAIL = "biz-service/intf.detailService/queryOrderDetailForEA";
    /**ESS订单类型、订单状态*/
    public static final String ESS_STATUS_TYPE_QUERY = "ess-orderStatusAndTypeQuery";
    /**ESS订单下发*/
    public static final String ESS_ORDER_REPEAL = "ess-orderRepeal";
    /**ESS导出*/
    public static final String ESS_ORDER_LIST_EXPORT = "ess-orderListExport";   
    /** 获取写卡数据 */
    public static final String CARD_RESOURCE_QUERY = "com.linkage.portal.service.lte.core.resources.CardResourceQuery";
    /*******************************ESS服务编码***************************************************************************************************/
   
    /**判断受理地区合法性判断*/
    public static final String CHECK_BYAREAID = "sys-checkByAreaId";
	/** 账户和使用人信息查询服务 */
	public static final String QUERY_ACCOUNT_USE_CUSTINFO = "biz-service/intf.pullingDataService/queryAccountAndUseCustInfo";
	
	 /**终端信息统计*/
    public static final String INTF_TERMSTATISIICSERVICE="res-TermStatisticService";
    /**终端销售信息明细统计查询*/
    public static final String INTF_TERMDETAILSTATISTICSERVICE="res-TermDetailStatisticService";
    
    /**员工关联渠道查询：受理渠道、归属渠道、归属渠道的店中商渠道*/
    public static final String INTF_QUERYALLCHANNELBYSTAFFID = "chan-service/interact/synStaffBean/qryChannelByStaff";

    /** 支付--保存记录 **/
    public static final String PAY_SERVICE_SAVE_RECORDS = "com.linkage.portal.service.lte.core.charge.SavePayRecords";

    /** 支付--更新状态 **/
    public static final String PAY_SERVICE_UPDATE_RECORDS = "com.linkage.portal.service.lte.core.charge.UpdatePayRecords";
    
    /** 二维码扫描绑定验证 **/
    public static final String QRCODE_VALIDATE = "sys-staffLoginByRelationCode";
    
    /** 二维码--绑定登录 **/
    public static final String BIND_QR_CODE_RECORDS = "sys-relationCodeByStaff";
    
    /**前置校验接口*/
    public static final String PRE_CHECK_ORDER = "biz-service/intf.soService/preCheckBeforeOrder";
    
    /** 宽带融合--标准地址查询 **/
    public static final String BORAD_BAND_ADDRESS_QRY = "qry.res.standaddress";
    
    /** 宽带融合--资源预判接口**/
    public static final String BORAD_BAND_RESOURCE_QRY = "qry.res.rescapability";
    
    /** 宽带融合--终端预判接口 **/
    public static final String BORAD_BAND_TERM_TYPE = "qry.res.terminaltype";
    
    /** 宽带融合--号码资源查询**/
    public static final String BORAD_BAND_NUMBER_QRY = "qry.res.number";
    
    /** 宽带融合--号码资源预占/释放 **/
    public static final String BORAD_BAND_NUMBER_REQUEST = "order.res.numberrequest";
    
    /** 宽带融合--帐号&接入号&密码生成（宽带/天翼高清） **/
    public static final String BORAD_BAND_ACCOUNT_REQUEST = "order.res.accountrequest";
    
    /** 宽带融合--预约装机时间查询 **/
    public static final String BORAD_BAND_TIME_QRY = "qry.oporder.manhour";
    
    /** 宽带融合--商机单下发 **/
    public static final String BORAD_BAND_UNITY_ORDER = "order.prod.opportunityorder";
    
    /** 宽带融合--销售单下发 **/
    public static final String BORAD_BAND_SALES_ORDER = "order.prod.salesorder";
    
    /** 宽带融合--订单详情查询 **/
    public static final String BORAD_BAND_ORDER_DETAIL = "qry.order.orderdetail";
    
    /** 一证五号修复--查询 **/
    public static final String QRY_CERTPHONENUM_REL = "qry.party.queryCmcCertNumRel";  
    
    
    /** 一证五号--查询 **/
    
    public static final String QRY_REL_INST_INFO = "qry.party.queryRelInstInfo";
    
    
    
     
    /** 一证五号--修复 **/
    public static final String MOD_CERTPHONENUM_REL = "order.party.changeCmcCertNumRel";
    
    
    /** 宽带融合--根据坐标查询门店 **/
    public static final String BORAD_BAND_QUERYCHANNEL_BYCOORDS = "yim-locationService/queryChannelByCoords";
    
    /** 宽带融合--根据门店名称模糊搜索门店 **/
    public static final String BORAD_BAND_QUERYCHANNEL = "yim-locationService/queryChannel";
    
    /** 宽带融合--根据当前渠道搜索附近门店 **/
    public static final String BORAD_BAND_QUERYCHANNEL_LISTBYID = "yim-locationService/queryChannelListById";
    
    /** 宽带融合--查询费用信息 **/
    public static final String BORAD_BAND_QUERYCHARGECONFIG = "biz-service/intf.chargeService/queryChargeConfig";
    
    /** 宽带融合--查询回执信息**/
    public static final String BORAD_BAND_QUERORDERFORPRT = "biz-service/intf.soService/queryOrderListInfoForPrintZT";
    
    /**支付平台获取tocken*/
    public static final String PAY_TOCKEN = "pay-token";
    
    /**支付平台查询订单*/
    public static final String PAY_QUERY = "pay-qryRepayTrans";
    
    /** 宽带甩单－－销售品单列表查询*/
    public static final String QUERY_SALES_ORDER_LIST = "qry.order.saleorderlist";
    
    /** 宽带甩单－－销售品详情查询*/
    public static final String QUERY_SALES_ORDER_DETAIL = "qry.order.orderdetail";
    
    /** 判断是否集团新装业务 */
    public static final String QUERY_IF_LTE_NEW_INSTALL = "biz-service/intf.pullingDataService/queryIfLteNewInstall";

    //实名制证件上传
    public static final String INTF_UPLOAD_IMAGE = "biz-service/intf.fileOperateService/upLoadPicturesFileToFtp";
    //实名制证件下载
    public static final String INTF_DOWNLOAD_IMAGE = "biz-service/intf.fileOperateService/downLoadPicturesFileFromFtp";

    /** 高实认证 */
    public static final String HIGH_REAL_NAME_AUTHENTICATE = "biz-service/intf.acctService/highRealNameAuthenticate";

    /** 撤销鉴权 */
    public static final String REVOKE_AUTHENTICATION = "biz-service/intf.acctService/revokeAuthentication";

    /** 橙分期业务标识 */
    public static final String QUERY_AGREEMENTTYPE = "biz-service/intf.prodOfferService/queryAgreementType";

    /** 购物车订单状态 查询 */
    public static final String QUERY_ORDER_STATUS = "biz-service/intf.detailService/queryCustomerOrderBasicInfo" ;

    /** 甩单终端串码预占校验接口（测试用，生产只走csb） */
    public static final String CHECK_DITCHORDER = "ter-terminal/ditchOrderCheck";
    
    /** 人证合一图片比对**/
    public static final String PIC_VERIFY = "PIC-service/verify";
    
    /**客户信息核验接口*/
    public static final String CHECK_CUST_CERT = "biz-service/intf.custService/checkCustCert";

    /** 客户资料同步接口 */
    public static final String CUSTINFO_SYNCHRONIZE = "biz-service/intf.custService/custInfoSynchronize";

    /** 证号关系预校验接口 */
    public static final String PRE_CHECK_CERT_NUMBER_REL = "biz-service/intf.pullingDataService/preCheckForCertAndNumberRel";

    /** 获取seq接口 */
    public static final String GET_SEQ = "biz-service/intf.soService/getSeq";
    /** 实名信息采集单订单提交 */
    public static final String CLT_ORDER_SUBMIT = "biz-service/intf.soService/commitCollectionOrder";
    
    /** 实名信息采集单订单确认 */
    public static final String CLT_ORDER_COMMIT = "biz-service/intf.soService/updateCollectionOrderExpOrEff";
    
    /** 实名信息采集单订单查询 */
    public static final String CLT_ORDER_QUERY = "biz-service/intf.detailService/queryCollectionOrders";
    
    /** 实名信息采集单订单项 */
    public static final String CLT_ORDER_ITEMS = "biz-service/intf.detailService/queryCollectionOrderItem";

    /** 实名信息采集单订单详情 */
    public static final String CLT_ORDER_Detail = "biz-service/intf.detailService/queryCollectionOrderItemDetail";
    
    /** 查询特殊协议服务 */
    public static final String QUERY_SPECIALPROTOCOL_BYOLID = "biz-service/intf.detailService/querySpecialProtocolByOlId";
    
    /**获取初审信息接口*/
    public static final String QRY_PRELININARY_INFO = "biz-service/intf.acctService/qryPreliminaryInfo";
    
    /** 查询某权限下的员工列表*/
    public static final String QRY_OPERATESPEC_STAFF_LIST = "sys-queryOperaStaff";
    
    /**实名审核记录接口*/
    public static final String SAVE_PHOTOGRAPH_REVIEW_RECORD = "biz-service/intf.fileOperateService/saveRealCheckRecord";

    /**员工身份信息验证*/
    public static final String CHECKSTAFFMESSAGE = "sys-checkStaffMessage";
    /**员工密码修改*/
    public static final String UPDATTEPASSWORD = "sys-updatePassword";
    /**销售品打包礼包查询*/
    public static final String QUERY_GIFT_PACKAGE_OFFER = "biz-service/intf.prodOfferService/queryGiftPackageList";
    /**销售品打包礼包成员查询*/
    public static final String QUERY_GIFT_PACKAGE_MEMBER_OFFER = "biz-service/intf.prodOfferService/queryGiftPackage2ObjList";
    /**查询云平台身份证信息*/
    public static final String QUERY_CLOUD_CERT = "/api/v1/queryCert?";
    /**营销推荐清单查询服务*/
    public static final String QUERY_MKT_CUST_LIST = "biz-service/intf.couponService/queryMktCustList";
    /**营销标签查询服务*/
    public static final String QUERY_PROD_INST_STATS = "biz-service/intf.couponService/queryProdInstStats";
    /**营销活动列表查询服务*/
    public static final String QUERY_MKT_ACTIVITY_LIST = "biz-service/intf.couponService/queryMktActivityList";
    /**营销任务（接触）反馈结果记录服务*/
    public static final String SAVE_MKT_CONTACT_RESULT = "biz-service/intf.couponService/saveMktContactResult";
}

