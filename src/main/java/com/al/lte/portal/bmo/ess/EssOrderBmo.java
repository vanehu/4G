package com.al.lte.portal.bmo.ess;

import java.util.Map;

import com.al.ecs.exception.BusinessException;
import com.al.lte.portal.model.SessionStaff;

/**
 * ESS订单管理业务操作类
 */
public interface EssOrderBmo {

	/**
	 * ESS订单查询
	 */
	public Map<String, Object> orderListQry(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception;

	/**
	 * ESS资源补录
	 */
	public Map<String, Object> mktResInstMakeUp(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception;

	/**
	 * 订单详情查询
	 */
	public Map<String, Object> queryOrderInfo(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception;

	/**
	 * 订单状态、订单类型查询
	 */
	public Map<String, Object> orderStatusAndTypeQuery(
			Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 订单下发接口（终端退货、终端换货、撤单）
	 */
	public Map<String, Object> orderRepeal(
			Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception;
	

	/**
	 * ESS订单导出
	 */
	public Map<String, Object> orderListExport(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception;
}
