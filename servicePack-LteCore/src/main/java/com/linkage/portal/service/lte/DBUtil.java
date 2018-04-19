package com.linkage.portal.service.lte;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 数据库工具类
 * 条件：仅供服务包内部使用、具有特殊业务逻辑，非公用方法
 * @author liusd
 *
 */
public class DBUtil {
    /** 门户配置库 访问模板*/
    public static final String PORTAL_TEMPLATE = "jdbcTemplate";
    /** 服务层配置库 访问模板*/
    public static final String SERVICE_TEMPLATE = "jdbcTemplate";
    /** 读写卡配置库 访问模板*/
    public static final String CARD_TEMPLATE = "cardJdbcTemplate";
    /** 充值缴费配置库 访问模板*/
    public static final String CHARGE_TEMPLATE = "chargeJdbcTemplate";
    /** 日志输出 */
    private static final Logger log = LoggerFactory.getLogger(DBUtil.class);

    /**
     * 系列对象定义
     * @author liusd
     *
     */
    public enum SEQ {

        CUST_ORDER_ID("SEQ_CUST_ORDER_ID"), SOO_ID("SEQ_SOO_ID"), ORDER_ITEM_GROUP_ID("SEQ_ORDER_ITEM_GROUP_ID"), PROD_INST_ID(
                "SEQ_PROD_INST_ID"), ACC_PROD_INST_ID("SEQ_ACC_PROD_INST_ID"), MKT_RES_INST_ID("SEQ_MKT_RES_INST_ID"), PROD_OFFER_INST_ID(
                "SEQ_PROD_OFFER_INST_ID"), SEQ_CARD_RECHARGE_SERIAL("SEQ_CARD_RECHARGE_SERIAL"),
        //现金缴费日志
        SEQ_LOG_DO_CASH("SEQ_LOG_DO_CASH");

        /** 键值 */
        private String val;

        /**
         * 构造方法
         * @param val 键值
         */
        private SEQ(String val) {
            this.val = val;
        }

        /**
         * @return the val
         */
        public String val() {
            return val;
        }
    }


}
