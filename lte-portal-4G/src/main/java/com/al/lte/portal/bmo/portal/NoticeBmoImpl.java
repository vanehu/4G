package com.al.lte.portal.bmo.portal;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.model.SessionStaff;

/**
 * 公告 .
 * <P>
 * 
 * @author bianxw
 * @version V1.0 2013-8-7
 * @createDate 2013-8-7 下午3:02:37
 * @modifyDate bianxw 2013-8-7 <BR>
 * @copyRight 亚信联创电信EC产品部
 */
@Service("com.al.ecs.portal.agent.bmo.portal.NoticeBmo")
public class NoticeBmoImpl implements NoticeBmo {
	
	/*
	 * WEB版本专用的公告查询
	 * @see com.al.lte.portal.bmo.portal.NoticeBmo#getNoticeList(java.util.Map, java.lang.String, com.al.lte.portal.model.SessionStaff)
	 */
	public Map<String, Object> getNoticeList_WEB(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> returnMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.NOTICE_QUERY, optFlowNum, sessionStaff);
        try{
        	returnMap = db.getReturnlmap();
        }catch(Exception e){
			throw new BusinessException(ErrorCode.BULLET_IN_INFO, dataBusMap, returnMap, e);
		}
        return returnMap;
	}

	/*
	 * 公告查询（PAD, APP门户使用）
	 * @see com.al.lte.portal.bmo.portal.NoticeBmo#getNoticeList(java.util.Map, java.lang.String, com.al.lte.portal.model.SessionStaff)
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> getNoticeList(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception {
		List<Map<String, Object>> infoList = new ArrayList<Map<String, Object>>();
        DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.NOTICE_QUERY, optFlowNum, sessionStaff);
        try{
        	Map<String, Object> resultMap = db.getReturnlmap();
            if(ResultCode.R_SUCC.equals(resultMap.get("resultCode"))){
            	List<Map<String, Object>> list = (List<Map<String, Object>>)resultMap.get("result");
            	return list;
            }
            return infoList;
        }catch(Exception e){
			throw new BusinessException(ErrorCode.CUST_ORDER,dataBusMap,db.getReturnlmap(), e);
		}
	}

	@SuppressWarnings("unchecked")
	public Map<String, Object> getHotProd(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
		throws Exception {
		
        Map<String, Object> result = new HashMap<String, Object>();
        DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.MAIN_HOTPRODUCT,
                optFlowNum, sessionStaff);
        Map<String, Object> resultMap = db.getReturnlmap();
        if(ResultCode.R_SUCC.equals(resultMap.get("resultCode"))){
        	result = (Map<String, Object>)resultMap.get("result");
        	return result;
        	/*
        	 Map<String, Object> result = (Map<String, Object>)resultMap.get("result");
        	 if(result!=null&&result.get("infoList")!=null){
        		 infoList = (ArrayList<Map<String, Object>>) result.get("infoList");
        	 }
        	 */
        }
        return result;
	}
	
	/*
	 * 操作手册查询
	 */
	public Map<String, Object> getManualList(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> returnMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.MANUAL_QUERY, optFlowNum, sessionStaff);
        try{
        	returnMap = db.getReturnlmap();
        }catch(Exception e){
			throw new BusinessException(ErrorCode.BULLET_IN_INFO, dataBusMap, returnMap, e);
		}
        return returnMap;
	}
	
}
