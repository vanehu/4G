package com.al.lte.portal.bmo.staff;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Service;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.ServiceClient;
import com.al.lte.portal.model.SessionStaff;

/**
 * 登录密码检查 <BR>
 * 登录是否需要修改密码、进入主界面是否需要修改密码
 * <P>
 * 
 * @author lianld
 * @version V1.0 2013-3-06
 * @createDate 2013-3-06
 * @modifyDate gongrui 2013-3-06 <BR>
 * @copyRight 电子渠道集团代理商门户
 */
@Service("com.al.lte.portal.bmo.staff.PwdCheckBmo")
public class PwdCheckBmoImpl implements PwdCheckBmo {
	/**
	 * 登录初始密码
	 */
	private String initPwd = "888888";

	public int queryLoginSuccessCount(Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		// TODO Auto-generated method stub
		DataBus db = ServiceClient.callService(dataBusMap,
				PortalServiceCode.QUERY_LOGIN_SUCCESS_COUNT,
				optFlowNum, sessionStaff);
		int count = 0;
		// 服务层调用与接口层调用都成功时，返回列表；否则返回0
		if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			Map<String, Object> rMap = db.getReturnlmap();
			//System.out.println("----------loginSuccessCount："+rMap.get("loginSuccessCount"));
			String result = null;
			if(rMap.containsKey("loginSuccessCount")) {
				result = rMap.get("loginSuccessCount").toString();
			}
			if(result == null || "".equals(result)){
				return count;
			}
			count = Integer.parseInt(result);
			//判断是否第一次登录并且为初始密码，是则返回1 否则返回0
			if(count == 1){
				String staffPwd = (String)dataBusMap.get("password");
				if(initPwd.equals(staffPwd)){
					count = 1;
				}else {
					count = 0;
				}
			}else {
				count = 0;
			}
		} else {
			return 0;
		}
		return count;
	}

	public int queryStaffPwdUpdate(Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		// TODO Auto-generated method stub
		//返回结果，1代表不需要更新，0代表需要更新
		int result = 1;
		//获取最后一次修改密码的日期
		DataBus db = ServiceClient.callService(dataBusMap,
				PortalServiceCode.QUERY_LAST_PWD_CHANGE_DATE,
				optFlowNum, sessionStaff);
		Map<String, Object> returnMap = db.getReturnlmap();
		if(returnMap == null) {
			return result;
		}
		String dateS = null;
		if(returnMap.containsKey("pwdChangeDate")) {
			dateS = returnMap.get("pwdChangeDate").toString();
		}
		if(("firstUpdate").equals(dateS) || dateS == null){
			return result;
		}
		//获取系统参数周期
		int pwdUpdateCycle = 0;
		String cycle = MapUtils.getString(returnMap, "pwdUpdateCycle");
		if(null != cycle && !"".equals(cycle)) {
			pwdUpdateCycle = Integer.parseInt(cycle);
		}
		if(pwdUpdateCycle == 0){
			return result;
		}
		//获取当前日期减去最后一次修改密码的日期
		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
		Date lastDate = format.parse(dateS);
		Date nowDate = new Date();
		long days = (nowDate.getTime()-lastDate.getTime()+1000000)/(3600*24*1000);
		
		//如果想减日期大于系统参数中天数，则需要强制更新密码
		if(days > pwdUpdateCycle) {
			result = 0;
		}
		return result;
	}

}
