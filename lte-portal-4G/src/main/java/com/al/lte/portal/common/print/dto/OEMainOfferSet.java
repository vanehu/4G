package com.al.lte.portal.common.print.dto;

import java.util.List;

/**
 * 购物车－主销售品订购节点
 * @author zhangzc
 *
 */
public class OEMainOfferSet {
	private List<StringBeanSet> mainOfferTitle;
	private List<AcceNbrSet> acceNbrList;
	private List<AcceNbrNewSet> acceNbrNewList;
	private List<OSBaseInfoSet> osBaseInfoList;
	private List<OSBaseInfoSet> osBaseInfoList2;
	private List<OSBaseInfoSet> osOutInfoList;
	private List<OSOrderInfoSet> osOrderInfoList;
	private List<OSOtherInfoSet> osOtherInfoList;
	private List<OSPrompInfoSet> osPrompInfoList;
	private List<OSAttachOfferSet> osAttachOfferList;
	public List<StringBeanSet> getMainOfferTitle() {
		return mainOfferTitle;
	}
	public void setMainOfferTitle(List<StringBeanSet> mainOfferTitle) {
		this.mainOfferTitle = mainOfferTitle;
	}
	public List<AcceNbrSet> getAcceNbrList() {
		return acceNbrList;
	}
	public void setAcceNbrList(List<AcceNbrSet> acceNbrList) {
		this.acceNbrList = acceNbrList;
	}
	public List<AcceNbrNewSet> getAcceNbrNewList() {
		return acceNbrNewList;
	}
	public void setAcceNbrNewList(List<AcceNbrNewSet> acceNbrNewList) {
		this.acceNbrNewList = acceNbrNewList;
	}
	public List<OSBaseInfoSet> getOsBaseInfoList() {
		return osBaseInfoList;
	}
	public void setOsBaseInfoList(List<OSBaseInfoSet> osBaseInfoList) {
		this.osBaseInfoList = osBaseInfoList;
	}
	public List<OSBaseInfoSet> getOsBaseInfoList2() {
		return osBaseInfoList2;
	}
	public void setOsBaseInfoList2(List<OSBaseInfoSet> osBaseInfoList2) {
		this.osBaseInfoList2 = osBaseInfoList2;
	}
	public List<OSBaseInfoSet> getOsOutInfoList() {
		return osOutInfoList;
	}
	public void setOsOutInfoList(List<OSBaseInfoSet> osOutInfoList) {
		this.osOutInfoList = osOutInfoList;
	}
	public List<OSOrderInfoSet> getOsOrderInfoList() {
		return osOrderInfoList;
	}
	public void setOsOrderInfoList(List<OSOrderInfoSet> osOrderInfoList) {
		this.osOrderInfoList = osOrderInfoList;
	}
	public List<OSOtherInfoSet> getOsOtherInfoList() {
		return osOtherInfoList;
	}
	public void setOsOtherInfoList(List<OSOtherInfoSet> osOtherInfoList) {
		this.osOtherInfoList = osOtherInfoList;
	}
	public List<OSPrompInfoSet> getOsPrompInfoList() {
		return osPrompInfoList;
	}
	public void setOsPrompInfoList(List<OSPrompInfoSet> osPrompInfoList) {
		this.osPrompInfoList = osPrompInfoList;
	}
	public List<OSAttachOfferSet> getOsAttachOfferList() {
		return osAttachOfferList;
	}
	public void setOsAttachOfferList(List<OSAttachOfferSet> osAttachOfferList) {
		this.osAttachOfferList = osAttachOfferList;
	}
}
