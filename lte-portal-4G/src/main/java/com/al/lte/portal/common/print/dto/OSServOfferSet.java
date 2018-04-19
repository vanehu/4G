package com.al.lte.portal.common.print.dto;

import java.util.List;

/**
 * 主销售品订购－功能类附属销售品
 * @author zhangzc
 *
 */
public class OSServOfferSet {
	private List<StringBeanSet> servOfferTitle;
	private List<StringBeanSet> servOfferInfos;
	public List<StringBeanSet> getServOfferTitle() {
		return servOfferTitle;
	}
	public void setServOfferTitle(List<StringBeanSet> servOfferTitle) {
		this.servOfferTitle = servOfferTitle;
	}
	public List<StringBeanSet> getServOfferInfos() {
		return servOfferInfos;
	}
	public void setServOfferInfos(List<StringBeanSet> servOfferInfos) {
		this.servOfferInfos = servOfferInfos;
	}
}
