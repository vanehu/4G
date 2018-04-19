package com.ailk.ecsp.core.container;

import javax.sql.DataSource;

import com.ailk.ecsp.lifecycle.Lifecycle;
import com.ailk.ecsp.mybatis.model.ServiceRunLog;
import com.ailk.ecsp.security.PermissionManager;
import com.al.ec.serviceplatform.client.DataMap;

public interface Container extends Lifecycle {
	/**
	 * 获取安全管理器
	 * */
	public PermissionManager getPermissionManager();
	
	/**
	 * 获取数据源
	 * */
	public DataSource getDataSource();
	
	/**
	 * 容器处理服务调用请求
	 * */
	public DataMap process(DataMap dataMap,ServiceRunLog srl);
	
	public void setPermissionManager(PermissionManager permissionManager);
	
	public void setDataSource(DataSource dataSource);
	

	
}
