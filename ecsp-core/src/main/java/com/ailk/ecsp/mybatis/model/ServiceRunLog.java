package com.ailk.ecsp.mybatis.model;

import java.util.Date;

public class ServiceRunLog {
    private Long id;
    // 门户日志改造 增加logSeqId字段
    private String logSeqId;
    
    private String serviceCode;

    private String portalCode;

    private String roleCode;

    private String servRunNbr;

    private String busiRunNbr;

    private Date startTime;

    private Date endTime;

    private Long useTime;

    private String resultCode;

    private String remark;
    
    private String remoteAddr;
    
    private String remotePort;
    
    private String localAddr;
    
    private String localPort;
    
    private String intfUrl;
    
    private String intfMethod;
    
    private String inParam;

    private String outParam;
    
    private String inIntParam;

    private String outIntParam;
    
	private String staffId;
    
	private String staffName;
	
	private String channelId;
	
	private String channelName;
	// 新增错误标识
	private String errorCode;
	
	public String getStaffId() {
		return staffId;
	}

	public void setStaffId(String staffId) {
		this.staffId = staffId;
	}

	public String getStaffName() {
		return staffName;
	}

	public void setStaffName(String staffName) {
		this.staffName = staffName;
	}

	public String getChannelId() {
		return channelId;
	}

	public void setChannelId(String channelId) {
		this.channelId = channelId;
	}

	public String getChannelName() {
		return channelName;
	}

	public void setChannelName(String channelName) {
		this.channelName = channelName;
	}

	private String dbKeyWord;
    
    public String getInIntParam() {
		return inIntParam;
	}

	public void setInIntParam(String inIntParam) {
		this.inIntParam = inIntParam;
	}

	public String getOutIntParam() {
		return outIntParam;
	}

	public void setOutIntParam(String outIntParam) {
		this.outIntParam = outIntParam;
	}

    public String getDbKeyWord() {
		return dbKeyWord;
	}

	public void setDbKeyWord(String dbKeyWord) {
		this.dbKeyWord = dbKeyWord;
	}

	public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getServiceCode() {
        return serviceCode;
    }

    public void setServiceCode(String serviceCode) {
        this.serviceCode = serviceCode == null ? null : serviceCode.trim();
    }

    public String getPortalCode() {
        return portalCode;
    }

    public void setPortalCode(String portalCode) {
        this.portalCode = portalCode == null ? null : portalCode.trim();
    }

    public String getRoleCode() {
        return roleCode;
    }

    public void setRoleCode(String roleCode) {
        this.roleCode = roleCode == null ? null : roleCode.trim();
    }

    public String getServRunNbr() {
        return servRunNbr;
    }

    public void setServRunNbr(String servRunNbr) {
        this.servRunNbr = servRunNbr == null ? null : servRunNbr.trim();
    }

    public String getBusiRunNbr() {
        return busiRunNbr;
    }

    public void setBusiRunNbr(String busiRunNbr) {
        this.busiRunNbr = busiRunNbr == null ? null : busiRunNbr.trim();
    }

    public Date getStartTime() {
        return startTime;
    }

    public void setStartTime(Date startTime) {
        this.startTime = startTime;
    }

    public Date getEndTime() {
        return endTime;
    }

    public void setEndTime(Date endTime) {
        this.endTime = endTime;
    }

    public Long getUseTime() {
        return useTime;
    }

    public void setUseTime(Long useTime) {
        this.useTime = useTime;
    }

    public String getResultCode() {
        return resultCode;
    }

    public void setResultCode(String resultCode) {
        this.resultCode = resultCode == null ? null : resultCode.trim();
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark == null ? null : remark.trim();
    }

	public String getRemoteAddr() {
		return remoteAddr;
	}

	public void setRemoteAddr(String remoteAddr) {
		this.remoteAddr = remoteAddr;
	}

	public String getRemotePort() {
		return remotePort;
	}

	public void setRemotePort(String remotePort) {
		this.remotePort = remotePort;
	}

	public String getLocalAddr() {
		return localAddr;
	}

	public void setLocalAddr(String localAddr) {
		this.localAddr = localAddr;
	}

	public String getLocalPort() {
		return localPort;
	}

	public void setLocalPort(String localPort) {
		this.localPort = localPort;
	}

	public String getIntfUrl() {
		return intfUrl;
	}

	public void setIntfUrl(String intfUrl) {
		this.intfUrl = intfUrl;
	}

	public String getIntfMethod() {
		return intfMethod;
	}

	public void setIntfMethod(String intfMethod) {
		this.intfMethod = intfMethod;
	}

	public String getInParam() {
		return inParam;
	}

	public void setInParam(String inParam) {
		this.inParam = inParam;
	}

	public String getOutParam() {
		return outParam;
	}

	public void setOutParam(String outParam) {
		this.outParam = outParam;
	}

	public String getLogSeqId() {
		return logSeqId;
	}

	public void setLogSeqId(String logSeqId) {
		this.logSeqId = logSeqId;
	}

	public String getErrorCode() {
		return errorCode;
	}

	public void setErrorCode(String errorCode) {
		this.errorCode = errorCode;
	}
}