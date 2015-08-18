package com.al.lte.portal.bmo.crm;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import org.springframework.stereotype.Service;
import com.al.ec.serviceplatform.client.DataBus;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.ServiceClient;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;


/**
 * 公用业务操作类 .
 * <P>
 * 
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 下午2:14:11
 * @modifyDate
 * @copyRight 亚信联创电信CRM研发部
 */
@Service("com.al.lte.portal.bmo.crm.CommonBmo")
public class CommonBmoImpl implements CommonBmo {
	
	protected final Log log = Log.getLog(getClass());

	public boolean checkToken(HttpServletRequest request, String token){
		try{
			HttpSession session = ServletUtils.getSession(request);
			String tokenAttr = (String)session.getAttribute(SysConstant.ORDER_SUBMIT_TOKEN);
			if(tokenAttr!=null && tokenAttr.equals(request.getParameter("token"))){  //验证订单
				session.removeAttribute(SysConstant.ORDER_SUBMIT_TOKEN);
				return true;
			}else {
				return false;
			}
		}catch(Exception e){
			log.error(e);
			return false;
		}
	}

	/**
	 * 释放资源
	 */
	public Map<String, Object> updateResState(ArrayList paramList,String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		Map resMap = new HashMap();
		if(paramList!=null&&paramList.size()>0){
			Map inMap = new HashMap();
			inMap.put("param", paramList);
			inMap.put("batchFlag", "0");
			DataBus db = ServiceClient.callService(inMap,
					PortalServiceCode.UPDATE_RELEASE_NUM_STATUS, optFlowNum,sessionStaff);
			resMap = db.getReturnlmap();
		}
		return resMap;
	}
	
}
