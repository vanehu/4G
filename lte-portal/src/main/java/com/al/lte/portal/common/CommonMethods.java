package com.al.lte.portal.common;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.common.web.SpringContextUtil;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.log.Log;
import com.al.lte.portal.bmo.staff.StaffChannelBmo;
import com.al.lte.portal.bmo.system.AuthenticBmo;
import com.al.lte.portal.core.DataRepository;
import com.al.lte.portal.model.SessionStaff;

public class CommonMethods {
	
	private static final Log log = Log.getLog(CommonMethods.class);
	
	private static AuthenticBmo authenticBmo;
	
	public static List<Map<String, Object>> getAreaRangeList(SessionStaff sessionStaff,Map<String,Object> param,String operateSpecInfo) throws Exception {
		Map<String, Object> queryParm = new HashMap<String, Object>();
		Map authenticDataRangeData = null ;
		String upRegionId = param.get("parentAreaId")==null?"":param.get("parentAreaId").toString();
		String upRegionAreaId = upRegionId ;
		if(upRegionAreaId!=null&&upRegionAreaId.length()>1&&upRegionAreaId.substring(0,2).equals("ch")){
			upRegionAreaId = upRegionAreaId.substring(2,upRegionAreaId.length());
		}
		String areaLevel =  param.get("leve")==null?"":param.get("leve").toString();
		String dataDimensionCd = param.get("dataDimensionCd")==null?"":param.get("dataDimensionCd").toString();
		String areaLimit = param.get("areaLimit")==null?"":param.get("areaLimit").toString();
		String APPDESC = param.get("APPDESC")==null?"":param.get("APPDESC").toString();
		String isChannelArea = param.get("isChannelArea")==null?"":param.get("isChannelArea").toString();
		
		try{
			List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
			
			if(param.get("channelAreaId")!=null){
				isChannelArea = "Y" ;
				String areaIdS = param.get("channelAreaId").toString();
				if(!areaIdS.equals("")&&!areaIdS.equals("null")){
					String areaId = sessionStaff.getCurrentAreaId();
					String areaIdNew = "ch"+sessionStaff.getCurrentAreaId();
					String areaCode = sessionStaff.getCurrentAreaCode();
					String areaName = sessionStaff.getCurrentAreaAllName();
					if(areaName!=null && areaName.contains(",")){
						areaName.replace(",", " > ");
					}
					Map map = new HashMap();
					map.put("commonRegionId", areaIdNew);
					map.put("parentNodeId", "0");
					map.put("regionCode", areaCode);
					map.put("isChannelArea", isChannelArea);
					if(areaId.length()==7&&areaId.substring(5,7).equals("00")){//地区7位，并且不是最后一级
						if(APPDESC.equals(SysConstant.APPDESC_MVNO)){
							map.put("isAllRegionFlag", "Y");
							map.put("regionName", areaName+" [受理渠道地区]");
							if("8100000".equals(areaId)){//全国 8100000
								map.put("areaLevel", 2);
							}else if(areaId.substring(3,7).equals("0000")){//市 8320100
								map.put("areaLevel", 3);
							}else if(areaId.substring(5,7).equals("00")){//市 8320100
								map.put("areaLevel", 4);
							}else{
								map.put("areaLevel", 5);
							}
						}else{
							if("8100000".equals(areaId)){//全国 8100000
								map.put("isAllRegionFlag", "N");
								map.put("regionName", areaName+" [受理渠道地区]*");
								map.put("areaLevel", 2);
							}else if(areaId.substring(3,7).equals("0000")){//市 8320100
								if(dataDimensionCd.equals(DataRepository.getInstence().getCommonParamByCode(SysConstant.AREA_DIMENSION_CD))){//受理地区
									map.put("isAllRegionFlag", "N");
									map.put("regionName", areaName+" [受理渠道地区]*");
									map.put("areaLevel", 3);
								}else if(areaLimit!=null&&areaLimit.equals("limitProvince")){//限制不可选 省一级
									map.put("isAllRegionFlag", "N");
									map.put("regionName", areaName+" [受理渠道地区]*");
									map.put("areaLevel", 3);
								}else{
									map.put("isAllRegionFlag", "Y");
									map.put("regionName", areaName+" [受理渠道地区]");
									map.put("areaLevel", 3);
								}
							}else if(areaId.substring(5,7).equals("00")){//市 8320100
								map.put("isAllRegionFlag", "Y");
								map.put("regionName", areaName+" [受理渠道地区]");
								map.put("areaLevel", 4);
							}else{
								map.put("isAllRegionFlag", "Y");
								map.put("regionName", areaName+" [受理渠道地区]");
								map.put("areaLevel", 5);
							}
						}
					}else{//区8320101
						map.put("isAllRegionFlag", "Y");
						map.put("regionName", areaName+" [受理渠道地区]");
						map.put("areaLevel", 5);
					}
					list.add(map);
				}
			}
			
			if (authenticBmo == null) {
				authenticBmo = (AuthenticBmo) SpringContextUtil.getBean("com.al.lte.portal.bmo.system.AuthenticBmo");				
			}
			if(param.get("channelAreaId")==null&&"Y".equals(isChannelArea)){//channelAreaId为空，并且是渠道入口地区查询 并且 是查渠道的
				queryParm.put("areaLevel", areaLevel);
				if("2".equals(areaLevel)){
					queryParm.put("upRegionId", null);
				}else{
					queryParm.put("upRegionId", upRegionAreaId);
				}
				authenticDataRangeData = authenticBmo.queryAllDataRangeAreaData(queryParm, null, sessionStaff);
			}else{
				queryParm.put("staffId", sessionStaff.getStaffId());
				queryParm.put("operatSpecCd", operateSpecInfo);
				queryParm.put("dataDimensionCd", dataDimensionCd);//SysConstant.AREA_DIMENSION_CD
				queryParm.put("areaLevel", areaLevel);
				queryParm.put("upRegionId", upRegionAreaId);
				authenticDataRangeData = authenticBmo.queryAuthenticDataRangeAreaData(queryParm, null, sessionStaff);
				isChannelArea = "N" ;
			}
			
			Integer leve = 0 ;
			try{
				leve = Integer.parseInt(areaLevel);
				leve = leve + 1 ;
			}catch(Exception e){
				log.error("区划层级数有问题");
				//e.printStackTrace();
			}
			
			if(authenticDataRangeData!=null && authenticDataRangeData.get("areaTree")!=null){
				Object obj = authenticDataRangeData.get("areaTree");
				if(obj instanceof List){
					List<Map> list2 = (List<Map>)authenticDataRangeData.get("areaTree");
					//临时修改，待系统管理添加areaLevel字段
					for(Map obj2:list2){
						if(leve<4&&dataDimensionCd.equals(DataRepository.getInstence().getCommonParamByCode(SysConstant.AREA_DIMENSION_CD))){//受理地区
							obj2.put("isAllRegionFlag", "N");
							obj2.put("regionName", obj2.get("regionName")+"*");
						}else if(leve<4&&areaLimit!=null&&areaLimit.contains("limitProvince")){
							obj2.put("isAllRegionFlag", "N");
							obj2.put("regionName", obj2.get("regionName")+"*");
						}else{
							if(obj2.get("isAllRegionFlag")!=null&&obj2.get("isAllRegionFlag").equals("N")){
								obj2.put("regionName", obj2.get("regionName")+"*");
							}else{
								obj2.put("isAllRegionFlag", "Y");
							}
						}
						if(obj2.get("areaLevel")==null){
							obj2.put("areaLevel", leve);
						}
						
						if(APPDESC.equals(SysConstant.APPDESC_MVNO)){
							obj2.put("isAllRegionFlag", "Y");
							obj2.put("regionName", obj2.get("regionName")==null?"":obj2.get("regionName").toString().replace("*", ""));
						}
						
						String parentId = (upRegionId.equals("null")||upRegionId.equals("")?"0":upRegionId) ;
						obj2.put("parentId", parentId);
						obj2.put("isChannelArea", isChannelArea);
						list.add(obj2);
					}
				}
			}
			return list ;
		} catch (InterfaceException ie) {
			throw ie ;
		} catch (BusinessException e) {
			log.error("门户/staff/login/loginValid方法异常", e);
			throw new BusinessException(ErrorCode.OPERAT_AREA_RANGE, queryParm, authenticDataRangeData, e);
		} catch (Exception e) {
			throw new Exception("门户处理系统管理的queryOperatAreaRange服务返回的数据异常",e);
		}
		
	}
	
	public static String strNotNull(Object obj,String mess){
		if(obj==null){
			return mess ;
		}else if(obj.equals("")||obj.equals("null")){
			return mess ;
		}else{
			return obj.toString();
		}
	}
	
	//获取组织地区全称（原查询类业务默认地区，暂弃用）
	public static String getDefaultAreaName(SessionStaff sessionStaff){
		
		String province = sessionStaff.getUpProvinName();
		String city = sessionStaff.getCityName();
		String area = sessionStaff.getRegionName();
		String defaultAreaName = "";
		if(!province.equals("")){
			defaultAreaName = province;
			if(!city.equals("")){
				defaultAreaName = defaultAreaName + " > " + city;
				if(!area.equals("")){
					defaultAreaName = defaultAreaName + " > " + area;
				}
			}
		}
		return defaultAreaName;
	}
	
	//获取当前受理渠道地区作为默认地区，若当前受理渠道是C4级地区则使用其上级C3地区作为默认
	public static Map<String, Object> getDefaultAreaInfo_MinimumC3(SessionStaff sessionStaff){
		
		Map<String, Object> areaInfo = new HashMap<String, Object>();
		String areaId = sessionStaff.getCurrentAreaId();
		String areaName = sessionStaff.getCurrentAreaAllName();		
		if(!"00".equals(areaId.substring(5))){
			areaId = areaId.substring(0, 5) + "00";
			String[] areaLv = areaName.split(">");
			areaName = areaLv[0].trim();
			for(int n=1;n<areaLv.length-1;n++){
				areaName += " > " + areaLv[n].trim();
			}
		}
		areaInfo.put("defaultAreaId", areaId);
		areaInfo.put("defaultAreaName", areaName);
		return areaInfo;
	}
	
}
