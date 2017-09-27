package  com.al.lte.portal.common;

import java.net.InetAddress;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.time.DateFormatUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.al.crm.log.sender.ILogSender;
import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ec.serviceplatform.client.ServiceCall;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.util.UIDGenerator;
import com.al.ecs.common.web.HttpUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.common.web.SpringContextUtil;
import com.al.ecs.log.Log;
import com.al.lte.portal.core.DataSourceManager;
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
public class ServiceClient {

	protected  static Log log = Log.getLog(ServiceClient.class);
	
	private static ILogSender logSender = null;
	
	private static HttpServletRequest request = null;
	
	
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
	 */
	public static DataBus callService(Map<String, Object> dataBusMap, String serviceCode,
			String optFlowNum,SessionStaff sessionStaff) {
		
		DataBus db = new DataBus();
		db = initDataBus(sessionStaff);
		String areaId = "";
		if(sessionStaff!=null){
			PropertiesUtils propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
			if (SysConstant.APPDESC_MVNO.equals(propertiesUtils.getMessage(SysConstant.APPDESC))) {
				dataBusMap.put("ownerId", sessionStaff.getPartnerId());
			}else{
				//加入处理过的省份地区ID
				areaId = sessionStaff.getCurrentAreaId()==null?sessionStaff.getAreaId():sessionStaff.getCurrentAreaId();
				if (StringUtils.isNotBlank(areaId)){
					if (areaId.length()>=3){
						dataBusMap.put("provinceAreaId", areaId.substring(0, 3)+"0000");
					}					
				}
				
			}
		}
		if (areaId == null || areaId ==""){
			areaId = (String)dataBusMap.get("areaId");
			if (areaId != null &&  areaId !=""){
				dataBusMap.put("provinceAreaId", areaId.substring(0, 3)+"0000");
			}
		}
		if(!dataBusMap.containsKey("provinceAreaId")){
			dataBusMap.put("provinceAreaId", DataSourceManager.getCurrentDataSourceKey());
		}
		
		db.setServiceCode(serviceCode);
		String busiFlowNum = null;
		if (StringUtils.isNotEmpty(optFlowNum)) {
			busiFlowNum = optFlowNum;
		} else {
			busiFlowNum = UIDGenerator.generaFlowNum(serviceCode);			
		}
		db.setBusiFlowId(busiFlowNum);
		db.setParammap(dataBusMap);
		try {
			log.info(JsonUtil.toString(dataBusMap));
			if (!PortalServiceCode.WRITE_INTF_LOG.equals(serviceCode) && !PortalServiceCode.GET_SYS_PARAM.equals(serviceCode)) {
				log.debug("服务层入参:{}", JsonUtil.toString(dataBusMap));
			}
		} catch (Exception e) {
			log.error("对象转换json异常", e);
		}
		long startTime = System.currentTimeMillis();
		db = ServiceCall.call(db);
		long endTime = System.currentTimeMillis();

		try {
			if (!PortalServiceCode.WRITE_INTF_LOG.equals(serviceCode) && !PortalServiceCode.GET_SYS_PARAM.equals(serviceCode)) {
				log.debug("服务层回参:{}", JsonUtil.toString(db));
			}
		} catch (Exception e) {
			log.error("对象转换json异常", e);
		}
		try{
			String write_asynchronous_flag = MySimulateData.getInstance().getParam(DataSourceManager.DEFAULT_DATASOURCE_KEY,SysConstant.WRITE_ASYNCHRONOUS_FLAG);
			//GET_SYS_PARAM（获取配置数据） 不记录日志，因为记录日志方法中需要获取配置数据，发现配置数据为空时触发重新获取，这样在服务层连接失败时（启停server不一定按照顺序启停服务，所以有可能门户层启动时服务层未启动完成，造成连接异常）会触发死循环
			if (SysConstant.ON.equals(write_asynchronous_flag) && !PortalServiceCode.GET_SYS_PARAM.equals(serviceCode)) {
				callServiceLog(dataBusMap,db, busiFlowNum, optFlowNum, serviceCode, startTime,endTime,sessionStaff);
			}
		}catch (Exception e) {
			// TODO: handle exception
		}
		return db;
	}

	/**
	 * 调用服务层日志记录
	 * @param db DataBus
	 * @param busiFlowNum 服务层流水号
	 * @param optFlowNum 门户层操作流水号
	 * @param serviceCode 服务编码
	 * @param startTime 开始 时间
	 * @param endTime 结束 时间
	 */
	public static void callServiceLog(Map<String, Object> dataBusMap, DataBus db, String busiFlowNum,
			String optFlowNum, String serviceCode, long startTime,long endTime,SessionStaff sessionStaff) {
		try{
			logSender = (ILogSender) SpringContextUtil.getBean("defaultLogSender");
			request = ((ServletRequestAttributes)RequestContextHolder.getRequestAttributes()).getRequest();
		}catch (Exception e) {
			// TODO: handle exception
		}
		try {
			try {
				String log_flag = MySimulateData.getInstance().getParam(DataSourceManager.DEFAULT_DATASOURCE_KEY,serviceCode);
				if(!"1".equals(log_flag)){
					if("2".equals(log_flag)){
						if(ResultCode.R_SUCC.equals(db.getResultCode()) || ResultCode.R_SUCCESS.equals(db.getResultCode())|| ResultCode.RES_SUCCESS.equals(db.getResultCode())){
							return;
						}
					}else{
						return;
					}
				}
			} catch (Exception e) {
				log.error(e);
				return;
			}
			if(logSender!=null){
				Map<String, Object> logObj = new HashMap<String, Object>();
//				String logId = UUID.randomUUID().toString();
//				logObj.put("LOG_ID", logId);
				logObj.put("SERVICE_CODE", serviceCode);
				logObj.put("PORTAL_CODE", db.getPortalCode());
				logObj.put("ROLE_CODE", db.getRoleCode() == null ? "" : db.getRoleCode());
				String serviceSerial = "SP"+DateFormatUtils.format(new Date(), "yyyyMMddHHmmssSSS")+RandomStringUtils.randomNumeric(4);
				logObj.put("SERV_RUN_NBR", serviceSerial);
				logObj.put("BUSI_RUN_NBR", busiFlowNum);
				Date beginDate = new Date(startTime);
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
				if(request != null){
					try{
						logObj.put("REMOTE_ADDR", ServletUtils.getIpAddr(request));
						logObj.put("REMOTE_PORT", String.valueOf(request.getRemotePort()));
						logObj.put("LOCAL_ADDR", HttpUtils.getHostIpAddress());
						logObj.put("LOCAL_PORT", String.valueOf(request.getLocalPort()));
					} catch(Exception e){
						logObj.put("REMOTE_ADDR", "Exception");
						logObj.put("REMOTE_PORT", "Exception");
						logObj.put("LOCAL_ADDR", "Exception");
						logObj.put("LOCAL_PORT", "Exception");
					}
				}else{
					logObj.put("REMOTE_ADDR", "request is null");
					logObj.put("REMOTE_PORT", "request is null");
					logObj.put("LOCAL_ADDR", "request is null");
					logObj.put("LOCAL_PORT", "request is null");
				}
				logObj.put("INTF_URL", MapUtils.getString(dataBusMap, "intfUrl", ""));
				logObj.put("INTF_METHOD", MapUtils.getString(dataBusMap, "intfMethod", ""));
				if(sessionStaff!=null){
					logObj.put("AREA_ID", sessionStaff.getCurrentAreaId() == null ? "" : sessionStaff.getCurrentAreaId());
					logObj.put("STAFF_ID", sessionStaff.getStaffId() == null ? "" : sessionStaff.getStaffId());
					logObj.put("STAFF_NAME", sessionStaff.getStaffCode() == null ? "" : sessionStaff.getStaffCode());
					logObj.put("CHANNEL_NAME", sessionStaff.getCurrentChannelName() == null ? "" : sessionStaff.getCurrentChannelName());
					logObj.put("CHANNEL_ID", sessionStaff.getCurrentChannelId() == null ? "" : sessionStaff.getCurrentChannelId());
				}else{
					logObj.put("AREA_ID", "");
					logObj.put("STAFF_ID", "");
					logObj.put("STAFF_NAME", "");
					logObj.put("CHANNEL_NAME", "");
					logObj.put("CHANNEL_ID", "");
				}
				logObj.put("REMARK", MapUtils.getString(dataBusMap, "token", ""));
//				logObj.put("IP", "");
//				long createtime = System.currentTimeMillis();
//				logObj.put("CREATETIME", createtime);
				logObj.put("OL_ID", "");
				logObj.put("SO_NBR", "");
				logObj.put("BUSI_TYPE", "");
				// 门户日志的记录也会记录到日志平台
				// 新增日志ID
				logObj.put("LOG_SEQ_ID", dataBusMap.get("logSeqId"));
				// 新增错误标识，0 成功  1  错误  2  异常
				logObj.put("ERROR_CODE", dataBusMap.get("errorCode"));
				
				Map<String, Object> logClobObj = new HashMap<String, Object>();
				if("com.linkage.portal.service.lte.core.system.SendMsgInfo".equals(serviceCode)){
					logClobObj.put("IN_PARAM", db.getParammap());						
					logClobObj.put("OUT_PARAM", db.getReturnlmap());
					logSender.sendLog2DB("PORTAL_SERVICE_LOG", logObj,logClobObj);
					return;
				}
				if(db.getInIntParam()!=null){
					logClobObj.put("IN_PARAM", db.getInIntParam());						
					logClobObj.put("OUT_PARAM", db.getOutIntParam());
					logSender.sendLog2DB("PORTAL_SERVICE_LOG", logObj,logClobObj);
				}else{
					logClobObj.put("IN_PARAM", db.getParammap());						
					logClobObj.put("OUT_PARAM", db.getReturnlmap());
					logSender.sendLog2DB("PORTAL_SERVICE_LOG", logObj,logClobObj);
				}
			}
			
			/** 所有日志 数据库 记录 */
//			if (SysConstant.CALL_SERVICE_LOG_FLAG == LevelLog.DB) {
//				LogItem logItem = new LogItem();
//				logItem.setBusiRunNbr(busiFlowNum);
//				logItem.setOptFlowNum(optFlowNum);
//				logItem.setServiceCode(serviceCode);
//				logItem.setStart_visit_dt(new Date(startTime));
//				logItem.setEnd_visit_dt(new Date(endTime));
//				logItem.setResultCode(db.getResultCode());
//				try {
//					logItem.setIn_param(JsonUtil.toString(db.getParammap()));
//				} catch (Exception e) {
//					log.error("对象转换json异常", e);
//				}
//				try {
//					logItem.setOut_param(JsonUtil.toString(db.getReturnlmap()));
//				} catch (Exception e) {
//					log.error("对象转换json异常", e);
//				}
//				LogContainer.getInstance().addCallServiceLog(logItem);
//				/** 异常 日志 数据库记录 */
//			} else if (SysConstant.CALL_SERVICE_LOG_FLAG == LevelLog.ERROR_DB) {
//				if (db != null
//						&& !ResultCode.R_SUCCESS.equals(db.getResultCode())) {
//					LogItem logItem = new LogItem();
//					logItem.setBusiRunNbr(busiFlowNum);
//					logItem.setOptFlowNum(optFlowNum);
//					logItem.setServiceCode(serviceCode);
//					logItem.setStart_visit_dt(new Date(startTime));
//					logItem.setEnd_visit_dt(new Date(endTime));
//					logItem.setResultCode(db.getResultCode());
//					try {
//						logItem.setIn_param(JsonUtil.toString(db.getParammap()));
//					} catch (Exception e) {
//						log.error("对象转换json异常", e);
//					}
//					try {
//						logItem.setOut_param(JsonUtil.toString(db.getReturnlmap()));
//					} catch (Exception e) {
//						log.error("对象转换json异常", e);
//					}
//					LogContainer.getInstance().addCallServiceLog(logItem);
//				}
//			}
		} catch (Exception e) {
			log.error("日志记录异常", e);
		}
	}
	public static DataBus initDataBus(SessionStaff sessionStaff){
		DataBus db = new DataBus();
		db.setPortalCode(PortalServiceCode.SERVICE_PORTAL_CODE);
		db.setRoleCode(PortalServiceCode.SERVICE_PORTAL_ROLE_CODE);
		db.setPassword(PortalServiceCode.SERVICE_PORTAL_PASSWORD);
		if(sessionStaff!=null){
			db.setOperatStaff(sessionStaff.getStaffCode());
			db.setOperatChannel(sessionStaff.getCurrentChannelId());
			db.setProvinceCode(sessionStaff.getProvinceCode());
			db.setOperater(sessionStaff.getStaffCode());
			db.setOperatStaffID(sessionStaff.getStaffId());
			db.setOperatStaffName(sessionStaff.getStaffName());
			db.setOperaterArea(sessionStaff.getCurrentAreaId());
			db.setOperatChannelName(sessionStaff.getCurrentChannelName());
		}		
		return db;
	}
}
