package com.al.ecs.spring.interceptor;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.RequestMapping;

/**
 * 权限校验接口 .
 * <BR>
 * 校验主要实现有
 * １.　菜单访问权限校验。
 *  2.　数据权限校验，数据权限校验主要通过 path或param Map 传数据，不会通过body传数据
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-8-7
 * @createDate 2012-8-7 下午3:00:17
 * @modifyDate tang zheng yu 2012-8-7 <BR>
 * @copyRight 亚信联创EC研发部
 */
abstract public  class AbstractAuthorityInterceptor {
	/** 成功，允许访问 */
	public final static int SUCCESS = 0;
	/** 失败，禁止访问 */
	public final static int FAILED = 1;

	/**
	 * 判断员工是否拥有该权限实例
	 * <P>
	 * 该判断主要用于访问要经过控制层方法
	 * <P>
	 * @param sessionBean Session 员工数据
	 * @param authorityCode 控制层controller
	 * @param pathVariables rest api 变量map对应的值
	 * @param  paramMap  request paramMap参数，值是数组可能
	 * @return int 0:表示通过，其他失败
	 */
	 public abstract int checkAuthorityByActionMethod(HttpServletRequest request,String authorityCode);

	/**
	 * 判断员工是否拥有该数据权限实例
	 * <P>
	 * 该判断主要用于访问要经过控制层方法
	 * <P>
	 * @param sessionBean Session 员工数据
	 * @param mappingUrl RequestMapping url
	 * @param pathVariables rest api 变量map对应的值
	 * @param  paramMap  request paramMap参数，值是数组可能
	 * @return int 0:表示通过，其他失败
	 */
	 public int checkDataAuthorityByUrl(HttpServletRequest request,String mappingUrl,Map pathVariables,Map paramMap){
		 return 0;
	 }
		 
	/**
	 * 判断员工是否拥有该权限实例
	 * <P>
	 * 该判断主要用于访问资源文件，不需要通过通过控制层方法
	 * 该方法默认不需要实现，返回成功
	 * @sample
	 *  PathMatcher pathMatcher= new AntPathMatcher();
	 * 	Assert.isTrue(pathMatcher.match("/main/**", "/main/order/prepare.html"));
	 * <P>
	 * @param sessionBean Session 员工数据
	 * @param url 控制层controller
	 * @return int 0:表示通过，其他失败
	 */
	public int checkAuthorityByResource(Object sessionBean,String url){
		return 0;
	}
	
}
