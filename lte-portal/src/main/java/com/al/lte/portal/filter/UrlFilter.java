package com.al.lte.portal.filter;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.al.ecs.log.Log;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 过滤想要阻止的URL请求
 * 
 * @author neil
 * 
 */
public class UrlFilter extends OncePerRequestFilter {

	private static Log log = Log.getLog(UrlFilter.class);

	private static String[] filterUrls = null;
	static {
		filterUrls = new String[3];
		filterUrls[0] = "/order/";
		filterUrls[1] = "/orderUndo/";
		filterUrls[2] = "/orderQuery/";
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request,
			HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		if (filterChannelId(request)) {
			//response.sendError(HttpServletResponse.SC_FORBIDDEN);
			String path = request.getServletPath();
			if(path!=null&&path.length()>1){
				path = path.substring(1,path.length()) ;
			}
			String current = EhcacheUtil.getCurrentPath(request.getSession(),path);
			response.sendRedirect(request.getContextPath()+"/main/limit?current="+current);
			log.warn(" channel id is needed! FORBIDDEN");
			return;
		}
		filterChain.doFilter(request, response);
	}

	/**
	 * 访问order路径的请求都必须要有channelId
	 * @param request
	 * @return true - 需要禁止访问； false - 允许访问
	 */
	private boolean filterChannelId(HttpServletRequest request) {

		HttpSession session = request.getSession();
		String path = request.getServletPath();
		//先遍历一遍地址，判断该请求的url是否需要校验channelId
		int i = 0;
		for (i = 0; i < filterUrls.length; i++) {
			if (path.startsWith(filterUrls[i])) {
				break;
			}
		}
		if (i == filterUrls.length) {
			return false;
		}
		log.debug("path={}", path);
		//需要校验，取出sessionStaff
		SessionStaff sessionStaff = (SessionStaff) session
				.getAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF);
		//session不存在，由其他过滤器处理
		if (sessionStaff == null) {
			return false;
		}
		//校验不通过，不存在channelId，返回true
		if (StringUtils.isBlank(sessionStaff.getCurrentChannelId())) {
			return true;
		}
		return false;
	}
}
