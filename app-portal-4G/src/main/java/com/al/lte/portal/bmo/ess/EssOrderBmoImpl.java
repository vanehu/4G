package com.al.lte.portal.bmo.ess;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Service;
import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.model.SessionStaff;

/**
 * ESS订单管理业务实现
 */
@Service("com.al.lte.portal.bmo.ess.EssOrderBmo")
public class EssOrderBmoImpl implements EssOrderBmo {
	protected final Log log = Log.getLog(getClass());

	/**
	 * ESS订单查询
	 */
	public Map<String, Object> orderListQry(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.ESS_QUERY_ORDER_LIST, optFlowNum,
				sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
				resultMap.put("resultCode", ResultCode.R_SUCC);
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理ESS订单查询接口服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.ESS_QUERY_ORDER_LIST,
					paramMap, resultMap, e);
		}
		return resultMap;
	}

	/**
	 * ESS资源补录
	 */
	public Map<String, Object> mktResInstMakeUp(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.ESS_MKTRES_MAKEUP, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
				resultMap.put("resultCode", ResultCode.R_SUCC);
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理ESS资源补录接口服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.ESS_MKTRES_MAKEUP, paramMap,
					resultMap, e);
		}
		return resultMap;
	}

	/**
	 * 查询订单详情
	 */

	public Map<String, Object> queryOrderInfo(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> result = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.QUERY_ORDER_DETAIL, optFlowNum, sessionStaff);
		try {
			result.put("code", ResultCode.R_EXCEPTION);
			result.put("mess", db.getResultMsg());
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
					.getResultCode()))) {
				result = db.getReturnlmap();
				result.put("code", ResultCode.R_FAILURE);
				result.put("mess", result.get("resultMsg"));
				if (ResultCode.R_SUCC.equals(result.get("resultCode"))) {
					List<Map<String,Object>> orderLists = (List<Map<String, Object>>) result.get("orderLists");
					if (orderLists!= null && orderLists.size()>0) {
						result.put("code", ResultCode.R_SUCC);
					}
				}
			}
			return result;
		} catch (Exception e) {
			throw new BusinessException(ErrorCode.QUERY_ORDER_DETAIL,
					dataBusMap, db.getReturnlmap(), e);
		}
	}
	
	/**
	 * ESS订单类型、订单状态查询
	 */
	public Map<String, Object> orderStatusAndTypeQuery(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.ESS_STATUS_TYPE_QUERY, optFlowNum,
				sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
				resultMap.put("resultCode", ResultCode.R_SUCC);
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理ESS订单相关常量查询接口服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.ESS_STATUS_TYPE_QUERY,
					paramMap, resultMap, e);
		}
		return resultMap;
	}
	
	/**
	 * ESS订单类型、订单状态查询
	 */
	public Map<String, Object> orderRepeal(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.ESS_ORDER_REPEAL, optFlowNum,
				sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
				resultMap.put("resultCode", ResultCode.R_SUCC);
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理ESS订单下发接口服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.ESS_ORDER_REPEAL,
					paramMap, resultMap, e);
		}
		return resultMap;
	}
	
	/**
	 * ESS订单查询
	 */
	public Map<String, Object> orderListExport(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.ESS_ORDER_LIST_EXPORT, optFlowNum,
				sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
				resultMap.put("resultCode", ResultCode.R_SUCC);
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理ESS订单导出返回的数据异常", e);
			throw new BusinessException(ErrorCode.ESS_ORDER_LIST_EXPORT,
					paramMap, resultMap, e);
		}
		return resultMap;
	}
}
