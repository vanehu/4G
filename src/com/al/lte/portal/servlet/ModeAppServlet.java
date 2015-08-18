package com.al.lte.portal.servlet;

import java.io.IOException;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.al.lte.portal.common.AESUtils;
import com.al.lte.portal.common.Config;
import com.al.lte.portal.common.Const;

/**
 * Servlet implementation class ModeAppServlet
 */
public class ModeAppServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ModeAppServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setContentType( "text/html;charset=utf-8" ) ;  //设置响应页面字符编码   
		String accessToken = request.getParameter("accessToken");//获取到的凭证	
		Map<String, String[]> map=request.getParameterMap();
		boolean flag = true;
		StringBuffer queryString = new StringBuffer();
		for (String key : map.keySet()) {
			String[] values = map.get(key);
			for (int i = 0; i < values.length; i++) {
				String value = values[i];
				if (flag) {
					flag = false;
					queryString.append(key).append("=").append(value);
				} else {
					queryString.append("&").append(key).append("=").append(value);
				}
			}
			
		}
		String jmAccessToken = AESUtils.decryptToString(accessToken, Const.TOKEN_KEY);
		String[] accessTokenStr = jmAccessToken.split("#");
		
		String province = Config.getAreaName(accessTokenStr[1]);
		String Port = Config.getProvVersion(province);
		String httpconfig = "";
		if("81".equals(Port) || "82".equals(Port)){
			httpconfig = "http";
		}else if("83".equals(Port) || "84".equals(Port) || "85".equals(Port)){
			httpconfig = "https";
		}else{
			httpconfig = "http";
		}
		String uri = request.getRequestURI().replaceAll("ltePortal", "provPortal");
		String url = httpconfig + "://" + Config.getIpconfig(request) + ":"
			+ Port + uri +"?"+ queryString.toString()
			+ "&prov=" + province;
		try {
			response.sendRedirect(url);
		} catch (IOException e) {
			e.printStackTrace();
		}
	
		
	}

}
