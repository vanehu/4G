package com.al.ec.serviceplatform.client;

import java.util.HashMap;
import java.util.Map;

import org.junit.Test;

import com.al.ecs.common.util.JsonUtil;

public class ServiceClientTest
{
    @Test
    public void testQueryAgentPortalConfig()
    {
        DataBus databus = new DataBus();
        
        databus.setOperater("18947035596");
        databus.setOperaterType("1");
        databus.setOperaterArea("0471");
        databus.setBusiFlowId("10042010040722013211241");
        databus.setPortalCode("1002");
        databus.setPassword("222222");
        databus.setRoleCode("MANAGER");
        databus.setServiceCode("com.linkage.portal.service.lte.core.resources.QueryAgentPortalConfig");
        databus.setOperatChannel("6003");
        databus.setOperatStaff("6003");
        //databus.setDebugCode("POR-0000");
        
        Map<String, Object> inParam = new HashMap<String, Object>();
    
        
		inParam.put("tableName", "SYSTEM");
//		inParam.put("StartAcceptTime", "20130401000000");
		//inParam.put("channelType", "1");
		inParam.put("columnName", "PHONE_NUMBER_FEATURE,PHONE_BRAND");

        
        
        databus.setParammap(inParam);
        
        long sta = System.currentTimeMillis();
        
        databus = ServiceCall.call(databus);
        Map map = databus.getReturnlmap();
        
        System.out.println(databus.getResultCode());
        System.out.println(databus.getResultMsg());
        System.out.println(databus.getReturnlmap());
        //System.out.println("-------------crp.getResult().getMap().get(result) = -----------"+map.get("result")+"; msg = "+map.get("msg")+"; code = "+map.get("code"));
    
        System.out.println(System.currentTimeMillis() - sta);
        //System.out.println(databus.getReturnlmap().get("blance"));
    }
    @Test
    public void testRunIntfLog()
    {
        DataBus databus = new DataBus();
        
        databus.setOperater("18947035596");
        databus.setOperaterType("1");
        databus.setOperaterArea("0471");
        databus.setBusiFlowId("100420100407220132112412");
        databus.setPortalCode("1002");
        databus.setPassword("222222");
        databus.setRoleCode("MANAGER");
        databus.setServiceCode("com.linkage.portal.service.lte.core.resources.RunIntfLog");
        databus.setOperatChannel("6003");
        databus.setOperatStaff("6003");
        //databus.setDebugCode("POR-0000");
        
        Map<String, Object> params = new HashMap<String, Object>();
    
        
        params.put("intfMethod", "1");
        params.put("intfUrl", "jt1001");
        params.put("inParam", "1");
        params.put("outParam", "01");
        
        
        
        databus.setParammap(params);
        
        long sta = System.currentTimeMillis();
        
        databus = ServiceCall.call(databus);
        Map map = databus.getReturnlmap();
        
        System.out.println(databus.getResultCode());
        System.out.println(databus.getResultMsg());
        System.out.println(JsonUtil.toString(databus));
        //System.out.println("-------------crp.getResult().getMap().get(result) = -----------"+map.get("result")+"; msg = "+map.get("msg")+"; code = "+map.get("code"));
    
        System.out.println(System.currentTimeMillis() - sta);
        //System.out.println(databus.getReturnlmap().get("blance"));
    }
    
    @Test
    public void testQueryAreaTreeByParentAreaId()
    {
        DataBus databus = new DataBus();
        
        databus.setOperater("18947035596");
        databus.setOperaterType("1");
        databus.setOperaterArea("0471");
        databus.setBusiFlowId("10042010040722013211241");
        databus.setPortalCode("1002");
        databus.setPassword("222222");
        databus.setRoleCode("MANAGER");
        databus.setServiceCode("com.linkage.portal.service.lte.core.system.QueryAreaTreeByParentAreaId");
        databus.setOperatChannel("6003");
        databus.setOperatStaff("6003");
        //databus.setDebugCode("POR-0000");
        
        Map<String, Object> inParam = new HashMap<String, Object>();
    
        
		inParam.put("parentAreaId", "");
		inParam.put("areaLevel", "2");

        
        
        databus.setParammap(inParam);
        
        long sta = System.currentTimeMillis();
        
        databus = ServiceCall.call(databus);
        Map map = databus.getReturnlmap();
        
        System.out.println(databus.getResultCode());
        System.out.println(databus.getResultMsg());
        System.out.println(databus.getReturnlmap());
        //System.out.println("-------------crp.getResult().getMap().get(result) = -----------"+map.get("result")+"; msg = "+map.get("msg")+"; code = "+map.get("code"));
    
        System.out.println(System.currentTimeMillis() - sta);
        //System.out.println(databus.getReturnlmap().get("blance"));
    }
    
    @Test
    public void testQueryAccNbrToRelease()
    {
        DataBus databus = new DataBus();
        
        databus.setOperater("18947035596");
        databus.setOperaterType("1");
        databus.setOperaterArea("0471");
        databus.setBusiFlowId("10042010040722013211241");
        databus.setPortalCode("1002");
        databus.setPassword("222222");
        databus.setRoleCode("MANAGER");
        databus.setServiceCode("com.linkage.portal.service.lte.core.resources.QueryAccNbrToRelease");
        databus.setOperatChannel("6003");
        databus.setOperatStaff("6003");
        //databus.setDebugCode("POR-0000");
        
        Map<String, Object> inParam = new HashMap<String, Object>();
    
        
		inParam.put("accNbrType", "1");
		inParam.put("beginDate", "2013-1-1");
		//inParam.put("endDate", "2013-10-29");
		inParam.put("pageSize", "10");
		inParam.put("pageIndex", "1");
		inParam.put("staffCode", "10008");
		inParam.put("areaId", "8320100");
        
        databus.setParammap(inParam);
        
        long sta = System.currentTimeMillis();
        
        databus = ServiceCall.call(databus);
        Map map = databus.getReturnlmap();
        
        System.out.println(databus.getResultCode());
        System.out.println(databus.getResultMsg());
        System.out.println(databus.getReturnlmap());
        //System.out.println("-------------crp.getResult().getMap().get(result) = -----------"+map.get("result")+"; msg = "+map.get("msg")+"; code = "+map.get("code"));
    
        System.out.println(System.currentTimeMillis() - sta);
        //System.out.println(databus.getReturnlmap().get("blance"));
    }
    
    @Test
    public void testModifyAccNbrToRelease()
    {
        DataBus databus = new DataBus();
        
        databus.setOperater("18947035596");
        databus.setOperaterType("1");
        databus.setOperaterArea("0471");
        databus.setBusiFlowId("10042010040722013211241");
        databus.setPortalCode("1002");
        databus.setPassword("222222");
        databus.setRoleCode("MANAGER");
        databus.setServiceCode("com.linkage.portal.service.lte.core.resources.ModifyAccNbrToRelease");
        databus.setOperatChannel("6003");
        databus.setOperatStaff("6003");
        //databus.setDebugCode("POR-0000");
        
        Map<String, Object> inParam = new HashMap<String, Object>();
		inParam.put("accNbrType", "1");
		inParam.put("accNbr", "18977890024");
		inParam.put("action", "ADD");
		inParam.put("channelId", "111");
		inParam.put("areaId", "11");
		inParam.put("provinceCode", "111");
		inParam.put("staffId", "111111");
        
//		inParam.put("accNbrType", "1");
//		inParam.put("accNbr", "18977890021");
//		inParam.put("action", "UPDATE");
        
        
        databus.setParammap(inParam);
        
        long sta = System.currentTimeMillis();
        
        databus = ServiceCall.call(databus);
        Map map = databus.getReturnlmap();
        
        System.out.println(databus.getResultCode());
        System.out.println(databus.getResultMsg());
        System.out.println(databus.getReturnlmap());
        //System.out.println("-------------crp.getResult().getMap().get(result) = -----------"+map.get("result")+"; msg = "+map.get("msg")+"; code = "+map.get("code"));
    
        System.out.println(System.currentTimeMillis() - sta);
        //System.out.println(databus.getReturnlmap().get("blance"));
    }
    @Test
    public void testGetSysParam()
    {
        DataBus databus = new DataBus();
        
        databus.setOperater("18947035596");
        databus.setOperaterType("1");
        databus.setOperaterArea("0471");
        databus.setBusiFlowId("10042010040722013211241");
        databus.setPortalCode("1002");
        databus.setPassword("222222");
        databus.setRoleCode("MANAGER");
        databus.setServiceCode("com.linkage.portal.service.lte.core.system.GetSysParam");
        databus.setOperatChannel("6003");
        databus.setOperatStaff("6003");
        //databus.setDebugCode("POR-0000");
        
        Map<String, Object> inParam = new HashMap<String, Object>();
    
        
		inParam.put("action", "REF");
		//inParam.put("groupId", "");

        
        
        databus.setParammap(inParam);
        
        long sta = System.currentTimeMillis();
        
        databus = ServiceCall.call(databus);
        Map map = databus.getReturnlmap();
        
        System.out.println(databus.getResultCode());
        System.out.println(databus.getResultMsg());
        System.out.println(databus.getReturnlmap());
        //System.out.println("-------------crp.getResult().getMap().get(result) = -----------"+map.get("result")+"; msg = "+map.get("msg")+"; code = "+map.get("code"));
    
        System.out.println(System.currentTimeMillis() - sta);
        //System.out.println(databus.getReturnlmap().get("blance"));
    }
    
    @Test
    public void testDoCash()
    {
        DataBus databus = new DataBus();
        
        databus.setOperater("18947035596");
        databus.setOperaterType("1");
        databus.setOperaterArea("0471");
        databus.setBusiFlowId("10042010040722013211241");
        databus.setPortalCode("1002");
        databus.setPassword("222222");
        databus.setRoleCode("MANAGER");
        databus.setServiceCode("com.linkage.portal.service.lte.core.charge.DoCash");
        databus.setOperatChannel("6003");
        databus.setOperatStaff("6003");
        //databus.setDebugCode("POR-0000");
        
        Map<String, Object> inParam = new HashMap<String, Object>();
    
        
		inParam.put("accNbrType", "1");
		inParam.put("unitTypeId", "1");
		inParam.put("destinationAttr", "1");
		inParam.put("phoneNumber", "18799009890");

        
        
        databus.setParammap(inParam);
        
        long sta = System.currentTimeMillis();
        
        databus = ServiceCall.call(databus);
        Map map = databus.getReturnlmap();
        
        System.out.println(databus.getResultCode());
        System.out.println(databus.getResultMsg());
        System.out.println(databus.getReturnlmap());
        //System.out.println("-------------crp.getResult().getMap().get(result) = -----------"+map.get("result")+"; msg = "+map.get("msg")+"; code = "+map.get("code"));
    
        System.out.println(System.currentTimeMillis() - sta);
        //System.out.println(databus.getReturnlmap().get("blance"));
    }
    @Test
    public void testGetBalance()
    {
        DataBus databus = new DataBus();
        
        databus.setOperater("18947035596");
        databus.setOperaterType("1");
        databus.setOperaterArea("0471");
        databus.setBusiFlowId("10042010040722013211241");
        databus.setPortalCode("1002");
        databus.setPassword("222222");
        databus.setRoleCode("MANAGER");
        databus.setServiceCode("com.linkage.portal.service.lte.core.charge.GetBalance");
        databus.setOperatChannel("6003");
        databus.setOperatStaff("6003");
        //databus.setDebugCode("POR-0000");
        
        Map<String, Object> inParam = new HashMap<String, Object>();
    
        
		inParam.put("accNbrType", "1");
		inParam.put("unitTypeId", "1");
		inParam.put("destinationAttr", "1");
		inParam.put("phoneNumber", "18799009890");

        
        
        databus.setParammap(inParam);
        
        long sta = System.currentTimeMillis();
        
        databus = ServiceCall.call(databus);
        Map map = databus.getReturnlmap();
        
        System.out.println(databus.getResultCode());
        System.out.println(databus.getResultMsg());
        System.out.println(databus.getReturnlmap());
        //System.out.println("-------------crp.getResult().getMap().get(result) = -----------"+map.get("result")+"; msg = "+map.get("msg")+"; code = "+map.get("code"));
    
        System.out.println(System.currentTimeMillis() - sta);
        //System.out.println(databus.getReturnlmap().get("blance"));
    }
    @Test
    public void testQueryCustomizeBill()
    {
        DataBus databus = new DataBus();
        
        databus.setOperater("18947035596");
        databus.setOperaterType("1");
        databus.setOperaterArea("0471");
        databus.setBusiFlowId("10042010040722013211241");
        databus.setPortalCode("1002");
        databus.setPassword("222222");
        databus.setRoleCode("MANAGER");
        databus.setServiceCode("com.linkage.portal.service.lte.core.charge.QueryCustomizeBill");
        databus.setOperatChannel("6003");
        databus.setOperatStaff("6003");
        //databus.setDebugCode("POR-0000");
        
        Map<String, Object> inParam = new HashMap<String, Object>();
    
        
		inParam.put("accNbrType", "1");
		inParam.put("unitTypeId", "1");
		inParam.put("destinationAttr", "1");
		inParam.put("phoneNumber", "18799009890");

        
        
        databus.setParammap(inParam);
        
        long sta = System.currentTimeMillis();
        
        databus = ServiceCall.call(databus);
        Map map = databus.getReturnlmap();
        
        System.out.println(databus.getResultCode());
        System.out.println(databus.getResultMsg());
        System.out.println(databus.getReturnlmap());
        //System.out.println("-------------crp.getResult().getMap().get(result) = -----------"+map.get("result")+"; msg = "+map.get("msg")+"; code = "+map.get("code"));
    
        System.out.println(System.currentTimeMillis() - sta);
        //System.out.println(databus.getReturnlmap().get("blance"));
    }    
    @Test
    public void testSendMsgInfo()
    {
        DataBus databus = new DataBus();
        
        databus.setOperater("18947035596");
        databus.setOperaterType("1");
        databus.setOperaterArea("0471");
        databus.setBusiFlowId("10042010040722013211241");
        databus.setPortalCode("1002");
        databus.setPassword("222222");
        databus.setRoleCode("MANAGER");
        databus.setServiceCode("com.linkage.portal.service.lte.core.system.SendMsgInfo");
        databus.setOperatChannel("6003");
        databus.setOperatStaff("6003");
        //databus.setDebugCode("POR-0000");
        
        Map<String, Object> inParam = new HashMap<String, Object>();
    
        
		inParam.put("accNbrType", "1");
		inParam.put("unitTypeId", "1");
		inParam.put("destinationAttr", "1");
		inParam.put("phoneNumber", "18799009890");

        
        
        databus.setParammap(inParam);
        
        long sta = System.currentTimeMillis();
        
        databus = ServiceCall.call(databus);
        Map map = databus.getReturnlmap();
        
        System.out.println(databus.getResultCode());
        System.out.println(databus.getResultMsg());
        System.out.println(databus.getReturnlmap());
        //System.out.println("-------------crp.getResult().getMap().get(result) = -----------"+map.get("result")+"; msg = "+map.get("msg")+"; code = "+map.get("code"));
    
        System.out.println(System.currentTimeMillis() - sta);
        //System.out.println(databus.getReturnlmap().get("blance"));
    }
    @Test
    public void testQueryOfferUsage()
    {
        DataBus databus = new DataBus();
        
        databus.setOperater("18947035596");
        databus.setOperaterType("1");
        databus.setOperaterArea("0471");
        databus.setBusiFlowId("10042010040722013211241");
        databus.setPortalCode("1002");
        databus.setPassword("222222");
        databus.setRoleCode("MANAGER");
        databus.setServiceCode("com.linkage.portal.service.lte.core.charge.QueryOfferUsage");
        databus.setOperatChannel("6003");
        databus.setOperatStaff("6003");
        //databus.setDebugCode("POR-0000");
        
        Map<String, Object> inParam = new HashMap<String, Object>();
    
        
		inParam.put("accNbrType", "1");
		inParam.put("unitTypeId", "1");
		inParam.put("billingCycle", "1");
		inParam.put("phoneNumber", "18799009890");

        
        
        databus.setParammap(inParam);
        
        long sta = System.currentTimeMillis();
        
        databus = ServiceCall.call(databus);
        Map map = databus.getReturnlmap();
        
        System.out.println(databus.getResultCode());
        System.out.println(databus.getResultMsg());
        System.out.println(databus.getReturnlmap());
        //System.out.println("-------------crp.getResult().getMap().get(result) = -----------"+map.get("result")+"; msg = "+map.get("msg")+"; code = "+map.get("code"));
    
        System.out.println(System.currentTimeMillis() - sta);
        //System.out.println(databus.getReturnlmap().get("blance"));
    }
    @Test
    public void testGetUimCardInfo()
    {
        DataBus databus = new DataBus();
        
        databus.setOperater("18947035596");
        databus.setOperaterType("1");
        databus.setOperaterArea("0471");
        databus.setBusiFlowId("10042010040722013211241");
        databus.setPortalCode("1002");
        databus.setPassword("222222");
        databus.setRoleCode("MANAGER");
        databus.setServiceCode("com.linkage.portal.service.lte.core.resources.GetUimCardInfo");
        databus.setOperatChannel("6003");
        databus.setOperatStaff("6003");
        //databus.setDebugCode("POR-0000");
        
        Map<String, Object> inParam = new HashMap<String, Object>();
    
        
		inParam.put("accNbrType", "1");
		inParam.put("unitTypeId", "1");
		inParam.put("billingCycle", "1");
		inParam.put("phoneNumber", "18799009890");

        
        
        databus.setParammap(inParam);
        
        long sta = System.currentTimeMillis();
        
        databus = ServiceCall.call(databus);
        Map map = databus.getReturnlmap();
        
        System.out.println(databus.getResultCode());
        System.out.println(databus.getResultMsg());
        System.out.println(databus.getReturnlmap());
        //System.out.println("-------------crp.getResult().getMap().get(result) = -----------"+map.get("result")+"; msg = "+map.get("msg")+"; code = "+map.get("code"));
    
        System.out.println(System.currentTimeMillis() - sta);
        //System.out.println(databus.getReturnlmap().get("blance"));
    }
    @Test
    public void testQueryCustomizeBillDetail()
    {
        DataBus databus = new DataBus();
        
        databus.setOperater("18947035596");
        databus.setOperaterType("1");
        databus.setOperaterArea("0471");
        databus.setBusiFlowId("10042010040722013211241");
        databus.setPortalCode("1002");
        databus.setPassword("222222");
        databus.setRoleCode("MANAGER");
        databus.setServiceCode("com.linkage.portal.service.lte.core.charge.QueryCustomizeBillDetail");
        databus.setOperatChannel("6003");
        databus.setOperatStaff("6003");
        //databus.setDebugCode("POR-0000");
        
        Map<String, Object> inParam = new HashMap<String, Object>();
        inParam.put("areaId", "1");
        inParam.put("ownerId", "1");
		inParam.put("accNbrType", "1");
		inParam.put("billingCycle", "1");
		inParam.put("billTypeCd", "4");
		inParam.put("phoneNumber", "18799009890");

        
        
        databus.setParammap(inParam);
        
        long sta = System.currentTimeMillis();
        
        databus = ServiceCall.call(databus);
        Map map = databus.getReturnlmap();
        
        System.out.println(databus.getResultCode());
        System.out.println(databus.getResultMsg());
        System.out.println(databus.getReturnlmap());
        //System.out.println("-------------crp.getResult().getMap().get(result) = -----------"+map.get("result")+"; msg = "+map.get("msg")+"; code = "+map.get("code"));
    
        System.out.println(System.currentTimeMillis() - sta);
        //System.out.println(databus.getReturnlmap().get("blance"));
    }    
    @Test
    public void testQueryInvoiceTemplate()
    {
        DataBus databus = new DataBus();
        
        databus.setOperater("18947035596");
        databus.setOperaterType("1");
        databus.setOperaterArea("0471");
        databus.setBusiFlowId("10042010040722013211241");
        databus.setPortalCode("1002");
        databus.setPassword("222222");
        databus.setRoleCode("MANAGER");
        databus.setServiceCode("com.linkage.portal.service.lte.core.resources.QueryInvoiceTemplate");
        databus.setOperatChannel("6003");
        databus.setOperatStaff("6003");
        //databus.setDebugCode("POR-0000");
        
        Map<String, Object> inParam = new HashMap<String, Object>();
        inParam.put("areaId", "");

        
        
        databus.setParammap(inParam);
        
        long sta = System.currentTimeMillis();
        
        databus = ServiceCall.call(databus);
        Map map = databus.getReturnlmap();
        
        System.out.println(databus.getResultCode());
        System.out.println(databus.getResultMsg());
        System.out.println(databus.getReturnlmap());
        //System.out.println("-------------crp.getResult().getMap().get(result) = -----------"+map.get("result")+"; msg = "+map.get("msg")+"; code = "+map.get("code"));
    
        System.out.println(System.currentTimeMillis() - sta);
        //System.out.println(databus.getReturnlmap().get("blance"));
    }    
    @Test
    public void testGetOweCharge()
    {
        DataBus databus = new DataBus();
        
        databus.setOperater("18947035596");
        databus.setOperaterType("1");
        databus.setOperaterArea("0471");
        databus.setBusiFlowId("10042010040722013211241");
        databus.setPortalCode("1002");
        databus.setPassword("222222");
        databus.setRoleCode("MANAGER");
        databus.setServiceCode("com.linkage.portal.service.lte.core.charge.GetOweCharge");
        databus.setOperatChannel("6003");
        databus.setOperatStaff("6003");
        //databus.setDebugCode("POR-0000");
        
        Map<String, Object> inParam = new HashMap<String, Object>();
        inParam.put("areaId", "8430100");

        
        
        databus.setParammap(inParam);
        
        long sta = System.currentTimeMillis();
        
        databus = ServiceCall.call(databus);
        Map map = databus.getReturnlmap();
        
        System.out.println(databus.getResultCode());
        System.out.println(databus.getResultMsg());
        System.out.println(databus.getReturnlmap());
        //System.out.println("-------------crp.getResult().getMap().get(result) = -----------"+map.get("result")+"; msg = "+map.get("msg")+"; code = "+map.get("code"));
    
        System.out.println(System.currentTimeMillis() - sta);
        //System.out.println(databus.getReturnlmap().get("blance"));
    }     
    @Test
    public void testPayBalance()
    {
        DataBus databus = new DataBus();
        
        databus.setOperater("18947035596");
        databus.setOperaterType("1");
        databus.setOperaterArea("0471");
        databus.setBusiFlowId("10042010040722013211241");
        databus.setPortalCode("1002");
        databus.setPassword("222222");
        databus.setRoleCode("MANAGER");
        databus.setServiceCode("com.linkage.portal.service.lte.core.charge.PayBalance");
        databus.setOperatChannel("6003");
        databus.setOperatStaff("6003");
        //databus.setDebugCode("POR-0000");
        
        Map<String, Object> inParam = new HashMap<String, Object>();
		inParam.put("destinationAttr", "1");
		inParam.put("areaCode", "010");
		inParam.put("billTypeCd", "4");
		inParam.put("phoneNumber", "18650082331");
		inParam.put("billingCycle", "1");
		inParam.put("ownerId", "12345");
        
        
        databus.setParammap(inParam);
        
        long sta = System.currentTimeMillis();
        
        databus = ServiceCall.call(databus);
        Map map = databus.getReturnlmap();
        
        System.out.println(databus.getResultCode());
        System.out.println(databus.getResultMsg());
        System.out.println(databus.getReturnlmap());
        //System.out.println("-------------crp.getResult().getMap().get(result) = -----------"+map.get("result")+"; msg = "+map.get("msg")+"; code = "+map.get("code"));
    
        System.out.println(System.currentTimeMillis() - sta);
        //System.out.println(databus.getReturnlmap().get("blance"));
    } 
    @Test
    public void testReverseWriteOffCash()
    {
        DataBus databus = new DataBus();
        
        databus.setOperater("18947035596");
        databus.setOperaterType("1");
        databus.setOperaterArea("0471");
        databus.setBusiFlowId("10042010040722013211241");
        databus.setPortalCode("1002");
        databus.setPassword("222222");
        databus.setRoleCode("MANAGER");
        databus.setServiceCode("com.linkage.portal.service.lte.core.charge.ReverseWriteOffCash");
        databus.setOperatChannel("6003");
        databus.setOperatStaff("6003");
        //databus.setDebugCode("POR-0000");
        
        Map<String, Object> inParam = new HashMap<String, Object>();
		inParam.put("phoneNumber", "1");
		inParam.put("serialType", "1");
		inParam.put("serialNbr", "1");
		inParam.put("areaId", "1");
		inParam.put("areaCode", "1");
		inParam.put("ownerId", "1");
		inParam.put("staffId", "1");
        
        
        databus.setParammap(inParam);
        
        long sta = System.currentTimeMillis();
        
        databus = ServiceCall.call(databus);
        Map map = databus.getReturnlmap();
        
        System.out.println(databus.getResultCode());
        System.out.println(databus.getResultMsg());
        System.out.println(databus.getReturnlmap());
        //System.out.println("-------------crp.getResult().getMap().get(result) = -----------"+map.get("result")+"; msg = "+map.get("msg")+"; code = "+map.get("code"));
    
        System.out.println(System.currentTimeMillis() - sta);
        //System.out.println(databus.getReturnlmap().get("blance"));
    }     
}
