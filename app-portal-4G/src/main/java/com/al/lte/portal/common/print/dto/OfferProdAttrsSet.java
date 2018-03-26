package com.al.lte.portal.common.print.dto;

import java.util.List;

public class OfferProdAttrsSet {
	private List<StringBeanSet> acceNbrInfo;
	private List<ItemInfoTwoNewSet> norOfferProdInfos;
	private List<StringBeanSet> lineOfferProdInfos;
	public List<StringBeanSet> getAcceNbrInfo() {
		return acceNbrInfo;
	}
	public void setAcceNbrInfo(List<StringBeanSet> acceNbrInfo) {
		this.acceNbrInfo = acceNbrInfo;
	}
	public List<ItemInfoTwoNewSet> getNorOfferProdInfos() {
		return norOfferProdInfos;
	}
	public void setNorOfferProdInfos(List<ItemInfoTwoNewSet> norOfferProdInfos) {
		this.norOfferProdInfos = norOfferProdInfos;
	}
	public List<StringBeanSet> getLineOfferProdInfos() {
		return lineOfferProdInfos;
	}
	public void setLineOfferProdInfos(List<StringBeanSet> lineOfferProdInfos) {
		this.lineOfferProdInfos = lineOfferProdInfos;
	}
}
