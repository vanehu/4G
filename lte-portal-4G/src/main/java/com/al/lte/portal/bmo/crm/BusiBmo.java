package com.al.lte.portal.bmo.crm;

import java.util.Map;

import com.al.ecs.exception.BusinessException;
import com.al.lte.portal.model.SessionStaff;


/**
 * 业务接口 .
 * <P>
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 下午2:14:11
 * @modifyDate 
 * @copyRight 亚信联创电信CRM研发部
 */
public interface BusiBmo {
	/**
	 * 补退费
	 * @param paramMap
	 * @return
	 * @throws BusinessException
	 */
	public Map<String, Object> updateForAddOrReturn(Map<String, Object> paramMap, String optFlowNum, SessionStaff sessionStaff) throws Exception;
}
