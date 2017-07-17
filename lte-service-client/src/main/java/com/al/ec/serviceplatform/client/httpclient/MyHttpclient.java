package com.al.ec.serviceplatform.client.httpclient;

import java.util.ResourceBundle;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.HttpVersion;
import org.apache.http.client.HttpClient;
import org.apache.http.conn.ClientConnectionManager;
import org.apache.http.conn.scheme.PlainSocketFactory;
import org.apache.http.conn.scheme.Scheme;
import org.apache.http.conn.scheme.SchemeRegistry;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.conn.tsccm.ThreadSafeClientConnManager;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;
import org.apache.http.params.HttpProtocolParams;

public class MyHttpclient {

	private static Log log = LogFactory.getLog(MyHttpclient.class);
	private static MyHttpclient myhttpclient;
	private HttpClient httpclient;
	private int timeout;
	private int maxTotal;
	private int maxPerRoute;
	private String url;
	private String debug=null;
	private ClientConnectionManager clientconnetions;

	public static MyHttpclient getInstance(){
		
		if (null == myhttpclient) {
			myhttpclient = new MyHttpclient();
		}
		
		return myhttpclient;
	}
	
	private MyHttpclient() {
		
		iniConfig();
		iniHttpClient();
		
	}

	private void iniConfig(){
		ResourceBundle prb  =null;
		try {
//			 prb = ResourceBundle.getBundle("com/al/ec/serviceplatform/client/config_portalClient");
			 prb = ResourceBundle.getBundle("portal/config_portalClient");
		} catch (Exception e) {
			//"读取客户端配置文件异常";
			log.error("读取客户端配置文件异常 portal/config_portalClient.properties:", e);
		}
		this.url = prb.getString("Url");
		String timeoutStr= prb.getString("Timeout");
		if(this.url==null)
			this.url = "http://localhost:7001/servicePlatform/or.sr";
		if(timeoutStr==null)
			this.timeout = 60000;
		else 
			this.timeout = Integer.valueOf(prb.getString("Timeout"));
		
		String maxTotalStr=prb.getString("MaxTotal");
		if(maxTotalStr !=null) {
			maxTotal=Integer.parseInt(maxTotalStr);
		} else {
			maxTotal=200;
		}
		
		String maxPerRouteStr=prb.getString("MaxPerRoute");
		if(maxPerRouteStr !=null) {
			maxPerRoute=Integer.parseInt(maxPerRouteStr);
		} else {
			maxPerRoute=30;
		}
		this.debug=prb.getString("debug");
		if(this.debug==null)
			this.debug = "F";
		
	}
	
	
	public String getDebug() {
		return debug;
	}

	public void setDebug(String debug) {
		this.debug = debug;
	}

	public void reloadConfig(){
		
		iniConfig();
		iniHttpClient();
	}
	
	/*
	 * 初始化
	 */
	public void iniHttpClient() {
		
		HttpParams params = new BasicHttpParams();
	    HttpProtocolParams.setVersion(params, HttpVersion.HTTP_1_1);
		SchemeRegistry schemeRegistry = new SchemeRegistry();
        schemeRegistry.register(new Scheme("http", 80, PlainSocketFactory.getSocketFactory()));
        ThreadSafeClientConnManager cm = new ThreadSafeClientConnManager(schemeRegistry);
        cm.setMaxTotal(this.maxTotal);
        cm.setDefaultMaxPerRoute(this.maxPerRoute);

        this.httpclient = new DefaultHttpClient(cm, params);
        httpclient.getParams().setParameter(HttpConnectionParams.CONNECTION_TIMEOUT, this.timeout); //连接超时
        httpclient.getParams().setParameter("http.socket.timeout", timeout);
		
        AbortConnectionThread act = new AbortConnectionThread(cm);
        act.start();
	}
	
	
	public HttpClient getHttpclient() {
		return httpclient;
	}

	public ClientConnectionManager getClientconnetions() {
		return clientconnetions;
	}
		
	
	public int getTimeout() {
		return timeout;
	}

	public String getUrl() {
		return url;
	}
	
	
	
	

}
