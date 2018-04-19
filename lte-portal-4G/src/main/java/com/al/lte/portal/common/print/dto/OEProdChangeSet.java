package com.al.lte.portal.common.print.dto;

import java.util.List;

/**
 * 购物车－用户产品变更节点
 * @author zhangzc
 *
 */
public class OEProdChangeSet {
	private List<StringBeanSet> prodChangeTitle;
	private List<StringTwoSet> prodChangeInfos;
	private List<StringBeanSet> lineProdChangeInfos;
	public List<StringBeanSet> getProdChangeTitle() {
		return prodChangeTitle;
	}
	public void setProdChangeTitle(List<StringBeanSet> prodChangeTitle) {
		this.prodChangeTitle = prodChangeTitle;
	}
	public List<StringTwoSet> getProdChangeInfos() {
		return prodChangeInfos;
	}
	public void setProdChangeInfos(List<StringTwoSet> prodChangeInfos) {
		this.prodChangeInfos = prodChangeInfos;
	}
	public List<StringBeanSet> getLineProdChangeInfos() {
		return lineProdChangeInfos;
	}
	public void setLineProdChangeInfos(List<StringBeanSet> lineProdChangeInfos) {
		this.lineProdChangeInfos = lineProdChangeInfos;
	}
}
