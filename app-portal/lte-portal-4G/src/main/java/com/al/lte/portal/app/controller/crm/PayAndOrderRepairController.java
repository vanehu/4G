package com.al.lte.portal.app.controller.crm;
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
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.context.request.WebRequest;

import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.entity.PageModel;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.PageUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.CartBmo;
import com.al.lte.portal.bmo.crm.CommonBmo;
import com.al.lte.portal.bmo.crm.CustBmo;
import com.al.lte.portal.bmo.crm.MktResBmo;
import com.al.lte.portal.bmo.crm.OfferBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.print.PrintBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.Const;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;



/**
 * 翼销售支付补单
 * 
 * @author yanghm
 * @version V1.0 2017-1-04
 * @createDate 2017-1-04 下午16:03:44 
 * @copyRight 亚信联创EC研发部
 */
@Controller("com.al.lte.portal.app.controller.crm.PayAndOrderRepairController")
@RequestMapping("/app/pay/repair/*")
public class PayAndOrderRepairController extends BaseController{
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CustBmo")
	private CustBmo custBmo;

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.print.PrintBmo")
	private PrintBmo printBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CommonBmo")
	private CommonBmo commonBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
	private StaffBmo staffBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.MktResBmo")
	private MktResBmo MktResBmo;
	

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OfferBmo")
	private OfferBmo offerBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CartBmo")
	private CartBmo cartBmo;
	
	@Autowired
	PropertiesUtils propertiesUtils;
	
	
	/**
	 * 手机客户端-补单入口
	 * @param params
	 * @param request
	 * @param model
	 * @param session
	 * @return
	 */
	@RequestMapping(value = "/prepare", method = RequestMethod.POST)
    @AuthorityValid(isCheck = false)
    public String repairPrepare(Model model,HttpSession session,@LogOperatorAnn String flowNum) throws BusinessException {		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Calendar c = Calendar.getInstance();
		SimpleDateFormat f = new SimpleDateFormat("yyyy/MM/dd");
		String startTime = f.format(c.getTime());	
		model.addAttribute("p_startDt", startTime);
		model.addAttribute("p_areaId", sessionStaff.getCurrentAreaId());
		model.addAttribute("p_channelId", sessionStaff.getCurrentChannelId());
		 return "/app/repair/order_pay_repair";
    }
	
	/**
	 * 受理单列表查询
	 * @param session
	 * @param model
	 * @param request
	 * @return
	 * @throws BusinessException
	 */
    @SuppressWarnings("unchecked")
	@RequestMapping(value = "/cartList", method = RequestMethod.GET)
    public String list(HttpSession session,Model model,WebRequest request) throws BusinessException{
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> param = new HashMap<String, Object>();
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        Integer nowPage = 1 ;
        Integer pageSize = 10 ;
        Integer totalSize = 0 ;
        
        param.put("startDt", request.getParameter("startDt"));
		param.put("endDt", request.getParameter("endDt"));
		param.put("areaId", request.getParameter("areaId"));
		param.put("qryBusiOrder", request.getParameter("qryBusiOrder"));
		
		param.put("channelId", request.getParameter("channelId"));
		param.put("busiStatusCd", request.getParameter("busiStatusCd"));
		param.put("olStatusCd", request.getParameter("olStatusCd"));
		param.put("qryNumber", request.getParameter("qryNumber"));
		param.put("olNbr", request.getParameter("olNbr"));
		param.put("olTypeCd", Const.OL_TYPE_CD);
		param.put("qryCnt", "Y");
		param.put("qryTime", "1");
		
        try{
    		nowPage = Integer.parseInt(request.getParameter("nowPage").toString());
    		pageSize = Integer.parseInt(request.getParameter("pageSize").toString());
    		param.put("nowPage", nowPage);
    		param.put("pageSize", pageSize);
    		
    		Map<String, Object> map = cartBmo.queryCarts(param, null, sessionStaff);
        	if(map!=null&&map.get("orderLists")!=null){
        		list =(List<Map<String, Object>>)map.get("orderLists");
        		totalSize = (Integer)map.get("totalCnt");
        		//判断某个购物车是否为新装，取订购销售品节点的subBusiOrders，判断是否有产品新装
        		for (int i = 0; list != null && i < list.size(); i++) {
        			Map<String, Object> cartMap = list.get(i);
        			List<Map<String, Object>> orderList = (List<Map<String, Object>>) cartMap.get("list");
        			boolean newProdFlag = false;
        			cartMap.put("newProdFlag", "false");
        			for (int j = 0; orderList != null && j < orderList.size(); j++) {
        				Map<String, Object> orderMap = orderList.get(j);
        				String actionClass = MapUtils.getString(orderMap, "actionClass", "");
        				String boActionTypeCd = MapUtils.getString(orderMap, "boActionTypeCd", "");
        				if ("1200".equals(actionClass) && "S1".equals(boActionTypeCd)) {
        					List<Map<String, Object>> subList = (List<Map<String, Object>>) orderMap.get("subBusiOrders");
        					for (int k = 0; subList != null && k < subList.size(); k++) {
        						Map<String, Object> subMap = subList.get(k);
        						String subActionClass = MapUtils.getString(subMap, "actionClass", "");
                				String subBoActionTypeCd = MapUtils.getString(subMap, "boActionTypeCd", "");
                				if ("1300".equals(subActionClass) && "1".equals(subBoActionTypeCd)) {
                					newProdFlag = true;
                					break;
                				}
        					}
        				}
        				if (newProdFlag) {
        					break;
        				}
        			}
        			if (newProdFlag) {
        				cartMap.put("newProdFlag", "true");
        				list.set(i, cartMap);
        			}
        		}
        		
         	}
        	PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(nowPage,pageSize,totalSize<1?1:totalSize,list);
    		model.addAttribute("pageModel", pm);
    		model.addAttribute("code", map.get("code"));
			model.addAttribute("mess", map.get("mess"));
			
        	return "/app/repair/cart-list";
        } catch (BusinessException be) {

			return super.failedStr(model, be);
		} catch (InterfaceException ie) {

			return super.failedStr(model, ie, param, ErrorCode.CUST_ORDER);
		} catch (Exception e) {
			log.error("购物车查询cartList方法异常", e);
			return super.failedStr(model, ErrorCode.CUST_ORDER, e, param);
		}
    }
    
    /**
	 * 翼销售获取订单支付状态
	 * 
	 * @param param
	 * @param model
	 * @param session
	 * @param flowNum
	 * @return
	 */
	@RequestMapping(value = "/queryOrdStatus", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse queryOrdStatus(@RequestBody Map<String, Object> param,
			Model model, HttpSession session, @LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			rMap = cartBmo.queryOrderStatus(param, flowNum, sessionStaff);
			log.debug("return={}", JsonUtil.toString(rMap));
			if (rMap != null && "0".equals(rMap.get("code").toString())) {
				 jsonResponse = super.successed(rMap,ResultConstant.SUCCESS.getCode());
			} else{
				jsonResponse = super.successed(rMap, ResultConstant.FAILD.getCode());
			}
			return jsonResponse;
		} catch (BusinessException be) {
			this.log.error("调用主数据接口失败", be);
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.CUST_ORDER_DETAIL);
		} catch (Exception e) {
			log.error("查询订单状态方法异常", e);
			return super.failed(ErrorCode.CUST_ORDER_DETAIL, e, param);
		}

	}
	
}
