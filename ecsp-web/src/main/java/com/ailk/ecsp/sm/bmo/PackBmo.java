package com.ailk.ecsp.sm.bmo;

import java.util.Map;
import com.ailk.ecsp.mybatis.model.Pack;
import com.ailk.ecsp.sm.common.ResultMap;

public interface PackBmo {
	public Map<String,Object> queryPack(int startIndex,int pageSize);
	
	public ResultMap insertPack(Pack pack);
	
	public ResultMap deletePack(Long packId);
	
	public ResultMap updatePack(Pack pack);
	
	public ResultMap restartPackService(String packCode);
}
