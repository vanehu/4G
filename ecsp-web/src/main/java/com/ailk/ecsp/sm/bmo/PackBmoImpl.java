package com.ailk.ecsp.sm.bmo;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;
import com.ailk.ecsp.client.utils.JsonUtil;
import com.ailk.ecsp.core.PlatformBoot;
import com.ailk.ecsp.mybatis.mapper.PackMapper;
import com.ailk.ecsp.mybatis.model.Pack;
import com.ailk.ecsp.sm.common.ResultMap;

/**
 * 
 * @author chenyl
 *
 */

@Service
public class PackBmoImpl implements PackBmo {
	@Autowired
	private PackMapper packMapper;
	@Autowired
	private ApplicationContext applicationContext;
	
	public Map<String,Object> queryPack(int page,int pageSize){
		int count = packMapper.queryPackCount();
		ResultMap resultMap = new ResultMap();
		if(count>0){
			Map<String,String> param = new HashMap<String,String>();
			int startIndex = (page - 1)*pageSize + 1;
			int endIndex = startIndex + pageSize;
			param.put("startIndex",  startIndex + "");
			param.put("endIndex", endIndex + "");
			List<Pack> lst  = packMapper.queryPack(param);
			String jsonstr = JsonUtil.toString(lst);
			resultMap.put("Rows", JsonUtil.toObject(jsonstr, List.class));
			
		}
		resultMap.put("Total", count);
		resultMap.setSuccess();
		return resultMap;
	}

	public ResultMap insertPack(Pack pack) {
		ResultMap resultMap = new ResultMap();
		pack.setCreatTime(new Date());
		pack.setUpdateTime(new Date());
		int result = packMapper.insertPack(pack);
		if(result>0){
			resultMap.setSuccess();
		}else{
			resultMap.setFail("数据保存失败！");
		}
		return resultMap;
	}

	public ResultMap deletePack(Long packId) {
		ResultMap resultMap = new ResultMap();
		int result = packMapper.deletePack(packId);
		if(result>=0){
			resultMap.setSuccess();
		}else{
			resultMap.setFail("记录packId="+packId+"删除失败");
		}
		return resultMap;
	}

	public ResultMap updatePack(Pack pack) {
		ResultMap resultMap = new ResultMap();
		pack.setUpdateTime(new Date());
		int result = packMapper.updatePack(pack);
		if(result>=0){
			resultMap.setSuccess();
		}else{
			resultMap.setFail("参数:"+pack.getPackName()+"更新失败");
		}
		return resultMap;
	}
	

	public ResultMap restartPackService(String packCode) {
		ResultMap rs = new ResultMap();
		try{
			PlatformBoot boot = new PlatformBoot(applicationContext);
			boot.reloadPackService(packCode);
			rs.setSuccess("重启成功");
		}catch (Exception e) {
			rs.setFail("重启失败");
		}
		return rs;
	}
	
}
