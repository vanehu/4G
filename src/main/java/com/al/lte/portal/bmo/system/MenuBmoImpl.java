package com.al.lte.portal.bmo.system;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Service;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.model.SessionStaff;


/**
 * 菜单业务逻辑 .
 * <P>
 * 
 * @author wukf
 * @version V1.0 2013-08-06
 * @createDate 2013-08-06 下午3:29:12
 * @modifyDate 
 * @copyRight 亚信联创电信CRM研发部
 */
@Service("com.al.lte.portal.bmo.system.MenuBmo")
public class MenuBmoImpl implements MenuBmo {
	
	private final Log log = Log.getLog(getClass());
	
	//新开发，在用：首页功能菜单
	public Map<String, Object> menuQryAll(Map dataBusMap, String optFlowNum, SessionStaff sessionStaff)
	throws Exception{
		Map<String,Object> result = new HashMap<String,Object>();
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.MENU_QUERY_ALL,
                optFlowNum, sessionStaff);
		try{
			result.put("code", -1);
			result.put("mess", db.getResultMsg());
			if (db.getResultCode().equals(ResultCode.R_SUCC)) {
				Map resultMap = db.getReturnlmap();
				result.put("code", 1);
				result.put("mess", resultMap.get("resultMsg"));
				if(ResultCode.R_SUCC.equals(resultMap.get("resultCode"))){
		        	if(resultMap.get("result")!=null){
		        		List<Map> list1 = (List<Map>)resultMap.get("result");
		        		if(list1!=null&&list1.size()>0){
		        			Map<String,Object> _menu1 ;
		        			
		        			List<Map> _list1 = new ArrayList<Map>();
		     				for(Map rowTemp1:list1){
		     					int showson1 = 0 ;
		     					_menu1 = rowTemp1 ;
		     					
		     					List<Map> _list2 = new ArrayList<Map>();
		     					if(_menu1.get("childMenuResources")!=null){
		     						List<Map> list2 = (List<Map>)_menu1.get("childMenuResources");
		     	 					Map<String,Object> _menu2 ;
		     	 					if(list2!=null&&list2.size()>0){
		     	 						for(Map rowTemp2:list2){
		     	 	 						_menu2 = rowTemp2 ;
		     	 	 						if("Y".equals(_menu2.get("isMainMenu"))){
		     	 	 							if(showson1==0){
		     	 	 								showson1 = 1 ;
		     	 	 							}
		     	 	 						}
		     	 	 						
		     	 	 						List<Map> _list3 = new ArrayList<Map>();
		     	 	 						int showson2 = 0 ;
		     	 	 						if(_menu2.get("childMenuResources")!=null){
		     	 	 							List<Map> list3 = (List<Map>)_menu2.get("childMenuResources");
		     	 	 	 	 					Map<String,Object> _menu3 ;
		     	 	 	 	 					if(list3!=null&&list3.size()>0){
		     	 	 	 	 						for(Map rowTemp3:list3){
		     	 	 	 	 	 						_menu3 = rowTemp3 ;
		     	 	 	 	 	 						if("Y".equals(_menu3.get("isMainMenu"))){
		     	 	 	 	 	 							showson2 = 1 ;
		     	 	 	 	 	 						}
		     	 	 	 	 	 						_list3.add(_menu3);
		     	 	 	 	 	 					}
		     	 	 	 	 						if(showson1>0&&showson2==1){
		     	 	 	 	 	 						showson1 = 2 ;
		     	 	 	 	 	 					}
		     	 	 	 	 					}
		     	 	 						}
		     	 	 	 					_menu2.put("childMenuResources", _list3);
		     	 	 	 					_menu2.put("shownum", showson2);
		     	 	 	 					_list2.add(_menu2);
		     	 	 					}
		     	 					}
		     					}
		     					_menu1.put("childMenuResources",_list2);
		     					_menu1.put("shownum", showson1);
		     					_list1.add(_menu1);
		            		}
		     				result.put("menuList", _list1);
		     				result.put("code", 0);
		        		}
		        	}       	
		        }
			}
			return result ;
		}catch(Exception e){
			throw new BusinessException(ErrorCode.QUERY_MENU_INFO,dataBusMap,db.getReturnlmap(), e);
		}
	}
		
	//测试中：首页 快捷菜单
    public Map<String, Object> preShortCut(Map dataBusMap, String optFlowNum, SessionStaff sessionStaff)
            throws Exception {
    	
    	Map<String,Object> returnMap = new HashMap<String,Object>();
    	
        // 菜单信息列表
        List<Map<String, Object>> menuResInfoList = null;
        DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.MAIN_SHORT_CUT, optFlowNum,
                sessionStaff);
        
        try{        	
        	Map resultMap = db.getReturnlmap();
            if(ResultCode.R_SUCC.equals(resultMap.get("resultCode"))){
            	Object obj = resultMap.get("result");
            	if(obj instanceof List){
            		menuResInfoList = (List<Map<String, Object>>)obj;
            	}else if(obj instanceof Map){
            		Map map = (Map)obj;
            		if(map.get("menuResources")!=null){
            			menuResInfoList = (List<Map<String, Object>>)map.get("menuResources");	
            		}{
            			menuResInfoList.add(map);
            		}
            	}
           	}
            if(menuResInfoList==null){
            	returnMap.put("menuResources", new ArrayList<Map<String,Object>>());
            }else{
            	returnMap.put("menuResources", menuResInfoList);
            }       	
        }catch(Exception e){
        	log.error("门户处理系统管理的queryShortcutMenu服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_SHORTCUT, dataBusMap, db.getReturnlmap(), e);
        }
        return returnMap;
    }    
    
    //快捷菜单增删
    public int setShortcut(Map dataBusMap, String optFlowNum, SessionStaff sessionStaff)
    		throws Exception {
    	    	
    	DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.SET_SHORTCUT, optFlowNum, sessionStaff);
    	int flag = 2;
    	try{
    		Map<String, Object> resultMap = db.getReturnlmap();    	
        	if(resultMap.get("resultCode").equals(ResultCode.R_SUCC)){
        		flag = 0;
        	}
        	else if(resultMap.get("resultCode").equals(ResultCode.R_FAILURE)){
        		flag = 1;
        	}
        	else{
        		flag = -1;
        	}
    	}catch(Exception e){
			log.error("门户处理系统管理的modifyShortcutMenu服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.SET_SHORTCUT, dataBusMap, db.getReturnlmap(), e);
		}	    	
    	return flag;
    }
    
    public List querynewinfos(Map dataBusMap, String optFlowNum, SessionStaff sessionStaff)
	throws Exception{
    	
    	Map<String,Object> returnMap = new HashMap<String,Object>();
    	
        List newInfos = new ArrayList();
        DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.QUERY_NEW_INFOS, optFlowNum,
                sessionStaff);
        Map resultMap = db.getReturnlmap();
        if(ResultCode.R_SUCC.equals(resultMap.get("resultCode"))){
        	Map<String, Object> result = (Map<String, Object>)resultMap.get("result");
       	 	if(result!=null&&result.get("newInfos")!=null){
       	 		newInfos = (List)result.get("newInfos");	
       	 	}
       	}
        return newInfos;        
    }
	
}
