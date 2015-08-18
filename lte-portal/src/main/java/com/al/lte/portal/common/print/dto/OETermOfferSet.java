package com.al.lte.portal.common.print.dto;

import java.util.List;

/**
 * 购物车－合约计划订购节点
 * @author zhangzc
 *
 */
public class OETermOfferSet {
	private String termOfferTitle;
	private List<StringBeanSet> termOfferInfos;
	public String getTermOfferTitle() {
		return termOfferTitle;
	}
	public void setTermOfferTitle(String termOfferTitle) {
		this.termOfferTitle = termOfferTitle;
	}
	public List<StringBeanSet> getTermOfferInfos() {
		return termOfferInfos;
	}
	public void setTermOfferInfos(List<StringBeanSet> termOfferInfos) {
		this.termOfferInfos = termOfferInfos;
	}
}
