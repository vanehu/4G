package com.al.ecs.spring.interceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.method.HandlerMethod;

/**
 * Session 拦截自定义扩展类 .
 * <BR>
 *  Session拦截扩展与本身通过session id判断相结合来判断.
 *  结合方式默认为OR方式，也可定义成true方式
 *  SessionInterceptor类 isAndOr属性来设置结合方式
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-8-2
 * @createDate 2012-8-2 上午10:51:33
 * @modifyDate tang zheng yu 2012-8-2 <BR>
 * @copyRight 亚信联创EC研发部
 */
public interface ISessionInterceptor {
	/**
	 * true session校验通过，false为不通过
	 * @param request HttpServletRequest
	 * @param response HttpServletResponse
	 * @param handler HandlerMethod
	 * @param url 请求地址
	 * @return
	 */
	boolean checkSession(HttpServletRequest request,
			HttpServletResponse response, HandlerMethod handler,String url);

}
