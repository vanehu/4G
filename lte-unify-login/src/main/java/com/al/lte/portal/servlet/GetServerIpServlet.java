package com.al.lte.portal.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.InetAddress;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONObject;

/**
 * 获取服务端IP
 */
public class GetServerIpServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public GetServerIpServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setContentType("application/json;charset=UTF-8");
		Map<String, Object> respMap = new HashMap<String, Object>();
		PrintWriter out;
		String sIP = "" ;
		try{
            InetAddress address = InetAddress.getLocalHost();  
            sIP = ""+ address.getHostAddress();
            String[] sIPS = sIP.split("\\.");
            if(sIPS.length > 3){
            	sIP = sIPS[2]+"."+sIPS[3];
            }
    	}catch(Exception e){
    		e.printStackTrace();
    	}
		respMap.put("ip", sIP);
		JSONObject jsonObj = JSONObject.fromObject(respMap);
		out = response.getWriter();
    	out.print(jsonObj);
	    out.close();
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}
}
