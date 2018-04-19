package com.al.lte.portal.common.print.dto;

import java.util.List;
/**
 * 主销售品订购－资费信息项
 * @author zhangzc
 *
 */
public class OSBaseInfoSet {
	private List<StringBeanSet> baseInfoTitle;
	private List<StringTwoSet> norOSBaseInfos;
	private List<StringBeanSet> lineOSBaseInfos;
	private List<StringBeanSet> donateOSBaseInfos;
	private List<OSChildInfoSet> childInfoList;
	public List<StringBeanSet> getBaseInfoTitle() {
		return baseInfoTitle;
	}
	public void setBaseInfoTitle(List<StringBeanSet> baseInfoTitle) {
		this.baseInfoTitle = baseInfoTitle;
	}
	public List<StringTwoSet> getNorOSBaseInfos() {
		return norOSBaseInfos;
	}
	public void setNorOSBaseInfos(List<StringTwoSet> norOSBaseInfos) {
		this.norOSBaseInfos = norOSBaseInfos;
	}
	public List<StringBeanSet> getLineOSBaseInfos() {
		return lineOSBaseInfos;
	}
	public void setLineOSBaseInfos(List<StringBeanSet> lineOSBaseInfos) {
		this.lineOSBaseInfos = lineOSBaseInfos;
	}
	public List<StringBeanSet> getDonateOSBaseInfos() {
		return donateOSBaseInfos;
	}
	public void setDonateOSBaseInfos(List<StringBeanSet> donateOSBaseInfos) {
		this.donateOSBaseInfos = donateOSBaseInfos;
	}
	public List<OSChildInfoSet> getChildInfoList() {
		return childInfoList;
	}
	public void setChildInfoList(List<OSChildInfoSet> childInfoList) {
		this.childInfoList = childInfoList;
	}
}
