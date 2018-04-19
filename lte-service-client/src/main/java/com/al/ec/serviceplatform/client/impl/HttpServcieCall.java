package com.al.ec.serviceplatform.client.impl;

import java.io.IOException;
import java.io.UnsupportedEncodingException;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.util.EntityUtils;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ec.serviceplatform.client.ServiceCallType;
import com.al.ec.serviceplatform.client.httpclient.MyHttpclient;
import com.al.ecs.common.util.JsonUtil;
public class HttpServcieCall implements ServiceCallType {
	
	private static final String ENCODING = "UTF-8";

	public  DataBus callServcie(DataBus databus) {

		HttpPost post = new HttpPost(MyHttpclient.getInstance().getUrl());
		
		HttpEntity entity = null;	

		try {
			/*
			String debug = "F";
			String model = MyHttpclient.getInstance().getDebug();
			if(StringUtils.isNotBlank(model)){
				debug = model;
			}
			*/
			DataMap dm = new DataMap();
			dm = convertDataBus(databus);
			entity = new StringEntity(JsonUtil.toString(dm),ENCODING);
			post.setEntity(entity);
			HttpResponse httpresponse = MyHttpclient.getInstance().getHttpclient().execute(post);
			entity = httpresponse.getEntity();
			String response = EntityUtils.toString(entity, ENCODING);
			//返回成功
			if(httpresponse.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
				dm =  (DataMap) JsonUtil.toObject(response, DataMap.class);
				databus = convertDataMap(dm);
			} else {
				databus.setResultCode(ResultCode.R_SERV_CALL_FAIL);
				databus.setResultMsg("连接服务层异常(http code:"+httpresponse.getStatusLine().getStatusCode()+")"+EntityUtils.toString(entity, ENCODING));
			}	
			/*
			if ("T".equals(debug)){			
				String str = JsonUtil.toString(databus);
				com.al.ec.portal.serviceplatform.service.DataBus db = (com.al.ec.portal.serviceplatform.service.DataBus)JsonUtil.toObject(str,com.al.ec.portal.serviceplatform.service.DataBus.class);
				Class c = Class.forName(databus.getServiceCode());
			    Object obj = c.newInstance();
			    Method method = c.getMethod("exec", com.al.ec.portal.serviceplatform.service.DataBus.class, String.class); 
			    method.invoke(obj, db, ""); 
				String str1 = JsonUtil.toString(db);
				databus =  (DataBus) JsonUtil.toObject(str1, DataBus.class);
			}else{
				entity = new StringEntity(JsonUtil.toString(databus),ENCODING);
				post.setEntity(entity);
				HttpResponse httpresponse = MyHttpclient.getInstance().getHttpclient().execute(post);
				entity = httpresponse.getEntity();
				String response = EntityUtils.toString(entity, ENCODING);
				//返回成功
				if(httpresponse.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
					databus =  (DataBus) JsonUtil.toObject(response, DataBus.class);
				} else {
					databus.setResultCode(ResultCode.R_SERV_CALL_FAIL);
					databus.setResultMsg("连接服务层异常(http code:"+httpresponse.getStatusLine().getStatusCode()+")"+EntityUtils.toString(entity, ENCODING));
				}	
			}
			 */
				
		} catch (UnsupportedEncodingException e) {
			databus.setResultCode(ResultCode.R_SERV_CALL_FAIL);
			databus.setResultMsg("调用服务层异常UnsupportedEncodingException("+e.getMessage()+")");
			e.printStackTrace();
		} catch (ClientProtocolException e) {
			e.printStackTrace();
			databus.setResultCode(ResultCode.R_SERV_CALL_FAIL);
			databus.setResultMsg("调用服务层异常 ClientProtocolException("+e.getMessage()+")");
		} catch (IOException e) {
			databus.setResultCode(ResultCode.R_SERV_CALL_FAIL);
			databus.setResultMsg("调用服务层异常 IOException ("+e.getMessage()+")");
			e.printStackTrace();
		} catch (Exception e) {
			databus.setResultCode(ResultCode.R_SERV_CALL_FAIL);
			databus.setResultMsg("调用服务层异常 IOException ("+e.getMessage()+")");
			e.printStackTrace();
		}finally{
			post.abort();//连接停止，释放资源
			try {
				if (null != entity) {
					EntityUtils.consume(entity);
				}
				
			} catch (IOException e) {
				databus.setResultCode(ResultCode.R_SERV_CALL_FAIL);
				databus.setResultMsg("调用服务层异常 IOException ("+e.getMessage()+")");
			}
			
		}
		
		return databus;
	}

	public void reloadCfg() {
		
		MyHttpclient.getInstance().reloadConfig();
		
	}
	public static DataMap convertDataBus(DataBus db) {
		DataMap dm = new DataMap();
		
		dm.setInParam(db.getParammap());
		dm.setOutParam(db.getReturnlmap());
		dm.setResultCode(db.getResultCode());
		dm.setResultMsg(db.getResultMsg(), null);
		dm.setServiceCode(db.getServiceCode());
		dm.setAreaCode(db.getOperaterArea());
		dm.setAreaId("");
		dm.setBusiFlowId(db.getBusiFlowId());
		dm.setChannelId(db.getOperatChannel());
		dm.setChannelName(db.getOperatChannelName());
		dm.setPortalCode(db.getPortalCode());
		dm.setProvinceCode(db.getProvinceCode());
		dm.setStaffId(db.getOperatStaffID());
		dm.setStaffName(db.getOperatStaff());
		return dm;
	}

	public static DataBus convertDataMap(DataMap dm) {
		DataBus db = new DataBus();
		
		db.setParammap(dm.getInParam());
		db.setReturnlmap(dm.getOutParam());
		db.setResultCode(dm.getResultCode());
		db.setResultMsg(dm.getResultMsg());
		db.setServiceCode(dm.getServiceCode());
		db.setOperaterArea(dm.getAreaCode());
		db.setBusiFlowId(dm.getBusiFlowId());
		db.setOperatChannel(dm.getChannelId());
		db.setOperatChannelName(dm.getChannelName());
		db.setPortalCode(dm.getPortalCode());
		db.setProvinceCode(dm.getProvinceCode());
		db.setOperatStaffID(dm.getStaffId());
		if(dm.get("inIntParam")!=null){
			db.setInIntParam(dm.get("inIntParam").toString());
		}
		if(dm.get("outIntParam")!=null){
			db.setOutIntParam(dm.get("outIntParam").toString());
		}
		return db;
	}
}
