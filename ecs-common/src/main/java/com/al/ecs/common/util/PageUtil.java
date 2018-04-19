/**********************************************************
 * Copyright © 2012，联创亚信科技(南京)有限公司
 * All Rights Reserved.
 *
 * 文件名称： PageUtil.java
 * 摘    要： 分页工具类
 *
 * 初始版本：1.0.0
 * 原 作 者：liusd
 * 完成日期：2012-2-17
 *
 ************************************************************/

package com.al.ecs.common.util;

import java.util.List;

import com.al.ecs.common.entity.PageDomain;
import com.al.ecs.common.entity.PageModel;

/**
 * 分页工具类，实现对请求参数及分页信息重构及返回数据重构.<br/> <table>
 * <tr>
 * <td>负责人/principal: </td>
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
 * </table>
 * @author liusd
 * @version V1.0 2012-2-17 上午10:08:47
 */
public class PageUtil {

    /**
     * 
     * 根据页面传递条件重构分页组件所需要对象类型
     * @param pageNo 当前页码
     * @param pageSize 分页条数
     * @param pageParams 页面传递的查询对象
     * @return PageDomain<T> 重构分页组件所需要对象类型
     */
    public static <T> PageDomain<T> buildPageDomain(int pageNo, int pageSize,
    		T pageParams) {
        PageDomain<T> pd = new PageDomain<T>();
        pd.setPageNo(pageNo);
        pd.setPageSize(pageSize);
        pd.setPageParams(pageParams);
        return pd;
    }

    /**
     * 
     * 根据返回结果重构分页组件所需要返回对象类型
     * @param pageNo 当前页码
     * @param pageSize 分页条数
     * @param resultList 查询返回的结果集
     * @return PageModel<T> 构分页组件所需要返回对象类型
     */
    public static <T> PageModel<T> buildPageModel(int pageNo, int pageSize,
    		List<T> resultList) {
        PageModel<T> pm = new PageModel<T>();
        pm.setList(resultList);
        pm.setPageNo(pageNo);
        pm.setPageSize(pageSize);
        return pm;
    }
    /**
     * 
     * 根据返回结果重构分页组件所需要返回对象类型
     * @param pageNo 当前页码
     * @param pageSize 分页条数
     * @param totalRecords 总记录数
     * @param resultList 查询返回的结果集
     * @return PageModel<T> 构分页组件所需要返回对象类型
     */
    public static <T> PageModel<T> buildPageModel(int pageNo, int pageSize,int totalRecords,
            List<T> resultList) {
        PageModel<T> pm = new PageModel<T>();
        pm.setList(resultList);
        pm.setPageNo(pageNo);
        pm.setPageSize(pageSize);
        pm.setTotalRecords(totalRecords);
        return pm;
    }
    /**
     * 
     * 根据返回结果重构分页组件所需要返回对象类型
     * @param <T> pd 页面分页参数对象
     * @param resultList 查询返回的结果集
     * @return PageModel<T> 重构分页组件
     */
    public static <T> PageModel<T> buildPageModel(PageDomain<T> pd
    		,List<T> resultList,int totalRecords) {
        PageModel<T> pm = new PageModel<T>();
        pm.setList(resultList);
        pm.setPageNo(pd.getPageNo());
        pm.setPageSize(pd.getPageSize());
        pm.setTotalRecords(totalRecords);
        return pm;
    }
}
