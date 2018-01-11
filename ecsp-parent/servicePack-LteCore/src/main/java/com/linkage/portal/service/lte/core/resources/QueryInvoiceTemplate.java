package com.linkage.portal.service.lte.core.resources;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;

import com.ailk.ecsp.core.DataSourceRouter;
import com.ailk.ecsp.service.Service;
import com.ailk.ecsp.util.IConstant;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.exception.ResultConstant;
import com.linkage.portal.service.lte.DataMapUtil;
import com.linkage.portal.service.lte.dao.CommonDAO;
import com.linkage.portal.service.lte.dao.CommonDAOImpl;

/**
 * 查询AGENT_PORTAL_CONFIG配置信息 .
 * <P>
 * @author xuj
 * @version V1.0 2013-12-16
 * @createDate 2013-12-16 下午5:08:02
 * @copyRight 亚信联创电信EC研发部
 */
public class QueryInvoiceTemplate extends Service {

    @SuppressWarnings("unchecked")

    public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
		//String[] params = { "areaId" };
		//dataMap = DataMapUtil.checkParam(dataMap, params);
		//if (StringUtils.isNotBlank(dataMap.getResultCode())) {
		//	return dataMap;
		//}
        try{
	    	Map<String,Object> rMap = new HashMap<String,Object>();
	    	List list = new ArrayList();
	    	CommonDAO dao = new CommonDAOImpl();
            String dbKeyWord = MapUtils.getString(dataMap.getInParam(), IConstant.CON_DB_KEY_WORD);
            if (StringUtils.isBlank(dbKeyWord)){
                DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
            }
	    	list = dao.queryInvoiceTemplate(dataMap.getInParam(),dbKeyWord);
            rMap.put("result", list);
            rMap.put("code", ResultConstant.R_POR_SUCCESS.getCode());
    		dataMap = DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_POR_SUCCESS);
            dataMap.setOutParam(rMap);
        }catch(Exception e){
			DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_SERV_DATABASE_EXCEPTION,e.getMessage());
        }
        return dataMap;
    }

}
