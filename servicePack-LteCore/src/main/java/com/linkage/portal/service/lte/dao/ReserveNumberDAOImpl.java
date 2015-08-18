package com.linkage.portal.service.lte.dao;

import java.sql.Types;
import java.util.HashMap;
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

    @SuppressWarnings("unchecked")
    public Map<String, Object> QueryAccNbrToRelease(Map param) throws Exception {
		Map<String, Object> rtMap = new HashMap();
    	String pageIndex = MapUtils.getString(param, "pageIndex", "");
        String accNbrType = MapUtils.getString(param, "accNbrType", "");
		String startDt = MapUtils.getString(param, "beginDate", "")+ " 00:00:00";
		String endDt = MapUtils.getString(param, "endDate", "")+" 23:59:59";
		boolean startDtCondition = StringUtils.isNotBlank(MapUtils.getString(param, "beginDate", ""));
		boolean endDtCondition = StringUtils.isNotBlank(MapUtils.getString(param, "endDate", ""));
        String interval = DataRepository.getInstence().getSysParamValue("sys.preNumberDate","1");
        if (interval == null) interval = "5";
		StringBuffer sql = new StringBuffer();
        sql.append(" (SELECT rownum RN, R.ACC_ID,R.ACC_NBR,R.ACC_NBR_TYPE,R.IS_RELEASE state,R.AREA_ID,CR.REGION_NAME AREA_NAME,to_char(R.CREATE_DATE,'YYYY-MM-DD HH24:MI:SS') as CREATE_DATE");
        sql.append("  FROM RESERVE_NUMBER R  JOIN COMMON_REGION CR ON R.AREA_ID=CR.COMMON_REGION_ID ");
        sql.append(" WHERE  (SYSDATE - R.CREATE_DATE) * 1440 >= '" +interval+"'"+
        		" AND R.IS_RELEASE='1' AND R.ACC_NBR_TYPE = '"+accNbrType+"'");
		if(StringUtils.isNotBlank(MapUtils.getString(param, "accNbr", ""))){
			sql.append(" AND R.ACC_NBR = '"+MapUtils.getString(param, "accNbr", "")+"'");
		}
		if(StringUtils.isNotBlank(MapUtils.getString(param, "staffId", ""))){
			sql.append(" AND R.STAFF_ID = '"+MapUtils.getString(param, "staffId", "")+"'");
		}
//		if(StringUtils.isNotBlank(MapUtils.getString(param, "areaId", ""))){
//			String areaId = MapUtils.getString(param, "areaId");
//			if(areaId.endsWith("0000")&& areaId.length()==7){
//			sql.append(" AND R.AREA_ID like '"+areaId.substring(0,3)+"%'");
//			}else{
//			sql.append(" AND R.AREA_ID = '"+MapUtils.getString(param, "areaId", "")+"'");
//			}
//		}
		if(startDtCondition){
			sql.append(" AND R.CREATE_DATE>=TO_DATE(").append("'"+startDt+"'").append(",'yyyy-MM-dd HH24:MI:SS')");
		}
		if(endDtCondition &&  startDtCondition){
			sql.append(" AND R.CREATE_DATE<=TO_DATE(").append("'"+endDt+"'").append(",'yyyy-MM-dd HH24:MI:SS')");
		}
		if(endDtCondition &&  ! startDtCondition){
			sql.append(" AND R.CREATE_DATE<=TO_DATE(").append("'"+endDt+"'").append(",'yyyy-MM-dd HH24:MI:SS')");
		}
		int count=jdbc.queryForInt("SELECT COUNT(*) FROM "+sql.toString()+")");
		int onePageCount=Integer.valueOf(MapUtils.getString(param, "pageSize", "10"));        
		if(StringUtils.isBlank(pageIndex) || "1".equals(pageIndex)){
			sql.append(" AND rownum <="+onePageCount)
			.append(")")
			.append(" WHERE rn>0");
		}else{
			sql.append(" AND rownum<=").append(Integer.valueOf(pageIndex)*onePageCount)
			.append(")")
			.append(" WHERE rn>")
			.append((Integer.valueOf(pageIndex)-1)*onePageCount);
		}
        List rList = jdbc.queryForList("SELECT * FROM"+sql.toString());
        rtMap.put("numberList", rList);
        rtMap.put("totalNumber", count);
        rtMap.put("totalPage", (count/onePageCount+1));
        return rtMap;
    }

    public int insertAccNbr(Map<String, Object> param) throws Exception {
        StringBuffer sb = new StringBuffer();
        sb.append("INSERT INTO RESERVE_NUMBER(ACC_NBR,ACC_NBR_TYPE,").append(
                "STAFF_ID,CREATE_DATE,IS_RELEASE,RELEASE_TIME,AREA_ID,PROVINCE_CODE,CHANNEL_ID)").append(
                "VALUES('")
                .append(MapUtils.getString(param, "accNbr")).append("','")
                .append(MapUtils.getString(param, "accNbrType")).append("','")
                .append(MapUtils.getString(param, "staffId")).append("',SYSDATE,'1',SYSDATE,'")
                .append(MapUtils.getString(param, "areaId")).append("','")
                .append(MapUtils.getString(param, "provinceCode")).append("','")
                .append(MapUtils.getString(param, "channelId")).append("')");
        return jdbc.update(sb.toString());
    }

    public int updateAccNbr(Map<String, Object> map) throws Exception {
        StringBuffer sb = new StringBuffer();
        String phoneNumber = MapUtils.getString(map, "accNbr");
        sb
                .append("UPDATE RESERVE_NUMBER SET RELEASE_TIME=SYSDATE , IS_RELEASE='0' WHERE IS_RELEASE='1' AND ACC_NBR='" + phoneNumber
                        + "'");
        return jdbc.update(sb.toString());
    }
}
