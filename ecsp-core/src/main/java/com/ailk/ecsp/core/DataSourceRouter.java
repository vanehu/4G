package com.ailk.ecsp.core;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;

import com.ailk.ecsp.util.SpringContextUtil;
import com.al.ecs.common.util.PropertiesUtils;


public class DataSourceRouter {
	public static RouterStrategy currentRouterStrategy = new RouterStrategy();
	public final static ThreadLocal<RouterStrategy> currentRouterStrategyThread = new ThreadLocal<RouterStrategy>();
	
	/** 管理库数据源 */
	public static final String MANAGE_DATASOURCE_KEY = "manage";
	/** 默认数据源 */
	public static final String DEFAULT_DATASOURCE_KEY = MANAGE_DATASOURCE_KEY;
	
	private static final String DATASOURCE_CONFIG_FILE = "sysConfig/datasource-config.properties"; 
	
	private static final String baseDir = DataSourceRouter.class.getClassLoader().getResource("").getPath();
	
	private static PropertiesUtils propertiesUtils;
	
	private static Properties properties;
	
	static{
		try {
			clearCache();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	public static void setRouteFactor(String key){
		/*
		 * 1、读取数据库中的对应key的数据源名称，d1；
		 * 2、如果得到的数据源名称为空，则取代码中的默认数据源名称，即管理库数据源；
		 */
		String dataSourceKey = null;
		if(StringUtils.isNotBlank(key)){
			dataSourceKey = DataRepository.getInstence().getSysParamValue(DEFAULT_DATASOURCE_KEY,key, "7"); //从管理库配置数据中获取key对应的数据源名称
		}
		
		if (StringUtils.isBlank(dataSourceKey)){
			dataSourceKey = DEFAULT_DATASOURCE_KEY;
		}
		String routerStrategyKey = getRouterStrategyKeyFromProperties(dataSourceKey);
		if (routerStrategyKey == null) {
			throw new IllegalStateException("No Mapped DataSources Exist! key: " + key);
		}
		currentRouterStrategyThread.set(new RouterStrategy(routerStrategyKey));
	}
	
	//从配置文件中读取当前省份的数据源关键字 
	private static String getRouterStrategyKeyFromProperties(String dataSourceKey){
//		if(propertiesUtils == null){
//			propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
//		}
//		return propertiesUtils.getMessage(RouterStrategy.toRouterStrategyKey(dataSourceKey, RouterStrategy.CURRENT_CONST));
		return properties.getProperty(RouterStrategy.toRouterStrategyKey(dataSourceKey, RouterStrategy.CURRENT_CONST));
	}
	
	public static RouterStrategy getCurrentRouterStrategy(){
		return currentRouterStrategyThread.get();
	}
	
	public static Map<String, String> getRouterStrategyKeyMap() throws IOException{
		Map<String, String> map = new HashMap<String, String>();
		Properties prop = new Properties();
		InputStream in = null;
		try {
//			in = DataSourceRouter.class.getClassLoader().getResourceAsStream(DATASOURCE_CONFIG_FILE);
//			if(in == null){
//				throw new IOException(DATASOURCE_CONFIG_FILE + " does not exist!");
//			}
			in = new FileInputStream(baseDir + DATASOURCE_CONFIG_FILE);
			prop.load(in);
			Enumeration<?> e = prop.propertyNames();
			while(e.hasMoreElements()){
				String key = (String) e.nextElement();
				if(key.endsWith(RouterStrategy.SEP + RouterStrategy.CURRENT_CONST)){
					map.put(key, prop.getProperty(key));
				}
			}
		} finally {
			try {
				if(in != null){
					in.close();
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		return map;
	}
	
	public static void updateRouterStrategyKey(Map<String, String> keyMap) throws IOException{
		Properties prop = new Properties();
		Set<String> keys = keyMap.keySet();
		InputStream in = null;
		OutputStream out = null;
		try {
//			in = DataSourceRouter.class.getClassLoader().getResourceAsStream(DATASOURCE_CONFIG_FILE);
			in = new FileInputStream(baseDir + DATASOURCE_CONFIG_FILE);
			prop.load(in);
			//未包含则报异常
			for(String key : keys){
				if(!prop.containsKey(key) || !prop.containsKey(keyMap.get(key))){
					throw new IllegalArgumentException("Illegal keyMap, cann't math " + key + " in given keys, please check input params or datasource-config file.");
				}
			}
		} finally {
			try {
				if(in != null){
					in.close();
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		
		//在读取的基础上更新
		try {
			out = new FileOutputStream(baseDir + DATASOURCE_CONFIG_FILE);
			for(String key : keys){
				prop.setProperty(key, keyMap.get(key));
			}
			prop.store(out, null);
		} finally {
			try {
				if(out != null){
					out.close();
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		clearCache();
	}
	
	public static void clearCache() throws IOException{
		//TODO 无法reload，待排查；暂时使用手动加载；
//		propertiesUtils.clear();
		properties = new Properties();
		InputStream in = null;
		try {
//			in = DataSourceRouter.class.getClassLoader().getResourceAsStream(DATASOURCE_CONFIG_FILE);
			in = new FileInputStream(baseDir + DATASOURCE_CONFIG_FILE);
			properties.load(in);
		} finally {
			try {
				if(in != null){
					in.close();
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	} 
	
}
