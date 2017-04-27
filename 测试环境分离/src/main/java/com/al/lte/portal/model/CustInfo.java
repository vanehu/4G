package com.al.lte.portal.model;

import java.util.List;


/**
 * 客户资料信息 .
 * <P>
 * @author lianld
 * @version V1.0 2012-4-23
 * @createDate 2012-4-23 下午4:37:58
 * @modifyDate	 lianld 2012-4-23 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
public class CustInfo {
	
	private String partyName;//客户名称
	
	private String custId;//客户id
	
	private Integer areaId;//本地网ID
	
	private String areaName;//本地网名称
	
	public String getVipLevel() {
		return vipLevel;
	}

	public String getAreaName() {
		return areaName;
	}

	public void setAreaName(String areaName) {
		this.areaName = areaName;
	}

	public void setVipLevel(String vipLevel) {
		this.vipLevel = vipLevel;
	}

	public String getCustFlag() {
		return custFlag;
	}

	public void setCustFlag(String custFlag) {
		this.custFlag = custFlag;
	}

	private Integer identityCd;//证件类型ID
	
	private String idCardNumber;//客户证件编码
	
	private String identityName;//证件类型名称
	
	private String segmentName;//客户战略分群
	
	private String vipLevel;//客户VIP等级

	private String custFlag;//三类客户标志红、黑、白名单客户
	
	private String segmentId;//战略分群ID
	
	
	public String getSegmentId() {
		return segmentId;
	}

	public void setSegmentId(String segmentId) {
		this.segmentId = segmentId;
	}

	private String addressStr;//证件地址
	
	private List<CustContactInfo> contactInfos;

	public String getPartyName() {
		return partyName;
	}

	public String getCustId() {
		return custId;
	}

	public void setCustId(String custId) {
		this.custId = custId;
	}

	public void setPartyName(String partyName) {
		this.partyName = partyName;
	}

	public Integer getAreaId() {
		return areaId;
	}

	public void setAreaId(Integer areaId) {
		this.areaId = areaId;
	}

	public Integer getIdentityCd() {
		return identityCd;
	}

	public void setIdentityCd(Integer identityCd) {
		this.identityCd = identityCd;
	}

	public String getIdCardNumber() {
		return idCardNumber;
	}

	public void setIdCardNumber(String idCardNumber) {
		this.idCardNumber = idCardNumber;
	}

	public String getIdentityName() {
		return identityName;
	}

	public void setIdentityName(String identityName) {
		this.identityName = identityName;
	}

	public String getSegmentName() {
		return segmentName;
	}

	public void setSegmentName(String segmentName) {
		this.segmentName = segmentName;
	}

	public String getAddressStr() {
		return addressStr;
	}

	public void setAddressStr(String addressStr) {
		this.addressStr = addressStr;
	}

	public List<CustContactInfo> getContactInfos() {
		return contactInfos;
	}

	public void setContactInfos(List<CustContactInfo> contactInfos) {
		this.contactInfos = contactInfos;
	}
}
