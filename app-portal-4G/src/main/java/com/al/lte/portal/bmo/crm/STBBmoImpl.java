package com.al.lte.portal.bmo.crm;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.model.SessionStaff;

/**
 * 天翼高清机顶盒相关业务接口实现
 */
@Service("com.al.lte.portal.bmo.crm.STBBmo")
public class STBBmoImpl implements STBBmo {
	
	/**
	 * 天翼高清机顶盒预约信息规格查询
	 */
	public Map<String, Object> querySTBReserveSpecInfo(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)throws Exception{
		
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.QUERY_STB_RESERVE_SPEC_INFO, optFlowNum, sessionStaff);
		try{
			if(ResultCode.R_SUCC.equals(db.getResultCode())){
				return db.getReturnlmap();
			}else{
				Map<String, Object> returnMap = new HashMap<String, Object>();
				returnMap.put("resultCode", db.getResultCode());
				returnMap.put("resultMsg", db.getResultMsg());
				return returnMap;
			}
		}catch(Exception e){
			throw new BusinessException(ErrorCode.QUERY_STB_RESERVE_SPEC_INFO, dataBusMap, db.getReturnlmap(), e);
		}
	}
	
	/**
	 * 天翼高清机顶盒预约订单提交
	 */
	public Map<String, Object> commitSTBReserveInfo(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception{
		
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.COMMIT_STB_RESERVE_INFO, optFlowNum, sessionStaff);
		try{
			if(ResultCode.R_SUCC.equals(db.getResultCode())){
				return db.getReturnlmap();
			}else{
				Map<String, Object> returnMap = new HashMap<String, Object>();
				returnMap.put("resultCode", db.getResultCode());
				returnMap.put("resultMsg", db.getResultMsg());
				return returnMap;
			}
		}catch(Exception e){
			throw new BusinessException(ErrorCode.COMMIT_STB_RESERVE_INFO, dataBusMap, db.getReturnlmap(), e);
		}
	}
	
	/**
	 * 天翼高清机顶盒预约单查询
	 */
	public Map<String, Object> querySTBReserveInfo(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception{
		
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.QUERY_STB_RESERVE_INFO, optFlowNum, sessionStaff);
		try{
			if(ResultCode.R_SUCC.equals(db.getResultCode())){
				return db.getReturnlmap();
			}else{
				Map<String, Object> returnMap = new HashMap<String, Object>();
				returnMap.put("resultCode", db.getResultCode());
				returnMap.put("resultMsg", db.getResultMsg());
				return returnMap;
			}
		}catch(Exception e){
			throw new BusinessException(ErrorCode.QUERY_STB_RESERVE_INFO, dataBusMap, db.getReturnlmap(), e);
		}
	}
	
}
