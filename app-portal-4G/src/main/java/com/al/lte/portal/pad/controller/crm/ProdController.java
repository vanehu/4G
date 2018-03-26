package com.al.lte.portal.pad.controller.crm;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.entity.PageModel;
import com.al.ecs.common.util.PageUtil;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.OfferBmo;
import com.al.lte.portal.bmo.crm.ProdBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 产品变更控制层 主要受理二次业务
 * 
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 上午10:03:44
 * @modifyDate
 * @copyRight 亚信联创EC研发部
 */
@Controller("com.al.lte.portal.pad.controller.crm.ProdController")
@RequestMapping("/pad/prod/*")
public class ProdController extends BaseController {

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.ProdBmo")
	private ProdBmo prodBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OfferBmo")
	private OfferBmo offerBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
	private StaffBmo staffBmo;

	/**
	 * 转至产品通用查询页面
	 * @return
	 */
	@RequestMapping(value = "/preProdQuery", method = RequestMethod.GET)
	public String preProdQuery(HttpSession session,Model model){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.
		getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		Map<String, Object> defaultAreaInfo = CommonMethods.getDefaultAreaInfo_MinimumC3(sessionStaff);
		model.addAttribute("defaultAreaName", defaultAreaInfo.get("defaultAreaName"));
		model.addAttribute("defaultAreaId", defaultAreaInfo.get("defaultAreaId"));
		
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"prod/preProdQuery"));		
		return "/pad/pad/product/product-detail-query";
	}
	
	/**
	 * 产品信息查询
	 * @param param
	 * @param model
	 * @param flowNum
	 * @param response
	 * @return
	 * @throws BusinessException
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/prodQuery", method = RequestMethod.GET)
	public String prodQuery(@RequestParam Map<String, Object> param, Model model,@LogOperatorAnn String flowNum, HttpServletResponse response)throws BusinessException{
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		Map<String, Object> empty = new HashMap<String, Object>();
		String serviceName = "后台服务service/intf.prodInstService/queryProdAndOfferByConditions的回参缺少";
		
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			resultMap = prodBmo.prodQuery(param, flowNum, sessionStaff);
			if(MapUtils.getString(resultMap, "resultCode", "").equals("0")){
				if(!MapUtils.getMap(resultMap, "result", empty).isEmpty()){
					Map<String, Object> result = (Map<String, Object>)resultMap.get("result");
					if(result.get("prodInstInfos")!=null){
						ArrayList<Map<String, Object>> prodInstInfos = (ArrayList<Map<String, Object>>)result.get("prodInstInfos");
						if(!MapUtils.getMap(result, "page", empty).isEmpty()){
							Map<String, Object> page = (Map<String, Object>)result.get("page");
							if(prodInstInfos.size()>0){
								int pageNo = MapUtils.getInteger(page, "curPage", 1);
								int pageSize = MapUtils.getInteger(page, "pageSize", 12);
								int totalRecords = MapUtils.getInteger(page, "totalCount", 12);
								PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(pageNo, pageSize, totalRecords<1?1:totalRecords, prodInstInfos);
								model.addAttribute("pageModel", pm);
								model.addAttribute("flag", 0);
							}
							else{
								model.addAttribute("flag", 1);
							}
						}
						else{
							model.addAttribute("flag", 2);
							model.addAttribute("failInfo", serviceName+"【page】节点或该节点为空，请与省内确认！");
							return "pad/product/product-list";
						}
					}
					else{
						model.addAttribute("flag", 2);
						model.addAttribute("failInfo", serviceName+"【prodInstInfos】节点，请与省内确认！");
						return "pad/product/product-list";
					}
				}
				else{
					model.addAttribute("flag", 2);
					model.addAttribute("failInfo", serviceName+"【result】节点或该节点为空，请与省内确认！");
					return "pad/product/product-list"; 
				}																
			}
			else{					
				model.addAttribute("flag", 2);
				model.addAttribute("failInfo", MapUtils.getString(resultMap, "resultMsg"));
				return "pad/product/product-list";
			}
		}catch(BusinessException be){
			return super.failedStr(model, be);
		}catch(InterfaceException ie){
			return super.failedStr(model, ie, param, ErrorCode.ORDER_PROD);
		}catch(Exception e){
			Map<String, Object> interfaceIO = new HashMap<String, Object>();
			interfaceIO.put("门户入参", param);
			interfaceIO.put("后台回参", resultMap);
			return super.failedStr(model, ErrorCode.ORDER_PROD, e, interfaceIO);
		}
		return "pad/product/product-list";
	}
	
	/**
	 * 产品实例详情查询
	 * @param param
	 * @param model
	 * @param flowNum
	 * @param response
	 * @return
	 * @throws BusinessException
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/prodDetailQuery", method = RequestMethod.GET)
	public String prodDetailQuery(@RequestParam Map<String, Object> param, Model model,@LogOperatorAnn String flowNum, 
			HttpServletResponse response)throws BusinessException{
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		Map<String, Object> empty = new HashMap<String, Object>();
		String serviceName = "后台服务service/intf.prodInstService/queryProdInfo的回参缺少";
		
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{			
			resultMap = prodBmo.prodDetailQuery(param, flowNum, sessionStaff);
			if(MapUtils.getString(resultMap, "resultCode", "").equals("0")){
				if(!MapUtils.getMap(resultMap, "result", empty).isEmpty()){
					Map<String, Object> result = (Map<String, Object>)resultMap.get("result");
					//基本信息basic(Map)开始组装
					Map<String, Object> basic = new HashMap<String, Object>();
					basic.put("prodName", result.get("prodSpecName"));//产品名称
					basic.put("accessNumber", result.get("accessNumber"));//接入号
					basic.put("area", result.get("areaName"));//地区
					
					String statusCd = MapUtils.getString(result, "statusCd", "");
					if(statusCd.equals("100000")){
						basic.put("prodStatus", "在用");
					}
					else if(statusCd.equals("110000")){
						basic.put("prodStatus", "拆机");
					}
					else if(statusCd.equals("120000")){
						if(result.get("offerProdStopRecords")!=null){
							ArrayList<Map<String, Object>> offerProdStopRecords = (ArrayList<Map<String, Object>>)result.get("offerProdStopRecords");
							if(offerProdStopRecords.size()>0){
								Map<String, Object> offerProdStopRecord = offerProdStopRecords.get(0);
								basic.put("prodStatus", "停机（"+MapUtils.getString(offerProdStopRecord, "stopRecordName", "")+"）");//状态为停机时需要带出停机原因
							}
						}
					}
					else if(statusCd.equals("130000")){
						basic.put("prodStatus", "未竣工");
					}
					else if(statusCd.equals("140000")){
						basic.put("prodStatus", "未激活（预开通）");
					}
					else if(statusCd.equals("140001")){
						basic.put("prodStatus", "预开通");
					}
					else if(statusCd.equals("140002")){
						basic.put("prodStatus", "未激活");
					}
					else{
						basic.put("prodStatus", ""); //产品状态
					}					
					if(result.get("offerProdFeeTypes")!=null){
						ArrayList<Map<String, Object>> offerProdFeeTypes = (ArrayList<Map<String, Object>>)result.get("offerProdFeeTypes");
						if(offerProdFeeTypes.size()>0){
							Map<String, Object> offerProdFeeType = offerProdFeeTypes.get(0);
							if(!MapUtils.getMap(offerProdFeeType, "feeTypes", empty).isEmpty()){
								Map<String, Object> feeTypes = (Map<String, Object>)offerProdFeeType.get("feeTypes");
								basic.put("feeType", feeTypes.get("name"));//付费方式
							}
						}
					}					
					String prodBeginDt = MapUtils.getString(result, "beginDt", "").trim();
					if(prodBeginDt.length()>=10){
						basic.put("beginDate", prodBeginDt.substring(0, 10));//产品生效时间
					}					
					String prodEndDt = MapUtils.getString(result, "endDt", "").trim();
					if(prodEndDt.length()>=10){
						basic.put("endDate", prodEndDt.substring(0, 10));//产品失效时间
					}
					
					model.addAttribute("basic", basic);//基本信息basic(Map)组装完成
					
					//获取脱敏权限
					String isViewOperation = (String)ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_VIEWSENSI+"_"+sessionStaff.getStaffId());
					try{
			 			if(isViewOperation==null){
			 				isViewOperation = staffBmo.checkOperatSpec(SysConstant.VIEWSENSI_CODE, sessionStaff);
			 				ServletUtils.setSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_VIEWSENSI+"_"+sessionStaff.getStaffId(), isViewOperation);
			 			}
					} catch (BusinessException e) {							
						isViewOperation="1";				 		
					} catch (InterfaceException ie) {				 			
						isViewOperation="1";						
					} catch (Exception e) {							
						isViewOperation="1";						
					}
					//客户信息prodParties(Map)开始组装	
					Map<String, Object> prodParties = new HashMap<String, Object>();
					if(result.get("offerProd2Parties")!=null){
						ArrayList<Map<String, Object>> offerProd2Parties = (ArrayList<Map<String, Object>>)result.get("offerProd2Parties");
						if(offerProd2Parties.size()>0){
							Map<String, Object> offerProd2Party = offerProd2Parties.get(0);
							if(!MapUtils.getMap(offerProd2Party, "party", empty).isEmpty()){
								Map<String, Object> party = (Map<String, Object>)offerProd2Party.get("party");
								prodParties.put("partyName", party.get("partyName"));//客户名称
								if(!MapUtils.getMap(party, "partyType", empty).isEmpty()){
									Map<String, Object> partyType = (Map<String, Object>)party.get("partyType");
									prodParties.put("partyType", partyType.get("name"));//客户类型
								}
								if(party.get("identities")!=null){
									ArrayList<Map<String, Object>> identities = (ArrayList<Map<String, Object>>)party.get("identities");
									if(identities.size()>0){
										Map<String, Object> identity = identities.get(0);
										prodParties.put("identityType", identity.get("identidiesTypeName"));//证件类型
										String identityNum = MapUtils.getString(identity, "identityNum", "");
										//客户身份证脱敏权限判断
										if(!isViewOperation.equals("0") && identityNum.length()==18){
											 String preStr = identityNum.substring(0,6);
									    	 String subStr = identityNum.substring(14);
									    	 identityNum = preStr + "********" + subStr;											
										}else if(!isViewOperation.equals("0") && identityNum.length()==15){
											String preStr = identityNum.substring(0,5);								    	 
											String subStr = identityNum.substring(13);								    	 
											identityNum = preStr + "********" + subStr;
										}
										prodParties.put("identityNum", identityNum);//证件号码
									}
								}
								String address = MapUtils.getString(party, "addressStr", "").trim();
								String mailAddress = MapUtils.getString(party, "mailAddressStr", "").trim();
								if(!isViewOperation.equals("0") && address!=""){
									prodParties.put("address", address.substring(0, address.length()/2) + "********");//所在地址
								}else{
									prodParties.put("address", address);//所在地址
								}
								if(!isViewOperation.equals("0") && mailAddress!=""){
									prodParties.put("mailAddress", mailAddress.substring(0, mailAddress.length()/2) + "********");//通信地址
								}else{
									prodParties.put("mailAddress", "");
								}
							}
							else{
								model.addAttribute("flag", 1);
								model.addAttribute("failInfo", serviceName+"【party】节点或该节点为空，请与省内确认！");
								return "pad/product/product-detail-list";
							}
						}
						else{
							model.addAttribute("flag", 1);
							model.addAttribute("failInfo", serviceName+"【offerProd2Parties】节点或该节点为空，请与省内确认！");
							return "pad/product/product-detail-list";
						}
					}
					else{
						model.addAttribute("flag", 1);
						model.addAttribute("failInfo", serviceName+"【offerProd2Parties】节点或该节点为空，请与省内确认！");
						return "pad/product/product-detail-list";
					}
					
					model.addAttribute("prodParties", prodParties);//客户信息prodParties(Map)组装完成
					
					//产品属性prodItems(List)开始组装
					ArrayList<Map<String, Object>> prodItems = new ArrayList<Map<String, Object>>();
					if(result.get("offerProdItems")!=null){
						ArrayList<Map<String, Object>> offerProdItems = (ArrayList<Map<String, Object>>)result.get("offerProdItems");
						for(int n=0;n<offerProdItems.size();n++){
							Map<String, Object> prodItem = new HashMap<String, Object>();//这个map将组装一个产品属性
							Map<String, Object> offerProdItem = offerProdItems.get(n);
							Map<String, Object> itemSpec = (Map<String, Object>)offerProdItem.get("itemSpec");
							prodItem.put("itemName", itemSpec.get("name"));//属性名称
							prodItem.put("itemValue", offerProdItem.get("value"));//属性值
							String version = MapUtils.getString(offerProdItem, "version", "").trim();
							if(version.length()>=10){
								prodItem.put("updateTime", version.substring(0, 10));//属性修改时间
							}
							
							prodItems.add(prodItem);
						}
					}
					else{
						model.addAttribute("flag", 1);
						model.addAttribute("failInfo", serviceName+"【offerProdItems】节点，请与省内确认！");
						return "pad/product/product-detail-list";
					}
					
					model.addAttribute("prodItems", prodItems);//产品属性prodItems(List)组装完成
					
					//销售品信息dtos(List)开始组装
					ArrayList<Map<String, Object>> dtos = new ArrayList<Map<String, Object>>();
					if(result.get("offerDtos")!=null){
						ArrayList<Map<String, Object>> offerDtos = (ArrayList<Map<String, Object>>)result.get("offerDtos");
						for(int i=0;i<offerDtos.size();i++){
							Map<String, Object> dto = new HashMap<String, Object>();//这个map将组装一个销售品
							Map<String, Object> offerDto = offerDtos.get(i);
							dto.put("dtoName", offerDto.get("offerSpecName"));//销售品名称
							dto.put("dtoType", offerDto.get("offerTypeCd"));//销售品主副类型标识
							dto.put("dtoStatus", offerDto.get("stateName"));//销售品状态名
							String dtoStartDt = MapUtils.getString(offerDto, "startDt", "").trim();
							if(dtoStartDt.length()>=10){
								dto.put("startDate", dtoStartDt.substring(0, 10));//销售品生效时间
							}
							String dtoEndDt = MapUtils.getString(offerDto, "endDt", "").trim();
							if(dtoEndDt.length()>=10){
								dto.put("endDate", dtoEndDt.substring(0, 10));//销售品失效时间
							}							
							//若是主套餐需要额外带出其描述，若主套餐是融合套餐还将带出其成员产品信息
							if(("10".equals(MapUtils.getString(offerDto, "offerTypeCd")) || "11".equals(MapUtils.getString(offerDto, "offerTypeCd")))){
								dto.put("mainOfferDescription", offerDto.get("summary"));//主套餐描述
								if("Y".equals(MapUtils.getString(offerDto, "compOffer"))){
									ArrayList<Map<String, Object>> offerMembers = new ArrayList<Map<String, Object>>();//这个List将组装主副卡成员产品信息							
									Map<String, Object> dataBusMap = new HashMap<String, Object>();							
									dataBusMap.put("offerId", offerDto.get("offerId"));							
									dataBusMap.put("acctNbr", result.get("accessNumber"));							
									dataBusMap.put("areaId", result.get("areaId"));							
									dataBusMap.put("offerSpecId", offerDto.get("offerSpecId"));							
									Map<String, Object> returnMap = new HashMap<String, Object>();
									try{
										returnMap = offerBmo.queryOfferInst(dataBusMap, flowNum, sessionStaff);
										if(ResultCode.R_SUCCESS.equals(returnMap.get("code"))){
											ArrayList<Map<String, Object>> offerMemberInfos = (ArrayList<Map<String, Object>>)returnMap.get("offerMemberInfos");
											for(int j=0;j<offerMemberInfos.size();j++){
												Map<String, Object> offerMemberInfo = offerMemberInfos.get(j);
												Map<String, Object> offerMember = new HashMap<String, Object>();//这个map将组装一个成员信息
												offerMember.put("objType", MapUtils.getString(offerMemberInfo, "objType", ""));//产品类型，只有为2（接入类产品）时才需要展示这个成员
												offerMember.put("roleName", offerMemberInfo.get("roleName"));//成员角色（主/副）
												offerMember.put("accessNumber", offerMemberInfo.get("accessNumber"));//成员产品的接入号
												offerMember.put("offerName", offerDto.get("offerSpecName"));//主副卡套餐名称
												offerMember.put("areaId", result.get("areaId"));
												offerMember.put("memberProdId", offerMemberInfo.get("objInstId").toString());//成员产品ID
												model.addAttribute("prodId", param.get("prodId").toString());//该产品ID用于与主副卡成员产品ID进行比对，若相同则不添加查询详情的按钮
												offerMembers.add(offerMember);
											}
											model.addAttribute("offerMembers", offerMembers);//主副卡成员信息组装完成							
										}
										else{
											model.addAttribute("queryMembersFail", returnMap.get("msg"));//主副卡套餐成员查询失败时展示失败信息
										}
									}catch(BusinessException be){
										model.addAttribute("queryMembersFail", "异常编码："+be.getError().getCode()+"<br/>"+be.getError().getErrMsg()+"<br/>营业后台回参："+be.getResultMap());
									}catch(InterfaceException ie){
										model.addAttribute("queryMembersFail", "异常编码："+ie.getErrCode()+"<br/>营业后台的queryOfferMemberById接口服务异常，错误堆栈：<br/>"+ie.getErrStack());
									}catch(Exception e){
										model.addAttribute("queryMembersFail", "异常编码："+ErrorCode.QUERY_OFFER_PARAM+"<br/>受理门户的/prod/prodDetailQuery处理营业后台queryOfferMemberById服务的回参异常"+
												"<br/>门户入参："+dataBusMap+"<br/>后台回参："+returnMap.get("result"));
									}
								}
							}
							dtos.add(dto);
						}
					}
					else{
						model.addAttribute("flag", 1);
						model.addAttribute("failInfo", serviceName+"【offerDtos】节点，请与省内确认！");
						return "pad/product/product-detail-list";
					}
					
					model.addAttribute("dtos", dtos);//销售品信息dtos(List)组装完成
					
					//服务信息servs(List)开始组装
					ArrayList<Map<String, Object>> servs = new ArrayList<Map<String, Object>>();	
					if(result.get("offerServs")!=null){
						ArrayList<Map<String, Object>> offerServs = (ArrayList<Map<String, Object>>)result.get("offerServs");
						for(int i=0;i<offerServs.size();i++){
							Map<String, Object> serv = new HashMap<String, Object>();//这个map将组装一个服务
							Map<String, Object> offerServ = offerServs.get(i);
							Map<String, Object> servSpec = (Map<String, Object>)offerServ.get("servSpec");
							serv.put("servName", servSpec.get("name"));//服务名称
							ArrayList<Map<String, Object>> servItems = new ArrayList<Map<String, Object>>();//这个list将堆放当前服务的属性
							if(offerServ.get("offerServItems")!=null){
								ArrayList<Map<String, Object>> offerServItems = (ArrayList<Map<String, Object>>)offerServ.get("offerServItems");
								for(int j=0;j<offerServItems.size();j++){
									Map<String, Object> servItem = new HashMap<String, Object>();//这个map将组装一个属性
									Map<String, Object> offerServItem = offerServItems.get(j);
									Map<String, Object> itemSpec = (Map<String, Object>)offerServItem.get("itemSpec");
									servItem.put("itemName", itemSpec.get("name"));//当前服务属性名称
									servItem.put("itemValue", offerServItem.get("value"));//当前服务属性值
									servItems.add(servItem);
								}
							}
							serv.put("servItems", servItems);//当前服务的属性列表加入
							if(!MapUtils.getMap(offerServ, "instStatus", empty).isEmpty()){
								Map<String, Object> instStatus = (Map<String, Object>)offerServ.get("instStatus");
								serv.put("servStatus", instStatus.get("name"));//服务状态
							}
							String servBeiginDt = MapUtils.getString(offerServ, "beginDt", "").trim();
							if(servBeiginDt.length()>=10){
								serv.put("beginDate", servBeiginDt.substring(0, 10));//服务生效时间
							}
							String servEndDt = MapUtils.getString(offerServ, "endDt", "").trim();
							if(servEndDt.length()>=10){
								serv.put("endDate", servEndDt.substring(0, 10));//服务失效时间
							}
							
							servs.add(serv);
						}
					}
					else{
						model.addAttribute("flag", 1);
						model.addAttribute("failInfo", serviceName+"【offerServs】节点，请与省内确认！");
						return "pad/product/product-detail-list";
					}
															
					model.addAttribute("servs", servs);//服务信息servs(List)组装完成
					
					//物品信息coupons(List)开始组装
					ArrayList<Map<String, Object>> coupons = new ArrayList<Map<String, Object>>();
					if(result.get("offerCoupons")!=null){
						ArrayList<Map<String, Object>> offerCoupons = (ArrayList<Map<String, Object>>)result.get("offerCoupons");
						for(int n=0;n<offerCoupons.size();n++){
							Map<String, Object> coupon = new HashMap<String, Object>();//这个map将组装一个物品
							Map<String, Object> offerCoupon = offerCoupons.get(n);
							coupon.put("flowNum", offerCoupon.get("inOutNbr"));//出入库流水号
							if(!MapUtils.getMap(offerCoupon, "coupon", empty).isEmpty()){
								Map<String, Object> couponInfo = (Map<String, Object>)offerCoupon.get("coupon");
								coupon.put("couponName", couponInfo.get("name"));//物品名称
							}
							coupon.put("instNum", offerCoupon.get("couponInsNumber"));//物品实例编码
							coupon.put("num", offerCoupon.get("couponNum"));//物品数量
							coupon.put("mktResInfo", offerCoupon.get("mktResName"));//仓库信息
							
							coupons.add(coupon);
						}
					}
					else{
						model.addAttribute("flag", 1);
						model.addAttribute("failInfo", serviceName+"【offerCoupons】节点，请与省内确认！");
						return "pad/product/product-detail-list";
					}
											
					model.addAttribute("coupons", coupons);//物品信息coupons(List)组装完成
					
					//帐户信息prodAccounts(List)开始组装
					ArrayList<Map<String, Object>> prodAccounts = new ArrayList<Map<String, Object>>();
					if(result.get("offerProdAccounts")!=null){
						ArrayList<Map<String, Object>> offerProdAccounts = (ArrayList<Map<String, Object>>)result.get("offerProdAccounts");
						if(offerProdAccounts.size()<1){
							model.addAttribute("flag", 1);
							model.addAttribute("failInfo", serviceName+"【offerProdAccounts】节点或该节点为空，请与省内确认！");
							return "pad/product/product-detail-list";
						}
						for(int n=0;n<offerProdAccounts.size();n++){
							Map<String, Object> prodAccount = new HashMap<String, Object>();//这个map将组装一个帐户
							Map<String, Object> offerProdAccount = offerProdAccounts.get(n);
							if(!MapUtils.getMap(offerProdAccount, "account", empty).isEmpty()){
								Map<String, Object> account = (Map<String, Object>)offerProdAccount.get("account");
								prodAccount.put("acctCd", account.get("acctCd"));//帐户合同号
								prodAccount.put("acctName", account.get("acctName"));//帐户名称
								prodAccount.put("owner", account.get("partyName"));//帐户属主
							}
							prodAccount.put("paymentMethod", offerProdAccount.get("paymentMethod"));//支付类型
							prodAccount.put("chargeNum", offerProdAccount.get("accessNumber"));//支付号码
							prodAccount.put("accountBuilder", offerProdAccount.get("paymentAccountName"));//开户人
							prodAccount.put("bank", offerProdAccount.get("bankName"));//银行
							prodAccount.put("bankAcct", offerProdAccount.get("paymentAccount"));//银行账号
							prodAccount.put("contactPerson", offerProdAccount.get("contactName"));//联系人
							prodAccount.put("contactNum", offerProdAccount.get("contactPhone"));//联系电话
							
							prodAccounts.add(prodAccount);					
						}
					}
					else{
						model.addAttribute("flag", 1);
						model.addAttribute("failInfo", serviceName+"【offerProdAccounts】节点或该节点为空，请与省内确认！");
						return "pad/product/product-detail-list";
					}
					
					model.addAttribute("prodAccounts", prodAccounts);//帐户信息prodAccounts(List)组装完成
					
					//组合产品关联prodComps(List)开始组装
					ArrayList<Map<String, Object>> prodComps = new ArrayList<Map<String, Object>>();
					if(result.get("offerProdComps")!=null){
						ArrayList<Map<String, Object>> offerProdComps = (ArrayList<Map<String, Object>>)result.get("offerProdComps");
						for(int i=0;i<offerProdComps.size();i++){
							Map<String, Object> prodComp = new HashMap<String, Object>();//这个map将组装一个组合信息
							Map<String, Object> offerProdComp = offerProdComps.get(i);
							if(!MapUtils.getMap(offerProdComp, "compProd", empty).isEmpty()){
								Map<String, Object> compProd = (Map<String, Object>)offerProdComp.get("compProd");
								prodComp.put("compProdName", compProd.get("prodSpecName"));//组合产品名称
								prodComp.put("compProdAccNum", compProd.get("accessNumber"));//组合产品接入号
							}
							prodComp.put("memberRole", offerProdComp.get("roleName"));//成员角色
							prodComp.put("memberProdName", result.get("prodSpecName"));//成员产品名称
							prodComp.put("memberProdAccNum", result.get("accessNumber"));//成员产品接入号
							ArrayList<Map<String, Object>> prodCompItems = new ArrayList<Map<String, Object>>();//这个list将堆放当前组合产品的属性
							if(offerProdComp.get("offerProdCompItems")!=null){
								ArrayList<Map<String, Object>> offerProdCompItems = (ArrayList<Map<String, Object>>)offerProdComp.get("offerProdCompItems");
								for(int j=0;j<offerProdCompItems.size();j++){	
									Map<String, Object> prodCompItem = new HashMap<String, Object>();//这个map将组装一个属性
									Map<String, Object> offerProdCompItem = offerProdCompItems.get(j);
									Map<String, Object> itemSpec = (Map<String, Object>)offerProdCompItem.get("itemSpec");
									prodCompItem.put("itemName", itemSpec.get("name"));//组合产品属性名称
									prodCompItem.put("itemValue", offerProdCompItem.get("value"));//组合产品属性值
									prodCompItems.add(prodCompItem);
								}
								prodComp.put("compProdItems", prodCompItems);//当前组合产品的属性列表加入
								prodComps.add(prodComp);
							}
						}
					}
					else{
						model.addAttribute("flag", 1);
						model.addAttribute("failInfo", serviceName+"【offerProdComps】节点，请与省内确认！");
						return "pad/product/product-detail-list";
					}
					
					model.addAttribute("prodComps", prodComps);//组合产品关联prodComps(List)组装完成
					
					model.addAttribute("flag", 0);	
				}
				else{
					model.addAttribute("flag", 1);
					model.addAttribute("failInfo", serviceName+"【result】节点或该节点为空，请与省内确认！");
					return "pad/product/product-detail-list";
				}											
			}
			else{					
				model.addAttribute("flag", 1);
				model.addAttribute("failInfo", MapUtils.getString(resultMap, "resultMsg"));
				return "pad/product/product-detail-list";
			}
		}catch(BusinessException be){
			return super.failedStr(model, be);
		}catch(InterfaceException ie){
			return super.failedStr(model, ie, param, ErrorCode.PROD_INST_DETAIL);
		}catch(Exception e){
			Map<String, Object> interfaceIO = new HashMap<String, Object>();
			interfaceIO.put("门户入参", param);
			interfaceIO.put("后台回参", resultMap);
			return super.failedStr(model, ErrorCode.PROD_INST_DETAIL, e, interfaceIO);
		}
		return "pad/product/product-detail-list";
	}
	
	@RequestMapping(value = "prodSpecParamQuery", method = RequestMethod.GET)
    public @ResponseBody JsonResponse prodSpecParamQuery(@RequestParam Map<String, Object> paramMap, Model model,@LogOperatorAnn String flowNum){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
        try {
        	Map<String, Object> resMap = prodBmo.prodSpecParamQuery(paramMap,null,sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.ORDER_PROD_ITEM);
		} catch (Exception e) {
			return super.failed(ErrorCode.ORDER_PROD_ITEM, e, paramMap);
		}
		return jsonResponse;
	}
	
	@RequestMapping(value = "prodInstParamQuery", method = RequestMethod.GET)
    public @ResponseBody JsonResponse prodInstParamQuery(@RequestParam Map<String, Object> paramMap, Model model,@LogOperatorAnn String flowNum){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
        try {
        	Map<String, Object> resMap = prodBmo.prodInstParamQuery(paramMap,null,sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.ORDER_PROD_INST);
		} catch (Exception e) {
			return super.failed(ErrorCode.ORDER_PROD_INST, e, paramMap);
		}
		return jsonResponse;
	}
	
	@RequestMapping(value = "/changeCard", method = {RequestMethod.POST})
	public String changerCard(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {
		model.addAttribute("prodId",param.get("prodId"));
		return "pad/order/order-change-card";
	}
}
