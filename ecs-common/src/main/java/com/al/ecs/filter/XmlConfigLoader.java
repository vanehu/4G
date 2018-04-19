package com.al.ecs.filter;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.StringUtils;

import javax.servlet.ServletContext;

import junit.framework.Assert;

import com.al.ecs.log.Log;

/**
 * 缓存配置文件加载 . <BR>
 * TODO 要点概述.
 * <P>
 * 
 * @author tang zheng yu
 * @version V1.0 2012-7-10
 * @createDate 2012-7-10 上午11:25:04
 * @modifyDate tang zheng yu 2012-7-10 <BR>
 * @copyRight 亚信联创EC研发部
 */
public class XmlConfigLoader {
	private static final Log log = Log.getLog(XmlConfigLoader.class);
	// 配置文件的存放路径,默认为/WEB-INF/xrainbow.xml
	protected  String CONFIG_FILE_NAME = "/WEB-INF/urlCache.xml";
	private static final String CLASS_PATH_PREFIX = "classpath:";

	private InputStream inputStream;
	private ServletContext servletContext;
	private static XmlConfigLoader loader=new XmlConfigLoader();
	private List<CacheUrl> cachUrlList = new ArrayList<CacheUrl>();
	public static XmlConfigLoader getInstance(){
		if(loader==null){
			loader=new XmlConfigLoader();
		}
		return loader;
	}

	public List<CacheUrl> getCachUrlList() {
		return cachUrlList;
	}

	/**
	 * 加载xrainbow.xml服务配置
	 */
	public void load(ServletContext servletContext,String cacheUrl)   {
		CONFIG_FILE_NAME=cacheUrl;
		 load(servletContext);
	}
	/**
	 * 加载xrainbow.xml服务配置
	 */
	public void load(ServletContext servletContext)   {
		this.servletContext=servletContext;
		InputStream is = null;
		try {
			if (log.isDebugEnabled()) {
				log.debug("load config xml file begin......");
			}

			// 如果有设置了输入流,就用设置的,没有，就从servletContext上下文读取默认的
			try {
			if (inputStream != null) {
				is = inputStream;
			} else {
				if(CONFIG_FILE_NAME.startsWith("classpath")) {
					try {
						String pathToUse = StringUtils.cleanPath(CONFIG_FILE_NAME);
						pathToUse = pathToUse.substring(pathToUse.indexOf(":") + 1);
						ClassPathResource resource = new ClassPathResource(pathToUse);
						is = resource.getInputStream();
					} catch (Exception e) {}
				} else {
					is = this.servletContext.getResourceAsStream(CONFIG_FILE_NAME);	
				}
			}
			} catch(Exception e) {
				log.error("找不到服务配置文件", e);
			}
			if(is==null) {
				log.error("找不到服务配置文件:{}",CONFIG_FILE_NAME );
			}
			load(is);
		} finally {
			if (is != null) {
				try {
					is.close();
				} catch (IOException e) {
					log.error("close inputstream error:", e);
				}
			}
			if (log.isDebugEnabled()) {
				log.debug("load config xml file end......");
			}
		}
	}

	/**
	 * 加载服务配置内部方法
	 * 
	 * @param is
	 * @throws ServiceFrameworkException
	 */
	public void load(InputStream is)  {
		SAXReader reader = new SAXReader();
		Document doc = null;
		Element root = null;
		try {
			doc = reader.read(is);
			root = doc.getRootElement();
			if (root != null) {
				this.loadServiceConfig(root);
			}
		} catch (DocumentException e) {
			log.error(CONFIG_FILE_NAME+"服务配置文件读取异常:", e);
		}
	}
	
	@SuppressWarnings("unchecked")
	private void loadIncludeNode(Element root){
		List<Element> list = root.selectNodes("./include");
		for (Element element : list) {
			InputStream is = null;
			try {
				String fileName = element.attributeValue("resource");
				if (log.isDebugEnabled()) {
					log.debug("include的配置文件为:{}", fileName);
				}
				if (fileName.startsWith(CLASS_PATH_PREFIX)) {
					is = this.getClass().getClassLoader().getResourceAsStream(
							fileName.replace(CLASS_PATH_PREFIX, ""));

				} else{
					is = this.servletContext.getResourceAsStream(fileName);
				}
				loadIncludeFileService(is);
			} finally {
				if (is != null) {
					try {
						is.close();
					} catch (IOException e) {
						log.error(
								"loadIncludeSubnode close inputstream error:",
								e);
					}
				}
			}
		}
	}
	
	/**
	 * 加载xrainbow.xml中的include节点的resource服务配置文件
	 * 
	 * @param is
	 * @throws ServiceFrameworkException
	 */
	public void loadIncludeFileService(InputStream is) {
		SAXReader reader = new SAXReader();
		Document doc = null;
		Element root = null;
		try {
			doc = reader.read(is);
			root = doc.getRootElement();
			if (root != null) {
				this.loadServiceNode(root);
			}
		} catch (DocumentException e) {
			log.error("include服务配置文件读取异常:", e);;
		}
	}
	
	/**
	 * 加载URL节点配置
	 * @param root
	 * @throws ServiceFrameworkException
	 */
	private void loadServiceConfig(Element root) {
		loadServiceNode(root);
		loadIncludeNode(root);
	}
	
	@SuppressWarnings("unchecked")
	private void loadServiceNode(Element root){
		List<Element> list = root.selectNodes("./cache");
		if(list==null || list.size()==0) {
			log.debug("cache Node 为空！");
			return;
		}
		for (Element element : list) {
			CacheUrl cacheUrl = new CacheUrl();
			cacheUrl.setPattern(element.attributeValue("pattern").trim());
			cacheUrl.setCache(Boolean.parseBoolean(element.attributeValue("cache").trim()));
			if (element.attributeValue("contentType") != null) {
				cacheUrl.setContentType(element.attributeValue("contentType").trim());
			}else {
				cacheUrl.setContentType("*");
			}
			if (element.attributeValue("exculdedCodes") != null) {
				cacheUrl.setExculdedCodes(element.attributeValue("exculdedCodes").trim());
			}
			if (element.attributeValue("maxAge") != null) {
				cacheUrl.setMaxAge(Long.parseLong(element.attributeValue("maxAge").trim()));
			}
			this.cachUrlList.add(cacheUrl);
		}
	}
}
