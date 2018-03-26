package com.al.lte.portal.bmo.crm;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.model.SessionStaff;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * 二次业务接口类，实现二次业务接口中用到的接口方法提供给控制器调用
 *
 * @author liuteng
 * @version V1.0 2016-01-25
 * @createDate 2016-01-25 20:08:45
 * @modifyDate
 * @copyRight 亚信联创EC研发部
 */
@Service("com.al.lte.portal.bmo.crm.SecondBusiness")
public class SecondBusinessImpl implements SecondBusiness {
    protected final Log log = Log.getLog(getClass());

    /**
     * 查询二次业务菜单对应的鉴权权限
     *
     * @param paramMap map类型的入参信息一般为
     * @param flowNum 操作流水号
     * @param sessionStaff 当前登录的员工信息
     * @return map数据类型的鉴权权限信息数据
     * @throws Exception
     */

    public Map<String, Object> querySecondBusinessMenuAuth(Map<String, Object> paramMap, String flowNum, SessionStaff sessionStaff) throws Exception {
        DataBus db = InterfaceClient.callService(paramMap,
                PortalServiceCode.QUERY_BIZ_SECONDBUSINESS_MENU_AUTH, flowNum, sessionStaff);
        Map<String, Object> resultMap = new HashMap<String, Object>();
        try{
            // 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
            if (ResultCode.R_SUCC.equals(db.getResultCode())) {
                resultMap = db.getReturnlmap();
            } else {
                resultMap.put("resultCode", ResultCode.R_FAILURE);
                resultMap.put("resultMsg", db.getResultMsg());
            }
        } catch (Exception e) {
            log.error("门户处理营业后台的qryBusiOptionalAuthentiMode服务返回的数据异常", e);
            throw new BusinessException(ErrorCode.QUERY_BIZ_SECONDBUSINESS_MENU_AUTH, paramMap, resultMap, e);
        }
        return resultMap;
    }
    /**
     * 鉴权日志记录接口用于记录每次的鉴权方式，鉴权时间等相关参数，后台返回一个记录id给前台
     *
     * @param paramMap map类型的入参信息一般为
     * @param flowNum 操作流水号
     * @param sessionStaff 当前登录的员工信息
     * @return map数据类型的权限日志记录结果
     * @throws Exception
     */

    public Map<String, Object> saveAuthRecord(Map<String, Object> paramMap, String flowNum, SessionStaff sessionStaff) throws Exception {
        DataBus db = InterfaceClient.callService(paramMap,
                PortalServiceCode.SAVE_BIZ_AUTH_RECORD, flowNum, sessionStaff);
        Map<String, Object> resultMap = new HashMap<String, Object>();
        try{
            // 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
            if (ResultCode.R_SUCC.equals(db.getResultCode())) {
                resultMap = db.getReturnlmap();
            } else {
                resultMap.put("resultCode", ResultCode.R_FAILURE);
                resultMap.put("resultMsg", db.getResultMsg());
            }
        } catch (Exception e) {
            log.error("门户处理营业后台的custIdentityAuthRecord服务返回的数据异常", e);
            throw new BusinessException(ErrorCode.SAVE_BIZ_AUTH_RECORD, paramMap, resultMap, e);
        }
        return resultMap;
    }
}
