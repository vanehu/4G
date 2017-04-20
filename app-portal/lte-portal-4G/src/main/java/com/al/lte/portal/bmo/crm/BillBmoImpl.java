package com.al.lte.portal.bmo.crm;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.time.DateFormatUtils;
import org.dom4j.DocumentException;
import org.springframework.stereotype.Service;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.exception.InterfaceException.ErrType;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.ServiceClient;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;


/**
 * 计费管理业务操作类 .
 * <P>
 * 
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 下午2:14:11
 * @modifyDate
 * @copyRight 亚信联创电信CRM研发部
 */
@Service("com.al.lte.portal.bmo.crm.BillBmo")
public class BillBmoImpl implements BillBmo {
	
	protected final Log log = Log.getLog(getClass());

	public Map<String, Object> queryForegift(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		Map<String, Object> returnMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.QUERY_BAMOBJFOREITEMS,
				optFlowNum, sessionStaff);
		try {
			if ("0".equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> resultMap = db.getReturnlmap();
				Map<String, Object> tempList =  (Map<String, Object>) resultMap.get("result");
				returnMap.put("code", ResultCode.R_SUCCESS);
				returnMap.put("result", tempList);
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", "押金查询接口调用失败");
			}
			return returnMap;
		} catch (Exception e) {
			log.error("门户处理营业受理的service/intf.chargeService/queryBamObjForegitfItems服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_FOREGIFTITEMS,dataBusMap,db.getReturnlmap(), e);
		}
		
	}

	public Map<String, Object> updateBamObjForegiftForReturn(
			Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		Map<String, Object> returnMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.UPDATE_BAMOBJFOREGIFT_FOR_RETURN,
				optFlowNum, sessionStaff);
		try {
			if ("0".equals(StringUtils.defaultString(db.getResultCode()))) {
				returnMap.put("code", ResultCode.R_SUCCESS);
				returnMap.put("msg", db.getResultMsg());
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", "押金退款接口调用失败");
			}
			return returnMap;
		} catch (Exception e) {
			log.error("门户处理营业受理的service/intf.chargeService/updateBamObjForegiftForReturn服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.BILL_RETUENFOREGIFT,dataBusMap,db.getReturnlmap(), e);
		}
		
	}

	public Map<String, Object> saveBamObjForegift(
			Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		Map<String, Object> returnMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.SAVE_BAMOBJFOREGIFT,
				optFlowNum, sessionStaff);
		try {
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				returnMap = MapUtils.getMap(db.getReturnlmap(), "result");
				returnMap.put("code", ResultCode.R_SUCC);
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", "收取押金接口调用失败");
			}
			return returnMap;
		} catch (Exception e) {
			log.error("门户处理营业受理的service/intf.chargeService/queryBamObjForegitfItems服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.BILL_SAVEFOREGIFT,dataBusMap,db.getReturnlmap(), e);
		}
		
	}

	public Map<String, Object> queryForegiftHistoryDetail(
			Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		Map<String, Object> returnMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.QUERY_FOREGIFTOPERDETAIL,
				optFlowNum, sessionStaff);
		try {
			if ("0".equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> resultMap = db.getReturnlmap();
				returnMap.put("code", ResultCode.R_SUCCESS);
				returnMap.put("result", resultMap.get("result"));
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", "押金查询接口调用失败");
			}
			return returnMap;
		} catch (Exception e) {
			log.error("门户处理营业受理的service/intf.chargeService/queryForegiftOperDetail服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_FOREGIFTOPERHISTORY,dataBusMap,db.getReturnlmap(), e);
		}
		
	}
	
	//余额查询
	public Map<String, Object> getBalance(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> returnMap = new HashMap<String, Object>();
		DataBus db = ServiceClient.callService(dataBusMap, PortalServiceCode.GET_BALANCE, optFlowNum, sessionStaff);
		try{
			if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db.getResultCode()))) {
				returnMap.put("code", ResultCode.R_SUCCESS);
				returnMap.put("resultMap", db.getReturnlmap());
			}else{
				returnMap.put("code", db.getResultCode());
				returnMap.put("message", db.getResultMsg());
			}
			return returnMap;
		}catch(Exception e){
			log.error("服务层的getBalance服务回参异常", e);
			throw new BusinessException(ErrorCode.QUERY_BALANCE, dataBusMap, db.getReturnlmap(), e);
		}				
	}
	
	//帐单查询
	public Map<String, Object> queryBill(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)throws Exception{
		
		DataBus db = ServiceClient.callService(dataBusMap, PortalServiceCode.QUERY_BILL, optFlowNum, sessionStaff);
		try{
			if(db.getResultCode().equals("POR-0000")){
				Map<String, Object> returnMap = db.getReturnlmap();
				return returnMap;
			}
			else{
				Map<String, Object> returnMap = new HashMap<String, Object>();
				returnMap.put("code", db.getResultCode());
				returnMap.put("message", db.getResultMsg());
				return returnMap;
			}
		}catch(Exception e){
			log.error("服务层的QueryCustomizeBill服务回参异常", e);
			throw new BusinessException(ErrorCode.QUERY_BILL, dataBusMap, db.getReturnlmap(), e);
		}		
	}
	
	public Map<String, Object> doCash(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		Map<String, Object> returnMap = new HashMap<String, Object>();
		DataBus db = ServiceClient.callService(dataBusMap, PortalServiceCode.DO_CASH, optFlowNum, sessionStaff);
		try{
			if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db.getResultCode()))) {
				String code=(String)db.getReturnlmap().get("code");
				if(ResultCode.R_SUCCESS.equals(code)){
					returnMap.put("code", ResultCode.R_SUCCESS);
					returnMap.put("reqSerial", db.getReturnlmap().get("reqSerial"));
				}else{
					returnMap.put("code", ResultCode.R_FAIL);
					returnMap.put("msg", db.getReturnlmap().get("message"));
				}	
			}else{
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", db.getResultMsg());
			}
			return returnMap;
		}catch(Exception e){
			log.error("服务层的DoCash服务回参异常", e);
			throw new BusinessException(ErrorCode.CASH_RECHARGE, dataBusMap, db.getReturnlmap(), e);
		}
	}
	/**
	 * 充值缴费记录查询
	 */
	public DataBus queryPayNotes(Map<String, Object> param,
			String flowNum, SessionStaff sessionStaff) throws BusinessException {
		DataBus db = ServiceClient.callService(param, PortalServiceCode.EXCHANGE_QUERY_SERVICE,
				flowNum, sessionStaff);
		return db;
	}

	public DataBus queryOfferUsage(Map<String, Object> param, String flowNum,
			SessionStaff sessionStaff) throws BusinessException {
		DataBus db = ServiceClient.callService(param, PortalServiceCode.SERVICE_QUERY_OFFER_USAGE,
				flowNum, sessionStaff);
		return db;
	}
	
	//详单查询
	public Map<String, Object> queryBillDetail(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)throws Exception{
		
		DataBus db = ServiceClient.callService(dataBusMap, PortalServiceCode.QUERY_BILL_DETAIL, optFlowNum, sessionStaff);
		try{
			if(db.getResultCode().equals("POR-0000")){
				Map<String, Object> returnMap = db.getReturnlmap();
				return returnMap;
			}
			else{
				Map<String, Object> returnMap = new HashMap<String, Object>();
				returnMap.put("code", db.getResultCode());
				returnMap.put("message", db.getResultMsg());
				return returnMap;
			}
		}catch(Exception e){
			throw new BusinessException(ErrorCode.QUERY_BILL_DETAIL, dataBusMap, db.getReturnlmap(), e);
		}		
	}
	/**
	 * 根据接入号查询终端资源信息过滤属性
	 * @throws BusinessException 
	 * @throws IOException 
	 * @throws InterfaceException 
	 * @throws DocumentException 
	 */
	public Map<String, Object> queryMktResInfoByAccessNum(
			Map<String, Object> params, String flowNum,
			SessionStaff sessionStaff) throws BusinessException, InterfaceException, IOException, Exception {
		DataBus db = InterfaceClient.callService(params, PortalServiceCode.QUERY_MKTRESINFO,flowNum, sessionStaff);
		Map<String, Object> returnMap =db.getReturnlmap();
		return returnMap;
	}
	
	/*
	 * 余额支取
	 */
	public Map<String, Object> payBalance(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)throws Exception{
		
		DataBus db = ServiceClient.callService(dataBusMap, PortalServiceCode.PAY_BALANCE, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		
		try{
			if(ResultCode.R_SUCCESS.equals(db.getResultCode())){
				Map<String, Object> returnMap = db.getReturnlmap();
				if(MapUtils.getString(returnMap, "code", "").equals("POR-0000")){
					resultMap.put("resultCode", "0");
					resultMap.put("result", returnMap.get("balanceInfo"));
				}
				else{
					resultMap.put("resultCode", "1");
					resultMap.put("result", returnMap.get("message"));
				}
			}
			else{
				resultMap.put("resultCode", "1");
				resultMap.put("result", db.getResultMsg());
			}
		}catch(Exception e){
			log.error("余额支取服务PayBalance返回的数据异常", e);
			throw new BusinessException(ErrorCode.PAY_BALANCE, dataBusMap, db.getReturnlmap(), e);
		}
		return resultMap;
	}

	/*
	 * 销帐查询
	 */
	public Map<String, Object> queryWriteOffCash(Map<String, Object> dataBusMap, String optFlowNum,SessionStaff sessionStaff) throws Exception {
		
		DataBus db = ServiceClient.callService(dataBusMap, PortalServiceCode.QUERY_WRITEOFFCASH, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();		
		try{
			if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> returnMap = db.getReturnlmap();
				if(ResultCode.R_SUCCESS.equals(MapUtils.getString(returnMap, "code", ""))){
					resultMap.put("resultCode", ResultCode.R_SUCC);
					resultMap.put("result", returnMap.get("result"));					
				}
				else{
					resultMap.put("resultCode", ResultCode.R_FAILURE);
					resultMap.put("message", returnMap.get("message"));
				}
			}
			else{
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("message", db.getResultMsg());
			}
		}catch(Exception e){
			log.error("销帐查询服务QueryWriteOffCashDetail返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_WRITEOFFCASH, dataBusMap, db.getReturnlmap(), e);
		}
		return resultMap;
	}
	
	/*
	 * 反销帐
	 */
	public Map<String, Object> reverseWriteOffCash(Map<String, Object> dataBusMap, String optFlowNum,SessionStaff sessionStaff) throws Exception {
		DataBus db = ServiceClient.callService(dataBusMap, PortalServiceCode.REVERSE_WRITEOFFCASH, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		
		try{
			if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> returnMap = db.getReturnlmap();
				if(returnMap.get("code").equals("POR-0000")){
					resultMap.put("resultCode", ResultCode.R_SUCC);
					resultMap.put("result", returnMap.get("result"));
				}else{
					resultMap.put("resultCode", ResultCode.R_FAILURE);
					resultMap.put("message", returnMap.get("message"));
				}
			}else{
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("message", db.getResultMsg());
			}
		}catch(Exception e){
			log.error("反销帐服务ReverseWriteOffCash返回的数据异常", e);
			throw new BusinessException(ErrorCode.REVERSE_WRITEOFFCASH, dataBusMap, db.getReturnlmap(), e);
		}
		return resultMap;
	}
	
	
	/*
	 * 打印发票
	 */
	public Map<String, Object> getInvoiceItems(Map<String, Object> dataBusMap, String optFlowNum,SessionStaff sessionStaff) throws Exception {
		DataBus db = ServiceClient.callService(dataBusMap, PortalServiceCode.PRINTI_NVOICE, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		
		try{
			if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> returnMap = db.getReturnlmap();
				if(returnMap.get("code").equals("POR-0000")){
					resultMap.put("resultCode", ResultCode.R_SUCC);
					resultMap.put("result", returnMap.get("result"));
				}else{
					resultMap.put("resultCode", ResultCode.R_FAILURE);
					resultMap.put("msg", returnMap.get("message"));
				}
			}else{
				resultMap.put("code", ResultCode.R_FAILURE);
				resultMap.put("msg", db.getResultMsg());
			}
		}catch(Exception e){
			log.error("销账历史记录 - 发票打印 printInvoice返回的数据异常", e);
			throw new BusinessException(ErrorCode.REVERSE_WRITEOFFCASH, dataBusMap, db.getReturnlmap(), e);
		}
		return resultMap;
	}
	/**
	 * 客户化账单打印
	 */
	public Map<String, Object> getCustomizeBillData(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)throws Exception{
		Map<String, Object> returnMap = new HashMap<String, Object>();
		DataBus db = ServiceClient.callService(dataBusMap, PortalServiceCode.GET_CUSTOMIZE_BILL_DATA, optFlowNum, sessionStaff);
		try{
			returnMap.put("outMap", db.getReturnlmap());
			returnMap.put("inMap", db.getParammap());
			return returnMap;
		}catch(Exception e){
			throw new BusinessException(ErrorCode.QUERY_BILL_DETAIL, dataBusMap, db.getReturnlmap(), e);
		}		
	}
	
	
	public Map<String, Object> chargeRecord(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff) {
		DataBus db = ServiceClient.callService(dataBusMap, PortalServiceCode.QUERY_CHARGE_RECORD, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		
		if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db.getResultCode()))) {
			if (MapUtils.isEmpty(db.getReturnlmap())) {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("message", "服务层返回的returnMap为空");
				return resultMap;
			}
			Map<String, Object> returnMap = db.getReturnlmap();
			if("POR-0000".equals(returnMap.get("code"))){
				resultMap.put("resultCode", ResultCode.R_SUCC);
				resultMap.put("paymentRecQueryRsp", returnMap.get("paymentRecQueryRsp"));
			}else{
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("message", returnMap.get("message"));
			}
		}else{
			resultMap.put("resultCode", ResultCode.R_FAILURE);
			resultMap.put("message", db.getResultMsg());
		}
		return resultMap;
	}

	public Map<String, Object> charge(Map<String, Object> paramMap,
			String flowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = ServiceClient.callService(paramMap, PortalServiceCode.APP_CHARGE, flowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db.getResultCode()))) {
				if (MapUtils.isEmpty(db.getReturnlmap())) {
					resultMap.put("resultCode", ResultCode.R_FAILURE);
					resultMap.put("message", "服务层返回的returnMap为空");
					return resultMap;
				}
				Map<String, Object> returnMap = db.getReturnlmap();
				if(ResultConstant.R_POR_SUCCESS.getCode().equals(returnMap.get("code"))){
					resultMap.put("resultCode", ResultCode.R_SUCC);
					resultMap.put("result", returnMap);
				}else{
					resultMap.put("resultCode", ResultCode.R_FAILURE);
					resultMap.put("message", returnMap.get("message"));
				}
			}else{
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("message", db.getResultMsg());
			}
		} catch(Exception e){
			log.error("翼销售充值返回的数据异常", e);
			throw new BusinessException(ErrorCode.BILL_CHARGE, paramMap, db.getReturnlmap(), e);
		}
		return resultMap;
	}

	public Map<String, Object> checkDeposit(Map<String, Object> paramMap,
			String flowNum, SessionStaff sessionStaff) throws Exception {
		 Map<String, Object> resultMap = new HashMap<String, Object>();
		Map<String,Object> contractRootMap = (Map<String, Object>) paramMap.get("ContractRoot");
		Map<String,Object> svcContMap = (Map<String, Object>) contractRootMap.get("SvcCont");
		svcContMap.put("StaffCode", sessionStaff.getStaffCode());//sessionStaff.getStaffCode()); // "TJ4562"(津)   100037304(西)   boss_test2(疆)  31001862(吉) 110063321(贵) 100000036(河南) YCY71203000412(内蒙古)
        svcContMap.put("ChannelNbr", sessionStaff.getCurrentChannelCode()); //sessionStaff.getCurrentChannelCode()); // "1201001006237"  4501003020321  1033230071 2201001020978  5203251000384  4114811104532  1501013006302
		svcContMap.put("CommonRegionId", sessionStaff.getAreaId()); //sessionStaff.getAreaId()); //"8120100"   8450101   8320100  8220100  8520325  8410100  8150100
		DataBus db = InterfaceClient.callCheckDepositService(paramMap, PortalServiceCode.CHECK_DEPOSIT, flowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
					.getResultCode()))) {
				resultMap = db.getReturnlmap();
				returnMap.put("code", ResultCode.R_SUCCESS);
			//	returnMap.putAll((Map)resultMap);
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", db.getResultMsg());
			}
		}catch(Exception e){
			throw new BusinessException(ErrorCode.CHECK_DEPOSIT, paramMap, db.getReturnlmap(), e);
		}	
		return returnMap;		
	}
	public Map<String, Object> balance(Map<String, Object> paramMap,
			String flowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = ServiceClient.callService(paramMap, PortalServiceCode.APP_BALANCE, flowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db.getResultCode()))) {
				if (MapUtils.isEmpty(db.getReturnlmap())) {
					resultMap.put("resultCode", ResultCode.R_FAILURE);
					resultMap.put("message", "服务层返回的returnMap为空");
					return resultMap;
				}
				Map<String, Object> returnMap = db.getReturnlmap();
				if(ResultConstant.R_POR_SUCCESS.getCode().equals(returnMap.get("code"))){
					resultMap.put("resultCode", ResultCode.R_SUCC);
					resultMap.put("result", returnMap);
				}else{
					resultMap.put("resultCode", ResultCode.R_FAILURE);
					resultMap.put("message", returnMap.get("message"));
				}
			}else{
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("message", db.getResultMsg());
			}
		} catch(Exception e){
			log.error("翼销售余额查询返回的数据异常", e);
			throw new BusinessException(ErrorCode.BILL_BALANCE, paramMap, db.getReturnlmap(), e);
		}
		return resultMap;
	}

	@Override
	public Map<String, Object> arrears(Map<String, Object> paramMap,
			String flowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = ServiceClient.callService(paramMap, PortalServiceCode.APP_ARREARS, flowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db.getResultCode()))) {
				if (MapUtils.isEmpty(db.getReturnlmap())) {
					resultMap.put("resultCode", ResultCode.R_FAILURE);
					resultMap.put("message", "服务层返回的returnMap为空");
					return resultMap;
				}
				Map<String, Object> returnMap = db.getReturnlmap();
				if(ResultConstant.R_POR_SUCCESS.getCode().equals(returnMap.get("code"))){
					resultMap.put("resultCode", ResultCode.R_SUCC);
					resultMap.put("result", returnMap);
				}else{
					resultMap.put("resultCode", ResultCode.R_FAILURE);
					resultMap.put("message", returnMap.get("message"));
				}
			}else{
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("message", db.getResultMsg());
			}
		} catch(Exception e){
			log.error("翼销售余额查询返回的数据异常", e);
			throw new BusinessException(ErrorCode.BILL_BALANCE, paramMap, db.getReturnlmap(), e);
		}
		return resultMap;
	}

	@Override
	public Map<String, Object> paymentQuery(Map<String, Object> paramMap,
			String flowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = ServiceClient.callService(paramMap, PortalServiceCode.APP_PAYMENT_QUERY, flowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db.getResultCode()))) {
				if (MapUtils.isEmpty(db.getReturnlmap())) {
					resultMap.put("resultCode", ResultCode.R_FAILURE);
					resultMap.put("message", "服务层返回的returnMap为空");
					return resultMap;
				}
				Map<String, Object> returnMap = db.getReturnlmap();
				if(ResultConstant.R_POR_SUCCESS.getCode().equals(returnMap.get("code"))){
					resultMap.put("resultCode", ResultCode.R_SUCC);
					resultMap.put("result", MapUtils.getObject(returnMap, "PaymentRecQueryRsp"));
				}else{
					resultMap.put("resultCode", ResultCode.R_FAILURE);
					resultMap.put("message", returnMap.get("message"));
				}
			}else{
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("message", db.getResultMsg());
			}
		} catch(Exception e){
			log.error("翼销售充值订单查询返回的数据异常", e);
			throw new BusinessException(ErrorCode.BILL_PAYMENT_QUERY, paramMap, db.getReturnlmap(), e);
		}
		return resultMap;
	}

	@Override
	public String getTranId(Map<String, Object> paramMap,
			String flowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = ServiceClient.callService(new HashMap<String, Object>(), PortalServiceCode.SERVICE_GET_TRANID, null, sessionStaff);
		String tranId = null;
		try {
			if("POR-0000".equals(db.getResultCode().toString())){
				tranId = MapUtils.getString(paramMap, "srcSysId", SysConstant.CSB_SRC_SYS_ID_APP) + DateFormatUtils.format(new Date(), "yyyyMMdd") + MapUtils.getString(db.getReturnlmap(), "TranId", "");
				if (28 == StringUtils.length(tranId)) {
					return tranId;
				}
			}
			
		} catch(Exception e){
			log.error("生成csb流水号异常", e);
			throw new BusinessException(ErrorCode.BILL_GET_TRAN_ID, paramMap, db.getReturnlmap(), e);
		}
		return null;
	}

}
