package com.ailk.ecsp.core;

import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Set;

import com.ailk.ecsp.mybatis.WebParam;
import com.ailk.ecsp.mybatis.model.Pack;
import com.ailk.ecsp.mybatis.model.Portal;
import com.ailk.ecsp.mybatis.model.ServiceModel;
import com.ailk.ecsp.mybatis.model.ServiceRole;
import com.ailk.ecsp.service.Service;
import com.al.ecs.common.util.MDA;

public class DataRepository {
	private HashMap<String, Pack> allPack;
	private HashMap<String, URLClassLoader> allPackClassLoaders;
	private HashMap<String,Service> allService;
	private HashMap<String,ServiceModel> allServiceAttr;
	private HashMap<String, Portal> allPortal;
	private HashMap<String, ServiceRole> allRole;
	private HashMap<String, ArrayList<String>> allRoleToService;
	private HashMap<String, HashMap<String,String>> allSysParam; //配置参数,保存不同数据源的配置数据,key-level1:数据源key(省份编码),key-level2:配置数据属性名
	private WebParam webParam;
	private static DataRepository platformDataRepository;
	
	public DataRepository(){
		allPack = new HashMap<String, Pack>();
		allPackClassLoaders = new HashMap<String, URLClassLoader>();
		allService = new HashMap<String,Service>();
		allPortal = new HashMap<String, Portal>();
		allRole = new HashMap<String, ServiceRole>();
		allRoleToService = new HashMap<String, ArrayList<String>>();
		allSysParam = new HashMap<String, HashMap<String,String>>();
		allServiceAttr = new HashMap<String, ServiceModel>();
		webParam = new WebParam();
	}
	
	public static DataRepository getInstence(){
		if (platformDataRepository == null) {
			platformDataRepository = new DataRepository();
		}
		return platformDataRepository;
	}
	
	public void addPack(Pack pack){
		allPack.put(pack.getPackCode(), pack);
	}
	
	public Pack getPack(String packCode){
		return allPack.get(packCode);
	}
	public void delPack(String packCode){
		allPack.remove(packCode);
	}
	public void clearPack(){
		allPack.clear();
	}
	
	public HashMap<String, URLClassLoader> getAllPackClassLoaders() {
		return allPackClassLoaders;
	}
	public void setAllPackClassLoaders(
			HashMap<String, URLClassLoader> allPackClassLoaders) {
		this.allPackClassLoaders = allPackClassLoaders;
	}
	public URLClassLoader getPackClassLoader(String packCode){
		return allPackClassLoaders.get(packCode);
	}
	public void addPackClassLoader(String packCode,URLClassLoader loader){
		allPackClassLoaders.put(packCode, loader);
	}
	public void delPackClassLoader(String packCode){
		allPackClassLoaders.remove(packCode);
	}
	
	public HashMap<String, Service> getAllService() {
		return allService;
	}
	public void setAllService(HashMap<String, Service> allService) {
		this.allService = allService;
	}
	
	public void delService(String serviceCode){
		allService.remove(serviceCode);
	}
	
	public void batchDelService(String packCode){
		HashMap<String, Service> map = getAllService();
		Set<String> set = map.keySet();
		Iterator<String> it = set.iterator();
		while (it.hasNext()) {
			String s =  it.next();
			Service serv = map.get(s);
			ServiceModel attr = DataRepository.getInstence().getServiceAttr(serv.getServiceCode());
			if(packCode.equals(attr.getPackCode())){
				delService(serv.getServiceCode());
			}
		}
	}
	
	public void addService(Service service){
		allService.put(service.getServiceCode(),service);
	}
	public Service getService(String serviceCode){
		return allService.get(serviceCode);
	}
	
	public void addServiceAttr(ServiceModel serviceModel){
		allServiceAttr.put(serviceModel.getServiceCode(),serviceModel);
	}
	public ServiceModel getServiceAttr(String serviceCode){
		return allServiceAttr.get(serviceCode);
	}
	
	public HashMap<String, Portal> getAllPortal() {
		return allPortal;
	}
	public void setAllPortal(HashMap<String, Portal> allPortal) {
		this.allPortal = allPortal;
	}
	public void addPortal(Portal portal){
		allPortal.put(portal.getPortalCode(), portal);
	}
	public void delPortal(String portalCode){
		allPortal.remove(portalCode);
	}
	public Portal getPortal(String portalCode){
		return allPortal.get(portalCode);
	}
	public ServiceRole getRole(String roleCode) {
		return allRole.get(roleCode);
	}
	public void addRole(ServiceRole role) {
		allRole.put(role.getRoleCode(), role);
	}
	
	public void clearAllRole() {
		allRole.clear();
	}
	
	public HashMap<String, ArrayList<String>> getAllRoleToService() {
		return allRoleToService;
	}
	public void setAllRoleToService(
			HashMap<String, ArrayList<String>> allRoleToService) {
		this.allRoleToService = allRoleToService;
	}
	
	public ArrayList<String> getRoleToService(String roleCode){
		return allRoleToService.get(roleCode);
	}
	
	public HashMap<String, HashMap<String,String>> getAllSysParam() {
		return allSysParam;
	}
	public void clearSysParam(String dbKeyWord){
		allSysParam.remove(dbKeyWord);
	}
	public void setAllSysParam(HashMap<String, HashMap<String,String>> allSysParam) {
		this.allSysParam = allSysParam;
	}
	public void addSysParam(String dbKeyWord, String paramCode,String paramValue){
		if(dbKeyWord == null || "".equals(dbKeyWord)){
			dbKeyWord = DataSourceRouter.DEFAULT_DATASOURCE_KEY;
		}
		if(allSysParam.get(dbKeyWord) == null){
			allSysParam.put(dbKeyWord, new HashMap<String,String>());
		}
		HashMap<String,String> sysParams = allSysParam.get(dbKeyWord);
		sysParams.put(paramCode, paramValue);
		allSysParam.put(dbKeyWord, sysParams);
	}
	public void removeSysParam(String dbKeyWord, String paramCode,String groupId){
		if(dbKeyWord == null || "".equals(dbKeyWord)){
			dbKeyWord = DataSourceRouter.DEFAULT_DATASOURCE_KEY;
		}
		if(allSysParam.get(dbKeyWord) != null){
			HashMap<String,String> sysParams = allSysParam.get(dbKeyWord);
			sysParams.remove(groupId+SysConstant.CON_SEPARATOR_SYS_PARAM_GROUP+paramCode);
			allSysParam.put(dbKeyWord,sysParams);
		}
	}
	public String getSysParamValue(String dbKeyWord, String paramCode,String groupId){
		if(dbKeyWord == null || "".equals(dbKeyWord)){
			dbKeyWord = DataSourceRouter.DEFAULT_DATASOURCE_KEY;
		}
		if(allSysParam.get(dbKeyWord) == null){
			return null;
		}
		return allSysParam.get(dbKeyWord).get(groupId+SysConstant.CON_SEPARATOR_SYS_PARAM_GROUP+paramCode);
	}
	
	//获取默认数据源的配置数据
	public String getSysParamValue(String paramCode,String groupId){
		if(paramCode.equals(SysConstant.CON_CSB_URL_KEY)){//csb地址从MDA配置文件取
			return MDA.CSB_WS_URL;
		}else{
			String dbKeyWord = DataSourceRouter.DEFAULT_DATASOURCE_KEY;
			return getSysParamValue(dbKeyWord, paramCode, groupId);
		}
	}
	
	public WebParam getWebParam() {
		return webParam;
	}

	public void setWebParam(WebParam webParam) {
		this.webParam = webParam;
	}
	
}
