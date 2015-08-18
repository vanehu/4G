package com.ailk.ecsp.intf.httpclient;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class HttpClient {

	
	private static Logger logger = LoggerFactory.getLogger(HttpClient.class);
	private static HttpClient httpClient;
	
	public static HttpClient getInstance(){
		
		if (httpClient  == null) {
			httpClient = new HttpClient();
		}
		return httpClient;
	}
	
	
	private HttpClient() {
		
	}
	
	public Map<String, Object> callByHttpClient(Map<String, Object> params,Map<String, Object> properties){
		
		Map<String, Object> response = new HashMap<String, Object>();
		
		String url = (String) properties.get("Url");
		//String outParamType = (String) properties.get("outParamType");
		//String outSysParamType = (String) properties.get("outParamType");
		
		String message = (String) params.get("request");
		String resp = sendRequest(url, message);
		if (StringUtils.isBlank(resp)) {
			response.put("resultCode", "1");
		}else {
			response.put("resultCode", "1");
			response.put("result", resp);
		}
		
		return response;
	}
	
	public String sendRequest(String url,String message){
		
		String responseMsg = "";
		HttpPost post = new HttpPost(url); 
		HttpEntity entity = null;
		try {
			
			post.addHeader("Content-Type", "text/xml; charset=UTF-8"); 
			
			entity = new StringEntity(message, "UTF-8");
			post.setEntity(entity);
			HttpResponse response = HttpclientContainer.getInstance().getHttpClient().execute(post);

			entity = response.getEntity();
			
			responseMsg = EntityUtils.toString(entity, "UTF-8");
			logger.debug("返回报文=============>:"+ responseMsg);
			
		} catch (UnsupportedEncodingException e) {
			logger.error("调用接口 HttpEntity 初始化异常：", e);
		} catch (ClientProtocolException e) {
			logger.error("调用接口异常：", e);
		} catch (IOException e) {
			logger.error("调用接口异常：", e);
		}finally{
			post.abort();
			try {
				if (null != entity) {
					EntityUtils.consume(entity);
				}
			} catch (IOException e) {
				logger.error("接口调用完成释放HttpEntity异常：", e);
			}
			
		}
		
		return responseMsg;
	}
	
	
}
