package com.ailk.ecsp.sm.bmo;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ailk.ecsp.client.utils.JsonUtil;
import com.ailk.ecsp.mybatis.mapper.SystemDataMapper;
import com.ailk.ecsp.mybatis.model.SysParam;
import com.ailk.ecsp.sm.common.ResultMap;
import com.eviware.soapui.impl.rest.support.RestUtils;



@Service
public class ParamBmoImpl implements ParamBmo {
	@Autowired
	private SystemDataMapper systemDataMapper;
	
	public Map<String,Object> queryParam(int page,int pageSize){
		int count = systemDataMapper.querySysParamCount();
		ResultMap resultMap = new ResultMap();
		if(count>0){
			Map<String,String> param = new HashMap<String,String>();
			int startIndex = (page - 1)*pageSize + 1;
			int endIndex = startIndex + pageSize;
			param.put("startIndex",  startIndex + "");
			param.put("endIndex", endIndex + "");
			List<SysParam> lst  = systemDataMapper.querySysParam(param);
			String jsonstr = JsonUtil.toString(lst);
			resultMap.put("Rows", JsonUtil.toObject(jsonstr, List.class));
			
		}
		resultMap.put("Total", count);
		resultMap.setSuccess();
		return resultMap;
	}

	public ResultMap insertSysParam(SysParam sysParam) {
		ResultMap resultMap = new ResultMap();
		sysParam.setAddTime(new Date());
		sysParam.setUpdateTime(new Date());
		int result = systemDataMapper.insertSysParam(sysParam);
		if(result>0){
			resultMap.setSuccess();
		}else{
			resultMap.setFail("数据保存失败！");
		}
		return resultMap;
	}

	public ResultMap deleteSysParam(Long paramId) {
		ResultMap resultMap = new ResultMap();
		int result = systemDataMapper.deleteSysParam(paramId);
		if(result>=0){
			resultMap.setSuccess();
		}else{
			resultMap.setFail("记录paramId="+paramId+"删除失败");
		}
		return resultMap;
	}

	public ResultMap updateSysParam(SysParam sysParam) {
		ResultMap resultMap = new ResultMap();
		sysParam.setUpdateTime(new Date());
		int result = systemDataMapper.updateSysParam(sysParam);
		if(result>=0){
			resultMap.setSuccess();
		}else{
			resultMap.setFail("参数"+sysParam.getParamName()+"更新失败");
		}
		return resultMap;
	}
	
	
	
}
