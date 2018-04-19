package com.ailk.ecsp.core.processor;

import java.io.IOException;
import java.util.Date;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.exception.ExceptionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ailk.ecsp.core.DataSourceRouter;
import com.ailk.ecsp.core.container.ContainerFactory;
import com.ailk.ecsp.mybatis.model.ServiceRunLog;
import com.ailk.ecsp.security.Permission;
import com.ailk.ecsp.task.RunLog;
import com.ailk.ecsp.util.IConstant;
import com.ailk.ecsp.util.Toolkit;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.exception.ResultConstant;


/**
 * Servlet implementation class ServiceEngine
 */
public class ServiceEngine extends Engine {
	
	protected static Logger logger = LoggerFactory.getLogger(ServiceEngine.class);
	private static final long serialVersionUID = 1L;
	protected static List<Permission> permisionList;
	protected String configFile = "classpath:server.xml";
	
	public ServiceEngine() {
		super();
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		doPost(request,response);
		
	}
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		long start = System.currentTimeMillis();
		String serviceSerial = Toolkit.getServiceSerialNumber();
		ServiceRunLog sr = new ServiceRunLog(); 
		String req = IOUtils.toString(request.getInputStream(), "UTF-8");
		DataMap dataMap = null;
		response.setCharacterEncoding("UTF-8");
		if (StringUtils.isNotBlank(req)) {
			try {
				dataMap = (DataMap)JsonUtil.toObject(req, DataMap.class);
				sr = createServiceRunLog(dataMap, serviceSerial);
				sr.setDbKeyWord(setDbKeyWord(dataMap));
				dataMap = ContainerFactory.getInstance().process(dataMap,sr);
				logger.debug("DataMap := {}",JsonUtil.toString(dataMap));
			} catch (Exception e) {
				logger.error("请求信息转换错误", e);
				logger.error(req);
				if(dataMap == null){
					dataMap = new DataMap();
				}
				sr.setInParam(req);
				dataMap.setResultCode(ResultConstant.R_POR_ERROR_PARAM.getCode());
				dataMap.setResultMsg(ResultConstant.R_POR_ERROR_PARAM.getMsg()+req+":"+ExceptionUtils.getFullStackTrace(e));
			}
		}else{
			if(dataMap == null){
				dataMap = new DataMap();
			}
			dataMap.setResultCode(ResultConstant.R_POR_ERROR_PARAM.getCode());
			dataMap.setResultMsg(ResultConstant.R_POR_ERROR_PARAM.getMsg());
			sr.setInParam(req);
		}
		sr.setResultCode(dataMap.getResultCode());
		response.getWriter().write(JsonUtil.toString(dataMap));
		response.getWriter().flush();
		sr.setResultCode(dataMap.getResultCode());
		sr.setRemoteAddr(request.getRemoteAddr());
		sr.setRemotePort(String.valueOf(request.getRemotePort()));
		sr.setLocalAddr(request.getLocalAddr());
		sr.setLocalPort(String.valueOf(request.getLocalPort()));
		sr.setUseTime(System.currentTimeMillis() - start);
		sr.setEndTime(new Date());
		sr = createServiceRunLogAfter(dataMap,sr);
		if (dataMap.getServiceCode()!=null) {
			RunLog.getInstance().addRunlog(sr);
		}
	}
    
    private ServiceRunLog createServiceRunLog(DataMap db,String serviceSerial){
		ServiceRunLog sr = new ServiceRunLog();
		sr.setLogSeqId(MapUtils.getString(db.getInParam(), "logSeqId", ""));
		sr.setErrorCode(MapUtils.getString(db.getInParam(), "errorCode", ""));
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
    private String setDbKeyWord(DataMap dm) throws Exception{
		String dbKeyWord = "";
		if (dm != null){
			if(dm.getInParam(IConstant.CON_DB_KEY_WORD)!=null){
				dbKeyWord = (String)dm.getInParam(IConstant.CON_DB_KEY_WORD);
				DataSourceRouter.setRouteFactor(dbKeyWord);
			}
		}
		return dbKeyWord;
    }
}
