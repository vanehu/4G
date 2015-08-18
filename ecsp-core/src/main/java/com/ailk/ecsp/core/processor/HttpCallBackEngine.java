package com.ailk.ecsp.core.processor;

import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
import com.al.ecs.common.util.JsonUtil;


/**
 * Servlet implementation class ServiceEngine
 */
public class HttpCallBackEngine extends Engine {
	private static final long serialVersionUID = 1L;
	protected static Logger logger = LoggerFactory.getLogger(HttpCallBackEngine.class);
	protected static List<Permission> permisionList;
	
	public HttpCallBackEngine() {
		super();
	}

	public void init() throws ServletException {
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		doPost(request,response);
		
	}

	/**
	 * 
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		long start = System.currentTimeMillis();
		String serviceSerial = Toolkit.getServiceSerialNumber();
		ServiceRunLog sr = new ServiceRunLog(); 
		String req = IOUtils.toString(request.getInputStream(), "UTF-8");
		String url = request.getRequestURI();
		String datas[] = url.split("/");
		String serviceCode = "";
		Map inParam = new HashMap();
		if (datas.length>0){
			serviceCode = datas[datas.length-1];
			inParam.put("inParam", req);	
		}
		DataMap dataMap = new DataMap();
		if (StringUtils.isNotBlank(req)) {
			response.setCharacterEncoding("UTF-8");
			try {
				String dbKeyWord = "";
				dataMap.setServiceCode(serviceCode);
				dataMap.setInParam(inParam);
				if(!(dataMap.getInParam(IConstant.CON_DB_KEY_WORD)==null)){
					dbKeyWord = (String)dataMap.getInParam(IConstant.CON_DB_KEY_WORD);
					DataSourceRouter.setRouteFactor(dbKeyWord);		
					sr.setDbKeyWord(dbKeyWord);
				}
				sr = createServiceRunLog(dataMap, serviceSerial);
				dataMap = ContainerFactory.getInstance().process(dataMap,sr);
				logger.debug("DataMap := {}",JsonUtil.toString(dataMap));
			} catch (Exception e) {
				logger.error("请求信息转换错误", e);
				logger.error(req);
				if(dataMap == null){
					dataMap = new DataMap();
				}
				sr.setInParam(req);
				dataMap.setResultCode("POR-1001");
				dataMap.setResultMsg("request or response error:"+ExceptionUtils.getFullStackTrace(e));
			}
			sr.setResultCode(dataMap.getResultCode());
		}else{
			if(dataMap == null){
				dataMap = new DataMap();
			}
			dataMap.setResultCode("POR-5555");
			dataMap.setResultMsg("无效请求！");
			sr.setInParam(req);
		}
		if (dataMap.getOutParam() == null){
			response.getWriter().write(JsonUtil.toString(dataMap));
		}else{
			response.getWriter().write(String.valueOf(MapUtils.getObject(dataMap.getOutParam(), "outParam")));
		}
		response.getWriter().flush();
		sr.setResultCode(dataMap.getResultCode());
		sr.setRemoteAddr(request.getRemoteAddr());
		sr.setRemotePort(String.valueOf(request.getRemotePort()));
		sr.setLocalAddr(request.getLocalAddr());
		sr.setLocalPort(String.valueOf(request.getLocalPort()));
		if(StringUtils.isNotBlank(sr.getIntfUrl())){
			sr.setInParam(JsonUtil.toString(dataMap.getInParam("inParam")));
		}
		sr.setOutParam(JsonUtil.toString(dataMap.getOutParam()));
		sr.setUseTime(System.currentTimeMillis() - start);
		sr.setEndTime(new Date());
		sr.setDbKeyWord(dataMap.getRoleCode());
		RunLog.getInstance().addRunlog(sr);

	}
	
    
    private ServiceRunLog createServiceRunLog(DataMap db,String serviceSerial){
		ServiceRunLog sr = new ServiceRunLog();
		sr.setServiceCode(db.getServiceCode());
		sr.setPortalCode(db.getPortalCode());
		sr.setRoleCode(db.getRoleCode());
		sr.setBusiRunNbr(db.getBusiFlowId());
		sr.setServRunNbr(serviceSerial);
		sr.setStartTime(new Date());
		if (StringUtils.isBlank(sr.getIntfMethod())){
			sr.setInParam(JsonUtil.toString(db.getInParam()));
		}else{
			sr.setInParam(JsonUtil.toString(db.getInParam().get("inParam")));
		}
		return sr;
	}


}
