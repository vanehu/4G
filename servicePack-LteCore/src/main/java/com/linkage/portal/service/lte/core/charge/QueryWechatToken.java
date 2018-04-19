package com.linkage.portal.service.lte.core.charge;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.MapUtils;

import com.ailk.ecsp.core.DataSourceRouter;
import com.ailk.ecsp.service.Service;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.exception.ResultConstant;
import com.linkage.portal.service.lte.DataMapUtil;
import com.linkage.portal.service.lte.dao.CommonDAO;
import com.linkage.portal.service.lte.dao.CommonDAOImpl;

/**
 * 查询信息 .
 */
public class QueryWechatToken extends Service {

	@Override
	public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
		Map<String,Object> rMap = new HashMap<String,Object>();
		Map<String, Object> paramMap = dataMap.getInParam();
		String provinceName = MapUtils.getString(paramMap, "key", "");
		DataSourceRouter.setRouteFactor(DataSourceRouter.dataKeyMap(provinceName));
    	CommonDAO dao = new CommonDAOImpl();
    	List list;
		try {
			list = dao.queryWechatToken(dataMap.getInParam());
			if(list.size() == 1) {
				rMap.put("result", list.get(0));
		        rMap.put("code", ResultConstant.R_POR_SUCCESS.getCode());
		  	    dataMap = DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_POR_SUCCESS);
		  	    dataMap.setOutParam(rMap);
			} else {
				DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_SERV_DATABASE_EXCEPTION,"未查询到结果");
			}
			
		} catch (Exception e) {
			DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_SERV_DATABASE_EXCEPTION,e.getMessage());
		}
		return dataMap;
	}
	
	

}
