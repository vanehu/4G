package com.ailk.ecsp.mybatis.mapper;

import java.util.List;

import com.ailk.ecsp.mybatis.model.RoleService;
import com.ailk.ecsp.mybatis.model.ServiceRole;

public interface RoleServiceMapper {
	public List<ServiceRole> queryRole(Long serviceId);
	
	public int insert(RoleService record);
	
	public int batchInsert(List<RoleService> list);
	
	public int deleteRoleService(Long serviceId);
}