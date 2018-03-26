package com.al.lte.portal.common.print.dto;

import java.util.List;

/**
 * 主销售品订购－普通附属销售品
 * @author zhangzc
 *
 */
public class OSNormOfferSet {
	private List<StringBeanSet> normOfferTitle;
	private List<StringBeanSet> normOfferComments;
	public List<StringBeanSet> getNormOfferTitle() {
		return normOfferTitle;
	}
	public void setNormOfferTitle(List<StringBeanSet> normOfferTitle) {
		this.normOfferTitle = normOfferTitle;
	}
	public List<StringBeanSet> getNormOfferComments() {
		return normOfferComments;
	}
	public void setNormOfferComments(List<StringBeanSet> normOfferComments) {
		this.normOfferComments = normOfferComments;
	}
}
