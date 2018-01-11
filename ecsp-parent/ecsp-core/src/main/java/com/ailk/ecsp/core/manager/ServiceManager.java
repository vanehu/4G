package com.ailk.ecsp.core.manager;

import java.util.List;
import com.ailk.ecsp.mybatis.model.ServiceModel;
import com.ailk.ecsp.service.Service;

public interface ServiceManager {
	
	public void initialize();
	
	public boolean reloadService(String packCode);
	
	public void reloadAllService();
	
	public void loadServices(List<ServiceModel>  list);
	
	public Service instanceService(ServiceModel sm);
	
	public int addService(ServiceModel sm);
}
