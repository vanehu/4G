package com.al.lte.portal.bmo.crm;

import com.al.lte.portal.model.SessionStaff;

import java.util.Map;

/**
 * 二次业务接口类，定义二次业务中用到的接口方法提供给控制器调用
 *
 * @author liuteng
 * @version V1.0 2016-01-25
 * @createDate 2016-01-25 20:07:45
 * @modifyDate
 * @copyRight 亚信联创EC研发部
 */
public interface SecondBusiness {

    /**
     * 查询二次业务菜单对应的鉴权权限
     *
     * @param param map类型的入参信息一般为
     * @param flowNum 操作流水号
     * @param sessionStaff 当前登录的员工信息
     * @return map数据类型的鉴权权限信息数据
     * @throws Exception
     */
    public Map<String, Object> querySecondBusinessMenuAuth(Map<String, Object> param,
                                                           String flowNum, SessionStaff sessionStaff) throws Exception;

    /**
     * 鉴权日志记录接口用于记录每次的鉴权方式，鉴权时间等相关参数，后台返回一个记录id给前台
     *
     * @param param map类型的入参信息一般为
     * @param flowNum 操作流水号
     * @param sessionStaff 当前登录的员工信息
     * @return map数据类型的权限日志记录结果
     * @throws Exception
     */
    public Map<String, Object> saveAuthRecord(Map<String, Object> param,
                                              String flowNum, SessionStaff sessionStaff) throws Exception;

}
