package org.andy.shop.entity;

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
@Setter
@Getter
@ToString
public class Function implements Serializable {

    private static final long serialVersionUID = -8751684139493549801L;
    // 功能id 主键 自增长
    private long func_id;
    // 功能名称
    private String func_name;
    // 功能类型 1子系统 2菜单项 3功能点
    private int func_type;
    // 父菜单id
    private long parent_id;
    // 菜单url
    private String func_url;
    // 菜单logo
    private String logo_name;
    // 菜单排序
    private int func_order_num;
    // 创建时间
    private String create_time;
    // 更新时间
    private String update_time;

    // 关联功能id
    private long relate_func_id;

    // 是否作为菜单显示 1是 0否
    private int func_view;

    /**
     * 子菜单
     */
    private List<Function> subFunc;
}
