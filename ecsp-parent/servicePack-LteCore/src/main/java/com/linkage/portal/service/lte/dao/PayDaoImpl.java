package com.linkage.portal.service.lte.dao;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.jdbc.core.JdbcTemplate;

import com.ailk.ecsp.util.SpringContextUtil;
import com.linkage.portal.service.lte.DBUtil;

/**
 *
 * @author chenhr
 * @version 1.0.0
 * @since 2015-11-30
 */

public class PayDaoImpl implements PayDao {

    private JdbcTemplate jdbc = (JdbcTemplate) SpringContextUtil.getBean(DBUtil.PORTAL_TEMPLATE);

    /* (non-Javadoc)
     * @see com.linkage.portal.service.lte.dao.PayDao
     * #getPayOrderData(java.util.Map)
     */
    public List<Map<String, Object>> getPayOrderData(Map<String, Object> paramMap) throws Exception {
        StringBuilder sbSql = new StringBuilder();
        sbSql.append("SELECT T.ORDER_ID,T.PAY_ORDER_ID,T.BUSI_ORDER_ID,");
        sbSql.append("T.PAY_BACK_ORDER_ID,T.AMOUNT,T.PAY_STATUS,T.PAY_TYPE,");
        sbSql.append("T.BIND_ID,T.PLATFORM_ID,T.PAY_RESULT,T.PAY_PLAT,");
        sbSql.append("TO_CHAR(T.CREATE_DATE, 'YYYYMMDDHH24MISS') BUSI_DATE,");
        sbSql.append("TO_CHAR(T.MODIFY_DATE, 'YYYYMMDDHH24MISS') ORDER_DATE ");
        sbSql.append("FROM PAY_ORDER T ");
        sbSql.append("WHERE TO_CHAR(T.MODIFY_DATE, 'YYYYMMDD')=? ");
        sbSql.append("AND T.PAY_PLAT=? AND T.BIND_ID=? AND T.ORDER_STATUS='-1'");

        Object[] params = {
            paramMap.get("transDate"), paramMap.get("payPlat"),
            paramMap.get("merid")
        };

        return jdbc.queryForList(sbSql.toString(), params);
    }

    /* (non-Javadoc)
     * @see com.linkage.portal.service.lte.dao.PayDao
     * #insertPayOrder(java.util.Map)
     */
    public int insertPayOrder(Map<?, ?> paramMap) throws Exception {
        StringBuffer sbSql = new StringBuffer();
        sbSql.append("INSERT INTO PAY_ORDER(ORDER_ID,PAY_ORDER_ID,");
        sbSql.append("BUSI_ORDER_ID,AMOUNT,CREATE_DATE,PAY_STATUS,");
        sbSql.append("PAY_TYPE,BIND_ID,PLATFORM_ID,IP_ADDR,PAY_RESULT,");
        sbSql.append("PAY_PLAT,ORDER_STATUS,BUSI_PAY_ID,TERMINAL_ID) ");
        sbSql.append("VALUES(SEQ_PAY_ORDER.NEXTVAL,?,?,?,SYSDATE,?,?,");
        sbSql.append("?,?,?,?,?,?,?,?)");

        String ipAddr = MapUtils.getString(paramMap, "ipAddr", "");
        String busiPayId = MapUtils.getString(paramMap, "busiPayId", "");
        String terminalId = MapUtils.getString(paramMap, "terminalId", "");
        Object[] params = new Object[] {
            paramMap.get("payOrderId"), paramMap.get("busiOrderId"),
            paramMap.get("amount"), "1", paramMap.get("payType"),
            paramMap.get("bindId"), "CRM", ipAddr, "2",
            paramMap.get("payPlat"), "-1", busiPayId, terminalId
        };

        return jdbc.update(sbSql.toString(), params);
    }

    /* (non-Javadoc)
     * @see com.linkage.portal.service.lte.dao.PayDao
     * #updatePayStatus(java.util.Map)
     */
    public int updatePayStatus(Map<?, ?> paramMap) throws Exception {
        StringBuilder sbSql = new StringBuilder();
        sbSql.append("UPDATE PAY_ORDER ");
        sbSql.append("SET PAY_RESULT=?, PAY_BACK_ORDER_ID=?,");
        sbSql.append("REMARK=?, MODIFY_DATE=SYSDATE ");
        sbSql.append("WHERE BUSI_ORDER_ID=? AND PAY_TYPE=?");

        String payBackOrderId = MapUtils.getString(paramMap, "payBackOrderId", "");
        String remark = MapUtils.getString(paramMap, "remark", "");
        
        Object[] params = {
            paramMap.get("payResult"), payBackOrderId,
            remark, paramMap.get("busiOrderId"), paramMap.get("payType")
        };

        return jdbc.update(sbSql.toString(), params);
    }

    /*
     * (non-Javadoc)
     * @see com.linkage.portal.service.lte.dao.PayDao
     * #queryBusiOrderId(java.lang.String, java.lang.String)
     */
    public int queryBusiOrderId(String busiOrderId, String payType) throws Exception {
        StringBuilder sbSql = new StringBuilder();
        sbSql.append("SELECT COUNT(1) FROM PAY_ORDER ");
        sbSql.append("WHERE BUSI_ORDER_ID=? AND PAY_TYPE=?");
        
        return jdbc.queryForInt(sbSql.toString(), busiOrderId, payType);
    }

    /* (non-Javadoc)
     * @see com.linkage.portal.service.lte.dao.PayDao
     * #updateOrderStatus(java.util.Map)
     */
    public int updateOrderStatus(Map<String, Object> paramMap) throws Exception {
        StringBuilder sbSql = new StringBuilder();
        sbSql.append("UPDATE PAY_ORDER ");
        sbSql.append("SET ORDER_STATUS=? ");
        sbSql.append("WHERE ORDER_ID=?");

        Object[] params = {
            paramMap.get("ORDER_STATUS"), paramMap.get("ORDER_ID")
        };

        return jdbc.update(sbSql.toString(), params);
    }

    /* (non-Javadoc)
     * @see com.linkage.portal.service.lte.dao.PayDao
     * #insertPayAcctCheck(java.util.Map)
     */
    public int insertPayAcctCheck(Map<String, Object> paramMap) throws Exception {
        StringBuilder sbSql = new StringBuilder();
        sbSql.append("INSERT INTO PAY_ACCT_CHECK(CHECK_ID,");
        sbSql.append("CHECK_DAY,ORDER_ID,PAY_ORDER_ID,BUSI_ORDER_ID,");
        sbSql.append("AMOUNT,CREATE_DATE,PAY_STATUS,PAY_TYPE,");
        sbSql.append("PAY_PLAT,BIND_ID,PAY_RESULT,CHECK_STATE,");
        sbSql.append("BUSI_TIME,BUSI_PAY_TYPE,BUSI_AMOUNT,");
        sbSql.append("BUSI_PAY_RESULT,PLAT_TIME,PLAT_PAY_TYPE,");
        sbSql.append("PLAT_AMOUNT,PLAT_PAY_RESULT,PLATFORM_ID,CHECK_TYPE,");
        sbSql.append("SERIA_ID) VALUES(SEQ_PAY_ACCT_CHECK.NEXTVAL,");
        sbSql.append("?,?,?,?,?,SYSDATE,?,?,?,?,?,'0',");
        sbSql.append("TO_DATE(?,'YYYY-MM-DD HH24:MI:SS'),");
        sbSql.append("?,?,?,TO_DATE(?,'YYYY-MM-DD HH24:MI:SS'),");
        sbSql.append("?,?,?,?,'1',?)");

        String payType = MapUtils.getString(paramMap, "PAY_TYPE");
        if (StringUtils.isBlank(payType)) {
            payType = MapUtils.getString(paramMap, "payType");
        }
        String payPlat = MapUtils.getString(paramMap, "PAY_PLAT");
        if (StringUtils.isBlank(payPlat)) {
            payPlat = MapUtils.getString(paramMap, "payPlat");
        }
        String bindId = MapUtils.getString(paramMap, "BIND_ID");
        if (StringUtils.isBlank(bindId)) {
            bindId = MapUtils.getString(paramMap, "bindId");
        }
        String payResult = MapUtils.getString(paramMap, "payResult");

        Object[] params = {
            paramMap.get("ACCT_DAY"),
            MapUtils.getObject(paramMap, "ORDER_ID", ""),
            MapUtils.getObject(paramMap, "PAY_ORDER_ID", ""),
            MapUtils.getObject(paramMap, "BUSI_ORDER_ID", ""),
            MapUtils.getObject(paramMap, "AMOUNT", ""),
            MapUtils.getObject(paramMap, "PAY_STATUS", ""),
            payType, payPlat, bindId, payResult,
            MapUtils.getObject(paramMap, "BUSI_DATE", ""),
            MapUtils.getObject(paramMap, "BUSI_PAY_TYPE", ""),
            MapUtils.getObject(paramMap, "BUSI_AMOUNT", ""),
            MapUtils.getObject(paramMap, "PAY_RESULT", ""),
            MapUtils.getObject(paramMap, "ORDER_DATE", ""),
            MapUtils.getObject(paramMap, "payType", ""),
            MapUtils.getObject(paramMap, "payAmount", ""),
            payResult,
            MapUtils.getObject(paramMap, "PLATFORM_ID", ""),
            MapUtils.getObject(paramMap, "SERIA_ID", "")
        };

        return jdbc.update(sbSql.toString(), params);
    }

    /*
     * (non-Javadoc)
     * @see com.linkage.portal.service.lte.dao.PayDao#getSeriaId()
     */
    public long getSeriaId() throws Exception {
        StringBuffer sbSql = new StringBuffer();
        sbSql.append("SELECT SEQ_PAY_COM_LIST.NEXTVAL AS SERIA_ID FROM DUAL");
        return jdbc.queryForLong(sbSql.toString());
    }

    /*
     * (non-Javadoc)
     * @see com.linkage.portal.service.lte.dao.PayDao
     * #insertPayComList(java.util.Map)
     */
    public int insertPayComList(Map<String, Object> paramMap) throws Exception {
        StringBuilder sbSql = new StringBuilder();
        sbSql.append("INSERT INTO PAY_COM_LIST(SERIA_ID,");
        sbSql.append("ORDER_ID,CHECK_RESULT,PAY_NUM,");
        sbSql.append("PAY_RESULT,BIND_ID,CREATED_DATE,");
        sbSql.append("PAY_TYPE,PAY_STATUS,PAY_PLAT_DK,");
        sbSql.append("PAY_PLAT,PAY_ORDER_ID,ORDER_DATE,");
        sbSql.append("BUSI_ORDER_ID,ACCT_DAY,PLATFORM_ID) ");
        sbSql.append("VALUES(?,?,'2',?,?,?,SYSDATE,?,?,?,?,?,");
        sbSql.append("TO_DATE(?,'YYYY-MM-DD HH24:MI:SS'),");
        sbSql.append("?,?,?)");

        Object[] params = {
            paramMap.get("SERIA_ID"), paramMap.get("ORDER_ID"), paramMap.get("AMOUNT"),
            paramMap.get("PAY_RESULT"), paramMap.get("BIND_ID"), paramMap.get("PAY_TYPE"),
            paramMap.get("PAY_STATUS"), paramMap.get("PAY_PLAT_DK"), paramMap.get("PAY_PLAT"),
            paramMap.get("PAY_ORDER_ID"), paramMap.get("ORDER_DATE"), paramMap.get("BUSI_ORDER_ID"),
            paramMap.get("ACCT_DAY"), paramMap.get("PLATFORM_ID")
        };

        return jdbc.update(sbSql.toString(), params);
    }

    /* (non-Javadoc)
     * @see com.linkage.portal.service.lte.dao.PayDao
     * #insertPayComList(java.util.List)
     */
    public void insertPayComList(List<Map<String, Object>> list) throws Exception {
        StringBuilder sbSql = new StringBuilder();
        sbSql.append("INSERT INTO PAY_COM_LIST(SERIA_ID,");
        sbSql.append("ORDER_ID,CHECK_RESULT,PAY_NUM,");
        sbSql.append("PAY_RESULT,BIND_ID,CREATED_DATE,");
        sbSql.append("PAY_TYPE,PAY_STATUS,PAY_PLAT_DK,");
        sbSql.append("PAY_PLAT,PAY_ORDER_ID,ORDER_DATE,");
        sbSql.append("BUSI_ORDER_ID,ACCT_DAY,PLATFORM_ID) ");
        sbSql.append("VALUES(SEQ_PAY_COM_LIST.NEXTVAL,");
        sbSql.append("?,'2',?,?,?,SYSDATE,?,?,?,?,?,");
        sbSql.append("TO_DATE(?,'YYYY-MM-DD HH24:MI:SS'),");
        sbSql.append("?,?,?)");

        List<Object[]> paramsList = new ArrayList<Object[]>();
        for (Map<String, Object> map : list) {
            Object[] params = {
                map.get("ORDER_ID"), map.get("AMOUNT"), map.get("PAY_RESULT"),
                map.get("BIND_ID"), map.get("PAY_TYPE"), map.get("PAY_STATUS"),
                map.get("PAY_PLAT_DK"), map.get("PAY_PLAT"), map.get("PAY_ORDER_ID"),
                map.get("ORDER_DATE"), map.get("BUSI_ORDER_ID"), map.get("ACCT_DAY"),
                map.get("PLATFORM_ID")
            };
            paramsList.add(params);
        }

        jdbc.batchUpdate(sbSql.toString(), paramsList);
    }

}
