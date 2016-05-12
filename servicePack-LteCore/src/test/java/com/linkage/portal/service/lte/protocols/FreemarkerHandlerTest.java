package com.linkage.portal.service.lte.protocols;


import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.xml.parsers.ParserConfigurationException;

import org.junit.Test;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import freemarker.template.TemplateException;


public class FreemarkerHandlerTest {

	/**
	 * 通过文件式的模板
	 * @throws SAXException
	 * @throws IOException
	 * @throws ParserConfigurationException
	 * @throws TemplateException
	 */
	@Test
	public void testFile() {
    	FreemarkerHandler fh=FreemarkerHandler.getInstance();
    	fh.setTemplateLoaderPaths("/com/linkage/portal/service/lte/protocols");
    	Map model = new HashMap();
    	model.put("name", "唐征宇");
    	model.put("email", "zhengy_t@163.com");
    	List telphoneList= new ArrayList();
    	telphoneList.add("123456");
    	telphoneList.add("42143123");
    	model.put("telphoneList", telphoneList);
    	List addressList= new ArrayList();
    	Map addressMap=new HashMap();
    	addressMap.put("zpcode", "350000");
    	addressList.add(addressMap);
    	addressMap=new HashMap();
    	addressMap.put("zpcode", "300000");
    	addressList.add(addressMap);
    	model.put("telphoneList", telphoneList);
    	model.put("addressList", addressList);
    	Map attrMap=new HashMap();
    	attrMap.put("cd", "140000007");
    	attrMap.put("val", "0");
    	model.put("attr", attrMap);
    	String result=fh.processTemplate("demo.ftl", model);
        System.out.println(result);

	}
	
	/**
	 * 通过字符串式的模板
	 * @throws SAXException
	 * @throws IOException
	 * @throws ParserConfigurationException
	 * @throws TemplateException
	 */
	@Test
	public void testString(){
		FreemarkerHandler fh=FreemarkerHandler.getInstance();
    	Map model = new HashMap();
    	model.put("name", "唐征宇");
    	model.put("email", "zhengy_t@163.com");
    	String result=fh.processTemplateByContent("${name}${email}aaa ${datetime(\"yyyy-MM-dd\")}",model);
        System.out.println(result );
        result=fh.processTemplateByContent("<#assign x =\"${name}\">${name}${email}aaa ${datetime('x')}",model);
        System.out.println(result );
	}
	
	
	@Test
	public void testCacheFile() {
    	FreemarkerHandler fh=FreemarkerHandler.getInstance();
    	fh.setTemplateLoaderPaths("/com/al/ecs/service/protocols");
    	Map model = new HashMap();
    	model.put("name", "唐征宇");
    	model.put("email", "zhengy_t@163.com");
    	List telphoneList= new ArrayList();
    	telphoneList.add("123456");
    	telphoneList.add("42143123");
    	model.put("telphoneList", telphoneList);
    	List addressList= new ArrayList();
    	Map addressMap=new HashMap();
    	addressMap.put("zpcode", "350000");
    	addressList.add(addressMap);
    	addressMap=new HashMap();
    	addressMap.put("zpcode", "300000");
    	addressList.add(addressMap);
    	model.put("telphoneList", telphoneList);
    	model.put("addressList", addressList);
    	Map attrMap=new HashMap();
    	attrMap.put("cd", "140000007");
    	attrMap.put("val", "0");
    	model.put("attr", attrMap);
    	
    	String result=fh.processTemplate("demo.ftl", model);
        System.out.println(result);
        
        
        
        FreemarkerHandler fh2=FreemarkerHandler.getInstance();
        if(fh2.getTemplateLoadersSize()>0){//先前模板路径有加载进去,不需要重新加载
        	  System.out.println("#########  有缓存功能  #########");
        	 result=fh.processTemplate("demo.ftl", model);
            System.out.println(result);
        }

        FreemarkerHandler fh3=FreemarkerHandler.getInstance();
        fh3.setTemplateLoaderPathsForceUpdate("/com/al/ecs/service/protocols");//强制更新模板路径,重新加载
        result=fh.processTemplate("demo.ftl", model);
        System.out.println(result);
        
	}
}
