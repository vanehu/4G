package com.al.ecs.common.dao;

import java.io.Serializable;
import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.al.ecs.common.entity.PageDomain;

/**
 * DAO操作常用方法. 
 * 
 * @author liusd
 * @version V1.0 2012-2-10
 * @createDate 2012-2-10 上午12:34:09
 * @modifyDate liusd 2012-2-10<BR>
 * @copyRight 亚信联创电信CRM研发部
 * @param <T>
 * @param <PK>
 */
public interface BaseDAO<T, PK extends Serializable> {
    /**
     * 保存实体.
     * @param entity 实体id
     */
    public int insert(T entity) throws Exception;

    /**
     * 有选择的保存实体.
     * @param entity 实体id
     */
    public int insertSelective(T entity) throws Exception;
    
    /**
     * 更新实体.
     * @param entity 实体
     */
    public int update(T entity) throws Exception;

    /**
     * 删除实体.
     * @param ids 实体id数组
     */
    public int deleteBatch(PK... ids) throws Exception;

    /**
     * 删除实体.
     * @param id 实体id
     */
    public int delete(PK id) throws Exception;

    /**
     * 获取实体.
     * @param <T>
     * @param id 实体id
     * @return T
     */
    public T get(PK id) throws Exception;

    /**
     * 根据条件获取分页数据.
     * @param <T>
     * @param firstIndex 开始索引
     * @param maxIndex 结束索引
     * @param pd 查询条件对象
     * @return List<T> 结果集
     */
    public List<T> findPageDataByWhereAndOrderBy(@Param(value = "firstIndex") int firstIndex,
            @Param(value = "maxIndex") int maxIndex, @Param(value = "pd") PageDomain<T> pd) throws Exception;

    /**
     * 指定取指定范围的数据
     * @param firstIndex 开始索引
     * @param maxIndex 结束索引
     * @return List<T> 结果集
     * @throws Exception
     */
    public List<T> findPageData(@Param(value = "firstIndex") int firstIndex, @Param(value = "maxIndex") int maxIndex)
            throws Exception;

    /**
     * 查询所有数据
     * @return List<T>  结果集
     * @throws Exception
     */
    public List<T> findAllData() throws Exception;

    /**
     * 按条件查询所有数据
     * @param pd 查询条件对象
     * @return List<T>  结果集
     * @throws Exception
     */
    public List<T> findDataByCondition(@Param(value = "pd") PageDomain<T> pd)
            throws Exception;
    /**
     * 获取记录总数.
     * @param pd PageDomain实体类
     * @return int 记录总数
     */
    public int getCount(@Param(value = "pd") PageDomain<T> pd) throws Exception;
}
