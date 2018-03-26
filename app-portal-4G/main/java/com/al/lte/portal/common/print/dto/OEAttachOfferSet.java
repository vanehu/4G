package com.al.lte.portal.common.print.dto;

import java.util.List;

/**
 * 购物车－附属销售品[订购、续订、变更、退订]，主销售品[退订、注销]
 * @author zhangzc
 *
 */
public class OEAttachOfferSet {
	private List<StringBeanSet> attachOfferTitle;
	private List<StringBeanSet> attachOfferCont;
	private List<OETitleContent> titleContent;
	private List<OEPackageTitleTitleContent> packageTitleContent;
	private List<AcceNbrBaseSet> acceNbrBaseList;
    private List<BaseAttachOfferInfosSet> baseAttachOfferInfosList;
	private List<OSOrderInfoSet> osOrderInfoList;
	private List<OSOtherInfoSet> osOtherInfoList;
	private List<OSPrompInfoSet> osPrompInfoList;

	public List<AcceNbrBaseSet> getAcceNbrBaseList() {
		return acceNbrBaseList;
	}
	public void setAcceNbrBaseList(List<AcceNbrBaseSet> acceNbrBaseList) {
		this.acceNbrBaseList = acceNbrBaseList;
	}
    public List<BaseAttachOfferInfosSet> getBaseAttachOfferInfosList() {
        return baseAttachOfferInfosList;
    }
    public void setBaseAttachOfferInfosList(List<BaseAttachOfferInfosSet> baseAttachOfferInfosList) {
        this.baseAttachOfferInfosList = baseAttachOfferInfosList;
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
	public List<StringBeanSet> getAttachOfferTitle() {
		return attachOfferTitle;
	}
	public void setAttachOfferTitle(List<StringBeanSet> attachOfferTitle) {
		this.attachOfferTitle = attachOfferTitle;
	}
	public List<StringBeanSet> getAttachOfferCont() {
		return attachOfferCont;
	}
	public void setAttachOfferCont(List<StringBeanSet> attachOfferCont) {
		this.attachOfferCont = attachOfferCont;
	}
	public List<OETitleContent> getTitleContent() {
		return titleContent;
	}
	public void setTitleContent(List<OETitleContent> titleContent) {
		this.titleContent = titleContent;
	}
	public List<OEPackageTitleTitleContent> getPackageTitleContent() {
		return packageTitleContent;
	}
	public void setPackageTitleContent(List<OEPackageTitleTitleContent> packageTitleContent) {
		this.packageTitleContent = packageTitleContent;
	}
}
