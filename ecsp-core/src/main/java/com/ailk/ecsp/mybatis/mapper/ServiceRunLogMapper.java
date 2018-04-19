package com.ailk.ecsp.mybatis.mapper;

import com.ailk.ecsp.mybatis.model.ServiceRunLog;
import java.util.List;
import java.util.Map;

public interface ServiceRunLogMapper {

	long insertBatch(List<ServiceRunLog> list) throws Exception;
    
	int insert(ServiceRunLog runLog) throws Exception;
	
	int insertDetail(ServiceRunLog runLog) throws Exception;
	
	List query(ServiceRunLog runLog) throws Exception;

}