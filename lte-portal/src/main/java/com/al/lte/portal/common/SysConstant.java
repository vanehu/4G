package com.al.lte.portal.common;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.al.ecs.common.entity.LevelLog;
import com.al.ecs.common.util.PortalConstant;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.SpringContextUtil;
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
	
	/** 转售商号码头正则 */
	public static final String MVNO_PHONE_HEAD = "^(170)\\d{8}$";
    /** staff Session key */
    public static final String SESSION_KEY_LOGIN_STAFF = PortalConstant.SESSION_KEY_LOGIN_STAFF;
    /** Session Key　验证码 */
    public static final String SESSION_KEY_IMAGE_CODE = "is_valid_imagecode_session_key";

    /** 记录日志级别 */
    public static final LevelLog CALL_SERVICE_LOG_FLAG = LevelLog.DB;
    /**详单查询新接口启用*/
    public static final String NEW_INTERFACE_QUERY ="NEW_INTERFACE_QUERY";
    /**账单查询新接口启用*/
    public static final String NEW_INTERFACE_QUERYBILL ="NEW_INTERFACE_QUERYBILL";
    /** sms Session key */
    public static final String SESSION_KEY_LOGIN_SMS = "_ecs_sms_session_key";
    
    public static final String SESSION_KEY_PAD_FLAG="_session_pad_flag";
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
    
    public static final String SESSION_KEY_EDITCHARGE="_editchargeList";
    public static final String SESSION_KEY_ADDCHARGE="_addchargeList";
    public static final String SESSION_KEY_EDITADJUSTCHARGE="_editAdjustchargeList";
    
    public static final String SESSION_KEY_CUSBILL = "_session_key_cusbill";
    
    public static final String EDITCHARGE_CODE="EDITCHARGE";
    
    public static final String ADDCHARGE_CODE="ADDCHARGE";
    
    
    public static final String EDITADJUST_CODE="DEDIT_ADJUST";
    
    //生失效时间权限设置
    public static final String EFF_TIME="EFF_TIME";
    
    public static final String SESSION_KEY_EDITTAXPAYER="_edittaxpayer";
    
    public static final String SESSION_KEY_JUMPAUTH="_jumpauth";
    
    public static final String SESSION_KEY_VIEWSENSI="_VIEWSENSI";
    
    public static final String SESSION_KEY_CREDITLIMIT="_creditLimit";
    //纳税人权限控制
    public static final String EDITTAXPAYER_CODE="EDITTAXPAYER";
    //客户鉴权跳过
    public static final String JUMPAUTH_CODE="JUMPAUTH";
    //查看身份证权限(无脱敏)
    public static final String VIEWSENSI_CODE="TMXX";
    //调整账户信用额度权限
    public static final String ADJUSTCREDITLIMIT_CODE="CREDITLIMIT";
    //账户信用额度规格ID
    public static final String ACCT_ATTR_CREDIT_LIMIT = "30010040";
    /**默认皮肤*/
    public static final String THEME_DEFAULT = "default";

    public static Integer OFFER_TYPE_MAIN = 1;//主销售品
    
    public static String MAIN_OFFER_ROLE_TYPE = "400";
    public static String VICE_OFFER_ROLE_TYPE = "401";
    
    public static String BATCHCHAIJI="8";
    public static String BATCHHUOKA="0";
    public static String BATCHNEWORDER="1";
    public static String BATCHFUSHU="2";
    public static String BATCHZUHE="3";
    public static String BATCHEDITATTR="4";
    public static String BATCHCHANGE="5";
    public static String BATCHFAZHANREN="9";
    
    //是否记录接口日志 ON OFF
    public static String WRITE_LOG_FLAG = "WRITE_LOG_FLAG";
    //是否记录接口日志出入参，数据库字段类型为CLOB，N代表不记录，Y代表记录
    public static String WRITE_LOG_DETAIL = "WRITE_LOG_DETAIL";
    public static String LOG_PS = "PS";
    public static String LOG_UNILOG = "UNILOG";
    public static String LOG_NONE = "NONE";
    //对应统一日志平台的门户日志类型
    public static String LOG_TYPE = "PortalTransLog";
    

    public static String CSB_FLAG = "CSB_FLAG";
    public static String ASYNC_FLAG = "ASYNC_FLAG";
    public static String FILE_PREFER_FLAG = "FILE_PREFER_FLAG";
    public static String DEF_HTTP_FLAG = "DEF_HTTP_FLAG";
    public static String ABS_DIRECTORY_FLAG = "ABS_DIRECTORY_FLAG";
    public static String ABS_DIRECTORY_KEY = "ABS_DIRECTORY_KEY";
    public static String COMPRESS_JS_LEVEL = "COMPRESS_JS_LEVEL";
    public static String LEVEL_NONE = "NONE";
    public static String LEVEL_BASE = "BASE";
    public static String LEVEL_BUSI = "BUSI";
    public static String BASE_VERSION = "BASE_VERSION";
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
    //营销资源图片地址定义
    public static String MKT_RES_PIC_URL = "MKT_RES_PIC_URL";
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
	public final static String PREVIEW_SIGN="1";
	public final static String SAVE_PDF="2";
	//业务模板目录
	public final static String P_MOD_BASE_DIR = "report/";
	public final static String P_MOD_SUB_BASE_DIR = getSysConfDir() + P_MOD_BASE_DIR;
	public final static String P_MOD_SUB_CTG_HTML = "ctghtml/";
	public final static String P_MOD_SUB_CTG_PDF = "ctgpdf/";
	public final static String P_MOD_SUB_INVOICE = "invoice/";
	public final static String P_MOD_ABS_INVOICE = "D:/temp/invoice/";
	//充值收据（发票）模板目录
	public final static String P_MOD_DIR_CHARGE_RECEIPT = "chargeReceiptAndInvoice/";
	
	public final static String P_FILE_PROTOCOL = "file://";
	
	//业务模板名称
	public final static String P_MOD_FILE_CRM_COMMON = "CtgPrintCommonMod";  // 公共回执打印业务(购物车业务回执类型)	
	//发票模板名称
	public final static String P_MOD_FILE_INVOICE = "invoiceGroup";  // 发票打印业务
	//充值收据（发票）模板名称
	public final static String P_MOD_FILE_CHARGE_RECEIPT = "chargeReceipt"; //充值收据
	//业务模板类型
	//业务类型－重新定义(加载模板使用)
	public final static String BUSI_TYPE_FRESH_DATA = "0"; // 解决部分需要在受理提交之后重新保存回执信息的业务
	public final static String BUSI_TYPE_CRM_COMMON = "1"; // 公共回执打印业务(购物车业务回执类型)
	public final static String BUSI_TYPE_WITH_PARAM = "2"; // 非购物车-页面传参类回执打印业务
	
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
    /** csb组织编码-集团 */
    public static final String CSB_ORG_ID_GROUP = "100000";
    /** csb发起方编码-集团 4G*/
    public static final String CSB_SRC_SYS_ID_LTE = "1000000206";
    /** csb发起方编码-集团转售*/
    public static final String CSB_SRC_SYS_ID_MVNO = "1000000210";
    
    public static final String MSG_CODE_FLAG = "msgCodeFlag";
    
    public static final String IS_DEFAULT_TEMPLATE = "0";
    
    public static final String TEMPLATE_LIST = "SESSION_TEMPLATE_LIST";
    /** 用于系统管理的门户系统编码，约定为10002*/
    public static final String SM_PLATFORM_CODE = "10002";
    
    /** 免停权限 */
    public static final String SESSION_KEY_ISAVOID_STOP = "_isavoidstop";
    public static final String ISAVOID_STOP="SFMT";
    
    /** 免催缴权限 */
    public static final String SESSION_KEY_ISAVOID_CALL = "_isavoidcall";
    public static final String ISAVOID_CALL="SFMCJ";
    
    /** 免提醒权限 */
    public static final String SESSION_KEY_ISAVOID_REMIND = "_isavoidremind";
    public static final String ISAVOID_REMIND="SFMTX";
	
	//身份证类型开关
	public static String IDTYPE = "IDTYPE";
	
	/** 产品规格属性--使用人，产品规格属性ID */
	public static final String PROD_ITEM_SPEC_ID_USER = "800000011";
	
}

