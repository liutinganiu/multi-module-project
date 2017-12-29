package org.andy.shop.entity.test;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.io.Serializable;

/**
 * <p>
 * 1.
 * </p>
 * user: liu ting  Date: 2017/12/10. ProjectName: multi-module-project Version:1.0
 */
@Getter
@Setter
@ToString
public class TestUser implements Serializable {

    private Integer id;

    private String username;

    private String email;

    private int sex;

    private String city;

    private String sign;

    private Integer experience;

    private String ip;

    private Integer logins;

    private String joinTime;

    private String right;
}
