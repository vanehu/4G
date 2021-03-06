package com.al.lte.portal.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONObject;

import com.al.lte.portal.common.Config;

public class LoginServlet extends HttpServlet {
	
	private static final long serialVersionUID = 1L;

	/**
	 * 省份获取版本
	 * @return
	 */
	public String getProvVersion(String province,HttpServletRequest req){
		return Config.getProvVersion(province,req);
	}
	
	/**
	 * 获取分省域名
	 * @param province 省份拼音
	 * @return 分省域名字符串
	 * @author ZhangYu
	 */
	public String getProvDomain(String province){
		return  Config.getDomain(province);
	}
	
	 @Override  
	 protected void doGet(HttpServletRequest req, HttpServletResponse resp){
//		 System.out.println("**********************统一登录：后端响应开始...");
		 resp.setContentType( "text/html;charset=utf-8" );  //设置响应页面字符编码  
	     PrintWriter out;
	     String province = req.getParameter("province");
//	     System.out.println("**********************统一登录：入参[province] :"+province);
	     Map<String, Object> respMap = new HashMap<String, Object>();
	     String provVersion =  getProvVersion(province,req);
	     String provDomain = Config.getDomain(province,req);
	     respMap.put("provVersion", provVersion);
	     respMap.put("provDomain", provDomain);
//	     System.out.println("**********************统一登录：返回端口 :"+getProvVersion(province));
//	     System.out.println("**********************统一登录：返回域名 :"+getProvDomain(province));
	     JSONObject jsonObj = JSONObject.fromObject(respMap);
//	     System.out.println("LoginServlet.province============"+province);
	     try {
	    	 out = resp.getWriter();
	    	 out.print(jsonObj);
		     out.close();
//		     System.out.println("**********************统一登录：后端响应结束...");
	     } catch (IOException e) {
	    	 e.printStackTrace();
	     }
	 } 
}
