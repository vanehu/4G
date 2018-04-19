<?xml version="1.0" encoding="UTF-8"?>
<result>
    <#if TcpCont.Response.RspType == "0">
        <#if SvcCont.AcctItemQueryRsp?exists>
        <#if SvcCont.AcctItemQueryRsp.Service_Result_Code=='0'>           
            <code>POR-0000</code>
            <message>成功，请求流水号为[${TcpCont.TransactionID}]</message>
            <MID>${TcpCont.Response.RspDesc}</MID>
        <#else>
            <code>POR-2004</code>
            <message>错误编码[${SvcCont.AcctItemQueryRsp.Service_Result_Code}]，错误描述[${SvcCont.AcctItemQueryRsp.Para_Field_Result}],请求流水号为[${TcpCont.TransactionID}]</message>
            <MID>${TcpCont.Response.RspDesc}</MID>      
        </#if>      
        </#if>  
    <#else>
        <code>POR-2004</code>
        <message>错误编码[${TcpCont.Response.RspCode}]，错误描述[${TcpCont.Response.RspDesc}],请求流水号为[${TcpCont.TransactionID}]</message>     
    </#if>
    
    <#if SvcCont?exists>
    <#if SvcCont.AcctItemQueryRsp.Bill_Query_Information?exists>
    <result>
        <acctId>${SvcCont.AcctItemQueryRsp.Bill_Query_Information.Acct_ID}</acctId>
        <acctName>${SvcCont.AcctItemQueryRsp.Bill_Query_Information.Acct_Name}</acctName>
        <#list SvcCont.AcctItemQueryRsp.Bill_Query_Information.Fee_Billing_Cycle as item>
        <feeBillingCycle type = 'list'>
            <billingCycleId>${item.Billing_Cycle_ID}</billingCycleId>
            <accNbr>${item.Acc_Nbr}</accNbr>
            <servId>${item.Serv_Id}</servId>
            <#list item.Acct_Item_Group as item2>
            <acctItemGroup type = 'list'>
                <#list item2.Acct_Item_Type as item3>
                    <acctItemType  type = 'list'>
                        <acctItemTypeName>${item3.Acct_Item_Type_Name}</acctItemTypeName>
                        <acctItemTypeId>${item3.Acct_Item_Type_Id}</acctItemTypeId>
                        <itemSourceId>${item3.Item_Source_Id}</itemSourceId>
                        <acctItemCharge>${item3.Acct_Item_Charge}</acctItemCharge>
                        <paymentState>${item3.Payment_State}</paymentState>
                     </acctItemType>
                </#list>
            </acctItemGroup>
            </#list>
        </feeBillingCycle>
        </#list>    
    </result>   
    </#if>
    </#if>  
</result>


