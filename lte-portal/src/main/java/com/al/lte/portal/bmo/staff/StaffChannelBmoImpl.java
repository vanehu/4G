package com.al.lte.portal.bmo.staff;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 用户受理渠道 <BR>
 * 获取用户受理渠道等等
 * <P>
 * 
 * @author bianxw
 * @version V1.0 2012-8-17
 * @createDate 2012-8-17 下午13:53:52
 * @modifyDate bianxw 2012-8-17 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
@Service("com.al.lte.portal.bmo.staff.StaffChannelBmo")
public class StaffChannelBmoImpl implements StaffChannelBmo {
	
	@Autowired
	PropertiesUtils propertiesUtils;

	public Map<String, Object> qryChannelByStaff(Map dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> result = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.QRY_CHANNEL_BY_RELA_STAFF, optFlowNum, sessionStaff);
		try{
			result.put("code", -1);
			result.put("mess", db.getResultMsg());
			List list = new ArrayList();
			if (db.getResultCode().equals(ResultCode.R_SUCC)) {
				Map returnMap = db.getReturnlmap() ;
				result.put("code", 1);
				result.put("mess", returnMap.get("resultMsg"));
				if(returnMap.get("resultCode").equals(ResultCode.R_SUCC)){
					if(returnMap.get("result") instanceof List){
						list = (List)returnMap.get("result") ;
						result.put("code", 0);
					}else if(returnMap.get("result") instanceof Map){
						Map Map = (Map)returnMap.get("result");
						list = (List)Map.get("rangeChannels") ;
						result.put("code", 0);
					}
				}
			}
			result.put("rangeChannels", list);
			return result ;
		}catch(Exception e){
			throw new BusinessException(ErrorCode.QUERY_CHANNEL,dataBusMap,db.getReturnlmap(), e);
		}
	}
	
	public Map<String, Object> qryCurrentChannelByStaff(SessionStaff sessionStaff,String defaultId) throws Exception{
		Map<String, Object> channl_data = new HashMap<String, Object>();
		//channl_data.put("staffCode", staff.getStaffCode());
		//channl_data.put("areaId", staff.getAreaId());
		channl_data.put("staffId", sessionStaff.getStaffId());
		channl_data.put("dbRouteLog", sessionStaff.getPartnerId());
		channl_data.put("reqType", "chn");
		channl_data.put("relaType", "10");
		if(SysConstant.APPDESC_LTE.equals(propertiesUtils.getMessage(SysConstant.APPDESC))){
			channl_data.put("chnLog", "all");//原定 lte
		}else{
			channl_data.put("chnLog", "all");
		}
		Map channnel_res = null ;
		Map result = null ;
		try {
			channnel_res = qryChannelByStaff(channl_data,"", sessionStaff);
			if (channnel_res.get("rangeChannels") != null) {
				List<Map> list = (List<Map>) channnel_res.get("rangeChannels");
				if (list.size() > 0) {
					if(defaultId!=null&&!defaultId.equals("")){
						for(Map map:list){
							if(defaultId.equals(map.get("id"))){
								result = map ;
								break;
							}
						}
					}
					if(result==null){
						result = new HashMap((Map) list.get(0));
					}
					if(result!=null){
						String areaAllName = "" ;
						String areaName = result.get("areaName")==null?null:result.get("areaName").toString();
						String areaId = result.get("areaId")==null?"":result.get("areaId").toString();
						if(!areaId.equals("")){
							areaAllName = areaName ;
							if(areaId.substring(3, 7).equals("0000")){//省份
								if(result.get("provinceName")!=null&&!result.get("provinceName").equals("")){
									areaAllName = result.get("provinceName").toString() ;
								}
							}else if(areaId.substring(5, 7).equals("00")){//市
								if(result.get("provinceName")!=null&&!result.get("provinceName").equals("")){
									areaAllName = result.get("provinceName").toString()+ " > " + areaAllName ;
								}
							}else{
								if(result.get("cityName")!=null&&!result.get("cityName").equals("")){
									areaAllName = result.get("cityName").toString()+ " > " + areaAllName ;
								}
								if(result.get("provinceName")!=null&&!result.get("provinceName").equals("")){
									areaAllName = result.get("provinceName").toString()+ " > " + areaAllName ;
								}
							}
						}
						result.put("areaAllName", areaAllName);
					}
					result.put("channelList", list);
				}
			}
		} catch (InterfaceException ie){
			throw ie ;
		} catch (Exception be) {
			throw new BusinessException(ErrorCode.QUERY_CHANNEL, channl_data, channnel_res, be);
		} 
		if(result==null){
			result = new HashMap<String, Object>();
			result.put("id", "");
			result.put("name", "");
			result.put("areaId", "");
			result.put("areaCode", "");
			result.put("areaName", "");
			result.put("channelList", new ArrayList());
		}
		return result;
	}
	

}
