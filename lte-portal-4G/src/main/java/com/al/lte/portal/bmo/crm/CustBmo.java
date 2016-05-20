package com.al.lte.portal.bmo.crm;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import com.al.lte.portal.model.SessionStaff;

public interface CustBmo {

	/**
	 * 查询客户信息
	 * @param queryParam
	 * @return
	 */
	public Map<String, Object> queryCustInfo(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff) throws Exception;
	/**
	 * 查询物联网客户信息-接入号
	 * @param queryParam
	 * @return
	 */
	public Map<String, Object> queryCustInfoByPhone4iot(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff) throws Exception;

	/**
	 * 查询物联网客户信息-接入号
	 * @param queryParam
	 * @return
	 */
	public Map<String, Object> queryCustInfoByMktResCode4iot(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff) throws Exception;

	/**
	 * 产品密码鉴权
	 * @param param
	 * @return
	 */
	public Map<String, Object> custAuth(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 已订购产品
	 * @param param
	 * @return
	 */
	public Map<String, Object> queryCustProd(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff) throws Exception;
	/**
	 * 客户详细信息查询
	 * @param param
	 * @return
	 */
	public Map<String, Object> queryCustDetail(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 通用产品查询
	 * @param param
	 * @return
	 */
	public Map<String, Object> queryCommProduct(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 客户属性规格列表查询
	 * @param param
	 * @return
	 */
	public Map<String, Object> custProfileSpecList(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff) throws Exception;
	/**
	 * 根据员工类型查询员工证件类型
	 * @param param
	 * @return
	 */
	public Map<String, Object> queryCertType(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff) throws Exception;

	/**
	 * 读卡身份证信息解密.
	 * @param data 加密数据
	 * @param secret 密钥
	 * @return
	 * @throws Exception
	 */
	Map<?, ?> decodeCert(String data, String secret) throws Exception;
	
	/**
	 * 解密蓝牙读取用户加密信息
	 * @param param
	 * @return
	 */
	public Map<String, Object> decodeUserInfo(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff,String dekeyWord,HttpServletRequest request) throws Exception;
	
	/**
	 * 根据客户查询接入号
	 * @param queryParam
	 * @return
	 */
	public Map<String, Object> queryAccNbrByCust(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 客户架构信息查询接口
	 * @param queryParam
	 * @return
	 */
	public Map<String, Object> queryCustCompreInfo(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff) throws Exception;
	
}
