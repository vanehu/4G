package com.linkage.portal.service.lte.core.system;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.exception.ExceptionUtils;

import com.ailk.ecsp.core.DataRepository;
import com.ailk.ecsp.core.DataSourceRouter;
import com.ailk.ecsp.core.PlatformBoot;
import com.ailk.ecsp.core.SysConstant;
import com.ailk.ecsp.service.Service;
import com.ailk.ecsp.util.SpringContextUtil;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.exception.ResultConstant;
import com.linkage.portal.service.lte.DataMapUtil;

public class GetSysParam extends Service {
	public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
		try {
			String action = MapUtils.getString(dataMap.getInParam(), "action", "");
			String obj = MapUtils.getString(dataMap.getInParam(), "serviceName", "");
			String groupId = MapUtils.getString(dataMap.getInParam(), "groupId", "");
			String dbKeyWords = MapUtils.getString(dataMap.getInParam(), "dbKeyWords", "");
			String multiDataSource = MapUtils.getString(dataMap.getInParam(), "multiDataSource", "");
			//多个action 
			for(String actionType : action.split(SysConstant.CON_REF_PARAM_ACTION_GROUP)){
				//刷新指定的各个数据库的缓存
				for(String dbKeyWord : dbKeyWords.split(SysConstant.CON_REF_PARAM_ACTION_GROUP)){
					if(StringUtils.isBlank(dbKeyWord)){
						dbKeyWord = DataSourceRouter.DEFAULT_DATASOURCE_KEY;
					}
					if ("REF".equals(actionType)) {
						refreshSysParam(dbKeyWord);
						refreshAllPackService(dbKeyWord);
					} else if ("REF_SYS".equals(actionType)) {
						refreshSysParam(dbKeyWord);
					} else if ("REF_SERV".equals(actionType)) {
						refreshAllPackService(dbKeyWord);
					} else if ("REF_LOG_ON".equals(actionType)) {
						openWriteLog(dbKeyWord);
					} else if ("REF_LOG_OFF".equals(actionType)) {
						colseWriteLog(dbKeyWord);
					} else {
						
					}
				}
				
			}
			
			//根据入参的所有dbKeyWord返回相应的配置数据
			Map<String, Object> returnMap = new HashMap<String, Object>();
			HashMap<String, HashMap<String, String>> datasourcesSysParams = DataRepository.getInstence().getAllSysParam();
			HashMap<String, HashMap<String, String>> rtDataSourcesSysParams = new HashMap<String, HashMap<String, String>>();
			
			for(String dbKeyWord : dbKeyWords.split(SysConstant.CON_REF_PARAM_ACTION_GROUP)){
				if(StringUtils.isBlank(dbKeyWord)){
					dbKeyWord = DataSourceRouter.DEFAULT_DATASOURCE_KEY;
				}
				HashMap<String, String> sysParams = datasourcesSysParams.get(dbKeyWord);
				HashMap<String, String> rtsysParams = new HashMap<String, String>();
				for(String sysParamKey : sysParams.keySet()){
					String[] key = sysParamKey.split(SysConstant.CON_SEPARATOR_SYS_PARAM_GROUP);
					if("".equals(groupId) || key[0].equals(groupId)){
						rtsysParams.put(key[1], sysParams.get(sysParamKey));
					}
				}
				rtDataSourcesSysParams.put(dbKeyWord, rtsysParams);
			}
//			Set set = datasourcesSysParams.entrySet();
//			Iterator it = datasourcesSysParams.entrySet().iterator();
//			while (it.hasNext()) {
//				Entry entry = (Entry) it.next();
//				String key[] = String.valueOf(entry.getKey()).split(
//						SysConstant.CON_SEPARATOR_SYS_PARAM_GROUP);
//				if ("".equals(groupId) || key[0].equals(groupId)) {
//					rtDataSourcesSysParams.put(key[1], entry.getValue());
//				}
//			}
			
			//兼容以前获取单数据源的配置，如果是单数据源，返回HashMap<String,String>类型
			if("Y".equals(multiDataSource)){
				returnMap.put("result", rtDataSourcesSysParams);
			} else {
				if(rtDataSourcesSysParams.size() > 0){
					returnMap.put("result", rtDataSourcesSysParams.values().iterator().next());
				}
			}
			
			
			returnMap.put("code", ResultConstant.R_POR_SUCCESS.getCode());
			dataMap.setOutParam(returnMap);
			DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_POR_SUCCESS);
		} catch (Exception e) {
			DataMapUtil.setDataMapResult(dataMap,
					ResultConstant.R_SERV_DATABASE_EXCEPTION,ExceptionUtils.getFullStackTrace(e));
			e.printStackTrace();
		}
		return dataMap;
	}

	private void refreshSysParam(String dbKeyWord) throws Exception {
		PlatformBoot pb = new PlatformBoot(
				SpringContextUtil.getApplicationContext());
		pb.reloadAllSystemParam(dbKeyWord);
	}
	
	private void refreshAllPackService(String dbKeyWord) throws Exception {
		PlatformBoot pb = new PlatformBoot(
				SpringContextUtil.getApplicationContext());
		pb.reloadAllPackService();
	}
	
	//打开服务层内部日志记录
	private void openWriteLog(String dbKeyWord) throws Exception {
		DataRepository.getInstence().addSysParam(dbKeyWord,SysConstant.CON_SYS_PARAM_GROUP_SYS_PARAM+SysConstant.CON_SEPARATOR_SYS_PARAM_GROUP+SysConstant.CON_WRITE_LOG_FLAG, SysConstant.CON_ON);
	}
	
	//关闭服务层内部日志记录（主表及附表）
	private void colseWriteLog(String dbKeyWord) throws Exception {
		DataRepository.getInstence().addSysParam(dbKeyWord,SysConstant.CON_SYS_PARAM_GROUP_SYS_PARAM+SysConstant.CON_SEPARATOR_SYS_PARAM_GROUP+SysConstant.CON_WRITE_LOG_FLAG, SysConstant.CON_OFF);
	}
}