package com.al.lte.portal.common.print.dto;

import java.util.List;

/**
 * Created by liuteng on 2015/3/3.
 */
public class BaseAttachOfferInfosSet {

    private List<StringBeanSet> baseAttachOfferTitle;
    private List<StringBeanSet> baseAttachOfferInfos;

    public List<StringBeanSet> getBaseAttachOfferTitle() {
        return baseAttachOfferTitle;
    }

    public void setBaseAttachOfferTitle(List<StringBeanSet> baseAttachOfferTitle) {
        this.baseAttachOfferTitle = baseAttachOfferTitle;
    }

    public List<StringBeanSet> getBaseAttachOfferInfos() {
        return baseAttachOfferInfos;
    }

    public void setBaseAttachOfferInfos(List<StringBeanSet> baseAttachOfferInfos) {
        this.baseAttachOfferInfos = baseAttachOfferInfos;
    }

}
