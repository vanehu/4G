package com.ailk.ecsp.sm.bmo;

import java.util.Map;

import com.ailk.ecsp.mybatis.model.SysParam;
import com.ailk.ecsp.sm.common.ResultMap;

public interface ParamBmo {
	public Map<String,Object> queryParam(int startIndex,int pageSize);
	
	public ResultMap insertSysParam(SysParam sysParam);
	
	public ResultMap deleteSysParam(Long paramId);
	
	public ResultMap updateSysParam(SysParam sysParam);
}
