package com.linkage.portal.service.lte.core.resources;


import java.util.HashMap;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.exception.ExceptionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ailk.ecsp.core.DataSourceRouter;
import com.ailk.ecsp.service.Service;
import com.ailk.ecsp.util.IConstant;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.exception.ResultConstant;
import com.linkage.json.JacksonUtil;
import com.linkage.portal.service.lte.WriteCardUtil;
import com.linkage.portal.service.lte.dao.SoWriteCardDAO;
import com.linkage.portal.service.lte.dao.SoWriteCardDAOImpl;



/**
 * 读卡服务，根据厂商编码及密钥获取动态链接库密钥
 * @author xuj
 */
public class GetAuthCode extends Service {

    private final Logger log = LoggerFactory.getLogger(this.getClass());

    @Override
    public DataMap exec(DataMap dataBus, String serviceSerial) throws Exception {
        Map<String, Object> paramMap = dataBus.getInParam();

        if (MapUtils.isEmpty(paramMap)) {
            dataBus.setResultCode(ResultCode.R_PARAM_MISS);
            dataBus.setResultMsg("paramMap is null");
            return dataBus;
        }

        String dllPassword = (String) paramMap.get("dllPassword");
        String factoryCode = (String) paramMap.get("factoryCode");
        String randomNum = (String) paramMap.get("randomNum");
        String authCodeType = MapUtils.getString(paramMap, "authCodeType");
        
        if (StringUtils.isBlank(factoryCode)) {
            dataBus.setResultCode(ResultCode.R_PARAM_MISS);
            dataBus.setResultMsg("factoryCode is blank");
            return dataBus;
        }
        if (StringUtils.isBlank(dllPassword)) {
            dataBus.setResultCode(ResultCode.R_PARAM_MISS);
            dataBus.setResultMsg("dllPassword is blank");
            return dataBus;
        }
        if (StringUtils.isBlank(randomNum)) {
            dataBus.setResultCode(ResultCode.R_PARAM_MISS);
            dataBus.setResultMsg("randomNum is blank");
            return dataBus;
        }

        int iAuthCodeType = Integer.valueOf(authCodeType);
        String keyType = WriteCardUtil.DLL_KEY_DECRIPT_KEY;
        try {
            SoWriteCardDAO swc = new SoWriteCardDAOImpl();
            Map<String, Object> retnMap = new HashMap<String, Object>();
            String dbKeyWord = MapUtils.getString(paramMap, IConstant.CON_DB_KEY_WORD);
            if (StringUtils.isBlank(dbKeyWord)){
                DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
            }
            String pwd = swc.getPasswordKey(factoryCode, keyType);
            //组件鉴权密钥解密密钥DLL_KEY_DECRIPT_KEY
            //动态链接库写卡密钥需要传入暗文，之后用约定的密钥解密后生成
            //密钥暗文  解密获取密钥明文
            String passwordKey = WriteCardUtil.desECB(dllPassword, pwd, 1);
            String authCode = WriteCardUtil.desECB(randomNum, passwordKey, 0);
            authCode = changeCase(authCode, iAuthCodeType);
            dataBus.setResultCode(ResultConstant.R_POR_SUCCESS.getCode());
            retnMap.put("code", ResultConstant.R_POR_SUCCESS.getCode());
            retnMap.put("authCode", authCode);
            dataBus.setOutParam(retnMap);
        } catch (Exception e) {
            dataBus.setResultCode(ResultConstant.R_POR_FAIL.getCode());
            dataBus.setResultMsg(ExceptionUtils.getFullStackTrace(e));
            log.error("", e);
        }
        log.debug("out dataBus:{}", JacksonUtil.getInstance().ObjectTojson(dataBus));
        return dataBus;
    }

    private String changeCase(String value, int type) {
        //1:字符转成大写，2：字符转成小写，3：默认
        switch (type) {
            case 1:
                return value.toUpperCase();
            case 2:
                return value.toLowerCase();
            case 3:
                return value;
        }
        return value;
    }
}
