package com.al.ecs.common.util;


import java.io.IOException;

import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.DeserializationConfig;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.map.SerializationConfig;
import org.codehaus.jackson.map.SerializationConfig.Feature;
import org.codehaus.jackson.map.annotate.JsonSerialize.Inclusion;
import org.codehaus.jackson.type.TypeReference;

import com.al.ecs.log.Log;

/** 
 * 请使用 JsonUtil 工具类
 *  Json字符串操作.
 *<P>
 *<P>
 * @author 唐征宇
 * @version V1.0 2012-1-8 
 * @CreateDate 2012-1-8下午02:31:29
 * @CopyRight 亚信联创电信CRM研发部
 */
@Deprecated
public final class JacksonUtil {
	protected Log logger = Log.getLog(JacksonUtil.class);
	
	private ObjectMapper objectMapper;
	
	/**
	 * 配置三种转换和输出模式.
	 * <P>
	 * 也可以通过注解指定Bean转换的模式
	 * @JsonSerialize(include=JsonSerialize.Inclusion.NON_DEFAULT)
	 * <P>
	 * @param inclusion Inclusion
	 */
	private JacksonUtil(Inclusion inclusion) {
		objectMapper = new ObjectMapper();
		//设置输出包含的属性
		//设置输入时忽略JSON字符串中存在而Java对象实际没有的属性
		SerializationConfig config = objectMapper.getSerializationConfig();
		config = config
				.withSerializationInclusion(inclusion)
				.with(Feature.WRITE_ENUMS_USING_TO_STRING);
		objectMapper.setSerializationConfig(config);
		//设置输入时忽略JSON字符串中存在而Java对象实际没有的属性
		DeserializationConfig dconfig = objectMapper.getDeserializationConfig();
		dconfig = dconfig.with(DeserializationConfig.Feature.FAIL_ON_UNKNOWN_PROPERTIES,
						DeserializationConfig.Feature.READ_ENUMS_USING_TO_STRING);
		objectMapper.setDeserializationConfig(dconfig);
	}

	/**
	 * 创建输出全部属性到Json字符串的 JacksonUtil.
	 * @return JacksonUtil JacksonUtil
	 */
	public static JacksonUtil buildNormalJackson() {
		return new JacksonUtil(Inclusion.ALWAYS);
	}

	/**
	 * 创建只输出非空属性到Json字符串的 JacksonUtil.
	 * @return JacksonUtil JacksonUtil
	 */
	public static JacksonUtil buildNonNullJackson() {
		return new JacksonUtil(Inclusion.NON_NULL);
	}

	/**
	 * 创建只输出初始值被改变的属性到Json字符串的JacksonUtil.
	 * @return JacksonUtil JacksonUtil
	 */
	public static JacksonUtil buildNonDefaultJackson() {
		return new JacksonUtil(Inclusion.NON_DEFAULT);
	}

	/**
	 * 取出Mapper做进一步的设置或使用其他序列化API.
	 * @return ObjectMapper objectMapper
	 */
	public ObjectMapper getObjectMapper() {
		return objectMapper;
	}

	/**
	 * 将json字符串转换为对象.
	 * @param jsonstr json 字符串
	 * @param clazz　要转换的对象
	 * @return  <T> T 要转换的对象类型
	 */
	public <T> T jsonToObject(String jsonstr,Class<T> clazz) {
		
		if (StringUtil.isEmptyStr(jsonstr)) {
			return null;
		}
		try {
			return objectMapper.readValue(jsonstr, clazz);
		} catch (IOException e) {
			logger.warn("parse json string error:" + jsonstr, e);
			return null;
		}
		
	}
	
	/**
	 * 指定要转换对象的类型.
	 * @param json json
	 * @param type 类型
	 *  		TypeReference ref = new TypeReference<List<Integer>>() { };
	 * @return <T> T 想要的类型
	 * @throws Exception
	 */
	public <T> T jsonToObject(String json, TypeReference<T> type)
			throws Exception {
		return (T) objectMapper.readValue(json, type);
	}

	/**
	 * 将对象转换为json字符串.
	 * @param obj 对象
	 * @return String json字符串
	 */
	public String objectToJson(Object obj){
		
		if(null == obj){
			return null;
		}
		try {
			return objectMapper.writeValueAsString(obj);
		} catch (IOException e) {
			logger.warn("parse object to json string error:", e);
			return null;
		}

	}
	
	/**
	 * 判断是否有效的 JSON字符串.
	 * @param content JSON字符串
	 * @return boolean true:有效
	 */
	public static boolean isValidJson(String content) {
		try {
			JacksonUtil.buildNormalJackson().getObjectMapper().readValue(content, JsonNode.class);
			return true;
		} catch (Exception e) {
			return false;
		}
	}
	
	/**
	 * 获得指定节点下的值.
	 * @param jsonStr JsonStr 对象
	 * @param path 路径（节点名）
	 * @return String 节点下的值
	 * @throws Exception 异常
	 */
	public String getJsonPathValue(String jsonStr, String path) throws Exception {
		try {
			JsonNode rootNode = objectMapper.readTree(jsonStr);
			return getJsonPathValue(rootNode,path);
		} catch (Exception e) {
			logger.warn("getJsonPathValue error", e);
			return null;
		}
	
	}

	/**
	 * 获得指定节点下的值.
	 * @param jsonNode JsonNode对象
	 * @param path 路径（节点名）
	 * @return String 节点下的值
	 */
	public String getJsonPathValue(JsonNode jsonNode, String path) {
		if(jsonNode==null){
			return null;
		}
		jsonNode = jsonNode.path(path);
		if(jsonNode==null){
			return null;
		}
		return jsonNode.getTextValue();
	}

	/**
	 * 将json字符串转换为JsonNode对象.
	 * @param jsonStr json字符串
	 * @return JsonNode JsonNode对象
	 * @throws Exception 异常
	 */
	public JsonNode getJsonNode(String jsonStr) throws Exception {
		return objectMapper.readTree(jsonStr);
	}

}
