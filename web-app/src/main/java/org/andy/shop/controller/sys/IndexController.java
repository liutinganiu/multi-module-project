package org.andy.shop.controller.sys;

import lombok.extern.slf4j.Slf4j;
import org.andy.shop.User;
import org.andy.shop.entity.Function;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;

/**
 * <p>
 * 1.
 * </p>
 * user: liu ting  Date: 2017/12/10. ProjectName: multi-module-project Version:1.0
 */
@Slf4j
@Controller
@RequestMapping("/sys/")
public class IndexController {

    @RequestMapping("frame")
    public ModelAndView suggestManager(HttpServletRequest req) {
        ModelAndView result = new ModelAndView();
        System.out.println("indexFrame");
        User u = getUser();
        req.getSession().setAttribute("user", u);
        result.addObject("showList", u.getShowList());
        log.info("当前用户信息：{}", u);
        return result;
    }

    /**
     * 模拟组装user对象
     * @return
     */
    public User getUser(){

        User user = new User();
        user.setUser_id(1);
        user.setReal_name("liuting");
        user.setEmail("123@qq.com");

        Function function1 = new Function();
        function1.setFunc_type(1);
        function1.setFunc_name("大菜单一");
        function1.setFunc_id(1);
        function1.setParent_id(0);


        List<Function> subList1 = new ArrayList<Function>();
        Function function1_1 = new Function();
        function1_1.setFunc_type(2);
        function1_1.setFunc_name("菜单一");
        function1_1.setFunc_id(11);
        function1_1.setParent_id(1);
        function1_1.setFunc_url("https://www.baidu.com");
        subList1.add(function1_1);

        Function function1_2 = new Function();
        function1_2.setFunc_type(2);
        function1_2.setFunc_name("菜单二");
        function1_2.setFunc_id(12);
        function1_2.setParent_id(1);
        subList1.add(function1_2);
        function1.setSubFunc(subList1);

        Function function2 = new Function();
        function2.setFunc_type(1);
        function2.setFunc_name("大菜单二");
        function2.setFunc_id(2);
        function2.setParent_id(0);

        List<Function> subList2 = new ArrayList<Function>();
        Function function2_1 = new Function();
        function2_1.setFunc_type(2);
        function2_1.setFunc_name("菜单一1");
        function2_1.setFunc_id(11);
        function2_1.setParent_id(2);
        subList2.add(function2_1);

        Function function2_2 = new Function();
        function2_2.setFunc_type(2);
        function2_2.setFunc_name("菜单二2");
        function2_2.setFunc_id(12);
        function2_2.setParent_id(2);
        subList2.add(function2_2);
        function2.setSubFunc(subList2);


        Function function3 = new Function();
        function3.setFunc_type(1);
        function3.setFunc_name("大菜单三");
        function3.setFunc_id(3);
        function2.setParent_id(0);

        List<Function> funcList = new ArrayList();

        funcList.add(function1);
        funcList.add(function2);
        funcList.add(function3);

        user.setShowList(funcList);

        return user;
    }
}
