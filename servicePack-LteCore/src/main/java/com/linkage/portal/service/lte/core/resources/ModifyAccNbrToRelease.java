package com.linkage.portal.service.lte.core.resources;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.exception.ExceptionUtils;

import com.ailk.ecsp.service.Service;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.exception.ResultConstant;
import com.linkage.portal.service.lte.DataMapUtil;
import com.linkage.portal.service.lte.dao.ReserveNumberDAO;
import com.linkage.portal.service.lte.dao.ReserveNumberDAOImpl;

/**
 *  .
 * <P>
 * @author xuj
 * @version V1.0 2013-10-22
 * @createDate 2013-10-22 下午5:08:02
 * @copyRight 亚信联创电信EC研发部
 */
public class ModifyAccNbrToRelease extends Service {

    @SuppressWarnings("unchecked")

    public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
        try{
	    	Map<String,Object> rMap = new HashMap<String,Object>();
	    	Map<String,Object> numMap = new HashMap<String,Object>();
	    	
	        String action = MapUtils.getString(dataMap.getInParam(),"action","");
	        String batchFlag = MapUtils.getString(dataMap.getInParam(),"batchFlag","");
	    	int flag = 0;
	    	if ("0".equals(batchFlag)){
	    		List lt = (List)MapUtils.getObject(dataMap.getInParam(), "param");
	    		for (int i = 0 ; i< lt.size() ; i++){
	    			Map map = (Map)lt.get(i);
	    			map.put("staffId", dataMap.getStaffId());
	    			rMap = modifyAccNbrSingle(map);
	    			if (!(MapUtils.getString(rMap, "code").equals(ResultConstant.R_POR_SUCCESS.getCode()))){
	    				break;
	    			}
	    		}
	    	}else{
	    		dataMap.addInParam("staffId", dataMap.getStaffId());
	    		rMap = modifyAccNbrSingle(dataMap.getInParam());
	    	}
            dataMap.setOutParam(rMap);
            dataMap = DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_POR_SUCCESS);
        }catch(Exception e){
			DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_SERV_DATABASE_EXCEPTION,ExceptionUtils.getFullStackTrace(e));
        }
        return dataMap;
    }
    private Map modifyAccNbrSingle(Map map) throws Exception{
        String accNbr  = MapUtils.getString(map,"accNbr","");
        String accNbrType  = MapUtils.getString(map,"accNbrType","");
        String action = MapUtils.getString(map,"action","");
    	ReserveNumberDAO dao = new ReserveNumberDAOImpl();
        Map rtMap = new HashMap();
        int flag = 0;
        String missParamName =
        		StringUtils.isBlank(action)?"action":
        			StringUtils.isBlank(accNbr)?"accNbr":
        				StringUtils.isBlank(accNbrType)?"accNbrType":"";
        if (StringUtils.isNotBlank(missParamName)) {
        	rtMap.put("code", ResultConstant.R_POR_PARAM_MISS.getCode());
        	rtMap.put("message", missParamName+" is blank");
            return rtMap;
        }
        if ("ADD".equals(action)){
        	flag = dao.insertAccNbr(map);
        }else if ("UPDATE".equals(action)){
        	flag = dao.updateAccNbr(map);
        }
        
        if (flag>0){
        	rtMap.put("code", ResultConstant.R_POR_SUCCESS.getCode());
        	rtMap.put("message", "更新成功");
        }else{
        	rtMap.put("code", ResultConstant.R_POR_FAIL.getCode());
        	rtMap.put("message", accNbr+"更新失败");
        }
    	return rtMap;
    }

}
