/**
 * 
 */
package com.al.lte.portal.httpclient;

import java.util.concurrent.TimeUnit;

import org.apache.http.conn.ClientConnectionManager;

/** 
 *  释放空闲的http链接
 *<P>
 *  TODO(类详细主功能描述)
 *<P>
 * @author CancerJun
 * @version V1.0 2011-6-13 
 * @CreateDate 2011-6-13 下午03:47:48
 * @ModifyDate 李茂君  2011-6-13<BR>
 *  why is modify Description
 * @CopyRight 亚信联创电信CRM研发部
 */

public class AbortConnectionThread extends Thread {

	private ClientConnectionManager ccm;
	
	private boolean stop = false;
	
	/**
	 * 
	 */
	public AbortConnectionThread(ClientConnectionManager cm) {
		super();
		this.ccm = cm;
	}
	
	/* (non-Javadoc)
	 * @see java.lang.Thread#run()
	 */
	@Override
	public void run() {
		
		try {

			while (!stop) {
				synchronized (this) {
					wait(90000);
					// 关闭过期连接
					ccm.closeExpiredConnections();
					// 可选地，关闭空闲超过60秒的连接
					ccm.closeIdleConnections(60, TimeUnit.SECONDS);
				}
			}

		} catch (InterruptedException ex) {

			 // 终止

		}
	}
	
	public void stopAbort(){
		stop = true;
		synchronized (this) {
			notifyAll();
		}
	}
	

}
