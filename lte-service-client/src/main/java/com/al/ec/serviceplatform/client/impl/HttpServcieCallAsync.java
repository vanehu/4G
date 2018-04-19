package com.al.ec.serviceplatform.client.impl;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.lang.reflect.Method;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.apache.commons.lang.StringUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.util.EntityUtils;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ec.serviceplatform.client.ServiceCallType;
import com.al.ec.serviceplatform.client.httpclient.MyHttpclient;
import com.al.ecs.common.util.JsonUtil;

/**
 * TODO 类 概述 . <BR>
 * TODO 要点概述.
 * <P>
 * 
 * @author tang zheng yu
 * @version V1.0 2012-8-29
 * @createDate 2012-8-29 下午2:05:53
 * @modifyDate tang zheng yu 2012-8-29 <BR>
 * @copyRight 亚信联创EC研发部
 */
public class HttpServcieCallAsync implements ServiceCallType {

	private static final String ENCODING = "UTF-8";
	private ExecutorService mThreadPool = Executors.newFixedThreadPool(30);

	public DataBus callServcie(DataBus databus) {
		Future<DataBus> future=mThreadPool.submit(new AsyncThread(databus));
		if(future!=null){
			try {
				return future.get();
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (ExecutionException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			return null;
		}
		return null;
	}

	class AsyncThread implements Callable<DataBus>{
		private DataBus databus;

		public AsyncThread(DataBus databus) {
			this.databus = databus;
		}

		public DataBus call() throws Exception {
			return callServcieAsync(databus);
		}

		public DataBus callServcieAsync(DataBus databus) {

			HttpPost post = new HttpPost(MyHttpclient.getInstance().getUrl());

			HttpEntity entity = null;

			try {
				entity = new StringEntity(JsonUtil.toString(databus),
						ENCODING);
				post.setEntity(entity);
				HttpResponse httpresponse = MyHttpclient.getInstance()
						.getHttpclient().execute(post);
				entity = httpresponse.getEntity();
				String response = EntityUtils.toString(entity, ENCODING);
				// 返回成功
				if (httpresponse.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
					databus = (DataBus) JsonUtil.toObject(response,
							DataBus.class);
				} else {
					databus.setResultCode(ResultCode.R_SERV_CALL_FAIL);
					databus.setResultMsg("连接服务层异常(http code:"
							+ httpresponse.getStatusLine().getStatusCode()
							+ ")" + EntityUtils.toString(entity, ENCODING));
				}
				
				/*
				if ("T".equals(debug)) {
					
					String str = JsonUtil.toString(databus);
					com.al.ec.portal.serviceplatform.service.DataBus db = (com.al.ec.portal.serviceplatform.service.DataBus) JsonUtil
							.toObject(
									str,
									com.al.ec.portal.serviceplatform.service.DataBus.class);
					Class c = Class.forName(databus.getServiceCode());
					Object obj = c.newInstance();
					Method method = c
							.getMethod(
									"exec",
									com.al.ec.portal.serviceplatform.service.DataBus.class,
									String.class);
					method.invoke(obj, db, "");
					String str1 = JsonUtil.toString(db);
					databus = (DataBus) JsonUtil.toObject(str1, DataBus.class);
					
				} else {}
				 */
			} catch (UnsupportedEncodingException e) {
				databus.setResultCode(ResultCode.R_SERV_CALL_FAIL);
				databus.setResultMsg("调用服务层异常UnsupportedEncodingException("
						+ e.getMessage() + ")");
				e.printStackTrace();
			} catch (ClientProtocolException e) {
				e.printStackTrace();
				databus.setResultCode(ResultCode.R_SERV_CALL_FAIL);
				databus.setResultMsg("调用服务层异常 ClientProtocolException("
						+ e.getMessage() + ")");
			} catch (IOException e) {
				databus.setResultCode(ResultCode.R_SERV_CALL_FAIL);
				databus.setResultMsg("调用服务层异常 IOException (" + e.getMessage()
						+ ")");
				e.printStackTrace();
			} catch (Exception e) {
				databus.setResultCode(ResultCode.R_SERV_CALL_FAIL);
				databus.setResultMsg("调用服务层异常 IOException (" + e.getMessage()
						+ ")");
				e.printStackTrace();
			} finally {
				post.abort();// 连接停止，释放资源
				try {
					if (null != entity) {
						EntityUtils.consume(entity);
					}

				} catch (IOException e) {
					databus.setResultCode(ResultCode.R_SERV_CALL_FAIL);
					databus.setResultMsg("调用服务层异常 IOException ("
							+ e.getMessage() + ")");
				}

			}

			return databus;
		}
	}

	public void reloadCfg() {

		MyHttpclient.getInstance().reloadConfig();

	}

}
