package com.ailk.ecsp.core;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ailk.ecsp.lifecycle.Lifecycle;
import com.ailk.ecsp.lifecycle.LifecycleException;
import com.ailk.ecsp.lifecycle.LifecycleListener;
import com.ailk.ecsp.lifecycle.LifecycleSupport;
import com.ailk.ecsp.service.Service;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.JsonUtil;


/**
 * =========================================================
 * 亚信联创 电信CRM研发部
 * @author 李茂君
 * @date 2011-4-22 下午04:44:20
 * @Description: TODO(服务调度)
 * @version V1.0
 * =========================================================
 * update date                update author     Description
 * 2011-4-22                    李茂君                                创建文件
 */
public class ServiceInvoke implements Lifecycle{
	
	private static Logger log = LoggerFactory.getLogger(ServiceInvoke.class);
	
	private LifecycleSupport lifecycle = new LifecycleSupport(this);
	
	/**
	 * 服务调用,服务调用前 触发服务调用前的监听事件。服务调用后触发服务调用后的监听事件
	 * 
	 * */
	public DataMap invoke(Service service,DataMap dataMap,String serviceSerial) {
		if(service == null) {
			return null;
		}
		lifecycle.fireLifecycleEvent(BEFORE_SERVICE_INVOKE, service);
		DataMap result = dataMap;
		//result.putAll(dataMap);
		if(!dataMap.isAnalog()){
			try {
				result = service.exec(dataMap,serviceSerial);
				if (null == result) {
					result = dataMap;
					result.setResultCode(ResultCode.R_UNKNOWN_ERROR);
					result.setResultMsg("服务内部异常，返回null");
				}
			} catch (Exception e) {
				result.setResultCode(ResultCode.R_SERV_EXCEPTION);
				result.setResultMsg("服务{}运行异常:{}",dataMap.getServiceCode(),e.toString());
				log.error(dataMap.getServiceCode()+"运行异常:", e);
			}
		}else{
			String data = AnalogDataFactory.getInstance().readAnalogData(dataMap.getServiceCode());
			log.debug("###模拟数据:{}",data);
			if(data!=null){
				data = StringUtils.trimToEmpty(data);
				result = JsonUtil.toObject(data, DataMap.class);
				if(result==null||result.isEmpty()){
					 result = dataMap;
					 result.setResultCode("POR-4556");
					 result.setResultMsg("模拟数据转换异常，请确认模拟数据是否合法");
				}
			}else{
				result.setResultCode("POR-4555");
				result.setResultMsg("读取模拟数据出错，模拟数据未配置或者数据不存在");
			}
			result.put("A_ANALOG_DATA", "这是一条模拟的数据！");
		}
		lifecycle.fireLifecycleEvent(AFTER_SERVICE_INVOKE, service);
		return result;
	}

	
	
	public void addLifecycleListener(LifecycleListener listener) {
		
		lifecycle.addLifecycleListener(listener);
		
	}

	public LifecycleListener[] findLifecycleListeners() {
		
		return lifecycle.findLifecycleListeners();
	}

	
	
	public void removeLifecycleListener(LifecycleListener listener) {
		
		lifecycle.removeLifecycleListener(listener);
		
	}

	public void start() throws LifecycleException {
		// TODO Auto-generated method stub
		
	}

	public void stop() throws LifecycleException {
		// TODO Auto-generated method stub
		
	}
	
	
	
}
