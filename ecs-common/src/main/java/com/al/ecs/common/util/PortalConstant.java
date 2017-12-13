package com.al.ecs.common.util;
/**
 * 工具包常量 .
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-2-29
 * @createDate 2012-2-29 下午3:40:01
 * @modifyDate	 tang 2012-2-29 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
public final class PortalConstant {

	/** MDC里存放请求是否是资源请求 */
	public static final String MDC_IS_RESOURCE_URL ="is_resource_url";
	/** MDC里存放请求的客户IP地址 */
	public static final String MDC_USER_IP ="user_ip";
	/** Session Key */
	public static final String SESSION_KEY_LOGIN_STAFF = "_ecs_login_session_key";
	
	/** Session 员工JavaBean 里,工号默认字段名 */
	public static final String FIELD_STAFF_CODE_NAME = "staffCode";
	
	public static final String RESULT = "result";
	public static final String RESULT_MSG = "resultMsg";
	public static final String RESULT_CODE = "resultCode";
	public static final String RESULT_FLAG = "resultFlag";
	public static final String ERROR_MSG = "errorMsg";

	public static final String AREA_ID = "areaId";
	public static final String STAFF_ID = "staffId";
	public static final String STAFF_CODE = "staffCode";
	public static final String CHANNEL_ID = "channelId";
}
