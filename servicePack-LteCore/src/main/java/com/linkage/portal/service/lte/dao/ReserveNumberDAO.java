package com.linkage.portal.service.lte.dao;

import java.util.List;
import java.util.Map;

/**
 * 号码预占释放数据库接口
 * @author xuj
 * @modifyDate 2013-10-22
 */
public interface ReserveNumberDAO {
    /**
     * 根据条件查询号码信息
     * @return
     * @throws Exception
     */
    Map<String, Object> QueryAccNbrToRelease(Map param) throws Exception;
	/**
	 * 保存预占号码(UIM卡)信息
	 * @param param
	 * @throws Exception
	 */
	public int insertAccNbr(Map<String,Object> param) throws Exception;
	/**
	 * 修改预占号码信息
	 * @param map
	 * @throws Exception
	 */
	public int updateAccNbr(Map<String,Object> map)  throws Exception;
	
	

}
