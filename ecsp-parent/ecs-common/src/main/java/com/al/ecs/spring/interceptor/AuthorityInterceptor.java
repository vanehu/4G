package com.al.ecs.spring.interceptor;

import java.lang.reflect.Method;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerMapping;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;
import org.springframework.web.util.UrlPathHelper;

import com.al.ecs.common.web.AjaxUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.Result;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.log.Log;

import com.al.ecs.spring.annotation.session.AuthorityValid;

/**
 * 权限拦截控制器类 .
 * <P>
 * 
 * @author tang zheng yu
 * @version V1.0 2012-8-7
 * @createDate 2012-8-7 上午11:31:11
 * @modifyDate tang zheng yu 2012-8-7 <BR>
 * @copyRight 亚信联创EC研发部
 */
public class AuthorityInterceptor extends HandlerInterceptorAdapter {

	protected Log log = Log.getLog(AuthorityInterceptor.class);

	public static final String AUTHORITY_CODE_METHOD="method";
	public static final String AUTHORITY_CODE_URL="url";
	/**
	 * 通过spring配置注入
	 */
    private AbstractAuthorityInterceptor authorityInterceptor;
    /**
     * Session 里获取 Session bean的key
     */
    private String sessionKey;
    /**
     * 全局配置，默认拦截，若为false，全部不拦截
     */
    private boolean forceCheck=true;
  
    /**
	 * 全局配置，默认拦截，若为false，全部不拦截
	 * @param forceCheck 为false，全部不拦截
	 */
	public void setForceCheck(boolean forceCheck) {
		this.forceCheck = forceCheck;
	}
	/** spring UrlPathHelper 工具类 . */
	private UrlPathHelper urlPathHelper = new UrlPathHelper();
	
	private String  authorityCode=AUTHORITY_CODE_METHOD;

	/**
	 * 权限编码传参数通过配置，可以传url或method，默认是method
	 * @param authorityCode
	 */
    public void setAuthorityCode(String authorityCode) {
		this.authorityCode = authorityCode;
	}
	/**
     * 无权限访问，失败跳转地址，针对非ajax，
     * 若ajax请求，直接返回JSON
     */
    private String failedUrl;

	public void setAuthorityInterceptor(
			AbstractAuthorityInterceptor authorityInterceptor) {
		this.authorityInterceptor = authorityInterceptor;
	}

	public void setSessionKey(String sessionKey) {
		this.sessionKey = sessionKey;
	}

	public void setFailedUrl(String failedUrl) {
		this.failedUrl = failedUrl;
	}

	@Override
	public boolean preHandle(HttpServletRequest request,
			HttpServletResponse response, Object handler)
			throws ServletException,AuthorityException {
		Object sessionBean=ServletUtils.getSessionAttribute(request, sessionKey);
		//为空，不作权限验证
		if(sessionBean==null){
			return true;
		}
		//全局不拦截
		if(!forceCheck){
			return true;
		}
		String queryString=urlPathHelper.getOriginatingQueryString(request);
		StringBuffer urlB =new StringBuffer(urlPathHelper.getOriginatingRequestUri(request));
		if(queryString!=null && queryString.length()>0){
			urlB.append("?");
			urlB.append(queryString);
		}
		String url=urlB.toString();
		if(failedUrl==null){
			failedUrl=request.getHeader("Referer");
			if(failedUrl==null){
				failedUrl=url;
			}
		}
		if (handler instanceof HandlerMethod) {
			Object object = ((HandlerMethod) handler).getBean();
			Method method = ((HandlerMethod) handler).getMethod();
			StringBuffer classPackageName = new StringBuffer("");
			AuthorityValid authorityValidClazz = AnnotationUtils.findAnnotation(
					object.getClass(), AuthorityValid.class);
			AuthorityValid authorityValid = AnnotationUtils.findAnnotation(
					method, AuthorityValid.class);
			boolean isCustom=false;
			//当类存在注解类时，则以类来判断，整个类不拦截
			if(authorityValidClazz !=null && !authorityValidClazz.isCheck()){
				return true;
			}
			//方法不为空，则以方法为主
			if(authorityValid !=null){
				if(!authorityValid.isCheck()){//不需要判断
					if(authorityValid.isDataCheck()){//数据权限验证
						return checkDataAuthority(request);
					}else{
						return true;//通过
					}
				}
				//空文字
				if(authorityValid.value()!=null && authorityValid.value().trim().length()>0 ){
					classPackageName.append(authorityValid.value().trim());
					isCustom=true;
				}
			//方法和类都为null时，都不验证
			}else  if(authorityValidClazz ==null){
				return true;
			}
			if(!isCustom){
				//通过方法全路径编码
				if(AUTHORITY_CODE_METHOD.equals(authorityCode)){
					String className = object.getClass().getName();
					int index$ = className.indexOf("$");
					className = index$ > 0 ? className.substring(0, index$) : className;
					classPackageName.append(className);
					classPackageName.append("/");
					classPackageName.append(method.getName());
					RequestMapping requestMappingClazzAnn = AnnotationUtils
							.findAnnotation(method, RequestMapping.class);
					if (requestMappingClazzAnn != null) {
						RequestMethod[] rMethods = requestMappingClazzAnn.method();
						if (rMethods != null) {
							classPackageName.append(":");
							for (RequestMethod rMethod : rMethods) {
								classPackageName.append(rMethod.toString());
							}
						}
					}
				//通过地址编码
				}else{
					String mappingUrl=(String)request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
					if(mappingUrl !=null && mappingUrl.indexOf("//")==0 ){//如果两个/开头，去掉一个
						mappingUrl=mappingUrl.substring(1);
					}
					classPackageName.append(mappingUrl);
				}
			}
			log.debug("authorityCode={}", classPackageName.toString());
			int result=authorityInterceptor.checkAuthorityByActionMethod(request, classPackageName.toString());
			if(result==0){//有该权限
				if(authorityValid !=null && authorityValid.isDataCheck()){//数据权限验证
					return checkDataAuthority(request);
				}else{
					return true;
				}
			}else {//无权限访问该地址，抛出权限异常
				throw new AuthorityException(new Result(ResultConstant.ACCESS_NOT_AUTHORITY_URL.getCode(),failedUrl),
						AjaxUtils.isAjaxRequest(request));
			}
		} else {
			int result=authorityInterceptor.checkAuthorityByResource(request, url);
			if(result==0){//有该权限
				return true;
			}else {//无权限访问该地址，抛出权限异常
				throw new AuthorityException(new Result(ResultConstant.ACCESS_NOT_AUTHORITY_URL.getCode(),failedUrl),
						AjaxUtils.isAjaxRequest(request));
			}
		}
	}
	
	/**
	 * 数据访问权限校验
	 * 只针对方法权限拦截作控制,对url资源不作拦截
	 * @param request
	 * @return boolean 
	 * @throws AuthorityException
	 */
	private boolean checkDataAuthority(HttpServletRequest request) throws AuthorityException{
		Object sessionBean=ServletUtils.getSessionAttribute(request, sessionKey);
		Map pathVariablesMap=(Map)request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
		String mappingUrl=(String)request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
		int result=authorityInterceptor.checkDataAuthorityByUrl(request, mappingUrl, pathVariablesMap, request.getParameterMap());
		if(result==0){//有该权限
			return true;
		}else {//无权限访问该地址，抛出权限异常
			throw new AuthorityException(new Result(ResultConstant.ACCESS_NOT_AUTHORITY_DATA.getCode(),failedUrl),
					AjaxUtils.isAjaxRequest(request));
		}
	}
}
