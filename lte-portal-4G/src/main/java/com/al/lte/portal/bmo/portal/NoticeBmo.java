package com.al.lte.portal.bmo.portal;

import java.util.List;
import java.util.Map;

import com.al.ecs.exception.BusinessException;
import com.al.lte.portal.model.SessionStaff;

/**
 * 类描述 .
 * <P>
 * 
 * @author bianxw
 * @version V1.0 2013-8-7
 * @createDate 2013-8-7 下午2:52:31
 * @modifyDate bianxw 2013-8-7 <BR>
 * @copyRight 亚信联创电信EC产品部
 */
public interface NoticeBmo {
	
	/**
	 * WEB版专用的公告查询接口
	 */
	public Map<String, Object> getNoticeList_WEB(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
     * 公告查询接口
     */
	public List<Map<String, Object>> getNoticeList(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception;
    
    /**
     * 加载热卖终端和套餐
     */
    public Map<String, Object> getHotProd(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception;
    
    /**
     * 查询操作手册列表
     */
    public Map<String, Object> getManualList(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception;
    
}
