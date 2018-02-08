package com.al.lte.portal.servlet;

import java.util.regex.Pattern;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONObject;

import com.al.lte.portal.common.CommonUtils;
import com.al.lte.portal.common.Config;
import com.al.lte.portal.common.Const;
import com.al.lte.portal.common.ServletUtils;

public class CtrlSecretServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	protected void doGet(HttpServletRequest request, HttpServletResponse response) {
		String areaId = request.getParameter("areaId");
		String versionId = request.getParameter("versionId");
		String secretParam = request.getParameter("param");
		
		if(CommonUtils.checkParam(areaId, versionId, secretParam)){
			try {			
				if(Pattern.matches(Const.AREA_ID_REGEXP, areaId)) {
					String province = Config.getAreaName(areaId);
					response.sendRedirect(this.getRedirectUrl(province, request, false));
//					request.getRequestDispatcher(this.getRedirectUrl(province, request, false)).forward(request,response);
				} else {
					// 可能未登录或非法请求，拒绝访问
					response.setStatus(403);
					return;
				}
			} catch (Exception e) {
				// 可能未登录或非法请求，拒绝访问
				response.setStatus(403);
				return;
			}
		} else{
			response.setStatus(403);
    		return;
		}
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response){
		response.setContentType("text/html;charset=utf-8");
		
		JSONObject jsonObj = ServletUtils.getJsonObjFromRequest(request, Const.DEFALUT_ENCODE);
		if(jsonObj == null){
			response.setStatus(403);
    		return;
		}
		
		String areaId = jsonObj.getString("areaId");
		String versionId = jsonObj.getString("versionId");
		String secretParam = jsonObj.getString("param");
		
		if(CommonUtils.checkParam(areaId, versionId, secretParam)){
			try {			
				if(Pattern.matches(Const.AREA_ID_REGEXP, areaId)) {
					String province = Config.getAreaName(areaId);
					response.sendRedirect(this.getRedirectUrl(province, request, false));
//					request.getRequestDispatcher(this.getRedirectUrl(province, request, false)).forward(request,response);
				} else {
					// 可能未登录或非法请求，拒绝访问
					response.setStatus(403);
					return;
				}
			} catch (Exception e) {
				// 可能未登录或非法请求，拒绝访问
				response.setStatus(403);
				return;
			}
    	} else{
    		response.setStatus(403);
    		return;
    	}
	}
	
	private String getRedirectUrl (String province, HttpServletRequest request, boolean isError){
		String url 			= null;
		String httpconfig	= null;
		String port			= Config.getProvVersion(province, request);
		String domain		= Config.getIpconfig(request, province);
//		String port			= "8101";
//		String domain		= "10.128.90.194";

		if ("81".equals(port) || "82".equals(port)) {
			httpconfig = "http";
		} else if ("83".equals(port) || "84".equals(port)) {
			httpconfig = "https";
		} else if ("93".equals(port) || "94".equals(port)) {
			httpconfig = "https";
		} else{
			httpconfig = "http";
		}
		
		String uri = request.getRequestURI().replaceAll("ltePortal", "provPortal");
		url = httpconfig + "://" + domain + ":" + port + uri;

		if(isError){
			url += "?error=1";
		} else{
			if(request.getQueryString() != null && !("".equals(request.getQueryString()))) {
				url += "?" + request.getQueryString();
			}
		}
		
		return url;
	}
}
