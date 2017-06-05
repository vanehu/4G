package com.al.ec.serviceplatform.client;

import com.al.ec.serviceplatform.client.impl.HttpServcieCall;


/**
 *  服务调用.
 *<P>
 *  TODO(类详细主功能描述)
 *<P>
 * @author 李茂君
 * @version V1.0 2011-12-2 
 * @CreateDate 2011-12-2 下午03:35:31
 * @ModifyDate 李茂君  2011-12-2<BR>
 *  why is modify Description
 * @CopyRight 亚信联创电信CRM研发部
 */
public class ServiceCall {

	private static ServiceCallType servicecalltyep;
	
	/**
	 * 服务调用
	 * @param databus
	 * @return
	 */
	public static DataBus call(final DataBus databus) {
		if (null  == servicecalltyep) {
			servicecalltyep = new HttpServcieCall();
			/*webservice方式*/
			//servicecalltyep = new WebServcieCall();
		}
		return servicecalltyep.callServcie(databus);
	}
	
	public static void reloadcfg(){
		if (null  == servicecalltyep) {
			servicecalltyep = new HttpServcieCall();
			/*webservice方式*/
			//servicecalltyep = new WebServcieCall();
		}
		servicecalltyep.reloadCfg();
	}
	
}
