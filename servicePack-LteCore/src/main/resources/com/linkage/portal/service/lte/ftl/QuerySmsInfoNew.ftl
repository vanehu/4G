<?xml version="1.0" encoding="UTF-8"?>
<ContractRoot>
	<TcpCont>
		<TransactionID>${TcpCont.TransactionID}</TransactionID>
		<ActionCode>${TcpCont.ActionCode}</ActionCode>
		<BusCode>BUS61004</BusCode>
		<ServiceCode>SVC83040</ServiceCode>
		<ServiceContractVer>SVC8304020150202</ServiceContractVer>
		<ServiceLevel>${TcpCont.ServiceLevel}</ServiceLevel>
		<SrcOrgID>${TcpCont.SrcOrgID}</SrcOrgID>
		<SrcSysID>${TcpCont.SrcSysID}</SrcSysID>
		<SrcSysSign>123</SrcSysSign>
		<DstOrgID>100000</DstOrgID>
		<DstSysID>1000000203</DstSysID>
		<ReqTime>${TcpCont.ReqTime}</ReqTime>
	</TcpCont>
	<SvcCont>
		
                     <Service_Information>
			<Destination_Id>${destinationId}</Destination_Id>
			<ServType>${servType}</ServType>
			<Query_Flag>${queryFlag}</Query_Flag>
			<Query_Event_Type>${eventType}</Query_Event_Type>
			<Begin_Date>${beginDate}</Begin_Date>
			<End_Date>${endDate}</End_Date>
			<Pages>${curPage}</Pages>
			<Count>${pageSize}</Count>
                     </Service_Information>
       
                                  <SCCODE>${sccode}</SCCODE>
         
                   <INFO>
                         <Access_Information>
                              <Access_Platform>${platform}</Access_Platform>
                              <Access_Mode>${accessMode}</Access_Mode>
                              <Access_Channel>${accessChannel}</Access_Channel>
                              <Access_Ip>${accessIp}</Access_Ip>
                              <Device_Type>${deviceType}</Device_Type>
                              <Staff_Id>${staffID}</Staff_Id>
                              <Branch_Code>${branchCode}</Branch_Code>
                         </Access_Information>

                        <Service_Abstract_Information>
                          <Destination_Attr>${destinationAttr}</Destination_Attr>
                          <Destination_Id>${destinationId}</Destination_Id>
                          <Province_Id>${provinceId}</Province_Id>
                          <Mvno_Id>${mvnoId}</Mvno_Id>
                          <Billing_Cycle>${billingCycle}</Billing_Cycle>
                          <Service_Serial>${serviceSerial}</Service_Serial>
                        </Service_Abstract_Information>


                        <Control_Information>
                       <Test_Flag>${testFlag}</Test_Flag>
                       <Sign></Sign>
                       <Encryption></Encryption>
                       </Control_Information>
                  
                   </INFO>


	
	</SvcCont>
</ContractRoot>
