package com.ailk.ecsp.mybatis.model;

import java.util.Date;

public class ServiceRole {
    private Integer roleId;

    private String roleCode;

    private String roleName;

    private String usePortal;

    private String status;

    private Date creatTime;

    public Integer getRoleId() {
        return roleId;
    }

    public void setRoleId(Integer roleId) {
        this.roleId = roleId;
    }

    public String getRoleCode() {
        return roleCode;
    }

    public void setRoleCode(String roleCode) {
        this.roleCode = roleCode == null ? null : roleCode.trim();
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName == null ? null : roleName.trim();
    }

    public String getUsePortal() {
        return usePortal;
    }

    public void setUsePortal(String usePortal) {
        this.usePortal = usePortal == null ? null : usePortal.trim();
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
}