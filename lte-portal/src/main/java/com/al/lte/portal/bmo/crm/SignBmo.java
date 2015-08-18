package com.al.lte.portal.bmo.crm;

import java.util.Map;

import com.al.lte.portal.model.SessionStaff;

/**
 * 数字签名服务接口
 */
public interface SignBmo {
	public Map<String, Object> querySignInfo(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception;
}
