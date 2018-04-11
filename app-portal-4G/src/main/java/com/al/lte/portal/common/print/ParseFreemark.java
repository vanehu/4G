package com.al.lte.portal.common.print;

import java.util.HashMap;
import java.util.Map;

import com.al.ecs.freemarker.FreemarkerHandler;


/**
 * freemark解析成字符串
 * 
 * @author linm
 */
public class ParseFreemark {
	public static String parseTemplate(Map inMap, String ftlName) throws Exception {
		return buildInParam(inMap, ftlName);
	}
	public static String buildInParam(Map<String, Object> inMap, String ftlName) {
		FreemarkerHandler fh = FreemarkerHandler.getInstance();
		fh.setTemplateLoaderPaths("/report/ftl");
		String html = fh.processTemplate(ParseFreemark.class, ftlName + ".ftl", inMap);
		return html;
	}
	public static void main(String[] args) {
		Map<String,Object> mm=new HashMap<String,Object>();
		mm.put("custName", "test");
		try{
		System.out.println(parseTemplate(mm,"fw8460000"));
		}catch(Exception e){
			
		}
	}
}
