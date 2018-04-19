package com.linkage.portal.service.lte.dao;

import org.springframework.jdbc.core.JdbcTemplate;

import com.ailk.ecsp.util.SpringContextUtil;
import com.linkage.portal.service.lte.DBUtil;


public class ProtocolDAOImpl implements ProtocolDAO {
    JdbcTemplate jdbc = (JdbcTemplate) SpringContextUtil.getBean(DBUtil.PORTAL_TEMPLATE);

    public String getProtocolNbrSeq(){
    	String sql = "SELECT SEQ_PROTOCOL_NBR.NEXTVAL FROM DUAL";
    	Long seq = jdbc.queryForLong(sql);
    	return seq!=null ? seq.toString():null;
    }

}
