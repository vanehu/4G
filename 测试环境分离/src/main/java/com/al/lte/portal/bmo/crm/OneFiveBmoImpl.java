
package com.al.lte.portal.bmo.crm;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.model.SessionStaff;
import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * 一证五卡实现类，实现一证五卡业务中用到的接口方法
 *
 * @author liuteng
 * @version V1.0 2017-04-25
 * @createDate 2017-04-25 20:39:29
 * @modifyDate
 * @copyRight 亚信联创EC研发部
 */
@Service("com.al.lte.portal.bmo.crm.OneFiveBmo")
public class OneFiveBmoImpl implements OneFiveBmo {

    protected final Log log = Log.getLog(getClass());

    /**
     * 上传文件
     *
     * @param param        入参主要加base64编码的文件数据
     * @param sessionStaff 当前登录的工号
     * @return 上传结果
     */
    @Override
    public Map<String, Object> uploadFile(Map<String, Object> param, SessionStaff sessionStaff) throws Exception {
        Map<String, Object> resultMap = new HashMap<String, Object>();
        DataBus db = InterfaceClient.callService(param, PortalServiceCode.INTF_UPLOAD_IMAGE, null, sessionStaff);
        try {
            if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
                resultMap = db.getReturnlmap();
                resultMap.put("code", ResultCode.R_SUCCESS);
            } else {
                resultMap.put("code", ResultCode.R_FAIL);
                resultMap.put("msg", db.getResultMsg());
            }
        } catch (Exception e) {
            log.error("门户处理营业受理后台的service/intf.fileOperateService/upLoadPicturesFileToFtp服务返回的数据异常", e);
            throw new BusinessException(ErrorCode.UPLOAD_CUST_CERTIFICATE, param, db.getReturnlmap(), e);
        }
        return resultMap;
    }
}
