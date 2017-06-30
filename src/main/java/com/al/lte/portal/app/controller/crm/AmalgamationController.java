package com.al.lte.portal.app.controller.crm;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.time.DateFormatUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.CommonBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.print.PrintBmo;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.Const;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.ServiceClient;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 双屏推送控制器 .
 * <BR>
 *  TODO 要点概述.
 * <P>
 * @author yangms
 * @version V1.0 2012-3-30
 * @createDate 2012-3-30 下午3:29:40
 * @modifyDate	 tang 2012-3-30 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
@Controller("com.al.lte.portal.app.controller.AmalgamationController")
@RequestMapping("/app/amalgamation/*")
@AuthorityValid(isCheck = false)
public class AmalgamationController extends BaseController {
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;
	
	@Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.CommonBmo")
    private CommonBmo commonBmo;
	
	@Resource(name = "com.al.lte.portal.bmo.print.PrintBmo")
    private PrintBmo printBmo;
	
	@Autowired
    PropertiesUtils propertiesUtils;
	
	@RequestMapping(value = "/prepare", method = RequestMethod.POST)
	@AuthorityValid(isCheck = false)
	public String prepare(@RequestBody Map<String, Object> paramMap,HttpSession session, Model model,
			HttpServletRequest request, HttpServletResponse response, @LogOperatorAnn String flowNum) {
		return "/app/amalgamation/amalgamation-prepare";
	}
	
	@RequestMapping(value = "/page_kd", method = RequestMethod.POST)
	@AuthorityValid(isCheck = false)
	public String page_kd(@RequestBody Map<String, Object> paramMap,HttpSession session, Model model,
			HttpServletRequest request, HttpServletResponse response, @LogOperatorAnn String flowNum) {
		String prodTypeStr = "prodType";
		model.addAttribute(prodTypeStr, paramMap.get(prodTypeStr));
		return "/app/amalgamation/amalgamation-broadband";
	}
	
	@RequestMapping(value = "/offerSpecList", method = RequestMethod.POST)
	@AuthorityValid(isCheck = false)
	public String offerSpecList(@RequestBody Map<String, Object> prams,HttpSession session, Model model,
			HttpServletRequest request, HttpServletResponse response, @LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		String inFluxStr = "inFlux";
		
		 try {
	        	String OfferIds = "";
//	        	prams.put("ifQS", "Y");
	        	prams.put("prodOfferFlag", "4G");
//	        	prams.put("compOfferType", "1000");
//	        	prams.put("qryStr", "");
//	        	prams.put("pnLevelId", "");
//	        	prams.put("subPage", "");
//	        	prams.put("downRate", "");
	        	prams.put("sysFlag", "10004");
	        	prams.put("channelId", sessionStaff.getCurrentChannelId());
	        	prams.put(Const.AREAID, sessionStaff.getCurrentAreaId());
//	        	prams.put("areaId", "8520000");
	        	prams.put("staffId", sessionStaff.getStaffId());
	        	prams.put("pageSize", SysConstant.PAGE_SIZE);
	        	int totalPage=0;
	        	Map<String, Object> map = null;
	   //          prams.put("qryStr", "乐享");
//	        	Map<String, Object> map1 = new HashMap();
//	        	map1.put("channelId", sessionStaff.getCurrentChannelId());
//	        	map1.put("areaId", sessionStaff.getCurrentAreaId());
//	        	map1.put("staffId", sessionStaff.getStaffId());
//	        	map1.put("custId", prams.get("custId"));
//	        	DataBus db = InterfaceClient.callService(map1,
//	    				PortalServiceCode.QUERY_MAIN_OFFER_CATEGORY, null, sessionStaff);
	        	
	        	map = orderBmo.queryMainOfferSpecList(prams,null, sessionStaff);
	        	List alldownRateList = new ArrayList();
	        	List allObjIdList = new ArrayList();
	        	if(ResultCode.R_SUCCESS.equals(map.get("code"))){
	        		//拼装前台显示的套餐详情
	        		if(!map.isEmpty()){
	        			List<Map<String,Object>> prodOfferInfosList = (List<Map<String,Object>>) map.get("prodOfferInfos");
	        			if(prodOfferInfosList.size()%10>0){
	        				totalPage=prodOfferInfosList.size()/10+1;
	        			}else{
	        				totalPage=prodOfferInfosList.size()/10;
	        			}
	        			for(int i=0;i<prodOfferInfosList.size();i++){
	        				prodOfferInfosList.get(i).put("index", i);
	        				List<Map<String,Object>> downRateList = new ArrayList();
	        				Map<String,Object> exitParam = new HashMap<String,Object>();
	        				exitParam = (Map<String,Object>) prodOfferInfosList.get(i);
	        				if(exitParam.containsKey(inFluxStr)){
	        					float influx = 0 ;
	        					String influx_str ="";
	        					/*
	        					 判断返回的流量是否大于1024M，如果大于1024M，显示的单位是G，否则显示的单位是M
	        					 */
	        					if(exitParam.get(inFluxStr)!=null){
	        						try{
	        							influx = Float.parseFloat(exitParam.get(inFluxStr).toString());
	        							if(influx<1024){
	        								influx_str = influx+"";
	        								if(influx_str.indexOf(".") > 0){  
	                    						influx_str = influx_str.replaceAll("0+?$", "");//去掉多余的0  
	                    						influx_str = influx_str.replaceAll("[.]$", "");//如最后一位是.则去掉  
	                    			        } 
	        								influx_str = influx_str+"M";
	        							}else{
	        								influx_str = influx/1024+"";
	        								if(influx_str.indexOf(".") > 0){  
	                    						influx_str = influx_str.replaceAll("0+?$", "");//去掉多余的0  
	                    						influx_str = influx_str.replaceAll("[.]$", "");//如最后一位是.则去掉  
	                    			        } 
	        								influx_str = influx_str +"G";
	        							}
	        						}catch(Exception e){
	        							this.log.error("WIFI", e);
	        						}
	        					}
	        					prodOfferInfosList.get(i).put(inFluxStr, influx_str);
	        				}
//	        				if(exitParam.containsKey("objIdList")){
	        					List<Map<String,Object>> objIdList = (List<Map<String,Object>>) exitParam.get("objIdList");
	        					allObjIdList.add(objIdList);
//	        					if(objIdList.size()>0){
//	        						model.addAttribute("objIdList",objIdList);
//	        						for(int q=0;q<objIdList.size();q++){
//	        							Map<String,Object> obj = objIdList.get(q);
//	        							if("10200001".equals(obj.get("compTypeCd"))){
//	        								prodOfferInfosList.get(i).put("compTypeCd", obj.get("compTypeCd"));
//	                						prodOfferInfosList.get(i).put("objId", obj.get("objId"));
//	                						prodOfferInfosList.get(i).put("roleCd", obj.get("roleCd"));
//	                						prodOfferInfosList.get(i).put("prodNbr", obj.get("prodNbr"));
//	        							}
//	        						}
//	        					}
//	        				}
	        				
	        				if(exitParam.containsKey("downRateList")){
	        					downRateList = (List<Map<String,Object>>) exitParam.get("downRateList");
	        				}
	        				alldownRateList.add(downRateList);
	        			}
	        		}
	        		model.addAttribute("alldownRateList", JsonUtil.buildNormal().objectToJson(alldownRateList));
	        		model.addAttribute("resultlst", map.get("prodOfferInfos"));
	        		model.addAttribute("totalPage",totalPage);
	        		model.addAttribute("offerType",prams.get("offerType"));
	        		model.addAttribute("allObjIdList",JsonUtil.buildNormal().objectToJson(allObjIdList));
	        	}
	        	//model.addAttribute("pnLevelId", prams.get("pnLevelId"));
//	        	if(!"".equals(prams.get("subPage"))){
//	        		model.addAttribute("subPage", prams.get("subPage"));
//	        	}
//	        	if(null!=(prams.get("orderflag"))){
//	        		model.addAttribute("orderflag", prams.get("orderflag"));
//	        	}
//	        	if(null!=(prams.get("actionFlag"))){
//	        		model.addAttribute("actionFlag", prams.get("actionFlag"));
//	        	}
	        } catch (BusinessException be) {
				this.log.error("查询号码信息失败", be);
				return super.failedStr(model, be);
			} catch (InterfaceException ie) {
				return super.failedStr(model, ie, prams, ErrorCode.QUERY_MAIN_OFFER);
			} catch (Exception e) {
				return super.failedStr(model, ErrorCode.QUERY_MAIN_OFFER, e, prams);
			}
		return "/app/amalgamation/amalgamation-offerList";
	}
	
	/**
	 * 手机客户端-宽带甩单资源查询
	 * @param params
	 * @param request
	 * @param model
	 * @param session
	 * @return
	 * @throws AuthorityException
	 */
	@RequestMapping(value = "/searchADD", method = RequestMethod.POST)
    @AuthorityValid(isCheck = false)
    public String broadband_searchADD(@RequestBody Map<String, Object> params, HttpServletRequest request,Model model,HttpSession session) throws AuthorityException {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		String regionNameStr = "regionName";
		String prodTypeStr = "prodType";
		String parentAreaIdStr = "parentAreaId";
		String dataDimensionCdStr = "dataDimensionCd";
		String commonRegionIdStr = "commonRegionId";
		String areaNameStr = "areaName";
		String areaLimitStr = "areaLimit";
		String APPDESCStr = "APPDESC";
		
		String areaLimit = params.get(areaLimitStr)==null?"":params.get(areaLimitStr).toString();
		String urlType = "/app/order/prodoffer/prepare";
		String cityid = sessionStaff.getAreaId();//市
		String proid = cityid.substring(0, 3) + "0000";//省
		String areaid = sessionStaff.getCurrentAreaId();//区
		cityid = areaid.substring(0, 5) + "00";//市
		params.put("leve", 2);
		params.put(parentAreaIdStr, "");//8100000
		params.put(areaLimitStr, areaLimit);
		params.put("channelAreaId", areaid);
		params.put(APPDESCStr, propertiesUtils.getMessage(SysConstant.APPDESC));
		model.addAttribute(prodTypeStr,params.get(prodTypeStr));
		try{
			
			params.put(dataDimensionCdStr, MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),SysConstant.AREA_DIMENSION_CD));
			String operateSpecInfo = EhcacheUtil.getOperateSpecInfo(session, urlType);
			List<Map<String, Object>> list = CommonMethods.getAreaRangeList(sessionStaff, params, operateSpecInfo);
			if(list.size()==0){
				Map<String, Object> mapProv = CommonMethods.getAreaInfo(proid);
				mapProv.put(commonRegionIdStr, mapProv.get(Const.AREAID));
				mapProv.put("areaLevel", "3");
				mapProv.put(regionNameStr, mapProv.get(areaNameStr));
				list.add(mapProv);
			}
			model.addAttribute("province", list);
			model.addAttribute("proid", proid);
			
			Map<String,Object> paramCity = new HashMap<String,Object>();
			paramCity.put("leve", "3");
			paramCity.put(parentAreaIdStr, proid);
			paramCity.put("isChannelArea", "N");
			paramCity.put(APPDESCStr, propertiesUtils.getMessage(SysConstant.APPDESC));
			paramCity.put(dataDimensionCdStr, MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),SysConstant.AREA_DIMENSION_CD));
			String cityoperateSpecInfo = EhcacheUtil.getOperateSpecInfo(session, urlType);
			List<Map<String, Object>> citylist = CommonMethods.getAreaRangeList(sessionStaff, paramCity, cityoperateSpecInfo);
			if(citylist.size()==0 && !cityid.equals(proid)){
				Map<String, Object> mapCity = CommonMethods.getAreaInfo(cityid);
				mapCity.put(commonRegionIdStr, mapCity.get(Const.AREAID));
				mapCity.put(regionNameStr, mapCity.get(areaNameStr));
				citylist.add(mapCity);
			}
			model.addAttribute("citylist", citylist);
			model.addAttribute("cityid", cityid);
			
			Map<String,Object> paramChild = new HashMap<String,Object>();
			paramChild.put("leve", "4");
			paramChild.put(parentAreaIdStr, cityid);
			paramChild.put("isChannelArea", "N");
			paramChild.put(APPDESCStr, propertiesUtils.getMessage(SysConstant.APPDESC));
			paramChild.put(dataDimensionCdStr, MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),SysConstant.AREA_DIMENSION_CD));
			String childoperateSpecInfo = EhcacheUtil.getOperateSpecInfo(session, urlType);
			List<Map<String, Object>> childlist = CommonMethods.getAreaRangeList(sessionStaff, paramChild, childoperateSpecInfo);
			if(childlist.size()==0 && !areaid.equals(cityid)){
				Map<String, Object> mapArea = CommonMethods.getAreaInfo(areaid);
				mapArea.put(commonRegionIdStr, mapArea.get(Const.AREAID));
				mapArea.put(regionNameStr, mapArea.get(areaNameStr));
				childlist.add(mapArea);
			}
			model.addAttribute("childlist", childlist);
			model.addAttribute(Const.AREAID, areaid);
			
		} catch (BusinessException be) {

			return super.failedStr(model, be);
		} catch (InterfaceException ie) {

			return super.failedStr(model, ie, params, ErrorCode.OPERAT_AREA_RANGE);
		} catch (Exception e) {
			log.error("加载地区方法异常", e);
			return super.failedStr(model, ErrorCode.OPERAT_AREA_RANGE, e, params);
		}
       return "/app/amalgamation/amalgamation-searchADD";
    }
	
	/**
	 * 手机客户端-订单确认页面
	 * @param params
	 * @param request
	 * @param model
	 * @param session
	 * @return
	 * @throws AuthorityException
	 */
	@RequestMapping(value = "/confirm", method = RequestMethod.POST)
    @AuthorityValid(isCheck = false)
    public String amalgamationConfirm(@RequestBody Map<String, Object> params, String optFlowNum, HttpServletRequest request,Model model,HttpSession session) throws AuthorityException {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		try {
			String AppKey = SysConstant.CSB_SRC_SYS_ID_APP;
			String ymdStr = DateFormatUtils.format(new Date(), "yyyyMMdd");
			String str10 = "";
			String nonce = RandomStringUtils.randomNumeric(5); //随机字符串
			DataBus _db = null;
			_db = ServiceClient.callService(new HashMap(), PortalServiceCode.SERVICE_GET_LOG_SEQUENCE, null, sessionStaff);
			str10 = nonce + String.format("%05d", _db.getReturnlmap().get("logSeq"));
			String TransactionID = AppKey+ymdStr+str10;
			model.addAttribute("TransactionID",TransactionID);
				String cityid = sessionStaff.getCurrentAreaId();//市
				params.put(Const.AREAID, cityid);
//				params.put("areaId", "8410100");
				List feelList = new ArrayList();
				rMap = orderBmo.queryChargeConfig(params,optFlowNum, sessionStaff);
				if("0".equals(rMap.get("resultCode"))){
					Map result = (Map) rMap.get("result");
					if(result!=null){
						feelList = (List) result.get("chargeItems");
					}
//					System.out.println("++++++++++++orderList="+db.getReturnlmap().toString());
				}
				model.addAttribute("feelList",feelList);
				model.addAttribute("fee_list",JsonUtil.buildNormal().objectToJson(feelList));
			}
		catch (BusinessException be) {

			return super.failedStr(model, be);
		} catch (InterfaceException ie) {

			return super.failedStr(model, ie, params, ErrorCode.CHARGE_ADDITEM);
		} 
		catch (Exception e) {
			log.error("渠道查询查询/app/amalgamation/comfirm方法异常", e);
			return super.failedStr(model, ErrorCode.CHARGE_ADDITEM, e, params);
		}
		model.addAttribute("params",params);
		return "/app/amalgamation/amalgamation-comfirm";
    }
	
	 /**
		 * 手机客户端-融合新装-回执信息
		 * @param params
		 * @param request
		 * @param model
		 * @param session
		 * @return
		 * @throws AuthorityException
		 */
		@RequestMapping(value = "/getVoucherData", method = RequestMethod.POST)
		public @ResponseBody JsonResponse getVoucherData(@RequestBody Map<String, Object> reqMap, String optFlowNum,
				HttpServletResponse response,HttpServletRequest request){
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
	                SysConstant.SESSION_KEY_LOGIN_STAFF);
//			String cityid = sessionStaff.getAreaId();//市
//			cityid = cityid.substring(0, 5) + "00";//市
//			reqMap.put("areaId", cityid);
			String signFlagStr = "signFlag";
			JsonResponse jsonResponse = null;
				try {
					String busiType = MapUtils.getString(reqMap, "busiType");
					String printType = MapUtils.getString(reqMap, "printType");
					String agreement = MapUtils.getString(reqMap, "needAgreement");
					String signFlag = MapUtils.getString(reqMap, signFlagStr);//0:打印 1:数字签名预览 2:生成pdf保存 3:生成未签名的pdf文件保存 4:手机端数字签名预览 5:保存客手机端的pdf文件
					if(signFlag==null){
						signFlag="0";
					}
					boolean needAgreement = SysConstant.STR_Y.equals(agreement);
					Map<String,Object> params=new HashMap<String,Object>();
					params.putAll(reqMap);
					params.put(signFlagStr, SysConstant.PREVIEW_SIGN_PDF);
					if(params.get("signStr")!=null){
						params.remove("signStr");
					}
					if(params.get(signFlagStr)!=null){
						params.remove(signFlagStr);
					}
					Map<String, Object> printData = new HashMap<String, Object>();
					DataBus db = InterfaceClient.callService(params,PortalServiceCode.INTF_GET_VOUCHER_DATA,optFlowNum, sessionStaff);
					printData = db.getReturnlmap();
					if(ResultCode.R_SUCC.equals(db.getResultCode())) {
		 				jsonResponse = super.successed(printData,ResultConstant.SUCCESS.getCode());
		 			}else{
		 				jsonResponse = super.failed(ErrorCode.PRINT_VOUCHER, printData, reqMap);
					}
		        }catch (Exception e) {
					return super.failed(ErrorCode.PRINT_VOUCHER, e, reqMap);
				}
				return jsonResponse;
		}
}
