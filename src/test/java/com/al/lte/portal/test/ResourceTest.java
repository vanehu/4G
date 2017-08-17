package com.al.lte.portal.test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.codehaus.jackson.map.ObjectMapper;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;

import com.al.lte.portal.bmo.crm.MktResBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.crm.SecondBusiness;
import com.al.lte.portal.model.SessionStaff;

import net.sf.json.JSONArray;



public class ResourceTest extends BaseJunit {
	@Autowired
    private MktResBmo mktResBmo;
	@Autowired
	private SecondBusiness secondBusiness;
	
	private SessionStaff setSessionStaff() throws Exception {
    	SessionStaff sessionStaff = new SessionStaff();
    	sessionStaff.setStaffId("5176843");
    	sessionStaff.setChannelId("1385688");
    	sessionStaff.setCurrentAreaId("8320400");
    	return sessionStaff;
	}
    @Test
    public void prePhoneNumber() throws Exception {
    	Map paramMap = new HashMap();
    	Map ret = new HashMap();
    	String optFlowNum = "13324324";
    	String paramJson = "{\"provinceId\":\"8320000\",\"transactionId\":\"17081616282034570618509\",\"orderNo\":\"\",\"staffId\":\"5176843\",\"phoneNumber\":\"17768374854\",\"channelId\":\"1385688\",\"anTypeCd\":\"4\",\"reqInfo\":{\"staffId\":\"5176843\",\"requestService\":\"PnReserveService\",\"reqTime\":\"20170816162820\",\"srcSysID\":\"1000000045\",\"distributorId\":\"\",\"tranId\":\"17081616282034570618509\",\"areaId\":\"8320400\"},\"actionType\":\"E\",\"areaId\":\"8320400\"}";
    	ObjectMapper mapper = new ObjectMapper();
    	paramMap = mapper.readValue(paramJson, Map.class);
    	System.out.println("**************begin********");
    	ret = mktResBmo.prePhoneNumber(paramMap, optFlowNum, setSessionStaff());
    	System.out.println("**************end********"+JSONArray.fromObject(ret).toString());
    }

}
