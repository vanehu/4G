package com.al.lte.portal.common.print.dto;

import java.util.List;

/**
 * 主销售品订购－其它信息
 * @author zhangzc
 *
 */
public class OSOtherInfoSet {
	private List<StringBeanSet> otherInfoTitle;
	private List<StringBeanSet> osOtherInfos;
	public List<StringBeanSet> getOtherInfoTitle() {
		return otherInfoTitle;
	}
	public void setOtherInfoTitle(List<StringBeanSet> otherInfoTitle) {
		this.otherInfoTitle = otherInfoTitle;
	}
	public List<StringBeanSet> getOsOtherInfos() {
		return osOtherInfos;
	}
	public void setOsOtherInfos(List<StringBeanSet> osOtherInfos) {
		this.osOtherInfos = osOtherInfos;
	}
}
