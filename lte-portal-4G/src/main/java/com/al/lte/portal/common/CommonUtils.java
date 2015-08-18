package com.al.lte.portal.common;

import java.net.InetAddress;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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

}
