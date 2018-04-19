package com.ailk.ecsp.api.bmo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ailk.ecsp.mybatis.mapper.WechatTokenMapper;
import com.ailk.ecsp.mybatis.model.WechatToken;
import com.ailk.ecsp.sm.common.ResultMap;
@Service
public class WechatTokenBmoImp implements WechatTokenBmo {
	
	@Autowired
    private WechatTokenMapper wechatTokenMapper;
	public int insertWechatToken(WechatToken wechatToken) {
		ResultMap resultMap = new ResultMap();
		int result = wechatTokenMapper.insertWechatToken(wechatToken);
		/*if(result>0){
			resultMap.setSuccess();
		}else{
			resultMap.setFail("数据保存失败！");
		}*/
		return result;
	}

}
