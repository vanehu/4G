package com.al.lte.portal.bmo.crm;

import java.util.Map;

import org.springframework.stereotype.Service;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.model.SessionStaff;

/**
 * 客户级业务规则校验实现类
 * @author zhouy
 *
 */
@Service("com.al.lte.portal.bmo.crm.RuleBmo")
public class RuleBmoImpl implements RuleBmo {

	private Log log = Log.getLog(getClass());
	
	/*
	 * (non-Javadoc)
	 * @see com.al.lte.portal.bmo.crm.RuleBmo#checkRulePrepare(java.util.Map)
	 */
	public Map<String, Object> checkRulePrepare(Map<String, Object> param, String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(param, PortalServiceCode.CHECK_RULE_PREPARE, optFlowNum, sessionStaff);
		return db.getReturnlmap();
	}

}
