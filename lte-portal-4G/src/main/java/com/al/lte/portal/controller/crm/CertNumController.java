package com.al.lte.portal.controller.crm;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.PageModel;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.PageUtil;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.CmBmo;
import com.al.lte.portal.bmo.crm.CustBmo;
import com.al.lte.portal.common.Const;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;
/**
 * 一证五号 - 证件关系查询
 * @author wangdan6
 *
 */
@Controller("com.al.lte.portal.controller.crm.CertNumController")
@RequestMapping("/cm/*")
public class CertNumController  extends BaseController {
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CmBmo")
	private CmBmo cmBmo;
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CustBmo")
	private CustBmo custBmo;
	
	@RequestMapping(value = "/main", method = RequestMethod.GET)
	public String main(Model model, HttpServletRequest request,HttpSession httpSession) {
		Map<String, Object> m = new HashMap<String, Object>();
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(request,
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		m.put("partyTypeCd", -1);
		Map<String, Object> rMap;
		try {
			rMap = this.custBmo.queryCertType(m, "", sessionStaff);
			List<Map<String, Object>> list = (List<Map<String, Object>>) rMap.get("result");
			model.addAttribute("list",list);
		}catch (Exception e) {
			
		}
		return "/query/cert-num-rel";
	}
    /**
	 * 查询证件号码关系清单
	 * 
	 * @param model
	 * @param request
	 * @param session
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/queryCmRelList", method = RequestMethod.GET)
	public String queryRepairList(@RequestParam("strParam") String param,
			Model model, @LogOperatorAnn String flowNum,
			HttpServletResponse response, HttpServletRequest request,
			HttpSession httpSession) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(request,
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		String	 curPage = "1" ;
	    String pageSize = "10" ;
	    String totalSize = "0" ;
	    
	 
	    Map<String, Object> paramMap =  JsonUtil.toObject(param, Map.class);
	    //安全
	    
//		Map<String,Object> contractRootMap = (Map<String, Object>) paramMap.get("ContractRoot");
//		Map<String,Object> svcCont = (Map<String, Object>) contractRootMap.get("SvcCont");
		
		
//		String certNumber =  (String) request.getSession().getAttribute(Const.CACHE_CERTINFO);
//		if(certNumber == null || !certNumber.equals(svcCont.get("certNum"))){
//			super.addHeadCode(response, ResultConstant.ACCESS_NOT_NORMAL); 
//			return "/query/cert-num-rel-list";
//		}
		
		
	    Map<String, Object> map = new HashMap<String, Object>();
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		try {
			
			map = cmBmo.queryCertNumRelList(paramMap, flowNum,
					sessionStaff);
			 if (ResultCode.R_SUCCESS.equals(map.get("code"))) {
				if(map!=null&&map.get("certPhoneNumRel")!=null){
	        		    list = (List<Map<String, Object>>)map.get("certPhoneNumRel");
	        			Map<String,Object> mapPageInfo = (Map<String,Object>)map.get("pageRes");
	        			curPage = (String) mapPageInfo.get("pageIndex");
	        			totalSize = (String)mapPageInfo.get("totalCount");
	        			model.addAttribute("totalNum", totalSize);
				}
        	}else{
        		return super
    					.failedStr(model, ErrorCode.QUERY_CERT_NUM_REL, map, paramMap);
        	}
        } catch (BusinessException e) {
			this.log.error("查询信息失败", e);
			super.addHeadCode(response, ResultConstant.SERVICE_RESULT_FAILTURE);  
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap,	
					ErrorCode.QUERY_CERT_NUM_REL);
		} catch (Exception e) {
			return super
					.failedStr(model, ErrorCode.QUERY_CERT_NUM_REL, e, paramMap);
		}
	    PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(
	    		Integer.valueOf(curPage),
	    		Integer.valueOf(pageSize),
        		Integer.valueOf(totalSize)<1?1:Integer.valueOf(totalSize),
				list);
		model.addAttribute("pageModel", pm);
        return "/query/cert-num-rel-list";
	}
}
