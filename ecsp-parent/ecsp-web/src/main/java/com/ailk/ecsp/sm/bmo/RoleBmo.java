package com.ailk.ecsp.sm.bmo;

import java.util.Map;
import com.ailk.ecsp.mybatis.model.ServiceRole;
import com.ailk.ecsp.sm.common.ResultMap;

public interface RoleBmo {
	public Map<String,Object> queryRole(int startIndex,int pageSize);
	
	public ResultMap insertRole(ServiceRole role);
	
	public ResultMap deleteRole(Long roleId);
	
	public ResultMap updateRole(ServiceRole role);
	
	public java.util.List<ServiceRole> queryAllRole();
}
