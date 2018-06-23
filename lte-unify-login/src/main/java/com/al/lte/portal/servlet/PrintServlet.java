package com.al.lte.portal.servlet;

import java.io.IOException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.al.lte.portal.common.Config;

/**
 * 省份从集团这边获取回执内容
 * @author whb
 *
 */
public class PrintServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
		resp.setContentType("text/html;charset=utf-8"); // 设置响应页面字符编码
		String areaId = req.getParameter("areaId");
		String province = Config.getAreaName(areaId);
		String Port = Config.getProvVersion(province,req);
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
