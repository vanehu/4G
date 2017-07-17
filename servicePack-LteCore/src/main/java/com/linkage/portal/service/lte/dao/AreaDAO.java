package com.linkage.portal.service.lte.dao;

import java.util.List;
import java.util.Map;

/**
 * 地区数据库接口
 * @author liusd
 * @modifyDate 2013-06-06
 */
public interface AreaDAO {
    /**
     * 根据父节点查询子节点信息
     * @return
     * @throws Exception
     */
    List<Map<String, Object>> findChildArea(Map param) throws Exception;
    /**
     * 根据地区号,查询归属省份,从而查询该省份下的城市信息.
     * @return
     * @throws Exception
     */
    List<Map<String, Object>> queryUserCityArea(String areaId) throws Exception;
    /**
     * 根据地区编码查询地区名称
     * @return
     * @throws Exception
     */
    Map<String, Object> queryAreaByAreaId(String areaId) throws Exception;
    /**
     * 根据叶子节点地区id查询上级地区树信息
     * @param areaId
     * @return
     * @throws Exception
     * @see
     */
    List<Map<String, Object>> queryAreaTreeByLeafAreaId(int areaId) throws Exception;
    /**
     * 根据父节点地区id查询下级地区树信息
     * @param areaId
     * @return
     * @throws Exception
     */
    List<Map<String, Object>> queryAreaTreeByParentAreaId(int areaId) throws Exception;
    
    /**
     * 根据地区id查询地区名称
     * @param areaId
     * @return
     * @throws Exception
     */
    List<Map<String,Object>> queryAreaNameByAreaId(String areaId) throws Exception;
    
    /**
     * 根据地区id查询父级地区信息
     * @param areaId
     * @return
     * @throws Exception
     */
    public Map<String, Object> queryParentAreaInfo(String areaId)throws Exception;
    
    /**
     * 根据areaId查询地区信息
     * @param areaId
     * @return
     * @throws Exception
     */
    public Map<String, Object> queryAreaInfo(String areaId)throws Exception;
}
