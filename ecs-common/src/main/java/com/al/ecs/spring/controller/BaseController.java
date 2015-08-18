package com.al.ecs.spring.controller;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.exception.ExceptionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.ThemeResolver;

import com.al.ecs.common.entity.JsonError;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.util.EncodeUtils;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.Result;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.exception.SessionException;
import com.al.ecs.exception.InterfaceException.ErrType;
import com.al.ecs.log.Log;
import com.al.ecs.spring.convert.DateConvertEditor;
import com.al.ecs.validator.ActionError;
import com.al.ecs.validator.ActionErrors;
import com.al.ecs.validator.exception.MethodNotJsonValidException;

/**
 * spring controler 超类，所有controller都必须继承.
 * <P>
 * 
 * @author tang zheng yu
 * @version V1.0 2011-12-24
 * @createDate 2011-12-24 下午1:57:06
 * @copyRight 亚信联创电信CRM研发部
 */

public class BaseController {
    /**
     * 日志输出.
     */
    protected final Log log = Log.getLog(getClass());
    /**
     * 响应头返回编码
     * */
    public static final String RESP_CODE = "respCode";
    /**
     * 响应头返回提示信息
     */
    public static final String RESP_MSG = "respMsg";
    

    public static final String THEME_DEFAULT = "default";
   
	@Autowired
	private  HttpServletRequest request;
	
	 @Autowired(required=false)
	 @Qualifier("themeResolver")
	  private ThemeResolver themeResolver;
	/**
	 * current HttpServletRequest
	 * @return HttpServletRequest current request
	 */
	protected HttpServletRequest getRequest() {
		return request;
	}

	/**
	 * redirect 跳转路径
	 * @param path 以/开头的路径
	 * @return String redirect:+path
	 */
	protected String redirect(String path){
		return "redirect:"+path;
	}
	/**
	 * 获取主题名
	 * @return String themeName
	 */
	protected String getTheme(){
		return themeResolver.resolveThemeName(request);
	}
	/**
	 * 以下所有方法都有如下这个请求. <BR>
	 * 方法添加如 @ModelAttribute("ajaxRequest") boolean ajaxRequest，参数<BR>
	 * 判断该方法是ajax请求,true:是
	 * <P>
	 * 
	 * @param request
	 *            WebRequest
	 * @param model
	 *            Model
	 */
//	@ModelAttribute
//	public void ajaxAttribute(WebRequest request, Model model) {
//		model.addAttribute("ajaxRequest", AjaxUtils.isAjaxRequest(request));
//	}


	/**
	 * 获取验证错误信息.
	 * <P>
	 * 
	 * @param result
	 *            BindingResult Valid
	 * @return List errorList 错误列表
	 */
	protected List<JsonError> getErrorList(BindingResult result) {
		List<JsonError> errorList = new ArrayList<JsonError>();
		List<FieldError> filedErrorList = result.getFieldErrors();
		if (filedErrorList != null) {
			for (FieldError error : filedErrorList) {
				JsonError jsonError = new JsonError(error.getField(),
						error.getDefaultMessage());
				errorList.add(jsonError);
			}
		}
		return errorList;
	}

	/**
	 * 获取验证错误信息,针对 JavaBean验证.
	 * <P>
	 * 
	 * @param result
	 *            BindingResult Valid
	 * @param code
	 *            错误编码 code
	 * @return List errorList 错误列表
	 */
	protected JsonResponse failed(BindingResult result, int code) {
		List<JsonError> errorList = new ArrayList<JsonError>();
		List<FieldError> filedErrorList = result.getFieldErrors();
		if (filedErrorList != null) {
			for (FieldError error : filedErrorList) {
				JsonError jsonError = new JsonError(error.getField(),
						error.getDefaultMessage());
				errorList.add(jsonError);
			}
		}
		JsonResponse jsonRep = new JsonResponse();
		jsonRep.setSuccessed(false);
		jsonRep.setCode(code);
		jsonRep.setErrorsList(errorList);
		return jsonRep;
	}
	
	/**
	 * 获取验证错误信息,针对 JavaBean验证.
	 * <P>
	 * 
	 * @param actionErrors
	 *            ActionErrors
	 * @param code
	 *            错误编码 code
	 * @return List errorList 错误列表
	 */
	protected JsonResponse failed(ActionErrors actionErrors, int code) {
		List<JsonError> errorList = new ArrayList<JsonError>();
		if (actionErrors != null) {
			for (ActionError error : actionErrors.getActionErrors()) {
				JsonError jsonError = new JsonError(error.getName(),
						error.getMessage());
				errorList.add(jsonError);
			}
		}
		JsonResponse jsonRep = new JsonResponse();
		jsonRep.setSuccessed(false);
		jsonRep.setCode(code);
		jsonRep.setErrorsList(errorList);
		return jsonRep;
	}

	/**
	 * 获取验证错误信息,针对 JavaBean验证.
	 * <P>
	 * 
	 * @param actionErrors
	 *            ActionErrors
	 * @param code
	 *            错误编码 code
	 * @return List errorList 错误列表
	 */
	protected JsonResponse failed(List<JsonError> errorList, int code) {
		JsonResponse jsonRep = new JsonResponse();
		jsonRep.setSuccessed(false);
		jsonRep.setCode(code);
		jsonRep.setErrorsList(errorList);
		return jsonRep;
	}

	/**
	 * 返回成功的数据,编码默认为0,successed为true.
	 * 
	 * @param data
	 *            结果数据
	 * @return JsonResponse
	 */
	protected JsonResponse successed(Object data) {
		JsonResponse jsonResp = new JsonResponse();
		jsonResp.setSuccessed(true);
		jsonResp.setData(data);
		jsonResp.setCode(0);
		return jsonResp;
	}
	/**
	 * 返回失败的数据,编码默认为0,successed为true.
	 * 
	 * @param data
	 *            结果数据
	 *  @param code
	 *  			编码
	 * @return JsonResponse
	 */
	protected JsonResponse failed(Object data,int code) {
		JsonResponse jsonResp = new JsonResponse();
		jsonResp.setSuccessed(false);
		jsonResp.setData(data);
		jsonResp.setCode(code);
		return jsonResp;
	}
	
	protected JsonResponse failed(ErrorCode error, Object data, Map<String, Object> paramMap) {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		retnMap.put("errCode", error.getCode());
		retnMap.put("errMsg", error.getErrMsg());
		retnMap.put("paramMap", JsonUtil.toString(paramMap));
		if (data instanceof Exception) {
			retnMap.put("errData", ExceptionUtils.getFullStackTrace((Throwable) data));			
		} else {
			retnMap.put("errData", data.toString());
		}
		JsonResponse jsonResp = new JsonResponse();
		jsonResp.setSuccessed(false);
		jsonResp.setData(retnMap);
		jsonResp.setCode(-2);
		return jsonResp;
	}
	
	protected JsonResponse failed(InterfaceException ie, Map<String, Object> paramMap, ErrorCode error) {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		String errCode = "";
		String errMsg = "";
		try {
			if (ie.getErrType() == ErrType.OPPOSITE) {
				errCode = error.getOppoCode();
				errMsg = error.getOppoErrMsg();
			} else if (ie.getErrType() == ErrType.PORTAL) {
				errCode = error.getCode();
				errMsg = error.getErrMsg();
			} else if (ie.getErrType() == ErrType.ECSP) {
				errCode = error.getCode();
				errMsg = error.getErrMsg();
			} else if (ie.getErrType() == ErrType.CSB) {
				errCode = ie.getErrCode();
				errMsg = ie.getMsg();
			} else if (ie.getErrType() == ErrType.CATCH) {
				errCode = ie.getErrCode();
				errMsg = ie.getMsg();
			}
		} catch (Exception e) {
			log.error("获取错误编码出错", e);
		}
		retnMap.put("errCode", errCode);
		retnMap.put("errMsg",  errMsg);
		retnMap.put("paramMap", ie.getParamString());
		if (StringUtils.isNotEmpty(ie.getLogSeqId())) {
			retnMap.put("logSeqId", ie.getLogSeqId());
		} else {
			retnMap.put("logSeqId", "");
		}
		String errorInstNbr = ie.getErrorInstNbr();
		if (StringUtils.isNotEmpty(errorInstNbr)) {
			retnMap.put("errorInstNbr", errorInstNbr);
		}
		
		if (ie.getErrType() == ErrType.PORTAL) {
			retnMap.put("errData", ExceptionUtils.getFullStackTrace(ie));
		} else {
			retnMap.put("errData", ie.getErrStack());
		}
		
		JsonResponse jsonResp = new JsonResponse();
		jsonResp.setSuccessed(false);
		jsonResp.setData(retnMap);
		jsonResp.setCode(-2);
		return jsonResp;
	}
	
	protected String failedStr(Model model, ErrorCode error, Object data, Map<String, Object> paramMap) {
		Map<String, Object> tempMap = new HashMap<String, Object>();
		tempMap.put("errCode", error.getCode());
		tempMap.put("errMsg", error.getErrMsg());
		tempMap.put("paramMap", JsonUtil.toString(paramMap));
		if (data instanceof Exception) {
			tempMap.put("errData", ExceptionUtils.getFullStackTrace((Throwable) data));			
		} else {
			tempMap.put("errData", data.toString());
		}
		Map<String, Object> retnMap = new HashMap<String, Object>();
		retnMap.put("code", "-2");
		retnMap.put("data", tempMap);
		model.addAttribute("errorJson", JsonUtil.toString(retnMap));
		return "/common/errorJson";
	}
	
	/**
	 * 获取html模板异常，通过公用错误提示界面返回前台
	 * @param model 
	 * @param ie
	 * @param paramMap
	 * @param errCode
	 * @return
	 */
	protected String failedStr(Model model, InterfaceException ie, Map<String, Object> paramMap, ErrorCode error) {
		Map<String, Object> tempMap = new HashMap<String, Object>();
		String errCode = "";
		String errMsg = "";
		try {
			if (ie.getErrType() == ErrType.OPPOSITE) {
				errCode = error.getOppoCode();
				errMsg = error.getOppoErrMsg();
			} else if (ie.getErrType() == ErrType.PORTAL) {
				errCode = error.getCode();
				errMsg = error.getErrMsg();
			} else if (ie.getErrType() == ErrType.ECSP) {
				errCode = error.getCode();
				errMsg = error.getErrMsg();
			} else if (ie.getErrType() == ErrType.CSB) {
				errCode = ie.getErrCode();
				errMsg = ie.getMsg();
			} else if (ie.getErrType() == ErrType.CATCH) {
				errCode = ie.getErrCode();
				errMsg = ie.getMsg();
			}
		} catch (Exception e) {
			log.error("获取错误编码出错", e);
		}
		tempMap.put("errCode", errCode);
		tempMap.put("errMsg",  errMsg);
		tempMap.put("paramMap", ie.getParamString());
		String errorInstNbr = ie.getErrorInstNbr();
		if (StringUtils.isNotEmpty(errorInstNbr)) {
			tempMap.put("errorInstNbr", errorInstNbr);
		}
		
		if (ie.getErrType() == ErrType.PORTAL) {
			tempMap.put("errData", ExceptionUtils.getFullStackTrace(ie));
		} else {
			tempMap.put("errData", ie.getErrStack());
		}
		if (StringUtils.isNotEmpty(ie.getLogSeqId())) {
			tempMap.put("logSeqId", ie.getLogSeqId());
		} else {
			tempMap.put("logSeqId", "");
		}
		Map<String, Object> retnMap = new HashMap<String, Object>();
		retnMap.put("code", "-2");
		retnMap.put("data", tempMap);
		model.addAttribute("errorJson", JsonUtil.toString(retnMap));
		return "/common/errorJson";
	}
	
	
	protected JsonResponse failed(BusinessException be) {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		retnMap.put("errCode", be.getError().getCode());
		retnMap.put("errMsg", be.getError().getErrMsg());
		retnMap.put("paramMap", JsonUtil.toString(be.getParamMap()));
		retnMap.put("resultMap", JsonUtil.toString(be.getResultMap()));
		retnMap.put("errData", ExceptionUtils.getFullStackTrace(be));
		
		JsonResponse jsonResp = new JsonResponse();
		jsonResp.setSuccessed(false);
		jsonResp.setData(retnMap);
		jsonResp.setCode(-2);
		return jsonResp;
	}
	
	protected String failedStr(Model model, BusinessException be) {
		Map<String, Object> tempMap = new HashMap<String, Object>();
		tempMap.put("errCode", be.getError().getCode());
		tempMap.put("errMsg", be.getError().getErrMsg());
		tempMap.put("paramMap", JsonUtil.toString(be.getParamMap()));
		tempMap.put("resultMap", JsonUtil.toString(be.getResultMap()));
		tempMap.put("errData", ExceptionUtils.getFullStackTrace(be));
		
		Map<String, Object> retnMap = new HashMap<String, Object>();
		retnMap.put("code", "-2");
		retnMap.put("data", tempMap);
		model.addAttribute("errorJson", JsonUtil.toString(retnMap));
		return "/common/errorJson";
	}
	
	/**
	 * 返回成功的数据,编码默认为0,successed为true.
	 * 
	 * @param data
	 *            结果数据
	 *  @param code 编码
	 * @return JsonResponse
	 */
	protected JsonResponse successed(Object data,int code) {
		JsonResponse jsonResp = new JsonResponse();
		jsonResp.setSuccessed(true);
		jsonResp.setData(data);
		jsonResp.setCode(code);
		return jsonResp;
	}
	/**
	 * 对于 contentType application/json 验证异常处理.
	 * @param error MethodArgumentNotValidException
	 * @return JsonResponse JsonResponse
	 */
	@ExceptionHandler(value=MethodArgumentNotValidException.class)
	@ResponseStatus(value = HttpStatus.OK)
	@ResponseBody
	public JsonResponse handleMethodArgumentNotValidException(
			MethodArgumentNotValidException error) {
		return failed(error.getBindingResult(),ResultConstant.IN_PARAM_FAILTURE.getCode());
	}

	/**
	 * 对于 contentType application/json 验证异常处理.
	 * @param error MethodNotJsonValidException
	 * @return JsonResponse JsonResponse
	 */
	@ExceptionHandler(value=MethodNotJsonValidException.class)
	@ResponseStatus(value = HttpStatus.OK)
	@ResponseBody
	public JsonResponse handleMethodArgumentNotJsonValidException(
			MethodNotJsonValidException error) {
		return failed(error.getActionErrors(),ResultConstant.IN_PARAM_FAILTURE.getCode());
	}
	
	/**
	 * 对于 会话验证用户是否登录异常处理.
	 * @param error SessionException
	 * @return JsonResponse JsonResponse
	 * @throws SessionException 
	 */
	@ExceptionHandler(value=SessionException.class)
	@ResponseStatus(value = HttpStatus.OK)
	@ResponseBody
	public JsonResponse handleSessionException(HttpServletResponse response,
			SessionException error) throws SessionException {
		addHeadCode(response,error.getResult());
		if(error.isAjax()){
			return failed(error.getResult().getMsg(),ResultConstant.SESSION_INVALID.getCode());
		} else {
			throw new SessionException(
					ResultConstant.SESSION_INVALID, "用户未登录或会话过期！");
		}
	}
	
	/**
	 * 对于权限验证异常处理.
	 * @param error SessionException
	 * @return JsonResponse JsonResponse
	 * @throws SessionException 
	 */
	@ExceptionHandler(value=AuthorityException.class)
	@ResponseStatus(value = HttpStatus.OK)
	@ResponseBody
	public JsonResponse handleAuthorityException(HttpServletResponse response,
			AuthorityException error) throws AuthorityException {
		addHeadCode(response,error.getResult());
		if(error.isAjax()){	
			return failed(error.getResult().getMsg(),error.getResult().getCode());
		} else {
			throw new AuthorityException(
					error.getResult().getCode(), "无权限访问！");
		}
	}
	/**
	 * 对于ajax返回时,添加头部编码信息
	 * 
	 * @param response HttpServletResponse
	 * @param result Result
	 */
	protected void addHeadCode(HttpServletResponse response,Result result){
		ServletUtils.setNoCacheHeader(response);
	    response.setHeader(RESP_CODE, String.valueOf(result.getCode()));
	    response.setHeader(RESP_MSG, EncodeUtils.urlEncode(result.getMsg()));
	}
	/**
	 * 对于ajax返回时,添加头部编码信息
	 * 
	 * @param response HttpServletResponse
	 * @param result Result
	 */
	protected void setNoCacheHeader(HttpServletResponse response){
		ServletUtils.setNoCacheHeader(response);
	}
	
	/**
	 * 从前台传递一个date到controller，前后台的date类型转换不过来，<BR>
	 * 解决办法 此方法将覆盖全局.
	 * <P>
	 * 
	 * @param binder
	 *            WebDataBinder
	 */
	@InitBinder
	public void initBinder(WebDataBinder binder) {
		// 字符串,特殊字符进行转义
		//binder.registerCustomEditor(String.class, new StringEscapeEditor());
		// 日期自动转换
		binder.registerCustomEditor(Date.class, new DateConvertEditor());

		
	}
}
