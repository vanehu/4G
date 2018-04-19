package com.ailk.ecsp.mybatis.mapper;

import java.util.List;
import java.util.Map;
import com.ailk.ecsp.mybatis.model.ServiceModel;

public interface ServiceMapper {
	
	public List<ServiceModel> queryAllService();
	
	public List<ServiceModel> queryServicesByPackCode(String packCode);
	
	public ServiceModel findService(String serviceCode);
	
	public List<ServiceModel> queryService(Map<String,String> param);
	
	public int queryServiceCount();
	
	public int insertService(ServiceModel record);
	
	public int deleteService(Long serviceId);
}
