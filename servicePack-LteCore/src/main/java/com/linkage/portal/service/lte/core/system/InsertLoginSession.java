package com.linkage.portal.service.lte.core.system;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.exception.ExceptionUtils;

import com.ailk.ecsp.service.Service;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.exception.ResultConstant;
import com.linkage.portal.service.lte.DataMapUtil;
import com.linkage.portal.service.lte.dao.CommonDAO;
import com.linkage.portal.service.lte.dao.CommonDAOImpl;

public class InsertLoginSession  extends Service{
	@SuppressWarnings("unchecked")

    public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
		try{
	    	CommonDAO dao = new CommonDAOImpl();
	        Map<String,Object> rMap = new HashMap<String,Object>();
            List rList = dao.insertloginsession(dataMap.getInParam());
	        rMap.put("rList", rList);
	        dataMap.setOutParam(rMap);
	        dataMap.setResultCode("POR-0000");
		}catch (Exception e) {
			DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_SERV_DATABASE_EXCEPTION,ExceptionUtils.getFullStackTrace(e));
		}
        return dataMap;
    }
}
