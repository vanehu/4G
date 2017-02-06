/**
 * 终端领用与退回
 * 
 * @author wd
 */
CommonUtils.regNamespace("mktRes", "terminal", "receive");

mktRes.terminal.receive = (function(){
	
	//仓库查询
	var _queryStore = function(){
		var storeNameQryInp = $.trim($("#storeNameQryInp").val());
		if(storeNameQryInp==""){
			return;
		}
		_queryStoreReset();
		var resultCount = 0;
		$("#storeSel option").each(function(){
			if($(this).text().indexOf(storeNameQryInp)>=0){
				$(this).attr("style", "color:blue;");
				$("#storeSel option").removeAttr("selected");
				$(this).attr("selected", "selected");
				resultCount ++;
			}
		});
		if(resultCount>1){
			$.alert("提示", "搜索结果多于一条，请在左侧下拉框中继续手动筛选");
		}
	};
	
	//仓库查询重置
	var _queryStoreReset = function(){
		$("#storeSel option").removeAttr("style");
	};
	
	var lastKeyDownTimeStamp = null;//上一次按下按键时间戳
	var lastKeyUpTimeStamp = null;//上一次放开按键时间戳
	var disableTerminalInput;//将串码输入框置灰的延时事件
	//切换仓库时重置串码输入框，终端信息列表，以及串码录入方式
	var _changeStore = function(){
		$("#termCode").val("");
		$("#terminalTable").empty();
		$("#termCode").removeAttr("disabled");
		lastKeyUpTimeStamp = null;
		lastKeyDownTimeStamp = null;
		//只允许扫码录入的特殊处理
		if($("#storeSel").find("option:selected").attr("receive")=="2"){
			//按下按键事件
			$("#termCode").off("keydown").on("keydown", function(){
				lastKeyDownTimeStamp = new Date().getTime();
				if(lastKeyUpTimeStamp==null){
					return;
				}
				clearTimeout(disableTerminalInput);
				if(lastKeyDownTimeStamp-lastKeyUpTimeStamp>20){
					$("#termCode").val("");
					lastKeyUpTimeStamp = null;
					lastKeyDownTimeStamp = null;
					$.alert("提示", "请使用扫码录入！");
					return;
				}
			});
			//放开按键事件
			$("#termCode").off("keyup").on("keyup", function(){
				lastKeyUpTimeStamp = new Date().getTime();
				if(lastKeyUpTimeStamp-lastKeyDownTimeStamp>20){
					$("#termCode").val("");
					lastKeyUpTimeStamp = null;
					lastKeyDownTimeStamp = null;
					$.alert("提示", "请使用扫码录入！");
					return;
				}
				//23ms内无新输入认为扫码枪扫码输出完毕，将输入框置灰
				disableTerminalInput = setTimeout(function(){
					$("#termCode").attr("disabled", "disabled");
				}, 23);
			});
			//屏蔽复制/剪切/粘贴事件
			$("#termCode").off("cut copy paste").on("cut copy paste", function(e){  
		        e.preventDefault();
		    });
		}else{
			$("#termCode").off("keydown");
			$("#termCode").off("keyup");
			$("#termCode").off("cut copy paste");
		}
	};
	
	//重置串码录入
	var _termCodeReset = function(){
		$("#termCode").val("");
		$("#termCode").removeAttr("disabled");
		lastKeyUpTimeStamp = null;
		lastKeyDownTimeStamp = null;
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
		// “是否使用精品渠道终端销售系统”，取值及说明：10： 否、20 ：是。如为使用精品渠道销售系统的门店（包括该渠道的店中商），则限制不允许办理
		if (ec.util.isObj(OrderInfo.staff.isUseGTS) && "20" == OrderInfo.staff.isUseGTS) {
			$.alert("提示", "请到精品渠道终端销售系统进行串码的领用和回退");
			return;
		}
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
				}else if (response.code == 1202) {
					$.alert("提示",response.data);
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
		queryStore : _queryStore,
		queryStoreReset : _queryStoreReset,
		termCodeReset : _termCodeReset,
		btnAddTerminal:_btnAddTerminal,
		btnDelTerminal:_btnDelTerminal,
		btnTerminalUse:_btnTerminalUse,
		checkAll : _checkAll,
		changeStore : _changeStore
	};
})();

//初始化
$(function(){
	mktRes.terminal.receive.changeStore();
});