package com.ailk.ecsp.core;

public class RouterStrategy {
	public static final String DATASOURCE_CONST = "datasource";
	public static final String CURRENT_CONST = "current";
	public static final String WRITE_CONST = "write";
	public static final String READ_CONST = "read";
	public static final String SEP = "."; 
	
	
	private String key = "";
	public RouterStrategy(String key){
		this.key = key;
	}
	public RouterStrategy(){
		
	}
	@Deprecated
	public void setKey(String key) {
		//作废空方法
	}
	public String getKey() {
		return key;
	}
	
	/**
	 * 将给定的关键字参数转换成 完整的数据源关键字（spring配置文件中的 bean id）
	 * @param dbKeyWord 省份标识，如 guangdong...
	 * @param readWriteOrCurrent 关键字，如 read write current...
	 * @return
	 */
	public static String toRouterStrategyKey(String dbKeyWord, String readWriteOrCurrent){
		if(dbKeyWord == null || dbKeyWord.length() == 0){
			return null;
		}
		if(readWriteOrCurrent == null || readWriteOrCurrent.length() == 0){
			return DATASOURCE_CONST + SEP + dbKeyWord;
		}
		return DATASOURCE_CONST + SEP + dbKeyWord + SEP + readWriteOrCurrent;
	}
}
