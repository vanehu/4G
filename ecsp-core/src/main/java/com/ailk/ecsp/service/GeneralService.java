package com.ailk.ecsp.service;

import java.util.Map;

import com.ailk.ecsp.intf.webservice.WSClient;
import com.ailk.ecsp.util.MapUtil;
import com.al.ec.serviceplatform.client.DataMap;

/**
 * 通用服务，用于适配通用的webservic接口
 * @author 陈源龙
 *
 */
public class GeneralService extends Service {

		
	@Override
	public DataMap exec(DataMap db,String serviceSerial) {
		Map retMap = null;
		retMap = WSClient.getInstance().callWS(db.getServiceCode(),db.getInParam());
		String resultCode = MapUtil.asStr(retMap, "resultCode");
		String resultMsg = MapUtil.asStr(retMap, "resultMsg");
		db.setOutParam(retMap);
		db.setResultCode(resultCode);
		db.setResultMsg(resultMsg);
		return db;
	}

}
