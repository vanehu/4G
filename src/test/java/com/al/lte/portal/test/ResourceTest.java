package com.al.lte.portal.test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.codehaus.jackson.map.ObjectMapper;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;

import com.al.ec.serviceplatform.client.DataBus;
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
    @Test
    public void phoneNumInfoQry() throws Exception {
    	Map paramMap = new HashMap();
    	Map ret = new HashMap();
    	String optFlowNum = "13324324";
    	String paramJson = "{\"pnEnd\":\"\",\"pnHead\":\"\",\"poolId\":\"8320400\",\"areaId\":\"8320400\",\"goodNumFlag\":\"\",\"maxPrePrice\":\"0\",\"minPrePrice\":\"0\",\"pnLevelCd\":\"\",\"enter\":\"3\",\"queryFlag\":\"1\",\"pageSize\":\"10\",\"provinceId\":\"8320000\",\"channelId\":\"1385688\",\"transactionId\":\"17081616220863513340557\",\"reqInfo\":{\"staffId\":\"5176843\",\"requestService\":\"PnQueryService\",\"reqTime\":\"20170816162208\",\"srcSysID\":\"1000000045\",\"distributorId\":\"\",\"tranId\":\"17081616220863513340557\",\"areaId\":\"8320400\"}}";
    	ObjectMapper mapper = new ObjectMapper();
    	paramMap = mapper.readValue(paramJson, Map.class);
    	System.out.println("**************begin********");
    	ret =  mktResBmo.phoneNumInfoQry(paramMap, optFlowNum, setSessionStaff());
    	System.out.println("**************end********"+JSONArray.fromObject(ret).toString());
    }    
    
}
