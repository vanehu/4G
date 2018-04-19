package com.ailk.ecsp.sm.bmo;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ailk.ecsp.client.utils.JsonUtil;
import com.ailk.ecsp.mybatis.mapper.SystemDataMapper;
import com.ailk.ecsp.mybatis.model.Portal;
import com.ailk.ecsp.mybatis.model.SysParam;
import com.ailk.ecsp.sm.common.ResultMap;



@Service
public class PortalBmoImpl implements PortalBmo {
	@Autowired
	private SystemDataMapper systemDataMapper;
	
	public Map<String,Object> queryPortal(int page,int pageSize){
		int count = systemDataMapper.queryPortalCount();
		ResultMap resultMap = new ResultMap();
		if(count>0){
			Map<String,String> param = new HashMap<String,String>();
			int startIndex = (page - 1)*pageSize + 1;
			int endIndex = startIndex + pageSize;
			param.put("startIndex",  startIndex + "");
			param.put("endIndex", endIndex + "");
			List<Portal> lst  = systemDataMapper.queryPortal(param);
			String jsonstr = JsonUtil.toString(lst);
			resultMap.put("Rows", JsonUtil.toObject(jsonstr, List.class));
			
		}
		resultMap.put("Total", count);
		resultMap.setSuccess();
		return resultMap;
	}

	public ResultMap insertPortal(Portal portal) {
		ResultMap resultMap = new ResultMap();
		portal.setCreatTime(new Date());
		int result = systemDataMapper.insertPortal(portal);
		if(result>0){
			resultMap.setSuccess();
		}else{
			resultMap.setFail("数据保存失败！");
		}
		return resultMap;
	}

	public ResultMap deletePortal(Long portalId) {
		ResultMap resultMap = new ResultMap();
		int result = systemDataMapper.deletePortal(portalId);
		if(result>=0){
			resultMap.setSuccess();
		}else{
			resultMap.setFail("记录portalId="+portalId+"删除失败");
		}
		return resultMap;
	}

	public ResultMap updatePortal(Portal portal) {
		ResultMap resultMap = new ResultMap();
		int result = systemDataMapper.updatePortal(portal);
		if(result>=0){
			resultMap.setSuccess();
		}else{
			resultMap.setFail("参数"+portal.getPortalName()+"更新失败");
		}
		return resultMap;
	}
	
	public List<Portal> queryAllPortal() {
		List<Portal> list = systemDataMapper.queryAllPoral();
		return list;
	}
	
	
}
