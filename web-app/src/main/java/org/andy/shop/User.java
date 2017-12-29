package org.andy.shop;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.andy.shop.entity.Function;

import java.io.Serializable;
import java.util.List;

/**
 * <p>
 * 1.
 * </p>
 * user: liu ting  Date: 2017/12/10. ProjectName: multi-module-project Version:1.0
 */
@Setter
@Getter
@ToString
public class User implements Serializable {

    private long user_id;
    private int role_id;
    private String role_name;
    private String real_name;
    private String login_name;
    private String login_pwd;
    private long dept_id;
    private int user_status;
    private String create_time;
    private String update_time;
    private String dept_name;
    private String temp_name;
    private int first_updatepwd_flag;
    private int dynamic_type;            //动态验证类型
    private String weixin_fakeid;        //公共帐号关注用户id
    private String mobile;
    private int login_error_times;    //连续登陆失败次数
    private String themes;
    private String login_unlock_time;    //账户冻结解锁时间
    private String job_num;
    private String email;
    private String lastLoginTime;
    private String lastLoginIp;

    private List<Function> showList;
}
