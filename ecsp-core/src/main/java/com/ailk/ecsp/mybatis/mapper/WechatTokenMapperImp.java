package com.ailk.ecsp.mybatis.mapper;

import com.ailk.ecsp.core.DataSourceRouter;
import com.ailk.ecsp.mybatis.model.WechatToken;
import com.ailk.ecsp.util.SpringContextUtil;

public class WechatTokenMapperImp {
	public WechatTokenMapper srlm = SpringContextUtil.getBean(WechatTokenMapper.class);;
	
	public int insertWechatToken(WechatToken wechatToken,String dbKeyWord)throws Exception{
		DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
		return srlm.insertWechatToken(wechatToken);
	}

}
