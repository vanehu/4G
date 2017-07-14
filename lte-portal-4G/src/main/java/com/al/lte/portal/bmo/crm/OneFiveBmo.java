package com.al.lte.portal.bmo.crm;

import com.al.lte.portal.model.SessionStaff;

import java.util.Map;

/**
 * 一证五卡接口类，定义一证五卡业务中用到的接口方法提供给控制器调用
 *
 * @author liuteng
 * @version V1.0 2017-04-25
 * @createDate 2017-04-25 20:38:29
 * @modifyDate
 * @copyRight 亚信联创EC研发部
 */
public interface OneFiveBmo {

    /**
     * 上传文件
     * @param param 入参主要加base64编码的文件数据
     * @param sessionStaff 当前登录的工号
     * @return 上传结果
     */
    Map<String, Object> uploadFile(Map<String, Object> param, SessionStaff sessionStaff) throws Exception;

    /**
     * 下载文件
     * @param param 入参主要流水号
     * @param sessionStaff 当前登录的工号
     * @return 下载结果
     */
    Map<String, Object> downFile(Map<String, Object> param, SessionStaff sessionStaff) throws Exception;


    /**
     * 一证五卡报表统计查询
     * @param param 入参主要为时间段
     * @param sessionStaff 当前登录的工号
     * @return 报表统计结果
     */
    Map<String, Object> queryReport(Map<String, Object> param, SessionStaff sessionStaff) throws Exception;

}
