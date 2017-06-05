package com.ailk.ecsp.sm.bmo;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.math.NumberUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;
import com.ailk.ecsp.client.utils.JsonUtil;
import com.ailk.ecsp.core.PlatformBoot;
import com.ailk.ecsp.core.manager.PackManager;
import com.ailk.ecsp.mybatis.EcspTransaction;
import com.ailk.ecsp.mybatis.mapper.IntfUrlMapper;
import com.ailk.ecsp.mybatis.mapper.PackMapper;
import com.ailk.ecsp.mybatis.mapper.RoleServiceMapper;
import com.ailk.ecsp.mybatis.mapper.ServiceMapper;
import com.ailk.ecsp.mybatis.mapper.ServicePackMapper;
import com.ailk.ecsp.mybatis.model.IntfUrl;
import com.ailk.ecsp.mybatis.model.Pack;
import com.ailk.ecsp.mybatis.model.RoleService;
import com.ailk.ecsp.mybatis.model.ServiceModel;
import com.ailk.ecsp.mybatis.model.ServiceRole;
import com.ailk.ecsp.sm.common.ResultMap;



@Service
public class ServiceBmoImpl implements ServiceBmo {
	@Autowired
	private ServiceMapper serviceMapper;
	@Autowired
	private RoleServiceMapper roleServiceMapper;
	@Autowired
	private RoleBmo roleBmo;
	@Autowired
	private IntfUrlMapper intfUrlMapper;
	@Autowired
	private PackMapper packMapper;
	@Autowired
	private ServicePackMapper servicePackMapper;

	
	public ResultMap queryService(int page,int pageSize) {
		int count = serviceMapper.queryServiceCount();
		ResultMap resultMap = new ResultMap();
		if(count>0){
			Map<String,String> param = new HashMap<String,String>();
			int startIndex = (page - 1)*pageSize + 1;
			int endIndex = startIndex + pageSize;
			param.put("startIndex",  startIndex + "");
			param.put("endIndex", endIndex + "");
			List<ServiceModel> lst  = serviceMapper.queryService(param);
			for(int i = 0 ; i < lst.size(); i++){
				ServiceModel sm =  lst.get(i);
				List<ServiceRole> sr = roleServiceMapper.queryRole(sm.getServiceId());
				sm.setServiceRoles(sr);
				lst.set(i, sm);
			}
			String jsonstr = JsonUtil.toString(lst);
			resultMap.put("Rows", JsonUtil.toObject(jsonstr, List.class));
		}
		resultMap.put("Total", count);
		resultMap.setSuccess();
		return resultMap;
	}

	public ResultMap serviceAddPage(){
		ResultMap resultMap = new ResultMap();
		List<ServiceRole> list = roleBmo.queryAllRole();
    	List roleList = new ArrayList();
    	for(int i = 0; list!=null && i < list.size();i++){
    		Map<String,Object> role = new HashMap<String,Object>();
    		ServiceRole sr = list.get(i);
    		role.put("id", sr.getRoleId());
    		role.put("text", sr.getRoleName());
    		roleList.add(role);
    	}
    	resultMap.put("roleList", JsonUtil.toString(roleList));
    	
    	List<IntfUrl> intfList = intfUrlMapper.queryIntfUrlAll();
    	resultMap.put("intfList", intfList);
    	
    	List<Pack> packList = packMapper.queryAllPacks();
    	resultMap.put("packList", packList);
    	resultMap.setSuccess();
		return resultMap;
	}

	@EcspTransaction
	public int delService(Long serviceId) {
		try{
			roleServiceMapper.deleteRoleService(serviceId);
			servicePackMapper.deleteServicePack(serviceId);
			return serviceMapper.deleteService(serviceId);
		}catch (Exception e) {
			return -1;
		}
	}
	
}
