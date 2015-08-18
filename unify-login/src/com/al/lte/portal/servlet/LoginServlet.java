package com.al.lte.portal.servlet;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.al.lte.portal.common.Config;

public class LoginServlet extends HttpServlet {
	
	private static final long serialVersionUID = 1L;

	/**
	 * 省份获取版本
	 * @return
	 */
	public String getProvVersion(String province){
		return Config.getProvVersion(province);
	}
	
	 @Override  
	 protected void doGet(HttpServletRequest req, HttpServletResponse resp){   
		 resp.setContentType( "text/html;charset=utf-8" );  //设置响应页面字符编码  
	     PrintWriter out;
	     String province = req.getParameter("province");
	     System.out.println("LoginServlet.province============"+province);
	     try {
	    	 out = resp.getWriter();
    		 out.print(getProvVersion(province));
		     out.close();
	     } catch (IOException e) {
	    	 e.printStackTrace();
	     }
	 } 
}
