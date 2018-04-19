<?xml version="1.0" encoding="UTF-8"?>
<result>
<#if TcpCont.Response.RspType=="0">
    <#if SvcCont?exists>
        <#if SvcCont.resultCode=="0">
            <resultCode>0</resultCode>
            <resultMsg>${SvcCont.resultMsg}，请求流水号为[${TcpCont.TransactionID}]</resultMsg>
        <#else>
            <resultCode>1</resultCode>
            <resultMsg>${SvcCont.resultMsg}，请求流水号为[${TcpCont.TransactionID}]，异常编码为[SvcCont.errCode]</resultMsg>
        </#if>
    <#else>
        <resultCode>1</resultCode>
        <resultMsg>回参缺少业务体，请求流水号为[${TcpCont.TransactionID}]</resultMsg>
    </#if>
<#else>
    <resultCode>1</resultCode>
    <resultMsg>[${TcpCont.Response.RspCode}]${TcpCont.Response.RspDesc}，请求流水号为[${TcpCont.TransactionID}]</resultMsg>
</#if>

<#if SvcCont?exists>
    <#if SvcCont.result?exists>
        <#if SvcCont.result.prodInfos?exists>
            <result>
                <prodInfos>
                    <prodInstId>${SvcCont.result.prodInfos.prodInstId}</prodInstId>
                    <phoneNum>${SvcCont.result.prodInfos.phoneNum}</phoneNum>
                    <productId>${SvcCont.result.prodInfos.productId}</productId>
                    <productName>${SvcCont.result.prodInfos.productName}</productName>
                    <productNbr>${SvcCont.result.prodInfos.productNbr}</productNbr>
                    <startDt>${SvcCont.result.prodInfos.startDt}</startDt>
                    <prodStatusCd>${SvcCont.result.prodInfos.prodStatusCd}</prodStatusCd>
                    <prodStatusName>${SvcCont.result.prodInfos.prodStatusName}</prodStatusName>
                    <commonRegionId>${SvcCont.result.prodInfos.commonRegionId}</commonRegionId>
                    <commonRegionName>${SvcCont.result.prodInfos.commonRegionName}</commonRegionName>
                    <custNumber>${SvcCont.result.prodInfos.custNumber}</custNumber>
                    <custName>${SvcCont.result.prodInfos.custName}</custName>
                    <paymentModeCd>${SvcCont.result.prodInfos.paymentModeCd}</paymentModeCd>
                    <#list SvcCont.result.prodInfos.acctInfos as item>
                        <acctInfos type='list'>
                            <acctNumber>${item.acctNumber}</acctNumber>
                            <acctId>${item.acctId}</acctId>
                            <acctName>${item.acctName}</acctName>
                            <payMethod>${item.payMethod}</payMethod>
                            <payMethodName>${item.payMethodName}</payMethodName>
                        </acctInfos>
                    </#list>
                    <#list SvcCont.result.prodInfos.mktResouceInfos as item>
                        <mktResouceInfos>
                            <mktResourceCode>${item.mktResourceCode}</mktResourceCode>
                            <mktResourceId>${item.mktResourceId}</mktResourceId>
                            <mktResourceName>${item.mktResourceName}</mktResourceName>
                            <mktResourceTypeCd>${item.mktResourceTypeCd}</mktResourceTypeCd>
                            <mktResourceTypeName>${item.mktResourceTypeName}</mktResourceTypeName>
                            <inOutNbr>${item.inOutNbr}</inOutNbr>
                        </mktResouceInfos>
                    </#list>
                    <#list SvcCont.result.prodInfos.attrInfos as item>
                        <attrInfos>
                            <attrSpecId>${item.attrSpecId}</attrSpecId>
                            <attrValue>${item.attrValue}</attrValue>
                            <attrName>${item.attrName}</attrName>
                            <attrValueId>${item.attrValueId}</attrValueId>
                        </attrInfos>
                    </#list>
                    <#list SvcCont.result.prodInfos.prodOfferInfos as item>
                        <prodOfferInfos>
                            <offerType>${item.offerType}</offerType>
                            <prodOfferId>${item.prodOfferId}</prodOfferId>
                            <prodOfferName>${item.prodOfferName}</prodOfferName>
                            <prodOfferInstId>${item.prodOfferInstId}</prodOfferInstId>
                            <prodOfferNbr>${item.prodOfferNbr}</prodOfferNbr>
                            <startDt>${item.startDt}</startDt>
                            <endDt>${item.endDt}</endDt>
                            <statusCd>${item.statusCd}</statusCd>
                            <statusName>${item.statusName}</statusName>
                        </prodOfferInfos>
                    </#list>
                    <#list SvcCont.result.prodInfos.funProdInfos as item>
                        <funProdInfos>
                            <prodInstId>${item.prodInstId}</prodInstId>
                            <productId>${item.productId}</productId>
                            <productName>${item.productName}</productName>
                            <productNbr>${item.productNbr}</productNbr>
                        </funProdInfos>
                    </#list>
                    <#list SvcCont.result.prodInfos.prodInstStates as item>
                        <prodInstStates>
                            <stopType>${item.stopType}</stopType>
                            <stopTypeName>${item.stopTypeName}</stopTypeName>
                            <statusCd>${item.statusCd}</statusCd>
                            <statusName>${item.statusName}</statusName>
                            <startDt>${item.startDt}</startDt>
                        </prodInstStates>
                    </#list>
                </prodInfos>
            </result>
        </#if>
    </#if>
</#if>
</result>
