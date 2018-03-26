package com.al.lte.portal.common.print.dto;

import java.util.List;

/**
 * 订购项－包含所有类型的购物车订购节点
 * @author zhangzc
 *
 */
public class OrderEventSet {
	private String hasPreSplitLine;
	private String hasSufSplitLine;
	private List<OETermOfferSet> termOfferList;
	private List<OEMainOfferSet> mainOfferList;
	private List<OEProdChangeSet> prodChangeList;
	private List<OECustChangeSet> custChangeList;
	private List<OEAcctChangeSet> acctChangeList;
	private List<OEAttachOfferSet> attachOfferList;
	public String getHasPreSplitLine() {
		return hasPreSplitLine;
	}
	public void setHasPreSplitLine(String hasPreSplitLine) {
		this.hasPreSplitLine = hasPreSplitLine;
	}
	public String getHasSufSplitLine() {
		return hasSufSplitLine;
	}
	public void setHasSufSplitLine(String hasSufSplitLine) {
		this.hasSufSplitLine = hasSufSplitLine;
	}
	public List<OETermOfferSet> getTermOfferList() {
		return termOfferList;
	}
	public void setTermOfferList(List<OETermOfferSet> termOfferList) {
		this.termOfferList = termOfferList;
	}
	public List<OEMainOfferSet> getMainOfferList() {
		return mainOfferList;
	}
	public void setMainOfferList(List<OEMainOfferSet> mainOfferList) {
		this.mainOfferList = mainOfferList;
	}
	public List<OEProdChangeSet> getProdChangeList() {
		return prodChangeList;
	}
	public void setProdChangeList(List<OEProdChangeSet> prodChangeList) {
		this.prodChangeList = prodChangeList;
	}
	public List<OECustChangeSet> getCustChangeList() {
		return custChangeList;
	}
	public void setCustChangeList(List<OECustChangeSet> custChangeList) {
		this.custChangeList = custChangeList;
	}
	public List<OEAcctChangeSet> getAcctChangeList() {
		return acctChangeList;
	}
	public void setAcctChangeList(List<OEAcctChangeSet> acctChangeList) {
		this.acctChangeList = acctChangeList;
	}
	public List<OEAttachOfferSet> getAttachOfferList() {
		return attachOfferList;
	}
	public void setAttachOfferList(List<OEAttachOfferSet> attachOfferList) {
		this.attachOfferList = attachOfferList;
	}
}
