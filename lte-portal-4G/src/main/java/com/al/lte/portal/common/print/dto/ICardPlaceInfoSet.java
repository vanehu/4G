package com.al.lte.portal.common.print.dto;

import java.util.List;
/**
 * 快销卡身份证放置区
 *
 */
public class ICardPlaceInfoSet {
	private List<StringBeanSet> extCustOrderIdTitle;

	public void setExtCustOrderIdTitle(List<StringBeanSet> extCustOrderIdTitle) {
		this.extCustOrderIdTitle = extCustOrderIdTitle;
	}

	public List<StringBeanSet> getExtCustOrderIdTitle() {
		return extCustOrderIdTitle;
	}
}
