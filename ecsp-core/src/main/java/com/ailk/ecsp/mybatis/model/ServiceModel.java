package com.ailk.ecsp.mybatis.model;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class ServiceModel {
    private Long serviceId;

    private String serviceCode;

    private String serviceType;

    private String serviceName;

    private String classPath;

    private String isAtomic;

    private String status;

    private Date creatTime;

    private String remark;
    
    private Long packId;
    
    private String packCode;

    private String packPath;

    private String packType;

    private String packName;
    
    private String methodName;
    
    private String outParamType;
    
    private String visitType;
    
    private String intfUrl;
    
    private String intfCode;
    
    private String intfName;
    
    private String intfType;
    
    private Long intfId;
    
    private List<ServiceRole> serviceRoles;
    
    private String roleIds;
    
    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public String getServiceCode() {
        return serviceCode;
    }

    public void setServiceCode(String serviceCode) {
        this.serviceCode = serviceCode == null ? null : serviceCode.trim();
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType == null ? null : serviceType.trim();
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName == null ? null : serviceName.trim();
    }

    public String getClassPath() {
        return classPath;
    }

    public void setClassPath(String classPath) {
        this.classPath = classPath == null ? null : classPath.trim();
    }

    public String getIsAtomic() {
        return isAtomic;
    }

    public void setIsAtomic(String isAtomic) {
        this.isAtomic = isAtomic == null ? null : isAtomic.trim();
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status == null ? null : status.trim();
    }

    public Date getCreatTime() {
        return creatTime;
    }

    public void setCreatTime(Date creatTime) {
        this.creatTime = creatTime;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark == null ? null : remark.trim();
    }

	public String getPackCode() {
		return packCode;
	}

	public void setPackCode(String packCode) {
		this.packCode = packCode;
	}

	public String getPackPath() {
		return packPath;
	}

	public void setPackPath(String packPath) {
//		if(packPath!=null){
//    		packPath = DataRepository.getInstence().getWebParam().getServiceLibPath() + packPath;
//    	}
		this.packPath = packPath;
	}

	public String getPackType() {
		return packType;
	}

	public void setPackType(String packType) {
		this.packType = packType;
	}

	public String getPackName() {
		return packName;
	}

	public void setPackName(String packName) {
		this.packName = packName;
	}

	public String getMethodName() {
		return methodName;
	}

	public void setMethodName(String methodName) {
		this.methodName = methodName;
	}

	public String getOutParamType() {
		return outParamType;
	}

	public void setOutParamType(String outParamType) {
		this.outParamType = outParamType;
	}

	public String getVisitType() {
		return visitType;
	}

	public void setVisitType(String visitType) {
		this.visitType = visitType;
	}

	public String getIntfUrl() {
		return intfUrl;
	}

	public void setIntfUrl(String intfUrl) {
		this.intfUrl = intfUrl;
	}

	public String getIntfCode() {
		return intfCode;
	}

	public void setIntfCode(String intfCode) {
		this.intfCode = intfCode;
	}

	public String getIntfType() {
		return intfType;
	}

	public void setIntfType(String intfType) {
		this.intfType = intfType;
	}

	public Long getIntfId() {
		return intfId;
	}

	public void setIntfId(Long intfId) {
		this.intfId = intfId;
	}

	public String getIntfName() {
		return intfName;
	}

	public void setIntfName(String intfName) {
		this.intfName = intfName;
	}

	public List<ServiceRole> getServiceRoles() {
		return serviceRoles;
	}

	public void setServiceRoles(List<ServiceRole> serviceRoles) {
		this.serviceRoles = serviceRoles;
	}
    
	public void addServiceRoles(ServiceRole serviceRole) {
		if(serviceRoles == null){
			serviceRoles = new ArrayList<ServiceRole>();
		}
		serviceRoles.add(serviceRole);
	}

	public String getRoleIds() {
		return roleIds;
	}

	public void setRoleIds(String roleIds) {
		this.roleIds = roleIds;
	}

	public Long getPackId() {
		return packId;
	}

	public void setPackId(Long packId) {
		this.packId = packId;
	}
	
}