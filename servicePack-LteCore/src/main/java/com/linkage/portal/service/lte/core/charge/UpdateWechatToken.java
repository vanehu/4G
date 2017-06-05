package com.linkage.portal.service.lte.core.charge;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;

import com.ailk.ecsp.core.DataSourceRouter;
import com.ailk.ecsp.service.Service;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.exception.ResultConstant;
import com.linkage.portal.service.lte.DataMapUtil;
import com.linkage.portal.service.lte.dao.CommonDAO;
import com.linkage.portal.service.lte.dao.CommonDAOImpl;
import com.linkage.portal.service.lte.dao.PayDao;
import com.linkage.portal.service.lte.dao.PayDaoImpl;

/**
 * 查询信息 .
 */
public class UpdateWechatToken extends Service {

	   @Override
	    public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
/*	        String[] params = {"tokenId"};
	        dataMap = DataMapUtil.checkParam(dataMap, params);
	        if (StringUtils.isNotBlank(dataMap.getResultCode())) {
	            return dataMap;
	        }*/

	        Map<?, ?> paramMap = dataMap.getInParam();
	        String provinceName = MapUtils.getString(paramMap, "key", "");
			DataSourceRouter.setRouteFactor(DataSourceRouter.dataKeyMap(provinceName));
	        CommonDAO dao = new CommonDAOImpl();
	        if (dao.updateWechatToken(paramMap) > 0) {
	            dataMap.setResultCode(ResultConstant.R_POR_SUCCESS.getCode());
	            dataMap.setResultMsg("成功");
	        } else {
	            dataMap.setResultCode(ResultConstant.R_POR_FAIL.getCode());
	            dataMap.setResultMsg("失败");
	        }

	        return dataMap;
	    }
}
