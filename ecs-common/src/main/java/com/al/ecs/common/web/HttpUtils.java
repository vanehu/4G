package com.al.ecs.common.web;

import java.net.InetAddress;
import java.net.UnknownHostException;

import com.al.ecs.log.Log;

/**
 * http工具类
 * @author zhangyu15
 */
public class HttpUtils extends ServletUtils{
    
    private static String hostIpAddress;
    private static String hostName;
    private static String simplifyHostIpAddress;
    
    private final static Log log = Log.getLog(HttpUtils.class);
    
    static {
    	try {
    		InetAddress inetAddress = InetAddress.getLocalHost();
    		hostName = inetAddress.getHostName();
    		hostIpAddress = inetAddress.getHostAddress();
    		String[] simplifyHostIpAddresses = hostIpAddress.split("\\.");
    		
    		if (simplifyHostIpAddresses.length > 3) {
    			simplifyHostIpAddress = simplifyHostIpAddresses[2] + "." + simplifyHostIpAddresses[3];
    		}else{
    			simplifyHostIpAddress = "N/A";
    			log.error("获取服务器IP错误：", hostIpAddress);
    		}
		} catch (UnknownHostException e) {
			hostName = "UnknownHost";
			hostIpAddress = "UnknownHost";
			simplifyHostIpAddress = "UnknownHost";
			log.error("实例化HttpUtils异常：", e);
		}
    }

    /**
     * 获取服务器IP
     * @return hostIpAddress
     */
	public static String getHostIpAddress(){
		return hostIpAddress;
	}
	
	/**
     * 获取主机名
     * @return hostName
     */
	public static String getHostName(){
		return hostName;
	}
	
	/**
	 * 获取服务器IP后两段，例如10.128.97.35返回97.35
	 * @return simplifyHostIpAddress
	 */
	public static String getSimplifyHostIpAddress() {		
		return simplifyHostIpAddress;
	}
}
