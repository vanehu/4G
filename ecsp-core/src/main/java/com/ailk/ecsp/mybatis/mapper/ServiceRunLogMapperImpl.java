package com.ailk.ecsp.mybatis.mapper;

import java.util.List;

import com.ailk.ecsp.core.DataSourceRouter;
import com.ailk.ecsp.mybatis.model.ServiceRunLog;
import com.ailk.ecsp.util.SpringContextUtil;
public class ServiceRunLogMapperImpl{
	public ServiceRunLogMapper srlm = SpringContextUtil.getBean(ServiceRunLogMapper.class);;
	
	public long insertBatch(List<ServiceRunLog> list,String dbKeyWord)throws Exception{
		DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
		return srlm.insertBatch(list);
	}
    
	public int insert(ServiceRunLog runLog,String dbKeyWord) throws Exception{
		DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
		return srlm.insert(runLog);
		
	}
	
	public int insertDetail(ServiceRunLog runLog,String dbKeyWord) throws Exception{
		DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);		
		return srlm.insertDetail(runLog);
	}
	
	public List query(ServiceRunLog runLog,String dbKeyWord) throws Exception{
		DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
		return srlm.query(runLog);
	}

}