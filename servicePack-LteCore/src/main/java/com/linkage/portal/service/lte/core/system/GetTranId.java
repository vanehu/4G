package com.linkage.portal.service.lte.core.system;

import java.util.HashMap;
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

public class GetTranId extends Service{
	@SuppressWarnings("unchecked")

    public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
		try{
	    	String dbKeyWord = MapUtils.getString(dataMap, IConstant.CON_DB_KEY_WORD);		
	    	CommonDAO dao = new CommonDAOImpl();
	        Map<String,Object> rMap = new HashMap<String,Object>();
	        if ("provinceAreaId".equals(IConstant.CON_DB_KEY_WORD)){
		        dataMap.addInParam("seq", "SEQ_CRM_CSB");
	        }else{
	        	dataMap.addInParam("seq", "LTE_TRANSACTIONID_SEQ");
	        }

            long tranId = dao.GetTranId(dataMap.getInParam(),dbKeyWord);
	        rMap.put("TranId", tranId);
	        dataMap.setOutParam(rMap);
	        dataMap.setResultCode("POR-0000");
		}catch (Exception e) {
			DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_SERV_DATABASE_EXCEPTION,ExceptionUtils.getFullStackTrace(e));
		}
        return dataMap;
    }
}
