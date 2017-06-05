package com.ailk.ecsp.core.manager;

public interface SystemManager {
	public void initialize(String dbKeyWord)throws Exception;
	public void loadPortal(String dbKeyWord)throws Exception;
	public void reloadPortal(String dbKeyWord)throws Exception;
	public void loadRoles(String dbKeyWord) throws Exception;
	public void reloadRoles(String dbKeyWord)throws Exception;
	public void loadRoleToService(String dbKeyWord) throws Exception;
	public void reloadRoleToService(String dbKeyWord)throws Exception;
	public void loadSysParam(String dbKeyWord)throws Exception;
	public void reloadSysParam(String dbKeyWord)throws Exception;
}
