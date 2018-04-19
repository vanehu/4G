package com.ailk.ecsp.sm.controller;

import java.io.File;
import java.util.Date;

import com.al.ecs.common.util.DateUtil;
import com.al.ecs.spring.controller.BaseController;
import net.sf.json.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * 版本控制器
 * <P>
 * @author liuteng
 * @version V1.0 2015/8/10
 * @createDate 2015年8月10日21:59:48
 * @modifyDate liuteng 2015/8/10 <BR>
 * @copyRight 亚信联创EC研发部
 */

@Controller("com.ailk.ecsp.sm.controller.VersionController")
@RequestMapping("/version/*")
public class VersionController extends BaseController {

    @RequestMapping(value = "/getVersion", method = RequestMethod.GET)
    @ResponseBody
    public String getVersion() {
        JSONObject json;
        try {
            String baseDir = this.getClass().getResource("").getPath();
            String className = "VersionController.class";
            String totalName = baseDir + className;
            File file = new File(totalName);
            json = new JSONObject();
            json.put("resultCode", "0");
            json.put("resultMsg", DateUtil.formatDate(new Date(file.lastModified()), DateUtil.DATE_FORMATE_STRING_B));
        } catch (Exception e) {
            json = new JSONObject();
            json.put("resultCode", "-1");
            json.put("resultMsg", e.getMessage());
        }
        return json.toString();
    }
}
