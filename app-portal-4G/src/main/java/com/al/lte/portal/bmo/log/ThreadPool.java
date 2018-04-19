package com.al.lte.portal.bmo.log;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/**
 * TODO 类 概述 .
 * <BR>
 *  TODO 要点概述.
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-5-11
 * @createDate 2012-5-11 下午4:25:07
 * @modifyDate tang zheng yu 2012-5-11 <BR>
 * @copyRight 亚信联创EC研发部
 */
public final class ThreadPool {
	/** 默认最大线程个数256 */
	public static final int DEFAULT_MAX_THREAD_COUNT = 256;
	/** 单例子 */
	private static ThreadPool SINGLETON = new ThreadPool();
	/** lock */
	private static final Object LOCK = new Object();
	/** 最大线程个数 */
	private int maxThreadCount = DEFAULT_MAX_THREAD_COUNT;
	/** 初始化32个线程 */
	private int coreThreadCount = 32;
	/** 任务队列64个 */
	private int taskQueueSize = 64;

	/** 线程池 */
	private ThreadPoolExecutor pool;
	/**
	 * 私有构造
	 */
	private ThreadPool() {
		pool = new ThreadPoolExecutor(coreThreadCount, maxThreadCount, 30L,
				TimeUnit.SECONDS, new ArrayBlockingQueue<Runnable>(
						taskQueueSize),
						new ThreadPoolExecutor.DiscardOldestPolicy());
	}
	/**
	 * 返回实例
	 * @return ThreadPool ThreadPool
	 */
	public static ThreadPool getInstance() {
		synchronized (LOCK) {
			if (null == SINGLETON) {
				SINGLETON = new ThreadPool();
			}
		}
		return SINGLETON;
	}

	/**
	 * 返回线程池对象
	 * @return ThreadPoolExecutor 线程池对象
	 */
	public ThreadPoolExecutor getPool() {
		return pool;
	}
	
}
