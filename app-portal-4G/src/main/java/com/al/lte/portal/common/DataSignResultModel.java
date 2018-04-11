package com.al.lte.portal.common;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

import com.al.ecs.common.util.JsonUtil;

import net.sf.json.JSONObject;
/**
 * 无纸化签名报文解析结果
 * @author chenfeng
 *
 */
public class DataSignResultModel {
	/**
	 * 公章key
	 */
	public static final String COMPANY_SALE = "companyseal";
	/**
	 * 订单信息
	 */
	public static final String ORDER_MSG = "ordermsg";
	
	/**
	 * html报文key
	 */
	public static final String HTML = "html";
	
	/**
	 * 证件照片
	 */
	public static final String CAMERA_PICTURE = "picture";
	
	/**
	 * 签名信息
	 */
	public static final String SIGN_DATA = "signdata";
	
	
	/**
	 * 是否解析成功
	 */
	private boolean isParseSuccess;
	
	/**
	 * 解析后的内容
	 */
	private Map<String,Object>itemMap;

	public boolean isParseSuccess() {
		return isParseSuccess;
	}

	public void setParseSuccess(boolean isParseSuccess) {
		this.isParseSuccess = isParseSuccess;
	}

	public Map<String, Object> getItemMap() {
		return itemMap;
	}

	public void setItemMap(Map<String, Object> itemMap) {
		this.itemMap = itemMap;
		for (String key : itemMap.keySet()) {
			if(ORDER_MSG.equals(key)){  //HTML JSON 转map
				JSONObject jsonBean = JSONObject.fromObject(itemMap.get(key));
				Map<String, String> jsonMap = new HashMap<String, String>(); 
		        Iterator<String> iterator = jsonBean.keys(); 
		        String jsonKey = null; 
		        String jsonValue = null; 
		        while (iterator.hasNext()) { 
		        	jsonKey = iterator.next(); 
		            jsonValue = jsonBean.getString(jsonKey); 
		            jsonMap.put(jsonKey, jsonValue); 
		        }
		        itemMap.put(key, jsonMap);
			}
		}
	}
	
	/**
	 * 
	 * 十六进制转换字符串
	 */

	public static byte[] hexStr2Bytes(String hexStr) {

		hexStr = hexStr.toUpperCase();

		String str = "0123456789ABCDEF";

		char[] hexs = hexStr.toCharArray();

		byte[] bytes = new byte[hexStr.length() / 2];

		int n;

		for (int i = 0; i < bytes.length; i++) {

			n = str.indexOf(hexs[2 * i]) * 16;

			n += str.indexOf(hexs[2 * i + 1]);

			bytes[i] = (byte) (n & 0xff);

		}

		return bytes;

	}
	
	
	@Override
	public String toString(){
		StringBuffer stringBuffer = new StringBuffer();
		stringBuffer.append("isParseSuccess:"+isParseSuccess+"\n");
		
		for (Entry<String,Object> enter : itemMap.entrySet()) {
			if(enter.getValue().getClass() != String.class){
				stringBuffer.append("key:"+enter.getKey()+"\nvalue:"+enter.getValue().getClass());
				
			}else{
				stringBuffer.append("key:"+enter.getKey()+"\nvalue:"+enter.getValue());
				
			}
			
		}
		
		return ""+stringBuffer;
	}
	

}
