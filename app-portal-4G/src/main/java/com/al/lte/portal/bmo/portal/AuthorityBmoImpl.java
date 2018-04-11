package com.al.lte.portal.bmo.portal;

import javax.servlet.http.HttpServletRequest;

import com.al.ecs.log.Log;
import com.al.ecs.spring.interceptor.AbstractAuthorityInterceptor;
import com.al.lte.portal.common.EhcacheUtil;

/**
 * 权限业务判断实现类 .
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-9-24
 * @createDate 2012-9-24 下午5:56:00
 * @modifyDate tang zheng yu 2012-9-24 <BR>
 * @copyRight 亚信联创EC研发部
 */
public class AuthorityBmoImpl extends AbstractAuthorityInterceptor {
 
	protected Log log = Log.getLog(AuthorityBmoImpl.class);
    @Override
    public int checkAuthorityByActionMethod(HttpServletRequest request, String authorityCode) {
    	
    	//暂时放开批量业务的校验
    	if(authorityCode.indexOf("/order/batchOrder/") != -1){
    		return SUCCESS;
    	}
    	
        this.log.debug(" checkAuthority begin result={}");
        boolean result = EhcacheUtil.pathIsInSession(request.getSession(true),authorityCode);
        this.log.debug(" checkAuthority end result={}", result);
        if (result) {
            return SUCCESS;
        } else {
            if(authorityCode.startsWith("/")){
            	authorityCode=authorityCode.replaceFirst("/", "");
            }
            result = EhcacheUtil.pathIsInSession(request.getSession(true),authorityCode);
            if (result) {
                return SUCCESS;
            } else {
            	return FAILED;
            }
        }
    }
}
