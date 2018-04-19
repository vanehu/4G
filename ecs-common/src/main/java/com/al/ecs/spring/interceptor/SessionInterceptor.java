package com.al.ecs.spring.interceptor;

import java.io.IOException;
import java.lang.reflect.Method;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.oro.text.perl.Perl5Util;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;
import org.springframework.web.util.UrlPathHelper;

import com.al.ecs.common.util.EncodeUtils;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.AjaxUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.common.web.SpringContextUtil;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.exception.SessionException;
import com.al.ecs.log.Log;
import com.al.ecs.spring.annotation.session.SessionValid;

/**
 * Session 拦截器 . <BR>
 * 基于注解SessionValid 的类和方法级别判断.
 * <P>
 * 
 * @author tang zheng yu
 * @version V1.0 2012-2-25
 * @createDate 2012-2-25 上午11:58:33
 * @modifyDate tang 2012-2-25 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
public class SessionInterceptor extends HandlerInterceptorAdapter {

	/** 未登录前,记录上一次访问的地址 . */
	public static final String LAST_ACCESS_URL = "_last_url";
	/** 会话 session key . */
	public static final String DEFAULT_SESSION_KEY = "_portal_session_key";
	/** 方法级别Session 拦截 . */
	public static final String SESSION_VALID_METHOD = "method";
	/** url级别Session 拦截 . */
	public static final String SESSION_VALID_URL = "url";
	/** method url级别Session 拦截 . */
	public static final String SESSION_VALID_METHOD_URL = "method_url";
	/** 默认Session 拦截为方法级别,需要用注解 @SessionValid . */
	public static final String DEFAULT_SESSION_VALID_METHOD = SESSION_VALID_METHOD;
	/** 来源地址 */
	public static final String HEADER_REFERER = "Referer";
	
    public static final String RESP_CODE = "respCode";
    public static final String RESP_MSG = "respMsg";
	/**
	 * 用户单点登录token的cookie名字
	 */
	public static final String SINGLE_SIGN_COOKIE_TOKEN="_STAFF_LOGIN_SIGN";
	/**
	 * 用户单点登录area的cookie名字
	 */
	public static final String SINGLE_SIGN_COOKIE_AREA="_STAFF_LOGIN_AREA_SIGN";
	/** 日志 */
	protected static Log log = Log.getLog(SessionInterceptor.class);

	/** 会话 session key . */
	private String sessionKey = DEFAULT_SESSION_KEY;

	/** 验证是基于url还是注解.默认方法 . */
	private String valid = SESSION_VALID_METHOD;
	/** spring UrlPathHelper 工具类 . */
	private UrlPathHelper urlPathHelper = new UrlPathHelper();
	/** 对登录后所有页面,都要验证来源地址是否是本站地址 */
	private String domain=null;
	/** 登录地址 */
	private String loginUrl=null;
	/**
	 * 获取验证规则 .
	 * 
	 * @return String valid
	 */
	public String getValid() {
		return valid;
	}

	/**
	 * 设置验证规则 .
	 * 
	 * @param valid 验证规则
	 */
	public void setValid(String valid) {
		this.valid = valid;
	}
	/**
	 * 设置登录页面地址 .
	 * 
	 * @param loginUrl 登录页面地址
	 */
	public void setLoginUrl(String loginUrl) {
		this.loginUrl = loginUrl;
	}
	/**
	 * 设置session key .
	 * 
	 * @param sessionKey session key
	 */
	public void setSessionKey(String sessionKey) {
		this.sessionKey = sessionKey;
	}

	/**
	 * 来源地地址 .
	 * 
	 * @param referer 来源地地址
	 */
	public void setDomain(String domain) {
		this.domain = domain;
	}
	/**
	 * 扩展Session拦截
	 */
	private ISessionInterceptor iSessionInterceptor=null;
	/** true为 And,默认false OR */
	private boolean isAndOr=false;
	public void setAndOr(boolean isAndOr) {
		this.isAndOr = isAndOr;
	}
	public void setiSessionInterceptor(ISessionInterceptor iSessionInterceptor) {
		this.iSessionInterceptor = iSessionInterceptor;
	}

	/**
	 * Session拦截未登录,直接抛出异常.
	 * <P>
	 * @param request HttpServletRequest
	 * @param response HttpServletResponse
	 * @param handler HandlerMethod or ResourcesHandlerMaping
	 * @return boolean true:表示继续运行,false则中止运行.
	 * @exception ServletException ServletException
	 * @exception SessionException 会话异常,编码 1101
	 */
	@Override
	public boolean preHandle(HttpServletRequest request,
			HttpServletResponse response, Object handler)
			throws ServletException, SessionException {
//		if (handler instanceof HandlerMethod) {
////		Enumeration enu=request.getAttributeNames();
////		while(enu.hasMoreElements()){
////			String name=(String)enu.nextElement();
////			log.debug("attribute name={}",name);
////			
////		}
////		log.debug("URI_TEMPLATE_VARIABLES_ATTRIBUTE value={}", 
////				JacksonUtil.buildNormalJackson().objectToJson(request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE)));
////		log.debug("PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE value={}", 
////				JacksonUtil.buildNormalJackson().objectToJson(request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE)));
////
////		log.debug("BEST_MATCHING_PATTERN_ATTRIBUTE value={}", 
////				JacksonUtil.buildNormalJackson().objectToJson(request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE)));
//		
//		}
		
		
		String queryString=urlPathHelper.getOriginatingQueryString(request);
		StringBuffer urlB =new StringBuffer(urlPathHelper.getOriginatingRequestUri(request));
		if(queryString!=null && queryString.length()>0){
			urlB.append("?");
			urlB.append(queryString);
		}
		String url=urlB.toString();
		//基于注解方法的拦截
		if (SESSION_VALID_METHOD.equals(valid)) {
			// 有handl method，就是有调controller 方法
			// 针对资源,js.image,css等等 mvc resource不做处理
			if (handler instanceof HandlerMethod) {
				boolean resultFlg= methodValid(request,response, handler,url);
				if(iSessionInterceptor!=null){
					if(isAndOr){
						return resultFlg && iSessionInterceptor.checkSession(request, response, (HandlerMethod)handler, url);
					}else {
						return resultFlg || iSessionInterceptor.checkSession(request, response, (HandlerMethod)handler, url);
					}
				}
				if(!resultFlg){
					throw new SessionException(AjaxUtils.isAjaxRequest(request),request.getContextPath()+loginUrl);
				}
			}
			return true;
		//基于URL法的拦截	
		} else  {
			if(!checkReferer(request)){
				try {
					response.sendError(403,"非法请求!");
				} catch (IOException e) {
					e.printStackTrace();
				}
				return false;
			}
			if (handler instanceof HandlerMethod) {
				Object object = ((HandlerMethod) handler).getBean();
				Method method = ((HandlerMethod) handler).getMethod();
				SessionValid sessionValidClazz = AnnotationUtils.findAnnotation(
						object.getClass(), SessionValid.class);
				SessionValid sessionValidMethod = AnnotationUtils.findAnnotation(
						method, SessionValid.class);
				//整个类不验证
				if(sessionValidClazz !=null && !sessionValidClazz.value()){
					return true;
				}
				if(sessionValidMethod !=null && !sessionValidMethod.value()){
					return true;
				}
			}
			
			boolean resultFlg=false;
			if(iSessionInterceptor !=null){
				resultFlg=  iSessionInterceptor.checkSession(request, response, (HandlerMethod)handler, this.fixURL(url));
			}
			if(!resultFlg){
				log.error("!!!!! session check fail !!!!");
				addHeadInfo(response,request.getContextPath()+loginUrl);
				if(!AjaxUtils.isAjaxRequest(request)){
				ServletUtils.addCookie(response,  "/",
						ServletUtils.HALF_HOUR_SECONDS, LAST_ACCESS_URL,this.fixURL(url));
				}
				PropertiesUtils propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
				String unifylogin = propertiesUtils.getMessage("UNIFYLOGIN");
				if((request.getContextPath()+"/app/main/common").equals(this.fixURL(url))){
					request.getSession().setAttribute("_session_app_flag", "1");
					return true;
				}else if(this.fixURL(url).contains("app")){
					throw new SessionException(AjaxUtils.isAjaxRequest(request),request.getContextPath()+loginUrl);
				}
				if("ON".equals(unifylogin)){
					try {
						response.sendRedirect("http://crm.189.cn/ltePortal/");
					} catch (IOException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
					return false;
				}else{
					throw new SessionException(AjaxUtils.isAjaxRequest(request),request.getContextPath()+loginUrl);
				}
			}
		// 优先选方法，若方法有，则用方法验证，否则用URL验证
		}
		return true;
	}
	
	/**
	 * 方法验证
	 * @param request
	 * @param response
	 * @param handler
	 * @param url
	 * @return boolean false:表示无判断,true:表示登录，异常表示未登录
	 * @throws SessionException
	 */
	public boolean methodValid(HttpServletRequest request,
			HttpServletResponse response, Object handler,String url ) throws SessionException{
		Object object = ((HandlerMethod) handler).getBean();
		Method method = ((HandlerMethod) handler).getMethod();
		SessionValid sessionValidClazz = AnnotationUtils.findAnnotation(
				object.getClass(), SessionValid.class);
		SessionValid sessionValidMethod = AnnotationUtils.findAnnotation(
				method, SessionValid.class);
		Object sessionObj = ServletUtils.getSessionAttribute(request,
				sessionKey);
		// 类有这个注解，全类的方法都要判断
		if (sessionValidClazz !=null && sessionValidClazz.value()) {
			if(!checkReferer(request)){
				try {
					response.sendError(403,"非法请求!");
				} catch (IOException e) {
					log.error("checkReferer error", e);
				}
				return false;
			}
			if (sessionObj == null) {
				addHeadInfo(response,request.getContextPath()+loginUrl);
				if(!AjaxUtils.isAjaxRequest(request)){
					ServletUtils.addCookie(response, "/",
							ServletUtils.HALF_HOUR_SECONDS, LAST_ACCESS_URL,this.fixURL(url));
				}
				return false;
			}
			// 否则进行方法拦截判断
		} else if (sessionValidMethod !=null && sessionValidMethod.value()) {
			if(!checkReferer(request)){
				try {
					response.sendError(403,"非法请求!");
				} catch (IOException e) {
					log.error("checkReferer error", e);
				}
				return false;
			}
			if (sessionObj == null) {
				addHeadInfo(response,request.getContextPath()+loginUrl);
				if(!AjaxUtils.isAjaxRequest(request)){
					ServletUtils.addCookie(response,  "/",
							ServletUtils.HALF_HOUR_SECONDS, LAST_ACCESS_URL,this.fixURL(url));
				}
				return false;
			}
		} 
		return true;
		
	}
	
	public void addHeadInfo(HttpServletResponse response,String url){
		ServletUtils.setNoCacheHeader(response);
	    response.setHeader(RESP_CODE, String.valueOf(ResultConstant.SESSION_INVALID.getCode()));
	    response.setHeader(RESP_MSG, EncodeUtils.urlEncode(url));
	}
	/**
	 * 来源地址验证
	 * @param request HttpServletRequest
	 * @return boolean true:校验通过
	 */
	private boolean checkReferer(HttpServletRequest request){
		String headerReferer=request.getHeader(HEADER_REFERER);
		if(domain !=null) {
			if(headerReferer==null || headerReferer.length()<8){
				return false;
			}
			String headDomain=headerReferer.substring(0, headerReferer.indexOf("/", headerReferer.indexOf(".")));
			Perl5Util matcher = new Perl5Util();
			if(matcher.match("/(http|https):\\/\\/"+domain+".*$/i" , headDomain)){
				return true;
			}
			return false;
		}
		return true;
	}
	/** 处理多出来的双斜杆 由于http分发服务器问题，导致url 有又斜杠 */
	private String fixURL(String url){
	    return url.replace("//", "/");
	}
}
