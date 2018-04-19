package com.linkage.portal.service.lte.core.resources;

import org.apache.commons.lang.exception.ExceptionUtils;

import com.ailk.ecsp.service.Service;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.exception.ResultConstant;
import com.linkage.portal.service.lte.DataMapUtil;
import com.linkage.portal.service.lte.dao.CommonDAO;
import com.linkage.portal.service.lte.dao.CommonDAOImpl;

public class Insert_sp_busi_run_log extends Service{
	@SuppressWarnings("unchecked")
	public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
		try{
	    	CommonDAO dao = new CommonDAOImpl();
            dao.insert_sp_busi_run_log(dataMap.getInParam());
	        dataMap.setResultCode("POR-0000");
		}catch (Exception e) {
			DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_SERV_DATABASE_EXCEPTION,ExceptionUtils.getFullStackTrace(e));
		}
        return dataMap;
    }
}
