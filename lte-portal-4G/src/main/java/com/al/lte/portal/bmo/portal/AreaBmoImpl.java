package com.al.lte.portal.bmo.portal;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.Cache;
import org.springframework.cache.ehcache.EhCacheCacheManager;
import org.springframework.stereotype.Service;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.exception.BusinessException;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.model.SessionStaff;

/**
 * 地区 .
 * <P>
 * 
 * @author bianxw
 * @version V1.0 2013-10-17
 * @createDate 2013-10-17 下午3:02:37
 * @modifyDate bianxw 2013-10-17 <BR>
 * @copyRight 亚信联创电信EC产品部
 */
@Service("com.al.ecs.portal.agent.bmo.portal.AreaBmo")
public class AreaBmoImpl implements AreaBmo{
	/*
	@Autowired
    @Qualifier("ehCacheManager")
    EhCacheCacheManager ehCacheManager;
	*/
	
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryAreaTreeByParentAreaId(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
    	throws Exception{
		
		Map<String, Object> resultMap = new HashMap<String, Object>();
		List<Map<String, Object>> list = null;
		if(dataBusMap.get("upRegionId")==null){
			resultMap.put("code", "1");
            resultMap.put("areaTree", list);
            return resultMap;
		}
		/*
		String upRegionId = dataBusMap.get("upRegionId").toString();
		String cacheKey = "queryAreaTreeByParentAreaId_" + upRegionId;
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
        try {
        	DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.QUERY_AREA_TREE_BY_PARENTID,
	                optFlowNum, sessionStaff);
        	Map<String, Object> returnMap = db.getReturnlmap();
            if(returnMap!=null){
            	if(ResultCode.R_SUCC.equals(returnMap.get("resultCode"))){
            		Map data = (Map)returnMap.get("result");
            		list = (ArrayList<Map<String, Object>>) MapUtils.getObject(data, "areaTree",
                			new ArrayList<Map<String, Object>>());
            		//缓存地区树
                	if (list.size() > 0) {
                        //cache.put(cacheKey, list);
                    }
                	resultMap.put("code", "0");
                    resultMap.put("areaTree", list);
            	}else{
            		resultMap.put("code", "1");
                    resultMap.put("message", "地区树查询失败,未获取到地区数据");
            	}
            }else{
            	resultMap.put("code", "2");
                resultMap.put("message", "地区树查询失败,未获取到地区数据");
            }
        } catch (Exception e) {
            resultMap.put("code", "3");
            resultMap.put("message", "地区数接口调用异常");
        }
        return resultMap;
	}
	
}
