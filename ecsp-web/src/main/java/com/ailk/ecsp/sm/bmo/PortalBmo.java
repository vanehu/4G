package com.ailk.ecsp.sm.bmo;

import java.util.List;
import java.util.Map;
import com.ailk.ecsp.mybatis.model.Portal;
import com.ailk.ecsp.sm.common.ResultMap;

public interface PortalBmo {
	public Map<String,Object> queryPortal(int startIndex,int pageSize);
	
	public ResultMap insertPortal(Portal portal);
	
	public ResultMap deletePortal(Long portalId);
	
	public ResultMap updatePortal(Portal portal);
	
	public List<Portal> queryAllPortal();
}
