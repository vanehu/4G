package com.al.lte.portal.common;

import java.io.IOException;
import java.io.StringReader;
import java.net.SocketTimeoutException;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.time.DateFormatUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.math.NumberUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.util.EntityUtils;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.Node;
import org.dom4j.io.SAXReader;
import org.springframework.stereotype.Component;
import org.xml.sax.InputSource;

import com.al.crm.asynframe.integration.IAsynClient;
import com.al.crm.log.sender.ILogSender;
import com.al.ec.serviceplatform.client.CsbDataMap;
import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ec.serviceplatform.client.httpclient.MyHttpclient;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.util.UIDGenerator;
import com.al.ecs.common.web.SpringContextUtil;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.InterfaceException.ErrType;
import com.al.ecs.log.Log;
import com.al.lte.portal.bmo.log.LogContainer;
import com.al.lte.portal.core.DataRepository;
import com.al.lte.portal.model.SessionStaff;

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
	
	private static final String RES_SERVICENAME = "serviceName";
	private static final String RES_SERVICEMETHOD = "serviceMethod";

	// HTTP WEBSERVICE SIMULATE
	private static final String HTTP_WAY = "HTTP";
	private static final String WS_WAY = "WS";
	private static final String SIMULATE_WAY = "SIMULATE";
	
	private static final String URL_KEY = "url";
	private static final String BIZ_PREFIX = "biz";
	private static final String RES_PREFIX = "res";
	private static final String SYS_PREFIX = "sys";
	private static final String RULE_PREFIX = "rule";
	private static final String CHAN_PREFIX = "chan";
	private static final String CSB_HTTP = "csbHttp";
	private static final String CSB_WS = "csbWS";
	public static final String CHECK_LOGIN="pvc";
	private static final String XML_CONTENT_TYPE = "text/xml";
	private static final String JSON_CONTENT_TYPE = "application/json";
	private static final String TEXT_CONTENT_TYPE = "application/x-www-form-urlencoded";

	private static PropertiesUtils propertiesUtils = null;
	
	private static ILogSender logSender = null;
	
	// private static final String INVOKEWAY = HTTPWAY;

	// private static List<String> simulateList = new ArrayList<String>();
//
//	@Autowired
//	PropertiesUtils propertiesUtils;
//	
	static {
		getPropertiesUtils();
		getLogSender();
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
		String paramString = "";
		String retnJson = "";
		String rawRetn = "";
		String intfUrl = "";
		String resultCode = "";
		String resultMsg = "";
		String errCode = "";
		String errorStack = "";
		String prefix = "";
		//判断是否启用默认HTTP调用方式
		String invokeWay = propertiesUtils.getMessage(SysConstant.DEF_HTTP_FLAG);
		if (SysConstant.ON.equals(invokeWay)) {
			invokeWay = HTTP_WAY;
		} else {
			//未启用则从simulate配置文件中读取各接口对应的调用方式
			invokeWay = getInvokeWay(serviceCode);
		}
		
		try {
		
			if (HTTP_WAY.equals(invokeWay)) {
				
				String contentType = JSON_CONTENT_TYPE;
				String sys = "";
				// get url, contentType by serviceCode
				prefix = serviceCode.substring(0, serviceCode.indexOf("-"));
				if (BIZ_PREFIX.equals(prefix)) {
					serviceCode = serviceCode.substring(4);
					intfUrl = getNeeded(URL_KEY, BIZ_PREFIX);
					intfUrl += serviceCode;
					sys = "集团营业受理后台";
					//20140309 加上areaId
					if (!dataBusMap.containsKey("areaId")) {
						if(sessionStaff != null){
							dataBusMap.put("areaId", sessionStaff.getCurrentAreaId());
						}
					}
					paramString = JsonUtil.toString(dataBusMap);
				} else if (RES_PREFIX.equals(prefix)) {
					StringBuffer sb = new StringBuffer(getNeeded(URL_KEY, RES_PREFIX));
					sb.append(getNeeded(serviceCode, RES_SERVICENAME));
					sb.append("/").append(getNeeded(serviceCode, RES_SERVICEMETHOD));
					intfUrl = sb.toString();
					serviceCode = serviceCode.substring(4);
					dataBusMap = addReqInfo(dataBusMap, serviceCode, sessionStaff, transactionId);
					sys = "集团营销资源";
					paramString = JsonUtil.toString(dataBusMap);
				} else if (SYS_PREFIX.equals(prefix)) {
					serviceCode = serviceCode.substring(4);
					intfUrl = getNeeded(URL_KEY, SYS_PREFIX);
					intfUrl += serviceCode;
					sys = "集团系统管理";
					paramString = JsonUtil.toString(dataBusMap);
				} else if (RULE_PREFIX.equals(prefix)) {
					serviceCode = serviceCode.substring(5);
					intfUrl = getNeeded(URL_KEY, RULE_PREFIX);
					intfUrl += serviceCode;
					sys = "集团业务规则";
					paramString = JsonUtil.toString(dataBusMap);
				} else if (CHAN_PREFIX.equals(prefix)) {
					serviceCode = serviceCode.substring(5);
					intfUrl = getNeeded(URL_KEY, CHAN_PREFIX);
					intfUrl += serviceCode;
					sys = "集团渠道管理";
					paramString = JsonUtil.toString(dataBusMap);
				} else if (CHECK_LOGIN.equals(prefix)) {
					intfUrl = getNeeded(serviceCode, URL_KEY);
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
				}
				
				String csbFlag = propertiesUtils.getMessage(SysConstant.CSB_FLAG);
				String asyncFlag = propertiesUtils.getMessage(SysConstant.ASYNC_FLAG);
				boolean asyncWay = false;
				Object serviceCodeObj = null;
				if (SysConstant.ON.equals(csbFlag)){
					serviceCodeObj = DataRepository.getInstence().getCommonParam(serviceCode);
					Object serviceCodeObjAsyn = DataRepository.getInstence().getCommonParam(serviceCode + SysConstant.ASYNC_KEY);
					if (SysConstant.ON.equals(asyncFlag) && serviceCodeObjAsyn != null) {
						serviceCodeObj = serviceCodeObjAsyn;
						asyncWay = true;
					}
					//如果找不到CSB配置，就按默认方式HTTP调用
					if (serviceCodeObj != null) {
						Map<String, Object> map = JsonUtil.toObject((String)serviceCodeObj, Map.class);
						paramString = addCsbInfo(map, paramString, appDesc,sessionStaff);
						Object csbUrlObj = null;
						csbUrlObj = propertiesUtils.getMessage(URL_KEY + "." + CSB_HTTP);
						if (csbUrlObj != null){
							intfUrl = (String)csbUrlObj;
						}
					}
				}
				if (asyncWay) {
					log.debug("async-reqUrl:{}", intfUrl);
					log.debug("async-serviceCode:{},paramString:{}", serviceCode, paramString);
					
					IAsynClient client = (IAsynClient)SpringContextUtil.getBean("asynClient");
					rawRetn = (String)client.invoke(paramString);
					
					log.debug("async-serviceCode:{},rawRetn:{}", serviceCode, rawRetn);
				} else {
					db = httpCall(sys, serviceCode, paramString, intfUrl, contentType, optFlowNum, sessionStaff, beginTime);
	
					rawRetn = db.getResultMsg();
					retnJson = rawRetn;
				}
	
				if (SysConstant.ON.equals(csbFlag) && serviceCodeObj != null){
					
					Node svcCont = checkCSBXml(serviceCode, rawRetn, paramString);
					retnJson = svcCont.getText();
					
				}
				Map<String, Object> rootMap = JsonUtil.toObject(retnJson, Map.class);
				if (MapUtils.isEmpty(rootMap) || !rootMap.containsKey("resultCode")) {
					//异常判断：返回不是个JSON对象或没有包含resultCode
					throw new InterfaceException(ErrType.OPPOSITE, serviceCode, retnJson, paramString);
				}
				resultCode = MapUtils.getString(rootMap, "resultCode");
				resultMsg = MapUtils.getString(rootMap, "resultMsg");
				if (ResultCode.R_EXCEPTION.equals(resultCode) || ResultCode.R_RULE_EXCEPTION.equals(resultCode)) {
					
					checkError(rootMap, sys, serviceCode, resultCode, resultMsg, retnJson, paramString);
					
				}
				
				db.setReturnlmap(rootMap);
	
			} else if (WS_WAY.equals(invokeWay)) {
	
			} else if (SIMULATE_WAY.equals(invokeWay)) {
				// 模拟调用，从文件得到json格式返回值
				retnJson = getRetnJson(serviceCode);
				log.debug("retnJson:{}", retnJson.length() > 3000 ? retnJson.substring(0, 3000) : retnJson);
				
				if (StringUtils.isBlank(retnJson)) {
					db.setResultCode(ResultCode.R_INTERFACE_EXCEPTION);
					db.setResultMsg("接口返回为空");
					return db;
				}
	
				Map<String, Object> rootMap = JsonUtil.toObject(retnJson, Map.class);
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
	
			} else {
	
			}
		
		} finally {
			db.setResultCode(resultCode);
			db.setResultMsg(resultMsg);
			db.setParammap(dataBusMap);
			if (sessionStaff != null) {
				callServiceLog(db, optFlowNum, serviceCode, intfUrl, sessionStaff, paramString, rawRetn, beginTime, System.currentTimeMillis(),prefix);
			}
		}
		db.setBusiFlowId(transactionId);
		return db;
	}

	
	/**
	 * 调用服务层日志记录
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
	public static void callServiceLog(DataBus db, String optFlowNum, 
			String serviceCode, String intfUrl, SessionStaff sessionStaff, String paramString, String rawRetn, long beginTime, long endTime,String prefix) {
		long startTime = System.currentTimeMillis();
		try {
			String writelogFlag = MySimulateData.getInstance().getParam(SysConstant.WRITE_LOG_FLAG);
			if (SysConstant.OFF.equals(writelogFlag)) {
				return;
			}
			String log_flag = MySimulateData.getInstance().getParam(prefix+"-"+serviceCode);
			if(!"1".equals(log_flag)){
				if("2".equals(log_flag)){
					if(ResultCode.R_SUCC.equals(db.getResultCode()) || ResultCode.R_SUCCESS.equals(db.getResultCode())|| ResultCode.RES_SUCCESS.equals(db.getResultCode())){
						return;
					}
				}else{
					return;
				}
			}
			String writeDetailFlag = MySimulateData.getInstance().getParam(SysConstant.WRITE_LOG_DETAIL);
			if (StringUtils.isEmpty(writeDetailFlag)) {
				writeDetailFlag = SysConstant.LOG_PS;
			}
			if (SysConstant.LOG_PS.equals(writeDetailFlag)) {
				Map<String, Object> logMap = new HashMap<String, Object>();
				logMap.put("intfMethod", serviceCode);
				logMap.put("intfUrl", intfUrl);
				logMap.put("beginDate", "" + beginTime);
				logMap.put("endDate", "" + endTime);
				logMap.put("inParam", paramString);						
				logMap.put("outParam", rawRetn);
				LogContainer.getInstance().addServiceLog(logMap, optFlowNum, sessionStaff);
				
			} else if (SysConstant.LOG_UNILOG.equals(writeDetailFlag)) {
				// UNILOG情况下，先记录一般日志到SP_SERVICE_RUN_LOG表，
				// 再把包含CLOB字段的内容发往日志服务器
				Map<String, Object> logMap = new HashMap<String, Object>();
				logMap.put("intfMethod", serviceCode);
				logMap.put("intfUrl", intfUrl);
				logMap.put("beginDate", "" + beginTime);
				logMap.put("endDate", "" + endTime);
				logMap.put("inParam", null);
				logMap.put("outParam", null);
				LogContainer.getInstance().addServiceLog(logMap, optFlowNum, sessionStaff);
				
				
				Map<String, Object> logObj = new HashMap<String, Object>();
				logObj.put("logId", Long.parseLong(DateFormatUtils.format(new Date(), "yyMMddSSS") + RandomStringUtils.randomNumeric(9)));
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
			String contentType, String optFlowNum, SessionStaff sessionStaff, long beginTime) throws InterfaceException {
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
			post.addHeader("Content-Type", contentType);
			entity = new StringEntity(paramString, ENCODING);
			post.setEntity(entity);
			HttpResponse httpresponse = MyHttpclient.getInstance()
					.getHttpclient().execute(post);
			entity = httpresponse.getEntity();
			retnJson = EntityUtils.toString(entity, ENCODING);
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
				throw new InterfaceException(ErrType.OPPOSITE, serviceCode, msg, paramString);
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
					throw new InterfaceException(ErrType.OPPOSITE, serviceCode, msg, paramString);
				}
			} else if (ioe.getCause() != null) {
				String msg = ioe.getCause().getMessage();
				if ("Connection timed out: connect".equals(msg)) {
					msg = reqUrl + "\n" + msg + "\n" + ioe.getMessage();
					throw new InterfaceException(ErrType.OPPOSITE, serviceCode, msg, paramString);
				}
			}
			
			throw new InterfaceException(ErrType.PORTAL, serviceCode, paramString, ioe);
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
	
	
	public static void checkError(Map<String, Object> rootMap, String sys, String serviceCode, String resultCode, String resultMsg, String retnJson, String paramString) throws InterfaceException {
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
				throw new InterfaceException(ErrType.OPPOSITE, serviceCode, retnJson, paramString);
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
			throw new InterfaceException(ErrType.CATCH, serviceCode, msg, errCode, errorStack, errorInstNbr, paramString);
		} else {
			//异常判断：返回未包含errCode/errorStack，封装为对端系统异常
			StringBuffer sb = new StringBuffer();
			sb.append(sys).append("的").append(serviceCode).append("服务未捕获异常");
			sb.append(",resultMsg:{}");
			log.error(sb.toString(), resultMsg);
			throw new InterfaceException(ErrType.OPPOSITE, serviceCode, resultMsg, paramString);
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
		reqInfo.put("areaId", sessionStaff.getCurrentAreaId());
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
				tranid = (String.valueOf(tranMap.get("TranId"))) ;
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
		cdm.setSrcSysSign(SysConstant.CSB_SRC_SYS_SIGN);
		cdm.setDstOrgID(SysConstant.CSB_ORG_ID_GROUP);
		cdm.setSrcOrgID(SysConstant.CSB_ORG_ID_GROUP);
		if (SysConstant.APPDESC_MVNO.equals(appDesc)) {
			srcSysID = SysConstant.CSB_SRC_SYS_ID_MVNO;
		} else if (SysConstant.APPDESC_LTE.equals(appDesc)) {
			srcSysID = SysConstant.CSB_SRC_SYS_ID_LTE;
		}
		cdm.setSrcSysID(srcSysID);
		cdm.setSvcCont(paramString);
		return cdm.getXml();
	}

	private static String getInvokeWay(String serviceCode) {
		return MySimulateData.getInstance().getInvokeWay(serviceCode);
	}

	private static String getRetnJson(String serviceCode) {
		return MySimulateData.getInstance().getJson(serviceCode);
	}

	private static String getNeeded(String serviceCode, String need) throws Exception {
		return MySimulateData.getInstance().getNeeded(serviceCode, need);
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
}
