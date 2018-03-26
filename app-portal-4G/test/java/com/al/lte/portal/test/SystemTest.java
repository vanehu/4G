package com.al.lte.portal.test;


import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.codehaus.jackson.map.ObjectMapper;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;

import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.bmo.system.AuthenticBmo;
import com.al.lte.portal.model.SessionStaff;

import net.sf.json.JSONArray;



public class SystemTest extends BaseJunit {
	@Autowired
    private AuthenticBmo authenticBmo;
	@Autowired
	private StaffBmo staffBmo;
	
	private SessionStaff setSessionStaff() throws Exception {
    	SessionStaff sessionStaff = new SessionStaff();
    	sessionStaff.setStaffId("5176843");
    	sessionStaff.setChannelId("1385688");
    	sessionStaff.setCurrentAreaId("8320400");
    	return sessionStaff;
	}
    @Test
    public void queryAuthenticDataRangeAreaData() throws Exception {
    	Map paramMap = new HashMap();
    	Map ret = new HashMap();
    	String optFlowNum = "13324324";
    	//String paramJson = "{'operatSpecCd':'YWSL_IPHONE','dataDimensionCd':'area001','transactionId':'17081616172061417587626','staffId':'5176843','areaLevel':'2','upRegionId':'','areaId':'8320400'}";
    	String paramJson = "{\"operatSpecCd\":\"YWSL_IPHONE\",\"dataDimensionCd\":\"area001\",\"transactionId\":\"17081616172061417587626\",\"staffId\":\"5176843\",\"areaLevel\":\"2\",\"upRegionId\":\"\",\"areaId\":\"8320400\"}";
    	ObjectMapper mapper = new ObjectMapper();
    	paramMap = mapper.readValue(paramJson, Map.class);
    	System.out.println("**************begin********");
    	ret = authenticBmo.queryAuthenticDataRangeAreaData(paramMap, optFlowNum, setSessionStaff());
    	System.out.println("**************end********"+JSONArray.fromObject(ret).toString());
    }
    @Test
    public void checkOperatSpec() throws Exception {
    	Map paramMap = new HashMap();
    	String ret = "";
    	String optFlowNum = "13324324";
    	//String paramJson = "{'operatSpecCd':'YWSL_IPHONE','dataDimensionCd':'area001','transactionId':'17081616172061417587626','staffId':'5176843','areaLevel':'2','upRegionId':'','areaId':'8320400'}";
    	//String paramJson = "{\"operatSpecCd\":\"YWSL_IPHONE\",\"dataDimensionCd\":\"area001\",\"transactionId\":\"17081616172061417587626\",\"staffId\":\"5176843\",\"areaLevel\":\"2\",\"upRegionId\":\"\",\"areaId\":\"8320400\"}";
    	//ObjectMapper mapper = new ObjectMapper();
    	//paramMap = mapper.readValue(paramJson, Map.class);

    	System.out.println("**************begin********");
    	ret = staffBmo.checkOperatSpec("JUMPAUTH", setSessionStaff());
    	System.out.println("**************end********"+ret.toString());
    }
    
}

