package com.ailk.ecsp.core;

public class ServiceInvokeFactory {

	private static ServiceInvoke serviceInvoke;
	
	private ServiceInvokeFactory() {
		// TODO Auto-generated constructor stub
	}
	
	public static ServiceInvoke getInstance() {
		
		if(serviceInvoke == null) {
			serviceInvoke = new ServiceInvoke();
		} 
		return serviceInvoke;
	}
	
}
