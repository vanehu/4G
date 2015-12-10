package com.al.lte.portal.bmo.crm;

import java.util.ArrayList;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.ui.Model;

import com.al.ecs.exception.BusinessException;
import com.al.lte.portal.model.SessionStaff;

/**
 * 公用业务操作接口 .
 * <P>
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 下午2:14:11
 * @modifyDate 
 * @copyRight 亚信联创电信CRM研发部
 */
public interface CommonBmo {
	
	/**
	 * 订单校验
	 * @param request
	 * @param token
	 * @return
	 */
	public boolean checkToken(HttpServletRequest request,String token);

	/**
	 * 修改资源状态
	 * @param paramMap
	 * @return
	 * @throws BusinessException
	 */
	public Map<String, Object> updateResState(ArrayList paramList,String optFlowNum, SessionStaff sessionStaff) throws Exception;;
	
	/**
	 * 实例查询 规则校验 全量查询
	 * @param param
	 * 实例构成入参：var param = {
			offerId : prod.prodOfferInstId,
			offerSpecId : prod.prodOfferId,
			acctNbr : prod.accNbr,
			areaId : prod.areaId,
			distributorId : ""
		};
	 * 全量查询var param = {
			areaId : OrderInfo.getProdAreaId(prod.prodInstId),
			acctNbr : prod.accNbr,
			custId : OrderInfo.cust.custId,
			soNbr : OrderInfo.order.soNbr,
			instId : prod.prodInstId,
			type : "2"
		};
	 * 
	 * @return
	 */
	public Map<String, Object> validatorRule(Map<String, Object> param,String optFlowNum,HttpServletRequest request) throws Exception ;
	
	/**
	 * 在原接口上，去除全量查询
	 * @param param
	 * @param optFlowNum
	 * @param request
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> validatorRuleSub(Map<String, Object> param,String optFlowNum,HttpServletRequest request) throws Exception ;
	
	/**
	 * 离散值查询
	 */
	public Map<String, Object> querySpecListByAttrID(Map<String, Object> dataBusMap,String flowNum,SessionStaff sessionStaff)
			throws Exception;

}
