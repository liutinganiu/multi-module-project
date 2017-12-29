package org.andy.shop.entity.test;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.io.Serializable;
import java.util.List;

/**
 * <p>
 * 1.
 * </p>
 * user: liu ting  Date: 2017/12/10. ProjectName: multi-module-project Version:1.0
 */
@Getter
@Setter
@ToString
public class JSONObj<T> implements Serializable {

    private Integer code;

    private String msg;

    private Integer count;

    private List<T> data;

}
