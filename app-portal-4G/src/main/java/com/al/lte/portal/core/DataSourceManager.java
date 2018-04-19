package com.al.lte.portal.core;

import java.util.List;

import com.al.lte.portal.common.SysConstant;

/**
 * 管理门户层需要使用的数据源以及数据路由策略
 * @author JinJian
 *
 */
public class DataSourceManager {
	
	/** 默认使用的数据源名称 */
	public static final String DEFAULT_DATASOURCE_KEY = "portal";
	
	private List<String> configDataSourceKeys;
	
	/** 保存当前使用的数据源关键字 */
	private static final ThreadLocal<String> currentDataSourceKey = new ThreadLocal<String>();

	public List<String> getConfigDataSourceKeys() {
		return configDataSourceKeys;
	}

	public void setConfigDataSourceKeys(List<String> configDataSourceKeys) {
		this.configDataSourceKeys = configDataSourceKeys;
	}

	/**
	 * 获取路由关键字,至少会返回默认的数据源名称
	 * @return
	 */
	public String getDbKeyWords(){
		String dbKeyWords = DEFAULT_DATASOURCE_KEY;
		if(configDataSourceKeys != null && configDataSourceKeys.size() != 0){
			for(String configDataSourceKey : configDataSourceKeys){
				if(!DEFAULT_DATASOURCE_KEY.equals(configDataSourceKey)){
					dbKeyWords += SysConstant.CON_REF_PARAM_ACTION_GROUP + configDataSourceKey;
				}
			}
		}
		return dbKeyWords;
	}
	
	
	//根据areaId返回匹配的dbKeyWord
	public String areaIdToDbKeyWord(String areaId){
		if(areaId == null || areaId.trim().length() == 0){
			return null;
		}
		areaId = areaId.trim();
		if(!areaId.matches("\\d{7}")){
			return null;
		}
		areaId = areaId.substring(0,3) + "0000";
		if(configDataSourceKeys != null && configDataSourceKeys.contains(areaId)){
			return areaId;
		}
		return null;
	}
	
	public static String getCurrentDataSourceKey(){
		return currentDataSourceKey.get();
	}
	
	public static void setCurrentDataSourceKey(String dbKey){
		currentDataSourceKey.set(dbKey);
	}
	
}
