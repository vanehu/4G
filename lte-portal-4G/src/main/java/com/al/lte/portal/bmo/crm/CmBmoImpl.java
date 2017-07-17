package com.al.lte.portal.bmo.crm;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Service;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.MDA;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.model.SessionStaff;

/**
 * 一证五号修复工具  2017/3/11
 * @author wangdan6
 *
 */
@Service("com.al.lte.portal.bmo.crm.CmBmo")
public class CmBmoImpl implements CmBmo{
   private static Log log = Log.getLog(CmBmoImpl.class);
	//查询一证五号数据
	public Map<String, Object> queryRepairList(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception{
		Map<String, Object> resultMap = new HashMap<String, Object>();
		
		Map<String,Object> contractRootMap = (Map<String, Object>) param.get("ContractRoot");
		Map<String,Object> svcContMap = (Map<String, Object>) contractRootMap.get("SvcCont");
		svcContMap.put("staffCode", sessionStaff.getStaffCode());
		svcContMap.put("channelNbr", sessionStaff.getCurrentChannelCode());
		svcContMap.put("commonRegionId", sessionStaff.getAreaId());
		DataBus db = InterfaceClient.callEopService(param, PortalServiceCode.QRY_CERTPHONENUM_REL, optFlowNum, sessionStaff,"一证五号",MDA.CSB_HTTP_CMP_URL);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
					.getResultCode()))) {
				resultMap = db.getReturnlmap();
				
				returnMap.put("code", ResultCode.R_SUCCESS);
				returnMap.putAll((Map)resultMap.get("certPhoneNumRel"));
				
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", db.getResultMsg());
			}
		}catch(Exception e){
			throw new BusinessException(ErrorCode.QUERY_CMP, param, db.getReturnlmap(), e);
		}	
		return returnMap;				
	}
	//查询省里使用人列表
	public Map<String, Object> queryProvUserList(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception{
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(param, PortalServiceCode.INTF_QUERY_USEINFOBYACCNBR, optFlowNum, sessionStaff);		
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {//调接口成功
				Map<String, Object> returnData = db.getReturnlmap();
				if(returnData != null && ResultCode.R_SUCC.equals(returnData.get("resultCode"))){//数据返回正常					
					Map<String, Object> datamap = (Map)returnData.get("result");
					resultMap.put("code", ResultCode.R_SUCCESS);
					resultMap.putAll((Map)datamap.get("useInfo"));
				}
			} else{
				resultMap.put("code",  ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		}catch(Exception e){
			throw new BusinessException(ErrorCode.QUERY_CMP, param, db.getReturnlmap(), e);
		}	
		return resultMap;			
	}
	//修复一证五号数据
	public Map<String, Object> updateUserInfo(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception{
		Map<String, Object> resultMap = new HashMap<String, Object>();
		//http://IP:port/CmpWeb/cmpService/changeCmcCertNumRel
		Map<String,Object> contractRootMap = (Map<String, Object>) param.get("ContractRoot");
		Map<String,Object> svcContMap = (Map<String, Object>) contractRootMap.get("SvcCont");
		svcContMap.put("staffCode", sessionStaff.getStaffCode());
		svcContMap.put("channelNbr", sessionStaff.getCurrentChannelCode());
		svcContMap.put("commonRegionId", sessionStaff.getAreaId());
		Map<String, Object> returnMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callEopService(param, PortalServiceCode.MOD_CERTPHONENUM_REL, optFlowNum, sessionStaff,"一证五号",MDA.CSB_HTTP_CMP_URL);
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
					.getResultCode()))) {
				resultMap = db.getReturnlmap();
				Map<String, Object> datamap = resultMap;
				returnMap.put("code", ResultCode.R_SUCCESS);
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", db.getResultMsg());
			}
		}catch(Exception e){
			throw new BusinessException(ErrorCode.UPDATE_USER_INO, param, db.getReturnlmap(), e);
		}
		return returnMap;				
	}
	//查询一证五号关系数据
	public Map<String, Object> queryCertNumRelList(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callEopService(param, PortalServiceCode.QRY_REL_INST_INFO, optFlowNum, sessionStaff,"一证五号",MDA.CSB_HTTP_CMP_URL);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
					.getResultCode()))) {
				returnMap = db.getReturnlmap();
				returnMap.put("code", ResultCode.R_SUCCESS);
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", db.getResultMsg());
			}
		}catch(Exception e){
			throw new BusinessException(ErrorCode.QUERY_CERT_NUM_REL, param, db.getReturnlmap(), e);
		}	
		return returnMap;
	}
}