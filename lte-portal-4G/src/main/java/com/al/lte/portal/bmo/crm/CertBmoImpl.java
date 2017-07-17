package com.al.lte.portal.bmo.crm;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Service;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;


@Service("com.al.lte.portal.bmo.crm.CertBmo")
public class CertBmoImpl implements CertBmo {

	private Log log = Log.getLog(getClass());

	@SuppressWarnings("unchecked")
	public Map<String, Object> recordCertReaderCustInfos(Map<String, Object> param, SessionStaff sessionStaff) throws InterfaceException, IOException, Exception {
		Map<String, Object> returnMap = new HashMap<String, Object>();
		
		param.put("areaId", sessionStaff.getCurrentAreaId());
		DataBus db = InterfaceClient.callService(param, PortalServiceCode.RECORD_CERT_READER_CUST_INFOS, null, sessionStaff);
		
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> resultMap = new HashMap<String, Object>();
				resultMap = MapUtils.getMap(db.getReturnlmap(), SysConstant.RESULT, null);
				if(MapUtils.isNotEmpty(resultMap)){
					returnMap.putAll(resultMap);
					returnMap.put(SysConstant.RESULT_CODE, ResultCode.SUCCESS);
				} else{
					returnMap.put(SysConstant.RESULT_CODE,  ResultCode.FAIL);
					returnMap.put(SysConstant.RESULT_MSG, "后台saveCertInfoFromIdentification服务返回非空结果集");
					log.error("后台intf.soService/saveCertInfoFromIdentification服务返回非空结果集={}", JsonUtil.toString(db.getReturnlmap()));
				}
			} else {
				returnMap.put(SysConstant.RESULT_CODE,  ResultCode.FAIL);
				returnMap.put(SysConstant.RESULT_MSG, db.getResultMsg());
			}
		}catch(Exception e){
			log.error("门户处理营业受理后台的service/intf.soService/saveCertInfoFromIdentification服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.UPLOAD_CUST_CERTIFICATE, param, db.getReturnlmap(), e);
		}
		
		return returnMap;
	}
}
