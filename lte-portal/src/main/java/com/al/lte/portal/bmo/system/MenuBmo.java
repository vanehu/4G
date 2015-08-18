package com.al.lte.portal.bmo.system;

import java.util.List;
import java.util.Map;

import com.al.ecs.exception.BusinessException;
import com.al.lte.portal.model.SessionStaff;

/**
 * 类描述 .
 * <P>
 * 
 * @author wukf
 * @version V1.0 2013-08-06
 * @createDate 2013-08-06 下午3:29:12
 * @modifyDate 
 * @copyRight 亚信联创电信EC研发部
 */
public interface MenuBmo {
	
	public Map<String, Object> menuQryAll(Map dataBusMap, String optFlowNum, SessionStaff sessionStaff)
    	throws Exception;
	
    public Map<String, Object> preShortCut(Map dataBusMap, String optFlowNum, SessionStaff sessionStaff)
            throws Exception;
    
    public int setShortcut(Map dataBusMap, String optFlowNum, SessionStaff sessionStaff)
    		throws Exception; 	
    
    public List querynewinfos(Map dataBusMap, String optFlowNum, SessionStaff sessionStaff)
		throws Exception; 
    
}
