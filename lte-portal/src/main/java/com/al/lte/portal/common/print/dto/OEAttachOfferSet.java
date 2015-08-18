package com.al.lte.portal.common.print.dto;

import java.util.List;

/**
 * 购物车－附属销售品[订购、续订、变更、退订]，主销售品[退订、注销]
 * @author zhangzc
 *
 */
public class OEAttachOfferSet {
	private List<StringBeanSet> attachOfferTitle;
	private List<StringBeanSet> attachOfferCont;
	public List<StringBeanSet> getAttachOfferTitle() {
		return attachOfferTitle;
	}
	public void setAttachOfferTitle(List<StringBeanSet> attachOfferTitle) {
		this.attachOfferTitle = attachOfferTitle;
	}
	public List<StringBeanSet> getAttachOfferCont() {
		return attachOfferCont;
	}
	public void setAttachOfferCont(List<StringBeanSet> attachOfferCont) {
		this.attachOfferCont = attachOfferCont;
	}
}
