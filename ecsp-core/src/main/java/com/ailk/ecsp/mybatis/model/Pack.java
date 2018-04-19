package com.ailk.ecsp.mybatis.model;

import java.util.Date;

import com.ailk.ecsp.core.DataRepository;

public class Pack {
    private Integer packId;

    private String packCode;

    private String packName;

    private String packPath;

    private String packType;

    private Date creatTime;

    private Date updateTime;

    private String status;

    private String pathType;

    public Integer getPackId() {
        return packId;
    }

    public void setPackId(Integer packId) {
        this.packId = packId;
    }

    public String getPackCode() {
        return packCode;
    }

    public void setPackCode(String packCode) {
        this.packCode = packCode == null ? null : packCode.trim();
    }

    public String getPackName() {
        return packName;
    }

    public void setPackName(String packName) {
        this.packName = packName == null ? null : packName.trim();
    }

    public String getPackPath() {
//    	if(packPath!=null){
//    		packPath = DataRepository.getInstence().getWebParam().getServiceLibPath() + packPath;
//	    }
        return packPath;
    }

    public void setPackPath(String packPath) {
        this.packPath = packPath == null ? null : packPath.trim();
    }

    public String getPackType() {
        return packType;
    }

    public void setPackType(String packType) {
        this.packType = packType == null ? null : packType.trim();
    }

    public Date getCreatTime() {
        return creatTime;
    }

    public void setCreatTime(Date creatTime) {
        this.creatTime = creatTime;
    }

    public Date getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(Date updateTime) {
        this.updateTime = updateTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status == null ? null : status.trim();
    }

    public String getPathType() {
        return pathType;
    }

    public void setPathType(String pathType) {
        this.pathType = pathType == null ? null : pathType.trim();
    }
}