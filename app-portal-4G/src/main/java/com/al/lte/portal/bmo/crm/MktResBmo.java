package com.al.lte.portal.bmo.crm;

import java.io.IOException;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.dom4j.DocumentException;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.InterfaceException;
import com.al.lte.portal.model.SessionStaff;

/**
 * 营销资源业务操作接口 .
 * <P>
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 下午2:14:11
 * @modifyDate 
 * @copyRight 亚信联创电信CRM研发部
 */
public interface MktResBmo {
	 /**
	  * 号码预占与释放
	  * @param dataBusMap
	  * @param optFlowNum
	  * @param sessionStaff
	  * @return
	  * @throws BusinessException
	  */
	 public Map<String, Object> prePhoneNumber(Map<String, Object> dataBusMap, String optFlowNum,
	            SessionStaff sessionStaff) throws Exception; 
	 /**
	  * 号码查询
	  * @param dataBusMap
	  * @param optFlowNum
	  * @param sessionStaff
	  * @return
	  * @throws BusinessException
	  */
	 public Map<String, Object> queryPhoneNumber(Map<String, Object> dataBusMap, String optFlowNum,
	            SessionStaff sessionStaff) throws Exception;
	 
	 /**
	  * 号码查询
	  * @param dataBusMap
	  * @param optFlowNum
	  * @param sessionStaff
	  * @return
	  * @throws InterfaceException
	  * @throws BusinessException
	  * @throws Exception
	  */
	public Map<String, Object> phoneNumInfoQry(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws InterfaceException, BusinessException, Exception;

	 /**
	  * 身份证查询预占号码信息
	  * @param dataBusMap
	  * @param optFlowNum
	  * @param sessionStaff
	  * @return
	  * @throws BusinessException
	  */
	 public Map<String,Object> queryNumberByIdentityId(Map<String, Object> dataBusMap, String optFlowNum,
	            SessionStaff sessionStaff) throws Exception;
	 /**
	  * UIM卡校验预占与释放
	  * @param dataBusMap
	  * @param optFlowNum
	  * @param sessionStaff
	  * @return
	  * @throws BusinessException
	  */
	 public Map<String, Object> uimCheck(Map<String, Object> dataBusMap, String optFlowNum,
	            SessionStaff sessionStaff) throws Exception;
	 
	 /**
	  * 查询号池
	  * @param dataBusMap
	  * @param optFlowNum
	  * @param sessionStaff
	  * @return
	  * @throws BusinessException
	  */
	 public Map<String, Object> queryNbrPool(Map<String, Object> dataBusMap, String optFlowNum,
	            SessionStaff sessionStaff) throws Exception;

	/**
	 * 查询待释放的号码资源
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws BusinessException
	 */
	public Map<String, Object> queryReleaseNum(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	
	/**
	 * 释放异常单的号码资源
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws BusinessException
	 */
	public Map<String, Object> releaseErrorNum(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	
	/**
	 * 更新已释放的号码状态
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws BusinessException
	 */
	public Map<String, Object> updateNumStatus(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	
	/**
     * 查询终端信息列表
     * 
     * @param dataBusMap
     *            查询入参
     * @param optFlowNum
     *            平台编码，用于记录日志
     * @param sessionStaff
     *            员工Session对象
     * @return Map<String, Object> 查询终端信息列表
     * @throws BusinessException
     */
    public Map<String, Object> queryMktResInfo(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff) throws Exception;

    public Map<String, Object> queryMktResInfoByCode(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff) throws Exception;
    public Map<String, Object> queryMktResInfoByCode2(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff) throws Exception;

	public Map<String, Object> queryNewInfoMktRes(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
    
    
    /**
     * 终端串号校验
     * @param map 入参
     * @param optFlowNum 操作流水
     * @param sessionStaff 会话对象
     * @return 操作结果
     * @throws BusinessException
     */
    public Map<String, Object> checkTerminalCode(Map<String, Object> map, String optFlowNum, SessionStaff sessionStaff)
            throws Exception;
    
    /**
     * 能力开放
     * 终端串号校验
     * @param map 入参
     * @param optFlowNum 操作流水
     * @param sessionStaff 会话对象
     * @return 操作结果
     * @throws BusinessException
     */
    public Map<String, Object> checkTerminalCodeSub(Map<String, Object> map, String optFlowNum,
			SessionStaff sessionStaff) throws Exception;
    /**
     * 终端串号校验
     * @param map 入参
     * @param optFlowNum 操作流水
     * @param sessionStaff 会话对象
     * @return 操作结果
     * @throws BusinessException
     */
    public Map<String, Object> checkTerminalCodeBack(Map<String, Object> map, String optFlowNum, SessionStaff sessionStaff)
            throws Exception;
    
    
    public Map<String, Object> queryOfferByMtkResCd(Map<String, Object> map, String optFlowNum, SessionStaff sessionStaff)
    		throws Exception;

    /**
	 * 卡应用信息查询
	 * @param map 入参
	 * @param optFlowNum 操作流水
	 * @param sessionStaff 会话对象
	 * @return 查询结果List
	 * @throws Exception
     */
    public Map<String, Object> queryNfcAppInfos(Map<String, Object> map, String optFlowNum, SessionStaff sessionStaff)
    		throws Exception;

    /**
	 * 获取卡组件信息
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws BusinessException
	 */
	public Map<String, Object> getCardDllInfoJson(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff)
			throws BusinessException;
    /**
	 * 获取动态链接库密钥
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws BusinessException
	 */
	public Map<String, Object> getAuthCode(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff)
			throws BusinessException;
    /**
	 * 获取写卡信息（经过加密，卡管系统获取）
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws BusinessException
	 */
	public Map<String, Object> getCardInfo(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff)
			throws BusinessException;
    /**
	 * 获取卡类型（3G/4G卡）
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return 资源卡信息完整信息
	 * @throws BusinessException
	 */
	public Map<String, Object> getUimCardType(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
    /**
	 * 写卡完成后上报
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws BusinessException
     * @throws DocumentException 
     * @throws IOException 
     * @throws InterfaceException 
	 */
	public Map<String, Object> submitUimCardInfo(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	
    /**
     * 4.23	根据终端串码查询终端信息（如果是合约同时返回绑定的产品销售品信息）
     * @param map 入参
     * @param optFlowNum 操作流水
     * @param sessionStaff 会话对象
     * @return 操作结果
     * @throws BusinessException
     */
    public Map<String, Object> queryCoupon(Map<String, Object> map, String optFlowNum, SessionStaff sessionStaff)
            throws Exception;

	/**
	 * 产品实例与号码关系查询接口
	 * @param param
	 * @param flowNum
	 * @param sessionStaff
	 * @return
	 */
	public Map<String, Object> queryProdInstAccNbr(Map<String, Object> param,
			String flowNum, SessionStaff sessionStaff) throws Exception;
	/**
	 * 查询手机欠费。
	 * @param param
	 * @param flowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception 
	 */
    public Map<String, Object> getOweCharge(Map<String, Object> param, String flowNum, SessionStaff sessionStaff) throws Exception;
    /**
     * 销账
     * @param param
     * @param flowNum
     * @param sessionStaff
     * @return
     */
    public DataBus writeOffCash(Map<String, Object> param, String flowNum, SessionStaff sessionStaff);
    /**
     * 营销资源--号码等级查询
     * @param param
     * @param flowNum
     * @param sessionStaff
     * @return
     */
    public DataBus qryPhoneNbrLevelInfoList(Map<String, Object> param, String flowNum, SessionStaff sessionStaff) throws  Exception;
    
    public Map<String, Object> queryPnLevelProdOffer(Map<String, Object> dataBusMap, String optFlowNum,SessionStaff sessionStaff) throws Exception;
    /**
     * 号码预约提交
     * @param param
     * @param optFlowNum
     * @param sessionStaff
     * @return
     * @throws Exception
     */
    public Map<String, Object> reserveSubmit(Map<String, Object> param,String optFlowNum, SessionStaff sessionStaff) throws Exception;
    
    /**
     * 号码预约查询
     * @param param
     * @param optFlowNum
     * @param sessionStaff
     * @return
     * @throws Exception
     */
    public Map<String,Object> reserveQuery(Map<String, Object> param,String optFlowNum, SessionStaff sessionStaff) throws Exception;
    
    
    /**
     * 终端销售详情查询 - 手机专用
     * @param param
     * @param optFlowNum
     * @param sessionStaff
     * @return
     * @throws Exception
     */
    public Map<String,Object> qryTermSalesInfoList(Map<String, Object> param,String optFlowNum, SessionStaff sessionStaff) throws Exception;
    
    
    
    /**
     * 预约号码批量释放
     * @param param
     * @param optFlowNum
     * @param sessionStaff
     * @return
     * @throws Exception
     */
    public Map<String, Object> reserveBatchSubmit(Map<String, Object> param,String optFlowNum, SessionStaff sessionStaff) throws Exception;
    /**
     * 终端领用_终端校验
     * @param param
     * @param flowNum
     * @param sessionStaff
     * @return
     * @throws Exception
     */
	public Map<String, Object> checkTermianl(Map<String, Object> param,String flowNum, SessionStaff sessionStaff) throws Exception;
	/**
	 * 终端领用_终端领用
	 * @param param
	 * @param flowNum
	 * @param sessionStaff
	 * @return
	 */
	public Map<String, Object> termianlUse(Map<String, Object> param, String flowNum, SessionStaff sessionStaff) throws Exception;
	/**
	 * 终端领用_获取仓库
	 * @param param
	 * @param flowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> getTermianlStore(Map<String, Object> param,String flowNum, SessionStaff sessionStaff) throws Exception;
	
	public Map<String, Object> termOrderQuery(Map<String, Object> dataBusMap, String optFlowNum,SessionStaff sessionStaff) throws Exception;

	/**
	 * 终端配置查询
	 */
	public Map<String, Object> queryCouponConfig(Map<String, Object> dataBusMap,String flowNum,SessionStaff sessionStaff)
			throws Exception;
	
    /**
     * 预约码校验
     * @param map 入参
     * @param optFlowNum 操作流水
     * @param sessionStaff 会话对象
     * @return 操作结果
     * @throws BusinessException
     */
    public Map<String, Object> queryCouponReserveCodeCheck(Map<String, Object> map, String optFlowNum, SessionStaff sessionStaff)
            throws Exception;
    
    /**
     * 写白卡，卡号入库
     * @param param
     * @param newInstCode
     * @param string
     * @param sessionStaff
     * @param flowNum
     * @throws Exception
     */
	public void intakeSerialNumber(Map<String, Object> param,String newInstCode, String string, SessionStaff sessionStaff,String flowNum)throws Exception;
	/**
	 * 终端规格排序
	 * @param map
	 * @param flowNum
	 * @param sessionStaff
	 * @return
	 */
	public Map<String, Object> termSort(Map<String, Object> dataBusMap, String flowNum, SessionStaff sessionStaff)throws Exception;
	/**
	 * 终端查询
	 * @param dataBusMap
	 * @param flowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> termQuery(Map<String, Object> dataBusMap, String flowNum, SessionStaff sessionStaff)throws Exception;
	
	public void intcardNubInfoLog(Map<String, Object> param, String flowNum,SessionStaff sessionStaff)throws Exception;
	/**
	 * 客户证件校验接口
	 * @param checkIdMap
	 * @param flowNum
	 * @param sessionStaff
	 * @throws Exception
	 */
	public Map<String, Object> checkIdCardNumber(Map<String, Object> checkIdMap, String flowNum, SessionStaff sessionStaff) throws Exception;
	
	public Map<String, Object> checkTerminalCodeForAgent(Map<String, Object> map, String optFlowNum,SessionStaff sessionStaff) throws Exception ;
	
	public Map<String, Object> checkTermCompVal(Map<String, Object> map, String optFlowNum,SessionStaff sessionStaff) throws Exception ;
	
	/**
	 * 终端信息统计查询(精品渠道终端进销存汇总报表(实时数据))
	 * @param requstParamMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> terminalStatisticQueryList(Map<String, Object> requstParamMap, String optFlowNum, SessionStaff sessionStaff) throws InterfaceException, Exception;
	
	/**
	 * 终端销售信息明细统计查询: 精品渠道终端进销存明细报表(当日实时数据)和 精品渠道终端进销存(库存量)明细报表(当日实时数据)
	 * @param requstParamMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> terminalStatisticDetailQueryList(Map<String, Object> requstParamMap, String optFlowNum, SessionStaff sessionStaff) throws  InterfaceException, IOException, Exception;
    /**
     * 已使用卡资源查询
	 */
	public Map<String, Object> cardResourceQuery(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff)
			throws BusinessException;
	
	public Map<String, Object> pnLowAndPrePriceQry(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws InterfaceException, IOException, Exception;
	
	public void cacheParamsInSession(HttpServletRequest request, Map<String, Object> qryParam, String businessFlag);
	
	public Map<String, Object> getCachedParamsInSession(HttpServletRequest request, Map<String, Object> qryParam, String businessFlag);
	
	
	public Map<String, Object> queryStandaddress(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 宽带融合，资源预判接口
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryRescapability(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 宽带融合，终端预判接口
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryTerminaltype(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	
	/**
	 * 宽带融合，号码资源查询
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryNumber(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 宽带融合，号码资源预占/释放
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> numberRequest(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 宽带融合，帐号&接入号&密码生成（宽带/天翼高清）
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> accountRequest(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception;
	/**写卡错误信息记录日志平台*/
	public void writeCardLogInfo(String string, Map<String, Object> param, String flowNum,
			SessionStaff sessionStaff)throws Exception;
	/**
	 * 门户调用的图片批量上传（基于订单）接口
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> upLoadPicturesFileToFtp(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 甩单终端串码预占校验接口：调用终端销售系统的接口来进行终端串码预占校验（校验预占的客户信息和实际办理业务的客户信息是否一致），检验通过后方可继续合约办理（只走csb）
	 * @param paramMap
	 * @param flowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> checkReservedTerminal(
			Map<String, Object> param, String flowNum,
			SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 营销推荐清单查询服务
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryMktCustList(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 营销标签查询服务
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryProdInstStats(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 营销活动列表查询服务
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryMktActivityList(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 营销任务（接触）反馈结果记录服务
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> saveMktContactResult(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
		
 }
