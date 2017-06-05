package com.ailk.ecsp.core;

import javax.sql.DataSource;
import org.apache.commons.lang.StringUtils;
import org.springframework.context.ApplicationContext;
import org.springframework.jdbc.core.JdbcTemplate;
import com.ailk.ecsp.core.manager.PackManager;
import com.ailk.ecsp.core.manager.PackManagerImpl;
import com.ailk.ecsp.core.manager.ServiceManager;
import com.ailk.ecsp.core.manager.ServiceManagerImpl;
import com.ailk.ecsp.core.manager.SystemManager;
import com.ailk.ecsp.core.manager.SystemManagerImpl;
import com.ailk.ecsp.intf.webservice.WSClient;
import com.ailk.ecsp.jdbc.ConnectHolder;
import com.ailk.ecsp.mybatis.WebParam;
import com.al.ecs.common.util.PropertiesUtils;

public class PlatformBoot {
	private ApplicationContext ctx;
	private SystemManager systemManager;
	private PackManager packManager;
	private ServiceManager serviceManager;
	public PlatformBoot(ApplicationContext applicationContext){
		this.ctx = applicationContext;
		systemManager = ctx.getBean(SystemManagerImpl.class);
		packManager = ctx.getBean(PackManagerImpl.class);
		serviceManager = ctx.getBean(ServiceManagerImpl.class);
	}
	
	public int start() throws Exception{
		initDefaultWebParam();
		ConnectHolder.setDataSource((DataSource)ctx.getBean("serviceDataSource"));
		ConnectHolder.setJdbc((JdbcTemplate)ctx.getBean("jdbcTemplate"));
		initConfigDataSource();
		systemManager.initialize("");
		packManager.initialize();
		serviceManager.initialize();
		WSClient.getInstance();
		return 0;
	}
	
	private void initConfigDataSource(){
		try {
			//读取配置文件中的默认数据源并设置为默认数据源
//			PropertiesUtils propertiesUtils = (PropertiesUtils) ctx.getBean("propertiesUtils");
//			String configDataSourceKey = propertiesUtils.getMessage(DataSourceRouter.CONFIG_DATASOURCE_PROPERTY_NAME);
//			DataSourceRouter.setConfigDataSourceKey(configDataSourceKey);
			DataSourceRouter.setRouteFactor("");
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	private void initDefaultWebParam(){
		
		WebParam webParam = DataRepository.getInstence().getWebParam();
		String runLevel = webParam.getRunLevel();
		String checkPermission = webParam.getCheckPermission();
		String serviceLibPath = webParam.getServiceLibPath();
		String log4jPath = webParam.getLog4jConfigLocation();
		String analogDataPath = webParam.getAnalogDataPath();
		
		if(StringUtils.isBlank(runLevel)){
			runLevel = SysConstant.LEVEL_PRODUCT;
			DataRepository.getInstence().getWebParam().setRunLevel(runLevel);
		}
		if(StringUtils.isBlank(checkPermission)){
			checkPermission = SysConstant.CHECK_PERMISSION_YES;
			DataRepository.getInstence().getWebParam().setCheckPermission(checkPermission);
		}
		if(StringUtils.isBlank(serviceLibPath)){
			serviceLibPath = "D:/serviceLib";
			DataRepository.getInstence().getWebParam().setServiceLibPath(serviceLibPath);
		}
		if(StringUtils.isBlank(log4jPath)){
			log4jPath = "classpath:config/log4j.properties";
			DataRepository.getInstence().getWebParam().setLog4jConfigLocation(log4jPath);
		}
		if(StringUtils.isBlank(analogDataPath)){
			analogDataPath = "D:/ecsp_analog_data/";
			DataRepository.getInstence().getWebParam().setAnalogDataPath(analogDataPath);
		}
	}
	
	/**
	 * 重新加载包和服务.
	 * 服务和包需要都重载，否则没意义.
	 * @param packCode
	 */
	public void reloadPackService(String packCode){
		packManager.reloadPack(packCode);
		serviceManager.reloadService(packCode);
	}
	/**
	 * 重新加载所有包和服务.
	 * 服务和包需要都重载，否则没意义.
	 * @param packCode
	 */
	public void reloadAllPackService(){
		packManager.reloadAllPack();
		serviceManager.reloadAllService();
	}
	
	public void reloadRole(String dbKeyWord) throws Exception{
		systemManager.reloadRoles(dbKeyWord);
	}
	
	public void reloadPoratl(String dbKeyWord) throws Exception{
		systemManager.reloadPortal(dbKeyWord);
	}
	
	public void reloadRoleServic(String dbKeyWord) throws Exception{
		reloadRole(dbKeyWord);
		systemManager.reloadRoleToService(dbKeyWord);
	}
	public void reloadAllSystemParam(String dbKeyWord) throws Exception{
		systemManager.reloadSysParam(dbKeyWord);
	}
	
}
