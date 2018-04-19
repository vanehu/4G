package com.al.lte.portal.common.print.dto;

public class ProvNameSet {
	private String normFlag ;
	private String provName ;
	public String getNormFlag() {
		return normFlag;
	}
	public void setNormFlag(String normFlag) {
		this.normFlag = normFlag;
	}
	public String getProvName() {
		return provName;
	}
	public void setProvName(String provName) {
		if(null != provName && provName.length() == 2){
			setNormFlag("Y");
		} else {
			setNormFlag("N");
		}
		this.provName = provName;
	}
	public ProvNameSet(){
	}
	public ProvNameSet(String provName){
		this.setProvName(provName);
	}
}
