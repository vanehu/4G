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
     * 加载公告列表
     * 
     * @param dataBusMap
     *            入参
     * @param optFlowNum
     *            平台编码，用于记录日志
     * @param sessionStaff
     *            员工Session对象
     * @return List<Map<String,Object>> 返回菜单
     * @throws Exception
     */
    public List<Map<String, Object>> getNoticeList(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
    	throws Exception;
    
    /**
     * 加载热卖终端和套餐
     * 
     * @param dataBusMap
     *            入参
     * @param optFlowNum
     *            平台编码，用于记录日志
     * @param sessionStaff
     *            员工Session对象
     * @return List<Map<String,Object>> 返回套餐和终端信息
     * @throws Exception
     */
    public Map<String, Object> getHotProd(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
	throws Exception;
    
}
