package com.al.ecs.common.entity;

import java.util.List;

import org.codehaus.jackson.map.annotate.JsonSerialize;

/**
 * JSON 格式 返回到前台的统一实体类.
 * <BR>
 *  1.标识
 *  2.编码
 *  3.错误集
 *  4.结果数据
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-1-9
 * @createDate 2012-1-9 下午5:27:08
 * @modifyDate	 tang 2012-1-9 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
public class JsonResponse {

		/** 成功、失败标志. */
		private boolean successed = true;

		/** 返回结果编码,默认0:成功. */
		private int code = 0;

		/** 令牌 . */
		@JsonSerialize(include=JsonSerialize.Inclusion.NON_NULL)
		private String token = null;

		/** 错误信息,null时不转换输出该字段. */
		@JsonSerialize(include=JsonSerialize.Inclusion.NON_NULL)
		private List<JsonError> errorsList = null;

		/** 成功时返回的对象　null时不转换输出该字段. */
		@JsonSerialize(include=JsonSerialize.Inclusion.NON_NULL)
		private Object data = null;

		/**
		 * 判断是否成功.
		 * @return true:返回成功
		 */
		public boolean isSuccessed() {
			return successed;
		}
		/**
		 * 设置是否成功.
		 * @param successed true:成功
		 */
		public void setSuccessed(boolean successed) {
			this.successed = successed;
		}

		/**
		 * 返回编码，默认编码为０.
		 * @return int 编码
		 */
		public int getCode() {
			return code;
		}
		/**
		 * 设置编码.
		 * @param code 编码
		 */
		public void setCode(int code) {
			this.code = code;
		}
		/**
		 * 返回错误信息集合.
		 * @return List<JsonError> 错误信息集合
		 */
		public List<JsonError> getErrorsList() {
			return errorsList;
		}
		/**
		 * 设置错误信息集合.
		 * @param errorsList 错误信息集合
		 */
		public void setErrorsList(List<JsonError> errorsList) {
			this.errorsList=errorsList;
		}

		/**
		 * 添加错误信息集合.
		 * @param errorsList 错误信息集合
		 */
		public void addAllErrorsList(List<JsonError> errorsList) {
			this.errorsList.addAll(errorsList);
		}

		/**
		 * 返回结果数据.
		 * @return Object 结果数据
		 */
		public Object getData() {
			return data;
		}
		/**
		 * 设置结果数据.
		 * @param data 结果数据
		 */
		public void setData(Object data) {
			this.data = data;
		}
		
		/**
		 * 返回令牌数据.
		 * @return String 令牌数据
		 */
		public String getToken() {
			return token;
		}
		/**
		 * 设置令牌数据.
		 * @param token 令牌数据
		 */
		public void setToken(String token) {
			this.token = token;
		}

}
