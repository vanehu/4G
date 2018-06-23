package com.ailk.ecsp.mybatis.mapper;

import java.util.List;
import java.util.Map;

import com.ailk.ecsp.core.DataSourceRouter;
import com.ailk.ecsp.mybatis.model.Portal;
import com.ailk.ecsp.mybatis.model.RoleService;
import com.ailk.ecsp.mybatis.model.ServiceRole;
import com.ailk.ecsp.mybatis.model.SysParam;
import com.ailk.ecsp.util.SpringContextUtil;

public class SystemDataMapperImpl {
	public SystemDataMapper srlm = SpringContextUtil.getBean(SystemDataMapper.class);;

	public List<Portal> queryAllPoral(String dbKeyWord) throws Exception{
		DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
		return srlm.queryAllPoral();
	}
	public Portal findPortal(String portalCode,String dbKeyWord) throws Exception{
		DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
		return srlm.findPortal(portalCode);
	}
	
	public List<ServiceRole> queryAllRole(String dbKeyWord)throws Exception{
		DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
		return srlm.queryAllRole();
	}
	
	public ServiceRole findRole(String roleCode,String dbKeyWord)throws Exception{
		DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
		return srlm.findRole(roleCode);
	}
	public List<RoleService> queryRoleServices(String dbKeyWord)throws Exception{
		DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
		return srlm.queryRoleServices();
	}
	public List<RoleService> queryRoleServicesByCode(String roleCode,String dbKeyWord)throws Exception{
		DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
		return srlm.queryRoleServicesByCode(roleCode);
	}
	public List<SysParam> queryAllSysParam(String dbKeyWord)throws Exception{
		DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
		return srlm.queryAllSysParam();
	}
	
	public List<SysParam> querySysParam(Map<String,String> param,String dbKeyWord)throws Exception{
		DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
		return srlm.querySysParam(param);
	}
	
	public int querySysParamCount(String dbKeyWord)throws Exception{
		DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
		return srlm.querySysParamCount();
	}
	
	public int insertSysParam(SysParam sysParam,String dbKeyWord)throws Exception{
		DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
		return srlm.insertSysParam(sysParam);
	}
	public int deleteSysParam(Long paramId,String dbKeyWord)throws Exception{
		DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
		return srlm.deleteSysParam(paramId);
	}
	
	public int updateSysParam(SysParam sysParam,String dbKeyWord)throws Exception{
		DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
		return srlm.updateSysParam(sysParam);
	}
	public List<Portal> queryPortal(Map<String,String> param,String dbKeyWord)throws Exception{
		DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
		return srlm.queryPortal(param);
	}
	
	public int queryPortalCount(String dbKeyWord)throws Exception{
		DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
		return srlm.queryPortalCount();
	}
	
	public int insertPortal(Portal portal,String dbKeyWord)throws Exception{
		DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
		return srlm.insertPortal(portal);
	}
	
	public int updatePortal(Portal portal,String dbKeyWord)throws Exception{
		DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
		return srlm.updatePortal(portal);
	}
	
	public int deletePortal(Long paramId,String dbKeyWord)throws Exception{
		DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
		return srlm.deletePortal(paramId);
	}
	
	public List<ServiceRole> queryRole(Map<String,String> param,String dbKeyWord)throws Exception{
		DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
		return srlm.queryRole(param);
	}
	
	public int insertRole(ServiceRole role,String dbKeyWord)throws Exception{
		DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
		return srlm.insertRole(role);
	}
	
	public int queryRoleCount(String dbKeyWord)throws Exception{
		DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
		return srlm.queryRoleCount();
	}
	
	public int deleteRole(Long roleId,String dbKeyWord)throws Exception{
		DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
		return srlm.deleteRole(roleId);
	}
	
	public int updateRole(ServiceRole role,String dbKeyWord)throws Exception{
		DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
		return srlm.updateRole(role);
	}
}
