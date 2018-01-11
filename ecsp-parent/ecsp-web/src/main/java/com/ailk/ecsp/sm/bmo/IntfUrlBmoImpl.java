package com.ailk.ecsp.sm.bmo;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ailk.ecsp.client.utils.JsonUtil;
import com.ailk.ecsp.mybatis.mapper.IntfUrlMapper;
import com.ailk.ecsp.mybatis.model.IntfUrl;
import com.ailk.ecsp.sm.common.ResultMap;

/**
 * 
 * @author 陈源龙
 *
 */


@Service
public class IntfUrlBmoImpl implements IntfUrlBmo {

	@Autowired
	private IntfUrlMapper intfUrlMapper;
	
	public ResultMap queryIntfUrl(int page,int pageSize){
		int count = intfUrlMapper.queryIntfUrlCount();
		ResultMap resultMap = new ResultMap();
		if(count>0){
			Map<String,String> param = new HashMap<String,String>();
			int startIndex = (page - 1)*pageSize + 1;
			int endIndex = startIndex + pageSize;
			param.put("startIndex",  startIndex + "");
			param.put("endIndex", endIndex + "");
			List<IntfUrl> lst  = intfUrlMapper.queryIntfUrl(param);
			String jsonstr = JsonUtil.toString(lst);
			resultMap.put("Rows", JsonUtil.toObject(jsonstr, List.class));
			
		}
		resultMap.put("Total", count);
		resultMap.setSuccess();
		return resultMap;
	}

	public ResultMap insertIntfUrl(IntfUrl intfUrl) {
		ResultMap resultMap = new ResultMap();
		int result = intfUrlMapper.insertIntfUrl(intfUrl);
		if(result>0){
			resultMap.setSuccess();
		}else{
			resultMap.setFail("数据保存失败！");
		}
		return resultMap;
	}

	public ResultMap deleteIntfUrl(Long intfUrlId) {
		ResultMap resultMap = new ResultMap();
		int result = intfUrlMapper.deleteIntfUrl(intfUrlId);
		if(result>=0){
			resultMap.setSuccess();
		}else{
			resultMap.setFail("记录intfUrlId="+intfUrlId+"删除失败");
		}
		return resultMap;
	}

	public ResultMap updateIntfUrl(IntfUrl intfUrl) {
		ResultMap resultMap = new ResultMap();
		int result = intfUrlMapper.updateIntfUrl(intfUrl);
		if(result>=0){
			resultMap.setSuccess();
		}else{
			resultMap.setFail("参数"+intfUrl +"更新失败");
		}
		return resultMap;
	}
	
	
	
}
