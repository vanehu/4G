package com.linkage.portal.service.lte.core.system;

import java.util.Map;

import org.apache.commons.collections.MapUtils;

import com.ailk.ecsp.service.Service;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.exception.ResultConstant;
import com.linkage.portal.service.lte.dao.AreaDAO;
import com.linkage.portal.service.lte.dao.AreaDAOImpl;

public class QueryAreaService extends Service{
	
	public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception{
		try{
			String queryType = MapUtils.getString(dataMap.getInParam(), "queryType", "");
			if("queryAreaInfo".equals(queryType)){
				String areaId = MapUtils.getString(dataMap.getInParam(), "areaId", "");
				AreaDAO areaDAO = new AreaDAOImpl();
				Map<String, Object> areaInfo = areaDAO.queryAreaInfo(areaId);
				String reAreaId = MapUtils.getString(areaInfo, "COMMON_REGION_ID", "");
				String areaName = MapUtils.getString(areaInfo, "REGION_NAME", "");
				String regionType = MapUtils.getString(areaInfo, "REGION_TYPE", "");
				String upRegionId = MapUtils.getString(areaInfo, "UP_REGION_ID", "");
				String idPrefix = MapUtils.getString(areaInfo, "ID_PREFIX", "");
				String areaLevel = MapUtils.getString(areaInfo, "AREA_LEVEL", "");
				String zipCode = MapUtils.getString(areaInfo, "ZIP_CODE", "");
				String zoneNumber = MapUtils.getString(areaInfo, "ZONE_NUMBER", "");
				areaInfo.clear();
				areaInfo.put("areaId", reAreaId);
				areaInfo.put("areaName", areaName);
				areaInfo.put("regionType", regionType);
				areaInfo.put("upRegionId", upRegionId);
				areaInfo.put("idPrefix", idPrefix);
				areaInfo.put("areaLevel", areaLevel);
				areaInfo.put("zipCode", zipCode);
				areaInfo.put("zoneNumber", zoneNumber);
				dataMap.setOutParam(areaInfo);
				dataMap.setResultCode(ResultConstant.R_POR_SUCCESS.getCode());
			}
		}catch(Exception e){
            dataMap.setResultCode(ResultConstant.R_POR_FAIL.getCode());
            dataMap.setResultMsg("获取地区异常");
		}
		return dataMap;
	}

}
