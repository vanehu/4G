package com.al.lte.portal.filter;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashSet;
import java.util.Set;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.UrlPathHelper;

import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.common.web.SpringContextUtil;
import com.al.ecs.log.Log;
import com.al.ecs.spring.interceptor.SessionInterceptor;
import com.al.lte.portal.common.StreamUtils;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.core.DataSourceManager;
import com.al.lte.portal.model.SessionStaff;

/**
 * 数据路由过滤器（将路由参数放入session中）
 * 
 * @author jinjian
 * 
 */
public class PortalDataSourceFilter extends OncePerRequestFilter {

	private static Log log = Log.getLog(PortalDataSourceFilter.class);
	private UrlPathHelper urlPathHelper = new UrlPathHelper();
	private static Set<String> excludeUrls = null;
	/** 数据路由关键字，轮询取链接参数或者报文中的以下字段作为路由判断依据，直到某一关键字不为空 */
	private static final String[] DATA_ROUTER_KEYWORDS = {"areaId","staffProvCode"};
	/** JSON格式的content type */
	private static final String JSON_CONTENT_TYPE = "application/json";
	/** 登录验证请求地址 */
	private static final String LOGIN_AUTH_URL = "/staff/login/logindo";
	private static final String DEFULT_ENCODING = "UTF-8";
	private DataSourceManager dataSourceManager;
	
	static {
		excludeUrls=new HashSet<String>(10);//不需要过滤的链接
		excludeUrls.add("/main/limit");
		excludeUrls.add("/image/");
		excludeUrls.add("/css/");
		excludeUrls.add("/js/");
		excludeUrls.add("/file/");
		excludeUrls.add("/card/");
		excludeUrls.add("/skin/");
		excludeUrls.add("/merge/");
		excludeUrls.add("/appInterfince/");//app对外接口暂时不需拦截
	}
	
	public PortalDataSourceFilter() {
		try {
			if(SpringContextUtil.getApplicationContext() != null && (DataSourceManager) SpringContextUtil.getBean("dataSourceManager") != null){
    			dataSourceManager = (DataSourceManager) SpringContextUtil.getBean("dataSourceManager");
    		}
		} catch (Exception e) {
			log.error(e);
		}
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request)
			throws ServletException {
		String path = urlPathHelper.getOriginatingRequestUri(request).substring(request.getContextPath().length());
		// 先遍历一遍地址，判断该请求的url是否需要校验
		for (String excludeUrl : excludeUrls) {
			if (path.startsWith(excludeUrl)) {
				return true;
			}
		}
		return false;
	}
	
	@Override
	protected void doFilterInternal(HttpServletRequest request,
			HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		/*
		 * 填充数据路由参数到session中
		 * 1、获取session，如果是登录验证请求，则将session中的路由参数重置；
		 * 2、判断session中currentDatasourceKey是否存在，存在则验证通过，转发请求；
		 * 3、否则，取链接参数或者报文体中的路由关键字（areaId、staffProvCode等），存在并且匹配到数据源则验证通过，并保存到session变量currentDatasourceKey中，转发请求；
		 * 4、否则，有可能是单点登录过来的，读取cookie中的地区ID，存在并且匹配到数据源则验证通过，并保存到session变量currentDatasourceKey中，转发请求；
		 * 5、否则，使用默认数据源关键字（即公共库）并保存到session变量currentDatasourceKey中，转发请求；
		 */
		HttpSession session = request.getSession();
		try {
			//1、获取session，如果是登录验证请求，则将session中的路由参数重置；
			if(urlPathHelper.getOriginatingRequestUri(request).substring(request.getContextPath().length()).startsWith(LOGIN_AUTH_URL)){
				ServletUtils.delCookie(response, SessionInterceptor.SINGLE_SIGN_COOKIE_AREA, request);
				session.removeAttribute(SysConstant.SESSION_DATASOURCE_KEY);
				//update by huangjj3 图片验证码不生效，session被注销从session中取不到图片验证码的生成信息，所以没有验证，现在登录后注销
				/*session.invalidate();
				session = request.getSession(true);*/
			}
			//2、判断session中currentDatasourceKey是否存在，存在则验证通过，转发请求
			if(session.getAttribute(SysConstant.SESSION_DATASOURCE_KEY) != null){
				SessionStaff sessionStaff = (SessionStaff) session.getAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF);
				if(sessionStaff != null && StringUtils.isBlank(sessionStaff.getDbKeyWord())){
					sessionStaff.setDbKeyWord((String) session.getAttribute(SysConstant.SESSION_DATASOURCE_KEY));
					session.setAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF, sessionStaff);
				}
			} else {
				//3、否则，取链接参数或者报文体中的路由关键字（areaId、staffProvCode等），存在并且匹配到数据源则验证通过，并保存到session变量currentDatasourceKey中，转发请求；
				//从parameter或者requestBody中获取，轮询取报文中的关键字作为路由判断依据，直到某一关键字不为空
				String areaId = null;
				String dbKeyWord = null;
				for(String key : DATA_ROUTER_KEYWORDS){
					areaId = request.getParameter(key);
					if(StringUtils.isNotBlank(areaId)){
						break;
					} 
				}
				if(StringUtils.isBlank(areaId)){
					String contentType = request.getContentType();
					if(contentType != null && contentType.indexOf(JSON_CONTENT_TYPE) >= 0){
						
						//读取输入流之后重新封装requestBody的输入流，使后续读取inputStream或reader仍有效
						byte[] body = StreamUtils.getBytes(request.getInputStream());
						request = new RequestBodyWrapper(request, body);
						String bodyString = new String(body, DEFULT_ENCODING);
						
						for(String key : DATA_ROUTER_KEYWORDS){
							areaId = JsonUtil.getNormal().getJsonPathValue(bodyString, key);
							if(StringUtils.isNotBlank(areaId)){
								break;
							}
						}
					}
				}
				dbKeyWord = dataSourceManager.areaIdToDbKeyWord(areaId);
				if(StringUtils.isNotBlank(dbKeyWord)){
					setSessionDbKeyWordAttr(session, dbKeyWord);
				} else {
					//4、否则，有可能是单点登录过来的，读取cookie中的地区ID，存在并且匹配到数据源则验证通过，并保存到session变量currentDatasourceKey中，转发请求；
					areaId = ServletUtils.getCookieValue(request, SessionInterceptor.SINGLE_SIGN_COOKIE_AREA);
					dbKeyWord = dataSourceManager.areaIdToDbKeyWord(areaId);
					if(StringUtils.isNotBlank(dbKeyWord)){
						setSessionDbKeyWordAttr(session, dbKeyWord);
					} else {
						//5、否则，使用默认数据源关键字（即公共库）并保存到session变量currentDatasourceKey中，转发请求；
						setSessionDbKeyWordAttr(session, DataSourceManager.DEFAULT_DATASOURCE_KEY);
					}
					
				}
				
			}
			
		} catch (Exception e) {
			setSessionDbKeyWordAttr(session, DataSourceManager.DEFAULT_DATASOURCE_KEY);
			log.error(e);
		}
		log.debug("------PortalDataSourceFilter------ path:{} ,currentDatasourceKey:{}", request.getServletPath(),session.getAttribute(SysConstant.SESSION_DATASOURCE_KEY));
		filterChain.doFilter(request, response);
	}
	

	/*
	 * 设置session中的路由参数
	 */
	private void setSessionDbKeyWordAttr(HttpSession session,String dbKeyWord){
		try {
			DataSourceManager.setCurrentDataSourceKey(dbKeyWord);
			session.setAttribute(SysConstant.SESSION_DATASOURCE_KEY, dbKeyWord);
			SessionStaff sessionStaff = (SessionStaff) session.getAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF);
			if(sessionStaff != null){
				sessionStaff.setDbKeyWord(dbKeyWord);
				session.setAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF, sessionStaff);
			}
		} catch (Exception e) {
			log.error(e);
		}
	}

	/*
	 * 内部类，重新封装requestBody
	 */
	private class RequestBodyWrapper extends HttpServletRequestWrapper {
		private final byte[] body;

		public RequestBodyWrapper(HttpServletRequest request,byte[] newBody) throws IOException {
			super(request);
			body = newBody;
		}

		@Override
		public BufferedReader getReader() throws IOException {
			return new BufferedReader(new InputStreamReader(getInputStream()));
		}

		@Override
		public ServletInputStream getInputStream() throws IOException {
			final ByteArrayInputStream bais = new ByteArrayInputStream(body);
			return new ServletInputStream() {
				@Override
				public int read() throws IOException {
					return bais.read();
				}
			};
		}

	}
	
	
}
