package org.andy.shop.controller;

import lombok.extern.slf4j.Slf4j;
import org.andy.shop.entity.test.JSONObj;
import org.andy.shop.entity.test.TestUser;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * <p>
 * 1.
 * </p>
 * user: liu ting  Date: 2017/12/9. ProjectName: multi-module-project Version:1.0
 */
@Slf4j
@Controller
@RequestMapping("/test/")
public class FirstController {


    @ResponseBody
    @RequestMapping("searchAccArea")
    public String searchAccArea() {


            log.info("这是测试内容");
            return "testcontent";

    }


    @RequestMapping("sendMailManager")
    public ModelAndView suggestManager(HttpServletRequest req) {
        ModelAndView result = new ModelAndView();
        System.out.println("sendMailManager");
        result.addObject("name","liubei");
        return result;
    }


    @ResponseBody
    @RequestMapping("getTestData")
    public JSONObj getTestData(HttpServletRequest request){

        String curr = request.getParameter("tPage");

        String limit = request.getParameter("limit");

        log.info("当前页数4：{}", curr);
        log.info("每页显示：{}", limit);

        log.info("获取测试分页日志信息");
        return getData();
    }

    /**
     * 模拟获取数据
     * @return
     */
    public JSONObj getData(){

        JSONObj json = new JSONObj();
        json.setCode(0);
        json.setMsg("");
        json.setCount(60);
        //json.setCurr("3");

        List<TestUser> testUserList = new ArrayList<TestUser>();

        TestUser user1 = new TestUser();
        user1.setId(1);
        user1.setUsername("test1");
        user1.setEmail("test1@qq.com");
        testUserList.add(user1);

        TestUser user2 = new TestUser();
        user2.setId(2);
        user2.setUsername("test2");
        user2.setEmail("test2@qq.com");
        testUserList.add(user2);

        TestUser user3 = new TestUser();
        user3.setId(3);
        user3.setUsername("test3");
        user3.setEmail("test3@qq.com");
        testUserList.add(user3);

        TestUser user4 = new TestUser();
        user4.setId(4);
        user4.setUsername("test4");
        user4.setEmail("test4@qq.com");
        testUserList.add(user4);


        TestUser user5 = new TestUser();
        user5.setId(5);
        user5.setUsername("test5");
        user5.setEmail("test5@qq.com");
        testUserList.add(user5);

        TestUser user6 = new TestUser();
        user6.setId(6);
        user6.setUsername("test6");
        user6.setEmail("test6@qq.com");
        testUserList.add(user6);

        TestUser user7 = new TestUser();
        user7.setId(7);
        user7.setUsername("test7");
        user7.setEmail("test7@qq.com");
        testUserList.add(user7);

        TestUser user8 = new TestUser();
        user8.setId(8);
        user8.setUsername("test8");
        user1.setEmail("test8@qq.com");
        testUserList.add(user8);

        TestUser user9 = new TestUser();
        user9.setId(9);
        user9.setUsername("test9");
        user9.setEmail("test9@qq.com");
        testUserList.add(user9);

        TestUser user10 = new TestUser();
        user10.setId(10);
        user10.setUsername("test10");
        user10.setEmail("test10@qq.com");
        testUserList.add(user10);

        /*TestUser user11 = new TestUser();
        user11.setId(11);
        user11.setUsername("test11");
        user11.setEmail("test11@qq.com");
        testUserList.add(user11);*/

        json.setData(testUserList);

        return json;
    }
}
