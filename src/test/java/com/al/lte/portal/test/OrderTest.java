package com.al.lte.portal.test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.codehaus.jackson.map.ObjectMapper;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;

import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.crm.SecondBusiness;
import com.al.lte.portal.model.SessionStaff;

import net.sf.json.JSONArray;



public class OrderTest extends BaseJunit {
	@Autowired
    private OrderBmo orderBmo;
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
    public void queryChannel() throws Exception {
    	Map paramMap = new HashMap();
    	Map ret = new HashMap();
    	String optFlowNum = "13324324";
    	System.out.println("**************begin********");
    	ret = orderBmo.queryChannel(paramMap, optFlowNum, setSessionStaff());
    	System.out.println("**************end********"+JSONArray.fromObject(ret).toString());
    }
    @Test
    public void orderSubmit() throws Exception {
    	Map paramMap = new HashMap();
    	Map ret = new HashMap();
    	String optFlowNum = "13324324";
    	String paramJson = "{\"orderList\":{\"orderListInfo\":{\"isTemplateOrder\":\"N\",\"templateType\":1,\"staffId\":5176843,\"channelId\":1385688,\"areaId\":\"8320400\",\"partyId\":\"700000652018\",\"olTypeCd\":15,\"actionFlag\":1,\"extSystem\":\"1000000244\",\"custOrderType\":1,\"handleCustId\":\"700000652018\",\"custOrderAttrs\":[{\"itemSpecId\":\"810000000\",\"value\":\"\"},{\"itemSpecId\":\"800000048\",\"value\":\"120000046779\"}],\"soNbr\":\"1502872202316724\"},\"custOrderList\":[{\"busiOrder\":[{\"areaId\":\"8320400\",\"busiOrderInfo\":{\"seq\":-1},\"busiObj\":{\"instId\":-1,\"accessNumber\":\"17768374854\"},\"boActionType\":{\"actionClassCd\":1100,\"boActionTypeCd\":\"A1\"},\"data\":{\"boAccountInfos\":[{\"partyId\":\"700000652018\",\"acctName\":\"杨海明\",\"acctCd\":-1,\"acctId\":-1,\"businessPassword\":\"111111\",\"state\":\"ADD\",\"acctTypeCd\":\"1\"}],\"boPaymentAccounts\":[{\"paymentAcctTypeCd\":100000,\"bankId\":\"\",\"bankAcct\":\"\",\"paymentMan\":\"\",\"limitQty\":\"1\",\"state\":\"ADD\"}],\"boAcct2PaymentAccts\":[{\"priority\":\"1\",\"state\":\"ADD\"}],\"boAccountItems\":[],\"boAccountMailings\":[]}},{\"areaId\":\"8320400\",\"busiOrderInfo\":{\"seq\":-2},\"busiObj\":{\"objId\":86327,\"instId\":-1,\"isComp\":\"N\",\"offerTypeCd\":\"1\",\"accessNumber\":\"17768374854\"},\"boActionType\":{\"actionClassCd\":1200,\"boActionTypeCd\":\"S1\"},\"data\":{\"ooRoles\":[{\"objId\":235010000,\"objInstId\":-1,\"objType\":2,\"memberRoleCd\":1,\"offerRoleId\":42958,\"state\":\"ADD\"}],\"ooOwners\":[{\"partyId\":\"700000652018\",\"state\":\"ADD\"}],\"busiOrderAttrs\":[{\"itemSpecId\":\"111111116\",\"role\":40020005,\"value\":5176843,\"channelNbr\":3204002049012},{\"itemSpecId\":\"111111120\",\"role\":40020005,\"value\":\"钱丹墙\"}]}},{\"areaId\":\"8320400\",\"busiOrderInfo\":{\"seq\":-3},\"busiObj\":{\"objId\":235010000,\"instId\":-1,\"isComp\":\"N\",\"accessNumber\":\"17768374854\"},\"boActionType\":{\"actionClassCd\":1300,\"boActionTypeCd\":\"1\"},\"data\":{\"boProdFeeTypes\":[{\"feeType\":\"1200\",\"state\":\"ADD\"}],\"boProdSpecs\":[{\"prodSpecId\":235010000,\"state\":\"ADD\"}],\"boCusts\":[{\"partyId\":\"700000652018\",\"partyProductRelaRoleCd\":\"0\",\"state\":\"ADD\"}],\"boProdItems\":[{\"itemSpecId\":\"40010030\",\"prodSpecItemId\":-1,\"state\":\"ADD\",\"value\":\"20\"}],\"boProdPasswords\":[{\"prodPwTypeCd\":2,\"pwd\":\"975325\",\"state\":\"ADD\"}],\"boProdAns\":[{\"prodId\":-1,\"accessNumber\":\"17768374854\",\"anChooseTypeCd\":\"2\",\"anId\":\"5157375\",\"pnLevelId\":\"132\",\"anTypeCd\":\"4\",\"state\":\"ADD\",\"areaId\":\"8320400\",\"areaCode\":\"0519\",\"memberRoleCd\":400,\"preStore\":\"0\",\"minCharge\":\"0\"}],\"bo2Coupons\":[{\"couponUsageTypeCd\":\"3\",\"inOutTypeId\":\"1\",\"inOutReasonId\":0,\"saleId\":1,\"couponId\":\"500033\",\"couponinfoStatusCd\":\"A\",\"chargeItemCd\":\"3000\",\"couponNum\":\"1\",\"storeId\":\"8320400\",\"storeName\":\"1\",\"agentId\":1,\"apCharge\":0,\"couponInstanceNumber\":\"8986031574519001272\",\"terminalCode\":\"8986031574519001272\",\"ruleId\":\"\",\"partyId\":\"700000652018\",\"prodId\":-1,\"offerId\":\"-1\",\"state\":\"ADD\",\"relaSeq\":\"\",\"cardTypeFlag\":\"1\"}],\"boAccountRelas\":[{\"acctId\":-1,\"acctCd\":-1,\"acctRelaTypeCd\":\"1\",\"chargeItemCd\":\"0\",\"percent\":\"100\",\"priority\":\"1\",\"state\":\"ADD\"}],\"boProdStatuses\":[{\"state\":\"ADD\",\"prodStatusCd\":100000}],\"busiOrderAttrs\":[{\"itemSpecId\":\"111111116\",\"role\":40020005,\"value\":5176843,\"channelNbr\":3204002049012},{\"itemSpecId\":\"111111120\",\"role\":40020005,\"value\":\"钱丹墙\"}],\"boCertiAccNbrRels\":[{\"certType\":\"1\",\"certNum\":\"350128********1710\",\"custName\":\"杨海明\",\"certAddress\":\"福建省平潭县苏澳镇梧峰村梧井北厝67号\",\"certNumEnc\":\"cTnrZupS5lU5aAdCxq0FKIjzLMwZcKBQbXzRfMTos4I=\",\"custNameEnc\":\"wShR6JJGVLUD0/tAfwj9Hw==\",\"certAddressEnc\":\"kdNd7f2DxtwjFu1stVG0O33LjH/EN5ohyrzlKtYSEdTerb8UKPR6in6v4YmYU8JIQ5RTTwf+gfeQW2zZCL0Avg==\",\"partyId\":\"700000652018\",\"serviceType\":\"1000\",\"state\":\"ADD\",\"accNbr\":\"17768374854\"}]}},{\"areaId\":\"8320400\",\"busiOrderInfo\":{\"seq\":-4},\"busiObj\":{\"objId\":235010000,\"instId\":-1,\"accessNumber\":\"17768374854\"},\"boActionType\":{\"actionClassCd\":1300,\"boActionTypeCd\":\"7\"},\"data\":{\"boServOrders\":[{\"servId\":-1,\"servSpecId\":235010008,\"servSpecName\":\"2G（1X）上网\"}],\"boServs\":[{\"servId\":-1,\"state\":\"ADD\"}]}},{\"areaId\":\"8320400\",\"busiOrderInfo\":{\"seq\":-5},\"busiObj\":{\"objId\":235010000,\"instId\":-1,\"accessNumber\":\"17768374854\"},\"boActionType\":{\"actionClassCd\":1300,\"boActionTypeCd\":\"7\"},\"data\":{\"boServOrders\":[{\"servId\":-2,\"servSpecId\":280000004,\"servSpecName\":\"国内漫游电话\"}],\"boServs\":[{\"servId\":-2,\"state\":\"ADD\"}]}},{\"areaId\":\"8320400\",\"busiOrderInfo\":{\"seq\":-6},\"busiObj\":{\"objId\":235010000,\"instId\":-1,\"accessNumber\":\"17768374854\"},\"boActionType\":{\"actionClassCd\":1300,\"boActionTypeCd\":\"7\"},\"data\":{\"boServOrders\":[{\"servId\":-3,\"servSpecId\":280000011,\"servSpecName\":\"无条件转移\"}],\"boServs\":[{\"servId\":-3,\"state\":\"ADD\"}]}},{\"areaId\":\"8320400\",\"busiOrderInfo\":{\"seq\":-7},\"busiObj\":{\"objId\":235010000,\"instId\":-1,\"accessNumber\":\"17768374854\"},\"boActionType\":{\"actionClassCd\":1300,\"boActionTypeCd\":\"7\"},\"data\":{\"boServOrders\":[{\"servId\":-4,\"servSpecId\":235010004,\"servSpecName\":\"翼支付\"}],\"boServs\":[{\"servId\":-4,\"state\":\"ADD\"}]}},{\"areaId\":\"8320400\",\"busiOrderInfo\":{\"seq\":-8},\"busiObj\":{\"objId\":235010000,\"instId\":-1,\"accessNumber\":\"17768374854\"},\"boActionType\":{\"actionClassCd\":1300,\"boActionTypeCd\":\"7\"},\"data\":{\"boServOrders\":[{\"servId\":-5,\"servSpecId\":235010006,\"servSpecName\":\"点对点短信(手机)\"}],\"boServs\":[{\"servId\":-5,\"state\":\"ADD\"}]}},{\"areaId\":\"8320400\",\"busiOrderInfo\":{\"seq\":-9},\"busiObj\":{\"objId\":235010000,\"instId\":-1,\"accessNumber\":\"17768374854\"},\"boActionType\":{\"actionClassCd\":1300,\"boActionTypeCd\":\"7\"},\"data\":{\"boServOrders\":[{\"servId\":-6,\"servSpecId\":280000014,\"servSpecName\":\"呼叫等待\"}],\"boServs\":[{\"servId\":-6,\"state\":\"ADD\"}]}},{\"areaId\":\"8320400\",\"busiOrderInfo\":{\"seq\":-10},\"busiObj\":{\"objId\":235010000,\"instId\":-1,\"accessNumber\":\"17768374854\"},\"boActionType\":{\"actionClassCd\":1300,\"boActionTypeCd\":\"7\"},\"data\":{\"boServOrders\":[{\"servId\":-7,\"servSpecId\":235010001,\"servSpecName\":\"来电显示\"}],\"boServs\":[{\"servId\":-7,\"state\":\"ADD\"}]}},{\"areaId\":\"8320400\",\"busiOrderInfo\":{\"seq\":-11},\"busiObj\":{\"objId\":235010000,\"instId\":-1,\"accessNumber\":\"17768374854\"},\"boActionType\":{\"actionClassCd\":1300,\"boActionTypeCd\":\"7\"},\"data\":{\"boServOrders\":[{\"servId\":-8,\"servSpecId\":280000003,\"servSpecName\":\"国内长途电话\"}],\"boServs\":[{\"servId\":-8,\"state\":\"ADD\"}]}},{\"areaId\":\"8320400\",\"busiOrderInfo\":{\"seq\":-12},\"busiObj\":{\"objId\":235010000,\"instId\":-1,\"accessNumber\":\"17768374854\"},\"boActionType\":{\"actionClassCd\":1300,\"boActionTypeCd\":\"7\"},\"data\":{\"boServOrders\":[{\"servId\":-9,\"servSpecId\":381000960,\"servSpecName\":\"翼支付交费助手\"}],\"boServs\":[{\"servId\":-9,\"state\":\"ADD\"}],\"boServItems\":[{\"itemSpecId\":10020034,\"servId\":-9,\"value\":\"3\",\"state\":\"ADD\"},{\"itemSpecId\":10020035,\"servId\":-9,\"value\":\"5000\",\"state\":\"ADD\"},{\"itemSpecId\":10020036,\"servId\":-9,\"value\":\"2\",\"state\":\"ADD\"}]}},{\"areaId\":\"8320400\",\"busiOrderInfo\":{\"seq\":-13},\"busiObj\":{\"objId\":235010000,\"instId\":-1,\"accessNumber\":\"17768374854\"},\"boActionType\":{\"actionClassCd\":1300,\"boActionTypeCd\":\"7\"},\"data\":{\"boServOrders\":[{\"servId\":-10,\"servSpecId\":280000010,\"servSpecName\":\"不可及转移\"}],\"boServs\":[{\"servId\":-10,\"state\":\"ADD\"}]}},{\"areaId\":\"8320400\",\"busiOrderInfo\":{\"seq\":-14},\"busiObj\":{\"objId\":235010000,\"instId\":-1,\"accessNumber\":\"17768374854\"},\"boActionType\":{\"actionClassCd\":1300,\"boActionTypeCd\":\"7\"},\"data\":{\"boServOrders\":[{\"servId\":-11,\"servSpecId\":235010003,\"servSpecName\":\"3G（EVDO）上网\"}],\"boServs\":[{\"servId\":-11,\"state\":\"ADD\"}]}},{\"areaId\":\"8320400\",\"busiOrderInfo\":{\"seq\":-15},\"busiObj\":{\"objId\":235010000,\"instId\":-1,\"accessNumber\":\"17768374854\"},\"boActionType\":{\"actionClassCd\":1300,\"boActionTypeCd\":\"7\"},\"data\":{\"boServOrders\":[{\"servId\":-12,\"servSpecId\":235010106,\"servSpecName\":\"189免费邮箱\"}],\"boServs\":[{\"servId\":-12,\"state\":\"ADD\"}]}},{\"areaId\":\"8320400\",\"busiOrderInfo\":{\"seq\":-16},\"busiObj\":{\"objId\":235010000,\"instId\":-1,\"accessNumber\":\"17768374854\"},\"boActionType\":{\"actionClassCd\":1300,\"boActionTypeCd\":\"7\"},\"data\":{\"boServOrders\":[{\"servId\":-13,\"servSpecId\":280000009,\"servSpecName\":\"遇忙转移\"}],\"boServs\":[{\"servId\":-13,\"state\":\"ADD\"}]}},{\"areaId\":\"8320400\",\"busiOrderInfo\":{\"seq\":-17},\"busiObj\":{\"objId\":235010000,\"instId\":-1,\"accessNumber\":\"17768374854\"},\"boActionType\":{\"actionClassCd\":1300,\"boActionTypeCd\":\"7\"},\"data\":{\"boServOrders\":[{\"servId\":-14,\"servSpecId\":280000008,\"servSpecName\":\"无应答转移\"}],\"boServs\":[{\"servId\":-14,\"state\":\"ADD\"}]}},{\"areaId\":\"8320400\",\"busiOrderInfo\":{\"seq\":-18},\"busiObj\":{\"objId\":235010000,\"instId\":-1,\"accessNumber\":\"17768374854\"},\"boActionType\":{\"actionClassCd\":1300,\"boActionTypeCd\":\"7\"},\"data\":{\"boServOrders\":[{\"servId\":-15,\"servSpecId\":280000020,\"servSpecName\":\"4G（LTE）上网\"}],\"boServs\":[{\"servId\":-15,\"state\":\"ADD\"}],\"boServItems\":[{\"itemSpecId\":10010003,\"servId\":-15,\"value\":\"1500\",\"state\":\"ADD\"},{\"itemSpecId\":10020003,\"servId\":-15,\"value\":\"1300\",\"state\":\"ADD\"},{\"itemSpecId\":10010004,\"servId\":-15,\"value\":\"1700\",\"state\":\"ADD\"}]}}]}]},\"transactionId\":\"17081616442706164022954\",\"areaId\":\"8320400\"}";
    	ObjectMapper mapper = new ObjectMapper();
    	paramMap = mapper.readValue(paramJson, Map.class);
    	System.out.println("**************begin********");
    	ret = orderBmo.orderSubmit(paramMap, optFlowNum, setSessionStaff());
    	System.out.println("**************end********"+JSONArray.fromObject(ret).toString());
    }
    
    @Test
    public void querySecondBusinessMenuAuth() throws Exception {
    	Map paramMap = new HashMap();
    	Map ret = new HashMap();
    	String optFlowNum = "13324324";
    	String paramJson = "{\"transactionId\":\"17081616220501209526685\",\"menuId\":\"30\",\"isSimple\":\"Y\",\"areaId\":\"8320400\"}";
    	ObjectMapper mapper = new ObjectMapper();
    	paramMap = mapper.readValue(paramJson, Map.class);
    	System.out.println("**************begin********");
    	ret = secondBusiness.querySecondBusinessMenuAuth(paramMap, optFlowNum, setSessionStaff());
    	System.out.println("**************end********"+JSONArray.fromObject(ret).toString());
    }    
}
