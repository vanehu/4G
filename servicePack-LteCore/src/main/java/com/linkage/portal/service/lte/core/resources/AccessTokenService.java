package com.linkage.portal.service.lte.core.resources;

import java.util.Date;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.exception.ExceptionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ailk.ecsp.service.Service;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.exception.ResultConstant;
import com.linkage.portal.service.lte.common.StringUtil;
import com.linkage.portal.service.lte.core.resources.model.AccessToken;
import com.linkage.portal.service.lte.dao.AccessTokenDAO;
import com.linkage.portal.service.lte.dao.AccessTokenDAOImpl;
import com.linkage.portal.service.lte.util.AESUtils;


public class AccessTokenService  extends Service{

    private final Logger log = LoggerFactory.getLogger(this.getClass());    
    
	@SuppressWarnings("unchecked")
	@Override
	public DataMap exec(DataMap dataBus, String serviceSerial) throws Exception {
		Map<String,Object> returnMap = new HashMap<String, Object>();
		dataBus.setResultCode(ResultConstant.R_POR_SUCCESS.getCode());
		dataBus.setResultMsg("调用成功。");
		try{			
			Map<String, Object> paramMap = dataBus.getInParam();
		    if (MapUtils.isEmpty(paramMap)) {
		         dataBus.setResultCode(ResultCode.R_PARAM_MISS);
		         dataBus.setResultMsg("paramMap is null");
		         return dataBus;
		    }		
     		String accessToken = getAccessToken(paramMap);  
			if (!StringUtil.isEmptyStr(accessToken) && !"-1".equals(accessToken)) {
				returnMap.put("resultCode", "0");
				returnMap.put("resultMsg", "成功");
				returnMap.put("accessToken", accessToken);
				returnMap.put("expiresIn", paramMap.get("tokenTimes"));	
				log.error("生成令牌返回结果=========>>>>"+returnMap);
				dataBus.setOutParam(returnMap);
			}else{
				returnMap.put("resultCode", "2");
				returnMap.put("resultMsg", "令牌生成失败");
				dataBus.setOutParam(returnMap);
				dataBus.setResultCode(ResultConstant.R_POR_FAIL.getCode());
		        dataBus.setResultMsg("令牌生成失败");
			}
		}catch(Exception ex){
			log.error("令牌获取接口异常",ex);
			returnMap.put("resultCode", "2");
			returnMap.put("resultMsg", "失败");
			dataBus.setOutParam(returnMap);
			dataBus.setResultCode(ResultConstant.R_POR_FAIL.getCode());
	        dataBus.setResultMsg(ExceptionUtils.getFullStackTrace(ex));
		}
		return dataBus;
	}
	
	public synchronized String getAccessToken(Map<String,Object> paramMap) {
		String appToken = "";
		try {
			AccessTokenDAO atd = new AccessTokenDAOImpl();	
			List<Map<String, Object>> tokenList = atd.getAccessTokenList(paramMap);			
			if(tokenList != null){
				for(int i=0;i<tokenList.size();i++){
					String tokenId = String.valueOf(tokenList.get(i).get("TOKEN_ID"));
					atd.insertAccessTokenOld(Long.parseLong(tokenId));					
					atd.deleteAccessToken(Long.parseLong(tokenId));
				}									
			}
			
			String staffCode = (String) paramMap.get("staffCode");
			String areaId = (String) paramMap.get("areaId");
			String tokenKey = (String) paramMap.get("tokenKey");
			String randowCode = getRandomNumber();//随机码
			appToken = getAppToken(staffCode, areaId,randowCode,tokenKey);	
			log.error("生成的appToken=========>>>>"+appToken);
			AccessToken accessToken = new AccessToken();
			
			//在线token		
			Date date = new Date();   
			Calendar dar = Calendar.getInstance();  
			dar.setTime(date);			
			accessToken.setAddTime(dar.getTime());
			dar.add(java.util.Calendar.SECOND, Integer.parseInt(String.valueOf(paramMap.get("tokenTimes")))+10);
			accessToken.setEndTime(dar.getTime());
			accessToken.setAccessToken(appToken);
			accessToken.setStatus("E");
			accessToken.setExpiresIn(Long.parseLong(String.valueOf(paramMap.get("tokenTimes"))));
			accessToken.setStaffCode(String.valueOf(paramMap.get("staffCode")));
			accessToken.setStaffName(String.valueOf(paramMap.get("staffName")));
			accessToken.setAreaId(String.valueOf(paramMap.get("areaId")));
			accessToken.setAreaCode(String.valueOf(paramMap.get("areaCode")));
			accessToken.setAreaName(String.valueOf(paramMap.get("areaName")));
			accessToken.setCityName(String.valueOf(paramMap.get("cityName")));
			accessToken.setCityCode(String.valueOf(paramMap.get("cityCode")));
			accessToken.setProvinceName(String.valueOf(paramMap.get("provinceName")));
			accessToken.setProvinceCode(String.valueOf(paramMap.get("provinceCode")));
			accessToken.setChannelCode(String.valueOf(paramMap.get("channelCode")));
			accessToken.setSystemId(String.valueOf(paramMap.get("systemId")));
			accessToken.setRandowCode(randowCode);			
			int result = atd.insertAccessToken(accessToken);
			log.error("令牌入库结果："+result);
			if(result > 0){
				return appToken;	
			}					
		} catch (Exception e) {
			log.error("令牌生成异常：",e);
			return "-1";
		}
		return "-1";
	}
	
	private String getAppToken(String staffCode,String areaId,String randowCode,String tokenKey){		
		String str = staffCode + "#" + areaId + "#" + randowCode;
		log.error("----------c1---------------加密信息："+str);
		log.error("----------c2---------------加密密钥："+tokenKey);
		String result=AESUtils.encryptToString(str, tokenKey);
		log.error("----------c3---------------加密完成："+result);
		return result;
	}
	
	/**
	 * 取随机码	
	 * @return
	 */
	private static String getRandomNumber() {
		String result = "";
		try {
			String[] m_srcStr = new String[] {"5", "6", "7", "8", "9"};
			int len = 1;			
			Random m_rnd = new Random();
			byte[] m_b = new byte[len];
			m_rnd.nextBytes(m_b);
			String m_pwdStr = "";//随机码个数
			for (int i = 0; i < len; i++) {
				int startIdx = Math.abs((int) m_b[i] % 5);
				m_pwdStr += m_srcStr[startIdx];
			}			
			result = getRandom(Integer.parseInt(m_pwdStr));
			return result;
		} catch (Exception ex) {
			throw new RuntimeException(ex);
		}
	}
	
	/**
	 * 取指定个数的随机码
	 * @param iLength
	 * @return
	 */
	private static String getRandom(int iLength) {
		try {
			String[] m_srcStr = new String[] {"0","1","2","3","4","5","6","7","8","9",
					"a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p",
					"q","r","s","t","u","v","w","x","y","z","A", "B", "C", "D", "E", 
					"F","G", "H", "J", "K", "L","M", "N", "P", "Q", "R", "S", "T",
					"U", "V", "W", "X", "Y","Z"};

			int len = 6;
			if (iLength >= 3)
				len = iLength;
			Random m_rnd = new Random();
			byte[] m_b = new byte[len];
			m_rnd.nextBytes(m_b);
			String m_pwdStr = "";
			for (int i = 0; i < len; i++) {		
				int startIdx = Math.abs((int) m_b[i] % 60);
				m_pwdStr += m_srcStr[startIdx];
			}
			return m_pwdStr;
		} catch (Exception ex) {
			throw new RuntimeException(ex);
		}
	}
	
	public static void main(String[] args) {
		
	}
}
