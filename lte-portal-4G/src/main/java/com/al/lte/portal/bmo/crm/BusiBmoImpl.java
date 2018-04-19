package com.al.lte.portal.bmo.crm;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Service;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.exception.BusinessException;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.model.SessionStaff;

/**
 * 业务接口 .
 * <P>
 * 
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 下午2:14:11
 * @modifyDate
 * @copyRight 亚信联创电信CRM研发部
 */
@Service("com.al.lte.portal.bmo.crm.BusiBmo")
public class BusiBmoImpl implements BusiBmo {

	public Map<String, Object> updateForAddOrReturn(Map<String, Object> paramMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,PortalServiceCode.INTF_ADDORRETURN_CHARGE,
				optFlowNum, sessionStaff);// PortalServiceCode.ATTACH_MUST_OFFER
		Map<String, Object> returnMap = new HashMap<String, Object>();
		// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
		if (ResultCode.R_SUCC.equals(db.getResultCode())) {
			returnMap.put("code", ResultCode.R_SUCCESS);
		} else {
			returnMap.put("code", ResultCode.R_FAIL);
			returnMap.put("msg", db.getResultMsg());
		}
		return returnMap;
	}
}
