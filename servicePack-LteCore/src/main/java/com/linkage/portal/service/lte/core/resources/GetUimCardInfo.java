package com.linkage.portal.service.lte.core.resources;



import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.exception.ExceptionUtils;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Node;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ailk.ecsp.core.DataRepository;
import com.ailk.ecsp.core.SysConstant;
import com.ailk.ecsp.intf.webservice.WSClient;
import com.ailk.ecsp.intf.webservice.WSConfig;
import com.ailk.ecsp.service.Service;
import com.ailk.ecsp.util.IConstant;
import com.ailk.ecsp.util.SoapUtil;
import com.al.ec.serviceplatform.client.CsbDataMap;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.exception.ResultConstant;
import com.linkage.portal.service.lte.DataMapUtil;
import com.linkage.portal.service.lte.LteConstants;
import com.linkage.portal.service.lte.WriteCardUtil;
import com.linkage.portal.service.lte.dao.AgentPortalConfigDAO;
import com.linkage.portal.service.lte.dao.AgentPortalConfigDAOImpl;
import com.linkage.portal.service.lte.dao.SoWriteCardDAO;
import com.linkage.portal.service.lte.dao.SoWriteCardDAOImpl;
import com.linkage.portal.service.lte.dto.TcpCont;

/**
 * 卡资源申请接口
 * @author xuj
 */
public class GetUimCardInfo extends Service {
	public SoWriteCardDAO soWriteCardDAO = new SoWriteCardDAOImpl();
    private final Logger log = LoggerFactory.getLogger(this.getClass());
    @SuppressWarnings("unchecked")
    @Override
    public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
		try{
			String[] params = { "cardNo","factoryCode","areaCode" };
			dataMap = DataMapUtil.checkParam(dataMap, params);
			if (StringUtils.isNotBlank(dataMap.getResultCode())) {
				return dataMap;
			}
	        String dbKeyWord = MapUtils.getString(dataMap.getInParam(), IConstant.CON_DB_KEY_WORD);		
			dataMap.addInParam("staffId", dataMap.getStaffId());
			dataMap.addInParam("staffName", dataMap.getStaffName());
			dataMap.addInParam("channelId", dataMap.getChannelId());
			dataMap.addInParam("channelName", dataMap.getChannelName());
			
			//判断卡类型所属类别
	        String cardNo = MapUtils.getString(dataMap.getInParam(),"cardNo","");
	        AgentPortalConfigDAO dao = new AgentPortalConfigDAOImpl();
	        Map param = new HashMap();
	        param.put("tableName", "SYSTEM");
	        param.put("columnName", "4G_AND_NFC_CARD");
	        param.put("columnValue", cardNo);
	        int count = dao.queryCountByParam(param,dbKeyWord);
	        boolean fourGAndNfcFlag = false;
	        if (count > 0){
	        	fourGAndNfcFlag = true;
	        }
	        String factoryCode = MapUtils.getString(dataMap.getInParam(),"factoryCode","");
	        String hmUimid = MapUtils.getString(dataMap.getInParam(),"hmUimid","");
	    	String inXML = TcpCont.parseTemplate(dataMap.getInParam(), getClass().getSimpleName());
			if (StringUtils.isBlank(inXML)) {
				return DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_INTF_PARAM_FAIL);
			}
			
			Map<String,Object> inMap = new HashMap<String,Object>();
	    	inMap.put("in0", inXML);
	    	String url = DataRepository.getInstence().getSysParamValue(LteConstants.CN2_CON_CSB_URL_KEY,SysConstant.CON_SYS_PARAM_GROUP_INTF_URL);
	    	WSConfig config = new WSConfig();	
			config.setUrl(url);//接口地址
			config.setMethodName("exchange"); //请求的接口名称
			config.setOutParamType(IConstant.CON_OUT_PARAM_TYPE_TO_XML);//输出参数格式
			config.setInParams(inMap);

			Map<String, Object> retnMap = new HashMap<String, Object>();
			//log.debug("----url:{}----",config.getUrl());
			Map<String, Object> resMap = WSClient.getInstance().callWS(config);
			String resultXml = (String)resMap.get("result");
			//String resultXml = "<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"><soap:Body><ns1:exchangeResponse xmlns:ns1=\"http://www.chinatelecom.hub.com\"><ns1:out><ContractRoot><TcpCont><ActionCode>1</ActionCode><TransactionID>1000000206201405286742087743</TransactionID><RspTime>20140528184340</RspTime><Response><RspType>0</RspType><RspCode>0000</RspCode><RspDesc>成功</RspDesc></Response></TcpCont><SvcCont><ResultCode>00000000</ResultCode><ResultMessage>成功</ResultMessage><CryptIndex>18</CryptIndex><PersonalData><ICCID>89861114257310506173</ICCID><IMSI>460037500481053</IMSI><UIMID>8063C0E0</UIMID><SID>377E</SID><ACCOLC>3</ACCOLC><NID>FFFF</NID><AKEY>DD4AC70B79FA4E16</AKEY><PIN1>1234</PIN1><PIN2>57696314</PIN2><PUK1>10940456</PUK1><PUK2>62450360</PUK2><ADM>C7C16FF7</ADM><HRPDUPP>460037500481053@mycdma.cn</HRPDUPP><HRPDSS>5BE2D6F65EFA1B89</HRPDSS><SIPUPP><SIPUPPData>23200F6374776170406D7963646D612E636E210F63746E6574406D7963646D612E636E20</SIPUPPData></SIPUPP><SIPSS><SIPSSData>394A0BA1DCD69E515362F300F11EEDE4</SIPSSData></SIPSS><MIPUPP><MIPUPPData>460037500481053@mycdma.cn</MIPUPPData></MIPUPP><MNHASS><MNHASSData>657F0D5C8722BD16</MNHASSData></MNHASS><MNHASS><MNHASSData>95BBBD61960023EB</MNHASSData></MNHASS><MNHASS><MNHASSData>31986E40A54AF5E6</MNHASSData></MNHASS><MNHASS><MNHASSData>2795E9A2B50888B8</MNHASSData></MNHASS><MNHASS><MNHASSData>1F76E96A290EFBD0</MNHASSData></MNHASS><MNHASS><MNHASSData>A2C237C25FC55BC3</MNHASSData></MNHASS><MNHASS><MNHASSData>D70327C529E66BA2</MNHASSData></MNHASS><MNHASS><MNHASSData>1B311279F568472A</MNHASSData></MNHASS><MNHASS><MNHASSData>4ACE6E99659D75BF</MNHASSData></MNHASS><MNHASS><MNHASSData>8CEE8B9196649987</MNHASSData></MNHASS><MNHASS><MNHASSData>22DA4C6EF3E98290</MNHASSData></MNHASS><MNHASS><MNHASSData>8BA33C82820C038D</MNHASSData></MNHASS><MNHASS><MNHASSData>BE24EEA717973DC8</MNHASSData></MNHASS><MNHASS><MNHASSData>B0E7E75ECF040444</MNHASSData></MNHASS><MNHASS><MNHASSData>045FEE6C4FB0F049</MNHASSData></MNHASS><MNAAASS><MNAAASSData>3DA890259E78C39F</MNAAASSData></MNAAASS><MNAAASS><MNAAASSData>15CC152804283C98</MNAAASSData></MNAAASS><MNAAASS><MNAAASSData>A8E6E5B0D113975C</MNAAASSData></MNAAASS><MNAAASS><MNAAASSData>D38722B00859E0DD</MNAAASSData></MNAAASS><MNAAASS><MNAAASSData>608CE4A24694EB73</MNAAASSData></MNAAASS><MNAAASS><MNAAASSData>C2196A580A789EA6</MNAAASSData></MNAAASS><MNAAASS><MNAAASSData>5CFF25DE8850A60D</MNAAASSData></MNAAASS><MNAAASS><MNAAASSData>B18F393DB08697F0</MNAAASSData></MNAAASS><MNAAASS><MNAAASSData>3E5FF4F09D0E5E5C</MNAAASSData></MNAAASS><MNAAASS><MNAAASSData>8825405B1D9E356F</MNAAASSData></MNAAASS><MNAAASS><MNAAASSData>57E1131857199497</MNAAASSData></MNAAASS><MNAAASS><MNAAASSData>4972D05F918BC87F</MNAAASSData></MNAAASS><MNAAASS><MNAAASSData>7AB0C4363DE4794A</MNAAASSData></MNAAASS><MNAAASS><MNAAASSData>FEC13A170D7D25ED</MNAAASSData></MNAAASS><MNAAASS><MNAAASSData>A994A38822C5D8AF</MNAAASSData></MNAAASS><IMSIG>204043311878716</IMSIG><ACC>6</ACC><KI>55DCAD6656106AE0D485BBE02CBE647F</KI><SMSP>+316540942000</SMSP><OPC_G>0B2DA51830CAA67880FC88F942D74728</OPC_G><IMSI_LTE>460110381051695</IMSI_LTE><ACC_LTE>5</ACC_LTE><KI_LTE>850A75F2016012D1F8893E06EA7A851C</KI_LTE><OPC_LTE>EA93D0067007DA3D402C8F5033617A1C</OPC_LTE></PersonalData></SvcCont></ContractRoot></ns1:out></ns1:exchangeResponse></soap:Body></soap:Envelope>";
			//记录接口日志
			dataMap.put("inIntParam", inXML);
			dataMap.put("outIntParam", resultXml);		
			if (ResultConstant.R_POR_SUCCESS.getCode().equals(MapUtils.getString(resMap, "resultCode"))){
				String contractRootXml = "";
				int index = resultXml.indexOf("<ContractRoot>");
				int end = resultXml.indexOf("</ContractRoot>");
				if(end>index && end > 10){
					contractRootXml = resultXml.substring(index, end + "</ContractRoot>".length());
				}
				int authCodeType = 0;

				Map map = parseOutParam(contractRootXml, authCodeType,factoryCode, hmUimid,fourGAndNfcFlag);
				dataMap.setResultCode(ResultConstant.R_POR_SUCCESS.getCode());
	            retnMap.put("code",ResultConstant.R_POR_SUCCESS.getCode());
	            retnMap.put("cardInfo", map);

			}else{
				retnMap = resMap;
				dataMap.setResultCode(MapUtils.getString(resMap, "resultCode"));
				dataMap.setResultMsg(MapUtils.getString(resMap, "resultMsg"));
			}
            dataMap.setOutParam(retnMap);

			//卡管回参
			//String resultXml = "<ContractRoot><TcpCont><ActionCode>1</ActionCode><TransactionID>1000000200201402175627397914</TransactionID><RspTime>20140217153418</RspTime><Response><RspType>0</RspType><RspCode>0000</RspCode><RspDesc>成功</RspDesc></Response></TcpCont><SvcCont><ResultCode>00000000</ResultCode><ResultMessage>成功</ResultMessage><CryptIndex>24</CryptIndex><PersonalData><ICCID>89861113305310000431</ICCID><IMSI>460030905319957</IMSI><UIMID>809C20D8</UIMID><SID>13942</SID><ACCOLC>7</ACCOLC><NID>FFFF</NID><AKEY>8F4888ED1ECFA210</AKEY><PIN1>1234</PIN1><PIN2>60359633</PIN2><PUK1>29793442</PUK1><PUK2>12136941</PUK2><ADM>4D1DED18</ADM><HRPDUPP>460030905319957@mycdma.cn</HRPDUPP><HRPDSS>D3A02BA66493C283</HRPDSS><SIPUPP><SIPUPPData>23200F6374776170406D7963646D612E636E210F63746E6574406D7963646D612E636E20</SIPUPPData></SIPUPP><SIPSS><SIPSSData>766E65742E6D6F6269</SIPSSData></SIPSS><MIPUPP><MIPUPPData>460030905319957@mycdma.cn</MIPUPPData></MIPUPP><MNHASS><MNHASSData>9AE45BFA6CFF66D3</MNHASSData><MNHASSData>39141BE078E1F54E</MNHASSData><MNHASSData>6CFE56B68EFF548C</MNHASSData><MNHASSData>B0E7E5F45903107C</MNHASSData><MNHASSData>70F1383588804ECB</MNHASSData><MNHASSData>E24F9144C83294F1</MNHASSData><MNHASSData>637BCB4BDFDF98FD</MNHASSData><MNHASSData>F9784050B2E4AE6F</MNHASSData><MNHASSData>E5290C46238B6A5E</MNHASSData><MNHASSData>E0AC980982ADAB3D</MNHASSData><MNHASSData>C76E9F7383978202</MNHASSData><MNHASSData>185CD7F8556218C5</MNHASSData><MNHASSData>03BABED10C4D63E8</MNHASSData><MNHASSData>5CCB5314DA5AC436</MNHASSData><MNHASSData>CD0AA59B684DEA0B</MNHASSData></MNHASS><MNAAASS><MNAAASSData>50B9319F7367BEAF</MNAAASSData><MNAAASSData>A5E936E5C4F8B9C5</MNAAASSData><MNAAASSData>628118B8608A2874</MNAAASSData><MNAAASSData>01BD5698566BE7DB</MNAAASSData><MNAAASSData>6E134F8398179F65</MNAAASSData><MNAAASSData>1C4876E13DD2DB4F</MNAAASSData><MNAAASSData>CC2B73C9772A0FC3</MNAAASSData><MNAAASSData>C0D1323B5E9A0169</MNAAASSData><MNAAASSData>CDF4D82F3C909713</MNAAASSData><MNAAASSData>87CAC853861C431D</MNAAASSData><MNAAASSData>E5292B1087BF435E</MNAAASSData><MNAAASSData>23236D52D1D5D6C7</MNAAASSData><MNAAASSData>DF253FF691C9A71E</MNAAASSData><MNAAASSData>AA5457A5570602E3</MNAAASSData><MNAAASSData>75489E76D4DD8E0A</MNAAASSData></MNAAASS><IMSIG>454048505310043</IMSIG><ACC>3</ACC><KI>48AD804884FACCB20195A7AA3AF5D9B6</KI><SMSP>+85294983335</SMSP><OPC_G>8B8DF5206D92133DFDB2DE387B830B6D</OPC_G><IMSI_LTE>460110905319966</IMSI_LTE><ACC_LTE>6</ACC_LTE><KI_LTE>E6E2C029EE94AB85F89A509F7607538C</KI_LTE><OPC_LTE>E65782077DE64BB75CE72537D1EF1906</OPC_LTE></PersonalData></SvcCont></ContractRoot>";
			//String resultXml = "<ContractRoot><TcpCont><ActionCode>1</ActionCode><TransactionID>1000000201201312040733481333</TransactionID><RspTime>20131204100201</RspTime><Response><RspType>0</RspType><RspCode>0000</RspCode><RspDesc>成功</RspDesc></Response></TcpCont><SvcCont><ResultCode>00000000</ResultCode><ResultMessage>成功</ResultMessage><CryptIndex>85</CryptIndex><PersonalData><ICCID>898603139010000006</ICCID><IMSI>460036531190994</IMSI><UIMID>8068A214</UIMID><SID>13824</SID><ACCOLC>4</ACCOLC><NID>FFFF</NID><AKEY>CA649FE5E6A2B82D</AKEY><PIN1>1234</PIN1><PIN2>78698059</PIN2><PUK1>23240322</PUK1><PUK2>47066635</PUK2><ADM>D127DC36</ADM><HRPDUPP/><HRPDSS/><IMSIG/><ACC/><KI/><SMSP/></PersonalData></SvcCont></ContractRoot>";
			//测试回参1
			//String resultXml = "<ContractRoot>	<TcpCont>		<ActionCode>1</ActionCode>		<TransactionID>1000000037201105280000000867</TransactionID>		<RspTime>20111025193236</RspTime>		<Response>			<RspType>0</RspType>			<RspCode>0000</RspCode>			<RspDesc>成功</RspDesc>		</Response>	</TcpCont>	<SvcCont>		<ResultCode>00000000</ResultCode>		<ResultMessage>成功</ResultMessage>		<CryptIndex>7</CryptIndex>		<PersonalData>			<ICCID>89860311805101572698</ICCID>			<IMSI>460036700435919</IMSI>			<UIMID>8097808C</UIMID>			<SID>3760</SID>			<ACCOLC>9</ACCOLC>			<NID>FFFF</NID>			<AKEY>5DFC0BB46FFC45E0</AKEY><!-- 需加密 -->			<PIN1>1234</PIN1>			<PIN2>55900648</PIN2>			<PUK1>85232888</PUK1>			<PUK2>49600368</PUK2>			<ADM>59EF72FB</ADM>			<HRPDUPP>460036700435919@mycdma.cn</HRPDUPP>			<HRPDSS>F529C33B31208BB4</HRPDSS><!-- 需加密 -->			<SIPUPP>				<SIPUPPData>460036700435919@mycdma.cn</SIPUPPData>			</SIPUPP>			<SIPSS>				<SIPSSData>FCD92D9017FF6D2F</SIPSSData><!-- 需加密 -->			</SIPSS>			<SIPSS>				<SIPSSData>9DFE895C322F2148</SIPSSData>			</SIPSS>			<SIPSS>				<SIPSSData>533BD4CCA1202E4A</SIPSSData>			</SIPSS>			<MIPUPP>				<MIPUPPData>460036700435919@mycdma.cn</MIPUPPData>			</MIPUPP>			<MNHASS>				<MNHASSData>758B498221AF1057</MNHASSData><!-- 需加密 -->			</MNHASS>			<MNHASS>				<MNHASSData>6121ECB5E7B27AB4</MNHASSData>			</MNHASS>			<MNHASS>				<MNHASSData>571570269B3B8401</MNHASSData>			</MNHASS>			<MNAAASS>				<MNAAASSData>5B49A51A6F2D1E7E</MNAAASSData>			</MNAAASS>			<MNAAASS>				<MNAAASSData>F1DF7265CCCF3037</MNAAASSData>			</MNAAASS>			<MNAAASS>				<MNAAASSData>F0CFC72C14BB49CE</MNAAASSData>			</MNAAASS>			<IMSIG />			<ACC />			<KI /><!-- 需加密 -->			<SMSP />		</PersonalData>	</SvcCont></ContractRoot>";
			//测试回参2
			//String resultXml = "<ContractRoot><TcpCont><ActionCode>1</ActionCode><TransactionID>1000000201201312110857774573</TransactionID><RspTime>20131211102236</RspTime><Response><RspType>0</RspType><RspCode>0000</RspCode><RspDesc>成功</RspDesc></Response></TcpCont><SvcCont><ResultCode>00000000</ResultCode><ResultMessage>成功</ResultMessage><CryptIndex>57</CryptIndex><PersonalData><ICCID>89860313900100000102</ICCID><IMSI>460036531190990</IMSI><UIMID>8000A876</UIMID><SID>13824</SID><ACCOLC>0</ACCOLC><NID>FFFF</NID><AKEY>40A8D7413A7AA2CE</AKEY><PIN1>1234</PIN1><PIN2>66709721</PIN2><PUK1>78778797</PUK1><PUK2>85087049</PUK2><ADM>B8C32115</ADM><HRPDUPP>460036531190990@mycdma.cn</HRPDUPP><HRPDSS>EEFACBB4557ABF1D</HRPDSS><SIPUPP><SIPUPPData>460036531190990@mycdma.cn</SIPUPPData></SIPUPP><SIPSS><SIPSSData>2FA79016944B60E9</SIPSSData><SIPSSData>92F44EE87F78045E</SIPSSData><SIPSSData>7E7757F7B02EF531</SIPSSData><SIPSSData>B73607C8419F7486</SIPSSData><SIPSSData>1B19DA2365CAA459</SIPSSData><SIPSSData>B4BEF265D234D0EE</SIPSSData><SIPSSData>CEB8E917420DC192</SIPSSData><SIPSSData>65EDB3AECBC8F32E</SIPSSData><SIPSSData>17B7158AF3A79C1D</SIPSSData><SIPSSData>257E1595FB074D49</SIPSSData><SIPSSData>94700BA80D308E7D</SIPSSData><SIPSSData>18A0EF799370274A</SIPSSData><SIPSSData>9C46B837B7BDF660</SIPSSData><SIPSSData>3783A25D0EE930C1</SIPSSData><SIPSSData>31DCAB4E37EEE85A</SIPSSData></SIPSS><MIPUPP><MIPUPPData>460036531190990@mycdma.cn</MIPUPPData></MIPUPP><MNHASS><MNHASSData>34BAA130A211E06A</MNHASSData><MNHASSData>1EF061ED219FD024</MNHASSData><MNHASSData>67DB095D5C3D9644</MNHASSData><MNHASSData>B5BAED9E5F45E6E5</MNHASSData><MNHASSData>88204377754C7B5F</MNHASSData><MNHASSData>8AF78B1F16F11799</MNHASSData><MNHASSData>EDAB3BD2E3A6B63C</MNHASSData><MNHASSData>DA3EE0769D3C1A13</MNHASSData><MNHASSData>8691F172EB21A422</MNHASSData><MNHASSData>796E67D28F77D9EE</MNHASSData><MNHASSData>99B89215B57CDD7D</MNHASSData><MNHASSData>F9DFE14A2C5FEF37</MNHASSData><MNHASSData>A747C86FDBA49A89</MNHASSData><MNHASSData>EFFD9BE2CF1794B5</MNHASSData><MNHASSData>47A2A0C4B3A803E0</MNHASSData></MNHASS><MNAAASS><MNAAASSData>7613A505BE3C5A80</MNAAASSData><MNAAASSData>6BFB85BC7DEF5D7A</MNAAASSData><MNAAASSData>96F30719C1D883EC</MNAAASSData><MNAAASSData>7E2886E2E2260B9F</MNAAASSData><MNAAASSData>F3407D8A5C71149C</MNAAASSData><MNAAASSData>6CDB6A3EF8C500C3</MNAAASSData><MNAAASSData>1CE1C0D643171ADC</MNAAASSData><MNAAASSData>3BBE3D997D065135</MNAAASSData><MNAAASSData>FCCBAFAB3C9A9335</MNAAASSData><MNAAASSData>A97F01AEA8CC0072</MNAAASSData><MNAAASSData>F39E07873FC1B8CB</MNAAASSData><MNAAASSData>AEC6660B6F9B498B</MNAAASSData><MNAAASSData>1000FC4492223BCD</MNAAASSData><MNAAASSData>B7D6A8B15D3FD334</MNAAASSData><MNAAASSData>36470142F918574E</MNAAASSData></MNAAASS><IMSIG/><ACC/><KI/><SMSP/><IMSI_LTE>460036531190997</IMSI_LTE><ACC_LTE>7</ACC_LTE><KI_LTE>08A82CAB6E0E9B0DA0D3AB3DFB8A19E9</KI_LTE><OPC_LTE>0060B239869EB1048C13482CFF4E1B78</OPC_LTE></PersonalData></SvcCont></ContractRoot>";
			//测试回参(3G生产)
			//String resultXml = "<ContractRoot><TcpCont><ActionCode>1</ActionCode><TransactionID>1000000037201311231637723916</TransactionID><RspTime>20131123163926</RspTime><Response><RspType>0</RspType><RspCode>0000</RspCode><RspDesc>成功</RspDesc></Response></TcpCont><SvcCont><ResultCode>00000000</ResultCode><ResultMessage>成功</ResultMessage><CryptIndex>89</CryptIndex><PersonalData><ICCID>89860313007580411850</ICCID><IMSI>460030252801743</IMSI><UIMID>805BA245</UIMID><SID>3619</SID><ACCOLC>3</ACCOLC><NID>FFFF</NID><AKEY>1C6C6F4D3B775A46</AKEY><PIN1>1234</PIN1><PIN2>51154902</PIN2><PUK1>74059570</PUK1><PUK2>96831988</PUK2><ADM>90892996</ADM><HRPDUPP>460030252801743@mycdma.cn</HRPDUPP><HRPDSS>232CD0CF31B0CF9D</HRPDSS><SIPUPP><SIPUPPData>460030252801743@mycdma.cn</SIPUPPData></SIPUPP><SIPSS><SIPSSData>652D961FFA0F0E41</SIPSSData></SIPSS><SIPSS><SIPSSData>3209E33DA42DB06D</SIPSSData></SIPSS><SIPSS><SIPSSData>BD2786223EFA10F0</SIPSSData></SIPSS><SIPSS><SIPSSData>3B903BD029273BFF</SIPSSData></SIPSS><SIPSS><SIPSSData>5BD4CDFCCBCC0872</SIPSSData></SIPSS><MIPUPP><MIPUPPData>460030252801743@mycdma.cn</MIPUPPData></MIPUPP><MNHASS><MNHASSData>A7BB2FB9D25663D9</MNHASSData></MNHASS><MNHASS><MNHASSData>797FA8409E879A79</MNHASSData></MNHASS><MNHASS><MNHASSData>F6AC033F6FA4BEF7</MNHASSData></MNHASS><MNHASS><MNHASSData>880D890D2FD2D77E</MNHASSData></MNHASS><MNHASS><MNHASSData>AD20E8CD980CD381</MNHASSData></MNHASS><MNAAASS><MNAAASSData>3C91358F19CCDE2E</MNAAASSData></MNAAASS><MNAAASS><MNAAASSData>14E0C1B4DCB26C9F</MNAAASSData></MNAAASS><MNAAASS><MNAAASSData>CA4210CBB8652F5F</MNAAASSData></MNAAASS><MNAAASS><MNAAASSData>8C4015A61A7EF937</MNAAASSData></MNAAASS><MNAAASS><MNAAASSData>25707940CDEE7E2D</MNAAASSData></MNAAASS><IMSIG>204043153514753</IMSIG><ACC>3</ACC><KI>977199F18CA920BE1FAE29D689B50CE6</KI><SMSP>+316540942000</SMSP></PersonalData></SvcCont></ContractRoot>";


		}catch (Exception e) {
			DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_INTERFACE_EXCEPTION,ExceptionUtils.getFullStackTrace(e));
		}
		//log.debug("----dataMap:{}----",JacksonUtil.getInstance().ObjectTojson(dataMap));
		return dataMap;
	}

	
	public String changeCharsCase(String value, int type) {
		//1:字符转成大写，2：字符转成小写，3：默认
		switch (type){
			case 1:
				return value.toUpperCase();
			case 2:
				return value.toLowerCase();
			case 3:
				return value;
		};
		return value;
	}
	
	public String getPasswordKey(String factoryCode, String keyType, String keyData) {
		//密码
		//log.debug("数据库查找密钥匙入参：factoryCode={},keyType={},keyData={}", new Object[] { factoryCode, keyType, keyData });
		String passwordKey = null;
		//调用数据库查找密钥匙
		
		String key = "";
		try {
			key = soWriteCardDAO.getPasswordKey(factoryCode, keyType);
		} catch (Exception e1) {
			//log.error("",e1);
			return null;
		}
		//log.debug("数据库查找密钥匙:{}", key);
		//组件鉴权密钥解密密钥
		if (keyType != null && keyType.equals(WriteCardUtil.DLL_KEY_DECRIPT_KEY)) {
			//动态链接库写卡密钥需要传入暗文，之后用约定的密钥解密后生成
			//密钥暗文
			if (keyData != null && !keyData.equals("")) {
				//解密获取密钥明文
				try {
					passwordKey = WriteCardUtil.desECB(keyData, key, 1);
				} catch (Exception e) {
					e.printStackTrace();
				}
			} else {
				return null;
			}
		} else {
			//其他密钥直接把数据库中查找的返回即可
			passwordKey = key;
		}
		return passwordKey;
	}
	
	/**
	 * 将资源返回的xml转换成写卡时候需要使用的数据
	 * @param rscXml
	 * @return
	 */
	private Map createWriteCardData(String rscXml, String key, Map rscParam) {
		Map result = new HashMap();
		try {
			Document dom = DocumentHelper.parseText(rscXml);
			String iccid = dom.selectSingleNode("ContractRoot/SvcCont/PersonalData/ICCID").getText();
			String imsi = dom.selectSingleNode("ContractRoot/SvcCont/PersonalData/IMSI").getText();
			String imsig = dom.selectSingleNode("ContractRoot/SvcCont/PersonalData/IMSIG").getText();
			String writeCardData = WriteCardUtil.generateWriteCardString(rscXml, rscParam, "0");
			//log.debug("写卡参数：{}", writeCardData);
			//log.debug("加密密钥：{}", key);
			int length = writeCardData.length();
			//对数据进行加密
            //对数据进行加密,不执行 ,修改成用明文数据写卡
//			writeCardData = WriteCardUtil.encodeDataByDES(writeCardData, key);
			result.put("iccid", iccid);
			result.put("imsi", imsi);
			result.put("imsig", imsig);
			result.put("dataLength", length);
			result.put("data", writeCardData);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return result;
	}
	
	/**
	 * 
	 * @param xml 接口返回xml
	 * @param charsType authCodeType
	 * @param factoryCode  厂商编码
	 * @param hmPesn 黑莓uimid
	 * @return
	 */
	public Map parseOutParam(String xml,int charsType,String factoryCode,String hmPesn,boolean fourGAndNfcFlag){
		//{"cardType":cardType,"serialNum":serialNum,"deviceId":deviceId,"scene":scene,"areaId":areaId,"staffAreaId":staffAreaId,"factoryCode":factoryCode}
		Map resourceDataJson = new HashMap();
		try{
			Document dom = DocumentHelper.parseText(xml);
			String flag = dom.selectSingleNode("ContractRoot/SvcCont/ResultCode")==null?"1":dom.selectSingleNode("ContractRoot/SvcCont/ResultCode").getText();
			String resultMsg = dom.selectSingleNode("ContractRoot/SvcCont/ResultMessage")==null?dom.selectSingleNode("ContractRoot/TcpCont/RspDesc").getText():dom.selectSingleNode("ContractRoot/SvcCont/ResultMessage").getText();
			
			// 响应是否成功
			if (flag == null || !"00000000".equals(flag)){
				resourceDataJson.put("flag", "1");
				resourceDataJson.put("msg", resultMsg);
				return resourceDataJson;
			}
			String imsiLte ="";
			if (!(dom.selectSingleNode("ContractRoot/SvcCont/PersonalData/IMSI_LTE")==null)){
				imsiLte = dom.selectSingleNode("ContractRoot/SvcCont/PersonalData/IMSI_LTE").getText();
			}

			/*---- 解密加密字段 ----*/
			// 1. 获取解密密钥
			String rscKey = getRscKey(dom.selectSingleNode("ContractRoot/SvcCont/CryptIndex").getText());
			String key = getDllKey(factoryCode);
		
			
			// 2. 获取报文中需要解密的数据
			// 3. 解密得到写卡数据的明文
			// 4. 在对明文通过卡商的组件鉴权密钥进行一次3DES加密
			//Akey
			Node aKeyNode = dom.selectSingleNode("ContractRoot/SvcCont/PersonalData/AKEY");
			String akey = WriteCardUtil.desECB(WriteCardUtil.desECB(aKeyNode.getText(), rscKey, 1).toUpperCase(),key, 0);
			aKeyNode.setText(changeCharsCase(akey,charsType));
			//KI
			Node kiNode = dom.selectSingleNode("ContractRoot/SvcCont/PersonalData/KI");
			//判断双模数据时需要进行解密、加密
			if(null != kiNode && !"".equals(kiNode.getText())){
				String ki = WriteCardUtil.desECB(WriteCardUtil.desECB(kiNode.getText(), rscKey, 1).toUpperCase(),key, 0);
				kiNode.setText(changeCharsCase(ki,charsType));
			}
			//HRPDSS
			Node hrpDssNode = dom.selectSingleNode("ContractRoot/SvcCont/PersonalData/HRPDSS");
			if(null != hrpDssNode && !"".equals(hrpDssNode.getText())){
				String hrpdss = WriteCardUtil.desECB(WriteCardUtil.desECB(hrpDssNode.getText(), rscKey, 1).toUpperCase(),key, 0);
				hrpDssNode.setText(this.changeCharsCase(hrpdss,charsType));
			}
			//SIPSS 4G和3G NFC卡写入固定值，其他的普通3G卡按照通用方式写入值
			List<Node> sipss = dom.selectNodes("ContractRoot/SvcCont/PersonalData/SIPSS");
			for(Node d : sipss){
				String sipssList = "";
				if (fourGAndNfcFlag){
					//3G NFC 和 4G卡写入固定值
					String sipssData= LteConstants.CON_SIP_SS_DATA;
					sipssList =WriteCardUtil.desECB(sipssData.toUpperCase(),key,0);
				}else{
					sipssList =WriteCardUtil.desECB(WriteCardUtil.desECB(d.selectSingleNode("SIPSSData").getText(), rscKey, 1).toUpperCase(),key,0);					
				}
				d.selectSingleNode("SIPSSData").setText(this.changeCharsCase(sipssList,charsType));
			}
			//MNHASS
			List<Node> mnHaSs = dom.selectNodes("ContractRoot/SvcCont/PersonalData/MNHASS");
			for(Node d : mnHaSs){
				String mnhassList =WriteCardUtil.desECB(WriteCardUtil.desECB(d.selectSingleNode("MNHASSData").getText(), rscKey, 1).toUpperCase(),key,0);
				d.selectSingleNode("MNHASSData").setText(this.changeCharsCase(mnhassList,charsType));
			}
			//MNAAASS
			List<Node> mnAaaSs = dom.selectNodes("ContractRoot/SvcCont/PersonalData/MNAAASS");
			for(Node d : mnAaaSs){
				String mnaaassList =WriteCardUtil.desECB(WriteCardUtil.desECB(d.selectSingleNode("MNAAASSData").getText(), rscKey, 1).toUpperCase(),key,0);
				d.selectSingleNode("MNAAASSData").setText(this.changeCharsCase(mnaaassList,charsType));
			}
			//OPC_G
			Node opcGNode = dom.selectSingleNode("ContractRoot/SvcCont/PersonalData/OPC_G");
			if(null != opcGNode && !"".equals(opcGNode.getText())){
				String opcG = WriteCardUtil.desECB(WriteCardUtil.desECB(opcGNode.getText(), rscKey, 1).toUpperCase(),key, 0);
				opcGNode.setText(this.changeCharsCase(opcG,charsType));
			}
			//OPC_LTE
			Node opcLteNode = dom.selectSingleNode("ContractRoot/SvcCont/PersonalData/OPC_LTE");
			if(null != opcLteNode && !"".equals(opcLteNode.getText())){
				String opcLte = WriteCardUtil.desECB(WriteCardUtil.desECB(opcLteNode.getText(), rscKey, 1).toUpperCase(),key, 0);
				opcLteNode.setText(this.changeCharsCase(opcLte,charsType));
			}
			//KI_LTE
			Node kiLteNode = dom.selectSingleNode("ContractRoot/SvcCont/PersonalData/KI_LTE");
			if(null != kiLteNode && !"".equals(kiLteNode.getText())){
				String kiLte = WriteCardUtil.desECB(WriteCardUtil.desECB(kiLteNode.getText(), rscKey, 1).toUpperCase(),key, 0);
				kiLteNode.setText(this.changeCharsCase(kiLte,charsType));
			}
			
			//System.out.println("解密后通过卡商组件鉴权密码加密akey的报文：" + dom.asXML());
			
			//生成写卡数据
			String writeDataEncriptKey = getPasswordKey(factoryCode, WriteCardUtil.WRITE_DATA_ENCRIPT_KEY, "");
			Map info = new HashMap();
			info.put("uimid", hmPesn);
			Map writeCardData = createWriteCardData(dom.asXML(), writeDataEncriptKey, info);
			  // 校验返回类型：受理写卡校验
            String checkType = "PersonalData";
			
            String uimid = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/UIMID").getText();
            String sid = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/SID").getText();
            String accolc = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/ACCOLC").getText();
            String nid = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/NID").getText();
            String pin1 = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/PIN1").getText();
            String pin2 = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/PIN2").getText();
            String puk1 = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/PUK1").getText();
            String puk2 = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/PUK2").getText();
            String adm = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/ADM").getText();
          //  String imsilte = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/IMSI_LTE").getText();
            
            resourceDataJson.put("flag", "0");
			resourceDataJson.put("iccid", (String)writeCardData.get("iccid"));
			resourceDataJson.put("imsi", (String)writeCardData.get("imsi"));
			resourceDataJson.put("imsig", (String)writeCardData.get("imsig"));
			resourceDataJson.put("imsilte",  imsiLte);
			resourceDataJson.put("uimid",  uimid);
			resourceDataJson.put("sid",  sid);
			resourceDataJson.put("accolc", accolc);
			resourceDataJson.put("nid", nid);
			resourceDataJson.put("pin1", pin1);
			resourceDataJson.put("pin2", pin2);
			resourceDataJson.put("puk1", puk1);
			resourceDataJson.put("puk2", puk2);
			resourceDataJson.put("adm", adm);
			resourceDataJson.put("akey", akey);
			
			resourceDataJson.put("dataLength", writeCardData.get("dataLength"));
			resourceDataJson.put("data", (String)writeCardData.get("data"));
			log.debug(resourceDataJson.toString());
			return resourceDataJson;
			
		} catch (Exception e) {
			log.error("",e);
			resourceDataJson.put("flag", "1");
			resourceDataJson.put("msg", e.getMessage());
			return resourceDataJson;
		}
	}


	public String getRscKey(String CryptIndex){
		// 密钥索引
		//log.debug("数据库查找密钥匙入参：CryptIndex={}", new Object[] { CryptIndex});
		
		//调用数据库查找密钥匙
		String key = "";
		try {
			key = soWriteCardDAO.getRscKey(CryptIndex);
		} catch (Exception e) {
			//log.error("",e);
			return null;
		}
		
		//log.debug("数据库查找密钥匙:{}", key);
		return key;
	}
	//获取卡商动态链接库鉴权密钥
	public String getDllKey(String factoryCode){

		//调用数据库查找密钥匙

		String key = "";
		try {
			key = soWriteCardDAO.getDllKey(factoryCode);
		} catch (Exception e) {
			//log.error("",e);
			return null;
		}
		
		//log.debug("数据库查找密钥匙:{}", key);
		return key;
	}
	private static String addCsbInfo(Map<String, Object> csbMap,
			String paramString) throws IOException {
		String srcSysID = LteConstants.CSB_SRC_SYS_ID_LTE;
		CsbDataMap cdm = new CsbDataMap();
		cdm.setBusCode(MapUtils.getString(csbMap, "BusCode"));
		cdm.setServiceCode(MapUtils.getString(csbMap, "ServiceCode"));
		cdm.setServiceContractVer(MapUtils.getString(csbMap, "ServiceContractVer"));
		cdm.setDstSysID(MapUtils.getString(csbMap, "DstSysID"));
		cdm.setActionCode(LteConstants.CSB_ACTION_CODE);
		cdm.setServiceLevel(LteConstants.CSB_SERVICE_LEVEL);
		cdm.setSrcSysSign(LteConstants.CSB_SRC_SYS_SIGN);
		cdm.setDstOrgID(LteConstants.CSB_ORG_ID_GROUP);
		cdm.setSrcOrgID(LteConstants.CSB_ORG_ID_GROUP);
		cdm.setSrcSysID(srcSysID);
		cdm.setSvcCont(paramString);
		return cdm.getXml();
	}

}
