package com.al.lte.portal.common;

import java.io.IOException;
import java.io.StringReader;
import java.io.UnsupportedEncodingException;
import java.net.InetAddress;
import java.net.SocketTimeoutException;
import java.net.URLEncoder;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Random;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.time.DateFormatUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.math.NumberUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.util.EntityUtils;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.Node;
import org.dom4j.io.SAXReader;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.xml.sax.InputSource;

import com.al.crm.asynframe.integration.IAsynClient;
import com.al.crm.log.sender.ILogSender;
import com.al.ec.serviceplatform.client.CsbDataMap;
import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ec.serviceplatform.client.httpclient.MyHttpclient;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.MDA;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.util.UIDGenerator;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.common.web.SpringContextUtil;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.InterfaceException.ErrType;
import com.al.ecs.log.Log;
import com.al.lte.portal.bmo.log.LogContainer;
import com.al.lte.portal.core.DataRepository;
import com.al.lte.portal.model.ServiceLog;
import com.al.lte.portal.model.SessionStaff;

import net.sf.json.xml.XMLSerializer;



/**
 * 调用服务层服务的封装类
 * <P>
 * 
 * @author tang zheng yu
 * @date 2011-5-3 上午11:43:57
 * @version V1.0 2011-5-3
 * @modifyDate tang 2011-5-3 Description
 * @copyRight 亚信联创电信CRM部
 */
@Component
@SuppressWarnings("unchecked")
public class InterfaceClient {

	protected static Log log = Log.getLog(InterfaceClient.class);
	
	private static final String ENCODING = "UTF-8";

	private static final String AREA_CHINA = "8100000";
	private static final String AREA_BEIJING = "8110000";
	
	private static final String RES_SERVICENAME = "serviceName";
	private static final String RES_SERVICEMETHOD = "serviceMethod";

	// HTTP WEBSERVICE SIMULATE
	private static final String HTTP_WAY = "HTTP";
	private static final String WS_WAY = "WS";
	private static final String SIMULATE_WAY = "SIMULATE";
	
	private static final String URL_KEY = "url";
	private static final String CMP_PREFIX = "cmp";
	private static final String BIZ_PREFIX = "biz";
	private static final String CA_PREFIX = "ca";//无纸化签章系统
	private static final String BDW_PREFIX = "bdw";// bdw代表后台BusinessDispatchWeb项目 
	private static final String RES_PREFIX = "res";
	private static final String INTE_PREFIX = "inte";
	private static final String SYS_PREFIX = "sys";
	private static final String RULE_PREFIX = "rule";
	private static final String CHAN_PREFIX = "chan";
	private static final String CSB_HTTP = "csbHttp";
	private static final String CSB_WS = "csbWS";
	public static final String CHECK_LOGIN="pvc";
	private static final String PORTAL="portal";
	private static final String XML_CONTENT_TYPE = "text/xml";
	private static final String JSON_CONTENT_TYPE = "application/json";
	private static final String TEXT_CONTENT_TYPE = "application/x-www-form-urlencoded";
	private static final String ESS_PREFIX = "ess";

	private static final String YIM_PREFIX = "yim";
	private static final String XSD_PREFIX = "xsd";//宽带融合（翼销售）销售单下发

	private static final String PAY_PREFIX = "pay";//支付平台
	private static final String TER_PREFIX = "ter";

	
	/** 数据路由关键字，根据此标识读取不同数据源的配置数据 */
	public static final String DATABUS_DBKEYWORD = "dbKeyWord";

	private static PropertiesUtils propertiesUtils = null;
	
	private static ILogSender logSender = null;
	
	private static HttpServletRequest request = null;
	
	private static Map<String,String> areas=new HashMap<String,String>();
	
	/** 是否使用CDATA元素封装SVCCONT */
	public static boolean cdataSvcCont = true;
	
	public static final String CDATA_BEGIN = "<![CDATA[";
	public static final String CDATA_END = "]]>";
	public static final String CDATA_END_REPLACEMENT = "]]&gt;";
	
	static {
		getPropertiesUtils();
		getLogSender();
		setAreaJianp();
	}
	
	/**
	 * 调用服务层通用类
	 * 
	 * @param dataBusMap
	 *            入参
	 * @param serviceCode
	 *            　服务层的服务编码
	 * @param optFlowNum
	 *            平台编码，用于记录日志
	 * @param sessionStaff
	 *            员工Session对象
	 * @return DataBus 返回
	 * @throws IOException 
	 * @throws DocumentException 
	 * @throws Exception
	 */
	public static DataBus callService(Map<String, Object> dataBusMap,
			String serviceCode, String optFlowNum, SessionStaff sessionStaff)
			throws InterfaceException, IOException, Exception {
		/*
		 * 1、数据路由关键字，根据此标识读取不同数据源的配置数据，为空则读取默认数据源的配置数据；
		 * 2、优先读取sessionStaff中的路由参数,如果为空则从入参dataBusMap中读取；
		 */
		
		String dbKeyWord = sessionStaff == null ? null : sessionStaff.getDbKeyWord();
		if(StringUtils.isBlank(dbKeyWord)){
			dbKeyWord = MapUtils.getString(dataBusMap, DATABUS_DBKEYWORD,"");
			dataBusMap.remove(DATABUS_DBKEYWORD);
		}
		
		DataBus db = new DataBus();
		db = ServiceClient.initDataBus(sessionStaff);
		long beginTime = System.currentTimeMillis();
		String appDesc = propertiesUtils.getMessage(SysConstant.APPDESC);
		if (sessionStaff != null && SysConstant.APPDESC_MVNO.equals(appDesc)) {
			dataBusMap.put("distributorId", sessionStaff.getPartnerId());
//		} else if (sessionStaff != null && SysConstant.APPDESC_DEV.equals(appDesc)) {
//			dataBusMap.put("distributorId", "100000001");
		}
		//20140228 加上transactionId
		//20140311 transactionId作为操作流水标识
		String transactionId = UIDGenerator.getRand();
		dataBusMap.put("transactionId", transactionId);
		if (StringUtils.isEmpty(optFlowNum)) {
			optFlowNum = transactionId;
		}
		
		// 开始调用
		request = ((ServletRequestAttributes)RequestContextHolder.getRequestAttributes()).getRequest();
		String paramString = "";
		String paramJson="";
		String retnJson = "";
		String rawRetn = "";
		String intfUrl = "";
		String resultCode = "";
		String resultMsg = "";
		String errCode = "";
		String errorStack = "";
		String prefix = "";
		String logSeqId = "";
		//判断是否启用默认HTTP调用方式
		String invokeWay = propertiesUtils.getMessage(SysConstant.DEF_HTTP_FLAG);
		if (SysConstant.ON.equals(invokeWay)) {
			invokeWay = HTTP_WAY;
		} else {
			//未启用则从simulate配置文件中读取各接口对应的调用方式
			invokeWay = getInvokeWay(serviceCode);
		}
		
		try {
			prefix = serviceCode.substring(0, serviceCode.indexOf("-"));
			if (HTTP_WAY.equals(invokeWay)) {
				String contentType = JSON_CONTENT_TYPE;
				String sys = "";
				// get url, contentType by serviceCode
				if (BIZ_PREFIX.equals(prefix)) {
					serviceCode = serviceCode.substring(4);
					intfUrl = getNeeded(dbKeyWord,URL_KEY, BIZ_PREFIX);
					intfUrl += serviceCode;
					sys = "集团营业受理后台";
					//20140309 加上areaId
					if (!dataBusMap.containsKey("areaId")) {
						if(sessionStaff != null){
							dataBusMap.put("areaId", sessionStaff.getCurrentAreaId());
						}
					}
					if(AREA_CHINA.equals(dataBusMap.get("areaId"))){
						dataBusMap.put("areaId", AREA_BEIJING);
					}
					paramString = JsonUtil.toString(dataBusMap);
					paramJson=paramString;
				} else if (BDW_PREFIX.equals(prefix)) {//
					serviceCode = serviceCode.substring(4);
					intfUrl = getNeeded(dbKeyWord,URL_KEY, BDW_PREFIX);
					intfUrl += serviceCode;
					sys = "集团营业受理后台运维";
					if (!dataBusMap.containsKey("areaId")) {
						if(sessionStaff != null){
							dataBusMap.put("areaId", sessionStaff.getCurrentAreaId());
						}
					}
					if(AREA_CHINA.equals(dataBusMap.get("areaId"))){
						dataBusMap.put("areaId", AREA_BEIJING);
					}
					paramString = JsonUtil.toString(dataBusMap);
					paramJson=paramString;
				}else if (RES_PREFIX.equals(prefix)) {
					StringBuffer sb = new StringBuffer(getNeeded(dbKeyWord,URL_KEY, RES_PREFIX));
					sb.append(getNeeded(dbKeyWord,serviceCode, RES_SERVICENAME));
					sb.append("/").append(getNeeded(dbKeyWord,serviceCode, RES_SERVICEMETHOD));
					intfUrl = sb.toString();
					serviceCode = serviceCode.substring(4);
					if (!dataBusMap.containsKey("areaId")) {
						if(sessionStaff != null){
							dataBusMap.put("areaId", sessionStaff.getCurrentAreaId());
						}
					}
					dataBusMap = addReqInfo(dataBusMap, serviceCode, sessionStaff, transactionId);
					sys = "集团营销资源";
					paramString = JsonUtil.toString(dataBusMap);
				}else if (INTE_PREFIX.equals(prefix)) {
					serviceCode = serviceCode.substring(5);
					intfUrl = getNeeded(dbKeyWord,URL_KEY, INTE_PREFIX);
					intfUrl += serviceCode;
					if (!dataBusMap.containsKey("areaId")) {
						if(sessionStaff != null){
							dataBusMap.put("areaId", sessionStaff.getCurrentAreaId());
						}
					}
					dataBusMap = addInteReqInfo(dataBusMap, serviceCode, sessionStaff, transactionId);
					sys = "接口";
					paramString = JsonUtil.toString(dataBusMap);
				} else if (CA_PREFIX.equals(prefix)) {
					serviceCode = serviceCode.substring(3);
					intfUrl = getNeeded(dbKeyWord,URL_KEY, CA_PREFIX);
					intfUrl += serviceCode;
					sys = "集团无纸化系统";
					//20140309 加上areaId
					if (!dataBusMap.containsKey("areaId")) {
						if(sessionStaff != null){
							dataBusMap.put("areaId", sessionStaff.getCurrentAreaId());
						}
					}
					paramString = JsonUtil.toString(dataBusMap);
					paramJson=paramString;
				}else if (SYS_PREFIX.equals(prefix)) {
					serviceCode = serviceCode.substring(4);
					intfUrl = getNeeded(dbKeyWord,URL_KEY, SYS_PREFIX);
					intfUrl += serviceCode;
					sys = "集团系统管理";
					if (!dataBusMap.containsKey("areaId")) {
						if(sessionStaff != null){
							if (StringUtils.isBlank(sessionStaff.getCurrentAreaId())){
								dataBusMap.put("areaId", sessionStaff.getAreaId());
							}else{
								dataBusMap.put("areaId", sessionStaff.getCurrentAreaId());
							}
						}
					}
					if(AREA_CHINA.equals(dataBusMap.get("areaId"))){
						dataBusMap.put("areaId", AREA_BEIJING);
					}
					paramString = JsonUtil.toString(dataBusMap);
				} else if (RULE_PREFIX.equals(prefix)) {
					serviceCode = serviceCode.substring(5);
					intfUrl = getNeeded(dbKeyWord,URL_KEY, RULE_PREFIX);
					intfUrl += serviceCode;
					sys = "集团业务规则";
					paramString = JsonUtil.toString(dataBusMap);
				} else if (CHAN_PREFIX.equals(prefix)) {
					serviceCode = serviceCode.substring(5);
					intfUrl = getNeeded(dbKeyWord,URL_KEY, CHAN_PREFIX);
					intfUrl += serviceCode;
					sys = "集团渠道管理";
					paramString = JsonUtil.toString(dataBusMap);
				} else if (CHECK_LOGIN.equals(prefix)) {
					intfUrl = getNeeded(dbKeyWord,serviceCode, URL_KEY);
					//格式化请求参数
					StringBuilder sb=new StringBuilder();
					Iterator<Map.Entry<String, Object>>  iterator=dataBusMap.entrySet().iterator();
					Map.Entry<String, Object> item;
					while(iterator.hasNext()){
						item=iterator.next();
						if(sb.length()>0){
							sb.append("&");
						}
						sb.append(item.getKey()).append("=").append(item.getValue());
					}
					paramString=sb.toString();
					 contentType =TEXT_CONTENT_TYPE;
					sys = "验证单点登录";
				} else if (PORTAL.equals(prefix)) {
					serviceCode = serviceCode.substring(7);
					intfUrl += serviceCode;
					sys = "门户操作动作记日志";
					paramString = JsonUtil.toString(dataBusMap);
					paramJson=paramString;
				}else if (ESS_PREFIX.equals(prefix)) {//ESS
					serviceCode = serviceCode.substring(4);
					intfUrl = getNeeded(dbKeyWord,URL_KEY, ESS_PREFIX);
					intfUrl += serviceCode;
					sys = "ESS系统";
					paramString = JsonUtil.toString(dataBusMap);
					paramJson=paramString;

				}else if (YIM_PREFIX.equals(prefix)) {
					serviceCode = serviceCode.substring(4);
//					intfUrl = getNeeded(dbKeyWord,URL_KEY, YIM_PREFIX);
					intfUrl = MDA.CSB_HTTP_QUERCHEN_URL.toString();
					intfUrl += serviceCode;
					sys = "翼管店系统";
					paramString = JsonUtil.toString(dataBusMap);
					paramJson=paramString;
				}else if (XSD_PREFIX.equals(prefix)) {
					serviceCode = serviceCode.substring(4);
					intfUrl = getNeeded(dbKeyWord,URL_KEY, XSD_PREFIX);
					intfUrl += serviceCode;
					sys = "翼管店系统";
					paramString = JsonUtil.toString(dataBusMap);
					paramJson=paramString;

				}else if(PAY_PREFIX.equals(prefix)){
					serviceCode = serviceCode.substring(4);
					intfUrl =MDA.PAY_TOKEN_URL.toString();
					intfUrl += serviceCode;
					sys = "pay";//支付平台标志
					if (!dataBusMap.containsKey("areaId")) {
						if(sessionStaff != null){
							if (StringUtils.isBlank(sessionStaff.getCurrentAreaId())){
								dataBusMap.put("areaId", sessionStaff.getAreaId());
							}else{
								dataBusMap.put("areaId", sessionStaff.getCurrentAreaId());
							}
						}
					}
//					String reqPlatForm=dataBusMap.get("reqPlatForm").toString();
//					Map<String, Object> paramMap2 = (Map<String, Object>) dataBusMap.get("params");
//					StringBuffer xml = new StringBuffer();
//					xml.append("<proot>");
//					xml.append("<reqPlatForm>"+reqPlatForm+"</reqPlatForm>");
//					xml.append("<params>");
//					xml.append("<provinceCode>"+paramMap2.get("provinceCode").toString()+"</provinceCode>");
//					xml.append("<cityCode>"+paramMap2.get("cityCode").toString()+"</cityCode>");
//					xml.append("<channelId>"+paramMap2.get("channelId").toString()+"</channelId>");
//					xml.append("<payAmount>"+paramMap2.get("payAmount").toString()+"</payAmount>");		
//					xml.append("<detail>"+paramMap2.get("detail").toString()+"</detail>");
//					xml.append("<olNbr>"+paramMap2.get("olNbr").toString()+"</olNbr>");
//					xml.append("<reqNo>"+paramMap2.get("reqNo").toString()+"</reqNo>");
//					xml.append("<olNumber>"+paramMap2.get("olNumber").toString()+"</olNumber>");
//					xml.append("<customerId>"+paramMap2.get("customerId").toString()+"</customerId>");
//					xml.append("<customerName>"+paramMap2.get("customerName").toString()+"</customerName>");
//					xml.append("<sign>"+paramMap2.get("sign").toString()+"</sign>");
//					xml.append("</params>");
//					xml.append("</proot>");		
//					paramString=xml.toString();
//					paramJson=paramString;
					String s2 = JsonUtil.toString(dataBusMap);
					String xml2 = CommonUtils.jsontoXml(s2);
					paramString = xml2.substring(xml2.indexOf("<proot"),
							xml2.indexOf("<transactionId"));
					paramJson = paramString;
					
				}else if (TER_PREFIX.equals(prefix)) {
					serviceCode = serviceCode.substring(4);
					// 只通过csb调用
					intfUrl = propertiesUtils.getMessage(URL_KEY + "." + CSB_HTTP);
					sys = "终端销售系统";
					paramString = JsonUtil.toString(dataBusMap);
					paramJson=paramString;
				}
				
				String csbFlag = propertiesUtils.getMessage(SysConstant.CSB_FLAG);
				String asyncFlag = propertiesUtils.getMessage(SysConstant.ASYNC_FLAG);
				boolean asyncWay = false;
				Object serviceCodeObj = null;
				// 终端销售系统只允许通过csb调用（只支持xml）
				if (SysConstant.ON.equals(csbFlag) || TER_PREFIX.equals(prefix)){
					serviceCodeObj = DataRepository.getInstence().getCommonParam(dbKeyWord,serviceCode);
					Object serviceCodeObjAsyn = DataRepository.getInstence().getCommonParam(dbKeyWord,serviceCode + SysConstant.ASYNC_KEY);
					if (SysConstant.ON.equals(asyncFlag) && serviceCodeObjAsyn != null) {
						serviceCodeObj = serviceCodeObjAsyn;
						asyncWay = true;
					}
					//如果找不到CSB配置，就按默认方式HTTP调用
					if (serviceCodeObj != null) {
						Map<String, Object> map = JsonUtil.toObject((String)serviceCodeObj, Map.class);
						if (PAY_PREFIX.equals(prefix)) {// 支付平台接口封装信息全为xml
							paramString = addCsbInfo2(map, paramString, appDesc,
									sessionStaff);
						} else {
							paramString = addCsbInfo(map, paramString, appDesc,
									sessionStaff);
						}
						Object csbUrlObj = null;
						csbUrlObj = propertiesUtils.getMessage(URL_KEY + "." + CSB_HTTP);
						if (csbUrlObj != null){
							if(CA_PREFIX.equals(prefix)){
								csbUrlObj=MDA.CSB_HTTP_FORCA_URL;
								intfUrl = (String)csbUrlObj+"?prov="+getAreaJianp(sessionStaff.getCurrentAreaId());
								log.debug("intfUrl={}", intfUrl);
							}else{
								intfUrl = (String)csbUrlObj;
							}
						}
					}
				}
				
				// 添加标识ID 
				logSeqId = createLogSeqId(dataBusMap, serviceCode,
						sessionStaff, dbKeyWord, prefix, logSeqId);
				if (asyncWay) {
					log.debug("async-reqUrl:{}", intfUrl);
					log.debug("async-serviceCode:{},paramString:{}", serviceCode, paramString);
					
					IAsynClient client = (IAsynClient)SpringContextUtil.getBean("asynClient");
					rawRetn = (String)client.invoke(paramString);
					
					log.debug("async-serviceCode:{},rawRetn:{}", serviceCode, rawRetn);
				} else {
					db = httpCall(sys, serviceCode, paramString, intfUrl, contentType, optFlowNum, sessionStaff, beginTime, logSeqId);
					rawRetn = db.getResultMsg();
					retnJson = rawRetn;
				}
	
				if ((SysConstant.ON.equals(csbFlag) || TER_PREFIX.equals(prefix)) && serviceCodeObj != null){
					Node svcCont = checkCSBXml(serviceCode, rawRetn, paramString);
					if (PAY_PREFIX.equals(prefix)) {// 支付平台
						retnJson = svcCont.asXML();
						XMLSerializer xmlSerializer = new XMLSerializer();
						retnJson = xmlSerializer.read(retnJson).toString();
						retnJson=retnJson.substring(1,retnJson.length()-1);
					} else {
						retnJson = svcCont.getText();
					}
					
				}				
				Map<String, Object> rootMap = JsonUtil.toObject(retnJson, Map.class);
				//销售单下发接口回参修改
				if(serviceCode.equals("intf.saleOrder/saleOrderCommit")){
					Map<String,Object> ContractRoot = (Map<String, Object>) rootMap.get("ContractRoot");
					Map<String,Object> SvcCont = (Map<String, Object>) ContractRoot.get("SvcCont");
					Map<String,Object> Result = (Map<String, Object>) SvcCont.get("Result");
					rootMap.put("resultCode", Result.get("ResultCode"));
					rootMap.put("resultMsg", Result.get("ResultMsg"));
//					Result.remove("ResultCode");
//					Result.remove("ResultMsg");
				}
				if (MapUtils.isEmpty(rootMap) || !rootMap.containsKey("resultCode")) {
					if (rootMap == null || (!rootMap.containsKey("rspCode")&&!rootMap.containsKey("code")&&!rootMap.containsKey("respCode")&&!rootMap.containsKey("resFlag"))) {
						//异常判断：返回不是个JSON对象或没有包含resultCode
						throw new InterfaceException(ErrType.OPPOSITE, serviceCode, retnJson, paramString, logSeqId);
					}else if(rootMap.containsKey("code")){
						resultCode = MapUtils.getString(rootMap, "code");
						resultMsg = MapUtils.getString(rootMap, "message");
						returnMapSet(serviceCode, db, paramString, retnJson,
								resultCode, resultMsg, logSeqId, sys, rootMap);
					}else if(rootMap.containsKey("respCode")){
						resultCode = MapUtils.getString(rootMap, "respCode");
						resultMsg = MapUtils.getString(rootMap, "message");
						returnMapSet(serviceCode, db, paramString, retnJson,
								resultCode, resultMsg, logSeqId, sys, rootMap);
					}else if(rootMap.containsKey("resFlag")) {
						resultCode = MapUtils.getString(rootMap, "resFlag");
						resultMsg = MapUtils.getString(rootMap, "resMsg");
						returnMapSet(serviceCode, db, paramString, retnJson,
								resultCode, resultMsg, logSeqId, sys, rootMap);
					} else {
						resultCode = MapUtils.getString(rootMap, "rspCode");
						resultMsg = MapUtils.getString(rootMap, "rspDesc");
						returnMapSet(serviceCode, db, paramString, retnJson,
								resultCode, resultMsg, logSeqId, sys, rootMap);
					}
				}else{
					resultCode = MapUtils.getString(rootMap, "resultCode");
					resultMsg = MapUtils.getString(rootMap, "resultMsg");
					returnMapSet(serviceCode, db, paramString, retnJson,
							resultCode, resultMsg, logSeqId, sys, rootMap);
				}
			} else if (WS_WAY.equals(invokeWay)) {
	
			} else if (SIMULATE_WAY.equals(invokeWay)) {
				paramString = JsonUtil.toString(dataBusMap);
				retnJson = getRetnJson(serviceCode);// 模拟调用，从文件得到json格式返回值
				log.debug("retnJson:{}", retnJson.length() > 3000 ? retnJson.substring(0, 3000) : retnJson);
				
				if (StringUtils.isBlank(retnJson)) {
					db.setResultCode(ResultCode.R_INTERFACE_EXCEPTION);
					db.setResultMsg("接口返回为空");
					return db;
				}
	
				Map<String, Object> rootMap = JsonUtil.toObject(retnJson, Map.class);
				if (MapUtils.isNotEmpty(rootMap)){
					rootMap.put("logSeqId", logSeqId);
					Object obj = MapUtils.getObject(rootMap, "ContractRoot", null);
					if (obj != null) {
						rootMap = (Map<String, Object>) obj;
						Map<String, Object> tcpContMap = (Map<String, Object>) rootMap
								.get("TcpCont");
						Map<String, Object> svcContMap = (Map<String, Object>) rootMap
								.get("SvcCont");
						if (MapUtils.isNotEmpty(svcContMap)) {
							resultCode = (String) svcContMap.get("resultCode");
							resultMsg = (String) svcContMap.get("resultMsg");
							Map<String, Object> resultMap = (Map<String, Object>) svcContMap
									.get("result");
							db.setResultCode(resultCode);
							db.setResultMsg(resultMsg);
							db.setReturnlmap(resultMap);
						} else {
							db.setResultCode(ResultCode.R_INTERFACE_PARAM_MISS);
						}
					} else {
						resultCode = (String) rootMap.get("resultCode");
						resultMsg = (String) rootMap.get("resultMsg");
						db.setResultCode(resultCode);
						db.setResultMsg(resultMsg);
						db.setReturnlmap(rootMap);
					}
					log.debug("调用回参:{}", retnJson);
				} else{
					throw new InterfaceException(ErrType.OPPOSITE, serviceCode, retnJson, paramString, logSeqId);
				}
			}
		} finally {
			db.setResultCode(resultCode);
			db.setResultMsg(resultMsg);
			db.setParammap(dataBusMap);
			if (sessionStaff != null) {
				callServiceLog(logSeqId, dbKeyWord, db, optFlowNum, serviceCode, intfUrl, sessionStaff, paramString, rawRetn, beginTime, System.currentTimeMillis(),retnJson,paramJson,prefix);
			}
		}
		db.setBusiFlowId(transactionId);
		return db;
	}
	
	
	/**
	 * 用于ESS请求生成回执单pdf调用
	 * @param dataBusMap 入参
	 * @param serviceCode 服务层的服务编码
	 * @return DataBus 返回
	 * @throws IOException 
	 * @throws DocumentException 
	 * @throws Exception
	 */
	public static DataBus essInvoke4PdfDataInfo(Map<String, Object> dataBusMap,
			String serviceCode)
			throws InterfaceException, IOException, Exception {
		
		String dbKeyWord = MapUtils.getString(dataBusMap, DATABUS_DBKEYWORD,"");
		dataBusMap.remove(DATABUS_DBKEYWORD);
		
		DataBus db = new DataBus();
		long beginTime = System.currentTimeMillis();
		
		String paramString = "";
		String paramJson="";
		String retnJson = "";
		String rawRetn = "";
		String intfUrl = "";
		String resultCode = "";
		String resultMsg = "";
		String errCode = "";
		String errorStack = "";
		String prefix = "";
		String logSeqId = "essInvoke4VoucherDataInfo";
		//判断是否启用默认HTTP调用方式
		String invokeWay = propertiesUtils.getMessage(SysConstant.DEF_HTTP_FLAG);
		if (SysConstant.ON.equals(invokeWay)) {
			invokeWay = HTTP_WAY;
		} else {
			//未启用则从simulate配置文件中读取各接口对应的调用方式
			invokeWay = getInvokeWay(serviceCode);
		}
		
		try {
			prefix = serviceCode.substring(0, serviceCode.indexOf("-"));
			if (HTTP_WAY.equals(invokeWay)) {
				String contentType = JSON_CONTENT_TYPE;
				String sys = "";
				// get url, contentType by serviceCode
				if (BIZ_PREFIX.equals(prefix)) {
					serviceCode = serviceCode.substring(4);
					intfUrl = getNeeded(dbKeyWord,URL_KEY, BIZ_PREFIX);
					intfUrl += serviceCode;
					sys = "集团营业受理后台";
					if(AREA_CHINA.equals(dataBusMap.get("areaId"))){
						dataBusMap.put("areaId", AREA_BEIJING);
					}
					paramString = JsonUtil.toString(dataBusMap);
					paramJson=paramString;
				}
				
				db = httpCall(sys, serviceCode, paramString, intfUrl, contentType, null, null, beginTime, logSeqId);
				rawRetn = db.getResultMsg();
				retnJson = rawRetn;
	
				Map<String, Object> rootMap = JsonUtil.toObject(retnJson, Map.class);
				if (MapUtils.isEmpty(rootMap) || !rootMap.containsKey("resultCode")) {
					if (rootMap == null || (!rootMap.containsKey("rspCode")&&!rootMap.containsKey("code")&&!rootMap.containsKey("respCode")&&!rootMap.containsKey("resFlag"))) {
						//异常判断：返回不是个JSON对象或没有包含resultCode
						throw new InterfaceException(ErrType.OPPOSITE, serviceCode, retnJson, paramString, logSeqId);
					}else if(rootMap.containsKey("code")){
						resultCode = MapUtils.getString(rootMap, "code");
						resultMsg = MapUtils.getString(rootMap, "message");
						returnMapSet(serviceCode, db, paramString, retnJson,
								resultCode, resultMsg, logSeqId, sys, rootMap);
					}else if(rootMap.containsKey("respCode")){
						resultCode = MapUtils.getString(rootMap, "respCode");
						resultMsg = MapUtils.getString(rootMap, "message");
						returnMapSet(serviceCode, db, paramString, retnJson,
								resultCode, resultMsg, logSeqId, sys, rootMap);
					}else if(rootMap.containsKey("resFlag")) {
						resultCode = MapUtils.getString(rootMap, "resFlag");
						resultMsg = MapUtils.getString(rootMap, "resMsg");
						returnMapSet(serviceCode, db, paramString, retnJson,
								resultCode, resultMsg, logSeqId, sys, rootMap);
					} else {
						resultCode = MapUtils.getString(rootMap, "rspCode");
						resultMsg = MapUtils.getString(rootMap, "rspDesc");
						returnMapSet(serviceCode, db, paramString, retnJson,
								resultCode, resultMsg, logSeqId, sys, rootMap);
					}
				}else{
					resultCode = MapUtils.getString(rootMap, "resultCode");
					resultMsg = MapUtils.getString(rootMap, "resultMsg");
					returnMapSet(serviceCode, db, paramString, retnJson,
							resultCode, resultMsg, logSeqId, sys, rootMap);
				}
			}
	
		} finally {
			db.setResultCode(resultCode);
			db.setResultMsg(resultMsg);
			db.setParammap(dataBusMap);
		}
		return db;
	}
	
	// 重复代码封装
	private static void returnMapSet(String serviceCode, DataBus db,
			String paramString, String retnJson, String resultCode,
			String resultMsg, String logSeqId, String sys,
			Map<String, Object> rootMap) throws InterfaceException {
		if (ResultCode.R_EXCEPTION.equals(resultCode) || ResultCode.R_RULE_EXCEPTION.equals(resultCode)) {
			
			checkError(rootMap, sys, serviceCode, resultCode, resultMsg, retnJson, paramString, logSeqId);
			
		}
		rootMap.put("logSeqId", logSeqId);
		db.setReturnlmap(rootMap);
	}

	private static String createLogSeqId(Map<String, Object> dataBusMap,
			String serviceCode, SessionStaff sessionStaff, String dbKeyWord,
			String prefix, String logSeqId)
			throws UnsupportedEncodingException, InterfaceException {
		// 如果是必须记录或记录异常，则生成标识ID
		String log_flag = MySimulateData.getInstance().getParam(dbKeyWord,prefix+"-"+serviceCode);
		if ("1".equals(log_flag) || "2".equals(log_flag)) {
			DataBus _db = null;
			try{
				_db = ServiceClient.callService(new HashMap(), PortalServiceCode.SERVICE_GET_LOG_SEQUENCE, null, sessionStaff);
				if("POR-0000".equals(_db.getResultCode().toString())){
					logSeqId = getRandomString(5) + String.format("%05d", _db.getReturnlmap().get("logSeq"));
				} else {
					throw new InterfaceException(ErrType.ECSP, PortalServiceCode.SERVICE_GET_LOG_SEQUENCE, String.valueOf(_db.getResultMsg()), JsonUtil.toString(dataBusMap));
				}
			}catch (Exception e) {
				throw new InterfaceException(ErrType.ECSP, PortalServiceCode.SERVICE_GET_LOG_SEQUENCE, String.valueOf(_db.getResultMsg()), JsonUtil.toString(dataBusMap));
			}
		}
		return logSeqId;
	}

	private static String getRandomString(int length) { //length表示生成字符串的长度  
	    String base = "abcdefghijklmnopqrstuvwxyz";     
	    Random random = new Random();     
	    StringBuffer sb = new StringBuffer();     
	    for (int i = 0; i < length; i++) {     
	        int number = random.nextInt(base.length());     
	        sb.append(base.charAt(number));     
	    }     
	    return sb.toString();     
	 }    
	
	/**
	 * 调用服务层日志记录
	 * @param dbKeyWord2 
	 * 
	 * @param db
	 *            DataBus
	 * @param busiFlowNum
	 *            服务层流水号
	 * @param optFlowNum
	 *            门户层操作流水号
	 * @param serviceCode
	 *            服务编码
	 * @param startTime
	 *            开始 时间
	 * @param endTime
	 *            结束 时间
	 */
	public static void callServiceLog(String logSeqId, String dbKeyWord, DataBus db, String optFlowNum, 
			String serviceCode, String intfUrl, SessionStaff sessionStaff, String paramString, String rawRetn, long beginTime, long endTime,String retnJson,String paramJson,String prefix) {
		long startTime = System.currentTimeMillis();
		
		try {
			String log_flag = MySimulateData.getInstance().getParam(dbKeyWord,prefix+"-"+serviceCode);
			if(!"1".equals(log_flag)){
				if("2".equals(log_flag)){
					if(ResultCode.R_SUCC.equals(db.getResultCode()) || ResultCode.R_SUCCESS.equals(db.getResultCode())|| ResultCode.RES_SUCCESS.equals(db.getResultCode())){
						return;
					}
				}else{
					return;
				}
			}
			String olIdRemark="";
			String ol_id = "";
			String so_nbr = "";
			if(PortalServiceCode.ORDER_SUBMIT.equals("biz-"+serviceCode)){//订单提交接口
				Map<String, Object> paramMap = new HashMap<String, Object>();
				paramMap = JsonUtil.toObject(retnJson, Map.class);
				if(!paramMap.isEmpty() && ResultCode.R_SUCC.equals(db.getResultCode())){
					Map<String, Object> map=new HashMap<String, Object>();
					map=(Map<String, Object>)paramMap.get("result");
					olIdRemark=map.get("olId")!=null?map.get("olId").toString():"";
					olIdRemark="olId:"+olIdRemark;
					ol_id=map.get("olId")!=null?map.get("olId").toString():"";
					so_nbr=map.get("olNbr")!=null?map.get("olNbr").toString():"";
				}
			}else if(PortalServiceCode.INTF_SUBMIT_CHARGE.equals("biz-"+serviceCode)||PortalServiceCode.CHECK_RULE_TO_PROV.equals("biz-"+serviceCode)||PortalServiceCode.INTF_QUERY_CHARGE_LIST.equals("biz-"+serviceCode)){//收费建档接口，下省校验接口,费用项
				Map<String, Object> map = new HashMap<String, Object>();
				map = JsonUtil.toObject(paramJson, Map.class);
				if(!map.isEmpty()){
					olIdRemark="olId:"+map.get("olId");
					ol_id=map.get("olId")!=null?map.get("olId").toString():"";
					so_nbr=map.get("olNbr")!=null?map.get("olNbr").toString():"";
				}
			}
			
			// 新增错误标识，0 成功  1  错误  2  异常
			String errorCode = "";
			if(ResultCode.R_SUCC.equals(db.getResultCode()) || ResultCode.R_SUCCESS.equals(db.getResultCode()) || ResultCode.RES_SUCCESS.equals(db.getResultCode())){
				errorCode = "0";
			} else if (ResultCode.R_FAIL.equals(db.getResultCode()) || ResultCode.R_FAILURE.equals(db.getResultCode()) || ResultCode.R_QUERY_FAIL.equals(db.getResultCode())) {
				errorCode = "1";
			} else {
				errorCode = "2";
			} 
			String write_asynchronous_flag = MySimulateData.getInstance().getParam(dbKeyWord,SysConstant.WRITE_ASYNCHRONOUS_FLAG);
			if (SysConstant.ON.equals(write_asynchronous_flag)) {
				/*try{
					request = ((ServletRequestAttributes)RequestContextHolder.getRequestAttributes()).getRequest();
				}catch (Exception e) {
					// TODO: handle exception
				}*/
				Map<String, Object> logObj = new HashMap<String, Object>();
//				String logId = UUID.randomUUID().toString();
//				logObj.put("LOG_ID", logId);
				logObj.put("SERVICE_CODE", serviceCode);
				logObj.put("PORTAL_CODE", db.getPortalCode() == null ? "" : db.getPortalCode());
				logObj.put("ROLE_CODE", db.getRoleCode() == null ? "" : db.getRoleCode());
				String serviceSerial = "SP"+DateFormatUtils.format(new Date(), "yyyyMMddHHmmssSSS")+RandomStringUtils.randomNumeric(4);
				logObj.put("SERV_RUN_NBR", serviceSerial);
				//如果是前台记录日志不能用此方法获取session 
				//前台记自己服务的日志 前缀为portal
				HttpSession session=null;
				if("portal".equals(prefix)){
					session=null;
				}else{
					session = ServletUtils.getSession(request);
				}
				if(session!=null){
					String log_busi_run_nbr = (String)session.getAttribute(SysConstant.LOG_BUSI_RUN_NBR);
					logObj.put("BUSI_RUN_NBR", log_busi_run_nbr);
				}
				Date beginDate = new Date(beginTime);
				Date endDate = new Date(endTime);
				String st = DateFormatUtils.format(beginDate, "yyyy/MM/dd HH:mm:ss");
				String et = DateFormatUtils.format(endDate, "yyyy/MM/dd HH:mm:ss");
				logObj.put("START_TIME", st);
				logObj.put("END_TIME", et);
				
				long useTime = endDate.getTime()-beginDate.getTime();
				if (useTime>1000000000){
					useTime = 1000000000;
				}
				logObj.put("USE_TIME", Long.toString(useTime));
				logObj.put("RESULT_CODE", db.getResultCode());
				logObj.put("TRANS_ID", MapUtils.getString(db.getParammap(), "transactionId", ""));
				logObj.put("AREA_ID", sessionStaff.getCurrentAreaId() == null ? "" : sessionStaff.getCurrentAreaId());
				
				if(request != null){
					try{
						logObj.put("REMOTE_ADDR", ServletUtils.getIpAddr(request));
						logObj.put("REMOTE_PORT", String.valueOf(request.getRemotePort()));
						logObj.put("LOCAL_ADDR", InetAddress.getLocalHost().getHostAddress());
						logObj.put("LOCAL_PORT", String.valueOf(request.getLocalPort()));
					} catch(Exception e){
						logObj.put("REMOTE_ADDR", e.getMessage());
						logObj.put("REMOTE_PORT", e.getMessage());
						logObj.put("LOCAL_ADDR", e.getMessage());
						logObj.put("LOCAL_PORT", e.getMessage());
					}
				}else{
					logObj.put("REMOTE_ADDR", "request is null");
					logObj.put("REMOTE_PORT", "request is null");
					logObj.put("LOCAL_ADDR", "request is null");
					logObj.put("LOCAL_PORT", "request is null");
				}
				
				logObj.put("INTF_URL", intfUrl);
				logObj.put("INTF_METHOD", serviceCode);
				logObj.put("STAFF_ID", sessionStaff.getStaffId() == null ? "" : sessionStaff.getStaffId());
				logObj.put("STAFF_NAME", sessionStaff.getStaffCode() == null ? "" : sessionStaff.getStaffCode());
				logObj.put("CHANNEL_NAME", sessionStaff.getCurrentChannelName() == null ? "" : sessionStaff.getCurrentChannelName());
				logObj.put("CHANNEL_ID", sessionStaff.getCurrentChannelId() == null ? "" : sessionStaff.getCurrentChannelId());
				logObj.put("REMARK", ServletUtils.getRequestHost(request) 
						+ "；\n工号是否具有跳过经办人权限：" 
						+ (sessionStaff.isHasOperatSpecCd(SysConstant.TGJBRBTQX) ? "是" : "否"));
				logObj.put("OL_ID", ol_id);
				logObj.put("SO_NBR", so_nbr);
				logObj.put("BUSI_TYPE", "");
				logObj.put("IP", "");
				//#1155940 记录 SESSION_ID  PORTAL_ID BUSI_INFO
				String sessionId="";
				//取入参中的sessionId
				if(!StringUtil.isEmptyStr(paramString)){
					Map<String, Object> paramMap= JsonUtil.toObject(paramString, Map.class);
					if(paramMap!=null){
						sessionId = (String) paramMap.get("sessionId");
						if(!StringUtil.isEmptyStr(sessionId)){
							logObj.put("SESSION_ID",sessionId );
						}
					}
				}else if(session!=null){
					//取session中的sessionId
					sessionId=session.getId();
					if(!StringUtil.isEmptyStr(sessionId)){
							logObj.put("SESSION_ID", sessionId);
						}
					}
				 //门户日志 记录业务场景 与订单id
				 if("portal".equals(prefix)){
					  Map<String,Object>	map = JsonUtil.toObject(paramString, Map.class);
					  logObj.put("TRANS_ID", MapUtils.getString(map, "portalId", ""));  
					  logObj.put("BUSI_TYPE", MapUtils.getString(map, "servCode", MapUtils.getString(map, "menuInfo","")));
				 }
				// 新增日志ID
				logObj.put("LOG_SEQ_ID", logSeqId);
				// 新增错误标识，0 成功  1  错误  2  异常
				logObj.put("ERROR_CODE", errorCode);
				Map<String, Object> logClobObj = new HashMap<String, Object>();
				if(StringUtils.isBlank(rawRetn)){
					rawRetn = retnJson;//抛异常的情况下rawRetn可能为空
				}
				logClobObj.put("IN_PARAM", paramString);						
				logClobObj.put("OUT_PARAM", rawRetn);
				boolean isDefaultLog = true;
				if (propertiesUtils.getMessage(SysConstant.PORTAL_SERVICE_LOG_P).contains(serviceCode)) {
					isDefaultLog = false;
					logSender.sendLog2DB(SysConstant.PORTAL_SERVICE_LOG_P, logObj, logClobObj);
				}
				if (propertiesUtils.getMessage(SysConstant.PORTAL_SERVICE_LOG_Y).contains(serviceCode)) {
					isDefaultLog = false;
					logSender.sendLog2DB(SysConstant.PORTAL_SERVICE_LOG_Y, logObj, logClobObj);
				}
				if (propertiesUtils.getMessage(SysConstant.PORTAL_SERVICE_LOG_W).contains(serviceCode)) {
					isDefaultLog = false;
					logSender.sendLog2DB(SysConstant.PORTAL_SERVICE_LOG_W, logObj, logClobObj);
				}
				if (isDefaultLog){
					logSender.sendLog2DB(SysConstant.PORTAL_SERVICE_LOG, logObj, logClobObj);
				}
			}
			String writelogFlag = MySimulateData.getInstance().getParam(dbKeyWord,SysConstant.WRITE_LOG_FLAG);
			if (SysConstant.OFF.equals(writelogFlag)) {
				return;
			}
			String writeDetailFlag = MySimulateData.getInstance().getParam(dbKeyWord,SysConstant.WRITE_LOG_DETAIL);
			if (StringUtils.isEmpty(writeDetailFlag)) {
				writeDetailFlag = SysConstant.LOG_PS;
			}
			
			if (SysConstant.LOG_PS.equals(writeDetailFlag)) {
				Map<String, Object> logMap = new HashMap<String, Object>();
				
				logMap.put("intfMethod", serviceCode);
				logMap.put("logSeqId", logSeqId);
				logMap.put("errorCode", errorCode);
				logMap.put("intfUrl", intfUrl);
				logMap.put("beginDate", "" + beginTime);
				logMap.put("endDate", "" + endTime);
				logMap.put("remark", olIdRemark);
				logMap.put("inParam", paramString);						
				logMap.put("outParam", rawRetn);
				
				LogContainer.getInstance().addServiceLog(logMap, optFlowNum, sessionStaff);
				
			} else if (SysConstant.LOG_UNILOG.equals(writeDetailFlag)) {
				// UNILOG情况下，先记录一般日志到SP_SERVICE_RUN_LOG表，
				// 再把包含CLOB字段的内容发往日志服务器
				String logId = DateFormatUtils.format(new Date(), "yyMMddSSS") + RandomStringUtils.randomNumeric(9);
				
				Map<String, Object> logMap = new HashMap<String, Object>();
				logMap.put("logId", logId);
				logMap.put("intfMethod", serviceCode);
				logMap.put("intfUrl", intfUrl);
				logMap.put("beginDate", "" + beginTime);
				logMap.put("endDate", "" + endTime);
				logMap.put("remark", olIdRemark);
				logMap.put("inParam", null);
				logMap.put("outParam", null);
				LogContainer.getInstance().addServiceLog(logMap, optFlowNum, sessionStaff);
				
				
				Map<String, Object> logObj = new HashMap<String, Object>();
				logObj.put("logId", Long.parseLong(logId));
				logObj.put("staffNbr", sessionStaff.getStaffId() == null ? "" : sessionStaff.getStaffId());
				logObj.put("areaId", sessionStaff.getCurrentAreaId() == null ? "" : sessionStaff.getCurrentAreaId());
				logObj.put("channelId", sessionStaff.getCurrentChannelId() == null ? "" : sessionStaff.getCurrentChannelId());
				logObj.put("transactionId", MapUtils.getString(db.getParammap(), "transactionId", ""));
				logObj.put("apiName", serviceCode);
				logObj.put("beginTime", beginTime);
				logObj.put("endTime", endTime);
				logObj.put("usedTime", endTime < beginTime ? 0L : endTime - beginTime);//endTime小于beginTime则设置为0
				String olId = MapUtils.getString(db.getParammap(), "olId", "");
				String olNbr = MapUtils.getString(db.getParammap(), "olNbr", "");
				String acctNbr = MapUtils.getString(db.getParammap(), "acctNbr", "");
				if (MapUtils.isNotEmpty(db.getReturnlmap())) {
					Object resultObj = db.getReturnlmap().get("result");
					if (resultObj instanceof Map) {
						if (StringUtils.isEmpty(olId)) {
							olId = MapUtils.getString((Map<String, Object>) resultObj, "olId", "");
						}
						if (StringUtils.isEmpty(olNbr)) {
							olNbr = MapUtils.getString((Map<String, Object>) resultObj, "olNbr", "");
						}
						if (StringUtils.isEmpty(acctNbr)) {
							acctNbr = MapUtils.getString((Map<String, Object>) resultObj, "acctNbr", "");
						}
					}
				}
				logObj.put("olId", olId);
				logObj.put("olNbr", olNbr);
				logObj.put("acctNbr", acctNbr);
				logObj.put("inParam", paramString);						
				logObj.put("outParam", rawRetn);
				
				logSender.sendLog(SysConstant.LOG_TYPE, logObj);
				
			} else  if (SysConstant.LOG_NONE.equals(writeDetailFlag)) {
				Map<String, Object> logMap = new HashMap<String, Object>();
				logMap.put("logSeqId", logSeqId);
				logMap.put("errorCode", errorCode);
				logMap.put("intfMethod", serviceCode);
				logMap.put("intfUrl", intfUrl);
				logMap.put("beginDate", "" + beginTime);
				logMap.put("endDate", "" + endTime);
				logMap.put("inParam", null);
				logMap.put("outParam", null);
				LogContainer.getInstance().addServiceLog(logMap, optFlowNum, sessionStaff);
			}
			long useTime = System.currentTimeMillis() - startTime;
			log.debug("addServiceLog use time : {} ms", useTime);
		} catch (Exception e) {
			log.error("日志记录异常", e);
		}
	}

	private static DataBus httpCall(String sys, String serviceCode, String paramString, String reqUrl,
			String contentType, String optFlowNum, SessionStaff sessionStaff, long beginTime, String logSeqId) throws InterfaceException {
		long startTime = System.currentTimeMillis();
		
		DataBus db = new DataBus();
		String retnJson = "";
		HttpPost post = null;
		HttpEntity entity = null;
		try {
			// 调用http服务
			log.debug("reqUrl:{}", reqUrl);
			log.debug("serviceCode:{},paramString:{}", serviceCode, paramString);
			post = new HttpPost(reqUrl);
			if("pay".equals(sys)){//支付平台只支持xml
			   post.addHeader("Content-Type", "application/xml;charset=gbk");
			}else{
			   post.addHeader("Content-Type", contentType);
			}
			entity = new StringEntity(paramString, ENCODING);
			post.setEntity(entity);
			HttpResponse httpresponse = MyHttpclient.getInstance()
					.getHttpclient().execute(post);
			entity = httpresponse.getEntity();
			retnJson = EntityUtils.toString(entity, ENCODING);
			String csbFlag = propertiesUtils.getMessage(SysConstant.CSB_FLAG);
			if(!SysConstant.ON.equals(csbFlag) && "pay".equals(sys)){
				XMLSerializer xmlSerializer = new XMLSerializer();				
				retnJson=xmlSerializer.read(retnJson).toString();
			}
			log.debug("serviceCode:{},retnJson:{}", serviceCode, retnJson);
			// 返回成功
			if (httpresponse.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
				db.setResultCode(ResultCode.R_SUCC);
				db.setResultMsg(retnJson);
			} else {
				String msg = "HTTP调用失败(http code:"
						+ httpresponse.getStatusLine().getStatusCode()
						+ ")";
				log.error(msg + retnJson);
				Map<String, Object> paramMap = new HashMap<String, Object>();
				paramMap.put("paramString", paramString);
				db.setParammap(paramMap);
				msg = reqUrl + "\n" + msg + "\n" + retnJson;
				throw new InterfaceException(ErrType.OPPOSITE, serviceCode, msg, paramString, logSeqId);
			}
		} catch (IOException ioe) {
			log.error("HTTP调用异常", ioe);
			Map<String, Object> paramMap = new HashMap<String, Object>();
			paramMap.put("paramString", paramString);
			db.setParammap(paramMap);
			if (ioe instanceof SocketTimeoutException) {
				String msg = ioe.getMessage();
				if ("Read timed out".equals(msg)) {
					msg = reqUrl + "\n" + msg;
					throw new InterfaceException(ErrType.OPPOSITE, serviceCode, msg, paramString, logSeqId);
				}
			} else if (ioe.getCause() != null) {
				String msg = ioe.getCause().getMessage();
				if ("Connection timed out: connect".equals(msg)) {
					msg = reqUrl + "\n" + msg + "\n" + ioe.getMessage();
					throw new InterfaceException(ErrType.OPPOSITE, serviceCode, msg, paramString, logSeqId);
				}
			}
			
			throw new InterfaceException(ErrType.PORTAL, serviceCode, paramString, ioe, logSeqId);
		} catch (InterfaceException ie) {
			throw ie;
		} finally {
			post.abort();// 连接停止，释放资源
			try {
				if (null != entity) {
					EntityUtils.consume(entity);
				}
			} catch (IOException e) {
				log.error("HTTP调用释放资源异常", e);
			}
		}
		
		long useTime = System.currentTimeMillis() - startTime;
		log.debug("http call use time {} ms", useTime);
		return db;
	}

	public static Node checkCSBXml(String serviceCode, String rawRetn, String paramString) throws Exception {
		Document dom = null;
		String rspType = "";
		String rspCode = "";
		String rspDesc = "";
		try {
			dom = getDoc(rawRetn);

			rspType = dom.selectSingleNode("ContractRoot/TcpCont/Response/RspType").getText();
			rspCode = dom.selectSingleNode("ContractRoot/TcpCont/Response/RspCode").getText();
			rspDesc = dom.selectSingleNode("ContractRoot/TcpCont/Response/RspDesc").getText();
			
			//不成功的情况下,分析rspDesc构造,是否为  编码|#|错误提示语
			if (!"0".equals(rspType) && !"0000".equals(rspCode)) {
				//没有符合异常封装规范，提示为CSB错误
				if (StringUtils.isEmpty(rspDesc) || rspDesc.indexOf("|#|") < 0) {
					throw new InterfaceException(ErrType.CSB, serviceCode, "CSB返回异常：" + rspDesc, rspType + "-" + rspCode, rawRetn, paramString);
				}
				int ind = rspDesc.indexOf("|#|");
				String errCode = rspDesc.substring(0, ind);
				String resultMsg = rspDesc.substring(ind + 3);
				boolean errCodeFlag = false;
				//编码非数字或非6位
				if (!NumberUtils.isDigits(errCode) || errCode.length() != 6) {
					errCodeFlag = true;
				} else {
					//判断编码前两位是否规范
					String prefixErrCode = errCode.substring(0, 2);
					if (!ErrorCode.SYS_MAP.containsKey(prefixErrCode)) {
						errCodeFlag = true;
					}
				}
				if (errCodeFlag) {
					throw new InterfaceException(ErrType.CSB, serviceCode, "CSB返回异常：" + rspDesc, rspType + "-" + rspCode, rawRetn, paramString);
				}
				String showMsg = ErrorCode.getSysByCode(errCode) + "异常：" + resultMsg;
				throw new InterfaceException(ErrType.CATCH, serviceCode, showMsg, errCode, rawRetn, paramString);
			}
			return dom.selectSingleNode("ContractRoot/SvcCont");
			
		} catch (DocumentException e) {
			throw new InterfaceException(ErrType.CSB, serviceCode, "解析CSB的xml回参异常", "090001", rawRetn, paramString);
		} catch (NullPointerException e) {
			throw new InterfaceException(ErrType.CSB, serviceCode, "CSB返回异常：" + rspDesc, rspType + "-" + rspCode, rawRetn, paramString);
		}
	}
	
	
	public static void checkError(Map<String, Object> rootMap, String sys, String serviceCode, String resultCode, String resultMsg, String retnJson, String paramString, String logSeqId) throws InterfaceException {
		if (rootMap.containsKey("resultMsg") && rootMap.containsKey("errCode")) {
			//异常判断：返回已包含resultCode/resultMsg/errCode/errorStack四要素
			StringBuffer sb = new StringBuffer();
			sb.append(sys).append("的").append(serviceCode).append("服务已捕获异常,errCode:{},errorStack:{}");
			String errCode = MapUtils.getString(rootMap, "errCode", "");
			String errorStack = MapUtils.getString(rootMap, "errorStack", "");
			log.error(sb.toString(), errCode, errorStack);
			//异常判断：errCode是否规范（6位，前两位代表系统）,errCodeFlag为true表明不规范
			boolean errCodeFlag = false;
			//编码非数字或非6位
			if (!NumberUtils.isDigits(errCode) || errCode.length() != 6) {
				errCodeFlag = true;
			} else {
				//判断编码前两位是否规范
				String prefixErrCode = errCode.substring(0, 2);
				if (!ErrorCode.SYS_MAP.containsKey(prefixErrCode)) {
					errCodeFlag = true;
				}
			}
			//errCode不规范，由门户封装为对端系统异常
			if (errCodeFlag) {
				if (ResultCode.R_RULE_EXCEPTION.equals(resultCode)) {
					errorStack = resultMsg;
				}
				throw new InterfaceException(ErrType.OPPOSITE, serviceCode, retnJson, paramString, logSeqId);
			}
			//errCode规范，展示接口返回的四要素
			String msg = "";
			if (ResultCode.R_EXCEPTION.equals(resultCode)) {
				msg = ErrorCode.getSysByCode(errCode) + "异常：" + resultMsg;
			} else {
				msg = ErrorCode.getSysByCode(errCode) + "校验不通过：" + resultMsg;
				//写死一个判定字符串
				errorStack = "ERR_RULE_-2";
			}
			String errorInstNbr = MapUtils.getString(rootMap, "errorInstNbr", "");
			throw new InterfaceException(ErrType.CATCH, serviceCode, msg, errCode, errorStack, errorInstNbr, paramString, logSeqId);
		} else {
			//异常判断：返回未包含errCode/errorStack，封装为对端系统异常
			StringBuffer sb = new StringBuffer();
			sb.append(sys).append("的").append(serviceCode).append("服务未捕获异常");
			sb.append(",resultMsg:{}");
			log.error(sb.toString(), resultMsg);
			throw new InterfaceException(ErrType.OPPOSITE, serviceCode, resultMsg, paramString, logSeqId);
		}
		
	}
	
	private static Map<String, Object> addReqInfo(Map<String, Object> paramMap,
			String serviceCode, SessionStaff sessionStaff, String transactionId) {
		Map<String, Object> reqInfo = new HashMap<String, Object>();
		Date date = new Date();
		String reqTime = DateFormatUtils.format(date, "yyyyMMddHHmmssSSS");
//		String srcSysID = "";
//		String appDesc = propertiesUtils.getMessage(SysConstant.APPDESC);
//		if (SysConstant.APPDESC_MVNO.equals(appDesc)) {
//			srcSysID = SysConstant.CSB_SRC_SYS_ID_MVNO;
//		} else if (SysConstant.APPDESC_LTE.equals(appDesc)) {
//			srcSysID = SysConstant.CSB_SRC_SYS_ID_LTE;
//		}
//		reqInfo.put("tranId", CsbDataMap.getTranID(srcSysID));
		reqInfo.put("tranId", transactionId); //传营销资源的tranId与门户的transactionId保持一致
		reqInfo.put("reqTime", reqTime.substring(0, 14));
		reqInfo.put("srcSysID", "1000000045");
		reqInfo.put("requestService", serviceCode);
		reqInfo.put("distributorId", sessionStaff.getPartnerId());
		reqInfo.put("staffId", sessionStaff.getStaffId());
		if(!"null".equals(paramMap.get("areaId")) && paramMap.get("areaId")!=null){
			reqInfo.put("areaId", paramMap.get("areaId"));
		}else{
			reqInfo.put("areaId", sessionStaff.getCurrentAreaId());
		}
		paramMap.put("reqInfo", reqInfo);
		return paramMap;
	}
	private static Map<String, Object> addInteReqInfo(Map<String, Object> paramMap,
			String serviceCode, SessionStaff sessionStaff, String transactionId) {
		Map<String, Object> reqInfo = new HashMap<String, Object>();
		Date date = new Date();
		String reqTime = DateFormatUtils.format(date, "yyyyMMddHHmmssSSS");
//		String srcSysID = "";
//		String appDesc = propertiesUtils.getMessage(SysConstant.APPDESC);
//		if (SysConstant.APPDESC_MVNO.equals(appDesc)) {
//			srcSysID = SysConstant.CSB_SRC_SYS_ID_MVNO;
//		} else if (SysConstant.APPDESC_LTE.equals(appDesc)) {
//			srcSysID = SysConstant.CSB_SRC_SYS_ID_LTE;
//		}
//		reqInfo.put("tranId", CsbDataMap.getTranID(srcSysID));
		reqInfo.put("tranId", transactionId); //传营销资源的tranId与门户的transactionId保持一致
		reqInfo.put("reqTime", reqTime.substring(0, 14));
		reqInfo.put("srcSysID", "1000000206");
		reqInfo.put("requestService", serviceCode);
		reqInfo.put("distributorId", sessionStaff.getPartnerId());
		reqInfo.put("staffId", sessionStaff.getStaffId());
		reqInfo.put("channelId", sessionStaff.getCurrentChannelId());
		Map<String, Object> pageInfo = new HashMap<String, Object>();
		pageInfo.put("pageIndex", paramMap.get("pageIndex") + "");
		pageInfo.put("pageSize", paramMap.get("pageSize") +"");
		reqInfo.put("pageInfo", pageInfo);
		
		if(!"null".equals(paramMap.get("areaId")) && paramMap.get("areaId")!=null){
			reqInfo.put("areaId", paramMap.get("areaId"));
		}else{
			reqInfo.put("areaId", sessionStaff.getCurrentAreaId());
		}
		paramMap.put("reqInfo", reqInfo);
		return paramMap;
	}
	private static String addCsbInfo(Map<String, Object> csbMap,
			String paramString, String appDesc,SessionStaff sessionStaff) throws IOException,Exception {
		String tranid = "";
		Map tranMap = new HashMap();
		Map dataBusMap = new HashMap();
		DataBus db = null;
		try{
			db = ServiceClient.callService(dataBusMap, PortalServiceCode.SERVICE_GET_TRANID, null, sessionStaff);
			if("POR-0000".equals(db.getResultCode().toString())){
				tranMap = db.getReturnlmap();
				tranid = (String.valueOf(tranMap.get("TranId")));
			}else{
				throw new InterfaceException(ErrType.ECSP, PortalServiceCode.SERVICE_GET_TRANID, String.valueOf(db.getResultMsg()), JsonUtil.toString(dataBusMap));
			}
		}catch (Exception e) {
			throw new InterfaceException(ErrType.ECSP, PortalServiceCode.SERVICE_GET_TRANID, String.valueOf(db.getResultMsg()), JsonUtil.toString(dataBusMap));
        }
		String srcSysID = SysConstant.CSB_SRC_SYS_ID_LTE;
		CsbDataMap cdm = new CsbDataMap();
		cdm.setTranIdSeq(tranid);
		cdm.setBusCode(MapUtils.getString(csbMap, "BusCode"));
		cdm.setServiceCode(MapUtils.getString(csbMap, "ServiceCode"));
		cdm.setServiceContractVer(MapUtils.getString(csbMap, "ServiceContractVer"));
		cdm.setDstSysID(MapUtils.getString(csbMap, "DstSysID"));
		cdm.setActionCode(SysConstant.CSB_ACTION_CODE);
		cdm.setServiceLevel(SysConstant.CSB_SERVICE_LEVEL);
		String srcSysSign=MapUtils.getString(csbMap, "srcSysSign");
		if(srcSysSign==null||"".equals(srcSysSign)){
			cdm.setSrcSysSign(SysConstant.CSB_SRC_SYS_SIGN);
		}else{
			cdm.setSrcSysSign(srcSysSign);
		}
		cdm.setDstOrgID(SysConstant.CSB_ORG_ID_GROUP);
		cdm.setSrcOrgID(SysConstant.CSB_ORG_ID_GROUP);
		if (SysConstant.APPDESC_MVNO.equals(appDesc)) {
			srcSysID = SysConstant.CSB_SRC_SYS_ID_MVNO;
		} else if (SysConstant.APPDESC_LTE.equals(appDesc)) {
			srcSysID = SysConstant.CSB_SRC_SYS_ID_LTE;
		}
		HttpSession session = ServletUtils.getSession(request);
		if (session != null && "1".equals(session.getAttribute(SysConstant.SESSION_KEY_APP_FLAG))) {
			srcSysID = SysConstant.CSB_SRC_SYS_ID_APP;
			if(srcSysSign==null||"".equals(srcSysSign)){
				cdm.setSrcSysSign(SysConstant.CSB_SRC_SYS_SIGN_YSX);
			}else{
				cdm.setSrcSysSign(srcSysSign);
			}
		}
		cdm.setSrcSysID(srcSysID);
		
		//使用CDATA封装svc
		if(cdataSvcCont){
			//将报文中的]]>转义
			if(paramString != null && paramString.indexOf(CDATA_END) != -1){
				paramString = paramString.replaceAll(CDATA_END, CDATA_END_REPLACEMENT);
			}
			paramString = CDATA_BEGIN + paramString + CDATA_END;
		}
		cdm.setSvcCont(paramString);
		
		return cdm.getXml();
	}
	
	private static String addCsbInfo2(Map<String, Object> csbMap,
			String paramString, String appDesc,SessionStaff sessionStaff) throws IOException,Exception {
		String tranid = "";
		Map tranMap = new HashMap();
		Map dataBusMap = new HashMap();
		DataBus db = null;
		try{
			db = ServiceClient.callService(dataBusMap, PortalServiceCode.SERVICE_GET_TRANID, null, sessionStaff);
			if("POR-0000".equals(db.getResultCode().toString())){
				tranMap = db.getReturnlmap();
				tranid = (String.valueOf(tranMap.get("TranId")));
			}else{
				throw new InterfaceException(ErrType.ECSP, PortalServiceCode.SERVICE_GET_TRANID, String.valueOf(db.getResultMsg()), JsonUtil.toString(dataBusMap));
			}
		}catch (Exception e) {
			throw new InterfaceException(ErrType.ECSP, PortalServiceCode.SERVICE_GET_TRANID, String.valueOf(db.getResultMsg()), JsonUtil.toString(dataBusMap));
        }
		StringBuffer inXml = new StringBuffer();
		inXml.append("<SvcCont>");
		inXml.append(paramString);		
		inXml.append("</SvcCont>");	
		String paramStr = "";//入参
		String srcTransactionNbr=tranid;
		paramStr = "<ContractRoot>" + getTcpCont(csbMap,srcTransactionNbr,appDesc) + inXml.toString() + "</ContractRoot>";//请求报文
        return paramStr;
	}

	private static String getInvokeWay(String serviceCode) {
		return MySimulateData.getInstance().getInvokeWay(serviceCode);
	}

	private static String getRetnJson(String serviceCode) {
		return MySimulateData.getInstance().getJson(serviceCode);
	}

	private static String getNeeded(String dbKeyWord,String serviceCode, String need) throws Exception {
		return MySimulateData.getInstance().getNeeded(dbKeyWord,serviceCode, need);
	}
	
	private static Document getDoc(String xml) throws DocumentException {
		Document result = null;
        SAXReader reader = new SAXReader();       

        InputSource source = new InputSource(new StringReader(xml));
        source.setEncoding("UTF-8");

        try {
			result = reader.read(source);
		} catch (DocumentException e) {
			log.error(e);
			throw e;
		}

        if (result.getXMLEncoding() == null) {
            result.setXMLEncoding("UTF-8");
        }

        return result;
	}

	private static PropertiesUtils getPropertiesUtils() {
		if (propertiesUtils == null) {
			propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
		}
		return propertiesUtils;
	}
	
	private static ILogSender getLogSender() {
		if (logSender == null) {
			logSender = (ILogSender) SpringContextUtil.getBean("defaultLogSender");
		}
		return logSender;
	}
	private static void setAreaJianp(){
		areas.put("811", "beijing");//北京
		areas.put("812", "tianjing");//
		areas.put("813", "hebei");
		areas.put("814", "shxi");
		areas.put("815", "neimenggu");
		areas.put("821", "liaoning");
		areas.put("822", "jilin");
		areas.put("823", "heilongjiang");
		areas.put("831", "shanghai");
		areas.put("832", "jiangsu");
		areas.put("833", "zhejiang");
		areas.put("834", "anhui");
		areas.put("835", "fujian");
		areas.put("836", "jiangxi");
		areas.put("837", "shandong");
		areas.put("841", "henan");
		areas.put("842", "hubei");
		areas.put("843", "hunan");
		areas.put("844", "guangdong");
		areas.put("845", "guangxi");
		areas.put("846", "hainan");
		areas.put("850", "chongqing");
		areas.put("851", "sichuang");
		areas.put("852", "guizhou");
		areas.put("853", "yunnan");
		areas.put("854", "xizang");
		areas.put("861", "shanxi");
		areas.put("862", "gansu");
		areas.put("863", "qinghai");
		areas.put("864", "ningxia");
		areas.put("865", "xinjiang");
		areas.put("899", "xuni");//虚拟省
	}
	private static String getAreaJianp(String areaId){
		String areaIdStr=StringUtils.substring(areaId, 0, 3);
		return areas.get(areaIdStr);
	}
	public static void main(String[] args) throws Exception {

		Map<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("acctNbr", "13301543143");
		paramMap.put("identityCd", "");
		paramMap.put("areaId", "2,74,77,20,21,75,1000,23,76");
		paramMap.put("identityNum", "");
		paramMap.put("staffId", "1001");
		// String paramString = JsonUtil.toString(paramMap);
		// String paramString =
		// "{\"acctNbr\":\"13301543143\",\"identityCd\":\"\",\"areaId\":\"2,74,77,20,21,75,1000,23,76\",\"identityNum\":\"\",\"staffId\":\"1001\"}";
		// String paramString =
		// "{\"acctNbr\":\"13301543143\",\"identityCd\":\"\",\"areaId\":\"2,74,77,20,21,75,1000,23,76\",\"identityNum\":\"\",\"staffId\":\"1001\"}";
		String paramString = JsonUtil.toString(paramMap);
		// paramString = paramString.replaceAll("\"", "\\\\\"");
		log.debug("paramString: {}", paramString);
		// 调用http服务
		String url = "http://192.168.111.35:8885/SRHttpServiceWeb/service/";
		String method = "service/intf.custService/queryCust";
		HttpPost post = new HttpPost(url + method);
		post.addHeader("Content-Type", "application/json");
		HttpEntity entity = null;
		String jsonString = paramString;
		// String jsonString = "{\"jsonString\":\"" + paramString+ "\"}";
		// String jsonString =
		// {"jsonString":"{\"acctNbr\":\"13301543143\",\"identityCd\":\"\",\"areaId\":\"2,74,77,20,21,75,1000,23,76\",\"identityNum\":\"\",\"staffId\":\"1001\"}"}

		log.debug(jsonString);
		entity = new StringEntity(jsonString, ENCODING);
		post.setEntity(entity);
		HttpClient httpclient = MyHttpclient.getInstance().getHttpclient();

		HttpResponse httpresponse = httpclient.execute(post);

		entity = httpresponse.getEntity();
		String retnJson = EntityUtils.toString(entity, ENCODING);
		// 返回成功
		if (httpresponse.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
			log.debug("success:{}", retnJson);
		} else {
			log.debug("error:{}", retnJson);
		}

		post.abort();// 连接停止，释放资源
		try {
			if (null != entity) {
				EntityUtils.consume(entity);
			}

		} catch (IOException e) {

		}
		// String serviceCode = "orderParamQuery";
		// String str = getInvokeWay(serviceCode);
		// System.out.println(str);

		// String ret = "";
		// try {
		// Service service = new Service();
		// Call call = (Call) service.createCall();
		//
		// call.setTargetEndpointAddress( new java.net.URL(url) );
		// //设置命名空间与调用方法
		// call.setOperationName(new QName(qName, methodName)); //前置机命名空间、方法名
		// //把加密好的ss2作为入参，ret为返回值
		// ret = (String) call.invoke( new Object[] { str } );
		// } catch (Exception e) {
		// System.err.println(e.toString());
		// }
		// System.out.println(ret);
	}
	/**
	 * 调用日志平台记录SP_BUSI_RUN_LOG日志
	 * @param logmap
	 *            日志报文
	 * @param flowNum
	 *            流水号
	 * @param optFlowNum
	 *            门户层操作流水号
	 * @param sessionStaff
	 *            sessionStaff
	 */
	public static void callLogService(Map<String, Object> logmap,String flowNum,SessionStaff sessionStaff) {
		try {
//			log.debug("日志平台调用前入参为：" + JsonUtil.buildNormal().objectToJson(logmap));
			logSender.sendLog2DB("SP_BUSI_RUN_LOG", logmap,null);
//			log.debug("日志平台调用成功！入参为：" + JsonUtil.buildNormal().objectToJson(logmap));
		} catch (Exception e) {
			log.error("日志记录异常", e);
		}
	}
	/**
	 * 调用eop接口 - 代理商校验接口 
	 * 
	 * @param dataBusMap
	 *            入参
	 * @param serviceCode
	 *            　服务层的服务编码
	 * @param optFlowNum
	 *            平台编码，用于记录日志
	 * @param sessionStaff
	 *            员工Session对象
	 * @return DataBus 返回
	 * @throws IOException 
	 * @throws DocumentException 
	 * @throws Exception
	 */
	public static DataBus callServiceCardFiveSys(Map<String, Object> dataBusMap,
			String serviceCode, String optFlowNum, SessionStaff sessionStaff)
			throws InterfaceException, IOException, Exception {
		/*
		 * 1、数据路由关键字，根据此标识读取不同数据源的配置数据，为空则读取默认数据源的配置数据；
		 * 2、优先读取sessionStaff中的路由参数,如果为空则从入参dataBusMap中读取；
		 */
		
		String dbKeyWord = sessionStaff == null ? null : sessionStaff.getDbKeyWord();
		if(StringUtils.isBlank(dbKeyWord)){
			dbKeyWord = MapUtils.getString(dataBusMap, DATABUS_DBKEYWORD,"");
			dataBusMap.remove(DATABUS_DBKEYWORD);
		}
		
		Map<String,Object> ContractRoot = (Map<String, Object>) dataBusMap.get("ContractRoot");
		Map<String,Object> TcpCont = (Map<String, Object>) ContractRoot.get("TcpCont");
		
		
		
		String AppKey = SysConstant.CSB_SRC_SYS_ID_LTE;
		String TransactionID = "";
		String ymdStr = DateFormatUtils.format(new Date(), "yyyyMMdd");
		String str10 = "";
		String nonce = RandomStringUtils.randomNumeric(5); //随机字符串
		DataBus _db = null;
		_db = ServiceClient.callService(new HashMap(), PortalServiceCode.SERVICE_GET_LOG_SEQUENCE, null, sessionStaff);
		str10 = nonce + String.format("%05d", _db.getReturnlmap().get("logSeq"));
		TransactionID = AppKey+ymdStr+str10;
	    TcpCont.put("TransactionID", TransactionID);
		String ReqTime = DateFormatUtils.format(new Date(), "yyyyMMddHHmmss");
		TcpCont.put("AppKey", AppKey);
		TcpCont.put("ReqTime", ReqTime);
		
//		//开始拼接签名sign
		Map<String,Object> svcCont = (Map<String, Object>) ContractRoot.get("SvcCont");

		
		
		String svcString=JsonUtil.toString(svcCont);
		String signKey=TransactionID+"\"SvcCont\":"+svcString+MDA.SecretKey.toString();
		String sign=AESUtils.getMD5Str(signKey);
		TcpCont.put("Sign", sign);
		TcpCont.put("Method", serviceCode);
		TcpCont.put("Version", "V1.0");
		//签名串结束
		DataBus db = new DataBus();
		db = ServiceClient.initDataBus(sessionStaff);
		long beginTime = System.currentTimeMillis();
//		String appDesc = propertiesUtils.getMessage(SysConstant.APPDESC);
//		if (sessionStaff != null && SysConstant.APPDESC_MVNO.equals(appDesc)) {
//			dataBusMap.put("distributorId", sessionStaff.getPartnerId());
//		}
//		String transactionId = UIDGenerator.getRand();
//		dataBusMap.put("transactionId", transactionId);
//		if (StringUtils.isEmpty(optFlowNum)) {
//			optFlowNum = transactionId;
//		}
		// 开始调用
		request = ((ServletRequestAttributes)RequestContextHolder.getRequestAttributes()).getRequest();
		String paramString = "";
		paramString = JsonUtil.toString(dataBusMap);
		String paramJson="";
		String retnJson = "";
		String rawRetn = "";
		String intfUrl = "";
		String csbFlag = propertiesUtils.getMessage(SysConstant.CSB_FLAG);
		String asyncFlag = propertiesUtils.getMessage(SysConstant.ASYNC_FLAG);
		boolean asyncWay = false;
		if(MDA.CSB_HTTP_CMP_URL.toString()!=null && MDA.CSB_HTTP_CMP_URL.toString().length()>0){
	        	intfUrl = MDA.CSB_HTTP_CMP_URL.toString();
	        			//"http://10.128.90.194:8201/LTE-CSB/HttpAPIService";  
	        			//"http://10.128.90.195:7003/CmpWeb/cmpService/queryRelInstInfo";
	    }
//		if (SysConstant.ON.equals(csbFlag)) {
//			intfUrl = propertiesUtils.getMessage(URL_KEY + "." + CSB_HTTP);
//		}else {
//			intfUrl = getNeeded(dbKeyWord,URL_KEY, CMP_PREFIX);
//			if(serviceCode == PortalServiceCode.QRY_CERTPHONENUM_REL){
//				serviceCode = "/queryCmcCertNumRel";
//			}else if(serviceCode ==PortalServiceCode.MOD_CERTPHONENUM_REL){
//				serviceCode = "/changeCmcCertNumRel";
//			}
//			intfUrl += serviceCode;
       /// }
      //  String method = serviceCode;
      //  serviceCode = intfUrl;
		String resultCode = "";
		String resultMsg = "";
//		String errCode = "";
//		String errorStack = "";
		String prefix = "";
		String logSeqId = "";
		Map<String, Object> rootMap =  new HashMap();
		try {
		        String sys = "一证五号系统";
				String contentType = JSON_CONTENT_TYPE;
				db = httpCall(sys, serviceCode, paramString, intfUrl, contentType, optFlowNum, sessionStaff, beginTime, logSeqId);
				rawRetn = db.getResultMsg();
//				Node svcCont = checkCSBXml(serviceCode, rawRetn, paramString);	
//				retnJson = svcCont.getText();
				retnJson = rawRetn;
			//	log.debug("retnJson:{}", retnJson.length() > 3000 ? retnJson.substring(0, 3000) : retnJson);
				
				if (StringUtils.isBlank(retnJson)) {
					db.setResultCode(ResultCode.R_INTERFACE_EXCEPTION);
					db.setResultMsg("接口返回为空");
					return db;
				}
	
				rootMap = JsonUtil.toObject(retnJson, Map.class);
				rootMap.put("logSeqId", logSeqId);
				Object obj = MapUtils.getObject(rootMap, "ContractRoot", null);
				if (obj != null) {
					rootMap = (Map<String, Object>) obj;
					Map<String, Object> tcpContMap = (Map<String, Object>) rootMap.get("TcpCont");
					Map<String, Object> svcContMap = new HashMap();
					if(rootMap.get("SvcCont") instanceof Map){
						svcContMap = (Map<String, Object>) rootMap.get("SvcCont");
					}
					if(MapUtils.isNotEmpty(tcpContMap)){
						Map respMap=(Map) tcpContMap.get("Response");
						String respCode=(String) respMap.get("RspCode");
						if(ResultCode.RES_SUCCESS.equals(respCode)){
							resultCode = "0";
							resultMsg = (String)respMap.get("RspDesc");
							db.setResultCode(ResultCode.R_SUCC);
							if (MapUtils.isNotEmpty(svcContMap)) {
								db.setReturnlmap((Map<String, Object>)svcContMap.get("result"));
							}
						}else{
							resultCode = respCode;
							resultMsg = (String)respMap.get("RspDesc");
							db.setResultCode(ResultCode.R_FAIL);
 						}
					}
					
//					if (MapUtils.isNotEmpty(svcContMap)) {
//						Map respMap=(Map) tcpContMap.get("Response");
//							String respCode=(String) respMap.get("RspCode");
//							if(ResultCode.RES_SUCCESS.equals(respCode)){
//								resultCode = "0";
//								resultMsg = (String)respMap.get("RspDesc");
//								db.setResultCode(ResultCode.R_SUCC);
//								db.setReturnlmap(svcContMap);
//							}else{
//								resultCode = respCode;
//								resultMsg = (String)respMap.get("RspDesc");
//								db.setResultCode(ResultCode.R_FAIL);
//
//							}
//                      }
				} else {
//					resultCode = (String) rootMap.get("resultCode");
//					resultMsg = (String) rootMap.get("resultMsg");
//					if(resultCode==null && resultMsg == null){
//						resultCode = "-11111";
//						resultMsg = rootMap.toString();
//					}
//					db.setResultCode(resultCode);
//					db.setResultMsg(resultMsg);
//					db.setReturnlmap(rootMap);
				}
				log.debug("调用回参:{}", retnJson);
	
		} finally {
			db.setResultCode(resultCode);
			db.setResultMsg(resultMsg);
			db.setParammap(dataBusMap);
//			db.setReturnlmap(rootMap);
			if (sessionStaff != null) {
				callServiceLog(logSeqId, dbKeyWord, db, optFlowNum, serviceCode, intfUrl, sessionStaff, paramString, rawRetn, beginTime, System.currentTimeMillis(),retnJson,paramJson,prefix);
			}
		}
		db.setBusiFlowId(TransactionID);
		return db;
	}	
	/**
	 * 调用Eop接口(一证五号，人证平台) - 考虑以后移到服务层
	 * 
	 * @param dataBusMap
	 *            入参
	 * @param serviceCode
	 *            　服务层的服务编码
	 * @param optFlowNum
	 *            平台编码，用于记录日志
	 * @param sessionStaff
	 *            员工Session对象
	 * @return DataBus 返回
	 * @throws IOException 
	 * @throws DocumentException 
	 * @throws Exception
	 */
	public static DataBus callEopService(Map<String, Object> dataBusMap,
			String serviceCode, String optFlowNum, SessionStaff sessionStaff,String sys,String intfUrl)
			throws InterfaceException, IOException, Exception {
		/*
		 * 1、数据路由关键字，根据此标识读取不同数据源的配置数据，为空则读取默认数据源的配置数据；
		 * 2、优先读取sessionStaff中的路由参数,如果为空则从入参dataBusMap中读取；
		 */
		String dbKeyWord = sessionStaff == null ? null : sessionStaff.getDbKeyWord();
		if(StringUtils.isBlank(dbKeyWord)){
			dbKeyWord = MapUtils.getString(dataBusMap, DATABUS_DBKEYWORD,"");
			dataBusMap.remove(DATABUS_DBKEYWORD);
		}
		Map<String,Object> ContractRoot = (Map<String, Object>) dataBusMap.get("ContractRoot");
		Map<String,Object> TcpCont = (Map<String, Object>) ContractRoot.get("TcpCont");
		String AppKey = SysConstant.CSB_SRC_SYS_ID_LTE;
		String TransactionID = "";
		String ymdStr = DateFormatUtils.format(new Date(), "yyyyMMdd");
		String tranid = "";
		Map tranMap = new HashMap();
		DataBus db = null;
		try{
			db = ServiceClient.callService(dataBusMap, PortalServiceCode.SERVICE_GET_TRANID, null, sessionStaff);
			if("POR-0000".equals(db.getResultCode().toString())){
				tranMap = db.getReturnlmap();
				tranid = (String.valueOf(tranMap.get("TranId")));
			}else{
				throw new InterfaceException(ErrType.ECSP, PortalServiceCode.SERVICE_GET_TRANID, String.valueOf(db.getResultMsg()), JsonUtil.toString(dataBusMap));
			}
		}catch (Exception e) {
			throw new InterfaceException(ErrType.ECSP, PortalServiceCode.SERVICE_GET_TRANID, String.valueOf(db.getResultMsg()), JsonUtil.toString(dataBusMap));
        }
		
		TransactionID = AppKey+ymdStr+tranid;
	    TcpCont.put("TransactionID", TransactionID);
		String ReqTime = DateFormatUtils.format(new Date(), "yyyyMMddHHmmss");
		TcpCont.put("AppKey", AppKey);
		TcpCont.put("ReqTime", ReqTime);
		//开始拼接签名sign
		Map<String,Object> svcCont = (Map<String, Object>) ContractRoot.get("SvcCont");
        String svcString=JsonUtil.toString(svcCont);
		String signKey=TransactionID+"\"SvcCont\":"+svcString+MDA.SecretKey.toString();
		String sign=AESUtils.getMD5Str(signKey);
		TcpCont.put("Sign", sign);
		TcpCont.put("Method", serviceCode);
		Map<String, Object> fzConfig = (HashMap<String, Object>) MDA.FACE_VERIFY_FLAG
				.get("FACE_VERIFY_"
						+ sessionStaff.getCurrentAreaId()
								.substring(0, 3));
		if("ON".equals(MapUtils.getString(fzConfig, "PROVINCE_FACE_VERIFY_FLAG","")) && "OFF".equals(MapUtils.getString(fzConfig, "FACE_VERIFY_SWITCH",""))){
			TcpCont.put("Version", "V1.1");
		}else{
			TcpCont.put("Version", "V1.0");
		}
		//签名串结束
		long beginTime = System.currentTimeMillis();

	    // 开始调用
		request = ((ServletRequestAttributes)RequestContextHolder.getRequestAttributes()).getRequest();
		String paramString = "";
		paramString = JsonUtil.toString(dataBusMap);
		String paramJson="";
		String retnJson = "";
		String rawRetn = "";
		String resultCode = "";
		String resultMsg = "";
        String prefix = "";
		String logSeqId = "";
		Map<String, Object> rootMap =  new HashMap();
		try {
		        String contentType = JSON_CONTENT_TYPE;
				db = httpCall(sys, serviceCode, paramString, intfUrl, contentType, optFlowNum, sessionStaff, beginTime, logSeqId);
			    rawRetn = db.getResultMsg();
                retnJson = rawRetn;
			    if (StringUtils.isBlank(retnJson)) {
					db.setResultCode(ResultCode.R_INTERFACE_EXCEPTION);
					db.setResultMsg("接口返回为空");
					return db;
				}
	
				rootMap = JsonUtil.toObject(retnJson, Map.class);
				rootMap.put("logSeqId", logSeqId);
				Object obj = MapUtils.getObject(rootMap, "ContractRoot", null);
				if (obj != null) {
					rootMap = (Map<String, Object>) obj;
					Map<String, Object> tcpContMap = (Map<String, Object>) rootMap.get("TcpCont");
					Map<String, Object> svcContMap = new HashMap();
					if(rootMap.get("SvcCont") instanceof Map){
						svcContMap = (Map<String, Object>) rootMap.get("SvcCont");
					}
					if(MapUtils.isNotEmpty(tcpContMap)){
						svcContMap.put("tranId",tcpContMap.get("TransactionID"));
						Map respMap=(Map) tcpContMap.get("Response");
						String respCode=(String) respMap.get("RspCode");
						if(ResultCode.RES_SUCCESS.equals(respCode)){
							resultCode = "0";
							resultMsg = (String)respMap.get("RspDesc");
							db.setResultCode(ResultCode.R_SUCC);
							if (MapUtils.isNotEmpty(svcContMap)) {
								db.setReturnlmap((Map<String, Object>)svcContMap.get("result"));
								if(MapUtils.isEmpty((Map<String, Object>)svcContMap.get("result")) && "人证平台".equals(sys)){
									db.setReturnlmap(svcContMap);
								}
							}
						}else{
							resultCode = respCode;
							resultMsg = (String)respMap.get("RspDesc");
							db.setResultCode(ResultCode.R_FAIL);
							db.setReturnlmap(svcContMap);
 						}
					}
					
//					if (MapUtils.isNotEmpty(svcContMap)) {
//						Map respMap=(Map) tcpContMap.get("Response");
//							String respCode=(String) respMap.get("RspCode");
//							if(ResultCode.RES_SUCCESS.equals(respCode)){
//								resultCode = "0";
//								resultMsg = (String)respMap.get("RspDesc");
//								db.setResultCode(ResultCode.R_SUCC);
//								db.setReturnlmap(svcContMap);
//							}else{
//								resultCode = respCode;
//								resultMsg = (String)respMap.get("RspDesc");
//								db.setResultCode(ResultCode.R_FAIL);
//
//							}
//                      }
				} else {
//					resultCode = (String) rootMap.get("resultCode");
//					resultMsg = (String) rootMap.get("resultMsg");
//					if(resultCode==null && resultMsg == null){
//						resultCode = "-11111";
//						resultMsg = rootMap.toString();
//					}
//					db.setResultCode(resultCode);
//					db.setResultMsg(resultMsg);
//					db.setReturnlmap(rootMap);
				}
				log.debug("调用回参:{}", retnJson);
	
		} finally {
			db.setResultCode(resultCode);
			db.setResultMsg(resultMsg);
			db.setParammap(dataBusMap);
//			db.setReturnlmap(rootMap);
			if (sessionStaff != null) {
				callServiceLog(logSeqId, dbKeyWord, db, optFlowNum, serviceCode, intfUrl, sessionStaff, paramString, rawRetn, beginTime, System.currentTimeMillis(),retnJson,paramJson,prefix);
			}
		}
		db.setBusiFlowId(TransactionID);
		return db;
	}	
	/**
	 * 调用中台接口
	 * 
	 * @param dataBusMap
	 *            入参
	 * @param serviceCode
	 *            　服务层的服务编码
	 * @param optFlowNum
	 *            平台编码，用于记录日志
	 * @param sessionStaff
	 *            员工Session对象
	 * @return DataBus 返回
	 * @throws IOException 
	 * @throws DocumentException 
	 * @throws Exception
	 */
	public static DataBus callServiceMiddleSys(Map<String, Object> dataBusMap,
			String serviceCode, String optFlowNum, SessionStaff sessionStaff)
			throws InterfaceException, IOException, Exception {
		/*
		 * 1、数据路由关键字，根据此标识读取不同数据源的配置数据，为空则读取默认数据源的配置数据；
		 * 2、优先读取sessionStaff中的路由参数,如果为空则从入参dataBusMap中读取；
		 */
		
		String dbKeyWord = sessionStaff == null ? null : sessionStaff.getDbKeyWord();
		if(StringUtils.isBlank(dbKeyWord)){
			dbKeyWord = MapUtils.getString(dataBusMap, DATABUS_DBKEYWORD,"");
			dataBusMap.remove(DATABUS_DBKEYWORD);
		}
		
		Map<String,Object> ContractRoot = (Map<String, Object>) dataBusMap.get("ContractRoot");
		Map<String,Object> TcpCont = (Map<String, Object>) ContractRoot.get("TcpCont");
		String AppKey = SysConstant.CSB_SRC_SYS_ID_APP;
		String TransactionID = "";
		if("order.prod.salesorder".equals(serviceCode)){
			TransactionID = (String) dataBusMap.get("TransactionID");
		}else{
			String ymdStr = DateFormatUtils.format(new Date(), "yyyyMMdd");
			String str10 = "";
			String nonce = RandomStringUtils.randomNumeric(5); //随机字符串
			DataBus _db = null;
			_db = ServiceClient.callService(new HashMap(), PortalServiceCode.SERVICE_GET_LOG_SEQUENCE, null, sessionStaff);
			str10 = nonce + String.format("%05d", _db.getReturnlmap().get("logSeq"));
			TransactionID = AppKey+ymdStr+str10;
		}
		TcpCont.put("TransactionID", TransactionID);
		String ReqTime = DateFormatUtils.format(new Date(), "yyyyMMddHHmmss");
		TcpCont.put("AppKey", AppKey);
		TcpCont.put("ReqTime", ReqTime);
		//开始拼接签名sign
		Map<String,Object> svcCont = (Map<String, Object>) ContractRoot.get("SvcCont");
		String svcString=JsonUtil.toString(svcCont);
		String signKey=TransactionID+"\"SvcCont\":"+svcString+MDA.SecretKey.toString();
		String sign=AESUtils.getMD5Str(signKey);
		TcpCont.put("Sign", sign);
		//签名串结束
		DataBus db = new DataBus();
		db = ServiceClient.initDataBus(sessionStaff);
		long beginTime = System.currentTimeMillis();
//		String appDesc = propertiesUtils.getMessage(SysConstant.APPDESC);
//		if (sessionStaff != null && SysConstant.APPDESC_MVNO.equals(appDesc)) {
//			dataBusMap.put("distributorId", sessionStaff.getPartnerId());
//		}
//		String transactionId = UIDGenerator.getRand();
//		dataBusMap.put("transactionId", transactionId);
//		if (StringUtils.isEmpty(optFlowNum)) {
//			optFlowNum = transactionId;
//		}
		// 开始调用
		request = ((ServletRequestAttributes)RequestContextHolder.getRequestAttributes()).getRequest();
		String paramString = "";
		paramString = JsonUtil.toString(dataBusMap);
		String paramJson="";
		String retnJson = "";
		String rawRetn = "";
		String intfUrl = "";
        if(MDA.CSB_HTTP_MIDDLE_URL.toString()!=null && MDA.CSB_HTTP_MIDDLE_URL.toString().length()>0){
        	intfUrl = MDA.CSB_HTTP_MIDDLE_URL.toString();
        }
        String method = serviceCode;
        serviceCode = intfUrl;
		String resultCode = "";
		String resultMsg = "";
//		String errCode = "";
//		String errorStack = "";
		String prefix = "";
		String logSeqId = "";
		String invokeWay = "SIMULATE";
		Map<String, Object> rootMap =  new HashMap();
		try {
		
			if (HTTP_WAY.equals(invokeWay)) {
				//预留
			} else if (WS_WAY.equals(invokeWay)) {
	
			} else if (SIMULATE_WAY.equals(invokeWay)) {
				String sys = "翼管店系统";
				String contentType = JSON_CONTENT_TYPE;
				db = httpCall(sys, serviceCode, paramString, intfUrl, contentType, optFlowNum, sessionStaff, beginTime, logSeqId);
				rawRetn = db.getResultMsg();
//				Node svcCont = checkCSBXml(serviceCode, rawRetn, paramString);
//				retnJson = svcCont.getText();
				retnJson = rawRetn;
				log.debug("retnJson:{}", retnJson.length() > 3000 ? retnJson.substring(0, 3000) : retnJson);
				
				if (StringUtils.isBlank(retnJson)) {
					db.setResultCode(ResultCode.R_INTERFACE_EXCEPTION);
					db.setResultMsg("接口返回为空");
					return db;
				}
	
				rootMap = JsonUtil.toObject(retnJson, Map.class);
				rootMap.put("logSeqId", logSeqId);
				Object obj = MapUtils.getObject(rootMap, "ContractRoot", null);
				if (obj != null) {
					rootMap = (Map<String, Object>) obj;
					Map<String, Object> tcpContMap = (Map<String, Object>) rootMap.get("TcpCont");
					Map<String, Object> svcContMap = (Map<String, Object>) rootMap.get("SvcCont");
					if(!"order.prod.salesorder".equals(method)){
						Map respMap=(Map) tcpContMap.get("Response");
						String respCode=(String) respMap.get("RspCode");
						if(ResultCode.RES_SUCCESS.equals(respCode)){
							resultCode = "0";
							resultMsg = (String)respMap.get("RspDesc");
							db.setResultCode(ResultCode.R_SUCC);
							db.setReturnlmap(svcContMap);
						}else{
							resultCode = respCode;
							resultMsg = (String)respMap.get("RspDesc");
							db.setResultCode(ResultCode.R_FAIL);
//						resultMsg = (String) respMap.get("RspDesc");
						}
					}
					
					if (MapUtils.isNotEmpty(svcContMap)) {
						if("order.prod.salesorder".equals(method)){
							Map<String, Object> resultMap = (Map<String, Object>) svcContMap.get("ResultObj");
							resultCode = (String)resultMap.get("ResultCode");
							resultMsg = (String)resultMap.get("ResultMsg");
							db.setResultCode(resultCode);
							db.setResultMsg(resultMsg);
							db.setReturnlmap(svcContMap);
						}else{
							Map<String, Object> resultMap = (Map<String, Object>) svcContMap.get("Result");
							if (MapUtils.isNotEmpty(svcContMap)) {
								resultCode = (String) resultMap.get("ResultCode");
								resultMsg = (String) resultMap.get("ResultMsg");
								db.setResultCode(resultCode);
								db.setResultMsg(resultMsg);
								db.setReturnlmap(svcContMap);
							}
						}
					} else {//有的接口不返回svccont,但是成功
						if("order.prod.salesorder".equals(method)){
							Map respMap=(Map) tcpContMap.get("Response");
							String respCode=(String) respMap.get("RspCode");
							if(ResultCode.RES_SUCCESS.equals(respCode)){
								resultCode = "0";
								resultMsg = (String)respMap.get("RspDesc");
								db.setResultCode(ResultCode.R_SUCC);
								db.setReturnlmap(tcpContMap);
							}else{
								resultCode = respCode;
								resultMsg = (String)respMap.get("RspDesc");
								db.setResultCode(ResultCode.R_FAIL);
//							resultMsg = (String) respMap.get("RspDesc");
							}
						}
//						Map respMap=(Map) tcpContMap.get("Response");
//						String respCode=(String) respMap.get("RspCode");
//						if(ResultCode.RES_SUCCESS.equals(respCode)){
//							resultCode = "0";
//							db.setResultCode(ResultCode.R_SUCC);
//						}else{						
//						db.setResultCode(ResultCode.R_INTERFACE_PARAM_MISS);
//						resultMsg = (String) respMap.get("RspDesc");
//						}
					}
				} else {
					resultCode = (String) rootMap.get("resultCode");
					resultMsg = (String) rootMap.get("resultMsg");
					db.setResultCode(resultCode);
					db.setResultMsg(resultMsg);
					db.setReturnlmap(rootMap);
				}
				log.debug("调用回参:{}", retnJson);
	
			} else {
	
			}
		}catch (Exception e) {
			
		} finally {
			db.setResultCode(resultCode);
			db.setResultMsg(resultMsg);
			db.setParammap(dataBusMap);
//			db.setReturnlmap(rootMap);
			if (sessionStaff != null) {
				callServiceLog(logSeqId, dbKeyWord, db, optFlowNum, serviceCode, intfUrl, sessionStaff, paramString, rawRetn, beginTime, System.currentTimeMillis(),retnJson,paramJson,prefix);
			}
		}
		db.setBusiFlowId(TransactionID);
		return db;
	}	
	private static String getRetnJson(String serviceCode,String filePath) {
		return MySimulateData.getInstance().getJson(serviceCode,filePath);
	}	
	
	/**
	 * 调用日志平台记录tableName日志
	 * @param logmap
	 *            日志报文
	 * @param flowNum
	 *            流水号
	 * @param optFlowNum
	 *            门户层操作流水号
	 * @param sessionStaff
	 *            sessionStaff
	 */
	public static void callLogSerTOLogDB(String tableName,Map<String, Object> logmap,String flowNum,SessionStaff sessionStaff) {
		try {
//			log.debug("日志平台调用前入参为：" + JsonUtil.buildNormal().objectToJson(logmap));
			logSender.sendLog2DB(tableName, logmap,null);
//			log.debug("日志平台调用成功！入参为：" + JsonUtil.buildNormal().objectToJson(logmap));
		} catch (Exception e) {
			log.error("日志记录异常", e);
		}
	}
	
	public static String getTcpCont(Map<String,Object> csbMap,String srcTransactionNbr,String appDesc) {
		StringBuffer respXml = new StringBuffer();
		String srcSysID = SysConstant.CSB_SRC_SYS_ID_LTE;
		String srcSysSign=MapUtils.getString(csbMap, "srcSysSign");
		String srcSysSign2=srcSysSign;
		if(srcSysSign==null||"".equals(srcSysSign)){
			srcSysSign2=SysConstant.CSB_SRC_SYS_SIGN;
		}
		if (SysConstant.APPDESC_MVNO.equals(appDesc)) {
			srcSysID = SysConstant.CSB_SRC_SYS_ID_MVNO;
		} else if (SysConstant.APPDESC_LTE.equals(appDesc)) {
			srcSysID = SysConstant.CSB_SRC_SYS_ID_LTE;
		}
		HttpSession session = ServletUtils.getSession(request);
		if (session != null && "1".equals(session.getAttribute(SysConstant.SESSION_KEY_APP_FLAG))) {
			srcSysID = SysConstant.CSB_SRC_SYS_ID_APP;
			if(srcSysSign==null||"".equals(srcSysSign)){
				srcSysSign2=SysConstant.CSB_SRC_SYS_SIGN_YSX;
			}
		}
		respXml.append("<TcpCont>");
		respXml.append("<BusCode>"+MapUtils.getString(csbMap, "BusCode")+"</BusCode>");
		respXml.append("<ServiceCode>" + MapUtils.getString(csbMap, "ServiceCode") + "</ServiceCode>");
		respXml.append("<ServiceContractVer>" + MapUtils.getString(csbMap, "ServiceContractVer") + "</ServiceContractVer>");
		respXml.append("<ActionCode>"+SysConstant.CSB_ACTION_CODE+"</ActionCode>");
		respXml.append("<TransactionID>" +getTranID(srcSysID)+srcTransactionNbr + "</TransactionID>");	
		respXml.append("<ServiceLevel>"+SysConstant.CSB_SERVICE_LEVEL+"</ServiceLevel>");
		respXml.append("<SrcOrgID>"+SysConstant.CSB_ORG_ID_GROUP+"</SrcOrgID>");
		respXml.append("<SrcSysID>"+srcSysID+"</SrcSysID>");
		respXml.append("<SrcSysSign>"+srcSysSign2+"</SrcSysSign>");
		respXml.append("<DstOrgID>"+SysConstant.CSB_ORG_ID_GROUP+"</DstOrgID>");
		respXml.append("<DstSysID>"+ MapUtils.getString(csbMap, "DstSysID") +"</DstSysID>");
		respXml.append("<ReqTime>" + DateFormatUtils.format(new Date(), "yyyyMMddHHmmss") + "</ReqTime>");
		respXml.append("</TcpCont>");		
		return respXml.toString();
	}
	
	private static String getTranID(String id) {
		// 【10位系统/平台编码代码】+【8位日期编码YYYYMMDD】＋【10位流水号】
		StringBuffer sb = new StringBuffer();
		sb.append(id).append(DateFormatUtils.format(new Date(), "yyyyMMdd"));
//				.append(getHourInMillis())
//				.append(RandomStringUtils.randomNumeric(2));
		Calendar.getInstance().getTimeInMillis();
		return sb.toString();
	}
	
	public static void saveLog(ServiceLog serviceLog) {
		if(serviceLog == null){
			log.error("门户日志记录错误，入参serviceLog为空");
			return;
		}
		if(serviceLog.getRequest() == null){
			serviceLog.setRequest(((ServletRequestAttributes)RequestContextHolder.getRequestAttributes()).getRequest());
		}
		
		Map<String, Object> logObj = new HashMap<String, Object>();
		Map<String, Object> logClobObj = new HashMap<String, Object>();
		String logLevel = propertiesUtils.getMessage(serviceLog.getPrefix() + " - " + serviceLog.getServiceCode());
		
		if(!"1".equals(logLevel)){
			if("2".equals(logLevel)){
				if(ResultCode.R_SUCC.equals(serviceLog.getDataBus().getResultCode()) || 
						ResultCode.R_SUCCESS.equals(serviceLog.getDataBus().getResultCode())|| 
						ResultCode.RES_SUCCESS.equals(serviceLog.getDataBus().getResultCode())){
					return;
				}
			}else{
				return;
			}
		}
		
		try {
			//0 成功  1  错误  2  异常
			if(ResultCode.R_SUCC.equals(serviceLog.getDataBus().getResultCode()) || ResultCode.R_SUCCESS.equals(serviceLog.getDataBus().getResultCode()) || ResultCode.RES_SUCCESS.equals(serviceLog.getDataBus().getResultCode())){
				serviceLog.setErrorCode(ResultCode.R_SUCC);
			} else if (ResultCode.R_FAIL.equals(serviceLog.getDataBus().getResultCode()) || ResultCode.R_FAILURE.equals(serviceLog.getDataBus().getResultCode()) || ResultCode.R_QUERY_FAIL.equals(serviceLog.getDataBus().getResultCode())) {
				serviceLog.setErrorCode(ResultCode.R_FAILURE);
			} else {
				serviceLog.setErrorCode("2");
			}
			//记录请求
			if(serviceLog.getRequest() != null){
				try{
					logObj.put("LOCAL_ADDR", 	serviceLog.getLocalAddr());
					logObj.put("LOCAL_PORT", 	serviceLog.getLocalPort());
					logObj.put("REMOTE_ADDR", 	serviceLog.getRemoteAddr());
					logObj.put("REMOTE_PORT",	serviceLog.getRemotePort());
				} catch(Exception e){
					logObj.put("LOCAL_ADDR", 	e.getMessage());
					logObj.put("LOCAL_PORT", 	e.getMessage());
					logObj.put("REMOTE_ADDR", 	e.getMessage());
					logObj.put("REMOTE_PORT", 	e.getMessage());
				}
			}else{
				logObj.put("LOCAL_ADDR", 	"request is null");
				logObj.put("LOCAL_PORT", 	"request is null");
				logObj.put("REMOTE_ADDR", 	"request is null");
				logObj.put("REMOTE_PORT",	"request is null");
			}
			//记录基本信息
			logObj.put("IP", 			serviceLog.getIp());//这IP什么鬼
			logObj.put("OL_ID", 		serviceLog.getOlId());
			logObj.put("REMARK", 		serviceLog.getRemark());
			logObj.put("SO_NBR", 		serviceLog.getSoNbr());
			logObj.put("AREA_ID", 		serviceLog.getAreaId());
			logObj.put("INTF_URL", 		serviceLog.getIntfUrl());
			logObj.put("END_TIME", 		serviceLog.getEndTime());
			logObj.put("USE_TIME", 		serviceLog.getUseTime());
			logObj.put("TRANS_ID", 		serviceLog.getTransId());
			logObj.put("BUSI_TYPE", 	serviceLog.getBusiType());
			logObj.put("ROLE_CODE", 	serviceLog.getDataBus().getRoleCode());
			logObj.put("START_TIME", 	serviceLog.getBeginTime());
			logObj.put("ERROR_CODE", 	serviceLog.getErrorCode());
			logObj.put("LOG_SEQ_ID", 	serviceLog.getLogSeqId());
			logObj.put("RESULT_CODE", 	serviceLog.getDataBus().getResultCode());
			logObj.put("PORTAL_CODE", 	serviceLog.getDataBus().getPortalCode());
			logObj.put("INTF_METHOD",	serviceLog.getServiceCode());
			logObj.put("SERVICE_CODE", 	serviceLog.getServiceCode());
			logObj.put("SERV_RUN_NBR", 	serviceLog.getServRunNbr());
			logObj.put("BUSI_RUN_NBR", 	serviceLog.getBusiRunNbr());
			//记录员工
			logObj.put("STAFF_ID", 		serviceLog.getStaffId());
			logObj.put("STAFF_NAME", 	serviceLog.getStaffName());
			logObj.put("SESSION_ID", 	serviceLog.getSessionId());
			logObj.put("CHANNEL_ID", 	serviceLog.getChannelId());
			logObj.put("CHANNEL_NAME", 	serviceLog.getChannelName());
			//记录门户标识
			if("portal".equals(serviceLog.getPrefix())){
				logObj.put("TRANS_ID", serviceLog.getPortalId());
				logObj.put("BUSI_TYPE", StringUtils.isBlank(serviceLog.getServCode()) ? serviceLog.getMenuInfo() : serviceLog.getServCode());
			}
			//记录报文
			logClobObj.put("IN_PARAM", serviceLog.getParamStr());						
			logClobObj.put("OUT_PARAM", serviceLog.getReturnStr());
			//记录日志
			boolean isDefaultLog = true;
			if (MDA.PORTAL_SERVICE_LOG_P.contains(serviceLog.getServiceCode())) {
				isDefaultLog = false;
				logSender.sendLog2DB(SysConstant.PORTAL_SERVICE_LOG_P, logObj, logClobObj);
			}
			if (MDA.PORTAL_SERVICE_LOG_Y.contains(serviceLog.getServiceCode())) {
				isDefaultLog = false;
				logSender.sendLog2DB(SysConstant.PORTAL_SERVICE_LOG_Y, logObj, logClobObj);
			}
			if (MDA.PORTAL_SERVICE_LOG_W.contains(serviceLog.getServiceCode())) {
				isDefaultLog = false;
				logSender.sendLog2DB(SysConstant.PORTAL_SERVICE_LOG_W, logObj, logClobObj);
			}
			if (isDefaultLog){
				logSender.sendLog2DB(SysConstant.PORTAL_SERVICE_LOG, logObj, logClobObj);
			}
		} catch (Exception e) {
			log.error("日志记录异常", e);
		}
	}
	
	/**
	 * 查询云平台身份证信息
	 * 
	 * @param serverIp
	 *            云平台节点IP(上海或内蒙节点的电信内网IP)
	 * @param decodeId
	 *            云平台当次解码序列号,用来查询对应的身份证加密信息
	 * @throws InterfaceException 
	 */
	public static DataBus callCloudService(Map<String, Object> param,String serviceCode,String optFlowNum, SessionStaff sessionStaff) throws InterfaceException {
		DataBus db = new DataBus();
		String serverIp = MapUtils.getString(param, "serverIp");// 请求服务器ip
		String query =MapUtils.getString(param, "query");
		String appId = MapUtils.getString(param, "appId");
		String nonce = MapUtils.getString(param, "nonce");
		String timestamp = MapUtils.getString(param, "timestamp");
		String appSecret = propertiesUtils.getMessage("APP_SECRET"); //appId对应的加密密钥
		StringBuffer sbData = new StringBuffer();
	    sbData.append(appId).append(appSecret).append(query).append(nonce).append(timestamp);
	    String signature = DigestUtils.shaHex(sbData.toString());
	    param.put("signature", signature);
		param.put("query", query);
		String strParams = getFormatParams(param);
		// 拼接url要传递的参数.
		String url = serverIp+serviceCode + strParams;
		//开始调用httpclient
		HttpEntity entity = null;
		String retnJson = "";
		HttpResponse response = null;
		String logSeqId="";
		HttpGet httpGet =null;
		long startTime = System.currentTimeMillis();
		try {
			// 开始调用http服务
			httpGet=new HttpGet(url);
			log.debug("reqUrl:{}", url);
			log.debug("serviceCode:{},paramString:{}", serviceCode, strParams);
			// 添加标识ID 
			logSeqId = createLogSeqId(param, serviceCode,
					sessionStaff, null, "api", logSeqId);
			response = MyHttpclient.getInstance().getHttpclient().execute(httpGet);
			entity = response.getEntity();
			retnJson = EntityUtils.toString(entity, "UTF-8");
			// 返回成功
			if (response.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
				db.setResultCode(ResultCode.R_SUCC);
				db.setResultMsg(retnJson);
				Map<String, Object> rootMap = JsonUtil.toObject(retnJson, Map.class);
				db.setReturnlmap(rootMap);
			} else {
				String msg = "HTTP调用失败(http code:"
						+ response.getStatusLine().getStatusCode() + ")";
				log.error(msg + retnJson);
				Map<String, Object> paramMap = new HashMap<String, Object>();
				paramMap.put("paramString", strParams);
				db.setParammap(paramMap);
				msg = url + "\n" + msg + "\n" + retnJson;
				throw new InterfaceException(ErrType.OPPOSITE, serviceCode, msg, strParams, logSeqId);
			}
		} catch (IOException ioe) {
			log.error("HTTP调用异常", ioe);
			Map<String, Object> paramMap = new HashMap<String, Object>();
			paramMap.put("paramString", strParams);
			db.setParammap(paramMap);
			if (ioe instanceof SocketTimeoutException) {
				String msg = ioe.getMessage();
				if ("Read timed out".equals(msg)) {
					msg = url + "\n" + msg;
					throw new InterfaceException(ErrType.OPPOSITE, serviceCode, msg, strParams, logSeqId);
				}
			} else if (ioe.getCause() != null) {
				String msg = ioe.getCause().getMessage();
				if ("Connection timed out: connect".equals(msg)) {
					msg = url + "\n" + msg + "\n" + ioe.getMessage();
					throw new InterfaceException(ErrType.OPPOSITE, serviceCode, msg, strParams, logSeqId);
				}
			}
			
			throw new InterfaceException(ErrType.PORTAL, serviceCode, strParams, ioe, logSeqId);
		} catch (InterfaceException ie) {
			throw ie;
		} finally {
			if(httpGet!=null){
				httpGet.abort();// 连接停止，释放资源
			}
			try {
				if (null != entity) {
					EntityUtils.consume(entity);
				}
			} catch (IOException e) {
				log.error("HTTP调用释放资源异常", e);
			}
		}
		long useTime = System.currentTimeMillis() - startTime;
		log.debug("http call use time {} ms", useTime);
		if (sessionStaff != null) {
			callServiceLog(logSeqId, null, db, optFlowNum, serviceCode, url, sessionStaff, strParams, retnJson, startTime, System.currentTimeMillis(),retnJson,strParams,"api");
		}
		return db;
	}

	//将入参map转成&拼接
	private static String getFormatParams(Map<String,Object> paramsMap){
		StringBuffer paramsBuffer =new StringBuffer();
		String appId=MapUtils.getString(paramsMap, "appId");
		paramsBuffer.append("appId="+appId+"&");
		String timestamp=MapUtils.getString(paramsMap, "timestamp");
		paramsBuffer.append("timestamp="+timestamp+"&");
		String nonce=MapUtils.getString(paramsMap, "nonce");
		paramsBuffer.append("nonce="+nonce+"&");
		String signature=MapUtils.getString(paramsMap, "signature");
		paramsBuffer.append("signature="+signature+"&");
		String query=MapUtils.getString(paramsMap, "query");
		String queryParams="";
		try {
			queryParams=URLEncoder.encode(query,"UTF-8");
			paramsBuffer.append("query="+queryParams);
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
		return paramsBuffer.toString();
	}
}
