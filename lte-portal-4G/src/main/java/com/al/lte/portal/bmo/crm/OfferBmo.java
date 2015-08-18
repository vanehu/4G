package com.al.lte.portal.bmo.crm;

import java.util.Map;

import com.al.lte.portal.model.SessionStaff;

/**
 * 销售品相关业务操作接口 .
 * <P>
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 下午2:14:11
 * @modifyDate 
 * @copyRight 亚信联创电信CRM研发部
 */
public interface OfferBmo {
	/**
	 * 查询默认必开附属销售品
	 * @param param
	 * @return
	 */
	public Map<String, Object> queryMustAttOffer(Map<String, Object> paramMap,String optFlowNum, SessionStaff sessionStaff) throws Exception;
	/**
	 * 查询默认必开附属销售品 和功能产品 
	 * @param param
	 * @return
	 */
	public Map<String, Object> queryMustAttOfferServ(Map<String, Object> paramMap,String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 查询默认必开功能产品
	 * @param param
	 * @return
	 */
	public Map<String, Object> queryServSpec(Map<String, Object> paramMap,String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 查询已订购附属销售品
	 * @param paramMap
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryAttachOffer(Map<String, Object> paramMap,String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 查询可订购附属销售品
	 * @param paramMap
	 * @return
	 */
	public Map<String, Object> queryCanBuyAttachSpec(Map<String, Object> paramMap,String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 查询可订购功能产品
	 * @param paramMap
	 * @return
	 */
	public Map<String, Object> queryCanBuyServ(Map<String, Object> paramMap,String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 查询已订购附属销售品参数
	 * @param paramMap
	 * @return
	 */
	public Map<String, Object> queryOfferParam(Map<String, Object> paramMap,String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 查询互斥依赖
	 * @param paramMap
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryExcludeDepend(Map<String, Object> paramMap,String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 查询功能产品互斥依赖
	 * @param paramMap
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryServExcludeDepend(Map<String, Object> paramMap,String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
    /**
     * 销售品实例构成
     * @param dataBusMap
     * @param optFlowNum
     * @param sessionStaff
     * @return
     * @throws Exception
     */
    public Map<String, Object> queryOfferInst(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff)
    		throws Exception;
    
    /**
  	 * 查询销售品构成
  	 * @param paramMap
  	 * @return
  	 * @throws Exception
  	 */
    public Map<String, Object> queryOfferSpecParamsBySpec(Map<String, Object> dataBusMap,String optFlowNum, 
    		SessionStaff sessionStaff) throws Exception;
    
    /**
  	 * 查询销售品标签
  	 * @param paramMap
  	 * @return
  	 * @throws Exception
  	 */
    public Map<String, Object> queryLabel(Map<String, Object> dataBusMap,String optFlowNum, 
    		SessionStaff sessionStaff) throws Exception;
    
    /**
  	 * 加载实例到缓存
  	 * @param paramMap
  	 * @return
  	 * @throws Exception
  	 */
    public Map<String, Object> loadInst(Map<String, Object> dataBusMap,String optFlowNum, 
    		SessionStaff sessionStaff) throws Exception;
    
    /**
     * 群号查询
     * @param dataBusMap
     * @param optFlowNum
     * @param sessionStaff
     * @return
     * @throws Exception
     */
    public Map<String, Object> queryGroupList(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)throws Exception;

    /**
     * 销售品编码转换
     * @param paramMap
     * @param optFlowNum
     * @param sessionStaff
     * @return
     * @throws Exception
     */
    public Map<String, Object> prodOfferChange(Map<String, Object> paramMap,String optFlowNum, SessionStaff sessionStaff)throws Exception;
    
	public Map<String, Object> querySeq(Map<String, Object> paramMap,String optFlowNum, 
			SessionStaff sessionStaff) throws Exception;
    
    /**
     * 咱存单查询
     * @param paramMap
     * @param optFlowNum
     * @param sessionStaff
     * @return
     * @throws Exception
     */
    public Map<String, Object> queryTemporaryOrder(Map<String, Object> paramMap,String optFlowNum, SessionStaff sessionStaff)throws Exception;
	/**
	 * 销售品收藏查询
	 * @param paramMap
	 * @param object
	 * @param sessionStaff
	 * @return
	 */
    public Map<String, Object> queryMyfavorite(Map<String, Object> paramMap,String optFlowNum, SessionStaff sessionStaff)throws Exception;
    /**
     * 收藏销售品
     * @param paramMap
     * @param optFlowNum
     * @param sessionStaff
     * @return
     * @throws Exception
     */
	public Map<String, Object> addMyfavorite(Map<String, Object> paramMap,String optFlowNum, SessionStaff sessionStaff)throws Exception;
	
	/**
     * 删除收藏夹中销售品
     * @param paramMap
     * @param optFlowNum
     * @param sessionStaff
     * @return
     * @throws Exception
     */
	public Map<String, Object> delMyfavorite(Map<String, Object> paramMap,String optFlowNum, SessionStaff sessionStaff)throws Exception;

}
