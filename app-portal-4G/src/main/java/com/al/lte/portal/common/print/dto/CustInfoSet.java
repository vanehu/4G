package com.al.lte.portal.common.print.dto;

import java.util.List;
/**
 * 公用信息－客户信息
 * @author zhangzc
 *
 */
public class CustInfoSet {
	private List<ItemInfoSet> speLineCInfoList;
	private List<ItemInfoTwoSet> norCInfoList;
	private List<ItemInfoSet> norLineCInfoList;
	private List<ItemInfoTwoSet> orgCInfoList;
	private List<ItemInfoSet> orgLineCInfoList;
	public List<ItemInfoSet> getSpeLineCInfoList() {
		return speLineCInfoList;
	}
	public void setSpeLineCInfoList(List<ItemInfoSet> speLineCInfoList) {
		this.speLineCInfoList = speLineCInfoList;
	}
	public List<ItemInfoTwoSet> getNorCInfoList() {
		return norCInfoList;
	}
	public void setNorCInfoList(List<ItemInfoTwoSet> norCInfoList) {
		this.norCInfoList = norCInfoList;
	}
	public List<ItemInfoSet> getNorLineCInfoList() {
		return norLineCInfoList;
	}
	public void setNorLineCInfoList(List<ItemInfoSet> norLineCInfoList) {
		this.norLineCInfoList = norLineCInfoList;
	}
	public List<ItemInfoTwoSet> getOrgCInfoList() {
		return orgCInfoList;
	}
	public void setOrgCInfoList(List<ItemInfoTwoSet> orgCInfoList) {
		this.orgCInfoList = orgCInfoList;
	}
	public List<ItemInfoSet> getOrgLineCInfoList() {
		return orgLineCInfoList;
	}
	public void setOrgLineCInfoList(List<ItemInfoSet> orgLineCInfoList) {
		this.orgLineCInfoList = orgLineCInfoList;
	}
}
