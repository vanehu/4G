package com.al.lte.portal.controller.crm;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
import org.springframework.web.context.request.WebRequest;

import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.entity.PageModel;
import com.al.ecs.common.util.PageUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.annotation.session.SessionValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.core.DataRepository;
import com.al.lte.portal.model.SessionStaff;

/**
 * 订单查询
 * 
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 上午10:03:44
 * @modifyDate
 * @copyRight 亚信联创EC研发部
 */
@Controller("com.al.lte.portal.controller.crm.OrderQueryController")
@RequestMapping("/orderQuery/*")
public class OrderQueryController extends BaseController {
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
	private StaffBmo staffBmo;
	
	@Autowired
	PropertiesUtils propertiesUtils;
	 
	@RequestMapping(value = "/main", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String main(Model model,HttpSession session,@LogOperatorAnn String flowNum) throws AuthorityException {
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"orderQuery/main"));
		
		Calendar c = Calendar.getInstance();
		SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd");
		String endTime = f.format(c.getTime());
		c.add(Calendar.DATE, -7);
		String startTime = f.format(c.getTime());
		
		model.addAttribute("p_startTime", startTime);
		model.addAttribute("p_endTime", endTime);
		
		return "/orderQuery/order-main";
    }
	
	public String list(HttpSession session,@RequestParam Map<String, Object> param,Model model) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> dataBusMap = new HashMap<String, Object>(); 
        
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        Integer curPage = 1 ;
        Integer pageSize = 10 ;
        Integer totalSize = 0 ;
        if (sessionStaff != null) {
        	
        	String areaId = MapUtils.getString(param, "p_areaId");
        	
        	String startDt = MapUtils.getString(param, "p_startTime") ;
        	String endDt = MapUtils.getString(param, "p_endTime") ;
        	
        	String channelId = MapUtils.getString(param, "p_channelId") ;
        	
        	String olNbr = MapUtils.getString(param, "p_olNbr") ;
        	String accessNumber = MapUtils.getString(param, "p_hm") ;
        	
        	String bussType = MapUtils.getString(param, "p_bussType") ;
        	String orderStatus = MapUtils.getString(param, "p_orderStatus") ;
        	
        	String partyId = MapUtils.getString(param, "p_partyId") ;
        	
        	curPage = Integer.parseInt(MapUtils.getString(param, "curPage")) ;
        	pageSize = Integer.parseInt(MapUtils.getString(param, "pageSize")) ;
        	
        	dataBusMap.put("areaId", areaId);
        	dataBusMap.put("startDt", startDt);
        	dataBusMap.put("endDt", endDt);
        	
        	if(channelId!=null&&!channelId.equals("")&&!channelId.equals("null")){
        		dataBusMap.put("channelId", channelId);
        	}
        	if(olNbr!=null&&!olNbr.equals("")&&!olNbr.equals("null")){
        		dataBusMap.put("olNbr", olNbr);
        	}
        	if(accessNumber!=null&&!accessNumber.equals("")&&!accessNumber.equals("null")){
        		dataBusMap.put("accessNumber", accessNumber);
        	}
        	if(bussType!=null&&!bussType.equals("")&&!bussType.equals("null")){
        		dataBusMap.put("bussType", bussType);
        	}
        	if(orderStatus!=null&&!orderStatus.equals("")&&!orderStatus.equals("null")){
        		dataBusMap.put("orderStatus", orderStatus);
        	}
        	if(partyId!=null&&!partyId.equals("")&&!partyId.equals("null")){
        		dataBusMap.put("partyId", partyId);
        	}
        	dataBusMap.put("curPage", curPage);
        	dataBusMap.put("pageSize", pageSize);
        	Map<String,Object> map = null;
			try {
				map = orderBmo.qryOrderList(dataBusMap, null, sessionStaff);
			} catch (BusinessException be) {

				return super.failedStr(model, be);
			} catch (InterfaceException ie) {

				return super.failedStr(model, ie, dataBusMap, ErrorCode.ORDER_QUERY);
			} catch (Exception e) {
				log.error("订单查询/orderQuery/list方法异常", e);
				return super.failedStr(model, ErrorCode.ORDER_QUERY, e, dataBusMap);
			}
        	
        	if(map!=null&&map.get("orderListDetailInfo")!=null){
        		Map<String,Object> orderListDetailInfo =(Map<String,Object>)map.get("orderListDetailInfo");
        		if(orderListDetailInfo!=null){
        			list = (List<Map<String, Object>>)orderListDetailInfo.get("orderListInfo");
        			Map<String,Object> mapPageInfo = (Map<String,Object>)orderListDetailInfo.get("page");
        			curPage = (Integer)mapPageInfo.get("curPage");
        			totalSize = (Integer)mapPageInfo.get("totalSize");
        		}
         	}
        }
        PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(
        		curPage,
        		pageSize,
        		totalSize<1?1:totalSize,
				list);
		model.addAttribute("pageModel", pm);
        return "/orderQuery/order-list";
    }
	
	@RequestMapping(value = "/areaTree", method = RequestMethod.GET)
	public String showCommonRegionTree(WebRequest request,Model model) {
		model.addAttribute("areaType", request.getParameter("areaType"));
		model.addAttribute("areaLeve", request.getParameter("areaLeve"));
		model.addAttribute("areaLimit", request.getParameter("areaLimit"));
		return "orderQuery/area_dic";
	}
	
	@RequestMapping(value="/area", method = RequestMethod.POST)
	public @ResponseBody JsonResponse queryCommonRegionList(HttpSession session,@RequestBody Map<String, Object> param) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		String urlType = param.get("areaType")==null?"":param.get("areaType").toString();
		String areaLimit = param.get("areaLimit")==null?"":param.get("areaLimit").toString();
		if(urlType==null){
			return successed(new ArrayList<Map<String, Object>>());
		}
		Map<String,Object> params = new HashMap<String,Object>();
		params.put("leve", 2);
		params.put("parentAreaId", "");//8100000
		params.put("areaLimit", areaLimit);
		params.put("channelAreaId", sessionStaff.getCurrentAreaId());
		params.put("APPDESC", propertiesUtils.getMessage(SysConstant.APPDESC));
		
		try{
			params.put("dataDimensionCd", MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),SysConstant.AREA_DIMENSION_CD));
			String operateSpecInfo = EhcacheUtil.getOperateSpecInfo(session, urlType);
			if(SysConstant.URL_ORDERUNDO.equals(urlType)){
				operateSpecInfo = SysConstant.GLY;
			}
			List<Map<String, Object>> list = CommonMethods.getAreaRangeList(sessionStaff, params, operateSpecInfo);
			return successed(list);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.OPERAT_AREA_RANGE);
		} catch (BusinessException e) {
			return super.failed(e);
		} catch (Exception e) {
			return super.failed(ErrorCode.OPERAT_AREA_RANGE, e, params);
		}
	}
	
	@RequestMapping(value="/commonRegionChilden", method = RequestMethod.POST)	
	public @ResponseBody JsonResponse queryCommonRegionChilden(@RequestBody Map<String, Object> param,HttpSession session) {
		String urlType = param.get("areaType")==null?"":param.get("areaType").toString();
		if(urlType==null){
			return this.successed(new ArrayList<Map<String, Object>>());
		}
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		try{
			param.put("APPDESC", propertiesUtils.getMessage(SysConstant.APPDESC));
			param.put("dataDimensionCd", MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),SysConstant.AREA_DIMENSION_CD));
			String operateSpecInfo = EhcacheUtil.getOperateSpecInfo(session, urlType);
			List<Map<String, Object>> list = CommonMethods.getAreaRangeList(sessionStaff, param, operateSpecInfo);
			return this.successed(list);
		} catch (InterfaceException ie) {

			return super.failed(ie, param, ErrorCode.OPERAT_AREA_RANGE);
		} catch (Exception e) {
			log.error("门户/orderQuery/commonRegionChilden方法异常", e);
			return super.failed(ErrorCode.OPERAT_AREA_RANGE, e, param);
		}
	}
	
	
	@RequestMapping(value = "/areaTreeManger", method = RequestMethod.GET)
	public String areaTreeManger(WebRequest request,Model model) {
		model.addAttribute("areaType", request.getParameter("areaType"));
		model.addAttribute("areaLeve", request.getParameter("areaLeve"));
		model.addAttribute("areaLimit", request.getParameter("areaLimit"));
		return "orderQuery/area_dic_manager";
	}
	
	@RequestMapping(value="/areaManager", method = RequestMethod.POST)
	public @ResponseBody JsonResponse queryCommonRegionListManager(HttpSession session,@RequestBody Map<String, Object> param) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		String urlType = param.get("areaType")==null?"":param.get("areaType").toString();
		String areaLimit = param.get("areaLimit")==null?"":param.get("areaLimit").toString();
		if(urlType==null){
			return successed(new ArrayList<Map<String, Object>>());
		}
		Map<String,Object> params = new HashMap<String,Object>();
		params.put("leve", 2);
		params.put("parentAreaId", "");//8100000
		params.put("areaLimit", areaLimit);
		params.put("channelAreaId", sessionStaff.getCurrentAreaId());
		params.put("APPDESC", propertiesUtils.getMessage(SysConstant.APPDESC));
		try{
			params.put("dataDimensionCd", MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),SysConstant.AREA_DIMENSION_CD_MANGER));
			String operateSpecInfo = EhcacheUtil.getOperateSpecInfo(session, urlType);
			List<Map<String, Object>> list = CommonMethods.getAreaRangeList(sessionStaff, params, operateSpecInfo);
			return successed(list);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.OPERAT_AREA_RANGE);
		} catch (BusinessException e) {
			return super.failed(e);
		} catch (Exception e) {
			return super.failed(ErrorCode.OPERAT_AREA_RANGE, e, params);
		}
	}
	
	@RequestMapping(value="/commonRegionChildenManager", method = RequestMethod.POST)	
	public @ResponseBody JsonResponse queryCommonRegionChildenManager(@RequestBody Map<String, Object> param,HttpSession session) {
		String urlType = param.get("areaType")==null?"":param.get("areaType").toString();
		if(urlType==null){
			return this.successed(new ArrayList<Map<String, Object>>());
		}
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		try{
			param.put("APPDESC", propertiesUtils.getMessage(SysConstant.APPDESC));
			param.put("dataDimensionCd", MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),SysConstant.AREA_DIMENSION_CD_MANGER));
			String operateSpecInfo = EhcacheUtil.getOperateSpecInfo(session, urlType);
			List<Map<String, Object>> list = CommonMethods.getAreaRangeList(sessionStaff, param, operateSpecInfo);
			return this.successed(list);
		} catch (InterfaceException ie) {

			return super.failed(ie, param, ErrorCode.OPERAT_AREA_RANGE);
		} catch (Exception e) {
			log.error("门户/orderQuery/commonRegionChilden方法异常", e);
			return super.failed(ErrorCode.OPERAT_AREA_RANGE, e, param);
		}
	}
	@SessionValid(value = false)
	//@SessionValid(value = {name})
	@RequestMapping(value = "/areaTreeAll", method = RequestMethod.GET)
	public String areaTreeAll(WebRequest request,Model model) {
		model.addAttribute("areaLeve", request.getParameter("areaLeve"));
		model.addAttribute("areaLimit", request.getParameter("areaLimit"));
		model.addAttribute("areaId", request.getParameter("areaId"));
		return "orderQuery/area_tree_all";
	}
	@SessionValid(value = false)
	@RequestMapping(value="/areaTreeAllMain", method = RequestMethod.POST)
	public @ResponseBody JsonResponse areaTreeAllMain(HttpSession session,@RequestBody Map<String, Object> param,@LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		String areaLimit = param.get("areaLimit")==null?"":param.get("areaLimit").toString();
		//String areaLeve = param.get("areaLeve")==null?"":param.get("areaLeve").toString();
		Map<String,Object> paramS = new HashMap<String,Object>();
		paramS.put("areaLevel", 2);
		paramS.put("upRegionId", "");//8100000
		paramS.put("areaLimit", areaLimit);
		paramS.put("areaId", param.get("areaId")==null?"":param.get("areaId").toString());
		try{
			List<Map<String, Object>> list = staffBmo.areaTreeAllQuery(paramS,flowNum,sessionStaff);
			return successed(list);
		} catch (Exception e) {
			return super.failed(ErrorCode.AREA_ALL, e, param);
		}
	}
	@SessionValid(value = false)
	@RequestMapping(value="/areaTreeAllChilden", method = RequestMethod.POST)	
	public @ResponseBody JsonResponse areaTreeAllChilden(@RequestBody Map<String, Object> param,HttpSession session,@LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		try{
			List<Map<String, Object>> list = staffBmo.areaTreeAllQuery(param,flowNum,sessionStaff);
			return this.successed(list);
		} catch (Exception e) {
			log.error("门户/orderQuery/areaTreeAllChilden方法异常", e);
			return super.failed(ErrorCode.AREA_ALL, e, param);
		}
	}
	/**
	 * 获取平铺的地区选择页
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping(value="/tree_flat", method = RequestMethod.GET)  
	public String treeFlat(WebRequest request,@LogOperatorAnn String flowNum, Model model){
	    SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
	    List<Map<String, Object>> rList = new ArrayList<Map<String, Object>>();
	    Map<String, Object> pMap = new HashMap<String, Object>();
        pMap.put("tableName", "SYSTEM");
        pMap.put("columnName", "AREA_CODE");
	    try {
            rList = (List<Map<String, Object>>)orderBmo.queryAgentPortalConfig(pMap, flowNum, sessionStaff).get("result");
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
	    if(rList!=null&&rList.size()>0){
	        model.addAttribute("area_list", rList.get(0));
	    }
	   
	    return "orderQuery/area_flat";
	}
	
	@RequestMapping(value = "/areaTreeQueryManger", method = RequestMethod.GET)
	public String areaTreeQueryManger(WebRequest request,Model model) {
		model.addAttribute("areaType", request.getParameter("areaType"));
		model.addAttribute("areaLeve", request.getParameter("areaLeve"));
		model.addAttribute("areaLimit", request.getParameter("areaLimit"));
		return "orderQuery/area_query_manager";
	}
	
	@RequestMapping(value="/areaQueryManager", method = RequestMethod.POST)
	public @ResponseBody JsonResponse areaQueryManager(HttpSession session,@RequestBody Map<String, Object> param) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		String urlType = param.get("areaType")==null?"":param.get("areaType").toString();
		String areaLimit = param.get("areaLimit")==null?"":param.get("areaLimit").toString();
		if(urlType==null){
			return successed(new ArrayList<Map<String, Object>>());
		}
		Map<String,Object> params = new HashMap<String,Object>();
		params.put("leve", 2);
		params.put("parentAreaId", "");//8100000
		params.put("areaLimit", areaLimit);
		params.put("channelAreaId", sessionStaff.getCurrentAreaId());
		params.put("APPDESC", propertiesUtils.getMessage(SysConstant.APPDESC));
		try{
			params.put("dataDimensionCd", "area003");
			String operateSpecInfo = EhcacheUtil.getOperateSpecInfo(session, urlType);
			List<Map<String, Object>> list = CommonMethods.getAreaRangeList(sessionStaff, params, operateSpecInfo);
			return successed(list);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.OPERAT_AREA_RANGE);
		} catch (BusinessException e) {
			return super.failed(e);
		} catch (Exception e) {
			return super.failed(ErrorCode.OPERAT_AREA_RANGE, e, params);
		}
	}
	
	@RequestMapping(value="/areaQueryChildenManager", method = RequestMethod.POST)	
	public @ResponseBody JsonResponse areaQueryChildenManager(@RequestBody Map<String, Object> param,HttpSession session) {
		String urlType = param.get("areaType")==null?"":param.get("areaType").toString();
		if(urlType==null){
			return this.successed(new ArrayList<Map<String, Object>>());
		}
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		try{
			param.put("APPDESC", propertiesUtils.getMessage(SysConstant.APPDESC));
			param.put("dataDimensionCd","area003");
			String operateSpecInfo = EhcacheUtil.getOperateSpecInfo(session, urlType);
			List<Map<String, Object>> list = CommonMethods.getAreaRangeList(sessionStaff, param, operateSpecInfo);
			return this.successed(list);
		} catch (InterfaceException ie) {

			return super.failed(ie, param, ErrorCode.OPERAT_AREA_RANGE);
		} catch (Exception e) {
			log.error("门户/orderQuery/commonRegionChilden方法异常", e);
			return super.failed(ErrorCode.OPERAT_AREA_RANGE, e, param);
		}
	}
	
}
