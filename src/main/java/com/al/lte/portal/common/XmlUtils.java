package com.al.lte.portal.common;
 

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import org.apache.commons.lang.StringUtils;
import org.dom4j.DocumentException;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import com.al.ecs.common.util.JsonUtil;
import net.sf.json.JSON;
import net.sf.json.xml.XMLSerializer;
 
/**
 * @author zhangjun
 * @version 2016年3月20日
 */
public class XmlUtils {
     
    /**
    * 根据Map组装xml消息体，值对象仅支持基本数据类型、String、BigInteger、BigDecimal，以及包含元素为上述支持数据类型的Map
    * 
    * @param vo
    * @param rootElement
    * @return
    * @author zhangjun
    */
    public static String map2xmlBody(Map<String, Object> vo, String rootElement) {
        org.dom4j.Document doc = DocumentHelper.createDocument();
        Element body = DocumentHelper.createElement(rootElement);
        doc.add(body);
        __buildMap2xmlBody(body, vo);
        return doc.asXML().split("\\?>")[1].replaceAll("\n|\r", "");
    }
     
    private static void __buildMap2xmlBody(Element body, Map<String, Object> vo) {
        if (vo != null) {
            Iterator<String> it = vo.keySet().iterator();
            while (it.hasNext()) {
                String key = (String) it.next();
                if (StringUtils.isNotEmpty(key)) {
                    Object obj = vo.get(key);
                    Element element = DocumentHelper.createElement(key);
                    if (obj != null) {
                        if (obj instanceof java.lang.String) {
                            element.setText((String) obj);
                        } else {
                            if (obj instanceof java.lang.Character || obj instanceof java.lang.Boolean || obj instanceof java.lang.Number
                                    || obj instanceof java.math.BigInteger || obj instanceof java.math.BigDecimal) {
                                org.dom4j.Attribute attr = DocumentHelper.createAttribute(element, "type", obj.getClass().getCanonicalName());
                                //element.add(attr);
                                element.setText(String.valueOf(obj));
                            } else if (obj instanceof java.util.Map) {
                                org.dom4j.Attribute attr = DocumentHelper.createAttribute(element, "type", java.util.Map.class.getCanonicalName());
                               // element.add(attr);
                                __buildMap2xmlBody(element, (Map<String, Object>) obj);
                            } else {
                            }
                        }
                    }
                    body.add(element);
                }
            }
            
        }
    }
     
    /**
     * 根据xml消息体转化为Map
     * 
     * @param xml
     * @param rootElement
     * @return
     * @throws DocumentException
     * @author zhangjun
     */
    public static Map xmlBody2map(String xml, String rootElement) throws DocumentException {
        org.dom4j.Document doc = DocumentHelper.parseText(xml);
        Element body = (Element) doc.selectSingleNode("/" + rootElement);
        Map vo = __buildXmlBody2map(body);
        return vo;
    }
     
    private static Map __buildXmlBody2map(Element body) {
        Map vo = new HashMap();
        if (body != null) {
            List<Element> elements = body.elements();
            for (Element element : elements) {
                String key = element.getName();
                if (StringUtils.isNotEmpty(key)) {
                    String type = element.attributeValue("type", "java.lang.String");
                    String text = element.getText().trim();
                    Object value = null;
                    if (java.lang.String.class.getCanonicalName().equals(type)) {
                        value = text;
                    } else if (java.lang.Character.class.getCanonicalName().equals(type)) {
                        value = new java.lang.Character(text.charAt(0));
                    } else if (java.lang.Boolean.class.getCanonicalName().equals(type)) {
                        value = new java.lang.Boolean(text);
                    } else if (java.lang.Short.class.getCanonicalName().equals(type)) {
                        value = java.lang.Short.parseShort(text);
                    } else if (java.lang.Integer.class.getCanonicalName().equals(type)) {
                        value = java.lang.Integer.parseInt(text);
                    } else if (java.lang.Long.class.getCanonicalName().equals(type)) {
                        value = java.lang.Long.parseLong(text);
                    } else if (java.lang.Float.class.getCanonicalName().equals(type)) {
                        value = java.lang.Float.parseFloat(text);
                    } else if (java.lang.Double.class.getCanonicalName().equals(type)) {
                        value = java.lang.Double.parseDouble(text);
                    } else if (java.math.BigInteger.class.getCanonicalName().equals(type)) {
                        value = new java.math.BigInteger(text);
                    } else if (java.math.BigDecimal.class.getCanonicalName().equals(type)) {
                        value = new java.math.BigDecimal(text);
                    } else if (java.util.Map.class.getCanonicalName().equals(type)) {
                        value = __buildXmlBody2map(element);
                    } else {
                    }
                    vo.put(key, value);
                }
            }
        }
        return vo;
    }
    
    public static Map xmlBody2mapFor4g(String xml) throws DocumentException {
  	  XMLSerializer xmlSerializer = new XMLSerializer(); 
      JSON json = xmlSerializer.read(xml); 
      return  JsonUtil.toObject(json.toString(), Map.class);
    }
    
    public static void main(String[] args) throws DocumentException {
    	 Map<String, Object> map = new HashMap<String, Object>();
    	 map.put("name", "张三");
    	 map.put("age", 23);
    	 map.put("address", "广州天河区");
    	 String xml = map2xmlBody(map, "qq");
    	 System.out.println(xml.split("\\?>")[1].replaceAll("\n|\r", ""));
    	// System.out.println(map2xmlBody(map, "qq"));
    	 String test = "<qq><address><x>aa</x><a>ddd</a></address><age>23</age><name>张三</name></qq>";
    	 XMLSerializer xmlSerializer = new XMLSerializer(); 
	     JSON json = xmlSerializer.read(test);   
	     Map<String, Object> rootMap3 = JsonUtil.toObject(json.toString(), Map.class);
	     Map<String, Object> rootMap2 = (Map<String, Object>) rootMap3.get("address");
    	 for (Map.Entry<String, Object> entry : rootMap2.entrySet()) {
			    System.out.println("Key = " + entry.getKey() + ", Value = " + entry.getValue());
			}
	}
     
}