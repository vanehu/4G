package com.al.lte.portal.controller.crm;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
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
import org.springframework.web.bind.annotation.ResponseBody;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.util.HttpRequest;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.MD5Utils;
import com.al.ecs.common.util.MDA;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.QuestionBmo;
import com.al.lte.portal.common.Base64;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 用户满意度调查问卷
 * 
 * @author ynhuang
 * @date 2017-07-07
 * @version 1.0v
 */

@Controller("com.al.lte.portal.controller.crm.QuestionNaireController")
@RequestMapping("/user/questionnaire/*")
public class QuestionNaireController extends BaseController {

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.QuestionBmo")
	private QuestionBmo questionBmo;

	@RequestMapping(value = "/main", method = RequestMethod.GET)
	public String main(Model model, HttpServletRequest request, HttpServletResponse response, HttpSession httpSession) {
		// 1、员工查询接口，返回员工本季度是否已填写过等等 某些信息，接口名：queryStaff
		// 1.1、获取当前登录的用户信息
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(request,
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		// 1.2、系统id
		String system_id = SysConstant.QESTION_SYS_ID;
		// 1.3、时间戳
		SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
		java.util.Date date = new java.util.Date();
		String timestamp = sdf.format(date);
		// 1.4、token令牌加密
		// token:加密方式为:token= system_id+timestamp+key先做md5小写32位加密再做base64加密
		String token = Base64.encode(MD5Utils.encode(system_id + timestamp + MDA.QESTION_KEY).getBytes());

		Map<String, Object> userList = new HashMap<String, Object>();
		Map<String, Object> param = new HashMap<String, Object>();
		param.put("staff_code", sessionStaff.getStaffCode());
		param.put("system_id", system_id);
		param.put("timestamp", timestamp);
		param.put("token", token);
		try {
			userList = questionBmo.queryStaff(param, sessionStaff);
			// model.addAttribute("userList", userList);
			// 2、员工本季度是否已填写过 0- 否（答题） 1- 是（进入系统） 2- 样本数已达标，无须填写（进入系统）
			if ("0".equals(MapUtils.getString(userList, "state"))) {
				return "/questionnaire/demo";
			} else if ("2".endsWith(userList.get("state").toString())) {
				return "/questionnaire/notanswer";
			} else {
				// String contextPath = request.getContextPath();
				// contextPath = contextPath + "/main/home";
				// java.io.PrintWriter out = response.getWriter();
				// out.println("<html>");
				// out.println("<script>");
				// out.println("window.open ('" + contextPath + "','_top')");
				// out.println("</script>");
				// out.println("</html>");
				return "/questionnaire/success";

			}
		} catch (BusinessException e) {
			this.log.error("查询信息失败", e);
			super.addHeadCode(response, ResultConstant.SERVICE_RESULT_FAILTURE);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, param, ErrorCode.QUERY_QUESTION_EMP);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_QUESTION_EMP, e, param);
		}
		return null;

	}

	// 进入答题阶段，题目查询接口，接口名：queryTerm,,user-questionnaire
	@RequestMapping(value = "/queryTerm", method = RequestMethod.GET)
	@ResponseBody
	public JsonResponse queryTerm(Model model, HttpServletRequest request, HttpServletResponse response,
			HttpSession httpSession) {
		// 1.1、系统id
		String system_id = SysConstant.QESTION_SYS_ID;
		// 1.2、问卷角色
		String role_cd = "1";
		// 1.3、时间戳
		SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
		java.util.Date date = new java.util.Date();
		String timestamp = sdf.format(date);
		// 1.4、token令牌加密
		String token = Base64.encode(MD5Utils.encode(system_id + timestamp + MDA.QESTION_KEY).getBytes());

		Map<String, Object> termMap = new HashMap<String, Object>();
		Map<String, Object> param = new HashMap<String, Object>();
		param.put("system_id", system_id);
		param.put("role_cd", role_cd);
		param.put("timestamp", timestamp);
		param.put("token", token);

		try {
			termMap = questionBmo.queryTerm(param);
			// model.addAttribute("termList", termList);MapUtils.getString

			if (ResultCode.R_SUCCESS.equals(MapUtils.getString(termMap, "state"))) {
				return super.successed(termMap, ResultConstant.SUCCESS.getCode());
			} else {
				String contextPath = request.getContextPath();
				contextPath = contextPath + "/main/home";
				java.io.PrintWriter out = response.getWriter();
				out.println("<html>");
				out.println("<script>");
				out.println("window.open ('" + contextPath + "','_top')");
				out.println("</script>");
				out.println("</html>");
				out.close();
			}
		} catch (BusinessException e) {
			this.log.error("题目查询失败", e);
			return super.failed(e);
		} catch (IOException e) {
			log.error("IO流异常", e);
		} catch (Exception e) {
			this.log.error("查询接口失败", e);
			return super.failed(ErrorCode.QUERY_QUESTION, e, termMap);
		}
		return null;

	}

	// 提交问卷处理,问卷结果回写接口,接口名: return_result
	@RequestMapping(value = "/returnResult", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse commitQuestion(@RequestBody Map<String, Object> param, Model model, HttpServletRequest request,
			HttpServletResponse response, HttpSession httpSession) {
		// 1、获取答题的所有结果
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(request,
				SysConstant.SESSION_KEY_LOGIN_STAFF);

		// 1.1、系统id
		String system_id = SysConstant.QESTION_SYS_ID;
		// 1.2、时间戳
		SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
		java.util.Date date = new java.util.Date();
		String timestamp = sdf.format(date);
		// 1.3、token令牌加密
		String token = Base64.encode(MD5Utils.encode(system_id + timestamp + MDA.QESTION_KEY).getBytes()).replace("\r\n", "");

		param.put("system_id", system_id);
		param.put("timestamp", timestamp);
		param.put("token", token);

		Map<String, Object> tempMap = param;
		// tempMap.remove("question");

		String paramString = JsonUtil.toString(tempMap);
		String sr = HttpRequest.sendPost("http://10.140.28.122:8070/ses_intf/return_result.do", "param=" + paramString);

		Map<String, Object> resultMap = JsonUtil.toObject(sr, Map.class);
		Map<String, Object> dataMap = null;
		try {
			if ("true".equals(MapUtils.getString(resultMap, "success"))) {
				// 表示接口调用
				dataMap = questionBmo.return_result(param, sessionStaff);
			} else {
				return super.failed(ErrorCode.QUERY_QUESTION, "", dataMap);
			}
		} catch (Exception e) {
			log.error("题目结果回写失败", e);
			return super.failed(ErrorCode.QUERY_QUESTION, e, dataMap);
		}
		// 2、问卷结果回写
		return super.successed(dataMap, ResultConstant.SUCCESS.getCode());

	}

	@RequestMapping(value = "/forwardSuccess", method = RequestMethod.GET)
	public String forwardSuccess() {

		return "/questionnaire/success";

	}

}
