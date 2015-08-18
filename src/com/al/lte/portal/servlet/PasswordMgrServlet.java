package com.al.lte.portal.servlet;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.al.lte.portal.common.Config;

public class PasswordMgrServlet extends HttpServlet {
	
	private static final long serialVersionUID = 1L;

	@Override  
	 protected void doGet(HttpServletRequest req, HttpServletResponse resp){   
		 resp.setContentType( "text/html;charset=utf-8" );  //设置响应页面字符编码  
	     PrintWriter out;
	     try {
	    	 out = resp.getWriter();
    		 out.print(Config.getForgetPasswordVersion(req));
		     out.close();
	     } catch (IOException e) {
	    	 e.printStackTrace();
	     }
	 } 
}
