package com.al.lte.portal.servlet;

import java.io.IOException;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.al.lte.portal.common.Config;
import com.al.lte.portal.common.DelCookie;

public class StaffServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;
	
	private String path = "/ltePortal/staff/";

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
		resp.setContentType("text/html;charset=utf-8"); // 设置响应页面字符编码
		String reqUri =  req.getRequestURI();
		if((path+"login/setLoginCookie").equals(reqUri)){
			setLoginCookie(req,resp);
		}else if((path+"logout").equals(reqUri)){
			logout(req,resp);
		}
	}
	
	/**
	 * 注销
	 * @param req
	 * @param resp
	 */
	private void logout(HttpServletRequest req, HttpServletResponse resp) {
		Cookie areack = Config.getCookie(req,"_UNIFY_LOGIN_AREA_SIGN");
		if(areack!=null){
			String province = areack.getValue();
			String Port = Config.getProvVersion(province);
			String httpconfig = "";
			if("81".equals(Port) || "82".equals(Port)){
				httpconfig = "http";
			}else if("83".equals(Port) || "84".equals(Port)){
				httpconfig = "https";
			}else if("93".equals(Port) || "94".equals(Port)){
				httpconfig = "https";
			}
			String uri = req.getRequestURI().replaceAll("ltePortal", "provPortal");
			String url = httpconfig + "://" + Config.getIpconfig(req) + ":"+ Port + uri;
			try {
				resp.sendRedirect(url);
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}

	/**
	 * 设置Cookie
	 * @param req
	 * @param resp
	 */
	private void setLoginCookie(HttpServletRequest req, HttpServletResponse resp){
		String areaId = req.getParameter("areaId");
		String province = Config.getAreaName(areaId);
		Config.addCookie(province,resp,req);
		//update by huangjj3 清除客户端4层生成的cookie
		DelCookie.delCookie(resp, "LTEA10", null, "/", req);
		String Port = Config.getProvVersion(province);
		//String domain = ("ON".equals(Config.getProperties().getProperty("DisasterTolerance"))) ? Config.getIpconfig(req, province) : Config.getIpconfig(req);
		String domain = Config.getIpconfig(req, province);
		String httpconfig = "";
		if("81".equals(Port) || "82".equals(Port)){
			httpconfig = "http";
		}else if("83".equals(Port) || "84".equals(Port)){
			httpconfig = "https";
		}else if("93".equals(Port) || "94".equals(Port)){
			httpconfig = "https";
		}
		String uri = req.getRequestURI().replaceAll("ltePortal", "provPortal");
		String url = httpconfig + "://" + domain + ":"
			+ Port + uri +"?"+ req.getQueryString()
			+ "&prov=" + province;
		try {
			resp.sendRedirect(url);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
