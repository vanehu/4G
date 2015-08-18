package com.al.lte.portal.bmo.crm;

import java.util.ArrayList;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import com.al.ecs.exception.BusinessException;
import com.al.lte.portal.model.SessionStaff;

/**
 * 公用业务操作接口 .
 * <P>
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 下午2:14:11
 * @modifyDate 
 * @copyRight 亚信联创电信CRM研发部
 */
public interface CommonBmo {
	
	/**
	 * 订单校验
	 * @param request
	 * @param token
	 * @return
	 */
	public boolean checkToken(HttpServletRequest request,String token);

	/**
	 * 修改资源状态
	 * @param paramMap
	 * @return
	 * @throws BusinessException
	 */
	public Map<String, Object> updateResState(ArrayList paramList,String optFlowNum, SessionStaff sessionStaff) throws Exception;;
	
}
