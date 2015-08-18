package com.al.ecs.spring.annotation.log;

import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.al.ecs.common.entity.LevelLog;
import com.al.ecs.common.entity.OperatorLog;
import com.al.ecs.common.entity.Switch;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.PortalConstant;
import com.al.ecs.common.util.UIDGenerator;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.log.Log;

/**
 * 操作日志注解拦截器.
 * <P>
 * 
 * @author tang zheng yu
 * @version V1.0 2012-1-11
 * @createDate 2012-1-11 下午11:39:04
 * @modifyDate tang 2012-1-11 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
@Aspect
public class LogOperatorAop {

	/** 日志 */
	protected Log log = Log.getLog(LogOperatorAop.class);
	/** HttpServletRequest */
	@Autowired
	private HttpServletRequest request;
	/** Session Key */
	private String sessionKey = PortalConstant.SESSION_KEY_LOGIN_STAFF;

	/** 存在Session里的员工 Java Bean对象要保存的工号字段名,默认StaffCode */
	private String staffCode = PortalConstant.FIELD_STAFF_CODE_NAME;
	/** 全局开关,true:默认是开 */
	private boolean gSwitch = true;
	/** 日志记录到数据接口 */
	private LogDB logDB = null;

	/**
	 * session Key login staff bean
	 * 
	 * @param sessionKey
	 *            sessionKey
	 */
	public void setSessionKey(String sessionKey) {
		this.sessionKey = sessionKey;
	}

	/**
	 * session bean field name default:staffCode
	 * 
	 * @param staffCode
	 *            staffCode
	 */
	public void setStaffCode(String staffCode) {
		this.staffCode = staffCode;
	}

	/**
	 * 日志全局开关
	 * 
	 * @param gSwitch
	 *            全局开关
	 */
	public void setGSwitch(boolean gSwitch) {
		this.gSwitch = gSwitch;
	}

	public void setLogDB(LogDB logDB) {
		this.logDB = logDB;
	}

	/**
	 * json 验证支持数据类型. <BR>
	 * 支持 String,Map,List
	 * <P>
	 * 
	 * @param annot
	 *            参数类型
	 * @return boolean true:表示支持
	 */
	public boolean supports(Annotation annot) {
		if (RequestBody.class.isInstance(annot)
				|| PathVariable.class.isInstance(annot)
				|| RequestParam.class.isInstance(annot)
				|| ModelAttribute.class.isInstance(annot)
				|| RequestHeader.class.isInstance(annot)
				|| CookieValue.class.isInstance(annot)) {
			return true;
		}
		return false;
	}

	/**
	 * 入参设置,返回到页面上
	 * 
	 * @param clazz
	 *            clazz
	 * @return boolean
	 */
	public boolean supports(Class<?> clazz) {
		if (Model.class.isAssignableFrom(clazz)
				|| ModelMap.class.isAssignableFrom(clazz)) {
			return true;
		}
		return false;
	}

	/**
	 * 指定拦截方法名.
	 */
	@Pointcut("within(com.al.ecs..*) && @annotation(com.al.ecs.spring.annotation.log.LogOperatorAnn)")
	private void process() {
	}

	/**
	 * 校验JSON.
	 * 
	 * @param joinPoint
	 *            方切入点
	 * @return Object 方法执行回返对象
	 * @throws Throwable
	 */
	@Around("process()")
	public Object processLog(ProceedingJoinPoint joinPoint) throws Throwable {
		// 关,不执行
		if (!gSwitch) {
			return joinPoint.proceed();
		}
		MethodSignature methodSignature = (MethodSignature) joinPoint
				.getSignature();
		Object[] args = joinPoint.getArgs();
		Method method = methodSignature.getMethod();
		Annotation[][] argAnnotations = method.getParameterAnnotations();
		LogOperatorAnn logOperatorAnn = (LogOperatorAnn) method
				.getAnnotation(LogOperatorAnn.class);
		// 没有日志注解或关闭
		if (logOperatorAnn == null || logOperatorAnn.switchs() == Switch.OFF) {
			return joinPoint.proceed();
		}
		String[] argNames = methodSignature.getParameterNames();
		OperatorLog operatorLog = new OperatorLog();
		StringBuffer classMethod = new StringBuffer(joinPoint.getTarget()
				.getClass().getName());
		classMethod.append("/");
		classMethod.append(method.getName());
		long startTime = System.currentTimeMillis();
		String flowNum = UIDGenerator.generaFlowNum(logOperatorAnn.code());
		boolean isExecute = args != null && args.length > 0
				&& argAnnotations != null && argAnnotations.length > 0;
		if (isExecute) {
			int paramIndex = 0;
			for (Annotation[] annos : argAnnotations) {
				for (Annotation annot : annos) {
					if (annot.annotationType().getSimpleName()
							.startsWith("LogOperator")) {
						args[paramIndex] = flowNum;
					}
				}
				paramIndex++;
			}
		}
		Object returnValue = joinPoint.proceed(args);
		Map<String, Object> paramMap = new HashMap<String, Object>();
		Map<String, Object> returnMap = new HashMap<String, Object>();
		if (isExecute) {
			int paramIndex = 0;
			for (Annotation[] annos : argAnnotations) {
				for (Annotation annot : annos) {
					if (supports(annot)) {
						if (args[paramIndex] != null) {
							paramMap.put(argNames[paramIndex], args[paramIndex]);
						} else {
							paramMap.put(argNames[paramIndex], "NULL");
						}

						break;
					}
				}
				/** redirect 传参 */
				if (args[paramIndex] != null
						&& supports(args[paramIndex].getClass())) {
					if (Model.class.isAssignableFrom(args[paramIndex]
							.getClass())) {
						returnMap.putAll(((Model) args[paramIndex]).asMap());
					} else if (ModelMap.class.isAssignableFrom(args[paramIndex]
							.getClass())) {
						returnMap.putAll((ModelMap) args[paramIndex]);
					}
				}
				paramIndex++;
			}
		}
		/** ajax 回参 */
		if (method.getAnnotation(ResponseBody.class) != null) {
			returnMap.put("ResponseBody", returnValue);
		}
		/** 注入工号 IP 地址 */
		if (request != null) {
			Object staffSession = request.getSession().getAttribute(sessionKey);
			try {
				if (staffSession != null) {
					Field field = staffSession.getClass().getDeclaredField(
							staffCode);
					if (field != null) {
						field.setAccessible(true);
						operatorLog.setStaffCode((String) field
								.get(staffSession));
					}
				}
			} catch (NoSuchFieldException e) {
				log.error("NoSuchFieldException", e);
			} catch (SecurityException e) {
				log.error("SecurityException", e);
			}
			operatorLog.setIp(ServletUtils.getIpAddr(request));
		}
		operatorLog.setClassMethod(classMethod.toString());
		operatorLog.setDesc(logOperatorAnn.desc());
		operatorLog.setInParam(JsonUtil.buildNormal().objectToJson(paramMap));
		operatorLog.setOutParam(JsonUtil.buildNormal().objectToJson(returnMap));
		operatorLog.setTime(System.currentTimeMillis() - startTime);
		operatorLog.setOptCode(logOperatorAnn.code());
		operatorLog.setOptSerial(flowNum);
		if (logOperatorAnn.level() == LevelLog.FILE) {
			log.error("操作日志 FILE={}",
					JsonUtil.buildNormal().objectToJson(operatorLog));
		} else if (logOperatorAnn.level() == LevelLog.DB && logDB != null) {
			logDB.addLog(operatorLog);
		} else {
			log.debug("操作日志 DB={}",
					JsonUtil.buildNormal().objectToJson(operatorLog));
		}
		return returnValue;
	}

}
