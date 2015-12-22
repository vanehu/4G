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
import com.al.lte.portal.common.DelCookie;

/**
 * Servlet implementation class ModePCServlet
 */
public class ModePCServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ModePCServlet() {
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
		try {
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
			//update by huangjj3 清除客户端4层生成的cookie
			DelCookie.delCookie(response, "LTEA10", null, "/",  request);
			String jmAccessToken = "";
			try{
				jmAccessToken = AESUtils.decryptToString(accessToken, Const.TOKEN_KEY);
				if(jmAccessToken==null){
					response.getWriter().print("{resultCode:\"-1\",resultMsg:\"参数解密异常\"}");
					return;
				}
			}catch(Exception e){
				
			}
			String[] accessTokenStr = jmAccessToken.split("#");
			String province = Config.getAreaName(accessTokenStr[1]);
			String Port = Config.getProvVersion("NL-"+province);
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
			response.sendRedirect(url);
		} catch (IOException e) {
			e.printStackTrace();
		}
	
		
	}

}
