package com.linkage.portal.service.lte.dao;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.PortalConstant;
import com.linkage.portal.service.lte.common.StringUtil;
import com.linkage.portal.service.lte.core.resources.model.AccessToken;

public class AccessTokenDAOImpl implements AccessTokenDAO {
	 private final Logger log = LoggerFactory.getLogger(this.getClass());    
	  
	 private JdbcTemplate jdbc;
	 
	 private StringBuffer sqlStr = new StringBuffer();

	 /**
	  * @param paramMap 原始入参，用于获取工号
	  * @param newAccessToken 新令牌
	  * @return returnMap
	  * @throws Exception
	  */
	@Transactional(rollbackForClassName={"Exception"}, timeout=5, value="lteEcspTransaction")
	public Map<String, Object> updateNewAccessToken(Map<String, Object> paramMap, AccessToken newAccessToken) throws Exception {
		
		Map<String, Object> returnMap = new HashMap<String, Object>();
		returnMap.put(PortalConstant.RESULT_CODE, ResultCode.SUCCESS);
		
		List<Map<String, Object>> tokenList = this.getAccessTokenList(paramMap);			
		if(tokenList != null){
			for(int i=0;i<tokenList.size();i++){
				String tokenId = String.valueOf(tokenList.get(i).get("TOKEN_ID"));
				this.insertAccessTokenOld(Long.parseLong(tokenId));					
				this.deleteAccessToken(Long.parseLong(tokenId));
			}									
		}
		
		int result = this.insertAccessToken(newAccessToken);
		if (result <= 0) {
			returnMap.put(PortalConstant.RESULT_CODE, ResultCode.FAIL);
			returnMap.put(PortalConstant.RESULT_MSG,  "新令牌入库失败");
		}
		
		return returnMap;
	}

	public int insertAccessToken(AccessToken accessToken) throws Exception {
		try{
			this.sqlStr.setLength(0);
			sqlStr.append("INSERT INTO OP_ACCESS_TOKEN(TOKEN_ID,ACCESS_TOKEN,ADD_TIME,STATUS,END_TIME,EXPIRES_IN,STAFF_CODE,STAFF_NAME,");
			sqlStr.append(" AREA_ID,AREA_CODE,AREA_NAME,CITY_NAME,CITY_CODE,PROVINCE_NAME,PROVINCE_CODE,CHANNEL_CODE,SYSTEM_ID,RANDOW_CODE)");	
			sqlStr.append(" VALUES(SEQ_OP_ACCESS_TOKEN.nextval,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");		
			return jdbc.update(this.sqlStr.toString(), new Object[]{accessToken.getAccessToken(),accessToken.getAddTime(),accessToken.getStatus(),accessToken.getEndTime(),accessToken.getExpiresIn(),
				accessToken.getStaffCode(),accessToken.getStaffName(),accessToken.getAreaId(),accessToken.getAreaCode(),accessToken.getAreaName(),accessToken.getCityName(),
				accessToken.getCityCode(),accessToken.getProvinceName(),accessToken.getProvinceCode(),accessToken.getChannelCode(),accessToken.getSystemId(),accessToken.getRandowCode()});
		}catch(Exception e){
			log.error("新的AccessToken入表记录异常, accessToken=" + accessToken, e);
			throw new Exception("新的AccessToken入表记录异常, accessToken=" + accessToken, e);
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
		List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();	
		String accessToken = String.valueOf(param.get("accessToken"));
		String staffCode = String.valueOf(param.get("staffCode"));
		String areaId = String.valueOf(param.get("areaId"));
		String randowCode = String.valueOf(param.get("randowCode"));
		this.sqlStr.setLength(0);
		sqlStr.append("select oat.token_id,oat.access_token,oat.staff_code,oat.area_id,oat.province_code,oat.channel_code,oat.randow_code ");
		sqlStr.append("from op_access_token oat where oat.status='E' and oat.end_time>=sysdate ");
		if(!StringUtil.isEmptyStr(accessToken) && !StringUtil.isEmptyStr(staffCode) && !StringUtil.isEmptyStr(areaId) && !StringUtil.isEmptyStr(randowCode)){
			sqlStr.append("and oat.access_token=? and oat.staff_code=? and oat.area_id=? and oat.randow_code=?");							
			resultList = this.jdbc.queryForList(this.sqlStr.toString(), new Object[]{accessToken,staffCode,areaId,randowCode});
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
			this.sqlStr.setLength(0);
			this.sqlStr.append("delete from op_access_token oat where oat.token_id=?");
			return this.jdbc.update(this.sqlStr.toString(), new Object[]{tokenId});
		}catch(Exception e){
			log.error("AccessToken表更新异常, tokenId=" + tokenId, e);
			throw new Exception("AccessToken表更新异常, tokenId=" + tokenId, e);
		}
	}
	
	private int insertAccessTokenOldByTokenId(long tokenId) throws Exception{
		try{
			this.sqlStr.setLength(0);
			this.sqlStr.append("insert into op_access_token_old select * from op_access_token oat where oat.token_id = ?");
			return  this.jdbc.update(this.sqlStr.toString(), new Object[]{tokenId});
		}catch(Exception e){
			log.error("AccessToken历史表记录异常, tokenId=" + tokenId, e);
			throw new Exception("AccessToken历史表记录异常, tokenId=" + tokenId, e);
		}
	}
	
	private int deleteAccessTokenOldByTokenId(long tokenId) throws Exception {	
		try{
			this.sqlStr.setLength(0);
			this.sqlStr.append("delete from op_access_token_old oat where oat.token_id = ?");
			return this.jdbc.update(this.sqlStr.toString(), new Object[]{tokenId});
		}catch(Exception e){
			log.error("AccessToken历史表更新异常, tokenId=" + tokenId, e);
			throw new Exception("AccessToken历史表更新异常, tokenId=" + tokenId, e);
		}
	}
	
	private List<Map<String, Object>> queryAccessTokenOldByTokenId(long tokenId) throws Exception{
		try{
			this.sqlStr.setLength(0);
			this.sqlStr.append("select * from op_access_token_old oat where oat.token_id = ?");
			return this.jdbc.queryForList(this.sqlStr.toString(), new Object[]{tokenId});
		}catch(Exception e){
			log.error("AccessToken历史表查询异常, tokenId=" + tokenId, e);
			throw new Exception("AccessToken历史表查询异常, tokenId=" + tokenId, e);
		}
	}

	public void setJdbc(JdbcTemplate jdbc) {
		this.jdbc = jdbc;
	}
}
