package com.linkage.portal.service;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Attr;
import org.w3c.dom.Comment;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

//利用 递归 dom 解析任何xml文档，把xml文档加载到内存，占用内存大，可随机访问  

public class XMLParse {

    public static void main(String[] args) throws Exception {
        //1.获取dom解析器工厂  
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();

        //2.获取具体的dom解析器  
        DocumentBuilder db = dbf.newDocumentBuilder();

        //获取xml文档的 根节点  
        Document document = db.parse(XMLParse.class.getResourceAsStream("portal-db-context-test.xml"));

        //获取文档的 根元素节点  
        Element e = document.getDocumentElement();

        parseXML(e);

    }

    public static void parseXML(Element element) {
        //获取 元素节点 的 信息  
        String name = element.getNodeName();

        //获取此元素节点的属性  
        NamedNodeMap map = element.getAttributes();

        //获取目前element元素节点下的 孩子节点（包括空格）</span>  
        NodeList child = element.getChildNodes();

        if (null != map) {
            for (int i = 0; i < map.getLength(); i++) {
                Attr attr = (Attr) map.item(i);

                String name1 = attr.getName();
                String value1 = attr.getValue();
            }

        }

        for (int j = 0; j < child.getLength(); j++) {
            Node node = child.item(j);

            //判断该节点是不是 元素节点  ，递归路口  
            if (node.getNodeType() == Node.ELEMENT_NODE) {
                //开始递归  
                parseXML((Element) node);
            }

            //判断该节点是不是 文本,递归出口  
            else if (node.getNodeType() == Node.TEXT_NODE) {

            }

            //判断该节点是不是 注释  
            else if (node.getNodeType() == Node.COMMENT_NODE) {
                Comment comment = (Comment) node;
                //注释内容  
                String data = comment.getData();

            }
        }

    }

}
