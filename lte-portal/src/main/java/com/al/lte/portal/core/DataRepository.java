package com.al.lte.portal.core;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang3.StringUtils;

import com.al.ecs.log.Log;



public class DataRepository {
    private Log log = Log.getLog(DataRepository.class);
	private Map<String, Object> allSystemParam;//系统管理参数
	private Map<String, Object> allOrderParam;//订单管理参数
	private Map<String, Object> allBillingParam;//费用管理参数
	private Map<String, Object> allResourceParam;//营销资源管理参数
	private Map<String, Object> allCommonParam;//常用参数
	/**
	 * 发票模板组。键格式：ownerId&busiType&areaId
	 */
	private Map<String,List<Map<String, Object>>> allTemplates;
	private Map<String,Map<String, Object>> allTemplatesMap;
	private Map<String, Object> apConfigMap;//agent_portal_config表的缓存数据
	private static DataRepository platformDataRepository;
	private DataRepository(){
		allCommonParam = new HashMap<String, Object>();
		apConfigMap = new HashMap<String, Object>();
		allTemplates=new HashMap<String,List<Map<String, Object>>>();
		allTemplatesMap=new HashMap<String,Map<String, Object>>();
	}
	public static DataRepository getInstence(){
		if (platformDataRepository == null) {
			platformDataRepository = new DataRepository();
		}
		return platformDataRepository;
	}
	public Map<String, Object> getAllSystemParam() {
		return allSystemParam;
	}
	public void setAllSystemParam(Map<String, Object> allSystemParam) {
		this.allSystemParam = allSystemParam;
	}
	/**
     * 获取指定地区，指定功能模块的模板。适用于LTE
     * @param areaId 地区id
     * @param busiType 功能编号（101一次性费用发票，102销账发票，103充值发票），必须传
     * @return
     */
	public List<Map<String, Object>> getTemplateList(String areaId,String busiType) {
        return getTemplateList(areaId,busiType,null);
    }
	/**
	 * 获取指定地区，指定转售商的模板。LTE项目ownerId传空
	 * @param areaId 地区id
	 * @param ownerId 转售商id
	 * @param busiType 功能编号（101一次性费用发票，102销账发票，103充值发票），必须传
	 * @return
	 */
	public List<Map<String, Object>> getTemplateList(String areaId,String busiType, String ownerId) {
	    if(StringUtils.isBlank(busiType)){//如果不知道是那个功能模块，那么没法取模板列表
	        return new ArrayList<Map<String, Object>>();
	    }else{
	        String key=getKey(areaId,busiType,ownerId);
	        List<Map<String, Object>> resList=allTemplates.get(key);
	        if(resList==null){
	            String cityID=areaId.substring(0, 5) + "00";
	            key=getKey(cityID,busiType,ownerId);
	            resList=allTemplates.get(key);
	            if(resList==null){
	                String provinceID = areaId.substring(0, 3) + "0000";
	                key=getKey(provinceID,busiType,ownerId);
	                resList=allTemplates.get(key);
	                if(resList==null){
	                    String nationID="8100000";
	                    key=getKey(nationID,busiType,ownerId);
	                    resList=allTemplates.get(key);
	                }else{
	                    allTemplates.put(key, resList);
	                }
	            }else{
                    allTemplates.put(key, resList);
                }
	        }else{
                allTemplates.put(key, resList);
            }
	        return resList;
	    }
	   
	}
	/**
	 * 清除模板
	 */
	public void clearTemplate(){
	    allTemplates=new HashMap<String,List<Map<String, Object>>>();
        allTemplatesMap=new HashMap<String,Map<String, Object>>();
	}
	public void setTemplateList(List<Map<String, Object>> templateList) {
	    setTemplateList(templateList,null);
    }
	public void setTemplateList(List<Map<String, Object>> templateList, String ownerId) {
	    String areaId;
	    String busiType;
	    String key;
	    List<Map<String, Object>> subList;
	    for(Map<String, Object> tempMap:templateList){
	        if (!"0".equals(MapUtils.getString(tempMap, "isEnable"))) {
                continue;
            }
	        areaId=MapUtils.getString(tempMap, "areaId", "");
	        busiType=MapUtils.getString(tempMap, "busiType", "");
	        key=getKey(areaId,busiType,ownerId);
	        if (allTemplates.containsKey(key)) {
	        	subList=allTemplates.get(key);
	        } else {
	        	subList=new ArrayList();
	        }
            subList.add(tempMap);
            allTemplates.put(key, subList);
            allTemplatesMap.put(key, tempMap);
	    }
	    String nationID="8100000";
	    String provinceID;
	    String cityID;
	    for(Map<String, Object> tempMap:templateList){
	        if (!"0".equals(MapUtils.getString(tempMap, "isEnable"))) {
                continue;
            }
            areaId=MapUtils.getString(tempMap, "areaId", "");
            busiType=MapUtils.getString(tempMap, "busiType", "");
            if(StringUtils.isNotEmpty(areaId)||areaId.length()==8){
                provinceID = areaId.substring(0, 3) + "0000";
                cityID=areaId.substring(0, 5) + "00";
                if(areaId.equals("8100000")){//中国
                    continue;
                }else if(areaId.endsWith("0000")){//省份的id
                    key=getKey(areaId,busiType,ownerId);
                    subList=allTemplates.get(key);
                    key=getKey("8100000",busiType,ownerId);
                    Map<String, Object> nationMap=allTemplatesMap.get(key);
                    if(nationMap!=null){
                        subList.add(nationMap);
                    }
                    continue;
                }else if(areaId.endsWith("00")){//市的id
                    key=getKey(areaId,busiType,ownerId);
                    subList=allTemplates.get(key);
                    key=getKey("8100000",busiType,ownerId);
                    Map<String, Object> nationMap=allTemplatesMap.get(key);
                    if(nationMap!=null){
                        subList.add(nationMap);
                    }
                    key=getKey(provinceID,busiType,ownerId);
                    Map<String, Object> cityMap=allTemplatesMap.get(key);
                    if(cityMap!=null){
                        subList.add(cityMap);
                    }
                    continue;
                }else{
                    key=getKey(areaId,busiType,ownerId);
                    subList=allTemplates.get(key);
                    key=getKey("8100000",busiType,ownerId);
                    Map<String, Object> nationMap=allTemplatesMap.get(key);
                    if(nationMap!=null){
                        subList.add(nationMap);
                    }
                    key=getKey(provinceID,busiType,ownerId);
                    Map<String, Object> cityMap=allTemplatesMap.get(key);
                    if(cityMap!=null){
                        subList.add(cityMap);
                    }
                    key=getKey(cityID,busiType,ownerId);
                    Map<String, Object> ccMap=allTemplatesMap.get(key);
                    if(ccMap!=null){
                        subList.add(ccMap);
                    }
                }
            }else{//模板配置的areaid有问题，忽略！！！
                log.info("模板表中areaId配置有问题，areaId="+areaId);
                continue;
            }
        }
	}
	private String getKey(String areaId,String busiType){
        return getKey(areaId,busiType,"defult");
    }
	private String getKey(String areaId,String busiType, String ownerId){
	    if(StringUtils.isBlank(ownerId)){
            ownerId="defult";
        }
	    return ownerId+"&"+busiType+"&"+areaId;
	}
	public Map<String, Object> getAllOrderParam() {
		return allOrderParam;
	}
	public void setAllOrderParam(Map<String, Object> allOrderParam) {
		this.allOrderParam = allOrderParam;
	}
	public Map<String, Object> getAllBillingParam() {
		return allBillingParam;
	}
	public void setAllBillingParam(Map<String, Object> allBillingParam) {
		this.allBillingParam = allBillingParam;
	}
	public Map<String, Object> getAllResourceParam() {
		return allResourceParam;
	}
	public void setAllResourceParam(Map<String, Object> allResourceParam) {
		this.allResourceParam = allResourceParam;
	}
	public Map<String, Object> getAllCommonParam() {
		return allCommonParam;
	}
	public Object getCommonParam(String key) {
		return allCommonParam.get(key);
	}
	public void setAllCommonParam(Map<String, Object> allCommonParam) {
		this.allCommonParam = allCommonParam;
	}
	public static DataRepository getPlatformDataRepository() {
		return platformDataRepository;
	}
	public static void setPlatformDataRepository(
			DataRepository platformDataRepository) {
		DataRepository.platformDataRepository = platformDataRepository;
	}
	public void addAllParam(String paramCode,String paramValue){
		allCommonParam.put(paramCode, paramValue);
	}
	/**
	 * 使用该方法，需注意如果缓存在启动时未成功获取，则得到的值为null
	 * 可以使用 MySimulateData.getInstance().getParam(code) ，当缓存不正确时<br>
	 * 它可以尝试再次获取，仍然失败则抛出异常
	 * @param paramCode
	 * @return
	 */
	public String getCommonParamByCode(String paramCode){
		return MapUtils.getString(allCommonParam, paramCode);
	}
	public Map<String, Object> getApConfigMap() {
		return apConfigMap;
	}
	public void setApConfigMap(Map<String, Object> apConfigMap) {
		this.apConfigMap = apConfigMap;
	}
	
}
