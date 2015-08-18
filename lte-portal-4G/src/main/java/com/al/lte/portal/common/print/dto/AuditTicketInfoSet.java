package com.al.lte.portal.common.print.dto;

import java.util.List;

public class AuditTicketInfoSet {
	private List<StringTwoSet> norTInfos;
	private List<StringBeanSet> lineTInfos;
	public List<StringTwoSet> getNorTInfos() {
		return norTInfos;
	}
	public void setNorTInfos(List<StringTwoSet> norTInfos) {
		this.norTInfos = norTInfos;
	}
	public List<StringBeanSet> getLineTInfos() {
		return lineTInfos;
	}
	public void setLineTInfos(List<StringBeanSet> lineTInfos) {
		this.lineTInfos = lineTInfos;
	}
}
