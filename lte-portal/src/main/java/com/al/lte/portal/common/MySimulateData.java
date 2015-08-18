package com.al.lte.portal.common;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;

import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.SpringContextUtil;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.log.Log;
import com.al.lte.portal.core.DataEngine;
import com.al.lte.portal.core.DataRepository;

public class MySimulateData {

	private static Log log = Log.getLog(MySimulateData.class);

	private static Object pLock = new Object();
	private static MySimulateData mySimulateData;
	private static Properties properties;
	private static String resource = "/properties/simulate.properties";
	private static String portalResource = "/portal/portal.properties";
	private static String appDesc = "";
	
//	private static String absResource = "file:///D:/work/simulate.properties";

	public static MySimulateData getInstance() {
		synchronized (pLock) {
			if (mySimulateData == null) {
				mySimulateData = new MySimulateData();
			}
		}
		return mySimulateData;
	}

	private MySimulateData() {
		initConfig();
	}

	private void initConfig() {
		try {
			properties = getProperties(resource);
//			properties.load(getStream(portalResource));
//			properties = getPropertiesByAbs(absResource);
			// rb = ResourceBundle.getBundle("D:/work/simulate");
		} catch (Exception e) {
			// "读取接口模拟数据文件异常";
			e.printStackTrace();
		}
	}

	public String getJson(String serviceCode) {
		String returnStr = "";
		try {
			//相对地址变换获得路径
//			properties = getProperties(resource);
			//URI定义路径
//			properties = getPropertiesByAbs(absResource);
			//key指json回参编号
			String key = properties.getProperty(serviceCode + ".num");
			returnStr = properties.getProperty(serviceCode + "." + key);
			returnStr = new String(returnStr.getBytes("ISO-8859-1"), "UTF-8");
		} catch (Exception e) {
			// 取值异常
			// NullPointerException - if key is null
			// MissingResourceException - if no object for the given key can be
			// found
			// ClassCastException - if the object found for the given key is not
			// a string
			returnStr = "";
		}
		return returnStr;
	}

	public String getInvokeWay(String serviceCode) {
		String returnStr = "";
		try {
			//相对地址变换获得路径
//			properties = getProperties(resource);
			//URI定义路径
//			properties = getPropertiesByAbs(absResource);
			//invokeWay指调用方式，HTTP、WS、SIMULATE
			returnStr = properties.getProperty(serviceCode + ".invokeWay");
			returnStr = new String(returnStr.getBytes("ISO-8859-1"), "UTF-8");
		} catch (Exception e) {
			// 取值异常
			// NullPointerException - if key is null
			// MissingResourceException - if no object for the given key can be
			// found
			// ClassCastException - if the object found for the given key is not
			// a string
			returnStr = "";
		}
		return returnStr;
	}
	
	public String getNeeded(String serviceCode, String need) throws Exception {
		return getParam(serviceCode + "." + need);
	}
	
	@Deprecated
	public String getAppDesc() {
		if (StringUtils.isNotEmpty(appDesc)) {
			return appDesc;
		}
		try {
			appDesc = getParam(SysConstant.APPDESC);
		} catch (Exception e) {
			log.error(e);
			appDesc = "";
		}
		log.debug("APPDESC={}", appDesc);
		return appDesc;
	}
	/**
	 * 获取配置文件中指定的参数值，没有则从缓存中获取
	 * @param key
	 * @return
	 * @throws UnsupportedEncodingException 
	 * @throws InterfaceException 
	 */
	public String getParam(String key) throws UnsupportedEncodingException, InterfaceException{
		String returnStr = "";
//		try {
			//相对地址变换获得路径
//			properties = getProperties(resource);
			//URI定义路径
//			properties = getPropertiesByAbs(absResource);
			//invokeWay指调用方式，HTTP、WS、SIMULATE
		//如果配置
		PropertiesUtils propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
		if (SysConstant.ON.equals(propertiesUtils.getMessage(SysConstant.FILE_PREFER_FLAG))) {
			returnStr = propertiesUtils.getMessage(key);
			if (StringUtils.isNotBlank(returnStr)) {
				returnStr = new String(returnStr.getBytes("ISO-8859-1"), "UTF-8");
				return returnStr;
			}
		}
			//add by xuj 
			//直接获取启动时加载的全局变量，如获取不到，则加载配置文件
		Map<String, Object> allCommonParam = DataRepository.getInstence().getAllCommonParam();
		String contextPath = MapUtils.getString(allCommonParam, "contextPath");
		String bootFlag = MapUtils.getString(allCommonParam, "bootFlag");
		if ("FALSE".equals(bootFlag)){
			DataEngine.setAllCommonParam(contextPath, null);
		}
		//缓存为空或bootFlag为false
		allCommonParam = DataRepository.getInstence().getAllCommonParam();
		if (MapUtils.isEmpty(allCommonParam) || "FALSE".equals(MapUtils.getString(allCommonParam, "bootFlag"))) {
			throw new InterfaceException(InterfaceException.ErrType.ECSP, "MySimulateData/getInstance/getNeeded", "无法从服务层获取缓存", "");
		}
		//从缓存中读取参数，如果被注释，就从simulate配置文件中读取
		returnStr = MapUtils.getString(allCommonParam, key);
		if (StringUtils.isBlank(returnStr)){
			returnStr = propertiesUtils.getMessage(key);
			if (StringUtils.isEmpty(returnStr)) {
				returnStr = properties.getProperty(key);				
			}
//				throw new InterfaceException(InterfaceException.ErrType.ECSP, "MySimulateData/getInstance/getNeeded", "无法从缓存中获取接口地址");
		}
		if(returnStr==null){
			return null ;
		}
		returnStr = new String(returnStr.getBytes("ISO-8859-1"), "UTF-8");
//		} catch (Exception e) {
			// 取值异常
			// NullPointerException - if key is null
			// MissingResourceException - if no object for the given key can be
			// found
			// ClassCastException - if the object found for the given key is not
			// a string
//			returnStr = "";
//		}
		return returnStr;
	}
	public static Properties getProperties(String resource) {
		Properties properties = new Properties();
		try {
			properties.load(getStream(resource));
		} catch (IOException e) {
			throw new RuntimeException("couldn't load properties file '"
					+ resource + "'", e);
		}
		return properties;
	}
	
	public static Properties getPropertiesByAbs(String resource) {
		Properties properties = new Properties();
		try {
	    	properties.load(getStream(new URL(resource)));
		} catch (IOException e) {
			throw new RuntimeException("couldn't load properties file '"
					+ resource + "'", e);
		}
		return properties;
	}

	public static ClassLoader getClassLoader() {

		return MySimulateData.class.getClassLoader();
	}

	public static InputStream getStream(String relativePath)
			throws MalformedURLException, IOException {
		if (!relativePath.contains("../")) {
			return getClassLoader().getResourceAsStream(relativePath);
		} else {
			return getStreamByExtendResource(relativePath);
		}
	}

	public static InputStream getStream(URL url) throws IOException {
		if (url != null) {
			return url.openStream();
		} else {
			return null;
		}
	}

	public static InputStream getStreamByExtendResource(String relativePath)
			throws MalformedURLException, IOException {
		return getStream(getExtendResource(relativePath));
	}

	public static URL getExtendResource(String relativePath)
			throws MalformedURLException {

		log.info("relative path:" + relativePath);
		if (!relativePath.contains("../")) {
			return getResource(relativePath);

		}
		String classPathAbsolutePath = getAbsolutePathOfClassLoaderClassPath();
		if (relativePath.substring(0, 1).equals("/")) {
			relativePath = relativePath.substring(1);
		}
		log.info("" + relativePath.lastIndexOf("../"));

		String wildcardString = relativePath.substring(0,
				relativePath.lastIndexOf("../") + 3);
		relativePath = relativePath
				.substring(relativePath.lastIndexOf("../") + 3);
		int containSum = containSum(wildcardString, "../");
		classPathAbsolutePath = cutLastString(classPathAbsolutePath, "/",
				containSum);
		String resourceAbsolutePath = classPathAbsolutePath + relativePath;
		log.info("abs path：" + resourceAbsolutePath);
		URL resourceAbsoluteURL = new URL(resourceAbsolutePath);
		return resourceAbsoluteURL;
	}

	public static String getAbsolutePathOfClassLoaderClassPath() {

		log.info(getClassLoader().getResource("").toString());
		return getClassLoader().getResource("").toString();

	}

	public static URL getResource(String resource) {
		log.info("relative paht to classpath：" + resource);
		return getClassLoader().getResource(resource);
	}

	private static int containSum(String source, String dest) {
		int containSum = 0;
		int destLength = dest.length();
		while (source.contains(dest)) {
			containSum = containSum + 1;
			source = source.substring(destLength);
		}
		return containSum;
	}

	private static String cutLastString(String source, String dest, int num) {
		// String cutSource=null;
		for (int i = 0; i < num; i++) {
			source = source.substring(0,
					source.lastIndexOf(dest, source.length() - 2) + 1);

		}
		return source;
	}
	
	public static void main(String[] args) {
		String str = MySimulateData.getInstance().getJson("loginCheck");
		System.out.println(str);
	}
}
