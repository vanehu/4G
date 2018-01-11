package com.ailk.ecsp.core.container;

import javax.sql.DataSource;

import com.ailk.ecsp.lifecycle.LifecycleException;
import com.ailk.ecsp.lifecycle.LifecycleListener;
import com.ailk.ecsp.lifecycle.LifecycleSupport;
import com.ailk.ecsp.mybatis.model.ServiceRunLog;
import com.ailk.ecsp.security.PermissionManager;
import com.al.ec.serviceplatform.client.DataMap;


/**
 * 容器基类
 * @author 李茂君
 */
public abstract class ContainerBase implements Container {
	
	/**
	 * 安全管理器
	 */
	private PermissionManager permissonManager;
	
	/**
	 * 容器数据源，供服务使用
	 */
	private DataSource dataSource;		
	
	public Container getInstance() {
		// TODO Auto-generated method stub
		
		return null;
	}

	public DataSource getDataSource() {

		return this.dataSource;
	}

	public PermissionManager getPermissionManager() {

		return this.permissonManager;
	}

	/**
	 * 处理
	 * */
	public abstract DataMap process(DataMap dataMap,ServiceRunLog srl);

	/**
	 * The lifecycle event support for this component.
	 * */
	private LifecycleSupport lifecycle = new LifecycleSupport(this);
	
	public void addLifecycleListener(LifecycleListener listener) {
		
		lifecycle.addLifecycleListener(listener);
		
	}

	public LifecycleListener[] findLifecycleListeners() {
		
		return lifecycle.findLifecycleListeners();
		
	}

	public void removeLifecycleListener(LifecycleListener listener) {
		
		lifecycle.removeLifecycleListener(listener);
		
	}

	public abstract void start() throws LifecycleException;


	public abstract void stop() throws LifecycleException;

	public void setDataSource(DataSource dataSource) {

		this.dataSource = dataSource;
	}

	public void setPermissionManager(PermissionManager permissonManager) {
		
		this.permissonManager = permissonManager;
	}

	public LifecycleSupport getLifecycle() {
		return lifecycle;
	}

}
