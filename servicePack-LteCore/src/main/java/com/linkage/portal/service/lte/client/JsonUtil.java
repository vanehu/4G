package com.linkage.portal.service.lte.client;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.codehaus.jackson.JsonGenerator;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.JsonProcessingException;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.map.ObjectWriter;
import org.codehaus.jackson.util.DefaultPrettyPrinter;

public class JsonUtil {
	protected static Log log = LogFactory.getLog(JsonUtil.class);
	private ObjectMapper objectmapper;
	private static JsonUtil jasonmapper;
	public static JsonUtil getInstance() {
		if (null == jasonmapper) {
			jasonmapper = new JsonUtil();
		}
		
		return jasonmapper;

	}
	
	public static Map readMap(String content){
		Map map = null;
		try {
			map = (Map)JsonUtil.getInstance().getObjectMapper().readValue(content, Map.class);
		} catch (Exception e) {
			log.error("",e);
		} 
		return map;
	}
	
	public static List readList(String content){
		List list = null;
		try {
			list = (List)JsonUtil.getInstance().getObjectMapper().readValue(content, List.class);
		} catch (Exception e) {
			log.error("",e);
		} 
		return list;
	}

	private JsonUtil() {
		this.objectmapper = new ObjectMapper();
		objectmapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS"));
	}
	public ObjectMapper getObjectMapper() {
		return objectmapper;
	}

	/***
	 *  jsonNode
	 *            传递进来的json
	 * : 获得该jsonNode对应的JsonNode
	 * ***/
	public static JsonNode getJsonNode(String jsonNode) {
		ObjectMapper obm = JsonUtil.getInstance().getObjectMapper();
		JsonNode rootNode = null;
		try {
			rootNode = obm.readTree(jsonNode);
		} catch (JsonProcessingException e) {
			log.error("",e);
		} catch (IOException e) {
			log.error("",e);
		}
		return rootNode;
	}

	/***
	 *  obj
	 *            传递进来的对象
	 * : 获得该Object对应的json值(打印该对象)
	 * ***/
	public static String toString(Object obj) {
		ObjectMapper obm = JsonUtil.getInstance().getObjectMapper();
		String reuslt = "";
		try {
			reuslt = obm.writeValueAsString(obj);
		} catch (JsonProcessingException e) {
			log.error("",e);
		} catch (IOException e) {
			log.error("",e);
		}
		return reuslt;
	}
	
	public static String toPrettyString(Object obj) {
		ObjectMapper obm = JsonUtil.getInstance().getObjectMapper();
		String reuslt = "";
		try {
			ObjectWriter  writer = obm.writerWithDefaultPrettyPrinter();
			reuslt = writer.writeValueAsString(obj);
		} catch (Exception e) {
			log.error("",e);
		} 
		return reuslt;
	}
	public static <T> T toObject(String jsonstr,Class<T> clazz) {
		if (StringUtils.isBlank(jsonstr)) {
			return null;
		}
		try {
			return getInstance().getObjectMapper().readValue(jsonstr, clazz);
		} catch (IOException e) {
			return null;
		}
	}
	
}
