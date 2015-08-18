package  com.al.lte.portal.common;

import java.util.Date;
import java.util.Map;

import org.apache.commons.lang.StringUtils;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ec.serviceplatform.client.ServiceCall;
import com.al.ecs.common.entity.LevelLog;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.util.UIDGenerator;
import com.al.ecs.common.web.SpringContextUtil;
import com.al.ecs.log.Log;
import com.al.lte.portal.bmo.log.LogContainer;
import com.al.lte.portal.model.LogItem;
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
		if(sessionStaff!=null){
			PropertiesUtils propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
			if (SysConstant.APPDESC_MVNO.equals(propertiesUtils.getMessage(SysConstant.APPDESC))) {
				dataBusMap.put("ownerId", sessionStaff.getPartnerId());
			}
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
			if (!PortalServiceCode.WRITE_INTF_LOG.equals(serviceCode)) {
				log.debug("服务层入参:{}", JsonUtil.toString(dataBusMap));
			}
		} catch (Exception e) {
			log.error("对象转换json异常", e);
		}
		long startTime = System.currentTimeMillis();
		db = ServiceCall.call(db);
		long endTime = System.currentTimeMillis();

		try {
			if (!PortalServiceCode.WRITE_INTF_LOG.equals(serviceCode)) {
				log.debug("服务层回参:{}", JsonUtil.toString(db));
			}
		} catch (Exception e) {
			log.error("对象转换json异常", e);
		}
//		callServiceLog(db, busiFlowNum, optFlowNum, serviceCode, startTime,
//				endTime);
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
	public static void callServiceLog(DataBus db, String busiFlowNum,
			String optFlowNum, String serviceCode, long startTime,
			long endTime) {
		try {
			/** 所有日志 数据库 记录 */
			if (SysConstant.CALL_SERVICE_LOG_FLAG == LevelLog.DB) {
				LogItem logItem = new LogItem();
				logItem.setBusiRunNbr(busiFlowNum);
				logItem.setOptFlowNum(optFlowNum);
				logItem.setServiceCode(serviceCode);
				logItem.setStart_visit_dt(new Date(startTime));
				logItem.setEnd_visit_dt(new Date(endTime));
				logItem.setResultCode(db.getResultCode());
				try {
					logItem.setIn_param(JsonUtil.toString(db.getParammap()));
				} catch (Exception e) {
					log.error("对象转换json异常", e);
				}
				try {
					logItem.setOut_param(JsonUtil.toString(db.getReturnlmap()));
				} catch (Exception e) {
					log.error("对象转换json异常", e);
				}
				LogContainer.getInstance().addCallServiceLog(logItem);
				/** 异常 日志 数据库记录 */
			} else if (SysConstant.CALL_SERVICE_LOG_FLAG == LevelLog.ERROR_DB) {
				if (db != null
						&& !ResultCode.R_SUCCESS.equals(db.getResultCode())) {
					LogItem logItem = new LogItem();
					logItem.setBusiRunNbr(busiFlowNum);
					logItem.setOptFlowNum(optFlowNum);
					logItem.setServiceCode(serviceCode);
					logItem.setStart_visit_dt(new Date(startTime));
					logItem.setEnd_visit_dt(new Date(endTime));
					logItem.setResultCode(db.getResultCode());
					try {
						logItem.setIn_param(JsonUtil.toString(db.getParammap()));
					} catch (Exception e) {
						log.error("对象转换json异常", e);
					}
					try {
						logItem.setOut_param(JsonUtil.toString(db.getReturnlmap()));
					} catch (Exception e) {
						log.error("对象转换json异常", e);
					}
					LogContainer.getInstance().addCallServiceLog(logItem);
				}
			}
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
