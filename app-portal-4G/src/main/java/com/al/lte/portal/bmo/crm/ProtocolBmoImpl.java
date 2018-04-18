package com.al.lte.portal.bmo.crm;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Service;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.ServiceClient;
import com.al.lte.portal.model.SessionStaff;

@Service("com.al.lte.portal.bmo.crm.ProtocolBmo")
public class ProtocolBmoImpl implements ProtocolBmo {
	/* (non-Javadoc)
	 * @see com.al.lte.portal.bmo.crm.ProtocolBmo#queryProtocol(java.util.Map, java.lang.String, com.al.lte.portal.model.SessionStaff)
	 */
	protected final Log log = Log.getLog(getClass());
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryProtocol(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws  Exception {
		log.debug("dataBusMap={}",JsonUtil.toString(dataBusMap));
		DataBus db = InterfaceClient
				.callService(dataBusMap,
						PortalServiceCode.INTF_PROTOCOL_QUERY,
						optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			Map<String, Object> resultMap = db.getReturnlmap();
			
			Map<String, Object> datamap = (Map<String, Object>) resultMap
					.get("result");
			returnMap.put("code", ResultCode.R_SUCCESS);
			returnMap.putAll(datamap);
		} else {
			returnMap.put("code", ResultCode.R_FAIL);
			returnMap.put("msg", "协议查询接口调用失败");
		}
		return returnMap;
    }
	/* (non-Javadoc)
	 * @see com.al.lte.portal.bmo.crm.bb#queryProtocolProdOffer(java.util.Map, java.lang.String, com.al.lte.portal.model.SessionStaff)
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryProtocolOfferDetail(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)  throws  Exception {
		log.debug("dataBusMap={}",JsonUtil.toString(dataBusMap));
		DataBus db = InterfaceClient
				.callService(dataBusMap,
						PortalServiceCode.INTF_PROTOCOL_OFFER_DETAIL,
						optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			Map<String, Object> resultMap = db.getReturnlmap();
			Map<String, Object> datamap = (Map<String, Object>) resultMap
					.get("result");
			returnMap.put("code", ResultCode.R_SUCCESS);
			returnMap.putAll(datamap);
		} else {
			returnMap.put("code", ResultCode.R_FAIL);
			returnMap.put("msg", "协议查询接口调用失败");
		}
		return returnMap;
    }
	/* (non-Javadoc)
	 * @see com.al.lte.portal.bmo.crm.ProtocolBmo#addProtocol(java.util.Map, java.lang.String, com.al.lte.portal.model.SessionStaff)
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> addProtocol(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)  throws  Exception {
		log.debug("dataBusMap={}",JsonUtil.toString(dataBusMap));
		DataBus db = InterfaceClient
				.callService(dataBusMap,
						PortalServiceCode.INTF_PROTOCOL_ADD,
						optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			Map<String, Object> resultMap = db.getReturnlmap();
			Map<String, Object> datamap = (Map<String, Object>) resultMap
					.get("result");
			returnMap.put("code", ResultCode.R_SUCC);
			returnMap.putAll(datamap);
		} else {
			returnMap.put("code", ResultCode.R_FAIL);
			returnMap.put("msg", "协议添加接口调用失败");
		}
		return returnMap;
    }
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryProtocolNbr(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)  throws  Exception {
		log.debug("dataBusMap={}",JsonUtil.toString(dataBusMap));
		DataBus db = InterfaceClient
				.callService(dataBusMap,
						PortalServiceCode.INTF_PROTOCOL_NBR_QUERY,
						optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			Map<String, Object> resultMap = db.getReturnlmap();
			Map<String, Object> datamap = (Map<String, Object>) resultMap
					.get("result");
			returnMap.put("code", ResultCode.R_SUCCESS);
			returnMap.putAll(datamap);
		} else {
			returnMap.put("code", ResultCode.R_FAIL);
			returnMap.put("msg", "协议查询接口调用失败");
		}
		return returnMap;
	}
	public Map<String, Object> queryProtocolOffer(
			Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		log.debug("dataBusMap={}",JsonUtil.toString(dataBusMap));
		DataBus db = InterfaceClient
				.callService(dataBusMap,
						PortalServiceCode.INTF_PROTOCOL_OFFER_QUERY,
						optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			Map<String, Object> resultMap = db.getReturnlmap();
			Map<String, Object> datamap = (Map<String, Object>) resultMap
					.get("result");
			returnMap.put("code", ResultCode.R_SUCC);
			returnMap.putAll(datamap);
		} else {
			returnMap.put("code", ResultCode.R_FAIL);
			returnMap.put("msg", "协议查询接口调用失败");
		}
		return returnMap;
	}
	
	//协议编码
	public Map<String, Object> geProtocolNbrSeq(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> returnMap = new HashMap<String, Object>();
		DataBus db = ServiceClient.callService(dataBusMap, PortalServiceCode.SERVICE_GET_PROTOCOL_NBR_SEQ, optFlowNum, sessionStaff);  //SERVICE_GET_PROTOCOL_NBR
		try{
			if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db.getResultCode()))) {
				returnMap.put("code", ResultCode.R_SUCCESS);
				returnMap.putAll(db.getReturnlmap());
			}else{
				returnMap.put("code", db.getResultCode());
				returnMap.put("message", db.getResultMsg());
			}
			return returnMap;
		}catch(Exception e){
			log.error("服务层的getProtocloNbr服务回参异常", e);
			throw new BusinessException(ErrorCode.QUERY_PROTOCOL, dataBusMap, db.getReturnlmap(), e);
		}				
	}
}
