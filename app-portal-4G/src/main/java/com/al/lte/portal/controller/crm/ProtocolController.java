package com.al.lte.portal.controller.crm;

import java.util.List;
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

import com.al.common.utils.DateUtil;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.entity.PageModel;
import com.al.ecs.common.util.MapUtil;
import com.al.ecs.common.util.PageUtil;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.ProtocolBmo;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 新增 - 政企协议
 * 
 * @author wangdan6
 * 
 */
@Controller("com.al.lte.portal.controller.crm.ProtocolController")
@RequestMapping("/protocol/*")
public class ProtocolController extends BaseController {

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.ProtocolBmo")
	private ProtocolBmo protocolBmo;

	/**
	 * 查询协议
	 * 
	 * @param model
	 * @param param
	 * @return
	 */
	@RequestMapping(value = "/preQueryProtocol", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String queryProtocol(Model model,
			@RequestParam Map<String, Object> param) {
		return "/protocol/protocol-main";
	}
	/**
	 * 添加协议
	 * 
	 * @param model
	 * @param param
	 * @return
	 */
	@RequestMapping(value = "/preAddProtocol", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String preAddProtocol(Model model,
			@RequestParam Map<String, Object> param,@LogOperatorAnn String flowNum) {
		try {
			SessionStaff sessionStaff = (SessionStaff) ServletUtils
					.getSessionAttribute(super.getRequest(),
							SysConstant.SESSION_KEY_LOGIN_STAFF);
			Map<String, Object> datamap = protocolBmo.geProtocolNbrSeq(param, flowNum, sessionStaff);
			if (datamap != null) {
				String code = (String) datamap.get("code");
				if (ResultCode.R_SUCCESS.equals(code)) {
					String prtotNbr =  (String)datamap.get("prtotNbr");
					if(prtotNbr == null){
						prtotNbr = "";
					}
					model.addAttribute("prtotNbr", sessionStaff.getAreaId().substring(0, 3) + String.format("%09d", Integer.parseInt(prtotNbr)));// 000000001 prtotNbr.substring(0));  
				}
			}
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, null,
					ErrorCode.QUERY_PROTOCOL);
		} catch (Exception e) {
			return super
					.failedStr(model, ErrorCode.QUERY_PROTOCOL, e, null);
		}
		return "/protocol/protocol-create-main";
	}

	/**
	 * 查询协议 列表
	 * 
	 * @param params
	 * @param model
	 * @param flowNum
	 * @param session
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryProtocolList", method = RequestMethod.GET)
	public String queryProtocolList(@RequestParam Map<String, Object> paramMap,
			Model model, @LogOperatorAnn String flowNum, HttpSession session)
			throws BusinessException {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		paramMap.put("areaId", sessionStaff.getAreaId());
		paramMap.put("staffId", sessionStaff.getStaffId());
		paramMap.put("channelId", sessionStaff.getCurrentChannelId());
		try {
			Map<String, Object> datamap = protocolBmo.queryProtocol(paramMap,
					null, sessionStaff);
			if (datamap != null) {
				String code = (String) datamap.get("code");
				if (ResultCode.R_SUCCESS.equals(code)) {
					Map<String, Object> tempMap = MapUtil.map(datamap, "page");
					int totalSize = MapUtils.getInteger(tempMap, "totalSize");
					// 设置分页对象信息
					PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(
							MapUtils.getIntValue(paramMap, "curPage", 1),
							MapUtils.getIntValue(paramMap, "pageSize", 10),
							totalSize<1?1:totalSize,
							(List<Map<String, Object>>)datamap.get("protInfos"));
					model.addAttribute("pageModel", pm);
					//model.addAttribute("protInfos", datamap.get("protInfos"));// 协议查询列表
				}
			}
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap,
					ErrorCode.QUERY_PROTOCOL);
		} catch (Exception e) {
			return super
					.failedStr(model, ErrorCode.QUERY_PROTOCOL, e, paramMap);
		}
		return "/protocol/protocol-list";
	}

	/**
	 * 协议编码 查询
	 * 
	 * @param param
	 * @param flowNum
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/queryProtocolNbr", method = RequestMethod.GET)
	@ResponseBody
	public JsonResponse queryProtocolNbr(
			@RequestParam Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			rMap = protocolBmo.queryProtocolNbr(param, flowNum, sessionStaff);
			if (rMap != null
					&& ResultCode.R_SUCC.equals(rMap.get("resultCode")
							.toString())) {
				jsonResponse = super.successed(rMap.get("result"),
						ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap, 1);
			}

		} catch (BusinessException be) {
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.QUERY_PROTOCOL_NBR);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_PROTOCOL_NBR, e, param);
		}
		return jsonResponse;
	}

	/**
	 * 查询协议关联的销售品
	 * 
	 * @param param
	 * @param flowNum
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/queryProtocolOffer", method = RequestMethod.GET)
	@ResponseBody
	public JsonResponse queryProtocolOffer(
			@RequestParam Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		param.put("areaId", sessionStaff.getAreaId());
		try {
			rMap = protocolBmo.queryProtocolOffer(param, flowNum,
					sessionStaff); 
			if (rMap != null
					&& ResultCode.R_SUCC.equals(rMap.get("code")
							.toString())) {
				jsonResponse = super.successed(rMap.get("prodOfferInfos"),
						ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap, 1);
			}

		} catch (BusinessException be) {
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.QUERY_PROTOCOL_OFFER);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_PROTOCOL_OFFER, e, param);
		}
		return jsonResponse;
	}

	/**
	 * 保存销售品
	 * 
	 * @param param
	 * @param flowNum
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/addProtocol", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse addProtocol(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			Map<String, Object> protMap  = (Map<String, Object>) param.get("protInfo");
			protMap.put("staffId", sessionStaff.getStaffId());
			protMap.put("channelId", sessionStaff.getCurrentChannelId());
		//	protMap.put("protSoNumber",
		//			sessionStaff.getAreaId().substring(0, 2) + protMap.get("protSoNumber")); 
			protMap.put("protocolRecordDate", DateUtil.getNowDefault()); // 数据库时间
           	rMap = protocolBmo.addProtocol(param, flowNum, sessionStaff);
			if (rMap != null
					&& ResultCode.R_SUCC.equals(rMap.get("code")
							.toString())) {
				jsonResponse = super.successed(rMap,
						ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap, 1);
			}
		} catch (BusinessException be) {
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.ADD_PROTOCOL);
		} catch (Exception e) {
			return super.failed(ErrorCode.ADD_PROTOCOL, e, param);
		}
		return jsonResponse;
	}

	/**
	 * 查询协议关联的销售品 详情
	 * 
	 * @param param
	 * @param flowNum
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/queryProtocolOfferDetail", method = RequestMethod.GET)
	public String queryProtocolOfferDetail(
			@RequestParam Map<String, Object> param, Model model,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		try {
			param.put("areaId", sessionStaff.getCurrentAreaId());
			Map<String, Object> datamap = protocolBmo.queryProtocolOfferDetail(
					param, flowNum, sessionStaff);
			if (datamap != null) {
				String code = (String) datamap.get("code");
				if (ResultCode.R_SUCCESS.equals(code)) {
					
					Map<String, Object> tempMap = MapUtil.map(datamap, "page");
					int totalSize = MapUtils.getInteger(tempMap, "totalSize");
					// 设置分页对象信息
					PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(
							MapUtils.getIntValue(param, "curPage", 1),
							MapUtils.getIntValue(param, "pageSize", 10),
							totalSize<1?1:totalSize,
							(List<Map<String, Object>>)datamap.get("prodOfferInfos"));
					model.addAttribute("pageModel", pm);
					//model.addAttribute("prodOfferInfos", datamap.get("prodOfferInfos"));// 协议查询列表
				}
			}
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, param,
					ErrorCode.QUERY_PROTOCOL_OFFER_DETAIL);
		} catch (Exception e) {
			return super.failedStr(model,
					ErrorCode.QUERY_PROTOCOL_OFFER_DETAIL, e, param);
		}
		return "/protocol/protocol-sub-list";
	}

}
