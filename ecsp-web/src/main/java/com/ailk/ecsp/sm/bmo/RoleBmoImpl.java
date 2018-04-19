package com.ailk.ecsp.sm.bmo;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ailk.ecsp.client.utils.JsonUtil;
import com.ailk.ecsp.mybatis.mapper.SystemDataMapper;
import com.ailk.ecsp.mybatis.model.Portal;
import com.ailk.ecsp.mybatis.model.ServiceRole;
import com.ailk.ecsp.mybatis.model.SysParam;
import com.ailk.ecsp.sm.common.ResultMap;



@Service
public class RoleBmoImpl implements RoleBmo {
	@Autowired
	private SystemDataMapper systemDataMapper;
	
	public Map<String,Object> queryRole(int page,int pageSize){
		int count = systemDataMapper.queryRoleCount();
		ResultMap resultMap = new ResultMap();
		if(count>0){
			Map<String,String> param = new HashMap<String,String>();
			int startIndex = (page - 1)*pageSize + 1;
			int endIndex = startIndex + pageSize;
			param.put("startIndex",  startIndex + "");
			param.put("endIndex", endIndex + "");
			List<ServiceRole> lst  = systemDataMapper.queryRole(param);
			String jsonstr = JsonUtil.toString(lst);
			resultMap.put("Rows", JsonUtil.toObject(jsonstr, List.class));
			
		}
		resultMap.put("Total", count);
		resultMap.setSuccess();
		return resultMap;
	}

	public ResultMap insertRole(ServiceRole role) {
		ResultMap resultMap = new ResultMap();
		role.setCreatTime(new Date());
		int result = systemDataMapper.insertRole(role);
		if(result>0){
			resultMap.setSuccess();
		}else{
			resultMap.setFail("数据保存失败！");
		}
		return resultMap;
	}

	public ResultMap deleteRole(Long roleId) {
		ResultMap resultMap = new ResultMap();
		int result = systemDataMapper.deleteRole(roleId);
		if(result>=0){
			resultMap.setSuccess();
		}else{
			resultMap.setFail("记录roleId="+roleId+"删除失败");
		}
		return resultMap;
	}

	public ResultMap updateRole(ServiceRole role) {
		ResultMap resultMap = new ResultMap();
		int result = systemDataMapper.updateRole(role);
		if(result>=0){
			resultMap.setSuccess();
		}else{
			resultMap.setFail("参数"+role.getRoleName()+"更新失败");
		}
		return resultMap;
	}

	public List<ServiceRole> queryAllRole() {
		return systemDataMapper.queryAllRole();
	}
	
	
}
