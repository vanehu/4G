package com.ailk.ecsp.sm.servlet;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ailk.ecsp.core.DataSourceRouter;
import com.ailk.ecsp.core.processor.Engine;
import com.ailk.ecsp.mybatis.model.ServiceRunLog;
import com.ailk.ecsp.task.RunLog;
import com.ailk.ecsp.util.IConstant;
import com.ailk.ecsp.util.Toolkit;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.DateUtil;
import com.al.ecs.common.util.JsonUtil;
import com.linkage.portal.service.lte.core.system.InsertLoginSession;


/**
 * 
 */
public class CheckStaffServlet extends Engine {
	
	protected static Logger logger = LoggerFactory.getLogger(CheckStaffServlet.class);
	private static final long serialVersionUID = 1L;
	
	public CheckStaffServlet() {
		super();
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		doPost(request,response);
		
	}
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		long start = System.currentTimeMillis();
		BufferedReader reader = null;
		String line;
        StringBuffer json = new StringBuffer();
		try {
			reader = request.getReader();
			while((line = reader.readLine()) != null) {
			    json.append(line);
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
		String xmlStr = json.toString();
		String TransactionID=xmlStr.substring(xmlStr.indexOf("<TransactionID>")+"<TransactionID>".length(), xmlStr.lastIndexOf("</TransactionID>"));
		String token=xmlStr.substring(xmlStr.indexOf("<TOKEN>")+"<TOKEN>".length(), xmlStr.lastIndexOf("</TOKEN>"));
		String SrcOrgID=xmlStr.substring(xmlStr.indexOf("<SrcOrgID>")+"<SrcOrgID>".length(), xmlStr.lastIndexOf("</SrcOrgID>"));
		String areaId=provIdToProvAreaId(SrcOrgID);
//		String token=request.getParameter("token");
		Map<String,Object> map=new HashMap<String,Object>();
		Calendar calendar = Calendar.getInstance();
		StringBuffer xml=new StringBuffer();
		xml.append("<ContractRoot>");
		xml.append("<TcpCont>");
		xml.append("<TransactionID>"+TransactionID+"</TransactionID>");
		xml.append("<ActionCode>1</ActionCode>");
		xml.append("<RspTime>"+DateUtil.getFormatTimeString(calendar.getTime(), "yyyyMMddHHmmss")+"</RspTime>");
		xml.append("<Response>");
		xml.append("<RspType>0</RspType>");
		xml.append("<RspCode>0000</RspCode>");
		xml.append("<RspDesc>成功</RspDesc>");
		xml.append("</Response>");
		xml.append("</TcpCont>");
		xml.append("<SvcCont>");
		xml.append("<SOO type=\"CHECK_LOGIN_INFO_RES_TYPE\">");
		ServiceRunLog sr = new ServiceRunLog(); 
		DataMap dataMap = new DataMap();
		String serviceSerial = Toolkit.getServiceSerialNumber();
		sr = createServiceRunLog(dataMap, serviceSerial);
		if(StringUtils.isNotBlank(token)){
			Map<String, Object> inParam =new HashMap<String, Object>();
			inParam.put("provinceAreaId", areaId);
			dataMap.setInParam(inParam);
			sr.setDbKeyWord(setDbKeyWord(dataMap));
			
			
//			Object val=MySessionInterceptor.checkToken(token);
//			Map dataBusMap = new HashMap();
			inParam.put("FLAG", "select");
			inParam.put("TOKEN", token);
			dataMap.setInParam(inParam);
//			DataBus db =ServiceClient.callService(dataBusMap, PortalServiceCode.INSERT_LOGINSESSION, null, sessionStaff);
			InsertLoginSession insertLoginSession=new InsertLoginSession();
			try {
				dataMap=insertLoginSession.exec(dataMap, "");
			} catch (Exception e) {
				e.printStackTrace();
			}
			if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(dataMap.getResultCode()))) {
				Map<String, Object> retMap=dataMap.getOutParam();
				if(!retMap.isEmpty()){
					Map<String, Object> returnMap=new HashMap<String, Object>();
					if(retMap.get("rList") instanceof List){
						if(((List<Map<String, Object>>)retMap.get("rList")).size()>0){
							returnMap=((List<Map<String, Object>>)retMap.get("rList")).get(0);
						}
					}
					if(!returnMap.isEmpty()){
						xml.append("<PUB_RES>");
						xml.append("<SOO_ID>1</SOO_ID>");
						xml.append("<RspType>0</RspType>");
						xml.append("<RspCode>0000</RspCode>");
						xml.append("<RspDesc>成功</RspDesc>");
						xml.append("</PUB_RES>");
						xml.append("<STAFF_LOGIN_INFO>");
						xml.append("<SYSTEM_USER_CODE>"+MapUtils.getString(returnMap, "STAFFCODE", "")+"</SYSTEM_USER_CODE>");
						xml.append("<SALES_CODE></SALES_CODE>");
						xml.append("<STAFF_NAME>"+MapUtils.getString(returnMap, "STAFFNAME", "")+"</STAFF_NAME>");
						xml.append("<COMMON_REGION_ID>"+MapUtils.getString(returnMap, "AREANAME", "")+"</COMMON_REGION_ID>");
						xml.append("<AREAID>"+MapUtils.getString(returnMap, "AREAID", "")+"</AREAID>");
						xml.append("<AREACODE>"+MapUtils.getString(returnMap, "AREACODE", "")+"</AREACODE>");
						xml.append("<CITYNAME>"+MapUtils.getString(returnMap, "CITYNAME", "")+"</CITYNAME>");
						xml.append("<PROVINCENAME>"+MapUtils.getString(returnMap, "PROVINCENAME", "")+"</PROVINCENAME>");
						xml.append("</STAFF_LOGIN_INFO>");
						
						map.put("resultCode", "0");
						map.put("resultMsg", "验证成功");
						Map<String,String> resultmap=new HashMap<String ,String>();
						resultmap.put("staffCode",MapUtils.getString(returnMap, "STAFFCODE", ""));
						resultmap.put("staffName",MapUtils.getString(returnMap, "STAFFNAME", ""));
						resultmap.put("areaId", MapUtils.getString(returnMap, "AREAID", ""));
						resultmap.put("areaCode", MapUtils.getString(returnMap, "AREACODE", ""));
						resultmap.put("areaName", MapUtils.getString(returnMap, "AREANAME", ""));
						resultmap.put("cityName", MapUtils.getString(returnMap, "CITYNAME", ""));
						resultmap.put("provinceName", MapUtils.getString(returnMap, "PROVINCENAME", ""));
						map.put("result", resultmap);
					}else{
						xml.append("<PUB_RES>");
						xml.append("<SOO_ID>1</SOO_ID>");
						xml.append("<RspType>1</RspType>");
						xml.append("<RspCode>1089</RspCode>");
						xml.append("<RspDesc>验证失败！没有检查到给定的token</RspDesc>");
						xml.append("</PUB_RES>");
						
						map.put("resultCode", "-1");
						map.put("resultMsg", "验证失败！没有检查到给定的token");
						map.put("errorCode", "1101");
					}
				}else{
					xml.append("<PUB_RES>");
					xml.append("<SOO_ID>1</SOO_ID>");
					xml.append("<RspType>1</RspType>");
					xml.append("<RspCode>1089</RspCode>");
					xml.append("<RspDesc>验证失败！没有检查到给定的token</RspDesc>");
					xml.append("</PUB_RES>");
					
					map.put("resultCode", "-1");
					map.put("resultMsg", "验证失败！没有检查到给定的token");
					map.put("errorCode", "1101");
				}
			}else{
				xml.append("<PUB_RES>");
				xml.append("<SOO_ID>1</SOO_ID>");
				xml.append("<RspType>1</RspType>");
				xml.append("<RspCode>1089</RspCode>");
				xml.append("<RspDesc>"+dataMap.getResultMsg()+"</RspDesc>");
				xml.append("</PUB_RES>");
				
				map.put("resultCode", "-1");
				map.put("resultMsg", dataMap.getResultMsg());
				map.put("errorCode", "1101");
			}
		}else{
			xml.append("<PUB_RES>");
			xml.append("<SOO_ID>1</SOO_ID>");
			xml.append("<RspType>1</RspType>");
			xml.append("<RspCode>1089</RspCode>");
			xml.append("<RspDesc>验证失败！参数token为空！</RspDesc>");
			xml.append("</PUB_RES>");
			
			map.put("resultCode", "-1");
			map.put("resultMsg", "验证失败！参数token为空！");
			map.put("errorCode", "1101");
		}
		xml.append("</SOO>");
		xml.append("</SvcCont>");
		xml.append("</ContractRoot>");
		response.setCharacterEncoding("UTF-8");
		response.getWriter().write(xml.toString());
		response.getWriter().flush();
		sr.setResultCode(dataMap.getResultCode());
		sr.setRemoteAddr(request.getRemoteAddr());
		sr.setRemotePort(String.valueOf(request.getRemotePort()));
		sr.setLocalAddr(request.getLocalAddr());
		sr.setLocalPort(String.valueOf(request.getLocalPort()));
		sr.setUseTime(System.currentTimeMillis() - start);
		sr.setEndTime(new Date());
//		sr = createServiceRunLogAfter(dataMap,sr);
		sr.setInParam(xmlStr);
		sr.setOutParam(xml.toString());
		sr.setServiceCode("com.linkage.portal.service.lte.core.system.InsertLoginSession");
		if (sr.getServiceCode()!=null) {
			RunLog.getInstance().addRunlog(sr);
		}
	}
    
    private ServiceRunLog createServiceRunLog(DataMap db,String serviceSerial){
		ServiceRunLog sr = new ServiceRunLog();
		sr.setServiceCode(db.getServiceCode());
		sr.setPortalCode(db.getPortalCode());
		sr.setRoleCode(db.getRoleCode());
		sr.setBusiRunNbr(db.getBusiFlowId());
		//20140610 若是前台传入日志服务器表的主键logId，则serv_run_nbr字段写入logId
		sr.setServRunNbr(serviceSerial);
		sr.setStartTime(new Date());
		sr.setStaffId(db.getStaffId());
		sr.setStaffName(db.getStaffName());
		sr.setChannelId(db.getChannelId());
		sr.setChannelName(db.getChannelName());
		if (StringUtils.isBlank(sr.getIntfMethod())){
			sr.setInParam(JsonUtil.toString(db.getInParam()));
		}else{
			sr.setInParam(JsonUtil.toString(db.getInParam().get("inParam")));
		}
		return sr;
	}
    private ServiceRunLog createServiceRunLogAfter(DataMap dm ,ServiceRunLog sr){
		if(StringUtils.isNotBlank(sr.getIntfUrl())){
			sr.setInParam(JsonUtil.toString(dm.getInParam("inParam")));
		}
		if(dm.getOutParam()==null){
			sr.setOutParam(dm.getResultMsg());
		}else{
			sr.setOutParam(JsonUtil.toString(dm.getOutParam()));
		}
		if(MapUtils.getString(dm, "remark")!=null){
			sr.setRemark(MapUtils.getString(dm, "remark"));
		}
		if (dm.containsKey("logId")) {
			sr.setServRunNbr(MapUtils.getString(dm, "logId"));
		}
		if(MapUtils.getObject(dm, "beginDate")!=null&& MapUtils.getObject(dm, "beginDate") instanceof Date){
			if(MapUtils.getObject(dm, "endDate")!=null&& MapUtils.getObject(dm, "endDate") instanceof Date){
				Date beginDate = (Date)MapUtils.getObject(dm, "beginDate");
				Date endDate = (Date)MapUtils.getObject(dm, "endDate");
				if (beginDate!=null){
					sr.setStartTime(beginDate);		
					if (endDate!=null){
						sr.setEndTime(endDate);	
						long useTime = endDate.getTime()-beginDate.getTime();
						if (useTime>1000000000){
							useTime = 1000000000;
						}
						sr.setUseTime(useTime);
					}
				}
			}
		}
		if(MapUtils.getObject(dm, "inIntParam")!=null){
			sr.setInIntParam(JsonUtil.toString(dm.get("inIntParam")));
			sr.setOutIntParam(JsonUtil.toString(dm.get("outIntParam")));
		}
		return sr;
	}
    private String setDbKeyWord(DataMap dm){
		String dbKeyWord = "";
		if (dm != null){
			if(dm.getInParam(IConstant.CON_DB_KEY_WORD)!=null){
				dbKeyWord = (String)dm.getInParam(IConstant.CON_DB_KEY_WORD);
				DataSourceRouter.setRouteFactor(dbKeyWord);
			}
		}
		return dbKeyWord;
    }
    
    
    /**
	 * 根据省份编码获取省份地区编码
	 * @param provId
	 * @return
	 */
	public static String provIdToProvAreaId(String provId){
		int id=Integer.parseInt(provId);
		String areaId="0";
		switch (id) {
		case 600101:
			areaId="8440000";
			break;
		case 600102:
			areaId="8310000";
			break;
		case 600103:
			areaId="8320000";
			break;
		case 600104:
			areaId="8330000";
			break;
		case 600105:
			areaId="8350000";
			break;
		case 600201:
			areaId="8510000";
			break;
		case 600202:
			areaId="8420000";
			break;
		case 600203:
			areaId="8430000";
			break;
		case 600204:
			areaId="8610000";
			break;
		case 600205:
			areaId="8530000";
			break;
		case 600301:
			areaId="8340000";
			break;
		case 600302:
			areaId="8450000";
			break;
		case 600303:
			areaId="8650000";
			break;
		case 600304:
			areaId="8500000";
			break;
		case 600305:
			areaId="8360000";
			break;
		case 600401:
			areaId="8620000";
			break;
		case 600402:
			areaId="8520000";
			break;
		case 600403:
			areaId="8460000";
			break;
		case 600404:
			areaId="8640000";
			break;
		case 600405:
			areaId="8630000";
			break;
		case 600406:
			areaId="8540000";
			break;
		case 609001:
			areaId="8110000";
			break;
		case 609801:
			areaId="100000016";
			break;
		case 609902:
			areaId="8120000";
			break;
		case 609903:
			areaId="8370000";
			break;
		case 609904:
			areaId="8410000";
			break;
		case 609905:
			areaId="8210000";
			break;
		case 609906:
			areaId="8130000";
			break;
		case 609907:
			areaId="8140000";
			break;
		case 609908:
			areaId="8150000";
			break;
		case 609909:
			areaId="8220000";
			break;
		case 609910:
			areaId="8230000";
			break;

		default:
			areaId="0";
			break;
		}
		return areaId;
	} 
}
