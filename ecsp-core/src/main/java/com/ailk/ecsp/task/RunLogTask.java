package com.ailk.ecsp.task;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.scheduling.quartz.QuartzJobBean;

public class RunLogTask extends QuartzJobBean {

	protected static Logger logger = LoggerFactory.getLogger(RunLogTask.class);
	
	@Override
	protected void executeInternal(JobExecutionContext arg0)
			throws JobExecutionException {
		logger.debug("执行日志定时任务");
		RunLog.getInstance().writeRunlog();
	}

}
