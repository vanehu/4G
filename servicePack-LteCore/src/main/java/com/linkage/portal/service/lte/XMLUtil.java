package com.linkage.portal.service.lte;

import java.io.StringReader;
import java.util.HashMap;
import java.util.Map;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import com.ailk.ecsp.intf.webservice.WSConfig;
import com.ailk.ecsp.util.IConstant;
import com.ailk.ecsp.util.SoapUtil;
import com.linkage.portal.service.lte.protocols.FreemarkerHandler;
import com.linkage.util.StringUtil;

/**
 * XML工具类
 * 条件：仅供服务包内部使用、具有特殊业务逻辑，非公用方法
 * @author liusd
 *
 */
public class XMLUtil {

    private static final Logger log = LoggerFactory.getLogger(XMLUtil.class);

    /**
     * 将XML格式字符串转化为w3c Document对象
     * @param xmlstr
     * @return
     * @throws Exception
     */
    private static Document createw3cDocument(String xmlstr) throws Exception {

        if (StringUtil.isEmptyStr(xmlstr)) {
            return null;
        }
        DocumentBuilderFactory docBuilderFactory = DocumentBuilderFactory.newInstance();
        docBuilderFactory.setNamespaceAware(true);

        return docBuilderFactory.newDocumentBuilder().parse(new InputSource(new StringReader(xmlstr)));
    }

    /**
     * 根据xpath路径取得xml中节点或者属性值
     * 前提节点不重复
     * @param xmlStr
     * @param path
     * @return
     * @see
     */
    public static String parseByXPath(String xmlStr,String path) {
        String value = "";
        try {
            Document doc = createw3cDocument(xmlStr);
            Node root = doc.getDocumentElement();
            value = selectSingleNodeText(path, root);
        } catch (Exception e) {
            log.error("parseByXPath error",e);
        } 
        return value;
    }
    
    /**
     * 查找节点，并返回第一个符合条件节点
     * @param express
     * @param source
     * @return 返回单节点对象
     */
    @SuppressWarnings("unused")
    private static Node selectSingleNode(String express, Object source) {
        Node result = null;
        try {
            XPath xpath = XPathFactory.newInstance().newXPath();
            result = (Node) xpath.evaluate(express, source, XPathConstants.NODE);
        } catch (XPathExpressionException e) {
            log.error("", e);
        }
        return result;
    }

    /**
     * 查找节点，并返回节点内容
     * @param express
     * @param source
     * @return 返回单节点内容
     */
    private static String selectSingleNodeText(String express, Object source) {
        String result = "";
        try {
            XPath xpath = XPathFactory.newInstance().newXPath();
            result = xpath.evaluate(express, source);
        } catch (XPathExpressionException e) {
            log.error("", e);
        }
        return result;
    }

    /**
     * 查找节点，返回符合条件的节点集。
     * @param express
     * @param source
     * @return 返回多节点对象
     */
    private static NodeList selectNodes(String express, Object source) {
        NodeList result = null;
        try {
            XPath xpath = XPathFactory.newInstance().newXPath();
            result = (NodeList) xpath.evaluate(express, source, XPathConstants.NODESET);
        } catch (XPathExpressionException e) {
            log.error("", e);
        }
        return result;
    }
    public static String createResXml(String xml, String sublMethodName ) throws Exception {
        String xmlRes = "";
        DocumentBuilderFactory docBuilderFactory = DocumentBuilderFactory.newInstance();
        docBuilderFactory.setNamespaceAware(true);
        Document doc = docBuilderFactory.newDocumentBuilder().parse(new InputSource(new StringReader(xml)));
        Map nodeMap = new HashMap();
        NodeList nl = doc.getElementsByTagName(IConstant.CON_INTERFACE_RES_ROOT_NAME);
        SoapUtil.xmlConversion(nl.item(0), nodeMap, IConstant.CON_OUT_PARAM_TYPE_DOM_TEMPLATE);
        FreemarkerHandler fh = FreemarkerHandler.getInstance();
        fh.setTemplateLoaderPaths(IConstant.CON_INTERFACE_RES_FTL_PATH);
        xmlRes = fh.processTemplate(XMLUtil.class, sublMethodName + "Res.ftl", nodeMap);
        return xmlRes;
    }
}
