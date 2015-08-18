package com.al.ecs.common.bmo;

import java.io.Serializable;
import java.util.List;

import com.al.ecs.common.entity.PageDomain;
import com.al.ecs.common.entity.PageModel;
import com.al.ecs.exception.BusinessException;

/**
 *
 * 摘要：通用方法接口定义.
 * 
 * @param <E> 实体
 * @param <PK> 主键
 * @version V1.0 
 *          2012-2-27
 * @author liusd
 */
public interface BaseBMO<E, PK extends Serializable> {
    /**
     * 保存信息.
     * @param entity 信息实体
     */
	Integer insert(E entity) throws BusinessException;

	/**
	 * 有选择插入数据 
	 * @param entity 实体对象数据
	 * @return Integer 无实现默认返回 0
	 * @throws BusinessException
	 */
    Integer insertSelective(E entity) throws BusinessException;

    /**
     * 更新信息.
     * @param entity 信息实体
     */
	Integer update(E entity) throws BusinessException;

    /**
     * 删除信息.
     * @param ids 信息id数组
     */
    void deleteBatch(PK... ids) throws BusinessException;

    /**
     * 删除信息.
     * @param id 信息id
     */
    void delete(PK id) throws BusinessException;

    /**
     * 获取信息.
     * @param id 信息id
     * @return 信息实体
     */
    E get(PK id) throws BusinessException;
    

	/**
	 * 根据条件查询
	 * @param pd PageDomain<E>
	 * @return List<E>  实体对象列表,无实现默认返回 NULL
	 * @throws BusinessException
	 */
    List<E> findDataByCondition(PageDomain<E> pd) throws BusinessException;

    /**
     * 
     * 分页业务逻辑方法  无需事务处理.
     * @param pd 页面请求数据封装，包括分页信息等
     * @return 分页数据对象
     * @throws BusinessException 业务层自定义异常 
     */
    PageModel<E> query(PageDomain<E> pd) throws BusinessException;
    
	/**
	 * 查询所有,status=1
	 * @return List<E>  实体对象列表,无实现默认返回 NULL
	 * @throws BusinessException
	 */
    List<E> findAll() throws BusinessException;
}
