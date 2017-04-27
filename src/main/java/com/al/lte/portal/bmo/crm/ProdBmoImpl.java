package com.al.lte.portal.bmo.crm;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.model.SessionStaff;


/**
 * 产品变更业务操作类 .
 * <P>
 * 
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 下午2:14:11
 * @modifyDate
 * @copyRight 亚信联创电信CRM研发部
 */
@Service("com.al.lte.portal.bmo.crm.ProdBmo")
public class ProdBmoImpl implements ProdBmo {
	
	protected final Log log = Log.getLog(getClass());
	
	//产品信息查询
	public Map<String, Object> prodQuery(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception{
		DataBus db = InterfaceClient.callService(dataBusMap,PortalServiceCode.INTF_QUERY_PROD,optFlowNum,sessionStaff);
		try{
			Map<String, Object> resultMap = db.getReturnlmap();
			return resultMap;
		}catch(Exception e){
			log.error("门户处理营业受理后台的queryProdAndOfferByConditions服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_ACCT, dataBusMap, db.getReturnlmap(), e);
		}			
	}
	
	//产品实例详情查询
	public Map<String, Object> prodDetailQuery(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff)
			throws Exception{
		DataBus db = InterfaceClient.callService(dataBusMap,PortalServiceCode.INTF_QUERY_PROD_DETAIL,optFlowNum,sessionStaff);
		try{
			Map<String, Object> resultMap = db.getReturnlmap();
			return resultMap;
		}catch(Exception e){
			log.error("门户处理营业受理后台的queryProdInfo服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.PROD_INST_DETAIL, dataBusMap, db.getReturnlmap(), e);
		}				
	}

	public Map<String, Object> prodSpecParamQuery(Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap,PortalServiceCode.PROD_SPEC_PARAM_QUERY,optFlowNum,sessionStaff);
		try{
			Map<String, Object> resultMap = db.getReturnlmap();
			return resultMap;
		}catch(Exception e){
			log.error("门户处理营业受理后台的queryProdAndCompProdItemsById服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.ORDER_PROD_ITEM, dataBusMap, db.getReturnlmap(), e);
		}
	}

	public Map<String, Object> prodInstParamQuery(Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap,PortalServiceCode.PROD_INST_PARAM_QUERY,optFlowNum,sessionStaff);
		try{
			Map<String, Object> resultMap = db.getReturnlmap();
			return resultMap;
		}catch(Exception e){
			//throw throwEx(ErrorCode.ORDER_PROD_INST_C,"queryProdInstItemsById",dataBusMap,db.getReturnlmap(),e);
			log.error("门户处理营业受理后台的queryProdInstItemsById服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.ORDER_PROD_INST, dataBusMap, db.getReturnlmap(), e);
		}
	}
	
}
