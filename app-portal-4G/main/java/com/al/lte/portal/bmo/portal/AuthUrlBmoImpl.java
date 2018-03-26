package com.al.lte.portal.bmo.portal;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.model.SessionStaff;

@Service("com.al.lte.portal.bmo.portal.AuthUrlBmo")
public class AuthUrlBmoImpl implements AuthUrlBmo {

	public List<String> queryAuthUrlList(
			Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		List<String> infoList = new ArrayList<String>();
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.QUERY_AUTH_URL_LIST, optFlowNum, sessionStaff);
		try {
			Map<String, Object> resultMap = db.getReturnlmap();
			if (resultMap != null && ResultCode.R_SUCC.equals(resultMap.get("resultCode"))) {
				return (List<String>) resultMap.get("result");
			}
			return infoList;
		} catch (Exception e) {
			throw new BusinessException(ErrorCode.QUERY_AUTH_URL_LIST, dataBusMap,
					db.getReturnlmap(), e);
		}
	}

}
