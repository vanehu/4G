package com.al.lte.portal.bmo.crm;

import java.util.Map;

import com.al.lte.portal.model.SessionStaff;

public interface ProtocolBmo {

	/**
	 * 查询 协议列表
	 */
	public  Map<String, Object> queryProtocol(
			Map<String, Object> dataBusMap, String flowNum,
			SessionStaff sessionStaff) throws Exception;

	/**
	 * 查询 协议 编码
	 * @param params
	 * @param flowNum
	 * @param sessionStaff
	 * @return
	 */
	public  Map<String, Object> queryProtocolNbr(
			Map<String, Object> dataBusMap, String flowNum,
			SessionStaff sessionStaff) throws Exception; 

	/**
	 * 查询 协议下的  产品 
	 * @param params
	 * @param flowNum
	 * @param sessionStaff
	 * @return
	 */
	public  Map<String, Object> queryProtocolOfferDetail(
			Map<String, Object> dataBusMap, String flowNum,
			SessionStaff sessionStaff) throws Exception;

	/**
	 * 查询 协议下的 
	 * @param params
	 * @param flowNum
	 * @param sessionStaff
	 * @return
	 */
	public  Map<String, Object> queryProtocolOffer(
			Map<String, Object> dataBusMap, String flowNum,
			SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 保存 协议
	 * @param params
	 * @param flowNum
	 * @param sessionStaff
	 * @return
	 */
	public  Map<String, Object> addProtocol(Map<String, Object> dataBusMap,
			String flowNum, SessionStaff sessionStaff) throws Exception;
	/**
	 * 查询协议编码
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> geProtocolNbrSeq(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception;

}