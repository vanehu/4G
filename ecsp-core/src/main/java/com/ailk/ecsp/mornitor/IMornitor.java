package com.ailk.ecsp.mornitor;

import com.ailk.ecsp.lifecycle.Lifecycle;


public interface IMornitor extends Lifecycle {
	
	/**
	 * 监听的运行逻辑
	 * */
	public void action();
	
	
}
