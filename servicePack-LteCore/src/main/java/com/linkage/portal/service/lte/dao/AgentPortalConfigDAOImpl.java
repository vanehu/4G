package com.linkage.portal.service.lte.dao;

import java.sql.Types;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.jdbc.core.JdbcTemplate;

import com.ailk.ecsp.core.DataSourceRouter;
import com.ailk.ecsp.util.SpringContextUtil;
import com.linkage.portal.service.lte.DBUtil;

/**
 * 门户配置数据管理
 * <P>
 * @author lianld
 * @version V1.0 2012-6-26
 * @createDate 2012-6-26 下午5:30:15
 * @modifyDate	 lianld 2012-6-26 liusd 2013-03-01 <BR>
 * @copyRight 亚信联创电信EC研发部
 */
public class AgentPortalConfigDAOImpl implements AgentPortalConfigDAO {

    private JdbcTemplate jdbc = (JdbcTemplate) SpringContextUtil.getBean(DBUtil.PORTAL_TEMPLATE);

    /**
     * 根据渠道类型、表名、字段名取出相应配置数据
     */
    @SuppressWarnings("unchecked")
    public List query(Map param,String dbKeyWord) throws Exception {
        String tableName = MapUtils.getString(param, "tableName", "");
        String columnName = MapUtils.getString(param, "columnName", "");
        //渠道类型
        //String channelType = MapUtils.getString(param, "channelType", "");
        StringBuffer sql = new StringBuffer();
        sql.append("SELECT A.COLUMN_VALUE, A.COLUMN_VALUE_NAME");
        sql.append("  FROM AGENT_PORTAL_CONFIG A ");
        sql.append(" WHERE  A.TABLE_NAME = ? ");
        sql.append("   AND A.COLUMN_NAME = ? ");
        sql.append(" ORDER BY A.SORT_VALUE");

        Object[] paramObj = { tableName, columnName };
        int[] paramType = { Types.VARCHAR, Types.VARCHAR};
        if (StringUtils.isBlank(dbKeyWord)){
            DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
        }
        List rList = jdbc.queryForList(sql.toString(), paramObj, paramType);
        return rList;
    }

    public int queryCountByParam(Map param,String dbKeyWord) throws Exception {
        int count = 0;
        String tableName = MapUtils.getString(param, "tableName", "");
        String columnName = MapUtils.getString(param, "columnName", "");
        String columnValue = MapUtils.getString(param, "columnValue", "");
        StringBuffer sql = new StringBuffer();
        sql.append("SELECT COUNT(*)");
        sql.append("  FROM AGENT_PORTAL_CONFIG");
        sql.append(" WHERE TABLE_NAME = ?");
        sql.append("   AND COLUMN_NAME = ? ");
        sql.append("   AND COLUMN_VALUE = ? ");
        Object[] paramObj = { tableName, columnName, columnValue };
        int[] paramType = { Types.VARCHAR, Types.VARCHAR, Types.VARCHAR };
        if (StringUtils.isBlank(dbKeyWord)){
            DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
        }
        count = jdbc.queryForInt(sql.toString(), paramObj, paramType);
        return count;
    }

    public void insert(Map param) throws Exception {
        String tableName = MapUtils.getString(param, "tableName", "");
        String columnName = MapUtils.getString(param, "columnName", "");
        String columnValue = MapUtils.getString(param, "columnValue", "");
        String columnValueName = MapUtils.getString(param, "columnValueName", "");
        String sortValue = MapUtils.getString(param, "sortValue", "");
        String image = MapUtils.getString(param, "image", "");
        StringBuffer sql = new StringBuffer();
        sql.append("INSERT INTO AGENT_PORTAL_CONFIG(TABLE_NAME,COLUMN_NAME,COLUMN_VALUE,").append(
                "COLUMN_VALUE_NAME,SORT_VALUE,IMAGE,CONF_ID) VALUES( ? ,? ,? ,? ,? ,?,").append("SEQ_AGENT_PORTAL_CONFIG.NEXTVAL)");
        //防注入处理 add by lsd 2015-09-09
        Object[] paramObj = { tableName, columnName, columnValue,columnValueName,sortValue,image };
        int[] paramType = { Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR , Types.VARCHAR};
        jdbc.update(sql.toString(),paramObj, paramType);
    }
}
