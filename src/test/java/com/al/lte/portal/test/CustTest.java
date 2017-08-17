package com.al.lte.portal.test;


import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.codehaus.jackson.map.ObjectMapper;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;

import com.al.lte.portal.bmo.crm.CustBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.bmo.system.AuthenticBmo;
import com.al.lte.portal.model.SessionStaff;

import net.sf.json.JSONArray;



public class CustTest extends BaseJunit {
	@Autowired
    private CustBmo custBmo;

	
	private SessionStaff setSessionStaff() throws Exception {
    	SessionStaff sessionStaff = new SessionStaff();
    	sessionStaff.setStaffId("5176843");
    	sessionStaff.setChannelId("1385688");
    	sessionStaff.setCurrentAreaId("8320400");
    	return sessionStaff;
	}
    @Test
    public void queryCustInfo() throws Exception {
    	Map paramMap = new HashMap();
    	Map ret = new HashMap();
    	String optFlowNum = "13324324";
    	String paramJson = "{\"prodClass\":\"\",\"actionFlag\":\"1\",\"acctNbr\":\"\",\"identityCd\":\"1\",\"identityNum\":\"350128198602231710\",\"partyName\":\"\",\"areaId\":\"8320400\",\"queryType\":\"\",\"queryTypeValue\":\"\",\"identidies_type\":\"居民身份证\",\"staffId\":\"5176843\",\"_test_appFlag\":\"app\",\"transactionId\":\"17081616172443803619751\"}";
    	ObjectMapper mapper = new ObjectMapper();
    	paramMap = mapper.readValue(paramJson, Map.class);
    	System.out.println("**************begin********");
    	ret = custBmo.queryCustInfo(paramMap, optFlowNum, setSessionStaff());
    	System.out.println("**************end********"+JSONArray.fromObject(ret).toString());
    }

    @Test
    public void queryCertType() throws Exception {
    	Map paramMap = new HashMap();
    	Map ret = new HashMap();
    	String optFlowNum = "13324324";
    	String paramJson = "{\"transactionId\":\"17081616172432480292757\",\"partyTypeCd\":2,\"areaId\":\"8320400\"}";
    	ObjectMapper mapper = new ObjectMapper();
    	paramMap = mapper.readValue(paramJson, Map.class);
    	System.out.println("**************begin********");
    	ret = custBmo.queryCertType(paramMap, optFlowNum, setSessionStaff());
    	System.out.println("**************end********"+JSONArray.fromObject(ret).toString());
    }   
    
    @Test
    public void queryAccNbrByCust() throws Exception {
    	Map paramMap = new HashMap();
    	Map ret = new HashMap();
    	String optFlowNum = "13324324";
    	String paramJson = "{\"transactionId\":\"17081616172554970595704\",\"custIds\":[\"700000652018\",\"700000652446\",\"130000653065\",\"130000653073\"],\"areaId\":\"8320400\"}";
    	ObjectMapper mapper = new ObjectMapper();
    	paramMap = mapper.readValue(paramJson, Map.class);
    	System.out.println("**************begin********");
    	ret = custBmo.queryAccNbrByCust(paramMap, optFlowNum, setSessionStaff());
    	System.out.println("**************end********"+JSONArray.fromObject(ret).toString());
    }       
}

