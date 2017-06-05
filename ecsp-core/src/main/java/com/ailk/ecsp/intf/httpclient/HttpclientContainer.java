package com.ailk.ecsp.intf.httpclient;

import java.util.Locale;
import java.util.PropertyResourceBundle;
import java.util.ResourceBundle;

import org.apache.http.HttpVersion;
import org.apache.http.client.HttpClient;
import org.apache.http.conn.scheme.PlainSocketFactory;
import org.apache.http.conn.scheme.Scheme;
import org.apache.http.conn.scheme.SchemeRegistry;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.conn.tsccm.ThreadSafeClientConnManager;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;
import org.apache.http.params.HttpProtocolParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
/**
 * =========================================================
 * 亚信联创 电信CRM研发部
 * @author 李茂君
 * @date 2011-4-13 上午11:21:30
 * @Description: TODO(httpClient控制器)
 * @version V1.0
 * =========================================================
 * update date                update author     Description
 * 2011-4-13                    李茂君                           创建文件
 */
public class HttpclientContainer {

	private static HttpclientContainer httpclientContainer;
	
	private static Logger logger = LoggerFactory.getLogger(HttpclientContainer.class);
	
	private HttpClient httpClient;
	// 超时时间
	private int timeout;
	// 最大活动连接数
	private int maxconnect;
	// 每路由的最大并发数
	private int MaxConnsPerRoute;
	
	//private ClientConnectionManager clientconnetions;
	
	
	public static HttpclientContainer getInstance(){
		
		if (null == httpclientContainer) {
			httpclientContainer = new HttpclientContainer();
		}
		return httpclientContainer;
		
	}
	
	private HttpclientContainer(){
		
		iniConfig();
		
		HttpParams params = new BasicHttpParams();
		
		HttpProtocolParams.setVersion(params, HttpVersion.HTTP_1_1);
		SchemeRegistry schemeRegistry = new SchemeRegistry();
	    schemeRegistry.register(new Scheme("http", 80,PlainSocketFactory.getSocketFactory()));
	    ThreadSafeClientConnManager tccm = new ThreadSafeClientConnManager(schemeRegistry);
	    //最大连接数
	    tccm.setMaxTotal(this.maxconnect);
	    //最大并发数
	    tccm.setDefaultMaxPerRoute(MaxConnsPerRoute);
	    
        this.httpClient = new DefaultHttpClient(tccm, params);
        //超时设置
        httpClient.getParams().setParameter(HttpConnectionParams.CONNECTION_TIMEOUT, this.timeout);
        httpClient.getParams().setParameter("http.socket.timeout", this.timeout);
        
        AbortConnectionThread act = new AbortConnectionThread(tccm);
        act.start();
        
	}
	
	/**
	 * 初始化httpClient属性配置
	 * 配置文件读取失败则设置默认值
	 */
	private void iniConfig(){
		
		try {
			
			PropertyResourceBundle prb = (PropertyResourceBundle) ResourceBundle.getBundle("config/httpConfig",Locale.getDefault());
			this.timeout = Integer.valueOf(prb.getString("Timeout"));
			this.maxconnect = Integer.valueOf(prb.getString("maxconnect"));
			this.MaxConnsPerRoute = Integer.valueOf(prb.getString("MaxConnsPerRoute"));
		
		} catch (Exception e) {
			
			logger.error("读取客户端配置文件httpConfig异常,配置使用默认值");
			//logger.error("异常信息：", e);
			//读取异常则默认配置
			this.timeout = 120000;
			this.maxconnect = 200;
			this.MaxConnsPerRoute = 20;
		}
	}

	public HttpClient getHttpClient() {
		return httpClient;
	}
	
	/**
	 * 启动空闲链接释放线程
	 */
	public void startCloseConnThread(){
		
		
	}
	
}
