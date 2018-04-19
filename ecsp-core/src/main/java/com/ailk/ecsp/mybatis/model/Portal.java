package com.ailk.ecsp.mybatis.model;

import java.util.Date;

public class Portal {
    private Integer portalId;

    private String portalCode;

    private String portalName;

    private String password;

    private Date creatTime;

    private String channel;

    private String staff;

    private String status;

    public Integer getPortalId() {
        return portalId;
    }

    public void setPortalId(Integer portalId) {
        this.portalId = portalId;
    }

    public String getPortalCode() {
        return portalCode;
    }

    public void setPortalCode(String portalCode) {
        this.portalCode = portalCode == null ? null : portalCode.trim();
    }

    public String getPortalName() {
        return portalName;
    }

    public void setPortalName(String portalName) {
        this.portalName = portalName == null ? null : portalName.trim();
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password == null ? null : password.trim();
    }

    public Date getCreatTime() {
        return creatTime;
    }

    public void setCreatTime(Date creatTime) {
        this.creatTime = creatTime;
    }

    public String getChannel() {
        return channel;
    }

    public void setChannel(String channel) {
        this.channel = channel == null ? null : channel.trim();
    }

    public String getStaff() {
        return staff;
    }

    public void setStaff(String staff) {
        this.staff = staff == null ? null : staff.trim();
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status == null ? null : status.trim();
    }
}