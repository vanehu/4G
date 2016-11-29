package com.al.lte.portal.bmo.crm;

import java.util.Map;
import com.al.lte.portal.model.SessionStaff;

/**
 * 产品变更业务操作接口 .
 * <P>
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 下午2:14:11
 * @modifyDate 
 * @copyRight 亚信联创电信CRM研发部
 */
public interface ProdBmo {
	
	/**
	 * 产品规格属性查询
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> prodSpecParamQuery(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	
	/**
	 * 产品实例属性查询
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> prodInstParamQuery(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	
	/**
	 * 产品信息查询
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> prodQuery(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	
	/**
	 * 产品实例详情查询
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> prodDetailQuery(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff)
			throws Exception;

	
	
}
