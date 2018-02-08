package com.al.lte.portal.core;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.Semaphore;

import org.apache.http.HttpEntity;
import org.apache.http.client.methods.HttpPost;
import org.springframework.beans.factory.annotation.Autowired;

import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.SpringContextUtil;
import com.al.lte.portal.common.SysConstant;

public class RunTask {
	protected static Warehouse buffer = new Warehouse();

	public static class Producer implements Runnable {
		@Autowired
		PropertiesUtils propertiesUtils;
		public int num = 1;
		public void run() {
			int n = num++;
			while (true) {
				try {
					PropertiesUtils propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
					String ip = propertiesUtils.getMessage("ips_ports");
					buffer.put("http://10.128.90.2:10101/ltePortal/staff/resetAllCommonParam?code=DV82KN");
					// 速度较快。休息10毫秒
					Thread.sleep(10);
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
			}
		}
	}

	// 消费者，负责减少
	public static class Consumer implements Runnable {
		public void run() {
			while (true) {
				try {
					httpPost((String)buffer.take());
					//InsertLog((ServiceRunLog) buffer.take());
					Thread.sleep(500);
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}
	}

	/**
	 * 仓库
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
		 * 入库.<br>
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
		 * 从仓库获取值
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
				// 增加非满的信号量，允许加入值
				notFull.release();
			}
		}
	}
	public static String httpPost(String url) throws IOException{
		HttpPost post = new HttpPost(url);
		HttpEntity entity = null;	
		
		
		URL getUrl = new URL(url);
		HttpURLConnection connection = (HttpURLConnection) getUrl
				.openConnection();
		//connection.setRequestProperty("Cookie", "PHPSESSID=d63c1493868c0a86dfb630649748f016");
		connection.setRequestMethod("GET");
		connection.setRequestProperty("Content-Type", "text/xml");
		connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:30.0) Gecko/20100101 Firefox/30.0");  
		connection.setDoOutput(true);
		connection.setDoInput(true);
		connection.setUseCaches(false);
		connection.connect();
		BufferedReader reader = new BufferedReader(new InputStreamReader(
				connection.getInputStream()));
		StringBuffer sb = new StringBuffer();
		String lines;
		while ((lines = reader.readLine()) != null) {
			sb.append(lines + "\n");

		}
		reader.close();
		connection.disconnect();
		return sb.toString();
	}
	public static void main(String args[]) {
		// 生产者
		new Thread(new Producer()).start();
		// 消费者
		new Thread(new Consumer()).start();
	}
}
