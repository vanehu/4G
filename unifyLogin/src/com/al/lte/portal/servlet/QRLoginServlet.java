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

import com.al.lte.portal.common.Config;

public class QRLoginServlet extends HttpServlet {
	
	private static final long serialVersionUID = 1L;

	 @Override  
	 protected void doGet(HttpServletRequest req, HttpServletResponse resp){
		 String queryFlag = req.getParameter("queryFlag");
		 if("1".equals(queryFlag)){
			 querySwitch(req,resp);
		 }else if("2".equals(queryFlag)){
			 jumpLogin(req,resp);
		 }
	 }
	 
	 private void jumpLogin(HttpServletRequest req, HttpServletResponse resp){
		 //System.out.println("**********************统一登录：后端响应开始...");
		 resp.setContentType( "text/html;charset=utf-8" );  //设置响应页面字符编码  
	     PrintWriter out;
	     String province = req.getParameter("province");
	     Map<String, Object> respMap = new HashMap<String, Object>();
	     respMap.put("provVersion", Config.getProvVersion(province,req));
	     respMap.put("provDomain", Config.getIpconfig(req,province));
	     JSONObject jsonObj = JSONObject.fromObject(respMap);
	     try {
	    	 out = resp.getWriter();
	    	 out.print(jsonObj);
		     out.close();
	     } catch (IOException e) {
	    	 e.printStackTrace();
	     }
	 }
	 
	 private void querySwitch(HttpServletRequest req, HttpServletResponse resp){
		 resp.setContentType( "text/html;charset=utf-8" );  //设置响应页面字符编码  
	     PrintWriter out;
		 String flag = req.getParameter("key");
		 String qr_switch = null;
		 qr_switch = Config.getProperties().getProperty(flag);
		 if(null == qr_switch){
			 qr_switch = "OFF";
		 }
		 try {
	    	 out = resp.getWriter();
	    	 out.print(qr_switch);
		     out.close();
	     } catch (IOException e) {
	    	 e.printStackTrace();
	     }
	 }
	 
	 /*private void getRQCode(HttpServletRequest req, HttpServletResponse resp){
		 resp.setContentType( "text/json;charset=utf-8" );  //设置响应页面字符编码  
		 JSONObject jsonObj = null;
		 PrintWriter out;
		 try {
	    	// 二维码唯一标识 UUID+timestamp
	    	StringBuffer sb_uuid =  new StringBuffer();
			sb_uuid.append(UUID.randomUUID().toString().replace("-", ""));
			sb_uuid.append(System.currentTimeMillis());
			String qr_uuid = sb_uuid.toString();
			String RQCode = "data:image/png;base64,"+new QrCodeImageGen().encoderQRCodeToBase64(qr_uuid,"png",6);
			req.getSession().setAttribute("session_qrcode_uuid",qr_uuid);
			Map<String, Object> respMap = new HashMap<String, Object>();
			respMap.put("code", 0);
			respMap.put("data", RQCode);
			jsonObj = JSONObject.fromObject(respMap);
		} catch (Exception e) {
			 Map<String, Object> respMap = new HashMap<String, Object>();
		     respMap.put("code", -1);
		     respMap.put("data", "二维码生成失败");
		     jsonObj = JSONObject.fromObject(respMap);
		}
		 
		 try {
	    	 out = resp.getWriter();
	    	 out.print(jsonObj);
		     out.close();
	     } catch (IOException e) {
	    	 e.printStackTrace();
	     }
	 }*/
	 
	 
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		doGet(req,resp);
	}
}
