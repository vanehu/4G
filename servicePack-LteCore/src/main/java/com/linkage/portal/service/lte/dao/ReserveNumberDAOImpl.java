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
    private StringBuffer sql = new StringBuffer();
    private StringBuffer middleResultSql = new StringBuffer();

    public Map<String, Object> QueryAccNbrToRelease(Map<String,Object> param) throws Exception {
        String accNbrType = MapUtils.getString(param, "accNbrType", "");		
        String interval = DataRepository.getInstence().getSysParamValue("sys.preNumberDate", "1");
        interval = StringUtils.isBlank(interval) ? "5" : interval;
        	
		List<Object> params = new LinkedList<Object>();
		List<Integer> sqlType = new LinkedList<Integer>();
		
		this.middleResultSql.setLength(0);
		this.sql.setLength(0);
		
        this.sql.append(" SELECT rownum RN, R.ACC_ID,R.ACC_NBR,R.ACC_NBR_TYPE,R.IS_RELEASE state,R.AREA_ID,S.STAFF_NAME STAFF_NAME,CR.REGION_NAME AREA_NAME,to_char(R.CREATE_DATE,'YYYY-MM-DD HH24:MI:SS') as CREATE_DATE");
        this.sql.append(" FROM RESERVE_NUMBER R  JOIN COMMON_REGION CR ON R.AREA_ID=CR.COMMON_REGION_ID JOIN STAFF S ON R.STAFF_ID = S.STAFF_ID");
        this.sql.append(" WHERE  (SYSDATE - R.CREATE_DATE) * 1440 >= ?");
        this.sql.append(" AND R.IS_RELEASE='1' AND R.ACC_NBR_TYPE = ?");
        
        params.add(interval);
        sqlType.add(Types.VARCHAR);
        params.add(accNbrType);
        sqlType.add(Types.VARCHAR);
        
		if(StringUtils.isNotBlank(MapUtils.getString(param, "accNbr", ""))){
			this.sql.append(" AND R.ACC_NBR = ?");
			params.add(MapUtils.getString(param, "accNbr"));
	        sqlType.add(Types.VARCHAR);
		}
		if(StringUtils.isNotBlank(MapUtils.getString(param, "channelId", ""))){
			this.sql.append(" AND R.CHANNEL_ID = ?");
			params.add(MapUtils.getString(param, "channelId"));
	        sqlType.add(Types.VARCHAR);
		}
		else if(StringUtils.isNotBlank(MapUtils.getString(param, "staffId", ""))){
			this.sql.append(" AND R.STAFF_ID = ?");
			params.add(MapUtils.getString(param, "staffId"));
	        sqlType.add(Types.VARCHAR);
		}
		
		String beginDate = MapUtils.getString(param, "beginDate", "");
		String endDate = MapUtils.getString(param, "endDate", "");;
		
		if(StringUtils.isNotBlank(beginDate)){
			this.sql.append(" AND R.CREATE_DATE >= TO_DATE(?,'yyyy-MM-dd HH24:MI:SS')");
			params.add(beginDate + " 00:00:00");
	        sqlType.add(Types.VARCHAR);
		}
		if(StringUtils.isNotBlank(beginDate) && StringUtils.isNotBlank(endDate)){
			this.sql.append(" AND R.CREATE_DATE <= TO_DATE(?,'yyyy-MM-dd HH24:MI:SS')");
			params.add(endDate + " 23:59:59");
	        sqlType.add(Types.VARCHAR);
		}
		if(StringUtils.isNotBlank(endDate) && StringUtils.isBlank(beginDate)){
			this.sql.append(" AND R.CREATE_DATE<=TO_DATE(?,'yyyy-MM-dd HH24:MI:SS')");
			params.add(endDate + " 23:59:59");
	        sqlType.add(Types.VARCHAR);
		}
		
		this.middleResultSql.append("SELECT COUNT(*) FROM (");
		this.middleResultSql.append(this.sql);
		this.middleResultSql.append(")");
		int count = jdbc.queryForInt(this.middleResultSql.toString(), params.toArray(), this.convertList2Array(sqlType));
		int pageSize = Integer.valueOf(MapUtils.getString(param, "pageSize", "10"));  
		int pageIndex = StringUtils.isBlank(MapUtils.getString(param, "pageIndex", "")) ? 1 : Integer.valueOf(MapUtils.getString(param, "pageIndex"));
		
		this.middleResultSql.setLength(0);
		this.middleResultSql.append("SELECT * FROM ( ");
		this.middleResultSql.append(this.sql);
		this.middleResultSql.append(" ) RESULT");
		
		if(pageIndex == 1){
			this.middleResultSql.append(" WHERE RESULT.RN <= ?").append(" AND RESULT.RN > 0");
			params.add(pageSize);
	        sqlType.add(Types.INTEGER);
		}else{
			this.middleResultSql.append(" WHERE RESULT.RN <= ?").append(" AND RESULT.RN > ?");
			params.add(pageIndex * pageSize);
	        sqlType.add(Types.INTEGER);
	        params.add((pageIndex - 1) * pageSize);
	        sqlType.add(Types.INTEGER);
		}
		
		List<?> rList = jdbc.queryForList(this.middleResultSql.toString(), params.toArray(), this.convertList2Array(sqlType));

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
    
    private int[] convertList2Array(List<Integer> param){
    	int[] result = new int[param.size()];
    	
    	for(int i = 0; i < param.size(); i++){
			result[i] = param.get(i);
		}

		return result;
    }
}
