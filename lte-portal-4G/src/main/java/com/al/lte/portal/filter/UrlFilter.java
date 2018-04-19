package com.al.lte.portal.filter;

import java.io.IOException;
import java.util.Set;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.UrlPathHelper;

import com.al.ecs.common.util.MDA;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.FilterBaseData;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.PortalUtils;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 过滤想要阻止的URL请求
 * 
 * @author neil,jinjian
 * 
 */
public class UrlFilter extends OncePerRequestFilter {

	private static Log log = Log.getLog(UrlFilter.class);
	private UrlPathHelper urlPathHelper = new UrlPathHelper();
	private static String[] excludeUrls=null;

	/**
	 * The default protocol: 'https'.
	 */
	public static final String SECURE_PROTOCOL = "https";
	
	static {
		excludeUrls=new String[9];//不需要过滤的链接
		excludeUrls[0]="/staff/";
		excludeUrls[1]="/main/limit";
		excludeUrls[2]="/image/";
		excludeUrls[3]="/css/";
		excludeUrls[4]="/js/";
		excludeUrls[5]="/file/";
		excludeUrls[6]="/card/";
		excludeUrls[7]="/skin/";
		excludeUrls[8]="/merge/";
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request,
			HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		if (isForbidden(request)) {
			//response.sendError(HttpServletResponse.SC_FORBIDDEN);
			String path = request.getServletPath();
			if(path!=null&&path.length()>1){
				path = path.substring(1,path.length()) ;
			}
			String flag = "";
			try {
				String dbKeyWord = (String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY);
				flag = MySimulateData.getInstance().getParam(dbKeyWord,"UNIFYLOGIN");
			} catch (InterfaceException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			int port = request.getLocalPort();
			String headerHost = request.getHeader(SysConstant.HTTP_REQUEST_HEADER_HOST);
			if(PortalUtils.isSecondLevelDomain(headerHost) && "ON".equals(MDA.DOMAINNAMEONOFF)){
				//#591478 若启用分省域名，应重定向到*.crm.189.cn:port
				response.sendRedirect("https://" + headerHost + "/provPortal/main/limit?current="+EhcacheUtil.getCurrentPath(request.getSession(),path));
			}else{
				if((port==10101 || port==10102 || port==10103) && "ON".equals(flag)){
					response.sendRedirect("https://"+MDA.DEFAULTDOMAIN+":83/provPortal/main/limit?current="+EhcacheUtil.getCurrentPath(request.getSession(),path));
				}else if((port==10151 || port==10152 || port==10153) && "ON".equals(flag)){
					response.sendRedirect("https://"+MDA.DEFAULTDOMAIN+":84/provPortal/main/limit?current="+EhcacheUtil.getCurrentPath(request.getSession(),path));
				}else{
					response.sendRedirect(request.getContextPath()+"/main/limit?current="+EhcacheUtil.getCurrentPath(request.getSession(),path));
				}
			}
			return;
		}
		filterChain.doFilter(request, response);
	}

	/**
	 * 判断是否被禁止访问
	 * @param request
	 * @return true - 需要禁止访问； false - 允许访问
	 */
	private boolean isForbidden(HttpServletRequest request) {

		HttpSession session = request.getSession();
		//需要校验，取出sessionStaff
		SessionStaff sessionStaff = (SessionStaff) session.getAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		//未登录,交给session拦截器判断
		if(sessionStaff == null){
			return false;
		}
		
		if(FilterBaseData.getInstance().isFilterChannel((String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY))){
			//校验不通过，不存在channelId，返回true
			if (sessionStaff != null && StringUtils.isBlank(sessionStaff.getCurrentChannelId())) {
				log.warn(" channel id is needed! FORBIDDEN");
				return true;
			}
		}
		
		/*
		 * 1、加载鉴权列表，如果sessionStaff或sessionStaff.areaId为空则使用默认省份，否则使用sessionStaff.areaId；如果鉴权列表为空，则允许访问
		 * 2、如果当前访问地址在鉴权列表中，则继续判断，否则允许访问；
		 * 3、根据session中保存的当前用户菜单列表，匹配当前的访问地址，如菜单为空或均未匹配则禁止访问；
		 */
		if(FilterBaseData.getInstance().isFilterAuthUrl((String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY))){
			Set<String> filterUrls = FilterBaseData.getInstance().getProvAuthUrl(sessionStaff == null || sessionStaff.getAreaId() == null ? FilterBaseData.DEFAULT_LOAD_AUTH_PROV : sessionStaff.getAreaId());
			if(filterUrls == null || filterUrls.size() == 0){
				return false;
			}
			String path = urlPathHelper.getOriginatingRequestUri(request).substring(request.getContextPath().length());
			String queryString = urlPathHelper.getOriginatingQueryString(request);//获取请求参数
			if(queryString != null && queryString.length() > 0){
				path = path + "?" + queryString;//拼装成完整的、包含请求参数（如果有请求参数）的请求路径，例如order/batchOrder/batchOrderQuery?batchType=0
			}
			if(path.startsWith("/")){
				path = path.substring(1); //去掉开头的/
			}
			boolean exist = false;
			for(String filterUrl : filterUrls){
				if(path.startsWith(filterUrl)){
					exist = true;
					break;
				}
			}
			if(!exist){
				return false;
			}
			
			if(!pathIsInMenu(session, path)){
				log.warn("path is not authorized! FORBIDDEN");
				return true;
			}
		}
		
		return false;
	}
	
	//判断指定路径是否在已授权访问的url集合中
	private boolean pathIsInMenu(HttpSession session, String path){
		try{
			Object obj = session.getAttribute(SysConstant.SESSION_KEY_MENU_AUTH_URL_LIST);
			if(obj != null && obj instanceof Set){
				Set<String> authUrls = (Set<String>) obj;
				for(String authUrl : authUrls){
					if(path.startsWith(authUrl)){
						return true;
					}
				}
			}
		}catch(Exception e){
			log.error(e);
		}
		return false;
	}
	
	@Override
	protected boolean shouldNotFilter(HttpServletRequest request)
			throws ServletException {
		if(FilterBaseData.getInstance().isFilterNone((String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY))){
			return true;
		}
		
		String uri = urlPathHelper.getOriginatingRequestUri(request);
		String path = uri.substring(request.getContextPath().length());
		//先遍历一遍地址，判断该请求的url是否需要校验
		int i = 0;
		for(i=0;i<excludeUrls.length;i++){
			if (path.startsWith(excludeUrls[i])) {
				return true;
			}
		}
		return false;
	}

	
}
