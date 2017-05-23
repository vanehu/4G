package com.al.lte.portal.filter;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.filter.OncePerRequestFilter;

import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.exception.InterfaceException;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.PortalUtils;
import com.al.lte.portal.common.SysConstant;

public class LoginPageFilter extends OncePerRequestFilter{
	@Autowired
	PropertiesUtils propertiesUtils;
	@Override
	protected void doFilterInternal(HttpServletRequest request,
			HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		try {
			String flag = MySimulateData.getInstance().getParam((String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY),"UNIFYLOGIN");
			if(request.getQueryString()!=null&&!("".equals(request.getQueryString()))){
				filterChain.doFilter(request, response);
				return;
			}
			String headerHost = request.getHeader(SysConstant.HTTP_REQUEST_HEADER_HOST);
			String defaultDomain= propertiesUtils.getMessage("DEFAULTDOMAIN");
			String newDomain= propertiesUtils.getMessage("NEWDOMAIN");
			String domainNameONOFF = propertiesUtils.getMessage("DOMAINNAMEONOFF");
			if(PortalUtils.isSecondLevelDomain(headerHost) && "ON".equals(domainNameONOFF) && "ON".equals(flag)){
				String url = "https://"+newDomain+"/ltePortal/";
				 response.sendRedirect(url);
			}else if("ON".equals(flag)){
				 String url = "https://"+defaultDomain+"/ltePortal/";
				 response.sendRedirect(url);
				 return;
			}else{
				filterChain.doFilter(request, response);
			}
		} catch (InterfaceException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
}
