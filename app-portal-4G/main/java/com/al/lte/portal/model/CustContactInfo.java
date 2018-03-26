package com.al.lte.portal.model;

/**
 * 客户联系信息
 *
 */
public class CustContactInfo {

	private String contactType;//联系人类型
	
	private String contactName;//联系人名称
	
	private String headFlag;//是否首选联系人

	public String getContactType() {
		return contactType;
	}

	public void setContactType(String contactType) {
		this.contactType = contactType;
	}

	public String getContactName() {
		return contactName;
	}

	public void setContactName(String contactName) {
		this.contactName = contactName;
	}

	public String getHeadFlag() {
		return headFlag;
	}

	public void setHeadFlag(String headFlag) {
		this.headFlag = headFlag;
	}
}
