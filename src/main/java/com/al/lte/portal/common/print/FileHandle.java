package com.al.lte.portal.common.print;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.URL;
import java.util.Properties;

import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;

import com.al.ecs.log.Log;

/**
 * 文件操作类
 * @Company: Asiainfo Technologies （China）,Inc.
 * @author Asiainfo R&D deparment
 * @version 1.0 Copyright (c) 2007
 * @date 2007-11-29 描述
 */
public class FileHandle {
	private static Log log = Log.getLog(FileHandle.class);
	private static String EXCEPTION=")Exception,";

	/**
	 * 读配置文件 此方法可以重新载入配置文件，而且不会被缓存,可以在weblogic和tomcat下使用，但bes捕获错误说文件路径找不到
	 * 
	 * @param propFile
	 * @return
	 */
	public static Properties readProperties(String propFile) {
		Properties properties = new Properties();
		try {
			String file = FileHandle.class.getResource(propFile).getFile();
			properties.load(new FileInputStream(correctFilePathForBes(file, propFile)));
		} catch (Exception exp) {
			log.error("call readProperties(" + propFile + EXCEPTION
					+ exp.getMessage());
			properties = null;
		}
		return properties;
	}

	/**
	 * 读配置文件 此方法不能重新载入配置文件，因为数据量被缓存,可以在weblogic和tomcat及bes下使用
	 * 
	 * @param propFile
	 * @return
	 */
	public static Properties readProperties2(String propFile) {// 原来的处理方式
		// propFile = "/SysConfig.properties"
		Properties properties = new Properties();
		try {
			InputStream in = FileHandle.class.getResourceAsStream(propFile);
			properties = new Properties();
			properties.load(in);

		} catch (Exception exp) {
			log.error("call readProperties2(" + propFile + EXCEPTION
					+ exp.getMessage());
			properties = null;
		}
		return properties;
	}

	/**
	 * 读配置文件 此方法可以重新载入配置文件，而且不会被缓存,可以在weblogic和tomcat下使用，但bes捕获错误说文件路径找不到
	 * 
	 * @param propFile
	 * @return
	 */
	public static Document readXML(String xmlFile) {
		Document document = null;
		try {
			DocumentBuilderFactory documentBuilderFactory = DocumentBuilderFactory
					.newInstance();
			FileHandle fileHandle = new FileHandle();
			URL url = fileHandle.getClass().getClassLoader().getResource(xmlFile);
			document = documentBuilderFactory.newDocumentBuilder().parse(
					correctFilePathForBes(url.getFile(), xmlFile));
		} catch (Exception exp) {
			log.error("call readXML(" + xmlFile + EXCEPTION
					+ exp.getMessage());
			document = null;
		}
		return document;
	}

	public static Document readXML2(String xmlFile) {
		Document document = null;
		try {
			DocumentBuilderFactory documentBuilderFactory = DocumentBuilderFactory
					.newInstance();
			FileHandle fileHandle = new FileHandle();
			InputStream in = fileHandle.getClass().getClassLoader()
					.getResourceAsStream(xmlFile);
			document = documentBuilderFactory.newDocumentBuilder().parse(in);
		} catch (Exception exp) {
			log.error("call readXML2(" + xmlFile + EXCEPTION
					+ exp.getMessage());
			document = null;
		}
		return document;
	}

	public static void writeProperties(String parameterName,
			String parameterValue) {
		String file = FileHandle.class.getResource("/SysConfig.properties")
				.getFile();
		file = correctFilePathForBes(file, "/SysConfig.properties");
		try(InputStream is = new FileInputStream(file);
			OutputStream os = new FileOutputStream(file);
			BufferedReader reader = new BufferedReader(new InputStreamReader(is))){
			StringBuffer buffer = new StringBuffer();
			boolean isFound = false;
			String line = reader.readLine(); // 读取第一行
			while (line != null) {
				if (line.indexOf(parameterName) == 0) {// 找到对应的键值
					line = parameterName + "=" + parameterValue;// 修改
					isFound = true;
				}
				buffer.append(line + '\n');
				line = reader.readLine();
			}
			if (!isFound) {// 之前没有定义，那么文件末尾要加上
				buffer.append(parameterName + "=" + parameterValue + '\n');
			}
			PrintWriter writer = new PrintWriter(new OutputStreamWriter(os));
			writer.write(buffer.toString());
			writer.flush();
		} catch (Exception exp) {
			log.info("修改SysConfig.sys的缓存页面版本失败:" + exp.getMessage());
		}
	}

	/**
	 * 解决bes下
	 * 
	 * @param preFilePath
	 * @param fileName
	 * @return
	 */
	private static String correctFilePathForBes(String preFilePath,
			String fileName) {
		String endWith = "!" + fileName;
		boolean bTrue = preFilePath.endsWith(endWith);// bes下，解析错误的路径，需要纠正,tomcat和weblogic下没有问题
		if (bTrue) {
			log.info("bes下纠正了资源文件[" + fileName + "]的路径！");
			String correctFilePath = preFilePath.substring(0, preFilePath
					.indexOf(endWith))
					+ "/WEB-INF/classes" + fileName;
			return correctFilePath;
		}
		return preFilePath;
	}

	/**
	 * 把打印模板文件读出来转换成二进制数组
	 * 
	 * @param strJasperFileName
	 * @return
	 * @throws Exception
	 */
	public static byte[] readJasper(String strJasperFileName) throws Exception {
		// 根据相对路径取到绝对路径
		String file = "";
		try {
			if (strJasperFileName.startsWith("file:")) {
				log.debug("尝试使用URL加载文件");
				file = new URL(strJasperFileName).getFile();
			} else {
				log.debug("尝试使用classLoader加载文件");
				file = FileHandle.class.getResource("/" + strJasperFileName).getFile();
				file = correctFilePathForBes(file, "/" + strJasperFileName);
			}
		} catch (Exception e) {
			log.debug("尝试加载文件失败，请确认文件路径");
			throw e;
		}
		File fileJapser = new File(file);
		if (!fileJapser.exists() && !fileJapser.canRead()) {
			String strErr = "读取打印模板文件(" + file + ")失败,文件不存在或不可读！";
			log.info(strErr);
			throw new Exception(strErr);
		}
		long length = fileJapser.length();// 获得文件的字节数
		byte[] buffer = new byte[(int) length];
		try(InputStream image = new FileInputStream(fileJapser);){
			image.read(buffer);
		}catch(Exception e){
			log.error(e);
		}
		return buffer;
	}
}
