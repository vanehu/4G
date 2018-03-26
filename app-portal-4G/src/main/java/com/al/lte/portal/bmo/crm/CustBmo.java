package com.al.lte.portal.bmo.crm;

import java.io.IOException;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.InterfaceException;
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
	/**
	 * 账户和使用人信息查询服务
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryAccountAndUseCustInfo(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 实名制证件上传
	 * @throws Exception 
	 * @throws InterfaceException 
	 * @throws IOException 
	 */
	public Map<String, Object> uploadCustCertificate(Map<String, Object> param, SessionStaff sessionStaff) throws BusinessException, InterfaceException, IOException, Exception;
	/**
	 * 实名制证件图片添加水印
	 */
	public Map<String, Object> preHandleCustCertificate(String base64ImageStr, String venderId) throws IOException;
	
	/**
	 * 人证照片比对
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> verify(Map<String, Object> dataBusMap, String optFlowNum,SessionStaff sessionStaff) throws Exception;

    /**
     * 客户资料同步接口
     */
    public Map<String, Object> custinfoSynchronize(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception;

    /**
     * 证号关系预校验接口
     */
    public Map<String, Object> preCheckCertNumberRel(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception;

    /**
     * 获取custId的seq
     *
     * @param paramMap
     * @param optFlowNum
     * @param sessionStaff
     * @return
     * @throws Exception
     */
    public Map<String, Object> getSeq(Map<String, Object> paramMap, String optFlowNum, SessionStaff sessionStaff) throws Exception;

	/**
	 * 实名核验
	 * @param queryParam
	 * @return
	 */
	public Map<String, Object> checkCustCert(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff) throws Exception;
	/**
	 * 获取云平台加密身份证信息
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	 public Map<String, Object> queryCert(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception;
}
