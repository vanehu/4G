package com.ailk.ecsp.core.manager;

import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.math.NumberUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.ailk.ecsp.core.DataRepository;
import com.ailk.ecsp.core.SysConstant;
import com.ailk.ecsp.mybatis.EcspTransaction;
import com.ailk.ecsp.mybatis.mapper.RoleServiceMapper;
import com.ailk.ecsp.mybatis.mapper.ServiceMapper;
import com.ailk.ecsp.mybatis.mapper.ServicePackMapper;
import com.ailk.ecsp.mybatis.model.RoleService;
import com.ailk.ecsp.mybatis.model.ServiceModel;
import com.ailk.ecsp.mybatis.model.ServicePack;
import com.ailk.ecsp.service.BlankService;
import com.ailk.ecsp.service.GeneralService;
import com.ailk.ecsp.service.Service;
import com.al.ecs.common.util.JsonUtil;

@Component
public class ServiceManagerImpl implements ServiceManager{
	@Autowired
	private ServiceMapper serviceMapper;
	
	@Autowired
	RoleServiceMapper roleServiceMapper;
	@Autowired
	ServicePackMapper servicePackMapper;
	
	private Logger log = LoggerFactory.getLogger(ServiceManagerImpl.class);
	
	public void initialize(){
		loadServices(serviceMapper.queryAllService());
	}

	/**
	 * 重启一个服务包
	 * */
	public boolean reloadService(String packCode) {
		DataRepository.getInstence().batchDelService(packCode);
		loadServices(serviceMapper.queryServicesByPackCode(packCode));
		return true;
	}
	
	public void reloadAllService(){
		DataRepository.getInstence().getAllService().clear();
		loadServices(serviceMapper.queryAllService());
	}
	
	/**
	 * 加载服务和实例化服务
	 * @param list
	 */
	public void loadServices(List<ServiceModel> list) {
		if (list == null || list.size() == 0) {
			return;
		}
		
		for (Iterator<ServiceModel> iterator = list.iterator(); iterator.hasNext();) {
			ServiceModel sm = (ServiceModel) iterator.next();
			log.debug(JsonUtil.toString(sm));
			Service service = null;
			if(Service.VISIT_GENERAL.equals(sm.getVisitType())){
				service = new GeneralService();
				log.debug("#通用服务 Code={},Name={}",sm.getServiceCode(),sm.getServiceName());
			}else if(Service.VISIT_DEFINE.equals(sm.getVisitType()) || sm.getVisitType() == null){
				service = instanceService(sm);
				if(service!=null){
					log.debug("#定义服务  Code={},Name={}",sm.getServiceCode(),sm.getServiceName());
				}
			}
			if (service == null) {
				service = new BlankService();
			}
			if(isCanRun(sm)){
				service.setStatus(Service.STATUS_RUNNING);
			}
			service.setServiceCode(sm.getServiceCode());
			DataRepository.getInstence().addServiceAttr(sm);
			DataRepository.getInstence().addService(service);
		}
	}
	
	public boolean isCanRun(ServiceModel sm){
		if(sm==null){
			return false;
		}
		if(Service.STATUS_INVALID.equalsIgnoreCase(sm.getStatus())){
			return false;
		}
		if(Service.STATUS_NORMAL.equalsIgnoreCase(sm.getStatus())){
			return true;
		}
		if(Service.STATUS_RUNNING.equalsIgnoreCase(sm.getStatus())){
			return true;		
		}
		if(Service.STATUS_STOP.equalsIgnoreCase(sm.getStatus())){
			return true;
		}
		return false;
	}
	
	public Service instanceService(ServiceModel sm){
		Service service = null;
		String runLevel = DataRepository.getInstence().getWebParam().getRunLevel();
		if (SysConstant.LEVEL_DEVELOP.equalsIgnoreCase(runLevel)) {
			try {
				service = (Service)Class.forName(sm.getClassPath()).newInstance();
			} catch (Exception e) {
				log.error("实例化服务异常:", e);
			}
			log.debug("Local:{}",sm.getServiceCode());
		}else if(SysConstant.LEVEL_PRODUCT.equalsIgnoreCase(runLevel)){
			URLClassLoader classloader = DataRepository.getInstence().getPackClassLoader(sm.getPackCode());
			if(classloader != null) {
				try {
					service =  (Service)classloader.loadClass(sm.getClassPath()).newInstance();
					log.info("实例化服务成功:{}", sm.getClassPath());
				} catch (Exception e) {
					log.error("实例化服务异常:{}", sm.getClassPath());
				} 
				//log.debug("Jar:{}",sm.getServiceCode());
			} 
		}
		return service;
	}

	@EcspTransaction
	public int addService(ServiceModel record){
		try{
			serviceMapper.insertService(record);
			log.debug("serviceid:{}",record.getServiceId());
			
			ServicePack sp = new ServicePack();
			sp.setPackId(record.getPackId());
			sp.setServiceId(record.getServiceId());
			String[] roleIds = StringUtils.split(record.getRoleIds(), ";");
			List<RoleService> rsList = new ArrayList<RoleService>();
			
			for(int i = 0; roleIds != null && i < roleIds.length; i++){
				Long roleId = NumberUtils.toLong(roleIds[i]);
				if(roleId>0){
					RoleService rs = new RoleService();
					rs.setRoleId(roleId);
					rs.setServiceId(record.getServiceId());
					rsList.add(rs);
				}
				
			}
			if(sp.getPackId()!=null){
				servicePackMapper.insertServicePack(sp);
			}
			if(!rsList.isEmpty()){
				roleServiceMapper.batchInsert(rsList);
			}
			
		}catch (Exception e) {
			log.error("",e);
			return -1;
		}
		return 1;
	}
}
