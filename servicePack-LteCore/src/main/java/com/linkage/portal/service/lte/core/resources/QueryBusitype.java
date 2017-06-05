package com.linkage.portal.service.lte.core.resources;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.exception.ExceptionUtils;

import com.ailk.ecsp.service.Service;
import com.ailk.ecsp.util.IConstant;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.exception.ResultConstant;
import com.linkage.portal.service.lte.DataMapUtil;
import com.linkage.portal.service.lte.dao.CommonDAO;
import com.linkage.portal.service.lte.dao.CommonDAOImpl;

public class QueryBusitype extends Service{
	@SuppressWarnings("unchecked")

    public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
		try{
	    	String dbKeyWord = MapUtils.getString(dataMap.getInParam(), IConstant.CON_DB_KEY_WORD);		
	    	CommonDAO dao = new CommonDAOImpl();
	        Map<String,Object> rMap = new HashMap<String,Object>();
            List tmpRList = dao.querybusitype(dataMap,dbKeyWord);
	        rMap.put("result", tmpRList);
	        rMap.put("code", "POR-0000");
	        dataMap.setOutParam(rMap);
	        dataMap.setResultCode("POR-0000");
		}catch (Exception e) {
			DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_SERV_DATABASE_EXCEPTION,ExceptionUtils.getFullStackTrace(e));
		}
        return dataMap;
    }
}
