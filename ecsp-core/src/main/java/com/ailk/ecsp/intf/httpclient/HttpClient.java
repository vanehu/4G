package com.ailk.ecsp.intf.httpclient;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringEscapeUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ailk.ecsp.intf.webservice.WSConfig;
import com.ailk.ecsp.util.IConstant;
import com.ailk.ecsp.util.SoapUtil;
import com.al.ec.serviceplatform.client.ResultCode;

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
	
	/**
	 * callByHttpClient方法重载
	 * @param message 请求报文
	 * @param url 请求地址
	 * @param config 配置
	 * @return 返回xml转换成的map
	 */
	public Map<String, Object> callByHttpClient(String message, String url, WSConfig config) {
		Map<String, Object> response = new HashMap<String, Object>();
		String resp = sendRequest(url, message);
		if (StringUtils.isBlank(resp)) {
			response.put("resultCode", ResultCode.R_FAILURE);
		}else {
			// 解析xml成map
			response = parseResponseContent(resp, config);
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
	
	public Map<String, Object> parseResponseContent(String content, WSConfig config){
		Map<String, Object> returnMap = new HashMap<String, Object>();
		Map<String, Object> responseMap = null;
		try {
			content = StringEscapeUtils.unescapeXml(content);
			if (StringUtils.isNotBlank(content)) {
				// 清除xml头
				content = content.replaceAll("(<\\?xml.+?>)", "");
				content = content.replaceAll("\t","");//制表符
				content = content.replaceAll("\r","");//回车符
				content = content.replaceAll("\n","");//换行符
			}
			logger.debug(":return:"+content);
			if(IConstant.CON_OUT_PARAM_TYPE_TO_XML.equals(config.getOutParamType())){
				returnMap.put("result", content);
			}else{
				responseMap = SoapUtil.xmlToMap(content, config.getOutParamType());
				returnMap.put("result", responseMap);
				returnMap.put("resultParam", content);
				//returnMap.put("resIntfMsg", content);
				if(MapUtils.isEmpty(responseMap)){
					returnMap.put("resultCode", "WS-2002");
					returnMap.put("resultMsg", "回参转换失败,回参："+content);
					return returnMap;
				}
			}
			if (config.isSiebel()) {
				String sessionToken = SoapUtil.parseSessionToken(content);
				if (StringUtils.isNotBlank(sessionToken)){
					returnMap.put("SessionToken",SoapUtil.parseSessionToken(content));
				}
			}
		} catch (Exception e) {
			responseMap = null;
			logger.error("","回参转换失败,回参："+content);
			logger.error("",e);
		}
		returnMap.put("resultCode", "POR-0000");
		returnMap.put("resultMsg", "OK!");
		return returnMap;
	}
}
