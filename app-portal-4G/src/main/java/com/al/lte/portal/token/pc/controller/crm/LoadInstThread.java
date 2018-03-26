package com.al.lte.portal.token.pc.controller.crm;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.CountDownLatch;
import javax.servlet.http.HttpServletRequest;

import org.jfree.util.Log;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.lte.portal.bmo.crm.OfferBmo;
import com.al.lte.portal.model.SessionStaff;

public class LoadInstThread extends Thread{
	
	private Map<String, Object> paramMap;
	private CountDownLatch latch;
	private List<Map<String, Object>> successList;
	private List<Map<String, Object>> failList;
	private HttpServletRequest request;
	private OfferBmo offerBmo;
	private SessionStaff sessionStaff;
	
	public LoadInstThread(Map<String, Object> paramMap, CountDownLatch latch,List<Map<String, Object>> successList,List<Map<String, Object>> failList,HttpServletRequest request,OfferBmo offerBmo,SessionStaff sessionStaff){
		this.paramMap=paramMap;
		this.latch=latch;
		this.failList=failList;
		this.successList=successList;
		this.request=request;
		this.offerBmo = offerBmo;
		this.sessionStaff=sessionStaff;
	}

	public void run() {
		try {
			Map<String, Object> resMap=new HashMap<String, Object>();
			Map<String, Object> resultMap=new HashMap<String, Object>();
			resultMap.put("code", "-1");
			
        	try {
				resMap = offerBmo.loadInst(paramMap,null,sessionStaff);
			} catch (Exception e) {
				Log.error(e);
			}
        	
        	//加载实例		
        	if(ResultCode.R_SUCC.equals(resMap.get("code"))){
        		successList.add(resultMap);
        	}else{
        		failList.add(resultMap);
        	}
			
		} catch (Exception e) {
			Log.error(e);
		}
		latch.countDown();
	}
}
