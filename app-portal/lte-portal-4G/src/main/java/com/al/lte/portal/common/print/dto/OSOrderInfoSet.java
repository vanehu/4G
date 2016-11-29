package com.al.lte.portal.common.print.dto;

import java.util.List;
/**
 * 主销售品订购－订购当月资费
 * @author zhangzc
 *
 */
public class OSOrderInfoSet {
	private List<StringBeanSet> orderInfoTitle;
	private List<StringBeanSet> osOrderInfos;
	public List<StringBeanSet> getOrderInfoTitle() {
		return orderInfoTitle;
	}
	public void setOrderInfoTitle(List<StringBeanSet> orderInfoTitle) {
		this.orderInfoTitle = orderInfoTitle;
	}
	public List<StringBeanSet> getOsOrderInfos() {
		return osOrderInfos;
	}
	public void setOsOrderInfos(List<StringBeanSet> osOrderInfos) {
		this.osOrderInfos = osOrderInfos;
	}
}
