package com.al.ecs.spring.annotation.valid;

import java.io.IOException;
import java.io.InputStream;
import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Required;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;

import org.xml.sax.SAXException;

import com.al.ecs.common.util.JacksonUtil;
import com.al.ecs.log.Log;
import com.al.ecs.validator.ActionErrors;
import com.al.ecs.validator.Validator;
import com.al.ecs.validator.ValidatorException;
import com.al.ecs.validator.ValidatorResources;
import com.al.ecs.validator.ValidatorResults;
import com.al.ecs.validator.exception.MethodNotJsonValidException;

/**
 * 方法参数 JSON 校验拦截实现类.
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-1-11
 * @createDate 2012-1-11 下午11:39:04
 * @modifyDate tang 2012-1-11 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
@Aspect
public class JsonValidatorAop implements InitializingBean {

	protected Log log = Log.getLog(JsonValidatorAop.class);
	private ReloadableResourceBundleMessageSource messageSource;
	private final static int CACHE_SIZE=10;
	private LruCache<String,Object> cache=null;
	/**
	 * 校验错误提示 属性配置文件
	 * 国际化配置文件.
	 * @see org.springframework.context.support.ReloadableResourceBundleMessageSource
	 * @param messageSource ReloadableResourceBundleMessageSource
	 */
	@Required
	public void setMessageSource(
			ReloadableResourceBundleMessageSource messageSource) {
		this.messageSource = messageSource;
	}

	/**
	 * json 验证支持数据类型.
	 * <BR>
	 * 支持 String,Map,List
	 * <P>
	 * @param clazz 参数类型
	 * @return boolean true:表示支持
	 */
	public boolean supports(Class<?> clazz) {
		if (String.class.isAssignableFrom(clazz)
				|| Map.class.isAssignableFrom(clazz)
				|| List.class.isAssignableFrom(clazz)) {
			return true;
		}
		return false;
	}

	/**
	 * 指定拦截方法名.
	 */
	@Pointcut("within(com.al..*) " +
			"&& @annotation(com.al.ecs.spring.annotation.valid.JsonValidMethod)")
	private void process() {
	}

	/**
	 * 校验JSON.
	 * @param joinPoint 方切入点
	 * @return Object 方法执行回返对象
	 * @throws Throwable
	 */
	@Around("process()")
	public Object processJsonValid(ProceedingJoinPoint joinPoint) throws Throwable {
		MethodSignature methodSignature = (MethodSignature) joinPoint
				.getSignature();
		Method method = methodSignature.getMethod();
		Annotation[][] argAnnotations = method.getParameterAnnotations();
		String[] argNames = methodSignature.getParameterNames();
		Object[] args = joinPoint.getArgs();
		boolean isHasActionErrors=false;
		if (args !=null && args.length>0 && argAnnotations != null && argAnnotations.length > 0) {
			int paramIndex = 0;
			for (Annotation[] annos : argAnnotations) {
				for (Annotation annot : annos) {
					if (annot.annotationType().getSimpleName().toLowerCase()
							.equals("jsonvalid")
							&& supports(args[paramIndex].getClass())) {
						JsonValid jsonValidAnn = (JsonValid) annot;
						ActionErrors actionErrors=null;
						try {
							actionErrors = processValidator(args[paramIndex],jsonValidAnn,
									joinPoint.getTarget().getClass());
						} catch (ValidatorException e) {
							log.warn("Validator Exception", e);
						} catch (IOException e) {
							log.warn("Validator file path error IOException", e);
						} catch (SAXException e) {
							log.warn("Validator file SAXException", e);
						}
						
						int actionParamIndex=0;
						for(Object arg:args){
							if(arg instanceof ActionErrors){
								isHasActionErrors=true;
								break;
							}
							actionParamIndex++;
						}
						if(actionErrors !=null && actionErrors.hasErrors()) {
							//含有ActionErrors，则对该入参赋值
							if(paramIndex !=actionParamIndex && isHasActionErrors) {
								args[actionParamIndex]=actionErrors;
							//没有则抛出异常
							} else {
								throw new MethodNotJsonValidException(actionErrors,paramIndex,
										argNames[paramIndex],method.getName());
							}
						} else {
							//含有ActionErrors，则对该入参赋值,空值，防空值针异常
							if(paramIndex !=actionParamIndex && isHasActionErrors) {
								args[actionParamIndex]=new ActionErrors();
							}
						}
					
						break;
					}
				}
				paramIndex++;
			}
		}
		if(isHasActionErrors){
			return joinPoint.proceed(args);
		//没有修改入参
		} else {
			return joinPoint.proceed();
		}

	}

	/**
	 * 加载相关配置文件进行验证,JSON验证.
	 * @param param 要校验参数
	 * @param annt 注解:JsonValid
	 * @param clazz 校验所在的类
	 * @return ActionErrors 返回校验不通过结果集
	 * @throws ValidatorException 校验异常
	 * @throws IOException　读取相关配置文件异常
	 * @throws SAXException　解析XML配置文件异常
	 */
	public ActionErrors processValidator(Object param, JsonValid annt,
			Class<?> clazz) throws ValidatorException, IOException, SAXException {
		InputStream[] in = new InputStream[2];
		ValidatorResources resources = null;
		ActionErrors actionErrors = new ActionErrors();
		try {
			String path="";
			if (annt.path() == null || annt.path().trim().length() == 0) {
				path=clazz.getSimpleName()+ "-validator.xml";
			} else {	
				path=annt.path();
			}
			if(cache.contains(path)){
				resources =(ValidatorResources) cache.get(path);
			} else {
				in[0]=this.getClass().getResourceAsStream("json-default-validator.xml");
				if (annt.path() == null || annt.path().trim().length() == 0) {
					in[1] = clazz.getResourceAsStream(path);	
				} else {	
					in[1] = this.getClass().getResourceAsStream(annt.path());
				}
				resources = new ValidatorResources(in);	
				cache.add(path,resources);
			}
			
		} finally {
			// Make sure we close the input stream.
			if (in[0] != null){
				in[0].close();
			}
			if (in[1] != null){
				in[1].close();
			}
		}
		String paramStr = "";
		// 非字符串,转化为字符串
		if (!String.class.isAssignableFrom(param.getClass())) {
			paramStr = JacksonUtil.buildNormalJackson().objectToJson(param);
		} else {
			paramStr = (String) param;
		}

		// Create a validator with the ValidateBean actions for the bean
		// we're interested in.
		Validator validator = new Validator(resources, annt.value());
		// Tell the validator which bean to validate against.
		validator.setParameter(Validator.BEAN_PARAM, paramStr);
		validator.setParameter(Validator.VALID_TYPE_PARAM,
				Validator.VALID_TYPE_JSON);
		ValidatorResults results = null;

		// Run the validation actions against the bean. Since all of the
		// properties
		// are null, we expect them all to error out except for street2, which
		// has
		// no validations (it's an optional property)
		validator.setOnlyReturnErrors(annt.isOnlyReturnErrors());
		results = validator.validate();
		actionErrors = results.getActionErrors(resources, messageSource);

		return actionErrors;
	}

	public void afterPropertiesSet() throws Exception {
		// TODO Auto-generated method stub
		log.debug("init all json validate xml and cache");
		cache=new LruCache<String,Object>(CACHE_SIZE);
	}


	private static class LruCache<K,V> {

		// Although the internal implementation uses a Map, this cache
		// implementation is only concerned with the keys.
		private final Map<K, V> cache;

		public LruCache(final int cacheSize) {
			cache = new LinkedHashMap<K, V>() {
				private static final long serialVersionUID = 1L;
				@Override
				protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
					if (size() > cacheSize) {
						return true;
					}
					return false;
				}
			};
		}

		public void add(K key,V value) {
			cache.put(key, value);
		}

		public void remove(K key) {
			cache.remove(key);
		}

		public boolean contains(K key) {
			return cache.containsKey(key);
		}
		public V get(K key) {
			return cache.get(key);
		}
	}
}
