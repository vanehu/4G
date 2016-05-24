package com.al.lte.portal.bmo.crm;
import java.io.IOException;
import java.util.Map;

import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.InterfaceException;
import com.al.lte.portal.model.SessionStaff;


/**
 * 订单管理业务操作类 .
 * <P>
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 下午2:14:11
 * @modifyDate 
 * @copyRight 亚信联创电信CRM研发部
 */
public interface OrderBmo {
	
	/**
	 * 查询销售品规格
	 * @param paramMap
	 * @return
	 * @throws Exception
	 */
    public Map<String, Object> queryMainOfferSpecList(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff)
    	throws Exception;
    
    /**
  	 * 查询销售品构成
  	 * @param paramMap
  	 * @return
  	 * @throws Exception
  	 */
     public Map<String, Object> queryOfferSpecParamsBySpec(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff)
  	throws Exception;
      
	/**
	 * 订单提交
	 * @param paramMap
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> orderSubmit(Map<String, Object> paramMap,String optFlowNum, 
			SessionStaff sessionStaff) throws Exception;
	/**
	 * 物联网订单提交
	 * @param paramMap
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> orderSubmit4iot(Map<String, Object> paramMap,String optFlowNum,
			SessionStaff sessionStaff) throws Exception;

	/**
	 * 订单提交(一次性，用于异地补换卡CRM侧本地订单记录)
	 * @param paramMap
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> orderSubmitComplete(Map<String, Object> paramMap,String optFlowNum, 
			SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 作废购物车
	 * @param param
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> delOrder(Map<String, Object> param,String optFlowNum, 
			SessionStaff sessionStaff) throws Exception;
    
	
	 /**
	  * 算费
	  * @param dataBusMap
	  * @param optFlowNum
	  * @param sessionStaff
	  * @return
	  * @throws Exception
	  */
	 public Map<String, Object> queryChargeList(Map<String, Object> dataBusMap, String optFlowNum,
	            SessionStaff sessionStaff) throws Exception;
	 /**
	  * 根据业务对象动作查询可操作的费用项
	  * @param dataBusMap
	  * @param optFlowNum
	  * @param sessionStaff
	  * @return
	  */
	 public Map<String,Object> queryAddChargeItems(Map<String, Object> dataBusMap, String optFlowNum,
				SessionStaff sessionStaff) throws Exception;
	 /**
	  * 费用项可支持付费方式查询
	  * @param dataBusMap
	  * @param optFlowNum
	  * @param sessionStaff
	  * @return
	  * @throws Exception
	  */
	 public Map<String, Object> queryPayMethodByItem(Map<String, Object> dataBusMap, String optFlowNum,
				SessionStaff sessionStaff) throws Exception;
	 /**
	  * 收费提交
	  * @param dataBusMap
	  * @param optFlowNum
	  * @param sessionStaff
	  * @return
	  * @throws Exception
	  */
	 public Map<String,Object> chargeSubmit(Map<String, Object> dataBusMap, String optFlowNum,
				SessionStaff sessionStaff) throws Exception;
		 
	 /**
	  * 查询条件项配置
	  * @param dataBusMap
	  * @param optFlowNum
	  * @param sessionStaff
	  * @return
	  * @throws Exception
	  */
	 public Map<String,Object> queryAgentPortalConfig(Map<String, Object> dataBusMap, String optFlowNum,
	            SessionStaff sessionStaff) throws Exception;


    /**
     * 产品规格属性查询
     * @param map 接口类型
     * @param map 入参
     * @param optFlowNum 操作流水
     * @param sessionStaff 会话对象
     * @return 操作结果
     * @throws Exception
     */
    public Map<String, Object> orderSpecParam(Map<String, Object> map, String optFlowNum, SessionStaff sessionStaff)
	throws Exception ;
    
    /**
     * 订单实例属性查询
     * @param map 接口类型
     * @param map 入参
     * @param optFlowNum 操作流水
     * @param sessionStaff 会话对象
     * @return 操作结果
     * @throws Exception
     */
    public Map<String, Object> orderSpecParamChange(Map<String, Object> map1,Map<String, Object> map2, String optFlowNum, SessionStaff sessionStaff)
            throws Exception;	
    

	/**
	 * 拆机、预拆机、预拆机复机
	 * @param param
	 * @return
	 */
	public Map<String, Object> removeProd(Map<String, Object> param);
	
	
	
	/**
	 * 查询帐户信息
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryAccountInfo(Map<String, Object> param, String optFlowNum, SessionStaff sessionStaff)
			throws Exception;

	/**
	 * 批量插入Excel
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String,Object> batchExcelImport(Map<String, Object> param, String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	/**
	 * 批量检验导入号码\Uim
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> batchCheckPhoneAndUim(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	/**
	 * 订单查询
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String,Object> qryOrderList(Map<String, Object> param, String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	
	/**
	 * 根据批次号和staffId查询批量插入数据
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> batchExcelQuery(Map<String, Object> param,String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	/**
	 * 查询种子订单
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String,Object> batchOrderQuery(Map<String, Object> param,String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	
	/**
	 * 批量受理结果查询
	 * @param param 入参需包含批次号groupId(必填)和地区commonRegionId(非必填)
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 * @author ZhangYu
	 */
	public Map<String,Object> batchStatusQuery(Map<String, Object> param,String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	
	/**
	 * 批次信息查询下的删除和修改
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @author ZhangYu
	 * @throws Exception 
	 * @throws IOException 
	 * @throws InterfaceException 
	 */
	public Map<String,Object> batchOperate(Map<String, Object> param,String optFlowNum, SessionStaff sessionStaff) throws InterfaceException, IOException, Exception;
	
	/**
	 * 进度查询下的“取消”和“删除”
	 * @param param  = {"areaId":"登录员工的areaId","batchId":"批次号","action":"cancel或者retry","statusCd":"批次状态", "staffId":"登录员工的staffId","channelId":"登录员工的channelId"}
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return {"resultCode":"0或者1""resultMsg":"重发成功/取消成功"}
	 * @throws InterfaceException
	 * @throws IOException
	 * @throws Exception
	 * @author ZhangYu
	 */
	public Map<String, Object> batchReprocess(Map<String, Object> param, String optFlowNum, SessionStaff sessionStaff) throws InterfaceException, IOException, Exception;
	
	/**
	 * 批次信息查询下的进度查询
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @author ZhangYu
	 * @throws BusinessException 
	 * @throws Exception 
	 * @throws IOException 
	 * @throws InterfaceException 
	 */
	public Map<String,Object> batchProgressQuery(Map<String, Object> param,String optFlowNum, SessionStaff sessionStaff) throws BusinessException, InterfaceException, IOException, Exception;
	
	/**
	 * 批次信息查询
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @author ZhangYu
	 * @throws Exception 
	 */
	public Map<String,Object> batchOrderQueryList(Map<String, Object> param,String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 作废种子订单
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String,Object> batchOrderDel(Map<String, Object> param,String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	
	
	/**
	 * 加入群组
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryCompProdMemberByAn(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	
	public Map<String, Object> queryCompPspecGrpsBySpecId(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception;

	public Map<String, Object> shortnum_query(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	
	/**
	 * 查询套餐业务下帐户信息
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryProdAcctInfo(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	/**
	 * 产品下终端实例数据查询
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryOfferCouponById(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	
	/**
	 * 查询帐户详情
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryAcctDetailInfo(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	
	/**
	 * 产品实例所属群组产品信息查询
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryCompProdInstByProdId(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception;

	/**
	 * 订单详情
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String,Object> queryOrderInfoById(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	
	/**
	 * 产品规则校验（动作，产品状态，停复机记录）
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> checkProdRule(Map<String, Object> dataBusMap,String flowNum,SessionStaff sessionStaff)
			throws Exception;

	/**
	 * 作废发票
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> updateInvoiceInvalid(Map<String, Object> dataBusMap,String flowNum,SessionStaff sessionStaff)
			throws Exception;
	/**
	 * 预校验单接口
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> updateCheckByChange(Map<String, Object> dataBusMap,String flowNum,SessionStaff sessionStaff)
			throws Exception;
	
	/**
	 * 群组短号校验
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> groupShortNbrQuery(Map<String, Object> dataBusMap,String flowNum,SessionStaff sessionStaff)
			throws Exception;
	
	/**
	 * 协销人类型
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> assistantTypeQuery(Map<String, Object> dataBusMap,String flowNum,SessionStaff sessionStaff)
			throws Exception;


    public Map<String, Object> updateArchivedAuto(Map<String, Object> paramMap,String flowNum,SessionStaff sessionStaff)throws Exception ;
	
    /**
     * 撤单校验接口
     * @param paramMap
     * @param flowNum
     * @param sessionStaff
     * @return
     * @throws Exception
     */
    public Map<String, Object> orderUndoCheck(Map<String, Object> paramMap,String flowNum,SessionStaff sessionStaff)throws Exception ;
	
    /**
	  * 收费提交
	  * @param dataBusMap
	  * @param optFlowNum
	  * @param sessionStaff
	  * @return
	  * @throws Exception
	  */
	 public Map<String,Object> checkRuleToProv(Map<String, Object> dataBusMap, String optFlowNum,
				SessionStaff sessionStaff) throws Exception;
    
    public Map<String, Object> querybusitype(Map<String, Object> paramMap,String flowNum,SessionStaff sessionStaff)throws Exception ;
    
    public Map<String, Object> querybusiactiontype(Map<String, Object> paramMap,String flowNum,SessionStaff sessionStaff)throws Exception ;
    
    public Map<String, Object> suborderysl(Map<String, Object> paramMap,String flowNum,SessionStaff sessionStaff)throws Exception ;
    
    public Map<String, Object> updateorderzdyy(Map<String, Object> paramMap,String flowNum,SessionStaff sessionStaff)throws Exception ;
    
    public Map<String, Object> queryyslList(Map<String, Object> paramMap,String flowNum,SessionStaff sessionStaff)throws Exception ;
    
    public Map<String, Object> queryzdyyList(Map<String, Object> paramMap,String flowNum,SessionStaff sessionStaff)throws Exception ;

    public Map<String, Object> queryzdyyDetail(Map<String, Object> paramMap,String flowNum,SessionStaff sessionStaff)throws Exception ;
    
    public Map<String,Object> updateChargeInfoForCheck(Map<String, Object> dataBusMap, String optFlowNum,SessionStaff sessionStaff) throws Exception;
    
    public Map<String,Object> createorderlonger(Map<String, Object> dataBusMap, String optFlowNum,SessionStaff sessionStaff) throws Exception;
    
    public Map<String, Object> queryAuthenticDataRange(Map<String, Object> dataBusMap, String optFlowNum,SessionStaff sessionStaff) throws Exception;
    
    public Map<String, Object> GetOLpos(Map<String, Object> dataBusMap, String optFlowNum,SessionStaff sessionStaff) throws Exception;

    public Map<String, Object> queryOrderItemDetailForResale(Map<String, Object> dataBusMap, String optFlowNum,SessionStaff sessionStaff) throws Exception;
    
    /**
     * 数据抽取，根据订单ID查询订单提交的报文
     * @param dataBusMap
     * @param optFlowNum
     * @param sessionStaff
     * @return
     * @throws Exception
     */
    public Map<String, Object> queryOrderListInfoByCustomerOrderId(Map<String, Object> dataBusMap, String optFlowNum,SessionStaff sessionStaff) throws Exception;
    
    /**
     * 资源补录，补充在订单提交时未填写的资源信息（分段受理）
     * @param dataBusMap
     * @param optFlowNum
     * @param sessionStaff
     * @return
     * @throws Exception
     */
    public Map<String, Object> saveResourceData(Map<String, Object> dataBusMap, String optFlowNum,SessionStaff sessionStaff) throws Exception;
    
	/**
	 * 一卡双号校验接口
	 */
	public Map<String, Object> queryAccNbrList(Map<String, Object> paramMap,String optFlowNum, 
			SessionStaff sessionStaff) throws Exception;
	/**
	 * 一卡双号订购退订正式单接口
	 */
	public Map<String, Object> exchangeAccNbr(Map<String, Object> paramMap,String optFlowNum, 
			SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 一卡双号虚号查询接口
	 */
	public Map<String, Object> queryVirtualInfo(Map<String, Object> paramMap,String optFlowNum, 
			SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 产品实例属性
	 */
	public Map<String, Object> prodInstParam(Map<String, Object> param, String optFlowNum, SessionStaff sessionStaff)
		    throws Exception;
	
	/**
	 * 自助换卡查询进度接口
	 */
	public Map<String, Object> cardProgressQuery(Map<String, Object> paramMap,String optFlowNum, 
			SessionStaff sessionStaff) throws Exception;

	public Map<String, Object> qryFeeInfoList(Map<String, Object> param, String flowNum, SessionStaff sessionStaff) throws Exception;

	public Map<String, Object> qryCountInfoList(Map<String, Object> param, String flowNum, SessionStaff sessionStaff) throws Exception;
	
	public Map<String, Object> qryCount(Map<String, Object> param, String flowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 终端预约记录查询
	  */
	public Map<String, Object> queryCouponReserve(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 配置数据查询
	 */
	public Map<String, Object> queryConfigData(Map<String, Object> param, String optFlowNum, SessionStaff sessionStaff)
		    throws Exception;
	
	/**
	 * 以旧换新查询终端属性配置
	 */
	public Map<String, Object> queryCouponAttrValue(Map<String, Object> param, String optFlowNum, SessionStaff sessionStaff)
		    throws Exception;
	
	/**
	 * 以旧换新回购价格查询
	 */
	public Map<String, Object> queryOldCouponDiscountPriceByAttrs(Map<String, Object> param, String optFlowNum, SessionStaff sessionStaff)
		    throws Exception;
	
	/**
	 * 以旧换新旧串码校验（是否可以办理以旧换新）
	 */
	public Map<String, Object> checkNewOldCouponRel(Map<String, Object> param, String optFlowNum, SessionStaff sessionStaff)
		    throws Exception;
	
	/**
	 * 以旧换新旧新旧串码关系保存
	 */
	public Map<String, Object> saveNewOldCouponRelInfo(Map<String, Object> param, String optFlowNum, SessionStaff sessionStaff)
		    throws Exception;
	
	/**
	 * 主套餐可选付费类型查询
	 */
	public Map<String, Object> queryOfferFeeType(Map<String, Object> param, String optFlowNum, SessionStaff sessionStaff)
		    throws Exception;
	
	public Map<String, Object> saveOrderAttrs(Map<String, Object> dataBusMap, String optFlowNum,SessionStaff sessionStaff) throws Exception;
	
	 public Map<String,Object> queryOrderBusiHint(Map<String, Object> dataBusMap, String optFlowNum,
				SessionStaff sessionStaff) throws Exception;

	/**积分扣减服务*/
	public Map<String, Object> reducePoingts(Map<String, Object> param,String flowNum, SessionStaff sessionStaff)throws Exception;

	/**积分权益查询服务*/
	public Map<String, Object> queryIntegral(Map<String, Object> paramMap,String flowNum, SessionStaff sessionStaff)throws Exception;

	/**积分历史查询*/
	public Map<String, Object> queryStarHisList(Map<String, Object> param,String flowNum, SessionStaff sessionStaff)throws Exception;
	
	/**积分消费历史查询*/
	public Map<String, Object> queryStarConsumeHisList(Map<String, Object> param,String flowNum, SessionStaff sessionStaff)throws Exception;

	public Map<String, Object> urgentOpen(Map<String, Object> param,String flowNum, SessionStaff sessionStaff)throws Exception;
	
	/**
	 * 一卡双号根据虚号查询主号接口
	 */
	public Map<String, Object> queryMainInfo(Map<String, Object> paramMap,String optFlowNum, 
			SessionStaff sessionStaff) throws Exception;
	/**
	 * 一卡双号黑名单新增
	 */
	public Map<String, Object> addBlackUserInfo(Map<String, Object> paramMap,String optFlowNum, 
			SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 一卡双号黑名单查询
	 */
	public Map<String, Object> queryBlackUserInfo(Map<String, Object> paramMap,String optFlowNum, 
			SessionStaff sessionStaff) throws Exception;
	/**
     *渠道可支持的付费方式查询接口
	 */
	public Map<String, Object> queryAvilablePayMethodCdByChannelId(Map<String, Object> paramMap,String optFlowNum, 
			SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 电子档案查询
	 */
	public Map<String,Object> queryElecRecordList(Map<String, Object> paramMap,String optFlowNum, 
			SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 电子档案下载
	 */
	public Map<String,Object> downLoadElecRecordPdf(Map<String, Object> paramMap,String optFlowNum, 
			SessionStaff sessionStaff) throws Exception;
}
