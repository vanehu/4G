package com.al.lte.portal.common;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import net.sf.json.JSONObject;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang3.StringUtils;
import com.al.common.utils.StringUtil;
import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.MDA;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.common.web.SpringContextUtil;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.log.Log;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.bmo.system.AuthenticBmo;
import com.al.lte.portal.core.DataRepository;
import com.al.lte.portal.model.SessionStaff;

public class CommonMethods {
	
	private static final Log log = Log.getLog(CommonMethods.class);
	
	private static AuthenticBmo authenticBmo;
	
	private static CommonMethods commonMethodsInstance;
	
	public static CommonMethods getInstance(){
		if(commonMethodsInstance == null){
			synchronized(CommonMethods.class){
				if(commonMethodsInstance == null){
					commonMethodsInstance = new CommonMethods();
				}
			}
		}
		
		return commonMethodsInstance;
	}
	
	public static List<Map<String, Object>> getAreaRangeList(SessionStaff sessionStaff,Map<String,Object> param,String operateSpecInfo) throws Exception {
		Map<String, Object> queryParm = new HashMap<String, Object>();
		Map<String, Object> authenticDataRangeData = null ;
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
						areaName = areaName.replace(",", " > ");
					}
					Map<String, Object> map = new HashMap<String, Object>();
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
			Map<String, Object> parentAreaInfo = getParentAreaInfo(areaId);
			if(!MapUtils.getString(parentAreaInfo, "areaId", "").equals("")){
				areaId = MapUtils.getString(parentAreaInfo, "areaId");
				String[] areaLv = areaName.split(">");
				areaName = areaLv[0].trim();
				for(int n=1;n<areaLv.length-1;n++){
					areaName += " > " + areaLv[n].trim();
				}
			}			
		}
		areaInfo.put("defaultAreaId", areaId);
		areaInfo.put("defaultAreaName", areaName);
		return areaInfo;
	}
	
	/**
	 * 根据提供的areaId查询其上级地区信息
	 * @param childAreaId
	 * @return 上级地区的areaId和areaName
	 */
	public static Map<String, Object> getParentAreaInfo(String childAreaId){
		Map<String, Object> dataBusMap = new HashMap<String, Object>();
		dataBusMap.put("childAreaId", childAreaId);
		DataBus db = ServiceClient.callService(dataBusMap, PortalServiceCode.QUERY_PARENT_AREA_INFO, null, null);
		Map<String, Object> parentAreaInfo = new HashMap<String, Object>();
		try{
			if(ResultCode.R_SUCCESS.equals(db.getResultCode())){
				parentAreaInfo = db.getReturnlmap();
			}
		}catch(Exception e ){
			
		}
		return parentAreaInfo;
	}	
	
	/**
	 * 根据提供的areaId查询地区信息
	 * @param areaId
	 * @return 
	 */
	public static Map<String, Object> getAreaInfo(String areaId){
		Map<String, Object> dataBusMap = new HashMap<String, Object>();
		dataBusMap.put("queryType", "queryAreaInfo");
		dataBusMap.put("areaId", areaId);
		DataBus db = ServiceClient.callService(dataBusMap, PortalServiceCode.QUERY_AREA_INFO, null, null);
		Map<String, Object> areaInfo = new HashMap<String, Object>();
		try{
			if(ResultCode.R_SUCCESS.equals(db.getResultCode())){
				areaInfo = db.getReturnlmap();
			}
		}catch(Exception e ){
			e.printStackTrace();
		}
		return areaInfo;
	}
	
	/**
	 * 判断是否是内外网
	 * true 内网
	 * false 外网 
	 */
	public static boolean isOINet(HttpServletRequest request){
		String ip = ServletUtils.getIpAddr(request);
		boolean fag=true;
		if (StringUtils.isNotEmpty(ip)) {
			if(ip.indexOf("i:o:")!=-1){
				fag=false;
			}else if(ip.startsWith("o:")){
				fag=false;
			}
		}
		return fag;
	}
	
	/**
	 * 根据省份编码获取省份地区编码
	 * @param provId
	 * @return
	 */
	public static String provIdToProvAreaId(String provId){
		int id=Integer.parseInt(provId);
		String areaId="0";
		switch (id) {
		case 600101:
			areaId="8440000";
			break;
		case 600102:
			areaId="8310000";
			break;
		case 600103:
			areaId="8320000";
			break;
		case 600104:
			areaId="8330000";
			break;
		case 600105:
			areaId="8350000";
			break;
		case 600201:
			areaId="8510000";
			break;
		case 600202:
			areaId="8420000";
			break;
		case 600203:
			areaId="8430000";
			break;
		case 600204:
			areaId="8610000";
			break;
		case 600205:
			areaId="8530000";
			break;
		case 600301:
			areaId="8340000";
			break;
		case 600302:
			areaId="8450000";
			break;
		case 600303:
			areaId="8650000";
			break;
		case 600304:
			areaId="8500000";
			break;
		case 600305:
			areaId="8360000";
			break;
		case 600401:
			areaId="8620000";
			break;
		case 600402:
			areaId="8520000";
			break;
		case 600403:
			areaId="8460000";
			break;
		case 600404:
			areaId="8640000";
			break;
		case 600405:
			areaId="8630000";
			break;
		case 600406:
			areaId="8540000";
			break;
		case 609001:
			areaId="8110000";
			break;
		case 609801:
			areaId="100000016";
			break;
		case 609902:
			areaId="8120000";
			break;
		case 609903:
			areaId="8370000";
			break;
		case 609904:
			areaId="8410000";
			break;
		case 609905:
			areaId="8210000";
			break;
		case 609906:
			areaId="8130000";
			break;
		case 609907:
			areaId="8140000";
			break;
		case 609908:
			areaId="8150000";
			break;
		case 609909:
			areaId="8220000";
			break;
		case 609910:
			areaId="8230000";
			break;

		default:
			areaId="0";
			break;
		}
		return areaId;
	} 
	
	/**
	 * 获取员工登录信息
	 * @param param
	 * @return
	 */
//	public static Map<String, Object> getStaffInfo(HttpServletRequest request){
//		SessionStaff sessionStaff = (SessionStaff) ServletUtils
//				.getSessionAttribute(request,
//						SysConstant.SESSION_KEY_LOGIN_STAFF);
//		Map<String, Object> result=new HashMap<String, Object>();
//		result.put("staffId", sessionStaff.getStaffId());
//		result.put("staffCode", sessionStaff.getStaffCode()); 
//		result.put("staffName", sessionStaff.getStaffName());
//		result.put("channelId", sessionStaff.getCurrentChannelId());
//		result.put("channelName", sessionStaff.getCurrentChannelName());
//		result.put("areaId", sessionStaff.getCurrentAreaId());
//		result.put("areaCode", sessionStaff.getCurrentAreaCode());
//		result.put("areaName", sessionStaff.getCurrentAreaName());
//		result.put("areaAllName", sessionStaff.getCurrentAreaAllName());
//		result.put("orgId", sessionStaff.getOrgId());
//		result.put("distributorId", "");
//		result.put("operatorsId", "");
//		result.put("operatorsName", "");
//		result.put("operatorsNbr", "");
//		result.put("soAreaId", sessionStaff.getCurrentAreaId());
//		result.put("soAreaCode", sessionStaff.getCurrentAreaCode());
//		result.put("soAreaName", sessionStaff.getCurrentAreaName());
//		result.put("soAreaAllName", sessionStaff.getCurrentAreaAllName());
//		/**----测试数据----**/
//		result.put("staffId", "2340030");//员工id
//		result.put("channelId", "1610587"); //受理渠道id
//		result.put("channelName", "济南历下区华强天翼终端旗舰体验厅");
//		result.put("areaId", "8370102");//受理地区id
//		result.put("areaCode", "0531");
//		result.put("soAreaId", "8370102");//新装受理地区id
//		result.put("soAreaCode", "0531");
//		result.put("distributorId", "");//转售商标识
//		return result;
//	}
//	
//	/**
//	 * 获取客户信息
//	 * @param param
//	 * @return
//	 */
//	public static Map<String, Object> getCustInfo(HttpServletRequest request){
//		Map<String, Object> result=new HashMap<String, Object>();
//		if(ServletUtils.getSessionAttribute(request,SysConstant.SESSION_KEY_CUST_INFO)!=null){
//			List<Map<String, Object>> custInfos = (List<Map<String, Object>>) ServletUtils.getSessionAttribute(request,SysConstant.SESSION_KEY_CUST_INFO);
//			if (custInfos.size() > 0) {
//				Map<String, Object> custInfoMap = custInfos.get(0);
//				result.put("addressStr",MapUtils.getString(custInfoMap, "addressStr"));
//				result.put("areaId",MapUtils.getString(custInfoMap, "areaId"));
//				result.put("areaName",MapUtils.getString(custInfoMap, "areaName"));
//				result.put("custFlag",MapUtils.getString(custInfoMap, "custFlag"));
//				result.put("custId",MapUtils.getString(custInfoMap, "custId"));
//				result.put("idCardNumber",MapUtils.getString(custInfoMap, "idCardNumber"));
//				result.put("identityCd",MapUtils.getString(custInfoMap, "identityCd"));
//				result.put("identityName",MapUtils.getString(custInfoMap, "identityName"));
//				result.put("norTaxPayer",MapUtils.getString(custInfoMap, "norTaxPayer"));
//				result.put("partyName",MapUtils.getString(custInfoMap, "partyName"));
//				result.put("segmentId",MapUtils.getString(custInfoMap, "segmentId"));
//				result.put("segmentName",MapUtils.getString(custInfoMap, "segmentName"));
//				result.put("vipLevel",MapUtils.getString(custInfoMap, "vipLevel"));
//				result.put("vipLevelName",MapUtils.getString(custInfoMap, "vipLevelName"));
//			}
//		}
//		/**----测试数据----**/
//		result.put("addressStr", "1241345235245245");
//		result.put("areaId", "8370100");
//		result.put("areaName", "济南市");
//		result.put("custFlag", "1100");
//		result.put("custId", "250000512687");
//		result.put("idCardNumber", "76587698768");
//		result.put("identityCd", "2");
//		result.put("identityName", "军官证");
//		result.put("norTaxPayer", "");
//		result.put("partyName", "234324523452435");
//		result.put("segmentId", "");
//		result.put("segmentName", "");
//		result.put("vipLevel", "1300");
//		result.put("vipLevelName", "普通");
//		return result;
//	}
//	
//	/**
//	 * 获取选中的产品信息
//	 * @param param
//	 * @return
//	 */
//	public static Map<String, Object> getChooseProdInfo(Map<String, Object> param){
//		Map<String, Object> result=new HashMap<String, Object>();
//		
//		result.put("accNbr", param.get("accNbr"));
//		result.put("areaCode", param.get("zoneNumber"));
//		result.put("areaId", param.get("areaId"));
//		result.put("corProdInstId", param.get("corProdInstId"));
//		result.put("custId", param.get("custId"));
//		result.put("custName", param.get("custName"));
//		result.put("endDt", param.get("endDt"));
//		result.put("extProdInstId", param.get("extProdInstId"));
//		result.put("feeType", param.get("feeType"));
//		result.put("feeTypeName", param.get("feeTypeName"));
//		result.put("is3G", param.get("is3G"));
//		result.put("prodClass", param.get("prodClass"));
//		result.put("prodInstId", param.get("prodInstId"));
//		result.put("prodOfferId", param.get("prodOfferId"));
//		result.put("prodOfferInstId", param.get("prodOfferInstId"));
//		result.put("prodOfferName", param.get("prodOfferName"));
//		result.put("prodStateCd", param.get("prodStateCd"));
//		result.put("prodStateName", param.get("prodStateName"));
//		result.put("productId", param.get("productId"));
//		result.put("productName", param.get("productName"));
//		result.put("startDt", param.get("startDt"));
//		result.put("stopRecordCd", param.get("stopRecordCd"));
//		result.put("stopRecordName", param.get("stopRecordName"));
//		
//		/**-----以下是测试数据-----**/
//		result.put("accNbr", "18954188631");
//		result.put("areaCode", "0531");
//		result.put("areaId", "8370100");
//		result.put("corProdInstId", "991700250020736149");
//		result.put("custId", "250000512687");
//		result.put("custName", "29991231235959");
//		result.put("endDt", "2999-12-31 23:59:59");
//		result.put("extProdInstId", "314025113944");
//		result.put("feeType", "1200");
//		result.put("feeTypeName", "后付费");
//		result.put("is3G", "N");
//		result.put("prodClass", "3");
//		result.put("prodInstId", "250020736149");
//		result.put("prodOfferId", "134012413");
//		result.put("prodOfferInstId", "250004671455");
//		result.put("prodOfferName", "乐享4G 套餐上网版189 元(IT穿越测试)");
//		result.put("prodStateCd", "100000");
//		result.put("prodStateName", "在用");
//		result.put("productId", "235010000");
//		result.put("productName", "移动电话（仅含本地语音）");
//		result.put("startDt", "2014-04-22 00:00:00");
//		result.put("stopRecordCd", "");
//		result.put("stopRecordName", "");
//		return result;
//	}
	
	/**
	 * 获取客户级规则校验入参
	 * @param prodIdInfos 选中产品信息
	 * @param custInfos 定位客户的信息
	 * @param staffInfos 员工登录的信息
	 * @param request 请求
	 * @return
	 */
	public static Map<String, Object> getParams(String prodIdInfos,String custInfos,String staffInfos,HttpServletRequest request){
		Map<String, Object> retsult=new HashMap<String, Object>();
		Map<String, Object> prodIdInfoMap=new HashMap<String, Object>();
		Map<String, Object> custInfoMap=new HashMap<String, Object>();
		Map<String, Object> staffInfoMap=new HashMap<String, Object>();
//		String app_flag=request.getSession().getAttribute(SysConstant.SESSION_KEY_APP_FLAG)!=null?(String)request.getSession().getAttribute(SysConstant.SESSION_KEY_APP_FLAG):"0";
		//先判断从客户端传过来的值是否为空，如果为空 客户信息和员工信息就从session里面获取，产品信息用模拟数据，便于开发
		if(!"null".equals(prodIdInfos))
			prodIdInfoMap =JsonUtil.toObject(prodIdInfos, Map.class);
		
		if(!"null".equals(custInfos))
			custInfoMap =JsonUtil.toObject(custInfos, Map.class);
		
		if(!"null".equals(staffInfos))
			staffInfoMap =JsonUtil.toObject(staffInfos, Map.class);
		
		retsult.put("prodIdInfoMap", prodIdInfoMap);
		retsult.put("custInfoMap", custInfoMap);
		retsult.put("staffInfoMap", staffInfoMap);
//		retsult.put("soNbr", UUID.randomUUID());
		retsult.put("soNbr", CommonMethods.getUUID());
		return retsult;
	}
	
	public static String getUUID(){
		Date date=new Date();
		String str = "";
		int n=3,Min=1,Max=10;
		for (int i = 0; i < n; i++) {
			int Range = Max - Min;   
			double Rand = Math.random();
			str += (Min + Math.round(Rand * Range));
		}
		String UUID=date.getTime()+str;
		
		return UUID;
	}
	
	/**
	 * 获取撤单权限,判断员工是否为管理员、管理班长、无权限
	 * @param request 请求
	 * @param sessionStaff
	 * @return permissionsType 权限类型-personal、admin、monitor
	 */
	public static String checkStaffOperatSpec(StaffBmo staffBmo,HttpServletRequest request,SessionStaff sessionStaff){
		//查询管理员权限
    	String isAdmin= (String)ServletUtils.getSessionAttribute(request,
			SysConstant.GLY+"_"+sessionStaff.getStaffId());
		try{
			if(isAdmin==null){
				isAdmin=staffBmo.checkOperatSpec(SysConstant.GLY,sessionStaff);
				ServletUtils.setSessionAttribute(request,SysConstant.GLY+"_"+sessionStaff.getStaffId(), isAdmin);
			}
		} catch (BusinessException e) {
			isAdmin=SysConstant.QX_NO;
		} catch (InterfaceException ie) {
			isAdmin=SysConstant.QX_NO;
		} catch (Exception e) {
			isAdmin=SysConstant.QX_NO;
		}
		//查询营业班长权限
		String isMonitor= (String)ServletUtils.getSessionAttribute(request,
				SysConstant.YYBZ+"_"+sessionStaff.getStaffId());
		try{
			if(isMonitor==null){
			isMonitor=staffBmo.checkOperatSpec(SysConstant.YYBZ,sessionStaff);
			ServletUtils.setSessionAttribute(request,SysConstant.YYBZ+"_"+sessionStaff.getStaffId(), isMonitor);
		    }
		} catch (BusinessException e) {
			isMonitor=SysConstant.QX_NO;
		} catch (InterfaceException ie) {
			isMonitor=SysConstant.QX_NO;
		} catch (Exception e) {
			isMonitor=SysConstant.QX_NO;
		}
		String permissionsType = "personal";
        if(isAdmin==SysConstant.QX_YES){
        	permissionsType = "admin";
        }else if(isMonitor == SysConstant.QX_YES){
        	permissionsType = "monitor";
        }
        return permissionsType;
	}
	
	/**
	 * 获取工单查询权限,判断员工是否为管理员、管理班长、无权限
	 * @param request 请求
	 * @param sessionStaff
	 * @return permissionsType 权限类型-personal、admin、monitor
	 */
	public static String checkPreLinkOperatSpec(StaffBmo staffBmo,HttpServletRequest request,SessionStaff sessionStaff){
		//查询管理员权限
    	String isAdmin= (String)ServletUtils.getSessionAttribute(request,
			SysConstant.GDCX_GLY+"_"+sessionStaff.getStaffId());
		try{
			if(isAdmin==null){
				isAdmin=staffBmo.checkOperatSpec(SysConstant.GDCX_GLY,sessionStaff);
				ServletUtils.setSessionAttribute(request,SysConstant.GDCX_GLY+"_"+sessionStaff.getStaffId(), isAdmin);
			}
		} catch (BusinessException e) {
			isAdmin=SysConstant.QX_NO;
		} catch (InterfaceException ie) {
			isAdmin=SysConstant.QX_NO;
		} catch (Exception e) {
			isAdmin=SysConstant.QX_NO;
		}
		//查询营业班长权限
		String isMonitor= (String)ServletUtils.getSessionAttribute(request,
				SysConstant.GDCX_YYBZ+"_"+sessionStaff.getStaffId());
		try{
			if(isMonitor==null){
			isMonitor=staffBmo.checkOperatSpec(SysConstant.GDCX_YYBZ,sessionStaff);
			ServletUtils.setSessionAttribute(request,SysConstant.GDCX_YYBZ+"_"+sessionStaff.getStaffId(), isMonitor);
		    }
		} catch (BusinessException e) {
			isMonitor=SysConstant.QX_NO;
		} catch (InterfaceException ie) {
			isMonitor=SysConstant.QX_NO;
		} catch (Exception e) {
			isMonitor=SysConstant.QX_NO;
		}
		String permissionsType = "personal";
        if(isAdmin==SysConstant.QX_YES){
        	permissionsType = "admin";
        }else if(isMonitor == SysConstant.QX_YES){
        	permissionsType = "monitor";
        }
        return permissionsType;
	}
	
	/**
	 * 获取“批量受理查询”权限,判断员工是否为管理员、管理班长、无权限
	 * @param request 请求
	 * @param sessionStaff
	 * @return permissionsType 权限类型-personal、admin、monitor
	 * @author ZhangYu 2015-10-19
	 */
	public static String checkBatchQryOperatSpec(StaffBmo staffBmo,HttpServletRequest request,SessionStaff sessionStaff){
		//查询管理员权限
    	String isAdmin = (String)ServletUtils.getSessionAttribute(request, SysConstant.BATCHORDER_GLY+"_" + sessionStaff.getStaffId());
		try{
			if(isAdmin == null){
				isAdmin = staffBmo.checkOperatSpec(SysConstant.BATCHORDER_GLY, sessionStaff);
				ServletUtils.setSessionAttribute(request, SysConstant.BATCHORDER_GLY + "_" + sessionStaff.getStaffId(), isAdmin);
			}
		} catch (BusinessException e) {
			isAdmin=SysConstant.QX_NO;
		} catch (InterfaceException ie) {
			isAdmin=SysConstant.QX_NO;
		} catch (Exception e) {
			isAdmin=SysConstant.QX_NO;
		}
		//查询营业班长权限
		String isMonitor= (String)ServletUtils.getSessionAttribute(request,
				SysConstant.BATCHORDER_YYBZ+"_"+sessionStaff.getStaffId());
		try{
			if(isMonitor==null){
			isMonitor=staffBmo.checkOperatSpec(SysConstant.BATCHORDER_YYBZ,sessionStaff);
			ServletUtils.setSessionAttribute(request,SysConstant.BATCHORDER_YYBZ+"_"+sessionStaff.getStaffId(), isMonitor);
		    }
		} catch (BusinessException e) {
			isMonitor=SysConstant.QX_NO;
		} catch (InterfaceException ie) {
			isMonitor=SysConstant.QX_NO;
		} catch (Exception e) {
			isMonitor=SysConstant.QX_NO;
		}
		String permissionsType = "personal";
        if(isAdmin==SysConstant.QX_YES){
        	permissionsType = "admin";
        }else if(isMonitor == SysConstant.QX_YES){
        	permissionsType = "monitor";
        }
        return permissionsType;
	}
	/**
	 *  判断该地区对应的开关是否是 flag(开还是关)
	 * @param swith  开关MAP
	 * @param areaId  地区
	 * @param length  开关中地区的位数
	 * @return
	 */
	public static boolean areaIdMacthSwitch(Map<String,String> swith,String areaId,int length,String flag){
		return StringUtil.isEmpty(areaId)?
        		false:areaId.substring(0, length).length()!=length?
        				false:swith.get(areaId.substring(0, length))==null?
        						false:swith.get(areaId.substring(0, length)).equals(flag);
		
	}
	
	/**
	 * #896069对于省级工号只配置了一个省级渠道的情况，将页面登录地区加载到受理地区(三级地区)；<br/>
	 * 若页面登录地区为直辖市，则将其地区ID降级为三级地区ID，再加载到受理地区；<br/>
	 * 若单点登录，无法像页面获取登录地区信息，则只要是省级地区，全部降级到省会地级市的地区ID
	 */
	public static void setloginArea2BusinessArea(SessionStaff sessionStaff, Map<String, Object> mapSession, boolean singleSignFlag) {
		if("ON".equals(MDA.AREA_CTRL_FLAG)){
			String currentAreaId = sessionStaff.getCurrentAreaId();
			if(mapSession != null && !singleSignFlag){//页面登录
				if(currentAreaId != null && currentAreaId.matches(Const.AREA_ID_REGEX_Z)){//省级地区(直辖市)
					//封装转义的地区ID和地区名称，用以加载到首页受理地区
					String[] areaInfo = (String[]) Const.loginArea2BusinessArea.get(currentAreaId);
					sessionStaff.setCurrentAreaId(areaInfo[0].toString());
					sessionStaff.setCurrentAreaAllName(areaInfo[1].toString());
				} else if(currentAreaId != null && currentAreaId.matches(Const.AREA_ID_REGEX_C)){//省级地区(非直辖市)
					//封装登录地区ID和地区名称，用以加载到首页受理地区
					sessionStaff.setCurrentAreaId(mapSession.get("staffProvCode").toString());
					sessionStaff.setCurrentAreaAllName(mapSession.get("loginAreaName").toString());
				} else{
					log.debug("页面登录currentAreaId非省级地区ID，默认地区ID无需降级，sessionStaff:={}, mapSession:={}", 
							JSONObject.fromObject(sessionStaff).toString(), JSONObject.fromObject(mapSession).toString());
				}
			} else if(singleSignFlag){//单点登录
				if(currentAreaId != null && currentAreaId.matches(Const.AREA_ID_REGEX_A)){//省级地区(全国32省)
					//封装转义的地区ID和地区名称，用以加载到首页受理地区
					String[] areaInfo = (String[]) Const.loginArea2BusinessArea.get(currentAreaId);
					sessionStaff.setCurrentAreaId(areaInfo[0].toString());
					sessionStaff.setCurrentAreaAllName(areaInfo[1].toString());
				} else{
					log.debug("单点登录currentAreaId非省级地区ID，默认地区ID无需降级，sessionStaff: ={}", JSONObject.fromObject(sessionStaff).toString());
				}
			} else{
				log.debug("非页面登录、单点登录，sessionStaff:={}, mapSession:={}", 
							JSONObject.fromObject(sessionStaff).toString(), JSONObject.fromObject(mapSession).toString());
			}
		}
	}
	
	/**
	 * 初始化员工权限集合，该方法将查询当前登录工号的所有权限
	 * @param sessionStaff
	 * @throws Exception 
	 * @throws BusinessException 
	 * @throws IOException 
	 * @throws InterfaceException 
	 */
	public void initStaffAllPrivileges(StaffBmo staffBmo, SessionStaff sessionStaff) throws InterfaceException, IOException, BusinessException, Exception{
		if(sessionStaff != null && staffBmo != null){
			ArrayList<String> privileges = sessionStaff.getPrivileges();
			if(privileges == null || privileges.isEmpty()){
				staffBmo.qryStaffAllPrivileges(sessionStaff);
			}
		}
	}
}
