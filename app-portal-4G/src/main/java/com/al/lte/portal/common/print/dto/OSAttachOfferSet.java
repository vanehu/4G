package com.al.lte.portal.common.print.dto;

import java.util.List;

/**
 * 主销售品订购－叠加包内容
 * @author zhangzc
 *
 */
public class OSAttachOfferSet {
	private List<StringBeanSet> attachOfferTitle;
	private List<OSNormOfferSet> normOfferList;
	private List<OSServOfferSet> servOfferList;
	public List<StringBeanSet> getAttachOfferTitle() {
		return attachOfferTitle;
	}
	public void setAttachOfferTitle(List<StringBeanSet> attachOfferTitle) {
		this.attachOfferTitle = attachOfferTitle;
	}
	public List<OSNormOfferSet> getNormOfferList() {
		return normOfferList;
	}
	public void setNormOfferList(List<OSNormOfferSet> normOfferList) {
		this.normOfferList = normOfferList;
	}
	public List<OSServOfferSet> getServOfferList() {
		return servOfferList;
	}
	public void setServOfferList(List<OSServOfferSet> servOfferList) {
		this.servOfferList = servOfferList;
	}
}
