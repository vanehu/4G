package com.linkage.portal.service;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import org.apache.commons.lang.StringUtils;
import org.apache.ibatis.session.SqlSessionFactory;
import org.junit.Before;
import org.junit.Test;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.AbstractJUnit4SpringContextTests;

import com.ailk.ecsp.core.DataRepository;
import com.ailk.ecsp.core.PlatformBoot;
import com.ailk.ecsp.core.manager.SystemManager;
import com.ailk.ecsp.core.manager.SystemManagerImpl;
import com.ailk.ecsp.jdbc.ConnectHolder;
import com.ailk.ecsp.util.SpringContextUtil;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.common.util.JsonUtil;
import com.linkage.portal.service.lte.core.charge.DoCash;
import com.linkage.portal.service.lte.core.charge.GetBalance;
import com.linkage.portal.service.lte.core.charge.GetOweCharge;
import com.linkage.portal.service.lte.core.charge.PayBalance;
import com.linkage.portal.service.lte.core.charge.PrintCustomizeBill;
import com.linkage.portal.service.lte.core.charge.QueryCustomizeBill;
import com.linkage.portal.service.lte.core.charge.QueryCustomizeBillDetail;
import com.linkage.portal.service.lte.core.charge.QueryOfferUsage;
import com.linkage.portal.service.lte.core.charge.QueryPayment;
import com.linkage.portal.service.lte.core.charge.QueryWriteOffCashDetail;
import com.linkage.portal.service.lte.core.charge.ReverseWriteOffCash;
import com.linkage.portal.service.lte.core.charge.WriteOffCash;
import com.linkage.portal.service.lte.core.resources.GetAuthCode;
import com.linkage.portal.service.lte.core.resources.GetCardDllInfo;
import com.linkage.portal.service.lte.core.resources.GetUimCardInfo;
import com.linkage.portal.service.lte.core.resources.ModifyAccNbrToRelease;
import com.linkage.portal.service.lte.core.resources.QueryAccNbrToRelease;
import com.linkage.portal.service.lte.core.resources.QueryAgentPortalConfig;
import com.linkage.portal.service.lte.core.resources.QueryInvoiceTemplate;
import com.linkage.portal.service.lte.core.resources.SubmitUimCardInfo;
import com.linkage.portal.service.lte.core.system.GetSysParam;
import com.linkage.portal.service.lte.core.system.QueryAreaTreeByParentAreaId;
import com.linkage.portal.service.lte.core.system.SendMsgInfo;

/**
 * 代理产门户服务层单元测试集
 */
@ContextConfiguration(locations = { "/com/linkage/portal/service/applicationContext-test.xml" })
//@ContextConfiguration(locations = { "/com/linkage/portal/service/app-context.xml" })

public class AppTest1 extends AbstractJUnit4SpringContextTests {
	private final Logger log = LoggerFactory.getLogger(this.getClass());
	
	@Autowired 
    ApplicationContext context; 

    @Before
    public void setup() {
        /**初始化数据源--解决服务层核心模块访问数据库问题*/
//        ConnectHolder.setDataSource((DataSource)this.context.getBean("serviceDataSource"));
//        ConnectHolder.setJdbc((JdbcTemplate)this.context.getBean("jdbcTemplate"));
        //ConnectHolder.setProtalDataSource((DataSource)this.context.getBean("portalDataSource"));
        //ConnectHolder.setProtaljdbc((JdbcTemplate)this.context.getBean("portalJdbcTemplate"));
		PlatformBoot pb = new PlatformBoot(
				SpringContextUtil.getApplicationContext());
		try {
			pb.start();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		//pb.reloadAllSystemParam();
        /*
        allSysParam.put("2:GetUimCardInfo", "{\"BusCode\":\"BUS60001\",\"ServiceCode\":\"SVC25001\",\"ServiceContractVer\":\"SVC2500120131101\",\"SrcSysID\":\"1000000200\",\"DstSysID\":\"1000000216\"}");

        //{"BusCode":"BUS60001","ServiceCode":"SVC25001","ServiceContractVer":"SVC2500120131101","SrcSysID":"1000000200","DstSysID":"1000000216"}
        allSysParam.put("2:url.csbWS", "http://10.1.5.95:9080/CRM-DEP/services/DEPService?wsdl");
        DataRepository.getInstence().setAllSysParam(allSysParam);
        */
    }

	@Test
	public void testApp() {
		long h = Calendar.getInstance().get(Calendar.HOUR_OF_DAY) * 60 * 60 * 1000;
		long m = Calendar.getInstance().get(Calendar.MINUTE) * 60 * 1000;
		long s = Calendar.getInstance().get(Calendar.SECOND) * 1000;
		long ms = Calendar.getInstance().get(Calendar.MILLISECOND);

		String mi = StringUtils.leftPad(String.valueOf(h+m+s+ms),8,'0');
		System.out.println(mi);
		System.out.println(h);
		System.out.println(m);
		System.out.println(s);
		System.out.println(ms);
		System.out.println(m + s + ms);
		System.out.println(h + m + s+ ms);
	}


	@Test
	public void test_QueryAgentPortalConfig() {
		Map<String, Object> inParam = new HashMap<String, Object>();
        
		inParam.put("tableName", "SYSTEM");
//		inParam.put("StartAcceptTime", "20130401000000");
		inParam.put("channelType", "1");
		inParam.put("columnName", "PHONE_NUMBER_FEATURE");

		DataMap db = new DataMap();
		db.setAreaCode("0000");
		db.setChannelId("100000099");
		db.setStaffId("903004325711");
		db.setProvinceCode("600103");
		db.setInParam(inParam);
		QueryAgentPortalConfig d = new QueryAgentPortalConfig();
		try {
			d.exec(db, null);
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println(JsonUtil.toString(db.getOutParam()));
	}	
	@Test
	public void test_QueryAreaTreeByParentAreaId() {
		Map<String, Object> inParam = new HashMap<String, Object>();
        
		inParam.put("upRegionId", "8340000");
		inParam.put("areaLevel", "3");


		DataMap db = new DataMap();
		db.setAreaCode("0000");
		db.setChannelId("100000099");
		db.setStaffId("903004325711");
		db.setProvinceCode("600103");
		db.setInParam(inParam);
		QueryAreaTreeByParentAreaId d = new QueryAreaTreeByParentAreaId();
		try {
			d.exec(db, null);
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println(JsonUtil.toString(db.getOutParam()));
	}	
	@Test
	public void test_QueryAccNbrToRelease() {
		Map<String, Object> inParam = new HashMap<String, Object>();
		inParam.put("accNbrType", "2");
		//inParam.put("accNbr", "18900009875");
		//inParam.put("beginDate", "2013-1-1");
		//inParam.put("endDate", "2013-10-30");
		
		DataMap db = new DataMap();
		db.setAreaCode("0000");
		db.setChannelId("100000099");
		db.setStaffId("903004325711");
		db.setProvinceCode("600103");
		db.setInParam(inParam);
		QueryAccNbrToRelease d = new QueryAccNbrToRelease();
		try {
			d.exec(db, null);
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println(JsonUtil.toString(db));
	}
	
	@Test
	public void test_ModifyAccNbrToRelease() {
		Map map =new HashMap();
		Map<String, Object> inParam = new HashMap<String, Object>();
		Map<String, Object> inParam2 = new HashMap<String, Object>();
		List lt = new ArrayList();
//		inParam.put("accNbrType", "1");
//		inParam.put("accNbr", "18977890023");
//		inParam.put("action", "ADD");
//		inParam.put("channelId", "111");
//		inParam.put("areaId", "11");
//		inParam.put("provinceCode", "111");
//		inParam.put("staffId", "111111");
		inParam.put("accNbrType", "1");
		inParam.put("accNbr", "18977890023");
		inParam.put("action", "UPDATE");
		
		inParam2.put("accNbrType", "1");
		inParam2.put("accNbr", "18977890022");
		inParam2.put("action", "UPDATE");
		
		lt.add(inParam);
		lt.add(inParam2);
		map.put("param", lt);
		map.put("batchFlag", "0");
//		inParam.put("accNbrType", "1");
//		inParam.put("accNbr", "18977890021");
//		inParam.put("action", "UPDATE");
		/*
		inParam.put("accNbrType", "2");
		inParam.put("accNbr", "8986031180371181541");
		inParam.put("action", "UPDATE");
		*/
		
		DataMap db = new DataMap();
		db.setAreaCode("0000");
		db.setChannelId("100000099");
		db.setStaffId("903004325711");
		db.setProvinceCode("600103");
		db.setInParam(map);
		ModifyAccNbrToRelease d = new ModifyAccNbrToRelease();
		try {
			d.exec(db, null);
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println(JsonUtil.toString(db));
	}
	@Test
	public void test_GetSysParam() {
		Map<String, Object> inParam = new HashMap<String, Object>();
//		inParam.put("accNbrType", "1");
//		inParam.put("accNbr", "18977890021");
//		inParam.put("action", "ADD");
		
		inParam.put("accNbrType", "1");
		inParam.put("accNbr", "18977890021");
		inParam.put("action", "REF");
		
		DataMap db = new DataMap();
		db.setAreaCode("0000");
		db.setChannelId("100000099");
		db.setStaffId("903004325711");
		db.setProvinceCode("600103");
		db.setInParam(inParam);
		GetSysParam d = new GetSysParam();
		try {
			d.exec(db, null);
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println(JsonUtil.toString(db));
	}
	@Test
	public void test_SendMsgInfo() {
		Map<String, Object> inParam = new HashMap<String, Object>();
//		inParam.put("accNbrType", "1");
//		inParam.put("accNbr", "18977890021");
//		inParam.put("action", "ADD");
		
		//inParam.put("accNbrType", "1");
		inParam.put("phoneNumber", "18650082331");
		inParam.put("message", "尊敬的员工，您登录系统的验证码是12345");
		inParam.put("key", "12345");
		DataMap db = new DataMap();
		db.setAreaCode("0000");
		db.setChannelId("100000099");
		db.setStaffId("903004325711");
		db.setProvinceCode("600103");
		db.setInParam(inParam);
		SendMsgInfo d = new SendMsgInfo();
		try {
			d.exec(db, null);
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println(JsonUtil.toString(db));
	}
	@Test
	public void test_GetAuthCode() {
		Map<String, Object> inParam = new HashMap<String, Object>();
//		inParam.put("accNbrType", "1");
//		inParam.put("accNbr", "18977890021");
//		inParam.put("action", "ADD");
		
		//inParam.put("accNbrType", "1");
		inParam.put("factoryCode", "42");
		inParam.put("dllPassword", "738189139e0b66e1738189139e0b66e1");
		inParam.put("randomNum", "11234");
		inParam.put("authCodeType", "11");
		
		
		DataMap db = new DataMap();
		db.setAreaCode("0000");
		db.setChannelId("100000099");
		db.setStaffId("903004325711");
		db.setProvinceCode("600103");
		db.setInParam(inParam);
		GetAuthCode d = new GetAuthCode();
		try {
			d.exec(db, null);
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println(JsonUtil.toString(db));
	}
	@Test
	public void test_GetCardDllInfo() {
		Map<String, Object> inParam = new HashMap<String, Object>();
//		inParam.put("accNbrType", "1");
//		inParam.put("accNbr", "18977890021");
//		inParam.put("action", "ADD");
		
		inParam.put("factoryCode", "42");
		inParam.put("dllPassword", "11");
		inParam.put("randomNum", "11234");
		inParam.put("authCodeType", "11");
		
		DataMap db = new DataMap();
		db.setAreaCode("0000");
		db.setChannelId("100000099");
		db.setStaffId("903004325711");
		db.setProvinceCode("600103");
		db.setInParam(inParam);
		GetCardDllInfo d = new GetCardDllInfo();
		try {
			d.exec(db, null);
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println(JsonUtil.toString(db));
	}
	
	@Test
	public void test_QueryCustomizeBill() {
		Map<String, Object> inParam = new HashMap<String, Object>();
//		inParam.put("accNbrType", "1");
//		inParam.put("accNbr", "18977890021");
//		inParam.put("action", "ADD");
		
		//inParam.put("accNbrType", "1");
		inParam.put("phoneNumber", "13312341234");
		inParam.put("ownerId", "1000");
		inParam.put("billingCycle", "201312");
		inParam.put("queryFlag", "0");
		
		DataMap db = new DataMap();
		db.setAreaCode("0000");
		db.setChannelId("100000099");
		db.setStaffId("903004325711");
		db.setProvinceCode("600103");
		db.setInParam(inParam);
		QueryCustomizeBill d = new QueryCustomizeBill();
		try {
			d.exec(db, null);
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println(JsonUtil.toString(db));
	}
	
	@Test
	public void test_GetBalance() {
		Map<String, Object> inParam = new HashMap<String, Object>();
//		inParam.put("accNbrType", "1");
//		inParam.put("accNbr", "18977890021");
//		inParam.put("action", "ADD");
		
		//inParam.put("accNbrType", "1");
		inParam.put("phoneNumber", "13312341234");
		inParam.put("phoneNumberType", "1");
		inParam.put("areaCode", "014");
		inParam.put("destinationAttr", "2");
		inParam.put("ownerId", "1000");
		DataMap db = new DataMap();
		db.setAreaCode("0000");
		db.setChannelId("100000099");
		db.setStaffId("903004325711");
		db.setProvinceCode("600103");
		db.setInParam(inParam);
		GetBalance d = new GetBalance();
		try {
			d.exec(db, null);
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println(JsonUtil.toString(db));
	}
	
	@Test
	public void test_DoCash() {
		Map<String, Object> inParam = new HashMap<String, Object>();
//		inParam.put("accNbrType", "1");
//		inParam.put("accNbr", "18977890021");
//		inParam.put("action", "ADD");
		
		//inParam.put("accNbrType", "1");
		inParam.put("phoneNumber", "13312341234");
		inParam.put("unitTypeId", "1");
		inParam.put("areaId", "12345");
		inParam.put("areaCode", "12345");
		inParam.put("feeAmount", "1");
		inParam.put("destinationAttr", "12345");
		inParam.put("ownerId", "1000");
		DataMap db = new DataMap();
		db.setAreaCode("0000");
		db.setChannelId("100000099");
		db.setStaffId("903004325711");
		db.setProvinceCode("600103");
		db.setInParam(inParam);
		DoCash d = new DoCash();
		try {
			d.exec(db, null);
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println(JsonUtil.toString(db));
	}
	@Test
	public void test_QueryPayment() {
		Map<String, Object> inParam = new HashMap<String, Object>();
//		inParam.put("accNbrType", "1");
//		inParam.put("accNbr", "18977890021");
//		inParam.put("action", "ADD");
		
		//inParam.put("accNbrType", "1");
		inParam.put("phoneNumber", "13312341234");
		inParam.put("phoneNumberType", "1");
		inParam.put("billingCycle", "201310");
		inParam.put("ownerId", "1000");
		
		DataMap db = new DataMap();
		db.setAreaCode("0000");
		db.setChannelId("100000099");
		db.setStaffId("903004325711");
		db.setProvinceCode("600103");
		db.setInParam(inParam);
		QueryPayment d = new QueryPayment();
		try {
			d.exec(db, null);
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println(JsonUtil.toString(db));
	}
	@Test
	public void test_QueryOfferUsage() {
		Map<String, Object> inParam = new HashMap<String, Object>();
//		inParam.put("accNbrType", "1");
//		inParam.put("accNbr", "18977890021");
//		inParam.put("action", "ADD");
		
		//inParam.put("accNbrType", "1");
		inParam.put("phoneNumber", "13002100019");
		inParam.put("billingCycle", "201310");
		inParam.put("ownerId", "65");
		
		DataMap db = new DataMap();
		db.setAreaCode("0000");
		db.setChannelId("100000099");
		db.setStaffId("903004325711");
		db.setProvinceCode("600103");
		db.setInParam(inParam);
		QueryOfferUsage d = new QueryOfferUsage();
		try {
			d.exec(db, null);
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println(JsonUtil.toString(db));
	}
	@Test
	public void test_GetUimCardInfo() {
		Map<String, Object> inParam = new HashMap<String, Object>();
//		inParam.put("accNbrType", "1");
//		inParam.put("accNbr", "18977890021");
//		inParam.put("action", "ADD");
		
		inParam.put("areaCode", "0531");
		inParam.put("phoneNumber", "13335194291");
		inParam.put("cardNo", "00009");
		inParam.put("factoryCode", "59");
		
		DataMap db = new DataMap();
		db.setAreaCode("0000");
		db.setChannelId("100000099");
		db.setStaffId("903004325711");
		db.setProvinceCode("600103");
		db.setInParam(inParam);
		GetUimCardInfo d = new GetUimCardInfo();
		try {
			d.exec(db, null);
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println(JsonUtil.toString(db));
	}
	@Test
	public void test_SubmitUimCardInfo() {
		Map<String, Object> inParam = new HashMap<String, Object>();
//		inParam.put("accNbrType", "1");
//		inParam.put("accNbr", "18977890021");
//		inParam.put("action", "ADD");
		
		//inParam.put("accNbrType", "1");
		inParam.put("phoneNumber", "13335194291");
		inParam.put("iccserial", "0912000009001703530Y");
		inParam.put("resultCode", "00000000");
		//inParam.put("resultCode", "00000002");
		inParam.put("resultMessage", "成功");
		
		inParam.put("imsi", "460030905319936");//460036531190987
		inParam.put("iccid", "89860313305310000647");
		
		DataMap db = new DataMap();
		db.setAreaCode("0000");
		db.setChannelId("100000099");
		db.setStaffId("903004325711");
		db.setProvinceCode("600103");
		db.setInParam(inParam);
		SubmitUimCardInfo d = new SubmitUimCardInfo();
		try {
			d.exec(db, null);
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println(JsonUtil.toString(db));
	}
	@Test
	public void test_QueryCustomizeBillDetail() {
		Map<String, Object> inParam = new HashMap<String, Object>();
		inParam.put("billTypeCd", "2");
		inParam.put("billingCycle", "201310");
		inParam.put("phoneNumber", "18922353301");
		inParam.put("ownerId", "65");
		
		DataMap db = new DataMap();
		db.setAreaCode("0000");
		db.setChannelId("100000099");
		db.setStaffId("903004325711");
		db.setProvinceCode("600103");
		db.setInParam(inParam);
		QueryCustomizeBillDetail d = new QueryCustomizeBillDetail();
		try {
			d.exec(db, null);
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println(JsonUtil.toString(db));
	}
	@Test
	public void test_PayBalance() {
		Map<String, Object> inParam = new HashMap<String, Object>();
		inParam.put("destinationAttr", "1");
		inParam.put("areaCode", "010");
		inParam.put("billTypeCd", "4");
		inParam.put("phoneNumber", "13312341237");
		inParam.put("balanceAmount", "1");
		inParam.put("ownerId", "1000");
		inParam.put("staffId", "1");
		
		DataMap db = new DataMap();
		db.setAreaCode("0000");
		db.setChannelId("100000099");
		db.setStaffId("903004325711");
		db.setProvinceCode("600103");
		db.setInParam(inParam);
		PayBalance d = new PayBalance();
		try {
			d.exec(db, null);
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println(JsonUtil.toString(db));
	}
	@Test
	public void test_QueryInvoiceTemplate() {
		Map<String, Object> inParam = new HashMap<String, Object>();
		inParam.put("areaId", "8320100");
		
		DataMap db = new DataMap();
		db.setAreaCode("0000");
		db.setChannelId("100000099");
		db.setStaffId("903004325711");
		db.setProvinceCode("600103");
		db.setInParam(inParam);
		QueryInvoiceTemplate d = new QueryInvoiceTemplate();
		try {
			d.exec(db, null);
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println(JsonUtil.toString(db));
	}
	@Test
	public void test_GetOweCharge() {
		Map<String, Object> inParam = new HashMap<String, Object>();
		inParam.put("phoneNumber", "13312341234");
		inParam.put("ownerId", "1000");
		inParam.put("destinationAttr", "1");
		
		DataMap db = new DataMap();
		db.setAreaCode("0000");
		db.setChannelId("100000099");
		db.setStaffId("903004325711");
		db.setProvinceCode("600103");
		db.setInParam(inParam);
		GetOweCharge d = new GetOweCharge();
		try {
			d.exec(db, null);
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println(JsonUtil.toString(db));
	}
	@Test
	public void test_WriteOffCash() {
		Map<String, Object> inParam = new HashMap<String, Object>();
		inParam.put("phoneNumber", "13312341234");
		inParam.put("paymentAmount", "3");
		inParam.put("paymentMethod", "11");
		inParam.put("billingCycleId", "201311");
		inParam.put("invoiceOffer", "0");
		inParam.put("staffId", "1");
		inParam.put("ownerId", "1000");
		
		DataMap db = new DataMap();
		db.setAreaCode("0000");
		db.setChannelId("100000099");
		db.setStaffId("903004325711");
		db.setProvinceCode("600103");
		db.setInParam(inParam);
		WriteOffCash d = new WriteOffCash();
		try {
			d.exec(db, null);
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println(JsonUtil.toString(db));
	}
	@Test
	public void test_QueryWriteOffCashDetail() {
		Map<String, Object> inParam = new HashMap<String, Object>();
		inParam.put("phoneNumber", "13312341234");
		inParam.put("areaId", "1");
		inParam.put("billingCycleId", "201401");
		inParam.put("invoiceOffer", "1");
		inParam.put("areaCode", "014");
		inParam.put("ownerId", "1000");
		
		DataMap db = new DataMap();
		db.setAreaCode("0000");
		db.setChannelId("100000099");
		db.setStaffId("903004325711");
		db.setProvinceCode("600103");
		db.setInParam(inParam);
		QueryWriteOffCashDetail d = new QueryWriteOffCashDetail();
		try {
			d.exec(db, null);
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println(JsonUtil.toString(db));
	}
	@Test
	public void test_ReverseWriteOffCash() {
		Map<String, Object> inParam = new HashMap<String, Object>();
		inParam.put("phoneNumber", "13312341234");
		inParam.put("serialType", "1");
		inParam.put("serialNbr", "691");
		inParam.put("areaId", "1");
		inParam.put("areaCode", "014");
		inParam.put("ownerId", "1000");
		inParam.put("staffId", "1");
		
		
		DataMap db = new DataMap();
		db.setAreaCode("0000");
		db.setChannelId("100000099");
		db.setStaffId("903004325711");
		db.setProvinceCode("600103");
		db.setInParam(inParam);
		ReverseWriteOffCash d = new ReverseWriteOffCash();
		try {
			d.exec(db, null);
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println(JsonUtil.toString(db));
	}
	@Test
	public void test_PrintCustomizeBill() {
		Map<String, Object> inParam = new HashMap<String, Object>();
//		inParam.put("accNbrType", "1");
//		inParam.put("accNbr", "18977890021");
//		inParam.put("action", "ADD");
		
		//inParam.put("accNbrType", "1");
		inParam.put("phoneNumber", "13312341234");
		inParam.put("ownerId", "1000");
		inParam.put("queryFlag", "1");
		inParam.put("billingCycle", "201311");
		
		DataMap db = new DataMap();
		db.setAreaCode("0000");
		db.setChannelId("100000099");
		db.setStaffId("903004325711");
		db.setProvinceCode("600103");
		db.setInParam(inParam);
		PrintCustomizeBill d = new PrintCustomizeBill();
		try {
			d.exec(db, null);
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println(JsonUtil.toString(db));
	}	
}
