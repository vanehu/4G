package com.ailk.ecsp.core.manager;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.ailk.ecsp.core.DataRepository;
import com.ailk.ecsp.core.DataSourceRouter;
import com.ailk.ecsp.core.SysConstant;
import com.ailk.ecsp.mybatis.mapper.SystemDataMapper;
import com.ailk.ecsp.mybatis.mapper.SystemDataMapperImpl;
import com.ailk.ecsp.mybatis.model.Portal;
import com.ailk.ecsp.mybatis.model.RoleService;
import com.ailk.ecsp.mybatis.model.ServiceRole;
import com.ailk.ecsp.mybatis.model.SysParam;
import com.ailk.ecsp.util.SpringContextUtil;
import com.al.ecs.common.util.PropertiesUtils;

@Component
public class SystemManagerImpl implements SystemManager{
	@Autowired
	protected SystemDataMapper systemDataMapper;
	protected SystemDataMapperImpl systemDataMapperImpl = new SystemDataMapperImpl();

	
	public void initialize(String dbKeyWord) throws Exception{
		loadSysParam(dbKeyWord);
		loadPortal(dbKeyWord);
		loadRoles(dbKeyWord);
		loadRoleToService(dbKeyWord);
	}
	
	/**
	 * 加载门户信息
	 * @throws Exception 
	 */
	public void loadPortal(String dbKeyWord) throws Exception{
		List<Portal> list = systemDataMapperImpl.queryAllPoral(dbKeyWord);
		for (Portal portal : list) {
			DataRepository.getInstence().addPortal(portal);
		}
		
	}
	
	/**
	 * 重新加载门户信息
	 * @throws Exception 
	 */
	public void reloadPortal(String dbKeyWord) throws Exception{
		DataRepository.getInstence().getAllPortal().clear();
		loadPortal(dbKeyWord);		
	}
	
	/**
	 * 加载角色信息
	 * @throws Exception 
	 */
	public void loadRoles(String dbKeyWord) throws Exception{
		List<ServiceRole> list = systemDataMapperImpl.queryAllRole(dbKeyWord); 
		for (ServiceRole role : list) {
			DataRepository.getInstence().addRole(role);
		}
	}
	
	/**
	 * 重新加载角色信息
	 * @throws Exception 
	 */
	public void reloadRoles(String dbKeyWord) throws Exception{
		DataRepository.getInstence().clearAllRole();
		loadRoles(dbKeyWord);
	}
	
	/**
	 * 加载角色服务列表
	 * @throws Exception 
	 */
	public void loadRoleToService(String dbKeyWord) throws Exception{
	
		List<RoleService> list = systemDataMapperImpl.queryRoleServices(dbKeyWord);
		for (RoleService roleService : list) {
			ArrayList<String> servList = DataRepository.getInstence().getRoleToService(roleService.getRoleCode());
			if(servList == null){
				servList = new ArrayList<String>();
			}
			servList.add(roleService.getServiceCode());
			DataRepository.getInstence().getAllRoleToService().put(roleService.getRoleCode(), servList);
		}
	}
	
	/**
	 * 重新加载角色服务列表
	 * @throws Exception 
	 */
	public void reloadRoleToService(String dbKeyWord) throws Exception{
		DataRepository.getInstence().getAllRoleToService().clear();
		loadRoleToService(dbKeyWord);
	}

	
	/**
	 * 加载系统参数
	 * @throws Exception 
	 */
	public void loadSysParam(String dbKeyWord) throws Exception{
		if(StringUtils.isBlank(dbKeyWord)){
			dbKeyWord = DataSourceRouter.DEFAULT_DATASOURCE_KEY;
		}
		
		//先加载配置文件中优先读取的配置
		PropertiesUtils propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
		String[] ary = SysConstant.CON_PROPERTIES_KEY.split(",");
		propertiesUtils.clear();
		DataRepository.getInstence().clearSysParam(dbKeyWord);
		for(String item: ary){
			String keyValue = propertiesUtils.getMessage(item);
			if (StringUtils.isNotBlank(keyValue)){
				keyValue = keyValue.trim();
				DataRepository.getInstence().addSysParam(dbKeyWord,SysConstant.CON_SYS_PARAM_GROUP_SYS_PARAM+SysConstant.CON_SEPARATOR_SYS_PARAM_GROUP+item, keyValue);
			}
		}
		effectConfigSysParam();
		
		//后加载数据库配置表中的配置
		DataSourceRouter.setRouteFactor(dbKeyWord);
		try{
			List<SysParam> list = systemDataMapperImpl.queryAllSysParam(dbKeyWord);
			for (SysParam sysParam : list) {
				String value = sysParam.getParamValue();
				if (SysConstant.CON_PROPERTIES_KEY.indexOf(sysParam.getParamCode())==-1){
					DataRepository.getInstence().addSysParam(dbKeyWord,sysParam.getGroupId()+SysConstant.CON_SEPARATOR_SYS_PARAM_GROUP+sysParam.getParamCode(), value);
				}
			}
		}catch (Exception e) {
			// TODO: handle exception
		}
	}
	
	/**
	 * 使配置文件中的系统参数生效
	 */
	private void effectConfigSysParam(){
		//重新设置配置文件中的默认数据源
//		DataSourceRouter.setConfigDataSourceKey(DataRepository.getInstence().getSysParamValue(DataSourceRouter.CONFIG_DATASOURCE_PROPERTY_NAME, SysConstant.CON_SYS_PARAM_GROUP_SYS_PARAM));
	}
	
	/**
	 * 重新加载系统参数
	 * @throws Exception 
	 */
	public void reloadSysParam(String dbKeyWord) throws Exception{
		loadSysParam(dbKeyWord);
	}
}
