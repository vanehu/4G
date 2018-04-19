/**********************************************************
 * Copyright © 2012，联创亚信科技(南京)有限公司
 * All Rights Reserved.
 *
 * 文件名称： PageDomain.java
 * 摘    要： 基类查询对象封装,提供方法调用时入参类型
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
import java.util.ArrayList;
import java.util.List;

/**
 * 摘要:基类查询对象封装.<br/>
 * 
 * @param <T> 泛型类实体
 * @author liusd
 * @version V1.0 2012-2-17 
 */
public class PageDomain<T> implements Serializable {
    /** Serializable */
    private static final long serialVersionUID = 4939445416552057945L;

    /** 查询条件对象数组 */
    private List<WhereObj> whereObjList=new ArrayList<WhereObj>();
    /** 查询排序 */
    private String orderBy;
    /** 唯一 */
    private boolean distinct =false;

	/** 当前页码*/
    private int pageNo = 1;

    /** 默认每页显示条数 */
    private int pageSize = PageModel.PAGESIZE;
    
    /** 参数对象,从view层传入的对象用于组装sql的查询条件*/
    private T pageParams ;

    /**
     * 初始化所有参数
     */
    public void clear(){
    	this.pageParams=null;
    	this.pageSize = PageModel.PAGESIZE;;
    	this.pageNo = 1;
    	this.distinct =false;
    	this.orderBy=null;
    	this.whereObjList=new ArrayList<WhereObj>();
    }

    public T getPageParams() {
        return pageParams;
    }

    public void setPageParams(T pageParams) {
        this.pageParams = pageParams;
    }

    public int getPageNo() {
        return pageNo;
    }

    public void setPageNo(int pageNo) {
        this.pageNo = pageNo;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public String getOrderBy() {
        return orderBy;
    }

    public void setOrderBy(String orderBy) {
        this.orderBy = orderBy;
    }

    public List<WhereObj>  getWhereObjList() {
        return this.whereObjList;
        
    }
    public void  addWhereObjList(WhereObj whereObj) {
        this.whereObjList.add(whereObj);
    }
    public boolean isDistinct() {
		return distinct;
	}

	public void setDistinct(boolean distinct) {
		this.distinct = distinct;
	}
}
