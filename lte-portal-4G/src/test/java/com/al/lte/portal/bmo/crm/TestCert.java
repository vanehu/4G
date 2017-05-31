package com.al.lte.portal.bmo.crm;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import net.sf.json.xml.XMLSerializer;

import org.apache.commons.lang.StringUtils;

import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.XmlUtil;
import com.al.lte.portal.common.AESUtils;
import com.al.lte.portal.common.CommonUtils;
import com.al.lte.portal.model.Cert;

public class TestCert {
	
	public static void main(String[] args){
		//http://localhost:8080/provPortal/properties/getCtrlSecret?versionId=vbKP8mMf88Ob&param=1FD8EAEC27DC4488C14F97D7D26D7D5382BE854DB173FB86B330F273CF5EDB9B5A43C8F48C469A3DA319E31DE3CAF5579A8A7E6E1DB62C73BB95E0C0AD77697EC5E0B6D2525339BFB6031DAF29C21561CBA2CC151A2926CFF3F429C343776C90A79B1FCECFC602AC687CC1B7C894853076BF20B1F91BFF3A48B4DF10028270B7D6813344A4DA479BBCF7A04EDC582DAB
		//param=1FD8EAEC27DC4488C14F97D7D26D7D5382BE854DB173FB86B330F273CF5EDB9B5A43C8F48C469A3DA319E31DE3CAF5579A8A7E6E1DB62C73BB95E0C0AD77697EC5E0B6D2525339BFB6031DAF29C21561CBA2CC151A2926CFF3F429C343776C90A79B1FCECFC602AC687CC1B7C894853076BF20B1F91BFF3A48B4DF10028270B7D6813344A4DA479BBCF7A04EDC582DAB

//		XmlUtilTest();
//		XmlSerializerTest();
//		calendarTest();
//		UUIDTest();
		encryptedTest();
	}
	
	@SuppressWarnings("unchecked")
	private static void XmlSerializerTest(){
		String decryptedRespXml = "<response><resultFlag>1</resultFlag><errorMsg>失败</errorMsg></response>";
		String decryptedParamXml = "<request><appId>wx8b39f1a66f31e6ed</appId><appSecret>8fc231fe8ccd7d0f58e0b26fdd97b45d</appSecret><now3desSecret>qwe</now3desSecret></request>";
		String jsonStr = "{'appId':'123','appSecret':'asd','3desSecret':'qwe'}";
		jsonStr = StringUtils.replace(jsonStr, "3desSecret", "Secret3des");
		
		XMLSerializer xmlSerializer = new XMLSerializer();
		String ResqjsonStr = xmlSerializer.read(decryptedRespXml).toString();
		String RespjsonStr = xmlSerializer.read(decryptedParamXml).toString();
		Map<String, Object> resqJsonMapObj = JsonUtil.toObject(ResqjsonStr, Map.class);
		Map<String, Object> respJsonMapObj = JsonUtil.toObject(RespjsonStr, Map.class);
		
		//{"resultFlag":"1","errorMsg":"失败"}
		System.out.println(JsonUtil.toString(resqJsonMapObj));
		//{"appId":"123","appSecret":"asd","now3desSecret":"qwe"}
		System.out.println(JsonUtil.toString(respJsonMapObj));
		
		String result = CommonUtils.jsontoXml(jsonStr);
		result = StringUtils.replace(result, "<o>", "<response>");
		result = StringUtils.replace(result, "</o>", "</response>");
		result = StringUtils.replace(result, "Secret3des", "3desSecret");
		System.out.println(result);
		result = AESUtils.encryptToString(decryptedParamXml, "74#2iBN4&29eV@Ye");
		System.out.println(result);
	}

	private static void calendarTest(){
		Calendar currentCalendar = Calendar.getInstance();
		Calendar configCalendar = Calendar.getInstance();
		SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		
		try {
			configCalendar.setTime(simpleDateFormat.parse("2000-12-12 23:23:01"));
			System.out.println(currentCalendar.compareTo(configCalendar));
		} catch (ParseException e) {
			e.printStackTrace();
		}
	}
	
	private static void XmlUtilTest(){
//		String jsonStr = JsonUtil.toString(parseXmlMap);
//		jsonStr = StringUtils.replace(jsonStr, "", "");
//		String resultXmlStr = CommonUtils.jsontoXml(jsonStr);//json以数字开头的key转换异常
//		resultXmlStr = StringUtils.replace(StringUtils.replace(resultXmlStr, "<o>", "<response>"), "</o>", "</response>");

		Map<String, Object> subMap = new HashMap<String, Object>();
		Map<String, Object> rootMap = new HashMap<String, Object>();
		subMap.put("appId", 123);
		subMap.put("appSecret", "asd");
		subMap.put("3desSecret", "qwe");
		rootMap.put("response", subMap);
		
		String xmlStr = XmlUtil.getXMLFromMap(rootMap, 0);
		
		System.out.println(xmlStr);
	}
	
	private static void UUIDTest(){
		String logId = UUID.randomUUID().toString();
		System.out.println(logId);
		System.out.println(logId.length());
		System.out.println(logId.replaceAll("-", ""));
		System.out.println(logId.replaceAll("-", "").length());
	}
	
	private static void encryptedTest(){
		String aesSecret = "74#2iBN4&29eV@Ye";
		String param = "C940BDED780716EF31373DA414FA1B7EA3CB8EA7B9060209B351F7D391713F4E13397908304BF0D9610375BCBE6DB5CA85215696D7D4B9D5DC17346C3D2C51C19C1A37081724D0E939287362E40F6D586C0737646A59269D4500CE4F349BE6767683D2125948B16072E30F12B537280D6AF42C82FA1A290CCCBD65F2C6C8666920C96BBEA114E42876D596C8EFEEAFD4D0C7FF6C609C6531AD0B11161ADFAB1A347AE29C86CA910D3AA5CA21D9CB8AD1C2D27AF392ED104957CBB77EE51AF4A6319BFC7EFCC4F97A035A3823B8898DD20C0F435B909BA635BB99ABDFEFE19ED7C48A4A335CA13BE85F7CAC9CAD920464CCCCE2CCF0DF2A27A666133A6C0C49ACF19C54EBE627A5621DDAD519A5E205BF52D1C52E5C1B382E8B1A7F7EEFAC62EAC170B4096A29B1522B0273B8C58CC4DB5442E96742F53C769CA99FA11C22417E1EFDCBB6E2ED5B234346C87C8D114D2F736C7D0569457B2A91AACF410C520AA4D05BE8F331FCDF2425DA8BF49C2886AC";
		Cert cert = Cert.getInstance();
		String result = cert.decryptAes(param, aesSecret);
		System.out.println(result);
	}
}
