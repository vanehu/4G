package com.linkage.portal.service.lte.core.resources;

import java.util.Map;
import org.apache.commons.lang.exception.ExceptionUtils;
import com.ailk.ecsp.service.Service;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.exception.ResultConstant;
import com.linkage.portal.service.lte.DataMapUtil;
import com.linkage.portal.service.lte.dao.CommonDAO;
import com.linkage.portal.service.lte.dao.CommonDAOImpl;

public class QueryBlueToothKey extends Service{
	
	@SuppressWarnings("unchecked")
    public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
		try{
	    	CommonDAO dao = new CommonDAOImpl();
	    	Map resMap = dao.queryBlueToothKey(dataMap.getInParam());
	        dataMap.setOutParam(resMap);
	        dataMap.setResultCode("POR-0000");
		}catch (Exception e) {
			DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_SERV_DATABASE_EXCEPTION,ExceptionUtils.getFullStackTrace(e));
		}
        return dataMap;
    }
}
