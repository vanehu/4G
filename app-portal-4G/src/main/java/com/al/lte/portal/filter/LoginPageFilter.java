package com.al.lte.portal.filter;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.filter.OncePerRequestFilter;

import com.al.ecs.exception.InterfaceException;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.SysConstant;

public class LoginPageFilter extends OncePerRequestFilter{
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
			if("ON".equals(flag)){
				 String url = "http://crm.189.cn/ltePortal/";
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
