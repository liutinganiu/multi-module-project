package org.andy.shop.controller.sys;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;

/**
 * <p>
 * 1.
 * </p>
 * user: liu ting  Date: 2017/12/10. ProjectName: multi-module-project Version:1.0
 */
@Slf4j
@Controller
@RequestMapping("/user/")
public class LoginController {

    @RequestMapping("login")
    public ModelAndView login(HttpServletRequest req) {
        ModelAndView result = new ModelAndView("redirect:/sys/frame");
        System.out.println("frame");
        log.info("这是登录日志");
        return result;
    }

    @RequestMapping("loginOut")
    public ModelAndView loginOut(HttpServletRequest req) {
        //去除session
        ModelAndView result = new ModelAndView("redirect:/");
        System.out.println("loginOut");
        log.info("这是退出日志");
        return result;
    }

}
