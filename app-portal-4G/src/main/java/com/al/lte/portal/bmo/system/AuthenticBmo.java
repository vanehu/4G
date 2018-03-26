package com.al.lte.portal.bmo.system;

import java.util.Map;

import com.al.ecs.exception.BusinessException;
import com.al.lte.portal.model.SessionStaff;

/**
 * 数据权限范围.
 * <P>
 * 
 * @author wukf
 * @version V1.0 2013-08-06
 * @createDate 2013-08-06 下午3:29:12
 * @modifyDate 
 * @copyRight 亚信联创电信EC研发部
 */
public interface AuthenticBmo {
	
	/**
	 * 查询数据权限范围
	 * @param map
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String,Object> queryAuthenticDataRangeAreaData(Map<String, Object> map, String optFlowNum, SessionStaff sessionStaff)
    	throws Exception;
	public Map<String,Object> queryAllDataRangeAreaData(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
}
