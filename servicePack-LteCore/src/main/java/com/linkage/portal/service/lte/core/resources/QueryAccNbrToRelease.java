package com.linkage.portal.service.lte.core.resources;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.exception.ExceptionUtils;

import com.ailk.ecsp.core.DataSourceRouter;
import com.ailk.ecsp.service.Service;
import com.ailk.ecsp.util.IConstant;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.log.Log;
import com.linkage.portal.service.lte.DataMapUtil;
import com.linkage.portal.service.lte.dao.ReserveNumberDAO;
import com.linkage.portal.service.lte.dao.ReserveNumberDAOImpl;

/**
 * 查询AGENT_PORTAL_CONFIG配置信息 .
 * <P>
 * @author xuj
 * @version V1.0 2013-10-22
 * @createDate 2013-10-22 下午5:08:02
 * @copyRight 亚信联创电信EC研发部
 */
public class QueryAccNbrToRelease extends Service {
	private final Log log = Log.getLog(this.getClass());
    @SuppressWarnings("unchecked")

    public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
		String[] params = { "accNbrType" };
		dataMap = DataMapUtil.checkParam(dataMap, params);
		if (StringUtils.isNotBlank(dataMap.getResultCode())) {
			return dataMap;
		}
        try{
	    	Map<String,Object> rMap = new HashMap<String,Object>();
	    	Map<String,Object> numMap = new HashMap<String,Object>();
	    	ReserveNumberDAO dao = new ReserveNumberDAOImpl();
    		dataMap.addInParam("staffId", dataMap.getStaffId());
	        numMap = dao.QueryAccNbrToRelease(dataMap.getInParam());
            rMap.put("result", numMap);
            rMap.put("code", ResultConstant.R_POR_SUCCESS.getCode());
    		dataMap = DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_POR_SUCCESS);
            dataMap.setOutParam(rMap);
        }catch(Exception e){
			DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_SERV_DATABASE_EXCEPTION,ExceptionUtils.getFullStackTrace(e));
        }
        return dataMap;
    }

}
