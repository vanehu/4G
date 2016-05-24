package com.al.lte.portal.common;

import java.net.InetAddress;
import java.util.Map;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.codec.binary.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.al.ecs.exception.BusinessException;

public class CommonUtils {
	
	private static Logger log = LoggerFactory.getLogger(CommonUtils.class.getName());
	
	public static String getSerAddrPart(){
		String sIP = "" ;
		try{
            InetAddress address = InetAddress.getLocalHost();  
            sIP = ""+ address.getHostAddress();//10.128.21.56
            String[] sIPS = sIP.split("\\.");
            if(sIPS.length>3){
            	sIP = sIPS[2]+"."+sIPS[3];
            }
    	}catch(Exception e){
    		log.error("获取服务当前IP失败");
    		//e.printStackTrace();
    	}
		return sIP ;
	}
	public static String getAllAddrPart(){
		String sIP = "" ;
		try{
            InetAddress address = InetAddress.getLocalHost();  
            sIP = ""+ address.getHostAddress();//10.128.21.56
    	}catch(Exception e){
    		log.error("获取服务当前IP失败");
    		//e.printStackTrace();
    	}
		return sIP ;
	}

	/**
	 * pdf文件下载
	 * 
	 * @param map
	 * @param response
	 * @throws Exception
	 */
	public static void downLoadPdf(Map<String,Object> map,String fileName,HttpServletResponse response)
			throws Exception {
		try {
			if(map.get("orderInfo")!=null){
				GenerateFile(map.get("orderInfo").toString(),fileName,response);
			}else{
				throw new Exception("对不起，返回电子订单信息字符串为空！");
			}
        } catch (BusinessException exp) {
        	exp.printStackTrace();
            response.setContentType("text/html; charset=GB18030");
            response.setHeader("Content-Language", "GB18030");
            response.setHeader("encoding", "GB18030");
            response.getWriter().write(exp.getMessage());
        }
	}
	private static void GenerateFile(String str, String fileName, HttpServletResponse response)
			throws Exception {
		byte[] bytes = Base64.decodeBase64(new String(str).getBytes());
		if (bytes != null && bytes.length > 0) {
			response.reset();
			response.setContentType("application/pdf;charset=GB18030");
			response.setHeader("content-disposition", "attachment; filename="+fileName+".pdf");
			response.setContentLength(bytes.length);
			ServletOutputStream ouputStream = response.getOutputStream();
			ouputStream.write(bytes, 0, bytes.length);
			ouputStream.flush();
			ouputStream.close();
		} else {
			throw new Exception("对不起，解析电子订单数据异常！");
		}
	}
}
