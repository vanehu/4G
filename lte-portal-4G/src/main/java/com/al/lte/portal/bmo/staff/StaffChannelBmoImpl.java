package com.al.lte.portal.bmo.staff;

import java.io.IOException;
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
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.InterfaceException.ErrType;
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
			result.put("code", ResultCode.R_EXCEPTION);
			result.put("mess", db.getResultMsg());
			List list = new ArrayList();
			Map chainmap = new HashMap();
			if (db.getResultCode().equals(ResultCode.R_SUCC)) {
				Map returnMap = db.getReturnlmap() ;
				result.put("code", ResultCode.R_FAILURE);
				result.put("mess", returnMap.get("resultMsg"));
				if(returnMap.get("resultCode").equals(ResultCode.R_SUCC)){
					if(returnMap.get("result") instanceof List){
						list = (List)returnMap.get("result") ;
						result.put("code", ResultCode.R_SUCC);
					}else if(returnMap.get("result") instanceof Map){
						Map Map = (Map)returnMap.get("result");
						list = (List)Map.get("rangeChannels");
						chainmap = (Map)Map.get("chain");
						result.put("code", ResultCode.R_SUCC);
						if(list.size()==0){
							result.put("code", ResultCode.R_RULE_EXCEPTION);
							result.put("mess","该员工没有关联的渠道或者关联渠道已经失效！");
						}
					}
				}
			}
			result.put("rangeChannels", list);
			result.put("chain", chainmap);
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
		channl_data.put("dbRouteLog", sessionStaff.getAreaId());
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
							if("NL".equals(defaultId)){//能力开放
								if(sessionStaff.getchannelCode().toString().equals(map.get("chnNbr").toString())){
									result = new HashMap(map) ;
									break;
								}
							}else if(defaultId.equals(map.get("id"))){
								result = new HashMap(map) ;
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
			if(result==null){
				result = new HashMap<String, Object>();
				result.put("id", "");
				result.put("name", "");
				result.put("areaId", "");
				result.put("areaCode", "");
				result.put("areaName", "");
				result.put("channelList", new ArrayList());
				result.put("operatorsId", "");
			}
			if(channnel_res.get("chain") != null){
				Map chain = (Map)channnel_res.get("chain");
				String operatorsId = String.valueOf(chain.get("operatorsId"));
				result.put("operatorsId", operatorsId);
			}else{
				result.put("operatorsId", "");
			}
			result.put("code", channnel_res.get("code"));
			result.put("mess", channnel_res.get("mess"));
			return result;
		} catch (InterfaceException ie){
			throw ie ;
		} catch (Exception be) {
			throw new BusinessException(ErrorCode.QUERY_CHANNEL, channl_data, channnel_res, be);
		} 
	}

	
	public Map<String, Object> qryChannelListByCond(Map dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws InterfaceException, IOException, Exception {

		Map<String, Object> resultMap = new HashMap<String, Object>();
		
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.QRY_CHANNEL_BY_COND, optFlowNum, sessionStaff);
		
		resultMap.put("interfaceCode", "1");//判别接口调用是否正常，0正常，1异常
		resultMap.put("msg", db.getResultMsg());
		
		List list = new ArrayList();
		Map chainMap = new HashMap();
		
		if(db.getResultCode().equals(ResultCode.R_SUCC)){
			Map returnMap = db.getReturnlmap();
			resultMap.put("interfaceCode", "0");
			resultMap.put("msg", returnMap.get("resultMsg"));
			if(ResultCode.R_SUCC.equals(returnMap.get("resultCode"))){//判断渠道返回是否正常
				resultMap.put("resultCode", "0");
				resultMap.put("total", returnMap.get("total"));
				if(returnMap.get("result") != null && returnMap.get("result") instanceof List){//先判断是否为空，避免报异常
					list = (List)returnMap.get("result") ;
					resultMap.put("result", list);
				}
			}
		} else{
			resultMap.put("msg", "渠道查询接口调用失败 !");
		}
		
		return resultMap;
	}
	
	/**
	 * 根据staffId向渠道查询：受理渠道、归属渠道、归属渠道的店中商渠道
	 * @param qryParamMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception 
	 * @throws IOException 
	 * @throws InterfaceException
	 * @author ZhangYu 2016-06-02
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryAllChannelByStaffId(Map<String, Object> qryParamMap, String optFlowNum, SessionStaff sessionStaff) throws BusinessException, InterfaceException, IOException, Exception{
		
		Map<String, Object> returnMap = new HashMap<String, Object>();
		Map<String, Object> resultData = null;
		
		DataBus db = InterfaceClient.callService(qryParamMap, PortalServiceCode.INTF_QUERYALLCHANNELBYSTAFFID, optFlowNum, sessionStaff);
		if (ResultCode.R_SUCC.equals(db.getResultCode())) {//接口调用成功
			resultData = db.getReturnlmap();
			if(resultData != null && ResultCode.R_SUCC.equals(resultData.get("resultCode"))){//返回数据成功
				Map<String, Object> resultMap = (Map<String, Object>) resultData.get("result");
				if(resultMap != null && resultMap.get("rangeChannels") instanceof List){
					returnMap.put("code", "0");
					returnMap.put("resultList", (ArrayList<Map<String, Object>>) resultMap.get("rangeChannels"));
				} else{
					throw new BusinessException(ErrorCode.QUERY_CHANNEL, qryParamMap, resultData, new Exception("回参rangeChannels非List类型"));
				}
			} else{
				returnMap.put("code", "1");
				returnMap.put("message", MapUtils.getString(resultData, "resultMsg", "集团渠道channelService/service/interact/synStaffBean/qryChannelByStaff服务异常"));
			}
		} else {
			returnMap.put("code", "1");
			returnMap.put("message", MapUtils.getString(resultData, "errorStack", "集团渠道channelService/service/interact/synStaffBean/qryChannelByStaff服务异常"));
		}
		
		return returnMap;
	}
}
