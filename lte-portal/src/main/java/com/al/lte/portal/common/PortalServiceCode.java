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
     * 套餐余量查询--新
     */
    public static final String SERVICE_QUERY_OFFER_USAGE_NEW = "com.linkage.portal.service.lte.core.charge.QueryOfferUsageNew";
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
     * 欠费账目查询服务
     */
    public static final String GET_OWE_ACCOUNT_CHARGE="com.linkage.portal.service.lte.core.charge.GetOweAccountCharge";
    
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
    
    /** 帐单查询 新 */
    public static final String QUERY_BILL_NEW = "com.linkage.portal.service.lte.core.charge.QueryCustomizeBillNew";
    /** 详单查询 */
    public static final String QUERY_BILL_DETAIL = "com.linkage.portal.service.lte.core.charge.QueryCustomizeBillDetail";
    
    /** 详单查询  新*/
    public static final String QUERY_BILL_DETAIL_NEW = "com.linkage.portal.service.lte.core.charge.QueryCustomizeBillDetailNew";
    
    
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
    /** 新票据打印 服务*/
    public static final String NEW_PRINTI_NVOICE = "com.linkage.portal.service.lte.core.charge.NewPrintInvoice";
    /** 新票据成功打印通知 服务*/
    public static final String INVOICE_NOTICE = "com.linkage.portal.service.lte.core.charge.InvoiceNotice";
    /** 新票据回收通知 服务*/
    public static final String INVOICE_REVERSE = "com.linkage.portal.service.lte.core.charge.InvoiceReverse";   
    /** 呆坏账*/
    public static final String DO_BAD_DEBTS = "com.linkage.portal.service.lte.core.charge.DoBadDebts";
    /** 调账*/
    public static final String DO_ADJUST_ACCOUNT = "com.linkage.portal.service.lte.core.charge.DoAdjustAccount";
    
    /**呆坏账 */
    public static final String DO_DERATE_DUE = "com.linkage.portal.service.lte.core.charge.DoDerateDue";
    
    /** 客户化账单打印 */
    public static final String GET_CUSTOMIZE_BILL_DATA = "com.linkage.portal.service.lte.core.charge.PrintCustomizeBill";
    /** 单点登录 */
    public static final String SIGLE_SIGN_CHECK_LOGIN= "com.linkage.portal.service.lte.core.system.CheckLogin";
    /** 充值订单查询*/
    public static final String QUERY_CHARGE_RECORD = "com.linkage.portal.service.lte.core.charge.QueryChargeRecord";
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

    /** bianxw 首页菜单-查询所有 */
    public static final String MENU_QUERY_ALL = "sys-queryMenuInfo";

    /** bianxw 首页快捷菜单 */
    public static final String MAIN_SHORT_CUT = "sys-queryShortcutMenu";
    
    public static final String CHECK_RULE_PREPARE = "rule-service/so.rule.ruleSMO/check4GRuleSoPrepare";
    
    public static final String INTF_STAFF_LOGIN = "sys-staffLogin";
    
    public static final String SERVICE_SEND_SMS = "com.linkage.portal.service.lte.core.system.SendMsgInfo";
    
    public static final String INTF_TERM_QUERY_SERVICE = "res-TermQueryService";
    
    public static final String INTF_TERM_VALIDATE = "res-TermValidateService";
    
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
    
    public static final String QUERY_COMPPRODMEMBER_LIST ="biz-service/intf.prodInstService/queryCompProdMemberByAn";
    
    public static final String QUERY_COMPSPEC_BY_SPECID ="biz-service/intf.productService/queryCompPspecGrpsBySpecId";
 
    public static final String QUERY_OFFER_SPEC = "biz-service/intf.prodOfferService/queryOfferSpecParamsBySpec";
    
    public static final String QUERY_MAIN_OFFER = "biz-service/intf.prodOfferService/queryMainOfferSpecList"; 
    
    public static final String QUERY_OFFER_SPEC_CONFIG = "queryOfferSpecConfig";
    
    public static final String INTF_QUERY_PHONENUMBER_LIST="res-PnQueryService";
    
    public static final String QUERY_STAFF_LIST = "sys-queryStaffInfo";
    
    public static final String INTF_RESERVE_PHONENUMBER="res-PnReserveService";
    
    public static final String INTF_RELEASE_UIM="res-UIMReleaseService";
    
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
    
    public static final String INTF_BATCH_IMPORT="biz-service/intf.batchOrderService/saveBatchOrderImport";
    
    public static final String INTF_BATCH_IMPORTQUERY="biz-service/intf.batchOrderService/queryBatchOrderList";
    
    public static final String INTF_BATCH_ORDERQUERY="biz-service/intf.batchOrderService/queryBatchOrderTemplageList";
    
    public static final String INTF_BATCH_ORDERDEL="biz-service/intf.batchOrderService/updateOrderListForCustOrderDel";
    
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
    //查询账户信用额度默认值
    public static final String INTF_DEFAULT_CREDIT_LIMIT = "biz-service/intf.soService/queryAttrSpecValueByAttrId";
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
    //查询可订购附属
    public static final String QUERY_ATTACH_SPEC = "biz-service/intf.prodOfferService/queryCanBuyAttachOfferSpec";
    //查询已订购附属
    public static final String QUERY_ATTACH_OFFER = "biz-service/intf.prodOfferInstSerivce/queryAttachOfferByProdId";
    //查询已订购附属参数
    public static final String QUERY_OFFER_PARAM = "biz-service/intf.prodInstService/queryOfferParam";
    //加载实例信息
    public static final String LOAD_INST = "biz-service/intf.pullingDataService/queryProdInfoFromProv"; 
    //订单提交
    public static final String ORDER_SUBMIT = "biz-service/intf.soService/commitOrderListAndBusOrder";
    //v网群号
    public static final String ORDER_SEQ = "biz-service/intf.soService/querySeq";
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
   
    /*群基本信息查询接口*/
    public static final String QRY_GROUP_BASIC_INFO = "biz-service/intf.prodInstService/queryBasicGroupDetail";

    /*群详细信息查询接口*/
    public static final String QRY_GROUP_INFO = "biz-service/intf.prodInstService/queryDetailInfoServe";

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
    //首页推荐热卖产品
    public static final String MAIN_HOTPRODUCT = "hotProd";
    //产品实例所属群组产品信息查询
    public static final String QUERY_COMPPRODINST_BY_PRODID = "biz-service/intf.prodInstService/queryCompProdInstByProdId";
    
    //押金列表查询
    public static final String QUERY_BAMOBJFOREITEMS = "biz-service/intf.chargeService/queryBamObjForegitfItems";
    //押金历史列表
    public static final String QUERY_FOREGIFTOPERDETAIL = "biz-service/intf.chargeService/queryForegiftOperDetail";
    //通过uim卡号查询用户信息
    public static final String QUERY_NUMBYUIM = "biz-service/intf.prodInstService/queryProdAccessNumByUim";
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
    //bianxw 购物车 详情
    public static final String SHOPPING_CART_INFO = "biz-service/intf.detailService/queryCustemerOrderDetail" ;
    //bianxw 受理单 详情
    public static final String SHOPPING_CART_DETAIL = "biz-service/intf.detailService/queryOrderItemDetail" ;
    //购物车环节
    public static final String QUERY_CART_LINK = "biz-service/intf.detailService/queryCustOrderLinkInfo";
    //施工单状态
    public static final String QUERY_CONSTRUCTION_STATE = "biz-service/intf.pullingDataService/workOrderQuery";
    //bianxw 作废发票
    public static final String UPDATE_INVOICE_INVALID = "biz-service/intf.chargeService/updateInvoiceInvalid" ;
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
    
    public static final String STAFF_LOGIN_OUT="sys-staffLoginOut";

    public static final String INTF_INVALID_INVOICE = "biz-service/intf.chargeService/updateInvoiceInvalid";
    
    public static final String SERVICE_QUERY_BUSITYPE = "com.linkage.portal.service.lte.core.resources.QueryBusitype";
    
    public static final String SERVICE_QUERY_BUSIACTIONTYPE = "com.linkage.portal.service.lte.core.resources.QueryBusiactiontype";
    
    public static final String CHECK_RULE_TO_PROV = "biz-service/intf.soService/checkRuleToProv" ;
    
    public static final String SERVICE_INSERT_ORDERYSLINFO = "com.linkage.portal.service.lte.core.resources.SubOrderYSLinfo";
    
    public static final String SERVICE_QUERY_ORDERYSLINFO = "com.linkage.portal.service.lte.core.resources.QueryOrderYSLinfo";
    
    public static final String SERVICE_GET_TRANID = "com.linkage.portal.service.lte.core.system.GetTranId";

    public static final String INSERT_BUSIRECORD = "com.linkage.portal.service.lte.core.resources.InsertBusirecord";

    public static final String CREATE_ORDERLONGER = "com.linkage.portal.service.lte.core.system.Createorderlonger";
    
    //jinjan 停复机时间查询
    public static final String QUERY_SA_DEAL_RECORDS = "biz-service/intf.saDealRecordService/querySaDealRecordsForZs" ;
    
}
