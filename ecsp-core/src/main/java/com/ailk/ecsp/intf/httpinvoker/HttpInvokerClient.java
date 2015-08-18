package com.ailk.ecsp.intf.httpinvoker;

import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ailk.ecsp.core.DataRepository;
import com.ailk.ecsp.mybatis.model.ServiceModel;

/**
 * Spring HttpInvoker 调用.
 * @author chenyl
 */
public class HttpInvokerClient {
	private static HttpInvokerClient instance;
	private Map<String,Object> services;
	private static long times = 0;
	private final Logger log = LoggerFactory.getLogger(this.getClass());
	public static HttpInvokerClient getInstance(){
		//5分钟更新
		long millis = Calendar.getInstance().getTimeInMillis();
		if( millis - times > 1000*60*5){
			instance = new HttpInvokerClient();
			times = millis;
		}else if (instance == null) {
			instance = new HttpInvokerClient();
		}
		
		return instance;
	}
	
	private HttpInvokerClient(){
		services = new HashMap<String,Object>();
	}
	
	public <T> T getService(Class<T> clazz,String serviceCode){
		ServiceModel sm = DataRepository.getInstence().getServiceAttr(serviceCode);
		T t = (T)services.get(sm.getIntfCode());
		if(t!=null){
			return t;
		}
		
		//从配置里读取接口服务地址
		String uri = sm.getIntfUrl();
		log.debug("Http Invoker Service Url:={}",uri);
		if(StringUtils.isBlank(uri)){
			log.error("未获取到接口请求地址，请确认是否已经配置！");
			return null;
		}
		//获取远程服务
		t = HttpInvokerFactory.getService(clazz, uri);
		if(t == null){
			log.error("远程接口请求失败，请检查网络连接或确认接口是否存在！");
		}else{
			services.put(sm.getIntfCode(), t);
		}
		return  t;
	}
	
}
