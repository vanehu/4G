package com.al.lte.portal.common.print.dto;

import java.util.List;

/**
 * Created by liuteng on 2015/2/3.
 * 号码基本信息
 */
public class AcceNbrBaseSet {
    private List<StringBeanSet> acceNbrBaseTitle;
    private List<StringBeanSet> acceNbrBaseInfo;

    public List<StringBeanSet> getAcceNbrBaseTitle() {
        return acceNbrBaseTitle;
    }

    public void setAcceNbrBaseTitle(List<StringBeanSet> acceNbrBaseTitle) {
        this.acceNbrBaseTitle = acceNbrBaseTitle;
    }

    public List<StringBeanSet> getAcceNbrBaseInfo() {
        return acceNbrBaseInfo;
    }

    public void setAcceNbrBaseInfo(List<StringBeanSet> acceNbrBaseInfo) {
        this.acceNbrBaseInfo = acceNbrBaseInfo;
    }
}
