package com.al.lte.portal.bmo.crm;

import java.util.Map;

import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.InterfaceException;
import com.al.lte.portal.model.SessionStaff;

public interface BankBmo {

	/**
	 * 银行详情查询
	 * @param param
	 * @return
	 */
	public Map<String, Object> queryBankInfo(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 银行详情保存
	 * @param param
	 * @return
	 */
	public Map<String, Object> saveBank(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 银行详情更新
	 * @param param
	 * @return
	 */
	public Map<String, Object> updateBank(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff) throws Exception;
}
