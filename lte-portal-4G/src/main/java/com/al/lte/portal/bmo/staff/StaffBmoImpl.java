package com.al.lte.portal.bmo.staff;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.LineNumberReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.DateUtil;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.MapUtil;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.ServiceClient;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.core.DataEngine;
import com.al.lte.portal.core.DataRepository;
import com.al.lte.portal.model.SessionStaff;

/**
 * 员工操作 <BR>
 * 登录,修改工员信息,新增操作等等
 * <P>
 * 
 * @author lianld
 * @version V1.0 2012-4-17
 * @createDate 2012-4-17 下午13:53:52
 * @modifyDate lianld 2012-4-17 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
@Service("com.al.lte.portal.bmo.staff.StaffBmo")
public class StaffBmoImpl implements StaffBmo {

	private final Log log = Log.getLog(getClass());

	// @Autowired
	// @Qualifier("ehCacheManager")
	// EhCacheCacheManager ehCacheManager;

	public Map<String, Object> sendMsgInfo(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		Map<String, Object> returnMap = new HashMap<String, Object>();
		DataBus db = ServiceClient.callService(dataBusMap,
				PortalServiceCode.SERVICE_SEND_SMS, optFlowNum,
				sessionStaff);
		
		if (ResultCode.R_SUCCESS.equals(db.getResultCode())) {
			returnMap = db.getReturnlmap();
			String code = MapUtils.getString(returnMap, "code", "");
			String message = MapUtils.getString(returnMap, "message", "短信发送异常！");
			if (ResultCode.R_SUCCESS.equals(code)) {
				returnMap.put("resultCode", "0");
			} else {
				returnMap.put("resultCode", "1");
				returnMap.put("resultMsg", message);
			}
		} else {
			if(StringUtils.isBlank(db.getResultMsg())){
				returnMap = db.getReturnlmap();
				if(returnMap != null){
					returnMap.put("resultMsg", MapUtils.getString(returnMap, "resultMsg", "短信发送发生未知异常！"));
				}
			} else{
				returnMap.put("resultMsg", "调用失败，" + db.getResultMsg());
			}
			returnMap.put("resultCode", "1");
		}
		return returnMap;
	}

	/**
	 * 密码修改
	 * 
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> updateStaffPwd(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.STAFF_PASSWORD, optFlowNum, sessionStaff);
		
		try{	
			Integer flag = Integer.parseInt((StringUtils.defaultString(db.getResultCode())));
			String Msg = StringUtils.defaultString(db.getResultMsg());
			Map<String, Object> returnMap = new HashMap<String, Object>();
			returnMap.put("code", flag);
			returnMap.put("message", Msg);
			return returnMap;
		}catch(Exception e){
			log.error("门户处理系统管理的updatePassword服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.UPDATE_STAFF_PWD, dataBusMap, db.getReturnlmap(), e);
		}					
	}

	/**
	 * 修改员工状体实现解锁上锁
	 * 
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> updateStaffStatus(
			Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		DataBus db = ServiceClient.callService(dataBusMap,
				PortalServiceCode.SERVICE_UPDATE_STAFF_STAUTS, optFlowNum,
				sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db.getResultCode()))) {
			Map<String, Object> resultMap = db.getReturnlmap();
			returnMap.putAll(resultMap);
			String code = MapUtils.getString(resultMap, "code", "1");
			if (ResultCode.R_SUCCESS.equals(code)) {
				returnMap.put("code", ResultConstant.SUCCESS.getCode());
			} else {
				returnMap.put("code",
						ResultConstant.DATA_NOT_VALID_FAILTURE.getCode());
			}
		} else {
			returnMap.put("code",
					ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			returnMap.put("msg", "员工修改状态接口调用失败");
		}
		return returnMap;
	}


	@SuppressWarnings("unchecked")
	public Map<String, Object> loginCheck(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> returnMap = new HashMap<String, Object>();

		String dbKeyWord = (String) dataBusMap.get(InterfaceClient.DATABUS_DBKEYWORD);
		Map<String, HashMap<String, String>> allCommonParam = DataRepository.getInstence().getAllCommonParam();
		String bootFlag = DataRepository.getInstence().getCommonParam(dbKeyWord, "bootFlag");//MapUtils.getString(allCommonParam, "bootFlag");
		if (bootFlag == null || "FALSE".equals(bootFlag)){
			DataEngine.resetCommonParam(dbKeyWord);
			//缓存为空或bootFlag为false
			allCommonParam = DataRepository.getInstence().getAllCommonParam();
			if (MapUtils.isEmpty(allCommonParam) || "FALSE".equals(DataRepository.getInstence().getCommonParam(dbKeyWord, "bootFlag"))) {
				throw new InterfaceException(InterfaceException.ErrType.ECSP, "MySimulateData/getInstance/getNeeded", "无法从服务层获取缓存", "areaId:"+dbKeyWord);
			}
		}
		
		DataBus db = InterfaceClient.callService(dataBusMap, 
				PortalServiceCode.INTF_STAFF_LOGIN, optFlowNum, sessionStaff);
		try {
			log.error("db====",db.getResultCode());
			log.error("db====",MapUtils.getString(db.getReturnlmap(), "resultMsg", "无错误信息"));
			String resultCode = StringUtils.defaultString(db.getResultCode(), "1");
			returnMap.put("resultCode", resultCode);
			returnMap.put("resultMsg", MapUtils.getString(db.getReturnlmap(), "resultMsg", "无错误信息"));			
			if (ResultCode.R_SUCC.equals(resultCode)) {
				returnMap.putAll(MapUtils.getMap(db.getReturnlmap(), "result", new HashMap<String, Object>()));
			} else {
				returnMap.put("staffId", MapUtils.getString(db.getReturnlmap(), "staffId", ""));
				returnMap.put("errorNum", MapUtils.getString(db.getReturnlmap(), "errorNum", "11"));
			}
			return returnMap;
		} catch (Exception e) {
			log.error("门户处理系统管理的staffLogin服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.STAFF_LOGIN, dataBusMap, db.getReturnlmap(), e);
		}
	}

	/**
	 * 查询本地所有角色
	 * 
	 * @param optFlowNum
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryRoles(String optFlowNum)
			throws Exception {
		Map<String, Object> dataBusMap = new HashMap<String, Object>();
		DataBus db = ServiceClient.callService(dataBusMap,
				PortalServiceCode.SERVICE_QUERY_LOCAL_ROLES, optFlowNum, null);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			Map<String, Object> resultMap = db.getReturnlmap();
			List<Map<String, Object>> returnList = new ArrayList<Map<String, Object>>();
			if (MapUtils.isNotEmpty(resultMap)) {
				returnList = (List<Map<String, Object>>) resultMap.get("roles");
			}
			returnMap.put("roles", returnList);
		}
		return returnMap;
	}

	/**
	 * 员工查询
	 * 
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryStaffList(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		// 返回值
		Map<String, Object> retnMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.QUERY_STAFF_LIST, optFlowNum, sessionStaff);
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
					.getResultCode()))) {
				Map<String, Object> returnMap = db.getReturnlmap();
				if (ResultCode.R_SUCC.equals(StringUtils
						.defaultString((String) returnMap.get("resultCode")))) {
					retnMap = returnMap;
				}
			}
			return retnMap;
		} catch (Exception e) {
			throw new BusinessException(ErrorCode.QUERY_STAFF_INFO,dataBusMap,db.getReturnlmap(), e);
		}
	}

	/**
	 * 工号查询详细
	 * 
	 * @param staffCode
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryStaffByCode(String staffCode,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		// 返回值
		Map<String, Object> retnMap = new HashMap<String, Object>();
		Map<String, Object> dataBusMap = new HashMap<String, Object>();
		dataBusMap.put("staffCode", staffCode);
		DataBus db = ServiceClient.callService(dataBusMap,
				PortalServiceCode.SERVICE_QUERY_STAFF_INFO, optFlowNum,
				sessionStaff);
		if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			Map<String, Object> returnMap = db.getReturnlmap();
			if (ResultCode.R_SUCCESS.equals(StringUtils
					.defaultString((String) returnMap.get("code")))) {
				retnMap = returnMap;
			}
		}
		return retnMap;
	}

	/**
	 * 工号新增
	 * 
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> addStaff(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		// 返回值
		dataBusMap.put("newPassword", "888888");
		dataBusMap.put("oprStaffId", sessionStaff.getStaffId());
		dataBusMap.put("oprStaffCode", sessionStaff.getStaffCode());
		Map<String, Object> retnMap = new HashMap<String, Object>();
		DataBus db = ServiceClient.callService(dataBusMap,
				PortalServiceCode.SERVICE_INSERT_STAFFINFO, optFlowNum,
				sessionStaff);
		if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			Map<String, Object> returnMap = db.getReturnlmap();
			if (ResultCode.R_SUCCESS.equals(StringUtils
					.defaultString((String) returnMap.get("code")))) {
				retnMap.put("code", "0");
				retnMap.put("message", MapUtils.getString(returnMap, "message"));
			} else {
				retnMap.put("code", "1");
				retnMap.put("message", MapUtils.getString(returnMap, "message"));
			}
		} else {
			retnMap.put("code", "2");
			retnMap.put("message", db.getResultMsg());
		}
		return retnMap;
	}

	/**
	 * 根据uri和工号查验权限
	 */
	public String checkAuthority(String uri, 
			SessionStaff sessionStaff) throws Exception {
		Map<String, Object> dataBusMap = new HashMap<String, Object>();
		dataBusMap.put("uri", uri);
		dataBusMap.put("staffId", sessionStaff.getStaffId());
		dataBusMap.put("areaId", sessionStaff.getCurrentAreaId());
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.CHECK_OPERATPERM, null, sessionStaff);
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			return "0";
		}
		return "-1";
	}

	/**
	 * 根据uri和工号查验权限
	 */
	public String checkOperatSpec(String operatSpecCd, 
			SessionStaff sessionStaff) throws Exception {
		Map<String, Object> dataBusMap = new HashMap<String, Object>();
		dataBusMap.put("opsManageCode", operatSpecCd);
		dataBusMap.put("staffId", sessionStaff.getStaffId());
		dataBusMap.put("areaId", sessionStaff.getCurrentAreaId());
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.CHECK_OPERATSPEC, null, sessionStaff);
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			return "0";
		}
		return "-1";
	}
	/**
	 * 审核单进度查询
	 * 
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryStaffCheckList(
			Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		// 如果精确查询时，时间条件可以不用。
		if (MapUtil.isBlankValue(dataBusMap, "staffCode")
				&& MapUtil.isBlankValue(dataBusMap, "status")
				&& MapUtil.isBlankValue(dataBusMap, "batchNo")
				&& MapUtil.isBlankValue(dataBusMap, "channelId")
				&& MapUtil.isBlankValue(dataBusMap, "areaId")
				&& MapUtil.isBlankValue(dataBusMap, "actionType")) {
			// 没设置时间，默认最近7天
			if (MapUtil.isBlankValue(dataBusMap, "beginTime")
					&& MapUtil.isBlankValue(dataBusMap, "endTime")) {
				dataBusMap.put("beginTime", DateUtil.nearDay("yyyyMMdd", -7));
				dataBusMap.put("endTime", DateUtil.nearDay("yyyyMMdd", 0));
			} else {
				String b = MapUtils.getString(dataBusMap, "beginTime", "");
				String e = MapUtils.getString(dataBusMap, "endTime", "");
				if ("".equals(b) && !"".equals(e)) {
					b = DateUtil.nearMonth(e, "yyyyMMdd", "yyyyMMdd", -3);
				} else if (!"".equals(b) && "".equals(e)) {
					e = DateUtil.nearMonth(b, "yyyyMMdd", "yyyyMMdd", 3);
				} else if (!"".equals(b) && !"".equals(e)) {
					int result = DateUtil.getDateMinusMonth(b, e,
							DateUtil.DATE_FORMATE_STRING_H);
					// 如果传入的开始日期 结束日期相差大于3个月，则把开始日期置为结束日期前三个月
					if (result >= 3) {
						b = DateUtil.nearMonth(e, "yyyyMMdd", "yyyyMMdd", -3);
					}

				}
				dataBusMap.put("beginTime", "".equals(b) ? b : b);
				dataBusMap.put("endTime", "".equals(e) ? e : e);
			}
		} else {
			String b = MapUtils.getString(dataBusMap, "beginTime", "");
			String e = MapUtils.getString(dataBusMap, "endTime", "");
			if ("".equals(b) && !"".equals(e)) {
				b = DateUtil.nearMonth(e, "yyyyMMdd", "yyyyMMdd", -3);
			} else if (!"".equals(b) && "".equals(e)) {
				e = DateUtil.nearMonth(b, "yyyyMMdd", "yyyyMMdd", 3);
			} else if (!"".equals(b) && !"".equals(e)) {
				int result = DateUtil.getDateMinusMonth(b, e,
						DateUtil.DATE_FORMATE_STRING_H);
				// 如果传入的开始日期 结束日期相差大于3个月，则把开始日期置为结束日期前三个月
				if (result >= 3) {
					b = DateUtil.nearMonth(e, "yyyyMMdd", "yyyyMMdd", -3);
				}

			}
			dataBusMap.put("beginTime", "".equals(b) ? b : b);
			dataBusMap.put("endTime", "".equals(e) ? e : e);
		}
		// 返回值
		Map<String, Object> retnMap = new HashMap<String, Object>();
		DataBus db = ServiceClient.callService(dataBusMap,
				PortalServiceCode.SERVICE_QUERY_STAFF_CHECK_INFO, optFlowNum,
				sessionStaff);
		if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			Map<String, Object> returnMap = db.getReturnlmap();
			if (ResultCode.R_SUCCESS.equals(StringUtils
					.defaultString((String) returnMap.get("code")))) {
				retnMap = returnMap;
			}
		}
		return retnMap;
	}

	public String queryBatchNo(SessionStaff sessionStaff, String flowNum)
			throws Exception {
		// TODO Auto-generated method stub
		// 返回值
		String batchNo = "";
		Map<String, Object> dataBusMap = new HashMap<String, Object>();
		DataBus db = ServiceClient
				.callService(dataBusMap,
						PortalServiceCode.SERVICE_QUERY_BATCH_NO, flowNum,
						sessionStaff);
		if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			Map<String, Object> returnMap = db.getReturnlmap();
			if (ResultCode.R_SUCCESS.equals(StringUtils
					.defaultString((String) returnMap.get("code")))) {
				batchNo = MapUtil.asStr(returnMap, "batchNo");
			}
		}
		return batchNo;
	}

	public Map<String, Object> checkStaff(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		// TODO Auto-generated method stub
		Map<String, Object> retnMap = new HashMap<String, Object>();
		DataBus db = ServiceClient
				.callService(dataBusMap, PortalServiceCode.SERVICE_CHECK_STAFF,
						optFlowNum, sessionStaff);
		if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			Map<String, Object> returnMap = db.getReturnlmap();
			if (ResultCode.R_SUCCESS.equals(StringUtils
					.defaultString((String) returnMap.get("code")))) {
				retnMap.put("code", "0");
				retnMap.put("message", MapUtils.getString(returnMap, "message"));
			} else {
				retnMap.put("code", "1");
				retnMap.put("message", MapUtils.getString(returnMap, "message"));
			}
		} else {
			retnMap.put("code", "2");
			retnMap.put("message", db.getResultMsg());
		}
		return retnMap;
	}

	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> queryAuthRange(
			Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		// dataBusMap.put("staffId", "903004367913");
		DataBus db = ServiceClient.callService(dataBusMap,
				PortalServiceCode.SERVICE_QUERY_AUTH_RANGE, optFlowNum,
				sessionStaff);
		if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			Map<String, Object> resultMap = db.getReturnlmap();
			if (MapUtils.isNotEmpty(resultMap)) {
				list = (List<Map<String, Object>>) resultMap.get("rangeList");
			}
		}
		return list;
	}

	/**
	 * 向AgentPorttalConfig表中新增数据
	 * 
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> insertAgentPorttalConfig(
			Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		// 返回值
		Map<String, Object> retnMap = new HashMap<String, Object>();
		DataBus db = ServiceClient.callService(dataBusMap,
				PortalServiceCode.SERVICE_INSERT_AGENT_PORTAL_CONFIG,
				optFlowNum, sessionStaff);
		if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			Map<String, Object> returnMap = db.getReturnlmap();
			if (ResultCode.R_SUCCESS.equals(StringUtils
					.defaultString((String) returnMap.get("code")))) {
				retnMap.put("code", "0");
				retnMap.put("message", MapUtils.getString(returnMap, "message"));
			} else {
				retnMap.put("code", "1");
				retnMap.put("message", MapUtils.getString(returnMap, "message"));
			}
		} else {
			retnMap.put("code", "2");
			retnMap.put("message", db.getResultMsg());
		}
		return retnMap;
	}

	public Map<String, Object> queryCTGMainData(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.QUERY_CTGMAINDATA, optFlowNum, sessionStaff);
		try {
			Map<String, Object> returnMap = new HashMap<String, Object>();
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
					.getResultCode()))) {
				Map<String, Object> resultMap = db.getReturnlmap();
				List<Map<String, Object>> returnList = new ArrayList<Map<String, Object>>();
				if (MapUtils.isNotEmpty(resultMap)) {
					returnList = (List<Map<String, Object>>) resultMap.get("result");
				}
				returnMap.put("code", ResultCode.R_SUCCESS);
				returnMap.put("result", returnList);
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", db.getResultMsg());
			}
			return returnMap;
		} catch (Exception e) {
			throw new BusinessException(ErrorCode.ORDER_CTGMAINDATA,dataBusMap,db.getReturnlmap(), e);
		}
		
	}

	public List<Map<String, Object>> areaTreeAllQuery(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		String areaLimit = dataBusMap.get("areaLimit")==null?"":dataBusMap.get("areaLimit").toString();
		String areaLevel = dataBusMap.get("areaLevel")==null?"":dataBusMap.get("areaLevel").toString();
		String ifQueryChilden = dataBusMap.get("ifQueryChilden")==null?"":dataBusMap.get("ifQueryChilden").toString();
		List<Map<String, Object>> listTree = new ArrayList<Map<String, Object>>();
		dataBusMap.remove("areaLimit");
		DataBus db = ServiceClient.callService(dataBusMap, PortalServiceCode.SERVICE_QUERY_AREA_TREE_BY_PARENT_AREA_ID,optFlowNum, sessionStaff);
		try{
			if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> returnMap = db.getReturnlmap();
				if(ResultCode.R_SUCCESS.equals(returnMap.get("code"))){
					Object mapObj = returnMap.get("result");
					
					Integer leve = 0 ;
					try{
						leve = Integer.parseInt(areaLevel);
					}catch(Exception e){
						log.error("区划层级数有问题");
						//e.printStackTrace();
					}
					
					if(mapObj!=null && mapObj instanceof Map){
						Map result = (Map)mapObj;
						if(result.get("areaTree")!=null){
							Object treeObj = result.get("areaTree");
							if(treeObj!=null&&treeObj instanceof List){
								List<Map> listTemp = (List<Map>)treeObj;
								String upRegionId = dataBusMap.get("upRegionId")==null?"0":dataBusMap.get("upRegionId").toString() ; 
								String parentId = (upRegionId.equals("null")||upRegionId.equals("")?"0":upRegionId) ;
								for(Map row:listTemp){
									row.put("parentId", parentId);
									
									if(leve<3&&areaLimit!=null&&areaLimit.contains("limitProvince")){
										row.put("isAllRegionFlag", "N");
										row.put("regionName", row.get("regionName")+"*");
									}else{
										row.put("isAllRegionFlag", "Y");
									}
									// 工号是本地网或者区县：只能选择到归属本地网
									String areaRow = row.get("commonRegionId").toString().substring(0, 5);
									String staffArea = sessionStaff.getAreaId().substring(0, 5);
									if ("Y".equals(ifQueryChilden) && areaLimit != null && areaLimit.contains("limitStaffLocal") && !areaRow.equals(staffArea)) {
										continue;
									}
									
									row.put("areaLevel", leve);
									
									listTree.add(row);
								}
								//listTree = (List)treeObj;
							}
						}
					}
				}
			}
			return listTree ;
		}catch(Exception e){
			throw new BusinessException(ErrorCode.AREA_ALL,dataBusMap,db.getReturnlmap(), e);
		}
	}

	public Map queryStaffByStaffCode4Login(String staffCode,
			String commonRegionId) throws Exception {
		Map params=new HashMap();
		params.put("staffCode", staffCode);
		params.put("commonRegionId", commonRegionId);
		params.put("areaId", commonRegionId);
		SessionStaff aSessionStaff=new SessionStaff ();
		aSessionStaff.setStaffCode(staffCode);
		aSessionStaff.setAreaId(commonRegionId);
		aSessionStaff.setAreaCode(commonRegionId);
		DataBus db = InterfaceClient.callService(params, PortalServiceCode.QUERY_STAFF_BY_STAFFCODE, null, aSessionStaff);
		try {
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				Map<String,Object> map=(Map<String,Object>)db.getReturnlmap().get("result");
				return map;
			}else{
				Map<String, Object> resMap =db.getReturnlmap();
				Map returnMap=new HashMap();
				returnMap.put("resultCode", ResultCode.R_FAILURE);
				returnMap.put("resultMsg",  MapUtils.getString(resMap, "resultMsg"));
				returnMap.put("errCode",  MapUtils.getString(resMap, "errCode"));
				returnMap.put("errorStack",  MapUtils.getString(resMap, "errorStack"));
				return returnMap;
			}
		} catch (Exception e) {
			log.error("门户处理系统管理的staffLogin服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.ORDER_CTGMAINDATA,params,db.getReturnlmap(), e);
		}

	}
	public Map queryStaffByStaffCode4Login(String staffCode,
			String commonRegionId,String sessionId) throws Exception {
		Map params=new HashMap();
		params.put("sessionId", sessionId);
		params.put("staffCode", staffCode);
		params.put("commonRegionId", commonRegionId);
		params.put("areaId", commonRegionId);
		SessionStaff aSessionStaff=new SessionStaff ();
		aSessionStaff.setStaffCode(staffCode);
		aSessionStaff.setAreaId(commonRegionId);
		aSessionStaff.setAreaCode(commonRegionId);
		DataBus db = InterfaceClient.callService(params, PortalServiceCode.QUERY_STAFF_BY_STAFFCODE, null, aSessionStaff);
		try {
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				Map<String,Object> map=(Map<String,Object>)db.getReturnlmap().get("result");
				return map;
			}else{
				Map<String, Object> resMap =db.getReturnlmap();
				Map returnMap=new HashMap();
				returnMap.put("resultCode", ResultCode.R_FAILURE);
				returnMap.put("resultMsg",  MapUtils.getString(resMap, "resultMsg"));
				returnMap.put("errCode",  MapUtils.getString(resMap, "errCode"));
				returnMap.put("errorStack",  MapUtils.getString(resMap, "errorStack"));
				return returnMap;
			}
		} catch (Exception e) {
			log.error("门户处理系统管理的staffLogin服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.ORDER_CTGMAINDATA,params,db.getReturnlmap(), e);
		}

	}
	
	
	public void loginInlog(Long time, String optFlowNum, SessionStaff sessionStaff,String padVersion){
		Map<String,Object> params=new HashMap<String,Object>();
		params.put("staffCode", sessionStaff.getStaffCode());
		params.put("commonRegionId", sessionStaff.getAreaId());
		params.put("areaId", sessionStaff.getAreaId());
		params.put("loginUsedTime", time);
		params.put("wanIp", sessionStaff.getIp());
		params.put("macAddr", sessionStaff.getMacStr());
		params.put("connectiontime", sessionStaff.getConnectiontime());
		params.put("sendtime", sessionStaff.getSendtime());
		params.put("waitingtime", sessionStaff.getWaitingtime());
		params.put("accepttime", sessionStaff.getAccepttime());
		if(padVersion!=null){
			if("1".equals(padVersion)){
				params.put("platformCode", SysConstant.SM_PADPLATFORM_CODE);
			}else if("3".equals(padVersion)){ //手机版本
				params.put("platformCode", SysConstant.SM_APPPLATFORM_CODE);
				params.put("phoneModel", sessionStaff.getPhoneModel());
				params.put("macAddr", sessionStaff.getMacAddr());
			}else{
				params.put("platformCode", SysConstant.SM_PADPLATFORM_ANDROID_CODE);
			}
		}else{
			params.put("platformCode", SysConstant.SM_PLATFORM_CODE);
		}
		params.put("mesKey",sessionStaff.getMesKey());
		params.put("token",sessionStaff.getToken());
		params.put("fingerprint",sessionStaff.getFingerprint());
		params.put("browserType",((ServletRequestAttributes)RequestContextHolder.getRequestAttributes()).getRequest().getHeader("User-Agent"));
		params.put("phoneNumber",sessionStaff.getBindNumber());
		try {
			InterfaceClient.callService(params, PortalServiceCode.STAFF_4_OTHER_SYS, optFlowNum,sessionStaff);
		} catch (Exception e) {
			log.error("登录日志记录异常", e);
		}
	}
	
	public void loginOutlog(String optFlowNum, SessionStaff sessionStaff){
		Map params=new HashMap();
		params.put("staffCode", sessionStaff.getStaffCode());
		params.put("commonRegionId", sessionStaff.getAreaId());
		params.put("wanIp", sessionStaff.getIp());
		params.put("platformCode", SysConstant.SM_PLATFORM_CODE);
		//params.put("distributorId", staffCode);
		try {
			DataBus db = InterfaceClient.callService(params, PortalServiceCode.STAFF_LOGIN_OUT, optFlowNum,sessionStaff);
		} catch (Exception e) {
			log.error("登录日志记录异常", e);
		}
	}

	
	public void userSearchbtn(String locateDate ,String optFlowNum, SessionStaff sessionStaff){
		Map<String,Object> params=new HashMap<String,Object>();
		params.put("staffId", sessionStaff.getStaffId());
		params.put("locateDate", locateDate);
		params.put("cardType", sessionStaff.getCardType());
		params.put("cardNumber", sessionStaff.getCardNumber());
		params.put("instanceCustId", sessionStaff.getCustId());
		params.put("inPhoneNum", sessionStaff.getInPhoneNum());
		params.put("areaId", sessionStaff.getAreaId());
		//params.put("distributorId", staffCode);
		try {
			InterfaceClient.callService(params, PortalServiceCode.LOCATE_CUSTINFO, optFlowNum,sessionStaff);
		} catch (Exception e) {
			log.error("客户定位日志记录异常", e);
		}
	}
	
	
	
	public String getMACAddress(String ip) {
		if(ip==null||ip.equals("")||ip.equals("null")){
			return "" ;
		}

		String str = "";

		String macAddress = "";

		try {

			Process p = Runtime.getRuntime().exec("nbtstat -A " + ip);

			InputStreamReader ir = new InputStreamReader(p.getInputStream());

			LineNumberReader input = new LineNumberReader(ir);

			for (int i = 1; i < 100; i++) {

				str = input.readLine();

				if (str != null) {

					if (str.indexOf("MAC Address") > 1) {

						macAddress = str.substring(str.indexOf("MAC Address") + 14, str.length());

						break;

					}

				}

			}

		} catch (IOException e) {
			log.debug("获取用户mac失败：");
			e.printStackTrace(System.out);
			return "" ;
		}

		return macAddress;

	}
	
	//记录表SP_BUSI_RUN_LOG
	public void insert_sp_busi_run_log(Map<String, Object> logmap,String flowNum,SessionStaff sessionStaff)throws Exception {
		String custlogflag = MySimulateData.getInstance().getParam(sessionStaff.getDbKeyWord(),"CUSTLOGFLAG_WRITE_ASYNCHRONOUS_FLAG");
		if(custlogflag.equals("ON")){
			InterfaceClient.callLogService(logmap, flowNum, sessionStaff);
		}else{
			ServiceClient.callService(logmap,PortalServiceCode.INSERT_SP_BUSI_RUN_LOG,flowNum,sessionStaff);			
		}
	}

	public String cacheClear(String url) {		
		HttpClient httpClient = new DefaultHttpClient();
		String response = "未知错误：可手动打开浏览器查看详细信息,"+url;
	    HttpGet method = new HttpGet(url);  
	    try {
	    	HttpParams params = httpClient.getParams();  
	        HttpConnectionParams.setConnectionTimeout(params, 3000);  
	        HttpConnectionParams.setSoTimeout(params, 3000); 
			HttpResponse httpResponse = httpClient.execute(method);
			HttpEntity entity = httpResponse.getEntity();
			if (entity != null) {
	            InputStream instream = entity.getContent();
	            try {
	                BufferedReader reader = new BufferedReader(new InputStreamReader(instream));   
	                StringBuilder sb = new StringBuilder();   	            
	                String line = null;   
	                try {   
	                    while ((line = reader.readLine()) != null) {   
	                        sb.append(line);   
	                    }   
	                } catch (IOException e) {   
	                    e.printStackTrace();   
	                } 
	                response = sb.toString(); 
					if(response.indexOf("404") != -1&&response.indexOf("<!DOCTYPE html SYSTEM><html>") != -1){
						response = "服务不存在！可手动打开浏览器刷新查看详细信息,"+url;
					}
	            } catch (Exception e) {
	            	e.printStackTrace();
	            } finally {
	                instream.close();
	            }
	        }
		} catch (ClientProtocolException e) {
			e.printStackTrace();
			response = "刷新失败，服务连接异常，异常信息："+e;
		} catch (IOException e) {
			response = "服务器端口异常，异常信息："+e;
			e.printStackTrace();
		}finally {
			httpClient.getConnectionManager().shutdown();
        }  
		return response;
	}


	public Map<String, Object> checkIsAccessByStaffId(Map<String, Object> dataBusMap,
			SessionStaff sessionStaff) throws Exception {
		// TODO Auto-generated method stub
		dataBusMap.put("staffId", sessionStaff.getStaffId());
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.CHECKISACCESSBYSTAFFID, null, sessionStaff);
		Map<String, Object> retnMap = new HashMap<String, Object>();
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			Map<String, Object> resultMap = db.getReturnlmap();
			retnMap.put("code", resultMap.get("resultCode"));
		} else {
			retnMap.put("code", ResultCode.R_FAIL);
			retnMap.put("msg", db.getResultMsg());
		}
		return retnMap;
	
	}

	public void lockUser(Map<String, Object> dataBusMap, String string,
			SessionStaff sessionStaff) throws Exception {
		// TODO Auto-generated method stub
		dataBusMap.put("staffId", sessionStaff.getStaffId());
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.LOCKUSER, null, sessionStaff);
	}
	
	/**
	 * 根据权限编码(opsManageCode)和员工ID(staffId)查询工号是否有权限
	 * 该方法使用同：
	 * {@link com.al.lte.portal.bmo.staff.StaffBmoImpl#checkOperatSpec(String operatSpecCd,SessionStaff sessionStaff)}
	 * 由于checkOperatSpec不便捕获异常并提示异常信息(入参回参等)，这里重新封装并抛出BusinessException
	 * @param operatSpecCd
	 * @param sessionStaff
	 * @return
	 * @throws Exception 
	 * @throws IOException 
	 * @throws InterfaceException 
	 */
	public String checkOperatBySpecCd(String operatSpecCd, SessionStaff sessionStaff) throws InterfaceException, IOException, Exception {
		Map<String, Object> dataBusMap = new HashMap<String, Object>();
		dataBusMap.put("opsManageCode", operatSpecCd);
		dataBusMap.put("staffId", sessionStaff.getStaffId());
		dataBusMap.put("areaId", sessionStaff.getAreaId());
		
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.CHECK_OPERATSPEC, null, sessionStaff);
		try {		
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {				
				return "0";
			}
		} catch (Exception e) {
			throw new BusinessException(ErrorCode.CHECKOPERATSPEC, dataBusMap, db.getReturnlmap(), e);
		}
		
		return "-1";
	}
	
	public String checkByAreaId(String areaId, SessionStaff sessionStaff)
			throws Exception {
		Map<String, Object> dataBusMap = new HashMap<String, Object>();
		dataBusMap.put("checkAreaId", areaId);
		dataBusMap.put("staffId", sessionStaff.getStaffId());
		dataBusMap.put("areaId", sessionStaff.getCurrentAreaId());
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.CHECK_BYAREAID, null, sessionStaff);
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			return "0";
		}
		return "-1";
	}
	
	/**
	 * 二维码扫描验证
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> qrLoginCheck(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> returnMap = new HashMap<String, Object>();

		String dbKeyWord = (String) dataBusMap.get(InterfaceClient.DATABUS_DBKEYWORD);
		Map<String, HashMap<String, String>> allCommonParam = DataRepository.getInstence().getAllCommonParam();
		String bootFlag = DataRepository.getInstence().getCommonParam(dbKeyWord, "bootFlag");//MapUtils.getString(allCommonParam, "bootFlag");
		if (bootFlag == null || "FALSE".equals(bootFlag)){
			DataEngine.resetCommonParam(dbKeyWord);
			//缓存为空或bootFlag为false
			allCommonParam = DataRepository.getInstence().getAllCommonParam();
			if (MapUtils.isEmpty(allCommonParam) || "FALSE".equals(DataRepository.getInstence().getCommonParam(dbKeyWord, "bootFlag"))) {
				throw new InterfaceException(InterfaceException.ErrType.ECSP, "MySimulateData/getInstance/getNeeded", "无法从服务层获取缓存", "areaId:"+dbKeyWord);
			}
		}
		
		DataBus db = InterfaceClient.callService(dataBusMap, 
				PortalServiceCode.QRCODE_VALIDATE, optFlowNum, sessionStaff);
		try {
			String resultCode = StringUtils.defaultString(db.getResultCode(), "1");
			returnMap.put("resultCode", resultCode);
			returnMap.put("resultMsg", MapUtils.getString(db.getReturnlmap(), "resultMsg", "无错误信息"));			
			if (ResultCode.R_SUCC.equals(resultCode)) {
				returnMap.putAll(MapUtils.getMap(db.getReturnlmap(), "result", new HashMap<String, Object>()));
			} else {
				returnMap.put("staffId", MapUtils.getString(db.getReturnlmap(), "staffId", ""));
				returnMap.put("errorNum", MapUtils.getString(db.getReturnlmap(), "errorNum", "11"));
			}
			return returnMap;
		} catch (Exception e) {
			log.error("门户处理系统管理的staffLogin服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.STAFF_LOGIN, dataBusMap, db.getReturnlmap(), e);
		}
	}

	public Map<String, Object> bindQrCode(Map<String, Object> paramMap,
			String string, SessionStaff sessionStaff) throws Exception {
		String code=paramMap.get("qrCodeId").toString();
		Map<String, Object> dataBusMap = new HashMap<String, Object>();
		dataBusMap.put("code", code);
		dataBusMap.put("staffId", sessionStaff.getStaffId());
		dataBusMap.put("areaId", sessionStaff.getAreaId());
		dataBusMap.put("channelId", sessionStaff.getCurrentChannelId());
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.BIND_QR_CODE_RECORDS, null, sessionStaff);
		return db.getReturnlmap();
	}
	
	/**
	 * 查询某权限下的员工列表
	 * @param operatSpecCd 权限编码 <br>若入参中不指定具体的权限编码，则默认根据SysConstant.RXSH权限进行查询
	 * @param sessionStaff
	 * @return 员工列表List
	 * @throws InterfaceException
	 * @throws IOException
	 * @throws BusinessException
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> qryOperateSpecStaffList(String operatSpecCd, SessionStaff sessionStaff) throws InterfaceException, IOException, BusinessException, Exception {
		Map<String, Object> params = new HashMap<String, Object>();
		Map<String, Object> returnMap = new HashMap<String, Object>();
		
		if(StringUtils.isBlank(operatSpecCd)){
			returnMap.put(SysConstant.RESULT_CODE, ResultCode.R_FAILURE);
			returnMap.put(SysConstant.RESULT_MSG, "无效的入参[operatSpecCd]");
			throw new BusinessException(ErrorCode.PORTAL_INPARAM_ERROR, params, returnMap, null);
		}
		
		String sessionKey = operatSpecCd + sessionStaff.getStaffId() + sessionStaff.getCurrentAreaId() + sessionStaff.getCurrentChannelId();
		
		List<Map<String, Object>> staffListFromSession = sessionStaff.getPhotographReviewStaffList(sessionKey);
		if(CollectionUtils.isNotEmpty(staffListFromSession)){
			returnMap.put(SysConstant.RESULT_CODE, ResultCode.R_SUCC);
			returnMap.put(SysConstant.RESULT, staffListFromSession);
			return returnMap;
		}
		
		params.put("opsCd", operatSpecCd);
		params.put("exceptStaffId", sessionStaff.getStaffId());//该员工信息将被过滤不返回
		params.put(SysConstant.STAFF_ID, sessionStaff.getStaffId());
		params.put(SysConstant.AREA_ID, sessionStaff.getCurrentAreaId());
		params.put(SysConstant.CHANNEL_ID, sessionStaff.getCurrentChannelId());
				
		DataBus db = InterfaceClient.callService(params, PortalServiceCode.QRY_OPERATESPEC_STAFF_LIST, null, sessionStaff);
		try {
			String resultCode = StringUtils.defaultString(db.getResultCode(), "1");
			if (ResultCode.R_SUCC.equals(resultCode)) {
				List<Map<String, Object>> staffList = (List<Map<String, Object>>) db.getReturnlmap().get("result");
				if(staffList == null){
					returnMap.put(SysConstant.RESULT_CODE, ResultCode.R_FAILURE);
					returnMap.put(SysConstant.RESULT_MSG, "系管operatSpecCd服务未返回非null的有效结果集：" + JsonUtil.toString(db.getReturnlmap()));
					log.error("系管operatSpecCd服务未返回非null的有效结果集={}", JsonUtil.toString(db.getReturnlmap()));
					throw new BusinessException(ErrorCode.QUERY_STAFF_INFO, params, returnMap, null);
				} else{
					returnMap.put(SysConstant.RESULT_CODE, ResultCode.R_SUCC);
					returnMap.put(SysConstant.RESULT, staffList);
					sessionStaff.setPhotographReviewStaffList(staffList, sessionKey);
				}
			} else {
				returnMap.put(SysConstant.RESULT_CODE, ResultCode.R_FAILURE);
				returnMap.put(SysConstant.RESULT_MSG, db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理系统管理的queryOperaStaff服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_STAFF_INFO, params, db.getReturnlmap(), e);
		}
		
		return returnMap;
	}
	
	public Map<String, Object> checkStaffMessage(
			Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		// TODO Auto-generated method stub
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.CHECKSTAFFMESSAGE, null, null);
		Map<String, Object> retnMap = new HashMap<String, Object>();
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			Map<String, Object> resultMap = db.getReturnlmap();
			return resultMap;
		} else {
			retnMap.put("resultCode", ResultCode.R_FAIL);
			retnMap.put("msg", db.getResultMsg());
		}
		return retnMap;
	}

	public Map<String, Object> updatePassword(Map<String, Object> param, String optFlowNum,
			SessionStaff sessionStaff)throws Exception {
		// TODO Auto-generated method stub
		DataBus db = InterfaceClient.callService(param, PortalServiceCode.UPDATTEPASSWORD, null, null);
		Map<String, Object> retnMap = new HashMap<String, Object>();
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			Map<String, Object> resultMap = db.getReturnlmap();
			retnMap.put("code", resultMap.get("resultCode"));
		} else {
			retnMap.put("code", ResultCode.R_FAIL);
			retnMap.put("msg", db.getResultMsg());
		}
		return retnMap;
	}
	
	/**
	 * 查询该员工拥有的权限集合
	 * @param sessionStaff
	 * @return
	 * @throws InterfaceException
	 * @throws IOException
	 * @throws BusinessException
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> qryStaffAllPrivileges(SessionStaff sessionStaff) throws InterfaceException, IOException, BusinessException, Exception {
		Map<String, Object> params = new HashMap<String, Object>();
		Map<String, Object> returnMap = new HashMap<String, Object>();
		ArrayList<String> privileges = new ArrayList<String>();
		
		params.put(SysConstant.STAFF_ID, sessionStaff.getStaffId());
		params.put(SysConstant.AREA_ID, sessionStaff.getCurrentAreaId());
		params.put(SysConstant.CHANNEL_ID, sessionStaff.getCurrentChannelId());
				
		DataBus db = InterfaceClient.callService(params, PortalServiceCode.QRY_STAFF_ALL_PRIVILEGES, null, sessionStaff);
		try {
			String resultCode = StringUtils.defaultString(db.getResultCode(), "1");
			if (ResultCode.R_SUCC.equals(resultCode)) {
				List<Map<String, Object>> resultList = (List<Map<String, Object>>) db.getReturnlmap().get("result");
				if(resultList == null || resultList.isEmpty()){
					returnMap.put(SysConstant.RESULT_CODE, ResultCode.R_FAILURE);
					returnMap.put(SysConstant.RESULT_MSG, "系管queryPrivilegeInfos服务未返回非null的有效结果集：" + JsonUtil.toString(db.getReturnlmap()));
					log.error("系管queryPrivilegeInfos服务未返回非null的有效结果集={}", JsonUtil.toString(db.getReturnlmap()));
					throw new BusinessException(ErrorCode.QUERY_STAFF_INFO, params, returnMap, null);
				} else{
					for(Map<String, Object> staffPrivilege : resultList){
						privileges.add(MapUtils.getString(staffPrivilege, "privilegeCode", ""));
					}
					sessionStaff.setPrivileges(privileges);
					returnMap.put(SysConstant.RESULT_CODE, ResultCode.R_SUCC);
					returnMap.put(SysConstant.RESULT, privileges);
				}
			} else {
				returnMap.put(SysConstant.RESULT_CODE, ResultCode.R_FAILURE);
				returnMap.put(SysConstant.RESULT_MSG, db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理系统管理的queryPrivilegeInfos服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_STAFF_INFO, params, db.getReturnlmap(), e);
		}
		
		log.debug("初始化员工权限集合结果={}", JsonUtil.toString(returnMap));
		
		return returnMap;
	}
}
