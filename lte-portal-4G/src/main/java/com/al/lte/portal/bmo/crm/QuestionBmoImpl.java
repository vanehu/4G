package com.al.lte.portal.bmo.crm;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Service;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.HttpRequest;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.MDA;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.model.SessionStaff;

import net.sf.json.JSONObject;

/**
 * 用户满意度调查问卷统一接口实现类
 * 
 * @author ynhuang
 * @date 2017-07-07
 * @version 1.0v
 */
@Service("com.al.lte.portal.bmo.crm.QuestionBmo")
public class QuestionBmoImpl implements QuestionBmo {
	private final Log log = Log.getLog(getClass());

	// 问卷调查员工查询接口实现
	public Map<String, Object> queryStaff(Map<String, Object> param, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();

		String paramString = JsonUtil.toString(param);
		String URL = MDA.CSB_HTTP_QUESTION_EMP + PortalServiceCode.QUESTION_EMP_INFO;

		String sr = HttpRequest.sendPost("http://10.140.28.122:8070/ses_intf/queryStaff.do", "param=" + paramString);
		System.out.println(sr);

		Map<String, Object> returnMap = new HashMap<String, Object>();

		JSONObject jasonObject = JSONObject.fromObject(sr);
		resultMap = (Map) jasonObject;
		try {
			if ("true".equals(resultMap.get("success").toString())) {
				// 表示接口调用成功
				Map<String, Object> dataMap = (Map) resultMap.get("data");
				returnMap.put("state", dataMap.get("state"));
				returnMap.putAll(dataMap);

			} else {
				returnMap.put("state", ResultCode.R_FAIL);
				returnMap.put("msg", resultMap.get("message"));
			}
		} catch (Exception e) {
			throw new BusinessException(ErrorCode.QUERY_QUESTION_EMP, param, returnMap, e);
		}

		return returnMap;
	}

	// 问卷调查题目查询接口实现
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryTerm(Map<String, Object> param) throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();

		// 参数格式化为json字符串
		String paramString = "";
		paramString = JsonUtil.toString(param);
		// URL地址的拼接
		// String URL = MDA.CSB_HTTP_QUESTION_EMP +
		// PortalServiceCode.QUESTION_INFO;

		// String sr =
		// HttpRequest.sendPost("http://10.140.28.122:8070/ses_intf/queryTerm.do",
		// "param=" + paramString);
		// System.out.println("返回的sr的值为：" + sr);
		// String sr =
		// "{'message':null,'data':{'term':{'create_date':'2017-07-12
		// 17:07:57','term_id':'1','system_id':'102','term_welcome':'您好，感谢您参与由集团企业信息化事业部发起的IT系统用户满意度问卷调查，想邀请您用几分钟时间帮忙填写这份问卷。本问卷实行匿名制，所有数据只用于统计分析，请您根据实际情况填写，您的建议将帮助我们持续优化改进IT系统，提升集团集约运营水平，再次感谢！','term_name':'逆向考核满意度分析系统测试问卷'},'notsatisfy_option':[{'notsatisfy_option_name':'不满意原因1','notsatisfy_option_id':'1','option_id':'3','question_id':'2'},{'notsatisfy_option_name':'不满意原因2','notsatisfy_option_id':'2','option_id':'3','question_id':'2'},{'notsatisfy_option_name':'不满意原因3','notsatisfy_option_id':'3','option_id':'3','question_id':'2'}],'question':[{'parent_question_id':'0','question_type':'1','is_request':'0','question_name':'一、多级标题测试','question_id':'1'},{'parent_question_id':'0','question_type':'2','is_request':'1','question_name':'二、单选题测试','question_id':'2'},{'parent_question_id':'0','question_type':'3','is_request':'0','question_name':'三、多选题加非必填测试','question_id':'3'},{'parent_question_id':'0','question_type':'4','is_request':'0','question_name':'四、纯文本框测试','question_id':'4'},{'parent_question_id':'1','question_type':'2','is_request':'1','question_name':'1、子题目1','question_id':'5'},{'parent_question_id':'1','question_type':'3','is_request':'1','question_name':'2、子题目2','question_id':'6'}],'option':[{'option_name':'单选测试选项1','option_id':'1','question_id':'2','not_satisfy':'0'},{'option_name':'单选测试选项2','option_id':'2','question_id':'2','not_satisfy':'0'},{'option_name':'单选测试选项3(不满意)','option_id':'3','question_id':'2','not_satisfy':'1'},{'option_name':'多选测试选项1','option_id':'1','question_id':'3','not_satisfy':'0'},{'option_name':'多选测试选项2','option_id':'2','question_id':'3','not_satisfy':'0'},{'option_name':'多选测试选项3','option_id':'3','question_id':'3','not_satisfy':'0'},{'option_name':'子题目1选项1','option_id':'1','question_id':'5','not_satisfy':'0'},{'option_name':'子题目1选项2','option_id':'2','question_id':'5','not_satisfy':'0'},{'option_name':'子题目2选项1','option_id':'1','question_id':'6','not_satisfy':'0'},{'option_name':'子题目2选项2','option_id':'2','question_id':'6','not_satisfy':'0'}]},'success':true}";

		Map<String, Object> returnMap = new HashMap<String, Object>();

		String sr = MySimulateData.getInstance().getJson("QUESTION_INFO");
		System.out.println(sr);

		resultMap = JsonUtil.toObject(sr, Map.class);

		try {
			if ("true".equals(MapUtils.getString(resultMap, "success", ""))) {
				// 表示接口调用成功
				returnMap = MapUtils.getMap(resultMap, "data", new HashMap<String, Object>());
				returnMap.put("state", ResultCode.R_SUCCESS);
				resultMap.put("success", "true");

			} else {
				returnMap.put("state", ResultCode.R_FAIL);
				returnMap.put("msg", MapUtils.getString(resultMap, "message", "未知异常"));
			}
		} catch (Exception e) {
			throw new BusinessException(ErrorCode.QUERY_QUESTION, param, returnMap, e);
		}

		return returnMap;
	}

	// 问卷结果回写接口
	public Map<String, Object> return_result(Map<String, Object> param, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(param, PortalServiceCode.QUESTION_RESET, "", sessionStaff);
		try {
			Integer flag = Integer.parseInt((StringUtils.defaultString(db.getResultCode())));
			String Msg = StringUtils.defaultString(db.getResultMsg());
			Map<String, Object> returnMap = new HashMap<String, Object>();
			returnMap.put("code", flag);
			returnMap.put("message", Msg);
			System.out.println("提交成功.......");
			return returnMap;
		} catch (Exception e) {
			log.error("门户处理系统管理的问卷结果写会异常", e);
			throw new BusinessException(ErrorCode.INSERT_QUESTION_RESET, param, db.getReturnlmap(), e);
		}
	}

}
