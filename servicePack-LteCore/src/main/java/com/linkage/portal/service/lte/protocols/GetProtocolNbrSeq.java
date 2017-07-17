package com.linkage.portal.service.lte.protocols;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.exception.ExceptionUtils;

import com.ailk.ecsp.service.Service;
import com.ailk.ecsp.util.IConstant;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.exception.ResultConstant;
import com.linkage.portal.service.lte.DataMapUtil;
import com.linkage.portal.service.lte.dao.ProtocolDAO;
import com.linkage.portal.service.lte.dao.ProtocolDAOImpl;

public class GetProtocolNbrSeq extends Service{
	@SuppressWarnings("unchecked")
    public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
		try{
	    	String dbKeyWord = MapUtils.getString(dataMap, IConstant.CON_DB_KEY_WORD);		
	    	ProtocolDAO dao = new ProtocolDAOImpl();
	        Map<String,Object> rMap = new HashMap<String,Object>();
	        dataMap.addInParam("seq", "SEQ_PROTOCOL_NBR");
	         rMap.put("prtotNbr", dao.getProtocolNbrSeq());
	        dataMap.setOutParam(rMap);
	        dataMap.setResultCode("POR-0000");
		}catch (Exception e) {
			DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_SERV_DATABASE_EXCEPTION,ExceptionUtils.getFullStackTrace(e));
		}
        return dataMap;
    }
}
