package com.ailk.ecsp.api.bmo;

import com.ailk.ecsp.mybatis.model.WechatToken;
import com.ailk.ecsp.sm.common.ResultMap;

public interface WechatTokenBmo {
	public int insertWechatToken(WechatToken wechatToken);

}
