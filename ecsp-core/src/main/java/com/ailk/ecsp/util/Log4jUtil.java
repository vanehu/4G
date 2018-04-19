package com.ailk.ecsp.util;

import org.apache.log4j.LogManager;
import org.apache.log4j.PropertyConfigurator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.ResourceUtils;
import com.ailk.ecsp.core.DataRepository;


public class Log4jUtil {
	private static Logger log = LoggerFactory.getLogger(Log4jUtil.class);
	public static void initLog4j(){
		try{
			log.debug("+++++++++++++++++++++ init Log4j start +++++++++++++++++++++");
			String path = DataRepository.getInstence().getWebParam().getLog4jConfigLocation();
			log.debug("#####Log4j resolved Location={}",path);
			java.net.URL url = ResourceUtils.getURL(path);
			//LogManager.getLoggerRepository().resetConfiguration();
	        PropertyConfigurator.configure(url);
			log.debug("+++++++++++++++++++++ init Log4j finish +++++++++++++++++++++");
		}catch (Exception e) {
			e.printStackTrace();
		}
	}
	private static void setLogMonitor(Object object) {
		// TODO Auto-generated method stub
		
	}
}
