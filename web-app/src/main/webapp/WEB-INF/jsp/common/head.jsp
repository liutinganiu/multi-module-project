<%--
  Created by IntelliJ IDEA.
  User: user
  Date: 2017/12/10
  Time: 9:52
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ include file="tagLibs.jsp" %>
<%@ include file="import.jsp"%>
<!DOCTYPE html>
<html>
<head>
    <title>模板系统</title>
    <link rel="stylesheet" href="${ctx}/js/css/layui.css">
    <link rel="stylesheet" href="${ctx}/js/css/modules/layer/default/layer.css">
    <script src="${ctx}/js/layui.js"></script>
</head>
<body class="layui-layout-body">

<div class="layui-layout layui-layout-admin">

<div class="layui-header">
    <div class="layui-logo">layui 后台布局</div>
    <!-- 头部区域（可配合layui已有的水平导航） -->
    <ul class="layui-nav layui-layout-left">
        <li class="layui-nav-item"><a href="">控制台</a></li>
        <li class="layui-nav-item"><a href="">商品管理</a></li>
        <li class="layui-nav-item"><a href="">用户</a></li>
        <li class="layui-nav-item">
            <a href="javascript:;">其它系统</a>
            <dl class="layui-nav-child">
                <dd><a href="">邮件管理</a></dd>
                <dd><a href="">消息管理</a></dd>
                <dd><a href="">授权管理</a></dd>
            </dl>
        </li>
    </ul>
    <ul class="layui-nav layui-layout-right">
        <li class="layui-nav-item">
            <a href="javascript:;">
                <img src="http://t.cn/RCzsdCq" class="layui-nav-img">
                贤心
            </a>
            <dl class="layui-nav-child">
                <dd><a href="">基本资料</a></dd>
                <dd><a href="">安全设置</a></dd>
            </dl>
        </li>
        <li class="layui-nav-item"><a href="${ctx}/user/loginOut.do">退了</a></li>
    </ul>
</div>


</div>

</body>
</html>
