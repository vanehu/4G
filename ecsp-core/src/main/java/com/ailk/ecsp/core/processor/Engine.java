package com.ailk.ecsp.core.processor;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ailk.ecsp.core.DataRepository;
import com.ailk.ecsp.core.PlatformBoot;
import com.ailk.ecsp.core.ServiceInvokeFactory;
import com.ailk.ecsp.core.container.ContainerFactory;
import com.ailk.ecsp.lifecycle.LifecycleException;
import com.ailk.ecsp.mornitor.ServiceRuntimeMornitor;
import com.ailk.ecsp.mybatis.WebParam;
import com.ailk.ecsp.security.PermissionManager;
import com.ailk.ecsp.security.PlatPermission;
import com.ailk.ecsp.security.RolePermission;
import com.ailk.ecsp.util.SpringContextUtil;

public abstract class Engine extends HttpServlet{
	protected static Logger logger = LoggerFactory.getLogger(Engine.class);
	private static final long serialVersionUID = 1L;
	protected abstract void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException;
	protected abstract void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException;
	public void init() throws ServletException {
		logger.info("初始化服务容器...........");
		try {
			bootContainer();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		logger.info("服务容器初始化结束..........");
	}
	/**
	 * 启动容器
	 * @throws Exception 
	 * */
	public void bootContainer() throws Exception {
		
		initWebParameter();
		
		PlatformBoot boot = new PlatformBoot(SpringContextUtil.getApplicationContext());
		boot.start();
		
		//注册服务调用器的监听者
		ServiceInvokeFactory.getInstance().addLifecycleListener(ServiceRuntimeMornitor.getInstance());
		
		//初始化权限管理
		initPermissionManager();
		
		try {
			ContainerFactory.getInstance().start();
		} catch (LifecycleException e) {
			logger.error("启动容器异常.........", e);
		}
		WebParam webParam = DataRepository.getInstence().getWebParam();
		logger.info("系统运行在 {} 模式",webParam.getRunLevel());
		logger.info("系统是否鉴权：{} " ,webParam.getCheckPermission());
		logger.info("服务包路径：{} " ,webParam.getServiceLibPath());
	}
	
	/**
	 * 服务引擎销毁的时候，进行容器停止操作
	 * */
	public void destroy() {
		
		super.destroy();
		
		try {
			ContainerFactory.getInstance().stop();
		} catch (LifecycleException e) {
			logger.error("启动销毁异常.........", e);
		}
		
	}
    protected void initPermissionManager() {
        PermissionManager pm = new PermissionManager();
        pm.addPermission(new PlatPermission());
        pm.addPermission(new RolePermission());
		ContainerFactory.getInstance().setPermissionManager(pm);
    }
	public void initWebParameter(){
		String runLevel = getInitParameter("runLevel");
		String checkPermission = getInitParameter("checkPermission");
		String serviceLibPath = getInitParameter("serviceLibPath");
		String analogDataPath =  getInitParameter("analogDataPath");
		String log4jPath = getServletContext().getInitParameter("log4jConfigLocation");
		
		DataRepository.getInstence().getWebParam().setCheckPermission(checkPermission);
		DataRepository.getInstence().getWebParam().setRunLevel(runLevel);
		DataRepository.getInstence().getWebParam().setServiceLibPath(serviceLibPath);
		DataRepository.getInstence().getWebParam().setAnalogDataPath(analogDataPath);
		
		//log4j相当路径转换为绝对路径
		/*
		if (!ResourceUtils.isUrl(log4jPath)) {
			log4jPath = SystemPropertyUtils.resolvePlaceholders(log4jPath);
			try {
				log4jPath = WebUtils.getRealPath(getServletContext(), log4jPath);
			} catch (FileNotFoundException e) {
				e.printStackTrace();
			}
		}
		DataRepository.getInstence().getWebParam().setLog4jConfigLocation(log4jPath);
		*/
	}
}
