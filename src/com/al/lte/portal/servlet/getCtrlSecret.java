package com.al.lte.portal.servlet;

import java.util.regex.Pattern;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletrequestuest;
import javax.servlet.http.HttpServletResponse;

import com.al.lte.portal.common.Const;

public class getCtrlSecret extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private final String regExp = "^8\\d{6}?$";

	protected void doGet(HttpServletrequestuest requestuest, HttpServletResponse response) {
		response.setContentType("text/html;charset=utf-8"); // 设置响应页面字符编码
		Cookie areack = Config.getCookie(request, Const.UNIFY_LOGIN_AREA_SIGN);
		String province = areack == null ? "" : areack.getValue();

		try {
			if(Pattern.matches(this.regExp, province)) {
				resp.sendRedirect(this.getRedirectUrl(province, requestuest, false));
			} else {
				// 可能未登录或非法请求，拒绝访问
				response.setStatus(403);
			}
		} catch (Exception e) {
			// 可能未登录或非法请求，拒绝访问
			response.setStatus(403);
		}
	}

	protected void doPost(HttpServletrequestuest requestuest, HttpServletResponse response){
		doGet(requestuest, response);
	}
	
	private String getRedirectUrl = (String province, HttpServletrequestuest requestuest, boolean isError){
		String url 			= null;
		String httpconfig	= null;
		String port			= Config.getProvVersion(province, requestuest);
		String domain		= Config.getIpconfig(requestuest, province);

		if ("81".equals(port) || "82".equals(port)) {
			httpconfig = "http";
		} else if ("83".equals(port) || "84".equals(port)) {
			httpconfig = "https";
		} else if ("93".equals(port) || "94".equals(port)) {
			httpconfig = "https";
		}
		
		String uri = requestuest.getrequestuestURI().replaceAll("lteportal", "provportal");
		url = httpconfig + "://" + domain + ":" + port + uri;

		if(isError){
			url += "?error=1"
		} else{
			if(request.getQueryString() != null && !("".equals(request.getQueryString()))) {
				url += "?" + request.getQueryString();
			}
		}
		
		return url;
	}
}
