package com.al.lte.portal.common.print.dto;

import java.util.List;
/**
 * 号码列表
 * @author zhangzc
 *
 */
public class AcceNbrSet {
	private List<StringBeanSet> acceNbrTitle;
	private List<ItemInfoTwoSet> norAcceNbrInfos;
	private List<ItemInfoSet> lineAcceNbrInfos;
	public List<StringBeanSet> getAcceNbrTitle() {
		return acceNbrTitle;
	}
	public void setAcceNbrTitle(List<StringBeanSet> acceNbrTitle) {
		this.acceNbrTitle = acceNbrTitle;
	}
	public List<ItemInfoTwoSet> getNorAcceNbrInfos() {
		return norAcceNbrInfos;
	}
	public void setNorAcceNbrInfos(List<ItemInfoTwoSet> norAcceNbrInfos) {
		this.norAcceNbrInfos = norAcceNbrInfos;
	}
	public List<ItemInfoSet> getLineAcceNbrInfos() {
		return lineAcceNbrInfos;
	}
	public void setLineAcceNbrInfos(List<ItemInfoSet> lineAcceNbrInfos) {
		this.lineAcceNbrInfos = lineAcceNbrInfos;
	}
}
