package com.al.lte.portal.bmo.crm;

import java.util.Map;

import com.al.ecs.exception.BusinessException;
import com.al.lte.portal.model.SessionStaff;

/**
 * 规则校验接口
 *
 */
public interface RuleBmo {

	/**
	 * 客户级规则校验
	 * @param param
	 * @return
	 */
	public Map<String, Object> checkRulePrepare(Map<String, Object> param, String optFlowNum, SessionStaff sessionStaff) throws Exception;
}
