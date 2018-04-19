package com.linkage.portal.service.lte.core.system;

import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang.exception.ExceptionUtils;

import com.ailk.ecsp.service.Service;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.common.util.DateUtil;
import com.al.ecs.exception.ResultConstant;
import com.linkage.portal.service.lte.DataMapUtil;

public class Createorderlonger extends Service{
	@SuppressWarnings("unchecked")

    public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
        try{
        	Map<String,Object> rMap = new HashMap<String,Object>();
    		Calendar calendar = Calendar.getInstance();
    		String time = DateUtil.getFormatTimeString(calendar.getTime(), "yyyy-MM-dd HH:mm:ss");
    		rMap.put("time", time);
            dataMap.setOutParam(rMap);
            dataMap.setResultCode("POR-0000");
		}catch (Exception e) {
			DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_POR_UNKNOWN_ERROR,ExceptionUtils.getFullStackTrace(e));
		}
        return dataMap;
    }
}
