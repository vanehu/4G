package com.al.lte.portal.bmo.system;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Service;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.ServiceClient;
import com.al.lte.portal.model.SessionStaff;
import com.esotericsoftware.minlog.Log;

/**
 * 数据权限 .
 * <P>
 * 
 * @author bianxw
 * @version V1.0 2013-10-17
 * @createDate 2013-10-17 下午3:02:37
 * @modifyDate bianxw 2013-10-17 <BR>
 * @copyRight 亚信联创电信EC产品部
 */
@Service("com.al.lte.portal.bmo.system.AuthenticBmo")
public class AuthenticBmoImpl implements AuthenticBmo{
	
	
	public Map<String,Object> queryAuthenticDataRangeAreaData(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
	throws Exception{

		Map<String, Object> resultMap = new HashMap<String, Object>();
		/*
		String parentAreaId = dataBusMap.get("areaId").toString();
		String cacheKey = "authenticDataRange_area_" + parentAreaId;
        Cache cache = ehCacheManager.getCache("otherCahce");
        if (null != cache.get(cacheKey)) {
            list = (ArrayList<Map<String, Object>>) cache.get(cacheKey).get();
        }
        if (CollectionUtils.isNotEmpty(list)) {
            resultMap.put("code", "0");
            resultMap.put("areaTree", list);
            return resultMap;
        }
		*/
		List<Map<String, Object>> list = null;
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.QUERY_OPERAT_AREA_RANGE,
                optFlowNum, sessionStaff);
		try{
			resultMap.put("code", -1);
			resultMap.put("message", db.getResultMsg());
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> returnMap = db.getReturnlmap();
				resultMap.put("code", 1);
				resultMap.put("message", returnMap.get("resultMsg"));
				if(ResultCode.R_SUCC.equals(returnMap.get("resultCode"))){
					Object data = returnMap.get("result"); 
            		if(data instanceof List){
            			list = (ArrayList<Map<String, Object>>) data;
            		}
            		//缓存地区树
                	if (list.size() > 0) {
                        //cache.put(cacheKey, list);
                    }
                	resultMap.put("code", "0");
                    resultMap.put("areaTree", list);
				}
			}
			return resultMap ;
		}catch(Exception e){
			throw new BusinessException(ErrorCode.OPERAT_AREA_RANGE,dataBusMap,db.getReturnlmap(), e);
		}
	}
	
	public Map<String,Object> queryAllDataRangeAreaData(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception{

				Map<String, Object> resultMap = new HashMap<String, Object>();
				List<Map<String, Object>> list = null;
				//DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.QUERY_OPERAT_AREA_RANGE,optFlowNum, sessionStaff);
				DataBus db = ServiceClient.callService(dataBusMap, PortalServiceCode.SERVICE_QUERY_AREA_TREE_BY_PARENT_AREA_ID,optFlowNum, sessionStaff);
				try{
					resultMap.put("code", -1);
					resultMap.put("message", db.getResultMsg());
					if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db.getResultCode()))) {
						Map<String, Object> returnMap = db.getReturnlmap();
						
						resultMap.put("code", 1);
						resultMap.put("message", returnMap.get("resultMsg"));
						if(ResultCode.R_SUCCESS.equals(returnMap.get("code"))){
							Object mapObj = returnMap.get("result");
							 if(mapObj!=null && mapObj instanceof Map){
									Map result = (Map)mapObj;
									if(result.get("areaTree")!=null){
										Object treeObj = result.get("areaTree");
										if(treeObj!=null&&treeObj instanceof List){
											list = (ArrayList<Map<String, Object>>) treeObj;
											for(Map row:list){
												String areaLeve = row.get("areaLevel")==null?"":row.get("areaLevel").toString();
												int leve = 0 ;
												try{
													leve = Integer.parseInt(areaLeve);
													leve = leve + 1 ;
												}catch(Exception e){
													Log.error("区划层级数有问题", e);
												}
												row.put("regionCode",row.get("zoneNumber"));
												row.put("areaLevel", leve);
											}
										}
									}
								}
			                    //缓存地区树
			                	if (list.size() > 0) {
			                        //cache.put(cacheKey, list);
			                    }
			                	resultMap.put("code", "0");
			                    resultMap.put("areaTree", list);
						}
					}
					return resultMap ;
				}catch(Exception e){
					throw new BusinessException(ErrorCode.OPERAT_AREA_RANGE,dataBusMap,db.getReturnlmap(), e);
				}
			}
			
}
