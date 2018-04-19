package com.al.lte.portal.bmo.crm;

import java.util.HashMap;
import java.util.Map;
import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Service;
import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.ServiceClient;
import com.al.lte.portal.model.SessionStaff;

@Service("com.al.lte.portal.bmo.crm.TokenBmoImpl")
public class TokenBmoImpl implements TokenBmo {


	public Map<String, Object> getAppToken(Map<String, Object> paramMap,String flowNum, SessionStaff sessionStaff) {
		// TODO Auto-generated method stub
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = ServiceClient.callService(paramMap, PortalServiceCode.SERVICE_GET_APPTOKEN, null, sessionStaff);		
		if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db.getResultCode()))) {
			resultMap = db.getReturnlmap();	
		} else {		
			resultMap.put("resultCode", db.getResultCode());
			resultMap.put("resultMsg", db.getResultMsg());
			return resultMap;
		}
		return resultMap;
	}

	public Map<String, Object> QueryAccessToken(Map<String, Object> paramMap,
			String flowNum, SessionStaff sessionStaff) {
		// TODO Auto-generated method stub
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = ServiceClient.callService(paramMap, PortalServiceCode.SERVICE_QUERY_ACCESSTOKEN, null, sessionStaff);		
		if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db.getResultCode()))) {
			resultMap = db.getReturnlmap();	
		} else {		
			resultMap.put("resultCode", db.getResultCode());
			resultMap.put("resultMsg", db.getResultMsg());
			return resultMap;
		}
		return resultMap;
	}
}
