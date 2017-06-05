package com.ailk.ecsp.mybatis.mapper;

import com.ailk.ecsp.mybatis.model.IntfUrl;
import java.util.List;
import java.util.Map;

public interface IntfUrlMapper {

    int insertIntfUrl(IntfUrl record);
    
    int queryIntfUrlCount();

    List<IntfUrl> queryIntfUrl(Map map);
    
    List<IntfUrl> queryIntfUrlAll();
    
    int deleteIntfUrl(Long intfUrlId);
    
    int updateIntfUrl(IntfUrl intfUrl);
}