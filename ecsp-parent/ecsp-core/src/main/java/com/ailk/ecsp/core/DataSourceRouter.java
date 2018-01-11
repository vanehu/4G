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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ailk.ecsp.util.SpringContextUtil;
import com.al.ecs.common.util.PropertiesUtils;


public class DataSourceRouter {
	private static Logger log = LoggerFactory.getLogger(DataSourceRouter.class);
	public static RouterStrategy currentRouterStrategy = new RouterStrategy();
	public final static ThreadLocal<RouterStrategy> currentRouterStrategyThread = new ThreadLocal<RouterStrategy>();
	
	/** 管理库数据源 */
	public static final String MANAGE_DATASOURCE_KEY = "manage";
	/** 默认数据源 */
	public static final String DEFAULT_DATASOURCE_KEY = MANAGE_DATASOURCE_KEY;
	
	private static final String DATASOURCE_CONFIG_FILE = "portal/datasource-config.properties"; 
	
	private static final String baseDir = DataSourceRouter.class.getClassLoader().getResource("").getPath();
	
	private static PropertiesUtils propertiesUtils;
	
	private static Properties properties;
	
	//areaId 与 数据源名称 映射表
	private static Map<String, String> dataSourceKeyMap;
	
	static{
//		try {
			initDataSourceKeyMap();
			//clearCache();
//		} catch (IOException e) {
//			e.printStackTrace();
//		}
	}
	
	public static void setRouteFactor(String key){
		/*
		 * 1、读取数据库中的对应key的数据源名称，d1；
		 * 2、如果得到的数据源名称为空，则取代码中的默认数据源名称，即管理库数据源；
		 */
		String dataSourceKey = null;
		if(StringUtils.isNotBlank(key)){
//			dataSourceKey = DataRepository.getInstence().getSysParamValue(DEFAULT_DATASOURCE_KEY,key, "7"); //从管理库配置数据中获取key对应的数据源名称
			dataSourceKey = dataSourceKeyMap.get(key); //临时方案，从本地获取，不再从数据库读取；且数据库为全量更新无法与不同版本的程序（因生产环境发布为1/3递进发布）保持一致
		}
		
		if (StringUtils.isBlank(dataSourceKey)){
			dataSourceKey = DEFAULT_DATASOURCE_KEY;
		}
//		String routerStrategyKey = getRouterStrategyKeyFromProperties(dataSourceKey);
//		if (routerStrategyKey == null) {
//			throw new IllegalStateException("No Mapped DataSources Exist! key: " + key);
//		}
//		currentRouterStrategyThread.set(new RouterStrategy(routerStrategyKey));
		currentRouterStrategyThread.set(new RouterStrategy(dataSourceKey));
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
		log.info("----------------------getRouterStrategyKeyMap start");
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
		log.info("----------------------getRouterStrategyKeyMap end, result: {}", map);
		return map;
	}
	
	public static void updateRouterStrategyKey(Map<String, String> keyMap) throws IOException{
		log.info("----------------------updateRouterStrategyKey start, keyMap: {}", keyMap);
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
		log.info("----------------------updateRouterStrategyKey end");
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
	
	
	//初始化dataSourceKeyMap （与 datasource-config.properties 保持一致）
	private static void initDataSourceKeyMap(){
		dataSourceKeyMap = new HashMap<String, String>();
		dataSourceKeyMap.put("default", MANAGE_DATASOURCE_KEY);
		dataSourceKeyMap.put("8440000", "guangdong");
		dataSourceKeyMap.put("8320000", "jiangsu");
		dataSourceKeyMap.put("8510000", "sichuan");
		dataSourceKeyMap.put("8330000", "zhejiang");
		dataSourceKeyMap.put("8340000", "anhui");
		dataSourceKeyMap.put("8610000", "shanxi");
		dataSourceKeyMap.put("8350000", "fujian");
		dataSourceKeyMap.put("8310000", "shanghai");
		dataSourceKeyMap.put("8130000", "hebei");
		dataSourceKeyMap.put("8150000", "neimenggu");
		dataSourceKeyMap.put("8430000", "hunan");
		dataSourceKeyMap.put("8210000", "liaoning");
		dataSourceKeyMap.put("8420000", "hubei");
		dataSourceKeyMap.put("8520000", "guizhou");
		dataSourceKeyMap.put("8370000", "shandong");
		dataSourceKeyMap.put("8500000", "chongqing");
		dataSourceKeyMap.put("8650000", "xinjiang");
		dataSourceKeyMap.put("8110000", "beijing");
		dataSourceKeyMap.put("8120000", "tianjin");
		dataSourceKeyMap.put("8360000", "jiangxi");
		dataSourceKeyMap.put("8630000", "qinghai");
		dataSourceKeyMap.put("8620000", "gansu");
		dataSourceKeyMap.put("8220000", "jilin");
		dataSourceKeyMap.put("8410000", "henan");
		dataSourceKeyMap.put("8230000", "heilongjiang");
		dataSourceKeyMap.put("8530000", "yunnan");
		dataSourceKeyMap.put("8450000", "guangxi");
		dataSourceKeyMap.put("8140000", "shxi");
		dataSourceKeyMap.put("8460000", "hainan");
		dataSourceKeyMap.put("8640000", "ningxia");
		dataSourceKeyMap.put("8540000", "xizang");
		dataSourceKeyMap.put("9110000", "gangaotai");
	}
	
	public static Map<String, String> dataKeyMap(){
		Map<String, String> dataSourceKeyMap = new HashMap<String, String>();
		dataSourceKeyMap.put("811", "beijing");
		dataSourceKeyMap.put("812", "tianjing");
		dataSourceKeyMap.put("814", "shxi");
		dataSourceKeyMap.put("815", "neimenggu");
		dataSourceKeyMap.put("821", "liaoning");
		dataSourceKeyMap.put("822", "jilin");
		dataSourceKeyMap.put("835", "fujian");
		dataSourceKeyMap.put("843", "hunan");
		dataSourceKeyMap.put("850", "chongqing");
		dataSourceKeyMap.put("852", "guizhou");
		dataSourceKeyMap.put("853", "yunnan");
		dataSourceKeyMap.put("854", "xizang");
		dataSourceKeyMap.put("863", "qinghai");
		dataSourceKeyMap.put("864", "ningxia");
		dataSourceKeyMap.put("865", "xinjiang");
		dataSourceKeyMap.put("844", "guangdong");
		dataSourceKeyMap.put("832", "jiangsu");
		dataSourceKeyMap.put("851", "sichuang");
		dataSourceKeyMap.put("833", "zhejiang");
		dataSourceKeyMap.put("834", "anhui");
		dataSourceKeyMap.put("861", "shanxi");
		dataSourceKeyMap.put("842", "hubei");
		dataSourceKeyMap.put("831", "shanghai");
		dataSourceKeyMap.put("813", "hebei");
		dataSourceKeyMap.put("837", "shandong");
		dataSourceKeyMap.put("845", "guangxi");
		dataSourceKeyMap.put("841", "henan");
		dataSourceKeyMap.put("862", "gansu");
		dataSourceKeyMap.put("836", "jiangxi");
		dataSourceKeyMap.put("846", "hainan");
		dataSourceKeyMap.put("823", "heilongjiang");
		dataSourceKeyMap.put("899", "xuni");
		return dataSourceKeyMap;
	}
	public static String dataKeyMap(String provinceName){
		if("beijing".equalsIgnoreCase(provinceName)){
			return "8110000";
		} else if("tianjing".equalsIgnoreCase(provinceName)) {
			return "8120000";
		}else if("shxi".equalsIgnoreCase(provinceName)) {
			return "8140000";
		}else if("neimenggu".equalsIgnoreCase(provinceName)) {
			return "8150000";
		}else if("liaoning".equalsIgnoreCase(provinceName)) {
			return "8210000";
		}else if("jilin".equalsIgnoreCase(provinceName)) {
			return "8220000";
		}else if("fujian".equalsIgnoreCase(provinceName)) {
			return "8350000";
		}else if("hunan".equalsIgnoreCase(provinceName)) {
			return "8430000";
		}else if("chongqing".equalsIgnoreCase(provinceName)) {
			return "8500000";
		}else if("guizhou".equalsIgnoreCase(provinceName)) {
			return "8520000";
		}else if("yunnan".equalsIgnoreCase(provinceName)) {
			return "8530000";
		}else if("xizang".equalsIgnoreCase(provinceName)) {
			return "8540000";
		}else if("qinghai".equalsIgnoreCase(provinceName)) {
			return "8630000";
		}else if("ningxia".equalsIgnoreCase(provinceName)) {
			return "8640000";
		}else if("xinjiang".equalsIgnoreCase(provinceName)) {
			return "8650000";
		}else if("guangdong".equalsIgnoreCase(provinceName)) {
			return "8440000";
		}else if("jiangsu".equalsIgnoreCase(provinceName)) {
			return "8320000";
		}else if("sichuang".equalsIgnoreCase(provinceName)) {
			return "8510000";
		}else if("zhejiang".equalsIgnoreCase(provinceName)) {
			return "8330000";
		}else if("anhui".equalsIgnoreCase(provinceName)) {
			return "8340000";
		}else if("shanxi".equalsIgnoreCase(provinceName)) {
			return "8610000";
		}else if("hubei".equalsIgnoreCase(provinceName)) {
			return "8420000";
		}else if("shanghai".equalsIgnoreCase(provinceName)) {
			return "8310000";
		}else if("hebei".equalsIgnoreCase(provinceName)) {
			return "8130000";
		}else if("shandong".equalsIgnoreCase(provinceName)) {
			return "8370000";
		}else if("guangxi".equalsIgnoreCase(provinceName)) {
			return "8450000";
		}else if("henan".equalsIgnoreCase(provinceName)) {
			return "8410000";
		}else if("gansu".equalsIgnoreCase(provinceName)) {
			return "8620000";
		}else if("jiangxi".equalsIgnoreCase(provinceName)) {
			return "8360000";
		}else if("hainan".equalsIgnoreCase(provinceName)) {
			return "8460000";
		}else if("heilongjiang".equalsIgnoreCase(provinceName)) {
			return "8230000";
		}else if("xuni".equalsIgnoreCase(provinceName)) {
			return "8990000";
		}
		return "";
	}
	
}
