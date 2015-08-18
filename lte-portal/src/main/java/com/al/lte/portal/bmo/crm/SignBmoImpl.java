package com.al.lte.portal.bmo.crm;

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
 * 数字签名服务实现类
 * @author linmei
 */
@Service("com.al.lte.portal.bmo.crm.SignBmo")
public class SignBmoImpl implements SignBmo{
	protected final Log log = Log.getLog(getClass());
	@SuppressWarnings("unchecked")
	public Map<String, Object> querySignInfo(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.INTF_DOWN_PRINTFILE, optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
					.getResultCode()))) {
				Map<String, Object> resultMap = db.getReturnlmap();
				Map<String, Object> datamap = new HashMap<String, Object>();
				Object result = resultMap.get("result");
				if (result instanceof List) {
					List<Map<String, Object>> tempList = (List<Map<String, Object>>) result;
					datamap = tempList.get(0);
				} else {
					datamap = (Map<String, Object>) result;
				}
				returnMap.put("code", ResultCode.R_SUCCESS);
				returnMap.putAll(datamap);
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", "电子回执下载服务调用失败");
			}
		} catch(Exception e) {
			log.error("门户处理营业受理的service/intf.fileOperateService/downLoadPrintFileFromFtp服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.FTP_DOWNLOAD_ERROR, dataBusMap, db.getReturnlmap(), e);
		}
		return returnMap;
	}

}
