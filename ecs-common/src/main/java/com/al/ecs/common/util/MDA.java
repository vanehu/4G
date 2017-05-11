package com.al.ecs.common.util;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@com.al.common.annotation.AppModule(moduleName = "Lte4GManager")
public class MDA {
	/**
	 * 各省CRM平台系统编码
	 */
	public static final Map<String,String> PROV_CRM_SYS_CODE=new HashMap<String,String>();
	/**
	 * 宽带甩单定位门店接口地址
	 */
	public static final String CSB_HTTP_QUERCHEN_URL=new String("");
	/**
	 * 一证五号 - http地址
	 */
	public static final String CSB_HTTP_CMP_URL=new String("");
	
	/**
	 * 宽带甩单过csb的http地址
	 */
	public static final String CSB_HTTP_MIDDLE_URL=new String("");
	/**
	 * 芝麻信用值查询地址
	 */
	public static final String ZHIMA_URL=new String("");
	/**
	 * 调用签章系统过csb的http地址
	 */
	public static final String CSB_HTTP_FORCA_URL=new String("");
	/**
	 * 调用接口过csb的webservice地址
	 */
	public static final String CSB_WS_URL=new String("");
	/**
	 * App CSB测试地址
	 */
	public static final String BILL_CSB_HTTP_URL = new String("");
	/**
	 * 调用接口过csb的http地址
	 */
	public static final String CSB_HTTP_URL=new String("");
	/**
	 * CSB标识 ON OFF
	 */
	public static final String CSB_FLAG=new String("");
	/**
	 * 异步标识 ON OFF
	 */
	public static final String ASYNC_FLAG=new String("");
	/**
	 * 默认HTTP调用 ON OFF
	 */
	public static final String DEF_HTTP_FLAG=new String("");
	/**
	 * 是否显示省内订单属性 0-打开，1-关闭
	 */
	public static final Map<String,String> PROVORDERATTR_FLAG=new HashMap<String,String>();
	/**
	 * 通过CSB调外围接口使用此地址
	 */
	public static final String CN2CSBHTTP_URL=new String("");
	/**
	 * 通过CSB调外围接口使用此地址
	 */
	public static final String CN2CSBWS_URL=new String("");
	/**
	 * CRM系统批量预开通功能优化需求开关，ON：改造之后；OFF：改造之前
	 */
	public static final String BATCHORDER_QRY_FLAG=new String("");
	/**
	 * 批量订单查询权限控制优化开关，ON：改造之后；OFF：改造之前
	 */
	public static final String BATCHORDER_AUTH_FLAG=new String("");
	/**
	 * 回执打印新旧版本开关 ON OFF
	 */
	public static final String PRINTNEW=new String("");
	/**
	 * 写卡走新组件 ON OFF
	 */
	public static final String CARD_NEW_DLL=new String("");
	/**
	 * 营销资源图片地址
	 */
	public static final String MKT_RES_PIC_URL=new String("");
	/**
	 * 公告附件下载地址
	 */
	public static final String NOTICE_URL=new String("");
	/**
	 * 操作手册下载地址
	 */
	public static final String MANUAL_URL=new String("");
	/**
	 * ITSM系统URL
	 */
	public static final String ITSM_URL=new String("");
	/**
	 * 翼支付绑卡添益宝生产环境DCN
	 */
	public static final String YIPAYBOUNDCARD_URL=new String("");
	/**
	 * 主副卡纳入老用户权限开关  ON OFF
	 */
	public static final Map<String,String> ADDOLDCUSTAUTH_FLAG=new HashMap<String,String>();
	/**
	 * 拦截跳转到unifylogin的登陆页开关  ON OFF
	 */
	public static final String UNIFYLOGIN=new String("");
	/**
	 * 接口优化查询开关 ON OFF
	 */
	public static final String INTERFACEOPTIMIZATION=new String("");
	/**
	 * 新建客户时候身份证证件类型开关  ON OFF
	 */
	public static final Map<String,String> IDTYPE_FLAG=new HashMap<String,String>();
	/**
	 * 套餐变更时候是否调用预校验开关  ON：调用预校验  OFF：不调用预校验
	 */
	public static final Map<String,String> YJY_FLAG=new HashMap<String,String>();
	/**
	 * 在订单确认页面，在下省校验成功之后调用业务提醒接口，获取提醒信息开关  ON：调用业务提醒接口  OFF：不调用业务提醒接口
	 */
	public static final Map<String,String> YWTX_FLAG=new HashMap<String,String>();
	/**
	 * 能力开放(客户架构、全量查询)接口标识
	 */
	public static final String INTERFACE_MERGE=new String("");
	
	/**
	 * 令牌失效时间
	 * */
	public static final String TOKENTIMES=new String("");
	/***
	 * 省份公钥密码
	 * 
	 */
	public static final String TOKENPROVINEKEY=new String("");
	
	/**
	 * 令牌key
	 * */
	public static final String TOKENKEY=new String ("");
	
	/**
	 * PC版本跳转url
	 * */
	public static final Map<String,String> PC_URL=new HashMap<String,String>();
	/***
	 * APP版本跳转url
	 * */
	public static final Map<String,String> APP_URL=new HashMap<String,String>();
	/***
	 * PAD版本跳转url
	 * */
	public static final Map<String,String> PAD_URL=new HashMap<String,String>();
	
	/**
	 * 公共参数加密key
	 * */
	
	public static final String COMMON_PARAM_KEY=new String ("");
	
	/**
	 * 省份私钥 TOKEN_JMPROVINCECODE_KEY
	 * */
	public static final Map<String,String> TOKEN_JMPROVINCECODE_KEY=new HashMap<String,String>();
	
	/**
	 * 省份回调地址PC
	 * 
	 * */
	public static final Map<String,String> PC_URL_BACK=new HashMap<String,String>();
	
	/**
	 * 省份回调地址APP
	 * */
	public static final Map<String,String> APP_URL_BACK=new HashMap<String,String>();
	/**
	 * 省份回调地址PAD
	 * */
	public static final Map<String,String> PAD_URL_BACK=new HashMap<String,String>();
	/***
	 * LTE 或 MVNO
	 * */
	public static final String APPDESC=new String("");
	/**
	 *#如果启用绝对路径，则使用下面路径作为父级路径
	 * */
	public static final String ABS_DIRECTORY_KEY=new String ("");
	
	/***
	 * 决定参数是先从以下配置中取，还是先从数据库参数表取
	 * */
	public static final String FILE_PREFER_FLAG=new String ("");
	/**
	 *  # NONE - 不压缩
        # BASE - 第三方和基础JS压缩为一个JS
        # BUSI - 第三方和基础JS压缩为一个JS，业务类JS压缩为一个JS
	 * */
	public static final String COMPRESS_JS_LEVEL=new String("");
	
	/**
	 * BASE 版本
	 * */
	public static final String BASE_VERSION=new String("");
	
	/**
	 * BUSI 版本
	 * */
	public static final String BUSI_VERSION=new String("");
	
	/***
	 * 推荐浏览器
	 * */
	public static final String RECOMMEND_BROWSERS=new String("");
	/**
	 * 告警浏览器
	 * */
	public static final String WARNING_BROWSERS=new String ("");
	/**
	 * 禁止浏览器
	 * */
	public static final String FORBIDDEN_BROWSERS=new String ("");
	
	/**
	 * 是否记录接口日志
	 * */
	public static final String WRITE_LOG_FLAG=new String ("");
	/**
	 * 
	 * */
	public static final String COMPRESS_ALL_JS=new String ("");

	/**
     * POS支付开关  ON：开， OFF：关
     */
    public static final Map<String, String> POS_FLAG = new HashMap<String, String>();
    
    /**
	 * 是否打开翼支付接口
	 * */
	public static final Map<String,String> BESTPAY_FLAG=new HashMap<String,String>();
	/**
	 * 记录客户定位数据是否记录到日志平台
	 * */
	public static final String CUSTLOGFLAG_WRITE_ASYNCHRONOUS_FLAG=new String ("");
	
	/**
	 * 1. OFF：上传文件到单台FTP服务器；ON：上传文件到多台FTP服务器(默认为OFF，上传文件到单台FTP服务器)
	 */
	public static final String CLUSTERFLAG = new String ("");	
	/**
	 * 2. 访问FTP服务器路径
	 */
	public static final String FTPREMOTEPATH = new String ("");
	/**
	 * 2.1. 访问FTP服务器路径
	 */
	public static final String FTPBLACKLISTPATH = new String ("");
	/**
	 * 3. 单台FTP配置信息
	 */
	public static final String FTPSERVICECONFIG = new String ("");	
	/**
	 * 4. 上传失败后尝试连接FTP服务器次数
	 */
	public static final String RETRYTIMES = new String ("");
	/**
	 * 5. 3台FTP服务器配置信息
	 */
	public static final Map<String,String> FTPServiceConfigs = new HashMap<String,String>();
	/**
	 * 6. 全国32省(包含1个虚拟省)与3台FTP映射关系
	 */
	public static final Map<String,String> ProvincesFTPsMapping = new HashMap<String,String>();
	/**
	 * 7. 批量改造开关，默认为ON打开，走FTP模式；OFF关闭，走报文模式
	 */
	public static final String BATCHVERSIONFLAG = new String ("");
	
	
	/**
	 * 记录过频间隔
	 * */
	public static final String OF_TIME=new String ("");
	/**
	 * 记录过频次数
	 * */
	public static final String OF_COUNT=new String ("");

	/**
	 * 身份证云读卡配置：应用ID
	 */
	public static final String APP_ID = new String("");

	/**
     * 身份证云读卡配置：APP_ID对应的加密密钥
     */
	public static final String APP_SECRET = new String("");

	/**
     * 身份证云读卡配置：发起方系统编码
     */
	public static final String SRC_SYSTEM = new String("");

	/**
     * 身份证云读卡配置：3DES密钥
     */
    public static final String DES3_SECRET = new String("");
	/**
	 * 回执是否有服务协议和靓号协议ON-有，OFF-无 格式：服务协议开关，靓号协议开关
	 */
	public static final Map<String,String> PRINTFTL_FLAG=new HashMap<String,String>();
	/**
	 * 翼支付商户配置
	 */
	public static final Map<String,String> EPAY_MERCHANT=new HashMap<String,String>();

    /**
     * 身份证云读卡配置：日志开关
     */
    public static final String CLOUD_LOG_FLAG = new String("");
    
    /**
     * APP自动更新配置：自动更新标识（0：不提示更新   1：强制更新   2：提示更新）
     */
    public static final String APP_UPDATE_FLAG = new String("");

    /**
     * 电子发票类型类型
     */
    public static final Map<String,String> EL_INVOICE = new HashMap<String,String>();
    /**
     * 普通发票类型类型
     */
    public static final Map<String,String> NORMAL_INVOICE = new HashMap<String,String>();
    /**
     * 能力开放政企客户二次业务鉴权开关
     * */
    public static final Map<String,String> TOKEN_AUTHENTICATION = new HashMap<String,String>();
    /**
     * 集团CRM-4G政企客户鉴权开关
     */
    public static final Map<String,String> GOV_AUTH = new HashMap<String,String>();
   /**
    * 身份证阅读器放置ftp路径
    */
    public static final String CARD_FILEPATH = new String("");
    /**
     * 身份证阅读器放置ftp服务器配置
     */
    public static final String CARD_FTPCONFIG = new String("");
    
    /**
     * 身份阅读器厂商配置信息相关
     */
    public static final Map<String,Map<String,String>> USBVERSION_SIGNATURE = new HashMap <String,Map<String,String>>();
    /**
     * 身份证阅读器分省开关
     */
    public static final Map<String,String> USBSIGNATURE= new HashMap<String,String>();
    /**
     * 新装、套餐变更纳入老用户作为副卡分省开关
     */
    public static final Map<String,String> OLDMEMBER_JOIN = new HashMap<String,String>();
    /**
     * 套餐变更是否修改付费类型及信控属性分省开关
     */
    public static final Map<String,String> SHOW_CHANGE_FEE_TYPE  = new HashMap<String,String>();
    
    /** 二维码-失效时间  ,默认30秒 **/
	public static final String INVALID_TIME = new String("30000");
	
    /** 扫码登录,地区选择时判断省份是否具有权限 **/
	public static final Map<String,Map<String,Object>> PROV_AUTH_SWITH=new HashMap<String,Map<String,Object>>();
	
	/** 二维码-下载地址 **/
	public static final String DOWNLOAD_ADDR = new String("");
    
    /**
     * 能力开放 销售员与渠道单元的关系开关
     * 如果开关打开选择无归属渠道的发展人不允许选择，如果关闭允许选择
     * */
    public static final Map<String,String> TOKEN_SALES_CHANNEL = new HashMap<String,String>();
    /**
     * 返档分省开关
	 */
	public static final Map<String,String> TRANSFER_RETURN = new HashMap<String,String>();
	/**
	 * 回执重打分省开关 
	 */
	public static final Map<String,String> RETURN_RECEIPT = new HashMap<String,String>();
	
	/**
	 * 前置校验分省开关 
	 */
	public static final Map<String,String> PRECHECKFLAG = new HashMap<String,String>();

	/**
	 * 翼支付托收的属性分省开关
	 */
	public static final Map<String,String> AGENT_PARAM  = new HashMap<String,String>();
	/**
	 * 无纸化公章分省开关
	 */
	public static final Map<String,String> SEALINFO = new HashMap<String,String>();
	
	/**
	 * 能力前置校验分省开关 
	 */
	public static final Map<String,String> TOKENPRECHECKFLAG = new HashMap<String,String>();
	/**
	 * 日志分级-永久保存
	 */
	public static final String PORTAL_SERVICE_LOG_P = new String("");
	/**
	 * 日志分级-保存一年
	 */
	public static final String PORTAL_SERVICE_LOG_Y = new String("");
	/**
	 * 日志分级-保存一周
	 */
	public static final String PORTAL_SERVICE_LOG_W = new String("");


	/**能力开放回调地址校验开关*/
	public static final Map<String,String> ISCALLBACK = new HashMap<String,String>();

	/**能力开放预校验加省份流水开关*/
	public static final Map<String,String> TOKORDERINFOFORCHECKFLAG = new HashMap<String,String>();
	/**
	 * 电子档案查询系统标识LIST
	 */
	public static final List<Map<String,String>> PSRCFLAGLIST = new ArrayList<Map<String,String>>();
	
	/**
	 * 短信验证码是否发送标识(从sp_sys_param表迁移到MDA，故沿用表中的命名)
	 */
	public static final String msgCodeFlag = new String("");
	
	/**
	 * 翼支付收费调用支付平台分省开关 
	 */
	public static final Map<String,String> NEWPAYFLAG = new HashMap<String,String>();
	
	/**
	 * 统一登录地址(一般生产使用)
	 */
	public static final String UNIFY_LOGIN_URI = new String("");
	
	/**
	 * 双屏互动服务端请求地址端口
	 */
	public static final String PUSH_HOST_PORT = new String("");
	
	/**
	 * 调用支付平台接口地址
	 */
	public static final String PAY_TOKEN_URL=new String("");
	
	/**
	 * 跳转支付平台地址
	 */
	public static final String PAY_URL=new String("");
	
	/**
	 * 中台密钥串
	 */
	public static final String SecretKey=new String("");
	
	/**
	 * 号码资源状态前置校验分省开关
	 */
	public static final Map<String,String> NUMBER_CHECK_FLAG  = new HashMap<String,String>();
	
	/**
	 * 安全办公业务是否启用开关
	 */
	public static final String SECURITY_OFFICE_FLAG = new String("");
	/**
	 * 返档改造生效开关
	 */
	public static final String RETURN_ACCOUNT_FLAG=new String("");
	/**
	 * ess访问FTP服务器路径，快销卡打印回执pdf文件上传
	 */
	public static final String ESSFTPREMOTEPATH = new String ("");
	/**
	 * ess快销卡打印回执pdf文件上传FTP服务器配置信息(单台FTP服务器)'FTP服务器IP,端口,用户名,密码'
	 */
	public static final String ESSFTPSERVICECONFIG = new String ("");	
	/**
	 * #896069受理地区为省级地区(二级地区)时，是否加载为登录地区(三级地区),OFF:否；ON:是(默认)
	 */
	public static final String AREA_CTRL_FLAG = new String("");
	
	/**
	 * 副卡使用人分省开关
	 */
	public static final Map<String,String> FUKA_SHIYR_FLAG  = new HashMap<String,String>();

	/**
	 * 证件号码长度校验开关
	 */
	public static final String CMADDRESS_CHECK_FLAG  = new String("");

	
	/**公告附件下载FTP服务器配置*/
	public static final String NOTICE_FTP_SERVICE_CONFIGS = new String("");

	/**
	 * 翼销售app省份新版ui开关
	 */
	public static final Map<String,String> NEWUIFLAG = new HashMap<String,String>();
	
	/**公告附件下载FTP服务器配置*/
	public static final String WORD_FONT = new String("");

	/**实名制:证件照片校验签名密钥*/
    public static final Map<String,Map<String,String>> VENDER_SIGNATURE = new HashMap <String,Map<String,String>>();

    /**实名制:证件照片水印内容*/
    public static final String WARTER_MARKER_CONEXT = new String("");
	/**
	 * 集团CRM-4G IE兼容性开关
	 */
	public static final Map<String,String> IE_XUA = new HashMap<String,String>();

	/**
	 * 流量包父子关系开关
	 */
	public static final String NEW_LABEL_FLAG  = new String("");

	/**实名制拍照分省开关(4GWEB+能力+翼销售共用)*/
	public static final Map<String,String> REAL_NAME_PHOTO_FLAG  = new HashMap<String,String>();
	
	/**使用人拍照分省开关(4GWEB+能力共用)*/
	public static final Map<String,String> REAL_USER_FLAG  = new HashMap<String,String>();
	
	/**主副卡角色互换分省开关*/
	public static final Map<String,String> MEMBER_ROLE_EXCHANGE_FLAG  = new HashMap<String,String>();

	/**工号实名制需求开关*/
	public static final String STAFF_AUTH_FLAG  = new String("");

	/**订单提交增加前置校验流水号及细化返销前置校验编码开关*/
	public static final Map<String,String> COMANDFXPRECHECK = new HashMap<String,String>();

    /**证件类型校验规则是否启用开关*/
    public static final Map<String, String> CHECK_RULES_ON_OFF = new HashMap<String, String>();

	/**证件类型校验规则配置对象*/
	public static final List<Map<String, Object>> CHECK_RULES = new ArrayList<Map<String, Object>>();
	
	/**翼支付交费助手——是否需要代扣确认属性后付费用户可选分省开关*/
    public static final Map<String, String> YIPAY_ITEM_PARAM = new HashMap<String,String>();

	/**预拆机提示开关*/
	public static final Map<String,String> REMOVE_PROD_TIP  = new HashMap<String,String>();
	
	/**集团CRM-4G主副卡成员变更是否缺陷付费类型判断开关*/
    public static final Map<String, String> SHOW_MEMBER_FEE_TYPE = new HashMap<String,String>();
    
    /**拍照仪驱动下载配置*/
	public static final Map<String, String> CAMERA_DRIVER_DOWNLAOD = new HashMap<String, String>();
	
	/**人证比对*/
	public static final String CSB_PIC_VERIFY  = new String("");
	
	/**省份特殊协议配置*/
	public static final Map<String, List> SPECIAL_AGREEMENT  = new HashMap<String, List>();
	
	/** 省份菜单配置**/
	public static final Map<String,Map<String,Object>> PROVENCE_MENU = new HashMap<String,Map<String,Object>>();

	/**是否实名核验开关 */
    public static final Map<String, String> CHECK_CUST_CERT = new HashMap<String,String>();

    /**一证一号开关*/
    public static final Map<String, String> ONE_CERT_5_NUMBER_ON_OFF = new HashMap<String, String>();
    /**xml数字签名密钥*/
	public static final String SECRET_KEY = new String("");

	/**安全敏感相关的配置列表*/
	public static final List<String> SENSITIVE_KEYS = new ArrayList<String>();
	
	/**批量业务配置*/
    public static final Map<String, Object> BATCH_CONFIGS = new HashMap<String, Object>();
    
    /**门户正则表达式集合*/
    public static final Map<String, String> PORTAL_REGEXP = new HashMap<String, String>();
    
    /**针对政企批开的返档优化开关*/
	public static final String TRANSFER_CUST_FLAG = new String("");

	/**USB二代证读卡统一分省配置*/
	public static final Map<String, Object> CERT_SIGNATURE = new HashMap<String, Object>();

    /**
     * 一证五号回执打印内容
     */
    public static final Map<String, Object> ONE_CERT_FIVE_NUMBER_PRINT_CONTENT = new HashMap<String, Object>();
    
    /**实名制拍照人像审核分省开关，默认OFF(4GWEB+能力+翼销售共用)*/
	public static final Map<String,String> PHOTOGRAPH_REVIEW_FLAG  = new HashMap<String,String>();

    /**
     * 主副卡，保留套餐拆副卡删除使用人
     */
    public static final Map<String, String> VICE_CARD_DEL_USER_ON_OFF = new HashMap<String, String>();

}
