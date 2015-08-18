package com.al.ec.serviceplatform.client;

public interface ResultCode {
	
	/**调用接口成功*/
	final String R_SUCC = "0";
	/**调用接口失败*/
	final String R_FAILURE = "1";
	/**调用接口异常*/
	final String R_EXCEPTION = "-1";
	/**调用接口业务规则错误*/
	final String R_RULE_EXCEPTION = "-2";
	/**成功*/
	final String R_SUCCESS = "POR-0000";
	/**调用服务平台失败*/
	final String R_SERV_CALL_FAIL = "POR-1001";
	/**门户未注册*/
	final String R_PORTAL_NO_REGIST = "POR-1002";
	/**门户不能使用*/
	final String R_PORTAL_PAUSE = "POR-1003";
	/**门户密码错误*/
	final String R_PORTAL_PWD_WRONG = "POR-1004";
	/**没有服务使用权限*/
	final String R_SERV_NO_COMPETENCE = "POR-1005";
	/**非法参数*/
	final String R_ERROR_PARAM = "POR-1006";
	/**拒绝访问*/
	final String R_ACCESS_DENIED = "POR-1007";
	/**服务错误*/
	final String R_SERV_ERROR = "POR-1008";
	/**服务暂停*/
	final String R_SERV_PAUSE = "POR-1009";
	/**服务故障*/
	final String R_SERV_FAULT = "POR-1010";
	/**服务停止*/
	final String R_SERV_STOP = "POR-1011";
	/**服务异常*/
	final String R_SERV_EXCEPTION = "POR-1012";
	/**服务层数据库访问异常*/
	final String R_SERV_DATABASE_EXCEPTION = "POR-1013";
	/**服务入参错误*/
	final String R_PARAM_WRONG = "POR-1014";
	/**数据转换异常*/
	final String R_DATACONVERSION = "POR-1015";
	/**服务层未知错误*/
	final String R_UNKNOWN_ERROR = "POR-1999";
	
	/**接口服务错误*/
	final String R_INTERFACE_ERROR = "POR-3001";
	/**接口服务暂停使用*/
	final String R_INTERFACE_PAUSE = "POR-3002";
	/**接口服务停止使用*/
	final String R_INTERFACE_STOP = "POR-3003";
	/**接口请求参数无效*/
	final String R_INTERFACE_PARAM_WRONG = "POR-3004";
	/**请求参数缺失*/
	final String R_INTERFACE_PARAM_MISS = "POR-3005";
	/**外围接口访问异常*/
	final String R_INTERFACE_CALL_EXCEPTION = "POR-3006";
	/**接口服务异常*/
	final String R_INTERFACE_EXCEPTION = "POR-3007";
	/**接口服务未知错误*/
	final String R_INTERFACE_UNKNOW_ERROR = "POR-3008";
	
	/**查询失败*/
	final String R_QUERY_FAIL = "POR-2001";
	/**查询不到数据*/
	final String R_QUERY_NO_DATA = "POR-2002";
	/**入参缺失*/
	final String R_PARAM_MISS = "POR-2003";
	/**失败*/
	final String R_FAIL = "POR-2004";
	
	/**成功*/
	final String RES_SUCCESS = "0000";
	
	
	
	
}
