package com.al.ecs.spring.interceptor;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.lang.reflect.Method;
import java.nio.charset.Charset;
import java.util.Enumeration;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.core.MethodParameter;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.MediaType;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.http.server.ServletServerHttpResponse;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerMapping;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.log.Log;
import com.al.ecs.spring.annotation.session.SessionValid;

/**
 * TODO类主功能描述
 * <P>
 * TODO(类详细主功能描述)
 * <P>
 * 
 * @author tang zheng yu
 * @version V1.0 2011-12-24
 * @createDate 2011-12-24 下午10:05:59
 * @modifyDate tang 2011-12-24<BR>
 *             why is modify Description
 * @copyRight 亚信联创电信CRM研发部
 */

public class PortalInterceptor extends HandlerInterceptorAdapter {

	protected Log log = Log.getLog(PortalInterceptor.class);

	@Override
	public boolean preHandle(HttpServletRequest request,
			HttpServletResponse response, Object handler)
			throws ServletException {
		if (handler instanceof HandlerMethod) {
			Object object = ((HandlerMethod) handler).getBean();
			
			String className=object.getClass().getName();
			int $Index=className.indexOf("$");
			className=$Index>0?className.substring(0,$Index):className;
			StringBuffer classPackageName=new StringBuffer(className);
			Method method = ((HandlerMethod) handler).getMethod();
			classPackageName.append("/");
			classPackageName.append(method.getName());
			RequestMapping requestMappingClazzAnn = AnnotationUtils.findAnnotation(
					method, RequestMapping.class);
			if(requestMappingClazzAnn!=null){
				RequestMethod[] rMethods=requestMappingClazzAnn.method();
				if(rMethods!=null){
					classPackageName.append(":");
					for(RequestMethod rMethod:rMethods){
						classPackageName.append(rMethod.toString());
					}
				}
			}
		
			log.debug("入参={}", classPackageName.toString()); 
			Enumeration enu=request.getAttributeNames();
//			while(enu.hasMoreElements()){
//				String name=(String)enu.nextElement();
//				log.debug("attribute name={}",name);
//				
//			}
			log.debug("URI_TEMPLATE_VARIABLES_ATTRIBUTE value={}", 
					JsonUtil.toString(request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE)));
			log.debug("PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE value={}", 
					JsonUtil.toString(request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE)));
	
			log.debug("BEST_MATCHING_PATTERN_ATTRIBUTE value={}", 
					JsonUtil.toString(request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE)));
			log.debug("PARAM MAP VALUE value={}", 
					JsonUtil.toString(request.getParameterMap()));

		}
		return true;
	}

	/**
	 * This implementation is empty.
	 */
	public void postHandle(HttpServletRequest request,
			HttpServletResponse response, Object handler,
			ModelAndView modelAndView) throws Exception {
		
	}
}
