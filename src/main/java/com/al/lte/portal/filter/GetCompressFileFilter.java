package com.al.lte.portal.filter;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.concurrent.ConcurrentHashMap;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.UrlPathHelper;

import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.SpringContextUtil;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.Compressor;
import com.al.lte.portal.common.SysConstant;

/**
 * 获取压缩文件过滤器(js,css)
 * 
 * @author jinjian
 * 
 */
public class GetCompressFileFilter extends OncePerRequestFilter {

	private static Log log = Log.getLog(GetCompressFileFilter.class);
	private UrlPathHelper urlPathHelper = new UrlPathHelper();
	/** 不需要过滤的链接 */
	private String[] excludeUrls = new String[]{"/merge/"};
	/** 资源文件路径访问前缀 */
	private static String resourcePrefix = "resources";
	/** 压缩文件后缀 */
	private String compressFileSuffix;
	/** https协议 */
	public static final String SECURE_PROTOCOL = "https";
	/** 保存被压缩文件路径及压缩后路径，包含文件名 */
	private static final ConcurrentHashMap<String, String> compressFileMap = new ConcurrentHashMap<String, String>();
	private static final String SEPERATOR = ".";
	private static final String METHOD_GET = "GET";
	private static final String JAVASCRIPT_FILE_SUFFIX = "js";
	private PropertiesUtils propertiesUtils;
	private static String rootPath;
	/** 保存servletPath */
	public static final String ATTR_SERVLET_PATH = "_first_servlet_path";
	
	public String[] getExcludeUrls() {
		return excludeUrls;
	}

	public void setExcludeUrls(String[] excludeUrls) {
		this.excludeUrls = excludeUrls;
	}

	public String getJavascriptResourcePrefix() {
		return resourcePrefix;
	}

	public static void setJavascriptResourcePrefix(String javascriptResourcePrefix) {
		if(javascriptResourcePrefix != null && javascriptResourcePrefix.startsWith(File.separator)){
			javascriptResourcePrefix = javascriptResourcePrefix.substring(1);
		}
		resourcePrefix = javascriptResourcePrefix;
	}

	public String getCompressFileSuffix() {
		return compressFileSuffix;
	}

	public void setCompressFileSuffix(String compressFileSuffix) {
		this.compressFileSuffix = compressFileSuffix;
	}

	@Override
	protected void initFilterBean() throws ServletException {
		if(propertiesUtils == null){
			try {
				propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
			} catch (Exception e) {
				log.error(e);
			}
		}
		if(compressFileSuffix == null){
			compressFileSuffix = SEPERATOR + new SimpleDateFormat("yyyyMMddHHmm").format(new Date());
		}
		rootPath = getServletContext().getRealPath("/");
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request)
			throws ServletException {
		if(propertiesUtils != null && !SysConstant.ON.equals(propertiesUtils.getMessage(SysConstant.COMPRESS_ALL_JS))){
			return true;
		}
		String uri = urlPathHelper.getOriginatingRequestUri(request);
		String path = uri.substring(request.getContextPath().length());
		//先遍历一遍地址，判断该请求的url是否需要校验
		for(int i=0; i < excludeUrls.length; i++){
			if (path.startsWith(excludeUrls[i])) {
				return true;
			}
		}
		
		//只过滤对js文件的访问
		int sepIndex = uri.lastIndexOf(SEPERATOR);
		if(sepIndex == -1 || !JAVASCRIPT_FILE_SUFFIX.equalsIgnoreCase(uri.substring(sepIndex + 1)) || !METHOD_GET.equalsIgnoreCase(request.getMethod())){
			return true;
		}
		
		request.setAttribute(ATTR_SERVLET_PATH, path);
		return false;
	}
	
	@Override
	protected void doFilterInternal(HttpServletRequest request,
			HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		/*
		 * session中已保存开发者模式标识，则返回javascript源文件，否则返回压缩文件；访问未压缩的文件时，压缩该文件并保存；
		 * 1、获取请求的javascript文件路径T，包含文件名;
		 * 2、根据保存的compressFileMap判断T是否是源文件，或是压缩文件，或未识别文件；
		 * 2.1、如果是源文件，根据session中保存的开发者模式标识判断，有则返回源文件，否则转发到该源文件对应的压缩文件；
		 * 2.2、如果是压缩文件，不做处理；
		 * 2.3、如果是未识别文件，则先判断该文件是否存在，不存在则转发，存在则压缩生成该文件的压缩文件，压缩成功后将源文件与压缩文件键值对保存到compressFileMap中；根据session中保存的开发者模式标识判断，有则返回源文件，否则转发到该源文件对应的压缩文件；
		 */
		
		String path = getOriginatingRequestServletPath(request);
		log.debug("-------GetCompressFileFilter GET: {}", path);
		
		if(compressFileMap.containsKey(path)){
			if(isDeveloperModel(request)){
				filterChain.doFilter(request, response);
			} else {
				if(!jsFileExist(compressFileMap.get(path))){
					Compressor.compress(resourcePrefix + path, resourcePrefix + compressFileMap.get(path), Compressor.DEF_TYPE_JS);
				}
				forward(request, response, compressFileMap.get(path));
			}
		} else if(compressFileMap.containsValue(path)){
			filterChain.doFilter(request, response);
		} else {
			if(!jsFileExist(path)){
				filterChain.doFilter(request, response);
			} else {
				String outputFilename = createCompressFileName(path);
				int result = Compressor.compress(resourcePrefix + path, resourcePrefix + outputFilename, Compressor.DEF_TYPE_JS);
				if (result == 0) {
					compressFileMap.putIfAbsent(path, outputFilename);
					log.debug("-------GetCompressFileFilter compress: souerce:{} out:{}", path, outputFilename);
					if(isDeveloperModel(request)){
						filterChain.doFilter(request, response);
					} else {
						forward(request, response, compressFileMap.get(path));
					}
    			} else {
    				filterChain.doFilter(request, response);
    			}
			}
		}
		
	}
	
	@Override
	public void destroy() {
		//因为在重启时会重新生成压缩文件，所以容器关闭时删除压缩文件，以避免同时保存多个压缩文件
		clearCompressFileMap();
	}

	/**
	 * 删除所有压缩后的文件
	 */
	protected static void deleteAllCompressFiles(){
		try {
			boolean isWindowsFilePath = "\\".equals(File.separator);
			boolean needAddFileSep = resourcePrefix != null && !resourcePrefix.startsWith(File.separator);
			for(String compressFilePath : compressFileMap.values()){
				String relPath = resourcePrefix + compressFilePath;
				if(isWindowsFilePath){
					relPath = relPath.replaceAll("/", "\\\\\\\\");
				}
				if(needAddFileSep){
					relPath = File.separator + relPath;
				}
				log.debug("-------GetCompressFileFilter delete file : {}{}", rootPath, relPath);
				File f = new File(rootPath + relPath);
				if(f.exists()){
					f.delete();
				}
			}
		} catch (Exception e) {
			log.error(e);
		}
	}
	
	/**
	 * 删除所有压缩后的文件，并清除compressFileMap
	 */
	public static void clearCompressFileMap(){
		deleteAllCompressFiles();
		compressFileMap.clear();
	}
	
	/**
	 * 获取request的servletPath，如果是转发的请求，则提取原始请求的servletPath
	 * @param request
	 * @return
	 */
	protected String getOriginatingRequestServletPath(HttpServletRequest request){
		String path = (String) request.getAttribute(ATTR_SERVLET_PATH);
		if(path == null){
			path = urlPathHelper.getOriginatingRequestUri(request).substring(request.getContextPath().length());
		}
		return path;
	}

	/**
	 * 生成压缩后的文件路径，如果未配置压缩文件后缀，则使用时间戳作为后缀
	 * @param sourceName
	 * @return
	 */
	protected String createCompressFileName(String sourceName){
		if(sourceName == null){
			return null;
		}
		if(compressFileSuffix == null || compressFileSuffix.trim().length() == 0){
			compressFileSuffix = SEPERATOR + new SimpleDateFormat("yyyyMMddHHmm").format(new Date());
		}
		int i = sourceName.lastIndexOf(SEPERATOR);
		return sourceName.substring(0, i) + compressFileSuffix + sourceName.substring(i, sourceName.length());
	}
	
	/**
	 * 判断访问的js文件是否存在
	 * @param path
	 * @return
	 */
	protected boolean jsFileExist(String path){
		try {
			String relPath = resourcePrefix + path;
			if("\\".equals(File.separator)){
				relPath = relPath.replaceAll("/", "\\\\\\\\");
			}
			if(!relPath.startsWith(File.separator)){
				relPath = File.separator + relPath;
			}
			log.debug("-------GetCompressFileFilter file : rootPath:{} relPath:{}", rootPath, relPath);
			File f = new File(rootPath + relPath);
			return f.exists();
		} catch (Exception e) {
			log.error(e);
		}
		return false;
	}
	
	/**
	 * 判断是否是javascript开发者模式
	 * @param request
	 * @return
	 */
	protected boolean isDeveloperModel(HttpServletRequest request){
		return SysConstant.IS_JAVASCRIPT_DEVELOPER.equals(request.getSession().getAttribute(SysConstant.ATTR_JAVASCRIPT_DEVELOPER));
	}
	
	/**
	 * 转发
	 * @param request
	 * @param response
	 * @param forwardPath
	 * @throws IOException
	 * @throws ServletException 
	 */
	protected void forward(HttpServletRequest request, HttpServletResponse response, String forwardPath) throws IOException, ServletException{
		request.getRequestDispatcher(forwardPath).forward(request, response);
	}
}
