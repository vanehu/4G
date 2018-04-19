package com.ailk.ecsp.core;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import oracle.sql.ARRAY;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.Node;
import org.dom4j.io.OutputFormat;
import org.dom4j.io.SAXReader;
import org.dom4j.io.XMLWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
/**
 * 
 * @author 陈源龙
 *
 */
public class AnalogDataFactory {
	private static AnalogDataFactory instance;
	protected static Logger log = LoggerFactory.getLogger(AnalogDataFactory.class);
	private static String basePath;
	private static final String configFileName = "config.xml";
	private AnalogDataFactory() {
		
	}
	
	public static AnalogDataFactory getInstance() {
		if(instance == null) {
			instance = new AnalogDataFactory();
			basePath = DataRepository.getInstence().getWebParam().getAnalogDataPath();
			createConfigSampleFile();
		} 
		return instance;
	}
	
	private Document readXmlFile(String filePath){
		SAXReader reader = new SAXReader();
		try {
			return reader.read(new File(filePath));
		} catch (Exception e) {
			log.error("读取{}失败{}",filePath);
			log.error("",e);
		}
		return null;
	}
	
	private static boolean createConfigSampleFile(){
		File file  = new File(basePath+configFileName);
		try {
			if(!file.exists()){
				new File(basePath).mkdirs();
				Document document = DocumentHelper.createDocument();
				Element root =  document.addElement("list");
				Element service = root.addElement("service");
				service.addComment("This is just a sample!");
				service.addAttribute("serviceCode", "com.demo.test");
				Element fileName1 = service.addElement("fileName");
				fileName1.setText("testFileName1.txt");
				fileName1.addAttribute("isValid", "Y");
				Element fileName2 = service.addElement("fileName");
				fileName2.setText("testFileName2.json");
				fileName2.addAttribute("isValid", "N");
				Element fileName3 = service.addElement("fileName");
				fileName3.setText("testFileName3.xml");
				fileName3.addAttribute("isValid", "N");
				OutputFormat format = OutputFormat.createPrettyPrint();
				format.setIndent(true);
				format.setIndentSize(4);
				XMLWriter output = new XMLWriter(new FileWriter(file),format);
		        output.write(document);
		        output.close();
			}
			return true;
		} catch (Exception e) {
			//e.printStackTrace();
			log.error("创建配置文件{}失败",basePath);
			log.error("",e);
		}
		return false;
	}
	
	public List<String> parseFileName(String serviceCode){
		List<String> fielNameList = new ArrayList<String>();
		Document document = readXmlFile(basePath+configFileName);
		if(document == null){
			return null;
		}
		String xpath = "/list/service[@serviceCode='"+serviceCode+"']/fileName[@isValid='Y']" ;
		//System.out.println(xpath);
		List list = document.selectNodes(xpath);
		for(int i = 0; list!=null && i <list.size(); i++){
			Node node = (Node)list.get(i);
			fielNameList.add(node.getText());
		}
		return fielNameList;
	}
	
	public static void main(String[] args) {
		AnalogDataFactory.getInstance().createConfigSampleFile();
		List lst = AnalogDataFactory.getInstance().parseFileName("com.demo.test");
		System.out.println(lst);
	}
	
	/** 默认GBK;GB18030编码 */
	public String readAnalogData(String serviceCode,String encoding){
		List<String> lst = parseFileName(serviceCode);
		if(lst==null || lst.isEmpty()){
			//log.error("服务{}没有配置模拟数据,请在{}{}里配置", serviceCode,basePath,configFileName);
			return null;
		}
		String  filePath = basePath + lst.get(0);
		File file = new File(filePath);
		if(StringUtils.isBlank(encoding)){
			encoding = "GB18030";
		}
		try {
			if(file.exists()){
				return FileUtils.readFileToString(file, encoding);
			}else{
				//log.error("服务{}配置的模拟数据文件[{}{}]不存在", serviceCode,basePath,filePath);
			}
		} catch (IOException e) {
			//log.error("读取服务{}配置的模拟数据文件[{}{}]异常", serviceCode,basePath,filePath);
			log.error("",e);
		}
		return null;
	}
	
	/** 默认GBK;GB18030编码 */
	public String readAnalogData(String serviceCode){
		return readAnalogData(serviceCode,null);
	}
}
