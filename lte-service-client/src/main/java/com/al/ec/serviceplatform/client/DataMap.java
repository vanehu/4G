package com.al.ec.serviceplatform.client;

import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.helpers.FormattingTuple;
import org.slf4j.helpers.MessageFormatter;
/**
 * 数据集.
 * 除常量外，禁止在该类中添加任何变量.
 * 该类继承自HashMap，可以方便添加数据,无需定义变量.
 * @author chylg
 */
public class DataMap extends HashMap<String, Object>{
	private static final long serialVersionUID = -5588205701285782301L;
	private static Logger log = LoggerFactory.getLogger(DataMap.class);
	/**
     * 门户ID
     */
    private static final String K_PORTAL_CODE = "portalCode";
    /**
     * 门户密码
     */
    private static final String K_PASSWORD = "password";
    /**
     * 角色ID
     */
    private static final String K_ROLE_CODE = "roleCode";
    /**
     * 调用服务ID
     */
    private static final String K_SERVICE_CODE = "serviceCode";
    /**
     * 操作号码(包括 各种产品号码,登陆号码等)
     */
    private static final String K_OPERATER_NBR = "operater_nbr";
    /**地区编码  */
    private static final String K_AREA_ID = "area_id";
    /**区号  */
    private static final String K_AREA_CODE = "area_code";
    /**
     * 操作号码类型
     */
    private static final String K_OPERATER_TYPE = "operaterType";
    /**
     * 省份标识
     */
    private static final String K_PROVINCE_CODE = "provinceCode";
    /**
     * 操作员所属渠道
     */
    private static final String K_CHANNEL_ID = "channelId";
    /**
    * 操作员所属渠道名称
    */
    private static final String K_CHANNEL_NAME = "channelName";
    /**
     * 操作员工号编码
     */
    private static final String K_STAFF_ID = "staffId";
    /**
     * 操作员名称
     */
    private static final String K_STAFF_NAME = "staffName";
    /**
     * 操作结果
     */
    private static final String K_RESULT_CODE = "resultCode";
    /**
     * 返回信息
     */
    private static final String K_RESULT_MSG = "resultMsg";
    /**
     * 业务流水
     */
    private static final String K_BUSI_FLOW_ID = "busiFlowId";
    /**
     *  测试类型(不填写表示取实际结果。填写预期的结果码取对应的配置数据)
     */
    private static final String K_DEBUG_CODE = "debugCode";
    private static final String K_DEBUG =  "debug";
    private static final String K_IS_ANALOG = "isAnalog";
    private static final String K_IN_PARAM = "inParam";
    private static final String K_OUT_PARAM = "outParam";
    
    public String getString(String key){
    	Object obj = get(key);
    	if(obj == null){
    		return null;
    	}
    	try {
			return obj.toString();
		} catch (Exception e) {
			log.error("",e);
		}
    	return null;
    }
    
    public boolean getBoolean(String key){
    	Object obj = get(key);
    	if(obj == null){
    		return false;
    	}
    	return (Boolean)obj;
    }
    
	public String getPortalCode() {
		return getString(K_PORTAL_CODE);
	}
	public void setPortalCode(String portalCode) {
		put(K_PORTAL_CODE, portalCode);
	}
	public String getPassword() {
		return getString(K_PASSWORD);
	}
	public void setPassword(String password) {
		put(K_PASSWORD, password);
	}
	public String getRoleCode() {
		return getString(K_ROLE_CODE);
	}
	public void setRoleCode(String roleCode) {
		put(K_ROLE_CODE, roleCode);
	}
	public String getServiceCode(){ 
		return getString(K_SERVICE_CODE);
	}
	public void setServiceCode(String serviceCode) {
		put(K_SERVICE_CODE, serviceCode);
	}
	public String getOperaterNbr() {
		return getString(K_OPERATER_NBR);
	}
	public void setOperaterNbr(String operaterNbr) {
		put(K_OPERATER_NBR, operaterNbr);
	}
	public String getAreaId() {
		return getString(K_AREA_ID);
	}
	public void setAreaId(String areaId) {
		put(K_AREA_ID, areaId);
	}
	
	public String getAreaCode() {
		return getString(K_AREA_CODE);
	}
	public void setAreaCode(String areaId) {
		put(K_AREA_CODE, areaId);
	}
	
	public String getOperaterType() {
		return getString(K_OPERATER_TYPE);
	}
	public void setOperaterType(String operaterType) {
		put(K_OPERATER_TYPE, operaterType);
	}
	public String getProvinceCode() {
		return getString(K_PROVINCE_CODE);
	}
	public void setProvinceCode(String provinceCode) {
		put(K_PROVINCE_CODE, provinceCode);
	}
	public String getChannelId() {
		return getString(K_CHANNEL_ID);
	}
	public void setChannelId(String channelId) {
		put(K_CHANNEL_ID, channelId);
	}
	public String getChannelName() {
		return getString(K_CHANNEL_NAME);
	}
	public void setChannelName(String channelName) {
		put(K_CHANNEL_NAME, channelName);
	}
	public String getStaffId() {
		return getString(K_STAFF_ID);
	}
	public void setStaffId(String staffId) {
		put(K_STAFF_ID, staffId);
	}
	public String getStaffName() {
		return getString(K_STAFF_NAME);
	}
	public void setStaffName(String staffName) {
		put(K_STAFF_NAME, staffName);
	}
	public String getResultCode() {
		return getString(K_RESULT_CODE);
	}
	public void setResultCode(String resultCode) {
		put(K_RESULT_CODE, resultCode);
	}
	public String getResultMsg() {
		return getString(K_RESULT_MSG);
	}
	public void setResultMsg(String resultMsg,Object...argArray) {
		FormattingTuple ft = MessageFormatter.arrayFormat(resultMsg, argArray);
		put(K_RESULT_MSG, ft.getMessage());
	}
	public String getBusiFlowId() {
		return getString(K_BUSI_FLOW_ID);
	}
	public void setBusiFlowId(String busiFlowId) {
		put(K_BUSI_FLOW_ID, busiFlowId);
	}
    
    public void setDebug(boolean flag){
    	put(K_DEBUG, flag);
    }
    
    public boolean isDebug(){
    	return getBoolean(K_DEBUG);
    }
    /**
     * 设置是否开启了模拟数据.
     */
    public void setAnalog(boolean flag){
    	put(K_IS_ANALOG, flag);
    }
    
    /**
     * 返回是否开启了模拟数据.
     */
    public boolean isAnalog(){
    	return getBoolean(K_IS_ANALOG);
    }

	public Map getInParam() {
		return (Map)get(K_IN_PARAM);
	}

	public void setInParam(Map<String, Object> inParam) {
		put(K_IN_PARAM, inParam);
	}

	public Map getOutParam() {
		return (Map)get(K_OUT_PARAM);
	}

	public void setOutParam(Map<String, Object> outParam) {
		put(K_OUT_PARAM, outParam);
	}
    
	public void addInParam(String key ,Object value){
		Map<String,Object> inParamMap = getInParam();
		if(inParamMap == null){
			inParamMap = new HashMap<String, Object>();
		}
		inParamMap.put(key, value);
		setInParam(inParamMap);
	}
	
	public Object getInParam(String key){
		Map<String,Object> inParamMap = getInParam();
		if(inParamMap == null){
			return null;
		}
		return inParamMap.get(key);
	}
	
	public Object getOutParam(String key){
		if(getOutParam() == null){
			return null;
		}
		return getOutParam().get(key);
	}
//    public static void main(String[] args) {
//		DataMap dm = new DataMap();
//		dm.setResultMsg("Hello {} World {} ",1,2);
//		System.out.println(dm.toString());
//	}
}
