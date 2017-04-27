package com.al.lte.portal.controller.system;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ThemeResolver;
import org.springframework.web.util.WebUtils;
import com.al.ecs.spring.annotation.session.SessionValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.common.PortalUtils;

/**
 * 换皮肤或换页面，从平板到ＰＣ传统版本 .
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-8-15
 * @createDate 2012-8-15 上午10:42:41
 * @modifyDate tang zheng yu 2012-8-15 <BR>
 * @copyRight 亚信联创EC研发部
 */
@Controller("com.al.lte.portal.controller.system.ThemeChangeController")
@RequestMapping("/portal/theme/*")
public class ThemeChangeController extends BaseController {
    @Autowired
    @Qualifier("themeResolver")
    private ThemeResolver themeResolver;

    @RequestMapping(value = "/change", method = RequestMethod.GET)
    @SessionValid(false)
    public String changeTheme(HttpServletRequest request, HttpServletResponse response, String themeName) {
        if (PortalUtils.THEME_LIST.contains(themeName)) {
            themeResolver.setThemeName(request, response, themeName);
            WebUtils.setSessionAttribute(request, PortalUtils.THEME_SESSION_ATTRIBUTE_NAME, themeName);
        }
        return super.redirect("/main/home");
    }
}
