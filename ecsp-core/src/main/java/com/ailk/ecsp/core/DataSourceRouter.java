package com.ailk.ecsp.core;

import org.apache.commons.lang3.StringUtils;


public class DataSourceRouter {
	public static RouterStrategy currentRouterStrategy = new RouterStrategy();
	public final static ThreadLocal<RouterStrategy> currentRouterStrategyThread = new ThreadLocal<RouterStrategy>();
	
	/** 配置文件中的数据源 */
	private static String configDataSourceKey = "";
	/** 配置文件中的数据源属性名 */
	public static final String CONFIG_DATASOURCE_PROPERTY_NAME = "DEFAULT_DATASOURCE";
	 /** 默认数据源 */
	public static final String DEFAULT_DATASOURCE_KEY = "portal";
	
	public static void setRouteFactor(String key){
		/*
		 * 1、key为空，则取配置文件中的默认数据源名称，d1；
		 * 2、否则读取数据库中的对应key的数据源名称，d2；
		 * 3、如果得到的数据源名称为空，则取代码中的默认数据源名称，d3；
		 */
		String dataSourceKey = null;
		if(StringUtils.isBlank(key)){
			dataSourceKey = configDataSourceKey;
		} else {
			dataSourceKey = DataRepository.getInstence().getSysParamValue(DEFAULT_DATASOURCE_KEY,key, "7"); //从管理库配置数据中获取key对应的数据源名称
		}
		
		if (StringUtils.isBlank(dataSourceKey)){
			dataSourceKey = DEFAULT_DATASOURCE_KEY;
		}
		currentRouterStrategyThread.set(new RouterStrategy(dataSourceKey));
	}
	public static String getConfigDataSourceKey() {
		return configDataSourceKey;
	}
	public static void setConfigDataSourceKey(String configDataSourceKey) {
		DataSourceRouter.configDataSourceKey = configDataSourceKey;
		System.out.println("-------------------current configDataSourceKey is " + configDataSourceKey);
	}
}
