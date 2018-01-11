package com.linkage.portal.service.lte.dao;

import java.util.List;
import java.util.Map;

/**
 *
 * @author chenhr
 * @version 1.0.0
 * @since 2015-11-30
 */

public interface PayDao {

    /**
     * 取支付记录数据.
     * @param paramMap
     * @return
     * @throws Exception
     */
    List<Map<String, Object>> getPayOrderData(Map<String, Object> paramMap) throws Exception;

    /**
     * 写入支付记录.
     * @param paramMap
     * @return
     * @throws Exception
     */
    int insertPayOrder(Map<?, ?> paramMap) throws Exception;

    /**
     * 查询busiOrderId是否存在.
     * @param busiOrderId
     * @param payType
     * @return
     * @throws Exception
     */
    int queryBusiOrderId(String busiOrderId, String payType) throws Exception;

    /**
     * 更新支付记录订单状态.
     * @param paramMap
     * @return
     * @throws Exception
     */
    int updateOrderStatus(Map<String, Object> paramMap) throws Exception;

    /**
     * 更新支付状态.
     * @param paramMap
     * @return
     * @throws Exception
     */
    int updatePayStatus(Map<?, ?> paramMap) throws Exception;

    /**
     * 写入对账总表.
     * @param paramMap
     * @return
     * @throws Exception
     */
    int insertPayAcctCheck(Map<String, Object> paramMap) throws Exception;

    /**
     * 获得返销表ID.
     * @return
     * @throws Exception
     */
    long getSeriaId() throws Exception;

    /**
     * 写入支付补偿表.
     * @param paramMap
     * @return
     * @throws Exception
     */
    int insertPayComList(Map<String, Object> paramMap) throws Exception;

    /**
     * 写入支付补偿表.
     * @param list
     * @throws Exception
     */
    void insertPayComList(List<Map<String, Object>> list) throws Exception;

}
