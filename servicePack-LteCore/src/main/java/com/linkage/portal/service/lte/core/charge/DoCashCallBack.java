package com.linkage.portal.service.lte.core.charge;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ailk.ecsp.core.DataSourceRouter;
import com.ailk.ecsp.service.Service;
import com.ailk.ecsp.util.MapUtil;
import com.ailk.ecsp.util.SoapUtil;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.exception.ResultConstant;
import com.linkage.portal.service.lte.LteConstants;
import com.linkage.portal.service.lte.dao.CommonDAO;
import com.linkage.portal.service.lte.dao.CommonDAOImpl;
import com.linkage.util.DateUtil;

/**
 * 现金充值回调
 */
public class DoCashCallBack extends Service {
	private final Logger log = LoggerFactory.getLogger(this.getClass());

	@Override
	public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {  
		try{
			String inXml = (String) dataMap.getInParam("inParam");
			this.log.debug("inXml : {}",inXml);
			Map inMap = SoapUtil.xmlToMap(inXml);
			Map tcpContMap = (Map)MapUtils.getMap(inMap, "TcpCont");
			dataMap = OrderCompleteCall(dataMap,serviceSerial);
		}catch(Exception e){
			e.printStackTrace();
		}
	    return dataMap;
    }
    
    @SuppressWarnings("unchecked")
	public DataMap OrderCompleteCall(DataMap dm,String serviceSerial)throws Exception{
    	String inXml = (String) dm.getInParam("inParam");
    	Map inMap = SoapUtil.xmlToMap(inXml);    	
    	Map tcpContMap = (Map)MapUtil.path(inMap, "TcpCont");
    	Map logMap = new HashMap();
    	String reqSerial = (String)MapUtil.path(inMap, "SvcCont/RechargeBalanceCallBackReq/Req_Serial");
    	String orderStatus = (String)MapUtil.path(inMap, "SvcCont/RechargeBalanceCallBackReq/Order_Status");
    	String dbKeyWord = (String)MapUtil.path(inMap, "SvcCont/RechargeBalanceCallBackReq/Mvno_Id");
        logMap.put("PAY_SERIAL_NBR", reqSerial);
        
        Calendar calendar = Calendar.getInstance();
		java.util.Date now = calendar.getTime();
		SimpleDateFormat dbFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
		String callBackTime = dbFormat.format(now);
		logMap.put("CALLBACK_DATE", callBackTime);
        
    	if("SUCCESS".equals(orderStatus)){
	        logMap.put("PAY_STATUS", LteConstants.CON_PAY_STATUS_SUCESS);
    	}else{
	        logMap.put("PAY_STATUS", LteConstants.CON_PAY_STATUS_CALL_BACK_FAIL);
    	}
    	DataSourceRouter.setRouteFactor(dbKeyWord);
    	CommonDAO commonDAO = new CommonDAOImpl();
        commonDAO.updateCashChargeLog(logMap,dbKeyWord);
    	String tranId = MapUtil.asStr(tcpContMap, "TransactionID");
    	String rspType = "0";
    	String rspCode = "0000";
    	String rspDesc = "成功";
    	String resultXml = resultXML(tranId, rspType ,rspCode, rspDesc);
    	Map returnMap = new HashMap();
    	returnMap.put("outParam", resultXml);
    	dm.setOutParam(returnMap);
    	dm.setResultCode(ResultConstant.R_POR_SUCCESS.getCode());
    	dm.setRoleCode(dbKeyWord);
    	return dm;
    }

    public String resultXML(String tranId,String rspType,String rspCode,String rspDes){
    	StringBuffer xml = new StringBuffer();
    	xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
    	xml.append("<ContractRoot>");
    	xml.append("<TcpCont>");
    	xml.append("<ActionCode>1</ActionCode>");    	
    	xml.append("<TransactionID>").append(tranId).append("</TransactionID>");
    	xml.append("<RspTime>").append(DateUtil.getNowDefault()).append("</RspTime>");
    	xml.append("<Response>");
    	xml.append("<RspType>").append(rspType).append("</RspType>");
    	xml.append("<RspCode>").append(rspCode).append("</RspCode>");
    	xml.append("<RspDesc>").append(rspDes).append("</RspDesc>");
    	xml.append("</Response>");
    	xml.append("</TcpCont>");
    	xml.append("</ContractRoot>");
    	return xml.toString();
    }
}
