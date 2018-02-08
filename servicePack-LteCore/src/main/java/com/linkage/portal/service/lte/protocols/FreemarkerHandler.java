package com.linkage.portal.service.lte.protocols;


import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Properties;

import freemarker.cache.ClassTemplateLoader;
import freemarker.cache.MultiTemplateLoader;
import freemarker.cache.StringTemplateLoader;
import freemarker.cache.TemplateLoader;
import freemarker.template.Configuration;
import freemarker.template.ObjectWrapper;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import freemarker.template.TemplateModel;

/**
 * 根据Freemarker生成XML协议
 * <BR>
 * 设置模板目录路径（templateLoaderPaths）必须
 * 模板路径以 classpath 相对路径下,支持加载多个模板路径
 * 函数:
 * 1.datatime(输出字符串格式)
 *<P>
 *@version 1.0 2012-5-22
 *@author tang zheng yu
 */
public class FreemarkerHandler 
{
	private static final String DEFAULT_ENCODING="UTF-8";
	private static final String DEFAULT_TEMPLATE_KEY = "_default_template_key";
	private Configuration configuration = null;  
	 /** 指定解析编码*/
	 private String encoding =DEFAULT_ENCODING;
	 private  Properties freemarkerSettings;
	 /** classpath 多模板目录路径 */
	 private String[] templateLoaderPaths=null;
	 private static  FreemarkerHandler singleton = new FreemarkerHandler();
	 private List<TemplateLoader> templateLoaders = new ArrayList<TemplateLoader>();
	 
	 /**
	  * 单例
	  * @return
	  */
	public static FreemarkerHandler getInstance() {
		if(singleton ==null){
			singleton = new FreemarkerHandler();
		}
		return singleton;
	}
	 /**
	  * 模板路径构造
	  * @param templateLoaderPaths　模板目录路径
	  */
	 private FreemarkerHandler(){
		 try {
			createConfigureAll();
		} catch (TemplateException e) {
			e.printStackTrace();
		}
	 }
	 /**
	  * 模板目录路径
	  * @return String 模板目录路径
	  */
	 public String[] getTemplateLoaderPaths() {
		return templateLoaderPaths;
	}
	 /**
	  * classpath 多模板目录路径
	  * <BR>
	  * 此方法用于设置模板,有缓存,性能较高,
	  * 第一次设置后,第二次可以不需要再设置
	  * <pre>
	  * sample:
	  * fh.setTemplateLoaderPaths(new String[]{"/com/al/ecs/freemarker",
	  * 		"/com/al/ecs/service/protocols"});
	  * </pre>
	  * @param templateLoaderPaths 模板目录路径
	  */
	public void setTemplateLoaderPaths(String... templateLoaderPaths) {
		this.templateLoaderPaths = templateLoaderPaths;
	}
	 /**
	  * classpath 多模板目录路径;<BR>
	  * 此方法用于模板强制更新,没有缓存,性能有所下降
	  * <pre>
	  * sample:
	  * fh.setTemplateLoaderPaths(new String[]{"/com/al/ecs/freemarker",
	  * 		"/com/al/ecs/service/protocols"});
	  * </pre>
	  * @param templateLoaderPaths 模板目录路径
	  */
	public void setTemplateLoaderPathsForceUpdate(String... templateLoaderPaths) {
		this.templateLoaders.clear();
		this.templateLoaderPaths = templateLoaderPaths;
	}
	/**
	 * 返回是否已经有加载模板路径个数进去
	 * @return int 加载模板路径个数
	 */
	public int getTemplateLoadersSize(){
		return this.templateLoaders.size();
	}
	/**
	  * 设置freemarker一些配置数据
	  * @param freemarkerSettings
	  */
	public void setFreemarkerSettings(Properties freemarkerSettings) {
		this.freemarkerSettings = freemarkerSettings;
	}
	/**
	 * 设置编码
	 * @param encode　编码
	 */
	public void setEncoding(String encoding) {
		this.encoding = encoding;
	}

	/**
	 * 添加自定义函数
	 * @param tdmMap Map<String,TemplateDirectiveModel> key:自定义函数名
	 */
	public void addSharedVariable (Map<String,TemplateModel> tdmMap){
		if(tdmMap !=null && !tdmMap.isEmpty()){
			Iterator<Entry<String, TemplateModel>> it=tdmMap.entrySet().iterator();
			while(it.hasNext()){
				Map.Entry<String, TemplateModel>  entry= (Map.Entry<String, TemplateModel>)it.next();
				configuration.setSharedVariable(entry.getKey(), entry.getValue());
			}
		}
	}
	/**
	 * 添加自定义函数
	 * @param methodName 自定义函数名
	 * @paramtemplateModel 函数实现类
	 */
	public void addSharedVariable (String methodName,TemplateModel templateModel){
		configuration.setSharedVariable(methodName, templateModel);
	}
			

	/**
	 * 获取配置文件
	 * @return
	 */
	public Properties getFreemarkerSettings(){
		Properties properties= new Properties();
		InputStream in=null;
		try {
			in=FreemarkerHandler.class.getResourceAsStream("/com/linkage/portal/service/lte/protocols/freemarker.properties");
			properties.load(in);
			return properties;
		} catch (IOException e) {
			e.printStackTrace();
			return null;
		}finally{
			if(in!=null){
				try {
					in.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
	}
	/**
	 * 创建默认配置
	 * @throws TemplateException 
	 * @throws Exception 
	 */
	public void createConfigure() throws  TemplateException{
		configuration = new Configuration();    
	    configuration.setDefaultEncoding(encoding); 
		Properties props = new Properties();
		/**
		 * freemarker 全局的一些配置数据
		 */
		if (this.freemarkerSettings != null) {
			props.putAll(this.freemarkerSettings);
		}
		if (!props.isEmpty()) {
			configuration.setSettings(props);
		}	
	}
	
	/**
	 * 创建全局配置
	 * 
	 * @throws TemplateException
	 */
	public void createConfigureAll() throws  TemplateException{
		this.freemarkerSettings=getFreemarkerSettings();
		createConfigure();
		Map<String,TemplateModel> tdmMap = new HashMap<String,TemplateModel>();
		tdmMap.put("datetime", new DateTimeMethod());
		tdmMap.put("createInstId", new CreateInstIdMethod());
		tdmMap.put("generateDstSysID", new GenerateDstSysIDMethod());
		tdmMap.put("TransResCode", new TransResCodeMethod());
		tdmMap.put("CheckIsNumber", new CheckIsNumberMethod());
		tdmMap.put("TransAcctItemType", new TransAcctItemTypeMothod());
		addSharedVariable(tdmMap);
	}
	/**
	 * 执行生成模板输出
	 * @param templateName 文件名
	 * @param model 对象对象，一般为map,list,或java bean对象数据传进去
	 * @return String 返回解析后的模板数据
	 */
	public String processTemplate(String templateName,Object model)  {
		try {
			if(templateLoaderPaths ==null || templateLoaderPaths.length==0) {
				throw new IllegalArgumentException("createConfigure方法执行前，请设置 templateLoaderPaths 值");
			}
			//设置模板目录路径,清空以前的路径
			if(templateLoaders.size() ==0){
				for (String path : this.templateLoaderPaths) {
					templateLoaders.add(new ClassTemplateLoader(FreemarkerHandler.class, path));
				}
				configuration.setTemplateLoader(getMultiTemplateLoader(this.templateLoaders));
			}
			Template template=configuration.getTemplate(templateName,encoding);
			template.setEncoding(encoding);
			StringWriter out = new StringWriter(2048);
			template.process(model, out);
			out.flush();
			out.close();
			return out.toString();
		} catch (IOException e) {
			e.printStackTrace();		
		} catch (TemplateException e) {
			e.printStackTrace();
		}
		return null;
	}
	/**
	 * 执行生成模板输出
	 * @param clazz 针对动态加载到内存里的类处理不能加载到模板
	 * @param templateName 文件名
	 * @param model 对象对象，一般为map,list,或java bean对象数据传进去
	 * @return String 返回解析后的模板数据
	 */
	public String processTemplate(Class<?> clazz,String templateName,Object model)  {
		try {
			if(templateLoaderPaths ==null || templateLoaderPaths.length==0) {
				throw new IllegalArgumentException("createConfigure方法执行前，请设置 templateLoaderPaths 值");
			}
			//设置模板目录路径,清空以前的路径
			if(templateLoaders.size() ==0){
				for (String path : this.templateLoaderPaths) {
					templateLoaders.add(new ClassTemplateLoader(clazz, path));
				}
				configuration.setTemplateLoader(getMultiTemplateLoader(this.templateLoaders));
			}

			Template template=configuration.getTemplate(templateName,encoding);
			template.setEncoding(encoding);
			StringWriter out = new StringWriter(2048);
			template.process(model, out,ObjectWrapper.BEANS_WRAPPER);
			out.flush();
			out.close();
			return out.toString();
		} catch (IOException e) {
			e.printStackTrace();		
		} catch (TemplateException e) {
			e.printStackTrace();
		}
		return null;
	}

	/**
	 * 从数组里获取模板路径加载器,支持单个和多个,0个报异常
	 * @param templateLoaders List<TemplateLoader>
	 * @return TemplateLoader TemplateLoader
	 */
	protected TemplateLoader getMultiTemplateLoader(List<TemplateLoader> templateLoaders){
		int loaderCount = templateLoaders.size();
		switch (loaderCount) {
			case 0:
				throw new IllegalArgumentException("createConfigure方法执行前，请设置 templateLoaderPaths 值");
			case 1:
				return templateLoaders.get(0);
			default:
				TemplateLoader[] loaders = templateLoaders.toArray(new TemplateLoader[loaderCount]);
				return new MultiTemplateLoader(loaders);
		}
	}
	/**
	 * 执行生成模板输出
	 * @param templateContent 模板内容
	 * @param model 对象对象，一般为map,list,或java bean对象数据传进去
	 * @return String 返回解析后的模板数据
	 */
	public String processTemplateByContent(String templateContent,Object model)  {
		try {
			StringTemplateLoader stringTemplateLoader=new StringTemplateLoader();
			stringTemplateLoader.putTemplate(DEFAULT_TEMPLATE_KEY, templateContent);
			configuration.setTemplateLoader(stringTemplateLoader);
			Template template=configuration.getTemplate(DEFAULT_TEMPLATE_KEY);
			template.setEncoding(encoding);
			StringWriter out = new StringWriter(2048);
			template.process(model, out);
			out.flush();
			out.close();
			return out.toString();
		} catch (IOException e) {
			e.printStackTrace();		
		} catch (TemplateException e) {
			e.printStackTrace();
		}
		return null;
	}
}
