package com.ailk.ecsp.mybatis.model;

public class IntfUrl {
    private Long intfId;

    private String intfUrl;

    private String intfType;

    private String intfDesc;

    private String intfCode;
    
    private String intfName;

    public Long getIntfId() {
        return intfId;
    }

    public void setIntfId(Long intfId) {
        this.intfId = intfId;
    }

    public String getIntfUrl() {
        return intfUrl;
    }

    public void setIntfUrl(String intfUrl) {
        this.intfUrl = intfUrl == null ? null : intfUrl.trim();
    }

    public String getIntfType() {
        return intfType;
    }

    public void setIntfType(String intfType) {
        this.intfType = intfType == null ? null : intfType.trim();
    }

    public String getIntfDesc() {
        return intfDesc;
    }

    public void setIntfDesc(String intfDesc) {
        this.intfDesc = intfDesc == null ? null : intfDesc.trim();
    }

    public String getIntfCode() {
        return intfCode;
    }

    public void setIntfCode(String intfCode) {
        this.intfCode = intfCode == null ? null : intfCode.trim();
    }

	public String getIntfName() {
		return intfName;
	}

	public void setIntfName(String intfName) {
		this.intfName = intfName;
	}
    
}