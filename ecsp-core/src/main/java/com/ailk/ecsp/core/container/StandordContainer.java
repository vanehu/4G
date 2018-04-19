package com.ailk.ecsp.core.container;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;

import com.ailk.ecsp.core.DataRepository;
import com.ailk.ecsp.core.ServiceInvokeFactory;
import com.ailk.ecsp.exception.BaseSecurityException;
import com.ailk.ecsp.lifecycle.Lifecycle;
import com.ailk.ecsp.lifecycle.LifecycleException;
import com.ailk.ecsp.mybatis.model.ServiceModel;
import com.ailk.ecsp.mybatis.model.ServiceRunLog;
import com.ailk.ecsp.service.Service;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ec.serviceplatform.client.ResultCode;

/**
 * 服务容器
 * */
public class StandordContainer extends ContainerBase {
	
	/**
	 * 外部访问流程处理
	 * */
	public DataMap process(DataMap dataMap,ServiceRunLog srl) {
		
		DataMap result = new DataMap();
		result.putAll(dataMap);
		Service service;
		
		try {
			//校验权限
			service = DataRepository.getInstence().getService(dataMap.getServiceCode());
			if(service != null){
				ServiceModel attr = DataRepository.getInstence().getServiceAttr(service.getServiceCode());
				String intfMethod = attr.getMethodName();
				String intfUrl = attr.getIntfUrl();
				if (StringUtils.isBlank(intfMethod)){
			        intfMethod = MapUtils.getString(dataMap.getInParam(),"intfMethod","");
			        intfUrl = MapUtils.getString(dataMap.getInParam(),"intfUrl","");
				}
				srl.setIntfUrl(intfUrl);
				srl.setIntfMethod(intfMethod);
				getPermissionManager().checkPermission(dataMap); 
				//解析服务
				if (service.isRunning()) {
					//服务调度执行
					result =  ServiceInvokeFactory.getInstance().invoke(service, dataMap,srl.getServRunNbr());
				}else {
					result.setResultCode(ResultCode.R_SERV_PAUSE);
					result.setResultMsg("当前服务暂时不能使用{}",service.getStatus());
				}
			}else{
				result.setServiceCode(dataMap.getServiceCode());
				result.setResultCode("POR-0404");
				result.setResultMsg("服务{}不存在，请确认服务编码是否正确，或者该服务是否已配置{}", dataMap.getServiceCode(),"!");
			}
		} catch (BaseSecurityException e) {
			result.setResultCode(e.getResult_code());
			result.setResultMsg(e.getResult_msg());
		}
		
		return result;
	}

	
	
	/**
	 * 容器启动，初始化监听器，初始化定时器
	 * */
	public void start() throws LifecycleException {
		getLifecycle().fireLifecycleEvent(Lifecycle.START_EVENT, null);
	}

	/**
	 * 容器停止，停止监听器，停止定时器调用
	 * */
	public void stop() throws LifecycleException {
		getLifecycle().fireLifecycleEvent(Lifecycle.STOP_EVENT, null);
	}
}
