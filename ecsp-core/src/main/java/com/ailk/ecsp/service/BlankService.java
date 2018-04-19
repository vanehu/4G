package com.ailk.ecsp.service;

import com.al.ec.serviceplatform.client.DataMap;
import com.al.ec.serviceplatform.client.ResultCode;

/**
 * 空白服务
 * @author chylg
 *
 */
public class BlankService extends Service {
		
	@Override
	public DataMap exec(DataMap dataMap,String serviceSerial) {
		dataMap.setResultCode(ResultCode.R_SERV_FAULT);
		dataMap.setResultMsg("服务实现未找到");
		return dataMap;
	}

}
