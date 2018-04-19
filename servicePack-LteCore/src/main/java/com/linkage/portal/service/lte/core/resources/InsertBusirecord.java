package com.linkage.portal.service.lte.core.resources;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang.exception.ExceptionUtils;

import com.ailk.ecsp.service.Service;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.exception.ResultConstant;
import com.linkage.portal.service.lte.DataMapUtil;

public class InsertBusirecord extends Service {
	@SuppressWarnings("unchecked")

    public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
		try{
	        Map<String,Object> rMap = new HashMap<String,Object>();
        	rMap.put("code", ResultConstant.R_POR_SUCCESS.getCode());
        	rMap.put("message", "成功");
        	if("购手机".equals(dataMap.getInParam().get("busitype").toString())){
        		dataMap.put("remark", "购手机");
        	}else if("办套餐".equals(dataMap.getInParam().get("busitype").toString())){
        		dataMap.put("remark", "办套餐");
        	}else if("选号码".equals(dataMap.getInParam().get("busitype").toString())){
        		dataMap.put("remark", "选号码");
        	}
	        dataMap.setOutParam(rMap);
	        dataMap.setResultCode("POR-0000");
		}catch (Exception e) {
			DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_SERV_DATABASE_EXCEPTION,ExceptionUtils.getFullStackTrace(e));
		}
        return dataMap;
    }
}
