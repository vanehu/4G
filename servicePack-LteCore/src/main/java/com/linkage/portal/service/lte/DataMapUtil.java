package com.linkage.portal.service.lte;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;

import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.exception.ServResult;

public class DataMapUtil {
	public static DataMap setDataMapResult(DataMap dm, ServResult srt) {
		dm.setResultCode(srt.getCode());
		dm.setResultMsg(srt.getMsg(), "");
		return dm;
	}
	
	public static DataMap setDataMapResult(DataMap dm, ServResult srt , String msg) {
		dm.setResultCode(srt.getCode());
		dm.setResultMsg(srt.getMsg()+msg, "");
		return dm;
	}

	public static DataMap checkParam(DataMap dm, String[] params) throws Exception{
		for (String paramKey : params) {
			String paramValue = MapUtils.getString(dm.getInParam(), paramKey);
			if (StringUtils.isBlank(paramValue)) {
				dm.setResultCode(ResultConstant.R_POR_PARAM_MISS.getCode());
				dm.setResultMsg(ResultConstant.R_POR_PARAM_MISS.getMsg()+paramKey);
				return dm;
			}
		}
		return dm;
	}
}
