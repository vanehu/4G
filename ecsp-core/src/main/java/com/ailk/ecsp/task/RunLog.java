package com.ailk.ecsp.task;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.Semaphore;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ailk.ecsp.core.DataRepository;
import com.ailk.ecsp.core.DataSourceRouter;
import com.ailk.ecsp.core.SysConstant;
import com.ailk.ecsp.mybatis.mapper.ServiceRunLogMapperImpl;
import com.ailk.ecsp.mybatis.model.ServiceRunLog;
import com.ailk.ecsp.util.SpringContextUtil;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.PropertiesUtils;

public class RunLog {

	private static RunLog runLog;
	private static final Logger logger = LoggerFactory.getLogger(RunLog.class);
	private ServiceRunLogMapperImpl serviceRunLogMapper = new ServiceRunLogMapperImpl();
	protected static BlockingQueue<ServiceRunLog> list;
	protected static Warehouse buffer = new Warehouse();

	public static RunLog getInstance() {
		if (null == runLog) {
			runLog = new RunLog();
		}
		return runLog;
	}

	private RunLog() {
		list = new LinkedBlockingQueue<ServiceRunLog>();
	}

	/**
	 * 添加日志信息
	 * 
	 * @param log
	 */
	public void addRunlog(ServiceRunLog log) {
		if (null == list) {
			list = new LinkedBlockingQueue<ServiceRunLog>();
		}
		
		if(log.getDbKeyWord() != null && !DataRepository.getInstence().getAllSysParam().containsKey(log.getDbKeyWord())){
			logger.info("日志记录异常，无效的路由参数：{}",log.getDbKeyWord());
			return;
		}

		String writeLogFLag = DataRepository.getInstence().getSysParamValue(log.getDbKeyWord(),
				SysConstant.CON_WRITE_LOG_FLAG,
				SysConstant.CON_SYS_PARAM_GROUP_SYS_PARAM);
		if (!SysConstant.CON_ON.equals(writeLogFLag)) {
			return;
		}
		PropertiesUtils propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
		String log_flag = propertiesUtils.getMessage(log.getServiceCode());
		if(!"1".equals(log_flag)){
			if("2".equals(log_flag)){
				if(ResultCode.R_SUCC.equals(log.getResultCode()) || ResultCode.R_SUCCESS.equals(log.getResultCode())|| ResultCode.RES_SUCCESS.equals(log.getResultCode())){
					return;
				}
			}else{
				return;
			}
		}
		String writeLogDetail = DataRepository.getInstence().getSysParamValue(log.getDbKeyWord(),
				SysConstant.CON_WRITE_LOG_DETAIL,
				SysConstant.CON_SYS_PARAM_GROUP_SYS_PARAM);
		if (SysConstant.WRITE_LOG_DETAIL_NO.equalsIgnoreCase(writeLogDetail)) {
			log.setOutParam(null);
			log.setInParam(null);
			log.setInIntParam(null);
			log.setOutIntParam(null);
		} else if (SysConstant.WRITE_LOG_DETAIL_UNILOG
				.equalsIgnoreCase(writeLogDetail)) {
			log.setOutParam(null);
			log.setInParam(null);
			log.setInIntParam(null);
			log.setOutIntParam(null);
		}
		list.add(log);
		int max = 1;
		try {
			String maxnum = DataRepository.getInstence().getSysParamValue(log.getDbKeyWord(),
					"Log_Max", SysConstant.CON_SYS_PARAM_GROUP_LOG);
			if (null != maxnum && !"".equals(maxnum)) {
				max = Integer.valueOf(maxnum);
			}
		} catch (Exception e) {
			max = 1;
			logger.error("", "获取Log_Max参数失败，您可能没有配置Log_Max参数，将使用1作为默认值！");
		}
		// logger.debug("^^^^^^^^^ log size ：{}" , list.size());
		// logger.debug("^^^^^^^^^ max size ：{}" , max);
		if (max == 1){
			if (list.size() >= max) {
				writeRunlog();
			}
		}else{
			new Thread(new Producer()).start();
			new Thread(new Consumer()).start();
		}
	}

	/**
	 * 日志入库
	 */
	public void writeRunlog() {
		final List<ServiceRunLog> loglist = new ArrayList<ServiceRunLog>();
		synchronized (list) {
			logger.debug("日志记录定时器执行,日志条数:{}",list.size());
			loglist.addAll(list);
			new Thread() {
				public void run() {
					batchInsertLog(loglist);
					loglist.clear();
				}
			}.start();
			list.clear();
		}

	}

	public void batchInsertLog(List<ServiceRunLog> loglist) {
		if (loglist == null || loglist.size() == 0) {
			return;
		}
		for (int i = 0; i < loglist.size(); i++) {
			try {
				ServiceRunLog srl = loglist.get(i);
				DataSourceRouter.setRouteFactor(srl.getDbKeyWord());
				int flag = serviceRunLogMapper.insert(srl, srl.getDbKeyWord());
				if (srl.getId() > 0
						&& (StringUtils.isNotBlank(srl.getInParam()) || StringUtils
								.isNotBlank(srl.getOutParam()))) {
					serviceRunLogMapper.insertDetail(srl, srl.getDbKeyWord());
				}
				if ((StringUtils.isNotBlank(srl.getInIntParam()) || StringUtils
						.isNotBlank(srl.getOutIntParam()))) {
					String inParam = srl.getInIntParam();
					String outParam = srl.getOutIntParam();
					srl.setInParam(inParam);
					srl.setOutParam(outParam);
					serviceRunLogMapper.insertDetail(srl, srl.getDbKeyWord());
				}
			} catch (Exception e) {
				logger.error("", e);
			}
		}

	}

	public void InsertLog(ServiceRunLog log) {
		if (log == null) {
			return;
		}
		try {
			DataSourceRouter.setRouteFactor(log.getDbKeyWord());
			int flag = serviceRunLogMapper.insert(log, log.getDbKeyWord());
			if (log.getId() > 0
					&& (StringUtils.isNotBlank(log.getInParam()) || StringUtils
							.isNotBlank(log.getOutParam()))) {
				serviceRunLogMapper.insertDetail(log, log.getDbKeyWord());
			}
			if ((StringUtils.isNotBlank(log.getInIntParam()) || StringUtils
					.isNotBlank(log.getOutIntParam()))) {
				String inParam = log.getInIntParam();
				String outParam = log.getOutIntParam();
				log.setInParam(inParam);
				log.setOutParam(outParam);
				serviceRunLogMapper.insertDetail(log, log.getDbKeyWord());
			}
		} catch (Exception e) {
			logger.error("", e);
		}

	}

	// 生产者，负责增加
	protected class Producer implements Runnable {
		public int num = 1;
		public void run() {
			int n = num++;
			while (true) {
				try {
					buffer.put(list.take());
					// 速度较快。休息10毫秒
					Thread.sleep(10);
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
			}
		}
	}

	// 消费者，负责减少
	protected class Consumer implements Runnable {
		public void run() {
			while (true) {
				try {
					InsertLog((ServiceRunLog) buffer.take());
					Thread.sleep(500);
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
			}
		}
	}

	/**
	 * 日志仓库
	 * 
	 * @author xuj
	 */
	static class Warehouse {
		// 非满锁
		final Semaphore notFull = new Semaphore(10);
		// 非空锁
		final Semaphore notEmpty = new Semaphore(0);
		// 核心锁
		final Semaphore mutex = new Semaphore(1);
		// 库存容量
		final Object[] items = new Object[10];
		int putptr, takeptr, count;

		/**
		 * 把日志放入库.<br>
		 * 
		 * @param x
		 * @throws InterruptedException
		 */
		public void put(Object x) throws InterruptedException {
			// 保证非满
			notFull.acquire();
			// 保证不冲突
			mutex.acquire();
			try {
				// 增加库存
				items[putptr] = x;
				if (++putptr == items.length)
					putptr = 0;
				++count;
			} finally {
				// 退出核心区
				mutex.release();
				// 增加非空信号量，允许获取日志
				notEmpty.release();
			}
		}

		/**
		 * 从仓库获取日志
		 * 
		 * @return
		 * @throws InterruptedException
		 */
		public Object take() throws InterruptedException {
			// 保证非空
			notEmpty.acquire();
			// 核心区
			mutex.acquire();
			try {
				// 减少库存
				Object x = items[takeptr];
				if (++takeptr == items.length)
					takeptr = 0;
				--count;
				return x;
			} finally {
				// 退出核心区
				mutex.release();
				// 增加非满的信号量，允许加入日志
				notFull.release();
			}
		}
	}
}
