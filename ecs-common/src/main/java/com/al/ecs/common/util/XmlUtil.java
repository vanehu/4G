package com.al.ecs.common.util;

import java.io.ByteArrayOutputStream;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.io.OutputFormat;
import org.dom4j.io.XMLWriter;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

/**
 * XML格式字符串工具类.
 * <P>
 * 1 将XML字符串转化为 w3c Document对象<br>
 * 2 XML字符串转换为LinkageMap对象<br>
 * 3 获取节点名称
 * <P>
 * 
 * @author tangzhengyu
 * @version 1.0
 */

public class XmlUtil {

	/**
	 * 将XML格式字符串转化为w3c Document对象.
	 * <P>
	 * 
	 * @param xmlstr
	 *            XML格式字符串
	 * @return Document Document对象.
	 * @throws Exception
	 */
	public static Document createw3cDocument(String xmlstr) throws Exception {

		if (StringUtil.isEmptyStr(xmlstr)) {
			return null;
		}
		DocumentBuilderFactory docBuilderFactory = DocumentBuilderFactory
				.newInstance();
		docBuilderFactory.setNamespaceAware(true);

		return docBuilderFactory.newDocumentBuilder().parse(
				new InputSource(new StringReader(xmlstr)));
	}

	/**
	 * 将xml转换为简单对象(LinkageMap,List).
	 * <P>
	 * 
	 * @param node
	 *            节点
	 * @param nodeMap
	 *            　节点Map值
	 */
	@SuppressWarnings("unchecked")
	public static void xmlConversionObject(Node node,
			Map<String, Object> nodeMap) {

		if (node != null && node.hasChildNodes()) {

			NodeList childList = node.getChildNodes();

			for (int i = 0; i < childList.getLength(); i++) {

				Node childNode = childList.item(i);

				if (childNode.hasChildNodes()) {

					if (childNode.getChildNodes().getLength() == 1
							&& childNode.getFirstChild().getNodeType() == Node.TEXT_NODE) {

						String keyName = getNodeName(childNode);
						String value = childNode.getFirstChild().getNodeValue();

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

						xmlConversionObject(childNode, map);

						String keyName = getNodeName(childNode);

						if (null == nodeMap) {
							nodeMap = new HashMap();
						}

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

	/**
	 * 获取节点名称. <BR>
	 * 去掉节点名称声明 如 <soap:body /> 节点名称为 body
	 * <P>
	 * 
	 * @param node
	 *            节点
	 * @return String 获取节点名称
	 */
	public static String getNodeName(Node node) {

		String nodeName = node.getNodeName();

		if (null != nodeName) {
			int index = nodeName.indexOf(":");
			if (index > 0) {
				nodeName = nodeName.substring(index + 1, nodeName.length());
			}
		}
		return nodeName;
	}

	/**
	 * 根据名称获取Node.
	 * <P>
	 * 
	 * @param rootNode
	 *            根节点
	 * @param node
	 *            节点
	 * @param nodeName
	 *            节点名称
	 * @return Node　节点
	 */
	public static Node getNodeByName(Node rootNode, Node node, String nodeName) {

		if (null != rootNode && rootNode.hasChildNodes()) {
			NodeList children = rootNode.getChildNodes();
			for (int i = 0; i < children.getLength(); i++) {
				Node tnode = children.item(i);
				if (nodeName.equalsIgnoreCase(XmlUtil.getNodeName(tnode))) {
					node = tnode;
				} else {
					node = getNodeByName(tnode, node, nodeName);
				}

				if (node != null) {
					break;
				}
			}
		}
		return node;
	}

	/**
	 * 将传入的一个DOM Node对象输出成字符串。如果失败则返回一个空字符串"".
	 * <P>
	 * 
	 * @param node
	 *            DOM Node 对象。
	 * @return a XML String from node
	 * @throws Exception
	 */
	public static String nodeToString(Node node) throws Exception {

		if (node == null) {
			return null;
		}
		Transformer transformer = TransformerFactory.newInstance()
				.newTransformer();

		if (transformer != null) {
			StringWriter sw = new StringWriter();
			transformer.transform(new DOMSource(node), new StreamResult(sw));
			return sw.toString();
		}
		return null;
	}



	public static String getXMLFromMap(Map map, int iMode) {
		StringBuffer sb = new StringBuffer();

		if (map == null || map.size() == 0) {
			return "";
		}
		if (0 == iMode) {
			sb.append("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
			//sb.append("<root>");
		}
		// 为了方便观看结果,将有内嵌的排在后面

		Iterator iterr = map.keySet().iterator();

		while (iterr.hasNext()) {
			String keyString = (String) iterr.next();
			if (!(map.get(keyString) instanceof Map)) {
				sb.append("<" + keyString + ">");
				sb.append(map.get(keyString));
				sb.append("</" + keyString + ">");
			}
		}
		iterr = map.keySet().iterator();
		while (iterr.hasNext()) {
			String key = (String) iterr.next();
			if (map.get(key) instanceof Map) {
				if (key.indexOf("|!|") > 0) {
					sb.append("<" + key.substring(0, key.indexOf("|!|"))
							+ ">");
					sb.append(getXMLFromMap((Map) map.get(key), iMode + 1));
					sb.append("</" + key.substring(0, key.indexOf("|!|"))
							+ ">");
				} else {
					sb.append("<" + key + ">");
					sb.append(getXMLFromMap((Map) map.get(key), iMode + 1));
					sb.append("</" + key + ">");
				}
			}
		}
		//if (0 == iMode)
			//sb.append("</root>");
		return sb.toString();
	}
}
