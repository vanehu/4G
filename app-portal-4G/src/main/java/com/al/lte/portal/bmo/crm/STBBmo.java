package com.al.lte.portal.bmo.crm;

import java.util.Map;

import com.al.lte.portal.model.SessionStaff;

/**
 * 天翼高清机顶盒相关业务接口
 */
public interface STBBmo {
	
	/**
	 * 天翼高清机顶盒预约信息规格查询
	 */
	public Map<String, Object> querySTBReserveSpecInfo(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 天翼高清机顶盒预约订单提交
	 */
	public Map<String, Object> commitSTBReserveInfo(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 天翼高清机顶盒预约单查询
	 */
	public Map<String, Object> querySTBReserveInfo(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception;

}
