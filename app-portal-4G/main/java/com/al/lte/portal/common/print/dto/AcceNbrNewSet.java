package com.al.lte.portal.common.print.dto;

import java.util.List;
/**
 * 号码列表
 * @author zhangzc
 *
 */
public class AcceNbrNewSet {
	private List<StringBeanSet> acceNbrTitle;
	private List<OfferProdAttrsSet> offerProdInfos;
	public List<StringBeanSet> getAcceNbrTitle() {
		return acceNbrTitle;
	}
	public void setAcceNbrTitle(List<StringBeanSet> acceNbrTitle) {
		this.acceNbrTitle = acceNbrTitle;
	}
	public List<OfferProdAttrsSet> getOfferProdInfos() {
		return offerProdInfos;
	}
	public void setOfferProdInfos(List<OfferProdAttrsSet> offerProdInfos) {
		this.offerProdInfos = offerProdInfos;
	}
}
