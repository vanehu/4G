package com.ailk.ecsp.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ailk.ecsp.lifecycle.LifecycleException;
import com.ailk.ecsp.lifecycle.LifecycleListener;
import com.ailk.ecsp.lifecycle.LifecycleSupport;
import com.al.ec.serviceplatform.client.DataMap;


public abstract class Service implements IService {

	private static Logger logger = LoggerFactory.getLogger(Service.class);

	/**
	 * 本服务调用次数
	 * */
	private int invokeTimes = 0;
	private String status;;
	private String serviceCode;

	public DataMap process(DataMap dataMap,String serviceSerial) throws Exception{
			return dataMap = exec(dataMap, serviceSerial);
	}
	public abstract DataMap exec(DataMap dataMap,String serviceSerial) throws Exception;
	
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
	public void start() throws LifecycleException {
		
	}
	public void stop() throws LifecycleException {
		
	}
	
	public int getInvokeTimes() {
		return invokeTimes;
	}

	public void addInovkeTime() {
		invokeTimes++;
	}

	public String getStatus() {
		return status;
	}
	
	public void setStatus(String status) {
		this.status = status;
	}
	
	public boolean isRunning(){
		if(STATUS_RUNNING.equalsIgnoreCase(status)){
			return true;
		}
		return false;
	}
	public String getServiceCode() {
		return serviceCode;
	}
	public void setServiceCode(String serviceCode) {
		this.serviceCode = serviceCode;
	}
	
}
