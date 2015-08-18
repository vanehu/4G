/**
 * 终端领用与退回
 * 
 * @author wd
 */
CommonUtils.regNamespace("mktRes", "terminal", "receive");

mktRes.terminal.receive = (function($){
	var _init =function(){
		
	};
	var _changeStore=function(){
		$("#termCode").val("");
		$("#terminalTable").empty();
	};
	/**
	 * 按钮添加
	 */
	var _btnAddTerminal=function(curPage){
		var storeId=$("#storeSel").val();
		var termCode=$("#termCode").val();
		if(storeSel==undefined || $.trim(storeSel)=="" || $.trim(storeSel)=="null" || $.trim(storeSel)== null){//ec.util.isObj()
			$.alert("提示","仓库不能为空");
			return;	
		}
		if(termCode==undefined || $.trim(termCode)=="" || $.trim(termCode)=="null" || $.trim(termCode)== null){//ec.util.isObj()
			$.alert("提示","终端串码不能为空");
			return;	
		}
		//请求地址
		var url = contextPath+"/mktRes/terminal/addTerminal";
		var flag = $("#flag").val();
		var param = {"flag":flag,"termCode":termCode,"storeId":storeId};
		$.callServiceAsJson(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在处理中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if (response.code == 0) {
					if(response.data.terminalCode == "null" || response.data.terminalCode == null){
						$.alert("提示","无对应的终端数据！");
						return;
					}
					$("#terminalTable").append(_appendTrTd(response.data));
						
				}else if (response.code == -2) {
					$.alertM(response.data);
				}else{
					if(response.data!=undefined){
						$.alert("提示",response.data.msg);
					}else{
						$.alert("提示","添加失败,稍后重试!");
					}
				}
			}
		});	
	};
	
	var  _checkAll = function(target){
		var checkState = $(target).attr("checked");
		if(checkState == "checked") {
			$("input[name='terminalCode']:checkbox").attr("checked",true);
		}else {
			$("input[name='terminalCode']:checkbox").attr("checked",false);
		}
	};
	
	var _appendTrTd = function(item){
		var html = "<tr id =" + item.terminalCode + ">";
		html += '<td>';
		html += '<input type="checkbox" checked="checked" name= "terminalCode"  value= ';
		html += item.terminalCode  + '>';
		
		html += '</td>';
		html += '<td style="width: 200px">'+item.typeCode+'</td>';
		html += '<td>'+ item.terminalType +'</td>';
		html += '<td>'+ item.supplier +'</td>'; 
		html += '<td>'+ item.terminalCode +'</td>';
		if(item.mktResStoreName != "undefined" && item.mktResStoreName != "null"){
			html += '<td>' + item.mktResStoreName +'</td>';  // ??归属仓库
		}
		else{
			html += '<td></td>';
		}
		html += '<td>'+ item.state +'</td>';
		html += '<td>'+ item.batch +'</td>';
		html += '</tr>';
		return html;
	};
	/**
	 * 按钮删除
	 */
	var _btnDelTerminal=function(curPage){
		var flag = false;
		$("input[name='terminalCode']:checked").each(function(){
			var terminalCode=this.value;
			 $("#"+terminalCode).remove();
			 flag= true;
		});
		if(!flag){
			$.alert("提示","先选择终端记录！");
		}
	};
     /**
	 * 确认领用
	 */
	var _btnTerminalUse=function(curPage){
		//请求地址
		var url = contextPath+"/mktRes/terminal/termianlUse";
		//收集参数
		var storeId = $("#storeSel").val();
		var flag = $("#flag").val();
		var termCodeList = [];
		var isTerminalSel = false;
		$("input[name='terminalCode']:checked").each(function(){
			var terminalCode=this.value;
			termCodeList.push({"termCode":terminalCode});
			isTerminalSel = true;
		});
		
		if(!isTerminalSel){
			$.alert("提示","先选择终端记录！");
			return;
		}
		
		var param = {"flag":flag,"storeId":storeId,"termCodeList":termCodeList};
		$.callServiceAsJsonGet(url,{strParam:JSON.stringify(param)},{
			"before":function(){
				$.ecOverlay("<strong>正在处理中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if (response.code == 0) {
					 $.alert("提示","恭喜： 操作成功!");
					 $("input[name='terminalCode']:checked").each(function(){
							var terminalCode=this.value;
							 $("#"+terminalCode).remove();
					 });
					 $("#termCode").val("");
				}else if (response.code==-2){
					$.alertM(response.data);
				}else{
					if(response.data!=undefined){
						$.alert("提示",response.data.msg);
					}else{
						$.alert("提示","领用失败,稍后重试!");
					}
				}
			}
		});	
	};
	
	return {
		init:_init,
		btnAddTerminal:_btnAddTerminal,
		btnDelTerminal:_btnDelTerminal,
		btnTerminalUse:_btnTerminalUse,
		checkAll : _checkAll,
		changeStore : _changeStore
	};
})(jQuery);

//初始化
$(function(){
	
});