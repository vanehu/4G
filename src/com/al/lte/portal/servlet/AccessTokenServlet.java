package com.al.lte.portal.servlet;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.params.CoreConnectionPNames;
import org.apache.http.util.EntityUtils;

import com.al.lte.portal.common.AESUtils;
import com.al.lte.portal.common.Config;
import com.al.lte.portal.common.Const;
import com.al.lte.portal.common.HttpClientConnectionManager;

/**
 * Servlet implementation class AccessToken
 */
public class AccessTokenServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	
	private static DefaultHttpClient httpclient;
	static {  
		 httpclient =  new DefaultHttpClient();   
		 httpclient = (DefaultHttpClient) HttpClientConnectionManager.getSSLInstance(httpclient); // 接受任何证书的浏览器客户端 
	} 
	

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public AccessTokenServlet() {
		super();
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request,HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request,HttpServletResponse response) throws ServletException, IOException {
		response.setContentType( "text/html;charset=utf-8" ) ;  //设置响应页面字符编码   
		try {
			String provinceCodeE = request.getParameter("provinceCode");
			String jmParams = request.getParameter("params");
			String provinceCode = "";
			try{
				provinceCode = AESUtils.decryptToString(provinceCodeE,Const.TOKEN_PROVINCE_KEY);
				if(provinceCode==null){
					response.getWriter().print("{resultCode:\"-1\",resultMsg:\"参数解密异常\"}");
					return;
				}
			}catch(Exception e){
				
			}
			String province = Config.getAreaName(provinceCode);
			String Port = Config.getProvVersion("NL-"+province);
			String httpconfig = "";
			if ("81".equals(Port) || "82".equals(Port) ) {
				httpconfig = "http";
			} else if ("83".equals(Port) || "84".equals(Port) || "85".equals(Port)) {
				httpconfig = "https";
			} else {
				httpconfig = "http";
			}
			String uri = request.getRequestURI().replaceAll("ltePortal",
					"provPortal");
			String url = httpconfig + "://" + Config.getIpconfig(request) + ":" + Port + uri+"?prov="+province ;
			HttpPost httpost = new HttpPost(url);
			List<NameValuePair> params = new ArrayList<NameValuePair>();
			params.add(new BasicNameValuePair("provinceCode", provinceCodeE));
			params.add(new BasicNameValuePair("params", jmParams));
			httpost.setEntity(new UrlEncodedFormEntity(params,  "utf-8"));
			httpclient.getParams().setParameter(CoreConnectionPNames.CONNECTION_TIMEOUT,  15000);//连接时间15s
			httpclient.getParams().setParameter(CoreConnectionPNames.SO_TIMEOUT,  30000);//数据传输时间30s
			HttpResponse res = httpclient.execute(httpost);
			String result = EntityUtils.toString(res.getEntity(), "utf-8");
			response.getWriter().print(result);
		} catch (IOException e) {
			e.printStackTrace();
		} finally{
			response.getWriter().flush();
			response.getWriter().close();
		}
	}

}
