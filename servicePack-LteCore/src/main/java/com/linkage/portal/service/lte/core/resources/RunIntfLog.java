package com.linkage.portal.service.lte.core.resources;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;

import com.ailk.ecsp.service.Service;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.common.util.DateUtil;

/**
 * 日志运行 .
 * <P>
 * @author xuj
 * @version V1.0 2013-10-14
 * @createDate 2013-10-14
 * @modifyDate	 xuj 2013-10-14 <BR>
 * @copyRight 亚信联创电信EC研发部
 */
public class RunIntfLog extends Service {

    @SuppressWarnings("unchecked")

    public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
    	String remark = MapUtils.getString(dataMap.getInParam(), "remark");
    	Object outObj = MapUtils.getObject(dataMap.getInParam(), "outParam");
    	Object inObj = MapUtils.getObject(dataMap.getInParam(), "inParam");
    	String beginDate = MapUtils.getString(dataMap.getInParam(), "beginDate");
    	String endDate = MapUtils.getString(dataMap.getInParam(), "endDate");
    	String logId = MapUtils.getString(dataMap.getInParam(), "logId", "");
    	String logSeqId = MapUtils.getString(dataMap.getInParam(), "logSeqId", "");
    	String errorCode = MapUtils.getString(dataMap.getInParam(), "errorCode", "");
    	Map inMap = new HashMap();
    	Map outMap = new HashMap();
    	String resultCode = "0";
    	if (inObj instanceof Map){
    		inMap = (Map) inObj;
    	}else if (inObj != null) {
    		inMap.put("inParam", inObj);
    	}
    	if (outObj instanceof Map){
        	outMap = (Map) outObj;
        	resultCode = MapUtils.getString(outMap, "resultCode");
    	}else if (outObj != null) {
    		outMap.put("outParam", outObj);
    	}
    	dataMap.setResultCode(resultCode);
    	dataMap.setInParam(inMap);
    	dataMap.setOutParam(outMap);
    	if (beginDate!=null){
        	dataMap.put("beginDate", DateUtil.longToDate(Long.valueOf(beginDate)));
    	}
    	if (endDate!=null){
        	dataMap.put("endDate", DateUtil.longToDate(Long.valueOf(endDate)));
    	}
    	if (StringUtils.isNotEmpty(logId)) {
    		dataMap.put("logId", logId);
    	}
    	dataMap.put("remark", remark);
    	dataMap.put("logSeqId", logSeqId);
    	dataMap.put("errorCode", errorCode);
        return dataMap;
    }

}
