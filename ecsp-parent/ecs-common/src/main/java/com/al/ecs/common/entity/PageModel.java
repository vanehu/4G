/**********************************************************
 * Copyright © 2012，联创亚信科技(南京)有限公司
 * All Rights Reserved.
 *
 * 文件名称： PageModel.java
 * 摘    要： 分页数据模型
 *
 * 初始版本：1.0.0
 * 原 作 者：liusd
 * 完成日期：2012-2-10
 *
 * 当前版本：$LastChangedRevision$
 * 作    者：$LastChangedBy$
 * 完成日期：$LastChnagedDate$
 ************************************************************/
package com.al.ecs.common.entity;

import java.io.Serializable;
import java.util.List;

/**
 * 
 * 分页实体.<br/>
 * <table>
 * <tr>
 * <td>负责人/principal:</td>
 * <td colspan="2">liusd</td>
 * <tr>
 * <td>修改记录/revision:</td>
 * <td colspan="2"></td>
 * </tr>
 * <tr>
 * <td>日期:</td>
 * <td>修改人:</td>
 * <td>修改说明:</td>
 * </tr>
 * <tr>
 * <td></td>
 * <td></td>
 * <td></td>
 * </tr>
 * </table>
 * @author liusd
 * @version $Id$
 * @param <T>
 */
public class PageModel<T> implements Serializable {

    private static final long serialVersionUID = -8169250794110998950L;

    public static final int PAGESIZE = 20;

    public static final int TOTALRECORDS = 0;

    /* 总记录数 */
    private int totalRecords = TOTALRECORDS;

    /* 结果集 */
    private List<T> list;

    /* 当前页 */
    private int pageNo = 1;

    /* 每页显示多少条 */
    private int pageSize = PAGESIZE;

    /**
     * 总条数
     * @return
     */
    public int getTotalRecords() {
        return totalRecords;
    }

    /**
     * 取得总页数.
     * @return int
     */
    public int getTotalPages() {
        int pageCount = totalRecords / pageSize;
        return (totalRecords % pageSize) > 0 ? (pageCount + 1) : (pageCount);
    }

    /**
     * 设置总条数
     * @param totalRecords
     */
    public void setTotalRecords(int totalRecords) {
        this.totalRecords = totalRecords;
    }

    /**
     * 返回结果集
     * @return List<T> 结果集
     */
    public List<T> getList() {
        return list;
    }

    /**
     * 设置结果集
     * @param List<T> 结果集
     */
    public void setList(List<T> list) {
       this.list = list;
    }

    /**
     * 返回每页显示条数
     * @return int 每页显示条数
     */
    public int getPageSize() {
        return pageSize;
    }

    /**
     * 设置每页显示条数
     * @param pageSize 设置每页显示条数
     */
    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    /**
     * 返回当前页码
     * @return int 当前页码
     */
    public int getPageNo() {
        return pageNo;
    }

    /**
     * 设置当前页码
     * @param pageNo 当前页码
     */
    public void setPageNo(int pageNo) {
        this.pageNo = pageNo;
    }

    /**
     * 取得第一页.
     * @return int 
     */
    public int getTopPageNo() {
        return 1;
    }

    /**
     * 取得上一页.
     * @return int  
     */
    public int getPreviousPageNo() {
        if (pageNo <= 1) {
            return 1;
        }
        return pageNo - 1;
    }

    /**
     * 取得下一页.
     * @return int
     */
    public int getNextPageNo() {
        int totalPages = getTotalPages();
        if (pageNo >= totalPages) {
            return totalPages == 0 ? 1 : totalPages;
        }
        return pageNo + 1;
    }

    /**
     * 当前页的开始索引,默认从0开始
     * @return
     */
    public int getStartIndex() {
        int totalPages = getTotalPages();
        if (pageNo > totalPages && totalPages > 0) {
            return (totalPages - 1) * pageSize;
        }
        return (pageNo - 1) * pageSize;
    }

    /**
     * 当前页的最后索引 
     * @return
     */
    public int getEndIndex() {
        int endIndex = getStartIndex() + pageSize;
        if (endIndex >= totalRecords)
            return totalRecords + 1;
        else
            return endIndex;
    }

    /**.
     * 取得最后一页
     * @return int
     */
    public int getBottomPageNo() {
        return getTotalPages() == 0 ? 1 : getTotalPages();
    }
}
