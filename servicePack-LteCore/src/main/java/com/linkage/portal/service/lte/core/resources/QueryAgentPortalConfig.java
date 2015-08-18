package com.linkage.portal.service.lte.core.resources;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.exception.ExceptionUtils;

import com.ailk.ecsp.core.DataSourceRouter;
import com.ailk.ecsp.service.Service;
import com.ailk.ecsp.util.IConstant;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.exception.ResultConstant;
import com.linkage.portal.service.lte.DataMapUtil;
import com.linkage.portal.service.lte.dao.AgentPortalConfigDAO;
import com.linkage.portal.service.lte.dao.AgentPortalConfigDAOImpl;

/**
 * 查询AGENT_PORTAL_CONFIG配置信息 .
 * <P>
 * @author lianld
 * @version V1.0 2012-6-26
 * @createDate 2012-6-26 下午5:08:02
 * @modifyDate	 lianld 2012-6-26 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
public class QueryAgentPortalConfig extends Service {

    @SuppressWarnings("unchecked")

    public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
		try{
	    	String dbKeyWord = MapUtils.getString(dataMap.getInParam(), IConstant.CON_DB_KEY_WORD);		
	    	AgentPortalConfigDAO configDao = new AgentPortalConfigDAOImpl();
	        String tableName   = MapUtils.getString(dataMap.getInParam(),"tableName","");
	        String columnName  = MapUtils.getString(dataMap.getInParam(),"columnName","");
	        String columnNames[] = columnName.split(",");
	        Map<String,Object> rMap = new HashMap<String,Object>();
	        List rList = new ArrayList();
	        for (int i = 0 ; i < columnNames.length ; i++ ){
	        	Map<String,Object> tmpRetMap = new HashMap<String,Object>();
	            Map<String,Object> paramMap = new HashMap<String,Object>();
	            paramMap.put("tableName", tableName);
	            paramMap.put("columnName", columnNames[i]);
	            List tmpRList = configDao.query(paramMap,dbKeyWord);
	            tmpRetMap.put(columnNames[i], tmpRList);
	            rList.add(tmpRetMap);
	        }
	        rMap.put("result", rList);
	        rMap.put("code", "POR-0000");
	        dataMap.setOutParam(rMap);
	        dataMap.setResultCode("POR-0000");
		}catch (Exception e) {
			DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_SERV_DATABASE_EXCEPTION,ExceptionUtils.getFullStackTrace(e));
		}
        return dataMap;
    }

}
