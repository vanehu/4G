package com.al.lte.portal.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONObject;

import com.al.lte.portal.common.AESUtils;
import com.al.lte.portal.common.Const;

public class AesServlet extends HttpServlet {
	
	private static final long serialVersionUID = 1L;
	
	protected void doGet(HttpServletRequest request,HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}
	
	 protected void doPost(HttpServletRequest req, HttpServletResponse resp){
		 resp.setContentType( "text/html;charset=utf-8" );  //设置响应页面字符编码  
	     PrintWriter out;
	     String param = req.getParameter("param");
	     Map<String, Object> respMap = new HashMap<String, Object>();
	     param =  AESUtils.encryptToString(param,Const.TOKEN_PROVINCE_KEY);
	     String encryptStr = AESUtils.decryptToString(param, Const.TOKEN_PROVINCE_KEY);
	     respMap.put("param", param);
	     JSONObject jsonObj = JSONObject.fromObject(respMap);
	     try {
	    	 out = resp.getWriter();
	    	 out.print(jsonObj);
		     out.close();
	     } catch (IOException e) {
	    	 e.printStackTrace();
	     }
	 } 
}
