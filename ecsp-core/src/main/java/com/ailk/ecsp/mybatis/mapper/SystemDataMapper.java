package com.ailk.ecsp.mybatis.mapper;

import java.util.List;
import java.util.Map;

import com.ailk.ecsp.mybatis.model.Portal;
import com.ailk.ecsp.mybatis.model.RoleService;
import com.ailk.ecsp.mybatis.model.ServiceRole;
import com.ailk.ecsp.mybatis.model.SysParam;

public interface SystemDataMapper {
	
	public List<Portal> queryAllPoral();
	
	public Portal findPortal(String portalCode);
	
	public List<ServiceRole> queryAllRole();
	
	public ServiceRole findRole(String roleCode);
	
	public List<RoleService> queryRoleServices();
	
	public List<RoleService> queryRoleServicesByCode(String roleCode);
	
	public List<SysParam> queryAllSysParam();
	
	public List<SysParam> querySysParam(Map<String,String> param);
	
	public int querySysParamCount();
	
	public int insertSysParam(SysParam sysParam);
	
	public int deleteSysParam(Long paramId);
	
	public int updateSysParam(SysParam sysParam);
	
	public List<Portal> queryPortal(Map<String,String> param);
	
	public int queryPortalCount();
	
	public int insertPortal(Portal portal);
	
	public int updatePortal(Portal portal);
	
	public int deletePortal(Long paramId);
	
	public List<ServiceRole> queryRole(Map<String,String> param);
	
	public int insertRole(ServiceRole role);
	
	public int queryRoleCount();
	
	public int deleteRole(Long roleId);
	
	public int updateRole(ServiceRole role);
}
