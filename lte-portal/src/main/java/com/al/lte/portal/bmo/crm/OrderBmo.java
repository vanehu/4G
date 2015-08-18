package com.al.lte.portal.bmo.crm;
import java.util.Map;

import com.al.ecs.exception.BusinessException;
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
    
    public Map<String, Object> queryyslList(Map<String, Object> paramMap,String flowNum,SessionStaff sessionStaff)throws Exception ;
    
    public Map<String, Object> insertbusirecord(Map<String, Object> dataBusMap, String optFlowNum,SessionStaff sessionStaff) throws Exception;

    public Map<String,Object> createorderlonger(Map<String, Object> dataBusMap, String optFlowNum,SessionStaff sessionStaff) throws Exception;
    /**
	 * v网 群号获取
	 * @param paramMap
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> querySeq(Map<String, Object> paramMap,String optFlowNum, 
			SessionStaff sessionStaff) throws Exception;
	
}
