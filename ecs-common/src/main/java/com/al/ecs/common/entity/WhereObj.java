/**********************************************************
 * Copyright © 2012，联创亚信科技(南京)有限公司
 * All Rights Reserved.
 *
 * 文件名称： PageDomain.java
 * 摘    要： 页面请求对象(用于分页查询,包括查询条件，排序)
 *
 * 初始版本：1.0.0
 * 原 作 者：liusd
 * 完成日期：2012-2-9
 *
 * 当前版本：$LastChangedRevision$
 * 作    者：$LastChangedBy$
 * 完成日期：$LastChnagedDate$
 ************************************************************/

package com.al.ecs.common.entity;

import java.io.Serializable;
import java.util.List;

/**
 * 页面请求对象.<br/>
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
 * @modify tang zheng yu
 * @version $Id$
 */
public class WhereObj implements Serializable {
    
    private static final long serialVersionUID = 7936598858100519749L;

    /** 查询条件内容,内容需要根据顺序，操作符左边部分，如：a.name = 'AAA' */
    private String whereKey;
    /**
     * 操作符,内容需要根据顺序,目前支持=,>,<,in ,not in,<=,>= ,<> 等常用, 如需其它需要在SQL配置文件自行实现
     */
    private String whereOp;
    /** 查询条件内容,内容需要根据顺序，操作符右边部分，如：a.name = 'BB' */
    private Object[] whereVal;
    private String whereValType="array";
	private List<?> whereValList;
    
    /** 值为SQL,注意防注入*/
    private String whereValSql;

    /**
     * 默认构造函数
     */
    public WhereObj(){
    }

    /**
     * 通过key 判断符,值传条件
     * @param whereKey 列名
     * @param whereOp 条件符号
     * @param whereVal []值
     */
    public WhereObj(String whereKey,String whereOp,Object[] whereVal){
    	this.whereKey=whereKey;
    	this.whereOp=whereOp;
    	 this.whereVal=whereVal;
    }
    
    /**
     * 通过key 判断符,值传条件
     * @param whereKey 列名
     * @param whereOp 条件符号
     * @param whereVal []值
     */
    public WhereObj(String whereKey,String whereOp,Object whereVal){
    	this.whereKey=whereKey;
    	this.whereOp=whereOp;
    	 if(whereVal!=null){
    		 if(whereVal instanceof List){
    			 whereValType="list";
    			 whereValList=(List<?>) whereVal;
    		 }else{
    			 setWhereVal(whereVal);
    		 }
    	 }
    }

    /**
     * 通过key 判断符,值传条件
     * @param whereKey 列名
     * @param whereOp 条件符号
     * @param whereVal List<Object>值
     */
    public WhereObj(String whereKey,String whereOp,List<Object> whereVal){
    	this.whereKey=whereKey;
    	this.whereOp=whereOp;
    	if(whereVal!=null && whereVal.size()>0){
    		int len=whereVal.size();
        	this.whereVal=whereVal.toArray(new Object[len]);
    	}
    }
    /**
     * 
     * @param whereValSql
     */
    public WhereObj(String whereValSql){
    	this.whereValSql=whereValSql;
    }
    /**
     * 值为SQL,注意防注入
     * @return String 值为SQL
     */
    public String getWhereValSql() {
		return whereValSql;
	}

    /**
     * 值为SQL,注意防注入
     * @param whereValSql 值为SQL
     */
	public void setWhereValSql(String whereValSql) {
		this.whereValSql = whereValSql;
	}

	public String getWhereKey() {
        return whereKey;
    }

    public void setWhereKey(String whereKey) {
        this.whereKey = whereKey;
    }

    public String getWhereOp() {
        return whereOp;
    }

    public void setWhereOp(String whereOp) {
        this.whereOp = whereOp;
    }

    public Object[] getWhereVal() {
        return whereVal;
    }

    public void setWhereVal(Object[] whereVal) {
        this.whereVal = whereVal;
    }
    public void setWhereVal(Object whereVal) {
    	if(whereVal !=null) {
    		this.whereVal = new Object[]{whereVal};
    	}
    }
    public String getWhereValType() {
		return whereValType;
	}

	public void setWhereValType(String whereValType) {
		this.whereValType = whereValType;
	}

	public List<?> getWhereValList() {
		return whereValList;
	}

	public void setWhereValList(List<Object> whereValList) {
		this.whereValList = whereValList;
	}
}
