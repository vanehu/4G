package com.ailk.ecsp.core;

public class SysConstant {
	/**平台运行模式，开发模式*/
	public static String  LEVEL_DEVELOP = "DEVELOP";
	/**平台运行模式，生产模式*/
	public static String  LEVEL_PRODUCT = "PRODUCT";
	/**权限校验，校验*/
	public static String  CHECK_PERMISSION_YES = "Y";
	/**权限校验，不校验*/
	public static String  CHECK_PERMISSION_NO = "N";
	/**平台状态，活动*/
	public static String  PORTAL_STATUS_A = "A";
	/**平台状态，失效*/
	public static String  PORTAL_STATUS_N = "N";
	/**是否写详细日志，是*/
	public static String  WRITE_LOG_DETAIL_YES = "PS";
	/**是否写详细日志，否*/
	public static String  WRITE_LOG_DETAIL_NO = "NONE";
	/**是否写详细日志，写往日志服务器，不写往detail表*/
	public static String  WRITE_LOG_DETAIL_UNILOG = "UNILOG";
	/**系统参数分组，日志*/
	public static String  CON_SYS_PARAM_GROUP_LOG = "1";
	/**系统参数分组，接口地址(接口地址统一到系统参数中，为3)*/
	public static String  CON_SYS_PARAM_GROUP_INTF_URL = "3";
	/**系统参数分组，系统参数*/
	public static String  CON_SYS_PARAM_GROUP_SYS_PARAM = "3";
	/**系统参数分组，csb参数*/
	public static String  CON_SYS_PARAM_GROUP_CSB_PARAM = "5";
	/**系统参数分组，门户敏感信息过滤地址白名单*/
	public static String  CON_SYS_PARAM_GROUP_FILTER_WHITE_LIST = "9";
	/**系统参数分组分隔符*/
	public static String  CON_SEPARATOR_SYS_PARAM_GROUP = ":";
	/** 开关 代表启用*/
	public static String CON_ON = "ON";
	/** 开关 代表不启用*/
	public static String CON_OFF = "OFF";
	
	public static String CON_CSB_URL_KEY = "url.csbWS";
	/**系统参数 服务层是否记录日志开关 ON OFF*/
	public static String CON_WRITE_LOG_FLAG = "WRITE_LOG_FLAG";
	/**系统参数 服务层详细日志开关*/
	public static String CON_WRITE_LOG_DETAIL = "WRITE_LOG_DETAIL";
	/**系统参数需要读取配置不读数据库的KEY*/
	public static String CON_PROPERTIES_KEY = "WRITE_LOG_FLAG,WRITE_LOG_DETAIL,url.csbWS,url.CN2csbWS,DEFAULT_DATASOURCE";
	/**刷新缓存动作参数分组分隔符*/
	public static String  CON_REF_PARAM_ACTION_GROUP = ",";
	
	/**开始日期的后缀*/
	public static String  START_DATE_SUFFIX = " 00:00:00";
	/**结束日期的后缀*/
	public static String  END_DATE_SUFFIX = " 23:59:59";
}
