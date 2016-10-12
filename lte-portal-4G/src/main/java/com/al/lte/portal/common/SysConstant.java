package com.al.lte.portal.common;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.al.ecs.common.entity.LevelLog;
import com.al.ecs.common.util.PortalConstant;
import com.al.ecs.log.Log;

/**
 * 集团LTE共同常量类 . 
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-3-24
 * @createDate 2012-3-24 下午11:24:41
 * @modifyDate tang 2012-3-24 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
public final class SysConstant {

	private static Log log = Log.getLog(SysConstant.class);
	

    /** staff Session key */
    public static final String SESSION_KEY_LOGIN_STAFF = PortalConstant.SESSION_KEY_LOGIN_STAFF;
    /** cust Session key */
    public static final String SESSION_KEY_CUST_INFO = "_ecs_cust_session_key";
    /** Session Key　验证码 */
    public static final String SESSION_KEY_IMAGE_CODE = "is_valid_imagecode_session_key";

    /** 记录日志级别 */
    public static final LevelLog CALL_SERVICE_LOG_FLAG = LevelLog.DB;

    /** sms Session key */
    public static final String SESSION_KEY_LOGIN_SMS = "_ecs_sms_session_key";
    /** 随机二位序列号 */
    public static final String SESSION_KEY_LOGIN_RANDONCODE = "_ecs_sms_session_code";
    /**短信验证码发送位数*/
    public static final String MSG_NUMBERS ="MSG_NUMBER";    
    /** 补换卡短信验证短信发送时间 */
    public static final String SESSION_KEY_TEMP_CHANGEUIM_SMS_TIME = "_session_key_temp_changeuim_sms_time";    
    /** 补换卡短信验证 sms Session key */
    public static final String SESSION_KEY_CHANGEUIM_SMS = "_ecs_changeuim_sms_session_key";
    /** 补换卡短信验证随机二位序列号 */
    public static final String SESSION_KEY_CHANGEUIM_RANDONCODE = "_ecs_changeuim_sms_session_code";
    /**免补换卡短信验证权限*/
    public static final String CHANGEUIMSMS_CODE = "CHANGEUIMSMS_CODE";
    /**跳过二次鉴权验证权限*/
    public static final String SECOND_JUMPSPECIAL = "JUMPSPECIAL";

    
    public static final String SESSION_KEY_PAD_FLAG="_session_pad_flag";
    
    public static final String SESSION_KEY_APP_FLAG="_session_app_flag";
    
    public static final String SESSION_KEY_PADVERSION_FLAG="_session_padVersion_flag";
    
    /** 短信发送时间 */
    public static final String SESSION_KEY_TEMP_SMS_TIME = "_session_key_temp_sms_time";
    /**用户登录错误次数*/
    public static final String SESSION_KEY_LOGIN_ERROR_CHECK_COUNT = "_login_error_check_count";
    /**平台配置信息*/
    public static final String SESSION_KEY_AGENT_PORTAL_CONFIG = "_agent_portal_config";
    /**平台类型：4G=LTE,转售=MVNO	*/
    public static final String SESSION_KEY_PORTAL_TYPE = "_session_portal_type";
    /**渠道内容	*/
    public static final String SESSION_KEY_STAFF_CHANNEL = "_staff_channel";
    /**菜单内容	*/
    public static final String SESSION_KEY_MENU_LIST = "__menuList";
    
    /**菜单内容中被授权访问的url	*/
    public static final String SESSION_KEY_MENU_AUTH_URL_LIST = "__authUrlInMenuList";
    
    
    public static final String SESSION_KEY_EDITCHARGE="_editchargeList";
    public static final String SESSION_KEY_ADDCHARGE="_addchargeList";
    
    
    public static final String SESSION_KEY_EDITADJUSTCHARGE="_editAdjustchargeList";
    
    public static final String SESSION_KEY_CUSBILL = "_session_key_cusbill";
    
    public static final String EDITCHARGE_CODE="EDITCHARGE";
    
    public static final String ADDCHARGE_CODE="ADDCHARGE";
    
    
    public static final String EDITADJUST_CODE="DEDIT_ADJUST";
    
    //生失效时间权限设置
    public static final String EFF_TIME="EFF_TIME";
    
    //分段受理权限编码
    public static final String FDSL="FDSL";
    
    //分段受理订单属性规格ID
    public static final String FDSL_ORDER_ATTR_SPECID = "111111198";
    
    public static final String SESSION_KEY_EDITTAXPAYER="_edittaxpayer";
    
    public static final String SESSION_KEY_JUMPAUTH="_jumpauth";
    
    public static final String SESSION_KEY_VIEWSENSI="_VIEWSENSI";
    
    public static final String SESSION_KEY_OVERDUEBUSI = "_overduebusi";
    
    public static final String SESSION_KEY_BANKPAYMENT = "_bankPayment";
    
    public static final String SESSION_KEY_AREA = "_area"; //地区
    
    public static final String SESSION_KEY_CHANNEL = "_channel"; //渠道
    
    public static final String SESSION_KEY_NUMBER = "_number"; // 号码
    
    public static final String SESSION_KEY_TERMINAL = "_terminal"; // 终端
    
    public static final String SESSION_KEY_AGREEMENT = "_agreement"; // 合约
    
    public static final String SESSION_KEY_DEPOSIT="_DEPOSIT";
    //纳税人权限控制
    public static final String EDITTAXPAYER_CODE="EDITTAXPAYER";
    //客户鉴权跳过
    public static final String JUMPAUTH_CODE="JUMPAUTH";
    //异常单释放查询同渠道权限
    public static final String EXCEPTION_ORDER_CHANNEL_QUERY="BQDYCDSFQX";
    //受理订单页面查询渠道的权限控制,如果有权限，则查询某地区下的所有渠道；否则仅查询登录员工当前渠道
    public static final String QRYCHANNELAUTH_CODE="REGION_CHANNEL_SELECT";
    //查看身份证权限(无脱敏)
    public static final String VIEWSENSI_CODE="TMXX";
    //欠费用户能否通过省内校验继续受理的员工权限
    public static final String OVERDUE_BUSI_CODE = "OVERDUEBUSI";
    //用户欠费的下省校验错误编码（两种均可能）
    public static final String PROV_CHECK_OVERDUE_1 = "110019";
    public static final String PROV_CHECK_OVERDUE_2 = "110145";
    //能否选择银行托收
    public static final String ADJUSTBANKPAYMENT_CODE = "BANKPAYMENT";
    //代理商保证金校验
    public static final String DEPOSIT_CODE="AGENT_DEPOSIT";
    //电子档案查询权限
    public static final String ELEC_RECODE_AUTH_CODE="DZDACXQX";
    //【黑名单失效】权限
    public static final String IS_BLACKLIST_INVALID_AUTH="HMDSX";
    /**默认皮肤*/
    public static final String THEME_DEFAULT = "default";

    public static Integer OFFER_TYPE_MAIN = 1;//主销售品
    
    public static String MAIN_OFFER_ROLE_TYPE = "400";
    public static String VICE_OFFER_ROLE_TYPE = "401";
    
    //是否记录接口日志 ON OFF
    public static String WRITE_LOG_FLAG = "WRITE_LOG_FLAG";
    //app登录标识, o:打头 说明是公网登录    i:打头 说明是内网登录
    public static String APP_LOGIN_FLAG = "APP_LOGIN_FLAG";
    //是否记录日志平台 ON OFF
    public static String WRITE_ASYNCHRONOUS_FLAG = "WRITE_ASYNCHRONOUS_FLAG";
    //是否记录接口日志出入参，数据库字段类型为CLOB，N代表不记录，Y代表记录
    public static String WRITE_LOG_DETAIL = "WRITE_LOG_DETAIL";
    //XSS过虑总开关  ON-开，OFF或者没有配置-关
    public static String XSS_FILTER_FLAG = "XSS_FILTER_FLAG";
    public static String LOG_PS = "PS";
    public static String LOG_UNILOG = "UNILOG";
    public static String LOG_NONE = "NONE";
    //对应统一日志平台的门户日志类型
    public static String LOG_TYPE = "PortalTransLog";
    //对应统一日志平台的门户日志默认表名
    public static String PORTAL_SERVICE_LOG = "PORTAL_SERVICE_LOG";
    //对应统一日志平台的门户日志永久保存表名
    public static String PORTAL_SERVICE_LOG_P = "PORTAL_SERVICE_LOG_P";
    //对应统一日志平台的门户日志保存一年表名
    public static String PORTAL_SERVICE_LOG_Y = "PORTAL_SERVICE_LOG_Y";
    //对应统一日志平台的门户日志保存一周表名
    public static String PORTAL_SERVICE_LOG_W = "PORTAL_SERVICE_LOG_W";

    /**刷新缓存动作参数分组分隔符*/
    public final static String CON_REF_PARAM_ACTION_GROUP = ",";

    public static String CSB_FLAG = "CSB_FLAG";
    public static String ASYNC_FLAG = "ASYNC_FLAG";
    public static String FILE_PREFER_FLAG = "FILE_PREFER_FLAG";
    public static String DEF_HTTP_FLAG = "DEF_HTTP_FLAG";
    public static String ABS_DIRECTORY_FLAG = "ABS_DIRECTORY_FLAG";
    public static String ABS_DIRECTORY_KEY = "ABS_DIRECTORY_KEY";
    public static String COMPRESS_JS_LEVEL = "COMPRESS_JS_LEVEL";
    public static String COMPRESS_JS_LOGIN_LEVEL = "COMPRESS_JS_LOGIN_LEVEL";
    public static String LEVEL_NONE = "NONE";
    public static String LEVEL_BASE = "BASE";
    public static String LEVEL_BUSI = "BUSI";
    public static String LEVEL_LOGIN_BASE = "LOGIN_BASE";
    public static String BASE_VERSION = "BASE_VERSION";
    public static String LOGIN_BASE_VERSION = "LOGIN_BASE_VERSION";
    public static String BUSI_VERSION = "BUSI_VERSION";
    
    public static final String SERVER_NAME = "_server_name";
    public static final String SERVER_IP = "_server_ip";
    public static String ASYNC_KEY = "-async";
    public static String JSVERSION = "JSVERSION";
    public static String APPDESC = "APPDESC";
    public static String APPDESC_DEV = "DEV";
    public static String APPDESC_LTE = "LTE";
    public static String APPDESC_MVNO = "MVNO";
    
    public static String ON = "ON";
    public static String OFF = "OFF";

    public static String ORDER_SUBMIT_TOKEN = "token_1";
    public static String LOG_BUSI_RUN_NBR = "log_busi_run_nbr";
    //营销资源图片地址定义
    public static String MKT_RES_PIC_URL = "MKT_RES_PIC_URL";
    public static String MKT_RES_STATUSCD_USABLE = "1001";	   // 可用
    public static String MKT_RES_STATUSCD_HAVESALE = "1115";   // 已销售未补贴
    public static String MKT_RES_ATTR_TERMINAL_PRICE = "65010057";
    public static String MKT_RES_ATTR_TERMINAL_COLOUR = "60010004";
    /**
     ***  发票打印相关常量定义  BEGIN ***
     */
    public static boolean isAutoPrint = false; // 是否自动打印发票收据免填单（在需要打印的前提下）,默认为false
	public static long previewTimes = 3000;    // 自动打印的情况下，预览的界面停留的时间，毫秒为单位,默认3秒钟
	
	//字符编码
	public final static String ENCODE_ISO = "iso-8859-1";
	public final static String ENCODE_GB18030 = "GB18030";
	public final static String ENCODE_UTF8 = "UTF-8";
	
	//模板文件后缀
	public final static String P_MOD_FILE_SUBFIX = ".jasper";
	
	//打印类型
	public final static String PRINT_TYPE_HTML_NAME = " HTML ";
	public final static String PRINT_TYPE_PDF_NAME = " PDF ";
	
	public final static String PRINT_TYPE_HTML = "1";
	public final static String PRINT_TYPE_PDF = "2";
	public final static String PREVIEW_PDF_SIGN="0";
	public final static String PREVIEW_SIGN="1";
	public final static String PREVIEW_SIGN_HTML="4";
	public final static String SAVE_PDF="2";
	public final static String SAVE_NO_SIGN_PDF="3";
	public final static String SAVE_SIGN_PDF_APP="5";
	public final static String PREVIEW_SIGN_PDF="6";
	//业务模板目录
	public final static String P_MOD_BASE_DIR = "report/";
	public final static String P_MOD_SUB_BASE_DIR = getSysConfDir() + P_MOD_BASE_DIR;
	public final static String P_MOD_SUB_CTG_HTML = "ctghtml/";
	public final static String P_MOD_SUB_CTG_PDF = "ctgpdf/";
	public final static String P_MOD_SUB_INVOICE = "invoice/";
	public final static String P_MOD_SUB_OLD2NEW = "old2new/";
	public final static String P_MOD_SUB_STBRESERVE = "STBreserve/";
	public final static String P_MOD_ABS_INVOICE = "D:/temp/invoice/";
	//充值收据（发票）模板目录
	public final static String P_MOD_DIR_CHARGE_RECEIPT = "chargeReceiptAndInvoice/";
	
	public final static String P_FILE_PROTOCOL = "file://";
	
	//业务模板名称
	public final static String P_MOD_FILE_CRM_COMMON = "CtgPrintCommonMod";  // 公共回执打印业务(购物车业务回执类型)	
	//发票模板名称
	public final static String P_MOD_FILE_INVOICE = "invoiceGroup";  // 发票打印业务
	//以旧换新模板名称
	public final static String P_MOD_FILE_OLD2NEW = "printOld2New";  // 发票打印业务
	//天翼高清机顶盒预约回执主模板
	public final static String P_MOD_FILE_STBRESERVE = "receiptMain";
	//充值收据（发票）模板名称
	public final static String P_MOD_FILE_CHARGE_RECEIPT = "chargeReceipt"; //充值收据
	//业务模板类型
	//业务类型－重新定义(加载模板使用)
	public final static String BUSI_TYPE_FRESH_DATA = "0"; // 解决部分需要在受理提交之后重新保存回执信息的业务
	public final static String BUSI_TYPE_CRM_COMMON = "1"; // 公共回执打印业务(购物车业务回执类型)
	public final static String BUSI_TYPE_WITH_PARAM = "2"; // 非购物车-页面传参类回执打印业务
	public final static String BUSI_TYPE_TERMINAL_ORDER = "9"; // 终端预约回执模板
	
	//业务类型
	
	//打印控制
	//常量定义
	public final static int INT_0 = 0;
	public final static int INT_1 = 1;
	public final static int INT_2 = 2;
	public final static int INT_3 = 3;
	public final static int INT_4 = 4;
	public final static int INT_5 = 5;
	public final static int INT_6 = 6;
	public final static int INT_100 = 100;
	
	//打印数据控制符
	public final static String STR_Y = "Y"; 
	public final static String STR_N = "N";
	public final static String STR_SPE = "  ";
	public final static String STR_COM = "，";
	public final static String STR_SPI = "；";
	public final static String STR_PAU = "、";
	public final static String STR_SEP = "：";
	public final static String STR_STO = "。";
	public final static String STR_END = ":;";
	public final static String STR_ENT = "\n";
	public final static String STR_LL_BRE = "(";
	public final static String STR_RL_BRE = ")";
	public final static String STR_LM_BRE = "[";
	public final static String STR_RM_BRE = "]";
	public final static String STR_LB_BRE = "【";
	public final static String STR_RB_BRE = "】";
	public final static String STR_MINUS = "-"; 
	public final static String STR_POINT = ".";
	public final static String STR_UNDERLINE = "______";
	//套餐费
	public final static String PACKAGE_TITLE = "20020047";
	//流量
	public final static String FLOW_TITLE = "20020045";
	//语音
	public final static String VOCIE_TITLE = "20020044";
	//短信
	public final static String MESSAGE_TITLE = "20020046";

	//打印节点结构控制-客户信息类型
	public final static int CUST_TYPE_NOR = INT_1;
	public final static int CUST_TYPE_ORG = INT_2;
	//打印节点结构控制-资费项信息类型
	public final static int OS_INFO_IN = INT_1;
	public final static int OS_INFO_OUT = INT_2;
	//打印节点结构控制-付费信息类型
	public final static int FEE_TYPE_ORDER = INT_1;
	public final static int FEE_TYPE_ACCT = INT_2;
	public final static int FEE_TYPE_CHARGEITEMS = INT_3;
	//打印节点结构控制-帐户付费方式
	public final static String ACCT_FEE_TYPE_CASH = "现金";
	//打印节点结构控制-业务信息类型
	public final static int OE_TYPE_1 = INT_1;
	public final static int OE_TYPE_2 = INT_2;
	public final static int OE_TYPE_3 = INT_3;
	public final static int OE_TYPE_4 = INT_4;
	public final static int OE_TYPE_5 = INT_5;
	public final static int OE_TYPE_6 = INT_6;
	
	//订单--产品实例所属群产品查询 中 组合产品属性itemSpecId=短号 的编码，开发37906联调10010011
	public final static String ORDER_SHORTNUM_CODE = "SHORTNUM_CODE" ;
	//产品属性中的付费方式
	public final static String PAY_METHOD_CODE = "PAYMETHOD_CODE" ;
	
	//根据 系统管理中，“营业受理”对应的操作规格编码【权限表的主键，非 权限编码】
	//public final static String AREA_OPERAT_SPEC_CD = "userCenter" ;
	//系统管理中，默认的：受理地区 维度编码
	public final static String AREA_DIMENSION_CD = "AREA_SL_CODE" ;
	//系统管理中，默认的：管理地区 维度编码
	public final static String AREA_DIMENSION_CD_MANGER = "AREA_GL_CODE" ;
	//
	public final static String ORDER_PARAMS_LIMIT_IDS = "ORDER_PARAMS_LIMIT_IDS" ;

	//UIM卡
	public final static String UIMTYPECD = "103006000" ;
	//手机终端
	public final static String PHONETYPECD = "101001000" ;

	//模板加载
	/**
	 * 获取配置文件根目录路径
	 * @return
	 */
	public static String getSysConfDir() {
		String tmpFileName = "/" + P_MOD_BASE_DIR + P_MOD_SUB_CTG_PDF + P_MOD_FILE_CRM_COMMON + P_MOD_FILE_SUBFIX;
		String baseFileDir = SysConstant.class.getClassLoader().getResource(tmpFileName).getFile();
		baseFileDir = baseFileDir.substring(0, baseFileDir.indexOf(tmpFileName) + 1);
		log.info("回执模板文件根目录路径: " + baseFileDir );
		return baseFileDir;
	}

	/**
	 * 模板名称集合
	 * @return
	 */
	public static List<String> getModuleFileName() {
		List<String> moduleFileNames = new ArrayList<String>();
		
		//缓存公共模板
		moduleFileNames.add(P_MOD_BASE_DIR + P_MOD_SUB_CTG_HTML + P_MOD_FILE_CRM_COMMON + P_MOD_FILE_SUBFIX);
		moduleFileNames.add(P_MOD_BASE_DIR + P_MOD_SUB_CTG_PDF + P_MOD_FILE_CRM_COMMON + P_MOD_FILE_SUBFIX);
		
		return moduleFileNames;
	}
    /** csb动作编码 */
    public static final String CSB_ACTION_CODE = "0";
    /** csb服务等级 */
    public static final String CSB_SERVICE_LEVEL = "1";
    /** csb密码 */
    public static final String CSB_SRC_SYS_SIGN = "123";
    /** 翼销售csb密码 */
    public static final String CSB_SRC_SYS_SIGN_YSX = "yxs1000000244";
    /** csb组织编码-集团 */
    public static final String CSB_ORG_ID_GROUP = "100000";
    /** csb发起方编码-集团 4G*/
    public static final String CSB_SRC_SYS_ID_LTE = "1000000206";
    /** csb发起方编码-集团转售*/
    public static final String CSB_SRC_SYS_ID_MVNO = "1000000210";
    /** csb发起方编码-翼销售*/
    public static final String CSB_SRC_SYS_ID_APP = "1000000244";
    
    /**短信验证码是否发送标识*/
    public static final String MSG_CODE_FLAG = "msgCodeFlag";
    
    public static final String IS_DEFAULT_TEMPLATE = "0";
    
    public static final String TEMPLATE_LIST = "SESSION_TEMPLATE_LIST";
    /** 用于系统管理的门户系统编码，约定为10002*/
    public static final String SM_PLATFORM_CODE = "10002";
    
    public static final String SM_PADPLATFORM_CODE="10010";
    
    public static final String SM_APPPLATFORM_CODE="10008";
    /** 强商标识*/
    public static final String SM_AGENT_PLATFORM_CODE="10019";
    
    public static final String SM_PADPLATFORM_ANDROID_CODE="10011";
    /** 是否免预存编码*/
    public static final String REDUCE_PRESTORE_STATE = "130010";
    /***/
    public static final String MSG_NUMBER ="5011";
	/**密码为初始密码返回编码*/
    public static final String R_PW_SIMLE = "14";
    /**登录超过90天未修改密码返回编码*/
    public static final String R_PW_UPDATE = "11";
    
    public static String[] itemType={"未获取到订单类型","新装","套餐变更","主副卡成员变更","产品属性变更","挂失/解挂","停机保号/复机","预拆机","拆机","违章拆机","未激活拆机","欠费拆机","改客户资料返档","补换卡","可选包退订/订购","过户","改账务定制关系","改产品密码"}; 
    
    //公告附件地址
    public static String NOTICE_URL = "NOTICE_URL";
    //操作手册附件地址
    public static String MANUAL_URL = "MANUAL_URL";
    
    public static final String SESSION_KEY_REPORT_CHECK = "is_report_check_session_key";
    
    /** 套餐变更时是否显示省内订单属性，每个省份一个配置，命名为provOrderAttrFlag-XXXXXXX，0-打开，1-关闭 */
    public static final String PROV_ORDER_ATTR_FLAG = "provOrderAttrFlag-";
    
    /** 与系管交互的门户平台编码 */
    public static final String PLATFORM_ID_TO_SYS = "2";
    
    /** 过滤器过滤级别，默认为1；0：不过滤；1：登录后员工必须有渠道；2：替换提交到服务器端的敏感信息（staffId，staffCode等）；3：对需要鉴权的访问地址进行鉴权 ；4：屏蔽报文（value）中包含已配置关键字的访问*/
    public static final String PORTAL_FILTER_LEVEL = "portalFilterLevel";
	
    /** 门户敏感信息过滤器,过滤地址白名单(该地址不再过滤敏感信息) ,命名为portalSensitiveInfoFilterWhiteList-XXX*/
    public static final String PORTAL_SENSITIVE_INFO_FILTER_WHITE_LIST = "portalSensitiveInfoFilterWhiteList-";
    
    /** 分段受理,是否显示订单取消按钮 */
    public static final String STEP_ORDER_CANCEL_OPER_FLAG = "_step_order_cancel_oper_flag";

    /** 一个用户只登录一次标识[Y：启用，其它停用]*/
	public static final String ONE_USER_ONE_LOGIN = "one_user_one_login";
	
	/** 保存到session中的路由参数关键字 */
	public static final String SESSION_DATASOURCE_KEY = "_currentDatasourceKey";
	
//	/** 是否启用报文屏蔽过滤器，Y启用，N不启用 */
//	public static final String IS_FILTER_FORBIDDEN = "is_filter_forbidden";
	
	/** 报文屏蔽过滤器：屏蔽报文（value）中包含已配置关键字的访问，关键字名称（多个关键字以#分隔） */
	public static final String FORBIDDEN_VALUE_KEYWORD = "forbiddenValueKeyWord";
	
	/** 报文屏蔽过滤器：关键字分隔符*/
	public static final String FORBIDDEN_VALUE_KEYWORD_SEP = "#";
	
	/** 文件压缩后缀 */
	public static final String COMPRESS_FILE_SUFFIX = "_compressFileSuffix";
	
	/** session参数，是否是javascript开发者模式（Y则展示源javascript文件 ，否则展示压缩后文件） */
	public static final String ATTR_JAVASCRIPT_DEVELOPER = "_attrJavascriptDeveloper";
	
	/** session参数值，Y表示是javascript开发者模式*/
	public static final String IS_JAVASCRIPT_DEVELOPER = "Y";
	
	/** session参数值，Y表示是javascript开发者模式*/
	public static final String COMPRESS_ALL_JS = "COMPRESS_ALL_JS";
	//新版打印控制开关
	public static final String PRINTNEW = "PRINTNEW";

    //赠送类打印信息编码
    public static final String GIVE190001 = "190001";
    public static final String GIVE190002 = "190002";

    //积木套餐流量语音标识
    public static final String FLOW = "2207";
    public static final String SPEECH = "2102";




    //批量受理查询，管理员权限 BATCHORDER_GLY，营业班长权限 BATCHORDER_YYBZ	By ZhangYu 2015-10-19
    public static final String BATCHORDER_GLY = "PLDDCX_GLY";
    public static final String BATCHORDER_YYBZ = "PLDDCX_YYBZ";
    public static final String URL_BATCHORDERQRY = "batchOrder/batchImportQuery";

	//撤单管理员权限 GLY，营业班长权限 YYBZ
    public static final String GLY="CD_GLY";
    public static final String YYBZ="CD_YYBZ";
    public static final String URL_ORDERUNDO="orderUndo/main";
    //工单查询管理员权限 GDCX_GLY，营业班长权限 GDCX_YYBZ
    public static final String GDCX_GLY="GDCX_GLY";
    public static final String GDCX_YYBZ="GDCX_YYBZ";
    //权限查询 “0”有权限，“1”无权限
    public static final String QX_YES="0";
    public static final String QX_NO="1";
    
    /** 原始协议名（http https），用于重定向 */
	public static final String ORI_SCHEME = "ORI_SCHEME";
	
	//身份证类型开关
	public static String IDTYPE = "IDTYPE";
    
	/** 产品规格属性--使用人，产品规格属性ID */
	public static final String PROD_ITEM_SPEC_ID_USER = "800000011";
	
	/** 以旧换新配置规格属性--回购产品型号 */
	@Deprecated
	public static final String SPEC_ID_PROD_TYPES = "800000021";
	
	/** 以旧换新配置规格属性--回购产品容量 */
	@Deprecated
	public static final String SPEC_ID_PROD_CAPACITY = "800000022";
	
	/** 以旧换新配置规格属性--回购产品来源 */
	@Deprecated
	public static final String SPEC_ID_PROD_SOURCE = "800000023";
	
	/** 以旧换新配置规格属性--功能检测 */
	@Deprecated
	public static final String SPEC_ID_PROD_FUNCTIONS = "800000024";
	
	/** 以旧换新配置规格属性 */
	public static final String SPEC_ID_COUPON_CONFIG = "800000032";
	
	/** 推荐的浏览器属性 */
	public static final String RECOMMEND_BROWSERS = "RECOMMEND_BROWSERS";
	
	/** 告警的浏览器属性 */
	public static final String WARNING_BROWSERS = "WARNING_BROWSERS";
	
	/** 禁止的浏览器属性 */
	public static final String FORBIDDEN_BROWSERS = "FORBIDDEN_BROWSERS";
	
	/** 接口优化查询开关 */
	public static final String INTERFACEOPTIMIZATION = "INTERFACEOPTIMIZATION";
	
	/** 是否信控离散值规格ID */
	public static final String IS_XINKONG_SPEC_ID = "40010030";
	
	/** 套餐变更是否显示修改付费类型输入选项 */
	public static final String SHOW_CHANGE_FEETYPE_INPUT = "FEETYPE_";
	
	/** 主套餐条目总数 */
	public static final String PAGE_SIZE = "200";
	
	/** 报障单*/
	public static final String  APPLY_TYPE_WARING="10";
	
	/** 需求*/
	public static final String  APPLI_TYPE_DEMAND="11";
	
	/** 系统优化建议单*/
	public static final String  APPLI_TYPE_ADVICE="12";
	
	/** 投票*/
	public static final String  APPLI_TYPE_VOTE="13";

	/** 点赞*/
	public static final String  APPLI_TYPE_PRAISE="14";
	
	//是否发短信验证权限编码
    public static final String SMS_PASS_OPSCD="SMS_PASS_OPSCD";
    //限制提交权限编码
    public static final String LIMIT_SUBMIT="LIMIT_SUBMIT";
    
    /** session中保存查询出的所有待选的原始客户信息 */
    public static final String SESSION_LIST_CUST_INFOS = "_listCustInfos";
    
    /** session中保存当前客户信息 */
    public static final String SESSION_CURRENT_CUST_INFO = "_currentCustInfo";
    
    /** session中保存当前客户信息 */
    public static final String SESSION_KEY_SMS_RESULT ="SESSION_KEY_SMS_RESULT";
    
    /** session中保存密码修改的Token */
    public static final String SESSION_KEY_SMSPWD_TOKEN ="SESSION_KEY_SMSPWD_TOKEN";

    /**session中用于保存当前业务是本地业务还是异地业务*/
	public static final String SESSION_KEY_DIFFPLACEFLAG = "SESSION_KEY_DIFFPLACEFLAG";
	/**session中用于保存当前订单的费用*/
	public static final String SESSION_KEY_SUMAMOUNT = "SESSION_KEY_SUMAMOUNT";
	/**异地补换卡权限*/
	public static final String YDBHK = "YDBHK";
	
	/**写卡新组件开关*/
	public static final String CARD_NEW_DLL = "CARD_NEW_DLL";
	
	/** 收银台渠道查询权限--关键字 */
	public static final String CASHIER_CHANNEL_QUERY = "CASHIER_CHANNEL_QUERY";

	//归档管理员
    public static final String FILE_ADMIN="GDGLY";

	/**星级服务补换卡权益*/
	public static final String INTEREST_BHK = "INTEREST_BHK";
	
	/**星级服务国漫权益*/
	public static final String INTEREST_GM = "INTEREST_GM";
	
	/**星级服务紧急开机权益*/
	public static final String INTEREST_JJKJ = "INTEREST_JJKJ";

    /**星级服务分省开关*/
	public static final String POINGTTYPE = "POINGTTYPE";
	
	/**身份证号*/
	public static final String IDCARDNUMBER = "IDCARDNUMBER";
	
	public static final String YCZJQX_TEST="YCZJQX_TEST";


	public static final String JFKJCG = "JFKJCG";
	
    /**客户鉴权短信验证短信发送时间 */
    public static final String SESSION_KEY_TEMP_CUSTAUTH_SMS_TIME = "_session_key_temp_custauth_sms_time";    
    /** 客户鉴权短信验证 sms Session key */
    public static final String SESSION_KEY_CUSTAUTH_SMS = "_ecs_custauth_sms_session_key";	
    
	/**改客户资料返档*/
	public static final String GKHZLFD = "GKHZLFD";
	/**过户返档*/
	public static final String GHFD = "GHFD";
	/**改客户资料返档菜单名*/
	public static final String GKHZLFD_NAME = "改客户资料返档";
	/**过户返档菜单名*/
	public static final String GHFD_NAME = "过户返档";
	/**返档*/
	public static final String  FD= "FD";
	/**返档*/
	public static final String FD_NAME = "返档";
	
    /** 客户鉴权短信验证证随机二位序列号 */
    public static final String SESSION_KEY_CUSTAUTH_RANDONCODE = "_ecs_custauth_sms_session_code";

    /**
     * 带圆圈的数字的Unicode基本编码值
     */
    public static final int CIRCLENUMBERBASE = 9312;
    
    public static final Map<String, String> templateTypeMap = new HashMap<String, String>() {
		private static final long serialVersionUID = 1L;
		{
			put(BATCH_TYPE.HUO_KA, 				"批开活卡");
			put(BATCH_TYPE.NEW_ORDER, 			"批量新装");
			put(BATCH_TYPE.ATTACH_OFFER_ORDER, 	"批量订购/退订附属");
			put(BATCH_TYPE.ZU_HE, 				"组合产品纳入退出");
			put(BATCH_TYPE.EDIT_ATTR, 			"批量修改产品属性");
			put(BATCH_TYPE.CHANGE, 				"批量换档");//在完成#18397时，遇到5和11均表示“批量换档”的问题，经与后台沟通，仍使用11，5不会影响。
			put(BATCH_TYPE.CHAI_JI, 			"批量欠费拆机");
			put(BATCH_TYPE.FA_ZHAN_REN, 		"批量修改发展人");
			put(BATCH_TYPE.ORDER_TERMINAL, 		"批量订购裸终端");
			put(BATCH_TYPE.CHANGE_FEETYPE, 		"批量换档");
			put(BATCH_TYPE.CHANGE_UIM, 			"批量换卡");
			put(BATCH_TYPE.BLACKLIST, 			"批量一卡双号黑名单");
			put(BATCH_TYPE.DISMANTLE_IN_USE, 	"批量在用拆机");
			put(BATCH_TYPE.DISMANTLE_INACTIVE, 	"批量未激活拆机");
			put(BATCH_TYPE.ECS_RECEIVE, 		"批量终端领用");
			put(BATCH_TYPE.ECS_BACK, 			"批量终端领用回退");
			put(BATCH_TYPE.ECS_SALE, 			"批量终端销售");
		}
	};
	
	/**渠道发展人归属渠道开关*/
	public static final String STAFFINFOFLAG = "STAFFINFOFLAG";
	
	/**网银代收权限编码*/
	public static final String OPERATSPEC_EBANK = "WYDSQX";
	/**账务托收权限编码*/
	public static final String OPERATSPEC_BILLACCT = "ZWTSQX";
	
	/**受理地区判断开关*/
	public static final String CHECKAREAIDFLAG = "CHECKAREAIDFLAG";
	
	/***/
	public static final String NUMBERLIST = "NUMBERLIST";
	
	 /** Session Key　验证码 */
    public static final String SESSION_QRCODE_UUID = "session_qrcode_uuid";
    
    /**一卡双号黑名单管理证据文件url加密密码*/
	public static final String BLACK_USER_URL_PWD = "32784wqreiyi$%^&*_";
	
	/**明细报表*/
	public static final String TERMINAL_STATISTIC_DETAIL = "terminalStatisticDetail";
	/**汇总报表*/
	public static final String TERMINAL_STATISTIC = "terminalStatistic";
	
	/**从http请求头中获取X-Forwarded-Host属性*/
	public static final String HTTP_REQUEST_HEADER_HOST = "X-Forwarded-Host";
	
	/**批量业务受理类型*/
	public class BATCH_TYPE {
		/**批开活卡-0*/
		public static final String HUO_KA = "0";
		/**批量新装-1*/
		public static final String NEW_ORDER = "1";
		/**批量订购/退订附属-2*/
		public static final String ATTACH_OFFER_ORDER = "2";
	    /**组合产品纳入退出-3*/
	    public static final String ZU_HE = "3";
	    /**批量修改产品属性-4*/
	    public static final String EDIT_ATTR = "4";
	    /**批量换档(在完成“需求（开发） #18397”时，遇到5和11均表示“批量换档”的问题，经与后台沟通，仍使用11，5不会影响)*/
	    public static final String CHANGE = "5";
	    /**批量拆机-8*/
	    public static final String CHAI_JI = "8";
	    /**批量修改发展人-9*/
	    public static final String FA_ZHAN_REN = "9";
	    /**批量订购裸终端-10*/
	    public static final String ORDER_TERMINAL = "10";
	    /**批量换档-11*/
	    public static final String CHANGE_FEETYPE = "11";
	    /**批量换卡-12*/
	    public static final String CHANGE_UIM = "12";
	    /**批量一卡双号黑名单-13*/
	    public static final String BLACKLIST = "13";
	    /**批量在用拆机-14*/
	    public static final String DISMANTLE_IN_USE = "14";
	    /**批量未激活拆机-15*/
	    public static final String DISMANTLE_INACTIVE = "15";
	    /**批量终端领用-16*/
	    public static final String ECS_RECEIVE = "16";
	    /**批量终端领用回退-17*/
	    public static final String ECS_BACK = "17";
	    /**批量终端销售-18*/
	    public static final String ECS_SALE = "18";
	}
}