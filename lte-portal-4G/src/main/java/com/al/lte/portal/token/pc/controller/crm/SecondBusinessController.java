package com.al.lte.portal.token.pc.controller.crm;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ec.toolkit.JacksonUtil;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.util.DateUtil;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.SecondBusiness;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletResponse;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * **控制层
 *
 * @author wufeng
 * @version V1.0 2016-01-25
 * @createDate 2016-01-25 16:10:36
 * @modifyDate
 * @copyRight 亚信联创EC研发部
 */
@Controller("com.al.lte.portal.token.pc.controller.crm.SecondBusinessController")
@RequestMapping("/token/pc/secondBusi/*")
public class SecondBusinessController extends BaseController {

    @Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.SecondBusiness")
    private SecondBusiness secondBusiness;
    @Autowired
	@Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
	private StaffBmo staffBmo;

    /**
     * 查询二次业务菜单对应的鉴权权限
     *
     * @author wufeng
     */
    @RequestMapping(value = "/querySecondBusinessMenuAuth", method = {RequestMethod.POST})
    public String querySecondBusinessMenuAuth(@RequestBody Map<String, Object> paramMap, Model model, HttpServletResponse response, @LogOperatorAnn String flowNum) throws BusinessException {
        try {
            //入参的封装
            SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
            String menuId = MapUtils.getString(paramMap, "menuId", "");
            String menuName = MapUtils.getString(paramMap, "menuName", "");
            String isSimple = MapUtils.getString(paramMap, "isSimple", "");
            String areaId = sessionStaff.getAreaId();
            Map<String, Object> inParamMap = new HashMap<String, Object>();
            if (StringUtils.isNotBlank(menuId)) {
                inParamMap.put("menuId", menuId);
            }
            if (StringUtils.isNotBlank(menuId)) {
                inParamMap.put("menuName", menuName);
            }
            if (StringUtils.isNotBlank(menuId)) {
                inParamMap.put("isSimple", isSimple);
            }
            if (StringUtils.isNotBlank(menuId)) {
                inParamMap.put("areaId", areaId);
            }
            //判断工号是否有跳过权限
            String  iseditOperation=staffBmo.checkOperatSpec(SysConstant.JUMPAUTH_CODE,sessionStaff);
            //服务调用获取数据
            Map<String, Object> resMap = secondBusiness.querySecondBusinessMenuAuth(inParamMap, flowNum, sessionStaff);
            if (ResultCode.R_SUCC.equals(resMap.get("resultCode"))) {
                Map<String, Object> resultMap = MapUtils.getMap(resMap, "result");
                Map<String, Object> rules = new HashMap<String, Object>();
                if (resultMap != null) {
                    List<Map<String, Object>> scenes = (List<Map<String, Object>>) MapUtils.getObject(resultMap, "scenes");
                    if (scenes != null && scenes.size() > 0) {
                    	//1.证件鉴权 2.短信鉴权3.产品密码鉴权4.直接跳过
                       rules = authCompute(scenes);
                       rules.put("iseditOperation", iseditOperation);
                       String typeCd = MapUtils.getString(paramMap, "typeCd", "");
                       String rulesJson=JacksonUtil.objectToJson(rules);
                       model.addAttribute("rulesJson", rulesJson);
                    }
                }
                model.addAttribute("rules", rules);
            }
            return "/pctoken/cust/cust-auth";
        } catch (BusinessException e) {
            return super.failedStr(model, e);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, paramMap, ErrorCode.ORDER_SUBMIT);
        } catch (Exception e) {
            return super.failedStr(model, ErrorCode.QUERY_BIZ_SECONDBUSINESS_MENU_AUTH, e, paramMap);
        }
    }
     public Map<String, Object> getMap(int num){
    	 Map<String, Object> m=new HashMap<String, Object>();
    	 m.put("authTypeStr","1");
    	 if(num==1){
               m.put("rule1","Y");
               m.put("rule2","N");
               m.put("rule3","N");
               m.put("rule4","N");
               m.put("rule5","N");
               m.put("rule6","N");
    	 }
    	 else if(num==2){
    		 m.put("rule1","N");
             m.put("rule2","Y");
             m.put("rule3","N");
             m.put("rule4","N");
             m.put("rule5","N");
             m.put("rule6","N");
    	 }
    	 else if(num==3){
    		 m.put("rule1","N");
             m.put("rule2","N");
             m.put("rule3","Y");
             m.put("rule4","N");
             m.put("rule5","N");
             m.put("rule6","N");
    	 }
    	 else if(num==4){
    		 m.put("rule1","N");
             m.put("rule2","N");
             m.put("rule3","N");
             m.put("rule4","Y");
             m.put("rule5","N");
             m.put("rule6","N");
    	 }
    	 return m;
     }
    /**
     * 保存鉴权日志调用记录到后台并由后台返回一个日志记录id
     *
     * @return
     */
    @RequestMapping(value = "/saveAuthRecord", method = {RequestMethod.POST})
    @ResponseBody
    public JsonResponse saveAuthRecord(@RequestBody Map<String, Object> paramMap, Model model, HttpServletResponse response, @LogOperatorAnn String flowNum) throws BusinessException {

        JsonResponse jsonResponse = new JsonResponse();
        try {
            //入参的封装
            SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
            paramMap.put("validateType", MapUtils.getString(paramMap, "validateType", ""));
            paramMap.put("validateLevel", MapUtils.getString(paramMap, "validateLevel", ""));
            paramMap.put("custId", MapUtils.getString(paramMap, "custId", ""));
            paramMap.put("accessNbr", MapUtils.getString(paramMap, "accessNbr", ""));
            paramMap.put("certType", MapUtils.getString(paramMap, "certType", ""));
            paramMap.put("certNumber", MapUtils.getString(paramMap, "certNumber", ""));
            paramMap.put("handleDate", DateUtil.getNow(DateUtil.DATE_FORMATE_STRING_A2));
            paramMap.put("resultCode", MapUtils.getString(paramMap, "resultCode", ""));
            paramMap.put("staffId", sessionStaff.getStaffId());
            paramMap.put("channelId", sessionStaff.getCurrentChannelId());
            paramMap.put("areaId", sessionStaff.getCurrentAreaId());

            //服务调用获取数据
            Map<String, Object> resMap = secondBusiness.saveAuthRecord(paramMap, flowNum, sessionStaff);
            if (ResultCode.R_SUCC.equals(resMap.get("resultCode"))) {
                jsonResponse = super.successed(resMap, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(resMap.get("resultMsg"), ResultConstant.SERVICE_RESULT_FAILTURE
                        .getCode());
            }

        } catch (BusinessException e) {
            return super.failed(e);
        } catch (InterfaceException ie) {
            return super.failed(ie, paramMap, ErrorCode.ORDER_SUBMIT);
        } catch (Exception e) {
            return super.failed(ErrorCode.QUERY_BIZ_SECONDBUSINESS_MENU_AUTH, e, paramMap);
        }


        return jsonResponse;
    }

    /**
     * 权限合并计算，返回计算后的鉴权方式
     *
     * @param scenes 二次菜单下包含的所有的功能点所对应的鉴权方式
     * @return 计算后的鉴权方式，取交集。
     */
    private Map<String, Object> authCompute(List<Map<String, Object>> scenes) {
        String authTypeStr = "";
        if (scenes == null || scenes.size() == 0) {
            return null;
        } else if (scenes.size() == 1) {
            Map<String, Object> rulesMap = MapUtils.getMap(scenes.get(0), "rules");
            if (SysConstant.STR_Y.equals(MapUtils.getString(rulesMap,"rule1",""))) {
                authTypeStr += "1";
            }
            if (SysConstant.STR_Y.equals(MapUtils.getString(rulesMap,"rule2",""))) {
                authTypeStr += "2";
            }
            if (SysConstant.STR_Y.equals(MapUtils.getString(rulesMap,"rule3",""))) {
                authTypeStr += "3";
            }
            if (SysConstant.STR_Y.equals(MapUtils.getString(rulesMap,"rule4",""))) {
                authTypeStr += "4";
            }
            if (SysConstant.STR_Y.equals(MapUtils.getString(rulesMap,"rule5",""))) {
                authTypeStr += "5";
            }
            if (SysConstant.STR_Y.equals(MapUtils.getString(rulesMap,"rule6",""))) {
                authTypeStr += "6";
            }
            rulesMap.put("authTypeStr", authTypeStr);

            return rulesMap;
        } else {
            //初始化权限和返回值
            Map<String, Object> resultMap = new HashMap<String, Object>();
            String rule1 = MapUtils.getString(MapUtils.getMap(scenes.get(0), "rules"), "rule1", SysConstant.STR_N);
            String rule2 = MapUtils.getString(MapUtils.getMap(scenes.get(0), "rules"), "rule2", SysConstant.STR_N);
            String rule3 = MapUtils.getString(MapUtils.getMap(scenes.get(0), "rules"), "rule3", SysConstant.STR_N);
            String rule4 = MapUtils.getString(MapUtils.getMap(scenes.get(0), "rules"), "rule4", SysConstant.STR_N);
            String rule5 = MapUtils.getString(MapUtils.getMap(scenes.get(0), "rules"), "rule5", SysConstant.STR_N);
            String rule6 = MapUtils.getString(MapUtils.getMap(scenes.get(0), "rules"), "rule6", SysConstant.STR_N);

            for (Map<String, Object> scene : scenes) {
                Map<String, Object> rules = MapUtils.getMap(scene, "rules");
                rule1 = and4String(rule1, MapUtils.getString(rules, "rule1", SysConstant.STR_N));//规则1：是/否（Y/N）证件鉴权
                rule2 = and4String(rule2, MapUtils.getString(rules, "rule2", SysConstant.STR_N));//规则2：是/否（Y/N）短信鉴权
                rule3 = and4String(rule3, MapUtils.getString(rules, "rule3", SysConstant.STR_N));//规则3：是/否（Y/N）产品密码鉴权
                rule4 = and4String(rule4, MapUtils.getString(rules, "rule4", SysConstant.STR_N));//规则4：是/否（Y/N）无须出示有效证件，不需核验用户身份即可办理
                rule5 = and4String(rule5, MapUtils.getString(rules, "rule5", SysConstant.STR_N));//规则5：预留字段
                rule6 = and4String(rule6, MapUtils.getString(rules, "rule6", SysConstant.STR_N));//规则6：预留字段
            }

            if(SysConstant.STR_Y.equals(rule1)){
                authTypeStr+="1";
            }
            if(SysConstant.STR_Y.equals(rule2)){
                authTypeStr+="2";
            }
            if(SysConstant.STR_Y.equals(rule3)){
                authTypeStr+="3";
            }
            if(SysConstant.STR_Y.equals(rule4)){
                authTypeStr+="4";
            }
            if(SysConstant.STR_Y.equals(rule5)){
                authTypeStr+="5";
            }
            if(SysConstant.STR_Y.equals(rule6)){
                authTypeStr+="6";
            }
            resultMap.put("rule1", rule1);
            resultMap.put("rule2", rule2);
            resultMap.put("rule3", rule3);
            resultMap.put("rule4", rule4);
            resultMap.put("rule5", rule5);
            resultMap.put("rule6", rule6);
            resultMap.put("authTypeStr", authTypeStr);

            return resultMap;
        }

    }

    /**
     * 计算字符串形式表示的布尔值返回Y/N
     *
     * @param a 将要进行计算的字符串布尔值，取值为Y/N
     * @param b 另一个同类型参数
     * @return 返回字符串Y/N
     */
    private String and4String(String a, String b) {
        Boolean x = BooleanUtils.toBoolean(a);
        Boolean y = BooleanUtils.toBoolean(b);
        if (x && y) {
            return SysConstant.STR_Y;
        } else {
            return SysConstant.STR_N;
        }
    }
}
