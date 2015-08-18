package com.ailk.ecsp.mornitor;

import com.ailk.ecsp.lifecycle.LifecycleException;
import com.ailk.ecsp.lifecycle.LifecycleListener;


public abstract class AbstractMornitor implements IMornitor{

	
	
	public void addLifecycleListener(LifecycleListener arg0) {
		// TODO Auto-generated method stub
		
	}
	
	
	public abstract void action();
	
	public LifecycleListener[] findLifecycleListeners() {
		// TODO Auto-generated method stub
		return null;
	}

	public void removeLifecycleListener(LifecycleListener arg0) {
		// TODO Auto-generated method stub
		
	}

	public void start() throws LifecycleException {
		// TODO Auto-generated method stub
		
	}

	public void stop() throws LifecycleException {
		// TODO Auto-generated method stub
		
	}

}
