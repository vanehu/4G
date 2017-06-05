package com.al.ec.serviceplatform.client;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import com.al.ecs.common.util.JsonUtil;


public class Test {

	public static void main(String[] args) throws IOException {
		
		/*
		DataBus databus = new DataBus();
		
		databus.setOperater("18947035596");
		databus.setOperaterType("1");
		databus.setOperaterArea("0471");
		databus.setBusiFlowId("10042010040722013211241");
		databus.setPortalCode("1002");
		databus.setPassword("222222");
		databus.setRoleCode("MANAGER");
		databus.setServiceCode("com.linkage.portal.service.ess.core.system.LoginCheck");
		databus.setOperatChannel("6003");
		databus.setOperatStaff("6003");
		//databus.setDebugCode("POR-0000");
		
		Map<String, Object> params = new HashMap<String, Object>();
	
		
		params.put("accNbr", "18953197251");
		params.put("accNbrType", "jt1001");
		params.put("password", "1");
		params.put("passwordType", "01");
		params.put("cityName", "福州");
		
		
		
		databus.setParammap(params);
		
		long sta = System.currentTimeMillis();
		
		databus = ServiceCall.call(databus);
		Map map = databus.getReturnlmap();
		
		System.out.println(databus.getResultCode());
		System.out.println(databus.getResultMsg());
		System.out.println(map);
		//System.out.println("-------------crp.getResult().getMap().get(result) = -----------"+map.get("result")+"; msg = "+map.get("msg")+"; code = "+map.get("code"));
	
		System.out.println(System.currentTimeMillis() - sta);
		//System.out.println(databus.getReturnlmap().get("blance"));
		 * 
		 */
//		Random rd1 = new Random();
//		System.out.println("*"+rd1.nextInt(30000)+"*");
//		String str1 = "2,3";
//		String str2 = "1,2";
		CsbDataMap cdm = new CsbDataMap();
		cdm.setBusCode("a");
		cdm.setActionCode("aaa");
		//cdm.setSvcCont("dadsasd");
		System.out.println(cdm.getJson());
		System.out.println(JsonUtil.toPrettyString(cdm));
		//System.out.println(isNotCompriseStringArray(str1,str2,","));
	}
	private static boolean compriseStringArray(String str1,String str2,String character){
		String strArray1[] = str1.split(character);
		String strArray2[] = str2.split(character);
		boolean flag = false;
		int count = 0;
		for (int i = 0 ; i < strArray1.length ; i++ ){
			for (int j = 0 ; j < strArray2.length ; j++ ){
				if (strArray1[i].equals(strArray2[j])){
					count++;
				}
			}
		}
		if (count == strArray1.length){
			flag = true;
		}
		return flag;
	}
	private static boolean isNotCompriseStringArray(String str1,String str2,String character){
		String strArray1[] = str1.split(character);
		String strArray2[] = str2.split(character);
		boolean flag = false;
		int count = 0;
		for (int i = 0 ; i < strArray1.length ; i++ ){
			for (int j = 0 ; j < strArray2.length ; j++ ){
				if (strArray1[i].equals(strArray2[j])){
					count++;
				}
			}
		}
		if (count == 0){
			flag = true;
		}
		return flag;
	}
}
