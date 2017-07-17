package com.linkage.portal.service.lte.core.system;

import java.util.Map;

import org.apache.commons.collections.MapUtils;

import com.ailk.ecsp.service.Service;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.exception.ResultConstant;
import com.linkage.portal.service.lte.dao.AreaDAO;
import com.linkage.portal.service.lte.dao.AreaDAOImpl;

public class QueryParentAreaInfo extends Service{
	
	public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception{
		try{
			String childAreaId = MapUtils.getString(dataMap.getInParam(), "childAreaId", "");
			AreaDAO areaDAO = new AreaDAOImpl();
			Map<String, Object> parentAreaInfo = areaDAO.queryParentAreaInfo(childAreaId);
			String areaId = MapUtils.getString(parentAreaInfo, "COMMON_REGION_ID", "");
			String areaName = MapUtils.getString(parentAreaInfo, "REGION_NAME", "");
			parentAreaInfo.clear();
			parentAreaInfo.put("areaId", areaId);
			parentAreaInfo.put("areaName", areaName);
			dataMap.setOutParam(parentAreaInfo);
			dataMap.setResultCode(ResultConstant.R_POR_SUCCESS.getCode());
		}catch(Exception e){
            dataMap.setResultCode(ResultConstant.R_POR_FAIL.getCode());
            dataMap.setResultMsg("获取父级地区异常");
		}
		return dataMap;
	}

}
