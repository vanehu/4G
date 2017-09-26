package com.linkage.portal.service.lte.dao;

import java.sql.Types;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.jdbc.core.JdbcTemplate;

import com.ailk.ecsp.core.DataRepository;
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
public class ReserveNumberDAOImpl implements ReserveNumberDAO {

    private JdbcTemplate jdbc = (JdbcTemplate) SpringContextUtil.getBean(DBUtil.PORTAL_TEMPLATE);
    StringBuffer stringBuffer = new StringBuffer();

    public Map<String, Object> QueryAccNbrToRelease(Map<String,Object> param) throws Exception {
        String accNbrType = MapUtils.getString(param, "accNbrType", "");		
        String interval = DataRepository.getInstence().getSysParamValue("sys.preNumberDate","1");
        interval = StringUtils.isBlank(interval) ? "5" : interval;
        	
		StringBuffer sql = new StringBuffer();
		List<Object> params = new LinkedList<Object>();
		List<Integer> sqlType = new LinkedList<Integer>();
		
        sql.append(" (SELECT rownum RN, R.ACC_ID,R.ACC_NBR,R.ACC_NBR_TYPE,R.IS_RELEASE state,R.AREA_ID,S.STAFF_NAME STAFF_NAME,CR.REGION_NAME AREA_NAME,to_char(R.CREATE_DATE,'YYYY-MM-DD HH24:MI:SS') as CREATE_DATE");
        sql.append("  FROM RESERVE_NUMBER R  JOIN COMMON_REGION CR ON R.AREA_ID=CR.COMMON_REGION_ID JOIN STAFF S ON R.STAFF_ID = S.STAFF_ID");
        sql.append(" WHERE  (SYSDATE - R.CREATE_DATE) * 1440 >= ?");
        sql.append(" AND R.IS_RELEASE='1' AND R.ACC_NBR_TYPE = ?");
        
        params.add(interval);
        sqlType.add(Types.VARCHAR);
        params.add(accNbrType);
        sqlType.add(Types.VARCHAR);
        
		if(StringUtils.isNotBlank(MapUtils.getString(param, "accNbr", ""))){
			sql.append(" AND R.ACC_NBR = ?");
			params.add(MapUtils.getString(param, "accNbr"));
	        sqlType.add(Types.VARCHAR);
		}
		if(StringUtils.isNotBlank(MapUtils.getString(param, "channelId", ""))){
			sql.append(" AND R.CHANNEL_ID = ?");
			params.add(MapUtils.getString(param, "channelId"));
	        sqlType.add(Types.VARCHAR);
		}
		else if(StringUtils.isNotBlank(MapUtils.getString(param, "staffId", ""))){
			sql.append(" AND R.STAFF_ID = ?");
			params.add(MapUtils.getString(param, "staffId"));
	        sqlType.add(Types.VARCHAR);
		}
		
		String beginDate = MapUtils.getString(param, "beginDate", "");
		String endDate = MapUtils.getString(param, "endDate", "");;
		
		if(StringUtils.isNotBlank(beginDate)){
			sql.append(" AND R.CREATE_DATE >= TO_DATE(?,yyyy-MM-dd HH24:MI:SS)");
			params.add(beginDate + " 00:00:00");
	        sqlType.add(Types.DATE);
		}
		if(StringUtils.isNotBlank(beginDate) && StringUtils.isNotBlank(endDate)){
			sql.append(" AND R.CREATE_DATE <= TO_DATE(?,'yyyy-MM-dd HH24:MI:SS')");
			params.add(endDate + " 23:59:59");
	        sqlType.add(Types.DATE);
		}
		if(StringUtils.isNotBlank(endDate) && StringUtils.isBlank(beginDate)){
			sql.append(" AND R.CREATE_DATE<=TO_DATE(?,'yyyy-MM-dd HH24:MI:SS')");
			params.add(endDate + " 23:59:59");
	        sqlType.add(Types.DATE);
		}
		
//		int count=jdbc.queryForInt("SELECT COUNT(*) FROM "+sql.toString()+")");
		int count = jdbc.update(sql.toString(), params, sqlType);
		int pageSize = Integer.valueOf(MapUtils.getString(param, "pageSize", "10"));  
		int pageIndex = StringUtils.isBlank(MapUtils.getString(param, "pageIndex", "")) ? 1 : Integer.valueOf(MapUtils.getString(param, "pageIndex"));
		
		if(pageIndex == 1){
			sql.append(" AND rownum <= ?").append(")").append(" WHERE rn > 0");
			params.add(pageSize);
	        sqlType.add(Types.INTEGER);
		}else{
			sql.append(" AND rownum <= ?").append(")").append(" WHERE rn > ?");
			params.add(pageIndex * pageSize);
	        sqlType.add(Types.INTEGER);
	        params.add((pageIndex - 1) * pageSize);
	        sqlType.add(Types.INTEGER);
		}
		
//		List rList = jdbc.queryForList("SELECT * FROM"+sql.toString());
		sql.insert(0, "SELECT * FROM ");
		List<?> rList = jdbc.queryForList(sql.toString(), params, sqlType);

		Map<String, Object> rtMap = new HashMap<String, Object>();
        rtMap.put("numberList", rList);
        rtMap.put("totalNumber", count);
        rtMap.put("totalPage", (count / pageSize + 1));
        
        return rtMap;
    }

    public int insertAccNbr(Map<String, Object> param) throws Exception {
        StringBuffer sb = new StringBuffer();
        sb.append("INSERT INTO RESERVE_NUMBER(ACC_NBR,ACC_NBR_TYPE,").append(
                "STAFF_ID,CREATE_DATE,IS_RELEASE,RELEASE_TIME,AREA_ID,PROVINCE_CODE,CHANNEL_ID)").append(
                "VALUES(?,?,?,SYSDATE,'1',SYSDATE,?,?,?)");
        
        Object[] sbParamObj = {MapUtils.getString(param, "accNbr"),MapUtils.getString(param, "accNbrType"),
                MapUtils.getString(param, "staffId"),MapUtils.getString(param, "areaId"),
                MapUtils.getString(param, "provinceCode"),MapUtils.getString(param, "channelId")};
        int[] sbParamType = {Types.VARCHAR,Types.VARCHAR,Types.VARCHAR,Types.VARCHAR,Types.VARCHAR,Types.VARCHAR};
        return jdbc.update(sb.toString(),sbParamObj,sbParamType);
    }

    public int updateAccNbr(Map<String, Object> map) throws Exception {
        StringBuffer sb = new StringBuffer();
        String phoneNumber = MapUtils.getString(map, "accNbr");
        sb
                .append("UPDATE RESERVE_NUMBER SET RELEASE_TIME=SYSDATE , IS_RELEASE='0' WHERE IS_RELEASE='1' AND ACC_NBR= ? ");
        Object[] sbParamObj ={phoneNumber};
        int[] sbParamType = {Types.VARCHAR};
        return jdbc.update(sb.toString(),sbParamObj,sbParamType);
    }
}
