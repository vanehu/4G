package com.ailk.ecsp.mybatis.mapper;

import com.ailk.ecsp.mybatis.model.ServicePack;

public interface ServicePackMapper {

    int insertServicePack(ServicePack record);
    
    int deleteServicePack(Long serviceId);
}