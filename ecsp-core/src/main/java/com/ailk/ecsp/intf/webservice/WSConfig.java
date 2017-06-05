package com.ailk.ecsp.intf.webservice;

import java.util.HashMap;
import java.util.Map;
import org.apache.commons.lang.StringUtils;
/**
 * 
 * @author chenyl
 */
public class WSConfig {
	private Map<String,Object> inParams = new HashMap<String, Object>();
	private Map<String,Object> properties = new HashMap<String, Object>();
	private Map<String,String> reqParam = new HashMap<String, String>();
	private String sessionToken;
	private String userName;
	private String passWord;
	private String sessionType;

	public Map<String, Object> getInParams() {
		return this.inParams;
	}
	
	/**
	 * 设置入参.
	 * @param inParams in
	 */
	public void setInParams(Map<String, Object> inParams) {
		if(inParams!=null && inParams.size() != 0){
			this.inParams.putAll(inParams);
		}
	}
	
	public Map<String, Object> getProperties() {
		return properties;
	}
	
	/**
	 * 设置属性.
	 * @param properties prop
	 */
	public void setProperties(Map<String, Object> properties) {
		if(properties!=null && properties.size()>=1){
			this.properties.putAll(properties);
		}
	}
	
	/**
	 * 添加入参.
	 * @param key key
	 * @param value val
	 */
	public void addInParam(String key,Object value){
		inParams.put(key, value);
	}
	
	/**
	 * 添加属性.
	 * 有其它属性，请在里面添加，最好不要另外修改代码添加变量
	 * @param key key
	 * @param value val
	 */
	public void addPropertie(String key,Object value){
		properties.put(key, value);
	}
	
	
	public String getPropertieText(String name){
		Object obj = properties.get(name);
		if(obj==null){
			return null;
		}
		return obj.toString();
	}
	
	public String getUrl(){
		return getPropertieText("Url");
	}
	
	public String getMethodName(){
		return getPropertieText("MethodName");
	}
	
	public String getOutParamType(){
		return getPropertieText("OutParamType");
	}
	
	public void setMethodName(String methodName){
		addPropertie("MethodName",methodName);
	}
	
	/**
	 * 设置Webservice接口地址.
	 * @param url ws地址
	 */
	public void setUrl(String url){
		addPropertie("Url",url);
	}
	
	/**
	 * 输出参数类型转换.
	 * @param outParamType 0:原始报文; 1:XML转换为Map返回;2:XML转换为Map特殊格式3.XML转换参数配置模板;4.dom转换为参数配置模板;
	 * 目前只支持0，1，2
	 * @author chenylg
	 */
	public void setOutParamType(String outParamType){
		addPropertie("OutParamType",outParamType);
	}
	
	public void setIsSiebel(Boolean isSiebel){
		addPropertie("IsSiebel",isSiebel);
	}
	
	public Boolean isSiebel(){
		Object obj = properties.get("IsSiebel");
		if(obj==null){
			return false;
		}
		return (Boolean)obj;
	}

	public String getSessionToken() {
		return sessionToken;
	}

	public void setSessionToken(String sessionToken) {
		this.sessionToken = sessionToken;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getPassWord() {
		return passWord;
	}

	public void setPassWord(String passWord) {
		this.passWord = passWord;
	}

	public String getSessionType() {
		if(StringUtils.isNotBlank(sessionToken)){
			sessionType = "None";
		}
		return sessionType;
	}

	public void setSessionType(String sessionType) {
		this.sessionType = sessionType;
	}
	
	/**
	 * 向请求URI后面添加参数.
	 * @param name name
	 * @param value val
	 */
	public void addReqParam(String name,String value){
		this.reqParam.put(name, value);
	}
	
	/**
	 * 获取URI后面跟着的参数.
	 * @return map
	 */
	public Map<String,String> getReqParams(){
		return reqParam;
	}
	
	/**
	 * 获取URI后面跟着的参数.
	 * @param name name
	 * @return str
	 */
	public String getReqParam(String name){
		return reqParam.get(name);
	}
	
}
