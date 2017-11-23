package com.linkage.portal.service.lte.dao;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import com.ailk.ecsp.util.SpringContextUtil;
import com.al.ecs.exception.BusinessException;
import com.linkage.portal.service.lte.common.StringUtil;
import com.linkage.portal.service.lte.DBUtil;
import com.linkage.portal.service.lte.core.resources.model.AccessToken;

public class AccessTokenDAOImpl implements AccessTokenDAO {
	 private final Logger log = LoggerFactory.getLogger(this.getClass());    
	  
	 private JdbcTemplate jdbc = (JdbcTemplate) SpringContextUtil.getBean(DBUtil.PORTAL_TEMPLATE);


	public int insertAccessToken(AccessToken accessToken) throws Exception {
		try{
	        StringBuffer sql = new StringBuffer();
			sql.append("INSERT INTO OP_ACCESS_TOKEN(TOKEN_ID,ACCESS_TOKEN,ADD_TIME,STATUS,END_TIME,EXPIRES_IN,STAFF_CODE,STAFF_NAME,");
			sql.append(" AREA_ID,AREA_CODE,AREA_NAME,CITY_NAME,CITY_CODE,PROVINCE_NAME,PROVINCE_CODE,CHANNEL_CODE,SYSTEM_ID,RANDOW_CODE)");	
			sql.append(" VALUES(SEQ_OP_ACCESS_TOKEN.nextval,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");		
			return jdbc.update(sql.toString(), new Object[]{accessToken.getAccessToken(),accessToken.getAddTime(),accessToken.getStatus(),accessToken.getEndTime(),accessToken.getExpiresIn(),
				accessToken.getStaffCode(),accessToken.getStaffName(),accessToken.getAreaId(),accessToken.getAreaCode(),accessToken.getAreaName(),accessToken.getCityName(),
				accessToken.getCityCode(),accessToken.getProvinceName(),accessToken.getProvinceCode(),accessToken.getChannelCode(),accessToken.getSystemId(),accessToken.getRandowCode()});
		}catch(Exception e){
			log.error("AccessToken记录异常, accessToken=" + accessToken, e);
			throw new Exception("AccessToken记录异常, accessToken=" + accessToken, e);
		}
	}

	public List<Map<String, Object>> getAccessTokenList(
			Map<String, Object> param) {
		// TODO Auto-generated method stub
		List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();	
		try{
			String staffCode = String.valueOf(param.get("staffCode"));
			//String areaId = String.valueOf(param.get("areaId"));
			StringBuffer sql = new StringBuffer();
			sql.append("select oat.token_id,oat.access_token,oat.staff_code,oat.area_id,oat.province_code ");
			sql.append("from op_access_token oat where oat.status='E' ");
			if(!StringUtil.isEmptyStr(staffCode)){
				sql.append("and oat.staff_code=?");			
				resultList = this.jdbc.queryForList(sql.toString(), new Object[]{staffCode});
			}		
		} catch (Exception ex) {
			log.error("获取令牌列表异常：",ex);
			return null;
		}
		return resultList;
	}

	public List<Map<String, Object>> queryAccessToken(Map<String, Object> param) {
		// TODO Auto-generated method stub
		List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();	
		try{			
			String accessToken = String.valueOf(param.get("accessToken"));
			String staffCode = String.valueOf(param.get("staffCode"));
			String areaId = String.valueOf(param.get("areaId"));
			String randowCode = String.valueOf(param.get("randowCode"));
			StringBuffer sql = new StringBuffer();
			sql.append("select oat.token_id,oat.access_token,oat.staff_code,oat.area_id,oat.province_code,oat.channel_code,oat.randow_code ");
			sql.append("from op_access_token oat where oat.status='E' and oat.end_time>=sysdate ");
			if(!StringUtil.isEmptyStr(accessToken) && !StringUtil.isEmptyStr(staffCode) && !StringUtil.isEmptyStr(areaId) && !StringUtil.isEmptyStr(randowCode)){
				sql.append("and oat.access_token=? and oat.staff_code=? and oat.area_id=? and oat.randow_code=?");							
				resultList = this.jdbc.queryForList(sql.toString(), new Object[]{accessToken,staffCode,areaId,randowCode});
			}
		} catch (Exception ex) {
			log.error("获取令牌异常：",ex);
			return null;
		}
		return resultList;		
	}

	public void insertAccessTokenOld(long tokenId) throws Exception {
		List<Map<String, Object>> resultList = this.queryAccessTokenOldByTokenId(tokenId);
		if(CollectionUtils.isNotEmpty(resultList)){
			int deleteResult = this.deleteAccessTokenOldByTokenId(tokenId);	
			if(deleteResult <= 0){
				log.error("AccessToken历史表记录异常, tokenId=" + tokenId);
				throw new Exception("AccessToken历史表记录异常, tokenId=" + tokenId);
			}
		}
		
		int insertResult = this.insertAccessTokenOldByTokenId(tokenId);
		if(insertResult <= 0){
			log.error("AccessToken历史表记录异常, tokenId=" + tokenId);
			throw new Exception("AccessToken历史表记录异常, tokenId=" + tokenId);
		}
	}

	public int deleteAccessToken(long tokenId) throws Exception {	
		try{
			String sql = "delete from op_access_token oat where oat.token_id=?";
			return this.jdbc.update(sql, new Object[]{tokenId});
		}catch(Exception e){
			log.error("AccessToken表更新异常, tokenId=" + tokenId, e);
			throw new Exception("AccessToken表更新异常, tokenId=" + tokenId, e);
		}
	}
	
	private int insertAccessTokenOldByTokenId(long tokenId) throws Exception{
		try{
			String sql = "insert into op_access_token_old select * from op_access_token oat where oat.token_id = ?";	
			return  this.jdbc.update(sql, new Object[]{tokenId});
		}catch(Exception e){
			log.error("AccessToken历史表记录异常, tokenId=" + tokenId, e);
			throw new Exception("AccessToken历史表记录异常, tokenId=" + tokenId, e);
		}
	}
	
	public int deleteAccessTokenOldByTokenId(long tokenId) throws Exception {	
		try{
			String sql = "delete from op_access_token_old oat where oat.token_id = ?";
			return this.jdbc.update(sql, new Object[]{tokenId});
		}catch(Exception e){
			log.error("AccessToken历史表更新异常, tokenId=" + tokenId, e);
			throw new Exception("AccessToken历史表更新异常, tokenId=" + tokenId, e);
		}
	}
	
	public List<Map<String, Object>> queryAccessTokenOldByTokenId(long tokenId) throws Exception{
		try{
			String sql = "select * from op_access_token_old oat where oat.token_id = ?";
			List<Map<String, Object>> resultList = this.jdbc.queryForList(sql, new Object[]{tokenId});
			return resultList;
		}catch(Exception e){
			log.error("AccessToken历史表查询异常, tokenId=" + tokenId, e);
			throw new Exception("AccessToken历史表查询异常, tokenId=" + tokenId, e);
		}
	}
}
