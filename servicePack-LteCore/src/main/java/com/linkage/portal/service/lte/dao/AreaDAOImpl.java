package com.linkage.portal.service.lte.dao;

import java.sql.Types;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.jdbc.core.JdbcTemplate;

import com.ailk.ecsp.util.SpringContextUtil;
import com.linkage.portal.service.lte.DBUtil;

/**
 * 地区查询数据库实现
 * @author liusd
 *
 */
public class AreaDAOImpl implements AreaDAO {
    JdbcTemplate jdbc = (JdbcTemplate) SpringContextUtil.getBean(DBUtil.PORTAL_TEMPLATE);

    
    /**
     * @see com.linkage.portal.service.lte.dao.AreaDAO#findChildArea(java.lang.String)
     */
    public List<Map<String, Object>> findChildArea(Map param) throws Exception {
        StringBuffer sql = new StringBuffer(100);

        sql.append("SELECT T.COMMON_REGION_ID,");
        sql.append("       T.UP_REGION_ID,");
        sql.append("       T.REGION_NAME,");
        sql.append("       T.ID_PREFIX,");
        sql.append("       T.AREA_LEVEL,");
        sql.append("       T.ZONE_NUMBER,");
        sql.append("       T.ZIP_CODE ");
        sql.append("  FROM COMMON_REGION T");
        sql.append(" WHERE ");
        sql.append(" T.AREA_LEVEL = ? ");
        
        String lev = MapUtils.getString(param, "areaLevel");
        
        List<Map<String, Object>> rList = new ArrayList<Map<String, Object>>();
        if ("".equals(StringUtils.defaultString(MapUtils.getString(param, "upRegionId")))) {
            if(! "".equals(StringUtils.defaultString(MapUtils.getString(param, "areaId")))){
        		sql.append(" AND  T.COMMON_REGION_ID = ?");
        		sql.append(" ORDER BY T.REGION_NAME");
       		    return this.jdbc.queryForList(sql.toString(), new Object[] {lev,MapUtils.getString(param, "areaId") }, new int[] {Types.VARCHAR, Types.INTEGER });
        	}
            sql.append(" ORDER BY T.REGION_NAME ");
            return this.jdbc.queryForList(sql.toString(),new Object[] {lev}, new int[] {Types.VARCHAR});
        } else {
        	if(! "".equals(StringUtils.defaultString(MapUtils.getString(param, "upRegionId")))){
        		sql.append(" AND  T.UP_REGION_ID = ?");
        		sql.append(" ORDER BY T.REGION_NAME");
        		return this.jdbc.queryForList(sql.toString(), new Object[] {lev, MapUtils.getString(param, "upRegionId") }, new int[] {Types.VARCHAR, Types.INTEGER });
        	}
        	
        }
        return rList;
    }

    /**
     * @see com.linkage.portal.service.lte.dao.AreaDAO#queryUserCityArea(java.lang.String)
     */
    public List<Map<String, Object>> queryUserCityArea(String areaId) throws Exception {
        StringBuffer sql = new StringBuffer();
        List<Map<String, Object>> rList = new ArrayList<Map<String, Object>>();
        sql.append(" SELECT AREA_ID,NAME,ZONE_NUMBER FROM PORTAL_AREA ");
        sql
                .append(" WHERE PARENT_AREA IN(SELECT AREA_ID FROM PORTAL_AREA WHERE PARENT_AREA = 8100000 START WITH AREA_ID IN(");
        sql.append(" SELECT AREA_ID FROM PORTAL_AREA WHERE ZONE_NUMBER=?)");
        sql.append(" CONNECT BY PRIOR PARENT_AREA= AREA_ID)");
        rList = jdbc.queryForList(sql.toString(),new Object[] {areaId}, new int[] {Types.VARCHAR});
        return rList;
    }

    /**
     * @see com.linkage.portal.service.lte.dao.AreaDAO#queryAreaByAreaId(java.lang.String)
     */
    public Map<String, Object> queryAreaByAreaId(String areaId) throws Exception {
        StringBuffer sql = new StringBuffer(100);
        sql.append("SELECT T.AREA_ID,");
        sql.append("       T.PARENT_AREA,");
        sql.append("       T.NAME,");
        sql.append("       T.ID_PREFIX,");
        sql.append("       T.AREA_LEVEL,");
        sql.append("       T.ZONE_NUMBER,");
        sql.append("       T.ZIP_CODE,");
        sql.append("       T.IS_PARENT");
        sql.append("  FROM PORTAL_AREA T");
        sql.append(" WHERE T.AREA_ID = ? ");
        List<Map<String,Object>> list = this.jdbc.queryForList(sql.toString(), new Object[] { areaId }, new int[] { Types.INTEGER });
        return CollectionUtils.isEmpty(list)?new HashMap<String, Object>():list.get(0);
    }

    /**
     * @see com.linkage.portal.service.lte.dao.AreaDAO#queryAreaTreeByLeafAreaId(java.lang.String)
     */
    public List<Map<String, Object>> queryAreaTreeByLeafAreaId(int areaId) throws Exception {
        StringBuffer sql = new StringBuffer(100);
        sql.append("SELECT T.AREA_ID,");
        sql.append("       T.PARENT_AREA,");
        sql.append("       T.NAME,");
        sql.append("       T.AREA_LEVEL,");
        sql.append("       T.ZONE_NUMBER,");
        sql.append("       T.IS_PARENT ");
        sql.append("  FROM PORTAL_AREA T ");
        sql.append(" START WITH T.AREA_ID = ? ");
        sql.append("CONNECT BY T.AREA_ID = PRIOR T.PARENT_AREA ");
        sql.append(" ORDER BY LEVEL DESC");
        return this.jdbc.queryForList(sql.toString(), new Object[] {areaId }, new int[] { Types.INTEGER });
    }

	public List<Map<String, Object>> queryAreaTreeByParentAreaId(int areaId)
			throws Exception {
		StringBuffer sql = new StringBuffer(100);
        sql.append("SELECT T.AREA_ID,");
        sql.append("       T.PARENT_AREA,");
        sql.append("       T.NAME,");
        sql.append("       T.AREA_LEVEL,");
        sql.append("       T.ZONE_NUMBER,");
        sql.append("       T.IS_PARENT ");
        sql.append("  FROM PORTAL_AREA T ");
        sql.append(" START WITH T.PARENT_AREA = ? ");
        sql.append("CONNECT BY T.PARENT_AREA = PRIOR T.AREA_ID ");
        sql.append(" ORDER BY LEVEL DESC");
        return this.jdbc.queryForList(sql.toString(), new Object[] {areaId }, new int[] { Types.INTEGER });
	}
	
	public List<Map<String,Object>> queryAreaNameByAreaId(String areaId)throws Exception{
		StringBuffer sql = new StringBuffer(100);
		sql.append("SELECT PA.NAME,PA.AREA_ID FROM PORTAL_AREA PA WHERE PA.AREA_ID IN (").append(areaId).append(")");
	    return this.jdbc.queryForList(sql.toString());
	}
	
	/*
	 * 查询父级地区信息
	 */
	public Map<String, Object> queryParentAreaInfo(String areaId)throws Exception{
		StringBuffer sql = new StringBuffer();
		sql.append("SELECT CR.COMMON_REGION_ID,");
		sql.append(" CR.REGION_NAME");
		sql.append(" FROM COMMON_REGION CR");
		sql.append(" WHERE CR.COMMON_REGION_ID =");
		sql.append(" (SELECT CR.UP_REGION_ID FROM COMMON_REGION CR WHERE CR.COMMON_REGION_ID = ?)");
		List <Map<String, Object>> resultList = this.jdbc.queryForList(sql.toString(), new Object[] { areaId }, new int[] { Types.INTEGER });
		return CollectionUtils.isEmpty(resultList)?new HashMap<String, Object>():resultList.get(0);
	}
	
	/*
	 * 查询地区信息
	 */
	public Map<String, Object> queryAreaInfo(String areaId)throws Exception{
		StringBuffer sql = new StringBuffer();
		sql.append("SELECT T.COMMON_REGION_ID,");
		sql.append("       T.REGION_TYPE,");
        sql.append("       T.UP_REGION_ID,");
        sql.append("       T.REGION_NAME,");
        sql.append("       T.ID_PREFIX,");
        sql.append("       T.AREA_LEVEL,");
        sql.append("       T.ZONE_NUMBER,");
        sql.append("       T.ZIP_CODE ");
        sql.append("  FROM COMMON_REGION T");
		sql.append("  WHERE T.COMMON_REGION_ID=?");
		List <Map<String, Object>> resultList = this.jdbc.queryForList(sql.toString(), new Object[] { areaId }, new int[] { Types.INTEGER });
		return CollectionUtils.isEmpty(resultList)?new HashMap<String, Object>():resultList.get(0);
	}

}
