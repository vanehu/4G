package com.ailk.ecsp.service;

import com.ailk.ecsp.lifecycle.Lifecycle;
import com.al.ec.serviceplatform.client.DataMap;


/**
 * =========================================================
 * 亚信联创 电信CRM研发部
 * @author 李茂君
 * @date 2011-4-22 下午04:23:27
 * @Description: TODO(IService是一个服务接口，具体的服务都必须实行这个接口)
 * @version V1.0
 * =========================================================
 * update date                update author     Description
 * 2011-4-22                    李茂君                               创建文件
 */
public interface IService extends Lifecycle {
	/** 服务状态，正常 */
	public static String STATUS_NORMAL = "A";
	/** 服务状态，无效 */
	public static String STATUS_INVALID = "N";
	/** 服务状态，停止*/
	public static String STATUS_STOP = "S";
	/** 服务状态，运行 */
	public static String STATUS_RUNNING = "R";
	
	/** 服务访问方式，访问通用服务 */
	public static String VISIT_GENERAL = "G";
	/** 服务访问方式，访问配置服务 */
	public static String VISIT_DEFINE = "D";
	
	public DataMap process(DataMap dataMap,String serviceSerial) throws Exception;
		
}
