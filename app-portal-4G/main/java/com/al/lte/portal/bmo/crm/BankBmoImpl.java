package com.al.lte.portal.bmo.crm;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.math.NumberUtils;
import org.codehaus.jackson.type.TypeReference;
import org.springframework.stereotype.Service;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.model.CustInfo;
import com.al.lte.portal.model.SessionStaff;

@Service("com.al.lte.portal.bmo.crm.BankBmo")
public class BankBmoImpl implements BankBmo {

	private Log log = Log.getLog(getClass());
	
	/*
	 * 银行详情查询
	 * (non-Javadoc)
	 * @see com.al.lte.portal.bmo.crm.BankBmo#queryBankInfo(java.util.Map)
	 */
	@SuppressWarnings(value="all")
	public Map<String, Object> queryBankInfo(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.INTF_QUERY_BANK_INFO,
				optFlowNum, sessionStaff);
		Map<String, Object> dbMap=new HashMap<String, Object>();
		if ("0".equals(StringUtils.defaultString(db.getResultCode()))) {
			dbMap = db.getReturnlmap();
			
		} else {
			dbMap.put("code", ResultCode.R_FAIL);
			dbMap.put("msg", "银行详情查询接口调用失败");
		}
		return dbMap;
	}

	/*
	 * 银行详情保存
	 * (non-Javadoc) 
	 * @see com.al.lte.portal.bmo.crm.BankBmo#saveBank(java.util.Map)
	 */
	public Map<String, Object> saveBank(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.INTF_SAVE_BANK,
				optFlowNum, sessionStaff);
		Map<String, Object> dbMap=new HashMap<String, Object>();
		if ("0".equals(StringUtils.defaultString(db.getResultCode()))) {
			dbMap = db.getReturnlmap();
			
		} else {
			dbMap.put("code", ResultCode.R_FAIL);
			dbMap.put("msg", "银行详情保存接口调用失败");
		}
		return dbMap;
	}
	
	/*
	 * 银行详情更新
	 * (non-Javadoc) 
	 * @see com.al.lte.portal.bmo.crm.BankBmo#updateBank(java.util.Map)
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> updateBank(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {		
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.INTF_UPDATE_BANK,
				optFlowNum, sessionStaff);
		Map<String, Object> dbMap=new HashMap<String, Object>();
		if ("0".equals(StringUtils.defaultString(db.getResultCode()))) {
			dbMap = db.getReturnlmap();
			
		} else {
			dbMap.put("code", ResultCode.R_FAIL);
			dbMap.put("msg", "银行详情更新接口调用失败");
		}
		return dbMap;
	}
}
