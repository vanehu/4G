package com.al.lte.portal.common.print.dto;

import java.util.List;
/**
 * 主销售品订购－资费信息项子节点
 * @author zhangzc
 *
 */
public class OSChildInfoSet {
	private String childInfoTitle;
	private List<ItemInfoTwoSet> norChildInfos;
	private List<StringBeanSet> lineChildInfos;
	public String getChildInfoTitle() {
		return childInfoTitle;
	}
	public void setChildInfoTitle(String childInfoTitle) {
		this.childInfoTitle = childInfoTitle;
	}
	public List<ItemInfoTwoSet> getNorChildInfos() {
		return norChildInfos;
	}
	public void setNorChildInfos(List<ItemInfoTwoSet> norChildInfos) {
		this.norChildInfos = norChildInfos;
	}
	public List<StringBeanSet> getLineChildInfos() {
		return lineChildInfos;
	}
	public void setLineChildInfos(List<StringBeanSet> lineChildInfos) {
		this.lineChildInfos = lineChildInfos;
	}
}
