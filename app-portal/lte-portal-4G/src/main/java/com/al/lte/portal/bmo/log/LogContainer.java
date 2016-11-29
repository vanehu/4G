package com.al.lte.portal.bmo.log;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

import com.al.ec.serviceplatform.client.DataBus;
import  com.al.ecs.log.Log;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.ServiceClient;
import com.al.lte.portal.model.LogItem;
import com.al.lte.portal.model.SessionStaff;

/**
 * 添加日志实例容器 .
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-5-11
 * @createDate 2012-5-11 下午4:09:38
 * @modifyDate tang zheng yu 2012-5-11 <BR>
 * @copyRight 亚信联创EC研发部
 */
public final class LogContainer {
	/** 私有实例 */
	public static final  LogContainer SINGLETON = new LogContainer();
	/** 存储最大个数 */
	public static final  int DEFAULT_LOG_MAX_NUM = 10;

	/** 日志 */
	protected static Log log= Log.getLog(LogContainer.class);

	/** 操作日志状态 */
	private boolean maxOperatAdd=false;
	/** 调用服务日志状态 */
	private boolean maxCallServiceAdd=false;
	/** 20131011新-调用服务日志状态 */
	private boolean maxServiceLogAdd=false;
	/** 最大存储日志条数 */
	private int logMax = DEFAULT_LOG_MAX_NUM;

	private List<LogItem> delOperatList = new ArrayList<LogItem>();
	private List<LogItem> delCallServiceList = new ArrayList<LogItem>();
	/** 保证读写线程是安全的 */
	private List<LogItem> callServiceLogContainer = new CopyOnWriteArrayList<LogItem>();
	/** 保证读写线程是安全的 */
	private List<LogItem> operaLogContainer = new CopyOnWriteArrayList<LogItem>();
	//20131011 每条日志为Map型，新增以下两个List和一个addServiceLog方法
	private List<Map<String, Object>> delServiceLogList = new ArrayList<Map<String, Object>>();
	/** 保证读写线程是安全的 */
	private List<Map<String, Object>> serviceLogContainer = new CopyOnWriteArrayList<Map<String, Object>>();
	private LogContainer() {
		//this.logMax=10;
	}
	public void setLogMax(int logMax) {
		this.logMax = logMax;
	}
	/**
	 * 返回当前状态
	 * @return boolean 返回当前状态
	 */
	public boolean isMaxOperatAdd() {
		return maxOperatAdd;
	}
	/**
	 * 返回当前状态
	 * @return boolean 返回当前状态
	 */
	public boolean isMaxCallServiceAdd() {
		return maxCallServiceAdd;
	}
	public static LogContainer getInstance() {
		if(SINGLETON==null) {
			return new LogContainer();
		}
		return SINGLETON;
	}
	
	/**
	 * 通过多线程往操作日志容器里添加
	 * @param o LogItem
	 */
	public void addOperaLog(final LogItem o){
		Iterator<LogItem> it=null;
		LogItem operaLog;
		//可以多线程添加日志
		ThreadPool.getInstance().getPool().execute(new Runnable() {
			public void run() {
				synchronized(operaLogContainer) {
					operaLogContainer.add(o);
				}
			}
			
		});
		if(operaLogContainer.size() >= this.logMax) {
			// 操作日志
			maxOperatAdd = true;
			//OperatLogDao operatLogDao = (OperatLogDao)SpringContextUtil.getBean("operatLogDao");
			synchronized (SINGLETON) {
				it = operaLogContainer.iterator();
				while (it.hasNext()) {
					operaLog = (LogItem) it.next();
					//operatLogDao.addLog(operaLog);
					// 从容器移除日志
					// it.remove();
					delOperatList.add(operaLog);
				}
				// 删除已持久化日志
				operaLogContainer.removeAll(delOperatList);
				delOperatList.clear();
				maxOperatAdd = false;
			}
		}
	}
	
	
	/**
	 * 通过多线程往操作日志容器里添加
	 * @param o LogItem
	 */
	public void addCallServiceLog(final LogItem o) {
		Iterator<LogItem> it=null;
		LogItem operaLog;
		//可以多线程添加日志
		ThreadPool.getInstance().getPool().execute(new Runnable() {
			public void run() {
				synchronized(callServiceLogContainer) {
					callServiceLogContainer.add(o);
				}
			}
			
		});
		if(callServiceLogContainer.size() >= this.logMax) {
			// 操作日志
			maxCallServiceAdd = true;
			//ServiceLogDao serviceLogDao = (ServiceLogDao)SpringContextUtil.getBean("serviceLogDao");
			synchronized (SINGLETON) {
				it = callServiceLogContainer.iterator();
				while (it.hasNext()) {
					operaLog = (LogItem) it.next();
					//serviceLogDao.addLog(operaLog);
					// 从容器移除日志
					// it.remove();
					delCallServiceList.add(operaLog);
				}
				// 删除已持久化日志
				callServiceLogContainer.removeAll(delCallServiceList);
				delCallServiceList.clear();
				maxCallServiceAdd = false;
			}
		}
	}
	
	/**
	 * 通过多线程往操作日志容器里添加
	 * @param o LogItem
	 */
	public void addServiceLog(final Map<String, Object> o, final String optFlowNum, final SessionStaff sessionStaff) {
		Iterator<Map<String, Object>> it=null;
		Map<String, Object> serviceLog;
		//可以多线程添加日志
		ThreadPool.getInstance().getPool().execute(new Runnable() {
			public void run() {
				long startTime = System.currentTimeMillis();
				log.debug("start handle serviceLog--");
				DataBus db = ServiceClient.callService(o, PortalServiceCode.WRITE_INTF_LOG, optFlowNum, sessionStaff);
				long useTime = System.currentTimeMillis() - startTime;
				log.debug("finish handle serviceLog--, use time {} ms", useTime);
			}
		});
//		if(serviceLogContainer.size() >= this.logMax) {
//			log.debug("start handle serviceLog--");
//			// 操作日志
//			maxServiceLogAdd = true;
//			//ServiceLogDao serviceLogDao = (ServiceLogDao)SpringContextUtil.getBean("serviceLogDao");
//			synchronized (SINGLETON) {
//				it = serviceLogContainer.iterator();
//				while (it.hasNext()) {
//					serviceLog = (Map<String, Object>) it.next();
//					//serviceLogDao.addLog(operaLog);
//					// 从容器移除日志
//					// it.remove();
//					delServiceLogList.add(serviceLog);
//				}
//				// 删除已持久化日志
//				serviceLogContainer.removeAll(delServiceLogList);
//				delServiceLogList.clear();
//				maxServiceLogAdd = false;
//			}
//			log.debug("finish handle serviceLog--");
//		}
	}
	
	/**
	 * 返回调服务层日志列表
	 * @return List<LogItem> 服务层日志列表
	 */
	public List<LogItem> getCallServiceLogContainer() {
		return callServiceLogContainer;
	}

	/**
	 * 返回门户层操作日志列表
	 * @return List<LogItem>门户层操作日志列表
	 */
	public List<LogItem> getOperaLogContainer() {
		return operaLogContainer;
	}

}
