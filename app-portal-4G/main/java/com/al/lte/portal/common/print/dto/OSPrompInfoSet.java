package com.al.lte.portal.common.print.dto;

import java.util.List;

public class OSPrompInfoSet {
	private List<StringBeanSet> prompInfoTitle;
	private List<StringBeanSet> osPrompInfos;
	public List<StringBeanSet> getPrompInfoTitle() {
		return prompInfoTitle;
	}
	public void setPrompInfoTitle(List<StringBeanSet> prompInfoTitle) {
		this.prompInfoTitle = prompInfoTitle;
	}
	public List<StringBeanSet> getOsPrompInfos() {
		return osPrompInfos;
	}
	public void setOsPrompInfos(List<StringBeanSet> osPrompInfos) {
		this.osPrompInfos = osPrompInfos;
	}
}
