package com.ailk.ecsp.core;

public class RouterStrategy {
	private String key = "";
	public RouterStrategy(String key){
		this.key = key;
	}
	public RouterStrategy(){
		
	}
	@Deprecated
	public void setKey(String key) {
		//作废空方法
	}
	public String getKey() {
		return key;
	}
}
