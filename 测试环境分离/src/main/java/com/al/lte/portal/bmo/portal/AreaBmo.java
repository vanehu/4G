package com.al.lte.portal.bmo.portal;

import java.util.Map;

import com.al.ecs.exception.BusinessException;
import com.al.lte.portal.model.SessionStaff;

public interface AreaBmo {

	/**
     * 根据父地区查询下级地区树
     * @param map 父地区id(parentAreaId)
     * @param optFlowNum
     * @param sessionStaff
     * @return
     * @throws Exception
     */
    Map<String, Object> queryAreaTreeByParentAreaId(Map<String, Object> map, String optFlowNum, SessionStaff sessionStaff)
            throws Exception;

}
