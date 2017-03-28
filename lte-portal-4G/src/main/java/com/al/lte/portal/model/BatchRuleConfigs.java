package com.al.lte.portal.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Set;

import org.apache.commons.collections.MapUtils;

import com.al.ecs.common.util.MDA;
import com.al.ecs.log.Log;

/**
 * 批量业务MDA配置控制类
 * @author ZhangYu
 * @since 2017-03-07
 */
public class BatchRuleConfigs {
	
	private static Log log = Log.getLog(BatchRuleConfigs.class);

	private int totalColumns;
	
	private ArrayList<Integer> strictColumns;
	
	private ArrayList<String> nameColumns;
	
	private int maxRows;
	
	private String batchTypeName;
	
	private ArrayList<Integer> govEntCheckList;
	
	private ArrayList<Integer> repeatCheckList;
	
	private HashMap<Integer, String> regexpCheck;
	
	private Integer templateType;
	
	private String batchType;
	
	private int threshold;
	
	private int shiftLeft;
	
	private int errorDataMaxCount;
	
	private boolean threadsFlag;
	
	@SuppressWarnings("unchecked")
	public BatchRuleConfigs(String batchType){
		HashMap<String, Object> batchRuleConfig = (HashMap<String, Object>) MDA.BATCH_CONFIGS.get(batchType);
		
		if(batchRuleConfig != null){
			this.batchType = batchType;
			this.totalColumns = (Integer)batchRuleConfig.get("totalColumns");
			this.strictColumns = (ArrayList<Integer>)batchRuleConfig.get("strictColumns");
			this.nameColumns = (ArrayList<String>)batchRuleConfig.get("nameColumns");
			this.batchTypeName = (String)(batchRuleConfig.get("batchTypeName"));
			
			this.shiftLeft = ((int) (Math.log(this.threshold) / Math.log(2)));
			this.threadsFlag = "ON".equals(MapUtils.getString(batchRuleConfig, "threadsFlag", ""));
			
			this.errorDataMaxCount = MapUtils.getIntValue(batchRuleConfig, "errorDataMaxCount", 10);
			this.maxRows = MapUtils.getIntValue(batchRuleConfig, "maxRows", 50000);
			this.threshold = MapUtils.getIntValue(batchRuleConfig, "threshold", 1024);
			
			this.setGovEntCheckList((ArrayList<Integer>) batchRuleConfig.get("govEntCheckList"));
			this.setRepeatCheckList((ArrayList<Integer>) batchRuleConfig.get("repeatCheckList"));
			this.setRegexpCheck((HashMap<String, String>)batchRuleConfig.get("regexpCheck"));
			this.setTemplateType(MapUtils.getIntValue(batchRuleConfig, "templateType", -1));
			log.debug("portalBatch-私有成员属性实例化完成.");
		} else{
			log.error("portalBatch-类BatchRuleConfigs实例化异常，MDA.BATCH_CONFIGS未获取到有效信息={}，batchType={}.", batchRuleConfig, batchType);
//			throw new Exception("类BatchRuleConfigs实例化异常，未获取到有效配置信息");
		}
		
		return;
	}
	
	/**
	 * 解析转换HashMap
	 * @param paramMap
	 * @return paramMap为null或者没有键值对则返回null
	 */
	private HashMap<Integer, String> parseMapConfig(HashMap<String, String> paramMap){
		HashMap<Integer, String> returnMap = new HashMap<Integer, String>();
		
		if(paramMap != null && !paramMap.isEmpty()){
			Set<String> keys = paramMap.keySet();
			Iterator<String> iterator = keys.iterator();
			String strKey = null;
			Integer key = 0;
			String value = null;
			try{
				while(iterator.hasNext()){
					strKey = (String)iterator.next();
					key = Integer.parseInt(strKey);
					value = MDA.PORTAL_REGEXP.get((String) paramMap.get(strKey));
					returnMap.put(key, value);
				}	
			}catch(NumberFormatException e){
				log.error("portalBatch-解析转换MDA(BATCH_CONFIGS)异常={}", e);
				log.error("portalBatch-解析转换MDA(BATCH_CONFIGS)异常，可能由batchType={}，={}配置导致", this.getBatchType(), this.getBatchTypeName());
			} finally{
				returnMap.clear();
			}
		}
		
		return returnMap;
	}
	
	public String getRegexpStr(int column) {
		return this.regexpCheck.get(column);
	}
	
	public String getNameColumns(int column) {
		return nameColumns.get(column);
	}

	public int getTotalColumns() {
		return totalColumns;
	}

	public void setTotalColumns(int totalColumns) {
		this.totalColumns = totalColumns;
	}

	public ArrayList<Integer> getStrictColumns() {
		return strictColumns;
	}

	public void setStrictColumns(ArrayList<Integer> strictColumns) {
		this.strictColumns = strictColumns;
	}

	public ArrayList<String> getNameColumns() {
		return nameColumns;
	}

	public void setNameColumns(ArrayList<String> nameColumns) {
		this.nameColumns = nameColumns;
	}

	public int getMaxRows() {
		return maxRows;
	}

	public void setMaxRows(int maxRows) {
		this.maxRows = maxRows;
	}

	public String getBatchTypeName() {
		return batchTypeName;
	}

	public void setBatchTypeName(String batchTypeName) {
		this.batchTypeName = batchTypeName;
	}

	public HashMap<Integer, String> getRegexpCheck() {
		return regexpCheck;
	}

	public void setRegexpCheck(HashMap<String, String> regexpCheck) {
		if(regexpCheck == null || regexpCheck.isEmpty()){
			this.regexpCheck = new HashMap<Integer, String>();
		} else{
			this.regexpCheck = this.parseMapConfig(regexpCheck);
		}
	}

	public String getBatchType() {
		return batchType;
	}

	public void setBatchType(String batchType) {
		this.batchType = batchType;
	}

	public int getThreshold() {
		return threshold;
	}

	public void setThreshold(int threshold) {
		this.threshold = threshold;
	}

	public int getShiftLeft() {
		return shiftLeft;
	}

	public void setShiftLeft(int shiftLeft) {
		this.shiftLeft = shiftLeft;
	}

	public int getErrorDataMaxCount() {
		return errorDataMaxCount;
	}

	public void setErrorDataMaxCount(int errorDataMaxCount) {
		this.errorDataMaxCount = errorDataMaxCount;
	}

	public ArrayList<Integer> getRepeatCheckList() {
		return repeatCheckList;
	}

	public boolean isThreadsFlagOn() {
		return threadsFlag;
	}

	public void setThreadsFlag(boolean threadsFlag) {
		this.threadsFlag = threadsFlag;
	}

	public void setRepeatCheckList(ArrayList<Integer> repeatCheckList) {
		if(repeatCheckList != null){
			this.repeatCheckList = repeatCheckList;
		} else{
			this.repeatCheckList = new ArrayList<Integer>(0);
		}
	}

	public ArrayList<Integer> getGovEntCheckList() {
		return govEntCheckList;
	}

	public void setGovEntCheckList(ArrayList<Integer> govEntCheckList) {
		if(govEntCheckList != null){
			this.govEntCheckList = govEntCheckList;
		} else{
			this.govEntCheckList = new ArrayList<Integer>(0);
		}
	}

	public int getTemplateType() {
		return templateType;
	}

	public void setTemplateType(int templateType) {
		this.templateType = templateType;
	}
}