package com.linkage.portal.service.lte.core.resources;

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

public class SubOrderYSLinfo extends Service{
	@SuppressWarnings("unchecked")

    public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
		try{
	    	String dbKeyWord = MapUtils.getString(dataMap.getInParam(), IConstant.CON_DB_KEY_WORD);		
	    	CommonDAO dao = new CommonDAOImpl();
	        Map<String,Object> rMap = new HashMap<String,Object>();
//	        int flag = 0;
	        rMap = dao.insertorderyslinfo(dataMap.getInParam(),dbKeyWord);
//	        if (flag ==1){
	        	rMap.put("code", ResultConstant.R_POR_SUCCESS.getCode());
	        	rMap.put("message", "更新成功");
//	        }else{
//	        	rMap.put("code", ResultConstant.R_POR_FAIL.getCode());
//	        	rMap.put("message", "更新失败");
//	        }
	        dataMap.setOutParam(rMap);
	        dataMap.setResultCode("POR-0000");
		}catch (Exception e) {
			DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_SERV_DATABASE_EXCEPTION,ExceptionUtils.getFullStackTrace(e));
		}
        return dataMap;
    }
}
