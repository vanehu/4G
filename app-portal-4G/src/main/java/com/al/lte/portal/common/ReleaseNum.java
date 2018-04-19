package com.al.lte.portal.common;

import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang.math.RandomUtils;
import org.apache.commons.lang.time.DateFormatUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.util.EntityUtils;

import com.al.ec.serviceplatform.client.httpclient.MyHttpclient;
import com.al.ecs.common.util.JsonUtil;

public class ReleaseNum {
	private static final String ENCODING = "UTF-8";
	public static void main (String[] args)throws Exception {
		releaseUim();
		releasePhone();
	}
	public static void releasePhone() throws Exception {
		Map paramMap = new HashMap();
		String[] phones=new String[]{"10803838484","10803838481","10803838478","10803838475","10803838472"
				,"10803838469","10803838465","10803838462","10803838459","10803838456","10803838453","10803838450"
				,"10803838447","10803838557","10803838554","10803838551","10803838544","10803838541","10803838538"
				,"10803838535"};
		for(int i=0;i<phones.length;i++){
			Map<String,Object> reqInfo=new HashMap<String,Object>();
			Date date = new Date();
			String reqTime = DateFormatUtils.format(date, "yyyyMMddHHmmssSSS");
			int randInt = RandomUtils.nextInt(900000000) + 100000000;
			reqInfo.put("tranId", reqTime + randInt);
			reqInfo.put("reqTime", reqTime.substring(0, 14));
			reqInfo.put("srcSysID", "1000000045");
			reqInfo.put("requestService", "PnReserveService");
			paramMap.put("reqInfo", reqInfo);
			paramMap.put("actionType", "F");
			paramMap.put("anTypeCd", "3");
			paramMap.put("areaId", "8999900");
			paramMap.put("channelId", "3187");
			paramMap.put("orderNo", "");
			paramMap.put("phoneNumber", phones[i]);
			paramMap.put("provinceId", "609801");
			paramMap.put("staffId", "326005914190");
			String paramString = JsonUtil.toString(paramMap);
			System.out.println("paramString : "+ paramString);
			//调用http服务
			String url = "http://192.168.111.98:9084/SRHttpServiceWeb/service/";
			String method = "PnReserveService/pnReserveService";
			HttpPost post = new HttpPost(url + method);
			post.addHeader("Content-Type", "text/xml");
			HttpEntity entity = null;
			entity = new StringEntity(paramString,ENCODING);
			post.setEntity(entity);
			HttpClient httpclient = MyHttpclient.getInstance().getHttpclient();
			
			HttpResponse httpresponse = httpclient.execute(post);
			
			entity = httpresponse.getEntity();
			String retnJson = EntityUtils.toString(entity, ENCODING);
			//返回成功
			if(httpresponse.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
				System.out.println("success:" + retnJson);
			} else {
				System.out.println("error:" + retnJson);
			}
			
			post.abort();//连接停止，释放资源
			try {
				if (null != entity) {
					EntityUtils.consume(entity);
				}
				
			} catch (IOException e) {
				
			}
		}
	}
	public static void releaseUim() throws Exception {
		Map paramMap = new HashMap();
		String[] phones=new String[]{
				"89860313007500373460","89860313007500373450",
			    "89860313007500373430","8986031180371181537",
				"8986031180371181538",
				"8986031080371139827",
				"8986031180371181541",
				"8986031080371140003",
				"8986031080371140046",
				"8986031180371181292",
				"8986031080371140295",
				"8986031180371181350",
				"8986031080371140357",
				"8986031080371139469",
				"8986031180371132661",
				"8986031180371132662",
				"8986031180371132663",
				"8986031180371132664",
				"8986031180371132665",
				"8986031180371132666",
				"8986031180371132667",
				"8986031180371181445",
				"8986031080371139597",
				"8986031080371139598",
				"8986031080371139599",
				"8986031180371181391",
				"8986031180371181392",
				"8986031180371132710",
				"8986031180371132711",
				"8986031180371132712",
				"8986031180371188963"};
		for(int i=0;i<phones.length;i++){
			Map<String,Object> reqInfo=new HashMap<String,Object>();
			Date date = new Date();
			String reqTime = DateFormatUtils.format(date, "yyyyMMddHHmmssSSS");
			int randInt = RandomUtils.nextInt(900000000) + 100000000;
			reqInfo.put("tranId", reqTime + randInt);
			reqInfo.put("reqTime", reqTime.substring(0, 14));
			reqInfo.put("srcSysID", "1000000045");
			reqInfo.put("requestService", "UIMReserveService");
			paramMap.put("reqInfo", reqInfo);
			paramMap.put("actionType", "F");
			paramMap.put("instCode", phones[i]);
			paramMap.put("areaId", "8999900");
			paramMap.put("channelId", "3187");
			paramMap.put("orderNo", "");
			paramMap.put("phoneNum", "10803838481");
			paramMap.put("provinceId", "609801");
			paramMap.put("staffId", "326005914190");
			String paramString = JsonUtil.toString(paramMap);
			System.out.println("paramString : "+ paramString);
			//调用http服务
			String url = "http://192.168.111.98:9084/SRHttpServiceWeb/service/";
			String method = "UIMInfoUpdService/uimCardRelease";
			HttpPost post = new HttpPost(url + method);
			post.addHeader("Content-Type", "text/xml");
			HttpEntity entity = null;
			entity = new StringEntity(paramString,ENCODING);
			post.setEntity(entity);
			HttpClient httpclient = MyHttpclient.getInstance().getHttpclient();
			
			HttpResponse httpresponse = httpclient.execute(post);
			
			entity = httpresponse.getEntity();
			String retnJson = EntityUtils.toString(entity, ENCODING);
			//返回成功
			if(httpresponse.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
				System.out.println("success:" + retnJson);
			} else {
				System.out.println("error:" + retnJson);
			}
			
			post.abort();//连接停止，释放资源
			try {
				if (null != entity) {
					EntityUtils.consume(entity);
				}
				
			} catch (IOException e) {
				
			}
		}
	}
}
