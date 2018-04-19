package com.al.ecs.spring.exception;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 异常执行前拦截
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-9-27
 * @createDate 2012-9-27 下午8:02:28
 * @modifyDate tang zheng yu 2012-9-27 <BR>
 * @copyRight 亚信联创EC研发部
 */
public interface ExceptionPoint {

	/**
	 * 异常返回数据之前执行
	 * @param request
	 * @param response
	 * @param handler
	 * @param ex
	 * @return Map 参数
	 */
	public Map before(HttpServletRequest request,
			HttpServletResponse response, Object handler, Exception ex);
}
