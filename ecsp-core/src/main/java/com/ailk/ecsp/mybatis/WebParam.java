package com.ailk.ecsp.mybatis;

public class WebParam {
	private String runLevel;
	private String checkPermission;
	private String serviceLibPath;
	private String log4jConfigLocation;
	private String analogDataPath;
	public String getRunLevel() {
		return runLevel;
	}
	public void setRunLevel(String runLevel) {
		this.runLevel = runLevel;
	}
	public String getCheckPermission() {
		return checkPermission;
	}
	public void setCheckPermission(String checkPermission) {
		this.checkPermission = checkPermission;
	}
	public String getServiceLibPath() {
		return serviceLibPath;
	}
	public void setServiceLibPath(String serviceLibPath) {
		this.serviceLibPath = serviceLibPath;
	}
	public String getLog4jConfigLocation() {
		return log4jConfigLocation;
	}
	public void setLog4jConfigLocation(String log4jConfigLocation) {
		this.log4jConfigLocation = log4jConfigLocation;
	}
	public String getAnalogDataPath() {
		return analogDataPath;
	}
	public void setAnalogDataPath(String analogDataPath) {
		this.analogDataPath = analogDataPath;
	}
	
}
