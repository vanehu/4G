package com.ailk.ecsp.mornitor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.ailk.ecsp.core.DataRepository;
import com.ailk.ecsp.lifecycle.Lifecycle;
import com.ailk.ecsp.lifecycle.LifecycleEvent;
import com.ailk.ecsp.lifecycle.LifecycleListener;
import com.ailk.ecsp.mybatis.model.ServiceModel;
import com.ailk.ecsp.service.Service;


public class ServiceRuntimeMornitor extends AbstractMornitor implements LifecycleListener{

	private HashMap invokedServices = new HashMap();
	
	/**服务总共调用次数*/
	private long totalInvokeTimes = 0;
	
	/**服务调用成功次数*/
	private long totalSuccInvokeTimes = 0;
	
	/**服务调用失败次数*/
	private long totalFailInvokeTimes = 0;
	
	private static  ServiceRuntimeMornitor serviceRuntimeMornitor;
	
	/**防止新建这个对象*/
	private ServiceRuntimeMornitor(){}
	
	public static ServiceRuntimeMornitor getInstance() {
		
		if(serviceRuntimeMornitor == null) {
			serviceRuntimeMornitor = new ServiceRuntimeMornitor();
		} 
		
		return serviceRuntimeMornitor;
		
	}
	
	
	public void action() {
		// TODO Auto-generated method stub
		
	}
	
	
	/**
	 * 生命周期监听事件，运行时监听器监听服务调用情况。
	 * 如果有服务调用，触发
	 * */
	public void lifecycleEvent(LifecycleEvent event) {
		
		Service ser = null;
		
		synchronized (invokedServices) {
			
			if(event.getSource().equals(Lifecycle.BEFORE_SERVICE_INVOKE)) {
				
				if(event.getData() instanceof Service) {
					ser = (Service)event.getData();
					//增加调用次数
					ser.addInovkeTime();
					List serviceList = null;
					ServiceModel attr = DataRepository.getInstence().getServiceAttr(ser.getServiceCode());
					if(invokedServices.get(ser.getServiceCode())!=null) {
						serviceList = (List)invokedServices.get(attr.getServiceCode());
						serviceList.add(ser);
					} else {
						serviceList = new ArrayList();
						serviceList.add(ser);
						invokedServices.put(ser.getServiceCode(), serviceList);
					}
					
				}
				
				//累加一次服务调用次数
				totalInvokeTimes ++;
				
			}
			
			if(event.getSource().equals(Lifecycle.AFTER_SERVICE_INVOKE)) {
				
				if(event.getData() instanceof Service) {				
					ser = (Service)event.getData();
					List serviceList = null; 
					
					if(invokedServices.get(ser.getServiceCode()) != null) {
						
						serviceList = (List)invokedServices.get(ser.getServiceCode());
						
						if(serviceList.size()==0) {
							serviceList.remove(serviceList.size()-1);
							invokedServices.remove(ser.getServiceCode());
						} else {
							serviceList.remove(serviceList.size()-1);
						}
					} 
					
					invokedServices.remove(ser.getServiceCode());
				}			
				
			}
		
		}
		
		
	}
	
	/**
	 * 返回正在运行的服务
	 * */
	public HashMap getRunningService() {
		return invokedServices;
	}

	
	/**
	 * 统计当前服务总的调用次数
	 * */
	public long getTotalInvokeTimes() {
		return totalInvokeTimes;
	}

	/**
	 * 返回当前服务总调用成功次数
	 * */
	public long getTotalSuccInvokeTimes() {
		return totalSuccInvokeTimes;
	}

	/**
	 * 返回当前服务总调用失败次数
	 * */	
	public long getTotalFailInvokeTimes() {
		return totalFailInvokeTimes;
	}
	
	
	
	
}
