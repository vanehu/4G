package com.ailk.ecsp.util;

import java.io.File;
import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.dom4j.DocumentException;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

/**
 * 
 * @author chenyl
 * 
 */
public class SoapUtil {
    private static Logger logger = Logger.getLogger(SoapUtil.class);
    private static int state = 0;
    /**
     * Siebel消息头加入，临时方案，有待改造.
     * 
     * @param src
     *            请求xml
     * @param sessionToken
     *            Siebel sessionToken
     * @return header
     */
    public static String addSiebelHeader(String src, String sessionToken) {
        if (StringUtils.isNotBlank(sessionToken)) {
            return src;
        }
        String headerNull = "<soapenv:Header/>";
        String header = "<soapenv:Header>";
        String body = "<soapenv:Body>";
        String actor = " soapenv:actor=\"http://schemas.xmlsoap.org/soap/actor/next\"";
        String mustUnderstandOne = " soapenv:mustUnderstand=\"0\" xmlns:ns1=\"http://siebel.com/webservices\"";
        String mustUnderstandTwo = " soapenv:mustUnderstand=\"0\" xmlns:ns2=\"http://siebel.com/webservices\"";

        StringBuffer session = new StringBuffer();
        session.append("<ns1:SessionType").append(actor + mustUnderstandOne).append(">");
        session.append("Stateless");
        session.append("</ns1:SessionType>");
        session.append("<ns2:SessionToken").append(actor + mustUnderstandTwo).append(">");
        session.append(sessionToken);
        session.append("</ns2:SessionToken>");
        int st = -1;
        StringBuffer sb = new StringBuffer();
        if ((st = src.indexOf(headerNull)) > 0) {
            sb.append(src.substring(0, st));
            sb.append("<soapenv:Header>").append(session.toString()).append("</soapenv:Header>");
            sb.append(src.substring(st + headerNull.length()));
        } else if ((st = src.indexOf(header)) > 0) {
            sb.append(src.substring(0, st + header.length()));
            sb.append(session.toString());
            sb.append(src.substring(st + header.length()));
        } else if ((st = src.indexOf(body)) > 0) {
            sb.append(src.substring(0, st));
            sb.append("<soapenv:Header>").append(session.toString()).append("</soapenv:Header>");
            sb.append(src.substring(st));
        }
        return sb.toString();
    }

    /**
     * Siebel消息头加入，临时方案，有待改造.
     * 
     * @param src
     *            请求xml
     * @param userName
     *            用户名
     * @param password
     *            密码
     * @param sessionType
     *            类型
     * @return Header
     */
    public static String addSiebelHeader(String src, String userName, String password, String sessionType) {
        if (StringUtils.isNotBlank(userName)) {
            return src;
        }
        String header1 = "<soapenv:Header/>";
        String header2 = "<soapenv:Header>";
        String body = "<soapenv:Body>";
        String actor = " soapenv:actor=\"http://schemas.xmlsoap.org/soap/actor/next\"";
        String mustUnderstand1 = " soapenv:mustUnderstand=\"0\" xmlns:ns1=\"http://siebel.com/webservices\"";
        String mustUnderstand2 = " soapenv:mustUnderstand=\"0\" xmlns:ns2=\"http://siebel.com/webservices\"";
        String mustUnderstand3 = " soapenv:mustUnderstand=\"0\" xmlns:ns3=\"http://siebel.com/webservices\"";

        StringBuffer session = new StringBuffer();
        session.append("<ns1:SessionType").append(actor + mustUnderstand1).append(">");
        session.append(sessionType);
        session.append("</ns1:SessionType>");
        session.append("<ns2:UsernameToken").append(actor + mustUnderstand2).append(">");
        session.append(userName);
        session.append("</ns2:UsernameToken>");
        session.append("<ns3:PasswordText").append(actor + mustUnderstand3).append(">");
        session.append(password);
        session.append("</ns3:PasswordText>");
        int st = -1;
        StringBuffer sb = new StringBuffer();
        if ((st = src.indexOf(header1)) > 0) {
            sb.append(src.substring(0, st));
            sb.append("<soapenv:Header>").append(session.toString()).append("</soapenv:Header>");
            sb.append(src.substring(st + header1.length()));
        } else if ((st = src.indexOf(header2)) > 0) {
            sb.append(src.substring(0, st + header2.length()));
            sb.append(session.toString());
            sb.append(src.substring(st + header2.length()));
        } else if ((st = src.indexOf(body)) > 0) {
            sb.append(src.substring(0, st));
            sb.append("<soapenv:Header>").append(session.toString()).append("</soapenv:Header>");
            sb.append(src.substring(st));
        }
        return sb.toString();
    }

    public static String parseSessionToken(String src) {
        if (StringUtils.isNotBlank(src)) {
            return null;
        }
        String header = "<siebel-header:SessionToken";
        String header2 = "</siebel-header:SessionToken>";
        int st = src.indexOf(header);
        if (st >= 0) {
            st = src.indexOf(">", st + 1);
            if (st < 0) {
                return null;
            }
            int end = src.indexOf(header2);
            return src.substring(st + 1, end);
        }
        return null;
    }

    public static String getTag(String xml) {
        try {
            org.dom4j.Document doc = org.dom4j.DocumentHelper.parseText(xml);
            org.dom4j.Element root = doc.getRootElement();
            org.dom4j.Element el = (org.dom4j.Element) root.element("Body").elementIterator().next();
            return el.getName();
        } catch (Exception e) {
            logger.error("", e);
        }
        return null;
    }

    /**
     * XML参数模板注入，支持属性，多层注入. map属性key为：参数key@属性名称.
     * 
     * @author chenyl
     * @param element
     * @param params
     */
    public static void injectParam(org.w3c.dom.Element element, Map<String, Object> params) {
        org.w3c.dom.NodeList children = element.getChildNodes();
        int childCount = children.getLength();
        for (int i = 0; i < childCount; i++) {
            org.w3c.dom.Node node = children.item(i);
            if (node == null) {
                continue;
            }
            // injectAttribute(node);
            injectAttribute(node, params);
            if (childCount == 1 && node.getNodeType() == org.w3c.dom.Node.TEXT_NODE) {
                if (node.getNodeValue().equals("?")) {
                    Object param = keyVal(params, node.getParentNode().getLocalName());
                    element.removeChild(node);
                    org.w3c.dom.Node newNode = element.getOwnerDocument().createTextNode(param.toString());
                    element.appendChild(newNode);
                }
            } else if (node.getNodeType() == org.w3c.dom.Node.ELEMENT_NODE) {
                String key = node.getLocalName();
                Object obj = params.get(key);
                if (obj instanceof Map) {
                    Map<String, Object> map = (Map<String, Object>) params.get(key);
                    injectParam((org.w3c.dom.Element) node, map);
                } else if (obj instanceof List) {
                    element.removeChild(node);
                    List lstNode = (List) obj;
                    for (int j = 0; j < lstNode.size(); j++) {
                        org.w3c.dom.Node n = node.cloneNode(true);
                        Map<String, Object> m = (Map<String, Object>) lstNode.get(j);
                        injectParam((org.w3c.dom.Element) n, m);
                        element.appendChild(n);
                    }
                } else {
                    injectParam((org.w3c.dom.Element) node, params);
                }
            }//
        }// end for
    }

    public static void injectAttribute(org.w3c.dom.Node node) {
        org.w3c.dom.NamedNodeMap attr = node.getAttributes();
        if (attr != null) {
            int attrLen = node.getAttributes().getLength();
            for (int j = 0; j < attrLen; j++) {
                org.w3c.dom.Node a = node.getAttributes().item(j);
                if (a != null) {
                    String name = a.getLocalName();
                    if ("pagesize".equalsIgnoreCase(name)) {
                        node.getAttributes().item(j).setNodeValue("10");
                    } else if ("startrownum".equalsIgnoreCase(name)) {
                        node.getAttributes().item(j).setNodeValue("0");
                    } else {
                        node.getAttributes().item(j).setNodeValue("");
                    }
                }
            }
        }
    }

    /**
     * 属性注入.
     * 
     * @author chylg
     * @param node
     *            n
     * @param map
     *            m
     */
    public static void injectAttribute(org.w3c.dom.Node node, Map<String, Object> map) {
        String tag = node.getLocalName();
        org.w3c.dom.NamedNodeMap attr = node.getAttributes();
        if (attr != null) {
            int attrLen = node.getAttributes().getLength();
            for (int j = 0; j < attrLen; j++) {
                org.w3c.dom.Node a = node.getAttributes().item(j);
                if (a != null) {
                    String name = a.getLocalName();
                    String key = tag + "@" + name;
                    String val = keyVal(map, key);
                    if ("pagesize".equalsIgnoreCase(name)) {
                        if (StringUtils.isNotBlank(val)) {
                            node.getAttributes().item(j).setNodeValue(val);
                        } else {
                            node.getAttributes().item(j).setNodeValue("10");
                        }
                    } else if ("startrownum".equalsIgnoreCase(name)) {
                        if (StringUtils.isNotBlank(val)) {
                            node.getAttributes().item(j).setNodeValue(val);
                        } else {
                            node.getAttributes().item(j).setNodeValue("0");
                        }
                    } else {
                        node.getAttributes().item(j).setNodeValue(val);
                    }
                }
            }
        }
    }

    public static String keyVal(Map map, String key) {
        Object obj = map.get(key);
        if (obj == null) {
            return "";
        }
        return obj.toString();
    }

    /**
     * 反转义.
     * 
     * @param src
     *            s
     * @return s
     * @author chylg
     */
    public static String unescape(String src) {
        if (StringUtils.isBlank(src)) {
            return src;
        }

        src = src.trim();
        src = src.replaceAll("&lt;", "<");
        src = src.replaceAll("&gt;", ">");
        src = src.replaceAll("&amp;", "&");
        src = src.replaceAll("&apos;", "'");
        src = src.replaceAll("&quot;", "\"");

        src = src.substring(0, 1)
                + StringUtils.replace(src.substring(1), "<?xml version=\"1.0\" encoding=\"UTF-8\"?>", "");

        src = src.replaceAll("\r", "");
        src = src.replaceAll("\n", "");
        src = src.replaceAll("\t", "");
        return src;
    }

    /**
     * 请求uri后面跟着的参数.
     * 
     * @param uri
     *            uri
     * @param params
     *            p
     * @author chylg
     * @return s
     */
    public static String addReqParams(String uri, Map<String, String> params) {
        if (params == null || params.isEmpty()) {
            return uri;
        }
        java.util.Set<Map.Entry<String, String>> set = params.entrySet();
        for (java.util.Iterator<Map.Entry<String, String>> it = set.iterator(); it.hasNext();) {
            Map.Entry<String, String> entry = (Map.Entry<String, String>) it.next();
            uri = addReqParam(uri, entry.getKey(), entry.getValue());
        }
        return uri;
    }

    public static String addReqParam(String uri, String name, String value) {
        name = name + "=";
        int i = uri.indexOf(name);
        if (i > 0) {
            i = i + name.length();
            int k = uri.indexOf("&", i);
            if (k < 0) {
                uri = uri.substring(0, i) + value;
            } else {
                uri = uri.substring(0, i) + value + uri.substring(k);
            }
        } else {
            uri += "&" + name + value;
        }
        return uri;
    }

    /**
     * 入参检查.
     * 
     * @param inParam
     *            入参
     * @param checkArr
     *            参数字段
     * @return b
     * @author chenylg
     */
    public static Boolean checkParam(Map inParam, String[] checkArr) {
        boolean flag = true;
        if (inParam == null) {
            inParam = new HashMap();
        }
        String retMsg = "";
        for (int i = 0; i < checkArr.length; i++) {
            String value = keyVal(inParam, checkArr[i]);
            if (value == null || value.length() == 0) {
                flag = false;
                retMsg += "参数" + checkArr[i] + "不能为空;";
            }
        }
        if (!flag) {
            inParam.put("checkMsg", retMsg);
        }

        return flag;
    }

    public static String getBasePath() {
        String osName = System.getProperty("os.name");
        String configPath = System.getProperty("user.dir");
        if (osName.length() >= 7 && "Windows".equalsIgnoreCase(osName.substring(0, 7))) {
            configPath = configPath.substring(0, configPath.lastIndexOf(File.separator));
        }
        return configPath;
    }

    /**
     * 默认配置文件路径获取. 1. JAVA工程里，路径为工程的上一级目录，如JAVA工程目录为：D:/workspace/java/MyProject <br>
     * 那么返回的路径为D:/workspace/java/config/httpConfig.properties <br>
     * 2. windows系统eclipse里tomcat下，为eclipse的上一级目录，如eclipse目录为D:/Program
     * Files/eclipse3.6 <br>
     * 那么返回的路径为D:/Program Files/config/httpConfig.properties <br>
     * 3. linux/unix系统weblogic下，为创建的XXX_domain目录下. <br>
     * 如使用agentDomain域，路径为/agent/bea/weblogic/user_projects/domains/agentDomain <br>
     * 那么返回/agent/bea/weblogic/user_projects/domains/agentDomain/config/
     * httpConfig.properties
     * 
     * @return s
     * @author chenylg
     */
    public static String getDefaultPath() {
        return getBasePath() + "/config/httpConfig.properties";
    }

    public static String removeXmlHeader(String xml) {
        if (xml == null || xml.length() == 0) {
            return xml;
        }
        Pattern pattern = Pattern.compile("<\\?xml.+?>");// 用指定的正则表达式进行预编译
        Matcher matcher = pattern.matcher(xml);// 创建匹配给定输入与此模式的匹配器。
        StringBuffer sbf = new StringBuffer();
        while (matcher.find()) {// 描输入序列以查找与该模式匹配的下一个子序列。
            matcher.appendReplacement(sbf, "");//
        }
        matcher.appendTail(sbf);
        return "";
    }

    public static void xmlConversion(Node node, Map nodeMap, String type) {

        if (node.hasChildNodes()) {
            NodeList childList = node.getChildNodes();
            for (int i = 0; i < childList.getLength(); i++) {
                Node childNode = childList.item(i);
                if (childNode.hasChildNodes()) {
                    if (childNode.getChildNodes().getLength() == 1
                            && (childNode.getFirstChild().getNodeType() == Node.TEXT_NODE 
                            || childNode.getFirstChild().getNodeType() == Node.CDATA_SECTION_NODE)) {
                    	//加入CDATA节点支持
                        String keyName = childNode.getLocalName();
                        String value = StringUtils.trim(childNode.getFirstChild().getNodeValue());
                        if (null == nodeMap) {
                            nodeMap = new HashMap();
                        }
                        if (nodeMap.get(keyName) == null) {
                        	if (StringUtils.isBlank(value)){
                        		value = null;
                        	}
                            nodeMap.put(keyName, value);
                        } else {
                            if (null != value) {
                                List list = new ArrayList();
                                if (nodeMap.get(keyName) instanceof List) {
                                    list = (List) nodeMap.get(keyName);
                                } else {
                                    list.add(nodeMap.get(keyName));
                                }
                                list.add(value);
                                nodeMap.put(keyName, list);
                            }
                        }
                    } else {
                        HashMap map = new HashMap();
                        xmlConversion(childNode, map, type);
                        String keyName = childNode.getLocalName();  
                        if (null == nodeMap) {
                            nodeMap = new HashMap();
                        }
                        if (childNode.getAttributes().getLength()>0){
                        	if (childNode.getAttributes().item(0).getNodeValue().equals("list")){
                                List list = new ArrayList<HashMap<String, Object>>();
                                if (nodeMap.containsKey(keyName)){
                                    if (nodeMap.get(keyName) instanceof List) {
                                        list = (List) nodeMap.get(keyName);
                                    } 
                                }
                                list.add(map);
                                nodeMap.put(keyName, list); 
                        	}else{
                        		if (null == nodeMap.get(keyName)) {
        							nodeMap.put(keyName, map);
                                } else {
                                    List list = new ArrayList();
                                    if (nodeMap.get(keyName) instanceof List) {
                                        list = (List) nodeMap.get(keyName);
                                    } else {
                                        list.add(nodeMap.get(keyName));
                                    } 
                                    list.add(map);
                                    nodeMap.put(keyName, list); 
                                }
                        	}
                        }else{
                        	if (null == nodeMap.get(keyName)) {
    							nodeMap.put(keyName, map);
                            } else {
                                List list = new ArrayList();
                                if (nodeMap.get(keyName) instanceof List) {
                                    list = (List) nodeMap.get(keyName);
                                } else {
                                    list.add(nodeMap.get(keyName));
                                } 
                                list.add(map);
                                nodeMap.put(keyName, list); 
                            }
                        }
                    }
                }
            }

        }

    }
    
    public static void xmlConversionOld(Node node, Map nodeMap, String type) {
        if (node.hasChildNodes()) {
            NodeList childList = node.getChildNodes();
            for (int i = 0; i < childList.getLength(); i++) {
                Node childNode = childList.item(i);
                if (childNode.hasChildNodes()) {
                    if (childNode.getChildNodes().getLength() == 1
                            && childNode.getFirstChild().getNodeType() == Node.TEXT_NODE) {

                        // String keyName = childNode.getNodeName();
                        String keyName = childNode.getLocalName();
                        if (IConstant.CON_OUT_PARAM_TYPE_DOM_TEMPLATE.equals(type)){
                            if (childNode.getAttributes().getLength()>0){
                            	keyName = keyName +"."+childNode.getAttributes().item(0).getNodeValue();
                            }
                        }             
                        String value = StringUtils.trim(childNode.getFirstChild().getNodeValue());
                        if (null == nodeMap) {
                            nodeMap = new HashMap();
                        }
                        if (nodeMap.get(keyName) == null) {
                            nodeMap.put(keyName, value);
                        } else {
                            if (null != value) {
                                List list = new ArrayList();
                                if (nodeMap.get(keyName) instanceof List) {
                                    list = (List) nodeMap.get(keyName);
                                } else {
                                    list.add(nodeMap.get(keyName));
                                }
                                list.add(value);
                                nodeMap.put(keyName, list);
                            }
                        }
                    } else {
                        HashMap map = new HashMap();
                        xmlConversion(childNode, map, type);
                        // String keyName = childNode.getNodeName();
                        String keyName = childNode.getLocalName();
                        if (IConstant.CON_OUT_PARAM_TYPE_DOM_TEMPLATE.equals(type)){
                            if (childNode.getAttributes().getLength()>0){
                            	keyName = keyName +"."+childNode.getAttributes().item(0).getNodeValue();
                            }
                        }   
                        if (null == nodeMap) {
                            nodeMap = new HashMap();
                        }
                        if (childNode.getAttributes().getLength()>0){
                        	if (childNode.getAttributes().item(0).getNodeValue().equals("list")){
                                List list = new ArrayList();
                                list.add(map);
                                nodeMap.put(keyName, list); 
                        	}else{
                        		if (null == nodeMap.get(keyName)) {
        							nodeMap.put(keyName, map);
                                } else {
                                    List list = new ArrayList();
                                    if (nodeMap.get(keyName) instanceof List) {
                                        list = (List) nodeMap.get(keyName);
                                    } else {
                                        list.add(nodeMap.get(keyName));
                                    } 
                                    list.add(map);
                                    nodeMap.put(keyName, list); 
                                }
                        	}
                        }else{
                        	if (null == nodeMap.get(keyName)) {
    							nodeMap.put(keyName, map);
                            } else {
                                List list = new ArrayList();
                                if (nodeMap.get(keyName) instanceof List) {
                                    list = (List) nodeMap.get(keyName);
                                } else {
                                    list.add(nodeMap.get(keyName));
                                } 
                                list.add(map);
                                nodeMap.put(keyName, list); 
                            }
                        }
                        
//                        if (childNode.getAttributes().getLength()>0){
//                        	nodeMap.put(childNode.getAttributes().item(0).getNodeName(), childNode.getAttributes().item(0).getNodeValue());
//                        }
                    }
                }
            }

        }

    }

    /**
     * xml转MAP
     * 
     * 注：如果接口返回的xml字符串中有换行符，可能在转化成MAP时会出问题，特别是在getChildNodes().getLength()方法返回的总数多包括#text
     * 
     * @param xml
     * @return
     * @throws SAXException
     * @throws IOException
     * @throws ParserConfigurationException
     */
    public static Map xmlToMap(String xml) throws SAXException, IOException, ParserConfigurationException {
		if (StringUtils.isNotBlank(xml)) {
			// 清除xml头
			xml = xml.replaceAll("(<\\?xml.+?>)", "");
			xml = xml.replaceAll("\t","");//制表符
			xml =xml.replaceAll("\r","");//回车符
			xml = xml.replaceAll("\n","");//换行符
		}
        DocumentBuilderFactory docBuilderFactory = DocumentBuilderFactory.newInstance();
        docBuilderFactory.setNamespaceAware(true);
        Document doc = docBuilderFactory.newDocumentBuilder().parse(new InputSource(new StringReader(xml)));
        Map nodeMap = new HashMap();
        xmlConversion(doc.getDocumentElement(), nodeMap, "");
        return nodeMap;
    }

    public static Map xmlToMap(String xml, String type) throws SAXException, IOException, ParserConfigurationException {
        Map nodeMap = new HashMap();
    	try{
            DocumentBuilderFactory docBuilderFactory = DocumentBuilderFactory.newInstance();
            docBuilderFactory.setNamespaceAware(true);
            Document doc = docBuilderFactory.newDocumentBuilder().parse(new InputSource(new StringReader(xml)));

            NodeList nl = doc.getElementsByTagName(IConstant.CON_INTERFACE_RES_ROOT_NAME);
            if (nl.getLength() == 1){
                xmlConversion(nl.item(0), nodeMap, type);
            }else if(nl.getLength() == 0){
            	return null;
            }else{
            	xmlConversion(doc.getDocumentElement(), nodeMap, type);
            }
    	}catch(Exception e){
    		e.printStackTrace();
    	}
        return nodeMap;
    }

    public static Map xmlToMap(String xml, String type , String interfaceResRootName) throws SAXException, IOException, ParserConfigurationException {
        DocumentBuilderFactory docBuilderFactory = DocumentBuilderFactory.newInstance();
        docBuilderFactory.setNamespaceAware(true);
        Document doc = docBuilderFactory.newDocumentBuilder().parse(new InputSource(new StringReader(xml)));
        Map nodeMap = new HashMap();
        NodeList nl = doc.getElementsByTagName(interfaceResRootName);
        if (nl.getLength() == 1){
            xmlConversion(nl.item(0), nodeMap, type);
        }else if(nl.getLength() == 0){
        	return null;
        }else{
        	xmlConversion(doc.getDocumentElement(), nodeMap, type);
        }
        return nodeMap;
    }
    
    /**
     * 转化XML到MAP
     * @param xml
     * @param isParseAttr 是否解析节点属性
     * @return
     * @throws DocumentException 
     */
    public static Map<String, Object> parseXMLToMap(String xml, boolean isParseAttr) throws DocumentException {
        SAXReader reader = new SAXReader();
        org.dom4j.Document doc = reader.read(new InputSource(new StringReader(xml)));
        return Dom2Map(doc, isParseAttr);
    }

    /**
     * 转化XML到MAP包括所有属性
     * @param xml
     * @param startParsePath 解析开始位置
     * @param isParseAttr 是否解析节点属性
     * @return
     * @throws DocumentException 
     */
    public static Map<String, Object> parseXMLToMap(String xml, String startParsePath, boolean isParseAttr)
            throws DocumentException {
        SAXReader reader = new SAXReader();
        org.dom4j.Document doc = reader.read(new InputSource(new StringReader(xml)));
        return Dom2Map(doc, startParsePath, isParseAttr);
    }

    /**
     * 解析xml到MAP 
     * @param doc
     * @param isParseAttr
     * @return
     */
    @SuppressWarnings("unchecked")
    public static Map<String, Object> Dom2Map(org.dom4j.Document doc, boolean isParseAttr) {
        Map<String, Object> map = new HashMap<String, Object>();
        if (doc == null)
            return map;
        //当前节点下是否有子节点,有继续递归，没有则停止
        return Dom2Map(doc.getRootElement(), isParseAttr);
    }

    /**
     * 解析xml到MAP
     * @param doc 文档
     * @param startParsePath 解析开始位置
     * @param isParseAttr 是否解析属性
     * @return
     */

    @SuppressWarnings("unchecked")
    public static Map<String, Object> Dom2Map(org.dom4j.Document doc, String startParsePath, boolean isParseAttr) {
        Map<String, Object> map = new HashMap<String, Object>();
        if (doc == null)
            return map;
        if(StringUtils.defaultString(startParsePath).length()>0&& !startParsePath.startsWith("//")){
            return map;
        }
        //当前节点下是否有子节点,有继续递归，没有则停止
        org.dom4j.Element e = (Element) doc.selectSingleNode(startParsePath);
        return Dom2Map(e, isParseAttr);
    }

    /**
     * 递归处理当前节点
     * @param e
     * @param isParseAttr 是否解析节点属性
     * @return
     */
    @SuppressWarnings("unchecked")
    public static Map Dom2Map(org.dom4j.Element pe, boolean isParseAttr) {
        Map map = new HashMap();
        List list = pe.elements();
        if (list.size() > 0) {
            for (int i = 0; i < list.size(); i++) {
                org.dom4j.Element e = (org.dom4j.Element) list.get(i);
                List mapList = new ArrayList();

                if (e.elements().size() > 0) {
                    Map m = Dom2Map(e, isParseAttr);
                    //追加属性
                    if (isParseAttr)
                        DomAttrToMap(m, e);
                    if (map.get(e.getName()) != null) {
                        Object obj = map.get(e.getName());
                        if (obj instanceof ArrayList) {
                            mapList = (List) obj;
                            mapList.add(m);
                        } else {
                            mapList = new ArrayList();
                            mapList.add(obj);
                            mapList.add(m);
                        }
                        map.put(e.getName(), mapList);
                    } else {
                        map.put(e.getName(), m);
                    }
                } else {
                    Map m = new HashMap();
                    //追加属性
                    if (isParseAttr)
                        DomAttrToMap(m, e);
                    Map t = new HashMap();
                    t.putAll(m);
                    if (map.get(e.getName()) != null) {
                        Object obj = map.get(e.getName());
                        if (obj instanceof ArrayList) {
                            mapList = (List) obj;
                        } else {
                            mapList = new ArrayList();
                            mapList.add(obj);
                        }
                        t.put("value", e.getText());
                        mapList.add(t);
                        map.put(e.getName(), mapList);
                    } else {
                        t.put("value", e.getText());
                        map.put(e.getName(), t);
                    }
                }
            }
        } else {
            Map t = new HashMap();
            t.put("value", pe.getText());
            t.putAll(map);
            map.put(pe.getName(), t);
        }

        return map;
    }

    @SuppressWarnings("unchecked")
    public static Map DomAttrToMap(Map map, org.dom4j.Element e) {
        Map domAttr = new HashMap();
        List<org.dom4j.Attribute> list = e.attributes();
        for (org.dom4j.Attribute a : list) {
            domAttr.put(a.getName(), a.getValue());
        }
        map.put("Attr_" + e.getName(), domAttr);
        return map;
    }

    // add by xuj
    public static String transforLowerCase(String str) {
        String returnStr = "";
        String a[] = str.split("_");
        if (a.length == 1) {
            return str;
        }
        for (int i = 0; i < a.length; i++) {
            if (i == 0) {
                returnStr = a[i].toLowerCase();
            } else {
                returnStr = returnStr + a[i].substring(0, 1).toUpperCase() + a[i].substring(1).toLowerCase();
            }
        }
        return returnStr;
    }

}
