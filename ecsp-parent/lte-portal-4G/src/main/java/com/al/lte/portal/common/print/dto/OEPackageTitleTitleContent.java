package com.al.lte.portal.common.print.dto;

import java.util.List;

/**
 * Created by liuteng on 2015/7/9.
 */
public class OEPackageTitleTitleContent {
    private List<StringBeanSet> orderTitle;
    private List<OETitleContent> orderContent;

    public List<StringBeanSet> getOrderTitle() {
        return orderTitle;
    }

    public void setOrderTitle(List<StringBeanSet> orderTitle) {
        this.orderTitle = orderTitle;
    }

    public List<OETitleContent> getOrderContent() {
        return orderContent;
    }

    public void setOrderContent(List<OETitleContent> orderContent) {
        this.orderContent = orderContent;
    }
}
