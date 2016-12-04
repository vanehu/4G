package com.al.lte.portal.bmo.crm;

import java.util.ArrayList;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

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
	public Map<String, Object> validatorRuleSub(Map<String, Object> param,String optFlowNum,HttpServletRequest request) throws Exception;
	
	/**
	 * 离散值查询
	 */
	public Map<String, Object> querySpecListByAttrID(Map<String, Object> dataBusMap,String flowNum,SessionStaff sessionStaff)
			throws Exception;

	/**
	 * 记录页面操作的动作和页面内容等，根据具体需要添加到入参字段
	 * @param param
	 * @param model
	 * @param response
	 * @param optFlowNum
	 * @return
	 */
	public Map<String, Object> portalActonLog(Map<String, Object> dataBusMap,String flowNum,SessionStaff sessionStaff) throws Exception;

	/**
	 * 签名.
	 * @param partyName 姓名
	 * @param certNumber 证件号码
	 * @param certAddress 地址
	 * @param identityPic 照片
	 * @param nonce 随机字符串
	 * @param secret 密钥
	 * @return
	 * @throws Exception
	 */
	public String signature(String partyName, String certNumber, String certAddress,
	    String identityPic, String nonce, String secret) throws Exception;

	/**
	 * SHA-1加密签名.
	 * @param map 待加密字符串列表
	 * @param secret 密钥
	 * @return
	 * @throws Exception
	 */
	public String signatureForSha(Map<String, String> map, String secret) throws Exception;

	/**
	 * 写入日志平台.
	 * @param param
	 * @param request
	 * @throws Exception
	 */
	public void sendLog(Map<String, Object> param, HttpServletRequest request) throws Exception;

	/**
	 * 订单提交报文过滤多余的节点<br/>
	 * (1)由于同一个客户办理业务时可能同时使用人新建、经办人新建、客户新建等，在此过滤掉重复的C1节点，同一个客户新建应当只有一个C1节点<br/>
	 * (2)后期可能添加其他过滤，暂留
	 * @param param 订单提交入参
	 * @return true：过滤成功；false：过滤失败
	 */
	public boolean orderSubmitFilter(Map<String, Object> param) throws Exception;
}
