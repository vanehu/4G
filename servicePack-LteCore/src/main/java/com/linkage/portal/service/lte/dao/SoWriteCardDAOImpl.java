package com.linkage.portal.service.lte.dao;



import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;

import com.ailk.ecsp.util.SpringContextUtil;
import com.linkage.portal.service.lte.DBUtil;
import com.linkage.portal.service.lte.WriteCardUtil;

public class SoWriteCardDAOImpl implements SoWriteCardDAO {
	private final Logger log = LoggerFactory.getLogger(SoWriteCardDAOImpl.class);
	
    /**
     * 根据卡商编码查找其动态链接库信息
     * @param factoryCode
     * @return
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getCardDllInfo(String factoryCode) throws Exception {
        if (StringUtils.isBlank(factoryCode)) {
            throw new Exception("factoryCode is blank ");
        }
        StringBuffer sql = new StringBuffer();
        sql.append("SELECT ACTION,");
        sql.append("       DLL_ID,");
        sql.append("       DLL_NAME,");
        sql.append("       DLL_VERSION,");
        sql.append("       FACTORY_CODE,");
        sql.append("       FLAG,");
        sql.append("       STATE,");
        sql.append("       PASSWORD,");
        sql.append("       AUTHCODE_TYPE");
        sql.append("  FROM LMC_LOCAL_DLL_INFO");
        sql.append(" WHERE FLAG = 1");
        sql.append("   AND STATE = 'C'");
        sql.append("   AND FACTORY_CODE = ? ");
        sql.append("   AND ROWNUM <= 2");

        JdbcTemplate jdbc = (JdbcTemplate) SpringContextUtil.getBean(DBUtil.PORTAL_TEMPLATE);

        Map<String, Object> map = jdbc.queryForMap(sql.toString(), new String[] { factoryCode });
        return map;
    }

    /**
     * 现场写卡--获取密码
     * @param factoryCode 厂商
     * @param keyType 密钥类型
     */
    @SuppressWarnings("unchecked")
    public String getPasswordKey(String factoryCode, String keyType) throws Exception {
        if (StringUtils.isBlank(factoryCode)) {
            throw new Exception("factoryCode is blank");
        }
        if (StringUtils.isBlank(keyType)) {
            throw new Exception("keyType is blank");
        }

        StringBuffer sql = new StringBuffer();
        sql.append("SELECT PWD_KEY_VALUE");
        sql.append("  FROM LMC_WRITE_CARD_PWD_INFO");
        sql.append(" WHERE STATE = '1'");
        sql.append("   AND FACTORY_CODE = ? ");
        sql.append("   AND PWD_TYPE_CD = ? ");
        

        JdbcTemplate jdbc = (JdbcTemplate) SpringContextUtil.getBean(DBUtil.PORTAL_TEMPLATE);

        List<String> list = jdbc.queryForList(sql.toString(), new String[] { factoryCode, keyType},String.class);
        if (list.isEmpty()) {
            return null;
        } else {
            return list.get(0);
        }
    }

    @SuppressWarnings("unchecked")
    public String getRscKey(String cryptIndex) throws Exception {
        if (StringUtils.isBlank(cryptIndex)) {
            throw new Exception("cryptIndex is blank");
        }

        String sql = "SELECT KEY_VALUE FROM LMC_RSC_KEY_INFO WHERE KEY_ID = ? AND KEY_STATE = '0' ";        

        JdbcTemplate jdbc = (JdbcTemplate) SpringContextUtil.getBean(DBUtil.PORTAL_TEMPLATE);

        List<String> list = jdbc.queryForList(sql, new String[] { cryptIndex },String.class);
        if (list.isEmpty()) {
            return null;
        } else {
            return list.get(0);
        }
    }

    @SuppressWarnings("unchecked")
    public String getDllKey(String factoryCode) throws Exception {
        if (StringUtils.isBlank(factoryCode)) {
            throw new Exception("factoryCode is blank");
        }

        StringBuffer sql = new StringBuffer();
        sql.append("SELECT PWD_KEY_VALUE ");
        sql.append("  FROM LMC_WRITE_CARD_PWD_INFO ");
        sql.append(" WHERE FACTORY_CODE = ? ");
        sql.append("   AND PWD_TYPE_CD = ? ");
        sql.append("   AND STATE = '1'");
        

        JdbcTemplate jdbc = (JdbcTemplate) SpringContextUtil.getBean(DBUtil.PORTAL_TEMPLATE);

        List<String> list = jdbc.queryForList(sql.toString(), new String[] { factoryCode,WriteCardUtil.DLL_KEY_DECRIPT_KEY },String.class);
        if (list.isEmpty()) {
            return null;
        } else {
            return list.get(0);
        }
    }
    
    private String getWriteCardLogSeq(JdbcTemplate jdbc){
    	String sql = "SELECT SEQ_WRITE_CARD_LOG.NEXTVAL FROM DUAL";
    	Long seq = jdbc.queryForLong(sql);
    	return seq!=null ? seq.toString():null;
    }
    
    public Map writeWriteCardLog(Map map){
    	JdbcTemplate jdbc = (JdbcTemplate) SpringContextUtil.getBean(DBUtil.PORTAL_TEMPLATE);
    	QueryRunner q = new QueryRunner(true);
    	Connection conn = null;
    	try {
			conn = jdbc.getDataSource().getConnection();
			conn.setAutoCommit(false);
			map.put("seq", getWriteCardLogSeq(jdbc));
			q.update(conn, createInsertDepPrvncIntfLogSql(), createInsertDepPrvncIntfLogSqlParams(map));
			q.update(conn,createInsertDepPrvncIntfLogInfoSql(),createInsertDepPrvncIntfLogInfoSqlParams(map));
			q.update(conn,createInsertLmcWriteCardEventSql(),createInsertLmcWriteCardEventSqlParams(map));
			conn.commit();
		} catch (SQLException e) {
			try {
				conn.rollback();
			} catch (SQLException e1) {
				log.error("",e1);
			}
			log.error("",e);
		}finally{
			if(conn!=null){
				try {
					conn.close();
				} catch (SQLException e) {
					log.error("",e);
				}
				conn = null;
			}
		}

    	return null;
    }
   
    private Object[] createInsertDepPrvncIntfLogSqlParams(Map params){
    	Map map = (Map)params.get("LogInfo");
    	return new Object[]{
    			MapUtils.getString(params, "seq"),//not null
    			MapUtils.getString(map, "INTF_TYPE"),//not null
    			MapUtils.getString(params, "TRANSACTION_ID"),//not null
    			MapUtils.getString(map, "ACTION_CODE"),
    			MapUtils.getString(map, "BUS_CODE"),
    			MapUtils.getString(map, "SVC_CODE"),
    			MapUtils.getString(map, "STATE"),//not null
    			MapUtils.getString(map, "REMARK"),
    			MapUtils.getString(map, "PRIMARY_TRANSACTION_ID"),
    			MapUtils.getString(params, "serviceSerial")
    	};
    }
    
    private String createInsertDepPrvncIntfLogSql(){
    	StringBuffer sql = new StringBuffer();
    	sql.append("insert into DEP_PRVNC_INTF_LOG (")
    		.append("ID, INTF_TYPE, TRANSACTION_ID,")
    		.append("ACTION_CODE, BUS_CODE, SVC_CODE,")
    		.append("STATE, CREATE_DT, VERSION, ")
    		.append("REMARK, PRIMARY_TRANSACTION_ID,SERVICE_SERIAL)");
    	sql.append(" values (")
    		.append("?,?,?,")
    		.append("?,?,?,")
    		.append("?,sysdate,sysdate,")
    		.append("?,?,?)");
    	return sql.toString();
    }
    
    private Object[] createInsertDepPrvncIntfLogInfoSqlParams(Map params){
    	Map map = (Map)params.get("LogInfo");
    	return new Object[]{
    			MapUtils.getString(params, "seq"),
    			MapUtils.getString(map, "REQ_PARAM"),
    			MapUtils.getString(map, "RES_PARAM")
    	};
    }
    private String createInsertDepPrvncIntfLogInfoSql(){
    	StringBuffer sql = new StringBuffer();
    	sql.append("insert into DEP_PRVNC_INTF_LOG_INFO (")
    		.append("ID, REQ_PARAM, RES_PARAM)");
    	sql.append(" values (")
    		.append("?,?,?)");
    	return sql.toString();
    }
    
    //LmcWriteCardEvent
    private Object[] createInsertLmcWriteCardEventSqlParams(Map params){
    	Map map = (Map)params.get("LmcEvent");
    	return new Object[]{
    			MapUtils.getString(map, "seq"),    //not null
    			MapUtils.getString(map, "EVENT_TYPE"),//not null
    			MapUtils.getString(map, "ICCID"),
    			MapUtils.getString(map, "CARD_TYPE"),//not null
    			MapUtils.getString(map, "CARD_NO"),  //not null
    			MapUtils.getString(map, "CARD_AREA"),//not null
    			//MapUtils.getString(map, "MAKE_TIME"),
    			MapUtils.getString(map, "DLL_ID"),
    			MapUtils.getString(map, "STATE"),   //not null
    			MapUtils.getString(map, "STAFF_ID"),//not null
    			MapUtils.getString(map, "CHANNEL_ID"),//not null
    			MapUtils.getString(map, "DATA_AREA"),
    			MapUtils.getString(map, "UPDATE_TIME"),
    			MapUtils.getString(map, "STAFF_IP"),
    			MapUtils.getString(map, "REMARK"),
    			MapUtils.getString(map, "STAFF_AREA"),
    			MapUtils.getString(map, "SALE_NO"),
    			MapUtils.getString(map, "EXT_CUST_ORDER_ID"),
    			MapUtils.getString(params, "TRANSACTION_ID"),
    			MapUtils.getString(params, "serviceSerial")
    	};
    }
    private String createInsertLmcWriteCardEventSql(){

    	StringBuffer sql = new StringBuffer();
    	sql.append("insert into LMC_WRITE_CARD_EVENT (")
    		.append("EVENT_ID, EVENT_TYPE, ICCID,")
    		.append("CARD_TYPE, CARD_NO, CARD_AREA,")
    		.append("MAKE_TIME, DLL_ID, STATE,")
    		.append("STAFF_ID, CHANNEL_ID, DATA_AREA,")
    		.append("UPDATE_TIME, STAFF_IP, REMARK,")
    		.append("STAFF_AREA, SALE_NO, EXT_CUST_ORDER_ID,")
    		.append("TRANSACTION_ID,SERVICE_SERIAL)");
    	sql.append(" values (")
    		.append("?,?,?,")
    		.append("?,?,?,")
    		.append("sysdate,?,?,")
    		.append("?,?,?,")
    		.append("?,?,?,")
    		.append("?,?,?,")
    		.append("?,?)");
    	return sql.toString();
    }
}
