package com.al.lte.portal.bmo.crm;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;

import net.sf.json.JSON;
import net.sf.json.JSONException;
import net.sf.json.JSONObject;
import net.sf.json.xml.XMLSerializer;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.math.NumberUtils;
import org.springframework.stereotype.Service;

import sun.misc.BASE64Decoder;
import sun.misc.BASE64Encoder;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.EncodeUtils;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.MDA;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.Const;
import com.al.lte.portal.common.Des33;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.RunShellUtil;
import com.al.lte.portal.common.ServiceClient;
import com.al.lte.portal.model.Photograph;
import com.al.lte.portal.model.SessionStaff;


@Service("com.al.lte.portal.bmo.crm.CustBmo")
public class CustBmoImpl implements CustBmo {

	private Log log = Log.getLog(getClass());
	
	/*
	 * (non-Javadoc)
	 * @see com.al.lte.portal.bmo.crm.CustBmo#queryCustInfo(java.util.Map)
	 */
	@SuppressWarnings(value="all")
	public Map<String, Object> queryCustInfo(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.INTF_QUERY_CUST, optFlowNum, sessionStaff);
		Map returnMap = db.getReturnlmap();
		try {
			String code = (String) returnMap.get("resultCode");
			Map custInfoMap = null;
			if (ResultCode.R_SUCC.equals(code)) {
				custInfoMap = (HashMap) returnMap.get("result");
			}
			return custInfoMap;
		} catch (Exception e) {
			log.error("客户资料查询queryCust服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_CUST, dataBusMap, db.getReturnlmap(), e);
		}
	}

	/**
	 * 物联网查询客户信息-接入号
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryCustInfoByPhone4iot(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = ServiceClient.callService(dataBusMap,
				PortalServiceCode.IOT_SERVICE_QUERY_CUST_PROD, optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		try {
			if (ResultCode.R_SUCCESS.equals(db.getResultCode())) {
				returnMap = db.getReturnlmap();
			} else {
				returnMap.put("resultCode", db.getResultCode());
				returnMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("CSB异常的客户资料查询queryCust服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.IOT_PRODINFO, dataBusMap, db.getReturnlmap(), e);
		}
		return returnMap;
	}

	/**
	 * 物联网查询客户信息-终端串码
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryCustInfoByMktResCode4iot(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = ServiceClient.callService(dataBusMap,
				PortalServiceCode.IOT_SERVICE_QUERY_CUST_PHONE, optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		try {
			if (ResultCode.R_SUCCESS.equals(db.getResultCode())) {
				returnMap = db.getReturnlmap();
			} else {
				returnMap.put("resultCode", db.getResultCode());
				returnMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("CSB异常的终端串码查询queryCustInfoByMktResCode4iot服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.IOT_MKTRESCODE, dataBusMap, db.getReturnlmap(), e);
		}
		return returnMap;
	}

	/**
	 * 客户鉴权
	 */
	public Map<String, Object> custAuth(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> paremMap=new HashMap<String, Object>();
		Map<String, Object> returnMap = new HashMap<String, Object>();
		    paremMap.put("accessNumber", dataBusMap.get("accessNumber"));
		    paremMap.put("areaId", dataBusMap.get("areaId"));
		    paremMap.put("prodPwd", dataBusMap.get("prodPwd"));
		DataBus db = InterfaceClient.callService(paremMap,
				PortalServiceCode.INTF_CUST_AUTH, optFlowNum, sessionStaff);
		try {
			String resultCode = StringUtils.defaultString(db.getResultCode(), "1");
			returnMap.put("resultCode", resultCode);
			returnMap.put("resultMsg", MapUtils.getString(db.getReturnlmap(), "resultMsg", ""));
			if (ResultCode.R_SUCC.equals(resultCode)) {
				returnMap.putAll(MapUtils.getMap(db.getReturnlmap(), "result", new HashMap<String, Object>()));
			}
			return returnMap;
		} catch (Exception e) {
			log.error("产品密码鉴权服务queryBoProdPasswordsByCond返回的数据异常", e);
			throw new BusinessException(ErrorCode.CUST_AUTH, dataBusMap, db.getReturnlmap(), e);
		}
	}
	
	/*
	 * 客户已购产品查询
	 * (non-Javadoc)
	 * @see com.al.lte.portal.bmo.crm.BusiBmo#queryPhoneNumber(java.util.Map, java.lang.String, com.al.lte.portal.model.SessionStaff)
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryCustProd(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {	
		String serviceCode = PortalServiceCode.INTF_QUERY_PROD;
		// 通过BIZID定位的客户，已订购查询调另一个接口
		if (StringUtils.isNotBlank(MapUtils.getString(dataBusMap, "BIZID", ""))) {
			serviceCode = PortalServiceCode.QUERY_BIZ_CUSTINFO_FROM_PROV;
		}
		DataBus db = InterfaceClient.callService(dataBusMap, serviceCode,
				optFlowNum, sessionStaff);
		List<Map<String, Object>> list = null;
		List<Map<String, Object>> temlist = null;
		List<Map<String, Object>> temsublist = null;
		List<Map<String, Object>> prodStopRecordslist = null;
		Map<String, Object> dbMap=new HashMap<String, Object>();
		Map<String, Object> resultMap=new HashMap<String, Object>();;
		Map<String, Object> returnMap = new HashMap<String, Object>();
		try {
		if ("0".equals(StringUtils.defaultString(db.getResultCode()))) {
			dbMap = db.getReturnlmap();
			//System.out.println("dbmap="+dbMap);
			Map<String, Object> getResultMap=(Map) dbMap.get("result");
			Map<String, Object> pageMap=(Map) getResultMap.get("page");
			if(getResultMap.get("prodInstInfos")==null){
				returnMap.put("code", ResultCode.R_FAIL);
				//returnMap.put("msg", "后台服务:产品信息查询返回报文:result-->prodInstInfos节点不存在,请与省份确认！");
				returnMap.put("msg", "客户下没有可以办理业务的移动用户");
				return returnMap;
			}
			if(getResultMap.get("page")==null){
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", "后台服务:产品信息查询返回报文:result-->page节点不存在,请与省份确认！");
				return returnMap;
			}
			List<Map<String, Object>> prodInstInfos=new ArrayList();
			List<Map<String, Object>> temResultList=new ArrayList();
			List<Map<String, Object>> sortList=new ArrayList();
			resultMap.put("page",pageMap);
			list=(List<Map<String, Object>>) getResultMap.get("prodInstInfos");
			
			for (int i=0;i<list.size();i++){
				Map datamaptemp =new HashMap();
				datamaptemp.put("id", i);
				temlist=(List<Map<String, Object>>) list.get(i).get("mainProdOfferInstInfos");
				if(temlist.size()>0){
					datamaptemp.put("prodOfferInstId", temlist.get(0).get("prodOfferInstId"));
				}else{
						returnMap.put("code", ResultCode.R_FAIL);
						returnMap.put("msg", "后台服务:产品信息查询返回报文:result-->prodInstInfos-->mainProdOfferInstInfos无数据,请与省份确认！");
						return returnMap;
					//datamaptemp.put("prodOfferInstId", 0);
				}
				temResultList.add(datamaptemp);
			}
			this.log.debug("sort before={}", JsonUtil.toString(temResultList));
			Collections.sort(temResultList, new Comparator<Map<String, Object>>() {
				public int compare(Map<String, Object> e1, Map<String, Object> e2) {
					if (NumberUtils.isNumber(String.valueOf(e1
							.get("prodOfferInstId")))) {
						long prodOfferInstId1 = Long.parseLong(String.valueOf(e1
								.get("prodOfferInstId")));
						long prodOfferInstId2 = Long.parseLong(String.valueOf(e2
								.get("prodOfferInstId")));
						if (prodOfferInstId1 - prodOfferInstId2 < 0)
							return 1;
						else
							return -1;
					} else {
						return 1;
					}

				}
			});
			// 排序后
			this.log.debug("sort after={}", JsonUtil.toString(temResultList));
			for(int i=0;i<temResultList.size();i++){
				Map datamaptemp =new HashMap();
				datamaptemp=list.get((Integer) temResultList.get(i).get("id"));
				sortList.add(datamaptemp);
			}
			// 最后排序后
			this.log.debug("sort endafter={}", JsonUtil.toString(sortList));
			long prodOfferInstId=0;
			int currNum=0;
			for (int i=0;i<sortList.size();i++){
				Map datamaptemp =new HashMap();
				datamaptemp.put("accNbr", sortList.get(i).get("accNbr"));
				Map feeType=new HashMap();
				try{
				feeType=(Map) sortList.get(i).get("feeType");}
			    catch(Exception e){
					feeType.put("feeType", "");
					feeType.put("name", "");
				}
				datamaptemp.put("feeType", feeType);
				datamaptemp.put("custId", sortList.get(i).get("custId"));
				datamaptemp.put("areaId", sortList.get(i).get("areaId"));
				datamaptemp.put("ownerId", sortList.get(i).get("ownerId"));
				datamaptemp.put("ownerName", sortList.get(i).get("ownerName"));
				datamaptemp.put("prodInstId", sortList.get(i).get("prodInstId"));
				datamaptemp.put("extProdInstId", sortList.get(i).get("extProdInstId"));
				datamaptemp.put("corProdInstId", sortList.get(i).get("corProdInstId"));
				datamaptemp.put("ifLteNewInstall", sortList.get(i).get("ifLteNewInstall"));
				datamaptemp.put("productId", sortList.get(i).get("productId"));
				datamaptemp.put("productName", sortList.get(i).get("productName"));
				datamaptemp.put("prodStateCd", sortList.get(i).get("prodStateCd"));
				datamaptemp.put("prodStateName", sortList.get(i).get("prodStateName"));
				datamaptemp.put("prodClass", sortList.get(i).get("prodClass"));
				datamaptemp.put("prodStopRecords", sortList.get(i).get("prodStopRecords"));
				datamaptemp.put("mainProdOfferInstInfos", sortList.get(i).get("mainProdOfferInstInfos"));
				datamaptemp.put("roleCd", sortList.get(i).get("roleCd"));
				datamaptemp.put("roleName", sortList.get(i).get("roleName"));
				datamaptemp.put("zoneNumber", sortList.get(i).get("zoneNumber"));
				// 接口优化 回参增加的字段(有开关控制)
			    datamaptemp.put("prodBigClass", sortList.get(i).get("prodBigClass") == null ? "" : sortList.get(i).get("prodBigClass"));
				temlist=(List<Map<String, Object>>) sortList.get(i).get("mainProdOfferInstInfos");
				if (temlist.size()==1){
					datamaptemp.put("prodOfferName", temlist.get(0).get("prodOfferName"));
					datamaptemp.put("startDt", temlist.get(0).get("startDt"));
				}else if(temlist.size()==0){
					datamaptemp.put("prodOfferName", "无");
				}else{
					datamaptemp.put("prodOfferName", "");
				}
				//主副卡分组
				long temProdOfferInstId=0;
				if (temlist!=null &&temlist.size()>0){
					datamaptemp.put("roleCd", temlist.get(0).get("roleCd"));
					datamaptemp.put("roleName", temlist.get(0).get("roleName"));
					temProdOfferInstId=Long.valueOf(String.valueOf( temlist.get(0).get("prodOfferInstId")) );
				}
				if(temProdOfferInstId==prodOfferInstId){
					currNum=currNum+1;
				}
				int totalNum=0;
				for(int j=0;sortList != null && j<sortList.size();j++){
					long temSubProdOfferInstId=0;
					temsublist=(List<Map<String, Object>>) sortList.get(j).get("mainProdOfferInstInfos");
					if (temsublist.size()>0){
						temSubProdOfferInstId=Long.valueOf(String.valueOf( temsublist.get(0).get("prodOfferInstId")));
					}
					if((temProdOfferInstId==temSubProdOfferInstId)&&(temProdOfferInstId!=0)){
						totalNum=totalNum+1;
					};
				}
				prodStopRecordslist=(List<Map<String, Object>>) sortList.get(i).get("prodStopRecords");
				String tempStopRecordCd=new String();
				String tempStopRecordName=new String();
				tempStopRecordCd="";
				tempStopRecordName="";
				for (int j = 0; prodStopRecordslist != null && j < prodStopRecordslist.size(); j++){
					/*if("1000".equals(prodStopRecordslist.get(j).get("statusCd"))){*/
					if(tempStopRecordCd.equals("")){
						tempStopRecordCd=(String) prodStopRecordslist.get(j).get("stopRecordCd");
						tempStopRecordName=(String) prodStopRecordslist.get(j).get("stopRecordName");
					}else{
					tempStopRecordCd=tempStopRecordCd+","+(String) prodStopRecordslist.get(j).get("stopRecordCd");
					tempStopRecordName=tempStopRecordName+","+(String) prodStopRecordslist.get(j).get("stopRecordName");
					}
					
					/*}*/
				}
				if(!("").equals(tempStopRecordName)&&tempStopRecordName!= null){
					tempStopRecordName="("+tempStopRecordName+")";
				}
				datamaptemp.put("stopRecordCd", tempStopRecordCd);
				datamaptemp.put("stopRecordName", tempStopRecordName);
				prodInstInfos.add(datamaptemp);
				if(prodOfferInstId!=temProdOfferInstId){
					currNum=1;
				}
				prodOfferInstId=temProdOfferInstId;
				if(totalNum<2){
					datamaptemp.put("treeFlag", "");
				}else if((currNum==1)&&(totalNum>0)){
					datamaptemp.put("treeFlag", "tree_top");
				}else if((currNum>1)&&(currNum<totalNum)){
					datamaptemp.put("treeFlag", "tree_center");
				}else{
					datamaptemp.put("treeFlag", "tree_bottom");
				};
				//System.out.println("temProdOfferId="+temProdOfferInstId+"currNum="+currNum+"totalNum="+totalNum);
					
			}
			resultMap.put("prodInstInfos", prodInstInfos);
			returnMap.put("result", resultMap);
			returnMap.put("resultCode", "0");
			returnMap.put("resultMsg", "处理成功!");
			
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", "套餐查询接口调用失败");
			}
		} catch (Exception e) {
			log.error("门户处理营业受理后台回产品信息查询queryProdInfo返回的数据异常", e);
			throw new BusinessException(ErrorCode.ORDER_PROD, dataBusMap, db.getReturnlmap(), e);
		}
		return returnMap;
	}
	/*
	 * 客户详细信息查询
	 * (non-Javadoc)
	 * @see com.al.lte.portal.bmo.crm.BusiBmo#queryPhoneNumber(java.util.Map, java.lang.String, com.al.lte.portal.model.SessionStaff)
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryCustDetail(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {		
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.INTF_QUERY_CUST_DETAIL,
				optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		try {
			if ("0".equals(StringUtils.defaultString(db.getResultCode()))) {
				returnMap = db.getReturnlmap();

			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", "套餐查询接口调用失败");
			}
		} catch (Exception e) {
			log.error("门户处理后台的queryCustDetail服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.STAFF_LOGIN, dataBusMap, db.getReturnlmap(), e);
		}
		return returnMap;
	}

	public Map<String, Object> queryCommProduct(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		Map<String, Object> returnMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.QUERY_COMMPRODUCT,
				optFlowNum, sessionStaff);
		try {
			if ("0".equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> resultMap = db.getReturnlmap();
				Map<String, Object> tempList =  (Map<String, Object>) resultMap.get("result");
				returnMap.put("code", ResultCode.R_SUCCESS);
				returnMap.put("result", tempList);
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", "通用产品查询接口调用失败");
			}
			return returnMap;
		} catch (Exception e) {
			log.error("门户处理营业受理的service/intf.soService/queryCommProduct服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_COMMPRODUCT,dataBusMap,db.getReturnlmap(), e);
		}
		
	}
	@SuppressWarnings("unchecked")
	public Map<String, Object> custProfileSpecList(Map<String, Object> paramMap, String optFlowNum, SessionStaff sessionStaff) throws Exception{
		Map<String, Object> result = new HashMap<String, Object>();
		Map<String, Object> resultMap=null;
		List<Map<String, Object>> tabList= null;
		List<Map<String, Object>> tabTempList= null;
		// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.INTF_PARTY_PROFILE, optFlowNum,
				sessionStaff);
		try {
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
					.getResultCode()))) {
				result.put("code", "1");
				result.put("mess", "未获取到客户属性！");
				resultMap = db.getReturnlmap();
				if (ResultCode.R_SUCC.equals(resultMap.get("resultCode"))) {
					List<Map<String, Object>> list = null;
					list = (List<Map<String, Object>>) resultMap.get("result");
					// 将实例放入map中，然后查询规格，如果规格中有实例中没有，将规格放入实例，补充没有的属性。
					tabTempList =new ArrayList();
					
					for (int i=0;i<list.size();i++){
						Map tabtempMap=new HashMap();
						tabtempMap.put("partyProfileCatgTypeCd", list.get(i).get("partyProfileCatgTypeCd"));
						tabtempMap.put("partyProfileCatgTypeName", list.get(i).get("partyProfileCatgTypeName"));
						tabtempMap.put("tabProfileNum", "tabProfile"+list.get(i).get("partyProfileCatgTypeCd"));
						tabTempList.add(tabtempMap);
					}
					removeDuplicate(tabTempList);
					this.log.debug("sort before={}", JsonUtil.toString(tabTempList));
					Collections.sort(tabTempList, new Comparator<Map<String, Object>>() {
						public int compare(Map<String, Object> e1, Map<String, Object> e2) {
							if (NumberUtils.isNumber(String.valueOf(e1
									.get("partyProfileCatgTypeCd")))) {
								long prodOfferInstId1 = Long.parseLong(String.valueOf(e1
										.get("partyProfileCatgTypeCd")));
								long prodOfferInstId2 = Long.parseLong(String.valueOf(e2
										.get("partyProfileCatgTypeCd")));
								if (prodOfferInstId1 - prodOfferInstId2 > 0)
									return 1;
								else
									return -1;
							} else {
								return 1;
							}

						}
					});
					// 排序后
					this.log.debug("sort after={}", JsonUtil.toString(tabTempList));
					Map tempMap = new HashMap();
					for (Map map : list) {
						tempMap.put(map.get("attrSpecTypeCd"), 1);
					}
					if (list != null && list.size() > 0) {
						result.put("code", "0");
						result.put("mess", "");
						result.put("tabList", tabTempList);
						result.put("profileSpec", list);
					}
				}
			} else {
				result.put("code", "-1");
				result.put("message", "调用客户属性规格列表查询接口失败！");
			}
			return result;
		} catch (Exception e) {
			log.error("客户属性规格列表的queryPartyProfileSpecList服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.STAFF_LOGIN, paramMap, db.getReturnlmap(), e);
		}
	}
	
	//list去重
	public static void removeDuplicate(List list) {
		for ( int i = 0 ; i < list.size() - 1 ; i ++ ) {
			for ( int j = list.size() - 1 ; j > i; j -- ) {
				if (list.get(j).equals(list.get(i))) {
		         list.remove(j);
				}
			}
		}
	}
	
	/**
	 * 通过客户类型，获取证件类型数据信息
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryCertType(Map<String, Object> paramMap, String optFlowNum, SessionStaff sessionStaff) throws Exception{
		Map<String, Object> result = new HashMap<String, Object>();
		
		//先判断缓存中是否有该编码的数据信息
		Object idCardType=Const.ID_CARD_TYPE;//可修改的常量中的证件类型数据
		String partyTypeCd=paramMap.get("partyTypeCd")!=null ? String.valueOf(paramMap.get("partyTypeCd")):"";//客户类型
		
		List<Map<String,Object>> cardTypeList=null;
		
		if(idCardType!=null && idCardType instanceof List && partyTypeCd!=null && !"".equals(partyTypeCd)){
			cardTypeList=(List<Map<String, Object>>)idCardType;
			
			if(cardTypeList!=null && cardTypeList.size()!=0){
				for(Map<String, Object> cardTypeInfo:cardTypeList){
					if(cardTypeInfo.get(partyTypeCd)!=null){
						result.put("code", ResultCode.R_SUCCESS);
						result.put("result",(List<Map<String, Object>>)cardTypeInfo.get(partyTypeCd));
						result.put("mess", "获取数据成功");
						return result;
					}
				}
			}
		}
		
		//如果缓存中没有数据信息,调用接口获取数据,服务层调用与接口层调用都成功时，返回列表；否则返回空列表
		DataBus db = InterfaceClient.callService(paramMap,PortalServiceCode.INTF_QUERY_CERTTYPE, optFlowNum,sessionStaff);
		try {
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> resultMap = db.getReturnlmap();
				List<Map<String, Object>> returnList = new ArrayList<Map<String, Object>>();
				if (MapUtils.isNotEmpty(resultMap)) {
					returnList = (List<Map<String, Object>>) resultMap.get("result");
				}
				result.put("code", ResultCode.R_SUCCESS);
				result.put("result", returnList);
				
				//将数据信息保存到缓存-start
				Map<String, Object> cardMap=new HashMap<String, Object>();
				cardMap.put(partyTypeCd, returnList);
				
				//传入缓存，用获取类型作为key
				if(cardTypeList!=null && cardTypeList.size()!=0){
					cardTypeList.add(cardMap);
				}else{
					cardTypeList=new ArrayList<Map<String,Object>>();
					cardTypeList.add(cardMap);
				}
				
				Const.ID_CARD_TYPE=cardTypeList;
				//将数据信息保存到缓存-end
			} else {
				result.put("code", ResultCode.R_FAIL);
				result.put("msg", db.getResultMsg());
			}
			
			return result;
		} catch (Exception e) {
			log.error("根据员工类型查询员工证件类型的queryCertTypeByPartyTypeCd服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.ORDER_CTGMAINDATA, paramMap, db.getReturnlmap(), e);
		}
	}

	/*
	 * (non-Javadoc)
	 * @see com.al.lte.portal.bmo.crm.CustBmo
	 * #decodeCert(java.lang.String, java.lang.String)
	 */
	public Map<?, ?> decodeCert(String data, String secret) throws Exception {
	    String dataXml = Des33.decode1(data, secret);
        XMLSerializer xmlSerializer = new XMLSerializer();
        JSON json = xmlSerializer.read(dataXml);
        return JsonUtil.toObject(json.toString(2), Map.class);
	}
	
	public Map<String, Object> decodeUserInfo(Map<String, Object> dataBusMap,
		String optFlowNum, SessionStaff sessionStaff,String dekeyWord,HttpServletRequest request) throws Exception {
		Map<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("mac", dataBusMap.get("mac"));
		String secretKey = "";
		Map<String, Object> resMap = new HashMap<String, Object>(); 
		try {
			String keyValue = MySimulateData.getInstance().getParam(dekeyWord,dataBusMap.get("mac")
					.toString().replaceAll(":", ""));
			if(keyValue==null || "".equals(keyValue)){
				secretKey = "";
				resMap.put("code", 1);
				resMap.put("msg", "没有找到密钥，请配置！");
				return resMap;  //密钥找不到
			}else{
				secretKey =  keyValue + keyValue.substring(0, 16);
			}
			try {
				String data = dataBusMap.get("userInfo").toString();
				String userInfoXml = Des33.decode1(data,secretKey);
			    XMLSerializer xmlSerializer = new XMLSerializer(); 
		        JSON json = xmlSerializer.read(userInfoXml);  
		        resMap.put("code", ResultConstant.SUCCESS.getCode());
				resMap.put("msg", "成功");
		        resMap.put("userInfo", JsonUtil.toObject(json.toString(2), Map.class) );
		        //新增照片出来逻辑
		        JSONObject jsonObj =JSONObject.fromObject(json.toString(2));
		        boolean jsonflag = jsonObj.containsKey("identityPic");
		        String identityPic= null;
		        if(jsonflag) {
		        	identityPic = jsonObj.getString("identityPic");	
		        }
		       
		        if(StringUtils.isNotBlank(identityPic)) {
		        	  byte[] decode = new BASE64Decoder().decodeBuffer(identityPic);
		        	  //Properties properties = MySimulateData.getProperties("/portal/config.properties");
		        	  
		        	  //String soDir = CustBmoImpl.class.getClassLoader().getResource("/soFile").getPath();
		        	  String soDir = request.getRealPath("/resources/soFile/");
		  			  if(StringUtils.isNotBlank(soDir)){
		  				RunShellUtil runShellUtil = new RunShellUtil();
		  				String name = UUID.randomUUID().toString();
		  				String wltDir = soDir+name+".wlt";
		  				String bmpDir = soDir+name+".bmp";
		  				String jpgDir = soDir+name+".jpg";
		  				runShellUtil.getFileFromBytes(decode,wltDir);
		  				runShellUtil.soDec(soDir, name);
		  				File srcFile = new File(bmpDir);
		  				if (!srcFile.exists()){
		  					log.debug("decodeUserInfo出错：{}","bmp文件不存在");
		  				}
		  				boolean flag = runShellUtil.compressPic(bmpDir,jpgDir);
		  				if(!flag) {
		  					log.debug("decodeUserInfo出错：{}","jpg文件不存在");
		  				}
		  				byte[] identityPicDecode = runShellUtil.getByteFromFile(jpgDir);
		  				identityPic = new BASE64Encoder().encode(identityPicDecode);
		  				identityPic = identityPic.replaceAll("\n|\r", "");
		  				if(StringUtils.isNotBlank(identityPic)){
		  					runShellUtil.deleteFile(bmpDir);
		  					runShellUtil.deleteFile(wltDir);
		  					runShellUtil.deleteFile(jpgDir);
		  					jsonObj.put("identityPic", identityPic);
						    //resMap.put("userInfo", jsonObj.toString(2));
		  			        resMap.put("userInfo", JsonUtil.toObject(jsonObj.toString(2), Map.class) );
		  				}
		  			  }
		        }
		      
			}catch (JSONException e) {
				resMap.put("code", 3);
				resMap.put("msg", "xml格式转json格式出错，请确认xml格式是否正确,"+e.getMessage());
				log.error("xml格式转json格式出错，请确认xml格式是否正确", e);
			}catch(Exception e){
				resMap.put("code", 2);
				resMap.put("msg", "根据密钥解密密文出错，请确认密钥或密文是否正确,"+e.getMessage());
				log.error("根据密钥解密报文出错，请确认密钥是否正确", e);
			}
		} catch (Exception e) {
			log.error("查询蓝牙密钥的decodeUserInfo服务返回的数据异常", e);
			throw new Exception(e);
		}
		return resMap;
	}

	public Map<String, Object> queryAccNbrByCust(
			Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.QUERY_ACC_NBR_BY_CUST, optFlowNum, sessionStaff);
		Map returnMap = db.getReturnlmap();
		try {
			String code = (String) returnMap.get("resultCode");
			Map custInfoMap = null;
			if (ResultCode.R_SUCC.equals(code)) {
				custInfoMap = (HashMap) returnMap.get("result");
			}
			return custInfoMap;
		} catch (Exception e) {
			log.error("后台异常根据客户查询接入号服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_ACC_NBR_BY_CUST, dataBusMap, db.getReturnlmap(), e);
		}
	}
	
	public Map<String, Object> queryCustCompreInfo(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.QUERY_CUST_COMPRE_INFO, optFlowNum, sessionStaff);
		Map returnMap = db.getReturnlmap();
		try {
			String code = (String) returnMap.get("resultCode");
			if (ResultCode.R_SUCC.equals(code)) {
				retnMap = (HashMap) returnMap.get("result");
			}
			return retnMap;
		} catch (Exception e) {
			log.error("能力开放平台的客户架构信息查询queryCustCompreInfo服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_CUST_COMPRE_INFO, dataBusMap, db.getReturnlmap(), e);
		}
	}


	/**
	 * 账户和使用人信息查询服务
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryAccountAndUseCustInfo(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.QUERY_ACCOUNT_USE_CUSTINFO, optFlowNum, sessionStaff);
		Map returnMap = db.getReturnlmap();
		try {
			String code = (String) returnMap.get("resultCode");
			if (ResultCode.R_SUCC.equals(code)) {
				retnMap = (HashMap) returnMap.get("result");
			}
			return retnMap;
		} catch (Exception e) {
			log.error("账户和使用人信息查询queryAccountAndUseCustInfo服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_ACCOUNT_USE_CUSTINFO, dataBusMap, db.getReturnlmap(), e);
		}
	}
	
	/**
	 * 实名制证件照片上传
	 * @throws BusinessException 
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> uploadCustCertificate(Map<String, Object> param, SessionStaff sessionStaff) throws BusinessException, InterfaceException, IOException, Exception{
		List<Map<String, String>> photographs = (List<Map<String, String>>) param.get("photographs");
		Map<String, Object> result = new HashMap<String, Object>();
		
		//1.urlDecode解码
		if(this.urlDecode(photographs)){
			int count = 0;
			for(int i = 0; i < photographs.size(); i++){
				Map<String, String> photograph = photographs.get(i);
				//目前仅对拍照的照片进行签名校验和水印处理(即flag为D)
				if("D".equals(photograph.get("flag"))){
					String venderId = param.get("venderId").toString();
					//2.签名校验
					if(this.verifySignature(photograph, venderId)){
						//3.添加水印
						try {
							this.addTextWatermark(photograph, venderId);
						} catch (IOException ioe) {
							log.error("拍照证件添加水印发生异常={}", ioe);
							throw new BusinessException(ErrorCode.PRE_HANDLE_CUST_CERTIFICATE, param, null, ioe);
						}
						//4.图片压缩
						//到底要不要压缩( ˇˍˇ )
					} else{
						result.put("code", ResultCode.R_FAIL);
						result.put("msg", "证件签名校验失败，原因可能是请求入参中的数据已被篡改或存在冲突，请不要试图进行非法操作、重复操作或在多个浏览器窗口同时提交业务。");
						return result;
					}
				} else{
					count++;
				}
			}
			
			//5.证件上传，实名信息采集单中可以不需要拍照照片
			if(count == photographs.size()&&!("true".equals(param.get("collection")))){
				result.put("code", ResultCode.R_FAIL);
				result.put("msg", "请求入参中未获取到有效的实名拍照信息，原因可能是请求入参中的数据已被篡改或丢失，请不要试图进行非法操作、重复操作或在多个浏览器窗口同时提交业务。");
			} else{
				result = this.uploadCustCertificateMethod(param, sessionStaff);
			}
		} else{
			result.put("code", ResultCode.R_FAIL);
			result.put("msg", "入参解码异常，原因可能是请求入参中的数据已被篡改或丢失，请不要试图进行非法操作、重复操作或在多个浏览器窗口同时提交业务。");
		}

		return result;
	}
	
	/**
	 * 校验签名
	 * @param photographs base64照片字符串
	 * @param venderId 厂商ID
	 * @return true：校验成功；false：校验失败
	 */
	private boolean verifySignature(Map<String, String> image, String venderId){
		boolean resultFlag = false;
		
		Photograph photograph = Photograph.getInstance();
		photograph.setPhotograph(image.get("photograph").toString());
		photograph.setSignature(image.get("signature").toString());
		resultFlag = photograph.verifySignature(venderId);
		
		return resultFlag;
	}
	
	/**
	 * 证件照片添加水印
	 * @param photographs base64照片字符串
	 * @param venderId 厂商ID
	 * @return 所有证件照片一次性添加水印，并以List返回
	 * @throws IOException
	 */
	public Map<String, String> addTextWatermark(Map<String, String> image, String venderId) throws IOException{
		Photograph photograph = Photograph.getInstance();
		
		photograph.setPhotograph(image.get("photograph"));
		image.put("photograph", photograph.addTextWatermarkMethod(venderId));
		
		return image;
	}
	
	/**
	 * 证件照片上传
	 * @param param
	 * @param sessionStaff
	 * @return
	 * @throws BusinessException
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> uploadCustCertificateMethod(Map<String, Object> param, SessionStaff sessionStaff) throws InterfaceException, IOException, Exception, BusinessException{
		List<Map<String, String>> photographs = (List<Map<String, String>>) param.get("photographs");		

		//重新封装，去掉协议之外的无用的节点
		for(int i = 0; i < photographs.size(); i++){
			Map<String, String> photograph = photographs.get(i);
			if("".equals(MapUtils.getString(photograph, "photograph", ""))){//没有证件照片，则不上传，去除该节点
				photographs.remove(i--);
			} else{
				photograph.put("orderInfo", photograph.get("photograph"));
				photograph.put("picFlag", photograph.get("flag"));
				photograph.remove("photograph");
				photograph.remove("flag");
				photograph.remove("signature");//签名不在协议之内，去除
			}
		}
		param.put("picturesInfo", photographs);
		param.remove("photographs");

		return Photograph.getInstance().uploadCustCertificate(param, sessionStaff);
	}
	
	/**
	 * 实名制照片添加水印
	 * @param param
	 * @return
	 * @throws IOException 
	 */
	public Map<String, Object> preHandleCustCertificate(String base64ImageStr, String venderId) throws IOException{
		Map<String, Object> result = new HashMap<String, Object>();
		String imageStr = EncodeUtils.urlDecode(base64ImageStr);
		
		if(imageStr != null){
			Photograph photograph = Photograph.getInstance();
			photograph.setPhotograph(imageStr);
			result.put("photograph", photograph.addTextWatermarkMethod(venderId));
			result.put("code", ResultCode.R_SUCCESS);
		} else{
			result.put("code",  ResultCode.R_FAIL);
			result.put("msg", "入参解码异常，可能入参为空或编码不合法");
			log.error("入参解码异常，无法使用URLEncode解码为base64字符串=preHandleCustCertificate");
		}
		
		return result;
	}
	
	/**
	 * urlDecode解码，入参中所有base64都经过URLEncode编码，这里全部解码为base64字符串
	 * @param photographs
	 * @return true:全部解码成功; fasle:解码失败
	 */
	private boolean urlDecode(List<Map<String, String>> photographs){
		boolean resultFlag = true;
		
		for(int i = 0; i < photographs.size(); i++){
			Map<String, String> photograph = photographs.get(i);
			String base64ImageStr = EncodeUtils.urlDecode(photograph.get("photograph"));
			if(base64ImageStr != null){
				photograph.put("photograph", base64ImageStr);
			} else{
				log.error("入参解码异常，无法使用URLEncode解码为base64字符串=uploadCustCertificate");
				resultFlag = false;
				break;
			}
		}
		
		return resultFlag;
	}

    /**
     * 客户资料同步接口
     *
     * @param dataBusMap
     * @param optFlowNum
     * @param sessionStaff
     * @return
     * @throws Exception
     */
    @Override
    public Map<String, Object> custinfoSynchronize(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception {
        Map<String, Object> retnMap = new HashMap<String, Object>();
        DataBus db = InterfaceClient.callService(dataBusMap,
            PortalServiceCode.CUSTINFO_SYNCHRONIZE, optFlowNum, sessionStaff);
        Map returnMap = db.getReturnlmap();
        try {
            String code = (String) returnMap.get("resultCode");
            if (ResultCode.R_SUCC.equals(code)) {
                retnMap = (HashMap) returnMap.get("result");
            }
            return retnMap;
        } catch (Exception e) {
            log.error("客户资料同步接口custInfoSynchronize服务返回的数据异常", e);
            throw new BusinessException(ErrorCode.CUSTINFO_SYNCHRONIZE, dataBusMap, db.getReturnlmap(), e);
        }
    }

    /**
     * 证号关系预校验接口
     *
     * @param dataBusMap
     * @param optFlowNum
     * @param sessionStaff
     * @return
     * @throws Exception
     */
    @Override
    public Map<String, Object> preCheckCertNumberRel(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception {
        Map<String, Object> retnMap = new HashMap<String, Object>();
        DataBus db = InterfaceClient.callService(dataBusMap,
            PortalServiceCode.PRE_CHECK_CERT_NUMBER_REL, optFlowNum, sessionStaff);
        Map returnMap = db.getReturnlmap();
        try {
            String code = (String) returnMap.get("resultCode");
            if (ResultCode.R_SUCC.equals(code)) {
                retnMap = (HashMap) returnMap.get("result");
                retnMap.put("code", code);
            }else{
            	return returnMap;
            }
            return retnMap;
        } catch (Exception e) {
            log.error("证号关系预校验接口preCheckForCertAndNumberRel服务返回的数据异常", e);
            throw new BusinessException(ErrorCode.PRE_CHECK_CERT_NUMBER_REL, dataBusMap, db.getReturnlmap(), e);
        }
    }

    /**
     * 获取custId的seq
     *
     * @param paramMap
     * @param optFlowNum
     * @param sessionStaff
     * @return
     * @throws Exception
     */
    @Override
    public Map<String, Object> getSeq(Map<String, Object> paramMap, String optFlowNum, SessionStaff sessionStaff) throws Exception {
        DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.GET_SEQ, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = (Map<String,Object>)db.getReturnlmap().get("result");
				resultMap.put("resultCode", ResultCode.R_SUCC);
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
            throw new BusinessException(ErrorCode.GET_SEQ, paramMap, db.getReturnlmap(), e);
        }
		return resultMap;
    }

	public Map<String, Object> checkCustCert(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.CHECK_CUST_CERT, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("实名核验checkCustCert服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.CHECK_CUST_CERT, dataBusMap, resultMap, e);
		}
		return resultMap;
	}

	// 人证照片比对
	public Map<String, Object> verify(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
        Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callEopService(param,
				PortalServiceCode.PIC_VERIFY, optFlowNum, sessionStaff, "人证平台",
				MDA.CSB_PIC_VERIFY);
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			resultMap = db.getReturnlmap();
			resultMap.put("code", ResultCode.R_SUCCESS);
			String msg = "";
			if (resultMap != null
					&& !ResultCode.R_SUCC.equals(resultMap.get("result_code"))) {
				if(!"null".equals(resultMap.get("error_code") + "")){
					msg += "【"+ resultMap.get("error_code") + "】";
				}if(!"null".equals(resultMap.get("error_msg") + "")){
					msg += resultMap.get("error_msg") + "";
				}
			}
			resultMap.put("msg", msg); 
		} else {
			resultMap.put("code", ResultCode.R_FAIL);
			String msg = db.getResultMsg(); 
			resultMap.put("msg", msg); 
		}
		return resultMap;
	}
	
	public Map<String, Object> queryProdInstStats(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.QUERY_PRODINST_STATS, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("营销标签查询服务queryProdInstStats服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_PRODINST_STATS, dataBusMap, resultMap, e);
		}
		return resultMap;
	}
	
	public Map<String, Object> queryMktActivityList(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.QUERY_MKT_ACTIVITYLIST, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("营销标签查询服务queryMktActivityList服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_MKT_ACTIVITYLIST, dataBusMap, resultMap, e);
		}
		return resultMap;
	}
	
	public Map<String, Object> queryMktCustList(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.QUERY_MKT_CUSTLIST, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("营销推荐清单查询服务queryMktCustList服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_MKT_CUSTLIST, dataBusMap, resultMap, e);
		}
		return resultMap;
	}
	
	public Map<String, Object> saveMktContactResult(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.SAVE_MTK_RESULT, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("营销任务（接触）反馈结果记录服务saveMktContactResult服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.SAVE_MTK_RESULT, dataBusMap, resultMap, e);
		}
		return resultMap;
	}
	
    /**
     * 查询云平台加密身份信息
     *
     * @param dataBusMap
     * @param optFlowNum
     * @param sessionStaff
     * @return
     * @throws Exception
     */
    public Map<String, Object> queryCert(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception {
        Map<String, Object> retnMap = new HashMap<String, Object>();
        String serverIp = "http://"+MapUtils.getString(dataBusMap, "serverIp");// 请求服务器ip
		String decodeId = MapUtils.getString(dataBusMap, "decodeId");// 获取加密身份信息唯一id
		String query = "{\"decodeId\":\"" + decodeId + "\"}";
		dataBusMap.put("serverIp", serverIp);
		dataBusMap.put("query", query);
        DataBus db = InterfaceClient.callCloudService(dataBusMap,
            PortalServiceCode.QUERY_CLOUD_CERT, optFlowNum, sessionStaff);
        Map<String, Object> returnMap = db.getReturnlmap();
        try {
            String code = returnMap.get("resultFlag").toString();
            if (ResultCode.R_SUCC.equals(code)) {
                retnMap = (Map<String, Object>) returnMap.get("resultContent");
                retnMap.put("code", code);
            }else{
            	return returnMap;
            }
            return retnMap;
        } catch (Exception e) {
            log.error("云平台api/v1/queryCert服务返回的数据异常", e);
            throw new BusinessException(ErrorCode.QUERY_CLOUD_CERT, dataBusMap, db.getReturnlmap(), e);
        }
    }
  	
}
