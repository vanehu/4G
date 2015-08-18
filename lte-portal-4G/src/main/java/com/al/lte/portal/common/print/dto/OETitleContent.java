package com.al.lte.portal.common.print.dto;

import java.util.List;

/**
 * 标题-内容
 * Created by liuteng on 2015/7/8.
 */
public class OETitleContent {
    public List<StringBeanSet> getOrderTitle() {
        return orderTitle;
    }

    public void setOrderTitle(List<StringBeanSet> orderTitle) {
        this.orderTitle = orderTitle;
    }

    public List<StringBeanSet> getOrderContent() {
        return orderContent;
    }

    public void setOrderContent(List<StringBeanSet> orderContent) {
        this.orderContent = orderContent;
    }

    private List<StringBeanSet> orderTitle;
    private List<StringBeanSet> orderContent;
}
