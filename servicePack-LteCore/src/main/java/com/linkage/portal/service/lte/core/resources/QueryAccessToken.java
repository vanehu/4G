package com.linkage.portal.service.lte.core.resources;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.exception.ExceptionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ailk.ecsp.service.Service;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.exception.ResultConstant;
import com.linkage.portal.service.lte.dao.AccessTokenDAO;
import com.linkage.portal.service.lte.dao.AccessTokenDAOImpl;

public class QueryAccessToken  extends Service{

    private final Logger log = LoggerFactory.getLogger(this.getClass());    
    
	@SuppressWarnings("unchecked")
	@Override
	public DataMap exec(DataMap dataBus, String serviceSerial) throws Exception {
		Map<String,Object> returnMap = new HashMap<String, Object>();
		dataBus.setResultCode(ResultConstant.R_POR_SUCCESS.getCode());
		dataBus.setResultMsg("调用成功。");
		try{			
			Map<String, Object> paramMap = dataBus.getInParam();
		    if (MapUtils.isEmpty(paramMap)) {
		    	returnMap.put("resultCode", ResultConstant.R_POR_PARAM_MISS.getCode());
				returnMap.put("resultMsg", "paramMap is null");
		        dataBus.setResultCode(ResultCode.R_PARAM_MISS);
		        dataBus.setResultMsg("paramMap is null");
		        return dataBus;
		    }	  
		    AccessTokenDAO atd = new AccessTokenDAOImpl();	
			List<Map<String, Object>> tokenList = atd.queryAccessToken(paramMap);	
			if(tokenList != null && tokenList.size() == 1){
				String accessToken = String.valueOf(tokenList.get(0).get("ACCESS_TOKEN"));
				String staffCode = String.valueOf(tokenList.get(0).get("STAFF_CODE"));
				String areaId = String.valueOf(tokenList.get(0).get("AREA_ID"));
				String provinceCode = String.valueOf(tokenList.get(0).get("PROVINCE_CODE"));
				String channelCode = String.valueOf(tokenList.get(0).get("CHANNEL_CODE"));
				String randowCode = String.valueOf(tokenList.get(0).get("RANDOW_CODE"));				
				returnMap.put("accessToken", accessToken);
				returnMap.put("staffCode", staffCode);
				returnMap.put("areaId", areaId);
				returnMap.put("provinceCode", provinceCode);
				returnMap.put("channelCode", channelCode);
				returnMap.put("randowCode", randowCode);
				returnMap.put("resultCode", ResultConstant.R_POR_SUCCESS.getCode());
				returnMap.put("resultMsg", "成功");
				dataBus.setOutParam(returnMap);
			}else{
				returnMap.put("resultCode", ResultConstant.R_POR_QUERY_NO_DATA.getCode());
				returnMap.put("resultMsg", "令牌失效");
		        dataBus.setResultCode(ResultCode.R_QUERY_NO_DATA);
		        dataBus.setResultMsg("令牌失效");
			}
		}catch(Exception ex){
			log.error("令牌查询接口异常",ex);
			returnMap.put("resultCode", ResultConstant.R_POR_FAIL.getCode());
			returnMap.put("resultMsg", "失败");
			dataBus.setOutParam(returnMap);
			dataBus.setResultCode(ResultConstant.R_POR_FAIL.getCode());
	        dataBus.setResultMsg(ExceptionUtils.getFullStackTrace(ex));
		}
		return dataBus;
	}
}
