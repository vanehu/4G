package com.al.lte.portal.controller.crm;

import com.al.common.utils.StringUtil;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.entity.PageModel;
import com.al.ecs.common.util.*;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.*;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.CustBmo;
import com.al.lte.portal.bmo.crm.MktResBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.*;
import com.al.lte.portal.model.SessionStaff;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.text.SimpleDateFormat;
import java.util.*;

@Controller("com.al.lte.portal.controller.crm.CustController")
@RequestMapping("/cust/*")
@AuthorityValid(isCheck = false)
public class CustController extends BaseController {

	@Autowired
	PropertiesUtils propertiesUtils;
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CustBmo")
	private CustBmo custBmo;
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
	private StaffBmo staffBmo;
	@Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
    private OrderBmo orderBmo;
	@Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.MktResBmo")
    private MktResBmo mktResBmo;

	@RequestMapping(value = "/queryCust", method = { RequestMethod.POST })
    public String queryCust(@RequestBody Map<String, Object> paramMap, Model model,@LogOperatorAnn String flowNum,
            HttpServletResponse response,HttpSession httpSession,HttpServletRequest request) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		if(sessionStaff == null){
			return "/cust/cust-list";
		}
		String areaId = (String) paramMap.get("areaId");
		try{
			//记录表SP_BUSI_RUN_LOG
			String custlogflag = MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"CUSTLOGFLAG");
			if("ON".equals(custlogflag)){
				Map<String, Object> logmap = new HashMap<String, Object>();
				logmap.put("STAFF_CODE", sessionStaff.getStaffCode());
				logmap.put("STAFF_ID", sessionStaff.getStaffId());
				logmap.put("SALES_CODE", sessionStaff.getSalesCode());
				logmap.put("HOST_IP", CommonUtils.getAllAddrPart());
				logmap.put("SESSIONINFO", "");
				logmap.put("STATUS_CD", "客户定位");
				logmap.put("INTF_URL", "service/intf.custService/queryCust");
				logmap.put("IDENTIDIES_TYPE", paramMap.get("identidies_type").toString());
				logmap.put("IDENTITY_NUM", (String) (paramMap.get("acctNbr")==""?paramMap.get("identityNum")==""?paramMap.get("queryTypeValue"):paramMap.get("identityNum"):paramMap.get("acctNbr")));
				logmap.put("OPERATION_PLATFORM", SysConstant.APPDESC_LTE);
				logmap.put("ACTION_IP", ServletUtils.getIpAddr(request));
				logmap.put("CHANNEL_ID", sessionStaff.getCurrentChannelId());
				logmap.put("OPERATORS_ID", sessionStaff.getOperatorsId());
				logmap.put("AREA_ID", areaId);
				logmap.put("IN_PARAM", JsonUtil.toString(paramMap));
				staffBmo.insert_sp_busi_run_log(logmap,flowNum,sessionStaff);
			}
		}catch (Exception e) {
			//异常在之前就捕获了，这里不做处理
		}
		
		try{
			//访问次数限制  update by huangjj3 20160411 通过过滤器对过频操作进行限制
			/*model.addAttribute("showVerificationcode", "N");
			long endTime = System.currentTimeMillis();
			long beginTime = 0;
			if(httpSession.getAttribute(sessionStaff.getStaffCode()+"custtime")!=null){
				beginTime = (Long) httpSession.getAttribute(sessionStaff.getStaffCode()+"custtime");
			}
			if(beginTime!=0){
				Date beginDate = new Date(beginTime);
				Date endDate = new Date(endTime);
				long useTime = endDate.getTime()-beginDate.getTime();
				long limit_time = Long.parseLong(MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"LIMIT_TIME"));
				int limit_count = Integer.parseInt(MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"LIMIT_COUNT"));
				if (useTime<=limit_time){
					int count = (Integer) httpSession.getAttribute(sessionStaff.getStaffCode()+"custcount")+1;
					if(count<limit_count){
						httpSession.setAttribute(sessionStaff.getStaffCode()+"custcount", count);
					}else if(count==limit_count){
						httpSession.setAttribute(sessionStaff.getStaffCode()+"custcount", count);
						model.addAttribute("showVerificationcode", "Y");
					}else if(count>limit_count){
						httpSession.setAttribute(sessionStaff.getStaffCode()+"custcount", count);
						if(httpSession.getAttribute(sessionStaff.getStaffCode()+"custcount")!=null){
							model.addAttribute("showVerificationcode", "Y");
							return "/cust/cust-list";
						}
					}
				}else{
					httpSession.setAttribute(sessionStaff.getStaffCode()+"custtime", endTime);
					httpSession.setAttribute(sessionStaff.getStaffCode()+"custcount", 1);
				}
			}else{
				httpSession.setAttribute(sessionStaff.getStaffCode()+"custtime", endTime);
				httpSession.setAttribute(sessionStaff.getStaffCode()+"custcount", 1);
			}*/
		}catch (Exception e) {
			// TODO: handle exception
		}
		
		Map resultMap =new HashMap();
		httpSession.setAttribute("ValidateAccNbr", null);
		httpSession.setAttribute("ValidateProdPwd", null);
		httpSession.setAttribute("queryCustAccNbr", paramMap.get("acctNbr"));
		
		String diffPlace=MapUtils.getString(paramMap, "diffPlace","");
		String flag = propertiesUtils.getMessage(SysConstant.CHECKAREAIDFLAG);
		if(SysConstant.ON.equals(flag)){
			if("local".equals(diffPlace)){//如果是本地业务，判断传过来的地区是不是受理地区
				try {
					String isCheckFlag= staffBmo.checkByAreaId(areaId,sessionStaff);
					if(!"0".equals(isCheckFlag)){
						//记录日志
						//记录表SP_BUSI_RUN_LOG
						String custlogflag = MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"CUSTLOGFLAG");
						if("ON".equals(custlogflag)){
							Map<String, Object> logmap = new HashMap<String, Object>();
							logmap.put("STAFF_CODE", sessionStaff.getStaffCode());
							logmap.put("STAFF_ID", sessionStaff.getStaffId());
							logmap.put("SALES_CODE", sessionStaff.getSalesCode());
							logmap.put("HOST_IP", CommonUtils.getAllAddrPart());
							logmap.put("SESSIONINFO", "");
							logmap.put("STATUS_CD", "客户定位传入的areaID被篡改areaId+"+areaId);
							logmap.put("INTF_URL", "service/intf.custService/queryCust");
							logmap.put("IDENTIDIES_TYPE", paramMap.get("identidies_type").toString());
							logmap.put("IDENTITY_NUM", (String) (paramMap.get("acctNbr")==""?paramMap.get("identityNum")==""?paramMap.get("queryTypeValue"):paramMap.get("identityNum"):paramMap.get("acctNbr")));
							logmap.put("OPERATION_PLATFORM", SysConstant.APPDESC_LTE);
							logmap.put("ACTION_IP", ServletUtils.getIpAddr(request));
							logmap.put("CHANNEL_ID", sessionStaff.getCurrentChannelId());
							logmap.put("OPERATORS_ID", sessionStaff.getOperatorsId());
							logmap.put("AREA_ID", areaId);
							logmap.put("IN_PARAM", JsonUtil.toString(paramMap));
							staffBmo.insert_sp_busi_run_log(logmap,flowNum,sessionStaff);
						}
						model.addAttribute("showDiffcode", "Y");
						return "/cust/cust-list";
					}
				} catch (Exception e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
		}
		
		//判断是否只能进行本地定位
/*		String diffPlace=(String) param.get("diffPlace");
		if(diffPlace.equals("local")){
			param.put("areaId", sessionStaff.getCurrentAreaId());
		}*/
		//客户鉴权跳过 权限查询
//		String iseditOperation= (String)ServletUtils.getSessionAttribute(super.getRequest(),
//				SysConstant.SESSION_KEY_JUMPAUTH+"_"+sessionStaff.getStaffId());
		String iseditOperation = null; //存在多次定位客户时，有时不显示跳过检验按钮的问题；尝试每次都调用接口重新获取权限；
		try{
 			if(iseditOperation==null){
 				iseditOperation=staffBmo.checkOperatSpec(SysConstant.JUMPAUTH_CODE,sessionStaff);
 				ServletUtils.setSessionAttribute(super.getRequest(),
 						SysConstant.SESSION_KEY_JUMPAUTH+"_"+sessionStaff.getStaffId(), iseditOperation);
 			}
			} catch (BusinessException e) {
				iseditOperation="1";
	 		} catch (InterfaceException ie) {
	 			iseditOperation="1";
			} catch (Exception e) {
				iseditOperation="1";
			}
		model.addAttribute("jumpAuthflag", iseditOperation);

		String qryAcctNbr=MapUtils.getString(paramMap,"acctNbr","");
		String soNbr=MapUtils.getString(paramMap,"soNbr","");
		if(("").equals(areaId)||areaId==null){
			paramMap.put("areaId", sessionStaff.getCurrentAreaId());
		}
		paramMap.put("staffId", sessionStaff.getStaffId());
		if(paramMap.get("custQueryType")!=null&&!paramMap.get("custQueryType").equals("")){
			httpSession.setAttribute("custQueryType", paramMap.get("custQueryType"));
		}else{
			httpSession.setAttribute("custQueryType", "");
		}
		//update by huangjj3 异地业务加上权限判断
		String DiffPlaceFlag = (String) (httpSession.getAttribute(SysConstant.SESSION_KEY_DIFFPLACEFLAG)==null?"": httpSession.getAttribute(SysConstant.SESSION_KEY_DIFFPLACEFLAG));
		if("diff".equals(DiffPlaceFlag)){
			try {
				String isCheckFlag=staffBmo.checkOperatSpec(SysConstant.YDBHK,sessionStaff);
				if(!"0".equals(isCheckFlag)){
					model.addAttribute("showDiffcode", "Y");
					return "/cust/cust-list";
				}
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		List custInfos = new ArrayList();
		try {
			String regex = "^[A-Za-z0-9]+$";
			String identityCd = (String) paramMap.get("identityCd");
			// 军人身份证和组织机构代码正则验证与其它不一样
			if ("2".equals(identityCd)) {
				regex = "^[A-Za-z0-9\u4e00-\u9fa5]+$";
			}
			if ("15".equals(identityCd)) {
				regex = "^[A-Za-z0-9-]+$";
			}
			String num = (String) (paramMap.get("acctNbr")==""?paramMap.get("identityNum")==""?paramMap.get("queryTypeValue"):paramMap.get("identityNum"):paramMap.get("acctNbr"));
			if(!num.matches(regex)){
				return "/cust/cust-list";
			}
			resultMap = custBmo.queryCustInfo(paramMap,
					flowNum, sessionStaff);
			if (MapUtils.isNotEmpty(resultMap)) {
				custInfos=(List<Map<String, Object>>) resultMap.get("custInfos");
				if(!MapUtils.getString(paramMap,"queryTypeValue","").equals("") && !MapUtils.getString(paramMap,"queryType","").equals("")){
					sessionStaff.setCardNumber(String.valueOf(paramMap.get("queryTypeValue")));
					sessionStaff.setCardType(String.valueOf(paramMap.get("queryType")));
				}else if(!paramMap.get("identityNum").equals("") && !paramMap.get("identityCd").equals("")){
					sessionStaff.setCardNumber(String.valueOf(paramMap.get("identityNum")));
					sessionStaff.setCardType(String.valueOf(paramMap.get("identityCd")));
				}
				sessionStaff.setInPhoneNum(String.valueOf(paramMap.get("acctNbr")));
				httpSession.setAttribute("pointareaId", areaId);
				model.addAttribute("custInfoSize", custInfos.size());
				if(custInfos.size()>0){
					Map custInfo =(Map)custInfos.get(0);
					String idCardNumber = (String) custInfo.get("idCardNumber");
					
					sessionStaff.setCustId(String.valueOf(custInfo.get("custId")));
					sessionStaff.setCardNumber(idCardNumber);
					sessionStaff.setCardType(String.valueOf(custInfo.get("identityCd")));
					sessionStaff.setPartyName(String.valueOf(custInfo.get("partyName")));
					sessionStaff.setCustSegmentId(String.valueOf(custInfo.get("segmentId")));
					sessionStaff.setCN(String.valueOf(custInfo.get("CN")));
					
					//在session中保存查询出的所有待选的原始客户信息
					Map<String, Map> listCustInfos = (Map<String, Map>) httpSession.getAttribute(SysConstant.SESSION_LIST_CUST_INFOS);
					if(listCustInfos == null){
						listCustInfos = new HashMap<String, Map>();
						httpSession.setAttribute(SysConstant.SESSION_LIST_CUST_INFOS, listCustInfos);
					}
					ServletUtils.setSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_AREA+"_"+sessionStaff.getStaffId(), custInfo.get("areaId"));
					List<String> custIds = new ArrayList<String>();
					//脱敏
					for(int i = 0; i < custInfos.size(); i++){
						Map tmpCustInfo =(Map)custInfos.get(i);
						listCustInfos.put(MapUtils.getString(tmpCustInfo,"custId",""), tmpCustInfo);
						
						String tmpIdCardNumber = (String) tmpCustInfo.get("idCardNumber");
						tmpCustInfo.put("filterIdCardNumber", tmpIdCardNumber);
						if (tmpIdCardNumber != null && tmpIdCardNumber.length() == 18) {
							String preStr = tmpIdCardNumber.substring(0, 6);
							String subStr = tmpIdCardNumber.substring(14);
							tmpIdCardNumber = preStr + "********" + subStr;
							tmpCustInfo.put("filterIdCardNumber", tmpIdCardNumber);
						} else if (tmpIdCardNumber != null && tmpIdCardNumber.length() == 15) {
							String preStr = tmpIdCardNumber.substring(0, 5);
							String subStr = tmpIdCardNumber.substring(13);
							tmpIdCardNumber = preStr + "********" + subStr;
							tmpCustInfo.put("filterIdCardNumber", tmpIdCardNumber);
						}
						custIds.add(MapUtils.getString(tmpCustInfo,"custId",""));
					}
					//增加客户定位的证件标识用于星级服务
					if("".equals(String.valueOf(paramMap.get("identityCd"))) && "".equals(String.valueOf(paramMap.get("queryType")))){//表示接入号定位
						sessionStaff.setCustType("11");
					}else{
						sessionStaff.setCustType("15");
					}
					//若省份只返回了一条客户信息，则与原有接口无差异。若省份返回了多条客户信息，则前台需要再次调用后台的新提供的接口，来查询客户下的接入号信息，并拼装报文，按客户ID和接入号逐条展示客户信息
					if(custInfos.size() >= 1){
						Map<String, Object> accNbrParamMap = new HashMap<String, Object>();
						accNbrParamMap.put("areaId", paramMap.get("areaId"));
						accNbrParamMap.put("custIds", custIds);
						Map accNbrResultMap = new HashMap();
						//如果使用接入号定位客户，不需求去调用根据客户查询接入号接口
						if (!(custInfos.size() == 1 && StringUtils.isBlank(identityCd) && StringUtils.isNotBlank(qryAcctNbr))) {
							accNbrResultMap = custBmo.queryAccNbrByCust(accNbrParamMap, flowNum, sessionStaff);
						}

						List custInfosWithNbr = null;
						if (MapUtils.isNotEmpty(accNbrResultMap)) {
							custInfosWithNbr = new ArrayList();
							List<Map<String, Object>> accNbrCustInfos = (List<Map<String, Object>>) accNbrResultMap.get("custInfos");
							for(Object tmpCustInfo : custInfos){
								Map custInfoMap = (Map)tmpCustInfo;
								String custId = MapUtils.getString(custInfoMap,"custId","");
								
								List<Map<String, Object>> accNbrs = null;
								for(Map<String, Object> accNbrCustInfo : accNbrCustInfos){
									if(custId.equals(MapUtils.getString(accNbrCustInfo,"custId",""))){
										accNbrs = (List<Map<String, Object>>) accNbrCustInfo.get("accNbrInfos");
										break;
									}
								}
								
								if(accNbrs != null && accNbrs.size() != 0){
									for(Map<String, Object> accNbrMap : accNbrs){
										String accNbr = MapUtils.getString(accNbrMap, "accNbr", "");
										Map newCustInfoMap = new HashMap(custInfoMap);
										newCustInfoMap.put("accNbr", accNbr);
										if(StringUtils.isNotBlank(qryAcctNbr)&&!qryAcctNbr.equals(accNbr))
											continue;
										addAccountAndCustInfo(flowNum, sessionStaff, areaId, custId, accNbr, soNbr, newCustInfoMap);
										custInfosWithNbr.add(newCustInfoMap);
									}
									if (custInfosWithNbr.size()==0&&StringUtils.isNotBlank(qryAcctNbr)) {
										Map newCustInfoMap = new HashMap(custInfoMap);
										newCustInfoMap.put("accNbr", qryAcctNbr);
										addAccountAndCustInfo(flowNum, sessionStaff, areaId, custId, qryAcctNbr, soNbr, newCustInfoMap);
										custInfosWithNbr.add(newCustInfoMap);
									}
								} else {
									custInfosWithNbr.add(custInfoMap);
								}
							}
						} else {//调用后台service/intf.custService/queryAccNbrByCust接口未返回接入号的情况
							custInfosWithNbr = new ArrayList();
							for (Object info : custInfos) {
								Map custInfoMap = (Map) info;
								Map newCustInfoMap = new HashMap(custInfoMap);
								newCustInfoMap.put("accNbr", qryAcctNbr);
								String custId = MapUtils.getString(custInfoMap, "custId", "");
								addAccountAndCustInfo(flowNum, sessionStaff, areaId, custId, qryAcctNbr, soNbr, newCustInfoMap);
								custInfosWithNbr.add(newCustInfoMap);
							}
						}
						resultMap.put("custInfos", custInfosWithNbr);
						model.addAttribute("custInfoSize", custInfosWithNbr.size());
						model.addAttribute("query", paramMap.get("query"));  //综合查询调用标志
						if(custInfosWithNbr.size()>1){
							model.addAttribute("multiCust", "Y");  //多客户标识
						}

						PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(1, 10, custInfosWithNbr.size(),custInfosWithNbr);
			    		model.addAttribute("pageModel", pm);
					}
					
				}else{
					/*int count = (Integer) httpSession.getAttribute(sessionStaff.getStaffCode()+"custcount")+10;
					httpSession.setAttribute(sessionStaff.getStaffCode()+"custcount", count);*/
				}
				model.addAttribute("cust", resultMap);

			}else{
				/*int count = (Integer) httpSession.getAttribute(sessionStaff.getStaffCode()+"custcount")+10;
				httpSession.setAttribute(sessionStaff.getStaffCode()+"custcount", count);*/
			}
			if(paramMap.containsKey("query")){	
				model.addAttribute("query", paramMap.get("query"));  //综合查询调用标志
			}
			//日志平台busi_run_nbr字段
			String log_busi_run_nbr = UIDGenerator.getRand();
			ServletUtils.getSession(request).setAttribute(SysConstant.LOG_BUSI_RUN_NBR, log_busi_run_nbr);
			long Time = Calendar.getInstance().getTimeInMillis();
			SimpleDateFormat dateFormate = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");//输出的日期格式
			String locateDate=dateFormate.format(Time);
			staffBmo.userSearchbtn(locateDate, null, sessionStaff);//定位客户记录日志
			ServletUtils.removeSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_AGREEMENT+"_"+sessionStaff.getStaffId());
			ServletUtils.removeSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_TERMINAL+"_"+sessionStaff.getStaffId());
			ServletUtils.removeSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_NUMBER+"_"+sessionStaff.getStaffId());
			if(null!=paramMap.get("pageType") && !("").equals(paramMap.get("pageType")) && ("orderUndo").equals(paramMap.get("pageType"))){
				return "/orderUndo/cust-list";	
			}
			return "/cust/cust-list";
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			
			return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_CUST);
		} catch (Exception e) {
			
			return super.failedStr(model, ErrorCode.QUERY_CUST, e, paramMap);
		}
	}

	/**
	 * 添加账户信息和使用人信息
	 * @param flowNum
	 * @param sessionStaff
	 * @param areaId
	 * @param custId
	 * @param accNbr
	 * @param newCustInfoMap
	 * @throws Exception
	 */
	private void addAccountAndCustInfo(String flowNum, SessionStaff sessionStaff, String areaId, String custId, String accNbr, String soNbr, Map newCustInfoMap) throws Exception {
		if (isGovCust(flowNum,newCustInfoMap, sessionStaff)) {
			//账户和使用人信息查询
			Map<String, Object> auParam = new HashMap<String, Object>();
			auParam.put("areaId", areaId);
			auParam.put("acctNbr", accNbr);
			auParam.put("custId", custId);
			auParam.put("queryType", "1,2,3,4,5");
			if (StringUtils.isBlank(soNbr)) {
				soNbr = System.currentTimeMillis() + String.format("%03d", (int) (Math.random() * 1000));
			}
			auParam.put("soNbr", soNbr);
			auParam.put("type", "2");
			Map<String, Object> auMap = new HashMap<String, Object>();
			if (SysConstant.ON.equals(propertiesUtils.getMessage("GOV_" + areaId.substring(0, 3)))) {
				auMap = custBmo.queryAccountAndUseCustInfo(auParam, flowNum, sessionStaff);
			}
			if (MapUtils.isNotEmpty(auMap)) {
				Map<String, Object> aMap = MapUtils.getMap(auMap, "account");
				Map<String, Object> iMap = MapUtils.getMap(auMap, "identity");
				newCustInfoMap.put("userIdentityCd", MapUtils.getString(iMap, "identityTypeCd"));
				newCustInfoMap.put("userIdentityName", MapUtils.getString(iMap, "identityName"));
				newCustInfoMap.put("userIdentityNum", MapUtils.getString(iMap, "identityNum"));
				newCustInfoMap.put("accountName", MapUtils.getString(aMap, "accountName"));
				newCustInfoMap.put("userName", MapUtils.getString(auMap, "useCustName"));
				newCustInfoMap.put("userCustId", MapUtils.getString(auMap, "useCustId"));
				newCustInfoMap.put("isSame", MapUtils.getString(auMap, "isSame"));
			}
		}

	}

	/**
	 * 判断客户是否是政企客户
	 * @param flowNum
	 * @param newCustInfoMap
	 * @param sessionStaff
     * @return
     */
	private boolean isGovCust(String flowNum, Map newCustInfoMap, SessionStaff sessionStaff) {
		boolean isGov = false;
		Map<String, Object> param = new HashMap<String, Object>();
		param.put("partyTypeCd", 2);
		Map<String, Object> rMap;
		String identityCd = MapUtils.getString(newCustInfoMap, "identityCd", "");
		try {
			rMap = this.custBmo.queryCertType(param, flowNum, sessionStaff);
			List<Map<String, Object>> govMap = (List<Map<String, Object>>) rMap.get("result");
			for (Map<String, Object> map : govMap) {
				if (identityCd.equals(MapUtils.getString(map, "certTypeCd", ""))) {
					isGov = true;
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return isGov;
	}

	@RequestMapping(value = "/queryCustSub", method = { RequestMethod.POST })
    public String queryCustSub(@RequestBody Map<String, Object> paramMap, Model model,@LogOperatorAnn String flowNum,
            HttpServletResponse response,HttpSession httpSession,HttpServletRequest request) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		try{
			//记录表SP_BUSI_RUN_LOG
			String custlogflag = MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"CUSTLOGFLAG");
			if("ON".equals(custlogflag)){
				Map<String, Object> logmap = new HashMap<String, Object>();
				logmap.put("STAFF_CODE", sessionStaff.getStaffCode());
				logmap.put("SESSIONINFO", "");
				logmap.put("STATUS_CD", "客户定位");
				logmap.put("STAFF_ID", sessionStaff.getStaffId());
				logmap.put("SALES_CODE", sessionStaff.getSalesCode());
				logmap.put("HOST_IP", CommonUtils.getSerAddrPart());
				logmap.put("INTF_URL", "service/intf.custService/queryCust");
				logmap.put("IDENTIDIES_TYPE", paramMap.get("identidies_type").toString());
				logmap.put("IDENTITY_NUM", (String) (paramMap.get("acctNbr")==""?paramMap.get("identityNum")==""?paramMap.get("queryTypeValue"):paramMap.get("identityNum"):paramMap.get("acctNbr")));
				logmap.put("OPERATION_PLATFORM", SysConstant.APPDESC_LTE);
				logmap.put("ACTION_IP", sessionStaff.getIp());
				logmap.put("CHANNEL_ID", sessionStaff.getCurrentChannelId());
				logmap.put("OPERATORS_ID", sessionStaff.getOperatorsId());
				logmap.put("AREA_ID", sessionStaff.getCurrentAreaId());
				logmap.put("IN_PARAM", JsonUtil.toString(paramMap));
				staffBmo.insert_sp_busi_run_log(logmap,flowNum,sessionStaff);
			}
		}catch (Exception e) {
			//异常在之前就捕获了，这里不做处理
		}
		try{
			//访问次数限制
			model.addAttribute("showVerificationcode", "N");
			long endTime = System.currentTimeMillis();
			long beginTime = 0;
			if(httpSession.getAttribute(sessionStaff.getStaffCode()+"custtime")!=null){
				beginTime = (Long) httpSession.getAttribute(sessionStaff.getStaffCode()+"custtime");
			}
			if(beginTime!=0){
				Date beginDate = new Date(beginTime);
				Date endDate = new Date(endTime);
				long useTime = endDate.getTime()-beginDate.getTime();
				long limit_time = Long.parseLong(MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"LIMIT_TIME"));
				int limit_count = Integer.parseInt(MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"LIMIT_COUNT"));
				if (useTime<=limit_time){
					int count = (Integer) httpSession.getAttribute(sessionStaff.getStaffCode()+"custcount")+1;
					if(count<limit_count){
						httpSession.setAttribute(sessionStaff.getStaffCode()+"custcount", count);
					}else if(count==limit_count){
						httpSession.setAttribute(sessionStaff.getStaffCode()+"custcount", count);
						model.addAttribute("showVerificationcode", "Y");
					}else if(count>limit_count){
						httpSession.setAttribute(sessionStaff.getStaffCode()+"custcount", count);
						if(httpSession.getAttribute(sessionStaff.getStaffCode()+"custcount")!=null){
							model.addAttribute("showVerificationcode", "Y");
							return "/cust/cust-list";
						}
					}
				}else{
					httpSession.setAttribute(sessionStaff.getStaffCode()+"custtime", endTime);
					httpSession.setAttribute(sessionStaff.getStaffCode()+"custcount", 1);
				}
			}else{
				httpSession.setAttribute(sessionStaff.getStaffCode()+"custtime", endTime);
				httpSession.setAttribute(sessionStaff.getStaffCode()+"custcount", 1);
			}
		}catch (Exception e) {
			// TODO: handle exception
		}
		
		Map resultMap =new HashMap();
		httpSession.setAttribute("ValidateAccNbr", null);
		httpSession.setAttribute("ValidateProdPwd", null);
		httpSession.setAttribute("queryCustAccNbr", paramMap.get("acctNbr"));
		//判断是否只能进行本地定位
/*		String diffPlace=(String) param.get("diffPlace");
		if(diffPlace.equals("local")){
			param.put("areaId", sessionStaff.getCurrentAreaId());
		}*/
		//客户鉴权跳过 权限查询
//		String iseditOperation= (String)ServletUtils.getSessionAttribute(super.getRequest(),
//				SysConstant.SESSION_KEY_JUMPAUTH+"_"+sessionStaff.getStaffId());
		String iseditOperation = null; //存在多次定位客户时，有时不显示跳过检验按钮的问题；尝试每次都调用接口重新获取权限；
		try{
 			if(iseditOperation==null){
 				iseditOperation=staffBmo.checkOperatSpec(SysConstant.JUMPAUTH_CODE,sessionStaff);
 				ServletUtils.setSessionAttribute(super.getRequest(),
 						SysConstant.SESSION_KEY_JUMPAUTH+"_"+sessionStaff.getStaffId(), iseditOperation);
 			}
			} catch (BusinessException e) {
				iseditOperation="1";
	 		} catch (InterfaceException ie) {
	 			iseditOperation="1";
			} catch (Exception e) {
				iseditOperation="1";
			}
		model.addAttribute("jumpAuthflag", iseditOperation);
		
		String areaId=(String) paramMap.get("areaId");
		if(("").equals(areaId)||areaId==null){
			paramMap.put("areaId", sessionStaff.getCurrentAreaId());
		}
		paramMap.put("staffId", sessionStaff.getStaffId());
		if(paramMap.get("custQueryType")!=null&&!paramMap.get("custQueryType").equals("")){
			httpSession.setAttribute("custQueryType", paramMap.get("custQueryType"));
		}else{
			httpSession.setAttribute("custQueryType", "");
		}
		List custInfos = new ArrayList();
		try {
			String regex = "^[A-Za-z0-9]+$";
			String num = (String) (paramMap.get("acctNbr")==""?paramMap.get("identityNum")==""?paramMap.get("queryTypeValue"):paramMap.get("identityNum"):paramMap.get("acctNbr"));
			if(!num.matches(regex)){
				return "/cust/cust-list";
			}
			resultMap = custBmo.queryCustInfo(paramMap,flowNum, sessionStaff);
			if (MapUtils.isNotEmpty(resultMap)) {
				custInfos=(List<Map<String, Object>>) resultMap.get("custInfos");
				if(!MapUtils.getString(paramMap,"queryTypeValue","").equals("") && !MapUtils.getString(paramMap,"queryType","").equals("")){
					sessionStaff.setCardNumber(String.valueOf(paramMap.get("queryTypeValue")));
					sessionStaff.setCardType(String.valueOf(paramMap.get("queryType")));
				}else if(!paramMap.get("identityNum").equals("") && !paramMap.get("identityCd").equals("")){
					sessionStaff.setCardNumber(String.valueOf(paramMap.get("identityNum")));
					sessionStaff.setCardType(String.valueOf(paramMap.get("identityCd")));
				}
				
				sessionStaff.setInPhoneNum(String.valueOf(paramMap.get("acctNbr")));
				model.addAttribute("custInfoSize", custInfos.size());
				if(custInfos.size()>0){
					Map custInfo =(Map)custInfos.get(0);
					String idCardNumber = (String) custInfo.get("idCardNumber");
					
					sessionStaff.setCustId(String.valueOf(custInfo.get("custId")));
					sessionStaff.setCardNumber(idCardNumber);
					sessionStaff.setCardType(String.valueOf(custInfo.get("identityCd")));
					sessionStaff.setPartyName(String.valueOf(custInfo.get("partyName")));
					
					if(idCardNumber != null && idCardNumber.length()==18){
						 String preStr = idCardNumber.substring(0,6);
				    	 String subStr = idCardNumber.substring(14);
				    	 idCardNumber=preStr+"********"+subStr;
						
					}else if(idCardNumber != null && idCardNumber.length()==15){
						String preStr = idCardNumber.substring(0,5);
				    	 String subStr = idCardNumber.substring(13);
				    	 idCardNumber=preStr+"********"+subStr;
					}
					model.addAttribute("idCardNumber", idCardNumber);
				}else{
					int count = (Integer) httpSession.getAttribute(sessionStaff.getStaffCode()+"custcount")+10;
					httpSession.setAttribute(sessionStaff.getStaffCode()+"custcount", count);
				}
				model.addAttribute("cust", resultMap);
			}else{
				int count = (Integer) httpSession.getAttribute(sessionStaff.getStaffCode()+"custcount")+10;
				httpSession.setAttribute(sessionStaff.getStaffCode()+"custcount", count);
			}
			if(paramMap.containsKey("query")){	
				model.addAttribute("query", paramMap.get("query"));  //综合查询调用标志
			}
			//日志平台busi_run_nbr字段
			String log_busi_run_nbr = UIDGenerator.getRand();
			ServletUtils.getSession(request).setAttribute(SysConstant.LOG_BUSI_RUN_NBR, log_busi_run_nbr);
			long Time = Calendar.getInstance().getTimeInMillis();
			SimpleDateFormat dateFormate = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");//输出的日期格式
			String locateDate=dateFormate.format(Time);
			staffBmo.userSearchbtn(locateDate, null, sessionStaff);//定位客户记录日志
			return "/pctoken/order/order-cust-list";
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			
			return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_CUST);
		} catch (Exception e) {
			
			return super.failedStr(model, ErrorCode.QUERY_CUST, e, paramMap);
		}
	}
	
	@RequestMapping(value = "/checkIdentity", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse checkIdentity(@RequestBody Map<String, Object> paramMap,
			@LogOperatorAnn String flowNum,HttpServletResponse response){
		Map<String, Object> resultMap = null;
		JsonResponse jsonResponse = null;
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		String areaId=(String) paramMap.get("areaId");
		if(("").equals(areaId)||areaId==null){
			paramMap.put("areaId", sessionStaff.getCurrentAreaId());
		}
		paramMap.put("staffId", sessionStaff.getStaffId());
		List<Map<String, Object>> list = null;
		try {
			resultMap = custBmo.queryCustInfo(paramMap,
					flowNum, sessionStaff);
			if (resultMap != null) {
				list=(List<Map<String, Object>>) resultMap.get("custInfos");
				if(list!=null&&list.size()>0){
					jsonResponse = super.successed("系统已存在此客户",
							ResultConstant.SUCCESS.getCode());
				}else{
					jsonResponse = super.failed(resultMap,
							ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
				}
				
			} else {
				jsonResponse = super.failed(resultMap,
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		} catch (BusinessException be) {
			
			return super.failed(be);
		} catch (InterfaceException ie) {

			return super.failed(ie, resultMap, ErrorCode.QUERY_CUST);
		} catch (Exception e) {
			log.error("客户定位/cust/queryCust方法异常", e);
			return super.failed(ErrorCode.QUERY_CUST, e, resultMap);
		}
		return jsonResponse;
    }
	@RequestMapping(value = "/custAuth", method = { RequestMethod.POST })
	public String custAuth(@RequestBody Map<String, Object> param, Model model,@LogOperatorAnn String flowNum, HttpServletResponse response,HttpSession httpSession) throws BusinessException {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map map = new HashMap();
		Map paramMap = new HashMap();
		Map resultMap = new HashMap();
		String areaName="";
		String identityCd="";
        String pCustIdentityCd=MapUtils.getString(param,"pCustIdentityCd");
		String idCardNumber="";
		/*{accessNumber:'11969577',areaId:21,prodPwd:'000000'}*/
		String accNbr= (String) httpSession.getAttribute("queryCustAccNbr");
		if (StringUtils.isNotBlank(accNbr)) {
			paramMap.put("accessNumber", accNbr);
		} else {
			paramMap.put("accessNumber", MapUtils.getString(param, "accessNumber", ""));
		}
		paramMap.put("prodPwd", param.get("prodPwd"));
		paramMap.put("areaId",param.get("areaId"));
		String authFlag=(String) param.get("authFlag");
		String identityNum=(String) param.get("identityNum");
		String validateType=(String) param.get("validateType");
		String ifOrgUseCust = MapUtils.getString(param, "ifOrgUseCust", "");//是否是政企客户
		areaName = (String) param.get("areaName");
		if(areaName==null){
			areaName=sessionStaff.getCurrentAreaAllName();	
		}
		param.put("areaName", areaName);
		//身份证脱敏操作
		identityCd=(String) param.get("identityCd");
		idCardNumber=(String) param.get("idCardNumber");
		if(identityCd.equals("1")){
			String isViewOperation= (String)ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_VIEWSENSI+"_"+sessionStaff.getStaffId());
			try{
	 			if(isViewOperation==null){
	 				isViewOperation=staffBmo.checkOperatSpec(SysConstant.VIEWSENSI_CODE,sessionStaff);
	 				ServletUtils.setSessionAttribute(super.getRequest(),
	 						SysConstant.SESSION_KEY_VIEWSENSI+"_"+sessionStaff.getStaffId(), isViewOperation);
	 			}
				} catch (BusinessException e) {
					isViewOperation="1";
		 		} catch (InterfaceException ie) {
		 			isViewOperation="1";
				} catch (Exception e) {
					isViewOperation="1";
				}
			Integer aa=idCardNumber.length();
			if(!isViewOperation.equals("0")&&idCardNumber.length()==18){
				 String preStr = idCardNumber.substring(0,6);
		    	 String subStr = idCardNumber.substring(14);
		    	 idCardNumber=preStr+"********"+subStr;
				
			}else if(!isViewOperation.equals("0")&&idCardNumber.length()==15){
				String preStr = idCardNumber.substring(0,5);
		    	 String subStr = idCardNumber.substring(13);
		    	 idCardNumber=preStr+"********"+subStr;
			}
		}
		param.put("idCardNumber", idCardNumber);

		Map<String, Map> listCustInfos = (Map<String, Map>) httpSession.getAttribute(SysConstant.SESSION_LIST_CUST_INFOS);
		
		if ("0".equals(authFlag)) {
			if ("15678".contains(validateType)) {//兼容客户定位省份证定位和二次业务证件类型定位
				//用户信息查询
				Map custParam = new HashMap();
				try {
					String custId = MapUtils.getString(param, "custId");

					Map<String, Object> checkIdMap = new HashMap<String, Object>();
					checkIdMap.put("areaId", MapUtils.getString(param, "areaId", ""));
					checkIdMap.put("custId", custId);
					checkIdMap.put("idCardNumber", StringUtils.isNotBlank(identityNum) ? Base64.eryDecoder(identityNum) : "");
					checkIdMap.put("idCardType", identityCd);
					if (SysConstant.STR_Y.equals(ifOrgUseCust)) {
						checkIdMap.put("ifOrgUseCust", SysConstant.STR_Y);
					}
					if ("1".equals(identityCd)) {
						String sessionCertNumber = (String) ServletUtils.getSessionAttribute(getRequest(), Const.CACHE_CERTINFO);
						ServletUtils.removeSessionAttribute(getRequest(),Const.CACHE_CERTINFO);
						String tmpIdCardNumber = MapUtils.getString(checkIdMap, "idCardNumber", "");
						if(!tmpIdCardNumber.equals(sessionCertNumber)) {
							map.put("isChange", SysConstant.STR_Y);
							map.put("custAuthInfo", "非正常读卡数据，信息可能被篡改，此操作将被记录！");
							model.addAttribute("custAuth", map);
							return "/cust/cust-info";
						}
					}
					Map<String, Object> datamap = mktResBmo.checkIdCardNumber(checkIdMap,
							flowNum, sessionStaff);
					if (datamap != null) {
						String code = (String) datamap.get("code");
						if (ResultCode.R_SUCC.equals(code)) {
							map.put("isValidate", "true");
							// 在session中保存当前客户信息
							Map sessionCustInfo = MapUtils.getMap(listCustInfos, custId);
							if (sessionCustInfo != null) {
								httpSession.setAttribute(SysConstant.SESSION_CURRENT_CUST_INFO, sessionCustInfo);
								listCustInfos.clear();
							}
						}
					}
				} catch (BusinessException be) {
					return super.failedStr(model, be);
				} catch (InterfaceException ie) {
					return super.failedStr(model, ie, custParam, ErrorCode.QUERY_CUST);
				} catch (Exception e) {
					return super.failedStr(model, ErrorCode.QUERY_CUST, e, custParam);
				}
			} else {
				try {
					map = custBmo.custAuth(paramMap,
							flowNum, sessionStaff);
					String resultCode = MapUtils.getString(map, "resultCode");
					String isValidateStr = MapUtils.getString(map, "isValidate");
					if ("true".equals(isValidateStr)) {
						httpSession.setAttribute("ValidateAccNbr", paramMap.get("accessNumber"));
						httpSession.setAttribute("ValidateProdPwd", paramMap.get("prodPwd"));
					}
				} catch (BusinessException be) {
					return super.failedStr(model, be);
				} catch (InterfaceException ie) {
					return super.failedStr(model, ie, paramMap, ErrorCode.CUST_AUTH);
				} catch (Exception e) {
					return super.failedStr(model, ErrorCode.CUST_AUTH, e, paramMap);
				}
			}
		} else {
			map.put("isValidate", "true");
			//在session中保存当前客户信息
			String custId = MapUtils.getString(param, "custId", "");
			Map sessionCustInfo = MapUtils.getMap(listCustInfos, custId);  
			if(sessionCustInfo != null){
				httpSession.setAttribute(SysConstant.SESSION_CURRENT_CUST_INFO, sessionCustInfo);
				listCustInfos.clear();
			}
		}
		String custId = MapUtils.getString(param, "custId", "");
		if(SysConstant.ON.equals(sessionStaff.getPoingtType()) && !StringUtil.isEmptyStr(custId)){//星级服务开关打开
			Map<String, Object> paramMapXJ = new HashMap<String, Object>();
			paramMapXJ.put("identityCd", sessionStaff.getCardType());
			paramMapXJ.put("identityNum", sessionStaff.getCardNumber());
			paramMapXJ.put("queryType", sessionStaff.getCustType());
			String areaId = (String) httpSession.getAttribute("pointareaId");
			if(!"".equals(areaId) && areaId !=null){
				paramMapXJ.put("areaId",areaId);
			}
        	if("11".equals(sessionStaff.getCustType())){
        		paramMapXJ.put("queryTypeValue", sessionStaff.getInPhoneNum());
        	}else{
        		paramMapXJ.put("queryTypeValue", sessionStaff.getCustCode());
        	}
        	paramMapXJ.put("password", "");
        	try {
            	Map<String, Object> returnMap = orderBmo.queryIntegral(paramMapXJ, flowNum, sessionStaff);
                Map<String, Object> membershipLevelInfoMap = null;
                String code = (String) returnMap.get("resultCode");
				if (ResultCode.R_SUCC.equals(code) && returnMap.get("custInfo") !=null  && returnMap.get("membershipLevelInfo") !=null 
						&& returnMap.get("pointInfo") !=null) {
                        Object objmembershipLevelInfo = returnMap.get("membershipLevelInfo");
                        if (objmembershipLevelInfo instanceof Map) {
                        	membershipLevelInfoMap = (Map<String, Object>) objmembershipLevelInfo;
                        } else {
                        	membershipLevelInfoMap = new HashMap<String, Object>();
                        	membershipLevelInfoMap.putAll((Map<String, Object>) objmembershipLevelInfo);
                        }
                        model.addAttribute("membershipLevel", membershipLevelInfoMap.get("membershipLevel"));
				}
        	} catch (BusinessException be) {
			} catch (InterfaceException ie) {
			} catch (Exception e) {
			}
		}
		
		map.put("custInfo", param);
		model.addAttribute("poingtType",sessionStaff.getPoingtType());
		model.addAttribute("custAuth", map);
		return "/cust/cust-info";
	}
	
	@RequestMapping(value = "/custAuthSub", method = { RequestMethod.POST })
	public String custAuthSub(@RequestBody Map<String, Object> param, Model model,@LogOperatorAnn String flowNum, HttpServletResponse response,HttpSession httpSession) throws BusinessException {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map map = new HashMap();
		Map paramMap = new HashMap();
		Map resultMap = new HashMap();
		String areaName="";
		String identityCd="";
        String pCustIdentityCd=MapUtils.getString(param,"pCustIdentityCd");
		String idCardNumber="";
		/*{accessNumber:'11969577',areaId:21,prodPwd:'000000'}*/
		paramMap.put("accessNumber", httpSession.getAttribute("queryCustAccNbr"));
		paramMap.put("prodPwd", param.get("prodPwd"));
		paramMap.put("areaId",param.get("areaId"));
		String authFlag=(String) param.get("authFlag");
		String identityNum=(String) param.get("identityNum");
		areaName = (String) param.get("areaName");
		if(areaName==null){
			areaName=sessionStaff.getCurrentAreaAllName();	
		}
		param.put("areaName", areaName);
		//身份证脱敏操作
		identityCd=(String) param.get("identityCd");
		idCardNumber=(String) param.get("idCardNumber");
		if(identityCd.equals("1")){
			String isViewOperation= (String)ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_VIEWSENSI+"_"+sessionStaff.getStaffId());
			try{
	 			if(isViewOperation==null){
	 				isViewOperation=staffBmo.checkOperatSpec(SysConstant.VIEWSENSI_CODE,sessionStaff);
	 				ServletUtils.setSessionAttribute(super.getRequest(),
	 						SysConstant.SESSION_KEY_VIEWSENSI+"_"+sessionStaff.getStaffId(), isViewOperation);
	 			}
				} catch (BusinessException e) {
					isViewOperation="1";
		 		} catch (InterfaceException ie) {
		 			isViewOperation="1";
				} catch (Exception e) {
					isViewOperation="1";
				}
			Integer aa=idCardNumber.length();
			if(!isViewOperation.equals("0")&&idCardNumber.length()==18){
				 String preStr = idCardNumber.substring(0,6);
		    	 String subStr = idCardNumber.substring(14);
		    	 idCardNumber=preStr+"********"+subStr;
				
			}else if(!isViewOperation.equals("0")&&idCardNumber.length()==15){
				String preStr = idCardNumber.substring(0,5);
		    	 String subStr = idCardNumber.substring(13);
		    	 idCardNumber=preStr+"********"+subStr;
			}
		}
		param.put("idCardNumber", idCardNumber);

		if ("0".equals(authFlag)) {
			if ("1".equals(pCustIdentityCd)) {
				//用户信息查询
				Map custParam = new HashMap();
				try {
					custParam.put("areaId", param.get("areaId"));
					custParam.put("identityCd", identityCd);
					custParam.put("identityNum", StringUtils.isNotBlank(identityNum)?Base64.eryDecoder(identityNum):"");
					custParam.put("staffId", param.get("staffId"));
					custParam.put("transactionId", param.get("transactionId"));
					resultMap = custBmo.queryCustInfo(custParam, flowNum, sessionStaff);
					if (MapUtil.isNotEmpty(resultMap)) {
						List custInfos = (List<Map<String, Object>>) resultMap.get("custInfos");
						if (custInfos.size() > 0) {
							Map custInfoMap = (Map<String, Object>) custInfos.get(0);
							String queryCustId = MapUtils.getString(custInfoMap, "custId");
							String custId = MapUtils.getString(param, "custId");
							if (custId.equals(queryCustId))
								map.put("isValidate", "true");
						}
					}
				} catch (BusinessException be) {
					return super.failedStr(model, be);
				} catch (InterfaceException ie) {
					return super.failedStr(model, ie, custParam, ErrorCode.QUERY_CUST);
				} catch (Exception e) {
					return super.failedStr(model, ErrorCode.QUERY_CUST, e, custParam);
				}
			} else {
				try {
					map = custBmo.custAuth(paramMap,
							flowNum, sessionStaff);
					String resultCode = MapUtils.getString(map, "resultCode");
					String isValidateStr = MapUtils.getString(map, "isValidate");
					if ("true".equals(isValidateStr)) {
						httpSession.setAttribute("ValidateAccNbr", paramMap.get("accessNumber"));
						httpSession.setAttribute("ValidateProdPwd", paramMap.get("prodPwd"));
					}
				} catch (BusinessException be) {
					return super.failedStr(model, be);
				} catch (InterfaceException ie) {
					return super.failedStr(model, ie, paramMap, ErrorCode.CUST_AUTH);
				} catch (Exception e) {
					return super.failedStr(model, ErrorCode.CUST_AUTH, e, paramMap);
				}
			}
		} else {
			map.put("isValidate", "true");
		}
		map.put("custInfo", param);
		model.addAttribute("custAuth", map);
		return "/pctoken/order/order-cust-info";
	}
	
	@ResponseBody
	@RequestMapping(value = "/passwordReset", method = RequestMethod.POST)
	public String passwordReset(@RequestParam Map<String, Object> param, Model model,HttpSession httpSession){
		httpSession.setAttribute("ValidateAccNbr", null);
		httpSession.setAttribute("ValidateProdPwd", null);
		return "0" ;
	}
	
	@SuppressWarnings({ "rawtypes", "unchecked" })
	@RequestMapping(value = "/custCreate", method = { RequestMethod.POST })
	public String custCreate(@RequestBody Map<String, Object> param, Model model,@LogOperatorAnn String flowNum, HttpServletResponse response,HttpSession httpSession) throws BusinessException {
		Map map = new HashMap();
		Map resultMap = new HashMap();
		resultMap.put("isValidate", "true");
		map.put("result", resultMap);
		map.put("custInfo", param);
		model.addAttribute("custAuth", map);
		return "/cust/cust-info";
	}
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/orderprod", method = RequestMethod.GET)
	public String orderprod(@RequestParam Map<String, Object> param, Model model,HttpSession session, 
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		List<Map<String, Object>> list = null;
		if (param.containsKey("isPurchase")) {
			model.addAttribute("isPurchase", "1");
			param.remove("isPurchase");
		}
		String areaId=(String) param.get("areaId");
		if(areaId==null||areaId.equals("")){
			areaId=sessionStaff.getCurrentAreaId();
		}
		Map paramMap =new HashMap();
		paramMap.put("areaId", areaId);
		paramMap.put("acctNbr", param.get("acctNbr"));
		paramMap.put("custId", param.get("custId"));

		paramMap.put("curPage", param.get("curPage"));
		if (param.containsKey("prodClass")) {
			paramMap.put("prodClass", param.get("prodClass"));
		}
//        int pageSize = sessionStaff.getAgentTypeCd().equals(SysConstant.AGENT_TYPE_IPAD) ? 8 : 12;
		String pageSize = "";
        pageSize=(String) param.get("pageSize");
        if("".equals(pageSize)){
        	pageSize="5";
        }
        paramMap.put("pageSize", pageSize);
		log.debug("param={}", JsonUtil.toString(paramMap));
		try {
			Map<String, Object> datamap = this.custBmo.queryCustProd(paramMap,
					flowNum, sessionStaff);
			log.debug("return={}", JsonUtil.toString(datamap));
			String code = (String) datamap.get("resultCode");
			if (ResultCode.R_SUCC.equals(code)) {
				Map<String, Object> temMap=(Map) datamap.get("result");
				list = (List<Map<String, Object>>) temMap.get("prodInstInfos");
						if (list == null) {
							super.addHeadCode(response,ResultConstant.SERVICE_RESULT_FAILTURE);
						} else {
							if(list.size() > 0){
		                        ServletUtils.setSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_AREA+"_"+sessionStaff.getStaffId(), list.get(0).get("areaId"));
		                	}
							Map<String, Object> mktPageInfo = MapUtil.map(temMap, "page");
							// 设置分页对象信息
							PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(
									MapUtils.getIntValue(mktPageInfo, "pageIndex", 1),
									MapUtils.getIntValue(mktPageInfo, "pageSize", 10),
									MapUtils.getIntValue(mktPageInfo, "totalCount", 1),
									list);
							model.addAttribute("pageModel", pm);
							model.addAttribute("custflag", "0");
							/*PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(MapUtils.getIntValue(param,
											"PageIndex", 1), 10, 1, list);
							model.addAttribute("pageModel", pm);*/
						}
				}
			else if (ResultCode.R_FAIL.equals((String) datamap.get("code"))){
				model.addAttribute("custflag", "1");
				model.addAttribute("msg", (String) datamap.get("msg"));
			}
			model.addAllAttributes(param);
			
			String DiffPlaceFlag = param.get("DiffPlaceFlag")==null?"":param.get("DiffPlaceFlag").toString();
			String menuName = param.get("menuName")==null?"":param.get("menuName").toString();
			List businessLink = null ;
			if(menuName.equals("")){
				if(DiffPlaceFlag.equals("local")){
					businessLink = EhcacheUtil.getBusinessMenu(session,"YWSL");//菜单权限编码
				}else if(DiffPlaceFlag.equals("diff")){
					businessLink = EhcacheUtil.getBusinessMenu(session,"YDSL");
				}
			}else{
				if(SysConstant.GKHZLFD.equals(menuName)){//暂只用这两个菜单
					businessLink = EhcacheUtil.getBusinessMenuByName(session,SysConstant.GKHZLFD_NAME);
				}else if(SysConstant.GHFD.equals(menuName)){
					businessLink = EhcacheUtil.getBusinessMenuByName(session,SysConstant.GHFD_NAME);
				}else if(SysConstant.FD.equals(menuName)){
					businessLink = EhcacheUtil.getBusinessMenuByName(session,SysConstant.FD_NAME);
				}
				
			}
			model.addAttribute("businessLink", businessLink);
			model.addAttribute("DiffPlaceFlag", DiffPlaceFlag);
			ServletUtils.removeSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_AGREEMENT+"_"+sessionStaff.getStaffId());
			ServletUtils.removeSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_TERMINAL+"_"+sessionStaff.getStaffId());
			ServletUtils.removeSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_NUMBER+"_"+sessionStaff.getStaffId());
			return "/cust/cust-order-list";
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			
			return super.failedStr(model, ie, paramMap, ErrorCode.ORDER_PROD);
		} catch (Exception e) {
			
			return super.failedStr(model, ErrorCode.ORDER_PROD, e, paramMap);
		}
	}
	
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/orderprodSub", method = RequestMethod.GET)
	public String orderprodSub(@RequestParam Map<String, Object> param, Model model,HttpSession session, 
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		List<Map<String, Object>> list = null;
		if (param.containsKey("isPurchase")) {
			model.addAttribute("isPurchase", "1");
			param.remove("isPurchase");
		}
		String areaId=(String) param.get("areaId");
		if(areaId==null||areaId.equals("")){
			areaId=sessionStaff.getCurrentAreaId();
		}
		Map paramMap =new HashMap();
		paramMap.put("areaId", areaId);
		paramMap.put("acctNbr", param.get("acctNbr"));
		paramMap.put("custId", param.get("custId"));
		paramMap.put("curPage", param.get("curPage"));
//        int pageSize = sessionStaff.getAgentTypeCd().equals(SysConstant.AGENT_TYPE_IPAD) ? 8 : 12;
		String pageSize = "";
        pageSize=(String) param.get("pageSize");
        if("".equals(pageSize)){
        	pageSize="5";
        }
        paramMap.put("pageSize", pageSize);
		log.debug("param={}", JsonUtil.toString(paramMap));
		try {
			Map<String, Object> datamap = this.custBmo.queryCustProd(paramMap,
					flowNum, sessionStaff);
			log.debug("return={}", JsonUtil.toString(datamap));
			String code = (String) datamap.get("resultCode");
			if (ResultCode.R_SUCC.equals(code)) {
				Map<String, Object> temMap=(Map) datamap.get("result");
				list = (List<Map<String, Object>>) temMap.get("prodInstInfos");
						if (list == null) {
							super.addHeadCode(response,ResultConstant.SERVICE_RESULT_FAILTURE);
						} else {

							Map<String, Object> mktPageInfo = MapUtil.map(temMap, "page");
							// 设置分页对象信息
							PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(
									MapUtils.getIntValue(mktPageInfo, "pageIndex", 1),
									MapUtils.getIntValue(mktPageInfo, "pageSize", 10),
									MapUtils.getIntValue(mktPageInfo, "totalCount", 1),
									list);
							model.addAttribute("pageModel", pm);
							model.addAttribute("custflag", "0");
							/*PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(MapUtils.getIntValue(param,
											"PageIndex", 1), 10, 1, list);
							model.addAttribute("pageModel", pm);*/
						}
				}
			else if (ResultCode.R_FAIL.equals((String) datamap.get("code"))){
				model.addAttribute("custflag", "1");
				model.addAttribute("msg", (String) datamap.get("msg"));
			}
			model.addAllAttributes(param);
			
			String DiffPlaceFlag = param.get("DiffPlaceFlag")==null?"":param.get("DiffPlaceFlag").toString();
			List businessLink = null ;
			if(DiffPlaceFlag.equals("local")){
				businessLink = EhcacheUtil.getBusinessMenu(session,"YWSL");//菜单权限编码
			}else if(DiffPlaceFlag.equals("diff")){
				businessLink = EhcacheUtil.getBusinessMenu(session,"YDSL");
			}
			model.addAttribute("businessLink", businessLink);
			model.addAttribute("DiffPlaceFlag", DiffPlaceFlag);
			
			return "/pctoken/order/order-cust-product-list";
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			
			return super.failedStr(model, ie, paramMap, ErrorCode.ORDER_PROD);
		} catch (Exception e) {
			
			return super.failedStr(model, ErrorCode.ORDER_PROD, e, paramMap);
		}
	}
	
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/queryprodbynbr", method = RequestMethod.GET)
	public String queryProdByNbr(@RequestParam Map<String, Object> param, Model model,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		List<Map<String, Object>> list = null;
		Map paramMap =new HashMap();
		paramMap.put("areaId", sessionStaff.getCurrentAreaId());
		//paramMap.put("areaId", "21");//need modify
		paramMap.put("acctNbr", param.get("acctNbr"));
		paramMap.put("curPage", 1);
        int pageSize = 12;
        paramMap.put("pageSize", String.valueOf(pageSize));
		log.debug("param={}", JsonUtil.toString(paramMap));
		try {
			Map<String, Object> datamap = this.custBmo.queryCustProd(paramMap,
					flowNum, sessionStaff);
			log.debug("return={}", JsonUtil.toString(datamap));
			String code = (String) datamap.get("resultCode");
			if (ResultCode.R_SUCC.equals(code)) {
				Map<String, Object> temMap=(Map) datamap.get("result");
				list = (List<Map<String, Object>>) temMap.get("prodInstInfos");
				model.addAttribute("prodinstlist", list);
			}
			return "/order/order-prodinst-list";
		} catch (BusinessException be) {
			this.log.error("查询号码信息失败", be);
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap, ErrorCode.ORDER_PROD);
		} catch (Exception e) {
			log.error("门户/cust/queryprodbynbr方法异常", e);
			return super.failedStr(model, ErrorCode.ORDER_PROD, e, paramMap);
		}
	}
	@RequestMapping(value = "/partyProfileSpecList", method = RequestMethod.GET)
    public String partyProfileSpecList(HttpSession session, Model model, HttpServletRequest request,
            HttpServletResponse response) throws Exception {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF
                );
    	
    	Map<String, Object> dataBusMap = new HashMap<String, Object>();//规格
    	
        
        Map result = null ;
        List<Map<String, Object>> list = null;
        List<Map<String, Object>> temList= null;
        List<Map<String, Object>> tabList= null;
        List<Map<String, Object>> tabTempList= null;
        try {
        	result = this.custBmo.custProfileSpecList(dataBusMap, null, sessionStaff);
        	if(result.get("code").equals("0")){
        		//纳税 人权限查询
        		String iseditOperation= (String)ServletUtils.getSessionAttribute(super.getRequest(),
    					SysConstant.SESSION_KEY_EDITTAXPAYER+"_"+sessionStaff.getStaffId());
        		try{
    	 			if(iseditOperation==null){
    	 				iseditOperation=staffBmo.checkOperatSpec(SysConstant.EDITTAXPAYER_CODE,sessionStaff);
    	 				ServletUtils.setSessionAttribute(super.getRequest(),
    	 						SysConstant.SESSION_KEY_EDITTAXPAYER+"_"+sessionStaff.getStaffId(), iseditOperation);
    	 			}
     			} catch (BusinessException e) {
     				iseditOperation="1";
     	 		} catch (InterfaceException ie) {
     	 			iseditOperation="1";
     			} catch (Exception e) {
     				iseditOperation="1";
     			}
        		list = (List<Map<String, Object>>)result.get("profileSpec");
        		tabList = (List<Map<String, Object>>)result.get("tabList");
        		temList =new ArrayList();
        		model.addAttribute("result", result);
        		if(list.size()>0){
        			for (int i=0;i<list.size();i++){
        				String partyProfileCatgTypeCdStr=String.valueOf(list.get(i).get("partyProfileCatgTypeCd"));
        				if(partyProfileCatgTypeCdStr!=null&&!"".equals(partyProfileCatgTypeCdStr)){
        					Integer partyProfileCatgTypeCd=Integer.valueOf(partyProfileCatgTypeCdStr);
                			if((iseditOperation!="0"&&partyProfileCatgTypeCd!=2)||iseditOperation=="0"){
                				temList.add(list.get(i));
                             }
        				}
            			  
            		}
        			 for (int i=0;i<tabList.size();i++){
        				 tabTempList=new ArrayList();
        				 for (int j=0;j<list.size();j++){
        					 String partyProfileCatgTypeCdStr=String.valueOf(list.get(j).get("partyProfileCatgTypeCd"));
        					 if(partyProfileCatgTypeCdStr!=null&&!"".equals(partyProfileCatgTypeCdStr)){
        						 Integer partyProfileCatgTypeCd=Integer.valueOf(partyProfileCatgTypeCdStr);
            					 if(partyProfileCatgTypeCd!=3||partyProfileCatgTypeCd!=2||(partyProfileCatgTypeCd==2&&iseditOperation=="0")){
            						 
            						 if(partyProfileCatgTypeCd==tabList.get(i).get("partyProfileCatgTypeCd")){
                						 tabTempList.add(list.get(j));
                                		 
                                	 }
            						 
            					 }
        					 }
        					 
        					 
        					 
        				 }
        				 tabList.get(i).put("tabProfile", tabTempList);
                    	 
                     }
        			model.addAttribute("code", 0);
        			model.addAttribute("profileSpec", temList);
        			model.addAttribute("profileTabList", tabList);
        			model.addAttribute("profileTabListJson", JsonUtil.buildNormal().objectToJson(tabList));
        			model.addAttribute("profileSpecJson", JsonUtil.buildNormal().objectToJson(temList));
        		}else{
        			model.addAttribute("code", 1);
        			model.addAttribute("profileSpec", null);
        			model.addAttribute("profileTabList", null);
        		}
        	}else{
        		model.addAttribute("code", result.get("code"));
        	}
        } catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			
			return super.failedStr(model, ie, dataBusMap, ErrorCode.QUERY_PARTYPROFILE);
		} catch (Exception e) {
			
			return super.failedStr(model, ErrorCode.QUERY_PARTYPROFILE, e, dataBusMap);
		}
    	return "/cust/cust-query-profile";
    }
	/**
     * 根据员工类型查询员工证件类型
     * @param param 
     * @return List<Map>
     */
	@RequestMapping(value = "/queryCertType", method = RequestMethod.POST)
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse queryCertType(@RequestBody Map<String, Object> param,
			HttpServletRequest request, HttpServletResponse response, @LogOperatorAnn String flowNum){	
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		String resultList= null;
		try{		
 			rMap = this.custBmo.queryCertType(param, flowNum, sessionStaff);
 			log.debug("return={}", JsonUtil.toString(rMap));
 			resultList =rMap.get("result").toString();
 			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())&&!"[]".equals(resultList)) {
 				jsonResponse = super.successed(rMap.get("result"),
 						ResultConstant.SUCCESS.getCode());
 			}else if("[]".equals(resultList)) {
 				jsonResponse = super.failed("根据员工类型查询员工证件类型无数据",
 						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
 			} else {
 				jsonResponse = super.failed(rMap.get("msg").toString(),
 						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
 			}		
 			return jsonResponse;
		}catch(BusinessException be){
			this.log.error("调用根据员工类型查询员工证件类型失败", be);
   			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.QUERY_CERTTYPE);
		} catch (Exception e) {
			log.error("门户/cust/queryCertType方法异常", e);
			return super.failed(ErrorCode.QUERY_CERTTYPE, e, param);
		}
	}
    /**
     * 转至客户信息查询
     * @param session
     * @param model
     * @return
     */
    @RequestMapping(value = "/preQueryCust", method = RequestMethod.GET)
    public String preQueryCust(HttpSession session, Model model){
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.
		getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		model.addAttribute("defaultAreaName", sessionStaff.getCurrentAreaAllName());
		model.addAttribute("defaultAreaId", sessionStaff.getCurrentAreaId());
		
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"cust/preQueryCust"));		
		return "/cust/cust-info-query";
    }
    /**
     * 客户资料查询
     * @param param
     * @param model
     * @param flowNum
     * @param response
     * @return
     * @throws com.al.ecs.exception.BusinessException
     */
    @SuppressWarnings("unchecked")
	@RequestMapping(value = "/queryCustAlone", method = RequestMethod.GET)
	public String queryAccount(@RequestParam Map<String, Object> param, Model model,@LogOperatorAnn String flowNum, 
			HttpServletResponse response)throws BusinessException{
    	
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.
		getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF); 
    	String areaId=(String) param.get("areaId");
		if(("").equals(areaId)||areaId==null){
			param.put("areaId", sessionStaff.getCurrentAreaId());
		}
		param.put("staffId", sessionStaff.getStaffId());
    	
    	try{
    		Map<String, Object> resultMap = custBmo.queryCustInfo(param, flowNum, sessionStaff);    		    	    			
    		if(MapUtils.isNotEmpty(resultMap)){    				  
    			List custInfos = new ArrayList();
				custInfos=(List<Map<String, Object>>) resultMap.get("custInfos");
    			model.addAttribute("custInfos", custInfos);    					
    			model.addAttribute("flag", 0);    				    				    			
    		}    			
    		else{    				
    			model.addAttribute("flag", 1);    			
    		}    		
    	}catch(BusinessException be){
			return super.failedStr(model, be);
		}catch(InterfaceException ie){
			return super.failedStr(model, ie, param, ErrorCode.QUERY_CUST);
		}catch(Exception e){
			return super.failedStr(model, ErrorCode.QUERY_CUST, e, param);
		}
    	return "/cust/cust-query-list";
    }
    /**
     * 客户详情查询
     * @param param
     * @param model
     * @param flowNum
     * @param response
     * @return
     * @throws com.al.ecs.exception.BusinessException
     */
    @RequestMapping(value = "/custInfo", method = {RequestMethod.POST})
	public String custInfo(@RequestBody Map<String, Object> param, Model model,@LogOperatorAnn String optFlowNum, HttpServletResponse response,HttpServletRequest request) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		if (!MapUtils.isEmpty(param)) {
			model.addAttribute("modifyCustInfo", param);
		}
    	Map paramMap=new HashMap();
    	paramMap.put("partyId", param.get("partyId"));
    	paramMap.put("areaId", param.get("areaId"));
    	String sussFlag="";
		Map<String, Object> datamap = null;
		Map<String, Object> resultMap = null;
		Map<String, Object> partyListMap = null;
		Map<String, Object> profilesMap = null;
		List<Map<String, Object>> partyContactInfoList = null;
		try{
		datamap = this.custBmo.queryCustDetail(paramMap, optFlowNum, sessionStaff);
		log.debug("return={}", JsonUtil.toString(datamap));
		String code = (String) datamap.get("resultCode");
		List<Map<String, Object>> identitiesList = null;
		List<Map<String, Object>> profilesList = null;
		if (ResultCode.R_SUCC.equals(code)) {
			resultMap =MapUtils.getMap(datamap, "result");
			if (resultMap != null) {
				String isViewOperation = EhcacheUtil.getOperatCode(SysConstant.VIEWSENSI_CODE,SysConstant.SESSION_KEY_VIEWSENSI,request, sessionStaff);
				model.addAttribute("isViewOperation", isViewOperation);
				partyListMap=MapUtils.getMap(resultMap, "partyList");
				profilesMap=MapUtils.getMap(resultMap, "profiles");
				identitiesList = (List<Map<String, Object>>)partyListMap.get("identities");
				profilesList = (List<Map<String, Object>>)partyListMap.get("profiles");
				partyContactInfoList = (List<Map<String, Object>>)partyListMap.get("partyContactInfo");
				model.addAttribute("result", resultMap);
        		model.addAttribute("identities", identitiesList);
        		model.addAttribute("profiles", profilesList);
        		model.addAttribute("profilesJson", JsonUtil.buildNormal().objectToJson(profilesList));
        		model.addAttribute("partyContactInfos", partyContactInfoList);
				
							}
			}
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			
			return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_CUST_EXINFO);
		} catch (Exception e) {
			
			return super.failedStr(model, ErrorCode.QUERY_CUST_EXINFO, e, paramMap);
		}
		
		return "/cust/cust-query-detail";
	}
	@RequestMapping(value = "/mvnoCustCreate", method = RequestMethod.GET)
    @AuthorityValid(isCheck = true)
	public String mvnoCustCreate(Model model,HttpSession session) throws AuthorityException {
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"cust/mvnoCustCreate"));
		return "/cust/cust-create-main";
    }
	
	@RequestMapping(value = "/queryoffercust", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse queryoffercust(@RequestBody Map<String, Object> paramMap,
			@LogOperatorAnn String flowNum,HttpServletResponse response){
		Map<String, Object> resultMap = null;
		JsonResponse jsonResponse = null;
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		String areaId=(String) paramMap.get("areaId");
		if(("").equals(areaId)||areaId==null){
			paramMap.put("areaId", sessionStaff.getCurrentAreaId());
		}
		paramMap.put("staffId", sessionStaff.getStaffId());
		try {
			resultMap = custBmo.queryCustInfo(paramMap,
					flowNum, sessionStaff);
			if (MapUtils.isNotEmpty(resultMap)) {
				jsonResponse = super.successed(resultMap,ResultConstant.SUCCESS.getCode());
			}
		} catch (BusinessException be) {
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, resultMap, ErrorCode.QUERY_CUST);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_CUST, e, resultMap);
		}
		return jsonResponse;
    }
	
	@RequestMapping(value = "/offerorderprod", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse offerorderprod(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum,HttpServletResponse response){
		Map<String, Object> datamap = null;
		JsonResponse jsonResponse = null;
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		List<Map<String, Object>> list = null;
		String areaId=(String) param.get("areaId");
		if(areaId==null||areaId.equals("")){
			areaId=sessionStaff.getCurrentAreaId();
		}
		Map paramMap =new HashMap();
		paramMap.put("areaId", areaId);
		paramMap.put("acctNbr", param.get("acctNbr"));
		paramMap.put("custId", param.get("custId"));
		paramMap.put("curPage", param.get("curPage"));
		String pageSize = "";
        pageSize=(String) param.get("pageSize");
        if("".equals(pageSize)){
        	pageSize="5";
        }
        paramMap.put("pageSize", pageSize);
		try {
			datamap = this.custBmo.queryCustProd(paramMap,
					flowNum, sessionStaff);
			String code = (String) datamap.get("resultCode");
			if (ResultCode.R_SUCC.equals(code)) {
				Map<String, Object> temMap=(Map) datamap.get("result");
				list = (List<Map<String, Object>>) temMap.get("prodInstInfos");
				jsonResponse = super.successed(list,ResultConstant.SUCCESS.getCode());
			}
		} catch (BusinessException be) {
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, datamap, ErrorCode.ORDER_PROD);
		} catch (Exception e) {
			return super.failed(ErrorCode.ORDER_PROD, e, datamap);
		}
		return jsonResponse;
    }
	
	/**
	 * 查询接口优化开关
	 * @return
	 */
	@RequestMapping(value = "/queryIntOptSwitch", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse queryIntOptSwitch() {
		JsonResponse jsonResponse = null;
		try {
			String intOptSwitch  = propertiesUtils.getMessage(SysConstant.INTERFACEOPTIMIZATION);
			if (StringUtil.isEmpty(intOptSwitch)) {
				intOptSwitch = "OFF";
			}
			jsonResponse = super.successed(intOptSwitch, ResultConstant.SUCCESS.getCode());
		} catch (Exception e) {
			return super.failed("OFF", ResultConstant.FAILD.getCode());
		}
		return jsonResponse;
	}
	
	/**
	 * 星级服务查询页面
	 * @param model
	 * @param param
	 * @return
	 */
	@RequestMapping(value = "/starServiceQuery", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String starServiceQuery(Model model,@RequestParam Map<String, Object> param) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		Calendar c = Calendar.getInstance();
        SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd");
        String endTime = f.format(c.getTime());
        c.set(Calendar.DAY_OF_MONTH, 1);
        String startTime = f.format(c.getTime());
        model.addAttribute("p_startDt", startTime);
        model.addAttribute("p_endDt", endTime);
		model.addAttribute("current", "business");
		Map<String, Object> defaultAreaInfo = CommonMethods.getDefaultAreaInfo_MinimumC3(sessionStaff);

        model.addAttribute("p_areaId", defaultAreaInfo.get("defaultAreaId"));
        model.addAttribute("p_areaId_val", defaultAreaInfo.get("defaultAreaName"));
		return "/cust/starServiceQueryMain";
	}
	
	 /**
     * 星级列表查询
     * @param session
     * @param model
     * @param request
     * @return
     * @throws BusinessException
     */
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/starQueryList", method = RequestMethod.GET)
    public String starQueryList(Model model,@RequestParam Map<String, Object> paramMap,@LogOperatorAnn String flowNum,HttpSession session) throws BusinessException {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map resultMap = new HashMap();
        Map<String, Object> param = new HashMap<String, Object>();
        Integer nowPage = 1;
        Integer pageSize = 10;
        Integer totalSize = 0;
        try {
        	paramMap.put("diffPlace", "local");
        	paramMap.put("identidies_type", "接入号码");
        	paramMap.put("identityCd", "");
        	paramMap.put("identityNum", "");
        	paramMap.put("partyName", "");
        	paramMap.put("queryType", "");
        	paramMap.put("queryTypeValue", "");
			resultMap = custBmo.queryCustInfo(paramMap,
					flowNum, sessionStaff);
			 List custInfos = new ArrayList();
			 if (MapUtils.isNotEmpty(resultMap)) {
				custInfos=(List<Map<String, Object>>) resultMap.get("custInfos");
				if(custInfos.size()>0){
					Map custInfo =(Map)custInfos.get(0);
					String idCardNumber = (String) custInfo.get("idCardNumber");
					session.setAttribute(SysConstant.IDCARDNUMBER+String.valueOf(paramMap.get("acctNbr")), idCardNumber);
                	param.put("identityCd", "");
                	param.put("identityNum", idCardNumber);
                	param.put("queryType", "11");
                	param.put("queryTypeValue", String.valueOf(paramMap.get("acctNbr")));
                	param.put("password", "");
                	param.put("areaId", String.valueOf(paramMap.get("areaId")));
                	Map<String, Object> returnMap = orderBmo.queryIntegral(param, flowNum, sessionStaff);
                    List<Map<String, Object>> pointInfolist = null;
                    Map<String, Object> custInfoMap = null;
                    Map<String, Object> pointInfoMap = null;
                    Map<String, Object> membershipLevelInfoMap = null;
                    String code = (String) returnMap.get("resultCode");
					if (ResultCode.R_SUCC.equals(code) && returnMap.get("custInfo") !=null  && returnMap.get("membershipLevelInfo") !=null 
							&& returnMap.get("pointInfo") !=null) {
	                    	Object objCust = returnMap.get("custInfo");
	                        if (objCust instanceof Map) {
	                        	custInfoMap = (Map<String, Object>) objCust;
	                        } else {
	                        	custInfoMap = new HashMap<String, Object>();
	                        	custInfoMap.putAll((Map<String, Object>) objCust);
	                        }
	                    	
	                        Object objmembershipLevelInfo = returnMap.get("membershipLevelInfo");
	                        if (objmembershipLevelInfo instanceof Map) {
	                        	membershipLevelInfoMap = (Map<String, Object>) objmembershipLevelInfo;
	                        } else {
	                        	membershipLevelInfoMap = new HashMap<String, Object>();
	                        	membershipLevelInfoMap.putAll((Map<String, Object>) objmembershipLevelInfo);
	                        }
	                        
	                    	Object objPointInfo = returnMap.get("pointInfo");
	                        if (objPointInfo instanceof Map) {
	                        	pointInfoMap = (Map<String, Object>) objPointInfo;
	                        } else {
	                        	pointInfoMap = new HashMap<String, Object>();
	                        	pointInfoMap.putAll((Map<String, Object>) objPointInfo);
	                        }
	                        
	                        Object obj = pointInfoMap.get("pointitems");
	                        if (obj instanceof List) {
	                        	pointInfolist = (List<Map<String, Object>>) obj;
	                        } else {
	                        	pointInfolist = new ArrayList<Map<String, Object>>();
	                        	pointInfolist.add((Map<String, Object>) obj);
	                        }
	                        List<Map<String, Object>> pointlist = new ArrayList<Map<String, Object>>();
	                        for(int i=0;i<pointInfolist.size();i++){
	                        	Map<String, Object> map= pointInfolist.get(i);
	                        	if("100300".equals(map.get("pointItemID")) || "100800".equals(map.get("pointItemID")) || "100600".equals(map.get("pointItemID"))){
	                        		pointlist.add(pointInfolist.get(i));
	                        	}
	                        }
	                        PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(nowPage, pageSize, totalSize < 1 ? 1
	                                : totalSize, pointlist);
	                        model.addAttribute("pageModel", pm);
	                        model.addAttribute("pointInfoMap", pointInfoMap);
	                        model.addAttribute("code", code);
	                        model.addAttribute("custInfoMap", custInfoMap);
	                        model.addAttribute("acctNbr",String.valueOf(paramMap.get("acctNbr")));
	                        model.addAttribute("membershipLevelInfoMap", membershipLevelInfoMap);
	                        model.addAttribute("areaName", custInfo.get("areaName"));
					}
				}else{
					model.addAttribute("code", "-1");
				}
			}
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, param, ErrorCode.QUERY_INTEGRAL);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_INTEGRAL, e, param);
		}
        return "/cust/starServiceQueryList";
    }
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/starQueryHisList", method = RequestMethod.POST)
    public String starQueryHisList(Model model,@RequestBody Map<String, Object> paramMap,@LogOperatorAnn String flowNum,HttpSession session) throws BusinessException {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        List<Map<String, Object>> pointHistory = null;
        Integer nowPage = 1;
        Integer pageSize = 10;
        Integer totalSize = 0;
        if(StringUtils.isNotEmpty(String.valueOf(paramMap.get("queryTypeValue")))){
        	String idCardNumber = (String) session.getAttribute(SysConstant.IDCARDNUMBER+String.valueOf(paramMap.get("queryTypeValue")));
        	if(StringUtils.isNotEmpty(idCardNumber)){
        		paramMap.put("identityCd", "");
        		paramMap.put("identityNum", idCardNumber);
        		paramMap.put("queryType", "11");
        		paramMap.put("password", "");
            	try {
					Map<String, Object> returnMap = orderBmo.queryStarHisList(paramMap, flowNum, sessionStaff);
					String code = (String) returnMap.get("resultCode");
					if (ResultCode.R_SUCC.equals(code) && returnMap.get("pointCosumeHistory")!=null) {
						Object obj = returnMap.get("pointCosumeHistory");
						if (obj instanceof List) {
							pointHistory = (List<Map<String, Object>>) obj;
                        } else {
                        	pointHistory = new ArrayList<Map<String, Object>>();
                        	pointHistory.add((Map<String, Object>) obj);
                        }
					}
					model.addAttribute("code", code);
				} catch (BusinessException be) {
					return super.failedStr(model, be);
				} catch (InterfaceException ie) {
					return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_STARBONUSHIS);
				} catch (Exception e) {
					return super.failedStr(model, ErrorCode.QUERY_STARBONUSHIS, e, paramMap);
				}
        	}
        }
        PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(nowPage, pageSize, totalSize < 1 ? 1
                : totalSize, pointHistory);
        model.addAttribute("pageModel", pm);
        return "/cust/starServiceQueryHisList";
    }
    
}
